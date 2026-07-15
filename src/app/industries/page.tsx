import Link from "next/link";
import { getCatalogueIndustries } from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Industries | DokKit",
  description:
    "Browse DokKit Word template and Excel workbook packages by industry.",
};

export const revalidate = 300;

export default async function IndustriesPage() {
  const industries = await getCatalogueIndustries();

  return (
    <section className="bg-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Catalogue
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-[#111111]">
          Industry packages
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5f66]">
          Choose from editable Word document and Excel workbook packages built
          for practical South African small-business administration. Available
          package levels vary by category, and PDF versions are coming soon.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {industries.map((industry) => (
          <Link
            key={industry.slug}
            href={`/industries/${industry.slug}`}
            className="group rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#ff6a00] hover:shadow-xl"
          >
            <p className="w-fit rounded-full bg-[#111111] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white group-hover:bg-[#ff6a00]">
              Category {industry.rank.toString().padStart(2, "0")}
            </p>
            <h2 className="mt-5 text-xl font-black">{industry.name}</h2>
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
  );
}
