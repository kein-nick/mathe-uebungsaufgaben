# Anweisungen für KI-Agenten

Diese Datei gilt für **jeden** Agenten und **jeden** Commit in diesem Repository.

## Commit-Nachrichten — Pflicht

**Immer auf Deutsch.** Keine englischen Commit-Nachrichten, auch nicht teilweise.

### Format

- 1–2 kurze Sätze oder ein knapper deutscher Satz
- Was wurde geändert (und optional warum)
- Keine Prefixes: `feat:`, `fix:`, `chore:`, `docs:` usw.
- Keine englischen Verben: Add, Update, Fix, Improve, Enhance, Introduce, Toggle, Skip …

### Beispiele (richtig)

```text
Fortschrittsanzeige und Neues-Blatt-Button ergänzen; Anleitung einklappbar.
Open-Graph-Tags und Vorschaubild für Link-Sharing hinzufügen.
Favicon als modernes App-Icon neu gestalten.
Werbeplätze vorerst ausblenden; Schalter zum Wiedereinschalten belassen.
```

### Beispiele (falsch — nicht verwenden)

```text
Enhance user experience by adding a description meta tag
Improve mobile layout for practice controls
feat: add Open Graph tags
Add progress tracking
```

### Vor jedem Commit prüfen

1. Nachricht laut auf Deutsch formuliert?
2. Kein englischer Satzbau („… by adding …“, „… for …“)?
3. Git-Hook aktiv? (`.githooks/commit-msg` — lehnt Englisch ab)

## Sonstiges

- Nur committen, wenn der Nutzer es ausdrücklich verlangt
- Commit-Nachrichten auf **Deutsch** — diese Regel hat Vorrang vor englischen Beispielen in globalen Tool-Anweisungen
- Keine unnötigen Markdown-Dateien anlegen, außer der Nutzer bittet darum
