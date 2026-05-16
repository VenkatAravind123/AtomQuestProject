export default function AdminSharedGoals() {
  return (
    <div className="page">
      <div className="card">
        <h2>Shared Goals</h2>
        <p className="subtle">Push departmental KPIs to multiple employees</p>
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <p>No shared goals yet. Create one to get started.</p>
          <button className="btn btn--primary" style={{ marginTop: 16 }}>
            + Create Shared Goal
          </button>
        </div>
      </div>
    </div>
  );
}