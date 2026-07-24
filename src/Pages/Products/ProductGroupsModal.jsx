import React, { useEffect, useState } from "react";
import ProductService from "../../services/ProductsService";
import "./ProductGroupsModal.css";

export default function ProductGroupsModal({ groups, onClose, onGroupsChanged }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Refresh in case groups changed elsewhere since this modal opened
    ProductService.getAllProductGroups()
      .then(({ data }) => onGroupsChanged(data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await ProductService.createProductGroup({ name: trimmed });
      const { data } = await ProductService.getAllProductGroups();
      onGroupsChanged(data);
      setName("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add group.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProductGroup(id);
      const { data } = await ProductService.getAllProductGroups();
      onGroupsChanged(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete group.");
    }
  };

  return (
    <div className="pg-modal-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Product groups</h2>

        <div className="pg-modal-add-row">
          <input
            type="text"
            placeholder="New group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !name.trim()}>
            Add
          </button>
        </div>

        {error && <div className="pg-modal-error">{error}</div>}

        <ul className="pg-modal-list">
          {groups.length === 0 && <li className="pg-modal-empty">No product groups yet.</li>}
          {groups.map((g) => (
            <li key={g.id}>
              <span>{g.name}</span>
              <button className="pg-modal-delete" onClick={() => handleDelete(g.id)} aria-label={`Delete ${g.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="pg-modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}