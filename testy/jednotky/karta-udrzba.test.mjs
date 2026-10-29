// Opravy karty z údržby 2026-10-29: Mage Armor jako základ AC, stavy u hodu proti smrti a dovedností, střelivo mimo pouzdra,
// léčení padlé postavy mimo boj, zdroje se jménem z D&D Beyond.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
  S.ev("window.mmHlas = () => {}");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const karta = (id, o) =>
  JSON.stringify(
    Object.assign({id, n: "Zkouška", druh: "Human", vl: {STR: 10, DEX: 14, CON: 14, INT: 16, WIS: 12, CHA: 10}, rysy: [], vybaveni: []}, o),
  );

test("Mage Armor je základ AC bez zbroje (13 + DEX) – štít se k němu přičte", () => {
  S.ev(`KST.t_ma = {uc: [{n: "Mage Armor"}]}`);
  assert.equal(V(`kACR(${karta("t_ma", {povolani: "Wizard 5", uroven: 5, vybaveni: [{n: "Shield"}]})}).ac`), 13 + 2 + 2);
  assert.equal(V(`kACR(${karta("t_ma", {povolani: "Wizard 5", uroven: 5})}).ac`), 13 + 2);
  assert.equal(V(`kACR(${karta("t_ma", {povolani: "Wizard 5", uroven: 5, vybaveni: [{n: "Chain Shirt"}]})}).ac`), 13 + 2, "se zbrojí neplatí");
  S.ev(`delete KST.t_ma`);
});

test("stavy: otrávený má nevýhodu na ověření, ne na hod proti smrti; Rage dává výhodu na Atletiku", () => {
  S.ev(`KST.t_st = {stavy: ["otráven"]}`);
  const K = karta("t_st", {povolani: "Fighter 3", uroven: 3});
  assert.deepEqual(V(`kStavVliv(${K}, "Hod proti smrti").r`), []);
  assert.deepEqual(V(`kStavVliv(${K}, "Athletics").r`), [[-1, "otráven"]]);
  S.ev(`KST.t_st = {pri: ["Rage"]}`);
  assert.ok(V(`kStavVliv(${karta("t_st", {povolani: "Barbarian 3", uroven: 3})}, "Athletics").r`).some(x => x[1] === "Rage"));
  S.ev(`delete KST.t_st`);
});

test("střelivo: pouzdro na šipky ani prázdná položka se neberou, když jinde zbývá", () => {
  const K = karta("t_mu", {
    povolani: "Fighter 3",
    uroven: 3,
    vybaveni: [
      {n: "Case, Crossbow Bolt", q: 1},
      {n: "Crossbow Bolts", q: 0},
      {n: "Crossbow Bolts", q: 12},
    ],
  });
  assert.equal(V(`kMunice(${K}, {n: "Light Crossbow", vl: ["Ammunition"]}).i`), 2);
});

test("léčení mimo boj: padlá postava se probere od nuly, mrtvá ne", () => {
  const K = karta("t_le", {povolani: "Fighter 3", uroven: 3});
  assert.deepEqual(V(`kLecMimo(${K}, {hp: 0, ds: {u: 1, n: 2}}, 5).ch`), {hp: 5, ds: null});
  assert.equal(V(`kLecMimo(${K}, {hp: 0, ds: {u: 0, n: 3, st: "mrtev"}}, 5).ch`), null);
});

test("zdroje: jméno s příponou z D&D Beyond se počítá podle pravidel (Lucky = bonus zdatnosti)", () => {
  const z = V(`kZdroje(${karta("t_zd", {povolani: "Fighter 5", uroven: 5, zdroje: [{n: "Lucky: 2 / Long Rest", max: 2}]})})`);
  assert.equal(z.find(q => /Lucky/.test(q.n)).max, 3);
});
