import axios from "axios";

const API_URL = "https://invoice-app-iray-gvctcjhfe6gzf0cc.centralindia-01.azurewebsites.net/api/v1/client-contacts";

const ClientContactService = {

  getContactsByClientId: (clientId) =>
    axios.get(`${API_URL}/client/${clientId}`),

  createContact: (clientId, data) =>
    axios.post(`${API_URL}/client/${clientId}`, data),

  updateContact: (contactId, data) =>
    axios.put(`${API_URL}/${contactId}`, data),

  deleteContact: (contactId) =>
    axios.delete(`${API_URL}/${contactId}`),
};

export default ClientContactService;