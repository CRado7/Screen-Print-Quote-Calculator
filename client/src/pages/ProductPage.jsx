import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
  Badge,
  Card
} from "react-bootstrap";

import { getProduct } from "../api/catalogApi.js";
import { useQuoteStore } from "../store/quoteStore.js";

import ImageViewer from "../components/ImageViewer.jsx";
import SizeRunGrid from "../components/SizeRunGrid.jsx";

export default function ProductPage() {
  const { supplier, productId } = useParams();
  const nav = useNavigate();

  const addLineItem = useQuoteStore((s) => s.addLineItem);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [sizeQty, setSizeQty] = useState({});
  const [markupPerItem, setMarkupPerItem] = useState(0);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");

      try {
        const data = await getProduct({ supplier, productId });
        setProduct(data.product);
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [supplier, productId]);

  const selectedColor = useMemo(() => {
    return product?.colors?.[selectedColorIndex] || null;
  }, [product, selectedColorIndex]);

  function addToQuote() {
    if (!product || !selectedColor) return;

    // Build costBySize from selectedColor.sizes
    const costBySize = {};
    for (const s of selectedColor.sizes || []) {
      costBySize[s.size] = Number(s.cost || 0);
    }

    addLineItem({
      productId: product.id,
      supplier: product.supplier,
      title: product.title,
      styleNumber: product.styleNumber,
      brand: product.brand,
      color: selectedColor.name,
      colorCode: selectedColor.code,
      images: selectedColor.images || [],
      sizeQty,
      costBySize,
      markupPerItem: Number(markupPerItem || 0),
      adjusters: []
    });

    nav("/quote");
  }

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!product) return <Alert variant="warning">No product found.</Alert>;

  return (
    <>
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">{product.title}</h3>
          <div className="text-muted">
            {product.brand ? <>{product.brand} • </> : null}
            <span>{product.styleNumber}</span>
            <Badge bg="secondary" className="ms-2">
              {product.supplier.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button variant="outline-secondary" onClick={() => nav(-1)}>
          Back
        </Button>
      </div>

      <Row className="g-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <ImageViewer images={selectedColor?.images || []} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <div className="fw-semibold mb-2">Colors</div>
              <div className="d-flex flex-wrap gap-2">
                {(product.colors || []).map((c, idx) => (
                  <Button
                    key={c.code || c.name || idx}
                    size="sm"
                    variant={idx === selectedColorIndex ? "primary" : "outline-primary"}
                    onClick={() => setSelectedColorIndex(idx)}
                  >
                    {c.name || "Color"}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <div className="fw-semibold mb-2">Size Run</div>
              <SizeRunGrid
                sizes={(selectedColor?.sizes || []).map((s) => s.size)}
                value={sizeQty}
                onChange={setSizeQty}
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Row className="g-2 align-items-end">
                <Col sm={6}>
                  <Form.Label>Markup per item ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={markupPerItem}
                    onChange={(e) => setMarkupPerItem(e.target.value)}
                  />
                </Col>
                <Col sm={6}>
                  <Button className="w-100" onClick={addToQuote}>
                    Add to Quote
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}