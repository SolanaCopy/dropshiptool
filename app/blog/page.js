import Link from "next/link";
import { ARTICLES } from "../../data/articles";

export const metadata = {
  title: "Blog — Dropshipping Tips & Strategieën 2026",
  description: "Leer alles over dropshipping: product research, leveranciers vinden, winstmarge berekenen, TikTok Ads en meer. Gratis tips en gidsen voor Nederlandse dropshippers.",
  keywords: ["dropshipping blog", "dropshipping tips", "dropshipping gids", "product research tips", "leveranciers vinden", "dropshipping beginnen 2026"],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Dropshipping Blog — Tips & Strategieën 2026 | Trendvinder",
    description: "Gratis dropshipping gidsen, leveranciers tips en product research strategieën.",
    url: "https://trendvinder.nl/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="blog">
      <h1>Dropshipping Blog</h1>
      <p className="blog-desc">Tips, strategieën en gidsen voor dropshippers in Nederland</p>
      <div className="blog-grid">
        {ARTICLES.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="blog-card">
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="blog-card-meta">
              <span>{article.date}</span>
              <span>{article.readTime} leestijd</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
