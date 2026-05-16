import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

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

//   async function demoLogin(demoEmail, demoPassword) {
//     setErr("");
//     try {
//       setIsSubmitting(true);
//       await login(demoEmail, demoPassword);
//       nav("/dashboard");
//     } catch (e2) {
//       setErr(e2.message || "Login failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2>AtomQuest Portal</h2>
        <p className="subtle">Goal Setting & Tracking Platform</p>

        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
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
              aria-invalid={!!emailError}
            />
            {emailError ? <div className="fieldError">{emailError}</div> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>

            <div className="inputRow">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (err) setErr("");
                }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                autoComplete="current-password"
                aria-invalid={!!passwordError}
              />
              <button
                type="button"
                className="btn btn--ghost btn--icon"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordError ? <div className="fieldError">{passwordError}</div> : null}
          </div>

          <button className="btn btn--primary btn--full" type="submit" disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {err ? (
          <div className="error" role="alert">
            ⚠️ {err}
          </div>
        ) : null}

        {/* Demo Buttons (optional for hackathon)
        <div className="demo-buttons">
          <p>Demo Accounts (for testing):</p>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => demoLogin("admin@atomberg.com", "admin123")}
            disabled={isSubmitting}
          >
            Admin
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => demoLogin("manager@atomberg.com", "manager123")}
            disabled={isSubmitting}
          >
            Manager
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => demoLogin("employee@atomberg.com", "employee123")}
            disabled={isSubmitting}
          >
            Employee
          </button>
        </div> */}
      </div>
    </div>
  );
}