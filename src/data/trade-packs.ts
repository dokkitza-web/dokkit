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
  },
];

export const tradePackSlugs = tradePacks.map((pack) => pack.slug);

export function getTradePackBySlug(slug: string) {
  return tradePacks.find((pack) => pack.slug === slug);
}

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(priceCents / 100);
}
