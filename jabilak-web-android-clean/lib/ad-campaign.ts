export function normalizeBudget(value: string) {
  return Math.max(0, Number(value.replace(/[^0-9]/g, "")) || 0);
}

export function calculateCampaignTotal(dailyBudget: number, duration: number) {
  return Math.max(0, dailyBudget) * Math.max(0, duration);
}

export function validateCampaignSubmission({
  consent,
  paymentConfirmed,
  paymentMethod,
}: {
  consent: boolean;
  paymentConfirmed: boolean;
  paymentMethod: string;
}) {
  if (!consent) return "consent" as const;
  if (!paymentMethod) return "payment-method" as const;
  if (!paymentConfirmed) return "payment" as const;
  return null;
}
