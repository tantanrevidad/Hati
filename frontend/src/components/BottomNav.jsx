import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, User, LayoutGrid } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { label: "Home",   icon: Home,       route: "/home" },
    { label: "Groups", icon: LayoutGrid, route: "/groups" },
    { label: "Profile",icon: User,       route: "/profile" },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ label, icon: Icon, route }) => (
        <button
          key={route}
          className={`bottom-nav-item ${path.startsWith(route) ? "active" : ""}`}
          onClick={() => navigate(route)}
        >
          <Icon size={22} strokeWidth={path.startsWith(route) ? 2.5 : 1.8} />
          {label}
        </button>
      ))}
    </nav>
  );
}
