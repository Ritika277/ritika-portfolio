/* ==========================================================================
   Ritika Gupta — Portfolio Interactive Behavior (Vanilla JS)
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready');

  /* ------------------------------------------------------------------------
     1. Hero Profile Image Graceful Fallback
     ------------------------------------------------------------------------ */
  const heroProfileImg = document.getElementById('heroProfileImg');
  const portraitCard = document.getElementById('portraitCard');

  function activatePhotoFallback() {
    if (portraitCard) {
      portraitCard.classList.add('is-fallback');
    }
  }

  function clearPhotoFallback() {
    if (portraitCard) {
      portraitCard.classList.remove('is-fallback');
    }
  }

  if (heroProfileImg && portraitCard) {
    heroProfileImg.addEventListener('error', activatePhotoFallback);
    heroProfileImg.addEventListener('load', () => {
      if (heroProfileImg.naturalWidth > 0) {
        clearPhotoFallback();
      } else {
        activatePhotoFallback();
      }
    });

    if (heroProfileImg.complete && heroProfileImg.naturalWidth === 0) {
      activatePhotoFallback();
    }
  }

  /* ------------------------------------------------------------------------
     2. Sticky Navbar, GPU Scroll Progress Bar, Smooth Anchors & Back-to-Top
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTopBtn = document.getElementById('backToTopBtn');

  let maxScrollableY = 0;
  let lastScrolledNav = null;
  let lastVisibleTopBtn = null;
  let scrollRafPending = false;
  let isScrolling = false;
  let scrollIdleTimer = null;

  function refreshScrollMetrics() {
    maxScrollableY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function applyScrollUI() {
    scrollRafPending = false;
    const scrollY = window.scrollY || window.pageYOffset;

    const isScrolled = scrollY > 24;
    if (navbar && isScrolled !== lastScrolledNav) {
      lastScrolledNav = isScrolled;
      navbar.classList.toggle('scrolled', isScrolled);
    }

    const showBackTop = scrollY > 420;
    if (backToTopBtn && showBackTop !== lastVisibleTopBtn) {
      lastVisibleTopBtn = showBackTop;
      backToTopBtn.classList.toggle('is-visible', showBackTop);
    }

    if (scrollProgress) {
      const progress = maxScrollableY > 0 ? Math.min(1, Math.max(0, scrollY / maxScrollableY)) : 0;
      scrollProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
  }

  function onScroll() {
    isScrolling = true;
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(() => {
      isScrolling = false;
    }, 130);

    if (!scrollRafPending) {
      scrollRafPending = true;
      window.requestAnimationFrame(applyScrollUI);
    }
  }

  refreshScrollMetrics();
  applyScrollUI();
  window.addEventListener('load', refreshScrollMetrics, { passive: true });
  window.addEventListener('resize', refreshScrollMetrics, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth scrolling for explicit anchor clicks only (keeps wheel/touch native & instant)
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  anchorLinks.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const navOffset = navbar ? navbar.offsetHeight + 16 : 92;
      const top = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - navOffset);
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. Mobile Hamburger Menu
     ------------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  function setMenuOpen(isOpen) {
    if (!hamburgerBtn || !navMenu) return;
    hamburgerBtn.classList.toggle('is-active', isOpen);
    navMenu.classList.toggle('is-open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  }

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const nextState = !navMenu.classList.contains('is-open');
      setMenuOpen(nextState);
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (event) => {
      if (
        navMenu.classList.contains('is-open') &&
        !navMenu.contains(event.target) &&
        !hamburgerBtn.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenuOpen(false);
        hamburgerBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Active Navigation Link Highlighting on Scroll
     ------------------------------------------------------------------------ */
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if ('IntersectionObserver' in window && sections.length > 0 && navLinks.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isMatch = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('active', isMatch);
            if (isMatch) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------------
     5. Scroll Reveal Animations
     ------------------------------------------------------------------------ */
  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px -15px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     6. Hero Role Specialization Subtle Rotator
     ------------------------------------------------------------------------ */
  const roleDynamic = document.getElementById('roleDynamic');
  const roleSpecializations = [
    'Angular (14+) · RxJS · NgRx',
    'TypeScript · Reactive Forms',
    'ASP.NET Core · Node.js',
  ];

  if (roleDynamic && !prefersReducedMotion) {
    let roleIndex = 0;
    window.setInterval(() => {
      roleDynamic.classList.add('is-fading');
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roleSpecializations.length;
        roleDynamic.textContent = roleSpecializations[roleIndex];
        roleDynamic.classList.remove('is-fading');
      }, 280);
    }, 3400);
  }

  /* ------------------------------------------------------------------------
     7. Interactive Skills Category Filter
     ------------------------------------------------------------------------ */
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const skillCards = Array.from(document.querySelectorAll('.skill-card'));

  if (filterButtons.length > 0 && skillCards.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedCategory = button.dataset.filter;

        filterButtons.forEach((btn) => {
          const isSelected = btn === button;
          btn.classList.toggle('active', isSelected);
          btn.setAttribute('aria-pressed', String(isSelected));
        });

        skillCards.forEach((card) => {
          const cardCategory = card.dataset.category;
          const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory;
          card.classList.toggle('is-hidden', !shouldShow);
          card.classList.remove('is-filtering');
          if (shouldShow) {
            card.classList.add('is-visible');
            if (!prefersReducedMotion) {
              // Force reflow so switching tabs replays the entrance motion
              void card.offsetWidth;
              card.classList.add('is-filtering');
            }
          }
        });
        refreshScrollMetrics();
        applyScrollUI();
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. Toast Notification & Copy-to-Clipboard Helper
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('toast');
  let toastTimeout = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }

  const copyButtons = Array.from(document.querySelectorAll('.copy-btn'));
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      if (!value) return;

      try {
        await copyText(value);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        showToast(`Copied to clipboard: ${value}`);
        window.setTimeout(() => {
          btn.textContent = originalText;
        }, 1800);
      } catch {
        showToast('Could not copy automatically — please copy manually.');
      }
    });
  });

  /* ------------------------------------------------------------------------
     9. Contact Form Validation & Email Client Handoff
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const nameInput = document.getElementById('senderName');
    const emailInput = document.getElementById('senderEmail');
    const subjectInput = document.getElementById('messageSubject');
    const messageInput = document.getElementById('messageBody');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');
    const formFeedback = document.getElementById('formFeedback');

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearErrors() {
      [nameError, emailError, subjectError, messageError].forEach((el) => {
        if (el) el.textContent = '';
      });
      if (formFeedback) {
        formFeedback.textContent = '';
        formFeedback.className = 'form-feedback';
      }
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const subjectVal = subjectInput ? subjectInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      let isValid = true;

      if (nameVal.length < 2) {
        if (nameError) nameError.textContent = 'Please enter your name.';
        isValid = false;
      }

      if (!validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      if (subjectVal.length < 3) {
        if (subjectError) subjectError.textContent = 'Please add a subject.';
        isValid = false;
      }

      if (messageVal.length < 10) {
        if (messageError) messageError.textContent = 'Please enter a message (at least 10 characters).';
        isValid = false;
      }

      if (!isValid) return;

      const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subjectVal}`);
      const mailtoBody = encodeURIComponent(
        `Hi Ritika,\n\n${messageVal}\n\nBest regards,\n${nameVal}\n(${emailVal})`
      );

      if (formFeedback) {
        formFeedback.textContent =
          'Opening your default email app addressed to ritikagupta0827@gmail.com...';
        formFeedback.classList.add('is-success');
      }

      showToast('Launching email client...');
      window.location.href = `mailto:ritikagupta0827@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     10. Dynamic Footer Copyright Year
     ------------------------------------------------------------------------ */
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     11. Animated Stat Counters & Delegated Pointer Micro-FX
     ------------------------------------------------------------------------ */
  if (!prefersReducedMotion) {
    // Smoothly animate stat counters when .about-stats enters view
    const statNumbers = Array.from(document.querySelectorAll('.about-stats .stat-number'));
    const statsContainer = document.querySelector('.about-stats');

    function animateCounter(el) {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;

      const target = parseFloat(match[1]);
      const suffix = match[2] || '';
      const decimals = (match[1].split('.')[1] || '').length;
      const duration = 650;
      const startTime = performance.now();
      let completed = false;

      function finishCounter() {
        if (completed) return;
        completed = true;
        el.textContent = raw;
      }

      function tick(now) {
        if (completed) return;
        const elapsed = Math.max(0, now - startTime);
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = `${current.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          finishCounter();
        }
      }

      window.setTimeout(finishCounter, duration + 120);
      window.requestAnimationFrame(tick);
    }

    if (statsContainer && statNumbers.length > 0 && 'IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            statNumbers.forEach(animateCounter);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );
      statsObserver.observe(statsContainer);
    }

    // Delegated pointer spotlight glow on glass cards & throttled 3D tilt on hero portrait
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (isFinePointer) {
      const mainEl = document.getElementById('main-content');
      let cardMoveRaf = false;
      let pendingCardEvent = null;

      if (mainEl) {
        mainEl.addEventListener(
          'pointermove',
          (event) => {
            if (isScrolling) return;
            pendingCardEvent = event;
            if (cardMoveRaf) return;

            cardMoveRaf = true;
            window.requestAnimationFrame(() => {
              cardMoveRaf = false;
              const ev = pendingCardEvent;
              if (!ev) return;
              const card = ev.target && ev.target.closest ? ev.target.closest('.card') : null;
              if (!card) return;
              const rect = card.getBoundingClientRect();
              const x = ((ev.clientX - rect.left) / rect.width) * 100;
              const y = ((ev.clientY - rect.top) / rect.height) * 100;
              card.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
              card.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
            });
          },
          { passive: true }
        );
      }

      const portraitWrapper = document.querySelector('.portrait-wrapper');
      if (portraitWrapper) {
        let tiltRaf = false;
        let lastTiltEvent = null;

        portraitWrapper.addEventListener(
          'pointermove',
          (event) => {
            if (isScrolling) return;
            lastTiltEvent = event;
            if (tiltRaf) return;
            tiltRaf = true;
            window.requestAnimationFrame(() => {
              tiltRaf = false;
              const ev = lastTiltEvent;
              if (!ev) return;
              const rect = portraitWrapper.getBoundingClientRect();
              const relX = (ev.clientX - rect.left) / rect.width - 0.5;
              const relY = (ev.clientY - rect.top) / rect.height - 0.5;
              const rotateY = (relX * 7).toFixed(2);
              const rotateX = (-relY * 7).toFixed(2);
              portraitWrapper.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
          },
          { passive: true }
        );

        portraitWrapper.addEventListener('pointerleave', () => {
          portraitWrapper.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
      }
    }

    /* ----------------------------------------------------------------------
       12. Continuous Animated Particle Canvas & Interactive Cursor/Touch FX
       ---------------------------------------------------------------------- */
    const bgCanvas = document.getElementById('bgCanvas');
    const cursorSpotlight = document.getElementById('cursorSpotlight');
    const cursorRing = document.getElementById('cursorRing');
    const cursorDot = document.getElementById('cursorDot');
    const supportsHoverCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const pointer = {
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.35,
      spotX: window.innerWidth * 0.5,
      spotY: window.innerHeight * 0.35,
      ringX: window.innerWidth * 0.5,
      ringY: window.innerHeight * 0.35,
      dotX: window.innerWidth * 0.5,
      dotY: window.innerHeight * 0.35,
      lastTrailX: -999,
      lastTrailY: -999,
      spotDirty: true,
      ringDirty: true,
      active: false,
    };

    let touchFadeTimer = null;

    if (bgCanvas && bgCanvas.getContext) {
      const ctx = bgCanvas.getContext('2d', { alpha: true });
      let width = window.innerWidth;
      let height = window.innerHeight;
      let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let particles = [];
      const trailSparks = [];
      const tapRipples = [];
      let rafId = null;
      let scrollFrameSkip = false;

      // Pre-render one reusable spark glow sprite to avoid per-frame gradient allocations
      const sparkSprite = document.createElement('canvas');
      sparkSprite.width = 32;
      sparkSprite.height = 32;
      const sparkCtx = sparkSprite.getContext('2d');
      if (sparkCtx) {
        const grad = sparkCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(186, 230, 253, 0.92)');
        grad.addColorStop(0.45, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        sparkCtx.fillStyle = grad;
        sparkCtx.fillRect(0, 0, 32, 32);
      }

      function getTargetParticleCount() {
        return width < 768 ? 16 : 34;
      }

      function createParticle() {
        const palette = [
          'rgba(56, 189, 248, ',
          'rgba(96, 165, 250, ',
          'rgba(186, 230, 253, ',
        ];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.34,
          vy: (Math.random() - 0.5) * 0.34,
          radius: 1.1 + Math.random() * 1.6,
          alpha: 0.2 + Math.random() * 0.26,
          color: palette[Math.floor(Math.random() * palette.length)],
        };
      }

      function syncCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        bgCanvas.width = Math.floor(width * dpr);
        bgCanvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const desired = getTargetParticleCount();
        while (particles.length < desired) particles.push(createParticle());
        if (particles.length > desired) particles.length = desired;
        refreshScrollMetrics();
      }

      function spawnTrailSparks(x, y, count = 2) {
        if (trailSparks.length >= 28) {
          trailSparks.splice(0, count);
        }
        for (let i = 0; i < count; i += 1) {
          trailSparks.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.75,
            vy: (Math.random() - 0.5) * 0.75 - 0.15,
            size: 12 + Math.random() * 12,
            alpha: 0.65,
          });
        }
      }

      function spawnRipple(x, y) {
        if (tapRipples.length >= 6) tapRipples.shift();
        tapRipples.push({
          x,
          y,
          radius: 6,
          maxRadius: width < 768 ? 56 : 70,
          alpha: 0.45,
        });
      }

      function updatePointerVisuals() {
        const dxSpot = pointer.targetX - pointer.spotX;
        const dySpot = pointer.targetY - pointer.spotY;
        if (Math.abs(dxSpot) > 0.2 || Math.abs(dySpot) > 0.2 || pointer.spotDirty) {
          pointer.spotX += dxSpot * 0.14;
          pointer.spotY += dySpot * 0.14;
          pointer.spotDirty = Math.abs(dxSpot) > 0.5 || Math.abs(dySpot) > 0.5;

          if (cursorSpotlight) {
            cursorSpotlight.style.transform = `translate3d(${(pointer.spotX - 230).toFixed(1)}px, ${(pointer.spotY - 230).toFixed(1)}px, 0)`;
          }
        }

        if (supportsHoverCursor && cursorRing && cursorDot) {
          const dxDot = pointer.targetX - pointer.dotX;
          const dyDot = pointer.targetY - pointer.dotY;
          const dxRing = pointer.targetX - pointer.ringX;
          const dyRing = pointer.targetY - pointer.ringY;

          if (
            Math.abs(dxDot) > 0.15 ||
            Math.abs(dyDot) > 0.15 ||
            Math.abs(dxRing) > 0.15 ||
            Math.abs(dyRing) > 0.15 ||
            pointer.ringDirty
          ) {
            pointer.dotX += dxDot * 0.48;
            pointer.dotY += dyDot * 0.48;
            pointer.ringX += dxRing * 0.18;
            pointer.ringY += dyRing * 0.18;
            pointer.ringDirty = Math.abs(dxRing) > 0.4 || Math.abs(dyRing) > 0.4;

            cursorDot.style.transform = `translate3d(${pointer.dotX.toFixed(1)}px, ${pointer.dotY.toFixed(1)}px, 0)`;
            cursorRing.style.transform = `translate3d(${pointer.ringX.toFixed(1)}px, ${pointer.ringY.toFixed(1)}px, 0)`;
          }
        }
      }

      function renderFrame() {
        updatePointerVisuals();

        // Throttle canvas redraw to 30fps during active scrolling so scrolling stays 100% fluid
        if (isScrolling) {
          scrollFrameSkip = !scrollFrameSkip;
          if (scrollFrameSkip) {
            rafId = window.requestAnimationFrame(renderFrame);
            return;
          }
        }

        ctx.clearRect(0, 0, width, height);

        const maxLinkDist = width < 768 ? 96 : 132;
        const maxLinkDistSq = maxLinkDist * maxLinkDist;
        const pointerRadius = width < 768 ? 115 : 150;
        const pointerRadiusSq = pointerRadius * pointerRadius;
        const len = particles.length;

        // Update particles
        for (let i = 0; i < len; i += 1) {
          const p = particles[i];

          if (pointer.active) {
            const dx = p.x - pointer.targetX;
            const dy = p.y - pointer.targetY;
            const distSq = dx * dx + dy * dy;
            if (distSq > 4 && distSq < pointerRadiusSq) {
              const dist = Math.sqrt(distSq);
              const force = ((pointerRadius - dist) / pointerRadius) * 0.04;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          p.vx *= 0.992;
          p.vy *= 0.992;
          if (Math.abs(p.vx) < 0.08) p.vx += (Math.random() - 0.5) * 0.03;
          if (Math.abs(p.vy) < 0.08) p.vy += (Math.random() - 0.5) * 0.03;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.fill();
        }

        // Batch all particle-to-particle connection lines into a single stroke call
        if (!isScrolling) {
          ctx.beginPath();
          for (let i = 0; i < len; i += 1) {
            const p = particles[i];
            for (let j = i + 1; j < len; j += 1) {
              const q = particles[j];
              const dx = p.x - q.x;
              const dy = p.y - q.y;
              if (dx * dx + dy * dy < maxLinkDistSq) {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
              }
            }
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.085)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          if (pointer.active) {
            ctx.beginPath();
            for (let i = 0; i < len; i += 1) {
              const p = particles[i];
              const dx = p.x - pointer.targetX;
              const dy = p.y - pointer.targetY;
              if (dx * dx + dy * dy < pointerRadiusSq) {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(pointer.targetX, pointer.targetY);
              }
            }
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.16)';
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw glowing cursor / touch trail sparks via pre-rendered sprite
        if (trailSparks.length > 0) {
          for (let i = trailSparks.length - 1; i >= 0; i -= 1) {
            const s = trailSparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= 0.026;
            s.size *= 0.985;

            if (s.alpha <= 0.02) {
              trailSparks.splice(i, 1);
              continue;
            }

            ctx.globalAlpha = s.alpha;
            ctx.drawImage(sparkSprite, s.x - s.size * 0.5, s.y - s.size * 0.5, s.size, s.size);
          }
          ctx.globalAlpha = 1;
        }

        // Draw click / touch ripples
        for (let i = tapRipples.length - 1; i >= 0; i -= 1) {
          const r = tapRipples[i];
          r.radius += 2.2;
          r.alpha -= 0.022;
          if (r.alpha <= 0.02 || r.radius >= r.maxRadius) {
            tapRipples.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha.toFixed(2)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        rafId = window.requestAnimationFrame(renderFrame);
      }

      function startLoop() {
        if (rafId === null && !document.hidden) {
          rafId = window.requestAnimationFrame(renderFrame);
        }
      }

      function stopLoop() {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      syncCanvasSize();
      startLoop();

      let resizeTimer = null;
      window.addEventListener(
        'resize',
        () => {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(syncCanvasSize, 150);
        },
        { passive: true }
      );

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopLoop();
        } else {
          startLoop();
        }
      });

      // Mouse pointer interactions (Desktop)
      if (supportsHoverCursor) {
        const interactiveSelector = 'a, button, input, textarea, .skill-badge, .filter-btn, .card';

        window.addEventListener(
          'pointermove',
          (event) => {
            if (event.pointerType === 'touch') return;
            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
            pointer.spotDirty = true;
            pointer.ringDirty = true;
            pointer.active = true;

            if (cursorSpotlight) cursorSpotlight.classList.add('is-active');
            if (cursorRing) cursorRing.classList.add('is-visible');
            if (cursorDot) cursorDot.classList.add('is-visible');

            if (!isScrolling) {
              const moveDist = Math.hypot(
                event.clientX - pointer.lastTrailX,
                event.clientY - pointer.lastTrailY
              );
              if (moveDist >= 10) {
                spawnTrailSparks(event.clientX, event.clientY, 1);
                pointer.lastTrailX = event.clientX;
                pointer.lastTrailY = event.clientY;
              }
            }
          },
          { passive: true }
        );

        document.addEventListener('mouseover', (event) => {
          if (!cursorRing || isScrolling) return;
          const interactive = event.target.closest(interactiveSelector);
          cursorRing.classList.toggle('is-hovering', Boolean(interactive));
        });

        window.addEventListener(
          'pointerdown',
          (event) => {
            if (event.pointerType === 'touch') return;
            if (cursorRing) cursorRing.classList.add('is-clicking');
            spawnRipple(event.clientX, event.clientY);
            spawnTrailSparks(event.clientX, event.clientY, 4);
          },
          { passive: true }
        );

        window.addEventListener(
          'pointerup',
          () => {
            if (cursorRing) cursorRing.classList.remove('is-clicking');
          },
          { passive: true }
        );

        document.addEventListener('mouseleave', () => {
          pointer.active = false;
          if (cursorSpotlight) cursorSpotlight.classList.remove('is-active');
          if (cursorRing) cursorRing.classList.remove('is-visible');
          if (cursorDot) cursorDot.classList.remove('is-visible');
        });
      }

      // Touch interactions (Mobile & Tablet)
      window.addEventListener(
        'touchstart',
        (event) => {
          const touch = event.touches[0];
          if (!touch) return;
          pointer.targetX = touch.clientX;
          pointer.targetY = touch.clientY;
          pointer.spotDirty = true;
          pointer.active = true;
          window.clearTimeout(touchFadeTimer);

          if (cursorSpotlight) cursorSpotlight.classList.add('is-active');
          spawnRipple(touch.clientX, touch.clientY);
          spawnTrailSparks(touch.clientX, touch.clientY, 3);
        },
        { passive: true }
      );

      window.addEventListener(
        'touchmove',
        (event) => {
          const touch = event.touches[0];
          if (!touch) return;
          pointer.targetX = touch.clientX;
          pointer.targetY = touch.clientY;
          pointer.spotDirty = true;
          pointer.active = true;

          const moveDist = Math.hypot(
            touch.clientX - pointer.lastTrailX,
            touch.clientY - pointer.lastTrailY
          );
          if (moveDist >= 14) {
            spawnTrailSparks(touch.clientX, touch.clientY, 1);
            pointer.lastTrailX = touch.clientX;
            pointer.lastTrailY = touch.clientY;
          }
        },
        { passive: true }
      );

      window.addEventListener(
        'touchend',
        () => {
          touchFadeTimer = window.setTimeout(() => {
            pointer.active = false;
            if (cursorSpotlight) cursorSpotlight.classList.remove('is-active');
          }, 800);
        },
        { passive: true }
      );
    }
  }
})();
