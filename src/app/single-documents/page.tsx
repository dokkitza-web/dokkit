import { AddToCartButton } from "@/components/add-to-cart-button";
import { FileFormatIcons } from "@/components/file-format-icon";
import { ProductInformationBox } from "@/components/product-information-box";
import { SingleDocumentPreview } from "@/components/single-document-preview";
import { formatPrice } from "@/data/catalogue";
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
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Template shop
        </p>
        <h1 className="mt-3 text-4xl font-black sm:mt-4 sm:text-5xl">
          Single business templates
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5f5f66] sm:text-lg sm:leading-8">
          Standalone templates customers can buy on their own or add to an
          industry package.
        </p>
      </div>
      <ProductInformationBox className="mt-6 max-w-4xl sm:mt-8" />
      <div className="mt-7 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {singleDocuments.map((document) => (
          <article
            key={document.slug}
            className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 rounded-md border border-black/10 bg-white p-4 shadow-sm transition hover:border-[#ff6a00] hover:shadow-xl md:block md:p-5 md:hover:-translate-y-1"
          >
            {document.previewImageSrc ? (
              <SingleDocumentPreview
                imageSrc={document.previewImageSrc}
                name={document.name}
                compactOnMobile
              />
            ) : (
              <div className="aspect-[3/4] rounded-md bg-[#fff4eb] p-2 md:mb-5 md:p-4">
                <div className="h-full rounded-md bg-white p-3 shadow-sm md:p-4">
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
            <div className="min-w-0">
              <div className="flex flex-col items-start gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
                <h2 className="text-base font-black leading-5 md:text-lg">
                  {document.name}
                </h2>
                <div className="shrink-0 text-right">
                  <p className="rounded-md bg-[#111111] px-3 py-1 text-sm font-black text-white">
                    {formatPrice(document.priceCents)}
                  </p>
                </div>
              </div>
              <p className="mobile-line-clamp mt-2 text-sm leading-5 text-[#5f5f66] md:mt-3 md:leading-6">
                {document.description}
              </p>
              <FileFormatIcons
                formats={document.fileFormats}
                size="sm"
                className="mt-3 md:mt-5"
              />
              <div className="mt-3 md:mt-5">
                <AddToCartButton
                  className="min-h-11 w-full rounded-md px-4 py-2.5 md:w-auto md:px-5 md:py-3"
                  item={{
                    slug: document.slug,
                    name: document.name,
                    priceCents: document.priceCents,
                    category: "single_document",
                    description: document.description,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
