import Image from "next/image";

export function PayFastLogo({ className = "w-40" }: { className?: string }) {
  return (
    <Image
      src="/payfast-logo.png"
      alt="PayFast by Network"
      width={1202}
      height={516}
      className={`h-auto object-contain ${className}`}
    />
  );
}

export function PaymentMethods() {
  return (
    <div className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase text-[#f26a21]">
        Supported payment method
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <PayFastLogo />
        <span className="rounded-md border border-[#eadfd4] bg-[#fbf8f5] px-3 py-1.5 text-xs font-bold text-[#5f5a54]">
          Secure online payment
        </span>
        <span className="rounded-md border border-[#eadfd4] bg-[#fbf8f5] px-3 py-1.5 text-xs font-bold text-[#5f5a54]">
          South African checkout support
        </span>
      </div>
    </div>
  );
}
