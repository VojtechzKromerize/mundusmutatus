# Potvrzování akcí hráčů a časová osa sezení: nastavení u vypravěče, lhůta na zrušení u hráče, návrh léčení spojence
# ke schválení (schválit / zamítnout s vrácením utraceného), vrácení změny karty a herního času z časové osy.
import asyncio, json, os, urllib.request
from playwright.async_api import async_playwright
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
def login(email):
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":email,"password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def stav(i):
    r=urllib.request.Request(U+f"/rest/v1/karty?id=eq.{i}&select=stav",headers={"apikey":K})
    j=json.loads(urllib.request.urlopen(r).read());return j[0]["stav"] if j else {}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();gt=login("gm@x.cz")
    g=await b.new_page(viewport={"width":1300,"height":1000});g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    gerr=[];g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":gt["access_token"],"rt":gt["refresh_token"],"exp":gt["expires_at"],"email":"gm@x.cz"})+"))")
    await g.goto(BASE+"#hra/druzina");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(1500)
    # druhá karta pro spojence
    await g.evaluate("MMDB.kartaUloz(Object.assign({},KARTBY.balduin,{id:'zbynek',n:'Zbyněk',test:true})).then(()=>kartyNacti(true))");await g.wait_for_timeout(800)
    await g.evaluate("kartaStavZmen('zbynek',{hp:10})");await g.wait_for_timeout(800)
    chk(stav("zbynek").get("hp")==10,"spojenec Zbyněk má 10 životů")
    # nastavení: vše potvrzuji, lhůta 3 s
    await g.select_option("#bojpult [data-potvrzr]","vse");await g.wait_for_timeout(1200)
    await g.fill("#bojpult [data-potvrzo]","3");await g.locator("#bojpult [data-potvrzo]").press("Tab");await g.wait_for_timeout(1500)
    chk(await g.evaluate("potvrz().rezim==='vse'&&potvrz().odklad===3"),"vypravěč nastaví potvrzování a lhůtu")
    pl=await b.new_page(viewport={"width":390,"height":844});perr=[];pl.on("pageerror",lambda e:perr.append(str(e)[:200]))
    await pl.goto(BASE+"#karty/balduin");await pl.wait_for_selector(".bdm",timeout=15000);await pl.wait_for_timeout(2000)
    chk(await pl.evaluate("potvrz().rezim==='vse'&&potvrz().odklad===3"),"hráč zná nastavení potvrzování")
    # lhůta: zrušená akce se neprovede, nezrušená ano
    await pl.evaluate("window.__x=0;void kOdklad('zkušební akce',()=>{window.__x=1})");await pl.wait_for_timeout(500)
    chk(await pl.locator(".kodkl [data-kodkz]").count()==1,"hráč vidí odpočet se Zrušit")
    await pl.click(".kodkl [data-kodkz]");await pl.wait_for_timeout(3500)
    chk(await pl.evaluate("window.__x")==0,"zrušená akce se neprovede")
    await pl.evaluate("void kOdklad('druhá akce',()=>{window.__x=2})");await pl.wait_for_timeout(3800)
    chk(await pl.evaluate("window.__x")==2,"nezrušená akce se po lhůtě provede")
    # léčení spojence → návrh ke schválení, karta spojence se zatím nemění
    await pl.evaluate("kLecKarta(KARTBY.zbynek,5,KARTBY.balduin,'Cure Wounds')");await pl.wait_for_timeout(1500)
    chk(stav("zbynek").get("hp")==10,"léčení spojence se bez schválení nezapíše")
    chk(await pl.evaluate("navrhyCeka().length")==1 and await pl.locator(".kdbnav").count()==1,"hráč vidí, že léčení čeká na vypravěče")
    chk(await pl.evaluate("bojCekaAkce()===1"),"tah stojí: místo Konec tahu „Čeká na vypravěče“")
    await g.evaluate("navrhyNacti().then(()=>renderHra())");await g.wait_for_timeout(800)
    chk(await g.locator(".navrhy [data-navok]").count()==1,"vypravěč má léčení ke schválení")
    await g.click(".navrhy [data-navok]");await g.wait_for_timeout(1500)
    chk(stav("zbynek").get("hp")==15,"po schválení se léčení zapíše: "+str(stav("zbynek").get("hp")))
    await pl.wait_for_timeout(5500);chk(await pl.evaluate("navrhyCeka().length")==0,"hráč se dozví o schválení")
    # zamítnutí vrátí utracené (slot 1. st.)
    await pl.evaluate("kartaStavZmen('balduin',{zdr:{slot1:1}})");await pl.wait_for_timeout(800)
    await pl.evaluate("navrhPosli(KARTBY.balduin,{typ:'lec',cil:'zbynek',hp:4,co:'Healing Word',popis:'Healing Word → Zbyněk +4 HP',vratit:{k:'slot1',n:1}})");await pl.wait_for_timeout(1200)
    await g.evaluate("navrhyNacti().then(()=>renderHra())");await g.wait_for_timeout(800)
    await g.click(".navrhy [data-navne]");await g.wait_for_timeout(1500)
    chk(stav("zbynek").get("hp")==15 and not (stav("balduin").get("zdr") or {}).get("slot1"),"zamítnutí nic nezapíše a vrátí slot: "+str(stav("balduin").get("zdr")))
    # časová osa: vrácení změny karty (řídicí pult › Sezení)
    await g.goto(BASE+"#hra/sezeni");await g.wait_for_selector(".zmeny",timeout=15000)
    await g.evaluate("zmenyNacti().then(()=>renderHra())");await g.wait_for_timeout(1000)
    zid=await g.evaluate("(ZMENY.find(z=>z.druh==='karta'&&z.klic==='zbynek'&&z.pole==='hp'&&z.po===15)||{}).id")
    chk(bool(zid) and "Zbyněk" in await g.inner_text(".zmeny"),"časová osa ukazuje změnu životů Zbyňka")
    if zid:
        await g.click(f'[data-zmvrat="{zid}"]');await g.wait_for_timeout(1800)
        chk(stav("zbynek").get("hp")==10,"vrácení z časové osy obnoví životy: "+str(stav("zbynek").get("hp")))
    # časová osa: vrácení herního času („vše od sem“)
    d0=await g.evaluate("(HRA||{}).datum");await g.evaluate("hraUloz({datum:'1458-04-01',hodina:9,$bezZpet:true})");await g.wait_for_timeout(1200)
    await g.evaluate("zmenyNacti().then(()=>renderHra())");await g.wait_for_timeout(1000)
    hid=await g.evaluate("(ZMENY.find(z=>z.druh==='hra'&&(z.po||{}).datum==='1458-04-01')||{}).id")
    if hid:
        await g.click(f'[data-zmvse="{hid}"]');await g.wait_for_timeout(2000)
        chk(await g.evaluate("(HRA||{}).datum")==d0,"„vše od sem“ vrátí herní čas: "+str(await g.evaluate("(HRA||{}).datum")))
    else: chk(False,"časová osa zachytí změnu herního času")
    # zpět na okamžitý zápis pro další testy
    await g.goto(BASE+"#hra/druzina");await g.wait_for_timeout(1500)
    await g.select_option("#bojpult [data-potvrzr]","nic");await g.wait_for_timeout(1000);await g.fill("#bojpult [data-potvrzo]","0");await g.locator("#bojpult [data-potvrzo]").press("Tab");await g.wait_for_timeout(1200)
    chk(await g.evaluate("potvrz().rezim==='nic'&&potvrz().odklad===0"),"nastavení vráceno")
    chk(await pl.evaluate("potvrzNacti().then(()=>potvrz().rezim==='nic'&&potvrz().odklad===0)"),"hráč se o změně nastavení dozví bez přenačtení stránky")
    await g.evaluate("MMDB.kartaSmaz('zbynek').catch(()=>{})");await g.wait_for_timeout(500)
    chk(not perr and not gerr,f"bez chyb JS {(perr+gerr)[:3]}")
    await b.close()
asyncio.run(main())
print("VŠE OK" if not fails else f"CHYBY: {fails}")
raise SystemExit(1 if fails else 0)
