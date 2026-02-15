import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetStylesByBrand } from "../api/catalogApi";
import StyleGrid from "../components/StyleGrid.jsx";

export default function BrandProductsPage() {
  const { brandId } = useParams();
  const decodedBrandId = decodeURIComponent(brandId || "");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetStylesByBrand(decodedBrandId);
        setStyles(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load styles");
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedBrandId]);

  // Navigate to product page
  const pickStyle = (style) => {
    // use styleID or partNumber for URL
    navigate(`/product/${encodeURIComponent(style.styleID)}`);
  };  

  const brandName = styles?.[0]?.brandName || decodedBrandId;

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
              <div className="text-muted small">{styles.length} styles</div>
            </div>

            <input
              className="form-control"
              style={{ maxWidth: 360 }}
              placeholder="Filter styles (title, part #, styleID…)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <hr className="my-3" />

          {loading ? (
            <div className="text-muted">Loading styles…</div>
          ) : (
            <StyleGrid
              styles={styles}
              filter={filter}
              onPickStyle={pickStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
