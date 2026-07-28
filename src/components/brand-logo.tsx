import Link from "next/link";

export function BrandLogo({
  href = "/",
  className = "",
  light = false,
}: {
  href?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2.5 sm:gap-3 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#111111] text-xs font-black text-white shadow-lg shadow-black/10 sm:h-10 sm:w-10 sm:text-sm">
        DK
      </span>
      <span className="text-xl font-black sm:text-2xl">
        <span className={light ? "text-[#ff8a3d]" : "text-[#a63d00]"}>Dok</span>
        <span className={light ? "text-white" : "text-[#111111]"}>Kit</span>
      </span>
    </Link>
  );
}
