export default function ProductCard({ product, onPickProduct }) {
  const title =
    product?.styleName
      ? `${product.brandName || ""} ${product.styleName}`.trim()
      : product?.sku || "Product";

  const imagePath =
    product?.displayImage

  const imageUrl = imagePath
  ? `https://www.ssactivewear.com/${String(imagePath)
      .replace(/^\/+/, "")
      .replace("_fm", "_fl")}`
  : null;  

    console.log("displayImage:", product?.displayImage);
    console.log("imageUrl:", imageUrl);
    
  return (
    <button
      type="button"
      className="card h-100 text-start shadow-sm border-0"
      style={{ cursor: "pointer", overflow: "hidden" }}
      onClick={() => onPickProduct?.(product)}
    >
      <div
        style={{
          height: 170,
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 10,
            }}
            loading="lazy"
          />
        ) : (
          <div className="text-muted small">No image</div>
        )}
      </div>

      <div className="card-body">
        <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
          {title}
        </div>

        <div className="small text-muted mt-2">
          {/* {product?.brandName && <div>{product.brandName}</div>} */}
          <div>
            {product?.colorName}
            {product?.colorName && product?.sizeName ? " • " : ""}
            {product?.sizeName ? `Size ${product.sizeName}` : ""}
          </div>
          {/* {styleNumber && <div className="mt-1">Style: {styleNumber}</div>}
          {product?.sku && <div className="mt-1">SKU: {product.sku}</div>} */}
        </div>
      </div>

      <div className="card-footer bg-transparent border-0 pt-0">
        <span
          className="btn btn-sm btn-outline-primary w-100"
          onClick={() => onPickProduct?.(product)}
        >
          View product
        </span>
      </div>
    </button>
  );
}
