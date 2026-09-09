import type { Company, Product } from "./models";

type SupabaseCompanyRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description?: string | null;
  category?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  is_verified: boolean;
  verification_status: Company["verificationStatus"];
  created_at: string;
  updated_at: string;
};

type SupabaseProductRow = {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  price: number;
  previous_price?: number | null;
  quantity: number;
  category?: string | null;
  sku?: string | null;
  options?: Record<string, string[]> | null;
  publication_status: Product["publicationStatus"];
  created_at: string;
  updated_at: string;
  product_images?: Array<{ storage_path: string; public_url?: string | null; sort_order: number }>;
};

/** يحول صف Supabase إلى نموذج الواجهة مع إزالة null من الحقول الاختيارية. */
export function mapCompany(row: SupabaseCompanyRow): Company {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    province: row.province ?? undefined,
    district: row.district ?? undefined,
    address: row.address ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    isVerified: row.is_verified,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    quantity: row.quantity,
    category: row.category ?? undefined,
    sku: row.sku ?? undefined,
    options: row.options ?? {},
    imageUrls: [...(row.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.public_url)
      .filter((url): url is string => Boolean(url)),
    publicationStatus: row.publication_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
