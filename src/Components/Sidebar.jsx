import "./Sidebar.css";
import {
  FaUsers,
  FaFileInvoice,
  FaClipboardList,
  FaShoppingCart,
  FaBox,
  FaChartPie,
  FaCog,
  FaHome,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>F</h2>
      </div>

      <ul>
        <li>
          <FaHome /> Overview
        </li>

        <li className="active">
          <FaUsers /> Clients
        </li>

        <li>
          <FaFileInvoice /> Invoices
        </li>

        <li>
          <FaClipboardList /> Estimates
        </li>

        <li>
          <FaShoppingCart /> Orders
        </li>

        <li>
          <FaBox /> Products
        </li>

        <li>
          <FaChartPie /> Statistics
        </li>

        <li>
          <FaCog /> Settings
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;