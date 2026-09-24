/**
 * app.js
 * Dennis Snellenberg Interactive Controller for Sahil Belchada's Portfolio
 * 
 * Architecture:
 * 1. Dennis Snellenberg Multilingual "Hello" Preloader Curtain
 * 2. Adaptive Dark/Light Navbar Controller based on scroll position
 * 3. Magnetic Physics Engine for buttons & links
 * 4. Floating Project Cursor Modal & "View" Badge with Lerp Smoothing
 * 5. Live Mumbai Local Time Clock (GMT+5:30)
 * 6. Pure Native Anchor Navigation (Zero scroll hijacking)
 */

(function () {
  'use strict';

  let updateHamburgerScroll = null;

  // --------------------------------------------------------------------------
  // 1. Dennis Snellenberg Multilingual "Hello" Preloader
  // --------------------------------------------------------------------------
  function initLanguagePreloader() {
    const container = document.getElementById('loadingContainer');
    const screen = document.getElementById('loadingScreen');
    const wordsContainer = document.getElementById('loadingWords');
    if (!container || !screen || !wordsContainer) return;

    // Yield to page transition engine if on work page, transitioning, or already visited
    const pageTransitionTo = sessionStorage.getItem('dennis_page_transition');
    const alreadyVisited = sessionStorage.getItem('dennis_preloader_done');

    if (pageTransitionTo || document.body.classList.contains('page-work') || alreadyVisited) {
      container.classList.add('hidden');
      screen.classList.add('done');
      window.dispatchEvent(new CustomEvent('portfolio:preloader-done'));
      return;
    }

    const words = wordsContainer.querySelectorAll('h2');
    if (!words.length) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem('dennis_preloader_done', 'true');
      container.classList.add('hidden');
      screen.classList.add('done');
      window.dispatchEvent(new CustomEvent('portfolio:preloader-done'));
      return;
    }

    let currentIndex = 0;
    const intervalTime = 135; // milliseconds per language

    const interval = setInterval(() => {
      words[currentIndex].classList.remove('active');
      currentIndex++;

      if (currentIndex < words.length) {
        words[currentIndex].classList.add('active');
      } else {
        clearInterval(interval);
        sessionStorage.setItem('dennis_preloader_done', 'true');
        // Complete cycle: slide the curtain up
        setTimeout(() => {
          screen.classList.add('done');
          window.dispatchEvent(new CustomEvent('portfolio:preloader-done'));
          setTimeout(() => {
            container.classList.add('hidden');
          }, 850);
        }, 80);
      }
    }, intervalTime);
  }

  // --------------------------------------------------------------------------
  // 2. Dennis Snellenberg Floating Hamburger & Sliding Drawer Controller
  // --------------------------------------------------------------------------
  function initDennisHamburgerNav() {
    const btnHamburger = document.getElementById('btnHamburger');
    const fixedNav = document.getElementById('fixedNav');
    const fixedNavBack = document.getElementById('fixedNavBack');
    if (!btnHamburger || !fixedNav) return;

    const drawerLinks = fixedNav.querySelectorAll('.drawer-nav-link');

    // Scroll listener: appear when scrolled down, or always visible on tablet/mobile (<= 980px)
    function handleScroll() {
      if (window.innerWidth <= 980) {
        btnHamburger.classList.add('visible');
        return;
      }

      const scrollY = window.scrollY || document.documentElement.scrollTop || (window.lenis ? window.lenis.scroll : 0);
      const threshold = 50; // appears as soon as hero navbar starts leaving view

      if (scrollY > threshold) {
        btnHamburger.classList.add('visible');
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
        if (!document.body.classList.contains('nav-active')) {
          btnHamburger.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateHamburgerScroll = handleScroll;
    handleScroll();

    function openMenu() {
      document.body.classList.add('nav-active');
      btnHamburger.classList.add('active', 'visible');
      btnHamburger.setAttribute('aria-expanded', 'true');
      fixedNav.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
      document.body.classList.remove('nav-active');
      btnHamburger.classList.remove('active');
      btnHamburger.setAttribute('aria-expanded', 'false');
      fixedNav.setAttribute('aria-hidden', 'true');

      if (window.innerWidth > 980) {
        const scrollY = window.scrollY || document.documentElement.scrollTop || (window.lenis ? window.lenis.scroll : 0);
        if (scrollY <= 50) {
          btnHamburger.classList.remove('visible');
        }
      }
    }

    function toggleMenu() {
      if (document.body.classList.contains('nav-active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    btnHamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    btnHamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    // Dedicated magnetic physics for hamburger button (fine pointer only)
    const btnClick = btnHamburger.querySelector('.btn-click');
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    if (btnClick && hasFinePointer) {
      let isHovered = false;

      btnHamburger.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      btnHamburger.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = btnHamburger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = Math.max(-10, Math.min(10, (e.clientX - centerX) * 0.25));
        const deltaY = Math.max(-10, Math.min(10, (e.clientY - centerY) * 0.25));

        btnClick.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      btnHamburger.addEventListener('mouseleave', () => {
        isHovered = false;
        btnClick.style.transform = 'translate3d(0, 0, 0)';
      });
    }

    if (fixedNavBack) {
      fixedNavBack.addEventListener('click', closeMenu);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-active')) {
        closeMenu();
      }
    });

    // Handle drawer link clicks
    drawerLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Close drawer immediately
        closeMenu();

        // If it's a page transition link to another page
        if (link.classList.contains('page-transition-link')) {
          return;
        }

        // If it's an in-page anchor (#work, #about, etc.)
        if (href && (href.startsWith('#') || href.includes('#'))) {
          const hash = href.includes('#') ? href.split('#')[1] : '';
          const targetEl = hash ? document.getElementById(hash) : null;
          if (targetEl) {
            e.preventDefault();
            setTimeout(() => {
              if (window.lenisInstance) {
                window.lenisInstance.scrollTo(targetEl, { offset: -30, duration: 1.2 });
              } else {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            }, 300);
          }
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Dennis Snellenberg Magnetic Physics Engine (2.5D Dual-Layer Text Parallax)
  // --------------------------------------------------------------------------
  function initMagneticPhysics() {
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    if (!hasFinePointer) return;

    // Exclude hero elements (managed exclusively by the dedicated Motion engine)
    const magneticElements = document.querySelectorAll('.magnetic-target:not(#hero .magnetic-target)');

    magneticElements.forEach((el) => {
      const textInner = el.querySelector('.btn-text-inner');
      let bound = el.getBoundingClientRect();

      function updateBounds() {
        bound = el.getBoundingClientRect();
      }
      window.addEventListener('resize', updateBounds, { passive: true });
      window.addEventListener('scroll', updateBounds, { passive: true });

      el.addEventListener('mouseenter', () => {
        el.classList.add('is-hovered');
        bound = el.getBoundingClientRect();
      });

      el.addEventListener('mousemove', (e) => {
        const centerX = bound.left + bound.width / 2;
        const centerY = bound.top + bound.height / 2;

        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

        if (textInner) {
          const textDeltaX = (e.clientX - centerX) * 0.18;
          const textDeltaY = (e.clientY - centerY) * 0.18;
          textInner.style.transform = `translate3d(${textDeltaX}px, ${textDeltaY}px, 0)`;
        }
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-hovered');
        el.style.transform = 'translate3d(0px, 0px, 0)';
        if (textInner) {
          textInner.style.transform = 'translate3d(0px, 0px, 0)';
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Dennis Snellenberg Calm Drifting Hero Marquee (Steady, Smooth & Slow)
  // --------------------------------------------------------------------------
  function initHeroMarquee() {
    const track = document.getElementById('heroMarqueeTrack');
    if (!track) return;

    // Respect prefers-reduced-motion: keep marquee static & readable
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    let xPercent = 0;
    // Slow, serene speed: ~2% per second constant drift, completely independent of scrolling
    const speedPerMs = 0.0022;
    let lastTime = performance.now();

    function renderMarquee(currentTime) {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Safe delta clamp to prevent jump if user switches tabs
      const safeDelta = Math.min(delta, 100);

      xPercent -= speedPerMs * safeDelta;

      // Wrap cleanly at -50% for seamless looping
      if (xPercent <= -50) {
        xPercent += 50;
      }

      track.style.transform = `translate3d(${xPercent}%, 0, 0)`;
      requestAnimationFrame(renderMarquee);
    }

    requestAnimationFrame(renderMarquee);
  }

  // --------------------------------------------------------------------------
  // 4. Dennis Snellenberg Floating Project Modal & "View" Cursor Follower
  // --------------------------------------------------------------------------
  function initProjectHoverModal() {
    // Only enable on true fine pointer / mouse devices (not touch screens)
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    if (!hasFinePointer) return;

    const projectList = document.getElementById('projectList');
    const modalContainer = document.getElementById('projectModalContainer');
    const modalSlider = document.getElementById('projectModalSlider');
    const cursorBadge = document.getElementById('projectCursorBadge');

    if (!projectList || !modalContainer || !modalSlider || !cursorBadge) return;

    const projectItems = projectList.querySelectorAll('.home-project-item, .work-row-item');
    if (!projectItems.length) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let modalX = mouseX;
    let modalY = mouseY;
    let badgeX = mouseX;
    let badgeY = mouseY;
    let hasMoved = false;

    // Track mouse globally across the window
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        modalX = mouseX;
        modalY = mouseY;
        badgeX = mouseX;
        badgeY = mouseY;
        modalContainer.style.left = `${modalX.toFixed(1)}px`;
        modalContainer.style.top = `${modalY.toFixed(1)}px`;
        cursorBadge.style.left = `${badgeX.toFixed(1)}px`;
        cursorBadge.style.top = `${badgeY.toFixed(1)}px`;
        hasMoved = true;
      }
    }, { passive: true });

    // Smooth continuous lerp loop (Dennis Snellenberg cursor follower physics)
    function renderModal() {
      if (hasMoved) {
        // Modal lerp factor: 0.12 for smooth floating motion
        modalX += (mouseX - modalX) * 0.12;
        modalY += (mouseY - modalY) * 0.12;
        modalContainer.style.left = `${modalX.toFixed(1)}px`;
        modalContainer.style.top = `${modalY.toFixed(1)}px`;

        // Badge lerp factor: 0.22 for responsive foreground tracking
        badgeX += (mouseX - badgeX) * 0.22;
        badgeY += (mouseY - badgeY) * 0.22;
        cursorBadge.style.left = `${badgeX.toFixed(1)}px`;
        cursorBadge.style.top = `${badgeY.toFixed(1)}px`;
      }
      requestAnimationFrame(renderModal);
    }
    requestAnimationFrame(renderModal);

    function showItemModal(slideIndex) {
      modalSlider.style.transform = `translate3d(0, -${slideIndex * 100}%, 0)`;
      modalContainer.classList.add('active');
      cursorBadge.classList.add('active');
    }

    function hideItemModal() {
      modalContainer.classList.remove('active');
      cursorBadge.classList.remove('active');
    }

    // Attach listeners directly to each project item
    projectItems.forEach((item, idx) => {
      const slideIndex = item.hasAttribute('data-project-index')
        ? parseInt(item.getAttribute('data-project-index'), 10)
        : (item.hasAttribute('data-index') ? parseInt(item.getAttribute('data-index'), 10) : idx);

      item.addEventListener('mouseenter', () => {
        showItemModal(slideIndex);
      });

      item.addEventListener('mousemove', () => {
        if (!modalContainer.classList.contains('active')) {
          showItemModal(slideIndex);
        }
      });

      item.addEventListener('mouseleave', (e) => {
        const related = e.relatedTarget;
        if (!related || !projectList.contains(related)) {
          hideItemModal();
        }
      });
    });

    // Guard against leaving project list entirely
    projectList.addEventListener('mouseleave', () => {
      hideItemModal();
    });
  }

  // --------------------------------------------------------------------------
  // 5. Live Mumbai Local Time Clock (Dennis Snellenberg Footer)
  // --------------------------------------------------------------------------
  function initLiveClock() {
    const clockEl = document.getElementById('liveClockMumbai') || document.getElementById('mumbaiTime');
    if (!clockEl) return;

    function updateClock() {
      try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        clockEl.textContent = `${timeString} [GMT+5:30]`;
      } catch (e) {
        clockEl.textContent = '11:40 PM [IST]';
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // --------------------------------------------------------------------------
  // 6. Dennis Snellenberg Smooth Inertia Scroll (Lenis) & Overlapping Curves
  // --------------------------------------------------------------------------
  let lenisInstance = null;

  function updateCurvedDividers() {
    const wrappers = document.querySelectorAll('.rounded-div-wrapper');
    const windowH = window.innerHeight;

    wrappers.forEach((wrap) => {
      const innerWrap = wrap.querySelector('.rounded-div-wrap');
      if (!innerWrap) return;

      const rect = wrap.getBoundingClientRect();
      const isToLight = wrap.classList.contains('to-light');
      
      // Calculate scroll progress for the divider:
      // Start scrubbing when divider enters bottom of viewport (rect.top == windowH)
      // Fully flattened when divider reaches upper viewport (rect.top <= windowH * 0.15)
      const start = windowH;
      const end = windowH * 0.15;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

      // Height morphs smoothly from ~115px down to 0px, creating the peeling curved overlap
      const maxHeight = Math.min(125, Math.max(75, windowH * 0.1));
      const targetHeight = (maxHeight * (1 - progress)).toFixed(1);
      innerWrap.style.height = `${targetHeight}px`;
    });
  }

  function updateScrollParallax() {
    const windowH = window.innerHeight;
    const windowCenter = windowH / 2;
    // Exclude hero elements (managed exclusively by Motion.scroll)
    const parallaxElements = document.querySelectorAll('[data-scroll-speed]:not(#hero [data-scroll-speed])');

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-scroll-speed'));
      if (isNaN(speed) || speed === 0) return;

      const rect = el.getBoundingClientRect();
      // Only compute and transform when in or near viewport (-150px buffer)
      if (rect.bottom >= -150 && rect.top <= windowH + 150) {
        const elCenter = rect.top + rect.height / 2;
        const diff = elCenter - windowCenter;
        
        // High-precision smooth parallax translation
        // As you scroll down (el moves up, diff < 0), positive speed moves UP faster
        // As you scroll up (el moves down, diff > 0), positive speed moves DOWN faster
        const translateY = (diff * speed * 0.08).toFixed(1);
        el.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
    });
  }

  function initSmoothScroll() {
    // If user prefers reduced motion, keep native scroll
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', () => {
        updateCurvedDividers();
        updateScrollParallax();
      }, { passive: true });
      updateCurvedDividers();
      return;
    }

    if (typeof Lenis !== 'undefined') {
      // Dennis Snellenberg / Locomotive Scroll Linear Interpolation Physics
      lenisInstance = new Lenis({
        lerp: 0.085,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false, // Maintain native hardware-accelerated momentum touch scrolling on Android and iOS
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        infinite: false,
      });

      // Expose globally for coordination
      window.lenis = lenisInstance;

      function raf(time) {
        lenisInstance.raf(time);
        updateCurvedDividers();
        updateScrollParallax();
        if (updateHamburgerScroll) updateHamburgerScroll();
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      lenisInstance.on('scroll', () => {
        updateCurvedDividers();
        updateScrollParallax();
        if (updateHamburgerScroll) updateHamburgerScroll();
      });
    }

    window.addEventListener('scroll', () => {
      updateCurvedDividers();
      updateScrollParallax();
    }, { passive: true });
    updateCurvedDividers();
    updateScrollParallax();
  }

  // --------------------------------------------------------------------------
  // 7. Smooth Anchor Link Scrolling (Lenis Inertia + Native Fallback)
  // --------------------------------------------------------------------------
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(targetEl, { offset: 0, duration: 1.35 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. Dennis Snellenberg Fluid Curved Page Transition Engine
  // --------------------------------------------------------------------------
  function initPageTransitions() {
    const container = document.getElementById('loadingContainer');
    const screen = document.getElementById('loadingScreen');
    const wordText = document.getElementById('pageTransitionText');
    if (!container || !screen) return;

    // 1. Entrance animation (Exiting the transition curtain upon landing)
    const isTransitioning = sessionStorage.getItem('dennis_page_transition');
    const isWorkPage = document.body.classList.contains('page-work');

    if (isTransitioning || isWorkPage) {
      sessionStorage.removeItem('dennis_page_transition');
      container.classList.remove('hidden');
      container.classList.add('is-active', 'is-exiting');

      if (wordText) {
        wordText.textContent = isWorkPage ? 'Work' : (isTransitioning || 'Home');
      }

      // Smoothly remove overlay once the curtain has swept off
      setTimeout(() => {
        container.classList.remove('is-active', 'is-exiting');
        screen.classList.add('done');
        container.classList.add('hidden');
      }, 700);
    } else {
      // If user navigated back without active transition, immediately dismiss any dark overlay
      const alreadyDone = sessionStorage.getItem('dennis_preloader_done');
      if (alreadyDone) {
        screen.classList.add('done');
        container.classList.add('hidden');
        container.classList.remove('is-active', 'is-entering', 'is-exiting');
      }
    }

    // 2. Intercept page navigation links
    const transitionLinks = document.querySelectorAll('.page-transition-link, a[href="work.html"], a[href="index.html"]');

    transitionLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
          return;
        }

        // Avoid re-transitioning to same page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = href.split('#')[0];
        if (targetPage === currentPage) return;

        e.preventDefault();
        const targetWord = link.getAttribute('data-transition-word') || (href.includes('work') ? 'Work' : 'Home');

        if (wordText) {
          wordText.textContent = targetWord;
        }

        // Reset classes and trigger entrance wipe
        container.classList.remove('hidden', 'is-exiting');
        screen.classList.remove('done');
        container.classList.add('is-active', 'is-entering');
        sessionStorage.setItem('dennis_page_transition', targetWord);

        setTimeout(() => {
          window.location.href = href;
        }, 520);
      });
    });

    // 3. Bulletproof reset for bfcache and browser back/forward navigation
    window.addEventListener('pageshow', (event) => {
      if (event.persisted || sessionStorage.getItem('dennis_preloader_done')) {
        container.classList.remove('is-active', 'is-entering', 'is-exiting');
        screen.classList.add('done');
        container.classList.add('hidden');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. Dennis Snellenberg Work Page Filter Controller
  // --------------------------------------------------------------------------
  function initWorkFilters() {
    const filterButtons = document.querySelectorAll('.filter-pill-btn');
    const rowItems = document.querySelectorAll('.work-row-item');
    const gridCards = document.querySelectorAll('.work-tile-card');
    if (!filterButtons.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');

        // Filter Rows View
        rowItems.forEach((item) => {
          const itemCat = item.getAttribute('data-category') || '';
          if (filterVal === 'all' || itemCat.includes(filterVal)) {
            item.classList.remove('is-filtered-out');
          } else {
            item.classList.add('is-filtered-out');
            item.classList.remove('is-expanded');
          }
        });

        // Filter Grid View
        gridCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category') || '';
          if (filterVal === 'all' || cardCat.includes(filterVal)) {
            card.classList.remove('is-filtered-out');
          } else {
            card.classList.add('is-filtered-out');
          }
        });

        // Update Lenis scroll container
        if (lenisInstance) {
          lenisInstance.resize();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. Dennis Snellenberg Work Page View Mode Switcher (Rows vs Grid)
  // --------------------------------------------------------------------------
  function initWorkViewToggle() {
    const rowsBtn = document.getElementById('viewRowsBtn');
    const gridBtn = document.getElementById('viewGridBtn');
    const listView = document.getElementById('workListView');
    const gridView = document.getElementById('workGridView');

    if (!rowsBtn || !gridBtn || !listView || !gridView) return;

    rowsBtn.addEventListener('click', () => {
      rowsBtn.classList.add('active');
      gridBtn.classList.remove('active');
      listView.classList.remove('is-hidden');
      gridView.classList.add('is-hidden');
      if (lenisInstance) lenisInstance.resize();
    });

    gridBtn.addEventListener('click', () => {
      gridBtn.classList.add('active');
      rowsBtn.classList.remove('active');
      gridView.classList.remove('is-hidden');
      listView.classList.add('is-hidden');
      if (lenisInstance) lenisInstance.resize();
    });
  }

  // --------------------------------------------------------------------------
  // 11. Dennis Snellenberg Expandable Case Study Drawers
  // --------------------------------------------------------------------------
  function initWorkRowAccordions() {
    const rowMains = document.querySelectorAll('.work-row-main');
    if (!rowMains.length) return;

    rowMains.forEach((main) => {
      main.addEventListener('click', (e) => {
        // Prevent toggle if clicking on interactive links
        if (e.target.closest('a')) return;

        const parentItem = main.closest('.work-row-item');
        if (!parentItem) return;

        const isExpanded = parentItem.classList.contains('is-expanded');
        parentItem.classList.toggle('is-expanded', !isExpanded);
        main.setAttribute('aria-expanded', !isExpanded);

        // Update Lenis scroll layout
        setTimeout(() => {
          if (lenisInstance) lenisInstance.resize();
        }, 350);
      });

      main.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          main.click();
        }
      });
    });
  }

  // ==========================================================================
  // HERO MOTION ENGINE (Powered by Motion — WAAPI Compositor Physics)
  // ==========================================================================

  let heroMotionAbort = null;

  /**
   * 1. Hero Headline & Line Mask Reveal
   * Unmasks typography lines upward from behind their overflow-hidden clip bounds.
   * Utilizes critically damped Motion spring physics (bounce: 0) to ensure authoritative,
   * weighted, and precise arrival without generic fade/translate boilerplate or rubber-band wobble.
   */
  function initHeroHeadlineReveal(signal) {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const revealLines = hero.querySelectorAll('.hero-reveal-line');
    const revealElements = hero.querySelectorAll('.hero-reveal-element');
    if (!revealLines.length && !revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealLines.forEach((el) => {
        el.style.transform = 'none';
        el.style.opacity = '1';
      });
      revealElements.forEach((el) => {
        el.style.transform = 'none';
        el.style.opacity = '1';
      });
      return;
    }

    let hasRevealed = false;

    function playEntrance() {
      if (hasRevealed || (signal && signal.aborted)) return;
      hasRevealed = true;

      if (!window.Motion || !window.Motion.animate) {
        revealLines.forEach((el) => { el.style.transform = 'none'; el.style.opacity = '1'; });
        revealElements.forEach((el) => { el.style.transform = 'none'; el.style.opacity = '1'; });
        return;
      }

      // Arrow indicator: subtle scale & opacity unmasking
      const arrow = hero.querySelector('.hero-arrow-indicator');
      if (arrow) {
        window.Motion.animate(
          arrow,
          { opacity: [0, 1], transform: ['scale(0.82)', 'scale(1)'] },
          { duration: 0.45, ease: 'easeOut', delay: 0.05 }
        );
      }

      // Line 1: "Hi, I'm a"
      const line1 = hero.querySelector('.hero-hi-text.hero-reveal-line');
      if (line1) {
        window.Motion.animate(
          line1,
          { transform: ['translate3d(0, 115%, 0)', 'translate3d(0, 0%, 0)'] },
          { type: 'spring', visualDuration: 0.65, bounce: 0, delay: 0.08 }
        );
      }

      // Line 2: "Software Developer"
      const line2 = hero.querySelector('.hero-role-heading.hero-reveal-line');
      if (line2) {
        window.Motion.animate(
          line2,
          { transform: ['translate3d(0, 115%, 0)', 'translate3d(0, 0%, 0)'] },
          { type: 'spring', visualDuration: 0.72, bounce: 0, delay: 0.16 }
        );
      }

      // Bottom Row: Scroll CTA wrapper & Education line
      const bottomLines = hero.querySelectorAll('.hero-bottom-row .hero-reveal-line');
      bottomLines.forEach((line, i) => {
        window.Motion.animate(
          line,
          { transform: ['translate3d(0, 115%, 0)', 'translate3d(0, 0%, 0)'] },
          { type: 'spring', visualDuration: 0.65, bounce: 0, delay: 0.28 + i * 0.08 }
        );
      });
    }

    const preloaderScreen = document.getElementById('loadingScreen');
    const alreadyVisited = sessionStorage.getItem('dennis_preloader_done') ||
      (preloaderScreen && preloaderScreen.classList.contains('done')) ||
      document.body.classList.contains('page-work');

    if (alreadyVisited) {
      setTimeout(playEntrance, 120);
    } else {
      window.addEventListener('portfolio:preloader-done', playEntrance, { once: true, signal });
      setTimeout(playEntrance, 2400);
    }
  }

  /**
   * 2. Hero CTA Magnetic Interaction
   * Implements restrained cursor attraction with hyperbolic tangent asymptotic clamping.
   * Maximum outer movement: 14px; maximum inner label movement: 7px.
   * Uses capability queries ((pointer: fine) and (hover: hover)) to cleanly bypass touch/coarse devices.
   * Uses a single centralized rAF coordinator to eliminate duplicated rAF loops.
   * getBoundingClientRect is read strictly on pointerenter, never during animation frames or scroll.
   * On release, Motion executes a critically damped spring (bounce: 0) to settle firmly without rubber-band rebound.
   */
  function initHeroMagneticButtons(signal) {
    const hero = document.getElementById('hero');
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Hardware capability check: require fine pointer (mouse/trackpad) and hover support
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!hasFinePointer || !canHover) return;

    const heroButtons = hero.querySelectorAll('.magnetic-target');
    if (!heroButtons.length) return;

    const MAX_OUTER = 14;
    const MAX_INNER = 7;
    const DAMPING = 0.18;

    let activeState = null;
    let rafId = null;

    function unifiedStep() {
      if (!activeState) {
        rafId = null;
        return;
      }

      // Critically damped follower interpolation
      activeState.currentX += (activeState.targetX - activeState.currentX) * DAMPING;
      activeState.currentY += (activeState.targetY - activeState.currentY) * DAMPING;
      activeState.currentInnerX += (activeState.targetInnerX - activeState.currentInnerX) * (DAMPING * 1.15);
      activeState.currentInnerY += (activeState.targetInnerY - activeState.currentInnerY) * (DAMPING * 1.15);

      activeState.btn.style.transform = `translate3d(${activeState.currentX.toFixed(2)}px, ${activeState.currentY.toFixed(2)}px, 0)`;
      if (activeState.textInner) {
        activeState.textInner.style.transform = `translate3d(${activeState.currentInnerX.toFixed(2)}px, ${activeState.currentInnerY.toFixed(2)}px, 0)`;
      }
      if (activeState.iconCircle) {
        activeState.iconCircle.style.transform = `translate3d(${activeState.currentInnerX.toFixed(2)}px, ${activeState.currentInnerY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(unifiedStep);
    }

    heroButtons.forEach((btn) => {
      const textInner = btn.querySelector('.btn-text-inner');
      const iconCircle = btn.querySelector('.scroll-arrow-circle');
      let bounds = null;

      btn.addEventListener('pointerenter', () => {
        // Measure bounding rect once on enter
        bounds = btn.getBoundingClientRect();
        btn.classList.add('is-hovered');

        activeState = {
          btn,
          textInner,
          iconCircle,
          targetX: 0,
          targetY: 0,
          currentX: 0,
          currentY: 0,
          targetInnerX: 0,
          targetInnerY: 0,
          currentInnerX: 0,
          currentInnerY: 0,
        };

        if (!rafId) {
          rafId = requestAnimationFrame(unifiedStep);
        }
      }, { signal });

      btn.addEventListener('pointermove', (e) => {
        if (!activeState || activeState.btn !== btn) return;
        if (!bounds) bounds = btn.getBoundingClientRect();

        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Asymptotic hyperbolic tangent clamping
        activeState.targetX = MAX_OUTER * Math.tanh((deltaX * 0.35) / MAX_OUTER);
        activeState.targetY = MAX_OUTER * Math.tanh((deltaY * 0.35) / MAX_OUTER);
        activeState.targetInnerX = MAX_INNER * Math.tanh((deltaX * 0.20) / MAX_INNER);
        activeState.targetInnerY = MAX_INNER * Math.tanh((deltaY * 0.20) / MAX_INNER);

        if (!rafId) {
          rafId = requestAnimationFrame(unifiedStep);
        }
      }, { signal });

      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-hovered');
        bounds = null;

        if (activeState && activeState.btn === btn) {
          activeState = null;
        }

        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        // Return to center via Motion critically damped spring
        if (window.Motion && window.Motion.animate) {
          window.Motion.animate(
            btn,
            { transform: 'translate3d(0px, 0px, 0px)' },
            { type: 'spring', visualDuration: 0.38, bounce: 0 }
          );
          if (textInner) {
            window.Motion.animate(
              textInner,
              { transform: 'translate3d(0px, 0px, 0px)' },
              { type: 'spring', visualDuration: 0.34, bounce: 0 }
            );
          }
          if (iconCircle) {
            window.Motion.animate(
              iconCircle,
              { transform: 'translate3d(0px, 0px, 0px)' },
              { type: 'spring', visualDuration: 0.34, bounce: 0 }
            );
          }
        } else {
          btn.style.transform = 'translate3d(0px, 0px, 0px)';
          if (textInner) textInner.style.transform = 'translate3d(0px, 0px, 0px)';
          if (iconCircle) iconCircle.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      }, { signal });
    });

    if (signal) {
      signal.addEventListener('abort', () => {
        if (rafId) cancelAnimationFrame(rafId);
        activeState = null;
        heroButtons.forEach((btn) => {
          btn.classList.remove('is-hovered');
          btn.style.transform = '';
          const textInner = btn.querySelector('.btn-text-inner');
          if (textInner) textInner.style.transform = '';
          const iconCircle = btn.querySelector('.scroll-arrow-circle');
          if (iconCircle) iconCircle.style.transform = '';
        });
      });
    }
  }

  /**
   * 3. Hero Scroll-Linked Dominance & Depth Dissipation
   * Uses Motion's scroll engine to track hero exit progress [start start -> end start].
   * Gradually reduces hero dominance:
   * - Sliding marquee scales subtly (1.0 -> 0.95), adds depth lag, and dims (1.0 -> 0.0)
   * - Top row lifts upward at -65px and fades (1.0 -> 0.0)
   * - Location hanger lifts upward at -45px with gentle fade (1.0 -> 0.2)
   * - Bottom row cleanly dissolves early (1.0 -> 0.0)
   * Cleanup function is properly registered with signal.
   */
  function initHeroScrollTransition(signal) {
    const hero = document.getElementById('hero');
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.Motion || !window.Motion.scroll) return;

    const slidingStrip = hero.querySelector('.hero-sliding-strip');
    const topRow = hero.querySelector('.hero-top-row');
    const hanger = hero.querySelector('.hero-hanger');
    const bottomRow = hero.querySelector('.hero-bottom-row');

    const cleanupScroll = window.Motion.scroll(
      (progress) => {
        // Sliding marquee: subtle scale down and depth fade
        if (slidingStrip) {
          const opacity = Math.max(0, 1 - progress * 1.25);
          const scale = 1 - progress * 0.05;
          const translateY = progress * 40; // subtle background depth lag
          slidingStrip.style.opacity = opacity.toFixed(3);
          slidingStrip.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        }

        // Hero top row (headline & intro): subtle upward drift and gradual fade
        if (topRow) {
          const topOpacity = Math.max(0, 1 - progress * 1.4);
          const topY = -progress * 65;
          topRow.style.opacity = topOpacity.toFixed(3);
          topRow.style.transform = `translate3d(0, ${topY.toFixed(1)}px, 0)`;
        }

        // Location hanger tab: subtle upward parallax and fade
        if (hanger) {
          const hangerOpacity = Math.max(0.15, 1 - progress * 1.2);
          const hangerY = -progress * 45;
          hanger.style.opacity = hangerOpacity.toFixed(3);
          hanger.style.transform = `translate3d(0, ${hangerY.toFixed(1)}px, 0)`;
        }

        // Hero bottom row (scroll explore & education): fades out cleanly early in scroll
        if (bottomRow) {
          const botOpacity = Math.max(0, 1 - progress * 2.2);
          const botY = -progress * 30;
          bottomRow.style.opacity = botOpacity.toFixed(3);
          bottomRow.style.transform = `translate3d(0, ${botY.toFixed(1)}px, 0)`;
        }
      },
      {
        target: hero,
        offset: ['start start', 'end start'],
      }
    );

    if (signal) {
      signal.addEventListener('abort', () => {
        if (typeof cleanupScroll === 'function') cleanupScroll();
      });
    }
  }

  function initHeroMotionSystem() {
    if (heroMotionAbort) {
      heroMotionAbort.abort();
      heroMotionAbort = null;
    }

    heroMotionAbort = new AbortController();
    const { signal } = heroMotionAbort;

    initHeroHeadlineReveal(signal);
    initHeroMagneticButtons(signal);
    initHeroScrollTransition(signal);
  }

  // DOM Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initLanguagePreloader();
    initPageTransitions();
    initHeroMarquee();
    initHeroMotionSystem();
    initDennisHamburgerNav();
    initMagneticPhysics();
    initProjectHoverModal();
    initWorkFilters();
    initWorkViewToggle();
    initWorkRowAccordions();
    initLiveClock();
    initSmoothScroll();
    initSmoothAnchors();
  });
})();
