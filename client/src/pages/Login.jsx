import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import config from "../config.js";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

const API_URL = config.API_URL;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [err, setErr] = useState("");

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "Email is required";
    if (!isValidEmail(email)) return "Enter a valid email";
    return "";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Password is required";
    if (password.length < 6) return "Minimum 6 characters";
    return "";
  }, [password, touched.password]);

  const canSubmit = !isSubmitting && !emailError && !passwordError && email && password;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setTouched({ email: true, password: true });

    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      await login(email, password);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function demoLogin(demoEmail, demoPassword) {
    setErr("");
    try {
      setIsSubmitting(true);
      await login(demoEmail, demoPassword);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <div className="login-container slide-in">
        <div className="login-card glass-panel">
          <div className="login-header">
            <div className="logo-icon">✨</div>
            <h2>AtomQuest</h2>
            <p className="subtle">Goal Setting & Tracking Platform</p>
          </div>

          <form className="modern-form" onSubmit={onSubmit}>
            {err && (
              <div className="error-banner shake">
                <span className="error-icon">!</span>
                {err}
              </div>
            )}

            <div className="field-group">
              <label className="float-label" htmlFor="email">Email Address</label>
              <div className={`input-wrapper ${emailError ? 'has-error' : ''}`}>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (err) setErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  autoComplete="email"
                />
                <div className="focus-border"></div>
              </div>
              {emailError && <div className="field-error slide-down">{emailError}</div>}
            </div>

            <div className="field-group">
              <label className="float-label" htmlFor="password">Password</label>
              <div className={`input-wrapper password-wrapper ${passwordError ? 'has-error' : ''}`}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (err) setErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye />: <FaEyeSlash />}
                </button>
                <div className="focus-border"></div>
              </div>
              {passwordError && <div className="field-error slide-down">{passwordError}</div>}
            </div>

            <button 
              className="btn-submit glow-effect" 
              type="submit" 
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <span className="btn-content">
                  <span className="spinner"></span> Signing in...
                </span>
              ) : (
                <span className="btn-content">
                  Sign In <span className="arrow">→</span>
                </span>
              )}
            </button>
          </form>

          <div className="demo-section">
            <div className="divider">
              <span>Quick Demo Access</span>
            </div>
            <div className="demo-grid">
              <button
                type="button"
                className="btn-demo hover-lift"
                onClick={() => demoLogin("admin@gmail.com", "admin123")}
                disabled={isSubmitting}
              >
                <span className="demo-icon">🛡️</span>
                <span>Admin</span>
              </button>
              <button
                type="button"
                className="btn-demo hover-lift"
                onClick={() => demoLogin("manager@gmail.com", "Manager@123")}
                disabled={isSubmitting}
              >
                <span className="demo-icon">📋</span>
                <span>Manager</span>
              </button>
              <button
                type="button"
                className="btn-demo hover-lift"
                onClick={() => demoLogin("employee@gmail.com", "Employee@123")}
                disabled={isSubmitting}
              >
                <span className="demo-icon">👤</span>
                <span>Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Login Page Specific Styles */
        .login-page {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          overflow: hidden;
        }

        /* Animated Background Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: 0;
          animation: float 20s infinite ease-in-out alternate;
        }
        
        .orb-1 {
          width: 40vw;
          height: 40vw;
          min-width: 300px;
          min-height: 300px;
          background: #4f46e5;
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 50vw;
          height: 50vw;
          min-width: 400px;
          min-height: 400px;
          background: #db2777;
          bottom: -20%;
          right: -10%;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, 50px) scale(1.2); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
        }

        .slide-in {
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .glass-panel {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: inline-block;
          filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.5));
        }

        .login-header h2 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .login-header .subtle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-icon {
          background: rgba(239, 68, 68, 0.2);
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          font-size: 13px;
          flex-shrink: 0;
        }

        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        .field-group {
          margin-bottom: 1.25rem;
        }

        .float-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 0.5rem;
          margin-left: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          position: relative;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: all 0.3s;
        }

        .input-wrapper.has-error {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.05);
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .password-wrapper input {
          padding-right: 3rem;
        }

        .input-wrapper input:focus {
          outline: none;
        }

        .focus-border {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #6366f1;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0 0 12px 12px;
          opacity: 0;
        }

        .input-wrapper:focus-within {
          background: rgba(30, 41, 59, 0.8);
          border-color: transparent;
        }

        .input-wrapper:focus-within .focus-border {
          width: 100%;
          opacity: 1;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .toggle-password:hover {
          color: #e2e8f0;
        }

        .field-error {
          font-size: 0.8rem;
          color: #f87171;
          margin-top: 0.4rem;
          margin-left: 0.25rem;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          margin-top: 1.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .glow-effect::before {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1);
          z-index: -1;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .glow-effect:hover:not(:disabled)::before {
          opacity: 1;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .arrow {
          transition: transform 0.3s;
        }

        .btn-submit:hover:not(:disabled) .arrow {
          transform: translateX(4px);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .demo-section {
          margin-top: 2rem;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        .divider span {
          padding: 0 1rem;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .btn-demo {
          padding: 0.75rem 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }

        .demo-icon {
          font-size: 1.1rem;
        }

        .hover-lift:hover:not(:disabled) {
          transform: translateY(-2px);
          background: rgba(51, 65, 85, 0.8);
          border-color: rgba(148, 163, 184, 0.4);
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}