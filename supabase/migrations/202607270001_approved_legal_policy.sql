alter table public.orders
  add column if not exists checkout_attempt_id uuid,
  add column if not exists policy_bundle_version text,
  add column if not exists policy_accepted_at timestamptz,
  add column if not exists access_issued_at timestamptz,
  add column if not exists access_expires_at timestamptz,
  add column if not exists download_limit integer not null default 5,
  add column if not exists successful_downloads integer not null default 0,
  add column if not exists access_reissue_count integer not null default 0,
  add column if not exists access_reissued_at timestamptz,
  add column if not exists refund_status text not null default 'not_requested',
  add column if not exists refund_reason text,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refund_approved_at timestamptz,
  add column if not exists refund_initiated_at timestamptz,
  add column if not exists refund_completed_at timestamptz,
  add column if not exists refund_customer_notified_at timestamptz;

alter table public.orders
  drop constraint if exists orders_download_limit_check,
  add constraint orders_download_limit_check
    check (download_limit = 5),
  drop constraint if exists orders_successful_downloads_check,
  add constraint orders_successful_downloads_check
    check (successful_downloads >= 0 and successful_downloads <= download_limit),
  drop constraint if exists orders_policy_acceptance_check,
  add constraint orders_policy_acceptance_check
    check (
      (policy_bundle_version is null and policy_accepted_at is null)
      or
      (policy_bundle_version is not null and policy_accepted_at is not null)
    ),
  drop constraint if exists orders_access_window_check,
  add constraint orders_access_window_check
    check (
      (access_issued_at is null and access_expires_at is null)
      or
      (
        access_issued_at is not null
        and access_expires_at is not null
        and access_expires_at > access_issued_at
      )
    ),
  drop constraint if exists orders_refund_status_check,
  add constraint orders_refund_status_check
    check (
      refund_status in (
        'not_requested',
        'requested',
        'approved',
        'initiated',
        'completed',
        'declined'
      )
    );

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  consent_key_hash text not null,
  analytics_allowed boolean not null,
  marketing_allowed boolean not null,
  policy_bundle_version text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists consent_records_key_created_idx
  on public.consent_records(consent_key_hash, created_at desc);

alter table public.consent_records enable row level security;

drop policy if exists "Admins read consent records" on public.consent_records;
create policy "Admins read consent records"
  on public.consent_records for select
  to authenticated
  using (public.is_admin());

create index if not exists orders_policy_accepted_at_idx
  on public.orders(policy_accepted_at)
  where policy_accepted_at is not null;

create unique index if not exists orders_checkout_attempt_id_idx
  on public.orders(checkout_attempt_id)
  where checkout_attempt_id is not null;

create index if not exists orders_access_expires_at_idx
  on public.orders(access_expires_at)
  where access_expires_at is not null;

create or replace function public.finalise_verified_payfast_order(
  p_order_id uuid,
  p_payment_id uuid,
  p_provider_payment_id text,
  p_raw_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_transitioned boolean := false;
begin
  update public.payments
  set
    status = 'verified',
    provider_payment_id = coalesce(p_provider_payment_id, provider_payment_id),
    raw_payload = p_raw_payload,
    verified_at = coalesce(verified_at, v_now),
    updated_at = v_now
  where id = p_payment_id
    and order_id = p_order_id
    and provider = 'payfast';

  update public.orders
  set
    status = 'paid',
    paid_at = coalesce(paid_at, v_now),
    access_issued_at = coalesce(access_issued_at, v_now),
    access_expires_at = coalesce(access_expires_at, v_now + interval '7 days'),
    download_limit = 5,
    updated_at = v_now
  where id = p_order_id
    and status in ('pending_payment', 'cancelled', 'failed');

  v_transitioned := found;
  return v_transitioned;
end;
$$;

revoke all on function public.finalise_verified_payfast_order(
  uuid,
  uuid,
  text,
  jsonb
) from public, anon, authenticated;
grant execute on function public.finalise_verified_payfast_order(
  uuid,
  uuid,
  text,
  jsonb
) to service_role;

create or replace function public.claim_authorised_download(
  p_order_id uuid,
  p_download_link_id uuid,
  p_ip_address inet,
  p_user_agent text
)
returns table (
  claimed boolean,
  error_code text,
  successful_downloads integer,
  remaining_downloads integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_link public.download_links%rowtype;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return query select false, 'order_not_found', 0, 0;
    return;
  end if;

  if v_order.status <> 'paid' then
    return query
      select false, 'payment_not_verified', v_order.successful_downloads, 0;
    return;
  end if;

  if v_order.access_expires_at is null or v_order.access_expires_at <= now() then
    return query
      select false, 'access_expired', v_order.successful_downloads, 0;
    return;
  end if;

  if v_order.successful_downloads >= v_order.download_limit then
    return query
      select false, 'download_limit_reached', v_order.successful_downloads, 0;
    return;
  end if;

  select *
  into v_link
  from public.download_links
  where id = p_download_link_id
    and order_id = p_order_id
  for update;

  if not found
    or v_link.revoked_at is not null
    or v_link.expires_at <= now()
    or v_link.used_count >= v_link.max_uses then
    return query
      select
        false,
        'link_unavailable',
        v_order.successful_downloads,
        greatest(v_order.download_limit - v_order.successful_downloads, 0);
    return;
  end if;

  update public.download_links
  set used_count = used_count + 1
  where id = v_link.id;

  update public.orders
  set
    successful_downloads = successful_downloads + 1,
    updated_at = now()
  where id = v_order.id;

  insert into public.download_events (
    download_link_id,
    order_id,
    ip_address,
    user_agent
  )
  values (
    v_link.id,
    v_order.id,
    p_ip_address,
    left(p_user_agent, 1000)
  );

  return query
    select
      true,
      null::text,
      v_order.successful_downloads + 1,
      greatest(v_order.download_limit - v_order.successful_downloads - 1, 0);
end;
$$;

revoke all on function public.claim_authorised_download(
  uuid,
  uuid,
  inet,
  text
) from public, anon, authenticated;
grant execute on function public.claim_authorised_download(
  uuid,
  uuid,
  inet,
  text
) to service_role;

drop policy if exists "Admins create audit logs" on public.audit_logs;
create policy "Admins create audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_admin());

create or replace function public.record_order_refund_status(
  p_order_id uuid,
  p_refund_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'Admin access required.';
  end if;

  if p_refund_status not in (
    'requested',
    'approved',
    'initiated',
    'completed',
    'declined'
  ) then
    raise exception 'Invalid refund status.';
  end if;

  update public.orders
  set
    refund_status = p_refund_status,
    refund_reason = nullif(trim(p_reason), ''),
    refund_requested_at = case
      when p_refund_status = 'requested'
        then coalesce(refund_requested_at, v_now)
      else refund_requested_at
    end,
    refund_approved_at = case
      when p_refund_status = 'approved'
        then coalesce(refund_approved_at, v_now)
      else refund_approved_at
    end,
    refund_initiated_at = case
      when p_refund_status = 'initiated'
        then coalesce(refund_initiated_at, v_now)
      else refund_initiated_at
    end,
    refund_completed_at = case
      when p_refund_status = 'completed'
        then coalesce(refund_completed_at, v_now)
      else refund_completed_at
    end,
    status = case
      when p_refund_status = 'completed' then 'refunded'
      else status
    end,
    access_issued_at = case
      when p_refund_status in ('initiated', 'completed')
        then coalesce(access_issued_at, v_now - interval '1 second')
      else access_issued_at
    end,
    access_expires_at = case
      when p_refund_status in ('initiated', 'completed') then v_now
      else access_expires_at
    end,
    updated_at = v_now
  where id = p_order_id;

  if not found then
    raise exception 'Order not found.';
  end if;

  if p_refund_status in ('initiated', 'completed') then
    update public.download_links
    set revoked_at = coalesce(revoked_at, v_now)
    where order_id = p_order_id;
  end if;

  if p_refund_status = 'completed' then
    update public.payments
    set status = 'refunded', updated_at = v_now
    where order_id = p_order_id
      and provider = 'payfast';
  end if;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'order_refund_status_changed',
    'order',
    p_order_id,
    jsonb_build_object(
      'refund_status',
      p_refund_status,
      'reason',
      nullif(trim(p_reason), '')
    )
  );
end;
$$;

revoke all on function public.record_order_refund_status(
  uuid,
  text,
  text
) from public, anon;
grant execute on function public.record_order_refund_status(
  uuid,
  text,
  text
) to authenticated;
