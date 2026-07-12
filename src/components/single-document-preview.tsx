"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function SingleDocumentPreview({
  imageSrc,
  name,
}: {
  imageSrc: string;
  name: string;
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
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6a00]">
              Document preview
            </p>
            <h2 className="mt-1 text-lg font-black text-[#111111]">{name}</h2>
          </div>
          <button
            type="button"
            onClick={closePreview}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto overscroll-contain bg-[#f6f4f1] p-4">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-sm">
            <Image
              src={imageSrc}
              alt={`${name} preview`}
              width={1100}
              height={1420}
              sizes="(min-width: 1024px) 768px, 95vw"
              className="h-auto w-full"
              unoptimized
            />
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
        className="group relative mb-5 block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#fff4eb] p-3 text-left shadow-sm transition hover:border-[#ff6a00]"
        aria-label={`Preview ${name}`}
      >
        <span className="relative block h-full overflow-hidden rounded-xl bg-white shadow-sm">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
            unoptimized
          />
        </span>
        <span className="absolute bottom-6 right-6 rounded-full bg-[#111111] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg transition group-hover:bg-[#ff6a00]">
          Preview
        </span>
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
