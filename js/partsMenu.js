/**
 * Client Progress Report - Parts section navigation and category lists
 */

const DEFAULT_PARTS_SECTION = "partsUpperStripped";

const STATUS_LABELS = {
  available: "Available",
  "in-progress": "In Progress",
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPartStatusClass(status) {
  const normalized = String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  if (normalized === "available") {
    return "part-status--available";
  }

  if (normalized === "in-progress") {
    return "part-status--in-progress";
  }

  return "part-status--unknown";
}

function getPartStatusLabel(status) {
  const statusClass = getPartStatusClass(status);
  if (statusClass === "part-status--available") {
    return STATUS_LABELS.available;
  }
  if (statusClass === "part-status--in-progress") {
    return STATUS_LABELS["in-progress"];
  }
  return String(status);
}

function renderPlaceholderBlock() {
  return `<div class="parts-section__placeholder">
    <span class="material-symbols-outlined placeholder__icon" aria-hidden="true">construction</span>
    <h3 class="placeholder__title">Work in Progress</h3>
    <p class="placeholder__text">This section is currently under development.</p>
  </div>`;
}

function renderCategoryList(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return "";
  }

  const rows = categories
    .map((category) => {
      const name = escapeHtml(category.name || "");
      const url = escapeHtml(category.url || "#");
      const status = category.status || "in-progress";
      const statusLabel = getPartStatusLabel(status);
      const statusClass = getPartStatusClass(status);

      return `<li class="parts-category-list__item">
        <a class="parts-category" href="${url}">
          <span class="parts-category__name">${name}</span>
          <span class="part-status ${statusClass}">
            <span class="part-status__dot" aria-hidden="true"></span>
            <span class="part-status__label">${escapeHtml(statusLabel)}</span>
          </span>
        </a>
      </li>`;
    })
    .join("");

  return `<ul class="parts-category-list" role="list">${rows}</ul>`;
}

function renderSectionContent(section) {
  if (section.content === "categories") {
    return renderCategoryList(section.categories);
  }
  return renderPlaceholderBlock();
}

function buildPartsNav(sections) {
  const nav = document.getElementById("parts-section-nav");
  if (!nav) return;

  nav.innerHTML = sections
    .map(
      (section) =>
        `<button type="button" class="parts-section-nav__btn" data-part-section="${escapeHtml(section.id)}">${escapeHtml(section.navLabel)}</button>`
    )
    .join("");
}

function buildPartsSections(sections) {
  const container = document.getElementById("partsContent");
  if (!container) return;

  container.innerHTML = sections
    .map(
      (section) => `<div id="${escapeHtml(section.id)}" class="parts-section" hidden>
      <h2 class="parts-section__title">${escapeHtml(section.title)}</h2>
      <div class="parts-section__body">
        ${renderSectionContent(section)}
      </div>
    </div>`
    )
    .join("");
}

function switchPartsSection(sectionId) {
  const sections = document.querySelectorAll(".parts-section");

  sections.forEach((section) => {
    section.hidden = section.id !== sectionId;
  });

  document.querySelectorAll("[data-part-section]").forEach((button) => {
    const isActive = button.dataset.partSection === sectionId;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function bindPartsSectionNav() {
  const nav = document.getElementById("parts-section-nav");
  nav?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-part-section]");
    if (!button) return;
    const sectionId = button.dataset.partSection;
    if (sectionId) {
      switchPartsSection(sectionId);
    }
  });
}

async function initPartsMenu() {
  const menuParts = document.getElementById("menuParts");
  if (!menuParts) return;

  try {
    const response = await fetch("data/parts.json");
    if (!response.ok) {
      throw new Error(`Failed to load parts data: ${response.status}`);
    }

    const data = await response.json();
    const sections = data.sections || [];

    buildPartsNav(sections);
    buildPartsSections(sections);
    bindPartsSectionNav();

    const defaultId = data.defaultSection || DEFAULT_PARTS_SECTION;
    switchPartsSection(defaultId);
  } catch (error) {
    console.error(error);
    const container = document.getElementById("partsContent");
    if (container) {
      container.innerHTML =
        '<p class="parts-page__error">Unable to load parts data.</p>';
    }
  }
}

document.addEventListener("DOMContentLoaded", initPartsMenu);
