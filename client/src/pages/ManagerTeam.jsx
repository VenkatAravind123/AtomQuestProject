export default function ManagerTeam() {
  return (
    <div className="page">
      <div className="card">
        <h2>My Team</h2>
        <p className="subtle">View team members and their progress</p>
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No team members assigned.</p>
        </div>
      </div>
    </div>
  );
}