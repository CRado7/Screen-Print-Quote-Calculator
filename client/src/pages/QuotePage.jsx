import { useMemo, useRef } from "react";
import { Alert, Button, Card, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

import { useQuoteStore } from "../store/quoteStore.js";
import { getQuoteTotals, getLineItemTotals } from "../utils/quoteMath.js";
import { toMoney } from "../utils/money.js";

import QuoteLineItem from "../components/QuoteLineItem.jsx";
import PrintableQuote from "../components/PrintableQuote.jsx";

export default function QuotePage() {
  const lineItems = useQuoteStore((s) => s.lineItems);
  const clearQuote = useQuoteStore((s) => s.clearQuote);

  const totals = useMemo(() => getQuoteTotals(lineItems), [lineItems]);

  const printRef = useRef(null);
  const doPrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `quote-${new Date().toISOString().slice(0, 10)}`
  });

  if (!lineItems.length) {
    return <Alert variant="secondary">No items yet. Add products from the catalog.</Alert>;
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Quote</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={clearQuote}>
            Clear
          </Button>
          <Button onClick={doPrint}>Export PDF</Button>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {lineItems.map((li) => (
          <QuoteLineItem key={li.id} lineItem={li} />
        ))}
      </div>

      <Card className="mt-4">
        <Card.Body>
          <div className="fw-semibold mb-2">Totals</div>
          <Table size="sm" className="mb-0">
            <tbody>
              <tr>
                <td>Total Quantity</td>
                <td className="text-end">{totals.totalQty}</td>
              </tr>
              <tr>
                <td>Quote Total</td>
                <td className="text-end fw-semibold">{toMoney(totals.sellTotal)}</td>
              </tr>
            </tbody>
          </Table>

          <div className="text-muted pt-2" style={{ fontSize: 13 }}>
            Internal breakdown (not shown on PDF): Cost {toMoney(totals.costSubtotal)} • Profit {toMoney(totals.profit)}
          </div>
        </Card.Body>
      </Card>

      {/* Hidden printable component */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }}>
        <div ref={printRef}>
          <PrintableQuote lineItems={lineItems} />
        </div>
      </div>
    </>
  );
}