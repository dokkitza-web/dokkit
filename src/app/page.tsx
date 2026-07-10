import Link from "next/link";
import {
  VAT_INCLUDED_LABEL,
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
  getCatalogueIndustries,
  getCataloguePackageTiers,
  getCatalogueSingleDocuments,
} from "@/lib/supabase/catalogue";

export const revalidate = 300;

const preferredIndustrySlugs = [
  "beauty-salons-and-spas",
  "catering-and-baking",
  "cleaning-services",
  "construction-subcontractors",
  "freelancers-consultants",
  "landscaping-garden-services",
  "safety-security",
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

const benefits = [
  {
    title: "Save admin time",
    copy: "Start from a structured document instead of building quotes, trackers, and forms from a blank page.",
  },
  {
    title: "Look more professional",
    copy: "Give customers cleaner documents with consistent wording, headings, sections, and sign-off areas.",
  },
  {
    title: "Industry-specific wording",
    copy: "Use packs shaped around common small-business workflows, not generic office templates.",
  },
  {
    title: "Editable in Word and Excel",
    copy: "Word templates and Excel workbooks are designed for practical editing and reuse.",
  },
  {
    title: "Built for South Africa",
    copy: "Clear, business-friendly templates for local operators, freelancers, service providers, and teams.",
  },
  {
    title: "Easy to customise",
    copy: "Add your logo, pricing, customer details, scope, terms, and operating notes.",
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

function getFeaturedIndustries(
  industries: Awaited<ReturnType<typeof getCatalogueIndustries>>,
) {
  const industryBySlug = new Map(
    industries.map((industry) => [industry.slug, industry]),
  );

  return preferredIndustrySlugs
    .map((slug) => industryBySlug.get(slug))
    .filter((industry): industry is (typeof industries)[number] =>
      Boolean(industry),
    );
}

export default async function Home() {
  const [industries, packageTiers, singleDocuments] = await Promise.all([
    getCatalogueIndustries(),
    getCataloguePackageTiers(),
    getCatalogueSingleDocuments(),
  ]);
  const featuredIndustries = getFeaturedIndustries(industries);
  const featuredDocuments = singleDocuments.slice(0, 6);

  return (
    <>
      <section className="overflow-hidden bg-[linear-gradient(135deg,#fffaf5_0%,#ffffff_45%,#fff0e3_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[#ffcfaa] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d95400] shadow-sm">
              South African business templates
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-[#111111] sm:text-6xl lg:text-7xl">
              Professional business templates built for small businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5f66]">
              DokKit gives you editable Word templates and Excel workbooks for
              quoting, invoicing, tracking, onboarding, operations, and everyday
              business admin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/single-documents"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-[#ff6a00]/25 transition hover:-translate-y-0.5 hover:bg-[#d95400]"
              >
                Browse Templates
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-black text-[#111111] shadow-sm transition hover:-translate-y-0.5 hover:border-[#ff6a00] hover:text-[#ff6a00]"
              >
                View How It Works
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                [industries.length.toString(), "ready industries"],
                ["Word", "editable templates"],
                ["PayFast", "secure checkout"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-3xl font-black text-[#111111]">{value}</p>
                  <p className="mt-1 text-sm font-bold text-[#5f5f66]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <ProductMockup />
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-[2rem] bg-[#111111] p-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
              The problem
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              Admin documents take too long to create from scratch.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Small businesses often use inconsistent formatting, old files,
              missing terms, and scattered spreadsheets because there is no
              simple document starting point.
            </p>
          </div>
          <div className="rounded-[2rem] border border-black/10 bg-[#fff4eb] p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d95400]">
              The solution
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              Ready-to-edit packs shaped around how real businesses operate.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
              Choose an industry pack or single document, add it to your cart,
              pay securely, and download templates you can customise.
            </p>
          </div>
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              The outcome
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              Cleaner documents, faster setup, stronger customer confidence.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
              Spend less time formatting and more time quoting, delivering,
              tracking, and managing the work.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#f6f4f1] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
                Product categories
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-[#111111]">
                Industry packs for the admin work your business already does.
              </h2>
            </div>
            <Link
              href="/industries"
              className="font-black text-[#ff6a00] hover:text-[#d95400]"
            >
              See all industries
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ff6a00] hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-sm font-black text-white group-hover:bg-[#ff6a00]">
                  {industry.rank.toString().padStart(2, "0")}
                </div>
                <h3 className="text-lg font-black text-[#111111]">
                  {industry.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                  {industry.summary}
                </p>
                <p className="mt-5 text-sm font-black text-[#ff6a00]">
                  Compare packages
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Document previews
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Practical templates that look like proper business documents.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {documentPreviews.map((preview) => (
              <DocumentPreviewCard
                key={preview.title}
                title={preview.title}
                industry={preview.industry}
                format={preview.format}
                imageSrc={preview.imageSrc}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
                Benefits
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">
                Built to help owners move faster and look sharper.
              </h2>
              <p className="mt-5 text-sm leading-6 text-white/65">
                DokKit is practical by design: simple files, clear structure,
                and business-focused wording you can customise quickly.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-black">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {benefit.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Simple package options for different business stages.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packageTiers.map((tier) => (
              <article
                key={tier.key}
                className={`relative rounded-[2rem] border p-7 shadow-sm ${
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
                  className={`mt-1 text-xs font-black uppercase tracking-[0.14em] ${
                    tier.key === "complete" ? "text-[#ffb06f]" : "text-[#d95400]"
                  }`}
                >
                  {VAT_INCLUDED_LABEL}
                </p>
                <p
                  className={`mt-2 text-sm ${
                    tier.key === "complete" ? "text-white/60" : "text-[#5f5f66]"
                  }`}
                >
                  {formatDocumentRange(tier.key)} Word documents,{" "}
                  {tier.workbookCount} Excel workbook / PDF coming soon
                </p>
                <ul className="mt-7 grid gap-3 text-sm font-bold">
                  {tier.includes.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className={`rounded-2xl px-4 py-3 ${
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
                  className={`mt-7 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-black transition ${
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

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Trust
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Serious templates for serious small-business admin.
            </h2>
            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-sm">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#5f5f66]">
                  Secure checkout powered by
                </p>
                <PayfastLogo className="h-10 w-auto" />
              </div>
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-[#111111] shadow-sm"
                >
                  <span className="h-3 w-3 rounded-full bg-[#ff6a00]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#f6f4f1] p-6">
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
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-black text-[#111111]">{document.name}</p>
                    <p className="mt-1 text-xs font-bold tracking-[0.08em] text-[#ff6a00]">
                      {formatFileFormats(document.fileFormats)} / PDF coming
                      soon
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-[#111111]">
                      {formatPrice(document.priceCents)}
                    </p>
                    <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#d95400]">
                      {VAT_INCLUDED_LABEL}
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
        className="scroll-mt-24 border-y border-black/10 bg-[#fff4eb] py-16 lg:py-20"
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              FAQ
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Clear answers before you buy.
            </h2>
          </div>
          <div className="mt-10 grid gap-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm"
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

      <section className="bg-[#111111] px-6 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
            Ready to upgrade your admin documents?
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
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
              className="rounded-full bg-[#ff6a00] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#d95400]"
            >
              Browse Industry Packs
            </Link>
            <Link
              href="/single-documents"
              className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:border-[#ff6a00]"
            >
              View Single Templates
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
