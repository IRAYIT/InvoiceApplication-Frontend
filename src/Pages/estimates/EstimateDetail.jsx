import React, { useEffect, useState } from "react";
import EstimateService from "../../services/EstimateService";
import ClientService from "../../services/ClientService";
import "./EstimateDetail.css";

/* Small inline icon set */
const IconPrinter = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconDuplicate = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconClock = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);

const formatKr = (n) =>
  `${Number(n || 0).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;

const formatHistoryDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// "Your reference"/"Our reference" were folded into the single `notes`
// field on save (see EstimateForm's buildPayload) — this pulls them
// back out for display here, since the backend has no dedicated
// fields for them.
const parseReferencesFromNotes = (notes) => {
  const result = { yourReference: "", ourReference: "" };
  if (!notes) return result;
  notes.split("\n").forEach((line) => {
    const yourMatch = line.match(/^Your reference:\s*(.*)$/i);
    const ourMatch = line.match(/^Our reference:\s*(.*)$/i);
    if (yourMatch) result.yourReference = yourMatch[1];
    if (ourMatch) result.ourReference = ourMatch[1];
  });
  return result;
};

const getClientAddressLines = (client) => {
  if (!client?.address) return [];
  const { careOf, streetAddress, zipCode, city, country } = client.address;
  return [careOf, streetAddress, [zipCode, city].filter(Boolean).join(" "), country].filter(Boolean);
};

/**
 * EstimateDetail
 *
 * Document-style preview of a single estimate with a right-hand action
 * panel and status history — opened by clicking an estimate number in
 * ManageEstimates.
 *
 * Props:
 * - estimateId  required
 * - onNavigate  (route, id) => void
 */
export default function EstimateDetail({ estimateId, onNavigate }) {
  const [estimate, setEstimate] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (!estimateId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    EstimateService.getEstimateById(estimateId)
      .then(({ data }) => {
        if (cancelled) return;
        setEstimate(data);
        // The estimate itself only carries clientId/clientName — the
        // address block on the right needs the full client record.
        if (data.clientId) {
          return ClientService.getClientById(data.clientId).then((c) => {
            if (!cancelled) setClient(c);
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load estimate.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [estimateId]);

  // No print/PDF endpoint on the backend — falls back to the browser's
  // print dialog, same approach used on the estimates list page.
  const handleViewAsPdf = () => window.print();

  // No "send" endpoint exists yet.
  const handleSendEstimate = () => {
    // eslint-disable-next-line no-alert
    alert(
      `"Send the estimate" isn't wired to the backend yet. Add a POST /api/v1/estimates/${estimateId}/send endpoint to enable this.`
    );
  };

  // Genuinely achievable with the existing API: re-POST the same items
  // under a new estimate, then go straight to the copy's detail page.
  const handleDuplicate = async () => {
    if (!estimate) return;
    setDuplicating(true);
    try {
      const payload = {
        clientId: estimate.clientId,
        issueDate: estimate.issueDate,
        validUntil: estimate.validUntil,
        notes: estimate.notes,
        items: (estimate.items || []).map((it) => ({
          productId: it.productId ?? null,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          taxPercent: it.taxPercent,
        })),
      };
      const { data: created } = await EstimateService.createEstimate(payload);
      onNavigate && onNavigate("estimateDetail", created.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to duplicate the estimate.");
    } finally {
      setDuplicating(false);
    }
  };

  // No dedicated "convert to invoice" endpoint — this is a practical
  // shortcut (opens a new invoice pre-filled with the same client)
  // rather than a true one-click conversion, since EstimateResponseDTO's
  // `convertedInvoiceId` field implies the concept exists but no route
  // to trigger it is exposed here.
  const handleCreateInvoice = () => {
    if (!estimate) return;
    onNavigate &&
      onNavigate("newInvoice", null, {
        client: { id: estimate.clientId, name: estimate.clientName },
      });
  };

  if (loading) {
    return (
      <main className="ed-content">
        <div className="ed-loading-state">Loading estimate…</div>
      </main>
    );
  }

  if (error || !estimate) {
    return (
      <main className="ed-content">
        <div className="ed-error-state">{error || "Estimate not found."}</div>
        <button className="ed-back-btn" onClick={() => onNavigate && onNavigate("estimates")}>
          Back to estimates
        </button>
      </main>
    );
  }

  const { yourReference, ourReference } = parseReferencesFromNotes(estimate.notes);
  const addressLines = getClientAddressLines(client);
  const isSent = Boolean(estimate.sentAt);
  const isCompleted = estimate.status === "APPROVED" || estimate.status === "CONVERTED";

  const historyEntries = [
    estimate.approvedAt && { label: "Marked as approved", date: estimate.approvedAt },
    estimate.rejectedAt && { label: "Marked as rejected", date: estimate.rejectedAt },
    estimate.sentAt && { label: "Marked as sent", date: estimate.sentAt },
    estimate.createdAt && { label: "Created", date: estimate.createdAt },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <main className="ed-content">
      <div className="ed-layout">
        {/* Document preview */}
        <div className="ed-document">
          <div className="ed-document-heading">ESTIMATE</div>

          <div className="ed-info-grid">
            <div className="ed-info-col">
              <div className="ed-info-row">
                <span className="ed-info-label">Estimate no.</span>
                <span>{estimate.estimateNumber}</span>
              </div>
              <div className="ed-info-row">
                <span className="ed-info-label">Client no.</span>
                <span>{estimate.clientId}</span>
              </div>
              <div className="ed-info-row">
                <span className="ed-info-label">Estimate date</span>
                <span>{estimate.issueDate}</span>
              </div>
              <div className="ed-info-row">
                <span className="ed-info-label">Valid to</span>
                <span className="ed-info-strong">{estimate.validUntil}</span>
              </div>
            </div>

            <div className="ed-info-col">
              <div className="ed-info-row">
                <span className="ed-info-label">Your reference</span>
                <span>{yourReference || "—"}</span>
              </div>
              <div className="ed-info-row">
                <span className="ed-info-label">Our reference</span>
                <span>{ourReference || "—"}</span>
              </div>
            </div>

            <div className="ed-address-card">
              <div className="ed-address-header">Estimate address</div>
              <div className="ed-address-body">
                <div className="ed-address-name">{estimate.clientName}</div>
                {addressLines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          <table className="ed-items-table">
            <thead>
              <tr>
                <th>Product / service</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th className="ed-col-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(estimate.items || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </td>
                  <td>{formatKr(item.unitPrice)}</td>
                  <td className="ed-col-right">{formatKr(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ed-totals">
            <div>
              <span>Net</span>
              <strong>{formatKr(estimate.subtotal)}</strong>
            </div>
            <div>
              <span>VAT</span>
              <strong>{formatKr(estimate.vatAmount)}</strong>
            </div>
            <div className="ed-total-final">
              <span>Total to pay</span>
              <strong>{formatKr(estimate.total)}</strong>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="ed-actions-panel">
          <button type="button" className="ed-send-link" onClick={handleSendEstimate}>
            Send the estimate
          </button>

          <button type="button" className="ed-create-invoice-btn" onClick={handleCreateInvoice}>
            Create invoice
          </button>

          <button type="button" className="ed-create-order-btn" disabled title="Orders module not built yet">
            Create order
          </button>

          <div className="ed-action-links">
            <button type="button" className="ed-action-link" onClick={handleViewAsPdf}>
              <IconPrinter /> View as PDF (Print)
            </button>
            <button type="button" className="ed-action-link" onClick={handleDuplicate} disabled={duplicating}>
              <IconDuplicate /> {duplicating ? "Duplicating…" : "Duplicate"}
            </button>
            <button
              type="button"
              className="ed-action-link"
              onClick={() => onNavigate && onNavigate("clientDetail", estimate.clientId)}
            >
              <IconUser /> Go to client
            </button>
          </div>

          {/* Read-only — there's no backend endpoint yet to toggle these
              from here, so they reflect real data (sentAt / status) but
              can't be changed by clicking them. */}
          <div className="ed-flags-row">
            <label className="ed-flag" title="Read-only until a status-update endpoint exists">
              <input type="checkbox" checked={isSent} readOnly />
              Sent
            </label>
            <label className="ed-flag" title="Read-only until a status-update endpoint exists">
              <input type="checkbox" checked={isCompleted} readOnly />
              Completed
            </label>
          </div>

          <div className="ed-history">
            <div className="ed-history-heading">
              <IconClock /> History
            </div>
            {historyEntries.map((entry, i) => (
              <div className="ed-history-entry" key={i}>
                <div className="ed-history-label">{entry.label}</div>
                <div className="ed-history-date">{formatHistoryDate(entry.date)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}