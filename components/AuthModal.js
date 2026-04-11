"use client";

import { useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../context/AuthContext";

function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="auth-header">
          <h2>{mode === "login" ? "Inloggen" : "Account aanmaken"}</h2>
          <p>{mode === "login" ? "Log in om producten op te slaan" : "Maak een gratis account aan"}</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            Inloggen
          </button>
          <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>
            Registreren
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label>Naam</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Je naam" required />
            </div>
          )}
          <div className="auth-field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="je@email.nl" required />
          </div>
          <div className="auth-field">
            <label>Wachtwoord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 tekens" required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Even wachten..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;
