(() => {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle ---------- */
  const themeToggle = $("#theme-toggle");
  const root = document.documentElement;

  const getSavedTheme = () => {
    try {
      return localStorage.getItem("vp-theme");
    } catch {
      return null;
    }
  };

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("vp-theme", theme);
    } catch {
      /* ignore */
    }
  };

  const savedTheme = getSavedTheme();
  if (savedTheme) {
    setTheme(savedTheme);
  }

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });

  /* ---------- sticky header ---------- */
  const header = $("#site-header");
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  const navToggle = $("#nav-toggle");
  const navLinks = $("#nav-links");

  const closeNav = () => {
    navLinks?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  $$(".nav-link", navLinks).forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (e) => {
    if (navLinks?.classList.contains("open") && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      closeNav();
    }
  });

  /* ---------- scrollspy ---------- */
  const spyLinks = $$(".nav-link");
  const sections = spyLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        spyLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* ---------- typewriter ---------- */
  const typeTarget = $("#typewriter");
  const roles = [
    "Aspiring Software Engineer",
    "Java & Spring Boot Developer",
    "Backend Enthusiast",
    "DSA Problem Solver",
  ];

  if (typeTarget && !prefersReducedMotion) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const speed = 75;
    const pause = 1400;

    const tick = () => {
      const current = roles[roleIndex];
      charIndex += deleting ? -1 : 1;
      typeTarget.textContent = current.slice(0, charIndex);

      let delay = speed;
      if (!deleting && charIndex === current.length) {
        delay = pause;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }
      setTimeout(tick, delay);
    };
    tick();
  } else if (typeTarget) {
    typeTarget.textContent = roles[0];
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      revealObserver.observe(el);
    });
  }

  /* ---------- GitHub repositories (graceful fallback) ---------- */
  const reposEl = $("#repos");
  const USERNAME = "vipinpra09";

  const langColors = {
    Java: "#b07219",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    "C++": "#f34b7d",
    C: "#555555",
    Shell: "#89e051",
    Kotlin: "#A97BFF",
  };

  const renderRepos = (repos) => {
    if (!repos.length) {
      reposEl.innerHTML = `<p class="repo-error">No public repositories found yet — I'm just getting started on GitHub. Visit <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener noreferrer">github.com/${USERNAME}</a>.</p>`;
      return;
    }
    reposEl.innerHTML = repos
      .map((repo) => {
        const lang = repo.language || "";
        const color = langColors[lang] || "#8b949e";
        const desc = repo.description || "No description yet.";
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const langHtml = lang
          ? `<span><span class="lang-dot" style="background:${color}"></span>${lang}</span>`
          : "";
        return `
          <article class="repo-card">
            <h4>${repo.name}</h4>
            <p>${desc.replace(/</g, "&lt;")}</p>
            <div class="repo-card__meta">
              ${langHtml}
              ${stars ? `<span>&#9733; ${stars}</span>` : ""}
              ${forks ? `<span><svg width="10" height="10" viewBox="0 0 16 16" aria-hidden="true" style="display:inline;vertical-align:-1px"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg> ${forks}</span>` : ""}
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Open on GitHub &rarr;</a>
          </article>`;
      })
      .join("");
  };

  const showRepoError = () => {
    reposEl.innerHTML = `<p class="repo-error">Couldn't load repositories from the GitHub API right now. You can still browse everything on <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener noreferrer">github.com/${USERNAME}</a>.</p>`;
  };

  if (reposEl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
        return res.json();
      })
      .then((data) => renderRepos(Array.isArray(data) ? data : []))
      .catch(() => showRepoError())
      .finally(() => clearTimeout(timeoutId));
  }

  /* ---------- contact form ---------- */
  const form = $("#contact-form");
  const formStatus = $("#form-status");

  const setFieldState = (input, valid) => {
    const field = input.closest(".form-field");
    field?.classList.toggle("invalid", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    return valid;
  };

  const validate = (input) => {
    const value = input.value.trim();
    if (input.type === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return setFieldState(input, ok);
    }
    return setFieldState(input, value.length > 0);
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("input, textarea", form);
    const allValid = fields.map(validate).every(Boolean);

    if (!allValid) {
      formStatus.textContent = "Please fill in all required fields correctly.";
      formStatus.className = "form-status error";
      return;
    }

    const data = new FormData(form);
    formStatus.textContent = "Thanks for reaching out! I'll get back to you soon.";
    formStatus.className = "form-status success";
    form.reset();
  });

  form &&
    $$("input, textarea", form).forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value.trim() || field.getAttribute("aria-invalid") === "true") {
          validate(field);
        }
      });
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

  /* ---------- footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
