"use client";

import { useRef, useState, useEffect } from "react";

function estimateOrders(product) {
  if (product.orders && product.orders > 0) return { value: product.orders, isEstimate: false };
  if (product.reviews && product.reviews > 0) return { value: Math.round(product.reviews * 15), isEstimate: true };
  return { value: 0, isEstimate: false };
}

function TopSlider({ products }) {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const top = [...products]
    .sort((a, b) => (b.winningScore || 0) - (a.winningScore || 0))
    .slice(0, 20);

  useEffect(() => {
    if (!trackRef.current || isPaused || top.length === 0) return;
    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 280, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, top.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setActiveIndex(Math.round(el.scrollLeft / 280));
      }, 150);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => { el.removeEventListener("scroll", handleScroll); clearTimeout(timeout); };
  }, []);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 560, behavior: "smooth" });
  };

  if (top.length === 0) return null;

  return (
    <section className="top-slider">
      <div className="top-slider-header">
        <div className="top-slider-title-group">
          <h2 className="top-slider-title">Top Winnende Producten</h2>
          <div className="top-slider-live">
            <span className="live-dot"></span>
            Live data
          </div>
        </div>
        <div className="top-slider-controls">
          <button className="slider-arrow" onClick={() => scroll(-1)} aria-label="Vorige">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="slider-dots">
            {Array.from({ length: Math.min(Math.ceil(top.length / 2), 10) }).map((_, i) => (
              <span key={i} className={`slider-dot ${Math.floor(activeIndex / 2) === i ? "active" : ""}`} />
            ))}
          </div>
          <button className="slider-arrow" onClick={() => scroll(1)} aria-label="Volgende">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div
        className="top-slider-track"
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {top.map((product, i) => {
          const sell = product.sellPrice || 0;
          const scoreClass =
            product.winningScore >= 60 ? "score-high" : product.winningScore >= 40 ? "score-mid" : "score-low";
          const isTop3 = i < 3;
          const medalNames = ["gold", "silver", "bronze"];

          return (
            <div key={`top-${product.id || i}`} className={`top-slide ${isTop3 ? `top-slide-${medalNames[i]}` : ""}`}>
              {/* Rank badge */}
              <div className={`slide-rank ${isTop3 ? `slide-rank-${medalNames[i]}` : ""}`}>
                {i + 1}
              </div>

              {/* Image */}
              <div className="top-slide-image">
                <img
                  src={product.image || "https://placehold.co/200x200/f8fafc/94a3b8?text=?"}
                  alt={product.name}
                  onError={(e) => { e.target.src = "https://placehold.co/200x200/f8fafc/94a3b8?text=?"; }}
                  loading="lazy"
                />
              </div>

              <div className="top-slide-body">
                {/* Title */}
                <h4 title={product.name}>{product.name}</h4>

                {/* Score bar */}
                <div className="slide-score-row">
                  <span className="slide-score-label">Score</span>
                  <div className="slide-score-bar-bg">
                    <div
                      className={`slide-score-bar-fill ${scoreClass}`}
                      style={{ width: `${product.winningScore}%` }}
                    ></div>
                  </div>
                  <span className={`slide-score-num ${scoreClass}`}>{product.winningScore}</span>
                </div>

                {/* Price */}
                <div className="slide-price-row">
                  <span className="slide-price">&euro;{sell.toFixed(2)}</span>
                </div>

                {/* Stats row */}
                <div className="slide-stats">
                  {(() => { const o = estimateOrders(product); return o.value > 0 && (
                    <>
                      <div className="slide-stat">
                        <span className="slide-stat-label">{o.isEstimate ? "~Verkocht" : "Verkocht"}</span>
                        <span className="slide-stat-value">{o.value.toLocaleString("nl-NL")}+</span>
                      </div>
                      <div className="slide-stat-divider"></div>
                    </>
                  ); })()}
                  <div className="slide-stat">
                    <span className="slide-stat-label">Rating</span>
                    <span className="slide-stat-value">{product.rating ? product.rating.toFixed(1) : "-"}</span>
                  </div>
                </div>
              </div>

              {product.link && (
                <a className="top-slide-link" href={product.link} target="_blank" rel="noopener noreferrer">
                  Bekijk product &rarr;
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TopSlider;
