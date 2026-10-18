/* ===== BOJ: tracker slotové iniciativy (Artikule › Iniciativa a protivníci) =====
   Hráči házejí d20 + Obratnost, vypravěč jednou za nejlepšího nepřítele. Každý hod hráče je slot hráčů,
   nepřátelé dostanou stejný počet slotů se svým hodem; při shodě jdou první hráči.
   V kole obsadí každý hráč jen jeden slot; vypravěč smí jedno NPC použít: pacholek/houf 1×, sok 2×, zhoubce 3×.
   Rozložení: nahoře lepkavá osa slotů s medailony, pod ní družina se spojenci a záznamem boje (vlevo) a nepřátelé (vpravo);
   rychlá pravidla jsou v šuplíku u pravého okraje. */
/* ===== Boj: ikonky, medailony a popisky při najetí myší (2026-10-16) =====
   Místo textu ikonky; co znamenají, ukáže popisek (data-tip) při najetí myší, na dotyk nebo při fokusu. */
const BIC={
  rozplyn:'<path d="M2 5.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 3.5-.6M2 9c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 3.5-.6M4 12.5c1.2-.9 2.4-.9 3.6 0s2.4.9 3.6 0"/>',
  zakon:'<circle cx="5.4" cy="5.4" r="3.2"/><path d="M7.7 7.7 14 14M11.3 11.3l1.6-1.6M12.8 12.8l1.4-1.4"/><circle cx="5.4" cy="5.4" r="1" fill="currentColor" stroke="none"/>',
  soustredi:'<circle cx="8" cy="8" r="5.7"/><circle cx="8" cy="8" r="2.6"/><circle cx="8" cy="8" r=".7" fill="currentColor" stroke="none"/>',
  zranen:'<path d="M8 2.2S3.6 7.4 3.6 10.1a4.4 4.4 0 0 0 8.8 0C12.4 7.4 8 2.2 8 2.2Z" fill="currentColor" stroke="none"/>',
  omracen:'<path d="M8.6 8.3a.8.8 0 1 1-1-.9 1.8 1.8 0 0 1 2 1.9 2.8 2.8 0 0 1-3 2.6 3.8 3.8 0 0 1-3.7-4 4.8 4.8 0 0 1 5-4.6 5.6 5.6 0 0 1 5.3 5.5"/>',
  srazen:'<circle cx="3.6" cy="9.4" r="1.6"/><path d="M5.6 10.3h7.6M10.2 10.3l2.3-2.5M1.5 13.3h13"/>',
  odzbrojen:'<path d="M2.4 13.6l2-2M3.1 9.9l3 3M4.6 11.4 7 9M9.4 6.6l4.2-4.2M8 6.2l.9.4M9.8 8.4l-.4-.9"/>',
  porazen:'<path d="M8 2.3a5 5 0 0 0-5 5c0 1.8.9 3 2 3.7v2.4h6V11c1.1-.7 2-1.9 2-3.7a5 5 0 0 0-5-5Z"/><circle cx="6.1" cy="7.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="9.9" cy="7.6" r="1.1" fill="currentColor" stroke="none"/><path d="M7 13.4v-1.6M9 13.4v-1.6"/>',
  prcha:'<path d="M9.5 2.5h-6v11h6M7 8h7.4M12 5.5 14.4 8 12 10.5"/>',
  mec:'<path d="M8 1.4v9M5.2 10.4h5.6M8 10.4v3.1"/><circle cx="8" cy="14.4" r=".9" fill="currentColor" stroke="none"/>',
  houf:'<path d="M1.6 3.2h4.2v3c0 2.1-1.4 3.1-2.1 3.5C3 9.3 1.6 8.3 1.6 6.2ZM10.2 3.2h4.2v3c0 2.1-1.4 3.1-2.1 3.5-.7-.4-2.1-1.4-2.1-3.5ZM5.9 6.6h4.2v3c0 2.1-1.4 3.1-2.1 3.5-.7-.4-2.1-1.4-2.1-3.5Z"/>',
  pacholek:'<path d="M4.4 2.6h7.2v4.6c0 3.3-2.4 4.9-3.6 5.5-1.2-.6-3.6-2.2-3.6-5.5Z"/>',
  sok:'<path d="M13.6 2.4 6.4 9.6M13.6 2.4l-2.6.5 2.1 2.1ZM4.3 8.2l3.5 3.5M5.3 10.7l-2.9 2.9"/>',
  zhoubce:'<path d="M2.2 12.2h11.6l.9-7.4-3.6 3L8 3.1 4.9 7.8 1.3 4.8Z"/><path d="M2.4 14.3h11.2"/>',
  pozehnani:'<circle cx="8" cy="8" r="2.6"/><path d="M8 1.4v2M8 12.6v2M1.4 8h2M12.6 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4"/>',
  pokuseni:'<path d="M8 14.4c2.8 0 4.4-1.9 4.4-4.3 0-3.2-3.4-4.7-3.4-7.9C6.5 3.7 6 5.9 6.3 7.6 5.3 7 5 6 5 5 3.8 6.2 3.6 7.9 3.6 10.1c0 2.4 1.6 4.3 4.4 4.3Z"/>',
  nerest:'<path d="M1.8 4.6c2.1-1 4.2-1 6.2.6 2-1.6 4.1-1.6 6.2-.6 0 4.2-2 7.3-6.2 7.3S1.8 8.8 1.8 4.6Z"/><path d="M4.4 7.4c.6-.5 1.5-.5 2.1 0M9.5 7.4c.6-.5 1.5-.5 2.1 0"/>',
  komplikace:'<path d="M8 2 14.6 13.6H1.4Z"/><path d="M8 6.4v3.4M8 11.8v.1"/>',
  velitel:'<path d="M4 14.6V1.8M4 2.4h8.6l-2.2 2.7 2.2 2.7H4"/>',
  vazba:'<path d="M6.6 9.4l2.8-2.8M5.2 7.9 3.7 9.4a2.1 2.1 0 0 0 3 3l1.5-1.5M7.9 5.2l1.5-1.5a2.1 2.1 0 0 1 3 3l-1.5 1.5"/>',
  dosah:'<circle cx="8" cy="8" r="5.6"/><circle cx="8" cy="8" r="2.3"/><path d="M8 .8v2.4M8 12.8v2.4M.8 8h2.4M12.8 8h2.4"/>',
  svitek:'<path d="M4.3 2.5h8v10.2a1.3 1.3 0 0 1-1.3 1.3H4.5a1.6 1.6 0 0 1 0-3.2h6"/><path d="M6.5 5h3.8M6.5 7.5h3.8"/>',
  sipka:'<path d="M4 6l4 4 4-4"/>',
  plus:'<path d="M8 3v10M3 8h10"/>',
  hotovo:'<path d="M3 8.5 6.2 11.6 13 4.6"/>',
  krizek:'<path d="M4 4l8 8M12 4l-8 8"/>',
  zavoj:'<path d="M1.5 8S4 3.6 8 3.6 14.5 8 14.5 8 12 12.4 8 12.4 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/>',
  kniha:'<path d="M8 4.2C6.5 3 4.4 2.6 2 2.8v9.6c2.4-.2 4.5.2 6 1.4 1.5-1.2 3.6-1.6 6-1.4V2.8c-2.4-.2-4.5.2-6 1.4Zm0 0v9.6"/>',
  tah:'<circle cx="8" cy="8" r="5"/>',
  tahok:'<circle cx="8" cy="8" r="5.6" fill="currentColor" stroke="none"/><path d="M5.4 8.2 7.2 10l3.4-3.6" stroke="#f6ecd6" stroke-width="1.6"/>',
  zdroj:'<path d="M8 1.8 13.2 8 8 14.2 2.8 8Z"/>',
  osoba:'<circle cx="8" cy="5.2" r="2.7"/><path d="M2.8 14.2c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6"/>',
  zadrzen:'<circle cx="4.6" cy="8" r="2.8"/><circle cx="11.4" cy="8" r="2.8"/><path d="M7 8h2"/>',
  oslepen:'<path d="M1.5 8S4 3.6 8 3.6 14.5 8 14.5 8 12 12.4 8 12.4 1.5 8 1.5 8Z"/><path d="M2.6 13.4 13.4 2.6"/>',
  neviditelny:'<circle cx="8" cy="5.2" r="2.7" stroke-dasharray="1.5 1.3"/><path d="M2.8 14.2c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6" stroke-dasharray="1.5 1.3"/>',
  otraven:'<path d="M6.2 1.8h3.6M7 1.8v3.6L3.4 12a1.6 1.6 0 0 0 1.4 2.3h6.4a1.6 1.6 0 0 0 1.4-2.3L9 5.4V1.8"/><path d="M4.6 10h6.8"/>',
  vydesen:'<path d="M8 2.2c3.2 0 5.4 2.3 5.4 5.4 0 2-1 3.3-2.2 4.1v2.1H4.8v-2.1C3.6 10.9 2.6 9.6 2.6 7.6 2.6 4.5 4.8 2.2 8 2.2Z"/><path d="M5.6 7.6h.1M10.3 7.6h.1M6.6 10.7c.9-.9 1.9-.9 2.8 0"/>',
  vzdal:'<path d="M3.6 14.6V1.8"/><path d="M3.6 2.4c2.4-.9 4.2 1 6.4.2 1.4-.5 2.6-.4 3.6.1v6.1c-1-.5-2.2-.6-3.6-.1-2.2.8-4-1.1-6.4-.2"/>',
  kryt:'<path d="M1.6 14.2h12.8M2.6 14.2V8h10.8v6.2M2.6 11.1h10.8M6.2 8v3.1M9.8 11.1v3.1"/>',
  zajat:'<circle cx="4.8" cy="9.6" r="2.6"/><circle cx="11.2" cy="9.6" r="2.6"/><path d="M7.2 8.4c.5-2.6 1.1-4.4.8-6.2M8.8 8.4c-.5-2.6-1.1-4.4-.8-6.2"/>',
  tma:'<path d="M12.6 10.4A5.6 5.6 0 0 1 5.6 3.4a5.6 5.6 0 1 0 7 7Z"/>',
  mlha:'<path d="M2 5h9.5M4 8h10M2 11h9M5 14h6"/>',
  vitr:'<path d="M1.8 6h8.4a2 2 0 1 0-2-2M1.8 9.6h10.6a2 2 0 1 1-2 2M1.8 12.6h4.6"/>',
  dest:'<path d="M4.4 9.4h7.4a2.6 2.6 0 0 0 .2-5.2 3.6 3.6 0 0 0-6.9.7 2.3 2.3 0 0 0-.7 4.5Z"/><path d="M5 11.4l-.8 2M8.2 11.4l-.8 2M11.4 11.4l-.8 2"/>',
  uzky:'<path d="M3 1.8v12.4M13 1.8v12.4M6.2 8h3.6M6.2 8l1.3-1.3M6.2 8l1.3 1.3M9.8 8 8.5 6.7M9.8 8 8.5 9.3"/>',
  teren:'<path d="M1.4 13.6 5.4 6l2.4 3.8 2-2.8 4.8 6.6Z"/>',
  kostka:'<path d="M8 1.6 14 5v6l-6 3.4L2 11V5Z"/><path d="M2 5l6 3.4L14 5M8 8.4v6"/>',
  okouzlen:'<path d="M8 13.6S2.2 10 2.2 6.1a2.9 2.9 0 0 1 5.8-.9 2.9 2.9 0 0 1 5.8.9C13.8 10 8 13.6 8 13.6Z"/>',
  ohlusen:'<path d="M5 6.2a3.6 3.6 0 1 1 6.2 2.6c-1 1-1.6 1.6-1.6 3a2 2 0 0 1-3.6 1.1"/><path d="M2.4 2.4l11.2 11.2"/>',
  chycen:'<path d="M4.6 8.6V4.4a1 1 0 0 1 2 0v3.4M6.6 7.6V3.4a1 1 0 0 1 2 0v4.2M8.6 7.8V4a1 1 0 0 1 2 0v4.6M10.6 8.2V6a1 1 0 0 1 2 0v3.6c0 2.6-1.8 4.6-4.4 4.6-2.2 0-3.4-1.2-4.6-3.2L2.4 8.6a1 1 0 0 1 1.6-1.2l.6.8"/>',
  neschopny:'<circle cx="8" cy="8" r="5.8"/><path d="M3.9 12.1 12.1 3.9"/>',
  ochromen:'<path d="M9.2 1.6 4.4 8.6h3.4l-1 5.8 4.8-7H8.2Z"/>',
  zkameneny:'<path d="M2.4 12.6 4 6.8 7 4.2l4.4 1.2 2.4 4.4-1.6 3.4Z"/><path d="M7 4.2 7.6 8l4.2 1.8M7.6 8 4 9.6"/>',
  bezvedomi:'<path d="M3 4.6h4L3 9.4h4M8.6 8.6h4.4l-4.4 4.8H13"/>',
  uhyb:'<path d="M3 13.4c3.6-1.2 6-4.6 6.4-9.8M6.6 6.2l2.8-2.8 2.8 2.8"/>',
  smrt:'<path d="M5.4 14.4V12M10.6 14.4V12M8 14.4V12"/><path d="M8 1.8a5 5 0 0 0-5 5c0 2 1 3.6 2.4 4.6h5.2C12 10.4 13 8.8 13 6.8a5 5 0 0 0-5-5Z"/><path d="M5.8 6.6l1.4 1.4M7.2 6.6 5.8 8M8.8 6.6l1.4 1.4M10.2 6.6 8.8 8"/>'};
/* malované ikony (art/img/boj, 48/96 px) – ostatní klíče zůstávají vektorové s ručně kresleným chvěním (filtr #bwob) */
const BIMG=new Set(["pozehnani","pokuseni","komplikace","nerest","zavoj","pacholek","houf","sok","zhoubce","zranen","omracen","srazen","odzbrojen","porazen","prcha","oslepen","okouzlen","ohlusen","vydesen","chycen","neschopny","neviditelny","ochromen","zkameneny","otraven","zadrzen","bezvedomi","vycerpani","soustredi","vyhoda","nevyhoda"]);
const bi=(k,c)=>BIMG.has(k)?`<img class="bi bimg bimg-${k}${c?" "+c:""}" src="art/img/boj/${k}-48.webp" srcset="art/img/boj/${k}-48.webp 48w, art/img/boj/${k}-96.webp 96w" sizes="24px" width="24" height="24" alt="" aria-hidden="true" decoding="async">`
  :`<svg class="bi${c?" "+c:""}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${bojWob(k)}</svg>`;
/* ručně kreslené chvění vektorových ikon: místo filtru feTurbulence (počítal se při každém vykreslení) se tvary jednou
   převzorkují a body posunou hladkým šumem se stejnou frekvencí (0,32) a amplitudou (±0,45) – výsledek se pamatuje */
const BICW={};
const bojSum=(()=>{const h=(x,y,s)=>{let n=x*374761393+y*668265263+s*1442695041;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295};
  const sm=t=>t*t*(3-2*t),v=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi),a=h(xi,yi,s),b=h(xi+1,yi,s),c=h(xi,yi+1,s),d=h(xi+1,yi+1,s);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf};
  return (x,y,s)=>(v(x*.32,y*.32,s)+.5*v(x*.64,y*.64,s+7)+.42*v(x*2.6,y*2.6,s+13))/1.92})();
function bojWob(k){if(BICW[k]!=null)return BICW[k];const src=BIC[k]||"";let out=src;
  try{const NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 16 16");svg.setAttribute("width","16");svg.setAttribute("height","16");
    svg.style.cssText="position:absolute;left:-99px;top:0;visibility:hidden";svg.innerHTML=src;document.body.appendChild(svg);out="";
    const GEO=new Set(["d","cx","cy","r","rx","ry","x","y","width","height","x1","y1","x2","y2","points","pathLength"]);
    for(const el of [...svg.children]){if(typeof el.getTotalLength!=="function"){out+=el.outerHTML;continue}
      const L=el.getTotalLength();if(!(L>0)){out+=el.outerHTML;continue}const n=Math.max(12,Math.ceil(L/.18)),st=L/n,sub=[];let cur=[];
      for(let i=0;i<=n;i++){const q=el.getPointAtLength(Math.min(L,i*st));const pr=cur[cur.length-1];if(pr&&Math.hypot(q.x-pr.x,q.y-pr.y)>st*3){sub.push(cur);cur=[]}cur.push({x:q.x,y:q.y})}sub.push(cur);
      const d=sub.filter(x=>x.length).map(pts=>{const z=pts.length>2&&Math.hypot(pts[0].x-pts[pts.length-1].x,pts[0].y-pts[pts.length-1].y)<st*1.5;
        return "M"+pts.map(q=>`${(q.x+(bojSum(q.x,q.y,5)-.5)*1.15).toFixed(2)} ${(q.y+(bojSum(q.x,q.y,11)-.5)*1.15).toFixed(2)}`).join("L")+(z?"Z":"")}).join("");
      const at=[...el.attributes].filter(a=>!GEO.has(a.name)).map(a=>` ${a.name}="${a.value}"`).join("");out+=`<path d="${d}"${at}/>`}
    svg.remove()}catch(e){out=src}
  return BICW[k]=out}
/* filtr #bwob už není potřeba – chvění je zapečené v tvarech (bojWob) */
const btip=t=>`data-tip="${besc(t)}"`;
const bTxt=h=>String(h||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
/* stavy nepřátel: ikonka a popisek */
const BSTAV=["zraněn","omráčen","sražen","zadržen","chycen","oslepen","ohlušen","neviditelný","otrávený","vyděšený","okouzlen","neschopný","ochromen","zkamenělý","v bezvědomí","úhyb","odzbrojen","poražen","prchá","vzdal se","soustředí","rozplynul se"];
/* stavy postav, které si hráč nastaví z telefonu (nebo vypravěč v seznamu družiny) – počítá s nimi návrh výhody */
const BSTAVH=["sražen","omráčen","zadržen","chycen","oslepen","ohlušen","neviditelný","otrávený","vyděšený","okouzlen","neschopný","ochromen","zkamenělý","úhyb","soustředí"];
const bojRel=n=>!!(n&&PROTBY[n.b]&&PROTBY[n.b].rel);
const BSTI={"zraněn":["zranen","Zraněn"],"omráčen":["omracen","Omráčen"],"sražen":["srazen","Sražen k zemi (Prone)"],"odzbrojen":["odzbrojen","Odzbrojen – přišel o zbraň"],"poražen":["porazen","Poražen – mimo boj"],"prchá":["prcha","Prchá z boje"],"soustředí":["soustredi","Udržuje Concentration – při zranění CON záchrana"],"rozplynul se":["rozplyn","Rozplynul se – relikt se vrátí ve své příští hodině s polovinou HP, dokud ho družina nezažehná"]};
Object.assign(BSTI,{"zadržen":["zadrzen","Zadržen (Restrained) – útoky na něj s výhodou, jeho útoky s nevýhodou"],"oslepen":["oslepen","Oslepen (Blinded) – útoky na něj s výhodou, jeho útoky s nevýhodou"],
  "neviditelný":["neviditelny","Neviditelný (Invisible) – útoky na něj s nevýhodou, jeho útoky s výhodou"],"otrávený":["otraven","Otrávený (Poisoned) – nevýhoda na útoky a ověření"],
  "vyděšený":["vydesen","Vyděšený (Frightened) – nevýhoda na útoky a ověření, dokud vidí zdroj strachu"],"vzdal se":["vzdal","Vzdal se – bezbranný; zabít ho je vražda bezbranného (smrtelný hřích)"]});
/* stavy podle SRD 5.2.1 (Rules Glossary): ut = vliv na útoky tvora (−1 nevýhoda, 1 výhoda), cil = útoky na něj
   (1 výhoda, −1 nevýhoda, "blizko" zblízka výhoda a z dálky nevýhoda), zach = záchrany (f automaticky neúspěch, d nevýhoda,
   a výhoda), nej = nemůže jednat (Incapacitated), k5 = zásah zblízka do 5 stop je kritický, res = Resistance vůči všemu */
const SRDST={"oslepen":{en:"Blinded",ut:-1,cil:1,t:"nevidí, ověření vyžadující zrak automaticky selžou; útoky na něj s výhodou, jeho útoky s nevýhodou"},
  "okouzlen":{en:"Charmed",t:"nesmí zaútočit na toho, kdo ho okouzlil, ani ho zasáhnout škodlivou schopností; okouzlující má výhodu na společenská ověření vůči němu"},
  "ohlušen":{en:"Deafened",t:"neslyší, ověření vyžadující sluch automaticky selžou"},
  "vyděšený":{en:"Frightened",ut:-1,t:"nevýhoda na ověření a útoky, dokud vidí zdroj strachu; nesmí se k němu dobrovolně přiblížit"},
  "chycen":{en:"Grappled",ut:-1,t:"rychlost 0; nevýhoda na útoky proti komukoli jinému než tomu, kdo ho drží; ten ho smí táhnout s sebou"},
  "neschopný":{en:"Incapacitated",nej:1,t:"nesmí provést akci, bonusovou akci ani reakci, nemluví, soustředění končí; při hodu iniciativy nevýhoda"},
  "neviditelný":{en:"Invisible",ut:1,cil:-1,t:"útoky na něj s nevýhodou, jeho útoky s výhodou (ne proti tomu, kdo ho vidí); výhoda na iniciativu"},
  "ochromen":{en:"Paralyzed",cil:1,nej:1,zach:{STR:"f",AGI:"f"},k5:1,t:"Incapacitated, rychlost 0, záchrany STR a AGI automaticky selžou; útoky na něj s výhodou a zásah zblízka do 5 stop je kritický"},
  "zkamenělý":{en:"Petrified",cil:1,nej:1,zach:{STR:"f",AGI:"f"},res:1,t:"proměněn v kámen: Incapacitated, rychlost 0, záchrany STR a AGI automaticky selžou, útoky na něj s výhodou, Resistance vůči všemu zranění, Immunity vůči otravě"},
  "otrávený":{en:"Poisoned",ut:-1,t:"nevýhoda na útoky a ověření"},
  "sražen":{en:"Prone",ut:-1,cil:"blizko",t:"jen se plazí, vstát stojí polovinu rychlosti; jeho útoky s nevýhodou; útok na něj do 5 stop s výhodou, jinak s nevýhodou"},
  "zadržen":{en:"Restrained",ut:-1,cil:1,zach:{AGI:"d"},t:"rychlost 0; útoky na něj s výhodou, jeho útoky s nevýhodou; nevýhoda na záchrany AGI"},
  "omráčen":{en:"Stunned",cil:1,nej:1,zach:{STR:"f",AGI:"f"},t:"Incapacitated, záchrany STR a AGI automaticky selžou, útoky na něj s výhodou"},
  "v bezvědomí":{en:"Unconscious",cil:1,nej:1,zach:{STR:"f",AGI:"f"},k5:1,t:"Incapacitated a sražen, upustí, co drží; rychlost 0; záchrany STR a AGI automaticky selžou; útoky na něj s výhodou a zásah zblízka do 5 stop je kritický"},
  "úhyb":{en:"Dodge",cil:-1,zach:{AGI:"a"},t:"akce Úhyb do začátku jeho příštího tahu: útoky na něj s nevýhodou (vidí-li útočníka), výhoda na záchrany AGI"}};
const SRDIC={"oslepen":"oslepen","okouzlen":"okouzlen","ohlušen":"ohlusen","vyděšený":"vydesen","chycen":"chycen","neschopný":"neschopny","neviditelný":"neviditelny","ochromen":"ochromen","zkamenělý":"zkameneny","otrávený":"otraven","sražen":"srazen","zadržen":"zadrzen","omráčen":"omracen","v bezvědomí":"bezvedomi","úhyb":"uhyb","soustředí":"soustredi"};
Object.entries(SRDST).forEach(([k,v])=>{BSTI[k]=[SRDIC[k],`${k[0].toUpperCase()+k.slice(1)} (${v.en}) – ${v.t}`]});
/* výhoda/nevýhoda ze stavů útočníka (st) a cíle (ct); dal = útok z dálky */
function srdAdv(st,ct,dal,plus,minus,ja){const P=ja?"":"útočník ";
  (st||[]).forEach(k=>{const d=SRDST[k];if(!d||!d.ut)return;(d.ut>0?plus:minus).push(P+k+(k==="chycen"?" (ne proti tomu, kdo ho drží)":""))});
  let k5=false;(ct||[]).forEach(k=>{const d=SRDST[k];if(!d)return;if(d.cil==="blizko"){if(dal)minus.push(`cíl ${k}, útok z dálky`);else plus.push(`cíl ${k}, útok zblízka`)}else if(d.cil)(d.cil>0?plus:minus).push("cíl "+k);if(d.k5&&!dal)k5=true});
  return k5}
const srdNejedna=st=>(st||[]).some(k=>SRDST[k]&&SRDST[k].nej);
const bojStavy=(n,gm,vse)=>{const a=n.stav||[],I=t=>BSTI[t]||["komplikace",t];
  if(vse&&gm)return `<span class="bstavy">${BSTAV.filter(t=>(t!=="soustředí"||n.druh!=="houf")&&(t!=="rozplynul se"||bojRel(n))).map(t=>{const on=a.includes(t);return `<button type="button" data-bstav="${t}" aria-pressed="${on}" aria-label="${besc(I(t)[1])}" ${btip(I(t)[1]+(on?" · klikni a zruš":" · klikni a označ"))}>${bi(I(t)[0])}</button>`}).join("")}</span>`;
  return a.length?`<span class="bstavy bakt">${a.map(t=>`<span class="bst" role="img" aria-label="${besc(I(t)[1])}" ${btip(I(t)[1])}>${bi(I(t)[0])}</span>`).join("")}</span>`:""};
/* medailony: družina kruhové (portrét z karty postavy), NPC čtvercové v barvě skupiny (portrét osoby, jinak monogram) */
const BBARVY=["#7d2a35","#2f6248","#5d4384","#9a6418","#2c517f","#59602a","#86386a","#2f6a72","#74401f","#4c4d61","#8a5a2b","#3f5f2f"];
const bojBarva=id=>{const k=parseInt(String(id||"").replace(/\D/g,""),10)||1;return BBARVY[(k-1)%BBARVY.length]};
const BMSTOP=/^(a|i|v|ve|z|ze|s|se|o|od|do|na|pod|pro|u|k|ke|za|z|von|de|of|der|die|das|the)$/i;
const bojMono=n=>{n=String(n||"").trim();const m=n.match(/\s(\d+)$/),w=(m?n.slice(0,m.index):n).split(/\s+/).filter(x=>x&&!BMSTOP.test(x));
  const ini=w.map(x=>(x.match(/\p{L}/u)||[""])[0].toLocaleUpperCase("cs")).join("");return (m?(ini[0]||"")+m[1]:ini.slice(0,2))||"?"};
const bojPortH=n=>{const K=(KARTY||[]).find(k=>k.n===n),ki=K&&kartaStav(K.id).img;if(ki)return ki;const p=PARTY.find(x=>x.n===n);return p&&p.img?p.img:""};
/* obrázek žetonu: vypravěč ho bere z bestiáře a portrétů, ukládá ho k nepříteli do stavu boje (o.img), hráč ho čte odtud */
const bojPortN=o=>o&&o.os&&PORTR.has(o.os)?portU(o.os,"m"):(o&&PROTBY[o.b]&&PROTBY[o.b].img)||(o&&typeof o.img==="string"&&/^art\/(bestiar|portrety)\/[\w-]+\.webp$/.test(o.img)?o.img:"");
/* žeton: bestiář má 96px variantu, plný obrázek jen pro husté displeje */
const bojBg=im=>/art\/bestiar\/[^/]+\.webp$/.test(im)?`background-image:url('${besc(im.replace(/\.webp$/,"-96.webp"))}');background-image:image-set(url('${besc(im.replace(/\.webp$/,"-96.webp"))}') 2x,url('${besc(im)}') 6x)`:`background-image:url('${besc(im)}')`;
function bojMedH(h,c){const im=bojPortH(h.n);return `<span class="bmed bmk${c?" "+c:""}"${im?` style="background-image:url('${besc(im)}')"`:""}>${im?"":`<b>${besc(bojMono(h.n))}</b>`}</span>`}
function bojMedN(o,c){const im=bojPortN(o);return `<span class="bmed bmc ${bojSpoj(o)?"bmsp":"bmen"}${c?" "+c:""}" style="--mc:${bojBarva(o.id)}${im?";"+bojBg(im):""}">${im?"":`<b>${besc(bojMono(o.n))}</b>`}</span>`}
const BDRIC={houf:"houf",pacholek:"pacholek",sok:"sok",zhoubce:"zhoubce"};
/* vlastnosti zbraní a zbrojí, techniky, chvaty a stavy: vysvětlení při najetí myší (Artikule › Výzbroj, Šerm a zápas) */
const BTEC={"Sek hněvu":"1 Výdrž + Požehnání: vazba čepele – výhoda na další útok proti cíli, cíl má proti němu nevýhodu.",
  "Křižný sek":"1 Výdrž + reakce: když ho zasáhne útok zblízka, +2 AC a okamžitý protiútok.","Křížný sek":"1 Výdrž + reakce: když ho zasáhne útok zblízka, +2 AC a okamžitý protiútok.",
  "Křivý sek":"1 Výdrž + reakce na Pokušení útočníka: sek do rukou. Útočník hází STR save – neúspěch: upustí zbraň a útok se neuskuteční; úspěch: poloviční zranění.",
  "Šilhavý sek":"1 Výdrž + Požehnání: zlomí soupeřův sek – ten má do konce svého příštího tahu nevýhodu na útoky.",
  "Dělný sek":"1 Výdrž + reakce: když nepřítel vstoupí do dosahu, zaútočí dřív a ustoupí jako při Dodge.",
  "Vražedný úder":"1 Výdrž + bonusová akce: úder záštitou – do konce tahu má zbraň Bludgeoning s vlastností Drtivá.",
  "Zápas s mečem":"1 Výdrž + Požehnání: po zásahu do těla – cíl hází STR/AGI save, jinak je Restrained nebo Prone.",
  "Hod přes bok":"1 Výdrž + Požehnání: po zásahu beze zbraně hází cíl STR/AGI save, jinak je Restrained a Prone.",
  "Mordstösse":"1 Výdrž + Požehnání: úder do hrdla nebo spánku – cíl do konce svého příštího tahu nemluví (nekouzlí verbálně) a nemá reakci.",
  "Zůstaň!":"1 Výdrž + Požehnání: Prone nebo Restrained cíl hází AGI save, jinak je znehybněn do konce útočníkova příštího tahu.",
  "Zlom":"1 Výdrž + reakce: když ho soupeř povaluje nebo drží, Contested Roll s výhodou; při úspěchu se situace obrátí.",
  "Lámání paže":"1 Výdrž + reakce na Pokušení: Restrained soupeř, který útočí, hází CON save s nevýhodou, jinak má zlomenou paži.",
  "Zápas o zbraň":"1 Výdrž + reakce: útočník s lehkou zbraní hází STR/AGI save, jinak mine a zbraň mu sebere.",
  "Zápas ve zbroji":"1 Výdrž + bonusová akce: proti Restrained nebo Prone soupeři ignorují útoky dýkou do konce tahu Resistance zbroje."};
const BSTAVD={"Prone":"Sražen: pohyb jen plazením, vstát stojí polovinu rychlosti; útoky zblízka na něj s výhodou, na dálku s nevýhodou; jeho útoky s nevýhodou.",
  "Restrained":"Spoután: rychlost 0; útoky na něj s výhodou, jeho útoky s nevýhodou; nevýhoda na AGI záchrany.",
  "Grappled":"Sevřen: rychlost 0; nevýhoda na útoky proti komukoli kromě toho, kdo ho drží; ten ho může táhnout s sebou.",
  "Frightened":"Vyděšen: nevýhoda na testy a útoky, dokud vidí zdroj strachu; nesmí se k němu dobrovolně přiblížit.",
  "Poisoned":"Otráven: nevýhoda na útoky a testy dovedností.","Charmed":"Okouzlen: nemůže zaútočit na toho, kdo ho okouzlil; ten má výhodu na společenské testy proti němu.",
  "Blinded":"Oslepen: nevidí; útoky na něj s výhodou, jeho útoky s nevýhodou.","Deafened":"Ohlušen: neslyší; testy, které potřebují sluch, automaticky selžou.",
  "Stunned":"Omráčen: Incapacitated, nehýbe se, STR a AGI záchrany automaticky selžou, útoky na něj s výhodou.",
  "Paralyzed":"Ochromen: Incapacitated, nehýbe se, STR a AGI záchrany selžou, útoky na něj s výhodou a zásah zblízka (5 stop) je kritický.",
  "Incapacitated":"Bez akcí, bonusových akcí i reakcí; ztrácí soustředění a nemluví.",
  "Unconscious":"V bezvědomí: Incapacitated a Prone, upustí, co drží; STR a AGI záchrany selžou, útoky na něj s výhodou, zásah zblízka je kritický.",
  "Petrified":"Zkamenělý: Incapacitated, odolá všemu zranění, nestárne; jed a nemoc se zastaví.",
  "Invisible":"Neviditelný: útoky na něj s nevýhodou, jeho útoky s výhodou; nejde zacílit tím, co vyžaduje vidět cíl.",
  "Exhaustion":"Vyčerpání: za každou úroveň −2 k hodům d20 a −5 stop rychlosti; šestá úroveň zabíjí.",
  "Bloodied":"Má polovinu HP nebo méně."};
const BTIP=Object.assign({},...Object.entries(BVLZ).map(([k,v])=>({[k]:`${k} (vlastnost zbraně): ${v}`})),
  ...Object.entries(BTEC).map(([k,v])=>({[k]:`${k}: ${v}`})),...Object.entries(BSTAVD).map(([k,v])=>({[k]:`${k} – ${v}`})));
const BTIPRE=new RegExp(`(?<![\\p{L}])(${Object.keys(BTIP).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})(?![\\p{L}])`,"gu");
const BZBRRE=/(?<![\p{L}])(vycpávan|kroužkov|plátov|komplexn)(\p{L}*)/giu;
const bojZbrTip=k=>{const n=k.toLowerCase().startsWith("vycp")?"Vycpávaná":k.toLowerCase().startsWith("krou")?"Kroužková":k.toLowerCase().startsWith("plát")?"Plátová":"Komplexní",z=BZBR[n];
  return `${n} zbroj: Resistance vůči ${z[0]}; při kritickém zásahu ji lze obětovat ${z[1]} (crit se změní v běžný zásah).`};
const BZRRE=/(?<![\p{L}])(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)(?![\p{L}])|(?<![\p{L}])(Svat|Proklet)(é|ého|ým)(?![\p{L}])(?!\s*\()|(?<![\p{L}])(stříbrn\p{L}*|magick\p{L}*)(?=[\p{L}\s,]{0,24}zbra)/gu;
const BACRE=/(\d+\s*)\(([^()]{2,60})\)/g;
function bojTipy(h){let skip=0;return String(h||"").split(/(<[^>]*>)/).map((x,i)=>{
  if(i%2){if(/^<(abbr|button|summary|a)\b/i.test(x))skip++;else if(/^<\/(abbr|button|summary|a)>/i.test(x))skip=Math.max(0,skip-1);return x}
  if(skip||!x)return x;
  /* vložené značky se schovají, aby je další náhrady nepřepsaly */
  const T=[],k=v=>`\u0001${T.push(v)-1}\u0002`;
  x=x.replace(BACRE,(m,n,v)=>{const d=bikZbDruhy(v);return d.length?m+k(d.map(bikZbR).join("")):m});
  x=x.replace(BZRRE,(m,en,cz,suf,ex)=>en?k(bikZr(en))+m:cz?k(bikZr(cz==="Svat"?"Radiant":"Necrotic"))+m:m+k(bikZr(/stříbr/i.test(ex)?"stribrne":"magicke")));
  x=x.replace(BTIPRE,m=>k(`${BZVK[m]?bikZv(m):""}<abbr class="btp" ${btip(BTIP[m])}>${m}</abbr>`)).replace(BZBRRE,(m,a)=>k(`<abbr class="btp" ${btip(bojZbrTip(a))}>${m}</abbr>`));
  return x.replace(/\u0001(\d+)\u0002/g,(m,j)=>T[j])}).join("")}
/* plovoucí popisek: myš, dotyk (na chvíli) i klávesnice */
const BTT={el:null,t:0,cil:null};
function bttShow(c){const tx=c&&c.getAttribute("data-tip");if(!tx||!c.isConnected)return;let el=BTT.el;
  if(!el){el=BTT.el=document.createElement("div");el.className="btip";el.setAttribute("role","tooltip");document.body.appendChild(el)}
  el.textContent=tx;el.classList.add("on");BTT.cil=c;const r=c.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
  let x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8),y=r.bottom+8;if(y+h>innerHeight-8)y=Math.max(8,r.top-h-8);
  el.style.left=Math.round(x)+"px";el.style.top=Math.round(y)+"px"}
function bttHide(){clearTimeout(BTT.t);if(BTT.el)BTT.el.classList.remove("on");BTT.cil=null}
document.addEventListener("pointerover",e=>{if(e.pointerType==="touch")return;const c=e.target.closest&&e.target.closest("[data-tip]");
  if(c===BTT.cil)return;clearTimeout(BTT.t);if(!c){if(BTT.cil)bttHide();return}BTT.t=setTimeout(()=>bttShow(c),130)});
document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch")return;const c=e.target.closest&&e.target.closest("[data-tip]");bttHide();if(!c)return;bttShow(c);BTT.t=setTimeout(bttHide,2600)});
document.addEventListener("focusin",e=>{const c=e.target.closest&&e.target.closest("[data-tip]");if(c&&e.target.matches(":focus-visible"))bttShow(c)});
document.addEventListener("focusout",()=>bttHide());
addEventListener("scroll",()=>{if(BTT.cil)bttHide()},{passive:true,capture:true});
/* uložené skupiny nepřátel (jen v prohlížeči vypravěče) a hotová setkání z databáze */
const BSK="mm-boj-skupiny",bojSkup=()=>{try{return JSON.parse(localStorage.getItem(BSK)||"{}")}catch(e){return{}}},
  bojSkupUloz=o=>{try{localStorage.setItem(BSK,JSON.stringify(o))}catch(e){}};
const bojSkupSel=(attr,ph)=>{const g=bojSkup(),k=Object.keys(g).sort((a,b)=>a.localeCompare(b,"cs"));
  if(!k.length&&!SETKANI.length)return "";
  return `<select ${attr} aria-label="${ph}"><option value="">${ph}</option>${SETKANI.length?`<optgroup label="Hotová setkání">${SETKANI.map(x=>`<option value="s:${besc(x.id)}">${besc(x.n)}</option>`).join("")}</optgroup>`:""}${k.length?`<optgroup label="Uložené v tomto prohlížeči">${k.map(x=>`<option value="g:${besc(x)}">${besc(x)} (${(Array.isArray(g[x])?g[x]:g[x].np||[]).length})</option>`).join("")}</optgroup>`:""}</select>`};
const bojSkupRadky=v=>{if(!v)return null;if(v.startsWith("s:")){const x=SETBY[v.slice(2)];return x?{rows:bojRozvin(x.np),z:x.x,n:x.n,cile:(x.cl||[]).map(bojCilParse).filter(Boolean),prostr:bojProsParse(x.pro),prekv:x.pk||""}:null}
  const g0=bojSkup()[v.startsWith("g:")?v.slice(2):v];if(!g0)return null;const g=Array.isArray(g0)?{np:g0}:g0;
  return {rows:(g.np||[]).map(x=>({n:x.n,druh:x.druh,pocet:x.pocet||1,b:x.b||"",pr:x.pr||[],os:x.os||""})),z:g.lead||"",cile:(g.cile||[]).map(c=>Object.assign({},c)),prostr:(g.prostr||[]).filter(k=>BPROS[k]),prekv:g.prekv||""}};
/* cíle setkání jako text: „Zachránit rukojmí (3×, do 2. kola, skrytý)“ */
function bojCilParse(t){t=String(t||"").trim();if(!t)return null;const c={n:t,stav:0,ver:true};let x=t;const m=t.match(/^(.*?)\s*\(([^()]*)\)\s*$/);if(m&&/×|x\b|kol|skryt|tajn|\d+\s*\/\s*\d+/i.test(m[2])){c.n=m[1].trim();x=m[2]}else x="";
  const k=x.match(/(\d+)\s*[×x]/i)||x.match(/\d+\s*\/\s*(\d+)/);if(k&&+k[1]>0)c.cil=+k[1];const d=x.match(/do\s+(\d+)\.?\s*kol/i);if(d)c.kolo=+d[1];if(/skryt|tajn/i.test(x))c.ver=false;return c.n?c:null}
const bojCilTxt=c=>{const a=[c.cil?c.cil+"×":"",c.kolo?`do ${c.kolo}. kola`:"",c.ver===false?"skrytý":""].filter(Boolean);return c.n+(a.length?` (${a.join(", ")})`:"")};
function bojProsParse(a){const o=[],R={tma:/tma|tmy|noc/,mlha:/mlh|kour/,vitr:/vitr|vich/,dest:/dest|lijak|snez|sniz/,uzky:/uzk|most|bran|souteska/,teren:/teren|blat|bazin|sut/};
  (Array.isArray(a)?a:String(a||"").split(",")).forEach(x=>{const t=bojNorm(x);const k=Object.keys(R).find(q=>R[q].test(t));if(k&&!o.includes(k))o.push(k)});return o}
/* setkání do boje: nepřátelé vždy, cíle taky; v přípravě i úvod, prostředí a přepadení */
function bojSetkPouzij(z,R){bojPridejNpc(z,R.rows);const prip=!z.aktivni&&z.priprava;
  if((R.cile||[]).length){z.cile=z.cile||[];R.cile.forEach((c,i)=>{z.cile.push(Object.assign({stav:0,ver:true},c,{id:"c"+Date.now().toString(36)+i}))})}
  if(prip){if((R.z||R.n)&&!z.lead)z.lead=(R.n?R.n+". ":"")+(R.z||"");if((R.prostr||[]).length)z.prostr=[...new Set([...(z.prostr||[]),...R.prostr])];if(R.prekv&&!z.prekv)z.prekv=R.prekv}}
const BLIM={houf:1,pacholek:1,sok:2,zhoubce:3},BDRUH={houf:"Houf pacholků",pacholek:"Pacholek",sok:"Sok",zhoubce:"Zhoubce"};
/* ===== Bestiář v Boji – vše jen pro vypravěče; hráči dostanou prázdné seznamy =====
   PROTIVNICI: statblocky (zdroj/obsah/protivnici), PRIVLASTKY: úpravy statblocku (privlastky),
   SETKANI: hotová setkání (setkani), PROTOSOBY: osoby ze Zemských desek se statblokem (pole statblok). */
const PROTIVNICI=/*@PROTIVNICI@*/[],PRIVLASTKY=/*@PRIVLASTKY@*/[],SETKANI=/*@SETKANI@*/[],PROTOSOBY=/*@PROTOSOBY@*/[];
const PROTBY=Object.fromEntries(PROTIVNICI.map(p=>[p.id,p])),PRIVBY=Object.fromEntries(PRIVLASTKY.map(p=>[p.id,p])),
  SETBY=Object.fromEntries(SETKANI.map(p=>[p.id,p])),OSPROT=Object.fromEntries(PROTOSOBY.map(p=>[p.id,p]));
const bojNorm=t=>String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const bojBest=n=>{const t=String(n||"").trim().toLowerCase();return t?PROTIVNICI.find(p=>p.n.toLowerCase()===t)||null:null};
const bojOsoba=n=>{const t=String(n||"").trim().toLowerCase();return t?PROTOSOBY.find(p=>p.n.toLowerCase()===t)||null:null};
const bojBestDl=()=>PROTIVNICI.length?`<datalist id="bbest">${PROTOSOBY.map(o=>`<option value="${besc(o.n)}">${besc((PROTBY[o.b]||{}).n||"")}</option>`).join("")}${PROTIVNICI.map(p=>`<option value="${besc(p.n)}">${BDRUH[p.u]||p.u}</option>`).join("")}</datalist>`:"";
/* místní paměť vypravěče (jen tento prohlížeč): životy, spotřebované zdroje, počet v dosahu, zajatí */
const bojLS=k=>({get(){try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return{}}},set(o){try{localStorage.setItem(k,JSON.stringify(o))}catch(e){}}});
const bojHp=bojLS("mm-boj-hp"),bojZdr=bojLS("mm-boj-zdroje"),bojZaj=bojLS("mm-boj-zajati");
const BOTV=new Set(),BDOS={},BLOG={};/* rozbalené části, počet v dosahu houfu, záznam hodů – přežijí překreslení */
const bojOtv=k=>BOTV.has(k)?" open":"";
const bojKonecLS=()=>{BZAPT=null;BKORX.clear();BKRLOG.length=0;bojHp.set({});bojZdr.set({});bojZaj.set({});Object.keys(BLOG).forEach(k=>delete BLOG[k]);BLOGG.length=0;Object.keys(BDOS).forEach(k=>delete BDOS[k])};

/* --- účinný statblock: základ + přívlastky --- */
const bojMod=(z,d)=>{if(!d)return z;const m=String(z).match(/^(\d*)d(\d+)([+-]\d+)?$/i);if(!m)return z;const c=(m[3]?+m[3]:0)+d;return `${m[1]}d${m[2]}${c?(c>0?"+":"")+c:""}`};
function bojEff(n){const p=PROTBY[n.b];if(!p)return null;const pr=(n.pr||[]).map(i=>PRIVBY[i]).filter(Boolean);
  const sum=k=>pr.reduce((a,x)=>a+(x[k]&&!x[k].pr?x[k].v:0),0),pct=k=>pr.reduce((a,x)=>a+(x[k]&&x[k].pr?x[k].v:0),0);
  const dAc=sum("ac"),dUt=sum("ut"),dZr=sum("zr"),houf=p.u==="houf";
  const ac=dAc?String(p.ac).replace(/\d+/g,m=>+m+dAc):p.ac;
  const hp=houf?p.hp:p.hp.map(h=>({n:h.n,max:Math.max(1,Math.round((h.max+sum("hp"))*(1+pct("hp")/100)))}));
  const at=(p.at||[]).map(a=>Object.assign({},a,a.b!=null?{b:a.b+dUt}:{},a.z?{z:bojMod(a.z,dZr)}:{},a.zp!=null?{zp:Math.max(1,a.zp+dZr)}:{}));
  const zd=[];[...(p.zd||[]),...pr.flatMap(x=>x.zd||[])].forEach(z=>{const o=zd.find(q=>q.n===z.n);if(o)o.max+=z.max;else zd.push({n:z.n,max:z.max})});
  const xp=Math.max(0,Math.round((p.xp||0)*(1+pct("xp")/100)+sum("xp")));
  return {p,pr,ac,hp,at,bon:p.bon!=null?p.bon+dUt:null,zd,xp}}
const bojJmPr=n=>(n.pr||[]).map(i=>PRIVBY[i]).filter(Boolean).map(x=>x.n);

/* --- kostky --- */
const bK=(s,z)=>{const v=1+Math.floor(Math.random()*s);mmkZaznam(s,v,z);return v};
/* 3D kostky: hody bK se po skončení obsluhy přehrají jako slonovinové kostky, kostka Závoje vínová
   (art/kostky/kostky.js = dice-box-threejs, MIT). Výsledek se nemění: kostky dopadnou na už hozená čísla.
   Načte se až při prvním hodu; vypnout jde v Hodu kostkou nebo tlačítkem během hodu (výchozí podle omezení animací). */
const MMK={q:[],t:0,box:null,load:null,run:0,el:null,zi:-1,ci:0,gl:undefined};
function mmkZap(){try{const v=localStorage.getItem("mm-kostky");if(v)return v==="1"}catch(e){}return !navigator.webdriver&&!matchMedia("(prefers-reduced-motion: reduce)").matches}
function mmkNastav(on){try{localStorage.setItem("mm-kostky",on?"1":"0")}catch(e){}document.querySelectorAll("[data-mmk]").forEach(x=>{x.checked=on});if(!on)mmkSkryj(true)}
function mmkZaznam(s,v,z){if(![4,6,8,10,12,20].includes(s))return;MMK.q.push({s,v,z:!!z});if(!MMK.t)MMK.t=setTimeout(mmkPrehraj,0)}
async function mmkNacti(){const el=document.createElement("div");el.className="mmkostky";el.setAttribute("aria-hidden","true");
  el.innerHTML=`<div class="mmk3d" id="mmk3d"></div><button type="button" class="mmkvyp" data-mmkvyp tabindex="-1">Vypnout 3D kostky</button>`;document.body.appendChild(el);MMK.el=el;
  const {default:DiceBox}=await import(new URL("art/kostky/kostky.js",document.baseURI).href);
  const IV={name:"mm-slonovina",foreground:"#33200f",background:"#f0e5cb",outline:"#f0e5cb",edge:"#e2d1ab",texture:"none",material:"plastic"},
    ZV={name:"mm-zavoj",foreground:"#f2cf72",background:"#781421",outline:"#781421",texture:"none",material:"plastic"};
  const B=new DiceBox("#mmk3d",{theme_customColorset:IV,sounds:false,shadows:true,light_intensity:.85,baseScale:innerWidth<700?85:100,strength:1.1});await B.initialize();
  const ZD=await B.DiceColors.makeColorSet(ZV),ID=B.colorData,F=B.DiceFactory,oc=F.create.bind(F);
  F.create=(ty,cd)=>{const z=MMK.ci++===MMK.zi;if(z)F.applyColorSet(ZD);const r=oc(ty,z?ZD:cd);if(z)F.applyColorSet(ID);return r};
  MMK.box=B}
async function mmkPrehraj(){const q=MMK.q;MMK.q=[];MMK.t=0;if(!q.length||q.length>12||!mmkZap()||document.visibilityState!=="visible")return;
  if(MMK.gl===undefined){try{const c=document.createElement("canvas");MMK.gl=!!(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){MMK.gl=false}}if(!MMK.gl)return;
  const id=++MMK.run;
  try{if(!MMK.load)MMK.load=mmkNacti();await MMK.load}catch(e){console.warn("3D kostky se nenačetly:",e);MMK.load=null;MMK.gl=false;return}
  if(id!==MMK.run)return;
  clearTimeout(MMK.skr);MMK.el.classList.add("on");MMK.zi=q.findIndex(x=>x.z);MMK.ci=0;
  try{await MMK.box.roll(q.map(x=>"1d"+x.s).join("+")+"@"+q.map(x=>x.v).join(","))}catch(e){}
  if(id===MMK.run)MMK.skr=setTimeout(mmkSkryj,1500)}
function mmkSkryj(hned){if(!MMK.el||!MMK.el.classList.contains("on"))return;MMK.run++;clearTimeout(MMK.skr);MMK.el.classList.remove("on");setTimeout(()=>{if(MMK.box&&!MMK.el.classList.contains("on"))MMK.box.clearDice()},hned?0:400)}
document.addEventListener("pointerdown",e=>{if(!MMK.el||!MMK.el.classList.contains("on"))return;if(e.target.closest&&e.target.closest("[data-mmkvyp]")){mmkNastav(false);mmHlasG("3D kostky jsou vypnuté – zapneš je v Hodu kostkou.",4500);return}mmkSkryj()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")mmkSkryj()});
document.addEventListener("change",e=>{if(e.target.matches&&e.target.matches("[data-mmk]"))mmkNastav(e.target.checked)});
function bojKostky(z,krit){const m=String(z||"").match(/^(\d*)d(\d+)([+-]\d+)?$/i);if(!m)return null;let n=+(m[1]||1),s=+m[2];if(krit)n*=2;
  const h=[...Array(n)].map(()=>bK(s)),c=m[3]?+m[3]:0;return {t:Math.max(0,h.reduce((a,b)=>a+b,0)+c),x:`${n}d${s}(${h.join("+")})${c?(c>0?"+":"")+c:""}`}}
/* Závoj za protivníka: Hodiny Závoje (Pokušení 1–3) a svátky podle jeho vyznání (Požehnání 4–6) */
function bojZavoj(p){let I={};try{I=zavojInfo()}catch(e){}let fe=[];try{fe=p&&p.vz?pozehnaniDnes(p.vz):[]}catch(e){}
  const pm=I.z?3:2,pz=fe.length?4:5,d=p&&p.d>=1&&p.d<=6?Math.round(p.d):bK(6,1);return {d,r:d<=pm?"pok":d>=pz?"poz":"",hod:I.z?(fe.length?"Hodina Pravdy":"Hodina Závoje"):fe.length?fe.map(x=>x.n).join(", "):""}}
/* výsledek kostky Závoje slovy; Závoj se hází k ověřením (i iniciativě) a útokům, ne k záchranám (Artikule › Kostka Závoje) */
const zavVys=r=>r==="pok"?"Pokušení":r==="poz"?"Požehnání":"bez vlivu Závoje";
const zavBezZach=co=>/^Záchrana|záchrann|proti smrti/i.test(String(co||""));
const zavTxt=z=>z?`Závoj ${z.d}: ${zavVys(z.r)}${z.hod?` (${z.hod})`:""}`:"";
const bojZatr=n=>{const p=PROTBY[n.b];return !!p&&(p.id==="zatraceny-rytir"||(n.pr||[]).includes("zatraceny"))};

/* typ zranění → druh kritického zranění */
const bojKritDruh=t=>{t=bojNorm(t);return /fire|lightning|ohen|blesk/.test(t)?"ohen":/cold|mraz/.test(t)?"mraz":/acid|poison|kyselin|jed/.test(t)?"jed":/necrotic|radiant|prokl|svat/.test(t)?"svata":/psychic|psych/.test(t)?"psych":"fyz"};
/* záznam hodů: u karty poslední hod jako plaketa, celý průběh v záznamu boje pod družinou */
const BLOGG=[];
function bojLog(id,o,kdo){o.t=Date.now();if(o.k==null&&BOJ.s&&BOJ.s.aktivni)o.k=BOJ.s.kolo||1;(BLOG[id]=BLOG[id]||[]).unshift(o);BLOG[id].length=Math.min(BLOG[id].length,4);BLOGG.unshift({id,kdo:kdo||"",o});BLOGG.length=Math.min(BLOGG.length,80)}
const bsg=v=>`${v>=0?"+":"−"}${Math.abs(v)}`;
const bojZavObj=(p,z)=>({r:z.r,d:z.d,hod:z.hod||"",txt:z.r==="pok"?(p&&p.pok)||"":z.r==="poz"?(p&&p.poz)||"":""});
/* zbraň s více typy zranění (Šikovná, „Slashing nebo Piercing“) a Půlmeč: volba se pamatuje u útoku */
const BUTT={},BCIL={},BADV={},BJR={};
/* výhoda / nevýhoda: návrh podle stavu útočníka a cíle (Sražen: zblízka výhoda, z dálky nevýhoda; Omráčen: výhoda; útočník Sražen: nevýhoda) */
const bojDalka=a=>/dostřel|na dálku|střel|kuš|luk|píšťal|hák/i.test((a.n||"")+" "+(a.p||""))&&!/dosah 5 stop|zblízka/i.test(a.p||"");
/* prostředí boje: [ikona, název, místo pro zápis, popis] – tma, mlha, vítr a úzký průchod mění návrh výhody a přesilu houfu */
const BPROS={tma:["tma","Tma","ve tmě","Tma bez světla: kdo nemá vidění ve tmě (Darkvision), nevidí cíl a útočí s nevýhodou. Když družina svítí, nech vypnuté."],
  mlha:["mlha","Mlha nebo kouř","v mlze","Mlha nebo kouř (silně zastřeno): útoky na dálku s nevýhodou. Podle pravidel se výhoda a nevýhoda dvou stran, které se nevidí, ruší – návrh počítá jen s nevýhodou střelce."],
  vitr:["vitr","Silný vítr","v silném větru","Silný vítr: nevýhoda na útoky zbraněmi na dálku, otevřený oheň zhasíná, rozhání mlhu."],
  dest:["dest","Liják nebo sněžení","v lijáku","Liják nebo husté sněžení: lehce zastřeno – nevýhoda na Vnímání (Perception), na útoky vliv nemá. Otevřený oheň zhasíná."],
  uzky:["uzky","Úzký průchod","v úzkém průchodu","Úzký průchod, most nebo brána: na jeden cíl dosáhnou nejvýš dva z houfu – přesila nejvýš +1 (domácí návrh)."],
  teren:["teren","Obtížný terén","v obtížném terénu","Obtížný terén (bláto, hluboký sníh, suť, křoví): každý krok stojí dvojnásob pohybu."]};
const bojPros=s=>(s&&s.prostr)||[];
const bojVidiTma=p=>/darkvision|vidění ve tmě|vidí ve tmě|truesight|blindsight|pravý zrak|slepý zrak/i.test(bojTxt(p));
const bojCilO=(s,id)=>id?((s.hraci||[]).find(h=>h.id===id)||(s.npc||[]).find(x=>x.id===id)||null):null;
/* postava na prahu smrti: hody proti smrti běží, dokud není stabilizovaná nebo mrtvá */
const bojDsAkt=h=>!!(h&&h.ds&&!h.ds.st);
/* návrh výhody (D&D 2024): důvody pro výhodu i nevýhodu; když jsou obojí, ruší se */
function bojAdvNavrh(s,n,a){const plus=[],minus=[],st=n.stav||[],dal=bojDalka(a);
  srdAdv(st,[],dal,plus,minus);
  const P=bojPros(s),p=PROTBY[n.b];
  if(P.includes("tma")&&!bojVidiTma(p))minus.push("tma, nevidí");
  if(P.includes("mlha")&&dal)minus.push("mlha, útok z dálky");
  if(P.includes("vitr")&&dal&&a.b!=null)minus.push("silný vítr, útok z dálky");
  const cid=BCIL[n.id],c=bojCilO(s,cid);let kryt=0,bezv=false;
  if(c){const ct=c.stav||[];if(srdAdv([],ct,dal,plus,minus))bezv=true;
    if(bojDsAkt(c)&&!ct.includes("v bezvědomí")){plus.push("cíl v bezvědomí");bezv=true}
    kryt=+c.kryt||0}
  const v=plus.length&&!minus.length?1:minus.length&&!plus.length?-1:0;
  return {v,why:v?(v>0?plus:minus):plus.length&&minus.length?[`výhoda i nevýhoda se ruší: ${[...plus,...minus].join(", ")}`]:[],kryt,bezv,dal}}
const bojTypy=a=>{const o=[];String(a.zt||"").replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,(m,t)=>{if(!o.includes(t))o.push(t);return m});return o};
const bojKostkaDolu=z=>String(z||"").replace(/d(12|10|8|6)\b/,(m,f)=>"d"+({12:10,10:8,8:6,6:4})[f]);
/* útok po volbě typu: vybraný typ zranění, při Půlmeči Piercing s Průraznou a kostkou o stupeň níž */
function bojUtokV(n,ai,a){const v=BUTT[n.id+":"+ai];if(!v)return a;const b=Object.assign({},a);
  if(v.pul){b.z=bojKostkaDolu(a.z);b.zt=String(a.zt||"").replace(/\b(Bludgeoning|Piercing|Slashing)\b(\s+nebo\s+\b(Bludgeoning|Piercing|Slashing)\b)*/,"Piercing");b.p=(a.p||"")+(/průrazn/i.test(a.p||"")?"":", Průrazná");b.pul=1;return b}
  if(v.t){const ty=bojTypy(a);if(ty.length>1&&ty.includes(v.t))b.zt=String(a.zt||"").replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b(\s+nebo\s+\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b)+/,v.t)}
  return b}
/* přesila houfu: +1 za každého dalšího pacholka, nejvýš +5; v úzkém průchodu nejvýš +1 */
const bojPres=(s,n)=>Math.min(Math.max((n.pocet||0)-1,0),bojPros(s).includes("uzky")?1:5);
function bojUtokZr(n,a,krit,S){
  if(a.zp!=null){const dos=Math.max(1,Math.min(n.pocet||1,bojPros(S).includes("uzky")?2:99,BDOS[n.id]!=null?BDOS[n.id]:(n.pocet||1)));return {t:a.zp*dos,x:`${a.zp} × ${dos} v dosahu`,zt:a.zt||""}}
  if(a.z){const k=bojKostky(a.z,krit);if(k){/* další kostky v popisu („… a 1d8 Prokleté“) se hodí taky */
    let t=k.t,x=k.x;String(a.zt||"").replace(/(?:^|\s)(?:a|\+)\s*(\d*d\d+(?:[+-]\d+)?)/gi,(m,z)=>{const q=bojKostky(z,krit);if(q){t+=q.t;x+=` + ${q.x}`}return m});
    return {t,x,zt:a.zt||"",pol:!!a.dc}}}
  return null}
/* „Zásah – hodit zranění“ u útoku bez známé AC cíle */
function bojUtokZrPo(nid){const L=BLOG[nid],o=L&&L[0],n=((BOJ.s||{}).npc||[]).find(x=>x.id===nid);if(!o||!o.zrPo||!n)return;const E=bojEff(n),a0=E&&E.at[o.zrPo.ai];if(!a0)return;
  const a=bojUtokV(n,o.zrPo.ai,a0),zr=bojUtokZr(n,a,o.zrPo.krit,BOJ.s||{});delete o.zrPo;if(zr)o.zr=zr;renderBoj()}
function bojUtok(n,ai){const E=bojEff(n);if(!E)return;const a=E.at[ai]?bojUtokV(n,ai,E.at[ai]):null;if(!a)return;const houf=n.druh==="houf",p=E.p,o={n:a.n,p:a.p||""};
  let krit=false;
  const S=BOJ.s||{},cid=BCIL[n.id],cil=cid?((S.hraci||[]).find(h=>h.id===cid)||(S.npc||[]).find(x=>x.id===cid)):null;if(cil){o.cil=cil.n;o.ci=cid;if(String(cid)[0]==="h")o.cilPC=cil.n}
  const am=BADV[n.id]==null?"auto":BADV[n.id],nv0=bojAdvNavrh(S,n,a),av=am==="auto"?nv0:{v:+am,why:[]};
  if(nv0.bezv&&cil){o.bezv=cid;o.bezvZbl=!nv0.dal}
  if(a.b!=null){const pres=houf?bojPres(S,n):0,b=a.b+pres,d1=bK(20),d2=av.v?bK(20):null,d=av.v>0?Math.max(d1,d2):av.v<0?Math.min(d1,d2):d1;krit=d===20;
    o.hod={tot:d+b,d,b,pres,krit,mis:d===1,adv:av.v,dd:d2!=null?[d1,d2]:null,advWhy:av.why.join(", "),kryt:nv0.kryt||0,o19:!krit&&d===19&&/ostr/i.test(a.p||"")&&!/^(Piercing|Bludgeoning)$/.test(String(a.zt||"").trim())}}
  else if(a.dc)o.dc=a.dc;
  /* zranění se hází až po zásahu (2026-10-18): proti známé AC (postava s kartou, nepřítel s AC) jen při zásahu; bez cíle nebo AC
     se hodí až tlačítkem „Zásah – hodit zranění“; útok se záchranou (SO) hází zranění hned (polovina při úspěchu) */
  const ACc=cil?(!cil.druh?(bojKartaH(cil)?kAC(bojKartaH(cil))+(+cil.kryt||0):null):(+cil.ac||null)):null;
  const zas=!o.hod?true:o.hod.mis?false:krit?true:ACc!=null?o.hod.tot>=ACc:null;
  if(zas===true){const zr=bojUtokZr(n,a,krit,S);if(zr)o.zr=zr;else if(a.zt)o.zt=a.zt}
  else if(zas===null&&(a.z||a.zp!=null))o.zrPo={ai,krit};
  else if(a.zt&&!a.z&&a.zp==null)o.zt=a.zt;
  if(!houf&&a.b!=null){const z=bojZavoj(p);o.zav=bojZavObj(p,z);o.bes=z.r==="pok"&&bojZatr(n)}
  if(krit)o.krit=bojKritDruh(a.zt);
  {const K=cil&&!cil.druh?bojKartaH(cil):null;if(K&&o.hod){const AC=kAC(K)+(+cil.kryt||0);o.pcAC=AC;o.pcHit=o.hod.krit||(!o.hod.mis&&o.hod.tot>=AC);o.pcId=cid}}
  if(cil&&!cil.druh&&(cil.stav||[]).includes("soustředí")&&o.zr&&o.pcHit!==false)o.kon=`${cil.n} drží soustředění: CON záchrana SO ${bojKonDC(o.zr.t)} – hráč si ji hodí sám`;
  let pz=null;{const K=cil&&!cil.druh?bojKartaH(cil):null;if(K&&o.pcHit&&o.zr&&o.zr.t>0&&bojPcAuto.get()&&GMV){pz=bojPcZasah(o,cid,K);if(pz){o.pcAuto=pz.msg||"bez zranění"}}}
  {const ver=cil&&bojVerej(S,cid);const ze={a:n.n,ai:n.id,c:cil?cil.n:"",ci:cid||"",cim:a.n,v:o.hod?(o.hod.krit?"kritický zásah":o.hod.mis?"vedle":o.pcAC!=null?(o.pcHit?`zásah (${o.hod.tot})`:`vedle (${o.hod.tot})`):`útok ${o.hod.tot}`):o.dc?String(o.dc):"",z:ver&&o.zr&&!(o.hod&&o.hod.mis)&&o.pcHit!==false?o.zr.t:0,t:o.zr?o.zr.zt:""};if(o.hod&&o.pcAC!=null){ze.hod=o.hod.tot;ze.ac=o.pcAC;if(o.hod.krit)ze.kr=1}if(pz){ze.ph=pz.ph;ze.pt=pz.pt;if(pz.pd)ze.pd=1;if(pz.kv)ze.kv=1}bojZaz(ze)}
  if(bojRecharge(p).some(q=>q.n===a.n)){(BRCH[n.id]=BRCH[n.id]||{})[a.n]=1}
  bojLog(n.id,o,n.n)}
/* plaketa posledního hodu: pečeť s výsledkem, zranění, pruh Závoje */
function bojPlak(o){const h=o.hod,z=o.zav;
  const seal=h?`<span class="bpls${h.krit?" bkr":h.mis?" bmis":""}"><b class="bhd${h.krit?" bkr":h.mis?" bmis":""}">${h.tot}</b><small>${o.sav||(h.krit?"kritický zásah":h.mis?"vedle":"útok")}</small></span>`
    :o.dc?`<span class="bpls bdc"><b class="bhd">${besc(String(o.dc).replace(/^.*?DC\s*/i,"DC "))}</b><small>${besc(String(o.dc).replace(/\s*DC.*$/i,"")||"záchrana")} záchrana</small></span>`
    :z?`<span class="bpls bzs">${bi("zavoj")}<small>Závoj</small></span>`:"";
  const det=h?`<small class="bpld">${o.cil?`→ <b>${besc(o.cil)}</b> · `:""}${h.dd?`${h.adv>0?"výhoda":"nevýhoda"}${h.advWhy?` (${besc(h.advWhy)})`:""}: d20 ${h.dd[0]} / ${h.dd[1]} → ${h.d}`:`d20 ${h.d}`} ${bsg(h.b)}${h.pres?`, přesila +${h.pres}`:""}${h.kryt?` · cíl za ${h.kryt===5?"tříčtvrtečním":"polovičním"} krytem: jeho AC +${h.kryt}`:""}${o.bezv?` · cíl v bezvědomí${o.bezvZbl?": zásah zblízka je kritický":""}`:""}${o.pcAC!=null?` · <b class="${o.pcHit?"bkfail":"bkok"}">${o.pcHit?"zásah":"vedle"}</b> proti AC ${o.pcAC}`:""}${o.kon?` · ${besc(o.kon)}`:""}${h.o19?" · 19: kritický, pokud seká (Slashing) cíl bez Resistance (Ostrá)":""}</small>`:o.dc?`<small class="bpld">záchrana cíle</small>`:"";
  const zr=o.zr?`<span class="bplz">zranění <b>${o.zr.t}</b> ${bikZrTxt(o.zr.zt)}<small>${besc(o.zr.x)} ${besc(o.zr.zt)}${o.zr.pol?" · při úspěchu záchrany obvykle polovina":""}</small></span>`:o.zrPo?`<button type="button" class="badd" data-bzrpo ${btip("Cíl bez známé AC: když útok zasáhl, hodí zranění")}>Zásah – hodit zranění →</button>`:o.zt?`<small>${besc(o.zt)}</small>`:"";
  const zb=z?`<div class="bplv ${z.r==="pok"?"zp":z.r==="poz"?"zb":"zn"}">${bi(z.r==="pok"?"pokuseni":z.r==="poz"?"pozehnani":"zavoj")}<b>${z.r==="pok"?"Pokušení":z.r==="poz"?"Požehnání":"Závoj bez efektu"}</b><small>k6 ${z.d}${z.hod?" · "+besc(z.hod):""}</small>${z.txt?`<span>${besc(z.txt)}</span>`:""}</div>`:"";
  const btn=(o.leg?`<button type="button" class="badd" data-blegod>Použít Legendární odolnost (zbývá ${o.leg}) →</button>`:"")+(o.krit?`<button type="button" class="badd" data-bkritz="${o.krit}">Kritické zranění cíle →</button>`:"")+(o.bes?`<button type="button" class="badd bbes" data-bbes>Zhmotnit běsa</button>`:"")+(o.pcAuto?`<small class="bpcauto">odečteno z karty: ${besc(o.pcAuto)}</small>`:"")+(o.pcHit&&o.zr&&o.zr.t>0&&!BPCZ.has(o.t)&&!o.pcAuto?`<button type="button" class="badd" data-bpczt="${o.t}" data-bpcz="${besc(o.pcId)}" data-z="${o.zr.t}" data-t="${besc((bojTypy({zt:o.zr.zt})[0])||"Slashing")}"${o.hod&&o.hod.krit?' data-k="1"':""} ${btip("Odečte postavě životy (s jejími odolnostmi a dočasnými HP). Neklikej, když se ubránila reakcí, např. Shield.")}>Zapsat zranění ${besc(o.cil)} −${o.zr.t} →</button>`:"")+(o.bezv&&!(o.hod&&o.hod.mis)?(()=>{const k=o.hod&&o.hod.krit||o.bezvZbl?2:1;return `<button type="button" class="badd" data-bdsf="${besc(o.bezv)}" data-k="${k}" ${btip("Zásah postavy na 0 HP: neúspěch hodu proti smrti, kritický zásah dva")}>Zasáhl padlého: +${k} ${k===1?"neúspěch":"neúspěchy"} →</button>`})():"");
  return `${seal}<div class="bplm"><b class="bpln">${o.an&&o.ci&&o.ai!==o.ci?`${besc(o.an)}: `:""}${besc(o.n)}</b>${det}${zr}${o.p?`<small class="bpoz">${bojTipy(besc(o.p))}</small>`:""}${btn?`<div class="bplb">${btn}</div>`:""}</div>${zb}`}
/* záznam boje: KDO → KOMU · ČÍM · výsledek (hod, zranění s typem, Závoj) */
const bojLogVys=o=>{const h=o.hod,z=o.zav;
  return `${h?` <b class="${h.krit?"bkr":h.mis?"bmis":""}">${h.tot}</b>${h.adv?` <small>${h.adv>0?"(výh.)":"(nev.)"}</small>`:""}${h.krit?` <b class="bkrt">krit</b>`:h.mis?` <small>vedle</small>`:""}`:o.dc?` <b>${besc(o.dc)}</b>`:""}${o.sav?` <small>${besc(o.sav)}</small>`:""}${o.zt&&!(o.zr&&o.zr.zt===o.zt)?` <span class="blzt">${besc(o.zt)}</span>`:""}${o.zr?` · <b class="blzr" ${btip(`Zranění ${o.zr.t}: ${o.zr.x||""}`)}>${o.zr.t}</b> ${bikZrTxt(o.zr.zt)}<small>${besc(String(o.zr.zt||"").replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,m=>BZRT[m]||m))}</small>`:""}${z?` · <span class="bzv ${z.r==="pok"?"zp":z.r==="poz"?"zb":""}">${z.r==="pok"?"Pokušení":z.r==="poz"?"Požehnání":"Závoj"} ${z.d}</span>`:""}`};
function bojLogRow(s,x,i){const o=x.o,F=id=>id?bojCilO(s,id):null,A=o.ai!==undefined?F(o.ai):F(x.id),an=A?A.n:o.ai!==undefined?(o.an||""):x.kdo,C=F(o.ci),cn=C?C.n:(o.cn||o.cil||"");
  const med=q=>q?`<button type="button" class="blfb" data-blf="${besc(q.id)}" ${btip("Jen akce: "+q.n)}>${q.druh?bojMedN(q,"bmini"):bojMedH(q,"bmini")}</button>`:"";
  const und=o.und&&!o.undone&&i!=null?`<button type="button" class="blund" data-blund="${i}" ${btip(o.und.poc?"Vrátit padlé pacholky do houfu":`Vrátit životy ${o.und.nov} → ${o.und.old}`)}>↶</button>`:"";
  return `<li${o.undone?' class="blundone"':""}>${an?`<span class="blkdo">${med(A)}<b>${besc(an)}</b></span>`:""}${cn?`<span class="blkomu"><i aria-label="komu">→</i>${med(C)}<b>${besc(cn)}</b></span>`:""}<span class="blcim">${besc(o.n||"")}</span><span class="blvys">${bojLogVys(o)}</span>${und}</li>`}

/* --- karta nepřítele: rychlý přehled pro boj --- */
function bojRefTxt(p,karta){const r=[];
  if(p.ut&&!(karta&&(p.at||[]).length))r.push(`<p class="brf"><b>Útok</b> ${besc(p.ut)}</p>`);
  if(p.poz)r.push(`<p class="brf"><b class="zv zb">Požehnání</b> ${besc(p.poz)}</p>`);
  if(p.pok)r.push(`<p class="brf"><b class="zv zp">Pokušení</b> ${besc(p.pok)}</p>`);
  if(p.kom)r.push(`<p class="brf"><b>Komplikace pro útočníka</b> ${besc(p.kom)}</p>`);
  if(p.ner)r.push(`<p class="brf"><b>Neřest</b> ${besc(p.ner)}</p>`);
  return r.join("")}
const bojEdit=(p,druh)=>window.MMDB&&!p.$srd?`<button type="button" class="gbtn ghost bedit" data-bedit="${besc(p.id)}" data-bedruh="${druh||"protivnik"}">Upravit</button>`:"";
/* životy soka v hlavičce karty: číslo k přepsání a pruh (pod polovinou Bloodied) */
function bojHpHtml(n,E){if(!E||n.druh==="houf"||!E.hp.some(h=>h.max>1))return "";const hv=bojHp.get()[n.id]||[];
  return `<span class="bhpw">${E.hp.map((h,k)=>{const cur=hv[k]!=null?hv[k]:h.max,pr=Math.max(0,Math.min(100,Math.round(cur/h.max*100)));
    return `<label class="bhp${cur<=0?" bhp0":cur<=h.max/2?" bhp2":""}" ${btip(`Životy${h.n?" – "+h.n:""}: přepiš číslo. Pod polovinou je Bloodied.`)}><span class="${h.n?"":"vh"}">${h.n?besc(h.n):"HP"}</span><input type="text" autocomplete="off" enterkeyhint="done" name="hp-${n.id}-${k}" data-bhp="${k}" data-max="${h.max}" value="${cur}" ${btip("Životy: číslo nastaví, −12 odečte, +5 přičte (Enter)")} aria-label="Životy – ${besc(n.n)}${h.n?", "+besc(h.n):""}"><small>/${h.max}</small><i style="--p:${pr}%"></i></label>`}).join("")}</span>`}
/* rozbalená část karty: stavy, znamení (Požehnání, Pokušení…), přívlastky, zdroje, útoky, poslední hod, statblock */
function bojRef(n,s,velH){const E=bojEff(n),houf=n.druh==="houf";
  const prv=PRIVLASTKY.filter(x=>!(n.pr||[]).includes(x.id)&&(!x.pro.length||x.pro.includes(n.druh)));
  const prC=E?`<span class="bprv">${E.pr.map(x=>`<span class="bprc"${x.h?` ${btip(x.n+": "+bTxt(x.h))}`:""}>${besc(x.n)}<button type="button" data-bprdel="${besc(x.id)}" aria-label="Odebrat přívlastek ${besc(x.n)}">×</button></span>`).join("")}${prv.length?`<select data-bpradd aria-label="Přidat přívlastek" ${btip("Přidat přívlastek (Zkušený, Veterán, Ve zbroji…)")}><option value="">+ přívlastek</option>${prv.map(x=>`<option value="${besc(x.id)}">${besc(x.n)}</option>`).join("")}</select>`:""}</span>`:"";
  const p=E?E.p:null;
  const zn=p?[["zak","zakon","Zákon relikta"],["poz","pozehnani","Požehnání"],["pok","pokuseni","Pokušení"],["kom","komplikace","Komplikace pro útočníka"],["ner","nerest","Neřest"]].filter(([k])=>p[k]).map(([k,ic,t])=>`<span class="bzn bzn-${k}" role="img" aria-label="${t}" ${btip(t+": "+p[k])}>${bi(ic)}</span>`).join(""):"";
  const os=n.os&&PBY[n.os]?`<a class="bosl" href="#osoba/${n.os}" ${btip(PBY[n.os].n+" – Zemské desky")} aria-label="${besc(PBY[n.os].n)} – Zemské desky">${bi("osoba")}</a>`:"";
  const ZS=E?bojZbrStav(n,E):null;
  const zbr=ZS?ZS.d.map(z=>`<span class="bzbg">${bikZbR(z.k)}<span class="bzd bzbo" ${btip(`${z.k}: obětováno ${z.u} z ${z.max} – klikni na kosočtverec`)}>${[...Array(z.max)].map((_,j)=>`<button type="button" class="${j<z.u?"on":""}" data-bzbu="${besc(z.k)}" data-bzbj="${j}" aria-label="${besc(z.k)}: obětování ${j+1} z ${z.max}${j<z.u?" – použito":""}"></button>`).join("")}</span></span>`).join(""):"";
  const kryB=`<button type="button" class="bkrytb${n.kryt?" on":""}" data-bkryt aria-pressed="${!!n.kryt}" ${btip(`Kryt: ${n.kryt===5?"tříčtvrteční (+5 AC a záchrany na Obratnost)":n.kryt===2?"poloviční (+2 AC a záchrany na Obratnost)":"žádný"} – klikni: žádný → ½ → ¾`)}>${bi("kryt")}<small>${n.kryt===5?"¾":n.kryt===2?"½":"kryt"}</small></button>`;
  const nej=srdNejedna(n.stav)?`<p class="bmor bvzd">${bi("neschopny")} <b>Nemůže jednat</b> (${(n.stav||[]).filter(k=>SRDST[k]&&SRDST[k].nej).join(", ")} – Incapacitated): žádná akce, bonusová akce ani reakce; soustředění končí.</p>`:"";
  const vzd=(n.stav||[]).includes("vzdal se")?`<p class="bmor bvzd">${bi("vzdal")} <b>Vzdal se.</b> Je bezbranný: kdo ho zabije, páchá vraždu bezbranného – smrtelný hřích (Svědomí −1, proti vlastní Ctnosti −2). Ozvi se dřív, než to hráč udělá. Po boji rozhodnete, co s ním.</p>`:"";
  const bar=`${nej}${vzd}<div class="bbar1">${bojStavy(n,true,true)}${kryB}${zbr?`<span class="bzbrw">${zbr}</span>`:""}${zn?`<span class="bznw">${zn}</span>`:""}${velH||""}${prC}${os}</div>`;
  if(!E)return `<div class="bref">${bar}</div>`;
  var zu=bojZdr.get()[n.id]||{};
  const zd=E.zd.length?`<div class="bzdr">${E.zd.map(z=>{const u=Math.min(z.max,zu[z.n]||0);return `<span class="bzd" data-bzd="${besc(z.n)}" data-max="${z.max}" ${btip(`${z.n}: spotřebováno ${u} z ${z.max} – klikni na kosočtverec`)}><span>${besc(z.n)}</span>${[...Array(z.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-bzdi="${j}" aria-label="${besc(z.n)} ${j+1} z ${z.max}${j<u?" – spotřebováno":""}"></button>`).join("")}</span>`}).join("")}</div>`:"";
  const dos=houf&&E.at.some(a=>a.zp!=null)?`<label class="bdos" ${btip("Kolik pacholků dosáhne na cíl – podle toho se počítá zranění")}>${bi("dosah")}<input type="number" min="1" max="${n.pocet||1}" name="dos-${n.id}" data-bdos value="${Math.max(1,Math.min(n.pocet||1,BDOS[n.id]!=null?BDOS[n.id]:(n.pocet||1)))}" aria-label="Kolik pacholků dosáhne na cíl"></label>`:"";
  const zavB=!houf?`<button type="button" class="gbtn ghost but bzavb" data-bzav ${btip("Hod kostkou Závoje za protivníka (testy, záchrany)")}>${bi("zavoj")} Závoj</button>`:"";
  const S=BOJ.s||{},cile=[...(bojSpoj(n)?[]:(S.hraci||[])),...(S.npc||[]).filter(x=>x.id!==n.id&&bojSpoj(x)!==bojSpoj(n))],am=BADV[n.id]==null?"auto":String(BADV[n.id]),nav=E.at.length?bojAdvNavrh(S,n,E.at[0]):{v:0,why:[]};
  const rdy=(S.ready||{})[n.id],rk=!!(S.reak||{})[n.id];
  const utc=E.at.length?`<div class="butc"><label>Cíl <select data-bcil aria-label="Cíl útoku"><option value="">—</option>${cile.map(x=>`<option value="${x.id}"${BCIL[n.id]===x.id?" selected":""}>${besc(x.n)}</option>`).join("")}</select></label>
    <span class="badv" role="group" aria-label="Výhoda">${[["auto","auto"],["1","výhoda"],["-1","nevýhoda"],["0","bez"]].map(([k,l])=>`<button type="button" data-badv="${k}" aria-pressed="${am===k}" ${btip(k==="auto"?`Podle stavu útočníka a cíle${nav.v?` – teď ${nav.v>0?"výhoda":"nevýhoda"} (${nav.why.join(", ")})`:" – teď bez výhody"}`:l)}>${l}${k==="auto"&&nav.v?` <b>${nav.v>0?"+":"−"}</b>`:""}</button>`).join("")}</span>
    <label class="bjr${rk?" brkusd":""}" ${btip(rk?"Reakce už je v tomto kole použitá":"Další útok proběhne jako reakce (příležitostný útok, Křížný sek…) a odškrtne R")}><input type="checkbox" data-bjr${BJR[n.id]?" checked":""}> jako reakce</label></div>`:"";
  const rdyB=rdy?`<p class="bmor bkonc brdy">⏳ <b>Připravená akce:</b> ${besc(rdy)} <button type="button" class="gbtn ghost" data-brdygo>Spustit (reakce)</button><button type="button" class="bkoncx" data-brdyx aria-label="Zrušit připravenou akci">×</button></p>`
    :`<button type="button" class="gbtn ghost brdyadd" data-brdyadd ${btip("Připravit akci (Ready): spustí se reakcí, propadne na začátku jeho dalšího tahu")}>⏳ Připravit akci</button>`;
  const ut=E.at.length||zavB?`${utc}<div class="butoky">${E.at.map((a,i)=>`<button type="button" class="gbtn ghost but" data-but="${i}" ${btip(([a.dc?"Záchrana "+a.dc:a.b!=null?"Útok "+bsg(a.b):"",a.zp!=null?a.zp+" za pacholka "+(a.zt||""):[a.z,a.zt].filter(Boolean).join(" "),a.p].filter(Boolean).join(" · "))||a.n)}>${besc(a.n)} ${a.b!=null?`<b>${a.b>=0?"+":""}${a.b}</b>`:a.dc?`<b>${besc(a.dc)}</b>`:""}${(()=>{const av=bojUtokV(n,i,a),ic=bikZvTxt(av.p)+bikZrTxt(av.zt);return ic?`<span class="biks">${ic}</span>`:""})()}</button>${(()=>{const ty=bojTypy(a),v=BUTT[n.id+":"+i]||{},pul=/půlmeč/i.test(a.p||"")||(/meč/i.test(a.n)&&!/půlmeč/i.test(a.n)&&/Půlmeč/.test(String(E.p.b||E.p.h||"")));
    if(ty.length<2&&!pul&&!(a.dc&&(a.z||a.zp)))return "";const cur=v.pul?"":(v.t&&ty.includes(v.t)?v.t:"");
    return `<span class="buttg" role="group" aria-label="Typ zranění – ${besc(a.n)}">${ty.length>1?ty.map(t=>`<button type="button" data-butt="${i}" data-t="${t}" aria-pressed="${cur===t}" ${btip(`${a.n}: zranění ${BZRT[t]} (${t})${/šikovn/i.test(a.p||"")?" – Šikovná: volí se před hodem":""}`)}>${bikZr(t)}</button>`).join(""):""}${a.dc&&(a.z||a.zp||bojAkceStav(a.n,a.p))?`<button type="button" class="bplb" data-bplos="${i}" ${btip(a.z||a.zp?`Plošně: ${a.n} na více cílů – jeden hod zranění, záchrany všech`:`${a.n}: záchrany cílů, při neúspěchu stav (postavám vyskočí výzva)`)}>☄</button>`:""}${pul?`<button type="button" data-butpul="${i}" aria-pressed="${!!v.pul}" ${btip(`Půlmeč: přehmat zbraně – Piercing s vlastností Průrazná, kostka zranění o stupeň níž (${besc(a.z||"")} → ${besc(bojKostkaDolu(a.z))})`)}>${bikZv("Půlmeč")}</button>`:""}</span>`})()}`).join("")}${dos}${zavB}</div>`:"";
  const L=BLOG[n.id]||[];
  const plak=L.length?`<ol class="blog"><li class="bplak${Date.now()-L[0].t<1500?" bnov":""}">${bojPlak(L[0])}</li></ol>`:"";
  const hpE=E.hp.length&&!houf,R=hpE?bojOdolnosti(E):null,tl=BZTL[n.id]||{t:"Slashing"};
  const odl=R?[["Odolá",new Set([...R.res,...R.resZ]),"res"],["Imunní",R.imu,"imu"],["Zranitelný",R.zra,"zra"]].filter(x=>x[1].size).map(([l,S,c])=>`<span class="bzro bzro-${c}"><small>${l}</small>${[...S].map(t=>bikZr(t)+(c==="res"&&R.resZ.has(t)&&!R.res.has(t)?`<sup ${btip("Resistance ze zbroje – Drtivá / Průrazná ji ignorují")}>z</sup>`:"")).join("")}</span>`).join(""):"";
  const zrf=hpE?`<form class="bzrf" data-bzrf>${E.hp.length>1?`<select name="k" aria-label="Komu">${E.hp.map((h,k)=>`<option value="${k}">${besc(h.n||"HP")}</option>`).join("")}</select>`:""}${(()=>{const kdo=[...(s.hraci||[]),...(s.npc||[]).filter(x=>bojSpoj(x)!==bojSpoj(n))];return kdo.length?`<select name="kdo" aria-label="Kdo útočí"><option value="">kdo útočí</option>${kdo.map(x=>`<option${BKDO===x.n?" selected":""}>${besc(x.n)}</option>`).join("")}</select>`:""})()}<input name="cim" list="bcimdl" autocomplete="off" placeholder="čím" value="${besc(BCIM[BKDO]||"")}" aria-label="Čím útočí (zbraň, kouzlo)" size="10"><datalist id="bcimdl">${[...new Set([...((s&&s.hraci)||[]).flatMap(h=>bojZbrVse(s,h).map(w=>w.n)),...Object.values(BCIM).filter(Boolean),...BCIMZ])].map(x=>`<option value="${besc(x)}">`).join("")}</datalist><input type="number" name="u" min="-5" max="60" inputmode="numeric" placeholder="útok" aria-label="Výsledek hodu na útok" ${btip(`Výsledek hodu na útok – porovná se s AC ${ZS?ZS.ac:""}`)}><input type="number" name="z" min="0" max="999" inputmode="numeric" placeholder="zranění" aria-label="Zranění">
    <select name="t" aria-label="Typ zranění">${Object.entries(BZRT).map(([en,cz])=>`<option value="${en}"${tl.t===en?" selected":""}>${cz} (${en})</option>`).join("")}</select>
    <label class="bzrx" ${btip(bikZvTip("Drtivá"))}><input type="checkbox" name="drt"${tl.drt?" checked":""}>${bikZv("Drtivá")}<span class="vh">Drtivá</span></label><label class="bzrx" ${btip(bikZvTip("Průrazná"))}><input type="checkbox" name="pru"${tl.pru?" checked":""}>${bikZv("Průrazná")}<span class="vh">Průrazná</span></label>
    ${ZS&&ZS.d.some(z=>z.u<z.max)?`<label class="bzrk" ${btip("Kritický zásah – nabídne obětování zbroje")}><input type="checkbox" name="krit"> krit</label>`:""}
    <button type="submit" class="gbtn">Zasáhnout</button>${odl?`<span class="bzrodl">${odl}</span>`:""}<span class="bzrobet" hidden></span></form>`:"";
  const pd=BKPAD[n.id],pad=pd?`<p class="bmor bkonc bpad">${bi("porazen")} <b>Pod nulou</b> o ${pd.pod} HP – <button type="button" class="gbtn ghost" data-bkritpad>Hod na kritické zranění</button><button type="button" class="bkoncx" data-bkritpadx aria-label="Zavřít">×</button></p>`:"";
  const kzl=bojKouzla(n,E),kzB=kzl.length?`<div class="bkzl"><span class="bkzlh">${bi("kniha")} Kouzla</span>${kzl.map(k=>{const zm=E.zd.find(z=>z.n===k.z),u=zm?Math.min(zm.max,zu[zm.n]||0):0;
    return `<button type="button" class="gbtn ghost bkzb${zm&&u>=zm.max?" bkzv":""}" data-bkz="${besc(k.x.i)}"${zm?` data-bkzz="${besc(zm.n)}"`:""} ${btip(`${k.x.cz||k.x.en} (${k.x.en}) · ${kzUr(k.x.l)}${zm?` · použito ${u} z ${zm.max} – klik otevře kartu a odečte použití`:" – klik otevře kartu kouzla"}`)}>${besc(k.x.cz||k.x.en)}${zm?` <small>${zm.max-u}/${zm.max}</small>`:""}</button>`}).join("")}</div>`:"";
  const kc=BKONC[n.id],kon=kc?`<p class="bmor bkonc">${bi("soustredi")} <b>Concentration</b>: CON záchrana <b>DC ${kc.dc}</b> <small>(zranění ${kc.dmg})</small>${kc.v?` → <b class="${kc.v.ok?"bkok":"bkfail"}">${kc.v.t} ${kc.v.ok?"udržel":"ztratil soustředění"}</b> <small>d20 ${kc.v.d} ${bsg(kc.v.b)}</small>`:` <button type="button" class="gbtn ghost" data-bkonch>Hodit (CON ${bsg(bojConB(p))})</button>`}<button type="button" class="bkoncx" data-bkoncx aria-label="Zavřít">×</button></p>`:"";
  const tm=BTMSG[n.id],tmsg=tm&&tm.length?`<div class="bmor bkonc btmsg">${bi("tah")}<div><b>Začátek tahu</b><ul>${tm.map(x=>`<li>${besc(x)}</li>`).join("")}</ul></div><button type="button" class="bkoncx" data-btmsgx aria-label="Zavřít">×</button></div>`:"";
  const efs=(n.ef||[]).map((e,j)=>`<span class="bprc bef" ${btip(`${e.n}: ${e.kdy==="zacatek"?"do začátku příštího tahu":e.kdy==="konec"?"do konce příštího tahu":`ještě ${e.k} ${e.k===1?"kolo":e.k<5?"kola":"kol"}`}${e.z?` · na začátku tahu ${e.z} ${BZRT[e.t]||""}`:""}`)}>⧗ ${besc(e.n)} <small>${e.kdy==="kola"?e.k:e.kdy==="zacatek"?"→ zač.":"→ konec"}</small><button type="button" data-befdel="${j}" aria-label="Zrušit účinek ${besc(e.n)}">×</button></span>`).join("");
  const efF=`<details class="befd"><summary>+ účinek s trváním</summary><form class="beff" data-beff><select name="st" aria-label="Stav">${BSTAV.filter(t=>t!=="poražen"&&t!=="prchá"&&t!=="vzdal se").map(t=>`<option value="${t}">${besc((BSTI[t]||[0,t])[1].split(/ [–(]/)[0])}</option>`).join("")}<option value="">jiný…</option></select><input name="n" placeholder="název (jed, hoření…)" aria-label="Název účinku">
    <select name="kdy" aria-label="Trvání"><option value="zacatek">do začátku jeho příštího tahu</option><option value="konec">do konce jeho příštího tahu</option><option value="k1">1 kolo</option><option value="k2">2 kola</option><option value="k3">3 kola</option><option value="k10">1 minuta (10 kol)</option></select>
    <input name="z" placeholder="zranění/tah (1d4)" aria-label="Zranění na začátku tahu" size="9"><select name="t" aria-label="Typ zranění"><option value="">typ</option>${Object.entries(BZRT).map(([en,cz])=>`<option value="${en}">${cz}</option>`).join("")}</select><button class="gbtn">Přidat</button></form></details>`;
  const zs=`<div class="bzach"><span class="bkzlh">Záchrana</span>${BAB.map(a=>`<button type="button" class="gbtn ghost" data-bzach="${a}">${a} <b>${bsg(bojSaveB(p,a))}</b></button>`).join("")}<label>DC <input type="number" min="1" max="40" data-bzdc value="${BZDC[n.id]||""}" aria-label="DC záchrany"></label>${bojLegMax(E)?`<span class="bleg" ${btip("Legendární odolnost: neúspěšnou záchranu může změnit v úspěch")}>Leg. odolnost ${bojLegZb(n,E)}/${bojLegMax(E)}</span>`:""}</div>`;
  const rc=bojRecharge(p),rcB=rc.length?`<div class="bkzl"><span class="bkzlh">Dobíjení</span>${rc.map(q=>{const u=(BRCH[n.id]||{})[q.n];return `<button type="button" class="gbtn ghost bkzb${u?" bkzv":""}" data-brch="${besc(q.n)}" ${btip(`${q.n}: dobíjí se na ${q.min}${q.min<6?"–6":""} – ${u?"použito, na začátku tahu se hodí k6":"připraveno, klikni po použití"}`)}>${besc(q.n)} <small>${u?"použito":"připraveno"}</small></button>`}).join("")}</div>`:"";
  return `<div class="bref">${tmsg}${bar}${rdy?rdyB:""}${efs?`<div class="befs">${efs}</div>`:""}${kon}${pad}${zrf}${zd}${ut}${kzB}${rcB}${zs}${rdy?"":rdyB}${efF}${plak}
    <details class="bstat" data-otv="st-${n.id}"${bojOtv("st-"+n.id)}><summary>${bi("svitek")} Statblock</summary><div class="bsb" data-bsb="${besc(p.id)}">${BOTV.has("st-"+n.id)?bojStatHtml(p):""}</div>${bojEdit(p)}</details></div>`}
/* statblock s vysvětlivkami se počítá až při prvním otevření a pamatuje se */
const BSTC={};
const bojStatHtml=p=>BSTC[p.id]||(BSTC[p.id]=bojTipy(p.b||p.h));
document.addEventListener("toggle",e=>{const d=e.target;if(!d.matches||!d.matches("details.bstat")||!d.open)return;const b=d.querySelector("[data-bsb]");if(b&&!b.firstChild){const p=PROTBY[b.dataset.bsb];if(p)b.innerHTML=bojStatHtml(p)}},true);
/* která karta je rozbalená: ta, kdo je na tahu; ruční přepnutí platí do dalšího tahu */
const BKART={};let BKARTK="";
function bojOtevr(s,n){const k=`${s.kolo}:${s.tah}`;if(k!==BKARTK){BKARTK=k;Object.keys(BKART).forEach(x=>delete BKART[x])}
  return BKART[n.id]!=null?BKART[n.id]:(s.obsazeni||{})[s.tah]===n.id}
/* houf a sok, který ho drží: když sok padne nebo prchá, houf prchá */
function bojSokPadl(s,id){const o=(s.npc||[]).find(x=>x.id===id);if(!o)return true;if((o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="rozplynul se"||t==="vzdal se"))return true;
  const E=bojEff(o),hv=bojHp.get()[o.id]||[];return !!E&&E.hp.length>0&&E.hp.every((h,k)=>(hv[k]!=null?hv[k]:h.max)<=0)}

/* --- hledání v bestiáři: protivníci, osoby se statblokem, hotová setkání; i podle štítků --- */
let BHLED="";
function bojVysl(q){const t=bojNorm(q).trim();if(!t)return "";const sl=t.split(/\s+/),ok=h=>sl.every(x=>bojNorm(h).includes(x));
  const P=PROTIVNICI.filter(p=>ok([p.n,p.cz||"",BDRUH[p.u]||p.u,p.ut,p.id,(p.st||[]).join(" ")].join(" ")));
  const O=PROTOSOBY.filter(o=>ok([o.n,(PROTBY[o.b]||{}).n,(o.pr||[]).map(i=>(PRIVBY[i]||{}).n).join(" "),"osoba"].join(" ")));
  const S=SETKANI.filter(x=>ok([x.n,x.id,(x.st||[]).join(" "),"setkání",x.np.map(r=>r.n||(PROTBY[r.id]||{}).n||"").join(" ")].join(" ")));
  const st=a=>(a||[]).length?`<span class="bstit2">${a.map(x=>`<button type="button" data-bstitek="${besc(x)}">${besc(x)}</button>`).join("")}</span>`:"";
  const item=(k,id,nm,sub,body,tags,edit)=>`<li><details class="bbe" data-otv="be-${k}-${besc(id)}"${bojOtv("be-"+k+"-"+id)}><summary><span class="bben">${besc(nm)}</span><small>${sub}</small><button type="button" class="badd bbadd" data-bbadd="${k}:${besc(id)}" title="Přidat do boje">+ do boje</button></summary>
      ${tags}<div class="bsb">${bojTipy(body)}</div>${edit}</details></li>`;
  const r=[...S.map(x=>item("s",x.id,x.n,`Setkání · ${x.np.length} ${x.np.length<5?"skupiny":"skupin"}`,`<ul>${x.np.map(r=>`<li>${besc(bojRadekTxt(r))}</li>`).join("")}</ul>${x.h}`,st(x.st),bojEdit(x,"setkani"))),
    ...O.map(o=>{const p=PROTBY[o.b]||{};return item("o",o.id,o.n,`Osoba · ${besc(p.n||"")}${(o.pr||[]).length?" · "+(o.pr||[]).map(i=>besc((PRIVBY[i]||{}).n||i)).join(", "):""}`,`<p class="brf"><a href="#osoba/${o.id}">Zemské desky →</a></p>${bojRefTxt(p)}<hr>${p.h||""}`,"","")}),
    ...P.map(p=>item("p",p.id,p.n,`${BDRUH[p.u]||p.u}${p.poc?` · ${p.poc}`:""}${p.vy?` · výzva ${besc(p.vy)}`:""}`,`${p.ac?`<p class="brf"><b>AC</b> ${besc(p.ac)}${p.hp.length?` · <b>HP</b> ${p.hp.map(h=>(h.n?h.n+" ":"")+h.max).join(", ")}`:""}</p>`:""}${bojRefTxt(p)}<hr>${p.h}`,st(p.st),bojEdit(p)))].slice(0,10);
  return r.length?r.join(""):`<li class="bnic">Nic takového v bestiáři není.</li>`}
function bojBestiar(){if(!PROTIVNICI.length||!GMV)return "";
  return `<div class="bhledej"><input type="search" name="bhledej" data-bhledej value="${besc(BHLED)}" placeholder="Hledat v bestiáři – jméno, zbraň, štítek (hory, Slezsko…), setkání, osoba" aria-label="Hledat v bestiáři protivníků" autocomplete="off"><ul class="bbl" data-bvysl>${bojVysl(BHLED)}</ul></div>`}

/* --- řádek setkání „Jméno = 6 houf-zoldneru + zkuseny“ → nepřátelé do boje --- */
function bojRadek(t){t=String(t||"").trim();let n="";const i=t.indexOf("=");if(i>0){n=t.slice(0,i).trim();t=t.slice(i+1).trim()}
  const parts=t.split("+").map(x=>x.trim()).filter(Boolean);let hl=parts.shift()||"",k=0;const m=hl.match(/^(\d+)\s*[×x]?\s+(.+)$/);if(m){k=+m[1];hl=m[2].trim()}
  const pr=parts.filter(x=>PRIVBY[x]);if(PROTBY[hl])return {n,k,id:hl,pr};if(OSPROT[hl])return {n,k,os:hl,pr};return null}
function bojRadekTxt(r){const p=PROTBY[r.id||(OSPROT[r.os]||{}).b]||{},nm=r.os?(OSPROT[r.os]||{}).n:p.n;
  return `${r.n?r.n+" – ":""}${r.k&&p.u==="houf"?r.k+" × ":r.k>1?r.k+" × ":""}${nm||r.id||r.os}${(r.pr||[]).length?" · "+r.pr.map(i=>(PRIVBY[i]||{}).n||i).join(", "):""}`}
/* rozvinutí na řádky nepřátel {n, druh, pocet, b, pr, os} */
function bojRozvin(list){const out=[];(list||[]).filter(Boolean).forEach(r=>{const os=r.os?OSPROT[r.os]:null,id=os?os.b:r.id,p=PROTBY[id];if(!p)return;
  const pr=[...new Set([...(os?os.pr||[]:[]),...(r.pr||[])])],nm=r.n||(os?os.n:p.n);
  if(p.u==="houf")out.push({n:nm,druh:"houf",pocet:r.k||p.poc||6,b:id,pr,os:r.os||""});
  else{const k=Math.max(1,r.k||1);for(let j=0;j<k;j++)out.push({n:k>1?`${nm} ${j+1}`:nm,druh:p.u,pocet:1,b:id,pr,os:r.os||""})}});return out}
const bojZBest=(t)=>{const s=SETBY[t];if(s)return {np:bojRozvin(s.np),z:s.x,n:s.n};return {np:bojRozvin(String(t||"").split(";").map(bojRadek))}};

/* --- odhad obtížnosti (D&D 2024: rozpočet XP na postavu; nízká / střední / vysoká) --- */
const BXPT=[[50,75,100],[100,150,200],[150,225,400],[250,375,500],[500,750,1100],[600,1000,1400],[750,1300,1700],[1000,1700,2100],[1300,2000,2600],[1600,2300,3100],
  [1900,2900,4100],[2200,3700,4700],[2600,4200,5400],[2900,4900,6200],[3300,5400,7800],[3800,6100,9800],[4500,7200,11700],[5000,8700,14200],[5500,10700,17200],[6400,13200,22000]];
const bojUr={get(){try{return +localStorage.getItem("mm-boj-uroven")||8}catch(e){return 8}},set(v){try{localStorage.setItem("mm-boj-uroven",v)}catch(e){}}};
function bojObt(npc,nh,mom){let xp=0,bez=0,xp0=0;(npc||[]).forEach(o=>{const E=bojEff(o);if(!E||!E.xp){bez++;return}const cel=E.p.xpp?E.xp*(o.max||o.pocet||1):E.xp;xp0+=cel;
    if(!mom){xp+=cel;return}const st=o.stav||[];if(st.includes("prchá")||st.includes("poražen")||st.includes("vzdal se"))return;
    if(o.druh==="houf"){xp+=E.p.xpp?E.xp*(o.pocet||0):(o.pocet>0?E.xp:0);return}if(BOJ.s&&bojSokPadl(BOJ.s,o.id))return;xp+=cel});
  const u=Math.max(1,Math.min(20,bojUr.get())),t=BXPT[u-1].map(x=>x*Math.max(1,nh)),k=xp<t[0]?0:xp<t[1]?1:xp<t[2]?2:xp<t[2]*1.5?3:4,st=["slabší než potyčka","potyčka","těžký boj","smrtelný boj","nad síly družiny"][k];
  const fmt=x=>Math.round(x).toLocaleString("cs-CZ"),mx=Math.max(xp,t[2]*1.5)*1.12,pc=v=>Math.max(0,Math.min(100,v/mx*100)).toFixed(1)+"%";
  return {xp,html:`<span class="bobtm" ${btip(`Potyčka od ${fmt(t[0])} XP · těžký boj od ${fmt(t[1])} · smrtelný od ${fmt(t[2])} · nad síly od ${fmt(t[2]*1.5)}${bez?` · ${bez} bez statblocku nepočítám`:""}`)}><span class="bobtb" style="--a:${pc(t[0])};--b:${pc(t[1])};--c:${pc(t[2])};--d:${pc(t[2]*1.5)}"><i style="left:${pc(xp)}"></i></span>${mom?`<b class="bmomt">Momentum</b> `:""}<b class="bobts bobt${k}">${st}</b> <small>${mom?`zbývá ${fmt(xp)} z ${fmt(xp0)} XP`:`${fmt(xp)} XP`} · pro ${nh} ${nh===1?"postavu":nh<5?"postavy":"postav"} ${u}. úrovně${bez?` · ${bez} bez statblocku`:""}</small></span>`}}
const bojUrSel=()=>`<label class="bur">úroveň družiny <input type="number" min="1" max="20" data-bur value="${bojUr.get()}" aria-label="Úroveň družiny"></label>`;
function bojObtForm(){const f=document.getElementById("bojform"),el=document.getElementById("bobt");if(!f||!el)return;
  const nh=[...f.querySelectorAll('[name="hn"]')].filter(x=>x.value.trim()).length||1;
  const npc=[...f.querySelectorAll("#bfn .bsr")].map(r=>{const v=q=>{const e=r.querySelector(`[name="${q}"]`);return e?e.value:""};const b=v("nb")||((bojBest(v("nn"))||{}).id||"");
    return b?{b,druh:v("nd"),pocet:+v("np")||1,max:+v("np")||1,pr:v("npr")?v("npr").split(","):[]}:v("nn").trim()?{}:null}).filter(Boolean);
  el.innerHTML=npc.length?bojObt(npc,nh).html:""}

/* --- kritická zranění na kliknutí (Artikule › Rány) --- */
const BKZ=["Lehká","Těžká","Vážná","Smrtelná"],BKZT=["trvá do konce příštího tahu","trvá do vyléčení (Medicine)","je trvalá, není-li včas vyléčena zkušeným mágem či prvotřídním felčarem","bezvědomí a 2 neúspěšné deathsaves; přežije-li, následek je trvalý"];
const BKRIT={
  fyz:{n:"Fyzické (zbraň, Force, Thunder)",mista:{6:"Hlava",3:"Trup",4:"Trup",5:"Trup",2:"Paže",1:"Nohy"},t:{
    Hlava:["Zvonění v hlavě – bez Reakce, nevýhoda na příští hod","Otřes mozku – Exhaustion, nevýhoda na INT skillcheck","Znetvoření – nevýhoda na Perception + krvácení D8","Rozpoltěná lebka"],
    Trup:["Vyražený dech – poloviční pohyb","Krvácivá rána – krvácení D6","Polámaná žebra – nevýhoda na CON saves + krvácení D8","Proklaté útroby"],
    "Paže":["Rána přes prsty – upustíš, co držíš","Zlomenina – nevýhoda na STR/AGI skillcheck","Rozdrcené předloktí – nevýhoda na útoky + krvácení D8","Useknutá paže"],
    Nohy:["Podražení – Prone","Zlomená noha – poloviční pohyb","Přeťatá tepna – pohyb = 10 stop + krvácení D8","Useknutá noha"]}},
  ohen:{n:"Oheň a blesk",t:["Vzplanutí – hoříš D4","Popáleniny – Exhaustion","Vypálené oči – nevýhoda na Perception a útoky na dálku","Uhoření zaživa"]},
  mraz:{n:"Mráz",t:["Ztuhlé údy – poloviční pohyb","Zkřehlé údy – nevýhoda na AGI saves","Prsty z ledu – nevýhoda na attack rolls","Zamrzlé srdce"]},
  jed:{n:"Kyselina a jed",t:["Dávení – bez Reakce a Bonusové akce","Žíravina – nevýhoda na CON saves","Černá krev – Poisoned","Selhání těla"]},
  svata:{n:"Svatá a prokletá",t:["Předzvěst Závoje – Pokušení padá na 1–4 při příštím hodu","Předtucha smrti – max. HP −10","Cejch Závoje – Pokušení padá na 1–3","Rozervaná duše – nelze vzkřísit běžnými kouzly"]},
  psych:{n:"Psychické",t:["Zmatení – příští útok míří na náhodný cíl","Pomatení – nevýhoda na WIS saves","Hlasy v hlavě – nevýhoda na INT/WIS skillchecky a concentration","Šílenství"]},
  drak:{n:"Drak",mista:{6:"Hlava",3:"Trup",4:"Trup",5:"Trup",2:"Křídla",1:"Nohy a ocas"},t:{
    Hlava:["Ohlušení – bez Reakce do konce příštího tahu","Rozštípnutý čelní štít – nevýhoda na Perception","Vypíchnuté oko – nevýhoda na Perception (zrak) a útoky na dálku","Proražená lebka"],
    Trup:["Vyražený dech – zvláštní schopnost nelze použít do konce příštího tahu","Proražený vzdušný vak – poloviční rychlost letu, nemůže plachtit; po minutě letu 1 úroveň Exhaustion","Prolomený hrudník – krvácení 2D8","Probodené srdce"],
    "Křídla":["Roztřepená blána – poloviční rychlost letu do konce příštího tahu","Roztržená blána – nemůže vzlétnout, za letu klesá o 30 stop za tah","Zlomená dutá kost – uzemněn, hojí se měsíce","Utržené křídlo – zřítí se"],
    "Nohy a ocas":["Podražení – Prone","Přeťatá šlacha – poloviční pohyb, vzlet jen ze svahu nebo skály","Uťatý ocas – ztrácí útok ocasem, nevýhoda na AGI saves","Rozdrcená pánev"]}}};
const BKS={druh:"fyz",rany:0,pod:0,vys:"",kdo:""};
function bojKritHod(){const K=BKRIT[BKS.druh]||BKRIT.fyz,d=bK(10),mod=(+BKS.rany||0)+Math.floor(Math.max(0,+BKS.pod||0)/5),c=d+mod,i=c<=5?0:c<=9?1:c<=12?2:3;
  let misto="",txt,m0="";if(K.mista){const z=bK(6);m0=K.mista[z];misto=m0;txt=K.t[misto][i];misto=`${misto} <small>(Závoj ${z})</small>`}else txt=K.t[i];
  let dat="";try{dat=partyDate()}catch(e){}BKS.last={t:`${BKZ[i]}${m0?" ("+m0+")":""}: ${txt}`,d:dat,druh:BKS.druh};
  BKS.vys=`<p class="bkv"><b class="bkz bkz${i}">${BKZ[i]}</b> <small>d10 ${d}${mod?` + ${mod}`:""} = ${c}</small>${misto?` · ${misto}`:""}</p><p class="bkv2"><b>${besc(txt)}</b>${BKS.kdo?` <small>(${besc(BKS.kdo)})</small>`:""}</p>
    <p class="rsmall">${BKZ[i]} zranění ${BKZT[i]}.${i>=2?" Zahojená zanechá jizvu (výhoda na Intimidation, nevýhoda na Persuasion při svádění).":""}${i>=1?" Po boji CON save (s felčarem s výhodou), jinak 1 úroveň vyčerpání denně, dokud neuspěje.":""} Krvácení pokračuje každé kolo až do ošetření.</p>`}
function bojKritPanel(){const s=BOJ.s||{},K=bojKritPC(),pc=[...new Set([...(s.hraci||[]).map(h=>h.n),...PARTY.map(p=>p.n.replace(/^✦\s*/,""))])].filter(Boolean),L=BKS.komu&&K[BKS.komu]||[];
  return `<section class="bkrit" aria-label="Hod na kritické zranění">
    <div class="bkf"><label>Komu <select data-bkkomu><option value="">— neukládat —</option>${pc.map(n=>`<option${BKS.komu===n?" selected":""}>${besc(n)}</option>`).join("")}</select></label><label>Druh <select data-bkd>${Object.entries(BKRIT).map(([k,v])=>`<option value="${k}"${BKS.druh===k?" selected":""}>${v.n}</option>`).join("")}</select></label>
      <label>neléčená kritická zranění <input type="number" min="0" max="9" name="bkr" data-bkr value="${+BKS.rany||0}"></label>
      <label>HP pod nulou <input type="number" min="0" max="200" name="bkp" data-bkp value="${+BKS.pod||0}"></label>
      <button type="button" class="gbtn" data-bkhod>Hodit</button></div>${BKS.komu?`<div class="bkl"><small>Neléčená kritická zranění – ${besc(BKS.komu)}:</small>${L.length?`<ul>${L.map((x,j)=>`<li>${besc(x.t)} <small>${besc(x.d||"")}</small> <button type="button" class="gbtn ghost" data-bkheal="${j}">vyléčeno</button></li>`).join("")}</ul>`:" <small>žádná</small>"}</div>`:""}${BKS.vys}</section>`}

/* --- přidání nepřátel do boje odjinud (osoba, Výprava): rovnou do běžícího boje, jinak do rozestavení --- */
function bojPridejZvenku(rows,z){if(!rows.length)return;
  if(BOJ.s&&(BOJ.s.aktivni||BOJ.s.priprava)){if(BOJ.s.priprava&&z)bojZmen(s=>{s.lead=z});bojZmen(s=>{s.npc=s.npc||[];rows.forEach(x=>{s.nid=(s.nid||s.npc.length)+1;const o={id:"n"+s.nid,n:x.n,druh:x.druh};if(x.b)o.b=x.b;if((x.pr||[]).length)o.pr=x.pr;if(x.os)o.os=x.os;if(o.druh==="houf")Object.assign(o,{pocet:x.pocet||1,max:x.pocet||1,velitel:true});s.npc.push(o)})});mmHlasG(`Přidáno do běžícího boje: ${rows.map(x=>x.n).join(", ")}.`,5000)}
  else try{sessionStorage.setItem("mm-boj-pred",JSON.stringify({npc:rows,z}))}catch(e){}
  navTo("#boj")}
function bojOsobaGM(pid){const o=OSPROT[pid];if(!o)return "";const p=PROTBY[o.b];if(!p)return "";
  return `<details class="gmres bosgm"><summary>Statblock v boji <span>jen pro vypravěče</span></summary><p><b>${besc(p.n)}</b>${(o.pr||[]).length?" · "+o.pr.map(i=>besc((PRIVBY[i]||{}).n||i)).join(", "):""} <button type="button" class="gbtn ghost" data-bosboj="${besc(pid)}">+ do boje</button></p>${bojRefTxt(p)}<div class="bsb">${p.b||p.h}</div></details>`}
document.addEventListener("click",e=>{const b=e.target.closest("[data-bosboj]");if(!b)return;const o=OSPROT[b.dataset.bosboj];if(!o)return;bojPridejZvenku(bojRozvin([{os:o.id,pr:[]}]),`${o.n} – nepřítel ze Zemských desek.`)});
const BOJ={s:null,v:-1,poll:null};
const bojDB=window.MMDB?{nacti:()=>MMDB.bojNacti(),verze:()=>MMDB.bojVerze(),uloz:(s,v)=>MMDB.bojUloz(s,v),obsad:(i,h)=>MMDB.bojObsad(i,h),hod:(h,v)=>MMDB.bojHod(h,v),hrac:(h,p,v)=>MMDB.bojHrac(h,p,v),utok:(h,u)=>MMDB.bojUtok(h,u)}
  :GMV?{nacti:async()=>{try{return JSON.parse(localStorage.getItem("mm-boj")||"null")}catch(e){return null}},
        verze:async()=>{try{return (JSON.parse(localStorage.getItem("mm-boj")||"null")||{}).verze||0}catch(e){return 0}},
        uloz:async s=>{const v=(BOJ.v>0?BOJ.v:0)+1;try{localStorage.setItem("mm-boj",JSON.stringify({stav:s,verze:v}))}catch(e){}return v},obsad:null}:null;
/* přihlášený hráč (stránka Hra): {k: karta, t: token relace, n: jméno} */
const JA={get(){try{return JSON.parse(localStorage.getItem("mm-hrac")||"null")}catch(e){return null}},set(v){try{v?localStorage.setItem("mm-hrac",JSON.stringify(v)):localStorage.removeItem("mm-hrac")}catch(e){}}};
const bojJa={get(){const j=JA.get();if(j&&j.k&&typeof KARTBY!=="undefined"){const K=KARTBY[j.k],h=BOJ.s&&(BOJ.s.hraci||[]).find(x=>x.k===j.k||(K&&x.n===K.n));if(h)return h.n;if(K)return K.n}try{return localStorage.getItem("mm-boj-ja")||""}catch(e){return ""}},set(n){try{n?localStorage.setItem("mm-boj-ja",n):localStorage.removeItem("mm-boj-ja")}catch(e){}}};
let bojHlasen="",BKON=false,BODP=false;const BHROTV=new Set();
const besc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function bojSloty(s){
  /* sloty se střídají mezi družinou a vypravěčem; začíná strana s nejlepším hodem (při shodě družina) */
  const n=(s.hraci||[]).length,dm=+s.dm||0,hod=s.hod!=null?+s.hod:Math.max(-99,...(s.hraci||[]).map(x=>+x.hod||0)),a=[];
  for(let i=0;i<n;i++){const hs={t:"h",hod},ns={t:"n",hod:dm};if(hod>=dm)a.push(hs,ns);else a.push(ns,hs)}
  return a}
const bojUzito=(s,id)=>Object.values(s.obsazeni||{}).filter(x=>x===id).length;
const bojJm=(s,id)=>{const h=(s.hraci||[]).find(x=>x.id===id);if(h)return h.n;const n=(s.npc||[]).find(x=>x.id===id);return n?n.n:""};
const bojSpoj=o=>o.str==="h";
/* načtení stavu boje: starší odpověď (dotaz odešel před naším uložením) ani načtení během čekajícího uložení vypravěče
   nesmí přepsat novější stav v prohlížeči – jinak by se právě zaškrtnutá reakce, stav apod. na chvíli „vrátily“ */
async function bojNacti(){if(!bojDB)return;try{const r=await bojDB.nacti();const v=r?r.verze:0;if(BOJ.v>0&&v<BOJ.v)return false;if(BOJ.v>0&&(GMV?(BZ.q.length||BZ.beh):BOJ.zapis>0))return false;if(v!==BOJ.v){const old=BOJ.v>0?BOJ.db:null;BOJ.s=r?r.stav:null;BOJ.db=BOJ.s;BOJ.v=v;try{bojHracDiff(old,BOJ.s)}catch(e){}if(GMV)setTimeout(bojUtokyNove,0);return true}}catch(e){}return false}
/* vypravěč: co hráči změnili z telefonu (stavy, kryt, hody proti smrti, připravená akce) – hláška a záznam boje */
function bojHracDiff(a,b){if(!GMV||!a||!b||!b.aktivni)return;(b.hraci||[]).forEach(h=>{const o=(a.hraci||[]).find(x=>x.id===h.id);if(!o)return;const t=[];
  if(JSON.stringify(o.ds||null)!==JSON.stringify(h.ds||null)){const d=h.ds;
    t.push(!o.ds&&d?"padl na 0 HP – hod na kritické zranění a 1 úroveň vyčerpání":!d?"zase na nohou":d.st==="mrtev"?"třetí neúspěch hodu proti smrti – umírá":d.st==="stab"?"stabilizován":`hody proti smrti: úspěchy ${d.u}/3, neúspěchy ${d.n}/3`)}
  const s0=o.stav||[],s1=h.stav||[];s1.filter(x=>!s0.includes(x)).forEach(x=>t.push(x));s0.filter(x=>!s1.includes(x)).forEach(x=>t.push("už ne "+x));
  if((+o.kryt||0)!==(+h.kryt||0))t.push(h.kryt?`kryt +${h.kryt}`:"bez krytu");
  {const K=bojKartaH(h);if(K&&(bojHpPC(o,K)!==bojHpPC(h,K)||(+o.thp||0)!==(+h.thp||0)))t.push(`HP ${bojHpPC(o,K)} → ${bojHpPC(h,K)}${h.thp?` (+${h.thp} dočasné)`:""}`)}
  const r0=(a.ready||{})[h.id],r1=(b.ready||{})[h.id];if(r1&&r1!==r0)t.push("připravená akce: "+r1);else if(r0&&!r1&&(b.reak||{})[h.id]&&!(a.reak||{})[h.id])t.push("spustil připravenou akci");
  if(t.length){mmHlasG(`${h.n}: ${t.join(", ")}.`,5000);bojLog(h.id,{n:"Z telefonu",zt:t.join(", ")},h.n)}})}
/* příprava boje: tatáž stránka jako boj – družina s poli pro hody iniciativy, nepřátelé jako karty, pak „Začít boj“ */
const bojBestHod=s=>{const v=(s.hraci||[]).map(h=>h.hod).filter(x=>x!==""&&x!=null&&!isNaN(+x)).map(Number);return v.length?Math.max(...v):null};
function bojNovaPriprava(z){const st=JSON.parse(JSON.stringify(z||{}));Object.keys(z).forEach(k=>delete z[k]);if(st.zbrane)z.zbrane=st.zbrane;
  const jm=(st.hraci&&st.hraci.length?st.hraci.map(h=>h.n):PARTY.map(p=>p.n.replace(/^✦\s*/,""))).filter(Boolean);
  Object.assign(z,{priprava:true,aktivni:false,kolo:1,tah:0,obsazeni:{},npc:[],nid:0,dm:null,hraci:(jm.length?jm:["","",""]).map((n,i)=>({id:"h"+(i+1),n,hod:null}))});{const pr=bojProsPocasi();if(pr.length)z.prostr=pr}
  let x=null;try{x=JSON.parse(sessionStorage.getItem("mm-boj-pred")||"null");sessionStorage.removeItem("mm-boj-pred")}catch(e){}
  if(x&&x.npc&&x.npc.length){bojPridejNpc(z,x.npc.map(q=>{const p=q.b?PROTBY[q.b]:bojBest(q.n);return Object.assign({druh:"sok",pocet:6,pr:[]},q,p&&!q.b?{b:p.id,druh:p.u,pocet:p.poc||q.pocet}:{})}));if(x.z)z.lead=x.z;bojDmHod(z)}}
/* prostředí: vypravěč přepíná, hráči vidí zapnuté; nová příprava si vezme vítr, liják, ranní mlhu a hluboký sníh z počasí */
function bojProsHtml(s,gm){const P=bojPros(s);if(!gm&&!P.length)return "";
  return `<div class="bpros" role="group" aria-label="Prostředí boje"><span class="lbl">Prostředí</span>${(gm?Object.keys(BPROS):P).filter(k=>BPROS[k]).map(k=>{const p=BPROS[k],on=P.includes(k);
    return gm?`<button type="button" data-bpros="${k}" aria-pressed="${on}" ${btip(p[3])}>${bi(p[0])}<span>${p[1]}</span></button>`:`<span class="bprosc" ${btip(p[3])}>${bi(p[0])}<span>${p[1]}</span></span>`}).join("")}</div>`}
function bojProsPocasi(){let X,P;try{X=hraX();P=dialPoc(X.today)}catch(e){return []}if(!P)return [];const h=X.H==null?12:X.H%24,o=[];
  if(P.mlha&&h<12)o.push("mlha");if(P.v>=3)o.push("vitr");if(P.typ==="bourka"||(P.typ&&P.int>=3))o.push("dest");if(P.snih>=3)o.push("teren");return o}
/* hod za nepřátele: d20 + nejlepší iniciativa ze statblocků */
function bojDmHod(z){let best=null;(z.npc||[]).filter(o=>!bojSpoj(o)&&o.b).forEach(o=>{const b=bojIniB(PROTBY[o.b]);if(!best||b>best.b)best={b,n:o.n}});
  const n=z.prekv==="n",d1=bK(20),d2=n?bK(20):null,d=n?Math.min(d1,d2):d1,b=best?best.b:0;z.dm=d+b;
  mmHlasG(`Iniciativa nepřátel: ${n?`překvapení, nevýhoda – d20 ${d1} / ${d2} → ${d}`:`d20 ${d}`} ${bsg(b)}${best?` (${best.n})`:""} = ${d+b}`,4500)}
/* zpět: poslední změny boje (stav i životy), nejvýš 40 kroků */
const BUNDO=[];
function bojUndoPush(o){BUNDO.push(o);if(BUNDO.length>40)BUNDO.shift();const b=document.querySelector("[data-bundo]");if(b)b.disabled=false}
async function bojZpet(){const o=BUNDO.pop();if(!o){mmHlasG("Není co vrátit.",1800);return}
  if(o.hp){bojHp.set(o.hp);if(!o.s){renderBoj();mmHlasG("Vráceny životy.",1800);return}}
  if(o.s)await bojZmen(s=>{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,JSON.parse(o.s))},true);
  mmHlasG("Vráceno o krok zpět.",1800)}
/* změna boje: hned se uplatní a vykreslí, uloží se na pozadí; rychlé série (do 300 ms) jdou jedním uložením.
   Když se verze v databázi mezitím změnila (hráč obsadil slot), načte se aktuální stav a změny se uplatní znovu. */
const BZ={q:[],cek:[],t:0,beh:false};
/* AC nepřátel (se zbrojí a krytem) se ukládá do stavu boje, aby hráč hned viděl, zda zasáhl; číslo AC se hráči nikde neukazuje */
/* zdraví soka pro hráče slovy (0 bez škrábnutí, 1 zraněný, 2 sotva stojí, 3 padl) – čísla zůstávají u vypravěče */
function bojZrSt(o,E){if(!E||o.druh==="houf"||!(E.hp||[]).some(h=>h.max>1))return null;const hv=bojHp.get()[o.id]||[];let c=0,m=0;E.hp.forEach((h,k)=>{m+=h.max;c+=Math.max(0,hv[k]!=null?+hv[k]:h.max)});return c>=m?0:c>m/2?1:c>0?2:3}
const BZRSL=[["bez škrábnutí","bzs0"],["zraněný","bzs1"],["sotva stojí","bzs2"],["padl","bzs3"]];
const bojHpSlovo=n=>{const z=BZRSL[n.zr|0];return n.zr==null||!z?"":`<span class="bzrsl ${z[1]}" ${btip("Jak na tom sok vypadá")}>${z[0]}</span>`};
function bojHpSync(){if(!GMV||!BOJ.s||!(BOJ.s.npc||[]).length)return;if((BOJ.s.npc||[]).some(o=>{try{const z=bojZrSt(o,bojEff(o));return (z??null)!==(o.zr??null)}catch(e){return false}}))bojZmen(()=>{},true)}
{const st=bojHp.set.bind(bojHp);bojHp.set=o=>{st(o);clearTimeout(bojHpSync.t);bojHpSync.t=setTimeout(bojHpSync,400)}}
function bojAcSync(s){if(!GMV)return;(s.npc||[]).forEach(o=>{(o.ef||[]).slice().forEach(e=>{if(!e.src)return;const h=(s.hraci||[]).find(x=>x.id===e.src);if(!h||!(h.stav||[]).includes("soustředí")){bojEfDel(o,e);bojMsg(o.id,`${e.n}: sesilatel ztratil soustředění – kouzlo končí.`)}});try{{const im=o.os&&PORTR.has(o.os)?portU(o.os,"m"):(PROTBY[o.b]&&PROTBY[o.b].img)||"";if(im&&/^art\/(bestiar|portrety)\//.test(im)){if(o.img!==im)o.img=im}else delete o.img}const E=bojEff(o);if(!E)return;const z=bojZrSt(o,E);if(z==null)delete o.zr;else o.zr=z;const ZS=bojZbrStav(o,E),ac=(+ZS.ac||0)+(+o.kryt||0);if(ac>0){if(o.ac!==ac)o.ac=ac}else delete o.ac}catch(e){}})}
function bojZmen(fn0,bezUndo){const fn=z=>{fn0(z);bojAcSync(z)};
  if(!bojDB)return Promise.resolve();
  const s=JSON.parse(JSON.stringify(BOJ.s||{})),pre=JSON.stringify(s);if(!bezUndo)bojUndoPush({s:pre});
  try{fn(s)}catch(e){console.error(e);return Promise.resolve()}
  if(!bezUndo){bojMoralka(s);try{bojTahHook(JSON.parse(pre),s)}catch(e){console.error(e)}}
  s.sloty=bojSloty(s);BOJ.s=s;renderBoj();bojNav();BZ.q.push(fn);
  return new Promise(r=>{BZ.cek.push(r);clearTimeout(BZ.t);BZ.t=setTimeout(bojUlozFrontu,300)})}
async function bojUlozFrontu(){
  if(BZ.beh){clearTimeout(BZ.t);BZ.t=setTimeout(bojUlozFrontu,120);return}
  const q=BZ.q.splice(0),cek=BZ.cek.splice(0);if(!q.length){cek.forEach(r=>r());return}
  BZ.beh=true;const busy=setTimeout(()=>document.documentElement.classList.add("gmbusy"),400);
  const prehraj=(z,fs)=>{fs.forEach(f=>{try{f(z)}catch(e){}});bojMoralka(z);z.sloty=bojSloty(z);return z};
  try{let s=BOJ.s,jinde=false,nv;
    /* hráč mohl mezi kontrolou verze a uložením zapsat z telefonu: databáze vrátí konflikt, načteme a přehrajeme znovu */
    for(let pokus=0;;pokus++){
      const v=bojDB.verze?await bojDB.verze():BOJ.v;
      if(v!==BOJ.v||pokus){const cur=await bojDB.nacti();try{bojHracDiff(BOJ.db,cur&&cur.stav)}catch(e){}s=prehraj(JSON.parse(JSON.stringify((cur&&cur.stav)||{})),q);jinde=true;BOJ.v=cur?cur.verze:0}
      try{nv=await bojDB.uloz(s,BOJ.v);break}catch(e){if(pokus<3&&(e.status===409||/konflikt/i.test(e.message||"")))continue;throw e}}
    BOJ.v=nv;BOJ.db=JSON.parse(JSON.stringify(s));
    if(jinde){BOJ.s=BZ.q.length?prehraj(JSON.parse(JSON.stringify(s)),BZ.q):s;renderBoj();bojNav();setTimeout(bojUtokyNove,50)}}
  catch(e){mmHlasG("Nepodařilo se uložit: "+e.message,6000);BZ.q.length=0;try{BOJ.v=-1;await bojNacti();renderBoj();bojNav()}catch(x){}}
  finally{clearTimeout(busy);document.documentElement.classList.remove("gmbusy");BZ.beh=false;cek.forEach(r=>r())}}
/* dotazování: nejdřív jen verze, celý stav až při změně; s Realtime jen záloha jednou za minutu */
async function bojPoll(){if(!bojDB||BZ.q.length||BZ.beh)return false;BOJ.lp=Date.now();
  try{if(bojDB.verze){const v=await bojDB.verze();if(v===BOJ.v)return false}}catch(e){return false}
  if(BZ.q.length||BZ.beh)return false;return bojNacti()}
const BRT={ok:false,ws:null,zkus:0};
function bojRealtime(){const C=window.MMDB&&MMDB.cfg;if(!C||!C.url||!/\.supabase\.co$/i.test((()=>{try{return new URL(C.url).hostname}catch(e){return ""}})())||!window.WebSocket||BRT.ws||Date.now()<BRT.zkus)return;
  let ws;try{ws=new WebSocket(C.url.replace(/^http/,"ws")+"/realtime/v1/websocket?apikey="+encodeURIComponent(C.key)+"&vsn=1.0.0")}catch(e){return}
  BRT.ws=ws;let ref=0,hb=0;const send=(topic,event,payload)=>{try{ws.send(JSON.stringify({topic,event,payload,ref:String(++ref)}))}catch(e){}};
  ws.onopen=()=>{send("realtime:mm-boj","phx_join",{config:{broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"boj"}]}});hb=setInterval(()=>send("phoenix","heartbeat",{}),25000)};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}if(m.topic!=="realtime:mm-boj")return;
    if(m.event==="phx_reply")BRT.ok=!!(m.payload&&m.payload.status==="ok");
    else if(m.event==="system"&&m.payload)BRT.ok=m.payload.status==="ok"?BRT.ok:false;
    else if(m.event==="postgres_changes")bojPoll().then(ch=>{if(ch){if(curView==="boj")renderBoj();bojNav()}})};
  ws.onclose=()=>{clearInterval(hb);BRT.ok=false;BRT.ws=null;BRT.zkus=Date.now()+60000}}
function bojNav(){const a=document.getElementById("navboj");if(a)a.hidden=!(GMV||(BOJ.s&&BOJ.s.aktivni))}
/* řádek nepřítele či spojence ve formuláři; skrytá pole nesou statblock, přívlastky a osobu */
const BX=`<button type="button" class="bx" data-bdelrow aria-label="Odebrat řádek">×</button>`;
const bojNrow=(ph)=>`<li class="bsr"><input name="nn" placeholder="${ph||"Nepřítel, např. Žoldnéři"}" aria-label="Jméno"${PROTIVNICI.length?' list="bbest" autocomplete="off"':""}><input type="hidden" name="nb"><input type="hidden" name="npr"><input type="hidden" name="nos"><select name="nd" aria-label="Druh">${Object.entries(BDRUH).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select><label class="bpoc"><span>počet</span><input name="np" type="number" min="1" max="12" value="6" aria-label="Počet v houfu"></label>${BX}</li>`;
/* vyplní řádek formuláře z bestiáře (protivník nebo osoba) */
function bojNapoj(row,p,os){const set=(k,v)=>{const e=row.querySelector(`[name="${k}"]`);if(e)e.value=v};
  set("nb",p?p.id:"");set("npr",os?(os.pr||[]).join(","):"");set("nos",os?os.id:"");row.classList.toggle("bmab",!!p);
  if(!p)return;row.querySelector('[name="nn"]').title="Statblock: "+p.n+(os&&(os.pr||[]).length?" · "+os.pr.map(i=>(PRIVBY[i]||{}).n||i).join(", "):"");set("nd",p.u);if(p.poc)set("np",p.poc)}
function bojPlnRadek(row,x){const set=(k,v)=>{const e=row.querySelector(`[name="${k}"]`);if(e)e.value=v};
  set("nn",x.n||"");set("nd",x.druh||"sok");set("np",x.pocet||6);set("nb",x.b||"");set("npr",(x.pr||[]).join(","));set("nos",x.os||"");row.classList.toggle("bmab",!!x.b)}
function bojRadky(box){return box?[...box.querySelectorAll(".bsr")].map(r=>{const v=k=>{const e=r.querySelector(`[name="${k}"]`);return e?e.value.trim():""};
  const nm=v("nn"),os=v("nos")||((bojOsoba(nm)||{}).id||""),b=v("nb")||(os?(OSPROT[os]||{}).b:"")||((bojBest(nm)||{}).id||"");
  return {n:nm,druh:v("nd")||"sok",pocet:+v("np")||1,b:PROTBY[b]?b:"",pr:(v("npr")||(os?(OSPROT[os].pr||[]).join(","):"")).split(",").filter(x=>PRIVBY[x]),os:os&&OSPROT[os]?os:""}}).filter(x=>x.n):[]}
const bojNpc=(x,id,str)=>Object.assign({id,n:x.n,druh:x.druh},str?{str}:{},x.b?{b:x.b}:{},(x.pr||[]).length?{pr:x.pr}:{},x.os?{os:x.os}:{},x.druh==="houf"?{pocet:x.pocet||1,max:x.pocet||1,velitel:true}:{});
function bojSetup(){
  const p=BOJ.s||{},hr=(p.hraci&&p.hraci.length?p.hraci.map(h=>h.n):PARTY.map(x=>x.n)).concat(["","","",""]).slice(0,Math.max(4,(p.hraci||PARTY).length));
  const hrow=n=>`<li class="bsr"><input name="hn" placeholder="Jméno postavy" value="${besc(n)}" aria-label="Jméno postavy">${BX}</li>`;
  const roll=(nm,t,s)=>`<label class="broll"><span class="brt">${t}</span><span class="brd"><input name="${nm}" type="number" inputmode="numeric" required min="-10" max="50" placeholder="–"></span><small>${s}</small></label>`;
  return `<div class="bojtit"><h2 class="arttitle">Boj</h2><p class="bojlead">Rozestav obě strany, zapiš hody iniciativy a vytrub do boje.</p></div>
    <details class="bojjak"><summary>Jak se rozdělují sloty</summary><p>Hráči hodí <b>d20 + Obratnost</b>, vypravěč jednou za nepřítele s nejlepší iniciativou. Družina i nepřátelé dostanou tolik slotů, kolik je hráčů. Sloty se střídají – družina, nepřátelé, družina… – a začíná strana s vyšším hodem (při shodě družina). Houf pacholků i pacholek jednají 1× za kolo, sok až 2×, zhoubce až 3×.</p></details>
    <form class="bojform" id="bojform">
      <div class="bcamps">
        <fieldset class="bcamp bch"><legend>Družina</legend>${roll("hod","Nejlepší hod družiny","d20 + Obratnost")}
          <ol class="brows" id="bfh">${hr.map(hrow).join("")}</ol><button type="button" class="badd" data-badd="h">+ Přidat postavu</button>${PARTY.length?`<button type="button" class="badd" data-bdruz title="Nahradí seznam postavami z karet družiny">Načíst družinu z karet</button>`:""}
          <div class="bspoj"><span class="bspt">Spojenci (NPC)</span><ol class="brows" id="bfs"></ol><button type="button" class="badd" data-badd="s">+ Přidat spojence</button></div></fieldset>
        <div class="bvs" aria-hidden="true"><span>proti</span></div>
        <fieldset class="bcamp bcn"><legend>Nepřátelé</legend>${roll("dm","Tvůj hod za nejlepšího","d20 + Obratnost")}<button type="button" class="badd bdmhod" data-bdmhod ${btip("Hodí d20 + nejlepší iniciativu ze statblocků nepřátel ve formuláři")}>🎲 Hodit za nepřátele</button>
          <ol class="brows" id="bfn">${bojNrow()}${bojNrow()}</ol><button type="button" class="badd" data-badd="n">+ Přidat nepřítele</button>
          <div class="bskup">${bojSkupSel("data-bskup","Načíst setkání nebo skupinu…")}<button type="button" class="badd" data-bskupuloz>Uložit jako setkání</button>${Object.keys(bojSkup()).length?`<button type="button" class="badd" data-bskupdel>Smazat skupinu z prohlížeče…</button>`:""}</div>
          ${PROTIVNICI.length?`<div class="bobtw"><p class="bobt" id="bobt"></p>${bojUrSel()}</div>`:""}</fieldset>
      </div>
      <button type="submit" class="gbtn bstart">⚔ Začít boj</button></form>${bojBestDl()}${bojBestiar()}${bojPravidla()}`}
