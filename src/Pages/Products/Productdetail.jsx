import React, { useEffect, useMemo, useState } from "react";
import ProductService from "../../services/ProductsService";
import "./ManageProducts.css";

const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.4-1.4 1-1.4 2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const emptyForm = {
  name: "",
  unit: "",
  productCode: "",
  productGroupId: "",
  price: "",
  tax: "25",
  rotRutGreenTech: false,
};

const formatMoney = (n) => Number(n || 0).toFixed(2);

const formatDate = (iso) => {
  if (!iso) return "";
  // Handles both "2026-07-06" and full ISO datetime strings
  return String(iso).slice(0, 10);
};

// productId === null/undefined -> create mode. Otherwise -> edit mode,
// fetching the existing product and showing it the same way the
// Clients module shows an existing client on click-through.
export default function ProductDetail({ productId, onNavigate }) {
  const isEditMode = productId !== null && productId !== undefined;

  const [form, setForm] = useState(emptyForm);
  const [groups, setGroups] = useState([]);
  const [product, setProduct] = useState(null); // raw record, for header title + Updated at
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(isEditMode);
    setError(null);

    const groupsPromise = ProductService.getAllProductGroups();
    const productPromise = isEditMode
      ? ProductService.getProductById(productId)
      : Promise.resolve(null);

    Promise.all([groupsPromise, productPromise])
      .then(([groupsRes, productRes]) => {
        if (cancelled) return;
        setGroups(groupsRes.data || []);
        if (productRes) {
          const p = productRes.data;
          setProduct(p);
          setForm({
            name: p.name || "",
            unit: p.unit || "",
            productCode: p.productCode || "",
            productGroupId: p.productGroupId ?? "",
            price: p.price ?? "",
            tax: p.tax ?? "25",
            rotRutGreenTech: !!p.rotRutGreenTech,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, isEditMode]);

  // Live preview only — server recalculates the authoritative value on save.
  const priceInclTaxPreview = useMemo(() => {
    const price = Number(form.price) || 0;
    const tax = Number(form.tax) || 0;
    return price + (price * tax) / 100;
  }, [form.price, form.tax]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCancel = () => onNavigate && onNavigate("products");

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim() || null,
      productCode: form.productCode.trim() || null,
      productGroupId: form.productGroupId ? Number(form.productGroupId) : null,
      price: form.price === "" ? 0 : Number(form.price),
      tax: form.tax === "" ? 0 : Number(form.tax),
      rotRutGreenTech: !!form.rotRutGreenTech,
    };

    setSaving(true);
    try {
      if (isEditMode) {
        await ProductService.updateProduct(productId, payload);
      } else {
        await ProductService.createProduct(payload);
      }
      onNavigate && onNavigate("products");
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="content">
        <div className="page-header">
          <h1>Product / Service</h1>
        </div>
        <div className="loading-state">Loading product…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="content">
        <div className="page-header">
          <h1>Product / Service</h1>
        </div>
        <div className="error-state">{error}</div>
      </main>
    );
  }

  const headerTitle = isEditMode
    ? `Product / Service #${product?.productCode || productId} - ${product?.name || ""}`
    : "New product or service";

  return (
    <main className="content">
      <div className="page-header">
        <h1>{headerTitle}</h1>
      </div>

      <div className="product-form-card product-form-card-standalone">
        <h2 className="product-form-section-title">Product information</h2>
        <div className="product-form-grid">
          <div className="product-form-field">
            <label>
              Name <IconHelp />
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="product-form-field">
            <label>
              Unit <IconHelp />
            </label>
            <input
              type="text"
              placeholder="hr, st, kg…"
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
            />
          </div>
          <div className="product-form-field">
            <label>
              Product code <IconHelp />
            </label>
            <input
              type="text"
              value={form.productCode}
              onChange={(e) => updateField("productCode", e.target.value)}
            />
          </div>
          <div className="product-form-field">
            <label>
              Product group <IconHelp />
            </label>
            <select
              value={form.productGroupId}
              onChange={(e) => updateField("productGroupId", e.target.value)}
            >
              <option value="">- None -</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="product-form-section-title">Pricing</h2>
        <div className="product-form-grid product-form-grid-pricing">
          <div className="product-form-field">
            <label>
              Price <IconHelp />
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </div>
          <div className="product-form-field">
            <label>Tax</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.tax}
              onChange={(e) => updateField("tax", e.target.value)}
            />
          </div>
          <div className="product-form-field">
            <label>
              Price incl. tax <IconHelp />
            </label>
            <input type="text" value={formatMoney(priceInclTaxPreview)} readOnly />
          </div>
          <div className="product-form-field product-form-checkbox-field">
            <label className="product-form-checkbox">
              <input
                type="checkbox"
                checked={form.rotRutGreenTech}
                onChange={(e) => updateField("rotRutGreenTech", e.target.checked)}
              />
              ROT / RUT / Green tech <IconHelp />
            </label>
          </div>
        </div>

        {formError && <div className="product-form-error">{formError}</div>}

        <div className="product-form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save product"}
          </button>
          <button className="btn btn-outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
        </div>

        {isEditMode && product?.updatedAt && (
          <div className="product-form-updated-at">Updated at: {formatDate(product.updatedAt)}</div>
        )}
      </div>
    </main>
  );
}