import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductInformationBox } from "@/components/product-information-box";
import { formatPrice, type TradePack } from "@/data/trade-packs";

export function TradePackCard({ pack, detailed = false }: { pack: TradePack; detailed?: boolean }) {
  return (
    <article id={pack.slug} className="scroll-mt-24 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 bg-[#fff4eb] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d00]">Trade starter pack · {pack.version}</p><h2 className="mt-2 text-2xl font-black text-[#111111]">{pack.name}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5f66]">{pack.description}</p></div>
          <p className="w-fit shrink-0 rounded-md bg-[#111111] px-4 py-2 text-lg font-black text-white">{formatPrice(pack.priceCents)}</p>
        </div>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d00]">What is included</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#3f3f43] sm:grid-cols-2">{pack.editableDocuments.map((document) => <li key={document} className="flex gap-2"><span aria-hidden="true" className="font-black text-[#ff6a00]">✓</span><span>{document} <strong>(editable Word)</strong></span></li>)}<li className="flex gap-2"><span aria-hidden="true" className="font-black text-[#ff6a00]">✓</span><span>Administration Workbook <strong>(editable Excel)</strong></span></li><li className="flex gap-2"><span aria-hidden="true" className="font-black text-[#ff6a00]">✓</span><span>Read-me guide, PDF previews and single-business licence</span></li></ul>
          {detailed ? <><p className="mt-5 text-sm font-black text-[#111111]">Workbook includes: {pack.workbookSheets.join(", ")}.</p><p className="mt-3 text-xs leading-5 text-[#5f5f66]">{pack.standardsNote}</p></> : null}
        </div>
        <div className="flex min-w-48 flex-col justify-between gap-4 rounded-lg bg-[#f6f4f1] p-4"><div className="text-xs font-bold leading-5 text-[#5f5f66]"><p>{pack.documentCount} editable Word document{pack.documentCount === 1 ? "" : "s"}</p><p>{pack.workbookCount} Excel admin workbook</p><p>PDF read-me and previews</p><p className="mt-2 font-black text-[#111111]">Pay once. No subscription.</p></div><AddToCartButton className="w-full" item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }} /></div>
      </div>
      {detailed ? <ProductInformationBox className="mx-5 mb-5 sm:mx-6 sm:mb-6" /> : null}
    </article>
  );
}
