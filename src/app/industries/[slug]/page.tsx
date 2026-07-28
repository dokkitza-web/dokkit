import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  FileFormatIcon,
  FileFormatIcons,
} from "@/components/file-format-icon";
import { PreviewProtectionOverlay } from "@/components/preview-protection-overlay";
import { ProductInformationBox } from "@/components/product-information-box";
import {
  formatPrice,
  type IndustryPackageProduct,
} from "@/data/catalogue";
import {
  getIndustryPackageManifests,
  getPackageManifestCounts,
  getPackageManifestGroups,
  type PackageManifestGroup,
} from "@/data/package-manifests";
import {
  LAUNCH_OFFER_DATE_RANGE_LABEL,
  LAUNCH_OFFER_END_ISO,
  LAUNCH_OFFER_END_LABEL,
  LAUNCH_OFFER_LABEL,
  LAUNCH_OFFER_START_ISO,
  LAUNCH_OFFER_START_LABEL,
  getLaunchOfferPhase,
  getLaunchOfferPricing,
} from "@/lib/launch-offer";
import {
  getCatalogueIndustries,
  getCatalogueIndustryBySlug,
  getCatalogueIndustryPackageProducts,
} from "@/lib/supabase/catalogue";

export const revalidate = 300;

type InspectablePackageProduct = IndustryPackageProduct & {
  tierLabel: string;
  fileCount: number;
  manifestGroups: PackageManifestGroup[];
};

const industryPreviewImages: Record<
  string,
  { src: string; alt: string; label: string }[]
> = {
  "human-resources": [
    {
      src: "/images/previews/single-documents/permanent-employment-agreement-template.png",
      alt: "Preview of a DokKit permanent employment agreement template",
      label: "Employment agreement",
    },
    {
      src: "/images/previews/single-documents/employee-onboarding-checklist-template.png",
      alt: "Preview of a DokKit employee onboarding checklist",
      label: "Onboarding checklist",
    },
  ],
  "beauty-salons-and-spas": [
    {
      src: "/images/previews/beauty-client-intake.png",
      alt: "Preview of a DokKit beauty client intake form",
      label: "Client intake form",
    },
  ],
  "catering-and-baking": [
    {
      src: "/images/previews/catering-quotation.png",
      alt: "Preview of a DokKit catering quotation",
      label: "Catering quotation",
    },
  ],
  "freelancers-consultants": [
    {
      src: "/images/previews/freelancer-proposal.png",
      alt: "Preview of a DokKit freelance project proposal",
      label: "Project proposal",
    },
  ],
  "landscaping-garden-services": [
    {
      src: "/images/previews/landscaping-site-intake.png",
      alt: "Preview of a DokKit landscaping site intake form",
      label: "Site intake form",
    },
  ],
  "transport-delivery-services": [
    {
      src: "/images/previews/transport-proof-of-delivery.png",
      alt: "Preview of a DokKit proof of delivery and handover form",
      label: "Proof of delivery",
    },
  ],
};

function formatFileFormats(fileFormats: string[]) {
  const labels: Record<string, string> = {
    DOCX: "Word",
    XLSX: "Excel",
    PDF: "PDF",
  };

  return fileFormats
    .map((format) => labels[format.toUpperCase()] ?? format)
    .join(" + ");
}

function getInspectableProducts(
  industrySlug: string,
  packageProducts: IndustryPackageProduct[],
): InspectablePackageProduct[] {
  const catalogueProductBySlug = new Map(
    packageProducts.map((product) => [product.slug, product]),
  );
  const inspectableProducts: InspectablePackageProduct[] = [];

  getIndustryPackageManifests(industrySlug).forEach((manifest) => {
    const product = catalogueProductBySlug.get(manifest.slug);

    if (!product) {
      return;
    }

    const counts = getPackageManifestCounts(manifest);

    inspectableProducts.push({
      ...product,
      ...counts,
      tierLabel: manifest.tierLabel,
      fileFormats: [
        ...new Set(manifest.files.map((file) => file.format)),
      ],
      manifestGroups: getPackageManifestGroups(manifest),
    });
  });

  return inspectableProducts;
}

export async function generateStaticParams() {
  const industries = await getCatalogueIndustries();

  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getCatalogueIndustryBySlug(slug);

  if (!industry) {
    return {
      title: "Industry not found | DokKit",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${industry.name} business template packages | DokKit`,
    description: `${industry.summary} Compare the exact editable files included in each verified package.`,
    alternates: {
      canonical: `/industries/${industry.slug}`,
    },
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [industry, packageProducts] = await Promise.all([
    getCatalogueIndustryBySlug(slug),
    getCatalogueIndustryPackageProducts(slug),
  ]);

  if (!industry) {
    notFound();
  }

  const inspectableProducts = getInspectableProducts(slug, packageProducts);

  if (!inspectableProducts.length) {
    notFound();
  }

  const launchOfferPhase = getLaunchOfferPhase();
  const showLaunchOfferNotice = launchOfferPhase !== "ended";
  const launchOfferNotice =
    launchOfferPhase === "active"
      ? `Launch offer active until ${LAUNCH_OFFER_END_LABEL}: selected packages up to 20% off.`
      : `Launch offer starts ${LAUNCH_OFFER_START_LABEL}: selected packages up to 20% off.`;
  const previewImages = industryPreviewImages[industry.slug] ?? [];

  return (
    <>
      <section className="border-b border-black/10 bg-[#fff7f0]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-[#5f5f66] sm:text-sm">
            <Link href="/" className="hover:text-[#a63d00]">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <Link href="/industries" className="hover:text-[#a63d00]">
              Industries
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span aria-current="page">{industry.name}</span>
          </nav>
          <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-10">
            <div>
              <p className="text-sm font-black uppercase text-[#a63d00]">
                {inspectableProducts.length} verified package
                {inspectableProducts.length === 1 ? "" : "s"} available
              </p>
              <h1 className="mt-3 text-4xl font-black sm:text-5xl">{industry.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5f66] sm:mt-5 sm:text-lg sm:leading-8">
                {industry.summary}
              </p>
              {showLaunchOfferNotice ? (
                <Link
                  href="/launch-offer"
                  className="mt-6 inline-flex min-h-11 items-center rounded-md border border-[#e9a36f] bg-white px-4 py-2.5 text-sm font-black text-[#8f3500] hover:border-[#c24100]"
                >
                  {launchOfferNotice}
                </Link>
              ) : null}
            </div>
            <div className="border-l-4 border-[#c24100] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">
                Built for the admin work you do every week.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                {industry.why}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black sm:text-3xl">Compare available packages</h2>
          <div className="mt-5 grid gap-3 md:hidden">
            {inspectableProducts.map((product) => {
              const pricing = getLaunchOfferPricing({
                priceCents: product.priceCents,
                productType: "industry_package",
                packageTier: product.key,
              });

              return (
                <Link
                  key={product.slug}
                  href={`#${product.slug}`}
                  className="grid min-h-24 grid-cols-[1fr_auto] items-center gap-4 rounded-md border border-black/10 bg-[#fffaf5] p-4"
                >
                  <div>
                    <p className="font-black">{product.tierLabel}</p>
                    <p className="mt-1 text-sm text-[#5f5f66]">
                      {product.fileCount} files &bull;{" "}
                      <FileFormatIcons
                        formats={product.fileFormats}
                        size="sm"
                      />
                    </p>
                    <p className="mt-2 text-sm font-black text-[#a63d00]">
                      Inspect files
                    </p>
                  </div>
                  <p className="text-lg font-black">
                    {formatPrice(pricing.priceCents)}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-7 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#111111]">
                  <th scope="col" className="px-4 py-3 font-black">
                    Package
                  </th>
                  <th scope="col" className="px-4 py-3 font-black">
                    Exact file total
                  </th>
                  <th scope="col" className="px-4 py-3 font-black">
                    Formats
                  </th>
                  <th scope="col" className="px-4 py-3 font-black">
                    Price
                  </th>
                  <th
                    scope="col"
                    aria-label="View package"
                    className="px-4 py-3"
                  />
                </tr>
              </thead>
              <tbody>
                {inspectableProducts.map((product) => {
                  const pricing = getLaunchOfferPricing({
                    priceCents: product.priceCents,
                    productType: "industry_package",
                    packageTier: product.key,
                  });

                  return (
                    <tr key={product.slug} className="border-b border-black/10">
                      <th scope="row" className="px-4 py-4 font-black">
                        {product.tierLabel}
                      </th>
                      <td className="px-4 py-4">{product.fileCount} files</td>
                      <td className="px-4 py-4">
                        <FileFormatIcons
                          formats={product.fileFormats}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-4 font-black">
                        {formatPrice(pricing.priceCents)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`#${product.slug}`}
                          className="font-black text-[#a63d00] underline underline-offset-4"
                        >
                          Inspect files
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {previewImages.length ? (
        <section className="border-y border-black/10 bg-[#f6f4f1] py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase text-[#a63d00]">
              Document quality
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Preview real files from this category.
            </h2>
            <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:max-w-4xl sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0">
              {previewImages.map((preview) => (
                <figure
                  key={preview.src}
                  className="w-[78vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-md border border-black/10 bg-white shadow-sm sm:w-auto sm:max-w-none"
                >
                  <div className="relative aspect-[3/4] bg-white">
                    <Image
                      src={preview.src}
                      alt={preview.alt}
                      fill
                      sizes="(min-width: 640px) 45vw, 92vw"
                      className="object-contain object-top"
                    />
                    <PreviewProtectionOverlay />
                  </div>
                  <figcaption className="px-4 py-3 text-sm font-black">
                    {preview.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#f6f4f1] py-10 sm:py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:gap-8 sm:px-6 lg:gap-10 lg:px-8">
          {inspectableProducts.map((product) => {
            const pricing = getLaunchOfferPricing({
              priceCents: product.priceCents,
              productType: "industry_package",
              packageTier: product.key,
            });
            const hasOfferSaving =
              pricing.isApplied && pricing.discountCents > 0;

            return (
              <article
                id={product.slug}
                key={product.slug}
                className="scroll-mt-28 rounded-md border border-black/10 bg-white shadow-sm"
              >
                <div className="grid gap-6 border-b border-black/10 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:gap-8 lg:p-8">
                  <div className="max-w-3xl">
                    <p className="text-sm font-black uppercase text-[#a63d00]">
                      {product.tierLabel} package
                    </p>
                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">{product.name}</h2>
                    <p className="mt-4 text-base leading-7 text-[#5f5f66]">
                      {product.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
                      <span className="rounded-md bg-[#f6f4f1] px-3 py-2">
                        {product.fileCount} exact files
                      </span>
                      {product.documentCount ? (
                        <span className="rounded-md bg-[#f6f4f1] px-3 py-2">
                          {product.documentCount} Word document
                          {product.documentCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                      {product.workbookCount ? (
                        <span className="rounded-md bg-[#f6f4f1] px-3 py-2">
                          {product.workbookCount} Excel workbook
                          {product.workbookCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="min-w-56">
                    {hasOfferSaving ? (
                      <p className="text-sm font-bold text-[#5f5f66] line-through">
                        {formatPrice(pricing.originalPriceCents)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-4xl font-black">
                      {formatPrice(pricing.priceCents)}
                    </p>
                    {hasOfferSaving ? (
                      <p className="mt-2 text-sm font-black text-[#a63d00]">
                        {LAUNCH_OFFER_LABEL}: {pricing.discountPercent}% off
                      </p>
                    ) : null}
                    <AddToCartButton
                      className="mt-5 w-full rounded-md bg-[#c24100] hover:bg-[#9a3412]"
                      item={{
                        slug: product.slug,
                        name: product.name,
                        priceCents: pricing.priceCents,
                        category: "industry_package",
                        description: product.description,
                        originalPriceCents: hasOfferSaving
                          ? pricing.originalPriceCents
                          : undefined,
                        discountPercent: hasOfferSaving
                          ? pricing.discountPercent
                          : undefined,
                        offerLabel: hasOfferSaving
                          ? LAUNCH_OFFER_LABEL
                          : undefined,
                        offerStartsAt: hasOfferSaving
                          ? LAUNCH_OFFER_START_ISO
                          : undefined,
                        offerEndsAt: hasOfferSaving
                          ? LAUNCH_OFFER_END_ISO
                          : undefined,
                      }}
                    />
                    {hasOfferSaving ? (
                      <p className="mt-2 text-xs leading-5 text-[#5f5f66]">
                        Applied automatically during{" "}
                        {LAUNCH_OFFER_DATE_RANGE_LABEL}.
                      </p>
                    ) : null}
                  </div>
                </div>

                <ProductInformationBox className="mx-5 mt-5 sm:mx-6 sm:mt-6 lg:mx-8" />

                <div className="grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
                  <div className="grid content-start gap-7">
                    <section>
                      <h3 className="text-lg font-black">Who this is for</h3>
                      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#5f5f66]">
                        {industry.useCases.map((useCase) => (
                          <li key={useCase}>&bull; {useCase}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3 className="text-lg font-black">
                        Who this is not for
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                        This is not bespoke legal, tax, HR or compliance advice,
                        and it is not a replacement for specialist software or a
                        document written for one specific transaction.
                      </p>
                    </section>
                    <section>
                      <h3 className="text-lg font-black">
                        Editing and compatibility
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                        The archive contains{" "}
                        {formatFileFormats(product.fileFormats)} files. Use
                        Microsoft Word for DOCX files and Microsoft Excel for
                        XLSX files, then add your business details, logo and
                        working information.
                      </p>
                    </section>
                    <section>
                      <h3 className="text-lg font-black">
                        Delivery and support
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                        Secure downloads unlock after PayFast confirms the
                        payment. For an order or delivery problem, email{" "}
                        <Link
                          href="mailto:support@dokkit.co.za"
                          className="font-black text-[#005f73] underline underline-offset-4"
                        >
                          support@dokkit.co.za
                        </Link>
                        .
                      </p>
                    </section>
                    <section>
                      <h3 className="text-lg font-black">
                        Important document status
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                        Treat the templates as practical starting points. Adapt
                        them to your circumstances and obtain qualified advice
                        where legal, labour, tax or regulatory decisions matter.
                      </p>
                    </section>
                  </div>

                  <section>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div>
                        <h3 className="text-xl font-black sm:text-2xl">
                          Every file included
                        </h3>
                        <p className="mt-2 text-sm text-[#5f5f66]">
                          Derived from the verified package archive, not a
                          marketing estimate.
                        </p>
                      </div>
                      <span className="text-sm font-black text-[#a63d00]">
                        {product.fileCount} files total
                      </span>
                    </div>
                    <div className="mt-5 grid gap-4">
                      {product.manifestGroups.map((group) => (
                        <details
                          key={group.name}
                          className="rounded-md border border-black/10 bg-[#fbfaf8] open:bg-white"
                        >
                          <summary className="cursor-pointer px-4 py-4 font-black">
                            {group.name}{" "}
                            <span className="font-bold text-[#5f5f66]">
                              ({group.files.length})
                            </span>
                          </summary>
                          <ul className="border-t border-black/10 px-4 py-3">
                            {group.files.map((file) => (
                              <li
                                key={file.path}
                                className="flex items-start justify-between gap-4 border-b border-black/5 py-2 text-sm last:border-0"
                              >
                                <span>{file.name}</span>
                                <FileFormatIcon
                                  format={file.format}
                                  size="sm"
                                />
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="flex flex-col justify-between gap-4 border-t border-black/10 bg-[#fff7f0] p-5 sm:flex-row sm:items-center sm:p-6 lg:px-8">
                  <div>
                    <p className="font-black">{product.name}</p>
                    <p className="mt-1 text-sm text-[#5f5f66]">
                      {product.fileCount} files &bull;{" "}
                      {formatPrice(pricing.priceCents)}
                    </p>
                  </div>
                  <AddToCartButton
                    className="rounded-md bg-[#c24100] hover:bg-[#9a3412]"
                    item={{
                      slug: product.slug,
                      name: product.name,
                      priceCents: pricing.priceCents,
                      category: "industry_package",
                      description: product.description,
                      originalPriceCents: hasOfferSaving
                        ? pricing.originalPriceCents
                        : undefined,
                      discountPercent: hasOfferSaving
                        ? pricing.discountPercent
                        : undefined,
                      offerLabel: hasOfferSaving
                        ? LAUNCH_OFFER_LABEL
                        : undefined,
                      offerStartsAt: hasOfferSaving
                        ? LAUNCH_OFFER_START_ISO
                        : undefined,
                      offerEndsAt: hasOfferSaving
                        ? LAUNCH_OFFER_END_ISO
                        : undefined,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
