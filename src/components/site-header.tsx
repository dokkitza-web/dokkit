"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";

const navigation = [
  { href: "/launch-offer", label: "Launch Offer" },
  { href: "/industries", label: "Industries" },
  { href: "/packages", label: "Packages" },
  { href: "/single-documents", label: "Templates" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#55555c] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#ff6a00]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/launch-offer"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-black text-[#111111] shadow-sm transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
          >
            Launch Offer
          </Link>
          <Link
            href="/single-documents"
            className="rounded-full bg-[#ff6a00] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#ff6a00]/20 transition hover:bg-[#d95400]"
          >
            Browse Templates
          </Link>
          <CartLink />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <CartLink />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111111]"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            Menu
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-black/10 bg-white px-5 py-4 lg:hidden"
        >
          <nav className="grid gap-2 text-sm font-bold text-[#55555c]">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-3 py-3 transition hover:bg-[#fff4eb] hover:text-[#ff6a00]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/launch-offer"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-[#ff6a00] px-4 py-3 text-center font-black text-white"
            >
              Launch Offer
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
