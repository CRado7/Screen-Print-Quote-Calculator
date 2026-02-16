// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetProductsByStyle } from "../api/catalogApi";

export default function ProductPage() {
  const { productId } = useParams(); // <-- styleID

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // all SKUs for this style
  const [error, setError] = useState("");

  // UI selection
  const [selectedColorCode, setSelectedColorCode] = useState("");

  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetProductsByStyle(productId);
        const list = Array.isArray(data) ? data : [];
        setProducts(list);

        // default color
        if (list.length) {
          const first = list[0];
          const firstColorCode = first?.raw?.colorCode || "";
          setSelectedColorCode(firstColorCode);
        }
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const imgUrl = (path) =>
    path
      ? `https://www.ssactivewear.com/${String(path).replace(/^\/+/, "")}`
      : null;

  const fmtMoney = (n) => {
    if (n == null || Number.isNaN(Number(n))) return null;
    return `$${Number(n).toFixed(2)}`;
  };

  // -----------------------------
  // Derived data
  // -----------------------------
  const colors = useMemo(() => {
    const map = new Map();

    for (const sku of products) {
      const raw = sku?.raw || {};
      const code = raw.colorCode || "";
      const name = raw.colorName || "";
      const swatch = raw.colorSwatchImage || "";

      if (!code) continue;

      if (!map.has(code)) {
        map.set(code, {
          colorCode: code,
          colorName: name,
          swatch,
        });
      }
    }

    return Array.from(map.values());
  }, [products]);

  const skusForSelectedColor = useMemo(() => {
    return products.filter((p) => p?.raw?.colorCode === selectedColorCode);
  }, [products, selectedColorCode]);

  // This is the SKU we use for:
  // - title/brand/style
  // - images
  // - the "Color / SKU / GTIN" summary
  // We just pick the first sku for the selected color.
  const selectedSku = useMemo(() => {
    return skusForSelectedColor[0] || null;
  }, [skusForSelectedColor]);

  // Size columns (for this color)
  const sizeColumns = useMemo(() => {
    const set = new Set();

    for (const sku of skusForSelectedColor) {
      const size = sku?.raw?.sizeName;
      if (size) set.add(size);
    }

    return Array.from(set);
  }, [skusForSelectedColor]);

  // Warehouse rows
  const warehouseRows = useMemo(() => {
    const map = new Map();

    for (const sku of skusForSelectedColor) {
      const warehouses = sku?.raw?.warehouses || [];

      for (const w of warehouses) {
        const abbr = w?.warehouseAbbr;
        if (!abbr) continue;

        if (!map.has(abbr)) {
          map.set(abbr, {
            warehouseAbbr: abbr,
            dropship: !!w.dropship,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.warehouseAbbr.localeCompare(b.warehouseAbbr)
    );
  }, [skusForSelectedColor]);

  // stockTable[warehouseAbbr][sizeName] = qty
  const stockTable = useMemo(() => {
    const table = {};

    for (const wh of warehouseRows) {
      table[wh.warehouseAbbr] = {};
      for (const size of sizeColumns) {
        table[wh.warehouseAbbr][size] = 0;
      }
    }

    for (const sku of skusForSelectedColor) {
      const size = sku?.raw?.sizeName;
      const warehouses = sku?.raw?.warehouses || [];
      if (!size) continue;

      for (const w of warehouses) {
        const abbr = w?.warehouseAbbr;
        const qty = Number(w?.qty || 0);
        if (!abbr) continue;

        if (!table[abbr]) table[abbr] = {};
        table[abbr][size] = qty;
      }
    }

    return table;
  }, [skusForSelectedColor, warehouseRows, sizeColumns]);

  // priceBySize[sizeName] = { salePrice, customerPrice, piecePrice, ... }
  // NOTE: prices are per SKU, which in S&S usually means per (color + size)
  const priceBySize = useMemo(() => {
    const map = {};

    for (const sku of skusForSelectedColor) {
      const size = sku?.raw?.sizeName;
      if (!size) continue;

      // pick the best price field you want to show
      // (you can swap this to customerPrice if you want)
      const salePrice = sku?.raw?.salePrice ?? sku?.salePrice ?? null;
      const customerPrice = sku?.raw?.customerPrice ?? sku?.customerPrice ?? null;
      const piecePrice = sku?.raw?.piecePrice ?? sku?.piecePrice ?? null;

      map[size] = {
        salePrice,
        customerPrice,
        piecePrice,
      };
    }

    return map;
  }, [skusForSelectedColor]);

  // Totals
  const rowTotals = useMemo(() => {
    const totals = {};

    for (const wh of warehouseRows) {
      const abbr = wh.warehouseAbbr;
      let sum = 0;

      for (const size of sizeColumns) {
        sum += Number(stockTable?.[abbr]?.[size] || 0);
      }

      totals[abbr] = sum;
    }

    return totals;
  }, [warehouseRows, sizeColumns, stockTable]);

  const colTotals = useMemo(() => {
    const totals = {};

    for (const size of sizeColumns) {
      let sum = 0;

      for (const wh of warehouseRows) {
        const abbr = wh.warehouseAbbr;
        sum += Number(stockTable?.[abbr]?.[size] || 0);
      }

      totals[size] = sum;
    }

    return totals;
  }, [warehouseRows, sizeColumns, stockTable]);

  const grandTotal = useMemo(() => {
    let sum = 0;
    for (const size of sizeColumns) sum += Number(colTotals[size] || 0);
    return sum;
  }, [sizeColumns, colTotals]);

  // -----------------------------
  // Loading / error states
  // -----------------------------
  if (loading) return <div className="text-muted">Loading product…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!products.length)
    return <div className="text-muted">(No products found)</div>;
  if (!selectedSku)
    return <div className="text-muted">(No SKU found for this color)</div>;

  // -----------------------------
  // Display fields
  // -----------------------------
  const brandName = selectedSku?.brandName || "";
  const styleName = selectedSku?.styleName || "";
  const title = selectedSku?.title?.trim() || `${brandName} ${styleName}`.trim();

  const colorName = selectedSku?.raw?.colorName || "";

  // images
  const front = imgUrl(
    selectedSku?.raw?.colorFrontImage ||
      selectedSku?.colorFrontImage ||
      selectedSku?.displayImage
  );
  const side = imgUrl(
    selectedSku?.raw?.colorSideImage || selectedSku?.colorSideImage
  );
  const back = imgUrl(
    selectedSku?.raw?.colorBackImage || selectedSku?.colorBackImage
  );
  const swatch = imgUrl(
    selectedSku?.raw?.colorSwatchImage || selectedSku?.colorSwatchImage
  );

  // keep these fields visible (from selectedSku)
  const skuValue = selectedSku?.sku || selectedSku?.identifier || "";
  const gtinValue = selectedSku?.gtin || "";

  // back link
  const brandSlug = selectedSku?.brandID || "";

  // which price do we show under each size?
  // You can switch this to "customerPrice" if you want.
  const priceField = "salePrice";

  return (
    <div className="container my-4">
      <Link
        to={brandSlug ? `/brand/${brandSlug}` : "/"}
        className="btn btn-outline-secondary mb-3"
      >
        ← Back to {brandName || "Brand"} Products
      </Link>

      <div className="row">
        {/* Images */}
        <div className="col-md-6">
          {front ? (
            <img
              src={front}
              alt={title}
              className="img-fluid mb-2"
              style={{ background: "#f8f9fa", objectFit: "contain" }}
            />
          ) : (
            <div className="text-muted">(No image)</div>
          )}

          <div className="d-flex gap-2 flex-wrap">
            {front && (
              <img
                src={front}
                className="img-thumbnail"
                width={80}
                alt="Front"
              />
            )}
            {side && (
              <img
                src={side}
                className="img-thumbnail"
                width={80}
                alt="Side"
              />
            )}
            {back && (
              <img
                src={back}
                className="img-thumbnail"
                width={80}
                alt="Back"
              />
            )}
            {swatch && (
              <img
                src={swatch}
                className="img-thumbnail"
                width={40}
                alt="Swatch"
              />
            )}
          </div>

          {/* Color picker */}
          <div className="mt-3">
            <h6>Available Colors:</h6>
            <div className="d-flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.colorCode}
                  type="button"
                  className={`btn btn-sm ${
                    selectedColorCode === c.colorCode
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedColorCode(c.colorCode)}
                >
                  {c.colorName || c.colorCode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product + Grid */}
        <div className="col-md-6">
          <h3 className="mb-2">{title}</h3>

          <div className="mb-3 small">
            <div>
              <strong>Color:</strong> {colorName}
            </div>
            <div>
              <strong>SKU:</strong> {skuValue}
            </div>
            <div>
              <strong>GTIN:</strong> {gtinValue}
            </div>
          </div>

          {/* Stock Table */}
          {warehouseRows.length > 0 && sizeColumns.length > 0 ? (
            <div className="mb-3">
              <h6 className="mb-2">Stock by Warehouse + Size</h6>

              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 90 }}>WH</th>

                      {sizeColumns.map((s) => {
                        const p = priceBySize?.[s]?.[priceField] ?? null;

                        return (
                          <th
                            key={s}
                            className="text-center"
                            style={{ minWidth: 80 }}
                          >
                            <div className="fw-semibold">{s}</div>
                            <div className="small text-muted">
                              {p != null ? fmtMoney(p) : "—"}
                            </div>
                          </th>
                        );
                      })}

                      <th className="text-center" style={{ minWidth: 80 }}>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {warehouseRows.map((wh) => {
                      const abbr = wh.warehouseAbbr;

                      return (
                        <tr key={abbr}>
                          <td className="fw-semibold">
                            {abbr}
                            {wh.dropship ? (
                              <span className="badge bg-secondary ms-2">
                                DS
                              </span>
                            ) : null}
                          </td>

                          {sizeColumns.map((size) => {
                            const qty = stockTable?.[abbr]?.[size] ?? 0;

                            return (
                              <td key={size} className="text-center">
                                {qty > 0 ? (
                                  qty
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="text-center fw-semibold">
                            {rowTotals?.[abbr] > 0 ? rowTotals[abbr] : "—"}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals */}
                    <tr className="table-light">
                      <td className="fw-bold">Total</td>

                      {sizeColumns.map((size) => (
                        <td key={size} className="text-center fw-semibold">
                          {colTotals?.[size] > 0 ? colTotals[size] : "—"}
                        </td>
                      ))}

                      <td className="text-center fw-bold">
                        {grandTotal > 0 ? grandTotal : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="small text-muted">
                Prices shown are per unit for each size (for the selected color).
              </div>
            </div>
          ) : (
            <div className="text-muted">(No stock table data)</div>
          )}
        </div>
      </div>

      {/* Debug */}
      <div className="mt-4">
        <details>
          <summary className="text-muted">Debug: selectedSku</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(selectedSku, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
