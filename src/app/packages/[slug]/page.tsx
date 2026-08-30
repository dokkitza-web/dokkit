import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FileFormatIcon } from "@/components/file-format-icon";
import { ProductInformationBox } from "@/components/product-information-box";
import {
  formatPrice,
  getTradePackBySlug,
  tradePacks,
} from "@/data/trade-packs";

type PackPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tradePacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = getTradePackBySlug(slug);

  if (!pack) {
    return {};
  }

  return {
    title: `${pack.name} | DokKit`,
    description: pack.description,
    alternates: { canonical: `/packages/${pack.slug}` },
  };
}

export default async function TradePackDetailsPage({ params }: PackPageProps) {
  const { slug } = await params;
  const pack = getTradePackBySlug(slug);

  if (!pack) {
    notFound();
  }

  return (
    <>
      <section className="bg-white py-10 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Link href="/packages" className="inline-flex min-h-11 items-center text-sm font-black text-[#005f73] underline underline-offset-4 transition hover:text-[#a63d00]">← Back to trade admin packs</Link>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a63d00]">{pack.trade}</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-[#111111] sm:text-5xl">{pack.name}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#5f5f66] sm:text-lg sm:leading-8">{pack.description}</p>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-[#5f5f66]">{pack.workflowSummary}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-[#f6f4f1] p-5 lg:min-w-60">
              <p className="text-2xl font-black text-[#111111]">{formatPrice(pack.priceCents)} once-off</p>
              <p className="mt-2 text-sm leading-6 text-[#5f5f66]">One business licence. No monthly subscription.</p>
              <AddToCartButton className="mt-5 w-full !rounded-lg !bg-[#ff6600] !shadow-none hover:!bg-[#e65a00]" item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#fff4eb] py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a63d00]">Exact pack contents</p>
          <h2 className="mt-3 text-3xl font-black text-[#111111]">Editable customer documents and admin tools</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <article className="rounded-xl border border-black/10 bg-white p-6">
              <div className="flex items-center gap-3"><FileFormatIcon format="Word" size="sm" /><h3 className="text-lg font-black">{pack.documentCount} editable Word documents</h3></div>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#3f3f43]">
                {pack.editableDocuments.map((document) => <li key={document} className="flex gap-3"><span aria-hidden="true" className="font-black text-[#ff6a00]">✓</span><span>{document}</span></li>)}
              </ul>
            </article>
            <div className="grid gap-5">
              <article className="rounded-xl border border-black/10 bg-white p-6"><div className="flex items-center gap-3"><FileFormatIcon format="Excel" size="sm" /><h3 className="text-lg font-black">{pack.workbookCount} Excel admin workbook</h3></div><p className="mt-4 text-sm leading-6 text-[#5f5f66]">{pack.workbookPurpose}</p><p className="mt-4 text-sm font-bold text-[#111111]">Sheets: {pack.workbookSheets.join(", ")}.</p></article>
              <article className="rounded-xl border border-black/10 bg-white p-6"><div className="flex items-center gap-3"><FileFormatIcon format="PDF" size="sm" /><h3 className="text-lg font-black">PDF guidance and previews</h3></div><p className="mt-4 text-sm leading-6 text-[#5f5f66]">The pack includes a read-me guide and {pack.pdfCount - 1} print-ready PDF preview{pack.pdfCount - 1 === 1 ? "" : "s"} of the editable documents. These support the editable files; they are not additional unique templates.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <ProductInformationBox />
        </div>
      </section>
    </>
  );
}
