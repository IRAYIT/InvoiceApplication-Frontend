import "./sections.css";

function ClientInfoSection() {
  return (
    <div className="section-block">
      <h3 className="section-title">Client information</h3>

      <div className="field">
        <label>
          Number <span className="tooltip-icon">?</span>
        </label>
        <input type="text" defaultValue="2" />
      </div>
    </div>
  );
}

export default ClientInfoSection;