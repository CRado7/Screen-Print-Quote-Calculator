import { ssFetch } from "./ssClient.js";
import {
  mapSsBrandsToNormalized,
  mapSsProductToNormalized,
  mapSsSearchToNormalized,
} from "./ssMapper.js";

// Cache brands so we don’t hammer the API
let brandsCache = null;
let brandsCacheAt = 0;
const BRANDS_TTL_MS = 1000 * 60 * 60; // 1 hour

export const ssService = {
  /**
   * GET /v2/Brands
   */
  async getBrands({ force = false } = {}) {
    const now = Date.now();

    if (!force && brandsCache && now - brandsCacheAt < BRANDS_TTL_MS) {
      return brandsCache;
    }

    const raw = await ssFetch("Brands", { debugLabel: "getBrands" });

    // console.log("RAW BRANDS RESPONSE TYPE:", typeof raw);
    // console.log("RAW BRANDS RESPONSE KEYS:", raw && typeof raw === "object" ? Object.keys(raw) : null);
    // console.log("RAW BRANDS SAMPLE:", Array.isArray(raw) ? raw.slice(0, 3) : raw);
    
    const normalized = mapSsBrandsToNormalized(raw);

    // sort alphabetically
    normalized.sort((a, b) => a.name.localeCompare(b.name));

    brandsCache = normalized;
    brandsCacheAt = now;

    return normalized;
  },

  /**
   * Brand -> products
   *
   * We use `style=` as a loose filter.
   * It may not perfectly match all brands, but it’s the best we have
   * without a BrandID filter.
   */
  async getProductsByBrandName({ brandName }) {
    const name = String(brandName || "").trim();
    if (!name) return [];

    const raw = await ssFetch("products", {
      query: { style: name },
      debugLabel: `brandStyle=${name}`,
    });

    return mapSsSearchToNormalized(raw);
  },

  async getProductsByBrandId({ brandId }) {
    const id = String(brandId || "").trim();
    if (!id) return [];

    const raw = await ssFetch("products", {
      query: { brandID: id },
      debugLabel: `brandID=${id}`,
    });
    // console.log("RAW PRODUCTS BY BRAND ID RESPONSE TYPE:", typeof raw);
    // console.log("RAW PRODUCTS BY BRAND ID RESPONSE KEYS:", raw && typeof raw === "object" ? Object.keys(raw) : null);
    // console.log("RAW PRODUCTS BY BRAND ID SAMPLE:", Array.isArray(raw) ? raw.slice(0, 3) : raw);

    return mapSsSearchToNormalized(raw);
  },

  /**
   * Product details
   * /v2/products/{identifier}
   */
  async getProductById({ productId }) {
    const cleanId = String(productId || "")
      .replace(/^ss-/, "")
      .trim();

    if (!cleanId) throw new Error("productId is required");

    const raw = await ssFetch(`products/${encodeURIComponent(cleanId)}`, {
      debugLabel: `product=${cleanId}`,
    });

    return mapSsProductToNormalized(raw);
  },
};