// Perky zbraní z Artikulí (pravidla/artikule-zbrane-2026-10-24.md, dřív „vlastnosti zbraní“): vyhodnocení u vypravěče (20e `bojZvVyhodnot`)
// a SO aktivních perků, které posílá hráč (`bojZvPayload`). Doplněno při týdenní údržbě 2026-10-24 – tyto perky dřív test neměly.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
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
const BAL = "KARTBY.balduin";

/* protivník z bestiáře, který má (nebo nemá) Resistance vůči typu zranění – hledá se v datech, ať test nezávisí na jednom jménu */
const najdi = (typ, ma) =>
  V(
    `Object.keys(PROTBY).find(k => { const n = {id: "x", b: k, druh: PROTBY[k].u || "sok"}; return bojEff(n) && bojMaRes(n, "${typ}") === ${ma}; }) || null`,
  );
const vyhodnot = (b, u, ZS, hit = true) =>
  V(`(() => { const n = {id: "n1", n: "Cíl", b: ${JSON.stringify(b)}, druh: PROTBY[${JSON.stringify(b)}].u || "sok", stav: []};
    return bojZvVyhodnot({npc: [n]}, ${JSON.stringify(u)}, {id: "h1", n: "Balduin"}, n, bojEff(n), ${JSON.stringify(ZS)}, ${hit}, false); })()`);

test("Omračující a Strhující: SO záchrany = 8 + zdatnost + STR útočníka", () => {
  const ocek = V(`8 + kPB(${BAL}) + kMod(kVl(${BAL}, "STR") || 10)`);
  const o = V(`bojZvPayload(${BAL}, {n: "Mace", vl: ["Drtivá", "Omračující"]}, null, {r: "poz", d: 6}, null)`);
  assert.deepEqual(o.a, ["Omračující"], "aktivní perk palcátu");
  assert.equal(o.dc, ocek);
  assert.equal(V(`bojZvPayload(${BAL}, {n: "Halberd", vl: ["Ratiště", "Strhující"]}, null, null, null).dc`), ocek);
  assert.equal(V(`bojZvPayload(${BAL}, {n: "Spear", vl: ["Ratiště", "Přibodnutí"]}, null, null, null).dc`), undefined, "Přibodnutí SO útočníka nemá");
});

test("Krvežíznivá: cíl bez Resistance krvácí k4, s Resistance ne", () => {
  const bez = najdi("Slashing", false),
    s = najdi("Slashing", true);
  assert.ok(bez && s, "v bestiáři je protivník s Resistance i bez ní");
  const u = {t: "Slashing", zv: {v: ["Krvežíznivá"], a: ["Krvežíznivá"], r: "poz"}};
  assert.equal(vyhodnot(bez, u, null)[0].k, "krv");
  const r = vyhodnot(s, u, null)[0];
  assert.equal(r.k, undefined, "s Resistance nekrvácí");
  assert.match(r.txt, /Resistance/);
  assert.deepEqual(vyhodnot(bez, u, null, false), [], "minutí nic nespustí");
});

test("Ničivá ubere obětování zbroje, Štěpící zničí štít; bez zbroje či štítu nic", () => {
  const b = najdi("Slashing", false);
  const ZS = {
    d: [
      {k: "Kroužková", u: 0, max: 2},
      {k: "Štít", u: 0, max: 1},
    ],
  };
  const nic = vyhodnot(b, {t: "Piercing", zv: {v: ["Ničivá"], a: ["Ničivá"], r: "poz"}}, ZS)[0];
  assert.equal(nic.k, "nic");
  assert.equal(nic.kz, "Kroužková", "ubírá z těla zbroje, ne ze štítu");
  assert.equal(
    vyhodnot(b, {t: "Piercing", zv: {v: ["Ničivá"], a: [], r: "poz"}}, {d: [{k: "Kroužková", u: 2, max: 2}]})[0].k,
    undefined,
    "vyčerpaná zbroj",
  );
  assert.equal(vyhodnot(b, {t: "Slashing", zv: {v: ["Štěpící"], a: [], r: "poz"}}, ZS)[0].k, "stit");
  assert.equal(vyhodnot(b, {t: "Slashing", zv: {v: ["Štěpící"], a: [], r: "poz"}}, {d: []})[0].k, undefined, "cíl bez štítu");
});

test("Omračující při neúspěšné CON záchraně zaskočí, Přibodnutí přibodne", () => {
  const b = najdi("Bludgeoning", false);
  S.kostky([[1, 20]]);
  const o = vyhodnot(b, {t: "Bludgeoning", zv: {v: ["Omračující"], a: [], r: "poz", dc: 30}}, null)[0];
  assert.equal(o.ok, false);
  assert.equal(o.k, "zask");
  assert.match(o.txt, /SO 30/);
  assert.equal(vyhodnot(b, {t: "Piercing", zv: {v: ["Přibodnutí"], a: [], r: "poz"}}, null)[0].k, "prib");
});

test("Hrom a kouř!: Požehnání zahalí střelce dýmem, 1 na d20 a 1 na Závoji = výbuch", () => {
  const b = najdi("Piercing", false);
  const dym = vyhodnot(b, {t: "Piercing", d: 14, zv: {v: [], a: ["Hrom a kouř!"], r: "poz", z: 6}}, null);
  assert.deepEqual(
    dym.map(x => x.k),
    ["dym"],
  );
  const vyb = vyhodnot(b, {t: "Piercing", d: 1, zv: {v: [], a: ["Hrom a kouř!"], r: "pok", z: 1}}, null, false);
  assert.deepEqual(
    vyb.map(x => x.k),
    ["vyb"],
  );
});
