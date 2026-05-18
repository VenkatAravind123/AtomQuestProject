import { useEffect, useState } from "react";
import config from "../config.js";
import { MdDelete } from "react-icons/md";
const API_URL = config.API_URL;
const PHASES = ["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"];

export default function AdminCycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: currentYear,
    phase: "GOAL_SETTING",
    windowStart: "",
    windowEnd: "",
  });

  useEffect(() => {
    fetchCycles();
  }, [selectedYear]);

  async function fetchCycles() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}/api/admin/cycles/year/${selectedYear}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch cycles");
      const data = await res.json();
      setCycles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCycle(e) {
    e.preventDefault();
    try {
      setError("");

      if (!formData.windowStart || !formData.windowEnd) {
        setError("Both start and end dates are required");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setSuccess("✅ Cycle created successfully!");
      setShowForm(false);
      setFormData({
        year: currentYear,
        phase: "GOAL_SETTING",
        windowStart: "",
        windowEnd: "",
      });

      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleActivateCycle(cycleId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}/activate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to activate cycle");

      setSuccess("✅ Cycle activated!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCloseCycle(cycleId) {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}/close`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to close cycle");

      setSuccess("✅ Cycle closed!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCycle(cycleId) {
    if (!confirm("Are you sure? This will delete the cycle.")) return;

    try {
      setError("");
      const res = await fetch(`${API_URL}/api/admin/cycles/${cycleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete cycle");

      setSuccess("✅ Cycle deleted!");
      setTimeout(() => setSuccess(""), 2500);
      fetchCycles();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading cycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-cycles-page">
      <div className="card glass-card">
        <div className="page-header">
          <div className="header-text">
            <h2>Goal Cycles</h2>
            <p className="subtle">Create and manage annual goal cycles and quarters</p>
          </div>
          <button
            className={`btn toggle-btn ${showForm ? "btn-cancel" : "btn-primary glow-effect"}`} style={{color:"black"}}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Cycle"}
          </button>
        </div>

        {success && <div className="banner success-banner fade-in"><span className="banner-icon">✓</span> {success}</div>}
        {error && <div className="banner error-banner fade-in"><span className="banner-icon">!</span> {error}</div>}

        {/* Create Cycle Form */}
        <div className={`form-wrapper ${showForm ? 'open' : ''}`}>
          <div className="form-card inner-glass">
            <h3>Create New Cycle</h3>
            <form onSubmit={handleCreateCycle} className="modern-form">
              <div className="form-grid">
                <div className="field-group">
                  <label className="float-label">Year</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          year: parseInt(e.target.value),
                        }))
                      }
                    />
                    <div className="focus-border"></div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="float-label">Phase</label>
                  <div className="input-wrapper select-wrapper">
                    <select
                      value={formData.phase}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          phase: e.target.value,
                        }))
                      }
                    >
                      {PHASES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <div className="focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field-group">
                  <label className="float-label">Start Date</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={formData.windowStart}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          windowStart: e.target.value,
                        }))
                      }
                    />
                    <div className="focus-border"></div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="float-label">End Date</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={formData.windowEnd}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          windowEnd: e.target.value,
                        }))
                      }
                    />
                    <div className="focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn glow-effect">
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Year Selector */}
        <div className="controls-bar">
          <div className="year-selector">
            <span className="filter-icon">🗓️</span>
            <label>Filter by Year:</label>
            <div className="input-wrapper select-wrapper inline-select">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cycles List */}
        {cycles.length === 0 ? (
          <div className="empty-state slide-up">
            <div className="empty-icon-wrap">
              <div className="empty-icon">📅</div>
            </div>
            <p>No cycles created for {selectedYear}</p>
          </div>
        ) : (
          <div className="cycles-grid">
            {cycles.map((cycle, index) => (
              <div 
                key={cycle._id} 
                className="cycle-card hover-lift slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="cycle-header">
                  <div className="cycle-title">
                    <div className="phase-icon">
                      {cycle.phase.includes("Q") ? "📊" : "🎯"}
                    </div>
                    <div>
                      <h3>{cycle.phase}</h3>
                      <span className="year-tag">{cycle.year}</span>
                    </div>
                  </div>
                  <div className={`status-badge ${cycle.active ? "active" : "closed"}`}>
                    <span className="pulse-dot"></span>
                    {cycle.active ? "ACTIVE" : "CLOSED"}
                  </div>
                </div>

                <div className="cycle-details">
                  <div className="detail-row">
                    <div className="detail-col">
                      <span className="label">Start Date</span>
                      <span className="value">{new Date(cycle.windowStart).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                    <div className="detail-divider"></div>
                    <div className="detail-col">
                      <span className="label">End Date</span>
                      <span className="value">{new Date(cycle.windowEnd).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                  </div>
                  <div className="duration-bar">
                    <div className="duration-fill"></div>
                    <span className="duration-text">
                      {Math.ceil((new Date(cycle.windowEnd) - new Date(cycle.windowStart)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>

                <div className="cycle-actions">
                  {!cycle.active ? (
                    <button
                      className="btn-action btn-success"
                      onClick={() => handleActivateCycle(cycle._id)}
                      title="Activate Cycle"
                    >
                      <span className="action-icon">✓</span> Activate
                    </button>
                  ) : (
                    <button
                      className="btn-action btn-warning"
                      onClick={() => handleCloseCycle(cycle._id)}
                      title="Close Cycle"
                    >
                      <span className="action-icon">🔒</span> Close
                    </button>
                  )}
                  <button
                    className="btn-action btn-danger btn-icon-only"
                    onClick={() => handleDeleteCycle(cycle._id)}
                    title="Delete Cycle"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* Core Animations */
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .admin-cycles-page {
          perspective: 1000px;
          padding: 2rem 1rem;
        }

        /* Glassmorphism Containers */
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 1000px;
          width: 100%;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .inner-glass {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-text h2 {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        /* Banners */
        .banner {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }
        .success-banner { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; }
        .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; }
        .fade-in { animation: fadeIn 0.4s ease-out; }

        /* Form section */
        .form-wrapper {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
          opacity: 0;
          margin-bottom: 0;
        }
        .form-wrapper.open {
          max-height: 600px;
          opacity: 1;
          margin-bottom: 2.5rem;
        }

        .form-card {
          padding: 2rem;
        }
        .form-card h3 { margin-bottom: 1.5rem; font-size: 1.2rem; color: #f8fafc; }

        .modern-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        /* Inputs */
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
        .float-label { font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-left: 0.25rem; }
        .input-wrapper { position: relative; border-radius: 12px; background: rgba(15, 23, 42, 0.5); }
        
        .input-wrapper input, .input-wrapper select {
          width: 100%;
          padding: 1rem 1.25rem;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          appearance: none;
        }
        .input-wrapper input:focus, .input-wrapper select:focus {
          outline: none; border-color: transparent; background: rgba(30, 41, 59, 0.8);
        }
        .focus-border {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 2px; background: #6366f1; transition: width 0.3s ease; opacity: 0;
        }
        .input-wrapper input:focus ~ .focus-border, .input-wrapper select:focus ~ .focus-border { width: 100%; opacity: 1; }
        
        .select-wrapper::after {
          content: '▼'; position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%);
          color: #64748b; font-size: 0.7rem; pointer-events: none;
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; border: none; font-size: 0.95rem;
        }
        .toggle-btn { min-width: 140px; }
        .btn-cancel { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .btn-cancel:hover { background: rgba(239, 68, 68, 0.2); }
        
        .submit-btn {
          padding: 1rem 2rem; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; position: relative; overflow: hidden;
        }
        .glow-effect::before {
          content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1); z-index: -1; filter: blur(10px); opacity: 0; transition: opacity 0.3s;
        }
        .glow-effect:hover::before { opacity: 1; }
        .glow-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

        /* Controls */
        .controls-bar {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
          padding: 1rem 1.5rem; background: rgba(30, 41, 59, 0.3); border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .year-selector { display: flex; align-items: center; gap: 1rem; }
        .year-selector label { font-weight: 600; color: #cbd5e1; }
        .inline-select select { padding: 0.5rem 2.5rem 0.5rem 1rem; background: rgba(15, 23, 42, 0.8); }

        /* Cycles Grid */
        .cycles-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;
        }
        
        .cycle-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px; padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden;
        }
        .hover-lift:hover {
          transform: translateY(-5px); border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
        }
        .slide-up { animation: slideUp 0.5s ease-out backwards; }

        .cycle-header {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;
        }
        .cycle-title { display: flex; align-items: center; gap: 1rem; }
        .phase-icon {
          width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.1);
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #a5b4fc;
        }
        .cycle-title h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #f8fafc; }
        .year-tag {
          display: inline-block; margin-top: 0.25rem; font-size: 0.8rem; color: #94a3b8;
          background: rgba(148, 163, 184, 0.1); padding: 2px 8px; border-radius: 4px;
        }

        .status-badge {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 20px;
          font-weight: 700; font-size: 0.75rem; letter-spacing: 0.05em;
        }
        .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-badge.closed { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; }
        .active .pulse-dot { background: #10b981; animation: pulse 2s infinite; }
        .closed .pulse-dot { background: #ef4444; }

        .cycle-details {
          background: rgba(15, 23, 42, 0.4); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .detail-col { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-divider { width: 1px; height: 30px; background: rgba(148, 163, 184, 0.2); }
        .detail-col .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .detail-col .value { font-size: 0.95rem; font-weight: 600; color: #e2e8f0; }

        .duration-bar { display: flex; align-items: center; gap: 1rem; background: rgba(15, 23, 42, 0.6); padding: 0.5rem; border-radius: 8px; }
        .duration-fill { flex: 1; height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px; }
        .duration-text { font-size: 0.8rem; font-weight: 600; color: #a5b4fc; white-space: nowrap; }

        .cycle-actions { display: flex; gap: 0.75rem; }
        .btn-action {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.75rem; border: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .btn-success { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .btn-success:hover { background: rgba(16, 185, 129, 0.2); transform: translateY(-2px); }
        .btn-warning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .btn-warning:hover { background: rgba(245, 158, 11, 0.2); transform: translateY(-2px); }
        .btn-danger { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .btn-danger:hover { background: rgba(239, 68, 68, 0.2); transform: translateY(-2px); }
        .btn-icon-only { flex: 0 0 44px; padding: 0; font-size: 1.1rem; }

        /* Empty State */
        .empty-state { text-align: center; padding: 4rem 2rem; background: rgba(30, 41, 59, 0.3); border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.2); }
        .empty-icon-wrap { width: 80px; height: 80px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .empty-icon { font-size: 2.5rem; }
        .empty-state p { font-size: 1.1rem; color: #cbd5e1; font-weight: 500; }
      `}</style>
    </div>
  );
}

