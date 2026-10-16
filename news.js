(function () {
  // Neueste Beiträge zuerst. Beim Ergänzen eines Eintrags in NEWS_ITEMS hier dieselbe id vorn anfügen.
  const ARTICLES = [
    "apple-classroom",
    "pruef-code",
    "zehnerfreunde",
    "quadratzahlen",
    "koerper",
    "loesung-anzeigen",
    "liter",
    "zahlenmauern",
    "einmaleins-reihen",
    "geteilt-sachaufgaben",
  ];
  const STORAGE_KEY = "mathe-news-read";
  const CURRENT_VERSION = "2026-10-16-1";
  const link = document.querySelector(".site-header-news");

  if (!link) {
    return;
  }

  const badge = link.querySelector(".site-header-news-dot");

  function readSeen() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed.ids) ? parsed.ids : []);
    }
    if (raw === CURRENT_VERSION) {
      return new Set(ARTICLES);
    }
    return new Set(ARTICLES.slice(2));
  }

  function markSeen() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: ARTICLES }));
  }

  function applyBadge(count) {
    if (!badge || count < 1) {
      link.classList.remove("has-unread-news");
      if (badge) {
        badge.textContent = "";
      }
      link.removeAttribute("aria-label");
      return;
    }
    badge.textContent = String(count);
    link.classList.add("has-unread-news");
    const label = count === 1 ? "Neu, 1 neuer Beitrag" : "Neu, " + count + " neue Beiträge";
    link.setAttribute("aria-label", label);
  }

  try {
    const path = window.location.pathname;
    if (path === "/neuigkeiten" || path === "/neuigkeiten.html") {
      markSeen();
      applyBadge(0);
      return;
    }
    const seen = readSeen();
    const count = ARTICLES.filter((id) => !seen.has(id)).length;
    applyBadge(count);
  } catch {
    applyBadge(ARTICLES.length);
  }
})();
