import { useState, useEffect } from "react";
import ClientService from "../../services/ClientService";
import InvoicesService from "../../services/InvoicesService";
import PaymentModal from "../Invoices/PaymentModal";
import ManageInvoices from "../Invoices/ManageInvoices";
import EstimateService from "../../services/EstimateService";
import NotesService from "../../services/NoteService";
import ClientTodos from "./ClientTodo";
import "./ClientDetail.css";

const IconEstimate = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" />
    <rect x="5" y="4" width="14" height="18" rx="2" />
    <path d="M9 12h6M9 16h6M9 8h2" />
  </svg>
);

const IconOrder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 8 12 3 3 8l9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);
const IconTrash = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TABS = ["Invoices", "Estimates", "Orders", "Notes", "Todos", "Time reports"];

const ESTIMATE_STATUS_META = {
  SENT: {
    label: "Waiting answer",
    className: "cd-status-unanswered",
  },

  APPROVED: {
    label: "Accepted",
    className: "cd-status-approved",
  },

  REJECTED: {
    label: "Rejected",
    className: "cd-status-rejected",
  },

  COMPLETED: {
    label: "Completed",
    className: "cd-status-completed",
  },

  CONVERTED: {
    label: "Completed",
    className: "cd-status-completed",
  },

  DRAFT: {
    label: "Draft",
    className: "cd-status-draft",
  },
};

const ESTIMATE_STATUS_OPTIONS = [
  {
    value: "APPROVED",
    label: "Accepted",
    className: "cd-status-approved",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    className: "cd-status-rejected",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    className: "cd-status-completed",
  },
];

function ClientDetail({ clientId, onNavigate }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Invoices");
  const [invoices, setInvoices] = useState([]);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [sentInvoices, setSentInvoices] = useState({});
  const [estimates, setEstimates] = useState([]);
  const [openEstimateStatusId, setOpenEstimateStatusId] = useState(null);
  const [estimateDeleteError, setEstimateDeleteError] = useState(null);

  const [notes, setNotes] = useState([]);
  const [noteSearch, setNoteSearch] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const [noteForm, setNoteForm] = useState({
    subject: "",
    noteText: "",
  });

  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState(null);

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchInvoices();
      fetchEstimates();
      fetchNotes();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClientService.getClientById(clientId);
      setClient(data);
    } catch (err) {
      setError("Couldn't load this client. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await InvoicesService.getInvoicesByClientId(clientId);
  
      const list = Array.isArray(response.data) ? response.data : [];
  
      const mappedInvoices = list.map((invoice) => ({
        ...invoice,
        total: invoice.total ?? invoice.totalAmount ?? 0,
        vatAmount: invoice.vatAmount ?? invoice.taxAmount ?? 0,
        paid: invoice.paid ?? invoice.status === "PAID",
        sent:
          invoice.sent ??
          (invoice.status !== "DRAFT" && invoice.status !== "CANCELLED"),
      }));
  
      setInvoices(mappedInvoices);
    } catch (err) {
      console.error("Error fetching client invoices:", err);
      setInvoices([]);
    }
  };

  const fetchEstimates = async () => {
    try {
      const response =
        await EstimateService.getEstimatesByClientId(clientId);
  
      const list = Array.isArray(response.data)
        ? response.data
        : [];
  
      setEstimates(list);
    } catch (err) {
      console.error("Error fetching client estimates:", err);
      setEstimates([]);
    }
  };

  const fetchNotes = async (search = "") => {
    if (!clientId) return;

    try {
      setNoteLoading(true);
      setNoteError(null);

      const response =
        await NotesService.getNotesByClientId(
          clientId,
          search
        );

      const list = Array.isArray(response.data)
        ? response.data
        : [];

      setNotes(list);

    } catch (err) {
      console.error("Error fetching client notes:", err);
      setNotes([]);
      setNoteError("Couldn't load notes.");
    } finally {
      setNoteLoading(false);
    }
  };

  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;

    setNoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewNote = () => {
    setEditingNote(null);

    setNoteForm({
      subject: "",
      noteText: "",
    });

    setNoteError(null);
    setShowNoteForm(true);
  };

  const handleCancelNote = () => {
    setShowNoteForm(false);
    setEditingNote(null);

    setNoteForm({
      subject: "",
      noteText: "",
    });

    setNoteError(null);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);

    setNoteForm({
      subject: note.subject || "",
      noteText: note.noteText || "",
    });

    setNoteError(null);
    setShowNoteForm(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.subject.trim()) {
      setNoteError("Subject is required.");
      return;
    }

    if (!noteForm.noteText.trim()) {
      setNoteError("Note text is required.");
      return;
    }

    try {
      setNoteLoading(true);
      setNoteError(null);

      if (editingNote) {

        const response = await NotesService.updateNote(
          editingNote.id,
          {
            subject: noteForm.subject.trim(),
            noteText: noteForm.noteText,
          }
        );

        const updatedNote = response.data;

        setNotes((prev) =>
          prev.map((note) =>
            note.id === updatedNote.id
              ? updatedNote
              : note
          )
        );

        setExpandedNoteId(updatedNote.id);

      } else {

        const response = await NotesService.createNote(
          clientId,
          {
            subject: noteForm.subject.trim(),
            noteText: noteForm.noteText,
          }
        );

        const newNote = response.data;

        setNotes((prev) => [
          newNote,
          ...prev,
        ]);

        setExpandedNoteId(newNote.id);
      }

      setShowNoteForm(false);
      setEditingNote(null);

      setNoteForm({
        subject: "",
        noteText: "",
      });

    } catch (err) {
      console.error("Error saving note:", err);

      setNoteError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to save note."
      );

    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setNoteError(null);

      await NotesService.deleteNote(noteId);

      setNotes((prev) =>
        prev.filter((note) => note.id !== noteId)
      );

      if (expandedNoteId === noteId) {
        setExpandedNoteId(null);
      }

    } catch (err) {
      console.error("Error deleting note:", err);

      setNoteError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to delete note."
      );
    }
  };

  const formatNoteDate = (date) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "—";
    }

    return value.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNoteSearch = async (e) => {
    const value = e.target.value;

    setNoteSearch(value);

    await fetchNotes(value);
  };

  const handleEstimateStatusChange = async (estimate, newStatus) => {
    setOpenEstimateStatusId(null);
  
    try {
      let response;
  
      if (newStatus === "APPROVED") {
        response = await EstimateService.approveEstimate(estimate.id);
      } else if (newStatus === "REJECTED") {
        response = await EstimateService.rejectEstimate(estimate.id);
      } else if (newStatus === "COMPLETED") {
        response = await EstimateService.convertToInvoice(estimate.id);
      }
  
      const returnedStatus = response?.data?.status;
  
      setEstimates((prev) =>
        prev.map((item) =>
          item.id === estimate.id
            ? {
                ...item,
                status:
                  returnedStatus === "CONVERTED"
                    ? "COMPLETED"
                    : returnedStatus || newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating estimate status:", err);
  
      alert(
        err?.response?.data?.message ||
          "Failed to update estimate status."
      );
    }
  };

  const handleDeleteEstimate = async (id) => {
    try {
      setEstimateDeleteError(null);
  
      await EstimateService.deleteEstimate(id);
  
      setEstimates((prev) =>
        prev.filter((estimate) => estimate.id !== id)
      );
    } catch (err) {
      console.error("Error deleting estimate:", err);
  
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "This estimate cannot be deleted.";
  
      setEstimateDeleteError(message);
    }
  };
  
  const handlePaidCheckbox = (invoice) => {
    if (invoice.paid) return;
  
    setPaymentModalInvoice(invoice);
  };

  const handlePaymentSaved = (summary) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === summary.invoiceId
          ? {
              ...invoice,
              total: summary.invoiceTotal ?? invoice.total,
              totalAmount: summary.invoiceTotal ?? invoice.totalAmount,
              paid: summary.paid,
              status: summary.status,
              amountPaid: summary.totalPaid,
            }
          : invoice
      )
    );
  };

  const handleSentCheckbox = (invoice) => {
  setInvoices((prev) =>
    prev.map((item) =>
      item.id === invoice.id
        ? { ...item, sent: !item.sent }
        : item
    )
  );
};

  const getDisplayName = (c) => {
    if (!c) return "";
    return c.clientType === "company"
      ? c.company || "—"
      : `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
  };

  const getBillToLines = (c) => {
    const addr = c?.address;
    if (!addr) return [];
    return [addr.careOf, addr.streetAddress, addr.city, addr.country].filter(Boolean);
  };

  const getDeliveryMethodLabel = (method) => {
    const map = {
      email: "Email",
      epost_sms: "E-post + SMS",
      letter: "Letter",
      e_invoice: "E-invoice",
    };
    return map[method] || "Email";
  };

  if (loading) {
    return <div className="client-detail-page">Loading client...</div>;
  }

  if (error || !client) {
    return (
      <div className="client-detail-page">
        <p className="cd-error">{error || "Client not found."}</p>
        <button className="btn-outline" onClick={() => onNavigate && onNavigate("clients")}>
          Back to clients
        </button>
      </div>
    );
  }

  return (
    <div className="client-detail-page">
      <h1 className="cd-title">
        Client #{client.id} - {getDisplayName(client)}
      </h1>

      <div className="cd-toolbar">
      <button
        className="btn-success"
        onClick={() =>
          onNavigate && onNavigate("newInvoice", client.id)
        }
      >
        New invoice
      </button>
      <button
          className="btn-success"
          onClick={() =>
            onNavigate && onNavigate("newEstimate", client.id)
          }
        >
          New estimate
        </button>
        <button className="btn-outline btn-accent">
          <IconOrder />
          New order
        </button>
        <div className="cd-search">
          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className="cd-body">
        {/* Left column */}
        <div className="cd-left">
          <h3 className="cd-section-heading">{getDisplayName(client)}</h3>

          <div className="cd-card">

        {/* Registration + Bill To */}
        <div className="cd-info-grid">
          {client.clientType === "company" ? (
            <>
              <div>
                <p className="cd-label">Company registration number</p>
                <p className="cd-value">
                  {client.companyRegNo || "—"}
                </p>

                <p className="cd-label cd-label-gap">VAT no.</p>
                <p className="cd-value">
                  {client.vatNo || "—"}
                </p>
              </div>

              <div>
                <p className="cd-label">Bill to</p>

                {getBillToLines(client).length > 0 ? (
                  getBillToLines(client).map((line, i) => (
                    <p className="cd-value" key={i}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="cd-value">—</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="cd-label">Personal id no.</p>
                <p className="cd-value">
                  {client.personalIdNo || "—"}
                </p>
              </div>

              <div>
                <p className="cd-label">Bill to</p>

                {getBillToLines(client).length > 0 ? (
                  getBillToLines(client).map((line, i) => (
                    <p className="cd-value" key={i}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="cd-value">—</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="cd-divider" />

        {/* Email */}
        <p className="cd-label">Email</p>

        <a
          href={`mailto:${client.email}`}
          className="cd-email-link"
        >
          {client.email || "—"}
        </a>

        <div className="cd-divider" />

        {/* Contact information + Send invoices by */}
        <div className="cd-info-grid">

          <div>
            <p className="cd-label">Contact information</p>

            {client.phone && (
              <p className="cd-value cd-contact-link">
                ☎ {client.phone}
              </p>
            )}

            {client.phoneMobile && (
              <p className="cd-value cd-contact-link">
                ☎ {client.phoneMobile}
              </p>
            )}

            {client.phoneHome && (
              <p className="cd-value cd-contact-link">
                ☎ {client.phoneHome}
              </p>
            )}

            {client.fax && (
              <p className="cd-value cd-contact-link">
                {client.fax}
              </p>
            )}
          </div>

          <div>
            <p className="cd-label">Send invoices by</p>

            <p className="cd-value">
              {getDeliveryMethodLabel(
                client.settings?.invoiceDeliveryMethod
              )}
            </p>
          </div>

        </div>

        <div className="cd-divider" />

        {/* Payment terms + Language */}
        <div className="cd-info-grid">

          <div>
            <p className="cd-label">Payment terms</p>
            <p className="cd-value">
            {client.invoiceSettings?.paymentTermsDays ?? "—"}
            </p>
          </div>

          <div>
            <p className="cd-label">Language</p>
            <p className="cd-value">
            {client.invoiceSettings?.invoiceLanguage ?? "—"}
            </p>
          </div>

        </div>

        {/* Currency + VAT */}
        <div className="cd-info-grid cd-detail-row">

          <div>
            <p className="cd-label">Currency</p>
            <p className="cd-value">
            {client.invoiceSettings?.currency ?? "—"}
            </p>
          </div>

          <div>
            <p className="cd-label">VAT for new rows</p>
            <p className="cd-value">
            {client.invoiceSettings?.defaultVatPercent ?? "—"}%
            </p>
          </div>

        </div>

        {/* Discount + Property designation */}
        <div className="cd-info-grid cd-detail-row">

          <div>
            <p className="cd-label">Discount</p>
            <p className="cd-value">
            {client.invoiceSettings?.defaultDiscountPercent ?? 0}%
            </p>
          </div>

          <div>
            <p className="cd-label">Property designation</p>
            <p className="cd-value">
            {client.rotInfo?.propertyDesignation ?? "—"}
            </p>
          </div>

        </div>

        {/* Associated company + Apartment */}
        <div className="cd-info-grid cd-detail-row">

          <div>
            <p className="cd-label">
              Assoc. company registration number
            </p>

            <p className="cd-value">
            {client.rotInfo?.assocCorpIdNo ?? "—"}
            </p>
          </div>

          <div>
            <p className="cd-label">Apartment designation</p>

            <p className="cd-value">
            {client.rotInfo?.apartmentDesignation ?? "—"}
            </p>
          </div>

        </div>

        {/* Edit */}
        <div className="cd-edit-row">
          <button
            className="btn-outline"
            onClick={() =>
              onNavigate &&
              onNavigate("editClient", client.id)
            }
          >
            Edit
          </button>
        </div>

      </div>

          <h3 className="cd-section-heading">Contacts</h3>
          <div className="cd-card">
            <button className="btn-outline" disabled>
              New contact
            </button>
          </div>

          <h3 className="cd-section-heading">Custom extra fields</h3>
          <div className="cd-card">
            <p className="cd-muted-text">
              Custom fields for this client aren't set up yet.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="cd-right">
          <div className="cd-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`cd-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Invoices" ? (
            <>
              <table className="cd-invoice-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Total</th>
                    <th>Due date</th>
                    <th>Paid</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>
                            <a
                              href="#invoice"
                              className="client-link"
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate && onNavigate("viewInvoice", invoice.id);
                              }}
                            >
                              {invoice.invoiceNumber}
                            </a>
                          </td>

                          <td>
                            {Number(invoice.totalAmount ?? invoice.total ?? 0).toLocaleString(
                              "sv-SE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            {invoice.currency}
                          </td>

                          <td>{invoice.dueDate || "—"}</td>

                          <td>
                            <input
                              type="checkbox"
                              checked={!!invoice.paid}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePaidCheckbox(invoice);
                              }}
                              onChange={() => {}}
                            />
                          </td>

                          <td>
                            <input
                              type="checkbox"
                              checked={!!invoice.sent}
                              onChange={() => handleSentCheckbox(invoice)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="cd-empty-row">
                          No invoices yet for this client.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
              <div className="cd-totals">

                <div className="cd-total-section">
                  <h3>Total this year</h3>

                  <p>
                    {invoices.length} invoices in{" "}
                    <strong>
                      {invoices[0]?.currency || client.currency || ""}
                    </strong>
                    :{" "}
                    <strong>
                      {invoices
                        .reduce(
                          (sum, invoice) =>
                            sum +
                            Number(
                              invoice.totalAmount ??
                              invoice.total ??
                              0
                            ),
                          0
                        )
                        .toLocaleString("sv-SE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </strong>{" "}
                    {invoices[0]?.currency || client.currency || ""}
                  </p>
                </div>

                <div className="cd-total-section">
                  <h3>Running total</h3>

                  <p>
                    {invoices.length} invoices in{" "}
                    <strong>
                      {invoices[0]?.currency || client.currency || ""}
                    </strong>
                    :{" "}
                    <strong>
                      {invoices
                        .reduce(
                          (sum, invoice) =>
                            sum +
                            Number(
                              invoice.totalAmount ??
                              invoice.total ??
                              0
                            ),
                          0
                        )
                        .toLocaleString("sv-SE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </strong>{" "}
                    {invoices[0]?.currency || client.currency || ""}
                  </p>
                </div>

              </div>
            </>
                    ) : activeTab === "Estimates" ? (
                      <table className="cd-invoice-table cd-estimate-table">
                    
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Total</th>
                            <th>Valid until</th>
                            <th>Sent</th>
                            <th>Status</th>
                            <th className="cd-estimate-action-header"></th>
                          </tr>
                        </thead>
                    
                        <tbody>
                    
                          {estimates.length > 0 ? (
                    
                            estimates.map((estimate) => {
                    
                              const statusKey = estimate.status || "DRAFT";
                    
                              const statusMeta =
                                ESTIMATE_STATUS_META[statusKey] ||
                                ESTIMATE_STATUS_META.DRAFT;
                    
                              return (
                                <tr key={estimate.id}>
                    
                                  {/* Estimate number */}
                                  <td>
                                    <a
                                      href="#estimate"
                                      className="client-link"
                                      onClick={(e) => {
                                        e.preventDefault();
                    
                                        onNavigate &&
                                          onNavigate(
                                            "estimateDetail",
                                            estimate.id
                                          );
                                      }}
                                    >
                                      {estimate.estimateNumber}
                                    </a>
                                  </td>
                    
                                  {/* Total */}
                                  <td>
                                    {Number(
                                      estimate.total ??
                                      estimate.totalAmount ??
                                      0
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                    {estimate.currency || client.invoiceSettings?.currency || ""}
                                  </td>
                    
                                  {/* Valid until */}
                                  <td>
                                    {estimate.validUntil || "—"}
                                  </td>
                    
                                  {/* Sent */}
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={!!estimate.sentAt}
                                      readOnly
                                    />
                                  </td>
                    
                                  {/* Status */}
                                  <td className="cd-estimate-status-cell">
                    
                                    <div className="cd-estimate-status-wrapper">
                    
                                      <button
                                        type="button"
                                        className={`cd-estimate-status-btn ${statusMeta.className}`}
                                        onClick={() =>
                                          setOpenEstimateStatusId(
                                            (prev) =>
                                              prev === estimate.id
                                                ? null
                                                : estimate.id
                                          )
                                        }
                                      >
                    
                                        <span>
                                          {statusMeta.label}
                                        </span>
                    
                                        <span className="cd-status-arrow">
                                          {openEstimateStatusId === estimate.id
                                            ? "▲"
                                            : "▼"}
                                        </span>
                    
                                      </button>
                    
                                      {openEstimateStatusId === estimate.id && (
                    
                                        <div className="cd-estimate-status-dropdown">
                    
                                          {ESTIMATE_STATUS_OPTIONS.map(
                                            (option) => (
                    
                                              <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                  handleEstimateStatusChange(
                                                    estimate,
                                                    option.value
                                                  )
                                                }
                                              >
                    
                                                <span
                                                  className={`cd-status-dot ${option.className}`}
                                                />
                    
                                                <span>
                                                  {option.label}
                                                </span>
                    
                                              </button>
                    
                                            )
                                          )}
                    
                                        </div>
                    
                                      )}
                    
                                    </div>
                    
                                  </td>
                    
                                  {/* Delete */}
                                  <td className="cd-estimate-action-cell">
                    
                                    <button
                                      type="button"
                                      className="cd-estimate-delete-btn"
                                      title="Delete estimate"
                                      onClick={() =>
                                        handleDeleteEstimate(
                                          estimate.id
                                        )
                                      }
                                    >
                                      <IconTrash />
                                    </button>
                    
                                  </td>
                    
                                </tr>
                              );
                            })
                    
                          ) : (
                    
                            <tr>
                              <td
                                colSpan="6"
                                className="cd-empty-row"
                              >
                                No estimates yet for this client.
                              </td>
                            </tr>
                    
                          )}
                    
                        </tbody>
                    
                      </table>
                    ) : activeTab === "Notes" ? (
    <div className="cd-notes">

        <div className="cd-notes-toolbar">
            <button
                type="button"
                className="btn-success"
                onClick={handleNewNote}
            >
                New note
            </button>

            <div className="cd-notes-search">
                <input
                    type="text"
                    placeholder="Search"
                    value={noteSearch}
                    onChange={handleNoteSearch}
                />
            </div>
        </div>

        {showNoteForm && (
            <div className="cd-note-form">
                <h3>{editingNote ? "Edit note" : "New note"}</h3>

                {noteError && (
                    <p className="cd-note-error">{noteError}</p>
                )}

                <div className="cd-note-form-group">
                    <label>Subject</label>
                    <input
                        type="text"
                        name="subject"
                        value={noteForm.subject}
                        onChange={handleNoteInputChange}
                        placeholder="Subject"
                    />
                </div>

                <div className="cd-note-form-group">
                    <label>Note text</label>
                    <textarea
                        name="noteText"
                        value={noteForm.noteText}
                        onChange={handleNoteInputChange}
                        placeholder="Note text"
                        rows="6"
                    />
                </div>

                <div className="cd-note-form-actions">
                    <button
                        type="button"
                        className="btn-success"
                        onClick={handleSaveNote}
                        disabled={noteLoading}
                    >
                        {noteLoading
                            ? "Saving..."
                            : editingNote
                            ? "Update note"
                            : "Create note"}
                    </button>

                    <button
                        type="button"
                        className="btn-outline"
                        onClick={handleCancelNote}
                        disabled={noteLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {!showNoteForm && (
            <div className="cd-notes-list">

                {noteError && (
                    <p className="cd-note-error">{noteError}</p>
                )}

                {noteLoading ? (
                    <p className="cd-muted-text">Loading notes...</p>
                ) : notes.length > 0 ? (
                    <table className="cd-invoice-table cd-notes-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Last Modified</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {notes.map((note) => (
                                <tr key={note.id}>
                                    <td>
                                        <button
                                            type="button"
                                            className="cd-note-subject"
                                            onClick={() =>
                                                setExpandedNoteId((prev) =>
                                                    prev === note.id
                                                        ? null
                                                        : note.id
                                                )
                                            }
                                        >
                                            {note.subject}
                                        </button>

                                        {expandedNoteId === note.id && (
                                            <div className="cd-note-expanded">
                                                <div className="cd-note-text">
                                                    {note.noteText}
                                                </div>

                                                <div className="cd-note-dates">
                                                    <div>
                                                        Created{" "}
                                                        {formatNoteDate(
                                                            note.createdAt
                                                        )}
                                                    </div>

                                                    <div>
                                                        Latest update at{" "}
                                                        {formatNoteDate(
                                                            note.updatedAt
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-outline cd-note-edit-btn"
                                                    onClick={() =>
                                                        handleEditNote(note)
                                                    }
                                                >
                                                    Edit note
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                    <td>
                                        {formatNoteDate(note.updatedAt)}
                                    </td>

                                    <td className="cd-note-action-cell">
                                        <button
                                            type="button"
                                            className="cd-estimate-delete-btn"
                                            title="Delete note"
                                            onClick={() =>
                                                handleDeleteNote(note.id)
                                            }
                                        >
                                            <IconTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="cd-muted-text">
                        No notes yet for this client.
                    </p>
                )}
            </div>
        )}

    </div>
        ) : activeTab === "Todos" ? (
          <ClientTodos clientId={clientId} />
        ) : (
            <p className="cd-muted-text">
                {activeTab} aren't available yet.
            </p>
        )}
        </div>
      </div>

      {paymentModalInvoice && (
        <PaymentModal
          invoice={paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          onSaved={(summary) => {
            handlePaymentSaved(summary);
            setPaymentModalInvoice(null);
          }}
        />
      )}

      {/* Estimate delete error popup */}
      {estimateDeleteError && (
        <div className="cd-error-modal-overlay">
          <div className="cd-error-modal">

            <button
              type="button"
              className="cd-error-modal-close"
              onClick={() => setEstimateDeleteError(null)}
            >
              ×
            </button>

            <div className="cd-error-modal-icon">
              !
            </div>

            <h3>Unable to delete estimate</h3>

            <p>{estimateDeleteError}</p>

            <button
              type="button"
              className="cd-error-modal-ok"
              onClick={() => setEstimateDeleteError(null)}
            >
              OK
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDetail;