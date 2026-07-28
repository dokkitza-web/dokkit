export const POLICY_BUNDLE_VERSION = "dokkit-legal-2026-07-27-v1.0";
export const POLICY_EFFECTIVE_DATE = "27 July 2026";
export const POLICY_DISPLAY_VERSION = "1.0";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalPolicy = {
  path: string;
  title: string;
  description: string;
  summaryLabel: string;
  summary: string;
  sections: LegalSection[];
};

export const supplierIdentity = {
  tradingName: "DokKit",
  legalOperator: "DokKit (Pty) Ltd",
  registrationNumber: "2026/470231/07",
  director: "Mr Elzano André Cox",
  address:
    "177 Springbok Road, Bloemfontein, Free State, 9301, South Africa",
  telephone: "+27 83 976 0291",
  supportEmail: "support@dokkit.co.za",
  privacyEmail: "elzano@dokkit.co.za",
  website: "https://dokkit.co.za",
  vatStatus: "DokKit is not registered for VAT and does not charge VAT.",
} as const;

export const policyLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/licence", label: "Template Licence" },
  { href: "/digital-delivery", label: "Digital Delivery" },
  { href: "/refunds", label: "Refunds and Remedies" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export const termsPolicy: LegalPolicy = {
  path: "/terms",
  title: "DokKit Website Terms and Conditions",
  description:
    "Terms governing the DokKit website and purchases of editable Word and Excel business templates.",
  summaryLabel: "Plain-language summary",
  summary:
    "DokKit sells editable Word and Excel business templates. You pay once, receive a single-business licence and obtain secure digital access after PayFast confirms payment. These templates are starting points and must be checked and adapted before use.",
  sections: [
    {
      heading: "Who operates DokKit",
      paragraphs: [
        "The Website at https://dokkit.co.za is operated by DokKit (Pty) Ltd, a private company registered in the Republic of South Africa under registration number 2026/470231/07 (“DokKit”, “we”, “us” or “our”).",
        "Our physical address and address for service of legal documents is 177 Springbok Road, Bloemfontein, Free State, 9301, South Africa. Telephone: +27 83 976 0291. Support email: support@dokkit.co.za.",
      ],
    },
    {
      heading: "What these terms cover",
      paragraphs: [
        "These terms govern use of the Website and purchases of DokKit’s downloadable Word and Excel templates, workbooks, trackers, document packs and related digital products (“Products”). The Template Licence, Digital Delivery Policy, Refund and Remedy Policy, Privacy and Cookies Policy, relevant Product page and accepted order form part of the agreement.",
        "If Product-specific terms expressly grant broader rights or impose a necessary Product-specific requirement, those terms apply only to that Product.",
      ],
    },
    {
      heading: "Who may order",
      paragraphs: [
        "You must have legal capacity to enter into the transaction. If you order for a business or other organisation, you confirm that you are authorised to bind it. You must provide accurate contact, billing and order information.",
      ],
    },
    {
      heading: "What DokKit sells",
      paragraphs: [
        "DokKit sells general-purpose editable business administration templates. The exact filenames or manifest, formats, software requirements, price, licence scope and exclusions displayed on the relevant Product page form part of the Product description.",
        "Previews are illustrative, but the delivered files must materially match the published description and manifest.",
      ],
    },
    {
      heading: "Templates are starting points, not bespoke professional advice",
      paragraphs: [
        "Products are practical starting points and are not bespoke legal, tax, accounting, labour, human-resources, safety, regulatory or other professional advice. Unless a Product page expressly states otherwise and the claim can be substantiated, a Product is not represented as legally approved or automatically compliant with every law, contract, industry standard or circumstance.",
        "You are responsible for adapting the files to your business and obtaining qualified professional advice where the consequences matter.",
      ],
    },
    {
      heading: "Prices and VAT",
      paragraphs: [
        "Prices are displayed in South African Rand. DokKit is not currently registered for VAT, so no VAT is charged. The final payable amount and any fee charged by DokKit will be shown before you place the order. A bank or payment provider may separately charge fees outside DokKit’s control.",
        "References to “VAT-ready” or “VAT-compliant” in a Product title describe fields or functionality in the template; they do not mean VAT is included in DokKit’s selling price.",
      ],
    },
    {
      heading: "Reviewing and correcting an order",
      paragraphs: [
        "Before payment, the cart and checkout must allow you to review the selected Products, quantities, prices, order email and total; correct mistakes; remove items; or leave checkout without placing the order. You are responsible for checking the email address because order and delivery information is sent there.",
      ],
    },
    {
      heading: "Placing and accepting an order",
      paragraphs: [
        "Selecting the final payment action is an offer to buy the Products in the order. An automated acknowledgement does not by itself confirm payment. The order is accepted when PayFast confirms successful payment and DokKit issues the order confirmation or makes the files available, whichever occurs first.",
        "We may reject or cancel an order before delivery because of an obvious pricing error, suspected fraud, a duplicate order, an unavailable Product or a legal requirement. If payment has been collected for a rejected order, we will refund it.",
      ],
    },
    {
      heading: "Payment through PayFast",
      paragraphs: [
        "Payments are processed through PayFast using the methods displayed at checkout. PayFast’s terms and privacy practices apply to its payment service. Payment-card details are entered and processed through PayFast; do not send full card details, passwords or one-time PINs to DokKit.",
        "DokKit must use payment and checkout controls appropriate to the transaction and accepted technological standards.",
      ],
    },
    {
      heading: "Digital delivery",
      paragraphs: [
        "After PayFast confirms payment, DokKit will provide access in accordance with the Digital Delivery Policy. Access is normally displayed on the confirmation page and sent by email within 15 minutes after payment confirmation.",
        "If payment is confirmed but access is unavailable after 30 minutes, first check spam, junk and promotions folders and then email support@dokkit.co.za.",
      ],
    },
    {
      heading: "Transaction record",
      paragraphs: [
        "The order confirmation, payment confirmation and accepted policy version form the transaction record. Save these records together with the Product description and file manifest.",
        "DokKit will retain a reproducible order and acceptance record for five years after the order, unless a longer period is reasonably required by law, a dispute or a legal hold. You may request a copy by emailing support@dokkit.co.za and providing information reasonably required to verify the order.",
      ],
    },
    {
      heading: "Licence, not ownership",
      paragraphs: [
        "Supply of a Product gives you only the rights stated in the Template Licence. Copyright and other intellectual-property rights in the source templates, Website content, branding and design remain with DokKit or the relevant rights holder. You do not purchase ownership of the source templates.",
      ],
    },
    {
      heading: "Software and customer responsibilities",
      paragraphs: [
        "You are responsible for having the compatible software, device, internet access and technical ability stated on the Product page. Compatibility can differ between Microsoft desktop, web and mobile products and third-party applications.",
        "Before using or sending an edited file, you must check names, dates, formulas, calculations, legal references, instructions and final content. You are responsible for lawful use and for keeping backups after download.",
      ],
    },
    {
      heading: "Product quality, errors and remedies",
      paragraphs: [
        "If files are missing, corrupt, inaccessible, the wrong Product, materially different from the description or otherwise defective, contact DokKit under the Refund and Remedy Policy. DokKit will honour every remedy that applicable law requires.",
        "Where the Consumer Protection Act applies, its protections for qualifying intangible goods and licences are not excluded. Nothing in these terms removes a consumer’s statutory choice of remedy where the law grants that choice.",
      ],
    },
    {
      heading: "Acceptable use of the Website",
      paragraphs: [
        "You may use the Website only for lawful purposes. You may not interfere with its operation or security; attempt unauthorised access; introduce malicious code; scrape or copy the catalogue at scale; misuse discounts, downloads or payment systems; or use Website content in a way that infringes intellectual-property or other rights.",
      ],
    },
    {
      heading: "Website and Product changes",
      paragraphs: [
        "We may correct errors, improve or update Products, change prices, suspend features or withdraw Products for future orders. A change after an accepted order does not reduce the rights granted for the version purchased.",
        "We do not guarantee uninterrupted Website availability, but we will take reasonable steps to remedy problems within our control.",
      ],
    },
    {
      heading: "Third-party services and links",
      paragraphs: [
        "The Website relies on third parties for services such as payment processing, hosting, file storage, transactional email and optional analytics or advertising measurement. Those providers may have separate terms. DokKit remains responsible for its own obligations but is not responsible for unrelated content or services controlled by a third party.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: [
        "DokKit processes personal information as described in the Privacy and Cookies Policy at /privacy and in accordance with applicable law. Optional analytics and marketing technologies must follow the consent controls described in that policy.",
      ],
    },
    {
      heading: "Important limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, DokKit is not liable for indirect or consequential loss, loss of profit or business opportunity, or loss caused by your failure to adapt, check, back up or lawfully use a Product. To the maximum extent permitted by law, DokKit’s aggregate contractual liability arising from a Product is limited to the amount paid for that Product.",
        "These limits do not exclude or limit liability where the law prohibits doing so, including liability arising from gross negligence, wilful misconduct or any mandatory statutory right or remedy.",
        "IMPORTANT: Clause 19 limits certain categories of loss and may cap DokKit’s liability. Read it before purchasing. It does not remove any right or liability that South African law says cannot be excluded or limited.",
      ],
    },
    {
      heading: "Events outside reasonable control",
      paragraphs: [
        "Neither party is responsible for delay caused by an event genuinely outside its reasonable control, provided the affected party takes reasonable steps to reduce the impact. This clause does not remove a refund or other right that the law gives you when performance does not occur.",
      ],
    },
    {
      heading: "Complaints and support",
      paragraphs: [
        "Send an order or service complaint to support@dokkit.co.za with your order number, payment email, a clear description and useful screenshots or error messages. We aim to acknowledge a complete request within two business days and resolve it within five business days after receiving the information needed to investigate.",
        "If a consumer complaint remains unresolved, you may use any court, National Consumer Commission process, accredited ombud or other statutory forum that has jurisdiction.",
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        "We may update these terms for future use or future orders. The version accepted when an order is placed governs that order unless a change is required by law or you agree to it. The Website must display the effective date and provide a version that can be printed or saved.",
      ],
    },
    {
      heading: "Governing law and jurisdiction",
      paragraphs: [
        "These terms are governed by the laws of the Republic of South Africa. You and DokKit may approach any court or statutory forum with jurisdiction. Nothing in this clause removes a consumer’s right to use a competent consumer-protection forum.",
      ],
    },
    {
      heading: "General",
      paragraphs: [
        "If a provision is invalid or unenforceable, it will be limited or removed only to the extent necessary and the remaining provisions continue. A failure to enforce a provision is not a waiver. These terms, the incorporated policies, relevant Product page and accepted order are the entire agreement about the purchase, subject to rights implied by law.",
      ],
    },
  ],
};

export const licencePolicy: LegalPolicy = {
  path: "/licence",
  title: "DokKit Template Licence",
  description:
    "The licence for DokKit editable templates, workbooks and document packs.",
  summaryLabel: "Licence summary",
  summary:
    "One purchasing business may edit and use the files for its own operations. Completed outputs may be used in normal business dealings. Blank or reusable source templates may not be resold, shared or handed to another business.",
  sections: [
    {
      heading: "Ownership",
      paragraphs: [
        "DokKit or its licensors owns the copyright and other intellectual-property rights in each template, workbook, document, preview, instruction and design supplied as part of a Product. You receive a licence to use the Product; ownership is not transferred.",
      ],
    },
    {
      heading: "Licence grant",
      paragraphs: [
        "After DokKit accepts the order and receives any required payment, DokKit grants the purchasing business or legal entity a non-exclusive, non-transferable, worldwide licence to download, store, edit, brand, complete, print and use the Product for that single business’s own lawful administration and operations, subject to this licence.",
        "The same licence applies to a Product that DokKit expressly supplies free of charge unless the Product page states different terms.",
      ],
    },
    {
      heading: "Authorised users",
      paragraphs: [
        "The licensed business may allow a reasonable number of its employees and individual contractors to access and edit the Product only while performing work for that business. The business remains responsible for their compliance and must not place source files in a public or unrestricted shared location.",
      ],
    },
    {
      heading: "Permitted outputs",
      paragraphs: [
        "The licensed business may add its name, logo, colours, wording and information; adapt the files to its processes; print copies; export completed documents to PDF; and issue or use completed outputs in ordinary dealings with employees, suppliers, customers, regulators or advisers.",
      ],
    },
    {
      heading: "Freelancers, consultants and service providers",
      paragraphs: [
        "A freelancer or consultant that is the licensed buyer may use a customised, completed output when delivering that buyer’s own service to a client. The buyer may not give the client a reusable blank or editable DokKit source template, create a client template library or charge for the template itself.",
        "A client that needs ongoing access to blank or editable source files must buy its own licence unless DokKit expressly sells a multi-client, white-label or commercial licence.",
      ],
    },
    {
      heading: "Separate businesses",
      paragraphs: [
        "A separate licence is required for each separate business or legal entity, even if entities share owners, directors, staff, premises, a franchise brand or a group structure, unless the Product page or a written DokKit licence expressly grants broader rights.",
      ],
    },
    {
      heading: "Backup copies",
      paragraphs: [
        "The licensed business may keep reasonable backup and archive copies for continuity and record-keeping. Backups remain subject to this licence and may not be used to increase the number of licensed businesses.",
      ],
    },
    {
      heading: "Prohibited conduct",
      paragraphs: [
        "You may not sell, sublicense, rent, publish, redistribute, share, donate or transfer a blank or reusable editable Product; upload it to a template marketplace, public drive, course library, membership site or shared repository; use it to create a competing template product or catalogue; remove embedded ownership or licence notices; represent the original template design as your own; or help another person do any of these things.",
      ],
    },
    {
      heading: "No compliance assurance",
      paragraphs: [
        "The licence does not certify that a Product is legally compliant, professionally approved or suitable for every business. You must review and adapt it for your circumstances and obtain qualified advice where appropriate.",
      ],
    },
    {
      heading: "Updates",
      paragraphs: [
        "The licence covers the version delivered with the order. Updates, new editions, added files or changes in law are not included unless the Product page or order expressly says they are. A voluntary replacement or update does not create an ongoing obligation.",
      ],
    },
    {
      heading: "Material breach and termination",
      paragraphs: [
        "The licence continues unless terminated. DokKit may terminate it for a material breach that is not remedied within a reasonable written cure period, or immediately for intentional resale, public distribution or infringement.",
        "After termination, you must stop new use and delete the source templates and unauthorised copies. Termination does not require destruction of lawfully completed records that must be retained, but no new document may be created from the terminated source files.",
      ],
    },
    {
      heading: "Statutory rights and conflicts",
      paragraphs: [
        "Nothing in this licence excludes a right that cannot lawfully be excluded. If a Product page or signed written licence expressly grants broader rights, those broader rights apply to that Product. A sales message or informal support response changes the licence only if DokKit clearly confirms the change in writing.",
      ],
    },
  ],
};

export const deliveryPolicy: LegalPolicy = {
  path: "/digital-delivery",
  title: "DokKit Digital Delivery Policy",
  description:
    "How DokKit verifies payment, provides secure file access and restores access.",
  summaryLabel: "Delivery promise",
  summary:
    "After PayFast confirms successful payment, secure access is normally shown and emailed within 15 minutes. If it is still unavailable after 30 minutes, contact support@dokkit.co.za.",
  sections: [
    {
      heading: "When delivery starts",
      paragraphs: [
        "Delivery starts only after PayFast confirms successful payment to DokKit. A pending, failed, cancelled, reversed or unverified payment does not trigger delivery.",
      ],
    },
    {
      heading: "Delivery method",
      paragraphs: [
        "DokKit will make purchased files available through a secure order-confirmation page, by email to the address entered at checkout, or both. The email will identify the order and explain how to access the files.",
      ],
    },
    {
      heading: "Delivery target",
      paragraphs: [
        "DokKit aims to provide access within 15 minutes after payment confirmation. This is a service target and does not mean a bank or payment provider will confirm every payment immediately.",
        "If PayFast has confirmed payment and access is unavailable after 30 minutes, email support@dokkit.co.za.",
      ],
    },
    {
      heading: "Access period and download limit",
      paragraphs: [
        "The secure download page remains active for seven days after it is issued and permits up to five successful download attempts for the order. The limit protects the files from unauthorised distribution and is not intended to prevent reasonable use by the licensed buyer.",
      ],
    },
    {
      heading: "Correct email and spam folders",
      paragraphs: [
        "You must enter and check a valid email address. If the confirmation does not arrive, check spam, junk and promotions folders and search for “DokKit” before contacting support.",
        "DokKit is not responsible for delay caused solely by an incorrect email address, but will reasonably assist after verifying the order and buyer.",
      ],
    },
    {
      heading: "Restoring access",
      paragraphs: [
        "If access expires before you complete a reasonable download, contact support with the order number and payment email. DokKit will provide reasonable reissue assistance for up to 12 months after purchase when the order can be verified and the Product remains technically available.",
        "This does not create permanent cloud storage or an obligation to host files indefinitely.",
      ],
    },
    {
      heading: "Wrong, missing, corrupt or inaccessible files",
      paragraphs: [
        "Notify DokKit promptly if files are missing, corrupt, inaccessible, the wrong Product or materially different from the Product purchased. Include the order number, affected filename and a screenshot or error message where useful.",
        "DokKit will provide a fresh link, replacement file or corrected file within a reasonable time, unless applicable law gives you a right to choose another remedy. If the problem cannot be resolved, the Refund and Remedy Policy applies.",
      ],
    },
    {
      heading: "Product unavailable after payment",
      paragraphs: [
        "If DokKit cannot supply an accepted Product because it is unavailable, DokKit will notify you promptly and refund the affected payment within the period required by applicable law.",
      ],
    },
    {
      heading: "Software requirements",
      paragraphs: [
        "The Product page will identify file types and software requirements. Word files generally require compatible word-processing software and Excel workbooks require compatible spreadsheet software. Features may behave differently in desktop, web, mobile and third-party applications.",
      ],
    },
    {
      heading: "Backups",
      paragraphs: [
        "After a successful download, save the files securely and maintain backups. Do not rely on the email or secure link as permanent storage.",
      ],
    },
    {
      heading: "Download security",
      paragraphs: [
        "Secure links are issued for the licensed buyer. Do not publish them, forward them outside the licensed business or use them to circumvent the Template Licence. DokKit may suspend a link reasonably believed to be compromised and issue a replacement after verification.",
      ],
    },
    {
      heading: "Support information",
      paragraphs: [
        "For a delivery problem, email support@dokkit.co.za with the order number, payment email, approximate payment time and a description. DokKit aims to acknowledge a complete request within two business days and resolve it within five business days after receiving the information needed to investigate.",
      ],
    },
  ],
};

export const refundsPolicy: LegalPolicy = {
  path: "/refunds",
  title: "DokKit Refund and Remedy Policy",
  description:
    "DokKit's policy for change-of-mind requests, non-delivery, defects and statutory remedies.",
  summaryLabel: "Fair refund position",
  summary:
    "A voluntary change-of-mind refund is available before any file is accessed, subject to verification. After access, DokKit does not ordinarily offer a voluntary change-of-mind refund. Non-delivery, defects, duplicate charges, material misdescription and every mandatory statutory right remain protected.",
  sections: [
    {
      heading: "Scope",
      paragraphs: [
        "This policy applies to DokKit’s downloadable digital Products and must be read with the Website Terms, Digital Delivery Policy, Template Licence and the description and manifest of the Product purchased.",
      ],
    },
    {
      heading: "Statutory rights are preserved",
      paragraphs: [
        "Nothing in this policy excludes, limits or waives a right or remedy that cannot lawfully be excluded. Where the Electronic Communications and Transactions Act, Consumer Protection Act or another applicable law gives you a right to cancel, receive a refund, require replacement or obtain another remedy, that right applies.",
      ],
    },
    {
      heading: "Contractual change-of-mind cancellation before file access",
      paragraphs: [
        "DokKit will cancel and refund an order if a complete request is received within seven calendar days after purchase and DokKit’s records confirm that no Product file has been accessed or downloaded. Displaying the order-confirmation page by itself is not treated as downloading a file.",
        "Email support@dokkit.co.za promptly because secure access is supplied shortly after payment. This contractual promise is additional to, and does not replace, any statutory cooling-off right.",
      ],
    },
    {
      heading: "Change of mind after file access",
      paragraphs: [
        "Once any Product file has been accessed or downloaded, DokKit does not ordinarily offer a voluntary change-of-mind refund because a reusable editable file cannot practically be returned. This rule applies only to the extent permitted by law.",
        "Depending on the transaction, section 44 of the Electronic Communications and Transactions Act may provide a seven-day cooling-off right and section 42 may exclude that right for specified transactions. DokKit will honour whichever statutory rule applies to the actual transaction.",
      ],
    },
    {
      heading: "Non-delivery, wrong files and material misdescription",
      paragraphs: [
        "Contact DokKit if you paid successfully but did not receive access after reasonable troubleshooting; received the wrong Product; received missing, corrupt or inaccessible files; or received a Product that materially differs from the published description or manifest.",
        "DokKit will investigate the order and relevant technical records and provide the remedy required by applicable law.",
      ],
    },
    {
      heading: "Defective digital Products and Consumer Protection Act remedies",
      paragraphs: [
        "The Consumer Protection Act includes specified intangible products and licences within its definition of goods. Where the Act applies and a Product fails to meet its applicable quality standards, the consumer retains the statutory remedy and choice provided by the Act, including any applicable right to repair, replacement or refund.",
        "DokKit may offer a fresh link, corrected file or replacement, but will not use a “remedy first” rule to override a consumer’s statutory choice.",
      ],
    },
    {
      heading: "Duplicate and unauthorised charges",
      paragraphs: [
        "DokKit will refund a verified duplicate charge. If you believe a payment was unauthorised, contact your bank or payment provider promptly and notify DokKit. DokKit may request reasonable verification, suspend the related download and cooperate with a legitimate investigation.",
      ],
    },
    {
      heading: "Requests not ordinarily refundable",
      paragraphs: [
        "Subject to mandatory law, DokKit does not ordinarily refund merely because you changed your mind after file access; bought the wrong Product after the page and cart clearly identified it; lack the software disclosed on the Product page; no longer need the Product; expected a business result that was not promised; require bespoke professional advice; or damaged or altered a working file after download.",
        "DokKit may still provide reasonable assistance or a discretionary exchange.",
      ],
    },
    {
      heading: "How to request help or a refund",
      paragraphs: [
        "Email support@dokkit.co.za with the subject “Refund or remedy request”. Include your order number, payment email, Product name, payment date, remedy requested and a clear explanation. Attach screenshots or error messages where relevant.",
        "Never send full card details, passwords or one-time PINs.",
      ],
    },
    {
      heading: "Response and decision timing",
      paragraphs: [
        "DokKit aims to acknowledge a complete request within two business days and provide a decision or remedy within five business days after receiving the information reasonably needed to investigate. If a complex payment or technical case needs longer, DokKit will explain the reason and next step.",
      ],
    },
    {
      heading: "Refund method and timing",
      paragraphs: [
        "An approved voluntary refund will be initiated to the original payment method within seven business days after approval. PayFast and the customer’s bank may take additional time to reflect the credit.",
        "If a statute requires a refund by a different deadline or method, the statutory requirement prevails. For example, where an Electronic Communications and Transactions Act cooling-off cancellation applies, the refund must be made within the statutory period.",
      ],
    },
    {
      heading: "Fraud, abuse and licence breaches",
      paragraphs: [
        "DokKit may refuse a discretionary refund where there is credible evidence of fraud, repeated abusive requests, public redistribution, licence breach or an attempt to keep and exploit a Product without paying. This does not remove a mandatory statutory right or prevent a legitimate complaint.",
      ],
    },
    {
      heading: "Escalation",
      paragraphs: [
        "If a complaint is not resolved, ask DokKit for its final written response. You may then use any court, National Consumer Commission process, accredited ombud or other statutory dispute-resolution process with jurisdiction.",
      ],
    },
    {
      heading: "Examples of issues DokKit will investigate",
      paragraphs: [],
      bullets: [
        "A verified payment with no secure access after reasonable troubleshooting.",
        "A missing, corrupt or inaccessible file.",
        "A Product that materially differs from the published description or manifest.",
        "A duplicate charge for the same order.",
        "A working file that contains a defect covered by an applicable statutory quality guarantee.",
      ],
    },
  ],
};

export const privacyPolicy: LegalPolicy = {
  path: "/privacy",
  title: "DokKit Privacy and Cookies Policy",
  description:
    "How DokKit processes personal information and controls optional analytics and marketing measurement.",
  summaryLabel: "Privacy summary",
  summary:
    "DokKit uses the information needed to run the shop, verify payment, deliver files, provide support, protect the service and meet legal obligations. Optional analytics and marketing measurement require the user’s consent choice.",
  sections: [
    {
      heading: "Responsible party",
      paragraphs: [
        "DokKit (Pty) Ltd, registration number 2026/470231/07, is the responsible party for personal information processed for the Website and DokKit’s business purposes.",
        "Physical address: 177 Springbok Road, Bloemfontein, Free State, 9301, South Africa. Privacy contact and Information Officer: Mr Elzano André Cox, elzano@dokkit.co.za, +27 83 976 0291. General support: support@dokkit.co.za.",
      ],
    },
    {
      heading: "Scope",
      paragraphs: [
        "This policy applies when you browse the Website, use the cart, place an order, pay through PayFast, download a Product, contact support, change your privacy choices or interact with DokKit’s online marketing.",
      ],
    },
    {
      heading: "Personal information DokKit processes",
      paragraphs: [
        "Depending on the interaction, DokKit may process your name, business name, email address, telephone number, billing or order details, selected Products, order amount, payment status and reference, policy acceptance, download and security events, support correspondence, consent preferences, IP address, browser and device information, and analytics or advertising identifiers where consent permits.",
        "DokKit does not ask you to send full payment-card details, passwords or one-time PINs. PayFast processes payment credentials under its own privacy practices.",
      ],
    },
    {
      heading: "Where information comes from",
      paragraphs: [
        "Information comes directly from you, from your device or browser, from PayFast’s payment confirmation, and from the service providers used to host, protect, measure and operate the Website.",
      ],
    },
    {
      heading: "Why DokKit processes information",
      paragraphs: [
        "DokKit processes personal information to provide the cart and checkout; create and verify orders; receive payment status; deliver and restore secure access; enforce the Template Licence; prevent fraud and abuse; respond to support, privacy and refund requests; keep financial and transaction records; maintain security; improve the Website; measure marketing where consent permits; and comply with legal obligations.",
        "The applicable justification may include performance of a contract, compliance with law, consent, protection of legitimate interests or a combination permitted by the Protection of Personal Information Act.",
      ],
    },
    {
      heading: "Essential browser storage",
      paragraphs: [
        "Essential storage supports the cart, secure checkout, payment confirmation, download security and saved privacy choice. It operates because the Website cannot provide those requested functions reliably without it.",
      ],
    },
    {
      heading: "Google Analytics 4",
      paragraphs: [
        "DokKit may load the Google tag with analytics storage denied. Before permission, Google may receive limited consent and cookieless measurement signals without setting analytics cookies. If you enable analytics, Google Analytics 4 may record page views and shop events such as product views, cart additions, checkout starts and completed purchases.",
        "DokKit must not intentionally send customer document contents, checkout names, email addresses, telephone numbers, payment credentials or secure download tokens to Google Analytics.",
      ],
    },
    {
      heading: "Meta measurement",
      paragraphs: [
        "If you enable marketing measurement, Meta Pixel and Conversions API may measure visits and shopping actions connected with Facebook and Instagram campaigns. Browser and server events may use matching event identifiers to reduce duplicate reporting.",
        "DokKit must not intentionally send customer document contents, payment credentials or secure download tokens to Meta. Technical identifiers such as IP address, browser information and permitted cookies may be processed only in accordance with the consent choice and applicable law.",
      ],
    },
    {
      heading: "Service providers and recipients",
      paragraphs: [
        "DokKit may share the minimum necessary information with PayFast; hosting, database, secure file-storage and email-delivery providers; security and technical-support providers; Google and Meta when the corresponding consent allows; professional advisers; and public authorities where lawfully required.",
        "These providers act under their own legal duties or as operators that process information for DokKit. DokKit does not sell personal information.",
      ],
    },
    {
      heading: "Cross-border processing",
      paragraphs: [
        "Some service providers or their systems may be located outside South Africa. Where personal information is transferred across borders, DokKit will use a basis and safeguards permitted by section 72 of the Protection of Personal Information Act.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "DokKit uses reasonable technical and organisational safeguards appropriate to its size, systems and risks, including access controls, secure payment processing, restricted download tokens, service-provider controls, backups and security monitoring.",
        "No internet system is completely secure. If DokKit has reasonable grounds to believe personal information was accessed or acquired by an unauthorised person, it will investigate and notify the Information Regulator and affected data subjects where required by law.",
      ],
    },
    {
      heading: "Retention",
      paragraphs: [
        "DokKit keeps personal information only as long as reasonably needed for the purpose, a legal requirement, a dispute or a legal hold. Order, payment, licence-acceptance and transaction records are generally retained for five years after the order. Download and security records are generally retained for the 12-month access-support period unless needed longer for security or a dispute.",
        "Support correspondence is retained only as long as reasonably required, normally no longer than three years after closure. Consent records are kept while needed to demonstrate the choice. At the end of a retention period, information is deleted, destroyed or de-identified where reasonably practicable.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Subject to applicable law, you may ask whether DokKit holds your personal information; request access; request correction or deletion of inaccurate, irrelevant, excessive, outdated, incomplete, misleading or unlawfully obtained information; object to processing in permitted circumstances; withdraw consent for future optional processing; and lodge a complaint.",
        "Email elzano@dokkit.co.za or support@dokkit.co.za. DokKit may request reasonable identity verification before acting.",
      ],
    },
    {
      heading: "Direct marketing",
      paragraphs: [
        "DokKit will use electronic direct marketing only where permitted by law. Marketing messages will identify the sender and provide a practical way to opt out. An opt-out stops future marketing through that channel but does not stop essential order, payment, download, licence, security or support messages.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "The Website and Products are intended for business users and are not directed at children. DokKit does not knowingly invite a child to place an order without the involvement of a competent adult.",
      ],
    },
    {
      heading: "Privacy complaints",
      paragraphs: [
        "Please contact DokKit first so the issue can be investigated. You may also lodge a complaint with the Information Regulator (South Africa). Current contact and complaint information is available at https://inforegulator.org.za/.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "DokKit may update this policy when systems, providers, laws or practices change. The Website will display the effective date and current version. A material change affecting an existing order will not remove rights already acquired.",
      ],
    },
    {
      heading: "Privacy-control requirements",
      paragraphs: [],
      bullets: [
        "Essential storage may operate without optional analytics or marketing consent.",
        "Analytics and marketing choices must be separate, clear and changeable.",
        "Turning an optional category off must stop new events in that category.",
        "The Website must not place secure download tokens or direct identifiers in analytics payloads or page URLs.",
        "The live vendor list and retention settings must match this policy.",
      ],
    },
  ],
};

export const legalPolicies = [
  termsPolicy,
  licencePolicy,
  deliveryPolicy,
  refundsPolicy,
  privacyPolicy,
] as const;

export const PRODUCT_INFORMATION_COPY =
  "EDITABLE FILES — Includes the Microsoft Word and/or Excel formats listed on this page. Add your business details, wording and logo using compatible software. LICENCE — One purchasing business may use the files for its own operations. You may not resell or share reusable source templates. DELIVERY — Pay once in Rand. After PayFast confirms payment, secure access is shown and emailed, normally within 15 minutes. SUPPORT — If files do not arrive, are corrupt or do not match the description, contact support@dokkit.co.za. Your statutory rights are not excluded.";

export const CHECKOUT_DISCLOSURE_COPY =
  "Your order is a once-off payment; there is no subscription. After PayFast confirms successful payment, we will show secure access on the confirmation page and email it to [CUSTOMER EMAIL], normally within 15 minutes. The file formats and software requirements are listed on each Product page. This purchase includes a single-business licence.";

export const ACCEPTANCE_COPY =
  "I have reviewed my order and agree to the Website Terms, Template Licence, Digital Delivery Policy, Refund and Remedy Policy and Privacy and Cookies Policy. I understand that the Products are editable digital templates, not bespoke legal or professional advice, and that my statutory rights are not excluded.";

export const PAID_CONFIRMATION_COPY =
  "Payment confirmed. Your DokKit files are ready. Use the secure button below to download them now. We have also emailed access to [CUSTOMER EMAIL]. Secure access remains active for 7 days and permits up to 5 successful download attempts. Save a backup after downloading. If the email or files do not arrive, contact support@dokkit.co.za and include order [ORDER NUMBER].";

export const PENDING_CONFIRMATION_COPY =
  "We are waiting for PayFast to confirm this payment. Do not pay again. We will unlock the files and email you as soon as verification succeeds. If the payment was completed and this message remains after 30 minutes, contact support@dokkit.co.za with order [ORDER NUMBER].";
