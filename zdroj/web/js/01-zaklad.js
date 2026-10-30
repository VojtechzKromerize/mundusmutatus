/* ===== Základ: data z buildu (rody, vazby, zeměpis, erby), víry a ikony, odkazy mezi stránkami (mmLina), odložené překreslení (mmPozdeji) ===== */
const FAM = /*@FAM@*/ [];
const REL = /*@REL@*/ [];
/* zeměpis: královská města a sídla církevních vrchností jsou na mapě vždy, i když družina rod nezná */
const ZEMEPIS = /*@ZEMEPIS@*/ [];
const byId = Object.fromEntries(FAM.map(f => [f.id, f]));
/* překreslení jednou za dávku změn (2026-10-21): když jedna obsluha změní data několikrát (zápis útoku, potvrzení, puls),
   stránka se překreslí jen jednou – po doběhnutí obsluhy (mikroúloha). Okamžité překreslení (renderBoj…) čekající zruší. */
const MMPREK = new Map();
/* vzdálenost v českých mílích, kilometry v závorce (Vojta 2026-10-26): česká míle ≈ 11,24 km; pod 10 mil na půl míle */
const MILE_KM = 11.24;
function mileTxt(km, bezKm) {
  const m = (+km || 0) / MILE_KM,
    r = m < 10 ? Math.max(0.5, Math.round(m * 2) / 2) : Math.round(m),
    w = r % 1 || (r >= 1 && r <= 4) ? "míle" : "mil";
  return `${String(r).replace(".", ",")} ${w}${bezKm ? "" : ` (${Math.round(km).toLocaleString("cs")} km)`}`;
}
/* text do HTML (obsah i hodnota atributu v uvozovkách) – jediná funkce pro celý web */
const besc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
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
/* hlášení chyb (Vojta 2026-10-29): chyba skriptu, nezachycená chyba slibu a console.error s chybou se zapíšou do databáze
   (mm_chyba), vypravěč je vidí v Hra › Sezení. Za návštěvu nejvýš 12 různých; síťové výpadky a šum prohlížečů se nehlásí. */
const MMCHYBY = {n: 0, b: new Set()};
const MMCHSUM =
  /ResizeObserver loop|Script error\.?$|Failed to fetch|NetworkError|Load failed|network|AbortError|The operation was aborted|Bez připojení|Přihlášení vypršelo/i;
function mmChyba(zprava, misto) {
  try {
    const z = String(zprava || "").slice(0, 300),
      m = String(misto || "").slice(0, 300);
    if (!z || MMCHSUM.test(z) || !window.MMDB || !MMDB.chyba || navigator.onLine === false) return;
    const k = z + "|" + m;
    if (MMCHYBY.b.has(k) || MMCHYBY.n >= 12) return;
    MMCHYBY.b.add(k);
    MMCHYBY.n++;
    let kdo = GMV ? "vypravěč" : "";
    if (!GMV)
      try {
        kdo = (JSON.parse(localStorage.getItem("mm-hrac") || "null") || {}).k || "";
      } catch (e) {}
    const src = (document.getElementById("mmhlavni") || {}).dataset || {};
    MMDB.chyba({
      zprava: z,
      misto: m,
      stranka: location.hash.slice(0, 120),
      kdo,
      ua: navigator.userAgent.slice(0, 160),
      verze: String(src.src || "")
        .split(" ")[0]
        .slice(-20),
    }).catch(() => {});
  } catch (e) {}
}
const mmChMisto = s =>
  String(s || "")
    .split("\n")
    .map(r => r.trim())
    .filter(r => /\.js|<anonymous>|index\.html/.test(r))
    .slice(0, 2)
    .join(" ← ")
    .replace(/https?:\/\/[^/ ]+\//g, "");
addEventListener("error", e => {
  if (!e.message) return; /* nenačtený obrázek či skript – ne chyba kódu */
  mmChyba(
    e.message,
    e.error && e.error.stack
      ? mmChMisto(e.error.stack)
      : `${String(e.filename || "")
          .split("/")
          .pop()}:${e.lineno}:${e.colno}`,
  );
});
addEventListener("unhandledrejection", e => {
  const r = e.reason;
  if (!r) return;
  mmChyba(r.message || String(r), r.stack ? mmChMisto(r.stack) : "");
});
{
  /* chyby, které kód zachytí a jen vypíše (console.error(e) v catch) – také jsou to chyby */
  const ce = console.error.bind(console);
  console.error = (...a) => {
    ce(...a);
    const x = a.find(v => v instanceof Error);
    if (x) mmChyba(x.message, mmChMisto(x.stack));
  };
}
/* denní / noční vzhled (Vojta 2026-10-29): podle zařízení → denní → noční; volba v prohlížeči (mm-motiv), styly čtou :root[data-theme] */
const MMMOTIV = {auto: ["◐", "podle zařízení"], light: ["☀", "denní"], dark: ["☾", "noční"]};
function mmMotivTed() {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "auto";
}
function mmMotivPopis() {
  const [i, n] = MMMOTIV[mmMotivTed()];
  document.querySelectorAll("[data-mmmotiv]").forEach(b => {
    const l = `Vzhled: ${n} (klepnutím změníš)`;
    b.setAttribute("aria-label", l);
    b.title = l;
    const ic = b.querySelector(".navmotivi"),
      tx = b.querySelector(".navgmt");
    if (ic) ic.textContent = i;
    if (tx) tx.textContent = `Vzhled: ${n}`;
  });
}
/* barva karty (Vojta 2026-10-29): vínová výchozí + Noc, Les, Uhel, Purpur, Jantar, Hlubina, Popel, Čistá černá, Vysoký kontrast; volba v prohlížeči (mm-kb), styly čtou html[data-kb] (--kbt-*) */
const MMKB = {
  vino: "Vínová (výchozí)",
  noc: "Noc",
  les: "Les",
  uhel: "Uhel",
  purpur: "Purpur",
  jantar: "Jantar",
  hlubina: "Hlubina",
  popel: "Popel",
  oled: "Čistá černá",
  kontrast: "Vysoký kontrast",
};
const mmKbTed = () => document.documentElement.dataset.kb || "vino";
const mmKbSel = () =>
  `<label class="gbtn ghost mmkbl">Barva karty <select data-mmkb>${Object.entries(MMKB)
    .map(([k, n]) => `<option value="${k}"${mmKbTed() === k ? " selected" : ""}>${n}</option>`)
    .join("")}</select></label>`;
function mmKb(k) {
  const d = document.documentElement;
  if (k in MMKB && k !== "vino") d.dataset.kb = k;
  else delete d.dataset.kb;
  try {
    if (d.dataset.kb) localStorage.setItem("mm-kb", k);
    else localStorage.removeItem("mm-kb");
  } catch (e) {}
}
document.addEventListener("change", e => {
  if (e.target.matches && e.target.matches("[data-mmkb]")) {
    mmKb(e.target.value);
    document.querySelectorAll("[data-mmkb]").forEach(s => s !== e.target && (s.value = mmKbTed()));
  }
});
/* volba barvy karty i v záhlaví (Vojta 2026-10-30: na PC nebyla vidět – jen v listu Postava, kde ji na telefonu najdou) */
document.querySelectorAll(".navkb select").forEach(s => {
  s.innerHTML = Object.entries(MMKB)
    .map(([k, n]) => `<option value="${k}"${mmKbTed() === k ? " selected" : ""}>${n}</option>`)
    .join("");
});
/* tlačítko pro stránky bez záhlaví s menu (hráčova Hra v aplikaci a na telefonu – list Postava) */
const mmMotivBtn = () => {
  const [i, n] = MMMOTIV[mmMotivTed()];
  return `<button type="button" class="gbtn ghost" data-mmmotiv title="Vzhled: ${n} (klepnutím změníš)"><span class="navmotivi" aria-hidden="true">${i}</span> <span class="navgmt">Vzhled: ${n}</span></button>`;
};
function mmMotiv(t) {
  const d = document.documentElement;
  if (t === "light" || t === "dark") d.dataset.theme = t;
  else delete d.dataset.theme;
  try {
    if (t === "light" || t === "dark") localStorage.setItem("mm-motiv", t);
    else localStorage.removeItem("mm-motiv");
  } catch (e) {}
  mmMotivPopis();
  /* mapy mají barvy motivu upečené v kresbě – překreslí se */
  dispatchEvent(new Event("mmmotiv"));
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-mmmotiv]");
  if (!b) return;
  e.preventDefault();
  const t = mmMotivTed();
  mmMotiv(t === "auto" ? "light" : t === "light" ? "dark" : "auto");
});
mmMotivPopis();
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
  /* ---- JIH (mapa 2026-10-27) ---- */
  "Brixen",
  "Bruneck",
  "Trident",
  "Gorice",
  "Lienz",
  "Krk",
  "Senj",
  /* ---- MÍSTA: Slezsko a Lužice (2026-10-28) ---- */
  "Chojnov",
  "Němčí",
  "Prudník",
  "Střelce",
  "Němodlín",
  "Olesno",
  "Kluczbork",
  "Bruntál",
  "Rybník",
  "Žory",
  "Pština",
  "Bílsko",
  "Stínava",
  "Kožuchov",
  "Krosno nad Odrou",
  "Převoz",
  "Grodków",
  "Paczków",
  "Frývaldov",
  "Forst",
  /* ---- MÍSTA: Čechy a Morava (2026-10-28) ---- */
  "Soběslav",
  "Lomnice nad Lužnicí",
  "Trhové Sviny",
  "Sedlčany",
  "Hostinné",
  "Hostěradice",
  "Jemnice",
  /* ---- MÍSTA: Sasko, Bavory s Falcí a Franky, Rakousy (2026-10-28) ---- */
  "Wurzen",
  "Schleiz",
  /* ---- MÍSTA: Polsko a severní Uhry (2026-10-28) ---- */
  "Debrecín",
  "Satmár",
  "Pápa",
  "Kielce",
  "Łowicz",
  "Żnin",
  "Płońsk",
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
          /* se signálem je příčinou skoro jistě nové nasazení (starý díl s otiskem už na serveru není): zjistit verzi hned,
             aby se ukázala lišta Obnovit, ne až za deset minut (2026-10-29) */
          if (navigator.onLine !== false && typeof window.mmKontrolaKodu === "function")
            try {
              window.mmKontrolaKodu();
            } catch (e) {}
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
  mapa: ["mista", "mapa"],
  praha: ["praha"],
  svet: ["praha", "svet"],
  vyprava: ["hra", "mista", "mapa", "praha", "svet", "editor", "vyprava"],
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
