import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  ["email", "clients.form.email"],
  ["epost_sms", "clients.form.deliveryEmailSms"],
  ["letter", "clients.form.deliveryLetter"],
  ["e_invoice", "clients.form.deliveryEInvoice"],
];

function EditClientForm({ clientId, onNavigate }) {
  const { t } = useTranslation();
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
        if (!cancelled) setLoadError(t("clients.edit.loadFailedBack"));
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
      setSaveError(t("clients.form.saveFailed"));
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
                    <p className="ecf-state-text">{t("clients.form.loadingClient")}</p>
        </div>
      </div>
    );
  }

  if (loadError || !formData) {
    return (
      <div className="ecf-wrapper">
        <div className="ecf-card ecf-state-card">
        <p className="ecf-error">{loadError || t("clients.form.notFound")}</p>
        <button className="btn-outline" onClick={() => onNavigate && onNavigate("clients")}>{t("clients.edit.backToClients")}</button>
        </div>
      </div>
    );
  }

  const activeAddressKey = addressTab === "billing" ? "address" : "deliveryAddress";

  return (
    <div className="ecf-wrapper">
      <div className="toolbar">
      <button className="btn-success" onClick={() => onNavigate && onNavigate("newInvoice")}>{t("clients.edit.newInvoice")}</button>
        <button className="btn-outline">{t("clients.edit.newEstimate")}</button>
        <button className="btn-outline">{t("clients.edit.newOrder")}</button>
        <div className="search-box">
          <input type="text" placeholder={t("common.search")} />
        </div>
      </div>

      <div className="ecf-card">
        {saveError && <div className="ecf-error">{saveError}</div>}

        <div className="top-grid">
          {/* ===== General ===== */}
          <div className="section-block">
          <h3 className="section-title">{t("clients.form.general")}</h3>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "company"}
                  onChange={() => updateField("clientType", "company")}
                  />{t("clients.form.company")}</label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="clientType"
                  checked={formData.clientType === "person"}
                  onChange={() => updateField("clientType", "person")}
                  />{t("clients.form.person")}</label>
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
            <label>{t("clients.form.sendInvoicesBy")} <span className="tooltip-icon">?</span>
              </label>
              <div className="radio-group">
                {DELIVERY_METHODS.map(([value, labelKey]) => (
                  <label className="radio-option" key={value}>
                    <input
                      type="radio"
                      name="sendBy"
                      checked={formData.settings.invoiceDeliveryMethod === value}
                      onChange={() => updateNestedField("settings", "invoiceDeliveryMethod", value)}
                      />
                      {t(labelKey)}
                    </label>
                ))}
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.settings.emailAttachPdf}
                onChange={(e) => updateNestedField("settings", "emailAttachPdf", e.target.checked)}
                />{t("clients.form.attachPdf")} <span className="tooltip-icon">?</span>
            </label>
          </div>

          {/* ===== Address ===== */}
          <div className="section-block">
            <div className="address-tabs">
              <button
                type="button"
                className={`address-tab ${addressTab === "billing" ? "active" : ""}`}
                onClick={() => setAddressTab("billing")}
                >{t("clients.form.billingAddress")}</button>
                <button
                  type="button"
                  className={`address-tab ${addressTab === "delivery" ? "active" : ""}`}
                  onClick={() => setAddressTab("delivery")}
                >{t("clients.form.deliveryAddress")}</button>
            </div>

            <div className="field">
            <label>{t("clients.form.careOf")}</label>
              <input
                type="text"
                value={formData[activeAddressKey].careOf}
                onChange={(e) => updateNestedField(activeAddressKey, "careOf", e.target.value)}
              />
            </div>
            <div className="field">
            <label>{t("clients.form.address")}</label>
              <input
                type="text"
                value={formData[activeAddressKey].streetAddress}
                onChange={(e) => updateNestedField(activeAddressKey, "streetAddress", e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field">
              <label>{t("clients.form.zipCode")}</label>
                <input
                  type="text"
                  value={formData[activeAddressKey].zipCode}
                  onChange={(e) => updateNestedField(activeAddressKey, "zipCode", e.target.value)}
                />
              </div>
              <div className="field">
              <label>{t("clients.form.city")}</label>
                <input
                  type="text"
                  value={formData[activeAddressKey].city}
                  onChange={(e) => updateNestedField(activeAddressKey, "city", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
            <label>{t("clients.form.country")}</label>
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

              {/* ===== New invoice settings ===== */}
              <div className="section-block">
              <h3 className="section-title">{t("clients.form.newInvoiceSettings")}</h3>

                <div className="setting-row">
                <span className="setting-label">{t("clients.form.paymentTerms")}</span>
                  <div className="setting-input-wrap">
                    <input
                      type="number"
                      value={formData.invoiceSettings.paymentTermsDays}
                      onChange={(e) => updateNestedField("invoiceSettings", "paymentTermsDays", e.target.value)}
                    />
                    <span className="unit">{t("clients.form.days")}</span>
                  </div>
                </div>
                <div className="setting-row">
                <span className="setting-label">{t("clients.form.language")}</span>
                  <div className="setting-input-wrap">
                    <select
                      value={formData.invoiceSettings.invoiceLanguage}
                      onChange={(e) => updateNestedField("invoiceSettings", "invoiceLanguage", e.target.value)}
                    >
                    <option value="Swedish">{t("clients.form.swedish")}</option>
                    <option value="English">{t("clients.form.english")}</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                <span className="setting-label">{t("clients.form.currency")}</span>
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
                <span className="setting-label">{t("clients.form.vatForNewRows")}</span>
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
                <span className="setting-label">{t("clients.form.discount")}</span>
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
              <h3 className="section-title">{t("clients.form.clientInformation")}</h3>
                <div className="field">
                  <label>{t("clients.form.number")} <span className="tooltip-icon">?</span>
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
          <button type="button" className="toggle-link" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? t("clients.form.hideDetails") : t("clients.form.showDetails")}
          </button>
        </div>

        <div className="form-actions">
          <button className="btn-success" onClick={handleSave} disabled={saving}>
          {saving ? t("clients.edit.saving") : t("clients.edit.saveClient")}
          </button>
          <button className="btn-outline" onClick={handleCancel} disabled={saving}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}

export default EditClientForm;