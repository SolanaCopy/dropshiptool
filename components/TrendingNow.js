"use client";

import { useState, useEffect } from "react";
import { fetchDailyTrends } from "../services/api";

const FALLBACK_TRENDS = [
  { title: "Draadloze oordopjes", traffic: "Trending", category: "Elektronica" },
  { title: "Telefoonhouder auto", traffic: "Trending", category: "Auto" },
  { title: "LED strip verlichting", traffic: "Trending", category: "Verlichting" },
  { title: "Honden speelgoed", traffic: "Trending", category: "Huisdieren" },
  { title: "Keuken organizer", traffic: "Trending", category: "Huis & Keuken" },
  { title: "Resistance bands", traffic: "Trending", category: "Sport & Fitness" },
  { title: "MagSafe oplader", traffic: "Trending", category: "Telefoon" },
  { title: "Auto stofzuiger mini", traffic: "Trending", category: "Auto" },
  { title: "Nachtlamp kinderen", traffic: "Trending", category: "Kinderen" },
  { title: "Yoga mat", traffic: "Trending", category: "Sport & Fitness" },
  { title: "Bamboe tandenborstel", traffic: "Trending", category: "Duurzaam" },
  { title: "Draagbare ventilator", traffic: "Trending", category: "Huis & Keuken" },
];

function TrendingNow() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchDailyTrends("NL")
      .then((data) => {
        if (data.length > 0) return data;
        return fetchDailyTrends("US");
      })
      .then((data) => {
        if (data.length > 0) {
          setTrends(data.slice(0, 12));
          setIsLive(true);
        } else {
          setTrends(FALLBACK_TRENDS);
        }
        setLoading(false);
      })
      .catch(() => {
        setTrends(FALLBACK_TRENDS);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="trending-now">
        <h2>Trending Producten</h2>
        <div className="trending-loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="trending-card trending-skeleton">
              <div className="trending-rank">#{i + 1}</div>
              <div className="trending-info"><div className="trending-skeleton-bar"></div></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="trending-now">
      <h2>Trending Producten</h2>
      <p className="trending-desc">
        {isLive
          ? "Live trending zoekopdrachten van vandaag — gebruik dit als inspiratie voor product research"
          : "Populaire dropshipping producten — zoek hierop om winnende producten te vinden"
        }
      </p>
      {!isLive && (
        <div className="trending-notice">
          Google Trends data is tijdelijk niet beschikbaar. Hieronder staan bewezen populaire dropshipping producten.
        </div>
      )}
      <div className="trending-grid">
        {trends.map((trend, i) => (
          <div key={i} className="trending-card">
            <div className="trending-rank">#{i + 1}</div>
            <div className="trending-info">
              <h4>{trend.title}</h4>
              <div className="trending-meta">
                {trend.traffic && <span className="trending-traffic">{trend.traffic}</span>}
                {trend.category && <span className="trending-category">{trend.category}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingNow;
