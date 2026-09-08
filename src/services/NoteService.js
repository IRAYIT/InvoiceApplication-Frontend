import axios from "axios";

const API_URL = "https://invoice-app-iray-gvctcjhfe6gzf0cc.centralindia-01.azurewebsites.net/api/v1/clients";

const NotesService = {

  getNotesByClientId: (clientId, search = "") => {
    return axios.get(`${API_URL}/${clientId}/notes`, {
      params: search ? { search } : {},
    });
  },

  createNote: (clientId, noteData) => {
    return axios.post(
      `${API_URL}/${clientId}/notes`,
      noteData
    );
  },

  updateNote: (noteId, noteData) => {
    return axios.put(
      `${API_URL}/notes/${noteId}`,
      noteData
    );
  },

  deleteNote: (noteId) => {
    return axios.delete(
      `${API_URL}/notes/${noteId}`
    );
  },

};

export default NotesService;