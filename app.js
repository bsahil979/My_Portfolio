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
          setTimeout(() => {
            container.classList.add('hidden');
          }, 850);
        }, 80);
      }
    }, intervalTime);
  }

  // --------------------------------------------------------------------------
  // 2. Adaptive Navbar Scroll Controller (Dark Hero -> Light Content -> Dark Footer)
  // --------------------------------------------------------------------------
  function initAdaptiveNavbar() {
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    const footer = document.getElementById('contact');
    if (!navbar) return;

    function handleScroll() {
      const scrollY = window.scrollY;
      const heroHeight = hero ? hero.offsetHeight - 50 : 600;
      const footerTop = footer ? footer.offsetTop - 100 : 999999;

      if (scrollY < 30) {
        navbar.classList.remove('scrolled-dark', 'nav-light');
      } else if (scrollY >= 30 && scrollY < heroHeight) {
        navbar.classList.add('scrolled-dark');
        navbar.classList.remove('nav-light');
      } else if (scrollY >= heroHeight && scrollY < footerTop) {
        navbar.classList.add('nav-light');
        navbar.classList.remove('scrolled-dark');
      } else {
        // Over the footer
        navbar.classList.add('scrolled-dark');
        navbar.classList.remove('nav-light');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // --------------------------------------------------------------------------
  // 3. Dennis Snellenberg Magnetic Physics Engine (2.5D Dual-Layer Text Parallax)
  // --------------------------------------------------------------------------
  function initMagneticPhysics() {
    if (window.innerWidth <= 540) return;

    const magneticElements = document.querySelectorAll('.magnetic-target');

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
    // Only disable on narrow mobile screens (<= 540px, matching Dennis Snellenberg)
    if (window.innerWidth <= 540) return;

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
    const parallaxElements = document.querySelectorAll('[data-scroll-speed]');

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
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      // Expose globally for coordination
      window.lenis = lenisInstance;

      function raf(time) {
        lenisInstance.raf(time);
        updateCurvedDividers();
        updateScrollParallax();
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      lenisInstance.on('scroll', () => {
        updateCurvedDividers();
        updateScrollParallax();
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
    window.addEventListener('pageshow', () => {
      container.classList.remove('is-active', 'is-entering', 'is-exiting');
      screen.classList.add('done');
      container.classList.add('hidden');
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

  // DOM Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initLanguagePreloader();
    initPageTransitions();
    initHeroMarquee();
    initAdaptiveNavbar();
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
