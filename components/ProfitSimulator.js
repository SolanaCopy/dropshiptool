"use client";

import { useState } from "react";

function ProfitSimulator() {
  const [sellPrice, setSellPrice] = useState(25);
  const [buyPrice, setBuyPrice] = useState(8);
  const [salesPerDay, setSalesPerDay] = useState(5);

  const profit = sellPrice - buyPrice - 5; // -€5 gemiddelde kosten
  const daily = profit * salesPerDay;
  const monthly = daily * 30;
  const yearly = monthly * 12;

  return (
    <div className="simulator">
      <h3>Winstsimulator</h3>
      <p className="simulator-desc">Sleep de sliders en zie hoeveel je kunt verdienen</p>

      <div className="sim-sliders">
        <div className="sim-slider-row">
          <label>Verkoopprijs: <strong>&euro;{sellPrice}</strong></label>
          <input type="range" min="10" max="100" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} />
        </div>
        <div className="sim-slider-row">
          <label>Inkoopprijs: <strong>&euro;{buyPrice}</strong></label>
          <input type="range" min="1" max="50" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} />
        </div>
        <div className="sim-slider-row">
          <label>Verkopen per dag: <strong>{salesPerDay}</strong></label>
          <input type="range" min="1" max="50" value={salesPerDay} onChange={(e) => setSalesPerDay(Number(e.target.value))} />
        </div>
      </div>

      <div className="sim-results">
        <div className={`sim-result ${daily >= 0 ? "sim-pos" : "sim-neg"}`}>
          <span className="sim-result-value">&euro;{daily.toFixed(0)}</span>
          <span className="sim-result-label">per dag</span>
        </div>
        <div className={`sim-result sim-result-big ${monthly >= 0 ? "sim-pos" : "sim-neg"}`}>
          <span className="sim-result-value">&euro;{monthly.toLocaleString("nl-NL")}</span>
          <span className="sim-result-label">per maand</span>
        </div>
        <div className={`sim-result ${yearly >= 0 ? "sim-pos" : "sim-neg"}`}>
          <span className="sim-result-value">&euro;{yearly.toLocaleString("nl-NL")}</span>
          <span className="sim-result-label">per jaar</span>
        </div>
      </div>

      {monthly >= 1000 && <div className="sim-motivatie">Dat is genoeg om van te leven! Start nu met zoeken.</div>}
      {monthly >= 3000 && <div className="sim-motivatie fire">Full-time inkomen mogelijk met deze marges!</div>}
    </div>
  );
}

export default ProfitSimulator;
