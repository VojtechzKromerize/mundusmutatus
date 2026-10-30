/* ===== Obchody, losovací tabulky a pověst – záložka Nástroje řídicího pultu (2026-10-30, Vojta) =====
   Obchody: data v nastavení „obchody“ (mm_obchody / mm_obchody_uloz), výpočty v čistém 10o-obchody.js (sortiment, ceny, pověst,
   zásoby, výkup, smlouvání, zakázky, místo), ceny z katalogu vybavení (VYB, 14d). Hráč vidí otevřené obchody v místě, kde je družina
   (list Peníze na kartě), nakupuje, prodává, smlouvá a objednává zakázky návrhem (typy nakup, vykup, zakazka – 23); vypravěč ho schválí
   a teprve potom se pohnou peníze (karta nebo pokladna družiny) a věci. Zakázku předá herní čas: když vypravěčův herní den dosáhne
   termínu, věc přibude do vybavení. Vypravěč může prodávat i sám z pultu nebo z okna obchodu.
   Tabulky: nápady u Pokušení a Požehnání v herním záznamu (24) a v Nástrojích; data a výběr v čistém 10j-tabulky.js.
   Pověst: 07p (jádro); tady přehled, rychlé nastavení a vliv na ceny obchodů ve městě (cechy, ne rod). ===== */
let OBCH = null;
let OBCHOTV = ""; /* obchod rozbalený v Nástrojích */
const obchGr = hal => slzCena((+hal || 0) / 10);
const obchDnes = () => obchDen(HRA && HRA.datum);
/* smlouvání: jeden pokus na postavu, obchod a herní den (v tomto prohlížeči) */
let OBCHSM = {};
try {
  OBCHSM = JSON.parse(localStorage.getItem("mm-obchsm") || "{}") || {};
} catch (e) {}
const obchSmKl = (oid, kid) => `${oid}|${kid}|${obchDnes()}`;
const obchSm = (oid, kid) => OBCHSM[obchSmKl(oid, kid)] || null;
/* pověst družiny ve městě obchodu (cechy a městská rada – Vojta 2026-10-30), podle prvního slova místa („Praha, Staré Město“ → Praha) */
const obchPovU = o => (o && o.misto ? povU(povMestoId(o.misto)) : 0);
/* přirážka obchodu podle pověsti ve městě a zpustlého kraje (null = s družinou neobchoduje) a herní den */
const obchKontext = o => ({prir: obchUprava(o, obchPovU(o)), den: obchDnes()});
async function obchNacti() {
  if (!window.MMDB || !MMDB.obchody) {
    OBCH = OBCH || [];
    return false;
  }
  try {
    const p = await MMDB.obchody();
    const L = (p && p.L) || [];
    const z = JSON.stringify(L) !== JSON.stringify(OBCH);
    OBCH = L;
    if (GMV) obchZakDoruc();
    return z;
  } catch (e) {
    OBCH = OBCH || [];
    return false;
  }
}
async function obchUloz(L, hlas) {
  if (!window.MMDB || !MMDB.obchodyUloz) {
    OBCH = L;
  } else
    try {
      const p = await MMDB.obchodyUloz({L});
      OBCH = (p && p.L) || L;
      if (hlas) mmHlasG(hlas, 3000);
    } catch (e) {
      mmHlasG("Obchody se nepodařilo uložit: " + (e.message || e), 6000);
    }
  if (curView === "boj") renderBoj();
}
const obchById = id => (OBCH || []).find(o => o.id === id) || null;
const obchZmen = (oid, f) => (OBCH || []).map(o => (o.id === oid ? f(o) : o));

/* ---- platba a výdělek (vypravěč): z karty postavy, nebo z pokladny družiny ---- */
async function obchZaplat(K, cel, pokl, co) {
  if (pokl) {
    await poklNacti();
    const pred = (POKL && POKL.pen) || {},
      P = kPenZapl(pred, "CP", cel);
    if (!P) throw new Error(`v pokladně družiny není ${obchGr(cel)} (je tam ${kPenTxt(pred)})`);
    await MMDB.pokladna(obchRozdil(pred, P), `${co} (${K.n})`.slice(0, 200), null);
    await poklNacti();
    return "z pokladny družiny";
  }
  const pen = kPenKarta(K),
    P = kPenZapl(pen, "CP", cel);
  if (!P) throw new Error(`${K.n} nemá ${obchGr(cel)} (má ${kPenTxt(pen)})`);
  await kartaStavZmen(K.id, {pen: Object.keys(P).length ? P : null}, null, {bezZpet: true});
  return kPenTxt(P);
}
async function obchVydelek(K, cel) {
  const pen = Object.assign({}, kPenKarta(K)),
    dP = kPenSloz({CP: cel});
  KMINCE.forEach(k => {
    if (dP[k]) pen[k] = (+pen[k] || 0) + dP[k];
  });
  await kartaStavZmen(K.id, {pen}, null, {bezZpet: true});
  return kPenTxt(pen);
}
const obchPridejVec = (K, x, n, q) => (x ? kVybPridej(K, vybPoolVstup(x), q) : kVybPridej(K, {k: "pl", n, w: 0}, q));
const obchPct = p => Math.max(-20, Math.min(10, Math.round(+p || 0)));
async function obchPriprav(oid) {
  await obchNacti();
  await vybNacti();
  const o = obchById(oid);
  if (!o) throw new Error("obchod už neexistuje");
  const c = obchKontext(o);
  if (c.prir === null) throw new Error(`${o.n} s družinou neobchoduje (pověst)`);
  return {o, c};
}
/* ---- nákup: vypravěč (schválený návrh hráče nebo prodej z pultu) ---- */
async function obchProdej(K, oid, pid, q, cenaNavrh, op = {}) {
  if (!K) throw new Error("postava neexistuje");
  const {o, c} = await obchPriprav(oid);
  const r = obchZbozi(o, VYB, VYBBY, c).find(x => x.id === pid);
  q = Math.max(1, Math.min(999, Math.round(+q || 1)));
  if (!r) throw new Error("zboží už v obchodě není");
  if (!obchLzeProdat(r, q)) throw new Error(`na skladě je jen ${r.q} ks`);
  const kus = obchSeSmlouvou(r.hal, obchPct(op.pct));
  if (cenaNavrh && Math.round(+cenaNavrh) < kus) throw new Error(`cena se mezitím zvýšila na ${obchGr(kus)} za kus`);
  const cel = kus * q,
    zb = await obchZaplat(K, cel, op.pokl, `nákup ${q}× ${r.n} – ${o.n}`);
  await obchPridejVec(K, r.x, r.n, q);
  if ((r.ruc && r.q != null) || (!r.ruc && o.zas)) await obchUloz(obchZmen(oid, x => obchProdano(x, pid, q, c.den)));
  kHodZapis({k: K.id, kdo: K.n, co: "Nákup", txt: `${q}× ${r.n} za ${obchGr(cel)} – ${o.n} → ${zb}`});
  return `${K.n} koupil ${q}× ${r.n} za ${obchGr(cel)}`;
}
/* ---- výkup: družina prodává obchodníkovi (věc z vybavení podle jména) ---- */
async function obchVykup(K, oid, n, q, cenaNavrh) {
  if (!K) throw new Error("postava neexistuje");
  const {o} = await obchPriprav(oid);
  const inv = kInv(K).map(y => Object.assign({}, y)),
    i = inv.findIndex(y => y.n === n);
  q = Math.max(1, Math.round(+q || 1));
  if (i < 0) throw new Error(`${K.n} už ${n} nemá`);
  if ((+inv[i].q || 1) < q) throw new Error(`${K.n} má jen ${inv[i].q} ks`);
  const x = vybNajdi(n),
    kus = Math.round(+cenaNavrh) > 0 ? Math.round(+cenaNavrh) : obchVykupCena(o, x, obchPovU(o));
  if (!(kus > 0)) throw new Error("bez ceny – dohodněte se");
  if ((+inv[i].q || 1) > q) inv[i].q = (+inv[i].q || 1) - q;
  else inv.splice(i, 1);
  await kartaStavZmen(K.id, {inv}, null, {bezZpet: true});
  const zb = await obchVydelek(K, kus * q);
  kHodZapis({k: K.id, kdo: K.n, co: "Prodej", txt: `${q}× ${n} za ${obchGr(kus * q)} – ${o.n} → ${zb}`});
  return `${K.n} prodal ${q}× ${n} za ${obchGr(kus * q)}`;
}
/* ---- zakázka u řemeslníka: zaplatí se předem, hotová věc přibude, až herní čas dosáhne termínu ---- */
async function obchZakazka(K, oid, pid, q, cenaNavrh, op = {}) {
  if (!K) throw new Error("postava neexistuje");
  const {o, c} = await obchPriprav(oid);
  const x = obchZakazkyNab(o.typ, VYB).find(y => y.id === pid);
  if (!x) throw new Error("tohle tu na zakázku nedělají");
  q = Math.max(1, Math.min(99, Math.round(+q || 1)));
  const kus = obchSeSmlouvou(obchCena(x.hal, c.prir), obchPct(op.pct));
  if (cenaNavrh && Math.round(+cenaNavrh) < kus) throw new Error(`cena se mezitím zvýšila na ${obchGr(kus)} za kus`);
  const dny = obchDnyPrace(x.hal * q),
    nm = x.cz || x.en,
    zb = await obchZaplat(K, kus * q, op.pokl, `zakázka ${q}× ${nm} – ${o.n}`);
  const z = {id: "z" + Math.random().toString(36).slice(2, 8), k: K.id, kn: K.n, pol: x.id, n: nm, q, cena: kus, hot: c.den ? c.den + dny : 0};
  await obchUloz(obchZmen(oid, y => obchZakazkaPridej(y, z)));
  const kdy = z.hot ? `hotovo ${obchDenTxt(z.hot, MES)}` : `za ${dny} dní`;
  kHodZapis({k: K.id, kdo: K.n, co: "Zakázka", txt: `${q}× ${nm} za ${obchGr(kus * q)} – ${o.n}, ${kdy} → ${zb}`});
  return `${K.n} objednal ${q}× ${nm} (${kdy})`;
}
/* předání hotových zakázek (vypravěč; po načtení obchodů a po změně herního času) */
let OBCHDOR = false;
async function obchZakDoruc(vynutit) {
  if (!GMV || OBCHDOR || !OBCH) return;
  const den = obchDnes();
  const K0 = OBCH.flatMap(o => (o.zak || []).filter(z => vynutit === z.id || (den > 0 && +z.hot > 0 && +z.hot <= den)).map(z => [o, z]));
  if (!K0.length) return;
  OBCHDOR = true;
  try {
    await vybNacti();
    const hot = new Set();
    for (const [o, z] of K0) {
      const K = KARTBY[z.k];
      if (!K) continue;
      await obchPridejVec(K, z.pol && VYBBY[z.pol], z.n, +z.q || 1);
      kHodZapis({k: K.id, kdo: K.n, co: "Zakázka hotova", txt: `${z.q}× ${z.n} – ${o.n}`});
      hot.add(z.id);
    }
    if (hot.size) {
      await obchUloz(
        OBCH.map(o => ((o.zak || []).some(z => hot.has(z.id)) ? Object.assign({}, o, {zak: o.zak.filter(z => !hot.has(z.id))}) : o)),
        `Hotové zakázky předány (${hot.size}).`,
      );
      kartyPrekresli();
    }
  } finally {
    OBCHDOR = false;
  }
}
/* ---- hráč: obchody v listu Peníze, okno obchodu, prodej věci z vybavení ---- */
function obchHracHtml(K) {
  if (OBCH === null) obchNacti().then(z => z && kartyPrekresli());
  const L = (OBCH || []).filter(o => o.otevr && obchViditelny(o, partyPlace()));
  if (!L.length) return "";
  return `<details class="bdmbez obchk" open><summary>Obchody</summary><ul class="obchl">${L.map(
    o =>
      `<li><button type="button" class="gbtn ghost" data-obchotv="${besc(o.id)}" data-obchk="${besc(K.id)}"><b>${besc(o.n)}</b><small>${besc((OBCHTYP[o.typ] || {}).n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}${o.kup && o.kup.jmeno ? ` · ${besc(o.kup.jmeno)}` : ""}</small></button></li>`,
  ).join("")}</ul><p class="rsmall">Nákup, prodej i zakázku schvaluje vypravěč: peníze a věci se pohnou, až ho potvrdí.</p></details>`;
}
/* v detailu věci ve vybavení (14b): prodej obchodu, který je otevřený v místě družiny */
function obchVykupHtml(K, x) {
  const L = (OBCH || []).filter(o => o.otevr && obchViditelny(o, partyPlace()) && obchVl(o).vyk && obchKontext(o).prir !== null);
  if (!L.length || !x || !kMuze(K)) return "";
  const v = typeof vybNajdi === "function" && VYB ? vybNajdi(x.n) : null;
  return `<div class="kvsek"><h4 class="bdmgh">Prodat obchodníkovi</h4><p class="bdmrow"><select data-obchvyko aria-label="Obchod">${L.map(o => {
    const c = obchVykupCena(o, v, obchPovU(o));
    return `<option value="${besc(o.id)}" data-c="${c}">${besc(o.n)} – ${c ? `${besc(obchGr(c))} za kus` : "cena dohodou"}</option>`;
  }).join(
    "",
  )}</select>${x.q > 1 ? `<input type="number" data-obchvykq min="1" max="${x.q}" value="1" aria-label="Kolik kusů" style="width:4.2em">` : ""}<input type="number" data-obchvykc min="0" step="0.5" placeholder="cena gr." aria-label="Požadovaná cena za kus v groších (jen u věci bez ceny)" style="width:6em"><button type="button" class="bdmbtn" data-obchvyk="${besc(K.id)}" data-n="${besc(x.n)}">Nabídnout</button></p><p class="rsmall">Obchodník vykupuje jen věci, se kterými kupčí, zhruba za polovinu ceny (pokoutník za méně); kouzelné a neznámé věci jen za cenu, kterou navrhneš a vypravěč schválí.</p></div>`;
}
const OBCHDOV = [
  ["Persuasion", "Přesvědčování"],
  ["Deception", "Klamání"],
  ["Intimidation", "Zastrašování"],
];
async function obchOkno(oid, kid) {
  await vybNacti();
  const o = obchById(oid),
    K = KARTBY[kid] || (GMV ? KARTY[0] : null);
  if (!o) return;
  const c = obchKontext(o),
    T = OBCHTYP[o.typ] || {},
    muze = !!K && kMuze(K),
    pen = K ? kPenKarta(K) : {},
    sm = K ? obchSm(o.id, K.id) : null,
    pct = sm ? sm.pct : 0,
    mesto = o.misto ? String(o.misto).split(",")[0].trim() : "",
    pu = obchPovU(o),
    poklOk = K && window.MMDB && MMDB.pokladna && (GMV || KZAM.has(K.id));
  const hlav = `<h3>${besc(o.n)}</h3><p class="rsmall">${besc(T.n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}${o.zpust ? " · zpustlý kraj" : ""}</p>
   ${o.kup && o.kup.jmeno ? `<p class="obchkupec"><b>${besc(o.kup.jmeno)}</b>${o.kup.povaha ? `<span>${besc(o.kup.povaha)}</span>` : ""}${o.kup.vzhled ? `<small>${besc(o.kup.vzhled)}</small>` : ""}${GMV && (o.kup.chce || o.kup.zv) ? `<small class="obchgmi">${o.kup.chce ? `Chce: ${besc(o.kup.chce)}. ` : ""}${o.kup.zv ? `Ví: ${besc(o.kup.zv)}` : ""}</small>` : ""}</p>` : ""}
   ${mesto && pu ? `<p class="rsmall">Pověst družiny ve městě ${besc(mesto)}: ${povZnak(pu)}${c.prir !== null && obchPovPrir(pu) ? ` (ceny ${obchPovPrir(pu) > 0 ? "+" : ""}${obchPovPrir(pu)} %)` : ""}.</p>` : ""}
   ${GMV ? `<p class="kvlh"><label>Postava <select data-obchkomu="${besc(o.id)}" aria-label="Postava">${KARTY.map(k => `<option value="${besc(k.id)}"${K && k.id === K.id ? " selected" : ""}>${besc(k.n)}</option>`).join("")}</select></label></p>` : ""}`;
  if (c.prir === null) {
    mmPop(`${hlav}<p class="obchne">Obchodník s družinou nemluví – cechy a rada města mají o družině špatné mínění.</p>`);
    return;
  }
  const Z = obchZbozi(o, VYB, VYBBY, c),
    sk = {};
  Z.forEach(r => {
    const k = r.mag ? "magicke" : (r.x && r.x.sk) || "jine";
    (sk[k] = sk[k] || []).push(r);
  });
  const nad = k => (k === "magicke" ? "Vzácnosti" : VYBSKN[k] || "Ostatní");
  const smH = !K
    ? ""
    : sm
      ? `<p class="obchsm">Smlouvání dnes: ${besc(sm.dov)} ${sm.tot} proti SO ${sm.dc} → ${sm.pct ? `ceny ${sm.pct > 0 ? "+" : ""}${sm.pct} %` : "beze změny"}.</p>`
      : muze
        ? `<p class="kvlh obchsm">Smlouvat (jednou za den): ${OBCHDOV.map(([d, cz]) => `<button type="button" class="gbtn ghost" data-obchsml="${besc(o.id)}|${besc(K.id)}|${d}">${cz}</button>`).join("")}</p>`
        : "";
  const radek = r => {
    const kus = obchSeSmlouvou(r.hal, pct);
    return `<li${r.mag ? ' class="obchmag"' : ""}><span class="obchn">${r.x ? `<button type="button" class="obchinfo" data-obchinf="${besc(r.id)}">${besc(r.n)}</button>` : besc(r.n)}${r.q != null ? ` <small>${r.q ? `${r.q} ks` : "vyprodáno"}</small>` : ""}</span><b>${besc(obchGr(kus))}</b>${
      muze && r.q !== 0
        ? `<span class="obchkup"><input type="number" min="1" max="${r.q != null ? r.q : 99}" value="1" aria-label="Počet" data-obchq="${besc(r.id)}"><button type="button" class="gbtn" data-obchkup="${besc(o.id)}|${besc(r.id)}|${besc(K.id)}">${GMV ? "Prodat" : "Koupit"}</button></span>`
        : ""
    }</li>`;
  };
  const zboziH = Z.length
    ? Object.keys(sk)
        .map(k => `<h4 class="obchh">${besc(nad(k))}</h4><ul class="obchz">${sk[k].map(radek).join("")}</ul>`)
        .join("")
    : `<p class="rsmall">Krám je dnes prázdný.</p>`;
  const zakN = obchVl(o).zak ? obchZakazkyNab(o.typ, VYB) : [],
    mojeZ = K ? (o.zak || []).filter(z => z.k === K.id) : [];
  const zakH =
    zakN.length && muze
      ? `<details class="obchzak"><summary>Na zakázku</summary><p class="kvlh"><select data-obchzakx aria-label="Co objednat">${zakN
          .map(x => {
            const kus = obchSeSmlouvou(obchCena(x.hal, c.prir), pct);
            return `<option value="${besc(x.id)}">${besc(x.cz || x.en)} – ${besc(obchGr(kus))}, ~${obchDnyPrace(x.hal)} d.</option>`;
          })
          .join(
            "",
          )}</select><input type="number" data-obchzakq min="1" max="99" value="1" aria-label="Kusů" style="width:4em"><button type="button" class="gbtn" data-obchzak="${besc(o.id)}|${besc(K.id)}">Objednat</button></p><p class="rsmall">Platí se předem; hotovou věc dostaneš do vybavení, až herní čas dosáhne termínu.</p></details>`
      : "";
  const mojeH = mojeZ.length
    ? `<p class="rsmall">Rozpracováno: ${mojeZ.map(z => `${besc(z.q > 1 ? `${z.q}× ` : "")}${besc(z.n)}${z.hot ? ` (hotovo ${obchDenTxt(z.hot, MES)})` : ""}`).join(", ")}</p>`
    : "";
  mmPop(`${hlav}<p class="rsmall">${besc(T.p || "")}</p>
   ${K ? `<p class="rsmall">${besc(K.n)} má: ${kPenHtml(pen)}</p>` : ""}
   ${poklOk && muze ? `<p class="rsmall"><label><input type="checkbox" data-obchpokl> platit z pokladny družiny (${kPenHtml((POKL && POKL.pen) || {})})</label></p>` : ""}
   ${smH}${zboziH}${zakH}${mojeH}`);
  if (poklOk && !POKL) poklNacti();
}
const obchPoklZaskrt = () => !!(document.querySelector("[data-obchpokl]") || {}).checked;
async function obchKup(oid, pid, kid, q) {
  const K = KARTBY[kid],
    o = obchById(oid);
  if (!K || !o) return;
  const c = obchKontext(o),
    r = obchZbozi(o, VYB, VYBBY, c).find(x => x.id === pid);
  if (!r || c.prir === null) return;
  q = Math.max(1, Math.round(+q || 1));
  if (!obchLzeProdat(r, q)) {
    mmHlasG(`Na skladě je jen ${r.q} ks.`, 3000);
    return;
  }
  const sm = obchSm(oid, kid),
    pct = sm ? sm.pct : 0,
    kus = obchSeSmlouvou(r.hal, pct),
    pokl = obchPoklZaskrt();
  if (GMV) {
    try {
      mmHlasG((await obchProdej(K, oid, pid, q, 0, {pct, pokl})) + ".", 5000);
    } catch (e) {
      mmHlasG("Prodej se nepovedl: " + (e.message || e), 6000);
    }
    mmPopX();
    kartyPrekresli();
    return;
  }
  if (!pokl && !kPenZapl(kPenKarta(K), "CP", kus * q)) {
    mmHlasG(`Na ${obchGr(kus * q)} nemáš dost peněz.`, 4000);
    return;
  }
  const ok = await navrhPosli(K, {
    typ: "nakup",
    cil: K.id,
    obch: o.id,
    pol: r.id,
    q,
    cena: kus,
    sm: pct || undefined,
    pokl: pokl ? 1 : undefined,
    popis:
      `Nákup: ${q}× ${r.n} za ${obchGr(kus * q)} (${o.n}${pokl ? ", z pokladny" : ""}${pct ? `, smlouvání ${pct > 0 ? "+" : ""}${pct} %` : ""})`.slice(
        0,
        160,
      ),
  });
  if (ok) mmPopX();
}
async function obchSmlouvej(oid, kid, dov) {
  const K = KARTBY[kid],
    o = obchById(oid);
  if (!K || !o || obchSm(oid, kid)) return;
  const H = await kartaHod(K, dov, kDov(K, dov), {why: `smlouvání – ${o.n}`});
  if (!H || H.tot == null) return;
  const dc = obchDc(o),
    pct = obchSmlouvani(H.tot, dc);
  OBCHSM[obchSmKl(oid, kid)] = {tot: H.tot, dc, pct, dov: (OBCHDOV.find(x => x[0] === dov) || [0, dov])[1]};
  try {
    localStorage.setItem("mm-obchsm", JSON.stringify(Object.fromEntries(Object.entries(OBCHSM).slice(-40))));
  } catch (e) {}
  mmHlasG(
    pct < 0 ? `Usmlouváno: ceny ${pct} % dnes.` : pct > 0 ? `Obchodník se urazil: ceny +${pct} % dnes.` : "Obchodník nepovolil – ceny zůstávají.",
    4500,
  );
  obchOkno(oid, kid);
}
async function obchObjednej(oid, kid, pid, q) {
  const K = KARTBY[kid],
    o = obchById(oid);
  if (!K || !o) return;
  const c = obchKontext(o),
    x = obchZakazkyNab(o.typ, VYB).find(y => y.id === pid);
  if (!x || c.prir === null) return;
  q = Math.max(1, Math.min(99, Math.round(+q || 1)));
  const sm = obchSm(oid, kid),
    pct = sm ? sm.pct : 0,
    kus = obchSeSmlouvou(obchCena(x.hal, c.prir), pct),
    pokl = obchPoklZaskrt();
  if (GMV) {
    try {
      mmHlasG((await obchZakazka(K, oid, pid, q, 0, {pct, pokl})) + ".", 5000);
    } catch (e) {
      mmHlasG("Zakázka se nepovedla: " + (e.message || e), 6000);
    }
    mmPopX();
    return;
  }
  if (!pokl && !kPenZapl(kPenKarta(K), "CP", kus * q)) {
    mmHlasG(`Na ${obchGr(kus * q)} nemáš dost peněz.`, 4000);
    return;
  }
  const ok = await navrhPosli(K, {
    typ: "zakazka",
    cil: K.id,
    obch: o.id,
    pol: x.id,
    q,
    cena: kus,
    sm: pct || undefined,
    pokl: pokl ? 1 : undefined,
    popis: `Zakázka: ${q}× ${x.cz || x.en} za ${obchGr(kus * q)}, ~${obchDnyPrace(x.hal * q)} dní (${o.n}${pokl ? ", z pokladny" : ""})`.slice(
      0,
      160,
    ),
  });
  if (ok) mmPopX();
}
async function obchNabidni(kid, oid, n, q, cgr) {
  const K = KARTBY[kid],
    o = obchById(oid);
  if (!K || !o) return;
  const x = VYB ? vybNajdi(n) : null,
    auto = obchVykupCena(o, x, obchPovU(o)),
    kus = auto || Math.round((+cgr || 0) * 10);
  q = Math.max(1, Math.round(+q || 1));
  if (!(kus > 0)) {
    mmHlasG(`${o.n} tohle sám neocení – napiš cenu, kterou chceš.`, 4500);
    return;
  }
  if (GMV) {
    try {
      mmHlasG((await obchVykup(K, oid, n, q, kus)) + ".", 5000);
    } catch (e) {
      mmHlasG("Prodej se nepovedl: " + (e.message || e), 6000);
    }
    kartyPrekresli();
    return;
  }
  await navrhPosli(K, {
    typ: "vykup",
    cil: K.id,
    obch: o.id,
    n: String(n).slice(0, 80),
    q,
    cena: kus,
    popis: `Prodej: ${q}× ${n} za ${obchGr(kus * q)} (${o.n}${auto ? "" : ", cena dohodou"})`.slice(0, 160),
  });
}
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const a = T("[data-obchotv]");
  if (a) {
    obchOkno(a.dataset.obchotv, a.dataset.obchk);
    return;
  }
  const k = T("[data-obchkup]");
  if (k) {
    const [oid, pid, kid] = k.dataset.obchkup.split("|"),
      inp = document.querySelector(`[data-obchq="${CSS.escape(pid)}"]`);
    obchKup(oid, pid, kid, inp ? inp.value : 1);
    return;
  }
  const sm = T("[data-obchsml]");
  if (sm) {
    const [oid, kid, dov] = sm.dataset.obchsml.split("|");
    obchSmlouvej(oid, kid, dov);
    return;
  }
  const zk = T("[data-obchzak]");
  if (zk) {
    const [oid, kid] = zk.dataset.obchzak.split("|"),
      box = zk.closest(".obchzak");
    obchObjednej(oid, kid, box.querySelector("[data-obchzakx]").value, box.querySelector("[data-obchzakq]").value);
    return;
  }
  const vk = T("[data-obchvyk]");
  if (vk) {
    const box = vk.closest(".kvsek");
    obchNabidni(
      vk.dataset.obchvyk,
      box.querySelector("[data-obchvyko]").value,
      vk.dataset.n,
      (box.querySelector("[data-obchvykq]") || {}).value || 1,
      box.querySelector("[data-obchvykc]").value,
    );
    return;
  }
  const i = T("[data-obchinf]");
  if (i && VYBBY[i.dataset.obchinf]) {
    const x = VYBBY[i.dataset.obchinf];
    const box = i.closest("li");
    if (box && !box.querySelector(".vybk")) box.insertAdjacentHTML("beforeend", vybKarta(x, false));
    else if (box) box.querySelector(".vybk").remove();
    return;
  }
  const t = T("[data-tabnap]");
  if (t) {
    const [druh, sit] = t.dataset.tabnap.split(":");
    tabOkno(druh, sit);
  }
});
document.addEventListener("change", e => {
  const s = e.target.closest && e.target.closest("[data-obchkomu]");
  if (s) obchOkno(s.dataset.obchkomu, s.value);
});

/* ---- losovací tabulky: okno s nápady (záznam boje) a výsledky v Nástrojích ---- */
function tabNapadyHtml(druh, sit) {
  const N = tabNapady(druh, sit, 3);
  return `<ol class="tabn">${N.map(t => `<li>${besc(t)}</li>`).join("")}</ol>${druh === "pok" ? `<p class="tabsep"><b>Šepot:</b> ${besc(tabLos(TABSEPOT, 1)[0])}</p>` : ""}`;
}
function tabOkno(druh, sit) {
  mmPop(`<h3>${druh === "pok" ? "Pokušení – komplikace, odmítne-li ho" : "Požehnání – co přidat"}</h3>
    <p class="rsmall">Situace: <select data-tabsit="${druh}" aria-label="Situace hodu">${Object.entries(TABSIT)
      .map(([k, n]) => `<option value="${k}"${k === sit ? " selected" : ""}>${n}</option>`)
      .join("")}</select> <button type="button" class="gbtn ghost" data-tabznovu="${druh}">Další nápady</button></p>
    <div id="tabpopv">${tabNapadyHtml(druh, sit)}</div>
    <p class="rsmall">Výsledek hodu platí; nápad jen něco přidá. Vyber, uprav nebo vymysli vlastní (Artikule › Závoj).</p>`);
}
document.addEventListener("change", e => {
  const s = e.target.closest && e.target.closest("[data-tabsit]");
  if (s) {
    const v = document.getElementById("tabpopv");
    if (v) v.innerHTML = tabNapadyHtml(s.dataset.tabsit, s.value);
  }
});
document.addEventListener("click", e => {
  const z = e.target.closest && e.target.closest("[data-tabznovu]");
  if (z) {
    const s = document.querySelector(`[data-tabsit="${z.dataset.tabznovu}"]`),
      v = document.getElementById("tabpopv");
    if (v) v.innerHTML = tabNapadyHtml(z.dataset.tabznovu, s ? s.value : "mysl");
    return;
  }
  const n = e.target.closest && e.target.closest("[data-tablos]");
  if (n && GMV) {
    const sit = (document.querySelector("[data-tabsitn]") || {}).value || "mysl",
      k = n.dataset.tablos,
      v = document.getElementById("tabvys");
    if (!v) return;
    v.innerHTML =
      k === "zvesti"
        ? `<ol class="tabn">${tabLos(TABZVESTI, 3)
            .map(t => `<li>${besc(t)}</li>`)
            .join("")}</ol>`
        : k === "sepot"
          ? `<ol class="tabn">${tabLos(TABSEPOT, 3)
              .map(t => `<li>${besc(t)}</li>`)
              .join("")}</ol>`
          : tabNapadyHtml(k, sit);
  }
});

/* ---- záložka Nástroje řídicího pultu ---- */
function obchSelectHtml(name, val) {
  return `<select name="${name}" aria-label="Druh obchodu">${Object.entries(OBCHTYP)
    .map(([k, t]) => `<option value="${k}"${k === val ? " selected" : ""}>${besc(t.n)}</option>`)
    .join("")}</select>`;
}
const obchRody = () =>
  Object.values(byId)
    .filter(f => f && f.id && f.name)
    .sort((a, b) => String(a.name).localeCompare(b.name, "cs"));
/* obchodník z generátoru postav (09g): jméno, povaha, vzhled; co chce a jednu zvěst, kterou ví, vidí jen vypravěč */
function obchKupec(o) {
  const G = genPostava({stav: obchVl(o).gen || "mestan", zeme: "cechy"});
  return {jmeno: G.jmeno, povaha: G.povaha, vzhled: G.vzhled, chce: G.chce, zv: tabLos(TABZVESTI, 1)[0]};
}
/* zpustlý kraj podle místa (02e), když ho mapa zná */
function obchZpustly(misto) {
  const p = misto && cestaMisto(String(misto).split(",")[0].trim());
  return !!(p && p.lo != null && zpustlyKraj(p.lo, p.la));
}
function obchDetailHtml(o) {
  const c = obchKontext(o),
    Z = obchZbozi(o, VYB, VYBBY, c),
    vyr = (o.ven || []).map(id => VYBBY[id]).filter(Boolean),
    T = OBCHTYP[o.typ] || {},
    vl = obchVl(o);
  const kup = o.kup
    ? `<p class="obchkupec"><b>${besc(o.kup.jmeno)}</b><span>${besc(o.kup.povaha || "")}</span><small>${besc(o.kup.vzhled || "")}</small><small class="obchgmi">Chce: ${besc(o.kup.chce || "—")}. Ví: ${besc(o.kup.zv || "—")}</small></p>`
    : "";
  const zak = (o.zak || []).length
    ? `<h4 class="obchh">Zakázky</h4><ul class="obchz">${o.zak
        .map(
          z =>
            `<li><span class="obchn">${besc(z.kn || z.k)}: ${z.q > 1 ? `${z.q}× ` : ""}${besc(z.n)} <small>${z.hot ? `hotovo ${obchDenTxt(z.hot, MES)}` : "bez termínu"}</small></span><button type="button" class="gbtn ghost" data-obchzakhned="${besc(z.id)}">Předat hned</button><button type="button" class="gbtn ghost" data-obchzakz="${besc(o.id)}|${besc(z.id)}" ${btip("Zrušit zakázku (peníze nevrací – vrať je ručně)")}>×</button></li>`,
        )
        .join("")}</ul>`
    : "";
  return `<div class="obchdet">
    <form class="kvlh obchf" data-obchf="${besc(o.id)}"><label>Název <input name="n" value="${besc(o.n)}" maxlength="60" required></label><label>Druh ${obchSelectHtml("typ", o.typ)}</label><label>Místo <input name="misto" value="${besc(o.misto || "")}" maxlength="60" placeholder="např. Praha, Staré Město"></label>
      <label ${btip("Hráči obchod uvidí, jen když je družina v tomto místě (Výprava, herní čas)")}><input type="checkbox" name="vaz"${o.vaz ? " checked" : ""}> jen když je tam družina</label>
      <label>Přirážka <input name="prir" type="number" min="-50" max="500" value="${+o.prir || 0}" style="width:4.5em"> %</label>
      <label ${btip("Zpustlý kraj: zboží o polovinu dražší, zásoby poloviční")}><input type="checkbox" name="zpust"${o.zpust ? " checked" : ""}> zpustlý kraj</label>
      <label ${btip("Běžné zboží jen v omezeném počtu; doplní se týden po prvním prodeji (herní čas)")}><input type="checkbox" name="zas"${o.zas ? " checked" : ""}> omezené zásoby</label>
      <label>SO smlouvání <input name="dc" type="number" min="5" max="30" value="${obchDc(o)}" style="width:4em"></label>
      <label class="obchpozn">Poznámka jen pro tebe <input name="pozn" value="${besc(o.pozn || "")}" maxlength="200"></label><button class="gbtn ghost">Uložit</button></form>
    <p class="rsmall">${besc(T.p || "")} ${vl.vyk ? `Vykupuje za ${Math.round(vl.vyk * 100)} % ceny.` : "Nevykupuje."} ${vl.zak ? "Přijímá zakázky." : ""} ${
      c.prir === null
        ? "<b>S družinou teď neobchoduje (pověst ve městě).</b>"
        : `Ceny celkem ${c.prir > 0 ? "+" : ""}${c.prir} %${obchPovU(o) ? ` (pověst ve městě ${obchPovPrir(obchPovU(o)) > 0 ? "+" : ""}${obchPovPrir(obchPovU(o))} %)` : ""}.`
    } ${o.vaz && o.misto ? (obchTady(o, partyPlace()) ? "Družina je na místě." : "Družina je jinde – hráči obchod nevidí.") : ""}</p>
    ${kup}<p class="kvlh"><button type="button" class="gbtn ghost" data-obchgen="${besc(o.id)}">${o.kup ? "Jiný obchodník" : "Vylosovat obchodníka"}</button>${KARTY.length ? `<button type="button" class="gbtn ghost" data-obchotv="${besc(o.id)}" data-obchk="${besc((KARTY[0] || {}).id || "")}">Okno obchodu – prodat postavě</button>` : ""}</p>
    <form class="kvlh obchvf" data-obchvf="${besc(o.id)}"><label>Vystavit kus <input name="x" list="obchdl" placeholder="hledej v katalogu (i kouzelné předměty)" required style="min-width:16em"></label><label>Kusů <input name="q" type="number" min="1" max="999" placeholder="—" style="width:4em"></label><label>Cena za kus <input name="c" type="number" min="0" max="999999" step="0.5" placeholder="z katalogu" style="width:6em"> gr.</label><button class="gbtn ghost">Vystavit</button></form>
    <p class="rsmall">Kouzelné předměty jsou extrémně vzácné: nikdy se do obchodu nedostanou samy, vystavíš jen jednotlivý kus (bez počtu = 1) a cenu určíš sám.</p>
    ${zak}
    ${
      vl.zak && KARTY.length
        ? `<form class="kvlh obchvlz" data-obchvlz="${besc(o.id)}"><label>Vlastní zakázka <input name="n" maxlength="80" placeholder="např. úprava meče – perk z Artikulí" required></label><label>Pro <select name="k" aria-label="Postava">${KARTY.map(k => `<option value="${besc(k.id)}">${besc(k.n)}</option>`).join("")}</select></label><label>Cena <input name="c" type="number" min="0" step="0.5" style="width:6em" required> gr.</label><label>Dní <input name="d" type="number" min="0" max="365" value="3" style="width:4em"></label><button class="gbtn ghost">Zadat a vybrat peníze</button></form>`
        : ""
    }
    <ul class="obchz obchgm">${Z.map(
      r =>
        `<li${r.mag ? ' class="obchmag"' : ""}><span class="obchn">${besc(r.n)}${r.ruc ? ` <small>${r.q != null ? `${r.q} ks` : "bez omezení"} · vystaveno</small>` : r.q != null ? ` <small>${r.q} ks</small>` : ""}</span><b>${besc(obchGr(r.hal))}</b><button type="button" class="gbtn ghost" data-obchven="${besc(o.id)}|${besc(r.id)}" ${btip(r.ruc ? "Odebrat z obchodu" : "Tohle tu neprodávají")}>×</button></li>`,
    ).join("")}</ul>
    ${vyr.length ? `<p class="rsmall">Vyřazeno: ${vyr.map(x => `<button type="button" class="gbtn ghost" data-obchzpet="${besc(o.id)}|${besc(x.id)}">${besc(x.cz || x.en)} ↺</button>`).join(" ")}</p>` : ""}
  </div>`;
}
function obchGmHtml() {
  if (OBCH === null) {
    OBCH = [];
    obchNacti().then(() => curView === "boj" && renderBoj());
  }
  if (!VYB) vybNacti().then(() => curView === "boj" && renderBoj());
  const dl = VYB
    ? `<datalist id="obchdl">${VYBSK.flatMap(([sk]) => (VYB[sk] || []).map(x => `<option value="${besc(x.en)}">${besc((x.cz || "") + (sk === "magicke" ? " · kouzelný" : ""))}</option>`)).join("")}</datalist>`
    : "";
  const kde = partyPlace();
  return `<section class="obchsec"><h3 class="uvh2">Obchody</h3>
    <form class="kvlh" data-obchnovy><label>Nový obchod ${obchSelectHtml("typ", "kramar")}</label><input name="n" placeholder="název (např. U Zlatého kohouta)" maxlength="60"><input name="misto" placeholder="místo" maxlength="60" value="${besc(kde || "")}"><button class="gbtn">Založit</button></form>
    ${
      (OBCH || []).length
        ? `<ul class="obchl obchlgm">${OBCH.map(o => {
            const c = obchKontext(o),
              jinde = o.vaz && o.misto && !obchTady(o, kde);
            return `<li class="${o.id === OBCHOTV ? "on" : ""}"><div class="obchr"><button type="button" class="obchnz" data-obchrozb="${besc(o.id)}"><b>${besc(o.n)}</b><small>${besc((OBCHTYP[o.typ] || {}).n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}${c.prir ? ` · ${c.prir > 0 ? "+" : ""}${c.prir} %` : ""}${c.prir === null ? " · neobchoduje (pověst ve městě)" : ""}${jinde ? " · družina jinde" : ""}${(o.zak || []).length ? ` · zakázky ${o.zak.length}` : ""}</small></button>
              <label class="obchot" ${btip("Otevřený obchod vidí hráči v listu Peníze (když je družina na místě) a mohou v něm nakupovat")}><input type="checkbox" data-obchotevr="${besc(o.id)}"${o.otevr ? " checked" : ""}> otevřeno</label>
              <button type="button" class="gbtn ghost" data-obchsmaz="${besc(o.id)}" aria-label="Smazat obchod">Smazat</button></div>
              ${o.id === OBCHOTV && VYB ? obchDetailHtml(o) : ""}</li>`;
          }).join("")}</ul>`
        : `<p class="rsmall">Zatím žádný obchod. Založ ho, uprav sortiment a otevři – hráči ho pak uvidí v listu Peníze na kartě.</p>`
    }${dl}</section>`;
}
function pultNastrojeHtml() {
  return `<section class="tabsec"><h3 class="uvh2">Losovací tabulky</h3>
      <p class="kvlh"><label>Situace <select data-tabsitn aria-label="Situace hodu">${Object.entries(TABSIT)
        .map(([k, n]) => `<option value="${k}">${n}</option>`)
        .join(
          "",
        )}</select></label><button type="button" class="gbtn ghost" data-tablos="pok">Pokušení – komplikace</button><button type="button" class="gbtn ghost" data-tablos="poz">Požehnání – účinek</button><button type="button" class="gbtn ghost" data-tablos="sepot">Šepot Pokušení</button><button type="button" class="gbtn ghost" data-tablos="zvesti">Zvěsti v krčmě</button></p>
      <div id="tabvys" class="tabvys"><p class="rsmall">Tři nápady jedním klepnutím. U každého Pokušení a Požehnání v herním záznamu je také tlačítko 💡. Jména a povahy postav losuje generátor v panelu Při hře.</p></div></section>
    ${obchGmHtml()}
    <section class="povsec"><h3 class="uvh2">Pověst družiny</h3>${povSeznamHtml(false)}
      <form class="kvlh" data-povf><label>Město či rod <select name="r" aria-label="Město či rod"><optgroup label="Města">${povMesta()
        .map(n => `<option value="${besc(povMestoId(n))}">${besc(n)}</option>`)
        .join("")}</optgroup><optgroup label="Rody">${obchRody()
        .map(f => `<option value="${besc(f.id)}">${besc(f.name)}</option>`)
        .join("")}</optgroup></select></label><label>Pověst <select name="u" aria-label="Pověst">${[3, 2, 1, 0, -1, -2, -3]
        .map(u => `<option value="${u}"${u === 0 ? " selected" : ""}>${POVL[u]}</option>`)
        .join(
          "",
        )}</select></label><input name="pz" maxlength="200" placeholder="důvod (uvidí i hráči)"><button class="gbtn ghost">Nastavit</button></form>
      <p class="rsmall">Hráči vidí pověst v panelu města na mapě, na stránce rodu a v Družině; u rodů, které družina nezná, ji databáze nepošle. Pověst ve městě mění ceny všech jeho obchodů (cechy drží spolu): při Přízni nižší, při Nedůvěře vyšší, při Nepřízni s družinou neobchodují.</p></section>`;
}
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !GMV) return;
  if (f.matches("[data-povf]")) {
    e.preventDefault();
    await povUloz(f.elements.r.value, +f.elements.u.value, f.elements.pz.value.trim());
    return;
  }
  if (f.matches("[data-obchnovy]")) {
    e.preventDefault();
    const misto = f.elements.misto.value.trim(),
      o = Object.assign(obchNovy(f.elements.typ.value, f.elements.n.value.trim(), misto), {vaz: !!misto, zpust: obchZpustly(misto)});
    o.kup = obchKupec(o);
    OBCHOTV = o.id;
    await obchUloz([...(OBCH || []), o], `Obchod založen: ${o.n} (zatím zavřený)${o.zpust ? " – zpustlý kraj" : ""}.`);
    return;
  }
  if (f.matches("[data-obchf]")) {
    e.preventDefault();
    const E = f.elements,
      id = f.dataset.obchf;
    await obchUloz(
      obchZmen(id, o =>
        Object.assign({}, o, {
          n: E.n.value.trim().slice(0, 60) || o.n,
          typ: OBCHTYP[E.typ.value] ? E.typ.value : o.typ,
          misto: E.misto.value.trim().slice(0, 60),
          vaz: E.vaz.checked,
          rod: undefined,
          prir: Math.max(-50, Math.min(500, Math.round(+E.prir.value || 0))),
          zpust: E.zpust.checked,
          zas: E.zas.checked,
          dc: Math.max(5, Math.min(30, Math.round(+E.dc.value || 0))) || undefined,
          pozn: E.pozn.value.trim().slice(0, 200),
        }),
      ),
      "Obchod uložen.",
    );
    return;
  }
  if (f.matches("[data-obchvf]")) {
    e.preventDefault();
    await vybNacti();
    const id = f.dataset.obchvf,
      t = f.elements.x.value.trim(),
      x = vybNajdi(t) || Object.values(VYBBY).find(v => vybKl(v.en) === vybKl(t) || vybKl(v.cz || "") === vybKl(t));
    if (!x) {
      mmHlasG(`„${t}“ v katalogu není.`, 3500);
      return;
    }
    const gr = +f.elements.c.value,
      q = f.elements.q.value;
    await obchUloz(
      obchZmen(id, o => obchVystav(o, Object.assign({sk: x.sk}, x), q, gr > 0 ? gr * 10 : 0)),
      `Vystaveno: ${x.cz || x.en}${obchMag(x) ? " (unikát)" : ""}.`,
    );
    return;
  }
  if (f.matches("[data-obchvlz]")) {
    e.preventDefault();
    const E = f.elements,
      oid = f.dataset.obchvlz,
      o = obchById(oid),
      K = KARTBY[E.k.value],
      cel = Math.round((+E.c.value || 0) * 10),
      dny = Math.max(0, Math.round(+E.d.value || 0)),
      n = E.n.value.trim().slice(0, 80);
    if (!o || !K || !n) return;
    try {
      const zb = cel > 0 ? await obchZaplat(K, cel, false, `zakázka ${n} – ${o.n}`) : kPenTxt(kPenKarta(K));
      const den = obchDnes(),
        z = {id: "z" + Math.random().toString(36).slice(2, 8), k: K.id, kn: K.n, pol: "", n, q: 1, cena: cel, hot: den ? den + dny : 0};
      await obchUloz(
        obchZmen(oid, y => obchZakazkaPridej(y, z)),
        `Zakázka zadána: ${n} pro ${K.n}.`,
      );
      kHodZapis({
        k: K.id,
        kdo: K.n,
        co: "Zakázka",
        txt: `${n} za ${obchGr(cel)} – ${o.n}${z.hot ? `, hotovo ${obchDenTxt(z.hot, MES)}` : ""} → ${zb}`,
      });
      kartyPrekresli();
    } catch (er) {
      mmHlasG("Zakázka se nepovedla: " + (er.message || er), 6000);
    }
  }
});
document.addEventListener("click", async e => {
  if (!GMV) return;
  const T = s => e.target.closest && e.target.closest(s);
  const r = T("[data-obchrozb]");
  if (r) {
    OBCHOTV = OBCHOTV === r.dataset.obchrozb ? "" : r.dataset.obchrozb;
    if (!VYB) await vybNacti();
    renderBoj();
    return;
  }
  const s = T("[data-obchsmaz]");
  if (s) {
    const o = obchById(s.dataset.obchsmaz);
    if (o && confirm(`Smazat obchod ${o.n}?`))
      await obchUloz(
        (OBCH || []).filter(x => x.id !== o.id),
        "Obchod smazán.",
      );
    return;
  }
  const g = T("[data-obchgen]");
  if (g) {
    await obchUloz(obchZmen(g.dataset.obchgen, o => Object.assign({}, o, {kup: obchKupec(o)})));
    return;
  }
  const zh = T("[data-obchzakhned]");
  if (zh) {
    await obchZakDoruc(zh.dataset.obchzakhned);
    return;
  }
  const zx = T("[data-obchzakz]");
  if (zx) {
    const [oid, zid] = zx.dataset.obchzakz.split("|");
    if (confirm("Zrušit zakázku? Peníze se nevracejí samy."))
      await obchUloz(
        obchZmen(oid, o => Object.assign({}, o, {zak: (o.zak || []).filter(z => z.id !== zid)})),
        "Zakázka zrušena.",
      );
    return;
  }
  const v = T("[data-obchven]");
  if (v) {
    const [oid, pid] = v.dataset.obchven.split("|");
    await obchUloz(
      obchZmen(oid, o =>
        (o.pol || []).some(p => p.id === pid)
          ? Object.assign({}, o, {pol: o.pol.filter(p => p.id !== pid)})
          : Object.assign({}, o, {ven: [...new Set([...(o.ven || []), pid])]}),
      ),
    );
    return;
  }
  const z = T("[data-obchzpet]");
  if (z) {
    const [oid, pid] = z.dataset.obchzpet.split("|");
    await obchUloz(obchZmen(oid, o => Object.assign({}, o, {ven: (o.ven || []).filter(x => x !== pid)})));
  }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!GMV || !t.matches || !t.matches("[data-obchotevr]")) return;
  const id = t.dataset.obchotevr;
  await obchUloz(
    obchZmen(id, o => Object.assign({}, o, {otevr: t.checked})),
    t.checked ? "Obchod je otevřený – hráči ho vidí v listu Peníze." : "Obchod zavřen.",
  );
});
