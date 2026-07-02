import Link from "next/link";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { PaymentMethods } from "@/components/payment-methods";
import { formatPrice, packageTiers } from "@/data/catalogue";
import { documentPreviews } from "@/data/document-previews";

export const metadata = {
  title: "Document packs | DokKit",
  description: "Compare DokKit Starter, Professional, and Complete packages.",
};

export default function PackagesPage() {
  return (
    <>
      <section className="border-b border-[#eadfd4] bg-white px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-[#f26a21]">
            Document Packs
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold text-[#111111]">
            Starter, Professional, and Complete packs for practical business
            admin.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5a54]">
            Every available industry uses the same simple package ladder, so
            customers can choose the amount of document support they need
            without confusion.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {packageTiers.map((tier, index) => (
            <article
              key={tier.key}
              className={`flex min-h-full flex-col rounded-xl border bg-white p-6 shadow-sm ${
                tier.key === "professional"
                  ? "border-[#f26a21] shadow-lg shadow-orange-950/10"
                  : "border-[#eadfd4]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#111111]">
                  {tier.name} Pack
                </h2>
                {tier.key === "professional" ? (
                  <span className="rounded-md bg-[#fff3ea] px-3 py-1 text-xs font-bold uppercase text-[#a94710]">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5f5a54]">
                {tier.summary}
              </p>
              <p className="mt-6 text-4xl font-bold text-[#111111]">
                {formatPrice(tier.priceCents)}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#f26a21]">
                {tier.bestFor}
              </p>

              <div className="mt-6 rounded-xl bg-[#fbf8f5] p-4 text-sm text-[#5f5a54]">
                <p className="font-bold text-[#111111]">
                  From {tier.documentCount} document files
                </p>
                <p className="mt-1">
                  Includes editable DOCX templates and XLSX workbook support.
                </p>
                <p className="mt-1 font-semibold text-[#a94710]">
                  PDF versions coming soon.
                </p>
              </div>

              <ul className="mt-6 grid flex-1 gap-3 text-sm text-[#5f5a54]">
                {tier.includes.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-[#eee4da] bg-white px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid gap-2">
                <Link
                  href="/industries"
                  className="inline-flex items-center justify-center rounded-md bg-[#f26a21] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d95816]"
                >
                  Buy This Pack
                </Link>
                <DocumentPreviewButton
                  preview={documentPreviews[index % documentPreviews.length]}
                  label="Preview Templates"
                />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <PaymentMethods />
        </div>
      </section>
    </>
  );
}
