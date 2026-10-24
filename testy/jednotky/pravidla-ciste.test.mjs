// Pravidla boje a Artikulí z čistého souboru 10p-pravidla.js – v čistém Node, bez stránky (přesunuto z prohlížečových testů
// prohlizec_karta.py, prohlizec_boj.py: soustředění, hody proti smrti, sloty iniciativy, přesila, zbroj, houfy).
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();

test("soustředění: SO záchrany = polovina zranění, nejméně 10, nejvýš 30", () => {
  assert.deepEqual(V(`[4, 24, 30, 61, 100].map(bojKonDC)`), [10, 12, 15, 30, 30]);
});

test("hody proti smrti (D&D 2024): 10+ úspěch, 1 = dva neúspěchy, 20 = probere se, tři úspěchy stabilizace, tři neúspěchy smrt", () => {
  assert.deepEqual(V(`bojDs(null, "hod", 1)`), {ds: {u: 0, n: 2}, m: "1 – dva neúspěchy"});
  assert.deepEqual(V(`bojDs({u: 0, n: 2}, "hod", 7).ds`), {u: 0, n: 3, st: "mrtev"});
  assert.deepEqual(V(`bojDs({u: 2, n: 1}, "hod", 14).ds`), {u: 3, n: 1, st: "stab"});
  assert.deepEqual(V(`bojDs({u: 1, n: 2}, "hod", 20)`), {ds: null, m: "20 – probírá se s 1 HP"});
  assert.deepEqual(V(`bojDs({u: 1, n: 0}, "n")`).ds, {u: 1, n: 1}, "ruční neúspěch");
  assert.deepEqual(V(`bojDs({u: 1, n: 0, st: "stab"}, "u")`).ds, {u: 2, n: 0}, "starý stav se přepočítá");
});

test("sloty iniciativy: začíná lepší hod (při shodě družina), početnější strana má o slot víc", () => {
  const sl = s => V(`bojSloty(${JSON.stringify(s)}).map(x => x.t).join("")`);
  const hraci = [
      {id: "a", hod: 15},
      {id: "b", hod: 12},
    ],
    npc = [{id: "1"}, {id: "2"}];
  assert.equal(sl({hraci, npc, dm: 12}), "hnhn");
  assert.equal(sl({hraci, npc, dm: 15}), "hnhn", "shoda: začíná družina");
  assert.equal(sl({hraci, npc, dm: 18}), "nhnh");
  assert.equal(sl({hraci, npc: [{id: "1"}, {id: "2"}, {id: "3"}, {id: "4"}], dm: 10}), "hnhnn", "víc nepřátel: o slot víc na konci");
  assert.equal(sl({hraci, npc: [{id: "1"}, {id: "2", stav: ["poražen"]}], dm: 10}), "hnh", "poražený se nepočítá, družina je početnější");
  assert.equal(sl({hraci, npc, scena: true}), "", "scéna mimo boj nemá iniciativu");
});

test("tahy NPC za kolo a přesila houfu", () => {
  assert.equal(V(`BLIM.sok`), 2);
  assert.equal(V(`BLIM.houf`), 1);
  assert.equal(V(`bojUzito({obsazeni: {1: "s1", 3: "s1", 5: "h"}}, "s1")`), 2);
  assert.deepEqual(V(`[1, 3, 6, 12].map(p => bojPres({}, {pocet: p}))`), [0, 2, 5, 5], "+1 za dalšího pacholka, nejvýš +5");
});

test("houf: pacholek má 5 HP a zranění přetéká na další", () => {
  assert.equal(V(`BPACH_HP`), 5);
  assert.deepEqual(V(`bojHoufZasah({pocet: 6, hz: 2}, 9)`), {pad: 2, hz: 1, hz0: 2});
  assert.deepEqual(V(`bojHoufZasah({pocet: 2}, 30)`), {pad: 2, hz: 0, hz0: 0});
});

test("zásah podle Artikulí: zbroj půlí svůj druh zranění, Drtivá a Průrazná ji obejdou, Immunity, Vulnerability, zkamenělý", () => {
  const E = ac => JSON.stringify({ac, p: {b: "Statistiky"}}),
    Z = (ac, v, t, o) => V(`bojZasah(${E(ac)}, ${v}, "${t}", ${JSON.stringify(o || {})})`);
  assert.deepEqual(Z("18 (plátová zbroj)", 11, "Slashing"), {x: 5, pozn: ["Resistance zbroje"]});
  assert.deepEqual(Z("18 (plátová zbroj)", 11, "Bludgeoning"), {x: 11, pozn: []}, "plátová nechrání proti drtivému");
  assert.deepEqual(Z("16 (kroužková zbroj)", 10, "Bludgeoning", {drt: 1}), {x: 10, pozn: ["Drtivá ignoruje zbroj"]});
  assert.deepEqual(Z("18 (plná zbroj)", 10, "Piercing", {pru: 1}), {x: 10, pozn: ["Průrazná ignoruje zbroj"]});
  assert.deepEqual(Z("12", 10, "Fire", {st: ["zkamenělý"]}), {x: 5, pozn: ["zkamenělý: Resistance"]});
  const imu = V(`bojZasah({ac: "13", p: {b: "Imunita Poison · Zranitelnost Fire"}}, 8, "Poison", {})`),
    zra = V(`bojZasah({ac: "13", p: {b: "Imunita Poison · Zranitelnost Fire"}}, 8, "Fire", {})`);
  assert.deepEqual(imu, {x: 0, pozn: ["Immunity"]});
  assert.deepEqual(zra, {x: 16, pozn: ["Vulnerability"]});
  assert.deepEqual(V(`["kožená zbroj", "kyrys a štít", "drátěná košile", "mage armor"].map(bikZbDruhy)`), [
    ["Vycpávaná"],
    ["Plátová", "Štít"],
    ["Kroužková"],
    [],
  ]);
});

test("drobné výpočty: modifikátor, výhoda a nevýhoda se ruší, počet útoků, druh kritického zranění, stavy bez akcí", () => {
  assert.deepEqual(V(`[1, 8, 10, 15, 20].map(kMod)`), [-5, -1, 0, 2, 5]);
  assert.deepEqual(V(`[kAdvSum(1, []), kAdvSum(1, [[-1, "sražen"]]), kAdvSum(0, [[-1, "x"], [-1, "y"]])]`), [1, 0, -1]);
  const c = tr => JSON.stringify({tr, maRys: null});
  assert.equal(V(`kPocet(${c([{n: "Fighter", u: 11}])})`), 3);
  assert.equal(V(`kPocet(${c([{n: "Ranger", u: 5}])})`), 2);
  assert.equal(V(`kPocet(${c([{n: "Wizard", u: 9}])})`), 1);
  assert.deepEqual(V(`["Fire", "Cold", "Poison", "Radiant", "Psychic", "Slashing"].map(bojKritDruh)`), [
    "ohen",
    "mraz",
    "jed",
    "svata",
    "psych",
    "fyz",
  ]);
  assert.equal(V(`bojNeschopny(["sražen", "omráčen"])`), "omráčen");
  assert.equal(V(`srdNejedna(["paralyzovaný"])`), true);
  assert.equal(V(`srdNejedna(["sražen"])`), false);
});
