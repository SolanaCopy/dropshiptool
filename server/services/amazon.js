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
 * Probeert eerst Amazon, valt terug op AliExpress (die heeft aparte quota + echte orders data).
 */
async function getAmazonBestsellers(country = "NL") {
  const queryMap = {
    "Elektronica": ["phone accessories", "wireless charger", "bluetooth speaker", "usb hub", "webcam"],
    "Verlichting": ["led strip lights", "smart home gadget", "night light kids"],
    "Huis & Keuken": ["kitchen gadget", "storage organizer", "bathroom accessories", "humidifier"],
    "Tuin": ["garden light", "garden tools"],
    "Sport & Fitness": ["fitness gear", "yoga mat", "resistance bands", "sport bottle"],
    "Mode": ["sunglasses", "watch band", "backpack"],
    "Telefoon": ["phone case", "phone stand"],
    "Auto": ["car accessories", "car phone holder"],
    "Kinderen": ["educational toy", "kids night light"],
    "Huisdieren": ["pet toy", "dog accessories"],
  };

  const queries = [];
  const categoryForQuery = {};
  for (const [cat, terms] of Object.entries(queryMap)) {
    for (const term of terms) {
      queries.push(term);
      categoryForQuery[term] = cat;
    }
  }

  // Primair: AliExpress (gratis quota nog beschikbaar + echte orders data)
  const { searchProducts: searchAli } = require("./aliexpress");

  const results = [];
  for (let i = 0; i < queries.length; i += 3) {
    const batch = queries.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map((q) =>
        searchAli(q, 1, "salesDesc")
          .then((products) =>
            products.map((p) => ({ ...p, category: categoryForQuery[q] || "" }))
          )
          .catch(() => [])
      )
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

  // Als AliExpress ook niks geeft, valt het systeem terug op lege array
  // (frontend laat geen producten zien ipv lege cards met 0 data)
  console.log(`Trending: ${all.length} producten via AliExpress`);
  return all;
}

module.exports = { searchAmazon, getAmazonBestsellers };
