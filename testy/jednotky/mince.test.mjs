// Rychlé testy mincí (2026-10-23, 14b + 19): tažení používá jen GP, SP, CP (uherský zlatý, pražský groš, haléř).
// Rozměnění převede PP a EP na zlaté a groše, nabídky ukazují PP či EP jen tomu, kdo je má, a ikony mincí existují.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};

test("Rozměnit na nejvyšší: jen GP, SP, CP – platina i elektrum se převedou", () => {
  assert.deepEqual(V(`kPenSloz({PP: 1, EP: 3, SP: 27, CP: 104})`), {GP: 15, SP: 2, CP: 4});
  assert.deepEqual(V(`kPenSloz({CP: 250})`), {GP: 2, SP: 5});
  assert.deepEqual(V(`kPenSloz({})`), {});
});

test("nabídka mincí: GP, SP, CP; PP a EP jen když je postava má", () => {
  assert.deepEqual(V(`kMinceNab({GP: 3})`), ["GP", "SP", "CP"]);
  assert.deepEqual(V(`kMinceNab({EP: 2, PP: 0})`), ["GP", "SP", "CP", "EP"]);
  assert.deepEqual(V(`kMinceNab(null)`), ["GP", "SP", "CP"]);
});

test("částka s ikonami: zlatý, groš a haléř mají ikonu, prázdný měšec je „bez peněz“", () => {
  const h = V(`kPenHtml({GP: 2, SP: 5, CP: 7})`);
  for (const f of ["mince-gp", "mince-sp", "mince-cp"]) assert.ok(h.includes(`art/img/boj/${f}-48.webp`), f);
  assert.ok(h.indexOf("mince-gp") < h.indexOf("mince-sp") && h.indexOf("mince-sp") < h.indexOf("mince-cp"));
  assert.equal(V(`kPenHtml({})`), "bez peněz");
});

test("směna mincí nabízí jen GP, SP, CP; tlačítko Peníze má měšec", () => {
  assert.ok(!/<option[^>]*>(PP|EP)</.test(V(`kPenSmenHtml()`)));
  assert.match(V(`bdmVyb(KARTBY.balduin)`), /mesec-48\.webp/);
});

test("každá ikona mincí má soubor 48 i 96 px", () => {
  const chybi = ["mince-gp", "mince-sp", "mince-cp", "mesec", "pokladna"].filter(
    f => !existsSync(`art/img/boj/${f}-48.webp`) || !existsSync(`art/img/boj/${f}-96.webp`),
  );
  assert.deepEqual(chybi, []);
});
