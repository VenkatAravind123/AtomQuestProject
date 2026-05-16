export default function ManagerCheckins() {
  return (
    <div className="page">
      <div className="card">
        <h2>Team Check-ins</h2>
        <p className="subtle">Add check-in notes for your team</p>
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No check-ins scheduled. View your team to add notes.</p>
        </div>
      </div>
    </div>
  );
}