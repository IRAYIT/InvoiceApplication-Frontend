import axios from "axios";

const API_BASE_URL = "https://invoice-app-iray-gvctcjhfe6gzf0cc.centralindia-01.azurewebsites.net/api/v1/time-reports";

const TimeReportService = {
  getReportsByClientId: (clientId) => axios.get(`${API_BASE_URL}/client/${clientId}`),
  createReport: (clientId, payload) => axios.post(`${API_BASE_URL}/client/${clientId}`, payload),
  updateReport: (reportId, payload) => axios.put(`${API_BASE_URL}/${reportId}`, payload),
  toggleInvoiced: (reportId, invoiced) => axios.patch(`${API_BASE_URL}/${reportId}/invoiced`, { invoiced }),
  deleteReport: (reportId) => axios.delete(`${API_BASE_URL}/${reportId}`),
};

export default TimeReportService;