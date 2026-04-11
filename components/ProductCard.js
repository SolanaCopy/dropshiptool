"use client";

import { isBrandProduct } from "../services/brands";
import AdTips from "./AdTips";

function extractKeywords(name) {
  const mainPart = name.split(",")[0].split(" - ")[0].split(" | ")[0];
  const stopwords = ["met","van","voor","en","de","het","een","door","bij","with","for","and","the","from","by","in","on","to","of"];
  return mainPart
    .replace(/[()[\]{}/\\&+!?;:#@"'™®©]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1)
    .filter((w) => !stopwords.includes(w.toLowerCase()))
    .slice(0, 6)
    .join(" ");
}

function getSupplierLinks(productName) {
  const q = encodeURIComponent(extractKeywords(productName));
  return [
    { name: "AliExpress", url: `https://www.aliexpress.com/wholesale?SearchText=${q}&SortType=total_tranpro_desc`, color: "#e43225" },
    { name: "1688", url: `https://s.1688.com/selloffer/offer_search.htm?keywords=${q}`, color: "#ff6a00" },
    { name: "Temu", url: `https://www.temu.com/search_result.html?search_key=${q}`, color: "#fb7701" },
    { name: "CJ", url: `https://cjdropshipping.com/search.html?keyword=${q}`, color: "#1890ff" },
    { name: "Alibaba", url: `https://www.alibaba.com/trade/search?SearchText=${q}`, color: "#ff6a00" },
  ];
}

function ProductCard({ product, onFindSupplier, onToggleFavorite, isFavorite }) {
  const sell = product.sellPrice || 0;
  // Alleen echte inkoopprijs tonen als die lager is dan verkoopprijs
  const hasRealCost = product.price > 0 && product.price < sell;
  const cost = hasRealCost ? product.price : 0;
  const margin = hasRealCost ? sell - cost : 0;
  const marginPercent = hasRealCost && sell > 0 ? ((margin / sell) * 100).toFixed(0) : 0;

  const trendArrow = product.trend === "up" ? "\u2191" : product.trend === "down" ? "\u2193" : "\u2192";
  const trendClass = product.trend === "up" ? "trend-up" : product.trend === "down" ? "trend-down" : "trend-stable";
  const scoreClass = product.winningScore >= 60 ? "score-high" : product.winningScore >= 40 ? "score-mid" : "score-low";

  const fallbackImage = "https://placehold.co/400x400/f8fafc/94a3b8?text=Geen+afbeelding";
  const suppliers = getSupplierLinks(product.name);

  return (
    <div className="product-card card-dropship">
      {product.winningScore !== undefined && (
        <div className={`card-score ${scoreClass}`}>
          <span className="card-score-num">{product.winningScore}</span>
        </div>
      )}

      <div className="product-image">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          onError={(e) => { e.target.src = fallbackImage; }}
          loading="lazy"
        />
        <span className={`trend-badge ${trendClass}`}>
          {trendArrow} {product.trendPercent || 0}%
        </span>
        {onToggleFavorite && (
          <button
            className={`fav-btn ${isFavorite ? "fav-btn-active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
            title={isFavorite ? "Verwijder uit favorieten" : "Opslaan"}
          >
            {isFavorite ? "\u2764" : "\u2661"}
          </button>
        )}
      </div>

      <div className="product-info">
        <h3 title={product.name}>{product.name}</h3>

        <div className="product-meta">
          <span className="product-source">{product.source}</span>
          <span className="dropship-chip">Dropship</span>
          {product.reviews > 0 && (
            <span className="product-reviews">{product.reviews.toLocaleString("nl-NL")} reviews</span>
          )}
        </div>

        <div className={`price-block ${hasRealCost ? "price-block-complete" : ""}`}>
          {hasRealCost ? (
            <>
              <div className="price-row-real">
                <div className="price-col">
                  <span className="price-col-label">Verkoop</span>
                  <span className="price-col-value">&euro;{sell.toFixed(2)}</span>
                </div>
                <div className="price-col">
                  <span className="price-col-label">Inkoop (AliExpress)</span>
                  <span className="price-col-value price-col-cost">&euro;{cost.toFixed(2)}</span>
                </div>
                <div className="price-col">
                  <span className="price-col-label">Winst</span>
                  <span className="price-col-value price-col-profit">&euro;{margin.toFixed(2)}</span>
                </div>
              </div>
              <div className="price-margin-bar">
                <div className="price-margin-fill" style={{ width: `${Math.min(marginPercent, 100)}%` }}></div>
                <span className="price-margin-text">{marginPercent}% marge</span>
              </div>
            </>
          ) : (
            <div className="price-row-simple">
              <div>
                <span className="price-sell">&euro;{sell.toFixed(2)}</span>
                <span className="price-label-tag">Verkoopprijs</span>
              </div>
              <span className="price-find-hint">Klik hieronder voor echte inkoopprijs</span>
            </div>
          )}
        </div>

        <div className="product-metrics">
          <div className="metric">
            <div className="metric-icon">&#128200;</div>
            <div>
              <span className="metric-value">{(product.orders || 0).toLocaleString("nl-NL")}+</span>
              <span className="metric-label">Verkocht</span>
            </div>
          </div>
          <div className="metric">
            <div className="metric-icon">&#11088;</div>
            <div>
              <span className="metric-value">{product.rating ? product.rating.toFixed(1) : "n.v.t."}</span>
              <span className="metric-label">Rating</span>
            </div>
          </div>
        </div>

        <AdTips product={product} />

        {/* Leveranciers */}
        <div className="card-suppliers">
          {product.image && (
            <button className="find-supplier-btn" onClick={() => onFindSupplier && onFindSupplier(product)}>
              &#128269; Vind exacte leverancier
            </button>
          )}
          <div className="card-suppliers-links">
            {suppliers.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className="card-supplier-chip" style={{ "--supplier-color": s.color }}
              >{s.name}</a>
            ))}
          </div>
        </div>

        {product.link && (
          <a className="product-link" href={product.link} target="_blank" rel="noopener noreferrer">
            Bekijk op {product.source} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
