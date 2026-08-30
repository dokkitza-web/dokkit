import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductInformationBox } from "@/components/product-information-box";
import { formatPrice, type TradePack } from "@/data/trade-packs";

function FileTypeIcon({ type }: { type: "document" | "workbook" | "pdf" }) {
  if (type === "workbook") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" focusable="false">
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 10h18M9 4v16M15 4v16" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" focusable="false">
      <path d="M14 3.5H6.5A1.5 1.5 0 0 0 5 5v14a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5z" />
      <path d="M14 3.5v5h5" />
      {type === "pdf" ? <path d="M8 16h8M8 13h5" /> : <><path d="M8 13h8M8 16h6" /></>}
    </svg>
  );
}

function FileStat({ type, count, label }: { type: "document" | "workbook" | "pdf"; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#111111]" aria-label={`${count} ${label}`}>
      <span className="text-[#77777d]"><FileTypeIcon type={type} /></span>
      <span className="text-sm font-medium">{count}</span>
    </span>
  );
}

export function TradePackCard({ pack, detailed = false }: { pack: TradePack; detailed?: boolean }) {
  return (
    <article id={pack.slug} className="scroll-mt-24 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d00]">Trade starter pack · {pack.version}</p>
          <h2 className="mt-2 text-base font-medium text-[#111111]">{pack.name}</h2>
        </div>
        <p className="shrink-0 rounded-md bg-[#0b0b0b] px-3 py-1 text-sm font-medium text-white">{formatPrice(pack.priceCents)}</p>
      </div>
      <p className="mt-4 text-[13px] leading-[1.5] text-[#5f5f66]">{pack.description}</p>
      <div className="mt-6 flex items-center gap-4" aria-label="Included file counts">
        <FileStat type="document" count={pack.documentCount} label="editable Word documents" />
        <FileStat type="workbook" count={pack.workbookCount} label="Excel workbooks" />
        <FileStat type="pdf" count={pack.pdfCount} label="PDF files" />
      </div>
      <AddToCartButton className="mt-6 w-full !rounded-lg !bg-[#ff6600] !px-4 !py-3 !text-sm !font-medium !shadow-none hover:!bg-[#e65a00]" item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }} />
      {detailed ? <ProductInformationBox className="mt-6" /> : null}
    </article>
  );
}
