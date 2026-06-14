"use client";

import { useState } from "react";

type DownloadResponse = {
  downloadUrl?: string;
  error?: string;
};

function formatFileKind(kind: string) {
  return kind.toUpperCase();
}

export function DownloadFileButton({
  orderNumber,
  accessToken,
  productFileId,
  fileKind,
  versionLabel,
}: {
  orderNumber: string;
  accessToken: string;
  productFileId: string;
  fileKind: string;
  versionLabel: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          accessToken,
          productFileId,
        }),
      });
      const payload = (await response.json()) as DownloadResponse;

      if (!response.ok || !payload.downloadUrl) {
        setError(payload.error ?? "Could not create a secure download link.");
        return;
      }

      window.open(payload.downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not create a secure download link.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={requestDownload}
        disabled={isLoading}
        className="inline-flex rounded-md bg-[#147d64] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f604d] disabled:cursor-not-allowed disabled:bg-[#9ab9ae]"
      >
        {isLoading
          ? "Creating link..."
          : `Download ${formatFileKind(fileKind)} ${versionLabel}`}
      </button>
      {error ? (
        <p className="mt-2 text-xs leading-5 text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
