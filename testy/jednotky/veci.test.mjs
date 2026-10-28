// Vlastní předměty z Dílny vypravěče (10v-veci.js, čisté): očištění popisu def, zbraň, zbroj, štít, účinky, perky, souhrn.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();
const P = `{vl: Object.keys(ZBRVL), ma: Object.keys(ZBRMS), pk: ["Odvetná", "Šikovná", "Ostrá", "Půlmeč", "Drtivá", "Omračující"], ef: ["ac", "zach", "zach:WIS", "sput"]}`;
const N = d => V(`vecDefNorm(${JSON.stringify(d)}, ${P})`);

test("def zbraně: kostka, typ, vlastnosti SRD, mistrovství a perky jen známé; bonus 0–3", () => {
  const d = N({
    d: "zbr",
    z: "longsword",
    zn: "Longsword",
    k: "1D8",
    t: "Slashing",
    vl: ["versatile (1d10)", "Finesse", "Kouzelná"],
    ma: "Sap",
    s: "M",
    pk: ["Odvetná", "Odvetná", "Neznámý"],
    zr: [
      {k: "1d6", t: "Fire"},
      {k: "x", t: "Fire"},
    ],
    b: 5,
    ef: [
      {c: "zach", v: 1},
      {c: "hack", v: 3},
      {c: "vl:STR", v: 19},
    ],
    pr: true,
    vz: "vzácný",
  });
  assert.deepEqual(d, {
    d: "zbr",
    z: "longsword",
    zn: "Longsword",
    k: "1d8",
    t: "Slashing",
    vl: ["Versatile (1d10)", "Finesse"],
    ma: "Sap",
    s: "M",
    pk: ["Odvetná"],
    zr: [{k: "1d6", t: "Fire"}],
    b: 3,
    ef: [
      {c: "zach", v: 1},
      {c: "vl:STR", v: 19},
    ],
    pr: 1,
    vz: "vzácný",
  });
  assert.deepEqual(V(`vecZbrRow(${JSON.stringify(d)})`), [null, "Longsword", "1d8", "Slashing", "Versatile (1d10), Finesse", "M", null]);
  assert.equal(N({d: "zbr", k: "abc", t: "Xyz"}).k, "1d4", "neplatná kostka");
  assert.equal(N({d: "zbr", t: "Xyz"}).t, "Bludgeoning", "neplatný typ");
  assert.equal(N(null), null);
});

test("def zbroje a štítu: AC s bonusem, omezení DEX, druh podle Artikulí", () => {
  const z = N({d: "zbroj", zn: "Half Plate Armor", ac: 15, max: 2, dr: "Plátová", pl: 1, str: 0, b: 1, pk: ["Odvetná"]});
  assert.deepEqual(z, {d: "zbroj", zn: "Half Plate Armor", ac: 15, max: 2, dr: "Plátová", pl: 1, b: 1});
  assert.deepEqual(V(`vecZbroj(${JSON.stringify(z)})`), {k: "z", ac: 16, max: 2, dr: "Plátová", m: 1, pl: 1});
  const t = N({d: "zbroj", ac: 18, dr: "Komplexní"});
  assert.equal(V(`vecZbroj(${JSON.stringify(t)})`).max, null, "těžká zbroj bez DEX");
  assert.deepEqual(V(`vecZbroj(${JSON.stringify(N({d: "stit", b: 2}))})`), {k: "s", ac: 4, m: 2});
  assert.equal(V(`vecZbroj(${JSON.stringify(N({d: "vec"}))})`), null);
  assert.equal(N({d: "vec", b: 2}).b, undefined, "divotvorná věc nemá magický bonus útoku ani AC");
});

test("účinky: nastavená vlastnost má set, ostatní bonusy se sčítají", () => {
  assert.deepEqual(V(`vecEf({ef: [{c: "ac", v: 1}, {c: "vl:CON", v: 19}]})`), [
    {c: "ac", v: 1},
    {c: "vl:CON", v: 19, set: 1},
  ]);
});

test("perky: víc než jeden pasivní nebo aktivní upozorní, kromě mečů", () => {
  const akt = `["Odvetná", "Omračující"]`;
  assert.match(V(`vecPerkyVaruj({d: "zbr", zn: "Mace", pk: ["Drtivá", "Ostrá", "Omračující"]}, ${akt})`), /2 pasivní, 1 aktivní/);
  assert.equal(V(`vecPerkyVaruj({d: "zbr", zn: "Mace", pk: ["Drtivá", "Omračující"]}, ${akt})`), "");
  assert.equal(V(`vecPerkyVaruj({d: "zbr", zn: "Longsword", pk: ["Odvetná", "Šikovná", "Ostrá", "Půlmeč"]}, ${akt})`), "");
});

test("souhrn pro popis věci", () => {
  const d = N({
    d: "zbr",
    zn: "Longsword",
    k: "1d8",
    t: "Slashing",
    vl: ["Versatile (1d10)"],
    ma: "Sap",
    pk: ["Odvetná"],
    zr: [{k: "1d6", t: "Fire"}],
    b: 1,
  });
  assert.equal(
    V(`vecSouhrn(${JSON.stringify(d)}, {ma: {Sap: "Oslabení"}})`),
    "1d8+1 Slashing + 1d6 Fire · útok +1 · Versatile (1d10) · mistrovství Oslabení · perky Odvetná",
  );
  assert.equal(V(`vecSouhrn(${JSON.stringify(N({d: "zbroj", ac: 13, max: 9, dr: "Vycpávaná"}))})`), "AC 13 + DEX · Vycpávaná");
});
