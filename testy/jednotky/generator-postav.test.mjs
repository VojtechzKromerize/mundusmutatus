// Kdo je to? – generátor postav doby (09g, čistý): jméno podle země a stavu, ženská příjmení, šlechtický přídomek, duchovní (2026-10-28)
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const C = ciste();
/* opakovatelná náhoda: lineární kongruentní generátor */
C.ev(`var rnd = s => () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)`);

test("ženská příjmení podle jazyka", () => {
  const z = (p, j) => C.ev(`genZenske(${JSON.stringify(p)}, ${JSON.stringify(j || "cs")})`);
  assert.equal(z("Kovář"), "Kovářová");
  assert.equal(z("Černý"), "Černá");
  assert.equal(z("Vrabec"), "Vrabcová");
  assert.equal(z("Sládek"), "Sládková");
  assert.equal(z("Krejčí"), "Krejčová");
  assert.equal(z("Liška"), "Lišková");
  assert.equal(z("Schmied", "de"), "Schmiedin");
  assert.equal(z("Kowal", "pl"), "Kowalowa");
  assert.equal(z("Mały", "pl"), "Mała");
});

test("povaha a vzhled v rodě postavy", () => {
  assert.equal(C.ev(`genRod("chvástav{ý|á}, všechno prý zažil{|a} dřív", true)`), "chvástavá, všechno prý zažila dřív");
  assert.equal(C.ev(`genRod("chvástav{ý|á}, všechno prý zažil{|a} dřív", false)`), "chvástavý, všechno prý zažil dřív");
  for (let i = 1; i <= 100; i++) {
    const p = C.V(`genPostava({}, rnd(${i}))`);
    assert.ok(!/[{}|]/.test(p.povaha + p.vzhled + p.chce), p.povaha);
  }
});

test("postava má všechny údaje a drží zvolenou zemi, stav a pohlaví", () => {
  for (let i = 1; i <= 200; i++) {
    const p = C.V(`genPostava({}, rnd(${i}))`);
    for (const k of ["jmeno", "stav", "zeme", "vira", "reci", "povaha", "vzhled", "chce", "b"]) assert.ok(p[k], `${k} (${i})`);
    assert.ok(p.vek >= 13 && p.vek <= 75);
  }
  const z = C.V(`genPostava({zeme: "uhry", stav: "sedlak", pohl: "z"}, rnd(7))`);
  assert.equal(z.zeme, "Uhry");
  assert.equal(z.stav, "selka");
  assert.equal(z.zena, true);
  /* v Polsku a Německých zemích nejsou kališníci */
  for (let i = 1; i <= 50; i++) assert.notEqual(C.V(`genPostava({zeme: "polsko"}, rnd(${i}))`).vira, "kališník");
});

test("šlechtic má přídomek, duchovní titul, Uher příjmení napřed", () => {
  for (let i = 1; i <= 40; i++) {
    const p = C.V(`genPostava({zeme: "cechy", stav: "zeman", pohl: "m"}, rnd(${i}))`);
    assert.match(p.jmeno, / (z|ze|von) /, p.jmeno);
    assert.equal(p.b, "srd-knight");
    assert.match(C.V(`genPostava({zeme: "cechy", stav: "knez", pohl: "m"}, rnd(${i}))`).jmeno, /^(kněz|bratr) /);
    assert.match(C.V(`genPostava({zeme: "cechy", stav: "knez", pohl: "z"}, rnd(${i}))`).jmeno, /^sestra /);
  }
  const u = C.V(`genPostava({zeme: "uhry", stav: "mestan", pohl: "m"}, rnd(3))`);
  const J = C.V(`GENJM`);
  const [prvni, druhe] = u.jmeno.split(" ");
  if (J.hu.p.includes(prvni)) assert.ok(J.hu.m.includes(druhe), u.jmeno);
});
