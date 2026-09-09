import { requireSupabase, requireUser } from "./client";

export async function getCurrentCompanyId() {
  const client = requireSupabase();
  const user = await requireUser();
  const { data, error } = await client.from("companies").select("id").eq("owner_id", user.id).maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error("لا توجد شركة مرتبطة بهذا المستخدم. أنشئ ملف المتجر أولاً.");
  return data.id as string;
}

export async function listMerchantProducts() {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  const { data, error } = await client.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    previousPrice: row.previous_price == null ? undefined : Number(row.previous_price),
    quantity: Number(row.quantity),
    category: row.category ?? "",
    productType: "أخرى",
    typeManuallySet: false,
    sku: row.sku ?? "",
    description: row.description ?? "",
    options: row.options ? JSON.stringify(row.options) : "",
    published: row.publication_status === "published",
    createdAt: new Date(row.created_at).getTime(),
    tone: "#81B7EC",
    icon: "inventory-2",
  }));
}

export async function saveMerchantProduct(input: { id?: string; name: string; price: number; previousPrice?: number; quantity: number; category?: string; sku?: string; description?: string; options?: string; published: boolean }) {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  let options: unknown = {};
  if (input.options?.trim()) {
    try { options = JSON.parse(input.options); } catch { throw new Error("خيارات المنتج يجب أن تكون JSON صحيحة."); }
  }
  const row = { company_id: companyId, name: input.name.trim(), price: input.price, previous_price: input.previousPrice ?? null, quantity: input.quantity, category: input.category || null, sku: input.sku || null, description: input.description || null, options, publication_status: input.published ? "published" : "hidden" };
  if (input.id) {
    const { data, error } = await client.from("products").update(row).eq("id", input.id).eq("company_id", companyId).select("*").single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await client.from("products").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteMerchantProduct(id: string) {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  const { error } = await client.from("products").delete().eq("id", id).eq("company_id", companyId);
  if (error) throw error;
}

export async function listMerchantDebts() {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  const { data, error } = await client.from("debts").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ id: row.id, name: row.customer_name, phone: "", amount: Number(row.total_amount), paid: Number(row.paid_amount), due: row.due_date ?? "", status: row.status === "overdue" ? "متأخر" : row.status === "paid" ? "منتظم" : "قريب" }));
}

export async function createMerchantDebt(input: { name: string; amount: number; phone?: string }) {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  const { data, error } = await client.from("debts").insert({ company_id: companyId, customer_name: input.name.trim(), total_amount: input.amount, paid_amount: 0, status: "open", notes: input.phone?.trim() || null }).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteMerchantDebt(id: string) {
  const client = requireSupabase();
  const companyId = await getCurrentCompanyId();
  const { error } = await client.from("debts").delete().eq("id", id).eq("company_id", companyId);
  if (error) throw error;
}

export async function recordMerchantDebtPayment(id: string, amount: number, note?: string) {
  const client = requireSupabase();
  const user = await requireUser();
  const { data: debt, error: debtError } = await client.from("debts").select("*").eq("id", id).single();
  if (debtError) throw debtError;
  const { error: paymentError } = await client.from("debt_payments").insert({ debt_id: id, amount, note: note || null, created_by: user.id });
  if (paymentError) throw paymentError;
  const paid = Number(debt.paid_amount) + amount;
  const status = paid >= Number(debt.total_amount) ? "paid" : paid > 0 ? "partially_paid" : "open";
  const { error } = await client.from("debts").update({ paid_amount: paid, status }).eq("id", id);
  if (error) throw error;
}
