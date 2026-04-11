// Bekende merken die NIET te vinden zijn als white-label op AliExpress
const KNOWN_BRANDS = [
  "apple", "samsung", "sony", "jbl", "bose", "nike", "adidas", "puma",
  "philips", "dyson", "xiaomi", "huawei", "lg", "panasonic", "canon",
  "nikon", "gopro", "dell", "hp", "lenovo", "asus", "acer", "microsoft",
  "logitech", "razer", "corsair", "anker", "soundcore", "marshall",
  "google", "amazon", "kindle", "beats", "sennheiser", "garmin",
  "fitbit", "nintendo", "playstation", "xbox", "lego", "braun",
  "oral-b", "gillette", "tefal", "kitchenaid", "nespresso", "bosch",
  "makita", "dewalt", "stanley", "crocs", "converse", "vans",
  "the north face", "patagonia", "columbia", "under armour",
];

function detectBrand(productName) {
  const lower = productName.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand)) {
      // Return de merknaam met juiste hoofdletters
      const idx = lower.indexOf(brand);
      return productName.substring(idx, idx + brand.length);
    }
  }
  return null;
}

/**
 * Is dit een merkproduct of een white-label/merkloos product?
 * White-label producten zijn te vinden op AliExpress als exact hetzelfde product.
 * Merkproducten niet — daar vind je alleen vergelijkbare alternatieven.
 */
function isBrandProduct(productName) {
  return detectBrand(productName) !== null;
}

module.exports = { detectBrand, isBrandProduct, KNOWN_BRANDS };
