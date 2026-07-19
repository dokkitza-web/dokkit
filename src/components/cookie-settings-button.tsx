"use client";

import { useConsent } from "@/components/analytics-provider";

export function CookieSettingsButton({
  className = "",
}: {
  className?: string;
}) {
  const { openSettings } = useConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      className={className}
    >
      Cookie settings
    </button>
  );
}
