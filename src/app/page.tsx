import Link from "next/link";
import {
  featuredIndustries,
  formatPrice,
  packageTiers,
  singleDocuments,
} from "@/data/catalogue";

export default function Home() {
  return (
    <>
      <section className="border-b border-[#dfe7e2] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
              Launch catalogue for South African small businesses
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#101816] sm:text-6xl">
              Editable business document packs that help owners quote, invoice,
              track, and deliver professionally.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53615b]">
              DokKit packages include editable DOCX templates, XLSX workbooks,
              and PDF reference versions for practical small-business admin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/industries"
                className="inline-flex items-center justify-center rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f604d]"
              >
                Browse industries
              </Link>
              <Link
                href="/single-documents"
                className="inline-flex items-center justify-center rounded-md border border-[#b9c8c0] px-5 py-3 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
              >
                View single documents
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-[#dfe7e2] bg-[#f7f9f8] p-6">
            <div className="rounded-md bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#147d64]">
                Today&apos;s build target
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["15", "launch industries"],
                  ["45", "industry packages"],
                  ["20", "single upsells"],
                  ["3", "file formats"],
                ].map(([value, label]) => (
                  <div key={label} className="border-l-2 border-[#147d64] pl-4">
                    <dt className="text-3xl font-semibold text-[#101816]">
                      {value}
                    </dt>
                    <dd className="mt-1 text-sm text-[#53615b]">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-4 rounded-md border border-[#dfe7e2] bg-white p-5">
              <p className="text-sm font-semibold text-[#101816]">
                Core formats in every package
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[#53615b] sm:grid-cols-3">
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">DOCX</span>
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">XLSX</span>
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
              Minimum viable segments
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              First industries to launch
            </h2>
          </div>
          <Link
            href="/industries"
            className="text-sm font-semibold text-[#147d64] hover:text-[#0f604d]"
          >
            See all industries
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredIndustries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#147d64]"
            >
              <h3 className="text-lg font-semibold">{industry.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#53615b]">
                {industry.summary}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#147d64]">
                View packages
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#dfe7e2] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
            Package ladder
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Simple options for different business stages
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {packageTiers.map((tier) => (
              <article
                key={tier.key}
                className="rounded-lg border border-[#dfe7e2] p-6"
              >
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#53615b]">
                  {tier.summary}
                </p>
                <p className="mt-6 text-3xl font-semibold">
                  {formatPrice(tier.priceCents)}
                </p>
                <p className="mt-2 text-sm text-[#53615b]">
                  {tier.documentCount} documents, {tier.workbookCount} workbooks,
                  {tier.pdfCount} PDFs
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
              Upsells
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Single documents for quick wins
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#53615b]">
              These generic templates are ideal cart add-ons and standalone
              purchases for customers who need one document today.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {singleDocuments.slice(0, 8).map((doc) => (
              <div
                key={doc.slug}
                className="flex items-center justify-between rounded-md border border-[#dfe7e2] bg-white px-4 py-3"
              >
                <span className="text-sm font-medium">{doc.name}</span>
                <span className="text-sm font-semibold text-[#147d64]">
                  {formatPrice(doc.priceCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
