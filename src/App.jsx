import Sidebar from "./Components/Sidebar";

import ClientForm from "./Pages/Clients/ClientForm";
import ManageClients from "./Pages/Clients/ManageClients";

import InvoiceForm from "./Pages/Invoices/InvoiceForm";
import ManageInvoices from "./Pages/Invoices/ManageInvoices";

import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      {/* Render one page at a time */}
      <InvoiceForm />
    </div>
  );
}

export default App;