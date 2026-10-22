"""Puls v testech: místo čekání na další tik (2,5–6 s) se stránka zeptá hned. Používají testy boje, tahu a karty."""
async def puls(pg,od=None):
    """Stránka `pg` se hned zeptá pulsem, co se změnilo (jako by právě přišel jeho tik) – místo čekání 2,5–6 s na další tik.
    `od` = stránka, jejíž zápis má dorazit: nejdřív se počká, až ho dokončí (zápis hráče BOJ.zapis, fronta uložení boje BZ, fronta telefonu BFR,
    rozpracované uložení karty KPEND). Zkracuje testy o minuty (2026-10-22)."""
    if od is not None:
        await od.wait_for_function("(typeof BOJ==='undefined'||!BOJ.zapis)&&(typeof BZ==='undefined'||(!BZ.beh&&!BZ.q.length))&&(typeof BFR==='undefined'||!BFR.delka())&&(typeof KPEND==='undefined'||Object.values(KPEND).every(p=>!Object.keys(p).length))",timeout=15000)
        await od.wait_for_timeout(100)
    await pg.evaluate("async()=>{for(let i=0;i<400&&typeof PULS!=='undefined'&&PULS.beh;i++)await new Promise(r=>setTimeout(r,25));if(typeof pulsKrok==='function')await pulsKrok()}")
    await pg.wait_for_timeout(300)
