import { getLineItemTotals, getQuoteTotals } from "../utils/quoteMath.js";
import { toMoney } from "../utils/money.js";

export default function PrintableQuote({ lineItems }) {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const totals = getQuoteTotals(items);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Quote</div>
          <div style={{ color: "#666", fontSize: 12 }}>
            Generated: {new Date().toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{toMoney(totals.sellTotal)}</div>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      {items.map((li) => {
        const t = getLineItemTotals(li);

        // Customer view: we DO NOT show cost/markup/profit.
        // We only show final totals.

        const sizes = Object.entries(li.sizeQty || {}).filter(([, qty]) => Number(qty) > 0);

        return (
          <div key={li.id} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700 }}>{li.title}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {li.brand ? `${li.brand} • ` : ""}
              {li.styleNumber} • {li.color}
            </div>

            <div style={{ marginTop: 8 }}>
              <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left" style={{ borderBottom: "1px solid #ddd" }}>Size</th>
                    <th align="right" style={{ borderBottom: "1px solid #ddd" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(([size, qty]) => (
                    <tr key={size}>
                      <td style={{ borderBottom: "1px solid #eee" }}>{size}</td>
                      <td align="right" style={{ borderBottom: "1px solid #eee" }}>{qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <div style={{ color: "#666", fontSize: 12 }}>
                Total Qty: {t.totalQty}
              </div>
              <div style={{ fontWeight: 700 }}>{toMoney(t.sellTotal)}</div>
            </div>
          </div>
        );
      })}

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ color: "#666", fontSize: 12 }}>Grand Total</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{toMoney(totals.sellTotal)}</div>
      </div>

      <div style={{ marginTop: 16, color: "#777", fontSize: 11 }}>
        This quote does not include taxes or shipping unless otherwise stated.
      </div>
    </div>
  );
}