import React, { useEffect, useMemo, useState } from "react";
import ProductService from "../../services/ProductsService";
import ProductGroupsModal from "./ProductGroupsModal";
import "./ManageProducts.css";

/* ── Inline icons, matching the outlined style used in ManageInvoices ── */
const IconBox = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8l9 5 9-5M12 13v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPrinter = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M6 9V2h12v7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="9" width="16" height="8" rx="1.5" />
    <path d="M6 17v5h12v-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGroups = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    <circle cx="17" cy="8" r="2.6" />
    <path d="M15.5 13.2A6.5 6.5 0 0 1 21.5 20" strokeLinecap="round" />
  </svg>
);

const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.4-1.4 1-1.4 2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const formatMoney = (n) => Number(n || 0).toFixed(2);

export default function ManageProducts({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [showGroupsModal, setShowGroupsModal] = useState(false);

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([ProductService.getAllProducts(), ProductService.getAllProductGroups()])
      .then(([productsRes, groupsRes]) => {
        setProducts(productsRes.data || []);
        setGroups(groupsRes.data || []);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load products."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.productCode?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <main className="content">
        <div className="page-header">
          <h1>Products and services</h1>
        </div>
        <div className="loading-state">Loading products…</div>
      </main>
    );
  }

  return (
    <main className="content">
      <div className="page-header">
        <h1>Products and services</h1>
      </div>

      <div className="products-toolbar">
        <div className="products-toolbar-left">
          <button
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate("newProduct")}
          >
            <IconBox />
            New product or service
          </button>
          <button className="btn btn-outline">
            <IconPrinter />
            Print product catalogue
          </button>
          <button className="btn btn-outline" onClick={() => setShowGroupsModal(true)}>
            <IconGroups />
            Product groups
          </button>
          <IconHelp className="products-toolbar-help" />
        </div>

        <div className="products-toolbar-right">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="product-table">
        <div className="product-table-header">
          <div>PRODUCT / SERVICE</div>
          <div>PRODUCT CODE</div>
          <div className="align-right">PRICE/RATE</div>
          <div>UNIT</div>
          <div>VAT %</div>
          <div className="menu-col" />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="product-table-empty">No products or services yet.</div>
        ) : (
          filteredProducts.map((p) => (
            <div className="product-table-row" key={p.id}>
              <div>
                <a
                  href="#detail"
                  className="product-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("productDetail", p.id);
                  }}
                >
                  {p.name}
                </a>
              </div>
              <div>{p.productCode}</div>
              <div className="align-right">{formatMoney(p.price)}</div>
              <div>{p.unit}</div>
              <div>{p.tax != null ? `${p.tax}%` : ""}</div>
              <div className="product-row-delete">
                <button
                  type="button"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => handleDelete(p.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <span>♡ FAQ</span>
        <span>❓ Help</span>
        <span>✉ Email us</span>
        <span>☎ Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </footer>

      <button className="help-btn">❓ Help</button>

      {showGroupsModal && (
        <ProductGroupsModal
          groups={groups}
          onClose={() => setShowGroupsModal(false)}
          onGroupsChanged={setGroups}
        />
      )}
    </main>
  );
}