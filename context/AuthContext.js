"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005") + "/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stap 1: laad token uit localStorage op mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("token");
    if (saved) {
      setToken(saved);
    } else {
      setLoading(false);
    }
  }, []);

  // Stap 2: als token verandert, haal user data op
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.success) {
          setUser(j.data);
        } else {
          // Token ongeldig — opruimen
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Netwerk error — token NIET wissen (backend kan even plat zijn)
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    localStorage.setItem("token", json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
    return json.data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    localStorage.setItem("token", json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
    return json.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Refresh user data (na plan upgrade)
  const refreshUser = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (j.success) setUser(j.data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
