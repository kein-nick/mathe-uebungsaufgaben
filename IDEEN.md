# Ideen für die Mathe-Übungsseite

Offene Verbesserungsvorschläge für die Seite.  
Stand: September 2026

---

## Bereits umgesetzt

- Countdown mit Zeitlimit, Start-Button und Markierung verspäteter Antworten
- PDF-Export (4×2 Blöcke pro Seite, ohne Rechenweg-Felder)
- Mobile-Layout (Start/Prüfen/Bestzeiten an passenden Stellen)
- Gleichmäßige Verteilung gemischter Rechenarten
- Werbeplätze ausblendbar (`SHOW_ADS` / `ads-off`)
- Vercel Web Analytics
- Kürzerer Einstieg mit aufklappbarer Anleitung „So funktioniert's“
- Fortschrittsanzeige beim Üben („X von Y richtig“)
- Button „Neues Blatt“ (gleiche Einstellungen, neue Aufgaben)
- Favicon und Meta-Beschreibung
- Open-Graph- und Twitter-Tags inkl. Vorschaubild
- PWA mit Offline-Unterstützung (Service Worker, Manifest)
- Installations-Hinweis („Als App installieren?“) — auf iOS mit Schritt-für-Schritt-Anleitung
- App-Icons und Apple-Touch-Icon
- Impressum und Datenschutzerklärung
- Sitemap, robots.txt und IndexNow
- Lokale Schriften ohne Google Fonts
- Lösungsblatt als separates PDF
- Schnellstarts über Themen- und Klassenseiten
- Teilbare Links mit vorausgewählten Themen
- Öffentliche Neuigkeiten-Seite mit Hinweis-Punkt im Kopfbereich

---

## Wichtig (öffentliche Seite)

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Cookie-/Einwilligungs-Hinweis prüfen** | Vercel Analytics benötigt derzeit voraussichtlich keinen Banner. Vor Werbung oder zusätzlichem Tracking erneut prüfen. | gering |

---

## Für Eltern und Lehrkräfte

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Vollständige Links mit Einstellungen** | Themen lassen sich bereits per URL vorauswählen; Halbjahr, Blockanzahl und weitere Optionen könnten noch ergänzt werden. | mittel |
| **Drucken ohne PDF** | Direkt aus dem Browser drucken, optimiertes Print-CSS | gering |

---

## Für Kinder beim Üben

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Tipp nach falschem Ergebnis** | Optional einen kleinen Hinweis (z. B. „Rechne nochmal von links“) | mittel |
| **Tastatur-Flow** | Mit Tab/Enter schneller von Aufgabe zu Aufgabe springen | gering |
| **Kleine Erfolgs-Momente** | z. B. kurzer Hinweis bei jedem 10er-Block geschafft — dezent, nicht verspielt | gering |

---

## Technik und Reichweite

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Neue Themen gezielt bekannt machen** | Neue Themenseiten und größere Erweiterungen in Sitemap, `llms.txt` und IndexNow berücksichtigen. | gering |

---

## Inhalt

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Weitere Themen** | Lücken im Lehrplan schließen (siehe Detail-Katalog unten) | je nach Thema |
| **Schwierigkeits-Stufe** | Zusätzlich zum Halbjahr: „leicht / normal / schwer“ pro Übung | hoch |
| **Letzte Einstellungen merken** | Klasse, Themen und Anzahl beim nächsten Besuch vorauswählen (LocalStorage) | gering |

### Mögliche neue Themen (Lehrplan-Kandidaten)

Die App deckt bereits viele Themen ab. Lehrpläne unterscheiden sich jedoch nach Bundesland und Schulform; eine genaue Prozentangabe wäre deshalb nicht belastbar. Folgende Ergänzungen schließen erkennbare Lücken oder vertiefen häufig geübte Inhalte:

#### Grundschule (Klasse 1 bis 4)

1. **Zahlenmauern / Rechenpyramiden (Klasse 1–3)**
   - *Beschreibung:* 3 Steine (2 unten, 1 oben) oder 6 Steine (3 unten, 2 Mitte, 1 oben). Entweder zwei Nachbarsteine addieren oder bei gegebener Deckzahl rückwärts subtrahieren.
   - *Warum lohnend:* Der absolute Grundschul-Klassiker mit enorm hohem Wiedererkennungswert bei Kindern und Lehrkräften. Lässt sich per SVG/HTML sauber im Web und im PDF darstellen.
   - *Aufwand:* mittel (SVG-Template für Mauer + Generator).

2. **Hohlmaße: Liter & Milliliter (Klasse 3–4)**
   - *Beschreibung:* Liter und Milliliter grundschulgerecht umrechnen ($1\,\text{l} = 1000\,\text{ml}$, $\frac{1}{2}\,\text{l} = 500\,\text{ml}$, $250\,\text{ml} + \underline{\quad} = 1\,\text{l}$), Flaschen-/Rezept-Aufgaben.
   - *Warum lohnend:* Schließt die Lücke bei den Größen in Klasse 3/4. Liter und Milliliter kommen bisher nur im allgemeinen Thema „Größen umrechnen“ ab Klasse 5 vor.
   - *Aufwand:* gering.

3. **Geometrische Körper erkennen (Klasse 2–4)**
   - *Beschreibung:* Ergänzung der vorhandenen 2D-Formen um Würfel, Quader, Kugel, Zylinder, Pyramide und Kegel. Das bestehende Thema „Würfel / Quader“ behandelt dagegen Volumenaufgaben ab Klasse 4.
   - *Aufgaben-Typen:* „Welcher Körper ist das?“ (Multiple Choice mit kleiner 3D-SVG/Isometrie) oder Eigenschaften wie „Wie viele Ecken/Kanten/Flächen hat ein Würfel?“.
   - *Warum lohnend:* Fester Bestandteil im Lehrplan Geometrie Kl. 2–4.
   - *Aufwand:* gering bis mittel.

4. **Zehner- und Hunderterfreunde als Erweiterung von „Zerlegen“ (Klasse 1–2)**
   - *Beschreibung:* Das vorhandene Thema „Zerlegen“ gezielt um Zahlenpaare ergänzen, die zusammen 10 ergeben ($3 + \underline{7} = 10$), sowie in Klasse 2 um Hunderterfreunde ($30 + \underline{70} = 100$).
   - *Warum lohnend:* Fundamentales Automatisierungs-Training für den Zehnerübergang.
   - *Aufwand:* sehr gering; kein eigenes Thema nötig.

#### Orientierungsstufe (Klasse 5 und 6)

5. **Quadratzahlen & einfache Potenzen (Klasse 5–6)**
   - *Beschreibung:* Das kleine 1×1 der Quadratzahlen von $1^2$ bis $20^2$ ($12 \times 12 = 144$) und einfache Zehnerpotenzen ($10^3 = 1000$).
   - *Warum lohnend:* Schnelles Kopfrechnen-Training, wichtige Vorbereitung für Flächenberechnung, Pythagoras und Wurzeln.
   - *Aufwand:* sehr gering.

6. **ggT und kgV (Klasse 5–6)**
   - *Beschreibung:* Größter gemeinsamer Teiler und kleinstes gemeinsames Vielfaches (z. B. ggT von 24 und 36 = 12).
   - *Warum lohnend:* Rechnerischer Kern für das Kürzen und Gleichnamigmachen von Brüchen.
   - *Aufwand:* gering.

7. **Zufall & Wahrscheinlichkeit (Klasse 4–6)**
   - *Beschreibung:* Grundbegriffe wie *sicher, möglich, unmöglich*, Wahrscheinlichkeiten bei Würfeln (z. B. „Chance auf eine gerade Zahl: 3 von 6“) oder Ziehen von Kugeln aus einer Urne.
   - *Warum lohnend:* Steht in fast allen neuen Bildungsplänen unter „Daten und Zufall“.
   - *Aufwand:* mittel bis hoch (eindeutige Sprache, Darstellungen und passende Antwortformate).

---

## Betrieb und Statistik

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Werbung aktivieren** | `SHOW_ADS` und `ads-off` wieder einschalten, wenn Anbieter steht | gering |
| **Datenschutzfreundlichere Analytics** | z. B. Plausible oder Umami statt Vercel — weniger Abhängigkeit | mittel |
| **Eigenes Admin-Dashboard** | Nur sinnvoll bei sehr speziellen Fragen (z. B. „wie oft Brüche?“) — braucht Backend | hoch |

---

## Bewusst weggelassen

Diese Ideen passen eher nicht zum Konzept der Seite:

- Login, Benutzerkonten, Cloud-Speicherung
- Zu viele Belohnungen, Avatare, Punktesysteme
- Großer Umbau der Code-Struktur ohne konkreten Nutzen
- Eigene Datenbank nur für Besucherzahlen (Vercel Analytics reicht)

---

## Empfohlene Reihenfolge

1. Zahlenmauern / Rechenpyramiden
2. Hohlmaße: Liter & Milliliter
3. Geometrische Körper erkennen
4. Quadratzahlen & einfache Potenzen
5. Zufall & Wahrscheinlichkeit
6. ggT und kgV
7. Zehner- und Hunderterfreunde in „Zerlegen“ ergänzen
8. Vollständige Links mit Einstellungen
9. Letzte Einstellungen merken

Vor Werbung oder zusätzlichem Tracking den Einwilligungsbedarf erneut prüfen.
