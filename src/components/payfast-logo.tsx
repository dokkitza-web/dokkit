import Image from "next/image";

export function PayfastLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/payfast-by-network.svg"
      alt="Payfast by Network"
      width={112}
      height={40}
      className={className}
    />
  );
}
