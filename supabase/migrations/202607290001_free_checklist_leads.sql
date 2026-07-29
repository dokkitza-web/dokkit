create table if not exists public.free_checklist_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  business_name text not null check (char_length(business_name) between 2 and 140),
  email text not null check (char_length(email) between 3 and 254),
  province text not null check (char_length(province) between 2 and 50),
  industry text not null check (char_length(industry) between 2 and 120),
  selected_format text not null check (selected_format in ('pdf', 'docx')),
  marketing_consent boolean not null default false,
  privacy_accepted_at timestamptz not null,
  policy_bundle_version text not null,
  source_path text not null default '/free-business-admin-checklist',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  pdf_downloaded_at timestamptz,
  docx_downloaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists free_checklist_leads_email_idx
  on public.free_checklist_leads (email);

create index if not exists free_checklist_leads_created_at_idx
  on public.free_checklist_leads (created_at desc);

create index if not exists free_checklist_leads_marketing_idx
  on public.free_checklist_leads (created_at desc)
  where marketing_consent = true;

alter table public.free_checklist_leads enable row level security;

drop policy if exists "Admins read free checklist leads"
  on public.free_checklist_leads;

create policy "Admins read free checklist leads"
  on public.free_checklist_leads
  for select
  to authenticated
  using (public.is_admin());
