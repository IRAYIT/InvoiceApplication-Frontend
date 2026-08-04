import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import OrderService from "../../services/OrderService";
import "./ManageOrders.css";

/* ============================================================
   Icons — same inline-SVG approach as OrderForm, no icon package
   ============================================================ */
const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.8-4.8" strokeLinecap="round" />
  </svg>
);

const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <path d="M5 8.5l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEdit = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" strokeLinejoin="round" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMore = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <circle cx="12" cy="5.5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="18.5" r="1.7" />
  </svg>
);

const IconClipboard = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="5" y="4.5" width="14" height="17" rx="1.5" />
    <path d="M9 4.5V3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M8.5 10.5h7M8.5 14.5h7M8.5 18.5h4" strokeLinecap="round" />
  </svg>
);

const IconFile = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    <path d="M14 3.5V8h4" strokeLinejoin="round" />
  </svg>
);

const IconBox = (props) => (
  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4z" strokeLinejoin="round" />
    <path d="M3.5 8v8.2L12 20l8.5-3.8V8M12 12v8" strokeLinejoin="round" />
  </svg>
);

/* ============================================================
   Constants — statuses mirror fakturan.nu's Order module:
   Ej påbörjad / Påbörjad / Färdigbehandlad / Avbruten.
   NOTE: string values must match whatever your backend
   OrderStatus enum actually uses — same caveat as in OrderForm.
   ============================================================ */
const ORDER_STATUSES = ["Not started", "Started", "Completed", "Cancelled"];
const STATUS_FILTER_OPTIONS = ["All statuses", ...ORDER_STATUSES];

// Backend's OrderStatus enum uses NOT_STARTED / STARTED / COMPLETED /
// CANCELLED — same mapping as OrderForm.jsx. Orders fetched from the
// API are normalized to the display label immediately (see
// loadOrders), and translated back to the enum value whenever we
// write a status update.
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
const fromBackendStatus = (value) => STATUS_FROM_BACKEND[value] || value || ORDER_STATUSES[0];

const STATUS_STYLES = {
  "Not started": { bg: "#eef1f3", fg: "#5a6b76", dot: "#93a3ad" },
  Started: { bg: "#e8f1fd", fg: "#2f66c2", dot: "#3f7fe0" },
  Completed: { bg: "#e9f7ee", fg: "#1f7a43", dot: "#2fa35c" },
  Cancelled: { bg: "#fdecec", fg: "#b23838", dot: "#e05a5a" },
};

const PAGE_SIZE = 10;

const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const formatCurrency = (v) =>
  toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

/* ============================================================
   Small dropdown primitives — closes on outside click, same
   pattern as PillDropdown in OrderForm.
   ============================================================ */
function Dropdown({ trigger, children, align = "left" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="ol-dropdown-wrap" ref={wrapRef}>
      {trigger(() => setOpen((p) => !p), open)}
      {open && (
        <div className={`ol-dropdown-panel ol-align-${align}`} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

/* Inline, editable status pill used both in the row and the filter bar */
function StatusPill({ status, onChange, disabled }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["Not started"];

  if (!onChange) {
    return (
      <span className="ol-status-badge" style={{ background: style.bg, color: style.fg }}>
        <span className="ol-status-dot" style={{ background: style.dot }} />
        {status}
      </span>
    );
  }

  return (
    <Dropdown
      trigger={(toggle, open) => (
        <button
          type="button"
          className={`ol-status-badge ol-status-badge-btn${disabled ? " is-disabled" : ""}`}
          style={{ background: style.bg, color: style.fg }}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) toggle();
          }}
        >
          <span className="ol-status-dot" style={{ background: style.dot }} />
          {status}
          <IconChevronDown className={`ol-status-chevron${open ? " is-open" : ""}`} />
        </button>
      )}
    >
      {ORDER_STATUSES.map((s) => (
        <button
          type="button"
          key={s}
          className={`ol-dropdown-item${s === status ? " is-active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onChange(s);
          }}
        >
          <span className="ol-status-dot" style={{ background: (STATUS_STYLES[s] || {}).dot }} />
          {s}
        </button>
      ))}
    </Dropdown>
  );
}

/**
 * ManageOrders
 *
 * Lists registered orders the way fakturan.nu's Order module does:
 * a searchable, filterable table where each order's status can be
 * updated in place, plus quick access to editing, packing lists and
 * delivery notes ("plocklista" / "följesedel" on their system).
 *
 * Follows the same single-callback convention as ManageEstimates /
 * ManageInvoices — App.jsx's navigate(page, id, extra) handles all
 * routing:
 * - onNavigate("newOrder")            open OrderForm to create one
 * - onNavigate("editOrder", orderId)  open OrderForm to edit one
 * - onNavigate("order-picklist", id)  packing list (placeholder —
 *                                      wire up once that page exists)
 * - onNavigate("order-delivery-note", id)  delivery note (placeholder)
 */
export default function ManageOrders({ onNavigate }) {
  const onNewOrder = () => onNavigate && onNavigate("newOrder");
  const onEditOrder = (orderId) => onNavigate && onNavigate("editOrder", orderId);

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const debounceRef = useRef(null);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { page, size: PAGE_SIZE };
    if (search) params.search = search;
    if (statusFilter !== "All statuses") params.status = toBackendStatus(statusFilter);

    OrderService.getAllOrders(params)
      .then(({ data }) => {
        // Backend may return either a raw array or a Spring-style
        // Page<> object ({ content, totalElements }) — handle both,
        // same defensive shape-check used for clients in OrderForm.
        const rawOrders = Array.isArray(data) ? data : data?.content ?? [];
        const normalized = rawOrders.map((o) => ({ ...o, status: fromBackendStatus(o.status) }));

        if (Array.isArray(data)) {
          setOrders(normalized);
          setTotalCount(normalized.length);
        } else {
          setOrders(normalized);
          setTotalCount(data?.totalElements ?? normalized.length);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load orders.");
        setOrders([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return;
    const previous = order.status;

    // Optimistic update, roll back on failure
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    setUpdatingId(order.id);

    try {
      await OrderService.updateOrderStatus(order.id, toBackendStatus(newStatus));
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      setError(err?.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    setDeletingId(orderId);
    try {
      await OrderService.deleteOrder(orderId);
      setConfirmDeleteId(null);
      // Refetch so pagination / counts stay accurate rather than
      // just filtering the row out locally
      loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete the order.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const statusCounts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const isEmpty = !loading && !error && orders.length === 0;
  const hasFilters = Boolean(search) || statusFilter !== "All statuses";

  return (
    <main className="ol-content">
      <div className="ol-page-header">
        <div className="ol-page-title">Orders</div>
        <button type="button" className="ol-create-btn" onClick={() => onNewOrder && onNewOrder()}>
          <IconPlus /> New order
        </button>
      </div>

      {error && <div className="ol-error-banner">{error}</div>}

      <div className="ol-toolbar">
        <div className="ol-search-input">
          <IconSearch className="ol-search-icon" />
          <input
            placeholder="Search by client or order number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Dropdown
          align="right"
          trigger={(toggle, open) => (
            <button type="button" className="ol-filter-btn" onClick={toggle}>
              <span>Status:</span>
              <strong>{statusFilter}</strong>
              <IconChevronDown className={`ol-filter-chevron${open ? " is-open" : ""}`} />
            </button>
          )}
        >
          {STATUS_FILTER_OPTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className={`ol-dropdown-item${s === statusFilter ? " is-active" : ""}`}
              onClick={() => {
                setStatusFilter(s);
                setPage(0);
              }}
            >
              {s !== "All statuses" && (
                <span className="ol-status-dot" style={{ background: (STATUS_STYLES[s] || {}).dot }} />
              )}
              {s}
              {s !== "All statuses" && statusCounts[s] ? (
                <span className="ol-filter-count">{statusCounts[s]}</span>
              ) : null}
            </button>
          ))}
        </Dropdown>
      </div>

      <div className="ol-table-card">
        <div className="ol-table-header">
          <div>ORDER</div>
          <div>CLIENT</div>
          <div>ORDER DATE</div>
          <div>EXPECTED DELIVERY</div>
          <div>STATUS</div>
          <div className="ol-col-right">TOTAL</div>
          <div className="ol-col-actions" />
        </div>

        {loading && <div className="ol-state-row">Loading orders…</div>}

        {isEmpty && (
          <div className="ol-empty-state">
            <IconBox />
            <div className="ol-empty-title">
              {hasFilters ? "No orders match your search" : "No orders yet"}
            </div>
            <div className="ol-empty-subtitle">
              {hasFilters
                ? "Try a different search term or clear the status filter."
                : "Orders you register for your clients will show up here."}
            </div>
            {!hasFilters && (
              <button type="button" className="ol-outline-btn" onClick={() => onNewOrder && onNewOrder()}>
                <IconPlus /> Create your first order
              </button>
            )}
          </div>
        )}

        {!loading &&
          orders.map((order) => (
            <div
              className="ol-table-row"
              key={order.id}
              onClick={() => onEditOrder && onEditOrder(order.id)}
            >
              <div className="ol-order-number">#{order.orderNumber ?? order.id}</div>
              <div className="ol-client-name">{order.clientName || "—"}</div>
              <div>{formatDate(order.orderDate)}</div>
              <div>{formatDate(order.expectedDeliveryDate)}</div>
              <div onClick={(e) => e.stopPropagation()}>
                <StatusPill
                  status={order.status || "Not started"}
                  disabled={updatingId === order.id}
                  onChange={(newStatus) => handleStatusChange(order, newStatus)}
                />
              </div>
              <div className="ol-col-right ol-total-value">{formatCurrency(order.totalAmount)}</div>
              <div className="ol-col-actions" onClick={(e) => e.stopPropagation()}>
                {confirmDeleteId === order.id ? (
                  <div className="ol-confirm-delete">
                    <span>Delete order?</span>
                    <button
                      type="button"
                      className="ol-confirm-yes"
                      disabled={deletingId === order.id}
                      onClick={() => handleDelete(order.id)}
                    >
                      {deletingId === order.id ? "…" : "Yes"}
                    </button>
                    <button type="button" className="ol-confirm-no" onClick={() => setConfirmDeleteId(null)}>
                      No
                    </button>
                  </div>
                ) : (
                  <Dropdown
                    align="right"
                    trigger={(toggle) => (
                      <button
                        type="button"
                        className="ol-row-menu-btn"
                        aria-label="Order actions"
                        onClick={toggle}
                      >
                        <IconMore />
                      </button>
                    )}
                  >
                    <button
                      type="button"
                      className="ol-dropdown-item"
                      onClick={() => onEditOrder && onEditOrder(order.id)}
                    >
                      <IconEdit /> Edit order
                    </button>
                    <button
                      type="button"
                      className="ol-dropdown-item"
                      onClick={() => onNavigate && onNavigate("order-picklist", order.id)}
                    >
                      <IconClipboard /> Packing list
                    </button>
                    <button
                      type="button"
                      className="ol-dropdown-item"
                      onClick={() => onNavigate && onNavigate("order-delivery-note", order.id)}
                    >
                      <IconFile /> Delivery note
                    </button>
                    <button
                      type="button"
                      className="ol-dropdown-item ol-dropdown-item-danger"
                      onClick={() => setConfirmDeleteId(order.id)}
                    >
                      <IconTrash /> Delete
                    </button>
                  </Dropdown>
                )}
              </div>
            </div>
          ))}
      </div>

      {!loading && orders.length > 0 && (
        <div className="ol-pagination">
          <span className="ol-pagination-summary">
            Page {page + 1} of {totalPages} · {totalCount} order{totalCount === 1 ? "" : "s"}
          </span>
          <div className="ol-pagination-controls">
            <button
              type="button"
              className="ol-outline-btn ol-pagination-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="ol-outline-btn ol-pagination-btn"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}