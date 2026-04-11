import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../../../data/articles";

// Generate static pages for all articles at build time (SSG)
export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

// Dynamic metadata per article (Next.js 16: params is a Promise)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: ["dropshipping", "product research", slug.replace(/-/g, " ")],
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: `${article.title} | Trendvinder`,
      description: article.description,
      url: `https://trendvinder.nl/blog/${slug}`,
      publishedTime: article.dateISO,
      modifiedTime: article.dateISO,
      authors: ["Trendvinder"],
      section: "Dropshipping",
      tags: ["dropshipping", "e-commerce", "product research"],
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Trendvinder`,
      description: article.description,
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://trendvinder.nl" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://trendvinder.nl/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://trendvinder.nl/blog/${slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `https://trendvinder.nl/blog/${slug}`,
    datePublished: article.dateISO,
    dateModified: article.dateISO,
    author: { "@type": "Organization", name: "Trendvinder", url: "https://trendvinder.nl" },
    publisher: {
      "@type": "Organization",
      name: "Trendvinder",
      url: "https://trendvinder.nl",
      logo: { "@type": "ImageObject", url: "https://trendvinder.nl/logo512.png", width: 512, height: 512 },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://trendvinder.nl/blog/${slug}` },
    image: "https://trendvinder.nl/og-image.jpg",
    inLanguage: "nl",
    isPartOf: { "@type": "Blog", name: "Trendvinder Blog", url: "https://trendvinder.nl/blog" },
    keywords: "dropshipping, product research, leveranciers, winstmarge, e-commerce",
  };

  return (
    <div className="blog-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Link href="/blog" className="blog-back">&larr; Terug naar blog</Link>
      <h1>{article.title}</h1>
      <div className="blog-article-meta">
        <time dateTime={article.dateISO}>{article.date}</time>
        <span>{article.readTime} leestijd</span>
      </div>
      <article className="blog-article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      <div className="blog-cta">
        <h3>Klaar om winnende producten te vinden?</h3>
        <p>Gebruik Trendvinder om producten te analyseren, leveranciers te vergelijken en je winstmarge te berekenen.</p>
        <Link href="/" className="blog-cta-btn">Start gratis &rarr;</Link>
      </div>
    </div>
  );
}
