import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const topicsSrc = fs.readFileSync(path.join(root, "topics.js"), "utf8");
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

function practiceUrl(grade, term, topicIds) {
  const params = new URLSearchParams();
  params.set("klasse", String(grade));
  params.set("halbjahr", String(term));
  if (topicIds.length) {
    params.set("themen", topicIds.join(","));
  }
  return `/?${params.toString()}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const classIntros = {
  1: "In Klasse 1 geht es um erste Zahlen, Plus und Minus bis 20 sowie einfache Vergleiche und Zerlegen.",
  2: "In Klasse 2 vertiefst du Plus und Minus, lernst das Einmaleins und erste Größen wie Geld und Uhr.",
  3: "In Klasse 3 kommen größere Zahlen, schriftliches Rechnen, Tabellen und erste Sachaufgaben dazu.",
  4: "In Klasse 4 übst du schriftliche Verfahren, Bruchanteile, Geometrie und Größen umrechnen.",
  5: "In Klasse 5 vertiefst du Brüche, Dezimalzahlen, Prozent und anspruchsvollere Sachaufgaben.",
  6: "In Klasse 6 bereitest du dich auf die weiterführende Schule vor: Brüche, Prozent, Dreisatz und mehr.",
};

const groupOrder = ["rechnen", "zahlen", "groessen", "geometrie"];

function renderClassPage(grade) {
  const allowedTopics = topics.filter((topic) => isTopicListed(topic, grade));
  const groupSections = groupOrder
    .map((groupId) => {
      const items = allowedTopics.filter((topic) => topic.group === groupId);
      if (!items.length) {
        return "";
      }
      const list = items
        .map((topic) => {
          const term1 = isTopicAllowed(topic, grade, 1);
          const term2 = isTopicAllowed(topic, grade, 2);
          const note =
            !term1 && term2
              ? " <span class=\"landing-topic-note\">(ab 2. Halbjahr)</span>"
              : term1 && !term2 && topic.untilGrade === grade && topic.untilTerm === 1
                ? " <span class=\"landing-topic-note\">(1. Halbjahr)</span>"
                : !term1 && !term2
                  ? ` <span class=\"landing-topic-note\">(ab Klasse ${topic.fromGrade})</span>`
                  : "";
          const links = [];
          if (term1) {
            links.push(
              `<a class="landing-practice-link" href="${practiceUrl(grade, 1, [topic.id])}">1. HJ üben</a>`
            );
          }
          if (term2) {
            links.push(
              `<a class="landing-practice-link" href="${practiceUrl(grade, 2, [topic.id])}">2. HJ üben</a>`
            );
          }
          const actions = links.length
            ? `<span class="landing-topic-actions">${links.join("")}</span>`
            : "";
          return `<li class="landing-topic-item">
              <span class="landing-topic-label">${escapeHtml(topic.label)}${note}</span>
              ${actions}
            </li>`;
        })
        .join("\n");

      return `<section class="landing-group">
          <h2>${escapeHtml(GROUPS[groupId])}</h2>
          <ul class="landing-topic-list">${list}</ul>
          <p><a class="landing-group-link" href="${practiceUrl(
            grade,
            2,
            items.filter((topic) => isTopicAllowed(topic, grade, 2)).map((topic) => topic.id)
          )}">Alle ${escapeHtml(GROUPS[groupId])}-Themen dieser Klasse üben (2. Halbjahr)</a></p>
        </section>`;
    })
    .filter(Boolean)
    .join("\n");

  const allIds = allowedTopics.filter((topic) => isTopicAllowed(topic, grade, 2)).map((topic) => topic.id);

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Kostenlose Mathe-Übungen für Klasse ${grade}: alle Themen nach Kategorien — online üben mit optionalem Zeitlimit oder als PDF."
    />
    <link rel="canonical" href="https://mathe-testen.de/klasse-${grade}" />
    <title>Mathe üben Klasse ${grade} – Themen &amp; Übungen</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body class="ads-off legal-page-body">
    <div class="page-shell">
      <div class="page">
        <header class="intro">
          <p class="kicker"><a class="text-link" href="/">Zur Startseite</a></p>
          <h1>Mathe üben – Klasse ${grade}</h1>
          <p class="description">${classIntros[grade]}</p>
          <p class="landing-class-nav">
            ${[1, 2, 3, 4, 5, 6]
              .map(
                (n) =>
                  `<a href="/klasse-${n}"${n === grade ? ' aria-current="page"' : ""}>Klasse ${n}</a>`
              )
              .join(" · ")}
          </p>
        </header>

        <main class="legal-page landing-page">
          <p class="landing-lead">
            Wähle ein Thema und starte direkt mit passenden Aufgaben. Du landest auf dem
            Übungsblatt mit vorausgewählter Klasse und Thema — Halbjahr und Anzahl der Aufgaben
            kannst du dort noch anpassen.
          </p>
          <p class="landing-cta-row">
            <a class="create-btn landing-cta" href="${practiceUrl(grade, 2, allIds)}">Alle Themen der Klasse ${grade} üben</a>
          </p>
          ${groupSections}
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
  </body>
</html>`;
}

for (let grade = 1; grade <= 6; grade += 1) {
  const filePath = path.join(root, `klasse-${grade}.html`);
  fs.writeFileSync(filePath, renderClassPage(grade), "utf8");
  console.log("wrote", filePath);
}

const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
for (let grade = 1; grade <= 6; grade += 1) {
  const entry = `  <url>
    <loc>https://mathe-testen.de/klasse-${grade}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  if (!sitemap.includes(`/klasse-${grade}</loc>`)) {
    sitemap = sitemap.replace("</urlset>", `${entry}\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap, "utf8");
console.log("updated sitemap.xml");
