# Ideen für die Mathe-Übungsseite

Offene Verbesserungsvorschläge — **ohne** das, was schon umgesetzt ist
(Countdown, PDF-Layout, Mobile-Layout, Fortschritt, Neues Blatt, Favicon, Analytics usw.).

Stand: August 2026

---

## Wichtig (öffentliche Seite)

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Impressum** | Pflichtseite für den Betreiber, Link im Footer | gering |
| **Datenschutzerklärung** | Beschreibung von Analytics, LocalStorage (Bestzeiten), ggf. Werbung | gering |
| **Cookie-/Einwilligungs-Hinweis** | Falls Analytics oder Werbung aktiv sind — in DE oft nötig | mittel |

---

## Für Eltern und Lehrkräfte

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Lösungsblatt als PDF** | Optional zweites PDF nur mit den richtigen Antworten | mittel |
| **Schnellstart-Vorlagen** | z. B. „Einmaleins Klasse 2“ oder „Brüche Klasse 5“ mit einem Klick | gering |
| **Link mit Einstellungen** | URL wie `?klasse=3&themen=plus,minus&anzahl=20` zum Teilen | mittel |
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
| **PWA / Offline** | Seite auf dem Tablet installierbar, auch ohne Internet nutzbar | ~~mittel~~ erledigt |
| **Apple-Touch-Icon** | Icon beim „Zum Home-Bildschirm hinzufügen“ auf dem Handy | gering |
| **Open-Graph-Tags** | Schöne Vorschau, wenn jemand den Link teilt (WhatsApp, iMessage) | ~~gering~~ erledigt |
| **Sitemap / robots.txt** | Bessere Auffindbarkeit bei Google | gering |
| **Seitenladezeit** | Schriften lokal hosten statt Google Fonts — weniger Abhängigkeit | gering |

---

## Inhalt

| Idee | Kurzbeschreibung | Aufwand |
|------|------------------|---------|
| **Weitere Themen** | Lücken im Lehrplan schließen, wo noch nichts angeboten wird | je nach Thema |
| **Schwierigkeits-Stufe** | Zusätzlich zum Halbjahr: „leicht / normal / schwer“ pro Übung | hoch |
| **Gemischte Übungsblätter speichern** | Letzte Einstellungen merken (LocalStorage) | gering |

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

1. Impressum + Datenschutz (rechtlich, schnell erledigt)
2. Schnellstart-Vorlagen + Open-Graph (viel Nutzen, wenig Aufwand)
3. Lösungsblatt-PDF (stark für Eltern)
4. Link mit Einstellungen (gut zum Teilen in der Klasse)
5. PWA (nice to have für Tablets)
