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
  whatsappChannelUrl: "https://www.whatsapp.com/channel/0029VbD6clJ35fM4DDLPdJ0f",

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
  $("dcLogo").innerHTML = `<svg viewBox="0 0 24 24" aria-label="Discord"><path d="${SOCIAL_ICONS.discord}"/></svg>`; }  $("perks").innerHTML = C.perks .map((perk) => `<li>${perk}</li>`)
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
  } catch {}
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

/* ===== COUNTDOWN ===== */

let start = null;

function setNextStream() {
  const limit = Date.now() - 2 * 3600e3;
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
setInterval(fetchSchedule, 60000);

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

let currentTrackIndex = 0;

if (bgMusic && musicToggle && musicVolume && musicName) {
  bgMusic.volume = Number(musicVolume.value);

  function loadTrack(index) {
    if (!playlist.length) {
      musicName.textContent = "Lagu belum tersedia";
      musicToggle.disabled = true;
      return;
    }

    if (index < 0) {
      currentTrackIndex = playlist.length - 1;
    } else if (index >= playlist.length) {
      currentTrackIndex = 0;
    } else {
      currentTrackIndex = index;
    }

    const track = playlist[currentTrackIndex];
    musicName.textContent = track.name;
    bgMusic.src = track.src;
    bgMusic.load();
  }

  if (playlist.length > 0) {
    musicName.textContent = playlist[0].name;
    bgMusic.src = playlist[0].src;
  }

  loadTrack(currentTrackIndex);

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
        toast("Gagal memutar audio.");
      }
    } else {
      bgMusic.pause();
    }
  });

  musicVolume.addEventListener("input", () => {
    bgMusic.volume = Number(musicVolume.value);
  });

  bgMusic.addEventListener("ended", async () => {
    loadTrack(currentTrackIndex + 1);
    try {
      await bgMusic.play();
    } catch (error) {
      console.error("Gagal memutar lagu berikutnya:", error);
    }
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
========================================== */

(() => {
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
