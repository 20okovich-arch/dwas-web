// ===========================
// DWAS V2 — script.js
// ===========================

// ── Mobile nav toggle ──────────────────────────────────────────────────
const siteHeader = document.getElementById('siteHeader');
const navToggle  = document.getElementById('navToggle');
const mainNav    = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!siteHeader.contains(e.target) && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on nav link click
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Header scroll shadow ───────────────────────────────────────────────
window.addEventListener('scroll', () => {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Fade-in on scroll ──────────────────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window && fadeEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Stagger siblings within same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')];
      const idx      = siblings.indexOf(entry.target);
      const delay    = Math.min(idx * 80, 320);

      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  fadeEls.forEach((el) => observer.observe(el));
}

// ── Analytics event helper ─────────────────────────────────────────────
function trackEvent(name, data = {}) {
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, data);
  }
  // GTM dataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...data });
  }
}

// ── CTA click tracking ─────────────────────────────────────────────────
document.querySelectorAll('[data-track]').forEach((el) => {
  el.addEventListener('click', () => {
    trackEvent('cta_click', {
      cta_id: el.dataset.track,
      href:   el.getAttribute('href') || '',
    });
  });
});

// ── Scroll depth tracking ──────────────────────────────────────────────
const depthMarks = { 25: false, 50: false, 75: false, 90: false };

window.addEventListener('scroll', () => {
  const scrolled = document.documentElement.scrollHeight - window.innerHeight;
  if (scrolled <= 0) return;
  const pct = Math.round((window.scrollY / scrolled) * 100);

  Object.keys(depthMarks).forEach((mark) => {
    if (!depthMarks[mark] && pct >= Number(mark)) {
      depthMarks[mark] = true;
      trackEvent('scroll_depth', { depth: Number(mark) });
    }
  });
}, { passive: true });

// ── Form submission ────────────────────────────────────────────────────
const diagForm   = document.getElementById('diagForm');
const formSubmit = document.getElementById('formSubmit');

if (diagForm && formSubmit) {
  diagForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = diagForm.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach((field) => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#d94f4f';
        valid = false;
      }
    });
    if (!valid) return;

    // Loading state
    const originalText = formSubmit.textContent;
    formSubmit.disabled    = true;
    formSubmit.textContent = 'Enviando…';

    try {
      const action = diagForm.getAttribute('action') || '';

      // Only send if Formspree ID has been configured
      if (action && !action.includes('YOUR_FORM_ID')) {
        const response = await fetch(action, {
          method:  'POST',
          body:    new FormData(diagForm),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Network error');
      }

      // Success
      formSubmit.textContent        = '✓ Mensaje recibido — te contactamos en menos de 48 h';
      formSubmit.style.background   = '#27ae60';
      formSubmit.style.borderColor  = '#27ae60';

      trackEvent('form_submit', {
        form_id: 'diagnostico',
        area:    diagForm.querySelector('#area')?.value   || '',
        tamano:  diagForm.querySelector('#tamano')?.value || '',
      });

      // Reset after 6 s
      setTimeout(() => {
        diagForm.reset();
        formSubmit.disabled         = false;
        formSubmit.textContent      = originalText;
        formSubmit.style.background = '';
        formSubmit.style.borderColor = '';
      }, 6000);

    } catch {
      formSubmit.disabled         = false;
      formSubmit.textContent      = 'Hubo un error. Intenta de nuevo.';
      formSubmit.style.background  = '#d94f4f';
      formSubmit.style.borderColor = '#d94f4f';
      setTimeout(() => {
        formSubmit.textContent       = originalText;
        formSubmit.style.background  = '';
        formSubmit.style.borderColor = '';
      }, 3500);
    }
  });
}
