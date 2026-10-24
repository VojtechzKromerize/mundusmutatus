// Rychlý test vlastností na kartě (2026-10-23): mince se zkratkou, skóre, modifikátor a záchrana ve štítku v tomto pořadí;
// zdatnost v záchraně = plný štítek (třída kprof), mince existují v art/img/atributy ve velikostech 48 a 96 px.
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

test("vlastnost: mince, skóre, modifikátor a záchrana ve štítku v tomto pořadí; zdatnost plní štítek", () => {
  const BAB = V(`BAB`);
  assert.equal(BAB.length, 6);
  const pf = V(`KARTBY.balduin.zachProf || []`);
  for (const a of BAB) {
    const h = V(`bdmVlRadek(KARTBY.balduin, ${JSON.stringify(a)}, "", true)`);
    const ik = `art/img/atributy/${a.toLowerCase()}`;
    assert.ok(h.includes(`src="${ik}-48.webp"`), `${a}: mince`);
    for (const s of [48, 96]) assert.ok(existsSync(new URL(`../../${ik}-${s}.webp`, import.meta.url)), `${a}: soubor mince ${s} px`);
    const iS = h.indexOf('class="bdmvls"'),
      iM = h.indexOf('class="bdmvlm"'),
      iZ = h.indexOf('class="bdmvlzh"');
    assert.ok(iS > 0 && iS < iM && iM < iZ, `${a}: pořadí skóre → modifikátor → záchrana`);
    const zs = V(`bsg(kZach(KARTBY.balduin, ${JSON.stringify(a)}))`),
      md = V(`bsg(kMod(kVl(KARTBY.balduin, ${JSON.stringify(a)})))`);
    assert.ok(h.includes(`<b>${zs}</b></button></div>`), `${a}: číslo záchrany ve štítku`);
    assert.ok(h.includes(`>${md}</button>`), `${a}: modifikátor`);
    assert.equal(h.includes(" kprof"), pf.includes(a), `${a}: plný štítek jen při zdatnosti`);
    assert.ok(!h.includes("kdbdot"), `${a}: bez dřívější tečky`);
  }
});

test("zbroj: nevýhoda na Stealth podle SRD (jako katalog vybavení), mithril ji nemá", () => {
  const pl = n => V(`(kZbrInfo({n: ${JSON.stringify(n)}}) || {}).pl`);
  for (const n of ["Chain Mail", "Plate Armor", "Half Plate Armor", "Padded Armor", "Scale Mail", "Splint Armor", "Ring Mail"])
    assert.equal(pl(n), 1, n);
  for (const n of ["Leather Armor", "Studded Leather Armor", "Hide Armor", "Chain Shirt", "Breastplate", "Mithral Half Plate"])
    assert.equal(pl(n), 0, n);
});

test("dovednosti: nevýhoda na Stealth z nasazené zbroje jde do hodu i na kartu; zdatnost ve štítku, bez teček", () => {
  const K = z =>
    `Object.assign({}, KARTBY.balduin, {id: "test-zbroj-" + ${JSON.stringify(z)}, vybaveni: [{n: ${JSON.stringify(z)}, q: 1, obl: true}]})`;
  const r = V(`kSvAdv(${K("Chain Mail")}, "Stealth")`);
  assert.ok(
    r.some(x => x[0] < 0 && /Chain Mail/.test(x[1])),
    "kroužková zbroj dává nevýhodu na Stealth",
  );
  assert.ok(!V(`kSvAdv(${K("Breastplate")}, "Stealth")`).some(x => x[0] < 0), "kyrys ne");
  assert.ok(!V(`kSvAdv(${K("Chain Mail")}, "Acrobatics")`).some(x => /Zbroj/.test(x[1])), "jen Stealth");
  const h = V(`bdmTelo({}, {}, ${K("Chain Mail")}, false, {}, "vl")`);
  const st = h.slice(h.indexOf(">Stealth <"), h.indexOf("</div>", h.indexOf(">Stealth <")));
  assert.ok(st.includes("art/img/boj/nevyhoda-48.webp"), "ikona nevýhody u Stealth");
  assert.ok(!/class="bdmdr[^"]*"><i class="kdbdot"/.test(h), "dovednosti bez teček");
  const dp = V(`KARTBY.balduin.dovProf || {}`);
  const ex = Object.keys(dp).find(n => dp[n] === "E"),
    pr = Object.keys(dp).find(n => dp[n] && dp[n] !== "E");
  if (pr) assert.ok(h.includes(`<div class="bdmdr kprof"><span>${pr} <small>`), `${pr}: řádek se zdatností`);
  if (ex) assert.ok(h.includes(`<div class="bdmdr kprof kexp"><span>${ex} <small>`), `${ex}: řádek s expertízou`);
});

test("nad vlastnostmi Zdatnost, Rychlost a Iniciativa jako stříbrné mince s hodnotou; Iniciativa hází", () => {
  const h = V(`bdmTelo({}, {}, KARTBY.balduin, false, {}, "vl")`);
  const sr = h.slice(h.indexOf('<div class="bdmsr">'), h.indexOf('<div class="bdmvl">'));
  assert.ok(sr.length > 0, "řada nad vlastnostmi");
  for (const [ik, n] of [
    ["pb", "Zdatnost"],
    ["rych", "Rychlost"],
    ["ini", "Iniciativa"],
  ]) {
    assert.ok(sr.includes(`src="art/img/atributy/${ik}-48.webp"`) && sr.includes(`alt="${n}"`), `${n}: mince s názvem pro čtečku`);
    for (const s of [48, 96]) assert.ok(existsSync(new URL(`../../art/img/atributy/${ik}-${s}.webp`, import.meta.url)), `${n}: soubor ${s} px`);
    assert.ok(sr.includes(`data-tip="${n}:`), `${n}: popisek při najetí`);
  }
  assert.ok(sr.includes(`<b>${V(`bsg(kPB(KARTBY.balduin))`)}</b>`), "hodnota zdatnosti");
  assert.ok(/<button type="button" class="bdmsri" data-khod="in"/.test(sr), "Iniciativa je tlačítko hodu");
  assert.ok(!sr.includes("bdmch"), "bez dřívějších bublin");
});

test("záložky karty: malované štíty pro sedm oddílů, Společníci linková ikona", () => {
  for (const id of ["vl", "akce", "kouzla", "vyb", "rysy", "denik", "zaznam"]) {
    assert.ok(V(`bdmZalIk(${JSON.stringify(id)})`).includes(`src="art/img/zalozky/${id}-48.webp"`), `${id}: štít`);
    for (const s of [48, 96]) assert.ok(existsSync(new URL(`../../art/img/zalozky/${id}-${s}.webp`, import.meta.url)), `${id}: soubor ${s} px`);
  }
  assert.ok(V(`bdmZalIk("spol")`).startsWith("<svg"), "Společníci zatím bez štítu");
});
