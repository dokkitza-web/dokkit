"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FileFormatIcon } from "@/components/file-format-icon";

type Format = "pdf" | "docx";
type DownloadLinks = Record<Format, string>;

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

function startDownload(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function FreeChecklistDownloadForm() {
  const [selectedFormat, setSelectedFormat] = useState<Format>("pdf");
  const [downloads, setDownloads] = useState<DownloadLinks | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const query = new URLSearchParams(window.location.search);

    try {
      const response = await fetch("/api/free-checklist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          businessName: form.get("businessName"),
          email: form.get("email"),
          province: form.get("province"),
          industry: form.get("industry"),
          selectedFormat,
          privacyAccepted: form.get("privacyAccepted") === "on",
          marketingConsent: form.get("marketingConsent") === "on",
          website: form.get("website"),
          utmSource: query.get("utm_source") ?? undefined,
          utmMedium: query.get("utm_medium") ?? undefined,
          utmCampaign: query.get("utm_campaign") ?? undefined,
        }),
      });
      const result = (await response.json()) as {
        downloads?: DownloadLinks;
        error?: string;
      };

      if (!response.ok || !result.downloads) {
        throw new Error(
          result.error ?? "The download could not be prepared. Please try again.",
        );
      }

      setDownloads(result.downloads);
      startDownload(result.downloads[selectedFormat]);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The download could not be prepared. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (downloads) {
    return (
      <div
        id="download-form"
        className="scroll-mt-24 rounded-md border-2 border-[#ff6a00] bg-white p-5 shadow-xl sm:p-6"
        aria-live="polite"
      >
        <p className="text-xs font-black uppercase text-[#a63d00]">
          Your checklist is ready
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#111111]">
          The download has started.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
          If it did not start, choose a format below. These secure links remain
          available for 15 minutes.
        </p>
        <div className="mt-5 grid gap-3">
          <a
            href={downloads.pdf}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c24100] px-5 py-3 text-sm font-black text-white transition hover:bg-[#9a3412]"
          >
            <FileFormatIcon format="PDF" size="sm" />
            Download fillable PDF
          </a>
          <a
            href={downloads.docx}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-black/20 bg-white px-5 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]"
          >
            <FileFormatIcon format="Word" size="sm" />
            Download editable Word file
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      id="download-form"
      onSubmit={handleSubmit}
      className="scroll-mt-24 rounded-md border border-[#ffb77a] bg-white p-5 shadow-xl sm:p-6"
    >
      <p className="text-xs font-black uppercase text-[#a63d00]">
        Get the free checklist
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#111111]">
        Tell us a little about your business.
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
        Complete the form and your chosen file will download automatically.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold text-[#222226]">
          Full name
          <input
            required
            name="fullName"
            autoComplete="name"
            maxLength={100}
            className="min-h-12 rounded-md border border-black/20 px-3 py-2 outline-none transition focus:border-[#c24100] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[#222226]">
          Business name
          <input
            required
            name="businessName"
            autoComplete="organization"
            maxLength={140}
            className="min-h-12 rounded-md border border-black/20 px-3 py-2 outline-none transition focus:border-[#c24100] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[#222226] sm:col-span-2">
          Business email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            className="min-h-12 rounded-md border border-black/20 px-3 py-2 outline-none transition focus:border-[#c24100] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[#222226]">
          Province
          <select
            required
            name="province"
            defaultValue=""
            className="min-h-12 rounded-md border border-black/20 bg-white px-3 py-2 outline-none transition focus:border-[#c24100] focus:ring-2 focus:ring-[#ffd8bd]"
          >
            <option value="" disabled>
              Select province
            </option>
            {provinces.map((province) => (
              <option key={province}>{province}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-[#222226]">
          Type of business
          <input
            required
            name="industry"
            maxLength={120}
            placeholder="e.g. Cleaning services"
            className="min-h-12 rounded-md border border-black/20 px-3 py-2 outline-none transition placeholder:text-[#8a8a91] focus:border-[#c24100] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-black text-[#111111]">
          Preferred format
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["pdf", "docx"] as const).map((format) => (
            <label
              key={format}
              className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-black transition ${
                selectedFormat === format
                  ? "border-[#c24100] bg-[#fff0e3] text-[#a63d00]"
                  : "border-black/20 bg-white text-[#333338]"
              }`}
            >
              <input
                type="radio"
                name="selectedFormat"
                value={format}
                checked={selectedFormat === format}
                onChange={() => setSelectedFormat(format)}
                className="sr-only"
              />
              <FileFormatIcon
                format={format === "pdf" ? "PDF" : "Word"}
                size="sm"
              />
              {format === "pdf" ? "Fillable PDF" : "Editable Word"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sr-only" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#4f4f55]">
        <input
          required
          type="checkbox"
          name="privacyAccepted"
          className="mt-1 h-4 w-4 shrink-0 accent-[#c24100]"
        />
        <span>
          I agree that DokKit may use these details to provide the checklist and
          administer this request, as explained in the{" "}
          <Link
            href="/privacy"
            className="font-black text-[#a63d00] underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-[#4f4f55]">
        <input
          type="checkbox"
          name="marketingConsent"
          className="mt-1 h-4 w-4 shrink-0 accent-[#c24100]"
        />
        <span>
          Optional: email me practical admin tips, new templates and DokKit
          offers. I can unsubscribe at any time.
        </span>
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#c24100] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Preparing download..." : "Complete and download"}
      </button>
      <p className="mt-3 text-center text-xs text-[#6a6a70]">
        Free resource. No checkout or subscription.
      </p>
    </form>
  );
}
