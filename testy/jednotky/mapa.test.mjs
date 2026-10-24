// Mapa Zemí Koruny české (2026-10-24): města doby na mapě, význam míst (velikost značky a od kdy se ukáže jméno).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("mapa: doplněná města doby jsou mezi místy mapy", () => {
  const n = new Set(V(`PLACES.map(p => p.name)`));
  for (const m of [
    "Kouřim",
    "Stříbro",
    "Tachov",
    "Trutnov",
    "Prachatice",
    "Litovel",
    "Prostějov",
    "Košice",
    "Štýrský Hradec",
    "Augšpurk",
    "Wittenberg",
    "Čenstochová",
  ])
    assert.ok(n.has(m), m);
});

test("mapa: význam místa – metropole a hlavní města mají jméno vždy, města od přiblížení Koruny, hrady až zblízka", () => {
  assert.deepEqual(V(`["Praha", "Plzeň", "Kouřim", "Pernštejn"].map((n, i) => mistoTier(n, i < 3))`), [0, 1, 2, 3]);
  assert.deepEqual(V(`[mistoPopisek(1, 1), mistoPopisek(2, 1), mistoPopisek(2, 0.8), mistoPopisek(3, 0.8), mistoPopisek(3, 0.5)]`), [
    true,
    false,
    true,
    false,
    true,
  ]);
});
