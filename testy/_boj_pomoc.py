"""Společné kusy testů Boje: přihlášení vypravěče, klepání přes záložky a zavřené <details>, příprava boje."""
import asyncio, json, os, urllib.request
from playwright.async_api import async_playwright, Page
U=os.environ.get("MM_SB","http://localhost:54321");K="sb_publishable_test";BASE=os.environ.get("MM_WEB","http://localhost:8765/")
VYSTUP=os.environ.get("MM_VYSTUP","/tmp")
def tok():
    r=urllib.request.Request(U+"/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    return json.loads(urllib.request.urlopen(r).read())
def anon_rpc(fn,body):
    r=urllib.request.Request(U+"/rest/v1/rpc/"+fn,data=json.dumps(body).encode(),headers={"apikey":K,"Content-Type":"application/json"},method="POST")
    try: return 200,urllib.request.urlopen(r).read().decode()
    except urllib.error.HTTPError as e: return e.code,e.read().decode()[:120]
# Boj má záložky Karta · Nepřátelé · Družina a sbalené <details>: před klepnutím na prvek ve skryté záložce nebo v zavřeném
# <details> test záložku přepne a details otevře (jako hráč prstem) – 2026-10-20 i details, test dřív padal po obnovení stránky
_ZAL="""s=>{let e;try{e=document.querySelector(s)}catch(x){return}if(!e)return;let d=e.parentElement;while(d){if(d.tagName==='DETAILS'&&!d.open&&!(e.tagName==='SUMMARY'&&e.parentElement===d))d.open=true;d=d.parentElement}if(e.offsetParent)return;const c=e.closest('[data-bcol]'),r=c&&c.closest('.bojakt');if(!r)return;const t=r.querySelector('.btabs button[data-btab="'+c.dataset.bcol+'"]');if(t&&t.offsetParent)t.click()}"""
def _sezal(f):
    async def w(self,sel,*a,**k):
        try: await self.evaluate(_ZAL,sel)
        except Exception: pass
        return await f(self,sel,*a,**k)
    return w
for _m in ("click","fill","select_option","press","check","hover"): setattr(Page,_m,_sezal(getattr(Page,_m)))
fails=[]
def chk(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
rel=tok()
async def gm_strana(b):
    """Stránka Boj přihlášeného vypravěče; běžící boj ukončí."""
    g=await b.new_page(viewport={"width":1300,"height":1000});gerr=[];g.on("pageerror",lambda e:gerr.append(str(e)[:200]))
    g.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await g.add_init_script("localStorage.setItem('mm-gm-relace',JSON.stringify("+json.dumps({"at":rel["access_token"],"rt":rel["refresh_token"],"exp":rel["expires_at"],"email":"gm@x.cz"})+"))")
    await g.goto(BASE+"#boj");await g.wait_for_function("!document.documentElement.classList.contains('mmload')");await g.wait_for_timeout(500)
    if await g.locator("[data-bact=konec]").count():
        await g.click("[data-bact=konec]");await g.wait_for_timeout(800)
        if await g.locator('[data-bkon="ok"]').count():  # se statblocky se nejdřív ukáže shrnutí boje
            await g.click('[data-bkon="ok"]');await g.wait_for_timeout(800)
    return g,gerr
async def priprava(g,jmena,hody,dm,npc=(),spoj=()):
    """Příprava boje na stránce Boj: postavy s hody, nepřátelé a spojenci přes formuláře, hod nepřátel, Začít boj."""
    await g.wait_for_selector(".bprip")
    await g.evaluate("bojZmen(z=>{z.hraci="+json.dumps([{"id":"h"+str(i+1),"n":"","hod":None} for i in range(len(jmena))])+";z.npc=[];z.nid=0;z.dm=null;delete z.ticha})")
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
