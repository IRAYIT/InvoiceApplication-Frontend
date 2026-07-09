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

import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo-container">
        <img
          src="https://via.placeholder.com/60x60"
          alt="logo"
          className="logo"
        />
      </div>

      {/* Menu */}
      <nav className="menu">
        <div className="menu-item">
          <FiHome className="icon" />
          <span>Overview</span>
        </div>

        <div className="menu-item active">
          <FiUsers className="icon" />
          <span>Clients</span>
        </div>

        <div className="menu-item">
          <FiFileText className="icon" />
          <span>Invoices</span>
        </div>

        <div className="menu-item">
          <FiClipboard className="icon" />
          <span>Estimates</span>
        </div>

        <div className="menu-item">
          <FiPackage className="icon" />
          <span>Orders</span>
        </div>

        <div className="menu-item">
          <FiBox className="icon" />
          <span>Products</span>
        </div>

        <div className="menu-item">
          <FiBookOpen className="icon" />
          <span>Accounting</span>
        </div>

        <div className="menu-item">
          <FiPieChart className="icon" />
          <span>Statistics</span>
        </div>

        <div className="menu-item">
          <FiSettings className="icon" />
          <span>Settings</span>
        </div>
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