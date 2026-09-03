import React, { useEffect, useMemo, useState } from "react";
import InvoiceService from "../../services/InvoicesService";
import "./ManageInvoices.css";
import PaymentModal from "./PaymentModal";
import SendInvoicePanel from "./SendInvoicePanel";
import ConfirmDialog from "./ConfirmDialog";

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

/* ── Row-menu icons (kept consistent with ViewInvoice's icon set) ───── */
const IconClient = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.6 3.1-6.3 7-6.3s7 2.7 7 6.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPrint = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 14h12v7H6z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDuplicate = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="9" y="9" width="12" height="12" rx="1.5" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCreditNote = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
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

// Maps the backend's real status values (DRAFT, SENT, PAID, OVERDUE,
// CANCELLED) onto the four display buckets above. There's no "UNPAID"
// backend status — a sent-but-not-yet-due invoice is what "Unpaid" means
// here. Returns null for CANCELLED, which stays hidden (same as before).
const getDisplayStatus = (inv) => {
  if (inv.status === "PAID") return "PAID";
  if (inv.status === "CANCELLED") return null;
  if (inv.status === "DRAFT") return "DRAFT";
  // SENT or OVERDUE from here on — reclassify by due date so a SENT
  // invoice whose due date has passed still lands under Overdue even
  // if nothing has explicitly flipped its status to OVERDUE yet.
  const due = inv.dueDate ? new Date(inv.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due && due < today) return "OVERDUE";
  return "UNPAID";
};

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

// Normalizes a raw invoice object from the backend (which uses
// status / totalAmount / taxAmount) into the shape this component
// works with (paid / sent booleans, total, vatAmount). Falls back to
// any field that's already in the expected shape so this is safe to
// run on data that's already been mapped once.
const mapInvoice = (inv) => ({
  ...inv,
  total: inv.total ?? inv.totalAmount ?? 0,
  vatAmount: inv.vatAmount ?? inv.taxAmount ?? 0,
  paid: inv.paid ?? inv.status === "PAID",
  sent: inv.sent ?? (inv.status !== "DRAFT" && inv.status !== "CANCELLED"),
});

export default function ManageInvoices({ onNavigate, invoices: invoicesProp, clientId }) {
  const [invoices, setInvoices] = useState((invoicesProp || []).map(mapInvoice));
  const [loading, setLoading] = useState(!invoicesProp);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [sendPanelInvoiceId, setSendPanelInvoiceId] = useState(null);
  const [duplicateConfirmInvoice, setDuplicateConfirmInvoice] = useState(null);

  // Load invoices from the backend unless the caller already passed a list in.
  useEffect(() => {
    if (invoicesProp) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    clientId ? InvoiceService.getInvoicesByClientId(clientId): InvoiceService.getAllInvoices()
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.content ?? [];
        setInvoices(list.map(mapInvoice));
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

  // Close the row-actions dropdown when clicking anywhere outside it.
  // Every trigger button + its dropdown panel live inside a ".row-menu"
  // wrapper, so closest(".row-menu") tells us whether the click was
  // inside the open menu or somewhere else on the page.
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".row-menu")) {
        setOpenMenuId(null);
      }
    };

    // mousedown (not click) so this runs before the row-menu button's
    // own onClick toggle, avoiding a race between the two handlers.
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

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
      const key = getDisplayStatus(inv);
      if (!key) return; // CANCELLED — stays hidden
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

  // Called by PaymentModal after a successful save (InvoicePaymentSummaryDTO):
  //   { invoiceId, invoiceTotal, totalPaid, remaining, status, paid, payments }
  const handlePaymentSaved = (summary) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === summary.invoiceId
          ? {
              ...inv,
              total: summary.invoiceTotal ?? inv.total,
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

  // Opens the full invoice detail view (FAKTURA layout, sidebar actions, history).
  const handleOpenInvoice = (inv) => {
    onNavigate && onNavigate("viewInvoice", inv.id);
  };

  const handleGoToClient = (inv) => {
    setOpenMenuId(null);
    onNavigate && onNavigate("clientDetail", inv.clientId);
  };

  const handleViewPdf = async (inv) => {
    setOpenMenuId(null);
    setActionError(null);
    try {
      const { data } = await InvoiceService.downloadInvoicePdf(inv.id);
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to open the PDF.");
    }
  };

  const handleDuplicateClick = (inv) => {
    setOpenMenuId(null);
    setDuplicateConfirmInvoice(inv);
  };

  const handleConfirmDuplicate = () => {
    const inv = duplicateConfirmInvoice;
    setDuplicateConfirmInvoice(null);
    onNavigate && onNavigate("duplicateInvoice", inv.id);
  };

  const handleCredit = (inv) => {
    setOpenMenuId(null);
    onNavigate && onNavigate("creditInvoice", inv.id);
  };

  // Toggles the inline SendInvoicePanel for a given row — same component
  // ViewInvoice uses, so the send flow is identical everywhere.
  const handleSendClick = (inv) => {
    setOpenMenuId(null);
    setSendPanelInvoiceId((cur) => (cur === inv.id ? null : inv.id));
  };

  const handleInvoiceSentInList = (invoiceId) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, sent: true, status: inv.status === "DRAFT" ? "SENT" : inv.status }
          : inv
      )
    );
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

      {actionError && <div className="error-state">{actionError}</div>}

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
                  <React.Fragment key={inv.id}>
                    <div className="status-table-row">
                      <div>{inv.invoiceNumber}</div>
                      <div>
                        <a
                          href="#invoice"
                          className="client-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenInvoice(inv);
                          }}
                        >
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
                            <button type="button" onClick={() => handleGoToClient(inv)}>
                              <IconClient /> Go to client
                            </button>
                            <button type="button" onClick={() => handleViewPdf(inv)}>
                              <IconPrint /> View as PDF (Print)
                            </button>
                            <button type="button" onClick={() => handleDuplicateClick(inv)}>
                              <IconDuplicate /> Duplicate
                            </button>
                            <button type="button" onClick={() => handleSendClick(inv)}>
                              <IconMail /> Send the invoice
                            </button>
                            <button type="button" onClick={() => handleCredit(inv)}>
                              <IconCreditNote /> Credit/Partial credit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onNavigate && onNavigate("editInvoice", inv.id);
                              }}
                            >
                              Edit
                            </button>
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

                    {sendPanelInvoiceId === inv.id && (
                      <div className="row-send-panel-wrap" style={{ gridColumn: "1 / -1" }}>
                        <SendInvoicePanel
                          invoice={inv}
                          onClose={() => setSendPanelInvoiceId(null)}
                          onSent={() => handleInvoiceSentInList(inv.id)}
                        />
                      </div>
                    )}
                  </React.Fragment>
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

      {duplicateConfirmInvoice && (
        <ConfirmDialog
          message="Do you want to start a new invoice with the content of this as a starting point?"
          onCancel={() => setDuplicateConfirmInvoice(null)}
          onConfirm={handleConfirmDuplicate}
        />
      )}
    </main>
  );
}