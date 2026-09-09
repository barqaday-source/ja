import { supabase } from "@/lib/supabase/client";
import type { CartLine, DeliveryRegion, DeliverySettings } from "@/lib/cart-calculations";
import { calculateCartTotals } from "@/lib/cart-calculations";

export type OrderCustomerDetails = {
  name: string;
  phone: string;
  region: DeliveryRegion;
  deliveryAddress?: string;
};

export type SubmitOrderInput = {
  companyId: string;
  customer: OrderCustomerDetails;
  items: CartLine[];
  deliverySettings?: DeliverySettings;
};

export async function submitOrder(input: SubmitOrderInput) {
  if (!supabase) throw new Error("Supabase is not configured");
  if (!input.items.length) throw new Error("Cart is empty");

  const totals = calculateCartTotals(input.items, input.customer.region, input.deliverySettings);
  if (totals.total === null || totals.delivery === null) {
    throw new Error("لم يحدد التاجر أجور التوصيل لهذه المنطقة بعد");
  }
  const { data, error } = await supabase.rpc("create_order_from_cart", {
    p_company_id: input.companyId,
    p_customer_name: input.customer.name.trim(),
    p_customer_phone: input.customer.phone.trim(),
    p_delivery_region: input.customer.region,
    p_delivery_address: input.customer.deliveryAddress?.trim() || null,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
    })),
    p_subtotal: totals.subtotal,
    p_delivery_fee: totals.delivery,
    p_discount: totals.discount,
    p_total: totals.total,
  });
  if (error) throw error;
  return data as { order_id: string; status: string; total: number };
}

export async function markOrderItemUnavailable(orderId: string, productId: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("mark_order_item_unavailable", {
    p_order_id: orderId,
    p_product_id: productId,
  });
  if (error) throw error;
  return data as { order_id: string; removed_product_id: string; new_total: number; message: string };
}
