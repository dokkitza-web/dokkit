export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  category: "industry_package" | "single_document";
  description?: string;
};

export const CART_STORAGE_KEY = "dokkit-cart-v1";
export const CART_UPDATED_EVENT = "dokkit-cart-updated";

export function formatCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function formatCartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );
}
