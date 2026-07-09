import "./sections.css";

function ContactSection() {
  return (
    <div className="section-block">
      <h3 className="section-title">Contact information</h3>

      <div className="field">
        <label>Website</label>
        <input type="text" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Phone</label>
          <input type="tel" />
        </div>
        <div className="field">
          <label>Phone (mobile)</label>
          <input type="tel" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Phone (home)</label>
          <input type="tel" />
        </div>
        <div className="field">
          <label>Fax</label>
          <input type="text" />
        </div>
      </div>
    </div>
  );
}

export default ContactSection;