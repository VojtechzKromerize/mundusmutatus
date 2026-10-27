// Rychlé testy výpočtů webu (pravidla postavy, útok, Artikule, kouzla, vybavení) – bez prohlížeče, ~10 s.
//   npm test   (nebo node --test testy/jednotky/)
// Stránka se načte jednou (jsdom, vypravěčská statická verze); kostky jdou nastavit (S.kostky([[číslo, stěn], …])).
// Čísla u postavy Balduin (testovací karta) zachycují současné výpočty – když se změní záměrně, uprav test.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti()])");
});
after(() => S && S.zavri());
/* konstanty a šipkové funkce skriptu (const …) nejsou vlastnosti window – výraz se vyhodnotí ve stránce a vrátí jako JSON */
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const VA = async vyraz => {
  const r = await S.ev(`(async()=>JSON.stringify(await (${vyraz})))()`);
  return r === undefined ? undefined : JSON.parse(r);
};

test("stránka se načte bez chyb JavaScriptu", () => {
  assert.deepEqual(S.chyby, []);
});

test("základ: modifikátor vlastnosti a bonus zdatnosti", () => {
  assert.deepEqual(V("[1, 8, 9, 10, 11, 15, 20].map(kMod)"), [-5, -1, -1, 0, 0, 2, 5]);
  assert.equal(V("kLv(KARTBY.balduin)"), 7, "Balduin: Warlock 6 + Fighter 1");
  assert.equal(V("kPB(KARTBY.balduin)"), 3, "úroveň 5–8 → +3");
  assert.equal(V("kAC(KARTBY.balduin)"), 18);
});

/* ---------- útok (bojUtokPriprav: hod na zásah a zranění, společný pro telefon hráče i vypravěče) ---------- */
const utok = (o, kostky) => {
  if (kostky) S.kostky(kostky);
  const {K, ...zbytek} = o;
  return V(`bojUtokPriprav(Object.assign({E: []}, ${JSON.stringify(zbytek)}${K ? `, {K: KARTBY[${JSON.stringify(K)}]}` : ""}))`);
};
const MEC = {n: "Longsword", b: 5, z: "1d8+3", t: "Slashing"};

test("útok: přirozená 1 vždy mine, přirozená 20 je kritický zásah", () => {
  const p1 = utok({w: MEC, ac: 2}, [[1, 20]]);
  assert.equal(p1.zas, false);
  assert.equal(p1.vys, "vedle");
  assert.equal(p1.dmg, 0);
  const p20 = utok({w: MEC, ac: 40}, [
    [20, 20],
    [8, 8],
    [8, 8],
  ]);
  assert.equal(p20.krit, true);
  assert.equal(p20.vys, "kritický zásah");
  assert.equal(p20.dmg, 8 + 8 + 3, "kritický zásah: dvojnásobek kostek, bonus jen jednou");
});

test("útok: zásah od hodnoty AC výš", () => {
  assert.equal(
    utok({w: MEC, ac: 15}, [
      [10, 20],
      [5, 8],
    ]).vys,
    "zásah",
  ); // 10 + 5 = 15
  assert.equal(utok({w: MEC, ac: 16}, [[10, 20]]).vys, "vedle");
  assert.equal(
    utok({w: MEC, ac: 15}, [
      [10, 20],
      [5, 8],
    ]).dmg,
    8,
    "1d8 (5) + 3",
  );
});

test("útok: výhoda bere vyšší d20, nevýhoda nižší", () => {
  assert.equal(
    utok({w: MEC, ac: 30, v: 1}, [
      [3, 20],
      [17, 20],
    ]).d,
    17,
  );
  assert.equal(
    utok({w: MEC, ac: 30, v: -1}, [
      [3, 20],
      [17, 20],
    ]).d,
    3,
  );
});

test("útok: rozšířený rozsah kritického zásahu (19–20) z účinku", () => {
  const p = utok({w: MEC, ac: 40, E: [{n: "Improved Critical", krit: 19}]}, [
    [19, 20],
    [1, 8],
    [1, 8],
  ]);
  assert.equal(p.kmin, 19);
  assert.equal(p.krit, true);
});

test("útok: ručně zadaný hod a zranění (fyzické kostky)", () => {
  const p = utok({w: MEC, ac: 12, ruc: {d20: 9, dmg: 6}});
  assert.equal(p.hod, 14);
  assert.equal(p.vys, "zásah");
  assert.equal(p.dmg, 9, "ručně 6 + 3 ze zbraně");
});

test("útok: vyčerpání (Exhaustion) sníží hod o 2 za úroveň", async () => {
  await S.ev(`kartaStavZmen("balduin", {vycerp: 2})`);
  try {
    assert.equal(utok({K: "balduin", w: MEC, ac: 1, ruc: {d20: 10}}).b0, 5 - 4);
  } finally {
    await S.ev(`kartaStavZmen("balduin", {vycerp: null})`);
  }
});

test("Artikule: Vpřed! přihodí kostky zbraně ještě jednou", () => {
  const p = utok({w: {n: "Lance", b: 5, z: "1d10+3", t: "Piercing"}, ac: 10, vp: true}, [
    [15, 20],
    [4, 10],
    [6, 10],
  ]);
  assert.equal(p.dmg, 4 + 6 + 3);
});

test("kostky: kritický zásah zdvojí počet kostek, ne bonus", () => {
  S.kostky([
    [2, 6],
    [5, 6],
    [6, 6],
    [1, 6],
  ]);
  assert.equal(V(`bojKostky("2d6+1", false).t`), 2 + 5 + 1);
  assert.equal(V(`bojKostky("1d6+1", true).t`), 6 + 1 + 1);
});

/* ---------- Artikule a katalog vybavení ---------- */
test("Artikule: vlastnosti zbraně z katalogu vybavení", () => {
  assert.deepEqual(V(`bdmZvlAuto({n: "Longsword"})`).sort(), V(`VYBBY.longsword.art`).sort(), "karta bere vlastnosti z katalogu");
  assert.ok(V(`bdmZvlAuto({n: "Longsword"})`).includes("Půlmeč"));
  assert.ok(V(`bdmZvlAuto({n: "Dagger of C.K."})`).includes("Do slabin!"), "magická dýka podle základní zbraně");
});

test("Artikule: druh zbroje dává Resistance a počet obětování", () => {
  assert.equal(V(`vybNajdi({n: "Breastplate"}).art`), "Plátová");
  assert.deepEqual(V(`BZBR["Plátová"]`), ["Slashing, Piercing", "3×"]);
  assert.equal(V(`vybNajdi({n: "Shield"}).art`), "Štít");
});

test("vybavení: věc z katalogu přibude do vybavení postavy", async () => {
  const pred = V(`kartaStav("balduin").inv || KARTBY.balduin.vybaveni || []`);
  try {
    await S.ev(`kVybPridej(KARTBY.balduin, vybPoolVstup(VYBBY.crowbar), 2)`);
    const x = V(`kartaStav("balduin").inv`).find(y => y.n === "Crowbar");
    assert.ok(x, "Crowbar je ve vybavení");
    assert.equal(x.q, 2);
    assert.equal(x.kat, undefined, "databáze klíč kat nepřijme – věc se najde podle jména");
    assert.equal(V(`vybNajdi(${JSON.stringify(x)}).id`), "crowbar");
  } finally {
    await S.ev(`kartaStavZmen("balduin", {inv: ${JSON.stringify(pred)}})`);
  }
});

/* ---------- kouzla ---------- */
const kouzlo = (n, st) => V(`kSpUcinek(KARTBY.balduin, {n: ${JSON.stringify(n)}}, ${st})`);

test("kouzla: Fireball 8d6 Fire, záchrana DEX, na vyšším stupni +1d6", () => {
  assert.deepEqual(kouzlo("Fireball", 3), {k: "z", x: "8d6", t: "Fire", zach: "DEX", utok: false, pol: true});
  assert.equal(kouzlo("Fireball", 5).x, "10d6");
});

test("kouzla: Magic Missile má 3 šipky už na 1. stupni, +1 za stupeň", () => {
  assert.equal(kouzlo("Magic Missile", 1).pocet, 3);
  assert.equal(kouzlo("Magic Missile", 3).pocet, 5);
  assert.equal(kouzlo("Magic Missile", 1).x, "1d4+1");
});

test("kouzla: Eldritch Blast – paprsky podle úrovně postavy (7 → 2)", () => {
  const e = kouzlo("Eldritch Blast", 0);
  assert.equal(e.pocet, 2);
  assert.equal(e.utok, true);
});

test("kouzla: léčení s modifikátorem sesílací vlastnosti", () => {
  assert.deepEqual(kouzlo("Cure Wounds", 1), {k: "l", x: "2d8", mod: 4, utok: false, pol: false});
  assert.equal(kouzlo("Cure Wounds", 2).x, "4d8");
  assert.equal(kouzlo("Healing Word", 1).x, "2d4");
});

/* ---------- vypravěč hází za hráče (regrese 2026-10-21: zápis útoku se ztrácel – čárka jako operátor v bojGmZapisVse) ---------- */
test("boj: vypravěč zapíše útok za hráče s cílem, zásahem a zraněním", async () => {
  S.ev(`BOJ.s = {aktivni: true, kolo: 1, tah: 0, hraci: [{id: "h1", n: "Balduin", k: "balduin", ini: 12}],
    npc: [{id: "n1", n: "Vlk", ac: "13", hp: [{max: 11}], ini: 8}], utoky: []}; BGMU.h1 = {ci: "n1", cilL: ["n1"]}`);
  const i = V(`bojZbrVse(BOJ.s, BOJ.s.hraci[0]).findIndex(w => w.n === "Nevermore")`);
  assert.ok(i >= 0, "Balduin má Nevermore");
  S.kostky([
    [15, 20],
    [6, 8],
  ]);
  S.ev(`bojGmHod("h1", ${i})`);
  S.ev(`bojGmZapisVse("h1")`);
  const U = V(`BOJ.s.utoky`);
  assert.equal(U.length, 1);
  assert.deepEqual(U[0].ci, ["n1"]);
  assert.match(U[0].cim, /Nevermore/);
  assert.equal(U[0].hod, 15 + 8);
  assert.equal(U[0].dmg, 6 + 5);
  assert.equal(U[0].stav, "hotovo", "vypravěčův zápis se rovnou potvrdí");
});

/* ---------- Bless, Bane, Bardic Inspiration (2026-10-21): po hodu se nabídne jen to, co postava má ---------- */
const stavPri = async pri => S.ev(`kartaStavZmen("balduin", {pri: ${JSON.stringify(pri)}})`);

test("kostky k hodům: bez Bless/Bane/Bardic se po hodu nic nenabízí", async () => {
  await stavPri(null);
  assert.deepEqual(V(`kHodNabidka(KARTBY.balduin, "Útok", [])`), {bless: false, guid: false, bane: false, bard: null, st: 0, sd: null});
});

test("kostky k hodům: Bless se k útoku a záchraně přičte sám, po hodu se znovu nenabízí; k ověření nepatří", async () => {
  await stavPri(["Bless"]);
  try {
    const P = V(`kPriHod(KARTBY.balduin, "Záchrana WIS")`);
    assert.deepEqual(P.n, ["Bless"]);
    assert.ok(P.t >= 1 && P.t <= 4);
    assert.equal(V(`kHodNabidka(KARTBY.balduin, "Záchrana WIS", ["Bless"]).bless`), false, "už je v hodu");
    assert.equal(V(`kHodNabidka(KARTBY.balduin, "Záchrana WIS", []).bless`), true, "kdyby v hodu nebyl, nabídne se");
    assert.deepEqual(V(`kPriHod(KARTBY.balduin, "Ověření Athletics")`).n, [], "ověření Bless nepřičítá");
  } finally {
    await stavPri(null);
  }
});

test("kostky k hodům: Bardic Inspiration se nepřičte sama, nabídne se po hodu se správnou kostkou", async () => {
  await stavPri(["Bardic d8"]);
  try {
    assert.deepEqual(V(`kPriHod(KARTBY.balduin, "Útok")`).n, []);
    const N = V(`kHodNabidka(KARTBY.balduin, "Útok", [])`);
    assert.equal(N.bard, "Bardic d8");
    assert.equal(N.st, 8);
    await S.ev(`kBardSpotrebuj(KARTBY.balduin, "Bardic d8")`);
    assert.equal(V(`kartaStav("balduin").pri || null`), null, "po použití kostka zmizí");
  } finally {
    await stavPri(null);
  }
});

test("kostky k hodům: Bane od nepřítele v boji (značka na postavě) se odečte", () => {
  S.ev(`BOJ.s = {aktivni: true, kolo: 1, tah: 0, hraci: [{id: "h1", n: "Balduin", k: "balduin", ef: [{n: "Bane", od: "n1"}]}], npc: [], utoky: []}`);
  try {
    const P = V(`kPriHod(KARTBY.balduin, "Útok")`);
    assert.deepEqual(P.n, ["Bane"]);
    assert.ok(P.t <= -1 && P.t >= -4);
  } finally {
    S.ev(`BOJ.s = {}`);
  }
});

/* ---------- stavy a hody proti smrti postavy s kartou jsou jen na kartě, boj nese jejich obraz (2026-10-22) ---------- */
test("boj: stavy a hody proti smrti postavy s kartou se čtou z karty a zapisují na kartu", async () => {
  await S.ev(`kartaStavZmen("balduin", {stavy: ["sražen"], ds: {u: 1, n: 0}}, null, {bezZpet: true})`);
  try {
    const z = V(
      `bojPcNaplnit({aktivni: true, hraci: [{id: "h1", n: "Balduin", k: "balduin", kryt: 2}, {id: "h2", n: "Bez karty", stav: ["omráčen"]}]})`,
    );
    assert.deepEqual(z.hraci[0].stav, ["sražen"], "obraz stavů z karty");
    assert.deepEqual(z.hraci[0].ds, {u: 1, n: 0}, "obraz hodů proti smrti z karty");
    assert.deepEqual(z.hraci[1].stav, ["omráčen"], "postava bez karty má stavy dál v boji");
    assert.equal(z.hraci[1]._k, undefined);
    await S.ev(`(() => {
      const z = bojPcNaplnit({hraci: [{id: "h1", n: "Balduin", k: "balduin"}]});
      z.hraci[0].stav.push("otráven");
      delete z.hraci[0].ds;
      bojPcOdvod(z);
    })()`);
    assert.deepEqual(V(`kartaStav("balduin").stavy`), ["sražen", "otráven"], "změna v boji se zapíše na kartu");
    assert.equal(V(`kartaStav("balduin").ds || null`), null);
    const ul = V(`bojPcBez(bojPcNaplnit({hraci: [{id: "h1", n: "Balduin", k: "balduin", kryt: 2}, {id: "h2", n: "Bez karty", stav: ["omráčen"]}]}))`);
    assert.deepEqual(ul.hraci[0], {id: "h1", n: "Balduin", k: "balduin", kryt: 2}, "do databáze boje se obraz neuloží, kryt ano");
    assert.deepEqual(ul.hraci[1].stav, ["omráčen"]);
    assert.equal(
      V(`(() => (bojPcOdvod({hraci: [{id: "h1", n: "Balduin", k: "balduin"}]}), kartaStav("balduin").stavy.length))()`),
      2,
      "obnovený starší stav boje (bez obrazu) kartu nesmaže",
    );
  } finally {
    await S.ev(`kartaStavZmen("balduin", {stavy: null, ds: null}, null, {bezZpet: true})`);
  }
});

test("boj: starší boj se stavy v sobě je převede na kartu; s koncem boje zmizí stavy jen pro boj", async () => {
  try {
    assert.deepEqual(
      V(`(() => {
      const s = {hraci: [{id: "h1", n: "Balduin", k: "balduin", stav: ["vyděšen"], ds: {u: 0, n: 1}}]};
      return [bojPcPrevod(s), s.hraci[0].stav || null, s.hraci[0].ds || null];
    })()`),
      [true, null, null],
    );
    assert.deepEqual(V(`kartaStav("balduin").stavy`), ["vyděšen"]);
    assert.deepEqual(V(`kartaStav("balduin").ds`), {u: 0, n: 1});
    assert.deepEqual(
      V(`(() => {
      const z = {hraci: [{id: "h1", _k: 1, stav: ["zapřeno", "sražen", "paralyzovaný"], ef: [{n: "Hold Person", st: "paralyzovaný"}]}]};
      bojPcKonecBoje(z);
      return z.hraci[0].stav;
    })()`),
      ["sražen"],
      "stavy z vlastností zbraní a z účinků boje s bojem končí",
    );
  } finally {
    await S.ev(`kartaStavZmen("balduin", {stavy: null, ds: null}, null, {bezZpet: true})`);
  }
});

test("boj: bezvědomí (v bezvědomí) bere akce", () => {
  assert.equal(V(`bojNeschopny(["v bezvědomí"])`), "v bezvědomí");
});

/* ---------- protivníci (Vojta 2026-10-22): pacholek 5 HP s přetékáním, sok obětuje zbroj, slot navíc pro početnější stranu ---------- */
test("houf: pacholek má 5 HP, zranění přetéká na další", () => {
  assert.deepEqual(V(`bojHoufZasah({pocet: 6}, 12)`), {pad: 2, hz: 2, hz0: 0}, "12 zranění skolí dva, třetí raněn za 2");
  assert.deepEqual(V(`bojHoufZasah({pocet: 6, hz: 3}, 2)`), {pad: 1, hz: 0, hz0: 3}, "raněný za 3 padne po dalších 2");
  assert.deepEqual(V(`bojHoufZasah({pocet: 2}, 40)`), {pad: 2, hz: 0, hz0: 0}, "víc padlých, než je pacholků, nejde");
  assert.deepEqual(V(`bojHoufZasah({pocet: 4}, 3)`), {pad: 0, hz: 3, hz0: 0}, "malý zásah jen raní");
});

test("houf: plošné zranění zraní každého pacholka zvlášť", () => {
  S.kostky([
    [1, 20],
    [1, 20],
    [1, 20],
  ]);
  const r = V(`bojHoufZachrany({pocet: 3, hz: 2}, null, 4, "Fire", "DEX", 30, true, null, true)`);
  assert.equal(r.pad, 1, "4 zranění skolí jen raněného (2 + 4 ≥ 5), zdravé ne");
  assert.equal(r.hz, 0);
});

test("sok: zranění bez kritu z rozpisu kostek (při obětování zbroje)", () => {
  assert.equal(V(`bojDmgBezKritu({dmg: 11, zx: "2d8(3+5)+3"})`), 6);
  assert.equal(V(`bojDmgBezKritu({dmg: 20, zx: "2d8(3+5)+3 + 2d6(4+5) (Sneak Attack)"})`), 10);
  assert.equal(V(`bojDmgBezKritu({dmg: 9, zx: "9 (ručně)"})`), 9, "ručně zadané zranění zůstane");
});

test("iniciativa: početnější strana má o slot víc", () => {
  const sl = s => V(`bojSloty(${JSON.stringify(s)}).map(x => x.t).join("")`);
  const npc = (k, druh = "sok") => Array.from({length: k}, (_, i) => ({id: "n" + i, druh, pocet: 4}));
  assert.equal(sl({hraci: [{}, {}, {}], npc: npc(3), hod: 15, dm: 10}), "hnhnhn", "stejně: střídají se");
  assert.equal(sl({hraci: [{}, {}, {}], npc: npc(5), hod: 15, dm: 10}), "hnhnhnn", "nepřátel víc: o slot víc na konci");
  assert.equal(sl({hraci: [{}, {}, {}], npc: npc(1), hod: 8, dm: 10}), "nhnhh", "družiny víc: nepřátelé o slot méně");
  assert.equal(sl({hraci: [{}, {}], npc: [{id: "s", str: "h"}, ...npc(2)], hod: 15, dm: 10}), "hnhnh", "spojenec se počítá do družiny");
  assert.equal(sl({hraci: [{}, {}], npc: [...npc(2), {id: "x", druh: "sok", stav: ["poražen"]}], hod: 15, dm: 10}), "hnhn", "poražený se nepočítá");
  assert.equal(sl({hraci: [{}, {}], npc: npc(4), pocty: {h: 2, n: 2}, hod: 15, dm: 10}), "hnhn", "během kola platí počty z jeho začátku");
});

test("pojmy česky: zobrazený text se převede, pole formuláře ne", async () => {
  S.ev(
    `(()=>{const d=document.createElement("div");d.id="pojtest";d.innerHTML='<p>utrpí 2d6 Fire zranění</p><textarea>2d6 Fire zranění</textarea><p lang="en">Resistance to Fire</p>';document.body.appendChild(d)})()`,
  );
  await new Promise(r => setTimeout(r, 20));
  assert.equal(V(`document.querySelector("#pojtest p").textContent`), "utrpí 2d6 ohnivého zranění");
  assert.equal(V(`document.querySelector("#pojtest textarea").value`), "2d6 Fire zranění");
  assert.equal(V(`document.querySelector("#pojtest p[lang]").textContent`), "Resistance to Fire");
  S.ev(`document.getElementById("pojtest").remove()`);
});

test("Kronika › Traktáty: seznam, článek s obsahem oddílů a vypravěčská lišta odhalení", () => {
  const chyb = S.chyby.length;
  S.ev(`renderKronika("clanky")`);
  assert.equal(V(`document.getElementById("kclanky").hidden`), false);
  assert.ok(V(`document.querySelectorAll('#kclanky a.trcard[href="#kronika/clanky/kratke-dejiny"]').length`) === 1);
  S.ev(`renderKronika("clanky", "kratke-dejiny")`);
  assert.equal(V(`document.querySelector("#kclanky h2").textContent`), "Krátké dějiny země");
  assert.match(V(`document.querySelector("#kclanky .drlatin").textContent`), /^Sepsal Vojtěch z Kroměříže/);
  assert.ok(V(`document.querySelectorAll("#kclanky .trobsah [data-trsek]").length`) >= 8, "obsah oddílů");
  assert.ok(V(`document.querySelectorAll("#kclanky .trtext>h3").length`) >= 8);
  assert.ok(V(`!!document.querySelector('#kclanky .gmbar[data-gmid="kratke-dejiny"][data-gmkind="traktat"]')`), "vypravěč může odhalit");
  assert.deepEqual(S.chyby.slice(chyb), []);
});
