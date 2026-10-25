/* ===== Boj: volby po zásahu, přesun Hexu, Riposte, Sharpshooter (2026-10-20) ===== */
/* ===== Volby po zásahu, přesun Hexu, odveta (2026-10-20) =====
   Po hodu, který zasáhl, nabídne list útoku to, co se k zásahu dá přidat: Divine Smite (slot), Eldritch Smite (pakt slot),
   Sneak Attack, Dreadful Strikes (Fey Wanderer), Divine Fury (Zealot v zuřivosti), manévry Battle Mastera (kostka převahy) a u odvety Riposte. Kostky se hodí hned (při kritickém zásahu dvojnásob),
   slot / kostka převahy / bonusová akce se utratí až odesláním útoku vypravěči. */
function bojJaRidery(K, me, w, q, s, O) {
  O = O || BJU;
  if (!K || !me || !w || !q || q.vys === "vedle") return [];
  const R = [],
    U = tahObnov(Object.assign({}, O.ridT), tahKlic(s)),
    uz = g => !tahJednouVolne(U, g),
    blizko = !w.dal,
    /* hráč AC cíle nezná: smity (Divine, Eldritch, kouzla „ihned po zásahu“) se nabídnou až po potvrzeném zásahu (bojJaSmityPo, 2026-10-24) */
    poPotvrzeni = !GMV && q.vys == null;
  const sez = new Set(kSeznam(K).map(x => String(x.n).toLowerCase())),
    EF = kEfekty(K),
    sel = (O.ef || []).map(i => EF[i]).filter(Boolean);
  if (!poPotvrzeni && blizko && sez.has("divine smite") && !uz("ds") && !sel.some(e => e.slot)) {
    const Q = kSloty(K)
      .filter(z => z.u < z.max)
      .sort((a, b) => a.st - b.st || (a.pakt ? 1 : -1));
    [...new Map(Q.map(z => [z.st, z])).values()].slice(0, 4).forEach(z =>
      R.push({
        k: "ds:" + z.k,
        g: "ds",
        n: `Divine Smite ${z.st}. st.`,
        zr: `${1 + z.st}d8`,
        cena: {slot: z.k, st: z.st, kz: "Divine Smite"},
        ba: 1,
        t: "Radiant",
        cim: "Divine Smite",
        pozn: `+${1 + z.st}d8 Radiant (proti Fiend a Undead o 1d8 víc), slot ${z.st}. st.${z.pakt ? " (pakt)" : ""}, bonusová akce`,
      }),
    );
  }
  /* kouzla „bonusová akce ihned po zásahu“ (2026-10-22): Searing, Wrathful, Thunderous, Shining, Blinding, Staggering, Banishing Smite…
     nabídnou se u zásahu zbraní (nejnižší volný slot); odesláním se kouzlo sešle (slot, trvání, soustředění). Jedno za útok, s Divine Smite se vylučují. */
  if (!poPotvrzeni && !uz("ds") && !sel.some(e => e.slot) && typeof kSmity === "function")
    kSmity(K).forEach(x => {
      if (x.blizko && !blizko) return;
      const q = kSlX(K, x).sort((a, b) => a.st - b.st || (a.pakt ? 1 : -1))[0];
      if (!q) return;
      const E = kSpUcinek(K, x, q.st),
        hned = !!(E && E.k === "z" && E.x && x.hned);
      const st = bojSpStav(x.n),
        dc = kSpDC(K, x),
        za = st && x.zach ? `${x.zach} SO ${dc}` : "";
      R.push({
        k: "sm:" + x.n,
        g: "ds",
        n: x.n,
        zr: hned ? E.x : null,
        cena: {slot: q.k, st: q.st, kz: x.n},
        ba: 1,
        t: (E && E.t) || "",
        cim: za ? `${x.n} (${za})` : x.n,
        pozn: `${hned ? `+${E.x} ${E.t || ""} ` : ""}za slot ${q.st}. st.${q.pakt ? " (pakt)" : ""}, bonusová akce${za ? `; cíl: záchrana ${za}, při neúspěchu ${st.st.join(", ")}` : ""}${x.kon ? "; soustředění" : ""}`,
      });
    });
  if (!poPotvrzeni && kMaRys(K, /(^|: ?)eldritch smite$/i) && !uz("es")) {
    const z = kSloty(K).filter(z => z.pakt && z.u < z.max)[0];
    if (z)
      R.push({
        k: "es:" + z.k,
        g: "es",
        n: "Eldritch Smite",
        zr: `${1 + z.st}d8`,
        cena: {slot: z.k, st: z.st},
        t: "Force",
        cim: "Eldritch Smite",
        pozn: `+${1 + z.st}d8 Force za pakt slot ${z.st}. st.; cíl velikosti Huge a menší můžeš srazit (Sražen) – vypravěč to uvidí u útoku`,
      });
  }
  const ro = kTrU(kCtx(K), "Rogue");
  if (ro && !uz("sa") && !sel.some(e => e.n === "Sneak Attack"))
    R.push({
      k: "sa",
      g: "sa",
      n: "Sneak Attack",
      zr: `${Math.ceil(ro / 2)}d6`,
      pozn: "jednou za tah: s výhodou, nebo když je u cíle tvůj spojenec; zbraň Finesse nebo na dálku",
    });
  /* Fey Wanderer – Dreadful Strikes (2026-10-22): jednou za tah při zásahu zbraní +1d4 Psychic, od 11. úrovně hraničáře 1d6 */
  const ra = kTrU(kCtx(K), "Ranger"),
    drk = ra >= 11 ? "1d6" : "1d4";
  if (ra && kMaRys(K, /^dreadful strikes$/i) && !uz("dr"))
    R.push({
      k: "dr",
      g: "dr",
      n: "Dreadful Strikes",
      zr: drk,
      cim: "Dreadful Strikes (Psychic)",
      pozn: `+${drk} Psychic zranění, jednou za tah (zásah zbraní)`,
    });
  /* Path of the Zealot – Divine Fury (2026-10-22): v zuřivosti první zásah v tahu +1d6 + polovina úrovně barbara, Radiant nebo Necrotic */
  const ba = kTrU(kCtx(K), "Barbarian"),
    dfz = `1d6+${Math.floor(ba / 2)}`;
  if (ba && kMaRys(K, /^divine fury$/i) && kPri(K).includes("Rage") && !uz("df"))
    ["Radiant", "Necrotic"].forEach(t =>
      R.push({
        k: "df:" + t,
        g: "df",
        n: `Divine Fury (${t})`,
        zr: dfz,
        cim: `Divine Fury (${t})`,
        pozn: `+${dfz} ${t} zranění: první zásah v tahu během zuřivosti`,
      }),
    );
  const SD = kSD(K);
  if (SD && SD.zb > 0) {
    const M = kManevry(K),
      dc = kSDdc(K);
    (M.length ? M : [["Manévr", "manévr"]])
      .filter(m => m[0] !== "Lunging Attack" || blizko)
      .forEach(m =>
        R.push({
          k: "m:" + m[0],
          g: "m",
          n: m[0],
          zr: "1" + SD.k,
          cena: {sd: 1},
          cim: m[2] ? `${m[0]} (${m[2]} SO ${dc})` : m[0],
          pozn: `+1${SD.k} ke zranění (kostka převahy, zbývá ${SD.zb})${m[2] ? `; cíl: záchrana ${m[2]} SO ${dc}, při neúspěchu ${m[3]}` : ""}`,
        }),
      );
  }
  if (bojRipoJeRiposte(O.ripo) && SD && O.ripo.ai === q.ci)
    R.push({k: "rp", g: "rp", n: "Riposte", zr: "1" + SD.k, pozn: "odveta: kostka převahy ke zranění (utratí se odesláním)"});
  if (typeof bojZvRidery === "function") R.push(...bojZvRidery(K, me, w, q, s, O));
  if (typeof bojWmRidery === "function") R.push(...bojWmRidery(K, me, w, q));
  return R;
}
/* přídavky bez kostek (perk, mistrovství, útok navíc): u zvoleného jen ✓ */
const BRIDBEZ = new Set(["zv", "wm", "nl", "cl", "tr"]);
function bojJaRidHtml(K, q, hid) {
  if (!K || !q) return "";
  const F = bojForm(hid),
    {s, me, O} = F,
    w = bojFormZbr(F),
    H = hid ? ` data-bph="${besc(hid)}"` : "";
  if (!me || !w) return "";
  const R = bojJaRidery(K, me, w, q, s, O),
    A = q.rid || [];
  const gw =
    q.krit && kMaRys(K, /^great weapon master$/i) && w && kTezka(K, w)
      ? `<small class="bjurgw">Great Weapon Master: po kritickém zásahu můžeš bonusovou akcí zaútočit znovu.</small>`
      : "";
  if (!R.length && !A.length) return gw;
  const ap = new Set(A.map(r => r.k)),
    ag = new Set(A.map(r => r.g)),
    L = [...R, ...A.filter(r => !R.some(x => x.k === r.k))];
  return `<div class="bjur bjurid" role="group" aria-label="Přidat k zásahu"><small>Přidat k zásahu${q.krit ? " (kritický – kostky dvakrát)" : ""}:</small>${L.map(r => `<button type="button" class="gbtn ghost${ap.has(r.k) ? " on" : ""}" data-jurid="${besc(r.k)}"${H} aria-pressed="${ap.has(r.k)}"${!ap.has(r.k) && ag.has(r.g) ? " disabled" : ""} ${btip(r.pozn || r.n)}>${r.g === "zv" ? bikZv(r.n) : r.g === "wm" && typeof BWMIK !== "undefined" ? bi(BWMIK[r.n] || "boj") : ""}${besc(r.n)} <small>${ap.has(r.k) ? (BRIDBEZ.has(r.g) ? "✓" : `${(A.find(x => x.k === r.k) || {}).t} ✓`) : r.zr ? "+" + besc(r.zr) : r.g === "zv" ? "Požehnání" : r.g === "wm" ? "mistrovství" : "účinek"}</small></button>`).join("")}${gw}</div>`;
}
function bojJaRid(k, hid) {
  const F = bojForm(hid),
    {s, me, K, O} = F,
    w = bojFormZbr(F),
    ser = O.serie || [],
    i = Math.min(+O.ui || 0, ser.length - 1),
    q = ser[Math.max(0, i)];
  if (!q || !K || !w) return;
  q.rid = q.rid || [];
  const j = q.rid.findIndex(r => r.k === k);
  let txt;
  if (j >= 0) {
    const r = q.rid[j];
    q.dmg = Math.max(0, (+q.dmg || 0) - r.t);
    q.zx = String(q.zx || "").replace(r.x, "");
    q.rid.splice(j, 1);
    txt = `${r.n} zrušeno → zranění ${q.dmg}`;
  } else {
    const R = bojJaRidery(K, me, w, q, s, O).find(r => r.k === k);
    if (!R || q.rid.some(r => r.g === R.g)) return;
    if (R.g === "zv" || R.g === "wm") {
      q.rid.push({k, g: R.g, n: R.n, t: 0, x: "", cim: R.cim || R.n});
      O.info = `${O.info ? O.info + " · " : ""}${R.pozn}`;
      bojListPrekresli();
      return;
    }
    const kk = R.zr ? bojKostky(R.zr, q.krit) : {t: 0, x: ""};
    if (!kk) return;
    const x = kk.x ? ` + ${kk.x} (${R.n})` : "";
    q.dmg = (+q.dmg || 0) + kk.t;
    q.zx = (q.zx || "") + x;
    q.rid.push({k, g: R.g, n: R.n, t: kk.t, x, cena: R.cena || null, ba: R.ba || 0, cim: R.cim || R.n});
    txt = kk.x ? `${R.n} ${kk.x} = ${kk.t} → zranění ${q.dmg}` : `${R.n} přidán`;
  }
  if (ser.indexOf(q) === 0) O.dmg = String(q.dmg);
  O.info = `${O.info ? O.info + " · " : ""}${txt}`;
  bojListPrekresli();
}
/* po odeslání: utratit slot / kostku převahy / bonusovou akci a reakci odvety; „jednou za tah“ si pamatuje tento telefon */
async function bojJaRidPo(K, me, SER, O) {
  O = O || BJU;
  if (!K || !me) return;
  const s = BOJ.s || {};
  O.ridT = tahObnov(O.ridT || {}, tahKlic(s));
  for (const q of SER || [])
    for (const r of q.rid || []) {
      if (/^(ds|es|sa|dr|df|nl|cl)$/.test(r.g)) tahJednouZapis(O.ridT, r.g);
      if (r.g === "nl" || r.g === "cl") Object.values(O.zvt || {}).forEach(T => delete T[r.g]);
      const c = r.cena;
      try {
        if (c && c.kz) await kartaSeslat(K, {n: c.kz, st: c.st, kon: false}, c.slot);
        else if (c && c.slot) {
          const U = Object.assign({}, kartaStav(K.id).zdr || {});
          U[c.slot] = (U[c.slot] || 0) + 1;
          await kartaStavZmen(K.id, {zdr: U});
          kHodZapis({k: K.id, kdo: K.n, co: r.n, txt: `pakt slot ${c.st}. st. · ${r.x.replace(/^ \+ /, "")}`});
        } else if (c && c.sd) {
          const z = kSD(K);
          if (z) await kZdrUtrat(K, z);
        }
      } catch (e) {
        console.error(e);
      }
      if (r.ba && typeof bojBptOznac === "function") bojBptOznac("B");
    }
  if (O.ripo) {
    if (bojRipoJeRiposte(O.ripo)) {
      const z = kSD(K);
      try {
        if (z) await kZdrUtrat(K, z);
      } catch (e) {}
    }
    bojHracAkce(me.id, (x, zz) => {
      (zz.reak = zz.reak || {})[me.id] = 1;
    });
    O.ripo = null;
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-jurid]");
  if (b && !b.disabled) bojJaRid(b.dataset.jurid, b.dataset.bph);
});
/* ===== Smity po potvrzeném zásahu (2026-10-24, Vojta) =====
   Na vlastním tahu, když vypravěč zapsal zásah zbraní z tohoto kola, nabídne karta Divine Smite, Eldritch Smite a kouzla „ihned po
   zásahu“ (Wrathful, Shining…). Seslání pošle zranění smitu jako další útok s automatickým zásahem (hod 60) na tentýž cíl – při
   kritickém zásahu kostky dvakrát – a utratí slot, bonusovou akci a „jednou za tah“ stejně jako přídavek před odesláním (bojJaRidPo). */
const BSMPO = {};
const bojJaSmitZasah = u => u && u.stav === "hotovo" && !/^(vedle|vypravěč|zásah bez účinku)|záchrana/.test(String(u.vys || ""));
/* bezTahu: bez kontroly hráče na tahu (testy) */
function bojJaSmitNabidka(s, h, bezTahu) {
  if (!h || (!bezTahu && (GMV || (s.obsazeni || {})[s.tah] !== h.id))) return null;
  const K = bojKartaH(h);
  if (!K) return null;
  const u = (s.utoky || []).filter(x => x.h === h.id && !x.sid && (+x.k || 0) === (s.kolo || 1)).slice(-1)[0];
  if (!bojJaSmitZasah(u) || BSMPO[u.id] || / smite\b/i.test(u.cim || "")) return null;
  const w = bojZbrVse(s, h).find(x => x.n === bojZvJm(u));
  if (!w || !w.karta) return null;
  const krit = /kritick/.test(u.vys || ""),
    R = bojJaRidery(K, h, w, {vys: krit ? "kritický zásah" : "zásah", krit, ci: (u.ci || [])[0]}, s, BJU).filter(r => r.g === "ds" || r.g === "es");
  return R.length ? {K, u, w, krit, R} : null;
}
function bojJaSmityPo(s, h) {
  const N = bojJaSmitNabidka(s, h);
  if (!N) return "";
  return `<div class="bjur bjurid bjsmpo" role="group" aria-label="Po zásahu"><small>${N.krit ? "Kritický zásah" : "Zásah"} potvrzen – můžeš přidat${N.krit ? " (kostky dvakrát)" : ""}:</small>${N.R.map(r => `<button type="button" class="gbtn ghost" data-jsmpo="${besc(N.u.id)}|${besc(r.k)}" ${btip(r.pozn || r.n)}>${besc(r.n)} <small>${r.zr ? "+" + besc(r.zr) : "účinek"}</small></button>`).join("")}<button type="button" class="gbtn ghost" data-jsmpo="${besc(N.u.id)}|">nic</button></div>`;
}
async function bojJaSmitPo(uid, k) {
  const s = BOJ.s || {},
    me = (s.hraci || []).find(x => x.n === bojJa.get());
  if (!k) {
    BSMPO[uid] = 1;
    renderBoj();
    return;
  }
  const N = me && bojJaSmitNabidka(s, me),
    R = N && N.u.id === uid && N.R.find(r => r.k === k);
  if (!R || !bojDB || !bojDB.utok) return;
  BSMPO[uid] = 1;
  const kk = R.zr ? bojKostky(R.zr, N.krit) : {t: 0, x: ""},
    ci = (N.u.ci || [])[0],
    x = {rid: [{k, g: R.g, n: R.n, t: kk.t, x: kk.x ? ` + ${kk.x} (${R.n})` : "", cena: R.cena || null, ba: R.ba || 0, cim: R.cim || R.n}]};
  try {
    await bojDB.utok(me.id, {
      ci: [ci],
      cim: String(R.cim || R.n).slice(0, 60),
      hod: 60,
      dmg: kk.t,
      adv: 0,
      t: R.t || N.u.t || "Radiant",
      drt: false,
      pru: false,
    });
    kHodZapis({
      k: N.K.id,
      kdo: N.K.n,
      co: `${R.n} → ${bojJm(s, ci)}`.slice(0, 80),
      tot: kk.t,
      txt: kk.x ? `${kk.x} = ${kk.t}` : "účinek bez zranění",
    });
    await bojJaRidPo(N.K, me, [x]);
    mmHlas(`${R.n}${kk.x ? ` ${kk.x} = ${kk.t}` : ""} – odesláno vypravěči.`, 4000);
  } catch (err) {
    delete BSMPO[uid];
    mmHlas("Nepodařilo se poslat: " + (err.message || err), 5000);
  }
  BOJ.v = -2;
  await bojNacti();
  renderBoj();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-jsmpo]");
  if (!b) return;
  const [uid, k] = b.dataset.jsmpo.split("|");
  bojJaSmitPo(uid, k);
});
/* Hex / Hunter's Mark: když označený cíl padne (nebo zmizí z boje), karta nabídne přenést značku bonusovou akcí na jiného nepřítele */
const BZNACP = " (přesun)";
function bojJaHexHtml(s, me, K) {
  if (!K || !me || !s.aktivni) return "";
  const jm = n => (typeof kzJm === "function" ? kzJm(n) : String(n).replace(/\s*\(\d+\. st\.\)$/, ""));
  const u = kUc(K).find(x => x.kon && /^(Hex|Hunter's Mark)$/.test(jm(x.n)));
  if (!u) return "";
  const nm = jm(u.n);
  const zivy = o =>
    !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0);
  const nosi = (s.npc || []).filter(o => (o.ef || []).some(e => e.n === nm && e.od === me.id));
  if (nosi.some(zivy)) return "";
  const C = (s.npc || []).filter(zivy);
  if (!C.length) return "";
  return `<div class="khl kjuhex">${bi("soustredi")} <b>${besc(nm)}</b>: ${nosi.length ? `${besc(nosi.map(o => o.n).join(", "))} už nebojuje` : "označený cíl už v boji není"} – bonusovou akcí přeneseš značku na: ${C.map(o => `<button type="button" class="gbtn ghost" data-juhexp="${besc(nm)}|${besc(o.id)}" data-juhexh="${besc(me.id)}">${besc(o.n)}</button>`).join("")}</div>`;
}
document.addEventListener("click", async e => {
  const b = e.target.closest && e.target.closest("[data-juhexp]");
  if (!b) return;
  const [nm, id] = b.dataset.juhexp.split("|"),
    s = BOJ.s || {},
    me = (s.hraci || []).find(h => h.id === b.dataset.juhexh),
    n = (s.npc || []).find(o => o.id === id);
  if (!me || !n) return;
  if (GMV) {
    await bojZmen(z => {
      const q = (z.npc || []).find(o => o.id === id);
      if (q) bojEfZnac(z, q, nm + BZNACP, {h: me.id});
    });
    mmHlasG(`${nm} přenesen na ${n.n}.`, 3500);
    return;
  }
  if (!bojDB || !bojDB.utok || (await kOdklad(`${nm} → ${n.n}`, () => true)) === false) return;
  try {
    await bojDB.utok(me.id, {ci: [id], cim: (BUEF + nm + BZNACP).slice(0, 60), hod: 0});
    const K = bojKartaH(me);
    if (K) kHodZapis({k: K.id, kdo: K.n, co: `${nm}: přesun`, txt: n.n});
    if (typeof bojBptOznac === "function") bojBptOznac("B");
    mmHlas(`${nm} → ${n.n}${potvrz().rezim !== "nic" ? " – vypravěč potvrdí" : ""}.`, 4000);
    BOJ.v = -2;
    await bojNacti();
    renderBoj();
  } catch (err) {
    mmHlas("Nepodařilo se poslat: " + (err.message || err), 5000);
  }
});
/* AC cíle, jak ji zná vypravěč (zbroj ze statbloku, kryt; Sharpshooter kryt nepočítá) – hráč ji nezná, dostane null */
function bojCilAC(s, h, c, w) {
  if (!c || !GMV) return c && c.ac != null ? +c.ac : null;
  const E = bojEff(c),
    ZS = E ? bojZbrStav(c, E) : null;
  if (!ZS) return c.ac != null ? +c.ac : null;
  return ZS.ac + (bojSS(s, h, {cim: w && w.n}) ? 0 : +c.kryt || 0);
}
/* Sharpshooter (D&D 2024): útok zbraní na dálku nepočítá krytí cíle */
function bojSS(s, h, u) {
  const K = h && bojKartaH(h);
  if (!K || !kMaRys(K, /^sharpshooter$/i)) return false;
  const nm = String(u.cim || "")
      .replace(/^(Riposte|Odveta): /, "")
      .split(" + ")[0],
    w = bojZbrVse(s, h).find(x => x.n === nm);
  return !!(w && w.dal);
}
