"use client";

import { useState, useEffect, useRef } from "react";
import { trackAction, getTrackedActions } from "../services/trackProgress";
import { useAuth } from "../context/AuthContext";

const PLATFORMS = [
  { name: "Shopify", fee: 2.9, fixed: 0.30, icon: "🛒" },
  { name: "Bol.com", fee: 10, fixed: 0, icon: "📦" },
  { name: "Amazon", fee: 15, fixed: 0, icon: "🅰️" },
  { name: "Etsy", fee: 6.5, fixed: 0.20, icon: "🎨" },
  { name: "Eigen webshop", fee: 2, fixed: 0.25, icon: "🌐" },
];

const SHIPPING = [
  { name: "CJDropshipping", cost: 3.50, days: "7-15 dagen", icon: "📬" },
  { name: "AliExpress Standard", cost: 0, days: "15-30 dagen", icon: "✈️" },
  { name: "ePacket", cost: 2.50, days: "10-20 dagen", icon: "📮" },
  { name: "DHL Express", cost: 12, days: "3-7 dagen", icon: "🚚" },
];

const COUNTRIES = [
  { name: "Nederland", tax: 21 },
  { name: "België", tax: 21 },
  { name: "Duitsland", tax: 19 },
  { name: "Frankrijk", tax: 20 },
  { name: "Geen BTW", tax: 0 },
];

const AD_CHANNELS = [
  { name: "Facebook Ads", costPer: 4, icon: "📘" },
  { name: "TikTok Ads", costPer: 2.50, icon: "🎵" },
  { name: "Google Ads", costPer: 5, icon: "🔍" },
  { name: "Instagram Ads", costPer: 3.50, icon: "📸" },
  { name: "Geen advertenties", costPer: 0, icon: "❌" },
];

function ProfitCalculator({ onUpgrade }) {
  const { user } = useAuth();
  const isPro = user && (user.plan === "pro" || user.plan === "business");
  const [calcUses, setCalcUses] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const uses = parseInt(localStorage.getItem("calc_uses") || "0");
    setCalcUses(uses);
    if (uses >= 1 && !isPro) setLocked(true);
  }, [isPro]);

  const [sellPrice, setSellPrice] = useState("29.99");
  const [buyPrice, setBuyPrice] = useState("8.50");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [shipping, setShipping] = useState(SHIPPING[0]);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [adChannel, setAdChannel] = useState(AD_CHANNELS[0]);

  const sell = parseFloat(sellPrice) || 0;
  const buy = parseFloat(buyPrice) || 0;
  const ship = shipping.cost;
  const platformCost = sell * (platform.fee / 100) + platform.fixed;
  const taxCost = sell * (country.tax / 100);
  const ad = adChannel.costPer;
  const totalCost = buy + ship + platformCost + ad;
  const revenue = sell - taxCost;
  const profit = revenue - totalCost;
  const margin = sell > 0 ? (profit / sell * 100).toFixed(1) : 0;

  // Track als gebruiker echt iets berekent
  const tracked = useRef(false);
  useEffect(() => {
    if (sell > 0 && buy > 0 && !tracked.current) {
      tracked.current = true;
      trackAction("usedCalculator", true);
      const newUses = calcUses + 1;
      localStorage.setItem("calc_uses", String(newUses));
      setCalcUses(newUses);
      // Lock na 1 keer voor gratis gebruikers
      if (newUses >= 1 && !isPro) setLocked(true);
    }
  }, [sell, buy, calcUses, isPro]);
  const roi = totalCost > 0 ? (profit / totalCost * 100).toFixed(1) : 0;

  if (locked) {
    return (
      <div className="calculator">
        <div className="calc-locked">
          <div className="calc-locked-icon">&#128176;</div>
          <h3>Je gratis berekening is gebruikt</h3>
          <p>Je hebt de winstcalculator 1x gratis kunnen gebruiken. Upgrade naar Pro voor onbeperkt berekenen.</p>
          <div className="calc-locked-value">
            <span>Onbeperkt berekenen voor</span>
            <strong>&euro;14,99/maand</strong>
          </div>
          <button className="pro-lock-btn" onClick={onUpgrade}>Upgrade naar Pro &rarr;</button>
          <span className="pro-lock-trial">7 dagen gratis proberen</span>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator">
      <h2>Winstcalculator</h2>
      <p className="calculator-desc">Selecteer je platform, verzending en advertentiekanaal — de kosten worden automatisch berekend</p>
      {!isPro && calcUses === 0 && (
        <div className="calc-free-notice">&#128161; Je kunt de calculator 1x gratis gebruiken. Daarna is Pro vereist.</div>
      )}

      <div className="calc-grid">
        <div className="calc-inputs">
          {/* Prijzen */}
          <div className="calc-section">
            <div className="calc-section-title">Prijzen</div>
            <div className="calc-row-inputs">
              <div className="calc-field">
                <label>Verkoopprijs</label>
                <div className="calc-input-wrap">
                  <span className="calc-prefix">&euro;</span>
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="29.99" step="0.01" />
                </div>
              </div>
              <div className="calc-field">
                <label>Inkoopprijs</label>
                <div className="calc-input-wrap">
                  <span className="calc-prefix">&euro;</span>
                  <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="8.50" step="0.01" />
                </div>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="calc-section">
            <div className="calc-section-title">Verkoopplatform</div>
            <div className="calc-options">
              {PLATFORMS.map((p) => (
                <button
                  key={p.name}
                  className={`calc-option ${platform.name === p.name ? "active" : ""}`}
                  onClick={() => setPlatform(p)}
                >
                  <span className="calc-option-icon">{p.icon}</span>
                  <span className="calc-option-name">{p.name}</span>
                  <span className="calc-option-detail">{p.fee}%{p.fixed > 0 ? ` + €${p.fixed.toFixed(2)}` : ""}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Verzending */}
          <div className="calc-section">
            <div className="calc-section-title">Verzending</div>
            <div className="calc-options">
              {SHIPPING.map((s) => (
                <button
                  key={s.name}
                  className={`calc-option ${shipping.name === s.name ? "active" : ""}`}
                  onClick={() => setShipping(s)}
                >
                  <span className="calc-option-icon">{s.icon}</span>
                  <span className="calc-option-name">{s.name}</span>
                  <span className="calc-option-detail">{s.cost === 0 ? "Gratis" : `€${s.cost.toFixed(2)}`} &middot; {s.days}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advertenties */}
          <div className="calc-section">
            <div className="calc-section-title">Advertenties</div>
            <div className="calc-options">
              {AD_CHANNELS.map((a) => (
                <button
                  key={a.name}
                  className={`calc-option ${adChannel.name === a.name ? "active" : ""}`}
                  onClick={() => setAdChannel(a)}
                >
                  <span className="calc-option-icon">{a.icon}</span>
                  <span className="calc-option-name">{a.name}</span>
                  <span className="calc-option-detail">{a.costPer === 0 ? "Gratis" : `~€${a.costPer.toFixed(2)}/verkoop`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Land */}
          <div className="calc-section">
            <div className="calc-section-title">BTW land</div>
            <div className="calc-options calc-options-small">
              {COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  className={`calc-option calc-option-sm ${country.name === c.name ? "active" : ""}`}
                  onClick={() => setCountry(c)}
                >
                  <span className="calc-option-name">{c.name}</span>
                  <span className="calc-option-detail">{c.tax}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultaat */}
        <div className="calc-result">
          <div className="calc-result-header">Resultaat per product</div>

          <div className="calc-breakdown">
            <div className="calc-row">
              <span>Verkoopprijs</span>
              <span className="calc-row-pos">&euro;{sell.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Inkoopprijs</span>
              <span className="calc-row-neg">-&euro;{buy.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Verzending ({shipping.name})</span>
              <span className="calc-row-neg">-&euro;{ship.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>{platform.name} ({platform.fee}%)</span>
              <span className="calc-row-neg">-&euro;{platformCost.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>{adChannel.name}</span>
              <span className="calc-row-neg">-&euro;{ad.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>BTW {country.name} ({country.tax}%)</span>
              <span className="calc-row-neg">-&euro;{taxCost.toFixed(2)}</span>
            </div>
          </div>

          <div className={`calc-profit ${profit >= 0 ? "calc-profit-pos" : "calc-profit-neg"}`}>
            <div className="calc-profit-label">Winst per product</div>
            <div className="calc-profit-value">&euro;{profit.toFixed(2)}</div>
          </div>

          <div className="calc-metrics">
            <div className="calc-metric">
              <span className="calc-metric-value">{margin}%</span>
              <span className="calc-metric-label">Marge</span>
            </div>
            <div className="calc-metric">
              <span className="calc-metric-value">{roi}%</span>
              <span className="calc-metric-label">ROI</span>
            </div>
            <div className="calc-metric">
              <span className={`calc-metric-value ${profit * 30 >= 0 ? "" : "calc-neg"}`}>&euro;{(profit * 30).toFixed(0)}</span>
              <span className="calc-metric-label">30 verkopen</span>
            </div>
            <div className="calc-metric">
              <span className={`calc-metric-value ${profit * 100 >= 0 ? "" : "calc-neg"}`}>&euro;{(profit * 100).toFixed(0)}</span>
              <span className="calc-metric-label">100 verkopen</span>
            </div>
          </div>

          {profit < 0 && (
            <div className="calc-warning">
              Je maakt verlies op dit product. Verhoog je verkoopprijs of zoek een goedkopere leverancier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfitCalculator;
