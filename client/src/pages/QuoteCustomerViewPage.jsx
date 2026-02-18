import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Form, Spinner, Table, Alert } from "react-bootstrap";

import { apiGetSharedQuote, apiRespondToSharedQuote } from "../api/quoteShareApi.js";
import { toMoney } from "../utils/money.js";
import { getLineItemCustomerPricing, getQuoteCustomerTotals } from "../utils/quotePricing.js";

export default function QuoteCustomerViewPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [quote, setQuote] = useState(null);
  const [response, setResponse] = useState(null);

  const [rejectNotes, setRejectNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiGetSharedQuote(token);

        if (!alive) return;

        setQuote(data.quote);
        setResponse(data.response || null);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load quote");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token]);

  const totals = useMemo(() => {
    return getQuoteCustomerTotals(quote?.lineItems || []);
  }, [quote]);

  async function submit(status) {
    try {
      setSubmitting(true);
      setErr("");

      const payload = {
        status,
        notes: status === "rejected" ? rejectNotes : "",
      };

      const data = await apiRespondToSharedQuote(token, payload);

      setResponse(data.response);
    } catch (e) {
      setErr(e.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner animation="border" />
        <div className="mt-3 text-muted">Loading quote…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-5" style={{ maxWidth: 900 }}>
        <Alert variant="danger">{err}</Alert>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container py-5" style={{ maxWidth: 900 }}>
        <Alert variant="warning">Quote not found.</Alert>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="mb-3">
        <h2 className="mb-1">{quote.name}</h2>
        <div className="text-muted" style={{ fontSize: 13 }}>
          {quote.customer?.company || ""}{" "}
          {quote.customer?.name ? `• ${quote.customer.name}` : ""}
        </div>
      </div>

      {response?.status && (
        <Alert variant={response.status === "approved" ? "success" : "warning"}>
          <div className="fw-semibold">
            This quote has been {response.status}.
          </div>
          {response.notes && (
            <div className="mt-1" style={{ whiteSpace: "pre-wrap" }}>
              <strong>Notes:</strong> {response.notes}
            </div>
          )}
        </Alert>
      )}

      {quote.notes && (
        <Card className="mb-3">
          <Card.Body>
            <div className="fw-semibold mb-1">Notes</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{quote.notes}</div>
          </Card.Body>
        </Card>
      )}

      {(quote.lineItems || []).map((li) => {
        const pricing = getLineItemCustomerPricing(li);

        return (
          <Card key={li.id} className="mb-3">
            <Card.Body>
              <div className="d-flex gap-3">
                {li.image && (
                  <img
                    src={li.image}
                    alt={li.title}
                    width={70}
                    height={70}
                    style={{ objectFit: "contain" }}
                  />
                )}

                <div className="flex-grow-1">
                  <div className="fw-semibold">{li.title}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {li.brand ? `${li.brand} • ` : ""}
                    {li.styleNumber} • {li.color}
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Line total
                  </div>
                  <div className="fw-bold" style={{ fontSize: 18 }}>
                    {toMoney(pricing.lineTotal)}
                  </div>
                </div>
              </div>

              <Table bordered size="sm" className="mt-3 mb-0">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Unit price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.rows.map((r) => (
                    <tr key={r.size}>
                      <td>{r.size}</td>
                      <td className="text-end">{r.qty}</td>
                      <td className="text-end">{toMoney(r.unitSell)}</td>
                      <td className="text-end">{toMoney(r.total)}</td>
                    </tr>
                  ))}

                  {pricing.flatAdjusters > 0 && (
                    <tr>
                      <td colSpan={3} className="text-end fw-semibold">
                        Flat fees
                      </td>
                      <td className="text-end fw-semibold">
                        {toMoney(pricing.flatAdjusters)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        );
      })}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-semibold">Total units</div>
              <div className="text-muted">{totals.totalQty}</div>
            </div>

            <div className="text-end">
              <div className="fw-semibold">Total</div>
              <div className="fw-bold" style={{ fontSize: 22 }}>
                {toMoney(totals.sellTotal)}
              </div>
            </div>
          </div>

          {!response?.status && (
            <>
              <hr />

              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  disabled={submitting}
                  onClick={() => submit("approved")}
                >
                  {submitting ? "Submitting..." : "Approve"}
                </Button>

                <Button
                  variant="outline-danger"
                  disabled={submitting}
                  onClick={() => submit("rejected")}
                >
                  {submitting ? "Submitting..." : "Reject"}
                </Button>
              </div>

              <div className="mt-3">
                <Form.Label>Rejection notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="If rejecting, tell us what needs to change..."
                />
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
