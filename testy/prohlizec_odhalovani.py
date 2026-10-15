import asyncio, json, urllib.request, sys, re
from playwright.async_api import async_playwright
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
def tok(e):
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":e,"password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())["access_token"]
def nastav(z):
    r=urllib.request.Request(U+"/rest/v1/rpc/mm_nastav_stavy",data=json.dumps({"p_zmeny":z}).encode(),headers={"apikey":K,"Content-Type":"application/json","Authorization":"Bearer "+tok("gm@x.cz")},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def snimek():
    r=urllib.request.Request(U+"/rest/v1/snimek?vetev=eq.test&select=data,verze",headers={"apikey":K})
    return urllib.request.urlopen(r).read().decode()
# skryjeme: rod var (0), osoba zdenekst (0), jindrich4 jen slyšeli (1), rod hra slyšeli (1)
nastav({"var":0,"zdenekst":0,"jindrich4":1,"hra":1,"slik":2,"ste":2,"pod":2,"jiri":2})
full=json.load(open(os.path.join(os.environ["MM_VYPIS"],"hrac.json"),encoding="utf-8"))
S=snimek()
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
# texty skrytých entit nesmí být ve výřezu
P={p["$x"]["id"]:p["$x"] for p in full["PEOPLE"]}; F={f["id"]:f for f in full["FAM"]}
chk(F["var"]["$plne"]["note"][:50] not in S,"poznámka skrytého rodu var není ve výřezu")
chk('"id":"var"' not in S.replace(" ",""),"rod var není ve výřezu")
chk(P["zdenekst"]["$plne"]["x"][:50] not in S,"text skryté osoby zdenekst není ve výřezu")
chk(P["jindrich4"]["$plne"]["x"][:50] not in S,"text osoby jen 'slyšeli' (jindrich4) není ve výřezu")
chk(F["hra"]["$plne"]["note"][:50] not in S,"poznámka rodu jen 'slyšeli' (hra) není ve výřezu")
chk("Václav z Vartenberka" not in S and "vaclavvar" not in S,"osoby skrytého rodu var nejsou ve výřezu")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    # --- hráč ---
    pg=await b.new_page();errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)[:200]))
    await pg.goto(BASE);await pg.wait_for_function("!document.documentElement.classList.contains('mmload')",timeout=10000)
    src=await pg.content()
    chk(P["zdenekst"]["$plne"]["x"][:50] not in src,"hráčská stránka neobsahuje text skryté osoby")
    chk(await pg.evaluate("typeof PBY!=='undefined'&&!PBY.zdenekst&&!!PBY.jindrich4&&PBY.jindrich4.sl===true&&!byId.var&&byId.hra.sl===true"),"hráč: skryté chybí, slyšeli mají příznak sl")
    await pg.goto(BASE+"#osoba/jindrich4");await pg.wait_for_timeout(300)
    t=await pg.inner_text("#article");chk("jen slyšela" in t,"stránka osoby 'slyšeli' ukazuje poznámku");
    chk(await pg.locator("#article img.psilbig").count()==1,"osoba 'slyšeli' má siluetu")
    await pg.goto(BASE+"#rod/hra");await pg.wait_for_timeout(300)
    t=await pg.inner_text("#article");chk("jen slyšela" in t and "Rodokmen" not in t,"rod 'slyšeli' bez zápisu a rodokmenu")
    await pg.goto(BASE+"#rod/var");await pg.wait_for_timeout(300)
    chk(await pg.locator("#article").is_hidden(),"skrytý rod → seznam rodů")
    await pg.goto(BASE+"#gm");await pg.wait_for_timeout(300)
    chk(await pg.locator("#gmlogin").count()==1,"#gm ukazuje přihlášení")
    # obrázky portrétů mají nečitelné názvy
    await pg.goto(BASE+"#osoba/jiri");await pg.wait_for_timeout(300)
    srcs=await pg.eval_on_selector_all("#article img","els=>els.map(e=>e.getAttribute('src'))")
    chk(any(re.search(r"art/portrety/[0-9a-f]{24}\.webp",s or "") for s in srcs),"portrét pod nečitelným názvem: "+str(srcs[:1]))
    # živá změna: hráč má otevřenou stránku osob, vypravěč odhalí zdenekst
    await pg.goto(BASE+"#desky/osoby");await pg.wait_for_timeout(500)
    await pg.evaluate("scrollTo(0,400)")
    nastav({"zdenekst":2})
    await pg.wait_for_function("typeof PBY!=='undefined'&&!!PBY.zdenekst",timeout=30000)
    chk(True,"po odhalení se hráčům stránka sama obnovila a osoba je vidět")
    chk(await pg.evaluate("location.hash")=="#desky/osoby","obnova zachovala adresu")
    chk(not errs,"hráč bez chyb JS "+str(errs[:2]))
    # --- vypravěč ---
    g=await b.new_page();gerr=[]
    g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    await g.goto(BASE+"#gm");await g.wait_for_selector("#gmlogin")
    await g.fill("#gmlogin input[name=e]","gm@x.cz");await g.fill("#gmlogin input[name=h]","spatne")
    await g.click("#gmlogin button");await g.wait_for_timeout(400)
    chk("Nesprávný" in await g.inner_text(".gmerr"),"špatné heslo → hláška")
    await g.fill("#gmlogin input[name=h]","heslo");await g.click("#gmlogin button")
    await g.wait_for_selector(".gmlist",timeout=10000)
    chk(await g.evaluate("GMV&&!!PBY.zdenekst&&!!byId.var&&STAV.var===0"),"vypravěč vidí vše a stavy")
    chk(await g.locator('.gmrow[data-gmid="var"] .gs0[aria-pressed="true"]').count()==1,"přehled ukazuje var jako skrytý")
    await g.click('.gmrow[data-gmid="var"] .gs1');await g.wait_for_timeout(600)
    chk(await g.evaluate("STAV.var===1"),"klik Slyšeli uložen")
    await g.fill("#gmq","smiř");await g.wait_for_timeout(200)
    vis=await g.eval_on_selector_all(".gmrod:not([hidden])","els=>els.length");chk(vis>=1 and vis<5,f"hledání filtruje ({vis})")
    await g.goto(BASE+"#osoba/jindrich4");await g.wait_for_timeout(400)
    chk(await g.locator("#article .gmbar .gs1[aria-pressed=true]").count()==1,"lišta stavu na stránce osoby")
    await g.click("#article .gmbar .gs2");await g.wait_for_timeout(600)
    chk(await g.evaluate("STAV.jindrich4===2"),"změna z lišty uložena")
    chk(await g.locator("#article .gmbar .gs2[aria-pressed=true]").count()==1,"lišta se překreslila")
    await g.goto(BASE+"#rod/hra");await g.wait_for_timeout(300)
    t=await g.inner_text("#article");chk("Rodokmen" in t,"vypravěč vidí rodokmen i u rodu 'slyšeli'")
    # hromadné nastavení osob rodu
    await g.goto(BASE+"#gm");await g.wait_for_timeout(300)
    await g.fill("#gmq","");await g.wait_for_timeout(100)
    await g.select_option('[data-gmbulk="smi"]',"1");await g.wait_for_timeout(700)
    chk(await g.evaluate("peopleOf('smi').every(p=>STAV[p.id]===1)"),"hromadné nastavení osob rodu")
    # vypršelý token → obnova přes refresh token
    await g.evaluate("(()=>{const r=JSON.parse(localStorage.getItem('mm-gm-relace'));r.exp=1;r.at='neplatny';localStorage.setItem('mm-gm-relace',JSON.stringify(r))})()")
    await g.reload();await g.wait_for_function("!document.documentElement.classList.contains('mmload')")
    chk(await g.evaluate("GMV===true"),"vypršelé přihlášení se samo obnoví")
    await g.goto(BASE+"#gm");await g.wait_for_timeout(300)
    await g.click("#gmout");await g.wait_for_timeout(1500);await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(300)
    chk(await g.evaluate("GMV===false&&!PBY.vaclavvar"),"odhlášení → hráčská verze")
    chk(not gerr,"vypravěč bez chyb JS "+str(gerr[:2]))
    await b.close()
asyncio.run(main())
nastav({"var":2,"zdenekst":2,"jindrich4":2,"hra":2})
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
