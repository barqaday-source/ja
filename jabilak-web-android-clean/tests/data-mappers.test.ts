import { describe, expect, it } from "vitest";

import { mapCompany, mapProduct } from "../lib/data/mappers";
import { repositoryConfig } from "../lib/data/repositories";

describe("Supabase data preparation", () => {
  it("keeps the preview disconnected while declaring the future boundary", () => {
    expect(repositoryConfig.supabaseReady).toBe(true);
    expect(repositoryConfig.connected).toBe(false);
    expect(repositoryConfig.backend).toBe("local-preview");
  });

  it("maps company rows into the camelCase app model", () => {
    const company = mapCompany({
      id: "company-1",
      owner_id: "user-1",
      name: "شركة تاجر",
      slug: "tajer-company",
      logo_url: null,
      cover_url: null,
      description: null,
      category: "ملابس",
      province: "بغداد",
      district: null,
      address: null,
      latitude: null,
      longitude: null,
      phone: null,
      whatsapp: null,
      email: null,
      website: null,
      is_verified: false,
      verification_status: "not_started",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    expect(company.ownerId).toBe("user-1");
    expect(company.logoUrl).toBeUndefined();
    expect(company.province).toBe("بغداد");
  });

  it("orders product images and removes empty URLs", () => {
    const product = mapProduct({
      id: "product-1",
      company_id: "company-1",
      name: "منتج",
      description: null,
      price: 25000,
      previous_price: null,
      quantity: 5,
      category: null,
      sku: null,
      options: null,
      publication_status: "published",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      product_images: [
        { storage_path: "b", public_url: "https://cdn/b.jpg", sort_order: 2 },
        { storage_path: "a", public_url: null, sort_order: 1 },
      ],
    });

    expect(product.companyId).toBe("company-1");
    expect(product.imageUrls).toEqual(["https://cdn/b.jpg"]);
    expect(product.options).toEqual({});
  });
});
