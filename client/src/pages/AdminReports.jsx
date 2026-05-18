import { useEffect, useState } from "react";
import config from "../config.js";

const API_URL = config.API_URL;

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("reports"); // reports, completion, audit
  const [year, setYear] = useState(new Date().getFullYear());

  // Completion Dashboard data
  const [completionData, setCompletionData] = useState(null);

  // Audit logs data
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState("ALL");

  const currentYear = new Date().getFullYear();

  // Handle CSV Download
  async function handleDownloadCSV() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reports/admin/export-goals?year=${year}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to download report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `achievement-report-${year}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess("✓ Report downloaded successfully");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch Completion Dashboard
  async function fetchCompletionDashboard() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reports/admin/dashboard`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch completion data");

      const data = await res.json();
      setCompletionData(data);
      setActiveTab("completion");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch Audit Logs
  async function fetchAuditLogs() {
  try {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/reports/audit-logs`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch audit logs");

    const data = await res.json();
    setAuditLogs(data);
    setActiveTab("audit");
    setError("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  function getEntityColor(entityType) {
    const colors = {
      GOAL: "#3b82f6",
      GOAL_SHEET: "#6366f1",
      CYCLE: "#8b5cf6",
      SHARED_GOAL: "#ec4899",
      GOAL_UPDATE: "#f59e0b",
      CHECKIN: "#10b981",
    };
    return colors[entityType] || "#9ca3af";
  }

  const filteredLogs = auditFilter === "ALL" 
    ? auditLogs 
    : auditLogs.filter(log => log.entityType === auditFilter);

  return (
    <div className="page admin-reports-page">
      <div className="glass-card">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h2>Reports & Analytics</h2>
            <p className="subtle">Manage goals, track completion, and audit changes</p>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="banner error-banner"><span className="banner-icon">!</span> {error}</div>}
        {success && <div className="banner success-banner"><span className="banner-icon">✓</span> {success}</div>}

        {/* Tabs */}
        <div className="reports-tabs">
          <button
            className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            📊 Reports
          </button>
          <button
            className={`tab-button ${activeTab === "completion" ? "active" : ""}`}
            onClick={fetchCompletionDashboard}
          >
            ✓ Completion
          </button>
          <button
            className={`tab-button ${activeTab === "audit" ? "active" : ""}`}
            onClick={fetchAuditLogs}
          >
            🔍 Audit Logs
          </button>
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="reports-grid">
              {/* Achievement Report */}
              <div className="report-card">
                <div className="report-icon">📈</div>
                <h4>Achievement Report</h4>
                <p className="subtle">Export planned vs actual achievements (CSV)</p>
                
                <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
                  <label className="float-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Select Year:</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="modern-select"
                  >
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn--primary btn--full glow-effect"
                  onClick={handleDownloadCSV}
                  disabled={loading}
                >
                  {loading ? "Downloading..." : "📥 Download CSV"}
                </button>
              </div>

              {/* Completion Dashboard */}
              <div className="report-card">
                <div className="report-icon">✅</div>
                <h4>Completion Dashboard</h4>
                <p className="subtle">Real-time view of goal sheet submissions and check-ins</p>
                
                <button 
                  className="btn btn--primary btn--full glow-effect"
                  onClick={fetchCompletionDashboard}
                  disabled={loading}
                  style={{ marginTop: "2rem" }}
                >
                  {loading ? "Loading..." : "👁️ View Dashboard"}
                </button>
              </div>

              {/* Audit Logs */}
              <div className="report-card">
                <div className="report-icon">🔍</div>
                <h4>Audit Trail</h4>
                <p className="subtle">Track all system changes and activity logs</p>
                
                <button 
                  className="btn btn--primary btn--full glow-effect"
                  onClick={fetchAuditLogs}
                  disabled={loading}
                  style={{ marginTop: "2rem" }}
                >
                  {loading ? "Loading..." : "📋 View Logs"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Dashboard Tab */}
        {activeTab === "completion" && completionData && (
          <div className="tab-content">
            <h3>Goal Sheet Completion Status</h3>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{completionData.sheets?.total || 0}</div>
                <div className="metric-label">Total Goal Sheets</div>
              </div>

              <div className="metric-card">
                <div className="metric-value" style={{ color: "#10b981" }}>
                  {completionData.sheets?.approved || 0}
                </div>
                <div className="metric-label">Approved Sheets</div>
              </div>

              <div className="metric-card">
                <div className="metric-value" style={{ color: "#f59e0b" }}>
                  {completionData.sheets?.pending || 0}
                </div>
                <div className="metric-label">Pending Review</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">
                  {completionData.sheets?.total > 0 
                    ? ((completionData.sheets?.approved / completionData.sheets?.total) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="metric-label">Completion Rate</div>
              </div>
            </div>

            {/* Status Distribution */}
            {completionData.statusDistribution && completionData.statusDistribution.length > 0 && (
              <div className="section">
                <h4>Status Distribution</h4>
                <div className="status-list">
                  {completionData.statusDistribution.map((status, i) => (
                    <div key={i} className="status-row">
                      <span className="status-label">{status._id}</span>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar"
                          style={{
                            width: `${(status.count / (completionData.sheets?.total || 1)) * 100}%`,
                            backgroundColor: 
                              status._id === "APPROVED" ? "#10b981" :
                              status._id === "SUBMITTED" ? "#3b82f6" :
                              status._id === "DRAFT" ? "#9ca3af" :
                              status._id === "REJECTED" ? "#ef4444" : "#6366f1"
                          }}
                        />
                      </div>
                      <span className="status-count">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval Rate */}
            <div className="section">
              <h4>Goal Approval Rate: {completionData.approvalRate}%</h4>
              <div className="progress-bar-full">
                <div 
                  className="progress-fill"
                  style={{ width: `${completionData.approvalRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "audit" && (
          <div className="tab-content">
            <h3>Audit Trail</h3>
            
            {/* Filter */}
            <div className="filter-group">
              {["ALL", "GOAL", "GOAL_SHEET", "CHECKIN", "SHARED_GOAL"].map(type => (
                <button
                  key={type}
                  onClick={() => setAuditFilter(type)}
                  className={`filter-btn ${auditFilter === type ? "active" : ""}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
              <div className="empty-state">
                <p>No audit logs found</p>
              </div>
            ) : (
              <div className="logs-container">
                {filteredLogs.map((log, i) => (
                  <div key={i} className="log-entry">
                    <div className="log-header">
                      <span 
                        className="log-entity"
                        style={{ backgroundColor: getEntityColor(log.entityType) }}
                      >
                        {log.entityType}
                      </span>
                      <span className="log-action">{log.action}</span>
                      <span className="log-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="log-details">
                      <div className="detail-row">
                        <span className="detail-label">Entity ID:</span>
                        <code className="detail-value">{log.entityId}</code>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Actor:</span>
                        <span className="detail-value">
  {typeof log.actorUserId === 'object' && log.actorUserId?.name 
    ? `${log.actorUserId.name} (${log.actorUserId.email})`
    : 'System'}
</span>
                      </div>
                      {log.before && (
                        <div className="detail-row">
                          <span className="detail-label">Before:</span>
                          <code className="detail-value">
                            {JSON.stringify(log.before, null, 2)}
                          </code>
                        </div>
                      )}
                      {log.after && (
                        <div className="detail-row">
                          <span className="detail-label">After:</span>
                          <code className="detail-value">
                            {JSON.stringify(log.after, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .admin-reports-page {
          width: 100%;
          max-width: 100%;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reports-header {
          margin-bottom: 2.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding-bottom: 1.5rem;
        }

        .reports-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .banner {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideInDown 0.3s ease-out;
          backdrop-filter: blur(8px);
        }

        .banner-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .success-banner {
          background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399;
        }
        .success-banner .banner-icon { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .error-banner {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171;
        }
        .error-banner .banner-icon { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .reports-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          background: rgba(15, 23, 42, 0.5);
          padding: 0.5rem;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.1);
          width: fit-content;
        }

        .tab-button {
          padding: 0.875rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-button:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-button.active {
          color: #fff;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .tab-content {
          animation: slideIn 0.4s ease-out;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .report-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .report-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
        }

        .report-icon {
          font-size: 3rem;
          margin-bottom: 1.25rem;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }

        .report-card h4 {
          margin: 0 0 0.5rem 0;
          color: #f8fafc;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .report-card .subtle {
          margin: 0;
        }

        .modern-select {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/200.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em;
        }
        .modern-select:focus { border-color: #6366f1; background: rgba(30, 41, 59, 0.8); }

        .btn {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn--primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          margin-top: auto;
        }

        .btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.5);
        }

        .glow-effect { position: relative; overflow: hidden; }
        .glow-effect::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1); z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.3s; }
        .glow-effect:hover:not(:disabled)::before { opacity: 1; }

        .btn--full { width: 100%; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

        /* Completion Dashboard */
        .tab-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          color: #e2e8f0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .metric-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .metric-card:hover {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .metric-value {
          font-size: 3rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .metric-label {
          color: #94a3b8;
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .section h4 {
          margin: 0 0 1.5rem 0;
          color: #e2e8f0;
          font-size: 1.25rem;
        }

        .status-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .status-row { display: grid; grid-template-columns: 120px 1fr 60px; gap: 1.5rem; align-items: center; }
        .status-label { color: #cbd5e1; font-weight: 600; font-size: 0.9rem; }
        .status-bar-container { height: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 20px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
        .status-bar { height: 100%; border-radius: 20px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .status-count { color: #f8fafc; text-align: right; font-weight: 700; font-size: 1.1rem; }

        .progress-bar-full { height: 24px; background: rgba(15, 23, 42, 0.6); border-radius: 20px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); background-size: 200% 100%; animation: shimmer 3s infinite linear; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

        @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

        /* Audit Logs */
        .filter-group {
          display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem;
        }

        .filter-btn {
          padding: 0.6rem 1.25rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .filter-btn:hover { border-color: rgba(99, 102, 241, 0.5); background: rgba(99, 102, 241, 0.1); }
        .filter-btn.active { background: #6366f1; color: white; border-color: #6366f1; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }

        .logs-container { display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto; padding-right: 0.5rem; }
        .logs-container::-webkit-scrollbar { width: 6px; }
        .logs-container::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
        .logs-container::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 4px; }

        .log-entry {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-left: 4px solid #6366f1;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s;
        }
        .log-entry:hover { background: rgba(30, 41, 59, 0.6); }

        .log-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .log-entity { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 6px; color: white; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .log-action { color: #f8fafc; font-weight: 600; font-size: 0.95rem; }
        .log-time { color: #94a3b8; font-size: 0.85rem; margin-left: auto; background: rgba(15, 23, 42, 0.5); padding: 0.3rem 0.7rem; border-radius: 8px; }

        .log-details { display: flex; flex-direction: column; gap: 0.75rem; background: rgba(15, 23, 42, 0.3); padding: 1rem; border-radius: 8px; }
        .detail-row { display: flex; gap: 1rem; align-items: flex-start; }
        .detail-label { color: #94a3b8; font-weight: 600; font-size: 0.85rem; min-width: 80px; padding-top: 0.2rem; }
        .detail-value { color: #e2e8f0; flex: 1; font-size: 0.9rem; word-break: break-all; }

        code { background: rgba(15, 23, 42, 0.6); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; font-family: 'Fira Code', monospace; display: block; overflow-x: auto; border: 1px solid rgba(255, 255, 255, 0.05); }

        .empty-state { text-align: center; padding: 4rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-state p { font-size: 1.1rem; color: #cbd5e1; font-weight: 500; }
      `}</style>
    </div>
  );
}