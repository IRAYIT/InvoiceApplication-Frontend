import React from "react";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiPackage,
  FiBox,
  FiBookOpen,
  FiPieChart,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

import logo from "../assets/images/i-ray-logo.png";
import "./Sidebar.css";

const menuItems = [
  { key: "overview", label: "Overview", icon: FiHome },
  { key: "clients", label: "Clients", icon: FiUsers },
  { key: "invoices", label: "Invoices", icon: FiFileText },
  { key: "estimates", label: "Estimates", icon: FiClipboard },
  { key: "orders", label: "Orders", icon: FiPackage },
  { key: "products", label: "Products", icon: FiBox },
  { key: "accounting", label: "Accounting", icon: FiBookOpen },
  { key: "statistics", label: "Statistics", icon: FiPieChart },
  { key: "settings", label: "Settings", icon: FiSettings },
];

const availablePages = ["clients", "invoices", "products"];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <div className="sidebar">
     {/* Logo */}
<div className="logo-container">
  <img src={logo} alt="i-ray IT Solutions" className="logo" />
  <div className="logo-accent-line" />
</div>
      {/* Menu */}
      <nav className="menu">
        {menuItems.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          const isClickable = availablePages.includes(key);

          return (
            <div
              key={key}
              className={`menu-item ${isActive ? "active" : ""} ${
                isClickable ? "" : "disabled"
              }`}
              onClick={() => isClickable && onNavigate(key)}
            >
              <Icon className="icon" />
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="profile">
        <div className="avatar">BY</div>
        <div className="profile-info">
          <span>Bindu Y</span>
        </div>

        <FiChevronDown className="dropdown-icon" />
      </div>
    </div>
  );
};

export default Sidebar;