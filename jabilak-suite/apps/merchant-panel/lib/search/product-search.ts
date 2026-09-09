import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase/client";

export type ParsedShoppingQuery = {
  raw: string;
  productName: string;
  keywords: string[];
  color?: string;
  location?: string;
  maxPrice?: number;
  occasion?: string;
  style?: string;
  isOutfitRequest: boolean;
};

export type ShoppingProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  sku?: string;
  imageUrl?: string;
  companyName: string;
  companyId?: string;
  companyWhatsapp?: string;
  companyLogo?: string;
  location?: string;
  isSponsored?: boolean;
  isVerified?: boolean;
};

export type ShoppingOutfit = {
  id: string;
  title: string;
  description: string;
  products: ShoppingProduct[];
  totalPrice: number;
};

const COLOR_ALIASES: Record<string, string> = {
  "اسود": "أسود", "أسود": "أسود", "سوداء": "أسود",
  "ابيض": "أبيض", "أبيض": "أبيض", "بيضاء": "أبيض",
  "احمر": "أحمر", "أحمر": "أحمر", "حمراء": "أحمر",
  "ازرق": "أزرق", "أزرق": "أزرق", "زرقاء": "أزرق",
  "اخضر": "أخضر", "أخضر": "أخضر", "خضراء": "أخضر",
  "اصفر": "أصفر", "أصفر": "أصفر", "صفراء": "أصفر",
  "رمادي": "رمادي", "رمادية": "رمادي", "كحلي": "كحلي", "بيج": "بيج",
  "بني": "بني", "بنية": "بني", "وردي": "وردي", "زهري": "وردي",
  "بنفسجي": "بنفسجي", "ذهبي": "ذهبي", "فضي": "فضي",
};

const STYLE_ALIASES: Record<string, string> = {
  رسمي: "رسمي", كلاسيك: "كلاسيكي", كلاسيكي: "كلاسيكي", كاجوال: "كاجوال", رياضي: "رياضي", شتوي: "شتوي", صيفي: "صيفي",
};

const OCCASION_ALIASES: Record<string, string> = {
  زفاف: "زفاف", عرس: "زفاف", حفله: "حفلة", حفلة: "حفلة", دوام: "دوام", مقابله: "مقابلة", مقابلة: "مقابلة", سفر: "سفر", عيد: "عيد",
};

const LOCATION_ALIASES: Record<string, string> = {
  بغداد: "بغداد", بغدادي: "بغداد", الكراده: "الكرادة", كراده: "الكرادة", المنصور: "المنصور", البصره: "البصرة", اربيل: "أربيل", النجف: "النجف", كربلاء: "كربلاء", نينوى: "نينوى",
};

const STOP_WORDS = new Set([
  "اريد", "أريد", "ابحث", "أبحث", "عن", "لي", "من", "ممكن", "اريدلي", "أريدلي",
  "سعر", "بسعر", "اقل", "أقل", "حد", "اقصى", "أقصى", "لا", "يتجاوز", "بحدود",
  "دينار", "دج", "عراقي", "لون", "باللون", "ويكون", "تكون", "مع", "في", "الـ", "طقم", "تنسيق", "نسق", "كامل", "مناسب", "مناسبه", "مناسبة", "بغداد", "بغدادي", "الكراده", "كراده", "المنصور", "البصره", "اربيل", "النجف", "كربلاء", "نينوى",
]);

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function normalizeText(value: string) {
  return normalizeDigits(value).toLowerCase().replace(/[ًٌٍَُِّْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/[ى]/g, "ي").replace(/[،,:؛؟!?()\[\]{}]/g, " ").replace(/\s+/g, " ").trim();
}

function parsePrice(value: string, unit?: string) {
  const amount = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(amount)) return undefined;
  const normalizedUnit = unit?.toLowerCase();
  if (normalizedUnit === "مليون" || normalizedUnit === "ملايين") return amount * 1_000_000;
  if (normalizedUnit === "الف" || normalizedUnit === "ألف" || normalizedUnit === "k") return amount * 1_000;
  return amount;
}

export function parseShoppingQuery(input: string): ParsedShoppingQuery {
  const raw = input.trim();
  const normalized = normalizeText(raw);
  const priceMatch = normalized.match(/(?:اقل|أقل|حد\s*اقصى|أقصى|بحدود|بسعر|ما\s*يتجاوز|ميزانية)[^\d]{0,16}(\d+(?:[.,]\d+)?)\s*(مليون|ملايين|الف|ألف|k)?/i);
  const maxPrice = priceMatch ? parsePrice(priceMatch[1], priceMatch[2]) : undefined;
  const words = normalized.split(" ").filter(Boolean);
  const colorKey = words.find((word) => COLOR_ALIASES[word]);
  const color = colorKey ? COLOR_ALIASES[colorKey] : undefined;
  const locationKey = words.find((word) => LOCATION_ALIASES[word]);
  const location = locationKey ? LOCATION_ALIASES[locationKey] : undefined;
  const styleKey = words.find((word) => STYLE_ALIASES[word]);
  const style = styleKey ? STYLE_ALIASES[styleKey] : undefined;
  const occasionKey = words.find((word) => OCCASION_ALIASES[word]);
  const occasion = occasionKey ? OCCASION_ALIASES[occasionKey] : undefined;
  const isOutfitRequest = /(?:تنسيق|نسق|طقم|إطلاله|اطلاله|لوك|ملابس كامله|مناسبه|مناسبة)/.test(normalized);
  const keywords = words.filter((word) => !STOP_WORDS.has(word) && !COLOR_ALIASES[word] && !LOCATION_ALIASES[word] && !STYLE_ALIASES[word] && !OCCASION_ALIASES[word] && !/^\d+(?:[.,]\d+)?$/.test(word) && !["مليون", "ملايين", "الف", "ألف", "k"].includes(word));
  const productName = keywords.join(" ").replace(/\s+/g, " ").trim();
  return { raw, productName, keywords, color, location, maxPrice, occasion, style, isOutfitRequest };
}

function matchesLocal(product: ShoppingProduct, parsed: ParsedShoppingQuery) {
  if (product.quantity <= 0 || (parsed.maxPrice !== undefined && product.price > parsed.maxPrice)) return false;
  if (parsed.location && !normalizeText(product.location ?? "").includes(normalizeText(parsed.location))) return false;
  const haystack = normalizeText([product.name, product.description, product.category, product.sku].filter(Boolean).join(" "));
  const matchesText = !parsed.productName || parsed.keywords.every((keyword) => haystack.includes(normalizeText(keyword)));
  const matchesColor = !parsed.color || haystack.includes(normalizeText(parsed.color));
  return matchesText && matchesColor;
}

function mapSupabaseProduct(row: Record<string, unknown>): ShoppingProduct {
  const company = row.companies && typeof row.companies === "object" ? row.companies as Record<string, unknown> : {};
  const relatedImages = Array.isArray(row.product_images) ? row.product_images : [];
  const nestedImage = relatedImages.find((image) => image && typeof image === "object" && typeof (image as Record<string, unknown>).public_url === "string") as Record<string, unknown> | undefined;
  const images = Array.isArray(row.image_urls) ? row.image_urls : [];
  const optionsText = row.options ? ` ${JSON.stringify(row.options)}` : "";
  return {
    id: String(row.id),
    name: String(row.name ?? "منتج"),
    description: row.description ? `${String(row.description)}${optionsText}` : optionsText.trim() || undefined,
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? 0),
    category: row.category ? String(row.category) : undefined,
    sku: row.sku ? String(row.sku) : undefined,
    imageUrl: typeof images[0] === "string" ? images[0] : typeof nestedImage?.public_url === "string" ? nestedImage.public_url : undefined,
    companyName: String(row.company_name ?? company.name ?? "متجر على تاجر"),
    companyId: row.company_id ? String(row.company_id) : company.id ? String(company.id) : undefined,
    companyWhatsapp: row.company_whatsapp ? String(row.company_whatsapp) : company.whatsapp ? String(company.whatsapp) : undefined,
    companyLogo: row.company_logo ? String(row.company_logo) : company.logo_url ? String(company.logo_url) : undefined,
    location: [row.company_district ?? company.district, row.company_province ?? company.province].filter(Boolean).map(String).join("، ") || undefined,
    isSponsored: row.is_sponsored === true,
    isVerified: row.is_verified === true || company.is_verified === true,
  };
}

export function buildOutfitSuggestions(products: ShoppingProduct[], parsed: ParsedShoppingQuery): ShoppingOutfit[] {
  if (!parsed.isOutfitRequest || products.length < 2) return [];
  const findProduct = (patterns: RegExp[]) => products.find((product) => patterns.some((pattern) => pattern.test(`${product.name} ${product.category ?? ""}`)));
  const tops = products.filter((product) => /قميص|جاكيت|بلوز|فستان|ملابس|أزياء/.test(`${product.name} ${product.category ?? ""}`));
  const shoes = products.filter((product) => /حذاء|أحذية|سبورت/.test(`${product.name} ${product.category ?? ""}`));
  const accessories = products.filter((product) => /حزام|حقيبة|شنطة|ساعة|إكسسوارات/.test(`${product.name} ${product.category ?? ""}`));
  const fallbackTop = tops[0] ?? findProduct([/قميص|جاكيت|ملابس/]);
  const fallbackShoe = shoes[0] ?? findProduct([/حذاء|أحذية/]);
  const fallbackAccessory = accessories[0] ?? findProduct([/حزام|حقيبة|إكسسوارات/]);
  const candidates = [
    [fallbackTop, fallbackAccessory, fallbackShoe].filter(Boolean) as ShoppingProduct[],
    [tops[1] ?? fallbackTop, accessories[1] ?? fallbackAccessory, shoes[1] ?? fallbackShoe].filter(Boolean) as ShoppingProduct[],
  ];
  const unique = new Map<string, ShoppingOutfit>();
  candidates.forEach((outfitProducts, index) => {
    const ids = [...new Set(outfitProducts.map((product) => product.id))];
    if (ids.length < 2) return;
    const selected = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean) as ShoppingProduct[];
    const totalPrice = selected.reduce((sum, product) => sum + product.price, 0);
    if (parsed.maxPrice !== undefined && totalPrice > parsed.maxPrice) return;
    unique.set(ids.join("-"), {
      id: `outfit-${index + 1}-${ids.join("-")}`,
      title: parsed.occasion ? `تنسيق ${parsed.occasion}` : parsed.style ? `تنسيق ${parsed.style}` : "تنسيق مقترح لك",
      description: "اختيارات متناسقة من المنتجات المتوفرة حالياً.",
      products: selected,
      totalPrice,
    });
  });
  return [...unique.values()].slice(0, 3);
}

async function searchProductsTable(parsed: ParsedShoppingQuery) {
  const client = requireSupabase();
  let query = client.from("products").select("id,company_id,name,description,price,quantity,category,sku,options,publication_status").eq("publication_status", "published").gt("quantity", 0).order("created_at", { ascending: false }).limit(20);
  if (parsed.maxPrice !== undefined) query = query.lte("price", parsed.maxPrice);
  if (parsed.keywords.length) {
    const terms = parsed.keywords.flatMap((keyword) => ["name", "description", "category", "sku"].map((field) => `${field}.ilike.%${keyword}%`));
    query = query.or(terms.join(","));
  }
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];
  const companyIds = [...new Set(rows.map((row) => String(row.company_id ?? "")).filter(Boolean))];
  const productIds = rows.map((row) => String(row.id ?? "")).filter(Boolean);
  const [{ data: companies }, { data: images }] = await Promise.all([
    companyIds.length
      ? client.from("companies").select("id,name,whatsapp,logo_url,province,district,is_verified").in("id", companyIds)
      : Promise.resolve({ data: [] as unknown[] }),
    productIds.length
      ? client.from("product_images").select("product_id,public_url,sort_order").in("product_id", productIds).order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as unknown[] }),
  ]);
  const companyRows = (companies ?? []) as Record<string, unknown>[];
  const companyById = new Map(companyRows.map((company) => [String(company.id), company]));
  const imagesByProduct = new Map<string, Record<string, unknown>[]>();
  for (const image of (images ?? []) as Record<string, unknown>[]) {
    const key = String(image.product_id ?? "");
    imagesByProduct.set(key, [...(imagesByProduct.get(key) ?? []), image]);
  }
  return rows.map((row) => mapSupabaseProduct({
    ...row,
    companies: companyById.get(String(row.company_id ?? "")),
    product_images: imagesByProduct.get(String(row.id ?? "")) ?? [],
  })).filter((product) => matchesLocal(product, parsed));
}

export async function searchShoppingProducts(input: string) {
  const parsed = parseShoppingQuery(input);
  const outfitQuery = { ...parsed, productName: "", keywords: [], color: undefined };
  if (!isSupabaseConfigured) return { parsed, products: [], outfits: [], source: "supabase-not-configured" as const };

  try {
    const client = requireSupabase();
    const { data, error } = await client.rpc("search_products", {
      search_query: parsed.productName || null,
      color_query: parsed.color || null,
      max_price: parsed.maxPrice ?? null,
      location_query: parsed.location || null,
      result_limit: 20,
    });
    if (error) throw error;
    const products = (Array.isArray(data) ? data : []).map((row: Record<string, unknown>) => mapSupabaseProduct(row));
    let outfitProducts = products;
    if (parsed.isOutfitRequest) {
      const outfitResult = await client.rpc("search_products", {
        search_query: null,
        color_query: null,
        max_price: parsed.maxPrice ?? null,
        location_query: parsed.location || null,
        result_limit: 30,
      });
      if (!outfitResult.error) outfitProducts = (Array.isArray(outfitResult.data) ? outfitResult.data : []).map((row: Record<string, unknown>) => mapSupabaseProduct(row));
    }
    return { parsed, products, outfits: buildOutfitSuggestions(outfitProducts, parsed), source: "supabase" as const };
  } catch {
    try {
      const products = await searchProductsTable(parsed);
      const outfitProducts = parsed.isOutfitRequest ? await searchProductsTable(outfitQuery) : products;
      return { parsed, products, outfits: buildOutfitSuggestions(outfitProducts, parsed), source: "supabase-table" as const };
    } catch {
      return { parsed, products: [], outfits: [], source: "supabase-error" as const };
    }
  }
}

export function buildWhatsAppBookingUrl(product: ShoppingProduct) {
  const phone = (product.companyWhatsapp ?? "").replace(/[^\d]/g, "");
  if (!phone) return undefined;
  const text = `السلام عليكم، أرغب بحجز منتج «${product.name}» بسعر ${product.price.toLocaleString("en-US")} د.ع عبر تاجر.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
