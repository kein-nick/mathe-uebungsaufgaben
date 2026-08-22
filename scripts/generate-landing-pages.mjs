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

const classIntros = {
  1: "In Klasse 1 geht es um erste Zahlen, Plus und Minus bis 20 sowie einfache Vergleiche und Zerlegen.",
  2: "In Klasse 2 vertiefst du Plus und Minus, lernst das Einmaleins und erste Größen wie Geld und Uhr.",
  3: "In Klasse 3 kommen größere Zahlen, schriftliches Rechnen, Tabellen und erste Sachaufgaben dazu.",
  4: "In Klasse 4 übst du schriftliche Verfahren, Bruchanteile, Geometrie und Größen umrechnen.",
  5: "In Klasse 5 vertiefst du Brüche, Dezimalzahlen, Prozent und anspruchsvollere Sachaufgaben.",
  6: "In Klasse 6 bereitest du dich auf die weiterführende Schule vor: Brüche, Prozent, Dreisatz und mehr.",
};

const classDetails = {
  1: "Typisch für Klasse 1 sind Aufgaben im Zahlenraum bis 20: Plus- und Minusrechnungen ohne Zehnerübergang, später mit. Dazu kommen Vergleichen von Zahlen, Zerlegen in Zehner und Einer sowie einfache Sachaufgaben mit kurzen Texten.",
  2: "In Klasse 2 werden Plus und Minus bis 100 sicherer, das Einmaleins wird eingeführt und geübt. Außerdem gibt es Aufgaben zu Geld und Uhr, zum Verdoppeln und Halbieren sowie erste Übungen mit Tabellen und einfachen Mustern.",
  3: "Klasse 3 bedeutet größere Zahlen und schriftliches Rechnen. Du übst Addition, Subtraktion, Multiplikation und Division mit mehrstelligen Zahlen, Punkt-vor-Strich-Aufgaben, Sachaufgaben, Runden und erste Größen wie Länge, Gewicht und Umfang.",
  4: "In Klasse 4 kommen schriftliche Rechenverfahren, Bruchanteile und anspruchsvollere Sachaufgaben hinzu. Geometrie umfasst Formen, Spiegeln und Flächen, dazu Größen umrechnen und Arbeiten mit Tabellen und Diagrammen.",
  5: "Klasse 5 vertieft Brüche, Dezimalzahlen und Prozent. Du rechnest mit größeren Zahlen, löst Gleichungen und Dreisatzaufgaben und übst Geometrie mit Winkeln, Koordinaten und Maßstab.",
  6: "In Klasse 6 wiederholst und festigst du die wichtigsten Themen für die weiterführende Schule: Brüche, Dezimalzahlen, Prozent, Dreisatz, negative Zahlen und anspruchsvolle Sachaufgaben aus allen Bereichen.",
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

function practiceUrl(grade) {
  return `/?klasse=${grade}`;
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

      let html = `<section class="landing-group">
          <h3>${escapeHtml(GROUPS[groupId])}</h3>`;

      if (active.length) {
        const term1Labels = active
          .filter((topic) => isTopicAllowed(topic, grade, 1))
          .map((topic) => topic.label);
        const term2Labels = active
          .filter((topic) => isTopicAllowed(topic, grade, 2))
          .map((topic) => topic.label);
        const sameTerms =
          term1Labels.length === term2Labels.length &&
          term1Labels.every((label, index) => label === term2Labels[index]);

        if (sameTerms && term1Labels.length) {
          html += `<p>${escapeHtml(term1Labels.join(", "))}.</p>`;
        } else {
          if (term1Labels.length) {
            html += `<p><strong>1. Halbjahr:</strong> ${escapeHtml(term1Labels.join(", "))}.</p>`;
          }
          if (term2Labels.length) {
            html += `<p><strong>2. Halbjahr:</strong> ${escapeHtml(term2Labels.join(", "))}.</p>`;
          }
        }
      }

      if (preview.length) {
        const previewLabels = preview.map((topic) => `${topic.label} (ab Klasse ${topic.fromGrade})`);
        html += `<p class="hint">Vorschau: ${escapeHtml(previewLabels.join(", "))}.</p>`;
      }

      html += "</section>";
      return html;
    })
    .filter(Boolean)
    .join("\n");
}

function renderClassPage(grade) {
  const topicOverview = renderTopicOverview(grade);

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Mathe-Übungen für Klasse ${grade}: Themenübersicht zu Rechnen, Zahlen, Größen und Geometrie — kostenlos online üben oder als PDF."
    />
    <link rel="canonical" href="https://mathe-testen.de/klasse-${grade}" />
    <title>Mathe Klasse ${grade} – Themen &amp; Übungen</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/style.css" />
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
            <h2 id="topics-heading-${grade}">Diese Rechenarten und Themen gibt es</h2>
            ${topicOverview}
          </section>

          <p class="landing-cta-row">
            <a class="create-btn landing-cta" href="${practiceUrl(grade)}">Zu den Übungsaufgaben</a>
          </p>
          <p class="hint landing-cta-hint">Dort wählst du Halbjahr, Anzahl und genaue Themen — die Klasse ${grade} ist schon vorausgewählt.</p>
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

console.log("done");
