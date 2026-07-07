import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientService from "../../services/ClientService";
import "./ManageClients.css";

const ManageClients = () => {

  const [clients, setClients] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const response = await ClientService.getAllClients();
    setClients(response.data);
  };

  const deleteClient = async (id) => {
    await ClientService.deleteClient(id);
    loadClients();
  };

  return (
    <div className="client-list">

      <div className="header">

        <button
          className="new-btn"
          onClick={() => navigate("/clients/new")}
        >
          New Client
        </button>

        <input placeholder="Search" />
      </div>

      <table>

        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Updated</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.number}</td>

              <td>
                {client.clientType === "company"
                  ? client.company
                  : `${client.firstName} ${client.lastName}`}
              </td>

              <td>{client.email}</td>

              <td>
                {new Date(client.updatedAt).toLocaleDateString()}
              </td>

              <td>
                <button
                  onClick={() =>
                    deleteClient(client.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default ManageClients;