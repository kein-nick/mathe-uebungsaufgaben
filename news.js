(function () {
  const NEWS_VERSION = "2026-09-29-4";
  const STORAGE_KEY = "mathe-news-read";
  const link = document.querySelector(".site-header-news");

  if (!link) {
    return;
  }

  try {
    if (window.location.pathname === "/neuigkeiten" || window.location.pathname === "/neuigkeiten.html") {
      localStorage.setItem(STORAGE_KEY, NEWS_VERSION);
      return;
    }

    if (localStorage.getItem(STORAGE_KEY) !== NEWS_VERSION) {
      link.classList.add("has-unread-news");
      link.setAttribute("aria-label", "Neu – neue Inhalte verfügbar");
    }
  } catch {
    link.classList.add("has-unread-news");
    link.setAttribute("aria-label", "Neu – neue Inhalte verfügbar");
  }
})();
