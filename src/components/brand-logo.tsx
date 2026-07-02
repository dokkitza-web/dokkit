import Link from "next/link";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#111111] text-sm font-bold text-white shadow-sm">
        DK
      </span>
      <span className="leading-none">
        <span className="block text-xl font-bold">
          <span className="text-[#f26a21]">Dok</span>
          <span className="text-[#111111]">Kit</span>
        </span>
        {!compact ? (
          <span className="hidden text-xs font-medium text-[#6f6a64] sm:block">
            Business document packs
          </span>
        ) : null}
      </span>
    </Link>
  );
}
