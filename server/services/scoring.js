/**
 * Winning Product Score Algoritme
 *
 * Berekent een score van 0-100 op basis van:
 * - Google Trends zoekvolume (30%)
 * - Verkoopaantallen (25%)
 * - Winstmarge (25%)
 * - Rating (10%)
 * - Trend richting (10%)
 */

function calculateWinningScore(product, trendData = null) {
  let score = 0;

  // --- Verkoopaantallen (25 punten) ---
  const sales = product.orders || product.sales || 0;
  if (sales > 50000) score += 25;
  else if (sales > 20000) score += 20;
  else if (sales > 10000) score += 15;
  else if (sales > 5000) score += 10;
  else if (sales > 1000) score += 5;

  // --- Winstmarge (25 punten) ---
  const cost = product.price || 0;
  const sellPrice = product.sellPrice || cost * 3; // standaard 3x markup
  const margin = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;
  if (margin >= 70) score += 25;
  else if (margin >= 60) score += 20;
  else if (margin >= 50) score += 15;
  else if (margin >= 40) score += 10;
  else if (margin >= 30) score += 5;

  // --- Rating (10 punten) ---
  const rating = product.rating || 0;
  if (rating >= 4.5) score += 10;
  else if (rating >= 4.0) score += 7;
  else if (rating >= 3.5) score += 4;

  // --- Trend richting (10 punten) ---
  const trendPercent = product.trendPercent || 0;
  if (trendPercent >= 40) score += 10;
  else if (trendPercent >= 20) score += 7;
  else if (trendPercent >= 10) score += 4;

  // --- Google Trends data (30 punten) ---
  if (trendData && trendData.length > 0) {
    const recent = trendData.slice(-7);
    const older = trendData.slice(-30, -7);

    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const olderAvg =
      older.length > 0 ? older.reduce((sum, p) => sum + p.value, 0) / older.length : 0;

    // Hoog absoluut zoekvolume
    if (recentAvg >= 80) score += 15;
    else if (recentAvg >= 50) score += 10;
    else if (recentAvg >= 25) score += 5;

    // Stijgende trend
    if (olderAvg > 0) {
      const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
      if (growth >= 50) score += 15;
      else if (growth >= 20) score += 10;
      else if (growth >= 5) score += 5;
    }
  }

  return Math.min(score, 100);
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Topper", color: "#22c55e" };
  if (score >= 60) return { label: "Veelbelovend", color: "#3b82f6" };
  if (score >= 40) return { label: "Potentie", color: "#eab308" };
  if (score >= 20) return { label: "Matig", color: "#f97316" };
  return { label: "Zwak", color: "#ef4444" };
}

module.exports = { calculateWinningScore, getScoreLabel };
