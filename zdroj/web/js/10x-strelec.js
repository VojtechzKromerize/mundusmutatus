/* @čisté – Střelec (Gunslinger, doplněk mimo SRD; Vojtův překlad 2026-10-28): kostky Štěstěny, kritický zásah na dálku a kousky =====
   ČISTÝ SOUBOR (viz 10u): jen čísla podle úrovně povolání a výsledky kousků; karta (17) a boj (14, 14c, 20, 20b) je volají s daty.
   Plné znění je jen pro přihlášené (Pravidla › Doplňky mimo SRD › Povolání), tady jsou jen vlastní krátké popisy pro nápovědu.
   Kostky Štěstěny (Risk Dice) jsou na kartě zdroj z PDF („Risk Dice: 5 / Short Rest“); velikost kostky dává úroveň. ===== */

/* velikost a počet kostek Štěstěny podle úrovně Střelce (od 2. úrovně) */
function strRD(u) {
  u = +u || 0;
  if (u < 2) return null;
  return {n: u >= 14 ? 6 : u >= 6 ? 5 : 4, k: u >= 18 ? "d12" : u >= 10 ? "d10" : "d8"};
}
/* Critical Shot: nejnižší přirozený hod, který je kritickým zásahem útoku zbraní na dálku */
const strKrit = u => ((+u || 0) >= 17 ? 17 : (+u || 0) >= 9 ? 18 : (+u || 0) >= 2 ? 19 : 20);
/* Šrám (Grazing Shot): kostka + DEX, nejméně 1 */
const strSram = (d, dex) => Math.max(1, (+d || 0) + (+dex || 0));
/* Zatnout zuby (Bite the Bullet): dočasné životy = kostka + úroveň Střelce; dočasné životy se nesčítají – platí vyšší */
const strZuby = (d, u, thp) => Math.max(+thp || 0, (+d || 0) + (+u || 0));
/* Svéhlavost (Maverick Spirit): jen ověření a záchrany na INT, WIS a CHA (ab = vlastnost hodu) */
const strSvehlavost = ab => /^(INT|WIS|CHA)$/.test(String(ab || ""));
/* Štěstí přeje odvážným (Risk Taker, Karbaník 10): Svéhlavost a O vlásek zdarma s k6; karb = podtřída Karbaník (High Roller) */
const strZdarma = (u, karb) => (+u || 0) >= 10 && !!karb;
/* kousky: [klíč, anglicky, česky, čas (BA bonusová akce, R reakce, 0 bez akce), od úrovně, krátký popis]; lhar jen Karbaník */
const STRKOUSKY = [
  ["zuby", "Bite the Bullet", "Zatnout zuby", "BA", 2, "dočasné životy: kostka Štěstěny + úroveň Střelce"],
  ["slepo", "Blindfire", "Naslepo", "BA", 2, "do konce tahu vidíš bez zraku na 30 stop (Blindsight)"],
  ["kotoul", "Dodge Roll", "Kotoul stranou", "BA", 2, "až 15 stop pohybu bez příležitostných útoků a přes obtížný terén, nabiješ zbraň"],
  ["lhar", "Liar's Dice", "Lhářské kostky", "BA", 3, "zranění na dálku hodíš tajně a ohlásíš; vypravěč může blaf prokouknout"],
  ["sram", "Grazing Shot", "Šrám", "0", 2, "při minutí na dálku zraníš i tak: kostka + DEX (nejméně 1), jednou za tah"],
  ["svehl", "Maverick Spirit", "Svéhlavost", "0", 2, "k neúspěšnému ověření či záchraně na INT, WIS nebo CHA přičteš kostku, jednou za tah"],
  ["vlasek", "Skin of Your Teeth", "O vlásek", "R", 2, "reakcí na zásah přičteš kostku ke své AC proti tomuto útoku"],
];
const strKousek = k => STRKOUSKY.find(x => x[0] === k) || null;
/* Hazard (Risky Business, Karbaník 6): jednou za tah si dáš nevýhodu k útoku a vrátíš si jednu utracenou kostku */
const strHazard = (u, karb, uz, zb, max) => (+u || 0) >= 6 && !!karb && !uz && (+zb || 0) < (+max || 0);
