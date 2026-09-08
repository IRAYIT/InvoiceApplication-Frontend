import axios from "axios";

// Matches EstimateController exactly:
//   POST   /api/v1/estimates
//   GET    /api/v1/estimates
//   GET    /api/v1/estimates/{id}
//   PUT    /api/v1/estimates/{id}
//   DELETE /api/v1/estimates/{id}
const API_BASE = "https://invoice-app-iray-gvctcjhfe6gzf0cc.centralindia-01.azurewebsites.net/api/v1/estimates";

const EstimateService = {
  createEstimate: (payload) => axios.post(API_BASE, payload),
  getAllEstimates: () => axios.get(API_BASE),
  getEstimateById: (id) => axios.get(`${API_BASE}/${id}`),
  getEstimatesByClientId: (clientId) => axios.get(`${API_BASE}/client/${clientId}`),
  updateEstimate: (id, payload) => axios.put(`${API_BASE}/${id}`, payload),
  deleteEstimate: (id) => axios.delete(`${API_BASE}/${id}`),
  sendEstimate: (id) => axios.patch(`${API_BASE}/${id}/send`),
  approveEstimate: (id) => axios.patch(`${API_BASE}/${id}/approve`),
  rejectEstimate: (id) => axios.patch(`${API_BASE}/${id}/reject`),
  convertToInvoice: (id) => axios.post(`${API_BASE}/${id}/convert-to-invoice`),
  updateCurrency: (id, currency) =>
    axios.patch(`${API_BASE}/${id}/currency`, null, { params: { currency } }),
};

export default EstimateService;