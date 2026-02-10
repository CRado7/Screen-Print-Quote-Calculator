import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Card className="h-100">
      {product.thumbnailUrl ? (
        <Card.Img
          variant="top"
          src={product.thumbnailUrl}
          style={{ height: 180, objectFit: "cover" }}
        />
      ) : null}

      <Card.Body className="d-flex flex-column">
        <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
          {product.title || "Untitled"}
        </div>
        <div className="text-muted" style={{ fontSize: 13 }}>
          {product.brand ? `${product.brand} • ` : ""}{product.styleNumber}
        </div>

        <div className="mt-auto pt-3">
          <Button
            as={Link}
            to={`/product/${product.supplier}/${product.id}`}
            variant="outline-primary"
            className="w-100"
          >
            View
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}