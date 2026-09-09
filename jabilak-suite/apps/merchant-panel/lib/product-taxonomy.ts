export const PRODUCT_TYPES = ["ملابس", "أحذية", "إلكترونيات", "أثاث", "أطعمة", "مجوهرات", "مستلزمات منزلية", "سيارات", "خدمات", "إكسسوارات", "أخرى"] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  ملابس: "checkroom",
  أحذية: "steps",
  إلكترونيات: "devices",
  أثاث: "chair",
  أطعمة: "restaurant",
  مجوهرات: "diamond",
  "مستلزمات منزلية": "home",
  سيارات: "directions-car",
  خدمات: "storefront",
  إكسسوارات: "watch",
  أخرى: "category",
};

type ProductSignals = { name?: string; description?: string; category?: string };

const RULES: Array<{ type: ProductType; keywords: string[] }> = [
  { type: "أحذية", keywords: ["حذاء", "أحذية", "جزمة", "صندل", "نعال", "سنيكر", "رياضي"] },
  { type: "ملابس", keywords: ["قميص", "جاكيت", "بنطلون", "فستان", "عباية", "ملابس", "تيشيرت", "معطف", "سترة", "أزياء"] },
  { type: "إلكترونيات", keywords: ["هاتف", "سماعة", "لابتوب", "حاسوب", "شاحن", "إلكترون", "كاميرا", "تلفاز"] },
  { type: "أطعمة", keywords: ["طعام", "غذاء", "أطعمة", "مأكولات", "حلويات", "قهوة", "عصير", "سلة مواد"] },
  { type: "مجوهرات", keywords: ["ذهب", "مجوهرات", "سوار", "خاتم", "قلادة", "ألماس"] },
  { type: "أثاث", keywords: ["أثاث", "كرسي", "طاولة", "سرير", "أريكة", "خزانة"] },
  { type: "مستلزمات منزلية", keywords: ["منزل", "مطبخ", "تنظيف", "تغليف", "علب", "أدوات منزلية"] },
  { type: "سيارات", keywords: ["سيارة", "سيارات", "إطارات", "قطع غيار", "محرك"] },
  { type: "إكسسوارات", keywords: ["حزام", "حقيبة", "محفظة", "ساعة", "إكسسوار"] },
  { type: "خدمات", keywords: ["خدمة", "صيانة", "تصميم", "توصيل", "استشارة"] },
];

export function inferProductType({ name = "", description = "", category = "" }: ProductSignals): ProductType {
  const productText = `${name} ${description}`.trim().toLowerCase();
  const categoryText = category.trim().toLowerCase();
  const directMatch = RULES.find((rule) => rule.keywords.some((keyword) => productText.includes(keyword.toLowerCase())));
  if (directMatch) return directMatch.type;
  const categoryMatch = RULES.find((rule) => rule.keywords.some((keyword) => categoryText.includes(keyword.toLowerCase())));
  return categoryMatch?.type ?? "أخرى";
}

export function isProductType(value: string): value is ProductType {
  return PRODUCT_TYPES.includes(value as ProductType);
}
