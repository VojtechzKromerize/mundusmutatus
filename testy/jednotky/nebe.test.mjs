// Vzdušný boj draků (10n-nebe.js, čistý soubor): karta draka z profilu plemene, šablony manévrů, změna výšky, Nálet,
// překryv, oblouky, pásma, útoky (i ocasem), Napětí, Závoj, Noční oči a zranění – návrh pravidla/vzdusny-boj-navrh.md v projektu claude.ai.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();
const blizko = (a, b, m = 0.01) => assert.ok(Math.abs(a - b) < m, `${a} ≠ ${b}`);

test("karta soumračníka: široká zaoblená křídla + vějíř z peří, bez rychlosti 4, Tichý let a Noční oči", () => {
  const K = V(`nebeKarta("soumracnik", {h: 2})`);
  assert.equal(K.d["ostra:1"], "z", "ostrá zatáčka 1 zelená (křídla)");
  assert.equal(K.d["mirna:3"], "z", "mírné zatáčky zelené");
  assert.equal(K.d["rovne:1"], "z", "vějíř: rychlost 1 zelená");
  assert.equal(K.d["rovne:2"], "b");
  assert.equal(K.d["zvrat:3"], "c", "Zvrat červený");
  assert.equal(K.d["rovne:4"], undefined, "bez rychlosti 4");
  assert.equal(K.d["viseni:0"], undefined, "vějíř není Visení");
  assert.equal(K.zaklad, 60);
  assert.equal(K.maxNap, 3);
  assert.equal(K.tichy, true);
  assert.equal(K.ocas, false, "vějíř neútočí");
  assert.equal(K.podpis, "nocni_oci");
});

test("karta korutanského lindwurmu: široká prstnatá křídla, zelené rovně 2–3, červené ostré zatáčky, vytrvalý let", () => {
  const K = V(`nebeKarta("korutansky_lindwurm", {h: 2})`);
  assert.equal(K.d["rovne:2"], "z");
  assert.equal(K.d["rovne:3"], "z");
  assert.equal(K.d["ostra:1"], "c");
  assert.equal(K.d["zvrat:3"], "c");
  assert.equal(K.d["mirna:1"], "b");
  assert.equal(K.d["rovne:4"], undefined);
  assert.equal(K.maxNap, 4, "vytrvalý let přistává až při 4 Napětí");
  assert.equal(K.ponor, true, "veslo: ponor nad vodou");
});

test("o 2 hladiny většina draků jen s námahou: Prudké stoupání a Nálet o 2 červené, Nálet o 3 jen střemhlaví", () => {
  const K = V(`nebeKarta("soumracnik", {h: 2})`);
  assert.equal(K.d["stoupani:1"], "c");
  assert.equal(K.d["nalet:1"], "b");
  assert.equal(K.d["nalet:2"], "c");
  assert.equal(K.d["nalet:3"], undefined);
  const S = V(`nebeKarta({n: "Zkouška", tr: "L", kr: "spicata", oc: "bicovity", vl: ["stremhlavy"]}, {h: 4})`);
  assert.equal(S.d["nalet:2"], "z", "špičatá křídla: Nálet zelený");
  assert.equal(S.d["nalet:3"], "b", "střemhlavý let: Nálet o 3");
  const P = V(`nebeKarta({n: "Zkouška", tr: "S", kr: "kratka_siroka", oc: "krátký", vl: []}, {h: 0})`);
  assert.equal(P.d["stoupani:1"], "z", "krátká široká křídla: prudký vzlet");
  const T = V(`nebeKarta({n: "Zkouška", tr: "T", kr: "siroka_prstnata", oc: "kyj", vl: []}, {h: 2})`);
  assert.equal(T.d["stoupani:1"], undefined, "těžký drak prudce nestoupá");
});

test("jednoduché manévry mění hladinu o 1; těžký drak a proražené vaky stoupají o barvu hůř; složité manévry výšku nemění", () => {
  const L = s =>
    V(`(() => { const K = nebeKarta(${s}); return [nebeBarva(K, {m: "rovne", r: 2, v: 1}), nebeBarva(K, {m: "rovne", r: 2, v: -1})]; })()`);
  assert.deepEqual(L(`"korutansky_lindwurm", {h: 2}`), ["z", "z"]);
  assert.deepEqual(L(`"korutansky_lindwurm", {h: 2, zr: {trup: true}}`), ["b", "z"], "proražené vaky: stoupání o barvu hůř");
  assert.deepEqual(L(`{n: "Zkouška", tr: "T", kr: "siroka_prstnata", oc: "kyj", vl: []}, {h: 2}`), ["b", "z"], "těžký drak");
  const Z = s => V(`(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebeLzeZvolit(K, ${s}, {nap: 0, h: 2}).ok; })()`);
  assert.equal(Z(`{m: "mirna", r: 2, s: "L", v: 1}`), true);
  assert.equal(Z(`{m: "ostra", r: 1, s: "L", v: 1}`), false, "ostrá zatáčka výšku nemění");
  const H = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "mirna", r: 2, s: "P", v: -1}, nebeKarta("soumracnik", {h: 2})).konec.h`);
  assert.equal(H, 1);
});

test("volba manévru: s Napětím ne červený, ne pod Přízemí ani nad Výšiny, ze země dlouhokřídlý jen s rozběhem", () => {
  const L = V(`(() => { const K = nebeKarta("korutansky_lindwurm", {h: 2}); return [
    nebeLzeZvolit(K, {m: "ostra", r: 1, s: "L"}, {nap: 0, h: 2}).ok,
    nebeLzeZvolit(K, {m: "ostra", r: 1, s: "L"}, {nap: 1, h: 2}).ok,
    nebeLzeZvolit(K, {m: "nalet", p: 1}, {nap: 0, h: 2}).ok,
    nebeLzeZvolit(K, {m: "nalet", p: 2}, {nap: 0, h: 1}).ok,
    nebeLzeZvolit(K, {m: "rovne", r: 2, v: 1}, {nap: 0, h: 4}).ok,
    nebeLzeZvolit(K, {m: "stoupani", r: 1}, {nap: 0, h: 3}).ok,
    nebeLzeZvolit(K, {m: "rovne", r: 4}, {nap: 0, h: 2}).ok,
  ]; })()`);
  assert.deepEqual(L, [true, false, true, false, false, false, false]);
  const R = V(`(() => { const K = nebeKarta({n: "Zkouška", tr: "S", kr: "dlouha_uzka", oc: "bicovity", vl: ["start_z_rozbehu"]}, {h: 0});
    return [nebeLzeZvolit(K, {m: "rovne", r: 2, v: 1}, {nap: 0, h: 0}).ok, nebeLzeZvolit(K, {m: "mirna", r: 2, s: "L", v: 1}, {nap: 0, h: 0}).ok]; })()`);
  assert.deepEqual(R, [true, true]);
  assert.equal(
    V(
      `nebeLzeZvolit(nebeKarta({n: "Z", tr: "S", kr: "siroka_zaoblena", oc: "x", vl: ["start_z_rozbehu"]}, {h: 0}), {m: "rovne", r: 1, v: 1}, {nap: 0, h: 0}).ok`,
    ),
    false,
    "rozběh: ze země ne rychlostí 1",
  );
});

test("šablony: rovně 3 posune střed o podstavec + 120, ostrá zatáčka doprava otočí o 90°", () => {
  const r = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "rovne", r: 3}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(r.x, 450);
  blizko(r.y, 600 - 60 - 120);
  assert.equal(r.u, 0);
  const o = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "ostra", r: 1, s: "P"}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(o.u, 90);
  /* střed: 30 dopředu, oblouk o poloměru 35 doprava (+35 x, −35 y), 30 doprava */
  blizko(o.x, 450 + 35 + 30);
  blizko(o.y, 600 - 30 - 35);
  const l = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "mirna", r: 2, s: "L"}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(l.u, 315);
  assert.ok(l.x < 450, "mírná doleva jde doleva");
});

test("Zvrat otočí draka o 180° až na konci; Nálet letí rovně o pokles + 1 a klesá plynule", () => {
  const z = V(
    `(() => { const H = nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "zvrat", r: 3}, nebeKarta("korutansky_lindwurm", {h: 2})); return [H.bod(0.5).u, H.konec.u]; })()`,
  );
  assert.deepEqual(z, [0, 180]);
  const n = V(
    `(() => { const H = nebeDraha({x: 450, y: 600, u: 0, h: 3}, {m: "nalet", p: 2}, nebeKarta("soumracnik", {h: 3})); return [H.bod(0.5).h, H.konec.h, H.konec.y]; })()`,
  );
  assert.equal(n[0], 2);
  assert.equal(n[1], 1);
  blizko(n[2], 600 - 60 - 120, 0.01);
});

test("překryv na stejné hladině rozestoupí draky, na jiné hladině ne", () => {
  const p = V(
    `(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePrekryv({x: 400, y: 400, u: 0, h: 2}, {x: 420, y: 400, u: 90, h: 2}, K, K); })()`,
  );
  blizko(Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y), 60);
  blizko((p.a.x + p.b.x) / 2, 410);
  assert.equal(
    V(
      `(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePrekryv({x: 400, y: 400, u: 0, h: 2}, {x: 420, y: 400, u: 0, h: 3}, K, K); })()`,
    ),
    null,
  );
});

test("oblouky a pásma: vpředu, za ocasem, na boku; rozdíl dvou hladin = o pásmo dál", () => {
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 0}, {x: 10, y: -100})`), "predni");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 0}, {x: 0, y: 100})`), "zadni");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 90}, {x: 0, y: -100})`), "bok");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 90}, {x: 100, y: 5})`), "predni");
  const P = s => V(`(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePasmo(${s}, K, K); })()`);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 150, h: 2}`), 1);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 250, h: 2}`), 2);
  assert.equal(P(`{x: 0, y: 0, h: 1}, {x: 0, y: 250, h: 3}`), 3);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 450, h: 2}`), 0);
});

test("útok draka z konečných pozic: přední oblouk a stejná hladina; Nálet +1k6 za hladinu pádu, Tichý let výhodu; hlava neútočí", () => {
  const U = s =>
    V(`(() => { const Ks = nebeKarta("soumracnik", {h: 2}), Kl = nebeKarta("korutansky_lindwurm", {h: 2}); return nebeUtokDraka(${s}); })()`);
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}`).kousnuti.muze, true);
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 1}, Ks, Kl, {m: "rovne", r: 2}`).kousnuti.muze, false);
  const n = U(`{x: 0, y: 0, u: 0, h: 1}, {x: 0, y: -100, u: 180, h: 1}, Ks, Kl, {m: "nalet", p: 2}`).kousnuti;
  assert.equal(n.muze, true);
  assert.equal(n.bonus, 2);
  assert.equal(n.vyhoda, true, "soumračník: Tichý let");
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: 100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}`).kousnuti.muze, false, "za zády");
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}, {hlava: true}`).kousnuti.muze, false);
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}`).ocas, null, "soumračník ocasem neútočí");
});

test("útok ocasem: jen plemena s kyjem, ostnem, ostny nebo hákem, do zadního oblouku na pásmo 1; zraněný ocas ne", () => {
  const U = (zr = "{}") =>
    V(`(() => { const Kk = nebeKarta({n: "Kyj", tr: "T", kr: "siroka_prstnata", oc: "kyj", vl: []}, {h: 2, zr: ${zr}}), Ks = nebeKarta("soumracnik", {h: 2});
      return nebeUtokDraka({x: 0, y: 0, u: 0, h: 2}, {x: 0, y: 110, u: 0, h: 2}, Kk, Ks, {m: "rovne", r: 1}); })()`);
  const u = U();
  assert.equal(u.ocas.muze, true);
  assert.equal(u.kousnuti.muze, false, "vpředu nikdo není");
  assert.equal(U(`{ocas: true}`).ocas, null, "zraněný ocas: bez útoku ocasem");
  assert.equal(V(`nebeKarta({n: "Bič", tr: "S", kr: "siroka_prstnata", oc: "bicovity", vl: []}, {h: 2}).ocas`), false, "bičovitý ocas neútočí");
});

test("Napětí: zelená −1, červená +1, Výšiny bez Výškového letu +1, nikdy pod nulu", () => {
  const K = `nebeKarta("soumracnik", {h: 2})`;
  assert.equal(V(`nebeNapeti(1, "z", ${K}, 2)`), 0);
  assert.equal(V(`nebeNapeti(0, "z", ${K}, 2)`), 0);
  assert.equal(V(`nebeNapeti(0, "c", ${K}, 2)`), 1);
  assert.equal(V(`nebeNapeti(0, "b", ${K}, 4)`), 1);
});

test("Závoj u červeného manévru: Pokušení = drak letí rovně, Požehnání = bez Napětí, bílý manévr se nehází", () => {
  const Z = s => V(`(() => { const K = nebeKarta("korutansky_lindwurm", {h: 2}); return nebeZavoj(K, ${s}); })()`);
  const p = Z(`{m: "ostra", r: 2, s: "L"}, 1`);
  assert.deepEqual(p.r, {m: "rovne", r: 2, v: 0});
  assert.equal(p.barva, "z", "rovně 2 je u lindwurmu zelené");
  assert.equal(Z(`{m: "ostra", r: 2, s: "L"}, 6`).barva, "b");
  assert.equal(Z(`{m: "ostra", r: 2, s: "L"}, 3`).barva, "c");
  assert.equal(Z(`{m: "mirna", r: 2, s: "L"}, 1`).t, "", "bílý manévr – Závoj se neuplatní");
});

test("Noční oči: jen v noci a jen u soumračníka; rychlost ±1 nebo mírná ↔ ostrá podle číselníku", () => {
  const N = (pl, r, noc) =>
    V(`(() => { const K = nebeKarta("${pl}", {h: 2}); return nebeNocniOci(K, ${r}, {noc: ${noc}, nap: 0, h: 2}).map(nebeKlic).sort(); })()`);
  assert.deepEqual(N("soumracnik", `{m: "mirna", r: 2, s: "L"}`, true), ["mirna:1", "mirna:3", "ostra:2"]);
  assert.deepEqual(N("soumracnik", `{m: "mirna", r: 2, s: "L"}`, false), []);
  assert.deepEqual(N("korutansky_lindwurm", `{m: "mirna", r: 2, s: "L"}`, true), []);
  assert.deepEqual(N("soumracnik", `{m: "rovne", r: 3}`, true), ["rovne:2"], "rychlost 4 soumračník nemá");
});
