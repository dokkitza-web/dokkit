-- Fresh DokKit catalogue rebuild for the ready business template packs.
-- Run this after supabase/migrations/202606140001_initial_schema.sql.

begin;

insert into public.package_tiers (
  tier_key,
  name,
  summary,
  price_cents,
  document_count,
  workbook_count,
  pdf_count,
  display_order,
  is_live
)
values
  ('starter', 'Starter', 'A practical admin launch pack for new or informal operators who need the basics fast.', 24900, 11, 1, 0, 1, true),
  ('professional', 'Professional', 'A stronger operating pack for businesses that quote often, onboard customers, and track recurring work.', 59900, 20, 1, 0, 2, true),
  ('complete', 'Complete', 'A full document library for owners who want a complete admin system from first enquiry to delivery.', 119900, 34, 1, 0, 3, true)
on conflict (tier_key) do update set
  name = excluded.name,
  summary = excluded.summary,
  price_cents = excluded.price_cents,
  document_count = excluded.document_count,
  workbook_count = excluded.workbook_count,
  pdf_count = excluded.pdf_count,
  display_order = excluded.display_order,
  is_live = excluded.is_live,
  updated_at = now();

update public.industries
set is_live = false,
    updated_at = now();

update public.products
set is_live = false,
    updated_at = now();

insert into public.industries (slug, name, summary, why, display_order, is_live)
values
  (
    'beauty-salons-and-spas',
    'Beauty Salons and Spas',
    'Beauty businesses need appointment, consent, treatment, price list, and client record templates.',
    'Salons have frequent customer interactions and benefit from polished client forms and simple revenue tracking.',
    1,
    true
  ),
  (
    'catering-and-baking',
    'Catering and Baking',
    'Food businesses need order forms, event quotes, ingredient costing, delivery notes, and stock trackers.',
    'Custom food orders create admin pressure around deposits, quantities, dietary details, and delivery timing.',
    2,
    true
  ),
  (
    'cleaning-services',
    'Cleaning Services',
    'Residential, office, move-in, move-out, and contract cleaning businesses need repeatable quotes and checklists.',
    'Cleaning is easy to start, has strong local demand, and customers expect clear scope, pricing, and sign-off documents.',
    3,
    true
  ),
  (
    'construction-subcontractors',
    'Construction Subcontractors',
    'Small trade teams need quote, job card, safety, variation, and sign-off documents for site work.',
    'Subcontractors handle higher-value work where paperwork reduces disputes and improves payment follow-up.',
    4,
    true
  ),
  (
    'freelancers-consultants',
    'Freelancers and Consultants',
    'Independent professionals need proposals, retainers, onboarding forms, invoices, and client trackers.',
    'This segment buys digital templates readily and values documents that make a solo business look established.',
    5,
    true
  ),
  (
    'landscaping-garden-services',
    'Landscaping and Garden Services',
    'Garden service businesses need maintenance schedules, quotes, site checks, and recurring service records.',
    'Recurring outdoor services are common and simple templates help businesses win and retain contracts.',
    6,
    true
  ),
  (
    'safety-security',
    'Safety and Security',
    'Safety and security service providers need site assessments, service records, incident reports, and client sign-offs.',
    'Security and safety services depend on clear records, shift notes, incident details, and proof of service delivery.',
    7,
    true
  ),
  (
    'transport-delivery-services',
    'Transport and Delivery Services',
    'Delivery operators need trip sheets, delivery notes, vehicle logs, client trackers, and invoice records.',
    'Transport businesses depend on proof of delivery, route records, and vehicle admin.',
    8,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  why = excluded.why,
  display_order = excluded.display_order,
  is_live = excluded.is_live,
  updated_at = now();

with pack_details as (
  select *
  from (
    values
      ('beauty-salons-and-spas', 'salons, spas, beauty therapists, nail technicians, lash artists, and wellness service providers', 11, 20, 34),
      ('catering-and-baking', 'caterers, bakers, cake makers, meal prep businesses, and event food service providers', 7, 10, 15),
      ('cleaning-services', 'residential cleaners, office cleaners, move-in and move-out cleaners, and contract cleaning teams', 7, 10, 18),
      ('construction-subcontractors', 'small trade teams, subcontractors, site service providers, and construction support businesses', 7, 10, 22),
      ('freelancers-consultants', 'freelancers, consultants, independent professionals, coaches, and specialist service providers', 7, 10, 20),
      ('landscaping-garden-services', 'garden services, landscapers, lawn care providers, irrigation teams, and outdoor maintenance businesses', 7, 10, 22),
      ('safety-security', 'security service providers, safety consultants, patrol teams, guarding businesses, and risk support providers', 7, 10, 22),
      ('transport-delivery-services', 'couriers, delivery businesses, transport operators, shuttle services, and small logistics providers', 7, 10, 22)
  ) as rows (
    industry_slug,
    audience,
    starter_document_count,
    professional_document_count,
    complete_document_count
  )
),
product_rows as (
  select
    i.id as industry_id,
    i.slug || '-' || t.tier_key as slug,
    i.name || ' ' || t.name || ' Package' as name,
    case t.tier_key
      when 'starter' then 'A focused editable starter pack for ' || d.audience || ' that need core admin, quotation, invoice, client, and work-tracking templates.'
      when 'professional' then 'A stronger editable operating pack for ' || d.audience || ' that need detailed client, job, supplier, staff, and follow-up records.'
      else 'A full editable business document library for ' || d.audience || ', with Word templates and an Excel administration workbook for daily operations.'
    end as description,
    t.tier_key as package_tier,
    t.price_cents,
    case t.tier_key
      when 'starter' then d.starter_document_count
      when 'professional' then d.professional_document_count
      else d.complete_document_count
    end as document_count,
    1 as workbook_count,
    0 as pdf_count,
    d.industry_slug
  from pack_details d
  join public.industries i
    on i.slug = d.industry_slug
  cross join public.package_tiers t
)
insert into public.products (
  industry_id,
  slug,
  name,
  description,
  product_type,
  package_tier,
  price_cents,
  document_count,
  workbook_count,
  pdf_count,
  metadata,
  is_live
)
select
  p.industry_id,
  p.slug,
  p.name,
  p.description,
  'industry_package',
  p.package_tier,
  p.price_cents,
  p.document_count,
  p.workbook_count,
  p.pdf_count,
  jsonb_build_object(
    'industry_slug', p.industry_slug,
    'tier_key', p.package_tier,
    'formats', jsonb_build_array('DOCX', 'XLSX'),
    'launch_rebuild', true
  ),
  true
from product_rows p
on conflict (slug) do update set
  industry_id = excluded.industry_id,
  name = excluded.name,
  description = excluded.description,
  product_type = excluded.product_type,
  package_tier = excluded.package_tier,
  price_cents = excluded.price_cents,
  document_count = excluded.document_count,
  workbook_count = excluded.workbook_count,
  pdf_count = excluded.pdf_count,
  metadata = excluded.metadata,
  is_live = excluded.is_live,
  updated_at = now();

commit;
