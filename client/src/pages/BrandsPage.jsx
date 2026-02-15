import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetBrands } from "../api/catalogApi";
import BrandGrid from "../components/BrandGrid";

export default function BrandsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [brandFilter, setBrandFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await apiGetBrands();
        setBrands(data);
      } catch (e) {
        setError(e?.message || "Failed to load brands");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function pickBrand(b) {
    navigate(`/brand/${encodeURIComponent(b.brandId)}`);
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h5 className="m-0">Brands</h5>
        {loading && <span className="small text-muted">Loading…</span>}
      </div>

      <input
        className="form-control mb-3"
        placeholder="Filter brands (bella, gildan, next level…)"
        value={brandFilter}
        onChange={(e) => setBrandFilter(e.target.value)}
      />

      {loading ? (
        <div className="text-muted">Loading brands…</div>
      ) : (
        <BrandGrid
          brands={brands}
          filter={brandFilter}
          onPickBrand={pickBrand}
        />
      )}
    </div>
  );
}
