export default function AdminCycles() {
  return (
    <div className="page">
      <div className="card">
        <h2>Goal Cycles</h2>
        <p className="subtle">Manage goal setting windows and phases</p>
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No cycles configured. Add a cycle to get started.</p>
          <button className="btn btn--primary" style={{ marginTop: 16 }}>
            + Add Cycle
          </button>
        </div>
      </div>
    </div>
  );
}