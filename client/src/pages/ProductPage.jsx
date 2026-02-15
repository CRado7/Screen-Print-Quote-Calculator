// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetProductsByStyle } from "../api/catalogApi";

export default function ProductPage() {
  const { productId } = useParams(); // actually the styleID
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // all SKUs for this style
  const [selectedSku, setSelectedSku] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetProductsByStyle(productId);
        setProducts(data);

        if (data.length) setSelectedSku(data[0]); // default first SKU
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);
  

  if (loading) return <div className="text-muted">Loading product…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!products.length) return <div className="text-muted">(No products found)</div>;

  // Extract unique colors
  const colors = [...new Map(products.map(p => [p.colorName, p])).values()];
  // Extract sizes for the selected SKU
  const sizes = selectedSku ? [selectedSku.sizeName] : [];

  const {
    brandName,
    styleName,
    title,
    description,
    displayImage,
    colorFrontImage,
    colorSideImage,
    colorBackImage,
    colorSwatchImage,
    warehouses,
  } = selectedSku || {};

  return (
    <div className="container my-4">
      <Link
        to={`/brand/${selectedSku?.brandID}`}
        className="btn btn-outline-secondary mb-3"
      >
        ← Back to {brandName} Products
      </Link>

      <div className="row">
        {/* Images */}
        <div className="col-md-6">
          <img
            src={colorFrontImage || displayImage}
            alt={`${brandName} ${styleName}`}
            className="img-fluid mb-2"
          />
          <div className="d-flex gap-2 flex-wrap">
            {colorFrontImage && (
              <img
                src={colorFrontImage}
                className="img-thumbnail"
                width={80}
                alt="Front"
              />
            )}
            {colorSideImage && (
              <img
                src={colorSideImage}
                className="img-thumbnail"
                width={80}
                alt="Side"
              />
            )}
            {colorBackImage && (
              <img
                src={colorBackImage}
                className="img-thumbnail"
                width={80}
                alt="Back"
              />
            )}
            {colorSwatchImage && (
              <img
                src={colorSwatchImage}
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
                  key={c.sku}
                  className={`btn btn-sm ${
                    selectedSku?.colorName === c.colorName
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedSku(c)}
                >
                  {c.colorName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <h3>{title || `${brandName} ${styleName}`}</h3>
          <p className="text-muted">Brand: {brandName}</p>
          <p>{description}</p>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-3">
              <h6>Available Sizes:</h6>
              <div className="d-flex gap-2 flex-wrap">
                {sizes.map((s, i) => (
                  <span key={i} className="badge bg-secondary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warehouses / Stock */}
          {warehouses?.length > 0 && (
            <div className="mb-3">
              <h6>Stock by Warehouse:</h6>
              <ul>
                {warehouses.map((w) => (
                  <li key={w.skuID}>
                    {w.warehouseAbbr}: {w.qty} units{" "}
                    {w.closeout ? "(Closeout)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prices */}
          <div className="mb-3">
            <h6>Pricing:</h6>
            <ul>
              {selectedSku?.salePrice && (
                <li>Sale Price: ${selectedSku.salePrice.toFixed(2)}</li>
              )}
              {selectedSku?.customerPrice && (
                <li>Customer Price: ${selectedSku.customerPrice.toFixed(2)}</li>
              )}
              {selectedSku?.casePrice && (
                <li>Case Price: ${selectedSku.casePrice.toFixed(2)}</li>
              )}
              {selectedSku?.dozenPrice && (
                <li>Dozen Price: ${selectedSku.dozenPrice.toFixed(2)}</li>
              )}
              {selectedSku?.piecePrice && (
                <li>Piece Price: ${selectedSku.piecePrice.toFixed(2)}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
