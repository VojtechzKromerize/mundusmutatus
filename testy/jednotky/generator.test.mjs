// Rychlé testy generátoru obsahu (zdroj/generator.js): tajemství vypravěče a zmínky podle odhalení.
import {test} from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const G = createRequire(import.meta.url)("../../zdroj/generator.js");

test("tajemství: ⟦tajné⟧ zmizí, ⟦tajné¦pro hráče⟧ ukáže hráčům náhradu", () => {
  const [t, pryc] = G.stripSecrets("Rod ⟦spolčen s drakem⟧ drží hrad ⟦Bezděz¦na severu⟧.");
  assert.equal(t, "Rod  drží hrad na severu.");
  assert.deepEqual(pryc, ["spolčen s drakem", "Bezděz"]);
  assert.ok(!/[⟦⟧]/.test(t));
});

test("tajemství: vypravěč vidí skutečný text", () => {
  assert.equal(G.showSecrets("hrad ⟦Bezděz¦na severu⟧, ⟦drak⟧"), "hrad Bezděz, drak");
});

test("zmínky: odkaz jen na to, co družina zná", () => {
  const st = {jiri: 2, zdenek: 1, var: 0};
  assert.equal(G.zminky("[[jiri|Jiří]]", st), "[[jiri|Jiří]]");
  assert.equal(G.zminky("[[var|Vartenberk]]", st), "Vartenberk", "neznámé: jen text bez odkazu");
  assert.equal(G.zminky("[[var|Vartenberk|jistý pán]]", st), "jistý pán", "neznámé s náhradou");
  assert.equal(G.zminky("[[?zdenek|Zdeněk]]", st), "Zdeněk", "? – text, když slyšeli");
  assert.equal(G.zminky("[[?var|Vartenberk|někdo]]", st), "někdo");
  assert.equal(G.zminky("[[!zdenek|Zdeněk ze Šternberka|pán z Konopiště]]", st), "pán z Konopiště", "! – jen když potkali");
  assert.equal(G.zminky("[[!jiri|král Jiří|král]]", st), "král Jiří");
});
