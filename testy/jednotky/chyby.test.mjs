// Hlášení chyb webu (2026-10-29): chyba skriptu, nezachycený slib a console.error s chybou jdou do mm_chyba; šum a opakování ne.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("chyby: hlásí se jednou, bez síťového šumu, nejvýš 12 za návštěvu, i z console.error", () => {
  const r = JSON.parse(
    S.ev(`JSON.stringify((() => {
      const L = [], m0 = window.MMDB;
      window.MMDB = Object.assign({}, m0 || {}, {chyba: o => (L.push(o), Promise.resolve())});
      MMCHYBY.n = 0; MMCHYBY.b.clear();
      try {
        mmChyba("x is not defined", "11-boj.js:5:1");
        mmChyba("x is not defined", "11-boj.js:5:1");
        mmChyba("Failed to fetch", "");
        console.error(new Error("rozbité vykreslení"));
        for (let i = 0; i < 20; i++) mmChyba("chyba " + i, "");
        return L.map(o => o.zprava);
      } finally { window.MMDB = m0; }
    })())`),
  );
  assert.equal(r[0], "x is not defined");
  assert.equal(r.filter(z => z === "x is not defined").length, 1, "stejná chyba jen jednou");
  assert.ok(!r.includes("Failed to fetch"), "výpadek sítě není chyba kódu");
  assert.ok(r.includes("rozbité vykreslení"), "console.error s chybou se hlásí");
  assert.equal(r.length, 12, "nejvýš 12 za návštěvu");
});
