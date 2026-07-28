import Image from "next/image";
import { FileFormatIcon } from "@/components/file-format-icon";

const formatBadges = [
  { format: "Word", label: "templates" },
  { format: "Excel", label: "trackers" },
  { format: null, label: "Business packs" },
];

export function ProductMockup() {
  return (
    <div className="relative">
      <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-[#fff4eb] shadow-xl shadow-black/15 sm:rounded-lg sm:shadow-2xl">
        <Image
          src="/images/dokkit-hero-workspace.png"
          alt="Modern office desk with laptop showing business templates and printed quotation, invoice, and spreadsheet documents"
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:mt-4 sm:gap-2">
        {formatBadges.map((label) => (
          <span
            key={label.label}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black text-[#111111] shadow-sm sm:px-4"
          >
            {label.format ? (
              <FileFormatIcon format={label.format} size="sm" />
            ) : null}
            {label.label}
          </span>
        ))}
      </div>
    </div>
  );
}
