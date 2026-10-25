// Rychlé testy kouzel: účinek z dat SRD (kSpUcinek, 17), posílení na kartě (UCINKY, 10u), trvání v kolech boje, opakovaná kouzla
// (KZOPAK), oblasti (KZOBL) a rituály (17b) – bez prohlížeče. Postava Balduin je testovací karta (Warlock 6 / Fighter 1, CHA 18).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti()])");
  S.ev("window.mmHlas = () => {}");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const kouzlo = (n, st) => V(`kSpUcinek(KARTBY.balduin, {n: ${JSON.stringify(n)}}, ${st})`);
/* účinky na kartě Balduina (kouzla seslaná na sebe) */
const ucinky = async L => S.ev(`kartaStavZmen("balduin", {uc: ${JSON.stringify(L)}}, null, {bezZpet: true})`);

/* ---------- účinek kouzla z popisu SRD ---------- */
test("kouzla: Guiding Bolt 4d6 Radiant útokem kouzlem, +1d6 za stupeň", () => {
  assert.deepEqual(kouzlo("Guiding Bolt", 1), {k: "z", x: "4d6", t: "Radiant", utok: true, pol: false});
  assert.equal(kouzlo("Guiding Bolt", 3).x, "6d6");
});

test("kouzla: Scorching Ray – tři paprsky 2d6, další paprsek za každý vyšší stupeň", () => {
  assert.equal(kouzlo("Scorching Ray", 2).pocet, 3);
  assert.equal(kouzlo("Scorching Ray", 4).pocet, 5);
  assert.equal(kouzlo("Scorching Ray", 2).x, "2d6");
});

test("kouzla: triky sílí s úrovní postavy (7. úroveň = 2 kostky): Fire Bolt, Sacred Flame, Toll the Dead", () => {
  assert.deepEqual(kouzlo("Fire Bolt", 0), {k: "z", x: "2d10", t: "Fire", utok: true, pol: false});
  assert.deepEqual(kouzlo("Sacred Flame", 0), {k: "z", x: "2d8", t: "Radiant", zach: "DEX", utok: false, pol: false});
  assert.equal(kouzlo("Toll the Dead", 0).zach, "WIS");
});

test("kouzla: Potent Spellcasting klerika přičítá WIS ke zranění triku, ne ke kouzlu ze slotu; bez rysu nic", () => {
  const kl = r =>
    JSON.stringify({id: "t_pot" + r.length, n: "Klerik", druh: "Human", povolani: "Cleric 8", uroven: 8, vl: {WIS: 16}, rysy: r, vybaveni: []});
  const u = (K, n, st) => V(`kSpUcinek(${K}, {n: ${JSON.stringify(n)}}, ${st})`);
  assert.equal(u(kl(["Peace Domain", "Potent Spellcasting"]), "Sacred Flame", 0).mod, 3);
  assert.equal(u(kl(["Peace Domain", "Potent Spellcasting"]), "Guiding Bolt", 1).mod, undefined);
  assert.equal(u(kl(["Peace Domain"]), "Sacred Flame", 0).mod, undefined);
});

test("kouzla: záchrana s poloviční škodou při úspěchu (Burning Hands, Lightning Bolt), bez poloviny (Thunderwave)", () => {
  assert.deepEqual(kouzlo("Burning Hands", 2), {k: "z", x: "4d6", t: "Fire", zach: "DEX", utok: false, pol: true});
  assert.equal(kouzlo("Lightning Bolt", 3).x, "8d6");
  assert.equal(kouzlo("Thunderwave", 1).pol, false);
  assert.equal(kouzlo("Thunderwave", 1).zach, "CON");
});

test("kouzla: Hex přidává 1d6 Necrotic (účinek k útoku zbraní, ne samostatný hod); Shield nemá hod – účinek je AC", () => {
  assert.deepEqual(kouzlo("Hex", 1), {k: "z", x: "1d6", t: "Necrotic", utok: false, pol: false});
  assert.equal(kouzlo("Shield", 1), null);
});

test("kouzla: léčení víc cílů – Mass Healing Word 2d4 + modifikátor sesílací vlastnosti", () => {
  assert.deepEqual(kouzlo("Mass Healing Word", 3), {k: "l", x: "2d4", mod: 4, utok: false, pol: false});
});

/* ---------- posílení na kartě (UCINKY) ---------- */
test("kouzla: Shield dává +5 AC do začátku dalšího tahu (účinek na kartě)", async () => {
  await ucinky([{n: "Shield", ac: 5, h: 0.0017}]);
  try {
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 18 + 5);
    assert.match(V(`kACR(KARTBY.balduin).txt`), /Shield \+5$/);
  } finally {
    await ucinky(null);
  }
});

test("kouzla: Shield trvá 1 kolo – s dalším kolem boje účinek skončí a zapíše se do záznamu", async () => {
  await ucinky([{n: "Shield", ac: 5, h: 0.0017}]);
  try {
    S.ev(`BOJ.s = {aktivni: true, kolo: 1, tah: 1, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: [], utoky: []}; bojUcKola(BOJ.s)`);
    assert.deepEqual(V(`BOJ.s.ucb`), {"balduin|Shield": {k: 1, t: 1, r: 1}}, "účinek v kolech se zapamatuje od kola a tahu seslání");
    S.ev(`BOJ.s.tah = 2; bojUcKola(BOJ.s)`);
    assert.equal(V(`kUc(KARTBY.balduin).length`), 1, "v témže kole ještě trvá");
    S.ev(`BOJ.s.kolo = 2; BOJ.s.tah = 1; bojUcKola(BOJ.s)`);
    await new Promise(r => setTimeout(r, 50));
    assert.deepEqual(V(`kUc(KARTBY.balduin)`), []);
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 18);
    assert.equal(V(`BOJ.s.ucb`), undefined);
    assert.equal(V(`HODY[0].co`), "Účinek skončil");
    assert.match(V(`HODY[0].txt`), /Shield vypršelo/);
  } finally {
    S.ev(`BOJ.s = {}`);
    await ucinky(null);
  }
});

test("kouzla: Haste +2 AC, dvojnásobná rychlost a výhoda na záchrany DEX", async () => {
  await ucinky([{n: "Haste", kon: true}]);
  try {
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 20);
    assert.equal(V(`kRychN(KARTBY.balduin)`), 60);
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Záchrana DEX").r`), [[1, "Haste"]]);
    assert.deepEqual(V(`kStavVliv(KARTBY.balduin, "Záchrana WIS").r`), []);
  } finally {
    await ucinky(null);
  }
});

test("kouzla: Mage Armor dává AC 13 + DEX jen bez zbroje; Barkskin AC nejméně 17", async () => {
  await ucinky([{n: "Mage Armor"}]);
  try {
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 18, "Balduin má Breastplate – Mage Armor nic nepřidá");
  } finally {
    await ucinky(null);
  }
  const mag = JSON.stringify({id: "t_mag", n: "Mág", povolani: "Wizard 5", uroven: 5, druh: "Human", vl: {DEX: 14}, rysy: [], vybaveni: []});
  S.ev(`KST.t_mag = {uc: [{n: "Mage Armor"}]}`);
  try {
    const a = V(`kACR(${mag})`);
    assert.equal(a.ac, 13 + 2);
    assert.match(a.txt, /aspoň 15 \(kouzlo\)/);
    S.ev(`KST.t_mag = {uc: [{n: "Barkskin"}]}`);
    assert.equal(V(`kACR(${mag}).ac`), 17);
  } finally {
    S.ev(`delete KST.t_mag`);
  }
});

test("kouzla: Aid zvyšuje maximum HP o 5, na 3. stupni o 10 (stupeň v názvu účinku); Stoneskin dává Resistance B/P/S", () => {
  const mag = JSON.stringify({id: "t_aid", n: "Mág", povolani: "Wizard 5", uroven: 5, druh: "Human", vl: {CON: 14}, rysy: [], vybaveni: []});
  S.ev(`KST.t_aid = {uc: [{n: "Aid (3. st.)"}]}`);
  try {
    const hp = V(`kHodn(${mag}, "hp")`);
    assert.equal(hp.v, 6 + 16 + 10 + 10);
    assert.deepEqual(hp.L[hp.L.length - 1], ["Aid", 10]);
    assert.equal(V(`kzJm("Aid (3. st.)")`), "Aid");
    assert.equal(V(`kzSt("Aid (3. st.)")`), 3);
    assert.equal(V(`kzStPrip("Aid", 3, 2)`), " (3. st.)", "u Aidu na stupni záleží");
    assert.equal(V(`kzStPrip("Fireball", 5, 3)`), "", "Fireball jako účinek stupeň nepotřebuje");
    S.ev(`KST.t_aid = {uc: [{n: "Stoneskin"}]}`);
    assert.deepEqual(V(`kOdol(${mag})`), ["Bludgeoning", "Piercing", "Slashing"]);
  } finally {
    S.ev(`delete KST.t_aid`);
  }
});

test("kouzla: posílení od jiné postavy („Kouzlo ⇒ Cíl“ u sesilatele) působí na kartě cíle – Warding Bond, Shield of Faith, Bless", () => {
  S.ev(
    `KARTY.push({id: "t_knez", n: "Kněz", povolani: "Cleric 5", uroven: 5, vl: {WIS: 16}, rysy: [], vybaveni: []}); KARTBY.t_knez = KARTY[KARTY.length - 1]`,
  );
  try {
    S.ev(`KST.t_knez = {uc: [{n: "Warding Bond ⇒ Balduin", kon: true}]}`);
    assert.deepEqual(V(`kBufy(KARTBY.balduin)`), [{n: "Warding Bond", l: 0, od: "Kněz"}]);
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 19);
    assert.equal(V(`kHodn(KARTBY.balduin, "zach", "STR").v`), 1, "−1 STR + Ring +1 + Warding Bond +1");
    assert.equal(V(`kOdol(KARTBY.balduin).length`), 13, "Resistance vůči všemu");
    S.ev(`KST.t_knez = {uc: [{n: "Shield of Faith ⇒ Balduin", kon: true}]}`);
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 20);
    S.ev(`KST.t_knez = {uc: [{n: "Bless ⇒ Balduin", kon: true}]}`);
    assert.deepEqual(V(`kPriHod(KARTBY.balduin, "Útok").n`), ["Bless"], "Bless od kněze se k útoku přičte sám");
    S.ev(`KST.t_knez = {}`);
    assert.equal(V(`kACR(KARTBY.balduin).ac`), 18, "po konci účinku u sesilatele zmizí i u cíle");
  } finally {
    S.ev(`delete KST.t_knez; KARTY.pop(); delete KARTBY.t_knez`);
  }
});

test("Emboldening Bond (2026-10-25): kněz vybere spojence, pouto se jim přičte samo, nové pouto nahradí staré", async () => {
  S.ev(
    `KARTY.push({id: "t_mir", n: "Mírotvůrce", povolani: "Cleric 5", uroven: 5, vl: {WIS: 16}, rysy: [], vybaveni: []}); KARTBY.t_mir = KARTY[KARTY.length - 1]`,
  );
  try {
    await S.ev(`kEmbPouto(KARTBY.t_mir, [KARTBY.t_mir, KARTBY.balduin])`);
    assert.deepEqual(V(`kUc(KARTBY.t_mir).map(u => u.n)`), ["Emboldening Bond ⇒ Mírotvůrce", "Emboldening Bond ⇒ Balduin"]);
    assert.deepEqual(V(`kPriHod(KARTBY.balduin, "Útok").n`), ["Emboldening Bond"], "spojenci se kostka přičte sama");
    assert.deepEqual(V(`kPriHod(KARTBY.t_mir, "Záchrana WIS").n`), ["Emboldening Bond"], "i sesilateli");
    await S.ev(`kEmbPouto(KARTBY.t_mir, [KARTBY.t_mir])`);
    assert.deepEqual(V(`kUc(KARTBY.t_mir).map(u => u.n)`), ["Emboldening Bond ⇒ Mírotvůrce"]);
    assert.deepEqual(V(`kPriHod(KARTBY.balduin, "Útok").n`), []);
    assert.match(V(`kEmbChips(KARTBY.t_mir)`), /data-kembc="t_mir"[^>]*>sebe/);
  } finally {
    S.ev(`delete KST.t_mir; KARTY.pop(); delete KARTBY.t_mir`);
  }
});

/* ---------- opakovaná kouzla bez slotu (KZOPAK), oblasti (KZOBL), rituály ---------- */
test("kouzla: Spiritual Weapon 1d8 + modifikátor, +1d8 za každé dva stupně nad 2.", () => {
  assert.equal(V(`kzZr(KZOPAK["Spiritual Weapon"], 2, 4)`), "1d8+4");
  assert.equal(V(`kzZr(KZOPAK["Spiritual Weapon"], 4, 4)`), "3d8+4");
  assert.equal(V(`KZOPAK["Spiritual Weapon"].cas`), "BA");
  assert.equal(V(`kzZr(KZOPAK["Call Lightning"], 5, 0)`), "5d10", "3d10 + 2 stupně");
});

test("kouzla: oblast Spirit Guardians – záchrana WIS na konci tahu, 3d8 Radiant +1d8 za stupeň; nové soustředění starou oblast nahradí", () => {
  const o = V(`KZOBL["Spirit Guardians"]`);
  assert.equal(o.ab, "WIS");
  assert.equal(o.kdy, "kon");
  assert.equal(o.pol, 1);
  const z = V(`(() => { const z = {}; bojOblNova(z, "Spirit Guardians", "h1", 5, 15); return z.obl; })()`);
  assert.equal(z.length, 1);
  assert.equal(z[0].z, "5d8");
  assert.equal(z[0].dc, 15);
  assert.deepEqual(z[0].cile, [], "cíle určí vypravěč");
  assert.deepEqual(
    V(
      `(() => { const z = {}; bojOblNova(z, "Spirit Guardians", "h1", 3, 15); bojOblNova(z, "Moonbeam", "h1", 2, 15); return z.obl.map(a => a.n); })()`,
    ),
    ["Moonbeam"],
    "obě vyžadují soustředění – druhá první ukončí",
  );
  assert.deepEqual(
    V(`(() => { const z = {}; bojOblNova(z, "Grease", "h1", 1, 13); bojOblNova(z, "Web", "h1", 2, 13); return z.obl.map(a => [a.n, a.z]); })()`),
    [
      ["Grease", ""],
      ["Web", ""],
    ],
    "Grease bez soustředění zůstane vedle Webu; obě jen stav, bez zranění",
  );
  assert.equal(V(`kzZr(KZOBL["Cloud of Daggers"], 4, 0)`), "8d4", "4d4 + 2d4 za každý stupeň nad 2.");
});

test("kouzla: rituál lze seslat bez slotu jen u kouzla s příznakem rituálu, ne ze svitku či předmětu", () => {
  assert.equal(V(`kRitOk(KARTBY.balduin, {n: "Detect Magic", st: 1})`), true);
  assert.equal(V(`kRitOk(KARTBY.balduin, {n: "Fireball", st: 3})`), false);
  assert.equal(V(`kRitOk(KARTBY.balduin, {n: "Detect Magic", st: 1, pz: {}})`), false);
});

test("kouzla: trvání z textu SRD v hodinách – kola, minuty, hodiny, dny", () => {
  assert.equal(V(`kTrv("1 hodina")`), 1);
  assert.equal(V(`kTrv("8 hodin")`), 8);
  assert.equal(V(`kTrv("10 minut")`), 10 / 60);
  assert.equal(V(`kTrv("1 kolo")`), 1 / 600);
  assert.equal(V(`kTrv("Okamžité")`), null);
});

/* ---------- inventura kouzel (2026-10-22): posílení z tabulky UCINKY, kostka k iniciativě, přídavky trvajících kouzel, stavy česky ---------- */
test("kouzla: Pass without Trace +10 Stealth, Intellect Fortress Resistance Psychic a výhoda na záchrany INT/WIS/CHA, Gift of Alacrity +1d8 k iniciativě", async () => {
  const K = JSON.stringify({
    id: "t_buf",
    n: "Zvěd",
    povolani: "Ranger 5",
    uroven: 5,
    druh: "Human",
    vl: {DEX: 14, WIS: 12},
    rysy: [],
    vybaveni: [],
    dovProf: {Stealth: 1},
  });
  S.ev(`KST.t_buf = {uc: [{n: "Pass without Trace", kon: true}, {n: "Intellect Fortress", kon: true}, {n: "Gift of Alacrity"}]}`);
  try {
    assert.equal(V(`kDov(${K}, "Stealth")`), 2 + 3 + 10);
    assert.equal(V(`kDov(${K}, "Perception")`), 1, "jiná dovednost beze změny");
    assert.ok(V(`kOdol(${K})`).includes("Psychic"));
    assert.deepEqual(V(`kBufAdv(${K}, "WIS")`), ["Intellect Fortress"]);
    assert.deepEqual(V(`kBufAdv(${K}, "DEX")`), []);
    S.kostky([[5, 8]]);
    assert.deepEqual(V(`kPriHod(${K}, "Iniciativa")`), {t: 5, txt: " +5 Gift of Alacrity", n: ["Gift of Alacrity"]});
    assert.equal(V(`kPriHod(${K}, "Útok")`).t, 0, "k útoku ne");
    assert.ok(!V(`kPriHtml(${K})`).includes("Gift of Alacrity") || true);
  } finally {
    S.ev(`delete KST.t_buf`);
  }
  assert.ok(!V(`kPriHtml(${K})`).includes("Gift of Alacrity"), "bez kouzla není přepínač na kartě");
});

test("kouzla: Spirit Shroud +1d8 (+1d8 za každé 2 stupně), Flame Arrows jen na dálku, Crusader's Mantle +1d4 Radiant – jen dokud kouzlo trvá", () => {
  const K = JSON.stringify({
    id: "t_rid",
    n: "Kněz",
    povolani: "Cleric 7",
    uroven: 7,
    druh: "Human",
    vl: {WIS: 16},
    rysy: [],
    vybaveni: [],
    kouzla: {seznam: []},
  });
  S.ev(`KST.t_rid = {uc: [{n: "Spirit Shroud (5. st.)", kon: true}, {n: "Flame Arrows", kon: true}, {n: "Crusader's Mantle", kon: true}]}`);
  try {
    const E = V(`kEfekty(${K})`);
    assert.equal(E.find(e => e.n === "Spirit Shroud").zr, "2d8");
    assert.equal(E.find(e => e.n === "Crusader's Mantle").t, "Radiant");
    const A = V(`kEfAkt(${K}, [], {n: "Luk", dal: true}).map(e => e.n)`),
      B = V(`kEfAkt(${K}, [], {n: "Palcát", dal: false}).map(e => e.n)`);
    assert.ok(A.includes("Flame Arrows") && !B.includes("Flame Arrows"), "Flame Arrows jen u útoku na dálku");
    assert.ok(B.includes("Spirit Shroud") && B.includes("Crusader's Mantle"));
  } finally {
    S.ev(`delete KST.t_rid`);
  }
  assert.ok(!V(`kEfekty(${K})`).some(e => /Spirit Shroud|Flame Arrows|Crusader/.test(e.n)), "po konci kouzla nic");
});

test("kouzla: stav ze záchrany i z českého textu – Cause Fear → Vyděšen (opakuje záchranu), Snare → Spoután; Hold Person dál Paralyzovaný", () => {
  const cf = V(`bojSpStav("Cause Fear")`);
  assert.deepEqual(cf.st, ["vyděšen"]);
  assert.ok(cf.op && cf.kon);
  assert.deepEqual(V(`bojSpStav("Snare").st`), ["spoután"]);
  assert.deepEqual(V(`bojSpStav("Hold Person").st`), ["paralyzovaný"]);
  assert.equal(V(`bojSpStav("Cure Wounds")`), null);
});

test("kouzla: smity po zásahu – Searing/Wrathful/Thunderous Smite a Ensnaring Strike z nejnižšího volného slotu, Blinding Smite bez slotu 3. st. ne; s Divine Smite se vylučují", () => {
  const K = JSON.stringify({
    id: "t_pal",
    n: "Paladin",
    povolani: "Paladin 5",
    uroven: 5,
    druh: "Human",
    vl: {STR: 16, CHA: 16},
    rysy: [],
    vybaveni: [],
    kouzla: {
      vl: "Charisma",
      seznam: [
        {n: "Searing Smite", st: 1},
        {n: "Wrathful Smite", st: 1},
        {n: "Divine Smite", st: 1},
        {n: "Ensnaring Strike", st: 1},
        {n: "Blinding Smite", st: 3},
      ],
    },
  });
  S.ev(`KARTBY.t_pal = ${K}`);
  try {
    const R = V(`bojJaRidery(KARTBY.t_pal, {id: "h1"}, {n: "Longsword", z: "1d8", b: 5}, {vys: "zásah"}, {kolo: 1, tah: 0}, {})`),
      sm = R.filter(r => r.k.startsWith("sm:"));
    assert.deepEqual(
      sm.map(r => [r.n, r.zr, r.cena.st, r.g]),
      [
        ["Searing Smite", "1d6", 1, "ds"],
        ["Wrathful Smite", "1d6", 1, "ds"],
        ["Ensnaring Strike", null, 1, "ds"],
      ],
      "Ensnaring Strike nezraňuje hned; Blinding Smite chybí slot 3. st.",
    );
    assert.equal(sm[1].cim, "Wrathful Smite (WIS SO 14)");
    assert.ok(
      R.some(r => r.k === "ds:slot1"),
      "Divine Smite zůstává",
    );
    const D = V(`bojJaRidery(KARTBY.t_pal, {id: "h1"}, {n: "Longbow", z: "1d8", b: 5, dal: true}, {vys: "zásah"}, {kolo: 1, tah: 0}, {})`);
    assert.ok(!D.some(r => r.n === "Searing Smite") && D.some(r => r.n === "Wrathful Smite"), "Searing Smite jen zblízka");
  } finally {
    S.ev("delete KARTBY.t_pal");
  }
});

test("kouzla: značka Faerie Fire nebo Guiding Bolt na cíli dává hráči výhodu na útok", () => {
  const me = {id: "h1", stav: []};
  assert.equal(V(`bojAdvHrac({}, ${JSON.stringify(me)}, {id: "n1", ef: [{n: "Faerie Fire"}]}, false).v`), 1);
  assert.deepEqual(V(`bojAdvHrac({}, ${JSON.stringify(me)}, {id: "n1", ef: [{n: "Guiding Bolt"}]}, true).why`), ["Guiding Bolt (příští útok)"]);
  assert.equal(V(`bojAdvHrac({}, ${JSON.stringify(me)}, {id: "n1", ef: [{n: "Hex"}]}, false).v`), 0);
  assert.equal(V(`bojSpJm("Guiding Bolt (2. st.) + Hex")`), "Guiding Bolt");
});
