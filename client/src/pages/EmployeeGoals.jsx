import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const THRUST_AREAS = ["Leadership", "Technical Excellence", "Customer Focus", "Innovation", "Team Building"];
const UOM_TYPES = ["MIN", "MAX", "TIMELINE", "ZERO"];

export default function EmployeeGoals() {
  const [sheet, setSheet] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    thrustArea: THRUST_AREAS[0],
    title: "",
    description: "",
    uomType: UOM_TYPES[0],
    targetValue: "",
    targetDate: "",
    weightage: "",
  });

  const [touched, setTouched] = useState({});

  // Fetch goal sheet on mount
  useEffect(() => {
    fetchGoalSheet();
  }, []);

  async function fetchGoalSheet() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/employee/goals/sheet`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch goal sheet");

      const data = await res.json();
      setSheet(data.sheet);
      setGoals(data.goals);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Validation
  function validate() {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.targetValue) errors.targetValue = "Target value is required";
    if (formData.targetValue && isNaN(formData.targetValue)) {
      errors.targetValue = "Must be a number";
    }
    if (!formData.weightage) errors.weightage = "Weightage is required";
    if (formData.weightage && isNaN(formData.weightage)) {
      errors.weightage = "Must be a number";
    }
    if (formData.weightage && (formData.weightage < 1 || formData.weightage > 100)) {
      errors.weightage = "Must be 1-100";
    }
    return errors;
  }

  const formErrors = validate();
  const canSubmit = Object.keys(formErrors).length === 0;

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  const totalValid = totalWeightage === 100;
  const canSubmitSheet = totalWeightage > 0 && totalValid && goals.length > 0;

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTouched({ title: true, targetValue: true, weightage: true });

    if (!canSubmit || !sheet) return;

    try {
      setLoading(true);

      if (editing) {
        // Update goal
        const res = await fetch(`${API_URL}/api/employee/goals/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to update goal");
        }

        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
        setSuccess("✓ Goal updated");
      } else {
        // Create goal
        const res = await fetch(`${API_URL}/api/employee/goals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            goalSheetId: sheet._id,
            ...formData,
            targetValue: Number(formData.targetValue),
            weightage: Number(formData.weightage),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create goal");
        }

        const newGoal = await res.json();
        setGoals((prev) => [...prev, newGoal]);
        setSuccess("✓ Goal created");
      }

      setFormData({
        thrustArea: THRUST_AREAS[0],
        title: "",
        description: "",
        uomType: UOM_TYPES[0],
        targetValue: "",
        targetDate: "",
        weightage: "",
      });
      setTouched({});
      setEditing(null);
      setShowForm(false);

      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete
  async function handleDelete(goalId) {
    if (!confirm("Delete this goal?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/employee/goals/${goalId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete goal");

      setGoals((prev) => prev.filter((g) => g._id !== goalId));
      setSuccess("✓ Goal deleted");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle edit
  function handleEdit(goal) {
    setEditing(goal);
    setFormData({
      thrustArea: goal.thrustArea,
      title: goal.title,
      description: goal.description || "",
      uomType: goal.uomType,
      targetValue: goal.targetValue.toString(),
      targetDate: goal.targetDate ? goal.targetDate.split("T")[0] : "",
      weightage: goal.weightage.toString(),
    });
    setShowForm(true);
    setTouched({});
    setError("");
  }

  // Handle submit sheet
  async function handleSubmitSheet() {
    if (!canSubmitSheet) {
      setError("Total weightage must be 100%");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/employee/goals/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goalSheetId: sheet._id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit");
      }

      const updated = await res.json();
      setSheet(updated.sheet);
      setSuccess("✓ Goal sheet submitted successfully! Awaiting manager approval.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !sheet) {
    return (
      <div className="page">
        <div className="card">
          <div className="loading">Loading your goal sheet...</div>
        </div>
      </div>
    );
  }

  const isLocked = sheet && sheet.status !== "DRAFT";

  return (
    <div className="page">
      <div className="card">
        <div className="section-header">
          <div>
            <h2>My Goals - {sheet?.year}</h2>
            <p className="subtle">
              Status: <span className={`badge badge--${sheet?.status.toLowerCase()}`}>{sheet?.status}</span>
            </p>
          </div>
          {!isLocked && (
            <button
              className="btn btn--primary"
              onClick={() => {
                if (!showForm) {
                  setFormData({
                    thrustArea: THRUST_AREAS[0],
                    title: "",
                    description: "",
                    uomType: UOM_TYPES[0],
                    targetValue: "",
                    targetDate: "",
                    weightage: "",
                  });
                  setEditing(null);
                  setTouched({});
                }
                setShowForm(!showForm);
                setError("");
              }}
            >
              {showForm ? "Cancel" : "+ Add Goal"}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && !isLocked && (
          <div className="form-section">
            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="label" htmlFor="thrustArea">Thrust Area</label>
                <select
                  id="thrustArea"
                  value={formData.thrustArea}
                  onChange={(e) => setFormData((p) => ({ ...p, thrustArea: e.target.value }))}
                >
                  {THRUST_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="title">Goal Title *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="E.g., Complete API migration"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                  aria-invalid={!!(touched.title && formErrors.title)}
                />
                {touched.title && formErrors.title && (
                  <div className="fieldError">{formErrors.title}</div>
                )}
              </div>

              <div className="field">
                <label className="label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Additional context or acceptance criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="label" htmlFor="uomType">Unit of Measure</label>
                  <select
                    id="uomType"
                    value={formData.uomType}
                    onChange={(e) => setFormData((p) => ({ ...p, uomType: e.target.value }))}
                  >
                    {UOM_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label" htmlFor="targetValue">Target Value *</label>
                  <input
                    id="targetValue"
                    type="number"
                    placeholder="E.g., 100"
                    value={formData.targetValue}
                    onChange={(e) => setFormData((p) => ({ ...p, targetValue: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, targetValue: true }))}
                    aria-invalid={!!(touched.targetValue && formErrors.targetValue)}
                  />
                  {touched.targetValue && formErrors.targetValue && (
                    <div className="fieldError">{formErrors.targetValue}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="label" htmlFor="targetDate">Target Date</label>
                  <input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData((p) => ({ ...p, targetDate: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="weightage">Weightage (%) *</label>
                  <input
                    id="weightage"
                    type="number"
                    placeholder="10-100"
                    min="1"
                    max="100"
                    value={formData.weightage}
                    onChange={(e) => setFormData((p) => ({ ...p, weightage: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, weightage: true }))}
                    aria-invalid={!!(touched.weightage && formErrors.weightage)}
                  />
                  {touched.weightage && formErrors.weightage && (
                    <div className="fieldError">{formErrors.weightage}</div>
                  )}
                </div>
              </div>

              <div className="actions">
                <button
                  className="btn btn--primary btn--full"
                  type="submit"
                  disabled={!canSubmit || loading}
                >
                  {loading ? <><span className="spinner" />Saving…</> : editing ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>

            {error && <div className="error">⚠️ {error}</div>}
            {success && <div className="success">{success}</div>}
          </div>
        )}

        {/* Weightage Indicator */}
        {goals.length > 0 && (
          <div className="section">
            <h3>Goal Summary</h3>
            <div className="weightage-indicator">
              <div className="weightage-bar">
                <div
                  className="weightage-fill"
                  style={{
                    width: `${Math.min(totalWeightage, 100)}%`,
                    backgroundColor: totalWeightage === 100 ? "#10b981" : totalWeightage > 100 ? "#ef4444" : "#f59e0b",
                  }}
                />
              </div>
              <p className="subtle">
                <strong>{goals.length}/8 Goals</strong> • Total: <strong>{totalWeightage}%</strong>
                {totalValid ? " ✓" : totalWeightage > 100 ? " ❌ Over 100%" : " ❌ Under 100%"}
              </p>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="section">
          <h3>Goals ({goals.length}/8)</h3>

          {goals.length === 0 ? (
            <p className="subtle">No goals yet. Click "+ Add Goal" to get started!</p>
          ) : (
            <div className="goals-list">
              {goals.map((goal) => (
                <div key={goal._id} className="goal-card">
                  <div className="goal-header">
                    <div>
                      <h4>{goal.title}</h4>
                      <p className="subtle">
                        {goal.thrustArea} • {goal.uomType} • Target: {goal.targetValue}
                        {goal.targetDate && ` by ${new Date(goal.targetDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="goal-meta">
                      <span className="badge badge--weightage">{goal.weightage}%</span>
                    </div>
                  </div>

                  {goal.description && <p className="subtle">{goal.description}</p>}

                  {!isLocked && (
                    <div className="goal-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleEdit(goal)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--ghost btn--sm btn--danger"
                        onClick={() => handleDelete(goal._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!isLocked && goals.length > 0 && (
          <div className="section">
            <button
              className="btn btn--primary btn--full"
              onClick={handleSubmitSheet}
              disabled={!canSubmitSheet || loading}
              title={canSubmitSheet ? "Submit your goal sheet to manager for approval" : "Total weightage must be 100%"}
            >
              {loading ? (
                <><span className="spinner" />Submitting…</>
              ) : (
                "Submit Goal Sheet for Approval"
              )}
            </button>
            {!totalValid && <p className="fieldError">⚠️ Total weightage must equal 100%</p>}
          </div>
        )}

        {sheet?.status === "SUBMITTED" && (
          <div className="info">
            ℹ️ Your goal sheet has been submitted. Waiting for manager approval.
          </div>
        )}

        {sheet?.status === "RETURNED" && (
          <div className="warning">
            ⚠️ Your goal sheet was returned. Reason: {sheet.returnedReason || "No reason provided"}
          </div>
        )}

        {sheet?.status === "LOCKED" && (
          <div className="success">
            ✓ Your goal sheet has been approved and locked.
          </div>
        )}

        {error && !showForm && <div className="error">⚠️ {error}</div>}
      </div>

      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .weightage-indicator {
          margin: 1rem 0;
        }

        .weightage-bar {
          height: 10px;
          background: #1e293b;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .weightage-fill {
          height: 100%;
          transition: width 0.3s, background-color 0.3s;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .goal-card {
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 1rem;
          background: #0f172a;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }

        .goal-header h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .goal-meta {
          display: flex;
          gap: 0.5rem;
        }

        .badge--weightage {
          background: #6366f1;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .badge--draft { background: #6b7280; }
        .badge--submitted { background: #3b82f6; }
        .badge--returned { background: #f59e0b; }
        .badge--locked { background: #10b981; }

        .goal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .btn--sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn--danger {
          color: #ef4444;
        }

        .info {
          background: #0369a1;
          color: #e0f2fe;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .warning {
          background: #92400e;
          color: #fef3c7;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .goal-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .goal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}