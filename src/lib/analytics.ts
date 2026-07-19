import type { CartItem } from "@/lib/cart";

export const CONSENT_STORAGE_KEY = "dokkit-consent-v1";
export const CONSENT_CHANGED_EVENT = "dokkit-consent-changed";
let volatileConsentSnapshot: string | null = null;

export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type AnalyticsItem = {
  itemId: string;
  itemName: string;
  itemCategory: string;
  priceCents: number;
  quantity: number;
};

type MetaAttribution = {
  fbp?: string;
  fbc?: string;
};

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
    __dokkitGoogleConfigured?: boolean;
    __dokkitMetaConfigured?: boolean;
  }
}

export const GOOGLE_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

export function initialiseGoogleAnalytics(preferences: ConsentPreferences) {
  if (!GOOGLE_MEASUREMENT_ID) {
    return false;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  if (!window.__dokkitGoogleConfigured) {
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
    window.__dokkitGoogleConfigured = true;
  }

  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
  });

  return preferences.analytics;
}

export function initialiseMetaPixel(preferences: ConsentPreferences) {
  if (!preferences.marketing || !META_PIXEL_ID) {
    return false;
  }

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    }) as NonNullable<Window["fbq"]>;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!window.__dokkitMetaConfigured) {
    window.fbq("init", META_PIXEL_ID);
    window.__dokkitMetaConfigured = true;
  }

  window.fbq("consent", "grant");
  return true;
}

function isConsentPreferences(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ConsentPreferences>;

  return (
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
}

export function readConsentPreferences() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = getConsentPreferencesSnapshot();

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isConsentPreferences(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function persistConsentPreferences(
  preferences: Omit<ConsentPreferences, "updatedAt">,
) {
  const nextPreferences: ConsentPreferences = {
    ...preferences,
    updatedAt: new Date().toISOString(),
  };
  const serializedPreferences = JSON.stringify(nextPreferences);

  volatileConsentSnapshot = serializedPreferences;

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serializedPreferences);
  } catch {
    // The in-memory choice still applies for the current page.
  }

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));

  return nextPreferences;
}

export function getConsentPreferencesSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return (
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ??
      volatileConsentSnapshot ??
      ""
    );
  } catch {
    return volatileConsentSnapshot ?? "";
  }
}

export function subscribeToConsentPreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  };
}

export function createEventId(prefix: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${randomPart}`;
}

export function getSafePageLocation(pathname?: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const safePathname = pathname ?? window.location.pathname;
  return `${window.location.origin}${safePathname}`;
}

export function toAnalyticsItem(
  item: Pick<CartItem, "slug" | "name" | "category" | "priceCents" | "quantity">,
): AnalyticsItem {
  return {
    itemId: item.slug,
    itemName: item.name,
    itemCategory: item.category,
    priceCents: item.priceCents,
    quantity: item.quantity,
  };
}

function toGoogleItem(item: AnalyticsItem) {
  return {
    item_id: item.itemId,
    item_name: item.itemName,
    item_category: item.itemCategory,
    price: item.priceCents / 100,
    quantity: item.quantity,
  };
}

function toMetaContents(items: AnalyticsItem[]) {
  return items.map((item) => ({
    id: item.itemId,
    quantity: item.quantity,
    item_price: item.priceCents / 100,
  }));
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!cookie) {
    return undefined;
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length)).slice(0, 255);
  } catch {
    return undefined;
  }
}

export function getMetaAttribution(): MetaAttribution | undefined {
  const preferences = readConsentPreferences();

  if (!preferences?.marketing) {
    return undefined;
  }

  const attribution = {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };

  return attribution;
}

function wasSent(channel: "ga" | "meta", dedupeKey?: string) {
  if (!dedupeKey || typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(`dokkit:${channel}:${dedupeKey}`) === "sent"
    );
  } catch {
    return false;
  }
}

function markAsSent(channel: "ga" | "meta", dedupeKey?: string) {
  if (!dedupeKey || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(`dokkit:${channel}:${dedupeKey}`, "sent");
  } catch {
    // Dedupe is optional when browser storage is unavailable.
  }
}

function sendMetaBrowserAndServerEvent({
  eventName,
  eventId,
  customData,
}: {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";
  eventId: string;
  customData: Record<string, unknown>;
}) {
  window.fbq?.("track", eventName, customData, { eventID: eventId });

  void fetch("/api/analytics/meta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: getSafePageLocation(),
      customData,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt a customer action.
  });
}

export function trackGooglePageView(pathname: string) {
  const preferences = readConsentPreferences();
  const safeLocation = getSafePageLocation(pathname);

  if (
    preferences?.analytics &&
    initialiseGoogleAnalytics(preferences) &&
    window.gtag
  ) {
    window.gtag("event", "page_view", {
      page_location: safeLocation,
      page_path: pathname,
      page_title: document.title,
    });
  }
}

export function trackMetaPageView(pathname: string) {
  const preferences = readConsentPreferences();

  if (
    preferences?.marketing &&
    initialiseMetaPixel(preferences) &&
    window.fbq &&
    pathname !== "/checkout/success"
  ) {
    sendMetaBrowserAndServerEvent({
      eventName: "PageView",
      eventId: createEventId("pageview"),
      customData: {},
    });
  }
}

const googleEventNames = {
  view_item: "view_item",
  add_to_cart: "add_to_cart",
  begin_checkout: "begin_checkout",
} as const;

const metaEventNames = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
} as const;

export function trackCommerceEvent({
  name,
  items,
  valueCents,
  dedupeKey,
}: {
  name: keyof typeof googleEventNames;
  items: AnalyticsItem[];
  valueCents: number;
  dedupeKey?: string;
}) {
  const preferences = readConsentPreferences();
  const commonParameters = {
    currency: "ZAR",
    value: valueCents / 100,
  };

  if (
    preferences?.analytics &&
    initialiseGoogleAnalytics(preferences) &&
    window.gtag &&
    !wasSent("ga", dedupeKey)
  ) {
    window.gtag("event", googleEventNames[name], {
      ...commonParameters,
      items: items.map(toGoogleItem),
      page_location: getSafePageLocation(),
    });
    markAsSent("ga", dedupeKey);
  }

  if (
    preferences?.marketing &&
    initialiseMetaPixel(preferences) &&
    window.fbq &&
    !wasSent("meta", dedupeKey)
  ) {
    sendMetaBrowserAndServerEvent({
      eventName: metaEventNames[name],
      eventId: createEventId(metaEventNames[name].toLowerCase()),
      customData: {
        ...commonParameters,
        content_ids: items.map((item) => item.itemId),
        content_name:
          items.length === 1 ? items[0].itemName : "DokKit order",
        content_type: "product",
        contents: toMetaContents(items),
      },
    });
    markAsSent("meta", dedupeKey);
  }
}

export function trackGooglePurchase({
  transactionId,
  items,
  valueCents,
}: {
  transactionId: string;
  items: AnalyticsItem[];
  valueCents: number;
}) {
  const preferences = readConsentPreferences();
  const storageKey = `dokkit:ga:purchase:${transactionId}`;
  let wasAlreadySent = false;

  try {
    wasAlreadySent = window.localStorage.getItem(storageKey) === "sent";
  } catch {
    wasAlreadySent = false;
  }

  if (
    !preferences?.analytics ||
    !initialiseGoogleAnalytics(preferences) ||
    !window.gtag ||
    wasAlreadySent
  ) {
    return;
  }

  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "ZAR",
    value: valueCents / 100,
    items: items.map(toGoogleItem),
    page_location: getSafePageLocation("/checkout/success"),
  });

  try {
    window.localStorage.setItem(storageKey, "sent");
  } catch {
    // The purchase event is still valid without local dedupe storage.
  }
}
