
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
const filterButton = document.querySelector("[data-filter-button]");
const faqSheet = document.querySelector("[data-faq-sheet]");
const faqSheetList = document.querySelector("[data-faq-sheet-list]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const interactionStatus = document.querySelector("[data-interaction-status]");
const unconfiguredElements = document.querySelectorAll("[data-unconfigured-label]");

const setupOverlayScrollbar = () => {
  const root = document.documentElement;
  const nativeScrollbarWidth = window.innerWidth - root.clientWidth;
  const canHideNativeScrollbar =
    CSS.supports("scrollbar-width", "none") || CSS.supports("selector(::-webkit-scrollbar)");

  // Keep the native scrollbar when replacing it could change the page width.
  if (!canHideNativeScrollbar || nativeScrollbarWidth > 0) return;

  const scrollbar = document.createElement("div");
  const thumb = document.createElement("div");
  let hideTimer;
  let updateFrame;

  scrollbar.className = "overlay-scrollbar";
  scrollbar.setAttribute("aria-hidden", "true");
  thumb.className = "overlay-scrollbar__thumb";
  scrollbar.append(thumb);
  document.body.append(scrollbar);
  root.classList.add("has-overlay-scrollbar");

  const updateThumb = () => {
    updateFrame = undefined;

    const viewportHeight = window.innerHeight;
    const documentHeight = root.scrollHeight;
    const maxScroll = documentHeight - viewportHeight;

    if (maxScroll <= 0) {
      scrollbar.classList.remove("is-visible");
      return;
    }

    const thumbHeight = Math.max(32, (viewportHeight / documentHeight) * viewportHeight);
    const availableTravel = viewportHeight - thumbHeight;
    const thumbTop = (window.scrollY / maxScroll) * availableTravel;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
  };

  const requestThumbUpdate = () => {
    if (updateFrame) return;
    updateFrame = requestAnimationFrame(updateThumb);
  };

  const showWhileScrolling = () => {
    requestThumbUpdate();
    scrollbar.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      scrollbar.classList.remove("is-visible");
    }, 1000);
  };

  window.addEventListener("scroll", showWhileScrolling, { passive: true });
  window.addEventListener("resize", requestThumbUpdate, { passive: true });

  if ("ResizeObserver" in window) {
    new ResizeObserver(requestThumbUpdate).observe(document.body);
  }

  updateThumb();
};

setupOverlayScrollbar();

let selectedFaqItem;
let faqSheetIsOpen = false;

const getFaqItems = () => [...document.querySelectorAll(".faq-list .faq-item")];

const populateFaqSheet = () => {
  if (!faqSheetList) return;

  faqSheetList.replaceChildren();

  getFaqItems().forEach((faqItem, index) => {
    const questionRow = faqItem.querySelector(".faq-row:first-child");
    const question = questionRow?.querySelector(".question-text");
    const marker = questionRow?.querySelector(".marker");

    if (!question || !marker) return;

    faqItem.id ||= `faq-question-${index + 1}`;
    question.tabIndex = -1;

    const itemButton = document.createElement("button");
    const questionLabel = document.createElement("span");

    itemButton.className = "faq-sheet__item";
    itemButton.type = "button";
    itemButton.dataset.faqTarget = faqItem.id;
    itemButton.setAttribute("aria-controls", faqItem.id);
    itemButton.setAttribute("aria-current", String(faqItem === selectedFaqItem));
    questionLabel.textContent = question.textContent.trim();
    itemButton.append(marker.cloneNode(true), questionLabel);
    faqSheetList.append(itemButton);
  });
};

const setFaqSheetOpen = (isOpen, restoreFocus = true) => {
  if (!faqSheet || !filterButton) return;

  faqSheetIsOpen = isOpen;
  filterButton.setAttribute("aria-expanded", String(isOpen));
  faqSheet.setAttribute("aria-hidden", String(!isOpen));
  faqSheet.inert = !isOpen;
  document.documentElement.classList.toggle("has-open-faq-sheet", isOpen);
  document.body.classList.toggle("has-open-faq-sheet", isOpen);

  if (isOpen) {
    populateFaqSheet();
    faqSheet.getBoundingClientRect();
    faqSheet.classList.add("is-open");
    requestAnimationFrame(() => {
      const currentItem =
        faqSheetList?.querySelector('[aria-current="true"]') ??
        faqSheetList?.querySelector(".faq-sheet__item");
      currentItem?.scrollIntoView({ block: "nearest" });
      faqSheet.querySelector(".faq-sheet__close")?.focus();
    });
    return;
  }

  faqSheet.classList.remove("is-open");
  if (restoreFocus) filterButton.focus();
};

filterButton?.addEventListener("click", () => setFaqSheetOpen(true));

faqSheet?.querySelectorAll("[data-faq-sheet-close]").forEach((closeButton) => {
  closeButton.addEventListener("click", () => setFaqSheetOpen(false));
});

faqSheetList?.addEventListener("click", (event) => {
  const itemButton = event.target.closest("[data-faq-target]");
  if (!itemButton) return;

  const target = document.getElementById(itemButton.dataset.faqTarget);
  if (!target) return;

  selectedFaqItem?.classList.remove("is-selected");
  selectedFaqItem = target;
  selectedFaqItem.classList.add("is-selected");
  setFaqSheetOpen(false, false);

  window.setTimeout(() => {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    window.setTimeout(() => {
      target.querySelector(".question-text")?.focus({ preventScroll: true });
    }, 500);
  }, 50);
});

document.addEventListener("keydown", (event) => {
  if (!faqSheetIsOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setFaqSheetOpen(false);
    return;
  }

  if (event.key !== "Tab") return;

  const focusableElements = [
    ...faqSheet.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
  ];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
});

const setMenuOpen = (isOpen) => {
  menuButton?.setAttribute("aria-expanded", String(isOpen));
  menuButton?.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  menu?.setAttribute("aria-hidden", String(!isOpen));
  if (menu) menu.inert = !isOpen;
  menu?.classList.toggle("is-open", isOpen);
};

menuButton?.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenuOpen(false);
    menuButton?.focus();
  });
});

document.addEventListener("pointerdown", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true") return;
  if (event.target.closest(".site-header")) return;
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || menuButton?.getAttribute("aria-expanded") !== "true") return;
  setMenuOpen(false);
  menuButton.focus();
});

const announceUnconfigured = (element) => {
  if (!interactionStatus) return;
  interactionStatus.textContent = `${element.dataset.unconfiguredLabel}はリンク先または動作が未設定です。`;
};

unconfiguredElements.forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    announceUnconfigured(element);
  });

  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    announceUnconfigured(element);
  });
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    formStatus.textContent = "未入力の項目をご確認ください。";
    return;
  }

  formStatus.textContent = "送信先が未設定のため、現在は送信できません。";
});
