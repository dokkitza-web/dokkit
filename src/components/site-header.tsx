import Link from "next/link";

const navigation = [
  { href: "/industries", label: "Industries" },
  { href: "/packages", label: "Packages" },
  { href: "/single-documents", label: "Single documents" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#dfe7e2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#147d64] text-sm font-semibold text-white">
            DK
          </span>
          <span className="text-lg font-semibold tracking-tight">DokKit</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#53615b] md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#147d64]">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/industries"
          className="rounded-md border border-[#b9c8c0] px-4 py-2 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
        >
          Browse
        </Link>
      </div>
    </header>
  );
}
