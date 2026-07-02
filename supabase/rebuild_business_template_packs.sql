-- Fresh DokKit catalogue rebuild for the first ready business template packs.
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
  ('starter', 'Starter', 'A practical admin launch pack for new or informal operators who need the basics fast.', 24900, 10, 1, 0, 1, false),
  ('professional', 'Professional', 'A stronger operating pack for businesses that quote often, onboard customers, and track recurring work.', 59900, 19, 1, 0, 2, false),
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
  )
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  why = excluded.why,
  display_order = excluded.display_order,
  is_live = excluded.is_live,
  updated_at = now();

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
  i.id,
  'beauty-salons-and-spas-complete',
  'Beauty Salons and Spas Complete Package',
  'A full editable business document library for salons, spas, beauty therapists, nail technicians, lash artists, and wellness service providers.',
  'industry_package',
  'complete',
  119900,
  34,
  1,
  0,
  jsonb_build_object(
    'industry_slug', 'beauty-salons-and-spas',
    'tier_key', 'complete',
    'formats', jsonb_build_array('DOCX', 'XLSX'),
    'launch_rebuild', true
  ),
  true
from public.industries i
where i.slug = 'beauty-salons-and-spas'
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
  i.id,
  'catering-and-baking-complete',
  'Catering and Baking Complete Package',
  'A full editable business document library for caterers, bakers, cake makers, meal prep businesses, and event food service providers.',
  'industry_package',
  'complete',
  119900,
  34,
  1,
  0,
  jsonb_build_object(
    'industry_slug', 'catering-and-baking',
    'tier_key', 'complete',
    'formats', jsonb_build_array('DOCX', 'XLSX'),
    'launch_rebuild', true
  ),
  true
from public.industries i
where i.slug = 'catering-and-baking'
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
