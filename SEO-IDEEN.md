# SEO-Ideen für mathe-testen.de

Stand: September 2026

On-Page ist weit: Klassen-Seiten, Themen-Hubs, FAQ/HowTo-JSON-LD, Sitemap. Der Engpass ist weniger „noch eine Landingpage“, sondern dass Google und KI die vorhandenen Seiten sehen und zitieren.

Indexierungsstand: `INDEXIERUNG.md`

---

## Schnell umsetzbar — Status

Die ursprüngliche Kurz-Liste. Stand geprüft: 3. September 2026.

| Idee | Status | Anmerkung |
|------|--------|-----------|
| **Google Search Console + Sitemap** | erledigt | Sitemap in GSC eingereicht, Startseite sichtbar. Weitere URLs kommen nach und nach. Bing: Indexierung läuft (Stand 3.9.2026: 12 URLs, keine Fehler). Einzelstand: `INDEXIERUNG.md` |
| **JSON-LD** | erledigt | Start: WebSite + WebApplication. Klassen: WebPage + Breadcrumb. Hubs: zusätzlich FAQ + HowTo. FAQ-Seite: FAQPage |
| **Mehr Text auf der Startseite** | erledigt | Eltern-Intro, Themen-Hubs, Klassen-Karten mit Rechnen/Zahlen/Größen/Geometrie |
| **Canonical auf Impressum/Datenschutz** | erledigt | Canonical und Meta-Description auf beiden Seiten. Schriften-Hinweis in der Datenschutzerklärung an lokale Fonts angepasst |
| **Google Fonts lokal** | erledigt | `fonts/fraunces-latin.woff2`, `fonts/nunito-latin.woff2` — kein fonts.googleapis.com |

Mittelfristige Punkte aus derselben Liste:

| Idee | Status | Anmerkung |
|------|--------|-----------|
| **Landingpages pro Klasse** | erledigt | `/klasse-1` … `/klasse-6` mit Text und „Jetzt üben“ |
| **Landingpages pro Thema** | erledigt | Hubs `/einmaleins`, `/brueche`, … — nicht die Kombi `/klasse-2/einmaleins` (bewusst später, nur bei Suchnachfrage) |
| **URL mit Voreinstellungen** | erledigt | `?themen=` auf den Übungsseiten, Hubs setzen das voraus |
| **FAQ-Bereich** | erledigt | `/faq` mit mehreren Fragen. Hubs behalten Themen-FAQs. Start- und Klassenseiten bleiben kurz |

---

## Bereits umgesetzt

- Domain `mathe-testen.de` mit Canonical-URL, HTTPS, `lang="de"`
- Titel und Meta-Beschreibung (Klasse 1–6, kostenlos, PDF, online üben)
- Open Graph und Twitter-Tags, gemeinsames `og-image.png`
- `sitemap.xml` und `robots.txt` — Sitemap in Search Console und Bing; Startseite bei Google sichtbar, restliche URLs folgen
- Impressum und Datenschutz mit Canonical
- PWA, lokale Fonts, schnelle statische Seite
- JSON-LD (WebSite, WebApplication, Breadcrumb, FAQ, HowTo)
- Klassen-Übersichten `/klasse-1` … `/klasse-6`
- Themen-Hubs (`/einmaleins`, `/brueche`, `/plus-minus`, …) mit Text, FAQ, Zielgruppe
- Übungs-URLs mit `?themen=` (teilbar, Hubs setzen voraus)
- Startseite verlinkt Hubs und Klassen mit lesbarem Text
- Kopfzeile mit FAQ und Für Lehrkräfte (nicht festklebend)
- `/faq`, `/fuer-eltern` und `/fuer-lehrkraefte`
- Bildungsserver / ELIXIER (nicht automatisch auf jedem Landesportal)

---

## Als Nächstes (Sichtbarkeit, SEO, GEO)

Reihenfolge nach Hebel, nicht nach Aufwand. Keine neuen Rechenarten.

### 1. Indexierung (größter Hebel, kein neuer Inhalt)

Search Console und Sitemap sind eingerichtet, die Startseite ist sichtbar. Klasse 2–6 und die Hubs brauchen oft noch etwas Zeit, bis Google sie aufnimmt.

- In der Search Console gelegentlich prüfen, welche URLs schon im Index sind
- Intern klar verlinken: Startseite → Hubs, Klassen-Seiten → Hubs

### 2. Zielgruppen-Seiten (GEO)

`/fuer-lehrkraefte` und `/fuer-eltern` sind da.

### 3. Reichweite außerhalb von Google

- **Pinterest** mit echten Blatt-Vorschaubildern (Einmaleins, Plus/Minus, Brüche) — Eltern suchen dort Arbeitsblätter, nicht „Mathe-App“
- **OER / Schulportale:** Landesbildungsserver, Lehrerforen, Schul-Blogs — `/fuer-lehrkraefte` als Anker

### 4. SEO, das sich noch lohnt — gezielt

- **Kombi-Seiten nur für echte Suchen**, z. B. `/klasse-2/einmaleins`, `/klasse-5/brueche` — nicht Thema × Klasse für alles. Erst Search Console: welche Anfragen haben Impressionen?
- **Sichtbare Breadcrumbs** im HTML (nicht nur JSON-LD)
- **Eigene OG-Bilder je Hub** — beim Teilen in Chats sonst überall dasselbe Bild
- **`llms.txt`** plus kurzer Absatz auf der Startseite: Was ist mathe-testen.de? Kostenlos, DE, Klasse 1–6, online + PDF, ohne Anmeldung

### Beispiel-Suchbegriffe

- Mathe üben Klasse 3
- Übungsaufgaben Mathematik Klasse 2 kostenlos
- Einmaleins üben online
- Mathe Arbeitsblatt PDF Klasse 4
- Brüche üben Klasse 5
- Mathe Zeitlimit üben Grundschule

---

## Später / nur bei Bedarf

| Idee | Hinweis |
|------|---------|
| Blog / „Aufgaben der Woche“ | Nur wenn regelmäßig Zeit ist, nicht um des Blogs willen |
| Backlinks Elternchats | WhatsApp/Facebook — vorsichtig, kein Spam |
| Lokale Erwähnungen | Westerkappeln / NRW im Impressum reicht meist |

---

## Bewusst nicht

- Keyword-Stuffing
- Hunderte Thin-Pages (jede Klasse × jedes Thema ohne Suchnachfrage)
- Gekaufte Backlinks
- Englische Version / englische Meta-Tags
- Erfundene Bewertungen im Schema

---

## Hinweis

Google indexiert erzeugte Übungsblätter nicht einzeln. Ranking braucht **eigene URLs mit lesbarem Text**, nicht nur die interaktive Oberfläche.
