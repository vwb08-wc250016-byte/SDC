const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const pageRoot = document.documentElement;
const linkNotice = document.querySelector(".link-notice");
const unconfiguredLinks = document.querySelectorAll("[data-unconfigured-link]");
let scrollbarTimer;
let linkNoticeTimer;

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "メニューを閉じる" : "メニューを開く");
  mobileMenu.classList.toggle("is-open", willOpen);
  mobileMenu.setAttribute("aria-hidden", String(!willOpen));
  document.body.classList.toggle("menu-open", willOpen);
}

menuButton.addEventListener("click", toggleMenu);

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  const menuIsOpen = menuButton.getAttribute("aria-expanded") === "true";
  const clickedInsideMenu = mobileMenu.contains(event.target);
  const clickedMenuButton = menuButton.contains(event.target);

  if (menuIsOpen && !clickedInsideMenu && !clickedMenuButton) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 700) {
    closeMenu();
  }
});

function showScrollbarWhileScrolling() {
  pageRoot.classList.add("is-scrolling");
  window.clearTimeout(scrollbarTimer);
  scrollbarTimer = window.setTimeout(() => {
    pageRoot.classList.remove("is-scrolling");
  }, 1000);
}

window.addEventListener("scroll", showScrollbarWhileScrolling, { passive: true });

function showUnconfiguredLinkNotice(link) {
  const linkName = link.dataset.linkName;
  linkNotice.textContent = `「${linkName}」のリンク先は未設定です。`;
  linkNotice.classList.add("is-visible");
  window.clearTimeout(linkNoticeTimer);
  linkNoticeTimer = window.setTimeout(() => {
    linkNotice.classList.remove("is-visible");
  }, 2500);
}

unconfiguredLinks.forEach((link) => {
  link.addEventListener("click", () => {
    showUnconfiguredLinkNotice(link);
  });

  link.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showUnconfiguredLinkNotice(link);
    }
  });
});
