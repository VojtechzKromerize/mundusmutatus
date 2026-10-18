/* ===== Potvrzování akcí hráčů a časová osa sezení (2026-10-18)
   1) lhůta na rozmyšlení: akce, která utratí zdroj nebo zasáhne jiné (útok, kouzlo na nepřátele, léčení a Bardic spojence,
      Lay on Hands, obětování zbroje), se odešle až po několika vteřinách – do té doby ji hráč zruší;
   2) potvrzování vypravěčem podle nastavení (herní stav potvrz.rezim): „vse“ – útoky, kouzla i léčení a Bardic spojenců,
      „cast“ – útoky a kouzla na nepřátele, „nic“ – vše se zapíše samo; zamítnutí vrátí utracený slot / použití;
   3) vypravěč vidí každou změnu karet, boje a herního času (tabulka zmeny) a může ji vrátit – jednotlivě i vše od dané chvíle. ===== */
var POTVRZ0={rezim:"cast",odklad:6};
/* nastavení je v herním stavu (hráč ho dostane při načtení stránky) a v boji (hráči ho mají hned – stav boje průběžně načítají) */
var POTVRZDB=null;/* nastavení z databáze (nastaveni.potvrz) – hráči ho průběžně načítají, změna nepřenačte stránky jako změna herního stavu */
function potvrz(){const L=[POTVRZDB,typeof BOJ!=="undefined"&&BOJ&&BOJ.s&&BOJ.s.potvrz,typeof HRA!=="undefined"&&HRA&&HRA.potvrz].filter(Boolean).sort((a,b)=>(+b.t||0)-(+a.t||0));return Object.assign({rezim:"cast",odklad:6},L[0]||{})}
async function potvrzNacti(){if(!window.MMDB||!MMDB.potvrz)return false;try{const p=await MMDB.potvrz();const z=JSON.stringify(p)!==JSON.stringify(POTVRZDB);if(p&&typeof p==="object")POTVRZDB=p;return z}catch(e){return false}}
var POTVRZR=[["vse","vše potvrzuji (útoky, kouzla, léčení a Bardic spojenců)"],["cast","jen útoky a kouzla na nepřátele"],["nic","nic – vše se zapíše samo"]];
async function potvrzNastav(ch){const p=Object.assign(potvrz(),ch,{t:Date.now()});try{POTVRZDB=await MMDB.potvrzNastav(p)||p}catch(e){/* starší databáze bez mm_potvrz_nastav */if(typeof hraUloz==="function")await hraUloz({potvrz:p,$bezZpet:true})}if(typeof bojZmen==="function"&&BOJ&&BOJ.s&&Object.keys(BOJ.s).length)bojZmen(z=>{z.potvrz=p},true);if(curView==="boj")renderBoj();if(curView==="hra")renderHra()}
function potvrzHtml(kde){const POTVRZR=[["vse","vše potvrzuji (útoky, kouzla, léčení a Bardic spojenců)"],["cast","jen útoky a kouzla na nepřátele"],["nic","nic – vše se zapíše samo"]];return `<span class="potvrz"><label ${btip("Co z akcí hráčů z telefonu musíš potvrdit, než se zapíše")}>Potvrzovat: <select data-potvrzr aria-label="Potvrzování akcí hráčů">${POTVRZR.map(([k,l])=>`<option value="${k}"${potvrz().rezim===k?" selected":""}>${l}</option>`).join("")}</select></label>
  <label ${btip("Kolik vteřin má hráč na zrušení akce, než se odešle (0 = hned)")}>lhůta hráčů <input type="number" min="0" max="15" value="${+potvrz().odklad}" data-potvrzo style="width:3.6em" aria-label="Lhůta na zrušení v sekundách"> s</label></span>`}
document.addEventListener("change",e=>{const t=e.target;if(!t.matches||!GMV)return;
  if(t.matches("[data-potvrzr]")){potvrzNastav({rezim:t.value}).then(()=>{if(t.value==="nic"&&typeof bojUtokyNove==="function")bojUtokyNove()});return}
  if(t.matches("[data-potvrzo]")){potvrzNastav({odklad:Math.max(0,Math.min(15,Math.round(+t.value||0)))});return}});

/* ---- 1) lhůta na rozmyšlení ---- */
var KODK=[],KODKI=0;
function kOdklad(popis,fn){const n=GMV?0:+potvrz().odklad;if(!(n>0))return Promise.resolve(fn());
  return new Promise(res=>{const o={id:++KODKI,popis:String(popis||"akce"),konec:Date.now()+n*1000,res};
    o.t=setTimeout(async()=>{kOdkPryc(o);try{res(await fn())}catch(e){res(false)}},n*1000);KODK.push(o);kOdkKresli()})}
function kOdkPryc(o){const i=KODK.indexOf(o);if(i>=0)KODK.splice(i,1);kOdkKresli()}
function kOdkZrus(id){const o=KODK.find(x=>x.id===id);if(!o)return;clearTimeout(o.t);kOdkPryc(o);o.res(false);mmHlasG(`Zrušeno: ${o.popis}.`,3000)}
var KODKT=0;
function kOdkKresli(){let el=document.getElementById("kodkl");if(!KODK.length){if(el)el.remove();clearInterval(KODKT);KODKT=0;return}
  if(!el){el=document.createElement("div");el.id="kodkl";el.className="kodkl";el.setAttribute("role","status");document.body.appendChild(el)}
  el.innerHTML=KODK.map(o=>{const z=Math.max(0,Math.ceil((o.konec-Date.now())/1000));return `<div class="kodkr"><span>Odesílám za <b>${z}</b> s: ${besc(o.popis)}</span><button type="button" class="gbtn" data-kodkz="${o.id}">Zrušit</button></div>`}).join("");
  if(!KODKT)KODKT=setInterval(kOdkKresli,250)}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kodkz]");if(b)kOdkZrus(+b.dataset.kodkz)});

/* ---- 2) návrhy hráčů ke schválení (léčení a Bardic spojenců) ---- */
var NAVRHY=[],NAVMOJE=new Set();
function navrhPotreba(){return !GMV&&!!window.MMDB&&potvrz().rezim==="vse"}
async function navrhPosli(od,data){try{const id=await MMDB.navrh(od.id,data);NAVMOJE.add(+id);await navrhyNacti();mmHlasG(`${data.popis||"Návrh"} – čeká na schválení vypravěčem.`,4500);kartyPrekresli();return true}
  catch(e){mmHlasG("Návrh se nepodařilo poslat: "+(e.message||e),6000);return false}}
async function navrhyNacti(){if(!window.MMDB||!MMDB.navrhy)return false;if(!GMV&&!NAVMOJE.size&&!NAVRHY.some(x=>x.stav==="ceka"))return false;
  try{const r=await MMDB.navrhy()||[];const pred=JSON.stringify(NAVRHY);
    if(!GMV){r.forEach(n=>{const o=NAVRHY.find(x=>x.id===n.id);if(NAVMOJE.has(n.id)&&n.stav!=="ceka"&&(!o||o.stav==="ceka")){mmHlasG(`${n.data.popis||"Návrh"}: ${n.stav==="ok"?"vypravěč schválil ✓":"vypravěč zamítl ✗"}${n.vys?" – "+n.vys:""}.`,6000);NAVMOJE.delete(n.id);if(n.stav==="ok")kartyNacti().then(()=>kartyPrekresli())}})}
    NAVRHY=r;return pred!==JSON.stringify(NAVRHY)}catch(e){return false}}
function navrhyCeka(){return (NAVRHY||[]).filter(n=>n.stav==="ceka")}
/* hráč: moje čekající návrhy (do pruhu hlášení na kartě) */
function navrhyMojeHtml(K){const L=navrhyCeka().filter(n=>n.karta===K.id);return L.length?`<p class="khl kdbnav">⏳ <b>Čeká na vypravěče:</b> ${L.map(n=>besc(n.data.popis||"návrh")).join(" · ")}</p>`:""}
/* vypravěč: seznam ke schválení (v Boji i na stránce Hra) */
function navrhyGmHtml(){const L=navrhyCeka();if(!L.length)return "";
  return `<section class="butkp bmor bkonc navrhy"><b>Ke schválení</b><ul>${L.map(n=>`<li><b>${besc((KARTBY[n.karta]||{}).n||n.karta)}</b>: ${besc(n.data.popis||n.data.typ)} <button type="button" class="gbtn" data-navok="${n.id}">Schválit</button><button type="button" class="gbtn ghost" data-navne="${n.id}">Zamítnout</button></li>`).join("")}</ul>${L.length>1?`<button type="button" class="gbtn ghost" data-navvse>Schválit vše</button>`:""}</section>`}
async function navrhVrat(n){const v=n.data&&n.data.vratit,K=KARTBY[n.karta];if(!v||!K)return;const U=Object.assign({},kartaStav(K.id).zdr||{});U[v.k]=Math.max(0,(+U[v.k]||0)-(+v.n||1));if(!U[v.k])delete U[v.k];
  await kartaStavZmen(K.id,{zdr:Object.keys(U).length?U:null},null,{bezZpet:true})}
async function navrhProved(n){const d=n.data||{},K2=KARTBY[d.cil];if(!K2)throw new Error("cílová karta neexistuje");
  if(d.typ==="lec")await kLecKarta(K2,+d.hp||0,null,d.co||"léčení");
  else if(d.typ==="bardic"){const P=kPri(K2).filter(x=>!/^Bardic /.test(x));await kartaStavZmen(K2.id,{pri:[...P,"Bardic d"+(+d.k||6)]},null,{bezZpet:true})}}
async function navrhVyrid(id,ok){const n=NAVRHY.find(x=>x.id===id);if(!n||n.stav!=="ceka")return;
  try{if(ok)await navrhProved(n);else await navrhVrat(n);await MMDB.navrhVyrid(id,ok?"ok":"ne",ok?null:"zamítnuto");n.stav=ok?"ok":"ne";
    kHodZapis({k:n.karta,kdo:(KARTBY[n.karta]||{}).n||n.karta,co:ok?"Schváleno vypravěčem":"Zamítnuto vypravěčem",txt:n.data.popis||""});mmHlasG(`${n.data.popis||"Návrh"}: ${ok?"schváleno":"zamítnuto"}.`,3500)}
  catch(e){mmHlasG("Nepodařilo se: "+(e.message||e),5000)}
  await navrhyNacti();if(curView==="boj")renderBoj();if(curView==="hra")renderHra()}
document.addEventListener("click",async e=>{const T=s=>e.target.closest&&e.target.closest(s);if(!GMV)return;
  const a=T("[data-navok]");if(a){navrhVyrid(+a.dataset.navok,true);return}
  const z=T("[data-navne]");if(z){navrhVyrid(+z.dataset.navne,false);return}
  if(T("[data-navvse]")){for(const n of navrhyCeka())await navrhVyrid(n.id,true);return}});
/* zamítnutý útok hráče: vrátit utracený slot kouzla */
async function bojUtokVratSlot(u){if(!u||!u.sl)return;const h=((BOJ.s||{}).hraci||[]).find(x=>x.id===u.h),K=h&&bojKartaH(h);if(!K)return;
  const U=Object.assign({},kartaStav(K.id).zdr||{});if(!(+U[u.sl]>0))return;U[u.sl]=+U[u.sl]-1;if(!U[u.sl])delete U[u.sl];
  await kartaStavZmen(K.id,{zdr:Object.keys(U).length?U:null},`${K.n}: slot vrácen (útok zamítnut).`,{bezZpet:true})}

/* ---- 3) časová osa sezení: změny karet, boje a herního času s vrácením ---- */
var ZMENY=[],ZMOD="6h",ZMFLT="vse";
var ZMPOLE={hp:"životy",thp:"dočasné HP",kz:"kostky životů",vycerp:"vyčerpání",insp:"inspirace",zdr:"sloty a zdroje",inv:"vybavení",pen:"peníze",pozn:"poznámky",
  sv:"Svědomí",hr:"hříchy",sk:"dobré skutky",duse:"duše",tech:"techniky",uc:"účinky",stavy:"stavy",bezstit:"štít",kpn:"připravená kouzla",kpx:"odebraná kouzla",spol:"společníci",
  dopl:"doplňky",mun:"munice",tridy:"povolání",vlU:"vlastnosti",pdfx:"rozdíly z PDF",upr:"úpravy",pri:"přídavky k hodům",img:"portrét",forma:"podoba",zbrU:"obětování zbroje"};
var zmV=v=>v==null?"–":typeof v==="object"?(Array.isArray(v)?`${v.length} položek`:Object.entries(v).slice(0,4).map(([k,x])=>`${k} ${typeof x==="object"?"…":x}`).join(", ")):String(v);
function zmPopis(z){if(z.druh==="boj")return `Boj: ${z.souhrn||"změna"}`;if(z.druh==="hra")return `Herní stav: ${z.souhrn||"změna"}`;
  const K=KARTBY[z.klic],n=K?K.n:z.klic,p=ZMPOLE[z.pole]||z.pole;
  if(z.pole==="hp"){const mx=K?kHPmax(K):"?";return `${n}: ${p} ${z.pred??mx} → ${z.po??mx}`}
  if(z.pole==="zdr"){const a=z.pred||{},b=z.po||{},k=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(x=>(a[x]||0)!==(b[x]||0));return `${n}: ${k.map(x=>`${x.replace(/^slot(\d)(p?)$/,(m,s,pk)=>`${pk?"pakt":"slot"} ${s}. st.`)} ${a[x]||0}→${b[x]||0}`).join(", ")||p}`}
  if(z.pole==="inv"){const a=(z.pred||[]).map(x=>x.n+(x.q>1?"×"+x.q:"")),b=(z.po||[]).map(x=>x.n+(x.q>1?"×"+x.q:""));const pl=b.filter(x=>!a.includes(x)),mi=a.filter(x=>!b.includes(x));return `${n}: ${p}${pl.length?" + "+pl.slice(0,3).join(", "):""}${mi.length?" − "+mi.slice(0,3).join(", "):""}`}
  if(Array.isArray(z.pred)||Array.isArray(z.po)){const a=(z.pred||[]).map(x=>typeof x==="object"?x.n||JSON.stringify(x).slice(0,20):x),b=(z.po||[]).map(x=>typeof x==="object"?x.n||JSON.stringify(x).slice(0,20):x);
    const pl=b.filter(x=>!a.includes(x)),mi=a.filter(x=>!b.includes(x));return `${n}: ${p}${pl.length?" + "+pl.slice(0,3).join(", "):""}${mi.length?" − "+mi.slice(0,3).join(", "):""}${!pl.length&&!mi.length?" (změna)":""}`}
  if(typeof z.pred==="object"||typeof z.po==="object")return `${n}: ${p} (${zmV(z.pred)} → ${zmV(z.po)})`;
  return `${n}: ${p} ${zmV(z.pred)} → ${zmV(z.po)}`}
async function zmenyNacti(){if(!GMV||!window.MMDB||!MMDB.zmeny)return;const h={"1h":1,"6h":6,"24h":24,"7d":168}[ZMOD]||6;
  try{ZMENY=await MMDB.zmeny(new Date(Date.now()-h*3600e3).toISOString())||[]}catch(e){ZMENY=[];mmHlasG("Časovou osu se nepodařilo načíst: "+(e.message||e),5000)}}
function zmenyHtml(){const L=(ZMENY||[]).filter(z=>ZMFLT==="vse"||z.druh===ZMFLT);
  return `<section class="zmeny"><h3 class="uvh2">Časová osa sezení</h3><p class="rsmall">Každá změna karet, boje a herního času s předchozí hodnotou. „Vrátit“ obnoví stav před změnou, „vše od sem“ vrátí i všechno pozdější.</p>
    <p class="kvlh">${[["1h","hodina"],["6h","6 hodin"],["24h","den"],["7d","týden"]].map(([k,l])=>`<button type="button" class="gbtn ghost${ZMOD===k?" on":""}" data-zmod="${k}" aria-pressed="${ZMOD===k}">${l}</button>`).join("")}
      <select data-zmflt aria-label="Co ukázat">${[["vse","vše"],["karta","karty"],["boj","boj"],["hra","čas a cesty"]].map(([k,l])=>`<option value="${k}"${ZMFLT===k?" selected":""}>${l}</option>`).join("")}</select>
      <button type="button" class="gbtn ghost" data-zmnacti>Načíst</button></p>
    ${L.length?`<ul class="khist zmlist">${L.slice(0,150).map(z=>`<li${z.gm?' class="zmgm"':""}><small>${(()=>{try{return new Date(z.cas).toLocaleTimeString("cs-CZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}catch(e){return ""}})()}</small> <span>${z.gm?"":"<i>hráč</i> · "}${besc(zmPopis(z))}</span> <button type="button" class="gbtn ghost" data-zmvrat="${z.id}">Vrátit</button><button type="button" class="gbtn ghost" data-zmvse="${z.id}" ${btip("Vrátit tuto i všechny pozdější změny (karty, boj, čas)")}>vše od sem</button></li>`).join("")}</ul>`:`<p class="rsmall">${window.MMDB?"Žádné změny – klikni Načíst.":"Časová osa je jen ve verzi s databází."}</p>`}</section>`}
async function zmVratJednu(z){if(z.druh==="karta"){const K=KARTBY[z.klic];if(!K)throw new Error("karta neexistuje");await kartaStavZmen(K.id,{[z.pole]:z.pred??null},null,{bezZpet:true});return}
  const d=await MMDB.zmena(z.id);if(!d||(d.pred==null&&z.druh!=="hra"))throw new Error("předchozí stav chybí");
  if(z.druh==="boj"){const v=await MMDB.bojVerze();await MMDB.bojUloz(d.pred,v);BOJ.v=-2;await bojNacti();return}
  if(z.druh==="hra"){const h={};d.pred=d.pred||{};[...new Set([...Object.keys(d.pred),...Object.keys(HRA||{})])].filter(k=>k!=="hodinaPred").forEach(k=>{h[k]=d.pred[k]===undefined?null:d.pred[k]});HRA=await MMDB.nastavHru(h);__D.HRA=HRA;hraPo()}}
async function zmVrat(id,vse){const z=ZMENY.find(x=>x.id===id);if(!z)return;
  let L=[z];if(vse){const P=ZMENY.filter(x=>x.id>=id),prvni={};P.slice().sort((a,b)=>a.id-b.id).forEach(x=>{const k=x.druh==="karta"?`k:${x.klic}:${x.pole}`:x.druh;if(!prvni[k])prvni[k]=x});L=Object.values(prvni)}
  if(!confirm(vse?`Vrátit ${L.length} ${L.length===1?"věc":"věcí"} do stavu před ${new Date(z.cas).toLocaleTimeString("cs-CZ")}?\n${L.slice(0,8).map(zmPopis).join("\n")}${L.length>8?"\n…":""}`:`Vrátit: ${zmPopis(z)}?`))return;
  document.documentElement.classList.add("gmbusy");let ch=0;
  try{for(const x of L){try{await zmVratJednu(x);ch++}catch(e){mmHlasG(`Nevráceno (${zmPopis(x)}): ${e.message||e}`,6000)}}
    mmHlasG(`Vráceno ${ch} ${ch===1?"změna":"změn"}.`,4000)}finally{document.documentElement.classList.remove("gmbusy")}
  await kartyNacti(true);kartyPrekresli();await zmenyNacti();if(curView==="hra")renderHra();if(curView==="boj")renderBoj()}
document.addEventListener("click",async e=>{const T=s=>e.target.closest&&e.target.closest(s);if(!GMV)return;
  const m=T("[data-zmod]");if(m){ZMOD=m.dataset.zmod;await zmenyNacti();renderHra();return}
  if(T("[data-zmnacti]")){await zmenyNacti();renderHra();return}
  const v=T("[data-zmvrat]");if(v){zmVrat(+v.dataset.zmvrat,false);return}
  const w=T("[data-zmvse]");if(w){zmVrat(+w.dataset.zmvse,true);return}});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-zmflt]")&&GMV){ZMFLT=t.value;renderHra()}});
/* tah stojí, dokud vypravěč nepotvrdí: čekající útoky a návrhy (všech, nebo jedné postavy v boji) */
function bojCekaAkce(s,hid){s=s||BOJ.s||{};const H=(s.hraci||[]).find(h=>h.id===hid),K=H&&typeof bojKartaH==="function"?bojKartaH(H):null;
  return (s.utoky||[]).filter(u=>u.stav==="ceka"&&(!hid||u.h===hid)).length+navrhyCeka().filter(n=>!hid||(K&&n.karta===K.id)).length}
function bojKonecBtn(hid){const n=bojCekaAkce(null,hid);
  return n?`<button type="button" class="gbtn bkonecb" disabled ${btip("Tah pokračuje, až vypravěč potvrdí tvé akce")}>⏳ Čeká na vypravěče (${n})</button>`:`<button type="button" class="gbtn bkonecb" data-bkonec="${hid}">✓ Konec tahu</button>`}
function bojDalOk(){const n=GMV?bojCekaAkce():0;return !n||confirm(`${n===1?"Jedna akce hráče čeká":`${n} akcí hráčů čeká`} na potvrzení. Tah stojí, dokud je nevyřídíš – přesto posunout dál?`)}
