(function () {
  const root = document.documentElement;

  function setModeLabel() {
    const btn = document.getElementById("mode-toggle");
    if (!btn) return;
    const isDark = root.classList.contains("dark-mode");
    btn.textContent = isDark ? "Light Mode ☀️" : "Dark Mode 🌙";
  }

  const saved = localStorage.getItem("theme_mode");
  if (saved === "dark") root.classList.add("dark-mode");
  setModeLabel();

  document.addEventListener("click", (e) => {
    const modeBtn = e.target.closest("#mode-toggle");
    if (modeBtn) {
      root.classList.toggle("dark-mode");
      localStorage.setItem("theme_mode", root.classList.contains("dark-mode") ? "dark" : "light");
      setModeLabel();
      return;
    }

    const toggleBtn = e.target.closest(".nav-toggle");
    if (toggleBtn) {
      const menu = document.getElementById("navbarMenu");
      if (!menu) return;
      const open = menu.classList.toggle("is-open");
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
  });
})();
