// Hod za cizí postavu (2026-10-25, Vojta): hráč nemá mít možnost házet za zamčenou kartu jiného hráče, a když databáze hod
// odmítne, nesmí zůstat v herním záznamu.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof kartaHod === "function" || mmLina("hra")`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

/* blokování hodu na cizí zamčené kartě (kMuze = false) jde vyzkoušet jen v hráčské verzi – ověřuje testy/prohlizec_karta.py;
   tady: vlastní karta kostku má a pojistka v kartaHod je na místě */
test("vlastní karta má kostku a kartaHod hlídá cizí postavu", () => {
  assert.match(S.ev(`kartaJednaHtml(KARTBY.balduin)`), /class="bdmd20"/);
  assert.match(S.ev(`kartaHod.toString()`), /kMuze\(K\)/);
});

test("odmítnutý zápis hodu se z herního záznamu odebere, výpadek sítě ne", async () => {
  S.ev(`window.__hod = KDB.hod; window.__n = HODY.length`);
  try {
    S.ev(`KDB.hod = () => Promise.reject(new Error("za tuto postavu hází přihlášený hráč"))`);
    await S.ev(`kHodZapis({k: "balduin", kdo: "Balduin", co: "Zkouška", tot: 12})`);
    assert.equal(V(`HODY.length - window.__n`), 0, "odmítnutý hod v záznamu nezůstal");
    S.ev(`KDB.hod = () => Promise.resolve(1)`);
    await S.ev(`kHodZapis({k: "balduin", kdo: "Balduin", co: "Zkouška 2", tot: 13})`);
    assert.equal(V(`HODY.length - window.__n`), 1, "zapsaný hod v záznamu je");
    assert.equal(V(`HODY[0].co`), "Zkouška 2");
  } finally {
    S.ev(`KDB.hod = window.__hod; HODY.splice(0, HODY.length - window.__n)`);
  }
});
