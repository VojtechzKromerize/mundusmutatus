/* ===== Základ: data z buildu (rody, vazby, zeměpis, erby), víry a ikony, odkazy mezi stránkami (mmLina), odložené překreslení (mmPozdeji) ===== */
const FAM = /*@FAM@*/ [];
const REL = /*@REL@*/ [];
/* zeměpis: královská města a sídla církevních vrchností jsou na mapě vždy, i když družina rod nezná */
const ZEMEPIS = /*@ZEMEPIS@*/ [];
const byId = Object.fromEntries(FAM.map(f => [f.id, f]));
/* překreslení jednou za dávku změn (2026-10-21): když jedna obsluha změní data několikrát (zápis útoku, potvrzení, puls),
   stránka se překreslí jen jednou – po doběhnutí obsluhy (mikroúloha). Okamžité překreslení (renderBoj…) čekající zruší. */
const MMPREK = new Map();
function mmPozdeji(klic, fn) {
  if (MMPREK.has(klic)) return;
  MMPREK.set(klic, fn);
  queueMicrotask(() => {
    const f = MMPREK.get(klic);
    MMPREK.delete(klic);
    if (f) f();
  });
}
const mmZrus = klic => MMPREK.delete(klic);
/* starší data z prohlížeče (kopie karet, boj, výprava…) se při čtení převedou jako data z databáze (mmStare v koruna.html):
   DEX (dřív AGI) a názvy stavů podle Vojty 2026-10-24 (paralyzovaný, spoután, vyděšen, otráven) */
const mmDex = s => (typeof window.mmStare === "function" ? window.mmStare(s) : s);
const CONFN = {kat: "katolíci", kal: "kališníci", mix: "smíšení", isl: "islám"};
const FICON = {kat: "art/img/vira-kat.webp", kal: "art/img/vira-kal.webp", mix: "art/img/vira-mix.webp", isl: "art/img/vira-isl.webp"};
const SFICON = {
  kat: "art/img/vira-kat.webp",
  kal: "art/img/vira-kal.webp",
  pra: "art/img/vira-pra.webp",
  isl: "art/img/vira-isl.webp",
  mix: "art/img/vira-smi.webp",
};
const faith = c => `<span class="faith f-${c}"><img src="${FICON[c]}" alt="" aria-hidden="true">${CONFN[c]}</span>`;
const CASTLEICO = "art/img/hrad.webp";
const TOWNSEATS = new Set([
  "Picnov",
  "Moravský Krumlov",
  "Poděbrady",
  "Náchod",
  "Kladsko",
  "Minsterberk",
  "Český Krumlov",
  "Třeboň",
  "Jindřichův Hradec",
  "Telč (Morava)",
  "Blatná",
  "Rožmitál",
  "Litomyšl",
  "Budyně",
  "Děčín",
  "Bor",
  "Šternberk (Morava)",
  "Kroměříž",
  "Vyškov",
  "Velké Meziříčí",
  "Nisa",
  "Opolí",
  "Horní Hlohov",
  "Opava",
  "Hlubčice",
  "Krnov",
  "Ratiboř",
  "Těšín",
  "Olešnice",
  "Žaháň",
  "Hlohov",
  "Lehnice",
  "Břeh",
  "Svídnice",
  "Javor",
  "Žary",
  "Beeskow",
  "Berlín-Cölln",
  "Chotěbuz",
  "Krakov",
  "Osvětim",
  "Budín",
  "Kremnice",
  "Vídeňské Nové Město",
  "Vídeň",
  "Landshut",
  "Mnichov",
  "Neumarkt",
  "Míšeň",
  "Drážďany",
  "Výmar",
  "Plavno",
  "Šamotuly",
  "Hnězdno",
  "Ostřihom",
  "Pezinok",
  "Svätý Jur",
  "Eferding",
  "Pasov",
  "Řezno",
  "Pfreimd",
  "Gera",
]); /* family seats that are towns rather than castles */
const TOWNICO = "art/img/mesto.webp";
const townImg = (c, cls) => `<img class="${cls || "townico"} t-${c}" src="${TOWNICO}" alt="" aria-hidden="true">`;
const RICON = {rod: "art/img/vazba-rod.webp", spoj: "art/img/vazba-spoj.webp", spor: "art/img/vazba-spor.webp"};
const rIco = t => `<img class="rico" src="${RICON[t]}" alt="" aria-hidden="true">`;
const RGL = {rod: "Krev", spoj: "Spojenectví", spor: "Spory"};
const relGroups = (rels, id, open) =>
  `<div class="relgs relrub">${["rod", "spoj", "spor"]
    .map(k => {
      const rs = rels.filter(r => r.t === k);
      if (!rs.length) return "";
      return `<details class="relg rg-${k}"${open ? " open" : ""}><summary><img class="rgi" src="${RICON[k]}" alt="" aria-hidden="true"><b>${RGL[k]}</b><span class="rgc">${rs.length}</span></summary><ul class="rels rels-g">${rs.map(r => `<li><span>${relText(r, id)}</span></li>`).join("")}</ul></details>`;
    })
    .join("")}</div>`;
const ARMS = /*@ARMS@*/ {};
const CARMS = {
  Brno: "art/erby/mesto-brno.webp",
  "Kutná Hora": "art/erby/mesto-kutna-hora.webp",
  Plzeň: "art/erby/mesto-plzen.webp",
  Praha: "art/erby/mesto-praha.webp",
  Vratislav: "art/erby/vra.webp",
};
const armsSrc = (A, big) => (A && typeof A === "object" ? (big ? A.v || A.s : A.s || A.v) : big ? A.replace("art/erby/", "art/erby/velke/") : A);
const armsImg = (f, cls) =>
  ARMS[f.id] ? `<img class="${cls}" src="${armsSrc(ARMS[f.id], cls === "armbig")}" alt="Erb: ${f.name}" loading="lazy" decoding="async">` : "";
const shield = f => (ARMS[f.id] ? armsImg(f, "armsmall") : shield0(f));
const shield0 = f =>
  `<svg class="shield" viewBox="0 0 20 24" aria-hidden="true"><path d="M2 2h16v9c0 6-4 9.5-8 11-4-1.5-8-5-8-11z" fill="var(--${f.conf})" stroke="var(--ink)" stroke-width="1.2"${f.nbr ? ' stroke-dasharray="2 1.5"' : ""}/></svg>`;

/* ===== Samostatné části skriptu (2026-10-19): kresba map, plán Prahy, mapa světa, Výprava a editor textů se stahují,
   až když je stránka potřebuje. build.py je vyřízne do v/cast-<název>-<otisk>.js a adresy dá do window.MMLINE;
   ve vypravěčském souboru (a když část už běží) je MMLINE prázdné a mmLina hned skončí. ===== */
const MMLINY = {};
const mmLinaJe = n => !(window.MMLINE || {})[n];
/* část může mít víc souborů (hra = boj, karta, hra): spustí se v uvedeném pořadí; když selže jen jeden z několika,
   nejde ji zkusit znovu (už spuštěné soubory by se spustily podruhé) – pomůže obnovit stránku */
function mmLina(n) {
  const L = window.MMLINE || {};
  if (!L[n]) return Promise.resolve();
  return (
    MMLINY[n] ||
    (MMLINY[n] = new Promise((ok, ko) => {
      const U = [].concat(L[n]);
      let chyba = false;
      const ss = U.map((u, i) => {
        const s = document.createElement("script");
        s.src = u;
        s.async = false;
        s.onerror = () => {
          if (chyba) return;
          chyba = true;
          if (U.length === 1) {
            delete MMLINY[n];
            s.remove();
          }
          ko(
            new Error(
              U.length === 1
                ? "Část stránky se nepodařilo načíst – zkontroluj připojení."
                : "Část stránky se nepodařilo načíst – zkontroluj připojení a obnov stránku.",
            ),
          );
        };
        if (i === U.length - 1)
          s.onload = () => {
            if (chyba) return;
            L[n] = null;
            ok();
            try {
              document.dispatchEvent(new CustomEvent("mmlina", {detail: n}));
            } catch (e) {}
          };
        document.head.appendChild(s);
        return s;
      });
    }))
  );
}
/* části potřebné pro stránku (v pořadí, v jakém běží: plán Prahy kreslí i mapa světa, Výprava všechny mapy) */
/* „hra“ (boj, karty, hra, puls…) potřebují stránky s kartou, bojem a pravidly; ostatní stránky se ukážou bez ní */
const MMLINY_V = {
  mapa: ["mapa"],
  praha: ["praha"],
  svet: ["praha", "svet"],
  vyprava: ["hra", "mapa", "praha", "svet", "editor", "vyprava"],
  nebe: ["hra", "nebe"],
  pravidla: ["hra"],
  karty: ["hra"],
  boj: ["hra"],
  hra: ["hra"],
  sezeni: ["hra"],
  kouzla: ["hra"],
  gm: ["hra"],
};
async function mmLinyPro(v) {
  for (const n of MMLINY_V[v] || []) await mmLina(n);
}
const mmLinyHotove = v => (MMLINY_V[v] || []).every(mmLinaJe);
