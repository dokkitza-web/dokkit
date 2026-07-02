import { singleDocuments } from "@/data/catalogue";

export const metadata = {
  title: "Single documents coming soon | DokKit",
  description: "Single DokKit document downloads are launching soon.",
};

export default function SingleDocumentsPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-[#f26a21]">
            Launching soon
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[#111111]">
            Single Document Downloads
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
            Need only one document? Soon you will be able to buy selected
            templates individually, including invoices, quotations, price lists,
            trackers, and client forms.
          </p>
        </div>
        <div className="rounded-xl border border-[#eadfd4] bg-white px-5 py-4 text-sm shadow-sm">
          <p className="font-bold text-[#111111]">
            {singleDocuments.length} planned templates
          </p>
          <p className="mt-1 text-[#6f6a64]">
            No single documents are available for checkout yet.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {singleDocuments.map((document) => (
          <article
            key={document.slug}
            className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-[#111111]">
                {document.name}
              </h2>
              <span className="shrink-0 rounded-md bg-[#fff3ea] px-2.5 py-1 text-xs font-bold uppercase text-[#a94710]">
                Coming Soon
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
              {document.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {document.fileFormats.map((format) => (
                <span
                  key={format}
                  className="rounded-md border border-[#eadfd4] bg-[#fbf8f5] px-2.5 py-1 text-xs font-bold text-[#5f5a54]"
                >
                  {format === "PDF" ? "PDF coming soon" : format}
                </span>
              ))}
            </div>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex cursor-not-allowed items-center justify-center rounded-md bg-[#e5ddd5] px-4 py-2.5 text-sm font-bold text-[#7b746d]"
            >
              Coming Soon
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
