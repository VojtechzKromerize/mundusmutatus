// Inventura automatiky kouzel (2026-10-22): pro každé kouzlo z art/kouzla.json vypíše, co s ním web umí
// (zranění/léčení z textu, útok/záchrana, stav ze záchrany, tabulky UCINKY/KZOPAK/KZOBL/KZLEC/KZSUM/KBUF/KPRID…).
//   node testy/jednotky/inventura_kouzel.mjs            – souhrn a seznam kouzel bez automatiky (TSV na stdout)
//   node testy/jednotky/inventura_kouzel.mjs --vse      – všechna kouzla
import {stranka} from "./stranka.mjs";

const S = await stranka();
await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
const vse = process.argv.includes("--vse");
const J = S.ev(`JSON.stringify((() => {
  const out = [];
  const jm = new Set();
  const EFK = ["Magic Weapon", "Elemental Weapon", "True Strike", "Shillelagh", "Green-Flame Blade", "Booming Blade", "Hex", "Hunter's Mark", "Divine Favor", "Counterspell", "Shield", "Sanctuary"];
  Object.values(KSPD).forEach(d0 => {
    if (jm.has(d0.en)) return;
    jm.add(d0.en);
    const d = kSpA(d0.en) || d0; /* text pro automatiku (ta/va), když ho kouzlo má */
    const l = Math.max(1, d.l || 0);
    let U = null;
    try { U = kSpUcD(d, l, () => 3, () => 5); } catch (e) { U = {err: String(e)}; }
    let st = null;
    try { st = bojSpStav(d.en); } catch (e) {}
    const T = [];
    if (UCINKY[d.en] && !UCINKY[d.en].kostka) T.push("UCINKY");
    if (KZOPAK[d.en]) T.push("KZOPAK");
    if (KZOBL[d.en]) T.push("KZOBL");
    if (KZLEC[d.en]) T.push("KZLEC");
    if (KZSUM[d.en]) T.push("KZSUM");
    if (KBUF[d.en]) T.push("KBUF");
    if (KPRID.some(r => r[0] === d.en)) T.push("KPRID");
    if (EFK.includes(d.en)) T.push("zvl");
    const t = String(d.t || "");
    const zach = (t.match(/(STR|DEX|CON|INT|WIS|CHA) záchrann/) || [])[1] || null;
    out.push({
      n: d.en, cz: d.cz, l: d.l, s: d.s, ko: !!d.ko, ri: !!d.ri, x: !!d.x, r: d.r, d: d.d, ct: d.ct,
      uk: U ? U.k : null, ux: U ? U.x : null, ut: U ? U.t : null, utok: !!(U && U.utok), zach: (U && U.zach) || zach,
      stav: st ? st.st.join("+") : "", tab: T.join("+"),
      txt: t.replace(/\\s+/g, " ").slice(0, 160),
    });
  });
  return out;
})())`);
const L = JSON.parse(J);
const auto = s => s.uk || s.stav || s.tab;
const bez = L.filter(s => !auto(s));
console.error(`kouzel ${L.length}, s automatikou ${L.length - bez.length}, bez ${bez.length}`);
const rows = vse ? L : bez;
console.log(["n", "l", "s", "ko", "ct", "r", "d", "uk", "ux", "ut", "utok", "zach", "stav", "tab", "txt"].join("\t"));
rows.forEach(s =>
  console.log(
    [s.n, s.l, s.s, s.ko ? "K" : "", s.ct, s.r, s.d, s.uk || "", s.ux || "", s.ut || "", s.utok ? "U" : "", s.zach || "", s.stav, s.tab, s.txt].join(
      "\t",
    ),
  ),
);
S.zavri();
