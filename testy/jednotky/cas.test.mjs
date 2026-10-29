// Rychlé testy herního času: juliánský kalendář a svátky (07), posun herního času a kostka Závoje podle svátků a Hodin Závoje (09, 11),
// věk osob k hernímu datu, okno putování podle ročního období – bez prohlížeče, ve statické verzi (herní stav jen v okně).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  S.ev("window.mmHlas = () => {}");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
/* herní stav vypravěče (statická verze: jen v okně); null = platí poslední zápis Kroniky */
const hra = h => S.ev(`HRA = ${JSON.stringify(h)}; __D.HRA = HRA`);

test("kalendář: tažení začíná 3. března 1458 – bez herního stavu platí výchozí datum", () => {
  hra(null);
  assert.deepEqual(V(`herniDen()`), [1458, 3, 3]);
  assert.equal(V(`partyDate()`), "3. března 1458");
});

test("kalendář: juliánský – každý čtvrtý rok přestupný, i 1500; převod dne a zpět je přesný", () => {
  assert.deepEqual(V(`fromJdn(jdn(1458, 3, 3))`), [1458, 3, 3]);
  assert.deepEqual(V(`fromJdn(jdn(1458, 2, 28) + 1)`), [1458, 3, 1]);
  assert.deepEqual(V(`fromJdn(jdn(1456, 2, 28) + 1)`), [1456, 2, 29]);
  assert.deepEqual(V(`fromJdn(jdn(1500, 2, 28) + 1)`), [1500, 2, 29], "juliánský kalendář: 1500 je přestupný (gregoriánský by nebyl)");
  assert.equal(V(`jdn(1458, 3, 3)`), 2253654);
});

test("kalendář: Velikonoce 1458 podle starého výpočtu připadají na 2. dubna; Smrtná neděle dva týdny před nimi", () => {
  assert.deepEqual(V(`fromJdn(easter(1458))`), [1458, 4, 2]);
  const f = Object.fromEntries(V(`feasts(1458).map(f => [f.n, fromJdn(f.j)])`).map(([n, d]) => [n, d.join("-")]));
  assert.equal(f["Smrtná neděle – vynášení Morany"], "1458-3-19");
  assert.equal(f["sv. Jiří"], "1458-4-24");
  assert.equal(f["sv. Václav"], "1458-9-28");
  assert.equal(f["Mistr Jan Hus"], "1458-7-6");
});

test("věk osob: k hernímu datu – přesné datum se mění v den narozenin, jen rok „asi“, odhad „odhadem“", () => {
  hra(null);
  assert.equal(V(`vekPostavy({r: 1420})`), "asi 38 let");
  assert.equal(V(`vekPostavy({r: 1420, d: "1420-03-03"})`), "38 let", "narozeniny právě dnes");
  assert.equal(V(`vekPostavy({r: 1420, d: "1420-03-04"})`), "37 let", "narozeniny zítra");
  assert.equal(V(`vekPostavy({r: 1420, o: 1})`), "odhadem 38 let");
  assert.equal(V(`vekPostavy({r: 1456, d: "1456-05-01"})`), "1 rok", "skloňování: rok / roky / let");
  assert.equal(V(`vekPostavy({r: 1460})`), "", "ještě se nenarodil");
});

test("herní čas: posun o hodiny přetéká přes půlnoc, „další ráno“ = 6:00 dalšího dne, „do večera“ = západ slunce", async () => {
  hra(null);
  try {
    await S.ev(`hraPosun("rano")`);
    assert.deepEqual(V(`[HRA.datum, HRA.hodina]`), ["1458-03-04", 6]);
    await S.ev(`hraPosun(3)`);
    assert.deepEqual(V(`[HRA.datum, HRA.hodina]`), ["1458-03-04", 9]);
    await S.ev(`hraPosun("vecer")`);
    assert.deepEqual(V(`[HRA.datum, HRA.hodina]`), ["1458-03-04", 18], "začátek března: slunce zapadá kolem 18. hodiny");
    await S.ev(`hraPosun(10)`);
    assert.deepEqual(V(`[HRA.datum, HRA.hodina]`), ["1458-03-05", 4]);
  } finally {
    hra(null);
  }
});

test("Závoj: kostka d6 – 1–2 Pokušení, 5–6 Požehnání, 3–4 bez vlivu; záchrany a hody proti smrti se Závojem neházejí", () => {
  hra(null);
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map(d => V(`bojZavoj({d: ${d}}).r`)),
    ["pok", "pok", "", "", "poz", "poz"],
  );
  assert.equal(V(`zavVys("pok")`), "Pokušení");
  assert.equal(V(`zavBezZach("Záchrana WIS")`), true);
  assert.equal(V(`zavBezZach("hod proti smrti")`), true);
  assert.equal(V(`zavBezZach("Útok")`), false);
  assert.equal(V(`zavBezZach("Ověření Stealth")`), false);
});

test("Závoj: o svátku má postava toho vyznání Požehnání už na 4; křesťanské svátky platí katolíkům i kališníkům, Hus jen kališníkům", () => {
  hra({datum: "1458-04-24", hodina: 12});
  try {
    assert.deepEqual(V(`pozehnaniDnes("kat").map(f => f.n)`), ["sv. Jiří"]);
    assert.deepEqual(V(`pozehnaniDnes("kal").map(f => f.n)`), ["sv. Jiří"]);
    assert.deepEqual(V(`pozehnaniDnes("old")`), [], "starověrci sv. Jiří neslaví");
    assert.deepEqual(V(`pozehnaniDnes("")`), [], "bez vyznání bez svátků");
    hra({datum: "1458-07-06", hodina: 10});
    assert.deepEqual(V(`pozehnaniDnes("kat")`), []);
    assert.deepEqual(V(`pozehnaniDnes("kal").map(f => f.n)`), ["Mistr Jan Hus"]);
    assert.equal(V(`bojZavoj({d: 4, vz: "kal"}).r`), "poz", "o svátku Požehnání 4–6");
    assert.equal(V(`bojZavoj({d: 4, vz: "kat"}).r`), "", "pro katolíka všední den");
    hra({datum: "1458-03-19", hodina: 10});
    assert.deepEqual(V(`pozehnaniDnes("old").map(f => f.n)`), ["Smrtná neděle – vynášení Morany"]);
  } finally {
    hra(null);
  }
});

test("Závoj: v Hodině Závoje (poledne, půlnoc, klekání) padá Pokušení už na 1–3; svátek + Hodina = Hodina Pravdy bez neutrálního výsledku", () => {
  hra({datum: "1458-03-03", hodina: 10});
  try {
    assert.equal(V(`zavojInfo().z`), undefined, "10 hodin dopoledne není Hodina Závoje");
    hra({datum: "1458-03-03", hodina: 12});
    assert.equal(V(`zavojInfo().z`), "poledne");
    assert.equal(V(`zavojInfo().pravda`), false);
    assert.deepEqual(V(`bojZavoj({d: 3, vz: "old"})`), {d: 3, r: "pok", hod: "Hodina Závoje"});
    assert.equal(V(`bojZavoj({d: 4, vz: "old"}).r`), "", "4 je ve všední Hodině Závoje stále neutrální");
    hra({datum: "1458-04-24", hodina: 0});
    const I = V(`zavojInfo()`);
    assert.equal(I.z, "půlnoc");
    assert.equal(I.pravda, true);
    assert.deepEqual(I.fe, ["sv. Jiří"]);
    assert.deepEqual(V(`bojZavoj({d: 3, vz: "kat"})`), {d: 3, r: "pok", hod: "Hodina Pravdy"});
    assert.deepEqual(V(`bojZavoj({d: 4, vz: "kat"})`), {d: 4, r: "poz", hod: "Hodina Pravdy"});
  } finally {
    hra(null);
  }
});

test("Závoj: slunovrat je Hodina Závoje po celý den (jediný den v roce), není to svátek", () => {
  try {
    const dny = [];
    for (let d = 1; d <= 30; d++) {
      hra({datum: `1458-06-${String(d).padStart(2, "0")}`, hodina: 10});
      const I = V(`zavojInfo()`);
      if (I.z) dny.push([d, I.z, I.fe]);
    }
    assert.equal(dny.length, 1, "v červnu je Hodina Závoje v 10 dopoledne jen v den slunovratu");
    assert.equal(dny[0][1], "letní slunovrat");
    assert.ok(!dny[0][2].includes("letní slunovrat"), "slunovrat nedává Požehnání jako svátek");
    hra({datum: `1458-06-${String(dny[0][0]).padStart(2, "0")}`, hodina: 12});
    assert.equal(V(`zavojInfo().z`), "poledne o slunovratu");
  } finally {
    hra(null);
  }
});

test("Závoj: v záznamu boje se výsledek dopočítá z kostky, uložený výsledek má přednost", () => {
  assert.deepEqual(V(`bzZav(1)`), {d: 1, r: "pok", txt: ""});
  assert.deepEqual(V(`bzZav(3)`), {d: 3, r: "", txt: ""});
  assert.equal(V(`bzZav(6, "0").r`), "", "„0“ = výslovně bez vlivu");
  assert.equal(V(`bzZav(2, "poz").r`), "poz", "uložené Požehnání (svátek) vyhrává nad kostkou");
  assert.equal(V(`bzZav(null)`), null);
});

test("putování: za světla – zimní okno 8–16, letní 6–20; zima a jarní tání cestu zdrží o čtvrtinu", () => {
  assert.deepEqual(V(`cestaOkno(12)`), [8, 16]);
  assert.deepEqual(V(`cestaOkno(6)`), [6, 20]);
  assert.deepEqual(V(`cestaOkno(3)`), [7, 19]);
  assert.equal(V(`cestaSezona(1)[0]`), 1.25);
  assert.equal(V(`cestaSezona(4)[0]`), 1.25);
  assert.equal(V(`cestaSezona(11)[0]`), 1.15);
  assert.deepEqual(V(`cestaSezona(7)`), [1, ""]);
});
