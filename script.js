
/* ==========================================
   RAA KUN - PROFILE + BACKGROUND MUSIC
========================================== */

const CONFIG = {
  name: "Raa Kun",
  tagline: "Streamer Magang",
  bio: "Mulai live mulai hari Senin! Datang, ngobrol, dan seru-seruan bareng di chat.",
  avatar: "./profil.jpg",
  watchUrl: "https://www.youtube.com/@raakun8952",
  discordUrl: "https://discord.gg/dSz6UkJns",
  // Ganti dengan tautan Saluran WhatsApp Raa Kun yang asli
  whatsappChannelUrl: "https://www.whatsapp.com/channel/0029VbD6clJ35fM4DDLPdJ0f",

  // Jadwal awal (dipakai kalau belum pernah disimpan dari panel admin)
  schedule: [
    { date: "2026-10-19", time: "19:00", note: "🎉 Stream perdana!" },
    { date: "2026-10-21", time: "19:00", note: "Live santai bareng chat" },
    { date: "2026-10-23", time: "20:00", note: "Live malam Jumat" },
    { date: "2026-10-24", time: "19:00", note: "Live weekend" },
  ],

  donate: [
    { i: "🎁", n: "Saweria", d: "QRIS, e-wallet, transfer", u: "https://saweria.co/#NOT" },
    { i: "☕", n: "SociaBuzz", d: "Dukungan kreator", u: "https://sociabuzz.com/raa_kun" },
    { i: "💙", n: "Ko-fi", d: "Dukungan internasional", u: "https://ko-fi.com/#NOT" },
  ],

  perks: [
    "Info live dan jadwal paling cepat",
    "Ngobrol bareng komunitas",
    "Kasih ide dan request konten",
  ],

  social: [
    { i: "🎵", n: "TikTok", d: "@Asep Kopling", u: "https://www.tiktok.com/@useless._13" },
    { i: "📸", n: "Instagram", d: "@Raa Kun", u: "https://www.instagram.com/raa_kun" },
    { i: "▶️", n: "YouTube", d: "Raa Kun", u: "https://www.youtube.com/@raakun8952" },
    { i: "💬", n: "Discord", d: "Server komunitas", u: "https://discord.gg/dSz6UkJns" },
  ],
};

const playlist = [
  {
    name: "coffee time cute",
    src: "./sound.mp3",
  },
  {
    name: "pretty please cute",
    src: "./sound2.mp3",
  },
  {
    name: "chiikawa cute",
    src: "./sound3.mp3",
  },
];

const $ = (id) => document.getElementById(id);
const C = CONFIG;

const VIEWS = [
  ["home", "Beranda"],
  ["jadwal", "Jadwal"],
  ["donate", "Donate"],
  ["discord", "Discord"],
  ["sosial", "Sosial"],
];

/* ===== NAVIGASI ===== */

function go(view) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("on", section.id === "v-" + view);
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("on", button.dataset.v === view);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-v]");
  if (button) go(button.dataset.v);
});

/* ===== NOTIFIKASI ===== */

let toastTimer;

function toast(message) {
  const el = $("toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("on");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove("on");
  }, 2200);
}

/* ===== NAVBAR ===== */

$("tabs").innerHTML = VIEWS.map(
  ([view, label], index) =>
    `<button class="tab${index === 0 ? " on" : ""}" data-v="${view}">${label}</button>`
).join("");

// Tautan Saluran WhatsApp di navbar (membuka tab baru)
const waLink = document.createElement("a");
waLink.className = "tab wa-channel";
waLink.href = C.whatsappChannelUrl;
waLink.target = "_blank";
waLink.rel = "noopener noreferrer";
waLink.textContent = "◉ Saluran WA";
waLink.setAttribute("aria-label", "Buka Saluran WhatsApp Raa Kun");
$("tabs").appendChild(waLink);

/* ===== IDENTITAS ===== */

document.title = C.name + " – " + C.tagline;

["bn", "hn", "fn"].forEach((id) => {
  const el = $(id);
  if (el) el.textContent = C.name;
});

$("bt").textContent = C.tagline;
$("bio").textContent = C.bio;

const avatar = $("av");

if (avatar) {
  avatar.src = C.avatar;
  avatar.alt = "Foto profil " + C.name;

  avatar.addEventListener("error", () => {
    avatar.style.visibility = "hidden";
  });

  avatar.addEventListener("load", () => {
    avatar.style.visibility = "visible";
  });
}

$("yr").textContent = new Date().getFullYear();

["watch", "watchTop"].forEach((id) => {
  const el = $(id);
  if (el) el.href = C.watchUrl;
});

$("dcBtn").href = C.discordUrl;

if ($("dcLogo") && typeof SOCIAL_ICONS !== "undefined") {
  $("dcLogo").innerHTML = `<svg viewBox="0 0 24 24" aria-label="Discord"><path d="${SOCIAL_ICONS.discord}"/></svg>`;
}

$("perks").innerHTML = C.perks
  .map((perk) => `<li>${perk}</li>`)
  .join("");

/* ===== JADWAL STREAM ===== */

const API = "/api";
const CACHE_KEY = "raakun_schedule_v1";
const TOKEN_KEY = "raakun_admin_token";

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch {} },
  del(key) { try { localStorage.removeItem(key); } catch {} },
};

const when = (item) => new Date(`${item.date}T${item.time}:00+07:00`).getTime();

const fmtDay = (item) =>
  new Date(when(item)).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Jakarta",
  });

let schedule = (() => {
  try {
    const cached = JSON.parse(store.get(CACHE_KEY));
    if (Array.isArray(cached)) return cached;
  } catch {}
  return C.schedule;
})();

function renderSchedule() {
  const now = Date.now();
  const sorted = [...schedule].sort((a, b) => when(a) - when(b));

  $("sch").innerHTML = sorted.length
    ? sorted.map((item) => `
        <div class="card${when(item) < now - 2 * 3600e3 ? " past" : ""}">
          <span class="d">${fmtDay(item)}</span>
          <span class="t">${esc(item.time)} WIB</span>
          <span class="n">${esc(item.note)}</span>
        </div>`).join("")
    : `<div class="card"><span class="n">Belum ada jadwal. Pantengin Discord ya!</span></div>`;
}

function applySchedule(list, { cache = true } = {}) {
  schedule = list;
  if (cache) store.set(CACHE_KEY, JSON.stringify(list));
  renderSchedule();
  setNextStream();
  tick();
}

async function fetchSchedule() {
  try {
    const res = await fetch(API + "/schedule", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.schedule)) applySchedule(data.schedule);
  } catch {
    /* offline: tetap pakai jadwal terakhir */
  }
}

/* ===== DONASI DAN SOSIAL ===== */

const renderCards = (items) =>
  items
    .map(
      (item) => `
        <a class="card"
           href="${item.u}"
           target="_blank"
           rel="noopener noreferrer">
          <div class="i">${item.i}</div>
          <h3>${item.n}</h3>
          <p>${item.d}</p>
        </a>
      `
    )
    .join("");

$("don").innerHTML = renderCards(C.donate);
$("soc").innerHTML = renderCards(C.social);

/* ===== COUNTDOWN (ke stream berikutnya) ===== */

let start = null;

function setNextStream() {
  const limit = Date.now() - 2 * 3600e3; // tetap dianggap "live" sampai 2 jam
  const next = [...schedule].sort((a, b) => when(a) - when(b)).find((i) => when(i) > limit);

  if (!next) {
    start = null;
    $("startTxt").textContent = "Belum ada jadwal stream berikutnya.";
    return;
  }

  start = when(next);
  $("startTxt").textContent =
    "Stream berikutnya: " +
    new Date(start)
      .toLocaleString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
      })
      .replace(".", ":") +
    " WIB" + (next.note ? " · " + next.note : "");
}

function tick() {
  if (start === null) {
    $("cd").innerHTML = "";
    $("pill").textContent = "Belum ada jadwal stream";
    return;
  }

  const diff = start - Date.now();

  if (diff <= 0) {
    $("cd").innerHTML = `
      <div style="min-width:220px">
        <b style="color:var(--k)">🔴 LIVE</b>
        <small>Waktunya bergabung!</small>
      </div>
    `;
    $("pill").textContent = "Stream sedang berlangsung";
    return;
  }

  $("pill").textContent = "Stream berikutnya segera dimulai";

  const seconds = Math.floor(diff / 1000);
  const parts = [
    [Math.floor(seconds / 86400), "Hari"],
    [Math.floor(seconds / 3600) % 24, "Jam"],
    [Math.floor(seconds / 60) % 60, "Menit"],
    [seconds % 60, "Detik"],
  ];

  $("cd").innerHTML = parts
    .map(([number, label]) => `
        <div>
          <b>${String(number).padStart(2, "0")}</b>
          <small>${label}</small>
        </div>`)
    .join("");
}

renderSchedule();
setNextStream();
tick();
setInterval(tick, 1000);
fetchSchedule();
setInterval(fetchSchedule, 60000); // member otomatis lihat jadwal terbaru

/* ===== BACKGROUND PARTIKEL ===== */

function createAmbientBackground() {
  if ($("ambient-bg")) return;

  const background = document.createElement("div");
  background.id = "ambient-bg";
  background.setAttribute("aria-hidden", "true");

  const colors = ["#9d6bff", "#ff4d8d", "#7c3aed"];

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.setProperty("--size", 2 + Math.random() * 4 + "px");
    particle.style.setProperty("--duration", 14 + Math.random() * 18 + "s");
    particle.style.setProperty("--delay", -Math.random() * 25 + "s");
    particle.style.setProperty("--drift", -80 + Math.random() * 160 + "px");
    particle.style.setProperty("--particle-color", colors[i % colors.length]);
    background.appendChild(particle);
  }

  document.body.prepend(background);
}

createAmbientBackground();

/* ===== TOMBOL BAGIKAN ===== */

$("share").onclick = async () => {
  const data = {
    title: C.name,
    text: "Kunjungi profil " + C.name + "!",
    url: location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
    } else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(location.href);
      toast("Link disalin ✓");
    } else {
      toast("Salin link website dari address bar");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      toast("Link belum bisa dibagikan");
    }
  }
};

/* ===== BACKGROUND MUSIC PLAYER ===== */

const bgMusic = $("bgMusic");
const musicToggle = $("musicToggle");
const musicVolume = $("musicVolume");
const musicName = $("musicName");

if (bgMusic && musicToggle && musicVolume && musicName) {
  bgMusic.volume = Number(musicVolume.value);

  const track = playlist[0];

  if (track) {
    musicName.textContent = track.name;
    bgMusic.src = track.src;
    bgMusic.loop = true;
    bgMusic.preload = "auto";
  } else {
    musicName.textContent = "Lagu belum tersedia";
    musicToggle.disabled = true;
  }

  function updateMusicButton(playing) {
    musicToggle.textContent = playing ? "Ⅱ" : "▶";
    musicToggle.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
    musicToggle.title = playing ? "Jeda musik" : "Putar musik";
  }

  musicToggle.addEventListener("click", async () => {
    if (bgMusic.paused) {
      try {
        await bgMusic.play();
      } catch (error) {
        updateMusicButton(false);
        console.error("Gagal memutar musik:", error);
        toast("Periksa file sound.mp3.");
      }
    } else {
      bgMusic.pause();
    }
  });

  musicVolume.addEventListener("input", () => {
    bgMusic.volume = Number(musicVolume.value);
  });

  bgMusic.addEventListener("play", () => updateMusicButton(true));
  bgMusic.addEventListener("pause", () => updateMusicButton(false));

  bgMusic.addEventListener("error", () => {
    updateMusicButton(false);
    console.error("Audio gagal dimuat:", bgMusic.currentSrc, bgMusic.error?.code);
  });
}

/* ==========================================
   RAA KUN - VISUAL UPGRADE
   Logo sosial + Neon navbar + Compact spectrum
========================================== */

(() => {
  /* ===== LOGO SOSIAL MEDIA ===== */

  const socialLogos = {
    TikTok: `<svg viewBox="0 0 24 24" aria-label="TikTok"><path fill="currentColor" d="M19.6 6.2a5.8 5.8 0 0 1-3.5-1.2v8.2a6.4 6.4 0 1 1-5.5-6.3v3.5a3 3 0 1 0 2.1 2.9V2h3.5c.2 2.2 1.5 3.8 3.4 4.2z"/></svg>`,

    Instagram: `<svg viewBox="0 0 24 24" aria-label="Instagram"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.8" r="1.2" fill="currentColor"/></svg>`,

    Discord: `<svg viewBox="0 0 24 24" aria-label="Discord"><path fill="currentColor" d="M19.7 5.2A18 18 0 0 0 15.3 4l-.5 1a16 16 0 0 0-5.6 0l-.5-1a18 18 0 0 0-4.4 1.2C1.5 9.3.7 13.3 1.1 17.3a18 18 0 0 0 5.4 2.7l1.2-2a11 11 0 0 1-1.9-.9l.5-.4a12.8 12.8 0 0 0 11.4 0l.5.4a11 11 0 0 1-1.9.9l1.2 2a18 18 0 0 0 5.4-2.7c.5-4.7-.8-8.7-3.2-12.1ZM8.8 14.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>`,

    YouTube: `<svg viewBox="0 0 24 24" aria-label="YouTube"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.3 3.7-6.3 3.7Z"/></svg>`,
  };

  const socialContainer = $("soc");

  if (socialContainer) {
    socialContainer.querySelectorAll(".card").forEach((card) => {
      const name = card.querySelector("h3")?.textContent.trim();
      const icon = card.querySelector(".i");

      if (socialLogos[name] && icon) {
        icon.innerHTML = socialLogos[name];
        icon.classList.add("brand-social-icon");
      }
    });
  }

  /* ===== CSS EFEK ===== */

  const style = document.createElement("style");

  style.textContent = `
    .brand-social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      margin-bottom: 10px;
      color: #b78aff;
      transition: transform .3s ease, color .3s ease, filter .3s ease;
    }

    .brand-social-icon svg {
      display: block;
      width: 32px;
      height: 32px;
    }

    #soc .card:hover .brand-social-icon {
      color: #ff70bd;
      transform: translateY(-4px) scale(1.12);
      filter: drop-shadow(0 0 8px currentColor);
    }

    .tab {
      position: relative;
      overflow: hidden;
      transition: color .25s ease, background .25s ease,
                  box-shadow .25s ease, transform .25s ease;
    }

    .tab.on {
      box-shadow: 0 0 12px #a855f755, inset 0 0 12px #a855f722;
    }

    .tab.on::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 18%;
      width: 64%;
      height: 2px;
      border-radius: 99px;
      background: linear-gradient(90deg, #a855f7, #ff4d9d);
      box-shadow: 0 0 9px #d879ff;
      animation: navGlow .35s ease both;
    }

    .tab:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 14px #b66aff33;
    }

    @keyframes navGlow {
      from { transform: scaleX(.2); opacity: .3; }
      to { transform: scaleX(1); opacity: 1; }
    }

    /* Visualizer pendek */
    .audio-visualizer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 34px;
      height: 28px;
      margin-left: 0;
      flex: 0 0 34px;
      overflow: hidden;
    }

    .audio-visualizer span {
      display: block;
      flex: 0 0 2px;
      width: 2px;
      height: 3px;
      border-radius: 5px;
      background: linear-gradient(to top, #a855f7, #ff66b3);
      box-shadow: 0 0 5px #c084fc66;
      transition: height .08s linear;
    }

    #musicPlayer {
      position: relative;
    }

    @media (max-width: 480px) {
      .audio-visualizer {
        width: 26px;
        flex-basis: 26px;
        gap: 1px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tab, .brand-social-icon {
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);

  /* ===== AUDIO SPECTRUM ===== */

  const audio = $("bgMusic");
  const player = $("musicPlayer");

  if (!audio || !player) return;

  // Hindari membuat visualizer ganda
  if (player.querySelector(".audio-visualizer")) return;

  const visualizer = document.createElement("div");
  visualizer.className = "audio-visualizer";
  visualizer.setAttribute("aria-label", "Visualisasi musik");
  visualizer.setAttribute("aria-hidden", "true");

  const bars = [];

  // Hanya 9 batang supaya player tidak kepanjangan
  for (let i = 0; i < 9; i++) {
    const bar = document.createElement("span");
    visualizer.appendChild(bar);
    bars.push(bar);
  }

  const musicInfo = player.querySelector(".music-info");

  if (musicInfo) {
    musicInfo.insertAdjacentElement("afterend", visualizer);
  } else {
    player.appendChild(visualizer);
  }

  let audioContext = null;
  let analyser = null;
  let frequencyData = null;
  let animationId = null;

  function resetSpectrum() {
    bars.forEach((bar) => {
      bar.style.height = "3px";
    });
  }

  function setupAudioSpectrum() {
    if (analyser) return true;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return false;

      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      frequencyData = new Uint8Array(analyser.frequencyBinCount);

      return true;
    } catch (error) {
      console.error("Spectrum gagal disiapkan:", error);
      return false;
    }
  }

  function animateSpectrum() {
    if (!analyser || !frequencyData) return;

    if (audio.paused || audio.ended) {
      resetSpectrum();
      animationId = null;
      return;
    }

    analyser.getByteFrequencyData(frequencyData);

    bars.forEach((bar, index) => {
      const dataIndex = Math.floor(
        (index / bars.length) * frequencyData.length * 0.75
      );

      const strength = frequencyData[dataIndex] / 255;
      const height = 3 + strength * 22;

      bar.style.height = height + "px";
    });

    animationId = requestAnimationFrame(animateSpectrum);
  }

  async function startSpectrum() {
    if (!setupAudioSpectrum()) return;

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!audio.paused && animationId === null) {
        animateSpectrum();
      }
    } catch (error) {
      console.warn("Spectrum tidak dapat dimulai:", error);
    }
  }

  audio.addEventListener("play", startSpectrum);

  audio.addEventListener("pause", () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    resetSpectrum();
  });

  audio.addEventListener("ended", resetSpectrum);
})();

/* ==========================================
   PANEL ADMIN (edit jadwal)
========================================== */

(() => {
  const overlay = document.createElement("div");
  overlay.className = "adm";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="adm-box" role="dialog" aria-modal="true" aria-label="Panel admin">
      <button type="button" class="adm-x" id="admX" aria-label="Tutup">✕</button>

      <form id="admLogin" autocomplete="on">
        <h2>Login Admin</h2>
        <p class="sub">Khusus Raa Kun untuk mengubah jadwal stream.</p>
        <input id="admUser" name="username" placeholder="Username" autocomplete="username" required />
        <input id="admPass" name="password" type="password" placeholder="Password" autocomplete="current-password" required />
        <p class="adm-err" id="admErr1"></p>
        <button class="btn" type="submit">Masuk</button>
      </form>

      <div id="admEdit" hidden>
        <h2>Edit Jadwal</h2>
        <p class="sub">Semua jam dalam WIB. Klik Simpan agar member melihat perubahannya.</p>
        <div class="adm-rows" id="admRows"></div>
        <p class="adm-err" id="admErr2"></p>
        <div class="cta" style="justify-content:flex-start">
          <button class="btn o" type="button" id="admAdd">+ Tambah jadwal</button>
          <button class="btn" type="button" id="admSave">💾 Simpan</button>
          <button class="btn o" type="button" id="admOut">Keluar</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const q = (id) => overlay.querySelector("#" + id);
  const rows = q("admRows");

  const rowHTML = (it = {}) => `
    <div class="adm-row">
      <input type="date" value="${esc(it.date || "")}" aria-label="Tanggal" />
      <input type="time" value="${esc(it.time || "")}" aria-label="Jam (WIB)" />
      <input type="text" maxlength="120" value="${esc(it.note || "")}" placeholder="Keterangan" aria-label="Keterangan" />
      <button type="button" class="adm-del" aria-label="Hapus" title="Hapus">🗑</button>
    </div>`;

  function fillRows() {
    const sorted = [...schedule].sort((a, b) => when(a) - when(b));
    rows.innerHTML = sorted.map(rowHTML).join("");
  }

  function collect() {
    return [...rows.querySelectorAll(".adm-row")].map((r) => {
      const [d, t, n] = r.querySelectorAll("input");
      return { date: d.value, time: t.value, note: n.value.trim() };
    });
  }

  function show(editing) {
    q("admLogin").hidden = editing;
    q("admEdit").hidden = !editing;
    q("admErr1").textContent = q("admErr2").textContent = "";
    if (editing) fillRows();
  }

  function open() {
    overlay.hidden = false;
    show(!!store.get(TOKEN_KEY));
  }

  function close() {
    overlay.hidden = true;
  }

  function logout() {
    store.del(TOKEN_KEY);
    show(false);
  }

  $("adminLink")?.addEventListener("click", (e) => { e.preventDefault(); open(); });
  q("admX").onclick = close;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });

  q("admLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = q("admErr1");
    err.textContent = "Memeriksa...";
    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: q("admUser").value, password: q("admPass").value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { err.textContent = data.error || "Login gagal."; return; }
      store.set(TOKEN_KEY, data.token);
      q("admPass").value = "";
      show(true);
    } catch {
      err.textContent = "Tidak bisa terhubung ke server.";
    }
  });

  q("admAdd").onclick = () => {
    rows.insertAdjacentHTML("beforeend", rowHTML({ time: "19:00" }));
    rows.lastElementChild.querySelector("input").focus();
  };

  rows.addEventListener("click", (e) => {
    const del = e.target.closest(".adm-del");
    if (del) del.closest(".adm-row").remove();
  });

  q("admOut").onclick = logout;

  q("admSave").onclick = async () => {
    const err = q("admErr2");
    const list = collect();

    if (list.some((i) => !i.date || !i.time)) {
      err.textContent = "Tanggal dan jam wajib diisi di setiap baris.";
      return;
    }

    err.textContent = "Menyimpan...";
    try {
      const res = await fetch(API + "/schedule", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + store.get(TOKEN_KEY),
        },
        body: JSON.stringify({ schedule: list }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) { logout(); q("admErr1").textContent = data.error || "Silakan login lagi."; return; }
      if (!res.ok) { err.textContent = data.error || "Gagal menyimpan."; return; }

      applySchedule(data.schedule);
      err.textContent = "";
      close();
      toast("Jadwal tersimpan ✓");
    } catch {
      err.textContent = "Tidak bisa terhubung ke server.";
    }
  };
})();
