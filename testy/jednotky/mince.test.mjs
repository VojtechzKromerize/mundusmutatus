// Rychlé testy mincí (2026-10-23, 14b + 19): tažení používá jen GP, SP, CP (uherský zlatý, pražský groš, haléř).
// Rozměnění převede PP a EP na zlaté a groše, nabídky ukazují PP či EP jen tomu, kdo je má, a ikony mincí existují.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
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
  assert.deepEqual(V(`kPenSloz({PP: 1, EP: 3, SP: 27, CP: 104})`), {GP: 3, SP: 32, CP: 4});
  assert.deepEqual(V(`kPenSloz({CP: 250})`), {SP: 25});
  assert.deepEqual(V(`kPenSloz({SP: 80})`), {GP: 2});
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

test("kurz tažení (2026-10-27): 1 zlatý = 40 grošů = 400 haléřů; peníze z PDF D&D Beyond: 1 GP z pravidel = 10 grošů", () => {
  assert.deepEqual(V(`[KMINC.GP, KMINC.SP, KMINC.CP]`), [400, 10, 1]);
  assert.deepEqual(V(`kPenDnd({GP: 100})`), {SP: 1000});
  assert.deepEqual(V(`kPenDnd({PP: 1, EP: 2, GP: 3, SP: 4, CP: 5})`), {SP: 144, CP: 5});
  assert.deepEqual(V(`kPenDnd(null)`), {});
  assert.deepEqual(V(`kPenSmen({SP: 100}, "SP", "GP", 100)`), {GP: 2, SP: 20});
  assert.equal(V(`kPenTxt({GP: 1, SP: 12, CP: 3})`), "1 zl. · 12 gr. · 3 hal.");
  assert.equal(V(`kPenZapl({GP: 1}, "SP", 15).SP`), 25, "zlatý se rozmění na groše");
});

test("katalog vybavení: dobové ceny běžného zboží (ceny-dobove.json), kouzelné věci s vlastní cenou", () => {
  const VYB = JSON.parse(readFileSync("art/vybaveni.json", "utf8")),
    c = (sk, en) => VYB[sk].find(x => x.en === en).cena;
  assert.equal(c("zbrane", "Club"), "2 hal.");
  assert.equal(c("zbrane", "Longsword"), "30 gr.");
  assert.equal(c("zbrane", "Pistol"), "30 gr.", "píšťala za dobovou cenu");
  assert.equal(c("zbrane", "Musket"), "1 kopa", "hákovnice za dobovou cenu");
  assert.equal(c("zbroj", "Plate Armor"), "30 kop (≈ 45 zl.)");
  assert.equal(c("zvirata", "Horse, Riding"), "2 kopy 30 gr.");
  assert.equal(c("vybava", "Potion of Healing"), "8 kop 20 gr.", "lektvar je unikát s vlastní cenou");
  const vse = JSON.stringify(Object.fromEntries(Object.entries(VYB).filter(([k]) => k !== "mince")));
  assert.doesNotMatch(vse, /\d\s*(GP|SP|CP)\b/, "žádná cena v mincích D&D");
  assert.match(VYB.vyroba.t[0], /cena v groších dělená stem/);
});
