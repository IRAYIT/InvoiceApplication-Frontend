import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TodoService from "../../services/TodoService";
import ProductService from "../../services/ProductsService";
import "./ClientTodo.css";

const initialTodoFormState = {
  description: "",
  assignedTo: "Everybody",
  priority: "Low",
  productService: "",
  deadline: "",
};

function ClientTodos({ clientId }) {
  const { t } = useTranslation();
  const [todos, setTodos] = useState([]);
  const [products, setProducts] = useState([]);
  const [todoSearch, setTodoSearch] = useState("");
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoLoading, setTodoLoading] = useState(false);
  const [todoError, setTodoError] = useState(null);
  const [todoForm, setTodoForm] = useState(initialTodoFormState);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editForm, setEditForm] = useState(initialTodoFormState);

  useEffect(() => {
    if (clientId) {
      loadTodos();
      loadProducts();
    }
  }, [clientId]);

  const loadTodos = async () => {
    try {
      setTodoLoading(true);
      const response = await TodoService.getTodosByClientId(clientId);
      setTodos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading todos:", err);
      setTodos([]);
    } finally {
      setTodoLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await ProductService.getAllProducts();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading products for dropdown:", err);
      setProducts([]);
    }
  };

const handleEditInputChange = (e) => {
  const { name, value } = e.target;
  setEditForm((prev) => ({ ...prev, [name]: value }));
};

const handleStartEdit = (todo) => {
  setEditingTodoId(todo.id);
  setEditForm({
    description: todo.description || "",
    assignedTo: todo.assignedTo || "Everybody",
    priority: todo.priority || "Low",
    productService: todo.productService || "",
    deadline: todo.deadline || "",
    hours: todo.hours ?? 0.0,
    unbilled: todo.unbilled ?? 0.0,
    done: !!todo.done,
  });
};

const handleCancelEdit = () => {
  setEditingTodoId(null);
  setEditForm(initialTodoFormState);
};

const handleSaveEdit = async (todoId) => {
  if (!editForm.description.trim()) {
    alert("Description is required.");
    return;
  }

  try {
    setTodoLoading(true);
    const response = await TodoService.updateTodo(todoId, {
      ...editForm,
      hours: Number(editForm.hours) || 0.0,
      unbilled: Number(editForm.unbilled) || 0.0,
    });

    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? response.data : t))
    );
    setEditingTodoId(null);
  } catch (err) {
    console.error("Error updating todo:", err);
    alert(err?.response?.data?.message || t("clients.todo.errors.updateFailed"));
  } finally {
    setTodoLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTodoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTodo = async () => {
    if (!todoForm.description.trim()) {
      setTodoError(t("clients.todo.errors.descriptionRequired"));
      return;
    }

    try {
      setTodoLoading(true);
      setTodoError(null);
      const response = await TodoService.createTodo(clientId, {
        ...todoForm,
        done: false,
        hours: 0.0,
        unbilled: 0.0,
      });

      setTodos((prev) => [response.data, ...prev]);
      setShowTodoForm(false);
      setTodoForm(initialTodoFormState);
    } catch (err) {
      console.error("Error saving todo:", err);
      setTodoError(err?.response?.data?.message || t("clients.todo.errors.createFailed"));
    } finally {
      setTodoLoading(false);
    }
  };

  const handleToggleDone = async (todo) => {
    try {
      const nextDone = !todo.done;
      await TodoService.toggleTodoDone(todo.id, nextDone);
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, done: nextDone } : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      await TodoService.deleteTodo(todoId);
      setTodos((prev) => prev.filter((item) => item.id !== todoId));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const filteredTodos = todos.filter((t) =>
    (t.description || "").toLowerCase().includes(todoSearch.toLowerCase())
  );
  const formatProductOption = (prod) => {
    const price = Number(prod.price ?? 0).toFixed(2);
    const unit = prod.unit ? ` / ${prod.unit}` : " / ";
    return `${prod.name} — ${price}${unit}`;
  };
  

  return (
    <div className="cd-todos">
      {/* Top action bar */}
      <div className="cd-notes-toolbar">
        <button
          type="button"
          className="btn-success"
          onClick={() => {
            setShowTodoForm((prev) => !prev);
            setTodoError(null);
          }}
        >{t("clients.todo.newTodo")}</button>

        <div className="cd-notes-search">
          <input
            type="text"
            placeholder={t("common.search")}
            value={todoSearch}
            onChange={(e) => setTodoSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Creation form */}
      {showTodoForm && (
        <div className="cd-todo-form-panel">
          {todoError && <p className="cd-note-error">{todoError}</p>}

          <div className="cd-form-row">
            <label className="cd-label">{t("clients.todo.description")}</label>
            <input
              type="text"
              name="description"
              className="cd-input"
              value={todoForm.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="cd-form-grid">
          <div>
              <label className="cd-label">{t("clients.todo.assignedToUser")}</label>
              <select
                name="assignedTo"
                className="cd-select"
                value={todoForm.assignedTo}
                onChange={handleInputChange}
              >
                <option value="Everybody">{t("clients.todo.assignee.Everybody")}</option>
                <option value="Admin">{t("clients.todo.assignee.Admin")}</option>
              </select>
            </div>

            <div>
              <label className="cd-label">{t("clients.todo.priority")}</label>
              <select
                name="priority"
                className="cd-select"
                value={todoForm.priority}
                onChange={handleInputChange}
              >
                <option value="Low">{t("clients.todo.priorities.Low")}</option>
                <option value="Medium">{t("clients.todo.priorities.Medium")}</option>
                <option value="High">{t("clients.todo.priorities.High")}</option>
              </select>
            </div>
          </div>

          <div className="cd-form-grid cd-mt-sm">
          <div>
                <label className="cd-label">{t("clients.todo.connectProduct")}</label>
                <select
                    name="productService"
                    className="cd-select"
                    value={todoForm.productService}
                    onChange={handleInputChange}
                >
                    <option value="">{t("clients.todo.none")}</option>
                    {products.map((prod) => (
                    <option key={prod.id} value={prod.name}>
                        {formatProductOption(prod)}
                    </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="cd-label">{t("clients.todo.deadline")}</label>
              <input
                type="date"
                name="deadline"
                className="cd-input"
                value={todoForm.deadline}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="cd-form-actions">
            <button
              type="button"
              className="btn-accent"
              onClick={handleCreateTodo}
              disabled={todoLoading}
            >
              {todoLoading ? t("clients.todo.creating") : t("clients.todo.createTodo")}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setShowTodoForm(false);
                setTodoForm(initialTodoFormState);
              }}
            >{t("common.cancel")}</button>
          </div>
        </div>
      )}

      {/* Todo list table */}
      <div className="cd-todos-list">
        <table className="cd-invoice-table cd-todo-table">
          <thead>
            <tr>
            <th style={{ width: "60px" }}>{t("clients.todo.table.done")}</th>
              <th>{t("clients.todo.table.description")}</th>
              <th>{t("clients.todo.table.assignedTo")}</th>
              <th>{t("clients.todo.table.hours")}</th>
              <th>{t("clients.todo.table.unbilled")}</th>
              <th style={{ width: "40px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <React.Fragment key={todo.id}>
                  {editingTodoId === todo.id ? (
                    <tr className="cd-todo-edit-row">
                      <td colSpan="6">
                        <div className="cd-todo-edit-panel">
                        <div className="cd-form-row">
                        <label className="cd-label">{t("clients.todo.description")}</label>
                            <input
                              type="text"
                              name="description"
                              className="cd-input"
                              value={editForm.description}
                              onChange={handleEditInputChange}
                            />
                          </div>

                          <div className="cd-form-grid">
                          <div>
                          <label className="cd-label">{t("clients.todo.assignedToUser")}</label>
                              <select
                                name="assignedTo"
                                className="cd-select"
                                value={editForm.assignedTo}
                                onChange={handleEditInputChange}
                              >
                                <option value="Everybody">{t("clients.todo.assignee.Everybody")}</option>
                                <option value="Admin">{t("clients.todo.assignee.Admin")}</option>
                              </select>
                            </div>

                            <div>
                              <label className="cd-label">{t("clients.todo.priority")}</label>
                              <select
                                name="priority"
                                className="cd-select"
                                value={editForm.priority}
                                onChange={handleEditInputChange}
                              >
                                <option value="Low">{t("clients.todo.priorities.Low")}</option>
                                <option value="Medium">{t("clients.todo.priorities.Medium")}</option>
                                <option value="High">{t("clients.todo.priorities.High")}</option>
                              </select>
                            </div>
                          </div>

                          <div className="cd-form-grid cd-mt-sm">
                          <div>
                          <label className="cd-label">{t("clients.todo.connectProduct")}</label>
                              <select
                                name="productService"
                                className="cd-select"
                                value={editForm.productService}
                                onChange={handleEditInputChange}
                              >
                                <option value="">{t("clients.todo.none")}</option>
                                {products.map((prod) => (
                                  <option key={prod.id} value={prod.name}>
                                    {formatProductOption(prod)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="cd-label">{t("clients.todo.deadline")}</label>
                              <input
                                type="date"
                                name="deadline"
                                className="cd-input"
                                value={editForm.deadline || ""}
                                onChange={handleEditInputChange}
                              />
                            </div>
                          </div>

                          <div className="cd-form-actions">
                            <button
                              type="button"
                              className="btn-accent"
                              onClick={() => handleSaveEdit(todo.id)}
                              disabled={todoLoading}
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
                          checked={!!todo.done}
                          onChange={() => handleToggleDone(todo)}
                        />
                      </td>
                      <td
                        className="cd-todo-desc-cell cd-clickable"
                        onClick={() => handleStartEdit(todo)}
                      >
                        {todo.description}
                      </td>
                      <td className="cd-muted-text">
                        {t(`clients.todo.assignee.${todo.assignedTo || "Everybody"}`, { defaultValue: todo.assignedTo || "Everybody" })}
                      </td>
                      <td>{(Number(todo.hours) || 0).toFixed(1)} h</td>
                      <td>{(Number(todo.unbilled) || 0).toFixed(1)} h</td>
                      <td>
                        <button
                          type="button"
                          className="cd-circle-delete-btn"
                          title={t("clients.todo.deleteTodo")}
                          onClick={() => handleDelete(todo.id)}
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
                <td colSpan="6" className="cd-empty-row">{t("clients.todo.empty")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientTodos;