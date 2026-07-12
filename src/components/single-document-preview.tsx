"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function SingleDocumentPreview({
  imageSrc,
  name,
}: {
  imageSrc: string;
  name: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  function preloadPreview() {
    if (!preloadRef.current) {
      const previewImage = new window.Image();
      previewImage.src = imageSrc;
      preloadRef.current = previewImage;
    }

    return preloadRef.current;
  }

  async function openPreview() {
    const previewImage = preloadPreview();
    setIsOpening(true);

    try {
      if (!previewImage.complete) {
        await previewImage.decode();
      }
    } catch {
      // The modal can still display the browser-loaded image if decode is unavailable.
    } finally {
      setIsOpening(false);
      setIsOpen(true);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => void openPreview()}
        onPointerEnter={preloadPreview}
        onFocus={preloadPreview}
        disabled={isOpening}
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
          />
        </span>
        <span className="absolute bottom-6 right-6 rounded-full bg-[#111111] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg transition group-hover:bg-[#ff6a00]">
          Preview
        </span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/80 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} preview`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsOpen(false);
            }
          }}
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6a00]">
                  Document preview
                </p>
                <h2 className="mt-1 text-lg font-black text-[#111111]">
                  {name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto bg-[#f6f4f1] p-4">
              <div className="relative mx-auto aspect-[1100/1420] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-sm">
                <Image
                  src={imageSrc}
                  alt={`${name} preview`}
                  fill
                  sizes="(min-width: 1024px) 768px, 95vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
