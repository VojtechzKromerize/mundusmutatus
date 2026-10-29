// Víc cílů u útoku nepřítele (2026-10-28, Vojta): v režimu „víc cílů“ proběhne útok na každý vybraný cíl; útok se záchranou
// (dech, výbuch) hodí zranění jednou a stejné platí pro všechny cíle.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("útok se záchranou na víc cílů: jedno zranění pro všechny, každý cíl má svůj řádek", () => {
  const r = V(`(() => {
    const b = Object.keys(PROTBY).find(k => PROTBY[k].u !== "houf" && (PROTBY[k].at || []).some(a => a.dc && a.z));
    if (!b) return null;
    const B0 = JSON.stringify(BOJ.s || null);
    BOJ.s = {aktivni: true, kolo: 1, tah: 1, hraci: [{id: "h1", n: "Balduin", k: "balduin"}, {id: "h2", n: "Cyril"}], npc: [{id: "n1", n: "Drak", b, druh: "sok"}]};
    try {
      const n = BOJ.s.npc[0], E = bojEff(n), ai = E.at.findIndex(a => a.dc && a.z);
      BCILL.n1 = ["h1", "h2"]; BCIL.n1 = "h1";
      BLOG.n1 = [];
      bojUtokKlik(n, ai);
      const L = BLOG.n1.slice(0, 2);
      return {cile: L.map(o => o.cil).sort(), zr: L.map(o => o.zr && o.zr.t), hl: BCIL.n1};
    } finally {
      delete BCILL.n1; delete BCIL.n1; BOJ.s = JSON.parse(B0);
    }
  })()`);
  assert.ok(r, "v bestiáři je útok se záchranou");
  assert.deepEqual(r.cile, ["Balduin", "Cyril"]);
  assert.equal(r.zr[0], r.zr[1], "zranění se hodilo jednou");
  assert.equal(r.hl, "h1", "hlavní cíl zůstane");
});
