import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductInformationBox } from "@/components/product-information-box";
import { formatPrice, type TradePack } from "@/data/trade-packs";

export function TradePackCard({ pack, detailed = false }: { pack: TradePack; detailed?: boolean }) {
  const keyDocuments = pack.editableDocuments.slice(0, 4);
  const remainingDocumentCount = pack.editableDocuments.length - keyDocuments.length;

  return (
    <article id={pack.slug} className="scroll-mt-24 flex h-full flex-col rounded-xl border border-black/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d00]">{pack.trade}</p>
          <h2 className="mt-2 text-lg font-black text-[#111111]"><Link href={`/packages/${pack.slug}`} className="transition hover:text-[#a63d00]">{pack.name}</Link></h2>
        </div>
        <p className="shrink-0 rounded-md bg-[#0b0b0b] px-3 py-1 text-sm font-medium text-white">{formatPrice(pack.priceCents)} once-off</p>
      </div>
      <p className="mt-4 text-[13px] leading-[1.5] text-[#5f5f66]">{pack.description}</p>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#77777d]">{pack.workflowSummary}</p>
      <div className="mt-5 border-t border-black/10 pt-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a63d00]">Key documents</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]">{keyDocuments.join(" · ")}{remainingDocumentCount > 0 ? ` · +${remainingDocumentCount} more` : ""}</p>
        <p className="mt-2 text-sm leading-6 text-[#5f5f66]">+ {pack.workbookPurpose}</p>
        <p className="mt-3 text-sm font-bold text-[#3f3f43]">{pack.documentCount} editable Word document{pack.documentCount === 1 ? "" : "s"} · {pack.workbookCount} Excel workbook{pack.workbookCount === 1 ? "" : "s"}</p>
        <p className="mt-1 text-xs font-semibold text-[#5f5f66]">PDF guidance and previews included</p>
      </div>
      <div className="mt-auto pt-6">
        <Link href={`/packages/${pack.slug}`} className="inline-flex min-h-11 items-center text-sm font-black text-[#005f73] underline underline-offset-4 transition hover:text-[#a63d00]">View pack details <span aria-hidden="true" className="ml-1">→</span></Link>
        <Link href={`/packages/${pack.slug}#preview-the-pack`} className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-[#005f73] underline underline-offset-4 transition hover:text-[#a63d00]">Preview samples <span aria-hidden="true" className="ml-1">→</span></Link>
        <AddToCartButton className="mt-3 w-full !rounded-lg !bg-[#ff6600] !px-4 !py-3 !text-sm !font-medium !shadow-none hover:!bg-[#e65a00]" item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }} />
      </div>
      {detailed ? <ProductInformationBox className="mt-6" /> : null}
    </article>
  );
}
