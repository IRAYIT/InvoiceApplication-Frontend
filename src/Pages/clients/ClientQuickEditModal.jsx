import { useState, useEffect } from "react";
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
  ["email", "Email"],
  ["epost_sms", "E-post + SMS"],
  ["letter", "Letter"],
  ["e_invoice", "E-invoice"],
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
        if (!cancelled) setLoadError("Couldn't load this client.");
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
      setSaveError("Failed to save changes. Please check the form and try again.");
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
            <p>Loading client...</p>
          </div>
        ) : loadError || !formData ? (
          <div className="cqem-state">
            <p className="cqem-error">{loadError || "Client not found."}</p>
            <button className="cqem-btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            {saveError && <div className="cqem-error cqem-error-banner">{saveError}</div>}

            <div className="cqem-field">
              <label>Customer type</label>
              <div className="cqem-radio-group">
                <label className="cqem-radio-option">
                  <input
                    type="radio"
                    name="cqem-clientType"
                    checked={formData.clientType === "company"}
                    onChange={() => updateField("clientType", "company")}
                  />
                  Company
                </label>
                <label className="cqem-radio-option">
                  <input
                    type="radio"
                    name="cqem-clientType"
                    checked={formData.clientType === "person"}
                    onChange={() => updateField("clientType", "person")}
                  />
                  Person
                </label>
              </div>
            </div>

            <div className="cqem-row">
              {formData.clientType === "company" ? (
                <div className="cqem-field cqem-field-large">
                  <label>Company name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>
              ) : (
                <div className="cqem-field cqem-field-large">
                  <label>Full name</label>
                  <div className="cqem-row cqem-row-tight">
                    <input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="cqem-field">
                <label>
                  Number <span className="cqem-tooltip-icon">?</span>
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
                    <label>Company registration number</label>
                    <input
                      type="text"
                      value={formData.companyRegNo}
                      onChange={(e) => updateField("companyRegNo", e.target.value)}
                    />
                  </div>
                  <div className="cqem-field">
                    <label>VAT no.</label>
                    <input
                      type="text"
                      value={formData.vatNo}
                      onChange={(e) => updateField("vatNo", e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="cqem-field">
                  <label>Personal id no.</label>
                  <input
                    type="text"
                    value={formData.personalIdNo}
                    onChange={(e) => updateField("personalIdNo", e.target.value)}
                  />
                </div>
              )}

              <div className="cqem-field">
                <label>C/O</label>
                <input
                  type="text"
                  value={formData.address.careOf}
                  onChange={(e) => updateAddressField("careOf", e.target.value)}
                />
              </div>
            </div>

            <div className="cqem-row">
              <div className="cqem-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="cqem-field">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address.streetAddress}
                  onChange={(e) => updateAddressField("streetAddress", e.target.value)}
                />
              </div>
            </div>

            <div className="cqem-row">
              <div className="cqem-field-block">
                <label className="cqem-block-label">
                  Send invoices by <span className="cqem-tooltip-icon">?</span>
                </label>
                <div className="cqem-radio-group">
                  {DELIVERY_METHODS.map(([value, label]) => (
                    <label className="cqem-radio-option" key={value}>
                      <input
                        type="radio"
                        name="cqem-sendBy"
                        checked={formData.settings.invoiceDeliveryMethod === value}
                        onChange={() => updateSettingsField("invoiceDeliveryMethod", value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="cqem-checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.settings.emailAttachPdf}
                    onChange={(e) => updateSettingsField("emailAttachPdf", e.target.checked)}
                  />
                  Always attach a PDF copy in emails <span className="cqem-tooltip-icon">?</span>
                </label>
              </div>

              <div className="cqem-row cqem-row-tight">
                <div className="cqem-field">
                  <label>Zip code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateAddressField("zipCode", e.target.value)}
                  />
                </div>
                <div className="cqem-field">
                  <label>City</label>
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
                <label>Country</label>
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
                {saving ? "Updating..." : "Update client"}
              </button>
              <button className="cqem-btn-outline" onClick={onClose} disabled={saving}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}