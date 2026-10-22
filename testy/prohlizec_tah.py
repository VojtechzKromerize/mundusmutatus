import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os, sys
from _puls import puls
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
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":t["access_token"],"rt":t["refresh_token"],"exp":t["expires_at"],"email":"gm@x.cz"})+"))")
    await g.goto(BASE+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(600)
    if await g.locator("[data-bact=konec]").count():
        await g.click("[data-bact=konec]");await g.wait_for_timeout(800)
        if await g.locator('[data-bkon="ok"]').count():  # se statblocky se nejdřív ukáže shrnutí boje
            await g.click('[data-bkon="ok"]');await g.wait_for_timeout(800)
    await priprava(g,["Adam","Bára"],[15,None],10)
    await g.click('[data-bstart]');await g.wait_for_selector(".bsloty")
    pl=await b.new_page(viewport={"width":390,"height":844});err=[];pl.on("pageerror",lambda e:err.append(str(e)[:200]))
    await pl.add_init_script("window.__vib=[];navigator.vibrate=x=>{window.__vib.push(x);return true};window.__wl=0;Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{window.__wl++;const l=new EventTarget();l.release=async()=>{window.__wl--;l.dispatchEvent(new Event('release'))};return l}}})")
    await pl.goto(BASE+"#boj");await pl.wait_for_selector(".bsloty")
    await pl.evaluate("bojJa.set('Adam');renderBoj()");await pl.wait_for_timeout(300)
    await pl.click('[data-bclaim="0"]');await pl.select_option('[data-bclaimsel="0"]',"h1");await pl.wait_for_timeout(1000)
    chk(await pl.locator(".bslot.bmujtah").count()==1 and await pl.locator(".bslot.bmujtah").count()==1,"hráč na tahu: hláška a blikající slot")
    chk(await pl.evaluate("window.__vib.length")==1,"telefon zavibroval")
    chk(await pl.evaluate("window.__wl")==1,"obrazovka hráče zůstává rozsvícená (Wake Lock)")
    chk((await pl.title()).startswith("⚔ Na tahu!"),"titulek stránky")
    await puls(g,od=pl);await g.click('[data-bact="dalsi"]');await puls(pl,od=g)
    chk(await pl.locator(".bslot.bmujtah").count()==0 and not (await pl.title()).startswith("⚔"),"po dalším tahu hláška zmizí")
    await g.click('[data-bact="kolo"]');await puls(pl,od=g)
    urllib.request.urlopen(urllib.request.Request(U+"/rest/v1/rpc/mm_boj_obsad",data=json.dumps({"p_slot":0,"p_hrac":"h2"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")).read()
    await puls(pl)
    await pl.click('[data-bclaim="2"]');await pl.select_option('[data-bclaimsel="2"]',"h1");await pl.wait_for_timeout(800)
    chk(await pl.locator(".bslot.bmuj").count()==1 and await pl.locator(".bslot.bmujtah").count()==0,"vlastní slot zvýrazněn, zatím není na tahu")
    await puls(g);await g.click('[data-bact="dalsi"]');await puls(pl,od=g)
    chk(await pl.evaluate("bojHlasen.endsWith(':d')"),"hráč ví, že je další na řadě (hláška a vibrace)")
    chk(await pl.evaluate("window.__vib.length")==2 and await pl.evaluate("window.__vib[1]")==140,"další na řadě: krátké zavibrování")
    await g.click('[data-bact="dalsi"]');await puls(pl,od=g)
    chk(await pl.locator(".bslot.bmujtah").count()==1 and await pl.evaluate("window.__vib.length")==3,"na tahu v novém kole: znovu vibrace")
    await pl.screenshot(path=os.path.join(VYSTUP,"tah-m.png"))
    # krok 0 přestavby Hry (2026-10-22): připravená akce a Konec tahu z telefonu (postava bez karty: průvodce tahem)
    pl.on("dialog",lambda d:asyncio.ensure_future(d.accept("zaútočím na prvního, kdo vejde")))
    await pl.click('[data-bhpan="h1"] [data-bhrdy]');await pl.wait_for_timeout(1500)
    await puls(g,od=pl)
    chk(await g.evaluate("(BOJ.s.ready||{}).h1")=="zaútočím na prvního, kdo vejde","připravená akce z telefonu dorazí vypravěči")
    await pl.click('[data-bhpan="h1"] [data-bhrdygo]');await pl.wait_for_timeout(1500)
    await puls(g,od=pl)
    chk(await g.evaluate("!(BOJ.s.ready||{}).h1&&!!(BOJ.s.reak||{}).h1"),"spuštění připravené akce spotřebuje reakci")
    await pl.click('[data-bkonec="h1"]');await pl.wait_for_timeout(1500)
    await puls(g,od=pl)
    chk(await g.evaluate("!!(BOJ.s.hotovo||{}).h1"),"Konec tahu z telefonu: vypravěč vidí dohraný tah")
    t0=await g.evaluate("[BOJ.s.kolo,BOJ.s.tah]")
    await g.click("h2.arttitle");await g.keyboard.press("Space");await g.wait_for_timeout(800)
    chk(await g.evaluate("[BOJ.s.kolo,BOJ.s.tah]")!=t0,"vypravěč: mezerník posune na další tah")
    await g.click("[data-bact=konec]");await g.wait_for_timeout(600)
    if await g.locator('[data-bkon="ok"]').count(): await g.click('[data-bkon="ok"]')
    await puls(pl,od=g);chk(await pl.evaluate("window.__wl")==0,"po konci boje se zámek obrazovky uvolní")
    chk(not err,"bez chyb "+str(err[:2]))
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
