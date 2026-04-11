"use client";

function getAdTip(product) {
  const name = (product.name || "").toLowerCase();
  const price = product.sellPrice || 0;

  let platform = "TikTok Ads";
  let target = "18-34 jaar";
  let budget = "€5-10/dag";
  let tip = "";
  let hookIdea = "";

  if (name.includes("keuken") || name.includes("kitchen") || name.includes("cleaning")) {
    platform = "Facebook Ads";
    target = "25-55 jaar, vrouwen";
    tip = "Laat het product in actie zien in een schone keuken";
    hookIdea = "\"Dit gadget bespaart me 30 minuten per dag\"";
  } else if (name.includes("fitness") || name.includes("sport") || name.includes("yoga")) {
    platform = "TikTok Ads";
    target = "18-35 jaar";
    tip = "Korte workout video met het product";
    hookIdea = "\"Mijn geheime workout tool die niemand kent\"";
  } else if (name.includes("telefoon") || name.includes("phone") || name.includes("case")) {
    platform = "TikTok Ads";
    target = "16-30 jaar";
    tip = "Satisfying unboxing video";
    hookIdea = "\"Wacht tot je ziet wat dit hoesje kan...\"";
  } else if (name.includes("auto") || name.includes("car")) {
    platform = "Facebook Ads";
    target = "25-50 jaar, mannen";
    tip = "Before/after van auto interieur";
    hookIdea = "\"Elke autorijder heeft dit nodig\"";
  } else if (name.includes("hond") || name.includes("kat") || name.includes("pet") || name.includes("dog")) {
    platform = "TikTok Ads";
    target = "18-45 jaar, huisdiereigenaren";
    tip = "Schattige video van huisdier met product";
    hookIdea = "\"Mijn hond is OBSESSED met dit speelgoed\"";
  } else if (name.includes("led") || name.includes("light") || name.includes("lamp")) {
    platform = "TikTok Ads";
    target = "16-30 jaar";
    tip = "Kamer transformatie video (licht uit, LED aan)";
    hookIdea = "\"POV: je kamer wordt een vibe\"";
  } else if (price > 30) {
    platform = "Facebook Ads";
    target = "25-55 jaar";
    budget = "€10-20/dag";
    tip = "Productdemonstratie met duidelijke voordelen";
    hookIdea = "\"Ik wilde dit niet kopen, maar nu kan ik niet zonder\"";
  } else {
    platform = "TikTok Ads";
    target = "18-35 jaar";
    tip = "Snelle, catchy productdemo in 15 seconden";
    hookIdea = "\"Waarom wist ik hier niet eerder van?!\"";
  }

  return { platform, target, budget, tip, hookIdea };
}

function AdTips({ product }) {
  if (!product) return null;

  const ad = getAdTip(product);

  return (
    <div className="ad-tips">
      <div className="ad-tips-title">Advertentie Tips</div>
      <div className="ad-tips-grid">
        <div className="ad-tip-item">
          <span className="ad-tip-label">Beste platform</span>
          <span className="ad-tip-value">{ad.platform}</span>
        </div>
        <div className="ad-tip-item">
          <span className="ad-tip-label">Doelgroep</span>
          <span className="ad-tip-value">{ad.target}</span>
        </div>
        <div className="ad-tip-item">
          <span className="ad-tip-label">Start budget</span>
          <span className="ad-tip-value">{ad.budget}</span>
        </div>
      </div>
      <div className="ad-tip-hook">
        <span className="ad-tip-label">Hook idee</span>
        <p className="ad-tip-hook-text">{ad.hookIdea}</p>
      </div>
      <div className="ad-tip-strategy">
        <span className="ad-tip-label">Strategie</span>
        <p>{ad.tip}</p>
      </div>
    </div>
  );
}

export { getAdTip };
export default AdTips;
