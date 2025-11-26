document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("is-open");
      mainNav.classList.toggle("nav-open");
    });

    // Fecha o menu ao clicar em um link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        mainNav.classList.remove("nav-open");
      });
    });
  }

  // Scroll suave para seções
  document.querySelectorAll("[data-scroll-target]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      const targetSelector = trigger.getAttribute("data-scroll-target");
      const target = document.querySelector(targetSelector);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Animação de aparecer ao rolar
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }
});

