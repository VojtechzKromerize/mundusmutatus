/* Service worker hráčské verze Mundus Mutatus (build.py doplní verzi a jádro stránky).
   - stránka: nejdřív síť, bez připojení uložená kopie
   - soubory s otiskem (v/…): z trvalé mezipaměti (mm-v), nemění se; po nasazení se stáhnou jen nové díly skriptu
     a staré, které už stránka nepoužívá, se smažou
   - obrázky, písma a mapy (art/…), obrázky nahrané do Supabase: hned z mezipaměti, na pozadí se obnoví
   - veřejná data desek ze Supabase (snimek, boj): nejdřív síť, bez připojení naposledy uložený stav
   Vypravěčské dotazy (s přihlášením) se nikdy neukládají. */
const VERZE = "/*@VERZE@*/";
const JADRO = /*@JADRO@*/[];
const SOUBORY = /*@SOUBORY@*/[]; // všechny soubory v/ této verze (i části, které se stahují až na vyžádání)
const C_STR = "mm-str-" + VERZE, C_V = "mm-v", C_ART = "mm-art", C_DATA = "mm-data";
const jeV = u => new URL(u, self.location).pathname.includes("/v/");

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const s = await caches.open(C_STR), v = await caches.open(C_V);
    for (const u of JADRO) {
      try {
        if (!jeV(u)) { await s.add(u); continue; }
        if (!(await v.match(u))) await v.add(u);  // díl se stejným otiskem už máme z minulé verze
      } catch (x) {}
    }
  })().then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => (k.startsWith("mm-str-") && k !== C_STR)).map(k => caches.delete(k)));
    if (SOUBORY.length) {  // z mm-v pryč, co tato verze nepoužívá
      const v = await caches.open(C_V), drz = new Set(SOUBORY.map(u => new URL(u, self.location).href));
      for (const r of await v.keys()) if (!drz.has(r.url)) await v.delete(r);
    }
    await self.clients.claim();
  })());
});

const sit = async (req, cache, klic) => {
  const c = await caches.open(cache);
  try {
    const r = await fetch(req);
    if (r && r.ok) c.put(klic || req, r.clone());
    return r;
  } catch (e) {
    const z = await c.match(klic || req, { ignoreSearch: !klic && req.mode === "navigate" });
    if (z) return z;
    throw e;
  }
};
const pamet = async (req, cache) => {
  const c = await caches.open(cache);
  const z = await c.match(req);
  if (z) return z;
  const r = await fetch(req);
  if (r && r.ok) c.put(req, r.clone());
  return r;
};
const obnov = async (e, req, cache) => {
  const c = await caches.open(cache);
  const z = await c.match(req);
  const nova = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => null);
  if (z) { e.waitUntil(nova); return z; }
  const r = await nova;
  return r || Response.error();
};

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === self.location.origin) {
    if (req.mode === "navigate" || u.pathname.endsWith("/index.html")) { e.respondWith(sit(req, C_STR, "./")); return; }
    if (u.pathname.includes("/v/")) { e.respondWith(pamet(req, C_V)); return; }
    if (u.pathname.includes("/art/")) { e.respondWith(obnov(e, req, C_ART)); return; }
    return;
  }
  if (req.headers.has("authorization")) return; // přihlášený vypravěč: nic neukládat
  if (u.pathname.includes("/storage/v1/object/public/")) { e.respondWith(obnov(e, req, C_ART)); return; }
  if (/\/rest\/v1\/(snimek|boj|karty|hody|ukazky|rpc\/mm_boj_cti)$/.test(u.pathname)) { e.respondWith(sit(req, C_DATA)); return; }
});

/* upozornění v telefonu (Web Push): výzva k hodu, tah v boji, tajná zpráva; klepnutí otevře web na dané stránce */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { text: e.data && e.data.text() }; }
  const vib = /tahu/i.test(d.titul || "") ? [250, 120, 250, 120, 400] : [160, 80, 160];  // tah v boji vibruje jinak než výzva či zpráva
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.titul || "Mundus Mutatus", {
      body: d.text || "", icon: "art/img/kostka-192.png", badge: "art/img/kostka-64.png", tag: d.tag || d.url || "mm", renotify: true, vibrate: vib, data: { url: d.url || "#hra" }
    }),
    self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : null  // tečka na ikoně aplikace, stránka ji smaže po otevření
  ]));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (self.navigator.clearAppBadge) self.navigator.clearAppBadge().catch(() => {});
  const cil = new URL("./" + ((e.notification.data && e.notification.data.url) || ""), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(L => {
    const w = L.find(c => c.url.startsWith(self.registration.scope));
    if (w) { w.navigate(cil).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(cil);
  }));
});
