import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

export default function SendQuoteModal({ show, onHide, quote, onSend }) {
  const [toEmail, setToEmail] = useState(quote?.customer?.email || "");
  const [subject, setSubject] = useState(`Quote: ${quote?.name || ""}`);
  const [message, setMessage] = useState(quote?.notes || "");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  async function handleSend() {
    if (!toEmail) return setErr("Recipient email is required.");

    setSending(true);
    setErr("");

    try {
      await onSend({ toEmail, subject, message });
      onHide();
    } catch (e) {
      setErr(e.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Send Quote to Customer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>To</Form.Label>
          <Form.Control
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>

        <Alert variant="info">
          Customer will receive a link to view the quote and approve or reject it.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={sending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSend} disabled={sending}>
          {sending ? <Spinner animation="border" size="sm" /> : "Send Email"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
