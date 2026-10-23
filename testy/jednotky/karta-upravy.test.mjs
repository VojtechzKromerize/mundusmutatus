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
