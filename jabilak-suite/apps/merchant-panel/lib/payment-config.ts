import { getAdminSettings, type AdminPromotionalPlan } from "@/lib/admin-settings";

export type PromotionalPlan = AdminPromotionalPlan;

export const PAYMENT_ACCOUNT = getAdminSettings().payment;
export const PROMOTIONAL_PLANS = getAdminSettings().promotionalPlans;

export type LocalPaymentMethod = "cash";

export const LOCAL_PAYMENT_METHODS: Array<{ id: LocalPaymentMethod; label: string; description: string; available: boolean }> = [
  { id: "cash", label: "الدفع النقدي فقط", description: "الدفع نقداً عند الاستلام أو مباشرةً مع إدارة المتجر", available: true },
];

export function getPromotionalPlan(days: number) {
  return PROMOTIONAL_PLANS.find((plan) => plan.days === days) ?? PROMOTIONAL_PLANS[0];
}

export function formatPromotionalAmount(plan: PromotionalPlan) {
  return plan.currency === "USD"
    ? `$${plan.amount.toLocaleString("en-US")}`
    : `${plan.amount.toLocaleString("en-US")} د.ع`;
}
