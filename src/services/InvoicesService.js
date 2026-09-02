import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/invoices";

const InvoiceService = {
  // Get all invoices
  getAllInvoices() {
    return axios.get(API_BASE_URL);
  },

  getInvoicesByClientId(clientId) {
    return axios.get(`${API_BASE_URL}/client/${clientId}`);
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

  // Get payment history + summary for an invoice
  getPayments(invoiceId) {
    return axios.get(`${API_BASE_URL}/${invoiceId}/payments`);
  },

  // Record a new payment against an invoice
  addPayment(invoiceId, payload) {
    return axios.post(`${API_BASE_URL}/${invoiceId}/payments`, payload);
  },

  // Send invoice by e-mail (optionally with message + attachment)
  sendInvoiceByEmail(id, formData) {
    return axios.post(`${API_BASE_URL}/${id}/send/email`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Download/view the generated invoice PDF
  downloadInvoicePdf(id) {
    return axios.get(`${API_BASE_URL}/${id}/pdf`, { responseType: "blob" });
  },

  // Send invoice by postal mail
  sendInvoiceByPost(id, payload) {
    return axios.post(`${API_BASE_URL}/${id}/send/post`, payload);
  },

  // Send invoice by e-invoice
  sendInvoiceByEInvoice(id, payload) {
    return axios.post(`${API_BASE_URL}/${id}/send/e-invoice`, payload);
  },
};

export default InvoiceService;