import asyncio, json, urllib.request
from playwright.async_api import async_playwright
import os, sys
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
def tok():
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def anon_rpc(fn,body):
    r=urllib.request.Request(U+"/rest/v1/rpc/"+fn,data=json.dumps(body).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    try: return 200,urllib.request.urlopen(r).read().decode()
    except urllib.error.HTTPError as e: return e.code,e.read().decode()[:120]
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
rel=tok()

async def priprava(g,jmena,hody,dm,npc=(),spoj=()):
    """Příprava boje na stránce Boj: postavy s hody, nepřátelé a spojenci přes formuláře, hod nepřátel, Začít boj."""
    await g.wait_for_selector(".bprip")
    await g.evaluate("bojZmen(z=>{z.hraci="+json.dumps([{"id":"h"+str(i+1),"n":"","hod":None} for i in range(len(jmena))])+";z.npc=[];z.nid=0;z.dm=null})")
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
    g=await b.new_page(viewport={"width":1300,"height":1000});gerr=[];g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":rel["access_token"],"rt":rel["refresh_token"],"exp":rel["expires_at"],"email":"gm@x.cz"})+"))")
    await g.goto(BASE+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(500)
    if await g.locator("[data-bact=konec]").count():
        await g.click("[data-bact=konec]");await g.wait_for_timeout(800)
        if await g.locator('[data-bkon="ok"]').count():  # se statblocky se nejdřív ukáže shrnutí boje
            await g.click('[data-bkon="ok"]');await g.wait_for_timeout(800)
    chk(await g.locator("#navboj").is_visible(),"vypravěč má v nabídce Boj")
    await priprava(g,["Adam","Bára","Cyril"],[15,9,None],None,[("Žoldnéři","houf",6),("Hejtman","sok",None)])
    # hráč zapíše svůj hod z telefonu během přípravy
    ph=await b.new_page(viewport={"width":390,"height":844});await ph.goto(BASE+"#boj");await ph.wait_for_selector(".bprip")
    chk(await ph.locator(".bnpc").count()==0,"hráč v přípravě nevidí nepřátele")
    await ph.select_option("[data-bja]","Cyril");await ph.wait_for_timeout(300)
    await ph.fill("[data-bjahod]","11");await ph.press("[data-bjahod]","Tab");await ph.wait_for_timeout(800)
    await g.wait_for_timeout(3000)
    chk(await g.locator('[data-bhhod="h3"]').input_value()=="11","vypravěč vidí hod, který hráč zapsal z telefonu")
    c,t=anon_rpc("mm_boj_hod",{"p_hrac":"h9","p_hod":12});chk(c>=400,"neznámá postava nezapíše hod")
    await g.click('[data-bstart]');await g.wait_for_timeout(500)
    chk(await g.locator(".bsloty").count()==0,"bez hodu nepřátel boj nezačne")
    f=g.locator('[data-bdm]');await f.fill("12");await f.press("Tab");await g.wait_for_timeout(400)
    await g.click('[data-bstart]');await g.wait_for_selector(".bsloty")
    await ph.close();await g.wait_for_timeout(1200)
    c,t=anon_rpc("mm_boj_hod",{"p_hrac":"h1","p_hod":3});chk(c>=400,"po zahájení už hráč hod nemění")
    sl=await g.evaluate("BOJ.s.sloty.map(x=>x.hod+x.t)")
    chk(sl==["15h","12n","15h","12n","15h","12n"],"sloty se střídají, začíná družina: "+str(sl))
    pruh=await g.eval_on_selector_all(".bsloty .bslot:not(.bzbyt)","els=>els.map(e=>e.querySelector('.bhod').textContent+(e.classList.contains('bh')?'h':'n'))")
    chk(pruh==["15h","12n"] and await g.locator(".bslot.bzbyt").count()==1,"pruh ukazuje jen nejbližší volné sloty a zbytek shrne: "+str(pruh))
    alt=await g.evaluate("bojSloty({hraci:[{},{}],hod:10,dm:14}).map(x=>x.t).join('')");chk(alt=="nhnh","vyhraje-li vypravěč, začínají nepřátelé: "+alt)
    alt=await g.evaluate("bojSloty({hraci:[{},{}],hod:14,dm:14}).map(x=>x.t).join('')");chk(alt=="hnhn","shoda – začíná družina: "+alt)
    chk(await g.evaluate("BOJ.s.hod")==15,"družina jde s nejlepším hodem 15")
    pl=await b.new_page(viewport={"width":390,"height":844});perr=[];pl.on("pageerror",lambda e:perr.append(str(e)[:200]))
    await pl.goto(BASE);await pl.wait_for_function("!document.documentElement.classList.contains('mmload')");await pl.wait_for_timeout(600)
    await pl.click("#navtoggle");chk(await pl.locator("#navboj").is_visible(),"hráč vidí Boj v menu, když boj probíhá")
    await pl.goto(BASE+"#boj");await pl.wait_for_selector(".bsloty")
    await pl.click('[data-bclaim="0"]');await pl.select_option('[data-bclaimsel="0"]',"h1");await pl.wait_for_timeout(800)
    chk("Adam" in await pl.inner_text(".bslot >> nth=0"),"hráč obsadil slot z telefonu")
    await g.wait_for_timeout(3000)
    chk(await g.eval_on_selector('[data-bslot="0"]',"e=>e.value")=="h1","vypravěč vidí obsazení živě")
    c,t=anon_rpc("mm_boj_obsad",{"p_slot":2,"p_hrac":"h1"});chk(c>=400 and "jednala" in t,"Adam nesmí jednat podruhé: "+t[:60])
    c,t=anon_rpc("mm_boj_obsad",{"p_slot":1,"p_hrac":"h2"});chk(c>=400 and "nepatří" in t,"hráč nesmí do slotu nepřátel")
    await g.select_option('[data-bslot="1"]',"n2");await g.wait_for_timeout(700)
    await g.select_option('[data-bslot="3"]',"n2");await g.wait_for_timeout(700)
    opts=await g.eval_on_selector('[data-bslot="5"]',"e=>[...e.options].map(o=>o.value)")
    chk("n2" not in opts and "n1" in opts,"sok smí jen 2× za kolo: "+str(opts))
    for _ in range(3):
        await g.click('[data-bnpc="n1"] [data-bpoc="-1"]');await g.wait_for_timeout(500)
    t=await g.inner_text('[data-bnpc="n1"]');chk("3/6" in t and "útok +2" in t and "Morálka" in t,"houf: počet, bonus a morálka")
    chk(await g.locator(".bkostka").count()==0,"kostka Závoje v Boji není (hází se fyzicky)")
    await g.click('.bnatahu [data-bact="dalsi"]');await g.wait_for_timeout(700)
    chk(await g.locator(".bslot.btah >> nth=0").inner_text()!="" and await g.evaluate("BOJ.s.tah===1"),"šipka ▼: další tah")
    await g.click('.bnatahu [data-bact="zpet"]');await g.wait_for_timeout(700)
    chk(await g.evaluate("BOJ.s.tah===0"),"šipka ▲: tah o pozici zpět")
    await g.click('.bnatahu [data-bact="dalsi"]');await g.wait_for_timeout(700)
    await g.click('[data-bact="kolo"]');await g.wait_for_timeout(700)
    chk(await g.evaluate("BOJ.s.kolo===2&&Object.keys(BOJ.s.obsazeni).length===0"),"nové kolo vymaže přiřazení")
    # rychlá série změn: optimistické ukládání nesmí ztratit žádnou změnu
    # reakce: odškrtne se a na začátku tahu se obnoví
    await g.click('[data-break="n1"]');await g.wait_for_timeout(300)
    chk(await g.evaluate("!!(BOJ.s.reak||{}).n1"),"reakce se odškrtne")
    await g.select_option(f'[data-bslot="{await g.evaluate("BOJ.s.tah")}"]',"n1") if await g.evaluate("(BOJ.s.sloty[BOJ.s.tah]||{}).t==='n'&&!BOJ.s.obsazeni[BOJ.s.tah]") else None
    await g.wait_for_timeout(400)
    chk(await g.evaluate("!(BOJ.s.reak||{}).n1") or await g.evaluate("(BOJ.s.sloty[BOJ.s.tah]||{}).t!=='n'"),"reakce se na začátku jeho tahu obnoví")
    await g.evaluate("bojZmen(s=>{bojPridejNpc(s,[{n:'Rotmistr',druh:'sok',b:'rotmistr-zoldneru',pr:[]},{n:'Žoldnéři 2',druh:'houf',pocet:6,b:'houf-zoldneru',pr:[]}])})");await g.wait_for_timeout(900)
    hid=await g.evaluate("BOJ.s.npc.find(n=>n.n==='Žoldnéři 2').id");rid=await g.evaluate("BOJ.s.npc.find(n=>n.n==='Rotmistr').id")
    t0=await g.evaluate("performance.now()")
    for _ in range(4): await g.click(f'[data-bnpc="{hid}"] [data-bpoc="-1"]',delay=0)
    lok=await g.evaluate(f"BOJ.s.npc.find(n=>n.id==='{hid}').pocet");chk(lok==2,"rychlá série −: hned vidět 2/6 (optimisticky): "+str(lok))
    await g.wait_for_timeout(1500)
    db=json.loads(urllib.request.urlopen(urllib.request.Request(U+"/rest/v1/boj?id=eq.aktivni&select=stav",headers={"apikey":K})).read())[0]["stav"]
    chk([n for n in db["npc"] if n["id"]==hid][0]["pocet"]==2,"rychlá série −: v databázi uloženo bez ztráty")
    # relativní zápis životů, Zpět a proužek životů
    if not await g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]').count():
        await g.click(f'[data-bnpc="{rid}"] [data-brozb]');await g.wait_for_timeout(300)
    hp=g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]')
    if await hp.count():
        mx=int(await hp.get_attribute("data-max"))
        await hp.fill("-12");await hp.press("Enter");await g.wait_for_timeout(300)
        chk(await g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]').input_value()==str(mx-12),"HP: −12 odečte")
        hp=g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]');await hp.fill("+5");await hp.press("Enter");await g.wait_for_timeout(300)
        chk(await g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]').input_value()==str(mx-7),"HP: +5 přičte")
        await g.click("h2.arttitle");await g.keyboard.press("Control+z");await g.wait_for_timeout(300)
        chk(await g.locator(f'[data-bnpc="{rid}"] [data-bhp="0"]').input_value()==str(mx-12),"HP: Zpět vrátí předchozí hodnotu")
        chk(await g.locator(f'[data-bnpc="{rid}"] .bhpp').count()==1,"proužek životů pod jménem velkého tvora")
        chk("Životy" in await g.inner_text(".bglog"),"změna životů je v záznamu boje")
    else: chk(False,"rotmistr má pole životů")
    # dílčí překreslení: jiná karta zůstane stejný prvek
    await g.evaluate(f"window.__karta=document.querySelector('[data-bnpc=\"{rid}\"]')")
    await g.click(f'[data-bnpc="{hid}"] [data-bpoc="1"]');await g.wait_for_timeout(400)
    chk(await g.evaluate(f"window.__karta===document.querySelector('[data-bnpc=\"{rid}\"]')"),"změna jedné karty nepřekreslí ostatní")
    # hráč se dotazuje jen na verzi
    await pl.wait_for_timeout(3000);rq=[];pl.on("request",lambda r:rq.append(r.url) if "/rest/v1/boj" in r.url else None)
    await pl.wait_for_timeout(6000)
    chk(rq and all("select=verze" in u for u in rq),"hráč stahuje jen verzi, když se nic nemění: "+str(rq))
    # prostředí: vítr dá střelci nevýhodu, úzký průchod omezí přesilu houfu
    await g.click('[data-bpros="vitr"]');await g.wait_for_timeout(400)
    chk(await g.evaluate("(BOJ.s.prostr||[]).includes('vitr')"),"prostředí: vypravěč zapne silný vítr")
    chk(await g.evaluate("bojAdvNavrh(BOJ.s,{id:'zz',stav:[]},{n:'Kuše',b:4,p:'dostřel 100/400'}).v")==-1,"silný vítr: útok z dálky s nevýhodou")
    await g.click('[data-bpros="uzky"]');await g.wait_for_timeout(400)
    chk(await g.evaluate("bojPres(BOJ.s,{pocet:6})")==1,"úzký průchod: přesila houfu nejvýš +1")
    await g.click('[data-bpros="uzky"]');await g.wait_for_timeout(300)
    # hráč u své postavy: stav, kryt a hody proti smrti z telefonu
    pl.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await pl.select_option("[data-bja]","Adam");await pl.wait_for_timeout(500)
    await pl.click(".bjapd summary");await pl.wait_for_timeout(200)
    await pl.click('[data-bhpan="h1"] [data-bhst="sražen"]');await pl.wait_for_timeout(900)
    await pl.click('[data-bhpan="h1"] [data-bhkr="2"]');await pl.wait_for_timeout(900)
    await g.wait_for_timeout(3200)
    chk(await g.evaluate("(BOJ.s.hraci[0].stav||[]).includes('sražen')&&BOJ.s.hraci[0].kryt===2"),"vypravěč vidí stav a kryt, které hráč nastavil z telefonu")
    chk("sražen" in await g.inner_text(".bglog"),"změna z telefonu je v záznamu boje")
    chk(await g.evaluate(f"(()=>{{BCIL['{rid}']='h1';const r=bojAdvNavrh(BOJ.s,BOJ.s.npc.find(n=>n.id==='{rid}'),{{n:'Meč',b:5,p:'dosah 5 stop'}});delete BCIL['{rid}'];return r.v===1&&r.kryt===2}})()"),"návrh výhody počítá se stavem a krytem postavy")
    await pl.click('[data-bhpan="h1"] [data-bhds="pad"]');await pl.wait_for_timeout(900)
    await pl.click('[data-bhpan="h1"] [data-bhds="hod"]');await pl.wait_for_timeout(900)
    await g.wait_for_timeout(3200)
    ds=await g.evaluate("BOJ.s.hraci[0].ds||null");chk(ds is None or (ds["u"]+ds["n"])>=1,"hráč hodí hod proti smrti z telefonu: "+str(ds))
    for body,m in (({"p_hrac":"h1","p_pole":"stav","p_hodnota":["létá"]},"neznámý stav"),({"p_hrac":"h1","p_pole":"ds","p_hodnota":{"u":5,"n":0}},"5 úspěchů"),
                   ({"p_hrac":"h1","p_pole":"hod","p_hodnota":3},"cizí pole"),({"p_hrac":"h1","p_pole":"ready","p_hodnota":"x"*200},"dlouhá připravená akce"),({"p_hrac":"h9","p_pole":"kryt","p_hodnota":2},"neznámá postava")):
        c,t=anon_rpc("mm_boj_hrac",body);chk(c>=400,"mm_boj_hrac odmítne: "+m)
    # vypravěč v seznamu družiny: pád, neúspěchy, smrt
    await g.click('[data-bhrozb="h2"]');await g.wait_for_timeout(300)
    await g.click('[data-bhpan="h2"] [data-bhds="pad"]');await g.wait_for_timeout(400)
    for _ in range(3):
        await g.click('[data-bhpan="h2"] [data-bhds="n"]');await g.wait_for_timeout(350)
    chk(await g.evaluate("(BOJ.s.hraci[1].ds||{}).st")=="mrtev","tři neúspěchy hodu proti smrti: postava umírá")
    chk(await g.evaluate("bojDs({u:0,n:0},'hod',1).ds.n===2&&bojDs({u:2,n:0},'hod',12).ds.st==='stab'&&bojDs({u:1,n:1},'hod',20).ds===null"),"hody proti smrti: 1 = dva neúspěchy, třetí úspěch stabilizuje, 20 probudí")
    # zajatec, kořist a návrh zápisu
    if not await g.locator(f'[data-bnpc="{rid}"] [data-bstav="vzdal se"]').count():
        await g.click(f'[data-bnpc="{rid}"] [data-brozb]');await g.wait_for_timeout(300)
    await g.click(f'[data-bnpc="{rid}"] [data-bstav="vzdal se"]');await g.wait_for_timeout(500)
    chk("smrtelný hřích" in await g.inner_text(f'[data-bnpc="{rid}"]'),"vzdaný nepřítel: karta varuje před vraždou bezbranného")
    await g.click('[data-bact="konec"]');await g.wait_for_timeout(600)
    await g.select_option(f'[data-bosud="{rid}"]',"popraven");await g.wait_for_timeout(400)
    sh=await g.inner_text(".bkonsh")
    chk("vražda bezbranného" in sh,"osud zajatce: poprava připomene smrtelný hřích")
    chk(await g.locator(".bkor li").count()>0 and "štít" in sh,"kořist ze statblocků (zbroj, zbraně)")
    zap=await g.input_value("[data-bzapt]")
    chk("Družina (Adam, Bára a Cyril)" in zap and "Rotmistr (popraven)" in zap and "silném větru" in zap,"návrh zápisu do Kroniky: "+zap[:160])
    await g.click('[data-bkon="zpet"]');await g.wait_for_timeout(400)
    await g.screenshot(path=os.path.join(VYSTUP,"boj-gm.png"),full_page=True)
    await pl.wait_for_timeout(3000);await pl.screenshot(path=os.path.join(VYSTUP,"boj-m.png"),full_page=True)
    chk(not gerr and not perr,"bez chyb JS "+str((gerr+perr)[:2]))
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
