"use client";

import { useState } from "react";
import { analyzeProduct } from "../services/api";
import { trackAction } from "../services/trackProgress";

function TrendAnalyzer() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeProduct(keyword.trim());
      setResult(data);
      if (data) {
        trackAction("usedAnalyzer", true);
        const count = parseInt(localStorage.getItem("lp_analyzerCount") || "0") + 1;
        localStorage.setItem("lp_analyzerCount", String(count));
        trackAction("analyzerSearches", count);
      }
    } catch (err) {
      setError("Kon product niet analyseren. Is de backend gestart?");
    }
    setLoading(false);
  };

  return (
    <div className="trend-analyzer">
      <h2>Product Analyzer</h2>
      <p className="analyzer-desc">
        Voer een productnaam in om de trend en winning score te berekenen
      </p>

      <div className="analyzer-input">
        <input
          type="text"
          placeholder="bijv. wireless earbuds, yoga mat, led strip..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyseren..." : "Analyseer"}
        </button>
      </div>

      {error && <div className="analyzer-error">{error}</div>}

      {result && (
        <div className="analyzer-result">
          <div className="score-circle" style={{ borderColor: result.scoreColor }}>
            <span className="score-number">{result.score}</span>
            <span className="score-label">{result.scoreLabel}</span>
          </div>

          <div className="analyzer-details">
            <div className="detail-item">
              <span className="detail-label">Trend</span>
              <span className={`detail-value trend-${result.trendDirection}`}>
                {result.trendDirection === "up"
                  ? "\u2191"
                  : result.trendDirection === "down"
                  ? "\u2193"
                  : "\u2192"}{" "}
                {result.trendPercent}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Datapunten</span>
              <span className="detail-value">{result.trendData?.length || 0}</span>
            </div>
          </div>

          {result.trendData && result.trendData.length > 0 && (
            <div className="mini-chart">
              <h4>Zoekvolume (90 dagen)</h4>
              <div className="chart-bars">
                {result.trendData.map((point, i) => (
                  <div
                    key={i}
                    className="chart-bar"
                    style={{ height: `${point.value}%` }}
                    title={`${point.date}: ${point.value}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrendAnalyzer;
