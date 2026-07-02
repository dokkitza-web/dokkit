import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Document Packs" },
  { href: "/industries", label: "Industries" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/preview-templates", label: "Preview Templates" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#eadfd4] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <BrandLogo compact />
        <nav className="hidden items-center gap-5 text-sm font-semibold text-[#5f5a54] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#f26a21]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/coming-soon"
            className="hidden text-sm font-bold text-[#5f5a54] transition hover:text-[#f26a21] sm:inline-flex"
          >
            Coming Soon
          </Link>
          <Link
            href="/industries"
            className="rounded-md bg-[#f26a21] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d95816]"
          >
            Browse Packs
          </Link>
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-[#f3ebe3] px-5 py-2 text-sm font-semibold text-[#5f5a54] lg:hidden">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 transition hover:text-[#f26a21]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
