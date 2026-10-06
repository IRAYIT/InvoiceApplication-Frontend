import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ClientService from "../../services/ClientService";
import COUNTRIES from "../../constants/countries";
import "./ClientQuickEditModal.css";

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
  address: {
    careOf: data.address?.careOf || "",
    streetAddress: data.address?.streetAddress || "",
    zipCode: data.address?.zipCode || "",
    city: data.address?.city || "",
    country: data.address?.country || "India",
  },
  settings: {
    invoiceDeliveryMethod: data.settings?.invoiceDeliveryMethod || "email",
    emailAttachPdf: data.settings?.emailAttachPdf || false,
  },
});

const DELIVERY_METHODS = [
  ["email", "clients.form.email"],
  ["epost_sms", "clients.form.deliveryEmailSms"],
  ["letter", "clients.form.deliveryLetter"],
  ["e_invoice", "clients.form.deliveryEInvoice"],
];

/**
 * ClientQuickEditModal
 *
 * A compact popup (not a full page navigation) for viewing/editing a
 * client's core details directly from wherever it's opened — e.g.
 * clicking the client's name inside InvoiceForm.
 *
 * Props:
 * - clientId    required — which client to load
 * - onClose     () => void — called on Cancel / backdrop click / Esc
 * - onUpdated   (updatedClientDTO) => void — called after a successful save,
 *               so the caller (e.g. InvoiceForm) can refresh the displayed
 *               client name without a full page reload.
 */
export default function ClientQuickEditModal({ clientId, onClose, onUpdated }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(null);
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
        if (!cancelled) setLoadError(t("clients.form.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (clientId) fetchClient();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  // Close on Escape key, same as most modal conventions.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateAddressField = (field, value) =>
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));

  const updateSettingsField = (field, value) =>
    setFormData((prev) => ({ ...prev, settings: { ...prev.settings, [field]: value } }));

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const updated = await ClientService.updateClient(clientId, formData);
      onUpdated && onUpdated(updated);
      onClose && onClose();
    } catch (err) {
      setSaveError(t("clients.form.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cqem-backdrop" onClick={onClose}>
      <div className="cqem-modal" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="cqem-state">
            <div className="cqem-spinner" />
            <p>{t("clients.form.loadingClient")}</p>
          </div>
        ) : loadError || !formData ? (
          <div className="cqem-state">
            <p className="cqem-error">{loadError || t("clients.form.notFound")}</p>
            <button className="cqem-btn-outline" onClick={onClose}>
              {t("common.close")}
            </button>
          </div>
        ) : (
          <>
            {saveError && <div className="cqem-error cqem-error-banner">{saveError}</div>}

            <div className="cqem-field">
            <label>{t("clients.form.customerType")}</label>
              <div className="cqem-radio-group">
                <label className="cqem-radio-option">
                  <input
                    type="radio"
                    name="cqem-clientType"
                    checked={formData.clientType === "company"}
                    onChange={() => updateField("clientType", "company")}
                    />{t("clients.form.company")}</label>
                <label className="cqem-radio-option">
                  <input
                    type="radio"
                    name="cqem-clientType"
                    checked={formData.clientType === "person"}
                    onChange={() => updateField("clientType", "person")}
                    />{t("clients.form.person")}</label>
              </div>
            </div>

            <div className="cqem-row">
              {formData.clientType === "company" ? (
                <div className="cqem-field cqem-field-large">
                  <label>{t("clients.form.companyName")}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>
              ) : (
                <div className="cqem-field cqem-field-large">
                  <label>{t("clients.form.fullName")}</label>
                  <div className="cqem-row cqem-row-tight">
                    <input
                      type="text"
                      placeholder={t("clients.form.firstName")}
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder={t("clients.form.lastName")}
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="cqem-field">
              <label>{t("clients.form.number")} <span className="cqem-tooltip-icon">?</span>
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => updateField("number", e.target.value)}
                />
              </div>
            </div>

            <div className="cqem-row">
              {formData.clientType === "company" ? (
                <>
                  <div className="cqem-field">
                  <label>{t("clients.form.companyRegistrationNumber")}</label>
                    <input
                      type="text"
                      value={formData.companyRegNo}
                      onChange={(e) => updateField("companyRegNo", e.target.value)}
                    />
                  </div>
                  <div className="cqem-field">
                  <label>{t("clients.form.vatNo")}</label>
                    <input
                      type="text"
                      value={formData.vatNo}
                      onChange={(e) => updateField("vatNo", e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="cqem-field">
                  <label>{t("clients.form.personalIdNo")}</label>
                  <input
                    type="text"
                    value={formData.personalIdNo}
                    onChange={(e) => updateField("personalIdNo", e.target.value)}
                  />
                </div>
              )}

              <div className="cqem-field">
              <label>{t("clients.form.careOf")}</label>
                <input
                  type="text"
                  value={formData.address.careOf}
                  onChange={(e) => updateAddressField("careOf", e.target.value)}
                />
              </div>
            </div>

            <div className="cqem-row">
              <div className="cqem-field">
              <label>{t("clients.form.email")}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="cqem-field">
              <label>{t("clients.form.address")}</label>
                <input
                  type="text"
                  value={formData.address.streetAddress}
                  onChange={(e) => updateAddressField("streetAddress", e.target.value)}
                />
              </div>
            </div>

            <div className="cqem-row">
              <div className="cqem-field-block">
              <label className="cqem-block-label">{t("clients.form.sendInvoicesBy")} <span className="cqem-tooltip-icon">?</span>
                </label>
                <div className="cqem-radio-group">
                  {DELIVERY_METHODS.map(([value, labelKey]) => (
                    <label className="cqem-radio-option" key={value}>
                      <input
                        type="radio"
                        name="cqem-sendBy"
                        checked={formData.settings.invoiceDeliveryMethod === value}
                        onChange={() => updateSettingsField("invoiceDeliveryMethod", value)}
                        />
                        {t(labelKey)}
                      </label>
                  ))}
                </div>
                <label className="cqem-checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.settings.emailAttachPdf}
                    onChange={(e) => updateSettingsField("emailAttachPdf", e.target.checked)}
                    />{t("clients.form.attachPdf")} <span className="cqem-tooltip-icon">?</span>
                </label>
              </div>

              <div className="cqem-row cqem-row-tight">
                <div className="cqem-field">
                <label>{t("clients.form.zipCode")}</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateAddressField("zipCode", e.target.value)}
                  />
                </div>
                <div className="cqem-field">
                <label>{t("clients.form.city")}</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateAddressField("city", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="cqem-row">
              <div />
              <div className="cqem-field">
              <label>{t("clients.form.country")}</label>
                <select
                  value={formData.address.country}
                  onChange={(e) => updateAddressField("country", e.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cqem-actions">
              <button className="cqem-btn-success" onClick={handleUpdate} disabled={saving}>
              {saving ? t("clients.form.updating") : t("clients.form.updateClient")}
              </button>
              <button className="cqem-btn-outline" onClick={onClose} disabled={saving}>
                {t("common.cancel")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}