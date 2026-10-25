// Rozepsaný formulář hráče v Boji (2026-10-25, Vojta): překreslení po uložení vypravěče nesmí smazat, co hráč napsal;
// po hráčově klepnutí (odeslání) se stará hodnota do formuláře nevrací.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof bojPoleObnov === "function" || mmLina("hra")`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

const FORM = `<div data-bhpan="h3"><form class="bzbf" data-bzbf><input name="n"><input name="b" type="number"><input name="pru" type="checkbox"><button>Uložit</button></form></div>`;
const prekresli = () => S.ev(`(() => { const b = document.getElementById("__bv"); b.innerHTML = ${JSON.stringify(FORM)}; bojPoleObnov(b); })()`);

test("hodnoty napsané hráčem přežijí překreslení, které nespustil on", () => {
  S.ev(
    `(() => { BFV.clear(); let b = document.getElementById("bojview"); const d = document.createElement("div"); d.id = "__bv"; b.appendChild(d); d.innerHTML = ${JSON.stringify(FORM)}; })()`,
  );
  S.ev(`(() => { const f = document.querySelector("#__bv form"); f.elements.n.value = "Dlouhý meč"; f.elements.n.dispatchEvent(new Event("input", {bubbles: true}));
    f.elements.pru.checked = true; f.elements.pru.dispatchEvent(new Event("change", {bubbles: true})); })()`);
  prekresli();
  assert.deepEqual(
    V(`(() => { const f = document.querySelector("#__bv form"); return [f.elements.n.value, f.elements.pru.checked, f.elements.b.value]; })()`),
    ["Dlouhý meč", true, ""],
  );
});

test("po hráčově klepnutí (odeslání) se stará hodnota nevrací a zmizelé pole se zapomene", async () => {
  await new Promise(r => setTimeout(r, 5));
  S.ev(`document.querySelector("#__bv button").addEventListener("click", e => e.preventDefault()); document.querySelector("#__bv button").click()`);
  prekresli();
  assert.equal(V(`document.querySelector("#__bv form").elements.n.value`), "", "odeslaný formulář je prázdný");
  S.ev(`document.getElementById("__bv").innerHTML = ""; bojPoleObnov(document.getElementById("__bv"))`);
  assert.equal(V(`BFV.size`), 0);
  S.ev(`document.getElementById("__bv").remove()`);
});

test("pole, jehož data se mezitím změnila (životy po Enteru), dostane novou hodnotu, ne starý rozpis", () => {
  const pole = hp => `<div data-bhpan="h4"><input data-bhp="0" id="hp4" value="${hp}"></div>`;
  S.ev(`(() => { BFV.clear(); const d = document.createElement("div"); d.id = "__bv"; document.getElementById("bojview").appendChild(d);
    d.innerHTML = ${JSON.stringify(pole(20))}; const e = d.querySelector("input"); e.value = "-12"; e.dispatchEvent(new Event("input", {bubbles: true})); })()`);
  S.ev(`(() => { const b = document.getElementById("__bv"); b.innerHTML = ${JSON.stringify(pole(8))}; bojPoleObnov(b); })()`);
  assert.equal(V(`document.querySelector("#__bv input").value`), "8");
  S.ev(`(() => { const b = document.getElementById("__bv"); b.innerHTML = ${JSON.stringify(pole(20))}; bojPoleObnov(b); })()`);
  assert.equal(V(`document.querySelector("#__bv input").value`), "-12", "stejná data pod polem: rozpis se vrátí");
  S.ev(`document.getElementById("__bv").remove()`);
});
