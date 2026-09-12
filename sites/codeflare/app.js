(() => {
  const input = document.getElementById("prompt-input");
  const form = document.getElementById("prompt-form");
  const hint = document.getElementById("prompt-hint");
  const status = document.getElementById("status-line");
  const diffPanel = document.getElementById("diff-panel");
  const diffCode = document.getElementById("diff-code");
  const applyBtn = document.getElementById("diff-apply");
  const rejectBtn = document.getElementById("diff-reject");
  if (!form || !input || !diffCode || !diffPanel || !status) return;

  const diffs = {
    ratelimit: {
      status: "Adding rate limit to projects route…",
      code: `-  app.get("/api/projects", listProjects);
+  app.get("/api/projects", withRateLimit(listProjects, { limit: 120 }));

  // verified: route path unchanged, limit applies to burst traffic only.`,
      change: "Rate limit added to /api/projects."
    },
    test: {
      status: "Writing a regression test for the route…",
      code: `+describe("GET /api/projects", () => {
+  it("rejects traffic over the rate limit", async () => {
+    const res = await app.inject({ method: "GET", url: "/api/projects" });
+    expect(res.statusCode).toBe(200);
+  });
+});`,
      change: "Regression test written and verified."
    },
    types: {
      status: "Updating shared types across the repo…",
      code: `-  projects: Project[]
+  projects: ProjectWithStats[]

  // wait — ProjectWithStats does not export "activeUsers"; adding it:
+  export interface ProjectWithStats extends Project {
+    activeUsers: number;
+  }`,
      change: "Types updated in 2 files."
    }
  };

  const showDiff = (key) => {
    const diff = diffs[key] || diffs.ratelimit;
    status.textContent = diff.status;
    diffCode.textContent = diff.code;
    diffPanel.hidden = false;
    hint.textContent = "Agent found the file, planned the change, and prepared a diff.";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = (input.value || "").toLowerCase();
    let key = "ratelimit";
    if (query.includes("test")) key = "test";
    else if (query.includes("type") || query.includes("interface")) key = "types";
    showDiff(key);
  });

  applyBtn.addEventListener("click", () => {
    status.textContent = "Change applied. Run your tests to confirm.";
    diffPanel.hidden = true;
    hint.textContent = "Change applied to the local branch. Try another prompt.";
  });
  rejectBtn.addEventListener("click", () => {
    status.textContent = "Change discarded — no files modified.";
    diffPanel.hidden = true;
    hint.textContent = "Description a change, then press Send to plan a new diff.";
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
