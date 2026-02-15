import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard.jsx";

const PAGE_SIZE = 21;

export default function ProductGrid({ products, filter, onPickProduct }) {
  const [page, setPage] = useState(1);

  // 1) Filter SKUs first (still filtering raw SKU rows)
  const filteredSkus = useMemo(() => {
    const q = String(filter || "").trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const haystack = [
        p.brandName,
        p.styleName,
        p.styleID,
        p.sku,
        p.colorName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [products, filter]);

  // 2) Group SKUs by styleID
  const styleGroups = useMemo(() => {
    const map = new Map();
  
    for (const sku of filteredSkus) {
      const styleId = sku?.styleID;
      if (!styleId) continue;
  
      if (!map.has(styleId)) {
        map.set(styleId, {
          styleID: sku.styleID,
          styleName: sku.styleName,
          brandName: sku.brandName,
          skus: [],
        });
      }
  
      map.get(styleId).skus.push(sku);
    }
  
    // Now pick the best image per style
    return Array.from(map.values()).map((style) => {
      const skuWithImage = style.skus.find(
        (s) =>
          (s.colorFrontImage && s.colorFrontImage.trim()) ||
          (s.colorSwatchImage && s.colorSwatchImage.trim()) ||
          (s.colorBackImage && s.colorBackImage.trim())
      );
  
      const displayImage =
        skuWithImage?.colorFrontImage ||
        skuWithImage?.colorSwatchImage ||
        skuWithImage?.colorBackImage ||
        "";
  
      return {
        ...style,
        displayImage,
      };
    });
  }, [filteredSkus]);
  

  // Reset page when filter/products changes
  useEffect(() => {
    setPage(1);
  }, [filter, products]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(styleGroups.length / PAGE_SIZE));

  // Clamp page in case data changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Slice current page (styles, not skus)
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return styleGroups.slice(start, start + PAGE_SIZE);
  }, [styleGroups, page]);

  // Pagination helper
  function getPaginationPages(current, total) {
    const pages = new Set();
    pages.add(1);
    pages.add(total);
    pages.add(current);
    pages.add(current - 1);
    pages.add(current + 1);

    if (current <= 3) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }
    if (current >= total - 2) {
      pages.add(total - 1);
      pages.add(total - 2);
      pages.add(total - 3);
    }

    const sorted = [...pages]
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      const n = sorted[i];
      const prev = sorted[i - 1];
      if (i > 0 && n - prev > 1) result.push("…");
      result.push(n);
    }
    return result;
  }

  return (
    <div>
      {/* Top pagination info */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="text-muted small">
          Showing{" "}
          <span className="fw-semibold">
            {(page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, styleGroups.length)}
          </span>{" "}
          of <span className="fw-semibold">{styleGroups.length}</span> styles
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {pageItems.map((style) => (
          <div key={style.styleID} className="col-12 col-md-6 col-lg-4">
            <ProductCard product={style} onPickProduct={onPickProduct} />
          </div>
        ))}
      </div>

      {/* Pagination numbers */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="btn-group flex-wrap">
            {getPaginationPages(page, totalPages).map((item, idx) =>
              item === "…" ? (
                <button
                  key={`dots-${idx}`}
                  className="btn btn-sm btn-outline-secondary"
                  disabled
                >
                  …
                </button>
              ) : (
                <button
                  key={item}
                  className={`btn btn-sm ${
                    item === page ? "btn-dark" : "btn-outline-secondary"
                  }`}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
