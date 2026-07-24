import { useState } from "react";
import Sidebar from "./Components/Sidebar";

import ManageClients from "./Pages/clients/ManageClients";
import ClientForm from "./Pages/clients/ClientForm";
import ClientDetail from "./Pages/clients/ClientDetail";
import EditClientForm from "./Pages/clients/EditClientForm";

import ManageInvoices from "./Pages/Invoices/ManageInvoices";
import InvoiceForm from "./Pages/Invoices/InvoiceForm";

import ManageProducts from "./Pages/Products/ManageProducts";
import ProductDetail from "./Pages/Products/ProductDetail";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("invoices");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const navigate = (page, id = null) => {
    if (page === "clientDetail" || page === "editClient") {
      setSelectedClientId(id);
    }
    if (page === "productDetail") {
      setSelectedProductId(id);
    }
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "clients":
        return <ManageClients onNavigate={navigate} />;
      case "newClient":
        return <ClientForm onNavigate={navigate} />;
      case "clientDetail":
        return <ClientDetail clientId={selectedClientId} onNavigate={navigate} />;
      case "editClient":
        return <EditClientForm clientId={selectedClientId} onNavigate={navigate} />;

      case "invoices":
        return <ManageInvoices onNavigate={navigate} />;
      case "newInvoice":
        return <InvoiceForm onNavigate={navigate} />;

      case "products":
        return <ManageProducts onNavigate={navigate} />;
      case "newProduct":
        return <ProductDetail onNavigate={navigate} />;
      case "productDetail":
        return <ProductDetail productId={selectedProductId} onNavigate={navigate} />;

      default:
        return <ManageInvoices onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      {renderPage()}
    </div>
  );
}

export default App;