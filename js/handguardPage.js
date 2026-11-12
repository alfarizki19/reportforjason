/**
 * Client Progress Report - Handguard product table and detail modal
 */

const HANDGUARD_DATA_URL = "../../data/part-data/upper-stripped/handguard.json";

const MODEL_STATUS_LABELS = {
  implemented: "Implemented",
  finish: "Finish",
  "in-progress": "In Progress",
};

const tableBody = document.getElementById("handguard-table-body");
const tableScroll = document.getElementById("handguard-table-scroll");
const tableError = document.getElementById("handguard-table-error");
const productCountEl = document.getElementById("handguard-product-count");
const pageSubtitle = document.getElementById("handguard-page-subtitle");
const productDialog = document.getElementById("handguard-product-dialog");
const dialogSubtitle = document.getElementById("handguard-dialog-subtitle");
const dialogBody = document.getElementById("handguard-dialog-body");
const dialogClose = document.getElementById("handguard-dialog-close");

let products = [];

function getItemCount(product) {
  const count = Number(product.itemCount);
  if (!Number.isFinite(count) || count < 1) {
    return 0;
  }
  return Math.floor(count);
}

function formatItemsProductsSummary(totalItems, totalProducts) {
  const itemLabel = totalItems === 1 ? "item" : "items";
  const productLabel = totalProducts === 1 ? "product" : "products";
  return `${totalItems} ${itemLabel} from ${totalProducts} ${productLabel}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getModelStatusClass(status) {
  const normalized = String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  if (normalized === "implemented") return "model-status--implemented";
  if (normalized === "finish") return "model-status--finish";
  if (normalized === "in-progress") return "model-status--in-progress";
  return "model-status--in-progress";
}

function getModelStatusLabel(status) {
  const normalized = String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  return MODEL_STATUS_LABELS[normalized] || status;
}

function renderModelStatusBadge(status) {
  const statusClass = getModelStatusClass(status);
  const label = escapeHtml(getModelStatusLabel(status));
  return `<span class="model-status ${statusClass}">
    <span class="model-status__dot" aria-hidden="true"></span>
    <span class="model-status__label">${label}</span>
  </span>`;
}

function renderTableRow(product, rowNumber) {
  const productKey = escapeHtml(product.id);
  return `<tr class="parts-table__row" data-product-id="${productKey}">
    <td class="parts-table__cell-no">${rowNumber}</td>
    <td class="parts-table__cell-brand">${escapeHtml(product.brand)}</td>
    <td class="parts-table__cell-title">${escapeHtml(product.productTitle)}</td>
    <td class="parts-table__cell-items">${getItemCount(product)}</td>
    <td>${escapeHtml(product.handguardLength)}</td>
    <td>${renderModelStatusBadge(product.status)}</td>
    <td>
      <button type="button" class="parts-table__action" data-product-id="${productKey}">
        <span class="material-symbols-outlined parts-table__action-icon" aria-hidden="true">visibility</span>
        View Details
      </button>
    </td>
  </tr>`;
}

function renderTable(productList) {
  if (!tableBody) return;
  tableBody.innerHTML = productList.map((product, index) => renderTableRow(product, index + 1)).join("");
}

function updateItemsProductsSummary(productList) {
  if (!productCountEl) return;

  const totalProducts = productList.length;
  const totalItems = productList.reduce(
    (total, product) => total + getItemCount(product),
    0
  );

  productCountEl.textContent = formatItemsProductsSummary(totalItems, totalProducts);
}

function renderImagePlaceholders() {
  const labels = ["Image 1", "Image 2", "Image 3"];
  return labels
    .map(
      (label) => `<figure class="product-image-placeholder">
        <div class="product-image-placeholder__frame" aria-hidden="true">
          <span class="material-symbols-outlined product-image-placeholder__icon">image</span>
        </div>
        <figcaption class="product-image-placeholder__caption">${escapeHtml(label)}</figcaption>
      </figure>`
    )
    .join("");
}

function renderProductImages(images) {
  if (Array.isArray(images) && images.length > 0) {
    return images
      .map((image) => {
        const title = escapeHtml(image.title || "Reference Image");
        const src = escapeHtml(image.src || "");
        if (!src) return "";
        return `<figure class="product-image-item">
          <div class="product-image-item__frame">
            <img src="${src}" alt="${title}" loading="lazy" decoding="async">
          </div>
          <figcaption class="product-image-item__caption">${title}</figcaption>
        </figure>`;
      })
      .join("");
  }
  return renderImagePlaceholders();
}

function renderReferenceLinks(referenceLinks) {
  if (!Array.isArray(referenceLinks) || referenceLinks.length === 0) {
    return '<p class="product-dialog__empty">No reference links available.</p>';
  }

  const items = referenceLinks
    .map((link) => {
      const title = escapeHtml(link.title || "Reference");
      const url = escapeHtml(link.url || "#");
      return `<li class="ref-link-list__item">
        <a class="ref-link" href="${url}" target="_blank" rel="noopener noreferrer">
          <span class="ref-link__text">
            <span class="ref-link__title">${title}</span>
          </span>
          <span class="material-symbols-outlined ref-link__external" aria-hidden="true">open_in_new</span>
        </a>
      </li>`;
    })
    .join("");

  return `<ul class="ref-link-list product-ref-link-list" role="list">${items}</ul>`;
}

function renderDialogContent(product) {
  const imageGrid = renderProductImages(product.images);
  const referenceLinksHtml = renderReferenceLinks(product.referenceLinks);

  return `<section class="product-dialog__section">
    <h3 class="product-dialog__section-heading">
      <span class="material-symbols-outlined" aria-hidden="true">imagesmode</span>
      Image References
    </h3>
    <div class="product-image-grid">${imageGrid}</div>
  </section>
  <section class="product-dialog__section">
    <h3 class="product-dialog__section-heading">
      <span class="material-symbols-outlined" aria-hidden="true">link</span>
      Link References
    </h3>
    ${referenceLinksHtml}
  </section>`;
}

function openProductModal(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !productDialog) return;

  if (dialogSubtitle) {
    dialogSubtitle.textContent = product.productTitle || "";
  }
  if (dialogBody) {
    dialogBody.innerHTML = renderDialogContent(product);
  }

  if (typeof productDialog.showModal === "function") {
    productDialog.showModal();
  }
}

function closeProductModal() {
  if (!productDialog) return;
  if (productDialog.open) {
    productDialog.close();
  }
  if (dialogBody) {
    dialogBody.innerHTML = "";
  }
}

function bindTableActions() {
  tableBody?.addEventListener("click", (event) => {
    const button = event.target.closest(".parts-table__action");
    if (!button) return;
    const productId = button.dataset.productId;
    if (productId) {
      openProductModal(productId);
    }
  });
}

function bindDialogHandlers() {
  dialogClose?.addEventListener("click", closeProductModal);

  productDialog?.addEventListener("click", (event) => {
    const panel = productDialog.querySelector(".product-dialog__panel");
    if (panel && !panel.contains(event.target)) {
      closeProductModal();
    }
  });

  productDialog?.addEventListener("close", () => {
    if (dialogBody) dialogBody.innerHTML = "";
  });
}

function showLoadError() {
  if (tableScroll) tableScroll.hidden = true;
  if (tableError) tableError.hidden = false;
}

async function initHandguardPage() {
  bindTableActions();
  bindDialogHandlers();

  try {
    const response = await fetch(HANDGUARD_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load handguard data: ${response.status}`);
    }

    const data = await response.json();
    products = data.products || [];

    if (pageSubtitle && data.description) {
      pageSubtitle.textContent = data.description;
    }

    renderTable(products);
    updateItemsProductsSummary(products);
  } catch (error) {
    console.error(error);
    showLoadError();
    updateItemsProductsSummary([]);
  }
}

document.addEventListener("DOMContentLoaded", initHandguardPage);
