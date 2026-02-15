// ===============================
// BrandGrid.jsx
// Reusable BrandGrid + BrandCard
// ===============================

import { useMemo } from "react";

// ---------------------------
// BrandCard Component
// ---------------------------
export function BrandCard({ brand, onClick }) {
  const imageUrl = brand.image
    ? `https://www.ssactivewear.com/${brand.image}`
    : "https://via.placeholder.com/150?text=No+Image";

  return (
    <div
      className="card text-center cursor-pointer h-100"
      style={{ cursor: "pointer" }}
      onClick={() => onClick(brand)}
    >
      <img
        src={imageUrl}
        alt={brand.name}
        className="card-img-top"
        style={{ objectFit: "contain", height: 120 }}
      />
      <div className="card-body p-2">
        <h6 className="card-title mb-0">{brand.name}</h6>
      </div>
    </div>
  );
}

// ---------------------------
// BrandGrid Component
// ---------------------------
export default function BrandGrid({ brands, filter = "", onPickBrand }) {
  const filtered = useMemo(() => {
    const q = String(filter || "").trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, filter]);

  if (filtered.length === 0) {
    return <div className="text-muted p-3">No brands match.</div>;
  }

  return (
    <div className="row g-3">
      {filtered.map((b) => (
        <div key={b.id} className="col-12 col-md-4">
          <BrandCard brand={b} onClick={onPickBrand} />
        </div>
      ))}
    </div>
  );
}
