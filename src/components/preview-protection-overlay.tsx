export function PreviewProtectionOverlay({
  variant = "thumbnail",
  compactOnMobile = false,
}: {
  variant?: "thumbnail" | "full";
  compactOnMobile?: boolean;
}) {
  const isFull = variant === "full";

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 block overflow-hidden"
    >
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className={`-rotate-[24deg] border-y-2 border-[#ff6a00]/25 bg-white/45 px-5 py-2 text-center font-black uppercase text-[#c24100]/25 shadow-sm ${
            isFull
              ? "text-2xl sm:px-8 sm:py-3 sm:text-4xl"
              : compactOnMobile
                ? "text-[10px] md:text-lg"
                : "text-sm sm:text-lg"
          }`}
        >
          DokKit Preview
        </span>
      </span>

      <span
        className={`absolute inset-x-0 bottom-0 flex items-center border-t border-[#ff6a00] bg-[#111111]/92 font-bold text-white ${
          isFull
            ? "min-h-8 gap-2 px-3 py-1.5 text-[10px] sm:min-h-10 sm:px-4 sm:text-xs"
            : compactOnMobile
              ? "min-h-5 gap-1 px-1 py-0.5 text-[7px] md:min-h-7 md:gap-2 md:px-2 md:text-[9px]"
              : "min-h-7 gap-1.5 px-2 py-1 text-[8px] sm:gap-2 sm:text-[9px]"
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-sm bg-white font-black text-[#111111] ${
            isFull
              ? "h-5 w-5 text-[8px] sm:h-6 sm:w-6 sm:text-[9px]"
              : compactOnMobile
                ? "h-3.5 w-3.5 text-[6px] md:h-5 md:w-5 md:text-[8px]"
                : "h-4 w-4 text-[6px] sm:h-5 sm:w-5 sm:text-[8px]"
          }`}
        >
          DK
        </span>
        <span className={compactOnMobile && !isFull ? "hidden md:inline" : ""}>
          DokKit
        </span>
        <span className="ml-auto uppercase">
          Preview only
          <span
            className={
              compactOnMobile && !isFull
                ? "hidden md:inline"
                : "hidden sm:inline"
            }
          >
            {" "}
            &bull; dokkit.co.za
          </span>
        </span>
      </span>
    </span>
  );
}
