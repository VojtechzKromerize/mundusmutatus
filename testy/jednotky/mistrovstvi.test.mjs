// Vlastnosti a mistrovství zbraní (Weapon Traits a Weapon Masteries, 2026-10-24): čistá pravidla (10w) v Node bez stránky
// a napojení na boj (20g) ve stránce – volby před hodem, co útok nese vypravěči, vyhodnocení u vypravěče a konec účinků podle tahu útočníka.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();

test("čisté: vlastnosti a mistrovství z tabulky SRD i ze seznamu z PDF", () => {
  assert.deepEqual(C.V(`zbrRozbor([], "Finesse, Light, Thrown (dostřel 20/60)", "Nick")`), {
    vl: {Finesse: true, Light: true, Thrown: "20/60", Range: "20/60"},
    ma: "Nick",
  });
  assert.deepEqual(C.V(`zbrRozbor(["Martial", "Versatile", "Sap", "Booming Blade: 1d8 Thunder"], "", null)`), {vl: {Versatile: true}, ma: "Sap"});
  assert.deepEqual(C.V(`zbrRozbor(["Versatile"], "Versatile (1d10)", "Sap").vl`), {Versatile: "1d10"}, "kostka obouruč zůstane z tabulky SRD");
  assert.equal(C.V(`zbrRozbor([], "Ammunition (dostřel 80/320; šíp), Heavy, Two-Handed", "Slow").vl.Range`), "80/320");
});

test("čisté: postava používá mistrovství podle rysů z D&D Beyond", () => {
  const R = ["Vex (Rapier)", "Longsword (Sap)", "Nick (Dagger)"];
  assert.equal(C.ev(`zbrMaMa("Vex", ${JSON.stringify(R)}, "Rapier")`), true);
  assert.equal(C.ev(`zbrMaMa("Sap", ${JSON.stringify(R)}, "Longsword")`), true, "i obráceně: druh zbraně (mistrovství)");
  assert.equal(C.ev(`zbrMaMa("Vex", ${JSON.stringify(R)}, "Shortsword")`), false, "Vex jen s rapírem");
  assert.equal(C.ev(`zbrMaMa("Sap", ${JSON.stringify(R)}, null)`), true, "neznámý druh (magická zbraň s vlastním jménem): stačí rys s mistrovstvím");
  assert.equal(C.ev(`zbrMaMa("Cleave", ${JSON.stringify(R)}, "Greataxe")`), false);
});

test("čisté: modifikátor útoku, zranění bez modifikátoru, obouruč, Heavy", () => {
  assert.equal(C.ev(`zbrMod(8, 3, "Nevermore")`), 5);
  assert.equal(C.ev(`zbrMod(9, 3, "Longsword +1")`), 5, "magický bonus z názvu se odečte");
  assert.equal(C.ev(`zbrBezMod("1d6+4", 3)`), "1d6+1", "magický bonus zůstane");
  assert.equal(C.ev(`zbrBezMod("1d4+2", 2)`), "1d4");
  assert.equal(C.ev(`zbrBezMod("1d4-1", -1)`), "1d4-1", "záporný modifikátor se odečítá dál");
  assert.equal(C.ev(`zbrObour("1d8+3", "1d10")`), "1d10+3");
  assert.equal(C.ev(`zbrVersKost("1d8+5")`), "1d10", "Versatile bez kostky z PDF: o stupeň výš");
  assert.equal(C.ev(`zbrTezkaNev({Heavy: true}, false, 12, 18)`), true, "zblízka STR pod 13");
  assert.equal(C.ev(`zbrTezkaNev({Heavy: true}, true, 8, 13)`), false, "na dálku rozhoduje DEX");
  assert.equal(C.ev(`zbrTezkaNev({Light: true}, false, 8, 8)`), false);
});

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const BAL = "KARTBY.balduin";

test("boj: Balduinovy zbraně – mistrovství jen to, které používá", () => {
  assert.equal(V(`bojWTr(${BAL}, {n: "Nevermore", b: 8, z: "1d8+5"}).ma`), "Sap", "Nevermore: Sap z PDF a rys Sap (Longsword)");
  assert.equal(V(`bojWTr(${BAL}, {n: "Rapier", b: 6, z: "1d8+3"}).ma`), "Vex");
  const sek = V(`bojWTr(${BAL}, {n: "Greataxe", b: 5, z: "1d12+2"})`);
  assert.equal(sek.ma0, "Cleave");
  assert.equal(sek.ma, null, "Cleave Balduin nemá");
  assert.equal(V(`bojWTr(${BAL}, {n: "Eldritch Blast", b: 7})`), null, "kouzlo není zbraň");
  assert.deepEqual(V(`bojWmPayload(${BAL}, {n: "Nevermore", b: 8, z: "1d8+5"}, {})`), {n: "Sap"}, "Sap se pošle sám");
});

test("boj: útok navíc z Light s Nick, obouruč a Topple po zásahu", () => {
  const DYKA = `{n: "Dagger", b: 5, z: "1d4+2"}`;
  assert.deepEqual(V(`bojWmNavic(${BAL}, ${DYKA}, {nl: true})`), {g: "nl", n: "Nick", ba: 0}, "Nick: v rámci akce Útok, bez bonusové akce");
  assert.equal(V(`bojWUprav(${BAL}, ${DYKA}, {nl: true}).z`), "1d4", "útok navíc bez kladného modifikátoru");
  assert.equal(V(`bojWmNavic(${BAL}, {n: "Handaxe", b: 5, z: "1d6+2"}, {nl: true}).ba`), 1, "Light bez Nick stojí bonusovou akci");
  assert.equal(V(`bojWUprav(${BAL}, {n: "Longsword", b: 5, z: "1d8+2"}, {ob: true}).z`), "1d10+2");
  assert.equal(V(`bojWUprav(${BAL}, {n: "Nevermore", b: 8, z: "1d8+5"}, {ob: true}).z`), "1d10+5", "Nevermore (Versatile z PDF) obouruč");
  /* Topple: kdo ho má, dostane po zásahu nabídku se SO 8 + modifikátor + zdatnost */
  S.ev(`window.__rys = ${BAL}.rysy2; ${BAL}.rysy2 = [...${BAL}.rysy2, {n: "Topple (Battleaxe)"}]`);
  try {
    const R = V(`bojWmRidery(${BAL}, null, {n: "Battleaxe", b: 5, z: "1d8+2"}, {})`);
    assert.equal(R[0].cim, "Topple (CON SO 13)");
    assert.equal(V(`bojWmPayload(${BAL}, {n: "Battleaxe", b: 5, z: "1d8+2"}, {rid: []})`), null, "nezvolené Topple se nepošle");
    assert.deepEqual(V(`bojWmPayload(${BAL}, {n: "Battleaxe", b: 5, z: "1d8+2"}, {rid: [{g: "wm"}]})`), {n: "Topple", dc: 13});
  } finally {
    S.ev(`${BAL}.rysy2 = window.__rys`);
  }
});

test("vypravěč: Topple srazí, Graze zraní i při minutí, Vex dá výhodu a spotřebuje se, Sap skončí s tahem útočníka", () => {
  const B0 = S.ev(`JSON.stringify(BOJ.s || null)`);
  S.ev(`BOJ.s = {aktivni: true, kolo: 1, tah: 1, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: [{id: "n1", n: "Žoldnéř"}], utoky: []}`);
  const u = o =>
    JSON.stringify(Object.assign({id: "t" + Math.random(), h: "h1", ci: ["n1"], cim: "Zbraň", hod: 15, d: 12, dmg: 5, t: "Slashing"}, o));
  const proved = o =>
    S.ev(`(() => { const u = ${u(o)}, V = bojUtokVyhodnot0(BOJ.s, u); bojWmProved(BOJ.s, u, V); return JSON.stringify(V.r[0]); })()`);
  try {
    S.kostky([[3, 20]]);
    const t = JSON.parse(proved({wm: {n: "Topple", dc: 13}}));
    assert.equal(t.wme[0].k, "srz", "CON záchrana 3 proti SO 13 neuspěla");
    assert.ok(V(`BOJ.s.npc[0].stav`).includes("sražen"));
    const g = JSON.parse(proved({d: 1, wm: {n: "Graze", x: 3}}));
    assert.equal(g.hit, false);
    assert.equal(g.x, 3, "Graze: zranění 3 i při minutí");
    assert.equal(g.vys, "vedle, škrábnutí 3");
    proved({wm: {n: "Vex"}});
    assert.ok(V(`bojAdvHrac(BOJ.s, BOJ.s.hraci[0], BOJ.s.npc[0], false).why`).includes("Vex (příští útok)"));
    proved({});
    assert.ok(!V(`(BOJ.s.npc[0].ef || []).some(e => e.n === "Vex")`), "další útok téže postavy Vex spotřebuje");
    proved({wm: {n: "Sap"}});
    assert.ok(V(`BOJ.s.npc[0].stav`).includes("oslaben"));
    S.ev(`bojWmTahVlastnika(BOJ.s, "h1", "kon"); BOJ.s.kolo = 2; bojWmTahVlastnika(BOJ.s, "h1", "zac")`);
    assert.ok(!V(`BOJ.s.npc[0].stav`).includes("oslaben"), "Sap končí na začátku příštího tahu útočníka");
    proved({wm: {n: "Slow"}, dmg: 0});
    assert.ok(!V(`BOJ.s.npc[0].stav || []`).includes("zpomalen"), "Slow bez zranění se neuplatní");
  } finally {
    S.ev(`BOJ.s = ${B0}`);
  }
});
