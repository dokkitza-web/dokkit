import Link from "next/link";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { documentPreviews } from "@/data/document-previews";

export const metadata = {
  title: "Preview templates | DokKit",
  description: "Preview selected DokKit document templates before buying.",
};

export default function PreviewTemplatesPage() {
  return (
    <>
      <section className="border-b border-[#eadfd4] bg-white px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-[#f26a21]">
            Preview Templates
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold text-[#111111]">
            Preview selected DokKit files before choosing a pack.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5a54]">
            These temporary previews show the structure and style customers can
            expect. Real file previews can replace these mockups once final
            preview assets are ready.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {documentPreviews.map((preview) => (
            <article
              key={preview.id}
              className="flex min-h-full flex-col rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase text-[#f26a21]">
                {preview.format} template
              </p>
              <h2 className="mt-3 text-xl font-bold text-[#111111]">
                {preview.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#5f5a54]">
                {preview.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#111111] px-3 py-1.5 text-xs font-bold text-white">
                  {preview.format}
                </span>
                <span className="rounded-md bg-[#fff3ea] px-3 py-1.5 text-xs font-bold text-[#a94710]">
                  PDF coming soon
                </span>
              </div>
              <DocumentPreviewButton
                preview={preview}
                label="Preview Template"
                className="mt-5 inline-flex items-center justify-center rounded-md border border-[#111111] px-4 py-2.5 text-sm font-bold text-[#111111] transition hover:bg-[#111111] hover:text-white"
              />
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-xl border border-[#eadfd4] bg-[#fbf8f5] p-6">
          <h2 className="text-2xl font-bold text-[#111111]">
            Ready to choose a full pack?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5a54]">
            Browse the current industry packs and select the tier that fits the
            business stage.
          </p>
          <Link
            href="/industries"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-[#f26a21] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d95816]"
          >
            Browse Packs
          </Link>
        </div>
      </section>
    </>
  );
}
