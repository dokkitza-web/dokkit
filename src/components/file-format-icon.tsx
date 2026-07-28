import Image from "next/image";

type FileFormatIconSize = "sm" | "md" | "lg";

const formatIcons = {
  word: {
    label: "Microsoft Word",
    src: "/brand/microsoft-word.svg",
  },
  excel: {
    label: "Microsoft Excel",
    src: "/brand/microsoft-excel.svg",
  },
} as const;

function getFormatIcon(format: string) {
  const normalizedFormat = format.trim().toUpperCase();

  if (normalizedFormat === "WORD" || normalizedFormat === "DOCX") {
    return formatIcons.word;
  }

  if (normalizedFormat === "EXCEL" || normalizedFormat === "XLSX") {
    return formatIcons.excel;
  }

  return null;
}

const sizeClasses: Record<FileFormatIconSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const imageSizes: Record<FileFormatIconSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function FileFormatIcon({
  format,
  size = "md",
  className = "",
}: {
  format: string;
  size?: FileFormatIconSize;
  className?: string;
}) {
  const icon = getFormatIcon(format);

  if (!icon) {
    return (
      <span
        className={`inline-flex min-h-6 items-center rounded-md bg-[#111111] px-2 text-[10px] font-black uppercase text-white ${className}`}
        title={format}
      >
        {format}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${icon.label} file`}
      title={`${icon.label} file`}
      className={`inline-flex shrink-0 items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={icon.src}
        alt=""
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function FileFormatIcons({
  formats,
  size = "md",
  className = "",
}: {
  formats: string[];
  size?: FileFormatIconSize;
  className?: string;
}) {
  const uniqueFormats = [...new Set(formats.map((format) => format.toUpperCase()))];

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-1.5 ${className}`}
    >
      {uniqueFormats.map((format) => (
        <FileFormatIcon key={format} format={format} size={size} />
      ))}
    </span>
  );
}
