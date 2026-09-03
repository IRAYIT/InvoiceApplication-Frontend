import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import OrderService from "../../services/OrderService";
import ClientQuickEditModal from "../clients/ClientQuickEditModal";
import "./OrderForm.css";

/* Small inline icon set — same set used on EstimateForm, no external
   icon package required */
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

const IconTruck = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="2.5" y="7" width="12" height="10" rx="1.2" />
    <path d="M14.5 10.5h3.4l3.1 3.1V17h-6.5z" strokeLinejoin="round" />
    <circle cx="7" cy="18.2" r="1.6" />
    <circle cx="17" cy="18.2" r="1.6" />
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

/* Custom pill dropdown — same pattern used on EstimateForm/InvoiceForm,
   avoids the unreliable native <select> options popup styling. */
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
    <div className="of-pill-select-wrap" ref={wrapRef}>
      <button type="button" className="of-pill-select" onClick={() => setOpen((prev) => !prev)}>
        {icon}
        <span>{label}:</span>
        <strong className="of-pill-value">{value}</strong>
        <IconChevronDown className={`of-pill-chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="of-pill-dropdown">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`of-pill-dropdown-item${opt === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
              {opt === value && <span className="of-pill-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Order status — matches the four statuses fakturan.nu's Order module
   documents: Not started / Started / Completed / Cancelled.
   These are the friendly labels shown in the UI. The backend's
   OrderStatus enum uses NOT_STARTED / STARTED / COMPLETED / CANCELLED,
   so every value crossing the API boundary goes through the maps
   below rather than being sent/read as the display string directly. */
const ORDER_STATUSES = ["Not started", "Started", "Completed", "Cancelled"];

const STATUS_TO_BACKEND = {
  "Not started": "NOT_STARTED",
  Started: "STARTED",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
};

const STATUS_FROM_BACKEND = {
  NOT_STARTED: "Not started",
  STARTED: "Started",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const toBackendStatus = (label) => STATUS_TO_BACKEND[label] || label;
const fromBackendStatus = (value) => STATUS_FROM_BACKEND[value] || ORDER_STATUSES[0];

const PAYMENT_TERMS_OPTIONS = ["Due on receipt", "Net 15", "Net 30", "Net 45", "Net 60"]; // used only to compute deliveryDate default

let localRowId = 0;
const nextRowId = () => `row-${Date.now()}-${localRowId++}`;

// Mirrors EstimateItemRequestDTO's shape: productId, description,
// quantity, unit, unitPrice, taxPercent. Adjust if OrderItemRequestDTO
// differs on your backend.
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
 * OrderForm
 *
 * Fields modeled on fakturan.nu's "New Order" screen (Platina-tier —
 * confirmed via their help center, since the module isn't reachable
 * on a free account): customer, ordered items (qty/unit/price pulled
 * from the product register), a free-text payment method field
 * auto-filled from the client's default terms, an expected delivery
 * date, and an order status (Not started / Started / Completed /
 * Cancelled). Registering the order is what triggers the order
 * confirmation on their system — mirrored here as onSaved.
 *
 * Props:
 * - orderId      optional — if provided, loads/edits that order
 *                (GET/PUT /api/v1/orders/{id}). Omitted = create new.
 * - client       { id, name } — required when creating a new order.
 * - currentUser  string — default value for "Our reference" (local-only).
 * - onSaved      (savedOrderDTO) => void
 * - onNavigate   (route) => void
 * - onEditClient () => void — pencil icon next to Client
 */
export default function OrderForm({
  orderId,
  client,
  currentUser = "",
  onSaved,
  onNavigate,
  onEditClient,
}) {
  const isEditMode = Boolean(orderId);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClient, setSelectedClient] = useState(client || null);
  const [orderNumber, setOrderNumber] = useState(null); // assigned by backend
  const [orderDate, setOrderDate] = useState(todayIso());

  // Payment terms drives the default expected delivery date the same
  // way it drives validUntil on EstimateForm / dueDate on InvoiceForm.
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(addDays(todayIso(), 30));
  const [deliveryDateTouched, setDeliveryDateTouched] = useState(false);

  // Payment method — free text, auto-filled from the client's default
  // terms but editable per order (matches fakturan.nu's behavior).
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethodTouched, setPaymentMethodTouched] = useState(false);

  const [orderStatus, setOrderStatus] = useState(ORDER_STATUSES[0]);

  const [yourReference, setYourReference] = useState("");
  const [ourReference, setOurReference] = useState(currentUser);

  const [items, setItems] = useState([emptyRow()]);

  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientFetchError, setClientFetchError] = useState(null);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);

  useEffect(() => {
    if (!deliveryDateTouched) {
      setExpectedDeliveryDate(addDays(orderDate, termsToDays(paymentTerms)));
    }
  }, [orderDate, paymentTerms, deliveryDateTouched]);

  // Auto-fill payment method from the selected client's default
  // payment terms, same as fakturan.nu — still a free-text field the
  // user can override, so we only fill it while untouched.
  useEffect(() => {
    if (!paymentMethodTouched && selectedClient?.defaultPaymentTerms) {
      setPaymentMethod(selectedClient.defaultPaymentTerms);
    }
  }, [selectedClient, paymentMethodTouched]);

  // Load existing order when editing
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    OrderService.getOrderById(orderId)
      .then(({ data }) => {
        if (cancelled) return;
        setSelectedClient({ id: data.clientId, name: data.clientName });
        setOrderNumber(data.orderNumber ?? null);
        setOrderDate(data.orderDate ?? todayIso());
        setExpectedDeliveryDate(
          data.expectedDeliveryDate ?? addDays(data.orderDate ?? todayIso(), 30)
        );
        setDeliveryDateTouched(true); // trust the loaded date, don't auto-recompute it
        setPaymentMethod(data.paymentMethod ?? "");
        setPaymentMethodTouched(true);
        setOrderStatus(fromBackendStatus(data.status));
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
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load order.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isEditMode]);

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
    setSelectedClient({ id: c.id, name: getClientDisplayName(c), defaultPaymentTerms: c.defaultPaymentTerms });
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
      defaultPaymentTerms: updatedClient?.defaultPaymentTerms ?? prev?.defaultPaymentTerms,
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

  // "Your reference"/"Our reference" get folded into notes, same
  // approach EstimateForm uses — swap this out if OrderRequestDTO
  // ends up with dedicated fields for them.
  const buildPayload = () => {
    const referenceLines = [
      yourReference ? `Your reference: ${yourReference}` : null,
      ourReference ? `Our reference: ${ourReference}` : null,
    ].filter(Boolean);

    return {
      clientId: selectedClient?.id ?? null,
      orderDate,
      expectedDeliveryDate,
      paymentMethod,
      status: toBackendStatus(orderStatus),
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
      setError("Please choose a client before creating the order.");
      return;
    }

    const blankRowIndex = items.findIndex((row) => !row.description || !row.description.trim());
    if (blankRowIndex !== -1) {
      setError(`Please choose a product or enter a description for row ${blankRowIndex + 1}.`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload();
      const response = isEditMode
        ? await OrderService.updateOrder(orderId, payload)
        : await OrderService.createOrder(payload);

      onSaved && onSaved(response.data);
      onNavigate && onNavigate("orders");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save the order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onNavigate && onNavigate("orders");

  if (loading) {
    return (
      <main className="of-content">
        <div className="of-loading-state">Loading order…</div>
      </main>
    );
  }

  return (
    <main className="of-content">
      <div className="of-page-header">
        <div className="of-page-title">
          {isEditMode ? "Edit" : "New"} order
          {orderNumber ? ` (#${orderNumber})` : ""}
          {selectedClient?.name ? ` to ${selectedClient.name}` : ""}
        </div>
      </div>

      {error && <div className="of-error-banner">{error}</div>}

      {/* Form Card */}
      <div className="of-card">
        <div className="of-grid-row">
          <div className="of-field of-field-large">
            <label>Client</label>
            <div className="of-client-field-wrap">
              <div className="of-client-input" onClick={handleClientFieldClick}>
                <IconCircleX className="of-client-icon" />
                {selectedClient?.name ? (
                  <button
                    type="button"
                    className="of-client-name of-client-name-link"
                    onClick={handleClientNameClick}
                    title="View / edit client details"
                  >
                    {selectedClient.name}
                  </button>
                ) : (
                  <span className="of-client-name">No client selected</span>
                )}
                <button
                  type="button"
                  className="of-client-edit"
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
                <div className="of-client-dropdown">
                  {loadingClients && <div className="of-client-dropdown-msg">Loading clients…</div>}
                  {clientFetchError && (
                    <div className="of-client-dropdown-msg of-client-dropdown-error">
                      {clientFetchError}
                    </div>
                  )}
                  {!loadingClients && !clientFetchError && clientList.length === 0 && (
                    <div className="of-client-dropdown-msg">No clients found.</div>
                  )}
                  {!loadingClients &&
                    clientList.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="of-client-dropdown-item"
                        onClick={() => handleSelectClient(c)}
                      >
                        {getClientDisplayName(c)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="of-field">
            <label>
              Order no.
              <IconHelp className="of-label-help" />
            </label>
            <input value={orderNumber ?? "Assigned on save"} readOnly />
          </div>
        </div>

        <div className="of-grid-row of-five-cols">
          <div className="of-field">
            <label>Order date</label>
            <div className="of-icon-input">
              <IconCalendar className="of-input-icon" />
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
          </div>

          <div className="of-field">
            <label>Payment terms</label>
            <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
              {PAYMENT_TERMS_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="of-field">
            <label>Expected delivery</label>
            <div className="of-icon-input">
              <IconTruck className="of-input-icon" />
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => {
                  setDeliveryDateTouched(true);
                  setExpectedDeliveryDate(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="of-field">
            <label>Your reference</label>
            <input value={yourReference} onChange={(e) => setYourReference(e.target.value)} />
          </div>

          <div className="of-field">
            <label>Our reference</label>
            <input value={ourReference} onChange={(e) => setOurReference(e.target.value)} />
          </div>
        </div>

        <div className="of-grid-row of-two-cols of-no-top-pad">
          <div className="of-field">
            <label>
              Payment method
              <IconHelp className="of-label-help" />
            </label>
            <div className="of-icon-input">
              <IconDollar className="of-input-icon" />
              <input
                placeholder="e.g. Bank transfer, 30 days"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethodTouched(true);
                  setPaymentMethod(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <div className="of-options-row">
          <PillDropdown
            icon={<IconTruck className="of-pill-icon" />}
            label="Status"
            value={orderStatus}
            options={ORDER_STATUSES}
            onChange={setOrderStatus}
          />
        </div>
      </div>

      {/* Product Table — same column shape as EstimateForm's table */}
      <div className="of-table-card">
        <div className="of-table-header">
          <div className="of-col-drag" />
          <div>PRODUCT / SERVICE</div>
          <div>QUANTITY</div>
          <div>UNIT</div>
          <div>
            PRICE <span className="of-header-accent">EXCL.</span>
          </div>
          <div>VAT%</div>
          <div>
            TOTAL <span className="of-header-accent">EXCL.</span>
          </div>
          <div className="of-col-delete" />
        </div>

        {items.map((row) => (
          <div className="of-table-row" key={row.rowKey}>
            <div className="of-drag-handle">
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
            <div className="of-total-value">{lineTotalOf(row).toFixed(2)}</div>
            <button
              type="button"
              className="of-row-delete"
              aria-label="Remove row"
              onClick={() => removeRow(row.rowKey)}
            >
              <IconCircleX />
            </button>
          </div>
        ))}

        <div className="of-bottom-section">
          <div className="of-actions">
            <button type="button" className="of-outline-btn" onClick={addProductRow}>
              <IconPlus /> New product row
            </button>
          </div>

          <div className="of-summary">
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
      <div className="of-footer-actions">
        <button
          type="button"
          className="of-create-btn"
          onClick={handleCreateOrUpdate}
          disabled={saving}
        >
          {saving ? "Saving…" : isEditMode ? "Save order" : "Create order"}
        </button>

        <button type="button" className="of-cancel-btn" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      {/* Footer */}
      <footer className="of-footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button type="button" className="of-help-btn">
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