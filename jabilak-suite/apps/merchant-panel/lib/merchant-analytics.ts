import { supabase } from "@/lib/supabase/client";

export type MerchantPeakHour = {
  label: string;
  hour: number;
  salesCount: number;
};

export type MerchantQuickAnalytics = {
  grossSales: number;
  totalCosts: number;
  pendingDebts: number;
  netProfit: number;
  peakHour: string | null;
  peakHours: MerchantPeakHour[];
};

type RpcPayload = {
  gross_sales?: number | string | null;
  total_costs?: number | string | null;
  pending_debts?: number | string | null;
  net_profit?: number | string | null;
  peak_hour?: string | null;
  peak_hours?: Array<{ label?: string; hour?: number; sales_count?: number }> | null;
};

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Fetches the low-cost, single-request merchant dashboard analytics RPC. */
export async function getMerchantQuickAnalytics(merchantId: string): Promise<MerchantQuickAnalytics> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.rpc("get_merchant_quick_analytics", {
    p_merchant_id: merchantId,
  });
  if (error) throw error;

  const payload = (data ?? {}) as RpcPayload;
  return {
    grossSales: numberValue(payload.gross_sales),
    totalCosts: numberValue(payload.total_costs),
    pendingDebts: numberValue(payload.pending_debts),
    netProfit: numberValue(payload.net_profit),
    peakHour: payload.peak_hour || null,
    peakHours: (payload.peak_hours ?? [])
      .map((item) => ({
        label: item.label ?? "",
        hour: numberValue(item.hour),
        salesCount: numberValue(item.sales_count),
      }))
      .filter((item) => item.label && item.salesCount > 0),
  };
}
