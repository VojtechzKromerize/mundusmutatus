// Přepínač denního a nočního vzhledu (2026-10-29): podle zařízení → denní → noční, volba se pamatuje v prohlížeči.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("vzhled: klepnutí střídá podle zařízení → denní → noční a volba se uloží", () => {
  const r = S.ev(`JSON.stringify((() => {
    const b = document.querySelector("[data-mmmotiv]"), o = [];
    for (let i = 0; i < 3; i++) {
      b.click();
      o.push([document.documentElement.dataset.theme || "", localStorage.getItem("mm-motiv") || "", b.title]);
    }
    return o;
  })())`);
  assert.deepEqual(JSON.parse(r), [
    ["light", "light", "Vzhled: denní (klepnutím změníš)"],
    ["dark", "dark", "Vzhled: noční (klepnutím změníš)"],
    ["", "", "Vzhled: podle zařízení (klepnutím změníš)"],
  ]);
  assert.match(S.ev("mmMotivBtn()"), /data-mmmotiv/);
});
