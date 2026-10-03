# Ideen für die Mathe-Übungsseite

Offene Verbesserungsvorschläge für die Seite.  
Stand: 3. Oktober 2026

---

## Bereits umgesetzt

- Countdown mit Zeitlimit, Start-Button und Markierung verspäteter Antworten
- PDF-Export; kurze 10er-Blöcke teilen sich eine Seite, wenn noch ein ganzer Block Platz hat
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
- Zahlenmauern für Klasse 1 bis 3, online und im PDF
- Hohlmaße mit Liter und Milliliter für Klasse 3 und 4
- Körper erkennen für Klasse 2 bis 4, online und im PDF
- Quadratzahlen und einfache Zehnerpotenzen für Klasse 5 und 6
- Zehnerfreunde in Klasse 1 und 2, Hunderterfreunde in Klasse 2, im Thema Zerlegen

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

#### Orientierungsstufe (Klasse 5 und 6)

1. **ggT und kgV (Klasse 5–6)**
   - *Beschreibung:* Größter gemeinsamer Teiler und kleinstes gemeinsames Vielfaches (z. B. ggT von 24 und 36 = 12).
   - *Warum lohnend:* Rechnerischer Kern für das Kürzen und Gleichnamigmachen von Brüchen.
   - *Aufwand:* gering.

2. **Zufall & Wahrscheinlichkeit (Klasse 4–6)**
   - *Beschreibung:* Grundbegriffe wie *sicher, möglich, unmöglich*, Wahrscheinlichkeiten bei Würfeln (z. B. „Chance auf eine gerade Zahl: 3 von 6“) oder Ziehen von Kugeln aus einer Urne.
   - *Warum lohnend:* Steht in fast allen neuen Bildungsplänen unter „Daten und Zufall“.
   - *Aufwand:* mittel bis hoch (eindeutige Sprache, Darstellungen und passende Antwortformate).

---

## Betrieb und Statistik

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Werbung aktivieren** | `SHOW_ADS` und `ads-off` wieder einschalten, wenn Anbieter steht | gering |
| **Eigenes Admin-Dashboard** | Nur sinnvoll bei sehr speziellen Fragen (z. B. „wie oft Brüche?“) — braucht Backend | hoch |

---

## Bewusst weggelassen

Diese Ideen passen eher nicht zum Konzept der Seite:

- Login, Benutzerkonten, Cloud-Speicherung
- Zu viele Belohnungen, Avatare, Punktesysteme
- Großer Umbau der Code-Struktur ohne konkreten Nutzen
- Eigene Datenbank nur für Besucherzahlen (Vercel Analytics reicht)
- Wechsel zu Plausible oder Umami (Vercel Web Analytics bleibt)

---

## Empfohlene Reihenfolge

1. Zufall & Wahrscheinlichkeit
2. ggT und kgV
3. Vollständige Links mit Einstellungen
4. Letzte Einstellungen merken

Vor Werbung oder zusätzlichem Tracking den Einwilligungsbedarf erneut prüfen.
