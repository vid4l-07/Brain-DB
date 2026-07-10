// Track current in-view heading and active section
let currentInViewSlug: string | null = null;
let currentActiveSection: string | null = null;

function updateSectionVisibility(tocContent: Element, sectionSlug: string | null) {
  if (!tocContent || currentActiveSection === sectionSlug) return;
  currentActiveSection = sectionSlug;

  const items = tocContent.querySelectorAll("li[data-section]");
  items.forEach((item) => {
    const itemSection = item.getAttribute("data-section");
    const isSectionHeader = item.classList.contains("toc-section-header");

    if (isSectionHeader) {
      item.classList.remove("toc-section-hidden");
    } else if (sectionSlug && itemSection === sectionSlug) {
      item.classList.remove("toc-section-hidden");
    } else {
      item.classList.add("toc-section-hidden");
    }
  });
}

function updateInViewAndSection() {
  const headers = Array.from(document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"));
  const threshold = window.innerHeight * 0.5;

  // Find the last header that passed through the viewport
  let lastPassedSlug: string | null = null;
  for (const header of headers) {
    const rect = header.getBoundingClientRect();
    if (rect.top <= threshold) {
      lastPassedSlug = header.id;
    }
  }

  // Update in-view class
  if (lastPassedSlug !== currentInViewSlug) {
    if (currentInViewSlug) {
      document.querySelectorAll(`a[data-for="${currentInViewSlug}"]`).forEach((el) => {
        el.classList.remove("in-view");
      });
    }
    currentInViewSlug = lastPassedSlug;
    if (currentInViewSlug) {
      document.querySelectorAll(`a[data-for="${currentInViewSlug}"]`).forEach((el) => {
        el.classList.add("in-view");
      });
    }
  }

  // Update section visibility based on in-view heading's section
  const tocContent = document.querySelector(".toc-content");
  if (tocContent && currentInViewSlug) {
    const inViewEntry = tocContent.querySelector(`a[data-for="${currentInViewSlug}"]`);
    if (inViewEntry) {
      const li = inViewEntry.closest("li[data-section]");
      if (li) {
        const section = li.getAttribute("data-section");
        updateSectionVisibility(tocContent, section);
      }
    }
  }
}

let scrollTicking = false;
function onScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateInViewAndSection();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

function addSectionDataAttributes(tocContent: Element) {
  const items = tocContent.querySelectorAll("li");
  let currentSectionSlug = "";

  items.forEach((item) => {
    const link = item.querySelector("a[data-for]");
    if (!link) return;

    const isH1 = item.classList.contains("depth-0");

    if (isH1) {
      currentSectionSlug = link.getAttribute("data-for") || "";
      item.classList.add("toc-section-header");
    }

    if (currentSectionSlug) {
      item.setAttribute("data-section", currentSectionSlug);
    }
  });
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed");
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  );
  const content = this.nextElementSibling as HTMLElement | undefined;
  if (!content) return;
  content.classList.toggle("collapsed");
}

function setupToc() {
  const tocElements = Array.from(document.getElementsByClassName("toc"));
  for (const toc of tocElements) {
    const button = toc.querySelector(".toc-header");
    const content = toc.querySelector(".toc-content");
    if (!button || !content) return;
    button.addEventListener("click", toggleToc);
    const cleanup = () => button.removeEventListener("click", toggleToc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).addCleanup) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).addCleanup(cleanup);
    }
  }
}

function handleNavOrRender() {
  setupToc();

  // Reset state
  window.removeEventListener("scroll", onScroll);
  currentInViewSlug = null;
  currentActiveSection = null;

  // Setup section data attributes
  const tocContent = document.querySelector(".toc-content");
  if (tocContent) {
    addSectionDataAttributes(tocContent);
  }

  // Initial update
  setTimeout(() => {
    updateInViewAndSection();
  }, 100);

  window.addEventListener("scroll", onScroll);
}

document.addEventListener("nav", handleNavOrRender);
document.addEventListener("render", handleNavOrRender);
