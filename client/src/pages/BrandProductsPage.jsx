import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetProductsByBrand } from "../api/catalogApi";
import ProductGrid from "../components/ProductGrid.jsx"; // external grid

export default function BrandProductsPage() {
  const { brandId } = useParams();
  const decodedBrandId = decodeURIComponent(brandId || "");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  // Fetch products by brand
  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetProductsByBrand(decodedBrandId);

        // Defensive: guarantee array
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedBrandId]);

  // Navigate to product page
  function pickProduct(style) {
    navigate(`/style/${encodeURIComponent(style.styleID)}`);
  }  

  const brandName = products?.[0]?.brandName || decodedBrandId;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <Link to="/" className="btn btn-outline-secondary">
          ← Back to Brands
        </Link>

        {loading && <span className="text-muted">Loading…</span>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="m-0">{brandName || "(missing)"}</h5>
              <div className="text-muted small">{products.length} products</div>
            </div>

            <input
              className="form-control"
              style={{ maxWidth: 360 }}
              placeholder="Filter products (title, part #, styleID…)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <hr className="my-3" />

          {loading ? (
            <div className="text-muted">Loading products…</div>
          ) : (
            <ProductGrid
              products={products}
              filter={filter}
              onPickProduct={pickProduct} // ensures ProductCard gets correct callback
            />
          )}
        </div>
      </div>
    </div>
  );
}

