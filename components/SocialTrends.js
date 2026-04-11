"use client";

import { useState, useEffect } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005") + "/api";

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function SocialTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("tiktok");

  useEffect(() => {
    fetch(`${API_URL}/social/trending`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json);
        else setError("Kon trends niet laden");
        setLoading(false);
      })
      .catch(() => {
        setError("Kon trends niet laden. Is de backend gestart?");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div><p>Social trends laden...</p></div>;
  if (error) return <div className="search-error">{error}</div>;

  return (
    <div className="social-trends">
      <h2>Social Media Trends</h2>
      <p className="social-desc">Ontdek wat trending is op TikTok en Google — vind producten voordat ze viraal gaan</p>

      <div className="social-tabs">
        <button className={`social-tab ${activeTab === "tiktok" ? "active" : ""}`} onClick={() => setActiveTab("tiktok")}>
          TikTok Trending
        </button>
        <button className={`social-tab ${activeTab === "googleNL" ? "active" : ""}`} onClick={() => setActiveTab("googleNL")}>
          Google NL
        </button>
        <button className={`social-tab ${activeTab === "googleUS" ? "active" : ""}`} onClick={() => setActiveTab("googleUS")}>
          Google US
        </button>
      </div>

      {/* TikTok */}
      {activeTab === "tiktok" && (
        <div className="social-grid">
          {data?.tiktok?.length > 0 ? (
            data.tiktok.map((item, i) => (
              <div key={item.id || i} className="social-card tiktok-card">
                <div className="social-card-rank">#{i + 1}</div>
                {item.cover && (
                  <div className="social-card-cover">
                    <img src={item.cover} alt={item.desc || `TikTok trending video #${i + 1}`} onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
                <div className="social-card-info">
                  <p className="social-card-desc">{item.desc || "Geen beschrijving"}</p>
                  {item.author && <span className="social-card-author">@{item.author}</span>}
                  <div className="social-card-stats">
                    {item.views > 0 && <span>&#128065; {formatNumber(item.views)}</span>}
                    {item.likes > 0 && <span>&#10084; {formatNumber(item.likes)}</span>}
                    {item.shares > 0 && <span>&#128257; {formatNumber(item.shares)}</span>}
                  </div>
                  {item.hashtags.length > 0 && (
                    <div className="social-card-hashtags">
                      {item.hashtags.slice(0, 5).map((h) => (
                        <span key={h} className="hashtag">#{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="social-empty">
              <p>TikTok trends niet beschikbaar.</p>
              <p className="social-empty-hint">Subscribe de Scraptik API op RapidAPI om TikTok data te zien.</p>
            </div>
          )}
        </div>
      )}

      {/* Google NL */}
      {activeTab === "googleNL" && (
        <div className="social-grid">
          {data?.googleNL?.length > 0 ? (
            data.googleNL.map((item, i) => (
              <div key={i} className="social-card google-card">
                <div className="social-card-rank">#{i + 1}</div>
                <div className="social-card-info">
                  <h4 className="social-card-title">{item.title}</h4>
                  <span className="social-card-traffic">{item.traffic}</span>
                  {item.relatedQueries?.length > 0 && (
                    <div className="social-card-related">
                      {item.relatedQueries.slice(0, 3).map((q) => (
                        <span key={q} className="related-tag">{q}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="social-empty">
              <p>Google NL trends niet beschikbaar op dit moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Google US */}
      {activeTab === "googleUS" && (
        <div className="social-grid">
          {data?.googleUS?.length > 0 ? (
            data.googleUS.map((item, i) => (
              <div key={i} className="social-card google-card">
                <div className="social-card-rank">#{i + 1}</div>
                <div className="social-card-info">
                  <h4 className="social-card-title">{item.title}</h4>
                  <span className="social-card-traffic">{item.traffic}</span>
                  {item.relatedQueries?.length > 0 && (
                    <div className="social-card-related">
                      {item.relatedQueries.slice(0, 3).map((q) => (
                        <span key={q} className="related-tag">{q}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="social-empty">
              <p>Google US trends niet beschikbaar op dit moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SocialTrends;
