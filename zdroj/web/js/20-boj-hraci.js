/* ===== útoky postav z telefonu, zbraně postav, veřejný záznam pro hráče, statistika, filtr a Zpět v záznamu (2026-10-16) ===== */
const BZTYPY=["Slashing","Piercing","Bludgeoning","Fire","Cold","Lightning","Thunder","Acid","Poison","Necrotic","Radiant","Psychic","Force"];
const bojZrCz=t=>String(t||"").replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,m=>BZRT[m]||m);
/* útoky hráčů: vypravěč je nechá zapsat rovnou (výchozí), nebo každý potvrdí */
const bojAuto={get(){return typeof potvrz==="function"?potvrz().rezim==="nic":true},_get(){try{return localStorage.getItem("mm-boj-auto")!=="0"}catch(e){return true}},set(v){try{localStorage.setItem("mm-boj-auto",v?"1":"0")}catch(e){}}};
/* zbraně postavy (ukládají se k jménu postavy a přežijí do dalšího boje) */
const bojZbrH=(s,h)=>((s&&s.zbrane)||{})[h&&h.n]||[];
const bojKonDC=d=>Math.min(30,Math.max(10,Math.floor((+d||0)/2)));
/* veřejný záznam: kdo, komu, čím, výsledek; zranění jen u zásahů postav a spojenců, nikdy životy a AC nepřátel */
const BZAZQ=[];
function bojZaz(e){if(!GMV||!bojDB||!(BOJ.s&&BOJ.s.aktivni))return;e.k=BOJ.s.kolo||1;e.ts=Date.now();BZAZQ.push(e);clearTimeout(bojZaz.t);
  bojZaz.t=setTimeout(()=>{const q=BZAZQ.splice(0);if(q.length)bojZmen(z=>{z.zaz=[...q.reverse(),...(z.zaz||[])].slice(0,40)},true)},120)}
const bojVerej=(s,id)=>{const c=bojCilO(s,id);return !!c&&(!c.druh||bojSpoj(c))};
/* životy nepřítele (místní paměť vypravěče): odečte a vrátí podklad pro Zpět */
function bojHpUber(id,k,x){const n=((BOJ.s&&BOJ.s.npc)||[]).find(q=>q.id===id),E=n&&bojEff(n);if(!E||!E.hp.length)return null;const hp=bojHp.get(),a=hp[id]||[],old=a[k]!=null?a[k]:E.hp[k].max;
  a[k]=old-x;hp[id]=a;bojHp.set(hp);bojHpZmena(id,k,old,old-x);return {id,k,old,nov:old-x}}
/* záchrany houfu po jednom pacholkovi: každý svůj hod, padne, komu zbude aspoň 1 zranění */
function bojHoufZachrany(n,E,dmg,t,ab,dc,pol,kolik,kouzlo){const b=bojSaveB(E&&E.p,ab),v=Math.max(0,Math.min(n.pocet||0,kolik==null?n.pocet||0:kolik)),h=[];let pad=0;
  for(let i=0;i<v;i++){const Z=bojNpcZach(n,E,ab,dc,kouzlo),d=Z.d,ok=Z.ok,base=ok?(pol?Math.floor(dmg/2):0):dmg,x=E?bojZasah(E,base,t,{}).x:base;if(x>=1)pad++;h.push(Z.fail?"✗":`${Z.t}${ok?"✓":"✗"}`)}
  return {pad,v,txt:`${ab} ${bsg(b)}: ${h.join(" ")}`}}
/* vyhodnocení útoku hráče proti nepřátelům (u vypravěče – zná AC a odolnosti) */
/* účinek kouzla bez hodu (Hex, Hunter's Mark…) posílá hráč jako „útok“ s názvem „Účinek: …“ – vypravěč ho potvrdí a nepřítel dostane značku
   (ne ✦ – ten build z hráčské verze odstraňuje) */
const BUEF="Účinek: ",bojUtEf=u=>String((u&&u.cim)||"").startsWith(BUEF)?u.cim.slice(BUEF.length).trim():null;
/* značka účinku kouzla na nepříteli (trvání z kouzla v kolech; soustředěné kouzlo drží sesilatel) */
function bojEfZnac(z,n,sp,u){const nm=String(sp||"").replace(/\s*\(\d+\. st\.\)\s*$/,"").trim();
  /* Dispel Magic: kouzla na cíli končí (účinky se zdrojem nebo pojmenované kouzlem) */
  if(nm==="Dispel Magic"){const L=(n.ef||[]).filter(e=>e.src||(typeof kSp==="function"&&KSPD&&kSp(String(e.n).replace(/^Účinek:\s*/,""))));L.forEach(e=>bojEfDel(n,e));bojMsg(n.id,L.length?`Dispel Magic: končí ${[...new Set(L.map(e=>e.n))].join(", ")}.`:"Dispel Magic: na cíli není žádné kouzlo.");return true}
  return bojEfZnac0(z,n,sp,u,nm)}
function bojEfZnac0(z,n,sp,u,nm){const d=typeof kSp==="function"&&KSPD?kSp(nm):null,hh=d?kTrv(d.d):null;if(!hh)return false;
  const h=(z.hraci||[]).find(x=>x.id===u.h),ef={n:d.en||nm,kdy:"kola",k:Math.max(1,Math.round(hh*600)),kolo:z.kolo||1,tah:z.tah||0};if(u.h)ef.od=u.h;if(d.ko&&h&&(h.stav||[]).includes("soustředí"))ef.src=u.h;
  (n.ef||[]).filter(e=>e.n===ef.n&&!e.st).forEach(e=>bojEfDel(n,e));(n.ef=n.ef||[]).push(ef);return true}
/* vyhodnocení útoku hráče se hází jen jednou (2026-10-19): náhled v panelu „k potvrzení“ i zápis používají tytéž kostky
   (záchrany nepřátel, Ostrá, záchrany houfu) – dřív se při zápisu házelo znovu a výsledek se lišil od náhledu */
const BUVC=new Map();
function bojUtokVyhodnot(s,u){if(!u||!u.id)return bojUtokVyhodnot0(s,u);const k=u.id+"|"+(u.ci||[]).join(",");if(BUVC.has(k))return BUVC.get(k);
  const V=bojUtokVyhodnot0(s,u);BUVC.set(k,V);if(BUVC.size>200)BUVC.delete(BUVC.keys().next().value);return V}
function bojUtokVyhodnot0(s,u){const h=(s.hraci||[]).find(x=>x.id===u.h),sp=u.sid?(s.npc||[]).find(x=>x.id===u.sid):null,an=sp?`${sp.n} (${h?h.n:"?"})`:h?h.n:"?",r=[],ef=bojUtEf(u);
  (u.ci||[]).forEach(ci=>{const n=(s.npc||[]).find(x=>x.id===ci);if(!n)return;const E=bojEff(n),houf=n.druh==="houf",o={ci,n:n.n,houf};
    if(ef){Object.assign(o,{ef,gm:`${n.n}: ${ef} (účinek kouzla)`,vys:ef});r.push(o);return}
    if(u.plos){const P=u.plos;
      const kz=!!u.sl||bojJeKouzlo(u.cim);
      if(houf){const H=bojHoufZachrany(n,E,u.dmg,u.t,P.ab,P.dc,P.pol,null,kz);Object.assign(o,{pad:H.pad,gm:`${n.n}: záchrany ${H.txt} → padlo ${H.pad} z ${H.v}`,vys:H.pad?`padlo ${H.pad}`:"všichni odolali"});r.push(o);return}
      const Z=bojNpcZach(n,E,P.ab,P.dc,kz),t=Z.t,ok=Z.ok,base=ok?(P.pol?Math.floor(u.dmg/2):0):u.dmg,z=E?bojZasah(E,base,u.t,{}):{x:base,pozn:[]};
      const SS=!ok?bojSpStav(u.cim):null;if(SS)o.spst=SS;if(!ok)o.fail=1;
      if(!ok&&!Z.fail&&bojLegZb(n,E))o.leg=bojLegZb(n,E);o.zch={ab:P.ab,pol:P.pol,dmg:u.dmg,t:u.t};
      Object.assign(o,{x:z.x,gm:`${n.n}: ${Z.txt} ${ok?"úspěch":"neúspěch"} → ${z.x}${z.pozn.length?" ("+z.pozn.join(", ")+")":""}${SS?` · ${SS.st.join(", ")}${SS.op?" (záchrana na konci každého tahu)":""}`:""}`,vys:ok?(z.x?"záchrana, poloviční zranění":"záchrana uspěla"):SS?SS.st.join(", "):"zasažen",sav:`${P.ab} ${t||""} ${ok?"úspěch":"neúspěch"}`.replace("  "," ")});r.push(o);return}
    const ZS=E?bojZbrStav(n,E):null,kr=+n.kryt||0,AC=ZS?ZS.ac+kr:null;let krit=u.d!=null&&u.d>=Math.min(20,+u.kmin||20);const mis=u.d===1;
    /* Ostrá (Artikule): 19 je kritický zásah, když zbraň seká (Slashing) cíl bez Resistance proti Slashing – web přihodí kostky zranění */
    if(!krit&&+u.d===19&&u.t==="Slashing"&&!bojMaRes(n,"Slashing")){const K=bojKartaH(h),a=K&&kUtoky(K).find(x=>x.n===u.cim),m=a&&String(a.z||"").match(/^(\d*)d(\d+)/);
      if(a&&m&&bdmZvl(a,K).includes("Ostrá")){const q=bojKostky(`${m[1]||1}d${m[2]}`,false);krit=true;u=Object.assign({},u,{dmg:(+u.dmg||0)+(q?q.t:0)});o.ostra=q?q.x:"";r.ostra=1}}
    const hit=!mis&&(krit||AC==null||u.hod>=AC);
    Object.assign(o,{hit,krit,AC,acT:AC!=null?`AC ${AC}${kr?` s krytem +${kr}`:""}`:"AC neznámé"});
    if(!hit){o.gm=`${n.n}: ${u.hod}${mis?" (přirozená 1)":""} proti ${o.acT} → vedle`;o.vys="vedle";r.push(o);return}
    if(houf){const z=E?bojZasah(E,u.dmg,u.t,{drt:u.drt,pru:u.pru}):{x:u.dmg,pozn:[]};o.pad=z.x>=1?1:0;o.gm=`${n.n}: ${u.hod} proti ${o.acT} → zásah${o.pad?", padl pacholek":" bez účinku"+(z.pozn.length?" ("+z.pozn.join(", ")+")":"")}`;o.vys=o.pad?(krit?"kritický zásah, pacholek padl":"pacholek padl"):"zásah bez účinku";r.push(o);return}
    const z=E&&E.hp.length?bojZasah(E,u.dmg,u.t,{drt:u.drt,pru:u.pru,st:n.stav}):{x:u.dmg,pozn:[]};o.x=z.x;o.pozn=z.pozn;
    o.sokKrit=krit&&n.druh==="sok";o.gm=`${n.n}: ${u.hod} proti ${o.acT} → ${krit?"kritický zásah":"zásah"}${o.ostra!=null?` (Ostrá: 19 seká cíl bez Resistance, přihozeno ${o.ostra})`:""}, ${u.dmg}${z.pozn.length?" → "+z.x+" ("+z.pozn.join(", ")+")":""}${o.sokKrit?" · sok je kritickým zásahem poražen (Artikule) – ledaže pošle do rány pacholka („Za pána!“)":""}${krit&&n.druh==="zhoubce"?" · zhoubce smí obětovat zbroj":""}`;
    o.vys=o.sokKrit?"kritický zásah – poražen":krit?"kritický zásah":"zásah";r.push(o)});
  return {an,h,r}}
const BUTZP=new Set();
/* potvrzení útoku hráče: životy, houfy, záznam, veřejný výsledek */
function bojUtokPotvrd(id,zamitni){const s=BOJ.s;const u=s&&(s.utoky||[]).find(x=>x.id===id);if(!u||u.stav!=="ceka"||BUTZP.has(id))return;BUTZP.add(id);
  if(zamitni){bojZmen(z=>{const q=(z.utoky||[]).find(x=>x.id===id);if(q){q.stav="zamitnuto";q.vys="vypravěč útok nezapsal"}});bojUtokVratSlot(u);return}
  bojUtokProved(s,u,id)}
/* zápis vyhodnoceného útoku (i útoku, který vypravěč sešle za hráče rovnou z okna „na koho“ – bez id) */
/* Legendární odolnost u záchrany proti kouzlu hráče: vypravěč ji zvolí v panelu k potvrzení – neúspěch se změní v úspěch */
function bojUtokLeg(uid,ci){const s=BOJ.s,u=s&&(s.utoky||[]).find(x=>x.id===+uid||x.id===uid);if(!u)return;const V=bojUtokVyhodnot(s,u),o=V.r.find(x=>x.ci===ci);if(!o||!o.leg||!o.zch)return;
  const n=(s.npc||[]).find(x=>x.id===ci),E=n&&bojEff(n),Z=o.zch,base=Z.pol?Math.floor(Z.dmg/2):0,z=E?bojZasah(E,base,Z.t,{}):{x:base,pozn:[]};
  delete o.leg;delete o.fail;delete o.spst;o.legU=1;o.x=z.x;o.gm+=` → Legendární odolnost: úspěch → ${z.x}`;o.vys=z.x?"Legendární odolnost, poloviční zranění":"Legendární odolnost – záchrana uspěla";o.sav=`${Z.ab} úspěch (Leg. odolnost)`;renderBoj()}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bulr]");if(b)bojUtokLeg(b.dataset.bulr,b.dataset.ci)});
function bojUtokProved(s,u,id){const V=bojUtokVyhodnot(s,u),houfy=[],mrtvi=[];
  V.r.forEach(o=>{if(!o.legU)return;const n=(s.npc||[]).find(x=>x.id===o.ci),E=n&&bojEff(n);if(!E)return;const zn=bojLegN(E),z=bojZdr.get(),q=(z[o.ci]=z[o.ci]||{});q[zn]=(q[zn]||0)+1;bojZdr.set(z)});
  V.r.forEach(o=>{const L={n:o.ef||u.cim||(u.plos?"Plošný útok":"útok"),ai:u.h,an:V.an,ci:o.ci,uh:{hod:u.hod,d:u.d,adv:u.adv,dmg:u.dmg,cim:u.cim||"",t:u.t,det:u.det||null},zt:o.ef?"účinek kouzla":u.plos?o.sav||"":`útok ${u.hod}${u.adv?u.adv>0?" (výh.)":" (nev.)":""} – ${o.hit?(o.krit?"kritický zásah":"zásah"):"vedle"}`};
    if(o.ef){}else if(o.houf){if(o.pad){houfy.push([o.ci,o.pad]);L.und={id:o.ci,poc:o.pad}}L.zt+=o.pad?` · padlo ${o.pad}`:"";if(o.hit===false)L.res="vedle";else{L.res=o.krit?"krit":"zasah"}}
    else if(o.x!=null){let x=o.x;if(o.sokKrit){const hv=(bojHp.get()[o.ci]||[])[0],E=bojEff((s.npc||[]).find(q=>q.id===o.ci)),cur=hv!=null?hv:(E&&E.hp.length?E.hp[0].max:x);x=Math.max(x,cur)}
      const U=bojHpUber(o.ci,0,x);if(U){L.und=U;L.zr={t:x,x:`z ${u.dmg}${(o.pozn||[]).length?" → "+o.pozn.join(", "):""}${o.sokKrit?" · kritický zásah soka porazí":""}`,zt:u.t};L.ap=1;if(U.nov<=0)mrtvi.push(o.n)}L.res=o.krit?"krit":"zasah"}
    else L.res="vedle";
    bojLog(o.ci,L,o.n)});
  const vys=V.r.length===1?V.r[0].vys:V.r.map(o=>`${o.n}: ${o.vys}`).join(" · ");
  bojZmen(z=>{const q=id!=null&&(z.utoky||[]).find(x=>x.id===id);if(q){q.stav="hotovo";q.vys=vys}
    V.r.forEach(o=>{const n=(z.npc||[]).find(x=>x.id===o.ci);if(!n)return;if(o.ef)bojEfZnac(z,n,o.ef,u);else if(o.spst&&u.plos)bojSpStavDej(z,n,o.spst,u);else if(o.fail&&u.plos&&!o.houf)bojEfZnac(z,n,u.cim,u)});
    houfy.forEach(([ci,pad])=>{const o=(z.npc||[]).find(x=>x.id===ci);if(o)o.pocet=Math.max(0,(o.pocet||0)-pad)});
    z.zaz=[...V.r.slice().reverse().map(o=>({k:z.kolo||1,ts:Date.now(),a:V.an,ai:u.h,c:o.n,ci:o.ci,cim:u.cim||"",v:o.vys+(mrtvi.includes(o.n)?", padl":""),...(u.hod!=null&&!u.plos?{hu:u.hod}:{})})),...(z.zaz||[])].slice(0,40)});
  mmHlasG(`${V.an} → ${vys}`,5000)}
/* nové útoky hráčů po načtení boje: rovnou zapsat, nebo upozornit */
function bojUtokyNove(){if(!GMV||!BOJ.s||!BOJ.s.aktivni)return;const P=(BOJ.s.utoky||[]).filter(u=>u.stav==="ceka"&&!BUTZP.has(u.id));if(!P.length)return;
  if(bojAuto.get())P.forEach(u=>bojUtokPotvrd(u.id));else{renderBoj();mmHlasG(`${P.length===1?"Útok hráče čeká":"Útoky hráčů čekají"} na potvrzení.`,3500)}}
/* vypravěč: čekající útoky hráčů s náhledem výsledku */
/* ===== Pruh „co teď“ (2026-10-19, jen vypravěč): kdo je na tahu a co mu zbývá, co čeká na vypravěče, kdo se soustředí,
   kdo krvácí, koho čeká záchrana na konci tahu, kdo je na prahu smrti. Klepnutí na účastníka otevře jeho kartu. ===== */
function bojTedHtml(s){if(!GMV||!s||!s.aktivni)return "";const tah=s.tah||0,kolo=s.kolo||1,sl=bojSloty(s),cur=sl[tah],kdoT=(s.obsazeni||{})[tah];
  const vsichni=[...(s.hraci||[]),...(s.npc||[])],jm=id=>besc(bojJm(s,id)||id),uc=id=>vsichni.find(x=>x.id===id),R=[];
  const ch=(cls,ic,txt,id,tip)=>`<${id?"button type=\"button\" data-bted=\""+besc(id)+"\"":"span"} class="btedch ${cls}" ${btip(tip||"")}>${ic?bi(ic,"btedi"):""}${txt}</${id?"button":"span"}>`;
  /* na tahu */
  if(cur&&!(tah>=sl.length)){const o=kdoT?uc(kdoT):null;
    if(o){const rk=!!(s.reak||{})[o.id],rd=(s.ready||{})[o.id],hot=(s.hotovo||{})[o.id]===kolo*100+tah,nes=bojNeschopny(o.stav),lim=o.druh?(BLIM[o.druh]||1):0,u=o.druh?bojUzito(s,o.id):0;
      R.push(ch("btedtah",o.druh?"tah":"tah",`<b>${jm(o.id)}</b> na tahu${hot?" · ✓ dohráno":""}${nes?` · <em>${nes} – nejedná</em>`:""}${rk?" · reakce použita":" · reakce volná"}${lim>1?` · ${u}/${lim} tahů v kole`:""}${rd?` · ⏳ ${besc(rd)}`:""}`,o.id,"Karta toho, kdo je na tahu"))}
    else R.push(ch("btedtah","tah",`<b>volný slot</b> · ${cur.t==="h"?"družina":"nepřátelé"}${(()=>{const nv=cur.t!=="h"?bojNavrh(s):null;return nv?` · navrhuji ${besc(nv.n)}`:""})()}`,null))}
  /* čeká na vypravěče */
  {const ut=(s.utoky||[]).filter(u=>u.stav==="ceka").length,nv=typeof navrhyCeka==="function"?navrhyCeka().length:0,
     vz=(typeof VYZVY!=="undefined"?VYZVY:[]).filter(v=>!v.zavrena&&(v.data&&v.data.komu&&v.data.komu.length?v.data.komu:KARTY.map(k=>k.id)).some(k=>!(v.odpovedi||{})[k])).length;
    if(ut)R.push(ch("btedceka","kostka",`${ut} ${ut===1?"útok":ut<5?"útoky":"útoků"} k potvrzení`,null,"Útoky hráčů z telefonu čekají na tvé potvrzení (panel pod pruhem)"));
    if(nv)R.push(ch("btedceka","zdroj",`${nv} ${nv===1?"návrh":nv<5?"návrhy":"návrhů"} ke schválení`,null,"Léčení spojence, Bardic… – schválit na stránce Hra"));
    if(vz)R.push(ch("btedceka","kostka",`${vz} ${vz===1?"výzva":vz<5?"výzvy":"výzev"} bez odpovědi`,null,"Hráči ještě nehodili (záchrana, iniciativa, opakovaná záchrana)"))}
  /* soustředění */
  vsichni.filter(o=>(o.stav||[]).includes("soustředí")).forEach(o=>{const K=!o.druh?bojKartaH(o):null,n=K?kKonNazev(K):"";
    R.push(ch("btedkon","soustredi",`${jm(o.id)}${n?`: <i>${besc(n)}</i>`:""}`,o.id,`${bojJm(s,o.id)} se soustředí${n?" na "+n:""} – při zranění CON záchrana`))});
  /* krvácení */
  vsichni.filter(o=>(o.stav||[]).some(t=>/^krvácí/.test(t))).forEach(o=>R.push(ch("btedkrv","zranen",`${jm(o.id)} krvácí ${(o.stav.find(t=>/^krvácí/.test(t))||"").replace("krvácí ","")}`,o.id,"Na začátku tahu ztratí životy, dokud ho někdo neošetří (Medicine)")));
  /* opakované záchrany na konci tahu */
  vsichni.forEach(o=>(o.ef||[]).filter(e=>e.op).forEach(e=>R.push(ch("btedzach","kostka",`${jm(o.id)}: ${besc(e.n)} <small>${besc(e.op.ab)} SO ${besc(String(e.op.dc))}</small>`,o.id,`Na konci tahu ${bojJm(s,o.id)} opakuje záchranu – úspěch ukončí ${e.st||"účinek"}`))));
  /* na prahu smrti */
  (s.hraci||[]).filter(h=>h.ds&&!h.ds.st).forEach(h=>R.push(ch("btedsmrt","porazen",`${jm(h.id)} ${bojDsPip(h)}`,h.id,"Na prahu smrti – na začátku tahu hod proti smrti")));
  (s.hraci||[]).filter(h=>h.ds&&h.ds.st==="mrtev").forEach(h=>R.push(ch("btedsmrt","smrt",`${jm(h.id)} umírá`,h.id,"Tři neúspěchy hodu proti smrti")));
  if(!R.length)return "";return `<div class="bted" role="status" aria-label="Co teď">${R.join("")}</div>`}
/* hromadný hod v Boji (2026-10-19): celá družina hodí ověření nebo záchranu (dech draka, past, skrytí…) jedním klepnutím;
   výsledky přijdou sem, do stejného panelu (výzvy jako na stránce Hra) */
function bojVyzPanel(s){if(!GMV||!window.MMDB||!MMDB.vyzva)return "";const L=(typeof VYZVY!=="undefined"?VYZVY:[]).filter(v=>!v.zavrena);
  return `<details class="bpridej bvyzp" data-otv="vyzvy"${bojOtv("vyzvy")}><summary>📣 Hromadný hod družiny${L.length?` <b>(${L.length})</b>`:""}</summary>
    <p class="vyzrych"><span class="bkzlh">Ověření:</span>${["Perception","Stealth","Insight","Investigation","Athletics","Acrobatics","Survival"].map(d=>`<button type="button" class="kchip" data-vyzrychle="${d}" ${btip(`Všem postavám vyskočí ověření ${d}`)}>${d}</button>`).join("")}</p>
    <p class="vyzrych"><span class="bkzlh">Záchrana:</span>${BAB.map(a=>`<button type="button" class="kchip" data-vyzrychle="${a}" ${btip(`Všem postavám vyskočí záchrana ${a} (dech, past, kouzlo)`)}>${a}</button>`).join("")}</p>
    <p class="kvlh"><label>SO <input type="number" min="1" max="40" data-bvyzdc inputmode="numeric" placeholder="–" aria-label="Stupeň obtížnosti"></label><label><input type="checkbox" data-bvyzskr> SO jen pro mě</label><input data-bvyzpozn maxlength="60" placeholder="za co (dech draka, past…)" aria-label="Poznámka"><small class="rsmall">Vyber SO a klepni na dovednost nebo vlastnost. Zranění se záchranou řeší Plošný zásah.</small></p>
    ${L.length?vyzvyGmHtml():""}</details>`}
function bojUtokyPanel(s){const P=(s.utoky||[]).filter(u=>u.stav==="ceka");
  const tg=`${potvrzHtml("boj")}<label class="bauto" ${btip("Zásah nepřítele odečte postavě s kartou životy hned (s odolnostmi a dočasnými HP); hráč může reagovat (Shield…) a zranění se vrátí.")}><input type="checkbox" data-bpcauto${bojPcAuto.get()?" checked":""}> zásahy nepřátel odečítat postavám rovnou</label>`;
  if(!P.length)return `${navrhyGmHtml()}<div class="butkp">${tg}</div>`;
  return `${navrhyGmHtml()}<section class="butkp bmor bkonc"><b>Útoky hráčů k potvrzení</b>${tg}<ul>${P.map(u=>{const V=bojUtokVyhodnot(s,u);return `<li><b>${besc(V.an)}</b> · ${besc(u.cim||"útok")}${bojUtEf(u)?" · účinek kouzla bez hodu":`${u.plos?` · plošně ${u.plos.ab} SO ${u.plos.dc}`:` · útok ${u.hod}${u.d?` (d20 ${u.d})`:""}`} · zranění ${u.dmg} ${besc(bojZrCz(u.t))}`}<br><small>${V.r.map(o=>besc(o.gm)+(o.leg?` <button type="button" class="badd" data-bulr="${u.id}" data-ci="${o.ci}" ${btip("Nepřítel místo neúspěchu uspěje – spotřebuje jedno použití Legendární odolnosti")}>Legendární odolnost (${o.leg})</button>`:"")).join("<br>")}</small> <button type="button" class="gbtn" data-bupot="${u.id}">Zapsat</button><button type="button" class="gbtn ghost" data-buzam="${u.id}">Zamítnout</button></li>`}).join("")}</ul></section>`}
/* hráč: formulář útoku (stav formuláře přežije překreslení) */
const BJU={zi:"",cil:"",cilL:[],cile:[],plos:false,adv:"auto",hod:"",d:"",dmg:"",cim:"",t:"Slashing",drt:false,pru:false,dal:false,ab:"AGI",dc:"",pol:true,info:"",ef:[],serie:null,ks:null,sl:""};
/* hráč: kouzla ve formuláři útoku (2026-10-17) – útok kouzlem (i více paprsků), záchrana jednoho či více cílů, automatický zásah
   (Magic Missile); zranění se škáluje stupněm slotu a úrovní postavy; odesláním se odečte slot a začne soustředění */
function kSpBoj(K,x,lvl){const d=kSpA(x.n);if(!d)return null;const E=kSpUcinek(K,x,lvl);if(E&&E.k==="l")return null;const t=String(d.t||"");
  const utok=!!(E&&E.utok)||/útok kouzlem/i.test(t),zach=utok?null:((E&&E.zach)||(t.match(/(STR|AGI|CON|INT|WIS|CHA) záchrann/)||[])[1]||null),auto=!utok&&!zach&&!!E&&/šipka zasáhne|automaticky zasáh/i.test(t);
  if(!utok&&!zach&&!auto)return null;let pocet=E&&E.pocet||1;if(pocet===1&&/\btři\b[^.]{0,30}(šipk|paprsk)/i.test(t))pocet=3;
  return {utok,zach,auto,pol:!!(E&&E.pol),x:E?E.x:"",mod:E&&E.mod||0,t:E&&E.t||null,pocet}}
function bojJaSp(s,me){if(BJU.ks==null||BJU.ks==="")return null;const K=bojKartaH(me);if(!K||!KSPD)return null;const x=kSeznam(K)[+BJU.ks];if(!x)return null;
  const sls=x.st>0||x.pz?kSlX(K,x).sort((a,b)=>a.st-b.st||(a.pakt?1:-1)):[];if((x.st>0||x.pz)&&!sls.length)return null;
  const q=sls.find(z=>z.k===BJU.sl)||sls[0]||null,lvl=q?q.st:x.st,B=kSpBoj(K,x,lvl);return B?{K,x,i:+BJU.ks,q,sls,lvl,B}:null}
/* kolik cílů smí kouzlo v listu útoku (0 = bez omezení – plošná kouzla) */
function bojJaCilMax(){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),sp=me&&bojJaSp(s,me);return sp?kCilUp(sp.x,sp.lvl):0}
const bojJaSpDmg=(B,krit)=>{if(!B.x)return {tot:0,txt:"–"};const r=kVyraz((krit?B.x.replace(/(\d+)d/g,(q,n)=>`${2*n}d`):B.x)+(B.mod?(B.mod>=0?"+":"")+B.mod:""));return r||{tot:0,txt:"–"}};
function bojJaZvolKouzlo(i){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),K=bojKartaH(me);if(!K)return;
  Object.assign(BJU,{ks:i,zi:"",sl:"",serie:null,hod:"",d:"",dmg:"",info:"",drt:false,pru:false,ef:[],kmin:null});
  const sp=bojJaSp(s,me);if(!sp){BJU.ks=null;renderBoj();return}const B=sp.B,r=String((kSp(sp.x.n)||{}).r||sp.x.dosah||"");
  BJU.t=B.t||BJU.t;BJU.dal=/\d+\s*stop/.test(r)&&!/^5\s*stop/.test(r);
  if(B.zach){BJU.plos=true;BJU.ab=B.zach;BJU.dc=String(kSpDC(K,sp.x)||"");BJU.pol=!!B.pol;if(BJU.cil&&!BJU.cile.includes(BJU.cil))BJU.cile=[BJU.cil]}else BJU.plos=false;
  renderBoj()}
function bojJaHodKouzlo(s,me,sp){const {K,x,B,lvl}=sp,c=(s.npc||[]).find(o=>o.id===BJU.cil),st=lvl?`${lvl}. st.`:"trik";
  /* Zadat ručně: d20, kostka Závoje a součet kostek zranění hozené u stolu (u kouzla se záchranou jen zranění) */
  const R=BRUC[me.id]||{},r20=bRucN(R.d20,1,20),r6=bRucN(R.d6,1,6),rz=bRucN(R.dmg,0,500),pl=v=>String(v??"").trim()!=="";
  if((pl(R.d20)&&r20==null)||(pl(R.d6)&&r6==null)||(pl(R.dmg)&&rz==null)){mmHlas(pl(R.d20)&&r20==null?"d20 musí být 1–20.":pl(R.d6)&&r6==null?"Kostka Závoje musí být 1–6.":"Zranění zadej jako číslo.",3000);return}
  delete BRUC[me.id];
  const plusK=n=>{const m=String(B.x||"").match(/([+-]\d+)$/);return (m?+m[1]:0)+(+B.mod||0)};
  const rucDmg=(n,kus)=>({tot:Math.max(0,n+plusK()*kus),txt:`${n} (ručně)${plusK()?` ${bsg(plusK())}${kus>1?` ×${kus}`:""}`:""}`});
  if(B.zach){const r=rz!=null?rucDmg(rz,1):bojJaSpDmg(B,false);BJU.dmg=String(r.tot);BJU.serie=null;BJU.info=`${x.n} (${st}): zranění ${r.txt} = ${r.tot}${B.pol?" · při úspěšné záchraně polovina":""}`;renderBoj();return}
  if(B.auto){let t=0;const L=[];if(rz!=null){const r=rucDmg(rz,B.pocet);t=r.tot;L.push(r.txt)}else for(let i=0;i<B.pocet;i++){const r=bojJaSpDmg(B,false);t+=r.tot;L.push(r.txt)}
    Object.assign(BJU,{hod:"60",d:"",dmg:String(t),serie:null,kmin:null,info:`${x.n} (${st}): automatický zásah${B.pocet>1?`, ${B.pocet}×`:""} – ${L.join(" | ")} = ${t}`});renderBoj();return}
  const nav=bojAdvHrac(s,me,c,BJU.dal),v=BJU.adv==="auto"?nav.v:+BJU.adv,b=kSpU1(K,x)-2*kVycerp(K),ser=[],txt=[];
  for(let i=0;i<Math.max(1,B.pocet);i++){const ru=i===0&&r20!=null,d1=ru?r20:bK(20),d2=v&&!ru?bK(20):null,d=d2==null?d1:v>0?Math.max(d1,d2):Math.min(d1,d2),krit=d===20,PD=kPriHod(K,"Útok"),r=i===0&&rz!=null?rucDmg(rz,1):bojJaSpDmg(B,krit),vys=bojJaZas(c,d+b+PD.t,d,krit);
    ser.push({hod:d+b+PD.t,d,d1,d2,v,b:b+PD.t,dmg:r.tot,krit,vys,upr:[],pd:PD.txt,ru,zx:r.txt});txt.push(`d20 ${d1}${ru?" (ručně)":""}${d2!=null?`/${d2}`:""} ${bsg(b)}${PD.txt} = ${d+b+PD.t}${krit?" krit!":d===1?" (1)":""}${vys?` → ${vys.toUpperCase()}`:""}, zranění ${r.txt} = ${r.tot}`)}
  Object.assign(BJU,{hod:String(ser[0].hod),d:String(ser[0].d),dmg:String(ser[0].dmg),kmin:null,serie:ser});
  const z=kZavoj(K,r6);KZAV[K.id]={co:`Útok – ${x.n}`,d:z.d,r:z.r,hod:z.hod};BJU.zav={d:z.d,r:z.r};
  BJU.info=`${x.n} (${st}). ${v&&r20==null?`${v>0?"Výhoda":"Nevýhoda"}. `:""}${txt.join(" · ")} · ${zavTxt(z)}${r6!=null?" (ručně)":""}`;renderBoj()}
let BJSPN=0;
function bojAdvHrac(s,me,c,dal){const plus=[],minus=[],st=me.stav||[];
  srdAdv(st,[],dal,plus,minus,true);
  const P=bojPros(s);if(P.includes("mlha")&&dal)minus.push("mlha");if(P.includes("vitr")&&dal)minus.push("silný vítr");
  if(c)srdAdv([],c.stav||[],dal,plus,minus);
  const v=plus.length&&!minus.length?1:minus.length&&!plus.length?-1:0;return {v,why:v>0?plus:v<0?minus:plus.length?["výhoda i nevýhoda se ruší"]:[]}}
function bojJaUtokHtml(s,me){const zb=bojZbrVse(s,me),K=bojKartaH(me),zv0=K&&KZBRV[K.id];if(zv0&&BJU.zvAuto!==zv0&&!BJU.ks){const i=zb.findIndex(x=>x.karta&&x.n===zv0);if(i>=0){BJU.zvAuto=zv0;BJU.zi=String(i);const w0=zb[i];BJU.t=w0.t||BJU.t;BJU.drt=!!w0.drt;BJU.pru=!!w0.pru;BJU.dal=!!w0.dal}}const cile=(s.npc||[]).filter(o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0));
  if(K&&!KSPD&&!BJSPN){BJSPN=1;kSpNacti().then(()=>{if(curView==="boj")renderBoj()}).catch(()=>{})}
  const sp=bojJaSp(s,me),SPL=K&&KSPD?kSeznam(K).map((x,i)=>[x,i]).filter(([x])=>kMaSl(K,x)&&kSpBoj(K,x,x.st)):[];
  const w=sp?null:(zb[+BJU.zi]||null),c=cile.find(o=>o.id===BJU.cil),nav=bojAdvHrac(s,me,c,w?!!w.dal:BJU.dal),am=BJU.adv;
  const moje=(s.utoky||[]).filter(u=>u.h===me.id).slice(-3).reverse();
  const cilH=BJU.plos?`<div class="bjucl" role="group" aria-label="Cíle plošného útoku">${cile.map(o=>`<label><input type="checkbox" data-jucile="${o.id}"${BJU.cile.includes(o.id)?" checked":""}> ${besc(o.n)}</label>`).join("")||"<small>žádní nepřátelé</small>"}</div>`
    :`<label>Cíl <select name="jucil" data-ju="cil"><option value="">— vyber —</option>${cile.map(o=>`<option value="${o.id}"${BJU.cil===o.id?" selected":""}>${besc(o.n)}${(o.stav||[]).includes("neviditelný")?" (neviditelný – nevýhoda)":""}</option>`).join("")}</select></label>`;
  const zbS=`<label>Čím <select name="juzi" data-ju="zi"><option value="">jiné…</option>${zb.map((x,i)=>`<option value="${i}"${String(BJU.zi)===String(i)?" selected":""}>${besc(x.n)}${x.b!=null&&x.b!==""?` ${bsg(+x.b)}`:""}${x.z?" · "+besc(x.z):""}</option>`).join("")}${SPL.length?`<optgroup label="Kouzla">${SPL.map(([x,i])=>`<option value="k${i}"${sp&&sp.i===i?" selected":""}>${besc(x.n)} · ${x.st?x.st+". st.":"trik"}</option>`).join("")}</optgroup>`:""}</select></label>${w||sp?"":`<input name="jucim" data-ju="cim" value="${besc(BJU.cim)}" placeholder="zbraň / kouzlo" aria-label="Čím útočíš" size="12">`}${sp&&sp.sls.length>1?`<label>Slot <select data-jusl aria-label="Slot kouzla">${sp.sls.map(q=>`<option value="${q.k}"${sp.q&&sp.q.k===q.k?" selected":""}>${q.lab?`${q.lab} – ${q.st}. st.`:`${q.pakt?"pakt ":""}${q.st}. st. (${q.max-q.u})`}</option>`).join("")}</select></label>`:""}`;
  const spI=sp?`<p class="rsmall bjusp">${besc(sp.x.n)} · ${sp.lvl?sp.lvl+". st.":"trik"} · ${sp.B.utok?`útok kouzlem ${bsg(kSpU1(K,sp.x))}${sp.B.pocet>1?`, ${sp.B.pocet}×`:""}`:sp.B.zach?`záchrana ${sp.B.zach} SO ${kSpDC(K,sp.x)||"?"}${sp.B.pol?", úspěch = polovina":""}`:`zasáhne bez hodu${sp.B.pocet>1?`, ${sp.B.pocet}×`:""}`}${sp.B.x?` · ${besc(sp.B.x)}${sp.B.mod?bsg(sp.B.mod):""} ${besc(BZRT[sp.B.t]||sp.B.t||"")}`:""}${sp.x.st>0||sp.x.kon?` · odesláním se ${sp.x.pz?"odečtou náboje":sp.x.st>0?"odečte slot":""}${sp.x.st>0&&sp.x.kon?" a ":""}${sp.x.kon?"začne soustředění":""}`:""}</p>`:"";
  const typ=`<select name="jut" data-ju="t" aria-label="Typ zranění">${BZTYPY.map(t=>`<option value="${t}"${BJU.t===t?" selected":""}>${BZRT[t]}</option>`).join("")}</select>`;
  const adv=BJU.plos?"":`<span class="badv" role="group" aria-label="Výhoda">${[["auto","auto"],["1","výhoda"],["-1","nevýhoda"],["0","bez"]].map(([k,l])=>`<button type="button" data-juadv="${k}" aria-pressed="${am===k}" ${btip(k==="auto"?(nav.v?`Teď ${nav.v>0?"výhoda":"nevýhoda"}: ${nav.why.join(", ")}`:"Teď bez výhody"):l)}>${l}${k==="auto"&&nav.v?` <b>${nav.v>0?"+":"−"}</b>`:""}</button>`).join("")}</span>`;
  const cisla=BJU.plos?`<label>SO <input type="number" name="judc" data-ju="dc" min="1" max="40" value="${besc(BJU.dc||((K&&kSpDC(K))||""))}" inputmode="numeric"></label><select name="juab" data-ju="ab" aria-label="Záchrana">${BAB.map(a=>`<option${BJU.ab===a?" selected":""}>${a}</option>`).join("")}</select><label class="bzrk"><input type="checkbox" data-jupol${BJU.pol?" checked":""}> úspěch = polovina</label><label>Zranění <input type="number" name="judmg" data-ju="dmg" min="0" max="300" value="${besc(BJU.dmg)}" inputmode="numeric"></label>`
    :`<label>Hod <input type="number" name="juhod" data-ju="hod" min="-10" max="60" value="${besc(BJU.hod)}" inputmode="numeric" aria-label="Výsledek hodu na útok"></label><label ${btip("Přirozená kostka – 20 je kritický zásah, 1 minutí (nepovinné)")}>d20 <input type="number" name="jud" data-ju="d" min="1" max="20" value="${besc(BJU.d)}" inputmode="numeric" aria-label="Přirozený hod d20"></label><label>Zranění <input type="number" name="judmg" data-ju="dmg" min="0" max="300" value="${besc(BJU.dmg)}" inputmode="numeric"></label>`;
  return `<details class="bjapd bjut" data-otv="ja-utok"${BOTV.has("ja-utok")?" open":""}><summary>${bojKartaH(me)?"Jinak – ruční zadání, plošně, kouzlo":"⚔ Útok"}</summary><div class="bjuf">${K&&typeof bojOpakHtml==="function"?bojOpakHtml(K):""}
    <label class="bzrk"><input type="checkbox" data-juplos${BJU.plos?" checked":""}> plošně (kouzlo, salva)</label>${cilH}<div class="bjur">${zbS}${typ}${adv}</div>
    <div class="bjur">${sp&&(sp.B.utok||sp.B.auto||sp.B.x)?`<button type="button" class="gbtn" data-juhod>🎲 ${sp.B.utok?"Hodit":"Hodit zranění"}</button>`:""}${!BJU.plos&&w&&w.z?`<button type="button" class="gbtn" data-juhod ${btip(`d20 ${bsg(+w.b||0)}, zranění ${w.z}${nav.v&&am==="auto"?` – ${nav.v>0?"výhoda":"nevýhoda"}`:""}`)}>🎲 Hodit</button>`:""}${cisla}</div>${spI}
    ${!BJU.plos&&!sp&&K&&kEfekty(K).length?`<div class="bjur">${kEfHtml(K,BJU.ef,"data-juef")}</div>`:""}${K&&!BJU.plos?`<div class="bjur">${kPriHtml(K)}</div>`:""}
    ${(()=>{if(BJU.plos||(BJU.serie&&BJU.serie.length>1))return "";const v=bojJaZas(c,BJU.hod,BJU.d,BJU.d!==""&&+BJU.d>=Math.min(20,+BJU.kmin||20));return v?`<p class="bjuvys ${v==="vedle"?"bmis":"bkr"}">${v==="vedle"?"Vedle":v==="zásah"?"Zásah!":"Kritický zásah!"}</p>`:""})()}${BJU.info?`<p class="rsmall">${besc(BJU.info)}</p>`:""}${!BJU.plos&&((BJU.serie&&BJU.serie.length)||BJU.hod!=="")?bojJaUprHtml(K):""}${BJU.serie&&BJU.serie.length>1?`<ol class="bjuser">${BJU.serie.map(x=>`<li>útok <b>${x.hod}</b>${x.krit?" (krit)":x.d===1?" (1)":""}${(x.upr||[]).length?` <small>(${besc(x.upr.join(", "))})</small>`:""}${x.vys?` <b class="bjuv ${x.vys==="vedle"?"bmis":"bkr"}">${x.vys}</b>`:""} · zranění <b>${x.dmg}</b></li>`).join("")}</ol>`:""}<p><button type="button" class="gbtn" data-juposl>${BJU.serie&&BJU.serie.length>1?`Poslat ${BJU.serie.length} útoky`:"Poslat vypravěči"}</button> <small class="rsmall">Hned vidíš, zda jsi zasáhl; zranění a jeho následky vyhodnotí vypravěč.</small></p>
    ${moje.length?`<ul class="bjumoje">${moje.map(u=>`<li>${besc(u.cim||"útok")} → ${besc((u.ci||[]).map(i=>bojJm(s,i)).join(", "))}: <b>${u.stav==="ceka"?"čeká na vypravěče":besc(u.vys||u.stav)}</b></li>`).join("")}</ul>`:""}</div></details>`}
/* Hex a Hunter's Mark: přídavek se přičte sám proti nepříteli se značkou od této postavy (a jen proti němu, když postava nějakou značku má) */
const BZNAC=["Hex","Hunter's Mark"];
function bojEfZnacene(me,K,c,w,sel){if(!K)return [];const E=kEfAkt(K,sel||BJU.ef,w),s=BOJ.s||{},moje=n=>(s.npc||[]).some(o=>(o.ef||[]).some(e=>e.n===n&&e.od===me.id));
  const naCili=n=>!!c&&(c.ef||[]).some(e=>e.n===n&&e.od===me.id);
  return [...E.filter(e=>!BZNAC.includes(e.n)||!moje(e.n)||naCili(e.n)),...kEfekty(K).filter(e=>BZNAC.includes(e.n)&&naCili(e.n)&&!E.some(x=>x.n===e.n))]}
/* hráč: hod za zbraň (d20 + bonus, s výhodou či nevýhodou; zranění, při přirozené 20 dvojnásob kostek) */
function bojJaHod(){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),sp=me&&bojJaSp(s,me);
  {const nes=me&&(bojNeschopny(me.stav)||kNeschopny(bojKartaH(me)));if(nes){mmHlas(`Nemůžeš jednat – ${nes}. Stav zruší vypravěč nebo záchrana na konci tahu.`,4000);return}}if(sp){bojJaHodKouzlo(s,me,sp);return}const w=bojZbrVse(s,me)[+BJU.zi];if(!me||!w||BJU.zi===""){mmHlas("Vyber zbraň s kostkou zranění.",2500);return}
  {const K0=bojKartaH(me),T0=K0&&bojSikTypy(K0,w);if(T0&&!BJU.sikOk){bojJaSikVolba(K0,w,T0);return}BJU.sikOk=false}
  const K=bojKartaH(me),TL=bojCileL(BJU,s.npc||[]).map(id=>(s.npc||[]).find(o=>o.id===id)),c=TL[0]||(s.npc||[]).find(o=>o.id===BJU.cil),E=bojEfZnacene(me,K,c,w),kmin=Math.min(20,...E.map(e=>+e.krit||20)),plus=E.reduce((a,e)=>a+(typeof e.zr==="string"?0:(+e.zr||0)),0);
  const nav=bojAdvHrac(s,me,c,!!w.dal),v=BJU.adv==="auto"?nav.v:+BJU.adv,b=(+w.b||0)-(K?2*kVycerp(K):0)+(typeof kEfUt==="function"?kEfUt(E):0),ser=[],txt=[];
  /* Zadat ručně: kostky hozené u stolu nahradí hod webu (jen první útok); co chybí, hodí web */
  const R=BRUC[me.id]||{},r20=bRucN(R.d20,1,20),r6=bRucN(R.d6,1,6),rz=bRucN(R.dmg,0,300),pl=v=>String(v??"").trim()!=="";
  if((pl(R.d20)&&r20==null)||(pl(R.d6)&&r6==null)||(pl(R.dmg)&&rz==null)){mmHlas(pl(R.d20)&&r20==null?"d20 musí být 1–20.":pl(R.d6)&&r6==null?"Kostka Závoje musí být 1–6.":"Zranění zadej jako číslo.",3000);return}
  delete BRUC[me.id];
  const kRuc=(z,n)=>{const m=String(z||"").match(/([+-]\d+)$/),c0=m?+m[1]:0;return {t:Math.max(0,n+c0),x:`${n} (ručně)${c0?(c0>0?"+":"")+c0:""}`}};
  /* útoky téže akce (Extra Attack) jeden po druhém (2026-10-18): každý zvlášť s vlastním d20, zraněním i kostkou Závoje; mezi nimi jde změnit cíl */
  const nU=Math.max(1,+w.pocet||1,TL.length),tk=(s.kolo||1)*100+(s.tah||0);if(BJU.uw!==w.n||BJU.utk!==tk){BJU.ui=0;BJU.uw=w.n;BJU.utk=tk}const iU=Math.min(+BJU.ui||0,nU-1);BJU.un=nU;
  for(let i=iU;i<=iU;i++){const ci=TL.length?TL[i%TL.length]:c,ru=r20!=null,d1=ru?r20:bK(20),d2=v&&!ru?bK(20):null,d=d2==null?d1:v>0?Math.max(d1,d2):Math.min(d1,d2),krit=d>=kmin,PD=K?kPriHod(K,"Útok"):{t:0,txt:""},mis=bojJaZas(ci,d+b+PD.t,d,krit)==="vedle"/* zranění jen po zásahu */,k=w.z&&!mis?(rz!=null?kRuc(w.z,rz):bojKostky(w.z,krit)):null,ek=mis?[]:bojEfZnacene(me,K,ci,w).filter(e=>typeof e.zr==="string").map(e=>bojKostky(e.zr,krit)).filter(Boolean),dmg=mis?0:(k?k.t:0)+(d===1?0:plus+ek.reduce((a,q)=>a+q.t,0));
    ser.push({ci:ci?ci.id:"",hod:d+b+PD.t,d,d1,d2,v,b:b+PD.t,dmg,krit,vys:bojJaZas(ci,d+b+PD.t,d,krit),upr:[],pd:PD.txt,ru,zx:k?`${k.x}${plus?` +${plus}`:""}${ek.map(q=>" + "+q.x).join("")}`:"",dz:{z:w.z||"",plus,ez:bojEfZnacene(me,K,ci,w).filter(e=>typeof e.zr==="string").map(e=>e.zr),rz}});txt.push(`${nU>1?`Útok ${i+1} z ${nU}: `:""}${TL.length>1&&ci?ci.n+": ":""}d20 ${d1}${ru?" (ručně)":""}${d2!=null?`/${d2}`:""} ${bsg(b)}${PD.txt} = ${d+b+PD.t}${krit?" krit!":d===1?" (1)":""}${ser[ser.length-1].vys?` → ${ser[ser.length-1].vys.toUpperCase()}`:""}${k?`, zranění ${k.x}${plus?` +${plus}`:""}${ek.map(q=>" + "+q.x).join("")} = ${dmg}`:mis&&w.z?", zranění se nehází":""}`)}
  if(K&&w.karta){const a=kUtoky(K).find(x=>x.n===w.n);if(a)kMunOdecti(K,a,ser.length)}if(K)kEfPouzij(K,E,BJU.ef);
  BJU.hod=String(ser[0].hod);BJU.d=String(ser[0].d);BJU.dmg=String(ser[0].dmg);BJU.t=bojUtTyp(K,w)||w.t||BJU.t;BJU.drt=!!w.drt;BJU.pru=!!w.pru;BJU.kmin=kmin;BJU.serie=ser;
  let zv="";BJU.zav=null;if(K){const z=kZavoj(K,r6);KZAV[K.id]={co:`Útok – ${w.n}`,d:z.d,r:z.r,hod:z.hod};BJU.zav={d:z.d,r:z.r};zv=" · "+zavTxt(z)+(r6!=null?" (ručně)":"")}
  BJU.info=(v&&r20==null?`${v>0?"Výhoda":"Nevýhoda"}. `:"")+txt.join(" · ")+zv;if(iU>=nU-1)bojBptOznac("A");renderBoj()}
/* hráč: poslat útok vypravěči */
async function bojJaPosli(){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get());if(!me||!bojDB||!bojDB.utok)return;const w=bojZbrVse(s,me)[+BJU.zi],ci=BJU.plos?BJU.cile.filter(id=>(s.npc||[]).some(o=>o.id===id)):bojCileL(BJU,s.npc||[]);
  if(!ci.length){mmHlas("Vyber cíl.",2500);return}const K=bojKartaH(me),sp=bojJaSp(s,me);
  const zak={ci,cim:(sp?`${sp.x.n}${sp.lvl>sp.x.st?` (${sp.lvl}. st.)`:""}`:(w&&BJU.zi!=="")?w.n:BJU.cim||"").slice(0,60),t:(sp&&sp.B.t)||BJU.t||"Slashing",drt:!sp&&!!BJU.drt,pru:!sp&&!!BJU.pru},L=[];
  if(sp&&sp.q&&/^slot[1-9]p?$/.test(sp.q.k||"")&&sp.x.st>0)zak.sl=sp.q.k;
  if(sp&&sp.B.zach&&sp.B.x&&BJU.dmg===""){const r=bojJaSpDmg(sp.B,false);BJU.dmg=String(r.tot);BJU.info=`${sp.x.n}: zranění ${r.txt} = ${r.tot}`}
  if(BJU.plos){const dc=Math.round(+(BJU.dc||((K&&kSpDC(K))||0)));if(!(dc>=1&&dc<=40)){mmHlas("Zadej SO záchrany.",2500);return}L.push(Object.assign({},zak,{dmg:Math.max(0,Math.min(300,Math.round(+BJU.dmg||0))),plos:{ab:BJU.ab,dc,pol:!!BJU.pol}}))}
  else{const c=(s.npc||[]).find(o=>o.id===ci[0]),nv=bojAdvHrac(s,me,c,w?!!w.dal:BJU.dal),adv=BJU.adv==="auto"?nv.v:+BJU.adv,km=BJU.kmin&&BJU.kmin<20?{kmin:BJU.kmin}:{};
    const ser=BJU.serie&&BJU.serie.length?BJU.serie:[{hod:BJU.hod,d:BJU.d,dmg:BJU.dmg}];
    for(const x of ser){if(x.hod===""||x.hod==null||isNaN(+x.hod)){mmHlas("Zadej výsledek hodu na útok, nebo klikni Hodit.",3000);return}
      const u=Object.assign({},zak,km,x.ci?{ci:[x.ci]}:{ci:[ci[0]]},{hod:Math.max(-10,Math.min(60,Math.round(+x.hod))),dmg:Math.max(0,Math.min(300,Math.round(+x.dmg||0))),adv});if(x.d!==""&&+x.d>=1&&+x.d<=20)u.d=Math.round(+x.d);L.push(u)}}
  const cn=(s.npc||[]).filter(o=>ci.includes(o.id)).map(o=>o.n).join(", ");
  if(sp&&K&&(sp.x.kon||(kSp(sp.x.n)||{}).ko)&&kKonDrzi(K)){const cur=kKonNazev(K)||"dosavadní kouzlo";if(cur!==sp.x.n){if(!confirm(`${K.n} se soustředí na ${cur}. Seslání ${sp.x.n} soustředění přeruší – ${cur} skončí. Seslat?`))return;await kKonZtrata(K,`nové kouzlo se soustředěním: ${sp.x.n}`)}}
  if(await kOdklad(`${zak.cim||"útok"} → ${cn}`,()=>true)===false){BJU.info="Zrušeno – nic se neodeslalo.";renderBoj();return}
  const sv=!!(sp&&sp.x.pz&&sp.x.pz.sv);if(sv&&await kartaSeslat(sp.K,sp.x,sp.q&&sp.q.k)===false){BJU.serie=null;BJU.info="Svitek selhal – nic se neodeslalo.";renderBoj();return}
  const SER=!BJU.plos&&BJU.serie&&BJU.serie.length===L.length?BJU.serie:null,ZV=BJU.zav;
  try{for(const u of L){try{await bojDB.utok(me.id,u)}catch(e){if(!u.sl||!/neplatný útok/.test(e.message||""))throw e;delete u.sl;await bojDB.utok(me.id,u)}}/* starší databáze bez 'sl' */bojJaHodyZapis(s,K,L,SER,ZV);if(sp&&!sv&&(sp.x.st>0||sp.x.kon||sp.x.pz)){try{await kartaSeslat(sp.K,sp.x,sp.q&&sp.q.k)}catch(e){}BJU.sl=""}BJU.hod=BJU.d=BJU.dmg="";BJU.serie=null;BJU.info=L.length>1?`Odesláno ${L.length} útoky – čekají na vypravěče.`:"Odesláno – čeká na vypravěče.";if(!sp&&(+BJU.un||1)>1){BJU.ui=(+BJU.ui||0)+1;if(BJU.ui<BJU.un)BJU.info=`Útok ${BJU.ui} z ${BJU.un} odeslán. Další útok téže akce: klidně změň cíl a hoď znovu.`;else BJU.ui=0}try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}}catch(err){mmHlas("Nepodařilo se poslat: "+(err.message||err),5000)}
  BOJ.v=-2;await bojNacti();renderBoj()}
/* odeslaný útok hráče do herního záznamu: kostky d20, zranění a kostka Závoje (Závoj jen u prvního útoku – hází se jednou za akci);
   vypravěč ho v záznamu boje spojí se svým vyhodnocením (zásah proti AC) */
function bojJaHodyZapis(s,K,L,SER,ZV){if(!K||!SER)return;L.forEach((u,i)=>{const x=SER[i]||{},c=bojJm(s,(u.ci||[])[0])||"",adv=x.d2!=null&&x.v?` / ${x.d2} (${x.v>0?"výhoda":"nevýhoda"})`:"";
  const H={k:K.id,kdo:K.n,co:`Útok – ${u.cim||"útok"}${c?" → "+c:""}`.slice(0,80),tot:u.hod,txt:`d20 ${x.d1!=null?x.d1:u.d}${x.ru?" (ručně)":""}${adv} ${bsg(x.b!=null?x.b:u.hod-(u.d||0))}${x.pd||""} = ${u.hod}${(x.upr||[]).length?` (${x.upr.join(", ")})`:""}${u.dmg!=null&&x.zx?` · zranění ${x.zx} = ${u.dmg} ${BZRT[u.t]||u.t||""}`:u.dmg?` · zranění ${u.dmg} ${BZRT[u.t]||u.t||""}`:""}`.slice(0,290)};
  if(u.d!=null)H.d=u.d;if(x.krit)H.krit=true;if(u.d===1)H.mis=true;if(x.v)H.adv=x.v;if(i===0&&ZV){H.zav=ZV.d;H.zr=ZV.r||"0"}kHodZapis(H)})}
/* hráč: moje zbraně (uloží se k postavě) */
function bojZbraneHtml(s,h){const zb=bojZbrH(s,h);
  return `<details class="bjapd bjzb" data-otv="zb-${h.id}"${BOTV.has("zb-"+h.id)?" open":""}><summary>Zbraně ${zb.length?`(${zb.length})`:""}</summary>${zb.length?`<ul class="bzbl">${zb.map((x,i)=>`<li><b>${besc(x.n)}</b> ${x.b!=null&&x.b!==""?bsg(+x.b):""} ${besc(x.z||"")} ${bikZrTxt(x.t)}<small>${besc(BZRT[x.t]||"")}${x.drt?" · Drtivá":""}${x.pru?" · Průrazná":""}${x.dal?" · na dálku":""}</small> <button type="button" class="bx" data-bzbdel="${i}" aria-label="Smazat ${besc(x.n)}">×</button></li>`).join("")}</ul>`:""}
    <form class="bzbf" data-bzbf><input name="n" placeholder="název (Dlouhý meč)" required size="14"><input name="b" type="number" min="-5" max="30" placeholder="útok +" inputmode="numeric" aria-label="Bonus k útoku"><input name="z" placeholder="1d8+3" size="7" aria-label="Kostka zranění"><select name="t" aria-label="Typ zranění">${BZTYPY.map(t=>`<option value="${t}">${BZRT[t]}</option>`).join("")}</select>
    <label class="bzrk"><input type="checkbox" name="drt"> Drtivá</label><label class="bzrk"><input type="checkbox" name="pru"> Průrazná</label><label class="bzrk"><input type="checkbox" name="dal"> na dálku</label><button class="gbtn ghost">Uložit zbraň</button></form></details>`}
/* hráč: soustředění – DC záchrany ze zranění */
function bojKonHtml(me){if(!(me.stav||[]).includes("soustředí"))return "";const d=BJK.d,dc=d?bojKonDC(d):null;
  return `<div class="bjkon">${bi("soustredi")} <b>Soustředění:</b> utržil jsem <input type="number" name="jukon" data-jukon min="0" max="300" value="${besc(d||"")}" inputmode="numeric" aria-label="Utržené zranění"> zranění${dc?` → <b>CON záchrana SO ${dc}</b> ${bojKartaH(me)?`<button type="button" class="gbtn" data-jukonh>🎲 Hodit</button>`:""}<button type="button" class="gbtn ghost" data-jukonx="ok">udržel</button><button type="button" class="gbtn ghost" data-jukonx="ne">ztratil soustředění</button>`:""}</div>`}
const BJK={d:"",seen:0};
/* hráč: přišlo zranění ze záznamu a drží soustředění → předvyplní záchranu na soustředění; hlášení zásahu (bojZasahHlidej) už SO záchrany uvádí.
   Viděné zásahy si pamatuje i po obnovení stránky (2026-10-20: na telefonu se po každém načtení znovu hlásilo zranění z minulého kola) */
function bojKonHlidej(s,me){if(!me||!(me.stav||[]).includes("soustředí"))return;BJK.seen=Math.max(BJK.seen,BZASV.get());const z=(s.zaz||[]).find(e=>e.ci===me.id&&e.z>0&&e.ts>BJK.seen);if(!z)return;BJK.seen=z.ts;BJK.d=z.z}
/* statistika boje ze záznamu vypravěče */
function bojStat(s){const D={},T={},K={};let kr=0,mi=0,ut=0;const jm=id=>{const c=bojCilO(s,id);return c?c.n:""};
  BLOGG.forEach(({id,kdo,o})=>{const a=o.ai!==undefined?(jm(o.ai)||o.an||""):(jm(id)||kdo),c=o.ci?jm(o.ci)||o.cn||"":"";
    const isUt=!!(o.hod&&o.hod.tot!=null&&!o.sav)||!!o.res;if(!isUt)return;ut++;
    const krit=(o.hod&&o.hod.krit)||o.res==="krit",mis=(o.hod&&o.hod.mis)||o.res==="vedle";if(krit){kr++;if(a)K[a]=(K[a]||0)+1}if(mis)mi++;
    if(o.zr&&!mis&&o.zr.t>0){if(a)D[a]=(D[a]||0)+o.zr.t;if(c)T[c]=(T[c]||0)+o.zr.t}});
  const top=O=>Object.entries(O).sort((x,y)=>y[1]-x[1]);const d=top(D),t=top(T);
  return {ut,kr,mi,d,t,K,txt:[d[0]?`Nejvíc zranění rozdal ${d[0][0]} (${d[0][1]})`:"",t[0]?`nejvíc schytal ${t[0][0]} (${t[0][1]})`:"",ut?`útoků ${ut}, kritických zásahů ${kr}, minutí ${mi}`:""].filter(Boolean).join(", ")}}
function bojStatHtml2(s){const S=bojStat(s);if(!S.ut)return "";
  return `<h4 class="bsph">Statistika</h4><div class="bstat2"><div><small>rozdal zranění</small><ol>${S.d.slice(0,5).map(([n,v])=>`<li>${besc(n)} <b>${v}</b></li>`).join("")||"<li>—</li>"}</ol></div><div><small>schytal</small><ol>${S.t.slice(0,5).map(([n,v])=>`<li>${besc(n)} <b>${v}</b></li>`).join("")||"<li>—</li>"}</ol></div>
    <div><small>útoky</small><p>${S.ut} · kritické zásahy <b>${S.kr}</b>${Object.keys(S.K).length?` (${Object.entries(S.K).map(([n,v])=>`${besc(n)} ${v}`).join(", ")})`:""} · minutí <b>${S.mi}</b></p></div></div><p class="rsmall">U útoků nepřátel na postavy se počítá hozené zranění (AC postav tracker nezná).</p>`}
/* filtr záznamu a Zpět ze záznamu */
let BLF="";
function bojLogZpet(i){const x=BLOGG[i];if(!x||!x.o.und||x.o.undone)return;const U=x.o.und;x.o.undone=1;
  if(U.poc){bojZmen(z=>{const o=(z.npc||[]).find(q=>q.id===U.id);if(o)o.pocet=Math.min(o.max||99,(o.pocet||0)+U.poc)});mmHlasG(`Vráceno: ${U.poc} ${U.poc===1?"pacholek":"pacholci"} zpět v houfu.`,3000);return}
  const hp=bojHp.get(),a=hp[U.id]||[];a[U.k]=U.old;hp[U.id]=a;bojHp.set(hp);if(U.old>0)delete BKPAD[U.id];
  const n=((BOJ.s&&BOJ.s.npc)||[]).find(q=>q.id===U.id);bojLog(U.id,{n:"Vráceno",ai:null,ci:U.id,zt:`životy ${U.nov} → ${U.old}`},n?n.n:"");mmHlasG(`Vráceno: ${n?n.n:""} má zase ${U.old} HP.`,3000);renderBoj()}
/* stavy NPC jako malé ikonky zavěšené na žetonu v pruhu iniciativy */
function bojSlStav(kdo){const S=BOJ.s||{},n=(S.npc||[]).find(x=>x.id===kdo)||(S.hraci||[]).find(x=>x.id===kdo);if(!GMV&&n&&n.druh&&!bojSpoj(n))return "";if(n&&n.ds)return `<span class="bslst"><b ${btip(n.ds.st==="mrtev"?"Umírá":n.ds.st?"Stabilizován":"Na prahu smrti")}>${bi(n.ds.st==="mrtev"?"smrt":"porazen")}</b></span>`;const a=(n&&n.stav||[]).filter(t=>BSTI[t]),rd=n&&((BOJ.s.ready||{})[kdo]),kz=typeof bojKzIkHtml==="function"?bojKzIkHtml(S,kdo):"";if(!a.length&&!kz)return rd?`<span class="bslst"><b ${btip("Připravená akce")}>⏳</b></span>`:"";
  return `<span class="bslst">${kz}${a.slice(0,4).map(t=>`<span class="bslsti" role="img" aria-label="${besc(t)}" ${btip((x=>x.toLowerCase().startsWith(t)?x:`${t[0].toUpperCase()+t.slice(1)}${SRDST[t]?` (${SRDST[t].en})`:""}: ${x}`)(BSTHP[t]||(BSTI[t]||[0,t])[1]||t))}>${bi(BSTI[t][0])}</span>`).join("")}${a.length>4?`<b ${btip(a.slice(4).join(", "))}>+${a.length-4}</b>`:""}</span>`}
function bojAktivni(){
  const s=BOJ.s,sl=s.sloty||bojSloty(s),ob=s.obsazeni||{},jed=new Set(Object.values(ob)),gm=GMV&&!!bojDB,tah=s.tah||0,prip=!s.aktivni&&!!s.priprava;
  const ja=!gm?((s.hraci||[]).find(h=>h.n===bojJa.get())||{}).id:null,muj=i=>ja&&ob[i]===ja;
  const spoj=(s.npc||[]).filter(bojSpoj),nepr=(s.npc||[]).filter(o=>!bojSpoj(o));
  const otv=x=>gm&&!prip&&bojOtevr(s,x),P0={nepr,spoj};
  const med=(kdo,c)=>{const h=(s.hraci||[]).find(x=>x.id===kdo);if(h)return bojMedH(h,c);const n=(s.npc||[]).find(x=>x.id===kdo);return n?bojMedN(n,c):""};
  const slot=(x,i)=>{const kdo=ob[i],nm=kdo?bojJm(s,kdo):"",strana=x.t==="h"?"Družina":"Nepřátelé";
    const stav=i<tah?"odehráno":i===tah?"na tahu":i===tah+1?"další na řadě":"";
    let ctl="";
    if(gm){const opts=x.t==="h"?[...(s.hraci||[]).filter(h=>h.id===kdo||!jed.has(h.id)),...spoj.filter(n=>n.id===kdo||((n.druh!=="houf"||n.pocet>0)&&bojUzito(s,n.id)<(BLIM[n.druh]||1)))]
        :nepr.filter(n=>n.id===kdo||((n.druh!=="houf"||n.pocet>0)&&bojUzito(s,n.id)<(BLIM[n.druh]||1)));
      ctl=`<select class="bslsel" data-bslot="${i}" aria-label="Kdo jedná ve slotu ${i+1} (${strana})"><option value="">— volný —</option>${opts.map(o=>`<option value="${o.id}"${o.id===kdo?" selected":""}>${besc(o.n)}</option>`).join("")}</select>`}
    else if(!kdo&&x.t==="h"&&bojDB&&bojDB.obsad)ctl=`<button type="button" class="bslclaim" data-bclaim="${i}" aria-label="Obsadit slot ${i+1}"></button>`;
    const tip=`${i+1}. slot · ${strana} (hod ${x.hod}) · ${nm||"volný"}${stav?" · "+stav:""}${!kdo&&ctl?(gm?" – klikni a vyber, kdo jedná":" – klikni a obsaď"):gm?" – klikni pro změnu":""}`;
    return `<li class="bslot b${x.t}${i===tah?" btah":""}${i<tah?" bdone":""}${i===tah+1?" bdalsi":""}${kdo?" bobs":""}${muj(i)?" bmuj":""}${muj(i)&&i===tah?" bmujtah":""}" ${btip(tip)}><span class="bhod vh">${x.hod}</span>${kdo?(i===tah?`<span class="bmedw">${med(kdo)}<span class="bdrak ${(s.hraci||[]).some(h=>h.id===kdo)?"bdrakh":"bdrakn"}" aria-hidden="true"></span></span>`:med(kdo)):`<span class="bmed bmprazd ${x.t==="h"?"bmk":"bmc"}">${bi("plus")}</span>`}${i<tah?`<span class="bdoneic">${bi("hotovo")}</span>`:""}<span class="bkdo">${nm?besc(nm):strana}</span>${kdo?bojSlStav(kdo):""}${ctl}</li>`};
  const jaHp=prip&&!gm?(()=>{const me=(s.hraci||[]).find(h=>h.n===bojJa.get());return `<div class="bja">${me?"":bojJaNeprihl()}
      ${s.prekv==="h"?`<b class="bprekvh">Přepadení – hoď iniciativu s nevýhodou (2d20, nižší).</b>`:""}${me&&bojDB&&bojDB.hod&&bojKartaH(me)?`<button type="button" class="gbtn" data-bhini="${me.id}">🎲 Hodit iniciativu (d20 ${bsg(kIni(bojKartaH(me)))})</button>`:""}${me&&bojDB&&bojDB.hod?`<label class="bjahod">Můj hod iniciativy <input type="number" inputmode="numeric" min="-10" max="50" data-bjahod="${me.id}" value="${me.hod??""}" aria-label="Můj hod iniciativy"><small>d20 + Obratnost</small></label>`:""}</div>`})():"";
  const jaH=prip?jaHp:!gm&&bojDB&&bojDB.obsad?`<div class="bja">${ja?"":bojJaNeprihl()}${(()=>{const me=ja&&(s.hraci||[]).find(h=>h.id===ja);if(!me||!bojDB.hrac)return "";
        const tahM=muj(s.tah),dal=Object.keys(ob).some(k=>ob[k]===ja&&+k===s.tah+1),pr=bojPripominky(s,me);
        const KK=bojKartaH(me);return `${tahM||dal||bojDsAkt(me)?`<ul class="bjapr" aria-label="Připomínky na tah">${pr.map(x=>`<li>${besc(x)}</li>`).join("")}</ul>`:""}${KK?bojHracKarta(s,me,false,true):`${tahM&&!me.ds?bojPruvodce(s,me):""}<section class="bjapanel"><h3 class="uvh2">${besc(me.n)}</h3><p class="rsmall bjabezk">Tahle postava nemá kartu, proto se tu místo bojové karty ukazuje jen jednoduchý panel. Kartu vytvoří nahrání listu postavy z D&amp;D Beyond (PDF) v <a href="#karty">Kartách postav</a> – musí mít stejné jméno jako postava v boji.</p>${bojHracPanel(me,s,false)}</section>${bojDB.utok&&!me.ds?bojJaUtokHtml(s,me):""}`}`})()}</div>`:"";
  const konec=tah>=sl.length;
  /* pruh ukazuje jen obsazené sloty a pro každou stranu nejbližší volný od aktuálního tahu; ostatní volné jsou shrnuté na konci */
  const volH=sl.findIndex((x,i)=>i>=tah&&!ob[i]&&x.t==="h"),volN=sl.findIndex((x,i)=>i>=tah&&!ob[i]&&x.t==="n");
  const vid=sl.map((x,i)=>!!ob[i]||i===volH||i===volN);
  const skr=sl.filter((x,i)=>!vid[i]&&i>=tah),skH=skr.filter(x=>x.t==="h").length,skN=skr.length-skH;
  const zbyt=skr.length?`<li class="bslot bzbyt" ${btip(`Ještě ${skr.length} ${skr.length===1?"volný slot":skr.length<5?"volné sloty":"volných slotů"} v tomto kole${skH?` · družina ${skH}`:""}${skN?` · nepřátelé ${skN}`:""}`)}><span class="bzbytc">+${skr.length}</span><span class="bkdo">volné</span></li>`:"";
  const addF=(id,ph)=>`<form class="bnadd" id="${id}"><input name="nn" placeholder="${ph}" aria-label="${ph}" required${PROTIVNICI.length?' list="bbest" autocomplete="off"':""}><input type="hidden" name="nb"><input type="hidden" name="npr"><input type="hidden" name="nos"><select name="nd" aria-label="Druh">${Object.entries(BDRUH).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select><label class="bpoc"><span>počet</span><input name="np" type="number" min="1" max="12" value="6" aria-label="Počet v houfu"></label><button class="gbtn ghost" type="submit">Přidat</button></form>`;
  const sh=gm&&BKON?bojShrn(s):null;
  const obt=gm?bojMomHtml(s,gm):"";
  const kdoT=ob[tah],cur=sl[tah];
  const ctl=`<div class="bctl bnatahu">${gm?`<button type="button" class="bnav" data-bact="zpet" aria-label="O jeden slot zpět" ${btip("O jeden slot zpět")}${tah>0?"":" disabled"}>${bi("sipka","bvl")}</button>`:""}
      <span class="bcur">${konec?`<span><small>kolo ${s.kolo}</small><b>Kolo dobojováno</b></span>`:`${kdoT?med(kdoT):`<span class="bmed bmprazd ${cur&&cur.t==="h"?"bmk":"bmc"}">${bi("plus")}</span>`}<span><small>na tahu · ${cur&&cur.t==="h"?"družina":"nepřátelé"}</small><b>${kdoT?besc(bojJm(s,kdoT)):"volný slot"}</b>${kdoT&&(s.hotovo||{})[kdoT]===(s.kolo||1)*100+tah?` <span class="bhotovo" ${btip("Hráč ukončil tah")}>✓ dohráno</span>`:""}${gm&&!kdoT?(()=>{const nv=bojNavrh(s);return nv?`<button type="button" class="gbtn ghost bnavrh" data-bnavrh="${nv.id}" ${btip("Navržený, kdo jedná – klikni nebo mezerník")}>Navrhuji: ${besc(nv.n)}</button>`:""})():""}</span>`}</span>
      ${gm?(konec?`<button type="button" class="gbtn bnovk" data-bact="kolo">Nové kolo</button>`:`<button type="button" class="bnav" data-bact="dalsi" aria-label="Další slot" ${btip("Další slot")}>${bi("sipka","bvr")}</button>`):""}</div>`;
  const leg=`<div class="bleg"><span class="bkolo2" role="img" aria-label="Kolo ${s.kolo}" ${btip(`Kolo ${s.kolo} · iniciativa družiny ${s.hod!=null?s.hod:"–"}, nepřátel ${s.dm??"–"}`)}><b>${s.kolo}</b><img class="bkolhg" src="art/img/boj/presypaci-64.webp" srcset="art/img/boj/presypaci-64.webp 64w, art/img/boj/presypaci-128.webp 128w" sizes="44px" width="44" height="44" alt="" aria-hidden="true"><small>kolo</small></span>
      <span class="bhelp" role="img" aria-label="Nápověda" ${btip(gm?"Klikni do slotu a vyber, kdo v něm jedná. Hráči si volné sloty družiny mohou obsadit i ze svého telefonu. Šipkami posouváš tah. Klávesy: mezerník další tah, Shift+mezerník zpět o slot, číslice a Enter zranění vybraného nepřítele (u houfu počet padlých), Ctrl+Z vrátí poslední změnu.":"Volný slot družiny si obsadíš kliknutím na +. Každá postava smí jednat jen jednou za kolo.")}>?</span></div>`;
  const hracP=h=>`<li class="bhrp">${bojMedH(h)}${gm?`<input data-bhn="${h.id}" value="${besc(h.n)}" placeholder="Jméno postavy" aria-label="Jméno postavy">`:`<span>${besc(h.n)}</span>`}
      <label class="bhrh" ${btip("Hod iniciativy: d20 + Obratnost (hráč ho může zapsat i ze svého telefonu)")}><span class="vh">Hod iniciativy</span><input type="number" inputmode="numeric" min="-10" max="50" data-bhhod="${h.id}" value="${h.hod??""}" placeholder="hod"${gm?"":" readonly"} aria-label="Hod iniciativy – ${besc(h.n)}"></label>${gm&&bojKartaH(h)?`<button type="button" class="gbtn ghost" data-bhini="${h.id}" ${btip(`Hodit iniciativu z karty: d20 ${bsg(kIni(bojKartaH(h)))}`)}>🎲</button>`:""}${gm?`<button type="button" class="bx" data-bhdel="${h.id}" aria-label="Odebrat ${besc(h.n)}">×</button>`:""}</li>`;
  const rk=s.reak||{},reakB=(id,nm)=>`<button type="button" class="break${rk[id]?" on":""}" data-break="${id}" aria-pressed="${!!rk[id]}" ${gm?"":"disabled "}${btip(`Reakce${nm?" – "+nm:""}: ${rk[id]?"použita, obnoví se na začátku jeho tahu":"k dispozici"}${gm?" (klikni)":""}`)}>R</button>`;
  const hrac=h=>{const j=jed.has(h.id),kr=(bojKritPC()[h.n]||[]).length,st=(h.stav||[]).filter(t=>BSTI[t]),rd=(s.ready||{})[h.id],otv=gm&&BHROTV.has(h.id);
    const K=bojKartaH(h),hpc=K?bojHpPC(h,K):null;
    return `<li class="${j?"bjed":""}${h.ds?" bhdsr":""}">${bojMedH(h)}<span>${besc(h.n)}</span>${typeof bojKzIkHtml==="function"?bojKzIkHtml(s,h.id,"bkzikm"):""}${K?`<span class="bkhpm${hpc<=kHPmax(K)/2?" bhp2":""}" ${btip(`AC ${kAC(K)} · HP ${hpc}/${kHPmax(K)}${kartaStav(K.id).thp?` + ${kartaStav(K.id).thp} dočasné`:""}`)}><small>AC</small>${kAC(K)} <small>HP</small>${hpc}${kartaStav(K.id).thp?`+${kartaStav(K.id).thp}`:""}</span>`:""}${kr?`<span class="bkrb" ${btip(`Neléčená kritická zranění: ${kr} – ${(bojKritPC()[h.n]||[]).map(x=>x.t).join("; ")}`)}>✚${kr}</span>`:""}${bojDsPip(h)}${st.length?`<span class="bstavy bakt">${st.map(t=>`<span class="bst" role="img" aria-label="${besc(BSTI[t][1])}" ${btip(BSTI[t][1])}>${bi(BSTI[t][0])}</span>`).join("")}</span>`:""}${h.kryt?`<span class="bkrbd" role="img" aria-label="Kryt +${h.kryt}" ${btip(`Za krytem: AC +${h.kryt}`)}>${bi("kryt")}<small>+${h.kryt}</small></span>`:""}${rd?`<b class="brdyh" role="img" aria-label="Připravená akce" ${btip("Připravená akce: "+rd)}>⏳</b>`:""}<span class="btahy" role="img" aria-label="${j?"V tomto kole jednal":"Ještě nejednal"}" ${btip(j?"V tomto kole už jednal":"V tomto kole ještě nejednal")}>${bi(j?"tahok":"tah",j?"on":"")}</span>${reakB(h.id,h.n)}${gm?`<button type="button" class="brozb" data-bhrozb="${h.id}" aria-expanded="${otv}" aria-label="${otv?"Sbalit":"Rozbalit"} – stavy, kryt, hody proti smrti" ${btip("Stavy, kryt, připravená akce, hody proti smrti")}>${bi("sipka")}</button>`:""}${j?`<span class="vh"> · jednal</span>`:""}</li>${otv?`<li class="bhrx">${bojHracPanel(h,s,true)}</li>`:""}`};
  if(prip){const bh=bojBestHod(s),npcP=gm?nepr:[],spojP=gm?spoj:[];
    return {hor:(()=>{const M=!gm&&s.aktivni?bojMomentum(s):{},mb=M.m?`<p class="bmomban bmom-${M.m}"><b>${M.m==="h"?"Družina má momentum":"Nepřátelé mají momentum"}</b> – ${M.m==="h"?"Pokušení vám":"Pokušení nepřátelům"} padá jen na ${zavojInfo().z?"1–2":"1"}.</p>`:"",h=zavojBan()+mb+bojPocasi()+bojProsHtml(s,gm);return h?`<div class="bojhorni">${h}</div>`:""})(),ja:jaH,
    head:`<div class="bojhead"><div class="bojtit"><h2 class="arttitle">Boj</h2><p class="bojlead">${besc(s.lead||(gm?"Rozestav obě strany. Hráči mohou zapsat hod iniciativy ze svého telefonu, nebo ho doplň sám.":"Boj se připravuje. Vyber svou postavu a zapiš hod iniciativy."))}</p></div>${gm?`<div class="bojbtn"><button type="button" class="gbtn ghost" data-binivyz ${btip("Hráčům s kartou vyskočí výzva k iniciativě; hody se zapíšou samy")}>📣 Hráči hodí iniciativu</button><button type="button" class="gbtn ghost" data-bdmhod ${btip("Hodí d20 + nejlepší iniciativu ze statblocků nepřátel")}>🎲 Hodit za nepřátele</button><button type="button" class="gbtn ghost" data-bskupuloz>Uložit jako setkání</button><button type="button" class="gbtn bstart" data-bstart>⚔ Začít boj</button></div>`:""}</div>`,
    osa:`<section class="bosa bprip"><div class="bleg"><span class="bkolo2" role="img" aria-label="Příprava boje" ${btip(`Příprava · nejlepší hod družiny ${bh??"–"}, nepřátel ${s.dm??"–"}`)}><b>–</b><img class="bkolhg" src="art/img/boj/presypaci-64.webp" srcset="art/img/boj/presypaci-64.webp 64w, art/img/boj/presypaci-128.webp 128w" sizes="44px" width="44" height="44" alt="" aria-hidden="true"><small>příprava</small></span></div>
      <div class="bpripw"><p class="bpriph">${gm?`<label class="bdml">Hod nepřátel <input type="number" inputmode="numeric" min="-10" max="50" data-bdm value="${s.dm??""}" placeholder="hod" aria-label="Hod iniciativy nepřátel"></label> `:""}Družina i nepřátelé dostanou tolik slotů, kolik je postav. Sloty se střídají a začíná strana s vyšším hodem (při shodě družina).</p>
      ${gm?`<p class="bprekv" role="radiogroup" aria-label="Přepadení">Překvapená strana: ${[["","nikdo"],["h","družina"],["n","nepřátelé"]].map(([k,l])=>`<label><input type="radio" name="bprekv" data-bprekv value="${k}"${(s.prekv||"")===k?" checked":""}> ${l}</label>`).join("")} <small>(překvapená strana hází iniciativu s nevýhodou)</small></p>`:s.prekv==="h"?`<p class="bprekv bprekvh"><b>Družina je překvapena:</b> hoďte iniciativu s nevýhodou (2d20, nižší).</p>`:""}</div></section>`,
    plos:"",det:"",detl:[],tabs:"",hr:`<h3 class="uvh2">Družina</h3><ul class="bhr bhrpl">${(s.hraci||[]).map(hracP).join("")}</ul>${gm?`<p class="bhradd"><button type="button" class="badd" data-bhadd>+ Přidat postavu</button>${PARTY.length?`<button type="button" class="badd" data-bhdruz ${btip("Nahradí seznam postavami z karet družiny")}>Načíst družinu z karet</button>`:""}${(KARTY||[]).filter(k=>!(s.hraci||[]).some(h=>bojKartaH(h)===k)).map(k=>`<button type="button" class="badd" data-bhkarta="${besc(k.id)}" ${btip("Přidá postavu s kartou: AC, životy, záchrany, útoky")}>+ ${besc(k.n)}${k.test?" (zkušební karta)":""}</button>`).join("")}</p>`:""}`,
    spojH:spojP.length?`<h4 class="bsph">Spojenci</h4>`:"",spoj:spojP.map(n=>[n.id,bojKarta(s,n,gm)]),
    adds:gm?`<details class="bpridej" data-otv="pridej-s"${bojOtv("pridej-s")}><summary>${bi("plus")} Přidat spojence</summary>${addF("bnadds","Přidat spojence (NPC)")}</details>`:"",glog:"",
    obt:`<h3 class="uvh2">Nepřátelé</h3>${gm?`<div class="bobtw">${npcP.some(o=>o.b)?`<p class="bobt">${bojObt(npcP,(s.hraci||[]).length,false).html}</p>`:""}${bojUrSel()}</div>`:`<p class="rsmall">Nepřátelé se ukážou, až vypravěč zahájí boj.</p>`}`,npc:npcP.map(n=>[n.id,bojKarta(s,n,gm)]),
    addn:gm?`<details class="bpridej" data-otv="pridej-n" open><summary>${bi("plus")} Přidat nepřítele nebo setkání</summary>${addF("bnadd","Přidat nepřítele")}<div class="bskup">${bojSkupSel("data-bskupadd","+ přidat setkání nebo skupinu")}${Object.keys(bojSkup()).length?`<button type="button" class="badd" data-bskupdel>Smazat skupinu z prohlížeče…</button>`:""}</div>${bojBestDl()}${bojBestiar()}</details>`:""}}
  return {hor:(()=>{const h=zavojBan()+bojPocasi()+bojProsHtml(s,gm);return h?`<div class="bojhorni">${h}</div>`:""})(),ja:jaH,
    head:`<div class="bojhead"><div class="bojtit"><h2 class="arttitle">Boj</h2></div>${gm?`<div class="bojbtn"><button type="button" class="gbtn ghost" data-bplosnew ${btip("Plošný zásah: jeden hod zranění, záchrana každého cíle, odolnosti")}>☄ Plošný zásah</button><button type="button" class="gbtn ghost" data-bundo ${btip("Vrátit poslední změnu (Ctrl+Z)")}${BUNDO.length?"":" disabled"}>↶ Zpět</button><button type="button" class="gbtn ghost" data-bact="kolo">Nové kolo</button><button type="button" class="gbtn ghost" data-bact="konec">Ukončit boj</button></div>`:""}</div>
    ${sh?`<section class="bkonsh"><h3 class="uvh2">Konec boje</h3>${sh.html}<p class="rsmall">Boj trval ${s.kolo||1} ${(s.kolo||1)===1?"kolo":(s.kolo||1)<5?"kola":"kol"} (asi ${Math.max(1,Math.round((s.kolo||1)*6/60))} min).${(s.cile||[]).length?" Cíle: "+(s.cile||[]).map(c=>`${c.n} ${(c.cil?c.stav>=c.cil:c.stav)?"✓":"✗"}`).join(", ")+".":""}</p>
      <p><button type="button" class="gbtn ghost" data-bodp ${btip("Posune herní čas o hodinu a připíše krátký odpočinek do zápisu sezení")}${BODP?" disabled":""}>${BODP?"✓ Krátký odpočinek zapsán":"Krátký odpočinek družiny (+1 h, výzva hráčům)"}</button> <a class="badd" href="#karty" ${btip("Pokladna družiny a rozdělení kořisti")}>Pokladna a kořist →</a></p><h4 class="bsph">Návrh zápisu do Kroniky</h4><textarea class="bzapt" name="bzapt" data-bzapt rows="8" aria-label="Návrh zápisu do Kroniky">${besc(BZAPT??bojZapisNavrh(s))}</textarea><p class="rsmall">Uprav podle sebe. „Ukončit a zapsat do Kroniky“ ho vloží jako text nového zápisu, zajatce, výkupné a kořist přidá do skrytých podkladů. Skryté cíle v návrhu nejsou. <button type="button" class="badd" data-bzapn>Navrhnout znovu</button></p>
      <div class="bojbtn"><button type="button" class="gbtn" data-bkon="kron">Ukončit a zapsat do Kroniky</button><button type="button" class="gbtn ghost" data-bkon="ok">Ukončit bez zápisu</button><button type="button" class="gbtn ghost" data-bkon="zpet">Zpět do boje</button></div></section>`:""}`,
    osa:`<section class="bosa${konec?" bkon":""}">${leg}<ol class="bsloty">${sl.map((x,i)=>vid[i]?slot(x,i):"").join("")}${zbyt}</ol>${ctl}</section>`,plos:gm?bojTedHtml(s)+(typeof bojProtiHtml==="function"?bojProtiHtml():"")+bojUtokyPanel(s)+bojVyzPanel(s)+bojPlosPanel(s)+(typeof bojOblHtml==="function"?bojOblHtml(s,true):""):(typeof bojOblHtml==="function"?bojOblHtml(s,false):""),
    hr:`<h3 class="uvh2">Družina</h3><div class="bhrks">${(s.hraci||[]).filter(h=>!otv(h)).map(h=>bojHracKarta(s,h,gm)).join("")}</div>`,spojH:spoj.length?`<h4 class="bsph">Spojenci</h4>`:"",spoj:spoj.filter(n=>!otv(n)).map(n=>[n.id,bojKarta(s,n,gm)]),
    det:gm?(s.hraci||[]).filter(otv).map(h=>bojHracKarta(s,h,gm)).join("")||(bojVybranaKarta(s)?"":`<p class="bdetnic">${bi("tah")} V záložce Nepřátelé nebo Družina klikni na účastníka – jeho karta se ukáže tady. Sama se sem přepne karta toho, kdo je na tahu.</p>`):"",
    detl:gm?[...nepr,...spoj].filter(otv).map(n=>[n.id,bojKarta(s,n,gm)]):[],tabs:bojTaby(s,gm,P0),
    adds:gm?`<details class="bpridej" data-otv="pridej-s"${bojOtv("pridej-s")}><summary>${bi("plus")} Přidat spojence</summary>${addF("bnadds","Přidat spojence (NPC)")}</details>`:"",glog:bojZaznamSloupec(s,gm),
    obt:`<h3 class="uvh2">Nepřátelé</h3>${obt}`,npc:nepr.filter(n=>!otv(n)&&!bojOut(n)).map(n=>[n.id,bojKarta(s,n,gm)]),npcx:nepr.filter(n=>!otv(n)&&bojOut(n)).map(n=>[n.id,bojKarta(s,n,gm)]),
    addn:gm?`<details class="bpridej" data-otv="pridej-n"${bojOtv("pridej-n")}><summary>${bi("plus")} Přidat nepřítele nebo setkání</summary>${addF("bnadd","Přidat nepřítele")}<div class="bskup">${bojSkupSel("data-bskupadd","+ přidat setkání nebo skupinu")}</div>${bojBestDl()}${bojBestiar()}</details>`:""}}
/* cíle boje: počitadla (2/5), termín do kola N, viditelnost pro hráče */
function bojCile(s,gm){const L=(s.cile||[]).filter(c=>gm||c.ver);if(!L.length&&!gm)return "";const kolo=s.aktivni?(s.kolo||1):0;
  const row=c=>{const hot=c.cil?c.stav>=c.cil:false,zb=c.kolo?c.kolo-kolo:null,pro=c.kolo&&!hot&&kolo>c.kolo;
    return `<li class="bcl${hot?" bclok":pro?" bclx":""}"><span class="bcln">${hot?"✓ ":pro?"✗ ":""}${besc(c.n)}${c.ver||!gm?"":` <small ${btip("Vidí jen vypravěč")}>(skrytý)</small>`}</span>
      ${c.cil?`<span class="bclp">${gm?`<button type="button" class="gbtn ghost" data-bclm="${c.id}" aria-label="Ubrat">−</button>`:""}<b>${c.stav||0}</b>/${c.cil}${gm?`<button type="button" class="gbtn ghost" data-bclp="${c.id}" aria-label="Přidat">+</button>`:""}</span>`:gm?`<label class="bclchk"><input type="checkbox" data-bclh="${c.id}"${hot||c.stav?" checked":""}> splněno</label>`:c.stav?"✓":""}
      ${c.kolo?`<small class="bclk">${pro?`vypršelo v ${c.kolo}. kole`:`do ${c.kolo}. kola${s.aktivni?` · zbývá ${zb+1} ${zb+1===1?"kolo":zb+1<5?"kola":"kol"}`:""}`}</small>`:""}${gm?`<button type="button" class="bx" data-bcldel="${c.id}" aria-label="Smazat cíl">×</button>`:""}</li>`};
  return `<h4 class="bsph">Cíle boje</h4>${L.length?`<ul class="bcls">${L.map(row).join("")}</ul>`:""}${gm?`<details class="bpridej bcld"><summary>${bi("plus")} Přidat cíl</summary><form class="bclf" data-bclf><input name="n" placeholder="např. Udržet bránu, Zachránit rukojmí" required aria-label="Název cíle"><label>počet <input name="cil" type="number" min="1" max="99" placeholder="—" aria-label="Kolikrát (nepovinné)"></label><label>do kola <input name="kolo" type="number" min="1" max="99" placeholder="—" aria-label="Do kola (nepovinné)"></label><label class="bzrk"><input type="checkbox" name="ver" checked> vidí hráči</label><button class="gbtn">Přidat</button></form></details>`:""}`}
/* kostra aktivního boje: bloky se klíčem, překreslí se jen ty, jejichž obsah se změnil */
const BRC={};
/* kostra Boje (2026-10-18): nahoře pruh iniciativy, pod ním tři sloupce – vlevo karta (hráč: jeho postava, vypravěč: vybraný
   účastník, sám se přepne na toho, kdo je na tahu), uprostřed účastníci boje, vpravo herní záznam; na mobilu záložky */
/* rozvržení (2026-10-19): vlevo jeden široký sloupec se záložkami Karta · Nepřátelé · Družina, vpravo herní záznam;
   na mobilu je Záznam čtvrtá záložka. Poražení a prchající nepřátelé jsou sbalení pod seznamem. */
const BNEPR=`<div class="bstrana bsn"><div data-bk="obt"></div><div data-bkl="npc"></div><details class="bout" data-bout hidden><summary><span data-bk="npcxh"></span></summary><div data-bkl="npcx"></div></details><div data-bk="addn"></div></div>`,
  BDRUZ=`<div class="bstrana bsh"><div data-bk="hr"></div><div data-bk="cile"></div><div data-bk="spojH"></div><div data-bkl="spoj"></div><div data-bk="adds"></div></div>`;
const BKOSTRA=`<div class="bojakt bojgm"><div data-bk="hor"></div><div data-bk="ja"></div><div data-bk="head"></div><div data-bk="osa"></div><div data-bk="plos"></div>
  <div class="bojcols"><div class="bcolm"><div data-bk="tabs"></div><section class="bcol bcolk" data-bcol="k" aria-label="Karta"><div data-bk="det"></div><div data-bkl="detl"></div></section>
  <section class="bcol bcoln bjaside" data-bcol="n" aria-label="Nepřátelé">${BNEPR}</section><section class="bcol bcolh" data-bcol="h" aria-label="Družina">${BDRUZ}</section></div>
  <section class="bcol bcoll" data-bcol="l" aria-label="Herní záznam"><div data-bk="glog"></div></section></div></div>`;
/* hráč bez přihlášené postavy: postava se volí jednou na stránce Hra a pak je jeho */
const bojJaNeprihl=()=>`<span class="rsmall bjanep">Nejsi přihlášený za postavu. Na stránce <a href="#hra">Hra</a> se přihlas a zvol svou postavu – pak se tu objeví tvoje bojová karta.</span>`;
/* záznam se u hráče i vypravěče obnovuje: hody z karet (i hody hráčů z telefonu) každé 4 s, dokud je Boj otevřený */
let BGLP=null;
function bojGlogPoll(){if(BGLP)return;BGLP=true;hodyNacti().then(ch=>{if(ch&&curView==="boj")renderBoj()}).catch(()=>{})}
const BKOSTRA_H=`<div class="bojakt bojhrac"><div data-bk="hor"></div><div data-bk="head"></div><div data-bk="osa"></div><div data-bk="plos"></div>
  <div class="bojcols"><div class="bcolm"><div data-bk="tabs"></div><section class="bcol bcolk bjamain" data-bcol="k" aria-label="Moje karta"><div data-bk="ja"></div></section>
  <section class="bcol bcoln bjaside" data-bcol="n" aria-label="Nepřátelé">${BNEPR}</section><section class="bcol bcolh" data-bcol="h" aria-label="Družina">${BDRUZ}</section></div>
  <section class="bcol bcoll" data-bcol="l" aria-label="Herní záznam"><div data-bk="glog"></div></section></div></div>`;
/* záložky na mobilu: Karta / Účastníci / Záznam (na širší obrazovce jsou sloupce vedle sebe a záložky schované) */
let BTAB="k";
function bojTaby(s,gm,P0){const n=(P0.nepr||[]).length+(P0.spoj||[]).length+(s.hraci||[]).length,sel=gm?bojVybranaKarta(s):null,c=sel?bojJm(s,sel):"";
  const nN=(P0.nepr||[]).filter(o=>!bojOut(o)).length,nH=(s.hraci||[]).length+(P0.spoj||[]).length;
  return `<div class="btabs" role="tablist" aria-label="Části boje">${[["k",gm?(c?besc(c):"Karta"):"Moje karta"],["n",`Nepřátelé <small>${nN}</small>`],["h",`Družina <small>${nH}</small>`],["l","Záznam"]].map(([k,l])=>`<button type="button" role="tab" data-btab="${k}" aria-selected="${BTAB===k}">${l}</button>`).join("")}</div>`}
/* nepřítel mimo boj: poražený, prchající, vzdal se, houf bez pacholků */
const bojOut=o=>(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")||(o.druh==="houf"&&!(+o.pocet>0));
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("button[data-btab]");if(!b)return;BTAB=b.dataset.btab;const r=document.querySelector("#bojview .bojakt");if(r)r.dataset.btab=BTAB;
  document.querySelectorAll("#bojview [data-btab]").forEach(x=>x.setAttribute("aria-selected",x.dataset.btab===BTAB));const tb=r&&r.querySelector(".btabs"),y=tb?tb.getBoundingClientRect().top:0;if(y<0)window.scrollTo({top:window.scrollY+y-8})});
function bojJaKouzla(K){const kz=Object.assign({},K.kouzla||{},{seznam:kSeznam(K)});if(!(kz.seznam||[]).length)return "";const sl=kSloty(K);
  return `<details class="bjapd bjakz" data-otv="ja-kz"${BOTV.has("ja-kz")?" open":""}><summary>Kouzla – ${sl.map(q=>`${q.st}. st. ${q.max-q.u}/${q.max}`).join(", ")||"triky"} · SO ${kz.dc}, útok ${bsg(+kz.utok||0)}</summary>
    ${[0,1,2,3,4,5,6,7,8,9].filter(l=>kz.seznam.some(x=>x.st===l)).map(l=>`<p class="bjakzl"><i>${l?l+". st.":"triky"}</i> ${kz.seznam.map((x,i)=>[x,i]).filter(([x])=>x.st===l).map(([x,i])=>`<span class="bjakzs"><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button>${x.kon?"◎":""}${kPzZn(x)}${kSesHtml(K,x,i)}</span>`).join("")}</p>`).join("")}</details>`}
function bojBlok(root,k,h){if(BRC[k]===h)return false;const el=root.querySelector(`[data-bk="${k}"]`);if(!el)return false;el.innerHTML=h;BRC[k]=h;return true}
function bojSeznam(el,items){const tpl=document.createElement("template");let prev=null;const nech=new Set(items.map(x=>x[0]));
  [...el.children].forEach(c=>{if(!nech.has(c.dataset.bnpc))c.remove()});
  for(const [id,h] of items){let cur=[...el.children].find(c=>c.dataset.bnpc===id);
    if(!cur||cur.__h!==h){tpl.innerHTML=h;const nw=tpl.content.firstElementChild;nw.__h=h;if(cur)cur.replaceWith(nw);cur=nw}
    const want=prev?prev.nextElementSibling:el.firstElementChild;if(want!==cur)el.insertBefore(cur,want);prev=cur}}
function renderBoj(){try{bojHistZapis()}catch(e){}
  /* vypravěč: momentum se změnilo (životy postav na kartách) – zapsat do stavu boje, ať ho vidí i hráči */
  if(GMV&&BOJ.s&&BOJ.s.aktivni&&!renderBoj.mt){try{const M=bojMomentum0(BOJ.s),o=BOJ.s.mom;if(M.pH!=null&&M.pN!=null&&(!o||o.m!==M.m||o.h!==Math.round(M.pH*100)||o.n!==Math.round(M.pN*100))){renderBoj.mt=setTimeout(()=>{renderBoj.mt=0;bojZmen(()=>{},true)},400)}}catch(e){}}
  const box=document.getElementById("bojview");if(!box)return;if(GMV&&!KSPD)kSpNacti().catch(()=>{});bttHide();
  const pg0=box.querySelector(".bpravidla .bprg"),ps=pg0?pg0.scrollTop:0,obnovPr=()=>{const pg=box.querySelector(".bpravidla .bprg");if(pg)pg.scrollTop=ps};
  if(!bojDB){box.innerHTML=`<h2 class="arttitle">Boj</h2><p class="intro">Tracker iniciativy funguje na webu napojeném na databázi.</p>${bojPravidla()}`;obnovPr();return}
  const s=BOJ.s;
  if(s&&(s.aktivni||s.priprava))BOJ.prip=0;
  if((!s||(!s.aktivni&&!s.priprava))&&GMV&&!BOJ.prip&&BOJ.v!==-1){BOJ.prip=1;bojZmen(z=>bojNovaPriprava(z),true);return}
  if(!s||(!s.aktivni&&!s.priprava)){if(GMV)return;const sy=window.scrollY;box.innerHTML=`<h2 class="arttitle">Boj</h2><p class="intro">Právě neprobíhá žádný boj. Až ho vypravěč zahájí, objeví se tu sloty iniciativy.</p>${bojDbmMimo()}${bojPravidla()}`;if(box.querySelector(".bdm")){window.scrollTo(0,sy);try{bdmLepky()}catch(e){}}obnovPr();bojWake();return}
  const ae=document.activeElement,f=ae&&box.contains(ae)&&ae.matches("input,select,textarea")?ae.name||ae.id:null,ss=ae&&ae.selectionStart!=null&&ae.type!=="number"?ae.selectionStart:null,fv=f&&ae.matches("input:not([type=checkbox]):not([type=radio]),textarea")?ae.value:null;
  const sx=(box.querySelector(".bsloty")||{}).scrollLeft||0,kk=`${s.kolo}:${s.tah}`;
  let root=box.querySelector(":scope > .bojakt");
  if(!root){box.innerHTML=(GMV?BKOSTRA:BKOSTRA_H)+`<div class="bojprav">${bojPravidla()}</div>`;root=box.querySelector(".bojakt");for(const k in BRC)delete BRC[k];BRC.krit=bojKritPanel()}
  else{const kp=bojKritPanel();if(BRC.krit!==kp){const el=box.querySelector(".bojprav .bkrit");if(el)el.outerHTML=kp;BRC.krit=kp}}
  /* nový tah: karta toho, kdo je na tahu, se ukáže (vypravěč; hráč, když je na tahu on) */
  if(s.aktivni&&BOJ.tk0!==kk){const prvni=BOJ.tk0==null;BOJ.tk0=kk;const ja=((s.hraci||[]).find(h=>h.n===bojJa.get())||{}).id;if(!prvni&&(GMV||(ja&&(s.obsazeni||{})[s.tah]===ja))&&BTAB!=="l")BTAB="k"}
  const P=bojAktivni();P.cile=bojCile(s,GMV&&!!bojDB);{const nx=(P.npcx||[]).length;P.npcxh=nx?`Poražení a prchající <small>${nx}</small>`:"";const bo=root.querySelector("[data-bout]");if(bo){bo.hidden=!nx;if(bo.open!==!!BOJ.outOtv)bo.open=!!BOJ.outOtv;if(!bo.dataset.t){bo.dataset.t=1;bo.addEventListener("toggle",()=>{BOJ.outOtv=bo.open})}}}
  for(const k of ["hor","ja","head","osa","plos","tabs","det","hr","cile","spojH","adds","glog","obt","addn","npcxh"])bojBlok(root,k,P[k]||"");
  bojSeznam(root.querySelector('[data-bkl="spoj"]'),P.spoj);bojSeznam(root.querySelector('[data-bkl="npc"]'),P.npc);{const nx=root.querySelector('[data-bkl="npcx"]');if(nx)bojSeznam(nx,P.npcx||[])}{const dl=root.querySelector('[data-bkl="detl"]');if(dl)bojSeznam(dl,P.detl||[])}obnovPr();
  root.classList.toggle("bojprip",!s.aktivni);if(BTAB==="u")BTAB="n";
  root.dataset.btab=BTAB;
  const tr=box.querySelector(".bsloty");if(tr){if(kk!==BOJ.rk){BOJ.rk=kk;const c=tr.querySelector(".btah");tr.scrollLeft=c?Math.max(0,c.offsetLeft-(tr.clientWidth-c.offsetWidth)/2):0}else tr.scrollLeft=sx}
  if(f&&!(ae&&ae.isConnected)){const e=box.querySelector(`[name="${f}"]`)||(/^[A-Za-z][\w-]*$/.test(f)?box.querySelector("#"+f):null);if(e){if(fv!=null&&e.value!==fv)e.value=fv;e.focus();if(ss!=null)try{e.setSelectionRange(ss,ss)}catch(x){}}}
  try{bdmLepky()}catch(e){}
  bojUpozorni();bojWake();bojGlogPoll();if(!GMV&&s.aktivni){try{bojKonHlidej(s,(s.hraci||[]).find(h=>h.n===bojJa.get()))}catch(e){}try{bojZasahHlidej(s,(s.hraci||[]).find(h=>h.n===bojJa.get()))}catch(e){}}
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-bdruz]");if(!b)return;const fh=document.getElementById("bfh");if(!fh)return;
  const vzor=fh.querySelector(".bsr");fh.innerHTML="";PARTY.forEach(p=>{const r=vzor.cloneNode(true);r.querySelector('[name="hn"]').value=p.n;fh.appendChild(r)});bojObtForm()});
/* upozornění hráče, když jeho postava přijde na tah: vibrace, zvýraznění, titulek a hláška */
function bojUpozorni(){
  const s=BOJ.s;if(GMV||!s||!s.aktivni){document.title=document.title.replace(/^⚔ Na tahu! · /,"");return}
  const ja=((s.hraci||[]).find(h=>h.n===bojJa.get())||{}).id,naTahu=ja&&(s.obsazeni||{})[s.tah]===ja,klic=`${s.kolo}:${s.tah}`;
  document.title=document.title.replace(/^⚔ Na tahu! · /,"");
  const dalsi=ja&&!naTahu&&(s.obsazeni||{})[(s.tah||0)+1]===ja;
  if(dalsi&&bojHlasen!==klic+":d"&&bojHlasen!==klic){bojHlasen=klic+":d";try{navigator.vibrate&&navigator.vibrate(140)}catch(e){}mmHlas("Jsi další na řadě – připrav si tah.",4000);return}
  if(!naTahu)return;
  document.title="⚔ Na tahu! · "+document.title;
  if(bojHlasen===klic)return;bojHlasen=klic;BTABH[ja]="utok";
  try{navigator.vibrate&&navigator.vibrate([250,120,250,120,400])}catch(e){}
  const me=(s.hraci||[]).find(h=>h.id===ja),pr=me?bojPripominky(s,me).filter(x=>!/^Reakce je k dispozici/.test(x)&&!Object.values(BPROS).some(q=>q[3]===x)):[];
  mmHlas(`${bojJa.get()}, jsi na tahu!${pr.length?" "+pr.slice(0,2).join(" "):""}`,pr.length?9000:6000);mmNotif("Jsi na tahu!",bojJa.get());
  const el=document.querySelector(".bslot.bmujtah");if(el)el.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
}
/* hráč: během boje drž obrazovku telefonu rozsvícenou */
const BWL={l:null,ceka:false};
async function bojWake(){const chci=!GMV&&!!(BOJ.s&&BOJ.s.aktivni)&&curView==="boj"&&document.visibilityState==="visible"&&!!(navigator.wakeLock&&navigator.wakeLock.request);
  if(chci&&!BWL.l&&!BWL.ceka){BWL.ceka=true;try{BWL.l=await navigator.wakeLock.request("screen");BWL.l.addEventListener("release",()=>{BWL.l=null})}catch(e){}BWL.ceka=false}
  else if(!chci&&BWL.l){const l=BWL.l;BWL.l=null;try{await l.release()}catch(e){}}}
document.addEventListener("visibilitychange",()=>{bojWake()});addEventListener("hashchange",()=>setTimeout(bojWake,50));
function bojStart(){
  /* boj, karty i hody hlídá puls (25-puls.js); na stránce Boj se bez Realtime ptá častěji */
  if(BOJ.poll)return;BOJ.poll=true;pulsStart();
}
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("input[data-ju]")&&/^(hod|d)$/.test(t.dataset.ju)&&curView==="boj"){BJU[t.dataset.ju]=t.value;renderBoj()}});
const bojJaZas=(c,hod,d,krit)=>!c||c.ac==null||hod===""||hod==null||isNaN(+hod)?null:krit?"kritický zásah":+d===1?"vedle":+hod>=c.ac?"zásah":"vedle";
const bojPridejNpc=(s,rows,str)=>{s.npc=s.npc||[];rows.forEach(x=>{s.nid=(s.nid||s.npc.length)+1;s.npc.push(bojNpc(x,"n"+s.nid,str))})};
document.addEventListener("change",e=>{const t=e.target;if(!t.matches||!t.matches('#bojview .bzrf [name="krit"]'))return;const f=t.closest("form"),b=f.querySelector(".bzrobet"),card=t.closest("[data-bnpc]");
  if(!t.checked||!card){b.hidden=true;b.innerHTML="";return}const n=(BOJ.s.npc||[]).find(x=>x.id===card.dataset.bnpc),E=n&&bojEff(n),ZS=E&&bojZbrStav(n,E);if(!ZS)return;
  b.innerHTML=`<span>Obětovat zbroj? Kritický zásah se změní v běžný.</span>${ZS.d.filter(z=>z.u<z.max).map(z=>`<button type="button" class="gbtn ghost" data-bobet="${besc(z.k)}">${bikZb(z.k)}${z.k} <small>zbývá ${z.max-z.u}×</small></button>`).join("")}<button type="button" class="gbtn ghost" data-bobetne>Ne</button>`;b.hidden=false});
document.addEventListener("submit",e=>{
  if(e.target.matches&&e.target.matches("#bojview .bzbf")){e.preventDefault();const f=e.target.elements,pan=e.target.closest("[data-bhpan]");if(!pan)return;const n=f.n.value.trim().slice(0,40);if(!n)return;
    const z=f.z.value.trim().replace(/\s+/g,"").toLowerCase();if(z&&!/^\d{0,2}d\d{1,3}([+-]\d{1,2})?$/.test(z)){(GMV?mmHlasG:mmHlas)("Kostka zranění ve tvaru 1d8+3.",3000);return}
    const w={n,t:f.t.value};if(f.b.value!=="")w.b=Math.max(-5,Math.min(30,Math.round(+f.b.value)));if(z)w.z=z;if(f.drt.checked)w.drt=true;if(f.pru.checked)w.pru=true;if(f.dal.checked)w.dal=true;
    bojHracAkce(pan.dataset.bhpan,(h,zz)=>{zz.zbrane=zz.zbrane||{};zz.zbrane[h.n]=[...(zz.zbrane[h.n]||[]),w].slice(-12)},`Zbraň uložena: ${n}.`);return}
  if(e.target.matches&&e.target.matches("#bojview .bclf")){e.preventDefault();const f=e.target.elements,n=f.n.value.trim();if(!n)return;
    bojZmen(z=>{const c={id:"c"+Date.now().toString(36),n,stav:0,ver:f.ver.checked};if(+f.cil.value>0)c.cil=+f.cil.value;if(+f.kolo.value>0)c.kolo=+f.kolo.value;(z.cile=z.cile||[]).push(c)});return}
  if(e.target.matches&&e.target.matches("#bojview .beff")){e.preventDefault();const f=e.target,card=f.closest("[data-bnpc]");if(!card)return;const id=card.dataset.bnpc,g=k=>f.elements[k].value.trim();
    const st=g("st"),nm=g("n")||(st?(BSTI[st]||[0,st])[1].split(/ [–(]/)[0]:""),kdy=g("kdy");if(!nm){mmHlasG("Zadej název účinku.",2000);return}
    bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===id);if(!o)return;const ef={n:nm,kdy:kdy[0]==="k"?"kola":kdy,kolo:s.kolo||1,tah:s.tah||0};if(kdy[0]==="k")ef.k=+kdy.slice(1);if(st)ef.st=st;
      if(g("z")){ef.z=g("z");ef.t=g("t")||"Fire"}if(ef.st&&!(o.stav||[]).includes(ef.st))o.stav=[...(o.stav||[]),ef.st];if(ef.kdy==="konec"&&(s.obsazeni||{})[s.tah||0]!==id)ef.zac=0;(o.ef=o.ef||[]).push(ef)});return}
  if(e.target.matches&&e.target.matches("#bojview .bzrf")){e.preventDefault();const f=e.target,card=f.closest("[data-bnpc]");if(!card)return;const id=card.dataset.bnpc,n=(BOJ.s.npc||[]).find(x=>x.id===id),E=n&&bojEff(n);if(!E)return;
    const v=+f.elements.z.value||0,typ=f.elements.t.value,o={drt:f.elements.drt.checked,pru:f.elements.pru.checked},k=f.elements.k?+f.elements.k.value:0;
    const kdo=f.elements.kdo?f.elements.kdo.value:"",uS=f.elements.u.value.trim(),u=uS===""?null:+uS,ZS=bojZbrStav(n,E),kr=+n.kryt||0,AC=ZS.ac+kr,ACt=`AC ${AC}${kr?` s krytem +${kr}`:""}`,kpre=kdo?kdo+" → ":"";BKDO=kdo;const cim=f.elements.cim?f.elements.cim.value.trim():"";if(kdo)BCIM[kdo]=cim;const S=BOJ.s||{},kq=(S.hraci||[]).find(h=>h.n===kdo)||(S.npc||[]).find(x=>x.n===kdo),L0={n:cim||"útok",ai:kq?kq.id:null,an:kdo,ci:id};
    BZTL[id]={t:typ,drt:o.drt,pru:o.pru};
    if(v>0&&!(u!=null&&u<AC)){const D=BDMG[id];BDMG[id]={k:BOJ.s.kolo||1,t:[...(D&&D.k===(BOJ.s.kolo||1)?D.t:[]),typ]}}
    if(u!=null&&u<AC){bojLog(id,Object.assign({},L0,{res:"vedle",zt:`útok ${u} proti ${ACt} – vedle`}),n.n);bojZaz({a:kdo,ai:L0.ai,c:n.n,ci:id,cim,v:"vedle"});renderBoj();mmHlasG(`${kpre}${n.n}: útok ${u} proti ${ACt} – vedle.`,3000);return}
    if(v<=0){if(u!=null){bojLog(id,Object.assign({},L0,{res:"zasah",zt:`útok ${u} proti ${ACt} – zásah, zranění nezadáno`}),n.n);renderBoj();mmHlasG(`${kpre}${n.n}: útok ${u} proti ${ACt} – zásah. Zadej zranění.`,3500);const z=document.querySelector(`#bojview [data-bnpc="${id}"] .bzrf [name="z"]`);if(z)z.focus()}else mmHlasG("Zadej zranění.",2000);return}
    o.st=n.stav;const r=bojZasah(E,v,typ,o);if((n.stav||[]).includes("vzdal se"))mmHlasG(`Ozývá se svědomí: ${n.n} se vzdal. Zabít bezbranného je smrtelný hřích (Svědomí −1, proti vlastní Ctnosti −2).`,7000);
    const hp=bojHp.get(),a=hp[id]||[],old=a[k]!=null?a[k]:E.hp[k].max;bojUndoPush({hp:JSON.parse(JSON.stringify(hp))});a[k]=old-r.x;hp[id]=a;bojHp.set(hp);
    bojLog(id,Object.assign({},L0,{res:"zasah",ap:1,und:{id,k,old,nov:old-r.x},zt:u!=null?`útok ${u}`:"",zr:{t:r.x,x:`z ${v}${r.pozn.length?" → "+r.pozn.join(", "):""}`,zt:typ}}),n.n);
    bojZaz({a:kdo,ai:L0.ai,c:n.n,ci:id,cim,v:old-r.x<=0?"zásah, padl":"zásah"});bojHpZmena(id,k,old,old-r.x);renderBoj();mmHlasG(`${kpre}${n.n}: −${r.x} HP (${BZRT[typ]}${r.pozn.length?", "+r.pozn.join(", "):""}) → ${old-r.x}/${E.hp[k].max}`,3500);return}
  if(e.target.id==="bojform"){e.preventDefault();const f=e.target;
    const hraci=[...f.querySelectorAll('[name="hn"]')].map(x=>x.value.trim()).filter(Boolean).map((n,i)=>({id:"h"+(i+1),n}));
    if(!hraci.length){mmHlasG("Zadej aspoň jednoho hráče.");return}
    const nep=bojRadky(document.getElementById("bfn")),sp=bojRadky(document.getElementById("bfs"));
    bojKonecLS();BKON=false;
    bojZmen(s=>{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,{aktivni:true,kolo:1,tah:0,hraci,hod:+f.elements.hod.value,dm:+f.elements.dm.value,npc:[],obsazeni:{},kostka:null,nid:0});bojPridejNpc(s,nep);bojPridejNpc(s,sp,"h")});return}
  if(e.target.id==="bnadd"||e.target.id==="bnadds"){e.preventDefault();const f=e.target,rows=bojRadky({querySelectorAll:()=>[f]});if(!rows.length)return;
    bojZmen(s=>bojPridejNpc(s,rows,f.id==="bnadds"?"h":""))}
});
/* bestiář: vyhledávání, výběr jména ze seznamu, životy, počet v dosahu, úroveň družiny, kritické zranění */
document.addEventListener("input",e=>{
  const v=document.getElementById("bojview");if(!v||!v.contains(e.target))return;const t=e.target;
  if(t.matches("[data-bhledej]")){BHLED=t.value;const u=t.parentElement.querySelector("[data-bvysl]");if(u)u.innerHTML=bojVysl(BHLED);return}
  if(t.matches('[name="nn"]')){const row=t.closest(".bsr,.bnadd");if(row){const os=bojOsoba(t.value),p=os?PROTBY[os.b]:bojBest(t.value);if(p)bojNapoj(row,p,os);else if(!t.value.trim())bojNapoj(row,null)}}
  if(t.matches("[data-bhp]"))return; /* životy se zapisují až po Enter / opuštění pole (relativní zápis −12 / +5) */
  if(t.matches("[data-bdos]")){const card=t.closest("[data-bnpc]");if(card&&t.value!=="")BDOS[card.dataset.bnpc]=+t.value;return}
  if(t.matches("[data-bur]")){if(t.value){bojUr.set(Math.max(1,Math.min(20,+t.value)));bojObtForm();const el=v.querySelector(".bojgrid2 .bobt");if(el&&BOJ.s){el.innerHTML=bojObt((BOJ.s.npc||[]).filter(o=>!bojSpoj(o)),(BOJ.s.hraci||[]).length,true).html}}return}
  if(t.matches("[data-bkr]")){BKS.rany=+t.value||0;return}
  if(t.matches("[data-bzapt]")){BZAPT=t.value;return}
  if(t.matches("input[data-ju]")){BJU[t.dataset.ju]=t.value;if(/^(hod|d|dmg)$/.test(t.dataset.ju)){BJU.serie=null;BJU.kmin=null}return}
  if(t.matches("[data-jukon]")){BJK.d=t.value;const el=t.closest(".bjkon");if(el&&+t.value>0&&!el.querySelector("[data-jukonx]"))renderBoj();return}
  if(t.matches("[data-bkp]")){BKS.pod=+t.value||0;return}
  if(t.closest("#bojform"))bojObtForm();
});
let BHP0=null;
document.addEventListener("focusin",e=>{if(e.target.matches&&e.target.matches("#bojview [data-bhp]")){BHP0={hp:JSON.parse(JSON.stringify(bojHp.get())),v:e.target.value===""?+e.target.dataset.max:+e.target.value}}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches&&e.target.matches("#bojview [data-bhp]")){e.preventDefault();e.target.blur()}});
/* zápis životů: číslo nastaví, „−12“ / „-12“ odečte, „+5“ přičte; jde přes Zpět, záznam boje i Concentration */
function bojHpZapis(t){const card=t.closest("[data-bnpc]");if(!card||!BHP0)return;const id=card.dataset.bnpc,k=+t.dataset.bhp,mx=+t.dataset.max||1,old=BHP0.v,v=String(t.value).trim().replace(/−|–/g,"-");
  let nv;const r=v.match(/^([+-])\s*(\d+)$/),a=v.match(/^(\d+)$/);if(r)nv=old+(r[1]==="-"?-1:1)*+r[2];else if(a)nv=+a[1];else if(v==="")nv=mx;else{t.value=old;return}
  t.value=nv;if(nv===old)return;const o=bojHp.get(),arr=o[id]||[];bojUndoPush({hp:BHP0.hp});
  const n=((BOJ.s&&BOJ.s.npc)||[]).find(x=>x.id===id);
  if(n&&n.spol)bojZmen(z=>{const q=(z.npc||[]).find(x=>x.id===id);if(q)q.hpc=nv});  // společník hráče: životy sdílené s jeho kartou
  else{arr[k]=nv;o[id]=arr;bojHp.set(o)}
  if(n)bojLog(id,{n:"Životy",ai:null,ci:id,zt:`${old} → ${nv} (${nv-old>0?"+":"−"}${Math.abs(nv-old)})`},n.n);
  bojHpZmena(id,k,old,nv);BHP0={hp:JSON.parse(JSON.stringify(o)),v:nv};if(!(n&&n.spol))bojZmen(()=>{},true);renderBoj()}
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("#bojview [data-bhp]"))bojHpZapis(t)});
/* klávesy v Boji (vypravěč): mezerník další tah, Shift+mezerník zpět o slot, číslice + Enter zranění vybraného nepřítele, Ctrl+Z zpět */
let BSEL=null,BKBUF="",BKBT=0;
function bojVybrany(){const s=BOJ.s||{},npc=s.npc||[];if(BSEL&&npc.some(x=>x.id===BSEL))return npc.find(x=>x.id===BSEL);const ob=s.obsazeni||{},k=ob[s.tah];return npc.find(x=>x.id===k)||null}
function bojKlZraneni(v){const n=bojVybrany();if(!n){mmHlasG("Nejdřív klikni na kartu nepřítele.",2500);return}
  if(n.druh==="houf"){bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===n.id);if(o)o.pocet=Math.max(0,(o.pocet||0)-v)});mmHlasG(`${n.n}: padlo ${v}.`,2200);return}
  const E=bojEff(n);if(!E||!E.hp.length){mmHlasG(`${n.n} nemá statblock se životy.`,2500);return}
  const o=bojHp.get(),a=o[n.id]||[],old=a[0]!=null?a[0]:E.hp[0].max;bojUndoPush({hp:JSON.parse(JSON.stringify(o))});a[0]=old-v;o[n.id]=a;bojHp.set(o);
  bojHpZmena(n.id,0,old,old-v);renderBoj();mmHlasG(`${n.n}: −${v} HP (${old-v}/${E.hp[0].max}).`,2200)}
document.addEventListener("keydown",e=>{if(curView!=="boj"||!GMV||!bojDB||!(BOJ.s&&BOJ.s.aktivni))return;const t=e.target;
  if(t&&(t.isContentEditable||/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)))return;
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==="z"){e.preventDefault();bojZpet();return}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key===" "&&!e.shiftKey){const nv=document.querySelector("#bojview [data-bnavrh]");if(nv){e.preventDefault();nv.click();return}}
  if(e.key===" "){e.preventDefault();const b=document.querySelector(`#bojview [data-bact="${e.shiftKey?"zpet":"dalsi"}"]`);if(b&&!b.disabled)b.click();return}
  if(/^\d$/.test(e.key)){BKBUF=(BKBUF+e.key).slice(0,3);clearTimeout(BKBT);BKBT=setTimeout(()=>{BKBUF=""},4000);const n=bojVybrany();mmHlasG(`${n?n.n:"Vyber nepřítele"}: ${n&&n.druh==="houf"?"padlo":"zranění"} ${BKBUF} – Enter potvrdí, Esc zruší`,4000);return}
  if(e.key==="Enter"&&BKBUF){e.preventDefault();const v=+BKBUF;BKBUF="";if(v>0)bojKlZraneni(v);return}
  if(e.key==="Escape"&&BKBUF){BKBUF="";mmHlasG("Zrušeno.",1200);return}
  if(e.key==="Backspace"&&BKBUF){BKBUF=BKBUF.slice(0,-1);return}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&BPRAV&&curView==="boj"){const b=document.querySelector("#bojview .bprx");if(b)b.click()}});
document.addEventListener("keydown",e=>{if(e.key!=="Enter"||!e.target.matches||!e.target.matches("[data-bhledej]"))return;e.preventDefault();
  const b=e.target.parentElement.querySelector("[data-bbadd]");if(b)b.click()});
document.addEventListener("toggle",e=>{const d=e.target;if(!d.matches||!d.matches("details[data-otv]"))return;if(d.open)BOTV.add(d.dataset.otv);else BOTV.delete(d.dataset.otv)},true);
document.addEventListener("change",async e=>{
  const v=document.getElementById("bojview");if(!v||!v.contains(e.target))return;
  const s1=e.target.closest("[data-bskup]");if(s1&&s1.value){const R=bojSkupRadky(s1.value);s1.value="";if(!R)return;const box=document.getElementById("bfn");if(!box)return;
    box.innerHTML="";R.rows.forEach(x=>{box.insertAdjacentHTML("beforeend",bojNrow());bojPlnRadek(box.lastElementChild,x)});if(!R.rows.length)box.insertAdjacentHTML("beforeend",bojNrow());
    if(R.z||R.n){const l=v.querySelector(".bojlead");if(l)l.textContent=(R.n?R.n+". ":"")+(R.z||"")}bojObtForm();return}
  const s2=e.target.closest("[data-bskupadd]");if(s2&&s2.value){const R=bojSkupRadky(s2.value);s2.value="";if(R&&(R.rows.length||(R.cile||[]).length)){bojZmen(s=>bojSetkPouzij(s,R));const x=[R.rows.length?`${R.rows.length} ${R.rows.length===1?"nepřítel":R.rows.length<5?"nepřátelé":"nepřátel"}`:"",(R.cile||[]).length?`cíle ${R.cile.length}`:"",(R.prostr||[]).length&&BOJ.s&&BOJ.s.priprava?"prostředí":"",R.prekv&&BOJ.s&&BOJ.s.priprava?"přepadení":""].filter(Boolean);mmHlasG(`Načteno: ${x.join(", ")}.`,3500)}return}
  if(e.target.matches("[data-bhdsv]")){const pan=e.target.closest("[data-bhpan]"),d=+e.target.value;if(!pan||!(d>=1&&d<=20)){mmHlas("Zadej hod d20 (1–20).",2500);return}const id=pan.dataset.bhpan,h0=(BOJ.s.hraci||[]).find(x=>x.id===id);if(!bojDsAkt(h0))return;
    const r=bojDs(h0.ds,"hod",d);bojHracAkce(id,h=>{if(r.ds)h.ds=r.ds;else delete h.ds},`${h0.n}: hod proti smrti ${r.m}.`);return}
  const sl=e.target.closest("[data-bslot]");if(sl){const i=sl.dataset.bslot,val=sl.value;bojZmen(s=>{s.obsazeni=s.obsazeni||{};if(val)s.obsazeni[i]=val;else delete s.obsazeni[i]});return}
  const n=e.target.closest("[data-bnpc]"),upd=fn=>bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===n.dataset.bnpc);if(o)fn(o)});
  if(n&&e.target.matches("[data-bvel]")){upd(o=>{o.velitel=e.target.checked});return}
  if(n&&e.target.matches("[data-bvelsok]")){const val=e.target.value;upd(o=>{if(val)o.vel=val;else delete o.vel});return}
  if(n&&e.target.matches("[data-bpradd]")){const val=e.target.value;if(val)upd(o=>{o.pr=[...new Set([...(o.pr||[]),val])]});return}
  if(e.target.matches("[data-bkd]")){BKS.druh=e.target.value;BKS.vys="";return}
  if(e.target.matches("[data-bkkomu]")){BKS.komu=e.target.value;BKS.vys="";if(BKS.komu)BKS.rany=(bojKritPC()[BKS.komu]||[]).length;renderBoj();return}
  if(e.target.matches("[data-bauto]")){bojAuto.set(e.target.checked);if(e.target.checked)bojUtokyNove();renderBoj();return}
  if(e.target.matches("[data-juplos]")){BJU.plos=e.target.checked;renderBoj();return}
  if(e.target.matches("[data-jupol]")){BJU.pol=e.target.checked;return}
  if(e.target.matches("[data-kprib]")&&!e.target.closest("[data-kid]")){const K=bojKartaH((BOJ.s.hraci||[]).find(h=>h.n===bojJa.get()));if(K){const P=kPri(K).filter(x=>!/^Bardic /.test(x));kartaStavZmen(K.id,{pri:[...P,"Bardic "+e.target.value]}).then(()=>renderBoj())}return}
  if(e.target.matches("[data-juef][data-pri]")){const K=bojKartaH((BOJ.s.hraci||[]).find(h=>h.n===bojJa.get()));if(K)kPriTog(K,e.target.dataset.pri).then(()=>renderBoj());return}
  if(e.target.matches("[data-juef]")){const i=+e.target.dataset.juef;BJU.ef=e.target.checked?[...new Set([...BJU.ef,i])]:BJU.ef.filter(x=>x!==i);return}
  if(e.target.matches("[data-jucile]")){const id=e.target.dataset.jucile,mx=bojJaCilMax();if(e.target.checked&&mx&&BJU.cile.length>=mx&&!BJU.cile.includes(id)){e.target.checked=false;mmHlas(`Na tomto stupni nejvýš ${mx} ${mx===1?"cíl":mx<5?"cíle":"cílů"}.`,3000);return}BJU.cile=e.target.checked?[...new Set([...BJU.cile,id])]:BJU.cile.filter(x=>x!==id);return}
  if(e.target.matches("select[data-jusl]")){BJU.sl=e.target.value;BJU.serie=null;BJU.hod=BJU.d=BJU.dmg="";BJU.info="";renderBoj();return}
  if(e.target.matches("select[data-ju]")){const k=e.target.dataset.ju;if(k==="zi"&&/^k\d+$/.test(e.target.value)){bojJaZvolKouzlo(+e.target.value.slice(1));return}if(k==="zi")BJU.ks=null;BJU[k]=e.target.value;if(k==="zi"){const me=(BOJ.s.hraci||[]).find(h=>h.n===bojJa.get()),w=bojZbrVse(BOJ.s,me)[+BJU.zi];if(w&&BJU.zi!==""){BJU.t=w.t||BJU.t;BJU.drt=!!w.drt;BJU.pru=!!w.pru;BJU.dal=!!w.dal;const K0=w.karta&&bojKartaH(me);if(K0&&kJeZbran(K0,w.n)){KZBRV[K0.id]=w.n;BJU.zvAuto=w.n;kZbrvUloz()}}else{BJU.drt=BJU.pru=BJU.dal=false}}BJU.info="";renderBoj();return}
  if(e.target.matches('.bzrf [name="cim"]')){const f=e.target.form,kdo=f.elements.kdo?f.elements.kdo.value:"",h=((BOJ.s||{}).hraci||[]).find(x=>x.n===kdo),w=bojZbrVse(BOJ.s,h).find(x=>x.n===e.target.value.trim());if(w){if(w.t)f.elements.t.value=w.t;f.elements.drt.checked=!!w.drt;f.elements.pru.checked=!!w.pru}return}
  if(e.target.matches('.bzrf [name="kdo"]')){BKDO=e.target.value;const c=e.target.form&&e.target.form.elements.cim;if(c)c.value=BCIM[BKDO]||"";return}
  if(e.target.matches("[data-bosud]")){const o=bojZaj.get();o[e.target.dataset.bosud]=e.target.value||1;bojZaj.set(o);BZAPT=null;renderBoj();return}
  if(e.target.matches("[data-bkor]")){const k=e.target.dataset.bkor;if(e.target.checked)BKORX.delete(k);else BKORX.add(k);BZAPT=null;renderBoj();return}
  if(e.target.matches("[data-bzaj]")){BZAPT=null;const o=bojZaj.get();if(e.target.checked)o[e.target.dataset.bzaj]=1;else delete o[e.target.dataset.bzaj];bojZaj.set(o);renderBoj();return}
  if(e.target.matches("[data-bja]")){bojJa.set(e.target.value);bojHlasen="";renderBoj();return}
  if(e.target.matches("#bojview [data-bcil]")){const c=e.target.closest("[data-bnpc]");if(c){if(e.target.value)BCIL[c.dataset.bnpc]=e.target.value;else delete BCIL[c.dataset.bnpc];renderBoj()}return}
  if(e.target.matches("#bojview [data-bjr]")){const c=e.target.closest("[data-bnpc]");if(c){if(e.target.checked)BJR[c.dataset.bnpc]=1;else delete BJR[c.dataset.bnpc]}return}
  if(e.target.matches("[data-bclh]")){const id=e.target.dataset.bclh,v=e.target.checked?1:0;bojZmen(z=>{const c=(z.cile||[]).find(x=>x.id===id);if(c)c.stav=v});return}
  if(e.target.matches("[data-bprekv]")){const v=e.target.value;bojZmen(z=>{if(v)z.prekv=v;else delete z.prekv});return}
  if(e.target.matches("[data-bhn]")){const id=e.target.dataset.bhn,v=e.target.value.trim();bojZmen(z=>{const h=(z.hraci||[]).find(x=>x.id===id);if(h)h.n=v});return}
  if(e.target.matches("[data-bhhod]")&&GMV){const id=e.target.dataset.bhhod,v=e.target.value===""?null:+e.target.value;bojZmen(z=>{const h=(z.hraci||[]).find(x=>x.id===id);if(h)h.hod=v});return}
  if(e.target.matches("[data-bdm]")){const v=e.target.value===""?null:+e.target.value;bojZmen(z=>{z.dm=v});return}
  if(e.target.matches("[data-bjahod]")){const id=e.target.dataset.bjahod,v=+e.target.value;if(e.target.value===""||!bojDB||!bojDB.hod)return;
    try{await bojDB.hod(id,v);await bojNacti();renderBoj();mmHlas("Hod iniciativy zapsán.")}catch(err){mmHlas("Nepodařilo se zapsat: "+(err.message||err),5000)}return}
  const cl=e.target.closest("[data-bclaimsel]");if(cl&&cl.value){const hn=((BOJ.s.hraci||[]).find(h=>h.id===cl.value)||{}).n;if(hn&&!bojJa.get())bojJa.set(hn);try{await bojDB.obsad(+cl.dataset.bclaimsel,cl.value);await bojNacti();renderBoj();mmHlas("Slot je tvůj.")}catch(err){mmHlas("Nepodařilo se: "+err.message,6000);await bojNacti();renderBoj()}}
});
/* uložit rozestavené nepřátele jako hotové setkání (databáze) nebo skupinu (jen tento prohlížeč) */
/* co se k setkání uloží kromě nepřátel: cíle (bez stavu), prostředí, přepadení, úvod */
const bojSetkExtra=()=>{const s=BOJ.s||{};return {cile:(s.cile||[]).map(c=>{const o={n:c.n,ver:c.ver!==false};if(c.cil)o.cil=c.cil;if(c.kolo)o.kolo=c.kolo;return o}),prostr:bojPros(s).filter(k=>BPROS[k]),prekv:s.prekv||"",lead:String(s.lead||"").trim()}};
async function bojUlozSetkani(){const rows=document.getElementById("bfn")?bojRadky(document.getElementById("bfn")):((BOJ.s&&BOJ.s.npc)||[]).filter(o=>!bojSpoj(o)).map(o=>({n:o.n,druh:o.druh,pocet:o.max||o.pocet||1,b:o.b||"",pr:o.pr||[],os:o.os||""}));if(!rows.length){mmHlasG("Nejdřív vyplň nepřátele.");return}
  const jm=(prompt("Název setkání (např. Lapkové z Křivoklátska):")||"").trim();if(!jm)return;
  if(window.MMDB&&typeof edOtevri==="function"&&rows.every(x=>x.b)){
    const id=bojNorm(jm).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"setkani";
    const lin=rows.map(x=>{const p=PROTBY[x.b],base=x.os||x.b,nm=x.os?(OSPROT[x.os]||{}).n:p.n;return `  - ${x.n&&x.n!==nm?x.n+" = ":""}${p.u==="houf"?x.pocet+" ":""}${base}${(x.pr||[]).filter(i=>!(x.os&&(OSPROT[x.os].pr||[]).includes(i))).map(i=>" + "+i).join("")}`});
    const ex=bojSetkExtra();
    const md=`---\nid: ${id}\nnazev: ${jm}\nstitky: \n${ex.prostr.length?`prostredi: ${ex.prostr.map(k=>BPROS[k][1].toLowerCase()).join(", ")}\n`:""}${ex.prekv?`prekvapeni: ${ex.prekv==="h"?"družina":"nepřátelé"}\n`:""}nepratele:\n${lin.join("\n")}\n${ex.cile.length?`cile:\n${ex.cile.map(c=>"  - "+bojCilTxt(c)).join("\n")}\n`:""}---\n${ex.lead||"Situace a taktika."}\n`,tpl=EDDRUH.setkani.tpl;
    EDDRUH.setkani.tpl=()=>md;try{await edOtevri("setkani",id,true)}finally{EDDRUH.setkani.tpl=tpl}return}
  const ex=bojSetkExtra(),g=bojSkup();g[jm]=ex.cile.length||ex.prostr.length||ex.prekv||ex.lead?{np:rows,cile:ex.cile,prostr:ex.prostr,prekv:ex.prekv,lead:ex.lead}:rows;bojSkupUloz(g);const sel=document.querySelector("[data-bskup]");const box=document.querySelector("#bojform .bskup");
  if(box)box.innerHTML=`${bojSkupSel("data-bskup","Načíst setkání nebo skupinu…")}<button type="button" class="badd" data-bskupuloz>Uložit jako setkání</button><button type="button" class="badd" data-bskupdel>Smazat skupinu z prohlížeče…</button>`;
  mmHlasG(`Skupina „${jm}“ uložena v tomto prohlížeči${rows.some(x=>!x.b)?" (do databáze jde jen setkání, kde má každý nepřítel statblock)":""}.`,6000)}
document.addEventListener("click",async e=>{
  const v=document.getElementById("bojview");if(!v||!v.contains(e.target))return;const T=sel=>e.target.closest(sel);
  const dr=T("[data-bdelrow]");if(dr){const li=dr.closest(".bsr"),ol=li.parentElement;if(ol.children.length>1||ol.id==="bfs")li.remove();else li.querySelectorAll("input").forEach(i=>{if(i.name!=="np")i.value=""});bojObtForm();return}
  const add=T("[data-badd]");if(add){const k=add.dataset.badd;if(k==="h"){const box=document.getElementById("bfh"),r=box.lastElementChild.cloneNode(true);r.querySelector("input").value="";box.appendChild(r);r.querySelector("input").focus()}
    else{const box=document.getElementById(k==="s"?"bfs":"bfn");box.insertAdjacentHTML("beforeend",bojNrow(k==="s"?"Spojenec, např. Královský hejtman":""));box.lastElementChild.querySelector("input").focus()}return}
  const a=T("[data-bact]");
  if(a){const t=a.dataset.bact;
    if((t==="dalsi"||t==="kolo")&&!bojDalOk())return;
    if(t==="dalsi")bojZmen(s=>{const n=(s.sloty||bojSloty(s)).length;s.tah=(s.tah||0)+1;if(s.tah>=n){s.tah=n;mmHlasG("Konec kola – klikni na Nové kolo.")}});
    if(t==="zpet")bojZmen(s=>{s.tah=Math.max(0,(s.tah||0)-1)});
    if(t==="kolo")bojZmen(s=>{s.kolo=(s.kolo||1)+1;s.obsazeni={};s.tah=0;
      (s.cile||[]).forEach(c=>{const hot=c.cil?c.stav>=c.cil:!!c.stav;if(c.kolo&&!hot){if(s.kolo===c.kolo)mmHlasG(`Poslední kolo pro cíl: ${c.n}.`,5000);else if(s.kolo===c.kolo+1)mmHlasG(`Cíl nesplněn včas: ${c.n}.`,5000)}})});
    if(t==="konec"){if(PROTIVNICI.length){BKON=true;renderBoj();const k=v.querySelector(".bkonsh");if(k)k.scrollIntoView({block:"start",behavior:"smooth"})}
      else if(confirm("Ukončit boj? Sloty a přiřazení se smažou, jména hráčů zůstanou pro příští boj."))bojZmen(s=>{s.aktivni=false;s.obsazeni={}})}
    return}
  if(T("[data-bundo]")){bojZpet();return}
  const nv=T("[data-bnavrh]");if(nv){const nid=nv.dataset.bnavrh;bojZmen(s=>{s.obsazeni=s.obsazeni||{};s.obsazeni[s.tah||0]=nid});return}
  if(T("[data-bplosnew]")){const s=BOJ.s;BPLOS=BPLOS&&!BPLOS.src?null:{src:"",z:"",t:"Fire",ab:"AGI",dc:"",pol:true,cile:(s.npc||[]).filter(x=>!bojSpoj(x)).map(x=>x.id),vys:""};renderBoj();return}
  if(T("[data-bploszav]")){BPLOS=null;renderBoj();return}
  {const lg=T("[data-bplleg]");if(lg&&BPLOS){bojPlosLeg(lg.dataset.bplleg);return}}
  if(T("[data-bploshod]")&&BPLOS){const f=v.querySelector(".bplos");if(f){BPLOS.z=f.querySelector('[name="pz"]').value.trim();BPLOS.t=f.querySelector('[name="pt"]').value;BPLOS.ab=f.querySelector('[name="pa"]').value;BPLOS.dc=+f.querySelector('[name="pdc"]').value||"";BPLOS.pol=f.querySelector('[name="ppol"]').checked;BPLOS.st=[f.querySelector('[name="pst"]').value].filter(Boolean);BPLOS.op=f.querySelector('[name="pop"]').checked;
    BPLOS.cile=[...f.querySelectorAll("[data-bplc]:checked")].map(x=>x.dataset.bplc);BPLOS.dos={};f.querySelectorAll("[data-bpld]").forEach(x=>BPLOS.dos[x.dataset.bpld]=+x.value||0)}bojPlosHod();return}
  if(T("[data-bdmhod]")){bojZmen(z=>bojDmHod(z));return}
  const clp=T("[data-bclp]")||T("[data-bclm]");if(clp){const id=clp.dataset.bclp||clp.dataset.bclm,d=clp.dataset.bclp?1:-1;bojZmen(z=>{const c=(z.cile||[]).find(x=>x.id===id);if(c){c.stav=Math.max(0,Math.min(c.cil||99,(c.stav||0)+d));if(c.cil&&c.stav>=c.cil)mmHlasG(`Cíl splněn: ${c.n}.`,3500)}});return}
  const cld=T("[data-bcldel]");if(cld){bojZmen(z=>{z.cile=(z.cile||[]).filter(x=>x.id!==cld.dataset.bcldel);if(!z.cile.length)delete z.cile});return}
  if(T("[data-bstart]")){const s=BOJ.s||{},bh=bojBestHod(s),hr=(s.hraci||[]).filter(h=>String(h.n||"").trim());
    if(!hr.length){mmHlasG("Zadej aspoň jednu postavu.",3000);return}if(bh==null){mmHlasG("Chybí hod iniciativy družiny – zapiš aspoň jeden.",3500);return}if(s.dm==null||s.dm===""){mmHlasG("Chybí hod nepřátel – zapiš ho, nebo klikni na Hodit za nepřátele.",3500);return}
    bojKonecLS();BKON=false;bojZmen(z=>{z.hraci=(z.hraci||[]).filter(h=>String(h.n||"").trim());z.hod=bojBestHod(z);z.aktivni=true;delete z.priprava;delete z.lead;Object.assign(z,{kolo:1,tah:0,obsazeni:{},zac:Date.now()})});return}
  if(T("[data-bhadd]")){bojZmen(z=>{const ids=(z.hraci||[]).map(h=>+String(h.id).slice(1)||0);(z.hraci=z.hraci||[]).push({id:"h"+(Math.max(0,...ids)+1),n:"",hod:null})});return}
  const hd=T("[data-bhdel]");if(hd){bojZmen(z=>{z.hraci=(z.hraci||[]).filter(h=>h.id!==hd.dataset.bhdel)});return}
  if(T("[data-bhdruz]")){bojZmen(z=>{z.hraci=PARTY.map((p,i)=>({id:"h"+(i+1),n:p.n.replace(/^✦\s*/,""),hod:null}))});return}
  const rkb=T("[data-break]");if(rkb&&!rkb.disabled){const id=rkb.dataset.break;e.stopPropagation();bojZmen(z=>{z.reak=z.reak||{};if(z.reak[id])delete z.reak[id];else z.reak[id]=1;if(!Object.keys(z.reak).length)delete z.reak});return}
  if(T("[data-bzapn]")){BZAPT=null;renderBoj();return}
  if(T("[data-bodp]")&&!BODP){BODP=true;BZAPT=null;if(typeof hraPosun==="function")hraPosun(1);bojOdpVyzva();mmHlasG("Krátký odpočinek: herní čas +1 h, hráčům vyskočila výzva k odpočinku (kostky životů, zdroje).",5000);renderBoj();return}
  const kon=T("[data-bkon]");if(kon){const k=kon.dataset.bkon;if(k==="zpet"){BKON=false;renderBoj();return}
    const S0=BOJ.s||{},zap=BZAPT??bojZapisNavrh(S0),txt=bojShrn(S0).txt+`; trval ${S0.kolo||1} ${(S0.kolo||1)===1?"kolo":"kol"}`+((S0.cile||[]).length?"; cíle: "+S0.cile.map(c=>`${c.n} ${(c.cil?c.stav>=c.cil:c.stav)?"splněn":"nesplněn"}`).join(", "):"")+(BODP?"; poté krátký odpočinek (1 h)":"");BODP=false;BKON=false;await bojZmen(s=>{s.aktivni=false;s.obsazeni={}});bojKonecLS();
    if(k==="kron"){window.BOJ_SHRN=txt;window.BOJ_TEXT=zap;if(typeof zapisNovy==="function")zapisNovy()}return}
  if(T("[data-bskupuloz]")){bojUlozSetkani();return}
  if(T("[data-bskupdel]")){const g=bojSkup(),k=Object.keys(g);if(!k.length)return;const jm=(prompt("Kterou skupinu smazat?\n"+k.join("\n"))||"").trim();if(!g[jm])return;delete g[jm];bojSkupUloz(g);mmHlasG("Skupina smazána.");const sel=document.querySelector("[data-bskup]");if(sel)sel.outerHTML=bojSkupSel("data-bskup","Načíst setkání nebo skupinu…");return}
  const ed=T("[data-bedit]");if(ed){e.preventDefault();if(typeof edOtevri==="function")edOtevri(ed.dataset.bedruh||"protivnik",ed.dataset.bedit);return}
  const stt=T("[data-bstitek]");if(stt){e.preventDefault();const i=v.querySelector("[data-bhledej]");if(i){i.value=BHLED=stt.dataset.bstitek;const u=i.parentElement.querySelector("[data-bvysl]");if(u)u.innerHTML=bojVysl(BHLED);i.focus()}return}
  const ba=T("[data-bbadd]");if(ba){e.preventDefault();e.stopPropagation();const [k,id]=ba.dataset.bbadd.split(/:(.*)/s);
    const rows=k==="s"?(SETBY[id]?bojRozvin(SETBY[id].np):[]):k==="o"?bojRozvin([{os:id,pr:[]}]):PROTBY[id]?bojRozvin([{id,pr:[]}]):[];if(!rows.length)return;
    BHLED="";const hl=v.querySelector("[data-bhledej]");if(hl){hl.value="";const u=hl.parentElement.querySelector("[data-bvysl]");if(u)u.innerHTML="";hl.focus()}
    const fn=document.getElementById("bfn");
    if(fn){rows.forEach(x=>{let r=[...fn.querySelectorAll(".bsr")].find(q=>!q.querySelector('[name="nn"]').value.trim());if(!r){fn.insertAdjacentHTML("beforeend",bojNrow());r=fn.lastElementChild}bojPlnRadek(r,x)});
      if(k==="s"&&SETBY[id]){const l=v.querySelector(".bojlead");if(l)l.textContent=SETBY[id].n+". "+SETBY[id].x}
      bojObtForm();mmHlasG(`${rows.length>1?rows.length+" nepřátel":rows[0].n} – přidáno mezi nepřátele.`);return}
    if(BOJ.s&&(BOJ.s.aktivni||BOJ.s.priprava))bojZmen(s=>bojPridejNpc(s,rows));return}
  const kh=T("[data-bkhod]");if(kh){const p=kh.closest(".bkrit");if(p){BKS.druh=p.querySelector("[data-bkd]").value;BKS.rany=+p.querySelector("[data-bkr]").value||0;BKS.pod=+p.querySelector("[data-bkp]").value||0}bojKritHod();renderBoj();
    if(BKS.komu&&BKS.last){if(BOJ.s&&BOJ.s.aktivni){BKRLOG.push({komu:BKS.komu,t:BKS.last.t});const hq=(BOJ.s.hraci||[]).find(h=>h.n===BKS.komu);bojLog(hq?hq.id:"x",{n:"Kritické zranění",ai:null,ci:hq?hq.id:null,cn:BKS.komu,zt:BKS.last.t},BKS.komu)}const K=Object.assign({},bojKritPC());K[BKS.komu]=[...(K[BKS.komu]||[]),BKS.last];hraUloz({krit:K}).then(()=>{BKS.rany=K[BKS.komu].length;renderBoj()})}return}
  const kh2=T("[data-bkheal]");if(kh2&&BKS.komu){const j=+kh2.dataset.bkheal,K=Object.assign({},bojKritPC());K[BKS.komu]=(K[BKS.komu]||[]).filter((_,i)=>i!==j);if(!K[BKS.komu].length)delete K[BKS.komu];hraUloz({krit:K}).then(()=>{BKS.rany=(K[BKS.komu]||[]).length;renderBoj()});return}
  const kz=T("[data-bkritz]");if(kz){BKS.druh=kz.dataset.bkritz;BKS.vys="";const card=kz.closest("[data-bnpc]");{const L=card&&(BLOG[card.dataset.bnpc]||[])[0];if(L&&L.cilPC){BKS.komu=L.cilPC;BKS.rany=(bojKritPC()[L.cilPC]||[]).length}}BKS.kdo=card?"zásah od: "+(card.querySelector(".bnn b")||{}).textContent:"";BPRAV=true;renderBoj();const k=v.querySelector(".bkrit");if(k){k.scrollIntoView({block:"center",behavior:"smooth"});const i=k.querySelector("[data-bkr]");if(i)i.focus()}return}
  if(T("[data-bprav]")){BPRAV=!BPRAV;v.querySelectorAll(".bpravidla").forEach(a=>a.classList.toggle("open",BPRAV));v.querySelectorAll(".bprtg").forEach(b=>b.setAttribute("aria-expanded",BPRAV));if(BPRAV){const x=v.querySelector(".bprx");if(x)x.focus({preventScroll:true})}return}
  const bpo=T("[data-bupot]");if(bpo){bojUtokPotvrd(bpo.dataset.bupot);return}
  const bza=T("[data-buzam]");if(bza){bojUtokPotvrd(bza.dataset.buzam,true);return}
  const blf=T("[data-blf]");if(blf){BLF=BLF===blf.dataset.blf?"":blf.dataset.blf;renderBoj();return}
  if(T("[data-blfx]")){BLF="";renderBoj();return}
  const blz=T("[data-blzpet]");if(blz){bojLogZpetSem(+blz.dataset.blzpet);return}
  const bzv=T("[data-bzvrat]");if(bzv){bojVratCas(+bzv.dataset.bzvrat,bzv.dataset.p);return}
  const blu=T("[data-blund]");if(blu){bojLogZpet(+blu.dataset.blund);return}
  const jad=T("[data-juadv]");if(jad){BJU.adv=jad.dataset.juadv;renderBoj();return}
  const jkp=T("[data-kdice]");if(jkp&&!jkp.closest("[data-kid]")){const K=bojKartaH(((BOJ.s||{}).hraci||[]).find(h=>h.n===bojJa.get()));if(K)kPriTog(K,jkp.dataset.kdice).then(()=>renderBoj());return}
  if(T("[data-juhod]")){bojJaHod();return}
  if(T("[data-juposl]")){bojJaPosli();return}
  const zbd=T("[data-bzbdel]");if(zbd){const pan=zbd.closest("[data-bhpan]");if(pan){const j=+zbd.dataset.bzbdel;bojHracAkce(pan.dataset.bhpan,(h,z)=>{const a=((z.zbrane||{})[h.n]||[]).filter((_,i)=>i!==j);z.zbrane=z.zbrane||{};if(a.length)z.zbrane[h.n]=a;else delete z.zbrane[h.n]})}return}
  if(T("[data-jukonh]")){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),K=bojKartaH(me),dc=BJK.d?bojKonDC(BJK.d):null;if(K&&dc){BJK.d="";kKonHod(K,dc).then(()=>renderBoj())}return}
  const jkx=T("[data-jukonx]");if(jkx){const pan=jkx.closest("[data-bhpan]"),ne=jkx.dataset.jukonx==="ne";BJK.d="";if(ne&&pan)bojHracAkce(pan.dataset.bhpan,h=>{h.stav=(h.stav||[]).filter(x=>x!=="soustředí");if(!h.stav.length)delete h.stav},"Soustředění ztraceno.");else renderBoj();return}
  const kzr=T("[data-bkzr]");if(kzr){const pan=kzr.closest("[data-bhpan]"),id=pan&&pan.dataset.bhpan,S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===id),K=bojKartaH(h0);if(!K)return;
    const v=Math.round(+((pan.querySelector("[data-bkzrv]")||{}).value||0)),typ=(pan.querySelector("[data-bkzrt]")||{}).value||"Slashing",k=kzr.dataset.bkzr;if(!(v>0)){(GMV?mmHlasG:mmHlas)("Zadej počet HP.",2000);return}
    if(k==="z"){bojPCZmena(id,o=>bojZranPC(o,K,v,typ,false));return}
    const ks=kartaStav(K.id),o={hp:ks.hp,thp:ks.thp,ds:h0.ds?JSON.parse(JSON.stringify(h0.ds)):undefined};
    if(k==="l"){const m=bojLecPC(o,K,v);kartaStavZmen(K.id,{hp:o.hp!=null&&o.hp<kHPmax(K)?o.hp:null},`${h0.n}: ${m}.`);if(JSON.stringify(o.ds??null)!==JSON.stringify(h0.ds??null))bojHracAkce(id,h=>{if(o.ds)h.ds=o.ds;else delete h.ds});if(GMV)bojLog(id,{n:"Léčení",ai:null,ci:id,zt:m},h0.n)}
    else{const t=Math.max(+ks.thp||0,v);kartaStavZmen(K.id,{thp:t},`${h0.n}: dočasné HP ${t}.`)}return}
  const kzh=T("[data-bkzh]");if(kzh){const pan=kzh.closest("[data-bhpan]"),id=pan&&pan.dataset.bhpan,S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===id),K=bojKartaH(h0);if(!K)return;
    const ab=kzh.dataset.bkzh,adv=!!kzh.dataset.adv,b=kZach(K,ab)-2*kVycerp(K),d1=bK(20),d2=adv?bK(20):null,d=adv?Math.max(d1,d2):d1,t=d+b;
    let txt=`${h0.n}: záchrana ${ab} ${t} (d20 ${d1}${d2!=null?` / ${d2}, výhoda`:""} ${bsg(b)})`;
    if(adv&&!GMV&&BJK.d){const dc=bojKonDC(BJK.d),ok=t>=dc;txt+=` → SO ${dc}: ${ok?"soustředění udrženo":"soustředění ztraceno"}`;BJK.d="";if(!ok)bojHracAkce(id,h=>{h.stav=(h.stav||[]).filter(x=>x!=="soustředí");if(!h.stav.length)delete h.stav});else renderBoj()}
    if(GMV){bojLog(id,{n:`Záchrana ${ab}`,ai:id,zt:txt.replace(/^[^:]*:\s*/,"")},h0.n);renderBoj()}(GMV?mmHlasG:mmHlas)(txt,7000);return}
  const kzd=T("[data-bkzd]");if(kzd){const pan=kzd.closest("[data-bhpan]"),id=pan&&pan.dataset.bhpan,S=BOJ.s||{},K=bojKartaH((S.hraci||[]).find(x=>x.id===id));if(!K)return;const k=kzd.dataset.bkzd,j=+kzd.dataset.j,U=Object.assign({},kartaStav(K.id).zdr||{}),u=U[k]||0;U[k]=u>j?j:j+1;if(!U[k])delete U[k];kartaStavZmen(K.id,{zdr:Object.keys(U).length?U:null});return}
  const pcz=T("[data-bpcz]");if(pcz){const id=pcz.dataset.bpcz,S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===id),K=bojKartaH(h0);if(!h0||!K)return;const v=+pcz.dataset.z,typ=pcz.dataset.t||"Slashing",kr=!!pcz.dataset.k;
    pcz.disabled=true;if(pcz.dataset.bpczt)BPCZ.add(+pcz.dataset.bpczt);const msg=bojPCZmena(id,o=>bojZranPC(o,K,v,typ,kr,{drt:!!pcz.dataset.drt,pru:!!pcz.dataset.pru}));bojZaz({a:"",c:h0.n,ci:id,cim:"",v:String(msg||"").replace(/\s*\(\d+\/\d+\)/,"")});return}
  const hk=T("[data-bhkarta]");if(hk){const K=KARTBY[hk.dataset.bhkarta];if(!K)return;bojZmen(z=>{const a=z.hraci=z.hraci||[];const ex=a.find(h=>h.n===K.n||!h.n);if(ex){ex.n=K.n;ex.k=K.id}else{const ids=a.map(h=>+String(h.id).slice(1)||0);a.push({id:"h"+(Math.max(0,...ids)+1),n:K.n,k:K.id,hod:null})}});return}
  const hin=T("[data-bhini]");if(hin){const id=hin.dataset.bhini,S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===id),K=bojKartaH(h0);if(!K)return;const d=bK(20),v=d+(kIni(K));
    if(GMV)bojZmen(z=>{const h=(z.hraci||[]).find(x=>x.id===id);if(h)h.hod=v});else if(bojDB&&bojDB.hod){try{await bojDB.hod(id,v);await bojNacti();renderBoj()}catch(err){mmHlas("Nepodařilo se zapsat: "+(err.message||err),4000);return}}
    (GMV?mmHlasG:mmHlas)(`${h0.n}: iniciativa d20 ${d} ${bsg(kIni(K))} = ${v}`,4000);return}
  if(bojHracKlik(T))return;
  if(T("[data-bted]")){const id2=T("[data-bted]").dataset.bted;bojVyber(id2);BTAB="k";renderBoj();setTimeout(()=>{const c=document.querySelector(`[data-bhcard="${CSS.escape(id2)}"],[data-bnpc="${CSS.escape(id2)}"]`);if(c)c.scrollIntoView({block:"start",behavior:"smooth"})},60);return}
  const hrz=T("[data-bhrozb]");if(hrz){const id=hrz.dataset.bhrozb,c=hrz.closest("[data-bhcard]");if(c){bojVyber(c.classList.contains("bopen")?null:id);if(!c.classList.contains("bopen"))BTAB="k"}else if(BHROTV.has(id))BHROTV.delete(id);else BHROTV.add(id);renderBoj();return}
  const dsf=T("[data-bdsf]");if(dsf){const id=dsf.dataset.bdsf,k=+dsf.dataset.k||1,h0=((BOJ.s||{}).hraci||[]).find(x=>x.id===id);if(!h0||!bojDsAkt(h0)){mmHlasG("Postava už není na prahu smrti.",2500);return}
    const r=bojDs(h0.ds,"n",k);dsf.disabled=true;bojHracAkce(id,h=>{h.ds=r.ds},`${h0.n}: zásah v bezvědomí – ${k===1?"neúspěch":"dva neúspěchy"} hodu proti smrti${r.m?" → "+r.m:""}.`);return}
  const pro=T("[data-bpros]");if(pro&&GMV){const k=pro.dataset.bpros;bojZmen(z=>{const a=z.prostr||[];z.prostr=a.includes(k)?a.filter(x=>x!==k):[...a,k];if(!z.prostr.length)delete z.prostr});return}
  const n=T("[data-bnpc]");if(!n){
    const c=T("[data-bclaim]");
    if(c){const s=BOJ.s,jed=new Set(Object.values(s.obsazeni||{})),free=(s.hraci||[]).filter(h=>!jed.has(h.id));
      if(!free.length){mmHlas("Všechny postavy už v tomto kole jednaly.");return}
      c.outerHTML=`<select data-bclaimsel="${c.dataset.bclaim}" aria-label="Kdo bere slot"><option value="">Kdo bere slot?</option>${free.map(h=>`<option value="${h.id}">${besc(h.n)}</option>`).join("")}</select>`;
      const sel=v.querySelector(`[data-bclaimsel="${c.dataset.bclaim}"]`);if(sel)sel.focus()}
    return}
  const id=n.dataset.bnpc,upd=fn=>bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===id);if(o)fn(o,s)}),o0=(BOJ.s.npc||[]).find(x=>x.id===id);BSEL=id;
  if(T("[data-brozb]")){bojVyber(n.classList.contains("bopen")?null:id);if(!n.classList.contains("bopen"))BTAB="k";renderBoj();return}
  if(T("[data-bstav]")){const t=T("[data-bstav]").dataset.bstav;upd(o=>{o.stav=o.stav||[];if(t==="prchá"&&o.stav.includes(t)&&o.druh==="houf")o.morOk=o.pocet||1;o.stav=o.stav.includes(t)?o.stav.filter(x=>x!==t):[...o.stav,t]});return}
  if(T("[data-btmsgx]")){delete BTMSG[id];renderBoj();return}
  const efd=T("[data-befdel]");if(efd){const j=+efd.dataset.befdel;upd(o=>{const e=(o.ef||[])[j];if(e)bojEfDel(o,e)});return}
  const rch=T("[data-brch]");if(rch){const R=BRCH[id]=BRCH[id]||{},k=rch.dataset.brch;if(R[k])delete R[k];else R[k]=1;renderBoj();return}
  const bnp=T("[data-bnp]");if(bnp&&o0){const k=bnp.dataset.bnp;BNP[id]=BNP[id]===k?"":k;renderBoj();return}
  const bcb=T("[data-bcilb]");if(bcb&&o0){const c=bcb.dataset.bcilb;if(BCIL[id]===c)delete BCIL[id];else BCIL[id]=c;renderBoj();return}
  const bov=T("[data-bover]");if(bov&&o0){const ab=bov.dataset.bover,E=bojEff(o0),p=E&&E.p,b=bojAbil(p,ab)||0;
    const ef=(o0.stav||[]).some(k=>SRDST[k]&&/nevýhod/i.test(SRDST[k].t||"")&&/ověřen/i.test(SRDST[k].t||"")),d1=bK(20),d2=ef?bK(20):null,d=ef?Math.min(d1,d2):d1,t=d+b;
    const o={n:`Ověření ${ab}`,hod:{tot:t,d,b,pres:0,krit:false,mis:false,adv:ef?-1:0,dd:d2!=null?[d1,d2]:null,advWhy:ef?"stav":""},sav:"ověření"};
    if(o0.druh!=="houf"){const z=bojZavoj(Object.assign({},p,{str:bojSpoj(o0)?"h":"n"}));o.zav=bojZavObj(p,z)}bojLog(id,o,o0.n);renderBoj();return}
  const zch=T("[data-bzach]");if(zch&&o0){const ab=zch.dataset.bzach,E=bojEff(o0),p=E&&E.p,b=bojSaveB(p,ab),inp=n.querySelector("[data-bzdc]"),dc=inp&&+inp.value||0;if(dc)BZDC[id]=dc;
    const ef=(o0.stav||[]).map(k=>SRDST[k]&&SRDST[k].zach&&SRDST[k].zach[ab]?[k,SRDST[k].zach[ab]]:null).filter(Boolean),fail=ef.find(x=>x[1]==="f"),va=ef.some(x=>x[1]==="a")-ef.some(x=>x[1]==="d");
    const d1=bK(20),d2=va?bK(20):null,d=va>0?Math.max(d1,d2):va<0?Math.min(d1,d2):d1,t=d+b;
    const ok=fail?false:dc?t>=dc:null,o={n:`Záchrana ${ab}${dc?` DC ${dc}`:""}`,hod:{tot:t,d,b,pres:0,krit:false,mis:false,adv:va,dd:d2!=null?[d1,d2]:null,advWhy:ef.map(x=>x[0]).join(", ")},sav:fail?`automaticky neúspěch (${fail[0]})`:ok==null?"záchrana":ok?"úspěch":"neúspěch"};
    if(ok===false&&bojLegZb(o0,E))o.leg=bojLegZb(o0,E);bojLog(id,o,o0.n);renderBoj();return}
  if(T("[data-blegod]")&&o0){const E=bojEff(o0),zn=bojLegN(E),z=bojZdr.get(),u=(z[id]=z[id]||{});u[zn]=(u[zn]||0)+1;bojZdr.set(z);const L=(BLOG[id]||[])[0];if(L){L.sav="úspěch (Leg. odolnost)";delete L.leg}mmHlasG(`${o0.n}: Legendární odolnost – záchrana se mění v úspěch (zbývá ${bojLegZb(o0,E)}).`,4000);renderBoj();return}
  const pls=T("[data-bplos]");if(pls&&o0){const E=bojEff(o0),a=E&&E.at[+pls.dataset.bplos];if(!a)return;const av=bojUtokV(o0,+pls.dataset.bplos,a),m=String(av.dc||"").match(/(STR|AGI|CON|INT|WIS|CHA)\D*(\d+)/),ty=bojTypy(av);
    const s=BOJ.s,sp=bojSpoj(o0);const AS=bojAkceStav(a.n,[a.p,av.p,av.zt].filter(Boolean).join(" "));BPLOS={src:`${o0.n}: ${a.n}`,srcId:id,z:av.z||"",t:ty[0]||"Fire",ab:m?m[1]:"AGI",dc:m?+m[2]:"",pol:!!av.z&&(/polovin/i.test((av.p||"")+(av.zt||""))||!!av.dc),st:AS?AS.st:[],op:!!(AS&&AS.op),k:AS?AS.k:10,cile:[...(sp?[]:(s.hraci||[]).map(h=>h.id)),...(s.npc||[]).filter(x=>x.id!==id&&bojSpoj(x)!==sp).map(x=>x.id)],vys:""};renderBoj();const el=document.querySelector("#bojview .bplos");if(el)el.scrollIntoView({block:"center",behavior:"smooth"});return}
  const zbu=T("[data-bzbu]");if(zbu){const k=zbu.dataset.bzbu,j=+zbu.dataset.bzbj;upd(o=>{o.zbrU=o.zbrU||{};const u=o.zbrU[k]||0;o.zbrU[k]=u>j?j:j+1;if(!o.zbrU[k])delete o.zbrU[k]});return}
  const ob=T("[data-bobet]");if(ob){const k=ob.dataset.bobet;upd(o=>{o.zbrU=o.zbrU||{};o.zbrU[k]=(o.zbrU[k]||0)+1});mmHlasG(`${o0?o0.n:""}: ${k.toLowerCase()} ${k==="Štít"?"":"zbroj "}obětována – kritický zásah se mění v běžný, hoď běžné zranění.`,5000);return}
  if(T("[data-bobetne]")){const f=T("[data-bobetne]").closest("form"),b=f&&f.querySelector(".bzrobet");if(b){b.hidden=true;b.innerHTML=""}return}
  if(T("[data-bkritpadx]")){delete BKPAD[id];renderBoj();return}
  if(T("[data-bkritpad]")){const pd=BKPAD[id];if(!pd)return;BKS.druh=pd.druh||"fyz";BKS.pod=pd.pod;BKS.vys="";BKS.kdo=o0?o0.n+" padl":"";BPRAV=true;renderBoj();const k=v.querySelector(".bkrit");if(k){k.scrollIntoView({block:"center",behavior:"smooth"});const i=k.querySelector("[data-bkr]");if(i)i.focus()}return}
  {const kzi=T("[data-bkzi]");if(kzi){if(window.kzUkaz)window.kzUkaz(kzi.dataset.bkzi);return}}
  const kzb=T("[data-bkz]");if(kzb&&o0){bojNpcKouzlo(o0,kzb.dataset.bkz,kzb.dataset.bkzz||null);return}
  if(T("[data-bkryt]")){upd(o=>{const k=+o.kryt||0;o.kryt=k===0?2:k===2?5:0;if(!o.kryt)delete o.kryt});return}
  if(T("[data-bvzdat]")){upd(o=>{o.stav=[...(o.stav||[]).filter(x=>x!=="prchá"),"vzdal se"]});mmHlasG(`${o0?o0.n:""}: skládají zbraně. Po boji rozhodnete, co se zajatci.`,4000);return}
  if(T("[data-bmorok]")){upd(o=>{o.morOk=o.pocet||1;o.stav=(o.stav||[]).filter(x=>x!=="prchá")});return}
  if(T("[data-bkoncx]")){delete BKONC[id];renderBoj();return}
  if(T("[data-bkonch]")&&o0){const k=BKONC[id];if(!k)return;const b=bojConB(PROTBY[o0.b]),d=bK(20),t=d+b,ok=t>=k.dc;k.v={d,b,t,ok};
    if(!ok)upd(o=>{o.stav=(o.stav||[]).filter(x=>x!=="soustředí")});else renderBoj();return}
  if(T("[data-bpoc]")){const d=+T("[data-bpoc]").dataset.bpoc;upd(o=>{o.pocet=Math.max(0,Math.min(o.max,(o.pocet||0)+d));if(BDOS[id]!=null)BDOS[id]=Math.min(BDOS[id],o.pocet)});return}
  if(T("[data-bnren]")&&o0){const nn=(prompt(`Nové jméno pro ${o0.n}:`,o0.n)||"").trim().slice(0,60);if(!nn||nn===o0.n)return;const st=o0.n;
    bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===id);if(o)o.n=nn});mmHlasG(`${st} → ${nn}.`,2500);return}
  if(T("[data-bskryt]")&&o0){bojZmen(s=>{const o=(s.npc||[]).find(x=>x.id===id);if(!o)return;if(o.skryt)delete o.skryt;else o.skryt=true});mmHlasG(o0.skryt?`${o0.n}: hráči ho teď vidí.`:`${o0.n}: hráči ho zatím nevidí.`,3000);return}
  if(T("[data-bdel]")){if(confirm(`Odebrat ${o0?o0.n:"NPC"} z boje?`))bojZmen(s=>{s.npc=s.npc.filter(x=>x.id!==id);(s.npc||[]).forEach(x=>{if(x.vel===id)delete x.vel});Object.keys(s.obsazeni||{}).forEach(k=>{if(s.obsazeni[k]===id)delete s.obsazeni[k]})});return}
  if(T("[data-bprdel]")){const pr=T("[data-bprdel]").dataset.bprdel;upd(o=>{o.pr=(o.pr||[]).filter(x=>x!==pr);if(!o.pr.length)delete o.pr});return}
  const btt=T("[data-butt]");if(btt){const k=id+":"+btt.dataset.butt,v=BUTT[k]||{};BUTT[k]=v.t===btt.dataset.t&&!v.pul?{}:{t:btt.dataset.t};renderBoj();return}
  const btp=T("[data-butpul]");if(btp){const k=id+":"+btp.dataset.butpul,v=BUTT[k]||{};BUTT[k]=v.pul?{}:{pul:1};renderBoj();return}
  if(T("[data-bkritpc]")){BPRAV=true;renderBoj();const k=v.querySelector(".bkrit");if(k)k.scrollIntoView({block:"center",behavior:"smooth"});return}
  if(T("[data-bzrpo]")&&o0){bojUtokZrPo(id);return}
  if(T("[data-but]")&&o0){const ai=+T("[data-but]").dataset.but,E0=bojEff(o0),a0=E0&&E0.at[ai];
    if(a0&&/šikov/i.test(a0.p||"")&&bojTypy(a0).length>1){bojSikVolba(o0,ai,a0);return}
    bojUtokKlik(o0,ai);return}
  if(T("[data-bmulti]")&&o0){const E0=bojEff(o0),MU=bojMulti(o0,E0);if(!MU)return;if(!BCIL[id]&&!confirm(`${o0.n}: celá akce bez vybraného cíle? (cíl jde vybrat nahoře „Na koho“)`))return;BMQ[id]={seq:MU.seq,i:0,tk:bojMultiTk()};bojMultiDalsi(o0);return}
  if(T("[data-bmdal]")&&o0){bojMultiDalsi(o0);return}
  if(T("[data-bmx]")){delete BMQ[id];renderBoj();return}
  const adv=T("[data-badv]");if(adv){const k=adv.dataset.badv,cur=BADV[id]==null?"auto":String(BADV[id]);if(k==="auto")delete BADV[id];else if(cur===k)BADV[id]=0;else if(cur==="auto"&&adv.getAttribute("aria-pressed")==="true")BADV[id]=0;else BADV[id]=+k;renderBoj();return}
  if(T("[data-brdyadd]")&&o0){const t=(prompt(`Připravená akce – ${o0.n}: co a kdy udělá?`,"zaútočí, až se někdo přiblíží")||"").trim();if(!t)return;bojZmen(z=>{(z.ready=z.ready||{})[id]=t});return}
  if(T("[data-brdyx]")){bojZmen(z=>{if(z.ready){delete z.ready[id];if(!Object.keys(z.ready).length)delete z.ready}});return}
  if(T("[data-brdygo]")&&o0){const t=(BOJ.s.ready||{})[id];if((BOJ.s.reak||{})[id]){mmHlasG(`${o0.n}: reakce už byla v tomto kole použita – připravenou akci nejde spustit.`,4000);return}
    bojLog(id,{n:"Připravená akce",zt:t||""},o0.n);bojZmen(z=>{(z.reak=z.reak||{})[id]=1;if(z.ready){delete z.ready[id];if(!Object.keys(z.ready).length)delete z.ready}});return}
  if(T("[data-bzav]")&&o0){const p=PROTBY[o0.b],z=bojZavoj(Object.assign({},p,{str:bojSpoj(o0)?"h":"n"}));bojLog(id,{n:"Závoj",zav:bojZavObj(p,z),bes:z.r==="pok"&&bojZatr(o0)},o0.n);renderBoj();return}
  if(T("[data-bbes]")){bojZmen(s=>{let h=(s.npc||[]).find(x=>x.b==="houf-besu"&&!bojSpoj(x));if(h){h.pocet=(h.pocet||0)+1;h.max=Math.max(h.max||0,h.pocet)}else bojPridejNpc(s,[{n:"Běsi",druh:"houf",pocet:1,b:PROTBY["houf-besu"]?"houf-besu":"",pr:[]}])});mmHlasG("Ze Závoje se zhmotnil běs.");return}
  const zi=T("[data-bzdi]");if(zi){const zd=zi.closest("[data-bzd]"),nm=zd.dataset.bzd,j=+zi.dataset.bzdi,o=bojZdr.get(),u=(o[id]=o[id]||{});u[nm]=(u[nm]||0)>j?j:j+1;bojZdr.set(o);renderBoj();return}
});
if(bojDB){bojNacti().then(()=>bojNav())}

/* útok nepřítele z karty (i po volbě typu zranění u Šikovné zbraně) */
function bojUtokKlik(o0,ai){const id=o0.id;if(BJR[id]){if(((BOJ.s||{}).reak||{})[id])mmHlasG(`${o0.n}: reakce už byla v tomto kole použita.`,3500);else bojZmen(z=>{(z.reak=z.reak||{})[id]=1});delete BJR[id]}
  bojUtok(o0,ai);renderBoj()}
/* Šikovná zbraň: před hodem se zvolí typ zranění */
function bojSikVolba(o0,ai,a0){const ty=bojTypy(a0),v=BUTT[o0.id+":"+ai]||{};
  mmPop(`<h3 class="uvh2">${besc(o0.n)}: ${besc(a0.n)}</h3><p class="rsmall">Šikovná zbraň – vyber typ zranění pro tento útok.</p><div class="bsikv">${ty.map(t=>`<button type="button" class="gbtn${v.t===t?"":" ghost"}" data-butsik="${t}" data-n="${besc(o0.id)}" data-ai="${ai}">${bikZr(t)} ${besc(BZRT[t]||t)}</button>`).join("")}</div>`)}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-butsik]");if(!b)return;const o0=((BOJ.s||{}).npc||[]).find(x=>x.id===b.dataset.n);if(!o0)return;const ai=+b.dataset.ai;
  BUTT[o0.id+":"+ai]=Object.assign({},BUTT[o0.id+":"+ai]||{},{t:b.dataset.butsik,pul:false});mmPopX();bojUtokKlik(o0,ai)});

/* hráč: Šikovná zbraň – před hodem volba typu zranění */
function bojJaSikVolba(K,w,T){const v=BUTYP[K.id+":"+w.n];
  mmPop(`<h3 class="uvh2">${besc(w.n)}</h3><p class="rsmall">Šikovná zbraň – vyber typ zranění pro tento útok.</p><div class="bsikv">${T.map(t=>`<button type="button" class="gbtn${v===t?"":" ghost"}" data-bjsik="${t}" data-k="${besc(K.id)}" data-w="${besc(w.n)}">${bikZr(t)} ${besc(BZRT[t]||t)}</button>`).join("")}</div>`)}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bjsik]");if(!b)return;BUTYP[b.dataset.k+":"+b.dataset.w]=b.dataset.bjsik;BJU.sikOk=true;mmPopX();bojJaHod()});

/* herní záznam: vrátit boj do stavu před vybraným krokem (i všechny pozdější kroky) */
async function bojLogZpetSem(i){const x=BLOGG[i];if(!x||!x.o.pre||x.o.undone)return;const P=x.o.pre,n=BLOGG.slice(0,i).filter(y=>!y.o.undone).length;
  if(!confirm(`Vrátit boj do stavu před: ${x.kdo?x.kdo+" – ":""}${x.o.n||"krok"}?${n?`\nVrátí se i ${n} ${n===1?"pozdější krok":n<5?"pozdější kroky":"pozdějších kroků"}.`:""}`))return;
  await bojObnovSnap(P);BZUND.push([x.o.t||0,Date.now()]);
  BLOGG.slice(0,i+1).forEach(y=>{y.o.undone=1});bojLog(x.id,{n:"Vráceno",ai:null,zt:`stav před: ${x.o.n||"krok"}${n?` (a ${n} pozdějších)`:""}`},x.kdo);mmHlasG("Boj vrácen do stavu před vybraným krokem.",3500);renderBoj()}

async function bojObnovSnap(P){await bojZmen(s=>{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,JSON.parse(P.s))});
  try{bojHp.set(JSON.parse(P.hp))}catch(e){}
  for(const [kid,js] of Object.entries(P.k||{})){const K=KARTBY[kid];if(!K)continue;const A=JSON.parse(js),C=kartaStav(kid)||{},ch={};
    new Set([...Object.keys(A),...Object.keys(C)]).forEach(k=>{if(k==="mods")return;if(JSON.stringify(A[k]??null)!==JSON.stringify(C[k]??null))ch[k]=A[k]??null});
    if(Object.keys(ch).length)await kartaStavZmen(kid,ch,null,{bezZpet:true})}}
/* „Zpět“ u libovolného řádku záznamu: poslední známý stav před tímto řádkem */
async function bojVratCas(tr,popis){const P=[...BHIST].reverse().find(x=>x.t<tr-30);
  if(!P){mmHlasG("Tak daleko web stav nezná – řádek je z doby před otevřením stránky Boj. Použij časovou osu na stránce Hra.",6000);return}
  const n=BLOGG.filter(y=>(y.o.t||0)>=tr&&!y.o.undone).length;
  if(!confirm(`Vrátit boj do stavu před: ${popis||"tento řádek"}?\nVrátí se i všechno pozdější (pořadí a stavy, životy nepřátel, karty postav).`))return;
  await bojObnovSnap(P);BZUND.push([tr,Date.now()]);BLOGG.forEach(y=>{if((y.o.t||0)>=tr)y.o.undone=1});
  bojLog("",{n:"Vráceno",ai:null,zt:`stav před: ${popis||"řádek záznamu"}`},"");mmHlasG("Boj vrácen do stavu před vybraným řádkem.",3500);renderBoj()}
