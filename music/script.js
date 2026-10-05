/* ============================================================
   NOIR PLAYER — JavaScript Logic
   Ad-Free YouTube Music Streaming & Interactive YouTube Browser
   ============================================================ */

// ── Configuration & Servers ──────────────────────────────────
const SERVERS = {
  invidious: {
    name: 'Invidious (No Ads)',
    embed: (id) => `https://invidious.f5.si/embed/${id}?autoplay=1`,
    apiSearch: 'https://invidious.f5.si/api/v1/search?q='
  },
  piped: {
    name: 'Yewtu.be',
    embed: (id) => `https://yewtu.be/embed/${id}?autoplay=1`,
    apiSearch: 'https://yewtu.be/api/v1/search?q='
  },
  nocookie: {
    name: 'YouTube Clean',
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`,
    apiSearch: null
  }
};

const PORTAL_URLS = {
  trending: 'https://piped.video/trending',
  home: 'https://piped.video',
  invidious: 'https://invidious.f5.si/feed/trending'
};

let activeServer = 'invidious';
let currentVideoId = null;
let queue = [];
let currentIndex = -1;
let isLoop = false;
let recentPlays = [];
let currentView = 'cards';

const SUITS = ['♠', '♦', '♣', '♥'];
const NOTE_SUITS = ['♪', '♫', '♩', '♬', '♠', '♥', '♣', '♦'];

// ── Rich Curated Music Catalog (Ready to Play Instantly) ──────
const SONG_CATALOG = {
  thai: [
    { id: '1-2nVU8_438', title: 'ถ้าเธอรักฉันจริง (If You Really Love Me)', channel: 'Three Man Down', duration: '4:15' },
    { id: 'p3pGj2cQ9z4', title: 'ถ้าเราเจอกันอีก (Until Then)', channel: 'Tilly Birds', duration: '4:46' },
    { id: 'yT87W8O0m5M', title: 'เธอ (She)', channel: 'COCKTAIL', duration: '4:42' },
    { id: 'l2qZ3U50BqE', title: 'แสงสุดท้าย (The Last Light)', channel: 'Bodyslam', duration: '4:43' },
    { id: 'Zl4aG4bC2lE', title: 'ลืมไปแล้วว่าลืมยังไง (Fade)', channel: 'Jeff Satur', duration: '3:50' },
    { id: 'X5l1e7y1U8s', title: 'พิง (Lean On)', channel: 'NONT TANONT', duration: '4:17' }
  ],
  lofi: [
    { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio 📚 beats to relax/study to', channel: 'Lofi Girl', duration: 'LIVE 24/7' },
    { id: 'rUxyKA_-dbM', title: 'synthwave radio 🌌 chill beats to relax to', channel: 'Lofi Girl', duration: 'LIVE 24/7' },
    { id: '5yx6BWlEVcY', title: 'Chillhop Radio - jazzy & lofi hip hop beats', channel: 'Chillhop Music', duration: 'LIVE 24/7' },
    { id: 'lTRiuFIWV54', title: '1 A.M Study Session 📚 [lofi hip hop/chill beats]', channel: 'Lofi Girl', duration: '1:01:20' },
    { id: 'TURbeWK2wwg', title: 'Coffee Shop Radio ☕ 24/7 lofi hip-hop beats', channel: 'STEEZYASFUCK', duration: 'LIVE 24/7' },
    { id: 'W6YI3BFn1VU', title: 'Rainy Night Coffee Shop - Relaxing Jazz & Lofi', channel: 'Coffee Relaxing Jazz', duration: '3:24:12' }
  ],
  gaming: [
    { id: 'AOeY-nDp7hI', title: 'The Spectre', channel: 'Alan Walker', duration: '3:26' },
    { id: '60ItHLz5WEA', title: 'Faded', channel: 'Alan Walker', duration: '3:32' },
    { id: 'n8X9_MgEdCg', title: 'Unity', channel: 'TheFatRat', duration: '4:09' },
    { id: 'c5daGZ96QGU', title: 'Legends Never Die (ft. Against The Current)', channel: 'League of Legends', duration: '3:55' },
    { id: 'wDgQdr8ZkTw', title: 'Megalovania (Undertale OST)', channel: 'Toby Fox', duration: '2:36' },
    { id: 'fmI_Ndrxy14', title: 'Warriors (ft. Imagine Dragons)', channel: 'League of Legends', duration: '2:50' }
  ],
  phonk: [
    { id: 'w-sQRS-Um98', title: 'Murder In My Mind', channel: 'Kordhell', duration: '2:25' },
    { id: 'ao4RCon2S44', title: 'Close Eyes', channel: 'DVRST', duration: '2:12' },
    { id: 'X31J8g-rZ7Y', title: 'Sahara', channel: 'Hensonn', duration: '2:51' },
    { id: 'oGg5yKfZW1o', title: 'METAMORPHOSIS', channel: 'INTERWORLD', duration: '2:23' },
    { id: 'OXh8tZf8a3I', title: 'Can You Feel My Heart (GigaChad Theme)', channel: 'Bring Me The Horizon', duration: '3:48' },
    { id: '1_0vA94gT6s', title: 'Disaster', channel: 'KSLV Noh', duration: '1:50' }
  ],
  global: [
    { id: '4NRXx6U8ABQ', title: 'Blinding Lights', channel: 'The Weeknd', duration: '3:20' },
    { id: 'JGwWNGJdvx8', title: 'Shape of You', channel: 'Ed Sheeran', duration: '3:53' },
    { id: '7wtfhZwyrcc', title: 'Believer', channel: 'Imagine Dragons', duration: '3:24' },
    { id: 'wXhTHyIgQ_U', title: 'Circles', channel: 'Post Malone', duration: '3:35' },
    { id: 'kTJczUoc26U', title: 'STAY (with Justin Bieber)', channel: 'The Kid LAROI', duration: '2:21' },
    { id: 'TUVcZfQe-Kw', title: 'Levitating', channel: 'Dua Lipa', duration: '3:23' }
  ],
  anime: [
    { id: 'ZRtdQ81jPUQ', title: 'アイドル (IDOL)', channel: 'YOASOBI', duration: '3:46' },
    { id: 'CwkzK-F0SW0', title: '紅蓮華 (Gurenge - Demon Slayer OP)', channel: 'LiSA', duration: '3:58' },
    { id: 'KpsJWFuVTdI', title: 'Blue Bird (Naruto Shippuden OP)', channel: 'Ikimonogakari', duration: '3:36' },
    { id: '7aMOurgDB-o', title: 'unravel (Tokyo Ghoul OP)', channel: 'TK from 凛として時雨', duration: '4:00' },
    { id: 'dFfv4hCknYI', title: '死ぬのがいいわ (Shinunoga E-Wa)', channel: 'Fujii Kaze', duration: '3:05' },
    { id: 'M2cckDmNLMI', title: 'KICK BACK (Chainsaw Man OP)', channel: 'Kenshi Yonezu', duration: '3:13' }
  ],
  rock: [
    { id: 'eVTXPUF4Oz4', title: 'In The End', channel: 'Linkin Park', duration: '3:36' },
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', channel: 'Queen', duration: '5:55' },
    { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', channel: 'Nirvana', duration: '5:01' },
    { id: 'pAgnJDJN4VA', title: 'Back In Black', channel: 'AC/DC', duration: '4:15' },
    { id: '1w7OgIMMRc4', title: 'Sweet Child O Mine', channel: "Guns N' Roses", duration: '5:03' },
    { id: 'lDK9QqIzhwk', title: "Livin' On A Prayer", channel: 'Bon Jovi', duration: '4:08' }
  ]
};

// ─────────────────────────────────────────────────────────────
// 1. CINEMATIC INTRO ENGINE
// ─────────────────────────────────────────────────────────────
let introParticles = [];
let introAnimId = null;

function initIntroCanvas() {
  const canvas = document.getElementById('introCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 32; i++) introParticles.push(createIntroParticle(canvas));

  function createIntroParticle(c) {
    return {
      x: Math.random() * c.width,
      y: Math.random() * c.height + c.height,
      suit: NOTE_SUITS[Math.floor(Math.random() * NOTE_SUITS.length)],
      size: Math.random() * 22 + 10,
      speed: Math.random() * 0.5 + 0.2,
      drift: (Math.random() - 0.5) * 0.4,
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.08 + 0.03,
      isRed: Math.random() > 0.65
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    introParticles.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.isRed
        ? `rgba(192, 57, 43, ${p.alpha})`
        : `rgba(255, 255, 255, ${p.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();

      p.y -= p.speed;
      p.x += p.drift;
      p.rot += p.rotS;

      if (p.y < -50) {
        introParticles.splice(i, 1);
        introParticles.push(createIntroParticle(canvas));
      }
    });
    introAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopIntroCanvas() {
  if (introAnimId) {
    cancelAnimationFrame(introAnimId);
    introAnimId = null;
  }
}

function runLoadingPhase() {
  const bar = document.getElementById('loadBar');
  const pct = document.getElementById('loadPercent');
  let progress = 0;
  const milestones = [
    { target: 15, delay: 50 },
    { target: 40, delay: 30 },
    { target: 68, delay: 40 },
    { target: 88, delay: 20 },
    { target: 98, delay: 50 },
    { target: 100, delay: 15 }
  ];
  let stepIndex = 0;

  function step() {
    if (stepIndex >= milestones.length) {
      setTimeout(transitionToLogo, 250);
      return;
    }
    const ms = milestones[stepIndex];
    if (progress < ms.target) {
      progress = Math.min(progress + 1, ms.target);
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = progress + '%';
      setTimeout(step, ms.delay);
    } else {
      stepIndex++;
      step();
    }
  }
  step();
}

function transitionToLogo() {
  const phLoad = document.getElementById('phase-load');
  const phLogo = document.getElementById('phase-logo');
  if (phLoad) phLoad.classList.add('fade-out-ph');

  setTimeout(() => {
    if (phLoad) phLoad.classList.add('hidden');
    if (phLogo) phLogo.classList.remove('hidden');
    runLogoPhase();
  }, 450);
}

function runLogoPhase() {
  setTimeout(() => {
    const line = document.getElementById('logoLine');
    if (line) line.classList.add('expand');
  }, 850);

  setTimeout(() => {
    const sub = document.getElementById('logoSub');
    if (sub) sub.classList.add('show');
  }, 1150);

  // Stagger card deals
  const cards = document.querySelectorAll('.fan-card');
  cards.forEach((card, idx) => {
    setTimeout(() => card.classList.add('dealt'), 950 + idx * 110);
  });

  // Glitch effect on letters
  setTimeout(() => {
    document.querySelectorAll('.logo-letter').forEach(l => l.classList.add('glitch'));
  }, 1300);

  // Show Enter Button
  setTimeout(() => {
    const enterBtn = document.getElementById('enterBtn');
    const tagline  = document.querySelector('.intro-tagline-final');
    if (enterBtn) enterBtn.classList.add('show');
    if (tagline) tagline.classList.add('show');
  }, 1650);
}

function enterSite() {
  const intro = document.getElementById('intro-screen');
  const main  = document.getElementById('main-site');

  stopIntroCanvas();
  if (intro) intro.classList.add('fade-out');
  if (main)  main.classList.remove('hidden');

  setTimeout(() => {
    if (main)  main.classList.add('visible');
    if (intro) intro.style.display = 'none';
    initMainAnimations();
    loadCategory('thai');
    loadSavedData();
  }, 850);
}

// ─────────────────────────────────────────────────────────────
// 2. VIEW SWITCHER (Cards vs Full YouTube Browser)
// ─────────────────────────────────────────────────────────────
function switchView(mode) {
  currentView = mode;
  const tabCards  = document.getElementById('tabCards');
  const tabPortal = document.getElementById('tabPortal');
  const viewCards = document.getElementById('viewCards');
  const viewPortal= document.getElementById('viewPortal');
  const pIframe   = document.getElementById('portalIframe');

  if (mode === 'cards') {
    tabCards.classList.add('active');
    tabPortal.classList.remove('active');
    viewCards.classList.remove('hidden');
    viewPortal.classList.add('hidden');
  } else {
    tabPortal.classList.add('active');
    tabCards.classList.remove('active');
    viewPortal.classList.remove('hidden');
    viewCards.classList.add('hidden');

    // Load portal if not loaded yet
    if (pIframe && (pIframe.src === 'about:blank' || !pIframe.src)) {
      pIframe.src = PORTAL_URLS.trending;
    }
  }
}

function reloadPortal(action) {
  const pIframe = document.getElementById('portalIframe');
  if (!pIframe) return;

  if (action === 'trending') pIframe.src = PORTAL_URLS.trending;
  else if (action === 'home') pIframe.src = PORTAL_URLS.home;
  else if (action === 'refresh') pIframe.src = pIframe.src;
}

function togglePortalFullscreen() {
  const wrap = document.getElementById('portalFrameWrap');
  if (wrap) wrap.classList.toggle('fullscreen');
}

// ─────────────────────────────────────────────────────────────
// 3. MAIN AMBIENT ANIMATIONS
// ─────────────────────────────────────────────────────────────
function initMainAnimations() {
  initCursor();
  initBgCanvas();
  initScrollReveal();
  initSearchInput();
  initCardTilt();
}

function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  let mouseX = -100, mouseY = -100;
  let curX = -100, curY = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function smooth() {
    curX += (mouseX - curX) * 0.14;
    curY += (mouseY - curY) * 0.14;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(smooth);
  }
  smooth();

  function bindHover(elements) {
    elements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }
  bindHover(document.querySelectorAll('button, a, input, .result-card, .catalog-card, .queue-item, .cat-chip'));

  document.addEventListener('mousedown', () => {
    cursor.classList.add('cursor-click');
    cursor.classList.remove('cursor-hover');
  });
  document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));
}

function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pts = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 24; i++) pts.push(createBgPt(canvas));

  function createBgPt(c) {
    return {
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      suit: NOTE_SUITS[Math.floor(Math.random() * NOTE_SUITS.length)],
      size: Math.random() * 16 + 8,
      speed: Math.random() * 0.25 + 0.08,
      drift: (Math.random() - 0.5) * 0.15,
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.006,
      alpha: Math.random() * 0.05 + 0.02,
      isRed: Math.random() > 0.6
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.isRed
        ? `rgba(192, 57, 43, ${p.alpha})`
        : `rgba(255, 255, 255, ${p.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();

      p.y -= p.speed;
      p.x += p.drift;
      p.rot += p.rotS;

      if (p.y < -40) {
        pts.splice(i, 1);
        pts.push(createBgPt(canvas));
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initCardTilt() {
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.album-art-card, .result-card, .catalog-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.6) {
        const tiltX = dy * 6;
        const tiltY = -dx * 6;
        card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
      } else {
        card.style.transform = '';
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.album-art-card, .result-card, .catalog-card').forEach(c => c.style.transform = '');
  });
}

// ─────────────────────────────────────────────────────────────
// 4. CURATED SONG CATALOG TABS
// ─────────────────────────────────────────────────────────────
function loadCategory(catKey, btn) {
  if (btn) {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }

  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const songs = SONG_CATALOG[catKey] || SONG_CATALOG.thai;

  songs.forEach((song, i) => {
    const thumb = `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`;
    const randSuit = SUITS[i % SUITS.length];
    const isRed = randSuit === '♦' || randSuit === '♥';

    const card = document.createElement('div');
    card.className = 'catalog-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <span class="card-suit-badge" style="color:${isRed ? '#c0392b' : 'inherit'}">${randSuit}</span>
      <div class="result-thumb-wrap">
        <img class="result-thumb" src="${thumb}" alt="" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${song.id}/mqdefault.jpg'"/>
        <div class="result-play-overlay">
          <div class="result-play-icon">▶</div>
        </div>
        <span class="result-duration-badge">${song.duration}</span>
      </div>
      <div class="result-info">
        <div class="result-title">${escHtml(song.title)}</div>
        <div class="result-channel">${escHtml(song.channel)}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      triggerRipple(card);
      addToQueueAndPlay({
        id: song.id,
        title: song.title,
        channel: song.channel,
        thumb: thumb,
        duration: song.duration
      });
    });

    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────
// 5. SEARCH & AUTOCOMPLETE
// ─────────────────────────────────────────────────────────────
let suggestDebounce = null;

function initSearchInput() {
  const input = document.getElementById('searchInput');
  const list  = document.getElementById('suggestionsList');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (list) list.classList.add('hidden');
      handleSearch();
    }
  });

  input.addEventListener('input', () => {
    const val = input.value.trim();

    const vid = extractVideoId(val);
    if (vid) {
      if (list) list.classList.add('hidden');
      setTimeout(() => {
        if (input.value.trim() === val) playVideoById(vid);
      }, 350);
      return;
    }

    clearTimeout(suggestDebounce);
    if (val.length < 2) {
      if (list) list.classList.add('hidden');
      return;
    }

    suggestDebounce = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-container') && list) {
      list.classList.add('hidden');
    }
  });
}

async function fetchSuggestions(query) {
  const list = document.getElementById('suggestionsList');
  if (!list) return;

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const suggestions = data[1] || [];

    if (!suggestions.length) {
      list.classList.add('hidden');
      return;
    }

    list.innerHTML = '';
    suggestions.slice(0, 6).forEach(s => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `<span>🎵</span><span>${escHtml(s)}</span>`;
      item.addEventListener('click', () => {
        document.getElementById('searchInput').value = s;
        list.classList.add('hidden');
        handleSearch();
      });
      list.appendChild(item);
    });
    list.classList.remove('hidden');
  } catch (e) {
    if (list) list.classList.add('hidden');
  }
}

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      document.getElementById('searchInput').value = text.trim();
      handleSearch();
    }
  } catch (e) {
    document.getElementById('searchInput').focus();
  }
}

function handleSearch() {
  const input = document.getElementById('searchInput');
  const val   = input.value.trim();
  if (!val) return;

  const vid = extractVideoId(val);
  if (vid) {
    playVideoById(vid);
    return;
  }

  performSearch(val);
}

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

async function performSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  resultsEl.classList.remove('hidden');
  resultsEl.innerHTML = '<div class="search-loading">SEARCHING YOUTUBE DIRECTLY</div>';

  const instances = [
    'https://invidious.f5.si',
    'https://yewtu.be'
  ];

  for (const inst of instances) {
    try {
      const url = `${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        renderSearchResults(data);
        return;
      }
    } catch (e) {
      continue;
    }
  }

  resultsEl.innerHTML = `
    <div class="search-loading" style="color:var(--silver);">
      No direct search results found. You can switch to the <strong>"YOUTUBE BROWSER"</strong> tab above to browse YouTube live without ads!
    </div>
  `;
}

function renderSearchResults(items) {
  const resultsEl = document.getElementById('searchResults');
  resultsEl.innerHTML = '';

  const validItems = items.filter(it => it.type === 'video' || it.videoId).slice(0, 12);
  if (!validItems.length) {
    resultsEl.innerHTML = '<div class="search-loading">No videos found.</div>';
    return;
  }

  validItems.forEach((item, i) => {
    const vid = item.videoId;
    const title = item.title || 'Untitled Track';
    const channel = item.author || 'YouTube';
    const durSec = item.lengthSeconds || 0;
    const dur = formatSeconds(durSec);
    const thumb = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
    const randSuit = SUITS[i % SUITS.length];
    const isRed = randSuit === '♦' || randSuit === '♥';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <span class="card-suit-badge" style="color:${isRed ? '#c0392b' : 'inherit'}">${randSuit}</span>
      <div class="result-thumb-wrap">
        <img class="result-thumb" src="${thumb}" alt="" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${vid}/mqdefault.jpg'"/>
        <div class="result-play-overlay">
          <div class="result-play-icon">▶</div>
        </div>
        <span class="result-duration-badge">${dur}</span>
      </div>
      <div class="result-info">
        <div class="result-title">${escHtml(title)}</div>
        <div class="result-channel">${escHtml(channel)}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      triggerRipple(card);
      addToQueueAndPlay({
        id: vid,
        title: title,
        channel: channel,
        thumb: thumb,
        duration: dur
      });
    });

    resultsEl.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────
// 6. PLAYBACK & EMBED ENGINE
// ─────────────────────────────────────────────────────────────
function playVideoById(vid) {
  const track = {
    id: vid,
    title: 'Loading Track...',
    channel: 'YouTube Audio',
    thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
    duration: '—'
  };

  addToQueueAndPlay(track);

  fetch(`https://invidious.f5.si/api/v1/videos/${vid}`, { signal: AbortSignal.timeout(4000) })
    .then(r => r.json())
    .then(data => {
      if (data.title) {
        track.title   = data.title;
        track.channel = data.author || 'YouTube';
        track.duration = formatSeconds(data.lengthSeconds || 0);
        updateTrackDisplay(track);
        renderQueue();
        saveRecent(track);
      }
    })
    .catch(() => {});
}

function addToQueueAndPlay(track) {
  currentVideoId = track.id;

  const existsIdx = queue.findIndex(t => t.id === track.id);
  if (existsIdx !== -1) queue.splice(existsIdx, 1);

  queue.unshift(track);
  currentIndex = 0;

  loadEmbed(track.id);
  updateTrackDisplay(track);
  renderQueue();
  saveRecent(track);
  showPlayer();
}

function loadEmbed(vid) {
  currentVideoId = vid;
  const iframe = document.getElementById('ytPlayer');
  if (!iframe) return;

  const serverConfig = SERVERS[activeServer] || SERVERS.invidious;
  iframe.src = serverConfig.embed(vid);

  const serverDisplay = document.getElementById('currentServerName');
  if (serverDisplay) serverDisplay.textContent = serverConfig.name;
}

function setServer(serverKey) {
  if (!SERVERS[serverKey]) return;
  activeServer = serverKey;

  document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`srv${serverKey.charAt(0).toUpperCase() + serverKey.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  if (currentVideoId) {
    loadEmbed(currentVideoId);
  }
}

function updateTrackDisplay(track) {
  const titleEl  = document.getElementById('trackTitle');
  const artistEl = document.getElementById('trackArtist');
  const imgEl    = document.getElementById('albumArt');

  if (titleEl)  titleEl.textContent  = track.title;
  if (artistEl) artistEl.textContent = track.channel;

  if (imgEl) {
    imgEl.src = track.thumb;
    imgEl.style.opacity = '0';
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
  }

  const randSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const isRed = randSuit === '♦' || randSuit === '♥';

  const badge = document.getElementById('albumSuitBadge');
  if (badge) {
    badge.textContent = randSuit;
    badge.style.color = isRed ? '#c0392b' : 'inherit';
  }

  const cTL = document.getElementById('cornerSuitTL');
  const cBR = document.getElementById('cornerSuitBR');
  if (cTL) { cTL.textContent = randSuit; cTL.style.color = isRed ? '#c0392b' : 'inherit'; }
  if (cBR) { cBR.textContent = randSuit; cBR.style.color = isRed ? '#c0392b' : 'inherit'; }

  document.title = `▶ ${track.title} · NOIR PLAYER`;
}

function showPlayer() {
  const sec = document.getElementById('playerSection');
  if (sec) {
    sec.classList.remove('hidden');
    sec.classList.add('visible');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─────────────────────────────────────────────────────────────
// 7. QUEUE & PERSISTENCE
// ─────────────────────────────────────────────────────────────
function renderQueue() {
  const list  = document.getElementById('queueList');
  const count = document.getElementById('queueCount');
  if (!list) return;

  if (count) count.textContent = `(${queue.length})`;
  list.innerHTML = '';

  if (!queue.length) {
    list.innerHTML = '<div style="color:var(--silver); font-size:0.75rem; padding:0.5rem 0;">Queue is empty.</div>';
    return;
  }

  queue.forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item' + (i === currentIndex ? ' active' : '');
    item.innerHTML = `
      <div class="qi-num">${i === currentIndex ? '▶' : String(i + 1).padStart(2, '0')}</div>
      <img class="qi-thumb" src="${track.thumb}" alt="" loading="lazy"/>
      <div class="qi-info">
        <div class="qi-title">${escHtml(track.title)}</div>
        <div class="qi-channel">${escHtml(track.channel)}</div>
      </div>
      <div class="qi-dur">${track.duration}</div>
      <button class="qi-del-btn" title="Remove from queue" onclick="event.stopPropagation(); removeFromQueue(${i});">&times;</button>
    `;

    item.addEventListener('click', () => {
      currentIndex = i;
      loadEmbed(track.id);
      updateTrackDisplay(track);
      renderQueue();
    });

    list.appendChild(item);
  });
}

function removeFromQueue(index) {
  if (index < 0 || index >= queue.length) return;
  queue.splice(index, 1);
  if (currentIndex >= queue.length) currentIndex = queue.length - 1;
  renderQueue();
}

function clearQueue() {
  queue = [];
  currentIndex = -1;
  renderQueue();
}

function nextInQueue() {
  if (!queue.length) return;
  if (isLoop && currentIndex !== -1) {
    loadEmbed(queue[currentIndex].id);
    return;
  }
  currentIndex = (currentIndex + 1) % queue.length;
  const track = queue[currentIndex];
  loadEmbed(track.id);
  updateTrackDisplay(track);
  renderQueue();
}

function prevInQueue() {
  if (!queue.length) return;
  currentIndex = (currentIndex - 1 + queue.length) % queue.length;
  const track = queue[currentIndex];
  loadEmbed(track.id);
  updateTrackDisplay(track);
  renderQueue();
}

function toggleLoop() {
  isLoop = !isLoop;
  const btn = document.getElementById('loopBtn');
  if (btn) {
    btn.classList.toggle('active', isLoop);
    btn.textContent = isLoop ? '🔂 LOOP ON' : '🔁 LOOP';
  }
}

function saveRecent(track) {
  recentPlays = recentPlays.filter(t => t.id !== track.id);
  recentPlays.unshift(track);
  if (recentPlays.length > 8) recentPlays.pop();

  try {
    localStorage.setItem('noir_recent_plays', JSON.stringify(recentPlays));
  } catch (e) {}
  renderRecent();
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem('noir_recent_plays');
    if (saved) {
      recentPlays = JSON.parse(saved);
      renderRecent();
    }
  } catch (e) {}
}

function renderRecent() {
  const section = document.getElementById('recentSection');
  const grid    = document.getElementById('recentGrid');
  if (!section || !grid) return;

  if (!recentPlays.length) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  grid.innerHTML = '';

  recentPlays.forEach(track => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-thumb-wrap">
        <img class="result-thumb" src="${track.thumb}" alt="" loading="lazy"/>
        <div class="result-play-overlay">
          <div class="result-play-icon">▶</div>
        </div>
        <span class="result-duration-badge">${track.duration}</span>
      </div>
      <div class="result-info">
        <div class="result-title">${escHtml(track.title)}</div>
        <div class="result-channel">${escHtml(track.channel)}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      triggerRipple(card);
      addToQueueAndPlay(track);
    });

    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────
// 8. KEYBOARD SHORTCUTS & HELPERS
// ─────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;

  if (e.key === '/' || e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') nextInQueue();
  if (e.key === 'ArrowLeft'  || e.key === 'p' || e.key === 'P') prevInQueue();
  if (e.key === 'l' || e.key === 'L') toggleLoop();
});

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerRipple(el) {
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px; height:${size}px; left:${size / 2}px; top:${size / 2}px;`;
  el.style.position = 'relative';
  el.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

// ─────────────────────────────────────────────────────────────
// 9. BOOTSTRAP
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initIntroCanvas();
  runLoadingPhase();
});
