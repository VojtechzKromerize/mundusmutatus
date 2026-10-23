// Účinky v jednom formátu (10u-ucinky.js): sčítání podle D&D 2024 a příspěvky do hodnot karty – v čistém Node, bez stránky.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();
const jm = s => V(s).map(b => b.n + (b.l ? ` ${b.l}` : ""));

test("různé účinky se sčítají: Bless a Emboldening Bond (Doména míru) obě přidají 1d4", () => {
  assert.deepEqual(V(`ucKostky(["Bless", "Emboldening Bond"], "ut").map(q => q.n + " " + q.x)`), ["Emboldening Bond 1d4", "Bless 1d4"].sort());
  assert.deepEqual(V(`ucKostky(new Set(["Bless", "Guidance", "Emboldening Bond"]), "ov").map(q => q.n)`), ["Guidance", "Emboldening Bond"]);
  assert.deepEqual(V(`ucKostky(["Bane"], "za")`), [{n: "Bane", x: "1d4", neg: true, jednou: ""}]);
});

test("stejnojmenné se nesčítají: dva Bless = jednou 1d4, Haste dvakrát = +2 AC jednou, Aid jen nejvyšší stupeň", () => {
  assert.deepEqual(jm(`ucSecti([{n: "Bless", od: "A"}, {n: "Bless", od: "B"}])`), ["Bless"]);
  assert.deepEqual(V(`ucAC(ucSecti([{n: "Haste", od: "A"}, {n: "Haste", od: "B"}]), true, 2)`), {ac: 2, min: 0, L: [["Haste", 2]]});
  assert.deepEqual(jm(`ucSecti([{n: "Aid (2. st.)"}, {n: "Aid (4. st.)"}, {n: "Aid (3. st.)"}])`), ["Aid 4"]);
  assert.deepEqual(V(`ucHodn(ucSecti([{n: "Aid (2. st.)"}, {n: "Aid (4. st.)"}]), "hp")`), [["Aid", 15]]);
  /* různá jména se sčítají i v AC: Haste + Warding Bond */
  assert.deepEqual(V(`ucAC(ucSecti([{n: "Haste"}, {n: "Warding Bond"}]), true, 0).ac`), 3);
});

test("neznámý účinek se ignoruje, výjimka scit sčítá i stejnojmenné", () => {
  assert.deepEqual(jm(`ucSecti([{n: "Něco vymyšleného"}, {n: "Bless"}])`), ["Bless"]);
  assert.equal(
    V(
      `(() => { UCINKY["Zkušební"] = {ac: 1, scit: 1}; const r = ucAC(ucSecti([{n: "Zkušební"}, {n: "Zkušební"}]), true, 0).ac; delete UCINKY["Zkušební"]; return r; })()`,
    ),
    2,
  );
});

test("AC: Mage Armor jen bez zbroje (13 + AGI), Barkskin nejméně 17", () => {
  assert.equal(V(`ucAC(ucSecti([{n: "Mage Armor"}]), false, 3).min`), 16);
  assert.equal(V(`ucAC(ucSecti([{n: "Mage Armor"}]), true, 3).min`), 0);
  assert.equal(V(`ucAC(ucSecti([{n: "Mage Armor"}, {n: "Barkskin"}]), false, 3).min`), 17);
});

test("rychlost, záchrany, dovednosti, Resistance a výhoda", () => {
  assert.deepEqual(V(`ucHodn(ucSecti([{n: "Haste"}, {n: "Longstrider"}]), "rych", null, 30)`), [
    ["Longstrider", 10],
    ["Haste ×2", 40],
  ]);
  assert.deepEqual(V(`ucHodn(ucSecti([{n: "Warding Bond"}]), "zach")`), [["Warding Bond", 1]]);
  assert.deepEqual(V(`ucHodn(ucSecti([{n: "Pass without Trace"}]), "dov", "Stealth")`), [["Pass without Trace", 10]]);
  assert.deepEqual(V(`ucHodn(ucSecti([{n: "Pass without Trace"}]), "dov", "Athletics")`), []);
  assert.equal(V(`ucRes(ucSecti([{n: "Warding Bond"}])).length`), 13);
  assert.deepEqual(V(`ucRes(ucSecti([{n: "Stoneskin"}, {n: "Gaseous Form"}]))`), ["Bludgeoning", "Piercing", "Slashing"]);
  assert.deepEqual(V(`ucAdv(ucSecti([{n: "Haste"}, {n: "Holy Aura"}, {n: "Bless"}]), "AGI")`), ["Haste", "Holy Aura"]);
});

test("kostky jednou za tah: Emboldening Bond jen k prvnímu hodu v tahu, Bardic až po hodu", () => {
  assert.deepEqual(V(`ucKostky(["Bless", "Emboldening Bond"], "ut", ["Emboldening Bond"]).map(q => q.n)`), ["Bless"]);
  assert.deepEqual(V(`ucKostky(["Bless", "Emboldening Bond"], "ut", true).map(q => q.n)`), ["Bless"]);
  assert.deepEqual(V(`ucKostky(["Bardic d8", "Bless"], "ut").map(q => q.n)`), ["Bless"]);
  assert.deepEqual(V(`ucKostky(["Gift of Alacrity", "Bless"], "in").map(q => q.n + " " + q.x)`), ["Gift of Alacrity 1d8"]);
  assert.deepEqual(V(`["Útok – Dagger", "Záchrana WIS", "Iniciativa", "Stealth"].map(ucTyp)`), ["ut", "za", "in", "ov"]);
});

test("řádky KPRID pro přepínače zůstaly stejné jako dřív", () => {
  assert.deepEqual(V(`KPRID.map(r => r[0])`), [
    "Bless",
    "Bane",
    "Guidance",
    "Emboldening Bond",
    "Gift of Alacrity",
    "Bardic d6",
    "Bardic d8",
    "Bardic d10",
    "Bardic d12",
  ]);
  assert.deepEqual(V(`KPRID.find(r => r[0] === "Emboldening Bond").slice(4)`), [0, 1, 0]);
  assert.deepEqual(V(`KPRID.find(r => r[0] === "Gift of Alacrity").slice(4)`), [0, 0, 1]);
  assert.deepEqual(V(`KPRID.find(r => r[0] === "Bardic d6").slice(1, 5)`), [
    "1d6",
    "ut za ov",
    "kostka Bardic Inspiration – přičte se k dalšímu hodu d20 a spotřebuje",
    1,
  ]);
});
