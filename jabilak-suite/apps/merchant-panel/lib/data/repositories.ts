import { isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  Campaign,
  Company,
  Debt,
  Order,
  OrderItem,
  Payment,
  Product,
  Profile,
  ReportSnapshot,
  StorageFile,
  Subscription,
  SubscriptionPlan,
  VerificationRequest,
} from "./models";

/**
 * عقد البيانات في تاجر.
 * الواجهات تستدعي هذه العقود فقط، ولا تستورد Supabase مباشرة.
 * The UI must call a Supabase repository; no local/demo persistence is allowed.
 */
export interface AuthRepository {
  getSession(): Promise<{ profile: Profile } | null>;
  signInWithEmail(email: string, password: string): Promise<{ profile: Profile }>;
  signInWithPhone(phone: string, password: string): Promise<{ profile: Profile }>;
  signUp(input: { displayName: string; email?: string; phone?: string; password: string; role: Profile["role"] }): Promise<{ profile: Profile }>;
  signOut(): Promise<void>;
  resetPassword(identifier: string): Promise<void>;
}

export interface CompanyRepository {
  getMine(): Promise<Company | null>;
  update(id: string, patch: Partial<Company>): Promise<Company>;
  listPublic(input?: { search?: string; province?: string; category?: string }): Promise<Company[]>;
}

export interface ProductRepository {
  list(input?: { companyId?: string; search?: string; publicationStatus?: Product["publicationStatus"] }): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, patch: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface OrderRepository {
  listMine(): Promise<Order[]>;
  getItems(orderId: string): Promise<OrderItem[]>;
  create(input: Omit<Order, "id" | "createdAt" | "updatedAt">, items: Array<Omit<OrderItem, "id" | "orderId" | "lineTotal">>): Promise<Order>;
  updateStatus(id: string, status: Order["status"]): Promise<Order>;
}

export interface DebtRepository {
  list(companyId: string): Promise<Debt[]>;
  create(input: Omit<Debt, "id" | "remainingAmount" | "createdAt" | "updatedAt">): Promise<Debt>;
  recordPayment(id: string, amount: number, note?: string): Promise<Debt>;
  delete(id: string): Promise<void>;
}

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  getCurrent(companyId: string): Promise<Subscription | null>;
  listPayments(companyId: string): Promise<Payment[]>;
  startCheckout(planId: string, companyId: string): Promise<{ checkoutUrl: string; paymentId: string }>;
}

export interface CampaignRepository {
  list(companyId: string): Promise<Campaign[]>;
  create(input: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Promise<Campaign>;
  update(id: string, patch: Partial<Campaign>): Promise<Campaign>;
}

export interface VerificationRepository {
  getCurrent(companyId: string): Promise<VerificationRequest | null>;
  submit(input: Omit<VerificationRequest, "id" | "createdAt" | "updatedAt">): Promise<VerificationRequest>;
}

export interface ReportRepository {
  getSnapshot(companyId: string, input: { period: ReportSnapshot["period"]; from?: string; to?: string }): Promise<ReportSnapshot>;
}

export interface StorageRepository {
  upload(input: { bucket: "avatars" | "company-media" | "product-media" | "campaign-media" | "verification-documents"; file: Blob | ArrayBuffer; path: string; contentType: string }): Promise<StorageFile>;
  remove(bucket: string, path: string): Promise<void>;
}

export interface TajerRepositories {
  auth: AuthRepository;
  companies: CompanyRepository;
  products: ProductRepository;
  orders: OrderRepository;
  debts: DebtRepository;
  subscriptions: SubscriptionRepository;
  campaigns: CampaignRepository;
  verification: VerificationRepository;
  reports: ReportRepository;
  storage: StorageRepository;
}

/**
 * Single connection status for the application.
 * عند الربط، مرر SupabaseRepositories إلى providers بدلاً من تعديل كل شاشة.
 */
export const repositoryConfig = {
  backend: "supabase" as const,
  supabaseReady: true,
  connected: isSupabaseConfigured,
};
