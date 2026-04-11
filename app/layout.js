import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Trendvinder — Vind Winnende Dropshipping Producten | #1 Gratis Tool Nederland",
    template: "%s | Trendvinder",
  },
  description:
    "Vind de best verkopende dropshipping producten met echte Amazon NL data, Google Trends analyse, TikTok trends en leveranciers vergelijking. Bereken je winstmarge en vind goedkope leveranciers op AliExpress en CJDropshipping. Start gratis — geen creditcard nodig.",
  keywords: [
    "dropshipping producten vinden", "winnende producten", "dropshipping nederland",
    "product research tool", "aliexpress leveranciers", "cjdropshipping",
    "dropship tool", "trending producten", "winstgevende producten",
    "shopify dropshipping", "bol.com dropshipping", "dropshipping beginnen",
    "dropshipping 2026", "beste dropshipping producten", "gratis dropshipping tool",
    "dropshipping winstmarge berekenen", "tiktok trending producten",
    "goedkope leveranciers china", "dropshipping zonder voorraad", "bol.com verkoper worden",
  ],
  authors: [{ name: "Trendvinder" }],
  creator: "Trendvinder",
  metadataBase: new URL("https://trendvinder.nl"),
  alternates: {
    canonical: "/",
    languages: { nl: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    alternateLocale: "nl_BE",
    url: "https://trendvinder.nl",
    siteName: "Trendvinder",
    title: "Trendvinder — Vind Winnende Dropshipping Producten",
    description: "Analyseer 1000+ producten, vergelijk leveranciers en bereken je winstmarge. De #1 gratis dropshipping tool van Nederland.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trendvinder — Product Research Tool voor Dropshippers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trendvinder — #1 Dropshipping Product Research Tool",
    description: "Vind winnende producten, vergelijk leveranciers en bereken je marge. Gratis starten.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  other: {
    "geo.region": "NL",
    "geo.placename": "Nederland",
    "revisit-after": "3 days",
    rating: "general",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
};

// JSON-LD structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Trendvinder",
  url: "https://trendvinder.nl",
  logo: "https://trendvinder.nl/logo512.png",
  description: "De #1 gratis dropshipping product research tool van Nederland",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@trendvinder.nl",
    availableLanguage: ["Dutch", "English"],
  },
  foundingDate: "2026",
  areaServed: { "@type": "GeoShape", name: "Nederland en België" },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Trendvinder",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "E-commerce Tool",
  operatingSystem: "Web",
  url: "https://trendvinder.nl",
  description: "Product research tool voor dropshippers. Vind winnende producten met echte Amazon data, Google Trends, TikTok trends en leveranciers vergelijking.",
  offers: [
    { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "EUR", description: "5 zoekopdrachten per dag, Winning Score analyse, Google Trends data" },
    { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "EUR", billingDuration: "P1M", description: "Onbeperkt zoeken, email alerts, CSV export, leveranciers vergelijking" },
    { "@type": "Offer", name: "Business", price: "79", priceCurrency: "EUR", billingDuration: "P1M", description: "Alles uit Pro plus API toegang, team accounts en prioriteit support" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "2400", bestRating: "5" },
  featureList: [
    "Winnende producten zoeken op Amazon NL",
    "Google Trends analyse (90 dagen)",
    "TikTok trending producten",
    "Leveranciers vergelijken (AliExpress, CJDropshipping, 1688, Alibaba)",
    "Winning Score algoritme (0-100)",
    "Winstcalculator met platformkosten",
    "Merkproducten automatisch filteren",
    "Email alerts voor trending producten",
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Hoe vind je winnende dropshipping producten met Trendvinder",
  description: "Stap-voor-stap uitleg hoe je met Trendvinder de meest winstgevende dropshipping producten vindt.",
  totalTime: "PT5M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0" },
  tool: { "@type": "HowToTool", name: "Trendvinder" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Zoek een product of niche", text: "Typ een productnaam of categorie in de zoekbalk. Trendvinder doorzoekt Amazon Nederland.", url: "https://trendvinder.nl/#producten" },
    { "@type": "HowToStep", position: 2, name: "Analyseer de Winning Score", text: "Elk product krijgt een score van 0-100 gebaseerd op verkoopaantallen, rating, winstmarge en Google Trends data.", url: "https://trendvinder.nl/#producten" },
    { "@type": "HowToStep", position: 3, name: "Vind de goedkoopste leverancier", text: "Klik op 'Vind exacte leverancier' — onze image search vindt het product op AliExpress en CJDropshipping.", url: "https://trendvinder.nl/#producten" },
    { "@type": "HowToStep", position: 4, name: "Bereken je winst en start", text: "Gebruik de winstcalculator om je marge te berekenen met je gekozen platform en start met dropshippen.", url: "https://trendvinder.nl/#calculator" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Wat is dropshipping en hoe begin ik ermee?", acceptedAnswer: { "@type": "Answer", text: "Dropshipping is een e-commerce model waarbij je producten verkoopt zonder voorraad. Als een klant bestelt, koop je het bij een leverancier die het direct naar je klant stuurt. Begin met een niche kiezen, een webshop opzetten, en gebruik Trendvinder om winnende producten te vinden." } },
    { "@type": "Question", name: "Hoe vind ik de beste dropshipping producten in 2026?", acceptedAnswer: { "@type": "Answer", text: "Gebruik Trendvinder om producten te analyseren op basis van verkoopcijfers, Google Trends data en TikTok trends. Onze Winning Score (0-100) combineert alle data om de meest winstgevende producten te identificeren." } },
    { "@type": "Question", name: "Wat is een goede winstmarge voor dropshipping?", acceptedAnswer: { "@type": "Answer", text: "Een goede winstmarge ligt tussen 20% en 50%. Reken alle kosten mee: inkoopprijs, verzending, platformkosten, advertentiekosten en BTW. Gebruik onze winstcalculator om je exacte marge te berekenen." } },
    { "@type": "Question", name: "Waar kan ik dropshipping producten goedkoop inkopen?", acceptedAnswer: { "@type": "Answer", text: "De beste leveranciers zijn: CJDropshipping (20-40% goedkoper dan AliExpress), AliExpress (grootste aanbod), 1688.com (fabrieksprijzen), en Alibaba (groothandel). Trendvinder vindt automatisch de goedkoopste leverancier via image search." } },
    { "@type": "Question", name: "Is Trendvinder gratis te gebruiken?", acceptedAnswer: { "@type": "Answer", text: "Ja, het Starter plan is volledig gratis met 5 zoekopdrachten per dag. Voor onbeperkt zoeken, email alerts en CSV export kun je upgraden naar Pro (€29/maand). Geen creditcard nodig." } },
    { "@type": "Question", name: "Welke producten zijn niet geschikt voor dropshipping?", acceptedAnswer: { "@type": "Answer", text: "Merkproducten (Nike, Apple, Samsung, etc.) zijn niet geschikt. Trendvinder filtert automatisch 200+ merken zodat je alleen geschikte producten ziet." } },
    { "@type": "Question", name: "Kan ik dropshipping doen via Bol.com?", acceptedAnswer: { "@type": "Answer", text: "Ja, Bol.com staat dropshipping toe mits je aan hun voorwaarden voldoet (levertijd max 8 dagen, klantenservice in het Nederlands). De platformkosten zijn ongeveer 10%." } },
    { "@type": "Question", name: "Hoe lang duurt de verzending bij dropshipping?", acceptedAnswer: { "@type": "Answer", text: "CJDropshipping: 7-15 dagen, ePacket: 10-20 dagen, AliExpress Standard: 15-30 dagen, DHL Express: 3-7 dagen." } },
    { "@type": "Question", name: "Wat kost dropshipping om te starten?", acceptedAnswer: { "@type": "Answer", text: "Je kunt starten met minder dan €100. Shopify (€36/maand), advertentiebudget (€20-50), en Trendvinder (gratis). Geen voorraad nodig." } },
    { "@type": "Question", name: "Wat is een Winning Score bij Trendvinder?", acceptedAnswer: { "@type": "Answer", text: "De Winning Score (0-100) berekent hoe geschikt een product is voor dropshipping op basis van verkoopcijfers, Google Trends, winstmarge en concurrentie. Boven 70 is potentieel winnend." } },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Trendvinder",
  url: "https://trendvinder.nl",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://trendvinder.nl/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://trendvinder.nl" },
    { "@type": "ListItem", position: 2, name: "Producten Zoeken", item: "https://trendvinder.nl/#producten" },
    { "@type": "ListItem", position: 3, name: "Winstcalculator", item: "https://trendvinder.nl/#calculator" },
    { "@type": "ListItem", position: 4, name: "Prijzen", item: "https://trendvinder.nl/#prijzen" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <meta httpEquiv="content-language" content="nl" />
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link rel="preconnect" href="https://ae-pic-a1.aliexpress-media.com" />
        <link rel="preconnect" href="https://cf.cjdropshipping.com" />
        <link rel="dns-prefetch" href="https://developers.cjdropshipping.com" />
        <link rel="dns-prefetch" href="https://m.media-amazon.com" />
        <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
