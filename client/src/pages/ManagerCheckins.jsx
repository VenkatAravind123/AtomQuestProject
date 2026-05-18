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
      <div className="page manager-checkins-page">
        <div className="card glass-card">
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
    <div className="page manager-checkins-page">
      <div className="card glass-card">
        <div className="page-header">
          <div className="header-text">
            <h2>Team Goal Check-ins</h2>
            <p className="subtle">Record feedback on team member progress</p>
          </div>
        </div>

        {success && <div className="banner success-banner fade-in"><span className="banner-icon">✓</span> {success}</div>}
        {error && <div className="banner error-banner fade-in"><span className="banner-icon">!</span> {error}</div>}

        {/* Filters */}
        <div className="controls-bar">
          <div className="filter-group-inline">
            <label className="filter-label"><span className="filter-icon">📊</span> Quarter:</label>
            <div className="quarter-tabs">
              {QUARTERS.map(q => (
                <button
                  key={q}
                  className={`quarter-tab ${selectedQuarter === q ? "active glow-effect" : ""}`}
                  onClick={() => setSelectedQuarter(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group-inline">
            <label className="filter-label"><span className="filter-icon">🗓️</span> Year:</label>
            <div className="input-wrapper select-wrapper inline-select">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Check-ins by Employee */}
        {Object.keys(groupedByEmployee).length === 0 ? (
          <div className="empty-state slide-up">
            <div className="empty-icon-wrap">
              <div className="empty-icon">💬</div>
            </div>
            <p>No check-ins recorded yet for this period</p>
          </div>
        ) : (
          <div className="checkins-wrapper">
            {Object.values(groupedByEmployee).map(({ employee, goals }, empIndex) => (
              <div key={employee._id} className="employee-section slide-up" style={{ animationDelay: `${empIndex * 0.1}s` }}>
                <div className="employee-header">
                  <div className="employee-info">
                    <div className="avatar-placeholder">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="employee-name">{employee.name}</h3>
                      <p className="employee-email subtle">{employee.email}</p>
                    </div>
                  </div>
                  <div className="goal-count-badge">
                    {goals.length} {goals.length === 1 ? "Goal" : "Goals"}
                  </div>
                </div>

                <div className="goals-container">
                  {goals.map((checkin) => (
                    <div key={checkin.goalId._id} className="checkin-card inner-glass hover-lift">
                      {/* Goal Info */}
                      <div className="goal-info">
                        <h4 className="goal-title">{checkin.goalId.title}</h4>
                        <span className="area-tag">{checkin.goalId.thrustArea}</span>
                      </div>

                      {/* Current Feedback */}
                      {checkin.feedback && (
                        <div className="current-feedback-box">
                          <div className="feedback-stat">
                            <span className="label">Last Feedback:</span>
                            <span className={`feedback-badge feedback-${checkin.feedback.toLowerCase()}`}>
                              {checkin.feedback.replace(/_/g, " ")}
                            </span>
                          </div>
                          {checkin.managerNotes && (
                            <div className="feedback-content">
                              <span className="content-label">Notes:</span>
                              <p>{checkin.managerNotes}</p>
                            </div>
                          )}
                          {checkin.actionItems && (
                            <div className="feedback-content">
                              <span className="content-label">Action Items:</span>
                              <p>{checkin.actionItems}</p>
                            </div>
                          )}
                          <div className="feedback-date">
                            Last updated: {new Date(checkin.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Edit Form */}
                      <div className={`checkin-form-wrapper ${editingGoalId === checkin.goalId._id ? 'open' : ''}`}>
                        {editingGoalId === checkin.goalId._id && (
                          <div className="checkin-form">
                            <div className="form-grid-responsive">
                              <div className="field-group">
                                <label className="float-label">Feedback</label>
                                <div className="input-wrapper select-wrapper">
                                  <select
                                    value={formData.feedback}
                                    onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                                  >
                                    {FEEDBACK_OPTIONS.map(f => (
                                      <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                                    ))}
                                  </select>
                                  <div className="focus-border"></div>
                                </div>
                              </div>
                            </div>

                            <div className="field-group">
                              <label className="float-label">Manager Notes</label>
                              <div className="input-wrapper">
                                <textarea
                                  placeholder="Provide feedback and observations..."
                                  value={formData.managerNotes}
                                  onChange={(e) => setFormData(prev => ({ ...prev, managerNotes: e.target.value }))}
                                  rows="2"
                                  className="textarea-modern"
                                />
                                <div className="focus-border"></div>
                              </div>
                            </div>

                            <div className="field-group">
                              <label className="float-label">Action Items</label>
                              <div className="input-wrapper">
                                <textarea
                                  placeholder="What should the employee focus on next?"
                                  value={formData.actionItems}
                                  onChange={(e) => setFormData(prev => ({ ...prev, actionItems: e.target.value }))}
                                  rows="2"
                                  className="textarea-modern"
                                />
                                <div className="focus-border"></div>
                              </div>
                            </div>

                            <div className="form-actions-row">
                              <button
                                className="btn-action btn-primary glow-effect"
                                onClick={() => handleSubmitCheckin(checkin.goalId._id)}
                              >
                                Save Check-in
                              </button>
                              <button
                                className="btn-action btn-cancel"
                                onClick={() => {
                                  setEditingGoalId(null);
                                  setFormData({ feedback: "GOOD", managerNotes: "", actionItems: "" });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {editingGoalId !== checkin.goalId._id && (
                        <div className="action-row-end">
                          <button
                            className="btn-outline-primary"
                            onClick={() => {
                              setEditingGoalId(checkin.goalId._id);
                              setFormData({
                                feedback: checkin.feedback || "GOOD",
                                managerNotes: checkin.managerNotes || "",
                                actionItems: checkin.actionItems || "",
                              });
                            }}
                          >
                            {checkin.feedback ? "✎ Update Check-in" : "+ Add Check-in"}
                          </button>
                        </div>
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
        /* Core Animations & Variables */
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .manager-checkins-page { perspective: 1000px; padding: 2rem 1rem; }

        /* Glassmorphism Containers */
        .glass-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border-radius: 24px; padding: 2.5rem; max-width: 1200px; width: 100%; margin: 0 auto; animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .inner-glass { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; }

        /* Header & Banners */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .header-text h2 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        
        .banner { padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
        .success-banner { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; }
        .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; }
        .fade-in { animation: fadeIn 0.4s ease-out; }

        /* Controls */
        .controls-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding: 1.25rem 1.5rem; background: rgba(30, 41, 59, 0.3); border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.1); flex-wrap: wrap; gap: 1.5rem; }
        .filter-group-inline { display: flex; align-items: center; gap: 1rem; }
        .filter-label { font-weight: 600; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; }
        
        .quarter-tabs { display: flex; gap: 0.5rem; background: rgba(15, 23, 42, 0.5); padding: 0.25rem; border-radius: 12px; }
        .quarter-tab { padding: 0.5rem 1.25rem; background: transparent; color: #94a3b8; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .quarter-tab:hover { color: #e2e8f0; }
        .quarter-tab.active { background: #6366f1; color: white; }

        .input-wrapper { position: relative; border-radius: 12px; background: rgba(15, 23, 42, 0.5); }
        .input-wrapper select { width: 100%; padding: 0.6rem 2.5rem 0.6rem 1.25rem; background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; color: #f8fafc; font-size: 0.95rem; transition: all 0.3s ease; appearance: none; }
        .input-wrapper select:focus { outline: none; border-color: transparent; background: rgba(30, 41, 59, 0.8); }
        .select-wrapper::after { content: '▼'; position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.7rem; pointer-events: none; }

        /* Employee Section */
        .checkins-wrapper { display: flex; flex-direction: column; gap: 2rem; }
        .employee-section { background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 2rem; transition: all 0.3s; }
        
        .employee-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
        .employee-info { display: flex; align-items: center; gap: 1.25rem; }
        .avatar-placeholder { width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
        .employee-name { margin: 0; font-size: 1.3rem; font-weight: 700; color: #f8fafc; }
        .employee-email { margin: 0; font-size: 0.9rem; }
        .goal-count-badge { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(99, 102, 241, 0.3); }

        /* Goals / Check-in Cards */
        .goals-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 1.5rem; }
        @media (max-width: 768px) { .goals-container { grid-template-columns: 1fr; } }
        
        .checkin-card { padding: 1.5rem; transition: all 0.3s; border-left: 3px solid #6366f1; display: flex; flex-direction: column; }
        .hover-lift:hover { transform: translateY(-3px); border-color: rgba(99, 102, 241, 0.3); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
        
        .goal-info { margin-bottom: 1.25rem; }
        .goal-title { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #e2e8f0; font-weight: 600; line-height: 1.4; }
        .area-tag { display: inline-block; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 6px; background: rgba(148, 163, 184, 0.1); color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Feedback Display */
        .current-feedback-box { background: rgba(15, 23, 42, 0.4); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.25rem; flex: 1; }
        .feedback-stat { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
        .feedback-stat .label { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
        .feedback-badge { padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .feedback-excellent { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .feedback-good { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .feedback-needs_improvement { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .feedback-off_track { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

        .feedback-content { margin-bottom: 0.75rem; }
        .content-label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 0.25rem; }
        .feedback-content p { margin: 0; font-size: 0.9rem; color: #e2e8f0; line-height: 1.5; }
        .feedback-date { font-size: 0.75rem; color: #64748b; margin-top: 1rem; font-style: italic; }

        /* Forms */
        .checkin-form-wrapper { max-height: 0; overflow: hidden; transition: max-height 0.6s ease; opacity: 0; }
        .checkin-form-wrapper.open { max-height: 800px; opacity: 1; margin-top: 1rem; }
        .checkin-form { display: flex; flex-direction: column; gap: 1.25rem; background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
        
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
        .float-label { font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-left: 0.25rem; }
        .textarea-modern { width: 100%; padding: 1rem 1.25rem; background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; color: #f8fafc; font-size: 0.95rem; transition: all 0.3s ease; appearance: none; font-family: inherit; resize: vertical; min-height: 80px; }
        .textarea-modern:focus { outline: none; border-color: transparent; background: rgba(30, 41, 59, 0.8); }
        .focus-border { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px; background: #6366f1; transition: width 0.3s ease; opacity: 0; }
        .input-wrapper select:focus ~ .focus-border, .textarea-modern:focus ~ .focus-border { width: 100%; opacity: 1; }

        /* Actions */
        .action-row-end { display: flex; justify-content: flex-end; margin-top: auto; padding-top: 1rem; }
        .form-actions-row { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
        
        .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.85rem; border: none; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
        .btn-cancel { background: rgba(148, 163, 184, 0.1); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.2); }
        .btn-cancel:hover { background: rgba(148, 163, 184, 0.2); }
        
        .btn-outline-primary { background: transparent; border: 1px solid rgba(99, 102, 241, 0.5); color: #a5b4fc; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
        .btn-outline-primary:hover { background: rgba(99, 102, 241, 0.1); border-color: #818cf8; color: #c7d2fe; }

        .glow-effect { position: relative; overflow: hidden; }
        .glow-effect::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1); z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.3s; }
        .glow-effect:hover::before { opacity: 1; }
        .glow-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

        /* Empty State */
        .empty-state { text-align: center; padding: 4rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-icon-wrap { width: 80px; height: 80px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .empty-icon { font-size: 2.5rem; }
        .empty-state p { font-size: 1.1rem; color: #cbd5e1; font-weight: 500; }
        .slide-up { animation: slideUp 0.5s ease-out backwards; }
      `}</style>
    </div>
  );
}

