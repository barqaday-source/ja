/**
 * Product focus for the first Jabilak release.
 * Deferred areas stay in the codebase but are not placed in the primary path.
 */
export const MVP_CONFIG = {
  positioning: "social-commerce",
  customerCore: ["discover", "search", "shop", "product", "chat", "booking"],
  merchantCore: ["add-product", "inventory", "orders", "debts"],
  showPromotionsOnHome: false,
  showMerchantBannerOnCustomerHome: false,
} as const;
