import { useAuth } from "../auth/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="card">
        <h2>Welcome to AtomQuest</h2>
        <p className="subtle">Your goal setting and tracking portal</p>

        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Name</div>
            <div className="info-value">{user?.name}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{user?.email}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Role</div>
            <div className="info-value">{user?.role}</div>
          </div>
          {user?.department && (
            <div className="info-item">
              <div className="info-label">Department</div>
              <div className="info-value">{user.department}</div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h4>Quick Start</h4>
          {user?.role === "EMPLOYEE" && (
            <p className="subtle">Navigate to "My Goals" to create your first goal sheet.</p>
          )}
          {user?.role === "MANAGER" && (
            <p className="subtle">Check "Approvals" to review pending goal sheets from your team.</p>
          )}
          {user?.role === "ADMIN" && (
            <p className="subtle">Start by creating users in the "Users" section.</p>
          )}
        </div>
      </div>
    </div>
  );
}