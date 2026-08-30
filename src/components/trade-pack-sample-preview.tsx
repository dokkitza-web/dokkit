"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FileFormatIcon } from "@/components/file-format-icon";
import { type TradePack, type TradePackSample } from "@/data/trade-packs";
import { trackSamplePreviewEvent } from "@/lib/analytics";

type SamplePack = Pick<TradePack, "slug" | "name" | "description" | "priceCents" | "samples">;

export function TradePackSamplePreview({ pack }: { pack: SamplePack }) {
  const [selectedSample, setSelectedSample] = useState<TradePackSample | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function openSample(sample: TradePackSample, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelectedSample(sample);
    trackSamplePreviewEvent("sample_preview_open", { productId: pack.slug, sampleId: sample.id });
    trackSamplePreviewEvent("sample_preview_product", { productId: pack.slug, sampleId: sample.id });
  }

  const closeSample = useCallback(() => {
    if (selectedSample) {
      trackSamplePreviewEvent("sample_preview_close", { productId: pack.slug, sampleId: selectedSample.id });
    }
    setSelectedSample(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [pack.slug, selectedSample]);

  useEffect(() => {
    if (!selectedSample) {
      return;
    }

    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSample();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSample, selectedSample]);

  const previewModal = selectedSample ? (
    <div
      className="fixed inset-0 z-50 isolate flex items-center justify-center bg-black/85 p-2 sm:p-4"
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) {
          closeSample();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-pack-sample-title"
        aria-describedby="trade-pack-sample-notice"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex min-h-16 items-start justify-between gap-3 border-b border-black/10 px-3 py-3 sm:items-center sm:px-5">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#c24100]">DokKit sample - evaluation only</p>
            <h2 id="trade-pack-sample-title" className="mt-1 truncate text-base font-black text-[#111111] sm:text-lg">{selectedSample.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeSample}
            aria-label="Close sample preview"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#111111] text-2xl font-bold text-white transition hover:bg-[#c24100] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6600]"
          >
            &times;
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-[#e9e7e3] p-3 sm:p-6">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-md bg-white shadow-lg">
            <Image
              src={selectedSample.previewImageSrc}
              alt={selectedSample.alt}
              width={1200}
              height={1550}
              sizes="(min-width: 1024px) 768px, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <div className="border-t border-black/10 bg-white px-3 py-3 sm:px-5">
          <p id="trade-pack-sample-notice" className="text-xs leading-5 text-[#5f5f66]">This is a watermarked sample. Editable files are included after purchase.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={closeSample} className="min-h-11 text-left text-sm font-black text-[#005f73] underline underline-offset-4 hover:text-[#a63d00]">Back to pack</button>
            <div
              onClick={() => trackSamplePreviewEvent("sample_preview_add_to_cart", { productId: pack.slug, sampleId: selectedSample.id })}
            >
              <AddToCartButton
                className="w-full !rounded-lg !bg-[#ff6600] !shadow-none hover:!bg-[#e65a00] sm:w-auto"
                item={{ slug: pack.slug, name: pack.name, priceCents: pack.priceCents, category: "industry_package", description: pack.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pack.samples.map((sample) => (
          <article key={sample.id} className="flex flex-col rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-md border border-black/10 bg-[#f6f4f1]">
              <Image src={sample.previewImageSrc} alt={sample.alt} width={1200} height={1550} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" className="h-auto w-full" />
            </div>
            <h3 className="mt-4 text-base font-black text-[#111111]">{sample.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f5f66]">{sample.description}</p>
            <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#3f3f43]"><FileFormatIcon format={sample.format} size="sm" /> Watermarked PNG preview</p>
            <button
              type="button"
              onClick={(event) => openSample(sample, event.currentTarget)}
              className="mt-auto pt-5 text-left text-sm font-black text-[#005f73] underline underline-offset-4 transition hover:text-[#a63d00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6600]"
              aria-label={`Preview ${sample.title} sample`}
            >
              Preview sample <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </div>
      {previewModal && typeof document !== "undefined" ? createPortal(previewModal, document.body) : null}
    </>
  );
}
