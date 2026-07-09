import React, { useState } from "react";

const BLUE = "#2f7fb8";
const BORDER = "#d7dde3";
const TEXT_DARK = "#33414f";

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: BLUE, cursor: "pointer", marginBottom: 10 }}>
      <span
        onClick={onChange}
        style={{
          width: 18,
          height: 18,
          borderRadius: 3,
          border: `1.5px solid ${checked ? BLUE : "#a9b4bf"}`,
          background: checked ? BLUE : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

function Radio({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: TEXT_DARK, cursor: "pointer" }}>
      <span
        onClick={onChange}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `1.5px solid ${checked ? BLUE : "#a9b4bf"}`,
          background: checked ? BLUE : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />}
      </span>
      {label}
    </label>
  );
}

export default function PrintCatalog() {
  const [fields, setFields] = useState({
    productCode: true,
    productService: true,
    unit: true,
    vat: true,
    priceRate: true,
  });
  const [vatMode, setVatMode] = useState("excl");
  const [sortBy, setSortBy] = useState("name");

  const toggleField = (key) => setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        margin: "0 32px 24px",
        background: "#fdf9ec",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "24px 28px",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: TEXT_DARK }}>Included fields</h3>

      <Checkbox label="Product code" checked={fields.productCode} onChange={() => toggleField("productCode")} />
      <Checkbox label="Product / Service" checked={fields.productService} onChange={() => toggleField("productService")} />
      <Checkbox label="Unit" checked={fields.unit} onChange={() => toggleField("unit")} />
      <Checkbox label="VAT %" checked={fields.vat} onChange={() => toggleField("vat")} />
      <Checkbox label="Price/Rate" checked={fields.priceRate} onChange={() => toggleField("priceRate")} />

      <div style={{ display: "flex", gap: 28, margin: "4px 0 20px 30px" }}>
        <Radio label="excl. VAT" checked={vatMode === "excl"} onChange={() => setVatMode("excl")} />
        <Radio label="incl. VAT" checked={vatMode === "incl"} onChange={() => setVatMode("incl")} />
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, marginBottom: 20 }} />

      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: TEXT_DARK }}>Sort by</h3>
      <div style={{ display: "flex", gap: 28, marginBottom: 20 }}>
        <Radio label="Name" checked={sortBy === "name"} onChange={() => setSortBy("name")} />
        <Radio label="Product code" checked={sortBy === "code"} onChange={() => setSortBy("code")} />
        <Radio label="Price/Rate" checked={sortBy === "price"} onChange={() => setSortBy("price")} />
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, marginBottom: 20 }} />

      <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{
            background: BLUE,
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Print product catalogue
        </button>
        <button
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT_DARK,
            cursor: "pointer",
          }}
        >
          Export as csv file
        </button>
        <button
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT_DARK,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}