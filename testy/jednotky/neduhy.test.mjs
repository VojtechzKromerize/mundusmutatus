// Nemoci, jedy a kletby s průběhem v herním čase (2026-10-31): čistý 10n-neduhy.js.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();

test("nový neduh: nemoc má příští záchranu za interval, jed i konec, kletba žádné záchrany", () => {
  const n = V(`nedNovy(NEDVZOR[0], 1000, "x")`);
  assert.equal(n.dalsi, 1024);
  assert.equal(n.cil, 3);
  const j = V(`nedNovy(NEDVZOR[4], 1000, "y", {dc: 14})`);
  assert.deepEqual([j.dc, j.dalsi, j.do, j.st], [14, 1001, 1008, "otráven"]);
  const k = V(`nedNovy(NEDVZOR[6], 1000, "z")`);
  assert.equal(k.dalsi, undefined);
  assert.match(V(`nedPopis(nedNovy(NEDVZOR[6], 1000, "z"))`), /Remove Curse/);
});

test("průběh: neúspěch +1 vyčerpání, úspěchy se sčítají do vyléčení; skok o víc dní hází za každý den", () => {
  const R = V(`(() => { const h = [5, 15, 15, 15]; let i = 0;
    return nedProbehni([nedNovy(NEDVZOR[0], 0, "a")], 24 * 4, () => 0, () => h[i++]); })()`);
  assert.equal(R.vyc, 1);
  assert.equal(R.N.length, 0, "tři úspěchy = vyléčeno");
  assert.equal(R.konec.length, 1);
  assert.equal(R.log.length, 4);
  const R2 = V(`nedProbehni([nedNovy(NEDVZOR[0], 0, "a")], 23, () => 0, () => 1)`);
  assert.equal(R2.log.length, 0, "před termínem nic");
});

test("jed: úspěch ho ukončí a stav otráven se odebere; jinak vyprchá po době trvání", () => {
  const R = V(`(() => { const h = [2, 18]; let i = 0; return nedProbehni([nedNovy(NEDVZOR[4], 0, "j")], 5, () => 0, () => h[i++]); })()`);
  assert.equal(R.N.length, 0);
  assert.deepEqual(R.minus, ["otráven"]);
  const R2 = V(`nedProbehni([nedNovy(NEDVZOR[4], 0, "j")], 9, () => 0, () => 1)`);
  assert.equal(R2.N.length, 0);
  assert.match(R2.log.at(-1), /vyprchal/);
  const R3 = V(`nedProbehni([nedNovy(NEDVZOR[4], 0, "j")], 3, () => 0, () => 1)`);
  assert.deepEqual(R3.plus, ["otráven"]);
});
