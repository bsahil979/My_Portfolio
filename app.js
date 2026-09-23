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

    const words = wordsContainer.querySelectorAll('h2');
    if (!words.length) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      container.classList.add('hidden');
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

    const projectItems = projectList.querySelectorAll('.home-project-item');
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
      const slideIndex = item.hasAttribute('data-index') 
        ? parseInt(item.getAttribute('data-index'), 10) 
        : idx;

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
    const clockEl = document.getElementById('liveClockMumbai');
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
  // 6. Smooth Anchor Link Scrolling (Pure Native, Zero Hijacking)
  // --------------------------------------------------------------------------
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // DOM Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initLanguagePreloader();
    initHeroMarquee();
    initAdaptiveNavbar();
    initMagneticPhysics();
    initProjectHoverModal();
    initLiveClock();
    initSmoothAnchors();
  });
})();
