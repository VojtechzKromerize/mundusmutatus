// Navigace (2026-10-29, Vojta): menu Pravidla · Svět · Mapy · Kronika, v Pravidlech jen Pravidla a Artikule.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("menu: skupiny Pravidla, Svět, Mapy, Kronika; v Pravidlech jen Pravidla a Artikule", () => {
  const sk = JSON.parse(S.ev(`JSON.stringify([...document.querySelectorAll("#navlinks .navdd > .ddtop")].map(a => a.textContent.trim()))`));
  assert.deepEqual(sk, ["Pravidla", "Svět", "Mapy", "Kronika"]);
  const pr = JSON.parse(S.ev(`JSON.stringify([...document.querySelectorAll("#navartl > a")].map(a => a.getAttribute("href")))`));
  assert.deepEqual(pr.slice(0, 2), ["#pravidla", "#artikule"], "v Pravidlech jen Pravidla a Artikule (vypravěč navíc své Kouzla)");
  assert.equal(S.ev(`document.querySelectorAll('#navlinks a[href="#draconomicon"]').length`), 1, "Draconomicon ve skupině Svět");
});
