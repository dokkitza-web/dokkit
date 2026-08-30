"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";

const navigation = [
  { href: "/packages", label: "Trade packs" },
  { href: "/free-business-admin-checklist", label: "Free checklist" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#55555c] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#a63d00]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/packages"
            className="rounded-md bg-[#c24100] px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412]"
          >
            Browse trade packs
          </Link>
          <CartLink />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <CartLink />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-black/15 px-4 py-2 text-sm font-black text-[#111111]"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-t border-black/10 bg-white px-4 py-3 shadow-xl lg:hidden"
        >
          <nav className="grid grid-cols-2 gap-2 text-sm font-bold text-[#55555c]">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-md px-3 py-3 transition hover:bg-[#fff4eb] hover:text-[#a63d00]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/packages"
              onClick={() => setMenuOpen(false)}
              className="col-span-2 flex min-h-12 items-center justify-center rounded-md bg-[#c24100] px-4 py-3 text-center font-black text-white"
            >
              Browse trade packs
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
