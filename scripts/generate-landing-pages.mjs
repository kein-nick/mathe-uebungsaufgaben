import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parentIntro, groupDescriptions, topicDescriptions, siteFaqs, teachersPage, parentsPage } from "./landing-content.mjs";
import { topicHubs } from "./hub-content.mjs";

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
  1: "In Klasse 1 geht es um erste Zahlen, Plus und Minus bis 20 sowie einfache Vergleiche und Zerlegungen.",
  2: "In Klasse 2 vertiefst du Plus und Minus, lernst das Einmaleins und erste Größen wie Geld und Uhr.",
  3: "In Klasse 3 kommen größere Zahlen, schriftliches Rechnen, Tabellen und erste Sachaufgaben dazu.",
  4: "In Klasse 4 übst du schriftliche Verfahren, Bruchanteile, Geometrie und das Umrechnen von Größen.",
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

function renderSiteHeader(current = "") {
  const brandCurrent = current === "home" ? ' aria-current="page"' : "";
  const faqCurrent = current === "faq" ? ' aria-current="page"' : "";
  const parentsCurrent = current === "eltern" ? ' aria-current="page"' : "";
  const teachersCurrent = current === "lehrkraefte" ? ' aria-current="page"' : "";
  return `<header class="site-header">
    <div class="site-header-inner">
      <a class="site-header-brand" href="/"${brandCurrent}>Mathe üben</a>
      <nav class="site-header-nav" aria-label="Weitere Seiten">
        <a href="/faq"${faqCurrent}>FAQ</a>
        <a href="/fuer-eltern"${parentsCurrent}>Eltern</a>
        <a href="/fuer-lehrkraefte"${teachersCurrent}>Lehrkräfte</a>
      </nav>
    </div>
  </header>`;
}

function renderSiteFooter(current = "", extraItems = []) {
  const items = [
    { href: "/", id: "home", label: "Startseite" },
    ...extraItems,
    { href: "/faq", id: "faq", label: "FAQ" },
    { href: "/fuer-eltern", id: "eltern", label: "Für Eltern" },
    { href: "/fuer-lehrkraefte", id: "lehrkraefte", label: "Für Lehrkräfte" },
    { href: "/impressum", id: "impressum", label: "Impressum" },
    { href: "/datenschutz", id: "datenschutz", label: "Datenschutz" },
  ];
  const links = items
    .map((item, index) => {
      const currentAttr = item.id === current ? ' aria-current="page"' : "";
      const sep = index === 0 ? "" : `\n            <span aria-hidden="true">·</span>\n            `;
      return `${sep}<a href="${item.href}"${currentAttr}>${escapeHtml(item.label)}</a>`;
    })
    .join("");
  return `<footer class="site-footer">
          <nav aria-label="Weitere Seiten">
            ${links}
          </nav>
        </footer>`;
}

function renderFaqItems(items = siteFaqs) {
  return items
    .map((item) => {
      const body = item.html || `<p>${escapeHtml(item.a)}</p>`;
      return `<div class="hub-faq-item">
            <h3>${escapeHtml(item.q)}</h3>
            ${body}
          </div>`;
    })
    .join("\n");
}

function renderFaqJsonLd() {
  const url = `${SITE_URL}/faq`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: "Häufige Fragen – Mathe üben Klasse 1–6",
        description:
          "Antworten zu mathe-testen.de: kostenlos, ohne Anmeldung, PDF-Druck, Klassen 1 bis 6, gemischte Aufgaben und 10er-Blöcke.",
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: siteFaqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "FAQ", item: url },
        ],
      },
    ],
  };
}

function renderTeachersJsonLd() {
  const url = `${SITE_URL}/fuer-lehrkraefte`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: teachersPage.title,
        description: teachersPage.description,
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        audience: {
          "@type": "Audience",
          audienceType: "Lehrkräfte",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Für Lehrkräfte", item: url },
        ],
      },
    ],
  };
}

function renderParentsJsonLd() {
  const url = `${SITE_URL}/fuer-eltern`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: parentsPage.title,
        description: parentsPage.description,
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        audience: {
          "@type": "Audience",
          audienceType: "Eltern",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: parentsPage.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Für Eltern", item: url },
        ],
      },
    ],
  };
}

function renderInfoPage({ current, title, description, url, h1, lead, jsonLd, mainHtml }) {
  const meta = { title, description, url, imageAlt: title };
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    ${renderDeviceMeta({ withManifest: true })}
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
${renderOpenGraph(meta)}
    <title>${escapeHtml(title)}</title>
    ${renderJsonLdScript(jsonLd)}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${renderHeadAssets()}
  </head>
  <body class="ads-off legal-page-body">
    ${renderSiteHeader(current)}
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          <h1>${escapeHtml(h1)}</h1>
          <p class="description">${escapeHtml(lead)}</p>
        </header>
        ${mainHtml}
        ${renderSiteFooter(current)}
      </div>
    </div>
    ${installPromptHtml}
    ${pwaScripts}
  </body>
</html>`;
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
  const versionedCss = cssPath.includes("?")
    ? cssPath
    : `${cssPath}${cssPath.includes("style.css") ? "?v=31" : ""}`;
  return `    <link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${versionedCss}" as="style" />
    <link rel="stylesheet" href="${versionedCss}" />`;
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

function practiceUrlWithTopics(grade, topicIds) {
  const themen = topicIds.join(",");
  return `/klasse-${grade}/uebungen?themen=${encodeURIComponent(themen)}`;
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
  const hubLinks = topicHubs
    .map(
      (hub) =>
        `<li><a href="/${hub.slug}">${escapeHtml(hub.shortName)}</a> — ${escapeHtml(
          hub.metaDescription.split("—")[0].trim().replace(/\.$/, "")
        )}</li>`
    )
    .join("\n");

  return `<main class="legal-page landing-page home-page">
          <p class="landing-lead landing-parent-intro">${escapeHtml(parentIntro)}</p>

          <section aria-labelledby="home-topics-heading">
            <h2 id="home-topics-heading">Beliebte Übungsthemen</h2>
            <p class="landing-overview-hint">
              Du suchst etwas Bestimmtes — Einmaleins, Brüche, Sachaufgaben?
              Hier findest du Themen-Seiten mit Erklärung und direkten Übungslinks nach Klasse.
            </p>
            <ul class="home-topic-hubs">
              ${hubLinks}
            </ul>
          </section>

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

  html = injectHomeChrome(html);
  fs.writeFileSync(indexPath, html, "utf8");
  console.log("updated index.html");
}

function injectHomeChrome(html) {
  const headerBlock = `    <!-- site-header:start -->
    ${renderSiteHeader("home")}
    <!-- site-header:end -->`;
  const headerStart = "<!-- site-header:start -->";
  const headerEnd = "<!-- site-header:end -->";
  if (html.includes(headerStart)) {
    html = html.replace(new RegExp(`${headerStart}[\\s\\S]*?${headerEnd}`), headerBlock.trim());
  } else {
    html = html.replace(
      '<body class="ads-off home-page-body">',
      `<body class="ads-off home-page-body">\n${headerBlock}`
    );
  }

  const footerBlock = `        <!-- site-footer:start -->
        ${renderSiteFooter("home")}
        <!-- site-footer:end -->`;
  const footerStart = "<!-- site-footer:start -->";
  const footerEnd = "<!-- site-footer:end -->";
  if (html.includes(footerStart)) {
    html = html.replace(new RegExp(`${footerStart}[\\s\\S]*?${footerEnd}`), footerBlock.trim());
  } else {
    html = html.replace(
      /<footer class="site-footer">[\s\S]*?<\/footer>/,
      footerBlock.trim()
    );
  }
  return html;
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
  const scriptStart = practiceTemplate.search(/<script src="\/topics\.js[^"]*">/);
  if (scriptStart < 0) {
    throw new Error("topics.js script tag not found in practice template");
  }
  const appDialogs = practiceTemplate.slice(dialogStart, scriptStart);

  const scripts = `    <script src="/topics.js?v=25"></script>
    <script src="/script.js?v=31"></script>
    <script defer src="/pwa.js?v=31"></script>
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
    ${renderSiteHeader()}
    <div class="page-shell">
      <div class="page">
        <header class="intro">
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

        ${renderSiteFooter()}
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
    ${renderSiteHeader()}
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

        ${renderSiteFooter("", [{ href: `/klasse-${grade}`, id: `klasse-${grade}`, label: `Klasse ${grade}` }])}
      </div>
    </div>

    ${appDialogs}
    ${scripts}
  </body>
</html>`;
}

function renderHubJsonLd(hub) {
  const url = `${SITE_URL}/${hub.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: hub.title,
        description: hub.metaDescription,
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "Thing",
          name: hub.shortName,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: hub.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
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
            name: hub.shortName,
            item: url,
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${url}/#howto`,
        name: `${hub.shortName} auf mathe-testen.de üben`,
        description: hub.howItWorks,
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Klasse wählen",
            text: "Wähle unten die passende Klassenstufe.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Übungsblatt erstellen",
            text: "Themen sind vorausgewählt. Anzahl festlegen und Blatt erzeugen.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Online üben oder PDF drucken",
            text: "Aufgaben digital lösen und prüfen oder als PDF ausdrucken — kostenlos und ohne Anmeldung.",
          },
        ],
      },
    ],
  };
}

function renderHubPage(hub) {
  const url = `${SITE_URL}/${hub.slug}`;
  const meta = {
    title: hub.title,
    description: hub.metaDescription,
    url,
    imageAlt: `${hub.shortName} üben – Mathematik Übungsaufgaben`,
  };

  const gradeButtons = hub.grades
    .map(
      (grade) =>
        `<a class="grade-btn grade-btn-nav" href="${practiceUrlWithTopics(
          grade,
          hub.topicIds
        )}">Klasse ${grade}</a>`
    )
    .join("\n");

  const faqItems = hub.faqs
    .map(
      (item) => `<div class="hub-faq-item">
            <h3>${escapeHtml(item.q)}</h3>
            <p>${escapeHtml(item.a)}</p>
          </div>`
    )
    .join("\n");

  const related = topicHubs
    .filter((other) => other.slug !== hub.slug)
    .slice(0, 6)
    .map((other) => `<li><a href="/${other.slug}">${escapeHtml(other.shortName)}</a></li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    ${renderDeviceMeta({ withManifest: true })}
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${url}" />
${renderOpenGraph(meta)}
    <title>${escapeHtml(meta.title)}</title>
    ${renderJsonLdScript(renderHubJsonLd(hub))}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${renderHeadAssets()}
  </head>
  <body class="ads-off hub-page-body">
    ${renderSiteHeader()}
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          <h1>${escapeHtml(hub.h1)}</h1>
          <p class="description">${escapeHtml(hub.lead)}</p>
        </header>

        <main class="legal-page landing-page hub-page">
          <p class="landing-lead hub-answer">
            <strong>${escapeHtml(hub.shortName)} üben auf mathe-testen.de:</strong>
            kostenlos, ohne Anmeldung, online oder als PDF — für Eltern, Kinder und Lehrkräfte.
          </p>

          <section aria-labelledby="hub-what-${hub.slug}">
            <h2 id="hub-what-${hub.slug}">${escapeHtml(hub.whatHeading)}</h2>
            <p>${escapeHtml(hub.whatIs)}</p>
          </section>

          <section aria-labelledby="hub-why-${hub.slug}">
            <h2 id="hub-why-${hub.slug}">Warum gezielt üben?</h2>
            <p>${escapeHtml(hub.whyPractice)}</p>
          </section>

          <section aria-labelledby="hub-how-${hub.slug}">
            <h2 id="hub-how-${hub.slug}">So funktioniert’s</h2>
            <p>${escapeHtml(hub.howItWorks)}</p>
          </section>

          <section aria-labelledby="hub-who-${hub.slug}">
            <h2 id="hub-who-${hub.slug}">Für wen ist das gedacht?</h2>
            <p>${escapeHtml(hub.forWhom)}</p>
          </section>

          <section class="hub-grades" id="hub-start" aria-labelledby="hub-grades-${hub.slug}">
            <h2 id="hub-grades-${hub.slug}">${escapeHtml(hub.shortName)} üben — Klasse wählen</h2>
            <p class="landing-overview-hint">
              Die Themen sind auf der Übungsseite vorausgewählt. Du kannst sie dort noch anpassen.
            </p>
            <nav class="class-nav-grid hub-grade-nav" aria-label="Klassen für ${escapeHtml(hub.shortName)}">
              ${gradeButtons}
            </nav>
          </section>

          <section class="hub-faq" aria-labelledby="hub-faq-${hub.slug}">
            <h2 id="hub-faq-${hub.slug}">Häufige Fragen</h2>
            ${faqItems}
          </section>

          <section aria-labelledby="hub-related-${hub.slug}">
            <h2 id="hub-related-${hub.slug}">Weitere Themen</h2>
            <ul class="hub-related-list">${related}</ul>
          </section>
        </main>

        ${renderSiteFooter()}
      </div>
    </div>

    <aside class="class-page-cta" aria-label="Zur Klassenwahl">
      <a class="btn-primary class-page-cta-btn" href="#hub-start">Klasse wählen und üben</a>
    </aside>

    ${installPromptHtml}
    ${pwaScripts}
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

  for (const hub of topicHubs) {
    const hubEntry = `  <url>
    <loc>https://mathe-testen.de/${hub.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`;
    if (!sitemap.includes(`/${hub.slug}</loc>`)) {
      sitemap = sitemap.replace("</urlset>", `${hubEntry}\n</urlset>`);
    }
  }

  const extraPages = [
    { loc: "https://mathe-testen.de/faq", priority: "0.7" },
    { loc: "https://mathe-testen.de/fuer-eltern", priority: "0.7" },
    { loc: "https://mathe-testen.de/fuer-lehrkraefte", priority: "0.7" },
  ];
  for (const page of extraPages) {
    if (!sitemap.includes(`${page.loc}</loc>`)) {
      sitemap = sitemap.replace(
        "</urlset>",
        `  <url>
    <loc>${page.loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>\n</urlset>`
      );
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

for (const hub of topicHubs) {
  const hubPath = path.join(root, `${hub.slug}.html`);
  fs.writeFileSync(hubPath, renderHubPage(hub), "utf8");
  console.log("wrote", hubPath);
}

const faqMain = `<main class="legal-page landing-page">
          <section class="hub-faq">
            ${renderFaqItems()}
          </section>
        </main>`;

fs.writeFileSync(
  path.join(root, "faq.html"),
  renderInfoPage({
    current: "faq",
    title: "Häufige Fragen – Mathe üben Klasse 1–6",
    description:
      "Ist mathe-testen.de kostenlos? Brauche ich ein Konto? Kann ich PDFs drucken? Antworten zu Übungen für Klasse 1 bis 6.",
    url: `${SITE_URL}/faq`,
    h1: "Häufige Fragen",
    lead: "Kurz und klar: kostenlos, ohne Anmeldung, online oder als PDF — für Klasse 1 bis 6.",
    jsonLd: renderFaqJsonLd(),
    mainHtml: faqMain,
  }),
  "utf8"
);
console.log("wrote faq.html");

const teachersMain = `<main class="legal-page landing-page">
          ${teachersPage.sections
            .map(
              (section, index) => `<section aria-labelledby="teachers-h-${index}">
            <h2 id="teachers-h-${index}">${escapeHtml(section.heading)}</h2>
            <p>${escapeHtml(section.text)}</p>${section.html ? `\n            ${section.html}` : ""}
          </section>`
            )
            .join("\n")}
          <p class="page-actions">
            <a class="btn-primary" href="/">Klasse wählen und üben</a>
            <a class="btn-secondary" href="/faq">Zu den häufigen Fragen</a>
          </p>
        </main>`;

fs.writeFileSync(
  path.join(root, "fuer-lehrkraefte.html"),
  renderInfoPage({
    current: "lehrkraefte",
    title: teachersPage.title,
    description: teachersPage.description,
    url: `${SITE_URL}/fuer-lehrkraefte`,
    h1: teachersPage.h1,
    lead: teachersPage.lead,
    jsonLd: renderTeachersJsonLd(),
    mainHtml: teachersMain,
  }),
  "utf8"
);
console.log("wrote fuer-lehrkraefte.html");

const parentsMain = `<main class="legal-page landing-page">
          <section class="hub-faq">
            ${renderFaqItems(parentsPage.faqs)}
          </section>
          <p class="page-actions">
            <a class="btn-primary" href="/">Klasse wählen und üben</a>
            <a class="btn-secondary" href="/faq">Weitere Fragen</a>
          </p>
        </main>`;

fs.writeFileSync(
  path.join(root, "fuer-eltern.html"),
  renderInfoPage({
    current: "eltern",
    title: parentsPage.title,
    description: parentsPage.description,
    url: `${SITE_URL}/fuer-eltern`,
    h1: parentsPage.h1,
    lead: parentsPage.lead,
    jsonLd: renderParentsJsonLd(),
    mainHtml: parentsMain,
  }),
  "utf8"
);
console.log("wrote fuer-eltern.html");

updateHomePage();
updateSitemap();
console.log("done");
