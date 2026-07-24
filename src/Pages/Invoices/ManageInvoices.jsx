import React, { useEffect, useMemo, useState } from "react";
import InvoiceService from "../../services/InvoicesService";
import "./ManageInvoices.css";
import PaymentModal from "./PaymentModal";
/* ── Small inline icons (no external icon package required) ─────────── */
const IconGear = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 13.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.6a1.7 1.7 0 0 0 1.04-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.6a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
    <path d="M5 8.5l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.4-1.4 1-1.4 2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const IconInvoiceDoc = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h6" strokeLinecap="round" />
  </svg>
);

/* ── Status presentation — order controls which sections render first ── */
const STATUS_META = {
  OVERDUE: { label: "Overdue", className: "status-overdue" },
  UNPAID: { label: "Unpaid", className: "status-unpaid" },
  PAID: { label: "Paid", className: "status-paid" },
  DRAFT: { label: "Draft", className: "status-draft" },
};
const STATUS_ORDER = ["OVERDUE", "UNPAID", "PAID", "DRAFT"];

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

export default function ManageInvoices({ onNavigate, invoices: invoicesProp }) {
  const [invoices, setInvoices] = useState(invoicesProp || []);
  const [loading, setLoading] = useState(!invoicesProp);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);

  // Load invoices from the backend unless the caller already passed a list in.
  useEffect(() => {
    if (invoicesProp) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    InvoiceService.getAllInvoices()
      .then(({ data }) => {
        if (cancelled) return;
        setInvoices(Array.isArray(data) ? data : data?.content ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load invoices.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicesProp]);

  const rangeStart = `${year}-01-01`;
  const rangeEnd = `${year}-12-31`;

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const invYear = Number(String(inv.invoiceDate || inv.dueDate).slice(0, 4));
      if (invYear !== year) return false;
      if (!term) return true;
      return (
        inv.clientName?.toLowerCase().includes(term) ||
        String(inv.invoiceNumber).includes(term)
      );
    });
  }, [invoices, year, search]);

  const groups = useMemo(() => {
    const byStatus = {};
    filteredInvoices.forEach((inv) => {
      const key = inv.status || "DRAFT";
      if (!byStatus[key]) byStatus[key] = [];
      byStatus[key].push(inv);
    });
    return STATUS_ORDER.filter((key) => byStatus[key]?.length).map((key) => {
      const list = byStatus[key];
      const total = list.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      const vat = list.reduce((sum, inv) => sum + Number(inv.vatAmount || 0), 0);
      return { key, meta: STATUS_META[key] || STATUS_META.DRAFT, list, total, vat };
    });
  }, [filteredInvoices]);

  const overallTotal = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const overallVat = filteredInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount || 0), 0);
  const overallNet = overallTotal - overallVat;

  const toggleRowFlag = (id, field) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, [field]: !inv[field] } : inv))
    );
  };

  // Opens the "Add new payment" modal instead of directly toggling —
  // marking an invoice paid always goes through recording a payment now.
  const handlePaidCheckbox = (inv) => {
    if (inv.paid) return; // already fully paid — nothing to do from the row itself
    setPaymentModalInvoice(inv);
  };

  // Called by PaymentModal after a successful save (InvoicePaymentSummaryDTO).
  const handlePaymentSaved = (summary) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === summary.invoiceId
          ? {
              ...inv,
              paid: summary.paid,
              status: summary.status,
              amountPaid: summary.totalPaid,
            }
          : inv
      )
    );
  };

  const handleDeleteInvoice = async (id) => {
    setOpenMenuId(null);
    try {
      await InvoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete the invoice.");
    }
  };

  if (loading) {
    return (
      <main className="content">
        <div className="page-header">
          <h1>Invoices</h1>
        </div>
        <div className="loading-state">Loading invoices…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="content">
        <div className="page-header">
          <h1>Invoices</h1>
        </div>
        <div className="error-state">{error}</div>
      </main>
    );
  }

  return (
    <main className="content">
      <div className="page-header">
        <h1>Invoices</h1>
      </div>

      <div className="toolbar">
        <div className="left-actions">
          <button
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate("newInvoice")}
          >
            <IconInvoiceDoc />
            New invoice
          </button>
          <button className="btn btn-outline">Report / export</button>
        </div>

        <div className="center-nav">
          <button onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            {"‹"}
          </button>
          <div className="month-box">{year}</div>
          <button onClick={() => setYear((y) => y + 1)} aria-label="Next year">
            {"›"}
          </button>
        </div>

        <div className="right-actions">
          <input type="text" value={rangeStart} readOnly className="date-input" />
          <span>-</span>
          <input type="text" value={rangeEnd} readOnly className="date-input" />
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="invoice-area">
        {groups.length === 0 ? (
          <div className="empty-state">
            <p>No invoices to show</p>
            <a href="/">Read more about invoices here.</a>
          </div>
        ) : (
          groups.map((group) => (
            <section className={`status-group ${group.meta.className}`} key={group.key}>
              <div className="status-summary">
                <div className="status-label">{group.meta.label}</div>
                <div className="status-amount">{formatKr(group.total)}</div>
                <div className="status-vat">of which VAT {formatKr(group.vat)}</div>
              </div>

              <div className="status-table">
                <div className="status-table-header">
                  <div>#</div>
                  <div>CLIENT</div>
                  <div>TOTAL</div>
                  <div>DUE DATE</div>
                  <div>PAID</div>
                  <div>SENT</div>
                  <div className="auto-col">
                    AUTO <IconHelp />
                  </div>
                  <div className="menu-col" />
                </div>

                {group.list.map((inv) => (
                  <div className="status-table-row" key={inv.id}>
                    <div>{inv.invoiceNumber}</div>
                    <div>
                      <a href="#client" className="client-link" onClick={(e) => e.preventDefault()}>
                        {inv.clientName}
                      </a>
                    </div>
                    <div>{formatKr(inv.total)}</div>
                    <div>{inv.dueDate}</div>
                    <div>
                      <input
                        type="checkbox"
                        checked={!!inv.paid}
                        onClick={(e) => {
                          e.preventDefault(); // stop native checkbox flash-toggle
                          handlePaidCheckbox(inv); // opens the payment modal (or no-ops if already paid)
                        }}
                        onChange={() => {}} // no-op: silences the "controlled checkbox needs onChange" warning; onClick does the real work
                      />
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={!!inv.sent}
                        onChange={() => toggleRowFlag(inv.id, "sent")}
                      />
                    </div>
                    <div />
                    <div className="row-menu">
                      <button
                        type="button"
                        className="row-menu-btn"
                        aria-label="Row actions"
                        onClick={() => setOpenMenuId((prev) => (prev === inv.id ? null : inv.id))}
                      >
                        <IconGear />
                        <IconChevronDown />
                      </button>

                      {openMenuId === inv.id && (
                        <div className="row-menu-dropdown">
                          <button type="button" onClick={() => onNavigate && onNavigate("editInvoice", inv.id)}>
                            Edit
                          </button>
                          <button type="button">Duplicate</button>
                          <button type="button">Send</button>
                          <button
                            type="button"
                            className="row-menu-danger"
                            onClick={() => handleDeleteInvoice(inv.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        <div className="summary">
          {filteredInvoices.length} invoice{filteredInvoices.length === 1 ? "" : "s"} in SEK:{" "}
          <strong>{formatKr(overallTotal)}</strong> (incl. VAT: <strong>{formatKr(overallVat)}</strong>) Net:{" "}
          <strong>{formatKr(overallNet)}</strong>
        </div>
      </div>

      <footer className="footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button className="help-btn">❓ Help</button>

      {paymentModalInvoice && (
        <PaymentModal
          invoice={paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          onSaved={handlePaymentSaved}
        />
      )}
    </main>
  );
}