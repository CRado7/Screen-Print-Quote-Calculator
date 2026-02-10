// Takes raw S&S product JSON and maps it into a normalized format
// so the frontend doesn't care which supplier it is.

export function mapSsProductToNormalized(raw) {
    // TODO: Update this mapping once you confirm S&S response shape.
    // For now this is a safe placeholder.
  
    return {
      id: `ss-${raw?.id ?? raw?.styleId ?? "unknown"}`,
      supplier: "ss",
      styleNumber: raw?.styleNumber ?? raw?.style ?? "",
      title: raw?.title ?? raw?.name ?? "",
      description: raw?.description ?? "",
      brand: raw?.brand ?? "",
  
      // colors: [{ name, code, images: [{url, view}], sizes: [{size, sku, cost}] }]
      colors: (raw?.colors ?? []).map((c) => ({
        name: c?.name ?? "",
        code: c?.code ?? c?.colorCode ?? "",
        images: (c?.images ?? []).map((img) => ({
          url: img?.url ?? img?.src ?? "",
          view: img?.view ?? img?.type ?? "front"
        })),
        sizes: (c?.sizes ?? []).map((s) => ({
          size: s?.size ?? "",
          sku: s?.sku ?? s?.skuId ?? "",
          cost: Number(s?.cost ?? s?.price ?? 0)
        }))
      }))
    };
  }
  
  export function mapSsSearchToNormalized(rawList) {
    // rawList could be {results:[...]} or [...] depending on S&S
    const list = Array.isArray(rawList) ? rawList : rawList?.results ?? [];
  
    return list.map((p) => ({
      id: `ss-${p?.id ?? p?.styleId ?? "unknown"}`,
      supplier: "ss",
      styleNumber: p?.styleNumber ?? p?.style ?? "",
      title: p?.title ?? p?.name ?? "",
      brand: p?.brand ?? "",
      thumbnailUrl: p?.thumbnailUrl ?? p?.image ?? ""
    }));
  }