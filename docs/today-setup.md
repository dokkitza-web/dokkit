# DokKit day-one setup

## Done in this repo

- Next.js app scaffolded with TypeScript, App Router, Tailwind, and ESLint.
- Basic public pages created:
  - `/`
  - `/industries`
  - `/industries/[slug]`
  - `/packages`
  - `/single-documents`
- Static seed catalogue created in `src/data/catalogue.ts`.
- Supabase migration and seed SQL created in `supabase/`.
- Environment variable example created in `.env.example`.

## Live GitHub repo

The GitHub CLI is not installed in this environment, so create the remote repo
from GitHub.com, then connect it with:

```bash
git remote add origin https://github.com/YOUR-USERNAME/dokkit.git
git branch -M main
git push -u origin main
```

Recommended repo settings:

- Private while building.
- Protect `main` after first production deployment.
- Add Vercel as the deployment integration.

## Live Supabase project

Create a new Supabase project, then run:

1. `supabase/migrations/202606140001_initial_schema.sql`
2. `supabase/seed.sql`

After creating your owner account in Supabase Auth, insert yourself as admin:

```sql
insert into public.admin_users (user_id, email)
values ('YOUR-AUTH-USER-ID', 'you@yourdomain.co.za');
```

## Environment variables

Copy `.env.example` to `.env.local`, then fill in:

- Supabase project URL
- Supabase anon key
- Supabase service role key
- PayFast sandbox credentials
- Resend API key
- Verified Resend sender email

Never commit `.env.local`.
