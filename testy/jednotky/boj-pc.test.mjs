// Zranění a léčení postavy s kartou v boji (bojZranPC, bojLecPC) – ve stránce v jsdom; dřív jen v prohlížeči (prohlizec_boj2.py).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
});
after(() => S && S.zavri());

test("karta v boji: Resistance Cold půlí, dočasné HP pohltí první, přesah maxima = okamžitá smrt, léčení na 0 jen stabilizuje", () => {
  const r = S.ev(`JSON.stringify((() => {
    const K = KARTBY.balduin, h = {id: "x"};
    bojZranPC(h, K, 20, "Cold", false);
    const h2 = {id: "y", thp: 5};
    bojZranPC(h2, K, 8, "Fire", false);
    const h3 = {id: "z", hp: 10};
    bojZranPC(h3, K, 80, "Fire", false);
    const h4 = {id: "w", hp: 3};
    bojZranPC(h4, K, 5, "Fire", false);
    const pad = h4.ds && h4.ds.st === undefined && h4.hp === 0;
    bojLecPC(h4, K, 4);
    return [h.hp, h2.hp, h2.thp || 0, h3.ds && h3.ds.st, pad, h4.ds && h4.ds.st];
  })())`);
  assert.deepEqual(JSON.parse(r), [52, 59, 0, "mrtev", true, "stab"]);
});

test("zásah postavy v bezvědomí: neúspěch hodu proti smrti, kritický zásah dva", () => {
  const r = S.ev(`JSON.stringify((() => {
    const K = KARTBY.balduin, a = {id: "a", hp: 0, ds: {u: 0, n: 0}}, b = {id: "b", hp: 0, ds: {u: 1, n: 0}};
    bojZranPC(a, K, 4, "Slashing", false);
    bojZranPC(b, K, 4, "Slashing", true);
    return [a.ds.n, b.ds.n];
  })())`);
  assert.deepEqual(JSON.parse(r), [1, 2]);
});

test("zásah postavy v bezvědomí alespoň za maximum HP: okamžitá smrt (SRD)", () => {
  const r = S.ev(`JSON.stringify((() => {
    const K = KARTBY.balduin, mx = kHPmax(K), a = {id: "a", hp: 0, ds: {u: 0, n: 0}}, b = {id: "b", hp: 0, ds: {u: 0, n: 0}};
    bojZranPC(a, K, mx, "Fire", false);
    bojZranPC(b, K, mx - 1, "Fire", false);
    return [a.ds.st, b.ds.st || "", b.ds.n];
  })())`);
  assert.deepEqual(JSON.parse(r), ["mrtev", "", 1]);
});

test("Zpět do snímku boje nesmaže útoky hráčů, které čekají na vyhodnocení", () => {
  const r = S.ev(`JSON.stringify((() => {
    const s = {kolo: 2, utoky: [{id: 1, stav: "hotovo"}, {id: 2, stav: "ceka"}, {id: 3, stav: "ceka"}]};
    bojObnovStav(s, {kolo: 1, utoky: [{id: 1, stav: "ceka"}]});
    return [s.kolo, s.utoky.map(u => u.id + u.stav)];
  })())`);
  assert.deepEqual(JSON.parse(r), [1, ["1ceka", "2ceka", "3ceka"]]);
});
