import Link from "next/link";
import { formatDocumentRange, formatPrice } from "@/data/catalogue";
import { getCataloguePackageTiers } from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Package comparison | DokKit",
  description: "Compare DokKit Starter, Professional, and Complete packages.",
};

export const revalidate = 300;

export default async function PackagesPage() {
  const packageTiers = await getCataloguePackageTiers();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Package comparison
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Starter, Professional, and Complete
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5f66]">
          Choose one clear package level across the ready industry packs.
          Exact DOCX counts vary by industry and are shown on each industry
          page.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {packageTiers.map((tier) => (
          <article
            key={tier.key}
            className={`relative rounded-[2rem] border p-7 shadow-sm ${
              tier.key === "complete"
                ? "border-[#ff6a00] bg-[#111111] text-white orange-glow"
                : "border-black/10 bg-white"
            }`}
          >
            {tier.key === "complete" ? (
              <span className="absolute right-5 top-5 rounded-full bg-[#ff6a00] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">
                Best value
              </span>
            ) : null}
            <h2 className="text-2xl font-black">{tier.name}</h2>
            <p
              className={`mt-3 text-sm leading-6 ${
                tier.key === "complete" ? "text-white/65" : "text-[#5f5f66]"
              }`}
            >
              {tier.summary}
            </p>
            <p className="mt-6 text-4xl font-black text-[#ff6a00]">
              {formatPrice(tier.priceCents)}
            </p>
            <p
              className={`mt-2 text-sm ${
                tier.key === "complete" ? "text-white/60" : "text-[#5f5f66]"
              }`}
            >
              {formatDocumentRange(tier.key)} DOCX, {tier.workbookCount} XLSX /
              PDF coming soon
            </p>
            <p
              className={`mt-2 text-sm ${
                tier.key === "complete" ? "text-white/60" : "text-[#5f5f66]"
              }`}
            >
              {tier.bestFor}
            </p>
            <ul className="mt-6 grid gap-3 text-sm font-bold">
              {tier.includes.map((item) => (
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
              <li
                className={`rounded-2xl px-4 py-3 ${
                  tier.key === "complete"
                    ? "bg-white/10 text-white/75"
                    : "bg-[#fff4eb] text-[#5f5f66]"
                }`}
              >
                PDF versions coming soon
              </li>
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
    </section>
  );
}
