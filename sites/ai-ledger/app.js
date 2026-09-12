(() => {
  const input = document.getElementById("issue-input");
  const add = document.getElementById("issue-add");
  const status = document.getElementById("issue-status");
  const inbox = document.querySelector(".column");
  if (!input || !add || !status || !inbox) return;
  const id = () => `LED-${Math.floor(140 + Math.random() * 800)}`;
  const colors = ["#e7f0fa", "#f0eafd", "#e2f5ec", "#e0f3f7"];
  const labels = ["Engineering", "Design", "Product", "Platform"];
  add.addEventListener("click", () => {
    const title = input.value.trim();
    if (!title) { status.textContent = "Enter an issue title first."; return; }
    const ticket = document.createElement("article");
    ticket.className = "ticket";
    const pick = Math.floor(Math.random() * colors.length);
    ticket.innerHTML = `
      <span class="ticket-id">${id()}</span>
      <strong>${title.replace(/[<>&]/g, "")}</strong>
      <span class="ticket-tag" style="color:#2f6cb3;background:${colors[pick]}">${labels[pick]}</span>`;
    inbox.appendChild(ticket);
    input.value = "";
    status.textContent = `Added "${title}" to your inbox.`;
  });
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") add.click(); });
})();

/* P7.6 — mobile drawer: open / close / Escape / scroll lock */
(function () {
  const menu = document.querySelector('.menu-btn');
  const drawer = document.querySelector('.site-drawer');
  const close = document.querySelector('.drawer-close');
  if (!menu || !drawer || !close) return;
  const links = drawer.querySelectorAll('a');
  let open = false;
  const setOpen = (next) => {
    open = next;
    drawer.setAttribute('aria-hidden', String(!open));
    menu.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('drawer-open', open);
    if (open) close.focus();
  };
  menu.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  for (const link of links) link.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
})();
