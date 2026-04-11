const googleTrends = require("google-trends-api");

// === Cache systeem ===
const cache = new Map();
const CACHE_TTL = {
  trending: 4 * 60 * 60 * 1000,   // 4 uur voor trending searches
  interest: 2 * 60 * 60 * 1000,   // 2 uur voor interest over time
  related: 4 * 60 * 60 * 1000,    // 4 uur voor related topics
};

function getCached(key, type) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < (CACHE_TTL[type] || 3600000)) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key, data) {
  // Max 200 entries
  if (cache.size >= 200) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, time: Date.now() });
}

// === Retry met delay ===
async function withRetry(fn, retries = 2, delay = 3000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Google Trends retry ${i + 1}/${retries} na ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 1.5; // exponential backoff
    }
  }
}

// === Rate limiter — max 1 request per 2 seconden ===
let lastRequest = 0;
async function rateLimited(fn) {
  const now = Date.now();
  const wait = Math.max(0, lastRequest + 2000 - now);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  return fn();
}

// === API functies ===

async function getTrendingSearches(geo = "NL") {
  const cacheKey = `trending:${geo}`;
  const cached = getCached(cacheKey, "trending");
  if (cached) {
    console.log(`Google Trends trending ${geo}: cache hit`);
    return cached;
  }

  try {
    const results = await withRetry(() =>
      rateLimited(() => googleTrends.dailyTrends({ geo }))
    );
    const parsed = JSON.parse(results);
    const days = parsed.default.trendingSearchesDays;

    const trends = [];
    for (const day of days.slice(0, 3)) {
      for (const search of day.trendingSearches) {
        trends.push({
          title: search.title.query,
          traffic: search.formattedTraffic,
          relatedQueries: search.relatedQueries?.map((q) => q.query) || [],
          image: search.image?.imageUrl || null,
        });
      }
    }

    setCache(cacheKey, trends);
    console.log(`Google Trends trending ${geo}: ${trends.length} resultaten (fresh)`);
    return trends;
  } catch (error) {
    console.error(`Google Trends trending ${geo} error:`, error.message);
    return [];
  }
}

async function getInterestOverTime(keyword, geo = "NL") {
  const cacheKey = `interest:${keyword.toLowerCase()}:${geo}`;
  const cached = getCached(cacheKey, "interest");
  if (cached) return cached;

  try {
    const results = await withRetry(() =>
      rateLimited(() => googleTrends.interestOverTime({
        keyword,
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        geo,
      }))
    );
    const parsed = JSON.parse(results);
    const timeline = parsed.default.timelineData;

    const data = timeline.map((point) => ({
      date: point.formattedTime,
      value: point.value[0],
    }));

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Interest over time error:", error.message);
    return [];
  }
}

async function getRelatedTopics(keyword, geo = "NL") {
  const cacheKey = `related:${keyword.toLowerCase()}:${geo}`;
  const cached = getCached(cacheKey, "related");
  if (cached) return cached;

  try {
    const results = await withRetry(() =>
      rateLimited(() => googleTrends.relatedTopics({ keyword, geo }))
    );
    const parsed = JSON.parse(results);
    const rising = parsed.default.rankedList?.[1]?.rankedKeyword || [];

    const data = rising.slice(0, 10).map((item) => ({
      topic: item.topic.title,
      type: item.topic.type,
      value: item.formattedValue,
    }));

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Related topics error:", error.message);
    return [];
  }
}

async function getTrendingProductKeywords() {
  const cacheKey = "productKeywords";
  const cached = getCached(cacheKey, "trending");
  if (cached) return cached;

  const productCategories = [
    "gadgets", "phone accessories", "home decor", "fitness equipment",
    "led lights", "car accessories", "pet toys", "kitchen tools",
    "beauty tools", "outdoor gear", "desk accessories", "travel accessories",
  ];

  const keywords = new Set();

  for (const geo of ["NL", "US"]) {
    try {
      const trends = await getTrendingSearches(geo);
      for (const t of trends.slice(0, 10)) {
        keywords.add(t.title);
      }
    } catch (e) {}
  }

  const shuffled = productCategories.sort(() => 0.5 - Math.random()).slice(0, 3);
  for (const cat of shuffled) {
    try {
      const related = await getRelatedTopics(cat);
      for (const r of related.slice(0, 5)) {
        keywords.add(r.topic);
      }
    } catch (e) {}
  }

  const result = Array.from(keywords);
  if (result.length > 0) setCache(cacheKey, result);
  return result;
}

module.exports = { getTrendingSearches, getInterestOverTime, getRelatedTopics, getTrendingProductKeywords };
