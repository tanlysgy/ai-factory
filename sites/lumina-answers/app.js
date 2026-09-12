(() => {
  const form = document.getElementById("ask-form");
  const input = document.getElementById("ask-input");
  const status = document.getElementById("answer-status");
  const title = document.getElementById("answer-title");
  const body = document.getElementById("answer-body");
  if (!form || !input) return;
  const answers = [
    { title: "A strong landing page is clear before it is clever.", body: "Great landing pages communicate the value in one glance, guide a single action, and keep every supporting element aligned with that goal. Generous whitespace, a tight type hierarchy, and honest copy all reinforce the same message." },
    { title: "AI crawlers follow the same map as search engines — mostly.", body: "Modern AI crawlers read robots.txt, sitemaps, and structured data to decide what to include in answers. Sites that make content machine-readable are more likely to appear with accurate, citable context." },
    { title: "Design systems reduce cost by making decisions reusable.", body: "A component library with tokens for color, type, and spacing lets teams ship consistent interfaces faster. It turns design into infrastructure instead of one-off effort." }
  ];
  const bucketed = (query) => {
    const q = query.toLowerCase();
    if (q.includes("crawler") || q.includes("ai")) return answers[1];
    if (q.includes("system") || q.includes("design")) return answers[2];
    return answers[0];
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const answer = bucketed(query || "landing page");
    if (status) status.textContent = `Answer for “${query || "landing page"}”`;
    if (title) title.textContent = answer.title;
    if (body) body.textContent = answer.body;
  });
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
