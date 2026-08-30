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
    slug: "electrical-contractor-pack", name: "Electrical Contractor Pack", trade: "Electrical contractors", version: "v1.0.3", priceCents: 24900,
    description: "Quote, record and invoice electrical work with a focused set of editable documents and a practical administration workbook.",
    idealFor: "Electrical contractors who want clearer job records and customer paperwork.",
    editableDocuments: ["Quotation", "Job Record", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    standardsNote: "Includes electrical-work record wording designed around COC and Electrical Installation Regulations workflows; adapt it to each job and your professional obligations.",
    archiveName: "DokKit_Electrical_Contractor_Pack_v1.0.3.zip", documentCount: 4, workbookCount: 1, pdfCount: 5, fileFormats: ["DOCX", "XLSX", "PDF"],
  },
  {
    slug: "plumbing-contractor-pack", name: "Plumbing Contractor Pack", trade: "Plumbing contractors", version: "v1.0.2", priceCents: 24900,
    description: "A practical paperwork kit for quoting, recording plumbing jobs, supporting insurance claims and keeping the money side organised.",
    idealFor: "Plumbers who need professional customer records from quote to invoice.",
    editableDocuments: ["Quotation", "Job Record", "Plumber’s Report for Insurance Claims", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    standardsNote: "Includes PIRB, SANS 10252 and SANS 10254 references where relevant; confirm suitability for the specific installation and insurer requirements.",
    archiveName: "DokKit_Plumbing_Contractor_Pack_v1.0.2.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
  },
  {
    slug: "solar-installer-pack", name: "Solar Installer Pack", trade: "Solar installers", version: "v1.3", priceCents: 24900,
    description: "Turn a solar enquiry into a documented installation with editable assessment, quotation and commissioning paperwork plus an admin workbook.",
    idealFor: "Solar installers who need a consistent record from site assessment to handover.",
    editableDocuments: ["Site Assessment", "Quotation", "Installation and Commissioning Record", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    standardsNote: "Covers practical SSEG, grid-registration, SANS 10142-1 and commissioning prompts; it is a working template, not a substitute for compliance review.",
    archiveName: "DokKit_Solar_Installer_Pack_v1.3.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
  },
  {
    slug: "electric-fence-installer-pack", name: "Electric Fence Installer Pack", trade: "Electric fence installers", version: "v1.0.1", priceCents: 24900,
    description: "Document electric-fence quotes, installation details, certification records and invoices with one trade-specific editable pack.",
    idealFor: "Electric-fence installers who need traceable job and certification paperwork.",
    editableDocuments: ["Quotation", "Installation Record", "Inspection and Certification Report", "Invoice (not VAT registered)", "Tax Invoice (VAT registered)"],
    workbookSheets: ["Clients", "Jobs", "Invoices", "Expenses", "Dashboard"],
    standardsNote: "Includes SANS 10222-3, SANS 60335-2-76 and Regulation 12 workflow prompts; installers remain responsible for the required inspection and certification.",
    archiveName: "DokKit_Electric_Fence_Installer_Pack_v1.0.1.zip", documentCount: 5, workbookCount: 1, pdfCount: 6, fileFormats: ["DOCX", "XLSX", "PDF"],
  },
];

export const tradePackSlugs = tradePacks.map((pack) => pack.slug);

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(priceCents / 100);
}
