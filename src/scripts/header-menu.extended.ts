/**
 * Header scroll visibility and hamburger menu
 * Source: src/layouts/HeaderLayout.astro
 *
 * This is the EXTENDED (readable) version.
 * Edit this file and run the build to update the compact version.
 */

const header = document.querySelector('.header');
const hamburgerBtn = document.querySelector('.hamburger-btn');
const closeBtn = document.querySelector('.fullscreen-menu-close');
const fullscreenMenu = document.querySelector('.fullscreen-menu');
const navLinks = fullscreenMenu?.querySelectorAll('a');

// On home, start with a transparent hamburger-only header and reveal the full
// dark header after scrolling. Subpages always show the complete header.
const isHomePage = document.querySelector('.hero-slideshow') !== null;

header?.classList.add('is-visible');

if (isHomePage) {
  header?.classList.add('is-home');

  const updateHomeHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 100);
  };

  updateHomeHeader();
  window.addEventListener('scroll', updateHomeHeader, { passive: true });
}

// Fullscreen menu functions
let scrollPosition = 0;

function openMenu() {
  scrollPosition = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  fullscreenMenu?.classList.add('is-open');
  hamburgerBtn?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  fullscreenMenu?.classList.remove('is-open');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollPosition);
}

// Event listeners
hamburgerBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
navLinks?.forEach(link => link.addEventListener('click', closeMenu));

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fullscreenMenu?.classList.contains('is-open')) {
    closeMenu();
  }
});
