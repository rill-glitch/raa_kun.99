import { getStore } from "@netlify/blobs";
import { createHmac, timingSafeEqual } from "node:crypto";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const sign = (payload) =>
  createHmac("sha256", process.env.TOKEN_SECRET).update(payload).digest("base64url");

const hash = (v) => createHmac("sha256", "cmp").update(String(v)).digest();
const same = (a, b) => timingSafeEqual(hash(a), hash(b));

function makeToken() {
  const p = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 3600 * 1000 })).toString("base64url");
  return p + "." + sign(p);
}

function tokenValid(header) {
  const token = (header || "").replace(/^Bearer\s+/i, "");
  const [p, sig] = token.split(".");
  if (!p || !sig || !same(sig, sign(p))) return false;
  try {
    return JSON.parse(Buffer.from(p, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

function cleanSchedule(list) {
  if (!Array.isArray(list) || list.length > 40) return null;
  const out = [];
  for (const it of list) {
    const date = String(it?.date || "");
    const time = String(it?.time || "");
    const note = String(it?.note || "").trim().slice(0, 120);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
    out.push({ date, time, note });
  }
  return out;
}

export default async (req) => {
  const { ADMIN_USER, ADMIN_PASS, TOKEN_SECRET } = process.env;
  const path = new URL(req.url).pathname;
  const store = getStore("raakun");

  // Publik: siapa saja boleh melihat jadwal
  if (path.endsWith("/schedule") && req.method === "GET") {
    const schedule = await store.get("schedule", { type: "json" });
    return json({ schedule: schedule ?? null });
  }

  if (!ADMIN_USER || !ADMIN_PASS || !TOKEN_SECRET) {
    return json({ error: "Server belum dikonfigurasi (env variable kosong)." }, 500);
  }

  // Login
  if (path.endsWith("/login") && req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const ok = same(body.username ?? "", ADMIN_USER) & same(body.password ?? "", ADMIN_PASS);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 800)); // perlambat tebak-tebakan password
      return json({ error: "Username atau password salah." }, 401);
    }
    return json({ token: makeToken() });
  }

  // Simpan jadwal (wajib login)
  if (path.endsWith("/schedule") && req.method === "POST") {
    if (!tokenValid(req.headers.get("authorization"))) {
      return json({ error: "Sesi habis, silakan login lagi." }, 401);
    }
    const body = await req.json().catch(() => ({}));
    const schedule = cleanSchedule(body.schedule);
    if (!schedule) return json({ error: "Format jadwal tidak valid." }, 400);
    await store.setJSON("schedule", schedule);
    return json({ ok: true, schedule });
  }

  return json({ error: "Not found" }, 404);
};

export const config = { path: ["/api/schedule", "/api/login"] };
