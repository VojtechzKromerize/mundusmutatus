/* @čisté – Účet tahu (2026-10-23): akce, bonusová akce, pohyb a „jednou za tah“ na jednom místě =====
   ČISTÝ SOUBOR (viz 10u): jen počítání nad objektem účtu, který drží volající – telefon hráče (BPT v 16 = jeho tah, KTAHJ v 17
   = kostky jednou za tah podle karty, BJU.ridT v 20c = přídavky po zásahu). Reakce se nepočítá tady: je sdílená ve stavu boje
   (s.reak) a obnoví se na začátku vlastního tahu (bojTahHook) – volnost reakce řeší okno reakce v 10r.

   Účet: {k: klíč tahu „kolo:tah“, p: pohyb, a: akce, b: bonusová akce (0 / 1), jt: [jména „jednou za tah“ už použitá],
   sl: v tomto tahu už utracen slot kouzla (D&D 2024: jen jeden za tah)}
   Od 2026-10-25 (Vojta) i: m = stop už ušlých, d = počet Sprintů (Dash: pohyb navíc ve výši rychlosti), as = Action Surge
   v tomto tahu (druhá akce a2), ah = omezená akce navíc z Haste (Útok jedním útokem, Sprint, Odpoutání, Skrytí, Použití předmětu).
   Klíč je tah, který právě běží (kohokoli): D&D 2024 „jednou za tah“ = jednou v každém tahu, i v tahu nepřítele (Sneak Attack
   při příležitostném útoku). Nový klíč = nový tah → účet se vynuluje sám (tahObnov). ===== */

/* klíč tahu, který právě běží (stejný tvar jako dřív v BPT: „kolo:tah“) */
const tahKlic = s => `${s && s.kolo}:${s && s.tah}`;
/* druhy akcí: A akce, BA (i B) bonusová akce, P pohyb, A2 druhá akce (Action Surge), AH akce z Haste; přijímá i jména polí */
const TAHDRUH = {A: "a", BA: "b", B: "b", P: "p", A2: "a2", AH: "ah", a: "a", b: "b", p: "p", a2: "a2", ah: "ah"};
/* účet pro tah k: když patří jinému tahu (nebo je prázdný), vynuluje se; objekt zůstává tentýž (volající ho drží) */
function tahObnov(u, k) {
  if (u.k !== k) {
    u.k = k;
    u.p = 0;
    u.a = 0;
    u.b = 0;
    u.jt = [];
    u.m = 0;
    u.d = 0;
    u.as = 0;
    u.a2 = 0;
    u.ah = 0;
    u.sl = 0;
  }
  if (!Array.isArray(u.jt)) u.jt = [];
  return u;
}
/* použít akci daného druhu; vrací false, když už byla použitá (nebo druh neexistuje) – volající může upozornit.
   Akce (A) po Action Surge přejde na druhou akci, když je první použitá. */
function tahOznac(u, druh) {
  let f = TAHDRUH[druh];
  if (f === "a" && u.a && u.as) f = "a2";
  if (!f || u[f]) return false;
  u[f] = 1;
  return true;
}
/* nastavit / přepnout ručně (zaškrtávátko na kartě nebo v průvodci tahem) */
function tahNastav(u, druh, on) {
  const f = TAHDRUH[druh];
  if (f) u[f] = on ? 1 : 0;
  return u;
}
/* přepínač jedné akce (po Action Surge má druhá akce vlastní přepínač A2) */
const tahPrepni = (u, druh) => tahNastav(u, druh, !u[TAHDRUH[druh]]);
/* „použito?“ – akce je vyčerpaná, až když je použitá i druhá akce z Action Surge */
const tahMa = (u, druh) => {
  const f = TAHDRUH[druh];
  if (f === "a") return !!u.a && (!u.as || !!u.a2);
  return !!(f && u[f]);
};
/* „jednou za tah“: je jméno (skupina přídavku, kostka) v tomto tahu ještě volné? zápis použití */
const tahJednouVolne = (u, n) => !(u.jt || []).includes(n);
function tahJednouZapis(u, L) {
  for (const n of [].concat(L || [])) if (n && tahJednouVolne(u, n)) u.jt.push(n);
  return u;
}
/* ---- jedno kouzlo se slotem za tah (D&D 2024, Vojta 2026-10-31) ----
   „Na jeden tah smíš utratit jen jeden slot kouzla“ – i kdyby druhé kouzlo bylo za bonusovou akci nebo reakci v tomtéž tahu. */
const tahSlotPouzit = u => !!u.sl;
function tahSlotZapis(u) {
  u.sl = 1;
  return u;
}
/* ---- účet tahu ve stavu boje (2026-10-31): telefon hráče ho posílá do boje (mm_boj_hrac, pole „tah“), vypravěč ho vidí ---- */
const TAHPOLE = ["p", "a", "b", "m", "d", "as", "a2", "ah", "sl"];
function tahDB(u) {
  const o = {k: String(u.k || "")};
  for (const f of TAHPOLE) if (+u[f]) o[f] = Math.max(0, Math.min(999, Math.round(+u[f])));
  return o;
}
/* souhrn pro vypravěče: [[zkratka, popis, použito]] + pohyb „ušlo/max“; jen pro běžící tah (jinak null) */
function tahSouhrn(u, k, rych) {
  if (!u || u.k !== k) return null;
  const P = tahPohyb(u, rych),
    L = [
      ["A", "Akce", tahMa(u, "A")],
      ["BA", "Bonusová akce", !!u.b],
    ];
  if (u.as) L.push(["A2", "Druhá akce (Action Surge)", !!u.a2]);
  if (u.ah) L.push(["AH", "Akce z Haste", true]);
  if (u.sl) L.push(["S", "Kouzlo se slotem (jen jedno za tah)", true]);
  return {L, pohyb: P.r ? `${P.m}/${P.max}` : u.p ? "pohyb ✓" : "", d: +u.d || 0};
}
/* ---- pohyb a Sprint (2026-10-25) ---- */
/* pohyb v tahu při rychlosti rych: celkem = rychlost × (1 + Sprintů), ušlo, zbývá */
function tahPohyb(u, rych) {
  const r = Math.max(0, +rych || 0),
    max = r * (1 + (+u.d || 0)),
    m = Math.max(0, +u.m || 0);
  /* ručně označený pohyb (P) = už nic nezbývá */
  return {r, max, m: u.p ? max : Math.min(m, max), zbyva: u.p ? 0 : Math.max(0, max - m)};
}
/* pohnout se o ft stop (záporné = vrátit); víc, než zbývá, se neujde; pohyb je „použitý“, když nic nezbývá */
function tahPohni(u, ft, rych) {
  const P = tahPohyb(u, rych);
  u.p = 0;
  u.m = Math.max(0, Math.min(P.max, P.m + (+ft || 0)));
  u.p = P.max > 0 && u.m >= P.max ? 1 : 0;
  return tahPohyb(u, rych);
}
/* Sprint (Dash) za akci (A, po Action Surge i druhou), bonusovou akci (Cunning Action) nebo akci z Haste (AH);
   s rychlostí se ručně označený pohyb započte jako celý ušlý */
function tahSprint(u, druh, rych) {
  if (!tahOznac(u, druh)) return false;
  if (u.p && rych != null) u.m = tahPohyb(u, rych).max;
  u.d = (+u.d || 0) + 1;
  u.p = 0;
  return true;
}
/* Action Surge: v tomto tahu jedna akce navíc (jednou za tah) */
function tahSurge(u) {
  if (u.as) return false;
  u.as = 1;
  return true;
}
