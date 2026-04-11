"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import ProductCard from "./ProductCard";
import TrendAnalyzer from "./TrendAnalyzer";
import TrendingNow from "./TrendingNow";
import Pricing from "./Pricing";
import TopSlider from "./TopSlider";
import SupplierModal from "./SupplierModal";
import AuthModal from "./AuthModal";
import ProfitCalculator from "./ProfitCalculator";
import ProLock from "./ProLock";
import ProductOfTheDay from "./ProductOfTheDay";
import ProfitSimulator from "./ProfitSimulator";
import NicheScore from "./NicheScore";
import MarketHeatmap from "./MarketHeatmap";
import LiveActivity from "./LiveActivity";
import SeasonCalendar from "./SeasonCalendar";
import SocialTrends from "./SocialTrends";
import SearchHistory from "./SearchHistory";
import AlertSettings from "./AlertSettings";
import LearnPath from "./LearnPath";
import SEOContent from "./SEOContent";
import Footer from "./Footer";
import { searchProducts, getFavorites, addFavorite, removeFavorite, saveSearch, exportFavoritesCSV } from "../services/api";
import { isBrandProduct } from "../services/brands";
import { trackAction } from "../services/trackProgress";
import { useAuth } from "../context/AuthContext";
import Checkout from "./Checkout";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005") + "/api";

export default function HomeApp() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [showCheckout, setShowCheckout] = useState(null);

  // Wrapper: check eerst of user ingelogd is voor checkout
  const handleUpgrade = () => {
    if (!user) {
      sessionStorage.setItem("afterLoginAction", "upgrade");
      setShowAuth("login");
      return;
    }
    setShowCheckout({ plan: "pro" });
  };
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [products, setProducts] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [supplierProduct, setSupplierProductRaw] = useState(null);
  const setSupplierProduct = (product) => {
    setSupplierProductRaw(product);
    if (product) {
      const count = parseInt(localStorage.getItem("lp_supplierCount") || "0") + 1;
      localStorage.setItem("lp_supplierCount", String(count));
      trackAction("supplierSearches", count);
    }
  };
  const [supplierPrices, setSupplierPrices] = useState({});
  const [category, setCategory] = useState("Alle");
  const [showAuth, setShowAuth] = useState(null); // null | "login" | "register"
  const [favorites, setFavorites] = useState([]);
  const [showProWelcome, setShowProWelcome] = useState(false);

  // Toon welcome banner na Pro upgrade
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("justUpgradedToPro") === "1") {
      sessionStorage.removeItem("justUpgradedToPro");
      setShowProWelcome(true);
    }
  }, []);

  // Open checkout automatisch na login als user eerst wilde upgraden
  useEffect(() => {
    if (user && typeof window !== "undefined" && sessionStorage.getItem("afterLoginAction") === "upgrade") {
      sessionStorage.removeItem("afterLoginAction");
      setShowCheckout({ plan: "pro" });
    }
  }, [user]);

  const loadFavorites = () => {
    const token = localStorage.getItem("token");
    if (token) {
      getFavorites().then((favs) => {
        setFavorites(favs);
        trackAction("favoritesCount", favs.length);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) { setShowAuth("login"); return; }

    const isFav = favorites.some((f) => f.productId === product.id);
    if (isFav) {
      await removeFavorite(product.id);
    } else {
      await addFavorite(product);
    }
    loadFavorites();
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/products/trending`)
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.data || []);
        setSearched(true);
        setLoading(false);
      })
      .catch(() => {
        setError("Kon producten niet laden. Start de backend: npm run server");
        setLoading(false);
      });
  }, []);

  const [limitReached, setLimitReached] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setLimitReached(false);
    setSearched(true);
    try {
      const result = await searchProducts(query.trim());
      if (result.limitReached) {
        setLimitReached(true);
        setError(result.error);
        setProducts([]);
        setLoading(false);
        return;
      }
      setProducts(result.data || []);
      setTrendData({
        direction: result.trendDirection,
        percent: result.trendPercent,
        points: result.trendData,
      });
      // Track voor leerpad
      trackAction("searchCount", (parseInt(localStorage.getItem("lp_searchCount") || "0")) + 1);
      trackAction("productsViewed", (result.data || []).length);
      if (result.remaining !== undefined) setSearchesRemaining(result.remaining);
      if (localStorage.getItem("token")) {
        saveSearch(query.trim(), result.count || 0).catch(() => {});
      }
    } catch (err) {
      setError("Zoeken mislukt. Is de backend gestart? (npm run server)");
      setProducts([]);
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["Alle", ...Array.from(cats).sort()];
  }, [products]);

  const sorted = useMemo(() => {
    const filtered = products
      .filter((p) => !isBrandProduct(p.name))
      .filter((p) => category === "Alle" || p.category === category)
      .map((p) => ({
        ...p,
        price: supplierPrices[p.id] || p.price,
      }));
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.winningScore || 0) - (a.winningScore || 0);
        case "sales":
          return (b.orders || 0) - (a.orders || 0);
        case "margin": {
          const mA = a.sellPrice > 0 ? (a.sellPrice - a.price) / a.sellPrice : 0;
          const mB = b.sellPrice > 0 ? (b.sellPrice - b.price) / b.sellPrice : 0;
          return mB - mA;
        }
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });
  }, [products, sortBy, supplierPrices, category]);

  return (
    <>
      <Header
        onShowAuth={(mode) => setShowAuth(mode || "login")}
        activeTab={tab}
        onTabChange={setTab}
        favoriteCount={favorites.length}
        previewProducts={sorted.slice(0, 3)}
        showHero={tab === "products"}
      />

      <main className="main">

        {tab === "products" && (
          <>
            {!loading && sorted.length > 0 && (
              <div className="slider-section">
                <TopSlider products={sorted} />
              </div>
            )}
            <div className="live-search">
              <div className="live-search-row">
                <div className="search-bar">
                  <span className="search-icon">&#128269;</span>
                  <input
                    type="text"
                    placeholder="Zoek op productnaam, niche of categorie..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button className="search-btn" onClick={handleSearch} disabled={loading}>
                  {loading ? "Zoeken..." : "Zoeken"}
                </button>
              </div>

              {!loading && categories.length > 2 && (
                <div className="category-bar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`category-chip ${category === cat ? "active" : ""}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat === "Alle" ? "Alle categorieën" : cat}
                    </button>
                  ))}
                </div>
              )}

              {sorted.length > 0 && !loading && (
                <div className="search-controls">
                  <span className="results-count">
                    <strong>{sorted.length}</strong> producten gevonden
                  </span>
                  <div className="sort-select">
                    <label htmlFor="sort">Sorteer op:</label>
                    <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="score">Winning Score</option>
                      <option value="sales">Meest verkocht</option>
                      <option value="margin">Hoogste marge</option>
                      <option value="rating">Beste rating</option>
                      <option value="price-low">Laagste prijs</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {trendData && (
              <div className={`trend-banner trend-banner-${trendData.direction}`}>
                <span className="trend-banner-icon">
                  {trendData.direction === "up" ? "\u2191" : trendData.direction === "down" ? "\u2193" : "\u2192"}
                </span>
                <span>
                  Google Trends:{" "}
                  <strong>
                    {trendData.direction === "up" ? "Stijgend" : trendData.direction === "down" ? "Dalend" : "Stabiel"}
                  </strong>
                  {trendData.percent !== 0 && ` (${trendData.percent > 0 ? "+" : ""}${trendData.percent}%)`}
                </span>
                {trendData.points && trendData.points.length > 0 && (
                  <div className="trend-banner-chart">
                    {trendData.points.map((p, i) => (
                      <div key={i} className="trend-banner-bar" style={{ height: `${p.value}%` }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && !limitReached && <div className="search-error">{error}</div>}

            {limitReached && (
              <div className="limit-banner">
                <div className="limit-banner-icon">&#128274;</div>
                <div className="limit-banner-text">
                  <strong>Gratis limiet bereikt</strong>
                  <p>Je hebt je 5 gratis zoekopdrachten gebruikt. Upgrade naar Pro voor onbeperkt zoeken.</p>
                </div>
                <button className="limit-banner-btn" onClick={() => setTab("pricing")}>
                  Upgrade naar Pro &rarr;
                </button>
              </div>
            )}

            {searchesRemaining !== null && searchesRemaining !== Infinity && searchesRemaining <= 2 && !limitReached && (
              <div className="limit-warning">
                Nog {searchesRemaining} gratis zoekopdracht{searchesRemaining !== 1 ? "en" : ""} over &middot;
                <button onClick={() => setTab("pricing")}>Upgrade voor onbeperkt</button>
              </div>
            )}

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Producten laden vanuit Amazon &amp; Google Trends...</p>
              </div>
            )}

            {!loading && sorted.length > 0 && (
              <div className="product-grid">
                {sorted.map((product, i) => (
                  <ProductCard key={`${product.id || product.source}-${i}`} product={product} onFindSupplier={setSupplierProduct} onToggleFavorite={handleToggleFavorite} isFavorite={favorites.some((f) => f.productId === product.id)} />
                ))}
              </div>
            )}

            {!loading && searched && products.length === 0 && !error && (
              <div className="no-results">
                <h3>Geen producten gevonden</h3>
                <p>Probeer een andere zoekterm</p>
              </div>
            )}
          </>
        )}

        {tab === "analyzer" && (
          <ProLock feature="Trend Analyzer" onUpgrade={handleUpgrade}>
            <TrendAnalyzer />
          </ProLock>
        )}
        {tab === "trending" && <TrendingNow />}
        {tab === "niches" && (
          <div className="niches-page">
            <NicheScore />
            <ProLock feature="Markt Heatmap & Seizoenskalender" onUpgrade={handleUpgrade}>
              <MarketHeatmap />
              <SeasonCalendar />
            </ProLock>
          </div>
        )}
        {tab === "social" && (
          <ProLock feature="Social Trends" onUpgrade={handleUpgrade}>
            <SocialTrends />
          </ProLock>
        )}
        {tab === "history" && (
          <ProLock feature="Zoekgeschiedenis" onUpgrade={handleUpgrade}>
            <SearchHistory onSearch={(q) => { setQuery(q); setTab("products"); }} />
          </ProLock>
        )}
        {tab === "alerts" && (
          <ProLock feature="Email Alerts" onUpgrade={handleUpgrade}>
            <AlertSettings />
          </ProLock>
        )}
        {tab === "calculator" && <ProfitCalculator onUpgrade={handleUpgrade} />}
        {tab === "learn" && <LearnPath onNavigate={setTab} />}
        {tab === "favorites" && (
          <div className="favorites-page">
            <div className="favorites-header">
              <h2>Opgeslagen producten</h2>
              {favorites.length > 0 && (
                <button className="csv-export-btn" onClick={async () => {
                  const result = await exportFavoritesCSV();
                  if (!result.success) {
                    if (result.upgrade) handleUpgrade();
                    else setError(result.error);
                  }
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                    <path d="M2 12v2h12v-2M8 2v8M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  CSV Export
                </button>
              )}
            </div>
            {favorites.length === 0 ? (
              <div className="favorites-empty">
                <p>Je hebt nog geen producten opgeslagen.</p>
                <p>Klik op het hartje bij een product om het op te slaan.</p>
              </div>
            ) : (
              <div className="product-grid">
                {favorites.map((product, i) => (
                  <ProductCard key={`fav-${i}`} product={product} onFindSupplier={setSupplierProduct} />
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "pricing" && <Pricing onCheckout={handleUpgrade} />}

        {/* Engagement sectie — alleen op products tab */}
        {tab === "products" && (
          <div className="engagement-section">
            <div className="engagement-content">
              {sorted.length > 0 && <ProductOfTheDay products={sorted} onFindSupplier={setSupplierProduct} />}
              <div className="engagement-grid">
                <ProfitSimulator />
                <LiveActivity />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SEO content + Footer — alleen op products tab */}
      {tab === "products" && <SEOContent />}
      {tab === "products" && <Footer />}

      {showProWelcome && (
        <div className="pro-welcome-banner">
          <div className="pro-welcome-inner">
            <div className="pro-welcome-icon">&#127881;</div>
            <div className="pro-welcome-text">
              <strong>Welkom bij Trendvinder Pro!</strong>
              <span>Alle features zijn nu ontgrendeld &mdash; veel succes met je zoektocht!</span>
            </div>
            <button className="pro-welcome-close" onClick={() => setShowProWelcome(false)}>&times;</button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal initialMode={showAuth} onClose={() => setShowAuth(null)} />}

      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(null)}
          onSuccess={() => {
            setShowCheckout(null);
            sessionStorage.setItem("justUpgradedToPro", "1");
            window.location.reload();
          }}
        />
      )}

      {supplierProduct && (
        <SupplierModal
          product={supplierProduct}
          onClose={() => setSupplierProduct(null)}
          onPriceFound={(price) => {
            setSupplierPrices((prev) => ({ ...prev, [supplierProduct.id]: price }));
          }}
        />
      )}
    </>
  );
}
