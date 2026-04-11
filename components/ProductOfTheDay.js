"use client";

import { useMemo } from "react";

function estimateOrders(product) {
  if (product.orders && product.orders > 0) return { value: product.orders, isEstimate: false };
  if (product.reviews && product.reviews > 0) return { value: Math.round(product.reviews * 15), isEstimate: true };
  return { value: 0, isEstimate: false };
}

function ProductOfTheDay({ products, onFindSupplier }) {
  // Selecteer product van de dag op basis van datum (zelfde product hele dag)
  const product = useMemo(() => {
    if (!products || products.length === 0) return null;
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % products.length;
    return products[dayIndex];
  }, [products]);

  if (!product) return null;

  const sell = product.sellPrice || 0;
  const ordersInfo = estimateOrders(product);

  return (
    <div className="potd">
      <div className="potd-badge">Product van de dag</div>
      <div className="potd-content">
        <div className="potd-image">
          <img src={product.image} alt={product.name} onError={(e) => { e.target.style.display = "none"; }} />
        </div>
        <div className="potd-info">
          <h3>{product.name}</h3>
          <div className="potd-stats">
            <div className="potd-stat">
              <span className="potd-stat-value">&euro;{sell.toFixed(2)}</span>
              <span className="potd-stat-label">Verkoopprijs</span>
            </div>
            <div className="potd-stat">
              <span className="potd-stat-value">{product.winningScore || 0}</span>
              <span className="potd-stat-label">Winning Score</span>
            </div>
            {ordersInfo.value > 0 && (
              <div className="potd-stat">
                <span className="potd-stat-value">{ordersInfo.isEstimate && "~"}{ordersInfo.value.toLocaleString("nl-NL")}+</span>
                <span className="potd-stat-label">{ordersInfo.isEstimate ? "Verkocht (~)" : "Verkocht"}</span>
              </div>
            )}
            <div className="potd-stat">
              <span className="potd-stat-value">{product.rating ? product.rating.toFixed(1) : "-"}</span>
              <span className="potd-stat-label">Rating</span>
            </div>
          </div>
          <div className="potd-actions">
            <button className="potd-btn" onClick={() => onFindSupplier(product)}>Vind leverancier</button>
            <a className="potd-link" href={product.link} target="_blank" rel="noopener noreferrer">Bekijk op Amazon &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductOfTheDay;
