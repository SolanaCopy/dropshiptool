import Link from "next/link";
import HeaderWrapper from "../../components/HeaderWrapper";

export default function BlogLayout({ children }) {
  return (
    <div className="app">
      <HeaderWrapper />
      <main className="main">
        {children}
      </main>
      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>Trendvinder</strong>
            <span>De #1 gratis dropshipping product research tool van Nederland</span>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <strong>Tool</strong>
              <Link href="/">Producten zoeken</Link>
              <Link href="/#calculator">Winstcalculator</Link>
              <Link href="/#prijzen">Prijzen</Link>
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
    </div>
  );
}
