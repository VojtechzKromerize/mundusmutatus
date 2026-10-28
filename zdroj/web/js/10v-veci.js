/* @čisté – Vlastní předměty z Dílny vypravěče (2026-10-28) =====
   ČISTÝ SOUBOR: jen výpočty nad daty, žádná stránka ani jména z jiných souborů (hlídá npm run kontrola, testy v čistém Node).
   Věc ve vybavení může nést popis mechaniky `def` – vypravěč ji v kartě › Spravovat inventář vytvoří ze základu z katalogu
   (zbraň, zbroj, štít, nebo bez základu) a upraví. Jméno věci je pak volné: karta nepozná zbraň podle jména, ale podle def.
   Věc bez def se počítá postaru podle jména (kZbranInfo, kZbrInfo, kPred v 16 a 18).
   def = {
     d: "zbr" | "zbroj" | "stit" | "vec",   druh
     z: "longsword", zn: "Longsword",      základ z katalogu (id a anglický název – zdatnost, mistrovství, pomalá rána)
     k: "1d8", t: "Slashing", vl: ["Versatile (1d10)"], ma: "Sap", s: "S" | "M", dal: 1, dos: "80/320"   zbraň
     pk: ["Odvetná"]                        perky zbraní z Artikulí
     zr: [{k: "1d6", t: "Fire"}]            zranění navíc při zásahu
     ac: 15, max: 2 (9 = bez omezení, chybí = těžká), dr: "Plátová", pl: 1, str: 15   zbroj (štít: ac 2)
     b: 1–3                                 magický bonus (útok a zranění, nebo AC)
     ef: [{c: "zach", v: 1}, {c: "vl:STR", v: 19}]   trvalé bonusy jako u předmětů SRD (c = klíč úpravy postavy)
     pr: 1, vz: "vzácný"                    připoutání, vzácnost
   } */
const VECZT = [
  "Acid",
  "Bludgeoning",
  "Cold",
  "Fire",
  "Force",
  "Lightning",
  "Necrotic",
  "Piercing",
  "Poison",
  "Psychic",
  "Radiant",
  "Slashing",
  "Thunder",
];
const VECDR = ["Vycpávaná", "Kroužková", "Plátová", "Komplexní"];
const VECVZ = ["běžný", "neobvyklý", "vzácný", "velmi vzácný", "legendární", "artefakt"];
const VECAB = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
/* výjimky z pravidla perků (Artikule › Zbraně): meče, halapartna a hákovnice smí mít víc než jeden pasivní a jeden aktivní perk */
const VECPKX = /sword|rapier|halberd|musket/i;
const vecKostka = s => {
  const t = String(s == null ? "" : s)
    .trim()
    .toLowerCase();
  return /^(\d{1,2}d(4|6|8|10|12|20)|\d{1,2})$/.test(t) ? t : "";
};
const vecCislo = (v, a, b) => {
  const n = Math.round(+v);
  return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : a;
};
/* vlastnost zbraně SRD: „Versatile (1d10)“, „Thrown (20/60)“ – jen známá jména, parametr krátký */
function vecVl(s, zname) {
  const m = String(s || "")
    .trim()
    .match(/^([A-Za-z-]+(?: [A-Za-z-]+)?)\s*(?:\(([^()]{1,20})\))?$/);
  if (!m) return "";
  const n = (zname || []).find(k => k.toLowerCase() === m[1].toLowerCase());
  return n ? (m[2] ? `${n} (${m[2].trim()})` : n) : "";
}
/* očistí def z formuláře nebo z databáze; P = seznamy, které zná stránka: {vl: vlastnosti SRD, ma: mistrovství, pk: perky, ef: klíče úprav} */
function vecDefNorm(d, P) {
  if (!d || typeof d !== "object") return null;
  P = P || {};
  const o = {d: ["zbr", "zbroj", "stit", "vec"].includes(d.d) ? d.d : "vec"};
  if (d.z && /^[a-z0-9-]{1,60}$/.test(d.z)) o.z = d.z;
  if (d.zn) o.zn = String(d.zn).slice(0, 40);
  if (o.d === "zbr") {
    o.k = vecKostka(d.k) || "1d4";
    o.t = VECZT.includes(d.t) ? d.t : "Bludgeoning";
    o.vl = [...new Set((Array.isArray(d.vl) ? d.vl : []).map(v => vecVl(v, P.vl)).filter(Boolean))].slice(0, 10);
    if (d.ma && (P.ma || []).includes(d.ma)) o.ma = d.ma;
    o.s = d.s === "S" ? "S" : "M";
    if (d.dal) o.dal = 1;
    if (d.dos && /^\d{1,4}\/\d{1,4}$/.test(String(d.dos))) o.dos = String(d.dos);
    o.pk = [...new Set((Array.isArray(d.pk) ? d.pk : []).filter(p => (P.pk || []).includes(p)))].slice(0, 8);
    o.zr = (Array.isArray(d.zr) ? d.zr : [])
      .map(x => ({k: vecKostka(x && x.k), t: x && VECZT.includes(x.t) ? x.t : ""}))
      .filter(x => x.k && x.t)
      .slice(0, 3);
  }
  if (o.d === "zbroj") {
    o.ac = vecCislo(d.ac, 10, 25);
    if (d.max != null && d.max !== "") o.max = vecCislo(d.max, 0, 9);
    o.dr = VECDR.includes(d.dr) ? d.dr : "Vycpávaná";
    if (d.pl) o.pl = 1;
    if (d.str) o.str = vecCislo(d.str, 0, 20);
  }
  if (o.d === "stit") o.ac = vecCislo(d.ac == null ? 2 : d.ac, 1, 5);
  const b = vecCislo(d.b, 0, 3);
  if (b && o.d !== "vec") o.b = b;
  o.ef = (Array.isArray(d.ef) ? d.ef : [])
    .map(e => {
      const c = String((e && e.c) || ""),
        vl = c.match(/^vl:([A-Z]{3})$/);
      if (vl) return VECAB.includes(vl[1]) ? {c, v: vecCislo(e.v, 1, 30)} : null;
      if (!(P.ef || []).includes(c)) return null;
      const v = vecCislo(e.v, -10, 10);
      return v ? {c, v} : null;
    })
    .filter(Boolean)
    .slice(0, 8);
  if (d.pr) o.pr = 1;
  if (VECVZ.includes(d.vz)) o.vz = d.vz;
  Object.keys(o).forEach(k => {
    if (Array.isArray(o[k]) && !o[k].length && k !== "vl" && k !== "pk") delete o[k];
  });
  return o;
}
/* zbraň z def ve tvaru řádku tabulky zbraní KZBRAN: [vzor, název, kostka, typ, vlastnosti, S/M, dálková] */
function vecZbrRow(d) {
  if (!d || d.d !== "zbr") return null;
  return [null, d.zn || "Weapon", d.k || "1d4", d.t || "Bludgeoning", (d.vl || []).join(", "), d.s === "S" ? "S" : "M", d.dal ? 1 : undefined];
}
/* zbroj nebo štít z def ve tvaru kZbrInfo: {k: "z" | "s", ac, max, dr, m, pl} */
function vecZbroj(d) {
  if (!d) return null;
  const m = +d.b || 0;
  if (d.d === "stit") return {k: "s", ac: (+d.ac || 2) + m, m};
  if (d.d !== "zbroj") return null;
  return {k: "z", ac: (+d.ac || 10) + m, max: d.max == null ? null : +d.max, dr: d.dr || "Vycpávaná", m, pl: d.pl ? 1 : 0};
}
/* trvalé bonusy předmětu pro kartu: [{c, v, set?}] – nastavená vlastnost (vl:STR) má set */
const vecEf = d => ((d && d.ef) || []).map(e => (/^vl:/.test(e.c) ? {c: e.c, v: +e.v, set: 1} : {c: e.c, v: +e.v}));
/* perky nad rámec Artikulí: víc než jeden pasivní nebo aktivní (kromě mečů, halapartny a hákovnice) → upozornění, ne zákaz */
function vecPerkyVaruj(d, akt) {
  if (!d || d.d !== "zbr" || VECPKX.test(d.zn || "")) return "";
  const A = (d.pk || []).filter(p => (akt || []).includes(p)).length,
    Pa = (d.pk || []).length - A;
  return A > 1 || Pa > 1 ? `Artikule: zbraň má mít nejvýš jeden pasivní a jeden aktivní perk (tady ${Pa} pasivní, ${A} aktivní).` : "";
}
const vecSg = v => (v > 0 ? "+" : "") + v;
/* krátký souhrn mechaniky pro popis věci a náhled ve formuláři; N = české názvy {ma, ef} (nepovinné) */
function vecSouhrn(d, N) {
  if (!d) return "";
  N = N || {};
  const L = [],
    b = +d.b || 0;
  if (d.d === "zbr") {
    L.push(
      `${d.k}${b ? vecSg(b) : ""} ${d.t}${d.zr && d.zr.length ? d.zr.map(x => ` + ${x.k} ${x.t}`).join("") : ""}${b ? ` · útok ${vecSg(b)}` : ""}`,
    );
    if (d.vl && d.vl.length) L.push(d.vl.join(", "));
    if (d.dos) L.push(`dostřel ${d.dos}`);
    if (d.ma) L.push(`mistrovství ${(N.ma && N.ma[d.ma]) || d.ma}`);
    if (d.pk && d.pk.length) L.push(`perky ${d.pk.join(", ")}`);
  }
  if (d.d === "zbroj") {
    const r = vecZbroj(d);
    L.push(
      `AC ${r.ac}${r.max == null ? "" : r.max >= 9 ? " + DEX" : ` + DEX (nejvýš +${r.max})`} · ${d.dr}${d.pl ? " · nevýhoda na Stealth" : ""}${d.str ? ` · STR ${d.str}` : ""}`,
    );
  }
  if (d.d === "stit") L.push(`štít AC +${vecZbroj(d).ac}`);
  (d.ef || []).forEach(e => L.push(/^vl:/.test(e.c) ? `${e.c.slice(3)} ${e.v}` : `${(N.ef && N.ef[e.c]) || e.c} ${vecSg(e.v)}`));
  if (d.pr) L.push("vyžaduje připoutání");
  if (d.vz) L.push(d.vz);
  return L.join(" · ");
}
