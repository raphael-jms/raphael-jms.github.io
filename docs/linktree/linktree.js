/*
  Shared linktree render engine.
  Each linktree page defines a `config` object and calls
  renderLinktree(config) once the DOM is ready. To create a new
  linktree, copy an existing instance HTML file and edit its config —
  linktree.css / linktree.js stay shared.

  config shape:
  {
    name: string,
    subtitle: string,
    avatar: { image?: string },       // omit image to fall back to initials
    theme: { background, text, subtitleText, accent, buttonText, border },
    works: [
      {
        tag: string,                 // short label shown on the switcher pill + as a badge, e.g. "IJCAI 2025"
        title: string,
        blurb: string,               // optional one-line description
        primary: { label, url },     // main call-to-action button
        links: [ { label, url } ]    // optional secondary links (poster, project page, code, ...)
      }
    ],
    socials: [ { icon: "mail"|"linkedin"|"website"|"github", url, label? } ]
  }
*/

(function () {
  const ICONS = {
    mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    website: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>'
  };

  function initials(name) {
    return (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement.style;
    if (theme.background) root.setProperty("--bg-color", theme.background);
    if (theme.text) root.setProperty("--text-color", theme.text);
    if (theme.subtitleText) root.setProperty("--subtitle-color", theme.subtitleText);
    if (theme.accent) root.setProperty("--accent-color", theme.accent);
    if (theme.buttonText) root.setProperty("--btn-text-color", theme.buttonText);
    if (theme.border) root.setProperty("--border-color", theme.border);
  }

  function renderWork(work) {
    if (!work) return "";
    const blurbHtml = work.blurb ? `<p class="work-blurb">${work.blurb}</p>` : "";
    const primaryHtml = work.primary
      ? `<a class="link-box link-box-primary" href="${work.primary.url}" target="_blank" rel="noopener">${work.primary.label}</a>`
      : "";
    const secondaryHtml = (work.links || [])
      .map((l) => `<a class="link-box link-box-secondary" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
      .join("");

    return `
      ${work.tag ? `<span class="work-tag">${work.tag}</span>` : ""}
      <h2 class="work-title">${work.title || ""}</h2>
      ${blurbHtml}
      <div class="links">${primaryHtml}${secondaryHtml}</div>
    `;
  }

  function renderLinktree(config) {
    applyTheme(config.theme);

    if (config.name) document.title = config.name;

    const avatarHtml =
      config.avatar && config.avatar.image
        ? `<img src="${config.avatar.image}" alt="${config.name || ""}">`
        : `<span>${initials(config.name)}</span>`;

    const socialsHtml = (config.socials || [])
      .map(
        (s) =>
          `<a class="social-icon" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label || s.icon}">${
            ICONS[s.icon] || ""
          }</a>`
      )
      .join("");

    const works = config.works || [];
    const switcherHtml =
      works.length > 1
        ? `<div class="work-switcher">
            <select id="workSelect" class="work-select" aria-label="Select work">
              ${works.map((w, i) => `<option value="${i}">${w.tag || w.title}</option>`).join("")}
            </select>
          </div>`
        : "";

    document.getElementById("app").innerHTML = `
      <header class="byline">
        <div class="avatar">${avatarHtml}</div>
        <div class="byline-text">
          <h1 class="name">${config.name || ""}</h1>
          <p class="subtitle">${config.subtitle || ""}</p>
        </div>
      </header>

      ${switcherHtml}

      <section class="work-card" id="workCard">${renderWork(works[0])}</section>

      <footer class="contact">
        <p class="contact-label">Get in touch</p>
        <div class="socials">${socialsHtml}</div>
      </footer>
    `;

    const card = document.getElementById("workCard");
    const select = document.getElementById("workSelect");
    if (select) {
      select.addEventListener("change", () => {
        const index = Number(select.value);
        card.classList.add("fade");
        window.setTimeout(() => {
          card.innerHTML = renderWork(works[index]);
          card.classList.remove("fade");
        }, 120);
      });
    }
  }

  window.renderLinktree = renderLinktree;
})();
