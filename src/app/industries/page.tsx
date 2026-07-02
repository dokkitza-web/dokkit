import Link from "next/link";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { industries, isIndustryAvailable } from "@/data/catalogue";
import { documentPreviews } from "@/data/document-previews";

export const metadata = {
  title: "Industries | DokKit",
  description: "Browse DokKit document template packages by industry.",
};

export default function IndustriesPage() {
  const availableIndustries = industries.filter((industry) =>
    isIndustryAvailable(industry.slug),
  );

  return (
    <>
      <section className="border-b border-[#eadfd4] bg-white px-6 py-14 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-[#f26a21]">
              Document packs
            </p>
            <h1 className="mt-3 text-4xl font-bold text-[#111111]">
              Current available industries
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
              Start with the rebuilt DokKit launch packs. These are the
              business template packs currently ready for customers.
            </p>
          </div>
          <div className="rounded-xl border border-[#eadfd4] bg-[#fbf8f5] px-5 py-4 text-sm">
            <p className="font-bold text-[#111111]">
              {availableIndustries.length} live industries
            </p>
            <p className="mt-1 text-[#6f6a64]">
              Fresh rebuild from the READY folder
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {availableIndustries.map((industry, index) => (
            <article
              key={industry.slug}
              className="flex min-h-full flex-col rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
            >
              <span className="w-fit rounded-md bg-[#fff3ea] px-3 py-1 text-xs font-bold uppercase text-[#a94710]">
                Available
              </span>
              <h2 className="mt-4 text-xl font-bold text-[#111111]">
                {industry.name}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#5f5a54]">
                {industry.summary}
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  href={`/industries/${industry.slug}`}
                  className="inline-flex items-center justify-center rounded-md bg-[#111111] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2a2a2a]"
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
    </>
  );
}
