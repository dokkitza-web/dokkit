# DokKit Website Full Report

**Inspection date:** 30 August 2026  
**Scope:** Read-only audit of [https://dokkit.co.za](https://dokkit.co.za) and the DokKit source checkout at `C:\Users\Elzano Cox\Documents\DokKit\site`.  
**Status at inspection:** **Public storefront unavailable.**

## Executive summary

DokKit is a South African digital-template retailer intended to sell editable Word and Excel business-document packs, individual templates, and a free administration-readiness checklist. The intended application is a Next.js 16 storefront backed by Supabase, PayFast, Resend, and Vercel.

The decisive current finding is **Critical**: the production domain is returning a deliberate maintenance response instead of the store. `https://dokkit.co.za/`, `https://www.dokkit.co.za/`, the catalogue, cart, checkout, legal pages, contact page, and admin routes all returned **HTTP 503** with `Retry-After: 86400` and `X-Robots-Tag: noindex, nofollow, noarchive`. `https://dokkit.co.za/robots.txt` returns `User-agent: *` and `Disallow: /`. Customers therefore cannot browse, add a product, check out, request the checklist, view policies, or sign in.

The source contains a materially more complete storefront than production exposes. It validates 17 package manifests containing 404 files, 19 individual templates, full legal policies, an optional-consent flow, server-side checkout pricing, PayFast ITN validation, and secured download logic. The key operational concern is that the live deployment is not demonstrably the checked-in source: Vercel reports a READY production deployment with the custom domains aliased, but the current deployment has no Git commit metadata and the custom domains serve a maintenance page. This cannot be reconciled from read-only evidence.

## Inspection approach and limitations

Evidence was gathered from:

- Live HTTP HEAD/GET checks against the public domain on 30 August 2026.
- Read-only Vercel project, deployment, and seven-day runtime-error inspection.
- Source, migration, test, and manifest inspection in `C:\Users\Elzano Cox\Documents\DokKit\site`.
- A local development HTTP smoke test of public routes only; no production data, payment, order, configuration, or deployment was changed.

Limitations:

- No browser-control runtime or authenticated admin session was available in this delegated task. The public site was also in maintenance mode, so visual desktop/mobile testing, console capture, checkout continuation, consent interaction, and accessibility-tool scanning could not be performed against the production storefront.
- No real order, payment, free-checklist submission, or admin mutation was attempted, as required.
- The Vercel connection exposed project/deployment/error data but not production environment-variable names. Only names from `.env.example` and the local `.env.local` name inventory are reported; no values are disclosed.
- Local `.env.local` contains only `VERCEL_OIDC_TOKEN`; it does not provide the Supabase public variables required to render protected admin pages locally. That proves a local verification limitation, not that production has the same configuration.

## Business and architecture overview

| Area | Observed design |
|---|---|
| Business | DokKit (Pty) Ltd sells once-off, single-business licences for editable business documents to South African small businesses. |
| Storefront | Next.js 16.2.12 / React 19, App Router, Tailwind CSS. |
| Catalogue | Fallback TypeScript catalogue plus Supabase live catalogue. Package-file manifests are checked into `src/data/package-manifests.generated.json`. |
| Commerce | Cart in browser local storage; server verifies price and availability against live Supabase products; PayFast hosts payment. |
| Delivery | Paid orders receive short-lived, signed access; private Supabase Storage files are issued through signed URLs; downloads are counted. |
| Administration | Supabase password authentication plus `admin_users` / `is_admin()` authorization; pages cover categories, products, files, orders, customers, leads, downloads, payments, and account credentials. |
| Communications | Resend transactional mail; free-checklist lead capture in Supabase. |
| Measurement | Optional GA4 and Meta Pixel/Conversions API, with separate analytics and marketing choices. |
| Hosting | Vercel project `dokkit`, framework Next.js, Node 24.x, Hobby plan. |

Primary implementation evidence: `src/app`, `src/lib`, `src/components`, `supabase/migrations`, and `package.json` under `C:\Users\Elzano Cox\Documents\DokKit\site`.

## Current public health

### Confirmed live response matrix

| URL/path | Result | Evidence / consequence |
|---|---:|---|
| [Home](https://dokkit.co.za/) | 503 | Maintenance HTML; storefront unavailable. |
| `/industries`, `/packages`, `/single-documents` | 503 | Catalogue unavailable. |
| `/free-business-admin-checklist` | 503 | Lead magnet unavailable. |
| `/cart`, `/checkout` | 503 | Purchase journey unavailable. |
| `/terms`, `/privacy`, `/refunds`, `/licence`, `/digital-delivery`, `/contact` | 503 | Customer and statutory information unavailable. |
| `/launch-offer` | 503 | Current offer is unavailable. |
| `/admin`, `/admin/login` | 503 | Admin cannot be reached through the public domain. |
| [robots.txt](https://dokkit.co.za/robots.txt) | 200 | `Disallow: /`; appropriate while intentionally offline. |
| `/sitemap.xml` | 503 | Sitemap unavailable. |

The maintenance response includes `Cache-Control: no-store, max-age=0`, HSTS, `Retry-After: 86400`, and `X-Robots-Tag: noindex, nofollow, noarchive`. The same response was seen on the `www` host and the project alias `dokkit-ten.vercel.app`.

### Intended site map in source

| Section | Intended public path | Current public state |
|---|---|---|
| Home / FAQ | `/` | 503 |
| Industries | `/industries`, `/industries/[slug]` | 503 |
| Package comparison | `/packages` | 503 |
| Individual templates | `/single-documents` | 503 |
| Free checklist | `/free-business-admin-checklist` | 503 |
| Cart / checkout | `/cart`, `/checkout`, success/cancelled states | 503 |
| Offer | `/launch-offer` | 503 |
| Legal/support | `/terms`, `/licence`, `/digital-delivery`, `/refunds`, `/privacy`, `/contact` | 503 |
| Admin | `/admin/*` | 503 |

The source sitemap (`src/app/sitemap.ts`) includes the principal marketing, industry, legal, checklist, and contact paths. It deliberately excludes cart, checkout, admin, API routes, and currently also excludes `/recommended-add-ons` and checkout result routes.

## Product inventory: packages

### Inventory basis

The exact package filenames, formats, groups, source archive names, and counts are in the validated source manifest: `C:\Users\Elzano Cox\Documents\DokKit\site\src\data\package-manifests.generated.json`. `npm run manifests:validate` passed and reported **17 manifests / 404 files**. The storefront renders the contents of these manifests on the relevant industry page (`src/app/industries/[slug]/page.tsx`), including every filename and format group.

As of the inspection date, source says the launch offer is active through **31 August 2026**: Starter/Essential 10% off, Professional 15% off, Complete 20% off. All package calls to action are **Add to cart**. The server re-prices using live Supabase data before order creation (`src/lib/checkout-pricing.ts`); add-to-cart and payment completion could not be tested live because every route is 503.

| Public package (exact name) | Intended URL | Industry / tier | Standard → displayed offer price | Exact inclusion / formats | CTA / checkout status |
|---|---|---|---|---|---|
| South African HR Essential Package | `https://dokkit.co.za/industries/human-resources#human-resources-essential` | Human Resources / Essential (stored as starter tier) | R899 → **R809.10** (10% Launch offer) | 20 DOCX; Finance and Recordkeeping, Human Resources, Compliance and Risk. Exact file list in manifest. | Add to cart; untestable live. |
| South African HR Complete Package | `https://dokkit.co.za/industries/human-resources#human-resources-complete` | Human Resources / Complete | R1,999 → **R1,599.20** (20%) | 53 DOCX; Finance and Recordkeeping, Human Resources, Compliance and Risk. Exact file list in manifest. | Add to cart; untestable live. |
| Beauty Salons and Spas Starter Package | `https://dokkit.co.za/industries/beauty-salons-and-spas#beauty-salons-and-spas-starter` | Beauty Salons and Spas / Starter | R249 → **R224.10** (10%) | 11 DOCX + 1 XLSX; Start here, core documents, operations/admin, workbook. | Add to cart; untestable live. |
| Beauty Salons and Spas Professional Package | `https://dokkit.co.za/industries/beauty-salons-and-spas#beauty-salons-and-spas-professional` | Beauty Salons and Spas / Professional | R599 → **R509.15** (15%) | 20 DOCX + 1 XLSX; Start here, core documents, operations/admin, workbook. | Add to cart; untestable live. |
| Beauty Salons and Spas Complete Package | `https://dokkit.co.za/industries/beauty-salons-and-spas#beauty-salons-and-spas-complete` | Beauty Salons and Spas / Complete | R1,199 → **R959.20** (20%) | 34 DOCX + 1 XLSX; adds SOP, risk/quality, privacy/marketing/team groups. | Add to cart; untestable live. |
| Catering and Baking Starter Package | `https://dokkit.co.za/industries/catering-and-baking#catering-and-baking-starter` | Catering and Baking / Starter | R249 → **R224.10** (10%) | 11 DOCX + 1 XLSX; Start here, core documents, operations/admin, workbook. | Add to cart; untestable live. |
| Catering and Baking Professional Package | `https://dokkit.co.za/industries/catering-and-baking#catering-and-baking-professional` | Catering and Baking / Professional | R599 → **R509.15** (15%) | 20 DOCX + 1 XLSX; Start here, core documents, operations/admin, workbook. | Add to cart; untestable live. |
| Catering and Baking Complete Package | `https://dokkit.co.za/industries/catering-and-baking#catering-and-baking-complete` | Catering and Baking / Complete | R1,199 → **R959.20** (20%) | 34 DOCX + 1 XLSX; adds SOP, risk/quality, privacy/marketing/team groups. | Add to cart; untestable live. |
| Freelancers and Consultants Starter Package | `https://dokkit.co.za/industries/freelancers-consultants#freelancers-consultants-starter` | Freelancers and Consultants / Starter | R249 → **R224.10** (10%) | 10 DOCX + 1 XLSX; setup/admin, quotation/invoicing, client delivery, legal, workbook. | Add to cart; untestable live. |
| Freelancers and Consultants Professional Package | `https://dokkit.co.za/industries/freelancers-consultants#freelancers-consultants-professional` | Freelancers and Consultants / Professional | R599 → **R509.15** (15%) | 19 DOCX + 1 XLSX; adds staff/supplier and marketing groups. | Add to cart; untestable live. |
| Freelancers and Consultants Complete Package | `https://dokkit.co.za/industries/freelancers-consultants#freelancers-consultants-complete` | Freelancers and Consultants / Complete | R1,199 → **R959.20** (20%) | 33 DOCX + 1 XLSX; adds SOP/quality and full operating groups. | Add to cart; untestable live. |
| Landscaping and Garden Services Starter Package | `https://dokkit.co.za/industries/landscaping-garden-services#landscaping-garden-services-starter` | Landscaping and Garden Services / Starter | R249 → **R224.10** (10%) | 10 DOCX + 1 XLSX; setup/admin, quotation/invoicing, client delivery, legal, workbook. | Add to cart; untestable live. |
| Landscaping and Garden Services Professional Package | `https://dokkit.co.za/industries/landscaping-garden-services#landscaping-garden-services-professional` | Landscaping and Garden Services / Professional | R599 → **R509.15** (15%) | 19 DOCX + 1 XLSX; adds staff/supplier and marketing groups. | Add to cart; untestable live. |
| Landscaping and Garden Services Complete Package | `https://dokkit.co.za/industries/landscaping-garden-services#landscaping-garden-services-complete` | Landscaping and Garden Services / Complete | R1,199 → **R959.20** (20%) | 33 DOCX + 1 XLSX; adds SOP/quality and full operating groups. | Add to cart; untestable live. |
| Transport and Delivery Services Starter Package | `https://dokkit.co.za/industries/transport-delivery-services#transport-delivery-services-starter` | Transport and Delivery Services / Starter | R249 → **R224.10** (10%) | 10 DOCX + 1 XLSX; setup/admin, quotation/invoicing, client delivery, legal, workbook. | Add to cart; untestable live. |
| Transport and Delivery Services Professional Package | `https://dokkit.co.za/industries/transport-delivery-services#transport-delivery-services-professional` | Transport and Delivery Services / Professional | R599 → **R509.15** (15%) | 19 DOCX + 1 XLSX; adds staff/supplier and marketing groups. | Add to cart; untestable live. |
| Transport and Delivery Services Complete Package | `https://dokkit.co.za/industries/transport-delivery-services#transport-delivery-services-complete` | Transport and Delivery Services / Complete | R1,199 → **R959.20** (20%) | 33 DOCX + 1 XLSX; adds SOP/quality and full operating groups. | Add to cart; untestable live. |

### Exact package contents and positioning

Every file is shown by name in the source-generated product UI and is preserved in the manifest above. Representative inclusion is not a substitute for the manifest; the manifest is the audit’s authoritative complete filename inventory. The packages consist of operational templates such as cover/read-me documents, profiles, rate cards, quotations, invoices, customer intake/sign-off forms, terms/policies, records, trackers, SOPs, risk documents, team/supplier records, marketing templates, and one Excel workbook where specified.

The HR packages are substantively different: both are Word-only and the Complete package includes 53 HR/compliance files. The five non-HR industry families use a common commercial ladder, with 11/20/34 or 12/21/35 exact files depending on whether a cover/read-me item is counted in the family’s archive convention. The page labels use exact-file totals, which is clearer than the underlying generic tier counts but is not consistently aligned with all global package marketing (see findings).

## Product inventory: individual templates

All 19 are intended to appear on [the single-documents collection](https://dokkit.co.za/single-documents), not on individual product URLs. They have no current launch discount in source. Each card supplies an **Add to cart** action. The source record is `src/data/catalogue.ts`; customer-facing live availability remains untestable while the domain is 503.

| Template | Format | Price | Positioning |
|---|---|---:|---|
| South African Permanent Employment Agreement Template | DOCX | R149 | Permanent employment terms. |
| Business Financial Income Statement Template | XLSX | R129 | Revenue, cost, expenses and profit workbook. |
| CRM Tracker | XLSX | R99 | Leads, customers and follow-up tracker. |
| Income and Expense Tracker | XLSX | R99 | Monthly income/expense workbook. |
| Invoice Workbook Template | XLSX | R99 | Invoice, status, and VAT-ready totals workbook. |
| South African Fixed-Term Employment Agreement Template | DOCX | R149 | Fixed-period/project employment agreement. |
| Job Description Template for South African Small Businesses | DOCX | R79 | Role definition and measurable outputs. |
| Employee Onboarding Checklist Template | DOCX | R69 | Pre-start through early-employment actions. |
| Employee Timesheet Template | DOCX | R49 | Working time and approval record. |
| Leave Application Form Template | DOCX | R49 | Leave request and manager approval. |
| Disciplinary Code and Procedure Template | DOCX | R249 | Workplace rule and disciplinary framework. |
| General Service Agreement Template | DOCX | R149 | Scope, fees, timelines and approvals. |
| Joint Venture Structure Agreement Template | DOCX | R149 | JV roles, contributions and signatures. |
| Master Quotation Template | DOCX | R79 | Pricing, scope, validity and acceptance. |
| Non-Disclosure Agreement Template | DOCX | R149 | Confidentiality arrangement. |
| POPIA Privacy Policy Statement Template | DOCX | R149 | Privacy statement starting point. |
| Terms and Conditions Template | DOCX | R149 | General service/payment/delivery terms. |
| VAT-Compliant Invoice Template | DOCX | R79 | Invoice fields intended for VAT use. |
| VAT-Ready Purchase Order Template | DOCX | R79 | Purchase-order fields intended for VAT use. |

Relationship to packs: packages provide industry-contextual libraries and, except HR, an Excel workbook at a materially lower per-file price. Some standalone concepts are represented in package manifests (for example quotations, invoices, service agreements, terms, employment and onboarding documents), but filenames and industry adaptation vary. The source’s matcher logic explicitly identifies overlap only for some standalone documents (`src/data/package-manifests.ts`); customers must be able to inspect the manifest to judge overlap before buying both.

## Customer journey assessment

**Intended journey:** industry/package or single-document card → local-storage cart → server quote from live products → checkout details and policy acceptance → PayFast form POST → ITN verification → order-success polling → secure, counted downloads and email.

Good source controls include server-side price calculation, a client quote that is checked again on order creation, an idempotent checkout attempt UUID, mandatory policy acceptance, PayFast payment validation, and hashed/encrypted order-access handling. Private file access is released only after verified live payment and the product/order relationship is checked.

**Current journey:** cannot start. The maintenance response intercepts every public step. Cart persistence, server quote, product availability, PayFast hand-off, successful payment, emails, and download redemption therefore remain unverified in production.

## Admin-area report

### Access and authorization

Source authentication uses Supabase email/password login and each admin page calls `requireAdmin()` in `src/lib/supabase/admin.ts`. That function checks an authenticated user and calls the security-definer `is_admin()` function backed by `admin_users`. Database migrations enable RLS and restrict administrative tables and private storage to admins.

No authenticated session was available. The public `/admin` and `/admin/login` paths return 503, not a login page. The implementation was therefore inspected but no records, user details, orders, payments, leads, files, or settings were viewed or changed.

| Section | Implemented capability | Audit result |
|---|---|---|
| Overview | Counts, recent orders, free-checklist activity, launch readiness. | Source reviewed; live blocked. |
| Categories | List/filter industry categories, product and active-file statistics. | Source reviewed; live blocked. |
| Templates/products | List/filter, edit metadata/pricing/live state; global package-tier price update. | Source reviewed; live blocked. |
| Files | Upload, attach, activate/deactivate, delete private files. | Source reviewed; live blocked. Deletion is destructive and was not exercised. |
| Orders | Review, clear/restore dashboard state, reissue access within 12 months, record refund workflow. | Source reviewed; live blocked. |
| Customers | Customer/order activity list. | Source reviewed; live blocked. |
| Payments | Payment/ITN review. | Source reviewed; live blocked. |
| Downloads | Recent access events, links, file, device/IP metadata. | Source reviewed; live blocked. |
| Free leads | Filter up to 500 checklist-lead records and consent status. | Source reviewed; live blocked. |
| Settings | Current admin account email/password update through Supabase Auth. | Source reviewed; live blocked. |

Operationally, the admin has powerful direct product/file actions but no demonstrated approval workflow, role granularity beyond the admin boolean, reconciliation dashboard, or automated data-integrity gate tying database product data to the checked-in package manifests.

## Technical quality, security, analytics, accessibility, SEO, and performance

### Security and privacy

Positive source evidence:

- Supabase RLS policies protect orders, customers, payments, downloads, email logs, leads, and product files; private storage is admin-controlled.
- Checkout uses Zod validation, server-owned product lookup/pricing, payment-token safeguards, and PayFast verification logic.
- Download access uses hashed tokens, HTTP-only scoped cookies, expiry/use limits, signed Storage URLs, and payment/product checks.
- Consent records distinguish analytics from marketing. GA is configured with consent denied by default; Meta browser/server events require marketing consent.
- Legal content identifies the operator, support and privacy contacts, delivery/refund/licence terms, and cookie controls in source.

Remaining verification needs: payment callback behavior, live storage policies, secret rotation, Vercel headers, Vercel deployment protection, real Supabase RLS behavior, abuse controls, and actual analytics network requests were not tested.

### Accessibility and responsive design

The source makes a meaningful effort: semantic navigation, labelled forms, named mobile-menu controls, breadcrumbs, table headings, responsive Tailwind breakpoints, generous minimum control heights, image alt text, and a cookie-preferences dialog. The maintenance page itself has an `aria-labelledby` section and a visible focus style.

No production visual/keyboard/screen-reader or automated axe audit was possible due to 503 and lack of browser control. A source review found no skip link to bypass sticky navigation; this should be added and verified. Mobile layout is implemented in source (including a mobile navigation and horizontal/snap document previews) but is not confirmed on devices.

### SEO and performance

The intended app includes metadata, canonical paths, `robots.ts`, `sitemap.ts`, dynamic industry metadata, favicon/Apple icons, and optimized Next images. Production currently prevents indexing by both robots and response header, which is correct for a temporary maintenance state but eliminates organic discoverability until restored.

Performance is not meaningful to benchmark while the domain only serves a tiny 503 maintenance page. Build source uses Next image optimisation and static revalidation of 300 seconds for catalogue pages. A full local production build fails before completion; see finding H-3.

## Findings and recommendations

| ID | Severity | Confirmed finding | Evidence and recommended action |
|---|---|---|---|
| C-1 | **Critical** | The entire public store is unavailable. | Every sampled customer/admin URL returns HTTP 503 maintenance page; `robots.txt` disallows all. Restore the intended production deployment only after a release smoke test; retain the maintenance page only if the business consciously accepts zero sales/support self-service. |
| C-2 | **Critical** | Production state cannot be tied to the checked-in source. | Vercel reports READY production deployment `dpl_3abeq2ZHQeh7gV7YfsvAcDSwpj9h` with the custom aliases, but public aliases show maintenance and the latest deployment has no Git SHA metadata. Establish a protected release record: commit SHA, deployment URL, alias confirmation, smoke-test result, and rollback target. |
| H-1 | **High** | Catalogue readiness targets conflict with checked-in inventory. | Admin copy expects 8 industries / 24 packages / 20 singles; validated source has 6 ready industries / 17 manifests / 19 individual templates. Reconcile targets, seed data, and marketing claims before reopening. |
| H-2 | **High** | Database/admin data can drift from exact file manifests and checkout. | Public pages may fall back to source data when catalogue queries fail, while checkout uses only live Supabase products. Admin can alter tier/product prices and counts independently; static file manifest remains separate. Add a deploy-time and admin-side manifest/database parity check and block `is_live` on mismatch. |
| H-3 | **High** | Full local production build fails on an admin prerender. | `npm run build` fails at `/admin/settings`: “Missing Supabase public environment variables.” The local environment only exposes `VERCEL_OIDC_TOKEN`. Make admin routes dynamic/auth-gated correctly for build, provide safe CI variables, and add a build gate. Production configuration is not inferred from this result. |
| H-4 | **High** | VAT wording is internally contradictory in admin UI. | Footer/legal policy says DokKit is not VAT registered and charges no VAT; product admin says “Price incl. VAT” and validation asks for a “VAT-inclusive price.” Change internal copy to “Price (ZAR; no VAT charged)” and preserve template-specific VAT wording with an explanatory note. |
| H-5 | **High** | Checkout has no evident rate limiting or bot/friction control. | `/api/checkout` creates pending orders and sends an acknowledgement before payment; no request rate limit, CAPTCHA/honeypot, or equivalent is evident. Add edge/API rate limiting, abuse telemetry, and alerting while preserving legitimate checkout retries. |
| M-1 | **Medium** | The launch offer is about to expire while the store is offline. | Source hard-codes end `31 August 2026`; inspection date is 30 August. Decide whether to extend/end/reword the offer before reopening so stale discounts do not create a promise mismatch. |
| M-2 | **Medium** | Package count language is inconsistent. | Generic tiers say 11/20/34 documents, but exact manifests include varied totals and sometimes include cover/read-me files; fallback per-industry counts also differ. Use one customer-facing convention: “files”, “editable templates”, and “workbooks”, with manifest total adjacent. |
| M-3 | **Medium** | HR Essential is technically a starter tier but publicly labelled Essential. | `human-resources-essential` maps to the starter tier for pricing/discount/admin controls. This can confuse reporting and global tier updates. Introduce an explicit `essential` tier/discount mapping or clearly model it as a renamed Starter tier. |
| M-4 | **Medium** | Free-checklist abuse protection is weak. | The request route uses a honeypot and per-email 5-per-10-minute check, but no clear IP/global limit. Add rate limiting and monitoring; avoid blocking legitimate shared-business email users. |
| M-5 | **Medium** | Individual templates lack dedicated SEO/product URLs. | Nineteen items live under one collection with no individual route/anchor ID. Create product detail URLs with unique metadata, preview, exact file/compatibility information, related packs, and canonical links. |
| M-6 | **Medium** | No skip link was found in source. | Add “Skip to main content” before the sticky header and validate keyboard order, focus visibility, dialogs, table responsiveness, and contrast using browser/axe testing. |
| L-1 | **Low** | Sitemap omits recommended add-ons and transactional endpoints. | Decide deliberately whether `/recommended-add-ons` is an indexable marketing page. Checkout/admin exclusion is appropriate. |
| L-2 | **Low** | Vercel runtime evidence is retention-limited. | Seven-day error clusters were empty, but Hobby logs were unavailable outside a short retention period. Add external uptime/error monitoring and retain operational alerts. |
| I-1 | **Informational** | Source verification is strong apart from the build condition. | Manifest validation passed (17/404), TypeScript passed, 18 tests passed, and lint passed. Local public smoke routes returned 200; local `/admin` was 500 without required public Supabase env variables. |

## Vercel production health

| Item | Read-only finding |
|---|---|
| Project | `dokkit` / `prj_5EgFWVDU3xFCVbl1S6vdqv5z2aFz`; Next.js; Node 24.x; Hobby plan. |
| Latest production deployment | `dpl_3abeq2ZHQeh7gV7YfsvAcDSwpj9h`, READY, target production, Vercel runtime `iad1`. |
| Aliases reported by Vercel | `dokkit.co.za`, `www.dokkit.co.za`, `dokkit-ten.vercel.app`, `dokkit-elzano-s-projects.vercel.app`. |
| Public behavior | Custom domains and `dokkit-ten.vercel.app` return the maintenance 503 response. |
| Recent health | No grouped runtime errors for the inspected seven-day range. Runtime logs were unavailable for that broad period on Hobby retention. |
| Deployment risk | Several historic production deployments are BLOCKED; the current latest deployment lacks Git metadata. Ensure branch protection and deployment source traceability. |
| Environment names expected by source | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, PayFast variables, Resend variables, download-token key, GA/Meta variables. Values were not inspected or disclosed. |
| Source correspondence | **Not confirmed.** Checked local repository HEAD is `a71ae5c9b4650f8c15fb5358d17a07aac3da2b58` (“Redesign admin pack pricing section”); the current Vercel deployment cannot be matched to it from available metadata. |

## 30/60/90-day action plan

### First 30 days — restore and make safe

1. Resolve C-1/C-2: choose the correct production artifact, record its Git SHA, remove/adjust maintenance only when home, catalogue, cart, checkout, PayFast return/ITN, downloads, legal pages, and admin login have passed a read-only smoke checklist.
2. Reconcile the live Supabase catalogue, package manifests, and admin readiness targets; do not reopen with a catalogue/checkout mismatch.
3. Fix the local build gate and VAT language. Add checkout and free-lead rate limiting before traffic is resumed.
4. Capture a production baseline: uptime, status codes, Core Web Vitals, console errors, consent events, Vercel errors, and PayFast ITN outcome.

### Days 31–60 — strengthen operations and conversion

1. Build an admin release checklist with dual approval for product price, live state, package manifest, active file, legal copy, and offer period.
2. Add automated database/manifest parity validation and a post-deploy purchase-journey test that stops before payment.
3. Create dedicated individual-template pages and explicit cross-sell/overlap disclosures.
4. Run a browser-based mobile, keyboard, screen-reader, axe, broken-link, and analytics-consent audit after the site is live.

### Days 61–90 — improve resilience and governance

1. Add uptime, error, order/payment, download, and queue/email alerting with retained dashboards beyond Hobby default logs.
2. Document recovery/runbooks for maintenance, PayFast delays, file replacement, refund/reissue, privacy requests, and compromised download links.
3. Review retention, POPIA evidence, operator agreements, analytics vendor configuration, secret rotation, and least-privilege access.
4. Use funnel data to decide which missing industries/packages/templates should become real live inventory rather than leaving stale readiness targets.

## Appendix: source evidence index

| Topic | Local evidence |
|---|---|
| Product names, fallback catalogue, individual templates | `C:\Users\Elzano Cox\Documents\DokKit\site\src\data\catalogue.ts` |
| Exact package manifest (post-transition) | `C:\Users\Elzano Cox\Documents\DokKit\site\src\data\package-manifests.generated.json` |
| Manifest validation and overlap logic | `C:\Users\Elzano Cox\Documents\DokKit\site\src\data\package-manifests.ts`, `tools\validate-package-manifests.mjs` |
| Industry package UI / exact file display | `C:\Users\Elzano Cox\Documents\DokKit\site\src\app\industries\[slug]\page.tsx` |
| Catalogue database/fallback behavior | `C:\Users\Elzano Cox\Documents\DokKit\site\src\lib\supabase\catalogue.ts` |
| Checkout and server pricing | `C:\Users\Elzano Cox\Documents\DokKit\site\src\app\api\checkout\route.ts`, `src\lib\checkout-pricing.ts` |
| PayFast and secure downloads | `C:\Users\Elzano Cox\Documents\DokKit\site\src\app\api\payfast\itn\route.ts`, `src\app\api\downloads\route.ts` |
| Consent and analytics | `C:\Users\Elzano Cox\Documents\DokKit\site\src\components\analytics-provider.tsx`, `src\lib\analytics.ts`, `src\app\api\consent\route.ts` |
| Admin authorization and screens | `C:\Users\Elzano Cox\Documents\DokKit\site\src\lib\supabase\admin.ts`, `src\app\admin\` |
| Database/RLS/storage schema | `C:\Users\Elzano Cox\Documents\DokKit\site\supabase\migrations\` |
| Legal identity and customer commitments | `C:\Users\Elzano Cox\Documents\DokKit\site\src\data\legal-policies.ts` |
| SEO/site routing | `C:\Users\Elzano Cox\Documents\DokKit\site\src\app\sitemap.ts`, `src\app\robots.ts`, `src\app\layout.tsx` |

---

This report is an evidence-based snapshot of 30 August 2026. Items identified from source are not claims about unobserved live behavior; live claims are limited to the HTTP/Vercel observations recorded above.

## Implementation addendum — trade starter-pack transition (30 August 2026)

Following the audit, the source catalogue was changed from the audited 17 packages / 19 individual documents to four supplied trade-specific starter packs. This transition was released to production on **30 August 2026**. The final clean production deployment is Vercel deployment `dpl_DtiCozacWnnPK3iUFQdYMnfQGRr7` (Git commit `cebcb2a82398641792d0031f77ad0f0623ea61d2`), READY and aliased to `https://dokkit.co.za` and `https://www.dokkit.co.za`.

| New pack | Published version | Editable Word templates | Excel workbooks | PDF files | Original supplied archive |
|---|---:|---:|---:|---:|---|
| Electrical Contractor Pack | 1.0.0 | 4 | 1 | 5 | `site/private/product-packs/DokKit_Electrical_Contractor_Pack_v1.0.3.zip` |
| Plumbing Contractor Pack | 1.0.0 | 5 | 1 | 6 | `site/private/product-packs/DokKit_Plumbing_Contractor_Pack_v1.0.2.zip` |
| Solar Installer Pack | 1.0.0 | 5 | 1 | 6 | `site/private/product-packs/DokKit_Solar_Installer_Pack_v1.3.zip` |
| Electric Fence Installer Pack | 1.0.0 | 5 | 1 | 6 | `site/private/product-packs/DokKit_Electric_Fence_Installer_Pack_v1.0.1.zip` |

The supplied archive did not contain pricing. The source therefore uses the previous DokKit Starter price of **R249 per pack** as a documented, editable initial price. The pages, navigation, sitemap, checkout allow-list, package manifests, development seed, upload configuration and admin readiness checks now use this four-pack catalogue. Old product routes permanently redirect to `/packages`, old products are retired (rather than deleted) by [the migration](C:\Users\Elzano Cox\Documents\DokKit\site\supabase\migrations\202608300001_replace_legacy_catalogue_with_trade_starter_packs.sql), and a new cart namespace prevents retired local cart items being presented for sale.

Release verification: TypeScript, ESLint, all 18 automated tests, package-manifest validation (4 manifests / 50 files), ZIP packaging and the no-write delivery-upload dry run passed. The production build passes after protected admin routes were changed to dynamic request-time rendering. The production Supabase project was restored from its inactive state, the reviewed migration was applied, and all four live products have one active ZIP delivery-file record. Public checks returned HTTP 200 for `https://dokkit.co.za/` and `https://dokkit.co.za/packages`; `/industries` returns HTTP 308 to `/packages`; and a no-order, no-payment checkout-quote request returned R249.00 for the Electrical Contractor Pack. Vercel reported no runtime errors in the selected post-release range. No real order or payment was created. On 30 August 2026, all four public and delivery-file labels were standardised to `v1.0.0`; the original supplied ZIP contents were retained and republished under the new delivery filenames.
