import axios from "axios";

const API_BASE_URL = "https://invoice-app-iray-gvctcjhfe6gzf0cc.centralindia-01.azurewebsites.net/api/v1/todos";

const TodoService = {
  getTodosByClientId: (clientId) => {
    return axios.get(`${API_BASE_URL}/client/${clientId}`);
  },

  createTodo: (clientId, todoData) => {
    return axios.post(`${API_BASE_URL}/client/${clientId}`, todoData);
  },

  updateTodo: (todoId, todoData) => {
    return axios.put(`${API_BASE_URL}/${todoId}`, todoData);
  },

  toggleTodoDone: (todoId, done) => {
    return axios.patch(`${API_BASE_URL}/${todoId}/status`, { done });
  },

  deleteTodo: (todoId) => {
    return axios.delete(`${API_BASE_URL}/${todoId}`);
  },
};

export default TodoService;