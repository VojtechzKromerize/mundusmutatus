import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
t=json.loads(urllib.request.urlopen(urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")).read())
def snimek(): return urllib.request.urlopen(urllib.request.Request(U+"/rest/v1/snimek?vetev=eq.test&select=data",headers={"apikey":K})).read().decode()
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();g=await b.new_page(viewport={"width":1300,"height":1000});err=[];g.on("pageerror",lambda e:err.append(str(e)[:200]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":t["access_token"],"rt":t["refresh_token"],"exp":t["expires_at"],"email":"gm@x.cz"})+"))")
    ready=lambda: g.wait_for_function("!document.documentElement.classList.contains('mmload')&&typeof PBY!=='undefined'")
    await g.goto(BASE+"#gm");await g.wait_for_selector("#ednovy")
    await g.click("[data-edkontrola]");await g.wait_for_timeout(1500)
    chk("v pořádku" in await g.inner_text("#edkontrola"),"kontrola textů: v pořádku")
    await g.select_option("#ednovy [name=druh]","zapis");await g.fill("#ednovy [name=nid]","sezeni-1");await g.click("#ednovy button[type=submit]")
    await g.wait_for_selector("#edov form")
    await g.fill("[name=f_title]","Kostnice pod Vyšehradem");await g.fill("[name=f_n]","Sezení 1")
    await g.fill("[name=f__body]","První odstavec zápisu.\n\nDruhý **tučný** odstavec. ⟦Tajná poznámka ZAP_TAJ⟧")
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(1500);await ready();await g.wait_for_timeout(300)
    chk(await g.evaluate("!!ZBY['sezeni-1']&&STAV['sezeni-1']===0"),"nový zápis je koncept")
    chk("Kostnice pod" not in snimek(),"koncept není u hráčů")
    await g.goto(BASE+"#kronika/sezeni-1");await g.wait_for_timeout(400)
    t2=await g.inner_html("#kzapisy .ztext");chk("<b>tučný</b>" in t2 and "ZAP_TAJ" in t2,"Markdown a tajemství u vypravěče")
    await g.click("#kzapisy .gmbar .gs2");await g.wait_for_timeout(800)
    S=snimek();chk("Kostnice pod" in S and "ZAP_TAJ" not in S,"zveřejněný zápis u hráčů bez tajemství")
    chk(not err,"bez chyb "+str(err[:2]))
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
