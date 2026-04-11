const express = require("express");
const router = express.Router();
const { searchAmazon, getAmazonBestsellers } = require("../services/amazon");
const { getInterestOverTime, getTrendingProductKeywords } = require("../services/googleTrends");
const { calculateWinningScore, getScoreLabel } = require("../services/scoring");
const { searchByImage, searchByText, getLowestPrice } = require("../services/imageSearch");
const { translateToSearchTerms } = require("../services/cjdropshipping");
const { searchCJ, getCJPrice } = require("../services/cjdropshipping");
const { detectBrand } = require("../services/brandDetect");
const { searchBrandProduct } = require("../services/brandSearch");
const { checkSearchLimit, incrementSearch, checkSupplierLimit, incrementSupplierSearch } = require("../services/planLimits");
const jwt = require("jsonwebtoken");

// Optionele auth — haalt user ID op als er een token is
function optionalAuth(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// In-memory cache met limiet
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 uur - langer om API quota te sparen
const CACHE_MAX = 500;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key, data) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, time: Date.now() });
}

// GET /api/products/search?q=...
router.get("/search", async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, error: "zoekterm (q) is verplicht" });
  }

  // Plan limiet checken
  const user = optionalAuth(req);
  if (user) {
    const limit = checkSearchLimit(user.id);
    if (!limit.allowed) {
      return res.status(429).json({
        success: false,
        error: limit.error,
        limitReached: true,
        plan: limit.plan,
        remaining: 0,
      });
    }
    // Tel deze zoekopdracht
    incrementSearch(user.id);
  }

  const cacheKey = `search:${q.toLowerCase()}:${page}`;
  const cached = getCached(cacheKey);
  if (cached) {
    // Voeg limiet info toe aan response
    const remaining = user ? checkSearchLimit(user.id) : null;
    return res.json({ ...cached, cached: true, remaining: remaining?.remaining });
  }

  try {
    const [products, trendData] = await Promise.all([
      searchAmazon(q, page),
      getInterestOverTime(q).catch(() => []),
    ]);

    // Trend analyse
    let trendDirection = "stable";
    let trendPercent = 0;
    if (trendData.length >= 14) {
      const recent = trendData.slice(-7);
      const older = trendData.slice(-14, -7);
      const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;
      if (olderAvg > 0) {
        trendPercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
        trendDirection = trendPercent > 5 ? "up" : trendPercent < -5 ? "down" : "stable";
      }
    }

    // Winning score toevoegen
    const scoredProducts = products.map((p) => {
      const enriched = {
        ...p,
        trend: trendDirection,
        trendPercent: Math.abs(trendPercent),
      };
      const score = calculateWinningScore(enriched, trendData);
      const scoreInfo = getScoreLabel(score);
      return {
        ...enriched,
        winningScore: score,
        scoreLabel: scoreInfo.label,
        scoreColor: scoreInfo.color,
      };
    });

    scoredProducts.sort((a, b) => b.winningScore - a.winningScore);

    const result = {
      success: true,
      count: scoredProducts.length,
      trendDirection,
      trendPercent,
      trendData: trendData.slice(-30),
      data: scoredProducts,
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ success: false, error: "Zoeken mislukt: " + error.message });
  }
});

// GET /api/products/trending
router.get("/trending", async (req, res) => {
  const cached = getCached("trending");
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    console.log("Trending: producten ophalen per categorie...");

    // Gebruik getAmazonBestsellers — die heeft categorieën
    const allProducts = await getAmazonBestsellers();
    console.log("Trending:", allProducts.length, "producten gevonden");

    // Stap 4: Score berekenen
    const scoredProducts = allProducts.map((p) => {
      const score = calculateWinningScore(p);
      const scoreInfo = getScoreLabel(score);
      return {
        ...p,
        trend: "up",
        trendPercent: 0,
        winningScore: score,
        scoreLabel: scoreInfo.label,
        scoreColor: scoreInfo.color,
      };
    });

    scoredProducts.sort((a, b) => b.winningScore - a.winningScore);

    // Inkoopprijzen worden on-demand opgehaald via /find-supplier

    const result = {
      success: true,
      count: scoredProducts.length,
      data: scoredProducts,
    };

    // NOOIT lege resultaten cachen — anders blijft een falende API-call 6 uur hangen
    if (scoredProducts.length > 0) {
      setCache("trending", result);
    }
    res.json(result);
  } catch (error) {
    console.error("Trending error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products/trending/clear-cache — force refresh
router.post("/trending/clear-cache", (req, res) => {
  cache.delete("trending");
  res.json({ success: true, message: "Cache cleared" });
});

// GET /api/products/analyze?keyword=...
router.get("/analyze", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ success: false, error: "keyword is verplicht" });
  }

  const cacheKey = `analyze:${keyword.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, cached: true });
  }

  const trendData = await getInterestOverTime(keyword).catch(() => []);

  let trendDirection = "stable";
  let trendPercent = 0;
  if (trendData.length >= 14) {
    const recent = trendData.slice(-7);
    const older = trendData.slice(-14, -7);
    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;
    if (olderAvg > 0) {
      trendPercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      trendDirection = trendPercent > 5 ? "up" : trendPercent < -5 ? "down" : "stable";
    }
  }

  const score = calculateWinningScore(
    { name: keyword, trendPercent: Math.abs(trendPercent), trend: trendDirection },
    trendData
  );
  const scoreInfo = getScoreLabel(score);

  const result = {
    keyword,
    score,
    scoreLabel: scoreInfo.label,
    scoreColor: scoreInfo.color,
    trendDirection,
    trendPercent,
    trendData,
  };

  setCache(cacheKey, result);
  res.json({ success: true, data: result });
});

// GET /api/products/find-supplier?imageUrl=...&name=...&sellPrice=...
router.get("/find-supplier", async (req, res) => {
  const { imageUrl, name, sellPrice: sellPriceParam } = req.query;
  const sellPrice = parseFloat(sellPriceParam) || 0;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: "imageUrl is verplicht" });
  }

  // Leverancier zoek limiet checken
  const user = optionalAuth(req);
  if (user) {
    const limit = checkSupplierLimit(user.id);
    if (!limit.allowed) {
      return res.status(429).json({
        success: false,
        error: limit.error,
        limitReached: true,
      });
    }
    incrementSupplierSearch(user.id);
  }

  const cacheKey = `supplier:${imageUrl}`;
  const cached = getCached(cacheKey);
  if (cached && cached.data && cached.data.length > 0) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const brand = detectBrand(name || "");

    // AliExpress image search + CJ prijs + AliExpress text search PARALLEL
    const [aliImageResults, cjData, aliTextResults] = await Promise.all([
      searchByImage(imageUrl, name || ""),
      getCJPrice(name || "").catch(() => null),
      searchByText(name || "").catch(() => []),
    ]);

    const allResults = [];
    const seenIds = new Set();

    // AliExpress image search resultaten (primair — beste visual match)
    for (const ali of aliImageResults.slice(0, 10)) {
      if (!seenIds.has(ali.id)) {
        seenIds.add(ali.id);
        allResults.push({ ...ali, isDropshipPrice: false, searchType: "image" });
      }
    }

    // AliExpress text search als fallback (als image search < 3 exacte matches)
    const exactImageResults = aliImageResults.filter((r) => r.matchType === "exact").length;
    if (exactImageResults < 3) {
      for (const ali of aliTextResults.slice(0, 5)) {
        if (!seenIds.has(ali.id)) {
          seenIds.add(ali.id);
          allResults.push({ ...ali, isDropshipPrice: false, searchType: "text" });
        }
      }
    }

    // CJ resultaten toevoegen
    if (cjData && cjData.results) {
      for (const cj of cjData.results.slice(0, 5)) {
        if (!seenIds.has(cj.id)) {
          seenIds.add(cj.id);
          allResults.push({ ...cj, matchScore: 75, isDropshipPrice: true, matchType: "exact", searchType: "cj" });
        }
      }
    }

    // Sorteer: exacte matches eerst, dan CJ, dan prijs
    allResults.sort((a, b) => {
      // Exact matches boven similar
      const typeOrder = { exact: 0, similar: 1 };
      const typeA = typeOrder[a.matchType] ?? 2;
      const typeB = typeOrder[b.matchType] ?? 2;
      if (typeA !== typeB) return typeA - typeB;
      // Binnen exact: CJ eerst (echte inkoopprijzen)
      if (a.isDropshipPrice && !b.isDropshipPrice) return -1;
      if (!a.isDropshipPrice && b.isDropshipPrice) return 1;
      // Dan op prijs
      const priceA = a.price > 0 ? a.price : Infinity;
      const priceB = b.price > 0 ? b.price : Infinity;
      return priceA - priceB;
    });

    // Filter: als we een verkoopprijs kennen, markeer te dure resultaten
    if (sellPrice > 0) {
      for (const r of allResults) {
        if (r.price > 0 && r.price >= sellPrice) {
          r.tooExpensive = true;
        }
      }
    }

    // === BETROUWBAARHEIDS-FILTERS ===
    // 1. Prijs-sanity check: filter "te-mooi-om-waar-te-zijn" prijzen
    //    Als prijs < 5% van verkoopprijs → waarschijnlijk een onderdeel/accessoire, geen volledig product
    // 2. Markeer top fabrikanten (hoge sales = betrouwbaar)
    // 3. Markeer scammer-risico (lage sales = onbetrouwbaar)
    const filteredResults = allResults.filter((r) => {
      // CJ resultaten altijd toelaten (al gevalideerd door CJ)
      if (r.isDropshipPrice) return true;
      // Geen prijs of geen verkoopprijs context → laat door
      if (!r.price || !sellPrice) return true;
      // Prijs minder dan 5% van verkoopprijs = verdacht (waarschijnlijk losse onderdeel)
      const priceRatio = r.price / sellPrice;
      if (priceRatio < 0.05) {
        return false;
      }
      return true;
    });

    // Voeg betrouwbaarheidsindicators toe
    for (const r of filteredResults) {
      const sales = r.sales || 0;
      if (sales >= 5000) {
        r.trustLevel = "top";        // Top fabrikant
        r.trustLabel = "Top fabrikant";
      } else if (sales >= 500) {
        r.trustLevel = "verified";   // Betrouwbaar
        r.trustLabel = "Betrouwbaar";
      } else if (sales > 0 && sales < 100 && !r.isDropshipPrice) {
        r.trustLevel = "low";        // Lage verkopen = risico
        r.trustLabel = "Weinig verkocht";
      }
      // Verdacht goedkoop (5-15% van verkoopprijs) → waarschuwing
      if (sellPrice > 0 && r.price > 0 && !r.isDropshipPrice) {
        const ratio = r.price / sellPrice;
        if (ratio < 0.15) {
          r.priceWarning = true;
        }
      }
    }

    // Vervang allResults met gefilterde versie
    allResults.length = 0;
    allResults.push(...filteredResults);

    // Genereer directe zoeklinks naar andere platforms
    const searchTerms = translateToSearchTerms(name || "");
    const searchQuery = searchTerms.join(" ");
    const encodedQuery = encodeURIComponent(searchQuery);
    const platformLinks = [
      {
        name: "1688.com",
        url: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(searchTerms.join("+"))}`,
        description: "Fabrieksprijzen — 40-70% goedkoper (bulk)",
        source: "1688",
      },
      {
        name: "Temu",
        url: `https://www.temu.com/search_result.html?search_key=${encodedQuery}`,
        description: "Soms goedkoper dan AliExpress, snelle EU verzending",
        source: "Temu",
      },
      {
        name: "Alibaba",
        url: `https://www.alibaba.com/trade/search?SearchText=${encodedQuery}`,
        description: "Groothandel — beste prijs bij 50+ stuks",
        source: "Alibaba",
      },
    ];

    const response = {
      success: true,
      count: allResults.length,
      brand: brand,
      isBrandProduct: !!brand,
      cjLowestPrice: cjData?.lowestPrice || null,
      data: allResults,
      platformLinks,
      searchTermsUsed: searchQuery,
    };
    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/find-exact?name=...&price=...
router.get("/find-exact", async (req, res) => {
  const { name, price } = req.query;
  if (!name) {
    return res.status(400).json({ success: false, error: "name is verplicht" });
  }

  const cacheKey = `exact:${name.toLowerCase().substring(0, 50)}`;
  const cached = getCached(cacheKey);
  if (cached && cached.length > 0) {
    return res.json({ success: true, data: cached, cached: true });
  }

  try {
    const results = await searchBrandProduct(name, parseFloat(price) || 0);
    setCache(cacheKey, results);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
