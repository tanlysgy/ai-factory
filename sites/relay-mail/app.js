(() => {
  const toInput = document.getElementById("email-to");
  const subjectInput = document.getElementById("email-subject");
  const bodyInput = document.getElementById("email-body");
  const send = document.getElementById("email-send");
  const status = document.getElementById("email-status");
  const codeTo = document.getElementById("code-to");
  const codeSubject = document.getElementById("code-subject");
  const codeHtml = document.getElementById("code-html");
  const previewSubject = document.getElementById("preview-subject");
  const previewBody = document.getElementById("preview-body");
  if (!send) return;
  const esc = (value) => value.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
  const sync = () => {
    const to = (toInput?.value || "").trim() || "you@example.com";
    const subject = (subjectInput?.value || "").trim() || "Welcome to Relay";
    const body = (bodyInput?.value || "").trim() || "Your workspace is ready.";
    if (codeTo) codeTo.textContent = to;
    if (codeSubject) codeSubject.textContent = esc(subject);
    if (codeHtml) codeHtml.textContent = esc(`<p>${body}</p>`);
    if (previewSubject) previewSubject.textContent = subject;
    if (previewBody) previewBody.textContent = body;
  };
  [toInput, subjectInput, bodyInput].forEach((el) => el?.addEventListener("input", sync));
  send.addEventListener("click", () => {
    const to = (toInput?.value || "").trim();
    if (!to || !to.includes("@")) { if (status) status.textContent = "Enter a valid recipient email first."; return; }
    sync();
    if (status) status.textContent = `Status: delivered to ${to} (demo response).`;
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
