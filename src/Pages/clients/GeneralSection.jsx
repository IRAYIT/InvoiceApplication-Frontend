import "./sections.css";

function GeneralSection() {
  return (
    <div className="section-block">
      <h3 className="section-title">General</h3>

      <div className="radio-group">
        <label className="radio-option">
          <input type="radio" name="clientType" defaultChecked />
          Company
        </label>
        <label className="radio-option">
          <input type="radio" name="clientType" />
          Person
        </label>
      </div>

      <div className="field">
        <label>Company name</label>
        <input type="text" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Company reg. no.</label>
          <input type="text" />
        </div>
        <div className="field">
          <label>VAT no.</label>
          <input type="text" />
        </div>
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" />
      </div>

      <div className="field">
        <label>
          Send invoices by <span className="tooltip-icon">?</span>
        </label>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="sendBy" defaultChecked />
            Email
          </label>
          <label className="radio-option">
            <input type="radio" name="sendBy" />
            E-post + SMS
          </label>
          <label className="radio-option">
            <input type="radio" name="sendBy" />
            Letter
          </label>
          <label className="radio-option">
            <input type="radio" name="sendBy" />
            E-invoice
          </label>
        </div>
      </div>

      <label className="checkbox-row">
        <input type="checkbox" />
        Always attach a PDF copy in emails <span className="tooltip-icon">?</span>
      </label>
    </div>
  );
}

export default GeneralSection;