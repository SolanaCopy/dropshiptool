const express = require("express");
const db = require("../services/database");
const { authMiddleware } = require("./auth");

const router = express.Router();

// GET /api/alerts — alerts ophalen
router.get("/", authMiddleware, (req, res) => {
  const alerts = db.prepare("SELECT * FROM alerts WHERE userId = ?").all(req.user.id);
  res.json({ success: true, data: alerts });
});

// POST /api/alerts — alert aanmaken/updaten
router.post("/", authMiddleware, (req, res) => {
  const { frequency, categories, minScore } = req.body;

  // Check of er al een alert bestaat
  const existing = db.prepare("SELECT id FROM alerts WHERE userId = ?").get(req.user.id);

  if (existing) {
    db.prepare(
      "UPDATE alerts SET frequency = ?, categories = ?, minScore = ?, active = 1 WHERE userId = ?"
    ).run(frequency || "weekly", categories || "", minScore || 50, req.user.id);
  } else {
    db.prepare(
      "INSERT INTO alerts (userId, email, frequency, categories, minScore) VALUES (?, ?, ?, ?, ?)"
    ).run(req.user.id, req.user.email, frequency || "weekly", categories || "", minScore || 50);
  }

  res.json({ success: true });
});

// DELETE /api/alerts — alert uitschakelen
router.delete("/", authMiddleware, (req, res) => {
  db.prepare("UPDATE alerts SET active = 0 WHERE userId = ?").run(req.user.id);
  res.json({ success: true });
});

module.exports = router;
