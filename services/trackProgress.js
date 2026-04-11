"use client";

const STORAGE_KEY = "lp_actions";

function getActions() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveActions(actions) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

export function trackAction(action, value = true) {
  const actions = getActions();
  if (typeof value === "number") {
    actions[action] = Math.max(actions[action] || 0, value);
  } else {
    actions[action] = value;
  }
  saveActions(actions);
}

export function getTrackedActions() {
  return getActions();
}

/**
 * Check of een opdracht automatisch afgevinkt moet worden.
 * Returns:
 *   true  = auto-completed (gebruiker deed de actie)
 *   false = auto maar nog niet gedaan
 *   null  = handmatige checkbox (externe actie die we niet kunnen tracken)
 */
export function isAutoCompleted(stepId, checkIndex, actions) {
  const key = `${stepId}-${checkIndex}`;

  const rules = {
    // ============================================================
    // BEGINNER
    // ============================================================

    // Les 1: Wat is dropshipping (lees-les)
    "b1-0": null, // "Ik begrijp hoe dropshipping werkt" — handmatig
    "b1-1": null, // "Ik weet dat ik geen voorraad hoef in te kopen" — handmatig

    // Les 2: De juiste verwachtingen (lees-les)
    "b2-0": null, // "Ik heb realistische verwachtingen" — handmatig
    "b2-1": null, // "€200+ beschikbaar" — handmatig
    "b2-2": null, // "Bereid 3 maanden te testen" — handmatig

    // Les 3: Wat maakt een goede niche (lees-les)
    "b3-0": null, // "Ik begrijp wat een goede niche is" — handmatig
    "b3-1": null, // "lijst van 3 niches" — handmatig

    // Les 4: Niche Score tool
    "b4-0": () => !!actions.usedNicheScore,   // Niche Scores vergeleken — na pagina bekijken
    "b4-1": () => !!actions.viewedCalendar,    // Seizoenskalender bekeken
    "b4-2": null,                              // "1 niche gekozen" — handmatig

    // Les 5: Vind winnende producten
    "b5-0": () => (actions.searchCount || 0) >= 1,       // Gezocht op niche
    "b5-1": () => (actions.productsViewed || 0) >= 20,   // 20+ producten
    "b5-2": () => (actions.favoritesCount || 0) >= 3,    // 3+ favorieten

    // Les 6: Check trends
    "b6-0": () => (actions.analyzerSearches || 0) >= 1,  // Trend Analyzer echt gebruikt
    "b6-1": () => (actions.analyzerSearches || 0) >= 1,  // Product stijgend/stabiel

    // Les 7: Vind leverancier
    "b7-0": () => (actions.supplierSearches || 0) >= 1,  // Leverancier gezocht
    "b7-1": () => (actions.supplierSearches || 0) >= 2,  // 2+ platforms
    "b7-2": null,                                         // "Verzendtijd gecheckt" — handmatig

    // Les 8: Bereken winstmarge
    "b8-0": () => !!actions.usedCalculator,   // Winstmarge berekend
    "b8-1": () => !!actions.usedCalculator,   // Alle kosten meegerekend
    "b8-2": null,                              // "30%+ marge gevonden" — handmatig

    // ============================================================
    // GEVORDERD
    // ============================================================

    // Les g1: Platform kiezen
    "g1-0": null, // "Platform gekozen" — extern
    "g1-1": null, // "Account aangemaakt" — extern

    // Les g2: Productpagina's
    "g2-0": null, // "5 producten toegevoegd" — extern
    "g2-1": null, // "5 foto's per product" — extern
    "g2-2": null, // "Verzendinfo zichtbaar" — extern
    "g2-3": null, // "Betaling ingesteld" — extern

    // Les g3: Juridisch
    "g3-0": null, // "KvK ingeschreven" — extern
    "g3-1": null, // "Privacy beleid" — extern
    "g3-2": null, // "Retourbeleid" — extern
    "g3-3": null, // "KOR aangevraagd" — extern

    // Les g4: TikTok Ads
    "g4-0": null, // "TikTok account" — extern
    "g4-1": null, // "Eerste video" — extern
    "g4-2": null, // "Campagne gestart" — extern

    // Les g5: Testen en optimaliseren
    "g5-0": null, // "3 producten getest" — extern
    "g5-1": null, // "Verliezers gestopt" — extern
    "g5-2": null, // "Winnend product gevonden" — extern

    // Les g6: Eerste verkoop
    "g6-0": null, // "Eerste verkoop" — extern
    "g6-1": null, // "Product besteld bij leverancier" — extern
    "g6-2": null, // "Klant geïnformeerd" — extern

    // ============================================================
    // PRO
    // ============================================================

    // Les p1: Opschalen
    "p1-0": null, // "Budget verhoogd" — extern
    "p1-1": null, // "Video variaties" — extern
    "p1-2": null, // "5+ verkopen/dag" — extern

    // Les p2: Meerdere winnaars
    "p2-0": null, // "3 producten consistent" — extern
    "p2-1": null, // "Wekelijks testen" — extern
    "p2-2": () => !!actions.usedAlerts,  // Email alerts ingesteld

    // Les p3-p7: allemaal extern
    "p3-0": null, "p3-1": null, "p3-2": null, "p3-3": null,
    "p4-0": null, "p4-1": null, "p4-2": null,
    "p5-0": null, "p5-1": null, "p5-2": null,
    "p6-0": null, "p6-1": null, "p6-2": null,
    "p7-0": null, "p7-1": null, "p7-2": null,
  };

  const rule = rules[key];
  if (rule === null || rule === undefined) return null; // handmatig
  return rule(); // auto
}
