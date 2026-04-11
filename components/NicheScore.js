"use client";

import { useEffect } from "react";
import { trackAction } from "../services/trackProgress";

const NICHES = [
  { name: "Telefoon Accessoires", score: 82, trend: "up", competition: "Hoog", margin: "40-60%", tip: "Focus op unieke hoesjes en gadgets" },
  { name: "Huisdier Producten", score: 78, trend: "up", competition: "Gemiddeld", margin: "45-65%", tip: "Honden speelgoed en accessoires verkopen het best" },
  { name: "Auto Gadgets", score: 75, trend: "up", competition: "Laag", margin: "50-70%", tip: "Telefoonhouders en LED verlichting zijn populair" },
  { name: "Home Fitness", score: 72, trend: "stable", competition: "Gemiddeld", margin: "35-55%", tip: "Resistance bands en yoga mats zijn evergreens" },
  { name: "Keuken Gadgets", score: 70, trend: "up", competition: "Gemiddeld", margin: "40-60%", tip: "Handige tools die je op TikTok kunt demonstreren" },
  { name: "LED Verlichting", score: 68, trend: "stable", competition: "Hoog", margin: "45-65%", tip: "RGB strips en nachtlampen zijn populair" },
  { name: "Beauty Tools", score: 65, trend: "up", competition: "Hoog", margin: "50-70%", tip: "Jade rollers en gezichtsmaskers zijn trending" },
  { name: "Tuin Accessoires", score: 63, trend: "up", competition: "Laag", margin: "40-55%", tip: "Seizoensgebonden — begin vroeg met adverteren" },
  { name: "Baby & Kinderen", score: 60, trend: "stable", competition: "Gemiddeld", margin: "35-50%", tip: "Educatief speelgoed verkoopt goed" },
  { name: "Outdoor & Camping", score: 58, trend: "stable", competition: "Laag", margin: "40-60%", tip: "Seizoensgebonden maar hoge marge" },
];

function NicheScore() {
  useEffect(() => { trackAction("usedNicheScore", true); }, []);
  return (
    <div className="niche-score">
      <h3>Niche Score — Welke niche past bij jou?</h3>
      <p className="niche-desc">Elke niche beoordeeld op trend, concurrentie en winstmarge</p>
      <div className="niche-list">
        {NICHES.map((niche) => (
          <div key={niche.name} className="niche-item">
            <div className="niche-item-header">
              <span className="niche-name">{niche.name}</span>
              <span className={`niche-score-badge ${niche.score >= 70 ? "niche-hot" : "niche-warm"}`}>
                {niche.score}
              </span>
            </div>
            <div className="niche-item-details">
              <span className={`niche-trend niche-trend-${niche.trend}`}>
                {niche.trend === "up" ? "\u2191 Stijgend" : "\u2192 Stabiel"}
              </span>
              <span>Concurrentie: {niche.competition}</span>
              <span>Marge: {niche.margin}</span>
            </div>
            <p className="niche-tip">{niche.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NicheScore;
