/* ============================================================
   NOIR PLAYER — JavaScript
   ============================================================ */

// ── State ─────────────────────────────────────────────────────
let playlist     = [];
let currentIndex = -1;
let isPlaying    = false;
let isShuffle    = false;
let repeatMode   = 0; // 0=off 1=all 2=one
let audioCtx, analyser, source, dataArray;
let animFrameId  = null;

const audio     = document.getElementById('audioEl');
const SUITS     = ['♠','♦','♣','♥'];
const NOTE_SUITS= ['♪','♫','♩','♬'];

// ── Intro: Canvas Particles ───────────────────────────────────
let introParticles = [];
let introAnimId    = null;

function initIntroCanvas() {
  const canvas = document.getElementById('introCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  for (let i = 0; i < 30; i++) introParticles.push(spawnIntroParticle(canvas));

  function spawnIntroParticle(c) {
    return {
      x:     Math.random() * c.width,
      y:     Math.random() * c.height + c.height,
      suit:  NOTE_SUITS[Math.floor(Math.random() * 4)],
      size:  Math.random() * 22 + 10,
      speed: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.5,
      rot:   Math.random() * Math.PI * 2,
      rotS:  (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.08 + 0.03,
      red:   Math.random() > 0.5,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    introParticles.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.red ? `rgba(192,57,43,${p.alpha})` : `rgba(255,255,255,${p.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();
      p.y   -= p.speed;
      p.x   += p.drift;
      p.rot += p.rotS;
      if (p.y < -50) { introParticles.splice(i, 1); introParticles.push(spawnIntroParticle(canvas)); }
    });
    introAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopIntroCanvas() {
  if (introAnimId) { cancelAnimationFrame(introAnimId); introAnimId = null; }
}

// ── Intro: Loading Phase ──────────────────────────────────────
function runLoadingPhase() {
  const bar = document.getElementById('loadBar');
  const pct = document.getElementById('loadPercent');
  let progress = 0;
  const steps = [
    { target: 15, delay: 60 }, { target: 40, delay: 35 },
    { target: 65, delay: 50 }, { target: 85, delay: 25 },
    { target: 97, delay: 60 }, { target: 100, delay: 20 },
  ];
  let stepIdx = 0;
  function tick() {
    if (stepIdx >= steps.length) { setTimeout(transitionToLogo, 300); return; }
    const step = steps[stepIdx];
    if (progress < step.target) {
      progress = Math.min(progress + 1, step.target);
      bar.style.width  = progress + '%';
      pct.textContent  = progress + '%';
      setTimeout(tick, step.delay);
    } else { stepIdx++; tick(); }
  }
  tick();
}

function transitionToLogo() {
  const phLoad = document.getElementById('phase-load');
  const phLogo = document.getElementById('phase-logo');
  phLoad.classList.add('fade-out-ph');
  setTimeout(() => {
    phLoad.classList.add('hidden');
    phLogo.classList.remove('hidden');
    runLogoPhase();
  }, 500);
}

function runLogoPhase() {
  setTimeout(() => document.getElementById('logoLine').classList.add('expand'), 900);
  setTimeout(() => document.getElementById('logoSub').classList.add('show'), 1200);
  document.querySelectorAll('.fan-card').forEach((c, i) =>
    setTimeout(() => c.classList.add('dealt'), 1000 + i * 120)
  );
  setTimeout(() => {
    document.getElementById('enterBtn').classList.add('show');
    document.querySelector('.intro-tagline-final').classList.add('show');
  }, 1700);
}

// ── Enter Site ────────────────────────────────────────────────
function enterSite() {
  const intro = document.getElementById('intro-screen');
  const main  = document.getElementById('main-site');
  stopIntroCanvas();
  intro.classList.add('fade-out');
  main.classList.remove('hidden');
  setTimeout(() => {
    main.classList.add('visible');
    intro.style.display = 'none';
    initMainAnimations();
  }, 900);
}

// ── Main Animations ───────────────────────────────────────────
function initMainAnimations() {
  initCursor();
  initBgCanvas();
  initScrollReveal();
  initDropZone();
}

// ── Custom Cursor ─────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;
  let mx = -100, my = -100, cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  function anim() {
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(anim);
  }
  anim();
  document.querySelectorAll('button, .track-card, .drop-zone, input[type=range]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
  document.addEventListener('mousedown', () => { cursor.classList.add('cursor-click'); cursor.classList.remove('cursor-hover'); });
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor-click'));
}

// ── Background Canvas ─────────────────────────────────────────
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pts = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 18; i++) pts.push(mkPt(canvas));

  function mkPt(c) {
    return {
      x: Math.random() * c.width, y: Math.random() * c.height,
      suit: NOTE_SUITS[Math.floor(Math.random() * 4)],
      size: Math.random() * 16 + 8,
      speed: Math.random() * 0.25 + 0.08,
      drift: (Math.random() - 0.5) * 0.15,
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.006,
      alpha: Math.random() * 0.05 + 0.02,
      red: Math.random() > 0.5,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.red ? `rgba(192,57,43,${p.alpha})` : `rgba(255,255,255,${p.alpha})`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();
      p.y -= p.speed; p.x += p.drift; p.rot += p.rotS;
      if (p.y < -40) { pts.splice(i, 1); pts.push(mkPt(canvas)); }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Drop Zone ─────────────────────────────────────────────────
function initDropZone() {
  const zone  = document.getElementById('dropZone');
  const input = document.getElementById('fileInput');

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles([...e.dataTransfer.files]);
  });
  zone.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') input.click();
  });
  input.addEventListener('change', () => handleFiles([...input.files]));
}

// ── Handle Files ──────────────────────────────────────────────
function handleFiles(files) {
  const audioFiles = files.filter(f => f.type.startsWith('audio/'));
  if (!audioFiles.length) return;

  audioFiles.forEach(file => {
    const url  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, '');
    playlist.push({ name, url, duration: '—', suit: SUITS[Math.floor(Math.random() * 4)] });
  });

  // Get durations async
  playlist.forEach((track, i) => {
    if (track.duration !== '—') return;
    const tmp = new Audio(track.url);
    tmp.addEventListener('loadedmetadata', () => {
      playlist[i].duration = formatTime(tmp.duration);
      renderPlaylist();
    });
  });

  renderPlaylist();
  document.getElementById('playerSection').style.display   = 'flex';
  document.getElementById('playlistSection').style.display = 'block';

  // Re-run scroll reveal for new sections
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));

  if (currentIndex === -1) playTrack(0);
}

// ── Render Playlist ───────────────────────────────────────────
function renderPlaylist() {
  const grid = document.getElementById('playlistGrid');
  grid.innerHTML = '';
  playlist.forEach((track, i) => {
    const isRed = track.suit === '♦' || track.suit === '♥';
    const card  = document.createElement('div');
    card.className = 'track-card' + (i === currentIndex ? ' active' : '');
    card.style.animationDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <div class="tc-top">
        <span class="tc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="tc-suit" style="color:${isRed ? '#c0392b' : 'inherit'}">${track.suit}</span>
      </div>
      <div class="tc-title">${track.name}</div>
      <div class="tc-dur">${track.duration}</div>
    `;
    card.addEventListener('click', () => playTrack(i));
    // Ripple
    card.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
    grid.appendChild(card);
  });
}

// ── Play Track ────────────────────────────────────────────────
function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const track  = playlist[index];

  audio.src = track.url;
  audio.volume = parseFloat(document.getElementById('volSlider').value);
  audio.play().then(() => {
    isPlaying = true;
    updatePlayBtn();
    updateTrackInfo(track);
    updateNowSuit(track.suit);
    renderPlaylist();
    initAudioVisualizer();
  }).catch(() => {});
}

// ── Audio Visualizer (Web Audio API) ─────────────────────────
function initAudioVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }
  if (source) { try { source.disconnect(); } catch(e) {} }
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  if (animFrameId) cancelAnimationFrame(animFrameId);
  drawVisualizer();
}

function drawVisualizer() {
  const canvas = document.getElementById('vizCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  function frame() {
    animFrameId = requestAnimationFrame(frame);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bars   = dataArray.length;
    const barW   = canvas.width / bars;
    const center = canvas.height / 2;

    for (let i = 0; i < bars; i++) {
      const v   = dataArray[i] / 255;
      const h   = v * canvas.height * 0.85;
      const x   = i * barW;
      const alpha = 0.15 + v * 0.7;

      // Mirror bars top & bottom
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(x, center - h / 2, barW - 1, h);
    }

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(canvas.width, center);
    ctx.stroke();
  }
  frame();
}

// ── Playback Controls ─────────────────────────────────────────
function togglePlay() {
  if (!playlist.length) return;
  if (currentIndex === -1) { playTrack(0); return; }
  if (isPlaying) {
    audio.pause(); isPlaying = false;
  } else {
    audio.play(); isPlaying = true;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  updatePlayBtn();
}

function prevTrack() {
  if (!playlist.length) return;
  let idx = isShuffle ? randomIndex() : currentIndex - 1;
  if (idx < 0) idx = playlist.length - 1;
  playTrack(idx);
}

function nextTrack() {
  if (!playlist.length) return;
  if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
  let idx = isShuffle ? randomIndex() : currentIndex + 1;
  if (idx >= playlist.length) {
    if (repeatMode === 1) idx = 0;
    else { isPlaying = false; updatePlayBtn(); return; }
  }
  playTrack(idx);
}

function randomIndex() {
  let idx;
  do { idx = Math.floor(Math.random() * playlist.length); } while (idx === currentIndex && playlist.length > 1);
  return idx;
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  const btn = document.getElementById('repeatBtn');
  btn.classList.toggle('active', repeatMode > 0);
  btn.textContent = repeatMode === 2 ? '↺¹' : '↻';
  btn.title = ['Off','Repeat All','Repeat One'][repeatMode];
}

// ── Audio Events ──────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('currentTime').textContent  = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  document.getElementById('duration').textContent = formatTime(audio.duration);
  if (playlist[currentIndex]) {
    playlist[currentIndex].duration = formatTime(audio.duration);
    renderPlaylist();
  }
});

audio.addEventListener('ended', nextTrack);

// Progress bar click
document.getElementById('progressBar').addEventListener('click', function(e) {
  if (!audio.duration) return;
  const rect = this.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

// Volume slider
document.getElementById('volSlider').addEventListener('input', function() {
  audio.volume = this.value;
  document.getElementById('volLabel').textContent = Math.round(this.value * 100) + '%';
});

// ── UI Helpers ────────────────────────────────────────────────
function updatePlayBtn() {
  document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
}

function updateTrackInfo(track) {
  document.getElementById('trackTitle').textContent  = track.name;
  document.getElementById('trackArtist').textContent = 'Local Track';
}

function updateNowSuit(suit) {
  document.getElementById('nowSuit').textContent = suit;
}

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Keyboard Shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space':      e.preventDefault(); togglePlay();  break;
    case 'ArrowRight': nextTrack();                        break;
    case 'ArrowLeft':  prevTrack();                        break;
    case 'ArrowUp':    {
      const v = document.getElementById('volSlider');
      v.value = Math.min(1, parseFloat(v.value) + 0.05);
      audio.volume = v.value;
      document.getElementById('volLabel').textContent = Math.round(v.value * 100) + '%';
      break;
    }
    case 'ArrowDown':  {
      const v = document.getElementById('volSlider');
      v.value = Math.max(0, parseFloat(v.value) - 0.05);
      audio.volume = v.value;
      document.getElementById('volLabel').textContent = Math.round(v.value * 100) + '%';
      break;
    }
  }
});

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initIntroCanvas();
  runLoadingPhase();
});
