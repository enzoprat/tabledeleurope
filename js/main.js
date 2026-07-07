/* =====================================================================
   LA TABLE DE L'EUROPE — interactions
   Vanilla JS, sans dépendance. Animations GPU-friendly (transform/opacity).
   ===================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Année du footer ---------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Split des mots pour le statement ---------- */
  document.querySelectorAll('[data-reveal-words]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w, i) => `<span class="rw" style="transition-delay:${i * 0.045}s">${w}</span>`)
      .join(' ');
  });

  /* ---------- IntersectionObserver : reveals ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  document
    .querySelectorAll('[data-reveal], .statement__line')
    .forEach((el) => io.observe(el));

  // le statement (mots) est un conteneur parent
  document.querySelectorAll('.statement__line').forEach((el) => io.observe(el));

  /* ---------- Hero : lancer l'animation d'entrée ---------- */
  const hero = document.getElementById('hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('is-in'));

  /* ---------- Nav : changement de fond au scroll ---------- */
  const nav = document.getElementById('nav');
  const progress = document.querySelector('.scroll-progress');
  const mobileBar = document.querySelector('.mobile-bar');
  let heroH = window.innerHeight * 0.75;

  function onScroll() {
    const sc = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', sc > heroH * 0.5);
    if (mobileBar) mobileBar.classList.toggle('is-visible', sc > heroH * 0.6);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (sc / h) * 100 + '%';
    }
  }

  /* ---------- Parallax léger (transform, dans rAF) ---------- */
  const parallaxEls = reduce
    ? []
    : Array.from(document.querySelectorAll('[data-parallax]'));

  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  }

  function onScrollRAF() {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScrollRAF, { passive: true });
  window.addEventListener('resize', () => {
    heroH = window.innerHeight * 0.75;
    updateParallax();
  });
  onScroll();
  updateParallax();

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () =>
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu()
    );
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', closeMenu)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Burger : morph en croix ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .nav__burger.is-open span{ background:#EBD9BE; }
    .nav__burger.is-open span:first-child{ transform:translateY(3.75px) rotate(45deg); width:26px; }
    .nav__burger.is-open span:last-child{ transform:translateY(-3.75px) rotate(-45deg); width:26px; }
  `;
  document.head.appendChild(style);

  /* ---------- Curseur personnalisé (desktop) ---------- */
  if (supportsHover && !reduce) {
    const dot = document.querySelector('.cursor-dot');
    if (dot) {
      let dx = 0, dy = 0, cx = 0, cy = 0;
      window.addEventListener('mousemove', (e) => {
        dx = e.clientX;
        dy = e.clientY;
      });
      (function loop() {
        cx += (dx - cx) * 0.18;
        cy += (dy - cy) * 0.18;
        dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
      })();

      document
        .querySelectorAll('a, button, .btn, .link-underline')
        .forEach((el) => {
          el.addEventListener('mouseenter', () => {
            dot.style.width = '34px';
            dot.style.height = '34px';
            dot.style.background = 'rgba(169,130,91,.35)';
          });
          el.addEventListener('mouseleave', () => {
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.background = 'var(--laiton)';
          });
        });
    }
  }

  /* ---------- Ancres : fermer le menu + offset nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
