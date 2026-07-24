import { useState, useEffect } from "react";
import ClientService from "../../services/ClientService";
import COUNTRIES from "../../constants/countries";
import "./EditClientForm.css";

const buildFormState = (data) => ({
  clientType: data.clientType || "company",
  company: data.company || "",
  companyRegNo: data.companyRegNo || "",
  vatNo: data.vatNo || "",
  firstName: data.firstName || "",
  lastName: data.lastName || "",
  personalIdNo: data.personalIdNo || "",
  email: data.email || "",
  number: data.number || "",
  website: data.website || "",
  phoneMobile: data.phoneMobile || "",
  phoneHome: data.phoneHome || "",
  fax: data.fax || "",
  address: {
    careOf: data.address?.careOf || "",
    streetAddress: data.address?.streetAddress || "",
    zipCode: data.address?.zipCode || "",
    city: data.address?.city || "",
    country: data.address?.country || "India",
  },
  deliveryAddress: {
    careOf: data.deliveryAddress?.careOf || "",
    streetAddress: data.deliveryAddress?.streetAddress || "",
    zipCode: data.deliveryAddress?.zipCode || "",
    city: data.deliveryAddress?.city || "",
    country: data.deliveryAddress?.country || "India",
  },
  settings: {
    invoiceDeliveryMethod: data.settings?.invoiceDeliveryMethod || "email",
    emailAttachPdf: data.settings?.emailAttachPdf || false,
  },
  invoiceSettings: {
    paymentTermsDays: data.invoiceSettings?.paymentTermsDays ?? "",
    invoiceLanguage: data.invoiceSettings?.invoiceLanguage || "Swedish",
    currency: data.invoiceSettings?.currency || "SEK",
    defaultVatPercent: data.invoiceSettings?.defaultVatPercent ?? "",
    defaultDiscountPercent: data.invoiceSettings?.defaultDiscountPercent ?? "",
  },
  rotInfo: {
    apartmentDesignation: data.rotInfo?.apartmentDesignation || "",
    propertyDesignation: data.rotInfo?.propertyDesignation || "",
    assocCorpIdNo: data.rotInfo?.assocCorpIdNo || "",
  },
});

const DELIVERY_METHODS = [
  ["email", "Email"],
  ["epost_sms", "E-post + SMS"],
  ["letter", "Letter"],
  ["e_invoice", "E-invoice"],
];

function EditClientForm({ clientId, onNavigate }) {
  const [formData, setFormData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [addressTab, setAddressTab] = useState("billing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchClient = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await ClientService.getClientById(clientId);
        if (!cancelled) setFormData(buildFormState(data));
      } catch (err) {
        if (!cancelled) setLoadError("Couldn't load this client. Please go back and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (clientId) fetchClient();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateNestedField = (section, field, value) =>
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      await ClientService.updateClient(clientId, formData);
      onNavigate && onNavigate("clientDetail", clientId);
    } catch (err) {
      setSaveError("Failed to save changes. Please check the form and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onNavigate && onNavigate("clientDetail", clientId);
  };

  if (loading) {
    return (
      <div className="ecf-wrapper">
        <div className="ecf-card ecf-state-card">
          <div className="ecf-spinner" />
          <p className="ecf-state-text">Loading client...</p>
        </div>
      </div>
    );
  }

  if (loadError || !formData) {
    return (
      <div className="ecf-wrapper">
        <div className="ecf-card ecf-state-card">
          <p className="ecf-error">{loadError || "Client not found."}</p>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("clients")}>
            Back to clients
          </button>
        </div>
      </div>
    );
  }

  const activeAddressKey = addressTab === "billing" ? "address" : "deliveryAddress";

  return (
    <div className="ecf-wrapper">
      <div className="toolbar">
        <button className="btn-success" onClick={() => onNavigate && onNavigate("newInvoice")}>
          New invoice
        </button>
        <button className="btn-outline">New estimate</button>
        <button className="btn-outline">New order</button>
        <div className="search-box">
          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className="ecf-card">
        {saveError && <div className="ecf-error">{saveError}</div>}

        <div className="top-grid">
          {/* ===== General ===== */}
          <div className="section-block">
            <h3 className="section-title">General</h3>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "company"}
                  onChange={() => updateField("clientType", "company")}
                />
                Company
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "person"}
                  onChange={() => updateField("clientType", "person")}
                />
                Person
              </label>
            </div>

            {formData.clientType === "company" ? (
              <>
                <div className="field">
                  <label>Company name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Company reg. no.</label>
                    <input
                      type="text"
                      value={formData.companyRegNo}
                      onChange={(e) => updateField("companyRegNo", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>VAT no.</label>
                    <input
                      type="text"
                      value={formData.vatNo}
                      onChange={(e) => updateField("vatNo", e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="field-row">
                  <div className="field">
                    <label>First name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Last name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Personal id no.</label>
                  <input
                    type="text"
                    value={formData.personalIdNo}
                    onChange={(e) => updateField("personalIdNo", e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="field">
              <label>
                Send invoices by <span className="tooltip-icon">?</span>
              </label>
              <div className="radio-group">
                {DELIVERY_METHODS.map(([value, label]) => (
                  <label className="radio-option" key={value}>
                    <input
                      type="radio"
                      name="sendBy"
                      checked={formData.settings.invoiceDeliveryMethod === value}
                      onChange={() => updateNestedField("settings", "invoiceDeliveryMethod", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.settings.emailAttachPdf}
                onChange={(e) => updateNestedField("settings", "emailAttachPdf", e.target.checked)}
              />
              Always attach a PDF copy in emails <span className="tooltip-icon">?</span>
            </label>
          </div>

          {/* ===== Address ===== */}
          <div className="section-block">
            <div className="address-tabs">
              <button
                type="button"
                className={`address-tab ${addressTab === "billing" ? "active" : ""}`}
                onClick={() => setAddressTab("billing")}
              >
                Billing address
              </button>
              <button
                type="button"
                className={`address-tab ${addressTab === "delivery" ? "active" : ""}`}
                onClick={() => setAddressTab("delivery")}
              >
                Delivery address
              </button>
            </div>

            <div className="field">
              <label>C/O</label>
              <input
                type="text"
                value={formData[activeAddressKey].careOf}
                onChange={(e) => updateNestedField(activeAddressKey, "careOf", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Address</label>
              <input
                type="text"
                value={formData[activeAddressKey].streetAddress}
                onChange={(e) => updateNestedField(activeAddressKey, "streetAddress", e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Zip code</label>
                <input
                  type="text"
                  value={formData[activeAddressKey].zipCode}
                  onChange={(e) => updateNestedField(activeAddressKey, "zipCode", e.target.value)}
                />
              </div>
              <div className="field">
                <label>City</label>
                <input
                  type="text"
                  value={formData[activeAddressKey].city}
                  onChange={(e) => updateNestedField(activeAddressKey, "city", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Country</label>
              <select
                value={formData[activeAddressKey].country}
                onChange={(e) => updateNestedField(activeAddressKey, "country", e.target.value)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            <div className="section-divider" />

            <div className="middle-grid">
              {/* ===== Contact information ===== */}
              <div className="section-block">
                <h3 className="section-title">Contact information</h3>

                <div className="field">
                  <label>Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Phone (mobile)</label>
                    <input
                      type="tel"
                      value={formData.phoneMobile}
                      onChange={(e) => updateField("phoneMobile", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Phone (home)</label>
                    <input
                      type="tel"
                      value={formData.phoneHome}
                      onChange={(e) => updateField("phoneHome", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Fax</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => updateField("fax", e.target.value)}
                  />
                </div>
              </div>

              {/* ===== New invoice settings ===== */}
              <div className="section-block">
                <h3 className="section-title">New invoice settings</h3>

                <div className="setting-row">
                  <span className="setting-label">Payment terms</span>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.paymentTermsDays}
                      onChange={(e) => updateNestedField("invoiceSettings", "paymentTermsDays", e.target.value)}
                    />
                    <span className="unit">days</span>
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Language</span>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.invoiceLanguage}
                      onChange={(e) => updateNestedField("invoiceSettings", "invoiceLanguage", e.target.value)}
                    >
                      <option>Swedish</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Currency</span>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.currency}
                      onChange={(e) => updateNestedField("invoiceSettings", "currency", e.target.value)}
                    >
                      <option>SEK</option>
                      <option>EUR</option>
                      <option>USD</option>
                      <option>INR</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">VAT for new rows</span>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.defaultVatPercent}
                      onChange={(e) => updateNestedField("invoiceSettings", "defaultVatPercent", e.target.value)}
                    />
                    <span className="unit">%</span>
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Discount</span>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.defaultDiscountPercent}
                      onChange={(e) => updateNestedField("invoiceSettings", "defaultDiscountPercent", e.target.value)}
                    />
                    <span className="unit">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            <div className="bottom-grid">
              {/* ===== Client information ===== */}
              <div className="section-block">
                <h3 className="section-title">Client information</h3>
                <div className="field">
                  <label>
                    Number <span className="tooltip-icon">?</span>
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => updateField("number", e.target.value)}
                  />
                </div>
              </div>

              {/* ===== ROT deduction ===== */}
              <div className="section-block">
                <h3 className="section-title">Extra field for ROT deduction</h3>
                <div className="field-row">
                  <div className="field">
                    <label>Apartment designation</label>
                    <input
                      type="text"
                      value={formData.rotInfo.apartmentDesignation}
                      onChange={(e) => updateNestedField("rotInfo", "apartmentDesignation", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Property designation</label>
                    <input
                      type="text"
                      value={formData.rotInfo.propertyDesignation}
                      onChange={(e) => updateNestedField("rotInfo", "propertyDesignation", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Assoc. corp ID no.</label>
                  <input
                    type="text"
                    value={formData.rotInfo.assocCorpIdNo}
                    onChange={(e) => updateNestedField("rotInfo", "assocCorpIdNo", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="section-divider" />

        <div className="detailed-settings-toggle">
          <button type="button" className="toggle-link" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide detailed settings" : "Show detailed settings"}
          </button>
        </div>

        <div className="form-actions">
          <button className="btn-success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save client"}
          </button>
          <button className="btn-outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditClientForm;