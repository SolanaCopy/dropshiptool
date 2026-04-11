"use client";

import { useState, useEffect } from "react";

const ACTIONS = [
  "heeft een leverancier gevonden voor",
  "heeft opgeslagen:",
  "zoekt naar",
  "vergelijkt prijzen voor",
  "bekijkt trending product:",
];

const NAMES = [
  "Ahmed", "Sophie", "Daan", "Lisa", "Mohammed", "Emma", "Lucas", "Julia",
  "Sem", "Mila", "Noah", "Sara", "Liam", "Anna", "Max", "Evi",
];

const PRODUCTS = [
  "draadloze oordopjes", "telefoonhoesje", "LED strip", "yoga mat",
  "auto telefoonhouder", "smartwatch band", "keuken organizer",
  "honden speelgoed", "USB-C hub", "nachtlamp", "waterfles",
  "laptop stand", "bluetooth speaker", "zonnebril", "rugzak",
];

function LiveActivity() {
  const [activities, setActivities] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    setActiveCount(12 + Math.floor(Math.random() * 20));
    const initial = Array.from({ length: 3 }, () => generateActivity());
    setActivities(initial);

    const interval = setInterval(() => {
      setActivities((prev) => [generateActivity(), ...prev.slice(0, 4)]);
      setActiveCount(12 + Math.floor(Math.random() * 20));
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-activity">
      <div className="live-activity-header">
        <span className="live-dot-green"></span>
        <span>{activeCount || 12} mensen actief</span>
      </div>
      <div className="live-activity-feed">
        {activities.map((a, i) => (
          <div key={a.id} className={`live-item ${i === 0 ? "live-item-new" : ""}`}>
            <span className="live-item-name">{a.name}</span>
            <span className="live-item-action">{a.action}</span>
            <span className="live-item-product">{a.product}</span>
            <span className="live-item-time">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateActivity() {
  return {
    id: Date.now() + Math.random(),
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
    time: "zojuist",
  };
}

export default LiveActivity;
