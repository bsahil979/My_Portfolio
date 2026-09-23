/**
 * hero-core.js
 * Futuristic Procedural 3D Computational Core & Neural Network Matrix
 * Theme: "AI Research Lab × Futuristic Operating System"
 * High-performance Three.js visual with subtle cursor parallax, scroll integration,
 * adaptive device LOD, and zero-overhead teardown.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Detect capability
  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
  const isLowPower = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  // If THREE is not loaded, fallback gracefully
  if (typeof THREE === 'undefined') {
    console.warn('[HeroCore] Three.js not loaded. Graceful fallback active.');
    return;
  }

  let scene, camera, renderer;
  let coreGroup, innerSphere, wireCore, outerRing1, outerRing2, outerRing3, particleSystem;
  let width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
  let height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

  // Mouse & Scroll coordinates
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = 0;
  let targetScrollY = 0;
  let animationFrameId = null;
  let isVisible = true;

  function init() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.0018);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = isMobile ? 32 : 25;
    camera.position.y = 0;

    // 3. Renderer with powerPreference and anti-aliasing
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isLowPower,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLowPower ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 4. Primary Core Group
    coreGroup = new THREE.Group();
    // Offset slightly to the right on desktop to frame the editorial headline on the left
    if (!isMobile && window.innerWidth >= 1024) {
      coreGroup.position.x = 4.2;
    } else {
      coreGroup.position.x = 0;
    }
    scene.add(coreGroup);

    // Build subcomponents
    buildComputationalCore();
    buildOrbitalDataRings();
    buildNeuralParticles();
    buildLighting();

    // Event listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Intersection observer to pause rendering when out of viewport (Performance optimization!)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(canvas.parentElement || canvas);
    }

    animate(0);
  }

  function buildComputationalCore() {
    // 1. Inner Geometric Icosahedron (Representing central compute tensor)
    const innerGeo = new THREE.IcosahedronGeometry(3.6, isLowPower ? 1 : 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x1d283a,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);

    // 2. Core Inner Nucleus (Subtle glowing core)
    const nucleusGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    wireCore = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(wireCore);

    // 3. Node vertices / Points on the icosahedron
    const pointGeo = new THREE.BufferGeometry();
    const pos = innerGeo.attributes.position;
    pointGeo.setAttribute('position', pos.clone());

    const pointMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: isMobile ? 0.18 : 0.24,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const corePoints = new THREE.Points(pointGeo, pointMat);
    coreGroup.add(corePoints);
  }

  function buildOrbitalDataRings() {
    // Ring 1: Equatorial fast telemetry orbit
    const ring1Geo = new THREE.TorusGeometry(5.8, 0.025, 8, isLowPower ? 48 : 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45
    });
    outerRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    outerRing1.rotation.x = Math.PI / 3;
    outerRing1.rotation.y = Math.PI / 6;
    coreGroup.add(outerRing1);

    // Add 3 data node beacons along Ring 1
    const nodeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 3; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i * Math.PI * 2) / 3;
      node.position.set(Math.cos(angle) * 5.8, Math.sin(angle) * 5.8, 0);
      outerRing1.add(node);
    }

    // Ring 2: Polar orbital loop
    const ring2Geo = new THREE.TorusGeometry(7.2, 0.02, 8, isLowPower ? 48 : 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.35
    });
    outerRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    outerRing2.rotation.x = -Math.PI / 4;
    outerRing2.rotation.z = Math.PI / 5;
    coreGroup.add(outerRing2);

    // Ring 3: Distant subtle boundary orbit
    const ring3Geo = new THREE.TorusGeometry(8.8, 0.015, 6, isLowPower ? 40 : 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2
    });
    outerRing3 = new THREE.Mesh(ring3Geo, ring3Mat);
    outerRing3.rotation.y = Math.PI / 3;
    coreGroup.add(outerRing3);
  }

  function buildNeuralParticles() {
    // Latent space embedding particles
    const count = isLowPower ? 160 : 380;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorBlue = new THREE.Color(0x3b82f6);
    const colorIndigo = new THREE.Color(0x6366f1);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorSlate = new THREE.Color(0x94a3b8);

    for (let i = 0; i < count; i++) {
      // Distribute in a spherical cloud surrounding the core
      const radius = 4 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random palette blend
      const r = Math.random();
      let c = colorBlue;
      if (r < 0.35) c = colorCyan;
      else if (r < 0.7) c = colorIndigo;
      else if (r < 0.9) c = colorSlate;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geo, mat);
    coreGroup.add(particleSystem);
  }

  function buildLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 40);
    blueLight.position.set(10, 10, 15);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 1.5, 40);
    violetLight.position.set(-10, -8, -10);
    scene.add(violetLight);
  }

  function onMouseMove(e) {
    if (prefersReducedMotion) return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.targetX = nx * 0.4;
    mouse.targetY = ny * 0.4;
  }

  function onScroll() {
    targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  function onWindowResize() {
    if (!renderer || !camera) return;
    const parent = canvas.parentElement;
    width = parent ? parent.clientWidth : window.innerWidth;
    height = parent ? parent.clientHeight : window.innerHeight;

    camera.aspect = width / height;
    camera.position.z = isMobile ? 32 : 25;

    if (!isMobile && window.innerWidth >= 1024) {
      coreGroup.position.x = 4.2;
    } else {
      coreGroup.position.x = 0;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate(timestamp) {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible) return;

    const time = timestamp * 0.001;

    // Smooth cursor interpolation (Dampening)
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Smooth scroll interpolation
    scrollY += (targetScrollY - scrollY) * 0.08;

    if (!prefersReducedMotion) {
      // Idle rotation
      coreGroup.rotation.y = time * 0.15 + mouse.x;
      coreGroup.rotation.x = time * 0.06 + mouse.y;

      // Inner wireframe counter-rotation
      if (wireCore) {
        wireCore.rotation.y = -time * 0.25;
        wireCore.rotation.z = time * 0.18;
      }

      // Orbital rings rotation
      if (outerRing1) outerRing1.rotation.z = time * 0.35;
      if (outerRing2) outerRing2.rotation.z = -time * 0.22;
      if (outerRing3) outerRing3.rotation.y = time * 0.12;

      // Particle cloud gentle breathing
      if (particleSystem) {
        particleSystem.rotation.y = time * 0.04;
        const scale = 1 + Math.sin(time * 0.8) * 0.03;
        particleSystem.scale.set(scale, scale, scale);
      }

      // Subtle scroll reaction (camera drifts slightly back and pans up smoothly)
      const scrollFactor = Math.min(scrollY / window.innerHeight, 1.5);
      camera.position.y = -scrollFactor * 4;
      camera.position.z = (isMobile ? 32 : 25) + scrollFactor * 6;
      coreGroup.position.y = scrollFactor * 2;
    }

    renderer.render(scene, camera);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup handler for HMR or page teardown
  window.__teardownHeroCore = function () {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    if (renderer) renderer.dispose();
  };
})();
