import asyncio, json, urllib.request, subprocess, os, base64
from playwright.async_api import async_playwright
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
def tok():
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def rpc(fn,body,t=None):
    r=urllib.request.Request(U+"/rest/v1/rpc/"+fn,data=json.dumps(body).encode(),headers={"apikey":K,"Content-Type":"application/json","Authorization":"Bearer "+(t or tok()["access_token"])},method="POST")
    return json.loads(urllib.request.urlopen(r).read() or b"null")
def snimek(): return urllib.request.urlopen(urllib.request.Request(U+"/rest/v1/snimek?vetev=eq.test&select=data",headers={"apikey":K})).read().decode()
def sql(q): return subprocess.run(os.environ.get("MM_PSQL","psql").split()+["-At","-d",os.environ.get("MM_DB","mm_testy")],input=q,capture_output=True,text=True).stdout.strip()
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
rpc("mm_nastav_stavy",{"p_zmeny":{"pod":2,"jiri":2}})
rel=tok()
# malý obrázek PNG pro nahrání
from PIL import Image; Image.new("RGB",(300,750),(120,40,40)).save(os.path.join(VYSTUP,"test.png"))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    g=await b.new_page(viewport={"width":1300,"height":1000});gerr=[];g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":rel["access_token"],"rt":rel["refresh_token"],"exp":rel["expires_at"],"email":"gm@x.cz"})+"))")
    ready=lambda pg: pg.wait_for_function("!document.documentElement.classList.contains('mmload')&&typeof PBY!=='undefined'")
    await g.goto(BASE+"#osoba/jiri");await ready(g);await g.wait_for_timeout(300)
    await g.click('[data-ed="osoba:jiri"]');await g.wait_for_selector("#edov form")
    puv=await g.input_value("[name=f_role]")
    await g.fill("[name=f_role]","zvolený král český (test)")
    body=await g.input_value("[name=f__body]")
    await g.fill("[name=f__body]",body+"\n\n⟦TAJNE_XYZ_123 jen pro vypravěče⟧")
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(1500);await ready(g);await g.wait_for_timeout(300)
    chk("zvolený král český (test)" in await g.inner_text("#article"),"úprava role uložena a vidět po obnovení")
    chk("TAJNE_XYZ_123" in await g.inner_text("#article"),"vypravěč vidí tajemství")
    S=snimek();chk("zvolený král český (test)" in S and "TAJNE_XYZ_123" not in S,"hráčský výřez má změnu, ale ne tajemství")
    chk(sql("select web from zaznamy where soubor like 'osoby/%-jiri.md'")=="t","záznam označen jako upravený na webu")
    # neuzavřené tajemství
    await g.click('[data-ed="osoba:jiri"]');await g.wait_for_selector("#edov form")
    await g.fill("[name=f__body]","Text ⟦bez konce")
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(800)
    chk("neuzavřená" in (await g.inner_text("#edov .ederr")).lower(),"neuzavřené ⟦ se neuloží")
    # neplatný rod
    await g.fill("[name=f__body]","Text.");await g.fill("[name=f_rod]","zzz")
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(800)
    chk("neexistuje" in await g.inner_text("#edov .ederr"),"kontrola: neexistující rod")
    # historie a obnovení
    await g.click("#edov [data-edzavri] >> nth=0");await g.click('[data-ed="osoba:jiri"]');await g.wait_for_selector("#edov form")
    await g.click("#edov [data-edhist]");await g.wait_for_selector(".edhist")
    n=await g.locator(".edhist [data-ho]").count();chk(n>=1,f"historie má verze k obnovení ({n})")
    await g.click(".edhist [data-ho] >> nth=0");await g.wait_for_timeout(1500);await ready(g);await g.wait_for_timeout(300)
    t=await g.inner_text("#article");chk("(test)" not in t and puv in t,"obnovena původní verze")
    # konflikt: text změněn mezitím
    await g.click('[data-ed="osoba:jiri"]');await g.wait_for_selector("#edov form")
    sql("update zaznamy set md = md || E'\\nzmena zvenci' where soubor like 'osoby/%-jiri.md';")
    await g.fill("[name=f_role]","konflikt");await g.click("#edov button[type=submit]");await g.wait_for_timeout(800)
    chk("mezitím změnil" in await g.inner_text("#edov .ederr"),"souběžná změna se nepřepíše")
    await g.click("#edov [data-edzavri] >> nth=0")
    # nový záznam
    await g.goto(BASE+"#gm");await g.wait_for_selector("#ednovy")
    await g.select_option("#ednovy [name=druh]","osoba");await g.fill("#ednovy [name=nid]","testovaci");await g.click("#ednovy button[type=submit]")
    await g.wait_for_selector("#edov form");await g.fill("[name=f_jmeno]","Testovací Rytíř");await g.fill("[name=f_rod]","pod");await g.fill("[name=f_role]","zkušební postava")
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(1500);await ready(g);await g.wait_for_timeout(300)
    chk(await g.evaluate("!!PBY.testovaci&&STAV.testovaci===0"),"nová osoba vytvořena a je skrytá")
    chk("Testovací Rytíř" not in snimek(),"nová osoba není ve výřezu hráčů")
    # nahrání portrétu
    await g.goto(BASE+"#osoba/testovaci");await g.wait_for_timeout(400)
    await g.click('[data-ed="osoba:testovaci"]');await g.wait_for_selector("#edov form")
    await g.set_input_files("#edov [data-edobr]",os.path.join(VYSTUP,"test.png"));await g.wait_for_timeout(2500);await ready(g);await g.wait_for_timeout(500)
    pu=await g.evaluate("PORTRH.testovaci");chk(isinstance(pu,dict) and "/storage/v1/object/public/obrazky/" in pu.get("f",""),"portrét nahrán do úložiště: "+str(pu)[:80])
    ok=await g.evaluate("(async()=>{const r=await fetch(PORTRH.testovaci.m);return r.ok&&(await r.blob()).size>100})()");chk(ok,"zmenšenina portrétu se načte")
    # smazání
    await g.click('[data-ed="osoba:testovaci"]');await g.wait_for_selector("#edov form");await g.click("#edov [data-edsmaz]");await g.wait_for_timeout(1500);await ready(g)
    chk(await g.evaluate("!PBY.testovaci"),"osoba smazána")
    # rodokmen
    await g.goto(BASE+"#rod/pod");await g.wait_for_timeout(400);await g.click('[data-edstrom="pod"]');await g.wait_for_selector("#edov textarea")
    t=await g.input_value("#edov textarea");tr=json.loads(t);tr["foot"]="TEST_RODOKMEN_POZNAMKA";await g.fill("#edov textarea",json.dumps(tr,ensure_ascii=False,indent=2))
    await g.click("#edov button[type=submit]");await g.wait_for_timeout(1500);await ready(g);await g.wait_for_timeout(300)
    chk("TEST_RODOKMEN_POZNAMKA" in await g.inner_text("#article"),"rodokmen upraven")
    await g.goto(BASE+"#gm");await g.wait_for_timeout(300)
    chk(not gerr,"bez chyb JS "+str(gerr[:3]))
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
