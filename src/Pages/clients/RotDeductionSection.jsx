import "./sections.css";

function RotDeductionSection() {
  return (
    <div className="section-block">
      <h3 className="section-title">Extra field for ROT deduction</h3>

      <div className="field-row">
        <div className="field">
          <label>Apartment designation</label>
          <input type="text" />
        </div>
        <div className="field">
          <label>Property designation</label>
          <input type="text" />
        </div>
      </div>

      <div className="field">
        <label>Assoc. corp ID no.</label>
        <input type="text" />
      </div>
    </div>
  );
}

export default RotDeductionSection;