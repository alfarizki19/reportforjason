/**
 * Client Progress Report - milestone reference modal
 */

const milestoneModalEl = document.getElementById("milestone-modal");
const milestoneModalBackdrop = document.getElementById("milestone-modal-backdrop");
const milestoneModalClose = document.getElementById("milestone-modal-close");
const milestoneModalTitle = document.getElementById("milestone-modal-title");
const milestoneModalSubtitle = document.getElementById("milestone-modal-subtitle");
const milestoneModalBody = document.getElementById("milestone-modal-body");

const imageLightboxEl = document.getElementById("image-lightbox");
const imageLightboxImg = document.getElementById("image-lightbox-img");
const imageLightboxCaption = document.getElementById("image-lightbox-caption");
const imageLightboxClose = document.getElementById("image-lightbox-close");
const imageLightboxBackdrop = document.getElementById("image-lightbox-backdrop");

let referencesById = {};
let lastFocusedElement = null;
let modalListenersBound = false;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hasItems(list) {
  return Array.isArray(list) && list.length > 0;
}

function renderImageSection(images) {
  if (!hasItems(images)) return "";

  const items = images
    .map((image) => {
      const title = escapeHtml(image.title || "");
      const src = escapeHtml(image.src || "");
      return `<figure class="ref-image">
        <button type="button" class="ref-image__trigger" data-preview-src="${src}" data-preview-title="${title}" aria-label="Preview ${title}">
          <span class="ref-image__frame">
            <img class="ref-image__img" src="${src}" alt="${title}" loading="lazy" decoding="async">
            <span class="ref-image__placeholder" hidden>
              <span class="material-symbols-outlined" aria-hidden="true">image</span>
            </span>
          </span>
        </button>
        ${title ? `<figcaption class="ref-image__caption">${title}</figcaption>` : ""}
      </figure>`;
    })
    .join("");

  return `<section class="modal-ref-section">
    <h3 class="modal-ref-section__heading">
      <span class="material-symbols-outlined modal-ref-section__icon" aria-hidden="true">imagesmode</span>
      Image References
    </h3>
    <div class="ref-image-grid">${items}</div>
  </section>`;
}

function renderLinkListItems(links, externalIcon) {
  return links
    .map((link) => {
      const title = escapeHtml(link.title || "Reference");
      const url = escapeHtml(link.url || "#");
      const description = link.description
        ? `<span class="ref-link__description">${escapeHtml(link.description)}</span>`
        : "";

      return `<li class="ref-link-list__item">
        <a class="ref-link" href="${url}" target="_blank" rel="noopener noreferrer">
          <span class="ref-link__text">
            <span class="ref-link__title">${title}</span>
            ${description}
          </span>
          <span class="material-symbols-outlined ref-link__external" aria-hidden="true">${externalIcon}</span>
        </a>
      </li>`;
    })
    .join("");
}

function renderLinkSection(links) {
  if (!hasItems(links)) return "";

  return `<section class="modal-ref-section">
    <h3 class="modal-ref-section__heading">
      <span class="material-symbols-outlined modal-ref-section__icon" aria-hidden="true">link</span>
      Link References
    </h3>
    <ul class="ref-link-list" role="list">${renderLinkListItems(links, "open_in_new")}</ul>
  </section>`;
}

function renderVideoSection(videos) {
  if (!hasItems(videos)) return "";

  return `<section class="modal-ref-section">
    <h3 class="modal-ref-section__heading">
      <span class="material-symbols-outlined modal-ref-section__icon" aria-hidden="true">smart_display</span>
      Video References
    </h3>
    <ul class="ref-link-list ref-link-list--videos" role="list">${renderLinkListItems(videos, "play_circle")}</ul>
  </section>`;
}

function bindImageErrorHandlers(root) {
  root.querySelectorAll(".ref-image__img").forEach((img) => {
    const showPlaceholder = () => {
      img.hidden = true;
      const placeholder = img.parentElement?.querySelector(".ref-image__placeholder");
      if (placeholder) placeholder.hidden = false;
      const trigger = img.closest(".ref-image__trigger");
      if (trigger) {
        trigger.removeAttribute("data-preview-src");
        trigger.disabled = true;
        trigger.setAttribute("aria-disabled", "true");
      }
    };

    if (img.complete && img.naturalWidth === 0) {
      showPlaceholder();
    } else {
      img.addEventListener("error", showPlaceholder, { once: true });
    }
  });
}

function bindPreviewTriggers(root) {
  root.querySelectorAll(".ref-image__trigger[data-preview-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.dataset.previewSrc;
      const title = button.dataset.previewTitle || "";
      if (!src) return;
      openImageLightbox(src, title);
    });
  });
}

function renderModalContent(data) {
  if (!milestoneModalBody) return;

  const html =
    renderImageSection(data.images) +
    renderLinkSection(data.links) +
    renderVideoSection(data.videos);
  milestoneModalBody.innerHTML = html || '<p class="milestone-modal__empty">No references available.</p>';
  bindImageErrorHandlers(milestoneModalBody);
  bindPreviewTriggers(milestoneModalBody);
}

function openMilestoneModal(referenceId) {
  const data = referencesById[referenceId];
  if (!data || !milestoneModalEl) return;

  if (milestoneModalTitle) milestoneModalTitle.textContent = data.title || "";
  if (milestoneModalSubtitle) milestoneModalSubtitle.textContent = data.subtitle || "";

  renderModalContent(data);

  lastFocusedElement = document.activeElement;
  milestoneModalEl.hidden = false;
  milestoneModalEl.classList.add("is-open");
  milestoneModalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  milestoneModalClose?.focus();
}

function closeMilestoneModal() {
  if (!milestoneModalEl?.classList.contains("is-open")) return;

  milestoneModalEl.classList.remove("is-open");
  milestoneModalEl.hidden = true;
  milestoneModalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (milestoneModalBody) milestoneModalBody.innerHTML = "";

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function openImageLightbox(src, title) {
  if (!imageLightboxEl || !imageLightboxImg) return;

  imageLightboxImg.src = src;
  imageLightboxImg.alt = title;
  if (imageLightboxCaption) {
    imageLightboxCaption.textContent = title;
    imageLightboxCaption.hidden = !title;
  }

  imageLightboxEl.hidden = false;
  imageLightboxEl.classList.add("is-open");
  imageLightboxEl.setAttribute("aria-hidden", "false");
  imageLightboxClose?.focus();
}

function closeImageLightbox() {
  if (!imageLightboxEl?.classList.contains("is-open")) return;

  imageLightboxEl.classList.remove("is-open");
  imageLightboxEl.hidden = true;
  imageLightboxEl.setAttribute("aria-hidden", "true");

  if (imageLightboxImg) {
    imageLightboxImg.removeAttribute("src");
    imageLightboxImg.alt = "";
  }
}

function isMilestoneModalOpen() {
  return milestoneModalEl?.classList.contains("is-open") === true;
}

function isImageLightboxOpen() {
  return imageLightboxEl?.classList.contains("is-open") === true;
}

function bindModalListeners() {
  if (modalListenersBound) return;
  modalListenersBound = true;

  milestoneModalClose?.addEventListener("click", closeMilestoneModal);
  milestoneModalBackdrop?.addEventListener("click", closeMilestoneModal);

  imageLightboxClose?.addEventListener("click", closeImageLightbox);
  imageLightboxBackdrop?.addEventListener("click", closeImageLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (isImageLightboxOpen()) {
      event.stopPropagation();
      closeImageLightbox();
      return;
    }

    if (isMilestoneModalOpen()) {
      event.stopPropagation();
      closeMilestoneModal();
    }
  });

  const grid = document.getElementById("milestone-grid");
  grid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reference-id]");
    if (!button) return;

    const referenceId = button.dataset.referenceId;
    if (referenceId && referencesById[referenceId]) {
      openMilestoneModal(referenceId);
    }
  });
}

function initMilestoneModal(referencesData) {
  referencesById = referencesData || {};
  bindModalListeners();
}

function referenceIdForMilestone(number) {
  return `milestone-${String(number).padStart(2, "0")}`;
}

function milestoneHasReferences(number) {
  const id = referenceIdForMilestone(number);
  return Boolean(referencesById[id]);
}

window.initMilestoneModal = initMilestoneModal;
window.milestoneHasReferences = milestoneHasReferences;
window.isMilestoneModalOpen = isMilestoneModalOpen;
