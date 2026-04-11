export const BRANDS = [
  "apple","samsung","sony","jbl","bose","nike","adidas","philips","dyson","xiaomi",
  "anker","soundcore","logitech","braun","oral-b","lego","gopro","beats","garmin",
  "marshall","huawei","panasonic","canon","nikon","dell","lenovo","asus","razer",
  "corsair","sennheiser","fitbit","nintendo","kitchenaid","bosch","makita","crocs",
  "converse","puma","tefal","microsoft","steelseries","hyperx","jabra","sonos",
  "oppo","oneplus","realme","motorola","nokia","tp-link","nivea","dove","loreal",
  "garnier","neutrogena","olay","gillette","pantene","old spice","axe","rexona",
  "vaseline","palmolive","colgate","sensodyne","rituals","clinique","lancome",
  "maybelline","revlon","vichy","bioderma","cerave","new balance","asics","reebok",
  "vans","timberland","birkenstock","skechers","fila","lacoste","tommy hilfiger",
  "calvin klein","ralph lauren","hugo boss","michael kors","ikea","brabantia",
  "mepal","tupperware","le creuset","zwilling","nespresso","siemens","miele",
  "karcher","stanley","dewalt","coca-cola","pepsi","heineken","red bull","nescafe",
  "douwe egberts","knorr","heinz","nutella","haribo","milka","playmobil","barbie",
  "mattel","hasbro","nerf","fisher-price","disney","marvel","pokemon","royal canin",
  "whiskas","pedigree","michelin","goodyear",
];

// Gebruik woordgrenzen zodat "lg" niet matcht in "bulging"
export function isBrandProduct(name) {
  const lower = name.toLowerCase();
  return BRANDS.some((b) => {
    // Voor korte merken (2-3 chars) gebruik strikte woordgrens
    if (b.length <= 3) {
      const regex = new RegExp(`\\b${b}\\b`, "i");
      return regex.test(lower);
    }
    return lower.includes(b);
  });
}
