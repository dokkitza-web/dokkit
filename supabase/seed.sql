-- Development seed: the four supplied DokKit trade starter packs only.
-- Product ZIP files are registered separately through tools/upload_template_packs.mjs.

update public.products set is_live = false where is_live = true;
update public.product_files set is_active = false where is_active = true;
update public.industries set is_live = false where is_live = true;
update public.package_tiers set is_live = false where is_live = true;

insert into public.industries (slug, name, summary, why, display_order, is_live)
values
  ('electrical-contractors', 'Electrical Contractors', 'Editable customer paperwork and admin records for electrical work.', 'Electrical contractors need a repeatable record from quotation through job completion and invoicing.', 1, true),
  ('plumbing-contractors', 'Plumbing Contractors', 'Editable plumbing paperwork, insurance-report support and admin records.', 'Plumbing jobs benefit from clear work records, insurer-ready reporting and payment documentation.', 2, true),
  ('solar-installers', 'Solar Installers', 'Editable site assessment, quotation and commissioning paperwork for solar installations.', 'Solar projects require clear scope, handover and installation records.', 3, true),
  ('electric-fence-installers', 'Electric Fence Installers', 'Editable quote, installation, inspection and certification paperwork.', 'Electric-fence work needs traceable records from installation through certification.', 4, true)
on conflict (slug) do update set name = excluded.name, summary = excluded.summary, why = excluded.why, display_order = excluded.display_order, is_live = true, updated_at = now();

insert into public.products (industry_id, slug, name, description, product_type, package_tier, price_cents, document_count, workbook_count, pdf_count, metadata, is_live)
select industries.id, packs.slug, packs.name, packs.description, 'industry_package', null, 24900, packs.document_count, 1, packs.pdf_count, packs.metadata::jsonb, true
from (
  values
    ('electrical-contractors', 'electrical-contractor-pack', 'Electrical Contractor Pack', 'Quote, record and invoice electrical work with editable documents and a practical administration workbook.', 4, 5, '{"formats":["DOCX","XLSX","PDF"],"version":"v1.0.0","licence":"One business only; no resale, sharing or distribution."}'),
    ('plumbing-contractors', 'plumbing-contractor-pack', 'Plumbing Contractor Pack', 'A practical paperwork kit for quoting, recording plumbing jobs, supporting insurance claims and keeping the money side organised.', 5, 6, '{"formats":["DOCX","XLSX","PDF"],"version":"v1.0.0","licence":"One business only; no resale, sharing or distribution."}'),
    ('solar-installers', 'solar-installer-pack', 'Solar Installer Pack', 'Turn a solar enquiry into a documented installation with editable assessment, quotation and commissioning paperwork plus an admin workbook.', 5, 6, '{"formats":["DOCX","XLSX","PDF"],"version":"v1.0.0","licence":"One business only; no resale, sharing or distribution."}'),
    ('electric-fence-installers', 'electric-fence-installer-pack', 'Electric Fence Installer Pack', 'Document electric-fence quotes, installation details, certification records and invoices with one trade-specific editable pack.', 5, 6, '{"formats":["DOCX","XLSX","PDF"],"version":"v1.0.0","licence":"One business only; no resale, sharing or distribution."}')
) as packs(industry_slug, slug, name, description, document_count, pdf_count, metadata)
join public.industries on industries.slug = packs.industry_slug
on conflict (slug) do update set industry_id = excluded.industry_id, name = excluded.name, description = excluded.description, product_type = excluded.product_type, package_tier = null, price_cents = excluded.price_cents, document_count = excluded.document_count, workbook_count = excluded.workbook_count, pdf_count = excluded.pdf_count, metadata = excluded.metadata, is_live = true, updated_at = now();
