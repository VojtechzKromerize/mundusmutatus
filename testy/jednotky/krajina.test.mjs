// Krajina roku 1458 na mapě zemí (02e-krajina.js, @čisté; 2026-10-26, Vojta): přechody a jejich zdržení podle roční doby
// a počasí, kraje zpustlé válkou, přechody blízko trasy – v čistém Node, bez stránky.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();

test("data krajiny: každý přechod má druh, souřadnice a dobový popis; oblasti mají obrys", () => {
  assert.equal(
    V(
      `PRECHODY.every(q => ["prusmyk", "most", "brod", "privoz"].includes(q[1]) && q[2] > 10 && q[3] > 46 && ["", "z", "j"].includes(q[4]) && q[5].length > 30)`,
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
