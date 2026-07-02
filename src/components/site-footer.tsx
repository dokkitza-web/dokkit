import Link from "next/link";
import { PayFastLogo } from "@/components/payment-methods";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#eadfd4] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr] lg:px-8">
        <div className="max-w-md">
          <p className="text-xl font-bold">
            <span className="text-[#f26a21]">Dok</span>
            <span className="text-[#111111]">Kit</span>
          </p>
          <p className="mt-3 leading-6 text-[#5f5a54]">
            Premium editable business document packs for South African small
            businesses.
          </p>
          <p className="mt-3 font-semibold text-[#111111]">
            support@dokkit.co.za
          </p>
        </div>
        <div>
          <p className="font-bold text-[#111111]">Explore</p>
          <div className="mt-4 grid gap-3 text-[#5f5a54]">
            <Link href="/packages" className="hover:text-[#f26a21]">
              Document Packs
            </Link>
            <Link href="/industries" className="hover:text-[#f26a21]">
              Industries
            </Link>
            <Link href="/preview-templates" className="hover:text-[#f26a21]">
              Preview Templates
            </Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#111111]">Updates</p>
          <div className="mt-4 grid gap-3 text-[#5f5a54]">
            <Link href="/coming-soon" className="hover:text-[#f26a21]">
              Coming Soon
            </Link>
            <Link href="/contact" className="hover:text-[#f26a21]">
              Contact DokKit
            </Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#111111]">We accept</p>
          <div className="mt-4">
            <PayFastLogo className="w-36" />
          </div>
          <p className="mt-3 text-[#5f5a54]">
            Supported online payment method for DokKit purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
