"use client";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005") + "/api";

function SupplierModal({ product, onClose, onPriceFound }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brand, setBrand] = useState(null);
  const [isBrandProduct, setIsBrandProduct] = useState(false);
  const [platformLinks, setPlatformLinks] = useState([]);
  const fetchedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onPriceFoundRef = useRef(onPriceFound);
  onPriceFoundRef.current = onPriceFound;

  // Zoek alternatieven via afbeelding — alleen 1x
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (!product?.image) {
      setError("Geen afbeelding beschikbaar");
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(
      `${API_URL}/products/find-supplier?imageUrl=${encodeURIComponent(product.image)}&name=${encodeURIComponent(product.name || "")}&sellPrice=${product.sellPrice || 0}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.limitReached) {
          setError(json.error || "Leverancier zoek limiet bereikt. Upgrade naar Pro.");
          setLoading(false);
          return;
        }
        if (json.success) {
          setResults(json.data || []);
          setBrand(json.brand || null);
          setIsBrandProduct(json.isBrandProduct || false);
          setPlatformLinks(json.platformLinks || []);
          const sellPrice = product.sellPrice || 0;
          if (json.cjLowestPrice && json.cjLowestPrice < sellPrice && onPriceFoundRef.current) {
            onPriceFoundRef.current(json.cjLowestPrice);
          } else if (json.data && json.data.length > 0 && onPriceFoundRef.current) {
            const validPrices = json.data
              .filter((p) => p.price > 0 && p.price < sellPrice)
              .map((p) => p.price);
            if (validPrices.length > 0) onPriceFoundRef.current(Math.min(...validPrices));
          }
        } else {
          setError(json.error || "Geen resultaten");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Kon leveranciers niet laden");
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Escape + body scroll lock
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, []);

  const renderResults = (items, isExact) => (
    <div className="modal-results">
      {items.map((item, i) => {
        const saving = product.sellPrice && item.price
          ? ((product.sellPrice - item.price) / product.sellPrice * 100).toFixed(0)
          : 0;
        const matchClass = item.matchScore >= 70 ? "match-high"
          : item.matchScore >= 40 ? "match-mid" : "match-low";

        return (
          <a
            key={item.id || i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`modal-result ${i === 0 ? "modal-result-best" : ""} ${item.isDropshipPrice ? "modal-result-cj" : ""}`}
          >
            <img src={item.image} alt={item.name} onError={(e) => { e.target.style.display = "none"; }} />
            <div className="modal-result-info">
              <div className="modal-result-top">
                {item.isDropshipPrice && (
                  <span className="cj-badge">Dropship prijs</span>
                )}
                {!item.isDropshipPrice && item.matchType === "exact" && (
                  <span className="match-badge match-exact">Exact product</span>
                )}
                {!item.isDropshipPrice && item.matchType === "similar" && (
                  <span className="match-badge match-similar">Vergelijkbaar</span>
                )}
                {!item.isDropshipPrice && !item.matchType && item.matchScore > 0 && (
                  <span className={`match-badge ${matchClass}`}>{item.matchScore}% match</span>
                )}
                {item.trustLevel === "top" && (
                  <span className="trust-badge trust-top" title="Meer dan 5.000 verkocht — fabrikant met bewezen track record">&#11088; {item.trustLabel}</span>
                )}
                {item.trustLevel === "verified" && (
                  <span className="trust-badge trust-verified" title="500+ verkocht — betrouwbare leverancier">&#10004; {item.trustLabel}</span>
                )}
                {item.trustLevel === "low" && (
                  <span className="trust-badge trust-low" title="Weinig verkopen — wees voorzichtig, mogelijk nieuwe of onbetrouwbare verkoper">&#9888; {item.trustLabel}</span>
                )}
                <span className="source-badge-small">{item.source}</span>
              </div>
              <h5>{item.name}</h5>
              <div className="modal-result-meta">
                <span className="modal-result-price">
                  {isExact ? item.originalPrice || `\u20AC${item.price.toFixed(2)}` : `\u20AC${item.price.toFixed(2)}`}
                </span>
                {saving > 0 && !item.tooExpensive && <span className="modal-result-saving">{saving}% goedkoper</span>}
                {item.tooExpensive && <span className="modal-result-expensive">Duurder dan verkoopprijs</span>}
                {item.priceWarning && !item.tooExpensive && (
                  <span className="modal-result-warning" title="Prijs lijkt erg laag — controleer of dit het volledige product is, niet alleen een onderdeel">&#9888; Check of compleet</span>
                )}
                {item.sales > 0 && <span className="modal-result-sales">{item.sales.toLocaleString("nl-NL")} verkocht</span>}
                {item.reviews > 0 && <span className="modal-result-sales">{item.reviews.toLocaleString("nl-NL")} reviews</span>}
                {item.rating > 0 && <span className="modal-result-rating">&#9733; {item.rating}</span>}
              </div>
            </div>
            <span className="modal-result-arrow">&rarr;</span>
          </a>
        );
      })}
    </div>
  );

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={() => onCloseRef.current()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onCloseRef.current()}>&times;</button>

        <div className="modal-header">
          <h2>Leveranciers &amp; prijsvergelijking</h2>
        </div>

        <div className="modal-original">
          <img src={product.image} alt={product.name} />
          <div>
            <h4>{product.name}</h4>
            <span className="modal-original-price">Jouw prijs: &euro;{(product.sellPrice || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Geen tabs meer - alleen AliExpress leveranciers tonen */}

        {/* Leveranciers resultaten */}
        <>
          {isBrandProduct && !loading && (
              <div className="modal-brand-notice">
                <div className="brand-notice-icon">&#9888;</div>
                <div>
                  <strong>Merkproduct ({brand})</strong>
                  <p>Hieronder staan merkloze alternatieven. Kies "Exact product" tab voor het echte merk.</p>
                </div>
              </div>
            )}
            {!isBrandProduct && !loading && results.length > 0 && (
              <div className="modal-unbranded-notice">
                <div className="brand-notice-icon">&#9989;</div>
                <div>
                  <strong>Merkloos — ideaal voor dropshipping!</strong>
                  <p>Dit zijn waarschijnlijk exact dezelfde producten van de fabrikant.</p>
                </div>
              </div>
            )}
            {loading && <div className="modal-loading"><div className="spinner"></div><p>Leveranciers zoeken...</p></div>}
            {error && <div className="modal-error">{error}</div>}
            {!loading && results.length > 0 && renderResults(results, false)}
            {!loading && results.length === 0 && !error && <div className="modal-empty">Geen matches gevonden via image search. Probeer de directe links hieronder.</div>}

            {/* Directe links naar andere platforms */}
            {!loading && platformLinks.length > 0 && (
              <div className="modal-platforms">
                <h4>Zelf zoeken op andere platforms</h4>
                <div className="modal-platform-links">
                  {platformLinks.map((pl) => (
                    <a
                      key={pl.source}
                      href={pl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-platform-link"
                    >
                      <strong>{pl.name}</strong>
                      <span>{pl.description}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
      </div>
    </div>,
    document.body
  );
}

export default SupplierModal;
