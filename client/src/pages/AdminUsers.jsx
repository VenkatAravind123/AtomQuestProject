import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // Fetch managers on mount
  useEffect(() => {
    fetchManagers();
  }, []);

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
      setName("");
      setEmail("");
      setPassword("");
      setRole("EMPLOYEE");
      setManagerId("");
      setDepartment("");
      setTouched({});

      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function demoCreateEmployee() {
    const manager = managers[0];
    if (!manager) {
      setError("Create a manager first");
      return;
    }

    setName("John Doe");
    setEmail(`john.${Date.now()}@atomberg.com`);
    setPassword("employee123");
    setRole("EMPLOYEE");
    setManagerId(manager._id);
    setDepartment("Engineering");
  }

  async function demoCreateManager() {
    setName("Alice Manager");
    setEmail(`alice.${Date.now()}@atomberg.com`);
    setPassword("manager123");
    setRole("MANAGER");
    setManagerId("");
    setDepartment("Engineering");
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Create User</h2>
        <p className="subtle">Add employees, managers, or admins</p>

        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form className="form" onSubmit={onSubmit}>
          {/* Name */}
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              aria-invalid={!!nameError}
            />
            {nameError && <div className="fieldError">{nameError}</div>}
          </div>

          {/* Email */}
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@atomberg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              aria-invalid={!!emailError}
            />
            {emailError && <div className="fieldError">{emailError}</div>}
          </div>

          {/* Password */}
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              aria-invalid={!!passwordError}
            />
            {passwordError && <div className="fieldError">{passwordError}</div>}
          </div>

          {/* Role */}
          <div className="field">
            <label className="label" htmlFor="role">Role</label>
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
          </div>

          {/* Manager (only for EMPLOYEE) */}
          {role === "EMPLOYEE" && (
            <div className="field">
              <label className="label" htmlFor="managerId">Manager *</label>
              <select
                id="managerId"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, managerId: true }))}
                aria-invalid={!!managerError}
              >
                <option value="">Select a manager</option>
                {managers.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              {managerError && <div className="fieldError">{managerError}</div>}
            </div>
          )}

          {/* Department */}
          <div className="field">
            <label className="label" htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              placeholder="Engineering, Sales, etc."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <button type="submit" disabled={!canSubmit || loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        {/* Demo Buttons */}
        <div className="demo-section">
          <p className="subtle">Quick Demo:</p>
          <div className="button-group">
            <button className="btn btn-demo" onClick={demoCreateManager}>
              📋 Create Demo Manager
            </button>
            <button className="btn btn-demo" onClick={demoCreateEmployee}>
              👤 Create Demo Employee
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .success-banner {
          background: #064e3b;
          color: #86efac;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          border: 1px solid #10b981;
        }

        .error-banner {
          background: #7f1d1d;
          color: #fecaca;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          border: 1px solid #dc2626;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #d1d5db;
        }

        .form input,
        .form select {
          padding: 0.75rem;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
          font-family: inherit;
          font-size: 1rem;
        }

        .form input:focus,
        .form select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .form input[aria-invalid="true"],
        .form select[aria-invalid="true"] {
          border-color: #dc2626;
        }

        .fieldError {
          font-size: 0.875rem;
          color: #fca5a5;
        }

        .form button[type="submit"] {
          padding: 0.75rem 1.5rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .form button[type="submit"]:hover:not(:disabled) {
          background: #4f46e5;
        }

        .form button[type="submit"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-section {
          padding-top: 1.5rem;
          border-top: 1px solid #1f2937;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn-demo {
          padding: 0.5rem 1rem;
          background: #1f2937;
          color: #9ca3af;
          border: 1px solid #374151;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-demo:hover {
          background: #111827;
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}