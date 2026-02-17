import { useNavigate } from "react-router-dom";
import { Button, Card, Table } from "react-bootstrap";

import { useQuoteStore } from "../store/quoteStore.js";
import { getQuoteTotals } from "../utils/quoteMath.js";
import { toMoney } from "../utils/money.js";

export default function QuotesPage() {
  const navigate = useNavigate();

  const quotes = useQuoteStore((s) => s.quotes);
  const createQuote = useQuoteStore((s) => s.createQuote);
  const deleteQuote = useQuoteStore((s) => s.deleteQuote);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">Quotes</h3>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Saved to your browser (local storage)
          </div>
        </div>

        <Button
          onClick={() => {
            const id = createQuote({ name: "New Quote" });
            navigate(`/quote/${id}`);
          }}
        >
          + New Quote
        </Button>
      </div>

      <Card>
        <Card.Body>
          {quotes.length ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Customer</th>
                  <th className="text-end">Units</th>
                  <th className="text-end">Total</th>
                  <th style={{ width: 220 }}></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const totals = getQuoteTotals(q.lineItems || []);
                  return (
                    <tr key={q.id}>
                      <td className="fw-semibold">{q.name}</td>
                      <td>{q.customer?.name || "—"}</td>
                      <td className="text-end">{totals.totalQty}</td>
                      <td className="text-end">{toMoney(totals.sellTotal)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(`/quote/${q.id}`)}
                          >
                            Edit
                          </Button>

                          <Button size="sm" variant="outline-secondary" disabled>
                            PDF
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteQuote(q.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">
              No quotes saved yet. Click “New Quote”.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
