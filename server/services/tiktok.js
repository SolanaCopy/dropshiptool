const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const TIKTOK_HOST = "tiktok-scraper7.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": TIKTOK_HOST,
};

/**
 * Haal trending TikTok videos op
 */
async function getTikTokTrending() {
  try {
    // Meerdere regio's parallel ophalen voor meer content
    const regions = ["US", "GB", "DE", "NL"];
    const results = await Promise.all(
      regions.map((region) =>
        axios.get(`https://${TIKTOK_HOST}/feed/list`, {
          params: { region, count: 10 },
          headers,
          timeout: 15000,
        }).then((r) => r.data?.data || []).catch(() => [])
      )
    );

    // Combineer en verwijder duplicaten
    const seen = new Set();
    const all = [];
    for (const videos of results) {
      for (const item of videos) {
        const id = item.aweme_id || item.video_id;
        if (id && !seen.has(id)) {
          seen.add(id);
          all.push({
            id,
            desc: item.title || "",
            author: item.author?.nickname || item.author?.unique_id || "",
            authorAvatar: item.author?.avatar || "",
            likes: item.digg_count || 0,
            views: item.play_count || 0,
            shares: item.share_count || 0,
            comments: item.comment_count || 0,
            cover: item.cover || item.origin_cover || "",
            music: item.music_info?.title || "",
            hashtags: (item.content_desc || []).filter((t) => t.startsWith("#")).map((t) => t.replace("#", "")),
          });
        }
      }
    }

    // Sorteer op views
    all.sort((a, b) => b.views - a.views);
    return all;
  } catch (error) {
    console.error("TikTok trending error:", error.message);
    return [];
  }
}

/**
 * Zoek TikTok videos op keyword
 */
async function searchTikTok(keyword) {
  try {
    const { data } = await axios.get(`https://${TIKTOK_HOST}/feed/search`, {
      params: { keywords: keyword, count: 20, region: "US" },
      headers,
      timeout: 15000,
    });

    if (data.code !== 0 || !data.data) return [];

    return data.data.slice(0, 20).map((item) => ({
      id: item.aweme_id || item.video_id,
      desc: item.title || "",
      author: item.author?.nickname || "",
      likes: item.digg_count || 0,
      views: item.play_count || 0,
      shares: item.share_count || 0,
      cover: item.cover || "",
      hashtags: (item.content_desc || []).filter((t) => t.startsWith("#")).map((t) => t.replace("#", "")),
    }));
  } catch (error) {
    console.error("TikTok search error:", error.message);
    return [];
  }
}

module.exports = { getTikTokTrending, searchTikTok };
