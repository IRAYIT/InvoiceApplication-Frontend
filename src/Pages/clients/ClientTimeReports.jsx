import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TimeReportService from "../../services/TimeReportService";
import ProductService from "../../services/ProductsService";
import TodoService from "../../services/TodoService";
import "./ClientTimeReport.css";

const initialFormState = {
  note: "",
  productService: "",
  todoItem: "",
  hours: "0.00",
  startDateTime: "",
  endDateTime: "",
  invoiced: false,
  assignedTo: "Everybody",
};

function ClientTimeReports({ clientId }) {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  // Edit states
  const [editingReportId, setEditingReportId] = useState(null);
  const [editForm, setEditForm] = useState(initialFormState);

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, productsRes, todosRes] = await Promise.all([
        TimeReportService.getReportsByClientId(clientId),
        ProductService.getAllProducts(),
        TodoService.getTodosByClientId(clientId),
      ]);
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setTodos(Array.isArray(todosRes.data) ? todosRes.data : []);
    } catch (err) {
      console.error("Error loading time report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return "0.00";
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    if (diffMs <= 0) return "0.00";
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "startDateTime" || name === "endDateTime") {
        const start = name === "startDateTime" ? value : updated.startDateTime;
        const end = name === "endDateTime" ? value : updated.endDateTime;
        if (start && end) {
          updated.hours = calculateDuration(start, end);
        }
      }
      return updated;
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "startDateTime" || name === "endDateTime") {
        const start = name === "startDateTime" ? value : updated.startDateTime;
        const end = name === "endDateTime" ? value : updated.endDateTime;
        if (start && end) {
          updated.hours = calculateDuration(start, end);
        }
      }
      return updated;
    });
  };

  const calculateHoursMinutes = (decimalHours) => {
    const val = parseFloat(decimalHours) || 0;
    const totalMinutes = Math.round(val * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await TimeReportService.createReport(clientId, {
        ...formData,
        hours: parseFloat(formData.hours) || 0.0,
      });
      setReports((prev) => [response.data, ...prev]);
      setShowForm(false);
      setFormData(initialFormState);
    } catch (err) {
      console.error("Error creating time report:", err);
      alert(t("clients.timeReports.errors.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (report) => {
    setEditingReportId(report.id);
    setEditForm({
      note: report.note || "",
      productService: report.productService || "",
      todoItem: report.todoItem || "",
      hours: (Number(report.hours) || 0).toFixed(2),
      startDateTime: report.startDateTime || "",
      endDateTime: report.endDateTime || "",
      invoiced: !!report.invoiced,
      assignedTo: report.assignedTo || "Everybody",
    });
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditForm(initialFormState);
  };

  const handleSaveEdit = async (reportId) => {
    try {
      setLoading(true);
      const response = await TimeReportService.updateReport(reportId, {
        ...editForm,
        hours: parseFloat(editForm.hours) || 0.0,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? response.data : r))
      );
      setEditingReportId(null);
    } catch (err) {
      console.error("Error updating time report:", err);
      alert(t("clients.timeReports.errors.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Trigger popup
  const handleOpenDeleteModal = (report) => {
    setReportToDelete(report);
  };

  // Confirm delete from popup
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      await TimeReportService.deleteReport(reportToDelete.id);
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      if (editingReportId === reportToDelete.id) setEditingReportId(null);
      setReportToDelete(null);
    } catch (err) {
      console.error("Error deleting time report:", err);
    }
  };

  const handleToggleInvoiced = async (report) => {
    try {
      const nextVal = !report.invoiced;
      await TimeReportService.toggleInvoiced(report.id, nextVal);
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, invoiced: nextVal } : r))
      );
    } catch (err) {
      console.error("Error toggling invoiced:", err);
    }
  };

  const filteredReports = reports.filter((r) =>
    (r.note || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.todoItem || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cd-time-reports-tab">
      {/* Top Toolbar */}
      <div className="cd-tr-toolbar">
        <div className="cd-tr-toolbar-left">
          <button
            type="button"
            className="btn-success"
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditingReportId(null);
            }}
          >{t("clients.timeReports.newReport")}</button>
          <button type="button" className="btn-outline">{t("clients.timeReports.report")}</button>
        </div>

        <div className="cd-tr-search">
        <input
            type="text"
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Creation Box */}
      {showForm && (
        <div className="cd-tr-form-panel">
        <div className="cd-form-row">
          <label className="cd-label">{t("clients.timeReports.whatDone")}</label>
            <textarea
              name="note"
              className="cd-textarea"
              rows="4"
              value={formData.note}
              onChange={handleInputChange}
            />
          </div>

          <div className="cd-form-grid">
            <div>
              <label className="cd-label">{t("clients.todo.connectProduct")}</label>
              <select
                name="productService"
                className="cd-select"
                value={formData.productService}
                onChange={handleInputChange}
              >
                <option value="">{t("clients.todo.none")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="cd-label">{t("clients.timeReports.connectTodo")}</label>
              <select
                name="todoItem"
                className="cd-select"
                value={formData.todoItem}
                onChange={handleInputChange}
              >
                <option value="">{t("clients.todo.none")}</option>
                {todos.map((t) => (
                  <option key={t.id} value={t.description}>
                    {t.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cd-form-grid cd-mt-sm">
          <div>
          <label className="cd-label">{t("clients.timeReports.startDateTime")}</label>
              <input
                type="datetime-local"
                name="startDateTime"
                className="cd-input"
                value={formData.startDateTime}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="cd-label">{t("clients.timeReports.endDateTime")}</label>
              <input
                type="datetime-local"
                name="endDateTime"
                className="cd-input"
                value={formData.endDateTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="cd-form-grid cd-mt-sm">
          <div>
          <label className="cd-label">{t("clients.timeReports.hours")}</label>
              <input
                type="number"
                step="0.25"
                name="hours"
                className="cd-input"
                value={formData.hours}
                onChange={handleInputChange}
              />
            </div>
            <div className="cd-tr-hours-helper">
              <span className="cd-tr-hours-display">
                {calculateHoursMinutes(formData.hours)}
              </span>
              <span className="cd-muted-text">{t("clients.timeReports.autoCalc")}</span>
            </div>
          </div>

          <div className="cd-mt-sm">
            <label className="cd-checkbox-label">
              <input
                type="checkbox"
                name="invoiced"
                checked={formData.invoiced}
                onChange={handleInputChange}
              />{t("clients.timeReports.invoicedQ")}</label>
          </div>

          <div className="cd-form-actions cd-mt-md">
            <button
              type="button"
              className="btn-accent"
              onClick={handleCreate}
              disabled={loading}
            >{t("clients.timeReports.createReport")}</button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setShowForm(false);
                setFormData(initialFormState);
              }}
            >{t("common.cancel")}</button>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <table className="cd-invoice-table cd-tr-table">
        <thead>
          <tr>
          <th style={{ width: "90px" }}>{t("clients.timeReports.table.invoiced")}</th>
            <th>{t("clients.timeReports.table.todoItem")}</th>
            <th>{t("clients.timeReports.table.note")}</th>
            <th>{t("clients.timeReports.table.time")}</th>
            <th>{t("clients.timeReports.table.assignedTo")}</th>
            <th style={{ width: "40px" }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.length > 0 ? (
            filteredReports.map((r) => (
              <React.Fragment key={r.id}>
                {editingReportId === r.id ? (
                  <tr className="cd-tr-edit-row">
                    <td colSpan="6">
                    <div className="cd-tr-form-panel cd-tr-edit-panel">
                        <div className="cd-form-row">
                          <label className="cd-label">{t("clients.timeReports.whatDone")}</label>
                          <textarea
                            name="note"
                            className="cd-textarea"
                            rows="3"
                            value={editForm.note}
                            onChange={handleEditInputChange}
                          />
                        </div>

                        <div className="cd-form-grid">
                          <div>
                            <label className="cd-label">{t("clients.todo.connectProduct")}</label>
                            <select
                              name="productService"
                              className="cd-select"
                              value={editForm.productService}
                              onChange={handleEditInputChange}
                            >
                              <option value="">{t("clients.todo.none")}</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="cd-label">{t("clients.timeReports.connectTodo")}</label>
                            <select
                              name="todoItem"
                              className="cd-select"
                              value={editForm.todoItem}
                              onChange={handleEditInputChange}
                            >
                              <option value="">{t("clients.todo.none")}</option>
                              {todos.map((t) => (
                                <option key={t.id} value={t.description}>
                                  {t.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="cd-form-grid cd-mt-sm">
                          <div>
                            <label className="cd-label">{t("clients.timeReports.startDateTime")}</label>
                            <input
                              type="datetime-local"
                              name="startDateTime"
                              className="cd-input"
                              value={editForm.startDateTime}
                              onChange={handleEditInputChange}
                            />
                          </div>
                          <div>
                            <label className="cd-label">{t("clients.timeReports.endDateTime")}</label>
                            <input
                              type="datetime-local"
                              name="endDateTime"
                              className="cd-input"
                              value={editForm.endDateTime}
                              onChange={handleEditInputChange}
                            />
                          </div>
                        </div>

                        <div className="cd-form-grid cd-mt-sm">
                        <div>
                        <label className="cd-label">{t("clients.timeReports.hours")}</label>
                            <input
                              type="number"
                              step="0.25"
                              name="hours"
                              className="cd-input"
                              value={editForm.hours}
                              onChange={handleEditInputChange}
                            />
                          </div>
                          <div className="cd-tr-hours-helper">
                            <span className="cd-tr-hours-display">
                              {calculateHoursMinutes(editForm.hours)}
                            </span>
                          </div>
                        </div>

                        <div className="cd-mt-sm">
                          <label className="cd-checkbox-label">
                            <input
                              type="checkbox"
                              name="invoiced"
                              checked={editForm.invoiced}
                              onChange={handleEditInputChange}
                            />{t("clients.timeReports.invoicedQ")}</label>
                        </div>

                        <div className="cd-form-actions cd-mt-md">
                          <button
                            type="button"
                            className="btn-accent"
                            onClick={() => handleSaveEdit(r.id)}
                            disabled={loading}
                          >{t("common.saveChanges")}</button>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={handleCancelEdit}
                          >{t("common.cancel")}</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!r.invoiced}
                        onChange={() => handleToggleInvoiced(r)}
                      />
                    </td>
                    <td className="cd-muted-text">{r.todoItem || "—"}</td>
                    <td
                      className="cd-clickable"
                      onClick={() => handleStartEdit(r)}
                      title={t("clients.timeReports.clickToEdit")}
                    >
                      {r.note || "—"}
                    </td>
                    <td>{Number(r.hours).toFixed(2)} h</td>
                    <td className="cd-muted-text">{t(`clients.todo.assignee.${r.assignedTo || "Everybody"}`, { defaultValue: r.assignedTo || "Everybody" })}</td>
                    <td>
                      <button
                        type="button"
                        className="cd-circle-delete-btn"
                        title={t("clients.timeReports.deleteReport")}
                        onClick={() => handleOpenDeleteModal(r)}
                      >
                        ⊖
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="cd-empty-row">{t("clients.timeReports.empty")}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Delete Confirmation Popup Modal */}
      {reportToDelete && (
        <div className="cd-modal-overlay">
          <div className="cd-delete-modal">
            <button
              type="button"
              className="cd-modal-close"
              onClick={() => setReportToDelete(null)}
            >
              ×
            </button>
            <div className="cd-modal-icon-danger">!</div>
            <h3>{t("clients.timeReports.deleteTitle")}</h3>
            <p>{t("clients.timeReports.deleteText")}</p>
            <div className="cd-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >{t("common.delete")}</button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setReportToDelete(null)}
              >{t("common.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientTimeReports;