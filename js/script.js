(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- viewport height fix for mobile browser chrome ---------- */
  const setVH = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  /* ---------- confetti / bubble palette ---------- */
  const CONFETTI_COLORS = ['#f5e9d9', '#d9b98a', '#5c1a2b', '#ffffff', '#e8b4c0'];

  function spawnConfetti(layer, count, { wide = false } = {}) {
    if (!layer) return;
    const n = reducedMotion ? 0 : count;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'confetti';
      const angle = wide ? (Math.random() * 2 - 1) * 60 : (Math.random() * 2 - 1) * 100;
      const dist = wide ? 260 + Math.random() * 340 : 120 + Math.random() * 160;
      const rot = 220 + Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1);
      el.style.setProperty('--cx', `${angle}px`);
      el.style.setProperty('--cy', `${dist}px`);
      el.style.setProperty('--cr', `${rot}deg`);
      el.style.left = wide ? `${Math.random() * 100}%` : `${45 + Math.random() * 10}%`;
      el.style.top = wide ? `${Math.random() * 18}%` : '20%';
      el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      el.style.width = `${4 + Math.random() * 6}px`;
      el.style.height = `${9 + Math.random() * 7}px`;
      el.style.borderRadius = '0';
      if (Math.random() < 0.35) {
        el.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      }
      el.style.animationDuration = `${wide ? 1.6 + Math.random() * 1.4 : 1.1 + Math.random() * 0.9}s`;
      el.style.animationDelay = `${Math.random() * (wide ? 0.5 : 0.15)}s`;
      layer.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  function spawnBubbles(layer, count) {
    if (!layer) return;
    const n = reducedMotion ? 0 : count;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'bubble';
      const size = 4 + Math.random() * 8;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${44 + Math.random() * 14}%`;
      el.style.setProperty('--bx', `${(Math.random() * 2 - 1) * 40}px`);
      el.style.animationDuration = `${1 + Math.random() * 0.8}s`;
      el.style.animationDelay = `${Math.random() * 0.4}s`;
      layer.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  /* ---------- ambient background particles ---------- */
  function buildAmbient() {
    const ambient = document.getElementById('ambient');
    if (!ambient) return;

    // soft light glows
    const glowCount = reducedMotion ? 0 : 3;
    for (let i = 0; i < glowCount; i++) {
      const g = document.createElement('div');
      g.className = 'glow';
      const size = 220 + Math.random() * 200;
      g.style.width = `${size}px`;
      g.style.height = `${size}px`;
      g.style.left = `${Math.random() * 90}%`;
      g.style.top = `${Math.random() * 90}%`;
      g.style.background = i % 2 === 0
        ? 'radial-gradient(circle, rgba(232,180,192,.9), transparent 70%)'
        : 'radial-gradient(circle, rgba(217,185,138,.8), transparent 70%)';
      g.style.setProperty('--gx', `${(Math.random() * 2 - 1) * 60}px`);
      g.style.setProperty('--gy', `${(Math.random() * 2 - 1) * 60}px`);
      g.style.animation = `glow-float ${18 + Math.random() * 10}s ease-in-out infinite`;
      g.style.animationDelay = `${Math.random() * -20}s`;
      ambient.appendChild(g);
    }

    // drifting dust / light particles
    const dotCount = reducedMotion ? 0 : 22;
    for (let i = 0; i < dotCount; i++) {
      const d = document.createElement('span');
      d.className = 'dot';
      const size = 1.5 + Math.random() * 2.5;
      d.style.width = `${size}px`;
      d.style.height = `${size}px`;
      d.style.left = `${Math.random() * 100}%`;
      d.style.setProperty('--dot-x', `${(Math.random() * 2 - 1) * 60}px`);
      d.style.setProperty('--dot-op', `${0.25 + Math.random() * 0.35}`);
      d.style.animationDuration = `${16 + Math.random() * 18}s`;
      d.style.animationDelay = `${Math.random() * -30}s`;
      ambient.appendChild(d);
    }
  }
  buildAmbient();

  /* ---------- sound toggle (independent of everything else) ---------- */
  const bgm = document.getElementById('bgm');
  const soundToggle = document.getElementById('sound-toggle');

  soundToggle.addEventListener('click', () => {
    const isOn = soundToggle.getAttribute('aria-pressed') === 'true';
    if (isOn) {
      bgm.pause();
      soundToggle.setAttribute('aria-pressed', 'false');
      soundToggle.setAttribute('aria-label', 'Включи музиката');
    } else {
      bgm.play().catch(() => {
        /* file missing or blocked - silently ignore, UI still toggles off */
        soundToggle.setAttribute('aria-pressed', 'false');
        return;
      });
      soundToggle.setAttribute('aria-pressed', 'true');
      soundToggle.setAttribute('aria-label', 'Спри музиката');
    }
  });

  /* ---------- cork "pop" sound, fully separate from bgm ----------
     Drop an optional assets/pop.mp3 for a real recorded pop; otherwise
     a synthesized noise-burst crack is used automatically. */
  function playSynthPop() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const duration = 0.16;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2400, ctx.currentTime);
      bandpass.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration);
      bandpass.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(bandpass).connect(gain).connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + duration);
      noise.onended = () => ctx.close();
    } catch (e) { /* ignore */ }
  }

  function playPopSound() {
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      playSynthPop();
    };
    try {
      const real = new Audio('assets/pop.mp3');
      real.volume = 0.9;
      real.addEventListener('error', fallback, { once: true });
      const p = real.play();
      if (p && typeof p.then === 'function') p.catch(fallback);
    } catch (e) {
      fallback();
    }
  }

  /* ---------- intro reveal -> celebration sequence ---------- */
  const introScene = document.getElementById('scene-intro');
  const revealBtn = document.getElementById('reveal-btn');
  const bottle = document.getElementById('bottle');
  const cork = document.getElementById('cork');
  const neckFlash = document.getElementById('neck-flash');
  const confettiLayer1 = document.getElementById('confetti-layer-1');
  const bubbleLayer1 = document.getElementById('bubble-layer-1');
  const number26 = document.getElementById('number-26');
  const bdayText = document.getElementById('bday-text');
  const scrollHint = document.getElementById('scroll-hint');

  let celebrationStarted = false;

  function runCelebrationSequence() {
    const t = reducedMotion
      ? { rise: 0, shake: 0, pop: 50, settle: 100, number: 150, text: 200, hint: 250 }
      : { rise: 0, shake: 950, pop: 1550, settle: 1600, number: 2100, text: 2750, hint: 3450 };

    setTimeout(() => bottle.classList.add('rise'), t.rise);
    setTimeout(() => bottle.classList.add('shake'), t.shake);

    setTimeout(() => {
      cork.classList.add('pop');
      neckFlash.classList.add('flash');
      spawnBubbles(bubbleLayer1, 24);
      spawnConfetti(confettiLayer1, 140, { wide: true });
      playPopSound();
    }, t.pop);

    setTimeout(() => {
      spawnConfetti(confettiLayer1, 90, { wide: true });
    }, t.pop + 380);

    setTimeout(() => bottle.classList.add('settle'), t.settle);
    setTimeout(() => number26.classList.add('show'), t.number);
    setTimeout(() => bdayText.classList.add('show'), t.text);
    setTimeout(() => scrollHint.classList.add('show'), t.hint);
  }

  revealBtn.addEventListener('click', () => {
    if (celebrationStarted) return;
    celebrationStarted = true;
    revealBtn.disabled = true;

    introScene.classList.add('hide');
    document.documentElement.classList.remove('locked');
    document.body.classList.remove('locked');

    bgm.play().then(() => {
      soundToggle.setAttribute('aria-pressed', 'true');
      soundToggle.setAttribute('aria-label', 'Спри музиката');
    }).catch(() => {
      /* file missing or autoplay blocked - user can still start it via the toggle */
    });

    runCelebrationSequence();
  });

  /* ---------- photo: graceful fallback if photo.jpg not present yet ---------- */
  const photoFrame = document.querySelector('.photo-frame');
  const mainPhoto = document.getElementById('main-photo');
  if (mainPhoto) {
    mainPhoto.addEventListener('load', () => {
      if (mainPhoto.naturalWidth > 1) photoFrame.classList.add('has-photo');
    });
    mainPhoto.addEventListener('error', () => {
      photoFrame.classList.remove('has-photo');
    });
    if (mainPhoto.complete && mainPhoto.naturalWidth > 1) {
      photoFrame.classList.add('has-photo');
    }
  }

  /* ---------- subtle parallax on the photo ---------- */
  if (!reducedMotion && mainPhoto) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = photoFrame.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height); // 0..1 through viewport
        const offset = (progress - 0.5) * 24; // max ~12px each way
        mainPhoto.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.06)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- scroll reveal (IntersectionObserver) ---------- */
  const revealTargets = document.querySelectorAll('.reveal-up, .word-list, .wish-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach((el) => io.observe(el));

  /* ---------- glass "clink" sound, fully separate from bgm ----------
     Drop an optional assets/clink.mp3 for a real recording; otherwise
     two quick bright synthesized tones are used automatically. */
  function playSynthClink() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const ring = (freq, start, dur, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      };
      ring(2600, 0, 0.5, 0.18);
      ring(3900, 0.01, 0.45, 0.12);
      ring(2300, 0.06, 0.4, 0.1);
      setTimeout(() => ctx.close(), 700);
    } catch (e) { /* ignore */ }
  }

  function playClinkSound() {
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      playSynthClink();
    };
    try {
      const real = new Audio('assets/clink.mp3');
      real.volume = 0.9;
      real.addEventListener('error', fallback, { once: true });
      const p = real.play();
      if (p && typeof p.then === 'function') p.catch(fallback);
    } catch (e) {
      fallback();
    }
  }

  /* ---------- final toast interaction ---------- */
  const toastBtn = document.getElementById('toast-btn');
  const glassesWrap = document.getElementById('glasses-wrap');
  const confettiLayer2 = document.getElementById('confetti-layer-2');
  const finalText = document.getElementById('final-text');

  let toasted = false;

  toastBtn.addEventListener('click', () => {
    if (toasted) return;
    toasted = true;
    toastBtn.disabled = true;

    glassesWrap.classList.add('clinked');

    setTimeout(() => {
      spawnConfetti(confettiLayer2, 20);
      playClinkSound();
    }, 420);

    setTimeout(() => {
      finalText.classList.add('show');
    }, 700);
  });
})();
