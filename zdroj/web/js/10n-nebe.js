/* @čisté – Vzdušný boj draků (2026-10-25, návrh v projektu claude.ai pravidla/vzdusny-boj-navrh.md) =====
   ČISTÝ SOUBOR (viz 10u): karta draka z profilu plemene (tvar křídel → číselník, ocas, letové vlastnosti, třída, podpis),
   manévry jako šablony deskové hry X-Wing, současný pohyb všech draků (útoky až z konečných pozic), překryv podstavců,
   oblouky, pásma s hladinami, útok ocasem, Napětí, Závoj u červeného manévru, Noční oči soumračníka a zranění draka.
   Stránka Nebeské bojiště (22c, samostatná část „nebe“) jen drží stav a kreslí.

   Souřadnice: deska 900 × 900 (milimetry jako u X-Wingu), y roste dolů. Natočení `u` ve stupních: 0 = drak hledí nahoru,
   kladně po směru hodin. Draci: {x, y, u, h: hladina 0–4}. Rozkaz: {m: manévr, r: rychlost, s: "L"/"P" u zatáček,
   v: −1/0/+1 změna hladiny u jednoduchých manévrů (Rovně, Mírná zatáčka), p: pokles u Náletu (letí rovně p + 1)}.
   Barvy manévru: "z" zelená (−1 Napětí), "b" bílá, "c" červená (+1 Napětí); chybějící manévr v číselníku není. ===== */

const NEBE_DESKA = 900;
/* pásmo 1–3 jako pravítko X-Wingu: po 100 mm od okraje podstavce */
const NEBE_PASMO = 100;
const NEBE_HLADINY = ["Přízemí", "Nízko", "Středně", "Vysoko", "Výšiny"];
/* manévry: rychlosti, šablona (rovně / oblouk s poloměrem podle rychlosti a úhlem); „vyska“ = jednoduchý manévr, smí změnit
   hladinu o 1 (Vojta 2026-10-25); o 2 hladiny jen Prudké stoupání a Nálet, které má většina draků omezené (červené nebo chybí).
   Nálet má místo rychlosti pokles p (1–3) a letí rovně p + 1 – čím hlubší pád, tím dál. */
const NEBE_MANEVRY = {
  rovne: {n: "Rovně", r: [1, 2, 3, 4], vyska: true},
  mirna: {n: "Mírná zatáčka", r: [1, 2, 3], uhel: 45, R: {1: 80, 2: 130, 3: 180}, vyska: true},
  ostra: {n: "Ostrá zatáčka", r: [1, 2], uhel: 90, R: {1: 35, 2: 62.5}},
  zvrat: {n: "Zvrat", r: [3, 4]},
  stoupani: {n: "Prudké stoupání", r: [1, 2]},
  nalet: {n: "Nálet", p: [1, 2, 3]},
  viseni: {n: "Visení", r: [0]},
};
/* podstavec podle třídy: malý, střední, velký */
const NEBE_ZAKLAD = {L: 40, S: 60, T: 80};
/* tvar křídel → číselník: zelené, červené a chybějící manévry („m“ = všechny rychlosti, „m:r“ = jedna, „*:r“ = rychlost u všech) */
/* („*:r“ se Náletu netýká – ten má klíč podle poklesu) */
const NEBE_KRIDLA = {
  dlouha_uzka: {n: "dlouhá úzká", z: ["rovne:3", "rovne:4"], c: ["ostra"], x: ["*:1", "zvrat"]},
  siroka_prstnata: {n: "široká prstnatá", z: ["rovne:2", "rovne:3"], c: ["ostra", "zvrat"], x: ["*:4"]},
  siroka_zaoblena: {n: "široká zaoblená", z: ["ostra:1", "mirna"], c: ["zvrat"], x: ["*:4"]},
  srpovita: {n: "srpovitá", z: ["rovne:3", "rovne:4", "mirna"], c: ["zvrat"], x: ["*:1"]},
  spicata: {n: "špičatá", z: ["rovne:4", "nalet"], c: ["ostra"], x: []},
  lomena: {n: "lomená", z: ["ostra"], c: ["rovne:4"], x: []},
  kratka_siroka: {n: "krátká široká", z: ["rovne:1", "stoupani"], c: ["rovne:3"], x: ["*:4"]},
};
/* ocas: letová úprava číselníku, nebo útok ocasem do zadního oblouku (kyj, osten, ostny, hák – podle bestiáře) */
const NEBE_OCASY = {
  vidlicovity: {n: "vidlicovitý", lepsi: ["ostra"]},
  dvojity: {n: "dvojitý", lepsi: ["zvrat"]},
  vejir: {n: "vějíř", z: ["rovne:1", "mirna:1", "ostra:1"]},
  veslo: {n: "veslo", ponor: true},
  kyj: {n: "kyj", utok: true},
  osten: {n: "osten", utok: true},
  ostnaty: {n: "ostnatý", utok: true},
  hak: {n: "hák", utok: true},
  bicovity: {n: "bičovitý"},
};
const NEBE_VLASTNOSTI = {
  plachteni: "Plachtění: na hladinách Vysoko a Výšiny jsou Rovně a mírné zatáčky zelené.",
  vytrvaly: "Vytrvalý let: přistává až při 4 Napětí.",
  stremhlavy: "Střemhlavý let: Nálet o 2 hladiny bílý, umí i Nálet o 3 hladiny.",
  viseni: "Visení: manévr Visení je zelený.",
  tichy: "Tichý let: Nálet na nižší cíl s výhodou; Sledovat proti němu nefunguje.",
  vyskovy: "Výškový let: Výšiny bez Napětí.",
  start_z_mista: "Start z místa: Prudké stoupání bílé.",
  start_z_rozbehu: "Start z rozběhu: z Přízemí stoupá jen rychlostí 2 a víc.",
};
const NEBE_PODPISY = {
  nocni_oci: {
    n: "Noční oči",
    t: "V noci smí kapitán po odhalení posunout manévr o jeden stupeň (rychlost ±1, nebo mírná ↔ ostrá zatáčka). Za šera a v noci ho nelze Zaměřit z dálky větší než pásmo 1.",
  },
};
/* plemena v první verzi bojiště (údaje z Profilů plemen v bestiáři; lindwurmové „létají pomaleji, ale vytrvale“) */
const NEBE_PLEMENA = {
  soumracnik: {n: "Soumračník", tr: "S", kr: "siroka_zaoblena", oc: "vejir", vl: ["tichy"], podpis: "nocni_oci"},
  korutansky_lindwurm: {n: "Korutanský lindwurm", tr: "S", kr: "siroka_prstnata", oc: "veslo", vl: ["vytrvaly"]},
};
/* zranění draka podle kostky Závoje (k6) */
const NEBE_ZRANENI = {
  hlava: {n: "Hlava", k: [6], t: "příští kolo neútočí"},
  trup: {n: "Trup a vzdušné vaky", k: [3, 4, 5], t: "každé stoupání o barvu horší"},
  kridlo: {n: "Křídlo a blána", k: [2], t: "bez ostrých zatáček"},
  ocas: {n: "Ocas", k: [1], t: "bez Zvratu a útoku ocasem, nemůže uchvátit"},
};

const nebeKlic = r => (r.m === "nalet" ? `nalet:${r.p || 1}` : `${r.m}:${r.r}`);
const nebeLepsi = b => ({c: "b", b: "z", z: "z"})[b];
const nebeHorsi = b => ({z: "b", b: "c", c: "c"})[b];
/* změna hladiny manévrem */
const nebeDh = r => (r.m === "nalet" ? -(r.p || 1) : r.m === "stoupani" ? 2 : NEBE_MANEVRY[r.m].vyska ? r.v || 0 : 0);

/* karta draka pro chvíli boje: číselník (klíč „manévr:rychlost“ → barva) podle plemene, hladiny a zranění */
function nebeKarta(pl, k = {}) {
  const P = NEBE_PLEMENA[pl] || pl,
    K = NEBE_KRIDLA[P.kr] || {z: [], c: [], x: []},
    O = NEBE_OCASY[P.oc] || {},
    V = new Set(P.vl || []),
    zr = k.zr || {},
    d = {};
  for (const m in NEBE_MANEVRY) if (m !== "viseni" && m !== "nalet") for (const r of NEBE_MANEVRY[m].r) d[`${m}:${r}`] = "b";
  /* o 2 hladiny většina draků jen s námahou: Prudké stoupání a Nálet o 2 červené, Nálet o 3 jen střemhlaví lovci */
  d["stoupani:1"] = d["stoupani:2"] = "c";
  d["nalet:1"] = "b";
  d["nalet:2"] = "c";
  const kryje = (vzor, klic) => {
    const [m, r] = klic.split(":");
    if (vzor.startsWith("*:")) return m !== "nalet" && vzor.slice(2) === r;
    return vzor.includes(":") ? vzor === klic : vzor === m;
  };
  const nastav = (vzory, f) => {
    for (const klic of Object.keys(d)) if (vzory.some(v => kryje(v, klic))) f(klic);
  };
  nastav(K.z, x => (d[x] = "z"));
  nastav(K.c, x => (d[x] = "c"));
  nastav(K.x, x => delete d[x]);
  nastav(O.lepsi || [], x => (d[x] = nebeLepsi(d[x])));
  nastav(O.z || [], x => (d[x] = "z"));
  if (V.has("viseni")) d["viseni:0"] = "z";
  if (V.has("plachteni") && k.h >= 3) nastav(["rovne", "mirna"], x => (d[x] = "z"));
  if (V.has("stremhlavy")) {
    if (d["nalet:2"] === "c") d["nalet:2"] = "b";
    d["nalet:3"] = d["nalet:3"] || "b";
  }
  if (V.has("start_z_mista")) nastav(["stoupani"], x => d[x] === "c" && (d[x] = "b"));
  if (P.tr === "T") nastav(["stoupani"], x => delete d[x]);
  if (zr.trup) nastav(["stoupani"], x => (d[x] = "c"));
  if (zr.kridlo) nastav(["ostra"], x => delete d[x]);
  if (zr.ocas) nastav(["zvrat"], x => delete d[x]);
  return {
    pl,
    n: P.n,
    tr: P.tr,
    zaklad: NEBE_ZAKLAD[P.tr] || 60,
    d,
    maxNap: V.has("vytrvaly") ? 4 : 3,
    /* stoupání o 1 jednoduchým manévrem: těžký drak a proražené vaky o barvu hůř */
    stoupaHur: P.tr === "T" || !!zr.trup,
    rozbeh: V.has("start_z_rozbehu"),
    ocas: !!O.utok && !zr.ocas,
    tichy: V.has("tichy"),
    vyskovy: V.has("vyskovy"),
    ponor: !!O.ponor,
    drtivy: P.tr === "T",
    podpis: P.podpis || "",
    vl: [...V],
  };
}

/* barva rozkazu na kartě (null = drak ho neumí); stoupání o 1 může být o barvu horší (stoupaHur) */
function nebeBarva(K, r) {
  const b = K.d[nebeKlic(r)] || null;
  return b && r.v === 1 && K.stoupaHur ? nebeHorsi(b) : b;
}

/* smí drak rozkaz zvolit? (chybí v číselníku, výška u složitého manévru, červený s Napětím, mimo hladiny, rozběh ze země) */
function nebeLzeZvolit(K, r, st) {
  if (r.v && !NEBE_MANEVRY[r.m].vyska) return {ok: false, proc: "u tohoto manévru nelze měnit výšku"};
  const b = nebeBarva(K, r);
  if (!b) return {ok: false, proc: "drak tento manévr neumí"};
  if (b === "c" && st.nap > 0) return {ok: false, proc: "s Napětím nelze červený manévr"};
  const h = st.h + nebeDh(r);
  if (h < 0) return {ok: false, proc: "tak nízko už nelze klesnout"};
  if (h > NEBE_HLADINY.length - 1) return {ok: false, proc: "výš než Výšiny nelze"};
  if (K.rozbeh && st.h === 0 && h > 0 && (r.r || 0) < 2) return {ok: false, proc: "ze země jen s rozběhem (rychlost 2 a víc)"};
  return {ok: true, b};
}

/* ---- geometrie ---- */
const nebeRad = u => (u * Math.PI) / 180;
const nebeVpred = u => [Math.sin(nebeRad(u)), -Math.cos(nebeRad(u))];
const nebeVpravo = u => [Math.cos(nebeRad(u)), Math.sin(nebeRad(u))];

/* dráha středu podstavce: od středu k přední hraně, šablona, od zadní hrany k novému středu (jako v X-Wingu);
   bod(t) pro t 0–1 podle délky dráhy; hladina se mění plynule */
function nebeDraha(a, r, K) {
  const b = K.zaklad,
    M = NEBE_MANEVRY[r.m],
    usek = [];
  let x = a.x,
    y = a.y,
    u = a.u;
  const rovne = L => {
    if (L <= 0) return;
    const [fx, fy] = nebeVpred(u),
      x0 = x,
      y0 = y,
      u0 = u;
    usek.push({L, bod: s => ({x: x0 + fx * s, y: y0 + fy * s, u: u0})});
    x += fx * L;
    y += fy * L;
  };
  if (r.m === "viseni") usek.push({L: 0, bod: () => ({x, y, u})});
  else {
    rovne(b / 2);
    if (M.uhel) {
      const R = M.R[r.r],
        fi = M.uhel,
        zn = r.s === "L" ? -1 : 1,
        [vx, vy] = nebeVpravo(u),
        cx = x + zn * R * vx,
        cy = y + zn * R * vy,
        u0 = u;
      usek.push({
        L: (R * Math.PI * fi) / 180,
        bod: s => {
          const al = (s / R) * (180 / Math.PI),
            [px, py] = nebeVpravo(u0 + zn * al);
          return {x: cx - zn * R * px, y: cy - zn * R * py, u: u0 + zn * al};
        },
      });
      const [px, py] = nebeVpravo(u0 + zn * fi);
      x = cx - zn * R * px;
      y = cy - zn * R * py;
      u = u0 + zn * fi;
    } else rovne(40 * (r.m === "nalet" ? (r.p || 1) + 1 : r.r));
    rovne(b / 2);
  }
  const dh = nebeDh(r),
    otoc = r.m === "zvrat" ? 180 : 0,
    L = usek.reduce((s, q) => s + q.L, 0);
  const bod = t => {
    let s = Math.max(0, Math.min(1, t)) * L;
    let p = usek[usek.length - 1].bod(usek[usek.length - 1].L);
    for (const q of usek) {
      if (s <= q.L) {
        p = q.bod(s);
        break;
      }
      s -= q.L;
    }
    return {x: p.x, y: p.y, u: (((p.u + (t >= 1 ? otoc : 0)) % 360) + 360) % 360, h: a.h + dh * Math.max(0, Math.min(1, t))};
  };
  const konec = bod(1);
  konec.h = a.h + dh;
  return {L, bod, konec};
}

/* vzdálenost okrajů podstavců (podstavec jako kruh o poloměru půl strany – stačí pro pásma) */
const nebeOkraje = (a, b, Ka, Kb) => Math.max(0, Math.hypot(a.x - b.x, a.y - b.y) - Ka.zaklad / 2 - Kb.zaklad / 2);
/* pásmo 1–3 (0 = mimo dosah); rozdíl 2 a víc hladin = o pásmo dál */
function nebePasmo(a, b, Ka, Kb) {
  const p = Math.floor(nebeOkraje(a, b, Ka, Kb) / NEBE_PASMO) + 1 + (Math.abs(Math.round(a.h) - Math.round(b.h)) >= 2 ? 1 : 0);
  return p <= 3 ? p : 0;
}
/* kde je b z pohledu a: „predni“ (±45°), „zadni“ (±45° dozadu), jinak „bok“ */
function nebeOblouk(a, b) {
  const sm = (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI,
    rel = ((((sm - a.u) % 360) + 540) % 360) - 180;
  return Math.abs(rel) <= 45 ? "predni" : Math.abs(rel) >= 135 ? "zadni" : "bok";
}

/* překryv podstavců na stejné hladině po pohybu a odsunutí: oba draci se rozestoupí po spojnici středů, až se dotknou */
function nebePrekryv(a, b, Ka, Kb) {
  const d = Math.hypot(a.x - b.x, a.y - b.y),
    min = Ka.zaklad / 2 + Kb.zaklad / 2;
  if (Math.round(a.h) !== Math.round(b.h) || d >= min) return null;
  const [ex, ey] = d > 0.01 ? [(a.x - b.x) / d, (a.y - b.y) / d] : nebeVpravo(a.u),
    o = (min - d) / 2;
  return {a: {...a, x: a.x + ex * o, y: a.y + ey * o}, b: {...b, x: b.x - ex * o, y: b.y - ey * o}};
}

/* útoky draka z konečných pozic (Vojta 2026-10-25: střet až na konci pohybu):
   kousnutí a drápy – přední oblouk, pásmo 1, stejná hladina; po Náletu +1k6 za každou hladinu pádu (Tichý let s výhodou);
   ocas (jen plemena s kyjem, ostnem, ostny nebo hákem) – zadní oblouk, pásmo 1, stejná hladina. Zraněná hlava = drak neútočí. */
function nebeUtokDraka(a, b, Ka, Kb, r, zr = {}) {
  const blizko = nebeOkraje(a, b, Ka, Kb) <= NEBE_PASMO,
    stejna = Math.round(a.h) === Math.round(b.h),
    obl = nebeOblouk(a, b);
  const dosah = chci => {
    if (zr.hlava) return "zraněná hlava – toto kolo neútočí";
    if (obl !== chci) return chci === "predni" ? "cíl není v předním oblouku" : "cíl není za ocasem";
    if (!blizko) return "cíl je dál než pásmo 1";
    if (!stejna) return "cíl je na jiné hladině";
    return "";
  };
  const k = dosah("predni"),
    nalet = !k && r && r.m === "nalet";
  const kousnuti = k
    ? {muze: false, proc: k}
    : {muze: true, bonus: nalet ? r.p || 1 : 0, vyhoda: !!(nalet && Ka.tichy), proc: nalet ? "Nálet shora" : "stejná hladina"};
  if (!Ka.ocas) return {kousnuti, ocas: null};
  const o = dosah("zadni");
  return {kousnuti, ocas: o ? {muze: false, proc: o} : {muze: true, proc: "cíl za ocasem"}};
}

/* Napětí po manévru (barva po Závoji): zelená −1, červená +1; kolo ve Výšinách bez Výškového letu +1 */
function nebeNapeti(nap, barva, K, hKonec) {
  let n = nap + (barva === "z" ? -1 : barva === "c" ? 1 : 0);
  if (hKonec >= 4 && !K.vyskovy) n += 1;
  return Math.max(0, n);
}

/* Závoj jezdce u červeného manévru: Pokušení (1–2) = drak neposlechne a letí rovně stejnou (nebo nejbližší) rychlostí,
   Požehnání (5–6) = manévr bez Napětí */
function nebeZavoj(K, r, k6) {
  if (nebeBarva(K, r) !== "c" || !k6) return {r, barva: nebeBarva(K, r), t: ""};
  if (k6 <= 2) {
    const rr = [1, 2, 3, 4].filter(x => K.d[`rovne:${x}`]).sort((p, q) => Math.abs(p - r.r) - Math.abs(q - r.r))[0];
    const n = {m: "rovne", r: rr || 1, v: 0};
    return {r: n, barva: nebeBarva(K, n) || "b", t: "Pokušení – drak neposlechl a letí rovně"};
  }
  if (k6 >= 5) return {r, barva: "b", t: "Požehnání – manévr bez Napětí"};
  return {r, barva: "c", t: ""};
}

/* Noční oči: v noci po odhalení posun o jeden stupeň – rychlost ±1, nebo mírná ↔ ostrá zatáčka (jen co drak umí a smí) */
function nebeNocniOci(K, r, st) {
  if (K.podpis !== "nocni_oci" || !st.noc) return [];
  const moz = [];
  if (r.m === "nalet") return [];
  for (const dr of [-1, 1]) moz.push({...r, r: r.r + dr});
  if (r.m === "mirna") moz.push({...r, m: "ostra", v: 0});
  if (r.m === "ostra") moz.push({...r, m: "mirna"});
  return moz.filter(x => NEBE_MANEVRY[x.m].r.includes(x.r) && nebeLzeZvolit(K, x, st).ok);
}
