const express = require("express");
const router = express.Router();
const {
  getTrendingSearches,
  getInterestOverTime,
  getRelatedTopics,
} = require("../services/googleTrends");

// GET /api/trends/daily — trending zoekopdrachten in NL
router.get("/daily", async (req, res) => {
  const geo = req.query.geo || "NL";
  const trends = await getTrendingSearches(geo);
  res.json({ success: true, count: trends.length, data: trends });
});

// GET /api/trends/interest?keyword=... — zoekvolume over tijd
router.get("/interest", async (req, res) => {
  const { keyword, geo } = req.query;
  if (!keyword) {
    return res.status(400).json({ success: false, error: "keyword is verplicht" });
  }
  const data = await getInterestOverTime(keyword, geo || "NL");
  res.json({ success: true, keyword, data });
});

// GET /api/trends/related?keyword=... — gerelateerde opkomende topics
router.get("/related", async (req, res) => {
  const { keyword, geo } = req.query;
  if (!keyword) {
    return res.status(400).json({ success: false, error: "keyword is verplicht" });
  }
  const data = await getRelatedTopics(keyword, geo || "NL");
  res.json({ success: true, keyword, data });
});

module.exports = router;
