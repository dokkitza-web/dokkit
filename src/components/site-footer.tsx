"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { policyLinks, supplierIdentity } from "@/data/legal-policies";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-black/10 bg-[#111111] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[minmax(0,1.35fr)_auto_auto] md:items-start md:py-10 lg:px-8">
        <div className="max-w-xl">
          <BrandLogo light />
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
            Premium editable business document packs for South African small
            businesses that need sharper admin, faster setup, and professional
            customer-facing documents.
          </p>
          <p className="mt-5 max-w-xl text-xs leading-6 text-white/65">
            DokKit is operated by DokKit (Pty) Ltd, a South African private
            company (registration number 2026/470231/07). 177 Springbok Road,
            Bloemfontein, Free State, 9301, South Africa. +27 83 976 0291 |{" "}
            support@dokkit.co.za. DokKit is not VAT-registered and does not
            charge VAT.
          </p>
          <div className="mt-4 flex flex-col text-sm font-bold text-white/75 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <Link
              href="mailto:support@dokkit.co.za"
              className="flex min-h-11 items-center transition hover:text-[#ffb06f]"
            >
              <span className="mr-2 text-white/40">Support</span>
              support@dokkit.co.za
            </Link>
            <Link
              href={`tel:${supplierIdentity.telephone.replaceAll(" ", "")}`}
              className="flex min-h-11 items-center transition hover:text-[#ffb06f]"
            >
              <span className="mr-2 text-white/40">Telephone</span>
              {supplierIdentity.telephone}
            </Link>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <p className="mb-4 text-xs font-black uppercase text-white/40">
            Explore
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-bold text-white/70 md:grid-cols-1 md:gap-3">
            <Link href="/launch-offer" className="flex min-h-11 items-center transition hover:text-[#ff6a00]">
              Launch Offer
            </Link>
            <Link href="/industries" className="flex min-h-11 items-center transition hover:text-[#ff6a00]">
              Industries
            </Link>
            <Link href="/packages" className="flex min-h-11 items-center transition hover:text-[#ff6a00]">
              Packages
            </Link>
            <Link href="/single-documents" className="flex min-h-11 items-center transition hover:text-[#ff6a00]">
              Templates
            </Link>
            <Link href="/cart" className="flex min-h-11 items-center transition hover:text-[#ff6a00]">
              Cart
            </Link>
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center transition hover:text-[#ff6a00]"
              >
                {link.label}
              </Link>
            ))}
            <CookieSettingsButton className="min-h-11 w-fit text-left transition hover:text-[#ff6a00]" />
          </div>
        </nav>
        <div className="inline-flex w-fit items-center gap-3 md:justify-self-end">
          <Image
            src="/brand/south-africa-flag.svg"
            alt="South African flag"
            width={900}
            height={600}
            sizes="42px"
            className="h-7 w-[42px] border border-white/20 object-cover shadow-sm"
          />
          <div>
            <p className="text-[0.65rem] font-black uppercase text-white/40">
              Made in
            </p>
            <p className="mt-0.5 text-sm font-black text-white">
              South Africa
            </p>
          </div>
        </div>
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
