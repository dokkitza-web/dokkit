create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  why text not null,
  display_order integer not null default 0,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_tiers (
  id uuid primary key default gen_random_uuid(),
  tier_key text not null unique check (tier_key in ('starter', 'professional', 'complete')),
  name text not null,
  summary text not null,
  price_cents integer not null check (price_cents >= 0),
  document_count integer not null default 0,
  workbook_count integer not null default 0,
  pdf_count integer not null default 0,
  display_order integer not null default 0,
  is_live boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid references public.industries(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text not null,
  product_type text not null check (product_type in ('industry_package', 'single_document')),
  package_tier text check (package_tier in ('starter', 'professional', 'complete')),
  price_cents integer not null check (price_cents >= 0),
  document_count integer not null default 0,
  workbook_count integer not null default 0,
  pdf_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  file_kind text not null check (file_kind in ('zip', 'docx', 'xlsx', 'pdf', 'preview')),
  version_label text not null default 'v1',
  storage_bucket text not null default 'product-files',
  storage_path text not null,
  checksum text,
  is_active boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  phone text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  email text not null,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'failed', 'cancelled', 'refunded')),
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'ZAR',
  payfast_m_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_snapshot jsonb not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'payfast',
  provider_payment_id text,
  status text not null default 'initiated' check (status in ('initiated', 'verified', 'invalid', 'failed', 'refunded')),
  amount_cents integer not null check (amount_cents >= 0),
  raw_payload jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payfast_itn_logs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  payload jsonb not null,
  signature_valid boolean,
  amount_valid boolean,
  status_text text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete cascade,
  product_file_id uuid references public.product_files(id) on delete set null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  max_uses integer not null default 5,
  used_count integer not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  download_link_id uuid not null references public.download_links(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  provider text not null default 'resend',
  provider_message_id text,
  template_key text not null,
  recipient text not null,
  subject text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  redemption_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_industry_id_idx on public.products(industry_id);
create index if not exists products_live_type_idx on public.products(is_live, product_type);
create index if not exists product_files_product_id_idx on public.product_files(product_id);
create index if not exists orders_email_idx on public.orders(email);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists download_links_order_id_idx on public.download_links(order_id);
create index if not exists email_logs_order_id_idx on public.email_logs(order_id);

alter table public.admin_users enable row level security;
alter table public.industries enable row level security;
alter table public.package_tiers enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payfast_itn_logs enable row level security;
alter table public.download_links enable row level security;
alter table public.download_events enable row level security;
alter table public.email_logs enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Public can read live industries" on public.industries;
drop policy if exists "Public can read live package tiers" on public.package_tiers;
drop policy if exists "Public can read live products" on public.products;
drop policy if exists "Admins manage admin users" on public.admin_users;
drop policy if exists "Admins manage industries" on public.industries;
drop policy if exists "Admins manage package tiers" on public.package_tiers;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins manage product files" on public.product_files;
drop policy if exists "Admins manage customers" on public.customers;
drop policy if exists "Admins manage orders" on public.orders;
drop policy if exists "Admins manage order items" on public.order_items;
drop policy if exists "Admins manage payments" on public.payments;
drop policy if exists "Admins manage PayFast ITN logs" on public.payfast_itn_logs;
drop policy if exists "Admins manage download links" on public.download_links;
drop policy if exists "Admins manage download events" on public.download_events;
drop policy if exists "Admins manage email logs" on public.email_logs;
drop policy if exists "Admins manage coupons" on public.coupons;
drop policy if exists "Admins manage settings" on public.settings;
drop policy if exists "Admins read audit logs" on public.audit_logs;

create policy "Public can read live industries"
  on public.industries for select
  using (is_live = true or public.is_admin());

create policy "Public can read live package tiers"
  on public.package_tiers for select
  using (is_live = true or public.is_admin());

create policy "Public can read live products"
  on public.products for select
  using (is_live = true or public.is_admin());

create policy "Admins manage admin users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage industries"
  on public.industries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage package tiers"
  on public.package_tiers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage product files"
  on public.product_files for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage customers"
  on public.customers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage orders"
  on public.orders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage order items"
  on public.order_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage payments"
  on public.payments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage PayFast ITN logs"
  on public.payfast_itn_logs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage download links"
  on public.download_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage download events"
  on public.download_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage email logs"
  on public.email_logs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage coupons"
  on public.coupons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage settings"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-assets', 'public-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('product-files', 'product-files', false, 104857600, array['application/zip', 'application/x-zip-compressed', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('admin-uploads', 'admin-uploads', false, 104857600, null),
  ('generated-zips', 'generated-zips', false, 104857600, array['application/zip'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view public assets" on storage.objects;
drop policy if exists "Admins manage storage objects" on storage.objects;

create policy "Public can view public assets"
  on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "Admins manage storage objects"
  on storage.objects for all
  to authenticated
  using (bucket_id in ('public-assets', 'product-files', 'admin-uploads', 'generated-zips') and public.is_admin())
  with check (bucket_id in ('public-assets', 'product-files', 'admin-uploads', 'generated-zips') and public.is_admin());
