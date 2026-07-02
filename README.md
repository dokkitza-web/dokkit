# DokKit

DokKit is a catalogue-based South African digital product platform for
downloadable and editable small-business document template packages.

## Current foundation

- Next.js App Router with TypeScript and Tailwind.
- Public catalogue pages for industries, packages, and single documents.
- Seed catalogue data for 15 launch industries.
- Supabase schema, storage buckets, RLS policies, and seed SQL.
- Environment variable template for Supabase, PayFast, and Resend.

## Getting started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Main public pages:

- `/`
- `/industries`
- `/packages`
- `/single-documents`

## Supabase setup

Run the SQL files in this order in a new Supabase project:

1. `supabase/migrations/202606140001_initial_schema.sql`
2. `supabase/seed.sql`

Then create your owner account through Supabase Auth and insert the user id
into `public.admin_users`.

## Environment

Copy `.env.example` to `.env.local` and fill in the live project values.

## Useful scripts

```bash
npm run dev
npm run lint
npm run build
```

## Reset uploaded template packs

Add the live Supabase values to `.env.local`, including
`NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and
`SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`).

Preview the template-pack reset:

```bash
npm run supabase:reset-template-packs
```

Run the reset:

```bash
npm run supabase:reset-template-packs -- --execute
```

By default this resets `industry_package` products by deleting linked storage
files and `product_files` rows, then marking those products not live. Add
`--include-single-documents` to include single document products, `--delete-products`
to remove product rows, and `--purge-pack-buckets` to empty the private pack
storage buckets as well.

## Rebuild launch packs

The first rebuild is scoped to the two ready Complete packs:

- Beauty Salons and Spas
- Catering and Baking

In a fresh Supabase project, run these SQL files in order:

1. `supabase/migrations/202606140001_initial_schema.sql`
2. `supabase/rebuild_business_template_packs.sql`

Package the local pack folders into upload-ready ZIP files:

```bash
npm run packs:package
```

Add the new Supabase values to `.env.local`, then dry-run the upload:

```bash
npm run supabase:upload-template-packs
```

If the dry run is correct, upload and activate the files:

```bash
npm run supabase:upload-template-packs -- --execute
```

## Day-one notes

See `docs/today-setup.md` for GitHub, Supabase, and environment setup steps.
