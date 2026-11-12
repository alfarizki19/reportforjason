/**
 * Client Progress Report - menu page visibility and active navigation
 */

const DEFAULT_MENU_ID = "menuOverview";

function switchMenu(menuId) {
  const pages = document.querySelectorAll(".menu-page");

  pages.forEach((page) => {
    page.hidden = true;
  });

  const selectedPage = document.getElementById(menuId);

  if (selectedPage) {
    selectedPage.hidden = false;
  }

  document.querySelectorAll("[data-menu-target]").forEach((button) => {
    const isActive = button.dataset.menuTarget === menuId;

    button.classList.toggle("is-active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (typeof window.closeMobileSidebar === "function") {
    window.closeMobileSidebar();
  }
}

function initMenuNavigation() {
  const navButtons = document.querySelectorAll("[data-menu-target]");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const menuId = button.dataset.menuTarget;
      if (menuId) {
        switchMenu(menuId);
      }
    });
  });

  const pages = document.querySelectorAll(".menu-page");
  pages.forEach((page) => {
    page.hidden = true;
  });

  switchMenu(DEFAULT_MENU_ID);
}

document.addEventListener("DOMContentLoaded", initMenuNavigation);
