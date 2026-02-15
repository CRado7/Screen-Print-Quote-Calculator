import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetStylesByBrand } from "../api/catalogApi"; // backend endpoint
import StyleGrid from "../components/StyleGrid.jsx";

export default function BrandProductsPage() {
  const { brandId } = useParams(); // URL-friendly brandID
  const decodedBrandId = decodeURIComponent(brandId || "");

  const navigate = useNavigate();
  const [styles, setStyles] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        // fetch styles from backend for this brand
        const data = await apiGetStylesByBrand(decodedBrandId);
        const normalized = Array.isArray(data) ? data : [];

        // filter only styles that match the clicked brandID
        const brandStyles = normalized.filter(
          (s) => s.brandID === decodedBrandId
        );

        setStyles(brandStyles);
      } catch (e) {
        setError(e?.message || "Failed to load styles");
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedBrandId]);
  const pickStyle = (style) => {
    // use styleID or partNumber for URL
    navigate(`/product/${encodeURIComponent(style.styleID)}`);
  }; 

  const brandDisplayName = styles?.[0]?.brandName ?? decodedBrandId;

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
              <h5 className="m-0">{brandDisplayName}</h5>
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