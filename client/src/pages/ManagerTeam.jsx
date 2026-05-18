export default function ManagerTeam() {
  return (
    <div className="page manager-team-page">
      <div className="card glass-card">
        <div className="page-header">
          <div className="header-text">
            <h2>My Team</h2>
            <p className="subtle">View team members and their progress</p>
          </div>
        </div>
        <div className="empty-state slide-up">
          <div className="empty-icon-wrap">
            <div className="empty-icon">👥</div>
          </div>
          <p>No team members assigned.</p>
        </div>
      </div>
      <style>{`
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .manager-team-page { perspective: 1000px; padding: 2rem 1rem; }
        .glass-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border-radius: 24px; padding: 2.5rem; max-width: 1200px; width: 100%; margin: 0 auto; animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .header-text h2 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .empty-state { text-align: center; padding: 5rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-icon-wrap { width: 100px; height: 100px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .empty-icon { font-size: 3rem; }
        .empty-state p { font-size: 1.2rem; color: #cbd5e1; font-weight: 500; }
        .slide-up { animation: slideUp 0.5s ease-out backwards; }
      `}</style>
    </div>
  );
}

