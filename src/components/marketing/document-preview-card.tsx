"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function DocumentPreviewCard({
  title,
  industry,
  format,
  imageSrc,
}: {
  title: string;
  industry: string;
  format: string;
  imageSrc: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function openPreview() {
    setZoom(1);
    setIsOpen(true);
  }

  function closePreview() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function changeZoom(amount: number) {
    setZoom((currentZoom) => clampZoom(currentZoom + amount));
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePreview();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeZoom(ZOOM_STEP);
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        changeZoom(-ZOOM_STEP);
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        setZoom(1);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<
        HTMLButtonElement
      >("button:not(:disabled)");

      if (!focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "PageUp") {
      event.preventDefault();
      changeZoom(ZOOM_STEP);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      changeZoom(-ZOOM_STEP);
    }
  }

  const modal = isOpen ? (
    <div
      className="fixed inset-0 z-50 isolate flex items-center justify-center bg-black/85 p-2 sm:p-4"
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) {
          closePreview();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        onKeyDown={handleDialogKeyDown}
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-md bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex min-h-16 flex-col items-stretch justify-between gap-2 border-b border-black/10 px-3 py-2 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#c24100]">
              Document preview
            </p>
            <h2
              id="document-preview-title"
              className="mt-0.5 truncate text-sm font-black text-[#111111] sm:text-lg"
            >
              {title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              title="Zoom out"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-35"
            >
              &minus;
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
              title="Reset zoom"
              className="flex h-11 min-w-14 items-center justify-center rounded-md border border-black/10 px-2 text-xs font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#c24100]"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              title="Zoom in"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-35"
            >
              +
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closePreview}
              aria-label="Close preview"
              title="Close preview"
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-md bg-[#111111] text-2xl font-bold text-white transition hover:bg-[#c24100]"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto overscroll-contain bg-[#e9e7e3] p-3 sm:p-6">
          <div className="flex min-h-full min-w-full items-start justify-center">
            <div
              className="flex-none overflow-hidden rounded-md bg-white shadow-lg"
              style={{
                width: `${zoom * 100}%`,
                maxWidth: `${zoom * 48}rem`,
              }}
            >
              <Image
                src={imageSrc}
                alt={`${title} document preview for ${industry}`}
                width={1200}
                height={1600}
                sizes="(min-width: 1024px) 768px, 100vw"
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className="rounded-md border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-4">
        <button
          ref={triggerRef}
          type="button"
          onClick={openPreview}
          aria-label={`Enlarge ${title} preview`}
          className="group block w-full text-left outline-none"
        >
          <span className="relative block aspect-[3/4] overflow-hidden rounded-md border border-black/10 bg-[#f6f4f1] transition group-hover:border-[#ff6a00] group-focus-visible:ring-2 group-focus-visible:ring-[#ff6a00] group-focus-visible:ring-offset-2">
            <Image
              src={imageSrc}
              alt={`${title} document preview for ${industry}`}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className="object-contain object-top transition duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute left-3 top-3 rounded-full bg-[#111111] px-3 py-1 text-[11px] font-black tracking-[0.08em] text-white shadow-sm">
              {format}
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-md bg-[#111111] text-xl font-black text-white shadow-lg transition group-hover:bg-[#ff6a00] group-hover:text-[#111111]"
            >
              +
            </span>
          </span>
          <span className="mt-4 block text-sm font-black text-[#111111]">
            {title}
          </span>
          <span className="mt-1 block text-xs font-bold leading-5 text-[#5f5f66]">
            {industry}
          </span>
        </button>
      </article>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
