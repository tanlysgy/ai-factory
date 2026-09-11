(() => {
  const search = document.getElementById("demo-search");
  const rows = [...document.querySelectorAll(".result-row")];
  if (search && rows.length) {
    search.addEventListener("input", () => {
      const container = rows[0].parentElement;
      container?.querySelector(".empty-search")?.remove();
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach((row) => {
        const label = row.querySelector("strong")?.textContent.trim().toLowerCase() || "";
        const match = !query || label.includes(query);
        row.style.display = match ? "" : "none";
        if (match) shown += 1;
      });
      const firstVisible = rows.findIndex((row) => row.style.display !== "none");
      rows.forEach((row, index) => row.classList.toggle("active", index === firstVisible));
      if (shown === 0) {
        const empty = document.createElement("div");
        empty.className = "result-row empty-search";
        empty.style.cssText = "color: var(--text-faint); justify-content: center; padding: 14px;";
        empty.textContent = "No commands found";
        container?.appendChild(empty);
      }
    });
  }

  const tabs = [...document.querySelectorAll(".tab")];
  const cards = [...document.querySelectorAll(".card")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        card.style.display = !filter || card.dataset.category === filter ? "" : "none";
      });
    });
  });
})();
