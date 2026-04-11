"use client";

import { useState, useEffect } from "react";
import { getHistory, clearHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";

function SearchHistory({ onSearch }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  if (!user) {
    return (
      <div className="history-page">
        <h2>Zoekgeschiedenis</h2>
        <div className="history-empty">
          <p>Log in om je zoekgeschiedenis te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Zoekgeschiedenis</h2>
        {history.length > 0 && (
          <button className="history-clear" onClick={handleClear}>Wis geschiedenis</button>
        )}
      </div>

      {loading && <div className="loading"><div className="spinner"></div></div>}

      {!loading && history.length === 0 && (
        <div className="history-empty">
          <p>Je hebt nog niet gezocht. Ga naar Producten Zoeken om te beginnen.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item" onClick={() => onSearch(item.query)}>
              <div className="history-item-icon">&#128269;</div>
              <div className="history-item-info">
                <span className="history-item-query">{item.query}</span>
                <span className="history-item-meta">
                  {item.resultCount} resultaten &middot; {new Date(item.searchedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="history-item-arrow">&rarr;</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchHistory;
