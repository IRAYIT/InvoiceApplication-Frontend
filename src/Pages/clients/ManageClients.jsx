import { useState, useEffect } from "react";
import ClientService from "../../services/ClientService";
import ClientForm from "./ClientForm";
import "./ManageClients.css";

// Simple inline icon components (no external deps)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconPrinter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const IconHelp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.9 2.2z" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function ManageClients({ onNavigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClientService.getAllClients();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getClientDisplayName = (client) => {
    if (client.clientType === "company") {
      return client.company || "—";
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const handleNewClientClick = () => {
    setShowNewClientForm((prev) => !prev);
  };

  const handleClientCreated = () => {
    setShowNewClientForm(false);
    fetchClients();
  };

  // Filters the client list by name, city, or email as the user types.
  // Case-insensitive, matches if the term appears anywhere in any of
  // those fields. An empty search term shows every client (no filtering).
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredClients = normalizedSearch
    ? clients.filter((client) => {
        const name = getClientDisplayName(client).toLowerCase();
        const city = (client.address?.city || "").toLowerCase();
        const email = (client.email || "").toLowerCase();
        return (
          name.includes(normalizedSearch) ||
          city.includes(normalizedSearch) ||
          email.includes(normalizedSearch)
        );
      })
    : clients;

  return (
    <div className="clients-page">
      <h1 className="page-title">Clients</h1>

      <div className="toolbar">
        <button className="btn-success" onClick={handleNewClientClick}>
          <IconUser />
          New client
        </button>
        <button className="btn-outline btn-print">
          <IconPrinter />
          Print list of clients
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Everything below the toolbar — the form (when open), the table,
          and the footer — shares ONE outer card so their left/right
          edges are guaranteed identical and they read as one continuous
          panel, instead of three separate boxes stacked with gaps
          between them. */}
      <div className="content-card">
        {showNewClientForm && (
          <ClientForm
            onCancel={() => setShowNewClientForm(false)}
            onCreated={handleClientCreated}
          />
        )}

        <div className="clients-table-card">
          <table className="clients-table">
            <thead>
              <tr>
                <th>#</th>
                <th>NAME</th>
                <th>CITY</th>
                <th>UPDATED <span className="sort-arrow">↑</span></th>
                <th>EMAIL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6">{error}</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    {normalizedSearch
                      ? `No clients match "${searchTerm}".`
                      : "No clients yet."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>
                      <a
                        href="#client"
                        className="link-cell"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate && onNavigate("clientDetail", client.id);
                        }}
                      >
                        {getClientDisplayName(client)}
                      </a>
                    </td>
                    <td>{client.address?.city || ""}</td>
                    <td>{formatDate(client.updatedAt)}</td>
                    <td>
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="link-cell"
                          onClick={(e) => {
                            // Plain left-click navigates to the client detail
                            // page, same as clicking the name. Ctrl/Cmd-click
                            // or middle-click still lets the browser open the
                            // mailto: link as usual (e.g. to open a new tab),
                            // since we only intercept the plain click case.
                            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
                              return;
                            }
                            e.preventDefault();
                            onNavigate && onNavigate("clientDetail", client.id);
                          }}
                        >
                          {client.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="row-actions">
                      <button className="row-menu-btn">
                        <IconGear />
                        <IconChevronDown />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="page-footer">
          <span><IconHeart /> FAQ</span>
          <span><IconHelp /> Help</span>
          <span><IconMail /> Email us</span>
          <span><IconPhone /> Ring oss</span>
          <span><IconClock /> Mon - Thu 09:00 - 12:00</span>
        </div>
      </div>
    </div>
  );
}

export default ManageClients;