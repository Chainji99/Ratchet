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

// ── Intro Enter ───────────────────────────────────────────────
function enterSite() {
  const intro = document.getElementById("intro-screen");
  const main  = document.getElementById("main-site");

  intro.classList.add("fade-out");
  main.classList.remove("hidden");

  setTimeout(() => {
    main.classList.add("visible");
    intro.style.display = "none";
  }, 800);
}

// ── Player Count ──────────────────────────────────────────────
function setPlayers(n) {
  playerCount = n;
  document.getElementById("playerCountDisplay").textContent = n;

  document.querySelectorAll(".count-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === n);
  });
}

// ── Category Filter ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Sync filter chip active class on checkbox change
  document.querySelectorAll(".filter-chip input").forEach(cb => {
    cb.addEventListener("change", () => {
      cb.closest(".filter-chip").classList.toggle("active", cb.checked);
      ensureAtLeastOne();
    });
  });
});

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
