(() => {
  const nav = document.querySelector(".sidebar nav");
  if (!nav) return;
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.querySelectorAll("a").forEach((other) => other.classList.toggle("active", other === link));
    });
  });
})();
