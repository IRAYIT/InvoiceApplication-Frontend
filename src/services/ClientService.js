import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/clients";

// Reusable axios instance so headers/config stay consistent across calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ClientService = {
  // GET /api/clients - fetch all clients
  getAllClients: async () => {
    try {
      const response = await apiClient.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // GET /api/clients/:id - fetch a single client by id
  getClientById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with id ${id}:`, error);
      throw error;
    }
  },

  // POST /api/clients - create a new client
  createClient: async (clientData) => {
    try {
      const response = await apiClient.post("/", clientData);
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  // PUT /api/clients/:id - update an existing client
  updateClient: async (id, clientData) => {
    try {
      const response = await apiClient.put(`/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with id ${id}:`, error);
      throw error;
    }
  },

  // DELETE /api/clients/:id - delete a client
  deleteClient: async (id) => {
    try {
      const response = await apiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting client with id ${id}:`, error);
      throw error;
    }
  },
};

export default ClientService;