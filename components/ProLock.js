"use client";

import { useAuth } from "../context/AuthContext";

const FEATURE_INFO = {
  "Trend Analyzer": {
    icon: "&#128200;",
    benefit: "Zie welke producten stijgen voordat je concurrenten ze ontdekken",
    stat: "90 dagen Google Trends data",
  },
  "Social Trends": {
    icon: "&#127909;",
    benefit: "Ontdek producten die nu viraal gaan op TikTok",
    stat: "Live TikTok trending data",
  },
  "Email Alerts": {
    icon: "&#128276;",
    benefit: "Krijg automatisch bericht als er een nieuw winnend product is",
    stat: "Nooit meer een trend missen",
  },
  "Zoekgeschiedenis": {
    icon: "&#128338;",
    benefit: "Bekijk al je eerdere zoekopdrachten en resultaten terug",
    stat: "Onbeperkte geschiedenis",
  },
  "Markt Heatmap & Seizoenskalender": {
    icon: "&#127919;",
    benefit: "Weet precies welke producten in welke maand verkopen",
    stat: "12 maanden seizoensdata",
  },
};

function ProLock({ children, feature, onUpgrade }) {
  const { user } = useAuth();
  const isPro = user && (user.plan === "pro" || user.plan === "business");

  if (isPro) return children;

  const info = FEATURE_INFO[feature] || { icon: "&#128274;", benefit: "", stat: "" };

  return (
    <div className="pro-lock">
      <div className="pro-lock-blur">
        {children}
      </div>
      <div className="pro-lock-overlay">
        <div className="pro-lock-card">
          <div className="pro-lock-icon" dangerouslySetInnerHTML={{ __html: info.icon }} />
          <h3>{feature}</h3>
          <p className="pro-lock-benefit">{info.benefit}</p>
          <div className="pro-lock-stat">{info.stat}</div>
          <div className="pro-lock-price">
            <span className="pro-lock-price-label">Ontgrendel voor</span>
            <span className="pro-lock-price-value">&euro;14,99<small>/maand</small></span>
          </div>
          <button className="pro-lock-btn" onClick={onUpgrade}>
            Upgrade naar Pro &rarr;
          </button>
          <span className="pro-lock-trial">7 dagen gratis proberen</span>
        </div>
      </div>
    </div>
  );
}

export default ProLock;
