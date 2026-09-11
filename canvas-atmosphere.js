/**
 * canvas-atmosphere.js
 * Renders the interactive night-sky, mountain silhouettes, glowing moon, 
 * and realistic campfire with rising ember particles.
 */

(function () {
  const canvas = document.getElementById('atmosphereCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // Star Field
  const stars = [];
  const STAR_COUNT = 160;

  // Shooting Star
  let shootingStar = null;
  let lastShootingStarTime = Date.now();

  // Campfire Embers
  const embers = [];
  const EMBER_COUNT = 55;

  // Interactive mouse & touch physics
  let mouse = { x: null, y: null, prevX: null, prevY: null, vx: 0, vy: 0, active: false };
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    initStars();
    initEmbers();
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.8),
        depth: Math.random() * 0.8 + 0.2, // Depth for 3D parallax
        radius: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.65 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.85 ? '#fed7aa' : (Math.random() > 0.65 ? '#bae6fd' : '#ffffff')
      });
    }
  }

  function initEmbers() {
    embers.length = 0;
    const fireX = width * 0.5;
    const fireY = height - 15;

    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push(createEmber(fireX, fireY, true));
    }
  }

  function createEmber(fireX, fireY, randomizeProgress = false, customVx, customVy) {
    const progress = randomizeProgress ? Math.random() : 0;
    return {
      x: fireX + (Math.random() - 0.5) * 60,
      y: fireY - progress * (height * 0.65),
      vx: customVx !== undefined ? customVx : (Math.random() - 0.5) * 0.9,
      vy: customVy !== undefined ? customVy : -(Math.random() * 2.0 + 1.2),
      size: Math.random() * 2.8 + 1.2,
      maxLife: Math.random() * 190 + 100,
      life: randomizeProgress ? Math.floor(Math.random() * 100) : 0,
      swayOffset: Math.random() * 100,
      swaySpeed: Math.random() * 0.045 + 0.02,
      color: Math.random() > 0.45 ? '#ffb703' : (Math.random() > 0.2 ? '#ff7b25' : '#ff3d00')
    };
  }

  // Spawn an immediate burst of sparks at cursor or touch position
  function spawnTouchBurst(posX, posY, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      embers.push({
        x: posX,
        y: posY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 3 + 1.5,
        maxLife: Math.random() * 100 + 60,
        life: 0,
        swayOffset: Math.random() * 100,
        swaySpeed: 0.04,
        color: Math.random() > 0.5 ? '#ffe066' : '#ff9233'
      });
    }
  }

  function spawnShootingStar() {
    const startX = Math.random() * (width * 0.7);
    const startY = Math.random() * (height * 0.35);
    const length = Math.random() * 140 + 80;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

    shootingStar = {
      x: startX,
      y: startY,
      length: length,
      speed: Math.random() * 9 + 13,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      progress: 0,
      maxProgress: 60
    };
  }

  // Draw Background Sky Gradient
  function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#02040a');
    grad.addColorStop(0.45, '#070d1f');
    grad.addColorStop(0.75, '#0d1938');
    grad.addColorStop(1, '#111b33');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Glowing Moon with parallax
  function drawMoon() {
    const moonBaseX = width > 768 ? width * 0.88 : width * 0.82;
    const moonBaseY = height * 0.14;
    const moonX = moonBaseX + currentParallaxX * 8;
    const moonY = moonBaseY + currentParallaxY * 8;
    const moonRadius = width > 768 ? 34 : 25;

    // Deep outer aura
    const outerAura = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 4.8);
    outerAura.addColorStop(0, 'rgba(254, 243, 199, 0.22)');
    outerAura.addColorStop(0.35, 'rgba(253, 230, 138, 0.08)');
    outerAura.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = outerAura;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 4.8, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright moon glow
    const innerAura = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 1.6);
    innerAura.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    innerAura.addColorStop(0.7, 'rgba(254, 240, 138, 0.85)');
    innerAura.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = innerAura;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Solid Moon Disc
    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Moon craters
    ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
    ctx.beginPath();
    ctx.arc(moonX - 6, moonY - 5, moonRadius * 0.28, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY + 4, moonRadius * 0.22, 0, Math.PI * 2);
    ctx.arc(moonX - 4, moonY + 10, moonRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Twinkling Stars with Depth Parallax
  function drawStars(time) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
      const alpha = Math.max(0.1, s.baseAlpha + twinkle * 0.35);

      // Apply subtle 3D parallax
      const starX = s.x + currentParallaxX * s.depth * 25;
      const starY = s.y + currentParallaxY * s.depth * 20;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(starX, starY, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw Shooting Star
  function drawShootingStar() {
    if (!shootingStar) return;

    shootingStar.progress++;
    shootingStar.x += shootingStar.dx * shootingStar.speed;
    shootingStar.y += shootingStar.dy * shootingStar.speed;

    const tailX = shootingStar.x - shootingStar.dx * shootingStar.length;
    const tailY = shootingStar.y - shootingStar.dy * shootingStar.length;

    const alpha = 1 - (shootingStar.progress / shootingStar.maxProgress);
    if (alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
      shootingStar = null;
      return;
    }

    const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.3, `rgba(254, 215, 170, ${alpha * 0.7})`);
    grad.addColorStop(1, 'rgba(254, 215, 170, 0)');

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(shootingStar.x, shootingStar.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Mountain Silhouettes with Parallax
  function drawMountains() {
    const baseH = height;
    const pX = currentParallaxX * 12;

    // Distant mountain ridge
    ctx.fillStyle = '#060a17';
    ctx.beginPath();
    ctx.moveTo(-20, baseH);
    ctx.lineTo(-20, baseH - 120);
    ctx.bezierCurveTo(width * 0.2 + pX * 0.5, baseH - 190, width * 0.4 + pX * 0.5, baseH - 130, width * 0.6 + pX * 0.5, baseH - 220);
    ctx.bezierCurveTo(width * 0.8 + pX * 0.5, baseH - 150, width * 0.95 + pX * 0.5, baseH - 180, width + 20, baseH - 130);
    ctx.lineTo(width + 20, baseH);
    ctx.closePath();
    ctx.fill();

    // Foreground mountain ridge
    ctx.fillStyle = '#03050c';
    ctx.beginPath();
    ctx.moveTo(-20, baseH);
    ctx.lineTo(-20, baseH - 70);
    ctx.bezierCurveTo(width * 0.25 + pX, baseH - 130, width * 0.45 + pX, baseH - 60, width * 0.7 + pX, baseH - 120);
    ctx.bezierCurveTo(width * 0.85 + pX, baseH - 80, width * 0.95 + pX, baseH - 100, width + 20, baseH - 60);
    ctx.lineTo(width + 20, baseH);
    ctx.closePath();
    ctx.fill();
  }

  // Draw Campfire Ground Glow & Realistic Animated Flame
  function drawCampfire(time) {
    const fireX = width * 0.5;
    const fireY = height - 10;
    const flicker = Math.sin(time * 0.08) * 6 + Math.cos(time * 0.12) * 4;

    // 1. Warm radial ground glow
    const glowRadius = Math.max(170, width * 0.32) + flicker * 2.5;
    const fireGlow = ctx.createRadialGradient(fireX, fireY, 10, fireX, fireY, glowRadius);
    fireGlow.addColorStop(0, 'rgba(255, 123, 37, 0.48)');
    fireGlow.addColorStop(0.35, 'rgba(255, 94, 0, 0.26)');
    fireGlow.addColorStop(0.7, 'rgba(230, 57, 70, 0.09)');
    fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(fireX, fireY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Animated flame tongues
    const flameH = 48 + flicker * 1.6;
    const flameW = 28 + flicker * 0.5;

    // Outer Red Flame
    ctx.save();
    ctx.fillStyle = 'rgba(230, 57, 70, 0.88)';
    ctx.beginPath();
    ctx.moveTo(fireX - flameW * 1.2, fireY);
    ctx.quadraticCurveTo(fireX - flameW * 0.6, fireY - flameH * 0.6, fireX, fireY - flameH * 1.2);
    ctx.quadraticCurveTo(fireX + flameW * 0.6, fireY - flameH * 0.6, fireX + flameW * 1.2, fireY);
    ctx.closePath();
    ctx.fill();

    // Mid Orange Flame
    ctx.fillStyle = 'rgba(255, 123, 37, 0.95)';
    ctx.beginPath();
    ctx.moveTo(fireX - flameW * 0.8, fireY);
    ctx.quadraticCurveTo(fireX - flameW * 0.4, fireY - flameH * 0.5, fireX, fireY - flameH);
    ctx.quadraticCurveTo(fireX + flameW * 0.4, fireY - flameH * 0.5, fireX + flameW * 0.8, fireY);
    ctx.closePath();
    ctx.fill();

    // Core Yellow-White Flame
    ctx.fillStyle = 'rgba(255, 240, 138, 0.98)';
    ctx.beginPath();
    ctx.moveTo(fireX - flameW * 0.4, fireY);
    ctx.quadraticCurveTo(fireX - flameW * 0.2, fireY - flameH * 0.35, fireX, fireY - flameH * 0.7);
    ctx.quadraticCurveTo(fireX + flameW * 0.2, fireY - flameH * 0.35, fireX + flameW * 0.4, fireY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw Rising Floating Embers with Fluid Mouse & Touch Physics
  function drawEmbers(time) {
    const fireX = width * 0.5;
    const fireY = height - 15;

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.life++;

      // Natural sway
      const sway = Math.sin(time * e.swaySpeed + e.swayOffset) * 0.75;
      e.x += e.vx + sway;
      e.y += e.vy;

      // Cursor / Touch air draft physics
      if (mouse.active && mouse.x !== null) {
        const dist = Math.hypot(e.x - mouse.x, e.y - mouse.y);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          // Wind velocity push
          e.x += mouse.vx * force * 0.15 + (e.x - mouse.x) * force * 0.05;
          e.y += mouse.vy * force * 0.15 - force * 1.1;
        }
      }

      const lifeProgress = e.life / e.maxLife;
      const alpha = lifeProgress < 0.2 
        ? lifeProgress / 0.2 
        : Math.max(0, 1 - (lifeProgress - 0.2) / 0.8);

      if (e.life >= e.maxLife || e.y < height * 0.15 || e.x < -20 || e.x > width + 20) {
        // If it was an extra burst ember, remove it
        if (embers.length > EMBER_COUNT) {
          embers.splice(i, 1);
          i--;
          continue;
        } else {
          embers[i] = createEmber(fireX, fireY, false);
          continue;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * (1 - lifeProgress * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Main Render Loop
  let frameCount = 0;
  function render() {
    if (isPaused) return;
    frameCount++;
    const time = frameCount;

    // Smooth lerp for parallax
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

    // Decay mouse velocity
    mouse.vx *= 0.88;
    mouse.vy *= 0.88;

    // Check shooting star trigger
    const now = Date.now();
    if (!shootingStar && now - lastShootingStarTime > 5000 && Math.random() < 0.018) {
      spawnShootingStar();
      lastShootingStarTime = now;
    }

    ctx.clearRect(0, 0, width, height);

    drawSky();
    drawStars(time);
    drawShootingStar();
    drawMoon();
    drawMountains();
    drawCampfire(time);
    drawEmbers(time);

    requestAnimationFrame(render);
  }

  // Update mouse state and velocity
  function updatePointer(x, y) {
    if (mouse.prevX !== null && mouse.prevY !== null) {
      mouse.vx = x - mouse.prevX;
      mouse.vy = y - mouse.prevY;
    }
    mouse.prevX = x;
    mouse.prevY = y;
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;

    // Target parallax offset between -1 and 1
    targetParallaxX = (x / width - 0.5) * 2;
    targetParallaxY = (y / height - 0.5) * 2;
  }

  // Event Listeners for fluid mouse and touch
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.prevX = null;
    mouse.prevY = null;
    targetParallaxX = 0;
    targetParallaxY = 0;
  });

  // Touch Support for mobile / touchpads
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      updatePointer(touchX, touchY);
      spawnTouchBurst(touchX, touchY, 14);
    }
  }, { passive: true });

  // Click burst everywhere
  window.addEventListener('click', (e) => {
    // Avoid clicking on interactive buttons triggering unwanted canvas sparks if desired, but sparks on click feel magical
    spawnTouchBurst(e.clientX, e.clientY, 12);
  });

  // Pause canvas atmosphere during initial preloader to give 100% CPU/GPU to the intro
  const sitePreloader = document.getElementById('sitePreloader');
  let isPaused = false;
  if (sitePreloader && !sitePreloader.classList.contains('loaded') && sitePreloader.style.display !== 'none') {
    isPaused = true;
    const observer = new MutationObserver(() => {
      if (sitePreloader.classList.contains('loaded') || sitePreloader.style.display === 'none') {
        isPaused = false;
        observer.disconnect();
        requestAnimationFrame(render);
      }
    });
    observer.observe(sitePreloader, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  // Init
  resize();
  if (!isPaused) {
    render();
  }
})();

