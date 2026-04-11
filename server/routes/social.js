const express = require("express");
const router = express.Router();
const { getTikTokTrending, searchTikTok } = require("../services/tiktok");
const { getTrendingSearches } = require("../services/googleTrends");

// In-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 uur

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

// GET /api/social/trending — gecombineerde social trends
router.get("/trending", async (req, res) => {
  const cached = getCached("social-trending");
  if (cached) return res.json({ success: true, ...cached, cached: true });

  try {
    const [tiktok, googleNL, googleUS] = await Promise.all([
      getTikTokTrending().catch(() => []),
      getTrendingSearches("NL").catch(() => []),
      getTrendingSearches("US").catch(() => []),
    ]);

    const result = {
      tiktok: tiktok.slice(0, 20),
      googleNL: googleNL.slice(0, 15),
      googleUS: googleUS.slice(0, 15),
    };

    setCache("social-trending", result);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/social/tiktok/search?q=...
router.get("/tiktok/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: "zoekterm verplicht" });

  const cached = getCached(`tiktok-search:${q}`);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const results = await searchTikTok(q);
  setCache(`tiktok-search:${q}`, results);
  res.json({ success: true, count: results.length, data: results });
});

module.exports = router;
