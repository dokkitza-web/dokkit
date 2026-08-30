-- Standardise the public version label for the first release of every trade pack.
-- The delivery-file version is updated by the reviewed upload script after this migration.
update public.products
set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{version}', '"v1.0.0"'::jsonb, true)
where slug in (
  'electrical-contractor-pack',
  'plumbing-contractor-pack',
  'solar-installer-pack',
  'electric-fence-installer-pack'
);
