import { useState, useEffect } from "react";
import ClientService from "../../services/ClientService";
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

const TABS = ["Invoices", "Estimates", "Orders", "Notes", "Todos", "Time reports"];

function ClientDetail({ clientId, onNavigate }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Invoices");

  useEffect(() => {
    if (clientId) fetchClient();
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
        <button className="btn-success" onClick={() => onNavigate && onNavigate("newInvoice")}>
          New invoice
        </button>
        <button className="btn-outline btn-accent">
          <IconEstimate />
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
            <div className="cd-info-grid">
              {client.clientType === "company" ? (
                <>
                  <div>
                    <p className="cd-label">Company registration number</p>
                    <p className="cd-value">{client.companyRegNo || "—"}</p>
                    <p className="cd-label" style={{ marginTop: "10px" }}>VAT no.</p>
                    <p className="cd-value">{client.vatNo || "—"}</p>
                  </div>
                  <div>
                    <p className="cd-label">Bill to</p>
                    {getBillToLines(client).length > 0 ? (
                      getBillToLines(client).map((line, i) => (
                        <p className="cd-value" key={i}>{line}</p>
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
                    <p className="cd-value">{client.personalIdNo || "—"}</p>
                  </div>
                  <div>
                    <p className="cd-label">Bill to</p>
                    {getBillToLines(client).length > 0 ? (
                      getBillToLines(client).map((line, i) => (
                        <p className="cd-value" key={i}>{line}</p>
                      ))
                    ) : (
                      <p className="cd-value">—</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="cd-divider" />

            <p className="cd-label">Email</p>
            <a href={`mailto:${client.email}`} className="cd-email-link">
              {client.email || "—"}
            </a>

            <div className="cd-divider" />

            <div className="cd-send-row">
              <div>
                <p className="cd-label">Send invoices by</p>
                <p className="cd-value">
                  {getDeliveryMethodLabel(client.settings?.invoiceDeliveryMethod)}
                </p>
              </div>
              <button
  className="btn-outline"
  onClick={() => onNavigate && onNavigate("editClient", client.id)}
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
                  <tr>
                    <td colSpan="5" className="cd-empty-row">
                      No invoices yet for this client.
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="cd-muted-text">{activeTab} aren't available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;