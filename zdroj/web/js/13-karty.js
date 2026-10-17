/* ===== Karty postav: import listu z PDF D&D Beyond, trvalý stav, hody se Závojem, odpočinky, herní záznam (2026-10-16) =====
   Karta (data z PDF) se ukládá do tabulky karty, stav postavy (životy, zdroje, sloty, vyčerpání, vybavení…) taky;
   boj z karty čte AC, záchrany a útoky a zapisuje do stejného stavu. Bez databáze (vypravěčský soubor) vše v prohlížeči. */
const KDB=window.MMDB?{nacti:()=>MMDB.kartyNacti(),uloz:k=>MMDB.kartaUloz(k),stav:(i,p,v)=>MMDB.kartaStav(i,p,v),smaz:i=>MMDB.kartaSmaz(i),hody:()=>MMDB.hodyNacti(),hod:o=>MMDB.hodZapis(o)}
  :(()=>{const L=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}},S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
    return {nacti:async()=>{const K=L("mm-karty")||{},T=L("mm-karty-stav")||{};return [...new Set([...Object.keys(K),...Object.keys(T)])].map(id=>({id,karta:K[id]||null,stav:T[id]||{},verze:1}))},
      uloz:async k=>{const K=L("mm-karty")||{};K[k.id]=k;S("mm-karty",K);return k.id},
      stav:async(i,p,v)=>{const T=L("mm-karty-stav")||{},o=T[i]=T[i]||{};if(v==null)delete o[p];else o[p]=v;S("mm-karty-stav",T);return 1},
      smaz:async i=>{const K=L("mm-karty")||{};delete K[i];S("mm-karty",K)},
      hody:async()=>(L("mm-hody")||[]),hod:async o=>{const H=L("mm-hody")||[];H.unshift({id:Date.now(),cas:new Date().toISOString(),data:o});S("mm-hody",H.slice(0,300));return 1}}})();
const KST={},KSTAT=new Set((KARTY||[]).map(k=>k.id));let HODY=[],KLOAD=0;
const kartaStav=id=>KST[id]||{};
const KHRAC={};
/* rozepsané změny: načtení z databáze nesmí přepsat změnu, která se právě ukládá (nebo se uložila až po začátku načítání) */
const KPEND={},KPENDT={};
function kartyNastav(rows,t0){(rows||[]).forEach(r=>{if(r.zamceno)KZAM.add(r.id);else if(r.zamceno===false)KZAM.delete(r.id);if(r.hrac)KHRAC[r.id]=r.hrac;else if(r.hrac===null)delete KHRAC[r.id];if(r.karta&&r.karta.n){const i=KARTY.findIndex(k=>k.id===r.id);if(i>=0)KARTY[i]=r.karta;else KARTY.push(r.karta)}if(t0&&KPENDT[r.id]>t0)return;let st=r.stav||{};const P=KPEND[r.id];if(P&&Object.keys(P).length){st=Object.assign({},st);Object.entries(P).forEach(([k,q])=>{if(q.v==null)delete st[k];else st[k]=q.v})}KST[r.id]=st});
  Object.keys(KARTBY).forEach(k=>delete KARTBY[k]);KARTY.forEach(k=>{KARTBY[k.id]=k});kFrontaNaStav()}
async function kartyNacti(){try{const t0=Date.now(),r=await KDB.nacti();const pred=JSON.stringify(KST)+KARTY.length;kartyNastav(r,t0);KLOAD=Date.now();KCACHE.uloz();if(KFR.get().length)kFrontaOdesli();return pred!==JSON.stringify(KST)+KARTY.length}catch(e){if(!KLOAD&&KCACHE.nacti()){KLOAD=Date.now();return true}return false}}
async function hodyNacti(){try{const r=await KDB.hody();const top=(HODY[0]||{}).id;HODY=(r||[]).map(x=>Object.assign({id:x.id,cas:x.cas},x.data||{}));return (HODY[0]||{}).id!==top}catch(e){return false}}
/* změna stavu karty: hned v prohlížeči, pak do databáze; ch = {pole: hodnota|null} */
async function kartaStavZmen(id,ch,msg,op={}){if(!op.bezZpet)kZpetZapis(id,ch);const o=Object.assign({},kartaStav(id));Object.entries(ch).forEach(([k,v])=>{if(v==null)delete o[k];else o[k]=v});KST[id]=o;kartyPrekresli();const P=KPEND[id]=KPEND[id]||{};Object.entries(ch).forEach(([k,v])=>{P[k]={v:v??null,n:((P[k]||{}).n||0)+1}});
  const hotovo=k=>{const q=P[k];if(q&&--q.n<=0)delete P[k];KPENDT[id]=Date.now()};
  try{for(const [k,v] of Object.entries(ch)){try{await KDB.stav(id,k,v??null)}finally{hotovo(k)}}if(msg)mmHlasG(msg,4500)}catch(e){if(window.MMDB&&kSitChyba(e)){Object.entries(ch).forEach(([k,v])=>kFrontaPridej({t:"s",id,k,v:v??null}));KCACHE.uloz();mmHlasG("Bez připojení – změna se uloží, až bude signál.",4000);return}mmHlasG("Nepodařilo se uložit: "+(e.message||e),5000);KPENDT[id]=0;await kartyNacti();kartyPrekresli()}}
function kartyPrekresli(){if(curView==="karty")renderKarty(decodeURIComponent((location.hash.split("/")[1])||""));if(curView==="boj")renderBoj();if(curView==="hra")hraPrekresli()}
/* vyčerpání (D&D 2024): každá úroveň −2 ke všem hodům d20 */
const kVycerp=K=>+(kartaStav(K.id).vycerp||0);
const kMod=v=>Math.floor((+v-10)/2);
/* hod d20 z karty; ověření a útoky hází i kostku Závoje a rovnou ji vyhodnotí, záchrany ne (Artikule › Kostka Závoje) */
let KADV=0;
async function kartaHod(K,co,b,o={}){const SV=kStavVliv(K,co),v=kAdvSum(o.adv!=null?o.adv:KADV,SV.r);if(SV.r.length)o.why=[o.why,...SV.r.map(x=>x[1])].filter(Boolean).join(", ");if(SV.fail)o.why=[o.why,"automaticky selhává (stav)"].filter(Boolean).join(", ");const d1=bK(20),d2=v?bK(20):null,d=v>0?Math.max(d1,d2):v<0?Math.min(d1,d2):d1,vy=2*kVycerp(K),PD=kPriHod(K,co),tot=d+(+b||0)-vy+PD.t,z=zavBezZach(co)?null:kZavoj(K);
  const krit=d>=(o.kmin||20)&&!!o.utok,mis=d===1&&!!o.utok;
  const txt=`d20 ${d1}${d2!=null?` / ${d2} (${v>0?"výhoda":"nevýhoda"})`:""} ${bsg(+b||0)}${vy?` −${vy} vyčerpání`:""}${PD.txt} = ${tot}${krit?" · kritický zásah":mis?" · minutí":""}${o.why?" · "+o.why:""}`;
  const H={k:K.id,kdo:K.n,co,txt,tot,d};if(z){H.zav=z.d;H.zr=z.r||"0";KZAV[K.id]={co,d:z.d,r:z.r,hod:z.hod}}if(krit)H.krit=true;
  KPOSL[K.id]={co,d1,d2,v,b:(+b||0)-vy+PD.t,d,tot,kmin:o.kmin||20,utok:!!o.utok,krit,mis,ut:o.ut,skryty:!!o.skryty,cas:Date.now(),upr:[],mods:[],puv:tot,bylMis:mis,bylKrit:krit};if(mis)H.mis=true;if(v)H.adv=v;
  if(!o.skryty)kHodZapis(H);else{HODY.unshift(Object.assign({id:Date.now(),cas:new Date().toISOString(),skryty:true},H));kartyPrekresli()}
  mmHlasG(`${K.n}: ${co} ${tot} (${txt.replace(/ = \d+.*/,"")})${z?" · "+zavTxt(z):""}`,6500);return {tot,d,krit,mis,zav:z?z.d:undefined,zr:z?z.r:undefined,txt}}
async function kHodZapis(H){HODY.unshift(Object.assign({id:Date.now(),cas:new Date().toISOString()},H));kartyPrekresli();try{await KDB.hod(H)}catch(e){if(window.MMDB&&kSitChyba(e)){kFrontaPridej({t:"h",h:H});KCACHE.uloz();return}mmHlasG("Hod se nepodařilo zapsat: "+(e.message||e),4000)}}
/* hod výrazem (zranění, léčení): „1d8+5“, při kritickém zásahu dvojnásob kostek; přidané efekty (Hex 1d6, Damaging Hex +3) */
function kartaZraneni(K,a,krit,ef){const k=bojKostky(String(a.z||"").replace(/\s+/g,""),krit);let t=k?k.t:0,x=k?k.x:"";
  (ef||[]).forEach(e=>{if(typeof e.zr==="string"){const q=bojKostky(e.zr,krit);if(q){t+=q.t;x+=` + ${q.x}${e.t?" "+(BZRT[e.t]||e.t):""}`}}else if(+e.zr){t+=+e.zr;x+=` + ${e.zr}`}});return {t,x}}
/* odpočinky (D&D 2024 + Artikule): krátký – kostky životů, zdroje „krátký odpočinek“, sloty paktu; dlouhý – vše, polovina kostek životů, vyčerpání −1 */
async function kartaOdpocinek(K,dlouhy){const S=kartaStav(K.id),ch={},msg=[],pool=kKostkyPool(K),kzMax=pool.length||kLv(K),spent=+S.kz||0,con=kMod((K.vl||{}).CON||10),mx=kHPmax(K),cur=S.hp!=null?+S.hp:mx;
  const U=Object.assign({},S.zdr||{});
  if(dlouhy){if(!confirm(`${K.n}: dlouhý odpočinek (8 hodin)? Obnoví životy, sloty, zdroje a všechny kostky životů, vyčerpání −1.`))return;
    {const D=kDuse(K);if(D.sv>=1&&D.sv<=3){const n=Math.min(mx,cur+Math.floor(mx/2));ch.hp=n>=mx?null:n;msg.push("neklidné sny (Na scestí): jen polovina HP")}else ch.hp=null}ch.thp=null;ch.zdr=null;if(S.forma)ch.forma=null;const back=kzMax;ch.kz=null;if(S.vycerp)ch.vycerp=Math.max(0,S.vycerp-1)||null;
    if((K.rysy||[]).some(r=>/resourceful/i.test(r)))ch.insp=true;msg.push(`životy ${ch.hp??mx}/${mx}, sloty, Výdrž a zdroje obnoveny, kostky životů +${Math.min(back,spent)}${S.vycerp?", vyčerpání −1":""}${ch.insp?", hrdinská inspirace (Resourceful)":""}`)}
  else{const zb=kzMax-spent;let n=0;if(cur<mx&&zb>0){const r=prompt(`${K.n}: krátký odpočinek (1 hodina). Kolik kostek životů utratíš? (zbývá ${zb}: ${pool.slice(spent).map(x=>"d"+x).join(" ")}, CON ${bsg(con)})`,String(Math.min(zb,Math.ceil((mx-cur)/((pool[spent]||8)/2+1+con)))));if(r===null)return;n=Math.max(0,Math.min(zb,Math.round(+r)||0))}
    let heal=0;const hx=[];for(let i=0;i<n;i++){const s=pool[spent+i]||8,d=bK(s);heal+=Math.max(0,d+con);hx.push(`d${s} ${d}`)}
    if(n){ch.kz=spent+n;ch.hp=Math.min(mx,cur+heal);if(ch.hp>=mx)ch.hp=null;msg.push(`kostky životů ${hx.join(", ")} ${bsg(con)}× = +${heal} HP`)}
    kSloty(K).filter(q=>q.pakt).forEach(q=>{delete U[q.k]});kZdroje(K).forEach(q=>{if(q.kr1){if(U[q.n])U[q.n]=U[q.n]-1;if(!U[q.n])delete U[q.n]}else if(/krátk/.test(q.obn||""))delete U[q.n]});
    ch.zdr=Object.keys(U).length?U:null;msg.push("zdroje s obnovou krátkým odpočinkem a sloty paktu obnoveny")}
  {const P=kPri(K),zb=P.filter(n=>/^Bardic /.test(n)&&!dlouhy);if(P.length!==zb.length){ch.pri=zb.length?zb:null;msg.push(`skončilo: ${P.filter(n=>!zb.includes(n)).join(", ")}`)}}
  if(dlouhy){const inv=(S.inv||K.vybaveni||[]).map(y=>Object.assign({},y)),L=kNabObnov(inv);if(L.length){ch.inv=inv;msg.push(`náboje za úsvitu: ${L.join(", ")}`)}}
  const kr=(bojKritPC()[K.n]||[]).filter(x=>/^Lehká/.test(x.t));if(kr.length)msg.push(`Lehká kritická zranění se hojí odpočinkem – vypravěč je odškrtne (${kr.length})`);
  await kartaStavZmen(K.id,ch);kHodZapis({k:K.id,kdo:K.n,co:dlouhy?"Dlouhý odpočinek":"Krátký odpočinek",txt:msg.join("; ")});mmHlasG(`${K.n}: ${dlouhy?"dlouhý":"krátký"} odpočinek – ${msg.join("; ")}.`,8000)}
/* sesílání kouzla: odečte nejnižší volný slot (sloty paktu i běžné), soustředění zapne v běžícím boji */
async function kartaSeslat(K,sp,chce){try{const c=kCasKouzla(sp);const h0=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);if(h0&&h0.n===bojJa.get())bojBptOznac(c)}catch(e){}const L=kSlX(K,sp).sort((a,b)=>(chce&&a.k===chce?-1:chce&&b.k===chce?1:a.st-b.st));
  if((sp.st>0||sp.pz)&&!L.length){mmHlasG(sp.pz?(sp.pz.sv?`${K.n}: ${sp.n} není na seznamu kouzel tvého povolání – svitek je nesrozumitelný.`:`${K.n}: ${sp.pz.p} nemá na ${sp.n} dost nábojů.`):`${K.n}: na ${sp.n} nezbývá slot ${sp.st}. stupně nebo vyšší.`,4000);return false}
  const q=sp.st>0||sp.pz?L[0]:null,U=Object.assign({},kartaStav(K.id).zdr||{});
  if(q&&q.lab!=null&&sp.pz.sv){const S=kartaStav(K.id),inv=[...(S.inv||K.vybaveni||[])].map(y=>Object.assign({},y)),it=inv[sp.pz.i],mx=Math.max(0,...kSloty(K).map(z=>z.st)),so=10+(+sp.st||0);let ok=true;
    if(+sp.st>mx){const r=await kartaHod(K,`Svitek ${sp.n} – ověření (SO ${so})`,kSpMod(K));ok=!!r&&r.tot>=so}
    if(it){if((it.q==null?1:+it.q)>1)it.q=+it.q-1;else inv.splice(sp.pz.i,1);await kartaStavZmen(K.id,{inv})}
    if(!ok){kHodZapis({k:K.id,kdo:K.n,co:`Svitek ${sp.n}`,txt:"ověření selhalo – kouzlo zmizelo bez účinku"});mmHlasG(`${K.n}: ověření selhalo – ${sp.n} ze svitku zmizelo bez účinku.`,5000);return false}}
  else if(q&&q.lab!=null){const S=kartaStav(K.id),inv=[...(S.inv||K.vybaveni||[])].map(y=>Object.assign({},y)),it=inv[sp.pz.i];if(it&&q.nab){it.nab=(+it.nab||0)+q.nab;await kartaStavZmen(K.id,{inv})}}
  else{if(q)U[q.k]=(U[q.k]||0)+1;if(q)await kartaStavZmen(K.id,{zdr:U})}
  const h=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);
  if(sp.kon&&h){if(window.MMDB&&!GMV)bojHracAkce(h.id,x=>{x.stav=[...new Set([...(x.stav||[]),"soustředí"])]});else if(GMV)bojHracAkce(h.id,x=>{x.stav=[...new Set([...(x.stav||[]),"soustředí"])]})}
  await kSpNacti().catch(()=>{});{const d=kSp(sp.n),h=d?kTrv(d.d):null;if(h)await kUcPridej(K,sp.n,h,sp.kon||!!(d&&d.ko))}
  kHodZapis({k:K.id,kdo:K.n,co:`Seslal ${sp.n}`,txt:`${q&&q.lab!=null?`${sp.pz.p}, ${q.lab} (${q.st}. st.)`:q?`slot ${q.st}. st.${q.pakt?" (pakt)":""}`:"trik"}${sp.zach?` · záchrana ${sp.zach}`:""}${sp.kon?" · Concentration":""}`});
  mmHlasG(`${K.n} sesílá ${sp.n}${q&&q.lab!=null?(sp.pz.sv?` ze svitku`:` (${sp.pz.p}: ${q.lab}, zbývá ${q.max-q.nab})`):q?` (slot ${q.st}. st., zbývá ${q.max-q.u-1})`:""}${sp.kon?" – soustředění":""}${sp.zach?` · záchrana ${sp.zach}`:""}.`,5000);return true}
/* ===== stránka Karty postav ===== */
const KSK={"STR":"Síla","AGI":"Obratnost","CON":"Odolnost","INT":"Inteligence","WIS":"Moudrost","CHA":"Charisma"};
const KDOVAB={"Acrobatics":"AGI","Animal Handling":"WIS","Arcana":"INT","Athletics":"STR","Deception":"CHA","History":"INT","Insight":"WIS","Intimidation":"CHA","Investigation":"INT","Medicine":"WIS","Nature":"INT","Perception":"WIS","Performance":"CHA","Persuasion":"CHA","Religion":"INT","Sleight of Hand":"AGI","Stealth":"AGI","Survival":"WIS"};
const KEF={};let KIMP=null;
const kHodyHtml=(L,cap)=>L.length?`<ol class="khody">${L.slice(0,cap||40).map(h=>`<li${h.skryty?' class="kskr"':""}><b>${besc(h.kdo||"")}</b> · ${besc(h.co||"")}${h.tot!=null?` <b class="khtot${h.krit?" bkr":h.mis?" bmis":""}">${h.tot}</b>`:""}${h.zav?(()=>{const r=h.zr?(h.zr==="0"?"":h.zr):h.zav<=2?"pok":h.zav>=5?"poz":"";return ` <span class="bzv ${r==="pok"?"zp":r==="poz"?"zb":""}" ${btip(`Kostka Závoje ${h.zav}: ${zavVys(r)}`)}>${r?zavVys(r):"bez vlivu"} ${h.zav}</span>`})():""}${h.txt?`<small>${besc(h.txt)}</small>`:""}<time>${(()=>{try{return new Date(h.cas).toLocaleTimeString("cs-CZ",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}})()}</time></li>`).join("")}</ol>`:`<p class="rsmall">Zatím žádné hody.</p>`;
function renderKarty(id){const box=document.getElementById("kartyview");if(!box)return;if(!KLOAD){KLOAD=1;Promise.all([kartyNacti(),hodyNacti()]).then(()=>renderKarty(id))}
  const K=id&&KARTBY[id];
  if(!K){box.innerHTML=`<div class="bojtit"><h2 class="arttitle">Karty postav</h2><p class="bojlead">List postavy z D&amp;D Beyond: AC, životy, záchrany, dovednosti, útoky, kouzla a vybavení. Hody se zapisují do herního záznamu družiny.</p></div>
      <ul class="klist">${KARTY.map(k=>{const S=kartaStav(k.id),hp=S.hp!=null?S.hp:k.hp;return `<li><a href="#karty/${besc(k.id)}"><b>${besc(k.n)}</b><small>${besc([k.povolani,k.druh].filter(Boolean).join(" · "))}${k.test?" · zkušební":""}</small><span>AC ${kAC(k)} · HP ${hp}/${k.hp}</span></a></li>`}).join("")||`<li class="rsmall">Zatím žádná karta.</li>`}</ul>

      ${kPrehledHtml()}${poklHtml()}<section class="khodsec"><h3 class="uvh2">Hod kostkou</h3>${kHodForm(null)}</section>${UKDB?`<section><h3 class="uvh2">Ukázky od vypravěče</h3>${ukSeznam()}${GMV?`<p class="rsmall"><a href="#sezeni">Ukázat hráčům a příprava sezení →</a></p>`:""}</section>`:""}<section><h3 class="uvh2">Herní záznam</h3>${kZaznamHtml()}</section>
      <section class="kimp"><h3 class="uvh2">Nahrát list postavy</h3><p class="rsmall">V D&amp;D Beyond otevři postavu → <i>Export to PDF</i> → stáhni PDF a nahraj ho sem. Karta se vytvoří, nebo přepíše dřívější kartu stejné postavy (stav postavy zůstane).</p>
        <label class="gbtn"><input type="file" accept="application/pdf,.pdf" data-kimp hidden>Vybrat PDF…</label>${KIMP?kImpNahled(KIMP):""}</section>`;pojZnac(box.querySelector(".kprehled"));return}
  box.innerHTML=kartaDbHtml(K,kartaDbData(K));pojZnac(box)}
/* ikony vlastností (2026-10-17): zvíře podle vlastnosti, nahoře (hnědé pole) skóre, vlevo dole (červené) modifikátor = ověření,
   vpravo dole (modré) záchrana; pole jsou umístěná v procentech obrázku art/img/vl-*.webp [vlevo, nahoře, šířka, výška] */
const KVLIK={STR:["str","býk",[22.8,4.4,53.9,13.7],[12.9,76.8,32.9,16.2],[53.7,77.1,33.1,16.0]],AGI:["agi","kočka",[23.6,4.4,53.1,14.0],[12.9,77.2,32.6,16.3],[54.2,77.4,32.0,16.1]],
  CON:["con","medvěd",[23.3,4.7,53.9,13.6],[13.2,77.3,33.1,16.3],[53.9,77.5,32.9,16.1]],INT:["int","liška",[24.1,6.7,52.1,12.9],[13.6,79.0,32.6,16.4],[54.3,78.8,32.6,16.6]],
  WIS:["wis","sova",[23.9,4.7,52.5,13.2],[13.7,78.1,31.9,17.1],[54.4,78.6,31.4,16.7]],CHA:["cha","lev",[23.7,4.7,52.7,13.2],[13.4,78.1,32.5,16.9],[54.3,78.4,32.0,16.7]]};
const kVlPos=b=>`left:${b[0]}%;top:${b[1]}%;width:${b[2]}%;height:${b[3]}%`;
/* o.zach: atributy tlačítka záchrany (v Boji jiné než na kartě); o.edit: skóre jde přepsat */
function kVlIkona(K,a,o={}){const v=kVl(K,a);if(v==null)return "";const I=KVLIK[a],zm=((kartaStav(K.id).vlU)||{})[a]!=null,pf=(K.zachProf||[]).includes(a),zs=kZach(K,a),ov=kOvB(K,a);
  return `<figure class="kvli${zm?" kvliu":""}${pf?" kvlipf":""}"><div class="kvlib"><img src="art/img/vl-${I[0]}.webp" alt="" width="260" height="346" loading="lazy" decoding="async">
    <button type="button" class="kvlh" style="${kVlPos(I[2])}" ${o.edit!==false?`data-kvled="${a}"`:"disabled"} ${btip(zm?`${KDBVL[a]}: skóre ${v} (přepsáno, v PDF ${kVl0(K,a)}) – klikni pro změnu`:`${KDBVL[a]}: skóre ${v}${o.edit!==false?" – klikni pro změnu":""}`)}>${v}</button>
    <button type="button" class="kvlm" style="${kVlPos(I[3])}" data-khod="ov:${a}" ${btip(`Ověření ${KSK[a]} (${a}): d20 ${bsg(ov)}`)}>${bsg(kMod(v))}</button>
    <button type="button" class="kvlz" style="${kVlPos(I[4])}" ${o.zach||`data-khod="za:${a}"`} ${btip(`Záchrana ${KSK[a]}${pf?" (zdatnost)":""}: d20 ${bsg(zs)}`)}>${bsg(zs)}</button></div>
    <figcaption>${KDBVL[a]}</figcaption></figure>`}
/* data pro kartu v rozvržení D&D Beyond – stejná karta na stránce Karty postav i Hra */
function kartaDbData(K){
  if(!PRED)predNacti().then(()=>{if(curView==="karty"||curView==="hra")kartyPrekresli()}).catch(()=>{});kUcVyprsi(K);
  const S=kartaStav(K.id),mx=kHPmax(K),cur=S.hp!=null?+S.hp:mx,pr=Math.max(0,Math.min(100,Math.round(cur/mx*100))),pool=kKostkyPool(K),kzMax=pool.length||kLv(K),vy=+S.vycerp||0,E=KEF[K.id]=KEF[K.id]||[];
  const ab=a=>{const v=(K.vl||{})[a];if(v==null)return "";const m=kMod(v);return `<button type="button" class="kab" data-khod="ov:${a}" ${btip(`Ověření ${KSK[a]} (${a}): d20 ${bsg(m)}`)}><small>${a}</small><b>${v}</b><i>${bsg(m)}</i></button>`};
  const zach=BAB.map(a=>`<button type="button" class="kzb${(K.zachProf||[]).includes(a)?" kprof":""}" data-khod="za:${a}"><span>${a}</span><b>${bsg(kZach(K,a))}</b></button>`).join("");
  const dov=Object.entries(K.dov||{}).map(([n,v])=>`<button type="button" class="kdov${(K.dovProf||{})[n]?" kprof":""}" data-khod="dv:${besc(n)}"><span>${besc(n)} <small>${KDOVAB[n]||""}</small>${(K.dovProf||{})[n]==="E"?' <i title="Expertise">E</i>':""}</span><b>${bsg(v)}</b></button>`).join("");
  const ef=kEfHtml(K,E,"data-kef");
  const ut=(K.utoky||[]).map((a,i)=>`<li><b>${besc(a.n)}</b>${a.pocet>1?` <small>${a.pocet}× za akci</small>`:""} <button type="button" class="gbtn ghost" data-khod="ut:${i}">Útok ${bsg(+a.b||0)}</button>${a.z?`<button type="button" class="gbtn ghost" data-kzr="${i}">Zranění ${besc(a.z)} ${besc(BZRT[a.t]||a.t||"")}</button><button type="button" class="gbtn ghost" data-kzr="${i}" data-krit="1" ${btip("Kritický zásah: dvojnásob kostek")}>krit</button>`:""}${(a.vl||[]).length?`<br><small>${besc(a.vl.join(", "))}</small>`:""}${a.pozn?`<br><small>${besc(a.pozn)}</small>`:""}</li>`).join("");
  const kz=K.kouzla||{},sl=kSloty(K),U=S.zdr||{};
  const slH=sl.length?`<div class="bkzdr">${sl.map(q=>`<span class="bzd"><span>${q.pakt?"Pakt":"Sloty"} ${q.st}. st.</span>${[...Array(q.max)].map((_,j)=>`<button type="button" class="${j<q.u?"on":""}" data-kzd="${q.k}" data-j="${j}" aria-label="Slot ${q.st}. st. ${j+1} z ${q.max}${j<q.u?" – použit":""}"></button>`).join("")}</span>`).join("")}</div>`:"";
  const spH=(kz.seznam||[]).length?[0,1,2,3,4,5,6,7,8,9].filter(l=>kz.seznam.some(x=>x.st===l)).map(l=>`<h4 class="bsph">${l?l+". stupeň":"Triky"}</h4><ul class="kspl">${kz.seznam.map((x,i)=>[x,i]).filter(([x])=>x.st===l).map(([x,i])=>`<li><button type="button" class="kspn" data-kspd="${i}" ${btip("Popis kouzla")}>${besc(x.n)}</button>${x.kon?` <span class="kkon" ${btip("Concentration")}>◎</span>`:""}${x.vzdy?` <small ${btip("Vždy připravené")}>P</small>`:""} <small>${besc([x.cas,x.dosah,x.trvani].filter(Boolean).join(" · "))}${x.zach?` · záchrana ${besc(x.zach)}`:""}</small>
      ${x.utok!=null?`<button type="button" class="gbtn ghost" data-khod="ks:${i}">Útok ${bsg(x.utok)}</button>`:""}${l>0?`<button type="button" class="gbtn ghost" data-kses="${i}">Seslat</button>`:x.kon||x.zach?`<button type="button" class="gbtn ghost" data-kses="${i}">Seslat</button>`:""}</li>`).join("")}</ul>`).join(""):"";
  const zd=(K.zdroje||[]).map(q=>{const u=Math.min(q.max,U[q.n]||0);return `<span class="bzd" ${btip(`${q.n}: použito ${u} z ${q.max}${q.obn?" · obnova: "+q.obn:""}`)}><span>${besc(q.n)}</span>${[...Array(q.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(q.n)}" data-j="${j}" aria-label="${besc(q.n)} ${j+1} z ${q.max}"></button>`).join("")}</span>`}).join("");
  const inv=S.inv||K.vybaveni||[],pen=S.pen||K.penize||{};
  const NOS=kNoseno(inv),obl=(x,i)=>{const r=kZbrInfo(x);if(!r)return "";const on=(NOS.z&&NOS.z.i===i)||(NOS.s&&NOS.s.i===i);return ` <button type="button" class="kobl${on?" on":""}" data-kobl="${i}" aria-pressed="${!!on}" ${btip(on?`${r.k==="s"?"Štít":"Zbroj"} na sobě – AC ${r.k==="s"?"+"+r.ac:r.ac}. Klikni, když ji postava sundá.`:`${r.k==="s"?"Štít":"Zbroj"} jen nesená – klikni, když si ji postava oblékne (AC se přepočítá).`)}>${on?"na sobě":"obléct"}</button>`};
  const KN=new Set(inv.filter(x=>KKONT.test(x.n)).map(x=>x.n)),ord=[];inv.forEach((x,i)=>{if(!x.v||!KN.has(x.v)){ord.push(i);if(KN.has(x.n))inv.forEach((y,j)=>{if(y.v===x.n&&j!==i)ord.push(j)})}});
  const kontSel=(x,i)=>KINVR&&KN.size&&!KN.has(x.n)?` <select class="kinvsel" data-kinvv="${i}" aria-label="Kde je ${besc(x.n)}"><option value="">volně</option>${[...KN].map(n=>`<option${x.v===n?" selected":""}>${besc(n)}</option>`).join("")}</select>`:"";
  const kontW=n=>{const c=inv.filter(y=>y.v===n);return c.length?` <small class="kinvobs">${c.length} věcí${KKONTM.test(n)?" · bez váhy":` · ${String(Math.round(c.reduce((a,y)=>a+kLb(y.w),0)*10)/10).replace(".",",")} lb`}</small>`:""};
  const invH=`${KN.size?`<p class="kinvtl"><button type="button" class="gbtn ghost${KINVR?" on":""}" data-kinvr aria-pressed="${KINVR}" ${btip("Rozložit věci do batohů a vaků; obsah magických vaků (Bag of Holding…) se do zátěže nepočítá")}>${KINVR?"Hotovo":"Uspořádat do batohů"}</button></p>`:""}<ul class="kinv">${ord.map(i=>[inv[i],i]).map(([x,i])=>`<li${x.v&&KN.has(x.v)?' class="kinvin"':""}><span>${kPred(x)?`<button type="button" class="kspn" data-kinvpop="${i}" ${btip("Popis magického předmětu")}>${besc(x.n)}</button>${kPred(x).ef&&(kPred(x).ef.lecit||kPred(x).ef.dhp)?` <button type="button" class="gbtn ghost" data-kinvpij="${i}">vypít</button>`:""}`:besc(x.n)}${obl(x,i)}${kNabHtml(x,i)}${x.pripoutano||(kPred(x)&&kPred(x).pr)?` <button type="button" class="kpri${x.pripoutano?" on":""}" data-kpri="${i}" ${btip(x.pripoutano?"Připoutaný magický předmět (Attunement) – klikni pro zrušení":"Předmět vyžaduje připoutání (Attunement) – klikni pro připoutání, nejvýš 3")}>◆</button>`:""}${x.w?` <small>${besc(x.w)}</small>`:""}${KN.has(x.n)?kontW(x.n):""}${kontSel(x,i)}</span><span class="kq"><button type="button" class="gbtn ghost" data-kinv="${i}" data-d="-1" aria-label="Ubrat">−</button><b>${x.q}</b><button type="button" class="gbtn ghost" data-kinv="${i}" data-d="1" aria-label="Přidat">+</button></span></li>`).join("")}</ul>
    <form class="kinvf" data-kinvf><input name="n" placeholder="nový předmět" required maxlength="80"><input name="q" type="number" min="1" max="9999" value="1" aria-label="Počet"><button class="gbtn ghost">Přidat</button></form>
    <div class="kpen">${["PP","GP","EP","SP","CP"].map(k=>`<label>${k} <input type="number" min="0" max="9999999" data-kpen="${k}" value="${+pen[k]||0}"></label>`).join("")}</div><p class="rsmall">PP platina, GP zlaté, EP elektrum, SP stříbrné, CP měďáky (podle D&amp;D Beyond).</p>${kPenSmenHtml()}`;
  const pop=K.popis||{},popH=Object.keys(pop).length?`<dl class="kpop">${[["vira","Víra"],["presvedceni","Přesvědčení"],["pohlavi","Pohlaví"],["vek","Věk"],["velikost","Velikost"],["vyska","Výška"],["vaha","Váha"],["oci","Oči"],["vlasy","Vlasy"],["pokozka","Pleť"],["pribeh","Příběh"],["povaha","Povaha"],["idealy","Ideály"],["pouta","Pouta"],["vady","Vady"],["spojenci","Spojenci a řády"],["poznamky","Poznámky"]].filter(([k])=>pop[k]).map(([k,l])=>`<dt>${l}</dt><dd>${besc(pop[k]).replace(/\n/g,"<br>")}</dd>`).join("")}</dl>`:"";
  const ja=HODY.filter(h=>h.k===K.id);
  const tabs=[["hody","Hody"],["akce","Akce"],...(kz.seznam||(S.kpn||[]).length?[["kouzla","Kouzla"]]:[]),["vybaveni","Vybavení"],["duse","Duše"],["spol","Společníci"],["denik","Deník"]];if(!KSPD)kSpNacti().then(()=>kartyPrekresli()).catch(()=>{});let tab=KTAB.get();if(!tabs.some(x=>x[0]===tab))tab="hody";
  const sec=(id,h)=>`<section class="ktab" data-tab="${id}"${tab===id?"":" hidden"}>${h}</section>`;
  const ro=!kMuze(K),zat=kZatez(K,inv,pen),pri=inv.filter(x=>x.pripoutano).length;
  return {ef,zd,slH,invH,popH,ja,tabs0:tabs,sec,ro,zat,pri,S,mx,cur,pr,kzMax,vy,kz}}
/* ===== karta postavy v rozvržení D&D Beyond (2026-10-16): hlavička, vlastnosti, zdatnost, rychlost, inspirace,
   Svědomí, životy; záchrany, smysly, zdatnosti; dovednosti a hod kostkou; iniciativa, AC, obrana a stavy;
   záložky Akce · Kouzla · Vybavení · Rysy · Duše · Zázemí · Poznámky · Společníci. Používá pomocné funkce karty
   (kAkceHtml, kSpListHtml, kStavHtml, kRysyHtml, kDoplHtml, kSpolHtml, kAC). ===== */
const KDBFLT={a:"all",q:""};
const KDBVL={STR:"Síla",AGI:"Obratnost",CON:"Odolnost",INT:"Inteligence",WIS:"Moudrost",CHA:"Charisma"};
const kdbPanel=(cls,tit,h)=>`<section class="kdbp ${cls}">${h}${tit?`<h3 class="kdbpt">${tit}</h3>`:""}</section>`;
const kdbChips=(gr,cur,L)=>`<div class="kdbchips" role="group">${L.map(([k,l])=>`<button type="button" data-kdbf="${gr}:${k}" aria-pressed="${cur===k}">${l}</button>`).join("")}</div>`;
function kdbPips(K,q){const U=kartaStav(K.id).zdr||{},u=Math.min(q.max,U[q.k]||0);
  return `<span class="kdbpips" ${btip(`${q.n}: použito ${u} z ${q.max}${q.obn?" · obnova: "+q.obn:""}`)}>${[...Array(q.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(q.k)}" data-j="${j}" aria-label="${besc(q.n)} ${j+1} z ${q.max}${j<u?" – použito":""}"></button>`).join("")}${q.obn?`<small>/ ${besc(q.obn)}</small>`:""}</span>`}
function kartaDbHtml(K,o,o2){const {ef,invH,popH,ja,sec,ro,zat,pri,S,mx,cur,pr,kzMax,vy,kz}=o,E=KEF[K.id]||[],D=kDuse(K),P=kParty(K)||{},prof=K.zachProf||[],dp=K.dovProf||{},ac=kAC(K);
  /* hlavička */
  const IMG=kImg(K),portH=IMG?`<img class="kdbport" src="${besc(IMG)}" alt="" width="72" height="72">`:`<span class="kdbport kdbini">${besc((K.n||"?")[0])}</span>`;
  const head=`<div class="kdbhead">${kMuze(K)&&window.MMDB?`<label class="kdbportw" ${btip("Změnit portrét – obrázek z telefonu")}>${portH}<input type="file" accept="image/*" data-kimg hidden></label>`:portH}
    <div class="kdbnm"><h2>${besc(K.n)}</h2><p>${besc([K.druh,K.povolani].filter(Boolean).join(" · "))}</p><p class="kdblv">${kLv(K)}. úroveň${kTridy(K).length>1?` <small>(${besc(kTridy(K).map(t=>t.n+" "+t.u).join(" / "))})</small>`:""}${K.hrac?` · hraje ${besc(K.hrac)}`:""}${K.test?" · <i>zkušební</i>":""}</p></div>
    <div class="kdbhb">${kZpetBtn(K)}<a class="kdbbtn" href="#boj" data-bdmgo="${besc(K.id)}" ${btip("Bojová karta v Boji – rozvržení jako D&D Beyond na telefonu; životy, sloty a stavy jsou společné s touto kartou")}>⚔ Bojová karta</a><button type="button" class="kdbbtn" data-kodp="k" ${btip("Krátký odpočinek (1 hodina): kostky životů, zdroje s krátkým odpočinkem, sloty paktu")}>☾ Krátký</button><button type="button" class="kdbbtn" data-kodp="d" ${btip("Dlouhý odpočinek (8 hodin): životy, sloty, zdroje, polovina kostek životů, vyčerpání −1")}>☾☾ Dlouhý</button>${kMuze(K)?`<button type="button" class="kdbbtn${KUPRO.has(K.id)?" on":""}" data-kuprt aria-expanded="${KUPRO.has(K.id)}" ${btip("Úpravy postavy: povolání a úrovně, vlastnosti, výpočty, předměty, vlastní úpravy")}>⚙ Úpravy</button>`:""}<details class="kdbmenu"><summary class="kdbbtn" aria-label="Další volby">⋯</summary><div>${kMuze(K)?`<button type="button" class="kdbbtn" data-klvup ${btip("Postup na další úroveň: životy, nové rysy, vlastnosti nebo feat")}>⬆ Postup na úroveň</button>`:""}${window.MMDB?`<button type="button" class="kdbbtn" data-khistb ${btip("Předchozí stavy karty – lze obnovit")}>Historie</button>`:""}${S.img&&kMuze(K)?`<button type="button" class="kdbbtn" data-kimgx>Odebrat portrét</button>`:""}<button type="button" class="kdbbtn" data-ktisk ${btip("Vytiskne celou kartu nebo ji uloží jako PDF")}>Tisk</button><button type="button" class="kdbbtn" data-kexport ${btip("Stáhne kartu a stav postavy jako JSON")}>Export</button>${GMV&&!KSTAT.has(K.id)&&!K.test?`<button type="button" class="kdbbtn" data-ksmaz>Smazat kartu</button>`:""}${o2&&o2.hra?`<a class="kdbbtn" href="#karty/${besc(K.id)}">Samostatná karta →</a>`:`<a class="kdbbtn" href="#karty">Všechny karty</a>`}</div></details></div></div>`;
  /* pruh: AC, životy, iniciativa, rychlost, zdatnost, inspirace, Svědomí */
  const acR=kACR(K),thp=S.thp||0;
  const strip=`<div class="kdbtop kdbstrip">
    <div class="kdbs kdbsac" ${btip(`AC ${ac}: ${acR.txt}`)}><small>AC</small><b>${ac}</b></div>
    <div class="kdbs kdbshp khp${cur<=mx/2?" bhp2":""}${cur<=0?" bhp0":""}" ${btip(`Životy ${cur}/${mx}${thp?` + ${thp} dočasné`:""} · maximum: ${kRozpis(kHodn(K,"hp").L)}`)}><small>Životy</small><b>${cur}<i>/${mx}</i>${thp?`<em>+${thp}</em>`:""}</b><i class="kdbhpbar" style="--p:${pr}%"></i></div>
    <span class="kzrb kdbszr"><input type="number" min="0" max="999" data-kzrv inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-kzrz="z" aria-label="Zranit" ${btip("Zranění – s odolnostmi a dočasnými HP")}>−</button><button type="button" class="kdbheal" data-kzrz="l" aria-label="Léčit" ${btip("Léčení")}>+</button><select data-kzrt aria-label="Typ zranění" ${btip("Typ zranění")}><option value="">typ</option>${BZTYPY.map(t=>`<option value="${t}">${BZRT[t]}</option>`).join("")}</select><button type="button" class="kdbmini" data-kzrz="d" ${btip("Zadané číslo jako dočasné HP")}>doč.</button></span>
    <button type="button" class="kdbs" data-khod="in" ${btip(`Iniciativa: d20 ${bsg(kIni(K))} · ${kRozpis(kHodn(K,"ini").L)}`)}><small>Iniciativa</small><b>${bsg(kIni(K))}</b></button>
    <div class="kdbs" ${btip(`${kRychTxt(K)} · ${kRozpis(kHodn(K,"rych").L)}${kVycerp(K)?` · vyčerpání −${5*kVycerp(K)}`:""}`)}><small>Rychlost</small><b>${kRychN(K)}<i> st.</i></b>${zat.pret?`<small class="bhrich">přetížen</small>`:""}</div>
    <div class="kdbs" ${btip("Bonus zdatnosti")}><small>Zdatnost</small><b>${bsg(kPB(K))}</b></div>
    <label class="kdbs kdbinsp" ${btip("Heroic Inspiration – zaškrtni, když ji postava má")}><input type="checkbox" data-kinsp${S.insp?" checked":""}><span aria-hidden="true"></span><small>Inspirace</small></label>
    <div class="kdbs" ${btip(SVST(D.sv))}><small>Svědomí</small><b class="psv psv${kSvKl(D.sv)}">${D.sv}</b></div></div>`;
  /* vlastnosti v jednom řádku – ikony se zvířaty (skóre, ověření, záchrana) */
  const ab=BAB.map(a=>kVlIkona(K,a,{edit:kMuze(K)})).join("");
  const abr=`<div class="kdbabr kvlr">${ab}</div>`;
  /* hlášení a stavy */
  const konH=KKON[K.id]&&kKonDrzi(K)?`<p class="khl kdbkon">${bi("soustredi")} <b>Soustředění:</b> CON záchrana SO ${KKON[K.id]} <button type="button" class="gbtn" data-kkonh>🎲 CON ${bsg(kZach(K,"CON"))}${K.konVyhoda?" s výhodou":""}</button><button type="button" class="kx" data-kkonx aria-label="Zavřít">×</button></p>`:"";
  const hl=kHlas([postupBanner(K),konH,kZavBox(K),kPoslBox(K)]);
  const stavy=`<div class="kbar1 kdbstavy">${kStavyChipy("k:"+K.id,S.stavy||[],KSTV,"data-kstav",t=>{const d=SRDST[t];return d?`${t} (${d.en}) – ${d.t}`:t})}${vy?`<span class="kchip kchst" ${btip(`Vyčerpání ${vy}: −${2*vy} k hodům d20, rychlost −${5*vy}`)}>vyčerpání ${vy}</span>`:""}${kUc(K).length?`<span class="kchip" ${btip(kUc(K).map(x=>x.n).join(", "))}>účinky ${kUc(K).length}</span>`:""}${S.forma?`<span class="kchip kchst" ${btip(`Podoba ${S.forma.n}: AC ${S.forma.ac}`)}>🐾 ${besc(S.forma.n)}</span>`:""}</div>`;
  /* záložky – kreslí se jen otevřená */
  const tabs=[["hody","Hody"],["akce","Akce"],...(kz.seznam||(S.kpn||[]).length?[["kouzla","Kouzla"]]:[]),["vybaveni","Vybavení"],["rysy","Rysy"],["duse","Duše"],["info","Info"],["denik","Poznámky"],["spol","Společníci"]];let tab=KTAB.get();if(tab==="zazemi")tab="info";if(!tabs.some(x=>x[0]===tab))tab="hody";
  const telo=id=>{
    if(id==="hody"){
  const zach=kdbPanel("kdbzach","Záchranné hody",`<div class="kdbzg">${BAB.map(a=>`<div class="kdbzr${prof.includes(a)?" kprof":""}"><i class="kdbdot" aria-hidden="true"></i><span>${a}</span><button type="button" data-khod="za:${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K,a))} · ${kRozpis(kHodn(K,"zach",a).L)}`)}>${bsg(kZach(K,a))}</button></div>`).join("")}</div>${(K.zachPozn||[]).length?`<p class="kdbnote">${K.zachPozn.map(besc).join("<br>")}</p>`:""}`);
  const pas=K.pasiv||{},sm=kdbPanel("kdbsmy","Smysly",`${[["vnimani","Pasivní Vnímání"],["patrani","Pasivní Pátrání"],["vhled","Pasivní Vhled"]].map(([k,l])=>`<div class="kdbsr" ${btip(kRozpis(kHodn(K,"pas",k).L))}><b>${kPas(K,k)}</b><span>${l}</span></div>`).join("")}<p class="kdbnote">${besc(K.smysly||"Další smysly: žádné")}</p>`);
  const dpl=kDoplHtml(K).replace(/<h3 class="uvh2">Zdatnosti a jazyky<\/h3>/,""),dpi=dpl.indexOf('<h3 class="uvh2">Doplnit'),zdat=kdbPanel("kdbzdat","Zdatnosti a jazyky",dpi>=0?dpl.slice(0,dpi):dpl),dplX=dpi>=0?dpl.slice(dpi):"";
  const dov=kdbPanel("kdbdov","Dovednosti",`<div class="kdbdh"><span>Zd.</span><span>Vl.</span><span>Dovednost</span><span>Bonus</span></div>${Object.keys(KDOVAB).filter(n=>(K.dov||{})[n]!=null).map(n=>`<div class="kdbdr${dp[n]?" kprof":""}${dp[n]==="E"?" kexp":""}"><i class="kdbdot" aria-hidden="true"></i><small>${KDOVAB[n]}</small><span>${besc(n)}</span><button type="button" data-khod="dv:${besc(n)}" ${btip(`${n}: d20 ${bsg(kDov(K,n))} · ${kRozpis(kHodn(K,"dov",n).L)}`)}>${bsg(kDov(K,n))}</button></div>`).join("")}`);
  const hod=kdbPanel("kdbhod","Hod kostkou",`${kPriHtml(K)}<p class="kadv" role="radiogroup" aria-label="Další hod">${[[0,"normálně"],[1,"výhoda"],[-1,"nevýhoda"]].map(([k,l])=>`<label><input type="radio" name="kadv" data-kadv="${k}"${KADV===k?" checked":""}> ${l}</label>`).join("")}${GMV?` <label><input type="checkbox" data-kskr${window.KSKR?" checked":""}> skrytý</label>`:""}</p>${kHodForm(K)}`);
      return `<div class="kdbhody"><div>${zach}${hod}</div><div>${dov}</div></div>`}
    if(id==="info"){
  const zach_=kdbPanel("kdbzach","Záchranné hody",`<div class="kdbzg">${BAB.map(a=>`<div class="kdbzr${prof.includes(a)?" kprof":""}"><i class="kdbdot" aria-hidden="true"></i><span>${a}</span><button type="button" data-khod="za:${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K,a))} · ${kRozpis(kHodn(K,"zach",a).L)}`)}>${bsg(kZach(K,a))}</button></div>`).join("")}</div>${(K.zachPozn||[]).length?`<p class="kdbnote">${K.zachPozn.map(besc).join("<br>")}</p>`:""}`);
  const pas=K.pasiv||{},sm=kdbPanel("kdbsmy","Smysly",`${[["vnimani","Pasivní Vnímání"],["patrani","Pasivní Pátrání"],["vhled","Pasivní Vhled"]].map(([k,l])=>`<div class="kdbsr" ${btip(kRozpis(kHodn(K,"pas",k).L))}><b>${kPas(K,k)}</b><span>${l}</span></div>`).join("")}<p class="kdbnote">${besc(K.smysly||"Další smysly: žádné")}</p>`);
  const dpl=kDoplHtml(K).replace(/<h3 class="uvh2">Zdatnosti a jazyky<\/h3>/,""),dpi=dpl.indexOf('<h3 class="uvh2">Doplnit'),zdat=kdbPanel("kdbzdat","Zdatnosti a jazyky",dpi>=0?dpl.slice(0,dpi):dpl),dplX=dpi>=0?dpl.slice(dpi):"";
  const dov_=kdbPanel("kdbdov","Dovednosti",`<div class="kdbdh"><span>Zd.</span><span>Vl.</span><span>Dovednost</span><span>Bonus</span></div>${Object.keys(KDOVAB).filter(n=>(K.dov||{})[n]!=null).map(n=>`<div class="kdbdr${dp[n]?" kprof":""}${dp[n]==="E"?" kexp":""}"><i class="kdbdot" aria-hidden="true"></i><small>${KDOVAB[n]}</small><span>${besc(n)}</span><button type="button" data-khod="dv:${besc(n)}" ${btip(`${n}: d20 ${bsg(kDov(K,n))} · ${kRozpis(kHodn(K,"dov",n).L)}`)}>${bsg(kDov(K,n))}</button></div>`).join("")}`);
  const hod_=kdbPanel("kdbhod","Hod kostkou",`${kPriHtml(K)}<p class="kadv" role="radiogroup" aria-label="Další hod">${[[0,"normálně"],[1,"výhoda"],[-1,"nevýhoda"]].map(([k,l])=>`<label><input type="radio" name="kadv" data-kadv="${k}"${KADV===k?" checked":""}> ${l}</label>`).join("")}${GMV?` <label><input type="checkbox" data-kskr${window.KSKR?" checked":""}> skrytý</label>`:""}</p>${kHodForm(K)}`);
  const def=[["Resistance",kOdol(K)],["Immunity",K.imu],["Vulnerability",K.zra]].filter(([,L])=>(L||[]).length),acR=kACR(K),zdr0=kOdolZ(K);
      const obr=kdbPanel("kdbdef","Obrana",`${def.length?def.map(([l,L])=>`<p><b>${l}</b> ${L.map(t=>`${bikZr(t)}<span>${besc(BZRT[t]||t)}</span>`).join(" ")}</p>`).join(""):`<p class="kdbnote">Resistance, Immunity ani Vulnerability</p>`}${zdr0?`<p class="kdbnote">${bikZb(zdr0)}Resistance ze zbroje (${besc(zdr0.toLowerCase())}, Artikule)</p>`:""}${kZbrUHtml(K)?`<p class="kdbnote">Výdrž zbroje (obětování při kritickém zásahu): ${kZbrUHtml(K)}</p>`:""}${K.obrana&&!def.length?`<p class="kdbnote">${besc(K.obrana)}</p>`:""}
        <p class="kdbvy" ${btip(`Kostky životů ${kHDtxt(K)}: použité zaškrtni (krátký odpočinek je utratí sám)`)}><small>Kostky životů ${besc(kHDtxt(K))}</small>${[...Array(kzMax)].map((_,j)=>`<button type="button" class="${j<(+S.kz||0)?"on":""}" data-kkz="${j}" aria-label="Kostka životů ${j+1}"></button>`).join("")}</p>
        <p class="kdbvy" ${btip(vy?`Vyčerpání ${vy}: −${2*vy} k hodům d20`:"Vyčerpání")}>${bi("vycerpani","kvyi")}<small>Vyčerpání</small>${[...Array(6)].map((_,j)=>`<button type="button" class="${j<vy?"on":""}" data-kvy="${j}" aria-label="Vyčerpání ${j+1}"></button>`).join("")}</p>`);
      return `<div class="kdbinfo">${obr}${sm}${zdat}<section class="kdbp"><h4 class="kdbsh">Zázemí</h4><p class="kdbbig">${besc(K.pozadi||"–")}</p>${popH?`<h4 class="kdbsh">O postavě</h4>${popH}`:`<p class="kdbnote">Popis postavy se načte z PDF.</p>`}</section></div>`}
    if(id==="akce"){
  const zach_=kdbPanel("kdbzach","Záchranné hody",`<div class="kdbzg">${BAB.map(a=>`<div class="kdbzr${prof.includes(a)?" kprof":""}"><i class="kdbdot" aria-hidden="true"></i><span>${a}</span><button type="button" data-khod="za:${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K,a))} · ${kRozpis(kHodn(K,"zach",a).L)}`)}>${bsg(kZach(K,a))}</button></div>`).join("")}</div>${(K.zachPozn||[]).length?`<p class="kdbnote">${K.zachPozn.map(besc).join("<br>")}</p>`:""}`);
  const pas=K.pasiv||{},sm=kdbPanel("kdbsmy","Smysly",`${[["vnimani","Pasivní Vnímání"],["patrani","Pasivní Pátrání"],["vhled","Pasivní Vhled"]].map(([k,l])=>`<div class="kdbsr" ${btip(kRozpis(kHodn(K,"pas",k).L))}><b>${kPas(K,k)}</b><span>${l}</span></div>`).join("")}<p class="kdbnote">${besc(K.smysly||"Další smysly: žádné")}</p>`);
  const dpl=kDoplHtml(K).replace(/<h3 class="uvh2">Zdatnosti a jazyky<\/h3>/,""),dpi=dpl.indexOf('<h3 class="uvh2">Doplnit'),zdat=kdbPanel("kdbzdat","Zdatnosti a jazyky",dpi>=0?dpl.slice(0,dpi):dpl),dplX=dpi>=0?dpl.slice(dpi):"";
  const dov_=kdbPanel("kdbdov","Dovednosti",`<div class="kdbdh"><span>Zd.</span><span>Vl.</span><span>Dovednost</span><span>Bonus</span></div>${Object.keys(KDOVAB).filter(n=>(K.dov||{})[n]!=null).map(n=>`<div class="kdbdr${dp[n]?" kprof":""}${dp[n]==="E"?" kexp":""}"><i class="kdbdot" aria-hidden="true"></i><small>${KDOVAB[n]}</small><span>${besc(n)}</span><button type="button" data-khod="dv:${besc(n)}" ${btip(`${n}: d20 ${bsg(kDov(K,n))} · ${kRozpis(kHodn(K,"dov",n).L)}`)}>${bsg(kDov(K,n))}</button></div>`).join("")}`);
  const hod_=kdbPanel("kdbhod","Hod kostkou",`${kPriHtml(K)}<p class="kadv" role="radiogroup" aria-label="Další hod">${[[0,"normálně"],[1,"výhoda"],[-1,"nevýhoda"]].map(([k,l])=>`<label><input type="radio" name="kadv" data-kadv="${k}"${KADV===k?" checked":""}> ${l}</label>`).join("")}${GMV?` <label><input type="checkbox" data-kskr${window.KSKR?" checked":""}> skrytý</label>`:""}</p>${kHodForm(K)}`);
  /* záložka Akce: útoky jako tabulka, pak akce / bonusové akce / reakce / ostatní, omezené použití */
  const efH=ef?`<div class="kef">${ef}</div>`:"",UT=kUtoky(K);
  const utR=UT.map((a,i)=>`<tr${KZBRV[K.id]===a.n?' class="kdbzv"':""}><td>${kJeZbran(K,a.n)?`<button type="button" class="kzvb${KZBRV[K.id]===a.n?" on":""}" data-kzbrv="${besc(a.n)}" aria-pressed="${KZBRV[K.id]===a.n}" ${btip(KZBRV[K.id]===a.n?"Zbraň v ruce – v Boji se nabídne první. Klikni pro zrušení.":"Zvolit jako zbraň v ruce (v Boji se nabídne první)")}>✋</button>`:""}<b>${besc(a.n)}</b><small>${besc([a.dal?"na dálku":"zblízka",...(a.vl||[])].join(" · "))}</small></td><td>${a.dal?"dálka":"5 st."}</td><td><button type="button" class="kdbbox" data-khod="ut:${i}" ${btip(`Útok ${a.n}: d20 ${bsg(+a.b||0)}${a.pocet>1?` · ${a.pocet}× za akci`:""}`)}>${bsg(+a.b||0)}</button></td><td>${a.z?`<button type="button" class="kdbbox kdbz" data-kzr="${i}" ${btip(`Zranění ${a.z} ${BZRT[a.t]||a.t||""}`)}>${besc(a.z)} ${bikZr(a.t)}</button><button type="button" class="kdbmini" data-kzr="${i}" data-krit="1" ${btip("Kritický zásah: dvojnásob kostek")}>krit</button>`:"–"}</td><td><small>${a.pocet>1?`${a.pocet}× za akci. `:""}${besc(a.pozn||"")}${typeof kMunTxt==="function"?kMunTxt(K,a):""}</small></td></tr>`).join("");
  const sekce=(k,t,h)=>h?`<section class="kdbsec" data-kac="${k}"${KDBFLT.a!=="all"&&KDBFLT.a!==k?" hidden":""}>${t?`<h4 class="kdbsh">${t}</h4>`:""}${h}</section>`:"";
  let ak=kAkceHtml(K,true),ai=0;const AKK=["A","BA","R","X"];ak=ak.replace(/<section>/g,()=>{const k=AKK[ai++]||"X";return `<section data-kac="${k}"${KDBFLT.a!=="all"&&KDBFLT.a!==k?" hidden":""}>`});
  const zdrL=[...kSloty(K).map(q=>({k:q.k,n:`${q.pakt?"Pakt":"Sloty"} ${q.st}. st.`,max:q.max,obn:q.pakt?"krátký odpočinek":"dlouhý odpočinek"})),...kZdroje(K).map(q=>({k:q.n,n:q.n,max:q.max,obn:q.obn})),...(kVydMax(K)?[{k:"Výdrž",n:"Výdrž",max:kVydMax(K),obn:"dlouhý odpočinek"}]:[])];
  const akceT=`${kForma(K)?kFormaHtml(K):""}${kdbChips("a",KDBFLT.a,[["all","Vše"],["utok","Útok"],["A","Akce"],["BA","Bonusová akce"],["R","Reakce"],["X","Ostatní"],["omez","Omezené použití"]])}
    ${sekce("utok",`Útoky <small>· v tahu: pohyb (${besc(kRychTxt(K))}), akce, bonusová akce, reakce</small>`,`${efH}<table class="kdbtab kdbut"><thead><tr><th>Útok</th><th>Dosah</th><th>Zásah</th><th>Zranění</th><th>Poznámky</th></tr></thead><tbody>${utR||`<tr><td colspan="5"><i>žádné útoky</i></td></tr>`}</tbody></table>`)}
    <div class="kdbak">${ak}</div>
    ${KDBFLT.a==="all"||KDBFLT.a==="X"||KDBFLT.a==="omez"?kSchopHtml(K):""}
    ${sekce("omez","Omezené použití",zdrL.length?`<ul class="kdbli kdbzdr">${zdrL.map(q=>`<li><b>${besc(q.n)}</b>${kdbPips(K,q)}</li>`).join("")}</ul>`:`<p class="kdbnote">Nic s omezeným počtem použití.</p>`)}
    ${sekce("X","",kSermHtml(K))}${dplX?`<details class="bjapd kdbdpl"><summary>Doplnit útok nebo schopnost, které v PDF chybí</summary>${dplX.replace(/<h3 class="uvh2">[^<]*<\/h3>/,"")}</details>`:""}`;
      return akceT}
    if(id==="kouzla"){
  /* záložka Kouzla */
  const kouzlaT=`<div class="kdbkzh"><span><b>${besc(kSpAb(K)||"–")}</b></span><span><b>${bsg(kSpUt(K))}</b><small>útok kouzlem</small></span><span><b>${kSpDC(K)||"–"}</b><small>SO záchrany</small></span></div>
    <div class="kdbsrch"><input type="search" data-kdbq placeholder="Hledat kouzlo podle názvu, seslání, dosahu…" value="${besc(KDBFLT.q)}" aria-label="Hledat kouzlo"></div>
    ${o.slH?`<div class="kdbslots"><h4 class="kdbsh">Sloty</h4>${o.slH}</div>`:""}<div class="kdbspl">${kSpListHtml(K)}</div><p class="kdbnote">Klikni na název kouzla – ukáže se jeho popis. U kouzel s více sloty vyber stupeň, zranění se podle něj přepočítá.</p><details class="bjapd kpripw"><summary>Připravit nebo vyměnit kouzla</summary>${kPripHtml(K)}</details>`;
      return kouzlaT}
    if(id==="vybaveni"){
  /* záložka Vybavení */
  const vybT=`<div class="kdbinvh"><span><small>Neseno</small><b>${zat.w?String(Math.round(zat.w*10)/10).replace(".",","):"0"} lb</b><small>${zat.pret?`<b class="bhrich">přetížen</b> – víc než ${zat.max} lb`:`unese ${zat.max} lb`}</small></span><span><small>Připoutáno</small><b>${pri}/3</b></span></div>${kPoolHtml(K)}${invH}`;
      return vybT}
    if(id==="rysy")return kRysyHtml(K)||`<p class="kdbnote">Žádné rysy – nahraj list postavy z D&amp;D Beyond.</p>`;
    if(id==="duse")return `<div class="kgrid"><div>${kDuseHtml(K)}</div><div>${kRanyHtml(K)}${kUcHtml(K)}</div></div>`;
    if(id==="denik")return `<div class="kgrid"><div><h4 class="kdbsh">Poznámky a deník</h4><textarea class="kpozn" data-kpozn rows="12" maxlength="4000" placeholder="Koho jsme potkali, co jsme slíbili, co si pamatovat…">${besc(S.pozn||"")}</textarea><p class="kdbnote">Ukládá se samo. Vidí je každý, kdo otevře kartu – tajnosti pošli vypravěči ze stránky Hra.</p></div><div><h4 class="kdbsh">Herní záznam</h4>${kHodyHtml(ja,30)}<p class="kdbnote"><a href="#karty">Celý záznam družiny →</a></p></div></div>`;
    if(id==="spol")return kFormaHtml(K)+kSpolHtml(K);return ""};
  const tabsH=`<section class="kdbp kdbtabs"><nav class="ktabs" role="tablist">${tabs.map(([id,n])=>`<button type="button" role="tab" data-ktab="${id}" aria-selected="${tab===id}">${n}</button>`).join("")}</nav><section class="ktab" data-tab="${tab}">${telo(tab)}</section></section>`;
  kModsSync(K);
  return `<div data-kid="${besc(K.id)}" class="kcard kdb kdb2${ro?" kro":""}">${head}
    ${ro?`<p class="kropozn">Tuto kartu upravuje přihlášený hráč. Ke své postavě se přihlas na stránce <a href="#hra">Hra</a>.</p>`:""}
    ${strip}${abr}${hl}${stavy}${kLvupHtml(K)}${KUPRO.has(K.id)?kUprHtml(K):""}
    <div class="kdbmain">${tabsH}</div>${kBarHtml(K)}</div>`}
const KUPRO=new Set();
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kuprt]");if(!b)return;const K=kvK(b);if(!K)return;if(KUPRO.has(K.id))KUPRO.delete(K.id);else KUPRO.add(K.id);kartyPrekresli()});
/* filtr v záložce Akce a hledání kouzel – bez překreslení */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kdbf]");if(!b)return;const [g,k]=b.dataset.kdbf.split(":");KDBFLT[g]=k;const c=b.closest(".ktab");if(!c)return;
  c.querySelectorAll(`[data-kdbf^="${g}:"]`).forEach(x=>x.setAttribute("aria-pressed",x===b));c.querySelectorAll("[data-kac]").forEach(s=>{s.hidden=k!=="all"&&s.dataset.kac!==k})});
document.addEventListener("input",e=>{const t=e.target;if(!t.matches||!t.matches("[data-kdbq]"))return;KDBFLT.q=t.value;const q=t.value.trim().toLowerCase(),c=t.closest(".ktab");
  c.querySelectorAll(".kdbspl .kspl li").forEach(r=>{r.hidden=!!q&&!r.textContent.toLowerCase().includes(q)});c.querySelectorAll(".kdbspl .bsph").forEach(h=>{const ul=h.nextElementSibling;h.hidden=!!ul&&![...ul.children].some(li=>!li.hidden)})});
/* import PDF: pdf.js z art/lib, pole formuláře → karta */
async function kartaImport(file){mmHlasG("Čtu PDF…",2500);
  const lib=await import(new URL("art/lib/pdfjs/pdf.min.mjs",location.href).href);lib.GlobalWorkerOptions.workerSrc=new URL("art/lib/pdfjs/pdf.worker.min.mjs",location.href).href;
  const doc=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,F=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);for(const a of await pg.getAnnotations())if(a.fieldName)F.push({f:a.fieldName,v:a.fieldValue,p,r:a.rect})}
  if(!F.length)throw new Error("V PDF nejsou pole listu postavy. Exportuj postavu z D&D Beyond znovu (Export to PDF).");
  return kartaZPdf(F)}
/* kontrola importu: AC z vybavení podle pravidel proti AC v PDF; vybavení upravené na webu */
function kImpKontrola(K,ja){const id=ja&&JA.get()&&JA.get().k||K.id,S=KARTBY[id]?kartaStav(id):{};let h="";
  try{const T=Object.assign({},K,{id:"__imp"+Date.now()}),r=kACR(T),zb=r.N&&r.N.z,st=r.N&&r.N.s,dl=/z D&D Beyond/.test(r.txt);
    h+=`<p class="rsmall kimpac"><b>AC ${K.ac}</b> = ${besc(r.txt)}${zb?"":` <b class="bhrich">· zbroj v PDF nenalezena</b>`}</p>`;
    if(dl)h+=`<p class="rsmall">Část AC web z pravidel nevysvětlí (např. Fighting Style Defense nebo vlastní předmět) – drží se jako úprava „z D&amp;D Beyond“. V Úpravách postavy ji jde nahradit konkrétním předmětem nebo rysem.</p>`;
    if(!zb&&!st&&(K.vybaveni||[]).length)h+=`<p class="rsmall">Když postava zbroj nosí a web ji nepoznal, zkontroluj název ve vybavení (např. „Breastplate“, „Chain Mail“).</p>`}catch(e){}
  if(S.inv){const a=new Set((S.inv||[]).map(x=>x.n.toLowerCase())),b=(K.vybaveni||[]).filter(x=>!a.has(x.n.toLowerCase()));
    h+=`<label class="rsmall kimpinv"><input type="checkbox" data-kimpinv${KIMPINV?" checked":""}> Převzít vybavení z nového PDF${b.length?` (na webu chybí ${b.length}: ${besc(b.slice(0,5).map(x=>x.n).join(", "))}${b.length>5?"…":""})`:""} – vybavení upravené na webu se nahradí</label>`}
  return h}
let KIMPINV=true;
const kImpNahled=(K,ja)=>`<div class="kimpn"><p><b>${besc(K.n)}</b> · ${besc(K.povolani||"")} · AC ${K.ac} · HP ${K.hp} · útoky ${(K.utoky||[]).length} · kouzla ${((K.kouzla||{}).seznam||[]).length} · předměty ${(K.vybaveni||[]).length}${KARTBY[K.id]?` · <b>přepíše existující kartu</b>`:""}</p>${kImpKontrola(K,ja)}
  ${KARTBY[K.id]?(()=>{const r=kRozdil(KARTBY[K.id],K);return r.length?`<p class="rsmall"><b>Co se změní:</b></p><ul class="kdiff">${r.map(x=>`<li>${besc(x)}</li>`).join("")}</ul><p class="rsmall">Stav postavy (životy, sloty, Svědomí, vybavení na webu) zůstane.</p>`:`<p class="rsmall">Proti uložené kartě beze změn.</p>`})():""}
  <p class="rsmall">Popisy schopností z PDF (texty příruček) uvidí jen hráč této postavy a vypravěč.</p>${ja?`<button type="button" class="gbtn" data-kimpja>Uložit a hrát za tuto postavu</button>`:`<button type="button" class="gbtn" data-kimpok>Uložit kartu</button>`} <button type="button" class="gbtn ghost" data-kimpx>Zrušit</button></div>`;
document.addEventListener("change",async e=>{const v=e.target.closest&&e.target.closest("#kartyview,#hraview,.bdm");if(!v)return;const t=e.target,K=kvK(t);
  if(t.matches("[data-kimpinv]")){KIMPINV=t.checked;return}
  if(t.matches("[data-kimp]")&&t.files[0]){try{KIMP=await kartaImport(t.files[0]);renderKarty("")}catch(err){mmHlasG("Import se nepodařil: "+(err.message||err),7000)}return}
  if(!K)return;
  if(t.matches("[data-kadv]")){KADV=+t.dataset.kadv;return}
  if(t.matches("[data-kskr]")){window.KSKR=t.checked;return}
  if(t.matches("[data-kef][data-pri]")){kPriTog(K,t.dataset.pri);return}
  if(t.matches("[data-kprib]")){const P=kPri(K).filter(x=>!/^Bardic /.test(x));kartaStavZmen(K.id,{pri:[...P,"Bardic "+t.value]});return}
  if(t.matches("[data-kef]")){const i=+t.dataset.kef,E=KEF[K.id]=KEF[K.id]||[];KEF[K.id]=t.checked?[...new Set([...E,i])]:E.filter(x=>x!==i);return}
  if(t.matches("[data-kinsp]")){kartaStavZmen(K.id,{insp:t.checked||null});return}
  if(t.matches("[data-kpen]")){const S=kartaStav(K.id),pen=Object.assign({},S.pen||K.penize||{});pen[t.dataset.kpen]=Math.max(0,Math.min(9999999,Math.round(+t.value||0)));kartaStavZmen(K.id,{pen});return}});
document.addEventListener("submit",e=>{if(!e.target.matches||!e.target.matches("#kartyview [data-kinvf],#hraview [data-kinvf],.bdm [data-kinvf]"))return;e.preventDefault();const K=kvK(e.target);if(!K)return;
  const f=e.target.elements,n=f.n.value.trim().slice(0,80);if(!n)return;const inv=[...(kartaStav(K.id).inv||K.vybaveni||[])].map(x=>Object.assign({},x));inv.push({n,q:Math.max(1,Math.min(9999,Math.round(+f.q.value||1)))});kartaStavZmen(K.id,{inv})});
document.addEventListener("click",async e=>{const v=e.target.closest&&e.target.closest("#kartyview,#hraview,.bjapanel,.bhkb");if(!v)return;const T=s=>e.target.closest(s),id=decodeURIComponent((location.hash.split("/")[1])||""),K=kvK(e.target);
  if(T("[data-kimpok]")&&KIMP){try{const i=await kartaUlozImport(KIMP);KIMP=null;navTo("#karty/"+i);mmHlasG("Karta uložena.",3000)}catch(err){mmHlasG("Uložení se nepodařilo: "+(err.message||err),6000)}return}
  if(T("[data-kimpx]")){KIMP=null;renderKarty("");return}
  if(!K)return;const S=kartaStav(K.id),skr=GMV&&!!window.KSKR;
  const h=T("[data-khod]");if(h){const [k,a]=h.dataset.khod.split(/:(.*)/s);
    if(k==="ov"){const m=kOvB(K,a);await kartaHod(K,`Ověření ${KSK[a]||a}`,m,{skryty:skr})}
    else if(k==="za")await kartaHod(K,`Záchrana ${a}`,kZach(K,a),{skryty:skr});
    else if(k==="dv"){const r=kSvAdv(K,a);await kartaHod(K,a,kDov(K,a),{skryty:skr,adv:r.length?kAdvSum(KADV,r):undefined,why:r.map(x=>x[1]).join(", ")})}
    else if(k==="in")await kartaHod(K,"Iniciativa",kIni(K),{skryty:skr});
    else if(k==="ut"){const at=kUtoky(K)[+a],E=kEfAkt(K,KEF[K.id],at),kmin=Math.min(20,...E.map(x=>+x.krit||20));if(at){kMunOdecti(K,at,1);const r=await kartaHod(K,`Útok – ${at.n}`,+at.b||0,{utok:true,kmin,skryty:skr,ut:+a});if(r.krit||!r.mis){const zr=kartaZraneni(K,at,r.krit,E);kEfPouzij(K,E,KEF[K.id]);kHodZapis({k:K.id,kdo:K.n,co:`Zranění – ${at.n}`,tot:zr.t,txt:`${zr.x}${r.krit?" (kritický zásah)":""} ${BZRT[at.t]||at.t||""}`})}}}
    else if(k==="ks"){const sp=kSeznam(K)[+a];if(sp)await kartaHod(K,`Útok kouzlem – ${sp.n}`,kSpU1(K,sp),{utok:true,skryty:skr})}
    return}
  const zr=T("[data-kzr]");if(zr){const at=kUtoky(K)[+zr.dataset.kzr],E=kEfAkt(K,KEF[K.id],at);if(!at)return;const r=kartaZraneni(K,at,!!zr.dataset.krit,E);kEfPouzij(K,E,KEF[K.id]);
    const H={k:K.id,kdo:K.n,co:`Zranění – ${at.n}`,tot:r.t,txt:`${r.x}${zr.dataset.krit?" (kritický zásah)":""} ${BZRT[at.t]||at.t||""}`};if(skr){HODY.unshift(Object.assign({id:Date.now(),cas:new Date().toISOString(),skryty:true},H));renderKarty(id)}else kHodZapis(H);mmHlasG(`${K.n}: zranění ${r.t} (${r.x})`,4500);return}
  const cm=T("[data-kcilm]");if(cm){const [i,id]=cm.dataset.kcilm.split("|"),x=kSeznam(K)[+i];if(!x)return;const S=kCilM(K,i),mx=kCilMax(K,x,i);if(S.has(id))S.delete(id);else if(S.size<mx)S.add(id);else mmHlasG(`${x.n}: nejvýš ${mx} ${mx===1?"cíl":mx<5?"cíle":"cílů"}.`,3000);kartyPrekresli();return}
  const ses=T("[data-kses]");if(ses){const i=ses.dataset.kses,sp=kSeznam(K)[+i];if(sp){await kSpNacti().catch(()=>{});if(kSesCil(sp)){kSesDlg(K,sp,i);return}await kartaSeslat(K,sp,KSLV[K.id+":"+i])}return}
  const zd=T("[data-kzd]");if(zd){const k=zd.dataset.kzd,j=+zd.dataset.j,U=Object.assign({},S.zdr||{}),u=U[k]||0;U[k]=u>j?j:j+1;if(!U[k])delete U[k];kartaStavZmen(K.id,{zdr:Object.keys(U).length?U:null});return}
  const kk=T("[data-kkz]");if(kk){const j=+kk.dataset.kkz,u=+S.kz||0;kartaStavZmen(K.id,{kz:(u>j?j:j+1)||null});return}
  const vy=T("[data-kvy]");if(vy){const j=+vy.dataset.kvy,u=+S.vycerp||0;kartaStavZmen(K.id,{vycerp:(u>j?j:j+1)||null});return}
  const ob=T("[data-kobl]");if(ob){const i=+ob.dataset.kobl,inv=[...(S.inv||K.vybaveni||[])].map(x=>Object.assign({},x)),r=kZbrInfo(inv[i]);if(!r)return;const N=kNoseno(inv),on=(N.z&&N.z.i===i)||(N.s&&N.s.i===i);
    if(on)inv[i].obl=false;else inv.forEach((x,j)=>{const q=kZbrInfo(x);if(j===i)x.obl=true;else if(q&&q.k===r.k)x.obl=false});
    const pred=kAC(K);await kartaStavZmen(K.id,{inv});mmHlasG(`${K.n}: ${inv[i].n} ${on?"sundána":"na sobě"} – AC ${pred} → ${kAC(K)}.`,4000);return}
  const vle=T("[data-kvled]");if(vle){if(!kMuze(K))return;const a=vle.dataset.kvled,v0=kVl0(K,a),U=Object.assign({},S.vlU||{}),x=prompt(`${KDBVL[a]||a}: nové skóre (1–30). Prázdné = podle PDF (${v0??"–"}).`,U[a]??v0??"");if(x==null)return;
    const n=Math.round(+String(x).trim());if(String(x).trim()===""||n===v0)delete U[a];else if(n>=1&&n<=30)U[a]=n;else{mmHlasG("Skóre musí být 1 až 30.",3000);return}
    await kartaStavZmen(K.id,{vlU:Object.keys(U).length?U:null},`${K.n}: ${KDBVL[a]||a} ${U[a]??v0} – záchrany, dovednosti, útoky a AC přepočítány.`);return}
  const iv=T("[data-kinv]");if(iv){const i=+iv.dataset.kinv,inv=[...(S.inv||K.vybaveni||[])].map(x=>Object.assign({},x));if(!inv[i])return;inv[i].q=Math.max(0,inv[i].q+ +iv.dataset.d);if(!inv[i].q&&confirm(`Odebrat ${inv[i].n} z vybavení?`))inv.splice(i,1);else inv[i].q=Math.max(inv[i].q,0);kartaStavZmen(K.id,{inv});return}
  const od=T("[data-kodp]");if(od){kartaOdpocinek(K,od.dataset.kodp==="d");return}
  if(T("[data-ksmaz]")&&GMV){if(!confirm(`Smazat kartu ${K.n}? Stav postavy se smaže taky.`))return;try{await KDB.smaz(K.id);const i=KARTY.findIndex(x=>x.id===K.id);if(i>=0)KARTY.splice(i,1);delete KARTBY[K.id];delete KST[K.id];navTo("#karty")}catch(err){mmHlasG("Nepodařilo se: "+(err.message||err),5000)}return}
  const kz=T("[data-kzrz]");if(kz){const zb=kz.closest(".kbar,.kdbhp,.kzrb")||v,val=Math.round(+((zb.querySelector("[data-kzrv]")||{}).value||0)),typ=(zb.querySelector("[data-kzrt]")||{}).value||"";if(!(val>0)){mmHlasG("Zadej počet HP.",2000);return}
    const o={hp:S.hp,thp:S.thp},k=kz.dataset.kzrz;let m;
    if(k==="z"){const h0=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);const zr=(K.imu||[]).includes(typ)?0:kOdol(K).includes(typ)?Math.floor(val/2):val;if(h0){bojPCZmena(h0.id,x=>bojZranPC(x,K,val,typ,false),true);const hp=kartaStav(K.id).hp;if(zr>0&&kKonDrzi(K)&&(hp==null||hp>0)){KKON[K.id]=bojKonDC(zr);kartyPrekresli()}return}m=bojZranPC(o,K,val,typ,false);if(zr>0&&kKonDrzi(K)&&(o.hp==null||o.hp>0))KKON[K.id]=bojKonDC(zr);else if(o.hp===0&&kKonDrzi(K))kKonZtrata(K,"pád na 0 HP")}
    else if(k==="l")m=bojLecPC(o,K,val);else{o.thp=Math.max(+S.thp||0,val);m=`dočasné HP ${o.thp}`}
    kartaStavZmen(K.id,{hp:o.hp!=null&&o.hp<mxHp(K)?o.hp:null,thp:o.thp||null},`${K.n}: ${m}.`);return}});
const mxHp=K=>kHPmax(K);
/* boj: změna postavy s kartou – životy a zdroje do karty, hody proti smrti a stavy do boje; pád na 0 = 1 úroveň vyčerpání (Artikule) */
function bojPCZmena(hid,fn,hlas){const S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===hid),K=bojKartaH(h0);if(!h0||!K)return;const ks=kartaStav(K.id);
  const o={hp:ks.hp,thp:ks.thp,ds:h0.ds?JSON.parse(JSON.stringify(h0.ds)):undefined,stav:h0.stav?[...h0.stav]:undefined};const msg=fn(o)||"";
  const ch={};if((o.hp??null)!==(ks.hp??null))ch.hp=o.hp!=null&&o.hp<kHPmax(K)?o.hp:null;if((o.thp??null)!==(ks.thp??null))ch.thp=o.thp||null;
  if(!h0.ds&&o.ds&&!o.ds.st)ch.vycerp=Math.min(10,(+ks.vycerp||0)+1);
  if(Object.keys(ch).length)kartaStavZmen(K.id,ch);
  if(JSON.stringify(o.ds??null)!==JSON.stringify(h0.ds??null)||JSON.stringify(o.stav??null)!==JSON.stringify(h0.stav??null))bojHracAkce(hid,h=>{if(o.ds)h.ds=o.ds;else delete h.ds;if(o.stav&&o.stav.length)h.stav=o.stav;else delete h.stav});
  if(GMV)bojLog(hid,{n:"Zranění",ai:null,ci:hid,zt:msg},h0.n);if(hlas!==false&&msg)mmHlasG(`${h0.n}: ${msg}${ch.vycerp?" · vyčerpání "+ch.vycerp:""}.`,6000);return msg}

if(window.MMDB)kartyNacti().then(ch=>{if(ch&&curView==="boj")renderBoj()});
setTimeout(()=>{try{ukStart()}catch(e){}try{hraStart()}catch(e){}},1500);
/* karty a herní záznam se obnovují, když je stránka otevřená (nepřekreslí se, když hráč zrovna píše) */
let KPOLL=null;
function kartyStart(){if(KPOLL)return;KPOLL=setInterval(async()=>{if(document.visibilityState!=="visible"||curView!=="karty")return;const a=await kartyNacti(),b=await hodyNacti();
  const ae=document.activeElement,pise=ae&&document.getElementById("kartyview").contains(ae)&&ae.matches("input,select,textarea");if((a||b)&&!pise)renderKarty(decodeURIComponent((location.hash.split("/")[1])||""))},4000)}
/* ===== Karta: úprava posledního hodu, kostky v textech schopností, Zpět, spodní lišta na telefonu (2026-10-17) ===== */
/* ---- úprava hodu d20 po hodu: Bless / Guidance +1d4, Bane −1d4, Bardic Inspiration, přehození za hrdinskou inspiraci, Lucky ---- */
const KPOSL={};let KBARD=(()=>{try{return +localStorage.getItem("mm-bard")||6}catch(e){return 6}})();
const kLucky=K=>{const z=(typeof kZdroje==='function'?kZdroje(K):K.zdroje||[]).find(q=>/^luck(y| points?)\b/i.test(q.n));if(z){const u=Math.min(z.max,(kartaStav(K.id).zdr||{})[z.n]||0);return {z,zb:z.max-u}}
  return [...(K.rysy||[]),...(K.rysy2||[]).map(r=>r.n)].some(n=>/^lucky$/i.test(String(n).trim()))?{z:null,zb:1}:null};
function kUpravHod(r,typ,arg){r=Object.assign({},r,{upr:[...(r.upr||[])],mods:[...(r.mods||[])]});let pop="";
  if(typ==="b4"||typ==="m4"||typ==="bard"){const st=typ==="bard"?(+arg||6):4,x=bK(st),zn=typ==="m4"?-1:1;r.mods.push(zn*x);pop=`${typ==="b4"?"Bless/Guidance +1d4":typ==="m4"?"Bane −1d4":`Bardic Inspiration +1d${st}`} (${x})`}
  else if(typ==="insp"){const n=bK(20);if(!r.v||r.d2==null){pop=`hrdinská inspirace: přehozeno ${r.d1} → ${n}`;r.d1=n}
    else{const prvni=r.v>0?r.d1>=r.d2:r.d1<=r.d2;pop=`hrdinská inspirace: přehozena kostka ${prvni?r.d1:r.d2} → ${n}`;if(prvni)r.d1=n;else r.d2=n}}
  else if(typ==="luck"){if(r.v<0){r.v=0;pop=`Lucky: nevýhoda zrušena (platí ${r.d1})`}else{r.d2=bK(20);r.v=1;pop=`Lucky: výhoda, druhá kostka ${r.d2}`}}
  r.d=r.v>0&&r.d2!=null?Math.max(r.d1,r.d2):r.v<0&&r.d2!=null?Math.min(r.d1,r.d2):r.d1;
  r.tot=r.d+(+r.b||0)+r.mods.reduce((a,x)=>a+x,0);r.krit=!!r.utok&&r.d>=(r.kmin||20);r.mis=!!r.utok&&r.d===1;r.upr.push(pop);return {r,pop}}
function kBardSel(){return `<select data-kbard aria-label="Kostka Bardic Inspiration">${[6,8,10,12].map(n=>`<option value="${n}"${KBARD===n?" selected":""}>d${n}</option>`).join("")}</select>`}
function kPoslBox(K){const P=KPOSL[K.id];if(!P||Date.now()-P.cas>15*60e3||!kMuze(K))return "";const S=kartaStav(K.id),L=kLucky(K);
  return `<div class="kposl" role="group" aria-label="Úprava posledního hodu"><span class="kposlh"><small>Poslední hod</small> <b>${besc(P.co)}</b> <b class="khtot${P.krit?" bkr":P.mis?" bmis":""}">${P.tot}</b>${P.upr.length?` <small>původně ${P.puv} · ${besc(P.upr.join(" · "))}</small>`:""}</span>
    <span class="bojbtn"><button type="button" class="gbtn ghost" data-kupr="b4" ${btip("Bless (útok, záchrana) nebo Guidance (ověření): přičte 1d4")}>+1d4 Bless / Guidance</button><button type="button" class="gbtn ghost" data-kupr="m4" ${btip("Bane: odečte 1d4")}>−1d4 Bane</button>
      <span class="kbard">${kBardSel()}<button type="button" class="gbtn ghost" data-kupr="bard" ${btip("Bardic Inspiration od barda: přičte jeho kostku")}>+ Bardic Inspiration</button></span>
      ${S.insp?`<button type="button" class="gbtn ghost" data-kupr="insp" ${btip("Heroic Inspiration: přehodíš kostku d20 a platí nový hod; inspirace se spotřebuje")}>↻ Přehodit (inspirace)</button>`:""}
      ${L&&P.v<=0&&L.zb>0?`<button type="button" class="gbtn ghost" data-kupr="luck" ${btip(`Lucky: utratíš Luck Point a hod má výhodu${L.z?` (zbývá ${L.zb})`:""}; proti nevýhodě ji zruší`)}>Lucky – výhoda</button>`:""}
      <button type="button" class="kx" data-kposlx aria-label="Zavřít úpravy hodu">×</button></span></div>`}
async function kPoslUprav(K,typ){const P=KPOSL[K.id];if(!P)return;const S=kartaStav(K.id);
  if(typ==="insp"&&!S.insp){mmHlasG("Postava nemá hrdinskou inspiraci.",3000);return}
  const L=typ==="luck"?kLucky(K):null;if(typ==="luck"&&(!L||L.zb<=0)){mmHlasG("Lucky: nezbývá Luck Point.",3000);return}
  const {r,pop}=kUpravHod(P,typ,KBARD),old=P.tot;Object.assign(P,r);
  if(typ==="insp")await kartaStavZmen(K.id,{insp:null});
  if(L&&L.z){const U=Object.assign({},kartaStav(K.id).zdr||{});U[L.z.n]=(U[L.z.n]||0)+1;await kartaStavZmen(K.id,{zdr:U})}
  const H={k:K.id,kdo:K.n,co:("Úprava – "+P.co).slice(0,80),tot:Math.max(-50,Math.min(999,P.tot)),d:P.d,txt:`${pop}: ${old} → ${P.tot}${P.krit?" · kritický zásah":P.mis?" · minutí":""}`.slice(0,300)};if(P.krit)H.krit=true;if(P.mis)H.mis=true;
  if(P.skryty){HODY.unshift(Object.assign({id:Date.now(),cas:new Date().toISOString(),skryty:true},H));kartyPrekresli()}else kHodZapis(H);
  let pozn="";const was={mis:old!=null&&r.upr.length===1?P.mis0:undefined};
  if(P.utok&&P.ut!=null&&P.mis1===undefined)P.mis1=null;
  if(P.utok&&P.ut!=null&&P.bylMis&&!P.mis){const at=kUtoky(K)[P.ut],E=(K.efekty||[]).filter((x,i)=>(KEF[K.id]||[]).includes(i));if(at&&at.z){const zr=kartaZraneni(K,at,P.krit,E);kHodZapis({k:K.id,kdo:K.n,co:`Zranění – ${at.n}`,tot:zr.t,txt:`${zr.x}${P.krit?" (kritický zásah)":""} ${BZRT[at.t]||at.t||""}`});pozn=` · zranění ${zr.t}`}}
  else if(P.utok&&P.krit&&!P.bylKrit)pozn=" · kritický zásah – zranění hoď znovu tlačítkem krit";
  P.bylMis=P.mis;P.bylKrit=P.krit;
  mmHlasG(`${K.n}: ${P.co} ${old} → ${P.tot} (${pop})${pozn}`,6500);kartyPrekresli()}
/* ---- kostky v textech schopností: „1d6“, „2d8 + your Strength modifier“, „1d10 + your Fighter level“ ---- */
const KTXAB={strength:"STR",dexterity:"AGI",constitution:"CON",intelligence:"INT",wisdom:"WIS",charisma:"CHA",str:"STR",dex:"AGI",agi:"AGI",con:"CON",int:"INT",wis:"WIS",cha:"CHA"};
function kTxtMod(K,t){t=String(t).trim().toLowerCase();let m;
  if(/^\d+$/.test(t))return +t;
  if((m=t.match(/^(?:your\s+|the\s+)?(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+modifier$/)))return kMod((K.vl||{})[KTXAB[m[1]]]||10);
  if(/^(?:your\s+)?spellcasting ability modifier$/.test(t)){const a=KTXAB[String((K.kouzla||{}).vl||"").toLowerCase().slice(0,3)]||KTXAB[String((K.kouzla||{}).vl||"").toLowerCase()];return a?kMod((K.vl||{})[a]||10):null}
  if(/^(?:your\s+)?proficiency bonus$/.test(t))return +K.zdatnost||2;
  if((m=t.match(/^(?:your\s+)?([a-z]+)\s+level$/))){const c=m[1];if(c==="character")return +K.uroven||1;const q=String(K.povolani||"").match(new RegExp("\\b"+c+"\\b[^\\d/]*(\\d+)","i"));return q?+q[1]:(String(K.povolani||"").split("/").length<2&&new RegExp("\\b"+c+"\\b","i").test(K.povolani||"")?+K.uroven||null:null)}
  if(/^(?:your\s+)?level$/.test(t))return +K.uroven||1;
  return null}
const KTXRE=/\b(\d*d(?:4|6|8|10|12|100))\b((?:\s*(?:\+|−|-|plus|minus)\s*(?:\d+\b|(?:your|the)\s+(?:strength|dexterity|constitution|intelligence|wisdom|charisma)\s+modifier|(?:your\s+)?spellcasting ability modifier|(?:your\s+)?proficiency bonus|(?:your\s+)?(?:[a-z]+\s+)?level))*)/gi;
function kTxtKostky(K,t,co){return besc(String(t||"")).replace(KTXRE,(all,dk,rest)=>{let v=dk.toLowerCase();
    const parts=[...String(rest||"").matchAll(/\s*(\+|−|-|plus|minus)\s*((?:\d+\b|(?:your|the)\s+\w+\s+modifier|(?:your\s+)?spellcasting ability modifier|(?:your\s+)?proficiency bonus|(?:your\s+)?(?:[a-z]+\s+)?level))/gi)];let pouz="";
    for(const p of parts){const x=kTxtMod(K,p[2]);if(x==null)break;const zn=/^(-|−|minus)$/i.test(p[1])?-1:1;v+=(zn*x<0?"-":"+")+Math.abs(x);pouz+=p[0]}
    return `<button type="button" class="kkost" data-ktxh="${besc(v)}" data-ktxco="${besc(String(co||"").slice(0,70))}" ${btip(`Hodit ${v}`)}>🎲 ${dk}${pouz}</button>${all.slice(dk.length+pouz.length)}`}).replace(/\n/g,"<br>")}
/* ---- Zpět: poslední změny životů, slotů, zdrojů, kostek životů, inspirace, účinků a vybavení na tomto zařízení ---- */
const KZPET={},KZPF={hp:"životy",thp:"dočasné HP",zdr:"sloty a zdroje",kz:"kostky životů",insp:"inspirace",uc:"účinky",vycerp:"vyčerpání",mun:"munice",stavy:"stavy",inv:"vybavení",pri:"přídavky"};
function kZpetZapis(id,ch){const S=kartaStav(id),k=Object.keys(ch).filter(x=>x in KZPF&&JSON.stringify(S[x]??null)!==JSON.stringify(ch[x]??null));if(!k.length)return;
  const Z=KZPET[id]=KZPET[id]||[],now=Date.now(),last=Z[Z.length-1],prev=last&&now-last.cas<1500?last:null,e=prev||{prev:{},cas:now};
  k.forEach(x=>{if(!(x in e.prev))e.prev[x]=S[x]==null?null:JSON.parse(JSON.stringify(S[x]))});e.cas=now;e.popis=[...new Set(Object.keys(e.prev).map(x=>KZPF[x]).filter(Boolean))].join(", ");if(!prev)Z.push(e);if(Z.length>15)Z.shift()}
function kZpetBtn(K,mal){const Z=KZPET[K.id]||[],e=Z[Z.length-1];if(!e||!kMuze(K))return "";return `<button type="button" class="${mal?"kbox kzpetb":"kdbbtn"}" data-kzpet ${btip(`Vrátit poslední změnu: ${e.popis}`)}>${mal?"<small>Zpět</small><b>↶</b>":"↶ Zpět"}</button>`}
async function kZpet(K){const Z=KZPET[K.id]||[],e=Z.pop();if(!e)return;await kartaStavZmen(K.id,e.prev,`${K.n}: vráceno – ${e.popis}.`,{bezZpet:true});kHodZapis({k:K.id,kdo:K.n,co:"Zpět",txt:`vráceno: ${e.popis}`})}
/* ---- spodní lišta na telefonu: AC, životy se zraněním a léčením, inspirace, soustředění, Zpět ---- */
function kBarHtml(K){const S=kartaStav(K.id),mx=kHPmax(K),cur=S.hp!=null?+S.hp:mx,ro=!kMuze(K),Z=(KZPET[K.id]||[]).length,kd=kKonDrzi(K),k=kd?(kUc(K).find(x=>x.kon)||{n:"soustředění"}):null;
  return `<div class="kbar" aria-label="Rychlý přehled postavy"><span class="kbarac"><small>AC</small><b>${kAC(K)}</b></span>
    <span class="kbarhp${cur<=mx/2?" bhp2":""}${cur<=0?" bhp0":""}"><small>HP</small><b>${cur}</b>/${mx}${S.thp?` <i class="bkthp">+${S.thp}</i>`:""}</span>
    ${ro?"":`<span class="kzrb kbarz"><input type="number" min="0" max="999" data-kzrv inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="gbtn ghost" data-kzrz="z" aria-label="Zranění">−</button><button type="button" class="gbtn ghost" data-kzrz="l" aria-label="Léčení">+</button></span>
    <label class="kbarin" ${btip("Hrdinská inspirace")}><input type="checkbox" data-kinsp${S.insp?" checked":""}> ✦</label>`}
    ${k?`<button type="button" class="kbarkon${KKON[K.id]?" kbarkonq":""}" data-kbarkon ${btip(KKON[K.id]?`Soustředění: záchrana CON SO ${KKON[K.id]} – klepni pro hod`:`Soustředění na ${k.n} – klepni pro ukončení`)}>◎ ${KKON[K.id]?`SO ${KKON[K.id]}`:besc(k.n)}</button>`:""}
    ${!ro&&Z?`<button type="button" class="gbtn ghost" data-kzpet aria-label="Zpět">↶</button>`:""}</div>`}
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-kbard]")){KBARD=+t.value||6;try{localStorage.setItem("mm-bard",KBARD)}catch(x){}}});
document.addEventListener("click",async e=>{const T=s=>e.target.closest&&e.target.closest(s);if(!T("#kartyview,#hraview,[data-kid]"))return;
  const tx=T("[data-ktxh]");if(tx){const K=kvK(tx);if(!K)return;if(!kMuze(K)){mmHlasG("Za tuto postavu hází její hráč.",3000);return}await kVlastniHod(K.n,K.id,tx.dataset.ktxh,(tx.dataset.ktxco||tx.dataset.ktxh),false);return}
  const K=kvK(e.target);if(!K)return;
  const up=T("[data-kupr]");if(up){await kPoslUprav(K,up.dataset.kupr);return}
  if(T("[data-kposlx]")){delete KPOSL[K.id];kartyPrekresli();return}
  if(T("[data-kbarkon]")){if(KKON[K.id]){await kKonHod(K,KKON[K.id]);return}const k=kUc(K).find(x=>x.kon);if(!confirm(`Ukončit soustředění${k?" na "+k.n:""}?`))return;await kKonZtrata(K,"ukončeno");kartyPrekresli();return}
  if(T("[data-kzpet]")){await kZpet(K);return}});
/* ---- boj: úprava hodu na útok před odesláním vypravěči ---- */
function bojJaUprHtml(K){const ser=BJU.serie||[],dice=ser.length&&ser[0].d1!=null,S=K?kartaStav(K.id):{},L=K?kLucky(K):null,i=Math.min(+BJU.ui||0,Math.max(0,ser.length-1)),x=ser[i];
  return `<div class="bjur bjupr" role="group" aria-label="Úprava hodu na útok"><small>Upravit hod${ser.length>1?`</small> <select data-juui aria-label="Který útok">${ser.map((q,j)=>`<option value="${j}"${j===i?" selected":""}>${j+1}. útok (${q.hod})</option>`).join("")}</select><small>`:""}:</small>
    <button type="button" class="gbtn ghost" data-juupr="b4" ${btip("Bless: přičte 1d4")}>+1d4 Bless</button><button type="button" class="gbtn ghost" data-juupr="m4" ${btip("Bane: odečte 1d4")}>−1d4 Bane</button>${kBardSel()}<button type="button" class="gbtn ghost" data-juupr="bard">+ Bardic</button>
    ${dice&&S.insp?`<button type="button" class="gbtn ghost" data-juupr="insp" ${btip("Heroic Inspiration: přehodí d20, inspirace se spotřebuje")}>↻ Přehodit (inspirace)</button>`:""}${dice&&L&&L.zb>0&&x&&x.v<=0?`<button type="button" class="gbtn ghost" data-juupr="luck" ${btip("Lucky: výhoda za Luck Point")}>Lucky</button>`:""}</div>`}
async function bojJaUprav(typ){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get());if(!me)return;const K=bojKartaH(me),c=(s.npc||[]).find(o=>o.id===BJU.cil);
  if(!(BJU.serie&&BJU.serie.length)){if(BJU.hod===""||!/^(b4|m4|bard)$/.test(typ))return;const st=typ==="bard"?KBARD:4,x=bK(st),zn=typ==="m4"?-1:1;BJU.hod=String(+BJU.hod+zn*x);BJU.info=`${BJU.info?BJU.info+" · ":""}${typ==="b4"?"Bless +1d4":typ==="m4"?"Bane −1d4":`Bardic +1d${st}`} (${x}) → ${BJU.hod}`;renderBoj();return}
  const i=Math.min(+BJU.ui||0,BJU.serie.length-1),q=BJU.serie[i];if(typ==="insp"&&!(K&&kartaStav(K.id).insp))return;const L=typ==="luck"?(K&&kLucky(K)):null;if(typ==="luck"&&(!L||L.zb<=0))return;
  if(q.d1==null&&/^(insp|luck)$/.test(typ))return;const {r,pop}=kUpravHod({d1:q.d1,d2:q.d2,v:q.v,b:q.b,mods:q.mods,upr:q.upr,utok:true,kmin:BJU.kmin||20},typ,KBARD),old=q.hod;
  const n=Object.assign({},q,{d1:r.d1,d2:r.d2,v:r.v,mods:r.mods,upr:r.upr,d:r.d,hod:r.tot,krit:r.krit});n.vys=bojJaZas(c,n.hod,n.d,n.krit);BJU.serie[i]=n;
  const pz=n.krit&&!q.krit?" – kritický zásah: zranění oprav (dvojnásob kostek)":!n.krit&&q.krit?" – už ne kritický: zranění oprav":q.d===1&&n.d!==1&&!(+q.dmg>0)?" – zranění doplň":"";
  if(i===0){BJU.hod=String(n.hod);BJU.d=String(n.d);BJU.dmg=String(n.dmg)}
  if(typ==="insp")await kartaStavZmen(K.id,{insp:null});if(L&&L.z){const U=Object.assign({},kartaStav(K.id).zdr||{});U[L.z.n]=(U[L.z.n]||0)+1;await kartaStavZmen(K.id,{zdr:U})}
  BJU.info=`${BJU.info?BJU.info+" · ":""}${BJU.serie.length>1?`${i+1}. útok: `:""}${pop}: ${old} → ${n.hod}${pz}`;renderBoj()}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-juupr]");if(b){bojJaUprav(b.dataset.juupr);return}});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-juui]")){BJU.ui=+t.value||0;renderBoj()}});
