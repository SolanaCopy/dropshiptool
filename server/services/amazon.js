const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

function parseSalesVolume(text) {
  if (!text) return 0;
  const match = text.match(/([\d.,]+)/);
  if (!match) return 0;
  let numStr = match[1].replace(/\./g, "").replace(",", ".");
  let num = parseFloat(numStr) || 0;
  if (text.toLowerCase().includes("k")) num *= 1000;
  return Math.round(num);
}

function parsePrice(text) {
  if (!text) return 0;
  const cleaned = String(text).replace(/[€$£\s]/g, "");
  // NL formaat: 1.234,56 — US formaat: 1,234.56
  if (cleaned.includes(",") && cleaned.indexOf(",") > cleaned.lastIndexOf(".")) {
    // NL: punt als duizendtalteken, komma als decimaal
    return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }
  // US formaat
  return parseFloat(cleaned.replace(",", "")) || 0;
}

const { scrapeAmazonNL } = require("./amazonScraper");

/**
 * Zoek producten op Amazon — probeert API eerst, dan scraper als fallback
 */
async function searchAmazon(query, page = 1, country = "NL") {
  // Probeer API eerst
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/search`,
      {
        params: { query, page, country },
        headers,
        timeout: 15000,
      }
    );

    if (data.status === "OK" && data.data?.products?.length > 0) {
      return data.data.products.map((p) => {
        const sellPrice = parsePrice(p.product_price);
        return {
          id: p.asin,
          name: p.product_title,
          price: 0,
          sellPrice,
          image: p.product_photo || "",
          orders: parseSalesVolume(p.sales_volume),
          rating: parseFloat(p.product_star_rating || 0),
          reviews: p.product_num_ratings || 0,
          category: "",
          link: p.product_url,
          source: "Amazon",
          badge: p.product_badge || "",
          isBestSeller: p.is_best_seller || false,
          isPrime: p.is_prime || false,
          delivery: p.delivery || "",
        };
      });
    }
  } catch (error) {
    console.log("Amazon API fallback:", error.response?.data?.message || error.message);
  }

  // Fallback: scrape Amazon.nl direct
  try {
    console.log("Scraping Amazon.nl voor:", query);
    return await scrapeAmazonNL(query, page);
  } catch (e) {
    console.error("Scraper ook gefaald:", e.message);
  }

  return [];
}

/**
 * Haal populaire producten op uit meerdere categorieën.
 * Primair: CJ Dropshipping (eigen API, onbeperkt).
 * Fallback: AliExpress (RapidAPI).
 */
async function getAmazonBestsellers(country = "NL") {
  const queryMap = {
    "Elektronica": ["phone charger", "bluetooth speaker", "wireless earbuds", "led strip"],
    "Huis & Keuken": ["kitchen gadget", "storage box", "bathroom accessories"],
    "Sport & Fitness": ["fitness equipment", "yoga mat", "sport bottle"],
    "Mode": ["sunglasses", "watch", "backpack"],
    "Telefoon": ["phone case", "phone holder"],
    "Auto": ["car accessories", "car phone holder"],
    "Kinderen": ["kids toy", "baby product"],
    "Beauty": ["hair accessories", "makeup brush"],
    "Huisdieren": ["pet toy", "dog bowl"],
    "Verlichting": ["led light", "smart bulb"],
  };

  const queries = [];
  const categoryForQuery = {};
  for (const [cat, terms] of Object.entries(queryMap)) {
    for (const term of terms) {
      queries.push(term);
      categoryForQuery[term] = cat;
    }
  }

  // Primair: CJ Dropshipping (eigen API, geen quota)
  const { searchCJ } = require("./cjdropshipping");

  // Per query 2 pagina's × 50 producten = 100 max per query
  const fetchQuery = async (q) => {
    const pages = await Promise.all([
      searchCJ(q, 1, 50).catch((e) => { console.error(`CJ "${q}" p1:`, e.message); return []; }),
      searchCJ(q, 2, 50).catch((e) => { console.error(`CJ "${q}" p2:`, e.message); return []; }),
    ]);
    return pages.flat().map((p) => {
      const costPrice = parseFloat(p.price) || 0;
      // Dropship markup: 2.5x is gemiddelde gezonde marge (60% winst)
      // Bij lage inkoopprijs (<€5) hogere markup (3x), bij hoge (>€30) lagere (2x)
      let markup = 2.5;
      if (costPrice < 5) markup = 3;
      else if (costPrice > 30) markup = 2;
      const suggestedSell = Math.round(costPrice * markup * 100) / 100;
      return {
        ...p,
        sellPrice: suggestedSell, // geadviseerde verkoopprijs
        price: costPrice, // echte inkoopprijs (CJ wholesale)
        category: categoryForQuery[q] || "",
        orders: 0,
        rating: 0,
        reviews: 0,
      };
    });
  };

  // Parallel met batches van 4 om CJ niet te flooden
  const results = [];
  for (let i = 0; i < queries.length; i += 4) {
    const batch = queries.slice(i, i + 4);
    const batchResults = await Promise.all(batch.map(fetchQuery));
    results.push(...batchResults);
  }

  // Combineer, dedup en filter junk
  const seen = new Set();
  const all = [];
  for (const products of results) {
    for (const p of products) {
      if (!p.id || seen.has(p.id)) continue;
      if (!p.sellPrice || p.sellPrice <= 0) continue;
      // Filter junk: geen extreem dure of te goedkope items
      if (p.price < 1 || p.price > 80) continue;
      // Naam moet redelijk zijn
      if (!p.name || p.name.length < 10 || p.name.length > 150) continue;
      // Geen industriële/technische termen
      const nameL = p.name.toLowerCase();
      const junkWords = ["adapter for", "transformer", "voltage regulator", "industrial", "wholesale lot", "bulk"];
      if (junkWords.some((w) => nameL.includes(w))) continue;
      // Moet afbeelding hebben
      if (!p.image || p.image.length < 10) continue;

      seen.add(p.id);
      all.push(p);
    }
  }

  console.log(`Trending: ${all.length} producten via CJ Dropshipping (na filter)`);
  return all;
}

module.exports = { searchAmazon, getAmazonBestsellers };
