/* @čisté – Okno reakce (2026-10-23): kdo může reagovat, na co a s jakým výsledkem – jedna tabulka pro všechny reakce =====
   ČISTÝ SOUBOR (viz 10u). Spouštěč (co se stalo) + fakta o postavě (co umí a má) → nabídka reakcí; po volbě výsledek (kolik HP
   se vrátí). Fakta skládá stránka (kReakceFakta v 14c) z karty a stavu boje; kostky hodí stránka a předá je sem.

   Spouštěče: "zasah" – nepřítel mě zasáhl (řádek záznamu boje e: hod, ac, d, kr, ph/pt, t, dal, ai)
              "vedle" – nepřítel mě minul útokem (e: dal, ai, zv = pok/poz)   "kouzlo" – nepřítel sesílá kouzlo (Counterspell)
   Fakta f: rk reakce v tomto kole použita · nemuze stav, který bere reakce (omráčen, paralyzovaný…) · ds na 0 HP (hody proti smrti)
            kouzla [{n, i, st, pz}] reakční kouzla se slotem / nábojem · rysy [jména malými písmeny] · man [manévry Battle Mastera]
            sd {k: "d8", zb} kostky převahy · bi {st, zb} Bardic Inspiration · str, agi modifikátory · pb zdatnost · mnich úroveň
            odv zbraň zblízka s vlastností Odvetná
   Společné pravidlo (D&D 2024): reakce jednou za kolo (obnoví se na začátku vlastního tahu) a nejde, když stav bere reakce
   nebo je postava na 0 HP – dřív to hlídal jen Counterspell. ===== */

const RKELEM = /Acid|Cold|Fire|Lightning|Thunder/;
const rkZtr = e => (+e.ph || 0) + (+e.pt || 0);
/* reakční kouzlo podle jména (bez ohledu na velikost písmen) */
const rkKz = (f, re) => (f.kouzla || []).find(x => re.test(x.n));
const rkRys = (f, re) => (f.rysy || []).some(x => re.test(x));
const rkMan = (f, n) => (f.man || []).includes(n);
/* proč postava nemůže reagovat ("" = může) */
function reakceProc(f) {
  if (f.rk) return "Reakci jsi už v tomto kole použil.";
  if (f.ds) return "Na 0 HP nemůžeš reagovat.";
  if (f.nemuze) return `Nemůžeš reagovat (${f.nemuze}).`;
  return "";
}

/* REAKCE: [klíč, spouštěč, nabídka(f, e) → null | {n, t, i?}] – pořadí = pořadí tlačítek */
const REAKCE = [
  [
    "barbs",
    "zasah",
    (f, e) => {
      const x = rkKz(f, /^silvery barbs$/i);
      if (!x) return null;
      const hod = +e.hod,
        AC = +e.ac,
        mz = !e.kr && hod && AC && +e.d > 0;
      return {
        i: x.i,
        n: "Silvery Barbs – přehodit útok",
        t: mz
          ? `Útočník přehodí d20 (${e.d}) a použije nižší: hod ${hod} proti AC ${AC}; když mine, vrátí ${rkZtr(e)} HP`
          : "Útočník přehodí d20 a použije nižší výsledek",
      };
    },
  ],
  [
    "rebuke",
    "zasah",
    (f, e) => {
      const x = rkKz(f, /^hellish rebuke$/i);
      return x && rkZtr(e) > 0 && e.ai
        ? {
            i: x.i,
            n: "Hellish Rebuke – oplatit",
            t: "Útočník: záchrana DEX proti tvému SO, 2d10 Fire (+1d10 za každý stupeň slotu nad 1), úspěch polovina – pošle se vypravěči",
          }
        : null;
    },
  ],
  [
    "shield",
    "zasah",
    (f, e) => {
      const x = rkKz(f, /^shield$/i);
      if (!x) return null;
      const hod = +e.hod,
        AC = +e.ac,
        pom = !e.kr && hod && AC && hod < AC + 5;
      return {
        i: x.i,
        n: `Shield${pom ? " – útok mine" : " (+5 AC)"}`,
        t: pom
          ? `Útok ${hod} proti AC ${AC}+5 = vedle: vrátí ${rkZtr(e)} HP, slot ${x.st}. st.`
          : `+5 AC do tvého dalšího tahu, tento útok to nezmění (${e.kr ? "kritický zásah" : `hod ${hod || "?"}`})`,
      };
    },
  ],
  [
    "absorb",
    "zasah",
    (f, e) => {
      const x = rkKz(f, /^absorb elements$/i);
      if (!x) return null;
      const el = RKELEM.test(e.t || "");
      return {
        i: x.i,
        n: `Absorb Elements${el ? " – polovina" : ""}`,
        t: el
          ? `Resistance vůči ${e.t}: vrátí ${Math.ceil(rkZtr(e) / 2)} HP`
          : "Jen proti kyselinovému, mrazivému, ohnivému, bleskovému a hromovému zranění",
      };
    },
  ],
  /* ostatní reakční kouzla (bez automatiky): jen seslání */
  [
    "kz",
    "zasah",
    f =>
      (f.kouzla || [])
        .filter(x => !/^(silvery barbs|hellish rebuke|shield|absorb elements|counterspell)$/i.test(x.n))
        .map(x => ({i: x.i, n: x.n, t: `Sešle ${x.n} jako reakci`})),
  ],
  [
    "ud",
    "zasah",
    (f, e) =>
      rkRys(f, /^uncanny dodge$/i) && rkZtr(e) > 0
        ? {n: "Uncanny Dodge – polovina", t: `Polovina zranění: vrátí ${Math.ceil(rkZtr(e) / 2)} HP`}
        : null,
  ],
  [
    "da",
    "zasah",
    (f, e) =>
      rkRys(f, /^deflect attacks?$/i) && rkZtr(e) > 0 && /Bludgeoning|Piercing|Slashing/.test(e.t || "")
        ? {n: "Deflect Attacks", t: "Sníží zranění o 1d10 + DEX + úroveň mnicha"}
        : null,
  ],
  [
    "parry",
    "zasah",
    (f, e) =>
      f.sd && f.sd.zb > 0 && rkMan(f, "Parry") && rkZtr(e) > 0 && !e.dal
        ? {
            n: "Parry – méně zranění",
            t: `Kostka převahy: zranění −(1${f.sd.k}+${Math.max(+f.str || 0, +f.agi || 0)}), zbývá ${f.sd.zb} kostek`,
          }
        : null,
  ],
  [
    "cw",
    "zasah",
    (f, e) =>
      rkRys(f, /^cutting words$/i) && f.bi && f.bi.zb > 0
        ? {
            n: "Cutting Words",
            t:
              !e.kr && +e.hod && +e.ac
                ? `Odečte 1d${f.bi.st} od útoku (${e.hod} proti AC ${e.ac}): když tím mine, vrátí ${rkZtr(e)} HP, jinak sníží zranění`
                : `Sníží zranění o 1d${f.bi.st} (Bardic Inspiration, zbývá ${f.bi.zb})`,
          }
        : null,
  ],
  [
    "dd",
    "zasah",
    (f, e) =>
      rkRys(f, /^defensive duelist$/i) && !e.dal && !e.kr && +e.hod && +e.ac && +e.hod < +e.ac + (+f.pb || 0)
        ? {n: "Defensive Duelist – útok mine", t: `+${f.pb} AC proti útoku: vrátí ${rkZtr(e)} HP`}
        : null,
  ],
  /* minul mě útokem zblízka: Riposte (Battle Master) a Odvetná (vlastnost zbraně, jen když nepřítel přijal Pokušení) */
  [
    "riposte",
    "vedle",
    (f, e) =>
      rkMan(f, "Riposte") && f.sd && f.sd.zb > 0 && !e.dal && e.ai
        ? {n: "Riposte – oplatit", t: `Reakce: útok na blízko; při zásahu + 1${f.sd.k} (kostka převahy)`}
        : null,
  ],
  ["odv", "vedle", (f, e) => (f.odv && !e.dal && e.ai && e.zv === "pok" ? {n: "Odveta – oplatit", t: "Odvetná: protiútok reakcí"} : null)],
  /* nepřítel sesílá kouzlo */
  [
    "counterspell",
    "kouzlo",
    f => {
      const x = rkKz(f, /^counterspell$/i);
      return x ? {i: x.i, n: "Counterspell", t: "Reakce: protikouzlo – sesilatel hází záchranu CON proti tvému SO"} : null;
    },
  ],
];

/* nabídka reakcí na spouštěč: {proc: důvod, proč nejde (""), o: [{k, n, t, i?}]} */
function reakceOkno(f, e, spoust) {
  const proc = reakceProc(f || {});
  if (proc) return {proc, o: []};
  const o = [];
  for (const [k, sp, fn] of REAKCE) {
    if (sp !== spoust) continue;
    for (const r of [].concat(fn(f, e || {}) || [])) o.push(Object.assign({k}, r));
  }
  return {proc: "", o};
}
const reakceMa = (f, e, spoust, k) => reakceOkno(f, e, spoust).o.some(r => r.k === k);

/* výsledek reakce na zásah: kolik HP vrátit a popis do záznamu. x = hozené kostky: d (k10 / kostka převahy / Bardic), d20
   (Silvery Barbs). null = reakce HP nevrací (jen seslání, Hellish Rebuke…) */
function reakceVysledek(k, e, f, x) {
  const ztr = rkZtr(e),
    hod = +e.hod,
    AC = +e.ac,
    d = +(x && x.d) || 0;
  if (k === "shield") return !e.kr && hod < AC + 5 ? {n: ztr, proc: "Shield – útok minul"} : {n: 0, proc: "Shield (+5 AC)"};
  if (k === "absorb") return RKELEM.test(e.t || "") ? {n: Math.ceil(ztr / 2), proc: "Absorb Elements"} : {n: 0, proc: "Absorb Elements"};
  if (k === "ud") return {n: Math.ceil(ztr / 2), proc: "Uncanny Dodge"};
  if (k === "dd") return {n: ztr, proc: "Defensive Duelist – útok minul"};
  if (k === "da") {
    const r = d + (+f.agi || 0) + (+f.mnich || 0);
    return {n: Math.min(ztr, r), proc: `Deflect Attacks (${r})`};
  }
  if (k === "parry") {
    const m = Math.max(+f.str || 0, +f.agi || 0);
    return {n: Math.min(ztr, d + m), proc: `Parry (${d}+${m})`};
  }
  if (k === "cw")
    return !e.kr && hod && AC && hod - d < AC
      ? {n: ztr, proc: `Cutting Words (−${d}) – útok minul`}
      : {n: Math.min(ztr, d), proc: `Cutting Words (−${d} ze zranění)`};
  if (k === "barbs") {
    const d0 = +e.d || 0,
      d2 = +(x && x.d20) || 0,
      nd = d0 ? Math.min(d0, d2) : d2,
      tot = d0 ? hod - d0 + nd : null;
    return {
      n: tot != null && nd !== 20 && tot < AC ? ztr : 0,
      proc: "Silvery Barbs – útok minul",
      tot,
      nd,
      d2,
      kr: nd === 20,
    };
  }
  return null;
}
