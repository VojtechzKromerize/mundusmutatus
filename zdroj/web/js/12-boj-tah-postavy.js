/* ===== automatizace tahu: iniciativa, návrh, začátek a konec tahu, účinky s trváním, záchrany, plošný zásah ===== */
const BAB=["STR","AGI","CON","INT","WIS","CHA"];
const bojTxt=p=>String((p&&(p.b||p.h))||"").replace(/<[^>]+>/g," ").replace(/−/g,"-").replace(/\s+/g," ");
const bojIniB=p=>{const m=bojTxt(p).match(/Iniciativa\s*([+-]\d+)/);if(m)return +m[1];const a=bojAbil(p,"AGI");return a!=null?a:0};
/* záchrana: řádek Záchrany (i „ostatní +0“), jinak modifikátor vlastnosti */
const bojSaveB=(p,ab)=>{const t=bojTxt(p),z=t.match(/Záchrany[^:]*?:?\s*([^·]*)/);if(z){const m=z[1].match(new RegExp("\\b"+ab+"\\s*([+-]\\d+)"));if(m)return +m[1];const o=z[1].match(/ostatní\s*([+-]\d+)/);if(o)return +o[1]}
  const a=bojAbil(p,ab);return a!=null?a:0};
/* Legendární odolnost: ze zdrojů, jinak z textu „Legendární odolnost 1/den“ */
const bojLegMax=E=>{if(!E)return 0;const z=E.zd.find(q=>/legendární odolnost/i.test(q.n));if(z)return z.max;const m=bojTxt(E.p).match(/Legendární odolnost\D{0,6}(\d)\s*\/\s*den/i);return m?+m[1]:0};
const bojLegN=E=>{const z=E&&E.zd.find(q=>/legendární odolnost/i.test(q.n));return z?z.n:"Legendární odolnost"};
const bojLegZb=(n,E)=>{const mx=bojLegMax(E);if(!mx)return 0;const u=(bojZdr.get()[n.id]||{})[bojLegN(E)]||0;return Math.max(0,mx-u)};
/* schopnosti s dobíjením („dobíjí se na 5–6“) */
const bojRecharge=p=>{const t=bojTxt(p),o=[];for(const m of t.matchAll(/([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.()·;|]{2,40}?)\s*\(dobíjí se na (\d)/g))if(!o.some(x=>x.n===m[1].trim()))o.push({n:m[1].trim(),min:+m[2]});
  for(const a of (p&&p.at)||[]){const m=String(a.p||"").match(/dobíjí se na (\d)/);if(m&&!o.some(x=>x.n===a.n))o.push({n:a.n,min:+m[1]})}return o};
const bojRegen=p=>{const t=bojTxt(p);const m=t.match(/Regenerace\.?\s*[^.]*?(\d+)\s*HP/i)||t.match(/regenerace\s*(\d+)\s*HP/i);return m?+m[1]:0};
const BRCH={},BTMSG={},BDMG={};let BPLOS=null;
const bojMsg=(id,t)=>{(BTMSG[id]=BTMSG[id]||[]).push(t);if(BTMSG[id].length>6)BTMSG[id].shift()};
/* kdo by měl jednat ve slotu nepřátel: nejméně využitý, soci a zhoubci před houfy, vyšší iniciativa */
function bojNavrh(s){const sl=s.sloty||bojSloty(s),t=s.tah||0,x=sl[t];if(!x||x.t!=="n"||(s.obsazeni||{})[t])return null;
  const R={zhoubce:0,sok:1,pacholek:2,houf:3};
  const c=(s.npc||[]).filter(n=>!bojSpoj(n)&&!(n.stav||[]).some(q=>q==="prchá"||q==="poražen"||q==="vzdal se")&&!srdNejedna(n.stav)&&(n.druh!=="houf"||n.pocet>0)&&!(n.druh!=="houf"&&bojSokPadl(s,n.id))&&bojUzito(s,n.id)<(BLIM[n.druh]||1));
  c.sort((a,b)=>bojUzito(s,a.id)-bojUzito(s,b.id)||(R[a.druh]??2)-(R[b.druh]??2)||bojIniB(PROTBY[b.b])-bojIniB(PROTBY[a.b]));return c[0]||null}
/* tah: konec předchozího jednajícího a začátek nového (volá se při každé změně boje) */
function bojTahHook(pre,s){const o0=pre.obsazeni||{},o1=s.obsazeni||{},t0=pre.tah||0,t1=s.tah||0,k0=pre.kolo||1,k1=s.kolo||1,id0=o0[t0],id1=o1[t1];
  const posun=k1>k0||(k1===k0&&t1>t0);if(!posun&&!(k1===k0&&t1===t0))return;
  if(posun&&id0)bojKonecTahu(s,id0);if(id1&&(posun||id1!==id0)){if(s.reak&&s.reak[id1]){delete s.reak[id1];if(!Object.keys(s.reak).length)delete s.reak}
    const rd=(s.ready||{})[id1];if(rd){delete s.ready[id1];if(!Object.keys(s.ready).length)delete s.ready;bojMsg(id1,`Připravená akce propadla: ${rd}.`);const hh=(s.hraci||[]).find(x=>x.id===id1);if(hh)mmHlasG(`${hh.n}: připravená akce propadla (${rd}).`,4000)}bojZacatekTahu(s,id1)}}
/* stav z kouzla se záchranou (2026-10-17): Hold Person → ochromen (Paralyzed) apod. Při neúspěšné záchraně dostane cíl stav
   s trváním kouzla; když kouzlo říká „na konci každého tahu hod opakuje“, tracker ho na konci tahu nepřítele hodí sám.
   Soustředěné kouzlo skončí i tehdy, když sesilatel ztratí soustředění (bojAcSync). */
function bojSpStav(cim){if(typeof kSp!=="function"||!KSPD)return null;const nm=String(cim||"").replace(/\s*\(\d+\. st\.\)\s*$/,"").trim(),d=kSp(nm);if(!d)return null;
  const t=String(d.t||""),EN=Object.fromEntries(Object.entries(SRDST).map(([k,v])=>[v.en,k])),st=[];
  t.split(/(?<=\.)\s+/).filter(v=>/neúspěch|jinak|musí uspět/i.test(v)).forEach(v=>{(v.match(/\b(Blinded|Charmed|Deafened|Frightened|Grappled|Incapacitated|Invisible|Paralyzed|Petrified|Poisoned|Prone|Restrained|Stunned|Unconscious)\b/g)||[]).forEach(e=>{const k=EN[e];if(k&&!st.includes(k))st.push(k)})});
  if(!st.length)return null;const h=kTrv(d.d);return {n:d.en||nm,st,op:/na konci každého (?:svého )?tahu[^.]{0,90}(?:opakuje|zopakuje)/i.test(t),k:h?Math.max(1,Math.round(h*600)):1,kon:!!d.ko}}
function bojSpStavDej(s,n,S,u){const h=(s.hraci||[]).find(x=>x.id===u.h),kon=S.kon&&h&&(h.stav||[]).includes("soustředí");
  (n.ef||[]).filter(e=>e.n===S.n).forEach(e=>bojEfDel(n,e));
  S.st.forEach(st=>{const ef={n:S.n,kdy:"kola",k:S.k,kolo:s.kolo||1,tah:s.tah||0,st};if(S.op&&u.plos)ef.op={ab:u.plos.ab,dc:u.plos.dc};if(kon)ef.src=u.h;
    if(!(n.stav||[]).includes(st))n.stav=[...(n.stav||[]),st];(n.ef=n.ef||[]).push(ef)});bojMsg(n.id,`${S.n}: ${S.st.join(", ")}${S.op?` – na konci tahu záchrana ${u.plos.ab} SO ${u.plos.dc}`:""}.`)}
function bojEfDel(n,e){n.ef=(n.ef||[]).filter(x=>x!==e);if(e.st&&!(n.ef||[]).some(x=>x.st===e.st))n.stav=(n.stav||[]).filter(x=>x!==e.st);if(!n.ef.length)delete n.ef}
function bojKonecTahu(s,id){const n=(s.npc||[]).find(x=>x.id===id);if(!n){bojPcKonec(s,id);return}
  {const hot=new Set();(n.ef||[]).slice().forEach(e=>{if(!e.op||hot.has(e.n))return;hot.add(e.n);const E=bojEff(n),b=bojSaveB(E&&E.p,e.op.ab),d=bK(20),t=d+b,ok=t>=e.op.dc;
    bojMsg(id,`${e.n}: záchrana ${e.op.ab} ${t} (d20 ${d} ${bsg(b)}) proti SO ${e.op.dc} – ${ok?"uspěl, kouzlo na něm končí":"neuspěl, trvá dál"}.`);
    if(ok)(n.ef||[]).filter(x=>x.n===e.n).forEach(x=>bojEfDel(n,x))})}
  (n.ef||[]).slice().forEach(e=>{if(e.kdy==="konec"&&e.zac){bojEfDel(n,e);bojMsg(id,`Skončilo: ${e.n}.`)}})}
/* postava: na konci tahu opakovaná záchrana stavu (výzva na telefon; bez karty připomínka), na začátku tahu odpočet kol */
const BOPV={};
function bojPcKonec(s,id){const h=(s.hraci||[]).find(x=>x.id===id);if(!h||!GMV)return;const K=bojKartaH(h),hot=new Set();
  (h.ef||[]).forEach(e=>{if(!e.op||hot.has(e.n))return;hot.add(e.n);const o={hid:h.id,n:e.n,ab:e.op.ab,dc:e.op.dc};
    if(K&&window.MMDB&&MMDB.vyzva)setTimeout(()=>MMDB.vyzva({typ:"zach",ab:o.ab,dc:o.dc,komu:[K.id],pozn:`${e.n}: opakovaná záchrana – úspěch ukončí ${e.st||"účinek"}`.slice(0,200)}).then(v=>{BOPV[+v]=Object.assign(o,{kid:K.id});vyzvyNacti()}).catch(()=>{}),0);
    else bojMsg(id,`${e.n}: na konci tahu záchrana ${o.ab} SO ${o.dc} – úspěch ukončí ${e.st||"účinek"}.`)})}
/* krvácení z kritického zranění (stav „krvácí k6 / k8“): na začátku tahu k6 / k8 HP, bez odolností, jednou za kolo */
function bojKrvaceni(s,n){const st=(n.stav||[]).find(t=>/^krvácí k[68]$/.test(t));if(!st||!GMV)return null;const kolo=s.kolo||1;if(n.krvK===kolo)return null;n.krvK=kolo;
  const sd=+st.slice(-1),d=bK(sd);return {d,sd,txt:`krvácí: k${sd} = ${d}`}}
function bojPcZac(s,id){const h=(s.hraci||[]).find(x=>x.id===id);if(!h)return;
  {const kv=bojKrvaceni(s,h);if(kv&&!h.ds){const K=bojKartaH(h);if(K)setTimeout(()=>{const m=bojPCZmena(id,x=>bojZranPC(x,K,kv.d,"",false),false);bojLog(id,{n:"Krvácení",ci:id,zt:`${kv.txt} → ${m||""}`},h.n);mmHlasG(`${h.n}: ${kv.txt} HP.`,4000)},0);
    else{const m=bojZranPC(h,null,kv.d,"",false);bojMsg(id,`${kv.txt} → ${m}`)}}}(h.ef||[]).slice().forEach(e=>{if(e.kdy==="kola"){e.k=(e.k||1)-1;if(e.k<=0){bojEfDel(h,e);bojMsg(id,`Skončilo: ${e.n}.`)}}})}
function bojZacatekTahu(s,id){const n=(s.npc||[]).find(x=>x.id===id);if(!n){bojPcZac(s,id);return}BTMSG[id]=[];const E=bojEff(n),kolo=s.kolo||1;
  {const kv=n.druh!=="houf"&&E&&E.hp.length?bojKrvaceni(s,n):null;if(kv){const hp=bojHp.get(),a=hp[id]||[],old=a[0]!=null?a[0]:E.hp[0].max;a[0]=old-kv.d;hp[id]=a;bojHp.set(hp);bojHpZmena(id,0,old,old-kv.d);bojMsg(id,`${kv.txt} → −${kv.d} HP (${old-kv.d}).`)}}
  (n.ef||[]).slice().forEach(e=>{
    if(e.kdy==="zacatek"&&!(e.kolo===kolo&&e.tah===(s.tah||0))){bojEfDel(n,e);bojMsg(id,`Skončilo: ${e.n}.`);return}
    if(e.kdy==="konec")e.zac=1;
    if(e.lk===kolo)return;e.lk=kolo;
    if(e.z&&E&&E.hp.length&&n.druh!=="houf"){const k=bojKostky(String(e.z).replace(/\s+/g,""),false),v=k?k.t:(+e.z||0);if(v>0){const r=bojZasah(E,v,e.t||"Fire",{}),hp=bojHp.get(),a=hp[id]||[],old=a[0]!=null?a[0]:E.hp[0].max;
      a[0]=old-r.x;hp[id]=a;bojHp.set(hp);bojHpZmena(id,0,old,old-r.x);bojMsg(id,`${e.n}: ${k?k.x+" = ":""}${v} ${BZRT[e.t]||e.t||""}${r.pozn.length?" → "+r.pozn.join(", "):""} → −${r.x} HP (${old-r.x}).`)}}
    if(e.kdy==="kola"){e.k=(e.k||1)-1;if(e.k<=0){bojEfDel(n,e);bojMsg(id,`Skončilo: ${e.n}.`)}}});
  if(E){const R=BRCH[id]||{};bojRecharge(E.p).forEach(q=>{if(R[q.n]){const d=bK(6);if(d>=q.min){delete R[q.n];bojMsg(id,`${q.n}: dobito (k6 ${d}).`)}else bojMsg(id,`${q.n}: nedobito (k6 ${d}, potřeba ${q.min}+).`)}});BRCH[id]=R;
    const rg=bojRegen(E.p);if(rg&&E.hp.length){const hp=bojHp.get(),a=hp[id]||[],cur=a[0]!=null?a[0]:E.hp[0].max,D=BDMG[id];
      if(D&&D.k>=kolo-1&&D.t.some(x=>x==="Fire"||x==="Radiant"))bojMsg(id,`Regenerace: v předchozím kole utrpěl ${D.t.filter(x=>x==="Fire"||x==="Radiant").map(x=>BZRT[x]).join(" a ")} zranění – neregeneruje.${cur<=0?" Je na 0 HP: je zničen.":""}`);
      else if(cur<E.hp[0].max){const nv=Math.min(E.hp[0].max,cur+rg);a[0]=nv;hp[id]=a;bojHp.set(hp);bojMsg(id,`Regenerace: +${nv-cur} HP (${nv}/${E.hp[0].max}).`)}}}
  if(BTMSG[id].length)mmHlasG(`${n.n} na tahu: ${BTMSG[id].join(" ")}`,6000);else delete BTMSG[id]}
/* plošný zásah: jeden hod zranění, každý cíl svou záchranu, polovina při úspěchu, odolnosti */
function bojPlosPanel(s){const P=BPLOS;if(!P)return "";const cil=x=>P.cile.includes(x);
  const npc=(s.npc||[]),hr=(s.hraci||[]);
  return `<section class="bplos" aria-label="Plošný zásah"><div class="bprh"><h3>${bi("zavoj")} Plošný zásah${P.src?` <small>– ${besc(P.src)}</small>`:""}</h3><button type="button" class="bprx" data-bploszav aria-label="Zavřít">${bi("krizek")}</button></div>
    <div class="bplf"><label>Zranění <input name="pz" value="${besc(P.z)}" placeholder="8d6 nebo 28" aria-label="Zranění (kostky nebo číslo)"></label>
      <label>Typ <select name="pt">${Object.entries(BZRT).map(([en,cz])=>`<option value="${en}"${P.t===en?" selected":""}>${cz} (${en})</option>`).join("")}</select></label>
      <label>Záchrana <select name="pa">${BAB.map(a=>`<option${P.ab===a?" selected":""}>${a}</option>`).join("")}</select></label>
      <label>DC <input name="pdc" type="number" min="1" max="40" value="${P.dc||""}"></label>
      <label class="bzrk"><input type="checkbox" name="ppol"${P.pol?" checked":""}> úspěch = polovina</label>
      <label ${btip("Stav, který cíl dostane při neúspěšné záchraně (postavám se zapíše sám podle výzvy)")}>Při neúspěchu <select name="pst"><option value="">bez stavu</option>${Object.entries(SRDST).map(([k,v])=>`<option value="${k}"${(P.st||[])[0]===k?" selected":""}>${k} (${v.en})</option>`).join("")}</select></label>
      <label class="bzrk" ${btip("Cíl opakuje záchranu na konci každého svého tahu; úspěch stav ukončí")}><input type="checkbox" name="pop"${P.op?" checked":""}> záchrana na konci tahu</label></div>
    <div class="bplc"><span class="bkzlh">Cíle</span>${npc.map(n=>`<label class="bplt${bojSpoj(n)?" bspj":""}"><input type="checkbox" data-bplc="${n.id}"${cil(n.id)?" checked":""}>${bojMedN(n,"bmini")} ${besc(n.n)}${n.druh==="houf"?` <input type="number" min="0" max="${n.pocet||0}" value="${P.dos&&P.dos[n.id]!=null?P.dos[n.id]:n.pocet||0}" data-bpld="${n.id}" aria-label="Kolik pacholků v dosahu" ${btip("Kolik pacholků je v zasažené oblasti")}>`:""}</label>`).join("")}
      ${hr.map(h=>`<label class="bplt bplh"><input type="checkbox" data-bplc="${h.id}"${cil(h.id)?" checked":""}>${bojMedH(h,"bmini")} ${besc(h.n)}</label>`).join("")}</div>
    <p><button type="button" class="gbtn" data-bploshod>Hodit zranění a záchrany</button></p>${P.vys||""}</section>`}
function bojPlosHod(){const P=BPLOS,s=BOJ.s;if(!P)return;const k=bojKostky(String(P.z).replace(/\s+/g,""),false),dmg=k?k.t:(+P.z||0),ST=(P.st||[]).filter(Boolean);if(!dmg&&!ST.length){mmHlasG("Zadej zranění – kostky (8d6) nebo číslo – nebo stav při neúspěchu.",3000);return}
  if(ST.length&&!P.dc){mmHlasG("Stav při neúspěchu potřebuje SO záchrany.",3000);return}const stN=[],cim0=P.src?P.src.replace(/^[^:]*:\s*/,""):"Plošný zásah";
  const r=[],hp=bojHp.get();let und=false,houfy=[];
  P.cile.forEach(id=>{const h=(s.hraci||[]).find(x=>x.id===id);if(h){const K=bojKartaH(h),pul=P.pol?Math.floor(dmg/2):0;r.push(`<li>${besc(h.n)}: ${P.ab} záchrana DC ${P.dc||"?"}${K?` (${P.ab} ${bsg(kZach(K,P.ab))})`:""} – neúspěch <b>${dmg}</b>${P.pol?`, úspěch <b>${pul}</b>`:", úspěch 0"} ${besc(BZRT[P.t])} <small>(hráč hází sám)</small>${K?` <button type="button" class="badd" data-bpcz="${h.id}" data-z="${dmg}" data-t="${P.t}">neúspěch −${dmg}</button>${pul?`<button type="button" class="badd" data-bpcz="${h.id}" data-z="${pul}" data-t="${P.t}">úspěch −${pul}</button>`:""}`:""}</li>`);return}
    const n=(s.npc||[]).find(x=>x.id===id);if(!n)return;const E=bojEff(n),p=E&&E.p,b=bojSaveB(p,P.ab),d=bK(20),t=d+b,ok=P.dc?t>=P.dc:false,base=ok?(P.pol?Math.floor(dmg/2):0):dmg,z=E?bojZasah(E,base,P.t,{}):{x:base,pozn:[]};
    const zav=`${P.ab} ${t} <small>(d20 ${d} ${bsg(b)})</small> ${P.dc?(ok?"úspěch":"neúspěch"):""}`;
    if(n.druh==="houf"){const H=bojHoufZachrany(n,E,dmg,P.t,P.ab,P.dc,P.pol,P.dos&&P.dos[id]!=null?+P.dos[id]:null),pad=H.pad,v=H.v;houfy.push([id,pad]);r.push(`<li>${besc(n.n)}: záchrany ${besc(H.txt)} – <b>padlo ${pad}</b> z ${v} v dosahu</li>`);bojZaz({a:P.src?P.src.replace(/:.*$/,""):"",ai:P.srcId||"",c:n.n,ci:id,cim:P.src?P.src.replace(/^[^:]*:\s*/,""):"plošný zásah",v:`padlo ${pad} z ${v}`});bojLog(id,{n:P.src?P.src.replace(/^[^:]*:\s*/,""):"Plošný zásah",ai:P.srcId||null,ci:id,und:pad?{id,poc:pad}:null,zt:`záchrany ${H.txt} · padlo ${pad}`},n.n);return}
    if(!E||!E.hp.length){if(ST.length&&P.dc&&!ok)stN.push(id);r.push(`<li>${besc(n.n)}: ${zav} → ${z.x} (bez statblocku)</li>`);return}
    if(!und){bojUndoPush({hp:JSON.parse(JSON.stringify(hp))});und=true}
    const a=hp[id]||[],old=a[0]!=null?a[0]:E.hp[0].max;a[0]=old-z.x;hp[id]=a;bojHp.set(hp);(BDMG[id]={k:s.kolo||1,t:[P.t]});
    bojHpZmena(id,0,old,old-z.x);bojZaz({a:P.src?P.src.replace(/:.*$/,""):"",ai:P.srcId||"",c:n.n,ci:id,cim:P.src?P.src.replace(/^[^:]*:\s*/,""):"plošný zásah",v:(P.dc?(ok?"záchrana uspěla":"zasažen"):"zasažen")+(old-z.x<=0?", padl":"")});bojLog(id,{n:P.src?P.src.replace(/^[^:]*:\s*/,""):"Plošný zásah",ai:P.srcId||null,ci:id,und:{id,k:0,old,nov:old-z.x},ap:1,zr:{t:z.x,x:`${P.ab} ${t}${P.dc?(ok?" úspěch":" neúspěch"):""}${z.pozn.length?" → "+z.pozn.join(", "):""}`,zt:P.t}},n.n);
    if(ST.length&&P.dc&&!ok)stN.push(id);
    let leg="";if(P.dc&&!ok&&bojLegZb(n,E))leg=` <small>(má Legendární odolnost – zvaž)</small>`;
    r.push(`<li>${besc(n.n)}: ${zav} → <b>−${z.x} HP</b>${z.pozn.length?" ("+z.pozn.join(", ")+")":""} → ${old-z.x}/${E.hp[0].max}${leg}</li>`)});
  /* postavy s kartou: výzva k záchraně, zranění se odečte samo podle hodu hráče */
  const vz=P.cile.map(id=>(s.hraci||[]).find(x=>x.id===id)).filter(h=>h&&bojKartaH(h));let vzt="";
  if(vz.length&&P.dc&&window.MMDB&&GMV){const map={};vz.forEach(h=>{map[bojKartaH(h).id]=h.id});const src=P.src?P.src.replace(/:.*$/,""):"",cim=P.src?P.src.replace(/^[^:]*:\s*/,""):"Plošný zásah";
    MMDB.vyzva({typ:"zach",ab:P.ab,dc:P.dc,komu:Object.keys(map),pozn:`${cim}: ${dmg?`${dmg} ${BZRT[P.t]||P.t}${P.pol?", úspěch = polovina":""}`:""}${ST.length?`${dmg?" · ":""}při neúspěchu ${ST.join(", ")}`:""}`.slice(0,200)}).then(id=>{BPLV[+id]={dmg,pol:!!P.pol,t:P.t,ab:P.ab,dc:P.dc,map,hot:new Set(),src,cim,st:ST,op:!!P.op,k:P.k||10};vyzvyNacti()}).catch(e=>mmHlasG("Výzvu se nepodařilo poslat: "+(e.message||e),5000));
    vzt=`<p class="rsmall">Hráčům (${vz.map(h=>besc(h.n)).join(", ")}) vyskočila výzva k záchraně ${P.ab} SO ${P.dc} – zranění se jim odečte samo podle hodu. Tlačítka níž jsou pro ruční zápis.</p>`}
  P.vys=`<p class="bkv"><b>${dmg}</b> ${besc(BZRT[P.t])} <small>${k?k.x:""}</small>${ST.length?` · při neúspěchu ${besc(ST.join(", "))}${stN.length?` (${stN.map(id=>besc(bojJm(s,id))).join(", ")})`:""}`:""}</p>${vzt}<ul class="bplv">${r.join("")}</ul>`;
  if(houfy.length||stN.length)bojZmen(z=>{houfy.forEach(([id,pad])=>{const o=(z.npc||[]).find(x=>x.id===id);if(o)o.pocet=Math.max(0,(o.pocet||0)-pad)});
    stN.forEach(id=>{const n=(z.npc||[]).find(x=>x.id===id);if(n)bojStavDej(z,n,{n:cim0,st:ST,op:!!P.op,k:P.k||10,ab:P.ab,dc:P.dc})})});else renderBoj()}
/* stav ze záchrany (schopnost nepřítele, kouzlo): komukoli v boji (nepřítel i postava) – účinek v kolech, případně opakovaná záchrana na konci tahu */
function bojStavDej(z,o,S){(o.ef||[]).filter(e=>e.n===S.n).forEach(e=>bojEfDel(o,e));S.st.forEach(st=>{const ef={n:S.n,kdy:"kola",k:S.k||10,kolo:z.kolo||1,tah:z.tah||0,st};if(S.op)ef.op={ab:S.ab,dc:S.dc};
  if(!(o.stav||[]).includes(st))o.stav=[...(o.stav||[]),st];(o.ef=o.ef||[]).push(ef)});bojMsg(o.id,`${S.n}: ${S.st.join(", ")}${S.op?` – na konci tahu záchrana ${S.ab} SO ${S.dc}`:""}.`)}
/* stav ze záchrany v textu schopnosti nepřítele nebo z kouzla stejného jména */
function bojAkceStav(nm,txt){const S=typeof bojSpStav==="function"?bojSpStav(nm):null;if(S)return {st:S.st,op:S.op,k:S.k};const t=String(txt||""),EN=Object.fromEntries(Object.entries(SRDST).map(([k,v])=>[v.en,k])),st=[];
  (t.match(/\b(Blinded|Charmed|Deafened|Frightened|Incapacitated|Paralyzed|Petrified|Poisoned|Prone|Restrained|Stunned|Unconscious)\b/g)||[]).forEach(e=>{const k=EN[e];if(k&&!st.includes(k))st.push(k)});if(!st.length)return null;
  const m=t.match(/(\d+)\s*minut/);return {st,op:/na konci (?:každého )?(?:svého )?tahu[^.]{0,90}(?:opak|zopak)|end of each of (?:its|their) turns/i.test(t),k:m?+m[1]*10:10}}
/* kritická zranění postav: zapisují se do herního stavu, počet neléčených se započítá sám */
const bojKritPC=()=>(typeof HRA!=="undefined"&&HRA&&HRA.krit)||{};
/* morálka houfu (Artikule › Iniciativa a protivníci): padne-li polovina houfu nebo velitel a nedrží ho sok, houf prchá */
function bojMorStav(s,n){if(n.druh!=="houf"||!(n.pocet>0)||(n.pr||[]).includes("fanatik"))return "";const pul=n.pocet<=Math.floor((n.max||0)/2),sok=n.vel?(s.npc||[]).find(x=>x.id===n.vel):null,padl=n.vel?bojSokPadl(s,n.vel):n.velitel===false;
  if(sok&&padl)return "sok";if(sok)return "";return pul?"pul":padl?"vel":""}
function bojMoralka(s){(s.npc||[]).forEach(n=>{const d=bojMorStav(s,n);if(!d){delete n.morOk;return}
  if((n.morOk&&n.pocet>=n.morOk)||(n.stav||[]).includes("prchá"))return;delete n.morOk;n.stav=[...(n.stav||[]),"prchá"];mmHlasG(`${n.n}: morálka se zlomila – houf prchá.`,4000)})}
const bojMorTxt=p=>{const m=String((p&&(p.b||p.h))||"").match(/<(?:b|strong)>\s*Morálka[\s\S]*?(?=<\/p>|<\/li>)/i);return m?m[0].replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim():""};
/* Concentration: zranění soustředěné bytosti vyžaduje CON záchranu, DC 10 nebo polovina zranění (nejvýš 30) */
const BKONC={},BKPAD={},BZTL={},BZDC={},BCIM={};let BKDO="";
const BCIMZ=["Dlouhý meč","Meč","Tesák","Sekera","Palcát","Válečné kladivo","Kopí","Halapartna","Sudlice","Dýka","Kuše","Luk","Píšťala","Pěst","Kouzlo"];
function bojHpZmena(id,k,old,nov){const n=((BOJ.s&&BOJ.s.npc)||[]).find(x=>x.id===id);if(!n||!(old>nov))return;
  if(nov<=0&&n.druh!=="houf"){BKPAD[id]={pod:Math.max(0,-nov),druh:bojKritDruh((BZTL[id]||{}).t||"")};mmHlasG(`${n.n} padl${nov<0?` – ${-nov} HP pod nulou`:""}. Hod na kritické zranění je v kartě.`,4500)}
  else if(nov>0)delete BKPAD[id];
  if((n.stav||[]).includes("soustředí")){const dmg=old-nov,dc=Math.min(30,Math.max(10,Math.floor(dmg/2)));BKONC[id]={dc,dmg,v:null};mmHlasG(`${n.n} ztratil ${dmg} HP – Concentration: CON záchrana DC ${dc}.`,5000)}}
/* modifikátor vlastnosti z tabulky statblocku (STR … CHA) */
const bojAbil=(p,ab)=>{const h=String((p&&(p.b||p.h))||"").replace(/−/g,"-");
  for(const tb of h.match(/<table[\s\S]*?<\/table>/g)||[]){const th=[...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim()),td=[...tb.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim());
    const i=th.indexOf(ab);if(i>=0&&td[i]){const m=td[i].match(/\(([+-]\d+)\)/);if(m)return +m[1]}}return null};
/* odolnosti: Resistance (zvlášť ta ze zbroje), Immunity a Vulnerability ze zbroje a statblocku */
function bojOdolnosti(E){const r={res:new Set,resZ:new Set,imu:new Set,zra:new Set};if(!E)return r;
  bikZbDruhy((String(E.ac||"").match(/\(([^)]*)\)/)||[])[1]).forEach(k=>{const z=BZBR[k];if(z&&z[0]!=="—")z[0].split(/,\s*/).forEach(t=>r.resZ.add(t))});
  const t=String(E.p.b||E.p.h||"").replace(/<[^>]+>/g," ").replace(/\*\*/g,"").replace(/\s+/g," ");
  const typy=x=>{const o=[];x.replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,(m,a)=>{o.push(a);return m});
    if(/svat/i.test(x)&&!o.includes("Radiant"))o.push("Radiant");if(/proklet/i.test(x)&&!o.includes("Necrotic"))o.push("Necrotic");return o};
  for(const m of t.matchAll(/(Resistance|Imunit\p{L}*|Immunit\p{L}*|Zranitelnost\p{L}*|Vulnerabilit\p{L}*)\s*(\([^)]*\))?([^·;.]*)/gu)){
    const seg=m[3].split(/\b(?:Imunit|Immunit|Zranitel|Vulnerab|Resistance|Nehmotn)/)[0],k=/^Resist/.test(m[1])?(/zbroj/i.test(m[2]||"")?"resZ":"res"):/^(Imun|Immun)/.test(m[1])?"imu":"zra";
    typy(seg).forEach(x=>r[k].add(x))}
  return r}
/* zásah: Immunity → 0, Resistance → polovina (Drtivá / Průrazná ignorují Resistance zbroje proti Bludgeoning / Piercing), pak Vulnerability ×2 */
function bojZasah(E,v,typ,o){const R=bojOdolnosti(E),pozn=[];let x=v;
  if(o&&(o.st||[]).includes("zkamenělý")&&!R.imu.has(typ)){return {x:Math.floor(v/2),pozn:["zkamenělý: Resistance"]}}
  if(R.imu.has(typ)){x=0;pozn.push("Immunity")}
  else{const ign=(o.drt&&typ==="Bludgeoning")||(o.pru&&typ==="Piercing"),zb=R.resZ.has(typ)&&!ign;
    if(R.res.has(typ)||zb){x=Math.floor(x/2);pozn.push(R.res.has(typ)?"Resistance":"Resistance zbroje")}
    else if(R.resZ.has(typ)&&ign)pozn.push(`${o.drt&&typ==="Bludgeoning"?"Drtivá":"Průrazná"} ignoruje zbroj`);
    if(R.zra.has(typ)){x*=2;pozn.push("Vulnerability")}}
  return {x,pozn}}
/* zbroj v boji: kolikrát ještě vydrží obětování; vyčerpaná zbroj či štít přestane dávat AC */
function bojZbrStav(n,E){const pa=(String((E&&E.ac)||"").match(/\(([^)]*)\)/)||[])[1],d=bikZbDruhy(pa).map(k=>({k,max:parseInt(BZBR[k][1],10)||1,u:Math.min(parseInt(BZBR[k][1],10)||1,((n.zbrU||{})[k])||0)}));
  const ac0=+((String((E&&E.ac)||"").match(/\d+/)||[0])[0]);let ac=ac0;const pr=[];
  const st=d.find(x=>x.k==="Štít"),tel=d.find(x=>x.k!=="Štít");
  if(tel&&tel.u>=tel.max){const dx=bojAbil(E.p,"AGI");ac=10+(dx!=null?dx:0)+(st&&st.u<st.max?2:0);pr.push(`${tel.k.toLowerCase()} zbroj vyčerpána – AC bez zbroje ${dx!=null?`10 ${bsg(dx)} AGI`:"10 + AGI (neznámá, počítám +0)"}${st&&st.u<st.max?" + 2 štít":""}`)}
  else if(st&&st.u>=st.max){ac=ac0-2;pr.push("štít vyčerpán – AC −2")}
  return {d,ac0,ac,pr}}
const bojConB=p=>{const h=String((p&&(p.b||p.h))||"").replace(/−/g,"-");
  for(const tb of h.match(/<table[\s\S]*?<\/table>/g)||[]){const th=[...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim()),td=[...tb.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim());
    const i=th.indexOf("CON");if(i>=0&&td[i]){const m=td[i].match(/\(([+-]\d+)\)/);if(m){const z=h.replace(/<[^>]+>/g," ").match(/Záchran[^:]*:?[^.·]*?\bCON\s*([+-]\d+)/i);return z?+z[1]:+m[1]}}}
  const t=h.replace(/<[^>]+>/g," ");const m=t.match(/Záchran[^:]*:?[^.]*?\bCON\s*([+-]\d+)/i)||t.match(/\bCON\b[^\d+-]{0,6}\d+\s*\(([+-]\d+)\)/)||t.match(/\bCON\s*([+-]\d+)/);return m?+m[1]:0};
function bojKouzla(n,E){if(!E||typeof KZ==="undefined")return [];if(!KZ){if(!BKZW){BKZW=1;kzNacti().then(()=>renderBoj(),()=>{})}return []}
  const o=[],add=(x,z)=>{if(x&&!o.some(q=>q.x===x))o.push({x,z})},najdi=t=>{t=String(t||"").trim().toLowerCase();return KZBY["cz:"+t]||KZBY["en:"+(KZ.find(x=>x.en.toLowerCase()===t)||{}).en]};
  E.zd.forEach(z=>add(najdi(z.n),z.n));E.at.forEach(a=>{const x=najdi(a.n);if(x)add(x,(E.zd.find(z=>najdi(z.n)===x)||{}).n)});
  const t=(String(E.p.b||E.p.h||"").match(/<(p|li)\b[\s\S]*?<\/\1>/g)||[]).filter(x=>/kouzl|spell|\/den|libovoln/i.test(x)).join(" ").replace(/<[^>]+>/g," ");if(KZRE){KZRE.lastIndex=0;for(const m of t.matchAll(KZRE))add(KZBY["en:"+m[1]],(E.zd.find(z=>najdi(z.n)===KZBY["en:"+m[1]])||{}).n)}
  return o}
let BKZW=0;
/* karta NPC – nepřítel i spojenec; vypravěč vidí sbalený řádek, rozbalí se ten, kdo je na tahu */
function bojKarta(s,n,gm){const lim=BLIM[n.druh]||1,u=bojUzito(s,n.id),houf=n.druh==="houf",E=gm?bojEff(n):null,bon=houf?bojPres(s,n):0;
  const prj=bojJmPr(n),open=gm&&bojOtevr(s,n);
  let mor="";
  if(houf&&n.pocet>0){const pul=n.pocet<=Math.floor((n.max||0)/2),fan=(n.pr||[]).includes("fanatik"),sok=n.vel?(s.npc||[]).find(x=>x.id===n.vel):null,padl=n.vel?bojSokPadl(s,n.vel):n.velitel===false;
    if(fan)mor=pul?"Fanatici neprchají, dokud stojí aspoň jeden.":"";
    else if(sok&&padl)mor=`${besc(sok.n)} padl nebo prchá – houf prchá, pokud ho nedrží jiný sok.`;
    else if(sok&&pul)mor=`Padla polovina houfu, ale drží ho ${besc(sok.n)}.`;
    else if(pul||padl)mor="Morálka: padla polovina houfu nebo velitel – houf prchá, pokud ho v boji nedrží sok.";
    if(mor&&gm){const ms=bojMorTxt(E&&E.p);if(ms)mor+=` <span class="bmors">Podle statblocku: ${besc(ms)}</span>`;
      if((n.stav||[]).includes("prchá")&&!fan)mor+=` <button type="button" class="gbtn ghost bmorok" data-bmorok ${btip("Houf přesto drží – zruší útěk a do další ztráty se morálka znovu nekontroluje")}>Drží dál</button><button type="button" class="gbtn ghost bmorok" data-bvzdat ${btip("Zbytek houfu složí zbraně – po boji jsou zajatci")}>Vzdávají se</button>`}}
  const sokove=(s.npc||[]).filter(x=>x.id!==n.id&&(x.druh==="sok"||x.druh==="zhoubce")&&bojSpoj(x)===bojSpoj(n));
  const velH=gm&&houf?(sokove.length?`<label class="bvel" ${btip("Sok, který houf drží: když padne nebo prchá, houf prchá")}>${bi("vazba")}<select data-bvelsok aria-label="Sok, který houf drží"><option value="">— nikdo —</option>${sokove.map(x=>`<option value="${x.id}"${n.vel===x.id?" selected":""}>${besc(x.n)}</option>`).join("")}</select></label>`
    :`<label class="bvel" ${btip("Velitel houfu žije – když padne, houf prchá")}><input type="checkbox" data-bvel${n.velitel===false?"":" checked"}>${bi("velitel")}<span class="vh">velitel žije</span></label>`):"";
  const ZS=E?bojZbrStav(n,E):null,acN=E&&E.ac?String(ZS.ac||(String(E.ac).match(/\d+/)||[""])[0]):"",acTip=E&&E.ac?`AC ${E.ac}${ZS.ac!==ZS.ac0?` → nyní ${ZS.ac} (${ZS.pr.join("; ")})`:""}`:"";
  const tah=`<span class="btahy" role="img" aria-label="Jednal ${u} z ${lim} v tomto kole" ${btip(`Jednal ${u}× z ${lim} v tomto kole`)}>${[...Array(lim)].map((_,j)=>bi(j<u?"tahok":"tah",j<u?"on":"")).join("")}</span>`;
  const hf=houf?`<span class="bhouf"><span class="bpocet" ${btip(`Pacholků: ${n.pocet} z ${n.max}`)}><b>${n.pocet}</b>/${n.max}</span>${gm?`<span class="bpm"><button type="button" class="gbtn ghost" data-bpoc="-1" aria-label="Ubrat pacholka" ${btip("Padl pacholek")}>−</button><button type="button" class="gbtn ghost" data-bpoc="1" aria-label="Přidat pacholka" ${btip("Vrátit pacholka")}>+</button></span>`:""}<span class="bbon" ${btip(n.pocet?(gm&&E&&E.bon!=null?`Útok houfu: základ +${E.bon}, přesila +${bon}`:`Útok houfu: přesila +${bon}`):"Houf poražen")}>${n.pocet?`útok +${gm&&E&&E.bon!=null?E.bon+bon:bon}`:"poražen"}</span></span>`:"";
  /* hráč u nepřátel vidí jen jméno a druh (pacholek, houf, sok, zhoubce); spojence vidí celé */
  if(!gm&&!bojSpoj(n))return `<div class="bnpc bu-${n.druh} bnpch" data-bnpc="${n.id}" style="--mc:${bojBarva(n.id)}"><div class="bnh">${bojMedN(n)}<span class="bnn"><b>${besc(n.n)}</b></span><span class="bdruh" role="img" aria-label="${BDRUH[n.druh]||n.druh}" ${btip(BDRUH[n.druh]||n.druh)}>${bi(BDRIC[n.druh]||"sok")}</span></div></div>`;
  return `<div class="bnpc bu-${n.druh}${bojSpoj(n)?" bspj":""}${houf&&!n.pocet?" bdead":""}${u>=lim?" bvyc":""}${open?" bopen":""}" data-bnpc="${n.id}" style="--mc:${bojBarva(n.id)}">
    <div class="bnh">${bojMedN(n)}<span class="bnn"${gm?" data-brozb":""}><b>${besc(n.n)}</b>${(()=>{if(!gm||!E||houf||!E.hp.length||E.hp[0].max<=20)return "";const hv=(bojHp.get()[n.id]||[])[0],mx=E.hp[0].max,c=hv!=null?hv:mx,pr=Math.max(0,Math.min(100,Math.round(c/mx*100)));
      return `<i class="bhpp${pr<=25?" bhpp4":""}" style="--p:${pr}%" role="img" aria-label="Životy ${c} z ${mx}"></i>`})()}${prj.length?`<small>${besc(prj.join(", "))}</small>`:""}</span><span class="bdruh" role="img" aria-label="${BDRUH[n.druh]||n.druh}" ${btip((BDRUH[n.druh]||n.druh)+(E?" · "+E.p.n+(E.p.vy?" · výzva "+E.p.vy:""):""))}>${bi(BDRIC[n.druh]||"sok")}</span>${E&&E.p.rel?`<span class="bzn bzn-zak bzn-h" role="img" aria-label="Relikt – zákon" ${btip("Relikt – zákon: "+(E.p.zak||"viz statblock")+" · Zažehnání a tajemství jsou ve statblocku.")}>${bi("zakon")}</span>`:""}${acN?(()=>{const zt=ZS.d.map(z=>`${bikZbTip(z.k).replace(/ \(obětování při kritickém zásahu\)/,"")} · zbývá ${z.max-z.u} z ${z.max}`),tip=[acTip,...zt].join(" · ");
      return `<span class="bracw" role="img" aria-label="${besc(tip)}" ${btip(tip)}><span class="brac${ZS.ac!==ZS.ac0?" braclow":""}">${acN}</span>${ZS.d.length?`<span class="brzar" aria-hidden="true">${ZS.d.map(z=>`<span class="brzg${z.k==="Štít"?" brzst":""}">${[...Array(z.max)].map((_,j)=>`<i class="${j<z.max-z.u?"on":"x"}"></i>`).join("")}</span>`).join("")}</span>`:""}</span>`})():""}${gm?bojHpHtml(n,E):bojHpSlovo(n)}${hf}${bojStavy(n,gm,false)}${n.kryt?`<span class="bkrbd" role="img" aria-label="Kryt +${n.kryt}" ${btip(`Za krytem: AC +${n.kryt}`)}>${bi("kryt")}<small>+${n.kryt}</small></span>`:""}${tah}${(()=>{const rk=s.reak||{};return `<button type="button" class="break${rk[n.id]?" on":""}" data-break="${n.id}" aria-pressed="${!!rk[n.id]}" ${gm?"":"disabled "}${btip(`Reakce: ${rk[n.id]?"použita, obnoví se na začátku jeho tahu":"k dispozici"}${gm?" (klikni)":""}`)}>R</button>`})()}${gm?`<button type="button" class="brozb" data-brozb aria-expanded="${open}" aria-label="${open?"Sbalit":"Rozbalit"} kartu" ${btip(open?"Sbalit kartu":"Rozbalit – stavy, útoky, zdroje, statblock")}>${bi("sipka")}</button><button type="button" class="bdel" data-bdel aria-label="Odebrat ${besc(n.n)}" ${btip("Odebrat z boje")}>${bi("krizek")}</button>`:""}</div>
    ${mor&&gm?`<p class="bmor">${bi("velitel")} ${mor}</p>`:""}${open?bojRef(n,s,velH):""}</div>`}
/* akce v boji (SRD 5.2.1, česky zkráceně) a doplnění z Artikulí */
const BAKCE=[["Útok","Attack","útok zbraní nebo úderem beze zbraně (Extra Attack dává víc útoků v jedné akci)."],
  ["Sprint","Dash","navíc pohyb rovný tvé rychlosti."],["Odpoutání","Disengage","tvůj pohyb do konce tahu nevyvolá příležitostné útoky."],
  ["Úhyb","Dodge","do začátku tvého příštího tahu útoky na tebe s nevýhodou (vidíš-li útočníka) a záchrany AGI s výhodou; ne když jsi Incapacitated nebo máš rychlost 0."],
  ["Pomoc","Help","spojenec má výhodu na příští ověření, které mu pomáháš, nebo na příští útok proti tvorovi do 5 stop od tebe."],
  ["Skrytí","Hide","AGI (Stealth) SO 15, když jsi silně zastřený nebo za tříčtvrtečním či úplným krytem a mimo dohled; při úspěchu jsi Neviditelný."],
  ["Ovlivnění","Influence","CHA nebo WIS ověření, kterým nestvůru přemlouváš k něčemu, co by jinak neudělala."],
  ["Magie","Magic","sešleš kouzlo, použiješ magický předmět nebo magickou schopnost."],
  ["Příprava","Ready","určíš spouštěč a akci; když nastane, provedeš ji reakcí (připravené kouzlo drží soustředění)."],
  ["Hledání","Search","WIS ověření (Insight, Medicine, Perception, Survival)."],["Studium","Study","INT ověření (Arcana, History, Investigation, Nature, Religion)."],
  ["Použití","Utilize","použití předmětu, který k tomu potřebuje akci."],
  ["Příležitostný útok","Opportunity Attack","reakcí zaútočíš zblízka, když tvor, kterého vidíš, opustí tvůj dosah. Artikule: Ratiště i když nepřítel vstoupí do dosahu 10 stop."],
  ["Chvat","Grapple (Unarmed Strike)","cíl nejvýš o velikost větší hodí STR nebo AGI záchranu proti SO 8 + STR + zdatnost; neúspěch = Chycen."],
  ["Strčení","Shove (Unarmed Strike)","stejná záchrana; neúspěch = odstrčen o 5 stop, nebo Sražen."],
  ["Techniky a chvaty","Artikule","šermířské techniky a zápasnické chvaty za Výdrž (Fighter = bonus zdatnosti, ostatní bojovníci polovina; obnova dlouhým odpočinkem)."]];
/* rychlá pravidla v šuplíku: kritická zranění, vlastnosti zbraní, zbroj */
let BPRAV=false;
function bojPravidla(){const L=(h,t)=>`<p class="rsmall"><a href="#artikule/${h}">${t} →</a></p>`;
  return `<button type="button" class="bprtg" data-bprav aria-controls="bpravidla" aria-expanded="${BPRAV}" ${btip("Rychlá pravidla: kritická zranění, zbraně, zbroj")}>${bi("kniha")}<span>Pravidla</span></button>
  <aside class="bpravidla${BPRAV?" open":""}" id="bpravidla" aria-label="Rychlá pravidla"><div class="bprh"><h3>Rychlá pravidla</h3><button type="button" class="bprx" data-bprav aria-label="Zavřít rychlá pravidla">${bi("krizek")}</button></div><div class="bprg">
    <article class="bqr bqkrit"><h4>Kritické zranění</h4><p>k10 + 1 za každé neléčené kritické zranění + 1 za každých 5 HP pod 0: <b>1–5</b> Lehká · <b>6–9</b> Těžká · <b>10–12</b> Vážná · <b>13+</b> Smrtelná. Místo podle Závoje: 6 hlava, 3–5 trup, 2 paže, 1 nohy.</p>${bojKritPanel()}</article>
    <article class="bqr"><h4>Stavy (SRD 5.2.1)</h4><dl class="bdl">${Object.entries(SRDST).map(([k,v])=>`<dt>${bi(SRDIC[k])}${k[0].toUpperCase()+k.slice(1)} <small>${v.en}</small></dt><dd>${v.t}.</dd>`).join("")}<dt>${bi("porazen")}Vyčerpání <small>Exhaustion</small></dt><dd>každá úroveň −2 ke všem testům d20 a −5 stop rychlosti; 6. úroveň = smrt; dlouhý odpočinek ubere 1 úroveň.</dd></dl></article>
    <article class="bqr"><h4>Akce v boji</h4><dl class="bdl">${BAKCE.map(([n,en,t])=>`<dt>${n} <small>${en}</small></dt><dd>${t}</dd>`).join("")}</dl><p class="rsmall"><a href="#pravidla">Pravidla SRD česky →</a></p></article>
    <article class="bqr"><h4>Vlastnosti zbraní</h4><dl class="bdl">${Object.entries(BVLZ).map(([k,v])=>`<dt>${bikZv(k)}${k}</dt><dd>${v}</dd>`).join("")}</dl>${L("vyzbroj","Výzbroj")}</article>
    <article class="bqr"><h4>Zbroj</h4><dl class="bdl">${Object.entries(BZBR).map(([k,v])=>`<dt>${bikZb(k)}${k}</dt><dd>${v[0]==="—"?"":`Resistance ${v[0].split(/,\s*/).map(t=>bikZr(t)+t).join(", ")} · `}obětovat ${v[1]}</dd>`).join("")}</dl>
      <p><b>Obětování</b>: při kritickém zásahu se crit změní v běžný zásah; po vyčerpání zbroj nedává AC, dokud ji kovář neopraví.</p>${L("vyzbroj","Výzbroj")}</article>
  </div></aside>`}
/* shrnutí po boji: padlí, zajatí a jejich osud, výkupné, kořist, XP a návrh zápisu do Kroniky */
const BOSUD=[["","zajat – rozhodnete později"],["vyslech","vyslechnut"],["vykupne","drží se pro výkupné"],["propusten","propuštěn"],["vydan","vydán pánovi nebo rychtáři"],["popraven","popraven"]];
const BOSUDP={vykupne:"Urozený zajatec má cenu živý – výkupné podle statblocku.",propusten:"Propustit poraženého nepřítele může být skutkem Laskavosti (pomoc nepříteli).",
  popraven:"Zabít bezbranného zajatce je vražda bezbranného: smrtelný hřích pro toho, kdo to udělal nebo nařídil (Svědomí −1, proti vlastní Ctnosti −2). U Starověrců i Intrikaření."};
const bojSez=a=>{a=a.filter(Boolean);return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" a "+a[a.length-1]};
const bojKolTxt=k=>`${k} ${k===1?"kolo":k<5?"kola":"kol"}`;
/* stav nepřítele po boji */
function bojOsud(s,o){const zaj=bojZaj.get(),st=o.stav||[],vz=st.includes("vzdal se"),z=zaj[o.id]!=null||vz,ut=st.includes("prchá")&&!vz,roz=st.includes("rozplynul se"),por=!z&&!ut&&bojSokPadl(s,o.id);
  return {z,ut,roz,por,vz,osud:typeof zaj[o.id]==="string"?zaj[o.id]:"",t:z?"zajat":roz?"rozplynul se (vrátí se, dokud ho družina nezažehná)":por?"poražen":ut?"uprchl":"na nohou"}}
/* kořist: zbroj z AC, zbraně z útoků (ne drápy a kouzla), u houfu krát padlí a zajatí; poškozená obětováním zbroj k opravě */
const BZBRN=/meč|šavl|sekyr|kuš|luk|kopí|halapartn|sudlic|palcát|cep|řemdih|dýk|tesák|kord|kladiv|oštěp|píšťal|hák|biják|rohatin|kosa|vidle|prak|scimitar|sword|axe|bow|spear|mace|dagger/i;
const BZVL=/Ostrá|Drtivá|Průrazná|Šikovná|Ratiště|Půlmeč|Štěpící|Strhující|Vpřed|Do slabin|Hrom a kouř|Lehká|Těžká|Obouruční|Vrhací|Nabíjení|Munice|Dosah/i;
function bojKorist(s){const it=[];
  (s.npc||[]).filter(o=>!bojSpoj(o)).forEach(o=>{const E=bojEff(o);if(!E)return;const O=bojOsud(s,o);if(O.roz)return;
    const ks=o.druh==="houf"?((o.max||0)-(o.pocet||0))+((o.stav||[]).includes("vzdal se")?(o.pocet||0):0):(O.por||O.z?1:0);if(!ks)return;
    const pa=(String(E.ac||"").match(/\(([^)]*)\)/)||[])[1]||"",ZS=bojZbrStav(o,E);
    pa.split(/,\s*|\s+a\s+/).map(x=>x.trim()).filter(x=>x&&!/přirozen|natural|šupin|kůže|krunýř|bez zbroje|magick/i.test(x)).forEach(x=>{const dr=bikZbDruhy(x),d=ZS.d.find(q=>dr.includes(q.k))||null;
      it.push({k:`${o.id}:z:${x}`,t:`${ks>1?ks+"× ":""}${x}${d&&d.u?(d.u>=d.max?" – vyčerpaná obětováním, k opravě u kováře":" – poškozená"):""}`,z:o.n})});
    E.at.filter(a=>a.b!=null&&(BZBRN.test(a.n)||BZVL.test(a.p||""))).forEach(a=>{const nm=a.n.replace(/\s*\((?:\d+\/den|dobíjí)[^)]*\)/i,"");if(!it.some(q=>q.k===`${o.id}:u:${nm}`))it.push({k:`${o.id}:u:${nm}`,t:`${ks>1?ks+"× ":""}${nm.charAt(0).toLowerCase()+nm.slice(1)}`,z:o.n})})});
  return it}
const BKORX=new Set();let BZAPT=null;
function bojShrn(s){const rows=[],txt=[];
  (s.npc||[]).filter(o=>!bojSpoj(o)).forEach(o=>{const p=PROTBY[o.b];
    if(o.druh==="houf"){const padli=(o.max||0)-(o.pocet||0),vz=(o.stav||[]).includes("vzdal se"),prchli=(o.stav||[]).includes("prchá")&&!vz?o.pocet:0;
      const t=`${o.n}: padlo ${padli} z ${o.max}${vz&&o.pocet?`, ${o.pocet} se vzdalo (zajatci)`:prchli?`, ${prchli} prchlo`:o.pocet?`, ${o.pocet} zůstalo`:""}`;rows.push(`<li>${besc(t)}</li>`);txt.push(t);return}
    const O=bojOsud(s,o),os=BOSUD.find(x=>x[0]===O.osud)||BOSUD[0];
    const sel=O.z?` <select data-bosud="${o.id}" aria-label="Co se zajatcem – ${besc(o.n)}">${BOSUD.map(([k,l])=>`<option value="${k}"${O.osud===k?" selected":""}>${l}</option>`).join("")}</select>`:"";
    rows.push(`<li><b>${besc(o.n)}</b> – ${O.t}${O.vz?" (vzdal se)":""}${!O.ut&&!O.vz?` <label class="bzaj"><input type="checkbox" data-bzaj="${o.id}"${O.z?" checked":""}> zajat</label>`:""}${sel}${O.z&&BOSUDP[O.osud]?`<br><small class="bosudp${O.osud==="popraven"?" bhrich":""}">${BOSUDP[O.osud]}</small>`:""}${p&&p.vk&&(O.por||O.z)?`<br><small>${besc(p.vk)}</small>`:""}</li>`);
    txt.push(`${o.n} ${O.t}${O.z&&O.osud?" – "+os[1]:""}${p&&p.vk&&(O.por||O.z)?` (${p.vk.replace(/\s+/g," ").slice(0,140)})`:""}`)});
  const kor=bojKorist(s),korV=kor.filter(x=>!BKORX.has(x.k)),nepr=(s.npc||[]).filter(o=>!bojSpoj(o)),nh=(s.hraci||[]).length||1,xp=nepr.some(o=>o.b)?bojObt(nepr,nh,false).xp:0;
  const korH=kor.length?`<h4 class="bsph">Kořist</h4><ul class="bkor">${kor.map(x=>`<li><label><input type="checkbox" data-bkor="${besc(x.k)}"${BKORX.has(x.k)?"":" checked"}> ${besc(x.t)} <small>(${besc(x.z)})</small></label></li>`).join("")}</ul><p class="rsmall">Odškrtnuté se do Kroniky nezapíše. Spravedlivá dělba kořisti je Štědrost, ponechat si ji Lakomství.</p>`:"";
  const xpH=xp?`<p class="rsmall">XP za střetnutí: <b>${xp.toLocaleString("cs-CZ")}</b> · na postavu ${Math.floor(xp/nh).toLocaleString("cs-CZ")} (D&amp;D 2024, pokud XP rozdáváte).</p>`:"";
  if(korV.length)txt.push("kořist: "+korV.map(x=>`${x.t} (${x.z})`).join(", "));if(xp)txt.push(`XP ${xp}`);
  const st=bojStat(s);if(st.txt)txt.push("statistika: "+st.txt);
  return {html:`<ul class="bshl">${rows.join("")}</ul>${korH}${bojKorDelHtml(korV)}${xpH}${bojStatHtml2(s)}`,txt:`boj (kolo ${s.kolo||1}): `+txt.join("; "),kor:korV}}
/* návrh zápisu do Kroniky z průběhu boje (skryté cíle vynechá) */
const BKRLOG=[];
function bojZapisNavrh(s){const P=[],hr=(s.hraci||[]).map(h=>h.n).filter(Boolean),nepr=(s.npc||[]).filter(o=>!bojSpoj(o)),spoj=(s.npc||[]).filter(bojSpoj),k=s.kolo||1;
  let v=`${hr.length?`Družina (${bojSez(hr)})`:"Družina"}${spoj.length?` se spojenci (${bojSez(spoj.map(o=>o.n))})`:""} se střetla s protivníky: ${bojSez(nepr.map(o=>o.druh==="houf"?`${o.n} (${o.max})`:o.n))||"neznámými"}.`;
  if(s.prekv==="h")v+=" Nepřítel družinu zaskočil.";else if(s.prekv==="n")v+=" Družina nepřítele zaskočila.";
  const pr=bojPros(s).map(x=>BPROS[x]&&BPROS[x][2]).filter(Boolean);if(pr.length)v+=` Bojovalo se ${bojSez(pr)}.`;
  v+=` Boj trval ${bojKolTxt(k)} (asi ${Math.max(1,Math.round(k*6/60))} min).`;P.push(v);
  const v2=[],kn=BLOGG.filter(x=>x.o&&x.o.hod&&x.o.hod.krit).map(x=>`${x.kdo}${x.o.cil?" → "+x.o.cil:""}`).reverse();
  if(kn.length)v2.push(`Kritické zásahy nepřátel: ${bojSez([...new Set(kn)])}.`);
  if(BKRLOG.length)v2.push(`Rány: ${BKRLOG.map(x=>`${x.komu} – ${x.t}`).join("; ")}.`);
  const ds=(s.hraci||[]).filter(h=>h.ds);if(ds.length)v2.push(`Na prahu smrti: ${ds.map(h=>`${h.n}${h.ds.st==="mrtev"?" – smrt":h.ds.st==="stab"?" – stabilizace":" – bez vědomí"}`).join("; ")}.`);
  const por=[],ut=[],zaj=[],hf=[];
  nepr.forEach(o=>{if(o.druh==="houf"){const padli=(o.max||0)-(o.pocet||0),vz=(o.stav||[]).includes("vzdal se");hf.push(`${o.n}: padlo ${padli} z ${o.max}${vz&&o.pocet?`, ${o.pocet} se vzdalo`:(o.stav||[]).includes("prchá")&&o.pocet?`, ${o.pocet} prchlo`:""}`);return}
    const O=bojOsud(s,o);if(O.z)zaj.push(o.n+(O.osud?` (${(BOSUD.find(x=>x[0]===O.osud)||[0,""])[1]})`:""));else if(O.por)por.push(o.n);else if(O.ut)ut.push(o.n)});
  if(por.length)v2.push(`Poraženi: ${bojSez(por)}.`);if(ut.length)v2.push(`Uprchli: ${bojSez(ut)}.`);if(zaj.length)v2.push(`Zajati: ${bojSez(zaj)}.`);
  if(hf.length)v2.push(hf.join("; ")+".");
  if(v2.length)P.push(v2.join(" "));
  const v3=[],cl=(s.cile||[]).filter(c=>c.ver),ok=c=>c.cil?c.stav>=c.cil:!!c.stav;
  if(cl.some(ok))v3.push(`Splněno: ${bojSez(cl.filter(ok).map(c=>c.n))}.`);if(cl.some(c=>!ok(c)))v3.push(`Nesplněno: ${bojSez(cl.filter(c=>!ok(c)).map(c=>c.n+(c.cil?` (${c.stav||0}/${c.cil})`:"")))}.`);
  const kor=bojKorist(s).filter(x=>!BKORX.has(x.k));if(kor.length)v3.push(`Kořist: ${kor.map(x=>x.t).join(", ")}.`);
  const st=bojStat(s);if(st.txt)v3.push(st.txt.charAt(0).toUpperCase()+st.txt.slice(1)+".");
  if(BODP)v3.push("Po boji si družina hodinu odpočinula.");
  if(v3.length)P.push(v3.join(" "));
  return P.join("\n\n")}
/* ===== postavy v boji: stavy, kryt, připravená akce a hody proti smrti – hráč z telefonu, vypravěč v seznamu družiny ===== */
/* hody proti smrti (D&D 2024): 10+ úspěch, méně neúspěch, 1 = dva neúspěchy, 20 = probere se s 1 HP; tři úspěchy stabilizace, tři neúspěchy smrt */
function bojDs(ds,act,d){ds=Object.assign({u:0,n:0},ds||{});delete ds.st;let m="";
  if(act==="hod"){if(d===20)return {ds:null,m:"20 – probírá se s 1 HP"};if(d===1){ds.n+=2;m="1 – dva neúspěchy"}else if(d>=10){ds.u++;m=`${d} – úspěch`}else{ds.n++;m=`${d} – neúspěch`}}
  else if(act==="u")ds.u++;else if(act==="n")ds.n+=(+d||1);
  ds.u=Math.min(3,ds.u);ds.n=Math.min(3,ds.n);
  if(ds.n>=3){ds.st="mrtev";m+=(m?" → ":"")+"třetí neúspěch: umírá"}else if(ds.u>=3){ds.st="stab";m+=(m?" → ":"")+"třetí úspěch: stabilizován, do konce boje mimo hru"}
  return {ds,m}}
const bojDsPip=h=>{const d=h&&h.ds;if(!d)return "";
  if(d.st)return `<span class="bdsb bds-${d.st}" role="img" aria-label="${d.st==="mrtev"?"Umírá":"Stabilizován"}" ${btip(d.st==="mrtev"?"Tři neúspěchy hodu proti smrti – postava umírá":"Stabilizován – do konce boje mimo hru, ledaže ho vrátí Lesser nebo Greater Restoration")}>${bi(d.st==="mrtev"?"smrt":"porazen")}</span>`;
  return `<span class="bdsb" role="img" aria-label="Hody proti smrti: úspěchy ${d.u} ze 3, neúspěchy ${d.n} ze 3" ${btip(`Na prahu smrti – úspěchy ${d.u}/3, neúspěchy ${d.n}/3`)}>${bi("porazen")}<i class="bdsu">${"●".repeat(d.u)}${"○".repeat(3-d.u)}</i><i class="bdsn">${"●".repeat(d.n)}${"○".repeat(3-d.n)}</i></span>`};
const BSTHP={"krvácí k6":"Krvácíš (kritické zranění): na začátku každého tahu ztratíš k6 HP, dokud tě někdo neošetří (Medicine).","krvácí k8":"Krvácíš (kritické zranění): na začátku každého tahu ztratíš k8 HP, dokud tě někdo neošetří (Medicine).","sražen":"Ležíš: vstát stojí polovinu rychlosti; útoky zblízka na tebe mají výhodu, z dálky nevýhodu; tvé útoky mají nevýhodu.",
  "omráčen":"Omráčen: nemůžeš jednat ani se pohnout, záchrany na Sílu a Obratnost automaticky selžou, útoky na tebe mají výhodu.",
  "zadržen":"Zadržen: rychlost 0, tvé útoky mají nevýhodu, útoky na tebe výhodu; vyprostíš se akcí.",
  "oslepen":"Oslepen: tvé útoky mají nevýhodu, útoky na tebe výhodu.","neviditelný":"Neviditelný: tvé útoky mají výhodu, útoky na tebe nevýhodu.",
  "otrávený":"Otrávený: nevýhoda na útoky a ověření.","vyděšený":"Vyděšený: nevýhoda na útoky a ověření, dokud vidíš zdroj strachu; nesmíš se k němu přiblížit.",
  "soustředí":"Držíš soustředění (Concentration): při zranění CON záchrana DC 10 nebo polovina zranění (nejvýš 30)."};
Object.entries(SRDST).forEach(([k,v])=>{if(!BSTHP[k])BSTHP[k]=`${k[0].toUpperCase()+k.slice(1)} (${v.en}): ${v.t}.`});
/* připomínky na začátek tahu postavy */
function bojPripominky(s,h){const r=[],d=h.ds;
  if(d&&!d.st)r.push("Jsi v bezvědomí: na začátku tahu hoď hod proti smrti (d20, 10+ úspěch).");
  if(d&&d.st==="stab")r.push("Jsi stabilizován – do konce boje mimo hru, ledaže tě vrátí Lesser nebo Greater Restoration.");
  (h.stav||[]).forEach(t=>{if(BSTHP[t])r.push(BSTHP[t])});
  if(h.kryt)r.push(`Jsi za ${h.kryt===5?"tříčtvrtečním":"polovičním"} krytem: AC a záchrany na Obratnost +${h.kryt}.`);
  const rd=(s.ready||{})[h.id];if(rd)r.push(`Připravená akce: ${rd} – spustíš ji reakcí, na začátku tvého tahu propadne.`);
  r.push((s.reak||{})[h.id]?"Reakci jsi v tomto kole už použil.":"Reakce je k dispozici.");
  bojPros(s).forEach(k=>{const p=BPROS[k];if(p)r.push(p[3])});
  return r}
/* panel postavy: stejné ovládání pro hráče (svou postavu) i vypravěče (rozbalený řádek družiny) */
function bojHracPanel(h,s,gm){const st=h.stav||[],d=h.ds,rd=(s.ready||{})[h.id],rk=!!(s.reak||{})[h.id];
  const stav=`<div class="bhpst" role="group" aria-label="Stavy – ${besc(h.n)}">${BSTAVH.map(t=>{const on=st.includes(t),I=BSTI[t]||["komplikace",t];return `<button type="button" data-bhst="${t}" aria-pressed="${on}" aria-label="${besc(I[1])}" ${btip(I[1]+(on?" · klikni a zruš":" · klikni a označ"))}>${bi(I[0])}</button>`}).join("")}</div>`;
  const kr=`<span class="bhpkr" role="group" aria-label="Kryt">${bi("kryt")}${[[0,"bez krytu"],[2,"½"],[5,"¾"]].map(([k,l])=>`<button type="button" data-bhkr="${k}" aria-pressed="${(+h.kryt||0)===k}" ${btip(k?`${k===2?"Poloviční":"Tříčtvrteční"} kryt: AC a záchrany na Obratnost +${k}`:"Bez krytu")}>${l}</button>`).join("")}</span>`;
  const rea=gm?"":`<button type="button" class="break bhprk${rk?" on":""}" data-bhrk aria-pressed="${rk}" ${btip(rk?"Reakce použita – obnoví se na začátku tvého tahu (klikni a vrať)":"Reakce k dispozici – klikni, když ji použiješ")}>R</button>`;
  const rdy=rd?`<p class="brdy">⏳ <b>Připravená akce:</b> ${besc(rd)} <button type="button" class="gbtn ghost" data-bhrdygo>Spustit (reakce)</button><button type="button" class="bkoncx" data-bhrdyx aria-label="Zrušit připravenou akci">×</button></p>`
    :`<button type="button" class="gbtn ghost brdyadd" data-bhrdy ${btip("Připravit akci (Ready): spustí se reakcí, propadne na začátku tvého dalšího tahu")}>⏳ Připravit akci</button>`;
  const ds=!d?`<button type="button" class="gbtn ghost bhpad" data-bhds="pad" ${btip("Pád na 0 HP: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání")}>${bi("porazen")} ${gm?"Padl na 0 HP":"Padl jsem (0 HP)"}</button>`
    :d.st?`<p class="bhds">${bojDsPip(h)} <b>${d.st==="mrtev"?"Tři neúspěchy – umírá.":"Stabilizován – do konce boje mimo hru."}</b> <button type="button" class="gbtn ghost" data-bhds="x" ${btip("Zrušit (vyléčen, vzkříšen, omyl)")}>${d.st==="mrtev"?"Zrušit":"Zpět do boje (Restoration)"}</button></p>`
    :`<div class="bhds"><span class="bhdsh">${bi("porazen")} <b>Na prahu smrti</b> ${bojDsPip(h)}</span><button type="button" class="gbtn" data-bhds="hod" ${btip("d20: 10+ úspěch, méně neúspěch, 1 dva neúspěchy, 20 probere se s 1 HP")}>🎲 Hod proti smrti</button>${gm?`<button type="button" class="gbtn ghost" data-bhds="u">+ úspěch</button><button type="button" class="gbtn ghost" data-bhds="n" ${btip("Neúspěch – i když padlého někdo zasáhne (krit = 2)")}>+ neúspěch</button><button type="button" class="gbtn ghost" data-bhds="stab" ${btip("Stabilizován – Lékařství SO 10, léčení nebo Spare the Dying")}>stabilizovat</button>`:`<label class="bhdsv">nebo svůj hod <input type="number" inputmode="numeric" min="1" max="20" data-bhdsv aria-label="Vlastní hod proti smrti (d20)"></label>`}<button type="button" class="gbtn ghost" data-bhds="x" ${btip("Zpět na nohou – zruší hody proti smrti")}>vstal</button></div>`;
  return `<div class="bhpan${bojKartaH(h)?" kdb kdbc":""}" data-bhpan="${h.id}">${bojKartaHlava(h,s,gm)}${stav}<div class="bhprow">${kr}${rea}${rdy}</div>${gm?"":bojKonHtml(h)}${ds}${bojKartaOvl(h,s,gm)}${bojZbraneHtml(s,h)}</div>`}
/* akce panelu postavy: vypravěč rovnou mění boj, hráč posílá jen změněná pole přes mm_boj_hrac */
async function bojHracAkce(id,fn,msg){
  {const K0=bojKartaH(((BOJ.s||{}).hraci||[]).find(x=>x.id===id));if(K0&&kDuse(K0).sv>=8){const f0=fn;fn=(h,z)=>{const r=f0(h,z);if(h&&(h.stav||[]).includes("vyděšený")){h.stav=h.stav.filter(x=>x!=="vyděšený");if(!h.stav.length)delete h.stav;mmHlasG(`${h.n} je V milosti – imunní vůči Frightened.`,4500)}return r}}}
  if(GMV){bojZmen(z=>{const h=(z.hraci||[]).find(x=>x.id===id);if(h)fn(h,z)});if(msg)mmHlasG(msg,5000);return}
  const s=BOJ.s,h0=s&&(s.hraci||[]).find(x=>x.id===id);if(!h0||!bojDB||!bojDB.hrac)return;
  const z=JSON.parse(JSON.stringify(s)),h=(z.hraci||[]).find(x=>x.id===id);if(fn(h,z)===false)return;
  const ch=[];["stav","kryt","ds","hp","thp","zdr"].forEach(k=>{if(JSON.stringify(h[k]??null)!==JSON.stringify(h0[k]??null))ch.push([k,h[k]??null])});
  const rd0=(s.ready||{})[id]||null,rd1=(z.ready||{})[id]||null;if(rd0!==rd1)ch.push(["ready",rd1]);
  const rk0=!!(s.reak||{})[id],rk1=!!(z.reak||{})[id];if(rk0!==rk1)ch.push(["reak",rk1]);
  const zb0=JSON.stringify((s.zbrane||{})[h0.n]||null),zb1=(z.zbrane||{})[h.n]||null;if(zb0!==JSON.stringify(zb1))ch.push(["zbrane",zb1&&zb1.length?zb1:null]);
  if(!ch.length)return;BOJ.s=z;renderBoj();BOJ.zapis=(BOJ.zapis||0)+1;
  try{for(const [k,v] of ch)await bojDB.hrac(id,k,v);if(msg)mmHlas(msg,5000)}catch(err){mmHlas("Nepodařilo se uložit: "+(err.message||err),5000)}
  finally{BOJ.zapis--}
  BOJ.v=-2;await bojNacti();renderBoj()}
function bojHracKlik(T){const pan=T("[data-bhpan]");if(!pan)return false;const id=pan.dataset.bhpan,s=BOJ.s||{},hn=((s.hraci||[]).find(x=>x.id===id)||{}).n||"";
  const st=T("[data-bhst]");if(st){const t=st.dataset.bhst,h0=((BOJ.s||{}).hraci||[]).find(x=>x.id===id),K0=h0&&bojKartaH(h0),kon0=K0&&kKonDrzi(K0);
    if(t==="soustředí"&&kon0){kKonZtrata(K0,"ukončeno");return true}
    bojHracAkce(id,h=>{const a=h.stav||[],on=a.includes(t);h.stav=on?a.filter(x=>x!==t):[...a,t];if(!on&&SRDST[t]&&SRDST[t].nej)h.stav=h.stav.filter(x=>x!=="soustředí");if(!h.stav.length)delete h.stav});
    if(kon0&&SRDST[t]&&SRDST[t].nej&&!((h0.stav||[]).includes(t)))kKonZtrata(K0,`${t} – soustředění končí`);return true}
  const kr=T("[data-bhkr]");if(kr){const k=+kr.dataset.bhkr;bojHracAkce(id,h=>{if(k)h.kryt=k;else delete h.kryt});return true}
  if(T("[data-bhrk]")){bojHracAkce(id,(h,z)=>{z.reak=z.reak||{};if(z.reak[id])delete z.reak[id];else z.reak[id]=1});return true}
  if(T("[data-bhrdy]")){const t=(prompt(`Připravená akce – ${hn}: co a kdy udělá?`,"zaútočím, až se někdo přiblíží")||"").trim().slice(0,160);if(!t)return true;bojHracAkce(id,(h,z)=>{(z.ready=z.ready||{})[id]=t});return true}
  if(T("[data-bhrdyx]")){bojHracAkce(id,(h,z)=>{if(z.ready)delete z.ready[id]});return true}
  if(T("[data-bhrdygo]")){if((s.reak||{})[id]){(GMV?mmHlasG:mmHlas)(`${hn}: reakce už byla v tomto kole použita.`,3500);return true}
    if(GMV)bojLog(id,{n:"Připravená akce",zt:(s.ready||{})[id]||""},hn);bojHracAkce(id,(h,z)=>{(z.reak=z.reak||{})[id]=1;if(z.ready)delete z.ready[id]},`${hn}: připravená akce spuštěna, reakce použita.`);return true}
  const ds=T("[data-bhds]");if(ds){const k=ds.dataset.bhds;
    if(k==="pad"){if(!GMV&&!confirm("Padl jsi na 0 HP? Vypravěč uvidí, že jsi v bezvědomí."))return true;
      if(GMV){BKS.komu=hn;BKS.rany=(bojKritPC()[hn]||[]).length;BKS.vys="";BKS.kdo=hn+" padl";BKS.druh="fyz"}
      bojHracAkce(id,h=>{h.ds={u:0,n:0};if(h.stav){h.stav=h.stav.filter(x=>x!=="soustředí");if(!h.stav.length)delete h.stav}},`${hn} padl na 0 HP: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání.`);return true}
    if(k==="x"){bojHracAkce(id,h=>{delete h.ds},`${hn}: zase na nohou.`);return true}
    if(k==="stab"){bojHracAkce(id,h=>{if(h.ds)h.ds.st="stab"},`${hn}: stabilizován.`);return true}
    const h0=(s.hraci||[]).find(x=>x.id===id);if(!h0||!h0.ds)return true;
    const r=k==="hod"?bojDs(h0.ds,"hod",bK(20)):bojDs(h0.ds,k);
    if(GMV&&k==="hod")bojLog(id,{n:"Hod proti smrti",zt:r.m},hn);
    if(k==="hod"&&!r.ds){const K=bojKartaH(h0);if(K&&kMuze(K))kartaStavZmen(K.id,{hp:Math.max(1,+kartaStav(K.id).hp||0)},null)}
    bojHracAkce(id,h=>{if(r.ds)h.ds=r.ds;else delete h.ds},k==="hod"?`${hn}: hod proti smrti ${r.m}.`:r.m?`${hn}: ${r.m}.`:"");return true}
  return false}
/* ===== karta postavy v boji (zatím zkušební karty v zdroj/obsah/karty, později import z PDF D&D Beyond) =====
   Karta zná AC, životy, záchrany, odolnosti, útoky, kouzla a zdroje; tracker z ní vyhodnocuje útoky nepřátel
   na postavu, vede životy, smrt, soustředění a spotřebu slotů a schopností. */
const BPCZ=new Set();
const KARTBY=Object.fromEntries((KARTY||[]).map(k=>[k.id,k]));
const bojKartaH=h=>h?(KARTBY[h.k]||(KARTY||[]).find(k=>k.n===h.n)||null):null;
const bojHpPC=(h,K)=>{if(!K)return null;const ks=kartaStav(K.id);return ks.hp!=null?+ks.hp:kHPmax(K)};
const hpO=(o,K)=>o.hp!=null?+o.hp:kHPmax(K);
/* zbraně postavy: z karty + uložené ručně */
const bojZbrVse=(s,h)=>{const K=bojKartaH(h);return [...(K?kUtoky(K).map(a=>({n:a.n,b:a.b,z:a.z,t:a.t,dal:!!a.dal,pocet:a.pocet||1,drt:(a.vl||[]).some(v=>/drtiv/i.test(v))||bdmZvl(a,K).includes("Drtivá"),pru:(a.vl||[]).some(v=>/průrazn/i.test(v))||bdmZvl(a,K).includes("Průrazná"),karta:1,pozn:a.pozn||""})):[]),...bojZbrH(s,h)]};
/* zranění postavy s kartou: Resistance/Immunity, dočasné HP, pád na 0, okamžitá smrt, hody proti smrti při zásahu na 0, soustředění */
function bojZranEf(K,x,typ,opt){opt=opt||{};let v=+x||0;if(!K||v<=0)return {v,m:""};if((K.imu||[]).includes(typ))return {v:0,m:`Immunity (${BZRT[typ]||typ})`};
  if(kOdol(K).includes(typ)){const zbr=((BZBR[kOdolZ(K)]||[""])[0]||"").includes(typ),jinak=(K.odol||[]).includes(typ)||(kPri(K).includes("Rage")&&["Bludgeoning","Piercing","Slashing"].includes(typ));
    if(zbr&&!jinak&&((typ==="Bludgeoning"&&opt.drt)||(typ==="Piercing"&&opt.pru)))return {v,m:`${opt.drt?"Drtivá":"Průrazná"} zbraň – Resistance zbroje neplatí`};
    return {v:Math.floor(v/2),m:`Resistance (${BZRT[typ]||typ}) → ${Math.floor(v/2)}`}}
  return {v,m:""}}
var BZRPOD=0;
function bojZranPC(h,K,x,typ,krit,opt){const m=[];let v=+x||0;if(v<=0)return "";BZRPOD=0;
  {const r=bojZranEf(K,v,typ,opt);v=r.v;if(r.m)m.push(r.m)}
  if(h.thp>0&&v>0){const a=Math.min(h.thp,v);h.thp-=a;v-=a;m.push(`dočasné HP pohltí ${a}`);if(!h.thp)delete h.thp}
  if(v<=0)return m.join(", ");
  if(bojDsAkt(h)){const r=bojDs(h.ds,"n",krit?2:1);h.ds=r.ds;m.push(`zásah v bezvědomí: ${krit?"dva neúspěchy":"neúspěch"} hodu proti smrti${r.m?" → "+r.m:""}`);return m.join(", ")}
  const mx=K?kHPmax(K):0,cur=hpO(h,K),nov=cur-v;
  if((h.stav||[]).includes("soustředí"))m.push(`soustředění: CON záchrana SO ${bojKonDC(v)}${K&&K.konVyhoda?" s výhodou (War Caster)":""}`);
  if(nov<=0){h.hp=0;BZRPOD=Math.max(0,-nov);if(mx&&-nov>=mx){h.ds={u:0,n:3,st:"mrtev"};m.push(`přesah ${-nov} ≥ maximum HP – okamžitá smrt`)}
    else{h.ds={u:0,n:0};m.push(`padá na 0 HP${nov<0?` (${-nov} pod nulou)`:""}: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání`)}
    if(h.stav){h.stav=h.stav.filter(q=>q!=="soustředí");if(!h.stav.length)delete h.stav}}
  else h.hp=nov;
  m.unshift(`−${v} HP (${Math.max(0,nov)}/${mx})`);return m.join(", ")}
function bojLecPC(h,K,x){const v=+x||0;if(v<=0)return "";const mx=K?kHPmax(K):0,cur=hpO(h,K);
  if(h.ds){if(h.ds.st==="mrtev")return "mrtvého léčení nevzkřísí";h.ds={u:3,n:h.ds.n||0,st:"stab"};h.hp=Math.min(mx,Math.max(0,cur)+v);return `+${v} HP: stabilizován – do konce boje mimo hru (Artikule), ledaže ho vrátí Lesser nebo Greater Restoration`}
  h.hp=Math.min(mx,cur+v);if(h.hp>=mx)delete h.hp;return `+${v} HP (${Math.min(mx,cur+v)}/${mx})`}
/* hlavička karty: AC, životy s pruhem, dočasné HP, ovládání zranění a léčení */
function bojKartaHlava(h,s,gm){const K=bojKartaH(h);if(!K)return "";const mx=kHPmax(K),cur=bojHpPC(h,K),pr=Math.max(0,Math.min(100,Math.round(cur/mx*100))),kr=+h.kryt||0,ks=kartaStav(K.id);
  return `<div class="kdbcr"><div class="kdbac" ${btip(`AC ${kAC(K)}${kr?` + kryt ${kr}`:""}`)}><small>AC</small><b>${kAC(K)+kr}</b>${kr?`<small>kryt +${kr}</small>`:"<small>obrana</small>"}</div>
    <div class="kdbhp${cur<=mx/2?" bhp2":""}${cur<=0?" bhp0":""}"><div class="kdbhpz"><button type="button" class="kdbheal" data-bkzr="l" ${btip("Léčení")}>Léčit</button><input type="number" name="bkzr-${h.id}" data-bkzrv min="0" max="300" inputmode="numeric" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-bkzr="z" ${btip("Zranění – odečte se s odolnostmi a dočasnými HP")}>Zranit</button></div>
      <div class="kdbhpc"><span><small>Teď</small><b>${cur}</b></span><i>/</i><span ${btip(`Maximum životů ${mx}: ${kRozpis(kHodn(K,"hp").L)}`)}><small>Max</small><b>${mx}</b></span><span class="kdbtmp"><small>Dočasné</small><b>${ks.thp||"–"}</b></span></div>
      <div class="kdbhpo"><select data-bkzrt aria-label="Typ zranění">${BZTYPY.map(t=>`<option value="${t}">${BZRT[t]}</option>`).join("")}</select><button type="button" class="kdbmini" data-bkzr="d" ${btip("Dočasné HP (nesčítají se – platí vyšší)")}>+ dočasné</button>${ks.vycerp?`<span class="bkvy" ${btip(`Vyčerpání ${ks.vycerp}: −${2*ks.vycerp} k hodům d20`)}>vyčerpání ${ks.vycerp}</span>`:""}<a class="bklink" href="#karty/${besc(K.id)}">celá karta →</a></div><h3 class="kdbpt">Životy</h3><i class="kdbhpbar" style="--p:${pr}%"></i></div>
    <div class="kdbsm"><small>Pěšky</small><b>${kRychN(K)}<i> st.</i></b><small>rychlost</small></div>
    <div class="kdbsm" ${btip("Pasivní Vnímání")}><small>Vnímání</small><b>${kPas(K,"vnimani")}</b><small>pasivní</small></div></div>`}
/* záchrany, iniciativa, zdroje a sloty – na kliknutí */
function bojKartaOvl(h,s,gm){const K=bojKartaH(h);if(!K)return "";const U=kartaStav(K.id).zdr||{},pf=K.zachProf||[];
  const zach=`<section class="kdbp kdbzach"><div class="kdbzg">${BAB.map(a=>`<div class="kdbzr${pf.includes(a)?" kprof":""}"><i class="kdbdot" aria-hidden="true"></i><span>${a}</span><button type="button" data-bkzh="${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K,a))} · ${kRozpis(kHodn(K,"zach",a).L)}`)}>${bsg(kZach(K,a))}</button></div>`).join("")}</div>${K.konVyhoda?`<p class="kdbnote"><button type="button" class="kdbmini" data-bkzh="CON" data-adv="1" ${btip("CON záchrana pro udržení soustředění s výhodou (War Caster)")}>soustředění ${bsg(kZach(K,"CON"))} s výhodou</button></p>`:""}${kOdol(K).length||(K.imu||[]).length?`<p class="kdbnote">${kOdol(K).length?`<b>Resistance</b> ${kOdol(K).map(t=>bikZr(t)+besc(BZRT[t]||t)).join(" ")}`:""}${(K.imu||[]).length?` · <b>Immunity</b> ${K.imu.map(t=>besc(BZRT[t]||t)).join(", ")}`:""}</p>`:""}<h3 class="kdbpt">Záchranné hody</h3></section>`;
  const sl=kSloty(K).map(q=>({k:q.k,n:`${q.pakt?"Pakt":"Sloty"} ${q.st}. st.`,max:q.max}));
  const zd=[...sl,...kZdroje(K).map(q=>({k:q.n,n:q.n,max:q.max,obn:q.obn})),...(kVydMax(K)?[{k:"Výdrž",n:"Výdrž",max:kVydMax(K),obn:"dlouhý odpočinek"}]:[])];
  const zdH=zd.length?`<section class="kdbp kdbzdrc"><ul class="kdbli kdbzdr">${zd.map(q=>{const u=Math.min(q.max,U[q.k]||0);return `<li><b>${besc(q.n)}</b><span class="kdbpips" ${btip(`${q.n}: použito ${u} z ${q.max}${q.obn?" · obnova: "+q.obn:""}`)}>${[...Array(q.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-bkzd="${besc(q.k)}" data-j="${j}" aria-label="${besc(q.n)} ${j+1} z ${q.max}${j<u?" – použito":""}"></button>`).join("")}</span></li>`}).join("")}</ul><h3 class="kdbpt">Omezené použití</h3></section>`:"";
  return zach+zdH}
/* celá karta ke čtení (vlastnosti, dovednosti, smysly, rysy, kouzla) */
function bojKartaInfo(K){if(!K)return "";const ab=a=>{const v=(K.vl||{})[a];return v==null?"":`<span><small>${a}</small><b>${v}</b><i>${bsg(Math.floor((v-10)/2))}</i></span>`};const kz=K.kouzla||{};
  return `<details class="bjapd bkinfo" data-otv="karta-${K.id}"${BOTV.has("karta-"+K.id)?" open":""}><summary>Karta postavy – ${besc(K.n)}${K.test?" <small>(zkušební)</small>":""}</summary>
    <p class="rsmall">${besc([K.druh,K.povolani,K.pozadi].filter(Boolean).join(" · "))}${K.hrac?` · hraje ${besc(K.hrac)}`:""}</p>
    <div class="bkvl">${BAB.map(ab).join("")}</div>
    <p class="rsmall"><b>Iniciativa</b> ${bsg(kIni(K))} · <b>Zdatnost</b> ${bsg(kPB(K))} · <b>Rychlost</b> ${besc(K.rychlost||"")} · <b>Kostky životů</b> ${besc(kHDtxt(K))}${(K.odol||[]).length?` · <b>Resistance</b> ${besc(K.odol.map(t=>BZRT[t]||t).join(", "))}`:""}</p>
    <p class="rsmall"><b>Smysly</b> ${besc(K.smysly||"")}${K.pasiv?` · pasivní Vnímání ${K.pasiv.vnimani}, Vhled ${K.pasiv.vhled}, Pátrání ${K.pasiv.patrani}`:""}</p>
    ${(K.zachPozn||[]).length?`<p class="rsmall"><b>Záchrany:</b> ${besc(K.zachPozn.join("; "))}</p>`:""}
    ${K.dov?`<p class="rsmall bkdov">${Object.entries(K.dov).map(([k,v])=>`${besc(k)} ${bsg(v)}`).join(" · ")}</p>`:""}
    ${(K.utoky||[]).length?`<ul class="bkut">${K.utoky.map(a=>`<li><b>${besc(a.n)}</b> ${bsg(+a.b||0)} · ${besc(a.z||"")} ${besc(BZRT[a.t]||a.t||"")}${a.pocet>1?` · ${a.pocet}×`:""}${(a.vl||[]).length?` · <small>${besc(a.vl.join(", "))}</small>`:""}${a.pozn?`<br><small>${besc(a.pozn)}</small>`:""}</li>`).join("")}</ul>`:""}
    ${(kz.seznam||[]).length?`<p class="rsmall"><b>Kouzla</b> (${besc(kz.vl||"")}, SO ${kz.dc}, útok ${bsg(+kz.utok||0)}): ${[0,1,2,3,4,5,6,7,8,9].filter(l=>kz.seznam.some(x=>x.st===l)).map(l=>`<i>${l?l+". st.":"triky"}:</i> ${kz.seznam.filter(x=>x.st===l).map(x=>besc(x.n)+(x.kon?" ◎":"")+(x.zach?` (${besc(x.zach)})`:"")).join(", ")}`).join(" · ")} <small>◎ = Concentration</small></p>`:""}
    ${(K.rysy||[]).length?`<ul class="bkrys">${K.rysy.map(r=>`<li>${besc(r)}</li>`).join("")}</ul>`:""}</details>`}
/* list postavy z PDF D&D Beyond → karta postavy. F = pole formuláře z pdf.js (getAnnotations): {f:název, v:hodnota, p:strana, r:[x1,y1,x2,y2]} */
function kartaZPdf(F){
  const N=s=>String(s||"").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
  const P=F.filter(q=>q&&q.f&&q.v!=null&&String(q.v).trim()!==""&&String(q.v).trim()!=="--").map(q=>({f:N(q.f),v:String(q.v).replace(/\r/g,"").trim(),p:q.p||1,r:q.r||[0,0,0,0]}));
  const g=(...n)=>{for(const k of n){const x=P.find(q=>q.f===k);if(x)return x.v}return ""};
  const num=t=>{const m=String(t||"").replace(/[−–]/g,"-").replace(/,/g,"").match(/[+-]?\d+/);return m?+m[0]:null};
  const ft=t=>N(t).replace(/(\d+)\s*ft\.?/g,"$1 stop").replace(/\(Walking\)/g,"").replace(/\(Climbing\)/g,"šplhání").replace(/\(Swimming\)/g,"plavání").replace(/\(Flying\)/g,"let").replace(/\s+,/g,",").replace(/(\d+ stop)\s*šplhání/g,"šplhání $1").replace(/(\d+ stop)\s*plavání/g,"plavání $1").replace(/(\d+ stop)\s*let/g,"let $1").trim();
  const slug=t=>N(t).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"postava";
  const n=g("CharacterName","CharacterName2");if(!n)throw new Error("V PDF chybí jméno postavy – je to list postavy z D&D Beyond?");
  const povolani=g("CLASS LEVEL","CLASS LEVEL2");
  const K={id:slug(n),n,hrac:g("PLAYER NAME"),druh:g("RACE"),povolani,uroven:(povolani.match(/\d+/g)||[]).reduce((a,b)=>a+ +b,0)||null,pozadi:g("BACKGROUND"),xp:num(g("EXPERIENCE POINTS")),zdroj:"PDF z D&D Beyond",importovano:new Date().toISOString().slice(0,10)};
  const AB=[["STR","STR","Strength"],["AGI","DEX","Dexterity"],["CON","CON","Constitution"],["INT","INT","Intelligence"],["WIS","WIS","Wisdom"],["CHA","CHA","Charisma"]];
  K.vl={};K.zach={};K.zachProf=[];
  AB.forEach(([k,f,l])=>{const v=num(g(f));if(v!=null)K.vl[k]=v;const z=num(g("ST "+l));if(z!=null)K.zach[k]=z;if(g(l.slice(0,3)+"Prof",l.slice(0,3).toUpperCase()+"Prof",l.slice(0,2)+"Prof"))K.zachProf.push(k)});
  const sm=g("SaveModifiers");K.zachPozn=sm?sm.split(/\n+/).map(N).filter(Boolean).map(kZachPoznCz):[];
  const def=g("Defenses"),TY=["Bludgeoning","Piercing","Slashing","Fire","Cold","Lightning","Thunder","Acid","Poison","Necrotic","Radiant","Psychic","Force"],typy=t=>TY.filter(x=>new RegExp("\\b"+x+"\\b","i").test(t||""));
  K.odol=typy((def.match(/Resistances?\s*[-–:]\s*([^\n]*)/i)||[])[1]);K.imu=typy((def.match(/Immunit(?:y|ies)\s*[-–:]\s*([^\n]*)/i)||[])[1]);K.zra=typy((def.match(/Vulnerabilit(?:y|ies)\s*[-–:]\s*([^\n]*)/i)||[])[1]);
  if(def)K.obrana=N(def);
  K.ac=num(g("AC"));K.hp=num(g("MaxHP"));K.kz=N(g("Total"));K.ini=num(g("Init"))||0;K.zdatnost=num(g("ProfBonus"));K.rychlost=ft(g("Speed"));
  const sen=g("AdditionalSenses");K.smysly=ft(sen);K.vidiTma=/darkvision|devil|truesight|blindsight/i.test(sen);
  K.pasiv={vnimani:num(g("Passive1")),vhled:num(g("Passive2")),patrani:num(g("Passive3"))};
  const DOV=[["Acrobatics","Acrobatics"],["Animal Handling","Animal"],["Arcana","Arcana"],["Athletics","Athletics"],["Deception","Deception"],["History","History"],["Insight","Insight"],["Intimidation","Intimidation"],["Investigation","Investigation"],["Medicine","Medicine"],["Nature","Nature"],["Perception","Perception"],["Performance","Performance"],["Persuasion","Persuasion"],["Religion","Religion"],["Sleight of Hand","SleightofHand"],["Stealth","Stealth"],["Survival","Survival"]];
  K.dov={};K.dovProf={};DOV.forEach(([l,f])=>{const v=num(g(f));if(v!=null)K.dov[l]=v;const pr=g(f+"Prof");if(pr)K.dovProf[l]=pr});
  /* kouzla: úroveň podle nadpisu nad kouzlem ve stejném sloupci; sloty z „2 Pact OO“ / „4 Slots OOOO“ */
  const hd=P.filter(q=>/^spellHeader\d+$/.test(q.f)).map(q=>({i:+q.f.match(/\d+$/)[0],p:q.p,x:q.r[0],y:q.r[1],l:/cantrip/i.test(q.v)?0:num(q.v)}));
  const lvl=q=>{const h=hd.filter(x=>(x.p<q.p)||(x.p===q.p&&Math.abs(x.x-q.r[0])<60&&x.y>q.r[1])).sort((a,b)=>a.p-b.p||b.y-a.y).pop();return h?h.l:0};
  const kz={vl:g("spellCastingAbility0"),dc:num(g("spellSaveDC0")),utok:num(g("spellAtkBonus0")),trida:g("spellCastingClass0"),sloty:[],seznam:[]};
  P.filter(q=>/^spellSlotHeader\d+$/.test(q.f)).forEach(q=>{const i=+q.f.match(/\d+$/)[0],h=hd.find(x=>x.i===i),m=q.v.match(/(\d+)\s*(Pact|Slots?)/i);if(h&&h.l&&m)kz.sloty.push({st:h.l,max:+m[1],pakt:/pact/i.test(m[2])})});
  P.filter(q=>/^spellName\d+$/.test(q.f)).forEach(q=>{const i=q.f.match(/\d+$/)[0],x=k=>g(k+i);const sh=x("spellSaveHit"),dur=x("spellDuration");
    const o={n:q.v,st:lvl(q),zdroj:x("spellSource"),cas:x("spellCastingTime"),dosah:ft(x("spellRange")),slozky:x("spellComponents"),trvani:dur,kon:/concentration/i.test(dur)};
    if(/^[+-]\d+$/.test(sh))o.utok=num(sh);else if(/[A-Z]{3}\s*\d+/.test(sh))o.zach=sh;if(x("spellPrepared")==="P")o.vzdy=true;const nt=x("spellNotes");if(nt)o.pozn=nt;kz.seznam.push(o)});
  if(kz.seznam.length||kz.dc)K.kouzla=kz;
  /* útoky: „Wpn Name“, „Wpn Name 2“… */
  const spellBy=Object.fromEntries(kz.seznam.map(s=>[s.n.toLowerCase(),s]));
  K.utoky=[];P.filter(q=>/^Wpn Name ?\d*$/.test(q.f)).forEach(q=>{const i=(q.f.match(/(\d+)$/)||[0,"1"])[1],b=num(g(`Wpn${i} AtkBonus`)),dm=g(`Wpn${i} Damage`),nt=g(`Wpn Notes ${i}`);
    const z=(dm.replace(/\s/g,"").match(/^\d*d\d+(?:[+-]\d+)?/i)||[""])[0].toLowerCase(),t=typy(dm)[0]||"",sp=spellBy[q.v.toLowerCase()],cnt=(nt.match(/Count:\s*(\d+)/i)||[])[1];
    const vl=nt.split(/,\s*/).map(N).filter(x=>x&&!/^count:/i.test(x)&&!/^[VSM](\/[VSM])*$/.test(x));
    const a={n:q.v,b,z,t};if(cnt&&+cnt>1)a.pocet=+cnt;if(/range|thrown|ammunition|loading/i.test(nt)||(sp&&/\d{2,}\s*stop/.test(sp.dosah||"")&&!/self|touch|sebe/i.test(sp.dosah||"")))a.dal=true;
    if(vl.length)a.vl=vl;if(dm&&!z)a.pozn=dm;if(b!=null||z)K.utoky.push(a)});
  /* zdroje a rysy z textů schopností: „Název • 4 / Long Rest“, „| 2 / Long Rest • 1 Bonus Action“ pod názvem */
  const txt=P.filter(q=>/^(FeaturesTraits|Actions)\d+$/.test(q.f)||/^Additional ?Features/i.test(q.f)).sort((a,b)=>a.p-b.p||b.r[1]-a.r[1]).map(q=>q.v).join("\n");
  const rysy=[],zdr=[];let tit="";
  txt.split(/\n/).map(N).forEach(l=>{const mt=l.match(/^[*|]\s*([^•|]+?)\s*(?:•.*)?$/);const mr=l.match(/(\d+)\s*\/\s*(Long|Short) Rest/i);
    if(mt&&!/^\d+\s*\//.test(mt[1])){tit=mt[1].replace(/\s*(PHB|XGtE|TCoE|SCAG|EE|br)-?\d*.*$/,"").trim();if(l[0]==="*"&&tit&&!rysy.includes(tit))rysy.push(tit)}
    if(mr){const nm=(l.match(/^([^•|*]+?)\s*•\s*\d+\s*\//)||[])[1]||tit;if(nm&&!zdr.some(z=>z.n===N(nm)))zdr.push({n:N(nm).replace(/^[*|]\s*/,""),max:+mr[1],obn:/short/i.test(mr[2])?"krátký odpočinek":"dlouhý odpočinek"})}});
  K.zdroje=zdr;K.rysy=rysy;
  /* více útoků za akci (Extra Attack, Thirsting Blade) u zbraní, ne u kouzel; Hexblade's Curse a Hex jako přepínače */
  if(/Extra Attack|Thirsting Blade/i.test(txt))K.utoky.forEach(a=>{if(!spellBy[a.n.toLowerCase()]&&!(a.pocet>1))a.pocet=2});
  K.efekty=[];if(/Hexblade.s Curse/i.test(txt))K.efekty.push({n:"Hexblade's Curse: Damaging Hex",zr:K.zdatnost||2,pozn:"+zdatnost ke zranění proti prokletému cíli"},{n:"Hexblade's Curse: Striking Hex",krit:19,pozn:"kritický zásah na 19–20 proti prokletému cíli"});
  if(spellBy.hex)K.efekty.push({n:"Hex",zr:"1d6",t:"Necrotic",pozn:"+1d6 Necrotic proti očarovanému cíli"});
  /* vybavení a peníze */
  const att=new Set(P.filter(q=>/^Attuned Name\d+$/.test(q.f)).map(q=>q.v));
  /* D&D Beyond tiskne vlastní předměty ještě jednou na další stránce (stejná pole Eq Name) – ty se nepočítají dvakrát */
  {const vid=new Map();K.vybaveni=[];P.filter(q=>/^Eq Name\d+$/.test(q.f)).forEach(q=>{const i=q.f.match(/\d+$/)[0],w=g("Eq Weight"+i),qq=num(g("Eq Qty"+i))||1,key=N(q.v).toLowerCase()+"|"+qq+"|"+w;
    if(vid.has(key)&&vid.get(key)!==q.p)return;vid.set(key,q.p);K.vybaveni.push(Object.assign({n:N(q.v),q:qq},w&&w!=="--"?{w}:{},att.has(q.v)?{pripoutano:true}:{}))})}
  K.penize={};["CP","SP","EP","GP","PP"].forEach(k=>{const v=num(g(k));if(v)K.penize[k]=v});
  /* popis postavy (vlastní text hráče) */
  const pp={pohlavi:"GENDER",vek:"AGE",velikost:"SIZE",vyska:"HEIGHT",vaha:"WEIGHT",presvedceni:"ALIGNMENT",vira:"FAITH",pokozka:"SKIN",oci:"EYES",vlasy:"HAIR",povaha:"PersonalityTraits",idealy:"Ideals",pouta:"Bonds",vady:"Flaws",spojenci:"AlliesOrganizations",pribeh:"Backstory",poznamky:"AdditionalNotes1"};
  K.popis={};Object.entries(pp).forEach(([k,f])=>{const v=g(f);if(v)K.popis[k]=v});
  K.konVyhoda=/advantage on con\w* saving throws that you make to maintain/i.test(sm)||rysy.some(r=>/war caster/i.test(r));
  {const RY=kRysyZPdf(F);if(RY.rysy.length)K.rysy2=RY.rysy;K.akce=RY.akce;if(Object.keys(RY.zd).length)K.zd=RY.zd;if(Object.keys(RY.texty).length)K.texty=RY.texty;
   RY.rysy.filter(r=>r.max&&!K.zdroje.some(z=>z.n===r.n)).forEach(r=>K.zdroje.push({n:r.n,max:r.max,obn:r.obn}))}
  if(!(K.ac>0)||!(K.hp>0))throw new Error("V PDF chybí AC nebo maximum životů.");
  return K}
