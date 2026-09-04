import { describe, expect, it } from "vitest";

import { calculateCartTotals } from "../lib/cart-calculations";

describe("calculateCartTotals", () => {
  it("calculates subtotal, delivery, discount, and total from cart lines", () => {
    expect(calculateCartTotals([
      { price: 120000, quantity: 1 },
      { price: 250000, quantity: 1 },
      { price: 150000, quantity: 2 },
    ])).toEqual({ subtotal: 670000, delivery: 5000, discount: 20000, total: 655000 });
  });

  it("does not add delivery or discount to an empty cart", () => {
    expect(calculateCartTotals([])).toEqual({ subtotal: 0, delivery: 0, discount: 0, total: 0 });
  });
});
