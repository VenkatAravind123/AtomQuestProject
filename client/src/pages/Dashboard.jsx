import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      <div className="page">
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
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
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #1f2937;
        }

        .dashboard-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stat-label {
          margin: 0;
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stat-value {
          margin: 0.25rem 0 0 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #e5e7eb;
        }

        .section-card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .section-card h3 {
          margin: 0 0 1rem 0;
          color: #e5e7eb;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: grid;
          grid-template-columns: 120px 1fr 60px;
          gap: 1rem;
          align-items: center;
        }

        .status-name {
          color: #d1d5db;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-bar {
          height: 24px;
          background: #1f2937;
          border-radius: 4px;
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .status-count {
          color: #9ca3af;
          font-size: 0.875rem;
          text-align: right;
        }

        .progress-bar {
          height: 32px;
          background: #1f2937;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1rem;
        }

        .status-badge.draft {
          background: #9ca3af;
          color: #0a0e27;
        }

        .status-badge.submitted {
          background: #3b82f6;
          color: white;
        }

        .status-badge.approved {
          background: #10b981;
          color: white;
        }

        .status-badge.rejected {
          background: #ef4444;
          color: white;
        }

        .status-badge.locked {
          background: #f59e0b;
          color: white;
        }

        .status-badge.not_started {
          background: #6b7280;
          color: white;
        }

        .action-section {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #1f2937;
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

        .error-banner {
          background: #7f1d1d;
          color: #fecaca;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          border: 1px solid #dc2626;
        }
      `}</style>
    </div>
  );
}