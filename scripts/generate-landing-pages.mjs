import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parentIntro, groupDescriptions, topicDescriptions, siteFaqs, teachersPage, parentsPage, contactPage } from "./landing-content.mjs";
import { topicHubs } from "./hub-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const topicsSrc = fs.readFileSync(path.join(root, "topics.js"), "utf8");
const scriptSrc = fs.readFileSync(path.join(root, "script.js"), "utf8");
const difficultyMatch = scriptSrc.match(/const difficulty = (\{[\s\S]*?\n\});/);
if (!difficultyMatch) {
  throw new Error("difficulty-Block nicht in script.js gefunden.");
}
const difficulty = new Function(`return (${difficultyMatch[1]});`)();
const buildTopics = new Function(`${topicsSrc}\nreturn buildTopics;`)();
const { topics: runtimeTopics } = buildTopics({
  randomInt: (min) => min,
  pickValue: (spec) => (Array.isArray(spec) ? spec[0] : spec.min),
  difficulty,
  withSigns: (a, b) => ({ a, b }),
  symbols: { addition: "+", subtraction: "−", multiplication: "×", division: ":" },
});
const runtimeTopicById = Object.fromEntries(runtimeTopics.map((topic) => [topic.id, topic]));
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
  1: "In Klasse 1 geht es um erste Zahlen, Plus und Minus bis 20, Zehnerfreunde und einfache Zerlegungen.",
  2: "In Klasse 2 vertiefst du Plus und Minus bis 100, übst Zehner- und Hunderterfreunde und lernst das Einmaleins.",
  3: "In Klasse 3 kommen größere Zahlen, schriftliches Rechnen, Division mit Rest, Tabellen und erste Sachaufgaben dazu.",
  4: "In Klasse 4 übst du schriftliche Verfahren, Bruchanteile, Geometrie und das Umrechnen von Größen.",
  5: "In Klasse 5 übst du Klammern, Rechengesetze, Platzhalter, Brüche erkennen sowie Quadratzahlen bis 12².",
  6: "In Klasse 6 kommen Brüche rechnen, Dezimalzahlen, Prozent, Dreisatz und Gleichungen dazu, außerdem Quadratzahlen bis 20² und Zehnerpotenzen.",
};

const classDetails = {
  1: "Typisch für Klasse 1 sind Aufgaben im Zahlenraum bis 20. Beim Zerlegen üben Kinder Zehnerfreunde, zum Beispiel 3 + ___ = 10, und zerlegen Zahlen wie 8 = 5 + ___. Dazu kommen Plus, Minus und erste Vergleiche.",
  2: "In Klasse 2 wächst der Zahlenraum bis 100. Beim Zerlegen bleiben Zehnerfreunde, dazu kommen Hunderterfreunde wie 30 + ___ = 100. Im 2. Halbjahr auch Aufgaben wie 36 + ___ = 100. Das Einmaleins wird aufgebaut.",
  3: "Klasse 3 bedeutet größere Zahlen, schriftliches Rechnen und mehr Schritte pro Aufgabe. Division mit Rest, Punkt vor Strich, Tabellen lesen und Größen wie Länge oder Gewicht kommen dazu — Themen, bei denen eine Übersicht besonders hilft.",
  4: "In Klasse 4 stehen schriftliche Verfahren, Division mit Rest, Bruchanteile und anspruchsvollere Sachaufgaben im Fokus. Geometrie und Größen werden präziser; Kinder sollen nicht nur rechnen, sondern auch begründen, warum ein Ergebnis passt.",
  5: "Klasse 5 verbindet das Rechnen mit großen Zahlen mit Klammern, Rechengesetzen, Platzhaltern, Primzahlen, Bruchanteilen und dem Erkennen von Brüchen. Quadratzahlen gehören dazu: im 1. Halbjahr bis 10², im 2. Halbjahr bis 12². Geübt wird zum Beispiel 7² = 49 und die Umkehrung 49 ist das Quadrat von 7.",
  6: "In Klasse 6 kommen das Rechnen mit Brüchen, Dezimalzahlen, Prozent, Dreisatz, Gleichungen mit x und der Mittelwert zusammen. Quadratzahlen gehen im 1. Halbjahr bis 16² und im 2. Halbjahr bis 20², dazu kommen Zehnerpotenzen wie 10³ = 1000.",
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
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
// Neue Beiträge auch in news.js unter ARTICLES eintragen, sonst fehlt die Zahl am Menüpunkt Neu.
const NEWS_ITEMS = [
  {
    dateIso: "2026-10-17",
    date: "17. Oktober 2026",
    title: "Übertragszeile beim schriftlichen Rechnen online",
    text: "Wenn „Rechenweg notieren“ eingeschaltet ist, steht bei Plus und Minus über dem Ergebnisstrich jetzt eine kleine Zeile „Ü“. Dort können Kinder Überträge für die nächste Stelle eintragen. Mit den Pfeiltasten wechselt man direkt zwischen Ergebnis- und Übertragszeile.",
    href: "/schriftlich-rechnen",
    linkLabel: "Schriftlich rechnen üben",
  },
  {
    dateIso: "2026-10-17",
    date: "17. Oktober 2026",
    title: "Rechenkästchen unter Mal und Geteilt im PDF",
    text: "Im PDF-Druck erscheint bei eingeschaltetem Rechenweg unter Aufgaben zur Multiplikation und Division jetzt ein kleines Kästchenraster statt einfacher Linien. So können Kinder Zwischenschritte ordentlich stellengerecht untereinander schreiben.",
    href: "/schriftlich-rechnen",
    linkLabel: "Arbeitsblatt zum schriftlichen Rechnen erstellen",
  },
  {
    dateIso: "2026-10-17",
    date: "17. Oktober 2026",
    title: "Geld und Uhrzeit jetzt schon ab Klasse 1 (2. Halbjahr)",
    text: "Im 2. Halbjahr der 1. Klasse gibt es im Bereich Größen jetzt zwei neue Themen: einfache Euro-Beträge bis 20 Euro zusammenrechnen sowie volle Stunden auf der analogen Uhr ablesen, zum Beispiel 8:00 oder 8 Uhr.",
    href: "/klasse-1/uebungen?themen=money,clock",
    linkLabel: "Geld und Uhr in Klasse 1 üben",
  },
  {
    dateIso: "2026-10-16",
    date: "16. Oktober 2026",
    title: "Gleiches Übungsblatt mit Apple Classroom",
    text: "Für den Unterricht gibt es auf der Startseite den Bereich „Für die Nutzung mit Apple Classroom“. Klasse wählen, Halbjahr und Themen einstellen, dann „Blatt für die Klasse“. Den Link in Apple Classroom bei Navigieren einfügen. Die Tablets der Gruppe öffnen dieselben Aufgaben. Ein Konto brauchen die Kinder dafür nicht.",
    href: "/fuer-lehrkraefte#teachers-classroom",
    linkLabel: "Kurzanleitung für Lehrkräfte",
  },
  {
    dateIso: "2026-10-16",
    date: "16. Oktober 2026",
    title: "Prüf-Code auf dem gedruckten Aufgabenblatt",
    text: "Oben rechts auf dem PDF steht ein größerer QR-Code, darunter „Prüf-Code“. Gescannt zeigt er die Lösungen genau zu diesem Blatt, in denselben Blöcken wie die Aufgaben.",
    href: "/klasse-1/uebungen",
    linkLabel: "Aufgabenblatt erstellen",
  },
  {
    dateIso: "2026-10-03",
    date: "3. Oktober 2026",
    title: "Zehner- und Hunderterfreunde für Klasse 1 und 2",
    text: "Beim Zerlegen kommen Zahlenfreunde dazu. In Klasse 1 sind es Zehnerfreunde, zum Beispiel 3 + ___ = 10. In Klasse 2 kommen Hunderterfreunde dazu, etwa 30 + ___ = 100. Der größere Teil bleibt das Zerlegen, zum Beispiel 14 = 6 + ___.",
    href: "/klasse-1/uebungen?themen=decompose",
    linkLabel: "Zehnerfreunde direkt üben",
  },
  {
    dateIso: "2026-10-03",
    date: "3. Oktober 2026",
    title: "Quadratzahlen für Klasse 5 und 6",
    text: "Neue Übungen zu Quadratzahlen. In Klasse 5 bis 12², im 1. Halbjahr bis 10². In Klasse 6 bis 20², dazu einfache Zehnerpotenzen wie 10³ = 1000. Eine Aufgabe lautet zum Beispiel 7² = 49 oder 49 ist das Quadrat von 7.",
    href: "/quadratzahlen",
    linkLabel: "Quadratzahlen üben",
  },
  {
    dateIso: "2026-10-01",
    date: "1. Oktober 2026",
    title: "Körper erkennen für Klasse 2 bis 4",
    text: "Würfel, Quader, Kugel und Zylinder, ab Klasse 3 auch Pyramide, Kegel und Prisma. Die Zeichnung ist schwarz-weiß, zehn Aufgaben passen auf eine PDF-Seite. Ab Klasse 3 kommen Fragen zu Ecken, Kanten und Flächen dazu.",
    href: "/geometrische-koerper",
    linkLabel: "Geometrische Körper üben",
  },
  {
    dateIso: "2026-10-01",
    date: "1. Oktober 2026",
    title: "Lösung nach dem Prüfen optional anzeigen",
    text: "Ein Schalter neben dem Zeitlimit blendet die richtige Lösung nach dem Prüfen ein. Er ist standardmäßig aus und lässt sich auch nachträglich noch einschalten. Richtig und falsch werden trotzdem markiert.",
    href: "/klasse-1/uebungen",
    linkLabel: "Übungen öffnen",
  },
  {
    dateIso: "2026-09-30",
    date: "30. September 2026",
    title: "Liter und Milliliter für Klasse 3 und 4",
    text: "Neue Übungen zu Hohlmaßen: Liter und Milliliter umrechnen, fehlende Mengen ergänzen und einfache Flaschenaufgaben lösen — online oder als PDF.",
    href: "/groessen-umrechnen",
    linkLabel: "Größen umrechnen üben",
  },
  {
    dateIso: "2026-09-30",
    date: "30. September 2026",
    title: "Zahlenmauern für Klasse 1 bis 3",
    text: "Zahlenmauern gibt es jetzt mit zwei Grundsteinen in Klasse 1 und mit drei Grundsteinen in Klasse 2 und 3. Mal fehlt ein oberer, mal ein unterer Stein.",
    href: "/zahlenmauern",
    linkLabel: "Zahlenmauern & Zahlenfreunde öffnen",
  },
  {
    dateIso: "2026-09-29",
    date: "29. September 2026",
    title: "Einmaleins-Reihen einzeln üben",
    text: "Von der 1er- bis zur 10er-Reihe lässt sich jetzt jede Reihe mit einem Klick öffnen. Die zehn Aufgaben reichen jeweils von × 1 bis × 10 und können auch als PDF gedruckt werden.",
    href: "/einmaleins",
    linkLabel: "Einmaleins-Reihe auswählen",
  },
  {
    dateIso: "2026-09-27",
    date: "27. September 2026",
    title: "Geteilt-Sachaufgaben ab Klasse 3",
    text: "Sachaufgaben zu Mal und Geteilt haben jetzt eigene 10er-Blöcke. Die Geteiltaufgaben gehen ohne Rest auf und richten sich in Klasse 3 nach dem kleinen Einmaleins.",
    href: "/klasse-3/uebungen?themen=word_times",
    linkLabel: "Mal- und Geteilt-Sachaufgaben öffnen",
  },
];

function classOgImage(grade) {
  return `${SITE_URL}/og-image-klasse-${grade}.jpg`;
}

function hubOgImage(slug) {
  const file = path.join(root, `og-image-${slug}.jpg`);
  if (fs.existsSync(file)) {
    return `${SITE_URL}/og-image-${slug}.jpg`;
  }
  return OG_IMAGE;
}

function renderOpenGraph({ title, description, url, imageAlt, image = OG_IMAGE }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageAlt = escapeHtml(imageAlt);
  return `    <meta property="og:type" content="website" />
    <meta property="og:locale" content="de_DE" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeImageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${safeImageAlt}" />`;
}

function renderBreadcrumbs(items) {
  const list = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const content =
        isLast || !item.href
          ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
          : `<a href="${item.href}">${escapeHtml(item.label)}</a>`;
      return `            <li>${content}</li>`;
    })
    .join("\n");
  return `<nav class="breadcrumbs" aria-label="Pfad">
          <ol>
${list}
          </ol>
        </nav>`;
}

function renderSiteHeader(current = "") {
  const brandCurrent = current === "home" ? ' aria-current="page"' : "";
  const faqCurrent = current === "faq" ? ' aria-current="page"' : "";
  const newsCurrent = current === "neu" ? ' aria-current="page"' : "";
  const parentsCurrent = current === "eltern" ? ' aria-current="page"' : "";
  const teachersCurrent = current === "lehrkraefte" ? ' aria-current="page"' : "";
  const schoolsCurrent = current === "schulen" ? ' aria-current="page"' : "";
  const contactCurrent = current === "kontakt" ? ' aria-current="page"' : "";
  const topId = current === "rechenarten" ? ' id="seitenanfang"' : "";
  return `<header class="site-header"${topId}>
    <div class="site-header-inner">
      <a class="site-header-brand" href="/"${brandCurrent}>Mathe üben</a>
      <nav class="site-header-nav" aria-label="Weitere Seiten">
        <a href="/faq"${faqCurrent}>FAQ</a>
        <a class="site-header-news" href="/neuigkeiten"${newsCurrent}>Neu<span class="site-header-news-dot" aria-hidden="true"></span></a>
        <a href="/fuer-eltern"${parentsCurrent}>Eltern</a>
        <a href="/fuer-lehrkraefte"${teachersCurrent}>Lehrkräfte</a>
        <a href="/fuer-schulen"${schoolsCurrent}>Schulen</a>
        <a class="site-header-cta" href="/kontakt"${contactCurrent}>Kontakt</a>
      </nav>
    </div>
  </header>`;
}

function renderSiteFooter(current = "", extraItems = []) {
  const items = [
    { href: "/", id: "home", label: "Startseite" },
    ...extraItems,
    { href: "/faq", id: "faq", label: "FAQ" },
    { href: "/neuigkeiten", id: "neu", label: "Neuigkeiten" },
    { href: "/rechenarten", id: "rechenarten", label: "Rechenarten" },
    { href: "/fuer-eltern", id: "eltern", label: "Für Eltern" },
    { href: "/fuer-lehrkraefte", id: "lehrkraefte", label: "Für Lehrkräfte" },
    { href: "/fuer-schulen", id: "schulen", label: "Für Schulen" },
    { href: "/kontakt", id: "kontakt", label: "Kontakt" },
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
          "Antworten zu mathe-testen.de: kostenlos, ohne Anmeldung, PDF-Druck, Klassen 1 bis 6 und 10er-Blöcke pro Rechenart.",
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

function renderContactJsonLd() {
  const url = `${SITE_URL}/kontakt`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}/#webpage`,
        url,
        name: contactPage.title,
        description: contactPage.description,
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Kontakt", item: url },
        ],
      },
    ],
  };
}

function renderNewsJsonLd() {
  const url = `${SITE_URL}/neuigkeiten`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: "Neuigkeiten – mathe-testen.de",
        description: "Neue Übungen und wichtige Verbesserungen auf mathe-testen.de.",
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Neuigkeiten", item: url },
        ],
      },
    ],
  };
}

function renderNewsTeaser(heading, intro) {
  return `<section class="news-teaser" aria-labelledby="news-teaser-heading">
            <h2 id="news-teaser-heading">${escapeHtml(heading)}</h2>
            <p>${escapeHtml(intro)}</p>
            <ul>
              ${NEWS_ITEMS.slice(0, 2).map(
                (item) =>
                  `<li><a class="text-link" href="${item.href}">${escapeHtml(item.title)}</a></li>`
              ).join("\n              ")}
            </ul>
            <p><a class="text-link" href="/neuigkeiten">Alle Neuigkeiten ansehen</a></p>
          </section>`;
}

function renderInfoPage({ current, title, description, url, h1, lead, jsonLd, mainHtml, crumb }) {
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
          ${renderBreadcrumbs([
            { href: "/", label: "Startseite" },
            { label: crumb || h1 },
          ])}
          <h1>${escapeHtml(h1)}</h1>
          <p class="description">${escapeHtml(lead)}</p>
        </header>
        ${mainHtml}
        ${renderSiteFooter(current)}
      </div>
    </div>
    ${installPromptHtml}
    <script src="/email-protect.js"></script>
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
  const descriptions = {
    1: "Mathe Klasse 1 üben: Zehnerfreunde wie 3 + ___ = 10, Plus und Minus bis 20. Kostenlos online oder als PDF. Ohne Anmeldung.",
    2: "Mathe Klasse 2 üben: Zehner- und Hunderterfreunde wie 30 + ___ = 100, Einmaleins bis 100. Kostenlos online oder als PDF. Ohne Anmeldung.",
    5: "Mathe Klasse 5 üben: Klammern, Rechengesetze, Platzhalter, Brüche erkennen und Quadratzahlen bis 12². Kostenlos online oder als PDF. Ohne Anmeldung.",
    6: "Mathe Klasse 6 üben: Brüche rechnen, Dezimalzahlen, Prozent, Dreisatz, Quadratzahlen bis 20² und Zehnerpotenzen. Kostenlos online oder als PDF.",
  };
  return {
    title: `Mathe Klasse ${grade} – Übungen online & als PDF`,
    description:
      descriptions[grade] ||
      `Mathe Klasse ${grade}: kostenlose Übungen und Arbeitsblätter — online üben oder als PDF zum Ausdrucken. Ohne Anmeldung.`,
    url: `${SITE_URL}/klasse-${grade}`,
    image: classOgImage(grade),
    imageAlt: `Mathematik Übungsaufgaben Klasse ${grade}`,
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

function practiceDescription(grade) {
  if (grade === 1) {
    return "Übungsaufgaben Klasse 1: Zehnerfreunde wie 3 + ___ = 10 und Zerlegen. Halbjahr und Themen wählen, online üben oder als PDF drucken.";
  }
  if (grade === 2) {
    return "Übungsaufgaben Klasse 2: Zehner- und Hunderterfreunde wie 30 + ___ = 100. Halbjahr und Themen wählen, online üben oder als PDF drucken.";
  }
  if (grade === 5) {
    return "Übungsaufgaben Klasse 5: Klammern, Platzhalter, Brüche erkennen und Quadratzahlen bis 12². Halbjahr und Themen wählen, online üben oder als PDF drucken.";
  }
  if (grade === 6) {
    return "Übungsaufgaben Klasse 6: Brüche, Dezimalzahlen, Prozent, Dreisatz, Quadratzahlen bis 20² und Zehnerpotenzen. Online üben oder als PDF drucken.";
  }
  return `Mathe-Übungen für Klasse ${grade}: Halbjahr, Anzahl und Themen wählen — online üben oder Arbeitsblatt als PDF zum Ausdrucken.`;
}

function renderPracticeJsonLd(grade) {
  const url = `${SITE_URL}/klasse-${grade}/uebungen`;
  const classUrl = `${SITE_URL}/klasse-${grade}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: `Übungsaufgaben Klasse ${grade} – online & als PDF`,
        description: practiceDescription(grade),
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: `Klasse ${grade}`, item: classUrl },
          { "@type": "ListItem", position: 3, name: "Übungen", item: url },
        ],
      },
    ],
  };
}

function renderHeadAssets(cssPath = "/style.css") {
  const versionedCss = cssPath.includes("?")
    ? cssPath
    : `${cssPath}${cssPath.includes("style.css") ? "?v=89" : ""}`;
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
            <p class="page-actions home-topics-action">
              <a class="btn-secondary" href="/rechenarten">Alle Rechenarten nach Klasse</a>
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
          const description = plainTopicText(
            topicDescriptions[topic.id] || "Übungen zu diesem Thema im passenden Schwierigkeitsgrad."
          );
          const note = topicAvailabilityNote(topic, grade);
          const cardLabel =
            topic.id === "decompose"
              ? grade <= 1
                ? "Zerlegen und Zehnerfreunde"
                : "Zerlegen, Zehner- und Hunderterfreunde"
              : topic.label;
          const isActive = active.includes(topic);
          const targetGrade = isActive ? grade : topic.fromGrade;
          const targetTerm = isActive ? (isTopicAllowed(topic, grade, 1) ? 1 : 2) : topic.fromTerm;
          const topicHref = `/klasse-${targetGrade}/uebungen?halbjahr=${targetTerm}&themen=${encodeURIComponent(topic.id)}`;
          return `<li class="landing-topic-detail">
              <h4><a class="text-link" href="${topicHref}">${escapeHtml(cardLabel)}</a></h4>
              <p>${escapeHtml(description)}</p>
${note ? `              <p class="hint landing-topic-note">${escapeHtml(note)}</p>\n` : ""}            </li>`;
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

const pwaScripts = `    <script defer src="/news.js?v=10"></script>
    <script defer src="/pwa.js"></script>
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
  const appMain = practiceTemplate.slice(setupStart, footerStart).trimEnd();

  const dialogStart = practiceTemplate.indexOf('<dialog class="success-dialog"');
  const scriptStart = practiceTemplate.search(/<script src="\/topics\.js[^"]*">/);
  if (scriptStart < 0) {
    throw new Error("topics.js script tag not found in practice template");
  }
  const appDialogs = practiceTemplate.slice(dialogStart, scriptStart).trimEnd();

  const scripts = `    <script src="/topics.js?v=54"></script>
    <script src="/script.js?v=87"></script>
    <script defer src="/news.js?v=10"></script>
    <script defer src="/pwa.js?v=33"></script>
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

function renderClassHubsSection(grade) {
  const matchingHubs = topicHubs.filter((hub) => hub.grades.includes(grade));
  if (!matchingHubs.length) {
    return "";
  }
  const items = matchingHubs
    .map(
      (hub) =>
        `<li><a href="/${hub.slug}">${escapeHtml(hub.shortName)}</a> — ${escapeHtml(
          hub.metaDescription.split("—")[0].trim().replace(/\.$/, "")
        )}</li>`
    )
    .join("\n              ");
  return `
          <section class="landing-class-hubs" aria-labelledby="class-hubs-heading-${grade}">
            <h2 id="class-hubs-heading-${grade}">Vertiefende Themen-Seiten für Klasse ${grade}</h2>
            <p class="landing-overview-hint">
              Zu besonders wichtigen Themen in Klasse ${grade} gibt es eigene Seiten mit Beispielen, typischen Fehlern und direkter Themen-Vorauswahl:
            </p>
            <ul class="home-topic-hubs">
              ${items}
            </ul>
          </section>`;
}

function renderClassPage(grade) {
  const topicOverview = renderTopicOverview(grade);
  const classHubsSection = renderClassHubsSection(grade);
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
          ${renderBreadcrumbs([
            { href: "/", label: "Startseite" },
            { label: `Klasse ${grade}` },
          ])}
          <h1>Mathe Übungen – Klasse ${grade}</h1>
          <p class="description">${classIntros[grade]} Kostenlose Übungen online oder als Arbeitsblatt zum Ausdrucken.</p>
          ${renderClassNav(grade)}
        </header>

        <main class="legal-page landing-page">
          <p class="landing-lead">${classDetails[grade]}</p>

          <section class="landing-topics-overview" aria-labelledby="topics-heading-${grade}">
            <h2 id="topics-heading-${grade}">Kategorien und Rechenarten in Klasse ${grade}</h2>
            <p class="landing-overview-hint">
              In der Grundschule wird Mathe oft in vier Bereiche gegliedert. Hier siehst du,
              was dahinter steckt — ein Klick auf den Namen öffnet direkt das passende Übungsblatt. <a class="text-link" href="/rechenarten">Alle Klassen im Vergleich</a>
            </p>
            ${topicOverview}
          </section>${classHubsSection}
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
      content="${practiceDescription(grade)}"
    />
    <link rel="canonical" href="https://mathe-testen.de/klasse-${grade}/uebungen" />
${renderOpenGraph({
    title: `Übungsaufgaben Klasse ${grade} – online & als PDF`,
    description: practiceDescription(grade),
    url: `${SITE_URL}/klasse-${grade}/uebungen`,
    image: classOgImage(grade),
    imageAlt: `Mathematik Übungsaufgaben Klasse ${grade}`,
  })}
    <title>Übungsaufgaben Klasse ${grade} – online &amp; als PDF</title>
    ${renderJsonLdScript(renderPracticeJsonLd(grade))}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    ${renderHeadAssets()}
  </head>
  <body class="ads-off practice-page-body" data-locked-grade="${grade}">
    ${renderSiteHeader()}
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          ${renderBreadcrumbs([
            { href: "/", label: "Startseite" },
            { href: `/klasse-${grade}`, label: `Klasse ${grade}` },
            { label: "Übungen" },
          ])}
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
        step: (hub.howToSteps || [
          {
            name: "Klasse wählen",
            text: "Wähle unten die passende Klassenstufe.",
          },
          {
            name: "Übungsblatt erstellen",
            text: "Themen sind vorausgewählt. Anzahl festlegen und Blatt erzeugen.",
          },
          {
            name: "Online üben oder PDF drucken",
            text: "Aufgaben digital lösen und prüfen oder als PDF ausdrucken — kostenlos und ohne Anmeldung.",
          },
        ]).map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
    ],
  };
}

function renderEinmaleinsChoices() {
  const rows = Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return `<a class="grade-btn grade-btn-nav times-row-btn" href="/klasse-2/uebungen?reihe=${number}">${number}er-Reihe</a>`;
  }).join("\n");
  const grades = [2, 3, 4, 5, 6]
    .map(
      (grade) =>
        `<a class="grade-btn grade-btn-nav" href="${practiceUrlWithTopics(grade, ["multiplication"])}">Klasse ${grade}</a>`
    )
    .join("\n");
  return `
          <section class="hub-rows" id="reihen" aria-labelledby="hub-rows-einmaleins">
            <h2 id="hub-rows-einmaleins">Eine Reihe üben</h2>
            <p class="landing-overview-hint">Ein Klick, und das Blatt ist nur diese Reihe, von 1 bis 10. Zum Beispiel die 7er-Reihe: 7×1 bis 7×10.</p>
            <nav class="times-row-nav" aria-label="Einmaleins-Reihen">
              ${rows}
            </nav>
          </section>

          <section class="hub-grades" id="gemischt" aria-labelledby="hub-grades-einmaleins">
            <h2 id="hub-grades-einmaleins">Oder gemischt nach Klasse</h2>
            <p class="landing-overview-hint">Hier sind die Malaufgaben gemischt, nicht nur eine Reihe. Du wählst Klasse und Halbjahr, übst online oder druckst ein PDF.</p>
            <nav class="class-nav-grid hub-grade-nav" aria-label="Klassen für Einmaleins">
              ${grades}
            </nav>
          </section>`;
}

function renderHubPage(hub) {
  const url = `${SITE_URL}/${hub.slug}`;
  const meta = {
    title: hub.title,
    description: hub.metaDescription,
    url,
    image: hubOgImage(hub.slug),
    imageAlt: `${hub.shortName} üben – Mathematik Übungsaufgaben`,
  };

  const gradeButtons = hub.grades
    .map(
      (grade) =>
        `<a class="grade-btn grade-btn-nav" href="${practiceUrlWithTopics(
          grade,
          hub.topicIdsByGrade?.[grade] || hub.topicIds
        )}">Klasse ${grade}</a>`
    )
    .join("\n");

  const mistakesSection = hub.mistakes?.length
    ? `\n          <section aria-labelledby="hub-mistakes-${hub.slug}">
            <h2 id="hub-mistakes-${hub.slug}">${escapeHtml(
              hub.mistakesHeading || "Drei typische Fehler"
            )}</h2>
            ${hub.mistakes
              .map(
                (item) => `<div class="hub-faq-item">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>`
              )
              .join("\n")}
          </section>\n`
    : "";

  const directLinksSection = hub.directLinks?.length
    ? `\n          <section aria-labelledby="hub-direct-${hub.slug}">
            <h2 id="hub-direct-${hub.slug}">${escapeHtml(
              hub.directLinksHeading || "Direkt nach Einzelthema üben"
            )}</h2>${
              hub.directLinksIntro
                ? `\n            <p class="landing-overview-hint">${escapeHtml(hub.directLinksIntro)}</p>`
                : ""
            }
            <ul class="home-topic-hubs">
              ${hub.directLinks
                .map(
                  (link) =>
                    `<li><a href="${link.href}">${escapeHtml(link.label)}</a>${
                      link.note ? ` — ${escapeHtml(link.note)}` : ""
                    }</li>`
                )
                .join("\n              ")}
            </ul>
          </section>\n`
    : "";

  const faqItems = hub.faqs
    .map(
      (item) => `<div class="hub-faq-item">
            <h3>${escapeHtml(item.q)}</h3>
            <p>${escapeHtml(item.a)}</p>
          </div>`
    )
    .join("\n");

  const preferredRelated = {
    "plus-minus": ["zahlenmauern", "einmaleins", "schriftlich-rechnen", "sachaufgaben", "geld-rechnen", "uhr-ueben"],
    zahlenmauern: ["plus-minus", "einmaleins", "schriftlich-rechnen", "sachaufgaben", "geld-rechnen", "uhr-ueben"],
    einmaleins: ["plus-minus", "zahlenmauern", "schriftlich-rechnen", "rechenregeln", "sachaufgaben", "quadratzahlen"],
    "schriftlich-rechnen": ["rechenregeln", "einmaleins", "plus-minus", "sachaufgaben", "groessen-umrechnen", "brueche"],
    rechenregeln: ["schriftlich-rechnen", "dreisatz-gleichungen", "quadratzahlen", "einmaleins", "plus-minus", "brueche"],
    sachaufgaben: ["groessen-umrechnen", "geld-rechnen", "uhr-ueben", "dreisatz-gleichungen", "schriftlich-rechnen", "brueche"],
    "uhr-ueben": ["groessen-umrechnen", "geld-rechnen", "sachaufgaben", "plus-minus", "zahlenmauern", "einmaleins"],
    "geld-rechnen": ["groessen-umrechnen", "uhr-ueben", "sachaufgaben", "dezimalzahlen", "plus-minus", "zahlenmauern"],
    "groessen-umrechnen": ["uhr-ueben", "geld-rechnen", "sachaufgaben", "dezimalzahlen", "brueche", "dreisatz-gleichungen"],
    brueche: ["dezimalzahlen", "prozent", "dreisatz-gleichungen", "rechenregeln", "groessen-umrechnen", "quadratzahlen"],
    dezimalzahlen: ["brueche", "prozent", "groessen-umrechnen", "geld-rechnen", "dreisatz-gleichungen", "rechenregeln"],
    prozent: ["brueche", "dezimalzahlen", "dreisatz-gleichungen", "sachaufgaben", "quadratzahlen", "rechenregeln"],
    "dreisatz-gleichungen": ["rechenregeln", "brueche", "prozent", "dezimalzahlen", "sachaufgaben", "quadratzahlen"],
    quadratzahlen: ["rechenregeln", "einmaleins", "dreisatz-gleichungen", "brueche", "dezimalzahlen", "prozent"],
    "geometrie-grundschule": ["geometrische-koerper", "zahlenmauern", "plus-minus", "groessen-umrechnen", "einmaleins", "rechenregeln"],
    "geometrische-koerper": ["geometrie-grundschule", "groessen-umrechnen", "sachaufgaben", "einmaleins", "zahlenmauern", "plus-minus"],
  };
  const preferredOrder = preferredRelated[hub.slug] || [];
  const preferredHubs = preferredOrder
    .map((slug) => topicHubs.find((other) => other.slug === slug))
    .filter(Boolean);
  const preferredSet = new Set(preferredOrder);
  const related = [
    ...preferredHubs,
    ...topicHubs.filter((other) => other.slug !== hub.slug && !preferredSet.has(other.slug)),
  ].slice(0, 6)
    .map((other) => `<li><a href="/${other.slug}">${escapeHtml(other.shortName)}</a></li>`)
    .join("\n");

  const classOverviewLinks = hub.grades
    .map((grade) => `<a class="text-link" href="/klasse-${grade}">Klasse ${grade}</a>`)
    .join(" · ");

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
          ${renderBreadcrumbs([
            { href: "/", label: "Startseite" },
            { label: hub.shortName },
          ])}
          <h1>${escapeHtml(hub.h1)}</h1>
          <p class="description">${escapeHtml(hub.lead)}</p>
        </header>

        <main class="legal-page landing-page hub-page">
          <p class="landing-lead hub-answer">
            <strong>${escapeHtml(hub.shortName)} üben auf mathe-testen.de:</strong>
            kostenlos, ohne Anmeldung, online oder als PDF — für Eltern, Kinder und Lehrkräfte.
          </p>
${hub.slug === "einmaleins" ? renderEinmaleinsChoices() : ""}

          <section aria-labelledby="hub-what-${hub.slug}">
            <h2 id="hub-what-${hub.slug}">${escapeHtml(hub.whatHeading)}</h2>
            <p>${escapeHtml(hub.whatIs)}</p>
          </section>

          <section aria-labelledby="hub-why-${hub.slug}">
            <h2 id="hub-why-${hub.slug}">Warum gezielt üben?</h2>
            <p>${escapeHtml(hub.whyPractice)}</p>
          </section>${mistakesSection}${directLinksSection}

          <section aria-labelledby="hub-how-${hub.slug}">
            <h2 id="hub-how-${hub.slug}">So funktioniert’s</h2>
            <p>${escapeHtml(hub.howItWorks)}</p>
          </section>

          <section aria-labelledby="hub-who-${hub.slug}">
            <h2 id="hub-who-${hub.slug}">Für wen ist das gedacht?</h2>
            <p>${escapeHtml(hub.forWhom)}</p>
          </section>

          ${
            hub.slug === "einmaleins"
              ? ""
              : `<section class="hub-grades" id="hub-start" aria-labelledby="hub-grades-${hub.slug}">
            <h2 id="hub-grades-${hub.slug}">${escapeHtml(hub.shortName)} üben — Klasse wählen</h2>
            <p class="landing-overview-hint">
              Die Themen sind auf der Übungsseite vorausgewählt. Du kannst sie dort noch anpassen.
            </p>
            <nav class="class-nav-grid hub-grade-nav" aria-label="Klassen für ${escapeHtml(hub.shortName)}">
              ${gradeButtons}
            </nav>
          </section>`
          }

          <section class="hub-faq" aria-labelledby="hub-faq-${hub.slug}">
            <h2 id="hub-faq-${hub.slug}">Häufige Fragen</h2>
            ${faqItems}
          </section>

          <section aria-labelledby="hub-related-${hub.slug}">
            <h2 id="hub-related-${hub.slug}">Weitere Themen</h2>
            <ul class="hub-related-list">${related}</ul>
            <p class="landing-overview-hint">
              Alle Themen der Klassenstufe im Überblick: ${classOverviewLinks} · <a class="text-link" href="/rechenarten">Alle Rechenarten nach Klasse</a>
            </p>
          </section>
        </main>

        ${renderSiteFooter()}
      </div>
    </div>

    <aside class="class-page-cta" aria-label="Zur Klassenwahl">
      <a class="btn-primary class-page-cta-btn" href="${hub.slug === "einmaleins" ? "#reihen" : "#hub-start"}">${hub.slug === "einmaleins" ? "Eine Reihe üben" : "Klasse wählen und üben"}</a>
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
    { loc: "https://mathe-testen.de/neuigkeiten", priority: "0.6" },
    { loc: "https://mathe-testen.de/fuer-eltern", priority: "0.7" },
    { loc: "https://mathe-testen.de/fuer-lehrkraefte", priority: "0.7" },
    { loc: "https://mathe-testen.de/fuer-schulen", priority: "0.65" },
    { loc: "https://mathe-testen.de/kontakt", priority: "0.5" },
    { loc: "https://mathe-testen.de/rechenarten", priority: "0.7" },
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

function plainTopicText(text) {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function topicLabelForGrade(topic, grade) {
  if (topic.id === "decompose") {
    return grade <= 1
      ? "Zerlegen und Zehnerfreunde"
      : "Zerlegen, Zehner- und Hunderterfreunde";
  }
  return topic.label;
}

function fmtDe(value) {
  return String(Math.abs(value)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}

function topicGradeAddon(topic, grade) {
  const id = topic.id;
  const runtimeTopic = runtimeTopicById[id];
  const ex1 = runtimeTopic?.example ? runtimeTopic.example(grade, 1) : "";
  const ex2 = runtimeTopic?.example ? runtimeTopic.example(grade, 2) : "";
  const d1 = difficulty[grade][1];
  const d2 = difficulty[grade][2];

  if (id === "addition" || id === "subtraction") {
    if (d1.addMax !== d2.addMax) {
      return `In Klasse ${grade} im 1. Halbjahr bis ${fmtDe(d1.addMax)} (${ex1}), im 2. Halbjahr bis ${fmtDe(d2.addMax)} (${ex2}).`;
    }
    return `In Klasse ${grade} ab ${fmtDe(d1.addMin)} bzw. ${fmtDe(d2.addMin)} bis ${fmtDe(d2.addMax)} (${ex1}), optional mit negativen Zahlen bis −${fmtDe(d2.neg.addMax)}.`;
  }

  if (id === "compare") {
    if (d1.addMax !== d2.addMax) {
      return `In Klasse ${grade} im Zahlenraum bis ${fmtDe(d1.addMax)} (${ex1}) bzw. bis ${fmtDe(d2.addMax)} (${ex2}).`;
    }
    return `In Klasse ${grade} ab ${fmtDe(d1.addMin)} bzw. ${fmtDe(d2.addMin)} bis ${fmtDe(d2.addMax)} (${ex1}), optional mit negativen Zahlen bis −${fmtDe(d2.neg.addMax)}.`;
  }

  if (id === "multiplication") {
    if (grade === 2) {
      return `In Klasse 2 im 1. Halbjahr mit den Reihen 1, 2, 5 und 10, im 2. Halbjahr mit dem kleinen Einmaleins bis 10 × 10 (${ex1}).`;
    }
    if (grade === 3) {
      return `In Klasse 3 im 1. Halbjahr mit Faktoren bis ${d1.mul.a.max} × ${d1.mul.b.max} (${ex1}), im 2. Halbjahr zweistellig mal einstellig bis ${d2.mul.a.max} × ${d2.mul.b.max}.`;
    }
    if (grade === 4) {
      return `In Klasse 4 im 1. Halbjahr bis ${d1.mul.a.max} × ${d1.mul.b.max} (${ex1}), im 2. Halbjahr zweistellig mal zweistellig bis ${d2.mul.a.max} × ${d2.mul.b.max}.`;
    }
    if (grade === 5) {
      return `In Klasse 5 zweistellig bis ${d1.mul.a.max} × ${d1.mul.b.max} im 1. Halbjahr (${ex1}) und bis ${d2.mul.a.max} × ${d2.mul.b.max} im 2. Halbjahr.`;
    }
    return `In Klasse 6 ab ${d1.mul.a.min} × ${d1.mul.b.min} (${ex1}) bis ${d2.mul.a.max} × ${d2.mul.b.max} im 2. Halbjahr.`;
  }

  if (id === "division") {
    if (grade === 2) {
      return `In Klasse 2 im 1. Halbjahr durch 1, 2, 5 und 10, im 2. Halbjahr durch 1 bis 10 (${ex1}).`;
    }
    const exText = grade === 3 ? "z. B. 48 : 3 bzw. 84 : 7" : ex1;
    return `In Klasse ${grade} mit Teilern von ${d1.div.divisors.min} bis ${d2.div.divisors.max} und Ergebnissen bis ${d1.div.quotient.max} im 1. Halbjahr bzw. ${d2.div.quotient.max} im 2. Halbjahr (${exText}).`;
  }

  if (id === "division_rest") {
    const byGrade = {
      3: `In Klasse 3 mit Teilern von 2 bis 10 und Ergebnissen bis 10 (${ex1}).`,
      4: `In Klasse 4 mit Teilern von 2 bis 10 und Ergebnissen von 2 bis 12 bzw. 15 (${ex1}).`,
      5: `In Klasse 5 mit Teilern von 2 bis 12 und Ergebnissen bis 15 (${ex1}).`,
      6: `In Klasse 6 mit Teilern von 3 bis 12 und Ergebnissen bis 20 (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "order_ops" || id === "brackets" || id === "laws" || id === "placeholder" || id === "equations" || id === "mean") {
    return `In Klasse ${grade} im 1. Halbjahr (${ex1}), im 2. Halbjahr (${ex2}).`;
  }

  if (id === "proportion") {
    return `In Klasse ${grade} im 1. Halbjahr mit kleineren Stückzahlen (${ex1}), im 2. Halbjahr mit größeren Mengen (${ex2}).`;
  }

  if (id === "fractions_share") {
    return grade === 4
      ? `In Klasse 4 mit den Nennern 2, 4, 5 und 10 (${ex1}).`
      : `In Klasse 5 zusätzlich mit Dritteln und Achteln bei größeren Mengen (${ex1}).`;
  }

  if (id === "fractions_read") {
    return `In Klasse ${grade} mit Nennern bis 5 im 1. Halbjahr und bis 8 im 2. Halbjahr (${ex1}).`;
  }

  if (id === "fractions") {
    return `In Klasse ${grade} im 1. Halbjahr gleichnamig (${ex1}), im 2. Halbjahr auch ungleichnamig sowie Mal und Geteilt (${ex2}).`;
  }

  if (id === "decimals") {
    return `In Klasse ${grade} im 1. Halbjahr mit einer Nachkommastelle (${ex1}), im 2. Halbjahr bis zwei Nachkommastellen sowie Mal und Geteilt (${ex2}).`;
  }

  if (id === "percent") {
    return `In Klasse ${grade} im 1. Halbjahr ${ex1}, im 2. Halbjahr auch mit 5 % und 20 % (${ex2}).`;
  }

  if (id === "word") {
    const byGrade = {
      3: `In Klasse 3 mit Mengen bis 36 im 1. Halbjahr und bis 80 im 2. Halbjahr (${ex1}).`,
      4: `In Klasse 4 mit Mengen bis 90 bzw. 180 und zusätzlichen Vergleichsfragen (${ex1}).`,
      5: `In Klasse 5 mit Zahlen von 40 bis 220 (${ex1}).`,
      6: `In Klasse 6 mit größeren Zahlen von 80 bis 480 (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "word_times") {
    const byGrade = {
      3: `In Klasse 3 mit Zahlen bis 36 bzw. 80 (${ex1}).`,
      4: `In Klasse 4 mit Mengen bis 180 und Verteilen auf 3 bis 6 Kinder (${ex1}).`,
      5: `In Klasse 5 mit Mengen bis 220 und Einzelpreisen bis 50 Cent (${ex1}).`,
      6: `In Klasse 6 mit Mengen bis 480 und bis zu 10 Gruppen (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "decompose") {
    return grade === 1
      ? `In Klasse 1 im 1. Halbjahr bis ${fmtDe(d1.addMax)}, im 2. Halbjahr bis ${fmtDe(d2.addMax)} (${ex1}).`
      : `In Klasse 2 im 1. Halbjahr bis ${fmtDe(d1.addMax)} (${ex1}), im 2. Halbjahr bis ${fmtDe(d2.addMax)} (${ex2}).`;
  }

  if (id === "number_wall") {
    if (grade === 1) {
      return `In Klasse 1 mit zwei Grundsteinen bis ${fmtDe(d1.addMax)} im 1. Halbjahr (${ex1}) und bis ${fmtDe(d2.addMax)} im 2. Halbjahr (${ex2}).`;
    }
    return `In Klasse ${grade} mit drei Grundsteinen im Zahlenraum bis ${fmtDe(d1.addMax)} im 1. Halbjahr und bis ${fmtDe(d2.addMax)} im 2. Halbjahr (${ex1}).`;
  }

  if (id === "neighbor" || id === "even_odd") {
    return `In Klasse ${grade} im Zahlenraum bis ${fmtDe(d1.addMax)} im 1. Halbjahr und bis ${fmtDe(d2.addMax)} im 2. Halbjahr (${ex1}).`;
  }

  if (id === "double_half") {
    const byGrade = {
      2: `In Klasse 2 mit Ausgangszahlen bis 25 im 1. Halbjahr und bis 40 im 2. Halbjahr (${ex1}).`,
      3: `In Klasse 3 mit Ausgangszahlen von 12 bis 40 bzw. 80 (${ex1}).`,
      4: `In Klasse 4 mit größeren Ausgangszahlen bis 120 bzw. 250 (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "round") {
    const byGrade = {
      3: `In Klasse 3 auf Zehner und im 2. Halbjahr auch Hunderter bis ${fmtDe(d2.addMax)} (${ex1}).`,
      4: `In Klasse 4 auf Zehner, Hunderter und im 2. Halbjahr Tausender bis 60\u202f000 (${ex1}).`,
      5: `In Klasse 5 auf Zehner, Hunderter und Tausender bis 400\u202f000 (${ex1}).`,
      6: `In Klasse 6 auf Hunderter, Tausender und im 2. Halbjahr Zehntausender bis ${fmtDe(d2.addMax)} (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "estimate") {
    const byGrade = {
      3: `In Klasse 3 mit Zahlen bis 89 auf Zehner gerundet (${ex1}).`,
      4: `In Klasse 4 im 1. Halbjahr bis 280 auf Zehner, im 2. Halbjahr bis 890 auf Hunderter (${ex1}).`,
      5: `In Klasse 5 mit Zahlen bis 890 bzw. 4\u202f500 auf Hunderter gerundet (${ex1}).`,
      6: `In Klasse 6 im 1. Halbjahr bis 8\u202f900 auf Hunderter, im 2. Halbjahr bis 28\u202f000 auf Tausender (${ex2}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "divisible") {
    const byGrade = {
      3: `In Klasse 3 durch 2, 5 und 10 bei Zahlen bis 150 (${ex1}).`,
      4: `In Klasse 4 durch 2, 5 und 10 bei Zahlen bis 250 (${ex1}).`,
      5: `In Klasse 5 durch 2, 3, 4, 5, 9 und 10 bei Zahlen bis 400 (${ex1}).`,
      6: `In Klasse 6 durch 2, 3, 4, 5, 9 und 10 bei größeren Zahlen bis 900 (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "roman") {
    return grade === 3
      ? `In Klasse 3 mit Zahlen von 4 bis 20 im 1. Halbjahr und bis 30 im 2. Halbjahr (${ex1}).`
      : `In Klasse 4 mit Zahlen von 8 bis 40 im 1. Halbjahr und bis 89 im 2. Halbjahr (${ex1}).`;
  }

  if (id === "primes") {
    return grade === 5
      ? `In Klasse 5 mit Primzahlen bis 23 im 1. Halbjahr und bis 31 im 2. Halbjahr (${ex1}).`
      : `In Klasse 6 mit größeren Primzahlen von 11 bis 43 bzw. 29 bis 59 (${ex1}).`;
  }

  if (id === "squares") {
    return grade === 5
      ? `Hier in Klasse 5 im 1. Halbjahr von 1² bis 10² (${ex1}) und im 2. Halbjahr bis 12² (${ex2}).`
      : `Hier in Klasse 6 im 1. Halbjahr von 8² bis 16² (${ex1}) mit Zehnerpotenzen bis 10⁴ und im 2. Halbjahr von 11² bis 20² mit Zehnerpotenzen bis 10⁶ (${ex2}).`;
  }

  if (id === "table_read") {
    const byGrade = {
      2: `In Klasse 2 mit Tabellenwerten bis 10 im 1. Halbjahr und bis 16 im 2. Halbjahr (${ex1}).`,
      3: `In Klasse 3 mit Tabellenwerten von 8 bis 20 bzw. 36 (${ex1}).`,
      4: `In Klasse 4 mit Tabellenwerten von 8 bis 40 bzw. 80 (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "money") {
    const byGrade = {
      1: `In Klasse 1 ab dem 2. Halbjahr mit einfachen Euro-Beträgen bis 20 € (${ex2}).`,
      2: `In Klasse 2 mit Münzbeträgen aus 5, 10, 20 und 50 ct (${ex1}).`,
      3: `In Klasse 3 im 1. Halbjahr in Cent (${ex1}), im 2. Halbjahr mit Euro-Kommazahlen bis 3,00 €.`,
      4: `In Klasse 4 mit Euro-Beträgen von 0,40 € bis 5,20 € (${ex1}).`,
      5: `In Klasse 5 mit Euro-Beträgen von 0,85 € bis 8,90 € (${ex1}).`,
      6: `In Klasse 6 mit größeren Euro-Beträgen von 1,80 € bis 14,50 € (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "clock") {
    if (grade === 1) {
      return `In Klasse 1 ab dem 2. Halbjahr mit vollen Stunden (${ex2}).`;
    }
    return grade === 2
      ? `In Klasse 2 im 1. Halbjahr volle und halbe Stunden (${ex1}), im 2. Halbjahr auch Viertelstunden.`
      : `In Klasse 3 auf 5 Minuten genau (${ex1}).`;
  }

  if (id === "length") {
    return `In Klasse ${grade} mit ganzen Metern bis 8 m im 1. Halbjahr und bis 12 m im 2. Halbjahr (${ex1}).`;
  }

  if (id === "length_convert") {
    return grade === 3
      ? `In Klasse 3 mit ganzen Metern bis 12 m bzw. 18 m in Millimeter (${ex1}).`
      : `In Klasse 4 bis 25 m in Millimeter sowie Zentimeter mit Komma in Meter (${ex1}).`;
  }

  if (id === "weight") {
    return grade === 3
      ? `In Klasse 3 mit ganzen Kilogramm bis 6 kg bzw. 10 kg (${ex1}).`
      : `In Klasse 4 mit Gewichten von 3 bis 12 kg bzw. 18 kg (${ex1}).`;
  }

  if (id === "capacity") {
    return grade === 3
      ? `In Klasse 3 mit ganzen Litern bis 10 l, Bruchteilen und Ergänzen auf 1 l (${ex1}).`
      : `In Klasse 4 mit gemischten Angaben bis 15 l und Ergänzen auf mehrere Liter (${ex1}).`;
  }

  if (id === "time_units") {
    return grade === 3
      ? `In Klasse 3 mit bis zu 8 Stunden, 6 Wochen und 4 Tagen (${ex1}).`
      : `In Klasse 4 mit größeren Zeitspannen bis 18 Stunden, 14 Wochen und 6 Tagen (${ex1}).`;
  }

  if (id === "perimeter_area") {
    const byGrade = {
      3: `In Klasse 3 Umfang von Rechtecken mit Seiten bis 8 cm bzw. 10 cm (${ex1}).`,
      4: `In Klasse 4 Umfang und Fläche von Rechtecken mit Seiten bis 12 cm bzw. 16 cm (${ex1}).`,
      5: `In Klasse 5 Umfang und Fläche von Rechtecken mit Seiten bis 16 cm bzw. 22 cm (${ex1}).`,
      6: `In Klasse 6 im 1. Halbjahr Rechtecke bis 24 cm × 16 cm (${ex1}), im 2. Halbjahr bis 36 cm × 28 cm (${ex2}) und Dreiecksflächen.`,
    };
    return byGrade[grade] || "";
  }

  if (id === "scale") {
    const byGrade = {
      4: `In Klasse 4 mit Maßstäben 1 : 50, 1 : 100 und 1 : 200 (${ex1}).`,
      5: `In Klasse 5 zusätzlich mit dem Maßstab 1 : 250 (${ex1}).`,
      6: `In Klasse 6 mit Maßstäben bis 1 : 1\u202f000 und im 2. Halbjahr auch rückwärts von Metern in Zentimeter (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "cuboid") {
    const byGrade = {
      4: `In Klasse 4 mit Kantenlängen bis 10 cm bzw. 12 cm (${ex1}).`,
      5: `In Klasse 5 mit Kantenlängen von 3 bis 12 cm (${ex1}).`,
      6: `In Klasse 6 mit größeren Kantenlängen bis 18 cm bzw. 22 cm (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "unit_convert") {
    return grade === 5
      ? `In Klasse 5 mit ganzen Zahlen bis 12 km, t oder l (${ex1}).`
      : `In Klasse 6 bis 18 Einheiten und mit Kommazahlen bei km, kg und l (${ex1}).`;
  }

  if (id === "solids") {
    const byGrade = {
      2: `In Klasse 2 mit Würfel, Quader, Kugel und Zylinder (${ex1}).`,
      3: `In Klasse 3 zusätzlich mit Pyramide, Kegel und Prisma sowie der Anzahl der Ecken (${ex1}).`,
      4: `In Klasse 4 mit allen sieben Körpern sowie Fragen nach Ecken, Kanten und Flächen (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "shapes") {
    return grade === 1
      ? `In Klasse 1 als erster Einstieg mit Kreis, Dreieck, Quadrat und Rechteck (${ex1}).`
      : `In Klasse 2 zum sicheren Unterscheiden von Quadrat, Rechteck, Dreieck und Kreis (${ex1}).`;
  }

  if (id === "position") {
    return grade === 1
      ? `In Klasse 1 mit links, rechts, über und unter dem Haus (${ex1}).`
      : `In Klasse 2 zur sicheren Orientierung mit links, rechts, über und unter dem Haus (${ex1}).`;
  }

  if (id === "pattern") {
    const byGrade = {
      1: `In Klasse 1 mit Farbmustern (${ex1}).`,
      2: `In Klasse 2 mit Farbmustern (${ex1}) und Zahlenfolgen in 2er-, 5er- und 10er-Schritten.`,
      3: `In Klasse 3 mit Zahlenfolgen in Schritten von 2 bis 10 ab Startwerten bis 8 (${ex1}).`,
      4: `In Klasse 4 mit Zahlenfolgen in Schritten von 2 bis 10 ab Startwerten von 8 bis 40 (${ex1}).`,
      5: `In Klasse 5 mit Zahlenfolgen in Schritten von 3 bis 10 ab Startwerten bis 40 (${ex1}).`,
      6: `In Klasse 6 mit Schrittweiten bis 25 und Startwerten bis 120 (${ex2}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "number_line") {
    const byGrade = {
      1: `In Klasse 1 in 1er-Schritten bis ${fmtDe(d1.addMax)} bzw. ${fmtDe(d2.addMax)} (${ex1}).`,
      2: `In Klasse 2 in 1er-, 2er- und 5er-Schritten bis ${fmtDe(d1.addMax)} bzw. ${fmtDe(d2.addMax)} (${ex1}).`,
      3: `In Klasse 3 in 1er-, 2er-, 5er- und 10er-Schritten bis ${fmtDe(d1.addMax)} bzw. ${fmtDe(d2.addMax)} (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "mirror") {
    const byGrade = {
      2: `In Klasse 2 mit sechs Grundfiguren an der Spiegelachse (${ex1}).`,
      3: `In Klasse 3 mit acht verschiedenen Figuren an der Spiegelachse (${ex1}).`,
      4: `In Klasse 4 mit allen neun Figuren inklusive Zackenformen (${ex1}).`,
    };
    return byGrade[grade] || "";
  }

  if (id === "coordinates") {
    return grade === 5
      ? `In Klasse 5 mit Achsen bis 8 im 1. Halbjahr und bis 10 im 2. Halbjahr (${ex1}).`
      : `In Klasse 6 mit Achsen bis 10 im 1. Halbjahr und bis 12 im 2. Halbjahr (${ex1}).`;
  }

  if (id === "angles") {
    return `In Klasse ${grade} mit Winkeln von 20° bis 150° zum Erkennen und Ablesen (${ex1}).`;
  }

  return ex1 ? `In Klasse ${grade}: ${ex1}.` : "";
}

function rechenartenTopicDescription(topic, grade) {
  const base = plainTopicText(
    topicDescriptions[topic.id] ||
      "Übungen zu diesem Thema im passenden Schwierigkeitsgrad."
  );
  const addon = topicGradeAddon(topic, grade);
  return addon ? `${base} ${addon}` : base;
}

function renderRechenartenJsonLd() {
  const url = `${SITE_URL}/rechenarten`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: "Rechenarten nach Klasse – mathe-testen.de",
        description:
          "Welche Mathe-Themen gibt es in Klasse 1 bis 6? Übersicht zu Rechnen, Zahlen, Größen und Geometrie, mit kurzer Erklärung.",
        inLanguage: "de-DE",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}/#klassen`,
        name: "Rechenarten nach Klasse",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: 6,
        itemListElement: [1, 2, 3, 4, 5, 6].map((grade) => ({
          "@type": "ListItem",
          position: grade,
          name: `Klasse ${grade}`,
          description: classIntros[grade],
          url: `${url}#klasse-${grade}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Rechenarten nach Klasse", item: url },
        ],
      },
    ],
  };
}

function renderRechenartenMain() {
  const sections = [1, 2, 3, 4, 5, 6]
    .map((grade) => {
      const groups = groupOrder
        .map((groupId) => {
          const items = topics.filter(
            (topic) =>
              topic.group === groupId &&
              (isTopicAllowed(topic, grade, 1) || isTopicAllowed(topic, grade, 2))
          );
          if (!items.length) {
            return "";
          }
          const lis = items
            .map((topic) => {
              const term = isTopicAllowed(topic, grade, 1) ? 1 : 2;
              const note =
                isTopicAllowed(topic, grade, 1) && isTopicAllowed(topic, grade, 2)
                  ? ""
                  : term === 1
                    ? "1. Halbjahr"
                    : "ab 2. Halbjahr";
              const href = `/klasse-${grade}/uebungen?halbjahr=${term}&themen=${encodeURIComponent(topic.id)}`;
              const noteHtml = note
                ? ` <span class="grade-topic-note">(${escapeHtml(note)})</span>`
                : "";
              const description = rechenartenTopicDescription(topic, grade);
              return `<li class="grade-topic-item"><a href="${href}">${escapeHtml(topicLabelForGrade(topic, grade))}</a>${noteHtml}<p>${escapeHtml(description)}</p></li>`;
            })
            .join("\n                ");
          return `<div class="home-category">
              <h3>${escapeHtml(GROUPS[groupId])}</h3>
              <ul class="home-topic-hubs grade-topic-list">
                ${lis}
              </ul>
            </div>`;
        })
        .filter(Boolean)
        .join("\n            ");

      const gradeHubLinks = topicHubs
        .filter((hub) => hub.grades.includes(grade))
        .map((hub) => `<a class="text-link" href="/${hub.slug}">${escapeHtml(hub.shortName)}</a>`)
        .join(" · ");

      return `<section class="home-class-card" id="klasse-${grade}" aria-labelledby="rechenarten-klasse-${grade}">
          <h2 id="rechenarten-klasse-${grade}"><a class="text-link" href="/klasse-${grade}">Klasse ${grade}</a></h2>
          <p class="home-class-intro">${escapeHtml(classIntros[grade])}</p>
          <div class="home-categories">
            ${groups}
          </div>
          <p class="landing-overview-hint">Vertiefende Themen-Seiten: ${gradeHubLinks}</p>
          <p><a class="text-link" href="/klasse-${grade}">Übersicht Klasse ${grade}</a> · <a class="text-link" href="/klasse-${grade}/uebungen">Übungsaufgaben Klasse ${grade}</a></p>
        </section>`;
    })
    .join("\n");

  const jumps = [1, 2, 3, 4, 5, 6]
    .map((grade) => `<a class="text-link" href="#klasse-${grade}">Klasse ${grade}</a>`)
    .join("\n            ");

  return `<main class="legal-page landing-page rechenarten-page">
          <nav class="grade-jump" aria-label="Direkt zu einer Klasse">
            ${jumps}
          </nav>
          ${sections}
          <a class="btn-secondary to-top" href="#seitenanfang">Nach oben</a>
        </main>`;
}

function writeRechenartenPage() {
  const description =
    "Welche Mathe-Themen gibt es in Klasse 1 bis 6? Übersicht zu Rechnen, Zahlen, Größen und Geometrie, mit kurzer Erklärung und Link zu den Übungsaufgaben.";
  const html = renderInfoPage({
    current: "rechenarten",
    title: "Rechenarten nach Klasse – mathe-testen.de",
    description,
    url: `${SITE_URL}/rechenarten`,
    h1: "Rechenarten nach Klasse",
    lead: "Alle Übungsthemen für Klasse 1 bis 6. Jede Klasse ist in Rechnen, Zahlen, Größen und Geometrie geteilt. Unter dem Namen steht in ein bis zwei Sätzen, worum es geht. Der Name öffnet die Übung, unter der Liste stehen die Übungsaufgaben der Klasse.",
    jsonLd: renderRechenartenJsonLd(),
    mainHtml: renderRechenartenMain(),
    crumb: "Rechenarten nach Klasse",
  });
  fs.writeFileSync(path.join(root, "rechenarten.html"), html, "utf8");
  console.log("wrote rechenarten.html");
}

writeRechenartenPage();
if (process.argv.includes("--nur-rechenarten")) {
  process.exit(0);
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
    crumb: "FAQ",
  }),
  "utf8"
);
console.log("wrote faq.html");

const newsMain = `<main class="legal-page landing-page news-page">
          <div class="news-list">
            ${NEWS_ITEMS.map(
              (item) => `<article class="news-item">
              <time datetime="${item.dateIso}">${escapeHtml(item.date)}</time>
              <h2>${escapeHtml(item.title)}</h2>
              <p>${escapeHtml(item.text)}</p>
              <p><a class="text-link" href="${item.href}">${escapeHtml(item.linkLabel)}</a></p>
            </article>`
            ).join("\n")}
          </div>
        </main>`;

fs.writeFileSync(
  path.join(root, "neuigkeiten.html"),
  renderInfoPage({
    current: "neu",
    title: "Neuigkeiten – mathe-testen.de",
    description: "Neue Übungen und wichtige Verbesserungen auf mathe-testen.de.",
    url: `${SITE_URL}/neuigkeiten`,
    h1: "Neuigkeiten",
    lead: "Neue Übungen und wichtige Verbesserungen für Kinder, Eltern und Lehrkräfte.",
    jsonLd: renderNewsJsonLd(),
    mainHtml: newsMain,
  }),
  "utf8"
);
console.log("wrote neuigkeiten.html");

const teachersMain = `<main class="legal-page landing-page">
          ${teachersPage.sections
            .map((section, index) => {
              const headingId = section.id || `teachers-h-${index}`;
              const textHtml = section.text ? `\n            <p>${escapeHtml(section.text)}</p>` : "";
              const extraHtml = section.html ? `\n            ${section.html}` : "";
              return `<section aria-labelledby="${headingId}">
            <h2 id="${headingId}">${escapeHtml(section.heading)}</h2>${textHtml}${extraHtml}
          </section>`;
            })
            .join("\n")}
          ${renderNewsTeaser(
            "Neu für den Unterricht",
            "Neue Aufgabenarten und Verbesserungen, die sich direkt in der Klasse oder zur Vorbereitung einsetzen lassen."
          )}
          <p class="page-actions">
            <a class="btn-primary" href="/">Klasse wählen und üben</a>
            <a class="btn-secondary" href="/faq">Zu den häufigen Fragen</a>
            <a class="btn-secondary" href="/kontakt">Anpassung wünschen</a>
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
          ${renderNewsTeaser(
            "Neu beim Üben",
            "Hier findest du neue Übungsmöglichkeiten für zu Hause, jeweils direkt mit der passenden Seite verlinkt."
          )}
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

const contactMain = `<main class="legal-page landing-page">
          <p>Schreib gern, wenn etwas nicht stimmt oder du dir etwas anders wünschst. Typische Anliegen:</p>
          <ul>
            <li>Fehler oder unklare Aufgaben</li>
            <li>fehlende Themen, andere Klassen oder Anpassungen am PDF</li>
            <li>Ideen für den Einsatz in der Schule oder zu Hause</li>
          </ul>
          <p>Am hilfreichsten sind Klasse, Thema und ein kurzer Satz, was du brauchst. Es gibt kein Formular und kein Konto.</p>
          <p class="page-actions">
            <a class="btn-primary email-protected" href="#" data-keep-label data-u="a29udGFrdA==" data-d="bWF0aGUtdGVzdGVuLmRl">E-Mail schreiben</a>
          </p>
          <p class="hint">Die Adresse lautet <span class="email-protected" data-u="a29udGFrdA==" data-d="bWF0aGUtdGVzdGVuLmRl">kontakt [at] mathe-testen.de</span>.</p>
        </main>`;

fs.writeFileSync(
  path.join(root, "kontakt.html"),
  renderInfoPage({
    current: "kontakt",
    title: contactPage.title,
    description: contactPage.description,
    url: `${SITE_URL}/kontakt`,
    h1: contactPage.h1,
    lead: contactPage.lead,
    jsonLd: renderContactJsonLd(),
    mainHtml: contactMain,
  }),
  "utf8"
);
console.log("wrote kontakt.html");

updateHomePage();
updateSitemap();
console.log("done");
