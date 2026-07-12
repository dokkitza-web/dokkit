import { AddToCartButton } from "@/components/add-to-cart-button";
import { SingleDocumentPreview } from "@/components/single-document-preview";
import {
  VAT_INCLUDED_LABEL,
  formatFileFormats,
  formatPrice,
} from "@/data/catalogue";
import { getCatalogueSingleDocuments } from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Single documents | DokKit",
  description:
    "Browse individual DokKit Word templates and Excel workbooks for small-business admin.",
};

export const revalidate = 300;

export default async function SingleDocumentsPage() {
  const singleDocuments = await getCatalogueSingleDocuments();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Template shop
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Single business templates
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5f66]">
          Standalone templates customers can buy on their own or add to an
          industry package.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {singleDocuments.map((document) => (
          <article
            key={document.slug}
            className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ff6a00] hover:shadow-xl"
          >
            {document.previewImageSrc ? (
              <SingleDocumentPreview
                imageSrc={document.previewImageSrc}
                name={document.name}
              />
            ) : (
              <div className="mb-5 rounded-2xl bg-[#fff4eb] p-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="h-3 w-3/5 rounded-full bg-[#111111]" />
                  <div className="mt-5 space-y-2">
                    {[88, 72, 80, 58].map((width) => (
                      <span
                        key={width}
                        className="block h-2 rounded-full bg-black/15"
                        style={{ width: `${width}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-black">{document.name}</h2>
              <div className="shrink-0 text-right">
                <p className="rounded-full bg-[#111111] px-3 py-1 text-sm font-black text-white">
                  {formatPrice(document.priceCents)}
                </p>
                <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#d95400]">
                  {VAT_INCLUDED_LABEL}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
              {document.description}
            </p>
            <p className="mt-5 text-xs font-black tracking-[0.08em] text-[#ff6a00]">
              {formatFileFormats(document.fileFormats)} / PDF coming soon
            </p>
            <div className="mt-5">
              <AddToCartButton
                item={{
                  slug: document.slug,
                  name: document.name,
                  priceCents: document.priceCents,
                  category: "single_document",
                  description: document.description,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
