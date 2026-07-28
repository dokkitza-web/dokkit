import Link from "next/link";
import {
  formatDocumentRange,
  formatFileFormats,
  formatPrice,
} from "@/data/catalogue";
import {
  DocumentPreviewCard,
  ProductMockup,
} from "@/components/marketing/product-mockup";
import { PayfastLogo } from "@/components/payfast-logo";
import {
  LAUNCH_OFFER_END_LABEL,
  LAUNCH_OFFER_START_LABEL,
  getLaunchOfferPhase,
} from "@/lib/launch-offer";
import {
  getCatalogueIndustries,
  getCataloguePackageTiers,
  getCatalogueSingleDocuments,
} from "@/lib/supabase/catalogue";

export const revalidate = 300;

const homepageIndustrySlugs = [
  "human-resources",
  "beauty-salons-and-spas",
  "catering-and-baking",
  "freelancers-consultants",
  "landscaping-garden-services",
  "transport-delivery-services",
];

const documentPreviews = [
  {
    title: "Client Treatment Intake Form",
    industry: "Beauty Salons and Spas",
    format: "Word",
    imageSrc: "/images/previews/beauty-client-intake.png",
  },
  {
    title: "Catering and Baking Quotation",
    industry: "Catering and Baking",
    format: "Word",
    imageSrc: "/images/previews/catering-quotation.png",
  },
  {
    title: "Cleaning Services Invoice",
    industry: "Cleaning Services",
    format: "Word",
    imageSrc: "/images/previews/cleaning-invoice.png",
  },
  {
    title: "Construction Risk Assessment",
    industry: "Construction Subcontractors",
    format: "Word",
    imageSrc: "/images/previews/construction-risk-assessment.png",
  },
  {
    title: "Project Proposal Template",
    industry: "Freelancers and Consultants",
    format: "Word",
    imageSrc: "/images/previews/freelancer-proposal.png",
  },
  {
    title: "Garden Service Site Intake Form",
    industry: "Landscaping and Garden Services",
    format: "Word",
    imageSrc: "/images/previews/landscaping-site-intake.png",
  },
  {
    title: "Security Site Risk Assessment",
    industry: "Safety and Security",
    format: "Word",
    imageSrc: "/images/previews/security-site-risk.png",
  },
  {
    title: "Proof of Delivery and Handover Form",
    industry: "Transport and Delivery Services",
    format: "Word",
    imageSrc: "/images/previews/transport-proof-of-delivery.png",
  },
];

const trustItems = [
  "Built for South African small businesses",
  "Editable Word and Excel templates",
  "Professional document structure",
  "Instant digital delivery after verified PayFast payment",
  "Secure checkout with PayFast",
];

const faqs = [
  {
    question: "What do I receive after payment?",
    answer:
      "After PayFast confirms payment, DokKit unlocks secure downloads for the files attached to your purchased products.",
  },
  {
    question: "Can I edit the templates?",
    answer:
      "Yes. DokKit focuses on editable Word templates and Excel workbooks so you can customise them for your business.",
  },
  {
    question: "Are these industry-specific?",
    answer:
      "Industry packs are organised around ready small-business categories such as beauty, catering, cleaning, construction, consulting, landscaping, safety and security, and transport.",
  },
];

export default async function Home() {
  const [industries, packageTiers, singleDocuments] = await Promise.all([
    getCatalogueIndustries(),
    getCataloguePackageTiers(),
    getCatalogueSingleDocuments(),
  ]);
  const homepageIndustries = homepageIndustrySlugs
    .map((slug) => industries.find((industry) => industry.slug === slug))
    .filter((industry): industry is (typeof industries)[number] =>
      Boolean(industry),
    );
  const featuredDocuments = singleDocuments.slice(0, 6);
  const launchOfferPhase = getLaunchOfferPhase();
  const showLaunchOffer = launchOfferPhase !== "ended";
  const launchOfferCopy =
    launchOfferPhase === "active"
      ? `Launch offer now live until ${LAUNCH_OFFER_END_LABEL}: selected packages up to 20% off.`
      : `Launch offer starts ${LAUNCH_OFFER_START_LABEL}: selected packages up to 20% off.`;

  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-10 pt-8 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.95fr] lg:gap-12 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase leading-5 text-[#a63d00] sm:text-sm sm:leading-6">
              Editable Word &amp; Excel templates for South African small
              businesses
            </p>
            <h1 className="mt-3 max-w-4xl text-[2.125rem] font-black leading-[1.04] text-[#111111] min-[360px]:text-[2.35rem] sm:mt-4 sm:text-6xl sm:leading-[1.02]">
              Run your business with professional documents without starting
              from scratch.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#4f4f55] sm:mt-6 sm:text-lg sm:leading-8">
              Choose your industry and get the documents you need to run your
              business professionally—ready to edit in Word and Excel. Add your
              business details and logo, pay once, and receive your download
              link by email after payment. No subscription.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <Link
                href="/industries"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#c24100] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412]"
              >
                Choose your business type
              </Link>
              <Link
                href="/single-documents"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-black/20 bg-white px-6 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]"
              >
                Preview the templates
              </Link>
            </div>
            <p className="mt-4 text-xs font-bold leading-5 text-[#4f4f55] sm:mt-6 sm:text-sm sm:leading-6">
              Secure PayFast payment &bull; No subscription &bull; Practical
              South African business templates
            </p>
          </div>
          <ProductMockup />
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-10 sm:py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-6 lg:grid-cols-3 lg:gap-6 lg:px-8">
          <div className="rounded-md bg-[#111111] p-5 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
              The admin problem
            </p>
            <h2 className="mt-3 text-2xl font-black sm:mt-4 sm:text-3xl">
              Blank pages slow down real work.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Quotes, forms, agreements and trackers take time to structure,
              format and keep consistent.
            </p>
          </div>
          <div className="rounded-md border border-black/10 bg-[#fff4eb] p-5 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d95400]">
              A practical starting point
            </p>
            <h2 className="mt-3 text-2xl font-black sm:mt-4 sm:text-3xl">
              Start with the document already built.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
              Open the Word or Excel file, replace the example fields and adapt
              the content to the way your business operates.
            </p>
          </div>
          <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              The outcome
            </p>
            <h2 className="mt-3 text-2xl font-black sm:mt-4 sm:text-3xl">
              Cleaner admin and clearer customer paperwork.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
              Use a consistent set of working documents from first enquiry to
              sign-off, recordkeeping and follow-up.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f4f1] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase text-[#a63d00]">
                Start with your business
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Which admin pack fits the work you do?
              </h2>
            </div>
            <Link
              href="/industries"
              className="inline-flex min-h-11 items-center font-black text-[#a63d00] underline decoration-2 underline-offset-4"
            >
              View all verified industries
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:mt-9 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {homepageIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c24100] hover:shadow-xl sm:min-h-56 sm:p-6"
              >
                <p className="text-sm font-black uppercase text-[#a63d00]">
                  Verified package manifests
                </p>
                <h3 className="mt-4 text-2xl font-black">{industry.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                  {industry.summary}
                </p>
                <p className="mt-5 text-sm font-black text-[#a63d00]">
                  Compare this industry&apos;s packages
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Document previews
            </p>
            <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
              Practical templates that look like proper business documents.
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {documentPreviews.map((preview, index) => (
              <div key={preview.title} className={index > 3 ? "hidden sm:block" : ""}>
                <DocumentPreviewCard
                  title={preview.title}
                  industry={preview.industry}
                  format={preview.format}
                  imageSrc={preview.imageSrc}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-12 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-[#ffb77a]">
            Three clear steps
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
            From the right package to working files.
          </h2>
          <ol className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3 md:gap-8">
            {[
              [
                "1",
                "Choose and compare",
                "Select your industry, inspect the exact file manifest and compare only the tiers available for that industry.",
              ],
              [
                "2",
                "Pay through PayFast",
                "Review your cart, enter the order email address and continue to the secure PayFast payment page.",
              ],
              [
                "3",
                "Download after verification",
                "DokKit verifies the PayFast notification before unlocking the secure files attached to the paid order.",
              ],
            ].map(([number, heading, copy]) => (
              <li key={number} className="border-t border-white/20 pt-5">
                <span className="text-4xl font-black text-[#ffb77a]">
                  {number}
                </span>
                <h3 className="mt-4 text-2xl font-black">{heading}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
              Simple package options for different business stages.
            </h2>
            {showLaunchOffer ? (
              <Link
                href="/launch-offer"
                className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[#ffcfaa] bg-white px-4 py-2 text-sm font-black text-[#d95400] shadow-sm transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
              >
                {launchOfferCopy}
              </Link>
            ) : null}
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
            {packageTiers.map((tier) => (
              <article
                key={tier.key}
                className={`relative rounded-md border p-5 shadow-sm sm:p-7 ${
                  tier.key === "complete"
                    ? "border-[#ff6a00] bg-[#111111] text-white orange-glow"
                    : "border-black/10 bg-white text-[#111111]"
                }`}
              >
                {tier.key === "complete" ? (
                  <span className="absolute right-5 top-5 rounded-full bg-[#ff6a00] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">
                    Best value
                  </span>
                ) : null}
                <h3 className="text-2xl font-black">{tier.name} Pack</h3>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    tier.key === "complete" ? "text-white/65" : "text-[#5f5f66]"
                  }`}
                >
                  {tier.summary}
                </p>
                <p className="mt-7 text-4xl font-black">
                  {formatPrice(tier.priceCents)}
                </p>
                <p
                  className={`mt-2 text-sm ${
                    tier.key === "complete" ? "text-white/60" : "text-[#5f5f66]"
                  }`}
                >
                  {formatDocumentRange(tier.key)} Word documents,{" "}
                  {tier.workbookCount} Excel workbook
                </p>
                <ul className="mt-6 grid gap-2 text-sm font-bold sm:mt-7 sm:gap-3">
                  {tier.includes.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className={`rounded-md px-4 py-3 ${
                        tier.key === "complete"
                          ? "bg-white/10 text-white/75"
                          : "bg-[#fff4eb] text-[#5f5f66]"
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/industries"
                  className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 py-3 text-sm font-black transition ${
                    tier.key === "complete"
                      ? "bg-[#ff6a00] text-white hover:bg-[#d95400]"
                      : "bg-[#111111] text-white hover:bg-[#2b2b2b]"
                  }`}
                >
                  Choose an industry
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Trust
            </p>
            <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
              Serious templates for serious small-business admin.
            </h2>
            <div className="mt-8 grid gap-3">
              <div className="rounded-md border border-black/10 bg-white px-4 py-4 shadow-sm">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#5f5f66]">
                  Secure checkout powered by
                </p>
                <PayfastLogo className="h-10 w-auto" />
              </div>
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-black text-[#111111] shadow-sm"
                >
                  <span className="h-3 w-3 rounded-full bg-[#ff6a00]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md bg-[#f6f4f1] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Quick wins
            </p>
            <h3 className="mt-3 text-2xl font-black">
              Popular single templates
            </h3>
            <div className="mt-6 grid gap-3">
              {featuredDocuments.map((document) => (
                <div
                  key={document.slug}
                  className="flex items-center justify-between gap-4 rounded-md bg-white px-4 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-black text-[#111111]">{document.name}</p>
                    <p className="mt-1 text-xs font-bold tracking-[0.08em] text-[#ff6a00]">
                      {formatFileFormats(document.fileFormats)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-[#111111]">
                      {formatPrice(document.priceCents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-24 border-y border-black/10 bg-[#fff4eb] py-12 lg:py-20"
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
              Clear answers before you buy.
            </h2>
          </div>
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6"
              >
                <h3 className="font-black text-[#111111]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] px-5 py-12 text-white sm:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
            Ready to upgrade your admin documents?
          </p>
          <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-5xl">
            Start with a professional template pack today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/65">
            Pick an industry, choose your package level, and get editable
            documents that help your business look organised from the first
            customer touchpoint.
          </p>
          <p className="mt-5 text-sm font-bold text-white/70">
            Need help? Email{" "}
            <a
              href="mailto:support@dokkit.co.za"
              className="text-[#ffb06f] underline decoration-[#ff6a00]/50 underline-offset-4 hover:text-white"
            >
              support@dokkit.co.za
            </a>
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/industries"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ff6a00] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#d95400]"
            >
              Browse Industry Packs
            </Link>
            <Link
              href="/single-documents"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:border-[#ff6a00]"
            >
              View Single Templates
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
