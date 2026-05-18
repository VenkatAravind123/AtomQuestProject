import { useEffect, useMemo, useState } from "react";
import config from "../config.js";
import { MdDelete } from "react-icons/md";
const API_URL = config.API_URL;

export default function AdminUsers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [managerId, setManagerId] = useState("");
  const [department, setDepartment] = useState("");

  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  // Modal state
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchManagers();
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
    }
  }

  async function fetchManagers() {
    try {
      const res = await fetch(`${API_URL}/api/admin/managers`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setManagers(data);
      }
    } catch (err) {
      console.error("Failed to fetch managers:", err.message);
    }
  }

  const nameError = useMemo(() => {
    if (!touched.name) return "";
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  }, [name, touched.name]);

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    return "";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Password is required";
    if (password.length < 6) return "Minimum 6 characters";
    return "";
  }, [password, touched.password]);

  const managerError = useMemo(() => {
    if (!touched.managerId) return "";
    if (role === "EMPLOYEE" && !managerId) return "Manager is required for employees";
    return "";
  }, [managerId, touched.managerId, role]);

  const canSubmit = !nameError && !emailError && !passwordError && !managerError && 
                   name && email && password && 
                   (role !== "EMPLOYEE" || managerId);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("EMPLOYEE");
    setManagerId("");
    setDepartment("");
    setTouched({});
    setError("");
    setMessage("");
  }

  function closeModal() {
    setShowForm(false);
    resetForm();
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setTouched({ name: true, email: true, password: true, managerId: true });

    if (!canSubmit) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          managerId: role === "EMPLOYEE" ? managerId : undefined,
          department: department || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      setMessage(`✅ User created: ${data.user.name}`);
      resetForm();
      closeModal();
      
      // Refresh users list
      fetchUsers();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setMessage("✅ User deleted successfully");
      fetchUsers();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  function getManagerName(mgrId) {
    const manager = managers.find(m => m._id === mgrId);
    return manager ? manager.name : "—";
  }

  return (
    <div className="page admin-users-page">
      {/* Global Banners */}
      {message && <div className="banner success-banner"><span className="banner-icon">✓</span> {message}</div>}
      {error && <div className="banner error-banner"><span className="banner-icon">!</span> {error}</div>}

      {/* Main Card - Users List */}
      <div className="card glass-card users-list-card">
        <div className="card-header">
          <div className="header-top">
            <div>
              <h2>Users Management</h2>
              <p className="subtle">Manage all employees, managers, and admins</p>
            </div>
            <button 
              className="btn-add-user" 
              onClick={() => setShowForm(true)}
            >
              <span className="plus-icon">+</span> Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users yet. Create one to get started!</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Manager</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="table-row">
                    <td className="cell-name">
                      <div className="user-avatar">{user.name.charAt(0)}</div>
                      {user.name}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.role === "EMPLOYEE" ? getManagerName(user.managerId) : "—"}</td>
                    <td>{user.department || "—"}</td>
                    <td className="cell-actions">
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => deleteUser(user._id)}
                        title="Delete user"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form Overlay */}
      {showForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {message && <div className="banner success-banner"><span className="banner-icon">✓</span> {message}</div>}
            {error && <div className="banner error-banner"><span className="banner-icon">!</span> {error}</div>}

            <form className="modern-form" onSubmit={onSubmit}>
              <div className="form-grid">
                {/* Name */}
                <div className="field-group">
                  <label className="float-label" htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, name: true }))}
                      className={nameError ? "error-input" : ""}
                    />
                    <div className="focus-border"></div>
                  </div>
                  {nameError && <div className="fieldError slide-down">{nameError}</div>}
                </div>

                {/* Email */}
                <div className="field-group">
                  <label className="float-label" htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="john@atomberg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, email: true }))}
                      className={emailError ? "error-input" : ""}
                    />
                    <div className="focus-border"></div>
                  </div>
                  {emailError && <div className="fieldError slide-down">{emailError}</div>}
                </div>

                {/* Password */}
                <div className="field-group">
                  <label className="float-label" htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, password: true }))}
                      className={passwordError ? "error-input" : ""}
                    />
                    <div className="focus-border"></div>
                  </div>
                  {passwordError && <div className="fieldError slide-down">{passwordError}</div>}
                </div>

                {/* Role */}
                <div className="field-group">
                  <label className="float-label" htmlFor="role">Role</label>
                  <div className="input-wrapper select-wrapper">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        if (e.target.value !== "EMPLOYEE") setManagerId("");
                      }}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="focus-border"></div>
                  </div>
                </div>

                {/* Manager (only for EMPLOYEE) */}
                {role === "EMPLOYEE" && (
                  <div className="field-group fade-in">
                    <label className="float-label" htmlFor="managerId">Assigned Manager</label>
                    <div className="input-wrapper select-wrapper">
                      <select
                        id="managerId"
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, managerId: true }))}
                        className={managerError ? "error-input" : ""}
                      >
                        <option value="">Select a manager</option>
                        {managers.map(m => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                      <div className="focus-border"></div>
                    </div>
                    {managerError && <div className="fieldError slide-down">{managerError}</div>}
                  </div>
                )}

                {/* Department */}
                <div className="field-group">
                  <label className="float-label" htmlFor="department">Department</label>
                  <div className="input-wrapper">
                    <input
                      id="department"
                      type="text"
                      placeholder="Engineering, Sales, etc."
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                    <div className="focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn glow-effect" 
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <span className="btn-content">
                      <span className="spinner"></span> Creating...
                    </span>
                  ) : (
                    <span className="btn-content">
                      Create User <span className="arrow">→</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .admin-users-page {
          width: 100%;
          max-width: 100%;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
        }

        /* Banners */
        .banner {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideInDown 0.3s ease-out;
          backdrop-filter: blur(8px);
        }

        .banner-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 14px;
          font-weight: bold;
        }

        .success-banner {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .success-banner .banner-icon {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .error-banner .banner-icon {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* Glass Card */
        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          transform: skewX(-20deg);
          animation: shimmer 8s infinite linear;
          pointer-events: none;
        }

        .users-list-card {
          width: 100%;
        }

        /* Header */
        .card-header {
          margin-bottom: 2.5rem;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .card-header h2 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .card-header .subtle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Add User Button */
        .btn-add-user {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          white-space: nowrap;
        }

        .btn-add-user:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }

        .plus-icon {
          font-size: 1.2rem;
        }

        /* Table */
        .table-container {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead {
          background: rgba(30, 41, 59, 0.5);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        .users-table th {
          padding: 1rem 1.25rem;
          text-align: left;
          font-weight: 600;
          color: #cbd5e1;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .users-table tbody tr {
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          transition: background 0.2s;
        }

        .users-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.05);
        }

        .users-table td {
          padding: 1rem 1.25rem;
          color: #e2e8f0;
          font-size: 0.95rem;
        }

        .cell-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .badge-employee {
          background: rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
        }

        .badge-manager {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        }

        .badge-admin {
          background: rgba(236, 72, 153, 0.2);
          color: #f472b6;
        }

        .cell-actions {
          text-align: center;
        }

        .btn-action {
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-action:hover {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.1);
        }

        .btn-delete:hover {
          transform: scale(1.1);
        }

        /* Empty State */
        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #94a3b8;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          animation: slideInDown 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding-bottom: 1rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #fff;
        }

        /* Form */
        .modern-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .header-top {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-add-user {
            width: 100%;
          }
        }

        /* Field Group */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        .float-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.025em;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
          border-radius: 12px;
        }

        .modern-form input,
        .modern-form select {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          appearance: none;
        }

        .modern-form input::placeholder {
          color: #64748b;
        }

        .modern-form input:focus,
        .modern-form select:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
        }

        .modern-form input.error-input {
          border-color: rgba(239, 68, 68, 0.5);
        }

        .select-wrapper::after {
          content: '▼';
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 0.7rem;
          pointer-events: none;
        }

        .fieldError {
          font-size: 0.8rem;
          color: #f87171;
          margin-left: 0.25rem;
        }

        .fieldError::before {
          content: '• ';
        }

        .slide-down {
          animation: slideInDown 0.2s ease-out;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .submit-btn {
          flex: 1;
          padding: 1rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.39);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #475569;
          box-shadow: none;
        }

        .btn-cancel {
          flex: 1;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.5);
          color: #cbd5e1;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-cancel:hover {
          background: rgba(51, 65, 85, 0.8);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .arrow {
          transition: transform 0.3s;
        }

        .submit-btn:hover:not(:disabled) .arrow {
          transform: translateX(4px);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .users-list-card {
            padding: 1rem;
            border-radius: 16px;
          }

          .header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .btn-add {
            width: 100%;
            justify-content: center;
          }

          .users-table th, 
          .users-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }

          .modal-panel {
            padding: 1.5rem;
            margin: 1rem;
            width: calc(100% - 2rem);
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header h3 {
            font-size: 1.25rem;
          }

          .modal-actions {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}