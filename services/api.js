const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005") + "/api";

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function searchProducts(query) {
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });
  const json = await res.json();
  if (json.limitReached) return json; // Laat App.js de limiet afhandelen
  if (!json.success) throw new Error(json.error);
  return json;
}

export async function fetchDailyTrends(geo = "NL") {
  const res = await fetch(`${API_BASE}/trends/daily?geo=${geo}`);
  const json = await res.json();
  return json.data || [];
}

export async function analyzeProduct(keyword) {
  const res = await fetch(`${API_BASE}/products/analyze?keyword=${encodeURIComponent(keyword)}`);
  const json = await res.json();
  return json.data || null;
}

// Favorieten
export async function getFavorites() {
  const res = await fetch(`${API_BASE}/favorites`, { headers: getHeaders() });
  const json = await res.json();
  if (!json.success) return [];
  return json.data || [];
}

export async function addFavorite(product) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      sellPrice: product.sellPrice,
      supplierPrice: product.price,
      source: product.source,
      link: product.link,
      category: product.category,
    }),
  });
  return res.json();
}

export async function removeFavorite(productId) {
  const res = await fetch(`${API_BASE}/favorites/${productId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
}

export async function exportFavoritesCSV() {
  const res = await fetch(`${API_BASE}/favorites/csv`, { headers: getHeaders() });
  if (!res.ok) {
    const json = await res.json();
    return { success: false, error: json.error, upgrade: json.upgrade };
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trendvinder-favorieten-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return { success: true };
}

// Zoekgeschiedenis
export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`, { headers: getHeaders() });
  const json = await res.json();
  return json.data || [];
}

export async function saveSearch(query, resultCount) {
  await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ query, resultCount }),
  });
}

export async function clearHistory() {
  await fetch(`${API_BASE}/history`, { method: "DELETE", headers: getHeaders() });
}

// Alerts
export async function getAlerts() {
  const res = await fetch(`${API_BASE}/alerts`, { headers: getHeaders() });
  const json = await res.json();
  return json.data || [];
}

export async function saveAlert(settings) {
  await fetch(`${API_BASE}/alerts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
}

export async function deleteAlert() {
  await fetch(`${API_BASE}/alerts`, { method: "DELETE", headers: getHeaders() });
}
