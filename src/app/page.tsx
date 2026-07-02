import Image from "next/image";
import Link from "next/link";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { PaymentMethods } from "@/components/payment-methods";
import {
  featuredIndustries,
  formatPrice,
  packageTiers,
} from "@/data/catalogue";
import { documentPreviews } from "@/data/document-previews";

const includedDocuments = [
  "Business Profile Template",
  "Quotation Template",
  "Invoice Workbook",
  "Client Onboarding Form",
  "Terms and Conditions",
  "Completion Sign-off Form",
  "Income and Expense Tracker",
  "Customer CRM Tracker",
  "Job / Order Tracker",
  "Monthly Admin Checklist",
];

const whyBuyItems = [
  {
    title: "Secure payment",
    description: "PayFast support is included for South African online payment.",
  },
  {
    title: "Editable files",
    description: "Open and customise DOCX templates and XLSX workbooks.",
  },
  {
    title: "Local focus",
    description: "Designed around practical South African small-business admin.",
  },
  {
    title: "Preview first",
    description: "Open mock previews to understand the structure before buying.",
  },
  {
    title: "No subscription",
    description: "Buy a document pack once and adapt it for your business.",
  },
];

const comingSoonItems = [
  {
    title: "PDF Versions",
    description:
      "Prefer print-ready files? PDF versions of selected templates will be added soon.",
  },
  {
    title: "Single Document Downloads",
    description:
      "Need only one document? Soon you will be able to buy selected templates individually, including invoices, quotations, price lists, trackers, and client forms.",
  },
  {
    title: "Business Admin Add-ons",
    description:
      "Upgrade your pack with extra tools like monthly admin checklists, WhatsApp message templates, filing systems, and business trackers.",
  },
];

const faqs = [
  {
    question: "What file formats will I receive?",
    answer:
      "Current packs focus on editable DOCX templates and XLSX workbooks. PDF versions are marked as coming soon and are not sold yet.",
  },
  {
    question: "Can I edit the templates?",
    answer:
      "Yes. DokKit is built around editable files so you can add your logo, business details, pricing, wording, and customer information.",
  },
  {
    question: "Are single documents available?",
    answer:
      "Not yet. Single document downloads are shown as coming soon and do not have active checkout buttons.",
  },
  {
    question: "How do I choose the right pack?",
    answer:
      "Starter is for essentials, Professional is for stronger customer and admin control, and Complete is for the fuller document system.",
  },
];

function HeroShowcase() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-[#eadfd4] bg-[#111111] shadow-xl shadow-black/15">
      <Image
        src="/dokkit-hero-desk.png"
        alt="Laptop on a desk showing the DokKit website with printed business document templates beside it"
        width={1536}
        height={1024}
        priority
        sizes="(min-width: 1024px) 48vw, 100vw"
        className="h-[430px] w-full object-cover sm:h-[500px] lg:h-full"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {["DOCX", "XLSX", "PDF Coming Soon"].map((format) => (
            <span
              key={format}
              className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-black text-[#111111] shadow-sm"
            >
              {format}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-white/90">
          Real template previews, clean pack structure, and practical files for
          everyday business admin.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="border-b border-[#eadfd4] bg-[#fbf8f5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-black uppercase text-[#f26a21]">
              Ready-to-use
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] text-[#111111] sm:text-6xl">
              Business Document Packs for South African Small Businesses
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f4a45]">
              Editable Word and Excel templates to help you run your business
              professionally and save hours of admin time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/industries"
                className="inline-flex items-center justify-center rounded-md bg-[#f26a21] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#d95816]"
              >
                Browse Document Packs
              </Link>
              <Link
                href="#included"
                className="inline-flex items-center justify-center rounded-md border border-[#111111] px-6 py-3.5 text-sm font-black text-[#111111] transition hover:bg-[#111111] hover:text-white"
              >
                See What&apos;s Included
              </Link>
            </div>
            <div className="mt-7 grid gap-3 text-sm font-bold text-[#111111] sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Editable files",
                "Secure payment",
                "No subscription",
                "Preview before buying",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#eadfd4] bg-[#fbf8f5] px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <section className="bg-[#f7f4f0] px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#f26a21]">
              Problem solved
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#111111]">
              Stop recreating the same admin documents again and again.
            </h2>
          </div>
          <p className="text-lg leading-8 text-[#4f4a45]">
            DokKit gives you ready-made, editable templates so your quotations,
            invoices, client forms, trackers, terms, and checklists look
            professional from day one.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8" id="packs">
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#111111]">
            Choose Your Industry
          </h2>
          <p className="mt-2 text-base text-[#5f5a54]">
            Find the document pack that fits your business.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredIndustries.slice(0, 8).map((industry, index) => (
            <article
              key={industry.slug}
              className="flex min-h-full flex-col rounded-xl border border-[#eadfd4] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="rounded-lg bg-[#fbf8f5] p-4">
                <p className="text-xs font-black uppercase text-[#f26a21]">
                  Available pack
                </p>
                <h3 className="mt-3 min-h-14 text-lg font-black text-[#111111]">
                  {industry.name}
                </h3>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-[#5f5a54]">
                {industry.summary}
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  href={`/industries/${industry.slug}`}
                  className="inline-flex items-center justify-center rounded-md border border-[#f26a21] px-4 py-2.5 text-sm font-black text-[#f26a21] transition hover:bg-[#f26a21] hover:text-white"
                >
                  View Package
                </Link>
                <DocumentPreviewButton
                  preview={documentPreviews[index % documentPreviews.length]}
                  label="Preview"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="border-y border-[#eadfd4] bg-white px-5 py-14 lg:px-8"
        id="pricing"
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-2xl bg-[#fbf8f5] p-6">
            <h2 className="text-2xl font-black text-[#111111]">
              Choose Your Package
            </h2>
            <p className="mt-2 text-sm text-[#5f5a54]">
              Pick the pack that fits your business today.
            </p>
            <ul className="mt-6 grid gap-3 text-sm font-semibold text-[#4f4a45]">
              {[
                "Editable Word and Excel files",
                "Professionally designed templates",
                "Save time and stay organised",
                "For South African small businesses",
                "One-time payment. No subscriptions.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-[#f26a21]">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <PaymentMethods />
            </div>
          </aside>

          <div className="grid gap-4 lg:grid-cols-3">
            {packageTiers.map((tier, index) => (
              <article
                key={tier.key}
                className={`relative flex min-h-full flex-col rounded-xl border bg-white p-6 text-center shadow-sm ${
                  tier.key === "professional"
                    ? "border-[#f26a21] pt-10 shadow-lg shadow-orange-950/10"
                    : "border-[#eadfd4]"
                }`}
              >
                {tier.key === "professional" ? (
                  <span className="absolute inset-x-0 top-0 rounded-t-xl bg-[#f26a21] py-1.5 text-xs font-black uppercase text-white">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-2xl font-black text-[#111111]">
                  {tier.name}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#5f5a54]">
                  {tier.summary}
                </p>
                <p className="mt-5 text-4xl font-black text-[#111111]">
                  {formatPrice(tier.priceCents)}
                </p>
                <p className="mt-1 text-xs font-bold text-[#6f6a64]">
                  once-off
                </p>
                <p className="mt-4 text-sm font-semibold text-[#4f4a45]">
                  {tier.bestFor}
                </p>
                <p className="mt-4 text-sm text-[#5f5a54]">
                  Includes from {tier.documentCount} document files
                </p>
                <div className="mt-6 grid gap-2">
                  <Link
                    href="/industries"
                    className={`inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-black transition ${
                      tier.key === "professional"
                        ? "bg-[#f26a21] text-white hover:bg-[#d95816]"
                        : "border border-[#f26a21] text-[#f26a21] hover:bg-[#f26a21] hover:text-white"
                    }`}
                  >
                    View {tier.name} Pack
                  </Link>
                  <DocumentPreviewButton
                    preview={documentPreviews[index % documentPreviews.length]}
                    label="Preview Templates"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
        id="included"
      >
        <div>
          <h2 className="text-3xl font-black text-[#111111]">
            What&apos;s Included
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
            Each pack includes professionally designed templates such as:
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {includedDocuments.map((item) => (
              <div key={item} className="flex gap-3 text-sm font-semibold">
                <span className="text-[#f26a21]">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#111111]">
            Template Previews
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
            See examples of the templates you&apos;ll receive. PDF versions are
            marked as coming soon.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {documentPreviews.slice(0, 3).map((preview) => (
              <article
                key={preview.id}
                className="rounded-xl border border-[#eadfd4] bg-white p-4 shadow-sm"
              >
                <div className="h-28 rounded-lg border border-[#eadfd4] bg-[#fbf8f5] p-3">
                  <div className="h-2 w-20 rounded bg-[#f26a21]" />
                  <div className="mt-5 space-y-2">
                    <div className="h-2 rounded bg-[#ded7cf]" />
                    <div className="h-2 w-4/5 rounded bg-[#ded7cf]" />
                    <div className="h-2 w-3/5 rounded bg-[#ded7cf]" />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-black text-[#111111]">
                  {preview.title}
                </h3>
                <DocumentPreviewButton
                  preview={preview}
                  label="Open Preview"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[#111111] px-3 py-2 text-xs font-black text-[#111111] transition hover:bg-[#111111] hover:text-white"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#eadfd4] bg-white px-5 py-14 lg:px-8"
        id="how-it-works"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black text-[#111111]">
              How It Works
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
              Three simple steps to get your business organised.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Choose Your Industry", "Pick the document pack that matches your business."],
                ["2", "Select Your Package", "Choose Starter, Professional, or Complete."],
                ["3", "Edit Your Files", "Customise your editable templates for daily use."],
              ].map(([step, title, description]) => (
                <div key={step} className="rounded-xl bg-[#fbf8f5] p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f26a21] text-sm font-black text-white">
                    {step}
                  </span>
                  <h3 className="mt-4 text-base font-black text-[#111111]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f5a54]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-[#111111]">
              Why Buy From DokKit?
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {whyBuyItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
                >
                  <div className="h-2 w-10 rounded bg-[#f26a21]" />
                  <h3 className="mt-4 text-base font-black text-[#111111]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f5a54]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 className="text-3xl font-black text-[#111111]">Coming Soon</h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
            These products are planned, but they are not available for checkout
            yet.
          </p>
          <div className="mt-6 grid gap-4">
            {comingSoonItems.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-black uppercase text-[#f26a21]">
                  Coming Soon
                </p>
                <h3 className="mt-2 text-lg font-black text-[#111111]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5f5a54]">
                  {item.description}
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex cursor-not-allowed rounded-md bg-[#e5ddd5] px-4 py-2 text-sm font-black text-[#7b746d]"
                >
                  Coming Soon
                </button>
              </article>
            ))}
          </div>
        </div>

        <div id="faq">
          <h2 className="text-3xl font-black text-[#111111]">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 divide-y divide-[#eadfd4] rounded-xl border border-[#eadfd4] bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-[#111111]">
                  {faq.question}
                  <span className="text-[#f26a21] group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-2xl bg-[#111111] p-6 text-white shadow-xl lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-black">Ready to Get Organised?</h2>
            <p className="mt-2 text-sm leading-6 text-[#d8d1ca]">
              Choose your pack today and take control of your business admin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/industries"
              className="inline-flex items-center justify-center rounded-md bg-[#f26a21] px-6 py-3 text-sm font-black text-white transition hover:bg-[#d95816]"
            >
              Browse Document Packs
            </Link>
            <Link
              href="#included"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-black text-[#111111] transition hover:bg-[#f7f4f0]"
            >
              See What&apos;s Included
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
