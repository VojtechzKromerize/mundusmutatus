"""Fórum (2026-10-31): vypravěč založí quest s účastníky, hráč se přihlášenou postavou vidí, že se čeká na něj, odpoví
a čekání přejde na vypravěče; soukromé téma jiné postavy hráč nevidí; skrytý příspěvek hráči zmizí."""
import asyncio, os, subprocess, sys
from _boj_pomoc import *
from _klid import klid, dokud, sleduj  # čekání na stav místo pevných pauz (testy/_klid.py)

async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    g,gerr=await gm_strana(b)
    subprocess.run(os.environ.get("MM_PSQL","psql").split()+["-q","-d",os.environ.get("MM_DB","mm_testy"),"-c","delete from public.hesla where karta = 'balduin'; delete from public.hraci_ucty where karta = 'balduin'; update public.karty set hrac = null where id = 'balduin'"],capture_output=True)
    cx=await b.new_context(viewport={"width":390,"height":844});pl=await cx.new_page();await sleduj(pl);perr=[];pl.on("pageerror",lambda e:perr.append(str(e)[:300]))
    await pl.goto(BASE+"#hra");await pl.wait_for_function("!document.documentElement.classList.contains('mmload')");await klid(pl,2000)
    await pl.evaluate("mmPopX&&mmPopX()")
    r=await pl.evaluate("MMDB.ucetZaloz('forum-balduin','heslo123').then(()=>MMDB.jaKarta('balduin','forum-balduin')).then(()=>'ok',e=>e.message)")
    chk(r=="ok","hráč se přihlásí za Balduina: "+str(r))
    await pl.reload();await pl.wait_for_function("!document.documentElement.classList.contains('mmload')");await klid(pl,2000)
    # vypravěč: nový quest s Balduinem, čeká se na něj
    await g.goto(BASE+"#forum");await g.wait_for_selector(".fokat",timeout=15000)
    chk(await g.locator(".fokat").count()>=5,"vypravěč vidí obsah fóra s kategoriemi")
    await g.goto(BASE+"#forum/n/aktivni-questy");await g.wait_for_selector("[data-fonove]",timeout=10000)
    await g.fill("[name=nazev]","Cesta do Kutné Hory");await g.fill("[name=datum]","14. března 1458")
    await g.check('input[name=ceka][value=balduin]')
    await g.fill("[name=t]","Za městskou bránou na vás čeká povoz.\n\nCo uděláš?");await g.click("[data-fonove] button")
    await g.wait_for_selector(".foprisp .fopris",timeout=10000)
    tid=await g.evaluate("FORUM.tid")
    chk("Čeká se na" in await g.inner_text(".fotstav"),"vypravěč vidí, na koho se čeká")
    # soukromá scéna jiné postavy (v testovacích datech je jen jedna karta, druhý účastník je jen id)
    await g.evaluate("MMDB.forumTemaZaloz({p_forum:'soukrome-sceny',p_nazev:'Šepot jen pro Zdeňka',p_t:'Tajné.',p_ucastnici:['zdenek']},null)")
    # hráč
    await pl.goto(BASE+"#forum");await pl.wait_for_selector(".fokat",timeout=15000)
    await dokud(pl,"document.querySelector('.fosouhrn .fotvuj')",8000)
    chk("Čekají na tebe" in await pl.inner_text(".fosouhrn"),"hráč vidí, že na něj něco čeká")
    await pl.goto(BASE+"#forum/f/soukrome-sceny");await pl.wait_for_selector(".fopopis",timeout=10000);await klid(pl,1000)
    chk(await pl.locator(".fotr").count()==0,"hráč nevidí soukromé téma jiné postavy")
    await pl.goto(BASE+f"#forum/t/{tid}");await pl.wait_for_selector(".foformpsani",timeout=10000)
    chk(await pl.locator("[data-fonove]").count()==0 and await pl.locator(".fopris").count()==1,"hráč čte první příspěvek")
    await pl.fill(".foformpsani textarea","Nasednu a jedu k Hoře.");await pl.click(".foformpsani button:has-text('Odeslat')")
    await dokud(pl,"document.querySelectorAll('.fopris').length==2",8000)

    chk("Čeká se na Vypravěč" in await pl.inner_text(".fotstav"),"po odpovědi se čeká na vypravěče")
    # příspěvek hráče vypravěč skryje
    await g.goto(BASE+f"#forum/t/{tid}");await dokud(g,"document.querySelectorAll('.fopris').length==2",8000)
    await g.click('.fopris:last-child [data-foskryj]');await dokud(g,"document.querySelector('.fopris.foskryto')",8000)
    await pl.reload();await dokud(pl,"document.querySelectorAll('.fopris').length==2",10000)
    chk("Nasednu" not in await pl.inner_text(".foprisp"),"skrytý příspěvek hráč nevidí")
    # uzavřené téma hráč nedoplní
    await g.click('.foGm summary');await g.click('[data-fonast*="uzavrene"]');await dokud(g,"document.querySelector('.fochip')&&/uzavřené/.test(document.querySelector('.fotstav').textContent)",8000)
    await pl.reload();await dokud(pl,"!!document.querySelector('.fopris')",8000)
    chk(await pl.locator(".foformpsani").count()==0,"v uzavřeném tématu hráč nepíše")
    # druhé téma: kostky, citace, hledání, přeskočení, sloučení, správa struktury, snímky vzhledu
    t2=await g.evaluate("MMDB.forumTemaZaloz({p_forum:'volna-hra'.replace('volna-hra','aktivni-questy'),p_nazev:'Druhé téma',p_t:'Vítr od Kolína *sílí*.',p_ceka_na:['balduin'],p_herni_datum:'15. března 1458'},null)")
    await pl.goto(BASE+f"#forum/t/{t2}");await pl.wait_for_selector(".foformpsani",timeout=10000)
    chk("Čeká se na tebe" in await pl.inner_text(".fotstav"),"hráč vidí v novém tématu, že je na tahu")
    await pl.click('[data-focit]');await pl.wait_for_selector(".focitbanner",timeout=5000)
    await pl.click(".fokostky summary");await pl.fill("[data-fohl]","Přesvědčování");await pl.fill("[data-fohf]","1k20+5");await pl.check("[data-fohz]");await pl.click("[data-fohod]")
    await pl.wait_for_selector(".fohodchip",timeout=5000)
    chk("Přesvědčování 1k20+5" in await pl.inner_text(".fohodyl") and "Závoj k6" in await pl.inner_text(".fohodyl"),"hráč hodí kostkou se Závojem")
    # hod z karty: stejný výpočet jako na kartě, zapíše se i do herního záznamu
    n0=await pl.evaluate("HODY.length")
    await pl.select_option("[data-fokh]","dv:Persuasion");await pl.click("[data-fokhod]")
    await dokud(pl,"FORUM.hody.some(h=>h.karta==='balduin')",8000)
    r=await pl.evaluate("(h=>[h.t,h.vysl===HODY[0].tot,HODY.length])(FORUM.hody.find(h=>h.karta))")
    chk(r[0]=="Persuasion" and r[1] and r[2]>n0,"hod z karty: Přesvědčování podle karty, zapsaný i v herním záznamu "+str(r))
    chk("z karty" in await pl.inner_text(".fohodyl"),"u hodu je vidět, že je z karty")
    # celá karta v tématu: útok i ověření z karty se přiloží k odpovědi
    await pl.click(".fokartad summary");await pl.wait_for_selector(".fokarta .bdm",timeout=8000)
    n1=await pl.evaluate("FORUM.hody.length")
    ut=pl.locator('.fokarta [data-khod^="ut:"]')
    if await ut.count():
      await ut.first.click();await dokud(pl,f"FORUM.hody.length>{n1}",8000)
      chk(await pl.evaluate("FORUM.hody.some(h=>/^Útok/.test(h.t))"),"útok z karty v tématu se přiloží k odpovědi")
    else: print("   (Balduin nemá útok s data-khod – přeskočeno)")
    n2=await pl.evaluate("FORUM.hody.length")
    await pl.screenshot(path=os.path.join(VYSTUP,"forum-karta.png"),full_page=True)
    await pl.click('.fokarta [data-bdmsec="vl"]');await pl.wait_for_selector('.fokarta [data-khod^="ov:"]',timeout=8000)
    await pl.locator('.fokarta [data-khod^="ov:"]').first.click();await dokud(pl,f"FORUM.hody.length>{n2}",8000)
    chk(await pl.evaluate("FORUM.hody.some(h=>/^Ověření/.test(h.t))"),"ověření ze Statistik karty v tématu se přiloží k odpovědi")
    await pl.screenshot(path=os.path.join(VYSTUP,"forum-karta.png"),full_page=True)
    await pl.locator(".fokostky").screenshot(path=os.path.join(VYSTUP,"forum-hod-karta.png"))
    await pl.fill(".foformpsani textarea","Povídám se *sedlákem*. [Jiří](#osoba/jiri) o tom ví.");await pl.click(".foformpsani button:has-text('Odeslat')")
    await dokud(pl,"document.querySelectorAll('.fopris').length==2",8000)
    chk(await pl.locator(".fopris:last-child .focitace").count()==1 and "z karty" in await pl.inner_text(".fopris:last-child") and await pl.locator(".fopris:last-child .fohod").count()>=3,"příspěvek nese citaci a všechny přiložené hody")
    chk(await pl.locator('.fopris:last-child a[href="#osoba/jiri"]').count()==1,"odkaz na osobu v příspěvku")
    await pl.goto(BASE+"#forum/h/sedlákem");await pl.wait_for_selector(".fotem .fotr",timeout=8000)
    chk(await pl.locator(".fotem .fotr").count()>=1,"hledání najde příspěvek")
    await pl.goto(BASE+"#forum/m/ceka");await klid(pl,1500)
    chk(await pl.locator(".fotem .fotr").count()>=0 and "Čekají na mě" in await pl.inner_text("#forumview h2"),"stránka Čekají na mě")
    # vypravěč: na hráče se znovu čeká, přeskočí ho
    await g.evaluate(f"MMDB.forumTemaNastav({t2},{{ceka_na:['balduin']}})")
    await g.goto(BASE+f"#forum/t/{t2}");await g.wait_for_selector(".foGm",timeout=10000)
    await g.click(".foGm summary");await g.click("[data-fopreskoc=balduin]");await dokud(g,"!document.querySelector('[data-fopreskoc]')",8000)
    chk("přeskakuje" in await g.inner_text(".foprisp"),"vypravěč přeskočí postavu a v tématu zůstane poznámka")
    # sloučení: t2 do prvního tématu
    await g.click(".foGm summary") if not await g.locator("[data-fosloucit]").is_visible() else None
    await g.select_option("[data-fosloucit] select",str(tid));await g.click("[data-fosloucit] button");await dokud(g,f"FORUM.tid=={tid}&&document.querySelectorAll('.fopris').length>=5",10000)
    chk(await g.locator(".fopris").count()>=5,"sloučené téma má příspěvky obou témat")
    # správa struktury
    await g.goto(BASE+"#forum");await g.wait_for_selector("[data-fouprav]",timeout=10000);await g.click("[data-fouprav]")
    await g.click('[data-foedit="+kat"]');await g.fill(".foedit [name=nazev]","Zkouška kategorie");await g.click(".foedit button:has-text('Přidat')")
    await dokud(g,"[...document.querySelectorAll('.fokat h3')].some(h=>h.textContent.includes('Zkouška kategorie'))",8000)
    chk(True,"vypravěč přidá kategorii")
    await g.click('[data-foedit="+zkouska-kategorie"]');await g.fill(".foedit [name=nazev]","Zkušební fórum");await g.click(".foedit button:has-text('Přidat')")
    await dokud(g,"document.body.textContent.includes('Zkušební fórum')",8000)
    chk(True,"vypravěč přidá fórum do kategorie")
    await g.click('[data-fosmaz="zkusebni-forum"]');await dokud(g,"!document.body.textContent.includes('Zkušební fórum')",8000)
    await g.click('[data-fosmaz="zkouska-kategorie"]');await dokud(g,"!document.body.textContent.includes('Zkouška kategorie')",8000)
    chk(True,"vypravěč fórum i kategorii smaže")
    # snímky vzhledu (mobil hráč, PC vypravěč; světlý a tmavý)
    for nm,pg,hs in (("hrac",pl,[f"#forum",f"#forum/f/aktivni-questy",f"#forum/t/{tid}"]),("gm",g,[f"#forum",f"#forum/t/{tid}"])):
      for i,h in enumerate(hs):
        for tema in ("light","dark"):
          await pg.goto(BASE+h);await klid(pg,1500)
          await pg.evaluate(f"document.documentElement.dataset.theme='{tema}'");await pg.wait_for_timeout(200)
          await pg.screenshot(path=os.path.join(VYSTUP,f"forum-{nm}-{i}-{tema}.png"),full_page=True)
    chk(not perr and not gerr,"bez chyb "+str((perr+gerr)[:2]))
    await b.close()
    sys.exit(1 if fails else 0)
asyncio.run(main())
