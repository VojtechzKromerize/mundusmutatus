/* ===== Automatika podle karet družiny (2026-10-27, Vojta): u nahraných postav vypíše kouzla, rysy a featy a předměty, které web
   nepočítá sám (vypravěč je hlídá ručně) – podklad pro cílené doplňování automatiky. Hra › Družina (vypravěč), sbalené: počítá se
   až po rozbalení. Rysy: „počítá“ = automatika se na rys ptá (KAUTOR z kMaRys/c.maRys), má zdroj s počtem použití (kZdroje),
   řádek v UCINKY, nebo shrnutí mimo SRD s bonusem či počtem; „jen shrnutí“ = mimo SRD bez mechaniky; ostatní „bez automatiky“.
   Rysy bez herního účinku v boji (jazyky, zdatnosti, zvýšení vlastností…) se nevypisují. ===== */
const KAUTO_EFK = new Set([
  "Magic Weapon",
  "Elemental Weapon",
  "True Strike",
  "Shillelagh",
  "Green-Flame Blade",
  "Booming Blade",
  "Hex",
  "Hunter's Mark",
  "Divine Favor",
  "Counterspell",
  "Shield",
  "Sanctuary",
]);
/* rysy z PDF, které nejsou pravidlem pro boj ani hody (záhlaví listu, zdatnosti, popis) */
const KAUTO_NIC =
  /^(ability score (improvement|increases?)|hit points|proficienc|languages?|equipment|core .* traits|spellcasting|pact magic|subclass|darkvision|creature type|size|speed|skills?|tool proficiency|feat|origin feat|epic boon|weapon mastery|primal knowledge|magic initiate|=+)|(subclass|spell list|spells|invocations|fighting style)$/i;
/* rysy, které automatika zná jinak než dotazem na jméno rysu (import PDF: War Caster → výhoda na soustředění) */
const KAUTO_ZNA = /^(war caster)$/i;
/* jedno kouzlo: co s ním automatika umí (zranění/léčení z textu, stav ze záchrany, řádek v tabulkách účinků), nebo null */
function kAutoKouzlo(n) {
  const d0 = kSp(n);
  if (!d0) return {s: "nezná", t: "kouzlo není v seznamu kouzel"};
  const d = kSpA(d0.en) || d0,
    l = Math.max(1, d.l || 0);
  let U = null,
    st = null;
  try {
    U = kSpUcD(
      d,
      l,
      () => 3,
      () => 5,
    );
  } catch (e) {}
  try {
    st = bojSpStav(d.en);
  } catch (e) {}
  if (U && U.k) return {s: "auto", t: U.k === "l" ? "léčení" : "zranění"};
  if (st) return {s: "auto", t: "stav ze záchrany"};
  if (
    UCINKY[d.en] ||
    KZOPAK[d.en] ||
    KZOBL[d.en] ||
    KZLEC[d.en] ||
    KZSUM[d.en] ||
    KBUF[d.en] ||
    KPRID.some(r => r[0] === d.en) ||
    KAUTO_EFK.has(d.en)
  )
    return {s: "auto", t: "účinek"};
  return {s: "nic", t: ""};
}
const kAutoN = n =>
  String(n || "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .trim();
/* kód webu bez komentářů, malými písmeny: rys, jehož jméno v kódu je, automatika zná (ptá se na něj kdekoli – při útoku,
   odpočinku, importu PDF), i když to průchod výpočty karty nezachytí */
let KAUTOSRC = null;
function kAutoZdroj() {
  /* jen těla funkcí skriptu (deklarace na nejvyšší úrovni jsou vlastnosti window) – ne data karet a obsahu, která skript nese */
  if (KAUTOSRC == null)
    KAUTOSRC = Object.getOwnPropertyNames(window)
      .map(k => {
        try {
          const f = window[k];
          return typeof f === "function" && !/\[native code\]/.test(Function.prototype.toString.call(f)) ? Function.prototype.toString.call(f) : "";
        } catch (e) {
          return "";
        }
      })
      .join("\n")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .toLowerCase()
      .replace(/[’]/g, "'");
  return KAUTOSRC;
}
/* zná kód jméno rysu? (bez upřesnění v závorce a předpony „Pact of the Blade: …“; celé slovo) */
function kAutoVKodu(n) {
  const src = kAutoZdroj();
  if (!src) return false;
  /* „Rapier (Vex)“: jméno i upřesnění v závorce (mistrovství zbraně) */
  const vnitr = (String(n).match(/\(([^)]+)\)\s*$/) || [])[1];
  return [mimoN(n), vnitr && mimoN(vnitr)].some(j => {
    if (!j || j.length < 3) return false;
    const re = new RegExp(`(^|[^a-z])${j.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]?")}($|[^a-z])`);
    return re.test(src);
  });
}
/* rysy a featy postavy: [{n, s: auto|shrnuti|nic, t}] (bez rysů bez herního účinku) */
function kAutoRysy(K) {
  const c = kCtx(K);
  /* projít výpočty karty, ať automatika řekne, na které rysy se ptá (KAUTOR) */
  try {
    kZdroje(K);
    kACR(K);
    kHPmax(K);
    kIni(K);
    BAB.forEach(a => kHodn(K, "zach", a));
    if (typeof kEfekty === "function") kEfekty(K);
    kUtZInv(K);
    if (typeof kUtoky === "function") kUtoky(K);
  } catch (e) {}
  const R = KAUTOR.get(K.id) || new Set(),
    zdr = new Set(kZdroje(K).map(q => mimoN(kZdrJm(q.n)))),
    ef = new Set(((typeof kEfekty === "function" && kEfekty(K)) || []).map(e => kAutoN(e.n))),
    vse = [...new Set([...(K.rysy || []), ...(K.rysy2 || []).map(r => r && r.n)].filter(Boolean))];
  return vse
    .filter(n => !KAUTO_NIC.test(String(n).trim()))
    .map(n => {
      const k = kAutoN(n),
        m = MIMO ? mimoNajdi(c, n) : null,
        r = m && m.r;
      if (R.has(k) || zdr.has(mimoN(n)) || ef.has(k) || UCINKY[n] || MIMOSKIP.test(mimoN(n)) || KAUTO_ZNA.test(String(n).trim()) || kAutoVKodu(n))
        return {n, s: "auto", t: zdr.has(mimoN(n)) ? "počet použití" : ""};
      if (r && (r.ef || r.pocet != null || r.kostka || r.kouzla)) return {n, s: "auto", t: "shrnutí s počtem či bonusem"};
      if (m) return {n, s: "shrnuti", t: "jen shrnutí"};
      return {n, s: "nic", t: ""};
    });
}
/* předměty, které automatika nezná: magické bez účinku a neznámé (běžná výbava z katalogu se nevypisuje) */
function kAutoPredmety(K) {
  const S = kartaStav(K.id),
    inv = S.inv || K.vybaveni || [];
  const out = [];
  inv.forEach(x => {
    const nm = String(x.n || "").trim();
    if (!nm || x.def || kZbrInfo(x) || kZbranInfo(nm) || KPREDX.some(([re]) => re.test(nm)) || (K.utoky || []).some(u => u.n === nm)) return;
    const p = kPred(x);
    if (p) {
      if (!p.ef && !/potion|elixir|oil of|scroll|ammunition|lektvar/i.test(nm)) out.push({n: nm, s: "shrnuti", t: "magický předmět – jen popis"});
      return;
    }
    /* svitky kouzel sešle karta (Použít předmět › seslat) */
    if (/^(spell )?scroll of /i.test(nm)) return;
    if (typeof vybNajdi === "function" && (vybNajdi(x) || vybNajdi(nm.replace(/\s*\(.*\)\s*$/, "").split(",")[0]))) return;
    out.push({n: nm, s: "nic", t: "neznámý předmět"});
  });
  return out;
}
function kAutoKarta(K) {
  const kz = [];
  kSeznam(K).forEach(x => {
    const a = kAutoKouzlo(x.n);
    if (a.s !== "auto") kz.push({n: x.n, s: a.s, t: a.t});
  });
  return {kouzla: kz, rysy: kAutoRysy(K).filter(r => r.s !== "auto"), predmety: kAutoPredmety(K)};
}
let KAUTOOTV = false;
function kAutoHtml() {
  if (!GMV) return "";
  const L = (KARTY || []).filter(k => !k.test);
  if (!L.length) return "";
  let obsah = "";
  if (KAUTOOTV) {
    if (!KSPD || !MIMO || !PRED || (typeof VYB !== "undefined" && !VYB)) {
      Promise.all([kSpNacti(), mimoNacti(), predNacti(), typeof vybNacti === "function" ? vybNacti() : null])
        .then(() => {
          if (curView === "boj") renderBoj();
        })
        .catch(() => {});
      obsah = `<p class="rsmall">Načítám kouzla, předměty a shrnutí mimo SRD…</p>`;
    } else {
      const chip = r => `<li${r.s === "nic" ? ' class="kautnic"' : ""}>${besc(r.n)}${r.t ? ` <small>${besc(r.t)}</small>` : ""}</li>`,
        blok = (h, a) => (a.length ? `<p class="lbl">${h} (${a.length})</p><ul class="kautl">${a.map(chip).join("")}</ul>` : "");
      obsah = L.map(K => {
        const A = kAutoKarta(K),
          n = A.kouzla.length + A.rysy.length + A.predmety.length;
        return `<details class="kautk"><summary><b>${besc(K.n)}</b> <small>${n ? `${n} ručně` : "vše počítá web"}</small></summary>${blok("Kouzla bez automatiky", A.kouzla)}${blok("Rysy a featy", A.rysy)}${blok("Předměty", A.predmety)}</details>`;
      }).join("");
      obsah += `<p class="rsmall">„Bez automatiky“: web nic nepočítá, vypravěč účinek hlídá a zapisuje ručně. „Jen shrnutí“: na kartě je popis, bez počtů a bonusů. Rysy bez účinku na hody (jazyky, zdatnosti) se nevypisují.</p>`;
    }
  }
  return `<section><details class="kauto" data-kauto${KAUTOOTV ? " open" : ""}><summary><h3 class="uvh2" style="display:inline">Automatika podle karet</h3> <small>co z kouzel, rysů a předmětů družiny web nepočítá sám</small></summary>${obsah}</details></section>`;
}
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-kauto]") || d.open === KAUTOOTV) return;
    KAUTOOTV = d.open;
    if (KAUTOOTV && curView === "boj") renderBoj();
  },
  true,
);
