
function unwrapArray(raw) {
  if (Array.isArray(raw)) return raw;
  return raw?.Items || raw?.items || raw?.Data || raw?.data || [];
}

export function mapSsBrandToNormalized(b) {
  const id =
    b?.BrandID ??
    b?.brandID ??
    b?.brandId ??
    b?.Id ??
    b?.id;

  const name =
    b?.Name ??
    b?.name ??
    b?.BrandName ??
    b?.brandName ??
    b?.Description ??
    "";

  return {
    id: `ss-brand-${id}`,
    supplier: "ss",
    brandId: id,
    name,
    image: b?.image || b?.Image || null,
    activeProducts: b?.activeProducts ?? b?.ActiveProducts ?? null,
  };
}

export function mapSsBrandsToNormalized(raw) {
  return unwrapArray(raw)
    .map(mapSsBrandToNormalized)
    .filter((b) => b.name);
}

export function mapSsProductToNormalized(p) {
  // S&S product identifiers vary. We keep multiple.
  const sku = p?.Sku || p?.SKU || p?.sku;
  const skuId = p?.SkuID || p?.SkuId || p?.skuid;
  const gtin = p?.Gtin || p?.GTIN || p?.gtin;

  const styleID = p?.StyleID || p?.styleID;
  const styleName = p?.StyleName || p?.styleName;
  const partNumber = p?.PartNumber || p?.partnumber;
  const brandName = p?.brandName || p?.Brand || p?.brand;
  const title = p?.Name || p?.Description || p?.Title || "";

  const displayImage = p?.colorFrontImage || p?.ColorFrontImage || p?.colorFrontimage || p?.color_front_image || "";
  const colorFrontImage = p?.colorFrontImage || "";
  const colorSwatchImage = p?.colorSwatchImage || "";
  const colorBackImage = p?.colorBackImage || "";
  const colorSideImage = p?.colorSideImage || "";


  // Pick best identifier for our app
  const identifier = sku || skuId || gtin || p?.Identifier;

  return {
    id: identifier ? `ss-${identifier}` : `ss-unknown-${Math.random()}`,
    supplier: "ss",

    identifier,
    sku,
    skuId,
    gtin,

    brandName,
    styleName,
    styleID,
    partNumber,

    displayImage,
    colorFrontImage,
    colorSwatchImage,
    colorBackImage,
    colorSideImage,

    title,
    raw: p,
  };
}

export function mapSsSearchToNormalized(raw) {
  return unwrapArray(raw).map(mapSsProductToNormalized);
}