const express = require("express");
const db = require("../services/database");
const { authMiddleware } = require("./auth");
const { checkFavoriteLimit, getUserPlan, getLimits } = require("../services/planLimits");

const router = express.Router();

// CSV export (Pro only)
router.get("/csv", authMiddleware, (req, res) => {
  const plan = getUserPlan(req.user.id);
  const limits = getLimits(plan);

  if (!limits.csv) {
    return res.status(403).json({ success: false, error: "CSV export is alleen beschikbaar voor Pro gebruikers. Upgrade om te downloaden.", upgrade: true });
  }

  const favorites = db.prepare("SELECT * FROM favorites WHERE userId = ? ORDER BY addedAt DESC").all(req.user.id);

  if (favorites.length === 0) {
    return res.status(404).json({ success: false, error: "Je hebt nog geen favorieten om te exporteren." });
  }

  const headers = ["Product", "Verkoopprijs", "Inkoopprijs", "Marge", "Marge %", "Categorie", "Bron", "Link", "Opgeslagen op"];
  const rows = favorites.map((f) => {
    const margin = (f.sellPrice || 0) - (f.supplierPrice || 0);
    const marginPct = f.sellPrice > 0 ? ((margin / f.sellPrice) * 100).toFixed(1) : "0";
    return [
      csvEscape(f.productName),
      (f.sellPrice || 0).toFixed(2),
      (f.supplierPrice || 0).toFixed(2),
      margin.toFixed(2),
      marginPct,
      csvEscape(f.category || ""),
      csvEscape(f.source || ""),
      csvEscape(f.link || ""),
      f.addedAt || "",
    ].join(",");
  });

  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="trendvinder-favorieten-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

function csvEscape(str) {
  if (!str) return "";
  str = String(str);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

router.get("/", authMiddleware, (req, res) => {
  const favorites = db.prepare("SELECT * FROM favorites WHERE userId = ? ORDER BY addedAt DESC").all(req.user.id);
  res.json({ success: true, data: favorites });
});

router.post("/", authMiddleware, (req, res) => {
  const { productId, productName, productImage, sellPrice, supplierPrice, source, link, category } = req.body;

  if (!productId || !productName) {
    return res.status(400).json({ success: false, error: "Product data is verplicht" });
  }

  // Check favorieten limiet
  const limit = checkFavoriteLimit(req.user.id);
  if (!limit.allowed) {
    return res.status(429).json({ success: false, error: limit.error, limitReached: true });
  }

  try {
    db.prepare(`
      INSERT OR REPLACE INTO favorites (userId, productId, productName, productImage, sellPrice, supplierPrice, source, link, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, productId, productName, productImage || "", sellPrice || 0, supplierPrice || 0, source || "", link || "", category || "");

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete("/:productId", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM favorites WHERE userId = ? AND productId = ?").run(req.user.id, req.params.productId);
  res.json({ success: true });
});

module.exports = router;
