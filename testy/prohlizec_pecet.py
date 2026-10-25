import asyncio, json, urllib.request
from playwright.async_api import async_playwright
from _klid import klid, dokud, sleduj  # čekání na stav místo pevných pauz (testy/_klid.py)
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
def tok(): return json.loads(urllib.request.urlopen(urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")).read())["access_token"]
def nastav(z): urllib.request.urlopen(urllib.request.Request(U+"/rest/v1/rpc/mm_nastav_stavy",data=json.dumps({"p_zmeny":z}).encode(),headers={"apikey":K,"Content-Type":"application/json","Authorization":"Bearer "+tok()},method="POST")).read()
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
nastav({"pod":2,"jiri":2,"bocek":0,"viktorin":1,"roz":0})
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={"width":1300,"height":1000});err=[];pg.on("pageerror",lambda e:err.append(str(e)))
    await sleduj(pg);await pg.goto(BASE+"#desky/osoby");await klid(pg,2000)
    await pg.wait_for_timeout(300)  # pevně: pečeť spouští IntersectionObserver až po vykreslení – kontrola „bez animace“ mu musí dát čas
    chk(await pg.locator(".pecfx").count()==0,"první návštěva: bez animace (vše už známé)")
    chk(await pg.locator('a.pcard.zapec[href="#osoba/viktorin"]').count()==1,"osoba 'slyšeli' je zapečetěná")
    nastav({"bocek":2,"viktorin":2,"roz":1})
    await pg.reload();await dokud(pg,"document.querySelectorAll('.pecfx').length>=2",8000)
    n=await pg.locator(".pecfx").count();chk(n>=2,f"nově poznané osoby se rozpečetí ({n})")
    chk(await pg.locator('a.pcard.zapec[href="#osoba/viktorin"]').count()==0,"Viktorin už není zapečetěný")
    await dokud(pg,"!document.querySelector('.pecfx')",8000);chk(await pg.locator(".pecfx").count()==0,"animace zmizí")  # animace 2,4 s
    await pg.reload();await klid(pg,2000);await pg.wait_for_timeout(300);chk(await pg.locator(".pecfx").count()==0,"podruhé se už neopakuje")  # pevně: čas pro IntersectionObserver (viz výše)
    await pg.goto(BASE+"#desky");await dokud(pg,"!!document.querySelector('article.card[data-id=\"roz\"] .pecfx')",8000)
    chk(await pg.locator('article.card.zapec[data-id="roz"]').count()==1,"rod 'slyšeli' zapečetěný v kartách")
    chk(await pg.locator('article.card[data-id="roz"] .pecfx').count()==1,"nový rod se rozpečetí")
    await klid(pg,400);await pg.screenshot(path=os.path.join(VYSTUP,"pec.png"))
    chk(not err,"bez chyb "+str(err[:2]))
    # nová verze webu po nasazení: aplikace s otevřeným starým kódem ukáže lištu Obnovit, jakmile se server liší v dílech skriptu
    import re
    zmen={"on":False}
    async def r(route):
      if route.request.resource_type=="fetch" and zmen["on"]:
        resp=await route.fetch();t=await resp.text()
        await route.fulfill(response=resp,body=re.sub(r"v/zaklad-[0-9a-f]+\.js","v/zaklad-0000000000.js",t))
      else: await route.continue_()
    await pg.route(re.compile(re.escape(BASE.rstrip("/"))+r"/?(\?.*)?$"),r)
    await pg.goto(BASE+"#desky");await klid(pg,2000)
    vis="document.dispatchEvent(new Event('visibilitychange'))"
    await pg.evaluate(vis);await klid(pg,2000)
    chk(await pg.locator(".mmnova").count()==0,"stejná verze webu: bez lišty Obnovit")
    zmen["on"]=True
    await pg.evaluate("Date.now=(n=>()=>n()+120000)(Date.now.bind(Date))");await pg.evaluate(vis);await dokud(pg,"!!document.querySelector('.mmnova')",8000)
    chk("novou verzi" in ((await pg.locator(".mmnova").first.text_content()) if await pg.locator(".mmnova").count() else ""),"po nasazení nové verze lišta Obnovit")
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
