import "./sections.css";

function InvoiceSettingsSection() {
  return (
    <div className="section-block">
      <h3 className="section-title">New invoice settings</h3>

      <div className="setting-row">
        <label className="setting-label">
          <input type="checkbox" />
          Payment terms
        </label>
        <div className="setting-input-wrap">
          <input type="text" defaultValue="30" />
          <span className="unit">days</span>
        </div>
      </div>

      <div className="setting-row">
        <label className="setting-label">
          <input type="checkbox" />
          Language
        </label>
        <div className="setting-input-wrap">
          <select defaultValue="Swedish">
            <option>Swedish</option>
            <option>English</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <label className="setting-label">
          <input type="checkbox" />
          Currency
        </label>
        <div className="setting-input-wrap">
          <select defaultValue="SEK">
            <option>SEK</option>
            <option>EUR</option>
            <option>USD</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <label className="setting-label">
          <input type="checkbox" />
          VAT for new rows
        </label>
        <div className="setting-input-wrap">
          <input type="text" defaultValue="25%" />
        </div>
      </div>

      <div className="setting-row">
        <label className="setting-label">
          <input type="checkbox" />
          Discount
        </label>
        <div className="setting-input-wrap">
          <input type="text" defaultValue="0%" />
        </div>
      </div>
    </div>
  );
}

export default InvoiceSettingsSection;