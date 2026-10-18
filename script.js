
/* ==========================================
   RAA KUN - SMOOTH PROFILE SCRIPT
========================================== */

/* ====== EDIT BAGIAN INI ====== */
const CONFIG = {
  name: "Raa Kun",
  tagline: "Streamer Magang",
  bio: "Mulai live mulai hari Senin! Datang, ngobrol, dan seru-seruan bareng di chat.",

  // Foto profil: letakkan profil.jpg di folder yang sama
  avatar: "./profil.jpg",

  startISO: "2026-10-19T19:30:00+07:00",

  watchUrl: "https://www.youtube.com/@raakun8952",
  discordUrl: "https://discord.gg/GANTI-INVITE",

  schedule: [
    { d: "Senin", t: "19:00", n: "🎉 Stream perdana!" },
    { d: "Rabu", t: "19:00", n: "Live santai bareng chat" },
    { d: "Jumat", t: "20:00", n: "Live malam Jumat" },
    { d: "Sabtu", t: "19:00", n: "Live weekend" },
  ],

  donate: [
    {
      i: "🎁",
      n: "Saweria",
      d: "QRIS, e-wallet, transfer",
      u: "https://saweria.co/raakun",
    },
    {
      i: "☕",
      n: "SociaBuzz",
      d: "Dukungan kreator",
      u: "https://sociabuzz.com/raa_kun",
    },
    {
      i: "💙",
      n: "Ko-fi",
      d: "Dukungan internasional",
      u: "https://ko-fi.com/raakun",
    },
  ],

  perks: [
    "Info live dan jadwal paling cepat",
    "Ngobrol bareng komunitas",
    "Kasih ide dan request konten",
  ],

  social: [
    {
      i: "🎵",
      n: "TikTok",
      d: "@Asep Kopling",
      u: "https://www.tiktok.com/@useless._13",
    },
    {
      i: "📸",
      n: "Instagram",
      d: "@Raa Kun",
      u: "https://www.instagram.com/raa_kun",
    },
    {
      i: "▶️",
      n: "YouTube",
      d: "Raa Kun",
      u: "https://www.youtube.com/@raakun8952",
    },
    {
      i: "💬",
      n: "Discord",
      d: "Server komunitas",
      u: "https://discord.gg/GANTI-INVITE",
    },
  ],
};
/* ====== SELESAI CONFIG ====== */

const $ = (id) => document.getElementById(id);

const VIEWS = [
  ["home", "Beranda"],
  ["jadwal", "Jadwal"],
  ["donate", "Donate"],
  ["discord", "Discord"],
  ["sosial", "Sosial"],
];

const C = CONFIG;

/* NAVIGASI HALAMAN */
function go(v) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("on", section.id === "v-" + v);
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("on", button.dataset.v === v);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-v]");

  if (button) {
    go(button.dataset.v);
  }
});

/* NOTIFIKASI */
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

/* NAVBAR */
$("tabs").innerHTML = VIEWS.map(
  ([view, label], index) =>
    `<button class="tab${index === 0 ? " on" : ""}" data-v="${view}">${label}</button>`
).join("");

/* IDENTITAS DAN FOTO PROFIL */
document.title = C.name + " – " + C.tagline;

["bn", "hn", "fn"].forEach((id) => {
  const el = $(id);
  if (el) el.textContent = C.name;
});

$("bt").textContent = C.tagline;
$("bio").textContent = C.bio;

/* PENTING: gunakan src, bukan textContent */
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

$("perks").innerHTML = C.perks
  .map((perk) => `<li>${perk}</li>`)
  .join("");

/* JADWAL STREAM */
$("sch").innerHTML = C.schedule
  .map(
    (item) => `
      <div class="card">
        <span class="d">${item.d}</span>
        <span class="t">${item.t} WIB</span>
        <span class="n">${item.n}</span>
      </div>
    `
  )
  .join("");

/* KARTU DONASI DAN SOSIAL */
const renderCards = (items) =>
  items
    .map(
      (item) => `
        <a
          class="card"
          href="${item.u}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="i">${item.i}</div>
          <h3>${item.n}</h3>
          <p>${item.d}</p>
        </a>
      `
    )
    .join("");

$("don").innerHTML = renderCards(C.donate);
$("soc").innerHTML = renderCards(C.social);

/* COUNTDOWN */
const start = new Date(C.startISO).getTime();

$("startTxt").textContent =
  "Stream perdana: " +
  new Date(start)
    .toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
    .replace(".", ":") +
  " WIB";

function tick() {
  const diff = start - Date.now();

  if (diff <= 0) {
    $("cd").innerHTML = `
      <div style="min-width:220px">
        <b style="color:var(--k)">🔴 LIVE</b>
        <small>Waktunya bergabung!</small>
      </div>
    `;

    $("pill").textContent = "Waktu stream perdana telah tiba";
    return;
  }

  const seconds = Math.floor(diff / 1000);

  const parts = [
    [Math.floor(seconds / 86400), "Hari"],
    [Math.floor(seconds / 3600) % 24, "Jam"],
    [Math.floor(seconds / 60) % 60, "Menit"],
    [seconds % 60, "Detik"],
  ];

  $("cd").innerHTML = parts
    .map(
      ([number, label]) => `
        <div>
          <b>${String(number).padStart(2, "0")}</b>
          <small>${label}</small>
        </div>
      `
    )
    .join("");
}

tick();
setInterval(tick, 1000);

/* BACKGROUND PARTIKEL */
function createAmbientBackground() {
  if (document.getElementById("ambient-bg")) return;

  const background = document.createElement("div");
  background.id = "ambient-bg";
  background.setAttribute("aria-hidden", "true");

  const colors = ["#9d6bff", "#ff4d8d", "#7c3aed"];

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement("span");

    particle.className = "ambient-particle";

    particle.style.left = Math.random() * 100 + "%";
    particle.style.setProperty(
      "--size",
      2 + Math.random() * 4 + "px"
    );
    particle.style.setProperty(
      "--duration",
      14 + Math.random() * 18 + "s"
    );
    particle.style.setProperty(
      "--delay",
      -Math.random() * 25 + "s"
    );
    particle.style.setProperty(
      "--drift",
      -80 + Math.random() * 160 + "px"
    );
    particle.style.setProperty(
      "--particle-color",
      colors[i % colors.length]
    );

    background.appendChild(particle);
  }

  document.body.prepend(background);
}

createAmbientBackground();

/* TOMBOL BAGIKAN */
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
