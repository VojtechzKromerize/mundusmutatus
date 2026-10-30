// Obchody, losovací tabulky a pověst družiny (2026-10-30): čisté 10o-obchody.js a 10j-tabulky.js, stránka 16o a 07p.
// Kouzelné předměty se do obchodu nikdy nedostanou samy – jen ručně vystavený jednotlivý kus.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();
const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const VYB = JSON.parse(fs.readFileSync(path.join(KOREN, "art", "vybaveni.json"), "utf8"));
C.ctx.__V = VYB;
const BY = {};
for (const [sk, L] of Object.entries(VYB)) if (Array.isArray(L)) L.forEach(x => x && x.id && (BY[x.id] = Object.assign({sk}, x)));
C.ctx.__BY = BY;

test("každé jméno v sortimentu druhů obchodů je v katalogu vybavení", () => {
  const chybi = [];
  for (const [typ, T] of Object.entries(C.V("OBCHTYP")))
    for (const [sk, jm] of T.s) {
      if (jm === "*") continue;
      for (const n of jm.split(/\s+/).map(s => s.replace(/_/g, " "))) if (!(VYB[sk] || []).some(x => x.en === n)) chybi.push(`${typ}: ${sk} ${n}`);
    }
  assert.deepEqual(chybi, []);
});

test("žádný druh obchodu sám nenabízí kouzelný předmět, lektvar, svitek ani vzducholoď; každý má cenu", () => {
  for (const typ of Object.keys(C.V("OBCHTYP"))) {
    const S = C.V(`obchSortiment(${JSON.stringify(typ)}, __V)`);
    for (const x of S) {
      assert.ok(x.sk !== "magicke" && !/^(Potion of|Spell Scroll|Airship)/.test(x.en), `${typ}: ${x.en}`);
    }
    if (typ !== "vzacnosti") assert.ok(S.length > 0, `${typ} má sortiment`);
    const Z = C.V(`obchZbozi(obchNovy(${JSON.stringify(typ)}, "", "", "t"), __V, __BY)`);
    assert.ok(
      Z.every(r => r.hal > 0 && !r.mag && r.q == null),
      typ,
    );
  }
  assert.equal(C.V(`obchSortiment("vzacnosti", __V)`).length, 0);
});

test("přirážka: kupec +20 %, zaokrouhlení na haléř, nejméně 1 haléř", () => {
  assert.equal(C.ev(`obchNovy("kupec", "", "", "x").prir`), 20);
  assert.equal(C.ev(`obchCena(100, 20)`), 120);
  assert.equal(C.ev(`obchCena(1, -50)`), 1);
  assert.equal(C.ev(`obchCena(0, 20)`), 0);
});

test("kouzelný předmět: vystavený ručně je unikát (1 kus), po prodeji zmizí", () => {
  const mag = VYB.magicke.find(x => x && x.hal > 0) || VYB.magicke[0];
  C.ctx.__M = Object.assign({sk: "magicke"}, mag);
  let o = C.V(`obchVystav(obchNovy("vzacnosti", "", "", "t"), __M, "", 5000)`);
  C.ctx.__o = o;
  const Z = C.V(`obchZbozi(__o, __V, __BY)`);
  assert.equal(Z.length, 1);
  assert.deepEqual([Z[0].mag, Z[0].q, Z[0].hal, Z[0].ruc], [true, 1, 5000, true]);
  assert.equal(C.ev(`obchLzeProdat(obchZbozi(__o, __V, __BY)[0], 2)`), false);
  o = C.V(`obchProdano(__o, ${JSON.stringify(mag.id)}, 1)`);
  C.ctx.__o = o;
  assert.equal(C.V(`obchZbozi(__o, __V, __BY)`).length, 0);
});

test("vyřazené zboží se nenabízí; běžná věc vystavená ručně má počet a ubývá", () => {
  const o0 = C.V(`obchNovy("kramar", "", "", "t")`);
  const prvni = C.V(`obchZbozi(${JSON.stringify(o0)}, __V, __BY)`)[0];
  const o1 = Object.assign({}, o0, {ven: [prvni.id]});
  assert.ok(!C.V(`obchZbozi(${JSON.stringify(o1)}, __V, __BY)`).some(r => r.id === prvni.id));
  C.ctx.__X = BY[prvni.id];
  C.ctx.__o = C.V(`obchVystav(${JSON.stringify(o1)}, __X, 3, 0)`);
  let r = C.V(`obchZbozi(__o, __V, __BY)`).find(x => x.id === prvni.id);
  assert.deepEqual([r.q, r.ruc, r.mag], [3, true, false]);
  C.ctx.__o = C.V(`obchProdano(__o, ${JSON.stringify(prvni.id)}, 2)`);
  r = C.V(`obchZbozi(__o, __V, __BY)`).find(x => x.id === prvni.id);
  assert.equal(r.q, 1);
});

test("losovací tabulky: situace podle hodu, tři různé nápady, každá tabulka plná", () => {
  assert.equal(C.ev(`tabSituace("Útok mečem", true, false)`), "utok");
  assert.equal(C.ev(`tabSituace("Fire Bolt", false, true)`), "kouzlo");
  assert.equal(C.ev(`tabSituace("Athletics", false, false)`), "telo");
  assert.equal(C.ev(`tabSituace("Persuasion", false, false)`), "spol");
  assert.equal(C.ev(`tabSituace("Survival", false, false)`), "divocina");
  for (const k of Object.keys(C.V("TABSIT"))) {
    assert.ok(C.V(`TABPOK[${JSON.stringify(k)}]`).length >= 8, `pok ${k}`);
    assert.ok(C.V(`TABPOZ[${JSON.stringify(k)}]`).length >= 8, `poz ${k}`);
    const N = C.V(`tabNapady("pok", ${JSON.stringify(k)}, 3)`);
    assert.equal(new Set(N).size, 3);
  }
  assert.ok(C.V("TABZVESTI").length >= 12 && C.V("TABSEPOT").length >= 8);
});

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};

test("stránka: pověst – znak, infobox rodu a přehled; neznámý rod hráči nic neukáže", () => {
  S.ev(`POV = {pod: {u: 2, pz: "zachránili dědice"}, ros: {u: -3}}`);
  assert.match(V(`povZnak(2)`), /Spojenci \(\+2\)/);
  assert.match(V(`povZnak(-3)`), /Krevní nepřátelé \(−3\)/);
  const h = V(`povHtml("pod")`);
  assert.match(h, /Pověst družiny/);
  assert.match(h, /zachránili dědice/);
  assert.match(h, /data-povu="pod"/, "vypravěč má tlačítka");
  const L = V(`povSeznam()`).filter(id => ["pod", "ros"].includes(id));
  assert.deepEqual(
    L,
    ["pod", "ros"].filter(id => V(`!!byId[${JSON.stringify(id)}]`)),
  );
});

test("stránka: Nástroje v pultu, obchod v listu Peníze a nákup schválený vypravěčem", async () => {
  await S.ev(`vybNacti()`);
  assert.match(V(`pultNastrojeHtml()`), /Losovací tabulky[\s\S]*Obchody[\s\S]*Pověst družiny/);
  S.ev(`OBCH = [Object.assign(obchNovy("kramar", "U Kohouta", "Praha", "t1"), {otevr: true}), obchNovy("kovar", "Zavřený", "", "t2")]`);
  const pen = V(`bdmPenList(KARTBY.balduin)[1]`);
  assert.match(pen, /U Kohouta/);
  assert.doesNotMatch(pen, /Zavřený/);
  /* nákup: peníze se odečtou, věc přibude */
  const r = V(`obchZbozi(OBCH[0], VYB, VYBBY)[0]`);
  await S.ev(`kartaStavZmen("balduin", {pen: {GP: 5}})`);
  await S.ev(`obchProdej(KARTBY.balduin, "t1", ${JSON.stringify(r.id)}, 2, ${r.hal})`);
  const zbyva = V(`Object.entries(kPenKarta(KARTBY.balduin)).reduce((s, [k, v]) => s + KMINC[k] * v, 0)`);
  assert.equal(zbyva, 5 * 400 - 2 * r.hal);
  if (r.hal > 1) await assert.rejects(S.ev(`obchProdej(KARTBY.balduin, "t1", ${JSON.stringify(r.id)}, 1, ${r.hal - 1})`), /cena se mezitím zvýšila/);
  await assert.rejects(S.ev(`obchProdej(KARTBY.balduin, "t1", ${JSON.stringify(r.id)}, 9999, 0)`), /nemá/);
  assert.match(V(`tabNapadyHtml("pok", "utok")`), /Šepot/);
});
