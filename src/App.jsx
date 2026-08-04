import { useState } from "react";
import Sidebar from "./Components/Sidebar";

import ManageClients from "./Pages/clients/ManageClients";
import ClientForm from "./Pages/clients/ClientForm";
import ClientDetail from "./Pages/clients/ClientDetail";
import EditClientForm from "./Pages/clients/EditClientForm";

import ManageInvoices from "./Pages/Invoices/ManageInvoices";
import InvoiceForm from "./Pages/Invoices/InvoiceForm";
import ViewInvoice from "./Pages/Invoices/ViewInvoice";

import EstimateForm from "./Pages/estimates/EstimateForm";
import ManageEstimates from "./Pages/estimates/ManageEstimates";
import EstimateDetail from "./Pages/estimates/EstimateDetail";

import ManageOrders from "./Pages/orders/ManageOrders";
import OrderForm from "./Pages/orders/OrderForm";

import ManageProducts from "./Pages/Products/ManageProducts";
import ProductDetail from "./Pages/Products/ProductDetail";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("invoices");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [pendingInvoiceClient, setPendingInvoiceClient] = useState(null);
  const [pendingOrderClient, setPendingOrderClient] = useState(null);

  // `extra` is optional — currently used by EstimateDetail's
  // "Create invoice" shortcut and by client shortcuts to "New order",
  // to pre-fill the client on the new invoice/order form, since
  // there's no real estimate->invoice conversion endpoint.
  const navigate = (page, id = null, extra = null) => {
    if (page === "clientDetail" || page === "editClient") {
      setSelectedClientId(id);
    }
    if (page === "productDetail") {
      setSelectedProductId(id);
    }
    if (page === "editEstimate" || page === "estimateDetail") {
      setSelectedEstimateId(id);
    }
    if (page === "editOrder") {
      setSelectedOrderId(id);
    }
    if (page === "viewInvoice" || page === "editInvoice") {
      setSelectedInvoiceId(id);
    }
    if (page === "newInvoice") {
      setPendingInvoiceClient(extra?.client ?? null);
    }
    if (page === "newOrder") {
      setPendingOrderClient(extra?.client ?? null);
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
        return <InvoiceForm onNavigate={navigate} client={pendingInvoiceClient} />;
      case "viewInvoice":
        return <ViewInvoice invoiceId={selectedInvoiceId} onNavigate={navigate} />;
      case "editInvoice":
        return <InvoiceForm invoiceId={selectedInvoiceId} onNavigate={navigate} />;

      // "estimates" now shows the list page (matches how "invoices" ->
      // ManageInvoices works), with the form reserved for actually
      // creating/editing one.
      case "estimates":
        return <ManageEstimates onNavigate={navigate} />;
      case "newEstimate":
        return <EstimateForm onNavigate={navigate} />;
      case "editEstimate":
        return <EstimateForm estimateId={selectedEstimateId} onNavigate={navigate} />;
      case "estimateDetail":
        return <EstimateDetail estimateId={selectedEstimateId} onNavigate={navigate} />;

      // "orders" mirrors the estimates/invoices pattern: a list page
      // plus a shared OrderForm reused for both create and edit.
      case "orders":
        return <ManageOrders onNavigate={navigate} />;
      case "newOrder":
        return <OrderForm onNavigate={navigate} client={pendingOrderClient} />;
      case "editOrder":
        return <OrderForm orderId={selectedOrderId} onNavigate={navigate} />;

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