"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PreviewProtectionOverlay } from "@/components/preview-protection-overlay";

export function SingleDocumentPreview({
  imageSrc,
  name,
  compactOnMobile = false,
}: {
  imageSrc: string;
  name: string;
  compactOnMobile?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  function closePreview() {
    setIsVisible(false);
    setIsMounted(false);
  }

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsVisible(false);
        setIsMounted(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const modal = isMounted ? (
    <div
      className={`fixed inset-0 z-50 isolate flex transform-gpu items-center justify-center overscroll-contain bg-black/80 px-4 py-6 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-[0.001]"
      }`}
      role={isVisible ? "dialog" : undefined}
      aria-modal={isVisible ? "true" : undefined}
      aria-hidden={!isVisible}
      aria-label={`${name} preview`}
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) {
          closePreview();
        }
      }}
    >
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6a00]">
              Document preview
            </p>
            <h2 className="mt-1 text-lg font-black text-[#111111]">{name}</h2>
          </div>
          <button
            type="button"
            onClick={closePreview}
            className="inline-flex min-h-11 items-center rounded-md border border-black/10 px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto overscroll-contain bg-[#f6f4f1] p-4">
          <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-sm">
            <Image
              src={imageSrc}
              alt={`${name} preview`}
              width={1100}
              height={1420}
              sizes="(min-width: 1024px) 768px, 95vw"
              className="h-auto w-full"
            />
            <PreviewProtectionOverlay variant="full" />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMounted(true)}
        className={`group relative block aspect-[3/4] w-full overflow-hidden rounded-md border border-black/10 bg-[#fff4eb] text-left shadow-sm transition hover:border-[#ff6a00] ${
          compactOnMobile ? "p-1.5 md:mb-5 md:p-3" : "mb-5 p-3"
        }`}
        aria-label={`Preview ${name}`}
      >
        <span className="relative block h-full overflow-hidden rounded-md bg-white shadow-sm">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes={
              compactOnMobile
                ? "(min-width: 1280px) 360px, (min-width: 768px) 50vw, 108px"
                : "(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
            }
            className="object-contain object-top"
          />
          <PreviewProtectionOverlay compactOnMobile={compactOnMobile} />
        </span>
        <span
          className={`absolute z-20 rounded-md bg-[#111111] font-black uppercase text-white shadow-lg transition group-hover:bg-[#ff6a00] ${
            compactOnMobile
              ? "bottom-7 right-2 px-2 py-1 text-[10px] md:bottom-10 md:right-6 md:px-4 md:py-2 md:text-xs md:tracking-[0.12em]"
              : "bottom-10 right-6 px-4 py-2 text-xs tracking-[0.12em]"
          }`}
        >
          Preview
        </span>
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
