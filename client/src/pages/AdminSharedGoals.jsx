import { useEffect, useState } from "react";
import config from "../config.js";
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
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2>Shared Goals</h2>
            <p className="subtle">Create company-wide or team-specific goals</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "+ New Shared Goal"}
          </button>
        </div>

        {success && <div className="success-banner">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Create Form */}
        {showCreateForm && (
          <div className="form-card">
            <h3>Create Shared Goal Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Group Name</label>
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
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Applicable Role</label>
                  <select
                    value={createFormData.applicableRole}
                    onChange={(e) =>
                      setCreateFormData(prev => ({
                        ...prev,
                        applicableRole: e.target.value,
                      }))
                    }
                    className="select-input"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
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
                  className="textarea-input"
                />
              </div>

              {/* Goals */}
              <div className="form-section">
                <h4>Goals (Total Weightage must = 100%)</h4>
                <div className="goals-list">
                  {createFormData.goals.map((goal, idx) => (
                    <div key={idx} className="goal-input">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Thrust Area</label>
                          <select
                            value={goal.thrustArea}
                            onChange={(e) => {
                              const newGoals = [...createFormData.goals];
                              newGoals[idx].thrustArea = e.target.value;
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            className="select-input"
                            required
                          >
                            <option value="">Select thrust area</option>
                            {THRUST_AREAS.map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => {
                              const newGoals = [...createFormData.goals];
                              newGoals[idx].title = e.target.value;
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>UoM Type</label>
                          <select
                            value={goal.uomType}
                            onChange={(e) => {
                              const newGoals = [...createFormData.goals];
                              newGoals[idx].uomType = e.target.value;
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            className="select-input"
                          >
                            {UOM_TYPES.map(uom => (
                              <option key={uom} value={uom}>{uom}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Target Value</label>
                          <input
                            type="number"
                            value={goal.targetValue}
                            onChange={(e) => {
                              const newGoals = [...createFormData.goals];
                              newGoals[idx].targetValue = e.target.value;
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Weightage (%)</label>
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
                            className="input-field"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Target Date</label>
                          <input
                            type="date"
                            value={goal.targetDate}
                            onChange={(e) => {
                              const newGoals = [...createFormData.goals];
                              newGoals[idx].targetDate = e.target.value;
                              setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                            }}
                            className="input-field"
                          />
                        </div>
                      </div>

                      {createFormData.goals.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            const newGoals = createFormData.goals.filter((_, i) => i !== idx);
                            setCreateFormData(prev => ({ ...prev, goals: newGoals }));
                          }}
                        >
                          Remove Goal
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCreateFormData(prev => ({
                      ...prev,
                      goals: [...prev.goals, { thrustArea: "", title: "", description: "", uomType: "MAX", targetValue: "", targetDate: "", weightage: 0 }],
                    }));
                  }}
                >
                  + Add Goal
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Year Selector */}
        <div className="year-selector">
          <label>Assign to Year:</label>
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

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>No shared goal groups created yet</p>
          </div>
        ) : (
          <div className="groups-list">
            {groups.map(group => (
              <div key={group._id} className="group-card">
                <div className="group-header">
                  <div>
                    <h3>{group.name}</h3>
                    <p className="subtle">{group.description}</p>
                  </div>
                  <div className="group-meta">
                    <span className="role-badge">{group.applicableRole}</span>
                    <span className="goal-count">{group.goals?.length} goals</span>
                  </div>
                </div>

                <div className="goals-preview">
                  {group.goals?.map((goal, idx) => (
                    <div key={idx} className="goal-preview">
                      <span className="goal-title">{goal.title}</span>
                      <span className="goal-weightage">{goal.weightage}%</span>
                    </div>
                  ))}
                </div>

                <div className="group-actions">
                  {assigningGroupId === group._id ? (
                    <div className="assign-panel">
                      <select
                        multiple
                        value={selectedUserIds}
                        onChange={(e) => setSelectedUserIds(Array.from(e.target.selectedOptions, o => o.value))}
                        className="select-input"
                        style={{ minHeight: "150px" }}
                      >
                        {assignUsers.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleBulkAssign(group._id)}
                        >
                          ✓ Assign to {selectedUserIds.length} user(s)
                        </button>
                        <button
                          className="btn btn-secondary"
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
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenAssign(group._id, group.applicableRole)}
                      >
                        👥 Assign to Users
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
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
        .select-input,
        .textarea-input {
          padding: 0.75rem;
          background: #0a0e27;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
          font-family: inherit;
        }

        .textarea-input {
          resize: vertical;
        }

        .form-section {
          background: #0f1119;
          border: 1px solid #1f2937;
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .form-section h4 {
          margin: 0 0 1rem 0;
          color: #e5e7eb;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .goal-input {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 4px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
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

        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .group-card {
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          background: #0f1119;
          transition: all 0.2s;
        }

        .group-card:hover {
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1f2937;
        }

        .group-header h3 {
          margin: 0 0 0.25rem 0;
        }

        .group-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .role-badge {
          background: #6366f1;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .goal-count {
          background: #1f2937;
          color: #9ca3af;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .goals-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #111827;
          border-radius: 4px;
        }

        .goal-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .goal-title {
          color: #d1d5db;
        }

        .goal-weightage {
          background: #1f2937;
          color: #9ca3af;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-weight: 600;
        }

        .group-actions {
          display: flex;
          gap: 0.75rem;
        }

        .assign-panel {
          width: 100%;
          padding: 1rem;
          background: #111827;
          border-radius: 4px;
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

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
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