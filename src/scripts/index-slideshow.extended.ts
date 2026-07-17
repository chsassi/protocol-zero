/**
 * Slideshow and scroll indicator logic
 * Source: src/pages/index.astro
 *
 * This is the EXTENDED (readable) version.
 * Edit this file and run the build to update the compact version.
 */

const SWIPE_THRESHOLD = 50;       // Minimum px for valid swipe
const SWIPE_ANGLE_THRESHOLD = 30; // Max degrees from horizontal

function limitSlideshowItems(
  container: string,
  slide: string,
  indicator: string
) {
  const el = document.querySelector<HTMLElement>(container);
  const maxItems = Number.parseInt(el?.dataset.maxItems || '', 10);
  const slides = Array.from(el?.querySelectorAll(slide) || []);
  const indicators = Array.from(el?.querySelectorAll(indicator) || []);

  if (!el || !Number.isFinite(maxItems) || maxItems < 1 || slides.length <= maxItems) {
    return;
  }

  const shuffledIndexes = slides.map((_, index) => index);
  for (let i = shuffledIndexes.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledIndexes[i], shuffledIndexes[randomIndex]] = [
      shuffledIndexes[randomIndex],
      shuffledIndexes[i],
    ];
  }

  const selectedIndexes = new Set(shuffledIndexes.slice(0, maxItems));

  slides.forEach((item, index) => {
    if (!selectedIndexes.has(index)) item.remove();
  });
  indicators.forEach((item, index) => {
    if (!selectedIndexes.has(index)) item.remove();
  });

  const remainingSlides = Array.from(el.querySelectorAll(slide));
  const remainingIndicators = Array.from(el.querySelectorAll(indicator));

  remainingSlides.forEach((item, index) => {
    item.setAttribute('data-slide', String(index));
    item.classList.toggle('is-active', index === 0);
  });
  remainingIndicators.forEach((item, index) => {
    item.setAttribute('data-slide', String(index));
    item.setAttribute('aria-label', `Go to slide ${index + 1}`);
    item.classList.toggle('is-active', index === 0);
  });
}

function createSlideshow(
  container: string,
  slide: string,
  indicator: string,
  next: string,
  prev: string,
  interval = 5000,
  bgBlur?: string
) {
  limitSlideshowItems(container, slide, indicator);

  let idx = 0;
  const el = document.querySelector(container);
  const slides = Array.from(el?.querySelectorAll(slide) || []);
  const indicators = Array.from(el?.querySelectorAll(indicator) || []);
  const nextBtn = el?.querySelector(next),
    prevBtn = el?.querySelector(prev);
  const blur = bgBlur ? el?.querySelector(bgBlur) : null;
  if (!slides.length) return;

  // Swipe state
  const swipe = {
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    pointerId: null as number | null,
    isTransitioning: false
  };

  const update = (i: number) => {
    slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    indicators.forEach((ind, j) => ind.classList.toggle('is-active', j === i));
    if (blur) {
      const bg = slides[i].getAttribute('data-image');
      if (bg) (blur as HTMLElement).style.backgroundImage = `url(${bg})`;
    }
    idx = i;
  };

  const go = (dir: number) => {
    if (swipe.isTransitioning) return;
    swipe.isTransitioning = true;
    update((idx + dir + slides.length) % slides.length);
    setTimeout(() => { swipe.isTransitioning = false; }, 600);
  };

  // Auto-play timer functions
  let timer = setInterval(() => go(1), interval);
  const pauseAutoPlay = () => clearInterval(timer);
  const resumeAutoPlay = () => {
    clearInterval(timer);
    timer = setInterval(() => go(1), interval);
  };

  // Swipe helper
  const isHorizontalSwipe = (deltaX: number, deltaY: number): boolean => {
    const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI);
    return angle <= SWIPE_ANGLE_THRESHOLD;
  };

  // Pointer event handlers
  const handlePointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, .hero-nav-btn, .content-slide-nav-btn')) return;

    swipe.isDown = true;
    swipe.startX = e.clientX;
    swipe.startY = e.clientY;
    swipe.currentX = e.clientX;
    swipe.pointerId = e.pointerId;

    (el as HTMLElement).setPointerCapture(e.pointerId);
    (el as HTMLElement).style.cursor = 'grabbing';
    (el as HTMLElement).style.opacity = '0.95';
    pauseAutoPlay();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!swipe.isDown || e.pointerId !== swipe.pointerId) return;

    swipe.currentX = e.clientX;
    const deltaX = swipe.currentX - swipe.startX;
    const deltaY = e.clientY - swipe.startY;

    if (isHorizontalSwipe(deltaX, deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!swipe.isDown || e.pointerId !== swipe.pointerId) return;

    const deltaX = swipe.currentX - swipe.startX;
    const deltaY = e.clientY - swipe.startY;

    if (isHorizontalSwipe(deltaX, deltaY) && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        go(1);  // Swipe left → next
      } else {
        go(-1); // Swipe right → prev
      }
    }

    swipe.isDown = false;
    swipe.pointerId = null;
    (el as HTMLElement).style.cursor = '';
    (el as HTMLElement).style.opacity = '';
    resumeAutoPlay();
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== swipe.pointerId) return;
    swipe.isDown = false;
    swipe.pointerId = null;
    (el as HTMLElement).style.cursor = '';
    (el as HTMLElement).style.opacity = '';
    resumeAutoPlay();
  };

  nextBtn?.addEventListener('click', () => go(1));
  prevBtn?.addEventListener('click', () => go(-1));
  indicators.forEach((ind, i) =>
    ind.addEventListener('click', () => update(i))
  );

  el?.addEventListener('mouseenter', () => pauseAutoPlay());
  el?.addEventListener('mouseleave', () => resumeAutoPlay());

  // Attach swipe event listeners
  if (el) {
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerCancel);

    // Prevent image drag
    el.querySelectorAll('img').forEach(img => {
      img.addEventListener('dragstart', e => e.preventDefault());
    });

    // Allow vertical scroll, block horizontal gestures
    (el as HTMLElement).style.touchAction = 'pan-y pinch-zoom';
  }

  update(0);
}

createSlideshow(
  '.hero-slideshow',
  '.hero-slide',
  '.hero-slideshow-indicators .hero-indicator',
  '.hero-nav-btn.next',
  '.hero-nav-btn.prev',
  6000
);
createSlideshow(
  '#artists.content-slideshow',
  '.content-slide',
  '.content-slideshow-indicators .content-indicator',
  '.content-slide-nav-btn.next',
  '.content-slide-nav-btn.prev',
  5000,
  '.content-slide-bg-blur'
);
createSlideshow(
  '#releases.content-slideshow',
  '.content-slide',
  '.content-slideshow-indicators .content-indicator',
  '.content-slide-nav-btn.next',
  '.content-slide-nav-btn.prev',
  5000,
  '.content-slide-bg-blur'
);

const scrollIndicator = document.querySelector('.scroll-indicator');
const sections = [
  { id: 'home', name: 'Home' },
  { id: 'about', name: 'About' },
  { id: 'artists', name: 'Artists' },
  { id: 'releases', name: 'Releases' },
  { id: 'contacts', name: 'Contacts' },
];

function onScroll() {
  const scrollY = window.scrollY,
    winH = window.innerHeight,
    isScrolled = scrollY > winH / 2;
  scrollIndicator?.classList.toggle('is-scrolled', isScrolled);
  scrollIndicator?.setAttribute(
    'aria-label',
    isScrolled ? 'Scroll to top' : 'Scroll down'
  );

  let active = sections[0];
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < winH / 2 && r.bottom > 0) active = s;
    }
  });
  const headerText = document.querySelector('.header-current-page');
  if (headerText) headerText.textContent = active.name;
}

scrollIndicator?.addEventListener('click', () => {
  if (window.scrollY > window.innerHeight / 2)
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
