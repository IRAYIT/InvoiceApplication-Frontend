import React, { useEffect, useMemo, useState } from "react";
import EstimateService from "../../services/EstimateService";
import "./ManageEstimates.css";

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

const IconEstimateDoc = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPrinter = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Status presentation — order controls which sections render first.
   Matches EstimateResponseDTO.status: "DRAFT / SENT / APPROVED /
   REJECTED / CONVERTED". SENT is shown as "Unanswered" (group) /
   "Waiting answer" (row), matching the reference. ──────────────────── */
const STATUS_META = {
  SENT: { groupLabel: "Unanswered", rowLabel: "Waiting answer", className: "status-unanswered" },
  APPROVED: { groupLabel: "Approved", rowLabel: "Approved", className: "status-approved" },
  REJECTED: { groupLabel: "Rejected", rowLabel: "Rejected", className: "status-rejected" },
  CONVERTED: { groupLabel: "Converted", rowLabel: "Converted to invoice", className: "status-converted" },
  DRAFT: { groupLabel: "Draft", rowLabel: "Draft", className: "status-draft" },
};
const STATUS_ORDER = ["SENT", "APPROVED", "REJECTED", "CONVERTED", "DRAFT"];

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

export default function ManageEstimates({ onNavigate }) {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = () => {
    setLoading(true);
    setError(null);

    EstimateService.getAllEstimates()
      .then(({ data }) => {
        setEstimates(Array.isArray(data) ? data : data?.content ?? []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load estimates.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const rangeStart = `${year}-01-01`;
  const rangeEnd = `${year}-12-31`;

  const filteredEstimates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return estimates.filter((est) => {
      const estYear = Number(String(est.issueDate || est.validUntil).slice(0, 4));
      if (estYear !== year) return false;
      if (!term) return true;
      return (
        est.clientName?.toLowerCase().includes(term) ||
        String(est.estimateNumber).includes(term)
      );
    });
  }, [estimates, year, search]);

  const groups = useMemo(() => {
    const byStatus = {};
    filteredEstimates.forEach((est) => {
      const key = est.status || "DRAFT";
      if (!byStatus[key]) byStatus[key] = [];
      byStatus[key].push(est);
    });
    return STATUS_ORDER.filter((key) => byStatus[key]?.length).map((key) => {
      const list = byStatus[key];
      const total = list.reduce((sum, est) => sum + Number(est.total || 0), 0);
      const vat = list.reduce((sum, est) => sum + Number(est.vatAmount || 0), 0);
      return { key, meta: STATUS_META[key] || STATUS_META.DRAFT, list, total, vat };
    });
  }, [filteredEstimates]);

  const handleDeleteEstimate = async (id) => {
    setOpenMenuId(null);
    try {
      await EstimateService.deleteEstimate(id);
      setEstimates((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete the estimate.");
    }
  };

  // No print/PDF endpoint exists on the backend yet — this falls back to
  // the browser's own print dialog, which is a reasonable stand-in until
  // a real "generate PDF" endpoint is added.
  const handleViewAsPdf = () => {
    setOpenMenuId(null);
    window.print();
  };

  // EstimateController has no "send" endpoint — this is a placeholder
  // until one exists, so it doesn't silently pretend to work.
  const handleSendToClient = (estimateNumber) => {
    setOpenMenuId(null);
    // eslint-disable-next-line no-alert
    alert(
      `"Send to client" isn't wired to the backend yet — estimate #${estimateNumber} was not sent. Add a POST /api/v1/estimates/{id}/send endpoint to enable this.`
    );
  };

  if (loading) {
    return (
      <main className="es-content">
        <div className="es-page-header">
          <h1>Estimates</h1>
        </div>
        <div className="es-loading-state">Loading estimates…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="es-content">
        <div className="es-page-header">
          <h1>Estimates</h1>
        </div>
        <div className="es-error-state">{error}</div>
      </main>
    );
  }

  return (
    <main className="es-content">
      <div className="es-page-header">
        <h1>Estimates</h1>
      </div>

      <div className="es-toolbar">
        <div className="es-left-actions">
          <button
            className="es-btn es-btn-primary"
            onClick={() => onNavigate && onNavigate("newEstimate")}
          >
            <IconEstimateDoc />
            New estimate
          </button>
        </div>

        <div className="es-center-nav">
          <button onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            {"‹"}
          </button>
          <div className="es-year-box">{year}</div>
          <button onClick={() => setYear((y) => y + 1)} aria-label="Next year">
            {"›"}
          </button>
        </div>

        <div className="es-right-actions">
          <input type="text" value={rangeStart} readOnly className="es-date-input" />
          <span>-</span>
          <input type="text" value={rangeEnd} readOnly className="es-date-input" />
          <input
            type="text"
            placeholder="Search"
            className="es-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="es-estimate-area">
        {groups.length === 0 ? (
          <div className="es-empty-state">
            <p>No estimates to show</p>
          </div>
        ) : (
          groups.map((group) => (
            <section className={`es-status-group ${group.meta.className}`} key={group.key}>
              <div className="es-status-summary">
                <div className="es-status-label">{group.meta.groupLabel}</div>
                <div className="es-status-amount">{formatKr(group.total)}</div>
                <div className="es-status-vat">of which VAT {formatKr(group.vat)}</div>
              </div>

              <div className="es-status-table">
                <div className="es-status-table-header">
                  <div>ESTIMATE NO.</div>
                  <div>CLIENT</div>
                  <div>TOTAL</div>
                  <div>VALID TO</div>
                  <div>SENT</div>
                  <div>STATUS</div>
                  <div className="es-menu-col" />
                </div>

                {group.list.map((est) => (
                  <div className="es-status-table-row" key={est.id}>
                    <div>
                      <a
                        href="#estimate"
                        className="es-estimate-number-link"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate && onNavigate("estimateDetail", est.id);
                        }}
                      >
                        {est.estimateNumber}
                      </a>
                    </div>
                    <div>
                      <a
                        href="#client"
                        className="es-client-link"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate && onNavigate("clientDetail", est.clientId);
                        }}
                      >
                        {est.clientName}
                      </a>
                    </div>
                    <div>{formatKr(est.total)}</div>
                    <div>{est.validUntil}</div>
                    <div>
                      <input type="checkbox" checked={!!est.sentAt} readOnly />
                    </div>
                    <div className="es-status-badge-cell">
                      <span className={`es-status-badge ${group.meta.className}`}>
                        {group.meta.rowLabel}
                      </span>
                    </div>
                    <div className="es-row-menu">
                      <button
                        type="button"
                        className="es-row-menu-btn"
                        aria-label="Row actions"
                        onClick={() => setOpenMenuId((prev) => (prev === est.id ? null : est.id))}
                      >
                        <IconGear />
                        <IconChevronDown />
                      </button>

                      {openMenuId === est.id && (
                        <div className="es-row-menu-dropdown">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onNavigate && onNavigate("clientDetail", est.clientId);
                            }}
                          >
                            <IconUser /> Go to client
                          </button>
                          <button type="button" onClick={handleViewAsPdf}>
                            <IconPrinter /> View as PDF (Print)
                          </button>
                          <button type="button" onClick={() => handleSendToClient(est.estimateNumber)}>
                            <IconMail /> Send to client
                          </button>
                          <button
                            type="button"
                            className="es-row-menu-danger"
                            onClick={() => handleDeleteEstimate(est.id)}
                          >
                            <IconTrash /> Delete
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
      </div>

      <footer className="es-footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button className="es-help-btn">❓ Help</button>
    </main>
  );
}