# Projde všechny stránky webu (odkaz po odkazu) a hlásí chyby JS, rozbité obrázky, prázdné stránky a přetečení.
# Použití: python3 prochazka.py ADRESA   (s proměnnou RELACE=soubor.json jako přihlášený vypravěč)
import asyncio,sys,json
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else "http://localhost:8765/"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={"width":1300,"height":1000})
    import os
    if os.environ.get("RELACE"): await pg.add_init_script("localStorage.setItem(\"mm-gm-relace\",JSON.stringify("+open(os.environ["RELACE"]).read()+"))")
    errs=[];bad=[]
    pg.on("pageerror",lambda e:errs.append(("pageerror",pg.url,str(e)[:200])))
    pg.on("console",lambda m:m.type=="error" and "TUNNEL" not in m.text and errs.append(("console",pg.url,m.text[:200])))
    pg.on("requestfailed",lambda r:"fonts.g" not in r.url and bad.append((r.url,r.failure)))
    pg.on("response",lambda r:r.status>=400 and bad.append((r.url,r.status)))
    await pg.goto(BASE);await pg.wait_for_timeout(1500)
    seen=set();queue=["#uvod","#artikule","#draconomicon","#druzina","#kronika","#mapa","#praha","#svet","#desky","#desky/osoby","#desky/sousede","#desky/vazby","#draconomicon/plemena"]
    issues=[]
    while queue and len(seen)<700:
      h=queue.pop(0)
      if h in seen:continue
      seen.add(h)
      await pg.evaluate(f"location.hash={json.dumps(h)}");await pg.wait_for_timeout(250)
      r=await pg.evaluate("""()=>{const v=document.querySelector('.view:not([hidden])');
        const links=[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.offsetParent).map(a=>a.getAttribute('href'));
        const imgs=[...document.querySelectorAll('.view:not([hidden]) img')].filter(i=>i.complete&&i.naturalWidth===0&&i.offsetParent).map(i=>i.getAttribute('src'));
        const txt=v?v.innerText.trim().length:0;
        return {view:v&&v.dataset.view,links,imgs,txt,ovf:document.documentElement.scrollWidth>innerWidth+2}}""")
      exp=h[1:].split('/')[0]; exp={'rod':'desky','osoba':'desky'}.get(exp,exp)
      # hráčská Hra je od 2026-10-22 uvnitř stránka Boj (karta a boj na jedné stránce)
      if r['view']!=exp and not (exp=='hra' and r['view']=='boj'): issues.append((h,'view',r['view']))
      if r['imgs']: issues.append((h,'img',r['imgs']))
      if r['txt']<40: issues.append((h,'empty',r['txt']))
      if r['ovf']: issues.append((h,'overflow'))
      for l in r['links']:
        if l not in seen and l not in queue and l!='#': queue.append(l)
    print("stránek",len(seen));print("PROBLÉMY",issues[:60]);print("CHYBY",errs[:30]);print("NEDOSTUPNÉ",list(set(map(str,bad)))[:30])
    global VYSL
    VYSL=bool(issues or errs or bad)
    await b.close()
VYSL=True
asyncio.run(main())
sys.exit(1 if VYSL else 0)
