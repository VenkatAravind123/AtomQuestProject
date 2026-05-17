import { createContext, useContext, useEffect, useMemo, useState } from "react";
import config from "../config.js";
const AuthContext = createContext(null);

const API_URL = config.API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function me() {
    const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }

  useEffect(() => {
    (async () => {
      try {
        const current = await me();
        setUser(current);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}