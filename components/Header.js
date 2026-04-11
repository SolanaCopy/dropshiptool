"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";

const TABS = [
  { id: "products", label: "Producten", icon: "&#128269;" },
  { id: "learn", label: "Leerpad", icon: "&#127891;" },
  { id: "analyzer", label: "Analyzer", icon: "&#128200;" },
  { id: "trending", label: "Trending", icon: "&#128293;" },
  { id: "social", label: "Social", icon: "&#127909;" },
  { id: "niches", label: "Niches", icon: "&#127919;" },
  { id: "calculator", label: "Calculator", icon: "&#128176;" },
  { id: "favorites", label: "Favorieten", icon: "&#10084;" },
  { id: "history", label: "Geschiedenis", icon: "&#128338;" },
  { id: "alerts", label: "Alerts", icon: "&#128276;" },
  { id: "pricing", label: "Prijzen", icon: "&#11088;" },
];

function HeroPreviewCards({ products }) {
  const items = products && products.length >= 2 ? products.slice(0, 2) : null;

  if (!items) {
    // Skeleton loading state
    return (
      <div className="hero-preview-cards">
        {[0, 1].map((i) => (
          <div key={i} className={`hero-preview-card ${i === 0 ? "hp-card-winner" : ""}`}>
            {i === 0 && <div className="hp-card-badge">&#127942; #1</div>}
            <div className="hero-preview-card-img hp-img-skeleton"><div className="hp-skeleton-shimmer"></div></div>
            <div className="hero-preview-card-body">
              <div className="hp-card-name-skeleton"></div>
              <div className="hp-card-price-skeleton"></div>
              <div className="hero-preview-card-score">
                <div className="hero-preview-score-bar"><div className="hero-preview-score-fill hp-fill-high" style={{width:"0%"}}></div></div>
                <span className="hp-score-num hp-score-high">--</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hero-preview-cards">
      {items.map((p, i) => (
        <div key={p.id || i} className={`hero-preview-card ${i === 0 ? "hp-card-winner" : ""}`}>
          {i === 0 && <div className="hp-card-badge">&#127942; #1</div>}
          <div className="hero-preview-card-img">
            {p.image && (
              <img
                src={p.image}
                alt={p.name || "Product"}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>
          <div className="hero-preview-card-body">
            <div className="hp-card-name">{(p.name || "").substring(0, 35)}</div>
            <div className="hp-card-prices">
              <span className="hp-price-sell">&euro;{(p.sellPrice || 0).toFixed(2)}</span>
              {p.price > 0 && <span className="hp-price-buy">&euro;{p.price.toFixed(2)}</span>}
            </div>
            <div className="hero-preview-card-score">
              <div className="hero-preview-score-bar">
                <div
                  className={`hero-preview-score-fill ${(p.winningScore || 0) >= 70 ? "hp-fill-high" : "hp-fill-mid"}`}
                  style={{width: `${p.winningScore || 0}%`}}
                ></div>
              </div>
              <span className={`hp-score-num ${(p.winningScore || 0) >= 70 ? "hp-score-high" : "hp-score-mid"}`}>
                {p.winningScore || 0}
              </span>
            </div>
            <div className="hp-card-suppliers">
              <span className="hp-supplier hp-ali">AliExpress</span>
              <span className="hp-supplier hp-cj">CJ</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Header({ onShowAuth, activeTab, onTabChange, favoriteCount, previewProducts, showHero = true }) {
  const { user, logout } = useAuth();
  const isPro = user && user.plan === "pro";

  return (
    <header className="header">
      <div className="header-bg">
        <div className="header-orb header-orb-1"></div>
        <div className="header-orb header-orb-2"></div>
        <div className="header-orb header-orb-3"></div>
        <div className="header-grid"></div>
      </div>

      <div className="header-content">
        {/* Top bar */}
        <div className="header-top">
          <div className="logo">
            <div className="logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
              <h1>Trendvinder</h1>
              <span className="logo-badge">PRO</span>
            </div>
          </div>
          <nav className="header-nav">
            <Link href="/blog" className="nav-link">Blog</Link>
            {user ? (
              <>
                <span className="nav-user">Hoi, {user.name}</span>
                {isPro ? (
                  <span className="nav-plan-badge nav-plan-pro" title="Je hebt Trendvinder Pro">
                    &#9733; PRO
                  </span>
                ) : (
                  <span className="nav-plan-badge nav-plan-free" title="Gratis plan">
                    FREE
                  </span>
                )}
                <button className="btn-cta btn-logout" onClick={logout}>Uitloggen</button>
              </>
            ) : (
              <div className="nav-auth-buttons">
                <button className="btn-auth-login" onClick={() => onShowAuth("login")}>
                  Inloggen
                </button>
                <button className="btn-auth-register" onClick={() => onShowAuth("register")}>
                  <span className="btn-cta-icon">&#9889;</span>
                  Account aanmaken
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Hero: split layout — alleen op products tab */}
        {showHero && <div className="hero-split">
          {/* Left: tekst */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Vertrouwd door 2.400+ dropshippers
            </div>

            <h2>
              Vind winnende producten
              <br />
              <span className="hero-accent">voordat je concurrent dat doet</span>
            </h2>

            <p className="hero-sub">
              Analyseer producten met echte Amazon data, vergelijk leveranciers op AliExpress, CJDropshipping en Temu, en bereken je winstmarge — alles op één plek.
            </p>

            <div className="hero-cta-row">
              {!user && (
                <>
                  <button className="hero-btn-primary" onClick={() => onShowAuth("register")}>Account aanmaken &rarr;</button>
                  <button className="hero-btn-secondary" onClick={() => onShowAuth("login")}>
                    Inloggen
                  </button>
                </>
              )}
            </div>

            <div className="hero-trust">
              <div className="hero-trust-avatars">
                <span>M</span><span>S</span><span>D</span><span>L</span><span>+</span>
              </div>
              <div className="hero-trust-text">
                <div className="hero-trust-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <span>4.8/5 van 2.400+ gebruikers</span>
              </div>
            </div>
          </div>

          {/* Right: dashboard preview */}
          <div className="hero-right">
            <div className="hero-preview">
              <div className="hero-preview-glow"></div>
              <div className="hero-preview-window">
                <div className="hero-preview-topbar">
                  <div className="hero-preview-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="hero-preview-url">
                    <span className="hero-preview-lock">&#128274;</span>
                    trendvinder.nl
                  </div>
                  <div className="hero-preview-topbar-spacer"></div>
                </div>
                <div className="hero-preview-content">
                  <div className="hero-preview-search">
                    <span>&#128269;</span>
                    <div className="hero-preview-search-text">telefoon houder auto draadloos</div>
                    <div className="hero-preview-search-btn">Zoeken</div>
                  </div>

                  <div className="hero-preview-chips">
                    <span className="hp-chip active">Alle</span>
                    <span className="hp-chip">Elektronica</span>
                    <span className="hp-chip">Auto</span>
                    <span className="hp-chip">Telefoon</span>
                  </div>

                  <div className="hero-preview-trend">
                    <span className="hp-trend-arrow">&#8593;</span>
                    <span>Google Trends: <strong>Stijgend</strong> (+23%)</span>
                    <div className="hero-preview-trend-bars">
                      <div style={{height:"25%"}}></div>
                      <div style={{height:"40%"}}></div>
                      <div style={{height:"30%"}}></div>
                      <div style={{height:"50%"}}></div>
                      <div style={{height:"45%"}}></div>
                      <div style={{height:"65%"}}></div>
                      <div style={{height:"60%"}}></div>
                      <div style={{height:"75%"}}></div>
                      <div style={{height:"85%"}}></div>
                      <div style={{height:"95%"}}></div>
                    </div>
                  </div>

                  <HeroPreviewCards products={previewProducts} />

                  <div className="hero-preview-bottom">
                    <span className="hp-stat-item">&#128230; {previewProducts?.length > 0 ? `${previewProducts.length}+ producten` : "847 producten"}</span>
                    <span className="hp-stat-item">&#128994; live data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {showHero && (
          <div className="hero-stats-wrapper">
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-icon">&#128230;</div>
                <div className="hero-stat-content">
                  <strong>1500+</strong>
                  <span>Producten live</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon">&#128640;</div>
                <div className="hero-stat-content">
                  <strong>Real-time</strong>
                  <span>Amazon NL data</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon">&#128200;</div>
                <div className="hero-stat-content">
                  <strong>90 dagen</strong>
                  <span>Google Trends</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon">&#127942;</div>
                <div className="hero-stat-content">
                  <strong>0-100</strong>
                  <span>Winning Score</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navbar met tabs */}
      {onTabChange && (
        <nav className="header-tabs" aria-label="Navigatie">
          <div className="header-tabs-inner">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`header-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => onTabChange(t.id)}
              >
                <span className="header-tab-icon" dangerouslySetInnerHTML={{ __html: t.icon }} />
                <span className="header-tab-label">{t.label}</span>
                {t.id === "favorites" && favoriteCount > 0 && (
                  <span className="header-tab-badge">{favoriteCount}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
