import { getAdminSettings, type AdminPromotionalPlan } from "@/lib/admin-settings";

export type PromotionalPlan = AdminPromotionalPlan;

export const PAYMENT_ACCOUNT = getAdminSettings().payment;
export const PROMOTIONAL_PLANS = getAdminSettings().promotionalPlans;

export function getPromotionalPlan(days: number) {
  return PROMOTIONAL_PLANS.find((plan) => plan.days === days) ?? PROMOTIONAL_PLANS[0];
}

export function formatPromotionalAmount(plan: PromotionalPlan) {
  return plan.currency === "USD"
    ? `$${plan.amount.toLocaleString("en-US")}`
    : `${plan.amount.toLocaleString("en-US")} د.ع`;
}
