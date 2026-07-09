import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/invoices";

const InvoiceService = {
  // Get all invoices
  getAllInvoices() {
    return axios.get(API_BASE_URL);
  },

  // Get invoice by id
  getInvoiceById(id) {
    return axios.get(`${API_BASE_URL}/${id}`);
  },

  // Create invoice
  createInvoice(invoice) {
    return axios.post(API_BASE_URL, invoice);
  },

  // Update invoice
  updateInvoice(id, invoice) {
    return axios.put(`${API_BASE_URL}/${id}`, invoice);
  },

  // Delete invoice
  deleteInvoice(id) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Search invoices
  searchInvoices(keyword) {
    return axios.get(`${API_BASE_URL}/search?keyword=${keyword}`);
  },
};

export default InvoiceService;