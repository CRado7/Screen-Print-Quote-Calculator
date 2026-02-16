// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetProductsByStyle } from "../api/catalogApi";

export default function ProductPage() {
  const { productId } = useParams(); // <-- this is the styleID in your setup

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // all SKUs for this style
  const [error, setError] = useState("");

  // UI selections
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [selectedSizeName, setSelectedSizeName] = useState("");

  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetProductsByStyle(productId);

        // safety: always array
        const list = Array.isArray(data) ? data : [];
        setProducts(list);

        // default selection
        if (list.length) {
          const first = list[0];
          const firstColorCode = first?.raw?.colorCode || "";
          const firstSizeName = first?.raw?.sizeName || "";

          setSelectedColorCode(firstColorCode);
          setSelectedSizeName(firstSizeName);
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

  const sizes = useMemo(() => {
    const set = new Set();

    for (const sku of products) {
      const raw = sku?.raw || {};
      if (raw.colorCode === selectedColorCode && raw.sizeName) {
        set.add(raw.sizeName);
      }
    }

    return Array.from(set);
  }, [products, selectedColorCode]);

  const selectedSku = useMemo(() => {
    return (
      products.find((sku) => {
        const raw = sku?.raw || {};
        return (
          raw.colorCode === selectedColorCode &&
          raw.sizeName === selectedSizeName
        );
      }) || null
    );
  }, [products, selectedColorCode, selectedSizeName]);

  // If the selectedSizeName isn't valid anymore (after switching color),
  // auto-fix it to the first available size for that color.
  useEffect(() => {
    if (!products.length) return;
    if (!selectedColorCode) return;

    const hasSize = products.some((sku) => {
      const raw = sku?.raw || {};
      return raw.colorCode === selectedColorCode && raw.sizeName === selectedSizeName;
    });

    if (!hasSize) {
      const firstMatch = products.find(
        (sku) => sku?.raw?.colorCode === selectedColorCode
      );
      const firstSize = firstMatch?.raw?.sizeName || "";
      setSelectedSizeName(firstSize);
    }
  }, [products, selectedColorCode, selectedSizeName]);

  // -----------------------------
  // Loading / error states
  // -----------------------------
  if (loading) return <div className="text-muted">Loading product…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!products.length)
    return <div className="text-muted">(No products found)</div>;

  if (!selectedSku)
    return <div className="text-muted">(No SKU selected)</div>;

  // -----------------------------
  // Display fields
  // -----------------------------
  const brandName = selectedSku?.brandName || "";
  const styleName = selectedSku?.styleName || "";
  const title =
    selectedSku?.title?.trim() ||
    `${brandName} ${styleName}`.trim();

  const description = selectedSku?.raw?.description || selectedSku?.raw?.Description || "";

  // images (always convert to full URL)
  const front = imgUrl(
    selectedSku?.raw?.colorFrontImage || selectedSku?.colorFrontImage || selectedSku?.displayImage
  );
  const side = imgUrl(selectedSku?.raw?.colorSideImage || selectedSku?.colorSideImage);
  const back = imgUrl(selectedSku?.raw?.colorBackImage || selectedSku?.colorBackImage);
  const swatch = imgUrl(selectedSku?.raw?.colorSwatchImage || selectedSku?.colorSwatchImage);

  const warehouses = selectedSku?.raw?.warehouses || selectedSku?.warehouses || [];

  // price fields (from raw is safest)
  const salePrice = selectedSku?.raw?.salePrice ?? selectedSku?.salePrice ?? null;
  const customerPrice = selectedSku?.raw?.customerPrice ?? selectedSku?.customerPrice ?? null;
  const piecePrice = selectedSku?.raw?.piecePrice ?? selectedSku?.piecePrice ?? null;
  const dozenPrice = selectedSku?.raw?.dozenPrice ?? selectedSku?.dozenPrice ?? null;
  const casePrice = selectedSku?.raw?.casePrice ?? selectedSku?.casePrice ?? null;

  // back link (this requires your product mapper to include brandID slug)
  const brandSlug = selectedSku?.brandID || selectedSku?.raw?.brandID || "";

  return (
    <div className="container my-4">
      <Link to={`/brand/${brandSlug}`} className="btn btn-outline-secondary mb-3">
        ← Back to {brandName} Products
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
            {front && <img src={front} className="img-thumbnail" width={80} alt="Front" />}
            {side && <img src={side} className="img-thumbnail" width={80} alt="Side" />}
            {back && <img src={back} className="img-thumbnail" width={80} alt="Back" />}
            {swatch && <img src={swatch} className="img-thumbnail" width={40} alt="Swatch" />}
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

          {/* Size picker */}
          <div className="mt-3">
            <h6>Available Sizes:</h6>
            <select
              className="form-select"
              value={selectedSizeName}
              onChange={(e) => setSelectedSizeName(e.target.value)}
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <h3>{title}</h3>

          <p className="text-muted mb-1">
            Brand: <strong>{brandName}</strong>
          </p>

          <p className="text-muted mb-3">
            Style: <strong>{styleName}</strong>
          </p>

          <div className="mb-3">
            <div>
              <strong>Color:</strong> {selectedSku?.raw?.colorName || ""}
            </div>
            <div>
              <strong>Size:</strong> {selectedSku?.raw?.sizeName || ""}
            </div>
            <div>
              <strong>SKU:</strong> {selectedSku?.sku || selectedSku?.identifier || ""}
            </div>
            <div>
              <strong>GTIN:</strong> {selectedSku?.gtin || ""}
            </div>
          </div>

          {description ? <p>{description}</p> : null}

          {/* Warehouses / Stock */}
          {warehouses?.length > 0 && (
            <div className="mb-3">
              <h6>Stock by Warehouse:</h6>
              <ul className="mb-0">
                {warehouses.map((w) => (
                  <li key={`${w.warehouseAbbr}-${w.skuID}`}>
                    {w.warehouseAbbr}: {w.qty} units{" "}
                    {w.closeout ? "(Closeout)" : ""}
                    {w.dropship ? " (Dropship)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prices */}
          <div className="mb-3">
            <h6>Pricing:</h6>
            <ul className="mb-0">
              {salePrice != null && <li>Sale Price: ${Number(salePrice).toFixed(2)}</li>}
              {customerPrice != null && <li>Customer Price: ${Number(customerPrice).toFixed(2)}</li>}
              {piecePrice != null && <li>Piece Price: ${Number(piecePrice).toFixed(2)}</li>}
              {dozenPrice != null && <li>Dozen Price: ${Number(dozenPrice).toFixed(2)}</li>}
              {casePrice != null && <li>Case Price: ${Number(casePrice).toFixed(2)}</li>}
            </ul>
          </div>
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
