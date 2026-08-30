import type { Metadata } from "next";
import { TradePackCard } from "@/components/trade-pack-card";
import { tradePacks } from "@/data/trade-packs";

export const metadata: Metadata = {
  title: "Trade starter packs | DokKit",
  description: "Editable electrical, plumbing, solar and electric-fence contractor document packs for South African businesses.",
};
export default function PackagesPage() {

  return (
    <section className="bg-[#fffaf5] py-10 sm:py-14 lg:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d00]">DokKit trade starter packs</p><h1 className="mt-3 text-4xl font-black text-[#111111] sm:text-5xl">Paperwork built for the work you actually do.</h1><p className="mt-4 text-base leading-7 text-[#5f5f66] sm:text-lg sm:leading-8">Each pack gives one South African trade a ready starting point for quoting, job records, invoices and daily admin. Edit the Word and Excel files for your business, logo and workflow.</p></div><div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2">{tradePacks.map((pack) => <TradePackCard key={pack.slug} pack={pack} detailed />)}</div></div></section>
  );
}
