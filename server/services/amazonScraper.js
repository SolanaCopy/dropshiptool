const axios = require("axios");
const cheerio = require("cheerio");

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parseNLPrice(text) {
  if (!text) return 0;
  const cleaned = text.replace(/[€$£\s]/g, "");
  if (cleaned.includes(",") && cleaned.indexOf(",") > cleaned.lastIndexOf(".")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(cleaned.replace(",", "")) || 0;
}

function parseSales(text) {
  if (!text) return 0;
  const match = text.match(/([\d.,]+)/);
  if (!match) return 0;
  let num = parseFloat(match[1].replace(/\./g, "").replace(",", ".")) || 0;
  if (text.toLowerCase().includes("k")) num *= 1000;
  return Math.round(num);
}

/**
 * Scrape Amazon.nl zoekresultaten direct (geen API nodig)
 */
async function scrapeAmazonNL(query, page = 1) {
  const url = `https://www.amazon.nl/s?k=${encodeURIComponent(query)}&page=${page}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": randomUA(),
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const products = [];

    $("[data-asin]").each((i, el) => {
      const $el = $(el);
      const asin = $el.attr("data-asin");
      if (!asin || asin.length < 5) return;

      const name = $el.find("h2 a span, h2 span, .a-text-normal").first().text().trim();
      if (!name || name.length < 5) return;

      const priceWhole = $el.find(".a-price .a-price-whole").first().text().trim();
      const priceFraction = $el.find(".a-price .a-price-fraction").first().text().trim();
      const price = priceWhole ? parseFloat(`${priceWhole.replace(/[.,]/g, "")}.${priceFraction || "00"}`) : 0;

      const image = $el.find("img.s-image").first().attr("src") || "";
      const ratingText = $el.find(".a-icon-alt").first().text().trim();
      const ratingMatch = ratingText.match(/([\d,]+)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(",", ".")) : 0;

      const reviewsText = $el.find("[aria-label*='sterren'] + span, .a-size-base.s-underline-text").first().text().trim();
      const reviewsMatch = reviewsText.match(/([\d.,]+)/);
      const reviews = reviewsMatch ? parseInt(reviewsMatch[1].replace(/[.,]/g, "")) : 0;

      const salesText = $el.find(".a-row.a-size-base span:contains('gekocht'), .a-row.a-size-base span:contains('bought')").first().text().trim();
      const sales = parseSales(salesText);

      const link = $el.find("h2 a, a.a-link-normal").first().attr("href") || "";
      const fullLink = link.startsWith("http") ? link : `https://www.amazon.nl${link}`;

      if (price > 0) {
        products.push({
          id: asin,
          name,
          price: 0,
          sellPrice: price,
          image,
          orders: sales,
          rating,
          reviews,
          category: "",
          link: fullLink,
          source: "Amazon",
          badge: "",
          isBestSeller: false,
          isPrime: false,
          delivery: "",
        });
      }
    });

    return products;
  } catch (error) {
    console.error("Amazon scrape error:", error.message);
    return [];
  }
}

module.exports = { scrapeAmazonNL };
