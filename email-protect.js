(function () {
  function decodePart(value) {
    try {
      return atob(value);
    } catch {
      return "";
    }
  }

  document.querySelectorAll(".email-protected").forEach((el) => {
    const user = decodePart(el.dataset.u || "");
    const domain = decodePart(el.dataset.d || "");
    if (!user || !domain) {
      return;
    }
    const address = `${user}@${domain}`;
    if (el.tagName === "A") {
      el.href = `mailto:${address}`;
    }
    el.textContent = address;
  });
})();
