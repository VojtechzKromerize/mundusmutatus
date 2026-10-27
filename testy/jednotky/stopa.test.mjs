// Stopa družiny na mapě (07s-stopa.js, @čisté; 2026-10-28, Vojta): počátek stopy, volba diváka (poslední cesta / od počátku /
// celé tažení), skrytý zápis jako počátek, posuvník před počátkem, stáří úseků, šipka a cesty z Výpravy. Na konci kresba na stránce.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const {V} = ciste();
const Z = JSON.stringify([
  {id: "a", place: "Praha", route: ["Praha"], datum: "1458-03-03", hodina: 10},
  {id: "b", place: "Kutná Hora", route: ["Praha", "Kouřim", "Kutná Hora"], datum: "1458-03-05", hodina: 18},
  {id: "c", place: "Čáslav", route: ["Kutná Hora", "Čáslav"], datum: "1458-03-07", hodina: 12},
  {id: "d", place: "Brno", route: ["Čáslav", "Jihlava", "Brno"], datum: "1458-03-12", hodina: null},
]);
const R = o => V(`stopaRozsah(${Z}, ${JSON.stringify(o)})`);
const jm = r => r.zast.map(q => q.n);

test("celé tažení: všechna místa v pořadí bez opakování, zápisy končí na svých místech", () => {
  const r = R({pohled: "cele"});
  assert.deepEqual(jm(r), ["Praha", "Kouřim", "Kutná Hora", "Čáslav", "Jihlava", "Brno"]);
  assert.deepEqual(
    r.zast.map(q => q.z),
    [[0], [], [1], [2], [], [3]],
  );
  assert.equal(r.odT, null);
});

test("bez počátku je „od počátku stopy“ totéž co celé tažení", () => {
  assert.deepEqual(jm(R({pohled: "pocatek"})), jm(R({pohled: "cele"})));
  assert.deepEqual(jm(R({})), jm(R({pohled: "cele"})));
});

test("počátek v zápisu: stopa začíná v místě, kde zápis končí; cesta k němu už se nekreslí", () => {
  const r = R({pohled: "pocatek", od: {z: "c", datum: "1458-03-07", hodina: 12}});
  assert.deepEqual(jm(r), ["Čáslav", "Jihlava", "Brno"]);
  assert.deepEqual(r.odT, {datum: "1458-03-07", hodina: 12});
  /* smazaná stopa (počátek = poslední zápis): jen místo družiny */
  assert.deepEqual(jm(R({pohled: "pocatek", od: {z: "d", datum: "1458-03-13", hodina: 9}})), ["Brno"]);
});

test("poslední cesta: z místa předchozího zápisu k poslednímu; cesty z Výpravy od předchozího zápisu", () => {
  const r = R({pohled: "posledni", od: {z: "a"}});
  assert.deepEqual(jm(r), ["Čáslav", "Jihlava", "Brno"]);
  assert.deepEqual(r.odT, {datum: "1458-03-07", hodina: 12});
  assert.deepEqual(jm(R({pohled: "posledni", lim: 1})), ["Praha", "Kouřim", "Kutná Hora"]);
});

test("počátek ve skrytém zápisu (hráč ho nemá): hledá se podle data, budoucí nic neprozradí", () => {
  /* hráč nezná zápis „x“ z 6. 3.; stopa začne prvním známým zápisem od té doby, i s jeho cestou */
  assert.deepEqual(jm(R({pohled: "pocatek", od: {z: "x", datum: "1458-03-06", hodina: 8}})), ["Kutná Hora", "Čáslav", "Jihlava", "Brno"]);
  /* po počátku zatím žádný známý zápis: prázdná stopa (jen praporec družiny) */
  assert.deepEqual(jm(R({pohled: "pocatek", od: {z: "x", datum: "1458-04-01", hodina: 8}})), []);
});

test("posuvník před počátkem stopy ukáže cestu k tomu zápisu; za počátkem stopu jen do něj", () => {
  const od = {z: "c", datum: "1458-03-07", hodina: 12};
  assert.deepEqual(jm(R({pohled: "pocatek", od, lim: 1})), ["Praha", "Kouřim", "Kutná Hora"]);
  assert.deepEqual(jm(R({pohled: "pocatek", od, lim: 2})), ["Čáslav"]);
  assert.deepEqual(jm(R({pohled: "cele", lim: 2})), ["Praha", "Kouřim", "Kutná Hora", "Čáslav"]);
});

test("úseky slábnou se stářím, nejnovější je plný", () => {
  const u = V(`stopaUseky(stopaRozsah(${Z}, {pohled: "cele"}).zast, 3)`);
  assert.deepEqual(
    u.map(x => [x.a, x.b, x.vek]),
    [
      ["Praha", "Kouřim", 2],
      ["Kouřim", "Kutná Hora", 2],
      ["Kutná Hora", "Čáslav", 1],
      ["Čáslav", "Jihlava", 0],
      ["Jihlava", "Brno", 0],
    ],
  );
  assert.deepEqual(V(`[0, 1, 2, 10].map(stopaSila)`), [1, 0.82, 0.64, 0.28]);
});

test("šipka v polovině délky čáry míří po směru cesty; krátký úsek bez šipky", () => {
  assert.deepEqual(V(`stopaSipka([[0, 0], [10, 0], [10, 10]])`), {x: 10, y: 0, a: 0});
  assert.deepEqual(V(`stopaSipka([[0, 0], [0, 20]])`), {x: 0, y: 10, a: 90});
  assert.equal(V(`stopaSipka([[0, 0], [3, 4]], 10)`), null);
  assert.equal(V(`stopaSipka([[0, 0]])`), null);
});

test("cesty z Výpravy: od počátku stopy a do okamžiku posuvníku; bez konce jen v celém tažení", () => {
  const P = JSON.stringify([{z: "A", t1: 100}, {z: "B", t1: 200}, {z: "C"}, {z: "D", t1: 300}]);
  assert.deepEqual(
    V(`stopaPutovani(${P}, null, null)`).map(c => c.z),
    ["A", "B", "C", "D"],
  );
  assert.deepEqual(
    V(`stopaPutovani(${P}, 150, null)`).map(c => c.z),
    ["B", "D"],
  );
  assert.deepEqual(
    V(`stopaPutovani(${P}, 150, 250)`).map(c => c.z),
    ["B"],
  );
});

test("pomocné: klíč okamžiku a krátké datum", () => {
  assert.equal(V(`stopaKlic({datum: "1458-03-05", hodina: 7})`), "1458-03-05T07");
  assert.equal(V(`stopaKlic({datum: "", hodina: 7})`), "");
  assert.equal(V(`stopaDatumKr("1458-03-05")`), "5. 3.");
  assert.equal(V(`stopaDatumKr("")`), "");
});

/* kresba na stránce (jsdom, vypravěčská statická verze) */
let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("mapa: stopa po cestách se šipkami, zastávky s datem, „Družina je tady“; počátek a volba diváka stopu zkrátí", () => {
  const out = JSON.parse(
    S.ev(`JSON.stringify((() => {
      const puv = ZAPISY.slice();
      ZAPISY.length = 0;
      ZAPISY.push(...${Z}.map((z, i) => Object.assign({n: "Sezení " + i, title: "Zápis " + z.id, date: z.datum, text: ""}, z)));
      ZAPISY.forEach(z => (ZBY[z.id] = z));
      const h0 = HRA;
      HRA = {datum: "1458-03-13", hodina: 9, misto: "Brno"};
      st.party = true;
      st.cas = null;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        kresli = () => {
          svg.innerHTML = "";
          drawParty(svg, 1, 1);
          return {
            useky: svg.querySelectorAll(".stopa polyline[stroke='var(--kal)']").length,
            sipky: svg.querySelectorAll(".stopasip").length,
            body: Math.max(0, ...[...svg.querySelectorAll(".stopa polyline[stroke='var(--kal)']")].map(p => p.getAttribute("points").split(" ").length)),
            zast: [...svg.querySelectorAll(".zapmk")].map(g => g.querySelector(".stopadat") && g.querySelector(".stopadat").textContent),
            tady: (svg.querySelector(".stopatady") || {}).textContent,
          };
        };
      const cele = kresli();
      HRA.stopaOd = {z: "c", datum: "1458-03-07", hodina: 12};
      const odC = kresli();
      STOPAP = "posledni";
      const posl = kresli();
      HRA.stopaOd = {z: "d", datum: "1458-03-13", hodina: 9};
      STOPAP = "pocatek";
      const smaz = kresli();
      const panel = stopaHtml({tady: 1});
      ZAPISY.length = 0;
      ZAPISY.push(...puv);
      HRA = h0;
      STOPAP = null;
      return {cele, odC, posl, smaz, panel};
    })())`),
  );
  assert.equal(out.cele.useky, 5, "pět úseků mezi šesti místy");
  assert.ok(out.cele.body > 2, "úsek vede po síti cest, ne vzdušnou čarou");
  assert.ok(out.cele.sipky >= 4, "šipky směru");
  assert.deepEqual(out.cele.zast, ["3. 3.", "5. 3.", "7. 3.", "12. 3."]);
  assert.equal(out.cele.tady, "Družina je tady");
  assert.equal(out.odC.useky, 2, "od počátku v Čáslavi jen Čáslav – Jihlava – Brno");
  assert.deepEqual(out.odC.zast, ["7. 3.", "12. 3."]);
  assert.equal(out.posl.useky, 2);
  assert.equal(out.smaz.useky, 0, "smazaná stopa: jen praporec a pečeť posledního zápisu");
  assert.deepEqual(out.smaz.zast, ["12. 3."]);
  assert.match(out.panel, /Družina je tady/);
  assert.match(out.panel, /data-stopasmaz/, "vypravěč má v panelu Smazat stopu");
});
