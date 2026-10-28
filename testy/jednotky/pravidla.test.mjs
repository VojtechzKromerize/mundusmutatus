// Rychlé testy pravidel postavy (18), stavů (SRDST), Artikulí zbroje a odolností v boji (12) a kritických zranění (11) – bez prohlížeče.
//   npm test   (nebo node --test testy/jednotky/)
// Stránka se načte jednou (jsdom, vypravěčská statická verze). Postavy jsou syntetické (karta(...)), aby test nezávisel na PDF.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
  S.ev("window.mmHlas = () => {}");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
/* syntetická karta: povolání „Fighter 5“, skóre vlastností, rysy podle názvu z PDF, vybavení */
const karta = o =>
  JSON.stringify(Object.assign({id: "t_" + Math.random().toString(36).slice(2, 8), n: "Zkouška", druh: "Human", vl: {}, rysy: [], vybaveni: []}, o));
const VL = {STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 16};

/* ---------- pravidla postavy (D&D 2024, SRD 5.2.1) ---------- */
test("pravidla: bonus zdatnosti roste každé čtyři úrovně (+2 až +6)", () => {
  assert.deepEqual(
    [1, 4, 5, 8, 9, 12, 13, 16, 17, 20].map(u => V(`kPB(${karta({povolani: "Fighter " + u, uroven: u})})`)),
    [2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
  );
});

test("pravidla: maximum životů = kostka 1. úrovně naplno + průměry + CON za úroveň; trpaslík +1 a Tough +2 za úroveň", () => {
  const w = V(`kHodn(${karta({povolani: "Wizard 5", uroven: 5, druh: "Dwarf", vl: {CON: 14}})}, "hp")`);
  assert.equal(w.v, 6 + 4 * 4 + 2 * 5 + 5, "d6 max 6 + 4× průměr 4 + CON +2 × 5 + Dwarven Toughness 5");
  assert.ok(w.L.some(([n]) => n === "Dwarven Toughness"));
  const f = V(`kHodn(${karta({povolani: "Fighter 7", uroven: 7, vl: {CON: 14}, rysy: ["Tough"]})}, "hp")`);
  assert.equal(f.v, 10 + 6 * 6 + 2 * 7 + 2 * 7);
});

test("pravidla: sloty kouzel – plný sesilatel, poloviční zaokrouhlený nahoru sám, dolů ve víc povoláních; pakt černokněžníka", () => {
  const st = L => L.map(q => [q.st, q.max, q.pakt]);
  assert.deepEqual(st(V(`kSlotyMax(${karta({povolani: "Wizard 5", uroven: 5})})`)), [
    [1, 4, false],
    [2, 3, false],
    [3, 2, false],
  ]);
  assert.deepEqual(st(V(`kSlotyMax(${karta({povolani: "Paladin 3", uroven: 3})})`)), [[1, 3, false]], "Paladin 3 sám = sesilatel 2. úrovně");
  assert.deepEqual(
    st(V(`kSlotyMax(${karta({povolani: "Paladin 2 / Wizard 3", uroven: 5})})`)),
    [
      [1, 4, false],
      [2, 3, false],
    ],
    "multiclass: 2/2 zaokrouhleno dolů + 3 = 4. úroveň sesilatele",
  );
  assert.deepEqual(st(V(`kSlotyMax(${karta({povolani: "Warlock 5", uroven: 5})})`)), [[3, 2, true]], "pakt: 2 sloty 3. stupně");
});

test("pravidla: AC – zbroj + DEX s omezením + štít; těžká zbroj bez DEX; Unarmored Defense mnicha 10 + DEX + WIS", () => {
  const b = V(`kACR(${karta({povolani: "Barbarian 5", uroven: 5, vl: VL, vybaveni: [{n: "Shield"}, {n: "Chain Shirt"}]})})`);
  assert.equal(b.ac, 13 + 2 + 2);
  assert.equal(b.N.z.dr, "Kroužková", "druh zbroje podle Artikulí");
  assert.equal(V(`kACR(${karta({povolani: "Paladin 6", uroven: 6, vl: VL, vybaveni: [{n: "Plate Armor"}]})}).ac`), 18, "Plate bez DEX");
  assert.equal(V(`kACR(${karta({povolani: "Monk 6", uroven: 6, vl: {DEX: 16, WIS: 16}})}).ac`), 10 + 3 + 3);
  assert.equal(V(`kZbrInfo({n: "Shield +1"}).ac`), 3, "magický štít +1");
  assert.equal(V(`kZbrInfo({n: "Plate Armor +2"}).ac`), 20);
  assert.equal(V(`kZbrInfo({n: "Cloak of Protection"})`), null, "plášť není zbroj");
});

test("pravidla: nosí se zbroj s nejvyšší AC; obl: false odloží, obl: true má přednost", () => {
  const n1 = V(`kNoseno([{n: "Chain Shirt"}, {n: "Breastplate", obl: false}, {n: "Shield"}])`);
  assert.equal(n1.z.n, "Chain Shirt");
  assert.equal(n1.s.n, "Shield");
  assert.equal(V(`kNoseno([{n: "Chain Shirt", obl: true}, {n: "Breastplate"}]).z.n`), "Chain Shirt", "výslovně oblečená vyhrává nad lepší odloženou");
});

test("pravidla: záchrany – zdatnost, Aura of Protection paladina (CHA ke všem); Jack of All Trades půl zdatnosti k ověření a iniciativě", () => {
  const p = V(`kHodn(${karta({povolani: "Paladin 6", uroven: 6, vl: VL, zachProf: ["WIS", "CHA"]})}, "zach", "STR")`);
  assert.equal(p.v, 3 + 3, "STR +3 + Aura of Protection +3 (CHA)");
  assert.ok(p.L.some(([n]) => n === "Aura of Protection"));
  const bard = karta({povolani: "Bard 3", uroven: 3, vl: {DEX: 14, CHA: 16}});
  assert.deepEqual(V(`kHodn(${bard}, "dov", "Athletics").L`), [["Jack of All Trades", 1]]);
  assert.equal(V(`kHodn(${bard}, "ini").v`), 2 + 1);
});

test("pravidla: rychlost – Fast Movement barbara +10, Unarmored Movement mnicha +15 (6. úroveň); feat Speedy +10", () => {
  assert.equal(V(`kHodn(${karta({povolani: "Barbarian 5", uroven: 5})}, "rych").v`), 40);
  assert.equal(V(`kHodn(${karta({povolani: "Monk 6", uroven: 6, druh: "Elf"})}, "rych").v`), 45);
  assert.equal(V(`kHodn(${karta({povolani: "Fighter 7", uroven: 7, rysy: ["Speedy"]})}, "rych").v`), 40);
});

test("pravidla: počty použití – Rage podle úrovně, Bardic Inspiration = CHA, Lucky z PDF se přepočte na bonus zdatnosti", () => {
  const z = (o, n) => (V(`kZdroje(${karta(o)})`).find(q => q.n === n) || {}).max;
  assert.equal(z({povolani: "Barbarian 5", uroven: 5}, "Rage"), 3);
  assert.equal(z({povolani: "Bard 3", uroven: 3, vl: {CHA: 16}}, "Bardic Inspiration"), 3);
  assert.equal(z({povolani: "Rogue 5", uroven: 5, rysy: ["Lucky"], zdroje: [{n: "Lucky", max: 1}]}, "Lucky"), 3);
});

test("pravidla: rysy mimo SRD – Combat Superiority (kostky převahy podle úrovně), Dread Ambusher k iniciativě, Eldritch Knight sesílá z INT", () => {
  const bm = V(`kZdroje(${karta({povolani: "Fighter 7", uroven: 7, rysy: ["Combat Superiority", "Battle Master"]})})`).find(
    q => q.n === "Combat Superiority",
  );
  assert.equal(bm.max, 5, "Battle Master 7: 5 kostek");
  assert.match(bm.obn, /kostka d8/);
  const gs = V(`kHodn(${karta({povolani: "Ranger 5", uroven: 5, vl: {DEX: 16, WIS: 14}, rysy: ["Dread Ambusher", "Gloom Stalker"]})}, "ini")`);
  assert.deepEqual(gs.L, [
    ["DEX", 3],
    ["Dread Ambusher", 2],
  ]);
  const ek = karta({povolani: "Fighter 7", uroven: 7, vl: {INT: 14}, rysy: ["Eldritch Knight", "War Magic"]});
  assert.equal(V(`kSpAb(${ek})`), "INT");
  assert.deepEqual(
    V(`kSlotyMax(${ek})`).map(q => q.max),
    [4, 2],
    "Fighter 7 / 3 = sesilatel 3. úrovně (zaokrouhleno nahoru, jediné povolání)",
  );
});

test("pravidla: zbraň podle názvu (i česky) – kostka, typ, vlastnosti; munice není zbraň", () => {
  const d = V(`kZbranInfo("Dýka")`);
  assert.equal(d[1], "Dagger");
  assert.equal(d[2], "1d4");
  assert.match(d[4], /Finesse/);
  assert.equal(V(`kZbranInfo("Longsword +1")[2]`), "1d8");
  assert.equal(V(`kZbranInfo("Arrows (20)")`), null);
});

/* ---------- Artikule: Výdrž (Šerm a zápas) ---------- */
test("Artikule: Výdrž má jen bojové povolání – Fighter bonus zdatnosti, Barbarian polovina nahoru, kouzelník nic", () => {
  assert.equal(V(`kVydMax(${karta({povolani: "Fighter 9", uroven: 9})})`), 4);
  assert.equal(V(`kVydMax(${karta({povolani: "Barbarian 5", uroven: 5})})`), 2);
  assert.equal(V(`kVydMax(${karta({povolani: "Wizard 5", uroven: 5})})`), 0);
  assert.equal(V(`kVydMax(KARTBY.balduin)`), 0, "hlavní povolání Warlock – bez Výdrže");
});

/* ---------- stavy postavy (SRD) a vyčerpání ---------- */
const stavy = async L => S.ev(`kartaStavZmen("balduin", {stavy: ${JSON.stringify(L)}}, null, {bezZpet: true})`);

test("stavy: Sražen a Otráven dávají nevýhodu na útok, Otráven i na ověření; Spoután nevýhodu na záchranu DEX", async () => {
  await stavy(["sražen", "otráven"]);
  try {
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Útok").r`), [
      [-1, "sražen"],
      [-1, "otráven"],
    ]);
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Ověření Athletics").r`), [[-1, "otráven"]]);
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Záchrana DEX").r`), [], "Sražen záchranu nemění");
    await stavy(["spoután"]);
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Záchrana DEX").r`), [[-1, "spoután"]]);
  } finally {
    await stavy(null);
  }
});

test("stavy: Paralyzovaný – rychlost 0, záchrany STR a DEX automaticky selžou, nemůže jednat", async () => {
  await stavy(["paralyzovaný"]);
  try {
    assert.equal(V(`kRychN(KARTBY.balduin)`), 0);
    assert.equal(V(`kStavVliv(KARTBY.balduin, "Záchrana STR").fail`), true);
    assert.equal(V(`kStavVliv(KARTBY.balduin, "Záchrana WIS").fail`), false);
    assert.equal(V(`kNeschopny(KARTBY.balduin)`), "paralyzovaný");
    assert.equal(V(`srdNejedna(["omráčen"])`), true);
    assert.equal(V(`srdNejedna(["sražen"])`), false);
  } finally {
    await stavy(null);
  }
});

test("stavy: vyčerpání snižuje rychlost o 5 stop za úroveň", async () => {
  await S.ev(`kartaStavZmen("balduin", {vycerp: 3}, null, {bezZpet: true})`);
  try {
    assert.equal(V(`kRychN(KARTBY.balduin)`), 30 - 15);
  } finally {
    await S.ev(`kartaStavZmen("balduin", {vycerp: null}, null, {bezZpet: true})`);
  }
});

test("stavy: návrh výhody v boji – sražený cíl zblízka výhoda, z dálky nevýhoda; ochromený zblízka = kritický zásah; obojí se ruší", () => {
  const adv = (st, ct, dal) =>
    V(`(() => { const p = [], m = []; const k5 = srdAdv(${JSON.stringify(st)}, ${JSON.stringify(ct)}, ${dal}, p, m); return [p, m, k5]; })()`);
  assert.deepEqual(adv([], ["sražen"], false), [["cíl sražen, útok zblízka"], [], false]);
  assert.deepEqual(adv([], ["sražen"], true), [[], ["cíl sražen, útok z dálky"], false]);
  assert.deepEqual(adv(["otráven"], ["paralyzovaný"], false), [["cíl paralyzovaný"], ["útočník otráven"], true]);
  assert.equal(adv([], ["paralyzovaný"], true)[2], false, "z dálky kritický zásah není");
  const s = {
    npc: [
      {id: "n1", b: "x", stav: []},
      {id: "n2", b: "x", stav: ["spoután"], kryt: 2},
    ],
    hraci: [],
  };
  try {
    S.ev(`BCIL.n1 = "n2"`);
    const n = V(`bojAdvNavrh(${JSON.stringify(s)}, {id: "n1", stav: []}, {n: "Kousnutí", p: "dosah 5 stop"})`);
    assert.equal(n.v, 1);
    assert.equal(n.kryt, 2, "kryt cíle se předá k AC");
    const r = V(`bojAdvNavrh(${JSON.stringify(s)}, {id: "n1", stav: ["otráven"]}, {n: "Kousnutí", p: "dosah 5 stop"})`);
    assert.equal(r.v, 0);
    assert.match(r.why[0], /ruší/);
  } finally {
    S.ev(`delete BCIL.n1`);
  }
  assert.equal(V(`kAdvSum(1, [[-1, "x"]])`), 0, "výhoda a nevýhoda se ruší");
  assert.equal(V(`kAdvSum(0, [[1, "a"], [1, "b"]])`), 1);
});

/* ---------- Artikule: zbroj v boji – Resistance, obětování, Drtivá a Průrazná ---------- */
test("Artikule: druh zbroje z popisu AC statbloku", () => {
  assert.deepEqual(V(`bikZbDruhy("kroužková košile, štít")`), ["Kroužková", "Štít"]);
  assert.deepEqual(V(`bikZbDruhy("plná zbroj")`), ["Komplexní"]);
  assert.deepEqual(V(`bikZbDruhy("kyrys a pavéza")`), ["Plátová", "Štít"]);
  assert.deepEqual(V(`bikZbDruhy("přirozená zbroj")`), [], "přirozená zbroj se neobětuje a nedává Resistance");
});

test("pojmy: Obratnost je DEX – starší data s AGI se při čtení převedou (mmDex)", () => {
  const K = JSON.parse(
    V(
      `mmDex(${JSON.stringify(JSON.stringify({id: "t_agi", n: "Stará", druh: "Human", povolani: "Rogue 3", uroven: 3, vl: {STR: 10, AGI: 16}, zachProf: ["AGI"], rysy: [], vybaveni: []}))})`,
    ),
  );
  assert.deepEqual(K.vl, {STR: 10, DEX: 16});
  assert.deepEqual(K.zachProf, ["DEX"]);
  assert.equal(V(`kMod(kVl(${JSON.stringify(K)}, "DEX"))`), 3);
  assert.equal(V(`mmDex("STRAGIL a AGI DC 15")`), "STRAGIL a DEX DC 15", "jen celé slovo AGI");
});

test("stavy podle Vojty (2026-10-24): paralyzovaný, spoután, vyděšen, otráven – starší názvy v datech se při čtení převedou", () => {
  const S = JSON.parse(
    V(`mmDex(${JSON.stringify(JSON.stringify({stavy: ["ochromen", "zadržen", "vyděšený", "otrávený", "sražen"], t: "je zadržen"}))})`),
  );
  assert.deepEqual(S.stavy, ["paralyzovaný", "spoután", "vyděšen", "otráven", "sražen"]);
  assert.equal(S.t, "je zadržen", "souvislý text se nemění, jen celé hodnoty");
  for (const k of ["paralyzovaný", "spoután", "vyděšen", "otráven", "chycen", "omráčen"]) assert.ok(V(`!!SRDST[${JSON.stringify(k)}]`), k);
  assert.equal(V(`SRDST["paralyzovaný"].en`), "Paralyzed");
  assert.equal(V(`SRDST["omráčen"].en`), "Stunned");
});

test("Artikule › featy: Martial Adept dává +1 Výdrž i kouzelníkovi; Mistr těžké zbroje +1 obětování jen těžké zbroje", () => {
  assert.equal(V(`kVydMax(${karta({povolani: "Wizard 5", uroven: 5, rysy: ["Martial Adept"]})})`), 1);
  assert.equal(V(`kVydMax(${karta({povolani: "Fighter 9", uroven: 9, rysy: ["Martial Adept"]})})`), 5);
  const pl = r => V(`kZbrU(${karta({povolani: "Paladin 6", uroven: 6, vl: VL, rysy: r, vybaveni: [{n: "Plate Armor"}]})}).z.max`);
  assert.equal(pl([]), 3, "komplexní zbroj 3×");
  assert.equal(pl(["Heavy Armor Master"]), 4, "s Mistrem těžké zbroje 4×");
  const ks = V(`kZbrU(${karta({povolani: "Paladin 6", uroven: 6, vl: VL, rysy: ["Heavy Armor Master"], vybaveni: [{n: "Chain Shirt"}]})}).z.max`);
  assert.equal(ks, 2, "kroužková košile je střední zbroj – bez navýšení");
});

test("Artikule › kouzla a předměty: adamantinová a mizziová zbroj snese o 2 obětování víc", () => {
  const z = n => V(`kZbrU(${karta({povolani: "Fighter 5", uroven: 5, vl: VL, rysy: [], vybaveni: [{n}]})}).z.max`);
  assert.equal(z("Chain Mail"), 2, "kroužková zbroj 2×");
  assert.equal(z("Adamantine Chain Mail"), 4, "adamantinová kroužková 4×");
  assert.equal(z("Mizzium Breastplate"), 5, "mizziový kyrys (plátová) 5×");
});

test("plné znění kouzel a předmětů: rozbalovací blok jen přihlášeným, text s rámečkem Artikule a vyšším stupněm", () => {
  assert.equal(V(`plneTag("kouzla", "Fireball")`), "", "nepřihlášený nic nevidí");
  const h = V(
    `plneTelo("kouzla", {en: "Cure Wounds", l: 1, s: "Ochranná magie", ct: "Akce", r: "Dotyk", k: "V, S", d: "Okamžité", t: "Tvor si obnoví 2k8.\\n\\n> **Artikule – Léčení na 0 HP.** Jen stabilizuje.", v: "Použití pozice kouzla vyššího stupně. Léčení se zvýší o 2k8."})`,
  );
  assert.match(h, /Kouzlo 1\. stupně · Ochranná magie · Akce/);
  assert.match(h, /class="srdart"><b>Artikule<\/b> <b>Léčení na 0 HP\.<\/b>/);
  assert.match(h, /<b>Použití pozice kouzla vyššího stupně\.<\/b> Léčení/);
  assert.match(V(`plneTelo("predmety", null)`), /není/);
  const f = V(
    `(PLNEF.kouzla.q = "ohniv", plneFiltr("kouzla", [{en: "Fireball", cz: "Ohnivá koule", l: 3}, {en: "Shield", cz: "Štít", l: 1}]).map(x => x.en).join())`,
  );
  assert.equal(f, "Fireball", "hledání bez diakritiky i v českém názvu");
});

test("předměty z plného znění: hledání v inventáři, váha z tabulky, návrh hráče přidá věc na kartu, popis věci z tabulky", async () => {
  assert.equal(V(`kLbPlne("1/2 lb.")`), 0.5);
  assert.equal(V(`kLbPlne("2,5 lb.")`), 2.5);
  assert.equal(V(`kLbPlne("—")`), 0);
  S.ev(`window.__mm0 = window.MMDB; window.MMDB = {pravidlaTexty() {}, prihlasen: () => true}; PLNES.predmety = [
    {id: "bag of tricks", en: "Bag of Tricks", cz: "Vak triků", typ: "Divotvorný předmět", vz: "neobvyklá", w: "1/2 lb."},
    {id: "longsword", en: "Longsword", cz: "Dlouhý meč", typ: "Zbraň", vz: "", w: "3 lb."}]`);
  try {
    const nove = V(`kInvPlne(KARTBY.balduin, "trik", "", new Set()).map(x => x.en)`);
    assert.deepEqual(nove, ["Bag of Tricks"], "hledá i v českém názvu");
    assert.deepEqual(V(`kInvPlne(KARTBY.balduin, "", "div", new Set()).map(x => x.en)`), ["Bag of Tricks"], "druh podle typu z tabulky");
    assert.deepEqual(V(`kInvPlne(KARTBY.balduin, "sword", "", new Set(["longsword"])).length`), 0, "co zná katalog, se neopakuje");
    assert.equal(V(`plneVec("Bag of Tricks").id`), "bag of tricks");
    assert.match(
      V(`kVecPopis({n: "Bag of Tricks", q: 1}, null, null)`),
      /Divotvorný předmět, neobvyklá[\s\S]*data-plne="predmety" data-plnen="bag of tricks"/,
    );
    await S.ev(`navrhProved({data: {typ: "vec", pl: "bag of tricks", n: "Bag of Tricks", w: 0.5, q: 2, cil: "balduin"}})`);
    const it = V(`kartaStav("balduin").inv.find(x => x.n === "Bag of Tricks")`);
    assert.equal(it.q, 2);
    assert.equal(it.w, "1 lb.", "váha za kus × počet");
  } finally {
    S.ev(`window.MMDB = window.__mm0; delete PLNES.predmety`);
  }
});

test("featy na kartě: okno rysu ukáže přihlášenému plné znění featu i s rámečkem Artikule (podle anglického i českého jména)", () => {
  S.ev(`window.__mm0 = window.MMDB; window.MMDB = {pravidlaTexty() {}, prihlasen: () => true};
    FEATY = [{en: "Alert", cz: "Ostražitý", kat: "origin", pred: "", t: "Úvod.\\n\\n> **Artikule – Pohotovost.** Jednou za boj."}]`);
  try {
    assert.match(V(`kRysPopis(KARTBY.balduin, "Alert")`), /Plné znění featu[\s\S]*Artikule<\/b> <b>Pohotovost/);
    assert.match(V(`kRysPopis(KARTBY.balduin, "Ostražitý")`), /Plné znění featu/);
    assert.doesNotMatch(V(`kRysPopis(KARTBY.balduin, "Second Wind")`), /Plné znění featu/);
  } finally {
    S.ev(`window.MMDB = window.__mm0; FEATY = null`);
  }
  assert.doesNotMatch(V(`kRysPopis(KARTBY.balduin, "Alert")`), /Plné znění featu/, "nepřihlášený plné znění nevidí");
});

test("kouzla z Vojtovy tabulky, která SRD ani katalog nezná: karta je pozná podle jména, bez textu (text je v plném znění)", () => {
  const x = V(`kSp("Aura of Evasion")`);
  assert.equal(x.l, 7);
  assert.equal(x.dop, 1);
  assert.equal(x.t, "");
  assert.equal(V(`kSp("Summon Dinosaur").cz`), "Přivolání dinosaura");
  assert.match(V(`kzKarta(kSp("Wail of the Banshee"), false)`), /Popis kouzla uvidíš po přihlášení/);
});

test("featy: plné znění – rámeček Artikule, tabulka, podnadpis a escapování HTML", () => {
  const h = V(
    `featyMd("Úvod <script>x</script>\\n\\n> **Artikule – Pohotovost.** Jednou za boj.\\n\\n## Tabulka\\n\\n| **k4** | **Výboj** |\\n|---|---|\\n| 1 | **Vztek.** Útok |")`,
  );
  assert.match(h, /&lt;script&gt;/);
  assert.doesNotMatch(h, /<script>/);
  assert.match(h, /<div class="srdart"><b>Artikule<\/b> <b>Pohotovost\.<\/b> Jednou za boj\.<\/div>/);
  assert.match(h, /<h5>Tabulka<\/h5>/);
  assert.match(h, /<th>k4<\/th><th>Výboj<\/th>/);
  assert.match(h, /<td>1<\/td><td><b>Vztek\.<\/b> Útok<\/td>/);
  assert.doesNotMatch(h, /---/);
});

test("povolání mimo SRD (Střelec): rysy ###, odrážky, rámeček Artikule s poznámkou; bez přihlášení jen shrnutí", () => {
  const h = V(
    `featyMd("### Úroveň 2: Risk (Štěstěna)\\n\\n- **Prokoukl.** Poloviční.\\n- **Neprokoukl.** Platí.\\n\\n> **Artikule – Zbraně.** Válečné.\\n>\\n> *Poznámka:* vycpávaná.\\n\\n> *Poznámka:* sloty.")`,
  );
  assert.match(h, /<h6 class="fmd3">Úroveň 2: Risk \(Štěstěna\)<\/h6>/);
  assert.match(h, /<ul><li><b>Prokoukl\.<\/b> Poloviční\.<\/li><li><b>Neprokoukl\.<\/b> Platí\.<\/li><\/ul>/);
  assert.match(h, /<div class="srdart"><b>Artikule<\/b> <b>Zbraně\.<\/b> Válečné\.<br><i>Poznámka:<\/i> vycpávaná\.<\/div>/);
  assert.match(h, /<p class="rsmall"><i>Poznámka:<\/i> sloty\.<\/p>/);
  const s = V(`povolHtml()`);
  assert.match(s, /id="mimo-gunslinger"/);
  assert.match(s, /uvidíš po přihlášení/);
  assert.ok(
    V(`POVOLSHR`).every(p => p.t.length <= 350),
    "shrnutí mimo SRD max. 350 znaků",
  );
});

test("Artikule: Resistance zbroje půlí zranění; Drtivá / Průrazná ji ignorují; Immunity 0, Vulnerability ×2", () => {
  const E = JSON.stringify({ac: "16 (kroužková zbroj)", p: {b: ""}});
  assert.deepEqual(V(`bojZasah(${E}, 10, "Slashing", {})`), {x: 5, pozn: ["Resistance zbroje"]});
  assert.deepEqual(V(`bojZasah(${E}, 10, "Bludgeoning", {drt: true})`), {x: 10, pozn: ["Drtivá ignoruje zbroj"]});
  assert.deepEqual(V(`bojZasah(${E}, 10, "Piercing", {})`), {x: 10, pozn: []}, "kroužková proti Piercing nechrání");
  const P = JSON.stringify({ac: "12", p: {b: "Imunita: Poison; Zranitelnost: Fire"}});
  assert.deepEqual(V(`bojZasah(${P}, 10, "Poison", {})`), {x: 0, pozn: ["Immunity"]});
  assert.deepEqual(V(`bojZasah(${P}, 10, "Fire", {})`), {x: 20, pozn: ["Vulnerability"]});
  assert.equal(V(`bojZasah({ac: "12", p: {b: ""}}, 11, "Cold", {st: ["zkamenělý"]}).x`), 5, "zkamenělý: Resistance vůči všemu");
});

test("Artikule: obětování zbroje – kroužková 2×, štít 1×; vyčerpaný štít −2 AC, vyčerpaná zbroj = AC bez zbroje", () => {
  const E = JSON.stringify({ac: "16 (kroužková zbroj, štít)", p: {b: ""}});
  const z0 = V(`bojZbrStav({zbrU: {}}, ${E})`);
  assert.deepEqual(
    z0.d.map(x => [x.k, x.max]),
    [
      ["Kroužková", 2],
      ["Štít", 1],
    ],
  );
  assert.equal(z0.ac, 16);
  assert.equal(V(`bojZbrStav({zbrU: {"Štít": 1}}, ${E}).ac`), 14);
  const z2 = V(`bojZbrStav({zbrU: {"Kroužková": 2}}, ${E})`);
  assert.equal(z2.ac, 10 + 0 + 2, "bez zbroje 10 + DEX (neznámá 0) + štít 2");
  assert.match(z2.pr[0], /vyčerpána/);
});

test("Artikule: Půlmeč – kostka zranění o stupeň níž, Piercing s Průraznou", () => {
  assert.equal(V(`bojZvKostkaNiz("1d8+3")`), "1d6+3");
  assert.equal(V(`bojZvKostkaNiz("1d4")`), "1d4", "d4 už neklesá");
  const p = V(`bojUtokPriprav({E: [], w: {n: "Longsword", b: 5, z: "1d8+3", t: "Slashing"}, ac: 10, pm: true, ruc: {d20: 10, dmg: 4}})`);
  assert.equal(p.wt, "Piercing");
  assert.equal(p.wpru, true);
  assert.equal(p.dz.z, "1d6+3");
});

/* ---------- Artikule: kritická zranění (Rány) ---------- */
const krit = (druh, rany, pod, kostky) => {
  S.kostky(kostky);
  return V(`(() => { Object.assign(BKS, {druh: ${JSON.stringify(druh)}, rany: ${rany}, pod: ${pod}}); bojKritHod(); return BKS.last; })()`);
};

test("Artikule: kritické zranění – d10 + neléčená zranění + 1 za 5 HP pod nulou určí závažnost, Závoj d6 místo na těle", () => {
  assert.equal(
    krit("fyz", 0, 0, [
      [3, 10],
      [6, 6],
    ]).t,
    "Lehká (Hlava): Zvonění v hlavě – bez Reakce, nevýhoda na příští hod",
  );
  assert.equal(
    krit("fyz", 2, 12, [
      [3, 10],
      [1, 6],
    ]).t,
    "Těžká (Nohy): Zlomená noha – poloviční pohyb",
    "3 + 2 neléčená + 2 (12 HP pod nulou) = 7 → Těžká",
  );
  assert.equal(
    krit("ohen", 0, 0, [[10, 10]]).t,
    "Vážná: Vypálené oči – nevýhoda na Perception a útoky na dálku",
    "magické zranění bez místa na těle",
  );
  assert.equal(krit("mraz", 1, 20, [[10, 10]]).t, "Smrtelná: Zamrzlé srdce", "10 + 1 + 4 = 15 → Smrtelná");
});

test("Artikule: typ zranění → druh kritického zranění (Force a Thunder jako fyzické)", () => {
  assert.deepEqual(
    ["Slashing", "Force", "Thunder", "Fire", "Lightning", "Cold", "Acid", "Poison", "Radiant", "Necrotic", "Psychic"].map(t =>
      V(`bojKritDruh(${JSON.stringify(t)})`),
    ),
    ["fyz", "fyz", "fyz", "ohen", "ohen", "mraz", "jed", "jed", "svata", "svata", "psych"],
  );
  assert.equal(V(`bojKritDruh("Svaté (Radiant)")`), "svata", "česky s anglickým názvem v závorce");
});

/* ---------- podtřídy hráčů (2026-10-22): Doména míru, Cesta horlivce, Reliktní poutník, Věštec, Mistr boje ---------- */
/* syntetická karta zapsaná do KARTBY (kartaStavZmen, kPri a spol. ji pak najdou); vrátí id */
const kartaReg = o => {
  const id = "t_" + Math.random().toString(36).slice(2, 8);
  S.ev(`KARTBY[${JSON.stringify(id)}] = ${karta(Object.assign({id}, o))}`);
  return id;
};
const Kid = id => `KARTBY[${JSON.stringify(id)}]`;

test("podtřídy: Doména míru – Emboldening Bond = bonus zdatnosti použití, Balm of Peace jako Channel Divinity, Otherworldly Glamour přičítá WIS k ověřením CHA", () => {
  const z = V(`kZdroje(${karta({povolani: "Cleric 5", uroven: 5, vl: {WIS: 16}, rysy: ["Peace Domain", "Emboldening Bond", "Balm of Peace"]})})`);
  assert.equal(z.find(q => q.n === "Emboldening Bond").max, 3, "Cleric 5: bonus zdatnosti 3");
  assert.ok(!z.some(q => q.n === "Balm of Peace"), "Balm of Peace čerpá Channel Divinity, není samostatný zdroj");
  assert.equal(z.find(q => q.n === "Channel Divinity").max, 2);
  const fw = karta({povolani: "Ranger 5", uroven: 5, vl: {WIS: 16, CHA: 10}, rysy: ["Fey Wanderer", "Otherworldly Glamour", "Dreadful Strikes"]});
  assert.equal(V(`kOvB(${fw}, "CHA")`), 3, "CHA 0 + WIS 3");
  const pe = V(`kHodn(${fw}, "dov", "Persuasion")`);
  assert.equal(pe.v, 3);
  assert.ok(
    pe.L.some(([n, v]) => n === "Otherworldly Glamour" && v === 3),
    "v rozpisu dovednosti",
  );
  assert.equal(V(`kOvB(${fw}, "WIS")`), 3, "jen ověření CHA");
  const fw2 = karta({povolani: "Ranger 3", uroven: 3, vl: {WIS: 8, CHA: 10}, rysy: ["Fey Wanderer", "Otherworldly Glamour"]});
  assert.equal(V(`kOvB(${fw2}, "CHA")`), 1, "WIS −1 → nejméně +1");
});

test("podtřídy: Cesta horlivce – Warrior of the Gods zásoba d12 podle úrovně; Věštec – Portent 2 hody, od 14. úrovně 3", () => {
  const z = (o, n) => V(`kZdroje(${karta(o)})`).find(q => q.n === n);
  const w3 = z({povolani: "Barbarian 3", uroven: 3, rysy: ["Path of the Zealot", "Warrior of the Gods"]}, "Warrior of the Gods");
  assert.equal(w3.max, 4);
  assert.match(w3.obn, /kostka d12/);
  assert.equal(z({povolani: "Barbarian 12", uroven: 12, rysy: ["Path of the Zealot", "Warrior of the Gods"]}, "Warrior of the Gods").max, 6);
  assert.equal(z({povolani: "Wizard 3", uroven: 3, rysy: ["Diviner", "Portent"]}, "Portent").max, 2);
  assert.equal(z({povolani: "Wizard 14", uroven: 14, rysy: ["Diviner", "Portent", "Greater Portent"]}, "Portent").max, 3);
});

test("podtřídy: přídavky k zásahu – Dreadful Strikes 1d4 (od 11. úrovně 1d6) jednou za tah, Divine Fury jen v zuřivosti (1d6 + polovina úrovně, Radiant nebo Necrotic)", async () => {
  const rid = (id, O) =>
    V(`bojJaRidery(${Kid(id)}, {id: "h1"}, {n: "Longsword", z: "1d8", b: 5}, {vys: "zásah"}, {kolo: 1, tah: 0}, ${JSON.stringify(O || {})})`);
  const r5 = kartaReg({povolani: "Ranger 5", uroven: 5, rysy: ["Fey Wanderer", "Dreadful Strikes"]}),
    r11 = kartaReg({povolani: "Ranger 11", uroven: 11, rysy: ["Fey Wanderer", "Dreadful Strikes"]});
  assert.equal(rid(r5).find(r => r.g === "dr").zr, "1d4");
  assert.equal(rid(r11).find(r => r.g === "dr").zr, "1d6");
  assert.ok(!rid(r5, {ridT: {k: "1:0", jt: ["dr"]}}).some(r => r.g === "dr"), "už použito v tomto tahu");
  const b5 = kartaReg({povolani: "Barbarian 5", uroven: 5, rysy: ["Path of the Zealot", "Divine Fury"]});
  assert.ok(!rid(b5).some(r => r.g === "df"), "bez zuřivosti se nenabízí");
  await S.ev(`kartaStavZmen(${JSON.stringify(b5)}, {pri: ["Rage"]})`);
  const df = rid(b5).filter(r => r.g === "df");
  assert.deepEqual(
    df.map(r => [r.n, r.zr]),
    [
      ["Divine Fury (Radiant)", "1d6+2"],
      ["Divine Fury (Necrotic)", "1d6+2"],
    ],
  );
  assert.ok(!rid(kartaReg({povolani: "Fighter 5", uroven: 5})).some(r => /^(dr|df)$/.test(r.g)), "cizí povolání nic");
});

test("podtřídy: Emboldening Bond +1d4 se přičte k útoku, záchraně i ověření, ale jen k prvnímu útoku v tahu", async () => {
  const id = kartaReg({povolani: "Fighter 5", uroven: 5});
  await S.ev(`kartaStavZmen(${JSON.stringify(id)}, {pri: ["Emboldening Bond"]})`);
  S.kostky([
    [3, 4],
    [4, 4],
    [2, 4],
  ]);
  assert.deepEqual(V(`kPriHod(${Kid(id)}, "Útok")`), {t: 3, txt: " +3 Emboldening Bond", n: ["Emboldening Bond"]});
  assert.equal(V(`kPriHod(${Kid(id)}, "Záchrana WIS")`).t, 4);
  assert.equal(V(`kPriHod(${Kid(id)}, "Persuasion")`).t, 2);
  assert.deepEqual(V(`kPriHod(${Kid(id)}, "Útok", true)`), {t: 0, txt: "", n: []}, "druhý útok v tahu bez kostky");
});

test("podtřídy: Mistr boje – Commanding Presence k Persuasion, Tactical Assessment k Insight, k Athletics nic; kostka podle úrovně", () => {
  const bm = karta({povolani: "Fighter 10", uroven: 10, rysy: ["Battle Master", "Combat Superiority", "Commanding Presence", "Tactical Assessment"]});
  assert.deepEqual(V(`kHodNabidka(${bm}, "Persuasion", []).sd`), {n: "Commanding Presence", k: "d10", zb: 5});
  assert.equal(V(`kHodNabidka(${bm}, "Insight", []).sd.n`), "Tactical Assessment");
  assert.equal(V(`kHodNabidka(${bm}, "Athletics", []).sd`), null);
  assert.equal(V(`kHodNabidka(${bm}, "Persuasion", ["sd"]).sd`), null, "po použití se znovu nenabízí");
  const jen = karta({povolani: "Fighter 10", uroven: 10, rysy: ["Battle Master", "Combat Superiority", "Trip Attack"]});
  assert.equal(V(`kHodNabidka(${jen}, "Persuasion", []).sd`), null, "bez naučeného manévru nic");
});

test("podtřídy: Věštec – Expert Divination vrátí po kouzlu Věštění ze slotu 2.+ stupně nejvyšší utracený nižší slot (nejvýš 5.)", async () => {
  const id = kartaReg({povolani: "Wizard 9", uroven: 9, vl: {INT: 16}, rysy: ["Diviner", "Expert Divination"]});
  await S.ev(`kartaStavZmen(${JSON.stringify(id)}, {zdr: {slot1: 2, slot2: 1, slot3: 1}})`);
  assert.equal(await S.ev(`kExpertDiv(${Kid(id)}, "Augury", 2)`), 1, "Augury (Věštění) ze slotu 2. st. vrací slot 1. st.");
  assert.deepEqual(V(`kartaStav(${JSON.stringify(id)}).zdr`), {slot1: 1, slot2: 1, slot3: 1});
  assert.equal(await S.ev(`kExpertDiv(${Kid(id)}, "Clairvoyance", 3)`), 2, "ze slotu 3. st. vrací nejvyšší nižší utracený – 2.");
  assert.equal(await S.ev(`kExpertDiv(${Kid(id)}, "Fireball", 3)`), null, "Evokace nic");
  assert.equal(await S.ev(`kExpertDiv(${Kid(id)}, "Detect Magic", 1)`), null, "1. stupeň nic");
  const bez = kartaReg({povolani: "Wizard 9", uroven: 9, rysy: ["Evoker"]});
  await S.ev(`kartaStavZmen(${JSON.stringify(bez)}, {zdr: {slot1: 1}})`);
  assert.equal(await S.ev(`kExpertDiv(${Kid(bez)}, "Augury", 2)`), null, "bez rysu nic");
});

test("podtřídy: dlouhý odpočinek Věštce hodí Předzvěst (2d20, s Greater Portent 3d20); jiné postavě nic", async () => {
  S.ev("window.confirm = () => true");
  const id = kartaReg({povolani: "Wizard 3", uroven: 3, rysy: ["Diviner", "Portent"]});
  S.kostky([
    [17, 20],
    [3, 20],
  ]);
  await S.ev(`kartaOdpocinek(${Kid(id)}, true)`);
  assert.deepEqual(V(`kartaStav(${JSON.stringify(id)}).port`), [17, 3]);
  const id3 = kartaReg({povolani: "Wizard 14", uroven: 14, rysy: ["Diviner", "Portent", "Greater Portent"]});
  await S.ev(`kartaOdpocinek(${Kid(id3)}, true)`);
  assert.equal(V(`kartaStav(${JSON.stringify(id3)}).port`).length, 3);
  const f = kartaReg({povolani: "Fighter 3", uroven: 3});
  await S.ev(`kartaOdpocinek(${Kid(f)}, true)`);
  assert.equal(V(`kartaStav(${JSON.stringify(f)}).port`), undefined);
});

test("karta: puntíky použití – klepnutí na j-tý nastaví j + 1 použitých, na už použitý vrátí na j; prázdná mapa je null", () => {
  assert.deepEqual([V("kPipNa(0, 0)"), V("kPipNa(1, 0)"), V("kPipNa(1, 2)"), V("kPipNa(3, 1)")], [1, 0, 3, 1]);
  assert.deepEqual(V(`kPipyMapa({"Výdrž": 2}, "Rage", 0)`), {Výdrž: 2, Rage: 1});
  assert.equal(V(`kPipyMapa({Rage: 1}, "Rage", 0)`), null, "vrácení posledního použití smaže klíč i mapu");
  assert.deepEqual(V(`(() => { const U = {a: 1}; kPipyMapa(U, "a", 2); return U; })()`), {a: 1}, "původní mapa se nemění");
});

test("karta: omezená použití – sloty (pakt s krátkým odpočinkem), zdroje povolání a Výdrž v jednom seznamu", () => {
  const k = karta({povolani: "Fighter 5", uroven: 5, vl: VL});
  const L = V(`kOmezena(${k}, {obnSlotu: true})`);
  assert.ok(
    L.some(q => q.k === "Výdrž" && q.obn === "dlouhý odpočinek"),
    "bojovník má Výdrž",
  );
  assert.deepEqual(V(`kOmezena(${k}, {jenSloty: true})`), [], "bojovník bez kouzel nemá sloty");
  const w = karta({povolani: "Warlock 3 / Wizard 1", uroven: 4, vl: VL});
  const sl = V(`kOmezena(${w}, {obnSlotu: true, jenSloty: true})`);
  assert.ok(sl.some(q => q.n.startsWith("Pakt") && q.obn === "krátký odpočinek"));
  assert.ok(sl.some(q => q.n.startsWith("Sloty") && q.obn === "dlouhý odpočinek"));
  assert.ok(
    V(`kOmezena(${w}, {jenSloty: true})`).every(q => !("obn" in q)),
    "bez obnSlotu sloty obnovu neuvádějí",
  );
});

test("boj: snímek pro Zpět nese kartu bez portrétu a obnova portrét nemění, ostatní stav karty vrátí", async () => {
  const id = kartaReg({povolani: "Fighter 3", uroven: 3}),
    jid = JSON.stringify(id);
  S.ev(`KST[${jid}] = {hp: 20, img: "data:image/webp;base64,AAAA", zdr: {Rage: 1}}`);
  const snap = S.ev(`bojSnapKarta(${jid})`);
  assert.deepEqual(JSON.parse(snap), {hp: 20, zdr: {Rage: 1}}, "portrét ve snímku není, zbytek ano");
  S.ev(`KST[${jid}] = {hp: 5, img: "data:image/webp;base64,BBBB"}`);
  await S.ev(`bojObnovSnap({s: JSON.stringify(BOJ.s || {}), hp: "{}", k: {[${jid}]: ${JSON.stringify(snap)}}})`);
  assert.equal(V(`kartaStav(${jid}).hp`), 20, "životy se vrátí");
  assert.deepEqual(V(`kartaStav(${jid}).zdr`), {Rage: 1}, "zdroje se vrátí");
  assert.equal(V(`kartaStav(${jid}).img`), "data:image/webp;base64,BBBB", "portrét zůstane");
  assert.equal(S.ev(`bojSnapKarta("neexistuje")`), "{}");
});
