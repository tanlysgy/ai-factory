(() => {
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
