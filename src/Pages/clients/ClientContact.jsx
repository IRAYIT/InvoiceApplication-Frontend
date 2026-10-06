import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ClientContactService from "../../services/ClientContactService";

function ClientContact({ clientId }) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteContactId, setDeleteContactId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneMobile: "",
    phoneHome: "",
  });

  useEffect(() => {
    if (clientId) {
      fetchContacts();
    }
  }, [clientId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await ClientContactService.getContactsByClientId(clientId);

      setContacts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(t("clients.contacts.loadFailed")); 
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewContact = () => {
    setEditingContact(null);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneMobile: "",
      phoneHome: "",
    });

    setError(null);
    setShowForm(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);

    setForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      phoneMobile: contact.phoneMobile || "",
      phoneHome: contact.phoneHome || "",
    });

    setError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneMobile: "",
      phoneHome: "",
    });

    setError(null);
  };

  const handleSave = async () => {
    if (!form.firstName.trim()) {
      setError(t("clients.contacts.firstNameRequired"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingContact) {
        const response =
          await ClientContactService.updateContact(
            editingContact.id,
            form
          );

        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingContact.id
              ? response.data
              : contact
          )
        );
      } else {
        const response =
          await ClientContactService.createContact(
            clientId,
            form
          );

        setContacts((prev) => [
          ...prev,
          response.data,
        ]);
      }

      handleCancel();
    } catch (err) {
      console.error("Error saving contact:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          t("clients.contacts.saveFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    setDeleteContactId(contactId);
  };

  const confirmDelete = async () => {
    if (!deleteContactId) {
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      await ClientContactService.deleteContact(deleteContactId);
  
      setContacts((prev) =>
        prev.filter(
          (contact) => contact.id !== deleteContactId
        )
      );
  
      setDeleteContactId(null);
  
    } catch (err) {
      console.error("Error deleting contact:", err);
  
      setError(t("clients.contacts.deleteFailed"));
  
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="client-contacts">

      {/* Error message */}
      {error && (
        <p className="cd-note-error">
          {error}
        </p>
      )}

      {/* =========================
          CONTACT FORM
          ========================= */}
      {showForm && (
        <div className="cd-contact-form">

          <h3>
          {editingContact
              ? t("clients.contacts.editContact")
              : t("clients.contacts.newContact")}
          </h3>

          <div className="cd-contact-form-grid">

            {/* First Name */}
            <div className="cd-note-form-group">
            <label>{t("clients.form.firstName")}</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder={t("clients.form.firstName")}
              />
            </div>

            {/* Last Name */}
            <div className="cd-note-form-group">
            <label>{t("clients.form.lastName")}</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder={t("clients.form.lastName")}
              />
            </div>

            {/* Email */}
            <div className="cd-note-form-group">
            <label>{t("clients.form.email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t("clients.form.email")}
              />
            </div>

            {/* Phone */}
            <div className="cd-note-form-group">
            <label>{t("clients.contacts.phone")}</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t("clients.contacts.phone")}
              />
            </div>

            {/* Mobile */}
            <div className="cd-note-form-group">
            <label>{t("clients.contacts.mobilePhone")}</label>
              <input
                type="text"
                name="phoneMobile"
                value={form.phoneMobile}
                onChange={handleChange}
                placeholder={t("clients.contacts.mobilePhone")}
              />
            </div>

            {/* Home */}
            <div className="cd-note-form-group">
            <label>{t("clients.contacts.homePhone")}</label>
              <input
                type="text"
                name="phoneHome"
                value={form.phoneHome}
                onChange={handleChange}
                placeholder={t("clients.contacts.homePhone")}
              />
            </div>

          </div>

          {/* Form buttons */}
          <div className="cd-note-form-actions">

            <button
              type="button"
              className="btn-success"
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? t("common.saving")
                : editingContact
                ? t("clients.contacts.updateContact")
                : t("clients.contacts.createContact")}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={handleCancel}
              disabled={loading}
            >{t("common.cancel")}</button>
          </div>

        </div>
      )}

      {/* =========================
          CONTACT LIST
          ========================= */}
      {!showForm && (
        <div className="cd-contacts-wrapper">

          {loading ? (
            <p className="cd-muted-text">{t("clients.contacts.loading")}</p>
          ) : (
            <>
              {/* Contacts */}
              {contacts.length > 0 && (
                <div className="cd-contact-items">

                  {contacts.map((contact) => (
                    <div
                      className="cd-contact-item"
                      key={contact.id}
                    >

                      {/* Contact Details */}
                      <div className="cd-contact-details">

                        {/* Name */}
                        <div className="cd-contact-name">
                          {contact.firstName}{" "}
                          {contact.lastName}
                        </div>

                        {/* Email + Phone */}
                        <div className="cd-contact-row">

                          {/* Email */}
                          {contact.email && (
                            <span className="cd-contact-info">

                              <span className="cd-contact-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                  />
                                  <polyline points="3,7 12,13 21,7" />
                                </svg>
                              </span>

                              <span>
                                {contact.email}
                              </span>

                            </span>
                          )}

                          {/* Phone */}
                          {contact.phone && (
                            <span className="cd-contact-info">

                              <span className="cd-contact-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="5"
                                    y="2"
                                    width="14"
                                    height="20"
                                    rx="2"
                                  />
                                  <line
                                    x1="9"
                                    y1="6"
                                    x2="15"
                                    y2="6"
                                  />
                                  <line
                                    x1="9"
                                    y1="18"
                                    x2="15"
                                    y2="18"
                                  />
                                </svg>
                              </span>

                              <span>
                                {contact.phone}
                              </span>

                            </span>
                          )}

                        </div>

                        {/* Mobile + Home */}
                        <div className="cd-contact-row">

                          {/* Mobile */}
                          {contact.phoneMobile && (
                            <span className="cd-contact-info">

                              <span className="cd-contact-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L9 10.7a16 16 0 0 0 4.3 4.3l1.26-1.26a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z" />
                                </svg>
                              </span>

                              <span>
                                {contact.phoneMobile}
                              </span>

                            </span>
                          )}

                          {/* Home */}
                          {contact.phoneHome && (
                            <span className="cd-contact-info">

                              <span className="cd-contact-icon">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 11.5L12 4l9 7.5" />
                                  <path d="M5 10.5V20h14v-9.5" />
                                  <path d="M9 20v-6h6v6" />
                                </svg>
                              </span>

                              <span>
                                {contact.phoneHome}
                              </span>

                            </span>
                          )}

                        </div>

                      </div>

                      {/* Contact Actions */}
                    <div className="cd-contact-actions">

                    {/* Edit */}
                    <button
                    type="button"
                    className="cd-contact-edit"
                    onClick={() => handleEdit(contact)}
                    >{t("common.edit")}</button>

                    {/* Delete */}
                    <button
                    type="button"
                    className="cd-contact-delete"
                    onClick={() => handleDelete(contact.id)}
                    title={t("clients.contacts.deleteContact")}
                    >
                    ×
                    </button>

                    </div>

                    </div>
                  ))}

                </div>
              )}

              {/* Empty */}
              {contacts.length === 0 && (
                <p className="cd-muted-text">{t("clients.contacts.empty")}</p>
              )}

              {/* Divider */}
              <div className="cd-contact-divider" />

              {/* New Contact */}
              <button
                type="button"
                className="cd-new-contact-btn"
                onClick={handleNewContact}
              >{t("clients.contacts.newContact")}</button>

            </>
          )}

        </div>
      )}
      {/* Delete Confirmation Popup */}
{deleteContactId && (
  <div className="cd-delete-overlay">

    <div className="cd-delete-modal">

      <div className="cd-delete-icon">
        ×
      </div>

      <h3>{t("clients.contacts.deleteConfirmTitle")}</h3>

      <p>
        {t("clients.contacts.deleteConfirmText")}
        {t("clients.delete.warning")}
      </p>

      <div className="cd-delete-actions">

        <button
          type="button"
          className="cd-delete-cancel"
          onClick={() => setDeleteContactId(null)}
          disabled={loading}
        >{t("common.cancel")}</button>

        <button
          type="button"
          className="cd-delete-confirm"
          onClick={confirmDelete}
          disabled={loading}
        >
          {loading ? t("common.deleting") : t("common.delete")}
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default ClientContact;