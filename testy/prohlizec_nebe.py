"""Nebeské bojiště (statická vypravěčská verze, bez databáze): kolo vzdušného boje od uzamčení manévru nepřítele přes poradu
s náhledem dráhy a změnou výšky, odhalení a Závoj u červeného manévru až po konec kola; hráč na #nebe nesmí (zatím jen vypravěč).
Pravidla (karta draka, šablony, střet, Napětí) testuje testy/jednotky/nebe.test.mjs.
Spouští testy/spustit.sh: MM_GMWEB = vypravěčská statická verze, MM_HRWEB = hráčská statická verze."""
import asyncio, os
from playwright.async_api import async_playwright

GM = os.environ.get("MM_GMWEB", "http://127.0.0.1:18793/")
HR = os.environ.get("MM_HRWEB", "http://127.0.0.1:18794/")
fails = []


def chk(c, m):
    print(("OK  " if c else "FAIL"), m)
    if not c:
        fails.append(m)


FAZE = "document.querySelector('.nbfaze h3') && document.querySelector('.nbfaze h3').textContent"


async def rozkaz(g, r):
    await g.click(f"#nbpanel > table.nbcis button[data-nbr='{r}']")


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        g = await ctx.new_page()
        chyby = []
        g.on("pageerror", lambda e: chyby.append(str(e)))
        await g.goto(GM + "#nebe")
        await g.wait_for_selector("#nbview .nbsvg")
        chk(await g.locator(".nbdrak").count() == 2, "deska: soumračník a korutanský lindwurm")
        await g.click('[data-nb="start"]')
        await g.wait_for_function(f"{FAZE} === 'Uzamčení manévrů nepřátel'")
        await rozkaz(g, '{"m":"rovne","r":3}')
        await g.click('[data-nb="vyska"][data-nbo="1"]')
        chk("stoupá o 1" in await g.inner_text(".nbzvol"), "jednoduchý manévr smí změnit výšku o 1")
        chk(await g.locator(".nbdraha").count() == 0, "manévr nepřítele se na sdílené obrazovce nekreslí")
        await g.click('[data-nb="zamkni"]')
        await g.wait_for_selector("#nbhodiny")
        chk((await g.inner_text("#nbhodiny")).endswith("s"), "porada: běží přesýpací hodiny")
        await rozkaz(g, '{"m":"zvrat","r":3}')
        chk(await g.locator(".nbdraha").count() == 1, "porada: náhled dráhy draka družiny")
        await g.click('[data-nb="potvrd"]')
        await g.wait_for_function(f"{FAZE} === 'Odhalení'")
        chk(await g.locator('[data-nb="let"][disabled]').count() == 1, "červený manévr: nejdřív Závoj")
        await g.click('[data-nb="zavoj"][data-nbo="5"]')
        await g.click('[data-nb="let"]')
        await g.wait_for_function(f"{FAZE} === 'Konec kola'", timeout=10000)
        chk("kousnutí a drápy" in await g.inner_text(".nbutoky"), "konec kola: útoky draků z konečných pozic")
        stav = await g.evaluate("JSON.parse(localStorage.getItem('mm-nebe'))")
        s = next(d for d in stav["draci"] if d["id"] == "s")
        chk(s["u"] == 180 and s["nap"] == 0, "Zvrat otočil draka o 180°, Požehnání = bez Napětí")
        await g.click('[data-nb="dalsi"]')
        await g.wait_for_function(f"{FAZE} === 'Uzamčení manévrů nepřátel'")
        chk("Kolo 2" in await g.inner_text(".nbfaze"), "další kolo")
        chk(not chyby, "bez chyb stránky: " + "; ".join(chyby[:3]))
        h = await ctx.new_page()
        await h.goto(HR + "#nebe")
        await h.wait_for_selector('[data-view="uvod"]:not([hidden])', timeout=15000)
        chk(await h.locator("#nbview .nbsvg").count() == 0, "hráč na #nebe bojiště nevidí")
        await b.close()


asyncio.run(main())
if fails:
    raise SystemExit("\n".join(["FAIL " + f for f in fails]))
