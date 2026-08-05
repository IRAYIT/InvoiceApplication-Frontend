import React, { useEffect, useState } from "react";
import InvoiceService from "../../services/InvoicesService";
import "./ViewInvoice.css";
import PaymentModal from "./PaymentModal";
import SendInvoicePanel from "./SendInvoicePanel";

/* ── Small inline icons (kept consistent with ManageInvoices icon set) ── */
const IconPrint = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 14h12v7H6z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 7h16" strokeLinecap="round" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
  </svg>
);

const IconClient = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.6 3.1-6.3 7-6.3s7 2.7 7 6.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHistory = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

const formatHistoryTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ViewInvoice({ invoiceId, invoice: invoiceProp, onNavigate }) {
  const [invoice, setInvoice] = useState(invoiceProp || null);
  const [loading, setLoading] = useState(!invoiceProp);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [sendPanelOpen, setSendPanelOpen] = useState(false);

  const id = invoiceProp?.id ?? invoiceId;

  useEffect(() => {
    if (invoiceProp) return;
    if (!id) {
      setError("No invoice was specified.");
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setError(null);

    InvoiceService.getInvoiceById(id)
      .then(({ data }) => {
        if (cancelled) return;
        setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load the invoice.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invoiceProp]);

  const handlePaidCheckbox = () => {
    if (invoice.status === "PAID") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentSaved = (summary) => {
    setInvoice((prev) => ({
      ...prev,
      status: summary.status,
      amountPaid: summary.totalPaid,
    }));
    setPaymentModalOpen(false);
  };

  const handleSentToggle = async () => {
    // Only DRAFT <-> SENT is a manual toggle — PAID/OVERDUE/CANCELLED
    // shouldn't be silently reverted by unchecking this box.
    if (invoice.status !== "DRAFT" && invoice.status !== "SENT") return;
    const nextStatus = invoice.status === "SENT" ? "DRAFT" : "SENT";
    const prevStatus = invoice.status;
    setInvoice((prev) => ({ ...prev, status: nextStatus }));
    try {
      await InvoiceService.updateInvoice(invoice.id, { ...invoice, status: nextStatus });
    } catch (err) {
      setInvoice((prev) => ({ ...prev, status: prevStatus }));
      setActionError(err?.response?.data?.message || "Failed to update the invoice.");
    }
  };

  const handleSendInvoiceClick = () => {
    setSendPanelOpen((open) => !open);
  };

  const handleInvoiceSent = ({ method, target }) => {
    setInvoice((prev) => ({
      ...prev,
      status: prev.status === "DRAFT" ? "SENT" : prev.status,
      history: [
        { label: `Sent by ${method === "EMAIL" ? "e-mail" : method === "POST" ? "postal mail" : "e-invoice"} to ${target}`, timestamp: new Date().toISOString() },
        ...(prev.history || []),
      ],
    }));
  };

  const handleViewPdf = async () => {
    setActionError(null);
    try {
      const { data } = await InvoiceService.downloadInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to open the PDF.");
    }
  };

  const handleCredit = () => {
    onNavigate && onNavigate("creditInvoice", invoice.id);
  };

  const handleGoToClient = () => {
    onNavigate && onNavigate("clientDetail", invoice.clientId);
  };

  if (loading) {
    return (
      <main className="content">
        <div className="loading-state">Loading invoice…</div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="content">
        <div className="error-state">{error || "Invoice not found."}</div>
      </main>
    );
  }

  // ── Field mapping fixes ──────────────────────────────────────────
  // Backend returns `items`, not `lineItems`.
  const items = invoice.items || [];

  // Backend returns subtotal / taxAmount / totalAmount at the invoice
  // level (not net / vatAmount / total).
  const net = invoice.subtotal ?? 0;
  const vatAmount = invoice.taxAmount ?? 0;
  const grandTotal = invoice.totalAmount ?? 0;
  const rounding = invoice.roundingAmount || 0;

  // No single vatRate field on the invoice — derive it from the first
  // line item's taxPercent (falls back to 25 if there are no items).
  const vatRate = items[0]?.taxPercent ?? 25;

  const history = invoice.history || [];
  const isPaid = invoice.status === "PAID";
  const isSent = invoice.status !== "DRAFT" && invoice.status !== "CANCELLED";

  return (
    <main className="content invoice-view">
      <h1 className="invoice-page-title">Invoice #{invoice.invoiceNumber}</h1>

      {sendPanelOpen && (
        <SendInvoicePanel
          invoice={invoice}
          onClose={() => setSendPanelOpen(false)}
          onSent={handleInvoiceSent}
        />
      )}

      <div className="invoice-view-grid">
        {/* ── Invoice document ─────────────────────────────── */}
        <section className="invoice-doc">
          <div className="invoice-doc-header">
            <h1 className="invoice-doc-title">INVOICE</h1>
          </div>

          <div className="invoice-meta-row">
            <div className="invoice-meta-box">
              <div className="meta-box-columns">
                <div className="meta-fields-col">
                  <div className="meta-line">
                    <span>Invoice no.</span>
                    <strong>{invoice.invoiceNumber}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Client no.</span>
                    <strong>{invoice.clientNumber ?? invoice.clientId}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Invoice date</span>
                    <strong>{invoice.invoiceDate}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Payment terms</span>
                    <strong>{invoice.paymentTerms || "Net 30"}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Payment due</span>
                    <strong>{invoice.dueDate}</strong>
                  </div>
                </div>

                <div className="meta-refs-col">
                  {invoice.yourReference && (
                    <div className="meta-reference-block">
                      <span className="meta-reference-label">Your reference</span>
                      <div className="meta-reference-value">{invoice.yourReference}</div>
                    </div>
                  )}
                  {invoice.ourReference && (
                    <div className="meta-reference-block">
                      <span className="meta-reference-label">Our reference</span>
                      <div className="meta-reference-value">{invoice.ourReference}</div>
                    </div>
                  )}
                </div>
              </div>

              <p className="meta-note">Interest will be charged on overdue payments</p>
            </div>

            <div className="invoice-address-box">
              <div className="address-label">Bill to</div>
              <div className="address-body">
                <strong>{invoice.clientName}</strong>
                {(invoice.billingAddressLines || []).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th>Quantity</th>
                <th>Price per unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td></td>
                  <td>1.00</td>
                  <td>0.00</td>
                  <td>0.00</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{Number(item.quantity || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>{Number(item.unitPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>{Number(item.lineTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="totals-line">
              <span>Net:</span>
              <span>{formatKr(net)}</span>
            </div>
            <div className="totals-line">
              <span>VAT {vatRate}% (calculated on {formatKr(net)}):</span>
              <span>{formatKr(vatAmount)}</span>
            </div>
            <div className="totals-line">
              <span>Rounding:</span>
              <span>{formatKr(rounding)}</span>
            </div>
            <div className="totals-line totals-grand">
              <span>Total Due:</span>
              <span>{formatKr(grandTotal)}</span>
            </div>
          </div>

          <div className="invoice-footer-boxes">
            <div className="footer-box">
              <div className="footer-col">
                <div className="footer-label">Address</div>
                <div>{invoice.companyAddress}</div>
              </div>
              <div className="footer-col">
                <div className="footer-label">Company Email</div>
                <div>{invoice.companyEmail}</div>
                {invoice.approvedForFTax && <div className="footer-note">Approved for F-tax</div>}
              </div>
            </div>
          </div>
        </section>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="invoice-sidebar">
          {actionError && <div className="sidebar-error">{actionError}</div>}

          <button
            className={`btn btn-send ${isSent ? "btn-send-sent" : ""}`}
            onClick={handleSendInvoiceClick}
          >
            Send the invoice
          </button>

          <button className="btn btn-outline" onClick={() => onNavigate && onNavigate("editInvoice", invoice.id)}>
            Edit invoice
          </button>

          <nav className="sidebar-links">
            <button type="button" onClick={handleViewPdf}>
              <IconPrint /> View as PDF (Print)
            </button>
            <button type="button" onClick={handleCredit}>
              <IconTrash /> Credit/Partial credit
            </button>
          </nav>

          <button type="button" className="sidebar-link go-to-client" onClick={handleGoToClient}>
            <IconClient /> Go to client
          </button>

          <div className="sidebar-flags">
            <label>
              <input
                type="checkbox"
                checked={isPaid}
                onClick={(e) => {
                  e.preventDefault();
                  handlePaidCheckbox();
                }}
                onChange={() => {}}
              />
              Paid
            </label>
            <label>
              <input type="checkbox" checked={isSent} onChange={handleSentToggle} />
              Sent
            </label>
          </div>

          <div className="sidebar-history">
            <div className="history-heading">
              <IconHistory /> History
            </div>
            {history.length === 0 ? (
              <p className="history-empty">No history yet.</p>
            ) : (
              history.map((event, i) => (
                <div className="history-entry" key={i}>
                  <div className="history-label">{event.label}</div>
                  <div className="history-timestamp">{formatHistoryTimestamp(event.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {paymentModalOpen && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setPaymentModalOpen(false)}
          onSaved={handlePaymentSaved}
        />
      )}
    </main>
  );
}