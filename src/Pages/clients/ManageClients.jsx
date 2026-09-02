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
  const [showPrintPanel, setShowPrintPanel] = useState(false);

  const [printFields, setPrintFields] = useState({
    number: true,
    name: true,
    companyRegistrationNumber: true,
    vatNo: true,
    phone: true,
    mobilePhone: true,
    phoneHome: true,
    fax: true,
    email: true,
    yourReference: true,
  
    addressCareOf: true,
    addressStreetAddress: true,
    addressZipCode: true,
    addressCity: true,
    addressCountry: true,
  
    deliveryCareOf: true,
    deliveryStreetAddress: true,
    deliveryZipCode: true,
    deliveryCity: true,
    deliveryCountry: true,
  
    contacts: false,
  });
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

  const handlePrintClick = () => {
    setShowPrintPanel(true);
  };

  const handleClientCreated = () => {
    setShowNewClientForm(false);
    fetchClients();
  };

  const handleOpenPrintOptions = () => {
    setShowPrintOptions((prev) => !prev);
  };

  const handlePrintOptionChange = (field) => {
    setPrintFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePrintClients = () => {
    const selectedFields = Object.keys(printFields).filter(
      (field) => printFields[field]
    );

    if (selectedFields.length === 0) {
      alert("Please select at least one field to print.");
      return;
    }

    const fieldLabels = {
      number: "Number",
      name: "Name",
      companyRegistrationNumber: "Company registration number",
      vatNo: "VAT no.",
      phone: "Phone",
      mobilePhone: "Mobile phone",
      phoneHome: "Phone (home)",
      fax: "Fax",
      email: "Email",
      yourReference: "Your reference",
    
      addressCareOf: "C/O",
      addressStreetAddress: "Address",
      addressZipCode: "Zip code",
      addressCity: "City",
      addressCountry: "Country",
    
      deliveryCareOf: "C/O",
      deliveryStreetAddress: "Delivery address street address",
      deliveryZipCode: "Delivery address zip code",
      deliveryCity: "Delivery address city",
      deliveryCountry: "Delivery address country",
    
      contacts: "Contacts",
    };

    const getFieldValue = (client, field) => {
      switch (field) {
        case "number":
          return client.number || client.id || "";
    
        case "name":
          return getClientDisplayName(client);
    
        case "companyRegistrationNumber":
          return client.companyRegNo || "";
    
        case "vatNo":
          return client.vatNo || "";
    
        case "phone":
          return client.phone || "";
    
        case "mobilePhone":
          return client.phoneMobile || "";
    
        case "phoneHome":
          return client.phoneHome || "";
    
        case "fax":
          return client.fax || "";
    
        case "email":
          return client.email || "";
    
        case "yourReference":
          return client.yourReference || "";
    
        case "addressCareOf":
          return client.address?.careOf || "";
    
        case "addressStreetAddress":
          return client.address?.streetAddress || "";
    
        case "addressZipCode":
          return client.address?.zipCode || "";
    
        case "addressCity":
          return client.address?.city || "";
    
        case "addressCountry":
          return client.address?.country || "";

        case "deliveryCareOf":
          return client.deliveryAddress?.careOf || "";
    
        case "deliveryStreetAddress":
          return client.deliveryAddress?.streetAddress || "";
    
        case "deliveryZipCode":
          return client.deliveryAddress?.zipCode || "";
    
        case "deliveryCity":
          return client.deliveryAddress?.city || "";
    
        case "deliveryCountry":
          return client.deliveryAddress?.country || "";
    
        case "contacts":
          return Array.isArray(client.contacts)
            ? client.contacts
                .map((contact) => contact.name || contact.email || "")
                .filter(Boolean)
                .join(", ")
            : "";
    
        default:
          return "";
      }
    };

    const escapeHtml = (value) => {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const headerHtml = selectedFields
      .map((field) => `<th>${fieldLabels[field]}</th>`)
      .join("");

    const rowsHtml = clients
      .map(
        (client) => `
          <tr>
            ${selectedFields
              .map(
                (field) =>
                  `<td>${escapeHtml(getFieldValue(client, field))}</td>`
              )
              .join("")}
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print the client list.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Client List</title>

          <style>
            @page {
              size: landscape;
              margin: 10mm;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 10px;
              color: #222;
            }

            h1 {
              text-align: center;
              margin: 0 0 20px;
              font-size: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: auto;
            }

            th,
            td {
              border: 1px solid #999;
              padding: 7px;
              text-align: left;
              vertical-align: top;
              font-size: 11px;
            }

            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }

            tr:nth-child(even) {
              background-color: #fafafa;
            }

            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>

        <body>
          <h1>Client list</h1>

          <table>
            <thead>
              <tr>
                ${headerHtml}
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      const printWindow = window.open("", "_blank");

if (!printWindow) {
  alert("Please allow pop-ups for this website.");
  return;
}

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Client list</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }

                h1 {
                  text-align: center;
                  font-size: 22px;
                  margin-bottom: 20px;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 12px;
                }

                th,
                td {
                  border: 1px solid #999;
                  padding: 6px;
                  text-align: left;
                }

                th {
                  font-weight: bold;
                  background: #f2f2f2;
                }
              </style>
            </head>

            <body>
              <h1>Client list</h1>

              <table>
                <thead>
                  <tr>
                    ${Object.keys(printFields)
                      .filter((field) => printFields[field])
                      .map((field) => `<th>${fieldLabels[field]}</th>`)
                      .join("")}
                  </tr>
                </thead>

                <tbody>
                  ${clients
                    .map(
                      (client) => `
                        <tr>
                          ${Object.keys(printFields)
                            .filter((field) => printFields[field])
                            .map(
                              (field) =>
                                `<td>${getFieldValue(client, field)}</td>`
                            )
                            .join("")}
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `);

      printWindow.document.close();
      printWindow.close();
    };
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

        <button
          className="btn-outline btn-print"
          onClick={handlePrintClick}
        >
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

        {showPrintPanel && (
          <div className="print-options">

            <h2>Included fields</h2>

            <div className="print-fields-grid">

              <label>
                <input
                  type="checkbox"
                  checked={printFields.number}
                  onChange={() => handlePrintOptionChange("number")}
                />
                <span>Number</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.name}
                  onChange={() => handlePrintOptionChange("name")}
                />
                <span>Name</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.companyRegistrationNumber}
                  onChange={() =>
                    handlePrintOptionChange("companyRegistrationNumber")
                  }
                />
                <span>Company registration number</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.vatNo}
                  onChange={() => handlePrintOptionChange("vatNo")}
                />
                <span>VAT no.</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.phone}
                  onChange={() => handlePrintOptionChange("phone")}
                />
                <span>Phone</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.mobilePhone}
                  onChange={() => handlePrintOptionChange("mobilePhone")}
                />
                <span>Mobile phone</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.phoneHome}
                  onChange={() => handlePrintOptionChange("phoneHome")}
                />
                <span>Phone (home)</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.fax}
                  onChange={() => handlePrintOptionChange("fax")}
                />
                <span>Fax</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.email}
                  onChange={() => handlePrintOptionChange("email")}
                />
                <span>Email</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.yourReference}
                  onChange={() => handlePrintOptionChange("yourReference")}
                />
                <span>Your reference</span>
              </label>

              {/* Main Address */}

              <label>
                <input
                  type="checkbox"
                  checked={printFields.addressCareOf}
                  onChange={() => handlePrintOptionChange("addressCareOf")}
                />
                <span>C/O</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.addressStreetAddress}
                  onChange={() =>
                    handlePrintOptionChange("addressStreetAddress")
                  }
                />
                <span>Address</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.addressZipCode}
                  onChange={() => handlePrintOptionChange("addressZipCode")}
                />
                <span>Zip code</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.addressCity}
                  onChange={() => handlePrintOptionChange("addressCity")}
                />
                <span>City</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.addressCountry}
                  onChange={() => handlePrintOptionChange("addressCountry")}
                />
                <span>Country</span>
              </label>

              {/* Delivery Address */}

              <label>
                <input
                  type="checkbox"
                  checked={printFields.deliveryCareOf}
                  onChange={() => handlePrintOptionChange("deliveryCareOf")}
                />
                <span>Delivery C/O</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.deliveryStreetAddress}
                  onChange={() =>
                    handlePrintOptionChange("deliveryStreetAddress")
                  }
                />
                <span>Delivery address street address</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.deliveryZipCode}
                  onChange={() =>
                    handlePrintOptionChange("deliveryZipCode")
                  }
                />
                <span>Delivery address zip code</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.deliveryCity}
                  onChange={() =>
                    handlePrintOptionChange("deliveryCity")
                  }
                />
                <span>Delivery address city</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.deliveryCountry}
                  onChange={() =>
                    handlePrintOptionChange("deliveryCountry")
                  }
                />
                <span>Delivery address country</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printFields.contacts}
                  onChange={() => handlePrintOptionChange("contacts")}
                />
                <span>Contacts</span>
              </label>

            </div>

            <div className="print-options-divider"></div>

            <div className="print-options-buttons">

              <button
                className="btn-print-selected"
                onClick={handlePrintClients}
              >
                <IconPrinter />
                Print list of clients
              </button>

              <button className="btn-export-csv">
                Export as csv file
              </button>

              <button
                className="btn-cancel-print"
                onClick={() => setShowPrintPanel(false)}
              >
                Cancel
              </button>

            </div>

          </div>
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
                          onNavigate &&
                            onNavigate("clientDetail", client.id);
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
                          onClick={(e) => {if (e.ctrlKey ||e.metaKey ||e.shiftKey ||e.button === 1) {
                              return;
                            }
                            e.preventDefault();

                            onNavigate &&
                              onNavigate(
                                "clientDetail",
                                client.id
                              );
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