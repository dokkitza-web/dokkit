import Link from "next/link";

export const metadata = {
  title: "Contact | DokKit",
  description: "Contact DokKit for document pack support and enquiries.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-[#f26a21]">
            Contact DokKit
          </p>
          <h1 className="mt-3 text-4xl font-bold text-[#111111]">
            Need help choosing a document pack?
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
            Send DokKit your question, the industry you are interested in, and
            the pack tier you want to buy or preview.
          </p>
          <div className="mt-8 rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-[#f26a21]">
              Email
            </p>
            <p className="mt-2 text-2xl font-bold text-[#111111]">
              support@dokkit.co.za
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
              Include your business type and the pack you are interested in so
              support can respond with the right next step.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111111]">
            Quick enquiry checklist
          </h2>
          <ul className="mt-6 grid gap-3 text-sm text-[#5f5a54]">
            {[
              "Your business industry",
              "Starter, Professional, or Complete pack",
              "Whether you want to preview a specific document",
              "Any admin problem you want the pack to solve",
            ].map((item) => (
              <li key={item} className="rounded-md bg-[#fbf8f5] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/industries"
              className="inline-flex items-center justify-center rounded-md bg-[#f26a21] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d95816]"
            >
              Browse Packs
            </Link>
            <Link
              href="/preview-templates"
              className="inline-flex items-center justify-center rounded-md border border-[#111111] px-5 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              Preview Templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
