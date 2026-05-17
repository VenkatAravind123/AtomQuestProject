import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import config from "../config.js";

const API_URL = config.API_URL;
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const FEEDBACK_OPTIONS = ["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "OFF_TRACK"];

export default function ManagerCheckins() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [formData, setFormData] = useState({
    feedback: "GOOD",
    managerNotes: "",
    actionItems: "",
  });

  useEffect(() => {
    fetchCheckins();
  }, [selectedQuarter, selectedYear]);

  async function fetchCheckins() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}/api/manager/checkins?quarter=${selectedQuarter}&year=${selectedYear}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch check-ins");
      const data = await res.json();
      setCheckins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCheckin(goalId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/manager/checkins`, {
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
      setSuccess("✅ Check-in recorded successfully!");
      setFormData({ feedback: "GOOD", managerNotes: "", actionItems: "" });
      setEditingGoalId(null);
      
      setTimeout(() => setSuccess(""), 2500);
      fetchCheckins();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading check-ins...</p>
        </div>
      </div>
    );
  }

  const groupedByEmployee = {};
  checkins.forEach(c => {
    if (!groupedByEmployee[c.employeeId._id]) {
      groupedByEmployee[c.employeeId._id] = {
        employee: c.employeeId,
        goals: []
      };
    }
    groupedByEmployee[c.employeeId._id].goals.push(c);
  });

  return (
    <div className="page">
      <div className="card">
        <h2>Team Goal Check-ins</h2>
        <p className="subtle">Record feedback on team member progress</p>

        {success && <div className="success-banner">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Filters */}
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

        {/* Check-ins by Employee */}
        {Object.keys(groupedByEmployee).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No check-ins recorded yet for this period</p>
          </div>
        ) : (
          <div className="checkins-list">
            {Object.values(groupedByEmployee).map(({ employee, goals }) => (
              <div key={employee._id} className="employee-section">
                <div className="employee-header">
                  <div>
                    <h3>{employee.name}</h3>
                    <p className="subtle">{employee.email}</p>
                  </div>
                  <div className="goal-count">
                    {goals.length} {goals.length === 1 ? "goal" : "goals"}
                  </div>
                </div>

                <div className="goals-container">
                  {goals.map((checkin) => (
                    <div key={checkin.goalId._id} className="checkin-card">
                      {/* Goal Info */}
                      <div className="goal-info">
                        <h4>{checkin.goalId.title}</h4>
                        <p className="subtle">{checkin.goalId.thrustArea}</p>
                      </div>

                      {/* Current Feedback */}
                      {checkin.feedback && (
                        <div className="current-feedback">
                          <div className="feedback-stat">
                            <span className="label">Last Feedback:</span>
                            <span className={`feedback-badge feedback-${checkin.feedback.toLowerCase()}`}>
                              {checkin.feedback.replace(/_/g, " ")}
                            </span>
                          </div>
                          {checkin.managerNotes && (
                            <div className="feedback-notes">
                              <strong>Notes:</strong> {checkin.managerNotes}
                            </div>
                          )}
                          {checkin.actionItems && (
                            <div className="action-items">
                              <strong>Action Items:</strong> {checkin.actionItems}
                            </div>
                          )}
                          <div className="feedback-date">
                            Last updated: {new Date(checkin.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Edit Form */}
                      {editingGoalId === checkin.goalId._id ? (
                        <div className="checkin-form">
                          <div className="form-group">
                            <label>Feedback</label>
                            <select
                              value={formData.feedback}
                              onChange={(e) =>
                                setFormData(prev => ({
                                  ...prev,
                                  feedback: e.target.value,
                                }))
                              }
                              className="select-input"
                            >
                              {FEEDBACK_OPTIONS.map(f => (
                                <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Manager Notes</label>
                            <textarea
                              placeholder="Provide feedback and observations..."
                              value={formData.managerNotes}
                              onChange={(e) =>
                                setFormData(prev => ({
                                  ...prev,
                                  managerNotes: e.target.value,
                                }))
                              }
                              rows="3"
                              className="textarea-input"
                            />
                          </div>

                          <div className="form-group">
                            <label>Action Items</label>
                            <textarea
                              placeholder="What should the employee focus on next?"
                              value={formData.actionItems}
                              onChange={(e) =>
                                setFormData(prev => ({
                                  ...prev,
                                  actionItems: e.target.value,
                                }))
                              }
                              rows="2"
                              className="textarea-input"
                            />
                          </div>

                          <div className="form-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleSubmitCheckin(checkin.goalId._id)}
                            >
                              Save Check-in
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setEditingGoalId(null);
                                setFormData({
                                  feedback: "GOOD",
                                  managerNotes: "",
                                  actionItems: "",
                                });
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingGoalId(checkin.goalId._id);
                            setFormData({
                              feedback: checkin.feedback || "GOOD",
                              managerNotes: checkin.managerNotes || "",
                              actionItems: checkin.actionItems || "",
                            });
                          }}
                        >
                          {checkin.feedback ? "Update Check-in" : "Add Check-in"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

        .checkins-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .employee-section {
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          background: #0f1119;
        }

        .employee-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1f2937;
        }

        .employee-header h3 {
          margin: 0 0 0.25rem 0;
        }

        .goal-count {
          background: #1f2937;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .goals-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkin-card {
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 1rem;
          background: #0a0e27;
        }

        .goal-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .current-feedback {
          background: #111827;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 0.75rem 0;
          border-left: 3px solid #6366f1;
        }

        .feedback-stat {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .feedback-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .feedback-excellent { background: #dcfce7; color: #166534; }
        .feedback-good { background: #bfdbfe; color: #1e3a8a; }
        .feedback-needs_improvement { background: #fed7aa; color: #92400e; }
        .feedback-off_track { background: #fecaca; color: #7f1d1d; }

        .feedback-notes,
        .action-items {
          font-size: 0.875rem;
          color: #d1d5db;
          margin: 0.5rem 0;
        }

        .feedback-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .checkin-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          background: #111827;
          border-radius: 4px;
          margin-top: 1rem;
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

        .textarea-input {
          padding: 0.75rem;
          background: #0a0e27;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
          font-family: inherit;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-weight: 600;
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

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
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
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}