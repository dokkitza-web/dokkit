import Link from "next/link";
import { industries } from "@/data/catalogue";

export const metadata = {
  title: "Industries | DokKit",
  description: "Browse DokKit document template packages by industry.",
};

export default function IndustriesPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Catalogue
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Industry packages
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#53615b]">
          Each industry has Starter, Professional, and Complete options with
          editable documents, workbooks, and PDF reference files.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {industries.map((industry) => (
          <Link
            key={industry.slug}
            href={`/industries/${industry.slug}`}
            className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#147d64]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#147d64]">
              MVS {industry.rank.toString().padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-xl font-semibold">{industry.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#53615b]">
              {industry.summary}
            </p>
            <p className="mt-5 text-sm font-semibold text-[#147d64]">
              Compare packages
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
