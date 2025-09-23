/* ========= NAV: sticky resize + active section + progress ========= */
(function () {
  const nav = document.getElementById('topNav');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const progressBar = document.getElementById('navProgress');
  const sections = Array.from(document.querySelectorAll('header, section'));
  const SMALL_NAV_THRESHOLD = 60;

  // Smooth scroll offset (to compensate for fixed nav)
  function scrollToSection(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const navHeight = nav.getBoundingClientRect().height;
    const targetY = el.offsetTop - navHeight - 8;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  // click handlers for nav links
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const dest = this.dataset.target;
      scrollToSection(dest);
    });
  });

  // hero CTA
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.scrollTo));
  });

  // compute active link: Section directly below bottom margin of navbar
  function updateActiveLinkAndProgress() {
    const navBottom = nav.getBoundingClientRect().bottom;
    let activeSectionId = null;

    // If at very bottom, force last nav active
    if ((window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 3)) {
      activeSectionId = sections[sections.length - 1].id || 'contact';
    } else {
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        // If the area directly below navbar is inside this section
        if (r.top <= navBottom && r.bottom > navBottom) {
          activeSectionId = s.id;
          break;
        }
      }
    }

    links.forEach(l => {
      if (l.dataset.target === activeSectionId) l.classList.add('is-active');
      else l.classList.remove('is-active');
    });

    // Progress bar (reading progress)
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = Math.max(0, Math.min(100, pct)) + '%';

    // navbar resize class
    if (window.scrollY > SMALL_NAV_THRESHOLD) nav.classList.add('nav--small');
    else nav.classList.remove('nav--small');
  }

  window.addEventListener('scroll', updateActiveLinkAndProgress, { passive: true });
  window.addEventListener('resize', updateActiveLinkAndProgress);

  // initial
  updateActiveLinkAndProgress();
})();

/* ========= CAROUSEL ========= */
(function () {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const dotsContainer = document.getElementById('carouselDots');

  let index = 0;
  let slideWidth = carousel.querySelector('.carousel-viewport').getBoundingClientRect().width;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 5000;

  // set widths for slides
  function setWidths() {
    slideWidth = carousel.querySelector('.carousel-viewport').getBoundingClientRect().width;
    slides.forEach(s => s.style.minWidth = slideWidth + 'px');
    moveTo(index);
  }

  function moveTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
    updateDots();
  }

  prev.addEventListener('click', () => { moveTo(index - 1); resetAutoplay(); });
  next.addEventListener('click', () => { moveTo(index + 1); resetAutoplay(); });

  // Dots
  function createDots() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => { moveTo(i); resetAutoplay(); });
      dotsContainer.appendChild(btn);
    });
    updateDots();
  }

  function updateDots() {
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => moveTo(index + 1), AUTOPLAY_MS);
  }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function resetAutoplay() { startAutoplay(); }

  // pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  window.addEventListener('resize', setWidths);

  // init
  setWidths();
  createDots();
  startAutoplay();
})();

/* ========= MODALS ========= */
(function () {
  const openBtns = document.querySelectorAll('.open-modal');
  const modals = document.querySelectorAll('.modal');
  const closeBtns = document.querySelectorAll('.modal-close');

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
  }

  openBtns.forEach(b => b.addEventListener('click', () => openModal(b.dataset.modal)));
  closeBtns.forEach(b => b.addEventListener('click', e => closeModal(e.target.closest('.modal'))));
  modals.forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m); }));

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modals.forEach(m => closeModal(m));
  });
})();

/* ========= CANVAS small decorative animation ========= */
(function () {
  const canvas = document.getElementById('artCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.clientWidth;
  let H = canvas.height = canvas.clientHeight;
  const dots = [];
  function initDots() {
    dots.length = 0;
    for (let i = 0; i < 16; i++) {
      dots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 2 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: 0.2 + Math.random() * 0.6
      });
    }
  }
  function resize() { W = canvas.width = canvas.clientWidth; H = canvas.height = canvas.clientHeight; initDots(); }
  function tick() {
    ctx.clearRect(0,0,W,H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(244,208,63,${d.alpha})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize(); tick();
})();

/* ========= small helpers ========= */
// set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();
