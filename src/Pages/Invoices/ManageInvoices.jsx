import "./ManageInvoices.css";
import InvoiceForm from "../Invoices/InvoiceForm";

export default function ManageInvoices() {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">F</div>
        </div>

        <nav className="menu">
          <div className="menu-item">Overview</div>
          <div className="menu-item">Clients</div>
          <div className="menu-item active">Invoices</div>
          <div className="menu-item">Estimates</div>
          <div className="menu-item">Orders</div>
          <div className="menu-item">Products</div>
          <div className="menu-item">Accounting</div>
          <div className="menu-item">Statistics</div>
          <div className="menu-item">Settings</div>
        </nav>

        <div className="user">
          <div className="avatar">BY</div>
          <span>Bindu Y</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <div className="page-header">
          <h1>Invoices</h1>
        </div>

        <div className="toolbar">
          <div className="left-actions">
            <button className="btn btn-success">
              📄 New invoice
            </button>

            <button className="btn btn-outline">
              Report / export
            </button>
          </div>

          <div className="center-nav">
            <button>{"‹"}</button>
            <div className="month-box"></div>
            <button>{"›"}</button>
          </div>

          <div className="right-actions">
            <input
              type="text"
              value="2026-01-01"
              readOnly
              className="date-input"
            />
            <span>-</span>
            <input
              type="text"
              value="2026-12-31"
              readOnly
              className="date-input"
            />

            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />
          </div>
        </div>

        <div className="invoice-area">
          <div className="empty-state">
            <p>No invoices to show</p>

            <a href="/">
              Read more about invoices here.
            </a>
          </div>

          <div className="summary">
            All 0 in SEK: <strong>0,00 kr</strong> (incl. VAT:
            <strong> 0,00 kr</strong>) Net:
            <strong> 0,00 kr</strong>
          </div>
        </div>

        <footer className="footer">
          <span>♡ FAQ</span>
          <span>❓ Help</span>
          <span>✉ Email us</span>
          <span>☎ Ring oss</span>
          <span>🕒 Mon - Thu 09:00 - 12:00</span>
        </footer>

        <button className="help-btn">❓ Help</button>
      </main>
    </div>
  );
}