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

test("stránka: pověst ve městě – klíč bez diakritiky, jméno, seznam a panel města na mapě", () => {
  assert.equal(V(`povMestoId("Kutná Hora")`), "m-kutna-hora");
  assert.equal(V(`povMestoId("Praha, Staré Město")`), "m-praha");
  assert.ok(V(`povMesta()`).includes("Praha") && V(`povMesta()`).includes("Plzeň"));
  assert.equal(V(`povJmeno("m-plzen")`), "Plzeň");
  S.ev(`POV = {"m-plzen": {u: -1, pz: "rvačka s cechem soukeníků"}}`);
  assert.deepEqual(V(`povSeznam()`), ["m-plzen"]);
  assert.match(V(`povSeznamHtml(false)`), /Plzeň[\s\S]*město[\s\S]*Nedůvěra[\s\S]*soukeníků/);
  assert.match(V(`mistoHtml("Plzeň")`), /class="kv povmisto" data-pid="m-plzen"[\s\S]*Nedůvěra/);
  S.ev(`POV = {}`);
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

test("pověst ve městě obchodu: Přízeň zlevní, Nedůvěra zdraží, Nepřízeň a horší – neobchoduje; zpustlý kraj +50 %", () => {
  assert.deepEqual(C.V(`[3, 2, 1, 0, -1].map(obchPovPrir)`), [-20, -10, -5, 0, 10]);
  assert.equal(C.ev(`obchPovPrir(-2)`), null);
  assert.equal(C.ev(`obchUprava({prir: 20}, -3)`), null);
  assert.equal(C.ev(`obchUprava({prir: 20}, 2)`), 10);
  assert.equal(C.ev(`obchUprava({prir: 0, zpust: true}, 0)`), 50);
});

test("smlouvání: o 5 nad SO −20 %, na SO −10 %, o 5 pod SO +10 %", () => {
  assert.deepEqual(C.V(`[18, 13, 12, 9, 8].map(t => obchSmlouvani(t, 13))`), [-20, -10, 0, 0, 10]);
  assert.equal(C.ev(`obchSeSmlouvou(100, -10)`), 90);
  assert.equal(C.ev(`obchDc({typ: "kupec"})`), 15);
  assert.equal(C.ev(`obchDc({typ: "kupec", dc: 11})`), 11);
});

test("místo: obchod s vazbou vidí hráči jen v jeho místě (první část před čárkou, bez diakritiky)", () => {
  const o = `{otevr: true, vaz: true, misto: "Praha, Staré Město"}`;
  assert.equal(C.ev(`obchViditelny(${o}, "Praha")`), true);
  assert.equal(C.ev(`obchViditelny(${o}, "Kutná Hora")`), false);
  assert.equal(C.ev(`obchViditelny(${o}, null)`), false);
  assert.equal(C.ev(`obchViditelny({otevr: true, misto: "Plzeň"}, "Praha")`), true, "bez vazby všude");
  assert.equal(C.ev(`obchViditelny({otevr: false}, "Praha")`), false);
  assert.equal(C.ev(`obchTady({vaz: true, misto: "Kutna hora"}, "Kutná Hora")`), true);
});

test("zásoby: levné po 20, drahé po 1, zpustlý kraj polovina; prodej ubírá, za týden se doplní", () => {
  assert.deepEqual(C.V(`[10, 50, 300, 1500, 9000].map(h => obchZasoba(h))`), [20, 8, 4, 2, 1]);
  assert.equal(C.ev(`obchZasoba(10, true)`), 10);
  const den = C.ev(`obchDen("1458-03-10")`);
  C.ctx.__o = C.V(`Object.assign(obchNovy("kramar", "", "", "t"), {zas: true})`);
  const r0 = C.V(`obchZbozi(__o, __V, __BY, {den: ${den}})`)[0];
  C.ctx.__o = C.V(`obchProdano(__o, ${JSON.stringify(r0.id)}, 3, ${den})`);
  const q = d => C.V(`obchZbozi(__o, __V, __BY, {den: ${d}})`).find(r => r.id === r0.id).q;
  assert.equal(q(den), r0.q - 3);
  assert.equal(q(den + 6), r0.q - 3);
  assert.equal(q(den + 7), r0.q, "po týdnu doplněno");
  assert.equal(C.ev(`obchDen("1458-03-11") - obchDen("1458-02-28")`), 11, "juliánský rok 1458 má únor o 28 dnech");
  assert.equal(C.ev(`obchDenTxt(obchDen("1458-03-03"))`), "3. 3. 1458");
});

test("výkup: kovář koupí zbraň za 40 %, kupec ji nekoupí, pokoutník koupí cokoli běžného, kouzelné nikdo sám", () => {
  const dyka = Object.assign(
    {sk: "zbrane"},
    VYB.zbrane.find(x => x.en === "Dagger"),
  );
  C.ctx.__d = dyka;
  assert.equal(C.ev(`obchVykupCena({typ: "kovar"}, __d, 0)`), Math.round(dyka.hal * 0.4));
  assert.equal(C.ev(`obchVykupCena({typ: "mecir"}, __d, 2)`), Math.round(dyka.hal * 0.5 * 1.1), "Spojenci platí lépe");
  assert.equal(C.ev(`obchVykupCena({typ: "kupec"}, __d, 0)`), 0);
  assert.ok(C.ev(`obchVykupCena({typ: "pokout"}, __d, 0)`) > 0);
  assert.equal(C.ev(`obchVykupCena({typ: "mecir"}, __d, -2)`), 0);
  C.ctx.__m = Object.assign({sk: "magicke"}, VYB.magicke[0]);
  assert.equal(C.ev(`obchVykupuje({typ: "pokout"}, __m)`), false);
});

test("zakázky: jen řemeslníci, bez kouzelných věcí; dny práce podle ceny (1–60)", () => {
  assert.equal(C.V(`obchZakazkyNab("kupec", __V)`).length, 0);
  const Z = C.V(`obchZakazkyNab("zbrojir", __V)`);
  assert.ok(Z.length > 5 && Z.every(x => x.sk !== "magicke"));
  assert.deepEqual(C.V(`[40, 1000, 18000, 999999].map(obchDnyPrace)`), [1, 4, 60, 60]);
  assert.deepEqual(C.V(`obchRozdil({GP: 1, SP: 3}, {SP: 25})`), {GP: -1, SP: 22});
});

test("stránka: výkup, zakázka s předáním po termínu, neobchodující město a vlastní obchodník", async () => {
  await S.ev(`vybNacti()`);
  S.ev(`HRA = Object.assign({}, HRA || {}, {datum: "1458-03-10", misto: "Praha"})`);
  S.ev(`OBCH = [Object.assign(obchNovy("mecir", "U Meče", "Praha", "t3"), {otevr: true, vaz: true})]`);
  await S.ev(`kartaStavZmen("balduin", {pen: {GP: 10}, inv: [{n: "Dagger", q: 2}]})`);
  const sum = () => V(`Object.entries(kPenKarta(KARTBY.balduin)).reduce((s, [k, v]) => s + KMINC[k] * v, 0)`);
  const p0 = sum();
  assert.match(V(`obchVykupHtml(KARTBY.balduin, {n: "Dagger", q: 2})`), /U Meče/);
  await S.ev(`obchVykup(KARTBY.balduin, "t3", "Dagger", 1, 0)`);
  const dyka = V(`vybNajdi("Dagger")`);
  assert.equal(sum(), p0 + Math.round(dyka.hal * 0.5));
  assert.equal(V(`kInv(KARTBY.balduin).find(x => x.n === "Dagger").q`), 1);
  /* zakázka: zaplaceno hned, věc až po termínu */
  const x = V(`obchZakazkyNab("mecir", VYB).find(x => x.en === "Longsword")`);
  await S.ev(`obchZakazka(KARTBY.balduin, "t3", ${JSON.stringify(x.id)}, 1, 0)`);
  assert.equal(V(`OBCH[0].zak.length`), 1);
  const hot = V(`OBCH[0].zak[0].hot`);
  assert.equal(hot, V(`obchDen("1458-03-10")`) + V(`obchDnyPrace(${x.hal})`));
  const maMec = () => V(`kInv(KARTBY.balduin).some(y => /Longsword/.test(y.n))`);
  assert.equal(maMec(), false);
  await S.ev(`obchZakDoruc()`);
  assert.equal(maMec(), false, "ještě není hotovo");
  S.ev(`HRA.datum = "1458-04-20"`);
  await S.ev(`obchZakDoruc()`);
  assert.equal(maMec(), true, "po termínu předáno");
  assert.equal(V(`OBCH[0].zak.length`), 0);
  /* pověst: Nepřízeň u rodu → neobchoduje */
  /* pověst ve městě obchodu (Praha), ne u rodu */
  S.ev(`POV = {"m-praha": {u: -2}}`);
  await assert.rejects(S.ev(`obchProdej(KARTBY.balduin, "t3", obchZbozi(OBCH[0], VYB, VYBBY)[0].id, 1, 0)`), /neobchoduje/);
  assert.equal(V(`obchVykupHtml(KARTBY.balduin, {n: "Dagger", q: 1})`), "");
  /* obchodník z generátoru */
  const k = V(`obchKupec(OBCH[0])`);
  assert.ok(k.jmeno && k.povaha && k.zv);
  /* jinde: hráč obchod nevidí */
  S.ev(`POV = {}; HRA.misto = "Kutná Hora"`);
  assert.doesNotMatch(V(`obchHracHtml(KARTBY.balduin)`), /U Meče/);
});
