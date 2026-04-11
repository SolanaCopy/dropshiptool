const db = require("./database");

const PLAN_LIMITS = {
  starter: {
    searchesTotal: 5,           // 5 zoekopdrachten totaal
    supplierSearchesTotal: 3,   // 3x leverancier zoeken
    favorites: 3,               // max 3 favorieten
    history: 5,                 // max 5 in geschiedenis
    alerts: false,              // geen email alerts
    csv: false,                 // geen CSV export
    trendAnalyzer: false,       // locked
    socialTrends: false,        // locked
    nicheDetails: false,        // locked (heatmap + kalender)
    learnPro: false,            // alleen beginner cursus
  },
  pro: {
    searchesPerDay: Infinity,
    supplierSearchesPerDay: Infinity,
    favorites: Infinity,
    history: Infinity,
    alerts: true,
    csv: true,
    trendAnalyzer: true,
    socialTrends: true,
    nicheDetails: true,
    learnPro: true,
  },
  business: {
    searchesPerDay: Infinity,
    supplierSearchesPerDay: Infinity,
    favorites: Infinity,
    history: Infinity,
    alerts: true,
    csv: true,
    trendAnalyzer: true,
    socialTrends: true,
    nicheDetails: true,
    learnPro: true,
  },
};

function getLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
}

function checkSearchLimit(userId) {
  const user = db.prepare("SELECT plan, searchesToday FROM users WHERE id = ?").get(userId);
  if (!user) return { allowed: false, error: "Gebruiker niet gevonden" };

  const limits = getLimits(user.plan);

  if (limits.searchesTotal === undefined || limits.searchesTotal === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity, plan: user.plan };
  }

  if (user.searchesToday >= limits.searchesTotal) {
    return {
      allowed: false,
      remaining: 0,
      limit: limits.searchesTotal,
      plan: user.plan,
      error: `Je hebt je ${limits.searchesTotal} gratis zoekopdrachten gebruikt. Upgrade naar Pro voor onbeperkt zoeken.`,
    };
  }

  return {
    allowed: true,
    remaining: limits.searchesTotal - user.searchesToday,
    limit: limits.searchesTotal,
    plan: user.plan,
  };
}

function incrementSearch(userId) {
  db.prepare("UPDATE users SET searchesToday = searchesToday + 1 WHERE id = ?").run(userId);
}

function checkFavoriteLimit(userId) {
  const user = db.prepare("SELECT plan FROM users WHERE id = ?").get(userId);
  if (!user) return { allowed: false };

  const limits = getLimits(user.plan);
  if (limits.favorites === Infinity) return { allowed: true };

  const count = db.prepare("SELECT COUNT(*) as c FROM favorites WHERE userId = ?").get(userId).c;
  return {
    allowed: count < limits.favorites,
    current: count,
    limit: limits.favorites,
    error: count >= limits.favorites ? `Je kunt maximaal ${limits.favorites} favorieten opslaan met het gratis plan. Upgrade naar Pro voor onbeperkt.` : null,
  };
}

function checkSupplierLimit(userId) {
  const user = db.prepare("SELECT plan, supplierSearches FROM users WHERE id = ?").get(userId);
  if (!user) return { allowed: true }; // niet ingelogd = laat door (frontend handelt af)

  const limits = getLimits(user.plan);
  if (!limits.supplierSearchesTotal || limits.supplierSearchesTotal === Infinity) {
    return { allowed: true };
  }

  const count = user.supplierSearches || 0;
  return {
    allowed: count < limits.supplierSearchesTotal,
    current: count,
    limit: limits.supplierSearchesTotal,
    error: count >= limits.supplierSearchesTotal ? `Je hebt je ${limits.supplierSearchesTotal} gratis leverancier zoekopdrachten gebruikt. Upgrade naar Pro voor onbeperkt.` : null,
  };
}

function incrementSupplierSearch(userId) {
  db.prepare("UPDATE users SET supplierSearches = COALESCE(supplierSearches, 0) + 1 WHERE id = ?").run(userId);
}

function getUserPlan(userId) {
  const user = db.prepare("SELECT plan FROM users WHERE id = ?").get(userId);
  return user?.plan || "starter";
}

module.exports = { getLimits, checkSearchLimit, incrementSearch, checkFavoriteLimit, checkSupplierLimit, incrementSupplierSearch, getUserPlan, PLAN_LIMITS };
