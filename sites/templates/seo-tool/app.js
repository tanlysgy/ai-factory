(() => {
  const menu = document.querySelector(".menu-btn");
  const drawer = document.getElementById("menu-drawer");
  const close = document.querySelector(".menu-close");
  if (menu && drawer) {
    const setOpen = (open) => {
      drawer.setAttribute("aria-hidden", String(!open));
      menu.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    menu.addEventListener("click", () => setOpen(drawer.getAttribute("aria-hidden") === "true"));
    close?.addEventListener("click", () => setOpen(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }
  const form = document.querySelector(".url-form");
  const result = document.getElementById("result");
  const score = document.getElementById("score");
  const note = document.getElementById("note");
  window.seoTool = {
    run: () => {
      const url = document.getElementById("url")?.value || "example.com";
      const host = url.replace(/^https?:\/\//, "").split("/")[0];
      if (result) {
        result.classList.remove("hidden");
        const value = 52 + (host.length % 40);
        if (score) score.textContent = String(Math.min(value, 94));
        if (note) note.textContent = `Demo report for ${host}. Replace this logic with a real analyzer.`;
      }
    }
  };
})();
