/**
 * Page loader animation
 * Source: src/pages/index.astro
 *
 * This is the EXTENDED (readable) version.
 * Edit this file and run the build to update the compact version.
 */

(function () {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const hide = () => {
    loader.classList.add('is-loaded');

    setTimeout(() => {
      loader.style.display = 'none';

      // Notify the app that the intro transition is finished
      window.dispatchEvent(new CustomEvent('p0:loader-complete'));
    }, 600);
  };

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) hide();
  });

  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (!nav || nav.type === 'navigate') {
    document.readyState === 'complete'
      ? hide()
      : window.addEventListener('load', hide);
  } else hide();
})();
