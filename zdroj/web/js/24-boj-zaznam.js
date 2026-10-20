/* ===== Boj: herní záznam ve třetím sloupci (2026-10-18) – KDO · CO · KOMU, hozené kostky s výsledky a kostka Závoje =====
   Zdroje: vypravěč – záznam boje (BLOGG: hody nepřátel, vyhodnocení útoků hráčů, životy) a hody z karet (HODY);
   hráč – veřejný záznam boje (s.zaz) a hody z karet. Útok hráče z telefonu je v hodech z karet (kostky, Závoj, zranění)
   i ve vyhodnocení vypravěče (zásah, vedle) – záznam je spojí do jednoho řádku. Volba u Pokušení (přijato / odmítnuto)
   se připíše k hodu, ke kterému patří. Hráč u nepřátel vidí jen výsledek: nikdy jejich kostky, Závoj, AC ani životy. */
const BZ_OKNO=10*60*1000;
/* jedna kostka: d20 s přirozenou 20 / 1 zvýrazněnou, zahozená kostka (výhoda, nevýhoda) přeškrtnutá, kostka Závoje vínová */
const bzK=(s,v,c)=>`<span class="bzk bzk${s===20?"20":s===6&&c&&c.includes("bzkz")?"z":""}${s===20&&+v===20?" bzkmax":s===20&&+v===1?" bzkmin":""}${c?" "+c:""}" role="img" aria-label="k${s}: ${besc(v)}${c&&c.includes("bzkx")?" (nepočítá se)":""}">${besc(v)}</span>`;
const bzSk=(n,s,vals)=>`<span class="bzkg"><small>${n}k${s}</small>${vals.map(v=>{const x=String(v).trim(),dr=x.startsWith("~");return bzK(+s,dr?x.slice(1):x,dr?"bzkx":"")}).join("")}</span>`;
/* text hodu („d20 14 / 8 (výhoda) +5 = 19“, „1d8 [6] + 3“, „2d6(4+6)+3“) → kostky jako žetony, součet tučně */
function bzTxt(t){let h=besc(String(t||""));
  h=h.replace(/\bd20 (\d+)( \(ručně\))?(?:\s*\/\s*(\d+)(?: \((výhoda|nevýhoda)\))?)?/g,(m,a,ru,b,adv)=>{a=+a;if(b==null)return `<span class="bzkg">${bzK(20,a)}${ru?"<small>ručně</small>":""}</span>`;b=+b;
    const k=adv==="výhoda"?(a>=b?0:1):adv==="nevýhoda"?(a<=b?0:1):-1;return `<span class="bzkg">${bzK(20,a,k===1?"bzkx":"")}${bzK(20,b,k===0?"bzkx":"")}${adv?`<small>${adv}</small>`:""}</span>`});
  h=h.replace(/(\d+)d(\d+)(?:k[hl]\d+)? \[([^\]]+)\]/g,(m,n,s,v)=>bzSk(n,s,v.split(/,\s*/)));
  h=h.replace(/(\d*)d(\d+)\((\d+(?:\+\d+)*)\)/g,(m,n,s,v)=>bzSk(n||1,s,v.split("+")));
  return h.replace(/= (−?-?\d+)/g,"= <b class=\"bztot\">$1</b>")}
const bzMaKostky=t=>/\bd20 \d|\d+d\d+(?:k[hl]\d+)? \[|\d*d\d+\(\d/.test(String(t||""));
const bzCas=t=>{try{return new Date(t).toLocaleTimeString("cs-CZ",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
/* osoba v záznamu: postava podle id nebo jména, jinak jen jméno */
function bzOs(s,id,n){const o=id?bojCilO(s,id):null;if(o)return {id:o.id,o,n:o.n};const h=n?(s.hraci||[]).find(x=>x.n===n):null;return h?{id:h.id,o:h,n:h.n}:n?{n}:null}
const bzNepr=(s,q)=>!!(q&&q.o&&q.o.druh&&!bojSpoj(q.o));
const bzZav=(d,r,txt)=>d?{d:+d,r:r==="0"?"":r||(+d<=2?"pok":+d>=5?"poz":""),txt:txt||""}:null;
/* --- záznam vypravěče (BLOGG) → řádek --- */
function bzZBlogg(s,x,i){const o=x.o,A0=o.ai!==undefined?(o.ai?bzOs(s,o.ai,o.an):null):bzOs(s,x.id,x.kdo);let C=o.ci||o.cn||o.cil?bzOs(s,o.ci,o.cn||o.cil):null,A=A0;
  if(!A&&C){A=C;C=null}if(A&&C&&A.id&&A.id===C.id)C=null;
  const e={t:o.t||0,tg:o.t||0,k:o.k,A,C,co:(o.n||"")+(o.un?` (${o.un})`:""),rows:[],pozn:[],src:"g",i,undone:!!o.undone};
  if(o.pre&&!o.undone)e.und=`<button type="button" class="blund" data-blzpet="${i}" ${btip("Vrátit boj do stavu před tímto krokem (i všechno pozdější): pořadí a stavy, životy nepřátel i karty postav")}>↶</button>`;
  else if(o.und&&!o.undone&&!(BHIST.length&&BHIST[0].t<(o.t||0)-30))e.und=`<button type="button" class="blund" data-blund="${i}" ${btip(o.und.poc?"Vrátit padlé pacholky do houfu":`Vrátit životy ${o.und.nov} → ${o.und.old}`)}>↶</button>`;
  const h=o.hod;
  if(h){const dd=h.dd||[h.d],k=dd.length>1?(h.adv>0?(dd[0]>=dd[1]?0:1):(dd[0]<=dd[1]?0:1)):0,zb=h.b-(h.pres||0);
    e.rows.push({l:"útok",h:`<span class="bzkg">${dd.map((v,j)=>bzK(20,v,dd.length>1&&j!==k?"bzkx":"")).join("")}${dd.length>1?`<small>${h.adv>0?"výhoda":"nevýhoda"}</small>`:""}</span> ${bsg(zb)}${h.pres?` <small>přesila</small> +${h.pres}`:""} = <b class="bztot">${h.tot}</b>${o.pcAC!=null?` <small>proti AC ${o.pcAC}</small>`:""}`});
    if(h.advWhy)e.pozn.push(`${h.adv>0?"výhoda":"nevýhoda"}: ${h.advWhy}`);if(h.kryt)e.pozn.push(`cíl za ${h.kryt===5?"tříčtvrtečním":"polovičním"} krytem (AC +${h.kryt})`);
    e.vys=h.krit?["kritický zásah","bzkr"]:h.mis?["vedle – přirozená 1","bzmis"]:o.pcAC!=null?(o.pcHit?["zásah","bzhit"]:["vedle","bzmis"]):null}
  else if(o.dc)e.vys=[`${String(o.dc)}`,"bzdc"];
  if(o.res&&!e.vys)e.vys=o.res==="krit"?["kritický zásah","bzkr"]:o.res==="vedle"?["vedle","bzmis"]:["zásah","bzhit"];
  if(o.sav)e.pozn.push(o.sav);
  const U=o.uh,D=U&&U.det;
  if(D){const dd=D.d2!=null&&D.v?[D.d1,D.d2]:[D.d1!=null?D.d1:U.d],k=dd.length>1?(D.v>0?(dd[0]>=dd[1]?0:1):(dd[0]<=dd[1]?0:1)):0;
    e.rows.push({l:"útok",h:`<span class="bzkg">${dd.map((v,j)=>bzK(20,v,dd.length>1&&j!==k?"bzkx":"")).join("")}</span> ${bsg(D.b!=null?D.b:U.hod-(U.d||0))} = <b class="bztot">${U.hod}</b>`});
    if(D.zx)e.rows.push({l:"zranění",h:`${bzTxt(D.zx)} = <b class="bztot">${U.dmg}</b>`});if(D.zav)e.zav=bzZav(D.zav.d,D.zav.r)}
  else if(U&&U.hod!=null&&!U.det)e.rows.push({l:"útok",h:`${U.d?`<span class="bzkg">${bzK(20,U.d)}</span> ${bsg(U.hod-U.d)} = `:""}<b class="bztot">${U.hod}</b>${U.adv?` <small>${U.adv>0?"výhoda":"nevýhoda"}</small>`:""}`,ut:1});
  if(o.zr){e.zr={t:o.zr.t,zt:o.zr.zt};const xx=String(o.zr.x||"");if(bzMaKostky(xx))e.rows.push({l:"zranění",h:`${bzTxt(xx)} = <b class="bztot">${o.zr.t}</b>`});else if(xx)e.pozn.push(xx.replace(/^z (\d+)/,"hozeno $1"));if(o.zr.pol)e.pozn.push("při úspěšné záchraně obvykle polovina")}
  if(o.zt&&!(o.zr&&o.zr.zt===o.zt)&&!U){if(bzMaKostky(o.zt))e.rows.push({l:"",h:bzTxt(o.zt)});else e.pozn.push(o.zt)}
  if(o.kon)e.pozn.push(o.kon);if(o.pcAuto)e.pozn.push("odečteno z karty: "+o.pcAuto);
  if(o.zav)e.zav={d:o.zav.d,r:o.zav.r,txt:o.zav.txt||""};
  if(o.zvk&&!o.zvk.ok&&typeof bojZvKomHtml==="function")e.rows.push({l:"",h:bojZvKomHtml(i,o.zvk)});
  return e}
/* --- hod z karty (HODY) → řádek; „Útok – Dlouhý meč → Rotmistr“: cíl za šipkou --- */
function bzZHod(s,h){const m=String(h.co||"").match(/^(.*?)\s+→\s+(.+)$/),co=m?m[1]:String(h.co||""),C=m?bzOs(s,null,m[2]):null;
  const e={t:Date.parse(h.cas)||0,tg:GMV?(BHSEEN[h.id]||(BHSEEN[h.id]=Date.now())):0,A:bzOs(s,null,h.kdo),C,co,rows:[],pozn:[],src:"h",h,skryty:!!h.skryty};
  String(h.txt||"").split(" · ").forEach(p=>{p=p.trim();if(!p)return;if(bzMaKostky(p)||/=\s*-?\d+/.test(p)){const zr=/^zranění\s+/i.test(p);e.rows.push({l:zr?"zranění":e.rows.length?"":/^Útok/.test(co)?"útok":"hod",h:bzTxt(zr?p.replace(/^zranění\s+/i,""):p)})}
    else if(!/^(kritický zásah|minutí)$/.test(p))e.pozn.push(p)});
  if(h.krit)e.vys=["kritický zásah","bzkr"];else if(h.mis)e.vys=["vedle – přirozená 1","bzmis"];else if(h.tot!=null&&!/^(Zranění|Léčení)/.test(co))e.vys=[String(h.tot),"bztotv"];
  if(h.tot!=null&&/^(Zranění|Léčení)/.test(co))e.zr={t:h.tot,zt:"",lec:/^Léčení/.test(co)};
  if(h.zav)e.zav=bzZav(h.zav,h.zr);
  return e}
/* --- veřejný záznam boje (s.zaz) → řádek; hráč u nepřátel vidí jen výsledek --- */
function bzZZaz(s,z,gm){const A=bzOs(s,z.ai,z.a),C=bzOs(s,z.ci,z.c),np=bzNepr(s,A);
  const e={t:z.ts||0,tg:z.ts||0,k:z.k,A,C,co:z.cim||"",rows:[],pozn:[],src:"z",z};
  let v=String(z.v||"");if(np&&!gm)v=v.replace(/\s*\(\d+\)/g,"").replace(/^útok \d+$/,"útok");
  if(v)e.vys=[v,/krit/.test(v)?"bzkr":/vedle/.test(v)?"bzmis":/zásah|padl|zasažen/.test(v)?"bzhit":""];
  if(gm&&z.hod!=null)e.rows.push({l:"útok",h:`<b class="bztot">${z.hod}</b>${z.ac!=null?` <small>proti AC ${z.ac}</small>`:""}`});
  if(z.z>0)e.zr={t:z.z,zt:z.t||""};if(z.ph!=null&&gm)e.pozn.push(`životy ${z.ph}`);
  if(z.zv)e.zav={d:+z.zd||0,r:z.zv,txt:""};/* Požehnání / Pokušení nepřítele: hráč vidí jen výsledek, co se stane, určí vypravěč */
  return e}
/* --- sestavení záznamu: zdroje, spojení útoku hráče s vyhodnocením, volba u Pokušení, kola --- */
function bzZaznam(s,gm){const zac=s.zac||Math.min(...(s.zaz||[]).map(z=>z.ts||Infinity),...BLOGG.map(x=>x.o.t||Infinity),Date.now())-60000;
  const H=(HODY||[]).filter(h=>(Date.parse(h.cas)||0)>=zac-60000).map(h=>bzZHod(s,h));
  let L=[];
  if(gm){const G=BLOGG.map((x,i)=>[x,i]).filter(([x])=>(x.o.t||0)>=zac).map(([x,i])=>bzZBlogg(s,x,i));
    const t0=G.length?Math.min(...G.map(e=>e.t)):Infinity;L=[...G,...(s.zaz||[]).filter(z=>(z.ts||0)<t0-1000).map(z=>bzZZaz(s,z,gm))]}
  else L=(s.zaz||[]).map(z=>bzZZaz(s,z,gm));
  /* útok hráče: hod z telefonu (HODY „Útok – …“) + vyhodnocení (vypravěč: BLOGG s uh, hráč: zaz od postavy) */
  const vzaty=new Set(),utoky=H.filter(e=>/^Útok/.test(e.co)&&e.A);
  L.forEach(e=>{const pc=e.A&&e.A.o&&!e.A.o.druh;if(!pc)return;const U=e.src==="g"?BLOGG[e.i]&&BLOGG[e.i].o.uh:null;if(e.src==="g"&&(!U||U.det))return;
    const cim=U?U.cim:e.co,kand=utoky.filter(h=>!vzaty.has(h)&&h.A.n===e.A.n&&Math.abs(h.t-e.t)<BZ_OKNO&&(U?h.h.tot===U.hod:e.z&&e.z.hu!=null?h.h.tot===e.z.hu:true)&&(!cim||h.co.replace(/^Útok( kouzlem)? – /,"")===cim));
    if(!kand.length)return;const h=kand.sort((a,b)=>Math.abs(a.t-e.t)-Math.abs(b.t-e.t))[0];vzaty.add(h);
    e.rows=[...h.rows,...e.rows.filter(r=>!r.ut&&r.l!=="zranění"),...e.rows.filter(r=>r.l==="zranění"&&!h.rows.some(q=>q.l==="zranění"))];if(!e.zav)e.zav=h.zav;e.pozn=[...h.pozn,...e.pozn];if(!e.C&&h.C)e.C=h.C});
  L=[...L,...H.filter(e=>!vzaty.has(e))].sort((a,b)=>b.t-a.t);
  /* hod zranění z karty (Karty postav) k útoku téže zbraně; volba u Pokušení k hodu, ke kterému patří */
  const pryc=new Set();
  L.forEach((e,j)=>{if(e.src!=="h")return;const co=e.co;
    if(/^Zranění – /.test(co)){const w=co.slice(10),u=L.slice(j+1).find(q=>q.src==="h"&&q.A&&e.A&&q.A.n===e.A.n&&q.co===`Útok – ${w}`&&e.t-q.t<180000&&!q.rows.some(r=>r.l==="zranění"));
      if(u){e.rows.forEach(r=>u.rows.push({l:"zranění",h:r.h}));u.zr=e.zr;pryc.add(e)}}
    else if(/^Pokušení (přijato|odmítnuto)/.test(co)){const p=L.slice(j+1).find(q=>q.A&&e.A&&q.A.n===e.A.n&&q.zav&&q.zav.r==="pok"&&!q.zav.vol&&e.t-q.t<15*60000);
      if(p){const prij=/přijato/.test(co),dv=String(e.h.txt||"").replace(/^.*?:\s*/,"");p.zav.vol=prij?`přijato – ${dv||"bod hříchu"}`:`odmítnuto – ${dv||"komplikace"}`;p.zav.prij=prij;pryc.add(e)}}});
  L=L.filter(e=>!pryc.has(e));
  /* kola: hody z karet zdědí kolo z předchozího záznamu */
  let k0=null;for(let j=L.length-1;j>=0;j--){if(L[j].k!=null)k0=L[j].k;else L[j].k=k0!=null?k0:(s.aktivni?1:null)}
  return L.slice(0,120)}
function bzRadek(e,gm){if(gm&&e.tg&&!e.undone&&bojZaUnd(e.tg))e.undone=true;
  if(gm&&e.tg&&!e.undone&&!e.und&&e.co!=="Vráceno")e.und=`<button type="button" class="blund" data-bzvrat="${e.tg}" data-p="${besc([e.A&&e.A.n,e.co].filter(Boolean).join(" – "))}" ${btip("Vrátit boj do stavu před tímto řádkem (i všechno pozdější)")}>↶</button>`;const med=q=>q&&q.o?(q.o.druh?bojMedN(q.o,"bmini"):bojMedH(q.o,"bmini")):"";
  const os=q=>q&&q.n?(q.id?`<button type="button" class="bzos blfb" data-blf="${besc(q.id)}" ${btip("Jen akce: "+q.n)}>${med(q)}<b>${besc(q.n)}</b></button>`:`<span class="bzos">${med(q)}<b>${besc(q.n)}</b></span>`):"";
  const zr=e.zr&&e.zr.t!=null?`<span class="bzdmg${e.zr.lec?" bzlec":""}${e.vys&&e.vys[1]==="bzmis"?" bzdmgx":""}"${e.vys&&e.vys[1]==="bzmis"?` ${btip("Hozené zranění – útok minul")}`:""}><b>${e.zr.lec?"+":""}${e.zr.t}</b>${e.zr.zt?` ${bikZrTxt(e.zr.zt)}<small>${besc(bojZrCz(e.zr.zt))}</small>`:`<small>${e.zr.lec?"léčení":"zranění"}</small>`}</span>`:"";
  const z=e.zav,zh=z?`<div class="bzz ${z.r==="pok"?"zp":z.r==="poz"?"zb":"zn"}"${z.txt?" "+btip("Z bestiáře: "+z.txt):""}>${bi(z.r==="pok"?"pokuseni":z.r==="poz"?"pozehnani":"zavoj")}<span class="bzzl">Závoj</span>${z.d?bzK(6,z.d,"bzkz"):""}<b>${z.r==="pok"?"Pokušení":z.r==="poz"?"Požehnání":"bez vlivu"}</b>${z.vol?`<span class="bzzv${z.prij?" bzzp":""}">${besc(z.vol)}</span>`:""}</div>`:"";
  return `<li class="bz${e.undone?" blundone":""}${e.skryty?" bzskr":""}${e.vys&&e.vys[1]==="bzkr"?" bzlkr":""}"><div class="bzh">${os(e.A)}<span class="bzco">${besc(e.co)}</span>${e.C?`<i class="bzsip" aria-label="vůči">→</i>${os(e.C)}`:""}<time>${e.skryty?"skrytý · ":""}${bzCas(e.t)}</time>${e.und||""}</div>
    ${e.vys||zr?`<div class="bzv">${e.vys?`<span class="bzvys ${e.vys[1]}">${besc(e.vys[0])}</span>`:""}${zr}</div>`:""}
    ${e.rows.length?`<div class="bzd">${e.rows.map(r=>`<p>${r.l?`<small class="bzdl">${r.l}</small>`:""}<span>${r.h}</span></p>`).join("")}</div>`:""}${e.pozn.length?`<p class="bzp">${e.pozn.map(besc).join(" · ")}</p>`:""}${zh}</li>`}
/* sloupec záznamu (vypravěč i hráč) */
function bojZaznamSloupec(s,gm){const L0=bzZaznam(s,gm),L=BLF?L0.filter(e=>(e.A&&e.A.id===BLF)||(e.C&&e.C.id===BLF)):L0;let k0;
  const li=L.map(e=>{const hd=e.k!=null&&e.k!==k0?`<li class="bzkolo">${e.k}. kolo</li>`:"";if(e.k!=null)k0=e.k;return hd+bzRadek(e,gm)}).join("");
  return `<section class="bzaz"><h3 class="uvh2">${bi("kniha")} Herní záznam${L0.length?` <small>${L0.length}</small>`:""}</h3>${BLF?`<p class="blfc">Jen: <b>${besc(bojJm(s,BLF)||"?")}</b> <button type="button" class="bx" data-blfx aria-label="Zrušit filtr">×</button></p>`:""}
    ${li?`<ol class="bzl">${li}</ol>`:`<p class="rsmall bznic">Zatím prázdný. Sem se zapíše každý hod v boji – kdo, co a vůči komu, kostky s výsledky a kostka Závoje.</p>`}${gm?"":`<p class="rsmall bzhr">U nepřátel vidíš jen výsledek; jejich hody zná vypravěč.</p>`}</section>`}
