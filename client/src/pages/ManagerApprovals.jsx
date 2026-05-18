import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import config from "../config.js";

const API_URL = config.API_URL;

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
      <div className="page manager-approvals-page">
        <div className="card glass-card">
          <p>Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page manager-approvals-page">
        <div className="card glass-card">
          <div className="error-banner">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page manager-approvals-page">
      <div className="card glass-card">
        <div className="page-header">
          <div className="header-text">
            <h2>Goal Approvals</h2>
            <p className="subtle">Review and approve team member goals</p>
          </div>
        </div>

        {approvals.length === 0 ? (
          <div className="empty-state slide-up">
            <div className="empty-icon-wrap">
              <div className="empty-icon">✅</div>
            </div>
            <p>No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="approvals-grid">
            {approvals.map(({ sheet, goals, totalWeightage }, index) => (
              <div 
                key={sheet._id} 
                className="approval-card hover-lift slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Employee Header */}
                <div className="approval-header">
                  <div className="employee-info">
                    <div className="avatar-placeholder">
                      {sheet.employeeId.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="employee-name">{sheet.employeeId.name}</h3>
                      <p className="employee-email subtle">{sheet.employeeId.email}</p>
                    </div>
                  </div>
                  <div className="submission-date">
                    <span className="date-icon">📅</span>
                    {new Date(sheet.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Goals Summary */}
                <div className="goals-summary-box">
                  <div className="summary-stat">
                    <span className="stat-label">Total Goals</span>
                    <span className="stat-value">{goals.length}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="summary-stat">
                    <span className="stat-label">Weightage</span>
                    <span className={`stat-value ${totalWeightage === 100 ? "valid-weight" : "invalid-weight"}`}>
                      {totalWeightage}%
                    </span>
                  </div>
                </div>

                {/* Goals List */}
                <div className="goals-list-scroll">
                  {goals.map((goal) => (
                    <div key={goal._id} className="goal-item-card">
                      <div className="goal-title-row">
                        <div className="goal-title">{goal.title}</div>
                        <span className="goal-weight-badge">{goal.weightage}%</span>
                      </div>
                      <div className="goal-tags">
                        <span className="tag area-tag">{goal.thrustArea}</span>
                        <span className="tag uom-tag">{goal.uomType}</span>
                      </div>
                      {goal.description && (
                        <p className="goal-desc">{goal.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reject Form (if shown) */}
                <div className={`reject-form-wrapper ${showRejectForm[sheet._id] ? 'open' : ''}`}>
                  <div className="reject-form inner-glass">
                    <label className="float-label">Rejection Reason</label>
                    <div className="input-wrapper">
                      <textarea
                        placeholder="Please explain what needs to be changed..."
                        value={rejectReason[sheet._id] || ""}
                        onChange={(e) =>
                          setRejectReason(prev => ({
                            ...prev,
                            [sheet._id]: e.target.value
                          }))
                        }
                        rows="3"
                        className="textarea-modern"
                      />
                      <div className="focus-border"></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="approval-actions-area">
                  <button
                    className="btn-action btn-success glow-effect"
                    onClick={() => handleApprove(sheet._id)}
                    disabled={actionInProgress === sheet._id}
                  >
                    {actionInProgress === sheet._id ? "Approving..." : "✓ Approve"}
                  </button>

                  <button
                    className="btn-action btn-cancel"
                    onClick={() =>
                      setShowRejectForm(prev => ({
                        ...prev,
                        [sheet._id]: !prev[sheet._id]
                      }))
                    }
                  >
                    {showRejectForm[sheet._id] ? "Cancel Reject" : "✕ Reject"}
                  </button>

                  {showRejectForm[sheet._id] && (
                    <button
                      className="btn-action btn-danger glow-effect"
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
        /* Core Animations & Glassmorphism */
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .manager-approvals-page { perspective: 1000px; padding: 2rem 1rem; }

        .glass-card {
          background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: 24px; padding: 2.5rem; max-width: 1200px; width: 100%; margin: 0 auto;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .inner-glass { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .header-text h2 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; letter-spacing: -0.02em; }

        .approvals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
        @media (max-width: 768px) { .approvals-grid { grid-template-columns: 1fr; } }

        .approval-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column;
        }
        .hover-lift:hover { transform: translateY(-5px); border-color: rgba(99, 102, 241, 0.3); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1); }
        .slide-up { animation: slideUp 0.5s ease-out backwards; }

        .approval-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1); padding-bottom: 1.25rem; }
        .employee-info { display: flex; align-items: center; gap: 1rem; }
        .avatar-placeholder { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; }
        .employee-name { margin: 0; font-size: 1.2rem; font-weight: 700; color: #f8fafc; }
        .employee-email { margin: 0; font-size: 0.85rem; }
        .submission-date { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #94a3b8; background: rgba(15, 23, 42, 0.5); padding: 0.4rem 0.8rem; border-radius: 20px; }

        .goals-summary-box { display: flex; align-items: center; justify-content: space-around; background: rgba(15, 23, 42, 0.4); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
        .summary-stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
        .stat-divider { width: 1px; height: 30px; background: rgba(148, 163, 184, 0.2); }
        .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .stat-value { font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
        .valid-weight { color: #34d399; }
        .invalid-weight { color: #f87171; }

        .goals-list-scroll { display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto; margin-bottom: 1.5rem; padding-right: 0.5rem; }
        .goals-list-scroll::-webkit-scrollbar { width: 6px; }
        .goals-list-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
        .goals-list-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 4px; }
        
        .goal-item-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 10px; padding: 1rem; border-left: 3px solid #6366f1; transition: all 0.2s; }
        .goal-item-card:hover { background: rgba(30, 41, 59, 0.8); }
        .goal-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 1rem; }
        .goal-title { font-weight: 600; color: #e2e8f0; font-size: 0.95rem; line-height: 1.3; }
        .goal-weight-badge { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
        .goal-tags { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .tag { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .area-tag { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .uom-tag { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .goal-desc { font-size: 0.85rem; color: #94a3b8; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .reject-form-wrapper { max-height: 0; overflow: hidden; transition: max-height 0.5s ease; opacity: 0; }
        .reject-form-wrapper.open { max-height: 200px; opacity: 1; margin-bottom: 1.5rem; }
        .reject-form { padding: 1.25rem; }
        .float-label { font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-left: 0.25rem; margin-bottom: 0.5rem; display: block; }
        .input-wrapper { position: relative; border-radius: 12px; background: rgba(15, 23, 42, 0.5); }
        .textarea-modern { width: 100%; padding: 1rem; background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; color: #f8fafc; font-size: 0.9rem; resize: vertical; min-height: 80px; font-family: inherit; transition: all 0.3s; }
        .textarea-modern:focus { outline: none; border-color: transparent; background: rgba(30, 41, 59, 0.8); }
        .focus-border { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px; background: #ef4444; transition: width 0.3s ease; opacity: 0; }
        .textarea-modern:focus ~ .focus-border { width: 100%; opacity: 1; }

        .approval-actions-area { display: flex; gap: 0.75rem; margin-top: auto; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 1.25rem; flex-wrap: wrap; }
        .btn-action { flex: 1; min-width: 120px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
        .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
        .btn-cancel { background: rgba(148, 163, 184, 0.1); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.2); }
        .btn-cancel:hover { background: rgba(148, 163, 184, 0.2); }
        
        .glow-effect { position: relative; overflow: hidden; }
        .glow-effect::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1); z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.3s; }
        .glow-effect:hover::before { opacity: 1; }
        .glow-effect:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); }
        .btn-action:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

        .empty-state { text-align: center; padding: 4rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-icon-wrap { width: 80px; height: 80px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .empty-icon { font-size: 2.5rem; }
        .empty-state p { font-size: 1.1rem; color: #cbd5e1; font-weight: 500; }
      `}</style>
    </div>
  );
}

