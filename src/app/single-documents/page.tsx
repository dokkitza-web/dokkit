import { formatPrice, singleDocuments } from "@/data/catalogue";

export const metadata = {
  title: "Single documents | DokKit",
  description: "Browse DokKit single document upsells and standalone templates.",
};

export default function SingleDocumentsPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Upsells
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Single generic documents
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#53615b]">
          Standalone templates customers can buy on their own or add to an
          industry package.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {singleDocuments.map((document) => (
          <article
            key={document.slug}
            className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">{document.name}</h2>
              <p className="shrink-0 text-sm font-semibold text-[#147d64]">
                {formatPrice(document.priceCents)}
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#53615b]">
              {document.description}
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#147d64]">
              {document.fileFormats.join(" + ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
