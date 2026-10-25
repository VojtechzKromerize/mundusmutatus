// Zdroje a rysy z PDF D&D Beyond bez zdvojení (2026-10-25, Vojta): Battle Master má na listu tytéž kostky převahy pod třemi
// jmény (Superiority Dice, „Superiority Dice: 5 / Short Rest“, rys Combat Superiority), Mage Slayer zdroj Guarded Mind
// a manévry ve variantách (Str.) a (Dex.). Na kartě má být každá věc jednou.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), mimoNacti()])");
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

/* výřez listu bojovníka 8. úrovně (Battle Master) z D&D Beyond – jména rysů a zdrojů tak, jak je PDF dává */
const K = {
  id: "t_mistr",
  n: "Zkušební mistr boje",
  povolani: "Fighter 8",
  uroven: 8,
  druh: "Dwarf",
  vl: {STR: 20, AGI: 8, CON: 16, INT: 12, WIS: 13, CHA: 8},
  rysy: ["Combat Superiority", "Student of War", "Second Wind", "Action Surge", "Mage Slayer", "Stonecunning", "Know Your Enemy"],
  rysy2: [
    {n: "Battle Master", s: "FIGHTER FEATURES", sub: 1},
    {n: "Combat Superiority", s: "FIGHTER FEATURES"},
    {n: "Superiority Dice: 5 / Short Rest • 1 Action", s: "FIGHTER FEATURES", sub: 1},
    {n: "Second Wind", s: "FIGHTER FEATURES", cas: "BA", max: 3, obn: "dlouhý odpočinek"},
    {n: "Action Surge", s: "FIGHTER FEATURES", cas: "", max: 1, obn: "krátký odpočinek"},
    {n: "Goading Attack", s: "FIGHTER FEATURES", sub: 1},
    {n: "Maneuver: Goading Attack (Str.)", s: "FIGHTER FEATURES", cas: "A", sub: 1},
    {n: "Maneuver: Goading Attack (Dex.)", s: "FIGHTER FEATURES", cas: "A", sub: 1},
    {n: "Pushing Attack", s: "FIGHTER FEATURES", sub: 1},
    {n: "Maneuver: Pushing Attack (Dex.)", s: "FIGHTER FEATURES", cas: "A", sub: 1},
    {n: "Maneuver: Pushing Attack (Str.)", s: "FIGHTER FEATURES", cas: "A", sub: 1},
    {n: "Maneuver: Evasive Footwork", s: "FIGHTER FEATURES", cas: "BA", sub: 1},
    {n: "Know Your Enemy", s: "FIGHTER FEATURES", cas: "BA", max: 1, obn: "dlouhý odpočinek"},
    {n: "Mage Slayer", s: "FEATS"},
    {n: "Guarded Mind: 1 / Short Rest • Special", s: "FEATS", sub: 1},
    {n: "Stonecunning (Tremorsense): 3 / Long Rest • 1 Bonus Action", s: "FIGHTER FEATURES", sub: 1},
    {n: "Superiority Dice", s: "FEATS", max: 5, obn: "krátký odpočinek"},
  ],
  zdroje: [
    {n: "Know Your Enemy", max: 1, obn: "dlouhý odpočinek"},
    {n: "Superiority Dice", max: 5, obn: "krátký odpočinek"},
    {n: "Superiority Dice: 5 / Short Rest", max: 5, obn: "krátký odpočinek"},
    {n: "Second Wind", max: 3, obn: "dlouhý odpočinek"},
    {n: "Action Surge", max: 1, obn: "krátký odpočinek"},
    {n: "Guarded Mind: 1 / Short Rest", max: 1, obn: "krátký odpočinek"},
    {n: "Stonecunning (Tremorsense): 3 / Long Rest", max: 3, obn: "dlouhý odpočinek"},
  ],
  utoky: [{n: "War Pick", b: 8, z: "1d8+5", t: "Piercing"}],
  vybaveni: [],
};
const sKartou = (stav, f) => {
  S.ev(`KARTBY.t_mistr = ${JSON.stringify(K)}; KST.t_mistr = ${JSON.stringify(stav || {})}`);
  try {
    return f();
  } finally {
    S.ev(`delete KARTBY.t_mistr; delete KST.t_mistr`);
  }
};
const zdroje = stav => sKartou(stav, () => V(`kOmezena(KARTBY.t_mistr).map(q => [q.n, q.max, q.obn])`));
const jm = L => L.map(q => S.ev(`kZdrJm(${JSON.stringify(q[0])})`));

test("Omezené: kostky převahy jen jednou, podle pravidel (5 kostek d8 na 8. úrovni, krátký nebo dlouhý odpočinek)", () => {
  const Z = zdroje();
  const sd = Z.filter(q => /superiority/i.test(q[0]));
  assert.equal(sd.length, 1, "jeden řádek: " + JSON.stringify(Z.map(q => q[0])));
  assert.equal(sd[0][0], "Superiority Dice");
  assert.equal(sd[0][1], 5);
  assert.match(sd[0][2], /krátký nebo dlouhý odpočinek · kostka d8/);
});

test("Omezené: Mage Slayer a Guarded Mind jen jednou, jména bez přípony z D&D Beyond", () => {
  const Z = zdroje(),
    J = jm(Z);
  assert.equal(J.filter(n => /guarded mind|mage slayer/i.test(n)).length, 1, JSON.stringify(J));
  assert.ok(J.includes("Guarded Mind"));
  assert.ok(J.includes("Stonecunning (Tremorsense)"));
  assert.equal(new Set(J).size, J.length, "žádné jméno dvakrát: " + JSON.stringify(J));
});

test("Omezené: zůstane zdroj, na kterém je zapsané použití (vyčerpané kostky se neztratí)", () => {
  assert.equal(zdroje({zdr: {"Superiority Dice": 3}}).filter(q => /superiority/i.test(q[0]))[0][0], "Superiority Dice");
  assert.equal(
    zdroje({zdr: {"Superiority Dice: 5 / Short Rest": 2}}).filter(q => /superiority/i.test(q[0]))[0][0],
    "Superiority Dice: 5 / Short Rest",
  );
});

test("Rysy a Akce: manévr ve variantách (Str.) a (Dex.) je jeden řádek (STR/DEX)", () => {
  const R = sKartou({}, () => V(`kRysyAktivni(KARTBY.t_mistr).map(r => r.jm || r.n)`));
  assert.deepEqual(
    R.filter(n => /Goading|Pushing/.test(n)),
    ["Maneuver: Goading Attack (STR/DEX)", "Maneuver: Pushing Attack (STR/DEX)"],
  );
  assert.ok(R.includes("Maneuver: Evasive Footwork"), "ostatní manévry beze změny");
  const R2 = sKartou({}, () =>
    V(`(() => { const d = document.createElement("div"); d.innerHTML = bdmRysy(KARTBY.t_mistr);
      return [[...d.querySelectorAll(".bdmakl li")].map(l => l.textContent), [...d.querySelectorAll(".bdmrysy *")].filter(e => !e.children.length).map(e => e.textContent)]; })()`),
  );
  assert.equal(R2[0].filter(x => /Goading Attack/.test(x)).length, 1, "v Rysech s aktivací jednou");
  assert.deepEqual(
    R2[1].filter(x => /Goading|Pushing/.test(x)),
    ["Goading Attack", "Maneuver: Goading Attack (STR/DEX)", "Pushing Attack", "Maneuver: Pushing Attack (STR/DEX)"],
    "v Ostatních rysech varianty jednou",
  );
  const A = sKartou({}, () =>
    V(
      `(() => { const d = document.createElement("div"); d.innerHTML = kAkceG(KARTBY.t_mistr, true, {bezKouzel: true}).A.join(""); return [...d.querySelectorAll("li")].map(l => l.textContent); })()`,
    ),
  );
  assert.equal(A.filter(x => /Pushing Attack/.test(x)).length, 1, "v Akcích jednou");
});
