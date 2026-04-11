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
 * Gebruikt AliExpress (heeft echte orders data + aparte quota).
 * Per query meerdere pagina's om meer variatie te krijgen.
 */
async function getAmazonBestsellers(country = "NL") {
  const queryMap = {
    "Elektronica": ["phone accessories", "wireless charger", "bluetooth speaker", "usb gadgets", "smartwatch band"],
    "Verlichting": ["led strip lights", "smart bulb", "night light"],
    "Huis & Keuken": ["kitchen gadget", "storage organizer", "bathroom organizer", "humidifier", "coffee accessories"],
    "Tuin": ["garden decor", "solar light outdoor"],
    "Sport & Fitness": ["fitness gear", "yoga accessories", "resistance bands", "sport bottle"],
    "Mode": ["sunglasses", "watch strap", "backpack", "fashion jewelry"],
    "Telefoon": ["phone case", "phone holder"],
    "Auto": ["car accessories", "car phone mount", "car organizer"],
    "Kinderen": ["baby toy", "kids learning toy"],
    "Beauty": ["hair accessories", "makeup tool", "skin care tool"],
    "Huisdieren": ["pet toy", "dog accessories", "cat toy"],
  };

  const queries = [];
  const categoryForQuery = {};
  for (const [cat, terms] of Object.entries(queryMap)) {
    for (const term of terms) {
      queries.push(term);
      categoryForQuery[term] = cat;
    }
  }

  const { searchProducts: searchAli } = require("./aliexpress");

  // Per query fetchen we pagina 1 EN 2 voor meer variatie (2x meer producten)
  const results = [];
  for (let i = 0; i < queries.length; i += 3) {
    const batch = queries.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.flatMap((q) => [
        searchAli(q, 1, "salesDesc")
          .then((products) =>
            products.map((p) => ({ ...p, category: categoryForQuery[q] || "" }))
          )
          .catch(() => []),
        searchAli(q, 2, "salesDesc")
          .then((products) =>
            products.map((p) => ({ ...p, category: categoryForQuery[q] || "" }))
          )
          .catch(() => []),
      ])
    );
    results.push(...batchResults);
  }

  // Combineer en verwijder duplicaten
  const seen = new Set();
  const all = [];
  for (const products of results) {
    for (const p of products) {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        all.push(p);
      }
    }
  }

  console.log(`Trending: ${all.length} producten via AliExpress (${queries.length} queries x 2 pages)`);
  return all;
}

module.exports = { searchAmazon, getAmazonBestsellers };
