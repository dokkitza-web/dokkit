export type TradePack = {
  slug: string;
  name: string;
  trade: string;
  version: string;
  priceCents: number;
  description: string;
  idealFor: string;
  editableDocuments: string[];
  workbookSheets: string[];
  workbookPurpose: string;
  workflowSummary: string;
  standardsNote: string;
  archiveName: string;
  documentCount: number;
  workbookCount: number;
  pdfCount: number;
  fileFormats: string[];
  samples: TradePackSample[];
};

export type TradePackSample = {
  id: string;
  title: string;
  description: string;
  format: "PNG";
  previewImageSrc: string;
  alt: string;
};

// The supplied Starter_Packs_v1 archive did not include a price list. R249 is
// the previous DokKit Starter-pack price and is deliberately kept as a single
// editable value for this first catalogue release.
export const tradePacks: TradePack[] = [
  {
    slug: "electrical-contractor-pack", name: "Electrical Contractor Pack", trade: "Electrical contractors", version: "v1.0.0", priceCents: 24900,
    description: "Quote electrical work, record job details and invoice customers with trade-specific editable documents and an Excel admin workbook.",
    idealFor: "Electrical contractors who want clearer job records and customer paperwork.",
    editableDocuments: ["Quotation", "Job Record", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    workbookPurpose: "Excel tracker for clients, jobs, invoices and expenses.",
    workflowSummary: "Quote → job record → invoice",
    standardsNote: "Includes electrical-work record wording designed around COC and Electrical Installation Regulations workflows; adapt it to each job and your professional obligations.",
    archiveName: "DokKit_Electrical_Contractor_Pack_v1.0.0.zip", documentCount: 4, workbookCount: 1, pdfCount: 5, fileFormats: ["DOCX", "XLSX", "PDF"],
    samples: [
      { id: "quotation", title: "Quotation", description: "See the customer details, scope, line items and price-summary layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electrical-contractor-pack/quotation-sample.png", alt: "Watermarked sample quotation layout for the Electrical Contractor Pack" },
      { id: "job-record", title: "Job Record", description: "See the work record, site details and sign-off structure.", format: "PNG", previewImageSrc: "/samples/trade-packs/electrical-contractor-pack/job-record-sample.png", alt: "Watermarked sample job record layout for the Electrical Contractor Pack" },
      { id: "invoice", title: "Invoice (not VAT registered)", description: "See the invoice header, customer details, items and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electrical-contractor-pack/invoice-sample.png", alt: "Watermarked sample invoice layout for the Electrical Contractor Pack" },
      { id: "tax-invoice", title: "Tax Invoice (VAT registered)", description: "See the VAT invoice header, line items, tax summary and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electrical-contractor-pack/tax-invoice-sample.png", alt: "Watermarked sample VAT tax invoice layout for the Electrical Contractor Pack" },
      { id: "admin-workbook", title: "Administration Workbook - Start Here", description: "See the original Start Here sheet with setup guidance, colour codes and workflow steps.", format: "PNG", previewImageSrc: "/samples/trade-packs/electrical-contractor-pack/admin-workbook-sample.png", alt: "Watermarked preview of the Start Here sheet in the Electrical Contractor Pack administration workbook" },
    ],
  },
  {
    slug: "plumbing-contractor-pack", name: "Plumbing Contractor Pack", trade: "Plumbing contractors", version: "v1.0.0", priceCents: 24900,
    description: "Quote plumbing jobs, record work, support insurance-related administration and keep customer payments organised.",
    idealFor: "Plumbers who need professional customer records from quote to invoice.",
    editableDocuments: ["Quotation", "Job Record", "Plumber’s Report for Insurance Claims", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    workbookPurpose: "Excel tracker for clients, jobs, invoices and expenses.",
    workflowSummary: "Quote → job record → insurance report → invoice",
    standardsNote: "Includes PIRB, SANS 10252 and SANS 10254 references where relevant; confirm suitability for the specific installation and insurer requirements.",
    archiveName: "DokKit_Plumbing_Contractor_Pack_v1.0.0.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
    samples: [
      { id: "quotation", title: "Quotation", description: "See the customer details, scope, line items and price-summary layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/quotation-sample.png", alt: "Watermarked sample quotation layout for the Plumbing Contractor Pack" },
      { id: "job-record", title: "Job Record", description: "See the job record fields for site work, materials and customer sign-off.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/job-record-sample.png", alt: "Watermarked sample job record layout for the Plumbing Contractor Pack" },
      { id: "plumbers-report", title: "Plumber’s Report for Insurance Claims", description: "See the incident, findings and supporting-work record structure.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/plumbers-report-sample.png", alt: "Watermarked sample plumber report layout for the Plumbing Contractor Pack" },
      { id: "invoice", title: "Invoice (not VAT registered)", description: "See the invoice header, customer details, items and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/invoice-sample.png", alt: "Watermarked sample invoice layout for the Plumbing Contractor Pack" },
      { id: "tax-invoice", title: "Tax Invoice (VAT registered)", description: "See the VAT invoice header, line items, tax summary and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/tax-invoice-sample.png", alt: "Watermarked sample VAT tax invoice layout for the Plumbing Contractor Pack" },
      { id: "admin-workbook", title: "Administration Workbook - Start Here", description: "See the original Start Here sheet with setup guidance, colour codes and workflow steps.", format: "PNG", previewImageSrc: "/samples/trade-packs/plumbing-contractor-pack/admin-workbook-sample.png", alt: "Watermarked preview of the Start Here sheet in the Plumbing Contractor Pack administration workbook" },
    ],
  },
  {
    slug: "solar-installer-pack", name: "Solar Installer Pack", trade: "Solar installers", version: "v1.0.0", priceCents: 24900,
    description: "Take a solar enquiry from assessment and quotation through installation and commissioning with trade-specific documents and an admin workbook.",
    idealFor: "Solar installers who need a consistent record from site assessment to handover.",
    editableDocuments: ["Site Assessment", "Quotation", "Installation and Commissioning Record", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    workbookPurpose: "Excel tracker for clients, jobs, invoices and expenses.",
    workflowSummary: "Assess → quote → install and commission → invoice",
    standardsNote: "Covers practical SSEG, grid-registration, SANS 10142-1 and commissioning prompts; it is a working template, not a substitute for compliance review.",
    archiveName: "DokKit_Solar_Installer_Pack_v1.0.0.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
    samples: [
      { id: "site-assessment", title: "Site Assessment", description: "See the assessment prompts for site, equipment and installation planning.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/site-assessment-sample.png", alt: "Watermarked sample site assessment layout for the Solar Installer Pack" },
      { id: "quotation", title: "Quotation", description: "See the customer details, system scope, line items and price-summary layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/quotation-sample.png", alt: "Watermarked sample quotation layout for the Solar Installer Pack" },
      { id: "installation-commissioning", title: "Installation and Commissioning Record", description: "See the installation, testing and handover record structure.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/installation-commissioning-sample.png", alt: "Watermarked sample installation and commissioning record layout for the Solar Installer Pack" },
      { id: "invoice", title: "Invoice (not VAT registered)", description: "See the invoice header, customer details, items and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/invoice-sample.png", alt: "Watermarked sample invoice layout for the Solar Installer Pack" },
      { id: "tax-invoice", title: "Tax Invoice (VAT registered)", description: "See the VAT invoice header, line items, tax summary and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/tax-invoice-sample.png", alt: "Watermarked sample VAT tax invoice layout for the Solar Installer Pack" },
      { id: "admin-workbook", title: "Administration Workbook - Start Here", description: "See the original Start Here sheet with setup guidance, colour codes and workflow steps.", format: "PNG", previewImageSrc: "/samples/trade-packs/solar-installer-pack/admin-workbook-sample.png", alt: "Watermarked preview of the Start Here sheet in the Solar Installer Pack administration workbook" },
    ],
  },
  {
    slug: "electric-fence-installer-pack", name: "Electric Fence Installer Pack", trade: "Electric fence installers", version: "v1.0.0", priceCents: 24900,
    description: "Manage quotes, installation records, certification information and invoicing with an editable trade-specific admin pack.",
    idealFor: "Electric-fence installers who need traceable job and certification paperwork.",
    editableDocuments: ["Quotation", "Installation Record", "Inspection and Certification Report", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    workbookPurpose: "Excel tracker for clients, jobs, invoices and expenses.",
    workflowSummary: "Quote → install → inspect and certify → invoice",
    standardsNote: "Includes SANS 10222-3, SANS 60335-2-76 and Regulation 12 workflow prompts; installers remain responsible for the required inspection and certification.",
    archiveName: "DokKit_Electric_Fence_Installer_Pack_v1.0.0.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
    samples: [
      { id: "quotation", title: "Quotation", description: "See the customer details, installation scope, line items and price-summary layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/quotation-sample.png", alt: "Watermarked sample quotation layout for the Electric Fence Installer Pack" },
      { id: "installation-record", title: "Installation Record", description: "See the installation details, equipment and handover record structure.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/installation-record-sample.png", alt: "Watermarked sample installation record layout for the Electric Fence Installer Pack" },
      { id: "inspection-certification-report", title: "Inspection and Certification Report", description: "See the inspection prompts, findings and certification record layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/inspection-certification-report-sample.png", alt: "Watermarked sample inspection and certification report layout for the Electric Fence Installer Pack" },
      { id: "invoice", title: "Invoice (not VAT registered)", description: "See the invoice header, customer details, items and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/invoice-sample.png", alt: "Watermarked sample invoice layout for the Electric Fence Installer Pack" },
      { id: "tax-invoice", title: "Tax Invoice (VAT registered)", description: "See the VAT invoice header, line items, tax summary and total layout.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/tax-invoice-sample.png", alt: "Watermarked sample VAT tax invoice layout for the Electric Fence Installer Pack" },
      { id: "admin-workbook", title: "Administration Workbook - Start Here", description: "See the original Start Here sheet with setup guidance, colour codes and workflow steps.", format: "PNG", previewImageSrc: "/samples/trade-packs/electric-fence-installer-pack/admin-workbook-sample.png", alt: "Watermarked preview of the Start Here sheet in the Electric Fence Installer Pack administration workbook" },
    ],
  },
];

export const tradePackSlugs = tradePacks.map((pack) => pack.slug);

export function getTradePackBySlug(slug: string) {
  return tradePacks.find((pack) => pack.slug === slug);
}

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(priceCents / 100);
}
