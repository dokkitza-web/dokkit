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
};

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
    rank: 1,
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
    rank: 2,
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
    rank: 3,
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
    rank: 5,
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
    rank: 6,
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
    rank: 9,
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
    rank: 13,
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

export const singleDocuments: SingleDocument[] = [
  {
    slug: "quotation-template",
    name: "Quotation Template",
    description: "Editable quote layout for service and product businesses.",
    priceCents: 7900,
    fileFormats: ["DOCX", "XLSX", "PDF"],
  },
  {
    slug: "invoice-workbook",
    name: "Invoice Workbook",
    description: "Simple invoice tracker with customer, item, tax, and payment fields.",
    priceCents: 9900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "crm-tracker",
    name: "CRM Tracker",
    description: "Track leads, customers, follow-ups, status, and next actions.",
    priceCents: 9900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "income-expense-tracker",
    name: "Income and Expense Tracker",
    description: "Monthly workbook for small-business income, expenses, and totals.",
    priceCents: 9900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "terms-conditions-template",
    name: "Terms and Conditions Template",
    description: "Plain-language editable starting point for business terms.",
    priceCents: 14900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "service-agreement",
    name: "Service Agreement",
    description: "Editable agreement for scope, fees, timelines, and responsibilities.",
    priceCents: 14900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "client-onboarding-form",
    name: "Client Onboarding Form",
    description: "Capture customer details, needs, preferences, and approvals.",
    priceCents: 6900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "sign-off-form",
    name: "Sign-off Form",
    description: "Confirm completion, acceptance, and customer comments.",
    priceCents: 4900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "stock-tracker",
    name: "Stock Tracker",
    description: "Track stock received, sold, returned, and on hand.",
    priceCents: 9900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "appointment-tracker",
    name: "Appointment Tracker",
    description: "Manage bookings, customer details, service type, and status.",
    priceCents: 7900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "admin-checklist",
    name: "Admin Checklist",
    description: "Weekly and monthly admin checklist for small business owners.",
    priceCents: 4900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "delivery-note",
    name: "Delivery Note",
    description: "Record items delivered, receiving person, date, and signature.",
    priceCents: 4900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "job-card",
    name: "Job Card",
    description: "Capture job details, materials, labour, notes, and status.",
    priceCents: 7900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "supplier-tracker",
    name: "Supplier Tracker",
    description: "Track supplier contact details, terms, orders, and performance.",
    priceCents: 7900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "cash-up-sheet",
    name: "Cash-up Sheet",
    description: "Daily sales, cash, card, EFT, and variance tracking workbook.",
    priceCents: 7900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "project-tracker",
    name: "Project Tracker",
    description: "Track project tasks, owners, deadlines, status, and notes.",
    priceCents: 9900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "returns-form",
    name: "Refund and Returns Form",
    description: "Capture return reasons, refund decisions, and customer details.",
    priceCents: 6900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "consent-form",
    name: "Consent Form",
    description: "Editable customer consent form for services that need approval.",
    priceCents: 6900,
    fileFormats: ["DOCX", "PDF"],
  },
  {
    slug: "monthly-dashboard",
    name: "Monthly Business Dashboard",
    description: "Workbook for sales, expenses, customers, tasks, and monthly notes.",
    priceCents: 12900,
    fileFormats: ["XLSX", "PDF"],
  },
  {
    slug: "customer-feedback-form",
    name: "Customer Feedback Form",
    description: "Collect ratings, comments, referrals, and improvement notes.",
    priceCents: 4900,
    fileFormats: ["DOCX", "PDF"],
  },
];

export const featuredIndustries = industries.slice(0, 6);

export function getIndustryBySlug(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

export function formatPrice(cents: number) {
  return `R${Math.round(cents / 100).toLocaleString("en-ZA")}`;
}
