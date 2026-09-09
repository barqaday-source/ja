/**
 * نماذج المجال المشتركة في تاجر.
 * هذه الأنواع لا تعتمد على Supabase حتى تبقى الواجهات قابلة للتبديل لاحقاً.
 */
export type UserRole = "customer" | "merchant" | "admin";
export type StockStatus = "available" | "low" | "out_of_stock";
export type PublicationStatus = "published" | "hidden" | "draft" | "pending_review";
export type VerificationStatus = "not_started" | "under_review" | "verified" | "needs_changes";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";
export type DebtStatus = "open" | "partially_paid" | "paid" | "overdue";
export type CampaignStatus = "draft" | "pending_payment" | "pending_review" | "active" | "paused" | "rejected" | "finished";

export interface Profile {
  id: string;
  displayName: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  category?: string;
  province?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  price: number;
  previousPrice?: number;
  quantity: number;
  category?: string;
  sku?: string;
  options?: Record<string, string[]>;
  imageUrls: string[];
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  companyId: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Debt {
  id: string;
  companyId: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  productLimit: number;
  adLimit: number;
  features: string[];
  isRecommended: boolean;
  active: boolean;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  companyId: string;
  subscriptionId?: string;
  campaignId?: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAt?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  companyId: string;
  type: "product" | "company" | "promotion";
  title: string;
  description?: string;
  imageUrl?: string;
  targetProvince?: string;
  targetDistrict?: string;
  targetCategory?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  interests: string[];
  dailyBudget: number;
  totalBudget: number;
  durationDays: number;
  paymentId?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  companyId: string;
  companyType: "individual" | "registered_company" | "store" | "service_provider";
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSnapshot {
  period: "day" | "week" | "month" | "year" | "custom";
  salesTotal: number;
  ordersCount: number;
  customersCount: number;
  viewsCount: number;
  productsCount: number;
  profitTotal: number;
  salesSeries: Array<{ label: string; value: number }>;
}

export interface StorageFile {
  path: string;
  publicUrl?: string;
  mimeType: string;
  size?: number;
}
