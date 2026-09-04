export type AdminSubscriptionPlan = {
  id: "free" | "standard" | "vip";
  name: string;
  price: number;
  currency: "IQD";
  period: string;
  trialDays?: number;
  recommended?: boolean;
  features: string[];
};

export type AdminPromotionalPlan = {
  days: number;
  label: string;
  amount: number;
  currency: "USD" | "IQD";
  placement: "top_carousel";
  rankingLabel: string;
};

export type AdminManagedSettings = {
  payment: {
    bankName: string;
    bankNameEn: string;
    beneficiary: string;
    accountNumber: string;
    iban: string;
    walletChannels: { id: string; name: string; accountName: string; accountNumber: string }[];
  };
  verificationPlan: { name: string; amount: number; currency: "IQD" | "USD"; period: "مرة واحدة"; annualAmount: number; annualPeriod: "سنوياً"; badgeColors: { primary: string; secondary: string }; publicValue: string };
  contact: {
    whatsappNumber: string;
    supportPhone: string;
    supportWhatsapp: string;
    supportEmail: string;
  };
  promotionalPlans: AdminPromotionalPlan[];
  subscriptionPlans: AdminSubscriptionPlan[];
};

/**
 * Preview source for the current mock build.
 * Replace this object with a Supabase/admin-settings repository before production.
 */
export const PREVIEW_ADMIN_SETTINGS: AdminManagedSettings = {
  payment: {
    bankName: "مصرف الرافدين",
    bankNameEn: "Rafidain Bank",
    beneficiary: "صاحب براند سيسافانا",
    accountNumber: "3972330645",
    iban: "IQ52RAFB098010017192673",
    walletChannels: [
      { id: "zaincash", name: "زين كاش", accountName: "سيسافانا", accountNumber: "07700000000" },
      { id: "asiahawala", name: "آسيا حوالة", accountName: "سيسافانا", accountNumber: "07700000000" },
      { id: "qi", name: "كي كارد", accountName: "سيسافانا", accountNumber: "07700000000" },
    ],
  },
  verificationPlan: { name: "توثيق المتجر المنفرد", amount: 10_000, currency: "IQD", period: "مرة واحدة", annualAmount: 10_000, annualPeriod: "سنوياً", badgeColors: { primary: "#2563EB", secondary: "#CA8A04" }, publicValue: "علامة ثقة تقلل انتحال اسم المتجر" },
  contact: {
    whatsappNumber: "9647700000000",
    supportPhone: "9647700000000",
    supportWhatsapp: "9647700000000",
    supportEmail: "support@jayblak.demo",
  },
  promotionalPlans: [
    { days: 3, label: "3 أيام", amount: 5_000, currency: "IQD", placement: "top_carousel", rankingLabel: "أولوية التوصية حسب المنطقة والفئة في أبو العريف" },
  ],
  subscriptionPlans: [
    { id: "free", name: "التجريبية (Free)", price: 0, currency: "IQD", period: "14 يوماً", trialDays: 14, features: ["إدارة 15 منتجاً", "دفتر ديون مصغر حتى 5 زبائن"] },
    { id: "standard", name: "باقة التاجر (Standard)", price: 15_000, currency: "IQD", period: "شهرياً", features: ["مخزن ضخم مفتوح", "دفتر ديون غير محدود", "ظهور في بحث أبو العريف"] },
    { id: "vip", name: "باقة الرويال (VIP & Ads)", price: 35_000, currency: "IQD", period: "شهرياً", recommended: true, features: ["جميع الميزات", "علامة التوثيق ✔", "ترويج منشورين في التوب سلايدر شهرياً", "الأولوية في نتائج البحث"] },
  ],
};

export interface AdminSettingsRepository {
  getSettings(): Promise<AdminManagedSettings>;
  updateSettings(patch: Partial<AdminManagedSettings>): Promise<AdminManagedSettings>;
}

export const previewAdminSettingsRepository: AdminSettingsRepository = {
  async getSettings() {
    return PREVIEW_ADMIN_SETTINGS;
  },
  async updateSettings(patch) {
    Object.assign(PREVIEW_ADMIN_SETTINGS, patch);
    return PREVIEW_ADMIN_SETTINGS;
  },
};

export function getAdminSettings() {
  return PREVIEW_ADMIN_SETTINGS;
}
