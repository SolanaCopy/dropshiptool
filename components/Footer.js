import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <strong>Trendvinder</strong>
          <span>De #1 gratis dropshipping product research tool van Nederland</span>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <strong>Tool</strong>
            <a href="#producten">Producten zoeken</a>
            <a href="#calculator">Winstcalculator</a>
            <a href="#prijzen">Prijzen</a>
          </div>
          <div className="footer-col">
            <strong>Blog</strong>
            <Link href="/blog/dropshipping-beginnen-2026">Dropshipping beginnen</Link>
            <Link href="/blog/beste-dropshipping-producten-2026">Beste producten 2026</Link>
            <Link href="/blog/aliexpress-vs-cjdropshipping">Leveranciers vergelijken</Link>
            <Link href="/blog">Alle artikelen</Link>
          </div>
          <div className="footer-col">
            <strong>Contact</strong>
            <a href="mailto:info@trendvinder.nl">info@trendvinder.nl</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 Trendvinder. Alle rechten voorbehouden.</span>
      </div>
    </footer>
  );
}
