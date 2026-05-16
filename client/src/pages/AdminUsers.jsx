import { useState } from "react";

export default function AdminUsers() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="page">
      <div className="card">
        <div className="section-header">
          <h2>Manage Users</h2>
          <button
            className="btn btn--primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Create User"}
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <form className="form">
              <div className="field">
                <label className="label">Name</label>
                <input type="text" placeholder="Full Name" />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input type="email" placeholder="user@company.com" />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input type="password" placeholder="Minimum 6 characters" />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select>
                  <option>EMPLOYEE</option>
                  <option>MANAGER</option>
                  <option>ADMIN</option>
                </select>
              </div>
              <div className="actions">
                <button className="btn btn--primary" type="submit">
                  Create User
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No users created yet. Click "Create User" to add one.</p>
        </div>
      </div>
    </div>
  );
}