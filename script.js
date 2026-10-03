/* ============================================================
   CODM GUN ROULETTE — JavaScript Logic
   ============================================================ */

// ── Weapon Database ──────────────────────────────────────────
const WEAPONS = {
  AR: [
    "ASM10", "TYPE25", "M16", "AK117", "M4", "BK57", "LK24", "ICR-1",
    "Man-o-war", "KN-44", "HBRA3", "HVK-30", "DRH", "Peacekeeper-MK2",
    "ASVAL", "M13", "Swordfish", "Kilo141", "Oden", "Keig6", "EM2",
    "Maddog", "FFAR1", "Grau5.56", "Groza", "TYPE19", "BP50", "XM4",
    "Vargo-s", "RAM-7", "Lacman-556", "BAL-27", "IS-Hemlock", "Cronen-Squall"
  ],
  Sniper: [
    "XPR-50", "Arctic", "M21", "DLQ", "NA-45", "LOCUS", "Outlaw",
    "Rytec-AMR", "SVD", "Koshka", "ZRG", "HDR", "LW3", "3-Line"
  ],
  LMG: [
    "S36", "UL736", "RPD", "M4LMG", "Chopper", "Holger-26", "Hades",
    "PKM", "Dingo", "MK9", "MG42", "RAAL-MG", "NG82", "DP27"
  ],
  SMG: [
    "RUS79", "Chicom", "PDW", "Razorback", "MSMC", "HG40", "Pharo",
    "GKS", "Cordite", "QQ9", "Fennec", "AGR556", "QXR", "PP19",
    "MX9", "CBR4", "PPSh-41", "MAC-10", "KSP-45", "X9", "LAPA",
    "OTs9", "Striker-45", "CX-9", "TEC-9", "ISO", "USS", "VMP",
    "Sten", "LC10", "FSS", "Static-HV"
  ],
  Shotgun: [
    "HS2126", "BY15", "HS04045", "Striker", "KRM", "Echo",
    "R9", "JAK12", "Argus", "VLK", "Einhorn", "MX-Guardian"
  ],
  Marksman: [
    "Kilo-Bolt", "SKS", "SPR", "MK2", "TYPE-63", "M1", "SO14"
  ]
};

const SUITS = ["♠", "♦", "♣", "♥"];
const SUIT_COLORS = { "♠": "black", "♦": "red", "♣": "black", "♥": "red" };

let playerCount = 3;
let spinning = false;

// ── CINEMATIC INTRO ENGINE ────────────────────────────────────

// ── Canvas Particle System ────────────────────────────────────
const PARTICLE_SUITS = ['♠','♦','♣','♥'];
let particles = [];
let animFrameId = null;

function initCanvas() {
  const canvas = document.getElementById('introCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Spawn particles
  for (let i = 0; i < 28; i++) spawnParticle(canvas);

  function spawnParticle(c) {
    particles.push({
      x:     Math.random() * c.width,
      y:     Math.random() * c.height + c.height,
      suit:  PARTICLE_SUITS[Math.floor(Math.random() * 4)],
      size:  Math.random() * 22 + 10,
      speed: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.5,
      rot:   Math.random() * Math.PI * 2,
      rotS:  (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.08 + 0.03,
      red:   Math.random() > 0.5,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, idx) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.red
        ? `rgba(192,57,43,${p.alpha})`
        : `rgba(255,255,255,${p.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();

      p.y   -= p.speed;
      p.x   += p.drift;
      p.rot += p.rotS;

      if (p.y < -50) {
        particles.splice(idx, 1);
        spawnParticle(canvas);
      }
    });
    animFrameId = requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

function stopCanvas() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
}

// ── Phase 1: Loading Bar ──────────────────────────────────────
function runLoadingPhase() {
  const bar     = document.getElementById('loadBar');
  const pct     = document.getElementById('loadPercent');
  let progress  = 0;
  const steps   = [
    { target: 15, delay: 60 },
    { target: 40, delay: 35 },
    { target: 65, delay: 50 },
    { target: 85, delay: 25 },
    { target: 97, delay: 60 },
    { target: 100, delay: 20 },
  ];
  let stepIdx = 0;

  function tick() {
    if (stepIdx >= steps.length) {
      // Loading done → transition to logo phase
      setTimeout(transitionToLogo, 300);
      return;
    }
    const step = steps[stepIdx];
    if (progress < step.target) {
      progress = Math.min(progress + 1, step.target);
      bar.style.width   = progress + '%';
      pct.textContent   = progress + '%';
      setTimeout(tick, step.delay);
    } else {
      stepIdx++;
      tick();
    }
  }
  tick();
}

// ── Transition: Load → Logo ───────────────────────────────────
function transitionToLogo() {
  const phaseLoad = document.getElementById('phase-load');
  const phaseLogo = document.getElementById('phase-logo');

  phaseLoad.classList.add('fade-out-ph');
  setTimeout(() => {
    phaseLoad.classList.add('hidden');
    phaseLogo.classList.remove('hidden');
    runLogoPhase();
  }, 500);
}

// ── Phase 2: Logo Slam + Cards + Button ──────────────────────
function runLogoPhase() {
  // Letters already animate via CSS (animation-delay per --i)
  // Trigger line expand after letters are done (~1.1s)
  setTimeout(() => {
    document.getElementById('logoLine').classList.add('expand');
  }, 900);

  setTimeout(() => {
    document.getElementById('logoSub').classList.add('show');
  }, 1200);

  // Deal cards one by one
  const fanCards = document.querySelectorAll('.fan-card');
  fanCards.forEach((card, i) => {
    setTimeout(() => card.classList.add('dealt'), 1000 + i * 120);
  });

  // Glitch flash on letters
  setTimeout(() => {
    document.querySelectorAll('.logo-letter').forEach(l => l.classList.add('glitch'));
  }, 1400);

  // Show enter button
  setTimeout(() => {
    document.getElementById('enterBtn').classList.add('show');
    document.querySelector('.intro-tagline-final').classList.add('show');
  }, 1700);
}

// ── Enter Site ────────────────────────────────────────────────
function enterSite() {
  const intro = document.getElementById('intro-screen');
  const main  = document.getElementById('main-site');

  stopCanvas();
  intro.classList.add('fade-out');
  main.classList.remove('hidden');

  setTimeout(() => {
    main.classList.add('visible');
    intro.style.display = 'none';
    initMainAnimations();   // 🔥 boot all live animations
  }, 900);
}

// ── Boot on load ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  runLoadingPhase();
  initFilterChips();
});

// ── Called once main site is visible ─────────────────────────
function initMainAnimations() {
  initCursor();
  initBgCanvas();
  initScrollReveal();
  initRipple();
  initCardTilt();
}

// ── 1. Custom Cursor ──────────────────────────────────────────
function initCursor() {
  const cursor    = document.getElementById('cursor');
  const dot       = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth cursor lag
  function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();

  // Hover state on interactive elements
  document.querySelectorAll('button, label, a, .fan-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('cursor-click');
    cursor.classList.remove('cursor-hover');
  });
  document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));
}

// ── 2. Background Canvas (main site) ─────────────────────────
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pts = [];
  const SUITS = ['♠','♦','♣','♥'];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 20; i++) pts.push(mkPt(canvas));

  function mkPt(c) {
    return {
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      suit: SUITS[Math.floor(Math.random() * 4)],
      size: Math.random() * 18 + 8,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.2,
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.008,
      alpha: Math.random() * 0.06 + 0.02,
      red: Math.random() > 0.5,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p, i) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = p.red ? `rgba(192,57,43,${p.alpha})` : `rgba(255,255,255,${p.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.suit, 0, 0);
      ctx.restore();
      p.y -= p.speed;
      p.x += p.drift;
      p.rot += p.rotS;
      if (p.y < -40) { pts.splice(i, 1); pts.push(mkPt(canvas)); }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── 3. Scroll Reveal (IntersectionObserver) ───────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger')
    .forEach(el => obs.observe(el));
}

// ── 4. Ripple Effect on Buttons ───────────────────────────────
function initRipple() {
  document.querySelectorAll('.count-btn, .card-reroll, .spin-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
      `;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });
}

// ── 5. 3D Card Tilt on Hover ──────────────────────────────────
function initCardTilt() {
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.player-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 1.8) {
        const tiltX =  dy * 8;
        const tiltY = -dx * 8;
        card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`;
      } else {
        card.style.transform = '';
      }
    });
  });

  // Reset on mouse leave viewport
  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.player-card').forEach(c => c.style.transform = '');
  });
}

// ── Re-observe new cards after spin ──────────────────────────
function reObserveCards() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.player-card').forEach(c => obs.observe(c));
}

// Flash result header
function flashResultHeader() {
  const h = document.getElementById('resultHeader');
  h.classList.remove('flash');
  void h.offsetWidth; // reflow
  h.classList.add('flash');
}




// ── Player Count ──────────────────────────────────────────────
function setPlayers(n) {
  playerCount = n;
  document.getElementById("playerCountDisplay").textContent = n;

  document.querySelectorAll(".count-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === n);
  });
}


// ── Category Filter (setup after DOM ready — merged into boot) ──
function initFilterChips() {
  document.querySelectorAll(".filter-chip input").forEach(cb => {
    cb.addEventListener("change", () => {
      cb.closest(".filter-chip").classList.toggle("active", cb.checked);
      ensureAtLeastOne();
    });
  });
}


function ensureAtLeastOne() {
  const checked = [...document.querySelectorAll(".filter-chip input:checked")];
  if (checked.length === 0) {
    // Re-check the last one that was unchecked
    document.querySelectorAll(".filter-chip input")[0].checked = true;
    document.querySelectorAll(".filter-chip")[0].classList.add("active");
  }
}

function getActiveCategories() {
  return [...document.querySelectorAll(".filter-chip input:checked")]
    .map(cb => cb.value);
}

function getAvailableGuns() {
  const cats = getActiveCategories();
  let pool = [];
  cats.forEach(cat => {
    if (WEAPONS[cat]) pool = pool.concat(WEAPONS[cat]);
  });
  // Deduplicate
  return [...new Set(pool)];
}

// ── Random Helpers ────────────────────────────────────────────
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSuit() {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function getGunCategory(gun) {
  for (const [cat, guns] of Object.entries(WEAPONS)) {
    if (guns.includes(gun)) return cat;
  }
  return "—";
}

// ── Spin Logic ────────────────────────────────────────────────
function spinGuns() {
  if (spinning) return;
  const pool = getAvailableGuns();
  if (pool.length === 0) return;

  const spinBtn = document.getElementById("spinBtn");
  spinBtn.classList.add("spinning");

  const grid = document.getElementById("cardsGrid");
  const header = document.getElementById("resultHeader");

  // Create or refresh cards with spinning state
  if (grid.children.length !== playerCount) {
    buildCards(playerCount, pool, true);
  } else {
    // Add spinning animation
    document.querySelectorAll(".player-card").forEach(c => {
      c.classList.add("spinning");
      c.querySelector(".card-gun-name").textContent = "?????";
      c.querySelector(".card-category").textContent = "—";
    });
  }

  header.classList.remove("hidden");
  spinning = true;

  // Slot-machine effect
  const totalFrames = 20;
  let frame = 0;
  const interval = setInterval(() => {
    frame++;
    document.querySelectorAll(".player-card").forEach(card => {
      const tempGun = randomFrom(pool);
      card.querySelector(".card-gun-name").textContent = tempGun;
      card.querySelector(".card-category").textContent = getGunCategory(tempGun);
    });

    if (frame >= totalFrames) {
      clearInterval(interval);
      finalizeSpin(pool);
      spinBtn.classList.remove("spinning");
      spinning = false;
    }
  }, 80);
}

function buildCards(count, pool, withSpinner = false) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const suit = randomSuit();
    const isRed = suit === "♦" || suit === "♥";
    const gun = withSpinner ? "?????" : randomFrom(pool);
    const cat = withSpinner ? "—" : getGunCategory(gun);

    const card = document.createElement("div");
    card.className = "player-card" + (withSpinner ? " spinning" : "");
    card.dataset.playerIndex = i;
    card.dataset.suit = suit;
    card.innerHTML = `
      <div class="card-corner tl">
        <span>${i}</span>
        <span class="suit-sym" style="color:${isRed ? '#c0392b' : 'inherit'}">${suit}</span>
      </div>
      <div class="card-corner br">
        <span>${i}</span>
        <span class="suit-sym" style="color:${isRed ? '#c0392b' : 'inherit'}">${suit}</span>
      </div>
      <p class="card-player-label">Player</p>
      <div class="card-player-num">${i}</div>
      <div class="card-divider"></div>
      <span class="card-category">${cat}</span>
      <div class="card-gun-name">${gun}</div>
      <div class="card-big-suit" style="color:${isRed ? '#c0392b' : 'rgba(255,255,255,0.1)'}">${suit}</div>
      <button class="card-reroll" onclick="rerollCard(this, ${i})">↺ REROLL</button>
    `;
    grid.appendChild(card);
  }
}

function finalizeSpin(pool) {
  document.querySelectorAll(".player-card").forEach(card => {
    card.classList.remove("spinning");
    const gun = randomFrom(pool);
    const cat = getGunCategory(gun);
    card.querySelector(".card-gun-name").textContent = gun;
    card.querySelector(".card-category").textContent = cat;
  });
}

// ── Individual Reroll ─────────────────────────────────────────
function rerollCard(btn, playerIndex) {
  const pool = getAvailableGuns();
  if (pool.length === 0) return;

  const card = btn.closest(".player-card");
  card.classList.add("spinning");

  let frame = 0;
  const interval = setInterval(() => {
    frame++;
    const tempGun = randomFrom(pool);
    card.querySelector(".card-gun-name").textContent = tempGun;
    card.querySelector(".card-category").textContent = getGunCategory(tempGun);

    if (frame >= 12) {
      clearInterval(interval);
      card.classList.remove("spinning");
      const finalGun = randomFrom(pool);
      card.querySelector(".card-gun-name").textContent = finalGun;
      card.querySelector(".card-category").textContent = getGunCategory(finalGun);

      // Change suit randomly
      const newSuit = randomSuit();
      const isRed = newSuit === "♦" || newSuit === "♥";
      const suitColor = isRed ? "#c0392b" : "inherit";
      card.querySelectorAll(".suit-sym").forEach(s => {
        s.textContent = newSuit;
        s.style.color = suitColor;
      });
      const bigSuit = card.querySelector(".card-big-suit");
      bigSuit.textContent = newSuit;
      bigSuit.style.color = isRed ? "#c0392b" : "rgba(255,255,255,0.1)";
    }
  }, 80);
}

// ── Main spin button also re-builds cards each time ───────────
(function patchSpinBtn() {
  const btn = document.getElementById("spinBtn");
  btn.onclick = () => {
    const pool = getAvailableGuns();
    if (!pool.length || spinning) return;

    const spinBtn = btn;
    spinBtn.classList.add("spinning");
    spinning = true;

    // Always rebuild cards fresh
    buildCards(playerCount, pool, true);
    document.getElementById("resultHeader").classList.remove("hidden");

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      document.querySelectorAll(".player-card").forEach(card => {
        const tempGun = randomFrom(pool);
        card.querySelector(".card-gun-name").textContent = tempGun;
        card.querySelector(".card-category").textContent = getGunCategory(tempGun);
      });
      if (frame >= 20) {
        clearInterval(interval);
        finalizeSpin(pool);
        spinBtn.classList.remove("spinning");
        spinning = false;
      }
    }, 80);
  };
})();
