# Reakce v Boji: hráč z telefonu i vypravěč ji zaškrtnou na bojové kartě postavy (s kartou) a po uložení zůstane;
# pozdní načtení starší verze stavu ji nesmí vrátit.
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
t=json.loads(urllib.request.urlopen(urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")).read())
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)

async def priprava(g,jmena,hody,dm,npc=(),spoj=()):
    """Příprava boje na stránce Boj: postavy s hody, nepřátelé a spojenci přes formuláře, hod nepřátel, Začít boj."""
    await g.wait_for_selector(".bprip")
    await g.evaluate("bojZmen(z=>{z.hraci="+json.dumps([{"id":"h"+str(i+1),"n":"","hod":None} for i in range(len(jmena))])+";z.npc=[];z.nid=0;z.dm=null;delete z.ticha})")
    await g.wait_for_timeout(400)
    for i,(n,h) in enumerate(zip(jmena,hody)):
        f=g.locator(f'[data-bhn="h{i+1}"]');await f.fill(n);await f.press("Tab");await g.wait_for_timeout(150)
        if h is not None:
            f=g.locator(f'[data-bhhod="h{i+1}"]');await f.fill(str(h));await f.press("Tab");await g.wait_for_timeout(150)
    for fid,rows in (("bnadd",npc),("bnadds",spoj)):
        for (n,d,p) in rows:
            if fid=="bnadds" and not await g.locator("#bnadds").is_visible(): await g.click('[data-otv="pridej-s"] summary')
            await g.fill(f'#{fid} [name=nn]',n);await g.select_option(f'#{fid} [name=nd]',d)
            if p: await g.fill(f'#{fid} [name=np]',str(p))
            await g.click(f'#{fid} button[type=submit]');await g.wait_for_timeout(350)
    if dm is not None:
        f=g.locator('[data-bdm]');await f.fill(str(dm));await f.press("Tab");await g.wait_for_timeout(400)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    g=await b.new_page(viewport={"width":1300,"height":1000});g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    gerr=[];g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":t["access_token"],"rt":t["refresh_token"],"exp":t["expires_at"],"email":"gm@x.cz"})+"))")
    await g.goto(BASE+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(600)
    if await g.locator("[data-bact=konec]").count():
        await g.click("[data-bact=konec]");await g.wait_for_timeout(800)
        if await g.locator('[data-bkon="ok"]').count(): await g.click('[data-bkon="ok"]');await g.wait_for_timeout(800)
    await priprava(g,["Balduin","Bára"],[15,12],10)
    await g.click('[data-bstart]');await g.wait_for_selector(".bsloty");await g.wait_for_timeout(1500)
    await g.evaluate("bojZmen(z=>{z.obsazeni=z.obsazeni||{};const i=z.sloty.findIndex(x=>x.t!=='n');z.tah=i;z.obsazeni[i]='h1'})");await g.wait_for_timeout(1500)
    pl=await b.new_page(viewport={"width":390,"height":844});err=[];pl.on("pageerror",lambda e:err.append(str(e)[:200]))
    pl.on("console",lambda m:m.type=="error" and err.append(m.text[:200]))
    await pl.goto(BASE+"#boj");await pl.wait_for_selector(".bsloty",state="attached")
    await pl.evaluate("bojJa.set('Balduin');renderBoj()");await pl.wait_for_timeout(1500)
    print("hráč tlačítka:",await pl.evaluate("[...document.querySelectorAll('[data-bhrk]')].map(b=>b.className+' in-bhpan:'+!!b.closest('[data-bhpan]'))"))
    for sel in ('.bdm .bdmrk[data-bhrk]','.bdm .bdmsg[data-bhrk]'):
        await pl.evaluate("mmPopX()")  # ukázka vypravěče by překážela klepnutí
        if await pl.locator('.bdm [data-bdmaf="R"]:not([aria-selected="true"])').count(): await pl.locator('.bdm [data-bdmaf="R"]').first.click();await pl.wait_for_timeout(600)  # pod-karta Reakce (2026-10-21); zobrazená je zároveň přepínač
        if not await pl.locator(sel).count(): print("chybí",sel);continue
        await pl.locator(sel).first.click();await pl.wait_for_timeout(600)
        a=await pl.evaluate("JSON.stringify(BOJ.s.reak||null)");await pl.wait_for_timeout(4000)
        chk(await pl.evaluate("!!(BOJ.s.reak||{}).h1"),f"hráč {sel}: hned {a}, po 4 s {await pl.evaluate('JSON.stringify(BOJ.s.reak||null)')}")
        await pl.locator(sel).first.click();await pl.wait_for_timeout(4000)
        chk(await pl.evaluate("!(BOJ.s.reak||{}).h1"),f"hráč {sel} odškrtne")
    await g.evaluate("BKART.h1=true;renderBoj()");await g.wait_for_timeout(600)
    print("GM tlačítka:",await g.evaluate("[...document.querySelectorAll('[data-break=h1]')].map(b=>b.className+' bdm:'+!!b.closest('.bdm'))"))
    for sel in ('.bdm .bdmrk[data-break="h1"]','.bdm .bdmsg[data-break="h1"]'):
        await g.evaluate("mmPopX()")
        if await g.locator('.bdm [data-bdmaf="R"]:not([aria-selected="true"])').count(): await g.locator('.bdm [data-bdmaf="R"]').first.click();await g.wait_for_timeout(600)
        if not await g.locator(sel).count(): print("chybí",sel);continue
        await g.locator(sel).first.click();await g.wait_for_timeout(600)
        a=await g.evaluate("JSON.stringify(BOJ.s.reak||null)");await g.wait_for_timeout(4000)
        chk(await g.evaluate("!!(BOJ.s.reak||{}).h1"),f"GM {sel}: hned {a}, po 4 s {await g.evaluate('JSON.stringify(BOJ.s.reak||null)')}")
        await g.locator(sel).first.click();await g.wait_for_timeout(4000)
        chk(await g.evaluate("!(BOJ.s.reak||{}).h1"),f"GM {sel} odškrtne")
    # souběh: vypravěč klikne na reakci, zatímco se ještě načítá stav po zápisu hráče z telefonu
    await g.wait_for_timeout(1500);await pl.evaluate("bojHracAkce('h1',h=>{h.kryt=2})");await pl.wait_for_timeout(250)
    await g.evaluate("window.__puv=MMDB.bojNacti;MMDB.bojNacti=async()=>{const r=await window.__puv.call(MMDB);await new Promise(o=>setTimeout(o,1200));return r};window.__p=bojNacti()")
    await g.wait_for_timeout(150);await g.locator('.bdm .bdmsg[data-break="h1"]').first.click()
    await g.wait_for_timeout(200)
    chk(await g.evaluate("!!(BOJ.s.reak||{}).h1"),"souběh: pozdní načtení starší verze reakci nevrátí")
    await g.wait_for_timeout(4000);await g.evaluate("MMDB.bojNacti=window.__puv")
    st=await g.evaluate("JSON.stringify([BOJ.s.reak||null,(BOJ.s.hraci.find(h=>h.id==='h1')||{}).kryt||null])")
    chk(await g.evaluate("!!(BOJ.s.reak||{}).h1&&(BOJ.s.hraci.find(h=>h.id==='h1')||{}).kryt===2"),"souběh: reakce vypravěče i kryt hráče zůstanou "+st)
    await g.goto(BASE+"#boj");await g.wait_for_timeout(2500)
    chk(await g.evaluate("!!(BOJ.s.reak||{}).h1"),"souběh: reakce je uložená v databázi")
    print("chyby",err[:5],gerr[:5])
    await b.close()
asyncio.run(main())
print("VŠE OK" if not fails else f"CHYBY: {fails}")
raise SystemExit(1 if fails else 0)
