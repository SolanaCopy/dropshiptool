"use client";

import { useState, useEffect } from "react";
import { getAlerts, saveAlert, deleteAlert } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { trackAction } from "../services/trackProgress";

const FREQUENCIES = [
  { value: "daily", label: "Dagelijks", desc: "Elke ochtend om 8:00" },
  { value: "weekly", label: "Wekelijks", desc: "Elke maandag" },
  { value: "none", label: "Uit", desc: "Geen alerts" },
];

const CATEGORIES = [
  "Elektronica", "Verlichting", "Huis & Keuken", "Tuin",
  "Sport & Fitness", "Mode", "Telefoon", "Auto", "Kinderen", "Huisdieren",
];

function AlertSettings() {
  const { user } = useAuth();
  const [frequency, setFrequency] = useState("weekly");
  const [selectedCats, setSelectedCats] = useState([]);
  const [minScore, setMinScore] = useState(50);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getAlerts().then((alerts) => {
      if (alerts.length > 0) {
        const a = alerts[0];
        setFrequency(a.frequency || "weekly");
        setSelectedCats(a.categories ? a.categories.split(",").filter(Boolean) : []);
        setMinScore(a.minScore || 50);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (frequency === "none") {
      await deleteAlert();
    } else {
      await saveAlert({
        frequency,
        categories: selectedCats.join(","),
        minScore,
      });
    }
    setSaved(true);
    if (frequency !== "none") trackAction("usedAlerts", true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="alerts-page">
        <h2>Email Alerts</h2>
        <div className="alerts-empty">
          <p>Log in om email alerts in te stellen voor trending producten.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="alerts-page">
      <h2>Email Alerts</h2>
      <p className="alerts-desc">
        Ontvang automatisch de beste trending producten in je inbox.
        Wij sturen alleen producten met een hoge Winning Score.
      </p>

      {/* Frequentie */}
      <div className="alert-section">
        <div className="alert-section-title">Hoe vaak wil je alerts?</div>
        <div className="alert-options">
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              className={`alert-option ${frequency === f.value ? "active" : ""}`}
              onClick={() => { setFrequency(f.value); setSaved(false); }}
            >
              <span className="alert-option-label">{f.label}</span>
              <span className="alert-option-desc">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {frequency !== "none" && (
        <>
          {/* Minimum score */}
          <div className="alert-section">
            <div className="alert-section-title">Minimum Winning Score</div>
            <div className="alert-score-row">
              <input
                type="range"
                min="20"
                max="90"
                step="10"
                value={minScore}
                onChange={(e) => { setMinScore(parseInt(e.target.value)); setSaved(false); }}
                className="alert-slider"
              />
              <span className="alert-score-value">{minScore}+</span>
            </div>
            <p className="alert-score-hint">
              {minScore >= 70 ? "Alleen toppers" : minScore >= 50 ? "Veelbelovende producten" : "Breed bereik"}
            </p>
          </div>

          {/* Categorieën */}
          <div className="alert-section">
            <div className="alert-section-title">Categorieën (optioneel)</div>
            <div className="alert-cats">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`alert-cat ${selectedCats.includes(cat) ? "active" : ""}`}
                  onClick={() => toggleCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="alert-cats-hint">
              {selectedCats.length === 0 ? "Alle categorieën" : `${selectedCats.length} geselecteerd`}
            </p>
          </div>

          {/* Email preview */}
          <div className="alert-section">
            <div className="alert-section-title">Je ontvangt</div>
            <div className="alert-preview">
              <div className="alert-preview-header">
                <span>Aan: {user.email}</span>
                <span>{frequency === "daily" ? "Elke dag" : "Elke week"}</span>
              </div>
              <div className="alert-preview-body">
                Top trending producten met score {minScore}+
                {selectedCats.length > 0 && ` in ${selectedCats.join(", ")}`}
              </div>
            </div>
          </div>
        </>
      )}

      <button className="alert-save" onClick={handleSave}>
        {saved ? "Opgeslagen!" : frequency === "none" ? "Alerts uitschakelen" : "Alert opslaan"}
      </button>
      {saved && <span className="alert-saved-msg">Je instellingen zijn opgeslagen</span>}
    </div>
  );
}

export default AlertSettings;
