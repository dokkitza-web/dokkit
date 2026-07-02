const comingSoonItems = [
  {
    title: "PDF Versions",
    description:
      "Prefer print-ready files? PDF versions of selected templates will be added soon.",
  },
  {
    title: "Single Document Downloads",
    description:
      "Need only one document? Soon you will be able to buy selected templates individually, including invoices, quotations, price lists, trackers, and client forms.",
  },
  {
    title: "Business Admin Add-ons",
    description:
      "Upgrade your pack with extra tools like monthly admin checklists, WhatsApp message templates, filing systems, and business trackers.",
  },
];

export const metadata = {
  title: "Coming soon | DokKit",
  description: "Upcoming DokKit PDF versions, single documents, and add-ons.",
};

export default function ComingSoonPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase text-[#f26a21]">
          Coming Soon
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[#111111]">
          Upcoming DokKit products and formats
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
          These products are planned but not available for checkout yet. They are
          shown clearly as coming soon so customers know what is next.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {comingSoonItems.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase text-[#f26a21]">
              Launching Soon
            </p>
            <h2 className="mt-3 text-xl font-bold text-[#111111]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
              {item.description}
            </p>
            <button
              type="button"
              disabled
              className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-md bg-[#e5ddd5] px-4 py-2.5 text-sm font-bold text-[#7b746d]"
            >
              Coming Soon
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
