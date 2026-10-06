import React from "react";
import { useTranslation } from "react-i18next";
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
import LanguageSwitcher from "./LanguageSwitcher";
import "./Sidebar.css";

const menuItems = [
  { key: "overview", labelKey: "sidebar.overview", icon: FiHome },
  { key: "clients", labelKey: "sidebar.clients", icon: FiUsers },
  { key: "invoices", labelKey: "sidebar.invoices", icon: FiFileText },
  { key: "estimates", labelKey: "sidebar.estimates", icon: FiClipboard },
  { key: "orders", labelKey: "sidebar.orders", icon: FiPackage },
  { key: "products", labelKey: "sidebar.products", icon: FiBox },
  { key: "accounting", labelKey: "sidebar.accounting", icon: FiBookOpen },
  { key: "statistics", labelKey: "sidebar.statistics", icon: FiPieChart },
  { key: "settings", labelKey: "sidebar.settings", icon: FiSettings },
];

// "estimates" and "orders" added now that EstimateForm/OrderForm
// exist and are wired into routing — were previously excluded
// because there was nothing to navigate to yet.
const availablePages = ["clients", "invoices", "estimates", "orders", "products"];

const Sidebar = ({ activePage, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div className="sidebar">
     {/* Logo */}
<div className="logo-container">
  <img src={logo} alt="i-ray IT Solutions" className="logo" />
  <div className="logo-accent-line" />
</div>
      {/* Menu */}
      <nav className="menu">
        {menuItems.map(({ key, labelKey, icon: Icon }) => {
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
              <span>{t(labelKey)}</span>
            </div>
          );
        })}
      </nav>

      {/* Language selector */}
      <div style={{ padding: "0 12px 12px" }}>
        <LanguageSwitcher />
      </div>

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