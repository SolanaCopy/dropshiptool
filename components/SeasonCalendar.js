"use client";

import { useState, useEffect } from "react";
import { trackAction } from "../services/trackProgress";

const SEASONS = [
  { month: "Jan", products: ["Fitness apparatuur", "Planners & organizers", "Winterkleding"], heat: 65 },
  { month: "Feb", products: ["Valentijn cadeaus", "Sieraden", "Romantische gadgets"], heat: 70 },
  { month: "Mrt", products: ["Tuingereedschap", "Lente decoratie", "Outdoor sport"], heat: 60 },
  { month: "Apr", products: ["Pasen decoratie", "BBQ accessoires", "Fiets accessoires"], heat: 65 },
  { month: "Mei", products: ["Moederdag cadeaus", "Tuin meubels", "Zonnebrillen"], heat: 75 },
  { month: "Jun", products: ["Vaderdag cadeaus", "Zwembad speelgoed", "Camping gear"], heat: 80 },
  { month: "Jul", products: ["Strand accessoires", "Ventilatoren", "Reisaccessoires"], heat: 85 },
  { month: "Aug", products: ["Back to school", "Laptoptassen", "Bureau accessoires"], heat: 80 },
  { month: "Sep", products: ["Herfst decoratie", "Kaarsen", "Warme dekens"], heat: 70 },
  { month: "Okt", products: ["Halloween", "Herfst mode", "LED verlichting"], heat: 75 },
  { month: "Nov", products: ["Black Friday deals", "Kerst cadeaus vroeg", "Elektronica"], heat: 95 },
  { month: "Dec", products: ["Kerstcadeaus", "Winteraccessoires", "Feestverlichting"], heat: 90 },
];

function SeasonCalendar() {
  const [currentMonth, setCurrentMonth] = useState(-1);

  useEffect(() => {
    setCurrentMonth(new Date().getMonth());
    trackAction("viewedCalendar", true);
  }, []);

  return (
    <div className="season-calendar">
      <h3>Seizoenskalender — Wat verkopen per maand</h3>
      <p className="season-desc">Plan vooruit welke producten je wanneer moet verkopen</p>
      <div className="season-grid">
        {SEASONS.map((s, i) => (
          <div key={s.month} className={`season-card ${i === currentMonth ? "season-current" : ""}`}>
            <div className="season-month">{s.month}</div>
            <div className="season-heat-bar">
              <div className="season-heat-fill" style={{ width: `${s.heat}%` }}></div>
            </div>
            <ul className="season-products">
              {s.products.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {i === currentMonth && <span className="season-now">Nu</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeasonCalendar;
