"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { DocumentPreview } from "@/data/document-previews";

type DocumentPreviewButtonProps = {
  preview: DocumentPreview;
  label?: string;
  className?: string;
};

function MockPreview({ preview }: { preview: DocumentPreview }) {
  const isWorkbook = preview.format === "XLSX";

  return (
    <div className="rounded-lg border border-[#e6e0d8] bg-[#f8f6f2] p-4 shadow-inner">
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-[#eee7df] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#f26a21]">
              {preview.format} preview
            </p>
            <h3 className="mt-2 text-lg font-bold text-[#111111]">
              {preview.title}
            </h3>
          </div>
          <span className="rounded bg-[#111111] px-2 py-1 text-xs font-bold text-white">
            DokKit
          </span>
        </div>

        {isWorkbook ? (
          <div className="mt-5 overflow-hidden rounded border border-[#e6e0d8]">
            <div className="grid grid-cols-4 bg-[#fff3ea] text-xs font-bold text-[#111111]">
              {["Date", "Client", "Amount", "Status"].map((label) => (
                <span key={label} className="border-r border-[#e6e0d8] p-2">
                  {label}
                </span>
              ))}
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="grid grid-cols-4 text-xs text-[#6f6a64]">
                {[0, 1, 2, 3].map((cell) => (
                  <span
                    key={cell}
                    className="h-9 border-r border-t border-[#eee7df] p-2"
                  >
                    <span className="block h-2 rounded bg-[#ddd7cf]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="h-3 w-2/3 rounded bg-[#111111]" />
            <div className="h-2 w-full rounded bg-[#ddd7cf]" />
            <div className="h-2 w-5/6 rounded bg-[#ddd7cf]" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-[#eee7df] p-3">
                <div className="h-2 w-20 rounded bg-[#f26a21]" />
                <div className="mt-3 h-2 w-full rounded bg-[#ddd7cf]" />
                <div className="mt-2 h-2 w-3/4 rounded bg-[#ddd7cf]" />
              </div>
              <div className="rounded border border-[#eee7df] p-3">
                <div className="h-2 w-16 rounded bg-[#f26a21]" />
                <div className="mt-3 h-2 w-full rounded bg-[#ddd7cf]" />
                <div className="mt-2 h-2 w-2/3 rounded bg-[#ddd7cf]" />
              </div>
            </div>
            <div className="mt-5 h-16 rounded border border-dashed border-[#d8d0c6] bg-[#fbfaf8]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentPreviewButton({
  preview,
  label = "Preview",
  className,
}: DocumentPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const portalElement =
    typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const modal = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/75 px-4 py-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="grid max-h-[88vh] overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[#f7f3ee] p-5 sm:p-8">
            <MockPreview preview={preview} />
          </div>
          <div className="p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#f26a21]">
                  Template preview
                </p>
                <h2
                  id="document-preview-title"
                  className="mt-2 text-3xl font-bold text-[#111111]"
                >
                  {preview.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e6e0d8] text-lg font-bold text-[#6f6a64] transition hover:border-[#111111] hover:text-[#111111]"
                aria-label="Close preview"
              >
                x
              </button>
            </div>
            <p className="mt-4 text-base leading-7 text-[#5f5a54]">
              {preview.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-md bg-[#111111] px-3 py-1.5 text-xs font-bold text-white">
                {preview.format}
              </span>
              <span className="rounded-md border border-[#e6e0d8] px-3 py-1.5 text-xs font-bold text-[#5f5a54]">
                Editable template
              </span>
              <span className="rounded-md bg-[#fff3ea] px-3 py-1.5 text-xs font-bold text-[#a94710]">
                PDF coming soon
              </span>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase text-[#111111]">
                Sections included
              </h3>
              <ul className="mt-4 grid gap-3 text-sm text-[#5f5a54]">
                {preview.sections.map((section) => (
                  <li
                    key={section}
                    className="rounded-md border border-[#eee7df] bg-[#fbfaf8] px-4 py-3"
                  >
                    {section}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/industries"
                className="inline-flex items-center justify-center rounded-md bg-[#f26a21] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d95816]"
              >
                Buy This Pack
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-md border border-[#111111] px-5 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#111111] hover:text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ??
          "inline-flex items-center justify-center rounded-md border border-[#d6cec3] bg-white px-4 py-2 text-sm font-bold text-[#111111] transition hover:border-[#f26a21] hover:text-[#f26a21]"
        }
      >
        {label}
      </button>

      {isOpen && portalElement ? createPortal(modal, portalElement) : null}
    </>
  );
}
