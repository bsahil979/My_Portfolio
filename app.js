/**
 * app.js
 * Dennis Snellenberg Interactive Controller for Sahil Belchada's Portfolio
 * 
 * Performance & Architecture:
 * - 100% Native Hardware-Accelerated Scrolling (Zero hijacking, Zero stuck issues)
 * - Dennis Snellenberg Magnetic Button Physics
 * - Floating Project Cursor Modal & "View" Badge with Lerp smoothing
 * - Live Mumbai Local Time Clock (GMT+5:30)
 * - Header Scroll Observer
 * - Pure Native Anchor Navigation
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Dennis Snellenberg Magnetic Physics Engine
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
  // 2. Dennis Snellenberg Floating Project Modal & "View" Cursor Follower
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
  // 3. Live Mumbai Local Time Clock (Dennis Snellenberg Footer)
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
        clockEl.textContent = '11:25 PM [IST]';
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // --------------------------------------------------------------------------
  // 4. Smooth Anchor Link Scrolling (Pure Native, Zero Hijacking)
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

  // --------------------------------------------------------------------------
  // 5. Sticky Navigation Scroll State
  // --------------------------------------------------------------------------
  function initNavScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // DOM Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initMagneticPhysics();
    initProjectHoverModal();
    initLiveClock();
    initSmoothAnchors();
    initNavScroll();
  });
})();
