"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-black/10 bg-[#111111] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[minmax(0,1.35fr)_auto_auto] md:items-start lg:px-8">
        <div className="max-w-xl">
          <BrandLogo light />
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
            Premium editable business document packs for South African small
            businesses that need sharper admin, faster setup, and professional
            customer-facing documents.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm font-bold text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <Link
              href="mailto:support@dokkit.co.za"
              className="transition hover:text-[#ffb06f]"
            >
              <span className="mr-2 text-white/40">Support</span>
              support@dokkit.co.za
            </Link>
            <Link
              href="https://dokkit.co.za"
              className="transition hover:text-[#ffb06f]"
            >
              <span className="mr-2 text-white/40">Website</span>
              dokkit.co.za
            </Link>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <p className="mb-4 text-xs font-black uppercase text-white/40">
            Explore
          </p>
          <div className="grid gap-3 text-sm font-bold text-white/70">
            <Link href="/launch-offer" className="transition hover:text-[#ff6a00]">
              Launch Offer
            </Link>
            <Link href="/industries" className="transition hover:text-[#ff6a00]">
              Industries
            </Link>
            <Link href="/packages" className="transition hover:text-[#ff6a00]">
              Packages
            </Link>
            <Link href="/single-documents" className="transition hover:text-[#ff6a00]">
              Templates
            </Link>
            <Link href="/cart" className="transition hover:text-[#ff6a00]">
              Cart
            </Link>
            <Link href="/privacy" className="transition hover:text-[#ff6a00]">
              Privacy
            </Link>
            <CookieSettingsButton className="w-fit text-left transition hover:text-[#ff6a00]" />
          </div>
        </nav>
        <a
          href="https://proudlysa.co.za/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit Proudly South African"
          className="inline-flex w-fit transition hover:opacity-85 md:justify-self-end"
        >
          <Image
            src="/brand/proudly-south-african-member.png"
            alt="Proudly South African"
            width={1448}
            height={1448}
            sizes="112px"
            className="h-28 w-28 object-contain"
          />
        </a>
      </div>
      <div className="bg-[#173f6d]">
        <div className="mx-auto max-w-7xl px-5 py-3 lg:px-8">
          <p className="text-sm text-[#a8b9cb]">
            &copy; 2026 DokKit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
