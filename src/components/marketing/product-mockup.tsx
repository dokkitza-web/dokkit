import Image from "next/image";

const formatBadges = ["DOCX templates", "XLSX trackers", "Business packs"];

export function ProductMockup() {
  return (
    <div className="relative">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-[#fff4eb] shadow-2xl shadow-black/15">
        <Image
          src="/images/dokkit-hero-workspace.png"
          alt="Modern office desk with laptop showing business templates and printed quotation, invoice, and spreadsheet documents"
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {formatBadges.map((label) => (
          <span
            key={label}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#111111] shadow-sm"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DocumentPreviewCard({
  title,
  type,
}: {
  title: string;
  type: "doc" | "sheet";
}) {
  return (
    <div className="group rounded-3xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-2xl bg-[#fff4eb] p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-[#111111] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white">
            {type === "doc" ? "DOCX" : "XLSX"}
          </span>
          <span className="h-3 w-3 rounded-full bg-[#ff6a00]" />
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="h-3 w-3/5 rounded-full bg-[#111111]" />
          {type === "doc" ? (
            <div className="mt-5 space-y-2">
              {[90, 74, 82, 58, 68].map((width) => (
                <span
                  key={width}
                  className="block h-2 rounded-full bg-black/15"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }, (_, index) => (
                <span
                  key={index}
                  className={`h-5 rounded ${
                    index < 4 ? "bg-[#111111]" : "bg-black/10"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm font-black text-[#111111]">{title}</p>
    </div>
  );
}
