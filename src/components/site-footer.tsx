import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe7e2] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-[#53615b] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-[#15201c]">DokKit</p>
          <p className="mt-1">
            Editable business document packages for South African small
            businesses.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/industries" className="hover:text-[#147d64]">
            Industries
          </Link>
          <Link href="/packages" className="hover:text-[#147d64]">
            Packages
          </Link>
          <Link href="/single-documents" className="hover:text-[#147d64]">
            Single documents
          </Link>
        </div>
      </div>
    </footer>
  );
}
