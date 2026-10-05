(function () {
  'use strict';

  const section = document.querySelector('.sponsor-scroll');
  const entries = window.SPONSOR_LOGOS || [];
  if (!section || !entries.length) return;

  const viewport = section.querySelector('.sponsor-scroll__viewport');
  const track = section.querySelector('.sponsor-scroll__track');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Wait for valid images so broken or missing files never leave empty cards.
  Promise.all(entries.map((entry) => new Promise((resolve) => {
    const img = new Image();
    img.alt = entry.name;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '../images/sponsorlogos/' + encodeURIComponent(entry.file);
  }))).then((images) => {
    const logos = images.filter(Boolean);
    if (!logos.length) return;
    section.hidden = false;

    function rebuild() {
      const width = viewport.clientWidth;
      if (!width) return;
      // Fewer sponsors get larger cards; longer lists keep a readable minimum.
      const cardWidth = Math.max(130, Math.min(240, width / Math.min(logos.length, 6) - 40));
      section.style.setProperty('--sponsor-width', cardWidth + 'px');
      const group = document.createElement('ul');
      group.className = 'sponsor-scroll__group';
      group.setAttribute('aria-label', 'Sponsors');
      logos.forEach((img) => {
        const item = document.createElement('li');
        item.className = 'sponsor-scroll__logo';
        item.appendChild(img);
        group.appendChild(item);
      });
      track.replaceChildren(group);

      if (reducedMotion.matches) return;
      const originals = Array.from(group.children);
      const cycleWidth = group.getBoundingClientRect().width;
      const repetitions = Math.max(1, Math.ceil(width / cycleWidth));
      // Each half must cover the viewport, even when there is only one logo.
      for (let i = 1; i < repetitions; i++) {
        originals.forEach((item) => {
          const copy = item.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          group.appendChild(copy);
        });
      }
      const duplicate = group.cloneNode(true);
      duplicate.setAttribute('aria-hidden', 'true');
      duplicate.removeAttribute('aria-label');
      track.appendChild(duplicate);
      // Travel at 45px/second regardless of the number of sponsors.
      section.style.setProperty('--sponsor-duration', group.getBoundingClientRect().width / 45 + 's');
    }

    let previousWidth = 0;
    new ResizeObserver(() => {
      if (viewport.clientWidth !== previousWidth) {
        previousWidth = viewport.clientWidth;
        rebuild();
      }
    }).observe(viewport);
    reducedMotion.addEventListener('change', rebuild);
    rebuild();
  });
})();
