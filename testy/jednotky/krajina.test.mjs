// Krajina roku 1458 na mapě zemí (02e-krajina.js, @čisté; 2026-10-26, Vojta): přechody a jejich zdržení podle roční doby
// a počasí, kraje zpustlé válkou, přechody blízko trasy – v čistém Node, bez stránky.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();

test("data krajiny: každý přechod má druh, souřadnice a dobový popis; oblasti mají obrys", () => {
  assert.equal(
    V(
      `PRECHODY.every(q => ["prusmyk", "most", "brod", "privoz"].includes(q[1]) && q[2] > 9.5 && q[2] < 23 && q[3] > 44.4 && q[3] < 55.4 && ["", "z", "j"].includes(q[4]) && q[5].length > 30)`,
    ),
    true,
  );
  assert.equal(V(`HOSP_BODY.every(q => HOSP_DRUH[q[1]] && q[2] && q[5].length > 20)`), true);
  assert.equal(V(`[...HOSP_OBL.map(o => o[2]), ...ZPUSTLE.map(o => o[2])].every(p => p.length >= 5)`), true);
  assert.equal(V(`ZPUSTLE.every(z => z[1] === 1 || z[1] === 2)`), true);
  assert.equal(V(`new Set(PRECHODY.map(q => q[0])).size === PRECHODY.length`), true, "jména přechodů jsou jedinečná");
});

test("průsmyk se sněhem: počasí rozhoduje (vánice zavře, sníh zdrží), bez počasí podle měsíce; v létě nic", () => {
  assert.equal(V(`prechodStav("prusmyk", "z", 1, {snih: 6}).k`), "stuj");
  assert.equal(V(`prechodStav("prusmyk", "z", 1, {snih: 3}).h`), 4);
  assert.equal(V(`prechodStav("prusmyk", "z", 1, {snih: 0})`), null, "bez sněhu se projde i v lednu");
  assert.equal(V(`prechodStav("prusmyk", "z", 1).h`), 6);
  assert.equal(V(`prechodStav("prusmyk", "z", 3).h`), 2);
  assert.equal(V(`prechodStav("prusmyk", "z", 7)`), null);
  assert.equal(V(`prechodStav("prusmyk", "", 1, {snih: 8})`), null, "nízké sedlo (Moravská brána) sníh nezavře");
});

test("brod a přívoz na jaře: povodeň zastaví, jarní voda zdrží; most nikdy; led zastaví jen přívoz", () => {
  assert.equal(V(`prechodStav("brod", "j", 4, {povoden: true}).k`), "stuj");
  assert.equal(V(`prechodStav("brod", "j", 4, {blato: 1}).h`), 3);
  assert.equal(V(`prechodStav("brod", "j", 4, {blato: 0})`), null);
  assert.equal(V(`prechodStav("brod", "j", 8, {blato: 2})`), null);
  assert.equal(V(`prechodStav("privoz", "j", 1, {tx: -10}).k`), "stuj");
  assert.equal(V(`prechodStav("brod", "j", 1, {tx: -10})`), null);
  assert.equal(V(`prechodStav("most", "", 4, {povoden: true})`), null);
});

test("kraje zpustlé válkou: Plzeňsko ano, Praha ne", () => {
  assert.equal(V(`zpustlyKraj(13.1, 49.7)[0]`), "Zpustlé Plzeňsko a Tachovsko");
  assert.equal(V(`zpustlyKraj(14.42, 50.09)`), null);
});

test("přechody na trase: cesta z Hradce do Kladska jde Náchodským průsmykem, vzdálené přechody ne", () => {
  const r = V(`prechodyNaTrase([[15.83, 50.21], [16.16, 50.42], [16.65, 50.44]])`);
  assert.ok(
    r.some(x => x.n === "Náchodský průsmyk" && x.p > 0.2 && x.p < 0.8),
    JSON.stringify(r.map(x => x.n)),
  );
  assert.ok(!r.some(x => x.n === "Semmering"));
  assert.deepEqual(V(`prechodyNaTrase([[14.4, 50.1]])`), []);
});

test("věrnost králi: města mají skupinu z povolené množiny a dobovou větu; místo bez města bere věrnost rodu (2026-10-27)", () => {
  const skup = V(`Object.keys(VERNOST_SKUP)`);
  assert.deepEqual(skup, ["verni", "vahaji", "odpurci", "cizi"]);
  assert.deepEqual(V(`Object.entries(VERNOST_MIST).filter(([n, v]) => !VERNOST_SKUP[v[0]] || v[1].length < 30).map(e => e[0])`), []);
  assert.equal(V(`vernostMista("Praha", [])[0]`), "verni");
  assert.equal(V(`vernostMista("Vratislav", [])[0]`), "odpurci");
  assert.equal(V(`vernostMista("Brno", [])[0]`), "vahaji", "k 3. 3. Brno ještě nic neodmítlo – jen váhá");
  const rod = `{seats: [["Krumlov", 14, 48], ["Mejdštejn", 14, 48]], vern: {v: "vahaji", t: "věta", m: {Mejdštejn: ["odpurci", "Oldřich"]}}}`;
  assert.deepEqual(V(`[vernostMista("Krumlov", [${rod}]), vernostMista("Mejdštejn", [${rod}])]`), [
    ["vahaji", "věta"],
    ["odpurci", "Oldřich"],
  ]);
  assert.equal(V(`vernostMista("Krumlov", [{seats: [["Krumlov", 14, 48]]}])`), null, "rod bez věrnosti (hráč ho jen „slyšel“) nic neprozradí");
});

test("poutě, kláštery a pověsti: každý bod má druh, souřadnice v rozsahu mapy a text; klášter řád, stav a vyznání (2026-10-27)", () => {
  const n = V(`POUTE.length`);
  assert.ok(n >= 30 && n <= 150, "bodů " + n);
  assert.deepEqual(V(`POUTE.filter(q => !POUTE_DRUH[q.d] || !POUTE_ZN[q.d]).map(q => q.n)`), []);
  /* rozsah mapy MAPWB (02, od 2026-10-27 od Baltu k Jadranu): lon 9,5–23,0°, lat 44,4–55,4° */
  assert.deepEqual(V(`POUTE.filter(q => !(q.lo > 9.5 && q.lo < 23 && q.la > 44.4 && q.la < 55.4)).map(q => q.n)`), []);
  assert.deepEqual(V(`POUTE.filter(q => !q.ref && q.t.length < 40).map(q => q.n)`), [], "dobový text (ref = shrnutí místa na mapě)");
  assert.deepEqual(V(`POUTE.filter(q => q.d === "klaster" && !(q.r && POUTE_STAV[q.s] && q.v)).map(q => q.n)`), []);
  assert.equal(V(`new Set(POUTE.map(q => q.n)).size`), n, "jména jsou jedinečná");
  for (const d of ["pout", "klaster", "povest"]) assert.ok(V(`POUTE.filter(q => q.d === "${d}").length`) >= 5, d);
  assert.deepEqual(V(`POUTE.filter(q => /14[6-9]\\d|15\\d\\d/.test(q.t)).map(q => q.n)`), [], "žádné letopočty po roce 1458");
});

test("voda pro výpočet cest: moře, zálivy a velká jezera jsou voda, pobřežní města a ostrovní Benátky souš (2026-10-27)", () => {
  const voda = [
    [17.0, 55.0, "Baltské moře"],
    [20.02, 54.63, "Viselský záliv"],
    [21.1, 55.1, "Kuršský záliv"],
    [14.4, 53.75, "Štětínský záliv"],
    [13.5, 44.9, "Jaderské moře"],
    [17.75, 46.85, "Balaton"],
  ];
  for (const [lo, la, n] of voda) assert.equal(V(`naVode(${lo}, ${la})`), true, n);
  const sous = [
    [14.42, 50.09, "Praha"],
    [18.65, 54.35, "Gdaňsk"],
    [20.51, 54.71, "Královec"],
    [14.55, 53.43, "Štětín"],
    [10.69, 53.87, "Lübeck"],
    [12.335, 45.437, "Benátky"],
    [13.77, 45.65, "Terst"],
    [13.4, 54.45, "Rujána"],
    [14.9, 55.12, "Bornholm"],
  ];
  for (const [lo, la, n] of sous) assert.equal(V(`naVode(${lo}, ${la})`), false, n);
});

test("konflikty na mapě: spor rodů vede mezi prvními sídly, válka států jednou na dvojici a bez kotvy se nekreslí", () => {
  const k = V(`konfliktyKoruny(
    [{t: "spor", ids: ["a", "b", "c"], x: "Svár."}, {t: "spoj", ids: ["a", "b"], x: ""}, {t: "spor", ids: ["a", "d"], x: "", $gm: true}],
    {a: {name: "A", seats: [["X", 14, 50]]}, b: {name: "B", seats: [["Y", 15, 49]]}, c: {name: "C", seats: [], nomap: false}, d: {name: "D", seats: [["Z", 16, 48]]}},
    [{id: "teu", k: "Řád", n: "Řád", sp: ["pol"], na: []}, {id: "pol", k: "Polsko", n: "Polsko", sp: ["teu"], na: ["xxx"]}, {id: "xxx", k: "X", n: "X", sp: [], na: []}]
  )`);
  assert.deepEqual(
    k.map(c => [c.k, c.druh, c.ids.join(">"), c.gm]),
    [
      ["rod", "spor", "a>b", false],
      ["rod", "spor", "a>d", true],
      ["stat", "valka", "teu>pol", false],
    ],
  );
  assert.deepEqual(k[0].a, [14, 50]);
  assert.equal(V(`konfliktyKoruny([], {}, []).length`), 0);
});
