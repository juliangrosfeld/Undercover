/* ============================================
   UnderCovers Curaçao — script.js
   ============================================ */

/* --- Sticky nav --- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* --- Mobile hamburger --- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* --- Hero background video: subtle zoom on load + autoplay resilience --- */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  window.addEventListener('load', () => {
    setTimeout(() => heroVideo.classList.add('loaded'), 50);
  });

  // Mobile browsers only honour autoplay when muted + playsinline, and some
  // still refuse until the element is explicitly played. Retry quietly at
  // each point the element becomes more ready. There is deliberately no
  // play button: if iOS blocks autoplay (Low Power Mode, some cellular
  // cases) the element simply holds its own first frame.
  const playHero = () => {
    heroVideo.muted = true;               // an unmuted video is refused outright
    const p = heroVideo.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };
  playHero();
  ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(ev =>
    heroVideo.addEventListener(ev, playHero)
  );
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) playHero();
  });

  // Last resort, entirely invisible: if playback was blocked, the first
  // gesture anywhere on the page starts it. No UI, nothing to tap on the
  // video itself.
  const kick = () => {
    if (heroVideo.paused) playHero();
    if (!heroVideo.paused) {
      ['touchstart', 'pointerdown', 'scroll'].forEach(ev =>
        window.removeEventListener(ev, kick)
      );
    }
  };
  ['touchstart', 'pointerdown', 'scroll'].forEach(ev =>
    window.addEventListener(ev, kick, { passive: true })
  );
}

/* --- Scroll fade-in animations --- */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

/* --- FAQ accordion --- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

    // Open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

/* --- Gallery lightbox --- */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = item.querySelector('img').alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  // Small delay before clearing src so close animation isn't jarring
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

/* --- Smooth scroll for anchor links (iOS Safari fallback) --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
