import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import config from "../config.js";

const API_URL = config.API_URL;

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const STATUSES = ["ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED"];

export default function EmployeeUpdates() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [formData, setFormData] = useState({
    progressPercentage: 0,
    status: "ON_TRACK",
    comments: "",
  });

  useEffect(() => {
    fetchData();
  }, [selectedQuarter, selectedYear]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      // Fetch approved goals
      const sheetsRes = await fetch(`${API_URL}/api/employee/goals/sheet?year=${selectedYear}`, {
        credentials: "include",
      });
      const sheetsData = await sheetsRes.json();
      const approvedGoals = sheetsData.goals.filter(g => g.status === "APPROVED");
      setGoals(approvedGoals);

      // Fetch updates for this quarter
      const updatesRes = await fetch(
        `${API_URL}/api/employee/updates/quarterly?quarter=${selectedQuarter}&year=${selectedYear}`,
        { credentials: "include" }
      );
      const updatesData = await updatesRes.json();
      
      const updatesByGoal = {};
      updatesData.forEach(u => {
        updatesByGoal[u.goalId] = u;
      });
      setUpdates(updatesByGoal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitUpdate(goalId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/employee/goals/${goalId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          goalId,
          quarter: selectedQuarter,
          year: selectedYear,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      await res.json();
      setSuccess("✅ Update submitted successfully!");
      setFormData({ progressPercentage: 0, status: "ON_TRACK", comments: "" });
      
      setTimeout(() => setSuccess(""), 2500);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Goal Progress Updates</h2>
        <p className="subtle">Submit quarterly progress on your goals</p>

        {success && <div className="success-banner">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Quarter & Year Selector */}
        <div className="filters">
          <div className="filter-group">
            <label>Quarter:</label>
            <div className="button-group">
              {QUARTERS.map(q => (
                <button
                  key={q}
                  className={`filter-btn ${selectedQuarter === q ? "active" : ""}`}
                  onClick={() => setSelectedQuarter(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Year:</label>
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
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No approved goals for this period</p>
          </div>
        ) : (
          <div className="updates-list">
            {goals.map(goal => {
              const update = updates[goal._id];
              return (
                <div key={goal._id} className="update-card">
                  {/* Goal Info */}
                  <div className="goal-info">
                    <h4>{goal.title}</h4>
                    <div className="goal-meta">
                      <span className="meta-badge">{goal.thrustArea}</span>
                      <span className="meta-badge">{goal.weightage}%</span>
                    </div>
                  </div>

                  {/* Current Update Display */}
                  {update && (
                    <div className="update-display">
                      <div className="update-stat">
                        <span className="label">Progress:</span>
                        <span className="value">{update.progressPercentage}%</span>
                      </div>
                      <div className="update-stat">
                        <span className="label">Status:</span>
                        <span className={`status-badge status-${update.status.toLowerCase()}`}>
                          {update.status}
                        </span>
                      </div>
                      {update.comments && (
                        <div className="update-comments">{update.comments}</div>
                      )}
                      <div className="update-time">
                        Last updated: {new Date(update.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Update Form */}
                  <div className="update-form">
                    <div className="form-group">
                      <label>Progress (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progressPercentage}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            progressPercentage: parseInt(e.target.value),
                          }))
                        }
                        className="range-input"
                      />
                      <div className="range-value">{formData.progressPercentage}%</div>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="select-input"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Comments</label>
                      <textarea
                        placeholder="What's the current status? Any blockers?"
                        value={formData.comments}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            comments: e.target.value,
                          }))
                        }
                        rows="3"
                        className="textarea-input"
                      />
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleSubmitUpdate(goal._id)}
                    >
                      Submit Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .filters {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #1f2937;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-group label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: #1f2937;
          color: #9ca3af;
          border: 1px solid #374151;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .select-input {
          padding: 0.5rem;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
        }

        .updates-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .update-card {
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          background: #0f1119;
        }

        .goal-info h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
        }

        .goal-meta {
          display: flex;
          gap: 0.75rem;
        }

        .meta-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #1f2937;
          color: #9ca3af;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .update-display {
          background: #0a0e27;
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
          border-left: 3px solid #10b981;
        }

        .update-stat {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .update-stat .label {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .update-stat .value {
          font-weight: 600;
          color: #e5e7eb;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-on_track { background: #dcfce7; color: #166534; }
        .status-at_risk { background: #fed7aa; color: #92400e; }
        .status-delayed { background: #fecaca; color: #7f1d1d; }
        .status-completed { background: #bfdbfe; color: #1e3a8a; }

        .update-comments {
          font-size: 0.875rem;
          color: #d1d5db;
          margin: 0.75rem 0;
          font-style: italic;
        }

        .update-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .update-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #1f2937;
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

        .range-input {
          width: 100%;
          cursor: pointer;
        }

        .range-value {
          text-align: center;
          font-weight: 600;
          color: #6366f1;
        }

        .textarea-input {
          padding: 0.75rem;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
          font-family: inherit;
          resize: vertical;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #4f46e5;
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
      `}</style>
    </div>
  );
}