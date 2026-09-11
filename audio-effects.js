/**
 * audio-effects.js
 * Procedural ambient night wind & campfire crackle generator using Web Audio API.
 * Completely self-contained, no external audio assets required.
 */

(function () {
  let audioCtx = null;
  let isPlaying = false;
  let crackleInterval = null;
  let windGain = null;
  let masterGain = null;

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');

  function initAudioContext() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // 1. Ambient Low Night Wind Drone
    createNightWindNode();
  }

  function createNightWindNode() {
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to warm deep rumble (180Hz - 320Hz)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, audioCtx.currentTime);

    windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.12, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(masterGain);

    whiteNoise.start();
  }

  // Create a realistic crackle/pop burst
  function playCrackleBurst() {
    if (!audioCtx || !isPlaying) return;

    const burstDuration = Math.random() * 0.04 + 0.01;
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.random() * 2000 + 800, audioCtx.currentTime);
    filter.Q.setValueAtTime(4, audioCtx.currentTime);

    popOsc.type = Math.random() > 0.4 ? 'triangle' : 'sawtooth';
    popOsc.frequency.setValueAtTime(Math.random() * 120 + 80, audioCtx.currentTime);
    popOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + burstDuration);

    const volume = Math.random() * 0.25 + 0.08;
    popGain.gain.setValueAtTime(volume, audioCtx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + burstDuration);

    popOsc.connect(filter);
    filter.connect(popGain);
    popGain.connect(masterGain);

    popOsc.start();
    popOsc.stop(audioCtx.currentTime + burstDuration);
  }

  function startAudio() {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    masterGain.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.4);

    // Continuous random fire crackles
    crackleInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        playCrackleBurst();
      }
      if (Math.random() > 0.7) {
        setTimeout(playCrackleBurst, Math.random() * 80 + 30);
      }
    }, 120);

    // Update UI
    if (audioToggleBtn) {
      audioToggleBtn.classList.add('playing');
    }
    if (audioIcon) {
      audioIcon.classList.remove('fa-volume-xmark');
      audioIcon.classList.add('fa-volume-high');
    }
  }

  function stopAudio() {
    isPlaying = false;
    if (crackleInterval) {
      clearInterval(crackleInterval);
      crackleInterval = null;
    }
    if (masterGain && audioCtx) {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
    }

    // Update UI
    if (audioToggleBtn) {
      audioToggleBtn.classList.remove('playing');
    }
    if (audioIcon) {
      audioIcon.classList.remove('fa-volume-high');
      audioIcon.classList.add('fa-volume-xmark');
    }
  }

  function toggleAudio() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleAudio);
  }
})();
