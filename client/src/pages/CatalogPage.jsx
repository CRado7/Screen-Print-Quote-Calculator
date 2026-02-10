import { useEffect, useState } from "react";
import { Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import { searchCatalog } from "../api/catalogApi.js";
import ProductCard from "../components/ProductCard.jsx";

export default function CatalogPage() {
  const [supplier, setSupplier] = useState("ss");
  const [q, setQ] = useState("bella");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  async function runSearch(e) {
    e?.preventDefault?.();

    setLoading(true);
    setError("");

    try {
      const data = await searchCatalog({ supplier, q });
      setResults(data.results || []);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h3 className="mb-3">Catalog</h3>

      <Form onSubmit={runSearch} className="mb-3">
        <Row className="g-2">
          <Col md={2}>
            <Form.Select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="ss">S&S</option>
            </Form.Select>
          </Col>
          <Col md={8}>
            <Form.Control
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
            />
          </Col>
          <Col md={2}>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </Col>
        </Row>
      </Form>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {loading ? (
        <div className="py-5 text-center">
          <Spinner />
        </div>
      ) : (
        <Row className="g-3">
          {results.map((p) => (
            <Col key={p.id} sm={6} md={4} lg={3}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}