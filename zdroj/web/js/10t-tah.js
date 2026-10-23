/* @čisté – Účet tahu (2026-10-23): akce, bonusová akce, pohyb a „jednou za tah“ na jednom místě =====
   ČISTÝ SOUBOR (viz 10u): jen počítání nad objektem účtu, který drží volající – telefon hráče (BPT v 16 = jeho tah, KTAHJ v 17
   = kostky jednou za tah podle karty, BJU.ridT v 20c = přídavky po zásahu). Reakce se nepočítá tady: je sdílená ve stavu boje
   (s.reak) a obnoví se na začátku vlastního tahu (bojTahHook) – volnost reakce řeší okno reakce v 10r.

   Účet: {k: klíč tahu „kolo:tah“, p: pohyb, a: akce, b: bonusová akce (0 / 1), jt: [jména „jednou za tah“ už použitá]}
   Klíč je tah, který právě běží (kohokoli): D&D 2024 „jednou za tah“ = jednou v každém tahu, i v tahu nepřítele (Sneak Attack
   při příležitostném útoku). Nový klíč = nový tah → účet se vynuluje sám (tahObnov). ===== */

/* klíč tahu, který právě běží (stejný tvar jako dřív v BPT: „kolo:tah“) */
const tahKlic = s => `${s && s.kolo}:${s && s.tah}`;
/* druhy akcí: A akce, BA (i B) bonusová akce, P pohyb; přijímá i jména polí a / b / p */
const TAHDRUH = {A: "a", BA: "b", B: "b", P: "p", a: "a", b: "b", p: "p"};
/* účet pro tah k: když patří jinému tahu (nebo je prázdný), vynuluje se; objekt zůstává tentýž (volající ho drží) */
function tahObnov(u, k) {
  if (u.k !== k) {
    u.k = k;
    u.p = 0;
    u.a = 0;
    u.b = 0;
    u.jt = [];
  }
  if (!Array.isArray(u.jt)) u.jt = [];
  return u;
}
/* použít akci daného druhu; vrací false, když už byla použitá (nebo druh neexistuje) – volající může upozornit */
function tahOznac(u, druh) {
  const f = TAHDRUH[druh];
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
const tahPrepni = (u, druh) => tahNastav(u, druh, !tahMa(u, druh));
const tahMa = (u, druh) => !!(TAHDRUH[druh] && u[TAHDRUH[druh]]);
/* „jednou za tah“: je jméno (skupina přídavku, kostka) v tomto tahu ještě volné? zápis použití */
const tahJednouVolne = (u, n) => !(u.jt || []).includes(n);
function tahJednouZapis(u, L) {
  for (const n of [].concat(L || [])) if (n && tahJednouVolne(u, n)) u.jt.push(n);
  return u;
}
