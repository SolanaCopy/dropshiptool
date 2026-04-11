const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "aliexpress-datahub.p.rapidapi.com";

/**
 * Bereken hoe goed twee productnamen matchen (0-100)
 * Kijkt naar gedeelde woorden EN volgorde
 */
function calculateNameMatch(amazonName, aliName) {
  const normalize = (str) =>
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const amazonWords = normalize(amazonName);
  const aliWords = normalize(aliName);

  if (amazonWords.length === 0 || aliWords.length === 0) return 0;

  let exactMatches = 0;
  let fuzzyMatches = 0;

  for (const word of amazonWords) {
    if (aliWords.some((w) => w === word)) {
      exactMatches++;
    } else if (aliWords.some((w) =>
      (w.length >= 4 && word.length >= 4 && w.substring(0, 4) === word.substring(0, 4)) ||
      w.includes(word) || word.includes(w)
    )) {
      fuzzyMatches++;
    }
  }

  // Exacte matches tellen zwaarder dan fuzzy
  const score = ((exactMatches * 1.0 + fuzzyMatches * 0.5) / amazonWords.length) * 100;
  return Math.round(Math.min(score, 100));
}

/**
 * Bepaal of een resultaat waarschijnlijk het EXACTE product is
 */
function classifyMatch(result) {
  // Exacte match: hoge image positie (top 3) + goede naam match (40%+)
  if (result.positionScore >= 85 && result.nameMatch >= 40) return "exact";
  // Of: lagere positie maar zeer goede naam match
  if (result.nameMatch >= 60) return "exact";
  // Hoge image match maar naam verschilt = waarschijnlijk hetzelfde
  if (result.positionScore >= 90 && result.nameMatch >= 20) return "exact";
  // Vergelijkbaar product
  if (result.positionScore >= 50 || result.nameMatch >= 30) return "similar";
  // Lage match = skip
  return "low";
}

/**
 * Zoek het exacte product op AliExpress via afbeelding + naam matching
 */
async function searchByImage(imageUrl, productName = "") {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_search_image`,
      {
        params: { imgUrl: imageUrl },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
        timeout: 15000,
      }
    );

    if (!data.result?.resultList) return [];

    const results = data.result.resultList.map((entry, index) => {
      const item = entry.item || entry;
      const price = item.sku?.def?.promotionPrice || item.sku?.def?.price || 0;
      const name = item.title || "";

      const nameMatch = productName ? calculateNameMatch(productName, name) : 0;
      const positionScore = Math.max(0, 100 - index * 5);

      // Gewicht: image match zwaarder (70%) want visueel = betrouwbaarder
      const totalMatch = Math.round(positionScore * 0.7 + nameMatch * 0.3);

      const result = {
        id: item.itemId,
        name,
        price: parseFloat(price) || 0,
        image: item.image ? `https:${item.image}` : "",
        sales: item.sales || 0,
        rating: parseFloat(item.averageStarRate || 0),
        link: `https://www.aliexpress.com/item/${item.itemId}.html`,
        source: "AliExpress",
        matchScore: totalMatch,
        nameMatch,
        positionScore,
      };

      result.matchType = classifyMatch(result);
      return result;
    });

    // Filter: alleen exact en similar, geen lage matches
    const filtered = results.filter((r) => r.matchType !== "low");

    // Sorteer: exacte matches eerst, dan similar, binnen elk op matchScore
    filtered.sort((a, b) => {
      if (a.matchType === "exact" && b.matchType !== "exact") return -1;
      if (a.matchType !== "exact" && b.matchType === "exact") return 1;
      return b.matchScore - a.matchScore;
    });

    return filtered.slice(0, 10);
  } catch (error) {
    console.error("Image search error:", error.response?.data?.message || error.message);
    return [];
  }
}

/**
 * Fallback: zoek op AliExpress via tekst als image search weinig exacte matches vindt
 */
async function searchByText(productName) {
  try {
    const query = productName
      .split(",")[0]
      .split(" – ")[0]
      .split(" - ")[0]
      .substring(0, 80);

    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_search`,
      {
        params: {
          q: query,
          page: 1,
          sort: "salesDesc", // Best verkocht = waarschijnlijkste match
          locale: "nl_NL",
          currency: "EUR",
        },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
        timeout: 15000,
      }
    );

    if (!data.result?.resultList) return [];

    return data.result.resultList.slice(0, 8).map((entry) => {
      const item = entry.item || entry;
      const price = parseFloat(item.sku?.def?.promotionPrice || item.sku?.def?.price || 0);
      const name = item.title || "";
      const nameMatch = calculateNameMatch(productName, name);

      return {
        id: item.itemId,
        name,
        price,
        image: item.image ? `https:${item.image}` : "",
        sales: parseInt(String(item.trade?.tradeDesc || item.orders || "0").replace(/[^\d]/g, "")) || 0,
        rating: parseFloat(item.averageStarRate || item.averageStar || 0),
        link: `https://www.aliexpress.com/item/${item.itemId}.html`,
        source: "AliExpress",
        matchScore: nameMatch,
        nameMatch,
        positionScore: 0,
        matchType: nameMatch >= 50 ? "exact" : nameMatch >= 30 ? "similar" : "low",
      };
    }).filter((r) => r.matchType !== "low"); // Alleen relevante resultaten
  } catch (error) {
    console.error("Text search error:", error.message);
    return [];
  }
}

/**
 * Haal alleen de laagste prijs op voor een product
 */
async function getLowestPrice(imageUrl) {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_search_image`,
      {
        params: { imgUrl: imageUrl },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
        timeout: 10000,
      }
    );

    if (!data.result?.resultList || data.result.resultList.length === 0) return null;

    let lowest = Infinity;
    for (const entry of data.result.resultList.slice(0, 5)) {
      const item = entry.item || entry;
      const price = parseFloat(item.sku?.def?.promotionPrice || item.sku?.def?.price || 0);
      if (price > 0 && price < lowest) lowest = price;
    }

    return lowest < Infinity ? lowest : null;
  } catch (error) {
    return null;
  }
}

module.exports = { searchByImage, searchByText, getLowestPrice, calculateNameMatch };
