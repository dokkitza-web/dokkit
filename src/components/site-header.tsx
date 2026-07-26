"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";

const navigation = [
  { href: "/industries", label: "Industries" },
  { href: "/packages", label: "Packages" },
  { href: "/single-documents", label: "Templates" },
  { href: "/#faq", label: "FAQ" },
  { href: "/launch-offer", label: "Launch offer" },
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
              className="transition hover:text-[#a63d00]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/industries"
            className="rounded-md bg-[#c24100] px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-[#9a3412]"
          >
            Choose your business
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
                className="rounded-md px-3 py-3 transition hover:bg-[#fff4eb] hover:text-[#a63d00]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/industries"
              onClick={() => setMenuOpen(false)}
              className="rounded-md bg-[#c24100] px-4 py-3 text-center font-black text-white"
            >
              Choose your business
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
