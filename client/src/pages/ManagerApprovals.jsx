import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ManagerApprovals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});

  useEffect(() => {
    fetchApprovals();
  }, []);

  async function fetchApprovals() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/manager/pending-approvals`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch approvals");
      const data = await res.json();
      setApprovals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(sheetId) {
    try {
      setActionInProgress(sheetId);
      const res = await fetch(`${API_URL}/api/manager/approve/${sheetId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to approve");
      await res.json();
      
      // Remove from list
      setApprovals(approvals.filter(a => a.sheet._id !== sheetId));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleReject(sheetId) {
    try {
      const reason = rejectReason[sheetId];
      if (!reason?.trim()) {
        setError("Please provide a rejection reason");
        return;
      }

      setActionInProgress(sheetId);
      const res = await fetch(`${API_URL}/api/manager/reject/${sheetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rejectionReason: reason }),
      });

      if (!res.ok) throw new Error("Failed to reject");
      await res.json();

      // Remove from list
      setApprovals(approvals.filter(a => a.sheet._id !== sheetId));
      setRejectReason(prev => ({ ...prev, [sheetId]: "" }));
      setShowRejectForm(prev => ({ ...prev, [sheetId]: false }));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card">
          <div className="error-banner">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Goal Approvals</h2>
        <p className="subtle">Review and approve team member goals</p>

        {approvals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="approvals-list">
            {approvals.map(({ sheet, goals, totalWeightage }) => (
              <div key={sheet._id} className="approval-card">
                {/* Employee Header */}
                <div className="approval-header">
                  <div>
                    <h3>{sheet.employeeId.name}</h3>
                    <p className="subtle">{sheet.employeeId.email}</p>
                  </div>
                  <div className="submission-date">
                    Submitted: {new Date(sheet.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Goals Summary */}
                <div className="goals-summary">
                  <div className="summary-stat">
                    <span className="stat-label">Total Goals:</span>
                    <span className="stat-value">{goals.length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Weightage:</span>
                    <span className={`stat-value ${totalWeightage === 100 ? "valid" : "invalid"}`}>
                      {totalWeightage}%
                    </span>
                  </div>
                </div>

                {/* Goals List */}
                <div className="goals-list">
                  {goals.map((goal) => (
                    <div key={goal._id} className="goal-item">
                      <div className="goal-title">{goal.title}</div>
                      <div className="goal-details">
                        <span className="goal-area">{goal.thrustArea}</span>
                        <span className="goal-uom">{goal.uomType}</span>
                        <span className="goal-weightage">{goal.weightage}%</span>
                      </div>
                      {goal.description && (
                        <p className="goal-description">{goal.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reject Form (if shown) */}
                {showRejectForm[sheet._id] && (
                  <div className="reject-form">
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectReason[sheet._id] || ""}
                      onChange={(e) =>
                        setRejectReason(prev => ({
                          ...prev,
                          [sheet._id]: e.target.value
                        }))
                      }
                      rows="3"
                      className="textarea"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="approval-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(sheet._id)}
                    disabled={actionInProgress === sheet._id}
                  >
                    {actionInProgress === sheet._id ? "Approving..." : "✓ Approve"}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowRejectForm(prev => ({
                        ...prev,
                        [sheet._id]: !prev[sheet._id]
                      }))
                    }
                  >
                    {showRejectForm[sheet._id] ? "Cancel" : "✕ Reject"}
                  </button>

                  {showRejectForm[sheet._id] && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(sheet._id)}
                      disabled={actionInProgress === sheet._id}
                    >
                      {actionInProgress === sheet._id ? "Rejecting..." : "Confirm Reject"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .approvals-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .approval-card {
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          background: #0f1119;
        }

        .approval-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1f2937;
        }

        .approval-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .submission-date {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .goals-summary {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .stat-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e5e7eb;
        }

        .stat-value.valid {
          color: #10b981;
        }

        .stat-value.invalid {
          color: #ef4444;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          background: #0a0e27;
          padding: 1rem;
          border-radius: 6px;
        }

        .goal-item {
          padding: 0.75rem;
          background: #111827;
          border-radius: 4px;
          border-left: 3px solid #6366f1;
        }

        .goal-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .goal-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
        }

        .goal-area,
        .goal-uom,
        .goal-weightage {
          color: #9ca3af;
        }

        .goal-description {
          font-size: 0.875rem;
          color: #d1d5db;
          margin: 0.5rem 0 0 0;
        }

        .reject-form {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #1f2937;
          border-radius: 6px;
        }

        .textarea {
          width: 100%;
          padding: 0.75rem;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 4px;
          color: #e5e7eb;
          font-family: inherit;
          resize: vertical;
        }

        .textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .approval-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #059669;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: #7f1d1d;
          color: #fecaca;
          padding: 1rem;
          border-radius: 4px;
          border: 1px solid #dc2626;
        }
      `}</style>
    </div>
  );
}