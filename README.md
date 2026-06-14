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

## Day-one notes

See `docs/today-setup.md` for GitHub, Supabase, and environment setup steps.
