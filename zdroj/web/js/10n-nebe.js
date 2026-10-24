/* @čisté – Vzdušný boj draků (2026-10-25, návrh v projektu claude.ai pravidla/vzdusny-boj-navrh.md) =====
   ČISTÝ SOUBOR (viz 10u): karta draka z profilu plemene (tvar křídel → číselník, ocas, letové vlastnosti, třída, podpis),
   manévry jako šablony deskové hry X-Wing, současný pohyb všech draků, střet (první přiblížení na pásmo 1 během pohybu),
   překryv podstavců, oblouky, pásma s hladinami, Napětí, Závoj u červeného manévru, Noční oči soumračníka a zranění draka.
   Stránka Nebeské bojiště (22c, samostatná část „nebe“) jen drží stav a kreslí.

   Souřadnice: deska 900 × 900 (milimetry jako u X-Wingu), y roste dolů. Natočení `u` ve stupních: 0 = drak hledí nahoru,
   kladně po směru hodin. Draci: {x, y, u, h: hladina 0–4}. Rozkaz: {m: manévr, r: rychlost, s: "L"/"P" u zatáček, p: pokles u Náletu}.
   Barvy manévru: "z" zelená (−1 Napětí), "b" bílá, "c" červená (+1 Napětí); chybějící manévr v číselníku není. ===== */

const NEBE_DESKA = 900;
/* pásmo 1–3 jako pravítko X-Wingu: po 100 mm od okraje podstavce */
const NEBE_PASMO = 100;
const NEBE_HLADINY = ["Přízemí", "Nízko", "Středně", "Vysoko", "Výšiny"];
/* manévry: rychlosti, šablona (rovně / oblouk s poloměrem podle rychlosti a úhlem), změna hladiny */
const NEBE_MANEVRY = {
  rovne: {n: "Rovně", r: [1, 2, 3, 4]},
  mirna: {n: "Mírná zatáčka", r: [1, 2, 3], uhel: 45, R: {1: 80, 2: 130, 3: 180}},
  ostra: {n: "Ostrá zatáčka", r: [1, 2], uhel: 90, R: {1: 35, 2: 62.5}},
  zvrat: {n: "Zvrat", r: [3, 4]},
  stoupani: {n: "Stoupání", r: [1, 2]},
  nalet: {n: "Nálet", r: [3, 4]},
  viseni: {n: "Visení", r: [0]},
};
/* podstavec podle třídy: malý, střední, velký */
const NEBE_ZAKLAD = {L: 40, S: 60, T: 80};
/* tvar křídel → číselník: zelené, červené a chybějící manévry („m“ = všechny rychlosti, „m:r“ = jedna, „*:r“ = rychlost u všech) */
const NEBE_KRIDLA = {
  dlouha_uzka: {n: "dlouhá úzká", z: ["rovne:3", "rovne:4"], c: ["ostra"], x: ["*:1", "zvrat"]},
  siroka_prstnata: {n: "široká prstnatá", z: ["rovne:2", "rovne:3"], c: ["ostra", "zvrat"], x: ["*:4"]},
  siroka_zaoblena: {n: "široká zaoblená", z: ["ostra:1", "mirna"], c: ["zvrat"], x: ["*:4"]},
  srpovita: {n: "srpovitá", z: ["rovne:3", "rovne:4", "mirna"], c: ["zvrat"], x: ["*:1"]},
  spicata: {n: "špičatá", z: ["rovne:4", "nalet"], c: ["ostra"], x: []},
  lomena: {n: "lomená", z: ["ostra"], c: ["rovne:4"], x: []},
  kratka_siroka: {n: "krátká široká", z: ["rovne:1", "stoupani"], c: ["rovne:3"], x: ["*:4"]},
};
const NEBE_OCASY = {
  vidlicovity: {n: "vidlicovitý", lepsi: ["ostra"]},
  dvojity: {n: "dvojitý", lepsi: ["zvrat"]},
  vejir: {n: "vějíř", z: ["*:1"]},
  veslo: {n: "veslo", ponor: true},
};
const NEBE_VLASTNOSTI = {
  plachteni: "Plachtění: na hladinách Vysoko a Výšiny jsou Rovně a mírné zatáčky zelené.",
  vytrvaly: "Vytrvalý let: přistává až při 4 Napětí.",
  stremhlavy: "Střemhlavý let: Nálet až o 3 hladiny, nikdy červený.",
  viseni: "Visení: manévr Visení je zelený.",
  tichy: "Tichý let: Nálet na nižší cíl s výhodou; Sledovat proti němu nefunguje.",
  vyskovy: "Výškový let: Výšiny bez Napětí.",
  start_z_mista: "Start z místa: z Přízemí Stoupání o 2 hladiny.",
  start_z_rozbehu: "Start z rozběhu: z Přízemí stoupá jen rychlostí 2.",
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
  trup: {n: "Trup a vzdušné vaky", k: [3, 4, 5], t: "Stoupání červené"},
  kridlo: {n: "Křídlo a blána", k: [2], t: "bez ostrých zatáček"},
  ocas: {n: "Ocas", k: [1], t: "bez Zvratu, nemůže uchvátit"},
};

const nebeKlic = r => `${r.m}:${r.r}`;
const nebeLepsi = b => ({c: "b", b: "z", z: "z"})[b];

/* karta draka pro chvíli boje: číselník (klíč „manévr:rychlost“ → barva) podle plemene, hladiny a zranění */
function nebeKarta(pl, k = {}) {
  const P = NEBE_PLEMENA[pl] || pl,
    K = NEBE_KRIDLA[P.kr] || {z: [], c: [], x: []},
    O = NEBE_OCASY[P.oc] || {},
    V = new Set(P.vl || []),
    zr = k.zr || {},
    d = {};
  for (const m in NEBE_MANEVRY) if (m !== "viseni") for (const r of NEBE_MANEVRY[m].r) d[`${m}:${r}`] = "b";
  const kryje = (vzor, klic) => {
    const [m, r] = klic.split(":");
    if (vzor.startsWith("*:")) return vzor.slice(2) === r;
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
  if (V.has("stremhlavy")) nastav(["nalet"], x => d[x] === "c" && (d[x] = "b"));
  if (P.tr === "T") {
    nastav(["stoupani"], x => (d[x] = "c"));
    delete d["stoupani:2"];
  }
  if (V.has("start_z_rozbehu") && k.h === 0) delete d["stoupani:1"];
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
    maxPokles: V.has("stremhlavy") ? 3 : 2,
    stoupa: V.has("start_z_mista") && k.h === 0 ? 2 : 1,
    tichy: V.has("tichy"),
    vyskovy: V.has("vyskovy"),
    ponor: !!O.ponor,
    drtivy: P.tr === "T",
    podpis: P.podpis || "",
    vl: [...V],
  };
}

/* barva rozkazu na kartě (null = drak ho neumí) */
const nebeBarva = (K, r) => K.d[nebeKlic(r)] || null;

/* smí drak rozkaz zvolit? (chybí v číselníku, červený s Napětím, Nálet bez výšky, Stoupání nad Výšiny) */
function nebeLzeZvolit(K, r, st) {
  const b = nebeBarva(K, r);
  if (!b) return {ok: false, proc: "drak tento manévr neumí"};
  if (b === "c" && st.nap > 0) return {ok: false, proc: "s Napětím nelze červený manévr"};
  if (r.m === "nalet") {
    const p = r.p || 1;
    if (p < 1 || p > K.maxPokles) return {ok: false, proc: `Nálet nejvýš o ${K.maxPokles} hladiny`};
    if (st.h - p < 0) return {ok: false, proc: "tak nízko už nelze klesnout"};
  }
  if (r.m === "stoupani" && st.h >= NEBE_HLADINY.length - 1) return {ok: false, proc: "výš než Výšiny nelze"};
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
    } else rovne(40 * r.r);
    rovne(b / 2);
  }
  const dh = r.m === "stoupani" ? K.stoupa : r.m === "nalet" ? -(r.p || 1) : 0,
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

/* střet: první okamžik pohybu, kdy je drak družiny od nepřítele na pásmu 1 (rozdíl hladin nejvýš 1) */
function nebeStret(D, H) {
  const N = 60;
  for (let k = 0; k <= N; k++) {
    const t = k / N,
      P = D.map((d, i) => H[i].bod(t));
    for (let i = 0; i < D.length; i++)
      for (let j = 0; j < D.length; j++)
        if (D[i].strana === "d" && D[j].strana === "n" && Math.abs(P[i].h - P[j].h) < 2 && nebeOkraje(P[i], P[j], D[i].K, D[j].K) <= NEBE_PASMO)
          return {t, a: i, b: j};
  }
  return null;
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

/* útok draka (drápy, kousnutí): přední oblouk, pásmo 1 a stejná hladina, nebo Náletem na nižší cíl (+1k6 za hladinu pádu);
   a.h0 = hladina útočníka na začátku kola (Nálet se počítá z ní) */
function nebeUtokDraka(a, b, Ka, Kb, r, zr = {}) {
  if (zr.hlava) return {muze: false, proc: "zraněná hlava – toto kolo neútočí"};
  if (nebeOblouk(a, b) !== "predni") return {muze: false, proc: "cíl není v předním oblouku"};
  if (nebeOkraje(a, b, Ka, Kb) > NEBE_PASMO) return {muze: false, proc: "cíl je dál než pásmo 1"};
  const nalet = r && r.m === "nalet",
    ha = Math.round(a.h),
    hb = Math.round(b.h);
  if (nalet && (a.h0 ?? ha) > hb) return {muze: true, bonus: r.p || 1, vyhoda: Ka.tichy, proc: "Nálet shora"};
  if (ha !== hb) return {muze: false, proc: "cíl je na jiné hladině"};
  return {muze: true, bonus: 0, vyhoda: false, proc: "stejná hladina"};
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
    const n = {m: "rovne", r: rr || 1};
    return {r: n, barva: nebeBarva(K, n) || "b", t: "Pokušení – drak neposlechl a letí rovně"};
  }
  if (k6 >= 5) return {r, barva: "b", t: "Požehnání – manévr bez Napětí"};
  return {r, barva: "c", t: ""};
}

/* Noční oči: v noci po odhalení posun o jeden stupeň – rychlost ±1, nebo mírná ↔ ostrá zatáčka (jen co drak umí a smí) */
function nebeNocniOci(K, r, st) {
  if (K.podpis !== "nocni_oci" || !st.noc) return [];
  const moz = [];
  for (const dr of [-1, 1]) moz.push({...r, r: r.r + dr});
  if (r.m === "mirna") moz.push({...r, m: "ostra"});
  if (r.m === "ostra") moz.push({...r, m: "mirna"});
  return moz.filter(x => NEBE_MANEVRY[x.m].r.includes(x.r) && nebeLzeZvolit(K, x, st).ok);
}
