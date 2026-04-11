"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PRO_PRICE = 15;

function Checkout({ onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState("confirm");

  useEffect(() => {
    if (typeof window !== "undefined" && window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "Checkout.Success") {
            setStep("done");
            if (refreshUser) refreshUser();
            if (onSuccess) setTimeout(() => onSuccess(), 2000);
          }
        } catch {}
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, refreshUser]);

  const handlePay = () => {
    if (!user || !user.id) {
      alert("Je moet ingelogd zijn om te upgraden. Sluit dit venster en log in.");
      return;
    }

    const variantId = process.env.NEXT_PUBLIC_LS_PRO_VARIANT;
    const storeSlug = process.env.NEXT_PUBLIC_LS_STORE_SLUG || "trendvinder";

    let checkoutUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}`;
    const params = new URLSearchParams();

    if (user?.email) params.set("checkout[email]", user.email);
    if (user?.name) params.set("checkout[name]", user.name);
    if (user?.id) params.set("checkout[custom][user_id]", user.id);
    params.set("embed", "1");

    checkoutUrl += "?" + params.toString();

    if (window.LemonSqueezy) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
      setStep("processing");
    } else {
      window.open(checkoutUrl, "_blank");
      setStep("processing");
    }
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>&times;</button>

        {step === "confirm" && (
          <>
            <div className="checkout-header">
              <div className="checkout-plan-badge">Pro</div>
              <h2>Upgrade naar Pro</h2>
              <p>Onbeperkt zoeken, leveranciers vinden en meer</p>
            </div>

            <div className="checkout-summary">
              <div className="checkout-line">
                <span>Trendvinder Pro (maandelijks)</span>
                <strong>&euro;{PRO_PRICE}</strong>
              </div>
              <div className="checkout-line checkout-total">
                <span>Totaal</span>
                <strong>&euro;{PRO_PRICE}/maand</strong>
              </div>
            </div>

            <div className="checkout-features">
              <h4>Dit krijg je:</h4>
              <ul>
                <li>Onbeperkt producten zoeken</li>
                <li>Onbeperkt leveranciers zoeken</li>
                <li>Trend Analyzer &amp; Social Trends</li>
                <li>Email alerts bij trending producten</li>
                <li>Gevorderd + Pro cursus (21 lessen)</li>
                <li>CSV export</li>
              </ul>
            </div>

            <button className="checkout-pay-btn" onClick={handlePay}>
              Betaal &euro;{PRO_PRICE} &rarr;
            </button>
            <div className="checkout-secure">&#128274; Veilige betaling via iDEAL, kaart of PayPal</div>
          </>
        )}

        {step === "processing" && (
          <div className="checkout-done">
            <div className="checkout-done-icon">&#128176;</div>
            <h2>Betaling verwerken...</h2>
            <p>Voltooi de betaling in het checkout venster. Je account wordt automatisch geactiveerd.</p>
            <button className="checkout-retry" onClick={handlePay}>
              Checkout opnieuw openen
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="checkout-done">
            <div className="checkout-done-icon">&#127881;</div>
            <h2>Welkom bij Pro, {user?.name || ""}!</h2>
            <p>Je account is geactiveerd. Alle Pro features zijn nu voor jou beschikbaar.</p>
            <div className="checkout-unlock-list">
              <div className="checkout-unlock-item">&#9989; Onbeperkt producten zoeken</div>
              <div className="checkout-unlock-item">&#9989; Onbeperkt leveranciers zoeken</div>
              <div className="checkout-unlock-item">&#9989; Trend Analyzer &amp; Social Trends</div>
              <div className="checkout-unlock-item">&#9989; Email alerts &amp; CSV export</div>
              <div className="checkout-unlock-item">&#9989; Pro cursus (21 lessen)</div>
            </div>
            <button className="checkout-pay-btn" onClick={onClose}>Start met zoeken &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
