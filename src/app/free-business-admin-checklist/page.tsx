import type { Metadata } from "next";
import Link from "next/link";
import { FreeChecklistDownloadForm } from "@/components/free-checklist-download-form";
import { FreeChecklistPreview } from "@/components/free-checklist-preview";

export const metadata: Metadata = {
  title:
    "Free Small-Business Administration Readiness Checklist | DokKit",
  description:
    "Download DokKit's free six-page administration readiness checklist for South African small businesses as a fillable PDF or editable Word document.",
  alternates: {
    canonical: "/free-business-admin-checklist",
  },
  openGraph: {
    title: "Free Small-Business Administration Readiness Checklist",
    description:
      "Find the admin gaps that cost time, weaken cash flow and make a growing business harder to control.",
    url: "/free-business-admin-checklist",
    type: "website",
  },
};

const coverage = [
  "Business identity and statutory records",
  "Pricing, quotations and invoicing",
  "Customer, order and agreement records",
  "Income, expenses and payment control",
  "Daily operations and quality control",
  "Staff and contractor administration",
  "POPIA, records and information security",
  "Weekly and monthly admin discipline",
];

export default function FreeBusinessAdminChecklistPage() {
  return (
    <>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.86fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase text-[#a63d00] sm:text-sm">
              Free South African SME resource
            </p>
            <h1 className="mt-3 max-w-4xl text-[2.25rem] font-black leading-[1.04] text-[#111111] sm:mt-4 sm:text-6xl sm:leading-[1.02]">
              Small-Business Administration Readiness Checklist
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4f4f55] sm:text-lg sm:leading-8">
              Find the administrative gaps that cost time, weaken cash flow and
              make a growing business harder to control. Score what is working,
              identify priority gaps and turn the result into a practical
              30-day action plan.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 text-sm font-bold text-[#333338] sm:flex sm:flex-wrap sm:gap-3">
              {["6 practical pages", "48 readiness checks", "Fillable PDF", "Editable Word file"].map(
                (item) => (
                  <span
                    key={item}
                    className="flex min-h-11 items-center rounded-md border border-black/10 bg-[#f6f4f1] px-3 py-2"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            <a
              href="#preview"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md border border-black/20 bg-white px-5 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]"
            >
              Preview all 6 pages first
            </a>
            <p className="mt-4 text-sm font-bold text-[#5f5f66]">
              Free download. No checkout or subscription.
            </p>
          </div>
          <FreeChecklistDownloadForm />
        </div>
      </section>

      <section id="preview" className="scroll-mt-24 bg-[#f6f4f1] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase text-[#a63d00]">
              Real document preview
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#111111] sm:text-4xl">
              Inspect every page before downloading.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5f5f66]">
              The preview below is rendered from the actual fillable PDF. Open
              any page and use the zoom controls to read the checklist in
              detail.
            </p>
          </div>
          <div className="mt-8 lg:mt-10">
            <FreeChecklistPreview />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase text-[#a63d00]">
              What it checks
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Eight areas that keep everyday admin under control.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5f5f66]">
              Answer Yes, Partly, No or N/A based on evidence you can produce
              today. The score helps you see where stronger routines and
              documents will make the biggest difference.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {coverage.map((item, index) => (
              <div
                key={item}
                className="flex min-h-20 items-start gap-3 rounded-md border border-black/10 bg-white p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#fff0e3] text-sm font-black text-[#a63d00]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-black leading-6 text-[#111111]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-12 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase text-[#ffb77a]">
            From assessment to action
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
            Use the checklist in three practical steps.
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              [
                "1",
                "Complete the assessment",
                "Work through all 48 statements and answer from the records and routines that exist now.",
              ],
              [
                "2",
                "Score the result",
                "Calculate the readiness percentage and flag serious gaps that need attention regardless of the score.",
              ],
              [
                "3",
                "Build the 30-day plan",
                "Assign the five most important actions to an owner, add due dates and review progress after 30 days.",
              ],
            ].map(([number, heading, copy]) => (
              <li key={number} className="border-t border-white/20 pt-5">
                <span className="text-4xl font-black text-[#ffb77a]">
                  {number}
                </span>
                <h3 className="mt-4 text-xl font-black">{heading}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#fff4eb] py-12 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase text-[#a63d00]">
              Free partner resource
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Business-support programmes may share it unchanged.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#5f5f66]">
              SME-support partners may share the checklist unchanged and in
              full, free of charge, with their beneficiaries. It may not be
              sold, rebranded, altered or included in a paid product without
              DokKit&apos;s written permission.
            </p>
          </div>
          <a
            href="#download-form"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#c24100] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412]"
          >
            Complete the form to download
          </a>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-black sm:text-4xl">
            Ready to close the gaps the checklist finds?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f5f66]">
            Browse DokKit&apos;s editable Word templates and Excel workbooks
            for practical South African small-business administration.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/industries"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#111111] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c24100]"
            >
              Choose your industry
            </Link>
            <Link
              href="/single-documents"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-black/20 bg-white px-6 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]"
            >
              Preview individual templates
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
