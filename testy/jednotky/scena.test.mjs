// Rychlé testy scény mimo boj (2026-10-23, 11 + 20f): stav scény, statistiky NPC ze statbloku a z úprav vypravěče,
// hod hráče vůči NPC („Persuasion → Purkmistr“), porovnání s DC a pasivním Vhledem v záznamu, hod vypravěče za NPC a protihod.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  S.ev("window.mmHlas = () => {}; window.mmHlasG = () => {}");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
/* výřez statbloku SRD ve tvaru art/netvori.json (Noble, SRD 5.2.1) */
const NOBLE =
  "<p><b>Sok</b> · <b>Bonus zdatnosti</b> +2</p><table><tbody><tr><td>11 (+0)<br><small>záchr. +0</small></td><td>12 (+1)<br><small>záchr. +1</small></td><td>11 (+0)<br><small>záchr. +0</small></td><td>12 (+1)<br><small>záchr. +1</small></td><td>14 (+2)<br><small>záchr. +2</small></td><td>16 (+3)<br><small>záchr. +3</small></td></tr></tbody></table><p><b>Dovednosti</b> Deception +5, Insight +4, Persuasion +5 · <b>Výbava</b> Rapier · <b>Smysly</b> pasivní Perception 12</p>";

test("scéna: je to stav boje bez tahů – bojBezi rozliší opravdový boj; nová scéna má přítomné postavy hráčů", () => {
  assert.equal(V(`bojBezi({aktivni: true, scena: true})`), false);
  assert.equal(V(`bojBezi({aktivni: true})`), true);
  assert.equal(V(`bojBezi({priprava: true})`), false);
  S.ev(`KHRAC.balduin = "balduincz"`);
  try {
    const z = V(`bojNovaScena({npc: [{id: "n1"}], zaz: [{a: "x"}], hraci: []})`);
    assert.equal(z.scena, true);
    assert.equal(z.aktivni, true);
    assert.deepEqual(z.npc, [], "nová scéna je bez NPC a bez záznamu");
    assert.equal(z.zaz, undefined);
    assert.deepEqual(
      z.hraci.map(h => [h.n, h.k]),
      [["Balduin", "balduin"]],
      "postava, kterou má hráč, je ve scéně",
    );
    assert.deepEqual(V(`bojScenaChybi({hraci: [{id: "h1", n: "Balduin", k: "balduin"}]})`), []);
  } finally {
    S.ev(`delete KHRAC.balduin`);
  }
});

test("NPC: statistiky ze statbloku – vlastnosti, záchrany, dovednosti, pasivní Vnímání a zdatnost", () => {
  const z = V(`scZeStatbloku({h: ${JSON.stringify(NOBLE)}})`);
  assert.deepEqual(z.ab, {STR: 11, AGI: 12, CON: 11, INT: 12, WIS: 14, CHA: 16});
  assert.equal(z.zach.CHA, 3);
  assert.deepEqual(z.dov, {Deception: 5, Insight: 4, Persuasion: 5});
  assert.equal(z.pv, 12);
  assert.equal(z.pb, 2);
});

test("NPC: úpravy vypravěče mají přednost – vlastnosti, dovednosti; bez dovednosti platí oprava vlastnosti", () => {
  S.ev(`PROTBY["test-slechtic"] = {id: "test-slechtic", n: "Šlechtic", h: ${JSON.stringify(NOBLE)}}`);
  try {
    let st = V(`(x => ({ab: x.ab, ins: x.dovB("Insight"), ath: x.dovB("Athletics"), pv: x.pv, pvh: x.pvh}))(scStat({id: "n1", b: "test-slechtic"}))`);
    assert.equal(st.ins, 4, "Insight ze statbloku");
    assert.equal(st.ath, 0, "Athletics není ve statbloku: oprava STR 11 = +0");
    assert.equal(st.pv, 12);
    assert.equal(st.pvh, 14, "pasivní Vhled = 10 + Insight");
    st = V(
      `(x => ({cha: x.ab.CHA, ins: x.dovB("Insight"), per: x.dovB("Persuasion"), dec: x.dovB("Deception")}))(scStat({id: "n1", b: "test-slechtic", gm: {ab: {CHA: 18}, dov: "Insight +7, Persuasion +6"}}))`,
    );
    assert.deepEqual(st, {cha: 18, ins: 7, per: 6, dec: 4}, "Deception už není v upraveném seznamu: oprava CHA 18 = +4");
    assert.equal(V(`scStat({id: "x"}).ab.WIS`), 10, "NPC bez statbloku má vlastnosti 10");
  } finally {
    S.ev(`delete PROTBY["test-slechtic"]`);
  }
});

test("hráč ve scéně: ověření a dovednosti jdou vůči zvolené postavě, záchrany, útoky a skrytá NPC ne", () => {
  const B0 = S.ev(`JSON.stringify(BOJ.s || null)`);
  S.ev(
    `BOJ.s = {scena: true, aktivni: true, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: [{id: "n1", n: "Purkmistr"}, {id: "n2", n: "Špeh", skryt: true}]}; BSCJ.balduin = "n1"`,
  );
  try {
    const co = (c, o) => V(`bojScCo(KARTBY.balduin, ${JSON.stringify(c)}, ${JSON.stringify(o || {})}, false)`);
    assert.equal(co("Persuasion"), "Persuasion → Purkmistr");
    assert.equal(co("Ověření Charisma"), "Ověření Charisma → Purkmistr");
    assert.equal(co("Záchrana WIS"), "Záchrana WIS", "záchrana se nikomu neadresuje");
    assert.equal(co("Útok – Nevermore", {utok: true}), "Útok – Nevermore");
    S.ev(`BSCJ.balduin = "n2"`);
    assert.equal(co("Persuasion"), "Persuasion", "skryté NPC hráč neoslovuje");
    S.ev(`BSCJ.balduin = "n1"; BOJ.s.scena = false`);
    assert.equal(co("Persuasion"), "Persuasion", "v opravdovém boji bez cíle jednání");
  } finally {
    S.ev(`delete BSCJ.balduin; BOJ.s = ${B0}`);
  }
});

test("záznam vypravěče: hod vůči NPC porovná s DC a pasivním Vhledem a nabídne protihod; protihod NPC rozhodne", () => {
  const B0 = S.ev(`JSON.stringify(BOJ.s || null)`);
  S.ev(
    `BOJ.s = {scena: true, aktivni: true, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: [{id: "n1", n: "Purkmistr", gm: {dc: 15, postoj: "nepratelsky", dov: "Insight +3"}}]}`,
  );
  try {
    const e = V(
      `bzZHod(BOJ.s, {id: 9, cas: new Date().toISOString(), kdo: "Balduin", co: "Deception → Purkmistr", txt: "d20 12 +5 = 17", tot: 17, d: 12})`,
    );
    assert.equal(e.C.n, "Purkmistr");
    const por = e.rows.map(r => r.h).join(" ");
    assert.match(por, /DC 15: <b>úspěch<\/b>/);
    assert.match(por, /pasivní Vhled 13: <b>obstál<\/b>/);
    assert.match(por, /postoj nepřátelský/);
    assert.match(por, /data-bscprot="n1\|Insight\|17\|Balduin"/);
    S.kostky([[15, 20]]);
    assert.equal(V(`scHodNpc("n1", "dv:Insight", {tot: 17, kdo: "Balduin"})`), 18, "d20 15 + Insight 3");
    const L = V(`BLOGG[0].o`);
    assert.equal(L.n, "Protihod Insight");
    assert.match(L.dc, /Purkmistr uspěl/);
  } finally {
    S.ev(`BOJ.s = ${B0}`);
  }
});

test("konec boje: hra se vrátí do scény – postavy, NPC, kteří zůstali, a záznam zůstanou; bez slotů a iniciativy", () => {
  const z = V(`bojNaScenu({aktivni: true, kolo: 4, tah: 3, sloty: [{t: "h"}], obsazeni: {0: "h1"}, hod: 15, dm: 9, pocty: {h: 1, n: 2}, zac: 111,
    hraci: [{id: "h1", n: "Balduin"}], zaz: [{a: "Vlk"}],
    npc: [{id: "n1", n: "Purkmistr", druh: "sok"}, {id: "n2", n: "Vlk", druh: "sok", stav: ["poražen"]}, {id: "n3", n: "Pacholci", druh: "houf", pocet: 0}, {id: "n4", n: "Zbrojnoš", druh: "sok", stav: ["prchá"]}]})`);
  assert.equal(z.scena, true);
  assert.equal(z.aktivni, true);
  assert.deepEqual([z.kolo, z.tah, z.sloty, z.obsazeni, z.hod, z.dm, z.pocty], [1, 0, [], {}, undefined, undefined, undefined]);
  assert.deepEqual(
    z.npc.map(n => n.id),
    ["n1"],
    "poražení, prchající a prázdný houf ve scéně nezůstanou",
  );
  assert.equal(z.zac, 111, "záznam pokračuje od začátku scény");
  assert.equal(z.zaz.length, 1);
  assert.ok(z.utOk > 0, "útoky z boje už nenabízejí přepnutí do boje");
  assert.deepEqual(V(`bojSloty({scena: true, hraci: [{id: "h1", hod: 12}], npc: [{id: "n1"}]})`), [], "scéna nemá sloty iniciativy");
});

test("karta: účinky jsou v listu Stavy (záložka Účinky), list Svědomí je už nemá", () => {
  const K0 = S.ev(`JSON.stringify(KST.balduin || null)`);
  S.ev(`KST.balduin = Object.assign({}, KST.balduin || {}, {uc: [{n: "Armor of Agathys", h: 1}]})`);
  try {
    const list = t => V(`bdmList(null, {id: "_balduin", n: "Balduin"}, KARTBY.balduin, false, {boj: false, karta: true}, ${JSON.stringify(t)})`);
    S.ev(`BDM.stt = "st"`);
    let [tit, html] = list("st");
    assert.equal(tit, "Stavy a účinky");
    assert.match(html, /data-bdmstt="uc" aria-selected="false">Účinky <b>1<\/b>/, "záložka Účinky ukazuje počet");
    assert.doesNotMatch(html, /Armor of Agathys/);
    S.ev(`BDM.stt = "uc"`);
    [tit, html] = list("st");
    assert.match(html, /Armor of Agathys/);
    [tit, html] = list("sv");
    assert.doesNotMatch(html, /Armor of Agathys/, "Svědomí už účinky nemá");
  } finally {
    S.ev(`BDM.stt = "st"; KST.balduin = ${K0} || undefined`);
  }
});
