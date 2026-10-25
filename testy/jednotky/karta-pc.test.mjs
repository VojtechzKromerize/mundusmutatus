// Karta postavy na stránce Karty (Kronika › Karty) na širokém počítači (2026-10-24, Vojta): stejné široké rozvržení jako hráčova
// karta v boji na Hře (bdmpc – Statistiky a Dovednosti vlevo, listy vpravo), na telefonu dál úzká karta.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("karta na stránce Karty: na počítači od 1280 px široká, na telefonu úzká, mimo stránku Karty beze změny", async () => {
  await S.ev(`typeof kartaJednaHtml === "function" || mmLina("hra")`);
  const html = (sirka, view) =>
    S.ev(`(() => { const v0 = curView; BOJPC_MQ.matches = ${sirka}; curView = "${view}";
      try { return kartaJednaHtml(KARTBY.balduin); } finally { BOJPC_MQ.matches = false; curView = v0; } })()`);
  const pc = html(true, "karty");
  assert.match(pc, /class="bdm kdb bhkb bdmpc/, "široké rozvržení");
  assert.match(pc, /class="bdmpcst"/, "Statistiky vlevo");
  assert.match(pc, /class="bdmpcdv"/, "Dovednosti vedle nich");
  assert.doesNotMatch(pc, /data-bdmsec="vl"/, "Statistiky nejsou mezi záložkami vpravo");
  assert.doesNotMatch(pc, /bkonecb|Ukončit tah/, "bez Ukončit tah");
  const tel = html(false, "karty");
  assert.doesNotMatch(tel, /bdmpc/, "na telefonu úzká karta");
  assert.match(tel, /data-bdmsec="vl"/, "Statistiky jako záložka");
  assert.doesNotMatch(html(true, "boj"), /bdmpc/, "karta mimo boj na Hře zůstává, jak byla");
});
