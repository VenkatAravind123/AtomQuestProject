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
      <div className="card">
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
                  <label style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>Select Year:</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      marginTop: "0.5rem",
                      background: "#0a0e27",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#e5e7eb",
                    }}
                  >
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn--primary btn--full"
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
                  className="btn btn--primary btn--full"
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
                  className="btn btn--primary btn--full"
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
            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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
        .admin-reports-page {
          max-width: 1400px;
        }

        .reports-header {
          margin-bottom: 2.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          padding-bottom: 1.5rem;
        }

        .reports-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .banner {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
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
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .success-banner .banner-icon {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .error-banner .banner-icon {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .reports-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .tab-button {
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #cbd5e1;
        }

        .tab-button.active {
          color: #6366f1;
          border-bottom-color: #6366f1;
        }

        .tab-content {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .report-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .report-card:hover {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(30, 41, 59, 0.8);
        }

        .report-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .report-card h4 {
          margin: 0 0 0.5rem 0;
          color: #f8fafc;
          font-size: 1.25rem;
        }

        .report-card .subtle {
          margin: 0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.5);
          color: #cbd5e1;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn--primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .btn--full {
          width: 100%;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .metric-card {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .section h4 {
          margin: 0 0 1rem 0;
          color: #e2e8f0;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-row {
          display: grid;
          grid-template-columns: 120px 1fr 60px;
          gap: 1rem;
          align-items: center;
        }

        .status-label {
          color: #cbd5e1;
          font-weight: 500;
        }

        .status-bar-container {
          height: 12px;
          background: rgba(30, 41, 59, 0.6);
          border-radius: 20px;
          overflow: hidden;
        }

        .status-bar {
          height: 100%;
          border-radius: 20px;
          transition: width 0.5s ease;
        }

        .status-count {
          color: #94a3b8;
          text-align: right;
        }

        .progress-bar-full {
          height: 16px;
          background: rgba(30, 41, 59, 0.6);
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #6366f1);
          transition: width 0.5s ease;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .filter-btn:hover {
          border-color: #6366f1;
        }

        .filter-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .log-entry {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 1rem;
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .log-entity {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .log-action {
          color: #a5b4fc;
          font-weight: 500;
        }

        .log-time {
          color: #94a3b8;
          font-size: 0.85rem;
          margin-left: auto;
        }

        .log-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row {
          display: flex;
          gap: 0.75rem;
        }

        .detail-label {
          color: #94a3b8;
          font-weight: 500;
          min-width: 80px;
        }

        .detail-value {
          color: #cbd5e1;
          flex: 1;
          word-break: break-all;
        }

        code {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-family: monospace;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}