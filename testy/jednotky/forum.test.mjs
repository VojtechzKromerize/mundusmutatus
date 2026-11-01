// Fórum (2026-11-01): vykreslení textu příspěvku (lišta formátování jako na phpBB fórech) a úpravy textu tlačítky lišty.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const T = t => V(`fText(${JSON.stringify(t)})`);

test("text příspěvku: řádkové značky", () => {
  assert.equal(T("**tučně** *kurzíva* __pod__ ~~pryč~~"), "<p><b>tučně</b> <i>kurzíva</i> <u>pod</u> <s>pryč</s></p>");
  assert.match(T("||tajemství||"), /<span class="fospoil"[^>]*>tajemství<\/span>/);
  assert.equal(T("((jdu na oběd))"), '<p><span class="foooct">((jdu na oběd))</span></p>');
  assert.equal(T("[Jiří](#osoba/jiri)"), '<p><a href="#osoba/jiri">Jiří</a></p>');
  assert.equal(T("[jen text](#)"), "<p>jen text</p>", "odkaz bez cíle zůstane textem");
});
test("text příspěvku: bloky – nadpis, citace, seznamy, čára, odstavce", () => {
  assert.equal(T("### Brána\nText"), '<h4 class="foh foh3">Brána</h4><p>Text</p>');
  assert.equal(T("> řekl purkmistr\n> a odešel"), '<blockquote class="foquote">řekl purkmistr<br>a odešel</blockquote>');
  assert.equal(T("- meč\n- štít"), "<ul><li>meč</li><li>štít</li></ul>");
  assert.equal(T("3. třetí\n4. čtvrtý"), '<ol start="3"><li>třetí</li><li>čtvrtý</li></ol>');
  assert.equal(T("a\n---\nb"), "<p>a</p><hr><p>b</p>");
  assert.equal(T("první\ndruhý\n\ntřetí"), "<p>první<br>druhý</p><p>třetí</p>");
});
test("text příspěvku: HTML se neprovede", () => {
  const h = T('<img src=x onerror="alert(1)"> **<b>x</b>**');
  assert.ok(!/<img|<b><b>/.test(h), h);
  assert.match(h, /&lt;img/);
  assert.equal(T("[x](javascript:alert(1))"), "<p>[x](javascript:alert(1))</p>", "jen odkazy na stránky webu (#…)");
});
test("lišta: obalení výběru, opakované stisknutí značku odebere, řádky se předsadí", () => {
  const r = V(`(() => {
    const ta = document.createElement("textarea");
    ta.value = "Ahoj světe";
    ta.setSelectionRange(5, 10);
    forumFormatuj(ta, "b");
    const a = ta.value;
    forumFormatuj(ta, "b");
    const b = ta.value;
    ta.value = "meč\\nštít";
    ta.setSelectionRange(0, 8);
    forumFormatuj(ta, "ul");
    const c = ta.value;
    forumFormatuj(ta, "ul");
    const d = ta.value;
    ta.value = "";
    ta.setSelectionRange(0, 0);
    forumFormatuj(ta, "ol");
    return [a, b, c, d];
  })()`);
  assert.deepEqual(r, ["Ahoj **světe**", "Ahoj světe", "- meč\n- štít", "meč\nštít"]);
});
