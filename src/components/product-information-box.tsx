import Link from "next/link";
import { PRODUCT_INFORMATION_COPY } from "@/data/legal-policies";

export function ProductInformationBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <aside
      className={`border-l-4 border-[#ff6a00] bg-[#fff7f0] p-5 ${className}`}
      aria-label="Product purchase information"
    >
      <p className="text-sm leading-6 text-[#3f3f43]">
        {PRODUCT_INFORMATION_COPY}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
        <Link
          href="/licence"
          className="text-[#005f73] underline underline-offset-4"
        >
          Template Licence
        </Link>
        <Link
          href="/digital-delivery"
          className="text-[#005f73] underline underline-offset-4"
        >
          Digital Delivery Policy
        </Link>
        <Link
          href="/refunds"
          className="text-[#005f73] underline underline-offset-4"
        >
          Refund and Remedy Policy
        </Link>
      </div>
    </aside>
  );
}
