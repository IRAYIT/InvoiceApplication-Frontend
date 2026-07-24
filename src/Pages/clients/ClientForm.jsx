import { useState } from "react";
import ClientService from "../../services/ClientService";
import COUNTRIES from "../../constants/countries";
import "./ClientForm.css";

function ClientForm({ onCancel, onCreated }) {
  const [showDetails, setShowDetails] = useState(false);
  const [addressTab, setAddressTab] = useState("billing");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    clientType: "company",
    company: "",
    companyRegNo: "",
    vatNo: "",
    firstName: "",
    lastName: "",
    personalIdNo: "",
    email: "",
    number: "",
    website: "",
    phoneMobile: "",
    phoneHome: "",
    fax: "",
    address: {
      careOf: "",
      streetAddress: "",
      zipCode: "",
      city: "",
      country: "India",
    },
    deliveryAddress: {
      careOf: "",
      streetAddress: "",
      zipCode: "",
      city: "",
      country: "India",
    },
    settings: {
      invoiceDeliveryMethod: "email",
      emailAttachPdf: false,
    },
    invoiceSettings: {
      paymentTermsDays: "",
      invoiceLanguage: "Swedish",
      currency: "SEK",
      defaultVatPercent: "",
      defaultDiscountPercent: "",
    },
    rotInfo: {
      apartmentDesignation: "",
      propertyDesignation: "",
      assocCorpIdNo: "",
    },
  });

  const [settingsEnabled, setSettingsEnabled] = useState({
    paymentTermsDays: false,
    invoiceLanguage: false,
    currency: false,
    defaultVatPercent: false,
    defaultDiscountPercent: false,
  });

  const toggleSettingEnabled = (field) => {
    setSettingsEnabled((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (addressType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: { ...prev[addressType], [field]: value },
    }));
  };

  const updateSettingsField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  const updateNestedField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleCreateClient = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await ClientService.createClient(formData);
      onCreated && onCreated(created);
    } catch (err) {
      setError("Failed to create client. Please check the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="client-form-wrapper">
      {/* Main Form Card */}
      <div className="client-card">
        {error && (
          <div
            style={{
              color: "#b3261e",
              background: "#fdeceb",
              border: "1px solid #f3cdc9",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "20px",
              fontSize: "13.5px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* ===== Top Grid: General + Address ===== */}
        <div className="top-grid">
          {/* General */}
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
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "email"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "email")}
                  />
                  Email
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "epost_sms"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "epost_sms")}
                  />
                  E-post + SMS
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "letter"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "letter")}
                  />
                  Letter
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "e_invoice"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "e_invoice")}
                  />
                  E-invoice
                </label>
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.settings.emailAttachPdf}
                onChange={(e) => updateSettingsField("emailAttachPdf", e.target.checked)}
              />
              Always attach a PDF copy in emails <span className="tooltip-icon">?</span>
            </label>
          </div>

          {/* Address */}
          <div className="section-block">
            <h3 className="section-title">Address</h3>

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

            {addressTab === "billing" ? (
              <>
                <div className="field">
                  <label>C/O</label>
                  <input
                    type="text"
                    value={formData.address.careOf}
                    onChange={(e) => updateAddressField("address", "careOf", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address.streetAddress}
                    onChange={(e) => updateAddressField("address", "streetAddress", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Zip code</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => updateAddressField("address", "zipCode", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateAddressField("address", "city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Country</label>
                  <select
                    value={formData.address.country}
                    onChange={(e) => updateAddressField("address", "country", e.target.value)}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>C/O</label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.careOf}
                    onChange={(e) => updateAddressField("deliveryAddress", "careOf", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.streetAddress}
                    onChange={(e) => updateAddressField("deliveryAddress", "streetAddress", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Zip code</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.zipCode}
                      onChange={(e) => updateAddressField("deliveryAddress", "zipCode", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.city}
                      onChange={(e) => updateAddressField("deliveryAddress", "city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Country</label>
                  <select
                    value={formData.deliveryAddress.country}
                    onChange={(e) => updateAddressField("deliveryAddress", "country", e.target.value)}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {showDetails && (
          <>
            <div className="section-divider" />

            <div className="middle-grid">
              {/* Contact information */}
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

              {/* New invoice settings */}
              <div className="section-block">
                <h3 className="section-title">New invoice settings</h3>

                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.paymentTermsDays}
                      onChange={() => toggleSettingEnabled("paymentTermsDays")}
                    />
                    Payment terms
                  </label>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.paymentTermsDays}
                      onChange={(e) => updateNestedField("invoiceSettings", "paymentTermsDays", e.target.value)}
                      disabled={!settingsEnabled.paymentTermsDays}
                      placeholder="30"
                    />
                    <span className="unit">days</span>
                  </div>
                </div>
                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.invoiceLanguage}
                      onChange={() => toggleSettingEnabled("invoiceLanguage")}
                    />
                    Language
                  </label>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.invoiceLanguage}
                      onChange={(e) => updateNestedField("invoiceSettings", "invoiceLanguage", e.target.value)}
                      disabled={!settingsEnabled.invoiceLanguage}
                    >
                      <option>Swedish</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.currency}
                      onChange={() => toggleSettingEnabled("currency")}
                    />
                    Currency
                  </label>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.currency}
                      onChange={(e) => updateNestedField("invoiceSettings", "currency", e.target.value)}
                      disabled={!settingsEnabled.currency}
                    >
                      <option>SEK</option>
                      <option>EUR</option>
                      <option>USD</option>
                      <option>INR</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.defaultVatPercent}
                      onChange={() => toggleSettingEnabled("defaultVatPercent")}
                    />
                    VAT for new rows
                  </label>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.defaultVatPercent}
                      onChange={(e) => updateNestedField("invoiceSettings", "defaultVatPercent", e.target.value)}
                      disabled={!settingsEnabled.defaultVatPercent}
                      placeholder="25"
                    />
                    <span className="unit">%</span>
                  </div>
                </div>
                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.defaultDiscountPercent}
                      onChange={() => toggleSettingEnabled("defaultDiscountPercent")}
                    />
                    Discount
                  </label>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.defaultDiscountPercent}
                      onChange={(e) => updateNestedField("invoiceSettings", "defaultDiscountPercent", e.target.value)}
                      disabled={!settingsEnabled.defaultDiscountPercent}
                      placeholder="0"
                    />
                    <span className="unit">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            <div className="bottom-grid">
              {/* Client information */}
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

              {/* ROT deduction */}
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
          <button
            type="button"
            className={`toggle-link ${showDetails ? "is-open" : ""}`}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide detailed settings" : "Show detailed settings"}
            <span className="chevron" aria-hidden="true" />
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            className="btn-success"
            onClick={handleCreateClient}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create client"}
          </button>
          <button
            className="btn-outline"
            onClick={() => onCancel && onCancel()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientForm;