const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

/**
 * Zoek het exacte merkproduct op andere Amazon regio's voor de laagste prijs
 */
async function searchBrandProduct(productName, currentPrice, excludeCountry = "NL") {
  const countries = ["US", "UK", "DE", "FR", "ES", "IT"];
  const results = [];

  // Zoek op meerdere Amazon regio's tegelijk
  const searches = countries.map(async (country) => {
    try {
      const { data } = await axios.get(
        "https://real-time-amazon-data.p.rapidapi.com/search",
        {
          params: { query: productName.substring(0, 100), page: 1, country },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
          },
          timeout: 15000,
        }
      );

      if (data.status !== "OK" || !data.data?.products) return;

      // Neem alleen de eerste 3 meest relevante
      for (const p of data.data.products.slice(0, 3)) {
        const priceText = p.product_price || "";
        const priceMatch = priceText.match(/[\d,.]+/);
        let price = 0;
        if (priceMatch) {
          const cleaned = priceMatch[0].replace(",", ".");
          price = parseFloat(cleaned) || 0;
        }

        // Converteer naar EUR (ruwe schattingen)
        const rates = { US: 0.92, UK: 1.16, DE: 1, FR: 1, ES: 1, IT: 1, NL: 1 };
        const priceEur = Math.round(price * (rates[country] || 1) * 100) / 100;

        if (price > 0) {
          results.push({
            id: p.asin,
            name: p.product_title,
            price: priceEur,
            originalPrice: priceText,
            image: p.product_photo || "",
            rating: parseFloat(p.product_star_rating || 0),
            reviews: p.product_num_ratings || 0,
            link: p.product_url,
            source: `Amazon ${country}`,
            country,
            isBestSeller: p.is_best_seller || false,
          });
        }
      }
    } catch (e) {
      // Skip failed regions
    }
  });

  await Promise.all(searches);

  // Sorteer op prijs (laagste eerst)
  results.sort((a, b) => a.price - b.price);

  return results;
}

module.exports = { searchBrandProduct };
