const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

/**
 * Haal Amazon Movers & Shakers / Best Sellers op
 * Dit zijn producten die snel stijgen in populariteit
 */
async function getAmazonBestsellers(category = "") {
  const products = [];
  const url = category
    ? `https://www.amazon.com/gp/bestsellers/${category}`
    : "https://www.amazon.com/gp/movers-and-shakers";

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    $("[data-asin]").each((i, el) => {
      if (i >= 20) return false;

      const $el = $(el);
      const asin = $el.attr("data-asin");
      if (!asin) return;

      const name =
        $el.find(".p13n-sc-truncate, [class*='title'], .a-link-normal span").first().text().trim() || "";

      const priceText = $el.find(".p13n-sc-price, [class*='price'] span").first().text().trim();
      const priceMatch = priceText.match(/[\d,.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(",", "")) : 0;

      const image = $el.find("img").first().attr("src") || "";

      const ratingText = $el.find("[class*='rating'], .a-icon-alt").first().text().trim();
      const ratingMatch = ratingText.match(/([\d.]+)\s*out/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

      const rankText = $el.find("[class*='rank'], .zg-badge-text").first().text().trim();
      const rankMatch = rankText.match(/#?(\d+)/);
      const rank = rankMatch ? parseInt(rankMatch[1]) : i + 1;

      if (name && name.length > 3) {
        products.push({
          name: name.substring(0, 120),
          price: Math.round((price / 3) * 100) / 100, // geschatte inkoopprijs
          sellPrice: price,
          image,
          rank,
          rating,
          orders: 0,
          link: `https://www.amazon.com/dp/${asin}`,
          source: "Amazon",
        });
      }
    });
  } catch (error) {
    console.error("Amazon scrape error:", error.message);
  }

  return products;
}

module.exports = { getAmazonBestsellers };
