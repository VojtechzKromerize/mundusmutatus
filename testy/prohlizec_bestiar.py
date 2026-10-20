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
sb["setkani/99-test-cile.md"]="---\nid: test-cile\nnazev: Zkouška cílů\nprostredi: mlha, úzký průchod\nprekvapeni: nepřátelé\nnepratele:\n  - 3 houf-zoldneru\ncile:\n  - Zachránit rukojmí (3×, do 2. kola)\n  - Zabít kněze (skrytý)\n---\nZkušební setkání.\n"
g=json.loads(subprocess.run(["node",os.path.join(KOR,"zdroj","generator.js")],input=json.dumps({"soubory":sb,"manifest":{}},ensure_ascii=False),capture_output=True,text=True,check=True).stdout)
chk([o["b"] for o in g["gm"]["PROTOSOBY"]]==["rytir-v-plne-zbroji"] and g["gm"]["PROTOSOBY"][0]["pr"]==["zkuseny"],"generátor: statblok u osoby pro vypravěče")
chk(all(not g["hrac"].get(x) for x in ("PROTIVNICI","PRIVLASTKY","SETKANI","PROTOSOBY","VYZAZ")),"generátor: hráč nedostane bestiář ani tabulky setkání")
tc=next((x for x in g["gm"]["SETKANI"] if x["id"]=="test-cile"),{})
chk(tc.get("cl")==["Zachránit rukojmí (3×, do 2. kola)","Zabít kněze (skrytý)"] and tc.get("pro")==["mlha","úzký průchod"] and tc.get("pk")=="n","generátor: setkání nese cíle, prostředí a přepadení")

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
    g=await b.new_page(viewport={"width":1300,"height":1100});err=[];g.on("pageerror",lambda e:err.append(str(e)[:300]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.goto(GM+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(600)
    await g.wait_for_selector(".bprip")
    chk(await g.locator(".bpravidla .bqr").count()==5,"rychlá pravidla v šuplíku (kritická zranění, stavy, akce, zbraně, zbroj)")
    chk(not await g.locator(".bpravidla").is_visible(),"šuplík s pravidly je zavřený")
    # hledání: štítek, setkání, osoba
    await g.fill("[data-bhledej]","krkonose");await g.wait_for_timeout(100)
    t=await g.locator("[data-bvysl]").inner_text()
    chk("Lovci vajec v Krkonoších" in t and "Hromová saň" in t,"hledání podle štítku Krkonoše najde setkání i saň")
    await g.fill("[data-bhledej]","relikt");await g.wait_for_timeout(100)
    t=await g.locator("[data-bvysl]").inner_text()
    chk("Krakonoš" in t or "Vodník" in t,"hledání najde relikty (lidové potvory)")
    chk(await g.evaluate("PROTIVNICI.filter(p=>p.rel).every(p=>p.zak&&p.b.includes('Zažehnání'))"),"každý relikt má zákon a blok Relikt se zažehnáním")
    # příprava: postavy, hotové setkání, spojenec
    await priprava(g,["Adam","Bára","Cyril","Dora"],[15,None,None,None],None)
    await g.select_option("[data-bskupadd]","s:rota-bez-pana");await g.wait_for_timeout(500)
    await g.click('[data-otv="pridej-s"] summary');await g.fill('#bnadds [name=nn]',"Rytíř v plné zbroji");await g.select_option('#bnadds [name=nd]',"sok");await g.click('#bnadds button[type=submit]');await g.wait_for_timeout(400)
    nn=await g.evaluate("BOJ.s.npc.filter(n=>!n.str).map(n=>n.n)");print(nn)
    chk(nn==["Rotmistr žoldnéřů","Halapartníci","Druhý šik","Střelci"],"setkání Rota bez pána přidá 4 nepřátele")
    chk(await g.evaluate("BOJ.s.npc.filter(n=>!n.str)[3].b")=="houf-pistalniku","nepřátelé nesou statblock")
    await g.fill("[data-bur]","8");await g.wait_for_timeout(200)
    ob=await g.locator(".bobt").first.inner_text();print(ob)
    chk("XP" in ob and "pro 4 postavy 8. úrovně" in ob,"odhad obtížnosti se ukáže")
    r=await g.evaluate("(()=>{const c=bojCilParse('Zachránit rukojmí (3×, do 2. kola, skrytý)');return [c.n,c.cil,c.kolo,c.ver,bojProsParse('silný vítr, mlha').join(),bojCilTxt(c)]})()")
    chk(r==["Zachránit rukojmí",3,2,False,"vitr,mlha","Zachránit rukojmí (3×, do 2. kola, skrytý)"],"cíl setkání jako text tam i zpět: "+str(r))
    await g.evaluate("bojZmen(z=>bojSetkPouzij(z,{rows:[],cile:[{n:'Udržet bránu',kolo:3,ver:true}],prostr:['mlha'],prekv:'n'}))");await g.wait_for_timeout(400)
    chk(await g.evaluate("BOJ.s.cile.some(c=>c.n==='Udržet bránu'&&c.kolo===3)&&BOJ.s.prostr.includes('mlha')&&BOJ.s.prekv==='n'"),"setkání v přípravě přidá cíle, prostředí a přepadení")
    chk(await g.locator('[data-bpros="mlha"][aria-pressed="true"]').count()==1,"prostředí je vidět v přípravě")
    await g.evaluate("bojZmen(z=>{delete z.prostr;delete z.prekv;z.cile=(z.cile||[]).filter(c=>c.n!=='Udržet bránu');if(!z.cile.length)delete z.cile})");await g.wait_for_timeout(300)
    await g.click("[data-bdmhod]");await g.wait_for_timeout(400)
    chk(await g.evaluate("typeof BOJ.s.dm==='number'"),"hod za nepřátele zapíše iniciativu nepřátel")
    await g.evaluate("bojZmen(z=>{z.dm=12})");await g.wait_for_timeout(300)
    await g.click('[data-bstart]');await g.wait_for_selector(".bsloty");await g.wait_for_timeout(300)
    st=await g.evaluate("BOJ.s.npc.map(n=>[n.id,n.n,n.druh,n.b||'',(n.pr||[]).join('+'),n.str||'',n.os||''])");print(st)
    chk(any(x[5]=="h" for x in st),"spojenec je na straně družiny")
    lay=await g.evaluate("(()=>{const r=q=>document.querySelector(q).getBoundingClientRect(),m=r('.bcolm'),l=r('.bcoll'),t=r('.bsloty');return [m.left<l.left,m.width>l.width,t.bottom<=m.top+2,!!document.querySelector('.bcolm .btabs [data-btab=\"n\"]')]})()")
    chk(lay==[True,True,True,True],"rozložení: osa nahoře, pod ní široký sloupec se záložkami a vedle herní záznam: "+str(lay))
    await g.click('.btabs [data-btab="h"]');await g.wait_for_timeout(200)
    chk(await g.locator(".bsh .bnpc.bspj").count()==1,"karta spojence v družině")
    # sok na tahu se rozbalí sám, ostatní karty zůstanou sbalené
    rot='[data-bnpc="n1"]';hf='[data-bnpc="n2"]'
    await g.select_option('[data-bslot="1"]',"n1");await g.wait_for_timeout(250)
    await g.click('.bnatahu [data-bact="dalsi"]');await g.wait_for_timeout(300)
    chk(await g.locator(rot+".bopen").count()==1 and await g.locator(hf+".bopen").count()==0,"karta toho, kdo je na tahu, je rozbalená, ostatní sbalené")
    chk("Rotmistr" in await g.locator(".bnatahu .bcur").inner_text(),"lišta Na tahu ukazuje rotmistra")
    chk(await g.locator(".bslot.bdone").count()==0,"volný odehraný slot se v pruhu nezobrazuje")
    chk(await g.locator(".bslot.btah .bdrak").count()==1,"žeton na tahu má kolem sebe draka")
    # popisky při najetí myší: ikonky a vlastnosti zbraní
    await g.hover(rot+" .brac");await g.wait_for_timeout(300)
    chk(await g.locator(".btip.on").count()==1 and "AC 18" in await g.locator(".btip").inner_text(),"popisek AC při najetí myší")
    await g.click(rot+' [data-bnp="st"]');await g.wait_for_timeout(300)
    chk("Prone" in await g.inner_text(rot+' .bnkpst'),"stavy nepřítele jako seznam s přepínači (česky i anglicky)")
    chk(await g.locator(rot+" .bsb").inner_html()=="","statblock se počítá až při otevření")
    await g.click(rot+" .bstat summary");await g.wait_for_timeout(200)
    ab=rot+' .bsb abbr.btp:text-is("Ostrá")'
    chk(await g.locator(ab).count()>=1 and "19–20" in (await g.locator(ab).first.get_attribute("data-tip") or ""),"vlastnost zbraně ve statblocku vysvětlí, co dělá")
    # útok soka
    await g.click(rot+' [data-but="0"]');await g.wait_for_timeout(250)
    if await g.locator(".mmpop [data-butsik]").count():
        chk(True,"Šikovná zbraň soka: před hodem nabídka typu zranění");await g.click(".mmpop [data-butsik] >> nth=0");await g.wait_for_timeout(250)
    # Závoj (Požehnání/Pokušení) může mít v záznamu vlastní řádek nad útokem – stačí poslední tři řádky
    lg="\n".join((await g.locator(rot+" .blog li").all_inner_texts())[:3]);print("log:",lg)
    chk("Dlouhý meč" in lg and ("zranění" in lg.lower() or "VEDLE" in lg) and ("Závoj" in lg or "Pokušení" in lg or "Požehnání" in lg),"útok soka: hod, zranění i Závoj")
    # cíl, výhoda a útok jako reakce
    await g.click(rot+' [data-bcilb="h1"]');await g.wait_for_timeout(150)
    await g.click(rot+' [data-badv="1"]');await g.check(rot+" [data-bjr]");await g.click(rot+' [data-but="0"]');await g.wait_for_timeout(300)
    if await g.locator(".mmpop [data-butsik]").count(): await g.click(".mmpop [data-butsik] >> nth=0")
    await g.wait_for_timeout(400)
    lg=await g.locator(rot+" .blog li").first.inner_text()
    chk("Adam" in lg and "výhoda" in lg,"útok na zvolený cíl s výhodou (2d20)")
    chk(await g.evaluate("!!(BOJ.s.reak||{}).n1"),"útok jako reakce odškrtne R")
    await g.click(rot+' [data-badv="auto"]');await g.wait_for_timeout(100)
    # celá akce (Multiattack): útoky po jednom proti vybranému cíli
    await g.evaluate("PROTBY[BOJ.s.npc.find(o=>o.id==='n1').b].multi='Rotmistr provede dva útoky Dlouhý meč.';renderBoj()");await g.wait_for_timeout(200)
    chk(await g.locator(rot+' [data-bmulti]').count()==1 and "2× Dlouhý meč" in await g.locator(rot+' [data-bmulti]').inner_text(),"tlačítko Celá akce se sledem útoků ze statblocku")
    await g.click(rot+' [data-bmulti]');await g.wait_for_timeout(300)
    if await g.locator(".mmpop [data-butsik]").count(): await g.click(".mmpop [data-butsik] >> nth=0");await g.wait_for_timeout(400)
    chk(await g.locator(rot+' [data-bmdal]').count()==1 and "2/2" in await g.locator(rot+' [data-bmdal]').inner_text() and "útok 1 z 2" in await g.locator(rot+" .blog li").first.inner_text(),"první útok proběhl, plaketa nabízí Další útok 2/2")
    if await g.locator(rot+' [data-bzrpo]').count(): await g.click(rot+' [data-bzrpo]');await g.wait_for_timeout(200)
    await g.click(rot+' [data-bmdal]');await g.wait_for_timeout(300)
    if await g.locator(".mmpop [data-butsik]").count(): await g.click(".mmpop [data-butsik] >> nth=0");await g.wait_for_timeout(400)
    chk(await g.locator(rot+' [data-bmdal]').count()==0 and "útok 2 z 2" in await g.locator(rot+" .blog li").first.inner_text(),"druhý útok uzavře celou akci")
    await g.evaluate("delete PROTBY[BOJ.s.npc.find(o=>o.id==='n1').b].multi;renderBoj()");await g.wait_for_timeout(100)
    # cíle boje
    await g.click('.btabs [data-btab="h"]');await g.wait_for_timeout(150)
    await g.click(".bcld summary");await g.fill(".bclf [name=n]","Udržet bránu");await g.fill(".bclf [name=cil]","2");await g.click(".bclf button");await g.wait_for_timeout(500)
    await g.click("[data-bclp]");await g.wait_for_timeout(400)
    chk("1" in await g.locator(".bclp").inner_text(),"cíl boje: počitadlo")
    # útok houfu podle počtu v dosahu
    await g.click('.btabs [data-btab="n"]');await g.wait_for_timeout(150)
    await g.click(hf+" .brozb");await g.wait_for_timeout(200)
    chk(await g.locator(hf+".bopen").count()==1,"kartu jde rozbalit ručně")
    await g.fill(hf+" [data-bdos]","3");await g.click(hf+' [data-but="0"]');await g.wait_for_timeout(150)
    if await g.locator(hf+' [data-bzrpo]').count(): await g.click(hf+' [data-bzrpo]');await g.wait_for_timeout(150)
    lg="\n".join((await g.locator(hf+" .blog li").all_inner_texts())[:3]);print("houf:",lg)
    chk("zranění 9" in lg and "3 × 3 v dosahu" in lg,"houf: 3 zranění × 3 v dosahu = 9")
    chk("přesila +5" in lg,"houf: útok s přesilou +5")
    # rozbalená je vždy jen jedna karta (v levém sloupci): ručně rozbalený houf rotmistra sbalil
    chk(await g.locator(rot+".bopen").count()==0 and await g.locator(".bcolk "+hf).count()==1,"rozbalená karta je jen jedna a je v levém sloupci")
    chk(await g.evaluate("document.querySelector('.bojakt').dataset.btab")=="k","rozbalení nepřítele ze seznamu přepne na záložku Karta")
    await g.click('.btabs [data-btab="n"]');await g.wait_for_timeout(150)
    await g.click(rot+" .bnn[data-brozb]");await g.wait_for_timeout(200)
    # Závoj samostatně
    n0=await g.locator(".bzl li.bz").count()
    await g.click(rot+" [data-bzav]");await g.wait_for_timeout(100)
    chk(await g.locator(".bzl li.bz").count()==n0+1 and "Závoj" in await g.locator(rot+" .blog li").first.inner_text(),"samostatný hod Závoje se zapíše (karta i záznam boje)")
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
    await g.click('.btabs [data-btab="n"]');await g.wait_for_timeout(150)
    await g.click(hf+" .bnn[data-brozb]");await g.wait_for_timeout(200)
    await g.select_option(hf+" [data-bvelsok]","n1");await g.wait_for_timeout(400)
    await g.click('.btabs [data-btab="n"]');await g.wait_for_timeout(150)
    await g.fill(rot+' [data-bhp]',"0");await g.press(rot+' [data-bhp]',"Enter");await g.wait_for_timeout(100)
    await g.evaluate("renderBoj()");await g.wait_for_timeout(100)
    chk("padl" in await g.locator(hf+" .bmor").inner_text(),"když sok padne, houf hlásí útěk")
    # úprava hodu (Bless) změní minutí na zásah: zranění zbraně se hodí teprve teď; Bane zpět na minutí ho vynuluje
    r=await g.evaluate("""(async()=>{const jm0=bojJa.get();bojJa.set('Adam');BJU.cil='n1';
      BJU.serie=[{ci:'n1',hod:18,d:10,d1:10,d2:null,v:0,b:8,dmg:0,krit:false,vys:'vedle',upr:[],mods:[],zx:'',dz:{z:'1d8+3',plus:0,ez:[],rz:null}}];BJU.hod='18';BJU.d='10';BJU.dmg='0';
      await bojJaUprav('b4');const a=Object.assign({},BJU.serie[0]);for(let i=0;i<5;i++)await bojJaUprav('m4');const z=BJU.serie[0];BJU.serie=null;BJU.info='';bojJa.set(jm0||'');
      return [a.vys,a.dmg,z.vys,z.dmg]})()""")
    chk(r[0]!="vedle" and 4<=r[1]<=11 and r[2]=="vedle" and r[3]==0,"Bless změní minutí na zásah a zranění se dohodí, Bane zpět na minutí ho vynuluje: "+str(r))
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
    await g.wait_for_timeout(500);chk(await g.locator(".bprip").count()==1 and await g.evaluate("BOJ.s.hraci.map(h=>h.n).join()")=="Adam,Bára,Cyril,Dora","po ukončení zpět příprava se stejnou družinou")
    # kouzla z katalogu: jména z D&D Beyond (i s vlastním jménem a „(Ritual)“), rituál, automatika, kouzla mimo SRD
    kz=await g.evaluate("""(async()=>{await kSpNacti();const K=Object.values(KARTBY)[0],u=kSpUcinek(K,{n:'Fireball',st:3},4);
      return [kSp("Tasha’s Hideous Laughter")?.en,kSp('Detect Magic (Ritual)')?.ri,kSp("Bigby's Hand")?.en,u&&u.x,u&&u.t,u&&u.zach,u&&u.pol,kSp('Silvery Barbs')?.x,kSp('Silvery Barbs')?.cz,kSp('Feeblemind')?.en,
        /1d6/.test(kSp('Acid Splash')?.t||'')&&!/1k6/.test(kSp('Acid Splash')?.t||'')]})()""")
    chk(kz==["Hideous Laughter",1,"Arcane Hand","9d6","Fire","AGI",True,1,"Stříbrné šlehy","Befuddlement",True],"kouzla z katalogu: jména z D&D Beyond, rituál, automatika Fireballu, kouzla mimo SRD: "+str(kz))
    # mobil
    await g.set_viewport_size({"width":390,"height":844});await g.wait_for_timeout(300)
    sw=await g.evaluate("document.documentElement.scrollWidth");chk(sw<=392,"mobil bez vodorovného posunu: "+str(sw))
    # kouzla (2026-10-20): kouzlo NPC jedním klikem, záchrany NPC podle pravidel, oblasti, posílení na kartě, trvání v kolech, opakování bez slotu
    k=await b.new_page(viewport={"width":1300,"height":900});k.on("pageerror",lambda e:err.append("kouzla: "+str(e)[:300]))
    await k.goto(GM+"#boj");await k.wait_for_timeout(2500)
    await k.evaluate("bojZmen(z=>{z.hraci=[{id:'h1',n:KARTBY.balduin.n,hod:12}];z.npc=[];z.nid=0;bojPridejNpc(z,[{n:'Mág',druh:'sok',b:'srd-mage',pr:[]},{n:'Kněz',druh:'sok',b:'srd-priest',pr:[]}]);z.dm=10})");await k.wait_for_timeout(500)
    await k.click('[data-bstart]');await k.wait_for_timeout(800);await k.evaluate("kzNacti()");await k.wait_for_timeout(1500)
    await k.evaluate("bojVyber('n1');BTAB='k';renderBoj()");await k.wait_for_timeout(500)
    chk("SO 14" in await k.locator('[data-bnpc="n1"] .bkzl').inner_text() and "2/2" in await k.locator('[data-bnpc="n1"] [data-bkz="fireball"]').inner_text(),"kouzla NPC: SO ze statbloku a počty použití u nestvůry SRD (Fireball 2/den)")
    await k.evaluate("BCIL['n1']='h1'");await k.click('[data-bnpc="n1"] [data-bkz="fireball"]');await k.wait_for_timeout(800)
    P=await k.evaluate("[BPLOS&&BPLOS.z,BPLOS&&BPLOS.ab,BPLOS&&BPLOS.dc,BPLOS&&BPLOS.pol,(BPLOS&&BPLOS.cile||[]).join(),(bojZdr.get().n1||{}).Fireball]")
    chk(P==["9d6","AGI",14,True,"h1",1],"Fireball (4. st.) od mága: plošný zásah 9d6 AGI SO 14, cíl z výběru, použití odečteno: "+str(P))
    r=await k.evaluate("""(async()=>{const s=BOJ.s,m=s.npc[0],kn=s.npc[1],K=KARTBY.balduin,o=[];await kSpNacti();
      await bojNpcKouzlo(m,'fire-bolt',null);const L=(BLOG[m.id]||[])[0]||{};o.push(L.n==='Fire Bolt'&&!!L.hod&&L.hod.b===6&&/[24]d10/.test((L.zr||{}).x||(L.zrPo?'2d10':'')||'2d10'));
      await bojNpcKouzlo(m,'hold-person',null);o.push(BPLOS&&BPLOS.st.join()==='ochromen'&&BPLOS.op&&BPLOS.kon==='n1');
      await bojZmen(z=>{z.npc[0].stav=['ochromen'];z.npc[0].ef=[{n:'Bane',kdy:'kola',k:5}]});const Z=bojNpcZach(BOJ.s.npc[0],bojEff(BOJ.s.npc[0]),'AGI',15,true),Z2=bojNpcZach(BOJ.s.npc[0],bojEff(BOJ.s.npc[0]),'WIS',15,true);o.push(Z.fail==='ochromen'&&!Z.ok,Z2.why.some(w=>/Bane/.test(w)));
      await bojZmen(z=>{z.npc[0].stav=[];delete z.npc[0].ef});
      BCIL[kn.id]='h1';await bojNpcKouzlo(kn,'spirit-guardians','Spirit Guardians');await new Promise(r=>setTimeout(r,300));o.push((BOJ.s.obl||[]).length===1&&BOJ.s.obl[0].z==='3d8'&&(BOJ.s.npc[1].stav||[]).includes('soustředí'));
      await bojZmen(z=>{z.obl[0].cile=['n1']});const hp0=(bojHp.get().n1||[])[0];await bojZmen(z=>{bojKonecTahu(z,'n1')});await new Promise(r=>setTimeout(r,200));o.push(((bojHp.get().n1||[])[0]??81)<(hp0??81)||/Spirit Guardians/.test((BTMSG.n1||[]).join(' ')));
      await bojZmen(z=>{const q=z.npc[1];q.stav=(q.stav||[]).filter(x=>x!=='soustředí')});await new Promise(r=>setTimeout(r,200));o.push(!(BOJ.s.obl||[]).length);
      const ac0=kAC(K),r0=kRychN(K);await kUcPridej(K,'Haste',1/60,true);o.push(kAC(K)===ac0+2&&kRychN(K)===2*r0&&kStavVliv(K,'Záchrana AGI').r.some(x=>x[1]==='Haste'));
      await bojZmen(z=>{});await new Promise(r=>setTimeout(r,200));o.push(!!(BOJ.s.ucb||{})['balduin|Haste']);
      await bojZmen(z=>{z.kolo=(z.kolo||1)+10});await new Promise(r=>setTimeout(r,800));o.push(!kUc(K).some(u=>u.n==='Haste')&&kAC(K)===ac0);
      const hm=kHPmax(K);await kUcPridej(K,'Aid (3. st.)',8,false);o.push(kHPmax(K)===hm+10);
      await kUcPridej(K,'Witch Bolt',1/60,true);bojJa.set(K.n);BJU.cil='n1';bojOpak('Witch Bolt');o.push(BJU.hod==='60'&&+BJU.dmg>=1&&+BJU.dmg<=12&&/bez slotu/.test(BJU.info));
      return o})()""")
    chk(r==[True]*12,"kouzla NPC (útok, Hold Person, záchrany ve stavu, Bane, oblast Spirit Guardians se soustředěním), Haste a Aid na kartě, trvání v kolech, Witch Bolt bez slotu: "+str(r))
    r2=await k.evaluate("""(async()=>{const K=KARTBY.balduin,o=[];await kSpNacti();
      await kartaStavZmen(K.id,{hp:10,stavy:['otrávený']});await kSesSpec(K,{n:'Heal',st:6},6,[K],[]);o.push(kartaStav(K.id).hp==null&&!(kartaStav(K.id).stavy||[]).length);
      await kartaStavZmen(K.id,{stavy:['oslepen']});await kSesSpec(K,{n:'Lesser Restoration',st:2},2,[K],[]);o.push(!(kartaStav(K.id).stavy||[]).length);
      await kUcPridej(K,'Magic Weapon (4. st.)',1,false);const at=kUtoky(K)[0],E=kEfAkt(K,[],at);o.push(E.some(e=>e.ut===2&&e.zr===2));
      setTimeout(()=>{const b=document.querySelector('[data-kvyb]');b&&b.click()},400);await kSesPo(K,{n:'Summon Undead',st:3},4);const sp=(kartaStav(K.id).spol||[]).slice(-1)[0]||{};o.push(sp.ac===15&&sp.max===40&&sp.kz==='Summon Undead');
      await kSumKonec(K,['Summon Undead']);o.push(!(kartaStav(K.id).spol||[]).some(s=>s.kz));
      const R=kReakceNaZasah(K,BOJ.s.hraci[0],BOJ.s,{hod:17,ac:18,d:12,ph:5,ai:'n1',t:'Fire'});o.push(R.o.every(x=>!/Silvery|Hellish|Counterspell/.test(x.n))&&R.o.some(x=>/^Shield/.test(x.n)));
      await bojZmen(z=>{z.npc[0].ef=[{n:'Hold Person',kdy:'kola',k:5,st:'ochromen',src:'h1'}];z.npc[0].stav=['ochromen']});await bojZmen(z=>{bojEfZnac(z,z.npc[0],'Dispel Magic',{h:null})});o.push(!(BOJ.s.npc[0].ef||[]).length&&!(BOJ.s.npc[0].stav||[]).includes('ochromen'));
      await bojZmen(z=>{z.npc[0].ef=[{n:'Bane',kdy:'kola',k:10,kolo:1,tah:0,od:'h1'}]});o.push(/Bane/.test(bojKzIkHtml(BOJ.s,'n1'))&&/Bane/.test(bojSlStav('n1')));
      return o})()""")
    chk(r2==[True]*8,"Heal, Lesser Restoration, Magic Weapon, Summon Undead (vznik i konec), reakce jen z kouzel postavy, Dispel Magic: "+str(r2))
    # útok za hráče: jediný nepřítel je cílem sám, Hex na cíli přidá 1d6; připomínka soustředění se po obnovení neopakuje (2026-10-20)
    r3=await k.evaluate("""(async()=>{const o=[],s=BOJ.s,n=s.npc[0];o.push(JSON.stringify(bojCileL({},[n]))===JSON.stringify([n.id])&&bojCileL({},[n,Object.assign({},n,{id:'zz'})]).length===0&&bojCileL({},[Object.assign({},n,{stav:['poražen']})]).length===0);
      await bojZmen(z=>{z.npc.forEach((x,i)=>{x.ef=i?[]:[{n:'Hex',kdy:'kola',k:10,kolo:z.kolo||1,tah:0,od:'h1',src:'h1'}];if(i)x.stav=['poražen']});const h=z.hraci.find(x=>x.id==='h1');h.stav=['soustředí']});await new Promise(r=>setTimeout(r,300));
      const h=BOJ.s.hraci.find(x=>x.id==='h1'),j=bojZbrVse(BOJ.s,h).findIndex(w=>w.n==='Nevermore');BGMU.h1={};const R=Math.random;Math.random=()=>0.9;try{bojGmHod('h1',j)}finally{Math.random=R}
      const G=BGMU.h1,x=(G.serie||[])[0]||{};o.push(x.ci===n.id&&/\(Hex\)/.test((x.det||{}).zx||"")&&x.dmg>=12);
      const u0=(BOJ.s.utoky||[]).length;bojGmZapisVse('h1');await new Promise(r=>setTimeout(r,900));o.push((BOJ.s.utoky||[]).length===u0+1);
      BZASV.set(Date.now());BJK.seen=0;BJK.d='';bojKonHlidej({kolo:1,zaz:[{ci:'h1',z:5,k:1,ts:Date.now()-5000}]},{id:'h1',stav:['soustředí']});o.push(BJK.d==='');
      return o})()""")
    chk(r3==[True]*4,"útok za hráče: jediný nepřítel je cílem, Hex přidá 1d6, útok se zapíše, staré zranění se po obnovení znovu nehlásí: "+str(r3))
    # malované ikony: každá použitá v BIMG, KZIK a stavech má soubory 48 i 96 px (2026-10-20)
    ik=await k.evaluate("[...BIMG,...Object.values(KZIK),...Object.values(BSTI).map(x=>x[0]).filter(x=>BIMG.has(x))]")
    koren=os.environ.get("MM_KOREN",os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    chyb=sorted({n for n in ik if not all(os.path.exists(os.path.join(koren,"art/img/boj",f"{n}-{px}.webp")) for px in (48,96))})
    chk(not chyb and "bless" in ik and "krvaci" in ik,"malované ikony stavů a kouzel mají soubory 48/96 px: "+str(chyb))
    # volby po zásahu, přesun Hexu, reakce bojovníka (2026-10-20)
    r4=await k.evaluate("""(async()=>{const o=[],K=KARTBY.balduin,s=BOJ.s,me=s.hraci.find(x=>x.id==='h1');
      K.rysy=[...(K.rysy||[]),'Eldritch Smite','Trip Attack','Parry','Riposte','Precision Attack','Great Weapon Master'];K.zdroje=[...(K.zdroje||[]),{n:'Combat Superiority',max:4,obn:'krátký nebo dlouhý odpočinek · kostka d8'}];
      await kartaStavZmen(K.id,{zdr:{}});bojJa.set(K.n);const zb=bojZbrVse(s,me),j=zb.findIndex(w=>!w.dal&&w.z);BJU.zi=String(j);BJU.ef=[];BJU.ridT=null;
      BJU.serie=[{ci:s.npc[0].id,hod:25,d:17,krit:false,vys:'zásah',dmg:10,zx:'1d8(5)+5'}];BJU.ui=0;const q=BJU.serie[0];
      const R=bojJaRidery(K,me,zb[j],q,s);o.push(R.some(r=>r.k==='es:slot3p'&&r.zr==='4d8')&&R.some(r=>r.k==='m:Trip Attack'&&/STR SO \d+/.test(r.cim)));
      bojJaRid('es:slot3p');const d1=q.dmg;o.push(q.rid.length===1&&d1>=14&&d1<=42&&/Eldritch Smite/.test(q.zx));
      bojJaRid('es:slot3p');o.push(q.dmg===10&&!q.rid.length);
      bojJaRid('es:slot3p');bojJaRid('m:Trip Attack');o.push(q.rid.length===2);
      await bojJaRidPo(K,me,[q]);const Z=kartaStav(K.id).zdr||{};o.push(Z.slot3p===1&&Z['Combat Superiority']===1&&BJU.ridT.u.includes('es'));
      o.push(!bojJaRidery(K,me,zb[j],{ci:q.ci,vys:'zásah',dmg:5},s).some(r=>r.g==='es'));
      const e={hod:20,ac:18,d:15,ph:8,ai:s.npc[0].id,t:'Slashing'};o.push(kReakceNaZasah(K,me,s,e).o.some(r=>r.k==='parry')&&!kReakceNaZasah(K,me,s,Object.assign({},e,{dal:1})).o.some(r=>r.k==='parry'));
      o.push(kEfAkt(K,[],{n:'Greatsword'}).some(x=>x.n==='Great Weapon Master'&&x.zr===kPB(K))&&!kEfAkt(K,[],{n:'Dagger'}).some(x=>x.n==='Great Weapon Master'));
      const P=kUpravHod({d1:5,d2:null,v:0,b:6,mods:[],upr:[],utok:true,kmin:20},'prec',8);o.push(P.r.tot>=12&&P.r.tot<=19&&/Precision/.test(P.pop));
      await kartaStavZmen(K.id,{uc:[{n:'Hex',h:1,kon:true}]});
      await bojZmen(z=>{const n1=z.npc[0];n1.ef=[{n:'Hex',kdy:'kola',k:77,kolo:1,tah:0,od:'h1',src:'h1'}];n1.stav=['poražen'];const n2=z.npc.find((x,i)=>i>0);if(n2){n2.stav=[];n2.ef=[]}});await new Promise(r=>setTimeout(r,300));
      const s2=BOJ.s,n2=s2.npc.find((x,i)=>i>0);o.push(!!n2&&/data-juhexp/.test(bojJaHexHtml(s2,s2.hraci.find(x=>x.id==='h1'),K)));
      if(n2){await bojZmen(z=>{bojEfZnac(z,z.npc.find(x=>x.id===n2.id),'Hex (přesun)',{h:'h1'})});await new Promise(r=>setTimeout(r,300))}
      const N1=BOJ.s.npc[0],N2=n2&&BOJ.s.npc.find(x=>x.id===n2.id);o.push(!!N2&&!(N1.ef||[]).some(x=>x.n==='Hex')&&(N2.ef||[]).some(x=>x.n==='Hex'&&x.k===77&&x.od==='h1'));
      return o})()""")
    chk(r4==[True]*11,"volby po zásahu (Eldritch Smite, Trip Attack, jednou za tah, útrata), Parry jen proti útoku zblízka, Great Weapon Master, Precision Attack, přesun Hexu: "+str(r4))
    await k.close()
    # hráč
    h=await b.new_page();h.on("pageerror",lambda e:err.append("hráč: "+str(e)[:300]))
    await h.goto(HR+"#boj");await h.wait_for_timeout(1200)
    chk(await h.evaluate("[PROTIVNICI.length,SETKANI.length,PROTOSOBY.length,PRIVLASTKY.length,VY_ZAZ.length].join()")=="0,0,0,0,0","hráč nemá žádná data bestiáře ani tabulky setkání")
    chk(not err,"bez chyb JavaScriptu: "+str(err))
    await b.close()
asyncio.run(main())
print("\nCHYBY:",fails if fails else "žádné")
raise SystemExit(1 if fails else 0)
