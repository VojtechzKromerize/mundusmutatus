/* ---------- Známý svět: mapa Evropy a Středomoří k 3. 3. 1458 ---------- */
const SVET=/*@SVET@*/[];
const SVETMESTA=/*@SVETMESTA@*/[];
const SVETDRZ=/*@SVETDRZ@*/[];
const SVETCESTY=/*@SVETCESTY@*/[];
const SRCOL={hanza:"#8b5a2b",benatky:"#b0302a",janov:"#2f5d9e",poutlod:"#7a4a9a",reka:"#3d7f8f",pout:"#7a4a9a",obchod:"#6b5a3a"};
const SRNAME={hanza:"lodě Hanzy",benatky:"benátské galéry",janov:"janovské lodě",poutlod:"poutní galéra",reka:"říční plavba",pout:"poutní cesty",obchod:"obchodní cesty po souši"};
const SRSEA=new Set(["hanza","benatky","janov","poutlod","reka"]);
/* kurfiřtská knížectví – přibližné obrysy (zeměpisné souřadnice); sedmým kurfiřtem je český král */
const SKURF=[["Mohuč",[[7.9,50.2],[8.3,50.15],[9.0,50.15],[9.6,50.0],[9.5,49.7],[8.9,49.7],[8.3,49.85],[7.9,49.95]]],
 ["Trevír",[[6.4,49.6],[6.9,49.95],[7.4,50.3],[7.7,50.45],[7.8,50.25],[7.3,49.9],[6.9,49.6],[6.5,49.4]]],
 ["Kolín",[[6.6,51.5],[7.0,51.6],[8.0,51.6],[8.6,51.4],[8.4,51.1],[7.5,51.1],[7.2,50.7],[7.0,50.6],[6.8,50.8],[6.6,51.1]]],
 ["Falc",[[7.6,49.7],[8.4,49.65],[9.0,49.5],[8.9,49.2],[8.3,49.1],[7.8,49.2],[7.6,49.4]]],
 ["Horní Falc",[[11.4,49.8],[12.4,49.8],[12.6,49.3],[11.9,49.0],[11.4,49.2]]],
 ["Sasko",[[11.4,51.9],[12.6,52.0],[13.4,51.9],[13.8,51.6],[14.0,51.2],[13.9,50.85],[13.2,50.5],[12.2,50.3],[11.4,50.4],[10.2,50.6],[10.0,51.0],[10.6,51.3],[11.2,51.5]]],
 ["Braniborsko",[[11.0,52.8],[11.3,53.0],[12.3,53.3],[13.5,53.5],[14.3,53.3],[15.5,53.0],[16.0,52.8],[15.3,52.3],[14.6,52.0],[13.7,51.9],[12.4,52.0],[11.6,52.4]]]];
const SVB={};SVET.forEach(s=>SVB[s.id]=s);
/* ---- ilustrace mapy světa: rozměry obrázků (šířka, výška[, složka]) ---- */
const SMA="art/svet/";
const SIMG={"mesto-velke":[283,200],"mesto-hradby":[308,200],"mesto-pristav":[390,200],"mesto-vychod":[329,200],"mesto-kupole":[281,200],"mesto-hrad":[205,200],"mesto-kralovske":[211,200],
 gryf:[370,360],fenix:[336,360],drak:[400,360],"m-praha":[221,220],"m-viden":[196,220],"m-budin":[258,220],"m-krakov":[269,220],"m-moskva":[319,220],"m-novgorod":[281,220],
 "m-rim":[321,220],"m-benatky":[210,220],"m-pariz":[237,220],"m-londyn":[244,220],"m-lisabon":[269,220],"m-granada":[315,220],"m-konstantinopol":[233,220],"m-jeruzalem":[337,220],
 "m-kahira":[244,220],"m-janov":[285,220],"m-tabriz":[311,220],ruzice:[434,440],"lod-koga":[211,220],"lod-galera":[240,220],"lod-karavela":[228,220],"lod-rybarska":[256,220],
 "obluda-velryba":[358,220],"obluda-had":[264,220],
};
/* města jako obrázky: [obrázek, velikost]; ostatní hlavní města dostanou opevněné město */
const SCITY={"Praha":["m-praha",2],"Vídeň":["m-viden",1.2],"Budín":["m-budin",1.2],"Krakov":["m-krakov",1.2],"Moskva":["m-moskva",1.2],"Novgorod":["m-novgorod",1.1],
 "Řím":["m-rim",1.25],"Benátky":["m-benatky",1.2],"Paříž":["m-pariz",1.2],"Londýn":["m-londyn",1.2],"Lisabon":["m-lisabon",1.15],"Granada":["m-granada",1.1],
 "Konstantinopol":["m-konstantinopol",1.4],"Jeruzalém":["m-jeruzalem",1.25],"Káhira":["m-kahira",1.3],"Janov":["m-janov",1.1],"Tabríz":["m-tabriz",1.25],"Florencie":["mesto-kupole",1],
 "Edinburgh":["mesto-kralovske",1],"Kodaň":["mesto-kralovske",1],"Neapol":["mesto-kralovske",1.05],"Barcelona":["mesto-pristav",1],"Trapezunt":["mesto-pristav",1],
 "Brusel":["mesto-velke",1],"Milán":["mesto-velke",1],"Královec":["mesto-hrad",1],"Vilno":["mesto-hradby",1],"Tunis":["mesto-vychod",1],"Fès":["mesto-vychod",1],
 "Lübeck":["mesto-pristav",.9],"Bruggy":["mesto-pristav",.9],"Alexandrie":["mesto-pristav",.9],"Kaffa":["mesto-pristav",.85]};
/* hory jen v pásmech skutečných pohoří; zasněžené vrcholy v Alpách a na Kavkaze */
/* v celkovém pohledu jen tato města; ostatní po přiblížení */
const SRIVHL=new Set(["Dunaj","Rýn","Labe","Visla","Dněpr","Volha"]);
/* lodě a obludy [obrázek, délka, šířka, šířka obrázku, zrcadlit], růžice portulánu [délka, šířka, velká] */
const SLODE=[["lod-koga",3.6,55.4,30],["lod-koga",17.6,55.9,26,1],["lod-galera",12.4,39.4,30],["lod-galera",27.2,34.4,28,1],["lod-karavela",-12.6,37.6,30],["lod-rybarska",2.5,64.3,24,1]];
const SOBLUDY=[["obluda-velryba",-21.5,51.6,50],["obluda-had",-17.5,31.5,36,1]];
const SPORT=[[-17,42.6,1],[5,38.5],[19.5,35.5],[28.5,33.8],[34,43.3]];
/* hlavní obchodní trasy: složené z úseků cest v svet-cesty.md [název, směr, odkud, kam] */
const SHCOL={hanza:"#8b5a2b",benatky:"#b0302a",janov:"#2f5d9e",souse:"#a07a22"};
const SHNAME={hanza:"Hanza",benatky:"benátské galéry",janov:"janovské lodě",souse:"hlavní cesty po souši"};
const SHLAVNI=[
 {k:"hanza",n:"Hanza: Londýn – Bruggy – Lübeck – Novgorod",r:[["Hanza: Bruggy – Londýn",-1],["Hanza: Cuxhaven – Bruggy",-1],["Hanza: Hamburk – Cuxhaven po Labi",-1],["Hanza: Lübeck – Hamburk po souši",-1],["Hanza: Lübeck – Gotland – Reval – Novgorod",1],["Hanza: Něva – Ladoga – Volchov – Novgorod",1]]},
 {k:"hanza",n:"Hanza: Lübeck – Bergen",r:[["Hanza: Lübeck – Bergen",1]]},
 {k:"benatky",n:"Benátky – Konstantinopol – Kaffa – Tana",r:[["Benátské galéry do Romanie a Černého moře",1],["Benátské galéry: Kaffa – Tana",1]]},
 {k:"benatky",n:"Benátky – Kandie – Alexandrie",r:[["Benátské galéry do Romanie a Černého moře",1,"Benátky","Modon"],["Benátské galéry do Alexandrie a Bejrútu",1,"Modon","Kandie"],["Benátské galéry: Kandie – Alexandrie",1]]},
 {k:"benatky",n:"Benátské flanderské galéry",r:[["Benátské flanderské galéry",1]]},
 {k:"janov",n:"Janov – Chios – Konstantinopol – Kaffa",r:[["Janovské lodě na Východ",1]]},
 {k:"janov",n:"Janov – Lisabon – Bruggy",r:[["Janovské lodě do Bruggy",1]]},
 {k:"souse",n:"Bruggy – Kolín – Norimberk – Praha – Vídeň – Budín – Konstantinopol – Tabríz",r:[["Norimberk – Frankfurt – Kolín – Bruggy",-1],["Zlatá cesta Praha – Norimberk",-1],["Praha – Vídeň",1],["Dunajská cesta Řezno – Vídeň – Budín",1,"Vídeň"],["Budín – Bělehrad",1],["Carihradská cesta (Via militaris)",1],["Přes Marmaru do Bursy",1],["Hedvábná cesta Bursa – Tabríz",1]]},
 {k:"souse",n:"Benátky – Brenner – Augsburg",r:[["Brennerská cesta Augsburg – Benátky",-1]]},
 {k:"souse",n:"Via Regia: Frankfurt – Lipsko – Vratislav – Krakov",r:[["Královská cesta (Via Regia)",1]]}];
let SHL=null;
function sHlavni(){if(SHL)return SHL;SHL=SHLAVNI.map(h=>{const pts=[];h.r.forEach(([n,dir,od,kam])=>{const r=SVETCESTY.find(x=>x.n===n);if(!r)return;let p=r.p.slice();if(dir<0)p.reverse();
    if(od){const i=p.findIndex(q=>q[0]===od);if(i>0)p=p.slice(i)}if(kam){const i=p.findIndex(q=>q[0]===kam);if(i>=0)p=p.slice(0,i+1)}
    if(pts.length&&p.length&&((p[0][0]&&p[0][0]===pts[pts.length-1][0])||(p[0][1]===pts[pts.length-1][1]&&p[0][2]===pts[pts.length-1][2])))p=p.slice(1);pts.push(...p)});
  return {...h,pts}}).filter(h=>h.pts.length>1);return SHL}
const SVIRA={kat:"katolíci",pra:"pravoslavní",isl:"islám",mix:"smíšené vyznání",kal:"kališníci"};
const SVIRAC={kat:"var(--kat)",pra:"var(--spra)",isl:"var(--sisl)",mix:"var(--mix)",kal:"var(--kal)"};
let SG=null;const sst={vb:null,sel:null,hre:true,faith:false,cities:true,riv:true,conf:"all",routes:false,party:false,draci:false};
const SM={on:false,a:null,b:null,path:null};
const sDark=()=>{const t=document.documentElement.dataset.theme;return t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)};
const sConfOk=S=>sst.conf==="all"||(S&&(S.c===sst.conf||(sst.conf==="mix"&&S.c==="kal")));
function SPinv(x,y){const p=SG.proj,X=x/p.S+p.X0,Y=p.Y1-y/p.S,dy=p.rho0-Y,rho=Math.sign(p.n)*Math.hypot(X,dy),th=Math.atan2(X,dy);
  return [p.lon0+th/p.n*180/Math.PI,(2*Math.atan(Math.pow(p.F/rho,1/p.n))-Math.PI/2)*180/Math.PI]}
const SVB0=[0,0,1024,790],SVMOB=[340,230,360,278];
let SNET=null;
function sInLand(x,y){
  if(!SNET.lb)SNET.lb=SG.land.map(pl=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;pl[0].forEach(([x,y])=>{if(x<a)a=x;if(y<b)b=y;if(x>c)c=x;if(y>d)d=y});return [a,b,c,d]});
  const pip=r=>{let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,yi]=r[i],[xj,yj]=r[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins};
  for(let i=0;i<SG.land.length;i++){const b=SNET.lb[i];if(x<b[0]||x>b[2]||y<b[1]||y>b[3])continue;const pl=SG.land[i];if(pip(pl[0])&&!pl.slice(1).some(pip))return true}
  return false}
function sLandLine(a,b){const A=SP(...a),B=SP(...b),n=Math.max(4,Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])/4));let ok=0;
  for(let i=1;i<n;i++){const t=i/n;if(sInLand(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t))ok++}return ok/(n-1)>=.9}
function sNetBuild(){const N=SNET={n:[],adj:[],by:{}};
  const node=(name,ll)=>{if(name&&N.by[name]!=null)return N.by[name];const i=N.n.length;N.n.push({name,ll});N.adj.push([]);if(name)N.by[name]=i;return i};
  const link=(a,b,km,sea,k)=>{N.adj[a].push({to:b,km,sea,k});N.adj[b].push({to:a,km,sea,k})};
  SVETCESTY.forEach(r=>{const sea=SRSEA.has(r.k);let prev=null;r.p.forEach(([nm,lo,la])=>{const i=node(nm,[lo,la]);
    if(prev!=null)link(prev,i,haversine(N.n[prev].ll,N.n[i].ll)*(sea?1.05:1.15),sea,r.k);prev=i})});
  SVETMESTA.forEach(([n,lo,la])=>node(n,[lo,la]));
  const named=N.n.map((x,i)=>i).filter(i=>N.n[i].name);
  for(let a=0;a<named.length;a++)for(let b=a+1;b<named.length;b++){const i=named[a],j=named[b],d=haversine(N.n[i].ll,N.n[j].ll);
    if(d<260&&!N.adj[i].some(e=>e.to===j)&&sLandLine(N.n[i].ll,N.n[j].ll))link(i,j,d*1.3,false,"")}}
/* nejrychlejší cesta po známých trasách; vl, vs = km za den po souši a po moři */
function sRoute(A,B,vl,vs){
  if(!SNET)sNetBuild();const N=SNET,base=N.n.length,extra=[[],[]];
  const att=(q,slot)=>{if(q.key&&N.by[q.key]!=null)return N.by[q.key];
    const onL=sInLand(...SP(...q.ll)),near=N.n.map((x,i)=>[i,haversine(q.ll,x.ll)]);
    near.filter(([i])=>N.n[i].name).sort((a,b)=>a[1]-b[1]).slice(0,8).forEach(([i,d])=>{if(d>650)return;if(!onL||sLandLine(q.ll,N.n[i].ll))extra[slot].push({to:i,km:onL?d*1.3:d*1.05,sea:!onL})});
    if(!onL)near.filter(([i,d])=>!N.n[i].name&&d<250).forEach(([i,d])=>extra[slot].push({to:i,km:d*1.05,sea:true}));
    return base+slot};
  const ia=att(A,0),ib=att(B,1),direct=haversine(A.ll,B.ll),dOk=direct<700&&sLandLine(A.ll,B.ll);
  const adj=i=>{const out=i<base?N.adj[i].slice():extra[i-base].slice();
    for(let q=0;q<2;q++)extra[q].forEach(e=>{if(e.to===i)out.push({to:base+q,km:e.km,sea:e.sea})});
    if(i===ia&&dOk)out.push({to:ib,km:direct*1.3,sea:false});return out};
  const dist=new Map([[ia,0]]),prev=new Map(),done=new Set(),pq=[[0,ia]];
  while(pq.length){let m=0;for(let i=1;i<pq.length;i++)if(pq[i][0]<pq[m][0])m=i;const [d,u]=pq.splice(m,1)[0];if(done.has(u))continue;done.add(u);if(u===ib)break;
    for(const e of adj(u)){const nd=d+e.km/(e.sea?vs:vl);if(nd<(dist.has(e.to)?dist.get(e.to):1e18)){dist.set(e.to,nd);prev.set(e.to,[u,e]);pq.push([nd,e.to])}}}
  if(ia!==ib&&!prev.has(ib))return null;
  const llOf=i=>i===base?A.ll:i===base+1?B.ll:N.n[i].ll,path=[];let land=0,sea=0,u=ib;
  while(u!==ia){const [p,e]=prev.get(u);path.unshift({ll:llOf(u),sea:e.sea});if(e.sea)sea+=e.km;else land+=e.km;u=p}
  path.unshift({ll:llOf(ia),sea:false});
  return {path,land:Math.round(land),sea:Math.round(sea)}}
const sTip=(e,h)=>{const t=document.getElementById("stip");if(!t)return;if(!h||e.pointerType!=="mouse"){t.hidden=true;return}
  const b=t.parentElement.getBoundingClientRect();t.innerHTML=h;t.hidden=false;
  t.style.left=Math.min(e.clientX-b.left+14,b.width-t.offsetWidth-6)+"px";t.style.top=(e.clientY-b.top+16)+"px"};
/* ručně umístěné popisky velkých mocností (zeměpisná délka, šířka) */
const SLABPOS={hre:[11.5,52.0],ott:[33.8,38.5],boh:[16.2,50.25],hun:[21.3,46.6],pol:[19.6,52.4],fra:[2.2,46.6],kas:[-3.4,39.4],por:[-8.4,41.1],mam:[30.0,28.6],
 ven:[12.2,45.85],pap:[12.6,42.9],nap:[15.6,41.0],mos:[42.0,57.6],nov:[37.5,63.5],kal:[14.5,63.3],lit:[27.5,53.0],hor:[44.5,50.5],eng:[-1.6,52.6],bur:[4.2,50.4],ara:[-0.3,41.0],qqq:[43.6,35.0]};
/* moře, hory: zeměpisné souřadnice */
const SSEAS=[["Atlantský oceán",-15,47,0,15],["Severní moře",3.5,56.3,0,11],["Baltské moře",19.2,57.2,-62,10],["Norské moře",1,66,0,12],["Bílé moře",38.5,65.6,0,8.5],
 ["Středozemní moře",17.5,34.6,0,14],["Tyrhénské moře",11.8,40,0,9],["Jaderské moře",15.3,43.1,-42,8.5],["Egejské moře",25.2,38.9,-70,8.5],["Černé moře",34.5,43.3,0,12],
 ["Azovské moře",36.7,46.1,0,7.5],["Kaspické moře",50.5,43,-75,10],["Biskajský záliv",-5,45.4,0,9],["Iónské moře",18.5,37.8,0,8.5]];
function SP(lon,lat){const p=SG.proj,r=p.F/Math.pow(Math.tan(Math.PI/4+lat*Math.PI/360),p.n),t=p.n*(lon-p.lon0)*Math.PI/180;
  return [(r*Math.sin(t)-p.X0)*p.S,(p.Y1-(p.rho0-r*Math.cos(t)))*p.S]}
/* svet.json je zhuštěný: souřadnice jsou celá čísla (desetiny bodu) zapsaná jako rozdíly od předchozího bodu */
function svRozbal(d){if(!d._z)return d;
  const dz=a=>{const o=[];let x=0,y=0;for(let i=0;i<a.length;i+=2){x+=a[i];y+=a[i+1];o.push([x/10,y/10])}return o},P=v=>(v||[]).map(p=>p.map(dz));
  for(const k in d.states)d.states[k]=P(d.states[k]);d.land=P(d.land);d.hre=P(d.hre);d.lakes=P(d.lakes);(d.rivers||[]).forEach(r=>r.p=dz(r.p));return d}
function svInit(){
  if(SG){sDraw();return}
  if(!sst.vb&&matchMedia("(max-width:700px)").matches)sst.vb=SVMOB;
  const m=document.getElementById("smap");m.innerHTML='<text x="500" y="386" text-anchor="middle" class="rivlbl" font-size="20">Mapa se načítá…</text>';
  fetch("art/svet.json").then(r=>r.json()).then(d=>{SG=svRozbal(d);sDraw();sList();sDetail()}).catch(()=>{m.innerHTML='<text x="500" y="386" text-anchor="middle" class="rivlbl" font-size="20">Mapu se nepodařilo načíst.</text>'});
}
/* řetězce cest pro tvary mapy se sestaví jen jednou; při přiblížení se jen znovu použijí */
const SVPC=new WeakMap();
const svPath=p=>{let v=SVPC.get(p);if(v===undefined){v=p.map(r=>"M"+r.map(q=>q.join(",")).join("L")+"Z").join("");SVPC.set(p,v)}return v};
const svLine=r=>{let v=SVPC.get(r);if(v===undefined){v="M"+r.map(q=>q.join(",")).join("L");SVPC.set(r,v)}return v};
function sDraw(){
  const svg=document.getElementById("smap"),vb=sst.vb||SVB0,SW0=svg.getBoundingClientRect().width||700;svg.setAttribute("viewBox",vb.join(" "));
  const s=vb[2]/SVB0[2];svg.innerHTML="";const k=Math.max(s,.35);{const t=document.getElementById("stip");if(t)t.hidden=true}
  const R={x:-60,y:-60,width:1150,height:920};
  const defs=el("defs",{});
  const mkF=(id,freq,scale,oct,seed,extra)=>{const f=el("filter",{id,filterUnits:"userSpaceOnUse",...R});
    f.appendChild(el("feTurbulence",{type:"fractalNoise",baseFrequency:freq,numOctaves:oct,seed,result:"n"}));
    f.appendChild(el("feDisplacementMap",{in:"SourceGraphic",in2:"n",scale,xChannelSelector:"R",yChannelSelector:"G",result:"d"}));
    if(extra)extra(f);defs.appendChild(f)};
  mkF("swob",0.06,1.6,2,4);
  mkF("swash",0.035,5,3,6,f=>{f.appendChild(el("feGaussianBlur",{in:"d",stdDeviation:1.2,result:"b"}));
    f.appendChild(el("feTurbulence",{type:"fractalNoise",baseFrequency:0.09,numOctaves:2,seed:12,result:"m"}));
    f.appendChild(el("feColorMatrix",{in:"m",type:"matrix",values:"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35",result:"ma"}));
    f.appendChild(el("feComposite",{in:"b",in2:"ma",operator:"in"}))});
  {const f=el("filter",{id:"spaper",filterUnits:"userSpaceOnUse",...R});
   f.appendChild(el("feTurbulence",{type:"fractalNoise",baseFrequency:0.55,numOctaves:3,seed:3,result:"n"}));
   f.appendChild(el("feColorMatrix",{in:"n",type:"matrix",values:"0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 -2.2 1.25"}));defs.appendChild(f);
   const f2=el("filter",{id:"sstain",filterUnits:"userSpaceOnUse",...R});
   f2.appendChild(el("feTurbulence",{type:"fractalNoise",baseFrequency:0.009,numOctaves:3,seed:23,result:"n"}));
   f2.appendChild(el("feColorMatrix",{in:"n",type:"matrix",values:"0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.16  0 0 0 -3 1.6"}));defs.appendChild(f2);}
  const rg=el("radialGradient",{id:"svig",cx:"50%",cy:"50%",r:"72%"});
  rg.appendChild(el("stop",{offset:"58%","stop-color":"var(--rule)","stop-opacity":"0"}));rg.appendChild(el("stop",{offset:"100%","stop-color":"var(--hill)","stop-opacity":".7"}));defs.appendChild(rg);
  {const pt=el("pattern",{id:"swave",patternUnits:"userSpaceOnUse",width:34,height:22});
   pt.appendChild(el("path",{d:"M3,8q3,-2.6 6,0t6,0M20,18q3,-2.6 6,0t6,0",fill:"none",stroke:"var(--water)","stroke-width":".7",opacity:".55"}));defs.appendChild(pt);}
  {const ph=el("pattern",{id:"shatch",patternUnits:"userSpaceOnUse",width:5*k,height:5*k,patternTransform:"rotate(45)"});
   ph.appendChild(el("rect",{width:5*k,height:5*k,fill:"var(--land)"}));ph.appendChild(el("path",{d:`M0,0V${5*k}`,stroke:"var(--ink)","stroke-width":(.6*k).toFixed(2),opacity:".22"}));defs.appendChild(ph);}
  svg.appendChild(defs);
  const G=a=>svgG(svg,a);
  const path=svPath;
  const pxu=SW0/vb[2],pf=Math.min(1,Math.max(.8,SW0/700)),RR=px=>px*pf/pxu;
  /* opakované obrázky přes <symbol>/<use>: obrázek se načte jednou */
  const SYM=new Set(),use=(f,x,y,w,h,fl)=>{if(!SYM.has(f)){SYM.add(f);const [iw,ih]=SIMG[f],sy=el("symbol",{id:"ss-"+f,viewBox:`0 0 ${iw} ${ih}`,preserveAspectRatio:"none"});
      sy.appendChild(el("image",{href:(SIMG[f][2]||SMA)+f+".webp",width:iw,height:ih}));defs.appendChild(sy)}
    return el("use",{href:"#ss-"+f,x:x.toFixed(1),y:y.toFixed(1),width:w.toFixed(1),height:h.toFixed(1),...(fl?{transform:`translate(${(2*x+w).toFixed(1)} 0) scale(-1 1)`}:{})})};
  [["sglow",1.8,2.4],["sglowf",2.2*s,3*s]].forEach(([id,rd,bl])=>{const f=el("filter",{id,x:"-20%",y:"-20%",width:"140%",height:"140%"});
   f.appendChild(el("feMorphology",{in:"SourceAlpha",operator:"dilate",radius:rd.toFixed(2),result:"d"}));f.appendChild(el("feGaussianBlur",{in:"d",stdDeviation:bl.toFixed(2),result:"b"}));
   f.appendChild(el("feFlood",{"flood-color":"#e9dcb8","flood-opacity":".6"}));f.appendChild(el("feComposite",{in2:"b",operator:"in",result:"g"}));
   const mg=el("feMerge",{});mg.appendChild(el("feMergeNode",{in:"g"}));mg.appendChild(el("feMergeNode",{in:"SourceGraphic"}));f.appendChild(mg);defs.appendChild(f)});
  defs.appendChild((()=>{const c=el("clipPath",{id:"sdrc",clipPathUnits:"objectBoundingBox"});c.appendChild(el("circle",{cx:.5,cy:.5,r:.5}));return c})());
  /* moře */
  svg.appendChild(el("rect",{...R,fill:"var(--water)","fill-opacity":".22"}));
  svg.appendChild(el("rect",{...R,fill:"url(#swave)"}));
  /* portulánová síť: 32 větrů z několika růžic, černé hlavní, zelené vedlejší, červené čtvrťové */
  {const g=G({"pointer-events":"none",opacity:".5"}),L=330,dd=["","",""];
   SPORT.forEach(([lo,la])=>{const [x,y]=SP(lo,la);for(let i=0;i<32;i++){const a=i*Math.PI/16,t=i%4===0?0:i%2===0?1:2;dd[t]+=`M${x.toFixed(1)},${y.toFixed(1)}l${(Math.cos(a)*L).toFixed(1)},${(Math.sin(a)*L).toFixed(1)}`}});
   [["var(--ink)",.42],["#4f7a3a",.36],["#a3232b",.32]].forEach(([c,w],t)=>g.appendChild(el("path",{d:dd[t],fill:"none",stroke:c,"stroke-width":(w*k).toFixed(2)})))}
  /* pevnina a mocnosti: pergamen s jemným vodovým pásem podél hranic; plnou barvu má jen Koruna česká,
     Svatá říše římská má jeden společný pás a tenké vnitřní hranice */
  if(!SG._hre){const rings=(SG.hre||[]).map(p=>p[0]);const pip=(x,y,r)=>{let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,yi]=r[i],[xj,yj]=r[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins};
    const it=[SP(6.3,36.4),SP(18.9,46.6)];SG._hre=new Set();SG._ita=new Set();
    Object.entries(SG.lab).forEach(([id,[x,y]])=>{if(id==="boh")return;if(rings.some(r=>pip(x,y,r)))SG._hre.add(id);const [lo,la]=SPinv(x,y);if(lo>6.3&&lo<18.9&&la>36.4&&la<46.6&&!SVB[id]?.h)SG._ita.add(id)})}
  {const gl=G({filter:"url(#swash)"});gl.appendChild(el("path",{d:SG.land.map(path).join(""),fill:"var(--land)"}));
   const dk=sDark(),col=id=>SG.fill&&SG.fill[id]?SG.fill[id][dk?1:0]:`var(--sw${SG.col[id]%10})`;
   /* vodový pás podél hranic: bez filtru, jinak se mapa při posouvání stránky kouše */
   const gw=G({"pointer-events":"none"});
   Object.entries(SG.states).forEach(([id,ps])=>{const d=ps.map(path).join("");
     if(id==="boh"){gw.appendChild(el("path",{d,fill:col(id),"fill-opacity":dk?".8":".72"}));return}
     if(SG._hre.has(id))return;
     const cp=el("clipPath",{id:"sc-"+id});cp.appendChild(el("path",{d}));defs.appendChild(cp);
     gw.appendChild(el("path",{d,fill:col(id),"fill-opacity":".07",stroke:col(id),"stroke-width":(8*k).toFixed(2),"stroke-opacity":dk?".75":".62","clip-path":`url(#sc-${id})`}))});
   if(SG.hre){const d=SG.hre.map(path).join(""),cp=el("clipPath",{id:"sc-hre"});cp.appendChild(el("path",{d}));defs.appendChild(cp);
     gw.appendChild(el("path",{d,fill:"var(--gold)","fill-opacity":".09",stroke:"var(--gold)","stroke-width":(9*k).toFixed(2),"stroke-opacity":dk?".55":".45","clip-path":"url(#sc-hre)"}))}
   const gs=G({filter:"url(#swob)"});
   const foe=new Set(sst.sel&&SVB[sst.sel]?SVB[sst.sel].sp:[]),ally=new Set(sst.sel&&SVB[sst.sel]?SVB[sst.sel].al:[]),tens=new Set(sst.sel&&SVB[sst.sel]?SVB[sst.sel].na:[]),rel=foe.size||ally.size||tens.size;
   Object.entries(SG.states).forEach(([id,ps])=>{const S=SVB[id];
     const ok=sConfOk(S),hot=foe.has(id)||ally.has(id)||tens.has(id),fill=foe.has(id)?(dk?"#7a2a24":"#d4473a"):ally.has(id)?(dk?"#2c4f86":"#4f7fd0"):tens.has(id)?(dk?"#7a5418":"#e3a23b"):sst.faith&&S?SVIRAC[S.c]:ok?"#000":"url(#shatch)";
     const p=el("path",{d:ps.map(path).join(""),fill,"fill-opacity":hot?(rel&&id!==sst.sel?".55":".6"):sst.faith?".32":ok?"0":".8","fill-rule":"evenodd",stroke:"var(--ink)","stroke-width":((SG._hre.has(id)?.35:.5)*k).toFixed(2),"stroke-opacity":SG._hre.has(id)?".45":".6","stroke-linejoin":"round",class:"spoly","data-id":id});
     p.addEventListener("pointermove",e=>sTip(e,S?`<b>${S.n}</b>${S.v?`<br>${S.v}`:""}`:""));p.addEventListener("pointerleave",e=>sTip(e,""));
     p.addEventListener("click",e=>{if(SM.on)return;e.stopPropagation();if(sDrag.moved)return;sSel(id)});
     gs.appendChild(p)});
   gl.appendChild(el("path",{d:SG.land.map(path).join(""),fill:"none",stroke:"var(--water)","stroke-width":(1.3*k).toFixed(2),opacity:".8"}));
   if(SG.lakes)gs.appendChild(el("path",{d:SG.lakes.map(path).join(""),fill:"var(--water)","fill-opacity":".3",stroke:"var(--water)","stroke-width":(.5*k).toFixed(2)}));}
  /* hranice Svaté říše římské */
  if(sst.hre&&SG.hre){const g=G({filter:"url(#swob)","pointer-events":"none"});const d=SG.hre.map(path).join("");
    g.appendChild(el("path",{d,fill:"none",stroke:"var(--paper)","stroke-width":(4.2*k).toFixed(2),opacity:".8"}));
    g.appendChild(el("path",{d,fill:"none",stroke:"var(--gold)","stroke-width":(2.2*k).toFixed(2),"stroke-dasharray":`${7*k} ${4*k}`}))}
  /* nepřátelé vybrané mocnosti */
  if(sst.sel&&SVB[sst.sel]&&SVB[sst.sel].sp.length){const g=G({filter:"url(#swob)","pointer-events":"none"});
    SVB[sst.sel].sp.forEach(id=>{if(SG.states[id])g.appendChild(el("path",{d:SG.states[id].map(path).join(""),fill:"none",stroke:"var(--kal)","stroke-width":(2.4*k).toFixed(2),"stroke-dasharray":`${5*k} ${3*k}`,"stroke-linejoin":"round"}))})}
  /* napětí vybrané mocnosti */
  if(sst.sel&&SVB[sst.sel]&&SVB[sst.sel].na.length){const g=G({filter:"url(#swob)","pointer-events":"none"});
    SVB[sst.sel].na.forEach(id=>{if(SG.states[id])g.appendChild(el("path",{d:SG.states[id].map(path).join(""),fill:"none",stroke:"#b06d10","stroke-width":(2.4*k).toFixed(2),"stroke-dasharray":`${5*k} ${3*k}`,"stroke-linejoin":"round"}))})}
  /* spojenci vybrané mocnosti */
  if(sst.sel&&SVB[sst.sel]&&SVB[sst.sel].al.length){const g=G({filter:"url(#swob)","pointer-events":"none"});
    SVB[sst.sel].al.forEach(id=>{if(SG.states[id])g.appendChild(el("path",{d:SG.states[id].map(path).join(""),fill:"none",stroke:"#2f5d9e","stroke-width":(2.4*k).toFixed(2),"stroke-dasharray":`${5*k} ${3*k}`,"stroke-linejoin":"round"}))})}
  /* vybraná mocnost */
  if(sst.sel&&SG.states[sst.sel]){const g=G({filter:"url(#swob)","pointer-events":"none"});
    g.appendChild(el("path",{d:SG.states[sst.sel].map(path).join(""),fill:"var(--gold)","fill-opacity":".18",stroke:"var(--gold)","stroke-width":(2.6*k).toFixed(2),"stroke-linejoin":"round"}))}
  /* řeky (Natural Earth; hustota podle přiblížení) */
  const inV=(x,y,m)=>x>vb[0]-m&&x<vb[0]+vb[2]+m&&y>vb[1]-m&&y<vb[1]+vb[3]+m;
  const rivT=s<.35?2:s<.62?1:0;
  if(sst.riv){const g=G({filter:"url(#swob)","pointer-events":"none"});
    [0,1,2].forEach(t=>{if(t>rivT)return;const d=SG.rivers.filter(r=>r.t===t&&!SRIVHL.has(r.n)&&r.p.some(([x,y])=>inV(x,y,20))).map(r=>svLine(r.p)).join("");
      if(d)g.appendChild(el("path",{d,fill:"none",stroke:"var(--water)","stroke-width":([1.1,.8,.6][t]*k).toFixed(2),"stroke-linecap":"round","stroke-linejoin":"round",opacity:".9"}))});
    {const d=SG.rivers.filter(r=>SRIVHL.has(r.n)&&r.p.some(([x,y])=>inV(x,y,20))).map(r=>svLine(r.p)).join("");
     g.appendChild(el("path",{d,fill:"none",stroke:"var(--paper)","stroke-width":(3.4*k).toFixed(2),"stroke-linecap":"round","stroke-linejoin":"round",opacity:".55"}));
     g.appendChild(el("path",{d,fill:"none",stroke:"var(--water)","stroke-width":(2*k).toFixed(2),"stroke-linecap":"round","stroke-linejoin":"round"}))}
  }
  /* lodě na obchodních trasách, obludy v otevřeném Atlantiku, růžice portulánu */
  {const g=G({"pointer-events":"none"}),z=Math.max(k,.5);
   SPORT.forEach(([lo,la,big])=>{const [x,y]=SP(lo,la);if(big){const w=74;g.appendChild(use("ruzice",x-w/2,y-w/2,w,w))}
     else{const r=6*k;let d="";for(let i=0;i<16;i++){const a=i*Math.PI/8,q=i%2?r*.42:r*(i%4?.75:1.15);d+=(i?"L":"M")+(x+Math.sin(a)*q).toFixed(1)+","+(y-Math.cos(a)*q).toFixed(1)}
       g.appendChild(el("path",{d:d+"Z",fill:"var(--gold)",stroke:"var(--ink)","stroke-width":(.4*k).toFixed(2)}));g.appendChild(el("circle",{cx:x,cy:y,r:1.5*k,fill:"var(--kal)"}))}});
   [...SLODE,...SOBLUDY].forEach(([f,lo,la,w,fl])=>{const [x,y]=SP(lo,la);if(!inV(x,y,60))return;const [iw,ih]=SIMG[f],W=w*z,H=W*ih/iw;g.appendChild(use(f,x-W/2,y-H/2,W,H,fl))})}
  /* popisky moří */
  const T=(x,y,t,cls,fs,rot,st,ls)=>svg.appendChild(el("text",{x,y,class:cls,"font-size":(fs*k).toFixed(1),"text-anchor":"middle","stroke-width":(2.6*k).toFixed(2),...(ls?{"letter-spacing":ls}:{}),...(rot?{transform:`rotate(${rot} ${x} ${y})`}:{}),...(st?{style:st}:{})},t));
  SSEAS.forEach(([n,lo,la,r,fs])=>{const [x,y]=SP(lo,la);T(x,y,n,"rivlbl",fs,r,"stroke:none",".06em")});
  if(sst.riv){(SG.rivlab||[]).forEach(([n,x,y,r,t])=>{if(t>rivT-(s<.45?0:1)||!inV(x,y,0))return;T(x,y-1.2*k,n,"rivlbl",t?6.5:7.5,r,"stroke:var(--land)")});
}
  /* popisky mocností; menší státy Říše a Itálie až po přiblížení */
  Object.entries(SG.lab).forEach(([id,[x,y,a]])=>{const S=SVB[id];if(!S)return;if(SLABPOS[id])[x,y]=SP(...SLABPOS[id]);
    if(!S.h&&(s>.62||(s>.42&&a<16)||((SG._hre.has(id)||SG._ita.has(id))&&s>.5)))return;
    const fs=S.h?Math.min(15,Math.max(8.5,a/7)):Math.min(9,Math.max(6,a/6.5));
    T(x,y,(S.k||S.n).toUpperCase(),"slbl",fs,0,null,".12em")});
  /* kurfiřti (s hranicí Říše) */
  if(sst.hre&&s<.75){const g=G({"pointer-events":"none"});SKURF.forEach(([n,ring])=>{const pp=ring.map(q=>SP(...q));
      g.appendChild(el("path",{d:"M"+pp.map(q=>q.map(v=>v.toFixed(1)).join(",")).join("L")+"Z",fill:"var(--gold)","fill-opacity":".1",stroke:"var(--gold)","stroke-width":(.9*k).toFixed(2),"stroke-dasharray":`${2*k} ${1.6*k}`}));
      const cx=pp.reduce((a,q)=>a+q[0],0)/pp.length,cy=pp.reduce((a,q)=>a+q[1],0)/pp.length;
      if(s<.5)T(cx,cy+2*k,"♔ "+n,"rivlbl skurf",6.8,0,"stroke:var(--land)")})}
  /* obchodní cesty: zjednodušené hlavní trasy; podrobná síť (i poutní cesty) se ukáže po přiblížení */
  if(sst.routes){const g=G({"pointer-events":"none"});
    if(s<.5)SVETCESTY.forEach(r=>{const pp=r.p.map(q=>SP(q[1],q[2]));if(!pp.some(([x,y])=>inV(x,y,60)))return;
      g.appendChild(el("path",{d:"M"+pp.map(q=>q.map(v=>v.toFixed(1)).join(",")).join("L"),fill:"none",stroke:SRCOL[r.k],"stroke-width":(.8*k).toFixed(2),opacity:".55","stroke-linejoin":"round",
        ...(SRSEA.has(r.k)?{"stroke-dasharray":`${3*k} ${2*k}`}:r.k==="pout"?{"stroke-dasharray":`${.3*k} ${2.2*k}`,"stroke-linecap":"round"}:{})}))});
    sHlavni().forEach(h=>{const pp=h.pts.map(q=>SP(q[1],q[2])),sea=h.k!=="souse";if(!pp.some(([x,y])=>inV(x,y,80)))return;
      let d=`M${pp[0][0].toFixed(1)},${pp[0][1].toFixed(1)}`;for(let i=0;i<pp.length-1;i++){const p0=pp[i-1]||pp[i],p1=pp[i],p2=pp[i+1],p3=pp[i+2]||p2;
        d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`}
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--paper)","stroke-width":(4.6*k).toFixed(2),opacity:".75","stroke-linejoin":"round","stroke-linecap":"round"}));
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--ink)","stroke-width":(3*k).toFixed(2),opacity:".55","stroke-linejoin":"round","stroke-linecap":"round"}));
      g.appendChild(el("path",{d,fill:"none",stroke:SHCOL[h.k],"stroke-width":(2*k).toFixed(2),"stroke-linejoin":"round","stroke-linecap":"round",...(sea?{"stroke-dasharray":`${6*k} ${2.4*k}`}:{})}));
      const t=h.pts.filter(q=>q[0]);if(s<.62)t.forEach(q=>{const [x,y]=SP(q[1],q[2]);if(inV(x,y,0))g.appendChild(el("circle",{cx:x,cy:y,r:1.6*k,fill:"var(--paper)",stroke:SHCOL[h.k],"stroke-width":(.9*k).toFixed(2)}))})})}
  /* zámořské državy: tečka v barvě mateřské země */
  {const g=G({});const dk=sDark();SVETDRZ.forEach(([n,lo,la,id,note])=>{const [x,y]=SP(lo,la);if(!inV(x,y,10))return;const S=SVB[id];
    const gg=el("g",{class:"smk sdrz"});gg.addEventListener("pointermove",e=>sTip(e,`<b>${n}</b><br>${S?S.n:id}${note?` – ${note}`:""}`));gg.addEventListener("pointerleave",e=>sTip(e,""));
    gg.addEventListener("click",e=>{if(SM.on)return;e.stopPropagation();sSel(id)});
    gg.appendChild(el("circle",{cx:x,cy:y,r:3.1*Math.max(k,.55),fill:SG.fill&&SG.fill[id]?SG.fill[id][dk?1:0]:"var(--gold)",stroke:"var(--ink)","stroke-width":(.9*Math.max(k,.55)).toFixed(2)}));
    gg.appendChild(el("circle",{cx:x,cy:y,r:1*Math.max(k,.55),fill:"var(--ink)"}));
    if(s<.45&&!SVETMESTA.some(c=>{const q=SP(c[1],c[2]);return Math.hypot(q[0]-x,q[1]-y)<3}))gg.appendChild(el("text",{x:x+4.5*k,y:y-2.5*k,class:"seatlbl","font-size":(7.5*Math.max(k,.45)).toFixed(1),"stroke-width":(2.2*k).toFixed(2),style:"font-style:italic"},n));
    g.appendChild(gg)})}
  /* města: hlavní města, Jeruzalém a velké přístavy jako obrázky, ostatní tečkou po přiblížení */
  if(sst.cities){const g=G({}),full=s>=.9||!sst.vb||sst.vb===SVMOB;
    SVETMESTA.map(c=>[c,SCITY[c[0]]||(c[3]?["mesto-hradby",.9]:null)]).sort((a,b)=>SP(a[0][1],a[0][2])[1]-SP(b[0][1],b[0][2])[1]).forEach(([[n,lo,la,cap,note],ic])=>{const [x,y]=SP(lo,la);if(!inV(x,y,30))return;
     if(full)return; /* v celkovém pohledu žádná města, objeví se až po přiblížení */
     if(!ic&&s>=.62)return;
     const gg=el("g",{class:"smk"});gg.appendChild(el("title",{},n+(note?" – "+note:"")));
     if(ic){const H=RR(19)*ic[1],[iw,ih]=SIMG[ic[0]],W=H*iw/ih;gg.appendChild(use(ic[0],x-W/2,y-H*.9,W,H));
       gg.appendChild(el("text",{x:x+W/2+RR(1),y:y+RR(1.5),class:"seatlbl"+(n==="Praha"?" spraha":""),"font-size":RR(n==="Praha"?13:10.5).toFixed(2),"stroke-width":RR(2.6).toFixed(2)},n))}
     else{gg.appendChild(el("circle",{cx:x,cy:y,r:RR(2.2),fill:"var(--ink)"}));gg.appendChild(el("text",{x:x+RR(4),y:y+RR(3),class:"seatlbl","font-size":RR(9.5).toFixed(2),"stroke-width":RR(2.4).toFixed(2)},n))}
     g.appendChild(gg)})}
  /* vyznání: znamení víry u každé země (u Koruny české kalich i klíče) */
  if(sst.faith){const g=G({"pointer-events":"none"}),z=RR(15);
    Object.entries(SG.lab).forEach(([id,[x,y,a]])=>{const S=SVB[id];if(!S)return;if(SLABPOS[id])[x,y]=SP(...SLABPOS[id]);if(!S.h&&(s>.62||a<10))return;
      const fs=id==="boh"?["kal","kat"]:[S.c];fs.forEach((c,i)=>{const cx=x+(i-(fs.length-1)/2)*z*1.1,cy=y-RR(S.h?20:14);
        g.appendChild(el("circle",{cx,cy,r:z*.58,fill:"#f6eedb",stroke:SVIRAC[c],"stroke-width":RR(1.4)}));g.appendChild(el("image",{href:SFICON[c],x:cx-z*.45,y:cy-z*.45,width:z*.9,height:z*.9}))})})}
  /* draci: kde žijí plemena z Draconomiconu; v celkovém pohledu ve shluku */
  if(sst.draci){const g=G({}),D=RR(26),r=RR(11),mk=[];
    (DRACI.pl||[]).forEach(p=>(p.mp||[]).forEach(q=>{const [x,y]=SP(q[0],q[1]);mk.push({p,x,y})}));
    const C=[];mk.forEach(m=>{let c=C.find(c=>Math.hypot(c.x-m.x,c.y-m.y)<D);if(!c){c={m:[],x:m.x,y:m.y};C.push(c)}c.m.push(m);c.x=c.m.reduce((a,v)=>a+v.x,0)/c.m.length;c.y=c.m.reduce((a,v)=>a+v.y,0)/c.m.length});
    C.forEach(c=>{if(!inV(c.x,c.y,30))return;const gg=el("g",{class:"smk sdrak",tabindex:0,role:"button"});
      if(c.m.length===1){const {p,x,y}=c.m[0],im=p.img?drU(p.img,"-h"):"art/img/draconomicon-ikona.webp";gg.setAttribute("aria-label",p.n);
        gg.appendChild(el("circle",{cx:x,cy:y,r:r+RR(1.6),fill:"#f6eedb",stroke:"var(--gold)","stroke-width":RR(2)}));
        gg.appendChild(el("image",{href:im,x:x-r,y:y-r,width:2*r,height:2*r,"clip-path":"url(#sdrc)",preserveAspectRatio:"xMidYMid slice"}));
        gg.addEventListener("pointermove",e=>sTip(e,`<b>${p.n}</b>${p.pd?`<br>${p.pd}`:""}`));gg.addEventListener("pointerleave",e=>sTip(e,""));
        const go=e=>{e.stopPropagation();if(sDrag.moved||SM.on)return;sTip(e,"");navTo("#draconomicon/"+p.id)};gg.addEventListener("click",go);gg.addEventListener("keydown",e=>{if(e.key==="Enter")go(e)})}
      else{const n=new Set(c.m.map(m=>m.p.id)).size;gg.setAttribute("aria-label",`${n} dračích plemen – přiblížit`);
        gg.appendChild(el("circle",{cx:c.x,cy:c.y,r:r+RR(3),fill:"none",stroke:"var(--gold)","stroke-width":RR(1.6)}));
        gg.appendChild(el("circle",{cx:c.x,cy:c.y,r:r+RR(.5),fill:"#f6eedb",stroke:"#2b2117","stroke-width":RR(1.2)}));
        gg.appendChild(el("image",{href:"art/img/draconomicon-ikona.webp",x:c.x-r*.85,y:c.y-r*.85,width:r*1.7,height:r*1.7}));
        gg.appendChild(el("circle",{cx:c.x+r*.85,cy:c.y+r*.75,r:RR(6.5),fill:"var(--kal)",stroke:"#f6eedb","stroke-width":RR(1)}));
        gg.appendChild(el("text",{x:c.x+r*.85,y:c.y+r*.75+RR(2.6),"text-anchor":"middle","font-size":RR(8).toFixed(2),class:"pmkn",style:"fill:#fff8ea"},String(n)));
        gg.addEventListener("pointermove",e=>sTip(e,`<b>Dračí plemena</b><br>${[...new Set(c.m.map(m=>m.p.n))].join(", ")}<br><i>klepnutím přiblížit</i>`));gg.addEventListener("pointerleave",e=>sTip(e,""));
        const go=e=>{e.stopPropagation();if(sDrag.moved||SM.on)return;const xs=c.m.map(m=>m.x),ys=c.m.map(m=>m.y),w=Math.max(130,(Math.max(...xs)-Math.min(...xs))*3);
          sst.vb=[(Math.min(...xs)+Math.max(...xs))/2-w/2,(Math.min(...ys)+Math.max(...ys))/2-w*SVB0[3]/SVB0[2]/2,w,w*SVB0[3]/SVB0[2]];sDraw()};
        gg.addEventListener("click",go);gg.addEventListener("keydown",e=>{if(e.key==="Enter")go(e)})}
      g.appendChild(gg)})}
  /* družina: dosavadní cesta a vlaječka */
  if(sst.party&&(ZAPISY.length||HRA)){const g=G({"pointer-events":"none"});
    const look=n=>{const p=placeBy(n);if(p)return [p.lo,p.la];const c=SVETMESTA.find(x=>x[0]===n);return c?[c[1],c[2]]:null};
    const pts=[];ZAPISY.forEach(z=>(z.route||[z.place]).concat(z.place).forEach(n=>{const q=look(n);if(q&&(!pts.length||pts[pts.length-1]+""!==q+""))pts.push(q)}));
    {const pp=partyPos(),q=pp?[pp.lo,pp.la]:null;if(q&&(!pts.length||pts[pts.length-1]+""!==q+""))pts.push(q)}
    if(pts.length>1){const d="M"+pts.map(q=>SP(...q).map(v=>v.toFixed(1)).join(",")).join("L");
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--paper)","stroke-width":(4*k).toFixed(2),opacity:".8"}));
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--kal)","stroke-width":(2*k).toFixed(2),"stroke-dasharray":`${.4*k} ${3.4*k}`,"stroke-linecap":"round"}))}
    const cur=(pp=>pp?[pp.lo,pp.la]:null)(partyPos());
    if(cur){const [x0,y]=SP(...cur),m=Math.max(k,.5),x=x0+3*m;const gf=el("g",{class:"sparty","pointer-events":"auto"});
      gf.appendChild(el("title",{},`Družina · ${(partyPos()||{}).name||partyPlace()} · ${partyDate()}`));
      gf.appendChild(el("path",{d:`M${x},${y}V${y-22*m}`,stroke:"var(--ink)","stroke-width":(1.4*m).toFixed(2)}));
      gf.appendChild(el("path",{d:`M${x},${y-22*m}L${x+13*m},${y-18*m}L${x},${y-14*m}Z`,fill:"var(--kal)",stroke:"var(--ink)","stroke-width":(.8*m).toFixed(2)}));
      gf.addEventListener("click",e=>{e.stopPropagation();const L=ZAPISY[ZAPISY.length-1];navTo(L?"#kronika/"+L.id:"#kronika")});svg.appendChild(gf)}}
  /* měřená cesta */
  if(SM.on&&SM.a){const g=G({"pointer-events":"none"});const pa=SP(...SM.a.ll);
    if(SM.b){const segs=SM.path?SM.path.map(q=>[SP(...q.ll),q.sea]):[[pa,false],[SP(...SM.b.ll),false]];
      const d="M"+segs.map(q=>q[0].map(v=>v.toFixed(1)).join(",")).join("L");
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--paper)","stroke-width":(5*k).toFixed(2),"stroke-linecap":"round","stroke-linejoin":"round",opacity:".8"}));
      g.appendChild(el("path",{d,fill:"none",stroke:"var(--kal)","stroke-width":(2.4*k).toFixed(2),"stroke-dasharray":`${7*k} ${3.5*k}`,"stroke-linecap":"round","stroke-linejoin":"round"}))}
    [[SM.a,"A"],[SM.b,"B"]].forEach(([q,t])=>{if(!q)return;const [x,y]=SP(...q.ll);g.appendChild(el("circle",{cx:x,cy:y,r:6*k,fill:"var(--kal)",stroke:"var(--paper)","stroke-width":1.3*k}));
      g.appendChild(el("text",{x,y:y+2.8*k,"text-anchor":"middle","font-size":(8*k).toFixed(1),class:"pmkn",style:"fill:var(--paper)"},t))})}
  /* okraje známého světa: na severu, východě a jihu mapa bledne do mlhy */
  {const g=G({"pointer-events":"none"}),F=[["N",-60,-60,1150,150,0,1,0,0],["E",930,-60,160,920,1,0,0,0],["S",-60,722,1150,140,0,0,0,1]];
   const fo=el("filter",{id:"sfog",x:"0",y:"0",width:"100%",height:"100%"});fo.appendChild(el("feTurbulence",{type:"fractalNoise",baseFrequency:".011 .02",numOctaves:3,seed:7,result:"n"}));
   fo.appendChild(el("feColorMatrix",{in:"n",type:"matrix",values:"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -.45",result:"a"}));fo.appendChild(el("feFlood",{"flood-color":"var(--land)"}));
   fo.appendChild(el("feComposite",{in2:"a",operator:"in"}));defs.appendChild(fo);
   F.forEach(([n,x,y,w,h,ex,ny,,sy])=>{const lg=el("linearGradient",{id:"sfg"+n,x1:n==="E"?0:0,y1:n==="N"?1:0,x2:n==="E"?1:0,y2:n==="S"?1:0});
     [[0,0],[.55,.55],[1,.97]].forEach(([o,a])=>lg.appendChild(el("stop",{offset:o,"stop-color":"var(--land)","stop-opacity":a})));defs.appendChild(lg);
     const mk=el("mask",{id:"sfm"+n,maskUnits:"userSpaceOnUse",x,y,width:w,height:h});const lw=el("linearGradient",{id:"sfw"+n,x1:0,y1:n==="N"?1:0,x2:n==="E"?1:0,y2:n==="S"?1:0});
     [[0,0],[.4,.85],[1,1]].forEach(([o,a])=>lw.appendChild(el("stop",{offset:o,"stop-color":"#fff","stop-opacity":a})));defs.appendChild(lw);mk.appendChild(el("rect",{x,y,width:w,height:h,fill:`url(#sfw${n})`}));defs.appendChild(mk);
     g.appendChild(el("rect",{x,y,width:w,height:h,fill:`url(#sfg${n})`}));g.appendChild(el("rect",{x,y,width:w,height:h,filter:"url(#sfog)",mask:`url(#sfm${n})`,opacity:".9"}))});
   const B=(f,x,y,w,fl)=>{const [iw,ih]=SIMG[f],gi=el("g",{class:"sorn"});gi.appendChild(use(f,x,y,w,w*ih/iw,fl));g.appendChild(gi)};
   B("drak",690,38,62,1);B("gryf",918,300,54,1);B("fenix",548,664,48);
   const TX=(x,y,t,fs,r)=>g.appendChild(el("text",{x,y,class:"sincog","font-size":fs,"text-anchor":"middle",...(r?{transform:`rotate(${r} ${x} ${y})`}:{})},t));
   TX(440,44,"Terra incognita",19);TX(812,74,"Hic sunt dracones",12);TX(998,560,"Terra incognita",17,90);TX(420,760,"Terra incognita",17);}
  /* kartuš s Korunou českou */
  {const g=G({"pointer-events":"none"});
   const X=28,Y=622,S=250/820,gk=el("g",{class:"sorn"}),gi=el("g",{transform:`translate(${X} ${Y}) scale(${S.toFixed(4)})`});gk.appendChild(gi);g.appendChild(gk);
   gi.appendChild(el("image",{href:PMA+"kartus.webp",x:0,y:0,width:820,height:508}));
   gi.appendChild(el("path",{d:"M357,99H461V178Q461,228 409,252Q357,228 357,178Z",fill:"#b0302a"}));
   gi.appendChild(el("path",{d:"M372,190L366,140L388,163L409,128L430,163L452,140L446,190Z",fill:"#e3b94a",stroke:"#5a3d12","stroke-width":3,"stroke-linejoin":"round"}));
   gi.appendChild(el("rect",{x:370,y:192,width:78,height:16,rx:3,fill:"#e3b94a",stroke:"#5a3d12","stroke-width":3}));
   [[366,138],[409,124],[452,138]].forEach(([cx,cy])=>gi.appendChild(el("circle",{cx,cy,r:7,fill:"#e3b94a",stroke:"#5a3d12","stroke-width":2.5})));
   gi.appendChild(el("text",{x:410,y:352,class:"pkart","font-size":62,"text-anchor":"middle"},"Známý svět"));
   gi.appendChild(el("text",{x:410,y:392,class:"pkart2","font-size":24,"text-anchor":"middle"},"mocnosti léta Páně 1458"));}
  svg.appendChild(el("rect",{...R,filter:"url(#sstain)",opacity:".2","pointer-events":"none"}));
  svg.appendChild(el("rect",{...R,filter:"url(#spaper)",opacity:".22","pointer-events":"none"}));
  svg.appendChild(el("rect",{x:vb[0],y:vb[1],width:vb[2],height:vb[3],fill:"url(#svig)","pointer-events":"none"}));
  pRam(G({"pointer-events":"none"}),vb,s,{C:78,cls:"sornf"});
  document.getElementById("sfaithleg").hidden=!sst.faith;
  document.getElementById("sroutleg").hidden=!sst.routes;
}
const sBadge=c=>`<span class="sbadge" style="--c:${SVIRAC[c]}">${SFICON[c]?`<img class="sbico" src="${SFICON[c]}" alt="">`:""}${SVIRA[c]}</span>`;
function sDetail(){
  const d=document.getElementById("sdetail"),S=SVB[sst.sel];
  if(!S){d.classList.add("empty");d.innerHTML=`<span class="lbl">Známý svět · březen 1458</span><p>Klikněte na zemi na mapě nebo v seznamu pod ní. Uvidíte, kdo v ní vládne, odkud a jaké víry; země, s nimiž je ve válce či sporu, se rozsvítí červeně, napjaté vztahy oranžově a spojenci modře.</p><p class="rsmall">Hranice jsou přibližné: středověké státy neměly ostré čáry, ale panství, léna a sféry vlivu. Zlatá přerušovaná čára obepíná Svatou říši římskou; po přiblížení se v ní ukážou kurfiřtská knížectví (♔). Sedmým kurfiřtem je český král.</p>`;return}
  d.classList.remove("empty");
  d.innerHTML=`<span class="lbl">${S.h?"Velmoc":"Země"} · březen 1458</span>
   <h3 style="font-size:1.35rem">${S.n}</h3>
   <dl class="kv"><dt>Vládce</dt><dd>${S.v||"–"}</dd><dt>Sídlo</dt><dd>${S.s||"–"}</dd><dt>Víra</dt><dd>${sBadge(S.c)}</dd>
   ${S.sp.length?`<dt>V konfliktu</dt><dd>${S.sp.filter(x=>SVB[x]).map(x=>`<button type="button" class="plink sfoe" data-sid="${x}">${SVB[x].k}</button>`).join(", ")}<span class="sfoenote">na mapě červeně</span></dd>`:""}
   ${S.na.length?`<dt>Napětí</dt><dd>${S.na.filter(x=>SVB[x]).map(x=>`<button type="button" class="plink sfoe" data-sid="${x}">${SVB[x].k}</button>`).join(", ")}<span class="sfoenote stensnote">na mapě oranžově</span></dd>`:""}
   ${S.al.length?`<dt>Spojenci</dt><dd>${S.al.filter(x=>SVB[x]).map(x=>`<button type="button" class="plink sfoe" data-sid="${x}">${SVB[x].k}</button>`).join(", ")}<span class="sfoenote sallynote">na mapě modře</span></dd>`:""}
   ${SVETDRZ.some(c=>c[3]===S.id)?`<dt>Državy</dt><dd>${SVETDRZ.filter(c=>c[3]===S.id).map(c=>c[0]).join(", ")}</dd>`:""}</dl>
   <p>${S.x}</p>
   ${S.id==="boh"?`<a class="gbtn ghost" href="#mapa">Mapa zemí Koruny české</a>`:""}
   <button type="button" class="backbtn" id="sclear">Zpět na přehled</button>`;
  autolink(d.querySelector("p"),"");
  d.querySelectorAll(".sfoe").forEach(b=>b.addEventListener("click",()=>sSel(b.dataset.sid)));
  document.getElementById("sclear").addEventListener("click",()=>sSel(null));
}
function sSel(id){sst.sel=id;sDraw();sDetail();document.querySelectorAll(".slist button").forEach(b=>b.classList.toggle("on",b.dataset.sid===id));
  if(id&&matchMedia("(max-width:900px)").matches)document.getElementById("sdetail").scrollIntoView({block:"nearest",behavior:"smooth"})}
function sList(){
  const grp=[["kat","Katolické země"],["mix","Země smíšené víry"],["pra","Pravoslavné země"],["isl","Islámské země"]];
  document.getElementById("slist").innerHTML=grp.map(([c,t])=>{const ss=SVET.filter(s=>s.c===c||(c==="mix"&&s.c==="kal")).sort((a,b)=>(b.h-a.h)||a.n.localeCompare(b.n,"cs"));if(!ss.length)return"";
    return `<section class="pgrp"><h3 class="landh"><img class="sgico" src="${SFICON[c]}" alt="">${t.toUpperCase()}</h3><ol class="plist slist">${ss.map(s=>`<li><button type="button" data-sid="${s.id}"><span class="sswatch" style="background:${SG.fill?SG.fill[s.id][sDark()?1:0]:"var(--sw0)"}"></span>${s.h?`<b>${s.n}</b>`:s.n}</button></li>`).join("")}</ol></section>`}).join("");
  document.querySelectorAll(".slist button").forEach(b=>b.addEventListener("click",()=>{sSel(b.dataset.sid);document.getElementById("smapbox").scrollIntoView({block:"start",behavior:"smooth"})}));
}
const sDrag={moved:false};
function smPick(q){if(!SM.a||SM.b){SM.a=q;SM.b=null}else SM.b=q;smRender();sDraw()}
function smRender(){const r=document.getElementById("stres"),F=document.getElementById("sfrom"),T=document.getElementById("sto");
  F.value=SM.a?SM.a.key:"";T.value=SM.b?SM.b.key:"";
  if(!SM.a||!SM.b){r.innerHTML=`<p>${SM.a?`Odkud: <b>${SM.a.name}</b>. Vyberte cíl.`:"Klikněte na mapě na dvě místa (v blízkosti města se vybere město), nebo vyberte města v nabídce."}</p>`;return}
  const air=Math.round(haversine(SM.a.ll,SM.b.ll)),R=sRoute(SM.a,SM.b,45,110);SM.path=R?R.path:null;
  if(!R){const land=Math.round(air*1.3);
    r.innerHTML=`<p><b>${SM.a.name}</b> → <b>${SM.b.name}</b>: <span class="km">asi ${land.toLocaleString("cs")} km</span> <span class="lbl">(vzdušnou čarou ${air.toLocaleString("cs")} km)</span></p>
     <div class="tgrid"><div><b>Pěšky</b>${days(land,30)}</div><div><b>Na koni</b>${days(land,45)}</div><div><b>S vozem</b>${days(land,20)}</div><div><b>Posel se střídáním koní</b>${days(land,90)}</div><div><b>Na drakovi</b>${days(air,250)}</div></div>
     <p class="lbl">Žádná známá cesta sem nevede; odhad počítá s cestou o třetinu delší než vzdušná čára.</p>`;return}
  const L=R.land,S=R.sea,t=v=>days(L/v+S/110,1);
  r.innerHTML=`<p><b>${SM.a.name}</b> → <b>${SM.b.name}</b>: <span class="km">asi ${(L+S).toLocaleString("cs")} km</span> <span class="lbl">${S?`(z toho ${S.toLocaleString("cs")} km lodí; `:"("}vzdušnou čarou ${air.toLocaleString("cs")} km)</span></p>
   <div class="tgrid"><div><b>Pěšky</b>${t(30)}</div><div><b>Na koni</b>${t(45)}</div><div><b>S vozem</b>${t(20)}</div><div><b>Posel se střídáním koní</b>${days(L/90+S/110,1)}</div><div><b>Na drakovi</b>${days(air,250)}</div></div>
   <p class="lbl">Odhad vede po známých obchodních a poutních cestách a po trasách lodí (na mapě vrstva Cesty); ${S?"plavba počítá asi 110 km za den, ":""}mimo ně počítá s cestou o třetinu delší než vzdušná čára. Počasí, hranice ani války nezná.</p>`}
(function(){
  const svg=document.getElementById("smap");
  const cur=()=>sst.vb||SVB0,AR=SVB0[3]/SVB0[2];
  const clamp=v=>{const w=Math.max(120,Math.min(1120,v[2])),h=w*AR;return [Math.max(-60,Math.min(1084-w,v[0])),Math.max(-60,Math.min(850-h,v[1])),w,h]};
  const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect(),v=cur();return [v[0]+(cx-r.left)/r.width*v[2],v[1]+(cy-r.top)/r.height*v[3]]};
  let raf=0;const redraw=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{svg.setAttribute("viewBox",cur().join(" "));clearTimeout(sDrag.t);sDrag.t=setTimeout(sDraw,140)})};
  window.sZoom=(f,cx,cy)=>{const v=cur();const [px,py]=cx==null?[v[0]+v[2]/2,v[1]+v[3]/2]:toSvg(cx,cy);const w=v[2]*f,h=w*AR;sst.vb=clamp([px-(px-v[0])*w/v[2],py-(py-v[1])*h/v[3],w,h]);redraw()};
  svg.addEventListener("wheel",e=>{if(!SG)return;e.preventDefault();sZoom(e.deltaY>0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
  const pts=new Map();let last=null,start=null;
  svg.addEventListener("pointerdown",e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);start=[e.clientX,e.clientY];sDrag.moved=false;last=null});
  svg.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===1){if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>5){sDrag.moved=true;if(!svg.hasPointerCapture(e.pointerId))svg.setPointerCapture(e.pointerId)}
      if(!sDrag.moved)return;const r=svg.getBoundingClientRect(),v=cur();sst.vb=clamp([v[0]-(e.clientX-prev[0])/r.width*v[2],v[1]-(e.clientY-prev[1])/r.height*v[3],v[2],v[3]]);redraw()}
    else if(pts.size===2){sDrag.moved=true;const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(last)sZoom(last/d,(a[0]+b[0])/2,(a[1]+b[1])/2);last=d}});
  const end=e=>{pts.delete(e.pointerId);if(pts.size<2)last=null;setTimeout(()=>{if(!pts.size)sDrag.moved=false},0)};
  svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
  svg.addEventListener("click",e=>{if(sDrag.moved)return;
    if(SM.on){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());const ll=SPinv(q.x,q.y);
      let best=null,bd=1e9;SVETMESTA.forEach(([n,lo,la])=>{const [x,y]=SP(lo,la),dd=Math.hypot(x-q.x,y-q.y);if(dd<bd){bd=dd;best=[n,lo,la]}});
      smPick(bd<9*(cur()[2]/1000)?{name:best[0],ll:[best[1],best[2]],key:best[0]}:{name:(sp=>sp&&SVB[sp.dataset.id]?`místo v zemi ${SVB[sp.dataset.id].k}`:"bod na moři")(e.target.closest(".spoly")),ll,key:""});return}
    if(!e.target.closest(".spoly")&&sst.sel)sSel(null)});
  document.getElementById("szin").addEventListener("click",()=>sZoom(1/1.4));
  document.getElementById("szout").addEventListener("click",()=>sZoom(1.4));
  document.getElementById("sreset").addEventListener("click",()=>{sst.vb=null;sDraw()});
  svg.addEventListener("pointerleave",e=>sTip(e,""));
  document.querySelectorAll("[data-sfico]").forEach(e=>e.insertAdjacentHTML("afterbegin",`<img class="rico" src="${SFICON[e.dataset.sfico]}" alt="" aria-hidden="true">`));
  document.querySelectorAll("[data-sconf]").forEach(b=>b.addEventListener("click",()=>{sst.conf=b.dataset.sconf;document.querySelectorAll("[data-sconf]").forEach(x=>x.setAttribute("aria-pressed",x===b));if(SG)sDraw()}));
  const mb=document.getElementById("smeasure");mb.addEventListener("click",()=>{SM.on=!SM.on;mb.setAttribute("aria-pressed",SM.on);document.getElementById("smap").classList.toggle("measuring",SM.on);document.getElementById("stravel").hidden=!SM.on;if(!SM.on){SM.a=SM.b=null}smRender();if(SG)sDraw()});
  const opts=`<option value="">— bod na mapě —</option>`+[...SVETMESTA].sort((a,b)=>a[0].localeCompare(b[0],"cs")).map(c=>`<option value="${c[0]}">${c[0]}</option>`).join("");
  ["sfrom","sto"].forEach((id,i)=>{const e=document.getElementById(id);e.innerHTML=opts;e.addEventListener("change",()=>{const c=SVETMESTA.find(x=>x[0]===e.value);if(!c)return;const q={name:c[0],ll:[c[1],c[2]],key:c[0]};if(i===0)SM.a=q;else SM.b=q;smRender();if(SG)sDraw()})});
  [["sHre","hre"],["sFaith","faith"],["sCities","cities"],["sRivers","riv"],["sRoutes","routes"],["sParty","party"],["sDraci","draci"]].forEach(([id,key])=>{const b=document.getElementById(id);
    b.addEventListener("click",()=>{sst[key]=!sst[key];b.setAttribute("aria-pressed",sst[key]);
      if(SG){sDraw();sDetail()}})});
})();


