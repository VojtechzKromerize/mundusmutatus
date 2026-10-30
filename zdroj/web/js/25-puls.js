/* ===== Puls: jeden dotaz „co se změnilo“ místo samostatných dotazů (2026-10-19) ===== */
/* Dřív se každá část ptala sama (karty, hody, výzvy, zprávy, ukázky, návrhy, pokladna, boj, verze desek) – nečinný telefon
   poslal ~60 dotazů za minutu. Teď se ptá jen tabulky puls (mm_puls: druh → poslední číslo) a načte jen to, co se změnilo.
   S Realtime (Supabase) přijde nový řádek pulsu sám a dotaz běží jen jako záloha jednou za minutu.
   Starší databáze bez mm_puls: načítá se vše jako dřív (PULS.stary). */
window.MMPULS = true; // koruna.html: puls běží, starý dotaz na verzi desek není potřeba
var PULS = {z: null, beh: false, znovu: false, t: 0, tm: 0, obnov: false, start: false, stary: false};
const PULS_HRA = ["vyzvy", "zpravy", "navrhy", "potvrz", "pokladna"];
function pulsInterval() {
  if (typeof BRT !== "undefined" && BRT.ok) return 60000;
  if (curView === "boj") return bojBezi(BOJ.s) ? 2500 : BOJ.s && BOJ.s.scena ? 4000 : 6000;
  if (curView === "karty" || curView === "hra") return 5000;
  return 10000;
}
/* volá se i z dřívějších souborů při prvním vykreslení – než tento soubor proběhne, jen se odloží */
function pulsStart() {
  if (typeof PULS === "undefined" || !PULS) {
    setTimeout(pulsStart, 0);
    return;
  }
  if (PULS.start || !window.MMDB || !MMDB.puls) return;
  PULS.start = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pulsKrok();
  });
  addEventListener("hashchange", () =>
    setTimeout(() => {
      if (PULS.obnov) pulsObnov();
      pulsPlan();
    }, 300),
  );
  pulsKrok(true);
}
function pulsPlan() {
  clearTimeout(PULS.tm);
  if (document.visibilityState !== "visible") return;
  PULS.tm = setTimeout(() => pulsKrok(), Math.max(400, pulsInterval() - (Date.now() - PULS.t)));
}
const pulsPise = () => {
  const ae = document.activeElement;
  return !!(ae && ae.matches && ae.matches("textarea,select,input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])"));
};
async function pulsKrok(prvni) {
  if (PULS.beh) {
    PULS.znovu = true;
    return;
  }
  if (!prvni && document.visibilityState !== "visible") return;
  PULS.beh = true;
  PULS.t = Date.now();
  try {
    try {
      bojRealtime();
    } catch (e) {}
    if (typeof BFR !== "undefined" && BFR.delka()) bojFrontaOdesli();
    let p = null;
    if (!PULS.stary) {
      try {
        p = await MMDB.puls();
      } catch (e) {
        if (e.status === 404 || /mm_puls/.test(e.message || "")) PULS.stary = true;
        else return;
      }
    }
    const z = PULS.z;
    if (p && typeof p === "object") PULS.z = p;
    if (prvni) {
      await pulsHra();
      return;
    } /* ostatní načetlo úvodní načtení; herní stav ještě jednou, kdyby se změnil mezi načtením a prvním pulsem */
    const co = new Set();
    if (PULS.stary) {
      ["vyzvy", "zpravy", "navrhy", "potvrz", "pokladna", "ukazky", "boj", "snimek"].forEach(k => co.add(k));
      if (curView === "karty" || curView === "boj") ["karty", "hody"].forEach(k => co.add(k));
    } else if (z && p)
      Object.keys(p).forEach(k => {
        if (p[k] !== z[k]) co.add(k);
      });
    if (co.size || PULS.obnov) await pulsZpracuj(co);
  } finally {
    PULS.beh = false;
    if (PULS.znovu) {
      PULS.znovu = false;
      setTimeout(() => pulsKrok(), 50);
    } else pulsPlan();
  }
}
async function pulsZpracuj(co) {
  let kh = false,
    b = false;
  if (co.has("karty")) {
    try {
      if (await kartyNacti()) kh = true;
    } catch (e) {}
    /* scéna: postava, kterou si hráč právě vzal (KHRAC), se přidá mezi přítomné (11) */
    if (GMV && BOJ.s && BOJ.s.scena && BOJ.s.aktivni && bojScenaChybi(BOJ.s).length) bojZmen(z => bojScenaClenove(z), true);
  }
  if (co.has("hody")) {
    try {
      if (await hodyNacti()) kh = true;
    } catch (e) {}
  }
  if (co.has("boj")) {
    try {
      if (await bojPoll()) {
        b = true;
        bojNav();
      }
    } catch (e) {}
  }
  if (PULS_HRA.some(k => co.has(k))) {
    try {
      await hraPoll(false, co);
    } catch (e) {
      console.error(e);
    }
  }
  if (co.has("ukazky")) {
    try {
      await ukNacti();
    } catch (e) {}
  }
  if (co.has("hra")) {
    await pulsHra();
    if (GMV) obchZakDoruc();
  }
  if (co.has("povest")) povNacti(true);
  if (co.has("obchody")) {
    try {
      if (await obchNacti()) {
        if (curView === "boj") bojPrekresli();
        if (typeof kartyPrekresli === "function") kartyPrekresli();
      }
    } catch (e) {}
  }
  if (co.has("snimek") || PULS.obnov) pulsObnov();
  if (curView === "boj" && (kh || b)) bojPrekresli();
  else if (kh && !pulsPise()) kartyPrekresli();
  else if (b && curView === "hra") hraPrekresli();
}
/* herní stav (čas, místo, cesta, počasí): načte se sám, stránka se nepřenačte */
async function pulsHra() {
  if (!MMDB.hra) return;
  let h;
  try {
    h = await MMDB.hra();
  } catch (e) {
    return;
  }
  if (!h || typeof h !== "object" || JSON.stringify(h) === JSON.stringify(HRA)) return;
  HRA = h;
  __D.HRA = HRA;
  try {
    hraPo();
  } catch (e) {
    console.error(e);
  }
  if (mmNaHre())
    try {
      hraPrekresli();
    } catch (e) {}
  else if (curView === "kronika") kronikaPrekresli();
}
/* nové poznatky v deskách (odhalení, úprava textů) se bez přenačtení nedají doplnit – v boji a při psaní se přenačtení odloží */
function pulsObnov() {
  if (GMV || typeof window.mmKontrolaVerze !== "function") return;
  const boj = curView === "boj" && bojBezi(BOJ.s);
  if (boj || pulsPise()) {
    if (!PULS.obnov && boj) mmHlasG("Zemské desky byly doplněny – stránka se obnoví, až odejdeš z boje.", 6000);
    PULS.obnov = true;
    return;
  }
  PULS.obnov = false;
  window.mmKontrolaVerze();
}
/* lišta „Obnovit“ (koruna.html) se ptá, jestli je bezpečné obnovit samo: ne v boji, ne při psaní, ne s rozehraným útokem nebo frontou */
window.mmObnovaMozna = () =>
  !(curView === "boj" && bojBezi(BOJ.s)) &&
  !pulsPise() &&
  !(typeof BJU !== "undefined" && BJU.serie && BJU.serie.length) &&
  !(typeof BFR !== "undefined" && BFR.delka());
/* první puls hned po načtení skriptu, souběžně s úvodním načítáním dat (co se změní mezi tím, nezapadne) */
if (window.MMDB) pulsStart();
