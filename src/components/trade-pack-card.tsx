import { IconFileText, IconFileTypePdf, IconTable } from "@tabler/icons-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductInformationBox } from "@/components/product-information-box";
import { formatPrice, type TradePack } from "@/data/trade-packs";

export function TradePackCard({ pack, detailed = false }: { pack: TradePack; detailed?: boolean }) {
  const fileStats = [
    { label: "Word documents", count: pack.documentCount, Icon: IconFileText },
    { label: "Excel workbooks", count: pack.workbookCount, Icon: IconTable },
    { label: "PDF files", count: pack.pdfCount, Icon: IconFileTypePdf },
  ];

  return (
    <article id={pack.slug} className="scroll-mt-24 flex h-full flex-col rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--surface-2)] p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 text-base font-medium leading-6 text-[var(--text-primary)]">
          <Link href={`/packages/${pack.slug}`}>{pack.name}</Link>
        </h2>
        <p className="shrink-0 rounded-md bg-[#0b0b0b] px-3 py-1 text-sm font-medium text-white">{formatPrice(pack.priceCents)}</p>
      </div>
      <p className="mb-6 mt-4 text-[13px] leading-[1.5] text-[var(--text-secondary)]">{pack.description}</p>
      <div className="mb-6 mt-auto flex gap-4" aria-label="Included file counts">
        {fileStats.map(({ label, count, Icon }) => (
          <div key={label} className="flex items-center gap-2" title={label}>
            <Icon aria-hidden="true" className="size-[18px] text-[var(--text-muted)]" stroke={1.75} />
            <span className="sr-only">{label}: </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{count}</span>
          </div>
        ))}
      </div>
      <AddToCartButton className="w-full !rounded-[var(--radius)] !bg-[#ff6600] !px-4 !py-3 !text-sm !font-medium !shadow-none hover:!bg-[#e65a00]" item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }} />
      {detailed ? <ProductInformationBox className="mt-6" /> : null}
    </article>
  );
}
