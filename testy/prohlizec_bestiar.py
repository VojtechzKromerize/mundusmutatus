"""Bestiář v Boji (statická vypravěčská verze, bez databáze): hledání, setkání, odhad obtížnosti, spojenci,
útoky a Závoj v kartě, zdroje, přívlastky, vazba sok–houf, kritická zranění, shrnutí po boji, nové rozložení;
a že hráč nedostane nic z bestiáře ani tabulek setkání. Generátor navíc ověří statblok u osoby.
Spouští testy/spustit.sh: MM_GMWEB = vypravěčská statická verze, MM_HRWEB = hráčská statická verze, MM_KOREN = kopie webu."""
import asyncio, re, os, json, subprocess, glob
from playwright.async_api import async_playwright
OUT=os.environ.get("MM_VYSTUP","/tmp")+"/"
GM=os.environ.get("MM_GMWEB","http://127.0.0.1:18793/");HR=os.environ.get("MM_HRWEB","http://127.0.0.1:18794/");KOR=os.environ.get("MM_KOREN",".")
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
# generátor: statblok u osoby jde jen vypravěči
ob=os.path.join(KOR,"zdroj","obsah");sb={}
for f in glob.glob(ob+"/**/*",recursive=True):
    r=os.path.relpath(f,ob).replace(os.sep,"/")
    if os.path.isfile(f) and (r.endswith(".md") or r.endswith(".json")) and not r.split("/")[-1].startswith("_"): sb[r]=open(f,encoding="utf-8").read()
k=next(x for x in sb if x.startswith("osoby/") and "\nid: viktorin\n" in "\n"+sb[x])
sb[k]=sb[k].replace("\n---\n","\nstatblok: rytir-v-plne-zbroji + zkuseny\n---\n",1)
g=json.loads(subprocess.run(["node",os.path.join(KOR,"zdroj","generator.js")],input=json.dumps({"soubory":sb,"manifest":{}},ensure_ascii=False),capture_output=True,text=True,check=True).stdout)
chk([o["b"] for o in g["gm"]["PROTOSOBY"]]==["rytir-v-plne-zbroji"] and g["gm"]["PROTOSOBY"][0]["pr"]==["zkuseny"],"generátor: statblok u osoby pro vypravěče")
chk(all(not g["hrac"].get(x) for x in ("PROTIVNICI","PRIVLASTKY","SETKANI","PROTOSOBY","VYZAZ")),"generátor: hráč nedostane bestiář ani tabulky setkání")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    g=await b.new_page(viewport={"width":1300,"height":1100});err=[];g.on("pageerror",lambda e:err.append(str(e)[:300]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.goto(GM+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(600)
    await g.wait_for_selector("#bojform")
    chk(await g.locator(".bpravidla .bqr").count()==3,"rychlá pravidla v šuplíku (kritická zranění, zbraně, zbroj)")
    chk(not await g.locator(".bpravidla").is_visible(),"šuplík s pravidly je zavřený")
    # hledání: štítek, setkání, osoba
    await g.fill("[data-bhledej]","krkonose");await g.wait_for_timeout(100)
    t=await g.locator("[data-bvysl]").inner_text()
    chk("Lovci vajec v Krkonoších" in t and "Hromová saň" in t,"hledání podle štítku Krkonoše najde setkání i saň")
    # načíst hotové setkání do formuláře
    await g.select_option("[data-bskup]","s:rota-bez-pana");await g.wait_for_timeout(200)
    nn=await g.eval_on_selector_all("#bfn [name=nn]","e=>e.map(x=>x.value)");print(nn)
    chk(nn==["Rotmistr žoldnéřů","Halapartníci","Druhý šik","Střelci"],"setkání Rota bez pána vyplní 4 řádky")
    chk(await g.locator("#bfn [name=nb]").nth(3).input_value()=="houf-pistalniku","řádky nesou statblock")
    hn=g.locator('#bojform [name=hn]')
    for i,n in enumerate(["Adam","Bára","Cyril","Dora"]): await hn.nth(i).fill(n)
    await g.fill("[data-bur]","8");await g.wait_for_timeout(100)
    ob=await g.locator("#bobt").inner_text();print(ob)
    chk("XP" in ob and "pro 4 postavy 8. úrovně" in ob,"odhad obtížnosti se ukáže")
    # spojenec
    await g.click('[data-badd="s"]');await g.locator("#bfs [name=nn]").nth(0).fill("Rytíř v plné zbroji")
    await g.fill('#bojform [name=hod]',"15");await g.fill('#bojform [name=dm]',"12")
    await g.click('#bojform button[type=submit]');await g.wait_for_selector(".bsloty");await g.wait_for_timeout(300)
    st=await g.evaluate("BOJ.s.npc.map(n=>[n.id,n.n,n.druh,n.b||'',(n.pr||[]).join('+'),n.str||'',n.os||''])");print(st)
    chk(any(x[5]=="h" for x in st),"spojenec je na straně družiny")
    lay=await g.evaluate("(()=>{const a=document.querySelector('.bsh').getBoundingClientRect(),b=document.querySelector('.bsn').getBoundingClientRect(),t=document.querySelector('.bsloty').getBoundingClientRect();return [a.left<b.left,a.width<b.width,t.bottom<=a.top+2]})()")
    chk(lay==[True,True,True],"rozložení: osa nahoře, družina vlevo užší, nepřátelé vpravo: "+str(lay))
    chk(await g.locator(".bsh .bnpc.bspj").count()==1,"karta spojence v družině")
    # sok na tahu se rozbalí sám, ostatní karty zůstanou sbalené
    rot='[data-bnpc="n1"]';hf='[data-bnpc="n2"]'
    await g.select_option('[data-bslot="1"]',"n1");await g.wait_for_timeout(250)
    await g.click('.bnatahu [data-bact="dalsi"]');await g.wait_for_timeout(300)
    chk(await g.locator(rot+".bopen").count()==1 and await g.locator(hf+".bopen").count()==0,"karta toho, kdo je na tahu, je rozbalená, ostatní sbalené")
    chk("Rotmistr" in await g.locator(".bnatahu .bcur").inner_text(),"lišta Na tahu ukazuje rotmistra")
    chk(await g.locator(".bslot.bdone .bdoneic").count()==1,"odehraný slot má ikonku")
    # popisky při najetí myší: ikonky a vlastnosti zbraní
    await g.hover(rot+" .brac");await g.wait_for_timeout(300)
    chk(await g.locator(".btip.on").count()==1 and "AC 18" in await g.locator(".btip").inner_text(),"popisek AC při najetí myší")
    await g.hover(rot+' [data-bstav="sražen"]');await g.wait_for_timeout(300)
    chk("Prone" in await g.locator(".btip").inner_text(),"stav jako ikonka s popiskem")
    ab=rot+' .bsb abbr.btp:text-is("Ostrá")'
    chk(await g.locator(ab).count()>=1 and "19–20" in (await g.locator(ab).first.get_attribute("data-tip") or ""),"vlastnost zbraně ve statblocku vysvětlí, co dělá")
    # útok soka
    await g.click(rot+' [data-but="0"]');await g.wait_for_timeout(150)
    lg=await g.locator(rot+" .blog li").first.inner_text();print("log:",lg)
    chk("Dlouhý meč" in lg and "zranění" in lg and ("Závoj" in lg or "Pokušení" in lg or "Požehnání" in lg),"útok soka: hod, zranění i Závoj")
    # útok houfu podle počtu v dosahu
    await g.click(hf+" .brozb");await g.wait_for_timeout(200)
    chk(await g.locator(hf+".bopen").count()==1,"kartu jde rozbalit ručně")
    await g.fill(hf+" [data-bdos]","3");await g.click(hf+' [data-but="0"]');await g.wait_for_timeout(150)
    lg=await g.locator(hf+" .blog li").first.inner_text();print("houf:",lg)
    chk("zranění 9" in lg and "3 × 3 v dosahu" in lg,"houf: 3 zranění × 3 v dosahu = 9")
    chk("přesila +5" in lg,"houf: útok s přesilou +5")
    # Závoj samostatně
    await g.click(rot+" [data-bzav]");await g.wait_for_timeout(100)
    chk(await g.locator(".bglog li").count()==3 and "Závoj" in await g.locator(rot+" .blog li").first.inner_text(),"samostatný hod Závoje se zapíše (karta i záznam boje)")
    # zdroje
    await g.click(rot+' [data-bzd="Výdrž"] [data-bzdi="0"]');await g.wait_for_timeout(100)
    chk(await g.locator(rot+' [data-bzd="Výdrž"] button.on').count()==1,"Výdrž se odškrtne")
    # přívlastek
    ac0=await g.locator(rot+" .brac").inner_text()
    await g.select_option(rot+" [data-bpradd]","veteran");await g.wait_for_timeout(400)
    ac1=await g.locator(rot+" .brac").inner_text();print(ac0,"→",ac1)
    chk("19" in ac1 and "18" in ac0,"Veterán zvýší AC 18 → 19")
    chk(await g.locator(rot+' [data-bhp]').get_attribute("data-max")=="105","Veterán: HP 75 +40 % = 105")
    chk(await g.locator(rot+' [data-but="0"] b').inner_text()=="+8","Veterán: útok +6 → +8")
    chk(await g.locator(rot+' [data-bzd="Výdrž"] button').count()==3,"Veterán: Výdrž 2 → 3")
    # vazba sok–houf a morálka
    await g.select_option(hf+" [data-bvelsok]","n1");await g.wait_for_timeout(400)
    await g.fill(rot+' [data-bhp]',"0");await g.wait_for_timeout(100)
    await g.evaluate("renderBoj()");await g.wait_for_timeout(100)
    chk("padl" in await g.locator(hf+" .bmor").inner_text(),"když sok padne, houf hlásí útěk")
    # kritické zranění v šuplíku s pravidly
    await g.click(".bprtg");await g.wait_for_timeout(350)
    chk(await g.locator(".bpravidla").is_visible(),"šuplík s pravidly se otevře")
    await g.select_option("[data-bkd]","drak");await g.fill("[data-bkr]","1");await g.fill("[data-bkp]","10");await g.click("[data-bkhod]");await g.wait_for_timeout(150)
    kt=await g.locator(".bkrit").inner_text();print("krit:",kt[:160].replace("\n"," | "))
    chk(re.search(r"d10 \d+ \+ 3 = \d+",kt) is not None and any(x in kt for x in ["Hlava","Trup","Křídla","Nohy a ocas"]),"kritické zranění draka: modifikátor +3 a místo zásahu")
    await g.screenshot(path=OUT+"5-boj-novy.png",full_page=True)
    await g.keyboard.press("Escape");await g.wait_for_timeout(350)
    chk(not await g.locator(".bpravidla").is_visible(),"Escape šuplík zavře")
    # konec boje: shrnutí
    await g.click("[data-bact=konec]");await g.wait_for_timeout(200)
    sh=await g.locator(".bkonsh").inner_text();print("shrnutí:",sh[:200].replace("\n"," | "))
    chk("Rotmistr žoldnéřů – poražen" in sh and "Výkupné 20 kop" in sh,"shrnutí: poražený rotmistr s výkupným")
    await g.click('[data-bzaj="n1"]');await g.wait_for_timeout(150)
    chk("Rotmistr žoldnéřů – zajat" in await g.locator(".bkonsh").inner_text(),"zajetí se dá poznamenat")
    await g.screenshot(path=OUT+"6-konec.png",full_page=False)
    txt=await g.evaluate("bojShrn(BOJ.s).txt");print(txt[:200])
    chk(txt.startswith("boj (kolo 1)") and "zajat" in txt,"podklad pro Kroniku")
    await g.click('[data-bkon="ok"]');await g.wait_for_timeout(400)
    chk(await g.locator("#bojform").count()==1,"po ukončení zpět rozestavení")
    # mobil
    await g.set_viewport_size({"width":390,"height":844});await g.wait_for_timeout(300)
    sw=await g.evaluate("document.documentElement.scrollWidth");chk(sw<=392,"mobil bez vodorovného posunu: "+str(sw))
    # hráč
    h=await b.new_page();h.on("pageerror",lambda e:err.append("hráč: "+str(e)[:300]))
    await h.goto(HR+"#boj");await h.wait_for_timeout(1200)
    chk(await h.evaluate("[PROTIVNICI.length,SETKANI.length,PROTOSOBY.length,PRIVLASTKY.length,VY_ZAZ.length].join()")=="0,0,0,0,0","hráč nemá žádná data bestiáře ani tabulky setkání")
    chk(not err,"bez chyb JavaScriptu: "+str(err))
    await b.close()
asyncio.run(main())
print("\nCHYBY:",fails if fails else "žádné")
raise SystemExit(1 if fails else 0)
