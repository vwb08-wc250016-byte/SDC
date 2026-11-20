const menuButton = document.querySelector(".menu-button");
const drawer = document.querySelector(".drawer");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
  drawer.setAttribute("aria-hidden", String(isOpen));
  drawer.classList.toggle("is-open", !isOpen);
});

document.addEventListener("click", (event) => {
  if (!drawer.contains(event.target) && !menuButton.contains(event.target)) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    drawer.setAttribute("aria-hidden", "true");
    drawer.classList.remove("is-open");
  }
});

drawer.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "メニューを開く");
    drawer.setAttribute("aria-hidden", "true");
    drawer.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    menuButton.click();
    menuButton.focus();
  }
});

const labels = {
  all: "すべてのお知らせ",
  notice: "お知らせ",
  event: "イベント",
  archive: "過去の優勝者",
};

const filterButtons = document.querySelectorAll(".filter");
const newsItems = document.querySelectorAll(".news-item");
const listTitle = document.querySelector("#list-title");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    newsItems.forEach((item) => {
      item.hidden = selected !== "all" && item.dataset.category !== selected;
    });
    listTitle.textContent = labels[selected];
  });
});

const overlayScrollbar = document.querySelector(".overlay-scrollbar");
const scrollbarThumb = document.querySelector(".overlay-scrollbar__thumb");
let scrollbarFadeTimer;
let scrollbarFrame;

const updateScrollbar = () => {
  const viewportHeight = window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const maxScroll = Math.max(pageHeight - viewportHeight, 0);

  if (maxScroll === 0) {
    overlayScrollbar.classList.remove("is-visible");
    scrollbarThumb.style.height = "0";
    return false;
  }

  const thumbHeight = Math.max((viewportHeight / pageHeight) * viewportHeight, 28);
  const availableTrack = viewportHeight - thumbHeight;
  const scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

  scrollbarThumb.style.height = `${thumbHeight}px`;
  scrollbarThumb.style.transform = `translate3d(0, ${availableTrack * scrollProgress}px, 0)`;
  return true;
};

const showScrollbar = () => {
  if (scrollbarFrame) {
    cancelAnimationFrame(scrollbarFrame);
  }

  scrollbarFrame = requestAnimationFrame(() => {
    overlayScrollbar.classList.toggle("is-visible", updateScrollbar());
    scrollbarFrame = null;
  });

  window.clearTimeout(scrollbarFadeTimer);
  scrollbarFadeTimer = window.setTimeout(() => {
    overlayScrollbar.classList.remove("is-visible");
  }, 1000);
};

window.addEventListener("scroll", showScrollbar, { passive: true });
window.addEventListener("resize", updateScrollbar);

if ("ResizeObserver" in window) {
  new ResizeObserver(updateScrollbar).observe(document.body);
}

updateScrollbar();
