import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetProduct } from "../api/catalogApi";

export default function ProductPage() {
  const { productId } = useParams();
  const decodedId = decodeURIComponent(productId || "");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await apiGetProduct(decodedId);
        setProduct(data);
      } catch (e) {
        setError(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedId]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link to={-1} className="btn btn-outline-secondary">
          ← Back
        </Link>
        {loading && <span className="text-muted">Loading…</span>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          {loading && <div className="text-muted">Loading product…</div>}

          {!loading && product && (
            <>
              <h4 className="mb-1">{product?.title || "Product"}</h4>
              <div className="text-muted mb-3">
                {product?.brandName ? `${product.brandName} • ` : ""}
                {product?.partNumber ? `Part # ${product.partNumber} • ` : ""}
                {product?.styleId ? `StyleID ${product.styleId}` : ""}
              </div>

              <pre
                className="bg-light p-3 rounded"
                style={{ maxHeight: 520, overflow: "auto" }}
              >
                {JSON.stringify(product?.raw || product, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}