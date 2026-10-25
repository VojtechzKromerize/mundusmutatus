/* ===== Boj: hráč na telefonu (2026-10-20 rozděleno z 20-boj-hraci.js) – formulář útoku (BJU) a jeho obnova po načtení,
   kouzla v listu útoku, hod za zbraň, odeslání vypravěči, zbraně postavy, soustředění, upozornění na tah, rozsvícený displej ===== */
/* hráč: formulář útoku (stav formuláře přežije překreslení) */
const BJU = {
  zi: "",
  cil: "",
  cilL: [],
  cile: [],
  plos: false,
  adv: "auto",
  hod: "",
  d: "",
  dmg: "",
  cim: "",
  t: "Slashing",
  drt: false,
  pru: false,
  dal: false,
  ab: "DEX",
  dc: "",
  pol: true,
  info: "",
  ef: [],
  serie: null,
  ks: null,
  sl: "",
};
/* hráč: rozehraný útok přežije obnovení stránky (2026-10-20) – telefon stránku obnoví po nasazení nové verze nebo po návratu
   z jiné aplikace; hozené a neodeslané kostky, cíl, volby po zásahu, Závoj i otevřený list útoku se uloží v telefonu a po
   načtení vrátí, pokud jde o tutéž postavu, tentýž boj a kolo. Útok, který se právě odesílal, se nevrátí, když už dorazil. */
const BJUK = "mm-bju";
/* formulář útoku a jeho postava: hráč na telefonu má BJU, vypravěč za hráče BGMU[hid] (2026-10-20 – úpravy hodu, volby po zásahu
   a přesun Hexu umí od té doby i vypravěč, protože oba formuláře mají stejný tvar série) */
function bojForm(hid) {
  const s = BOJ.s || {};
  if (GMV && hid) {
    const me = (s.hraci || []).find(h => h.id === hid);
    return {O: (BGMU[hid] = BGMU[hid] || {}), me, K: me && bojKartaH(me), gm: true, s};
  }
  const me = (s.hraci || []).find(h => h.n === bojJa.get());
  return {O: BJU, me, K: me && bojKartaH(me), gm: false, s};
}
const bojFormZbr = F => (F.me ? bojZbrVse(F.s, F.me)[+F.O.zi] : null);
function bojJaUloz() {
  if (GMV) return;
  const s = BOJ.s;
  if (!s || !s.aktivni || !bojJaObnov.hotovo) return;
  const ja = bojJa.get();
  if (!ja) return;
  const me = (s.hraci || []).find(h => h.n === ja),
    K = me && bojKartaH(me);
  const o = {
    ts: Date.now(),
    ja,
    kolo: s.kolo || 1,
    bju: BJU,
    sheet: BDM.sheet && BDM.sheet.t === "utok" ? BDM.sheet : null,
    zav: K && KZAV[K.id] ? Object.assign({}, KZAV[K.id], {_t: undefined}) : null,
    kid: (K && K.id) || null,
    zas: (typeof BZAS !== "undefined" && BZAS) || null,
    rip: (typeof BRIP !== "undefined" && BRIP) || null,
    tab: BTAB,
    jk: BJK.d || "",
  };
  try {
    const t = JSON.stringify(o);
    if (t !== bojJaUloz.p) {
      localStorage.setItem(BJUK, t);
      bojJaUloz.p = t;
    }
  } catch (e) {}
}
function bojJaObnov() {
  if (GMV || bojJaObnov.hotovo) return;
  const s = BOJ.s;
  if (!s) return;
  if (!s.aktivni) {
    bojJaObnov.hotovo = true;
    return;
  }
  const ja = bojJa.get();
  if (!ja) return;
  bojJaObnov.hotovo = true;
  let o = null;
  try {
    o = JSON.parse(mmDex(localStorage.getItem(BJUK)) || "null");
  } catch (e) {}
  if (!o || o.ja !== ja || o.kolo !== (s.kolo || 1) || Date.now() - o.ts > 45 * 60e3 || !o.bju) return;
  const B = o.bju,
    me = (s.hraci || []).find(h => h.n === ja);
  if (!me) return;
  /* odesílání přerušené obnovením: když útok už u vypravěče je, nevracet ho (jinak by šel poslat dvakrát) */
  if (
    B.posila &&
    B.serie &&
    B.serie.length &&
    (s.utoky || []).some(u => u.h === me.id && (+u.k || 0) === (s.kolo || 1) && +u.hod === +B.serie[0].hod && (u.ci || []).includes(B.serie[0].ci))
  )
    B.serie = null;
  delete B.posila;
  const zn = (B.serie || []).length;
  Object.keys(BJU).forEach(k => {
    if (k in B) BJU[k] = B[k];
  });
  ["ripo", "ridT", "ui", "uw", "utk", "un", "zav", "kmin", "zvAuto", "sikOk"].forEach(k => {
    if (k in B) BJU[k] = B[k];
  });
  if (o.zav && o.kid && !KZAV[o.kid]) KZAV[o.kid] = o.zav;
  if (o.sheet && KARTBY[o.sheet.k]) BDM.sheet = o.sheet;
  /* nevyřízené výzvy (zásah s reakcí, Riposte), záložka a zranění pro záchranu soustředění přežijí obnovení taky */
  if (o.zas && o.zas.kid === o.kid && !(s.reak || {})[me.id]) BZAS = o.zas;
  if (o.rip && o.rip.kid === o.kid && !(s.reak || {})[me.id]) BRIP = o.rip;
  if (/^[knldi]$/.test(o.tab || "")) BTAB = o.tab;
  if (o.jk) BJK.d = o.jk;
  if (zn) setTimeout(() => mmHlas("Rozehraný útok je zpátky – stačí ho poslat vypravěči.", 4500), 300);
}
/* hráč: kouzla ve formuláři útoku (2026-10-17) – útok kouzlem (i více paprsků), záchrana jednoho či více cílů, automatický zásah
   (Magic Missile); zranění se škáluje stupněm slotu a úrovní postavy; odesláním se odečte slot a začne soustředění */
function kSpBoj(K, x, lvl) {
  const d = kSpA(x.n);
  if (!d) return null;
  const E = kSpUcinek(K, x, lvl);
  if (E && E.k === "l") return null;
  const t = String(d.t || "");
  const utok = !!(E && E.utok) || /útok kouzlem/i.test(t),
    /* „výhoda na DEX záchranné hody“ (Haste, Protection from Energy…) není záchrana cíle – kouzlo pro spojence (2026-10-24) */
    zach = utok ? null : (E && E.zach) || (t.match(KZACHRE) || [])[1] || null,
    auto = !utok && !zach && !!E && /šipka zasáhne|automaticky zasáh/i.test(t);
  if (!utok && !zach && !auto) return null;
  let pocet = (E && E.pocet) || 1;
  if (pocet === 1 && /\btři\b[^.]{0,30}(šipk|paprsk)/i.test(t)) pocet = 3;
  return {utok, zach, auto, pol: !!(E && E.pol), x: E ? E.x : "", mod: (E && E.mod) || 0, t: (E && E.t) || null, pocet};
}
function bojJaSp(s, me) {
  if (BJU.ks == null || BJU.ks === "") return null;
  const K = bojKartaH(me);
  if (!K || !KSPD) return null;
  const x = kSeznam(K)[+BJU.ks];
  if (!x) return null;
  const sls = x.st > 0 || x.pz ? kSlX(K, x).sort((a, b) => a.st - b.st || (a.pakt ? 1 : -1)) : [];
  if ((x.st > 0 || x.pz) && !sls.length) return null;
  const q = sls.find(z => z.k === BJU.sl) || sls[0] || null,
    lvl = q ? q.st : x.st,
    B = kSpBoj(K, x, lvl);
  return B ? {K, x, i: +BJU.ks, q, sls, lvl, B} : null;
}
/* kolik cílů smí kouzlo v listu útoku (0 = bez omezení – plošná kouzla) */
function bojJaCilMax() {
  const s = BOJ.s || {},
    me = (s.hraci || []).find(h => h.n === bojJa.get()),
    sp = me && bojJaSp(s, me);
  return sp ? kCilUp(sp.x, sp.lvl) : 0;
}
const bojJaSpDmg = (B, krit) => {
  if (!B.x) return {tot: 0, txt: "–"};
  const r = kVyraz((krit ? B.x.replace(/(\d+)d/g, (q, n) => `${2 * n}d`) : B.x) + (B.mod ? (B.mod >= 0 ? "+" : "") + B.mod : ""));
  return r || {tot: 0, txt: "–"};
};
function bojJaZvolKouzlo(i) {
  const s = BOJ.s || {},
    me = (s.hraci || []).find(h => h.n === bojJa.get()),
    K = bojKartaH(me);
  if (!K) return;
  Object.assign(BJU, {ks: i, zi: "", sl: "", serie: null, hod: "", d: "", dmg: "", info: "", drt: false, pru: false, ef: [], kmin: null, pap: []});
  const sp = bojJaSp(s, me);
  if (!sp) {
    BJU.ks = null;
    renderBoj();
    return;
  }
  const B = sp.B,
    r = String((kSp(sp.x.n) || {}).r || sp.x.dosah || "");
  BJU.t = B.t || BJU.t;
  BJU.dal = /\d+\s*stop/.test(r) && !/^5\s*stop/.test(r);
  if (B.zach) {
    BJU.plos = true;
    BJU.ab = B.zach;
    BJU.dc = String(kSpDC(K, sp.x) || "");
    BJU.pol = !!B.pol;
    if (BJU.cil && !BJU.cile.includes(BJU.cil)) BJU.cile = [BJU.cil];
  } else BJU.plos = false;
  renderBoj();
}
function bojJaHodKouzlo(s, me, sp) {
  const {K, x, B, lvl} = sp,
    st = lvl ? `${lvl}. st.` : "trik";
  /* paprsky a šipky na různé cíle (2026-10-24): cíl každého z BJU.pap (bojPapCil v 14) */
  const CL = (s.npc || []).filter(bojCilMoz),
    papy = B.pocet > 1 && CL.length > 1 && !B.zach,
    pc = i => (s.npc || []).find(o => o.id === (papy ? bojPapCil(i, CL) : BJU.cil)),
    c = pc(0);
  if (papy && c) BJU.cil = c.id;
  /* Zadat ručně: d20, kostka Závoje a součet kostek zranění hozené u stolu (u kouzla se záchranou jen zranění) */
  const RU = bRucPrevezmi(me, K, 500);
  if (!RU) return;
  const {r20, r6, rz} = RU;
  const plusK = n => {
    const m = String(B.x || "").match(/([+-]\d+)$/);
    return (m ? +m[1] : 0) + (+B.mod || 0);
  };
  const rucDmg = (n, kus) => ({
    tot: Math.max(0, n + plusK() * kus),
    txt: `${n} (ručně)${plusK() ? ` ${bsg(plusK())}${kus > 1 ? ` ×${kus}` : ""}` : ""}`,
  });
  if (B.zach) {
    const r = rz != null ? rucDmg(rz, 1) : bojJaSpDmg(B, false);
    BJU.dmg = String(r.tot);
    BJU.serie = null;
    BJU.info = `${x.n} (${st}): zranění ${r.txt} = ${r.tot}${B.pol ? " · při úspěšné záchraně polovina" : ""}`;
    renderBoj();
    return;
  }
  if (B.auto && papy) {
    const M = new Map();
    for (let i = 0; i < B.pocet; i++) {
      const ci = pc(i),
        r = i === 0 && rz != null ? rucDmg(rz, 1) : bojJaSpDmg(B, false),
        q = M.get(ci.id) || {ci: ci.id, n: ci.n, dmg: 0, L: []};
      q.dmg += r.tot;
      q.L.push(r.txt);
      M.set(ci.id, q);
    }
    const ser = [...M.values()].map(q => ({ci: q.ci, hod: 60, d: "", dmg: q.dmg, upr: [], zx: q.L.join(" + ")}));
    Object.assign(BJU, {
      hod: "60",
      d: "",
      dmg: String(ser[0].dmg),
      serie: ser,
      kmin: null,
      info: `${x.n} (${st}): automatický zásah – ${[...M.values()].map(q => `${q.n} ${q.L.length}× = ${q.dmg}`).join(" · ")}`,
    });
    renderBoj();
    return;
  }
  if (B.auto) {
    let t = 0;
    const L = [];
    if (rz != null) {
      const r = rucDmg(rz, B.pocet);
      t = r.tot;
      L.push(r.txt);
    } else
      for (let i = 0; i < B.pocet; i++) {
        const r = bojJaSpDmg(B, false);
        t += r.tot;
        L.push(r.txt);
      }
    Object.assign(BJU, {
      hod: "60",
      d: "",
      dmg: String(t),
      serie: null,
      kmin: null,
      info: `${x.n} (${st}): automatický zásah${B.pocet > 1 ? `, ${B.pocet}×` : ""} – ${L.join(" | ")} = ${t}`,
    });
    renderBoj();
    return;
  }
  const b = kSpU1(K, x) - 2 * kVycerp(K),
    ser = [],
    txt = [];
  let v = 0;
  for (let i = 0; i < Math.max(1, B.pocet); i++) {
    const ci = pc(i);
    v = BJU.adv === "auto" ? bojAdvHrac(s, me, ci, BJU.dal).v : +BJU.adv;
    const ru = i === 0 && r20 != null,
      d1 = ru ? r20 : bK(20),
      d2 = v && !ru ? bK(20) : null,
      d = d2 == null ? d1 : v > 0 ? Math.max(d1, d2) : Math.min(d1, d2),
      krit = d === 20,
      PD = kPriHod(K, "Útok", i > 0),
      r = i === 0 && rz != null ? rucDmg(rz, 1) : bojJaSpDmg(B, krit),
      vys = bojJaZas(ci, d + b + PD.t, d, krit);
    ser.push({
      ci: ci ? ci.id : "",
      hod: d + b + PD.t,
      d,
      d1,
      d2,
      v,
      b: b + PD.t,
      dmg: r.tot,
      krit,
      vys,
      upr: [],
      pd: PD.txt,
      pdn: PD.n || [],
      ru,
      zx: r.txt,
    });
    txt.push(
      `${papy && ci ? ci.n + ": " : ""}d20 ${d1}${ru ? " (ručně)" : ""}${d2 != null ? `/${d2}` : ""} ${bsg(b)}${PD.txt} = ${d + b + PD.t}${krit ? " krit!" : d === 1 ? " (1)" : ""}${vys ? ` → ${vys.toUpperCase()}` : ""}, zranění ${r.txt} = ${r.tot}`,
    );
  }
  Object.assign(BJU, {hod: String(ser[0].hod), d: String(ser[0].d), dmg: String(ser[0].dmg), kmin: null, serie: ser});
  const z = kZavoj(K, r6);
  KZAV[K.id] = {co: `Útok – ${x.n}`, d: z.d, r: z.r, hod: z.hod};
  BJU.zav = {d: z.d, r: z.r};
  BJU.info = `${x.n} (${st}). ${v && r20 == null ? `${v > 0 ? "Výhoda" : "Nevýhoda"}. ` : ""}${txt.join(" · ")} · ${zavTxt(z)}${r6 != null ? " (ručně)" : ""}`;
  renderBoj();
}
let BJSPN = 0;
/* značky kouzel na nepříteli, které dávají výhodu na útoky proti němu (2026-10-22); Guiding Bolt se uloží zásahem (20b) */
const BZNADV = {"Faerie Fire": "Faerie Fire (cíl svítí)", "Guiding Bolt": "Guiding Bolt (příští útok)"};
/* w (nepovinná) = zbraň útoku: Heavy pod 13 a „za dostřelem“ (20g); Vex na cíli od této postavy dává výhodu na její příští útok */
function bojAdvHrac(s, me, c, dal, w) {
  const plus = [],
    minus = [],
    st = me.stav || [];
  srdAdv(st, [], dal, plus, minus, true);
  if (c) (c.ef || []).forEach(e => BZNADV[e.n] && plus.push(BZNADV[e.n]));
  if (c && (c.ef || []).some(e => e.n === "Vex" && e.od === me.id)) plus.push("Vex (příští útok)");
  if (w && typeof bojWAdv === "function") bojWAdv(me, w, plus, minus);
  if (c) srdAdv([], c.stav || [], dal, plus, minus);
  const v = plus.length && !minus.length ? 1 : minus.length && !plus.length ? -1 : 0;
  return {v, why: v > 0 ? plus : v < 0 ? minus : plus.length ? ["výhoda i nevýhoda se ruší"] : []};
}
function bojJaUtokHtml(s, me) {
  const zb = bojZbrVse(s, me),
    K = bojKartaH(me),
    zv0 = K && KZBRV[K.id];
  if (zv0 && BJU.zvAuto !== zv0 && !BJU.ks) {
    const i = zb.findIndex(x => x.karta && x.n === zv0);
    if (i >= 0) {
      BJU.zvAuto = zv0;
      BJU.zi = String(i);
      const w0 = zb[i];
      BJU.t = w0.t || BJU.t;
      BJU.drt = !!w0.drt;
      BJU.pru = !!w0.pru;
      BJU.dal = !!w0.dal;
    }
  }
  const cile = (s.npc || []).filter(
    o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
  );
  if (K && !KSPD && !BJSPN) {
    BJSPN = 1;
    kSpNacti()
      .then(() => {
        if (curView === "boj") renderBoj();
      })
      .catch(() => {});
  }
  const sp = bojJaSp(s, me),
    SPL =
      K && KSPD
        ? kSeznam(K)
            .map((x, i) => [x, i])
            .filter(([x]) => kMaSl(K, x) && kSpBoj(K, x, x.st))
        : [];
  const w = sp ? null : zb[+BJU.zi] || null,
    c = cile.find(o => o.id === BJU.cil),
    nav = bojAdvHrac(s, me, c, w ? !!w.dal : BJU.dal),
    am = BJU.adv;
  const moje = (s.utoky || [])
    .filter(u => u.h === me.id)
    .slice(-3)
    .reverse();
  const cilH = BJU.plos
    ? `<div class="bjucl" role="group" aria-label="Cíle plošného útoku">${cile.map(o => `<label><input type="checkbox" data-jucile="${o.id}"${BJU.cile.includes(o.id) ? " checked" : ""}> ${besc(o.n)}</label>`).join("") || "<small>žádní nepřátelé</small>"}</div>`
    : `<label>Cíl <select name="jucil" data-ju="cil"><option value="">— vyber —</option>${cile.map(o => `<option value="${o.id}"${BJU.cil === o.id ? " selected" : ""}>${besc(o.n)}${(o.stav || []).includes("neviditelný") ? " (neviditelný – nevýhoda)" : ""}</option>`).join("")}</select></label>`;
  const zbS = `<label>Čím <select name="juzi" data-ju="zi"><option value="">jiné…</option>${zb.map((x, i) => `<option value="${i}"${String(BJU.zi) === String(i) ? " selected" : ""}>${besc(x.n)}${x.b != null && x.b !== "" ? ` ${bsg(+x.b)}` : ""}${x.z ? " · " + besc(x.z) : ""}</option>`).join("")}${SPL.length ? `<optgroup label="Kouzla">${SPL.map(([x, i]) => `<option value="k${i}"${sp && sp.i === i ? " selected" : ""}>${besc(x.n)} · ${x.st ? x.st + ". st." : "trik"}</option>`).join("")}</optgroup>` : ""}</select></label>${w || sp ? "" : `<input name="jucim" data-ju="cim" value="${besc(BJU.cim)}" placeholder="zbraň / kouzlo" aria-label="Čím útočíš" size="12">`}${sp && sp.sls.length > 1 ? `<label>Slot <select data-jusl aria-label="Slot kouzla">${sp.sls.map(q => `<option value="${q.k}"${sp.q && sp.q.k === q.k ? " selected" : ""}>${q.lab ? `${q.lab} – ${q.st}. st.` : `${q.pakt ? "pakt " : ""}${q.st}. st. (${q.max - q.u})`}</option>`).join("")}</select></label>` : ""}`;
  const spI = sp
    ? `<p class="rsmall bjusp">${besc(sp.x.n)} · ${sp.lvl ? sp.lvl + ". st." : "trik"} · ${sp.B.utok ? `útok kouzlem ${bsg(kSpU1(K, sp.x))}${sp.B.pocet > 1 ? `, ${sp.B.pocet}×` : ""}` : sp.B.zach ? `záchrana ${sp.B.zach} SO ${kSpDC(K, sp.x) || "?"}${sp.B.pol ? ", úspěch = polovina" : ""}` : `zasáhne bez hodu${sp.B.pocet > 1 ? `, ${sp.B.pocet}×` : ""}`}${sp.B.x ? ` · ${besc(sp.B.x)}${sp.B.mod ? bsg(sp.B.mod) : ""} ${besc(BZRT[sp.B.t] || sp.B.t || "")}` : ""}${sp.x.st > 0 || sp.x.kon ? ` · odesláním se ${sp.x.pz ? "odečtou náboje" : sp.x.st > 0 ? "odečte slot" : ""}${sp.x.st > 0 && sp.x.kon ? " a " : ""}${sp.x.kon ? "začne soustředění" : ""}` : ""}</p>`
    : "";
  const typ = `<select name="jut" data-ju="t" aria-label="Typ zranění">${BZTYPY.map(t => `<option value="${t}"${BJU.t === t ? " selected" : ""}>${BZRT[t]}</option>`).join("")}</select>`;
  const adv = BJU.plos
    ? ""
    : `<span class="badv" role="group" aria-label="Výhoda">${[
        ["auto", "auto"],
        ["1", "výhoda"],
        ["-1", "nevýhoda"],
        ["0", "bez"],
      ]
        .map(
          ([k, l]) =>
            `<button type="button" data-juadv="${k}" aria-pressed="${am === k}" ${btip(k === "auto" ? (nav.v ? `Teď ${nav.v > 0 ? "výhoda" : "nevýhoda"}: ${nav.why.join(", ")}` : "Teď bez výhody") : l)}>${l}${k === "auto" && nav.v ? ` <b>${nav.v > 0 ? "+" : "−"}</b>` : ""}</button>`,
        )
        .join("")}</span>`;
  const cisla = BJU.plos
    ? `<label>SO <input type="number" name="judc" data-ju="dc" min="1" max="40" value="${besc(BJU.dc || (K && kSpDC(K)) || "")}" inputmode="numeric"></label><select name="juab" data-ju="ab" aria-label="Záchrana">${BAB.map(a => `<option${BJU.ab === a ? " selected" : ""}>${a}</option>`).join("")}</select><label class="bzrk"><input type="checkbox" data-jupol${BJU.pol ? " checked" : ""}> úspěch = polovina</label><label>Zranění <input type="number" name="judmg" data-ju="dmg" min="0" max="300" value="${besc(BJU.dmg)}" inputmode="numeric"></label>`
    : `<label>Hod <input type="number" name="juhod" data-ju="hod" min="-10" max="60" value="${besc(BJU.hod)}" inputmode="numeric" aria-label="Výsledek hodu na útok"></label><label ${btip("Přirozená kostka – 20 je kritický zásah, 1 minutí (nepovinné)")}>d20 <input type="number" name="jud" data-ju="d" min="1" max="20" value="${besc(BJU.d)}" inputmode="numeric" aria-label="Přirozený hod d20"></label><label>Zranění <input type="number" name="judmg" data-ju="dmg" min="0" max="300" value="${besc(BJU.dmg)}" inputmode="numeric"></label>`;
  return `<details class="bjapd bjut" data-otv="ja-utok"${BOTV.has("ja-utok") ? " open" : ""}><summary>${bojKartaH(me) ? "Jinak – ruční zadání, plošně, kouzlo" : "⚔ Útok"}</summary><div class="bjuf">${K && typeof bojOpakHtml === "function" ? bojOpakHtml(K) : ""}
    <label class="bzrk"><input type="checkbox" data-juplos${BJU.plos ? " checked" : ""}> plošně (kouzlo, salva)</label>${cilH}<div class="bjur">${zbS}${typ}${adv}</div>
    <div class="bjur">${sp && (sp.B.utok || sp.B.auto || sp.B.x) ? `<button type="button" class="gbtn" data-juhod>🎲 ${sp.B.utok ? "Hodit" : "Hodit zranění"}</button>` : ""}${!BJU.plos && w && w.z ? `<button type="button" class="gbtn" data-juhod ${btip(`d20 ${bsg(+w.b || 0)}, zranění ${w.z}${nav.v && am === "auto" ? ` – ${nav.v > 0 ? "výhoda" : "nevýhoda"}` : ""}`)}>🎲 Hodit</button>` : ""}${cisla}</div>${spI}
    ${!BJU.plos && !sp && K && kEfekty(K).length ? `<div class="bjur">${kEfHtml(K, BJU.ef, "data-juef")}</div>` : ""}${K && !BJU.plos ? `<div class="bjur">${kPriHtml(K)}</div>` : ""}
    ${(() => {
      if (BJU.plos || (BJU.serie && BJU.serie.length > 1)) return "";
      const v = bojJaZas(c, BJU.hod, BJU.d, BJU.d !== "" && +BJU.d >= Math.min(20, +BJU.kmin || 20));
      return v
        ? `<p class="bjuvys ${v === "vedle" ? "bmis" : "bkr"}">${v === "vedle" ? "Vedle" : v === "zásah" ? "Zásah!" : "Kritický zásah!"}</p>`
        : "";
    })()}${BJU.info ? `<p class="rsmall">${besc(BJU.info)}</p>` : ""}${!BJU.plos && ((BJU.serie && BJU.serie.length) || BJU.hod !== "") ? bojJaUprHtml(K) : ""}${BJU.serie && BJU.serie.length > 1 ? `<ol class="bjuser">${BJU.serie.map(x => `<li>útok <b>${x.hod}</b>${x.krit ? " (krit)" : x.d === 1 ? " (1)" : ""}${(x.upr || []).length ? ` <small>(${besc(x.upr.join(", "))})</small>` : ""}${x.vys ? ` <b class="bjuv ${x.vys === "vedle" ? "bmis" : "bkr"}">${x.vys}</b>` : ""} · zranění <b>${x.dmg}</b></li>`).join("")}</ol>` : ""}<p><button type="button" class="gbtn" data-juposl>${BJU.serie && BJU.serie.length > 1 ? `Poslat ${BJU.serie.length} útoky` : "Poslat vypravěči"}</button> <small class="rsmall">Hned vidíš, zda jsi zasáhl; zranění a jeho následky vyhodnotí vypravěč.</small></p>
    ${moje.length ? `<ul class="bjumoje">${moje.map(u => `<li>${besc(u.cim || "útok")} → ${besc((u.ci || []).map(i => bojJm(s, i)).join(", "))}: <b>${u.stav === "ceka" ? "čeká na vypravěče" : besc(u.vys || u.stav)}</b></li>`).join("")}</ul>` : ""}</div></details>`;
}
/* Hex a Hunter's Mark: přídavek se přičte sám proti nepříteli se značkou od této postavy (a jen proti němu, když postava nějakou značku má) */
const BZNAC = ["Hex", "Hunter's Mark"];
function bojEfZnacene(me, K, c, w, sel) {
  if (!K) return [];
  const E = kEfAkt(K, sel || BJU.ef, w),
    s = BOJ.s || {},
    moje = n => (s.npc || []).some(o => (o.ef || []).some(e => e.n === n && e.od === me.id));
  const naCili = n => !!c && (c.ef || []).some(e => e.n === n && e.od === me.id);
  return [
    ...E.filter(e => !BZNAC.includes(e.n) || !moje(e.n) || naCili(e.n)),
    ...kEfekty(K).filter(e => BZNAC.includes(e.n) && naCili(e.n) && !E.some(x => x.n === e.n)),
  ];
}
/* ===== Jeden hod na útok pro hráče z telefonu i vypravěče za hráče (2026-10-20) =====
   Dřív měl každý svou kopii (a vypravěčova neznala Hex, Magic Weapon ani Precision). Vstup: zbraň w {n,b,z,t,dal,pocet},
   karta K (vyčerpání, účinky), cíl c (NPC nebo null), výhoda v (−1/0/1), AC cíle (null = neznámé → zranění se hází),
   ručně zadané kostky ruc {d20,dmg}, zda započítat Příhodnost (pd). Účinky E: výchozí bojEfZnacene (Hex jen proti
   označenému cíli, Sneak Attack, Magic Weapon…). Výsledek nese d20, bonus, zásah, zranění s rozpisem a podklad pro
   přehození (dz), aby úprava hodu (Bless, Bardic, Precision) uměla zranění dohodit nebo vynulovat. */
function bojUtokPriprav(o) {
  const {s, h, K, c} = o,
    v = +o.v || 0,
    w = o.pm && o.w ? Object.assign({}, o.w, {z: bojZvKostkaNiz(o.w.z), t: "Piercing", pru: true}) : o.w,
    E = o.E || (K && h && typeof bojEfZnacene === "function" ? bojEfZnacene(h, K, c, w, o.sel) : []);
  const kmin = Math.min(20, ...E.map(e => +e.krit || 20)),
    plus = E.reduce((a, e) => a + (typeof e.zr === "string" ? 0 : +e.zr || 0), 0),
    ez = E.filter(e => typeof e.zr === "string").map(e => e.zr);
  const b0 = (+w.b || 0) - (K ? 2 * kVycerp(K) : 0) + (typeof kEfUt === "function" ? kEfUt(E) : 0),
    PD = o.pd && K ? kPriHod(K, "Útok", !!o.dalsi) : {t: 0, txt: ""},
    b = b0 + PD.t;
  const R = o.ruc || {},
    r20 = bRucN(R.d20, 1, 20),
    rz = bRucN(R.dmg, 0, 300),
    ru = r20 != null;
  const d1 = ru ? r20 : bK(20),
    d2 = v && !ru ? bK(20) : null,
    d = d2 == null ? d1 : v > 0 ? Math.max(d1, d2) : Math.min(d1, d2),
    hod = d + b,
    krit = d >= kmin,
    ac = o.ac == null ? null : +o.ac;
  const zas = d !== 1 && (krit || ac == null || hod >= ac),
    vys = d === 1 ? "vedle" : krit ? "kritický zásah" : ac == null ? null : zas ? "zásah" : "vedle";
  const kRuc = (z, n) => {
    const m = String(z || "").match(/([+-]\d+)$/),
      c0 = m ? +m[1] : 0;
    return {t: Math.max(0, n + c0), x: `${n} (ručně)${c0 ? (c0 > 0 ? "+" : "") + c0 : ""}`};
  };
  const k = zas && w.z ? (rz != null ? kRuc(w.z, rz) : bojKostky(w.z, krit)) : null,
    ek = zas
      ? E.filter(e => typeof e.zr === "string")
          .map(e => {
            const q = bojKostky(e.zr, krit);
            return q ? Object.assign(q, {n: e.n}) : null;
          })
          .filter(Boolean)
      : [];
  /* Vpřed! (Artikule): po rozjezdu se kostky zranění zdvojnásobí (při kritickém zásahu 4×) – web přihodí kostky zbraně ještě jednou */
  const vpm = o.vp && zas && w.z ? String(w.z).match(/^\d*d\d+/) : null,
    vk = vpm ? bojKostky(vpm[0], krit) : null;
  const dmg = zas ? (k ? k.t : 0) + (vk ? vk.t : 0) + (d === 1 ? 0 : plus + ek.reduce((a, q) => a + q.t, 0)) : 0,
    zx = k ? `${k.x}${vk ? ` + ${vk.x} (Vpřed!)` : ""}${plus ? ` +${plus}` : ""}${ek.map(q => ` + ${q.x} (${q.n})`).join("")}` : "";
  const txtHod = `d20 ${d1}${ru ? " (ručně)" : ""}${d2 != null ? `/${d2}` : ""} ${bsg(b0)}${PD.txt} = ${hod}${krit ? " krit!" : d === 1 ? " (1)" : ""}`,
    txtZr = k ? `, zranění ${zx} = ${dmg}` : !zas && w.z ? ", zranění se nehází" : "";
  return {
    d1,
    d2,
    v,
    d,
    b,
    b0,
    hod,
    krit,
    zas,
    vys,
    ru,
    pd: PD.txt,
    pdn: PD.n || [],
    kmin,
    plus,
    dmg,
    zx,
    ac,
    E,
    dz: {z: w.z || "", plus, ez, rz},
    txtHod,
    txtZr,
    wt: w.t,
    wpru: !!w.pru,
  };
}
/* hráč: hod za zbraň (d20 + bonus, s výhodou či nevýhodou; zranění, při přirozené 20 dvojnásob kostek) */
function bojJaHod() {
  const s = BOJ.s || {},
    me = (s.hraci || []).find(h => h.n === bojJa.get()),
    sp = me && bojJaSp(s, me);
  {
    const nes = me && (bojNeschopny(me.stav) || kNeschopny(bojKartaH(me)));
    if (nes) {
      mmHlas(`Nemůžeš jednat – ${nes}. Stav zruší vypravěč nebo záchrana na konci tahu.`, 4000);
      return;
    }
  }
  if (sp) {
    bojJaHodKouzlo(s, me, sp);
    return;
  }
  const w = bojZbrVse(s, me)[+BJU.zi];
  if (!me || !w || BJU.zi === "") {
    mmHlas("Vyber zbraň s kostkou zranění.", 2500);
    return;
  }
  {
    const K0 = bojKartaH(me),
      T0 = K0 && bojSikTypy(K0, w);
    if (T0 && !BJU.sikOk) {
      bojJaSikVolba(K0, w, T0);
      return;
    }
    BJU.sikOk = false;
  }
  const K = bojKartaH(me),
    TL = bojCileL(BJU, s.npc || []).map(id => (s.npc || []).find(o => o.id === id)),
    c = TL[0] || (s.npc || []).find(o => o.id === BJU.cil),
    E = bojEfZnacene(me, K, c, w),
    kmin = Math.min(20, ...E.map(e => +e.krit || 20));
  if (!c && (s.npc || []).filter(bojCilMoz).length > 1) {
    mmHlas("Nejdřív vyber cíl útoku – bez cíle se útok nedá poslat.", 3500);
    return;
  }
  const nav = bojAdvHrac(s, me, c, !!w.dal, w),
    v = BJU.adv === "auto" ? nav.v : +BJU.adv,
    ser = [],
    txt = [];
  /* Zadat ručně: kostky hozené u stolu nahradí hod webu (jen první útok); co chybí, hodí web */
  const RU = bRucPrevezmi(me, K, 300);
  if (!RU) return;
  const {r20, r6, rz} = RU;
  /* útoky téže akce (Extra Attack) jeden po druhém (2026-10-18): každý zvlášť s vlastním d20, zraněním i kostkou Závoje; mezi nimi jde změnit cíl */
  /* útok navíc (Light / Nick / Cleave, 20g): jeden hod mimo pořadí útoků akce, zranění bez kladného modifikátoru */
  const ZT = bojZvVolby(BJU, w),
    NV = typeof bojWmNavic === "function" ? bojWmNavic(K, w, ZT) : null,
    wH = typeof bojWUprav === "function" ? bojWUprav(K, w, ZT) : w,
    TR = typeof bojTrikZvol === "function" ? bojTrikZvol(K, BJU, w) : null;
  const nU = BJU.ripo || NV || TR ? 1 : Math.max(1, +w.pocet || 1, TL.length),
    tk = (s.kolo || 1) * 100 + (s.tah || 0);
  if (!NV && (BJU.uw !== w.n || BJU.utk !== tk)) {
    BJU.ui = 0;
    BJU.uw = w.n;
    BJU.utk = tk;
  }
  const iU = NV ? 0 : Math.min(+BJU.ui || 0, nU - 1);
  BJU.un = nU;
  for (let i = iU; i <= iU; i++) {
    const ci = TL.length ? TL[i % TL.length] : c,
      P = bojUtokPriprav({
        s,
        h: me,
        K,
        w: wH,
        c: ci,
        v,
        ac: ci && ci.ac != null ? ci.ac : null,
        ruc: {d20: r20, dmg: rz},
        pd: true,
        dalsi: i > 0,
        vp: !!ZT.vp,
        pm: !!ZT.pm,
      });
    ser.push({
      ci: ci ? ci.id : "",
      hod: P.hod,
      d: P.d,
      d1: P.d1,
      d2: P.d2,
      v: P.v,
      b: P.b,
      dmg: P.dmg,
      krit: P.krit,
      vys: P.vys,
      upr: [],
      pd: P.pd,
      pdn: P.pdn,
      ru: P.ru,
      zx: P.zx,
      dz: P.dz,
      ...(NV || TR ? {rid: bojRidNavic(NV, TR)} : {}),
    });
    txt.push(
      `${NV ? `Útok navíc (${NV.n}${NV.ba ? ", bonusová akce" : ""}): ` : ""}${nU > 1 ? `Útok ${i + 1} z ${nU}: ` : ""}${TL.length > 1 && ci ? ci.n + ": " : ""}${P.txtHod}${P.vys ? ` → ${P.vys.toUpperCase()}` : ""}${P.txtZr}`,
    );
  }
  if (K && w.karta) {
    const a = kUtoky(K).find(x => x.n === w.n);
    if (a) kMunOdecti(K, a, ser.length);
  }
  if (K) kEfPouzij(K, E, BJU.ef);
  BJU.hod = String(ser[0].hod);
  BJU.d = String(ser[0].d);
  BJU.dmg = String(ser[0].dmg);
  BJU.t = bojUtTyp(K, w) || w.t || BJU.t;
  BJU.drt = !!w.drt;
  BJU.pru = !!w.pru;
  if (ZT.pm) {
    BJU.t = "Piercing";
    BJU.pru = true;
  }
  BJU.kmin = kmin;
  BJU.serie = ser;
  let zv = "";
  BJU.zav = null;
  if (K) {
    const z = kZavoj(K, r6);
    KZAV[K.id] = {co: `Útok – ${w.n}`, d: z.d, r: z.r, hod: z.hod};
    BJU.zav = {d: z.d, r: z.r};
    zv = " · " + zavTxt(z) + (r6 != null ? " (ručně)" : "");
  }
  BJU.info = (v && r20 == null ? `${v > 0 ? "Výhoda" : "Nevýhoda"}. ` : "") + txt.join(" · ") + zv;
  if (!NV && iU >= nU - 1) bojBptOznac("A");
  bojListPrekresli();
}
/* hráč: poslat útok vypravěči */
async function bojJaPosli() {
  const s = BOJ.s || {},
    me = (s.hraci || []).find(h => h.n === bojJa.get());
  if (!me || !bojDB || !bojDB.utok) return;
  const w = bojZbrVse(s, me)[+BJU.zi],
    ci = BJU.plos ? BJU.cile.filter(id => (s.npc || []).some(o => o.id === id)) : bojCileL(BJU, s.npc || []);
  if (!ci.length) {
    mmHlas("Vyber cíl.", 2500);
    return;
  }
  const K = bojKartaH(me),
    sp = bojJaSp(s, me);
  const zak = {
      ci,
      cim: (sp ? `${sp.x.n}${sp.lvl > sp.x.st ? ` (${sp.lvl}. st.)` : ""}` : w && BJU.zi !== "" ? w.n : BJU.cim || "").slice(0, 60),
      t: (sp && sp.B.t) || BJU.t || "Slashing",
      drt: !sp && !!BJU.drt,
      pru: !sp && !!BJU.pru,
    },
    L = [];
  if (sp && sp.q && /^slot[1-9]p?$/.test(sp.q.k || "") && sp.x.st > 0) zak.sl = sp.q.k;
  if (sp && sp.B.zach && sp.B.x && BJU.dmg === "") {
    const r = bojJaSpDmg(sp.B, false);
    BJU.dmg = String(r.tot);
    BJU.info = `${sp.x.n}: zranění ${r.txt} = ${r.tot}`;
  }
  if (BJU.plos) {
    const dc = Math.round(+(BJU.dc || (K && kSpDC(K)) || 0));
    if (!(dc >= 1 && dc <= 40)) {
      mmHlas("Zadej SO záchrany.", 2500);
      return;
    }
    L.push(Object.assign({}, zak, {dmg: Math.max(0, Math.min(300, Math.round(+BJU.dmg || 0))), plos: {ab: BJU.ab, dc, pol: !!BJU.pol}}));
  } else {
    const c = (s.npc || []).find(o => o.id === ci[0]),
      nv = bojAdvHrac(s, me, c, w ? !!w.dal : BJU.dal, w),
      adv = BJU.adv === "auto" ? nv.v : +BJU.adv,
      km = BJU.kmin && BJU.kmin < 20 ? {kmin: BJU.kmin} : {};
    const ser = BJU.serie && BJU.serie.length ? BJU.serie : [{hod: BJU.hod, d: BJU.d, dmg: BJU.dmg}];
    for (const x of ser) {
      if (x.hod === "" || x.hod == null || isNaN(+x.hod)) {
        mmHlas("Zadej výsledek hodu na útok, nebo klikni Hodit.", 3000);
        return;
      }
      const u = Object.assign({}, zak, km, x.ci ? {ci: [x.ci]} : {ci: [ci[0]]}, {
        hod: Math.max(-10, Math.min(60, Math.round(+x.hod))),
        dmg: Math.max(0, Math.min(300, Math.round(+x.dmg || 0))),
        adv: x.v === 1 || x.v === -1 ? x.v : adv,
      });
      if ((x.rid || []).length || BJU.ripo)
        u.cim = `${bojRipoPre(BJU.ripo)}${zak.cim}${(x.rid || [])
          .filter(r => r.g !== "rp")
          .map(r => " + " + (r.cim || r.n))
          .join("")}`.slice(0, 60);
      if (x.d !== "" && +x.d >= 1 && +x.d <= 20) u.d = Math.round(+x.d);
      if (!sp && w && BJU.zi !== "") {
        const zv = bojZvPayload(K, w, x, BJU.zav, bojZvVolby(BJU, w));
        if (zv) u.zv = zv;
        const wm = typeof bojWmPayload === "function" ? bojWmPayload(K, w, x) : null;
        if (wm) u.wm = wm;
      }
      L.push(u);
    }
  }
  const cn = (s.npc || [])
    .filter(o => ci.includes(o.id))
    .map(o => o.n)
    .join(", ");
  if (sp && K && (sp.x.kon || (kSp(sp.x.n) || {}).ko) && kKonDrzi(K)) {
    const cur = kKonNazev(K) || "dosavadní kouzlo";
    if (cur !== sp.x.n) {
      if (!confirm(`${K.n} se soustředí na ${cur}. Seslání ${sp.x.n} soustředění přeruší – ${cur} skončí. Seslat?`)) return;
      await kKonZtrata(K, `nové kouzlo se soustředěním: ${sp.x.n}`);
    }
  }
  if ((await kOdklad(`${zak.cim || "útok"} → ${cn}`, () => true)) === false) {
    BJU.info = "Zrušeno – nic se neodeslalo.";
    renderBoj();
    return;
  }
  const sv = !!(sp && sp.x.pz && sp.x.pz.sv);
  if (sv && (await kartaSeslat(sp.K, sp.x, sp.q && sp.q.k)) === false) {
    BJU.serie = null;
    BJU.info = "Svitek selhal – nic se neodeslalo.";
    renderBoj();
    return;
  }
  const SER = !BJU.plos && BJU.serie && BJU.serie.length === L.length ? BJU.serie : null,
    ZV = BJU.zav;
  BJU.posila = Date.now();
  try {
    bojJaUloz();
  } catch (e) {}
  let fr = false;
  try {
    for (const u of L) {
      try {
        const r = await bojDB.utok(me.id, u);
        if (r && r.$fronta) fr = true;
      } catch (e) {
        if (!(u.sl || u.zv || u.wm) || !/neplatný útok/.test(e.message || "")) throw e;
        delete u.sl;
        delete u.zv;
        delete u.wm;
        await bojDB.utok(me.id, u);
      }
    }
    /* starší databáze bez 'sl' / 'zv' */ bojJaHodyZapis(s, K, L, SER, ZV);
    try {
      await bojJaRidPo(K, me, SER);
    } catch (e) {
      console.error(e);
    }
    if (sp && !sv && (sp.x.st > 0 || sp.x.kon || sp.x.pz)) {
      try {
        await kartaSeslat(sp.K, sp.x, sp.q && sp.q.k);
      } catch (e) {}
      BJU.sl = "";
    }
    BJU.hod = BJU.d = BJU.dmg = "";
    BJU.serie = null;
    BJU.info = fr
      ? "Bez připojení – útok odejde vypravěči, až bude signál."
      : L.length > 1
        ? `Odesláno ${L.length} útoky – čekají na vypravěče.`
        : "Odesláno – čeká na vypravěče.";
    if (!sp && (+BJU.un || 1) > 1) {
      BJU.ui = (+BJU.ui || 0) + 1;
      if (BJU.ui < BJU.un) BJU.info = `Útok ${BJU.ui} z ${BJU.un} odeslán. Další útok téže akce: klidně změň cíl a hoď znovu.`;
      else BJU.ui = 0;
    }
    try {
      navigator.vibrate && navigator.vibrate(40);
    } catch (e) {}
  } catch (err) {
    mmHlas("Nepodařilo se poslat: " + (err.message || err), 5000);
  }
  delete BJU.posila;
  BOJ.v = -2;
  await bojNacti();
  renderBoj();
}
/* odeslaný útok hráče do herního záznamu: kostky d20, zranění a kostka Závoje (Závoj jen u prvního útoku – hází se jednou za akci);
   vypravěč ho v záznamu boje spojí se svým vyhodnocením (zásah proti AC) */
function bojJaHodyZapis(s, K, L, SER, ZV) {
  if (!K || !SER) return;
  L.forEach((u, i) => {
    const x = SER[i] || {},
      c = bojJm(s, (u.ci || [])[0]) || "",
      adv = x.d2 != null && x.v ? ` / ${x.d2} (${x.v > 0 ? "výhoda" : "nevýhoda"})` : "";
    const H = {
      k: K.id,
      kdo: K.n,
      co: `Útok – ${u.cim || "útok"}${c ? " → " + c : ""}`.slice(0, 80),
      tot: u.hod,
      txt: `d20 ${x.d1 != null ? x.d1 : u.d}${x.ru ? " (ručně)" : ""}${adv} ${bsg(x.b != null ? x.b : u.hod - (u.d || 0))}${x.pd || ""} = ${u.hod}${(x.upr || []).length ? ` (${x.upr.join(", ")})` : ""}${u.dmg != null && x.zx ? ` · zranění ${x.zx} = ${u.dmg} ${BZRT[u.t] || u.t || ""}` : u.dmg ? ` · zranění ${u.dmg} ${BZRT[u.t] || u.t || ""}` : ""}`.slice(
        0,
        290,
      ),
    };
    if (u.d != null) H.d = u.d;
    if (x.krit) H.krit = true;
    if (u.d === 1) H.mis = true;
    if (x.v) H.adv = x.v;
    if (i === 0 && ZV) {
      H.zav = ZV.d;
      H.zr = ZV.r || "0";
    }
    kHodZapis(H);
  });
}
/* hráč: moje zbraně (uloží se k postavě) */
function bojZbraneHtml(s, h) {
  const zb = bojZbrH(s, h);
  return `<details class="bjapd bjzb" data-otv="zb-${h.id}"${BOTV.has("zb-" + h.id) ? " open" : ""}><summary>Zbraně ${zb.length ? `(${zb.length})` : ""}</summary>${zb.length ? `<ul class="bzbl">${zb.map((x, i) => `<li><b>${besc(x.n)}</b> ${x.b != null && x.b !== "" ? bsg(+x.b) : ""} ${besc(x.z || "")} ${bikZrTxt(x.t)}<small>${besc(BZRT[x.t] || "")}${x.drt ? " · Drtivá" : ""}${x.pru ? " · Průrazná" : ""}${x.dal ? " · na dálku" : ""}</small> <button type="button" class="bx" data-bzbdel="${i}" aria-label="Smazat ${besc(x.n)}">×</button></li>`).join("")}</ul>` : ""}
    <form class="bzbf" data-bzbf><input name="n" placeholder="název (Dlouhý meč)" required size="14"><input name="b" type="number" min="-5" max="30" placeholder="útok +" inputmode="numeric" aria-label="Bonus k útoku"><input name="z" placeholder="1d8+3" size="7" aria-label="Kostka zranění"><select name="t" aria-label="Typ zranění">${BZTYPY.map(t => `<option value="${t}">${BZRT[t]}</option>`).join("")}</select>
    <label class="bzrk"><input type="checkbox" name="drt"> Drtivá</label><label class="bzrk"><input type="checkbox" name="pru"> Průrazná</label><label class="bzrk"><input type="checkbox" name="dal"> na dálku</label><button class="gbtn ghost">Uložit zbraň</button></form></details>`;
}
/* hráč: soustředění – DC záchrany ze zranění */
function bojKonHtml(me) {
  if (!(me.stav || []).includes("soustředí")) return "";
  const d = BJK.d,
    dc = d ? bojKonDC(d) : null;
  return `<div class="bjkon">${bi("soustredi")} <b>Soustředění:</b> utržil jsem <input type="number" name="jukon" data-jukon min="0" max="300" value="${besc(d || "")}" inputmode="numeric" aria-label="Utržené zranění"> zranění${dc ? ` → <b>CON záchrana SO ${dc}</b> ${bojKartaH(me) ? `<button type="button" class="gbtn" data-jukonh>🎲 Hodit</button>` : ""}<button type="button" class="gbtn ghost" data-jukonx="ok">udržel</button><button type="button" class="gbtn ghost" data-jukonx="ne">ztratil soustředění</button>` : ""}</div>`;
}
const BJK = {d: ""};
/* hráč: přišlo zranění ze záznamu a drží soustředění → předvyplní záchranu na soustředění; hlášení zásahu (bojZasahHlidej) už SO záchrany uvádí.
   Viděné zásahy si pamatuje i po obnovení stránky (2026-10-20: na telefonu se po každém načtení znovu hlásilo zranění z minulého kola) */
function bojKonNovy(s, me, N) {
  if (!(me.stav || []).includes("soustředí")) return;
  const z = N.find(e => e.z > 0);
  if (z) BJK.d = z.z;
}
/* ===== Paměť telefonu v boji (2026-10-20): co už hráč viděl a co má rozehrané =====
   Jedno „viděno“ pro všechny hlídače záznamu (zásah, minutí pro Riposte, zranění při soustředění) místo tří klíčů; nové řádky
   se vyberou jednou za překreslení a rozdají hlídačům, aby si je navzájem nesebrali. Na zařízení, které boj otevírá poprvé,
   se hlásí jen řádky z tohoto kola. */
const BVID = {
  m: 0,
  get() {
    let v = 0;
    try {
      v = Math.max(+localStorage.getItem("mm-boj-videno") || 0, +localStorage.getItem("mm-zas-seen") || 0, +localStorage.getItem("mm-min-seen") || 0);
    } catch (e) {}
    return Math.max(v, this.m);
  },
  set(v) {
    this.m = Math.max(this.m, +v || 0);
    try {
      localStorage.setItem("mm-boj-videno", String(this.m));
    } catch (e) {}
  },
};
function bojZazHlidej(s, me) {
  if (!me || GMV) return;
  const v0 = BVID.get(),
    A = (s.zaz || []).filter(e => e.ts > v0 && (v0 || (+e.k || 0) >= (s.kolo || 1))),
    N = A.filter(e => e.ci === me.id),
    /* zásahy jiných postav (Sentinel, 2026-10-25) */
    J = A.filter(e => e.ci !== me.id && e.ci && e.ai);
  if (!N.length && !J.length) return;
  BVID.set(Math.max(...[...N, ...J].map(x => x.ts)));
  const F = N.length ? [bojKonNovy, bojMinNovy, bojOdvNovy, bojZasahNovy, bojPrilezNovy].map(f => () => f(s, me, N)) : [];
  if (J.length) F.push(() => bojPrilezNovy(s, me, J, true));
  for (const f of F) {
    try {
      f();
    } catch (e) {
      console.error(e);
    }
  }
}
/* hráč bez přihlášené postavy: postava se volí jednou na stránce Hra a pak je jeho */
const bojJaNeprihl = () => {
  const j = JA.get(),
    sc = BOJ.s && BOJ.s.scena;
  const t =
    j && j.k
      ? sc
        ? "Tvoje postava se právě přidává do scény – za chvíli tu bude karta se všemi hody."
        : "Tvoje postava v tomto boji není. Vypravěč ji může přidat; zatím hraješ ze své karty."
      : "Nejsi přihlášený za postavu – přihlas se a zvol svou postavu, pak se tu objeví tvoje bojová karta.";
  return `<span class="rsmall bjanep">${t}</span>${hraHracHtml()}`;
};
/* upozornění hráče, když jeho postava přijde na tah: vibrace, zvýraznění, titulek a hláška */
function bojUpozorni() {
  const s = BOJ.s;
  if (GMV || !s || !s.aktivni) {
    document.title = document.title.replace(/^⚔ Na tahu! · /, "");
    return;
  }
  const ja = ((s.hraci || []).find(h => h.n === bojJa.get()) || {}).id,
    naTahu = ja && (s.obsazeni || {})[s.tah] === ja,
    klic = `${s.kolo}:${s.tah}`;
  document.title = document.title.replace(/^⚔ Na tahu! · /, "");
  const dalsi = ja && !naTahu && (s.obsazeni || {})[(s.tah || 0) + 1] === ja;
  if (dalsi && bojHlasen !== klic + ":d" && bojHlasen !== klic) {
    bojHlasen = klic + ":d";
    try {
      navigator.vibrate && navigator.vibrate(140);
    } catch (e) {}
    mmHlas("Jsi další na řadě – připrav si tah.", 4000);
    return;
  }
  if (!naTahu) return;
  document.title = "⚔ Na tahu! · " + document.title;
  if (bojHlasen === klic) return;
  bojHlasen = klic;
  BTABH[ja] = "utok";
  try {
    navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 400]);
  } catch (e) {}
  const me = (s.hraci || []).find(h => h.id === ja),
    pr = me ? bojPripominky(s, me).filter(x => !/^Reakce je k dispozici/.test(x)) : [];
  mmHlas(`${bojJa.get()}, jsi na tahu!${pr.length ? " " + pr.slice(0, 2).join(" ") : ""}`, pr.length ? 9000 : 6000);
  mmNotif("Jsi na tahu!", bojJa.get());
  const el = document.querySelector(".bslot.bmujtah");
  if (el) el.scrollIntoView({block: "nearest", inline: "center", behavior: "smooth"});
}
/* hráč: během boje drž obrazovku telefonu rozsvícenou */
const BWL = {l: null, ceka: false};
async function bojWake() {
  const chci =
    !GMV && bojBezi(BOJ.s) && curView === "boj" && document.visibilityState === "visible" && !!(navigator.wakeLock && navigator.wakeLock.request);
  if (chci && !BWL.l && !BWL.ceka) {
    BWL.ceka = true;
    try {
      BWL.l = await navigator.wakeLock.request("screen");
      BWL.l.addEventListener("release", () => {
        BWL.l = null;
      });
    } catch (e) {}
    BWL.ceka = false;
  } else if (!chci && BWL.l) {
    const l = BWL.l;
    BWL.l = null;
    try {
      await l.release();
    } catch (e) {}
  }
}
document.addEventListener("visibilitychange", () => {
  bojWake();
});
addEventListener("hashchange", () => setTimeout(bojWake, 50));
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("input[data-ju]") && /^(hod|d)$/.test(t.dataset.ju) && curView === "boj") {
    BJU[t.dataset.ju] = t.value;
    renderBoj();
  }
});
const bojJaZas = (c, hod, d, krit) =>
  !c || c.ac == null || hod === "" || hod == null || isNaN(+hod)
    ? null
    : krit
      ? "kritický zásah"
      : +d === 1
        ? "vedle"
        : +hod >= c.ac
          ? "zásah"
          : "vedle";
/* hráč: Šikovná zbraň – před hodem volba typu zranění */
function bojJaSikVolba(K, w, T) {
  const v = BUTYP[K.id + ":" + w.n];
  mmPop(
    `<h3 class="uvh2">${besc(w.n)}</h3><p class="rsmall">Šikovná zbraň – vyber typ zranění pro tento útok.</p><div class="bsikv">${T.map(t => `<button type="button" class="gbtn${v === t ? "" : " ghost"}" data-bjsik="${t}" data-k="${besc(K.id)}" data-w="${besc(w.n)}">${bikZr(t)} ${besc(BZRT[t] || t)}</button>`).join("")}</div>`,
  );
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bjsik]");
  if (!b) return;
  BUTYP[b.dataset.k + ":" + b.dataset.w] = b.dataset.bjsik;
  BJU.sikOk = true;
  mmPopX();
  bojJaHod();
});
