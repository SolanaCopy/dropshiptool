import Link from "next/link";

function SEOContent() {
  return (
    <section className="seo-content" aria-label="Informatie over Trendvinder en dropshipping">
      {/* Features */}
      <div className="seo-features">
        <h2>Waarom kiezen 2.400+ dropshippers voor Trendvinder?</h2>
        <p className="seo-features-intro">Trendvinder combineert echte verkoopdata van Amazon Nederland, Google Trends analyse en TikTok trending videos in één krachtige tool. Bespaar uren product research en vind direct de meest winstgevende producten.</p>
        <div className="seo-features-grid">
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#128269;</div>
            <h3>Vind winnende producten in seconden</h3>
            <p>Doorzoek duizenden producten van Amazon Nederland met echte verkoopcijfers, ratings en trends. Onze Winning Score berekent welke producten het meest winstgevend zijn voor jouw webshop.</p>
          </div>
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#128200;</div>
            <h3>Google Trends &amp; TikTok analyse</h3>
            <p>Zie welke producten nu trending zijn op Google en TikTok. Onze tool analyseert 90 dagen aan zoekdata zodat je producten vindt voordat ze viraal gaan — niet erna.</p>
          </div>
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#127981;</div>
            <h3>Leveranciers direct vergelijken</h3>
            <p>Vind de goedkoopste leverancier via AliExpress, CJDropshipping, 1688 en Alibaba. Onze image search technologie vindt het exacte product bij de fabrikant.</p>
          </div>
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#128176;</div>
            <h3>Echte winstberekening</h3>
            <p>Bereken je exacte winst per product inclusief verzendkosten, platformkosten (Shopify, Bol.com, Amazon), advertentiekosten en BTW. Nooit meer verrast door verborgen kosten.</p>
          </div>
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#128293;</div>
            <h3>Alleen dropship-geschikte producten</h3>
            <p>Wij filteren automatisch 200+ merkproducten die je niet mag doorverkopen. Je ziet alleen producten die echt geschikt zijn voor dropshipping — zonder risico op juridische problemen.</p>
          </div>
          <div className="seo-feature">
            <div className="seo-feature-icon" aria-hidden="true">&#128274;</div>
            <h3>Gratis starten, upgraden als je groeit</h3>
            <p>Begin gratis met 5 zoekopdrachten per dag. Upgrade naar Pro voor onbeperkt zoeken, email alerts en CSV export. Geen creditcard nodig om te starten.</p>
          </div>
        </div>
      </div>

      {/* Hoe het werkt — met HowTo microdata */}
      <div className="seo-how" itemScope itemType="https://schema.org/HowTo">
        <meta itemProp="name" content="Hoe vind je winnende dropshipping producten met Trendvinder" />
        <meta itemProp="totalTime" content="PT5M" />
        <h2>Hoe werkt Trendvinder?</h2>
        <p className="seo-how-intro">In 4 simpele stappen van product research naar je eerste verkoop. Geen ervaring nodig.</p>
        <div className="seo-steps">
          <div className="seo-step" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="1" />
            <div className="seo-step-num" aria-hidden="true">1</div>
            <h3 itemProp="name">Zoek een product of niche</h3>
            <p itemProp="text">Typ een productnaam of categorie in. Onze tool doorzoekt Amazon Nederland en toont alle beschikbare producten met echte verkoopdata, Google Trends en TikTok populariteit.</p>
          </div>
          <div className="seo-step" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="2" />
            <div className="seo-step-num" aria-hidden="true">2</div>
            <h3 itemProp="name">Analyseer de Winning Score</h3>
            <p itemProp="text">Elk product krijgt een score van 0-100 gebaseerd op verkoopaantallen, rating, winstmarge en Google Trends data. Hogere score = beter product om te verkopen.</p>
          </div>
          <div className="seo-step" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="3" />
            <div className="seo-step-num" aria-hidden="true">3</div>
            <h3 itemProp="name">Vind de goedkoopste leverancier</h3>
            <p itemProp="text">Klik op "Vind exacte leverancier" en onze image search vindt hetzelfde product op AliExpress en CJDropshipping voor de laagste inkoopprijs.</p>
          </div>
          <div className="seo-step" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="4" />
            <div className="seo-step-num" aria-hidden="true">4</div>
            <h3 itemProp="name">Bereken je winst en start</h3>
            <p itemProp="text">Gebruik de winstcalculator om je marge te berekenen met je gekozen platform, verzendmethode en advertentiekanaal. Start direct met dropshippen.</p>
          </div>
        </div>
      </div>

      {/* Hoe mensen het gebruiken */}
      <div className="seo-usecases">
        <h2>Hoe dropshippers Trendvinder gebruiken</h2>
        <div className="usecases-grid">
          <div className="usecase">
            <div className="usecase-icon">&#128269;</div>
            <div className="usecase-content">
              <h3>Product research versnellen</h3>
              <p>In plaats van uren scrollen op AliExpress, zoek je op categorie of niche en zie je direct welke producten het beste verkopen op Amazon NL. De Winning Score sorteert automatisch op potentie.</p>
              <span className="usecase-who">Populair bij starters die hun eerste product zoeken</span>
            </div>
          </div>
          <div className="usecase">
            <div className="usecase-icon">&#128176;</div>
            <div className="usecase-content">
              <h3>Winstmarge vooraf berekenen</h3>
              <p>De winstcalculator rekent platformkosten, verzending, ads en BTW mee. Zo weet je voordat je een product test of de marge realistisch is — geen verrassingen achteraf.</p>
              <span className="usecase-who">Essentieel voor Bol.com verkopers (commissie verschilt per categorie)</span>
            </div>
          </div>
          <div className="usecase">
            <div className="usecase-icon">&#127981;</div>
            <div className="usecase-content">
              <h3>Goedkoopste leverancier vinden</h3>
              <p>Klik op een product en de image search zoekt automatisch hetzelfde product op AliExpress en CJDropshipping. Scheelt je het handmatig vergelijken van tientallen leveranciers.</p>
              <span className="usecase-who">Bespaart gemiddeld 20-40% op inkoopkosten vs. alleen AliExpress</span>
            </div>
          </div>
          <div className="usecase">
            <div className="usecase-icon">&#128200;</div>
            <div className="usecase-content">
              <h3>Trends spotten met data</h3>
              <p>Google Trends data (90 dagen) en TikTok trending videos laten zien welke producten nu stijgen in populariteit. Handig om seizoensproducten op tijd in te kopen.</p>
              <span className="usecase-who">Gebruikt door ervaren dropshippers die willen opschalen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vergelijking met concurrenten */}
      <div className="seo-comparison">
        <h2>Trendvinder vs. andere dropshipping tools</h2>
        <p className="seo-comparison-intro">Vergelijk Trendvinder met Minea, Sell The Trend en Ecomhunt. Ontdek waarom 2.400+ dropshippers in Nederland voor Trendvinder kiezen.</p>
        <div className="comparison-table-wrap">
          <table className="comparison-table" role="table" aria-label="Vergelijking dropshipping tools">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col" className="highlight-col">Trendvinder</th>
                <th scope="col">Minea</th>
                <th scope="col">Sell The Trend</th>
                <th scope="col">Ecomhunt</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Gratis plan</td><td className="highlight-col">Ja</td><td>Beperkt</td><td>Nee</td><td>Beperkt</td></tr>
              <tr><td>Amazon NL data</td><td className="highlight-col">Ja</td><td>Nee</td><td>Nee</td><td>Nee</td></tr>
              <tr><td>Google Trends</td><td className="highlight-col">Ja (90 dagen)</td><td>Nee</td><td>Ja</td><td>Nee</td></tr>
              <tr><td>TikTok trends</td><td className="highlight-col">Ja</td><td>Ja</td><td>Ja</td><td>Nee</td></tr>
              <tr><td>Leverancier zoeken</td><td className="highlight-col">Image search</td><td>Handmatig</td><td>Handmatig</td><td>Link</td></tr>
              <tr><td>Winstcalculator</td><td className="highlight-col">Ja (klikbaar)</td><td>Basis</td><td>Basis</td><td>Nee</td></tr>
              <tr><td>Winning Score</td><td className="highlight-col">0-100 algoritme</td><td>Nee</td><td>Basis</td><td>Nee</td></tr>
              <tr><td>Merkfilter</td><td className="highlight-col">200+ merken</td><td>Nee</td><td>Nee</td><td>Nee</td></tr>
              <tr><td>Nederlands</td><td className="highlight-col">Volledig NL</td><td>Engels</td><td>Engels</td><td>Engels</td></tr>
              <tr><td>Prijs per maand</td><td className="highlight-col">Gratis / €29</td><td>€49</td><td>€40</td><td>€29</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistieken */}
      <div className="seo-stats">
        <h2>Trendvinder in cijfers</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">1.500+</div>
            <div className="stat-label">Producten geanalyseerd</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">2.400+</div>
            <div className="stat-label">Actieve gebruikers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10</div>
            <div className="stat-label">Product categorieën</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">5</div>
            <div className="stat-label">Leverancier platforms</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="seo-faq" role="region" aria-label="Veelgestelde vragen">
        <h2>Veelgestelde vragen over dropshipping</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Wat is dropshipping en hoe begin ik ermee?</summary>
            <p>Dropshipping is een e-commerce model waarbij je producten verkoopt zonder voorraad aan te houden. Als een klant bestelt, koop je het product bij een leverancier (zoals AliExpress of CJDropshipping) die het direct naar je klant stuurt. Je verdient het verschil tussen verkoop- en inkoopprijs. Begin met een niche kiezen, een Shopify of Bol.com webshop opzetten, en gebruik Trendvinder om winnende producten te vinden. Lees onze <Link href="/blog/dropshipping-beginnen-2026">complete beginnersgids</Link> voor meer details.</p>
          </details>
          <details className="faq-item">
            <summary>Hoe vind ik de beste dropshipping producten in 2026?</summary>
            <p>Met Trendvinder analyseer je duizenden producten op basis van verkoopcijfers, Google Trends data en TikTok trends. Onze Winning Score (0-100) combineert alle data om de meest winstgevende producten te identificeren. Filter op categorie, bekijk alleen dropship-geschikte producten en vergelijk leveranciersprijzen. Bekijk ook onze <Link href="/blog/beste-dropshipping-producten-2026">lijst met 25 beste producten</Link>.</p>
          </details>
          <details className="faq-item">
            <summary>Wat is een goede winstmarge voor dropshipping?</summary>
            <p>Een goede winstmarge voor dropshipping ligt tussen 20% en 50%. Houd rekening met alle kosten: inkoopprijs, verzending (€2.50-€12), platformkosten (Shopify ~2.9%, Bol.com ~10%, Amazon ~15%), advertentiekosten (€2-5 per verkoop) en BTW (21%). Gebruik onze winstcalculator om je exacte marge per product te berekenen.</p>
          </details>
          <details className="faq-item">
            <summary>Waar kan ik dropshipping producten goedkoop inkopen?</summary>
            <p>De populairste leveranciers zijn: CJDropshipping (beste voor beginners, per stuk bestellen, 20-40% goedkoper), AliExpress (grootste aanbod), 1688.com (goedkoopste fabrieksprijzen maar bulk), en Alibaba (groothandel). Trendvinder vergelijkt automatisch prijzen bij al deze leveranciers via image search technologie. Lees onze <Link href="/blog/aliexpress-vs-cjdropshipping">leveranciers vergelijking</Link>.</p>
          </details>
          <details className="faq-item">
            <summary>Is Trendvinder gratis te gebruiken?</summary>
            <p>Ja, je kunt gratis starten met het Starter plan. Dit geeft je 5 zoekopdrachten per dag, Winning Score analyse, Google Trends data en leveranciers vergelijking. Voor onbeperkt zoeken, email alerts en CSV export kun je upgraden naar Pro (€29/maand) of Business (€79/maand). Geen creditcard nodig om te starten.</p>
          </details>
          <details className="faq-item">
            <summary>Welke producten zijn niet geschikt voor dropshipping?</summary>
            <p>Merkproducten (Nike, Apple, Samsung, Philips, Nivea, etc.) zijn niet geschikt omdat je ze niet mag doorverkopen zonder toestemming van de merkhouder. Trendvinder filtert automatisch 200+ merken zodat je alleen producten ziet die echt geschikt zijn voor dropshipping — zonder risico op merkrechten problemen.</p>
          </details>
          <details className="faq-item">
            <summary>Kan ik dropshipping doen via Bol.com?</summary>
            <p>Ja, Bol.com staat dropshipping toe mits je aan hun voorwaarden voldoet: levertijd maximaal 8 werkdagen, klantenservice in het Nederlands, en je bent zelf verantwoordelijk voor retouren. De platformkosten zijn ongeveer 10%. Lees onze <Link href="/blog/dropshipping-bol-com">complete Bol.com gids</Link> voor meer informatie.</p>
          </details>
          <details className="faq-item">
            <summary>Hoe lang duurt de verzending bij dropshipping?</summary>
            <p>De verzendtijd hangt af van je leverancier: CJDropshipping (7-15 dagen), ePacket (10-20 dagen), AliExpress Standard (15-30 dagen), en DHL Express (3-7 dagen). Voor Bol.com heb je snelle verzending nodig (max 8 dagen). Wij raden CJDropshipping of ePacket aan voor de beste balans tussen prijs en snelheid.</p>
          </details>
          <details className="faq-item">
            <summary>Wat kost het om met dropshipping te beginnen?</summary>
            <p>Je kunt starten met minder dan €100. De kosten: Shopify webshop (€36/maand), eerste producten testen (€20-50 advertentiebudget), en Trendvinder voor product research (gratis). Je hoeft geen voorraad in te kopen — je bestelt pas als een klant koopt.</p>
          </details>
          <details className="faq-item">
            <summary>Wat is de Winning Score bij Trendvinder?</summary>
            <p>De Winning Score is een getal van 0-100 dat berekent hoe geschikt een product is voor dropshipping. Het combineert echte verkoopcijfers van Amazon NL, Google Trends data (90 dagen), winstmarge, rating en concurrentie. Een score boven 70 is een potentieel winnend product.</p>
          </details>
        </div>
      </div>

      {/* Dropshipping tips */}
      <div className="seo-tips">
        <h2>Dropshipping tips voor beginners in 2026</h2>
        <div className="tips-grid">
          <article className="tip-card">
            <h3>1. Begin met één niche</h3>
            <p>Focus op één productcategorie in plaats van alles te verkopen. Dit maakt je marketing gerichter, je expertise groter en je webshop betrouwbaarder. Populaire niches in 2026: huisdier accessoires, auto gadgets, home fitness en telefoon accessoires.</p>
          </article>
          <article className="tip-card">
            <h3>2. Test met kleine budgetten</h3>
            <p>Besteed niet meteen honderden euro's aan advertenties. Begin met €5-10 per dag op TikTok of Facebook, test 3-5 producten, en schaal op wat werkt. Onze Winning Score helpt je de juiste producten te kiezen zodat je minder verspilt aan tests.</p>
          </article>
          <article className="tip-card">
            <h3>3. Kies snelle verzending</h3>
            <p>Klanten verwachten levering binnen 7-10 dagen. Gebruik CJDropshipping of ePacket voor de snelste verzending. Vermijd standaard AliExpress verzending (15-30 dagen) — de besparingen wegen niet op tegen de negatieve reviews.</p>
          </article>
          <article className="tip-card">
            <h3>4. Bereken je marge vooraf</h3>
            <p>Veel beginners vergeten kosten als platformfees, advertenties en BTW. Een product dat €10 kost en je voor €30 verkoopt lijkt winstgevend, maar na alle kosten houd je misschien maar €3 over. Gebruik altijd een winstcalculator.</p>
          </article>
          <article className="tip-card">
            <h3>5. Volg de trends</h3>
            <p>Producten die trending zijn op TikTok verkopen 3-5x beter dan willekeurige producten. Gebruik Trendvinder's Social Trends om te zien wat nu viraal gaat en spring er vroeg op in — voordat je concurrenten hetzelfde doen. Lees meer over <Link href="/blog/tiktok-ads-dropshipping">TikTok Ads strategie</Link>.</p>
          </article>
          <article className="tip-card">
            <h3>6. Vermijd merkproducten</h3>
            <p>Verkoop nooit namaak of merkproducten (Nike, Apple, etc.). Dit kan leiden tot juridische problemen, account bans en boetes. Focus op merkloze producten — die zijn goedkoper in te kopen en je hebt geen merkrechten issues.</p>
          </article>
        </div>
      </div>

      {/* Supported platforms */}
      <div className="seo-platforms">
        <h2>Werkt met alle dropshipping platforms</h2>
        <p className="seo-platforms-sub">Bereken je winstmarge voor elk platform met onze ingebouwde calculator</p>
        <div className="platforms-grid">
          <div className="platform-card">
            <strong>Shopify</strong>
            <span>2.9% + €0.30 per transactie</span>
          </div>
          <div className="platform-card">
            <strong>Bol.com</strong>
            <span>~10% commissie per verkoop</span>
          </div>
          <div className="platform-card">
            <strong>Amazon</strong>
            <span>~15% commissie per verkoop</span>
          </div>
          <div className="platform-card">
            <strong>Etsy</strong>
            <span>6.5% + €0.20 per transactie</span>
          </div>
          <div className="platform-card">
            <strong>Eigen webshop</strong>
            <span>~2% betaalkosten</span>
          </div>
        </div>
      </div>

      {/* Blog CTA — interne links voor SEO */}
      <div className="seo-blog-cta">
        <h2>Leer meer over dropshipping</h2>
        <p>Lees onze gratis gidsen en tips in de Trendvinder blog.</p>
        <div className="blog-cta-grid">
          <Link href="/blog/dropshipping-beginnen-2026" className="blog-cta-card">
            <h3>Dropshipping beginnen in 2026</h3>
            <p>Complete stap-voor-stap gids voor beginners</p>
          </Link>
          <Link href="/blog/beste-dropshipping-producten-2026" className="blog-cta-card">
            <h3>25 Beste producten 2026</h3>
            <p>De meest winstgevende producten met echte data</p>
          </Link>
          <Link href="/blog/aliexpress-vs-cjdropshipping" className="blog-cta-card">
            <h3>AliExpress vs CJDropshipping</h3>
            <p>Welke leverancier is het beste voor jou?</p>
          </Link>
          <Link href="/blog/dropshipping-bol-com" className="blog-cta-card">
            <h3>Dropshipping via Bol.com</h3>
            <p>Regels, kosten en tips voor Bol.com</p>
          </Link>
          <Link href="/blog/tiktok-ads-dropshipping" className="blog-cta-card">
            <h3>TikTok Ads strategie</h3>
            <p>Budget, targeting en creatives voor beginners</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SEOContent;
