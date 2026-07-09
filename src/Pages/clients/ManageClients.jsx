import "./ManageClients.css";
import ClientForm from "../Clients/ClientForm";

const mockClients = [
  { id: 1, name: "ABC", city: "", updated: "9 days", email: "abc@gmail.com" },
];

function ManageClients() {
  return (
    <div className="clients-page">
      <h1 className="page-title">Clients</h1>

      <ClientForm />

      {/* Client list table */}
      <div className="clients-table-card">
        <table className="clients-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>CITY</th>
              <th>UPDATED ↑</th>
              <th>EMAIL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>
                  <a href="#client" className="link-cell">{client.name}</a>
                </td>
                <td>{client.city}</td>
                <td>{client.updated}</td>
                <td>
                  <a href={`mailto:${client.email}`} className="link-cell">
                    {client.email}
                  </a>
                </td>
                <td className="row-actions">
                  <button className="row-menu-btn">⚙ ▾</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="page-footer">
        <span>♡ FAQ</span>
        <span>? Help</span>
        <span>✉ Email us</span>
        <span>📞 Ring oss</span>
        <span>🕒 Mon - Thu 09:00 - 12:00</span>
      </div>
    </div>
  );
}

export default ManageClients;