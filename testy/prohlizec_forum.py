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
    await pl.fill(".foformpsani textarea","Nasednu a jedu k Hoře.");await pl.click(".foformpsani button")
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
    chk(not perr and not gerr,"bez chyb "+str((perr+gerr)[:2]))
    await b.close()
    sys.exit(1 if fails else 0)
asyncio.run(main())
