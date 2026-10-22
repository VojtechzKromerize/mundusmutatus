"""Čekání na klid stránky místo pevných milisekund (2026-10-22).

`await klid(stránka, nejvýš)` nahrazuje `await stránka.wait_for_timeout(nejvýš)`: vrátí se, jakmile stránka nic nedělá –
nemá rozjetý fetch, krátký časovač (debounce do 2 s, kromě pulsu), rozpracované uložení karty (KPEND), boje (BZ) ani
zápis hráče (BOJ.zapis) – nejdéle však po `nejvýš` ms, takže test nikdy není pomalejší než s pevným čekáním.
Sledování si stránka nainstaluje při prvním volání (obalí fetch a setTimeout); přežije jen do obnovení stránky,
po `goto`/`reload` se nainstaluje znovu samo."""
import os
SLEDOVANI = """(() => {
  if (window.__mmK) return;
  const K = (window.__mmK = {f: 0, t: new Map()});
  const F = window.fetch;
  window.fetch = function () {
    K.f++;
    return F.apply(this, arguments).finally(() => K.f--);
  };
  const ST = window.setTimeout, CT = window.clearTimeout;
  window.setTimeout = function (fn, d, ...a) {
    if (typeof fn !== "function") return ST.apply(window, arguments);
    d = +d || 0;
    const id = ST.call(window, function () { K.t.delete(id); return fn.apply(this, a); }, d);
    if (d < 2000 && !/pulsKrok|pulsStart/.test(fn.toString())) K.t.set(id, d);
    return id;
  };
  window.clearTimeout = function (id) { K.t.delete(id); return CT.call(window, id); };
  K.idle = () => K.f === 0 && K.t.size === 0
    && (typeof KPEND === "undefined" || Object.values(KPEND).every(p => !Object.keys(p).length))
    && (typeof BZ === "undefined" || (!BZ.beh && !BZ.q.length))
    && (typeof BOJ === "undefined" || !BOJ.zapis);
})()"""
async def klid(pg,nejvys=1500):
    await pg.evaluate(SLEDOVANI)
    try: await pg.wait_for_function("window.__mmK&&window.__mmK.idle()",timeout=nejvys)
    except Exception:
        if os.environ.get("MM_KLID"):  # ladění: co stránku drží v práci (MM_KLID=1)
            print("klid: čekání",nejvys,"ms vypršelo –",await pg.evaluate("JSON.stringify({fetch:__mmK.f,casovace:[...__mmK.t.values()],kpend:typeof KPEND!=='undefined'&&Object.keys(KPEND).filter(k=>Object.keys(KPEND[k]).length),bz:typeof BZ!=='undefined'&&(BZ.beh||BZ.q.length),zapis:typeof BOJ!=='undefined'&&BOJ.zapis})"))
    await pg.wait_for_timeout(60)
