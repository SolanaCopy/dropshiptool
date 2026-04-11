"use client";

import { useAuth } from "../context/AuthContext";

function Pricing({ onCheckout }) {
  const { user } = useAuth();
  const isPro = user && user.plan === "pro";

  return (
    <section className="pricing" id="prijzen">
      <div className="pricing-badge">Beperkte actie</div>
      <h2>Vind winnende producten terwijl je concurrent nog aan het scrollen is</h2>
      <p className="pricing-sub">De gemiddelde Pro gebruiker vindt binnen 7 dagen een winnend product. Wat kost 1 week vertraging jou?</p>

      <div className="pricing-grid pricing-grid-two">
        {/* Starter */}
        <div className="pricing-card">
          <div className="pricing-header">
            <h3>Starter</h3>
            <p className="pricing-card-desc">Even proberen</p>
            <div className="pricing-price">
              <span className="pricing-amount">&euro;0</span>
            </div>
          </div>
          <ul className="pricing-features">
            <li className="pf-yes">5 zoekopdrachten totaal</li>
            <li className="pf-yes">3x leverancier zoeken</li>
            <li className="pf-yes">3 favorieten</li>
            <li className="pf-yes">Winning Score</li>
            <li className="pf-yes">Winstcalculator</li>
            <li className="pf-yes">Beginner cursus (8 lessen)</li>
            <li className="pf-no">Trend Analyzer</li>
            <li className="pf-no">Social Trends</li>
            <li className="pf-no">Onbeperkt zoeken</li>
            <li className="pf-no">Email alerts</li>
            <li className="pf-no">CSV export</li>
          </ul>
          <button className="pricing-btn pricing-btn-outline" disabled={!!user}>
            {user ? "Huidig plan" : "Gratis starten"}
          </button>
        </div>

        {/* Pro */}
        <div className="pricing-card pricing-card-popular">
          <div className="pricing-popular-tag">Meest gekozen</div>
          <div className="pricing-header">
            <h3>Pro</h3>
            <p className="pricing-card-desc">Voor serieuze dropshippers</p>
            <div className="pricing-price">
              <span className="pricing-amount">&euro;15</span>
              <span className="pricing-period">/maand</span>
            </div>
          </div>

          <div className="pricing-highlight">
            <span>&#128161;</span> 1 winnend product verdient dit 100x terug
          </div>

          <ul className="pricing-features">
            <li className="pf-yes pf-strong">Onbeperkt zoeken</li>
            <li className="pf-yes pf-strong">Onbeperkt leveranciers zoeken</li>
            <li className="pf-yes pf-strong">Onbeperkt favorieten</li>
            <li className="pf-yes">Trend Analyzer</li>
            <li className="pf-yes">TikTok &amp; Social Trends</li>
            <li className="pf-yes">Markt Heatmap &amp; Seizoenskalender</li>
            <li className="pf-yes">Zoekgeschiedenis</li>
            <li className="pf-yes">Email alerts bij trending producten</li>
            <li className="pf-yes">CSV export</li>
            <li className="pf-yes">Gevorderd + Pro cursus (21 lessen)</li>
          </ul>
          <button
            className="pricing-btn pricing-btn-primary"
            onClick={() => !isPro && onCheckout && onCheckout()}
            disabled={isPro}
          >
            {isPro ? "Huidig plan" : user ? "Upgrade naar Pro" : "Log in om te upgraden"}
          </button>
          <p className="pricing-guarantee">Veilig betalen &middot; Opzeggen wanneer je wilt</p>
        </div>
      </div>

      {/* Social proof */}
      <div className="pricing-proof">
        <div className="pricing-proof-stat">
          <strong>2.400+</strong>
          <span>dropshippers gebruiken Trendvinder</span>
        </div>
        <div className="pricing-proof-stat">
          <strong>7 dagen</strong>
          <span>gemiddeld tot eerste winnend product</span>
        </div>
        <div className="pricing-proof-stat">
          <strong>&euro;0</strong>
          <span>risico &mdash; opzeggen wanneer je wilt</span>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
