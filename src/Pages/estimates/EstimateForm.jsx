import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import EstimateService from "../../services/EstimateService";
import ClientQuickEditModal from "../clients/ClientQuickEditModal";
import "./EstimateForm.css";

/* Small inline icon set — no external icon package required */
const IconCircleX = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" strokeLinecap="round" />
  </svg>
);

const IconEdit = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" strokeLinejoin="round" />
  </svg>
);

const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.4-1.4 1-1.4 2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

const IconGlobe = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
  </svg>
);

const IconDollar = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.5v11M15 9.2c0-1.2-1.3-1.9-3-1.9s-3 .8-3 2 1.2 1.6 3 1.9c1.8.3 3 .8 3 2s-1.3 2-3 2-3-.7-3-1.9" strokeLinecap="round" />
  </svg>
);

const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <path d="M5 8.5l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDrag = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

/* Custom pill dropdown — same pattern used on InvoiceForm, avoids the
   unreliable native <select> options popup styling. NOTE: both
   Language and Currency here are LOCAL-ONLY UI — EstimateRequestDTO
   has no fields for either, so nothing about them is sent to the API.
   Remove this note once/if the backend adds support. */
function PillDropdown({ icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="ef-pill-select-wrap" ref={wrapRef}>
      <button type="button" className="ef-pill-select" onClick={() => setOpen((prev) => !prev)}>
        {icon}
        <span>{label}:</span>
        <strong className="ef-pill-value">{value}</strong>
        <IconChevronDown className={`ef-pill-chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="ef-pill-dropdown">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`ef-pill-dropdown-item${opt === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
              {opt === value && <span className="ef-pill-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CURRENCIES = ["SEK", "INR"]; // local-only, see PillDropdown note above
const LANGUAGES = ["Swedish", "English", "Norwegian", "Danish", "Finnish"]; // local-only
const PAYMENT_TERMS_OPTIONS = ["Due on receipt", "Net 15", "Net 30", "Net 45", "Net 60"]; // local-only, used only to compute validUntil

let localRowId = 0;
const nextRowId = () => `row-${Date.now()}-${localRowId++}`;

// Matches EstimateItemRequestDTO exactly: productId, description,
// quantity, unit, unitPrice, taxPercent. No discount / text / rowType —
// the backend item schema doesn't have them.
const emptyRow = () => ({
  rowKey: nextRowId(), // local-only React key, never sent to the API
  id: null,
  productId: null,
  description: "",
  quantity: 1,
  unit: "",
  unitPrice: 0,
  taxPercent: 25,
});

const termsToDays = (paymentTerms) => {
  if (!paymentTerms) return 0;
  const match = String(paymentTerms).match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const getClientDisplayName = (c) =>
  c?.name ||
  c?.clientName ||
  c?.companyName ||
  c?.businessName ||
  c?.fullName ||
  c?.company ||
  c?.contactName ||
  c?.email ||
  (c?.id != null ? `Client #${c.id}` : "Unnamed client");

const lineSubtotalOf = (row) => toNumber(row.quantity) * toNumber(row.unitPrice);
const lineTotalOf = (row) => lineSubtotalOf(row);
const taxAmountOf = (row) => lineSubtotalOf(row) * (toNumber(row.taxPercent) / 100);

/**
 * EstimateForm
 *
 * Props:
 * - estimateId      optional — if provided, loads/edits that estimate
 *                   (GET/PUT /api/v1/estimates/{id}). Takes priority over
 *                   duplicateFromId if both are somehow passed.
 * - duplicateFromId optional — if provided (and estimateId is not), the
 *                   form pre-fills client/dates/references/items from
 *                   that estimate, but still CREATES a new one on save
 *                   (fresh estimate number, today's estimate date, valid
 *                   to recomputed from today + payment terms). Used by
 *                   EstimateDetail's "Duplicate" confirmation flow.
 * - client          { id, name } — required when creating a new estimate
 *                   from scratch (ignored if estimateId or
 *                   duplicateFromId is set, since those load their own
 *                   client).
 * - currentUser     string — default value for "Our reference" (local-only).
 * - onSaved         (savedEstimateDTO) => void
 * - onNavigate      (route) => void
 * - onEditClient    () => void — pencil icon next to Client
 */
export default function EstimateForm({
  estimateId,
  duplicateFromId,
  client,
  currentUser = "",
  onSaved,
  onNavigate,
  onEditClient,
}) {
  const isEditMode = Boolean(estimateId);
  const isDuplicateMode = !isEditMode && Boolean(duplicateFromId);

  const [loading, setLoading] = useState(isEditMode || isDuplicateMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClient, setSelectedClient] = useState(client || null);
  const [estimateNumber, setEstimateNumber] = useState(null); // assigned by backend
  const [issueDate, setIssueDate] = useState(todayIso());

  // Payment terms is LOCAL-ONLY — EstimateRequestDTO has no such field.
  // It exists purely to auto-compute validUntil, same as InvoiceForm's
  // paymentTerms -> dueDate behavior.
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [validUntil, setValidUntil] = useState(addDays(todayIso(), 30));
  const [validUntilTouched, setValidUntilTouched] = useState(false);

  // "Your reference" / "Our reference" are LOCAL-ONLY — the backend only
  // has a single free-text `notes` field, so both are folded into it on
  // save (see buildPayload) rather than dropped entirely.
  const [yourReference, setYourReference] = useState("");
  const [ourReference, setOurReference] = useState(currentUser);

  const [currency, setCurrency] = useState(CURRENCIES[0]); // local-only
  const [language, setLanguage] = useState(LANGUAGES[0]); // local-only
  const [items, setItems] = useState([emptyRow()]);

  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientFetchError, setClientFetchError] = useState(null);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);

  useEffect(() => {
    if (!validUntilTouched) {
      setValidUntil(addDays(issueDate, termsToDays(paymentTerms)));
    }
  }, [issueDate, paymentTerms, validUntilTouched]);

  // Load existing estimate when editing
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    EstimateService.getEstimateById(estimateId)
      .then(({ data }) => {
        if (cancelled) return;
        setSelectedClient({ id: data.clientId, name: data.clientName });
        setEstimateNumber(data.estimateNumber ?? null);
        setIssueDate(data.issueDate ?? todayIso());
        setValidUntil(data.validUntil ?? addDays(data.issueDate ?? todayIso(), 30));
        setValidUntilTouched(true); // trust the loaded date, don't auto-recompute it
        setYourReference(""); // notes isn't split back into these two on load
        setOurReference(currentUser);
        setItems(
          Array.isArray(data.items) && data.items.length
            ? data.items.map((it) => ({
                rowKey: nextRowId(),
                id: it.id ?? null,
                productId: it.productId ?? null,
                description: it.description ?? "",
                quantity: it.quantity ?? 1,
                unit: it.unit ?? "",
                unitPrice: it.unitPrice ?? 0,
                taxPercent: it.taxPercent ?? 0,
              }))
            : [emptyRow()]
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateId, isEditMode]);

  // Pre-fill from an existing estimate when duplicating — this still
  // CREATES a new estimate on save (isEditMode stays false): no
  // estimateNumber carried over, no id on any item, fresh estimate date
  // (today) and a validUntil recomputed from today + payment terms.
  // Client/references/items carry over. Mirrors InvoiceForm's
  // duplicateFromId behavior.
  useEffect(() => {
    if (!isDuplicateMode) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    EstimateService.getEstimateById(duplicateFromId)
      .then(({ data }) => {
        if (cancelled) return;
        setSelectedClient({ id: data.clientId, name: data.clientName });
        setIssueDate(todayIso());
        setValidUntilTouched(false); // let the effect above recompute it from today
        setYourReference("");
        setOurReference(currentUser);
        setItems(
          Array.isArray(data.items) && data.items.length
            ? data.items.map((it) => ({
                rowKey: nextRowId(),
                id: null, // duplicated rows are new rows, not edits of existing ones
                productId: it.productId ?? null,
                description: it.description ?? "",
                quantity: it.quantity ?? 1,
                unit: it.unit ?? "",
                unitPrice: it.unitPrice ?? 0,
                taxPercent: it.taxPercent ?? 0,
              }))
            : [emptyRow()]
        );
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || "Failed to load the estimate to duplicate.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateFromId, isDuplicateMode]);

  const updateRow = useCallback((rowKey, patch) => {
    setItems((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)));
  }, []);

  const removeRow = useCallback((rowKey) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((row) => row.rowKey !== rowKey) : prev));
  }, []);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    setClientFetchError(null);
    try {
      const res = await fetch("https://invoice-app-iray.azurewebsites.net/api/v1/clients");
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setClientList(list);
    } catch (err) {
      setClientFetchError(err?.message || "Failed to load clients.");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const handleClientFieldClick = () => {
    setShowClientDropdown((prev) => !prev);
    if (!showClientDropdown && clientList.length === 0) {
      fetchClients();
    }
  };

  const handleSelectClient = (c) => {
    setSelectedClient({ id: c.id, name: getClientDisplayName(c) });
    setShowClientDropdown(false);
  };

  const handleClientNameClick = (e) => {
    e.stopPropagation();
    if (selectedClient?.id) {
      setShowClientDetailsModal(true);
    } else {
      handleClientFieldClick();
    }
  };

  const handleClientUpdated = (updatedClient) => {
    setSelectedClient((prev) => ({
      id: prev?.id,
      name: getClientDisplayName(updatedClient) || prev?.name,
    }));
  };

  const addProductRow = () => setItems((prev) => [...prev, emptyRow()]);

  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    let subtotalSum = 0;
    let taxSum = 0;
    items.forEach((row) => {
      subtotalSum += lineTotalOf(row);
      taxSum += taxAmountOf(row);
    });
    return { subtotal: subtotalSum, taxAmount: taxSum, totalAmount: subtotalSum + taxSum };
  }, [items]);

  // Matches EstimateRequestDTO field-for-field: clientId, issueDate,
  // validUntil, notes, items[]. "Your reference"/"Our reference" get
  // folded into notes since the backend has no dedicated fields for them.
  const buildPayload = () => {
    const referenceLines = [
      yourReference ? `Your reference: ${yourReference}` : null,
      ourReference ? `Our reference: ${ourReference}` : null,
    ].filter(Boolean);

    return {
      clientId: selectedClient?.id ?? null,
      issueDate,
      validUntil,
      notes: referenceLines.join("\n"),
      items: items.map((row) => ({
        productId: row.productId ?? null,
        description: row.description,
        quantity: toNumber(row.quantity),
        unit: row.unit,
        unitPrice: toNumber(row.unitPrice),
        taxPercent: toNumber(row.taxPercent),
      })),
    };
  };

  const handleCreateOrUpdate = async () => {
    if (!selectedClient?.id) {
      setError("Please choose a client before creating the estimate.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload();
      const response = isEditMode
        ? await EstimateService.updateEstimate(estimateId, payload)
        : await EstimateService.createEstimate(payload);

      onSaved && onSaved(response.data);
      onNavigate && onNavigate("estimates");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save the estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onNavigate && onNavigate("estimates");

  if (loading) {
    return (
      <main className="ef-content">
        <div className="ef-loading-state">Loading estimate…</div>
      </main>
    );
  }

  return (
    <main className="ef-content">
      <div className="ef-page-header">
        <div className="ef-page-title">
          {isEditMode ? "Edit" : "New"} estimate
          {estimateNumber ? ` (#${estimateNumber})` : ""}
          {selectedClient?.name ? ` to ${selectedClient.name}` : ""}
        </div>
      </div>

      {error && <div className="ef-error-banner">{error}</div>}

      {/* Form Card */}
      <div className="ef-card">
        <div className="ef-grid-row">
          <div className="ef-field ef-field-large">
            <label>Client</label>
            <div className="ef-client-field-wrap">
              <div className="ef-client-input" onClick={handleClientFieldClick}>
                <IconCircleX className="ef-client-icon" />
                {selectedClient?.name ? (
                  <button
                    type="button"
                    className="ef-client-name ef-client-name-link"
                    onClick={handleClientNameClick}
                    title="View / edit client details"
                  >
                    {selectedClient.name}
                  </button>
                ) : (
                  <span className="ef-client-name">No client selected</span>
                )}
                <button
                  type="button"
                  className="ef-client-edit"
                  aria-label="Edit client"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClient && onEditClient();
                  }}
                >
                  <IconEdit />
                </button>
              </div>

              {showClientDropdown && (
                <div className="ef-client-dropdown">
                  {loadingClients && <div className="ef-client-dropdown-msg">Loading clients…</div>}
                  {clientFetchError && (
                    <div className="ef-client-dropdown-msg ef-client-dropdown-error">
                      {clientFetchError}
                    </div>
                  )}
                  {!loadingClients && !clientFetchError && clientList.length === 0 && (
                    <div className="ef-client-dropdown-msg">No clients found.</div>
                  )}
                  {!loadingClients &&
                    clientList.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="ef-client-dropdown-item"
                        onClick={() => handleSelectClient(c)}
                      >
                        {getClientDisplayName(c)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="ef-field">
            <label>
              Estimate no.
              <IconHelp className="ef-label-help" />
            </label>
            <input value={estimateNumber ?? "Assigned on save"} readOnly />
          </div>
        </div>

        <div className="ef-grid-row ef-five-cols">
          <div className="ef-field">
            <label>Estimate date</label>
            <div className="ef-icon-input">
              <IconCalendar className="ef-input-icon" />
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
          </div>

          <div className="ef-field">
            <label>Payment terms</label>
            <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
              {PAYMENT_TERMS_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="ef-field">
            <label>Valid to</label>
            <div className="ef-icon-input">
              <IconCalendar className="ef-input-icon" />
              <input
                type="date"
                value={validUntil}
                onChange={(e) => {
                  setValidUntilTouched(true);
                  setValidUntil(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="ef-field">
            <label>Your reference</label>
            <input value={yourReference} onChange={(e) => setYourReference(e.target.value)} />
          </div>

          <div className="ef-field">
            <label>Our reference</label>
            <input value={ourReference} onChange={(e) => setOurReference(e.target.value)} />
          </div>
        </div>

        <div className="ef-options-row">
          <PillDropdown
            icon={<IconGlobe className="ef-pill-icon" />}
            label="Language"
            value={language}
            options={LANGUAGES}
            onChange={setLanguage}
          />
          <PillDropdown
            icon={<IconDollar className="ef-pill-icon" />}
            label="Currency"
            value={currency}
            options={CURRENCIES}
            onChange={setCurrency}
          />
        </div>
      </div>

      {/* Product Table — columns match EstimateItemRequestDTO exactly:
          description, quantity, unit, unitPrice, taxPercent, +computed
          line total. No text/discount columns — the backend item schema
          doesn't support them. */}
      <div className="ef-table-card">
        <div className="ef-table-header">
          <div className="ef-col-drag" />
          <div>PRODUCT / SERVICE</div>
          <div>QUANTITY</div>
          <div>UNIT</div>
          <div>
            PRICE <span className="ef-header-accent">EXCL.</span>
          </div>
          <div>VAT%</div>
          <div>
            TOTAL <span className="ef-header-accent">EXCL.</span>
          </div>
          <div className="ef-col-delete" />
        </div>

        {items.map((row) => (
          <div className="ef-table-row" key={row.rowKey}>
            <div className="ef-drag-handle">
              <IconDrag />
            </div>
            <input
              placeholder="Choose a product"
              value={row.description}
              onChange={(e) => updateRow(row.rowKey, { description: e.target.value })}
            />
            <input
              type="number"
              min="0"
              value={row.quantity}
              onChange={(e) => updateRow(row.rowKey, { quantity: e.target.value })}
            />
            <input value={row.unit} onChange={(e) => updateRow(row.rowKey, { unit: e.target.value })} />
            <input
              type="number"
              min="0"
              step="0.01"
              value={row.unitPrice}
              onChange={(e) => updateRow(row.rowKey, { unitPrice: e.target.value })}
            />
            <input
              type="number"
              min="0"
              value={row.taxPercent}
              onChange={(e) => updateRow(row.rowKey, { taxPercent: e.target.value })}
            />
            <div className="ef-total-value">{lineTotalOf(row).toFixed(2)}</div>
            <button
              type="button"
              className="ef-row-delete"
              aria-label="Remove row"
              onClick={() => removeRow(row.rowKey)}
            >
              <IconCircleX />
            </button>
          </div>
        ))}

        <div className="ef-bottom-section">
          <div className="ef-actions">
            <button type="button" className="ef-outline-btn" onClick={addProductRow}>
              <IconPlus /> New product row
            </button>
          </div>

          <div className="ef-summary">
            <div>
              <span>Net</span>
              <strong>{subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>VAT</span>
              <strong>{taxAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="ef-footer-actions">
        <button
          type="button"
          className="ef-create-btn"
          onClick={handleCreateOrUpdate}
          disabled={saving}
        >
          {saving ? "Saving…" : isEditMode ? "Save estimate" : "Create estimate"}
        </button>

        <button type="button" className="ef-cancel-btn" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      {/* Footer */}
      <footer className="ef-footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button type="button" className="ef-help-btn">
        ❓ Help
      </button>

      {showClientDetailsModal && selectedClient?.id && (
        <ClientQuickEditModal
          clientId={selectedClient.id}
          onClose={() => setShowClientDetailsModal(false)}
          onUpdated={handleClientUpdated}
        />
      )}
    </main>
  );
}