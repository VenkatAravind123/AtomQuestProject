export default function ManagerApprovals() {
  return (
    <div className="page">
      <div className="card">
        <h2>Goal Approvals</h2>
        <p className="subtle">Review and approve team member goals</p>
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No pending approvals at this time.</p>
        </div>
      </div>
    </div>
  );
}