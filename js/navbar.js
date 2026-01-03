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
    const menu = document.getElementById("navbarMenu");
    const toggleBtn = e.target.closest(".nav-toggle");
    const modeBtn = e.target.closest("#mode-toggle");

    if (modeBtn) {
      root.classList.toggle("dark-mode");
      localStorage.setItem("theme_mode", root.classList.contains("dark-mode") ? "dark" : "light");
      setModeLabel();
      return;
    }

    if (!menu) return;

    if (toggleBtn) {
      const open = menu.classList.toggle("is-open");
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }

    // 메뉴가 열려있고, 메뉴 안도 아니고, 토글 버튼도 아니면 닫기
    if (menu.classList.contains("is-open")) {
      const clickedInsideMenu = e.target.closest("#navbarMenu");
      if (!clickedInsideMenu) {
        menu.classList.remove("is-open");
        const btn = document.querySelector(".nav-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    }
  });
})();




// const modeBtn = e.target.closest("#mode-toggle");
//     if (modeBtn) {
//       root.classList.toggle("dark-mode");
//       localStorage.setItem("theme_mode", root.classList.contains("dark-mode") ? "dark" : "light");
//       setModeLabel();
//       return;
//     }

//     const toggleBtn = e.target.closest(".nav-toggle");
//     if (toggleBtn) {
//       const menu = document.getElementById("navbarMenu");
//       if (!menu) return;
//       const open = menu.classList.toggle("is-open");
//       toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
//       return;
//     }