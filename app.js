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
  // 3. Dennis Snellenberg Magnetic Physics Engine
  // --------------------------------------------------------------------------
  function initMagneticPhysics() {
    const isTouch = window.innerWidth < 1024 || ('ontouchstart' in window);
    if (isTouch) return;

    const magneticElements = document.querySelectorAll('.magnetic-target');

    magneticElements.forEach((el) => {
      let bound = el.getBoundingClientRect();

      window.addEventListener('resize', () => {
        bound = el.getBoundingClientRect();
      }, { passive: true });

      el.addEventListener('mousemove', (e) => {
        bound = el.getBoundingClientRect();
        const centerX = bound.left + bound.width / 2;
        const centerY = bound.top + bound.height / 2;

        const deltaX = (e.clientX - centerX) * 0.32;
        const deltaY = (e.clientY - centerY) * 0.32;

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `translate3d(0px, 0px, 0)`;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Dennis Snellenberg Floating Project Modal & "View" Cursor Follower
  // --------------------------------------------------------------------------
  function initProjectHoverModal() {
    const isTouch = window.innerWidth < 1024 || ('ontouchstart' in window);
    if (isTouch) return;

    const projectList = document.getElementById('projectList');
    const modalContainer = document.getElementById('projectModalContainer');
    const modalSlider = document.getElementById('projectModalSlider');
    const cursorBadge = document.getElementById('projectCursorBadge');
    const projectItems = document.querySelectorAll('.project-item-wrap');

    if (!projectList || !modalContainer || !modalSlider || !cursorBadge) return;

    let mouseX = -300, mouseY = -300;
    let modalX = -300, modalY = -300;
    let badgeX = -300, badgeY = -300;
    let isHoveringList = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Smooth Lerp Physics Loop
    function renderModal() {
      if (isHoveringList) {
        modalX += (mouseX - modalX) * 0.12;
        modalY += (mouseY - modalY) * 0.12;
        modalContainer.style.left = `${modalX}px`;
        modalContainer.style.top = `${modalY}px`;

        badgeX += (mouseX - badgeX) * 0.22;
        badgeY += (mouseY - badgeY) * 0.22;
        cursorBadge.style.left = `${badgeX}px`;
        cursorBadge.style.top = `${badgeY}px`;
      }
      requestAnimationFrame(renderModal);
    }
    requestAnimationFrame(renderModal);

    projectList.addEventListener('mouseenter', () => {
      isHoveringList = true;
      modalContainer.classList.add('active');
      cursorBadge.classList.add('active');
    });

    projectList.addEventListener('mouseleave', () => {
      isHoveringList = false;
      modalContainer.classList.remove('active');
      cursorBadge.classList.remove('active');
    });

    projectItems.forEach((item, idx) => {
      item.addEventListener('mouseenter', () => {
        modalSlider.style.transform = `translate3d(0, -${idx * 100}%, 0)`;
      });
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
    initAdaptiveNavbar();
    initMagneticPhysics();
    initProjectHoverModal();
    initLiveClock();
    initSmoothAnchors();
  });
})();
