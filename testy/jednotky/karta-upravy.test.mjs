// Rychlé testy úprav karty z 2026-10-23 (Vojtův seznam chyb): zdatnosti a jazyky doplněné hráčem, Svědomí s jednou Ctností
// a jednou Neřestí, panel Kostky (výběr kostek do výrazu, výhoda a nevýhoda), vybavení (nosnost, složky, váha).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
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
const sKartou = (stav, f) => {
  const K0 = S.ev(`JSON.stringify(KST.balduin || null)`);
  S.ev(`KST.balduin = Object.assign({}, KST.balduin || {}, ${JSON.stringify(stav)})`);
  try {
    return f();
  } finally {
    S.ev(`KST.balduin = ${K0} || undefined`);
  }
};

test("zdatnosti: skryté z PDF chybí, doplněné hráčem platí (zbraně i jazyky) a nabídka má seznam SRD", () => {
  const pdf = V(`KARTBY.balduin.zd.zbrane`) || [];
  sKartou({dopl: {bez: pdf.length ? ["zbrane:" + pdf[0]] : [], zbrane: ["Longbow"], jazyky: ["Latina"]}}, () => {
    const z = V(`kZdSez(KARTBY.balduin, "zbrane")`);
    assert.ok(z.includes("Longbow"), "doplněná zbraň se počítá");
    if (pdf.length) assert.ok(!z.includes(pdf[0]), "skrytá zbraň z PDF se nepočítá");
    assert.ok(V(`kZdSez(KARTBY.balduin, "jazyky")`).includes("Latina"));
    const h = V(`bdmZdatHtml(KARTBY.balduin, true)`);
    assert.match(h, /data-kdoplf="zbroj"/);
    assert.match(h, /data-kdoplx="jazyky:0"/, "doplněný jazyk jde odebrat");
    assert.match(h, /<option value="Heavy Armor">/, "nabídka zbrojí ze SRD");
    assert.match(h, /<option value="Draconic">|Draconic/);
  });
});

test("Svědomí: jedna Ctnost a jedna Neřest, nastavení duše přímo v listu, vysvětlení hříchů a bez velkých políček bodů", () => {
  sKartou({duse: {vz: "kal", ctn: ["Píle", "Štědrost"], ner: ["Závist", "Chtíč"]}, hr: 2, sk: 1}, () => {
    const D = V(`kDuse(KARTBY.balduin)`);
    assert.deepEqual([D.ctn, D.ner], [["Píle"], ["Závist"]], "starší data se dvěma berou první");
    const h = V(`kDuseHtml(KARTBY.balduin)`);
    assert.match(h, /<select name="c1" data-kdusg>/);
    assert.match(h, /<option selected>Píle<\/option>/);
    assert.doesNotMatch(h, /Štědrost<\/span>|chip ctn/, "Ctnosti se neukazují dvakrát");
    assert.match(h, /data-kduvys/);
    assert.match(h, /Všední hřích/);
    assert.doesNotMatch(h, /class="kbod"/, "body hříchu a skutků jsou na kartě, v listu už ne");
    assert.match(h, /data-kdu="zp"/, "Zpytování svědomí zůstává");
  });
});

test("věc: popis je nahoře a rozbalený, bez původu SRD a bez ceny", () => {
  const h = V(
    `kVecPopis({n: "Ring of Protection"}, {druh: "prsten", vzt: "vzácný", pr: true, t: "Dostaneš +1 k AC.", str: 210}, {sk: "magicke", en: "Ring of Protection", t: "Při nošení +1 k AC.", cena: "3500 GP"})`,
  );
  assert.match(h, /^<details class="kvpop"[^>]* open>/);
  assert.match(h, /Při nošení \+1 k AC/, "přednost má text z katalogu");
  assert.match(h, /Celé znění/);
  assert.doesNotMatch(h, /SRD 5\.2\.1|GP/);
});

test("panel Kostky: klepnutí přidá kostku do výrazu, výhoda změní jedinou d20 na 2d20kh1; bez Bless, Bane a Guidance", () => {
  assert.equal(V(`kKostPridej("", "d6")`), "1d6");
  assert.equal(V(`kKostPridej("1d6", "d6")`), "2d6");
  assert.equal(V(`kKostPridej("2d6", "d8")`), "2d6+1d8");
  assert.equal(V(`kKostPridej("1d20+5", "d20")`), "2d20+5");
  assert.equal(V(`kKostPridej("1d10", "d100")`), "1d10+1d100", "d100 nesplete s d10");
  assert.equal(V(`kKostAdv("1d20+5", 1)`), "2d20kh1+5");
  assert.equal(V(`kKostAdv("d20", -1)`), "2d20kl1");
  assert.equal(V(`kKostAdv("2d6+3", 1)`), "2d6+3", "bez d20 se nic nemění");
  assert.equal(V(`kKostAdv("1d20+5", 0)`), "1d20+5");
  const h = V(`bdmKostHtml(KARTBY.balduin, {})`);
  assert.match(h, /data-kkost="d20"/);
  assert.match(h, /data-kkosttaj="1"/);
  assert.match(h, /data-bdmadv="1"/);
  assert.doesNotMatch(h, /data-kdice/, "kostky kouzel (Bless, Bane, Guidance) panel už nemá");
});
