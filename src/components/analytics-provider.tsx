"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type ConsentPreferences,
  GOOGLE_MEASUREMENT_ID,
  META_PIXEL_ID,
  getConsentPreferencesSnapshot,
  initialiseGoogleAnalytics,
  initialiseMetaPixel,
  persistConsentPreferences,
  readConsentPreferences,
  subscribeToConsentPreferences,
  trackGooglePageView,
  trackMetaPageView,
} from "@/lib/analytics";

type ConsentContextValue = {
  preferences: ConsentPreferences | null;
  ready: boolean;
  openSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used inside AnalyticsProvider.");
  }

  return context;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [draftMarketing, setDraftMarketing] = useState(false);
  const lastGooglePath = useRef<string | null>(null);
  const lastMetaPath = useRef<string | null>(null);
  const isAdmin = pathname.startsWith("/admin");
  const consentSnapshot = useSyncExternalStore(
    subscribeToConsentPreferences,
    getConsentPreferencesSnapshot,
    () => null,
  );
  const preferences = useMemo(
    () => (consentSnapshot === null ? null : readConsentPreferences()),
    [consentSnapshot],
  );
  const ready = consentSnapshot !== null;
  const hasChoice = Boolean(preferences);
  const metaReady = Boolean(
    preferences?.marketing && META_PIXEL_ID && !isAdmin,
  );

  useEffect(() => {
    if (!preferences || isAdmin) {
      return;
    }

    if (GOOGLE_MEASUREMENT_ID) {
      initialiseGoogleAnalytics(preferences);
    }

    if (preferences.marketing && META_PIXEL_ID) {
      initialiseMetaPixel(preferences);
    } else if (window.fbq) {
      window.fbq("consent", "revoke");
    }
  }, [isAdmin, preferences]);

  useEffect(() => {
    if (!preferences || isAdmin) {
      return;
    }

    if (
      preferences.analytics &&
      GOOGLE_MEASUREMENT_ID &&
      lastGooglePath.current !== pathname
    ) {
      trackGooglePageView(pathname);
      lastGooglePath.current = pathname;
    }

    if (
      preferences.marketing &&
      META_PIXEL_ID &&
      pathname !== "/checkout/success" &&
      lastMetaPath.current !== pathname
    ) {
      trackMetaPageView(pathname);
      lastMetaPath.current = pathname;
    }
  }, [isAdmin, pathname, preferences]);

  function savePreferences(analytics: boolean, marketing: boolean) {
    const nextPreferences = persistConsentPreferences({
      analytics,
      marketing,
    });

    initialiseGoogleAnalytics(nextPreferences);
    setDraftAnalytics(analytics);
    setDraftMarketing(marketing);
    setSettingsOpen(false);
  }

  function openSettings() {
    setDraftAnalytics(preferences?.analytics ?? false);
    setDraftMarketing(preferences?.marketing ?? false);
    setSettingsOpen(true);
  }

  return (
    <ConsentContext.Provider
      value={{
        preferences,
        ready,
        openSettings,
      }}
    >
      {children}

      {metaReady ? (
        <Script
          id="dokkit-meta-pixel"
          src="https://connect.facebook.net/en_US/fbevents.js"
          strategy="afterInteractive"
        />
      ) : null}

      {ready && !hasChoice && !isAdmin ? (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9d2ca] bg-white px-6 py-5 shadow-[0_-12px_30px_rgba(17,17,17,0.12)] lg:px-8"
          role="region"
          aria-label="Cookie consent"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-base font-bold text-[#111111]">
                Your privacy choices
              </p>
              <p className="mt-1 text-sm leading-6 text-[#5f5f66]">
                DokKit uses essential storage for the cart and secure checkout.
                With your permission, analytics helps us improve the shop and
                marketing cookies help measure campaigns.{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Privacy and cookies
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => savePreferences(false, false)}
                className="rounded-md border border-[#cfc7bd] bg-white px-4 py-2.5 text-sm font-bold text-[#111111] transition hover:bg-[#f6f4f1]"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="rounded-md border border-[#005f73] bg-white px-4 py-2.5 text-sm font-bold text-[#005f73] transition hover:bg-[#eef7f7]"
              >
                Manage
              </button>
              <button
                type="button"
                onClick={() => savePreferences(true, true)}
                className="rounded-md bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d95400]"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen && !isAdmin ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl sm:p-8">
            <h2
              id="cookie-settings-title"
              className="text-2xl font-semibold text-[#111111]"
            >
              Cookie preferences
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
              Essential storage supports the cart, payment security and your
              privacy choice. It is always active.
            </p>

            <div className="mt-6 divide-y divide-[#ece7df] border-y border-[#ece7df]">
              <div className="flex items-start justify-between gap-5 py-5">
                <div>
                  <p className="font-bold text-[#111111]">Essential</p>
                  <p className="mt-1 text-sm leading-6 text-[#5f5f66]">
                    Cart, checkout, fraud prevention and consent storage.
                  </p>
                </div>
                <span className="text-sm font-bold text-[#005f73]">
                  Always on
                </span>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-5 py-5">
                <span>
                  <span className="block font-bold text-[#111111]">
                    Analytics
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#5f5f66]">
                    Google Analytics 4 shows which pages and products help
                    customers most.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={draftAnalytics}
                  onChange={(event) => setDraftAnalytics(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#005f73]"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-5 py-5">
                <span>
                  <span className="block font-bold text-[#111111]">
                    Marketing
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#5f5f66]">
                    Meta Pixel and Conversions API measure Facebook and
                    Instagram campaign results.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={draftMarketing}
                  onChange={(event) => setDraftMarketing(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#005f73]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-md border border-[#cfc7bd] px-4 py-2.5 text-sm font-bold text-[#111111] transition hover:bg-[#f6f4f1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  savePreferences(draftAnalytics, draftMarketing)
                }
                className="rounded-md bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d95400]"
              >
                Save choices
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConsentContext.Provider>
  );
}
