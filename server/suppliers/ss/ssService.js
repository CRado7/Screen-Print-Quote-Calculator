import { ssFetch } from "./ssclient.js";
import { mapSsProductToNormalized, mapSsSearchToNormalized } from "./ssMapper.js";

export const ssService = {
  async searchProducts({ q }) {
    // TODO: Replace with real S&S search endpoint
    // Example placeholder: /products?search=...
    const raw = await ssFetch("/products", { query: { search: q } });
    return mapSsSearchToNormalized(raw);
  },

  async getProductById({ productId }) {
    // productId will come in as "ss-xxxxx"
    const cleanId = String(productId).replace(/^ss-/, "");

    // TODO: Replace with real S&S product endpoint
    const raw = await ssFetch(`/products/${cleanId}`);
    return mapSsProductToNormalized(raw);
  }
};