/**
 * app.js
 * Main UI Controller for Sahil Belchada's Portfolio:
 * Project filters, mobile navigation, copy-to-clipboard, and form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 0. Site Preloader Animation (0% to 100% Circular Counter & Cursive Reveal)
  // ==========================================================================
  const sitePreloader = document.getElementById('sitePreloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderCounter = document.getElementById('preloaderCounter');
  const preloaderRingWrapper = document.getElementById('preloaderRingWrapper');
  const preloaderGreeting = document.getElementById('preloaderGreeting');

  if (sitePreloader && preloaderBar && preloaderCounter) {
    const circumference = 314.16;
    let progress = 0;
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth counter

    function animatePreloader(currentTime) {
      const elapsed = currentTime - startTime;
      const linearT = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeT = 1 - Math.pow(1 - linearT, 3);
      progress = Math.round(easeT * 100);

      preloaderCounter.textContent = `${progress}%`;
      const offset = circumference - (easeT * circumference);
      preloaderBar.style.strokeDashoffset = offset;

      if (linearT < 1) {
        requestAnimationFrame(animatePreloader);
      } else {
        preloaderCounter.textContent = '100%';
        preloaderBar.style.strokeDashoffset = '0';

        // Step 1: Hide counter & ring
        setTimeout(() => {
          if (preloaderRingWrapper) preloaderRingWrapper.classList.add('hide');
          if (preloaderGreeting) preloaderGreeting.classList.add('show');

          // Step 2: Slide up the preloader curtain
          setTimeout(() => {
            sitePreloader.classList.add('loaded');
            setTimeout(() => {
              sitePreloader.style.display = 'none';
            }, 850);
          }, 650);
        }, 200);
      }
    }

    requestAnimationFrame(animatePreloader);
  }

  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 2. Project Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 2.1. Live Preview Mode Toggle (Interactive Live App vs High-Res Snapshot)
  const previewModeBtns = document.querySelectorAll('.preview-mode-btn');
  previewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (!card) return;

      const mode = btn.getAttribute('data-mode');
      card.querySelectorAll('.preview-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const iframe = card.querySelector('.live-preview-iframe');
      const img = card.querySelector('.live-preview-image');

      if (mode === 'iframe') {
        if (iframe) iframe.classList.remove('hidden');
        if (img) img.classList.add('hidden');
      } else {
        if (iframe) iframe.classList.add('hidden');
        if (img) img.classList.remove('hidden');
      }
    });
  });

  // 3. Copy-to-Clipboard Buttons (Email, Phone)
  const copyButtons = document.querySelectorAll('.copy-btn[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid fa-check';
          setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  });

  // 4. Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const subject = document.getElementById('messageSubject').value.trim();
      const message = document.getElementById('messageBody').value.trim();

      if (!name || !email || !message) {
        if (formFeedback) {
          formFeedback.className = 'form-feedback error';
          formFeedback.textContent = 'Please fill out all required fields.';
        }
        return;
      }

      // Open email client with prefilled values
      const mailtoUrl = `mailto:bsahil979@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry from ' + name)}&body=${encodeURIComponent(
        `Hi Sahil,\n\n${message}\n\nFrom: ${name} (${email})`
      )}`;

      if (formFeedback) {
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = '✓ Opening your email client to dispatch message...';
      }

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }

  // 5. Navbar Sticky, Scroll Progress & Active Section Spy
  const navbar = document.getElementById('navbar');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar background transition
    if (scrollY > 50) {
      navbar.style.background = 'rgba(4, 7, 17, 0.94)';
      navbar.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.background = 'rgba(4, 7, 17, 0.75)';
      navbar.style.boxShadow = 'none';
    }

    // Reading scroll progress percentage
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0 && scrollProgressBar) {
      const progressPercent = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
      scrollProgressBar.style.width = `${progressPercent}%`;
    }

    // Active Section Spy
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      allNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
      });
    }
  }, { passive: true });

  // ==========================================================================
  // Smooth Alternating Left & Right Pop-Up Scroll Reveal System
  // ==========================================================================
  function setupScrollReveals() {
    // 1. Section Headers (Smooth Pop-Up from center bottom)
    document.querySelectorAll('.section-header').forEach(el => {
      el.classList.add('reveal-pop-up');
    });

    // 2. Project Cards (Sequential Stack: Alternating Left & Right Pop-Up)
    // Project 0 (MarketMind AI): Pop-up from LEFT
    // Project 1 (HaritKranti): Pop-up from RIGHT
    // Project 2 (MoM Generator): Pop-up from LEFT
    // Project 3 (Aurizen): Pop-up from RIGHT
    // Project 4 (Stock Pipeline): Pop-up from LEFT
    document.querySelectorAll('.project-card').forEach((card, idx) => {
      if (idx % 2 === 0) {
        card.classList.add('reveal-from-left');
      } else {
        card.classList.add('reveal-from-right');
      }
    });

    // 3. About Cards: Left from left, middle pops up, right from right
    document.querySelectorAll('.about-card').forEach((card, idx) => {
      if (idx === 0) card.classList.add('reveal-from-left');
      else if (idx === 1) card.classList.add('reveal-pop-up');
      else card.classList.add('reveal-from-right');
    });

    // 4. Skills Matrix Categories (Alternating Left & Right)
    document.querySelectorAll('.skill-category').forEach((cat, idx) => {
      if (idx % 2 === 0) {
        cat.classList.add('reveal-from-left');
      } else {
        cat.classList.add('reveal-from-right');
      }
    });

    // 5. Experience Timeline Items (Alternating Left & Right)
    document.querySelectorAll('.timeline-item').forEach((item, idx) => {
      if (idx % 2 === 0) {
        item.classList.add('reveal-from-left');
      } else {
        item.classList.add('reveal-from-right');
      }
    });

    // 6. Contact Card & Form Wrapper
    document.querySelectorAll('.contact-card-wrapper').forEach(el => {
      el.classList.add('reveal-pop-up');
    });

    // Intersection Observer with responsive threshold & margin
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal-from-left, .reveal-from-right, .reveal-pop-up, .reveal-on-scroll').forEach(el => {
      revealObserver.observe(el);
    });
  }

  setupScrollReveals();



  // ==========================================================================
  // 7. 3D Card Tilt & Cursor Spotlight Tracker
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.glass-panel');

  tiltCards.forEach(card => {
    const handleMove = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Update spotlight position
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -((y - centerY) / centerY) * 5.5; // degrees
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    };

    card.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });

    // Touch support for mobile
    card.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // ==========================================================================
  // 8. Magnetic Pull on Buttons & Interactive Pills
  // ==========================================================================
  const magneticEls = document.querySelectorAll('.btn, .action-pill, .chip-btn');

  magneticEls.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease-out';
    });
  });

  // ==========================================================================
  // 9. Interactive 3D Tilt & Lighting on Hero Name
  // ==========================================================================

  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    const nameFirst = heroName.querySelector('.name-first');
    const nameLast = heroName.querySelector('.name-last');

    const handleHeroNameMove = (clientX, clientY) => {
      const rect = heroName.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      // Dynamic 3D tilt angles
      const rotateX = -(y / (rect.height / 2)) * 15;
      const rotateY = (x / (rect.width / 2)) * 20;

      heroName.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      heroName.style.transition = 'transform 0.08s ease-out';

      // 3D Lighting shadow offsets
      const shadowX = -(x * 0.12);
      const shadowY = -(y * 0.12);

      if (nameLast) {
        nameLast.style.textShadow = `
          ${shadowX * 0.25}px ${shadowY * 0.25 + 1}px 0 #cbd5e1,
          ${shadowX * 0.5}px ${shadowY * 0.5 + 2}px 0 #94a3b8,
          ${shadowX * 0.75}px ${shadowY * 0.75 + 3}px 0 #64748b,
          ${shadowX * 1}px ${shadowY * 1 + 4}px 0 #475569,
          0 0 45px rgba(255, 255, 255, 0.6),
          0 15px 40px rgba(0, 0, 0, 0.8)
        `;
      }
      if (nameFirst) {
        nameFirst.style.filter = `
          drop-shadow(${shadowX * 0.5}px ${shadowY * 0.5 + 8}px 25px rgba(251, 146, 60, 0.6))
          drop-shadow(0 0 50px rgba(234, 88, 12, 0.5))
        `;
      }
    };

    heroName.addEventListener('mousemove', (e) => {
      handleHeroNameMove(e.clientX, e.clientY);
    });

    heroName.addEventListener('mouseleave', () => {
      heroName.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      heroName.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2)';

      if (nameLast) {
        nameLast.style.textShadow = '0 0 35px rgba(255, 255, 255, 0.3)';
        nameLast.style.transition = 'text-shadow 0.4s ease';
      }
      if (nameFirst) {
        nameFirst.style.filter = 'drop-shadow(0 6px 30px rgba(251, 146, 60, 0.35))';
        nameFirst.style.transition = 'filter 0.4s ease';
      }
    });

    // Touch support for mobile devices
    heroName.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handleHeroNameMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    heroName.addEventListener('touchend', () => {
      heroName.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (nameLast) nameLast.style.textShadow = '0 0 35px rgba(255, 255, 255, 0.3)';
      if (nameFirst) nameFirst.style.filter = 'drop-shadow(0 6px 30px rgba(251, 146, 60, 0.35))';
    });
  }
});


