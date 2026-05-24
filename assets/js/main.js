/* ============================================================
   Navbar — scroll opacity + mobile toggle
   ============================================================ */
const navbar  = document.querySelector('.navbar');
const toggle  = document.querySelector('.navbar__toggle');
const navMenu = document.querySelector('.navbar__links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

toggle.addEventListener('click', () => {
  const open = toggle.classList.toggle('open');
  navMenu.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('open');
    navMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
   Active section highlighting
   ============================================================ */
const navLinks = document.querySelectorAll('.navbar__links a[data-section]');
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  },
  {
    rootMargin: `-${parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--navbar-h')) || 64}px 0px -55% 0px`,
    threshold: 0,
  }
);

sections.forEach(section => sectionObserver.observe(section));

/* ============================================================
   Project filtering
   ============================================================ */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all') {
        card.classList.remove('hidden');
      } else {
        const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
        card.classList.toggle('hidden', !tags.includes(filter));
      }
    });
  });
});

/* ============================================================
   Custom cursor (desktop / non-touch only)
   ============================================================ */
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const cursorEl = document.getElementById('cursor');

if (!isTouch) {
  document.documentElement.classList.add('custom-cursor');

  let curX = 0, curY = 0;
  let tgtX = 0, tgtY = 0;

  document.addEventListener('mousemove', e => {
    tgtX = e.clientX;
    tgtY = e.clientY;
  });

  (function animateCursor() {
    curX += (tgtX - curX) * 0.15;
    curY += (tgtY - curY) * 0.15;
    cursorEl.style.left = curX + 'px';
    cursorEl.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('expanded'));
  });
} else {
  if (cursorEl) cursorEl.remove();
}

/* ============================================================
   Hero canvas — particle system
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = 80;
  const particles = [];

  function makeParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:   (Math.random() - 0.5) * 0.25,
      size: Math.random() + 1,
    };
  }

  for (let i = 0; i < COUNT; i++) particles.push(makeParticle());

  let mx = -999, my = -999;
  const hero = document.getElementById('hero');

  hero.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => { mx = -999; my = -999; });

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120 * 0.4;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x  += p.vx;
      p.y  += p.vy;

      if (p.x < 0)             p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0)             p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.30)';
      ctx.fill();
    }

    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   Hero name — character drop-in animation
   ============================================================ */
(function initCharDrop() {
  const nameEl = document.getElementById('hero-name');
  if (!nameEl) return;

  let idx = 0;

  function wrapChars(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        const span = document.createElement('span');
        span.className = 'char-drop';
        span.style.animationDelay = (idx++ * 30) + 'ms';
        span.textContent = ch === ' ' ? ' ' : ch;
        frag.appendChild(span);
      }
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrapChars);
    }
  }

  Array.from(nameEl.childNodes).forEach(wrapChars);
})();

/* ============================================================
   Scroll-entry animations (IntersectionObserver)
   ============================================================ */
(function initScrollAnimations() {
  const fadeTargets = [
    ...document.querySelectorAll('.section-label'),
    ...document.querySelectorAll('.section-title'),
    ...document.querySelectorAll('.about__text'),
    ...document.querySelectorAll('.about__photo'),
    ...document.querySelectorAll('.filter-bar'),
    ...document.querySelectorAll('.blog-card'),
    ...document.querySelectorAll('.contact__inner'),
  ];

  fadeTargets.forEach(el => el.classList.add('anim-fade-up'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  fadeTargets.forEach((el, i) => {
    el.style.transitionDelay = (i % 4 * 80) + 'ms';
    observer.observe(el);
  });

  /* Project cards — individual stagger */
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.classList.add('anim-fade-up');
    card.style.transitionDelay = (i % 3 * 80) + 'ms';
    cardObserver.observe(card);
  });

  /* Skill tags — left-to-right cascade, 20ms per tag */
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const tags = skillsSection.querySelectorAll('.skill-tag');
    tags.forEach(tag => tag.classList.add('anim-fade-up'));

    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tags.forEach((tag, i) => {
          tag.style.transitionDelay = (i * 20) + 'ms';
          tag.classList.add('visible');
        });
        skillObserver.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    skillObserver.observe(skillsSection);
  }
})();

/* ============================================================
   Project card — 3D media tilt (cards with class "has-3d")
   ============================================================ */
(function init3DTilt() {
  document.querySelectorAll('.project-card.has-3d').forEach(card => {
    const media = card.querySelector('.project-card__media');
    if (!media) return;

    let tRx = 0, tRy = 0, cRx = 0, cRy = 0;
    let raf = null;

    function lerp() {
      cRx += (tRx - cRx) * 0.12;
      cRy += (tRy - cRy) * 0.12;
      media.style.transform =
        `perspective(600px) rotateX(${cRx}deg) rotateY(${cRy}deg)`;
      if (Math.abs(tRx - cRx) > 0.01 || Math.abs(tRy - cRy) > 0.01) {
        raf = requestAnimationFrame(lerp);
      }
    }

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.width / 2, cy = r.height / 2;
      tRx = ((e.clientY - r.top  - cy) / cy) * -8;
      tRy = ((e.clientX - r.left - cx) / cx) *  8;
      cancelAnimationFrame(raf);
      lerp();
    });

    card.addEventListener('mouseleave', () => {
      tRx = 0; tRy = 0;
      cancelAnimationFrame(raf);
      lerp();
    });
  });
})();

/* ============================================================
   Project card — "Read more" description toggle
   ============================================================ */
(function initReadMore() {
  document.querySelectorAll('.project-card__readmore').forEach(btn => {
    const desc = btn.previousElementSibling;
    if (!desc) return;

    if (desc.scrollHeight <= desc.clientHeight + 4) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', () => {
      const expanded = desc.classList.toggle('expanded');
      btn.textContent = expanded ? 'Read less' : 'Read more';
      btn.setAttribute('aria-expanded', expanded);
    });
  });
})();
