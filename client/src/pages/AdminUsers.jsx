import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [touched, setTouched] = useState({});

  // Validation
  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.password.length < 6) errors.password = "Minimum 6 characters";
    return errors;
  }

  const errors = validate();
  const canSubmit = Object.keys(errors).length === 0 && !loading;

  // Handle form submit - calls backend directly
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTouched({ name: true, email: true, password: true });

    if (!canSubmit) return;

    try {
      setLoading(true);
      
      // Direct fetch to backend API
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setSuccess(
        `✓ ${data.user.name} (${data.user.role}) created successfully!`
      );
      setFormData({ name: "", email: "", password: "", role: "EMPLOYEE" });
      setTouched({});

      setTimeout(() => {
        setSuccess("");
        setShowForm(false);
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle input change
  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  // Quick add button handler
  async function quickAddUser(name, email, password, role) {
    try {
      setLoading(true);
      
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setSuccess(`✓ ${name} created successfully! (${email})`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="section-header">
          <h2>Manage Users</h2>
          <button
            className="btn btn--primary"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
          >
            {showForm ? "Cancel" : "+ Create User"}
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <form className="form" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="field">
                <label className="label" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={!!(touched.name && errors.name)}
                />
                {touched.name && errors.name ? (
                  <div className="fieldError">{errors.name}</div>
                ) : null}
              </div>

              {/* Email Field */}
              <div className="field">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {touched.email && errors.email ? (
                  <div className="fieldError">{errors.email}</div>
                ) : null}
              </div>

              {/* Password Field */}
              <div className="field">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!(touched.password && errors.password)}
                />
                {touched.password && errors.password ? (
                  <div className="fieldError">{errors.password}</div>
                ) : null}
              </div>

              {/* Role Field */}
              <div className="field">
                <label className="label" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="actions">
                <button
                  className="btn btn--primary btn--full"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Creating…
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error ? (
              <div className="error" role="alert">
                ⚠️ {error}
              </div>
            ) : null}

            {/* Success Message */}
            {success ? (
              <div className="success" role="alert">
                {success}
              </div>
            ) : null}
          </div>
        )}

        {/* Quick Demo Buttons */}
        <div className="demo-quick-add">
          <h4>Quick Add Demo Users</h4>
          <p className="subtle">
            Click to quickly create demo accounts for testing
          </p>
          <div className="demo-user-buttons">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                quickAddUser("Manager Demo", "manager@atomberg.com", "manager123", "MANAGER")
              }
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "+ Manager Demo"}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                quickAddUser("Employee 1", "employee1@atomberg.com", "employee123", "EMPLOYEE")
              }
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "+ Employee 1"}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                quickAddUser("Employee 2", "employee2@atomberg.com", "employee123", "EMPLOYEE")
              }
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "+ Employee 2"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}