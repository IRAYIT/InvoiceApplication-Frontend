import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/orders";

const OrderService = {
  createOrder: (payload) => axios.post(API_BASE_URL, payload),

  updateOrder: (id, payload) => axios.put(`${API_BASE_URL}/${id}`, payload),

  updateOrderStatus: (id, status) =>
    axios.patch(`${API_BASE_URL}/${id}/status`, { status }),

  getOrderById: (id) => axios.get(`${API_BASE_URL}/${id}`),

  getAllOrders: (params = {}) => axios.get(API_BASE_URL, { params }),

  getOrdersByClient: (clientId) => axios.get(`${API_BASE_URL}/client/${clientId}`),

  deleteOrder: (id) => axios.delete(`${API_BASE_URL}/${id}`),
};

export default OrderService;