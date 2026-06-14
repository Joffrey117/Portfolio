const STORAGE_KEY = "joffrey-portfolio-content";
const LANGUAGE_KEY = "joffrey-portfolio-language";

function getPortfolio() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return normalizePortfolio(window.DEFAULT_PORTFOLIO);
  }

  try {
    return normalizePortfolio({ ...window.DEFAULT_PORTFOLIO, ...JSON.parse(saved) });
  } catch {
    return normalizePortfolio(window.DEFAULT_PORTFOLIO);
  }
}

function normalizePortfolio(data) {
  const defaultData = window.DEFAULT_PORTFOLIO;
  if (data.cvUrl === "assets/cv-joffrey-achard.pdf") {
    data.cvUrl = defaultData.cvUrl;
  }
  const detailedContent = { ...defaultData.detailedContent, ...(data.detailedContent || {}) };
  const legacyEnglishTitle = detailedContent.videoTitlesEn?.[4];
  const legacyFrenchTitle = detailedContent.videoTitlesFr?.[4];
  if (legacyEnglishTitle === "Online dictation event report") {
    detailedContent.videoTitlesEn = [...detailedContent.videoTitlesEn];
    detailedContent.videoTitlesEn[4] = "New Year greeting card";
  }
  if (legacyFrenchTitle === "Reportage sur l'événement de dictée en ligne") {
    detailedContent.videoTitlesFr = [...detailedContent.videoTitlesFr];
    detailedContent.videoTitlesFr[4] = "Carte de vœux";
  }
  if (!detailedContent.documentsImage || detailedContent.documentsImage === "assets/communication-documents-cover.svg") {
    detailedContent.documentsImage = "assets/documents-showcase.jpg";
  }
  if (detailedContent.communicationPlanImage === "assets/communication-plan-cover.svg") {
    detailedContent.communicationPlanImage = "assets/communication-plan-showcase.jpg";
  }
  if (detailedContent.newslettersImage === "assets/newsletters-cover.svg") {
    detailedContent.newslettersImage = "assets/newsletters-showcase.jpg";
  }
  if (
    detailedContent.newslettersChamrousseEn ===
    "For Chamrousse Tourist Office, I work on two complementary newsletter formats. Each one is adapted to its audience, with a distinct editorial hierarchy, tone and selection of practical information."
  ) {
    detailedContent.newslettersChamrousseEn = defaultData.detailedContent.newslettersChamrousseEn;
  }
  if (
    detailedContent.newslettersChamrousseFr ===
    "Pour l'Office de Tourisme de Chamrousse, je travaille sur deux formats de newsletters complémentaires. Chacun est adapté à son audience, avec une hiérarchie éditoriale, un ton et une sélection d'informations pratiques spécifiques."
  ) {
    detailedContent.newslettersChamrousseFr = defaultData.detailedContent.newslettersChamrousseFr;
  }
  const projects = (Array.isArray(data.projects) ? data.projects : defaultData.projects).map((project) => {
    if (project.image === "assets/videos-cover.svg") {
      return { ...project, image: "assets/videos-project-cover.jpg" };
    }

    if (project.image === "assets/valliue-cover.jpg") {
      return { ...project, image: "assets/valliue-photo-cover.jpg" };
    }

    return project;
  });

  return {
    ...data,
    projects,
    colors: { ...defaultData.colors, ...(data.colors || {}) },
    detailedContent,
    i18n: defaultData.i18n,
    layoutVersion: defaultData.layoutVersion,
    layoutSections:
      data.layoutVersion === defaultData.layoutVersion && data.layoutSections
        ? data.layoutSections
        : defaultData.layoutSections,
  };
}

function getLanguage(data) {
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
  return savedLanguage && data.i18n[savedLanguage] ? savedLanguage : data.defaultLanguage || "en";
}

function getCopy(data, language) {
  return data.i18n[language] || data.i18n.en;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function applyColors(colors) {
  if (!colors) return;

  const root = document.documentElement;
  root.style.setProperty("--bg", colors.bg);
  root.style.setProperty("--ink", colors.ink);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-strong", colors.accentStrong);
  root.style.setProperty("--warm", colors.warm);
}

function renderPillars(pillars) {
  const container = document.querySelector('[data-repeat="pillars"]');
  if (!container) return;

  container.innerHTML = pillars
    .map(
      (pillar) => `
        <div>
          <span class="metric">${pillar.title}</span>
          <p>${pillar.text}</p>
        </div>
      `,
    )
    .join("");
}

function renderTraits(traits) {
  const container = document.querySelector('[data-repeat="traits"]');
  if (!container) return;

  container.innerHTML = traits.map((trait) => `<span>${trait}</span>`).join("");
}

function renderSkills(skills) {
  const container = document.querySelector('[data-repeat="skills"]');
  if (!container) return;

  container.innerHTML = skills.map((skill) => `<li>${skill}</li>`).join("");
}

function renderProjects(projects) {
  const container = document.querySelector('[data-repeat="projects"]');
  if (!container) return;
  const linkLabel = container.dataset.projectLink || "View project";
  const closeLabel = container.dataset.closeProject || "Close project";
  const detailLabels = {
    before: container.dataset.beforeLabel || "Before",
    after: container.dataset.afterLabel || "After",
    articles: container.dataset.articlesLabel || "Articles",
    collaborations: container.dataset.collaborationsLabel || "Collaborations",
    statistics: container.dataset.statisticsLabel || "Statistics",
    openLink: container.dataset.openLinkLabel || "Open link",
  };

  container.innerHTML = projects
    .map((project, index) => {
      const hasDetails =
        project.detailText ||
        project.beforeAfter ||
        project.detailBullets ||
        project.articles ||
        project.collaborations ||
        project.stats;
      const media = project.image
        ? `<img src="${resolveAsset(project.image)}" alt="${project.title}" loading="lazy" />`
        : "";

      return `
        <article class="project-card" style="--project-color: ${project.color};">
          <div class="project-media">${media}</div>
          <div class="project-content">
            <p class="project-type">${project.type}</p>
            <h3>${project.title}</h3>
            <p>${project.text}</p>
            ${
              hasDetails
                ? `<button class="project-toggle" type="button" data-project-toggle="${index}" data-open-label="${linkLabel}" data-close-label="${closeLabel}" aria-expanded="false">${linkLabel}</button>`
                : `<a href="${project.link}" aria-label="${linkLabel} ${project.title}">${linkLabel}</a>`
            }
            ${hasDetails ? renderProjectDetails(project, detailLabels) : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStaticLanguage(language) {
  document.querySelectorAll("[data-lang]").forEach((element) => {
    element.hidden = element.dataset.lang !== language;
  });
}

function renderStaticProjectImages(data) {
  document.querySelectorAll("[data-static-project-image]").forEach((media) => {
    const index = Number(media.dataset.staticProjectImage);
    const projectImage = data.projects?.[index]?.image;

    if (projectImage) {
      const imageUrl = projectImage.startsWith("data:") ? projectImage : resolveAsset(projectImage);
      media.style.setProperty("--project-image", `url("${imageUrl}")`);
      media.classList.add("has-project-image");
    }
  });
}

function resolveAsset(path) {
  try {
    return new URL(path, document.baseURI).href;
  } catch {
    return path;
  }
}

function getYouTubeEmbedUrl(url) {
  try {
    const parsed = new URL(url, document.baseURI);
    const videoId = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get("v");
    if (!videoId) return "";

    const start = parsed.searchParams.get("t")?.replace(/\D/g, "");
    const origin = window.location.protocol.startsWith("http") ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${origin}${start ? `&start=${start}` : ""}`;
  } catch {
    return "";
  }
}

function renderProjectDetails(project, labels) {
  return `
    <div class="project-details" hidden>
      ${project.detailTitle ? `<h4>${project.detailTitle}</h4>` : ""}
      ${project.detailText ? `<p>${project.detailText}</p>` : ""}
      ${
        project.beforeAfter
          ? `<div class="before-after">
              <div><strong>${labels.before}</strong><p>${project.beforeAfter.before}</p></div>
              <div><strong>${labels.after}</strong><p>${project.beforeAfter.after}</p></div>
            </div>`
          : ""
      }
      ${renderList(project.detailBullets)}
      ${renderTitledList(labels.articles, project.articles)}
      ${renderTitledList(labels.collaborations, project.collaborations, "tag-list")}
      ${renderTitledList(labels.statistics, project.stats)}
      ${
        project.link && project.link !== "#"
          ? `<a class="project-external" href="${project.link}" target="_blank" rel="noreferrer">${labels.openLink}</a>`
          : ""
      }
    </div>
  `;
}

function renderList(items) {
  if (!items?.length) return "";
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderTitledList(title, items, className = "") {
  if (!items?.length) return "";
  return `
    <div class="project-detail-group ${className}">
      <h5>${title}</h5>
      ${renderList(items)}
    </div>
  `;
}

function renderLayout(layoutSections) {
  const main = document.querySelector("main");
  if (!main) return;

  layoutSections.forEach((sectionData) => {
    const section = document.querySelector(`[data-section="${sectionData.id}"]`);
    if (!section) return;

    section.hidden = !sectionData.visible;
    main.appendChild(section);
  });
}

function renderPortfolio() {
  const data = getPortfolio();
  const language = getLanguage(data);
  const copy = getCopy(data, language);
  const view = { ...data, ...copy };

  applyColors(data.colors);

  document.title = `${data.name} | Portfolio`;
  document.documentElement.lang = language;
  renderStaticLanguage(language);
  renderStaticProjectImages(data);

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = copy.metaDescription;
  }

  document.querySelectorAll("[data-field]").forEach((element) => {
    const key = element.dataset.field;
    setText(`[data-field="${key}"]`, view[key] || "");
  });

  document.querySelectorAll("[data-label]").forEach((element) => {
    const key = element.dataset.label;
    element.textContent = copy[key] || element.textContent;
  });

  document.querySelectorAll("[data-field-href]").forEach((element) => {
    const key = element.dataset.fieldHref;
    element.href = data[key] || "#";
  });

  document.querySelectorAll("[data-field-mail]").forEach((element) => {
    const key = element.dataset.fieldMail;
    element.href = `mailto:${data[key] || ""}`;
  });

  document.querySelectorAll("[data-field-phone]").forEach((element) => {
    const key = element.dataset.fieldPhone;
    element.href = `tel:${(data[key] || "").replace(/[^\d+]/g, "")}`;
  });

  document.querySelectorAll("[data-field-src]").forEach((element) => {
    const key = element.dataset.fieldSrc;
    element.src = data[key] || "";
    element.parentElement.load();
  });

  document.querySelectorAll("[data-field-poster]").forEach((element) => {
    const key = element.dataset.fieldPoster;
    element.poster = data[key] || "";
  });

  document.querySelectorAll("[data-detail-text]").forEach((element) => {
    const key = element.dataset.detailText;
    const index = Number(element.dataset.detailIndex);
    const value = data.detailedContent?.[key];
    element.textContent = Array.isArray(value) ? value[index] || "" : value || "";
  });

  document.querySelectorAll("[data-detail-href]").forEach((element) => {
    const key = element.dataset.detailHref;
    const index = Number(element.dataset.detailIndex);
    const value = data.detailedContent?.[key];
    element.href = Array.isArray(value) ? value[index] || "#" : value || "#";
  });

  document.querySelectorAll("[data-detail-src]").forEach((element) => {
    const key = element.dataset.detailSrc;
    const index = Number(element.dataset.detailIndex);
    const value = data.detailedContent?.[key];
    element.src = Array.isArray(value) ? value[index] || "" : value || "";
  });

  document.querySelectorAll("[data-detail-background]").forEach((element) => {
    const key = element.dataset.detailBackground;
    const value = data.detailedContent?.[key];
    if (!value) return;
    const imageUrl = value.startsWith("data:") ? value : resolveAsset(value);
    element.style.setProperty("--project-image", `url("${imageUrl}")`);
  });

  const projectContainer = document.querySelector('[data-repeat="projects"]');
  if (projectContainer) {
    projectContainer.dataset.projectLink = copy.projectLink;
    projectContainer.dataset.closeProject = copy.closeProject;
    projectContainer.dataset.beforeLabel = copy.beforeLabel;
    projectContainer.dataset.afterLabel = copy.afterLabel;
    projectContainer.dataset.articlesLabel = copy.articlesLabel;
    projectContainer.dataset.collaborationsLabel = copy.collaborationsLabel;
    projectContainer.dataset.statisticsLabel = copy.statisticsLabel;
    projectContainer.dataset.openLinkLabel = copy.openLinkLabel;
  }

  renderPillars(view.pillars);
  renderTraits(view.traits);
  renderSkills(view.skills);
  renderProjects(view.projects);
  renderLayout(data.layoutSections);

  const languageToggle = document.querySelector("[data-language-toggle]");
  if (languageToggle) {
    languageToggle.textContent = language === "en" ? "FR" : "EN";
    languageToggle.setAttribute("aria-label", language === "en" ? "Switch to French" : "Passer en anglais");
  }

  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

renderPortfolio();

const adminLink = document.querySelector(".admin-link");
if (adminLink && window.location.protocol !== "file:") {
  adminLink.hidden = true;
}

document.querySelector("[data-language-toggle]")?.addEventListener("click", () => {
  const data = getPortfolio();
  const currentLanguage = getLanguage(data);
  localStorage.setItem(LANGUAGE_KEY, currentLanguage === "en" ? "fr" : "en");
  renderPortfolio();
});

document.addEventListener("click", (event) => {
  const videoLink = event.target.closest("[data-video-play]");
  if (videoLink) {
    event.preventDefault();
    if (window.location.protocol === "file:") {
      window.open(videoLink.href, "_blank", "noopener,noreferrer");
      return;
    }
    const player = videoLink.querySelector(".project-video-image");
    const embedUrl = getYouTubeEmbedUrl(videoLink.href);
    if (player && embedUrl) {
      player.innerHTML = `<iframe src="${embedUrl}" title="${videoLink.textContent.trim()}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    }
    return;
  }

  const button = event.target.closest("[data-project-toggle]");
  if (!button) return;

  openProjectModal(button);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-project-modal-close]")) return;
  closeProjectModal();
});

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-project-page-tab]");
  if (!tab) return;

  const modal = tab.closest("[data-project-modal-content]");
  if (!modal) return;

  const target = tab.dataset.projectPageTab;
  modal.querySelectorAll("[data-project-page-tab]").forEach((item) => {
    item.classList.toggle("active", item === tab);
  });
  modal.querySelectorAll("[data-project-page-panel]").forEach((panel) => {
    const isActive = panel.dataset.projectPagePanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

function openProjectModal(button) {
  const card = button.closest(".project-card");
  const details = card?.querySelector(".project-details");
  const modal = document.querySelector("[data-project-modal]");
  const modalContent = document.querySelector("[data-project-modal-content]");
  if (!details || !modal || !modalContent) return;

  const title = card.querySelector("h3")?.outerHTML || "";
  const type = card.querySelector(".project-type")?.outerHTML || "";
  modalContent.innerHTML = `${type}${title}${details.innerHTML}`;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderStaticLanguage(document.documentElement.lang);
}

function closeProjectModal() {
  const modal = document.querySelector("[data-project-modal]");
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  document.body.classList.remove("modal-open");
}
