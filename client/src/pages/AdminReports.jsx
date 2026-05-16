export default function AdminReports() {
  return (
    <div className="page">
      <div className="card">
        <h2>Reports & Analytics</h2>
        <p className="subtle">View insights and export data</p>
        <div className="reports-grid">
          <div className="report-card">
            <h4>Achievement Report</h4>
            <p>Export planned vs actual achievements</p>
            <button className="btn btn--primary btn--sm">Download CSV</button>
          </div>
          <div className="report-card">
            <h4>Completion Dashboard</h4>
            <p>View goal completion rates</p>
            <button className="btn btn--primary btn--sm">View</button>
          </div>
          <div className="report-card">
            <h4>Audit Logs</h4>
            <p>Track all system changes</p>
            <button className="btn btn--primary btn--sm">View Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
}