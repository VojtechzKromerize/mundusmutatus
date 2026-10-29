// Navigace (2026-10-29, Vojta): menu Pravidla · Svět · Mapy · Kronika, Pravidla s Artikulemi jako první kapitolou.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("menu: skupiny Pravidla, Svět, Mapy, Kronika; v Pravidlech nejdřív Artikule, pak SRD a vybavení", () => {
  const sk = JSON.parse(S.ev(`JSON.stringify([...document.querySelectorAll("#navlinks .navdd > .ddtop")].map(a => a.textContent.trim()))`));
  assert.deepEqual(sk, ["Pravidla", "Svět", "Mapy", "Kronika"]);
  const pr = S.ev(`document.getElementById("navartl").textContent`);
  assert.ok(pr.indexOf("Artikule") < pr.indexOf("Pravidla SRD"), "Artikule jako první kapitola");
  assert.match(pr, /Vybavení/);
  assert.equal(S.ev(`document.querySelectorAll('#navlinks a[href="#draconomicon"]').length`), 1, "Draconomicon ve skupině Svět");
});
