"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-black/10 bg-[#111111] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <BrandLogo light />
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
            Premium editable business document packs for South African small
            businesses that need sharper admin, faster setup, and professional
            customer-facing documents.
          </p>
          <p className="mt-3 text-sm font-bold text-white/70">
            Support:{" "}
            <Link
              href="mailto:support@dokkit.co.za"
              className="text-[#ffb06f] hover:text-white"
            >
              support@dokkit.co.za
            </Link>
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black tracking-[0.08em] text-white/70">
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Word
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Excel
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              PayFast checkout
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-white/70 lg:justify-end">
          <Link href="/industries" className="hover:text-[#ff6a00]">
            Industries
          </Link>
          <Link href="/packages" className="hover:text-[#ff6a00]">
            Packages
          </Link>
          <Link href="/single-documents" className="hover:text-[#ff6a00]">
            Templates
          </Link>
          <Link href="/cart" className="hover:text-[#ff6a00]">
            Cart
          </Link>
        </div>
      </div>
    </footer>
  );
}
