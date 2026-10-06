import { useState } from "react";
import { useTranslation } from "react-i18next";
import ClientService from "../../services/ClientService";
import COUNTRIES from "../../constants/countries";
import "./ClientForm.css";

function ClientForm({ onCancel, onCreated }) {
  const { t } = useTranslation();
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
      setError(t("clients.form.createFailed"));
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
          <h3 className="section-title">{t("clients.form.general")}</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "company"}
                  onChange={() => updateField("clientType", "company")}
                  />
                {t("clients.form.company")}
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "person"}
                  onChange={() => updateField("clientType", "person")}
                  />
                {t("clients.form.person")}
              </label>
            </div>

            {formData.clientType === "company" ? (
              <>
                <div className="field">
                <label>{t("clients.form.companyName")}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                  <label>{t("clients.form.companyRegNo")}</label>
                    <input
                      type="text"
                      value={formData.companyRegNo}
                      onChange={(e) => updateField("companyRegNo", e.target.value)}
                    />
                  </div>
                  <div className="field">
                  <label>{t("clients.form.vatNo")}</label>
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
                  <label>{t("clients.form.firstName")}</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                  </div>
                  <div className="field">
                  <label>{t("clients.form.lastName")}</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                <label>{t("clients.form.personalIdNo")}</label>
                  <input
                    type="text"
                    value={formData.personalIdNo}
                    onChange={(e) => updateField("personalIdNo", e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="field">
            <label>{t("clients.form.email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="field">
              <label>
              {t("clients.form.sendInvoicesBy")} <span className="tooltip-icon">?</span>
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "email"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "email")}
                    />
                  {t("clients.form.email")}
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "epost_sms"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "epost_sms")}
                    />
                  {t("clients.form.deliveryEmailSms")}
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "letter"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "letter")}
                    />
                  {t("clients.form.deliveryLetter")}
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sendBy"
                    checked={formData.settings.invoiceDeliveryMethod === "e_invoice"}
                    onChange={() => updateSettingsField("invoiceDeliveryMethod", "e_invoice")}
                    />
                  {t("clients.form.deliveryEInvoice")}
                </label>
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.settings.emailAttachPdf}
                onChange={(e) => updateSettingsField("emailAttachPdf", e.target.checked)}
              />
              {t("clients.form.attachPdf")} <span className="tooltip-icon">?</span>
            </label>
          </div>

          {/* Address */}
          <div className="section-block">
          <h3 className="section-title">{t("clients.form.address")}</h3>

            <div className="address-tabs">
              <button
                type="button"
                className={`address-tab ${addressTab === "billing" ? "active" : ""}`}
                onClick={() => setAddressTab("billing")}
                >
                {t("clients.form.billingAddress")}
              </button>
              <button
                type="button"
                className={`address-tab ${addressTab === "delivery" ? "active" : ""}`}
                onClick={() => setAddressTab("delivery")}
                >
                {t("clients.form.deliveryAddress")}
              </button>
            </div>

            {addressTab === "billing" ? (
              <>
                <div className="field">
                <label>{t("clients.form.careOf")}</label>
                  <input
                    type="text"
                    value={formData.address.careOf}
                    onChange={(e) => updateAddressField("address", "careOf", e.target.value)}
                  />
                </div>
                <div className="field">
                <label>{t("clients.form.address")}</label>
                  <input
                    type="text"
                    value={formData.address.streetAddress}
                    onChange={(e) => updateAddressField("address", "streetAddress", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                  <label>{t("clients.form.zipCode")}</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => updateAddressField("address", "zipCode", e.target.value)}
                    />
                  </div>
                  <div className="field">
                  <label>{t("clients.form.city")}</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateAddressField("address", "city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                <label>{t("clients.form.country")}</label>
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
              <h3 className="section-title">{t("clients.form.contactInformation")}</h3>

                <div className="field">
                <label>{t("clients.form.website")}</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                  <label>{t("clients.form.phoneMobile")}</label>
                    <input
                      type="tel"
                      value={formData.phoneMobile}
                      onChange={(e) => updateField("phoneMobile", e.target.value)}
                    />
                  </div>
                  <div className="field">
                  <label>{t("clients.form.phoneHome")}</label>
                    <input
                      type="tel"
                      value={formData.phoneHome}
                      onChange={(e) => updateField("phoneHome", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                <label>{t("clients.form.fax")}</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => updateField("fax", e.target.value)}
                  />
                </div>
              </div>

              {/* New invoice settings */}
              <div className="section-block">
              <h3 className="section-title">{t("clients.form.newInvoiceSettings")}</h3>

                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.paymentTermsDays}
                      onChange={() => toggleSettingEnabled("paymentTermsDays")}
                      />
                    {t("clients.form.paymentTerms")}
                  </label>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.paymentTermsDays}
                      onChange={(e) => updateNestedField("invoiceSettings", "paymentTermsDays", e.target.value)}
                      disabled={!settingsEnabled.paymentTermsDays}
                      placeholder="30"
                    />
                    <span className="unit">{t("clients.form.days")}</span>
                  </div>
                </div>
                <div className="setting-row">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={settingsEnabled.invoiceLanguage}
                      onChange={() => toggleSettingEnabled("invoiceLanguage")}
                      />
                    {t("clients.form.language")}
                  </label>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.invoiceLanguage}
                      onChange={(e) => updateNestedField("invoiceSettings", "invoiceLanguage", e.target.value)}
                      disabled={!settingsEnabled.invoiceLanguage}
                    >
                      <option value="Swedish">{t("clients.form.swedish")}</option>
                      <option value="English">{t("clients.form.english")}</option>
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
                    {t("clients.form.currency")}
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
                    {t("clients.form.vatForNewRows")}
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
                    {t("clients.form.discount")}
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
              <h3 className="section-title">{t("clients.form.clientInformation")}</h3>
                <div className="field">
                  <label>
                  {t("clients.form.number")} <span className="tooltip-icon">?</span>
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
              <h3 className="section-title">{t("clients.form.rotTitle")}</h3>
                <div className="field-row">
                  <div className="field">
                  <label>{t("clients.form.apartmentDesignation")}</label>
                    <input
                      type="text"
                      value={formData.rotInfo.apartmentDesignation}
                      onChange={(e) => updateNestedField("rotInfo", "apartmentDesignation", e.target.value)}
                    />
                  </div>
                  <div className="field">
                  <label>{t("clients.form.propertyDesignation")}</label>
                    <input
                      type="text"
                      value={formData.rotInfo.propertyDesignation}
                      onChange={(e) => updateNestedField("rotInfo", "propertyDesignation", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                <label>{t("clients.form.assocCorpIdNo")}</label>
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
            {showDetails ? t("clients.form.hideDetails") : t("clients.form.showDetails")}
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
            {submitting ? t("clients.form.creating") : t("clients.form.createClient")}
          </button>
          <button
            className="btn-outline"
            onClick={() => onCancel && onCancel()}
            >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientForm;