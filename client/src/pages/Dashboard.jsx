import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import config from "../config.js";

const API_URL = config.API_URL;

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchDashboard();
  }, [user?.role]);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";
      if (user?.role === "ADMIN") {
        endpoint = "/api/reports/admin/dashboard";
      } else if (user?.role === "MANAGER") {
        endpoint = "/api/reports/manager/dashboard";
      } else if (user?.role === "EMPLOYEE") {
        endpoint = "/api/reports/employee/dashboard";
      }

      if (!endpoint) return;

      const res = await fetch(`${API_URL}${endpoint}`, {
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportGoals() {
    try {
      const res = await fetch(
        `${API_URL}/api/reports/admin/export-goals?year=${currentYear}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `goals-${currentYear}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExportCheckins() {
    try {
      const res = await fetch(
        `${API_URL}/api/reports/manager/export-checkins?year=${currentYear}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checkins-${currentYear}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page page--wide">
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--wide">
      <div className="card dashboard-layout">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}! 👋</h1>
            <p className="subtle">Your {user?.role} dashboard</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* ADMIN Dashboard */}
        {user?.role === "ADMIN" && (
          <>
            {/* Users Section */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <p className="stat-label">Total Users</p>
                  <p className="stat-value">{stats.users?.total || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍💼</div>
                <div className="stat-content">
                  <p className="stat-label">Employees</p>
                  <p className="stat-value">{stats.users?.employees || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <p className="stat-label">Managers</p>
                  <p className="stat-value">{stats.users?.managers || 0}</p>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <p className="stat-label">Total Goals</p>
                  <p className="stat-value">{stats.goals?.total || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <p className="stat-label">Goals with Updates</p>
                  <p className="stat-value">{stats.goals?.withUpdates || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <p className="stat-label">Goal Sheets</p>
                  <p className="stat-value">{stats.sheets?.total || 0}</p>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="section-card">
              <h3>Goal Sheet Status Distribution</h3>
              <div className="status-list">
                {stats.statusDistribution?.map((s, i) => (
                  <div key={i} className="status-item">
                    <span className="status-name">{s._id}</span>
                    <div className="status-bar">
                      <div 
                        className="status-fill"
                        style={{
                          width: `${Math.min(100, (s.count / (stats.sheets?.total || 1)) * 100)}%`,
                          backgroundColor: 
                            s._id === "APPROVED" ? "#10b981" :
                            s._id === "SUBMITTED" ? "#3b82f6" :
                            s._id === "DRAFT" ? "#9ca3af" :
                            s._id === "REJECTED" ? "#ef4444" : "#6366f1"
                        }}
                      />
                    </div>
                    <span className="status-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Stats */}
            <div className="section-card">
              <h3>Goal Approval Rate: {stats.approvalRate}%</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${stats.approvalRate}%` }}
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="action-section">
              <button className="btn btn-primary" onClick={handleExportGoals}>
                📥 Export Goals (CSV)
              </button>
            </div>
          </>
        )}

        {/* MANAGER Dashboard */}
        {user?.role === "MANAGER" && (
          <>
            {/* Team Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <p className="stat-label">Team Size</p>
                  <p className="stat-value">{stats.teamSize || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📤</div>
                <div className="stat-content">
                  <p className="stat-label">Goals Submitted</p>
                  <p className="stat-value">{stats.goalsSubmitted || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <p className="stat-label">Goals Approved</p>
                  <p className="stat-value">{stats.goalsApproved || 0}</p>
                </div>
              </div>
            </div>

            {/* Check-in Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <p className="stat-label">Check-ins Done</p>
                  <p className="stat-value">{stats.checkinsDone || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <p className="stat-label">Check-in Rate</p>
                  <p className="stat-value">{stats.checkinRate}%</p>
                </div>
              </div>
            </div>

            {/* Feedback Distribution */}
            <div className="section-card">
              <h3>Team Feedback Distribution</h3>
              <div className="status-list">
                {stats.feedbackStats?.map((f, i) => (
                  <div key={i} className="status-item">
                    <span className="status-name">{f._id}</span>
                    <div className="status-bar">
                      <div 
                        className="status-fill"
                        style={{
                          width: `${Math.min(100, (f.count / (stats.checkinsDone || 1)) * 100)}%`,
                          backgroundColor:
                            f._id === "EXCELLENT" ? "#10b981" :
                            f._id === "GOOD" ? "#3b82f6" :
                            f._id === "NEEDS_IMPROVEMENT" ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                    <span className="status-count">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="action-section">
              <button className="btn btn-primary" onClick={handleExportCheckins}>
                📥 Export Check-ins (CSV)
              </button>
            </div>
          </>
        )}

        {/* EMPLOYEE Dashboard */}
        {user?.role === "EMPLOYEE" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <p className="stat-label">My Goals</p>
                  <p className="stat-value">{stats.goalsCount || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <p className="stat-label">Updates Submitted</p>
                  <p className="stat-value">{stats.updatesCount || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <p className="stat-label">Manager Check-ins</p>
                  <p className="stat-value">{stats.checkinsCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="section-card">
              <h3>Current Goal Sheet Status</h3>
              <div className={`status-badge ${stats.sheetStatus?.toLowerCase()}`}>
                {stats.sheetStatus || "NOT_STARTED"}
              </div>
            </div>

            {/* Goal Progress */}
            {stats.goalStatuses && stats.goalStatuses.length > 0 && (
              <div className="section-card">
                <h3>Goal Progress Status</h3>
                <div className="status-list">
                  {stats.goalStatuses.map((s, i) => (
                    <div key={i} className="status-item">
                      <span className="status-name">{s._id}</span>
                      <div className="status-bar">
                        <div 
                          className="status-fill"
                          style={{
                            width: `${Math.min(100, (s.count / (stats.updatesCount || 1)) * 100)}%`,
                            backgroundColor:
                              s._id === "COMPLETED" ? "#10b981" :
                              s._id === "ON_TRACK" ? "#3b82f6" :
                              s._id === "AT_RISK" ? "#f59e0b" : "#ef4444"
                          }}
                        />
                      </div>
                      <span className="status-count">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
                       .dashboard-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 600;
          color: #f8fafc;
          letter-spacing: -0.02em;
        }

        .dashboard-header p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        /* The Grid that spreads horizontally */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          width: 100%;
        }

        /* Stat Cards - Midnight Blue Style */
        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.5rem;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .stat-card:hover {
          border-color: #3b82f6;
          background: #1e293b;
        }

        .stat-icon {
          font-size: 2rem;
          padding: 0.75rem;
          background: #1e293b;
          border-radius: 8px;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          margin: 0;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
          color: #f8fafc;
          line-height: 1;
        }

        /* Wider Sections */
        .section-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-card h3 {
          margin: 0 0 1.5rem 0;
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 600;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 0.75rem;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: grid;
          grid-template-columns: 140px 1fr 60px;
          gap: 1.25rem;
          align-items: center;
        }

        .status-name {
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .status-bar {
          height: 12px;
          background: #1e293b;
          border-radius: 20px;
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          border-radius: 20px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-count {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: right;
        }

        .progress-bar {
          height: 16px;
          background: #1e293b;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: 0.025em;
          border: 1px solid transparent;
        }

        /* Status Badge Adjustments for Navy */
        .status-badge.draft { background: #1e293b; border-color: #334155; color: #94a3b8; }
        .status-badge.submitted { background: #172554; border-color: #1e3a8a; color: #60a5fa; }
        .status-badge.approved { background: #022c22; border-color: #064e3b; color: #34d399; }
        .status-badge.rejected { background: #450a0a; border-color: #7f1d1d; color: #f87171; }
        .status-badge.locked { background: #422006; border-color: #78350f; color: #fbbf24; }
        .status-badge.not_started { background: #1e293b; border-color: #334155; color: #94a3b8; }

        .action-section {
          padding-top: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #334155;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          background: #1e293b;
          color: #f8fafc;
        }

        .btn:hover {
          background: #334155;
          border-color: #475569;
        }

        .btn-primary {
          background: #3b82f6;
          color: #ffffff;
          border: none;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .error-banner {
          background: #450a0a;
          color: #fca5a5;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          border: 1px solid #7f1d1d;
          font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .status-item { grid-template-columns: 100px 1fr 40px; gap: 1rem; }
        }
      `}</style>
    </div>
  );
}