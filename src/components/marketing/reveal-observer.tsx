'use client';

import {useEffect} from 'react';

/**
 * Mounted once near the top of the tree. Finds every `.reveal` element and
 * toggles `.is-visible` when it scrolls into view — keeps the page markup
 * server-rendered while still doing a subtle fade-up animation.
 *
 * Re-observes after navigation (Next router patches the DOM rather than
 * remounting), and bails out gracefully when IntersectionObserver is missing.
 */
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document
        .querySelectorAll<HTMLElement>('.reveal')
        .forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.05}
    );

    const observe = () => {
      document
        .querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')
        .forEach((el) => io.observe(el));
    };

    observe();

    // Re-scan when the route changes — Next replaces sub-trees in place.
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, {childList: true, subtree: true});

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
