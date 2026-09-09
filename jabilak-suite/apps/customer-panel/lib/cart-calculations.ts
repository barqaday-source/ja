export type CartLine = {
  price: number;
  quantity: number;
};

export function calculateCartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = items.length ? 5000 : 0;
  const discount = items.length ? 20000 : 0;

  return {
    subtotal,
    delivery,
    discount,
    total: Math.max(0, subtotal + delivery - discount),
  };
}
