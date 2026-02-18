import express from "express";
import { createShareToken, getShareToken, setResponse } from "../shareTokenStore.js";
import { sendQuoteEmail } from "../email/sendEmail.js";

const router = express.Router();

router.post("/api/quote/:quoteId/send-email", async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { quote, toEmail, message } = req.body;

    if (!quote) return res.status(400).json({ error: "Missing quote in request body" });
    if (!toEmail) return res.status(400).json({ error: "Missing toEmail" });

    if (quote.id !== quoteId) {
      return res.status(400).json({ error: "quoteId mismatch" });
    }

    const { token } = createShareToken({ quote });

    const link = `${process.env.FRONTEND_URL}/q/view/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2>Your Quote: ${quote.name || "Quote"}</h2>
        <p>Hello${quote.customer?.name ? ` ${quote.customer.name}` : ""},</p>

        ${message ? `<p>${message}</p>` : ""}

        <p>
          Please review your quote using the link below:
        </p>

        <p style="margin: 20px 0;">
          <a href="${link}" style="background:#0d6efd;color:white;padding:10px 14px;border-radius:6px;text-decoration:none;">
            View Quote
          </a>
        </p>
      </div>
    `;

    await sendQuoteEmail({
      to: toEmail,
      subject: `Quote: ${quote.name || quoteId}`,
      html,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

router.get("/api/quote-share/:token", (req, res) => {
  const { token } = req.params;
  const entry = getShareToken(token);

  if (!entry) return res.status(404).json({ error: "Invalid link" });

  const safeQuote = makeCustomerSafeQuote(entry.quote);

  res.json({
    quote: safeQuote,
    response: entry.response,
  });
});

router.post("/api/quote-share/:token/respond", (req, res) => {
  const { token } = req.params;
  const entry = getShareToken(token);

  if (!entry) return res.status(404).json({ error: "Invalid link" });

  const { status, notes } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const response = setResponse(token, { status, notes });

  res.json({ ok: true, response });
});

function makeCustomerSafeQuote(quote) {
  return {
    id: quote.id,
    name: quote.name,
    notes: quote.notes || "",
    customer: {
      name: quote.customer?.name || "",
      company: quote.customer?.company || "",
      email: quote.customer?.email || "",
      phone: quote.customer?.phone || "",
    },
    lineItems: (quote.lineItems || []).map((li) => ({
      id: li.id,
      title: li.title,
      brand: li.brand,
      styleNumber: li.styleNumber,
      color: li.color,
      image: li.image,
      sizeQty: li.sizeQty,

      markupType: li.markupType,
      markupPerItem: li.markupPerItem,
      adjusters: li.adjusters || [],
      costBySize: li.costBySize || {}, // needed to compute sell prices
    })),
  };
}

export default router;
