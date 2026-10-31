/* @čisté – Nemoci, jedy a kletby s průběhem v herním čase (2026-10-31, Vojta: „dlouhá kouzla, jedy a nemoci v herním čase“) =====
   Na kartě v poli ned: [{id, n, typ: nemoc|jed|kletba, ab, dc, int (hodin mezi záchranami), cil (úspěchů k vyléčení), uc (vycerp =
   neúspěch přidá stupeň vyčerpání, stav = po dobu trvání stav st), st, ok, nok, dalsi (herní hodina příští záchrany), do (herní hodina
   konce u jedu), pz}]. Když vypravěč posune herní čas, kCasMotor (15) hodí za každou propadlou záchranu (nedProbehni) – úspěchy se
   sčítají do vyléčení, neúspěch nemoci přidá vyčerpání, jed skončí úspěchem nebo vyprchá. Kletba nemá záchrany: trvá, dokud ji vypravěč
   nezruší (Remove Curse). Vzory jsou vlastní herní pomůcka, ne text pravidel.
   ČISTÝ SOUBOR: herní čas, bonus záchrany a kostku dostává argumentem. ===== */
const NEDTYP = {nemoc: "Nemoc", jed: "Jed", kletba: "Kletba"};
const NEDVZOR = [
  {n: "Bahenní zimnice", typ: "nemoc", ab: "CON", dc: 11, int: 24, cil: 3, uc: "vycerp", pz: "horečka a třesavka po noci v bažinách"},
  {n: "Krvavá úplavice", typ: "nemoc", ab: "CON", dc: 13, int: 24, cil: 2, uc: "vycerp", pz: "ze zkažené vody a ležení vojska"},
  {n: "Hnilobná rána", typ: "nemoc", ab: "CON", dc: 12, int: 12, cil: 2, uc: "vycerp", pz: "neošetřená rána zahnívá"},
  {n: "Morová nákaza", typ: "nemoc", ab: "CON", dc: 15, int: 24, cil: 3, uc: "vycerp", pz: "hlízy a horečka; nakažlivá"},
  {n: "Slabý jed", typ: "jed", ab: "CON", dc: 11, int: 1, cil: 1, uc: "stav", st: "otráven", trv: 8},
  {n: "Silný jed", typ: "jed", ab: "CON", dc: 15, int: 1, cil: 1, uc: "stav", st: "otráven", trv: 24},
  {n: "Kletba", typ: "kletba", int: 0, cil: 0, uc: "", pz: "trvá, dokud ji někdo nezruší (Remove Curse)"},
];
/* nový neduh ze vzoru (v) v herní hodině ted; dc a n jde přepsat */
function nedNovy(v, ted, id, prepis) {
  const o = Object.assign({}, v, prepis || {});
  const e = {
    id: id || "d" + Math.random().toString(36).slice(2, 8),
    n: String(o.n || "Neduh").slice(0, 80),
    typ: NEDTYP[o.typ] ? o.typ : "nemoc",
    ok: 0,
    nok: 0,
  };
  if (o.typ !== "kletba") {
    e.ab = o.ab || "CON";
    e.dc = Math.max(1, Math.min(30, Math.round(+o.dc || 10)));
    e.int = Math.max(0, Math.min(720, Math.round(+o.int || 0)));
    e.cil = Math.max(1, Math.min(9, Math.round(+o.cil || 1)));
    if (e.int && ted != null) e.dalsi = ted + e.int;
  }
  if (o.uc) e.uc = o.uc;
  if (o.st) e.st = o.st;
  if (o.trv && ted != null) e.do = ted + Math.round(+o.trv);
  if (o.pz) e.pz = String(o.pz).slice(0, 200);
  return e;
}
/* průběh do herní hodiny ted: zachB(ab) = bonus záchrany postavy, d20() = hod. Vrací nový seznam, zápisy do záznamu, kolik stupňů
   vyčerpání přibylo, co skončilo a které stavy přidat a odebrat. Nejvýš 60 záchran na neduh (dlouhý skok v čase). */
function nedProbehni(N, ted, zachB, d20) {
  const R = {N: [], log: [], vyc: 0, konec: [], plus: [], minus: []};
  for (const e0 of N || []) {
    const e = Object.assign({}, e0);
    let hotovo = false;
    for (let i = 0; i < 60 && !hotovo && e.int > 0 && e.dalsi != null && ted != null && e.dalsi <= ted; i++) {
      if (e.do != null && e.do <= e.dalsi) break;
      const d = d20(),
        tot = d + (+zachB(e.ab) || 0);
      if (tot >= e.dc) {
        e.ok = (+e.ok || 0) + 1;
        hotovo = e.ok >= e.cil;
        R.log.push(`${e.n}: záchrana ${e.ab} ${tot} (k20 ${d}) proti SO ${e.dc} – úspěch${hotovo ? " – překonáno" : ` (${e.ok}/${e.cil})`}`);
      } else {
        e.nok = (+e.nok || 0) + 1;
        if (e.uc === "vycerp") R.vyc++;
        R.log.push(`${e.n}: záchrana ${e.ab} ${tot} (k20 ${d}) proti SO ${e.dc} – neúspěch${e.uc === "vycerp" ? ", +1 vyčerpání" : ""}`);
      }
      e.dalsi += e.int;
    }
    if (!hotovo && e.do != null && ted != null && e.do <= ted) {
      hotovo = true;
      R.log.push(`${e.n}: vyprchal`);
    }
    if (hotovo) R.konec.push(e);
    else R.N.push(e);
  }
  const drzi = new Set(R.N.filter(e => e.st).map(e => e.st));
  R.plus = [...drzi];
  R.minus = [...new Set(R.konec.filter(e => e.st && !drzi.has(e.st)).map(e => e.st))];
  return R;
}
/* popis pro kartu: „záchrana CON SO 13 každých 24 h · 1/3 úspěchů“ */
function nedPopis(e) {
  if (e.typ === "kletba" || !e.int) return e.pz || "bez záchran – trvá, dokud ji někdo nezruší";
  return `záchrana ${e.ab} SO ${e.dc} každých ${e.int} h · úspěchy ${+e.ok || 0}/${e.cil}${e.uc === "vycerp" ? " · neúspěch = +1 vyčerpání" : ""}${e.st ? ` · ${e.st}` : ""}`;
}
