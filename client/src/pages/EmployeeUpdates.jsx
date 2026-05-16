export default function EmployeeUpdates() {
  return (
    <div className="page">
      <div className="card">
        <h2>Quarterly Updates</h2>
        <p className="subtle">Log your achievements and progress</p>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p>No updates available. Check back when a quarter opens.</p>
        </div>
      </div>
    </div>
  );
}