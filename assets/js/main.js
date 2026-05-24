'use strict';

/* ============================================================
   Custom Cursor (desktop / non-touch only)
   ============================================================ */
(function initCursor() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (isTouch || !dot || !ring) {
    if (dot)  dot.remove();
    if (ring) ring.remove();
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ============================================================
   Navbar — scroll state + mobile toggle + active section
   ============================================================ */
(function initNavbar() {
  const navbar   = document.querySelector('.navbar');
  const toggle   = document.querySelector('.navbar__toggle');
  const navMenu  = document.querySelector('.navbar__links');
  const navLinks = document.querySelectorAll('.navbar__links a[data-section]');

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

  const sections = document.querySelectorAll('section[id]');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
      }
    });
  }, { rootMargin: '-64px 0px -55% 0px' });

  sections.forEach(s => secObs.observe(s));
})();

/* ============================================================
   Page Flash on Anchor Nav Click
   ============================================================ */
(function initPageFlash() {
  const flash = document.getElementById('page-flash');
  if (!flash) return;

  document.querySelectorAll('.navbar__links a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      flash.style.transition = 'transform 0.125s ease';
      flash.style.transformOrigin = 'left';
      flash.style.transform = 'scaleX(1)';
      setTimeout(() => {
        flash.style.transformOrigin = 'right';
        flash.style.transform = 'scaleX(0)';
      }, 125);
    });
  });
})();

/* ============================================================
   Hero Video — 3-minute pause loop
   ============================================================ */
(function initHeroVideo() {
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;

  const PAUSE_MS  = 180000; // 3 minutes
  const FADE_MS   = 1000;

  video.addEventListener('ended', () => {
    video.style.transition = 'opacity ' + (FADE_MS / 1000) + 's ease';
    video.style.opacity = '0';

    setTimeout(() => {
      video.currentTime = 0;
      video.play().catch(() => {});
      video.style.opacity = '1';
    }, PAUSE_MS);
  });
})();

/* ============================================================
   Hero Canvas — Particle System
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

  const COUNT = 70;
  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    vx:    (Math.random() - 0.5) * 0.15,
    vy:    -(Math.random() * 0.3 + 0.1),
    size:  Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.4 + 0.05,
  }));

  let mx = -9999, my = -9999;
  const hero = document.getElementById('hero');

  hero.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 90 && dist > 0) {
        const force = (90 - dist) / 90 * 0.5;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.vx *= 0.96;
      p.vy  = p.vy * 0.96 - 0.08;
      p.x  += p.vx;
      p.y  += p.vy;

      if (p.y < -4) {
        p.y = canvas.height + 4;
        p.x = Math.random() * canvas.width;
        p.vx = (Math.random() - 0.5) * 0.15;
        p.vy = -(Math.random() * 0.3 + 0.1);
      }
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,32,32,${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   Hero Role Cycling — type / delete loop
   ============================================================ */
(function initRoleCycling() {
  const el = document.getElementById('role-text');
  if (!el) return;

  const ROLES = [
    'Embedded Systems Engineer',
    'Cybersecurity Researcher',
    'AI / ML Developer',
    'IoT Security Specialist',
    'Robotics & Automation Lead',
  ];

  const TYPE_MS            = 55;
  const DELETE_MS          = 30;
  const PAUSE_AFTER_TYPE   = 1800;
  const PAUSE_AFTER_DELETE = 400;

  let roleIdx = 0;

  function typeRole(text, onDone) {
    let i = 0;
    function step() {
      if (i < text.length) {
        el.textContent = text.slice(0, ++i);
        setTimeout(step, TYPE_MS);
      } else {
        setTimeout(onDone, PAUSE_AFTER_TYPE);
      }
    }
    step();
  }

  function deleteRole(onDone) {
    function step() {
      if (el.textContent.length > 0) {
        el.textContent = el.textContent.slice(0, -1);
        setTimeout(step, DELETE_MS);
      } else {
        setTimeout(onDone, PAUSE_AFTER_DELETE);
      }
    }
    step();
  }

  function cycle() {
    typeRole(ROLES[roleIdx], () => {
      deleteRole(() => {
        roleIdx = (roleIdx + 1) % ROLES.length;
        cycle();
      });
    });
  }

  setTimeout(cycle, 1200);
})();

/* ============================================================
   Hero Typing Animation (terminal line)
   ============================================================ */
(function initTyping() {
  const pre    = document.getElementById('terminal-pre');
  const active = document.getElementById('terminal-active');
  if (!pre || !active) return;

  const PRE_TEXT    = '> whoami --stack embedded,ai,security --status ';
  const ACTIVE_TEXT = 'active';

  setTimeout(() => {
    let i = 0;
    function typePre() {
      if (i < PRE_TEXT.length) {
        pre.textContent += PRE_TEXT[i++];
        setTimeout(typePre, 38);
      } else {
        let j = 0;
        function typeActive() {
          if (j < ACTIVE_TEXT.length) {
            active.textContent += ACTIVE_TEXT[j++];
            setTimeout(typeActive, 38);
          }
        }
        typeActive();
      }
    }
    typePre();
  }, 900);
})();

/* ============================================================
   Subtitle Scramble on Hover
   ============================================================ */
(function initScramble() {
  const el = document.querySelector('.hero__subtitle');
  if (!el) return;

  const CHARS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?';
  const original = el.textContent;
  let running    = false;
  let cancelled  = false;

  el.addEventListener('mouseenter', () => {
    if (running) return;
    running   = true;
    cancelled = false;

    const chars  = original.split('');
    const result = chars.slice();

    chars.forEach((ch, i) => {
      if (ch === ' ' || ch === '—') return;

      let cycles = 0;
      const startDelay = i * 40;

      function scrambleChar() {
        if (cancelled) {
          result[i] = original[i];
          el.textContent = result.join('');
          return;
        }
        if (cycles < 6) {
          result[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
          el.textContent = result.join('');
          cycles++;
          setTimeout(scrambleChar, 40);
        } else {
          result[i] = original[i];
          el.textContent = result.join('');
          if (result.join('') === original) running = false;
        }
      }

      setTimeout(scrambleChar, startDelay);
    });
  });

  el.addEventListener('mouseleave', () => {
    cancelled = true;
    el.textContent = original;
    running = false;
  });
})();

/* ============================================================
   Swap Media — cycling images on .swap-media containers
   ============================================================ */
(function initSwapMedia() {
  document.querySelectorAll('.swap-media[data-interval]').forEach(container => {
    const imgs = Array.from(container.querySelectorAll('.swap-img'));
    if (imgs.length < 2) return;

    const interval = parseInt(container.dataset.interval, 10) || 3000;
    let current = imgs.findIndex(img => img.classList.contains('active'));
    if (current < 0) current = 0;

    setInterval(() => {
      imgs[current].classList.remove('active');
      current = (current + 1) % imgs.length;
      imgs[current].classList.add('active');
    }, interval);
  });
})();

/* ============================================================
   Heading Text Reveal (overflow:hidden clip up)
   ============================================================ */
(function initHeadingReveal() {
  document.querySelectorAll('.section-eyebrow, .section-heading').forEach(el => {
    const inner = document.createElement('span');
    inner.className = 'reveal-inner';
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(inner);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const inner = entry.target.querySelector('.reveal-inner');
      if (inner) inner.classList.add('revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-eyebrow, .section-heading').forEach(el => obs.observe(el));
})();

/* ============================================================
   Scroll Reveal — section children stagger
   ============================================================ */
(function initReveal() {
  const SELECTORS = [
    '#about .about__text > p',
    '#about .about__stats',
    '#about .photo-frame',
    '#education .edu-card',
    '#experience .exp-card',
    '#awards .award-card',
    '#contact .contact__heading',
    '#contact .contact__links',
    '#projects .filter-bar',
  ];

  const allEls = document.querySelectorAll(SELECTORS.join(','));

  const sections = new Map();
  allEls.forEach(el => {
    const sec = el.closest('section');
    if (!sections.has(sec)) sections.set(sec, []);
    sections.get(sec).push(el);
  });

  sections.forEach(els => {
    els.forEach((el, i) => {
      el.classList.add('reveal-up');
      el.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  allEls.forEach(el => obs.observe(el));

  // Project cards — individual stagger
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      cardObs.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.classList.add('reveal-up');
    card.style.transitionDelay = (i % 2 * 80) + 'ms';
    cardObs.observe(card);
  });
})();

/* ============================================================
   Skill Tags — left-to-right cascade stagger
   ============================================================ */
(function initSkillStagger() {
  const section = document.getElementById('skills');
  if (!section) return;
  const tags = Array.from(section.querySelectorAll('.skill-tag'));

  tags.forEach(t => {
    t.classList.add('reveal-up');
    t.style.transitionDelay = '9999s'; // hide until section enters
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      tags.forEach((t, i) => {
        t.style.transitionDelay = (i * 18) + 'ms';
        t.classList.add('visible');
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  obs.observe(section);
})();

/* ============================================================
   Project Filter
   ============================================================ */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          const tags = (card.dataset.tags || '').split(',');
          card.classList.toggle('hidden', !tags.includes(filter));
        }
      });
    });
  });
})();

/* ============================================================
   Project Card — 3D Media Tilt
   ============================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card:not(.project-card--pub)').forEach(card => {
    const media = card.querySelector('.project-card__media');
    if (!media) return;

    let tRx = 0, tRy = 0, cRx = 0, cRy = 0;
    let raf = null, hovered = false;

    function lerp() {
      cRx += (tRx - cRx) * 0.12;
      cRy += (tRy - cRy) * 0.12;
      media.style.transform = `perspective(600px) rotateX(${cRx}deg) rotateY(${cRy}deg)`;

      const done = Math.abs(tRx - cRx) < 0.01 && Math.abs(tRy - cRy) < 0.01;
      if (!done) {
        raf = requestAnimationFrame(lerp);
      } else if (!hovered) {
        media.style.transform = '';
      }
    }

    card.addEventListener('mousemove', e => {
      hovered = true;
      media.style.transition = 'none';
      const r  = card.getBoundingClientRect();
      const cx = r.width / 2, cy = r.height / 2;
      tRx = ((e.clientY - r.top  - cy) / cy) * -6;
      tRy = ((e.clientX - r.left - cx) / cx) *  6;
      cancelAnimationFrame(raf);
      lerp();
    });

    card.addEventListener('mouseleave', () => {
      hovered = false;
      media.style.transition = 'transform 0.4s ease';
      tRx = 0; tRy = 0;
      cancelAnimationFrame(raf);
      lerp();
    });
  });
})();

/* ============================================================
   Project Card — Description "Read more"
   ============================================================ */
(function initReadMore() {
  document.querySelectorAll('.project-card:not(.project-card--pub)').forEach(card => {
    const desc = card.querySelector('.project-card__desc');
    if (!desc) return;

    requestAnimationFrame(() => {
      if (desc.scrollHeight <= desc.clientHeight + 2) return;

      const btn = document.createElement('button');
      btn.className = 'readmore-btn';
      btn.textContent = 'Read more';
      btn.setAttribute('aria-expanded', 'false');
      desc.insertAdjacentElement('afterend', btn);

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const expanded = desc.classList.toggle('expanded');
        btn.textContent = expanded ? 'Read less' : 'Read more';
        btn.setAttribute('aria-expanded', String(expanded));
      });
    });
  });
})();

/* ============================================================
   Project Card — Click to Expand Case Study Panel
   ============================================================ */
(function initCardExpand() {
  let openPanel = null;

  document.querySelectorAll('.project-card:not(.project-card--pub)').forEach(card => {
    const mediaEl = card.querySelector('.project-card__media');
    const descEl  = card.querySelector('.project-card__desc');
    const actEl   = card.querySelector('.project-card__actions');

    const panel = document.createElement('div');
    panel.className = 'card-expand';

    if (mediaEl) {
      const m = document.createElement('div');
      m.className = 'card-expand__media';
      m.innerHTML = mediaEl.innerHTML;
      panel.appendChild(m);
    }

    if (descEl) {
      const d = document.createElement('p');
      d.className = 'card-expand__desc';
      d.textContent = descEl.textContent;
      panel.appendChild(d);
    }

    if (actEl && actEl.innerHTML.trim()) {
      const a = document.createElement('div');
      a.className = 'card-expand__actions';
      a.innerHTML = actEl.innerHTML;
      panel.appendChild(a);
    }

    card.appendChild(panel);

    card.addEventListener('click', e => {
      if (e.target.closest('a') || e.target.closest('.readmore-btn')) return;

      const isOpen = panel.classList.contains('open');

      if (openPanel && openPanel !== panel) {
        openPanel.classList.remove('open');
      }

      panel.classList.toggle('open', !isOpen);
      openPanel = !isOpen ? panel : null;
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openPanel) {
      openPanel.classList.remove('open');
      openPanel = null;
    }
  });
})();
