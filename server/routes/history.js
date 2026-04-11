const express = require("express");
const db = require("../services/database");
const { authMiddleware } = require("./auth");

const router = express.Router();

// GET /api/history — zoekgeschiedenis ophalen
router.get("/", authMiddleware, (req, res) => {
  const history = db.prepare(
    "SELECT * FROM search_history WHERE userId = ? ORDER BY searchedAt DESC LIMIT 50"
  ).all(req.user.id);
  res.json({ success: true, data: history });
});

// POST /api/history — zoekopdracht opslaan
router.post("/", authMiddleware, (req, res) => {
  const { query, resultCount } = req.body;
  if (!query) return res.status(400).json({ success: false, error: "query verplicht" });

  db.prepare(
    "INSERT INTO search_history (userId, query, resultCount) VALUES (?, ?, ?)"
  ).run(req.user.id, query, resultCount || 0);

  res.json({ success: true });
});

// DELETE /api/history — geschiedenis wissen
router.delete("/", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM search_history WHERE userId = ?").run(req.user.id);
  res.json({ success: true });
});

module.exports = router;
