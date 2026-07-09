import React, { useState } from "react";
import {
  Home,
  User,
  FileText,
  ClipboardList,
  Package,
  BookOpen,
  PieChart,
  Settings,
  Search,
  ChevronDown,
  HelpCircle,
  Heart,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const NAVY = "#1c2b3a";
const NAVY_ACTIVE = "#2c3e50";
const ACCENT_BLUE = "#2f7fb8";
const GREEN = "#4caf3f";
const TEXT_MUTED = "#5b6b7a";
const BORDER = "#d7dde3";

const navItems = [
  { label: "Overview", icon: Home },
  { label: "Clients", icon: User },
  { label: "Invoices", icon: FileText },
  { label: "Estimates", icon: ClipboardList },
  { label: "Orders", icon: ClipboardList },
  { label: "Products", icon: Package, active: true },
  { label: "Accounting", icon: BookOpen },
  { label: "Statistics", icon: PieChart },
  { label: "Settings", icon: Settings },
];

function Sidebar() {
  return (
    <div style={{ width: 224, minWidth: 224, background: NAVY, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 20px 20px" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            background: "linear-gradient(135deg, #e8734a, #f2a24a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          F
        </div>
      </div>

      <nav style={{ flex: 1, padding: "4px 8px" }}>
        {navItems.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 6,
              marginBottom: 2,
              background: active ? NAVY_ACTIVE : "transparent",
              color: "white",
              fontWeight: active ? 600 : 400,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "white",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#3a4a5a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          BY
        </div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Bindu Y</span>
        <ChevronDown size={16} style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
}

function TopBar() {
  const [search, setSearch] = useState("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 32px 16px", flexWrap: "wrap" }}>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: GREEN,
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "12px 18px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <Package size={18} />
        New product or service
      </button>

      <button
        style={{
          background: "white",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: "12px 18px",
          fontSize: 15,
          fontWeight: 600,
          color: ACCENT_BLUE,
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
          padding: "12px 18px",
          fontSize: 15,
          fontWeight: 600,
          color: ACCENT_BLUE,
          cursor: "pointer",
        }}
      >
        Product groups
      </button>

      <HelpCircle size={18} color="#b7bfc7" />

      <div style={{ marginLeft: "auto", position: "relative" }}>
        <Search size={16} color="#9aa5b1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          style={{
            width: 260,
            padding: "10px 14px 10px 38px",
            borderRadius: 20,
            border: `1.5px solid ${ACCENT_BLUE}`,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function FieldLabel({ children, hint = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 14, color: "#33414f" }}>
      <span>{children}</span>
      {hint && (
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "1px solid #c3cbd3",
            color: "#9aa5b1",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ?
        </span>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 6,
  border: `1px solid ${BORDER}`,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: ACCENT_BLUE,
  fontWeight: 500,
};

function NewProductForm() {
  return (
    <div style={{ margin: "0 32px 24px", background: "white", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px" }}>
      <h3 style={{ margin: "0 0 14px", color: GREEN, fontSize: 17, fontWeight: 700 }}>Product information</h3>

      <div
        style={{
          background: "#eaf6e6",
          color: "#3f7a2f",
          borderRadius: 6,
          padding: "16px 20px",
          fontSize: 15,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        The products you add through this page speed up your billing process by making it easy to add items you use
        often. They act as a template, so all fields can be changed when you've added them to an invoice. Remember to
        click the help icon if you're unsure about what a field means.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 }}>
        <div>
          <FieldLabel>Name</FieldLabel>
          <input style={inputStyle} />
        </div>
        <div>
          <FieldLabel>Unit</FieldLabel>
          <input style={inputStyle} />
        </div>
        <div>
          <FieldLabel>Product code</FieldLabel>
          <input style={inputStyle} />
        </div>
        <div>
          <FieldLabel>Product group</FieldLabel>
          <select style={{ ...inputStyle, cursor: "pointer" }}>
            <option>- None -</option>
          </select>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "0 0 20px" }} />

      <h3 style={{ margin: "0 0 16px", color: GREEN, fontSize: 17, fontWeight: 700 }}>Pricing</h3>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ width: 160 }}>
          <FieldLabel>Price</FieldLabel>
          <input style={inputStyle} defaultValue="0.0" />
        </div>
        <div style={{ width: 160 }}>
          <FieldLabel>Tax</FieldLabel>
          <input style={inputStyle} defaultValue="25%" />
        </div>
        <div style={{ width: 160 }}>
          <FieldLabel>Price incl. tax</FieldLabel>
          <input style={inputStyle} defaultValue="0.0" />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "#33414f", paddingBottom: 11 }}>
          <input type="checkbox" style={{ width: 16, height: 16 }} />
          ROT / RUT / Green tech
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "1px solid #c3cbd3",
              color: "#9aa5b1",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ?
          </span>
        </label>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "0 0 20px" }} />

      <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{
            background: GREEN,
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create product
        </button>
        <button
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            color: "#33414f",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ProductsTable() {
  const columns = [
    { key: "name", label: "Product / service", sortable: true },
    { key: "code", label: "Product code" },
    { key: "price", label: "Price/rate" },
    { key: "unit", label: "Unit" },
    { key: "vat", label: "VAT %" },
  ];

  return (
    <div style={{ padding: "0 32px" }}>
      <div style={{ borderBottom: "1px solid #e2e6ea" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: "#3a4a5a",
                    padding: "10px 12px",
                    borderBottom: "1px solid #e2e6ea",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {col.sortable && <ChevronDown size={12} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div style={{ textAlign: "center", color: "#3a4a5a", fontSize: 16, padding: "48px 0" }}>No products to show</div>
    </div>
  );
}

function Footer() {
  const items = [
    { icon: Heart, label: "FAQ" },
    { icon: HelpCircle, label: "Help" },
    { icon: Mail, label: "Email us" },
    { icon: Phone, label: "Ring oss" },
  ];
  return (
    <div
      style={{
        marginTop: "auto",
        borderTop: "1px solid #e2e6ea",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        fontSize: 14,
        color: ACCENT_BLUE,
        flexWrap: "wrap",
      }}
    >
      {items.map(({ icon: Icon, label }) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={15} />
          {label}
        </span>
      ))}
      <span style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_MUTED }}>
        <Clock size={15} />
        Mon - Thu 09:00 - 12:00
      </span>
    </div>
  );
}

export default function ProductsPageWithForm() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
        background: "#f7f8fa",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 32px 8px" }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 400, color: ACCENT_BLUE }}>Products and services</h1>
        </div>
        <div style={{ borderBottom: "1px solid #e2e6ea", marginTop: 12 }} />

        <TopBar />
        <NewProductForm />
        <ProductsTable />

        <button
          aria-label="Help"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: NAVY,
            color: "white",
            border: "none",
            borderRadius: 24,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <HelpCircle size={18} />
          Help
        </button>

        <Footer />
      </div>
    </div>
  );
}