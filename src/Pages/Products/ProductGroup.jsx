import React, { useState } from "react";
import { X } from "lucide-react";

const GREEN = "#4caf3f";
const BLUE = "#2f7fb8";
const BORDER = "#d7dde3";
const TEXT_DARK = "#33414f";
const HEADER_GRAY = "#3a4a5a";

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 6,
  border: `1px solid ${BORDER}`,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: TEXT_DARK,
};

export default function NewProductGroupModal({ onClose = () => {} }) {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [addToGroup, setAddToGroup] = useState("None");

  const handleCreate = () => {
    if (!groupName.trim()) return;
    setGroups((prev) => [...prev, groupName.trim()]);
    setGroupName("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 30, 40, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 560,
          maxWidth: "90vw",
          background: "white",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "white",
            padding: "20px 24px 16px",
          }}
        >
          <div
            style={{
              background: GREEN,
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              padding: "10px 18px",
              borderRadius: 6,
            }}
          >
            New product group
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: HEADER_GRAY,
              padding: 4,
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form panel */}
        <div style={{ background: "#fdf9ec", padding: "20px 24px", margin: "0 24px 20px", borderRadius: 6 }}>
          <label style={{ display: "block", fontSize: 14, color: TEXT_DARK, marginBottom: 8 }}>Group name</label>
          <input
            style={{ ...inputStyle, marginBottom: 20 }}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <label style={{ display: "block", fontSize: 14, color: TEXT_DARK, marginBottom: 8 }}>Add to group</label>
          <select
            style={{ ...inputStyle, marginBottom: 20, cursor: "pointer" }}
            value={addToGroup}
            onChange={(e) => setAddToGroup(e.target.value)}
          >
            <option value="None">- None -</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleCreate}
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
              Create product group
            </button>
            <button
              onClick={onClose}
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

        {/* Existing groups list */}
        <div>
          <div
            style={{
              padding: "10px 24px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.3,
              color: HEADER_GRAY,
              background: "#f7f8fa",
              textTransform: "uppercase",
            }}
          >
            Name
          </div>
          {groups.length === 0 ? (
            <div style={{ padding: "20px 24px", fontSize: 14, color: "#8a95a1" }}>No product groups yet.</div>
          ) : (
            groups.map((g) => (
              <div
                key={g}
                style={{
                  padding: "12px 24px",
                  fontSize: 14,
                  color: TEXT_DARK,
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                {g}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}