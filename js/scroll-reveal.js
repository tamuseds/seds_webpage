/* Short, staggered scroll entrances shared by every page. */
(function () {
  "use strict";
  function initScrollExperience() {
    var preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isHome = document.body.classList.contains("home-page");
    var scrollLinkedHome = isHome && window.CSS && CSS.supports("animation-timeline", "view()");
    var heroSelector = ".hero, .about-hero, .mission-hero, .join-hero, .solar-hero, .luna-hero, .snf-hero, .sac-hero, .portal-hero, .officers-hero, .donate-hero, .team-banner";
    var candidates = [
      ".reveal", "section > .container > h2", "section > h2", ".statement__text",
      ".footer__title", ".donate-cta > .container", ".portal-template__grid > *",
      ".about-row__text", ".about-row__media", ".mission-row__text", ".mission-row__media",
      ".solar-row__text", ".solar-row__media", ".snf-row__text", ".snf-row__media",
      ".sac-row__text", ".sac-row__media", ".luna-accomplish__text", ".luna-accomplish__media",
      ".board__grid > *", ".proj-cards__grid > *", ".officers-grid .officer-card",
      ".shop-grid > *", ".partners-static__grid > *", ".team-advisor__row",
      ".home-page .home-accordion", ".home-page .advisor-photo-only__wrap",
      ".join-columns > .container > *", ".solar-gallery__grid > *",
      ".luna-gallery__grid > *", ".snf-gallery__grid > *"
    ].join(", ");
    var all = Array.from(document.querySelectorAll(candidates)).filter(function (el) {
      return !el.closest(heroSelector) && !el.closest("[hidden]") && el.getClientRects().length;
    });
    // Pick the outermost block so existing reveals and their children never
    // double-animate, especially in the alternating Griffin timeline.
    var selected = new Set(all);
    var targets = all.filter(function (el) {
      for (var parent = el.parentElement; parent; parent = parent.parentElement) {
        if (selected.has(parent)) return false;
      }
      return true;
    });
    var observer;
    var timeline = document.querySelector(".griffin-timeline__list");
    var frame = 0;
    var resizeObserver;
    function showAll() {
      if (observer) observer.disconnect();
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      if (timeline) timeline.classList.remove("timeline-progress-ready");
      window.removeEventListener("scroll", requestTimelineUpdate);
      window.removeEventListener("resize", requestTimelineUpdate);
      if (resizeObserver) resizeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }
    function updateTimeline() {
      frame = 0;
      if (!timeline || preference.matches) return;
      var rect = timeline.getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (window.innerHeight * 0.68 - rect.top) / Math.max(1, rect.height)));
      timeline.style.setProperty("--timeline-progress", progress.toFixed(4));
    }
    function requestTimelineUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateTimeline);
    }
    if (preference.matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: isHome ? "0px 0px 64px 0px" : "0px 0px -24px 0px" });
    document.documentElement.classList.add("scroll-motion-ready");
    targets.forEach(function (el) {
      el.classList.add("scroll-reveal-managed");
      if (scrollLinkedHome) el.classList.add("home-scroll-linked");
      var rect = el.getBoundingClientRect();
      // First-screen content is immediately available; only new content
      // enters on scrolling. A low threshold also handles very tall rows.
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
        return;
      }
      var siblings = targets.filter(function (other) { return other.parentElement === el.parentElement; });
      el.style.setProperty("--reveal-delay", Math.min(siblings.indexOf(el), 3) * 65 + "ms");
      observer.observe(el);
    });
    document.addEventListener("focusin", function (event) {
      var target = event.target.closest(".scroll-reveal-managed");
      if (target) {
        target.classList.add("scroll-reveal-focused");
        target.style.setProperty("--reveal-delay", "0ms");
        target.classList.add("is-visible");
        observer.unobserve(target);
      }
    });
    preference.addEventListener("change", function (event) { if (event.matches) showAll(); });
    if (timeline) {
      timeline.classList.add("timeline-progress-ready");
      window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
      window.addEventListener("resize", requestTimelineUpdate);
      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(requestTimelineUpdate);
        resizeObserver.observe(timeline);
      }
      requestTimelineUpdate();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initScrollExperience);
  else initScrollExperience();
})();
