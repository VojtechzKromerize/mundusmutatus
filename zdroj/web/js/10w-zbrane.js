/* @čisté – Vlastnosti a mistrovství zbraní (Weapon Traits a Weapon Masteries, 2026-10-24) =====
   ČISTÝ SOUBOR: jen výpočty nad daty, žádná stránka ani jména z jiných souborů (hlídá npm run kontrola, testy v čistém Node).
   Plné znění pravidel je v Pravidlech › Výbava (zdroj/pravidla/04-srd.md, Vojtův překlad); tady jsou české názvy a krátké
   popisy pro nápovědu na kartě a výpočty pro boj: jaké vlastnosti a mistrovství zbraň má, zda postava mistrovství používá,
   modifikátor útoku (Graze, SO Topple), zranění bez modifikátoru (útok navíc z Light / Nick / Cleave), Versatile obouruč,
   Heavy pod 13. Boj je volá z 20g-boj-mistrovstvi.js. Perky zbraní z Artikulí (Šikovná, Ostrá…) jsou jinde (20e). */
const ZBRVL = {
  Ammunition: ["Střelivo", "útok na dálku jen se střelivem; každý útok spotřebuje kus, po boji najdeš polovinu"],
  Finesse: ["Obratná", "k útoku i zranění STR, nebo DEX – pro oba hody stejnou"],
  Heavy: ["Těžká", "nevýhoda k útoku: zblízka se STR pod 13, na dálku s DEX pod 13"],
  Light: ["Lehká", "po akci Útok s lehkou zbraní můžeš bonusovou akcí zaútočit jinou lehkou zbraní, bez kladného modifikátoru ke zranění"],
  Loading: ["Nabíjení", "jeden výstřel za akci, bonusovou akci nebo reakci, i když máš víc útoků"],
  Range: ["Dostřel", "za běžným dostřelem nevýhoda, za maximálním nelze útočit"],
  Reach: ["Dlouhý dosah", "dosah o 5 stop delší, i pro příležitostné útoky"],
  Thrown: ["Vrhací", "lze ji vrhnout jako útok na dálku se stejným modifikátorem jako zblízka"],
  "Two-Handed": ["Obouruční", "útočíš s ní jen v obou rukou"],
  Versatile: ["Univerzální", "v obou rukou zblízka větší kostka zranění (v závorce)"],
};
const ZBRMS = {
  Cleave: ["Rozmáchnutí", "po zásahu zblízka jednou za tah útok na druhého tvora do 5 stop od prvního, zranění bez kladného modifikátoru"],
  Graze: ["Škrábnutí", "při minutí zranění ve výši modifikátoru útoku, stejného typu jako zbraň"],
  Nick: ["Rychlé seknutí", "útok navíc z vlastnosti Light v rámci akce Útok místo bonusové akce, jednou za tah"],
  Push: ["Odstrčení", "zásah odstrčí tvora Velkého a menšího přímo od tebe až o 10 stop"],
  Sap: ["Oslabení", "zasažený má nevýhodu na svůj příští útok před začátkem tvého příštího tahu"],
  Slow: ["Zpomalení", "zásah se zraněním: rychlost cíle −10 stop do začátku tvého příštího tahu (nesčítá se)"],
  Topple: ["Sražení", "zásah: CON záchrana (SO 8 + modifikátor útoku + zdatnost), při neúspěchu Sražen (Prone)"],
  Vex: ["Vyvedení z rovnováhy", "zásah se zraněním: výhoda na tvůj příští útok proti tomuto tvorovi do konce tvého příštího tahu"],
};
/* mistrovství zbraní SRD 5.2.1 (tabulka Zbraně v Pravidlech › Výbava) */
const ZBRMA = {
  Club: "Slow",
  Dagger: "Nick",
  Greatclub: "Push",
  Handaxe: "Vex",
  Javelin: "Slow",
  "Light Hammer": "Nick",
  Mace: "Sap",
  Quarterstaff: "Topple",
  Sickle: "Nick",
  Spear: "Sap",
  Dart: "Vex",
  "Light Crossbow": "Slow",
  Shortbow: "Vex",
  Sling: "Slow",
  Battleaxe: "Topple",
  Flail: "Sap",
  Glaive: "Graze",
  Greataxe: "Cleave",
  Greatsword: "Graze",
  Halberd: "Cleave",
  Lance: "Topple",
  Longsword: "Sap",
  Maul: "Topple",
  Morningstar: "Sap",
  Pike: "Push",
  Rapier: "Vex",
  Scimitar: "Nick",
  Shortsword: "Vex",
  Trident: "Topple",
  Warhammer: "Push",
  "War Pick": "Sap",
  Whip: "Slow",
  Blowgun: "Vex",
  "Hand Crossbow": "Vex",
  "Heavy Crossbow": "Push",
  Longbow: "Slow",
  Musket: "Slow",
  Pistol: "Vex",
};
/* vlastnosti a mistrovství zbraně: ze seznamu z PDF (útok z D&D Beyond: „Martial, Versatile, Sap“) a z tabulky SRD
   („Thrown (dostřel 20/60), Versatile (1d8)“) → {vl: {Light: true, Versatile: "1d8", Thrown: "20/60"…}, ma: "Sap" | null} */
function zbrRozbor(vlPdf, srdVl, srdMa) {
  const vl = {};
  let ma = null;
  const pridej = s => {
    const m = String(s || "")
      .trim()
      .match(/^([A-Za-z-]+(?: [A-Za-z-]+)?)\s*(?:\(([^)]*)\))?$/);
    if (!m) return;
    const n = Object.keys(ZBRVL).find(k => k.toLowerCase() === m[1].toLowerCase());
    if (n) {
      const arg = String(m[2] || "")
        .replace(/^dostřel\s*/i, "")
        .replace(/;.*$/, "")
        .trim();
      vl[n] = arg || vl[n] || true;
      return;
    }
    const q = Object.keys(ZBRMS).find(k => k.toLowerCase() === m[1].toLowerCase());
    if (q && !ma) ma = q;
  };
  String(srdVl || "")
    .split(/,\s*(?![^()]*\))/)
    .forEach(pridej);
  (vlPdf || []).forEach(pridej);
  if (vl.Thrown || vl.Ammunition) vl.Range = vl.Range || vl.Thrown || vl.Ammunition;
  return {vl, ma: ma || srdMa || null};
}
/* používá postava mistrovství zbraně? Rysy z D&D Beyond: „Vex (Rapier)“, „Longsword (Sap)“; bez známého druhu zbraně stačí
   jakýkoli rys s tímto mistrovstvím */
function zbrMaMa(ma, rysy, druh) {
  if (!ma) return false;
  const d = String(druh || "").toLowerCase();
  return (rysy || []).some(r => {
    const m = String(r || "")
      .trim()
      .match(/^(.+?)\s*\(([^)]+)\)$/);
    if (!m) return false;
    const a = m[1].trim().toLowerCase(),
      b = m[2].trim().toLowerCase(),
      M = ma.toLowerCase();
    if (a === M) return !d || b === d;
    if (b === M) return !d || a === d;
    return false;
  });
}
/* modifikátor vlastnosti u útoku zbraní: bonus k útoku − zdatnost − magický bonus z názvu („+1“); nejméně 0 pro Graze */
const zbrMagie = n => {
  const m = String(n || "").match(/\+(\d)\b/);
  return m ? +m[1] : 0;
};
const zbrMod = (b, pb, n) => (+b || 0) - (+pb || 0) - zbrMagie(n);
/* zranění bez kladného modifikátoru vlastnosti (útok navíc z Light / Nick / Cleave): „1d6+4“ s modifikátorem 3 → „1d6+1“ */
function zbrBezMod(z, mod) {
  const s = String(z || "").trim(),
    m = s.match(/^(.*?)([+-]\d+)$/);
  if (!(mod > 0)) return s;
  const c = (m ? +m[2] : 0) - mod,
    zak = m ? m[1] : s;
  return c > 0 ? `${zak}+${c}` : c < 0 ? `${zak}${c}` : zak;
}
/* Versatile obouruč: první kostka zranění se nahradí kostkou z vlastnosti („1d8+3“ s 1d10 → „1d10+3“) */
const zbrObour = (z, kost) => (kost && /^\d*d\d+$/.test(kost) ? String(z || "").replace(/^\d*d\d+/, kost) : String(z || ""));
/* Versatile bez kostky v závorce (magická zbraň z PDF): obouruč o stupeň větší kostka (d6 → d8, d8 → d10, d10 → d12) */
const zbrVersKost = z => {
  const m = String(z || "").match(/^(\d*)d(\d+)/),
    d = m && {6: 8, 8: 10, 10: 12}[+m[2]];
  return d ? `${m[1] || 1}d${d}` : null;
};
/* Artikule 2026-10-25 – pomalá, ale těžká rána: těžká kuše, píšťala a hákovnice vystřelí jednou za akci Útok a za každý
   další útok akce přidají kostku zbraně („1d10+4“ ×2 → „2d10+4“). Lehká a ruční kuše se napínají rychle a střílí normálně.
   Kdo Nabíjení ignoruje (Crossbow Expert u kuší), střílí vícekrát s běžnými kostkami – pak null. */
const ZBRPOMALE = ["Heavy Crossbow", "Musket", "Pistol"];
function zbrPomala(druh, pocet, z, bezNab) {
  const m = String(z || "").match(/^(\d*)d(\d+)(.*)$/);
  if (!ZBRPOMALE.includes(druh) || !(pocet > 1) || bezNab || !m) return null;
  return {z: `${(+m[1] || 1) * pocet}d${m[2]}${m[3]}`, kostek: pocet};
}
/* Zalícení (Artikule 2026-10-25): s těžkou kuší stojí polovinu rychlosti a dá výhodu na útok */
const zbrZalic = druh => druh === "Heavy Crossbow";
/* Heavy: nevýhoda zblízka se STR pod 13, na dálku s DEX pod 13 */
const zbrTezkaNev = (vl, dal, str, agi) => !!(vl && vl.Heavy) && (dal ? +agi < 13 : +str < 13);
