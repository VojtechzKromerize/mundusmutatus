"""Čekání na klid stránky místo pevných milisekund (2026-10-22).

`await klid(stránka, nejvýš)` nahrazuje `await stránka.wait_for_timeout(nejvýš)`: vrátí se, jakmile stránka nic nedělá –
nemá rozjetý fetch, krátký časovač (debounce do 2 s, kromě pulsu), rozpracované uložení karty (KPEND), boje (BZ) ani
zápis hráče (BOJ.zapis) – nejdéle však po `nejvýš` ms, takže test nikdy není pomalejší než s pevným čekáním.
Sledování si stránka nainstaluje při prvním volání (obalí fetch a setTimeout) a zároveň jako init skript, takže po
`goto`/`reload` běží od prvního řádku stránky (2026-10-25: dřív se nainstalovalo až po načtení a fetch rozjetý při startu
nebylo vidět – klid se mohl vrátit předčasně).

`await dokud(stránka, "výraz JS", nejvýš)` počká, až výraz platí (wait_for_function), a vrátí True/False – bez výjimky,
takže kontrola `chk(...)` za ním hlásí chybu stejně jako dřív. Pro změny, které dorazí od jiné stránky přes databázi,
je `puls_dokud` v testy/_puls.py."""
import os, re
from playwright.async_api import Error as PWError, TimeoutError as PWTimeout
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
async def sleduj(pg):
    """Nainstaluje sledování (jednou na stránku; i pro další načtení přes init skript)."""
    if not getattr(pg, "_mm_klid", False):
        try:
            await pg.add_init_script(SLEDOVANI)
            pg._mm_klid = True
        except Exception: pass
    await pg.evaluate(SLEDOVANI)
async def _klid1(pg,nejvys):
    await sleduj(pg)
    try: await pg.wait_for_function("window.__mmK&&window.__mmK.idle()",timeout=nejvys)
    except PWTimeout:
        if os.environ.get("MM_KLID"):  # ladění: co stránku drží v práci (MM_KLID=1)
            print("klid: čekání",nejvys,"ms vypršelo –",await pg.evaluate("JSON.stringify({fetch:__mmK.f,casovace:[...__mmK.t.values()],kpend:typeof KPEND!=='undefined'&&Object.keys(KPEND).filter(k=>Object.keys(KPEND[k]).length),bz:typeof BZ!=='undefined'&&(BZ.beh||BZ.q.length),zapis:typeof BOJ!=='undefined'&&BOJ.zapis})"))
async def klid(pg,nejvys=1500):
    try: await _klid1(pg,nejvys)
    except PWTimeout: pass
    except PWError as e:  # stránka se mezitím obnovila (uložení v editoru, odhlášení): počkat na nové načtení a znovu
        if not re.search(r"context was destroyed|navigat|Target closed", str(e)): raise
        await pg.wait_for_load_state()
        try: await _klid1(pg,nejvys)
        except PWTimeout: pass
    await pg.wait_for_timeout(60)  # pevně: drobná rezerva na dokreslení po klidu
def _bezpecne(podminka):
    """Výraz JS jako funkce, která při chybě (např. stav ještě nenačtený) vrátí false místo výjimky."""
    return "()=>{try{return !!("+podminka+")}catch(e){return false}}"
async def dokud(pg,podminka,nejvys=5000):
    """Počká, až výraz JS `podminka` na stránce platí (nejdéle `nejvys` ms); vrátí, zda platí. Výjimku nevyhodí."""
    try:
        await pg.wait_for_function(_bezpecne(podminka),timeout=nejvys)
        return True
    except Exception:
        if os.environ.get("MM_KLID"): print("dokud: nesplněno za",nejvys,"ms –",podminka[:160])
        return False
