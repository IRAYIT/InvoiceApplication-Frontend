
import { useState } from "react";
import "./ClientForm.css";

import GeneralSection from "./GeneralSection";
import AddressSection from "./AddressSection";
import ContactSection from "./ContactSection";
import InvoiceSettingsSection from "./InvoiceSettingsSection";
import ClientInfoSection from "./ClientInfoSection";
import RotDeductionSection from "./RotDeductionSection";

function ClientForm() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="client-form-wrapper">

      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn-success">New client</button>

        <button className="btn-outline">Print list of clients</button>

        <div className="search-box">
          <input type="text" placeholder="Search" />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="client-card">

        {/* Top Grid */}
        <div className="top-grid">
          <GeneralSection />
          <AddressSection />
        </div>

        {showDetails && (
          <>
            <div className="section-divider" />

            {/* Middle Grid */}
            <div className="middle-grid">
              <ContactSection />
              <InvoiceSettingsSection />
            </div>

            <div className="section-divider" />

            {/* Bottom Grid */}
            <div className="bottom-grid">
              <ClientInfoSection />
              <RotDeductionSection />
            </div>
          </>
        )}

        <div className="section-divider" />

        <div className="detailed-settings-toggle">
          <button
            type="button"
            className="toggle-link"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide detailed settings" : "Show detailed settings"}
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button className="btn-success">Create client</button>
          <button className="btn-outline">Cancel</button>
        </div>

      </div>
    </div>
  );
}

export default ClientForm;