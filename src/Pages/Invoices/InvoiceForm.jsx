import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import InvoiceService from "../../services/InvoicesService";
import ClientQuickEditModal from "../clients/ClientQuickEditModal";
import "./InvoiceForm.css";

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

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── "More options (ROT/RUT etc)" — matches the reference dropdown.
   Each entry (other than the tax-deduction one, handled separately)
   reveals its own pre-filled, editable text field when selected. ──── */
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

/* Custom pill dropdown — replaces a native <select> (whose options
   popup can't be reliably restyled cross-browser) with a fully custom
   button + list, matching the same design language as the "More
   options" dropdown elsewhere on this page. */
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
    <div className="if-pill-select-wrap" ref={wrapRef}>
      <button
        type="button"
        className="if-pill-select"
        onClick={() => setOpen((prev) => !prev)}
      >
        {icon}
        <span>{label}:</span>
        <strong className="if-pill-value">{value}</strong>
        <IconChevronDown className={`if-pill-chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="if-pill-dropdown">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`if-pill-dropdown-item${opt === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
              {opt === value && <span className="if-pill-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TAX_DEDUCTION_PERCENTS = [30, 50, 75];

const MAX_FIELD_LENGTH = 255;

/* A single editable, pre-filled text box shown below the product table
   when a "More options" entry is selected — matches the reference's
   bordered textarea with a live "x/255" character counter. */
function ExtraFieldBox({ value, onChange, onRemove, placeholder, tall }) {
  return (
    <div className="if-extra-field-box">
      <button
        type="button"
        className="if-extra-field-remove"
        aria-label="Remove this field"
        onClick={onRemove}
      >
        ×
      </button>
      <textarea
        className={`if-extra-field-textarea${tall ? " if-extra-field-tall" : ""}`}
        value={value}
        placeholder={placeholder}
        maxLength={MAX_FIELD_LENGTH}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="if-extra-field-counter">
        {value.length}/{MAX_FIELD_LENGTH}
      </span>
    </div>
  );
}

/* ── Constants aligned to backend enums / accepted values ───────────── */
const CURRENCIES = ["SEK", "INR"]; // per InvoiceDTO comment: "INR or SEK"
const PAYMENT_TERMS_OPTIONS = ["Due on receipt", "Net 15", "Net 30", "Net 45", "Net 60"];
const STATUS_OPTIONS = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

// The backend has no `language` field on InvoiceDTO yet. This is kept as
// local-only UI state so the selector still works, but it is NOT sent to
// the API — remove this block once/if the backend adds support for it.
const LANGUAGES = ["Swedish", "English", "Norwegian", "Danish", "Finnish"];

let localRowId = 0;
const nextRowId = () => `row-${Date.now()}-${localRowId++}`;

const emptyRow = (rowType = "product") => ({
  rowKey: nextRowId(), // local-only React key, never sent to the API
  id: null, // InvoiceItemDTO.id — set once the backend has persisted this row
  rowType, // "product" | "text" — text rows are description-only lines (no qty/price)
  productId: null,
  description: "",
  text: "", // extra information / notes shown alongside the product line
  quantity: 1,
  unit: "",
  unitPrice: 0,
  taxPercent: 18, // default VAT, adjust to your locale's typical rate
  discountPercent: 0,
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

// Client API responses vary in field naming across backends — try the
// common variants before falling back to something visible.
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


// Text rows carry no pricing — only product rows contribute to totals.
const lineSubtotalOf = (row) => {
  if (row.rowType === "text") return 0;
  const gross = toNumber(row.quantity) * toNumber(row.unitPrice);
  const discount = gross * (toNumber(row.discountPercent) / 100);
  return gross - discount;
};

const lineTotalOf = (row) => lineSubtotalOf(row);
const taxAmountOf = (row) => lineSubtotalOf(row) * (toNumber(row.taxPercent) / 100);

/**
 * InvoiceForm
 *
 * Props:
 * - invoiceId    optional — if provided, the form loads and edits that invoice
 *                (GET /api/invoices/{id}). If omitted, it creates a new one.
 * - client       { id, name } — required when creating a new invoice.
 * - currentUser  string — default value for "Our reference".
 * - onSaved      (savedInvoiceDTO) => void — called after a successful save.
 * - onNavigate   (route) => void — used for Cancel and post-save navigation.
 * - onEditClient () => void — called when the pencil icon next to Client is clicked.
 */
export default function InvoiceForm({
  invoiceId,
  client,
  currentUser = "",
  onSaved,
  onNavigate,
  onEditClient,
}) {
  const isEditMode = Boolean(invoiceId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClient, setSelectedClient] = useState(client || null);
  const [invoiceNumber, setInvoiceNumber] = useState(null); // assigned by backend
  const [invoiceDate, setInvoiceDate] = useState(todayIso());
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [dueDate, setDueDate] = useState(addDays(todayIso(), 30));
  const [yourReference, setYourReference] = useState("");
  const [ourReference, setOurReference] = useState(currentUser);
  const [status, setStatus] = useState("DRAFT");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]); // local-only, see note above
  const [items, setItems] = useState([emptyRow()]);

  // Client picker — fetched from the clients API when the client field is clicked
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientFetchError, setClientFetchError] = useState(null);

  // Client details popup — opened by clicking the selected client's NAME
  // (separate from the pencil icon, which still triggers onEditClient
  // for whatever full-page edit flow the parent app wants).
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);

  // "More options (ROT/RUT etc)" — Swedish tax-deduction line options.
  // Local-only UI state until the backend exposes a field for these.
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Which of the simple text-field options are currently active.
  const [selectedOptions, setSelectedOptions] = useState({
    extraFieldsLong: false,
    buyerPersonalId: false,
    buyerVat: false,
    reverseCharge: false,
    threePartyTrade: false,
    rotExtraFields: false,
  });

  // Editable text for every field — pre-filled with the template default
  // the moment its option is selected, but freely editable afterward.
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

  // "Add tax deduction for ROT / RUT / Green tech" opens a distinct panel
  // (percentage picker + confirm/cancel) rather than a plain text field.
  const [showTaxDeductionPanel, setShowTaxDeductionPanel] = useState(false);
  const [taxDeductionApplied, setTaxDeductionApplied] = useState(false);
  const [taxDeductionPercent, setTaxDeductionPercent] = useState(30);

  // Recompute due date from invoice date + payment terms, unless the user
  // has manually overridden it.
  const [dueDateTouched, setDueDateTouched] = useState(false);
  useEffect(() => {
    if (!dueDateTouched) {
      setDueDate(addDays(invoiceDate, termsToDays(paymentTerms)));
    }
  }, [invoiceDate, paymentTerms, dueDateTouched]);

  // Load existing invoice when editing
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    InvoiceService.getInvoiceById(invoiceId)
      .then(({ data }) => {
        if (cancelled) return;
        setSelectedClient({ id: data.clientId, name: data.clientName });
        setInvoiceNumber(data.invoiceNumber ?? null);
        setInvoiceDate(data.invoiceDate ?? todayIso());
        setPaymentTerms(data.paymentTerms ?? "Net 30");
        setDueDate(
          data.dueDate ?? addDays(data.invoiceDate ?? todayIso(), termsToDays(data.paymentTerms))
        );
        setDueDateTouched(true); // trust the loaded due date, don't auto-recompute it
        setYourReference(data.yourReference ?? "");
        setOurReference(data.ourReference ?? currentUser);
        setStatus(data.status ?? "DRAFT");
        setCurrency(data.currency ?? CURRENCIES[0]);
        setItems(
          Array.isArray(data.items) && data.items.length
            ? data.items.map((it) => ({
                rowKey: nextRowId(),
                id: it.id ?? null,
                rowType: it.rowType ?? "product",
                productId: it.productId ?? null,
                description: it.description ?? "",
                text: it.text ?? "",
                quantity: it.quantity ?? 1,
                unit: it.unit ?? "",
                unitPrice: it.unitPrice ?? 0,
                taxPercent: it.taxPercent ?? 0,
                discountPercent: it.discountPercent ?? 0,
              }))
            : [emptyRow()]
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load invoice.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, isEditMode]);

  const updateRow = useCallback((rowKey, patch) => {
    setItems((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)));
  }, []);

  const removeRow = useCallback((rowKey) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((row) => row.rowKey !== rowKey) : prev));
  }, []);

  // Fetches the full client list so the person can see client details and
  // pick a different one directly from the invoice form.
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    setClientFetchError(null);
    try {
      const res = await fetch("http://localhost:8080/api/v1/clients");
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      if (list.length) {
        // eslint-disable-next-line no-console
        console.log("Client API sample record (check field names):", list[0]);
      }
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

  // Clicking the selected client's NAME (once one is chosen) pops open the
  // quick-edit modal instead of re-opening the picker dropdown.
  const handleClientNameClick = (e) => {
    e.stopPropagation();
    if (selectedClient?.id) {
      setShowClientDetailsModal(true);
    } else {
      handleClientFieldClick();
    }
  };

  // After a successful save in the modal, refresh the name shown here
  // without needing a full page reload.
  const handleClientUpdated = (updatedClient) => {
    setSelectedClient((prev) => ({
      id: prev?.id,
      name: getClientDisplayName(updatedClient) || prev?.name,
    }));
  };

  const addProductRow = () => setItems((prev) => [...prev, emptyRow("product")]);
  const addTextRow = () => setItems((prev) => [...prev, emptyRow("text")]);

  // Toggling a dropdown option shows/hides its field(s) below the table.
  // Re-selecting an already-active option turns it back off (removes the
  // field) rather than resetting its text, so the dropdown doubles as an
  // on/off list.
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

  // Invoice-level totals, matching InvoiceDTO: subtotal / taxAmount / totalAmount
  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    let subtotalSum = 0;
    let taxSum = 0;
    items.forEach((row) => {
      subtotalSum += lineTotalOf(row);
      taxSum += taxAmountOf(row);
    });
    return { subtotal: subtotalSum, taxAmount: taxSum, totalAmount: subtotalSum + taxSum };
  }, [items]);

  const buildPayload = () => ({
    clientId: selectedClient?.id ?? null,
    invoiceDate,
    paymentTerms,
    dueDate,
    yourReference,
    ourReference,
    status,
    currency,
    subtotal,
    taxAmount,
    totalAmount,
    // Free-text extra fields the user turned on via "More options" —
    // only the ones actually selected are included.
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
    taxDeduction: taxDeductionApplied ? { percent: taxDeductionPercent } : null,
    items: items.map((row) => ({
      id: row.id ?? undefined, // omit for new rows so the backend generates one
      rowType: row.rowType,
      productId: row.productId ?? null,
      description: row.description,
      text: row.text,
      quantity: toNumber(row.quantity),
      unit: row.unit,
      unitPrice: toNumber(row.unitPrice),
      taxPercent: toNumber(row.taxPercent),
      discountPercent: toNumber(row.discountPercent),
      taxAmount: taxAmountOf(row),
      lineTotal: lineTotalOf(row),
    })),
  });

  const handleCreateOrUpdate = async () => {
    if (!selectedClient?.id) {
      setError("Please choose a client before creating the invoice.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload();
      const response = isEditMode
        ? await InvoiceService.updateInvoice(invoiceId, payload)
        : await InvoiceService.createInvoice(payload);

      onSaved && onSaved(response.data);
      onNavigate && onNavigate("invoices");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save the invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onNavigate && onNavigate("invoices");

  if (loading) {
    return (
      <main className="if-content">
        <div className="if-loading-state">Loading invoice…</div>
      </main>
    );
  }

  return (
    <main className="if-content">
      <div className="if-page-header">
        <div className="if-page-title">
          {isEditMode ? "Edit" : "New"} invoice
          {invoiceNumber ? ` (#${invoiceNumber})` : ""}
          {selectedClient?.name ? ` to ${selectedClient.name}` : ""}
        </div>
      </div>

      {error && <div className="if-error-banner">{error}</div>}

      {/* Form Card */}
      <div className="if-card">
        <div className={`if-grid-row${isEditMode ? " if-with-status" : ""}`}>
          <div className="if-field if-field-large">
            <label>Client</label>
            <div className="if-client-field-wrap">
              <div className="if-client-input" onClick={handleClientFieldClick}>
                <IconCircleX className="if-client-icon" />
                {selectedClient?.name ? (
                  <button
                    type="button"
                    className="if-client-name if-client-name-link"
                    onClick={handleClientNameClick}
                    title="View / edit client details"
                  >
                    {selectedClient.name}
                  </button>
                ) : (
                  <span className="if-client-name">No client selected</span>
                )}
                <button
                  type="button"
                  className="if-client-edit"
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
                <div className="if-client-dropdown">
                  {loadingClients && <div className="if-client-dropdown-msg">Loading clients…</div>}
                  {clientFetchError && (
                    <div className="if-client-dropdown-msg if-client-dropdown-error">
                      {clientFetchError}
                    </div>
                  )}
                  {!loadingClients && !clientFetchError && clientList.length === 0 && (
                    <div className="if-client-dropdown-msg">No clients found.</div>
                  )}
                  {!loadingClients &&
                    clientList.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="if-client-dropdown-item"
                        onClick={() => handleSelectClient(c)}
                      >
                        {getClientDisplayName(c)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="if-field">
            <label>
              Invoice no.
              <IconHelp className="if-label-help" />
            </label>
            <input value={invoiceNumber ?? "Assigned on save"} readOnly />
          </div>

          {isEditMode && (
            <div className="if-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="if-grid-row if-five-cols">
          <div className="if-field">
            <label>Invoice date</label>
            <div className="if-icon-input">
              <IconCalendar className="if-input-icon" />
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          <div className="if-field">
            <label>Payment terms</label>
            <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
              {PAYMENT_TERMS_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="if-field">
            <label>Due date</label>
            <div className="if-icon-input">
              <IconCalendar className="if-input-icon" />
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

          <div className="if-field">
            <label>Your reference</label>
            <input
              value={yourReference}
              onChange={(e) => setYourReference(e.target.value)}
            />
          </div>

          <div className="if-field">
            <label>Our reference</label>
            <input
              value={ourReference}
              onChange={(e) => setOurReference(e.target.value)}
            />
          </div>
        </div>

        <div className="if-options-row">
          <PillDropdown
            icon={<IconGlobe className="if-pill-icon" />}
            label="Language"
            value={language}
            options={LANGUAGES}
            onChange={setLanguage}
          />

          <PillDropdown
            icon={<IconDollar className="if-pill-icon" />}
            label="Currency"
            value={currency}
            options={CURRENCIES}
            onChange={setCurrency}
          />
        </div>
      </div>

      {/* Product Table */}
      <div className={`if-table-card${showMoreOptions ? " if-dropdown-open" : ""}`}>
        <div className="if-table-header">
          <div className="if-col-drag" />
          <div>DESCRIPTION</div>
          <div>TEXT</div>
          <div>QUANTITY</div>
          <div>UNIT</div>
          <div>UNIT PRICE</div>
          <div>TAX %</div>
          <div>DISCOUNT %</div>
          <div>LINE TOTAL</div>
          <div className="if-col-delete" />
        </div>

        {items.map((row) => {
          const isTextRow = row.rowType === "text";
          return (
            <div className={`if-table-row${isTextRow ? " if-text-row" : ""}`} key={row.rowKey}>
              <div className="if-drag-handle">
                <IconDrag />
              </div>

              {isTextRow ? (
                <input
                  className="if-text-row-input"
                  placeholder="Extra text for this invoice line"
                  value={row.text}
                  onChange={(e) => updateRow(row.rowKey, { text: e.target.value })}
                />
              ) : (
                <>
                  <input
                    placeholder="Product name or description"
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
                    value={row.quantity}
                    onChange={(e) => updateRow(row.rowKey, { quantity: e.target.value })}
                  />
                  <input
                    value={row.unit}
                    onChange={(e) => updateRow(row.rowKey, { unit: e.target.value })}
                  />
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
                  <div className="if-total-value">{lineTotalOf(row).toFixed(2)}</div>
                </>
              )}

              <button
                type="button"
                className="if-row-delete"
                aria-label="Remove row"
                onClick={() => removeRow(row.rowKey)}
              >
                <IconCircleX />
              </button>
            </div>
          );
        })}

        {/* ── Extra fields revealed by "More options" ──────────────────
            Each selected option renders its own editable, pre-filled
            text box (255-char limit shown, matching the reference),
            with a small remove control to turn it back off. */}
        {(selectedOptions.extraFieldsLong ||
          selectedOptions.buyerPersonalId ||
          selectedOptions.buyerVat ||
          selectedOptions.reverseCharge ||
          selectedOptions.threePartyTrade ||
          selectedOptions.rotExtraFields ||
          taxDeductionApplied) && (
          <div className="if-extra-fields">
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
              <div className="if-tax-deduction-panel if-tax-deduction-applied">
                <div>
                  <span className="if-tax-deduction-label">Preliminary tax deduction</span>
                  <span className="if-tax-deduction-value">{taxDeductionPercent}%</span>
                </div>
                <button
                  type="button"
                  className="if-outline-btn if-tax-deduction-remove"
                  onClick={handleRemoveTaxDeduction}
                >
                  <IconTrash /> Remove
                </button>
              </div>
            )}
          </div>
        )}

        {showTaxDeductionPanel && (
          <div className="if-tax-deduction-panel">
            <label className="if-tax-deduction-label">Tax deduction</label>
            <div className="if-tax-deduction-row">
              <select
                className="if-tax-deduction-select"
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
                className="if-outline-btn if-tax-deduction-confirm"
                onClick={handleConfirmTaxDeduction}
              >
                Add preliminary tax deduction
              </button>
              <button
                type="button"
                className="if-outline-btn"
                onClick={handleCancelTaxDeduction}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="if-bottom-section">
          <div className="if-actions">
            <button type="button" className="if-outline-btn" onClick={addProductRow}>
              <IconPlus /> New product row
            </button>

            <button type="button" className="if-outline-btn" onClick={addTextRow}>
              <IconPlus /> New text row
            </button>

            <div className="if-more-options">
              <button
                type="button"
                className="if-more-options-btn"
                onClick={() => setShowMoreOptions((prev) => !prev)}
              >
                More options (ROT/RUT etc)
                <IconChevronDown />
              </button>

              {showMoreOptions && (
                <div className="if-more-options-menu">
                  {MORE_OPTIONS.map((option) => {
                    const isActive = option.isTaxDeductionPanel
                      ? showTaxDeductionPanel || taxDeductionApplied
                      : !!selectedOptions[option.key];

                    return (
                      <button
                        type="button"
                        key={option.key}
                        className={`if-more-options-list-item${isActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (option.isTaxDeductionPanel) {
                            if (taxDeductionApplied) return; // already applied — use Remove instead
                            setShowTaxDeductionPanel((prev) => !prev);
                          } else {
                            toggleMoreOption(option.key);
                          }
                          setShowMoreOptions(false);
                        }}
                      >
                        {option.label}
                        {isActive && <span className="if-more-options-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <IconHelp className="if-row-help-icon" />
          </div>

          <div className="if-summary">
            <div>
              <span>Subtotal</span>
              <strong>{subtotal.toFixed(2)}</strong>
            </div>

            <div>
              <span>Tax</span>
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
      <div className="if-footer-actions">
        <button
          type="button"
          className="if-create-btn"
          onClick={handleCreateOrUpdate}
          disabled={saving}
        >
          {saving ? "Saving…" : isEditMode ? "Save invoice" : "Create invoice"}
        </button>

        <button type="button" className="if-cancel-btn" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      {/* Footer */}
      <footer className="if-footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button type="button" className="if-help-btn">
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