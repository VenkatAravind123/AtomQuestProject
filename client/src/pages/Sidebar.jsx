import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems = getNavItems(user?.role);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar overlay on mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">AtomQuest</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "nav-item--active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>

          <button className="btn btn--ghost btn--full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function getNavItems(role) {
  const commonItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
  ];

  const roleItems = {
    EMPLOYEE: [
      { path: "/employee/goals", label: "My Goals", icon: "🎯" },
      { path: "/employee/updates", label: "Updates", icon: "📈" },
      
    ],
    MANAGER: [
      { path: "/manager/approvals", label: "Approvals", icon: "✅" },
      { path: "/manager/team", label: "My Team", icon: "👥" },
      { path: "/manager/checkins", label: "Check-ins", icon: "💬" },
    ],
    ADMIN: [
      { path: "/admin/users", label: "Users", icon: "👤" },
      { path: "/admin/cycles", label: "Cycles", icon: "📅" },
      { path: "/admin/shared-goals", label: "Shared Goals", icon: "🔗" },
      { path: "/admin/reports", label: "Reports", icon: "📑" },
    ],
  };

  return [...commonItems, ...(roleItems[role] || [])];
}