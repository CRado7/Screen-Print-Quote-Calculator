import { useMemo } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";

import { useQuoteStore } from "../store/quoteStore.js";
import { getLineItemTotals } from "../utils/quoteMath.js";
import { toMoney } from "../utils/money.js";

import AdjustersEditor from "./AdjustersEditor.jsx";

export default function QuoteLineItem({ lineItem }) {
  const removeLineItem = useQuoteStore((s) => s.removeLineItem);
  const updateLineItem = useQuoteStore((s) => s.updateLineItem);

  const totals = useMemo(() => getLineItemTotals(lineItem), [lineItem]);

  const sizes = Object.keys(lineItem.sizeQty || {});

  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <div className="fw-semibold">{lineItem.title}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              {lineItem.brand ? `${lineItem.brand} • ` : ""}
              {lineItem.styleNumber} • {lineItem.color}
            </div>
          </div>
          <Button variant="outline-danger" size="sm" onClick={() => removeLineItem(lineItem.id)}>
            Remove
          </Button>
        </div>

        <Row className="g-3 pt-3">
          <Col md={6}>
            <div className="fw-semibold mb-2">Sizes</div>
            <Table bordered size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Size</th>
                  <th className="text-end">Qty</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>
                    <td className="text-end">{lineItem.sizeQty[s]}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <Col md={6}>
            <Row className="g-2">
              <Col sm={6}>
                <Form.Label>Markup per item ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={lineItem.markupPerItem ?? 0}
                  onChange={(e) =>
                    updateLineItem(lineItem.id, { markupPerItem: Number(e.target.value || 0) })
                  }
                />
              </Col>
              <Col sm={6}>
                <div className="fw-semibold">Line Total</div>
                <div style={{ fontSize: 20 }} className="fw-bold">
                  {toMoney(totals.sellTotal)}
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Internal profit: {toMoney(totals.profit)}
                </div>
              </Col>
            </Row>

            <div className="pt-3">
              <AdjustersEditor
                adjusters={lineItem.adjusters || []}
                onChange={(adjusters) => updateLineItem(lineItem.id, { adjusters })}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}