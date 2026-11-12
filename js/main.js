/**
 * Client Progress Report - mobile sidebar and milestone rendering
 */

const MOBILE_BREAKPOINT = 768;

const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const menuToggle = document.getElementById("menu-toggle");

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

function setSidebarOpen(open) {
  sidebar.classList.toggle("is-open", open);
  sidebarBackdrop.classList.toggle("is-visible", open);
  sidebarBackdrop.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close navigation menu" : "Open navigation menu"
  );

  const icon = menuToggle.querySelector(".material-symbols-outlined");
  if (icon) {
    icon.textContent = open ? "close" : "menu";
  }

  document.body.style.overflow = open ? "hidden" : "";
}

function closeMobileSidebar() {
  if (isMobileViewport()) {
    setSidebarOpen(false);
  }
}

window.closeMobileSidebar = closeMobileSidebar;

function statusBadgeClass(status) {
  switch (status) {
    case "Completed":
    case "Finished":
      return "milestone-card__status--success";
    case "Ongoing":
      return "milestone-card__status--ongoing";
    case "Not Started":
    default:
      return "milestone-card__status--muted";
  }
}

function formatMilestoneNumber(num) {
  return String(num).padStart(2, "0");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function referenceIdForMilestone(number) {
  return `milestone-${String(number).padStart(2, "0")}`;
}

function renderReferencesButton(milestone) {
  if (typeof window.milestoneHasReferences === "function" && !window.milestoneHasReferences(milestone.number)) {
    return "";
  }

  const referenceId = referenceIdForMilestone(milestone.number);
  return `<button type="button" class="milestone-card__refs" data-reference-id="${referenceId}">
      <span class="material-symbols-outlined milestone-card__refs-icon" aria-hidden="true">folder_open</span>
      View References
    </button>`;
}

function renderMilestoneCard(milestone) {
  const statusClass = statusBadgeClass(milestone.status);
  const refsButton = renderReferencesButton(milestone);
  const tasksHtml = milestone.tasks
    .map(
      (task) =>
        `<li class="milestone-tasks__item">
          <span class="material-symbols-outlined milestone-tasks__bullet" aria-hidden="true">circle</span>
          <span>${escapeHtml(task)}</span>
        </li>`
    )
    .join("");

  return `<article class="milestone-card">
    <header class="milestone-card__header">
      <div class="milestone-card__heading">
        <span class="milestone-card__number">MILESTONE ${formatMilestoneNumber(milestone.number)}</span>
        <div class="milestone-card__title-row">
          <span class="material-symbols-outlined milestone-card__icon" aria-hidden="true">${escapeHtml(milestone.icon)}</span>
          <h3 class="milestone-card__title">${escapeHtml(milestone.title)}</h3>
        </div>
        <p class="milestone-card__description">${escapeHtml(milestone.description)}</p>
      </div>
      <span class="milestone-card__status ${statusClass}">
        <span class="milestone-card__status-dot" aria-hidden="true"></span>
        ${escapeHtml(milestone.status)}
      </span>
    </header>
    <details class="milestone-card__details">
      <summary class="milestone-card__summary">View Tasks</summary>
      <ul class="milestone-tasks" role="list">
        ${tasksHtml}
      </ul>
    </details>
    ${refsButton}
  </article>`;
}

async function loadAndRenderMilestones() {
  const grid = document.getElementById("milestone-grid");
  if (!grid) return;

  try {
    const [milestonesResponse, referencesResponse] = await Promise.all([
      fetch("data/milestone-data/milestones.json"),
      fetch("data/milestone-data/milestoneReferences.json"),
    ]);

    if (!milestonesResponse.ok) {
      throw new Error(`Failed to load milestones: ${milestonesResponse.status}`);
    }

    const milestones = await milestonesResponse.json();
    let referencesData = {};

    if (referencesResponse.ok) {
      referencesData = await referencesResponse.json();
    } else {
      console.warn("Milestone references could not be loaded.");
    }

    if (typeof window.initMilestoneModal === "function") {
      window.initMilestoneModal(referencesData);
    }

    grid.innerHTML = milestones.map(renderMilestoneCard).join("");
  } catch (error) {
    console.error(error);
    grid.innerHTML =
      '<p class="milestone-page__error">Unable to load milestone data.</p>';
  }
}

function initMobileSidebar() {
  menuToggle?.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("is-open");
    setSidebarOpen(!isOpen);
  });

  sidebarBackdrop?.addEventListener("click", () => {
    setSidebarOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !sidebar.classList.contains("is-open")) return;
    if (typeof window.isMilestoneModalOpen === "function" && window.isMilestoneModalOpen()) {
      return;
    }
    setSidebarOpen(false);
    menuToggle?.focus();
  });

  window
    .matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    .addEventListener("change", (event) => {
      if (!event.matches) {
        setSidebarOpen(false);
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileSidebar();
  loadAndRenderMilestones();
});
