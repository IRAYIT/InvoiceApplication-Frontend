import { useState } from "react";
import "./sections.css";

function AddressSection() {
  const [activeTab, setActiveTab] = useState("billing");

  return (
    <div className="section-block">
      <div className="address-tabs">
        <button
          type="button"
          className={`address-tab ${activeTab === "billing" ? "active" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          Billing address
        </button>
        <button
          type="button"
          className={`address-tab ${activeTab === "delivery" ? "active" : ""}`}
          onClick={() => setActiveTab("delivery")}
        >
          Delivery address
        </button>
      </div>

      <div className="field">
        <label>C/O</label>
        <input type="text" />
      </div>

      <div className="field">
        <label>Address</label>
        <input type="text" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Zip code</label>
          <input type="text" />
        </div>
        <div className="field">
          <label>City</label>
          <input type="text" />
        </div>
      </div>

      <div className="field">
        <label>Country</label>
        <select defaultValue="Sweden">
          <option>Sweden</option>
          <option>Norway</option>
          <option>Denmark</option>
          <option>Finland</option>
        </select>
      </div>
    </div>
  );
}

export default AddressSection;