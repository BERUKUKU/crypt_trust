'use strict';

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

/* ── Scroll fade-in ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '-40px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ── Header shadow on scroll ── */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (header) header.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(30,58,95,0.12)' : 'none';
}, { passive: true });

/* ── Smooth liquid background blobs ── */
(function() {
  const MIN_SPEED = 0.12;
  const MAX_SPEED = 0.28;
  const blobEls = document.querySelectorAll('.liquid-blob');
  if (!blobEls.length) return;

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Blob {
    constructor(el) {
      this.el = el;
      this.size = this.el.getBoundingClientRect().width;
      this.seed();
    }

    seed() {
      this.initialX = randomNumber(0, window.innerWidth - this.size);
      this.initialY = randomNumber(0, window.innerHeight - this.size);
      this.el.style.top = `${this.initialY}px`;
      this.el.style.left = `${this.initialX}px`;
      this.x = this.initialX;
      this.y = this.initialY;
      this.vx = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1);
      this.vy = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x >= window.innerWidth - this.size) {
        this.x = window.innerWidth - this.size;
        this.vx *= -1;
      }
      if (this.y >= window.innerHeight - this.size) {
        this.y = window.innerHeight - this.size;
        this.vy *= -1;
      }
      if (this.x <= 0) {
        this.x = 0;
        this.vx *= -1;
      }
      if (this.y <= 0) {
        this.y = 0;
        this.vy *= -1;
      }
    }

    move() {
      this.el.style.transform = `translate(${this.x - this.initialX}px, ${this.y - this.initialY}px)`;
    }
  }

  const blobs = Array.from(blobEls).map((blobEl) => new Blob(blobEl));

  function onResize() {
    blobs.forEach((blob) => {
      blob.size = blob.el.getBoundingClientRect().width;
      blob.seed();
    });
  }

  function tick() {
    blobs.forEach((blob) => {
      blob.update();
      blob.move();
    });
    window.requestAnimationFrame(tick);
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.requestAnimationFrame(tick);
})();

/* ── Desktop card deck cycling ── */
(function() {
  const TOTAL = 8;
  const INTERVAL = 2000;
  const GLOW_COLORS = [
    'rgba(247,147,26,0.35)',   // BTC orange
    'rgba(98,126,234,0.35)',   // ETH blue
    'rgba(20,241,149,0.3)',    // SOL green
    'rgba(255,255,255,0.2)',   // XRP white
    'rgba(39,117,202,0.35)',   // USDC blue
    'rgba(38,161,123,0.35)',   // USDT teal
    'rgba(217,70,239,0.35)',   // HYPE purple
    'rgba(168,184,201,0.3)',   // Trust silver
  ];

  const RING_OUTER = [
    'rgba(247,147,26,0.55)',
    'rgba(98,126,234,0.55)',
    'rgba(20,241,149,0.5)',
    'rgba(255,255,255,0.4)',
    'rgba(39,117,202,0.55)',
    'rgba(38,161,123,0.55)',
    'rgba(217,70,239,0.55)',
    'rgba(168,184,201,0.45)',
  ];

  const RING_INNER = [
    'rgba(247,147,26,0.34)',
    'rgba(98,126,234,0.36)',
    'rgba(20,241,149,0.3)',
    'rgba(255,255,255,0.28)',
    'rgba(39,117,202,0.34)',
    'rgba(38,161,123,0.34)',
    'rgba(217,70,239,0.34)',
    'rgba(168,184,201,0.3)',
  ];

  const RING_GLOW = [
    'rgba(247,147,26,0.4)',
    'rgba(98,126,234,0.4)',
    'rgba(20,241,149,0.36)',
    'rgba(255,255,255,0.32)',
    'rgba(39,117,202,0.4)',
    'rgba(38,161,123,0.4)',
    'rgba(217,70,239,0.4)',
    'rgba(168,184,201,0.34)',
  ];

  const cards = document.querySelectorAll('.deck-card');
  const glow  = document.querySelector('.card-glow');
  const heroRight = document.querySelector('.hero-right');
  if (!cards.length) return;

  let current = 0;

  function getState(index) {
    const total = TOTAL;
    const diff = ((index - current) % total + total) % total;
    // diff: 0=current, 1=next, total-1=prev, else hidden
    if (diff === 0)         return 'state-current';
    if (diff === 1)         return 'state-next';
    if (diff === total - 1) return 'state-prev';
    if (diff <= total / 2)  return 'state-hidden-bot';
    return 'state-hidden-top';
  }

  function applyStates() {
    cards.forEach((card, i) => {
      card.classList.remove('state-current','state-prev','state-next','state-hidden-top','state-hidden-bot');
      card.classList.add(getState(i));
    });
    if (glow) glow.style.background = GLOW_COLORS[current];
    if (heroRight) {
      heroRight.style.setProperty('--ring-outer', RING_OUTER[current]);
      heroRight.style.setProperty('--ring-inner', RING_INNER[current]);
      heroRight.style.setProperty('--ring-glow', RING_GLOW[current]);
    }
  }

  // init immediately
  applyStates();

  setInterval(() => {
    current = (current + 1) % TOTAL;
    applyStates();
  }, INTERVAL);
})();
