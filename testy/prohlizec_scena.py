"""Scéna mimo boj (2026-10-23): Hra je pořád scéna, boj je jen její režim.
Vypravěč přidá NPC se statistikami ze statbloku, nastaví postoj, DC a víru; hráč na telefonu má kartu se všemi hody,
zvolí, s kým jedná, a jeho hod se vypravěči porovná s DC a pasivním Vhledem; protihod NPC; Boj ze scény převezme NPC
a konec boje vrátí hru do scény i s NPC."""
import asyncio, os, subprocess, sys
from _boj_pomoc import *

async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    g,gerr=await gm_strana(b)
    await g.wait_for_selector(".bscena",timeout=15000)
    if await g.evaluate("(BOJ.s.npc||[]).length||(BOJ.s.zaz||[]).length"):
        await g.click("[data-bscnova]");await g.wait_for_function("!(BOJ.s.npc||[]).length",timeout=8000)
    r=await g.evaluate("[BOJ.s.scena,BOJ.s.aktivni,(BOJ.s.sloty||[]).length,document.querySelector('.bojhead h2').textContent]")
    chk(r==[True,True,0,"Scéna"],"vypravěč: mimo boj je na Hře scéna (bez iniciativy a slotů): "+str(r))
    chk(await g.evaluate("document.querySelector('.pultnav a[href=\"#hra\"]').textContent.trim()")=="Scéna","záložka pultu se jmenuje Scéna")
    # NPC ze statbloku SRD (Noble) přejmenované na Purkmistra
    await g.wait_for_function("typeof PROTBY==='object'&&!!PROTBY['srd-noble']",timeout=15000)
    await g.fill('#bnadd [name=nn]',"Noble");await g.click('#bnadd button[type=submit]')
    await g.wait_for_function("(BOJ.s.npc||[]).some(n=>n.b==='srd-noble')",timeout=8000)
    nid=await g.evaluate("BOJ.s.npc.find(n=>n.b==='srd-noble').id")
    await g.evaluate(f"bojZmen(z=>{{z.npc.find(n=>n.id==='{nid}').n='Purkmistr'}})");await g.wait_for_timeout(600)
    await g.evaluate(f"bojVyber('{nid}');BTAB='k';renderBoj()");await g.wait_for_selector("[data-bscnpc]",timeout=5000)
    chk(await g.input_value('[data-bscnpc] [data-bscab="CHA"]')=="16" and "pasivní Vhled 14" in await g.inner_text("[data-bscnpc] .bscpas"),"NPC: statistiky ze statbloku (CHA 16, pasivní Vhled 14)")
    await g.fill('[data-bscnpc] [data-bscg="dc"]',"15");await g.press('[data-bscnpc] [data-bscg="dc"]',"Tab");await g.wait_for_timeout(700)
    await g.fill('[data-bscnpc] [data-bscg="vira"]',"TAJNÁ_VÍRA: věří jen penězům.");await g.press('[data-bscnpc] [data-bscg="vira"]',"Tab");await g.wait_for_timeout(700)
    await g.select_option('[data-bscnpc] [data-bscg="postoj"]',"nepratelsky");await g.wait_for_timeout(700)
    chk(await g.evaluate(f"(g=>g&&g.dc===15&&g.postoj==='nepratelsky'&&/TAJNÁ_VÍRA/.test(g.vira))((BOJ.s.npc.find(n=>n.id==='{nid}')||{{}}).gm)"),"vypravěč uloží DC, postoj a víru NPC")
    # hráč na telefonu: karta ve scéně, zvolí Purkmistra a hodí Persuasion (Balduina mohl předchozí test nechat svázaného s jiným účtem)
    subprocess.run(os.environ.get("MM_PSQL","psql").split()+["-q","-d",os.environ.get("MM_DB","mm_testy"),"-c","delete from public.hesla where karta = 'balduin'; delete from public.hraci_ucty where karta = 'balduin'; update public.karty set hrac = null where id = 'balduin'"],capture_output=True)
    cx=await b.new_context(viewport={"width":390,"height":844});pl=await cx.new_page();perr=[];pl.on("pageerror",lambda e:perr.append(str(e)[:300]))
    await pl.goto(BASE+"#hra");await pl.wait_for_function("!document.documentElement.classList.contains('mmload')");await pl.wait_for_timeout(1200)
    await pl.evaluate("mmPopX&&mmPopX()")
    r=await pl.evaluate("MMDB.ucetZaloz('scena-balduin','heslo123').then(()=>MMDB.jaKarta('balduin','scena-balduin')).then(()=>'ok',e=>e.message)")
    await puls(g,od=pl)
    try: await g.wait_for_function("(BOJ.s.hraci||[]).some(h=>h.k==='balduin')",timeout=20000);ok=True
    except Exception: ok=False
    if not ok: print("   dbg GM",await g.evaluate("JSON.stringify([KHRAC,bojScenaChybi(BOJ.s).map(k=>k.id),curView,PULTTAB,BOJ.s.hraci])"))
    chk(ok,"postava, kterou si hráč vzal, je ve scéně ("+r+")")
    await pl.reload();await pl.wait_for_function("!document.documentElement.classList.contains('mmload')")
    try: await pl.wait_for_selector(".hraja [data-bhcard]",timeout=15000)
    except Exception:
        print("   dbg",await pl.evaluate("JSON.stringify([JA.get(),bojJa.get(),BOJ.s&&BOJ.s.hraci,document.querySelector('#bojview')&&document.querySelector('#bojview').innerText.slice(0,200)])"))
        raise
    tabs=await pl.evaluate("[...document.querySelectorAll('.btabs [data-btab]')].map(b=>b.textContent).join('|')")
    chk(tabs=="Moje karta|Scéna" and await pl.locator(".btabs .bkonecb").count()==0,"hráč ve scéně: dole Moje karta · Scéna, bez Ukončit tah: "+tabs)
    h=await pl.evaluate("JSON.stringify(BOJ.s)")
    chk("Purkmistr" in h and "TAJNÁ_VÍRA" not in h and '"gm"' not in h,"hráč vidí Purkmistra, ale ne jeho víru, DC ani postoj")
    await pl.click('[data-bscj]');await pl.wait_for_timeout(400)
    chk(await pl.locator('[data-bscj][aria-pressed="true"]').count()==1,"hráč zvolí, s kým jedná")
    await pl.click('.hraja [data-bdmsec="vl"]');await pl.wait_for_timeout(300)
    await pl.click('.hraja [data-khod="dv:Persuasion"]');await pl.wait_for_timeout(1200)
    chk(await pl.evaluate("/^Persuasion → Purkmistr$/.test((HODY[0]||{}).co||'')"),"hod Persuasion jde vůči Purkmistrovi")
    await puls(g,od=pl);await g.evaluate("hodyNacti().then(()=>renderBoj())");await g.wait_for_timeout(800)
    t=await g.inner_text(".bzaz")
    chk("Purkmistr" in t and "DC 15" in t and "pasivní Vhled 14" in t,"vypravěč vidí v záznamu hod proti DC a pasivnímu Vhledu")
    await g.click("[data-bscprot]");await g.wait_for_timeout(600)
    chk("Protihod Insight" in await g.inner_text(".bzaz"),"protihod Purkmistra (Insight) je v záznamu vypravěče")
    await pl.screenshot(path=os.path.join(VYSTUP,"scena-m.png"));await g.screenshot(path=os.path.join(VYSTUP,"scena-gm.png"))
    # útok ve scéně → výzva k boji; Boj převezme NPC; konec boje vrátí scénu i s NPC
    await g.evaluate(f"bojZmen(z=>{{z.zaz=[{{a:'Purkmistr',ai:'{nid}',c:'Balduin',ci:'h1',cim:'Rapier',v:'vedle',hod:5,ts:Date.now()}},...(z.zaz||[])]}})");await g.wait_for_timeout(700)
    chk(await g.locator(".bscutok [data-bscboj]").count()==1,"útok ve scéně nabídne vypravěči přepnutí do boje")
    await g.click(".bscutok [data-bscboj]");await g.wait_for_selector(".bprip",timeout=8000)
    chk(await g.evaluate(f"BOJ.s.priprava&&!BOJ.s.ticha&&BOJ.s.npc.some(n=>n.id==='{nid}')"),"příprava boje převezme NPC ze scény a hráči ji vidí")
    await g.evaluate("bojZmen(z=>{z.hraci.forEach(h=>h.hod=12);z.dm=8})");await g.wait_for_timeout(600)
    await g.click("[data-bstart]");await g.wait_for_selector(".bsloty .bslot",timeout=8000)
    chk(await g.evaluate("bojBezi(BOJ.s)&&(BOJ.s.zaz||[]).length>0"),"boj začal a záznam ze scény pokračuje")
    await g.evaluate("bojZmen(s=>{bojPcKonecBoje(s);bojNaScenu(s)})");await g.wait_for_selector(".bscena",timeout=8000)
    chk(await g.evaluate(f"BOJ.s.scena&&BOJ.s.npc.some(n=>n.id==='{nid}')&&!BOJ.s.priprava"),"konec boje vrátí hru do scény i s NPC")
    chk(await g.locator(".bscutok").count()==0,"po boji se výzva k boji neopakuje")
    chk(not perr and not gerr,"bez chyb "+str((perr+gerr)[:2]))
    await b.close()
asyncio.run(main())
print("SELHALO:",len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
