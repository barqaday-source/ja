export type DeliveryRegion = "inside_province" | "outside_province";

export type CartLine = {
  productId?: string;
  productName?: string;
  price: number;
  quantity: number;
  availableQuantity?: number;
};

export type DeliverySettings = {
  insideProvince: number | null;
  outsideProvince: number | null;
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  insideProvince: null,
  outsideProvince: null,
};

export function calculateCartTotals(
  items: CartLine[],
  region: DeliveryRegion = "inside_province",
  deliverySettings: DeliverySettings = DEFAULT_DELIVERY_SETTINGS,
) {
  const safeItems = items.filter((item) => item.quantity > 0);
  const subtotal = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = safeItems.length
    ? region === "inside_province" ? deliverySettings.insideProvince : deliverySettings.outsideProvince
    : 0;
  const discount = 0;
  const total = delivery === null ? null : Math.max(0, subtotal + delivery - discount);

  return {
    subtotal,
    delivery,
    discount,
    total,
  };
}

export function updateCartQuantity(items: CartLine[], productId: string, delta: number) {
  return items
    .map((item) => item.productId === productId
      ? { ...item, quantity: Math.max(0, Math.min(item.quantity + delta, item.availableQuantity ?? Number.MAX_SAFE_INTEGER)) }
      : item)
    .filter((item) => item.quantity > 0);
}
