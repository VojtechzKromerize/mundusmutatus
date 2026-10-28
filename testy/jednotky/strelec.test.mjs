// Střelec (Gunslinger, doplněk mimo SRD, 2026-10-28): kostky Štěstěny, Critical Shot, Quick Draw, Overkill, kousky (Šrám, O vlásek,
// Svéhlavost, kousky za bonusovou akci), Hazard Karbaníka a Gut Shot u vypravěče. Pravidla v čistém 10x, napojení na kartu a boj.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();

test("čisté: kostky Štěstěny a kritický zásah podle úrovně", () => {
  assert.equal(C.V(`strRD(1)`), null);
  assert.deepEqual(C.V(`[2, 6, 8, 10, 14, 18].map(strRD)`), [
    {n: 4, k: "d8"},
    {n: 5, k: "d8"},
    {n: 5, k: "d8"},
    {n: 5, k: "d10"},
    {n: 6, k: "d10"},
    {n: 6, k: "d12"},
  ]);
  assert.deepEqual(C.V(`[1, 2, 8, 9, 16, 17, 20].map(strKrit)`), [20, 19, 19, 18, 18, 17, 17]);
});

test("čisté: Šrám nejméně 1, Zatnout zuby nesčítá dočasné životy, Svéhlavost jen INT/WIS/CHA, Hazard jen s utracenou kostkou", () => {
  assert.equal(C.ev(`strSram(1, -2)`), 1);
  assert.equal(C.ev(`strSram(5, 4)`), 9);
  assert.equal(C.ev(`strZuby(5, 8, 0)`), 13);
  assert.equal(C.ev(`strZuby(2, 8, 20)`), 20, "vyšší dosavadní dočasné životy zůstanou");
  assert.deepEqual(C.V(`["INT", "WIS", "CHA", "DEX", "STR", undefined].map(strSvehlavost)`), [true, true, true, false, false, false]);
  assert.equal(C.ev(`strHazard(8, true, false, 3, 5)`), true);
  assert.equal(C.ev(`strHazard(8, true, false, 5, 5)`), false, "nic k vrácení");
  assert.equal(C.ev(`strHazard(8, true, true, 3, 5)`), false, "jednou za tah");
  assert.equal(C.ev(`strHazard(5, true, false, 3, 5)`), false, "od 6. úrovně");
  assert.equal(C.ev(`strHazard(8, false, false, 3, 5)`), false, "jen Karbaník");
  assert.equal(C.ev(`strZdarma(10, true)`), true);
  assert.equal(C.ev(`strZdarma(9, true)`), false);
});

test("čisté: O vlásek – kostka k AC, útok mine, když hod < AC + kostka; kritický zásah zůstane", () => {
  const f = {rd: {k: "d8", zb: 3}},
    e = {hod: 17, ac: 15, d: 12, ph: 7, ai: "n1"};
  const o = C.V(`reakceOkno(${JSON.stringify(f)}, ${JSON.stringify(e)}, "zasah").o.find(r => r.k === "vlasek")`);
  assert.match(o.t, /1d8 k AC .*vrátí 7 HP/);
  assert.deepEqual(C.V(`reakceVysledek("vlasek", ${JSON.stringify(e)}, {}, {d: 3})`), {n: 7, proc: "O vlásek (+3 AC) – útok minul"});
  assert.equal(C.V(`reakceVysledek("vlasek", ${JSON.stringify(e)}, {}, {d: 2})`).n, 0, "17 proti 15+2 pořád zasáhne");
  assert.equal(C.V(`reakceVysledek("vlasek", ${JSON.stringify({...e, kr: 1})}, {}, {d: 8})`).n, 0);
  assert.equal(C.V(`reakceOkno({rd: {k: "d8", zb: 0}}, ${JSON.stringify(e)}, "zasah").o.some(r => r.k === "vlasek")`), false);
  assert.match(C.V(`reakceOkno({rd: {k: "d8", zb: 0, zdarma: true}}, ${JSON.stringify(e)}, "zasah").o.find(r => r.k === "vlasek").t`), /1d6/);
});

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), mimoNacti()])");
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

/* výřez listu Střelce 8. úrovně (Karbaník) tak, jak ho dává PDF D&D Beyond */
const karta = (u = 8) => ({
  id: "t_strelec",
  n: "Zkušební střelec",
  povolani: `Gunslinger ${u}`,
  uroven: u,
  druh: "Human",
  vl: {STR: 10, AGI: 18, CON: 14, INT: 10, WIS: 14, CHA: 10},
  rysy: ["Quick Draw", "Critical Shot", "Risk", "Maneuvers", "Risky Business", "Gut Shot", "Extra Attack", "Liar's Dice [Maneuver]"],
  rysy2: [
    {n: "Risk • TGC", s: "GUNSLINGER FEATURES"},
    {n: "Risk Dice: 5 / Short Rest • Special", s: "GUNSLINGER FEATURES", sub: 1},
    {n: "High Roller", s: "GUNSLINGER FEATURES", sub: 1},
    {n: "Maneuver: Liar's Dice", s: "GUNSLINGER FEATURES", cas: "BA", sub: 1},
  ],
  zdroje: [{n: "Risk Dice: 5 / Short Rest", max: 5, obn: "krátký odpočinek"}],
  utoky: [
    {n: "Handgun", b: 9, z: "2d4+4", t: "Piercing", dal: true, vl: ["Simple", "Ammunition", "Range (30/120)"]},
    {n: "Scimitar", b: 7, z: "1d6+4", t: "Slashing", vl: ["Martial", "Finesse", "Light"]},
  ],
  vybaveni: [],
});
const sKartou = (stav, f, u) => {
  S.ev(`KARTBY.t_strelec = ${JSON.stringify(karta(u))}; KST.t_strelec = ${JSON.stringify(stav || {})}`);
  try {
    return f();
  } finally {
    S.ev(`delete KARTBY.t_strelec; delete KST.t_strelec`);
  }
};
const K = `KARTBY.t_strelec`;

test("karta: kostky Štěstěny d8 z PDF a v Omezených s velikostí kostky", () =>
  sKartou({zdr: {"Risk Dice: 5 / Short Rest": 2}}, () => {
    const R = V(`kRD(${K})`);
    assert.equal(R.k, "d8");
    assert.equal(R.zb, 3);
    const Z = V(`kOmezena(${K}).filter(q => /risk/i.test(q.n)).map(q => [q.max, q.obn])`);
    assert.equal(Z.length, 1);
    assert.equal(Z[0][0], 5);
    assert.match(Z[0][1], /krátký odpočinek · kostka d8/);
  }));

test("karta: Critical Shot jen na dálku (19–20), Overkill až od 11. úrovně, Quick Draw dá výhodu na iniciativu", () => {
  sKartou({}, () => {
    assert.equal(V(`Math.min(20, ...kEfAkt(${K}, [], ${K}.utoky[0]).map(e => +e.krit || 20))`), 19);
    assert.equal(V(`Math.min(20, ...kEfAkt(${K}, [], ${K}.utoky[1]).map(e => +e.krit || 20))`), 20, "šavle zblízka ne");
    assert.ok(!V(`kEfAkt(${K}, [], ${K}.utoky[0]).some(e => e.n === "Overkill")`));
    assert.deepEqual(V(`kStavVliv(${K}, "Iniciativa").r`), [[1, "Quick Draw"]]);
    S.kostky([
      [19, 20],
      [2, 4],
      [3, 4],
    ]);
    const P = V(`(() => { const w = ${K}.utoky[0]; return bojUtokPriprav({K: ${K}, w, c: null, v: 0, ac: 25, E: kEfAkt(${K}, [], w)}); })()`);
    assert.equal(P.krit, true, "přirozená 19 na dálku je kritický zásah");
    assert.equal(P.zas, true);
  });
  sKartou(
    {},
    () => {
      assert.equal(V(`Math.min(20, ...kEfAkt(${K}, [], ${K}.utoky[0]).map(e => +e.krit || 20))`), 18);
      assert.equal(V(`kEfAkt(${K}, [], ${K}.utoky[0]).find(e => e.n === "Overkill").zr`), "1d8");
    },
    11,
  );
});

test("karta: Svéhlavost nabídne kostku Štěstěny k ověření a záchraně na INT, WIS a CHA", () =>
  sKartou({}, () => {
    const N = co => V(`kHodNabidka(${K}, ${JSON.stringify(co)}, []).sd`);
    assert.deepEqual(N("Záchrana WIS"), {n: "Svéhlavost (Maverick Spirit)", k: "d8", zb: 5, rd: 1});
    assert.ok(N("Insight") && N("Ověření Charisma") && N("Záchrana INT (SO 14)"));
    assert.equal(N("Záchrana DEX"), null);
    assert.equal(N("Athletics"), null);
    assert.equal(N("Útok"), null);
    assert.equal(V(`kHodNabidka(${K}, "Záchrana WIS", ["sd"]).sd`), null, "jednou na hod");
  }));

test("boj: kousky za bonusovou akci a Hazard v pruhu tahu; O vlásek v nabídce reakce", () =>
  sKartou({zdr: {"Risk Dice: 5 / Short Rest": 1}}, () => {
    const h = S.ev(`bdmStrTahHtml(${K}, {b: 0, jt: []})`);
    for (const k of ["zuby", "slepo", "kotoul", "lhar", "hazard"]) assert.match(h, new RegExp(`data-btstr="${k}"`), k);
    assert.match(h, /Štěstěna 4\/5/);
    const h2 = S.ev(`bdmStrTahHtml(${K}, {b: 1, jt: ["Hazard"]})`);
    assert.doesNotMatch(h2, /data-btstr/, "bonusová akce použitá, Hazard v tomto tahu už byl");
    const f = V(`kReakceFakta(${K}, {id: "h1", k: "t_strelec", n: "Zkušební střelec"}, {reak: {}}, {})`);
    assert.deepEqual(f.rd, {k: "d8", zb: 4, zdarma: false});
  }));

test("vypravěč: Šrám zraní i při minutí, Gut Shot připomene střelu v těle při kritickém zásahu na dálku", () =>
  sKartou({}, () => {
    const B0 = S.ev(`JSON.stringify(BOJ.s || null)`);
    S.ev(
      `BOJ.s = {aktivni: true, kolo: 1, tah: 1, hraci: [{id: "h1", n: "Zkušební střelec", k: "t_strelec"}], npc: [{id: "n1", n: "Žoldnéř"}], utoky: []}`,
    );
    const vyh = o =>
      JSON.parse(
        S.ev(
          `JSON.stringify(bojUtokVyhodnot0(BOJ.s, ${JSON.stringify(Object.assign({h: "h1", ci: ["n1"], cim: "Handgun", hod: 15, d: 12, dmg: 5, t: "Piercing"}, o))}).r[0])`,
        ),
      );
    try {
      const m = vyh({d: 1, sram: 6});
      assert.equal(m.hit, false);
      assert.equal(m.x, 6);
      assert.equal(m.vys, "vedle, šrám 6");
      assert.match(m.gm, /Šrám: 6/);
      assert.match(vyh({d: 20, dmg: 12}).gm, /Gut Shot: střela uvízla v těle/);
      assert.doesNotMatch(vyh({d: 12}).gm, /Gut Shot/, "jen při kritickém zásahu");
      assert.doesNotMatch(vyh({d: 20, cim: "Scimitar", t: "Slashing"}).gm, /Gut Shot/, "jen zbraní na dálku");
    } finally {
      S.ev(`BOJ.s = ${B0}`);
    }
  }));
