import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

export default function Sidebar() {
  const location = useLocation();
  
  const menu = [
    { name: "Product", path: "/" },
    { name: "Payment", path: "/payment" },
    { name: "Kitchen", path: "/kitchen" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        {menu.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
