// Průvodce koncem boje (2026-10-27, Vojta): rány a stav družiny, sebrání poloviny vystřeleného střeliva.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof bojMunSeber === "function" || mmLina("hra")`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("vystřelené šípy se počítají a po boji se najde polovina", async () => {
  const puv = V(`[kartaStav("balduin").inv || null, kartaStav("balduin").mun || null]`);
  try {
    await S.ev(`kartaStavZmen("balduin", {inv: [{n: "Longbow"}, {n: "Arrows", q: 20}], mun: null})`);
    await S.ev(`kMunOdecti(KARTBY.balduin, {n: "Longbow", vl: ["Ammunition"]}, 3)`);
    await S.ev(`kMunOdecti(KARTBY.balduin, {n: "Longbow", vl: ["Ammunition"]}, 4)`);
    assert.deepEqual(V(`[kartaStav("balduin").inv[1].q, kartaStav("balduin").mun]`), [13, {Arrows: 7}]);
    assert.match(V(`bojPoBojiMun()`), /Arrows 7× vystřeleno, najde 3/);
    await S.ev(`bojMunSeber(KARTBY.balduin)`);
    assert.deepEqual(V(`[kartaStav("balduin").inv[1].q, kartaStav("balduin").mun ?? null]`), [16, null]);
    assert.match(V(`bojPoBojiMun()`), /Nikdo z družiny nestřílel/);
  } finally {
    await S.ev(`kartaStavZmen("balduin", {inv: ${JSON.stringify(puv[0])}, mun: ${JSON.stringify(puv[1])}})`);
  }
});

test("rány po boji: životy, bezvědomí s hody proti smrti a vyčerpání postavy", async () => {
  const puv = V(`[kartaStav("balduin").hp ?? null, kartaStav("balduin").ds ?? null, kartaStav("balduin").vycerp ?? null]`);
  try {
    await S.ev(`kartaStavZmen("balduin", {hp: 0, ds: {u: 1, n: 2}, vycerp: 1})`);
    const h = V(`bojPoBojiRany({hraci: [{id: "h1", k: "balduin", n: KARTBY.balduin.n}]})`);
    assert.match(h, /0\/\d+ HP/);
    assert.match(h, /v bezvědomí, hody proti smrti 1✓ 2✗/);
    assert.match(h, /vyčerpání 1/);
  } finally {
    await S.ev(`kartaStavZmen("balduin", {hp: ${JSON.stringify(puv[0])}, ds: ${JSON.stringify(puv[1])}, vycerp: ${JSON.stringify(puv[2])}})`);
  }
});
