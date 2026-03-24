// ===========================
// DWAS — script.js
// ===========================

// ----- NAV TOGGLE (mobile) -----
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Close nav when a link is clicked (mobile)
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ----- HEADER SCROLL SHADOW -----
const siteHeader = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ----- FADE-IN ON SCROLL -----
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    // Stagger cards within the same parent
    const parent   = entry.target.parentElement;
    const siblings = [...parent.querySelectorAll('.fade-in:not(.visible)')];
    const idx      = siblings.indexOf(entry.target);

    setTimeout(() => {
      entry.target.classList.add('visible');
    }, Math.max(idx, 0) * 90);

    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// ----- DIAGNOSTIC FORM -----
const diagForm  = document.getElementById('diagForm');
const submitBtn = document.getElementById('submitBtn');

diagForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitBtn.textContent = '✓ Mensaje recibido — te contactamos en menos de 48 h';
  submitBtn.disabled    = true;
  submitBtn.style.background    = '#3ecfcb';
  submitBtn.style.borderColor   = '#3ecfcb';
  submitBtn.style.pointerEvents = 'none';
});
