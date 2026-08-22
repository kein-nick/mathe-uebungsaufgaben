(function () {
  const DISMISS_KEY = "mathe-pwa-install-dismissed";
  const SHOW_DELAY_MS = 2500;

  const banner = document.getElementById("install-banner");
  const iosDialog = document.getElementById("install-ios-dialog");
  const installAction = document.getElementById("install-action");
  const installDismiss = document.getElementById("install-dismiss");
  const iosClose = document.getElementById("install-ios-close");

  if (!banner || !installAction || !installDismiss) {
    return;
  }

  let deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIOS() {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      return true;
    }
    return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  }

  function wasDismissed() {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  }

  function rememberDismissed() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function canShowInstallHint() {
    if (isStandalone() || wasDismissed()) {
      return false;
    }
    if (deferredPrompt) {
      return true;
    }
    if (isIOS()) {
      return true;
    }
    return false;
  }

  function showBanner() {
    if (!canShowInstallHint()) {
      return;
    }
    banner.classList.remove("is-hidden");
  }

  function hideBanner() {
    banner.classList.add("is-hidden");
  }

  function openIosDialog() {
    if (!iosDialog) {
      return;
    }
    if (typeof iosDialog.showModal === "function") {
      iosDialog.showModal();
    }
  }

  function closeIosDialog() {
    if (!iosDialog || !iosDialog.open) {
      return;
    }
    iosDialog.close();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!wasDismissed() && !isStandalone()) {
      window.setTimeout(showBanner, SHOW_DELAY_MS);
    }
  });

  if (isIOS() && !wasDismissed() && !isStandalone()) {
    window.setTimeout(showBanner, SHOW_DELAY_MS);
  }

  installAction.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {
        /* ignore */
      }
      deferredPrompt = null;
      hideBanner();
      return;
    }

    if (isIOS()) {
      openIosDialog();
      return;
    }

    hideBanner();
  });

  installDismiss.addEventListener("click", () => {
    rememberDismissed();
    hideBanner();
    closeIosDialog();
  });

  if (iosClose) {
    iosClose.addEventListener("click", closeIosDialog);
  }

  if (iosDialog) {
    iosDialog.addEventListener("click", (event) => {
      if (event.target === iosDialog) {
        closeIosDialog();
      }
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Offline-Modus optional; Seite bleibt ohne SW nutzbar */
      });
    });
  }
})();
