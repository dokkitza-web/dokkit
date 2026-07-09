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
  industry,
  format,
  imageSrc,
}: {
  title: string;
  industry: string;
  format: string;
  imageSrc: string;
}) {
  return (
    <article className="group rounded-3xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/10 bg-[#f6f4f1]">
        <Image
          src={imageSrc}
          alt={`${title} document preview for ${industry}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-top transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#111111] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
          {format}
        </span>
      </div>
      <p className="mt-4 text-sm font-black text-[#111111]">{title}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-[#5f5f66]">
        {industry}
      </p>
    </article>
  );
}
