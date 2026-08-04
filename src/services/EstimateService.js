import axios from "axios";

// Matches EstimateController exactly:
//   POST   /api/v1/estimates
//   GET    /api/v1/estimates
//   GET    /api/v1/estimates/{id}
//   PUT    /api/v1/estimates/{id}
//   DELETE /api/v1/estimates/{id}
const API_BASE = "http://localhost:8080/api/v1/estimates";

const EstimateService = {
  createEstimate: (payload) => axios.post(API_BASE, payload),
  getAllEstimates: () => axios.get(API_BASE),
  getEstimateById: (id) => axios.get(`${API_BASE}/${id}`),
  updateEstimate: (id, payload) => axios.put(`${API_BASE}/${id}`, payload),
  deleteEstimate: (id) => axios.delete(`${API_BASE}/${id}`),
};

export default EstimateService;