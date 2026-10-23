/* ===== Scéna mimo boj: NPC ve scéně (statistiky, víra, cíle), jednání hráčů s NPC a protihody vypravěče (2026-10-23) =====
   Scéna je stav boje se `scena: true` (11: bojNovaScena, bojBezi). Údaje NPC jen pro vypravěče jsou v `n.gm` – databáze je
   hráčům vyřízne (mm_boj_orez). Statistiky se předvyplní ze statbloku (SRD i vlastní bestiář), vypravěč je může přepsat. */
const SCAB = ["STR", "AGI", "CON", "INT", "WIS", "CHA"];
const SCPOST = [
  ["pratelsky", "přátelský"],
  ["lhostejny", "lhostejný"],
  ["nepratelsky", "nepřátelský"],
];
/* protihod NPC k dovednosti hráče: na přesvědčování, klam a zastrašování Vhled, na plížení a kapsářství Vnímání */
const SCPROTI = {
  Persuasion: "Insight",
  Deception: "Insight",
  Intimidation: "Insight",
  Performance: "Insight",
  Stealth: "Perception",
  "Sleight of Hand": "Perception",
  Athletics: "Athletics",
  Acrobatics: "Athletics",
  Insight: "Deception",
};
const scMod = v => Math.floor(((+v || 10) - 10) / 2);
const scCislo = t => +String(t).replace("−", "-");
/* statistiky ze statbloku: vlastnosti a záchrany z tabulky, dovednosti, pasivní Vnímání a bonus zdatnosti */
function scZeStatbloku(p) {
  const h = String((p && p.h) || ""),
    ab = {},
    zach = {},
    dov = {};
  let i = 0;
  for (const m of h.matchAll(/<td>(\d+) \(([+−-]\d+)\)(?:<br><small>záchr\. ([+−-]\d+)<\/small>)?<\/td>/g)) {
    if (i >= 6) break;
    ab[SCAB[i]] = +m[1];
    if (m[3] != null) zach[SCAB[i]] = scCislo(m[3]);
    i++;
  }
  const dm = h.replace(/<[^>]+>/g, "").match(/Dovednosti\s+(.*?)(?:\s·|$)/m);
  if (dm)
    dm[1].split(/,\s*/).forEach(x => {
      const q = x.match(/^(.+?)\s+([+−-]\d+)$/);
      if (q) dov[q[1].trim()] = scCislo(q[2]);
    });
  const pv = (h.match(/pasivní Perception (\d+)/) || [])[1],
    pb = (h.match(/Bonus zdatnosti<\/b> \+(\d+)/) || [])[1];
  return {ab, zach, dov, pv: pv ? +pv : null, pb: pb ? +pb : null};
}
const scDovTxt = d =>
  Object.entries(d || {})
    .map(([k, v]) => `${k} ${bsg(v)}`)
    .join(", ");
function scDovZTxt(t) {
  const d = {};
  String(t || "")
    .split(/[,;]\s*/)
    .forEach(x => {
      const q = x.trim().match(/^(.+?)\s+([+−-]?\d+)$/);
      if (q && KDOVAB[q[1].trim()]) d[q[1].trim()] = scCislo(q[2]);
    });
  return d;
}
/* výsledné statistiky NPC: úpravy vypravěče (n.gm) mají přednost před statblokem */
function scStat(n) {
  const p = PROTBY[n.b] || null,
    z = p ? scZeStatbloku(p) : {ab: {}, zach: {}, dov: {}, pv: null, pb: null},
    g = n.gm || {};
  const ab = {};
  SCAB.forEach(a => (ab[a] = g.ab && g.ab[a] != null ? +g.ab[a] : z.ab[a] != null ? z.ab[a] : 10));
  const dov = g.dov != null ? scDovZTxt(g.dov) : z.dov;
  const dovB = sk => (dov[sk] != null ? dov[sk] : scMod(ab[KDOVAB[sk]]));
  const zachB = a => (z.zach[a] != null && !(g.ab && g.ab[a] != null) ? z.zach[a] : scMod(ab[a]));
  return {
    ab,
    dov,
    dovB,
    zachB,
    pv: z.pv != null && g.dov == null ? z.pv : 10 + dovB("Perception"),
    pvh: 10 + dovB("Insight"),
    pb: g.pb != null ? +g.pb : z.pb || 2,
    p,
  };
}
const scNpc = (s, id) => ((s && s.npc) || []).find(x => x.id === id);
const scPost = n => ((n.gm || {}).postoj ? SCPOST.find(x => x[0] === n.gm.postoj) || null : null);
/* ---- vypravěč: panel NPC ve scéně (v otevřené kartě NPC místo statbloku; statblok zůstává pod ním) ---- */
function bojScNpcHtml(s, n) {
  const g = n.gm || {},
    S = scStat(n),
    ver = !!g.ver;
  const hb = (k, l, b, tip) =>
    `<button type="button" class="bschod" data-bschod="${besc(k)}" ${btip(`${tip}: d20 ${bsg(b)}${ver ? " – veřejně" : " – jen pro tebe"}`)}><span>${l}</span><b>${bsg(b)}</b></button>`;
  const vl = SCAB.map(
    a =>
      `<div class="bscab"><label><small>${a}</small><input type="number" min="1" max="30" inputmode="numeric" data-bscab="${a}" value="${S.ab[a]}" aria-label="${KSK[a]}"></label>${hb("ov:" + a, "ověř.", scMod(S.ab[a]), `Ověření ${KSK[a]}`)}${hb("za:" + a, "záchr.", S.zachB(a), `Záchrana ${KSK[a]}`)}</div>`,
  ).join("");
  const dovL = Object.keys(KDOVAB)
    .sort((a, b) => (S.dov[b] != null) - (S.dov[a] != null) || a.localeCompare(b))
    .map(k => hb("dv:" + k, k, S.dovB(k), k))
    .join("");
  const post = `<label class="bscf">Postoj <select data-bscg="postoj"><option value="">—</option>${SCPOST.map(([k, l]) => `<option value="${k}"${g.postoj === k ? " selected" : ""}>${l}</option>`).join("")}</select></label>`;
  const txt = (k, l, ph) =>
    `<label class="bscf bsct"><span>${l}</span><textarea rows="2" data-bscg="${k}" placeholder="${besc(ph)}">${besc(g[k] || "")}</textarea></label>`;
  return `<section class="bscnpc" data-bscnpc="${n.id}" aria-label="Jednání s ${besc(n.n)}">
    <div class="bscrow">${post}<label class="bscf">DC jednání <input type="number" min="1" max="30" inputmode="numeric" data-bscg="dc" value="${g.dc != null ? g.dc : ""}" placeholder="15" ${btip("Obtížnost přesvědčení, klamu či zastrašení – hráčův hod ji v záznamu porovná")}></label><label class="bscf">Statistiky podle <input data-bscb list="bbest" value="${besc((S.p || {}).n || "")}" placeholder="statblok z bestiáře" autocomplete="off"></label><label class="bscf bscver"><input type="checkbox" data-bscver${ver ? " checked" : ""}> hody veřejně</label></div>
    <p class="bscpas">Pasivní Vnímání <b>${S.pv}</b> · pasivní Vhled <b>${S.pvh}</b> · bonus zdatnosti <b>${bsg(S.pb)}</b>${scPost(n) ? ` · postoj <b>${scPost(n)[1]}</b>` : ""}</p>
    <div class="bscabs">${vl}</div>
    <div class="bscdov">${dovL}</div>
    <label class="bscf bsct"><span>Dovednosti NPC</span><input data-bscg="dov" value="${besc(g.dov != null ? g.dov : scDovTxt(S.dov))}" placeholder="Insight +4, Persuasion +5"></label>
    ${txt("vira", "Čemu věří", "přesvědčení, věrnosti, předsudky")}${txt("chce", "Co chce", "cíle, potřeby, čeho se bojí")}${txt("pozn", "Poznámky", "co ví, co prozradí, za jakou cenu")}
  </section>`;
}
/* změna údajů NPC (jen vypravěč) */
function scGmZmen(id, f) {
  bojZmen(z => {
    const n = scNpc(z, id);
    if (!n) return;
    n.gm = n.gm || {};
    f(n.gm, n);
    Object.keys(n.gm).forEach(k => (n.gm[k] === "" || n.gm[k] == null) && delete n.gm[k]);
    if (!Object.keys(n.gm).length) delete n.gm;
  });
}
document.addEventListener("change", e => {
  if (!GMV) return;
  const t = e.target,
    box = t.closest && t.closest("[data-bscnpc]");
  if (!box) return;
  const id = box.dataset.bscnpc;
  if (t.matches("[data-bscg]")) {
    const k = t.dataset.bscg,
      v = t.type === "number" ? (t.value === "" ? "" : +t.value) : t.value.trim();
    scGmZmen(id, g => (g[k] = v));
  } else if (t.matches("[data-bscab]")) {
    const a = t.dataset.bscab,
      v = t.value === "" ? null : Math.max(1, Math.min(30, +t.value));
    scGmZmen(id, g => {
      g.ab = Object.assign({}, g.ab || {});
      if (v == null) delete g.ab[a];
      else g.ab[a] = v;
      if (!Object.keys(g.ab).length) delete g.ab;
    });
  } else if (t.matches("[data-bscver]")) scGmZmen(id, g => (g.ver = t.checked || ""));
  else if (t.matches("[data-bscb]")) {
    const p = bojBest(t.value) || (bojOsoba(t.value) && PROTBY[bojOsoba(t.value).b]) || null;
    if (!p && t.value.trim()) {
      mmHlasG("Takový statblok v bestiáři není.", 3000);
      return;
    }
    scGmZmen(id, (g, n) => {
      if (p) n.b = p.id;
      else delete n.b;
      delete g.ab;
      delete g.dov;
    });
  }
});
/* hod vypravěče za NPC: d20 + bonus; do záznamu vypravěče, s volbou „hody veřejně“ i hráčům */
function scHodNpc(id, k, proti) {
  const s = BOJ.s,
    n = scNpc(s, id);
  if (!n) return null;
  const S = scStat(n),
    [t, a] = k.split(/:(.*)/s),
    b = t === "ov" ? scMod(S.ab[a]) : t === "za" ? S.zachB(a) : S.dovB(a),
    l = t === "ov" ? `Ověření ${KSK[a]}` : t === "za" ? `Záchrana ${KSK[a]}` : a;
  const d = bK(20),
    tot = d + b,
    vys = proti ? (tot > proti.tot ? `${tot} – ${n.n} uspěl` : tot < proti.tot ? `${tot} – ${proti.kdo} uspěl` : `${tot} – nerozhodně`) : String(tot);
  bojLog(
    id,
    {ai: id, an: n.n, n: proti ? `Protihod ${l}` : l, dc: vys, zt: `d20 ${d} ${bsg(b)} = ${tot}${proti ? ` · proti ${proti.kdo} ${proti.tot}` : ""}`},
    n.n,
  );
  if ((n.gm || {}).ver) bojZaz({a: n.n, ai: id, cim: proti ? `Protihod ${l}` : l, v: vys});
  if (typeof bojPrekresli === "function") bojPrekresli();
  return tot;
}
document.addEventListener("click", e => {
  if (!GMV) return;
  const b = e.target.closest && e.target.closest("[data-bschod],[data-bscprot]");
  if (!b) return;
  if (b.dataset.bschod) {
    const box = b.closest("[data-bscnpc]");
    if (box) scHodNpc(box.dataset.bscnpc, b.dataset.bschod);
    return;
  }
  const [id, sk, tot, kdo] = b.dataset.bscprot.split("|");
  scHodNpc(id, "dv:" + sk, {tot: +tot, kdo});
});
/* ---- vypravěč: hod hráče proti NPC v záznamu – porovnání s DC a pasivními hodnotami, tlačítko protihodu ---- */
function bzScPorovnej(e, s) {
  const n = e.C && e.C.id ? scNpc(s, e.C.id) : null,
    h = e.h || {};
  if (!n || h.tot == null) return;
  const S = scStat(n),
    g = n.gm || {},
    sk = KDOVAB[e.co] ? e.co : null,
    tot = +h.tot,
    po = [];
  if (g.dc != null) po.push(`DC ${g.dc}: <b>${tot >= +g.dc ? "úspěch" : "neúspěch"}</b>`);
  const pr = sk && SCPROTI[sk];
  if (pr === "Insight") po.push(`pasivní Vhled ${S.pvh}: <b>${tot >= S.pvh ? "obstál" : "prohlédne ho"}</b>`);
  else if (pr === "Perception") po.push(`pasivní Vnímání ${S.pv}: <b>${tot >= S.pv ? "nevšiml si" : "všiml si"}</b>`);
  if (scPost(n)) po.push(`postoj ${scPost(n)[1]}`);
  const btn = pr
    ? `<button type="button" class="badd bscprot" data-bscprot="${besc([n.id, pr, tot, (e.A && e.A.n) || "hráč"].join("|"))}" ${btip(`${n.n} hodí ${pr} proti ${tot}`)}>Protihod ${pr}</button>`
    : "";
  if (po.length || btn) e.rows.push({l: "", h: `<span class="bscpor">${po.join(" · ")}${btn ? " " + btn : ""}</span>`});
}
/* ---- hráč: s kým jedná (cíl ověření a dovedností ve scéně) ---- */
const BSCJ = (() => {
  try {
    return JSON.parse(sessionStorage.getItem("mm-scj") || "{}") || {};
  } catch (e) {
    return {};
  }
})();
function bojScJednHtml(s, K) {
  const L = (s.npc || []).filter(n => !n.skryt);
  if (!L.length || !K) return "";
  const cur = L.some(n => n.id === BSCJ[K.id]) ? BSCJ[K.id] : "";
  return `<div class="bscjed" role="group" aria-label="S kým jednáš"><span class="bscjl">${cur ? "Jednáš s" : "S kým jednáš?"}</span>${L.map(n => `<button type="button" class="bscjb" data-bscj="${n.id}" data-kid="${besc(K.id)}" aria-pressed="${cur === n.id}" ${btip(cur === n.id ? "Ověření a dovednosti jdou vůči této postavě – klepni znovu a zrušíš" : `Hody dovedností půjdou vůči: ${n.n}`)}>${bojMedN(n)}<b>${besc(n.n)}</b></button>`).join("")}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bscj]");
  if (!b) return;
  const k = b.dataset.kid;
  BSCJ[k] = BSCJ[k] === b.dataset.bscj ? "" : b.dataset.bscj;
  try {
    sessionStorage.setItem("mm-scj", JSON.stringify(BSCJ));
  } catch (x) {}
  bojPrekresli();
});
/* popisek hodu z karty (13: kartaHod): ve scéně jdou ověření a dovednosti vůči zvolené postavě („Persuasion → Purkmistr“) */
function bojScCo(K, co, o, gm = GMV) {
  const s = BOJ.s;
  if (gm || !s || !s.scena || !s.aktivni || (o && o.utok) || !(KDOVAB[co] || /^Ověření /.test(co))) return co;
  const n = scNpc(s, BSCJ[K.id]);
  return n && !n.skryt ? `${co} → ${n.n}` : co;
}
