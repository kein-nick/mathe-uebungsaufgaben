import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parentIntro, groupDescriptions, topicDescriptions } from "./landing-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const topicsSrc = fs.readFileSync(path.join(root, "topics.js"), "utf8");
const practiceTemplatePath = path.join(root, "klasse-1", "uebungen.html");
const practiceTemplate = fs.readFileSync(practiceTemplatePath, "utf8");
const block = topicsSrc.slice(topicsSrc.indexOf("const topics = ["));

const topics = [];
const topicRe =
  /id: "([^"]+)",\s*\n\s*label: "([^"]+)",\s*\n\s*group: "([^"]+)",\s*\n\s*fromGrade: (\d+),\s*\n\s*fromTerm: (\d+)(?:,\s*\n\s*untilGrade: (\d+))?(?:,\s*\n\s*untilTerm: (\d+))?/g;

let match;
while ((match = topicRe.exec(block)) !== null) {
  topics.push({
    id: match[1],
    label: match[2],
    group: match[3],
    fromGrade: Number(match[4]),
    fromTerm: Number(match[5]),
    untilGrade: match[6] ? Number(match[6]) : null,
    untilTerm: match[7] ? Number(match[7]) : null,
  });
}

const GROUPS = {
  rechnen: "Rechnen",
  zahlen: "Zahlen",
  groessen: "Größen",
  geometrie: "Geometrie",
};

const classIntros = {
  1: "In Klasse 1 geht es um erste Zahlen, Plus und Minus bis 20 sowie einfache Vergleiche und Zerlegen.",
  2: "In Klasse 2 vertiefst du Plus und Minus, lernst das Einmaleins und erste Größen wie Geld und Uhr.",
  3: "In Klasse 3 kommen größere Zahlen, schriftliches Rechnen, Tabellen und erste Sachaufgaben dazu.",
  4: "In Klasse 4 übst du schriftliche Verfahren, Bruchanteile, Geometrie und Größen umrechnen.",
  5: "In Klasse 5 vertiefst du Brüche, Dezimalzahlen, Prozent und anspruchsvollere Sachaufgaben.",
  6: "In Klasse 6 bereitest du dich auf die weiterführende Schule vor: Brüche, Prozent, Dreisatz und mehr.",
};

const classDetails = {
  1: "Typisch für Klasse 1 sind Aufgaben im Zahlenraum bis 20. Kinder rechnen Plus und Minus, vergleichen Zahlen und lösen erste kurze Textaufgaben. Viele Übungen sind bewusst kleinschrittig — so wie es heute in den meisten Grundschulen eingeführt wird.",
  2: "In Klasse 2 wächst der Zahlenraum bis 100, das Einmaleins wird aufgebaut und erste Sachaufgaben werden länger. Eltern merken oft: Die Aufgaben sehen noch vertraut aus, aber die Reihenfolge der Themen und die Begriffe können anders sein als früher.",
  3: "Klasse 3 bedeutet größere Zahlen, schriftliches Rechnen und mehr Schritte pro Aufgabe. Punkt vor Strich, Tabellen lesen und Größen wie Länge oder Gewicht kommen dazu — Themen, bei denen eine Übersicht besonders hilft.",
  4: "In Klasse 4 stehen schriftliche Verfahren, Bruchanteile und anspruchsvollere Sachaufgaben im Fokus. Geometrie und Größen werden präziser; Kinder sollen nicht nur rechnen, sondern auch begründen, warum ein Ergebnis passt.",
  5: "Klasse 5 bringt Brüche, Dezimalzahlen und Prozent zusammen — oft in gemischten Aufgaben. Gleichungen, Dreisatz und Winkel sind typische Themen, die Eltern manchmal erst wieder mit dem Kind neu lernen.",
  6: "In Klasse 6 wird vieles wiederholt und vertieft, was für die weiterführende Schule wichtig ist. Die Aufgaben werden länger, die Zahlen größer, und Sachaufgaben verlangen mehrere Rechenschritte und gutes Lesen.",
};

const groupOrder = ["rechnen", "zahlen", "groessen", "geometrie"];

function isTopicListed(topic, grade) {
  if (topic.untilGrade != null && grade > topic.untilGrade) {
    return false;
  }
  return topic.fromGrade <= grade + 1;
}

function isTopicAllowed(topic, grade, term) {
  if (grade < topic.fromGrade) {
    return false;
  }
  if (grade === topic.fromGrade && term < topic.fromTerm) {
    return false;
  }
  if (topic.untilGrade != null && grade > topic.untilGrade) {
    return false;
  }
  if (
    topic.untilGrade != null &&
    grade === topic.untilGrade &&
    topic.untilTerm != null &&
    term > topic.untilTerm
  ) {
    return false;
  }
  return true;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SITE_URL = "https://mathe-testen.de";
const SITE_NAME = "Mathematik Übungsaufgaben";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function renderOpenGraph({ title, description, url, imageAlt }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageAlt = escapeHtml(imageAlt);
  return `    <meta property="og:type" content="website" />
    <meta property="og:locale" content="de_DE" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1536" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:alt" content="${safeImageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${safeImageAlt}" />`;
}

function renderJsonLdScript(data) {
  const json = JSON.stringify(data, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  return `    <script type="application/ld+json">
${json}
    </script>`;
}

function classPageMeta(grade) {
  return {
    title: `Mathe Klasse ${grade} – Themen erklärt & üben`,
    description: `Mathe Klasse ${grade} erklärt: Themen, Rechenarten und Kategorien für Eltern — plus kostenlose Übungsaufgaben online und als PDF.`,
    url: `${SITE_URL}/klasse-${grade}`,
    imageAlt: `Mathe Klasse ${grade} – Themen und Übungsaufgaben`,
  };
}

function renderHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
          "Mathe-Übungen für Klasse 1 bis 6: Orientierung für Eltern, Themen nach Klassenstufe — kostenlos online üben oder als PDF.",
        inLanguage: "de-DE",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
      },
    ],
  };
}

function renderClassJsonLd(grade) {
  const meta = classPageMeta(grade);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${meta.url}/#webpage`,
        url: meta.url,
        name: meta.title,
        description: meta.description,
        inLanguage: "de-DE",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${meta.url}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Startseite",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `Klasse ${grade}`,
            item: meta.url,
          },
        ],
      },
    ],
  };
}

function renderHeadAssets(cssPath = "/style.css") {
  return `    <link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${cssPath}" as="style" />
    <link rel="stylesheet" href="${cssPath}" />`;
}

const VIEWPORT_META =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />';

function renderDeviceMeta({ withManifest = false } = {}) {
  return `${VIEWPORT_META}
    <meta name="theme-color" content="#2f5d50" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Mathe" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />${
      withManifest ? '\n    <link rel="manifest" href="/manifest.webmanifest" />' : ""
    }`;
}

function practiceUrl(grade) {
  return `/klasse-${grade}/uebungen`;
}

function renderHomeClassSummaries() {
  return [1, 2, 3, 4, 5, 6]
    .map((grade) => {
      const categories = groupOrder
        .map(
          (groupId) => `<div class="home-category">
        <h4>${escapeHtml(GROUPS[groupId])}</h4>
        <p>${escapeHtml(groupDescriptions[grade][groupId])}</p>
      </div>`
        )
        .join("\n");

      return `<section class="home-class-card" id="home-klasse-${grade}">
      <h3><a href="/klasse-${grade}">Klasse ${grade}</a></h3>
      <p class="home-class-intro">${escapeHtml(classIntros[grade])}</p>
      <div class="home-categories">${categories}</div>
      <p class="page-actions">
        <a class="btn-secondary" href="/klasse-${grade}">Rechenarten im Detail</a>
        <a class="btn-primary" href="${practiceUrl(grade)}">Zu den Übungsaufgaben</a>
      </p>
    </section>`;
    })
    .join("\n");
}

function renderHomeMain() {
  return `<main class="legal-page landing-page home-page">
          <p class="landing-lead landing-parent-intro">${escapeHtml(parentIntro)}</p>

          <section aria-labelledby="home-classes-heading">
            <h2 id="home-classes-heading">Was in den einzelnen Klassen geübt wird</h2>
            <p class="landing-overview-hint">
              Mathe in der Grundschule ist in vier Bereiche gegliedert: Rechnen, Zahlen, Größen und Geometrie.
              Unten siehst du für jede Klassenstufe, welche Schwerpunkte typisch sind — ausführliche Erklärungen
              zu jeder Rechenart findest du auf der jeweiligen Klassenseite.
            </p>
            ${renderHomeClassSummaries()}
          </section>
        </main>`;
}

function updateHomePage() {
  const indexPath = path.join(root, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const start = "<!-- home-main:start -->";
  const end = "<!-- home-main:end -->";
  const replacement = `<!-- home-main:start -->\n        ${renderHomeMain().trim()}\n        <!-- home-main:end -->`;
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), replacement);

  const jsonLdBlock = `${renderJsonLdScript(renderHomeJsonLd())}\n`;
  const jsonLdStart = "<!-- seo-json-ld:start -->";
  const jsonLdEnd = "<!-- seo-json-ld:end -->";
  if (html.includes(jsonLdStart)) {
    html = html.replace(
      new RegExp(`${jsonLdStart}[\\s\\S]*?${jsonLdEnd}`),
      `${jsonLdStart}\n${jsonLdBlock}    ${jsonLdEnd}`
    );
  } else {
    html = html.replace("</head>", `${jsonLdStart}\n${jsonLdBlock}    ${jsonLdEnd}\n  </head>`);
  }

  const headAssetsStart = "<!-- head-assets:start -->";
  const headAssetsEnd = "<!-- head-assets:end -->";
  const headAssetsBlock = `${renderHeadAssets("style.css")}\n`;
  if (html.includes(headAssetsStart)) {
    html = html.replace(
      new RegExp(`${headAssetsStart}[\\s\\S]*?${headAssetsEnd}`),
      `${headAssetsStart}\n${headAssetsBlock}    ${headAssetsEnd}`
    );
  }

  fs.writeFileSync(indexPath, html, "utf8");
  console.log("updated index.html");
}

function renderClassNav(currentGrade = 0) {
  const items = [1, 2, 3, 4, 5, 6]
    .map(
      (n) =>
        `<a class="grade-btn grade-btn-nav" href="/klasse-${n}"${
          n === currentGrade ? ' aria-current="page"' : ""
        }>Klasse ${n}</a>`
    )
    .join("\n");
  return `<nav class="class-nav-grid" aria-label="Klassenstufen">${items}</nav>`;
}

function topicAvailabilityNote(topic, grade) {
  const term1 = isTopicAllowed(topic, grade, 1);
  const term2 = isTopicAllowed(topic, grade, 2);

  if (!term1 && !term2) {
    return `Vorschau — ab Klasse ${topic.fromGrade}`;
  }
  if (term1 && !term2) {
    return "Typisch im 1. Halbjahr";
  }
  if (!term1 && term2) {
    return "Ab dem 2. Halbjahr";
  }
  return "";
}

function renderTopicOverview(grade) {
  return groupOrder
    .map((groupId) => {
      const items = topics.filter((topic) => topic.group === groupId && isTopicListed(topic, grade));
      const active = items.filter(
        (topic) => isTopicAllowed(topic, grade, 1) || isTopicAllowed(topic, grade, 2)
      );
      const preview = items.filter((topic) => !active.includes(topic));

      if (!active.length && !preview.length) {
        return "";
      }

      const groupIntro = groupDescriptions[grade]?.[groupId] || "";
      const topicItems = [...active, ...preview]
        .map((topic) => {
          const description = topicDescriptions[topic.id] || "Übungen zu diesem Thema im passenden Schwierigkeitsgrad.";
          const note = topicAvailabilityNote(topic, grade);
          return `<li class="landing-topic-detail">
              <h4>${escapeHtml(topic.label)}</h4>
              <p>${escapeHtml(description)}</p>
              ${note ? `<p class="hint landing-topic-note">${escapeHtml(note)}</p>` : ""}
            </li>`;
        })
        .join("\n");

      return `<section class="landing-category">
          <h3>${escapeHtml(GROUPS[groupId])}</h3>
          <p class="landing-category-intro">${escapeHtml(groupIntro)}</p>
          <ul class="landing-topic-details">${topicItems}</ul>
        </section>`;
    })
    .filter(Boolean)
    .join("\n");
}

function extractInstallPrompt() {
  const start = practiceTemplate.indexOf('<aside class="install-banner');
  if (start === -1) {
    throw new Error("Install-Banner nicht in Übungsvorlage gefunden.");
  }
  const iosDialogStart = practiceTemplate.indexOf(
    '<dialog class="success-dialog install-ios-dialog"'
  );
  const end = practiceTemplate.indexOf("</dialog>", iosDialogStart) + "</dialog>".length;
  return practiceTemplate.slice(start, end);
}

const installPromptHtml = extractInstallPrompt();

const pwaScripts = `    <script defer src="/pwa.js"></script>
    <script>
      window.va =
        window.va ||
        function () {
          (window.vaq = window.vaq || []).push(arguments);
        };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;

function extractAppFragments() {
  const setupStart = practiceTemplate.indexOf('<section class="setup"');
  const footerStart = practiceTemplate.indexOf("<footer class=\"site-footer\">");
  const appMain = practiceTemplate.slice(setupStart, footerStart);

  const dialogStart = practiceTemplate.indexOf('<dialog class="success-dialog"');
  const scriptStart = practiceTemplate.indexOf('<script src="/topics.js">');
  const appDialogs = practiceTemplate.slice(dialogStart, scriptStart);

  const scripts = `    <script src="/topics.js"></script>
    <script src="/script.js"></script>
    <script defer src="/pwa.js"></script>
    <script>
      window.va =
        window.va ||
        function () {
          (window.vaq = window.vaq || []).push(arguments);
        };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;

  return { appMain, appDialogs, scripts };
}

const { appMain, appDialogs, scripts } = extractAppFragments();

function renderClassPage(grade) {
  const topicOverview = renderTopicOverview(grade);
  const meta = classPageMeta(grade);

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    ${renderDeviceMeta({ withManifest: true })}
    <meta
      name="description"
      content="${escapeHtml(meta.description)}"
    />
    <link rel="canonical" href="${meta.url}" />
${renderOpenGraph(meta)}
    <title>${escapeHtml(meta.title)}</title>
    ${renderJsonLdScript(renderClassJsonLd(grade))}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${renderHeadAssets()}
  </head>
  <body class="ads-off class-page-body">
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          <p class="kicker"><a class="text-link" href="/">Zur Startseite</a></p>
          <h1>Mathe üben – Klasse ${grade}</h1>
          <p class="description">${classIntros[grade]}</p>
          ${renderClassNav(grade)}
        </header>

        <main class="legal-page landing-page">
          <p class="landing-lead">${classDetails[grade]}</p>

          <section class="landing-topics-overview" aria-labelledby="topics-heading-${grade}">
            <h2 id="topics-heading-${grade}">Kategorien und Rechenarten in Klasse ${grade}</h2>
            <p class="landing-overview-hint">
              In der Grundschule wird Mathe oft in vier Bereiche gegliedert. Hier siehst du,
              was dahinter steckt — und welche konkreten Übungstypen es für diese Klasse gibt.
            </p>
            ${topicOverview}
          </section>
        </main>

        <footer class="site-footer">
          <nav aria-label="Rechtliches">
            <a href="/">Startseite</a>
            <span aria-hidden="true">·</span>
            <a href="/impressum">Impressum</a>
            <span aria-hidden="true">·</span>
            <a href="/datenschutz">Datenschutz</a>
          </nav>
        </footer>
      </div>
    </div>

    <aside class="class-page-cta" aria-label="Übungen starten">
      <a class="btn-primary class-page-cta-btn" href="${practiceUrl(grade)}">Zu den Übungsaufgaben</a>
    </aside>

    ${installPromptHtml}
    ${pwaScripts}
  </body>
</html>`;
}

function renderPracticePage(grade) {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    ${renderDeviceMeta({ withManifest: true })}
    <meta
      name="description"
      content="Mathe-Übungen für Klasse ${grade}: Halbjahr, Anzahl und Themen wählen — online üben oder Arbeitsblatt als PDF."
    />
    <link rel="canonical" href="https://mathe-testen.de/klasse-${grade}/uebungen" />
    <title>Übungsaufgaben Klasse ${grade} – online &amp; als PDF</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${renderHeadAssets()}
  </head>
  <body class="ads-off practice-page-body" data-locked-grade="${grade}">
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          <p class="kicker">
            <a class="text-link" href="/klasse-${grade}">Zurück zur Übersicht Klasse ${grade}</a>
          </p>
          <h1>Übungsaufgaben – Klasse ${grade}</h1>
          <p class="description">
            Wähle Halbjahr, Anzahl und Themen — dann erstellst du dein Übungsblatt.
            Kostenlos online üben oder als PDF drucken.
          </p>
          ${renderClassNav(grade)}
        </header>

        ${appMain}

        <footer class="site-footer">
          <nav aria-label="Rechtliches">
            <a href="/">Startseite</a>
            <span aria-hidden="true">·</span>
            <a href="/klasse-${grade}">Klasse ${grade}</a>
            <span aria-hidden="true">·</span>
            <a href="/impressum">Impressum</a>
            <span aria-hidden="true">·</span>
            <a href="/datenschutz">Datenschutz</a>
          </nav>
        </footer>
      </div>
    </div>

    ${appDialogs}
    ${scripts}
  </body>
</html>`;
}

function updateSitemap() {
  const sitemapPath = path.join(root, "sitemap.xml");
  let sitemap = fs.readFileSync(sitemapPath, "utf8");

  for (let grade = 1; grade <= 6; grade += 1) {
    const classEntry = `  <url>
    <loc>https://mathe-testen.de/klasse-${grade}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    const practiceEntry = `  <url>
    <loc>https://mathe-testen.de/klasse-${grade}/uebungen</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    if (!sitemap.includes(`/klasse-${grade}</loc>`)) {
      sitemap = sitemap.replace("</urlset>", `${classEntry}\n</urlset>`);
    }
    if (!sitemap.includes(`/klasse-${grade}/uebungen</loc>`)) {
      sitemap = sitemap.replace("</urlset>", `${practiceEntry}\n</urlset>`);
    }
  }

  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

for (let grade = 1; grade <= 6; grade += 1) {
  const landingPath = path.join(root, `klasse-${grade}.html`);
  fs.writeFileSync(landingPath, renderClassPage(grade), "utf8");
  console.log("wrote", landingPath);

  const practiceDir = path.join(root, `klasse-${grade}`);
  fs.mkdirSync(practiceDir, { recursive: true });
  const practicePath = path.join(practiceDir, "uebungen.html");
  fs.writeFileSync(practicePath, renderPracticePage(grade), "utf8");
  console.log("wrote", practicePath);
}

updateHomePage();
updateSitemap();
console.log("done");
