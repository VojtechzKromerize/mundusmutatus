# Proklikání celé hráčské karty jako hráč přihlášený přes Discord (jako na ostrém webu): každá záložka, každé tlačítko,
# zaškrtávátko a nabídka na kartě postavy i na bojové kartě v Boji. Hlídá chyby JavaScriptu, odmítnuté zápisy do databáze
# (HTTP 4xx/5xx, hláška „Nepodařilo se…“) a nakonec porovná stav karty v prohlížeči se stavem v databázi – pole, které
# databáze nepřijala, by se jinak tiše vrátilo.
import asyncio, json, os, urllib.request
from playwright.async_api import async_playwright
from _klid import klid  # čekání na klid stránky místo pevných ms (testy/_klid.py)
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
fails=[];POSL=[""]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
def login(email):
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":email,"password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def stav(i="balduin"):
    r=urllib.request.Request(U+f"/rest/v1/karty?id=eq.{i}&select=stav",headers={"apikey":K})
    j=json.loads(urllib.request.urlopen(r).read());return j[0]["stav"] if j else {}
# co se neklikne: mazání, tisk a stažení souborů, nahrání obrázku/PDF, odhlášení, obnova z historie, odchod ze stránky
SKIP=["data-ksmaz","data-ktisk","data-kexport","data-kimg","data-discordx","data-khist","data-kimgx","data-jaheslo","data-kimphra",
      "data-kimpja","data-instal","data-pushon","data-pushoff","data-kpdf","data-kuplpdf","data-mmpopx","data-jaodhlas","data-notif"]
JS_KLIK="""(a)=>{const [root,skip]=a;const R=document.querySelector(root);if(!R)return [];
  const ok=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&!e.closest('[hidden]')&&!skip.some(s=>e.hasAttribute(s)||e.closest('['+s+']'))&&e.tagName!=='A'};
  return [...R.querySelectorAll('button,summary,input[type=checkbox],input[type=radio],select,[role=tab],a[href]')].filter(ok).map((e,i)=>{e.dataset.__k=String(i);return i})}"""
async def proklikej(pg,root,popis,hl,limit=260):
    """Projde všechny ovládací prvky v kořeni; po každém kliknutí znovu načte seznam (karta se překresluje)."""
    hotovo=set();kliky=0;adresa=await pg.evaluate("location.hash")
    for _ in range(limit):
        if await pg.evaluate("location.hash")!=adresa:
            await pg.evaluate(f"location.hash={json.dumps(adresa)}");await klid(pg,600)
        ids=await pg.evaluate(JS_KLIK,[root,SKIP])
        sig=await pg.evaluate("""(r)=>[...document.querySelectorAll(r+' [data-__k]')].map(e=>e.tagName+'|'+[...e.attributes].filter(a=>a.name.startsWith('data-')&&a.name!=='data-__k').map(a=>a.name+'='+a.value).join(',')+'|'+(e.textContent||'').trim().slice(0,30))""",root)
        dalsi=[i for i,sg in zip(ids,sig) if sg not in hotovo]
        if not dalsi: break
        i=dalsi[0];hotovo.add(sig[ids.index(i)]);POSL[0]=popis+" › "+sig[ids.index(i)]
        el=pg.locator(f'{root} [data-__k="{i}"]').first
        try:
            tag=await el.evaluate("e=>e.tagName+(e.type?':'+e.type:'')")
            if tag.startswith("SELECT"):
                n=await el.evaluate("e=>e.options.length")
                if n>1: await el.select_option(index=1)
            else:
                await el.evaluate("e=>e.click()")  # klik přímo (lepkavé lišty a plovoucí panely by běžné kliknutí zdržovaly)
            kliky+=1
        except Exception as ex:
            pass
        await pg.wait_for_timeout(220)
        await pg.evaluate("mmPopX&&mmPopX();document.querySelectorAll('details.kdbmenu[open]').forEach(d=>d.open=false);if(typeof BDM!=='undefined'&&BDM.sheet){BDM.sheet=null;if(curView==='boj')renderBoj();else if(typeof bdmPrekresli==='function')bdmPrekresli()}")
        await pg.keyboard.press("Escape")
    print(f"  {popis}: proklikáno {kliky} prvků")
    return kliky
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    # vypravěč připraví boj s Balduinem
    gt=login("gm@x.cz");g=await b.new_page(viewport={"width":1300,"height":1000});g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":gt["access_token"],"rt":gt["refresh_token"],"exp":gt["expires_at"],"email":"gm@x.cz"})+"))")
    # testovací účet hráče může mít postavu z předchozího testu (prohlizec_karta) – vypravěč ho uvolní
    await g.goto(BASE+"#hra");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await klid(g,800)
    await g.evaluate("Promise.all(['testovnik','balduin'].map(k=>MMDB.jaUvolni(k).catch(()=>{}).then(()=>MMDB.hracZrus(k).catch(()=>{}))))")
    # hráč přes Discord (účet hrac@x.cz) si zvolí Balduina
    ht=login("hrac@x.cz")
    cx=await b.new_context(viewport={"width":390,"height":844});pl=await cx.new_page()
    err=[];bad=[]
    pl.on("pageerror",lambda e:err.append("JS: "+str(e)[:160]+" ← po kliknutí na: "+POSL[0][:140]+" @ "+(getattr(e,"stack","") or "").split("\n")[1:2][0][:120] if (getattr(e,"stack","") or "").count("\n") else "JS: "+str(e)[:160]+" ← "+POSL[0][:140]))
    pl.on("console",lambda m:m.type=="error" and "Failed to load resource" not in m.text and "is not focusable" not in m.text and err.append("konzole: "+m.text[:200]))
    def resp(r):
        if r.status>=400 and "/rest/v1/" in r.url and "/rpc/mm_ja" not in r.url: bad.append(f"{r.status} {r.url.split('/rest/v1/')[1][:80]}")
    pl.on("response",resp)
    pl.on("dialog",lambda d:asyncio.ensure_future(d.accept(d.default_value or "1") if d.type=="prompt" else d.accept()))
    await pl.add_init_script("localStorage.setItem('mm-hrac-relace',JSON.stringify("+json.dumps({"at":ht["access_token"],"rt":ht["refresh_token"],"exp":ht["expires_at"]})+"));localStorage.setItem('mm-navod','1')")
    await pl.goto(BASE+"#hra");await pl.wait_for_function("!document.documentElement.classList.contains('mmload')");await klid(pl,2500)
    r=await pl.evaluate("MMDB.jaKarta('balduin','Hráč').then(()=>'ok',e=>e.message)")
    chk(r=="ok",f"hráč přes Discord si zvolí Balduina ({r})")
    await pl.evaluate("JA.set({k:'balduin',n:'Balduin',d:1});KZAM.add('balduin')")
    await pl.evaluate("window.__hl=[];const o=window.mmHlas;window.mmHlas=(t,ms)=>{window.__hl.push(String(t));return o&&o(t,ms)}")
    await pl.goto(BASE+"#karty/balduin");await pl.wait_for_selector(".bdm",timeout=15000);await klid(pl,1500)
    await pl.evaluate("window.__hl=window.__hl||[];if(!window.__mmw){window.__mmw=1;const o=window.mmHlas;window.mmHlas=(t,ms)=>{window.__hl.push(String(t));return o&&o(t,ms)}}")
    chk(await pl.evaluate("!document.querySelector('.bdm.kro')"),"hráč může svou kartu upravovat")
    # karta postavy: každá záložka a v ní všechno
    tabs=await pl.evaluate("[...document.querySelectorAll('.bdm .bdmtabs [data-bdmsec]')].map(t=>t.dataset.bdmsec)")
    for t in tabs:
        await pl.evaluate("typeof mmPopX==='function'&&mmPopX()")  # ukázka od vypravěče z předchozího testu
        await pl.click(f'.bdm .bdmtabs [data-bdmsec="{t}"]');await klid(pl,500)
        await proklikej(pl,".bdm",f"karta – záložka {t}",None)
        await pl.click(f'.bdm .bdmtabs [data-bdmsec="{t}"]') if await pl.locator(f'.bdm .bdmtabs [data-bdmsec="{t}"]').count() else None
    # úpravy a postup na úroveň
    await pl.click('.bdm [data-bdmsh="sprava"]');await klid(pl,300)
    if await pl.locator(".bdmlist [data-kuprt]").count():
        await pl.click(".bdmlist [data-kuprt]");await klid(pl,400);await proklikej(pl,".bdm",f"karta – úpravy",None,120)
    await pl.evaluate("KLVUP.balduin={};srdUrovne().then(()=>kartyPrekresli())");await klid(pl,800);await proklikej(pl,".klvup","postup na úroveň",None,40)
    await klid(pl,3500)
    # bojová karta v Boji
    await g.goto(BASE+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await klid(g,800)
    await g.evaluate("bojZmen(z=>{Object.keys(z).forEach(k=>delete z[k]);z.hraci=[{id:'h1',n:'Balduin',k:'balduin',hod:15}];z.npc=[];z.nid=0;z.dm=10})");await klid(g,800)
    await g.evaluate("bojZmen(z=>{z.aktivni=true;z.hod=15;Object.assign(z,{kolo:1,tah:0,obsazeni:{}})})");await klid(g,1500)
    await g.evaluate("bojZmen(z=>{z.sloty=bojSloty(z);const i=z.sloty.findIndex(x=>x.t!=='n');z.tah=Math.max(0,i);z.obsazeni[z.tah]='h1'})");await klid(g,1500)
    await pl.goto(BASE+"#boj");await klid(pl,2500);await pl.evaluate("bojJa.set('Balduin');renderBoj()");await klid(pl,1500)
    print("  boj u hráče:",await pl.evaluate("JSON.stringify([!!(BOJ.s&&BOJ.s.aktivni),document.querySelectorAll('.bdm').length,document.querySelectorAll('.bdm button').length,bojJa.get()])"))
    await pl.screenshot(path=os.path.join(VYSTUP,"karta-vse-boj.png"))
    if await pl.locator(".bdm").count():
        btabs=await pl.evaluate("[...document.querySelectorAll('.bdm [data-bdmtab],.bdm [role=tab]')].map((t,i)=>i)")
        await proklikej(pl,".bdm","bojová karta",None,260)
    else: chk(False,"hráč má v Boji bojovou kartu")
    await klid(pl,4000)
    # vyhodnocení
    hl=[h for h in await pl.evaluate("window.__hl||[]") if "Nepodařilo" in h or "neplatn" in h.lower() or "chyb" in h.lower()]
    chk(not err,f"bez chyb JavaScriptu: {err[:6]}")
    chk(not bad,f"databáze nic neodmítla: {sorted(set(bad))[:8]}")
    chk(not hl,f"žádná hláška o neuložení: {hl[:6]}")
    await pl.goto(BASE+"#karty/balduin");await klid(pl,3000)
    loc=await pl.evaluate("JSON.stringify(kartaStav('balduin'))");loc=json.loads(loc);db=stav()
    rozdil=sorted(k for k in set(loc)|set(db) if k!="mods" and json.dumps(loc.get(k),sort_keys=True)!=json.dumps(db.get(k),sort_keys=True))
    chk(not rozdil,f"stav karty v prohlížeči = stav v databázi (rozdíly: {rozdil} {[ (k,loc.get(k),db.get(k)) for k in rozdil][:3]})")
    await pl.screenshot(path=os.path.join(VYSTUP,"karta-vse.png"),full_page=False)
    await b.close()
asyncio.run(main())
print("VŠE OK" if not fails else f"CHYBY: {fails}")
raise SystemExit(1 if fails else 0)
