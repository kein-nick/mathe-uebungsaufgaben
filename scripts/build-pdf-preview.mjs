import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const additions = [
  [12, 7], [24, 15], [33, 8], [41, 19], [16, 25], [38, 11], [27, 14], [45, 6], [19, 22], [30, 18],
  [13, 26], [44, 9], [21, 17], [36, 12], [28, 7], [15, 34], [42, 8], [17, 23], [39, 10], [26, 16],
  [18, 21], [35, 14], [29, 9], [11, 37], [46, 5], [22, 18], [31, 12], [14, 27], [40, 13], [25, 15],
  [32, 16], [20, 19], [43, 7], [10, 28], [37, 11], [23, 14], [48, 6], [16, 22], [34, 15], [27, 13],
];

const subtractions = [
  [20, 7], [34, 12], [41, 8], [28, 15], [50, 19], [36, 9], [45, 18], [27, 6], [39, 14], [22, 11],
  [48, 16], [31, 8], [40, 17], [26, 9], [35, 13], [49, 21], [33, 7], [44, 15], [29, 10], [38, 12],
  [47, 19], [24, 8], [42, 16], [30, 11], [46, 18], [25, 9], [37, 14], [21, 6], [43, 20], [32, 13],
  [50, 22], [28, 7], [41, 15], [23, 8], [39, 17], [34, 10], [48, 24], [27, 12], [36, 9], [45, 16],
];

function taskHtml(index, a, op, b) {
  const symbol = op === "+" ? "+" : "−";
  return `<div class="task-item">
            <div class="task">
              <span class="task-num">${index}.</span>
              <span class="task-eq"><span>${a}</span><span>${symbol}</span><span>${b}</span><span>=</span></span>
              <span class="pdf-answer-cell"><span class="answer-input"></span></span>
            </div>
          </div>`;
}

function blockHtml(title, start, pairs, op) {
  const items = pairs
    .map((pair, i) => taskHtml(start + i, pair[0], op, pair[1]))
    .join("\n");
  return `<article class="block">
          <h3>${title}</h3>
          ${items}
        </article>`;
}

const addBlocks = [
  blockHtml("Addition · 1–10", 1, additions.slice(0, 10), "+"),
  blockHtml("Addition · 11–20", 11, additions.slice(10, 20), "+"),
  blockHtml("Addition · 21–30", 21, additions.slice(20, 30), "+"),
  blockHtml("Addition · 31–40", 31, additions.slice(30, 40), "+"),
];
const subBlocks = [
  blockHtml("Subtraktion · 41–50", 41, subtractions.slice(0, 10), "−"),
  blockHtml("Subtraktion · 51–60", 51, subtractions.slice(10, 20), "−"),
  blockHtml("Subtraktion · 61–70", 61, subtractions.slice(20, 30), "−"),
  blockHtml("Subtraktion · 71–80", 71, subtractions.slice(30, 40), "−"),
];

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=794" />
    <title>PDF-Vorschau</title>
    <link rel="stylesheet" href="/style.css?v=34" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
        min-height: 0;
      }
      .pdf-preview-capture .pdf-sheet {
        position: static;
        left: auto;
        top: auto;
        width: 794px;
        pointer-events: none;
      }
    </style>
  </head>
  <body class="pdf-preview-capture">
    <div class="pdf-sheet">
      <section class="pdf-page">
        <header class="pdf-header">
          <p class="kicker">Klassen 1 bis 6</p>
          <h1>Mathematik Übungsaufgaben</h1>
          <p>Klasse 3 · 2. Halbjahr · 80 Aufgaben</p>
          <p>Themen: Addition 40, Subtraktion 40</p>
          <p class="print-meta">Name: ______________________ &nbsp; Datum: ______________</p>
        </header>
        <div class="pdf-blocks">
          ${addBlocks.join("\n")}
          ${subBlocks.join("\n")}
        </div>
        <footer class="pdf-site-footer">
          <span class="pdf-site-footer-page">Seite 1 von 1</span>
          <span class="pdf-site-footer-promo">
            <span class="pdf-site-footer-text">Weitere Aufgaben unter mathe-testen.de</span>
            <img class="pdf-site-footer-qr" src="/icons/qr-mathe-testen.png" width="52" height="52" alt="" />
          </span>
        </footer>
      </section>
    </div>
  </body>
</html>
`;

const outDir = path.join(root, "scripts");
fs.writeFileSync(path.join(outDir, "pdf-preview-page.html"), html, "utf8");
console.log("wrote scripts/pdf-preview-page.html");
