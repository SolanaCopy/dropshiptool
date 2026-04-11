const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "aliexpress-datahub.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
  "Content-Type": "application/json",
};

/**
 * Zoek producten op AliExpress via RapidAPI
 */
async function searchProducts(query, page = 1, sort = "default") {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_search`,
      {
        params: {
          q: query,
          page,
          sort,
          locale: "nl_NL",
          currency: "EUR",
        },
        headers,
        timeout: 15000,
      }
    );

    if (!data.result || !data.result.resultList) {
      console.error("AliExpress API: geen resultaten", data.message || "");
      return [];
    }

    return data.result.resultList.map((item) => {
      const product = item.item || item;
      const sellPrice = parseFloat(product.sku?.def?.price || product.price || 0);
      const cost = Math.round(sellPrice * (0.3 + Math.random() * 0.15) * 100) / 100;

      return {
        id: product.itemId || product.productId,
        name: product.title,
        price: cost,
        sellPrice,
        image: product.image ? `https:${product.image}` : "",
        orders: parseInt(String(product.trade?.tradeDesc || product.orders || "0").replace(/[^\d]/g, "")) || 0,
        rating: parseFloat(product.averageStar || product.starRating || 0),
        category: product.categoryId || "",
        link: `https://www.aliexpress.com/item/${product.itemId}.html`,
        source: "AliExpress",
        shipping: product.logisticsDesc || "",
      };
    });
  } catch (error) {
    console.error("AliExpress search error:", error.response?.data?.message || error.message);
    return [];
  }
}

/**
 * Haal product details op
 */
async function getProductDetail(itemId) {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_detail`,
      {
        params: {
          itemId,
          currency: "EUR",
          locale: "nl_NL",
        },
        headers,
        timeout: 15000,
      }
    );

    return data.result || null;
  } catch (error) {
    console.error("Product detail error:", error.message);
    return null;
  }
}

/**
 * Haal bestsellers/hot products op
 */
async function getHotProducts(catId = "0") {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/item_search`,
      {
        params: {
          q: "best seller",
          sort: "salesDesc",
          page: 1,
          currency: "EUR",
          locale: "nl_NL",
        },
        headers,
        timeout: 15000,
      }
    );

    if (!data.result || !data.result.resultList) return [];

    return data.result.resultList.map((item) => {
      const product = item.item || item;
      const sellPrice = parseFloat(product.sku?.def?.price || product.price || 0);
      const cost = Math.round(sellPrice * (0.3 + Math.random() * 0.15) * 100) / 100;

      return {
        id: product.itemId || product.productId,
        name: product.title,
        price: cost,
        sellPrice,
        image: product.image ? `https:${product.image}` : "",
        orders: parseInt(String(product.trade?.tradeDesc || product.orders || "0").replace(/[^\d]/g, "")) || 0,
        rating: parseFloat(product.averageStar || product.starRating || 0),
        category: product.categoryId || "",
        link: `https://www.aliexpress.com/item/${product.itemId}.html`,
        source: "AliExpress",
        shipping: product.logisticsDesc || "",
      };
    });
  } catch (error) {
    console.error("Hot products error:", error.message);
    return [];
  }
}

module.exports = { searchProducts, getProductDetail, getHotProducts };
