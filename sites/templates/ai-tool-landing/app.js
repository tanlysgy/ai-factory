(() => {
  const menu = document.querySelector(".menu-btn");
  const drawer = document.getElementById("menu-drawer");
  const close = document.querySelector(".menu-close");
  if (!menu || !drawer) return;
  const setOpen = (open) => {
    drawer.setAttribute("aria-hidden", String(!open));
    menu.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menu.addEventListener("click", () => setOpen(drawer.getAttribute("aria-hidden") === "true"));
  close?.addEventListener("click", () => setOpen(false));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
})();
