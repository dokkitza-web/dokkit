"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const previewPages = Array.from(
  { length: 6 },
  (_, index) => `/images/free-checklist/page-${index + 1}.png`,
);

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function FreeChecklistPreview() {
  const [selectedPage, setSelectedPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function selectPage(index: number) {
    setSelectedPage(Math.min(previewPages.length - 1, Math.max(0, index)));
    setZoom(1);
  }

  function openPreview() {
    setZoom(1);
    setIsOpen(true);
  }

  function closePreview() {
    setIsOpen(false);
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
      } else if (event.key === "ArrowLeft") {
        selectPage(selectedPage - 1);
      } else if (event.key === "ArrowRight") {
        selectPage(selectedPage + 1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeZoom(ZOOM_STEP);
      } else if (event.key === "-") {
        event.preventDefault();
        changeZoom(-ZOOM_STEP);
      } else if (event.key === "0") {
        event.preventDefault();
        setZoom(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedPage]);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-checklist-preview-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-md bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex min-h-16 flex-col gap-2 border-b border-black/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3">
          <div>
            <p className="text-xs font-black uppercase text-[#c24100]">
              Free checklist preview
            </p>
            <h2
              id="free-checklist-preview-title"
              className="mt-1 text-sm font-black text-[#111111] sm:text-lg"
            >
              Page {selectedPage + 1} of {previewPages.length}
            </h2>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => selectPage(selectedPage - 1)}
              disabled={selectedPage === 0}
              aria-label="Previous page"
              title="Previous page"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-30"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => selectPage(selectedPage + 1)}
              disabled={selectedPage === previewPages.length - 1}
              aria-label="Next page"
              title="Next page"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-30"
            >
              &rarr;
            </button>
            <span className="mx-1 h-8 w-px bg-black/10" aria-hidden="true" />
            <button
              type="button"
              onClick={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              title="Zoom out"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-30"
            >
              &minus;
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
              title="Reset zoom"
              className="flex h-11 min-w-14 items-center justify-center rounded-md border border-black/10 px-2 text-xs font-black transition hover:border-[#ff6a00] hover:text-[#c24100]"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              title="Zoom in"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 text-xl font-black transition hover:border-[#ff6a00] hover:text-[#c24100] disabled:cursor-not-allowed disabled:opacity-30"
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
              className="relative flex-none overflow-hidden rounded-md bg-white shadow-xl"
              style={{
                width: `${zoom * 100}%`,
                maxWidth: `${zoom * 52}rem`,
              }}
            >
              <Image
                src={previewPages[selectedPage]}
                alt={`Small-Business Administration Readiness Checklist page ${selectedPage + 1}`}
                width={1058}
                height={1497}
                sizes="(min-width: 1024px) 832px, 100vw"
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-6">
        <button
          type="button"
          onClick={openPreview}
          className="group relative mx-auto block aspect-[210/297] w-full max-w-3xl overflow-hidden rounded-md border border-black/10 bg-white text-left shadow-lg transition hover:border-[#ff6a00] hover:shadow-xl"
          aria-label={`Enlarge checklist page ${selectedPage + 1}`}
        >
          <Image
            src={previewPages[selectedPage]}
            alt={`Small-Business Administration Readiness Checklist page ${selectedPage + 1}`}
            fill
            sizes="(min-width: 1024px) 720px, 94vw"
            className="object-contain object-top"
            priority
          />
          <span className="absolute bottom-3 right-3 flex h-11 min-w-11 items-center justify-center rounded-md bg-[#111111] px-3 text-sm font-black text-white shadow-lg transition group-hover:bg-[#ff6a00] group-hover:text-[#111111]">
            Enlarge
          </span>
        </button>

        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-2 lg:content-start"
          aria-label="Checklist page thumbnails"
        >
          {previewPages.map((page, index) => (
            <button
              key={page}
              type="button"
              onClick={() => selectPage(index)}
              aria-label={`Show checklist page ${index + 1}`}
              aria-pressed={selectedPage === index}
              className={`relative aspect-[210/297] overflow-hidden rounded-md border-2 bg-white transition ${
                selectedPage === index
                  ? "border-[#ff6a00] shadow-md"
                  : "border-black/10 hover:border-[#c24100]"
              }`}
            >
              <Image
                src={page}
                alt=""
                fill
                loading="eager"
                sizes="(min-width: 1024px) 96px, 28vw"
                className="object-contain object-top"
              />
              <span className="absolute bottom-1 right-1 flex h-6 min-w-6 items-center justify-center rounded-md bg-[#111111] px-1 text-[10px] font-black text-white">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm font-bold text-[#5f5f66]">
        <button
          type="button"
          onClick={() => selectPage(selectedPage - 1)}
          disabled={selectedPage === 0}
          className="inline-flex min-h-11 items-center rounded-md px-3 transition hover:bg-white hover:text-[#c24100] disabled:opacity-30"
        >
          &larr; Previous
        </button>
        <span>
          Page {selectedPage + 1} of {previewPages.length}
        </span>
        <button
          type="button"
          onClick={() => selectPage(selectedPage + 1)}
          disabled={selectedPage === previewPages.length - 1}
          className="inline-flex min-h-11 items-center rounded-md px-3 transition hover:bg-white hover:text-[#c24100] disabled:opacity-30"
        >
          Next &rarr;
        </button>
      </div>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
