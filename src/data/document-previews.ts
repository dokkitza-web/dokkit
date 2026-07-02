export type DocumentPreviewFormat = "DOCX" | "XLSX";

export type DocumentPreview = {
  id: string;
  title: string;
  format: DocumentPreviewFormat;
  description: string;
  sections: string[];
};

export const documentPreviews: DocumentPreview[] = [
  {
    id: "business-profile-template",
    title: "Business Profile Template",
    format: "DOCX",
    description:
      "A clean editable business profile template for introducing your business professionally.",
    sections: [
      "Business Overview",
      "Services Offered",
      "Target Customers",
      "Contact Details",
      "Logo Placeholder",
    ],
  },
  {
    id: "quotation-template",
    title: "Quotation Template",
    format: "DOCX",
    description:
      "A professional quotation layout for sending clear prices and service details to clients.",
    sections: [
      "Client Details",
      "Quote Number",
      "Service Description",
      "Pricing Table",
      "Terms and Acceptance",
    ],
  },
  {
    id: "invoice-workbook",
    title: "Invoice Workbook",
    format: "XLSX",
    description:
      "An editable invoice workbook for issuing invoices and tracking basic payment information.",
    sections: [
      "Invoice Details",
      "Customer Information",
      "Itemised Charges",
      "Payment Details",
      "Totals",
    ],
  },
  {
    id: "client-onboarding-checklist",
    title: "Client Onboarding Checklist",
    format: "DOCX",
    description:
      "A practical checklist for capturing client details, expectations, notes, and approvals before work begins.",
    sections: [
      "Client Details",
      "Service Requirements",
      "Important Dates",
      "Required Files",
      "Approval Notes",
    ],
  },
  {
    id: "income-expense-tracker",
    title: "Income and Expense Tracker",
    format: "XLSX",
    description:
      "A simple spreadsheet tracker for recording income, expenses, categories, and monthly totals.",
    sections: [
      "Income Log",
      "Expense Log",
      "Category Summary",
      "Monthly Totals",
      "Notes",
    ],
  },
  {
    id: "customer-crm-tracker",
    title: "Customer CRM Tracker",
    format: "XLSX",
    description:
      "A lightweight customer tracker for leads, client details, follow-ups, and next actions.",
    sections: [
      "Lead Details",
      "Customer Status",
      "Follow-up Date",
      "Communication Notes",
      "Next Action",
    ],
  },
];

export const defaultDocumentPreview = documentPreviews[0];
