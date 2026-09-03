import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import InvoiceService from "../../services/InvoicesService";
import "./EditInvoice.css";

/* ── Small inline icons ─────────────────────────────────────────── */
const IconCircleX = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" strokeLinecap="round" />
  </svg>
);

const IconEdit = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" strokeLinejoin="round" />
  </svg>
);

const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.4-1.4 1-1.4 2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

const IconGlobe = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
  </svg>
);

const IconDollar = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.5v11M15 9.2c0-1.2-1.3-1.9-3-1.9s-3 .8-3 2 1.2 1.6 3 1.9c1.8.3 3 .8 3 2s-1.3 2-3 2-3-.7-3-1.9" strokeLinecap="round" />
  </svg>
);

const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <path d="M5 8.5l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDrag = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Pill dropdown for Language / Currency selectors */
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
    <div className="ei-pill-wrap" ref={wrapRef}>
      <button type="button" className="ei-pill" onClick={() => setOpen((p) => !p)}>
        {icon}
        <span>{label}:</span>
        <strong className="ei-pill-value">{value}</strong>
        <IconChevronDown className={`ei-pill-chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="ei-pill-dropdown">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`ei-pill-dropdown-item${opt === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
              {opt === value && <span className="ei-pill-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Confirmation modal shown when the user clicks "Cancel" on the edit
   form — gives them a chance to back out instead of losing changes. */
function ConfirmExitModal({ onCancel, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="ei-modal-overlay" onMouseDown={onCancel}>
      <div
        className="ei-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Exit without saving changes?"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="ei-modal-message">Exit without saving changes?</p>
        <div className="ei-modal-actions">
          <button type="button" className="ei-modal-btn ei-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ei-modal-btn ei-modal-btn-confirm" onClick={onConfirm}>
            Yes, continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── "More options (ROT/RUT etc)" — ported from InvoiceForm.jsx, which
   previously had this feature and EditInvoice did not. Same option set,
   same key names, so data round-trips identically between the create
   and edit forms. ─────────────────────────────────────────────────── */
const MORE_OPTIONS = [
  {
    key: "extraFieldsLong",
    label: "Add extra fields (long) from the customer",
    defaultText: "",
    placeholder: "Extra information from the customer",
  },
  {
    key: "buyerPersonalId",
    label: "Add the buyer personal id no.",
    defaultText: "Buyer's org. no.: ",
  },
  {
    key: "buyerVat",
    label: "Add the buyers VAT number",
    defaultText: "Buyer's VAT registration no.: ",
  },
  {
    key: "reverseCharge",
    label: "Add reverse charge",
    defaultText: "Buyer's VAT registration no.: \nReverse charge",
  },
  {
    key: "threePartyTrade",
    label: "Add three-party trade",
    defaultText:
      "Three-party trade within the EU.\nSeller's VAT registration no.: .\nBuyer's VAT registration no.: .\nReverse charge liability / Reverse charge.",
  },
  {
    key: "rotExtraFields",
    label: "Add the customer's extra field for ROT deduction",
    isGroup: true,
    fields: [
      { key: "brfOrgNo", defaultText: "Housing association org. no.: " },
      { key: "apartmentDesignation", defaultText: "Apartment designation: " },
      { key: "propertyDesignation", defaultText: "Property designation: " },
    ],
  },
  {
    key: "taxDeduction",
    label: "Add tax deduction for ROT / RUT / Green tech",
    isTaxDeductionPanel: true,
  },
];

const ROT_GROUP_FIELD_KEYS = ["brfOrgNo", "apartmentDesignation", "propertyDesignation"];
const TAX_DEDUCTION_PERCENTS = [30, 50, 75];
const MAX_FIELD_LENGTH = 255;

function ExtraFieldBox({ value, onChange, onRemove, placeholder, tall }) {
  return (
    <div className="ei-extra-field-box">
      <button
        type="button"
        className="ei-extra-field-remove"
        aria-label="Remove this field"
        onClick={onRemove}
      >
        ×
      </button>
      <textarea
        className={`ei-extra-field-textarea${tall ? " ei-extra-field-tall" : ""}`}
        value={value}
        placeholder={placeholder}
        maxLength={MAX_FIELD_LENGTH}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="ei-extra-field-counter">
        {value.length}/{MAX_FIELD_LENGTH}
      </span>
    </div>
  );
}

/* ── Constants ──────────────────────────────────────────────────── */
const CURRENCIES = ["SEK", "USD", "EUR", "INR"];
const LANGUAGES = ["English", "Swedish", "Norwegian", "Danish", "Finnish"];
// Matches InvoiceForm's STATUS_OPTIONS / the backend's `status` enum —
// invoice.status is NOT NULL in the DB, so this always needs a value.
const STATUS_OPTIONS = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
const PAYMENT_TERMS_OPTIONS = [
  { label: "Due on receipt", days: 0 },
  { label: "15", days: 15 },
  { label: "30", days: 30 },
  { label: "45", days: 45 },
  { label: "60", days: 60 },
];

let localRowId = 0;
const nextRowId = () => `row-${Date.now()}-${localRowId++}`;

const emptyRow = (rowType = "product") => ({
  rowKey: nextRowId(),
  id: null,
  rowType, // "product" | "text" — matches InvoiceForm's rowType handling
  productId: null,
  description: "",
  text: "", // extra information / notes shown alongside the product line — maps to InvoiceItemDTO.extraInfo on the wire
  quantity: 1,
  unit: "",
  unitPrice: 0,
  taxPercent: 25,
  discountPercent: 0,
});

const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
};

// Text rows carry no pricing — only product rows contribute to totals.
const lineSubtotalOf = (row) => {
  if (row.rowType === "text") return 0;
  const gross = toNumber(row.quantity) * toNumber(row.unitPrice);
  const discount = gross * (toNumber(row.discountPercent) / 100);
  return gross - discount;
};

const taxAmountOf = (row) => lineSubtotalOf(row) * (toNumber(row.taxPercent) / 100);

/**
 * EditInvoice
 *
 * Props:
 * - invoiceId  required — the invoice being edited (GET/PUT /api/invoices/{id})
 * - onNavigate (route, id?) => void — used for Cancel / after-save navigation
 * - onEditClient () => void — called when the pencil icon next to Client is clicked
 */
export default function EditInvoice({ invoiceId, onNavigate, onEditClient }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [client, setClient] = useState(null); // { id, name }
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [dueDate, setDueDate] = useState("");
  const [yourReference, setYourReference] = useState("");
  const [ourReference, setOurReference] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]); // local-only until backend supports it
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  // `status` is NOT NULL on the `invoice` table — this previously wasn't
  // tracked here at all, so saving an edit sent no status and Postgres
  // rejected the update. Defaults to "DRAFT" and is overwritten by
  // whatever the server returns once the invoice loads.
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState([emptyRow()]);

  // "More options (ROT/RUT etc)" — same state shape as InvoiceForm.jsx.
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    extraFieldsLong: false,
    buyerPersonalId: false,
    buyerVat: false,
    reverseCharge: false,
    threePartyTrade: false,
    rotExtraFields: false,
  });
  const [optionTexts, setOptionTexts] = useState({
    extraFieldsLong: "",
    buyerPersonalId: "Buyer's org. no.: ",
    buyerVat: "Buyer's VAT registration no.: ",
    reverseCharge: "Buyer's VAT registration no.: \nReverse charge",
    threePartyTrade:
      "Three-party trade within the EU.\nSeller's VAT registration no.: .\nBuyer's VAT registration no.: .\nReverse charge liability / Reverse charge.",
    brfOrgNo: "Housing association org. no.: ",
    apartmentDesignation: "Apartment designation: ",
    propertyDesignation: "Property designation: ",
  });
  const [showTaxDeductionPanel, setShowTaxDeductionPanel] = useState(false);
  const [taxDeductionApplied, setTaxDeductionApplied] = useState(false);
  const [taxDeductionPercent, setTaxDeductionPercent] = useState(30);

  // Controls the "Exit without saving changes?" confirmation modal that
  // appears when the user clicks the footer's Cancel button.
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Reconstructs selectedOptions/optionTexts from the flat
  // InvoiceExtraFieldDTO list returned by the backend, so an invoice
  // that had "More options" fields selected shows them here instead of
  // a blank form (this whole feature was previously absent from
  // EditInvoice — nothing loaded it, nothing rendered it, nothing saved it).
  const applyExtraFieldsFromServer = useCallback((extraFieldsList) => {
    if (!Array.isArray(extraFieldsList) || extraFieldsList.length === 0) return;

    setSelectedOptions((prev) => {
      const next = { ...prev };
      extraFieldsList.forEach(({ key }) => {
        if (ROT_GROUP_FIELD_KEYS.includes(key)) {
          next.rotExtraFields = true;
        } else if (Object.prototype.hasOwnProperty.call(next, key)) {
          next[key] = true;
        }
      });
      return next;
    });

    setOptionTexts((prev) => {
      const next = { ...prev };
      extraFieldsList.forEach(({ key, text }) => {
        if (text != null) next[key] = text;
      });
      return next;
    });
  }, []);

  const [dueDateTouched, setDueDateTouched] = useState(false);

  useEffect(() => {
    if (!dueDateTouched && invoiceDate) {
      const term = PAYMENT_TERMS_OPTIONS.find((t) => t.label === paymentTerms);
      setDueDate(addDays(invoiceDate, term ? term.days : 0));
    }
  }, [invoiceDate, paymentTerms, dueDateTouched]);

  useEffect(() => {
    if (!invoiceId) {
      setError("No invoice was specified.");
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setError(null);

    InvoiceService.getInvoiceById(invoiceId)
      .then(({ data }) => {
        if (cancelled) return;
        setClient({ id: data.clientId, name: data.clientName });
        setInvoiceNumber(data.invoiceNumber ?? null);
        setInvoiceDate(data.invoiceDate ?? "");
        setPaymentTerms(data.paymentTerms ?? "30");
        setDueDate(data.dueDate ?? "");
        setDueDateTouched(true); // trust the loaded due date
        setYourReference(data.yourReference ?? "");
        setOurReference(data.ourReference ?? "");
        setCurrency(data.currency ?? CURRENCIES[0]);
        // Fall back to "DRAFT" only if the server genuinely sent nothing —
        // never leave this unset, since the column can't be null.
        setStatus(data.status ?? "DRAFT");
        setItems(
          Array.isArray(data.items) && data.items.length
            ? data.items.map((it) => ({
                rowKey: nextRowId(),
                id: it.id ?? null,
                rowType: it.rowType ?? "product",
                productId: it.productId ?? null,
                description: it.description ?? "",
                text: it.extraInfo ?? "", // InvoiceItemDTO.extraInfo -> local "text" field
                quantity: it.quantity ?? 1,
                unit: it.unit ?? "",
                unitPrice: it.unitPrice ?? 0,
                taxPercent: it.taxPercent ?? 25,
                discountPercent: it.discountPercent ?? 0,
              }))
            : [emptyRow()]
        );
        // "More options" extra fields + tax deduction.
        applyExtraFieldsFromServer(data.extraFields);
        setTaxDeductionApplied(Boolean(data.taxDeductionApplied));
        setTaxDeductionPercent(data.taxDeductionPercent ?? 30);
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
  }, [invoiceId]);

  const updateRow = useCallback((rowKey, patch) => {
    setItems((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)));
  }, []);

  const removeRow = useCallback((rowKey) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((row) => row.rowKey !== rowKey) : prev));
  }, []);

  const addProductRow = () => setItems((prev) => [...prev, emptyRow("product")]);
  // Previously this button called addProductRow too (a plain copy-paste
  // bug), so "New text row" silently added another product row instead
  // of a description-only line.
  const addTextRow = () => setItems((prev) => [...prev, emptyRow("text")]);

  const toggleMoreOption = (optionKey) => {
    setSelectedOptions((prev) => ({ ...prev, [optionKey]: !prev[optionKey] }));
  };

  const updateOptionText = (fieldKey, value) => {
    setOptionTexts((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleConfirmTaxDeduction = () => {
    setTaxDeductionApplied(true);
    setShowTaxDeductionPanel(false);
  };

  const handleCancelTaxDeduction = () => {
    setShowTaxDeductionPanel(false);
  };

  const handleRemoveTaxDeduction = () => {
    setTaxDeductionApplied(false);
  };

  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    let subtotalSum = 0;
    let taxSum = 0;
    items.forEach((row) => {
      subtotalSum += lineSubtotalOf(row);
      taxSum += taxAmountOf(row);
    });
    return { subtotal: subtotalSum, taxAmount: taxSum, totalAmount: subtotalSum + taxSum };
  }, [items]);

  const buildPayload = () => ({
    clientId: client?.id ?? null,
    invoiceDate,
    paymentTerms,
    dueDate,
    yourReference,
    ourReference,
    currency,
    status,
    subtotal,
    taxAmount,
    totalAmount,
    // Shape matches InvoiceExtraFieldDTO: { key, text }.
    extraFields: Object.entries(selectedOptions)
      .filter(([, isOn]) => isOn)
      .flatMap(([key]) => {
        const option = MORE_OPTIONS.find((o) => o.key === key);
        if (!option) return [];
        if (option.isGroup) {
          return option.fields.map((f) => ({ key: f.key, text: optionTexts[f.key] }));
        }
        return [{ key, text: optionTexts[key] }];
      }),
    taxDeductionApplied,
    taxDeductionPercent: taxDeductionApplied ? taxDeductionPercent : null,
    items: items.map((row) => ({
      id: row.id ?? undefined,
      rowType: row.rowType,
      productId: row.productId ?? null,
      description: row.description,
      extraInfo: row.text, // local "text" field -> InvoiceItemDTO.extraInfo on the wire
      quantity: toNumber(row.quantity),
      unit: row.unit,
      unitPrice: toNumber(row.unitPrice),
      taxPercent: toNumber(row.taxPercent),
      discountPercent: toNumber(row.discountPercent),
      taxAmount: taxAmountOf(row),
      lineTotal: lineSubtotalOf(row),
    })),
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const response = await InvoiceService.updateInvoice(invoiceId, payload);
      onNavigate && onNavigate("viewInvoice", response?.data?.id ?? invoiceId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save the invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Clicking the footer's "Cancel" button no longer navigates straight
  // away — it opens the "Exit without saving changes?" confirmation
  // modal, and the modal's own buttons decide what happens next.
  const handleCancel = () => setShowExitConfirm(true);

  const handleExitCancel = () => setShowExitConfirm(false);

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    onNavigate && onNavigate("viewInvoice", invoiceId);
  };

  if (loading) {
    return (
      <main className="ei-content">
        <div className="ei-loading-state">Loading invoice…</div>
      </main>
    );
  }

  if (error && !client) {
    return (
      <main className="ei-content">
        <div className="ei-error-banner">{error}</div>
      </main>
    );
  }

  return (
    <main className="ei-content">
      <div className="ei-page-title">
        Edit invoice{invoiceNumber ? ` (#${invoiceNumber})` : ""}
        {client?.name ? ` to ${client.name}` : ""}
      </div>

      {error && <div className="ei-error-banner">{error}</div>}

      {/* Header card */}
      <div className="ei-card">
        <div className="ei-grid-row">
          <div className="ei-field ei-field-large">
            <label>Client</label>
            <div className="ei-client-input">
              <IconCircleX className="ei-client-icon" />
              <span className="ei-client-name">{client?.name || "No client selected"}</span>
              <button
                type="button"
                className="ei-client-edit"
                aria-label="Edit client"
                onClick={() => onEditClient && onEditClient()}
              >
                <IconEdit />
              </button>
            </div>
          </div>

          <div className="ei-field">
            <label>
              Invoice no. <IconHelp className="ei-label-help" />
            </label>
            <input value={invoiceNumber ?? ""} readOnly />
          </div>

          <div className="ei-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ei-grid-row ei-five-cols">
          <div className="ei-field">
            <label>Invoice date</label>
            <div className="ei-icon-input">
              <IconCalendar className="ei-input-icon" />
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
          </div>

          <div className="ei-field">
            <label>Payment terms</label>
            <input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>

          <div className="ei-field">
            <label>Due date</label>
            <div className="ei-icon-input">
              <IconCalendar className="ei-input-icon" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDateTouched(true);
                  setDueDate(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="ei-field">
            <label>Your reference</label>
            <input value={yourReference} onChange={(e) => setYourReference(e.target.value)} />
          </div>

          <div className="ei-field">
            <label>Our reference</label>
            <input value={ourReference} onChange={(e) => setOurReference(e.target.value)} />
          </div>
        </div>

        <div className="ei-options-row">
          <PillDropdown
            icon={<IconGlobe className="ei-pill-icon" />}
            label="Language"
            value={language}
            options={LANGUAGES}
            onChange={setLanguage}
          />
          <PillDropdown
            icon={<IconDollar className="ei-pill-icon" />}
            label="Currency"
            value={currency}
            options={CURRENCIES}
            onChange={setCurrency}
          />
        </div>
      </div>

      {/* Item table */}
      <div className="ei-table-card">
        <div className="ei-table-header">
          <div className="ei-col-drag" />
          <div>PRODUCT / SERVICE</div>
          <div>TEXT</div>
          <div>QUANTITY</div>
          <div>UNIT</div>
          <div>
            PRICE EXCL. <IconHelp className="ei-label-help" />
          </div>
          <div>VAT %</div>
          <div>DISCOUNT</div>
          <div>TOTAL EXCL.</div>
          <div className="ei-col-delete" />
        </div>

        {items.map((row) => {
          const isTextRow = row.rowType === "text";
          return (
            <div className={`ei-table-row${isTextRow ? " ei-text-row" : ""}`} key={row.rowKey}>
              <div className="ei-drag-handle">
                <IconDrag />
              </div>

              {isTextRow ? (
                <input
                  className="ei-text-row-input"
                  placeholder="Extra text for this invoice line"
                  value={row.description}
                  onChange={(e) => updateRow(row.rowKey, { description: e.target.value })}
                />
              ) : (
                <>
                  <input
                    placeholder="Choose a product"
                    value={row.description}
                    onChange={(e) => updateRow(row.rowKey, { description: e.target.value })}
                  />
                  <input
                    placeholder="Extra information"
                    value={row.text}
                    onChange={(e) => updateRow(row.rowKey, { text: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
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
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={row.discountPercent}
                    onChange={(e) => updateRow(row.rowKey, { discountPercent: e.target.value })}
                  />
                  <div className="ei-total-value">{lineSubtotalOf(row).toFixed(2)}</div>
                </>
              )}

              <button
                type="button"
                className="ei-row-delete"
                aria-label="Remove row"
                onClick={() => removeRow(row.rowKey)}
              >
                <IconCircleX />
              </button>
            </div>
          );
        })}

        {/* ── Extra fields revealed by "More options" — ported from
            InvoiceForm.jsx. Previously this whole block didn't exist
            here, so a saved extra field had nowhere to render. */}
        {(selectedOptions.extraFieldsLong ||
          selectedOptions.buyerPersonalId ||
          selectedOptions.buyerVat ||
          selectedOptions.reverseCharge ||
          selectedOptions.threePartyTrade ||
          selectedOptions.rotExtraFields ||
          taxDeductionApplied) && (
          <div className="ei-extra-fields">
            {selectedOptions.extraFieldsLong && (
              <ExtraFieldBox
                value={optionTexts.extraFieldsLong}
                placeholder="Extra information from the customer"
                onChange={(v) => updateOptionText("extraFieldsLong", v)}
                onRemove={() => toggleMoreOption("extraFieldsLong")}
              />
            )}
            {selectedOptions.buyerPersonalId && (
              <ExtraFieldBox
                value={optionTexts.buyerPersonalId}
                onChange={(v) => updateOptionText("buyerPersonalId", v)}
                onRemove={() => toggleMoreOption("buyerPersonalId")}
              />
            )}
            {selectedOptions.buyerVat && (
              <ExtraFieldBox
                value={optionTexts.buyerVat}
                onChange={(v) => updateOptionText("buyerVat", v)}
                onRemove={() => toggleMoreOption("buyerVat")}
              />
            )}
            {selectedOptions.reverseCharge && (
              <ExtraFieldBox
                value={optionTexts.reverseCharge}
                onChange={(v) => updateOptionText("reverseCharge", v)}
                onRemove={() => toggleMoreOption("reverseCharge")}
              />
            )}
            {selectedOptions.threePartyTrade && (
              <ExtraFieldBox
                value={optionTexts.threePartyTrade}
                onChange={(v) => updateOptionText("threePartyTrade", v)}
                onRemove={() => toggleMoreOption("threePartyTrade")}
                tall
              />
            )}
            {selectedOptions.rotExtraFields && (
              <>
                <ExtraFieldBox
                  value={optionTexts.brfOrgNo}
                  onChange={(v) => updateOptionText("brfOrgNo", v)}
                  onRemove={() => toggleMoreOption("rotExtraFields")}
                />
                <ExtraFieldBox
                  value={optionTexts.apartmentDesignation}
                  onChange={(v) => updateOptionText("apartmentDesignation", v)}
                  onRemove={() => toggleMoreOption("rotExtraFields")}
                />
                <ExtraFieldBox
                  value={optionTexts.propertyDesignation}
                  onChange={(v) => updateOptionText("propertyDesignation", v)}
                  onRemove={() => toggleMoreOption("rotExtraFields")}
                />
              </>
            )}

            {taxDeductionApplied && (
              <div className="ei-tax-deduction-panel ei-tax-deduction-applied">
                <div>
                  <span className="ei-tax-deduction-label">Preliminary tax deduction</span>
                  <span className="ei-tax-deduction-value">{taxDeductionPercent}%</span>
                </div>
                <button
                  type="button"
                  className="ei-outline-btn ei-tax-deduction-remove"
                  onClick={handleRemoveTaxDeduction}
                >
                  <IconTrash /> Remove
                </button>
              </div>
            )}
          </div>
        )}

        {showTaxDeductionPanel && (
          <div className="ei-tax-deduction-panel">
            <label className="ei-tax-deduction-label">Tax deduction</label>
            <div className="ei-tax-deduction-row">
              <select
                className="ei-tax-deduction-select"
                value={taxDeductionPercent}
                onChange={(e) => setTaxDeductionPercent(Number(e.target.value))}
              >
                {TAX_DEDUCTION_PERCENTS.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ei-outline-btn ei-tax-deduction-confirm"
                onClick={handleConfirmTaxDeduction}
              >
                Add preliminary tax deduction
              </button>
              <button type="button" className="ei-outline-btn" onClick={handleCancelTaxDeduction}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="ei-bottom-section">
          <div className="ei-actions">
            <button type="button" className="ei-outline-btn" onClick={addProductRow}>
              <IconPlus /> New product row
            </button>
            <button type="button" className="ei-outline-btn" onClick={addTextRow}>
              <IconPlus /> New text row
            </button>

            <div className="ei-more-options">
              <button
                type="button"
                className="ei-more-options-btn"
                onClick={() => setShowMoreOptions((prev) => !prev)}
              >
                More options (ROT/RUT etc) <IconChevronDown />
              </button>

              {showMoreOptions && (
                <div className="ei-more-options-menu">
                  {MORE_OPTIONS.map((option) => {
                    const isActive = option.isTaxDeductionPanel
                      ? showTaxDeductionPanel || taxDeductionApplied
                      : !!selectedOptions[option.key];

                    return (
                      <button
                        type="button"
                        key={option.key}
                        className={`ei-more-options-list-item${isActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (option.isTaxDeductionPanel) {
                            if (taxDeductionApplied) return;
                            setShowTaxDeductionPanel((prev) => !prev);
                          } else {
                            toggleMoreOption(option.key);
                          }
                          setShowMoreOptions(false);
                        }}
                      >
                        {option.label}
                        {isActive && <span className="ei-more-options-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <IconHelp className="ei-row-help-icon" />
          </div>

          <div className="ei-summary">
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

      <div className="ei-footer-actions">
        <button type="button" className="ei-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="ei-cancel-btn" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      <footer className="ei-footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Call us</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button type="button" className="ei-help-btn">
        ❓ Help
      </button>

      {showExitConfirm && (
        <ConfirmExitModal onCancel={handleExitCancel} onConfirm={handleExitConfirm} />
      )}
    </main>
  );
}