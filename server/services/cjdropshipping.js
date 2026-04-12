const axios = require("axios");

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const CJ_API_KEY = process.env.CJ_API_KEY;

let accessToken = null;
let tokenExpiry = null;

async function getToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const { data } = await axios.post(`${CJ_BASE}/authentication/getAccessToken`, {
    apiKey: CJ_API_KEY,
  });

  if (data.code === 200 && data.data?.accessToken) {
    accessToken = data.data.accessToken;
    tokenExpiry = new Date(data.data.accessTokenExpiryDate).getTime();
    console.log("CJ token opgehaald, geldig tot:", data.data.accessTokenExpiryDate);
    return accessToken;
  }

  throw new Error("CJ token ophalen mislukt: " + data.message);
}

async function searchCJ(keyword, page = 1, pageSize = 50) {
  const token = await getToken();

  const { data } = await axios.get(`${CJ_BASE}/product/list`, {
    params: {
      productNameEn: keyword,
      pageNum: page,
      pageSize,
    },
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  console.log(`CJ zoek "${keyword}": ${data.data?.total || 0} resultaten`);

  if (data.code !== 200 || !data.data?.list) return [];

  return data.data.list.map((p) => ({
    id: p.pid,
    name: p.productNameEn || p.productName || "",
    price: parseFloat(p.sellPrice || 0),
    image: p.productImage || "",
    link: `https://cjdropshipping.com/product/p-${p.pid}.html`,
    source: "CJDropshipping",
    category: p.categoryName || "",
  }));
}

// Uitgebreide NL→EN vertaalwoordenlijst
const nlToEn = {
  // Elektronica
  "draadloze": "wireless", "draadloos": "wireless", "oplader": "charger",
  "telefoon": "phone", "hoesje": "case", "houder": "holder", "standaard": "stand",
  "oordopjes": "earbuds", "koptelefoon": "headphones", "luidspreker": "speaker",
  "toetsenbord": "keyboard", "muis": "mouse", "kabel": "cable", "snoer": "cord",
  "stekker": "plug", "adapter": "adapter", "verlichting": "light", "lamp": "lamp",
  "scherm": "screen", "beschermer": "protector", "beschermhoes": "cover",
  "powerbank": "power bank", "opladen": "charging", "bluetooth": "bluetooth",
  "camera": "camera", "webcam": "webcam", "microfoon": "microphone",
  "afstandsbediening": "remote control", "timer": "timer", "sensor": "sensor",
  "schakelaar": "switch", "dimmer": "dimmer", "stopcontact": "socket",

  // Mode & accessoires
  "horloge": "watch", "band": "band", "armband": "bracelet", "ketting": "necklace",
  "ring": "ring", "oorbellen": "earrings", "zonnebril": "sunglasses",
  "portemonnee": "wallet", "tas": "bag", "rugzak": "backpack", "heuptas": "fanny pack",
  "riem": "belt", "sjaal": "scarf", "muts": "beanie", "handschoenen": "gloves",
  "sokken": "socks", "slippers": "slippers",

  // Huis & keuken
  "keuken": "kitchen", "badkamer": "bathroom", "spiegel": "mirror", "borstel": "brush",
  "dweil": "mop", "stofzuiger": "vacuum", "ventilator": "fan", "luchtbevochtiger": "humidifier",
  "luchtreiniger": "air purifier", "thermometer": "thermometer", "weegschaal": "scale",
  "snijplank": "cutting board", "mes": "knife", "pan": "pan", "pot": "pot",
  "beker": "cup", "mok": "mug", "fles": "bottle", "waterfles": "water bottle",
  "thermosfles": "thermos", "opbergbox": "storage box", "organizer": "organizer",
  "plank": "shelf", "haak": "hook", "houder": "holder", "rek": "rack",
  "mat": "mat", "deurmat": "doormat", "tapijt": "carpet", "gordijn": "curtain",
  "kussen": "pillow", "deken": "blanket", "handdoek": "towel", "zeep": "soap",
  "dispenser": "dispenser", "prullenbak": "trash can", "emmer": "bucket",

  // Auto
  "auto": "car", "voertuig": "vehicle", "dashboard": "dashboard", "stuur": "steering",
  "achteruitkijk": "rearview", "parkeer": "parking", "dashcam": "dashcam",
  "luchtopfrisser": "air freshener", "stoelhoes": "seat cover",

  // Sport & outdoor
  "fiets": "bike", "fietsen": "cycling", "sport": "sport", "fitness": "fitness",
  "yoga": "yoga", "hardlopen": "running", "wandelen": "hiking", "kamperen": "camping",
  "tent": "tent", "slaapzak": "sleeping bag", "zaklamp": "flashlight",
  "kompas": "compass", "rugzak": "backpack", "bidon": "bottle",

  // Tuin
  "tuin": "garden", "plant": "plant", "bloempot": "flower pot", "gieter": "watering can",
  "tuinslang": "garden hose", "schaar": "scissors", "snoeischaar": "pruning shears",
  "gazon": "lawn", "bbq": "bbq", "barbecue": "barbecue", "grill": "grill",

  // Huisdier
  "hond": "dog", "kat": "cat", "huisdier": "pet", "voerbak": "food bowl",
  "riem": "leash", "halsband": "collar", "speelgoed": "toy", "krabpaal": "cat tree",
  "aquarium": "aquarium", "kooi": "cage", "mand": "bed",

  // Baby & kind
  "baby": "baby", "kind": "kid", "kinderen": "children", "speelgoed": "toy",
  "puzzel": "puzzle", "blokken": "blocks", "tekenen": "drawing",

  // Beauty
  "make-up": "makeup", "spiegel": "mirror", "borstel": "brush", "kam": "comb",
  "föhn": "hair dryer", "stijltang": "hair straightener", "krultang": "curling iron",
  "nagel": "nail", "gezicht": "face", "huid": "skin", "crème": "cream",
  "masker": "mask",

  // Algemeen
  "mini": "mini", "groot": "large", "klein": "small", "draagbaar": "portable",
  "opvouwbaar": "foldable", "magnetisch": "magnetic", "waterdicht": "waterproof",
  "oplaadbaar": "rechargeable", "verstelbaar": "adjustable", "multifunctioneel": "multifunctional",
};

const stopwords = [
  "met", "van", "voor", "en", "de", "het", "een", "dit", "dat", "die",
  "deze", "zijn", "was", "niet", "ook", "als", "aan", "bij", "uit",
  "naar", "maar", "dan", "nog", "wel", "hun", "ons", "uw",
  "–", "—", "with", "for", "and", "the", "from", "by", "in", "on",
  "to", "of", "pack", "set", "stuks", "pcs", "stuk", "per",
  "inclusief", "exclusief", "incl", "excl", "gratis", "free",
];

/**
 * Vertaal productnaam naar Engelse zoektermen
 */
function translateToSearchTerms(productName) {
  const words = productName
    .split(",")[0]
    .split(" – ")[0]
    .split(" - ")[0]
    .split(" | ")[0]
    .replace(/[()[\]{}/\\&+!?;:#@"'™®©°×]/g, " ")
    .split(/\s+/)
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length > 2)
    .filter((w) => !stopwords.includes(w))
    .filter((w) => !/^\d+$/.test(w))
    .map((w) => nlToEn[w] || w);

  // Deduplicate
  const unique = [...new Set(words)];
  return unique.slice(0, 5);
}

/**
 * Zoek product op CJ en krijg de inkoopprijs
 * Probeert meerdere zoekstrategieën als de eerste niet werkt
 */
async function getCJPrice(productName) {
  try {
    const words = translateToSearchTerms(productName);
    if (words.length === 0) return null;

    // Strategie 1: Alle woorden samen
    const fullQuery = words.join(" ");
    console.log("CJ zoekterm:", fullQuery);
    let results = await searchCJ(fullQuery);

    // Strategie 2: Als weinig resultaten, probeer met minder woorden
    if (results.length < 3 && words.length > 2) {
      const shortQuery = words.slice(0, 3).join(" ");
      console.log("CJ fallback zoekterm:", shortQuery);
      const moreResults = await searchCJ(shortQuery);
      results = [...results, ...moreResults];
    }

    // Strategie 3: Als nog steeds niets, probeer alleen de eerste 2 woorden
    if (results.length === 0 && words.length > 1) {
      const minQuery = words.slice(0, 2).join(" ");
      console.log("CJ min zoekterm:", minQuery);
      results = await searchCJ(minQuery);
    }

    if (results.length === 0) return null;

    // Filter: resultaten moeten minstens 40% van zoekwoorden bevatten
    const minMatchPercent = 0.4;
    const scored = results.map((r) => {
      const name = r.name.toLowerCase();
      const matchCount = words.filter((w) => name.includes(w)).length;
      const matchPercent = words.length > 0 ? matchCount / words.length : 0;
      return { ...r, matchCount, matchPercent };
    });

    const relevant = scored
      .filter((r) => r.matchPercent >= minMatchPercent && r.matchCount >= 2)
      .sort((a, b) => b.matchPercent - a.matchPercent);

    // Deduplicate op id
    const seen = new Set();
    const unique = relevant.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    if (unique.length === 0) return null;

    const prices = unique.filter((r) => r.price > 0).map((r) => r.price);
    if (prices.length === 0) return null;

    return {
      lowestPrice: Math.min(...prices),
      results: unique.slice(0, 5),
    };
  } catch (error) {
    console.error("CJ price error:", error.message);
    return null;
  }
}

module.exports = { searchCJ, getCJPrice, getToken, translateToSearchTerms };
