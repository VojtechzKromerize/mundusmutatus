// Automatika podle karet družiny (2026-10-27, Vojta): přehled v Hra › Družina – co z kouzel, rysů a předmětů postav web nepočítá sám.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof kAutoKarta === "function" || mmLina("hra")`);
  await S.ev(`Promise.all([kSpNacti(), mimoNacti(), predNacti(), vybNacti()])`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("kouzla: se zraněním, stavem ze záchrany či účinkem automatika zná, utility ne", () => {
  assert.deepEqual(V(`["Fire Bolt", "Cure Wounds", "Hold Person", "Bless", "Alarm", "Neexistující kouzlo"].map(n => kAutoKouzlo(n).s)`), [
    "auto",
    "auto",
    "auto",
    "auto",
    "nic",
    "nezná",
  ]);
});

test("rysy: na které se automatika ptá, počítá; neznámé hlásí; rysy bez účinku na hody vynechá", () => {
  S.ev(
    `KARTY.push({id: "t_aut", n: "Zkoušený", povolani: "Fighter 5", uroven: 5, vl: {STR: 16, DEX: 12, CON: 14}, rysy: ["Second Wind", "Sentinel", "Languages", "Podivný rys z PDF"], vybaveni: [{n: "Longsword"}, {n: "Rope, Hempen (50 feet)"}, {n: "Tajemná truhlička"}], kouzla: {seznam: [{n: "Alarm", st: 1}]}}); KARTBY.t_aut = KARTY[KARTY.length - 1]`,
  );
  try {
    S.ev(`kMaRys(KARTBY.t_aut, /^sentinel$/i)`);
    const A = V(`kAutoKarta(KARTBY.t_aut)`);
    const rysy = A.rysy.map(r => r.n);
    assert.ok(rysy.includes("Podivný rys z PDF"), JSON.stringify(A.rysy));
    assert.ok(!rysy.includes("Sentinel"), "na Sentinel se automatika ptá");
    assert.ok(!rysy.includes("Languages"), "jazyky se nevypisují");
    assert.deepEqual(
      A.kouzla.map(k => k.n),
      ["Alarm"],
    );
    assert.deepEqual(
      A.predmety.map(p => p.n),
      ["Tajemná truhlička"],
      "zbraň a běžná výbava z katalogu se nevypisují",
    );
    S.ev(`KAUTOOTV = true`);
    assert.match(V(`kAutoHtml()`), /Zkoušený[\s\S]*Podivný rys z PDF/);
  } finally {
    S.ev(`KAUTOOTV = false; KARTY.pop(); delete KARTBY.t_aut; KAUTOR.delete("t_aut")`);
  }
});
