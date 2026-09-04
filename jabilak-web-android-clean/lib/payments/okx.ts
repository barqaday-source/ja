export type PaymentProvider = "okx";
export type PaymentIntentStatus = "not_configured" | "pending" | "paid" | "failed";

export type PaymentIntent = {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  description: string;
  status: PaymentIntentStatus;
  checkoutUrl?: string;
};

export type CreatePaymentInput = {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
};

/**
 * Client-safe adapter. It deliberately does not call OKX directly.
 * Create and verify requests belong in the server using provider credentials.
 */
export async function createOkxPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
  return {
    id: `preview-${input.orderId}-${Date.now()}`,
    provider: "okx",
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    status: "not_configured",
  };
}

export function isPaymentConfirmed(intent: PaymentIntent) {
  return intent.status === "paid";
}
