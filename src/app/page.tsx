import type { Metadata } from "next";
import { FileFormatIcon } from "@/components/file-format-icon";
import { HomepageTrackedLink } from "@/components/homepage-tracked-link";
import { ProductMockup } from "@/components/marketing/product-mockup";
import { TradePackCard } from "@/components/trade-pack-card";
import { formatPrice, tradePacks } from "@/data/trade-packs";
import type { HomepageEventName } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Trade contractor admin packs | DokKit",
  description:
    "Editable Word documents and Excel admin tools for South African electrical contractors, plumbers, solar installers and electric-fence installers.",
};

const faqs = [
  ["What is in a trade pack?", "Each pack shows its exact editable Word documents, Excel administration workbook, PDF read-me and previews before you add it to your cart."],
  ["Can I use the files for my own business?", "Yes. A once-off purchase allows one business to customise and use the files. You may not resell, share or distribute the templates."],
  ["How does delivery work?", "After PayFast confirms payment, DokKit provides secure access to the digital download. Delivery is normally within 15 minutes."],
];

const workflowSteps = [
  ["1", "Quote the job", "Start with clear customer and scope details."],
  ["2", "Record the work", "Keep the job details together as work progresses."],
  ["3", "Confirm completion", "Capture the relevant installation, inspection or job record."],
  ["4", "Issue the invoice", "Send professional customer paperwork when the work is done."],
  ["5", "Track payment", "Use the Excel workbook to follow jobs, invoices and expenses."],
];

const packEventNames: Record<string, HomepageEventName> = {
  "electrical-contractor-pack": "electrical_pack_click",
  "plumbing-contractor-pack": "plumbing_pack_click",
  "solar-installer-pack": "solar_pack_click",
  "electric-fence-installer-pack": "electric_fence_pack_click",
};

export default function Home() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">Editable admin tools for South African trades</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.04] text-[#111111] sm:text-6xl">Quote it. Record it. Invoice it. Keep the work moving.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4f4f55] sm:text-lg sm:leading-8">Get the Word documents and Excel tools you need to quote customers, record jobs, issue invoices and track payments — without building your admin system from scratch.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <HomepageTrackedLink eventName="browse_trade_packs_click" href="#trade-packs" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#c24100] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412]">Browse trade packs</HomepageTrackedLink>
              <HomepageTrackedLink eventName="free_checklist_click" href="/free-business-admin-checklist" className="inline-flex min-h-12 items-center justify-center rounded-md border border-black/20 px-6 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]">Get the free checklist</HomepageTrackedLink>
            </div>
            <p className="mt-5 max-w-2xl text-sm font-bold leading-6 text-[#5f5f66]">Once-off payment · Editable Word &amp; Excel files · Secure PayFast checkout · Secure delivery after payment confirmation</p>
          </div>

          <div className="grid gap-3 rounded-xl bg-[#111111] p-5 text-white shadow-2xl sm:grid-cols-2 sm:p-7">
            {tradePacks.map((pack) => (
              <HomepageTrackedLink
                key={pack.slug}
                eventName={packEventNames[pack.slug]}
                href={`/packages#${pack.slug}`}
                aria-label={`View ${pack.name}: ${pack.editableDocuments.join(", ")}. ${formatPrice(pack.priceCents)} once-off.`}
                className="group rounded-lg border border-white/15 bg-white/5 p-4 transition hover:border-[#ffb06f] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb06f]"
              >
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#ffb06f]">{pack.trade}</p>
                <h2 className="mt-2 text-lg font-black leading-6">{pack.name}</h2>
                <p className="mt-3 text-xs leading-5 text-white/80">{pack.editableDocuments.join(" · ")}</p>
                <p className="mt-3 text-xs font-bold leading-5 text-white/70">{pack.workbookPurpose}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-black text-white">{formatPrice(pack.priceCents)} once-off</span>
                  <span className="font-black text-[#ffb06f] transition group-hover:translate-x-0.5">View pack <span aria-hidden="true">→</span></span>
                </div>
              </HomepageTrackedLink>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#fff4eb] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">A practical contractor workflow</p>
            <h2 className="mt-3 text-3xl font-black text-[#111111] sm:text-4xl">From quote to payment</h2>
            <p className="mt-4 text-base leading-7 text-[#5f5f66]">DokKit gives you the core documents and tracking tools to manage a customer job from the first quote to final payment.</p>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {workflowSteps.map(([number, title, copy]) => (
              <li key={number} className="rounded-lg border border-black/10 bg-white p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#111111] text-sm font-black text-[#ffb06f]">{number}</span>
                <h3 className="mt-4 text-base font-black text-[#111111]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f5f66]">{copy}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm font-bold text-[#5f5f66]">Your DokKit trade pack is built around this workflow.</p>
        </div>
      </section>

      <section id="trade-packs" className="scroll-mt-24 bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">Choose your trade</p>
            <h2 className="mt-3 text-3xl font-black text-[#111111] sm:text-4xl">Trade admin packs built for the work you do.</h2>
            <p className="mt-4 text-base leading-7 text-[#5f5f66]">Open a pack to see its exact files, then add it to your cart when it fits your workflow.</p>
          </div>
          <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2">
            {tradePacks.map((pack) => <TradePackCard key={pack.slug} pack={pack} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f4f1] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">What you get</p>
            <h2 className="mt-3 text-3xl font-black text-[#111111] sm:text-4xl">What comes in a DokKit trade pack?</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-black/10 bg-white p-5"><FileFormatIcon format="Word" size="sm" /><h3 className="mt-4 text-lg font-black">Editable Word documents</h3><p className="mt-3 text-sm leading-6 text-[#5f5f66]">Professional customer paperwork you can add your business details and logo to.</p></article>
            <article className="rounded-xl border border-black/10 bg-white p-5"><FileFormatIcon format="Excel" size="sm" /><h3 className="mt-4 text-lg font-black">Excel admin workbook</h3><p className="mt-3 text-sm leading-6 text-[#5f5f66]">Track customer jobs, invoices, payments and expenses in one practical workbook.</p></article>
            <article className="rounded-xl border border-black/10 bg-white p-5"><span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#111111] px-1 text-xs font-black text-white">✓</span><h3 className="mt-4 text-lg font-black">Ready-to-use structure</h3><p className="mt-3 text-sm leading-6 text-[#5f5f66]">Start with a practical admin system instead of building your paperwork from scratch.</p></article>
            <article className="rounded-xl border border-black/10 bg-white p-5"><span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#111111] px-1 text-xs font-black text-white">R</span><h3 className="mt-4 text-lg font-black">Once-off purchase</h3><p className="mt-3 text-sm leading-6 text-[#5f5f66]">Pay once for the downloadable pack. There is no monthly software subscription.</p></article>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">See the system taking shape</p>
            <h2 className="mt-3 text-3xl font-black text-[#111111] sm:text-4xl">Paperwork that works together on the job.</h2>
            <p className="mt-4 text-base leading-7 text-[#5f5f66]">The exact file list differs by trade, but every pack combines customer documents with an Excel admin tracker so the job does not end at the invoice.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Customer quotation", "Job or work record", "Completion or installation record", "Invoice and payment tracker"].map((item, index) => (
                <div key={item} className="flex min-h-12 items-center gap-3 rounded-md border border-black/10 bg-[#f6f4f1] px-4 text-sm font-black text-[#111111]"><span className="text-[#a63d00]">0{index + 1}</span>{item}</div>
              ))}
            </div>
            <p className="mt-5 text-sm font-bold text-[#5f5f66]">Review the exact documents and workbook in each pack before purchasing.</p>
          </div>
          <ProductMockup />
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#111111] py-12 text-white lg:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">Built for practical business admin</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Clear tools. Clear terms. No software subscription.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Built for South African trade businesses", "Editable Word & Excel files", "Once-off payment", "Secure PayFast checkout"].map((item) => <p key={item} className="rounded-md border border-white/15 bg-white/5 p-4 text-sm font-bold leading-6">{item}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-[#fff4eb] py-12 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-7 px-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">Free business admin checklist</p>
            <h2 className="mt-3 text-3xl font-black text-[#111111]">Find the admin gaps before they cost you time.</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5f66]">Download DokKit&apos;s free six-page administration readiness checklist for a practical look at your current systems.</p>
          </div>
          <HomepageTrackedLink eventName="free_checklist_click" href="/free-business-admin-checklist" className="inline-flex min-h-12 items-center justify-center rounded-md border border-black/20 bg-white px-6 py-3 text-sm font-black text-[#111111] transition hover:border-[#c24100] hover:text-[#a63d00]">Get the free checklist</HomepageTrackedLink>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-black/10 bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-black sm:text-4xl">Before you buy</h2>
          <div className="mt-8 grid gap-4">
            {faqs.map(([question, answer]) => <article key={question} className="rounded-xl border border-black/10 bg-[#f6f4f1] p-5"><h3 className="font-black">{question}</h3><p className="mt-2 text-sm leading-6 text-[#5f5f66]">{answer}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-xl bg-[#111111] px-6 py-10 text-center text-white sm:px-10 sm:py-14">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">Start with the tools your work needs</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">Put a proper admin system behind your next job.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75">Choose your trade pack, add your business details and start using a practical quote-to-payment workflow.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <HomepageTrackedLink eventName="final_cta_click" href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ff6a00] px-6 py-3 text-sm font-black text-white transition hover:bg-[#d95400]">Browse trade packs</HomepageTrackedLink>
            <HomepageTrackedLink eventName="free_checklist_click" href="/free-business-admin-checklist" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-[#ffb06f] hover:text-[#ffb06f]">Get the free checklist</HomepageTrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}
