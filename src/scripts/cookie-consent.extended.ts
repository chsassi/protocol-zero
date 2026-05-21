(function () {
  const STORAGE_KEY = 'p0_cookie_consent';

  function requireElement<T extends Element>(
    selector: string,
    type: { new (): T }
  ): T {
    const element = document.querySelector(selector);

    if (!(element instanceof type)) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  }

  const popup = requireElement('[data-cookie-consent]', HTMLElement);
  const accept = requireElement('[data-cookie-accept]', HTMLButtonElement);
  const reject = requireElement('[data-cookie-reject]', HTMLButtonElement);

  const hasConsent = localStorage.getItem(STORAGE_KEY);

  function show() {
    if (hasConsent) return;

    popup.hidden = false;

    requestAnimationFrame(() => {
      popup.classList.add('is-visible');
    });
  }

  function close(value: 'accepted' | 'rejected') {
    localStorage.setItem(STORAGE_KEY, value);
    popup.classList.remove('is-visible');

    setTimeout(() => {
      popup.hidden = true;
    }, 250);
  }

  accept.addEventListener('click', () => close('accepted'));
  reject.addEventListener('click', () => close('rejected'));

  window.addEventListener('p0:loader-complete', show, { once: true });
})();
