export type PackageTierKey = "starter" | "professional" | "complete";

export type PackageTier = {
  key: PackageTierKey;
  name: string;
  priceCents: number;
  summary: string;
  bestFor: string;
  documentCount: number;
  workbookCount: number;
  pdfCount: number;
  includes: string[];
};

export type Industry = {
  rank: number;
  slug: string;
  name: string;
  summary: string;
  why: string;
  featuredDocuments: string[];
  useCases: string[];
};

export type SingleDocument = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  fileFormats: string[];
  previewImageSrc?: string;
};

export type IndustryPackageProduct = {
  key: PackageTierKey;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  documentCount: number;
  workbookCount: number;
  pdfCount: number;
  fileFormats: string[];
};

export const VAT_RATE_PERCENT = 15;
export const VAT_INCLUDED_LABEL = `Includes ${VAT_RATE_PERCENT}% VAT`;
export const VAT_INCLUDED_SUMMARY_LABEL = `VAT included at ${VAT_RATE_PERCENT}%`;

export const packageTiers: PackageTier[] = [
  {
    key: "starter",
    name: "Starter",
    priceCents: 24900,
    summary:
      "A practical admin launch pack for new or informal operators who need the basics fast.",
    bestFor: "Best for solo owners who need to look professional this week.",
    documentCount: 11,
    workbookCount: 1,
    pdfCount: 0,
    includes: [
      "Quotation template",
      "Invoice workbook",
      "Customer intake form",
      "Basic terms and conditions",
      "Income and expense tracker",
      "Service checklist",
      "Client sign-off form",
      "Admin folder guide",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    priceCents: 59900,
    summary:
      "A stronger operating pack for businesses that quote often, onboard customers, and track work.",
    bestFor: "Best for growing service businesses with repeat customers.",
    documentCount: 20,
    workbookCount: 1,
    pdfCount: 0,
    includes: [
      "Everything in Starter",
      "CRM tracker",
      "Service agreement",
      "Client onboarding pack",
      "Job tracker",
      "Supplier tracker",
      "Follow-up email templates",
      "Monthly admin checklist",
    ],
  },
  {
    key: "complete",
    name: "Complete",
    priceCents: 119900,
    summary:
      "A full document library for owners who want a complete admin system from first enquiry to delivery.",
    bestFor: "Best for serious operators who want a fuller back-office kit.",
    documentCount: 34,
    workbookCount: 1,
    pdfCount: 0,
    includes: [
      "Everything in Professional",
      "Advanced reporting workbook",
      "Standard operating procedure templates",
      "Risk and compliance checklists",
      "Employee admin documents",
      "Delivery and acceptance pack",
      "Customer retention tracker",
      "Quarterly business review pack",
    ],
  },
];

export const industries: Industry[] = [
  {
    rank: 9,
    slug: "human-resources",
    name: "Human Resources",
    summary:
      "South African HR templates for hiring, onboarding, employee records, performance, discipline, leave, and exits.",
    why: "Small employers need consistent employee records and fair, repeatable HR processes without building every document from scratch.",
    featuredDocuments: [
      "Employment agreements",
      "Employee onboarding checklist",
      "Leave and attendance records",
      "Performance management documents",
      "Disciplinary and grievance procedures",
    ],
    useCases: [
      "Appoint and onboard employees",
      "Maintain employee and payroll records",
      "Manage leave, attendance, and performance",
      "Document discipline, grievances, and employee exits",
    ],
  },
  {
    rank: 3,
    slug: "cleaning-services",
    name: "Cleaning Services",
    summary:
      "Residential, office, move-in, move-out, and contract cleaning businesses need repeatable quotes and checklists.",
    why: "Cleaning is easy to start, has strong local demand, and customers expect clear scope, pricing, and sign-off documents.",
    featuredDocuments: [
      "Cleaning quotation template",
      "Site inspection checklist",
      "Recurring service agreement",
      "Cleaning task schedule",
      "Customer sign-off form",
    ],
    useCases: [
      "Quote for once-off and recurring jobs",
      "Record client instructions before a job",
      "Track staff tasks and completed work",
      "Collect proof of completion",
    ],
  },
  {
    rank: 4,
    slug: "construction-subcontractors",
    name: "Construction Subcontractors",
    summary:
      "Small trade teams need quote, job card, safety, variation, and sign-off documents for site work.",
    why: "Subcontractors handle higher-value work where paperwork reduces disputes and improves payment follow-up.",
    featuredDocuments: [
      "Work quotation template",
      "Variation order form",
      "Site handover checklist",
      "Material tracker",
      "Completion sign-off form",
    ],
    useCases: [
      "Quote and scope trade work",
      "Track labour and materials",
      "Record client-approved changes",
      "Submit completion paperwork",
    ],
  },
  {
    rank: 1,
    slug: "beauty-salons-and-spas",
    name: "Beauty Salons and Spas",
    summary:
      "Beauty businesses need appointment, consent, treatment, price list, and client record templates.",
    why: "Salons have frequent customer interactions and benefit from polished client forms and simple revenue tracking.",
    featuredDocuments: [
      "Client intake form",
      "Treatment consent form",
      "Appointment tracker",
      "Service price list",
      "Daily cash-up workbook",
    ],
    useCases: [
      "Capture client preferences",
      "Manage appointments",
      "Record consent before treatments",
      "Track daily sales",
    ],
  },
  {
    rank: 4,
    slug: "mobile-car-wash-detailing",
    name: "Mobile Car Wash and Detailing",
    summary:
      "Mobile vehicle care operators need bookings, service menus, condition checks, and customer sign-offs.",
    why: "Mobile operators sell convenience and trust, so clear service records and before-after sign-offs matter.",
    featuredDocuments: [
      "Service menu template",
      "Vehicle condition checklist",
      "Booking tracker",
      "Detailing quote template",
      "Completion sign-off form",
    ],
    useCases: [
      "Quote mobile services",
      "Record vehicle condition",
      "Manage bookings",
      "Confirm completed work",
    ],
  },
  {
    rank: 2,
    slug: "catering-and-baking",
    name: "Catering and Baking",
    summary:
      "Food businesses need order forms, event quotes, ingredient costing, delivery notes, and stock trackers.",
    why: "Custom food orders create admin pressure around deposits, quantities, dietary details, and delivery timing.",
    featuredDocuments: [
      "Event quote template",
      "Cake order form",
      "Ingredient costing workbook",
      "Delivery note",
      "Deposit tracker",
    ],
    useCases: [
      "Quote events and custom orders",
      "Track deposits and balances",
      "Cost ingredients",
      "Confirm delivery details",
    ],
  },
  {
    rank: 5,
    slug: "freelancers-consultants",
    name: "Freelancers and Consultants",
    summary:
      "Independent professionals need proposals, retainers, onboarding forms, invoices, and client trackers.",
    why: "This segment buys digital templates readily and values documents that make a solo business look established.",
    featuredDocuments: [
      "Proposal template",
      "Retainer agreement",
      "Client onboarding form",
      "Project tracker",
      "Invoice workbook",
    ],
    useCases: [
      "Send polished proposals",
      "Define scope and deliverables",
      "Onboard new clients",
      "Track project progress",
    ],
  },
  {
    rank: 7,
    slug: "tutors-training-providers",
    name: "Tutors and Training Providers",
    summary:
      "Tutors, facilitators, and short-course providers need enrolment, attendance, lesson, and payment records.",
    why: "Education services are admin-heavy and many small providers need affordable, editable templates.",
    featuredDocuments: [
      "Learner enrolment form",
      "Attendance register",
      "Lesson tracker",
      "Training invoice workbook",
      "Parent communication template",
    ],
    useCases: [
      "Register learners",
      "Track attendance",
      "Plan lessons",
      "Manage payments",
    ],
  },
  {
    rank: 8,
    slug: "event-planners",
    name: "Event Planners",
    summary:
      "Event operators need client briefs, supplier trackers, quotes, run sheets, and delivery checklists.",
    why: "Events involve many moving parts and clients expect structured planning documents.",
    featuredDocuments: [
      "Event brief form",
      "Supplier tracker",
      "Event quote template",
      "Run sheet",
      "Post-event sign-off",
    ],
    useCases: [
      "Gather client requirements",
      "Track suppliers",
      "Plan event timing",
      "Confirm delivery after the event",
    ],
  },
  {
    rank: 6,
    slug: "landscaping-garden-services",
    name: "Landscaping and Garden Services",
    summary:
      "Garden service businesses need maintenance schedules, quotes, site checks, and recurring service records.",
    why: "Recurring outdoor services are common and simple templates help businesses win and retain contracts.",
    featuredDocuments: [
      "Garden maintenance quote",
      "Site assessment checklist",
      "Recurring service schedule",
      "Plant and material tracker",
      "Client approval form",
    ],
    useCases: [
      "Quote garden work",
      "Plan recurring visits",
      "Track materials",
      "Get client approvals",
    ],
  },
  {
    rank: 7,
    slug: "safety-security",
    name: "Safety and Security",
    summary:
      "Safety and security providers need site assessments, service records, incident reports, and client sign-offs.",
    why: "Security and safety services depend on clear records, shift notes, incident details, and proof of service delivery.",
    featuredDocuments: [
      "Site risk assessment form",
      "Security services quotation",
      "Shift handover log",
      "Incident report",
      "Patrol register",
    ],
    useCases: [
      "Quote guarding and patrol services",
      "Record site risks and instructions",
      "Track shifts and incidents",
      "Confirm service completion",
    ],
  },
  {
    rank: 10,
    slug: "handyman-home-repair",
    name: "Handyman and Home Repair",
    summary:
      "Repair businesses need job cards, quotes, inspection forms, warranties, and customer acceptance records.",
    why: "Handyman work is broad and prone to scope misunderstandings, making simple paperwork very valuable.",
    featuredDocuments: [
      "Job card",
      "Repair quotation",
      "Inspection checklist",
      "Work warranty note",
      "Completion acceptance form",
    ],
    useCases: [
      "Record repair requests",
      "Quote small jobs",
      "Track materials used",
      "Collect sign-off",
    ],
  },
  {
    rank: 11,
    slug: "photography-videography",
    name: "Photography and Videography",
    summary:
      "Creative service providers need booking forms, package sheets, shoot briefs, release forms, and delivery notes.",
    why: "Customers compare packages carefully, and clear contracts protect time, usage rights, and deliverables.",
    featuredDocuments: [
      "Shoot booking form",
      "Package comparison sheet",
      "Model release form",
      "Creative brief",
      "Delivery checklist",
    ],
    useCases: [
      "Sell shoot packages",
      "Confirm booking details",
      "Capture usage permission",
      "Track final delivery",
    ],
  },
  {
    rank: 12,
    slug: "property-rental-admin",
    name: "Property Rental Admin",
    summary:
      "Small landlords and rental administrators need tenant, inspection, payment, and maintenance records.",
    why: "Rental admin needs consistency, and even small landlords require records that are easy to update and store.",
    featuredDocuments: [
      "Tenant information form",
      "Property inspection checklist",
      "Rental payment tracker",
      "Maintenance request log",
      "Tenant communication template",
    ],
    useCases: [
      "Record tenant details",
      "Inspect properties",
      "Track rent payments",
      "Manage maintenance requests",
    ],
  },
  {
    rank: 8,
    slug: "transport-delivery-services",
    name: "Transport and Delivery Services",
    summary:
      "Delivery operators need trip sheets, delivery notes, vehicle logs, client trackers, and invoice records.",
    why: "Transport businesses depend on proof of delivery, route records, and vehicle admin.",
    featuredDocuments: [
      "Delivery note",
      "Trip sheet",
      "Vehicle logbook",
      "Fuel tracker",
      "Client delivery tracker",
    ],
    useCases: [
      "Confirm deliveries",
      "Track trips and fuel",
      "Record vehicle checks",
      "Invoice recurring clients",
    ],
  },
  {
    rank: 14,
    slug: "food-trucks-small-food-vendors",
    name: "Food Trucks and Small Food Vendors",
    summary:
      "Small food sellers need stock, menu, costing, supplier, and daily cash-up templates.",
    why: "Food margins need close tracking, and simple daily workbooks create quick operational value.",
    featuredDocuments: [
      "Menu costing workbook",
      "Stock tracker",
      "Daily cash-up sheet",
      "Supplier list",
      "Prep checklist",
    ],
    useCases: [
      "Track food stock",
      "Calculate menu pricing",
      "Record daily cash-up",
      "Manage supplier orders",
    ],
  },
  {
    rank: 15,
    slug: "online-resellers-ecommerce",
    name: "Online Resellers and E-commerce",
    summary:
      "Resellers need stock, order, returns, supplier, profit, and customer trackers.",
    why: "Online sellers are comfortable buying digital tools and need lightweight admin before adopting complex software.",
    featuredDocuments: [
      "Stock tracker",
      "Order log",
      "Returns tracker",
      "Supplier tracker",
      "Profit workbook",
    ],
    useCases: [
      "Track inventory",
      "Record orders",
      "Manage returns",
      "Monitor product profit",
    ],
  },
];

export const readyIndustrySlugs = [
  "human-resources",
  "beauty-salons-and-spas",
  "catering-and-baking",
  "cleaning-services",
  "construction-subcontractors",
  "freelancers-consultants",
  "landscaping-garden-services",
  "safety-security",
  "transport-delivery-services",
];

export const readyIndustries = readyIndustrySlugs
  .map((slug) => industries.find((industry) => industry.slug === slug))
  .filter((industry): industry is Industry => Boolean(industry));

const industryPackageDocumentCounts: Record<
  string,
  Record<PackageTierKey, number>
> = {
  "beauty-salons-and-spas": {
    starter: 11,
    professional: 20,
    complete: 34,
  },
  "catering-and-baking": {
    starter: 7,
    professional: 10,
    complete: 15,
  },
  "cleaning-services": {
    starter: 7,
    professional: 10,
    complete: 18,
  },
  "construction-subcontractors": {
    starter: 7,
    professional: 10,
    complete: 22,
  },
  "freelancers-consultants": {
    starter: 7,
    professional: 10,
    complete: 20,
  },
  "landscaping-garden-services": {
    starter: 7,
    professional: 10,
    complete: 22,
  },
  "safety-security": {
    starter: 7,
    professional: 10,
    complete: 22,
  },
  "transport-delivery-services": {
    starter: 7,
    professional: 10,
    complete: 22,
  },
};

const industryAudiences: Record<string, string> = {
  "beauty-salons-and-spas":
    "salons, spas, beauty therapists, nail technicians, lash artists, and wellness service providers",
  "catering-and-baking":
    "caterers, bakers, cake makers, meal prep businesses, and event food service providers",
  "cleaning-services":
    "residential cleaners, office cleaners, move-in and move-out cleaners, and contract cleaning teams",
  "construction-subcontractors":
    "small trade teams, subcontractors, site service providers, and construction support businesses",
  "freelancers-consultants":
    "freelancers, consultants, independent professionals, coaches, and specialist service providers",
  "landscaping-garden-services":
    "garden services, landscapers, lawn care providers, irrigation teams, and outdoor maintenance businesses",
  "safety-security":
    "security service providers, safety consultants, patrol teams, guarding businesses, and risk support providers",
  "transport-delivery-services":
    "couriers, delivery businesses, transport operators, shuttle services, and small logistics providers",
};

export const tierDocumentRanges: Record<
  PackageTierKey,
  { min: number; max: number }
> = {
  starter: { min: 7, max: 11 },
  professional: { min: 10, max: 20 },
  complete: { min: 15, max: 34 },
};

function createFallbackPackageDescription(
  industry: Industry,
  tierKey: PackageTierKey,
) {
  const audience = industryAudiences[industry.slug] ?? "small businesses";

  if (tierKey === "starter") {
    return `A focused editable starter pack for ${audience} that need core admin, quotation, invoice, client, and work-tracking templates.`;
  }

  if (tierKey === "professional") {
    return `A stronger editable operating pack for ${audience} that need detailed client, job, supplier, staff, and follow-up records.`;
  }

  return `A full editable business document library for ${audience}, with Word templates and an Excel administration workbook for daily operations.`;
}

export function getFallbackIndustryPackageProducts(
  industrySlug: string,
): IndustryPackageProduct[] {
  const industry = industries.find((item) => item.slug === industrySlug);

  if (!industry) {
    return [];
  }

  if (industry.slug === "human-resources") {
    return [
      {
        key: "starter",
        slug: "human-resources-essential",
        name: "South African HR Essential Package",
        description:
          "A practical editable HR starter library for hiring, onboarding, employee information, payroll records, leave administration, attendance, core policies, and employee exits.",
        priceCents: 89900,
        documentCount: 20,
        workbookCount: 0,
        pdfCount: 0,
        fileFormats: ["DOCX"],
      },
      {
        key: "complete",
        slug: "human-resources-complete",
        name: "South African HR Complete Package",
        description:
          "A comprehensive editable HR administration library covering employment, onboarding, employee records, performance, training, discipline, grievances, incapacity, termination, and retrenchment processes.",
        priceCents: 199900,
        documentCount: 53,
        workbookCount: 0,
        pdfCount: 0,
        fileFormats: ["DOCX"],
      },
    ];
  }

  const counts = industryPackageDocumentCounts[industry.slug];

  return packageTiers.map((tier) => ({
    key: tier.key,
    slug: `${industry.slug}-${tier.key}`,
    name: `${industry.name} ${tier.name} Package`,
    description: createFallbackPackageDescription(industry, tier.key),
    priceCents: tier.priceCents,
    documentCount: counts?.[tier.key] ?? tier.documentCount,
    workbookCount: 1,
    pdfCount: 0,
    fileFormats: ["DOCX", "XLSX"],
  }));
}

export function formatDocumentRange(tierKey: PackageTierKey) {
  const range = tierDocumentRanges[tierKey];

  return range.min === range.max ? `${range.min}` : `${range.min}-${range.max}`;
}

export function formatFileFormats(fileFormats: string[]) {
  const labels: Record<string, string> = {
    DOCX: "Word",
    XLSX: "Excel",
    PDF: "PDF",
  };

  return fileFormats
    .map((format) => labels[format.toUpperCase()] ?? format)
    .join(" + ");
}

export function getSingleDocumentPreviewImageSrc(slug: string) {
  return `/images/previews/single-documents/${slug}.png`;
}

export const singleDocuments: SingleDocument[] = [
  {
    slug: "permanent-employment-agreement-template",
    name: "South African Permanent Employment Agreement Template",
    description:
      "Editable Word agreement for recording a permanent employee's role, remuneration, working arrangements, leave, conduct, confidentiality, and signatures.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "permanent-employment-agreement-template",
    ),
  },
  {
    slug: "business-financial-income-statement-template",
    name: "Business Financial Income Statement Template",
    description:
      "Editable Excel income statement workbook for recording revenue, cost of sales, expenses, and profit.",
    priceCents: 12900,
    fileFormats: ["XLSX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "business-financial-income-statement-template",
    ),
  },
  {
    slug: "crm-tracker",
    name: "CRM Tracker",
    description: "Excel tracker for leads, customers, follow-ups, status, and next actions.",
    priceCents: 9900,
    fileFormats: ["XLSX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc("crm-tracker"),
  },
  {
    slug: "income-and-expense-tracker",
    name: "Income and Expense Tracker",
    description: "Monthly workbook for small-business income, expenses, and totals.",
    priceCents: 9900,
    fileFormats: ["XLSX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "income-and-expense-tracker",
    ),
  },
  {
    slug: "invoice-workbook-template",
    name: "Invoice Workbook Template",
    description:
      "Excel invoice workbook for customer details, invoice items, payment status, and VAT-ready totals.",
    priceCents: 9900,
    fileFormats: ["XLSX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "invoice-workbook-template",
    ),
  },
  {
    slug: "fixed-term-employment-contract-template",
    name: "South African Fixed-Term Employment Agreement Template",
    description:
      "Editable Word agreement for a defined period, project, or event, including the fixed-term basis, appointment details, remuneration, leave, confidentiality, and termination administration.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "fixed-term-employment-contract-template",
    ),
  },
  {
    slug: "job-description-template",
    name: "Job Description Template for South African Small Businesses",
    description:
      "Define a role's purpose, responsibilities, reporting lines, authority, objective requirements, and measurable outputs before hiring or reviewing an employee.",
    priceCents: 7900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "job-description-template",
    ),
  },
  {
    slug: "employee-onboarding-checklist-template",
    name: "Employee Onboarding Checklist Template",
    description:
      "Track pre-start, first-day, payroll, policy, safety, privacy, equipment, and early-employment actions for a new employee.",
    priceCents: 6900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "employee-onboarding-checklist-template",
    ),
  },
  {
    slug: "employee-timesheet-template",
    name: "Employee Timesheet Template",
    description:
      "Record employee working time, task or project allocation, reporting period details, and manager approval in an editable Word format.",
    priceCents: 4900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "employee-timesheet-template",
    ),
  },
  {
    slug: "leave-application-form-template",
    name: "Leave Application Form Template",
    description:
      "Give employees a structured way to request leave and managers a clear place to approve, decline, and route the request for recordkeeping or payroll action.",
    priceCents: 4900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "leave-application-form-template",
    ),
  },
  {
    slug: "disciplinary-code-and-procedure-template",
    name: "Disciplinary Code and Procedure Template",
    description:
      "A practical framework for workplace rules, corrective action, formal hearings, warnings, dismissals, and recordkeeping, subject to a fair assessment of each case.",
    priceCents: 24900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "disciplinary-code-and-procedure-template",
    ),
  },
  {
    slug: "general-service-agreement-template",
    name: "General Service Agreement Template",
    description:
      "Editable Word agreement for service scope, fees, timelines, responsibilities, and client approvals.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "general-service-agreement-template",
    ),
  },
  {
    slug: "joint-venture-structure-agreement-template",
    name: "Joint Venture Structure Agreement Template",
    description:
      "Editable Word starting point for recording joint venture structure, roles, contributions, and signatures.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "joint-venture-structure-agreement-template",
    ),
  },
  {
    slug: "master-quotation-template",
    name: "Master Quotation Template",
    description:
      "Editable Word quotation template for pricing, scope, validity, acceptance, and customer details.",
    priceCents: 7900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "master-quotation-template",
    ),
  },
  {
    slug: "non-disclosure-agreement-template",
    name: "Non-Disclosure Agreement Template",
    description:
      "Editable Word non-disclosure agreement template for confidential business information and signatures.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "non-disclosure-agreement-template",
    ),
  },
  {
    slug: "popia-privacy-policy-statement-template",
    name: "POPIA Privacy Policy Statement Template",
    description:
      "Editable Word privacy policy statement template for customer, staff, supplier, and business contact information.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "popia-privacy-policy-statement-template",
    ),
  },
  {
    slug: "terms-and-conditions-template",
    name: "Terms and Conditions Template",
    description:
      "Editable Word terms and conditions template for quotes, services, payment terms, delivery, cancellations, and general admin.",
    priceCents: 14900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "terms-and-conditions-template",
    ),
  },
  {
    slug: "vat-compliant-invoice-template",
    name: "VAT-Compliant Invoice Template",
    description:
      "Editable Word invoice template with VAT-friendly fields for supplier, customer, line items, totals, and payment details.",
    priceCents: 7900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "vat-compliant-invoice-template",
    ),
  },
  {
    slug: "vat-ready-purchase-order-template",
    name: "VAT-Ready Purchase Order Template",
    description:
      "Editable Word purchase order template for supplier details, items, quantities, VAT-ready totals, and approval.",
    priceCents: 7900,
    fileFormats: ["DOCX"],
    previewImageSrc: getSingleDocumentPreviewImageSrc(
      "vat-ready-purchase-order-template",
    ),
  },
];

export const featuredIndustries = readyIndustries.slice(0, 6);

export function getIndustryBySlug(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

export function formatPrice(cents: number) {
  const hasCents = cents % 100 !== 0;

  return `R${(cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })}`;
}

export function getVatPortionCents(vatInclusiveCents: number) {
  return Math.round(
    (vatInclusiveCents * VAT_RATE_PERCENT) / (100 + VAT_RATE_PERCENT),
  );
}
