import { useEffect, useState } from "react";
import config from "../config.js";
import { MdDelete } from "react-icons/md";
const API_URL = config.API_URL;
const ROLES = ["EMPLOYEE", "MANAGER", "ADMIN"];
const UOM_TYPES = ["MIN", "MAX", "TIMELINE", "ZERO"];
const THRUST_AREAS = ["Customer Focus", "Innovation", "Leadership", "Team Building", "Operational Excellence"];

export default function AdminSharedGoals() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    applicableRole: "EMPLOYEE",
    goals: [{ thrustArea: "", title: "", description: "", uomType: "MAX", targetValue: "", targetDate: "", weightage: 0 }],
  });

  // Assign state
  const [assigningGroupId, setAssigningGroupId] = useState(null);
  const [assignUsers, setAssignUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/admin/shared-goals`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch shared goals");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    try {
      setError("");

      const totalWeightage = createFormData.goals.reduce((sum, g) => sum + (parseInt(g.weightage) || 0), 0);
      if (totalWeightage !== 100) {
        setError(`Total weightage must be 100%, got ${totalWeightage}%`);
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/shared-goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: createFormData.name,
          description: createFormData.description,
          applicableRole: createFormData.applicableRole,
          goals: createFormData.goals,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setSuccess("✅ Shared goal group created!");
      setShowCreateForm(false);
      setCreateFormData({
        name: "",
        description: "",
        applicableRole: "EMPLOYEE",
        goals: [{ thrustArea: "", title: "", description: "", uomType: "MAX", targetValue: "", targetDate: "", weightage: 0 }],
      });

      setTimeout(() => setSuccess(""), 2500);
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOpenAssign(groupId, role) {
    try {
      setAssigningGroupId(groupId);
      const res = await fetch(`${API_URL}/api/admin/users-by-role?role=${role}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setAssignUsers(data);
      setSelectedUserIds([]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBulkAssign(groupId) {
    try {
      setError("");

      if (selectedUserIds.length === 0) {
        setError("Please select at least one user");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/shared-goals/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          groupId,
          employeeIds: selectedUserIds,
          year: selectedYear,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setSuccess("✅ Goals assigned successfully!");
      setAssigningGroupId(null);
      setSelectedUserIds([]);
      setAssignUsers([]);

      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteGroup(groupId) {
    if (!confirm("Delete this shared goal group?")) return;

    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/shared-goals/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete group");

      setSuccess("✅ Group deleted!");
      setTimeout(() => setSuccess(""), 2500);
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading shared goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-shared-goals-page">
      <div className="card glass-card">
        <div className="page-header">
          <div className="header-text">
            <h2>Shared Goals</h2>
            <p className="subtle">Create company-wide or team-specific goals</p>
          </div>
          <button
            className={`btn toggle-btn ${showCreateForm ? "btn-cancel" : "btn-primary glow-effect"}`} style={{color: showCreateForm ? "#f87171" : "white"}}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "+ New Shared Goal"}
          </button>
        </div>

        {success && <div className="banner success-banner fade-in"><span className="banner-icon">✓</span> {success}</div>}
        {error && <div className="banner error-banner fade-in"><span className="banner-icon">!</span> {error}</div>}

        {/* Create Form */}
        <div className={`form-wrapper ${showCreateForm ? 'open' : ''}`}>
          <div className="form-card inner-glass">
            <h3>Create Shared Goal Group</h3>
            <form onSubmit={handleCreateGroup} className="modern-form">
              <div className="form-grid">
                <div className="field-group">
                  <label className="float-label">Group Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="e.g., Q1 Company Goals"
                      value={createFormData.name}
                      onChange={(e) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <div className="focus-border"></div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="float-label">Applicable Role</label>
                  <div className="input-wrapper select-wrapper">
                    <select
                      value={createFormData.applicableRole}
                      onChange={(e) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          applicableRole: e.target.value,
                        }))
                      }
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div className="focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label className="float-label">Description</label>
                <div className="input-wrapper">
                  <textarea
                    placeholder="Brief description of these goals"
                    value={createFormData.description}
                    onChange={(e) =>
                      setCreateFormData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows="2"
                    className="textarea-modern"
                  />
                  <div className="focus-border"></div>
                </div>
              </div>

              {/* Goals */}
              <div className="form-section group-box">
                <div className="section-header-box">
                  <h4>Goals</h4>
                  <span className="weight-badge">Total Weightage must = 100%</span>
                </div>
                
                <div className="goals-list-dynamic">
                  {createFormData.goals.map((goal, idx) => (
                    <div key={idx} className="goal-input-card fade-in">
                      <div className="goal-input-header">
                        <span className="goal-number">Goal {idx + 1}</span>
                        {createFormData.goals.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon-danger"
                            onClick={() => {
                              const newGoals = createFormData.goals.filter((_, i) => i !== idx);
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            title="Remove Goal"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="form-grid">
                        <div className="field-group">
                          <label className="float-label">Thrust Area</label>
                          <div className="input-wrapper select-wrapper">
                            <select
                              value={goal.thrustArea}
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].thrustArea = e.target.value;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                              required
                            >
                              <option value="">Select thrust area</option>
                              {THRUST_AREAS.map(area => (
                                <option key={area} value={area}>{area}</option>
                              ))}
                            </select>
                            <div className="focus-border"></div>
                          </div>
                        </div>

                        <div className="field-group">
                          <label className="float-label">Title</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              value={goal.title}
                              placeholder="e.g., Increase Revenue"
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].title = e.target.value;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                              required
                            />
                            <div className="focus-border"></div>
                          </div>
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="field-group">
                          <label className="float-label">UoM Type</label>
                          <div className="input-wrapper select-wrapper">
                            <select
                              value={goal.uomType}
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].uomType = e.target.value;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                            >
                              {UOM_TYPES.map(uom => (
                                <option key={uom} value={uom}>{uom}</option>
                              ))}
                            </select>
                            <div className="focus-border"></div>
                          </div>
                        </div>

                        <div className="field-group">
                          <label className="float-label">Target Value</label>
                          <div className="input-wrapper">
                            <input
                              type="number"
                              value={goal.targetValue}
                              placeholder="e.g., 100"
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].targetValue = e.target.value;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                            />
                            <div className="focus-border"></div>
                          </div>
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="field-group">
                          <label className="float-label">Weightage (%)</label>
                          <div className="input-wrapper">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={goal.weightage}
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].weightage = parseInt(e.target.value) || 0;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                              required
                            />
                            <div className="focus-border"></div>
                          </div>
                        </div>

                        <div className="field-group">
                          <label className="float-label">Target Date</label>
                          <div className="input-wrapper">
                            <input
                              type="date"
                              value={goal.targetDate}
                              onChange={(e) => {
                                const newGoals = [...createFormData.goals];
                                newGoals[idx].targetDate = e.target.value;
                                setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                              }}
                            />
                            <div className="focus-border"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-goal-action">
                  <button
                    type="button"
                    className="btn-outline-dashed"
                    onClick={() => {
                      setCreateFormData(prev => ({
                        ...prev,
                        goals: [...prev.goals, { thrustArea: "", title: "", description: "", uomType: "MAX", targetValue: "", targetDate: "", weightage: 0 }],
                      }));
                    }}
                  >
                    + Add Another Goal
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn glow-effect">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Year Selector */}
        <div className="controls-bar">
          <div className="year-selector">
            <span className="filter-icon">🗓️</span>
            <label>Assign to Year:</label>
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

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="empty-state slide-up">
            <div className="empty-icon-wrap">
              <div className="empty-icon">🎯</div>
            </div>
            <p>No shared goal groups created yet</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group, index) => (
              <div 
                key={group._id} 
                className="group-card hover-lift slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="group-header">
                  <div>
                    <h3 className="group-title">{group.name}</h3>
                    <p className="group-desc subtle">{group.description}</p>
                  </div>
                  <div className="group-meta">
                    <span className="role-badge pulse-badge">{group.applicableRole}</span>
                  </div>
                </div>

                <div className="goals-preview-box">
                  <div className="goals-header">
                    <span>{group.goals?.length} Goals</span>
                    <span className="weight-total">100% Weightage</span>
                  </div>
                  <div className="goals-track">
                    {group.goals?.map((goal, idx) => (
                      <div key={idx} className="goal-mini">
                        <div className="goal-mini-info">
                          <span className="goal-mini-dot"></span>
                          <span className="goal-mini-title">{goal.title}</span>
                        </div>
                        <span className="goal-mini-weight">{goal.weightage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="group-actions-area">
                  {assigningGroupId === group._id ? (
                    <div className="assign-panel fade-in">
                      <label className="assign-label">Select Users to Assign:</label>
                      <div className="input-wrapper select-wrapper">
                        <select
                          multiple
                          value={selectedUserIds}
                          onChange={(e) => setSelectedUserIds(Array.from(e.target.selectedOptions, o => o.value))}
                          className="multi-select"
                        >
                          {assignUsers.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="assign-actions">
                        <button
                          className="btn-action btn-success glow-effect"
                          onClick={() => handleBulkAssign(group._id)}
                        >
                          ✓ Assign ({selectedUserIds.length})
                        </button>
                        <button
                          className="btn-action btn-cancel"
                          onClick={() => {
                            setAssigningGroupId(null);
                            setSelectedUserIds([]);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="action-row">
                      <button
                        className="btn-action btn-primary"
                        onClick={() => handleOpenAssign(group._id, group.applicableRole)}
                      >
                        👥 Assign Users
                      </button>
                      <button
                        className="btn-action btn-danger btn-icon-only"
                        onClick={() => handleDeleteGroup(group._id)}
                        title="Delete Group"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* Shared Core Animations & Variables */
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
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

        .admin-shared-goals-page {
          perspective: 1000px;
          padding: 2rem 1rem;
        }

        /* Glassmorphism Containers */
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 1100px;
          width: 100%;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .inner-glass {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
        }

        /* Header */
        .page-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;
        }
        .header-text h2 {
          font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; letter-spacing: -0.02em;
        }

        /* Banners */
        .banner { padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
        .success-banner { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; }
        .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; }
        .fade-in { animation: fadeIn 0.4s ease-out; }

        /* Form section */
        .form-wrapper {
          max-height: 0; overflow: hidden; transition: max-height 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s; opacity: 0; margin-bottom: 0;
        }
        .form-wrapper.open { max-height: 2000px; opacity: 1; margin-bottom: 2.5rem; }
        .form-card { padding: 2rem; }
        .form-card h3 { margin-bottom: 1.5rem; font-size: 1.3rem; color: #f8fafc; font-weight: 700; }

        .modern-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        /* Inputs */
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
        .float-label { font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-left: 0.25rem; }
        .input-wrapper { position: relative; border-radius: 12px; background: rgba(15, 23, 42, 0.5); }
        
        .input-wrapper input, .input-wrapper select, .textarea-modern {
          width: 100%; padding: 1rem 1.25rem; background: transparent; border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px; color: #f8fafc; font-size: 0.95rem; transition: all 0.3s ease; appearance: none; font-family: inherit;
        }
        .textarea-modern { resize: vertical; min-height: 80px; }
        .input-wrapper input:focus, .input-wrapper select:focus, .textarea-modern:focus {
          outline: none; border-color: transparent; background: rgba(30, 41, 59, 0.8); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
        }
        .focus-border { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px; background: #6366f1; transition: width 0.3s ease; opacity: 0; }
        .input-wrapper input:focus ~ .focus-border, .input-wrapper select:focus ~ .focus-border, .textarea-modern:focus ~ .focus-border { width: 100%; opacity: 1; }
        
        .select-wrapper::after { content: '▼'; position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.7rem; pointer-events: none; }

        /* Dynamic Goals Form Section */
        .group-box {
          background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 1.5rem; margin-top: 1rem;
        }
        .section-header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-header-box h4 { margin: 0; font-size: 1.1rem; color: #e2e8f0; }
        .weight-badge { background: rgba(99, 102, 241, 0.1); color: #a5b4fc; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }

        .goals-list-dynamic { display: flex; flex-direction: column; gap: 1.5rem; }
        .goal-input-card {
          background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 12px; padding: 1.5rem;
          position: relative; transition: all 0.3s;
        }
        .goal-input-card:hover { border-color: rgba(99, 102, 241, 0.3); }
        .goal-input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); padding-bottom: 0.75rem; }
        .goal-number { font-weight: 700; color: #818cf8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .btn-icon-danger { background: rgba(239, 68, 68, 0.1); color: #f87171; border: none; width: 28px; height: 28px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-icon-danger:hover { background: #ef4444; color: white; transform: scale(1.05); }

        .add-goal-action { margin-top: 1.5rem; text-align: center; }
        .btn-outline-dashed {
          background: transparent; border: 2px dashed rgba(99, 102, 241, 0.4); color: #a5b4fc; padding: 0.75rem 1.5rem; border-radius: 12px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%;
        }
        .btn-outline-dashed:hover { background: rgba(99, 102, 241, 0.1); border-color: #818cf8; color: #c7d2fe; }

        /* Buttons */
        .btn { padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; border: none; font-size: 0.95rem; }
        .toggle-btn { min-width: 160px; }
        .btn-cancel { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .btn-cancel:hover { background: rgba(239, 68, 68, 0.2); }
        
        .submit-btn {
          padding: 1rem 2rem; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; position: relative; overflow: hidden;
        }
        .glow-effect::before {
          content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1); z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.3s;
        }
        .glow-effect:hover::before { opacity: 1; }
        .glow-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

        /* Controls */
        .controls-bar {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
          padding: 1rem 1.5rem; background: rgba(30, 41, 59, 0.3); border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .year-selector { display: flex; align-items: center; gap: 1rem; }
        .year-selector label { font-weight: 600; color: #cbd5e1; }
        .inline-select select { padding: 0.5rem 2.5rem 0.5rem 1rem; background: rgba(15, 23, 42, 0.8); }

        /* Groups Grid */
        .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        
        .group-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .hover-lift:hover {
          transform: translateY(-5px); border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
        }
        .slide-up { animation: slideUp 0.5s ease-out backwards; }

        .group-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .group-title { margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
        .group-desc { font-size: 0.9rem; line-height: 1.4; }
        
        .role-badge {
          background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 0.35rem 0.85rem;
          border-radius: 12px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(99, 102, 241, 0.3);
          letter-spacing: 0.05em;
        }

        /* Goals Preview Box */
        .goals-preview-box {
          background: rgba(15, 23, 42, 0.5); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; flex: 1;
        }
        .goals-header { display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .goals-track { display: flex; flex-direction: column; gap: 0.5rem; }
        .goal-mini { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 0.4rem 0; }
        .goal-mini-info { display: flex; align-items: center; gap: 0.5rem; color: #cbd5e1; }
        .goal-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; }
        .goal-mini-title { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .goal-mini-weight { background: rgba(148, 163, 184, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #94a3b8; }

        /* Assign Actions & Row */
        .group-actions-area { border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 1.25rem; margin-top: auto; }
        .action-row { display: flex; gap: 0.75rem; }
        
        .btn-action {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.75rem; border: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .btn-primary { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
        .btn-primary:hover { background: rgba(99, 102, 241, 0.2); transform: translateY(-2px); }
        .btn-danger { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .btn-danger:hover { background: rgba(239, 68, 68, 0.2); transform: translateY(-2px); }
        .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .btn-icon-only { flex: 0 0 44px; padding: 0; font-size: 1.1rem; }

        /* Assign Panel */
        .assign-panel { background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 12px; border: 1px solid #374151; }
        .assign-label { display: block; font-size: 0.85rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.75rem; }
        .multi-select { min-height: 120px; background: rgba(15, 23, 42, 0.8) !important; padding: 0.5rem !important; }
        .multi-select option { padding: 0.5rem; border-radius: 4px; margin-bottom: 2px; }
        .multi-select option:checked { background: rgba(99, 102, 241, 0.4); color: white; }
        .assign-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }

        /* Empty State */
        .empty-state { text-align: center; padding: 4rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-icon-wrap { width: 80px; height: 80px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .empty-icon { font-size: 2.5rem; }
        .empty-state p { font-size: 1.1rem; color: #cbd5e1; font-weight: 500; }
      `}</style>
    </div>
  );
}

