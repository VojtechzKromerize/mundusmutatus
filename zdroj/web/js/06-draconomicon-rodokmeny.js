/* ---------- Draconomicon ---------- */
const DRACI=/*@DRACI@*/{};
const DRTR={L:"lehký",S:"střední",T:"těžký"};
const drU=(img,k)=>!img?"":typeof img==="object"?(k==="-t"?img.t||img.h||img.m||img.f:k==="-h"?img.h||img.m||img.f:k==="-m"?img.m||img.h||img.f:img.f||img.h):`art/draci/${img}${k}.webp`;
const DRBY={};(DRACI.kap||[]).forEach(k=>DRBY[k.id]={k:"kap",o:k});(DRACI.pl||[]).forEach(p=>DRBY[p.id]={k:"pl",o:p});
function renderDraco(b){
  const side=document.getElementById("drside"),main=document.getElementById("drmain"),cur=DRBY[b],isPl=b==="plemena";
  const K=DRACI.kap[0]||{id:"",t:"O dracích",h:""};
  const head=p=>drU(p.img,"-t");/* zmenšenina 144×96 pro seznam plemen (zobrazuje se ~46 px) */
  side.innerHTML=`<button type="button" class="atoggle" aria-expanded="false">☰ Obsah Draconomiconu</button><nav class="atoc" aria-label="Obsah Draconomiconu">
    <a class="atop${!cur&&!isPl?" on":""}" href="#draconomicon">${K.t}</a>
    <a class="atop${isPl?" on":""}" href="#draconomicon/plemena">Plemena</a>
    <ol class="asecs">${DRACI.pl.map(p=>`<li class="drpl"><a href="#draconomicon/${p.id}"${b===p.id?' class="on"':""}>${head(p)?`<img class="drthumb" src="${head(p)}" alt="" loading="lazy">`:""}${p.n}</a></li>`).join("")}</ol></nav>`;
  side.classList.remove("open");{const tg=side.querySelector(".atoggle");tg.addEventListener("click",()=>{const o=side.classList.toggle("open");tg.setAttribute("aria-expanded",o)})}
  const card=p=>`<a class="drcard" href="#draconomicon/${p.id}">${head(p)?`<img src="${drU(p.img,"-h")}" alt="${p.n}" loading="lazy" width="480" height="320">`:""}<span class="dct"><b>${p.n}</b>${p.la?`<i>${p.la}</i>`:""}${p.pd?`<small>${p.pd}</small>`:""}</span></a>`;
  if(isPl){
    main.innerHTML=`<nav class="crumbs"><a href="#draconomicon">Draconomicon</a> › <b>Plemena</b></nav><h2 class="arttitle">Plemena</h2>
      <p class="intro">Zde se popisují plemena dračí, která se v zemích Koruny české nejčastěji potkávají, každé podle toho, kde přebývá, čím se živí, jaké má mravy a po čem se pozná.</p><div class="drgrid">${DRACI.pl.map(card).join("")}</div>`;return}
  if(!cur||cur.k==="kap"){
    main.innerHTML=`<h2 class="arttitle">Draconomicon</h2>
      <p class="drlatin">Liber de draconibus · kniha o dracích, sepsaná léta Páně 1458</p>
      <div class="drtext">${K.h}</div>
      <section class="asec"><h3 class="ash"><a href="#draconomicon/plemena">Plemena</a></h3><div class="drgrid">${DRACI.pl.map(card).join("")}</div></section>`;
    autolink(main.querySelector(".drtext"),"");
    {const hs=[...main.querySelectorAll(".drtext>h3")],pl=DRACI.pl.filter(p=>p.img);
     hs.forEach((h,j)=>{const p=pl[j%pl.length];if(!p)return;h.insertAdjacentHTML("afterend",`<figure class="marg"><a href="#draconomicon/${p.id}"><img src="${drU(p.img,"-h")}" alt="" loading="lazy">${p.n}</a></figure>`)})}
    return}
  const list=DRACI.pl,i=list.indexOf(cur.o),pv=list[i-1],nx=list[i+1],o=cur.o;
  const nav=`<nav class="apn">${pv?`<a href="#draconomicon/${pv.id}" rel="prev"><small>Předchozí</small>${pv.n}</a>`:"<span></span>"}${nx?`<a href="#draconomicon/${nx.id}" rel="next"><small>Další</small>${nx.n}</a>`:"<span></span>"}</nav>`;
  main.innerHTML=`<nav class="crumbs"><a href="#draconomicon">Draconomicon</a> › <a href="#draconomicon/plemena">Plemena</a> › <b>${o.n}</b></nav>
    <h2 class="arttitle">${o.n}</h2><p class="drlatin">${[o.la,o.j,o.pd].filter(Boolean).join(" · ")}</p>
    ${o.sl?`<p class="slnote">O tomto plemeni družina zatím jen slyšela. Víc se dozví, až ho potká.</p>`:`${o.img?`<figure class="drfig"><a href="${drU(o.img,"")}" target="_blank" rel="noopener" title="Otevřít v plné velikosti"><img src="${drU(o.img,"")}" alt="${o.n}" width="1200" height="800"></a></figure>`:""}
    <div class="drtext">${o.h}</div>`}${nav}`;
  autolink(main.querySelector(".drtext"),"");
}

/* ---------- Rodokmeny klíčových rodů (stav k 3. 3. 1458) ---------- */
/* p = osoba v zemských deskách, r = rod, d = data, m = z kterého manželství, note = poznámka */
const TREES=/*@TREES@*/{};
const TREEALIAS={fra:"bra"};
/* zemřel k hernímu datu? podle údaje d („† 1436“, „1403–1427“, „1442–5. 3. 1458“); budoucí úmrtí hráči v datech nemají */
function umrelTree(d){
  if(!d)return false;const t=String(d),[Y,M,D]=herniDen();
  const f=t.match(/[–†-]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if(f){const [d0,m0,y0]=[+f[1],+f[2],+f[3]];return y0<Y||y0===Y&&(m0<M||m0===M&&d0<=D)}
  const m=t.match(/†[^0-9]{0,24}(\d{4})/)||t.match(/\d{4}\s*[–-]\s*(?:asi\s*)?(\d{4})/);
  if(!m)return false;const y=+m[1];return y<Y||(y===Y&&/před/.test(t))}
const RZENA=n=>{const w=String(n||"").replace(/^✦\s*/,"").split(/[\s(]/)[0];return /[aeě]$/i.test(w)&&!/^(Protiva|Ota)$/i.test(w)};
/* ---------- rodokmen jako jeden propojený graf: osoby ze všech rodokmenů, spojené přes id osob (p, pl) ---------- */
let RGRAF=null;
function rodGraf(){
  if(RGRAF)return RGRAF;
  const N=new Map(),PAR=new Map(),SP=new Map(),CH=new Map();
  const vid=a=>(a||[]).filter(x=>!x.duch||!(a||[]).some(y=>!y.duch&&y.slot===x.slot));
  const add=(key,o,rid,src,rank)=>{let x=N.get(key);
    if(!x){x={key,n:o.n||"",d:o.d||"",note:o.note||"",p:o.p||"",r:o.r||"",rl:o.rl||"",rod:rid,src,rank,dedic:+o.dedic||0,narok:o.narok||"",duch:!!o.duch,z:o.z};N.set(key,x);return x}
    if(rank>x.rank)Object.assign(x,{n:o.n||x.n,d:o.d||x.d,note:o.note||x.note,rod:rid,src,rank});else if(!x.d&&o.d)x.d=o.d;
    for(const k of ["r","rl","narok"])if(o[k]&&!x[k])x[k]=o[k];if(+o.dedic&&!x.dedic)x.dedic=+o.dedic;return x};
  const par=(c,p)=>{if(!PAR.has(c))PAR.set(c,[]);if(!PAR.get(c).includes(p))PAR.get(c).push(p);if(!CH.has(p))CH.set(p,[]);if(!CH.get(p).includes(c))CH.get(p).push(c)};
  const spo=(a,b,zas)=>{for(const [x,y] of [[a,b],[b,a]]){if(!SP.has(x))SP.set(x,[]);if(!SP.get(x).some(e=>e.k===y))SP.get(x).push({k:y,zas})}};
  const ZAS=/zasnoub|zaslíb/i;
  const key=(o,rid,tag)=>o.duch?`${rid}#g${o.slot}`:o.p||`${rid}#${tag}`;
  const plNode=pl=>{if(!N.has(pl)&&PBY[pl])add(pl,{p:pl,n:PBY[pl].n.replace(/^✦\s*/,"")},PBY[pl].r,null,0);return N.has(pl)};
  for(const [rid,T] of Object.entries(TREES)){
    if(!T||!T.main)continue;const mk=key(T.main,rid,"m");add(mk,T.main,rid,{rid,k:"main"},3);
    if(T.root){const rk=key(T.root,rid,"r");add(rk,T.root,rid,{rid,k:"root"},1);par(mk,rk)}
    const spk=vid(T.main.sp).map(s=>{const k=key(s,rid,"s"+s._i);add(k,s,rid,s.duch?null:{rid,k:"sp",i:s._i},2).role??=(s.duch?"sp":"");spo(mk,k,ZAS.test(s.note||""));return {k,i:s._i}});
    vid(T.kids).forEach(c=>{const k=key(c,rid,"k"+c._i);add(k,c,rid,c.duch?null:{rid,k:"kid",i:c._i},2);par(k,mk);
      const mm=parseInt(c.m,10),sp=mm?spk.find(x=>x.i===mm-1):spk.length===1?spk[0]:null;if(sp)par(k,sp.k);
      if(c.pl&&plNode(c.pl))spo(k,c.pl,ZAS.test(c.note||""));
      vid(c.kids).forEach(g=>{const gk=key(g,rid,`k${c._i}.${g._i}`);add(gk,g,rid,g.duch?null:{rid,k:"gk",i:c._i,j:g._i},1);par(gk,k);if(c.pl&&N.has(c.pl))par(gk,c.pl)})});
  }
  return RGRAF={N,PAR,SP,CH}}
const rgJm=o=>o.duch?(o.role==="sp"?(o.z?"manželka (neznámá)":"manžel (neznámý)"):(o.z?"dcera (neznámá)":"syn (neznámý)")):o.n.replace(/^✦\s*/,"");
/* příbuzenský vztah: cesta mezi dvěma osobami přes rodiče (P), děti (C) a manžele (S, zasnoubení Z) */
function rgCesta(a,b){const G=rodGraf();if(a===b)return [];const prev=new Map([[a,null]]),q=[a];
  while(q.length){const x=q.shift();const nb=[...(G.PAR.get(x)||[]).map(k=>[k,"P"]),...(G.CH.get(x)||[]).map(k=>[k,"C"]),...(G.SP.get(x)||[]).map(e=>[e.k,e.zas?"Z":"S"])];
    for(const [k,t] of nb){if(prev.has(k)||G.N.get(k).duch)continue;prev.set(k,[x,t]);if(k===b){const out=[];let c=b;while(prev.get(c)){const [p,tt]=prev.get(c);out.unshift({k:c,t:tt});c=p}return out}q.push(k)}}
  return null}
const RGVZ={P:["otec","matka"],C:["syn","dcera"],S:["manžel","manželka"],Z:["snoubenec","snoubenka"],PC:["bratr","sestra"],PP:["děd","babička"],CC:["vnuk","vnučka"],PPP:["praděd","prababička"],CCC:["pravnuk","pravnučka"],
  SP:["tchán","tchyně"],ZP:["budoucí tchán","budoucí tchyně"],CS:["zeť","snacha"],CZ:["budoucí zeť","budoucí snacha"],PCS:["švagr","švagrová"],SPC:["švagr","švagrová"],ZPC:["budoucí švagr","budoucí švagrová"],PCZ:["budoucí švagr","budoucí švagrová"],
  PCC:["synovec","neteř"],PPC:["strýc","teta"],PPCC:["bratranec","sestřenice"],PS:["nevlastní otec","macecha"],SC:["nevlastní syn","nevlastní dcera"],CSP:["tchán dítěte","tchyně dítěte"],PPCS:["strýc","teta"],SPP:["děd manžela/manželky","babička manžela/manželky"]};
const rgVztah=(cesta,cil)=>{const t=cesta.map(s=>s.t).join(""),z=RZENA(rodGraf().N.get(cil).n)?1:0;return (RGVZ[t]||[])[z]||""};
/* stav rodokmenů: zaostřená osoba, vybrané manželství, historie procházení */
const TSTAV={};
function treeHTML(id){
  const T=TREES[id]; if(!T||!T.main)return"";
  const G=rodGraf(),st=TSTAV[id]||(TSTAV[id]={h:[]});
  const hlava=T.main.duch?`${id}#g${T.main.slot}`:T.main.p||`${id}#m`;
  if(!st.f||!G.N.has(st.f))st.f=hlava;
  const F=G.N.get(st.f),mrtvy=o=>!o.duch&&umrelTree(o.d),DC=o=>mrtvy(o)?" dead":"";
  const esc=t=>String(t).replace(/<[^>]*>/g,"").replace(/"/g,"&quot;");
  const port=o=>o.duch?`<span class="tport tmono tsil" aria-hidden="true">?</span>`:o.p&&PBY[o.p]&&typeof PORTR!=="undefined"&&PORTR.has(o.p)?`<img class="tport" src="${portU(o.p,1)}" alt="" loading="lazy">`:`<span class="tport tmono" aria-hidden="true">${(o.n.replace(/^✦\s*/,"").match(/\p{L}/u)||["?"])[0]}</span>`;
  const nm=o=>{if(o.duch)return `<span class="tnm">${rgJm(o)}</span>`;const P=o.p&&PBY[o.p];return `<span class="tnm">${P?`<a href="#osoba/${o.p}">${o.n}</a>`:o.n}</span>`};
  const vek=o=>{if(o.duch||mrtvy(o))return"";if(o.p&&PBY[o.p]&&PBY[o.p].nar)return vekPostavy(PBY[o.p].nar);
    const m=String(o.d||"").match(/^\*\s*(asi\s*)?(?:\d{1,2}\.\s*\d{1,2}\.\s*)?(\d{4})/);if(!m)return"";const n=herniDen()[0]-+m[2];return n>=0?`${m[1]?"asi ":""}${n} ${tvarLet(n)}`:""};
  const meta=o=>{const v=vek(o);return o.d||v?`<span class="tdt">${o.d||""}${o.d&&v?" · ":""}${v?`<b>${v}</b>`:""}</span>`:""};
  const rl=r=>r&&byId[r]?`<a class="trl" href="#rod/${r}">${armsImg(byId[r],"tarm")}${SHORT[r]||byId[r].name}</a>`:"";
  const note=o=>{let x=o.note||"";if(!x)return"";return `<span class="tnote" title="${esc(x)}">${x}</span>`};
  const odz=(o,kr)=>(o.dedic?`<span class="tbadge" title="${o.dedic>1?o.dedic+". v pořadí nástupnictví":"dědic"}">♛ ${o.dedic>1?o.dedic+". dědic":"dědic"}</span>`:"")+(o.narok?(kr?`<span class="tbadge tnarokb" title="Nárok: ${esc(o.narok)}">⚖ nárok</span>`:`<span class="tnarok"><b>⚖ nárok:</b> ${o.narok}</span>`):"");
  /* tlačítko „rodina“: přesune rodokmen na tuto osobu (je-li o ní v rodokmenech víc) */
  const zde=new Set([F.key,...(G.PAR.get(F.key)||[]),...(G.SP.get(F.key)||[]).map(e=>e.k),...(G.CH.get(F.key)||[])]);
  const dalsi=o=>!o.duch&&o.key!==F.key&&((G.CH.get(o.key)||[]).some(k=>!zde.has(k))||(G.SP.get(o.key)||[]).some(e=>!zde.has(e.k))||(G.PAR.get(o.key)||[]).some(k=>!zde.has(k)));
  const fam=o=>dalsi(o)?`<button type="button" class="tfam" data-tree="${id}" data-tf="${esc(o.key)}" title="Zobrazit rodinu: ${esc(rgJm(o))}">⤢ rodina</button>`:"";
  const gmOK=GMV&&window.MMDB&&typeof edUloz==="function";
  const gmBar=(o,plny)=>{if(!gmOK||!o.src||o.duch)return"";const s=esc(JSON.stringify(o.src));const b=[];
    if(!mrtvy(o))b.push(`<button type="button" data-tgm="umrti" data-src="${s}" title="Zapsat úmrtí k dnešnímu hernímu datu">† zemřel(a)</button>`);
    if(plny&&(o.src.k==="main"||o.src.k==="kid"))b.push(`<button type="button" data-tgm="dite" data-src="${s}">+ dítě</button>`);
    if(plny&&o.src.k==="main")b.push(`<button type="button" data-tgm="snatek" data-src="${s}">+ sňatek</button>`);
    return b.length?`<span class="tgmbar">${b.join("")}</span>`:""};
  const card=(o,cls,extra)=>`<div class="tcard ${cls||""}${DC(o)}${o.duch?" tghost":""}">${port(o)}<div class="tbody">${nm(o)}${meta(o)}${odz(o)}${note(o)}${rl(o.r||o.rl)}${extra||""}</div></div>`;
  /* rodiče zaostřené osoby */
  const rodice=(G.PAR.get(F.key)||[]).map(k=>G.N.get(k));
  const maly=o=>`<div class="tcard troot tmal${DC(o)}${o.duch?" tghost":""}"><div class="tbody">${rodice.length===1?`<span class="tlbl">rodič</span>`:""}${nm(o)}${meta(o)}${rodice.length===1?note(o):""}${fam(o)}</div></div>`;
  const rodHTML=rodice.length?`<div class="tpar">${rodice.map((o,i)=>(i?`<span class="tpinf">∞</span>`:"")+maly(o)).join("")}</div><div class="tup"></div>`:"";
  /* manželé: šipkami předchozí / další manželství */
  const sps=(G.SP.get(F.key)||[]).map(e=>G.N.get(e.k));
  const zive=sps.map((o,i)=>i).filter(i=>!mrtvy(sps[i]));
  if(st.sel==null||st.sel>=sps.length||st.fsel!==F.key){st.sel=sps.length?(zive.length?zive[zive.length-1]:sps.length-1):-1;st.fsel=F.key}
  const sel=st.sel>=0?sps[st.sel]:null;
  const sipka=(i,smer)=>i<0||i>=sps.length?`<span class="tswap off"></span>`:`<button type="button" class="tswap t${smer}" data-tree="${id}" data-tsel="${i}" title="${i+1}. manželství: ${esc(rgJm(sps[i]))}" aria-label="${smer==="prev"?"Předchozí":"Další"} manželství">${smer==="prev"?"‹":"›"}</button>`;
  const spNav=sps.length>1?`<div class="tspnav">${sipka(st.sel-1,"prev")}<span>${st.sel+1}. manželství z ${sps.length}</span>${sipka(st.sel+1,"next")}</div>`:"";
  /* děti: s vybraným manželem, nebo s neznámým druhým rodičem */
  const vsechny=(G.CH.get(F.key)||[]).map(k=>G.N.get(k));
  const druhy=c=>(G.PAR.get(c.key)||[]).filter(k=>k!==F.key);
  const dKids=sps.length>1?vsechny.filter(c=>!druhy(c).length||sel&&druhy(c).includes(sel.key)):vsechny;
  const jinde=sps.length>1?sps.map((o,i)=>i).filter(i=>i!==st.sel&&vsechny.some(c=>druhy(c).includes(sps[i].key))):[];
  const kid=c=>`<li class="tcard tkid${DC(c)}${c.duch?" tghost":""}">${port(c)}<div class="tbody">${nm(c)}${meta(c)}${odz(c,1)}${note(c)}${rl(c.rl)}${fam(c)}${gmBar(c,false)}</div></li>`;
  const rows=[];for(let i=0;i<dKids.length;i+=4)rows.push(dKids.slice(i,i+4));
  const nadpis=dKids.length?`<p class="tkidsh">${sps.length>1&&sel?`Děti z ${st.sel+1}. manželství`:"Děti"} · ${dKids.length}</p>`:"";
  const deti=dKids.length?`<div class="tdrop"></div>${nadpis}<div class="tkids">${rows.map(r=>`<ul class="trow">${r.map(kid).join("")}</ul>`).join("")}</div>`
    :sps.length>1&&sel?`<p class="rsmall tnokids">Z tohoto manželství nejsou známy žádné děti.${jinde.length?` Děti jsou z ${jinde.map(i=>`<button type="button" class="tlinkb" data-tree="${id}" data-tsel="${i}">${i+1}. manželství (${esc(rgJm(sps[i]))})</button>`).join(" a ")}.`:""}</p>`:"";
  const nav=F.key!==hlava?`<div class="tnavbar"><button type="button" class="tlinkb" data-tree="${id}" data-tback>‹ zpět</button><span>Rodina: <b>${rgJm(F)}</b></span><button type="button" class="tlinkb" data-tree="${id}" data-thome>⌂ ${esc(rgJm(G.N.get(hlava)))}</button></div>`:"";
  /* „Jak jsou příbuzní?“ */
  const lid=[...G.N.values()].filter(o=>!o.duch&&o.n);
  const lab=o=>`${rgJm(o)}${o.rod&&byId[o.rod]?` (${SHORT[o.rod]||byId[o.rod].name})`:""}`;
  const kin=`<details class="tkin"${st.kin?" open":""}><summary>Jak jsou příbuzní?</summary><form class="tkinf" data-tree="${id}"><datalist id="tkl-${id}">${lid.map(o=>`<option value="${esc(lab(o))}"></option>`).join("")}</datalist>
    <input name="a" list="tkl-${id}" value="${esc(st.ka||lab(F))}" placeholder="první osoba" aria-label="První osoba"><span>a</span><input name="b" list="tkl-${id}" value="${esc(st.kb||"")}" placeholder="druhá osoba" aria-label="Druhá osoba"><button type="submit" class="gbtn">Najít</button></form>${st.kv||""}</details>`;
  return `<div class="tree" data-tree="${id}">
    ${nav}
    <div class="tcouple${sel?"":" solo"}${dKids.length?"":" bezdeti"}">
      ${rodHTML}
      ${card(F,"tmain",gmBar(F,true))}
      ${sel?`<div class="tinf"><span aria-label="${sps.length&&G.SP.get(F.key)[st.sel].zas?"zasnoubení":"manželé"}">${G.SP.get(F.key)[st.sel].zas?"⚭":"∞"}</span></div>${card(sel,"tspouse",fam(sel)+spNav)}`:""}
    </div>
    ${deti}
    ${F.key===hlava&&T.foot?`<p class="rsmall tfoot">${T.foot}</p>`:""}
    ${kin}
  </div>`;
}
function treeZnovu(id){const el=document.querySelector(`.tree[data-tree="${id}"]`);if(el)el.outerHTML=treeHTML(id)}
document.addEventListener("click",e=>{const b=e.target.closest("[data-tsel],[data-tf],[data-tback],[data-thome]");if(!b||!b.dataset.tree)return;const id=b.dataset.tree,st=TSTAV[id]||(TSTAV[id]={h:[]});
  if(b.dataset.tsel!=null)st.sel=+b.dataset.tsel;
  else if(b.dataset.tf){st.h.push(st.f);st.f=b.dataset.tf;st.sel=null}
  else if(b.dataset.tback!=null){st.f=st.h.pop()||null;st.sel=null}
  else{st.h=[];st.f=null;st.sel=null}
  treeZnovu(id);const t=document.querySelector(`.tree[data-tree="${id}"]`);
  if(t&&(b.dataset.tf||b.dataset.tback!=null||b.dataset.thome!=null)&&t.getBoundingClientRect().top<70)t.scrollIntoView({block:"start",behavior:"smooth"})});
document.addEventListener("toggle",e=>{const d=e.target;if(d.classList&&d.classList.contains("tkin")){const t=d.closest(".tree");if(t)(TSTAV[t.dataset.tree]||(TSTAV[t.dataset.tree]={h:[]})).kin=d.open}},true);
document.addEventListener("submit",e=>{const f=e.target.closest(".tkinf");if(!f)return;e.preventDefault();const id=f.dataset.tree,st=TSTAV[id]||(TSTAV[id]={h:[]}),G=rodGraf();
  const najdi=v=>{v=v.trim();const L=[...G.N.values()].filter(o=>!o.duch&&o.n);const lab=o=>`${rgJm(o)}${o.rod&&byId[o.rod]?` (${SHORT[o.rod]||byId[o.rod].name})`:""}`;
    return L.find(o=>lab(o)===v)||L.find(o=>rgJm(o)===v)||L.find(o=>norm(rgJm(o)).includes(norm(v)))};
  st.ka=f.a.value;st.kb=f.b.value;st.kin=true;const A=najdi(f.a.value),B=najdi(f.b.value);
  const odk=o=>o.p&&PBY[o.p]?`<a href="#osoba/${o.p}">${rgJm(o)}</a>`:`<b>${rgJm(o)}</b>`;
  if(!A||!B)st.kv=`<p class="tkinv">Osobu ${!A?`„${f.a.value}“`:`„${f.b.value}“`} jsem v rodokmenech nenašel.</p>`;
  else{const c=rgCesta(A.key,B.key);
    if(!c)st.kv=`<p class="tkinv">${odk(A)} a ${odk(B)} nejsou v známých rodokmenech nijak spojeni.</p>`;
    else if(!c.length)st.kv=`<p class="tkinv">To je tatáž osoba.</p>`;
    else{const v=rgVztah(c,B.key);let pred=A.key;
      const kroky=c.map(s=>{const w=(RGVZ[s.t]||[])[RZENA(G.N.get(s.k).n)?1:0];const o=`<span class="tkstep"><small>${w}</small>${odk(G.N.get(s.k))}</span>`;pred=s.k;return o}).join(`<span class="tkarr">→</span>`);
      st.kv=`<p class="tkinv">${v?`Kým je ${odk(B)} vůči osobě ${odk(A)}: <b class="tkrel">${v}</b>`:`${odk(A)} a ${odk(B)} jsou vzdáleně spřízněni (viz cesta níže).`}</p><p class="tkpath">${odk(A)}<span class="tkarr">→</span>${kroky}</p>`}}
  treeZnovu(id)});
/* vypravěč: rychlé úpravy rodokmenu (zapisují se do rodokmeny.json stejně jako v editoru) */
document.addEventListener("click",async e=>{const b=e.target.closest("[data-tgm]");if(!b||!GMV||!window.MMDB)return;
  let src;try{src=JSON.parse(b.dataset.src)}catch(err){return}
  const [Y,M,D]=herniDen(),dnes=`${D}. ${M}. ${Y}`,co=b.dataset.tgm;
  let jm="",rod="";
  if(co==="umrti"){if(!confirm(`Zapsat úmrtí k hernímu datu ${dnes}?`))return}
  else if(co==="dite"){jm=(prompt(`Jméno dítěte (narozeno ${dnes}):`)||"").trim();if(!jm)return}
  else if(co==="snatek"){jm=(prompt(`Jméno manžela / manželky (sňatek ${dnes}):`)||"").trim();if(!jm)return;rod=(prompt("Id rodu (nepovinné, např. roz, ste):")||"").trim();if(rod&&!byId[rod]){mmHlasG(`Rod „${rod}“ neexistuje – sňatek zapíšu bez odkazu na rod.`,6000);rod=""}}
  try{await edGen();await edNacti();const soubor="rodokmeny.json",raw=ED.z[soubor];const X=JSON.parse(raw),t=X[src.rid];if(!t)throw new Error("Rodokmen v souboru nenalezen.");
    const uzel=src.k==="main"?t.main:src.k==="root"?t.root:src.k==="sp"?(t.main.sp||[])[src.i]:src.k==="kid"?(t.kids||[])[src.i]:src.k==="gk"?((t.kids||[])[src.i]||{}).kids?.[src.j]:null;
    if(!uzel)throw new Error("Osobu se v souboru nepodařilo najít.");
    if(co==="umrti"){const d=String(uzel.d||"").trim();uzel.d=/^\*/.test(d)?d.replace(/^\*\s*/,"")+"–"+dnes:d?d+" – † "+dnes:"† "+dnes}
    else if(co==="dite"){const o={n:jm,d:"* "+dnes};const st=TSTAV[src.rid];if(src.k==="main"&&(t.main.sp||[]).length>1&&st&&st.sel!=null){const sp=rodGraf().SP.get(rodGraf().N.get(st.f)?.key||"")||[];const s=sp[st.sel]&&rodGraf().N.get(sp[st.sel].k);if(s&&s.src&&s.src.k==="sp")o.m=s.src.i+1}
      const cil=src.k==="main"?t:uzel;(cil.kids=cil.kids||[]).push(o)}
    else if(co==="snatek"){const o={n:jm,note:"∞ "+dnes};if(rod)o.r=rod;(uzel.sp=uzel.sp||[]).push(o)}
    const txt="{\n"+Object.keys(X).map(k=>" "+JSON.stringify(k)+": "+JSON.stringify(X[k])).join(",\n")+"\n}\n";
    await edUloz(soubor,txt,raw,co==="umrti"?"Úmrtí zapsáno do rodokmenu.":co==="dite"?"Dítě zapsáno do rodokmenu.":"Sňatek zapsán do rodokmenu.")}
  catch(err){mmHlasG("Rodokmen se nepodařilo upravit: "+err.message,8000)}});

