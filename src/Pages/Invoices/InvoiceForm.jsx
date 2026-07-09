import React from "react";
import "./InvoiceForm.css";

const SidebarItem = ({ title, active }) => (
  <div className={`sidebar-item ${active ? "active" : ""}`}>
    <span>{title}</span>
  </div>
);

export default function InvoiceForm() {
  return (
    <div className="invoice-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img
            src="https://dummyimage.com/90x60/0d3046/ffffff&text=F"
            alt="logo"
          />
        </div>

        <div className="sidebar-menu">
          <SidebarItem title="Overview" />
          <SidebarItem title="Clients" />
          <SidebarItem title="Invoices" active />
          <SidebarItem title="Estimates" />
          <SidebarItem title="Orders" />
          <SidebarItem title="Products" />
          <SidebarItem title="Accounting" />
          <SidebarItem title="Statistics" />
          <SidebarItem title="Settings" />
        </div>

        <div className="sidebar-user">
          <div className="avatar">BY</div>
          <span>Bindu Y</span>
        </div>
      </aside>

      {/* Content */}
      <main className="content">
        <div className="page-title">
          New invoice (#1) to ABC
        </div>

        <div className="info-box">
          This is where you create new invoices. When you click on
          "Create Invoice" you will see what your invoice looks like.
          After that you can come back here to edit again if necessary.
        </div>

        {/* Form Card */}
        <div className="card">
          <div className="grid-row">
            <div className="field field-large">
              <label>Client</label>
              <input value="ABC" readOnly />
            </div>

            <div className="field">
              <label>Invoice no.</label>
              <input value="1" readOnly />
            </div>
          </div>

          <div className="grid-row five-cols">
            <div className="field">
              <label>Invoice date</label>
              <input value="2026-07-08" readOnly />
            </div>

            <div className="field">
              <label>Payment terms</label>
              <input value="30" readOnly />
            </div>

            <div className="field">
              <label>Due date</label>
              <input value="2026-08-07" readOnly />
            </div>

            <div className="field">
              <label>Your reference</label>
              <input />
            </div>

            <div className="field">
              <label>Our reference</label>
              <input value="Bindu Y" readOnly />
            </div>
          </div>

          <div className="options-row">
            <button className="pill-btn">
              Language: <strong>Swedish</strong>
            </button>

            <button className="pill-btn">
              Currency: <strong>SEK</strong>
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-card">
          <div className="table-header">
            <div>PRODUCT / SERVICE</div>
            <div>TEXT</div>
            <div>QUANTITY</div>
            <div>UNIT</div>
            <div>PRICE EXCL.</div>
            <div>VAT%</div>
            <div>DISCOUNT</div>
            <div>TOTAL EXCL.</div>
          </div>

          <div className="table-row">
            <input placeholder="Choose a product" />
            <input placeholder="Extra information" />
            <input defaultValue="1" />
            <input />
            <input defaultValue="0.0" />
            <input defaultValue="25%" />
            <input defaultValue="0%" />
            <div className="total-value">-</div>
          </div>

          <div className="bottom-section">
            <div className="actions">
              <button className="outline-btn">
                + New product row
              </button>

              <button className="outline-btn">
                + New text row
              </button>

              <button className="outline-btn">
                More options (ROT/RUT etc)
              </button>
            </div>

            <div className="summary">
              <div>
                <span>Net</span>
                <strong>0.00</strong>
              </div>

              <div>
                <span>VAT</span>
                <strong>0.00</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>0.00</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="footer-actions">
          <button className="create-btn">
            Create invoice
          </button>

          <button className="cancel-btn">
            Cancel
          </button>
        </div>

        {/* Footer */}
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