export default function EmployeeGoals() {
  return (
    <div className="page">
      <div className="card">
        <h2>My Goals</h2>
        <p className="subtle">Create and manage your goal sheets</p>
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>No goal sheets yet. Create one to get started.</p>
          <button className="btn btn--primary" style={{ marginTop: 16 }}>
            + Create Goal Sheet
          </button>
        </div>
      </div>
    </div>
  );
}