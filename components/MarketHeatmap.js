"use client";

const CATEGORIES = [
  { name: "Telefoon", heat: 92, products: 120, trend: "up" },
  { name: "Huis & Keuken", heat: 85, products: 223, trend: "up" },
  { name: "Sport & Fitness", heat: 78, products: 221, trend: "stable" },
  { name: "Elektronica", heat: 75, products: 232, trend: "up" },
  { name: "Mode", heat: 70, products: 174, trend: "stable" },
  { name: "Kinderen", heat: 65, products: 117, trend: "up" },
  { name: "Verlichting", heat: 62, products: 114, trend: "stable" },
  { name: "Huisdieren", heat: 60, products: 114, trend: "up" },
  { name: "Auto", heat: 55, products: 111, trend: "stable" },
  { name: "Tuin", heat: 48, products: 108, trend: "stable" },
];

function getHeatColor(heat) {
  if (heat >= 80) return "#ef4444";
  if (heat >= 60) return "#f97316";
  if (heat >= 40) return "#eab308";
  return "#94a3b8";
}

function MarketHeatmap() {
  return (
    <div className="heatmap">
      <h3>Markt Heatmap</h3>
      <p className="heatmap-desc">Welke categorieën zijn nu het populairst</p>
      <div className="heatmap-grid">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            className="heatmap-cell"
            style={{ borderColor: getHeatColor(cat.heat), background: `${getHeatColor(cat.heat)}10` }}
          >
            <div className="heatmap-cell-heat" style={{ color: getHeatColor(cat.heat) }}>{cat.heat}</div>
            <div className="heatmap-cell-name">{cat.name}</div>
            <div className="heatmap-cell-meta">
              <span>{cat.products} producten</span>
              <span className={`heatmap-trend heatmap-trend-${cat.trend}`}>
                {cat.trend === "up" ? "\u2191" : "\u2192"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketHeatmap;
