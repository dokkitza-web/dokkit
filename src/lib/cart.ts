export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  category: "industry_package" | "single_document";
  description?: string;
  originalPriceCents?: number;
  discountPercent?: number;
  offerLabel?: string;
  offerStartsAt?: string;
  offerEndsAt?: string;
};

// A new cart namespace prevents retired catalogue items from appearing in a
// customer cart after the trade-pack catalogue change.
export const CART_STORAGE_KEY = "dokkit-cart-v2";
export const CART_UPDATED_EVENT = "dokkit-cart-updated";

export function formatCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function isOfferPriceCurrent(item: CartItem, now = new Date()) {
  if (!item.offerStartsAt || !item.offerEndsAt) {
    return true;
  }

  const nowTime = now.getTime();

  return (
    nowTime >= new Date(item.offerStartsAt).getTime() &&
    nowTime <= new Date(item.offerEndsAt).getTime()
  );
}

export function getCartItemUnitPriceCents(item: CartItem, now = new Date()) {
  if (
    item.originalPriceCents &&
    item.originalPriceCents > item.priceCents &&
    !isOfferPriceCurrent(item, now)
  ) {
    return item.originalPriceCents;
  }

  return item.priceCents;
}

export function getCartItemOriginalUnitPriceCents(item: CartItem) {
  return item.originalPriceCents ?? item.priceCents;
}

export function getCartItemLineTotalCents(item: CartItem, now = new Date()) {
  return getCartItemUnitPriceCents(item, now) * item.quantity;
}

export function getCartItemOriginalLineTotalCents(item: CartItem) {
  return getCartItemOriginalUnitPriceCents(item) * item.quantity;
}

export function formatCartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + getCartItemLineTotalCents(item),
    0,
  );
}

export function formatCartOriginalTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + getCartItemOriginalLineTotalCents(item),
    0,
  );
}

export function formatCartDiscountTotal(items: CartItem[]) {
  return Math.max(0, formatCartOriginalTotal(items) - formatCartTotal(items));
}
