import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import ManageClients from "./Pages/clients/ManageClients";
import ClientForm from "./Pages/clients/ClientForm";
function App() {
  return (
    <BrowserRouter>

      <Sidebar />

      <div className="main-content">

        <Routes>

          <Route
            path="/"
            element={<ManageClients />}
          />

          <Route
            path="/clients"
            element={<ManageClients />}
          />

          <Route
            path="/clients/new"
            element={<ClientForm />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;