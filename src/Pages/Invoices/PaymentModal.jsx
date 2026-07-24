import React, { useEffect, useState } from "react";
import InvoiceService from "../../services/InvoicesService";
import "./PaymentModal.css";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function PaymentModal({ invoice, onClose, onSaved }) {
  const startingRemaining = Math.max(
    Number(invoice.total || 0) - Number(invoice.amountPaid || 0),
    0
  );

  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [amountPaid, setAmountPaid] = useState(startingRemaining.toFixed(2));
  const [cash, setCash] = useState(false);
  const [history, setHistory] = useState([]);
  const [remaining, setRemaining] = useState(startingRemaining);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    InvoiceService.getPayments(invoice.id)
      .then(({ data }) => {
        if (cancelled) return;
        setHistory(data.payments || []);
        if (data.remaining !== undefined) setRemaining(Number(data.remaining));
      })
      .catch(() => {
        // non-fatal — modal still usable with the estimate already computed
      })
      .finally(() => !cancelled && setLoadingHistory(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.id]);

  const handleSave = async () => {
    setError(null);
    const amt = Number(amountPaid);
    if (!amt || amt <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await InvoiceService.addPayment(invoice.id, {
        paymentDate,
        amountPaid: amt,
        cash,
      });
      onSaved(data); // InvoicePaymentSummaryDTO
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add new payment</h2>
        <div className="payment-modal-invoice">Invoice #{invoice.invoiceNumber}</div>

        <label htmlFor="pm-date">When was the payment made?</label>
        <input
          id="pm-date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />

        <label htmlFor="pm-amount">Amount paid (SEK)</label>
        <input
          id="pm-amount"
          type="number"
          step="0.01"
          min="0"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />

        <label className="payment-modal-checkbox">
          <input type="checkbox" checked={cash} onChange={(e) => setCash(e.target.checked)} />
          Cash
        </label>

        <hr />

        <h3>Payment history</h3>
        {loadingHistory ? (
          <p className="payment-history-empty">Loading…</p>
        ) : history.length === 0 ? (
          <p className="payment-history-empty">No payments have been added yet.</p>
        ) : (
          <ul className="payment-history-list">
            {history.map((p) => (
              <li key={p.id}>
                {p.paymentDate} — {Number(p.amountPaid).toFixed(2)} kr {p.cash ? "(cash)" : ""}
              </li>
            ))}
          </ul>
        )}

        <div className="payment-modal-remaining">
          Remaining: <strong>{remaining.toFixed(2)} kr</strong>
        </div>

        {error && <div className="payment-modal-error">{error}</div>}

        <div className="payment-modal-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}