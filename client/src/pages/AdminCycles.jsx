import { useEffect, useState } from "react";
import config from "../config.js";

const API_URL = config.API_URL;
const PHASES = ["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"];

export default function AdminCycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: currentYear,
    phase: "GOAL_SETTING",
    windowStart: "",
    windowEnd: "",
  });

  useEffect(() => {
    fetchCycles();
  }, [selectedYear]);

  async function fetchCycles() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}/api/admin/cycles/year/${selectedYear}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch cycles");
      const data = await res.json();
      setCycles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCycle(e) {
    e.preventDefault();
    try {
      setError("");

      if (!formData.windowStart || !formData.windowEnd) {
        setError("Both start and end dates are required");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setSuccess("✅ Cycle created successfully!");
      setShowForm(false);
      setFormData({
        year: currentYear,
        phase: "GOAL_SETTING",
        windowStart: "",
        windowEnd: "",
      });

      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleActivateCycle(cycleId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}/activate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to activate cycle");

      setSuccess("✅ Cycle activated!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCloseCycle(cycleId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}/close`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to close cycle");

      setSuccess("✅ Cycle closed!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCycle(cycleId) {
    if (!confirm("Are you sure? This will delete the cycle.")) return;

    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete cycle");

      setSuccess("✅ Cycle deleted!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading cycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2>Goal Cycles</h2>
            <p className="subtle">Create and manage annual goal cycles and quarters</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Cycle"}
          </button>
        </div>

        {success && <div className="success-banner">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Create Cycle Form */}
        {showForm && (
          <div className="form-card">
            <h3>Create New Cycle</h3>
            <form onSubmit={handleCreateCycle}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        year: parseInt(e.target.value),
                      }))
                    }
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Phase</label>
                  <select
                    value={formData.phase}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        phase: e.target.value,
                      }))
                    }
                    className="select-input"
                  >
                    {PHASES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.windowStart}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        windowStart: e.target.value,
                      }))
                    }
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.windowEnd}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        windowEnd: e.target.value,
                      }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Year Selector */}
        <div className="year-selector">
          <label>Filter by Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="select-input"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Cycles List */}
        {cycles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No cycles created for this year</p>
          </div>
        ) : (
          <div className="cycles-list">
            {cycles.map(cycle => (
              <div key={cycle._id} className="cycle-card">
                <div className="cycle-header">
                  <div>
                    <h3>{cycle.phase}</h3>
                    <p className="subtle">Year: {cycle.year}</p>
                  </div>
                  <div className={`status-badge ${cycle.active ? "active" : "closed"}`}>
                    {cycle.active ? "🟢 ACTIVE" : "🔴 CLOSED"}
                  </div>
                </div>

                <div className="cycle-details">
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span>{new Date(cycle.windowStart).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span>{new Date(cycle.windowEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span>
                      {Math.ceil(
                        (new Date(cycle.windowEnd) - new Date(cycle.windowStart)) / (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>

                <div className="cycle-actions">
  {!cycle.active ? (
    <button
      className="btn btn-success"
      onClick={() => handleActivateCycle(cycle._id)}
    >
      ✓ Activate
    </button>
  ) : (
    <button
      className="btn btn-warning"
      onClick={() => handleCloseCycle(cycle._id)}
    >
      🔒 Close
    </button>
  )}
  <button
    className="btn btn-danger"
    onClick={() => handleDeleteCycle(cycle._id)}
  >
    🗑️ Delete
  </button>
</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .form-card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #d1d5db;
        }

        .input-field,
        .select-input {
          padding: 0.75rem;
          background: #0a0e27;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .year-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #111827;
          border-radius: 6px;
        }

        .year-selector label {
          font-weight: 600;
          color: #9ca3af;
        }

        .year-selector .select-input {
          min-width: 150px;
        }

        .cycles-list {
          display: grid;
          gap: 1.5rem;
        }

        .cycle-card {
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          background: #0f1119;
          transition: all 0.2s;
        }

        .cycle-card:hover {
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        .cycle-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1f2937;
        }

        .cycle-header h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-badge.active {
          background: #064e3b;
          color: #86efac;
        }

        .status-badge.closed {
          background: #7f1d1d;
          color: #fecaca;
        }

        .cycle-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #111827;
          border-radius: 4px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-row .label {
          color: #9ca3af;
          font-weight: 600;
        }

        .cycle-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #6366f1;
          color: white;
        }

        .btn-primary:hover {
          background: #4f46e5;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .btn-warning:hover {
          background: #d97706;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

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

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}