/**
 * Pinterest-Pins für mathe-testen.de (1024×1536) – Pflege wie bei einfach pflegen:
 * nur PIN_PRESETS anpassen, dann Generator laufen lassen.
 *
 *   npm i --no-save sharp opentype.js
 *   node scripts/generate-pinterest-pin.mjs klasse-3-plus-minus
 *   node scripts/generate-pinterest-pin.mjs --list
 *   node scripts/generate-pinterest-pin.mjs --all
 *
 * Aufbau:
 *   - Wortmarke „Mathematik Übungsaufgaben“ (Fraunces)
 *   - Titel + Unterzeile (Nunito Bold)
 *   - Weißes Blatt, leicht gekippt, mit Mini-Arbeitsblatt
 *   - Button „Kostenlos als PDF“ + URL
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'pinterest')
const fontDir = join(__dirname, 'fonts')

const FONTS = {
  frauncesBold: {
    file: 'Fraunces-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf',
  },
  nunitoBold: {
    file: 'Nunito-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmRTM.ttf',
  },
  nunitoSemiBold: {
    file: 'Nunito-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDGUmRTM.ttf',
  },
}

const W = 1024
const H = 1536
const BG = '#f6f1e6'
const INK = '#1c2430'
const GRADE = '#2f5d50'
const MUTED = '#5b6573'
const LINE = '#d7cbb6'
const HEAD = '#e8f0ec'
const CARD = '#fffdf8'

/** Layout analog Pflege-Pin (Pixelbänder) */
const REF = {
  wordmark: { top: 36, line1Size: 42, line2Size: 36, gap: 8 },
  titleBand: { top: 225, bottom: 315, maxWidth: 820 },
  subtitleBand: { top: 353, bottom: 398 },
  sheet: { width: 730, height: 863, angle: 1.77, centerX: 513, centerY: 867 },
  footer: { top: 1327, buttonH: 78, buttonMaxW: 520, urlGap: 28 },
}

/**
 * @typedef {{ title: string, tasks: string[] }} PinBlock
 * @typedef {{
 *   id: string
 *   fileName: string
 *   headline: string
 *   subline?: string
 *   sheetTitle?: string
 *   sheetSubtitle?: string
 *   urlLine: string
 *   buttonLabel?: string
 *   screenshot?: string
 *   blocks?: PinBlock[]
 * }} PinPreset
 */

/** Nur diese Daten pro Pin ändern. Layout/Button/Logo kommen aus der Vorlage. */
export const PIN_PRESETS = /** @type {Record<string, PinPreset>} */ ({
  'klasse-3-plus-minus': {
    id: 'klasse-3-plus-minus',
    fileName: 'pinterest-klasse-3-plus-minus.png',
    headline: 'Mathe Klasse 3',
    subline: 'Plus und Minus zum Ausdrucken',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 3 · 2. Halbjahr · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-3/uebungen',
    blocks: [
      {
        title: 'Addition · 1–10',
        tasks: [
          '12 + 7 =', '24 + 15 =', '33 + 8 =', '41 + 19 =', '16 + 25 =',
          '38 + 11 =', '27 + 14 =', '45 + 6 =', '19 + 22 =', '30 + 18 =',
        ],
      },
      {
        title: 'Addition · 11–20',
        tasks: [
          '13 + 26 =', '44 + 9 =', '21 + 17 =', '36 + 12 =', '28 + 7 =',
          '15 + 34 =', '42 + 8 =', '17 + 23 =', '39 + 10 =', '26 + 16 =',
        ],
      },
      {
        title: 'Subtraktion · 21–30',
        tasks: [
          '20 − 7 =', '34 − 12 =', '41 − 8 =', '28 − 15 =', '50 − 19 =',
          '36 − 9 =', '45 − 18 =', '27 − 6 =', '39 − 14 =', '22 − 11 =',
        ],
      },
      {
        title: 'Subtraktion · 31–40',
        tasks: [
          '48 − 16 =', '31 − 8 =', '40 − 17 =', '26 − 9 =', '35 − 13 =',
          '49 − 21 =', '33 − 7 =', '44 − 15 =', '29 − 10 =', '38 − 12 =',
        ],
      },
    ],
  },
  einmaleins: {
    id: 'einmaleins',
    fileName: 'pinterest-einmaleins.png',
    headline: 'Einmaleins üben',
    subline: 'Arbeitsblatt zum Ausdrucken',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Einmaleins · 40 Aufgaben · mit Lösungen',
    urlLine: 'mathe-testen.de/einmaleins',
    blocks: [
      {
        title: 'Malnehmen · 1–10',
        tasks: [
          '3 × 4 =', '7 × 6 =', '8 × 5 =', '9 × 3 =', '4 × 7 =',
          '6 × 8 =', '5 × 9 =', '2 × 12 =', '8 × 3 =', '9 × 4 =',
        ],
      },
      {
        title: 'Malnehmen · 11–20',
        tasks: [
          '9 × 7 =', '8 × 8 =', '6 × 9 =', '7 × 8 =', '4 × 9 =',
          '5 × 7 =', '3 × 11 =', '12 × 4 =', '7 × 9 =', '6 × 7 =',
        ],
      },
      {
        title: 'Malnehmen · 21–30',
        tasks: [
          '8 × 6 =', '9 × 5 =', '7 × 7 =', '4 × 8 =', '3 × 9 =',
          '11 × 5 =', '12 × 3 =', '8 × 9 =', '6 × 6 =', '5 × 8 =',
        ],
      },
      {
        title: 'Malnehmen · 31–40',
        tasks: [
          '9 × 9 =', '7 × 5 =', '12 × 6 =', '8 × 7 =', '4 × 12 =',
          '11 × 8 =', '9 × 6 =', '3 × 12 =', '7 × 4 =', '10 × 9 =',
        ],
      },
    ],
  },
  'schriftlich-rechnen': {
    id: 'schriftlich-rechnen',
    fileName: 'pinterest-schriftlich-rechnen.png',
    headline: 'Schriftlich rechnen',
    subline: 'Plus und Minus mit Übertrag',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Schriftliches Rechnen · Klasse 3–4 · 40 Aufgaben',
    urlLine: 'mathe-testen.de/schriftlich-rechnen',
    blocks: [
      {
        title: 'Plus · 1–10',
        tasks: [
          '247 + 186 =', '358 + 274 =', '419 + 365 =', '526 + 198 =', '673 + 249 =',
          '804 + 157 =', '391 + 428 =', '615 + 287 =', '472 + 339 =', '558 + 176 =',
        ],
      },
      {
        title: 'Plus · 11–20',
        tasks: [
          '284 + 457 =', '639 + 185 =', '726 + 198 =', '503 + 378 =', '461 + 259 =',
          '817 + 146 =', '392 + 548 =', '675 + 237 =', '448 + 366 =', '591 + 284 =',
        ],
      },
      {
        title: 'Minus · 21–30',
        tasks: [
          '532 − 178 =', '704 − 256 =', '861 − 394 =', '640 − 285 =', '915 − 467 =',
          '783 − 319 =', '850 − 276 =', '624 − 158 =', '907 − 348 =', '735 − 269 =',
        ],
      },
      {
        title: 'Minus · 31–40',
        tasks: [
          '812 − 457 =', '690 − 238 =', '943 − 576 =', '760 − 384 =', '854 − 297 =',
          '921 − 465 =', '638 − 179 =', '875 − 346 =', '704 − 258 =', '963 − 487 =',
        ],
      },
    ],
  },
  'klasse-5': {
    id: 'klasse-5',
    fileName: 'pinterest-klasse-5.png',
    headline: 'Mathe Klasse 5',
    subline: 'Brüche, Dezimal & Prozent als PDF',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 5 · Brüche · Dezimal · Prozent · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-5/uebungen',
    blocks: [
      {
        title: 'Brüche · 1–10',
        tasks: [
          '1/2 von 18 =', '1/4 von 20 =', '3/4 von 16 =', '1/3 von 15 =', '2/3 von 21 =',
          '1/5 von 25 =', '2/5 von 30 =', '1/8 von 24 =', '3/8 von 32 =', '1/10 von 40 =',
        ],
      },
      {
        title: 'Dezimalzahlen · 11–20',
        tasks: [
          '2,5 + 1,3 =', '4,8 + 2,7 =', '6,4 − 1,9 =', '3,6 + 4,5 =', '9,2 − 3,8 =',
          '1,75 + 2,25 =', '5,6 − 2,4 =', '7,3 + 1,8 =', '8,5 − 4,7 =', '0,9 + 3,6 =',
        ],
      },
      {
        title: 'Prozent · 21–30',
        tasks: [
          '10 % von 80 =', '50 % von 64 =', '25 % von 40 =', '20 % von 55 =', '5 % von 100 =',
          '75 % von 20 =', '30 % von 90 =', '15 % von 60 =', '40 % von 25 =', '1 % von 200 =',
        ],
      },
      {
        title: 'Quadratzahlen · 31–40',
        tasks: [
          '6² =', '7² =', '8² =', '9² =', '10² =',
          '11² =', '12² =', '5² =', '4² =', '3² =',
        ],
      },
    ],
  },
  'klasse-4': {
    id: 'klasse-4',
    fileName: 'pinterest-klasse-4.png',
    headline: 'Mathe Klasse 4',
    subline: 'Schriftlich rechnen & Division',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 4 · schriftlich · Division · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-4/uebungen',
    blocks: [
      {
        title: 'Schriftlich plus · 1–10',
        tasks: [
          '247 + 186 =', '358 + 274 =', '419 + 365 =', '526 + 198 =', '673 + 249 =',
          '804 + 157 =', '391 + 428 =', '615 + 287 =', '472 + 339 =', '558 + 176 =',
        ],
      },
      {
        title: 'Schriftlich minus · 11–20',
        tasks: [
          '532 − 178 =', '704 − 256 =', '861 − 394 =', '640 − 285 =', '915 − 467 =',
          '783 − 319 =', '850 − 276 =', '624 − 158 =', '907 − 348 =', '735 − 269 =',
        ],
      },
      {
        title: 'Malnehmen · 21–30',
        tasks: [
          '24 × 6 =', '35 × 7 =', '48 × 5 =', '63 × 4 =', '72 × 8 =',
          '56 × 9 =', '81 × 3 =', '47 × 6 =', '39 × 8 =', '54 × 7 =',
        ],
      },
      {
        title: 'Division mit Rest · 31–40',
        tasks: [
          '17 : 5 =', '23 : 4 =', '31 : 6 =', '29 : 7 =', '38 : 5 =',
          '44 : 8 =', '53 : 6 =', '47 : 9 =', '35 : 4 =', '61 : 7 =',
        ],
      },
    ],
  },
  'klasse-1': {
    id: 'klasse-1',
    fileName: 'pinterest-klasse-1.png',
    headline: 'Mathe Klasse 1',
    subline: 'Plus, Minus & Zehnerfreunde als PDF',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 1 · Plus · Minus · Zehnerfreunde · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-1/uebungen',
    blocks: [
      {
        title: 'Addition · 1–10',
        tasks: [
          '3 + 4 =', '5 + 2 =', '6 + 3 =', '7 + 1 =', '4 + 5 =',
          '8 + 2 =', '9 + 1 =', '2 + 6 =', '5 + 4 =', '3 + 5 =',
        ],
      },
      {
        title: 'Subtraktion · 11–20',
        tasks: [
          '9 − 3 =', '8 − 2 =', '7 − 4 =', '10 − 6 =', '9 − 5 =',
          '8 − 5 =', '6 − 2 =', '10 − 3 =', '7 − 5 =', '9 − 4 =',
        ],
      },
      {
        title: 'Zehnerfreunde · 21–30',
        tasks: [
          '3 + __ = 10', '7 + __ = 10', '2 + __ = 10', '8 + __ = 10', '4 + __ = 10',
          '6 + __ = 10', '1 + __ = 10', '9 + __ = 10', '5 + __ = 10', '__ + 3 = 10',
        ],
      },
      {
        title: 'Plus bis 20 · 31–40',
        tasks: [
          '12 + 5 =', '14 + 3 =', '11 + 6 =', '13 + 4 =', '15 + 2 =',
          '16 + 3 =', '10 + 7 =', '18 + 1 =', '12 + 6 =', '11 + 8 =',
        ],
      },
    ],
  },
  'klasse-2': {
    id: 'klasse-2',
    fileName: 'pinterest-klasse-2.png',
    headline: 'Mathe Klasse 2',
    subline: 'Plus, Minus & Einmaleins als PDF',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 2 · Plus · Minus · Einmaleins · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-2/uebungen',
    blocks: [
      {
        title: 'Addition · 1–10',
        tasks: [
          '7 + 5 =', '9 + 6 =', '8 + 4 =', '12 + 7 =', '15 + 8 =',
          '11 + 9 =', '14 + 6 =', '13 + 8 =', '16 + 5 =', '10 + 9 =',
        ],
      },
      {
        title: 'Subtraktion · 11–20',
        tasks: [
          '15 − 7 =', '18 − 9 =', '14 − 6 =', '20 − 8 =', '17 − 5 =',
          '16 − 9 =', '19 − 7 =', '13 − 4 =', '12 − 8 =', '11 − 6 =',
        ],
      },
      {
        title: 'Einmaleins · 21–30',
        tasks: [
          '2 × 4 =', '3 × 5 =', '4 × 3 =', '5 × 2 =', '2 × 8 =',
          '3 × 6 =', '4 × 5 =', '5 × 4 =', '2 × 9 =', '3 × 7 =',
        ],
      },
      {
        title: 'Einmaleins · 31–40',
        tasks: [
          '4 × 6 =', '5 × 5 =', '3 × 8 =', '2 × 7 =', '4 × 7 =',
          '5 × 6 =', '3 × 9 =', '4 × 8 =', '5 × 3 =', '2 × 6 =',
        ],
      },
    ],
  },
  brueche: {
    id: 'brueche',
    fileName: 'pinterest-brueche.png',
    headline: 'Brüche üben',
    subline: 'Anteile erkennen & rechnen (PDF)',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Brüche · Anteile · Klasse 4–6 · 40 Aufgaben',
    urlLine: 'mathe-testen.de/brueche',
    blocks: [
      {
        title: 'Anteile · 1–10',
        tasks: [
          '1/2 von 18 =', '1/4 von 20 =', '3/4 von 16 =', '1/3 von 15 =', '2/3 von 21 =',
          '1/5 von 25 =', '2/5 von 30 =', '1/8 von 24 =', '3/8 von 32 =', '1/10 von 40 =',
        ],
      },
      {
        title: 'Anteile · 11–20',
        tasks: [
          '1/2 von 24 =', '1/4 von 28 =', '3/4 von 12 =', '1/3 von 27 =', '2/3 von 18 =',
          '1/5 von 40 =', '3/5 von 20 =', '1/6 von 30 =', '5/6 von 18 =', '1/8 von 40 =',
        ],
      },
      {
        title: 'Anteile · 21–30',
        tasks: [
          '1/2 von 50 =', '1/4 von 36 =', '3/4 von 24 =', '1/3 von 33 =', '2/5 von 35 =',
          '3/5 von 25 =', '1/10 von 70 =', '7/10 von 20 =', '1/8 von 32 =', '5/8 von 16 =',
        ],
      },
      {
        title: 'Anteile · 31–40',
        tasks: [
          '1/2 von 64 =', '1/4 von 48 =', '3/4 von 40 =', '1/3 von 36 =', '2/3 von 30 =',
          '1/5 von 45 =', '4/5 von 15 =', '1/6 von 42 =', '5/6 von 24 =', '3/10 von 50 =',
        ],
      },
    ],
  },
  prozent: {
    id: 'prozent',
    fileName: 'pinterest-prozent.png',
    headline: 'Prozent rechnen',
    subline: 'Anteile von Hundert zum Ausdrucken',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Prozent · Klasse 5–6 · 40 Aufgaben',
    urlLine: 'mathe-testen.de/prozent',
    blocks: [
      {
        title: 'Prozent · 1–10',
        tasks: [
          '10 % von 80 =', '50 % von 64 =', '25 % von 40 =', '20 % von 55 =', '5 % von 100 =',
          '75 % von 20 =', '30 % von 90 =', '15 % von 60 =', '40 % von 25 =', '1 % von 200 =',
        ],
      },
      {
        title: 'Prozent · 11–20',
        tasks: [
          '10 % von 150 =', '50 % von 86 =', '25 % von 80 =', '20 % von 45 =', '5 % von 60 =',
          '75 % von 40 =', '30 % von 70 =', '15 % von 80 =', '40 % von 50 =', '2 % von 100 =',
        ],
      },
      {
        title: 'Prozent · 21–30',
        tasks: [
          '10 % von 240 =', '50 % von 120 =', '25 % von 60 =', '20 % von 85 =', '5 % von 80 =',
          '75 % von 32 =', '30 % von 50 =', '15 % von 40 =', '40 % von 75 =', '1 % von 350 =',
        ],
      },
      {
        title: 'Prozent · 31–40',
        tasks: [
          '10 % von 360 =', '50 % von 48 =', '25 % von 120 =', '20 % von 95 =', '5 % von 200 =',
          '75 % von 80 =', '30 % von 120 =', '15 % von 200 =', '40 % von 90 =', '8 % von 50 =',
        ],
      },
    ],
  },
  'klasse-6': {
    id: 'klasse-6',
    fileName: 'pinterest-klasse-6.png',
    headline: 'Mathe Klasse 6',
    subline: 'Brüche, Prozent & Potenzen als PDF',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Klasse 6 · Brüche · Prozent · Potenzen · 40 Aufgaben',
    urlLine: 'mathe-testen.de/klasse-6/uebungen',
    blocks: [
      {
        title: 'Brüche · 1–10',
        tasks: [
          '1/2 von 36 =', '3/4 von 28 =', '2/3 von 27 =', '1/5 von 45 =', '3/5 von 40 =',
          '1/8 von 48 =', '5/8 von 24 =', '1/10 von 90 =', '7/10 von 50 =', '2/5 von 55 =',
        ],
      },
      {
        title: 'Prozent · 11–20',
        tasks: [
          '10 % von 250 =', '50 % von 96 =', '25 % von 84 =', '20 % von 65 =', '5 % von 180 =',
          '75 % von 48 =', '30 % von 140 =', '15 % von 120 =', '40 % von 85 =', '12 % von 50 =',
        ],
      },
      {
        title: 'Quadratzahlen · 21–30',
        tasks: [
          '11² =', '12² =', '13² =', '14² =', '15² =',
          '16² =', '17² =', '18² =', '19² =', '20² =',
        ],
      },
      {
        title: 'Zehnerpotenzen · 31–40',
        tasks: [
          '10² =', '10³ =', '10⁴ =', '2 × 10² =', '3 × 10³ =',
          '5 × 10² =', '4 × 10³ =', '7 × 10² =', '6 × 10³ =', '9 × 10² =',
        ],
      },
    ],
  },
  sachaufgaben: {
    id: 'sachaufgaben',
    fileName: 'pinterest-sachaufgaben.png',
    headline: 'Sachaufgaben Mathe',
    subline: 'Textaufgaben zum Ausdrucken',
    sheetTitle: 'Mathematik Übungsaufgaben',
    sheetSubtitle: 'Sachaufgaben · Grundschule · 40 Aufgaben',
    urlLine: 'mathe-testen.de/sachaufgaben',
    blocks: [
      {
        title: 'Plus & Minus · 1–10',
        tasks: [
          '12 + 9 =', '18 − 7 =', '15 + 8 =', '24 − 9 =', '16 + 14 =',
          '30 − 12 =', '21 + 11 =', '28 − 15 =', '19 + 17 =', '35 − 18 =',
        ],
      },
      {
        title: 'Plus & Minus · 11–20',
        tasks: [
          '42 + 18 =', '50 − 23 =', '37 + 26 =', '64 − 29 =', '45 + 37 =',
          '80 − 46 =', '53 + 28 =', '71 − 35 =', '49 + 33 =', '90 − 57 =',
        ],
      },
      {
        title: 'Mal & Geteilt · 21–30',
        tasks: [
          '6 × 4 =', '8 × 5 =', '7 × 3 =', '9 × 6 =', '24 : 4 =',
          '35 : 5 =', '4 × 8 =', '6 × 7 =', '48 : 6 =', '27 : 3 =',
        ],
      },
      {
        title: 'Mal & Geteilt · 31–40',
        tasks: [
          '5 × 9 =', '7 × 8 =', '6 × 9 =', '8 × 7 =', '56 : 7 =',
          '36 : 4 =', '9 × 4 =', '8 × 6 =', '63 : 9 =', '42 : 6 =',
        ],
      },
    ],
  },
  'app-play': {
    id: 'app-play',
    fileName: 'pinterest-app-play.png',
    headline: 'Mathe üben Klasse 1–6',
    subline: 'Kostenlose App bei Google Play',
    urlLine: 'Google Play · Mathe üben',
    buttonLabel: 'Jetzt installieren',
    screenshot: 'icons/play-telefon-01-klassen.jpg',
  },
})

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function ensureFont({ file, url }) {
  const path = join(fontDir, file)
  if (existsSync(path)) return path
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Font-Download ${file}: ${response.status}`)
  mkdirSync(fontDir, { recursive: true })
  writeFileSync(path, Buffer.from(await response.arrayBuffer()))
  return path
}

function loadFont(path, { dropGsub = false } = {}) {
  const buf = readFileSync(path)
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  // opentype.js kann einige GSUB-Lookups (Fraunces) nicht – für Latein-Text nicht nötig.
  if (dropGsub) delete font.tables.gsub
  return font
}

function capHeightRatio(font) {
  const cap = font.tables?.os2?.sCapHeight
  if (cap) return cap / font.unitsPerEm
  const bb = font.getPath('H', 0, 0, font.unitsPerEm).getBoundingBox()
  return -bb.y1 / font.unitsPerEm
}

/** Eigene Pfad-Serialisierung – opentype.js toPathData() liefert vereinzelt „NaN“. */
function pathData(path) {
  const n = (v) => (Math.round(v * 100) / 100).toString()
  return path.commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
        default:
          return 'Z'
      }
    })
    .join('')
}

/** Text als SVG-Pfad (zentriert bei anchor=middle). */
function textPath(font, text, { x, y, size, fill, anchor = 'start' }) {
  const width = font.getAdvanceWidth(text, size)
  const startX = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  return `<path d="${pathData(font.getPath(text, startX, y, size))}" fill="${fill}"/>`
}

function buildWordmarkSvg(fraunces) {
  const line1 = 'Mathematik'
  const line2 = 'Übungsaufgaben'
  const s1 = REF.wordmark.line1Size
  const s2 = REF.wordmark.line2Size
  const y1 = REF.wordmark.top + s1
  const y2 = y1 + REF.wordmark.gap + s2 * 0.85
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${textPath(fraunces, line1, { x: W / 2, y: y1, size: s1, fill: INK, anchor: 'middle' })}
  ${textPath(fraunces, line2, { x: W / 2, y: y2, size: s2, fill: GRADE, anchor: 'middle' })}
</svg>`)
}

/** Titel + Unterzeile (beide auf max. Breite begrenzt, damit nichts abgeschnitten wird) */
function buildTitlesSvg(nunitoBold, preset) {
  const capRatio = capHeightRatio(nunitoBold)
  const maxW = REF.titleBand.maxWidth
  const refTitleSize = (REF.titleBand.bottom - REF.titleBand.top) / capRatio
  const titleWidthAtOne = nunitoBold.getAdvanceWidth(preset.headline, 1)
  const titleSize = Math.min(refTitleSize, maxW / titleWidthAtOne)
  const titleCap = titleSize * capRatio
  const titleBaseline =
    REF.titleBand.bottom - (REF.titleBand.bottom - REF.titleBand.top - titleCap) / 2

  const subline = preset.subline ?? 'Arbeitsblatt zum Ausdrucken'
  const refSubtitleSize = (REF.subtitleBand.bottom - REF.subtitleBand.top) / capRatio
  const subWidthAtOne = nunitoBold.getAdvanceWidth(subline, 1)
  const subtitleSize = Math.min(refSubtitleSize, maxW / subWidthAtOne)

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${textPath(nunitoBold, preset.headline, { x: W / 2, y: titleBaseline, size: titleSize, fill: INK, anchor: 'middle' })}
  ${textPath(nunitoBold, subline, { x: W / 2, y: REF.subtitleBand.bottom, size: subtitleSize, fill: INK, anchor: 'middle' })}
</svg>`)
}

/** Mini-Arbeitsblatt in 1x-Koordinaten (730×863), gerendert mit scale=2.
 *  Layout wie echtes PDF: bis zu 4 volle 10er-Blöcke in 2×2. */
function buildSheetSvg(preset, fraunces, nunitoBold, nunitoSemi) {
  const sw = REF.sheet.width
  const sh = REF.sheet.height
  const mx = 28
  const parts = []
  let y = 36

  // Blatt-Wortmarke
  const wmSize = 22
  const wMath = fraunces.getAdvanceWidth('Mathematik', wmSize)
  const wGap = wmSize * 0.18
  const wUeb = fraunces.getAdvanceWidth('Übungsaufgaben', wmSize)
  const wmStart = (sw - (wMath + wGap + wUeb)) / 2
  parts.push(`<path d="${pathData(fraunces.getPath('Mathematik', wmStart, y, wmSize))}" fill="${INK}"/>`)
  parts.push(
    `<path d="${pathData(fraunces.getPath('Übungsaufgaben', wmStart + wMath + wGap, y, wmSize))}" fill="${GRADE}"/>`,
  )

  y += 30
  parts.push(textPath(nunitoBold, preset.sheetTitle, { x: sw / 2, y, size: 22, fill: GRADE, anchor: 'middle' }))
  y += 22
  parts.push(
    textPath(nunitoSemi, preset.sheetSubtitle, { x: sw / 2, y, size: 13, fill: INK, anchor: 'middle' }),
  )

  // Name / Datum
  y += 22
  const metaLabels = ['Name', 'Datum']
  const metaColW = (sw - mx * 2) / metaLabels.length
  metaLabels.forEach((label, i) => {
    const x0 = mx + i * metaColW
    const labelW = nunitoSemi.getAdvanceWidth(`${label}:`, 12)
    parts.push(textPath(nunitoSemi, `${label}:`, { x: x0, y, size: 12, fill: INK }))
    parts.push(
      `<line x1="${x0 + labelW + 8}" y1="${y + 1}" x2="${x0 + metaColW - 14}" y2="${y + 1}" stroke="${INK}" stroke-width="0.9"/>`,
    )
  })

  // Bis zu 4 Blöcke à 10 Aufgaben in 2 Spalten × 2 Zeilen
  const blocks = preset.blocks.slice(0, 4)
  const cols = 2
  const gapX = 12
  const gapY = 10
  const blockW = (sw - mx * 2 - gapX) / cols
  const blockTop0 = y + 16
  const footerReserve = 32
  const availableH = sh - blockTop0 - footerReserve
  const rows = Math.ceil(blocks.length / cols)
  const blockH = (availableH - gapY * (rows - 1)) / rows
  const headH = 22
  const padX = 8
  const tasksPerBlock = 10
  const rowH = (blockH - headH - 6) / tasksPerBlock

  blocks.forEach((block, bi) => {
    const col = bi % cols
    const row = Math.floor(bi / cols)
    const bx = mx + col * (blockW + gapX)
    const by = blockTop0 + row * (blockH + gapY)
    const tasks = block.tasks.slice(0, tasksPerBlock)
    const startNum = bi * tasksPerBlock + 1

    parts.push(
      `<rect x="${bx}" y="${by}" width="${blockW}" height="${blockH}" rx="5" fill="${CARD}" stroke="${LINE}" stroke-width="1.1"/>`,
    )
    parts.push(`<rect x="${bx}" y="${by}" width="${blockW}" height="${headH}" rx="5" fill="${HEAD}"/>`)
    parts.push(`<rect x="${bx}" y="${by + headH - 6}" width="${blockW}" height="6" fill="${HEAD}"/>`)
    parts.push(
      textPath(nunitoBold, block.title, {
        x: bx + blockW / 2,
        y: by + 15,
        size: 11,
        fill: INK,
        anchor: 'middle',
      }),
    )

    tasks.forEach((task, i) => {
      const ty = by + headH + 2 + i * rowH
      if (i > 0) {
        parts.push(
          `<line x1="${bx + 6}" y1="${ty}" x2="${bx + blockW - 6}" y2="${ty}" stroke="${LINE}" stroke-width="0.9" stroke-dasharray="2.5 2.5"/>`,
        )
      }
      const num = `${startNum + i}.`
      const textY = ty + rowH * 0.68
      const fontSize = Math.min(13, Math.max(10, rowH * 0.55))
      parts.push(textPath(nunitoSemi, num, { x: bx + padX, y: textY, size: fontSize, fill: MUTED }))
      parts.push(textPath(nunitoBold, task, { x: bx + padX + 26, y: textY, size: fontSize, fill: INK }))
      const boxH = Math.min(16, rowH * 0.7)
      const boxW = 28
      const boxX = bx + blockW - padX - boxW
      const boxY = ty + (rowH - boxH) / 2
      parts.push(
        `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="2.5" fill="#FFFFFF" stroke="${LINE}" stroke-width="1"/>`,
      )
    })
  })

  // Fußzeile auf dem Blatt
  const fy = sh - 18
  parts.push(textPath(nunitoSemi, 'Seite 1 von 1', { x: mx, y: fy, size: 11, fill: MUTED }))
  parts.push(
    textPath(nunitoSemi, 'Weitere Aufgaben unter mathe-testen.de', {
      x: sw - mx,
      y: fy,
      size: 11,
      fill: GRADE,
      anchor: 'end',
    }),
  )

  const scale = 2
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${sw * scale}" height="${sh * scale}" xmlns="http://www.w3.org/2000/svg">
  <g transform="scale(${scale})">
    <rect width="${sw}" height="${sh}" fill="#FFFFFF"/>
    ${parts.join('\n    ')}
  </g>
</svg>`)
}

/** Blatt kippen + weicher Schatten. */
async function buildTiltedSheet(sheetSvg) {
  const scale = 2
  const pad = 60 * scale
  const flat = await sharp(sheetSvg).png().toBuffer({ resolveWithObject: true })

  const padded = await sharp({
    create: {
      width: flat.info.width + pad * 2,
      height: flat.info.height + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: flat.data, left: pad, top: pad }])
    .png()
    .toBuffer()

  const rotated = await sharp(padded)
    .rotate(-REF.sheet.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true })

  const alpha = await sharp(rotated.data).extractChannel(3).toBuffer()
  const shadow = await sharp({
    create: {
      width: rotated.info.width,
      height: rotated.info.height,
      channels: 3,
      background: { r: 28, g: 36, b: 48 },
    },
  })
    .joinChannel(alpha)
    .blur(9 * scale)
    .linear([1, 1, 1, 0.22], [0, 0, 0, 0])
    .png()
    .toBuffer()

  const withShadow = await sharp(rotated.data)
    .composite([{ input: shadow, left: 3 * scale, top: 7 * scale, blend: 'dest-over' }])
    .png()
    .toBuffer()

  return sharp(withShadow)
    .resize({ width: Math.round(rotated.info.width / scale) })
    .png()
    .toBuffer({ resolveWithObject: true })
}

/** Button + URL als Footer-Band. */
function buildFooterSvg(nunitoBold, nunitoSemi, preset) {
  const label = preset.buttonLabel ?? 'Kostenlos als PDF'
  const btnSize = 28
  const labelW = nunitoBold.getAdvanceWidth(label, btnSize)
  const padX = 36
  const btnW = Math.min(REF.footer.buttonMaxW, labelW + padX * 2 + 40)
  const btnH = REF.footer.buttonH
  const btnX = (W - btnW) / 2
  const btnY = REF.footer.top
  const labelBaseline = btnY + btnH / 2 + btnSize * 0.32
  const iconCx = btnX + 28
  const iconCy = btnY + btnH / 2
  const urlSize = Math.min(22, Math.floor(900 / Math.max(preset.urlLine.length * 0.55, 1)))
  const urlY = btnY + btnH + REF.footer.urlGap + urlSize * 0.2

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${btnX}" y="${btnY}" width="${btnW}" height="${btnH}" rx="14" fill="${GRADE}"/>
  <rect x="${iconCx - 11}" y="${iconCy - 13}" width="18" height="22" rx="2" fill="#FFFFFF"/>
  <path d="M${iconCx + 1} ${iconCy - 13} L${iconCx + 7} ${iconCy - 7} L${iconCx + 1} ${iconCy - 7} Z" fill="${HEAD}"/>
  <rect x="${iconCx - 7}" y="${iconCy - 2}" width="10" height="2" rx="1" fill="${GRADE}"/>
  <rect x="${iconCx - 7}" y="${iconCy + 3}" width="10" height="2" rx="1" fill="${GRADE}"/>
  <rect x="${iconCx - 7}" y="${iconCy + 8}" width="7" height="2" rx="1" fill="${GRADE}"/>
  ${textPath(nunitoBold, label, { x: btnX + padX + 28, y: labelBaseline, size: btnSize, fill: '#FFFFFF' })}
  ${textPath(nunitoSemi, preset.urlLine, { x: W / 2, y: urlY, size: urlSize, fill: INK, anchor: 'middle' })}
</svg>`)
}

/** Handy-Screenshot mit Geräte-Rahmen, Schatten und leichter Neigung.
 *  Seitenverhältnis 1:2 des Quellenbilds strikt beibehalten (kein Stauchen). */
async function buildFramedScreenshot(relativePath) {
  const src = join(root, relativePath)
  if (!existsSync(src)) throw new Error(`Screenshot fehlt: ${src}`)

  // Schmal genug, damit Titel und Button Luft behalten; Seitenverhältnis 1:2 bleibt
  const targetW = 390
  const bezel = 11
  const radius = 38
  const angle = 1.2

  const screen = await sharp(src)
    .resize({ width: targetW, withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true })

  const innerW = screen.info.width
  const innerH = screen.info.height
  const outerW = innerW + bezel * 2
  const outerH = innerH + bezel * 2
  const screenRx = Math.max(12, radius - 10)

  const screenMask = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${innerW}" height="${innerH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${innerW}" height="${innerH}" rx="${screenRx}" fill="#fff"/>
</svg>`)
  const roundedScreen = await sharp(screen.data)
    .composite([{ input: await sharp(screenMask).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer()

  const frameSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${outerW}" height="${outerH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${outerW}" height="${outerH}" rx="${radius}" fill="${INK}"/>
  <rect x="3" y="3" width="${outerW - 6}" height="${outerH - 6}" rx="${radius - 3}" fill="${GRADE}"/>
  <rect x="${bezel - 2}" y="${bezel - 2}" width="${innerW + 4}" height="${innerH + 4}" rx="${screenRx + 2}" fill="#1a1a1a"/>
</svg>`)

  const framed = await sharp(frameSvg)
    .composite([{ input: roundedScreen, left: bezel, top: bezel }])
    .png()
    .toBuffer({ resolveWithObject: true })

  const pad = 40
  const padded = await sharp({
    create: {
      width: framed.info.width + pad * 2,
      height: framed.info.height + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: framed.data, left: pad, top: pad }])
    .png()
    .toBuffer()

  const rotated = await sharp(padded)
    .rotate(-angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true })

  const alpha = await sharp(rotated.data).extractChannel(3).toBuffer()
  const shadow = await sharp({
    create: {
      width: rotated.info.width,
      height: rotated.info.height,
      channels: 3,
      background: { r: 28, g: 36, b: 48 },
    },
  })
    .joinChannel(alpha)
    .blur(16)
    .linear([1, 1, 1, 0.26], [0, 0, 0, 0])
    .png()
    .toBuffer()

  return sharp(rotated.data)
    .composite([{ input: shadow, left: 5, top: 12, blend: 'dest-over' }])
    .png()
    .toBuffer({ resolveWithObject: true })
}

export async function renderPinterestPin(preset) {
  const fraunces = loadFont(await ensureFont(FONTS.frauncesBold), { dropGsub: true })
  const nunitoBold = loadFont(await ensureFont(FONTS.nunitoBold), { dropGsub: true })
  const nunitoSemi = loadFont(await ensureFont(FONTS.nunitoSemiBold), { dropGsub: true })

  const wordmark = await sharp(buildWordmarkSvg(fraunces)).png().toBuffer()
  const titles = await sharp(buildTitlesSvg(nunitoBold, preset)).png().toBuffer()
  const footer = await sharp(buildFooterSvg(nunitoBold, nunitoSemi, preset)).png().toBuffer()

  const center =
    preset.screenshot != null
      ? await buildFramedScreenshot(preset.screenshot)
      : await buildTiltedSheet(buildSheetSvg(preset, fraunces, nunitoBold, nunitoSemi))

  // App-Pin: zwischen Titelband und Button zentrieren (kein Überdecken)
  const centerY = preset.screenshot != null ? 860 : REF.sheet.centerY

  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, preset.fileName)

  await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([
      { input: wordmark, left: 0, top: 0 },
      { input: titles, left: 0, top: 0 },
      {
        input: center.data,
        left: Math.round(REF.sheet.centerX - center.info.width / 2),
        top: Math.round(centerY - center.info.height / 2),
      },
      { input: footer, left: 0, top: 0 },
    ])
    .png()
    .toFile(outPath)

  return outPath
}

const arg = process.argv[2]

if (arg === '--list') {
  console.log(Object.keys(PIN_PRESETS).join('\n'))
  process.exit(0)
}

if (arg === '--all') {
  for (const id of Object.keys(PIN_PRESETS)) {
    const path = await renderPinterestPin(PIN_PRESETS[id])
    console.log('OK', path)
  }
  process.exit(0)
}

const id = arg ?? 'klasse-3-plus-minus'
const preset = PIN_PRESETS[id]
if (!preset) {
  console.error(`Unbekannter Pin: ${id}`)
  console.error('Verfügbar:', Object.keys(PIN_PRESETS).join(', '))
  process.exit(1)
}

const path = await renderPinterestPin(preset)
console.log('OK', path)
