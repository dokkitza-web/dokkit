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
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-sm font-black text-white shadow-lg shadow-black/10">
        DK
      </span>
      <span className="text-2xl font-black tracking-tight">
        <span className="text-[#ff6a00]">Dok</span>
        <span className={light ? "text-white" : "text-[#111111]"}>Kit</span>
      </span>
    </Link>
  );
}
