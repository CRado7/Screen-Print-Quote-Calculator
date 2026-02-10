const API_BASE = "/api";

export async function searchCatalog({ supplier = "ss", q = "" }) {
  const url = `${API_BASE}/catalog/search?supplier=${encodeURIComponent(
    supplier
  )}&q=${encodeURIComponent(q)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getProduct({ supplier = "ss", productId }) {
  const url = `${API_BASE}/catalog/products/${encodeURIComponent(
    productId
  )}?supplier=${encodeURIComponent(supplier)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Product fetch failed");
  return res.json();
}
