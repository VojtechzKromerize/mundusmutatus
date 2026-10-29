// Kritické zranění v boji i pro NPC (Vojta 2026-10-29): v šuplíku „Komu“ jsou i nepřátelé (ne houfy), rána se zapíše k NPC.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("kritické zranění: NPC v nabídce Komu, rána se uloží k NPC a jde vyléčit", async () => {
  S.ev(`BOJ.s = {aktivni: true, scena: true, kolo: 1, tah: 0, hraci: [], npc: [{id: "n1", n: "Rotmistr", druh: "sok"}, {id: "n2", n: "Pacholci", druh: "houf", pocet: 3}]};
    BKS.komu = "npc:n1"; BKS.vys = ""; 0`);
  const html = S.ev("bojKritPanel()");
  assert.match(html, /<option value="npc:n1" selected>Rotmistr<\/option>/);
  assert.doesNotMatch(html, /Pacholci/, "houf pacholků rány nehází");
  S.ev(`(() => { let v = document.getElementById("bojview"); if (!v) { v = document.createElement("div"); v.id = "bojview"; document.body.appendChild(v); }
    v.insertAdjacentHTML("beforeend", '<div id="tkr">' + bojKritPanel() + "</div>"); document.querySelector("#tkr [data-bkhod]").click(); })()`);
  await new Promise(r => setTimeout(r, 50));
  const r = JSON.parse(S.ev(`JSON.stringify(BOJ.s.npc[0].rany || [])`));
  assert.equal(r.length, 1);
  assert.ok(r[0].t);
  assert.equal(S.ev("bojKritRany('npc:n1').length"), 1);
  S.ev(
    `(() => { const v = document.getElementById("bojview"); v.insertAdjacentHTML("beforeend", '<div id="tkr2">' + bojKritPanel() + "</div>"); document.querySelector("#tkr2 [data-bkheal]").click(); })()`,
  );
  await new Promise(r => setTimeout(r, 50));
  assert.equal(S.ev("(BOJ.s.npc[0].rany || []).length"), 0);
});
