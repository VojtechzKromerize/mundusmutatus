// Léčení kritických zranění (Rány) z karty (2026-10-28, Vojta): co ránu vyléčí podle závažnosti (čistý ranaLecba v 10p)
// a tlačítka na kartě – Lehká pomine, Těžká ošetřením (Lékařství) nebo Lesser Restoration, Vážná Greater Restoration / vypravěč.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();

test("čisté: léčba rány podle závažnosti", () => {
  assert.deepEqual(C.V(`ranaLecba("Lehká (Hlava): Zvonění v hlavě")`), {st: 0, pomine: true, lek: null, lesser: true, greater: true, gm: false});
  assert.deepEqual(C.V(`ranaLecba("Těžká (Trup): Krvácivá rána – krvácení D6")`), {
    st: 1,
    pomine: false,
    lek: 13,
    lesser: true,
    greater: true,
    gm: false,
  });
  assert.deepEqual(C.V(`ranaLecba("Vážná (Paže): Rozťaté předloktí")`), {st: 2, pomine: false, lek: null, lesser: false, greater: true, gm: true});
  assert.equal(C.V(`ranaLecba("Smrtelná (Hlava): Rozpoltěná lebka").greater`), false);
});

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("karta: rány mají tlačítka léčby podle závažnosti (vypravěč)", () => {
  const H0 = S.ev(`JSON.stringify(HRA)`);
  S.ev(`HRA = Object.assign({}, HRA || {}); HRA.krit = {Balduin: [
    {t: "Lehká (Nohy): Podražení – Prone", d: "3. března 1458"},
    {t: "Těžká (Trup): Krvácivá rána – krvácení D6", d: "3. března 1458"},
    {t: "Vážná (Paže): Rozťaté předloktí", d: "3. března 1458"},
    {t: "Smrtelná (Hlava): Rozpoltěná lebka", d: "3. března 1458"}]}`);
  try {
    const h = S.ev(`kRanyHtml(KARTBY.balduin)`);
    const li = h.split("<li").slice(1);
    assert.equal(li.length, 4);
    assert.match(li[0], /data-kranlec="0"[^>]*>pominula</);
    assert.match(li[1], /data-kranlek="1"[^>]*>Ošetřit \(Lékařství\)</);
    assert.match(li[1], /data-kranlec="1"[^>]*>vyléčeno</);
    assert.doesNotMatch(li[1], /pominula/);
    assert.match(li[2], /data-kranlec="2"/, "vypravěč odškrtne i Vážnou");
    assert.doesNotMatch(li[2], /data-kranlek/, "Vážnou Lékařství nevyléčí");
    assert.match(li[3], /Smrtelná rána je trvalá/);
    assert.doesNotMatch(h, /Léčit je může přihlášený hráč/);
  } finally {
    S.ev(`HRA = ${H0}`);
  }
});
