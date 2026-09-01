"use client";

import Link from "next/link";
import { useState } from "react";
import { TradePackSamplePreview } from "@/components/trade-pack-sample-preview";
import { type TradePack } from "@/data/trade-packs";

type HomepagePreviewPack = Pick<
  TradePack,
  "slug" | "name" | "trade" | "description" | "priceCents" | "samples"
>;

export function HomepageTradePackPreviews({ packs }: { packs: HomepagePreviewPack[] }) {
  const [selectedSlug, setSelectedSlug] = useState(packs[0]?.slug ?? "");
  const selectedPack = packs.find((pack) => pack.slug === selectedSlug) ?? packs[0];

  if (!selectedPack) {
    return null;
  }

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Choose a trade pack to preview"
        className="grid grid-cols-2 border border-black/15 bg-white lg:grid-cols-4"
      >
        {packs.map((pack) => {
          const isSelected = pack.slug === selectedPack.slug;

          return (
            <button
              key={pack.slug}
              id={`preview-tab-${pack.slug}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="homepage-preview-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedSlug(pack.slug)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                  return;
                }

                const tabs = Array.from(
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
                );
                const currentIndex = tabs.indexOf(event.currentTarget);
                const nextIndex = event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;

                event.preventDefault();
                tabs[nextIndex]?.focus();
                tabs[nextIndex]?.click();
              }}
              className={`min-h-14 border-b border-r border-black/15 px-3 py-3 text-sm font-black transition even:border-r-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6600] lg:border-b-0 lg:border-r lg:last:border-r-0 ${
                isSelected
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#3f3f43] hover:bg-[#fff4eb] hover:text-[#a63d00]"
              }`}
            >
              {pack.name}
            </button>
          );
        })}
      </div>

      <div
        id="homepage-preview-panel"
        role="tabpanel"
        aria-labelledby={`preview-tab-${selectedPack.slug}`}
        className="pt-8"
      >
        <div className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d00]">{selectedPack.trade}</p>
            <h3 className="mt-2 text-2xl font-black text-[#111111]">{selectedPack.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
              {selectedPack.samples.length} original files available to preview, including the workbook Start Here sheet.
            </p>
          </div>
          <Link
            href={`/packages/${selectedPack.slug}`}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-black text-[#005f73] underline underline-offset-4 transition hover:text-[#a63d00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6600]"
          >
            View full pack details <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-6">
          <TradePackSamplePreview pack={selectedPack} />
        </div>
      </div>
    </div>
  );
}
