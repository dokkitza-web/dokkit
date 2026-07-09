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
  ('professional', 'Professional', 'A stronger operating pack for businesses that quote often, onboard customers, and track work.', 59900, 20, 1, 0, 2, true),
  ('complete', 'Complete', 'A full document library for owners who want a complete admin system from first enquiry to delivery.', 119900, 34, 1, 0, 3, true)
on conflict (tier_key) do update set
  name = excluded.name,
  summary = excluded.summary,
  price_cents = excluded.price_cents,
  document_count = excluded.document_count,
  workbook_count = excluded.workbook_count,
  pdf_count = excluded.pdf_count,
  display_order = excluded.display_order,
  is_live = excluded.is_live;

insert into public.industries (slug, name, summary, why, display_order, is_live)
values
  ('cleaning-services', 'Cleaning Services', 'Residential, office, move-in, move-out, and contract cleaning businesses need repeatable quotes and checklists.', 'Cleaning is easy to start, has strong local demand, and customers expect clear scope, pricing, and sign-off documents.', 1, true),
  ('construction-subcontractors', 'Construction Subcontractors', 'Small trade teams need quote, job card, safety, variation, and sign-off documents for site work.', 'Subcontractors handle higher-value work where paperwork reduces disputes and improves payment follow-up.', 2, true),
  ('beauty-salons-and-spas', 'Beauty Salons and Spas', 'Beauty businesses need appointment, consent, treatment, price list, and client record templates.', 'Salons have frequent customer interactions and benefit from polished client forms and simple revenue tracking.', 3, true),
  ('mobile-car-wash-detailing', 'Mobile Car Wash and Detailing', 'Mobile vehicle care operators need bookings, service menus, condition checks, and customer sign-offs.', 'Mobile operators sell convenience and trust, so clear service records and before-after sign-offs matter.', 4, true),
  ('catering-and-baking', 'Catering and Baking', 'Food businesses need order forms, event quotes, ingredient costing, delivery notes, and stock trackers.', 'Custom food orders create admin pressure around deposits, quantities, dietary details, and delivery timing.', 5, true),
  ('freelancers-consultants', 'Freelancers and Consultants', 'Independent professionals need proposals, retainers, onboarding forms, invoices, and client trackers.', 'This segment buys digital templates readily and values documents that make a solo business look established.', 6, true),
  ('tutors-training-providers', 'Tutors and Training Providers', 'Tutors, facilitators, and short-course providers need enrolment, attendance, lesson, and payment records.', 'Education services are admin-heavy and many small providers need affordable, editable templates.', 7, true),
  ('event-planners', 'Event Planners', 'Event operators need client briefs, supplier trackers, quotes, run sheets, and delivery checklists.', 'Events involve many moving parts and clients expect structured planning documents.', 8, true),
  ('landscaping-garden-services', 'Landscaping and Garden Services', 'Garden service businesses need maintenance schedules, quotes, site checks, and recurring service records.', 'Recurring outdoor services are common and simple templates help businesses win and retain contracts.', 9, true),
  ('handyman-home-repair', 'Handyman and Home Repair', 'Repair businesses need job cards, quotes, inspection forms, warranties, and customer acceptance records.', 'Handyman work is broad and prone to scope misunderstandings, making simple paperwork very valuable.', 10, true),
  ('photography-videography', 'Photography and Videography', 'Creative service providers need booking forms, package sheets, shoot briefs, release forms, and delivery notes.', 'Customers compare packages carefully, and clear contracts protect time, usage rights, and deliverables.', 11, true),
  ('property-rental-admin', 'Property Rental Admin', 'Small landlords and rental administrators need tenant, inspection, payment, and maintenance records.', 'Rental admin needs consistency, and even small landlords require records that are easy to update and store.', 12, true),
  ('transport-delivery-services', 'Transport and Delivery Services', 'Delivery operators need trip sheets, delivery notes, vehicle logs, client trackers, and invoice records.', 'Transport businesses depend on proof of delivery, route records, and vehicle admin.', 13, true),
  ('food-trucks-small-food-vendors', 'Food Trucks and Small Food Vendors', 'Small food sellers need stock, menu, costing, supplier, and daily cash-up templates.', 'Food margins need close tracking, and simple daily workbooks create quick operational value.', 14, true),
  ('online-resellers-ecommerce', 'Online Resellers and E-commerce', 'Resellers need stock, order, returns, supplier, profit, and customer trackers.', 'Online sellers are comfortable buying digital tools and need lightweight admin before adopting complex software.', 15, true)
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  why = excluded.why,
  display_order = excluded.display_order,
  is_live = excluded.is_live;

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
  i.slug || '-' || t.tier_key,
  i.name || ' ' || t.name || ' Package',
  t.summary,
  'industry_package',
  t.tier_key,
  t.price_cents,
  t.document_count,
  t.workbook_count,
  t.pdf_count,
  jsonb_build_object('industry_slug', i.slug, 'tier_key', t.tier_key),
  true
from public.industries i
cross join public.package_tiers t
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  document_count = excluded.document_count,
  workbook_count = excluded.workbook_count,
  pdf_count = excluded.pdf_count,
  metadata = excluded.metadata,
  is_live = excluded.is_live;

insert into public.products (
  slug,
  name,
  description,
  product_type,
  price_cents,
  document_count,
  workbook_count,
  pdf_count,
  metadata,
  is_live
)
values
  ('quotation-template', 'Quotation Template', 'Editable quote layout for service and product businesses.', 'single_document', 7900, 1, 1, 0, '{"formats":["DOCX","XLSX"]}', true),
  ('invoice-workbook', 'Invoice Workbook', 'Simple invoice tracker with customer, item, tax, and payment fields.', 'single_document', 9900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('crm-tracker', 'CRM Tracker', 'Track leads, customers, follow-ups, status, and next actions.', 'single_document', 9900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('income-expense-tracker', 'Income and Expense Tracker', 'Monthly workbook for small-business income, expenses, and totals.', 'single_document', 9900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('terms-conditions-template', 'Terms and Conditions Template', 'Plain-language editable starting point for business terms.', 'single_document', 14900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('service-agreement', 'Service Agreement', 'Editable agreement for scope, fees, timelines, and responsibilities.', 'single_document', 14900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('client-onboarding-form', 'Client Onboarding Form', 'Capture customer details, needs, preferences, and approvals.', 'single_document', 6900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('sign-off-form', 'Sign-off Form', 'Confirm completion, acceptance, and customer comments.', 'single_document', 4900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('stock-tracker', 'Stock Tracker', 'Track stock received, sold, returned, and on hand.', 'single_document', 9900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('appointment-tracker', 'Appointment Tracker', 'Manage bookings, customer details, service type, and status.', 'single_document', 7900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('admin-checklist', 'Admin Checklist', 'Weekly and monthly admin checklist for small business owners.', 'single_document', 4900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('delivery-note', 'Delivery Note', 'Record items delivered, receiving person, date, and signature.', 'single_document', 4900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('job-card', 'Job Card', 'Capture job details, materials, labour, notes, and status.', 'single_document', 7900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('supplier-tracker', 'Supplier Tracker', 'Track supplier contact details, terms, orders, and performance.', 'single_document', 7900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('cash-up-sheet', 'Cash-up Sheet', 'Daily sales, cash, card, EFT, and variance tracking workbook.', 'single_document', 7900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('project-tracker', 'Project Tracker', 'Track project tasks, owners, deadlines, status, and notes.', 'single_document', 9900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('returns-form', 'Refund and Returns Form', 'Capture return reasons, refund decisions, and customer details.', 'single_document', 6900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('consent-form', 'Consent Form', 'Editable customer consent form for services that need approval.', 'single_document', 6900, 1, 0, 0, '{"formats":["DOCX"]}', true),
  ('monthly-dashboard', 'Monthly Business Dashboard', 'Workbook for sales, expenses, customers, tasks, and monthly notes.', 'single_document', 12900, 0, 1, 0, '{"formats":["XLSX"]}', true),
  ('customer-feedback-form', 'Customer Feedback Form', 'Collect ratings, comments, referrals, and improvement notes.', 'single_document', 4900, 1, 0, 0, '{"formats":["DOCX"]}', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  document_count = excluded.document_count,
  workbook_count = excluded.workbook_count,
  pdf_count = excluded.pdf_count,
  metadata = excluded.metadata,
  is_live = excluded.is_live;
