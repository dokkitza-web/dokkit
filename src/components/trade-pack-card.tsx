import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductInformationBox } from "@/components/product-information-box";
import { formatPrice, type TradePack } from "@/data/trade-packs";

const fileTypeIcons = {
  document: "/brand/microsoft-word.svg",
  workbook: "/brand/microsoft-excel.svg",
  pdf: "/brand/pdf-document.svg",
} as const;

function FileStat({ type, count, label }: { type: keyof typeof fileTypeIcons; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#111111]" aria-label={`${count} ${label}`}>
      <Image aria-hidden="true" src={fileTypeIcons[type]} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
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
