/* ===== Karta: vybavení z nabídky (2026-10-17) – zbraně a zbroj SRD 5.2.1, výstroj, magické předměty SRD.
   Zbraň se zvolí k útoku (karta i Boj), zbroj a štít si postava oblékne, magický předmět se připoutá, je-li volné místo. ===== */
const KZBRL=[["Padded Armor",8,"lehká"],["Leather Armor",10,"lehká"],["Studded Leather Armor",13,"lehká"],["Hide Armor",12,"střední"],["Chain Shirt",20,"střední"],["Scale Mail",45,"střední"],["Breastplate",20,"střední"],["Half Plate Armor",40,"střední"],
  ["Ring Mail",40,"těžká"],["Chain Mail",55,"těžká"],["Splint Armor",60,"těžká"],["Plate Armor",65,"těžká"]];
const KZBRW={Club:2,Dagger:1,Greatclub:10,Handaxe:2,Javelin:2,"Light Hammer":2,Mace:4,Quarterstaff:4,Sickle:2,Spear:3,Dart:0.25,"Light Crossbow":5,Shortbow:2,Sling:0,Battleaxe:4,Flail:2,Glaive:6,Greataxe:7,Greatsword:6,Halberd:6,Lance:6,Longsword:3,Maul:10,
  Morningstar:4,Pike:18,Rapier:2,Scimitar:3,Shortsword:2,Trident:4,Warhammer:5,"War Pick":2,Whip:3,"Hand Crossbow":3,"Heavy Crossbow":18,Longbow:2,Musket:10,Pistol:3,Blowgun:1,Shield:6};
const KVYBS=[["Arrows (20)",1],["Bolts (20)",1.5],["Sling Bullets (20)",1.5],["Firearm Bullets (10)",2],["Backpack",5],["Bedroll",7],["Blanket",3],["Candle",0],["Chain (10 feet)",10],["Crowbar",5],["Flask",1],["Grappling Hook",4],["Healer's Kit",3],["Holy Water (flask)",1],
  ["Holy Symbol",1],["Hunting Trap",25],["Lamp",1],["Hooded Lantern",2],["Manacles",6],["Oil (flask)",1],["Pouch",1],["Rations (1 day)",2],["Rope (50 feet)",5],["Sack",0.5],["Shovel",5],["Iron Spikes (10)",5],["Tinderbox",1],["Torch",1],["Waterskin",5],
  ["Component Pouch",2],["Spellbook",3],["Thieves' Tools",1],["Climber's Kit",12],["Herbalism Kit",3],["Poisoner's Kit",2],["Mirror",0.5],["Ink",0],["Paper (sheet)",0],["Parchment (sheet)",0],["Caltrops",2],["Ball Bearings",2],["Clothes, Traveler's",4],["Clothes, Fine",6]];
const KZBRV=(()=>{try{return JSON.parse(localStorage.getItem("mm-zbrv")||"{}")||{}}catch(e){return {}}})();
const kZbrvUloz=()=>{try{localStorage.setItem("mm-zbrv",JSON.stringify(KZBRV))}catch(e){}};
let KPOOLM=null,KPOOLO=false;
document.addEventListener("toggle",e=>{const d=e.target;if(d.matches&&d.matches("details[data-kpoolw]"))KPOOLO=d.open},true);
function kPool(){if(KPOOLM&&KPOOLM.$p===!!PRED)return KPOOLM;const M={$p:!!PRED},add=(l,o)=>{M[l]=o};
  KZBRAN.forEach(r=>add(`${r[1]} – ${r[5]==="S"?"jednoduchá":"válečná"} zbraň ${r[2]} ${BZRT[r[3]]||r[3]}${r[6]?", na dálku":""}`,{k:"zbr",n:r[1],w:KZBRW[r[1]]}));
  KZBRL.forEach(([n,w,d])=>{const i=kZbrInfo({n});add(`${n} – ${d} zbroj, AC ${i?i.ac:"?"}${i&&i.max!=null?` + AGI (nejvýš ${i.max>8?"bez omezení":"+"+i.max})`:i&&i.max==null?"":" + AGI"}`,{k:"zbroj",n,w})});
  add("Shield – štít, +2 AC",{k:"zbroj",n:"Shield",w:6});
  KVYBS.forEach(([n,w])=>add(`${n} – výstroj`,{k:"vyb",n,w}));
  (PRED||[]).forEach(x=>add(`${x.en}${x.cz&&x.cz.toLowerCase()!==x.en.toLowerCase()?` (${x.cz})`:""} – ${String(x.druh||"").toLowerCase()}, ${x.vz||""}${x.pr?", připoutání":""}`,{k:"mag",n:x.en,mag:x.id,upr:x.upr||""}));
  return KPOOLM=M}
/* základ magické zbraně nebo zbroje podle „upr“ (Longsword, jakákoli zbraň na blízko, jakákoli střední nebo těžká…) */
function kPoolZaklady(e){if(!e||e.k!=="mag")return [];const u=String(e.upr||""),x=PREDBY[e.mag]||{},W=KZBRAN.map(r=>r[1]),A=[...KZBRL.map(r=>r[0]),"Shield"];
  if(!u)return [];if(/munice/i.test(u))return ["Arrows","Bolts","Sling Bullets"];
  const jm=[...W,...A].filter(n=>new RegExp("\\b"+n.replace(/ Armor$/,"")+"\\b","i").test(u));
  if(!/jakákoli/i.test(u))return jm.length?jm:[];
  if(x.druh==="Zbroj"||/lehká|střední|těžká/i.test(u)){let L=KZBRL.filter(r=>/lehká/i.test(u)&&r[2]==="lehká"||/střední/i.test(u)&&r[2]==="střední"||/těžká/i.test(u)&&r[2]==="těžká").map(r=>r[0]);if(/kromě hide/i.test(u))L=L.filter(n=>n!=="Hide Armor");return L}
  if(/na blízko/i.test(u))return KZBRAN.filter(r=>!r[6]).map(r=>r[1]);return W}
function kPoolDopl(e){const Z=kPoolZaklady(e),bon=e&&e.k==="mag"&&/\+1, \+2, or \+3/.test(e.n);
  return `${Z.length?`<select name="zakl" aria-label="Základ předmětu">${Z.map(n=>`<option>${besc(n)}</option>`).join("")}</select>`:""}${bon?`<select name="bon" aria-label="Bonus"><option value="1">+1</option><option value="2">+2</option><option value="3">+3</option></select>`:""}`}
function kPoolHtml(K){if(!kMuze(K))return "";const M=kPool();
  return `<details class="bjapd kpool" data-kpoolw${KPOOLO?" open":""}><summary>Přidat z nabídky – zbraně, zbroj, výstroj, magické předměty</summary>
    <form class="kvlh kpoolf" data-kpoolf><input name="p" list="kpooll-${besc(K.id)}" placeholder="hledat: Longsword, Breastplate, Rope, Flame Tongue…" data-kpoolq autocomplete="off" required>
      <datalist id="kpooll-${besc(K.id)}">${Object.keys(M).filter(k=>k!=="$p").map(l=>`<option value="${besc(l)}"></option>`).join("")}</datalist>
      <span class="kpoolx" data-kpoolx></span><input name="q" type="number" min="1" max="999" value="1" aria-label="Počet" style="width:4.5em"><button class="gbtn">Přidat</button></form>
    <p class="kdbnote">Zbraň se rovnou zvolí k útoku (i v Boji), zbroj a štít si postava oblékne a AC se přepočítá, magický předmět se připoutá, je-li volné místo (nejvýš 3).${PRED?"":" Magické předměty se načítají…"}</p></details>`}
const kJeZbran=(K,n)=>!/beze zbraně|unarmed/i.test(n)&&!kSeznam(K).some(x=>String(x.n).toLowerCase()===String(n).toLowerCase());
const kLbTxt=w=>w>0?`${String(Math.round(w*100)/100).replace(".",",")} lb.`:"";
async function kPoolPridej(K,F){const f=F.elements,e=kPool()[f.p.value.trim()];if(!e){mmHlasG("Vyber položku z nabídky (začni psát a klepni na návrh).",3500);return}
  const q=Math.max(1,Math.min(999,Math.round(+f.q.value||1))),zakl=f.zakl?f.zakl.value:"",bon=f.bon?+f.bon.value:0;let n=e.n,w1=e.w||0;
  if(e.k==="mag"){const x=PREDBY[e.mag]||{};if(zakl){w1=KZBRW[zakl]??(KZBRL.find(r=>r[0]===zakl)||[])[1]??0;const gn=x.en&&x.en.match(/^(Weapon|Armor|Shield|Ammunition), \+(\d)$/);n=bon?`${zakl} +${bon}`:gn?`${zakl} +${gn[2]}`:new RegExp("\\b"+zakl+"\\b","i").test(x.en)?x.en:`${x.en} (${zakl})`}else if(bon)n=x.en.replace(/,?\s*\+1, \+2, or \+3/,` +${bon}`)}
  n=n.slice(0,80);const S=kartaStav(K.id),inv=[...(S.inv||K.vybaveni||[])].map(y=>Object.assign({},y)),it={n,q},msg=[];if(w1)it.w=kLbTxt(w1*q);if(e.mag)it.mag=e.mag;
  const P=e.mag?PREDBY[e.mag]:null;if(P&&P.pr){if(inv.filter(y=>y.pripoutano).length<3){it.pripoutano=true;msg.push("připoutáno")}else msg.push("připoutat nejde – už 3 předměty (uvolni jeden ◆)")}
  const r=kZbrInfo(it);if(r){inv.forEach(y=>{const z=kZbrInfo(y);if(z&&z.k===r.k)y.obl=false});it.obl=true;msg.push(r.k==="s"?"štít v ruce":"zbroj na sobě")}
  const ex=!r&&!kZbranInfo(n)?inv.findIndex(y=>String(y.n).toLowerCase()===n.toLowerCase()&&(y.mag||"")===(it.mag||"")):-1;
  if(ex>=0){inv[ex].q=Math.min(9999,(+inv[ex].q||0)+q);if(w1)inv[ex].w=kLbTxt(w1*inv[ex].q)}else inv.push(it);
  const ac0=kAC(K);await kartaStavZmen(K.id,{inv});
  if(kZbranInfo(n)&&!/^(arrows|bolts|sling bullets)/i.test(n)){KZBRV[K.id]=n;kZbrvUloz();msg.push("zbraň zvolena k útoku");kartyPrekresli()}
  f.p.value="";const x=F.querySelector("[data-kpoolx]");if(x)x.innerHTML="";f.q.value=1;
  mmHlasG(`${K.n}: ${n}${q>1?` ×${q}`:""} ve vybavení${msg.length?" – "+msg.join(", "):""}${kAC(K)!==ac0?` · AC ${ac0} → ${kAC(K)}`:""}.`,6000)}
document.addEventListener("input",e=>{const t=e.target;if(!t.matches||!t.matches("[data-kpoolq]"))return;const x=t.form&&t.form.querySelector("[data-kpoolx]");if(!x)return;const en=kPool()[t.value.trim()];const h=en?kPoolDopl(en):"";if(x.innerHTML!==h)x.innerHTML=h});
document.addEventListener("submit",e=>{if(!e.target.matches||!e.target.matches("[data-kpoolf]"))return;e.preventDefault();const K=kvK(e.target);if(K)kPoolPridej(K,e.target)});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kzbrv]");if(!b)return;const K=kvK(b);if(!K)return;const n=b.dataset.kzbrv;if(KZBRV[K.id]===n)delete KZBRV[K.id];else KZBRV[K.id]=n;kZbrvUloz();kartyPrekresli()});
/* ===== Boj: karta postavy hráče ve formátu karty NPC (2026-10-17) – hlavička (AC, životy, R), rozbalená část
   se stavy, krytem, útoky z karty, kouzly, zdroji, záchranami a akcemi. Vypravěč má rozbalenou postavu na tahu
   a může za hráče zapsat, co udělal (útok hozený fyzickými kostkami, zranění, záchrany). ===== */
const BGMU={};
/* sdílené části karty i bojové karty: čipy stavů s výběrem, čipy zdrojů, pruh hlášení */
const KSTP=new Set(),BTABH={},BHPT={};
/* tabulka stavů (jako Conditions v D&D Beyond): ikona, název, přepínač, rozbalení s pravidlem; vyčerpání po úrovních */
function kStavyTab(akt,vse,attr,vy,konN){const L=[...vse].sort((a,b)=>a.localeCompare(b,"cs")),cap=t=>t[0].toUpperCase()+t.slice(1);
  const row=t=>{const on=akt.includes(t),d=SRDST[t],ic=SRDIC[t]?bi(SRDIC[t]):(BSTI[t]?bi(BSTI[t][0]):""),txt=d?d.t:t==="soustředí"?"Soustředíš se na kouzlo (Concentration). Zranění = CON záchrana (SO 10 nebo polovina zranění, víc z obou), stav Neschopný soustředění ukončí; najednou jen jedno kouzlo.":t==="úhyb"?"Úhyb (Dodge): útoky na tebe mají nevýhodu, AGI záchrany máš s výhodou – do začátku tvého příštího tahu.":"";
    return `<details class="kstr${on?" on":""}"><summary><span class="kstri">${ic}</span><span class="kstrn">${besc(cap(t))}${d?` <small>${besc(d.en)}</small>`:t==="soustředí"?` <small>Concentration</small>${konN&&on?` <b class="kstrkon">· ${besc(konN)}</b>`:""}`:""}</span><button type="button" class="kstrs" role="switch" ${attr}="${besc(t)}" aria-checked="${on}" aria-label="${besc(cap(t))}: ${on?"zapnuto":"vypnuto"}"><i></i></button><span class="kstrv" aria-hidden="true"></span></summary>${txt?`<p>${besc(cap(txt))}.</p>`.replace(/\.\.<\/p>$/,".</p>"):""}</details>`};
  return `<div class="kstab">${L.map(row).join("")}<div class="kstrx"><div class="kstrxh"><span class="kstri">${bi("vycerpani")}</span><span class="kstrn">Vyčerpání <small>Exhaustion</small></span><b>${vy?`${vy}. úroveň`:"–"}</b></div>
    <div class="kstrxl" role="group" aria-label="Úroveň vyčerpání">${[0,1,2,3,4,5,6].map(n=>`<button type="button" data-kvyn="${n}" aria-pressed="${(vy||0)===n}">${n||"–"}</button>`).join("")}</div>
    ${vy?`<p class="bdmnote">−${2*vy} ke všem hodům d20, rychlost −${5*vy} stop${vy>=6?" · 6. úroveň = smrt":""}. Dlouhý odpočinek ubere jednu úroveň.</p>`:""}</div></div>`}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kvyn]");if(!b)return;const K=kvK(b);if(!K||!kMuze(K))return;const n=+b.dataset.kvyn;kartaStavZmen(K.id,{vycerp:n||null},n?`${K.n}: vyčerpání ${n}.`:`${K.n}: bez vyčerpání.`)});
/* přepínač ve <summary> nesmí rozbalit řádek */
document.addEventListener("click",e=>{const s=e.target.closest&&e.target.closest(".kstrs");if(s)e.preventDefault()},true);
function kStavyChipy(key,akt,vse,attr,popis){const open=KSTP.has(key);
  return `<span class="kstch">${akt.map(t=>`<button type="button" class="kchip kchst" ${attr}="${besc(t)}" ${btip((popis(t)||t)+" – klikni a zruš")}>${SRDIC[t]?bi(SRDIC[t]):(BSTI[t]?bi(BSTI[t][0]):"")}<span>${besc(t)}</span><i aria-hidden="true">×</i></button>`).join("")}<button type="button" class="kchip kchadd" data-kstp="${besc(key)}" aria-expanded="${open}">${open?"hotovo":"+ stav"}</button></span>${open?`<span class="kstpick">${vse.filter(t=>!akt.includes(t)).map(t=>`<button type="button" class="kchip" ${attr}="${besc(t)}" ${btip(popis(t)||t)}>${SRDIC[t]?bi(SRDIC[t]):(BSTI[t]?bi(BSTI[t][0]):"")}<span>${besc(t)}</span></button>`).join("")}</span>`:""}`}
function kZdrChipy(L,U,attr){return L.length?`<span class="kzdch">${L.map(q=>{const u=Math.min(q.max,U[q.k]||0),zb=q.max-u;return `<span class="kchip kzdc${zb?"":" kzd0"}"><button type="button" ${attr}="${besc(q.k)}" data-j="${Math.min(u,q.max-1)}" ${zb?"":"disabled "}${btip(`${q.n}: ${zb?"klikni a utrať jedno":"vše použito"}${q.obn?" · obnova: "+q.obn:""}`)}><span>${besc(q.n)}</span><b>${zb}/${q.max}</b></button>${u?`<button type="button" class="kzdv" ${attr}="${besc(q.k)}" data-j="${u-1}" aria-label="Vrátit jedno – ${besc(q.n)}" ${btip("Vrátit jedno použití")}>↺</button>`:""}</span>`}).join("")}</span>`:""}
const kHlas=parts=>{const p=parts.filter(Boolean);return p.length?`<div class="khlas" role="status">${p.join("")}</div>`:""};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kstp]");if(!b)return;const k=b.dataset.kstp;if(KSTP.has(k))KSTP.delete(k);else KSTP.add(k);if(curView==="boj")renderBoj();else kartyPrekresli()});
/* tah hráče: pohyb, akce, bonusová akce (na tomto zařízení), reakce (v boji) */
function bojBpt(s){const k=`${s.kolo}:${s.tah}`;if(BPT.k!==k){BPT.k=k;BPT.p=BPT.a=BPT.b=0}return BPT}
function bojBptOznac(c){if(!BOJ.s||!BOJ.s.aktivni)return;bojBpt(BOJ.s);if(c==="A")BPT.a=1;else if(c==="BA")BPT.b=1}
function bojHracKarta(s,h,gm,vzdy){const K=bojKartaH(h),ob=s.obsazeni||{},tah=s.tah||0,jed=Object.keys(ob).some(k=>ob[k]===h.id&&+k<tah),natahu=ob[tah]===h.id;
  if(gm&&K&&BDM.fokus&&BDM.fokus===K.id){bojVyber(h.id);BTAB="k";BDM.fokus=null;setTimeout(()=>{const c=document.querySelector(`[data-bhcard="${CSS.escape(h.id)}"]`);if(c)c.scrollIntoView({block:"start",behavior:"smooth"})},60)}
  const open=vzdy||(gm&&bojOtevr(s,h)),st=(h.stav||[]).filter(t=>BSTI[t]),rk=!!(s.reak||{})[h.id],rd=(s.ready||{})[h.id],kr=(bojKritPC()[h.n]||[]).length;
  const mx=K?kHPmax(K):0,cur=K?bojHpPC(h,K):0,ks=K?kartaStav(K.id):{},pr=K?Math.max(0,Math.min(100,Math.round(cur/mx*100))):0,ac=K?kAC(K)+(+h.kryt||0):null;
  const hp=K?`<span class="bhpw"><label class="bhp${cur<=0?" bhp0":cur<=mx/2?" bhp2":""}" ${btip("Životy z karty: číslo nastaví, −12 odečte (zranění), +5 přičte (léčení) – Enter")}><span class="vh">HP</span><input type="text" autocomplete="off" enterkeyhint="done" inputmode="numeric" name="bjhp-${h.id}" data-bjhp="${h.id}" value="${cur}" aria-label="Životy – ${besc(h.n)}"${!gm&&!kMuze(K)?" readonly":""}><small>/${mx}${ks.thp?` +${ks.thp}`:""}</small><i style="--p:${pr}%"></i></label></span>`:"";
  const acH=K?`<span class="bracw" role="img" aria-label="AC ${ac}" ${btip(`AC ${kAC(K)}${h.kryt?` + kryt ${h.kryt}`:""}: ${kACR(K).txt}`)}><span class="brac">${ac}</span></span>`:"";
  const sub=K?`<small>${besc([kTridy(K).map(t=>t.n+" "+t.u).join(" / ")||K.povolani,K.druh].filter(Boolean).join(" · "))}</small>`:"";
  const P=bojBpt(s),mojeTah=vzdy&&natahu;
  const pips=`<span class="btpips" role="group" aria-label="Tah">${mojeTah?[["p","Pohyb","P"],["a","Akce","A"],["b","Bonusová akce","BA"]].map(([k,l,z])=>`<button type="button" data-btp="${k}" aria-pressed="${!!P[k]}" ${btip(`${l}: ${P[k]?"použito":"k dispozici"} – klikni`)}>${z}</button>`).join(""):""}<button type="button" class="break${rk?" on":""}" ${gm?`data-break="${h.id}"`:vzdy?"data-bhrk":"disabled"} aria-pressed="${rk}" ${btip(`Reakce – ${h.n}: ${rk?"použita":"k dispozici"}${gm||vzdy?" (klikni)":""}`)}>R</button></span>`;
  const head=`<div class="bnh">${bojMedH(h)}<span class="bnn"${gm&&!vzdy?` data-bhrozb="${h.id}"`:""}><b>${besc(h.n)}</b>${sub}</span>${acH}${hp}${kr?`<span class="bkrb" ${btip(`Neléčená kritická zranění: ${(bojKritPC()[h.n]||[]).map(x=>x.t).join("; ")}`)}>✚${kr}</span>`:""}${bojDsPip(h)}${!open&&st.length?`<span class="bstavy bakt">${st.map(t=>`<span class="bst" role="img" aria-label="${besc(BSTI[t][1])}" ${btip(BSTI[t][1])}>${bi(BSTI[t][0])}</span>`).join("")}</span>`:""}${!open&&h.kryt?`<span class="bkrbd" ${btip(`Za krytem: AC +${h.kryt}`)}>${bi("kryt")}<small>+${h.kryt}</small></span>`:""}${!open&&rd?`<b class="brdyh" ${btip("Připravená akce: "+rd)}>⏳</b>`:""}${K&&KKON[K.id]&&kKonDrzi(K)?`<span class="bkonbd" ${btip(`Soustředění: CON záchrana SO ${KKON[K.id]}`)}>${bi("soustredi")}<small>SO ${KKON[K.id]}</small></span>`:""}${vzdy?"":`<span class="btahy" role="img" aria-label="${jed?"V tomto kole jednal":"Ještě nejednal"}" ${btip(jed?"V tomto kole už jednal":natahu?"Je na tahu":"V tomto kole ještě nejednal")}>${bi(jed?"tahok":"tah",jed?"on":"")}</span>`}${pips}${vzdy||!gm?"":`<button type="button" class="brozb" data-bhrozb="${h.id}" aria-expanded="${open}" aria-label="${open?"Sbalit":"Rozbalit"} kartu" ${btip(open?"Sbalit kartu":"Rozbalit – útok, kouzla, akce, záchrany")}>${bi("sipka")}</button>`}</div>`;
  return `<div class="bnpc bhrk${open?" bopen":""}${natahu?" bnatahu":""}${h.ds?" bhdsr":""}" data-bhcard="${h.id}"${open?` data-bhpan="${h.id}"`:""}${K?` data-kid="${besc(K.id)}"`:""} style="--mc:var(--bh,#2c517f)">${open&&K?bojHracRef(s,h,gm,K,vzdy,{pips}):head+(open?bojHracRef(s,h,gm,K,vzdy):"")}</div>`}
function bojHracRef(s,h,gm,K,vzdy,dbm){if(!K)return `<div class="bref">${bojHracPanel(h,s,gm)}</div>`;
  const st=h.stav||[],d=h.ds,rd=(s.ready||{})[h.id],natahu=(s.obsazeni||{})[s.tah]===h.id,mojeTah=vzdy&&natahu,BP=bojBpt(s),rk0=!!(s.reak||{})[h.id];
  const stav=kStavyChipy("b:"+h.id,st.filter(t=>BSTAVH.includes(t)),BSTAVH,"data-bhst",t=>(BSTI[t]||[0,t])[1]);
  const kry=`<button type="button" class="kchip${h.kryt?" on":""}" data-bhkr="${h.kryt===5?0:h.kryt===2?5:2}" ${btip(`Kryt: ${h.kryt===5?"tříčtvrteční (+5)":h.kryt===2?"poloviční (+2)":"žádný"} – klikni: žádný → ½ → ¾`)}>${bi("kryt")}<span>${h.kryt===5?"kryt ¾":h.kryt===2?"kryt ½":"kryt"}</span></button>`;
  const typ=`<label class="kchip kchtyp" ${btip("Typ zranění pro pole životů v hlavičce (odolnosti se započtou)")}>${bi("zraneni")}<select data-bhpt="${h.id}" aria-label="Typ zranění">${[["","bez typu"],...BZTYPY.map(t=>[t,BZRT[t]])].map(([v,l])=>`<option value="${v}"${(BHPT[h.id]||"")===v?" selected":""}>${l}</option>`).join("")}</select></label><button type="button" class="kchip" data-bhthp="${h.id}" ${btip("Dočasné HP (nesčítají se – platí vyšší)")}>+ dočasné</button>`;
  const bar=`<div class="kbar1">${stav}${kry}${typ}<a class="kchip" href="#karty/${besc(K.id)}" ${btip("Celá karta postavy")}>karta →</a></div>`;
  /* hlášení: Pokušení/Požehnání, soustředění, hody proti smrti, připravená akce, výsledek útoku nebo hodu */
  const dsH=d?(d.st?`<p class="khl">${bojDsPip(h)} <b>${d.st==="mrtev"?"Tři neúspěchy – umírá.":"Stabilizován – do konce boje mimo hru."}</b> <button type="button" class="gbtn ghost" data-bhds="x">${d.st==="mrtev"?"Zrušit":"Zpět do boje"}</button></p>`
    :`<p class="khl">${bi("porazen")} <b>Na prahu smrti</b> ${bojDsPip(h)} <button type="button" class="gbtn" data-bhds="hod">🎲 Hod proti smrti</button>${gm?`<button type="button" class="gbtn ghost" data-bhds="u">+ úspěch</button><button type="button" class="gbtn ghost" data-bhds="n">+ neúspěch</button><button type="button" class="gbtn ghost" data-bhds="stab">stabilizovat</button>`:`<label class="bhdsv">svůj hod <input type="number" inputmode="numeric" min="1" max="20" data-bhdsv aria-label="Vlastní hod proti smrti (d20)"></label>`}<button type="button" class="gbtn ghost" data-bhds="x">vstal</button></p>`):"";
  const kon=KKON[K.id]&&kKonDrzi(K)?`<p class="khl">${bi("soustredi")} <b>Soustředění</b>: CON záchrana SO ${KKON[K.id]} <button type="button" class="gbtn" data-kkonh>🎲 CON ${bsg(kZach(K,"CON"))}${K.konVyhoda?" s výhodou":""}</button><button type="button" class="kx" data-kkonx aria-label="Zavřít">×</button></p>`:(gm?"":bojKonHtml(h));
  const rdy=rd?`<p class="khl">⏳ <b>Připravená akce:</b> ${besc(rd)} <button type="button" class="gbtn ghost" data-bhrdygo>Spustit (reakce)</button><button type="button" class="kx" data-bhrdyx aria-label="Zrušit">×</button></p>`:"";
  const c=(s.npc||[]).filter(o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0)),c0=c.find(o=>o.id===BJU.cil);
  const plak=!gm&&BJU.serie&&BJU.serie.length&&!BJU.plos?`<div class="khl kjuplak">${(()=>{const x=BJU.serie[0],v=BJU.serie.length===1?bojJaZas(c0,x.hod,x.d,x.krit):"";return v?`<b class="bjupv ${v==="vedle"?"bmis":"bkr"}">${v==="vedle"?"Vedle":v==="zásah"?"Zásah!":"Kritický zásah!"}</b> `:""})()}<small>${besc(BJU.info||"")}</small>${bojJaUprHtml(K)}${bojDB&&bojDB.utok?`<button type="button" class="gbtn" data-juposl>${BJU.serie.length>1?`Poslat ${BJU.serie.length} útoky`:"Poslat vypravěči"}</button>`:""}</div>`:"";
  const pripH=mojeTah&&!d&&!((s.hotovo||{})[h.id]===(s.kolo||1)*100+(s.tah||0))?(()=>{const L=bojPripKarta(s,h,K);return `<div class="khl kprip"><b>Tvůj tah</b>${L.length?`<ul>${L.map(x=>`<li>${besc(x)}</li>`).join("")}</ul>`:""}</div>`})():"";
  const hl=kHlas([vzdy?kZasahHtml(K,h,s):"",pripH,kZavBox(K),kon,dsH,rdy,plak,kPoslBox(K)]);
  /* záložky */
  const T0=BTABH[h.id]||"utok",tabs=[["utok","Útok"],...((K.kouzla&&(kSeznam(K)||[]).length)?[["kouzla","Kouzla"]]:[]),["akce","Akce"],["zach","Záchrany"]],tab=dbm?"utok":tabs.some(x=>x[0]===T0)?T0:"utok";
  const zb=bojZbrVse(s,h),zv=KZBRV[K.id];
  const utB=`${mojeTah&&BP.a?`<p class="kdbnote kneni-t">Akci už jsi v tomto tahu použil${zb.some(w=>w.pocet>1)?" (Extra Attack: další útoky téže akce hoď klidně)":""}.</p>`:""}<div class="butoky${mojeTah&&BP.a?" kneni":""}">${zb.map((w,i)=>w.karta?`<button type="button" class="gbtn ghost but${zv===w.n?" bzv":""}" ${gm?`data-bgmhod="${i}"`:`data-bjut="${i}"`} ${btip(`${w.n}: útok ${bsg(+w.b||0)}${w.z?`, zranění ${w.z} ${BZRT[w.t]||w.t||""}`:""}${w.pocet>1?` · ${w.pocet}× za akci`:""}${gm?" – hodí za hráče a předvyplní zápis":" – hodí útok; výsledek pošleš vypravěči"}`)}>${besc(w.n)} <b>${bsg(+w.b||0)}</b>${w.pocet>1?`<small>×${w.pocet}</small>`:""}<span class="biks">${bikZrTxt(w.t)}</span></button>`:"").join("")}</div>`;
  let body="";
  if(tab==="utok"){if(gm){const G=BGMU[h.id]||{};
      body=`${utB}<form class="bzrf bgmut" data-bgmut="${h.id}" ${btip("Hráč hodil kostkami u stolu: zapiš výsledek a útok se vyhodnotí proti AC cíle")}><span class="bkzlh">Zapsat za hráče</span><select name="ci" aria-label="Cíl"><option value="">cíl</option>${c.map(o=>`<option value="${o.id}"${G.ci===o.id?" selected":""}>${besc(o.n)}</option>`).join("")}</select><select name="zi" aria-label="Čím">${zb.map((w,i)=>`<option value="${i}"${String(G.zi??zb.findIndex(q=>q.n===zv))===String(i)?" selected":""}>${besc(w.n)}</option>`).join("")}<option value="">jiné…</option></select><input name="hod" type="number" inputmode="numeric" min="-10" max="60" placeholder="hod" value="${besc(G.hod??"")}" aria-label="Výsledek hodu na útok" style="width:4.2em"><input name="d" type="number" inputmode="numeric" min="1" max="20" placeholder="d20" value="${besc(G.d??"")}" aria-label="Přirozená kostka (nepovinné)" style="width:3.6em"><input name="dmg" type="number" inputmode="numeric" min="0" max="300" placeholder="zranění" value="${besc(G.dmg??"")}" aria-label="Zranění" style="width:4.8em"><select name="t" aria-label="Typ zranění"><option value="">typ zbraně</option>${BZTYPY.map(t=>`<option value="${t}"${G.t===t?" selected":""}>${BZRT[t]}</option>`).join("")}</select><button class="gbtn">Zapsat útok</button>${G.info?`<small class="bgmuinfo">${besc(G.info)}</small>`:""}</form>`}
    else{const nav=bojAdvHrac(s,h,c0,false),am=BJU.adv;
      body=bojDB&&bojDB.utok&&!h.ds?`<div class="butc"><label>Cíl <select name="jucil" data-ju="cil" aria-label="Cíl útoku"><option value="">—</option>${c.map(o=>`<option value="${o.id}"${BJU.cil===o.id?" selected":""}>${besc(o.n)}</option>`).join("")}</select></label><span class="badv" role="group" aria-label="Výhoda">${[["auto","auto"],["1","výhoda"],["-1","nevýhoda"],["0","bez"]].map(([k,l])=>`<button type="button" data-juadv="${k}" aria-pressed="${am===k}" ${btip(k==="auto"?(nav.v?`Teď ${nav.v>0?"výhoda":"nevýhoda"}: ${nav.why.join(", ")}`:"Teď bez výhody"):l)}>${l}${k==="auto"&&nav.v?` <b>${nav.v>0?"+":"−"}</b>`:""}</button>`).join("")}</span></div>${utB}${!BJU.serie&&BJU.info?`<p class="rsmall">${besc(BJU.info)}</p>`:""}${bojJaUtokHtml(s,h)}`:utB}}
  else if(tab==="kouzla"){const kz=Object.assign({},K.kouzla||{},{seznam:kSeznam(K)}),U=kartaStav(K.id).zdr||{};
    body=`<p class="kdbnote">${besc(kz.vl||"")} · SO ${kSpDC(K)||kz.dc||"–"} · útok kouzlem ${bsg(kSpUt(K))}</p>${kZdrChipy(kSloty(K).map(q=>({k:q.k,n:`${q.pakt?"Pakt":"Sloty"} ${q.st}. st.`,max:q.max})),U,"data-bkzd")}
      ${[0,1,2,3,4,5,6,7,8,9].filter(l=>kz.seznam.some(x=>x.st===l)).map(l=>`<p class="bjakzl"><i>${l?l+". st.":"triky"}</i> ${kz.seznam.map((x,i)=>[x,i]).filter(([x])=>x.st===l).map(([x,i])=>{const c=kCasKouzla(x),bezSl=!kMaSl(K,x),pouz=mojeTah&&((c==="A"&&BP.a)||(c==="BA"&&BP.b))||(c==="R"&&rk0);
      return `<span class="bjakzs${bezSl||pouz?" kneni":""}" ${btip(bezSl?(x.pz?"Předmětu nezbývají náboje":"Nezbývá slot"):pouz?`${c==="A"?"Akci":c==="BA"?"Bonusovou akci":"Reakci"} už jsi použil`:`${{A:"akce",BA:"bonusová akce",R:"reakce",X:"jiný čas"}[c]}`)}><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button>${x.kon?"◎":""}${kPzZn(x)}<small class="kspmeta">${besc([{A:"A",BA:"BA",R:"R",X:""}[c],x.dosah,x.zach?"SO "+String(x.zach).replace(/^([A-Z]{3})\s*(\d+)$/,"$2 $1"):""].filter(Boolean).join(" · "))}</small>${kSesHtml(K,x,i)}</span>`}).join("")}</p>`).join("")}`}
  else if(tab==="akce"){const U=kartaStav(K.id).zdr||{};
    body=`${kZdrChipy([...kZdroje(K).map(q=>({k:q.n,n:q.n,max:q.max,obn:q.obn})),...(kVydMax(K)?[{k:"Výdrž",n:"Výdrž",max:kVydMax(K),obn:"dlouhý odpočinek"}]:[])],U,"data-bkzd")}
      <div class="bhprow">${rd?"":`<button type="button" class="gbtn ghost" data-bhrdy ${btip("Připravit akci (Ready): spustí se reakcí, propadne na začátku dalšího tahu")}>⏳ Připravit akci</button>`}${!d?`<button type="button" class="gbtn ghost" data-bhds="pad" ${btip("Pád na 0 HP: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání")}>${bi("porazen")} ${gm?"Padl na 0 HP":"Padl jsem (0 HP)"}</button>`:""}</div><div class="bhakce${mojeTah&&BP.a?" bpta":""}${mojeTah&&BP.b?" bptb":""}${rk0?" bptr":""}">${kAkceHtml(K,true)}</div>`}
  else body=`<div class="kchrow">${BAB.map(a=>`<button type="button" class="kchip kchz${(K.zachProf||[]).includes(a)?" kprof":""}" data-bkzh="${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K,a))}`)}><span>${a}</span><b>${bsg(kZach(K,a))}</b></button>`).join("")}${K.konVyhoda?`<button type="button" class="kchip kchz" data-bkzh="CON" data-adv="1" ${btip("CON záchrana pro soustředění s výhodou (War Caster)")}><span>◎ CON</span><b>${bsg(kZach(K,"CON"))}</b><small>výh.</small></button>`:""}</div>${(K.zachPozn||[]).length?`<p class="kdbnote">${K.zachPozn.map(besc).join(" · ")}</p>`:""}${(()=>{const R=kOdol(K);return R.length||(K.imu||[]).length?`<p class="kdbnote">${R.length?`<b>Resistance</b> ${R.map(t=>bikZr(t)+besc(BZRT[t]||t)).join(" ")}`:""}${(K.imu||[]).length?` · <b>Immunity</b> ${K.imu.map(t=>besc(BZRT[t]||t)).join(", ")}`:""}</p>`:""})()}`;
  if(dbm)return bojDbm(s,h,K,gm,vzdy,{boj:true,hl:kHlas([vzdy?kZasahHtml(K,h,s):"",vzdy?navrhyMojeHtml(K):"",kZavBox(K),kon,dsH,rdy,plak,kPoslBox(K),pripH]),hlS:kHlas([vzdy?kZasahHtml(K,h,s):"",kZavBox(K),kon,dsH,rdy,kPoslBox(K),pripH]),utok:body.split(utB).join(""),kry,typ,rd,d,BP,rk:rk0,mojeTah});
  return `<div class="bref bhkb">${hl}${bar}<nav class="kbtabs" role="tablist">${tabs.map(([id,n])=>`<button type="button" role="tab" data-bhtab="${id}" aria-selected="${tab===id}">${n}</button>`).join("")}</nav><div class="kbtab">${body}</div>${vzdy&&(s.obsazeni||{})[s.tah]===h.id?((s.hotovo||{})[h.id]===(s.kolo||1)*100+(s.tah||0)?`<p class="kdbnote">✓ Tah dohrán – vypravěč posune dál.</p>`:bojKonecBtn(h.id)):""}</div>`}
document.addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s);
  const tb=T("[data-bhtab]");if(tb){const c=tb.closest("[data-bhcard]");if(c){BTABH[c.dataset.bhcard]=tb.dataset.bhtab;renderBoj()}return}
  const bp=T("[data-btp]");if(bp&&BOJ.s){bojBpt(BOJ.s);BPT[bp.dataset.btp]=BPT[bp.dataset.btp]?0:1;renderBoj();return}
  const th=T("[data-bhthp]");if(th){const id=th.dataset.bhthp,h=((BOJ.s||{}).hraci||[]).find(x=>x.id===id),K=bojKartaH(h);if(!K)return;const v=Math.round(+(prompt(`${h.n}: kolik dočasných HP?`,"")||0));if(!(v>0))return;const t=Math.max(+kartaStav(K.id).thp||0,v);kartaStavZmen(K.id,{thp:t},`${h.n}: dočasné HP ${t}.`);return}});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-bhpt]"))BHPT[t.dataset.bhpt]=t.value});
/* vypravěč: hod za hráče z karty předvyplní zápis; zápis útoku = útok hráče, rovnou vyhodnocený */
/* před hodem na útok (2026-10-17): cíl, výhoda/nevýhoda a u zbraní s vlastností Šikovná typ zranění */
const BUTYP={};
/* hráč: „Zadat ručně“ – kostky hozené u stolu (d20, d6 Závoje, kostky zranění); prázdné pole hodí web */
const BRUC={};
const bRucN=(v,a,b)=>{if(v==null||String(v).trim()==="")return null;const n=Math.round(+v);return isFinite(n)&&n>=a&&n<=b?n:null};
const bojRucHtml=(h,w,o)=>{o=o||{};const R=BRUC[h.id]||{},kz=String(w.z||"").replace(/[+-]\d+$/,"")+(o.kus>1?` ×${o.kus}`:"");if(o.jenZr&&!kz)return "";
  return `<details class="bphruc" data-otv="ruc-${besc(h.id)}"${BOTV.has("ruc-"+h.id)||R.d20||R.d6||R.dmg?" open":""}><summary>Zadat ručně <small>– hodil jsem kostkami u stolu</small></summary><div class="bphr">
    ${o.jenZr?"":`<label ${btip("Kostka d20, jak padla (s výhodou či nevýhodou ta, která platí). Bonus k útoku se přičte sám.")}>d20 <input type="number" inputmode="numeric" min="1" max="20" data-bruc="${besc(h.id)}|d20" value="${besc(R.d20??"")}" aria-label="Hozená d20"></label>
    <label ${btip("Kostka Závoje: 1–2 Pokušení, 5–6 Požehnání")}>d6 Závoje <input type="number" inputmode="numeric" min="1" max="6" data-bruc="${besc(h.id)}|d6" value="${besc(R.d6??"")}" aria-label="Hozená kostka Závoje"></label>`}
    ${kz?`<label ${btip(`Součet kostek zranění ${kz} (při kritickém zásahu dvojnásob kostek). Modifikátor se přičte sám.`)}>zranění ${besc(kz)} <input type="number" inputmode="numeric" min="0" max="300" data-bruc="${besc(h.id)}|dmg" value="${besc(R.dmg??"")}" aria-label="Součet kostek zranění"></label>`:""}
    </div><small class="bphnav">Co nevyplníš, hodí web. Platí pro první útok; vyplněná čísla se po hodu smažou.</small></details>`};
addEventListener("input",e=>{const t=e.target;if(!t.matches||!t.matches("[data-bruc]"))return;const [hid,k]=t.dataset.bruc.split("|");(BRUC[hid]=BRUC[hid]||{})[k]=t.value});
const BSIKALT={Slashing:"Piercing",Piercing:"Slashing",Bludgeoning:"Piercing"};
function bojSikTypy(K,w){if(!K||!w||!w.t)return null;const a=kUtoky(K).find(x=>x.n===w.n);if(!a||!bdmZvl(a,K).includes("Šikovná"))return null;const v=bdmZvlMoje(a,K);if(v&&(v.t||[]).length>1)return v.t.slice(0,3);const alt=BSIKALT[w.t];return alt?[w.t,alt]:null}
const bojUtTyp=(K,w)=>{const T=bojSikTypy(K,w),v=K&&w?BUTYP[K.id+":"+w.n]:null;return T&&T.includes(v)?v:(w&&w.t)||""};
function bojPredHod(s,h,K,gm,j){const w=bojZbrVse(s,h)[+j];if(!w)return "";
  const c=(s.npc||[]).filter(o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0));
  const G=gm?(BGMU[h.id]||{}):null,cL=bojCileL(gm?G:BJU,c),cil=cL[0]||"",nav=bojAdvHrac(s,h,c.find(o=>o.id===cil),!!w.dal),n=Math.max(+w.pocet||1,cL.length||1);
  const adv=gm?String(G.adv||0):(BJU.adv==="auto"?"0":String(BJU.adv));
  const T=bojSikTypy(K,w),typ=bojUtTyp(K,w);
  return `<div class="bphod"><div class="bphr"><span class="bphl">Cíl</span><span class="bphc">${c.map(o=>`<button type="button" class="bphcil" data-bpcil="${besc(h.id)}|${besc(o.id)}" aria-pressed="${cL.includes(o.id)}">${bojMedN(o,"bmini")}<span>${besc(o.n)}</span></button>`).join("")||`<small>žádný nepřítel</small>`}</span></div>
    ${cL.length>1||(+w.pocet||1)>1?`<small class="bphnav">${cL.length>1?`${n} ${n<5?"útoky":"útoků"}: ${cL.map(id=>(c.find(o=>o.id===id)||{}).n).filter(Boolean).map(besc).join(", ")}${n>cL.length?" (další útoky znovu po řadě)":""}`:(gm?`${n}× útok na stejný cíl – pro víc cílů jich označ víc`:`${n} útoky v jedné akci – hází se po jednom, cíl jde mezi nimi změnit`)}</small>`:""}
    <div class="bphr bphhod">${bojAdvIk(h.id,adv)}<button type="button" class="bphgo" ${gm?`data-bgmhod="${+j}"`:`data-bjut="${+j}"`} data-bph="${besc(h.id)}"><b>Hodit!</b><small>útok ${bsg(+w.b||0)}${n>1?(gm?` · ${n}×`:` · ${BJU.uw===w.n&&BJU.utk===(s.kolo||1)*100+(s.tah||0)?Math.min(n,(+BJU.ui||0)+1):1}. z ${n}`):""}</small></button>${nav.v&&String(nav.v)!==adv?`<small class="bphnav" ${btip(nav.why.join(", "))}>podle stavů by šla ${nav.v>0?"výhoda":"nevýhoda"}</small>`:""}</div>
    ${T?`<div class="bphr"><span class="bphl" ${btip("Šikovná: před hodem si zvolíš typ zranění podle zbraně")}>Zranění</span><span class="bphc">${T.map(t=>`<button type="button" class="bphtyp" data-bptyp="${besc(K.id)}|${besc(w.n)}|${t}" aria-pressed="${typ===t}" ${btip(BZRT[t]||t)}>${bikZr(t)}<span>${besc(BZRT[t]||t)}</span></button>`).join("")}</span></div>`:""}
    ${gm?"":bojRucHtml(h,w)}
    ${gm&&G.serie&&G.serie.length>1?`<button type="button" class="bdmbtn bdmhod" data-bgmzap="${besc(h.id)}">Zapsat ${G.serie.length} útoky</button>`:""}</div>`}
/* cíle útoku: více označených (GM v BGMU, hráč v BJU) – jen ti, kdo jsou v boji */
const bojCileL=(o,c)=>{const L=(o.cilL&&o.cilL.length?o.cilL:(o.ci||o.cil)?[o.ci||o.cil]:[]).filter(id=>c.some(x=>x.id===id));return L};
/* výhoda a nevýhoda jako dvě zaklikávací ikony (bez nich normální hod) */
const bojAdvIk=(hid,adv)=>`<span class="bphadvi" role="group" aria-label="Výhoda nebo nevýhoda">${[["1","vyhoda","Výhoda"],["-1","nevyhoda","Nevýhoda"]].map(([k,ic,l])=>`<button type="button" class="bphai" data-bpadv="${besc(hid)}|${k}" aria-pressed="${adv===k}" aria-label="${l}" ${btip(`${l} – hodí dvě d20, platí ${k==="1"?"vyšší":"nižší"}. Klepni znovu: normální hod`)}>${bi(ic)}<small>${l}</small></button>`).join("")}</span>`;
/* kouzlo na cíl (hráč, 2026-10-17): cíl jako u útoku zbraní, u kouzla se záchranou (plošně) víc cílů, slot, výhoda,
   Zadat ručně, hod a odeslání vypravěči – vše v jednom listu */
function bojPredKouzlo(s,h,K){const sp=bojJaSp(s,h);
  if(!sp)return `<p class="bdmnote">${KSPD?"Kouzlo nemá v boji zranění ani záchranu cíle (nebo chybí volný slot) – sešli ho tlačítkem Seslat v kouzlech.":"Načítám kouzla…"}</p>`;
  const {x,B,sls,q}=sp,multi=!!B.zach,c=(s.npc||[]).filter(o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0));
  const on=o=>multi?BJU.cile.includes(o.id):BJU.cil===o.id,nav=bojAdvHrac(s,h,c.find(o=>o.id===BJU.cil),BJU.dal),adv=BJU.adv==="auto"?"0":String(BJU.adv);
  const popis=B.utok?`útok kouzlem ${bsg(kSpU1(K,x))}${B.pocet>1?` · ${B.pocet} paprsky, každý svůj hod`:""}`:B.zach?`záchrana ${B.zach} SO ${kSpDC(K,x)||"?"}${B.pol?", při úspěchu polovina":""}`:`zasáhne bez hodu${B.pocet>1?` · ${B.pocet}×`:""}`;
  const dmg=B.x?`${B.x}${B.mod?bsg(B.mod):""} ${BZRT[B.t]||B.t||""}`:"";
  const hodit=B.utok||B.auto||(B.zach&&B.x),hoz=!!(BJU.serie&&BJU.serie.length)||(!B.utok&&BJU.info!=="");
  const v1=B.utok&&BJU.serie&&BJU.serie.length===1?BJU.serie[0].vys:"";
  return `<div class="bphod bphsp"><p class="bphinfo">${besc(x.n)} · ${sp.lvl?sp.lvl+". st.":"trik"} · ${besc(popis)}${dmg?` · ${besc(dmg)}`:""}${x.kon?" · ◎ soustředění":""}</p>
    <div class="bphr"><span class="bphl">${multi?`Cíle${bojJaCilMax()?` <small>(nejvýš ${bojJaCilMax()})</small>`:""}`:"Cíl"}</span><span class="bphc">${c.map(o=>`<button type="button" class="bphcil" ${multi?`data-bpcile="${besc(o.id)}"`:`data-bpcil="${besc(h.id)}|${besc(o.id)}"`} aria-pressed="${on(o)}">${bojMedN(o,"bmini")}<span>${besc(o.n)}</span></button>`).join("")||`<small>žádný nepřítel</small>`}</span></div>
    ${multi?`<small class="bphnav">Plošné kouzlo: označ všechny, kdo jsou v oblasti.</small>`:""}
    ${sls.length>1?`<div class="bphr"><span class="bphl">Slot</span><span class="bphc">${sls.map(z=>`<button type="button" class="bphtyp" data-bpsl="${besc(z.k)}" aria-pressed="${q&&q.k===z.k}">${z.lab?`${besc(z.lab)} <small>(${z.st}. st.)</small>`:`${z.pakt?"pakt ":""}${z.st}. st. <small>(${z.max-z.u})</small>`}</button>`).join("")}</span></div>`:""}
    ${B.utok?`<div class="bphr bphhod">${bojAdvIk(h.id,adv)}${nav.v&&String(nav.v)!==adv?`<small class="bphnav" ${btip(nav.why.join(", "))}>podle stavů by šla ${nav.v>0?"výhoda":"nevýhoda"}</small>`:""}</div>`:""}
    ${hodit?bojRucHtml(h,{z:B.x},{jenZr:!B.utok,kus:B.auto?B.pocet:1}):""}
    ${hodit&&!hoz?`<button type="button" class="bdmbtn bdmhod" data-juhod>🎲 ${B.utok?"Hodit útok":"Hodit zranění"}</button>`:""}
    ${hoz?`${v1?`<b class="bjupv ${v1==="vedle"?"bmis":"bkr"}">${v1==="vedle"?"Vedle":v1==="zásah"?"Zásah!":"Kritický zásah!"}</b>`:""}<small class="bphnav">${besc(BJU.info||"")}</small>`:""}
    ${hoz||!hodit?`<button type="button" class="bdmbtn bdmhod" data-juposl>${hodit?"Poslat vypravěči":"✨ Seslat na cíle"}</button><small class="bphnav">Odesláním se ${x.st>0?"odečte slot":"kouzlo zapíše"}${x.kon?" a začne soustředění":""}; zásah a záchrany vyhodnotí vypravěč.</small>`:""}</div>`}
document.addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s);
  const ce=T("[data-bpcile]");if(ce){const id=ce.dataset.bpcile,mx=bojJaCilMax();if(BJU.cile.includes(id))BJU.cile=BJU.cile.filter(x=>x!==id);else if(mx===1)BJU.cile=[id];else if(mx&&BJU.cile.length>=mx){mmHlasG(`Na tomto stupni nejvýš ${mx} ${mx<5?"cíle":"cílů"}.`,3000);return}else BJU.cile=[...BJU.cile,id];renderBoj();return}
  const sl=T("[data-bpsl]");if(sl){BJU.sl=sl.dataset.bpsl;BJU.serie=null;BJU.info="";BJU.hod="";BJU.dmg="";renderBoj();return}});
function bojGmHod(hid,i){const s=BOJ.s||{},h=(s.hraci||[]).find(x=>x.id===hid);if(!h)return;const K=bojKartaH(h),w=bojZbrVse(s,h)[i];if(!w)return;
  const G0=BGMU[hid]||{},v=+(G0.adv||0),b=(+w.b||0)-(K?2*kVycerp(K):0),typ=bojUtTyp(K,w),cL=bojCileL(G0,s.npc||[]),n=Math.max(+w.pocet||1,cL.length||1),ser=[],tx=[];
  for(let q=0;q<n;q++){const d1=bK(20),d2=v?bK(20):null,d=v>0?Math.max(d1,d2):v<0?Math.min(d1,d2):d1,krit=d>=20,k=w.z?bojKostky(w.z,krit):null,ci=cL.length?cL[q%cL.length]:"",c=(s.npc||[]).find(o=>o.id===ci);
    ser.push({ci,hod:d+b,d,dmg:k?k.t:0,det:{d1,d2,v,b,zx:k?k.x:""}});tx.push(`${c?besc(c.n)+": ":""}d20 ${d1}${d2!=null?`/${d2}`:""} ${bsg(b)} = ${d+b}${krit?" · krit":d===1?" · přirozená 1":""}${k?` · zranění ${k.x} = ${k.t}`:""}`)}
  const G=BGMU[hid]=Object.assign(G0,{zi:i,ci:ser[0].ci||G0.ci,hod:ser[0].hod,d:ser[0].d,dmg:ser[0].dmg||"",t:typ&&typ!==w.t?typ:"",serie:ser});let zv="";if(K){const z=kZavoj(K);KZAV[K.id]={co:`Útok – ${w.n}`,d:z.d,r:z.r,hod:z.hod};G.zav={d:z.d,r:z.r};zv=" · "+zavTxt(z)}
  G.info=`${w.n}${v?` (${v>0?"výhoda":"nevýhoda"})`:""}: ${tx.join(" | ")}${typ?" · "+(BZRT[typ]||typ):""}${zv}`;renderBoj()}
/* vypravěč: zapsat celou sérii útoků (víc cílů / Extra Attack) najednou */
function bojGmZapisVse(hid){const s=BOJ.s||{},h=(s.hraci||[]).find(x=>x.id===hid),G=BGMU[hid];if(!h||!G||!G.serie)return;if(G.serie.some(x=>!x.ci)){mmHlasG("Vyber cíl útoku.",2500);return}
  const w=bojZbrVse(s,h)[+G.zi],L=G.serie.map((x,q)=>({id:"g"+Date.now().toString(36)+q,h:hid,ci:[x.ci],cim:w?w.n:"útok",hod:x.hod,d:x.d,adv:x.det?x.det.v||0:0,det:x.det?Object.assign({},x.det,q===0&&G.zav?{zav:G.zav}:{}):null,dmg:Math.max(0,Math.round(+x.dmg||0)),t:G.t||(w&&w.t)||"Slashing",drt:!!(w&&w.drt),pru:!!(w&&w.pru),kmin:20,k:s.kolo||1,stav:"ceka"}));
  delete BGMU[hid];bojZmen(z=>{z.utoky=[...(z.utoky||[]),...L].slice(-40)});L.forEach(u=>bojUtokPotvrd(u.id))}
function bojGmZapis(hid,f){const s=BOJ.s||{},h=(s.hraci||[]).find(x=>x.id===hid);if(!h)return;const ci=f.ci.value;if(!ci){mmHlasG("Vyber cíl útoku.",2500);return}
  const hod=f.hod.value;if(hod===""||isNaN(+hod)){mmHlasG("Zapiš výsledek hodu na útok.",2500);return}
  const w=f.zi.value!==""?bojZbrVse(s,h)[+f.zi.value]:null,u={id:"g"+Date.now().toString(36),h:hid,ci:[ci],cim:w?w.n:"útok",hod:Math.round(+hod),adv:0,dmg:Math.max(0,Math.round(+f.dmg.value||0)),t:f.t.value||(w&&w.t)||"Slashing",drt:!!(w&&w.drt),pru:!!(w&&w.pru),kmin:20,k:s.kolo||1,stav:"ceka"};
  if(f.d.value!==""&&+f.d.value>=1&&+f.d.value<=20)u.d=Math.round(+f.d.value);delete BGMU[hid];
  bojZmen(z=>{z.utoky=[...(z.utoky||[]),u].slice(-40)});bojUtokPotvrd(u.id)}
/* životy v hlavičce karty postavy: číslo nastaví, −N zranění, +N léčení */
function bojHracHp(hid,val){const s=BOJ.s||{},h=(s.hraci||[]).find(x=>x.id===hid),K=bojKartaH(h);if(!K)return;const t=String(val||"").trim().replace(/−/g,"-"),cur=bojHpPC(h,K);let v=0;
  if(/^-\d+$/.test(t))v=+t;else if(/^\+\d+$/.test(t))v=+t;else if(/^\d+$/.test(t))v=+t-cur;else{renderBoj();return}if(!v){renderBoj();return}
  if(v<0){const dmg=-v,ty=BHPT[hid]||"",zr=(K.imu||[]).includes(ty)?0:kOdol(K).includes(ty)?Math.floor(dmg/2):dmg;bojPCZmena(hid,o=>bojZranPC(o,K,dmg,ty,false));const hp=kartaStav(K.id).hp;if(zr>0&&kKonDrzi(K)&&(hp==null||hp>0)){KKON[K.id]=bojKonDC(zr);renderBoj()}else if(hp===0&&kKonDrzi(K))kKonZtrata(K,"pád na 0 HP")}
  else{const ks=kartaStav(K.id),o={hp:ks.hp,thp:ks.thp,ds:h.ds?JSON.parse(JSON.stringify(h.ds)):undefined},m=bojLecPC(o,K,v);kartaStavZmen(K.id,{hp:o.hp!=null&&o.hp<kHPmax(K)?o.hp:null},`${h.n}: ${m}.`);
    if(JSON.stringify(o.ds??null)!==JSON.stringify(h.ds??null))bojHracAkce(hid,x=>{if(o.ds)x.ds=o.ds;else delete x.ds});if(GMV)bojLog(hid,{n:"Léčení",ai:null,ci:hid,zt:m},h.n)}}
document.addEventListener("change",e=>{const t=e.target;if(!t.matches)return;if(t.matches("[data-bjhp]")){bojHracHp(t.dataset.bjhp,t.value);return}
  const f=t.closest&&t.closest("[data-bgmut]");if(f){const G=BGMU[f.dataset.bgmut]=BGMU[f.dataset.bgmut]||{};G[t.name]=t.value}});
document.addEventListener("keydown",e=>{const t=e.target;if(e.key==="Enter"&&t.matches&&t.matches("[data-bjhp]")){e.preventDefault();t.blur()}
  if((e.key==="Enter"||e.key===" ")&&t.matches&&t.matches("[data-bdmutx]")){e.preventDefault();t.click()}});
document.addEventListener("input",e=>{const t=e.target,f=t.closest&&t.closest("[data-bgmut]");if(f&&t.name){const G=BGMU[f.dataset.bgmut]=BGMU[f.dataset.bgmut]||{};G[t.name]=t.value}});
document.addEventListener("submit",e=>{const f=e.target;if(!f.matches||!f.matches("[data-bgmut]"))return;e.preventDefault();bojGmZapis(f.dataset.bgmut,f.elements)});
document.addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s);
  const pc=T("[data-bpcil]");if(pc){const [hid,id]=pc.dataset.bpcil.split("|"),jeden=!!pc.closest(".bphsp"),O=GMV?(BGMU[hid]=BGMU[hid]||{}):BJU,k=GMV?"ci":"cil";
    if(jeden){O[k]=O[k]===id?"":id;O.cilL=O[k]?[O[k]]:[]}else{const L=bojCileL(O,(BOJ.s&&BOJ.s.npc)||[]);O.cilL=L.includes(id)?L.filter(x=>x!==id):[...L,id];O[k]=O.cilL[0]||""}
    if(GMV)delete O.serie;else{BJU.serie=null;BJU.info=""}renderBoj();return}
  const gz=T("[data-bgmzap]");if(gz){bojGmZapisVse(gz.dataset.bgmzap);return}
  const pa=T("[data-bpadv]");if(pa){const [hid,v]=pa.dataset.bpadv.split("|"),zpet=pa.getAttribute("aria-pressed")==="true"&&v!=="0";if(GMV){(BGMU[hid]=BGMU[hid]||{}).adv=zpet?0:+v}else BJU.adv=zpet?"0":v;renderBoj();return}
  const pt=T("[data-bptyp]");if(pt){const [kid,wn,t]=pt.dataset.bptyp.split("|");BUTYP[kid+":"+wn]=t;renderBoj();return}
  const g=T("[data-bgmhod]");if(g){const k=g.dataset.bph||((g.closest("[data-bhpan]")||{}).dataset||{}).bhpan;if(k)bojGmHod(k,+g.dataset.bgmhod);return}
  const j=T("[data-bjut]");if(j){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),zb=me?bojZbrVse(s,me):[],w=zb[+j.dataset.bjut];if(!w)return;
    BJU.ks=null;BJU.plos=false;if(BJU.adv==="auto")BJU.adv="0";BJU.zi=String(+j.dataset.bjut);BJU.t=bojUtTyp(bojKartaH(me),w)||BJU.t;BJU.drt=!!w.drt;BJU.pru=!!w.pru;BJU.dal=!!w.dal;const K=bojKartaH(me);if(K&&kJeZbran(K,w.n)){KZBRV[K.id]=w.n;BJU.zvAuto=w.n;kZbrvUloz()}bojJaHod();return}});
/* ===== Boj: bojová karta postavy v rozvržení D&D Beyond na telefonu (2026-10-17) – úsporná: hlavička (AC s obětováním
   zbroje, zbývající obětování, portrét s hrdinskou inspirací a reakcí, životy, odpočinek, hlavní karta, stavy), pruh jen
   s tím, co právě platí (Závoj, rány, soustředění, vyčerpání, hody proti smrti), hlášky v jednom proužku, záložky
   Vlastnosti · Akce · Kouzla · Vybavení · Rysy (· Společníci), které se při posunu přilepí i se zúženou hlavičkou,
   vysouvací listy zespodu (životy, stavy, AC, odpočinek, kostka, útok na cíl). Hráč ji má v Boji i mimo boj; vypravěč
   u každé postavy družiny. Stav postavy je jeden (karty.stav) – co se změní tady, ukáže hlavní karta a naopak. ===== */
const BDMI={
  vl:'<path d="M8 1.6 13.6 4v4.3c0 3.2-2.4 5.4-5.6 6.1C4.8 13.7 2.4 11.5 2.4 8.3V4Z"/><path d="M5.4 8.2 7.3 10l3.4-3.7"/>',
  akce:'<path d="M3 13 11.6 4.4M10 2.8h3.2V6M2.4 10.6l3 3M4.2 12.8l-1.6 1.6"/>',
  kouzla:'<path d="M8 1.5c.9 2.6 2.4 4.1 5 5-2.6.9-4.1 2.4-5 5-.9-2.6-2.4-4.1-5-5 2.6-.9 4.1-2.4 5-5Z"/><path d="M12.8 11.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5Z"/>',
  vyb:'<path d="M2.5 6.5h11v7h-11ZM2.5 6.5 4 3h8l1.5 3.5M6.3 9h3.4"/>',
  rysy:'<circle cx="8" cy="5.4" r="2.7"/><path d="M2.8 14c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6"/>',
  spol:'<path d="M3 13.5c0-2.9 1.6-5 3.9-5.6L5.6 4.2 8 5.6l2.4-1.4-1.3 3.7c2.3.6 3.9 2.7 3.9 5.6"/><circle cx="6.6" cy="10.2" r=".5" fill="currentColor"/>',
  ohen:'<path d="M8 1.8c.4 2.2 2.8 3.4 2.8 6a2.8 2.8 0 0 1-5.6 0c0-1.4.8-2.2 1.4-3 .2 1 .7 1.6 1.2 1.8C7.6 5.2 7.4 3.4 8 1.8Z"/><path d="M2.4 14.2 13.6 11.6M2.4 11.6l11.2 2.6"/>',
  kolo:'<circle cx="8" cy="8" r="2.4"/><path d="M8 1.6v2M8 12.4v2M1.6 8h2M12.4 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/>',
  slunce:'<path d="M3 11.5a5 5 0 0 1 10 0Z" fill="currentColor" stroke="none"/><path d="M8 2.2v2M3.3 4.4l1.3 1.4M12.7 4.4l-1.3 1.4M1.6 8.6h1.8M12.6 8.6h1.8M1.6 13.2h12.8"/>',
  duse:'<path d="M8 14s-5.4-3.2-5.4-7A2.9 2.9 0 0 1 8 5.2 2.9 2.9 0 0 1 13.4 7c0 3.8-5.4 7-5.4 7Z"/>',
  info:'<circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v4M8 4.9v.1"/>',
  denik:'<path d="M3.2 2.4h7.6l2 2v9.2H3.2ZM5.6 6h4.8M5.6 8.6h4.8M5.6 11.2h3"/>',
  d20:'<path d="M8 1.4 13.8 4.7v6.6L8 14.6 2.2 11.3V4.7Z"/><path d="M8 1.4 4.6 9.4h6.8ZM2.2 4.7l2.4 4.7M13.8 4.7l-2.4 4.7M4.6 9.4 8 14.6l3.4-5.2"/>'
};
const bdmIc=(k,c)=>`<svg class="bdmic${c?" "+c:""}" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${BDMI[k]||""}</svg>`;
const BDMS=[["vl","Vlastnosti, záchrany a dovednosti","Vlastnosti"],["akce","Akce","Akce"],["kouzla","Kouzla","Kouzla"],["vyb","Vybavení do boje","Vybavení"],["rysy","Rysy a schopnosti","Rysy"],["duse","Duše, rány a účinky","Duše"],["info","Obrana, smysly a zázemí","Info"],["denik","Poznámky a herní záznam","Poznámky"],["spol","Společníci","Společníci"]];
const BDM={sec:{},sheet:null,hlo:new Set(),af:{},kf:{},fokus:null,utx:new Set()};
try{Object.assign(BDM.sec,JSON.parse(localStorage.getItem("mm-bdmsec")||"{}"))}catch(e){}
const bdmSecUloz=()=>{try{localStorage.setItem("mm-bdmsec",JSON.stringify(BDM.sec))}catch(e){}};
const bdmSekce=K=>BDMS.filter(([id])=>id!=="kouzla"||kSeznam(K).length||kSloty(K).length).filter(([id])=>id!=="spol"||kSpol(K).length||kForma(K)||kZdroje(K).some(q=>/wild shape/i.test(q.n)));
const BDMSV=[[0,"Výhoda na Intimidation · Smlouva s ďáblem (1× za dlouhý odpočinek změní Závoj na Požehnání) · feat víry nefunguje"],[3,"Výhoda na Deception · Neklidné sny: dlouhý odpočinek vrátí jen polovinu životů"],[7,"Bez bonusu i postihu"],[10,"Imunita vůči Vyděšený (Frightened) · výhoda na Insight · nevýhoda na Deception"]];
const bdmSvTxt=v=>(BDMSV.find(x=>v<=x[0])||BDMSV[3])[1];
/* výdrž zbroje (Artikule › Zbroj): při kritickém zásahu lze obětovat zbroj nebo štít; vyčerpané přestanou dávat AC i Resistance */
function kZbrUziti(c,S){const U=(S&&S.zbrU)||{},N=c.N,o={};
  if(N.z&&BZBR[N.z.dr]){const mx=parseInt(BZBR[N.z.dr][1],10)||1;o.z={k:N.z.dr,n:N.z.n,max:mx,u:Math.min(mx,+U[N.z.dr]||0)};if(o.z.u>=mx)N.z=null}
  if(N.s){o.s={k:"Štít",n:N.s.n,max:1,u:Math.min(1,+U["Štít"]||0)};if(o.s.u>=1)N.s=null}c.ZU=o}
const kZbrU=K=>{const c=kCtx(K);return c.ZU||{}};
function kZbrUHtml(K,kr){const Z=kZbrU(K),L=[Z.z,Z.s].filter(Boolean);if(!L.length)return "";
  return `<span class="bdmzu">${L.map(z=>`<span class="bdmzug${z.u>=z.max?" bdmzux":""}" ${btip(`${z.n||z.k}: ${z.k==="Štít"?"štít":z.k.toLowerCase()+" zbroj"} vydrží ${z.max}× obětování (Artikule). Obětováno ${z.u}×${z.u>=z.max?" – nedává AC, k opravě u kováře nebo kovářským nářadím při dlouhém odpočinku":""}. Klikni na kosočtverec: obětováno / opraveno.`)}>${bikZb?bikZb(z.k):""}${[...Array(z.max)].map((_,j)=>`<button type="button" class="${j<z.u?"on":""}" data-bdmzu="${besc(z.k)}" data-j="${j}" aria-label="${besc(z.k)} ${j+1} z ${z.max}${j<z.u?" – obětováno":""}"></button>`).join("")}</span>`).join("")}${kr&&L.some(z=>z.u<z.max)?`<button type="button" class="bdmmini" data-bdmobet ${btip("Kritický zásah: obětuj zbroj (nebo štít, když zbroj už nevydrží) – kritický zásah se změní v běžný")}>obětovat</button>`:""}</span>`}
document.addEventListener("click",async e=>{const T=s=>e.target.closest&&e.target.closest(s);
  const zu=T("[data-bdmzu]");if(zu){const K=kvK(zu);if(!K||!kMuze(K))return;const k=zu.dataset.bdmzu,j=+zu.dataset.j,S=kartaStav(K.id),U=Object.assign({},S.zbrU||{}),u=+U[k]||0,ac0=kAC(K);U[k]=u>j?j:j+1;if(!U[k])delete U[k];
    await kartaStavZmen(K.id,{zbrU:Object.keys(U).length?U:null},null);mmHlasG(`${K.n}: ${k==="Štít"?"štít":k.toLowerCase()+" zbroj"} ${U[k]>u?"obětována":"opravena"}${kAC(K)!==ac0?` – AC ${ac0} → ${kAC(K)}`:""}.`,4000);return}
  const ob=T("[data-bdmobet]");if(ob){const K=kvK(ob);if(!K||!kMuze(K))return;if(BZAS&&BZAS.kid===K.id&&BZAS.e&&BZAS.e.kr){await kZasahReakce(K,"obet");return}const Z=kZbrU(K),z=Z.z&&Z.z.u<Z.z.max?Z.z:Z.s&&Z.s.u<Z.s.max?Z.s:null;if(!z)return;
    if(await kOdklad(`obětovat ${z.k==="Štít"?"štít":z.k.toLowerCase()+" zbroj"}`,()=>true)===false)return;
    const S=kartaStav(K.id),U=Object.assign({},S.zbrU||{}),ac0=kAC(K);U[z.k]=(+U[z.k]||0)+1;await kartaStavZmen(K.id,{zbrU:U},null);
    const txt=`${z.k==="Štít"?"štít":z.k.toLowerCase()+" zbroj"} obětována – kritický zásah se mění v běžný (kostky zranění jen jednou)${kAC(K)!==ac0?`; AC ${ac0} → ${kAC(K)}`:""}`;
    kHodZapis({k:K.id,kdo:K.n,co:"Obětování zbroje",txt});const h=((BOJ.s&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);if(GMV&&h)bojLog(h.id,{n:"Obětování zbroje",ai:null,ci:h.id,zt:txt},h.n);mmHlasG(`${K.n}: ${txt}.`,6000);return}});
/* vlastnosti zbraní podle Artikulí (Zbraně) – podle druhu zbraně v názvu útoku */
const BDMZV={"Drtivá":/\b(mace|flail|war ?hammer)\b|palcát|cep|válečné kladivo/i,"Ratiště":/\b(halberd|pike|glaive|spear)\b|halapartn|píka|kopí/i,"Průrazná":/\b(heavy crossbow|lance|halberd|war ?pick|musket|pistol|handgun)\b|píšťal|ručnic|halapartn/i,
  "Šikovná":/\b(shortsword|longsword|greatsword|scimitar|war ?hammer|halberd)\b|meč|šavl/i,"Ostrá":/\b(shortsword|longsword|greatsword|scimitar)\b|meč|šavl/i,"Půlmeč":/\b(longsword|greatsword)\b|dlouhý meč|obouruční meč/i,
  "Do slabin!":/\bdagger\b|dýk/i,"Strhující":/\b(halberd|glaive)\b|halapartn/i,"Vpřed!":/\blance\b/i,"Štěpící":/\bgreataxe\b|obouruční sekyr/i,"Hrom a kouř!":/\b(musket|pistol|handgun)\b|píšťal|ručnic/i};
/* vlastnosti zbraně podle Artikulí: podle názvu zbraně, nebo jak si je hráč u zbraně nastavil (stav karty zbrVl, 2026-10-18) */
const bdmZvlAuto=a=>{const z=kZbranInfo(a.n),s=[a.n,z&&z[1],...(a.vl||[]),a.pozn].filter(Boolean).join(" ");if(/beze zbraně|unarmed|eldritch|kouzl/i.test(a.n))return [];return Object.keys(BDMZV).filter(k=>BDMZV[k].test(s))};
const bdmZvlMoje=(a,K)=>{const v=K&&((kartaStav(K.id).zbrVl)||{})[a.n];return v&&Array.isArray(v.vl)?v:null};
const bdmZvl=(a,K)=>{const v=bdmZvlMoje(a,K);return v?v.vl.filter(k=>BDMZV[k]):bdmZvlAuto(a)};
/* útoky: klepnutí na zásah otevře list s cílem (v boji), mimo boj rovnou hodí */
function bdmUtoky(s,h,K,gm,X){const UT=kUtoky(K),zb=X.boj?bojZbrVse(s,h):[],ut=X.boj&&!gm&&bojDB&&bojDB.utok&&!h.ds;
  return UT.map((a,i)=>{const j=zb.findIndex(w=>w.karta&&w.n===a.n),zv=KZBRV[K.id]===a.n,vl=(a.vl||[]).filter(Boolean);
    const hit=X.boj&&gm&&j>=0?`data-bdmsh="utok" data-j="${j}"`:ut&&j>=0?`data-bdmsh="utok" data-j="${j}"`:`data-khod="ut:${i}"`;
    const L=bdmZvl(a,K);
    const ox=BDM.utx.has(K.id+"|"+a.n);
    return `<div class="bdmut${zv?" bdmzv":""}${ox?" bdmuto":""}"><span class="bdmuti" aria-hidden="true">${a.dal?"➶":"⚔"}</span><div class="bdmutn" role="button" tabindex="0" data-bdmutx="${besc(a.n)}" aria-expanded="${ox}" ${btip(ox?"Skrýt vlastnosti zbraně":"Ukázat vlastnosti zbraně")}><b>${besc(a.n)}</b>${zv?` <small class="bdmruk" ${btip("Zbraň v ruce")}>✋</small>`:""}${ox?`<small>${besc([a.dal?"na dálku":"zblízka",...vl].join(" · "))}</small>${L.length?`<span class="bdmzvs">${L.map(k=>`<span ${btip(`${k}: ${BVLZ[k]}`)}>${bikZv(k)}<i>${besc(k)}</i></span>`).join("")}</span>`:""}${kMuze(K)&&!/beze zbraně|unarmed|eldritch|kouzl/i.test(a.n)?`<button type="button" class="bdmmini bdmzvb" data-bdmsh="zvl" data-zvl="${besc(a.n)}" ${btip("Vlastnosti zbraně podle Artikulí (Šikovná, Ostrá, Drtivá…)")}>⚙ vlastnosti</button>`:""}`:""}</div>
      <span class="bdmdos">${besc(a.dosah||(a.dal?"dálka":"5 st."))}</span><button type="button" class="bdmbox" ${hit} ${btip(`Útok ${a.n}: d20 ${bsg(+a.b||0)}${a.pocet>1?` · ${a.pocet}× za akci`:""}${ut&&j>=0?" – vyber cíl a hoď":X.boj&&gm?" – hodí za hráče a otevře zápis":""}`)}>${bsg(+a.b||0)}</button>
      <span class="bdmdmg">${a.z?`<button type="button" class="bdmbox" data-kzr="${i}" ${btip(`Zranění ${a.z} ${BZRT[a.t]||a.t||""}`)}>${besc(a.z)} ${bikZr(a.t)}</button>`:"–"}</span>${a.pozn||kMunTxt(K,a)?`<small class="bdmutp">${besc(a.pozn||"")}${kMunTxt(K,a)}</small>`:""}</div>`}).join("")}
function bdmAkce(s,h,K,gm,X){const G=kAkceG(K,true,{bezKouzel:true}),f=BDM.af[K.id]||"all",sh=k=>f==="all"||f===k,UT=kUtoky(K),apa=Math.max(1,...UT.map(a=>+a.pocet||1));
  const zdrL=[...kSloty(K).map(q=>({k:q.k,n:`${q.pakt?"Pakt":"Sloty"} ${q.st}. st.`,max:q.max,obn:q.pakt?"krátký odpočinek":"dlouhý odpočinek"})),...kZdroje(K).map(q=>({k:q.n,n:q.n,max:q.max,obn:q.obn})),...(kVydMax(K)?[{k:"Výdrž",n:"Výdrž",max:kVydMax(K),obn:"dlouhý odpočinek"}]:[])];
  const T=X.mojeTah&&X.BP,uA=T&&X.BP.a,uB=T&&X.BP.b,uP=T&&X.BP.p,vmx=kVydMax(K);
  const tah=(k,u,l)=>T?` <button type="button" class="bdmuse${u?" on":""}" data-btp="${k}" aria-pressed="${!!u}" ${btip(`${l}: ${u?"v tomto tahu použita – klikni, když ne":"k dispozici – klikni, když ji použiješ"}`)}>${u?"použita":"volná"}</button>`:"";
  const chips=`<div class="bdmchips" role="group" aria-label="Filtr akcí">${[["all","Vše"],["A","Akce"],["BA","Bonusové"],["R","Reakce"],["X","Ostatní"],["omez","Omezené"]].map(([k,l])=>`<button type="button" data-bdmaf="${k}" aria-pressed="${f===k}">${l}</button>`).join("")}</div>`;
  const info=`<div class="bdmainf">${T?`<button type="button" class="bdmch${uP?" bdmchu":""}" data-btp="p" aria-pressed="${!!uP}" ${btip(`Pohyb: ${kRychTxt(K)} – klikni, když ho využiješ`)}>Pohyb ${kRychN(K)} st.</button>`:`<span class="bdmch" ${btip(kRychTxt(K))}>Pohyb ${kRychN(K)} st.</span>`}${vmx?`<span class="bdmch" ${btip(`Výdrž na šermířské techniky a zápasnické chvaty: zbývá ${vmx-kVydU(K)} z ${vmx} (obnova dlouhým odpočinkem)`)}>Výdrž ${kdbPips(K,{k:"Výdrž",n:"Výdrž",max:vmx,obn:""})}</span>`:""}${X.boj?`<button type="button" class="bdmch" data-bdmsh="utok" ${btip(gm?"Zapsat za hráče: útok, kouzlo, plošný zásah":"Útok na cíl jinak: ruční zadání, plošně, kouzlo")}>${gm?"✎ zapsat za hráče":"🎯 jiný útok"}</button>`:""}</div>`;
  const grp=(k,t,extra,used)=>sh(k)?`<section class="bdmgrp${used?" bdmused":""}"><h4 class="bdmgh">${t}${extra||""}</h4>${k==="A"&&UT.length?`<div class="bdmuth"><span></span><span>Dosah</span><span>Zásah</span><span>Zranění</span></div>${bdmUtoky(s,h,K,gm,X)}`:""}${G[k].length?`<ul class="kakl bdmakl">${G[k].join("")}</ul>`:k==="A"||k==="X"?"":`<p class="bdmnote">–</p>`}${k==="A"?`<details class="bdmstd"><summary>Běžné akce v boji</summary>${BAKCE.map(a=>`<abbr ${btip(`${a[1]}: ${a[2]}`)}>${besc(a[0])}</abbr>`).join(", ")}</details>`:""}</section>`:"";
  return `${kForma(K)?kFormaHtml(K):""}${info}${chips}
    ${grp("A","Akce",(UT.length?` <small>· útoků za akci: ${apa}</small>`:"")+tah("a",uA,"Akce"),uA)}${grp("BA","Bonusové akce",tah("b",uB,"Bonusová akce"),uB)}${grp("R","Reakce",(X.boj?` <button type="button" class="bdmuse${X.rk?" on":""}" ${gm?`data-break="${h.id}"`:"data-bhrk"} aria-pressed="${!!X.rk}">${X.rk?"použita":"volná"}</button>`:"")+(X.boj&&!X.rd?` <button type="button" class="bdmmini" data-bhrdy ${btip("Připravit akci (Ready): spustí se reakcí, propadne na začátku dalšího tahu")}>⏳ připravit akci</button>`:""),X.rk)}${grp("X","Ostatní")}
    ${sh("X")||sh("omez")?kSchopHtml(K):""}${(sh("X")||sh("A"))&&kSermHtml(K)?`<section class="bdmgrp bdmserm">${kSermHtml(K)}</section>`:""}
    ${f==="omez"?`<section class="bdmgrp"><h4 class="bdmgh">Omezené použití</h4>${zdrL.length?`<ul class="kdbli kdbzdr bdmzdr">${zdrL.map(q=>`<li><b>${besc(q.n)}</b>${kdbPips(K,q)}</li>`).join("")}</ul>`:`<p class="bdmnote">Nic s omezeným počtem použití.</p>`}</section>`:""}`}
/* kouzla: jen použitelná; bez volného slotu sbalená na konci, triky v jednom bloku */
function bdmKouzla(s,h,K,gm,X){const L=kSeznam(K),f=BDM.kf[K.id]||"all",lv=[...new Set(L.map(x=>x.st))].sort((a,b)=>a-b),kz=K.kouzla||{},SL=kSloty(K);
  const ok=x=>f==="all"||(f==="kon"?x.kon:f==="rit"?kRit(x):String(x.st)===f),hrac=X.boj&&!gm&&bojDB&&bojDB.utok&&!h.ds,maSlot=x=>kMaSl(K,x);
  const chips=`<div class="bdmchips" role="group" aria-label="Stupeň kouzel">${[...lv.map(l=>[String(l),kSpSt(l,""),l?`${l}. stupeň`:"Triky"]),...(L.some(x=>x.kon)?[["kon",kKonI(),"Soustředění (Concentration)"]]:[]),...(L.some(kRit)?[["rit",kRitI(),"Rituály"]]:[])].map(([k,l,t])=>`<button type="button" class="${k==="all"?"":"bdmchi"}" data-bdmkf="${k}" aria-pressed="${f===k}" aria-label="${besc(t)}" ${btip(f===k?`${t} – klepni znovu pro všechna kouzla`:t)}>${l}</button>`).join("")}</div>`;
  const hd=`<div class="bdmkzh"><span><b>${besc(kSpAb(K)||"–")}</b></span><span><b>${bsg(kSpUt(K))}</b><small>útok kouzlem</small></span><span><b>${kSpDC(K)||"–"}</b><small>SO záchrany</small></span></div>`;
  const sl=SL.length?`<div class="bdmsl">${SL.map(q=>`<span class="bdmslr"><small>${q.pakt?"Pakt ":""}${q.st}. st.</small>${kdbPips(K,{k:q.k,n:`${q.pakt?"Pakt":"Slot"} ${q.st}. st.`,max:q.max})}</span>`).join("")}</div>`:"";
  /* v boji hráč sesílá kouzla se zraněním či záchranou na cíl: list s výběrem cíle (u plošných víc cílů) */
  const bj=x=>hrac&&(KSPD?!!kSpBoj(K,x,x.st||0):(x.utok!=null||!!x.zach));
  const naCil=i=>`data-bdmsh="utok" data-ks="${i}"`;
  const cil=(x,i)=>bj(x)?`<button type="button" class="bdmmini bdmcil" ${naCil(i)} ${btip("Vybrat cíl a seslat")}>🎯 na cíl</button>`:"";
  const radek=(x,i)=>{const c=kCasKouzla(x);return `<div class="bdmspr"><div class="bdmspn"><button type="button" class="kspn" data-kspd="${i}" ${btip("Popis kouzla")}>${besc(x.n)}</button>${kSpZn(x)?" "+kSpZn(x):""}${kPzZn(x)}<small>${besc([{A:"1A",BA:"1BA",R:"1R",X:x.cas||""}[c],x.dosah,x.trvani].filter(Boolean).join(" · "))}</small></div>
      <span class="bdmsph">${x.utok!=null?`<button type="button" class="bdmbox" ${bj(x)?naCil(i):`data-khod="ks:${i}"`} ${btip(bj(x)?"Útok kouzlem – vyber cíl a hoď":"Útok kouzlem")}>${bsg(kSpU1(K,x))}</button>`:x.zach?`<span class="bdmso" ${btip("Záchrana cíle")}>${besc(String(x.zach).slice(0,3).toUpperCase())} ${kSpDC(K,x)||""}</span>`:""}</span>
      <span class="bdmspa">${bj(x)?cil(x,i):kSesHtml(K,x,i)}</span></div>`};
  const I=L.map((x,i)=>[x,i]).filter(([x])=>ok(x)),tri=I.filter(([x])=>x.st===0),moz=I.filter(([x])=>x.st>0&&maSlot(x)),bez=I.filter(([x])=>x.st>0&&!maSlot(x));
  const triH=tri.length?`<h4 class="bdmgh">${kSpSt(0)} Triky</h4><div class="bdmtri">${tri.map(([x,i])=>`<span class="bdmtrk"><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button>${kSpZn(x)}${kPzZn(x)}${bj(x)?cil(x,i):x.utok!=null?`<button type="button" class="bdmmini" data-khod="ks:${i}" ${btip("Útok kouzlem")}>${bsg(kSpU1(K,x))}</button>`:""}</span>`).join("")}</div>`:"";
  const lvH=[...new Set(moz.map(([x])=>x.st))].map(l=>`<h4 class="bdmgh">${kSpSt(l)} ${l}. stupeň</h4><div class="bdmsp">${moz.filter(([x])=>x.st===l).map(([x,i])=>radek(x,i)).join("")}</div>`).join("");
  const bezH=bez.length?`<details class="bdmbez"><summary>Bez volného slotu (${bez.length})</summary><div class="bdmsp">${bez.map(([x,i])=>radek(x,i)).join("")}</div></details>`:"";
  return `${hd}${sl}${chips}${triH}${lvH}${bezH}${!tri.length&&!moz.length&&!bez.length?`<p class="bdmnote">Žádná kouzla.</p>`:""}${kMuze(K)&&!X.boj?`<details class="bjapd kpripw"><summary>Připravit nebo vyměnit kouzla</summary>${kPripHtml(K)}</details>`:""}`}
/* vybavení do boje: lektvary, střelivo a spotřební věci, předměty s náboji, zbraně, zbroj a připoutané předměty */
const BDMVYB=/potion|lektvar|elixír|elixir|scroll|svit|holy water|svěcen|oil|olej|acid|kyselin|alchemist|bomb|caltrop|ball bearing|net\b|síť|arrow|bolt|šíp|šipk|ammunition|munice|needle|bullet|kulk|dart|javelin|oštěp|torch|pochod|healer|obvaz|bandage|antitoxin/i;
function bdmVyb(K){const o=kartaDbData(K),S=kartaStav(K.id),inv=S.inv||K.vybaveni||[],pen=S.pen||K.penize||{},zl=Object.entries(pen).filter(([,v])=>+v).map(([k,v])=>`${v} ${k}`).join(" · "),NOS=kNoseno(inv);
  const L=inv.map((x,i)=>[x,i]).filter(([x])=>x.q>0&&(BDMVYB.test(x.n)||kNab(x)||kZbranInfo(x.n)||kZbrInfo(x)||x.pripoutano||(kPred(x)&&kPred(x).ef&&(kPred(x).ef.lecit||kPred(x).ef.dhp))));
  const row=([x,i])=>{const p=kPred(x),r=kZbrInfo(x),on=r&&((NOS.z&&NOS.z.i===i)||(NOS.s&&NOS.s.i===i));
    return `<li><span>${p?`<button type="button" class="kspn" data-kinvpop="${i}">${besc(x.n)}</button>`:besc(x.n)}${p&&p.ef&&(p.ef.lecit||p.ef.dhp)?` <button type="button" class="bdmmini" data-kinvpij="${i}">vypít</button>`:""}${r?` <button type="button" class="kobl${on?" on":""}" data-kobl="${i}" aria-pressed="${!!on}">${on?"na sobě":"obléct"}</button>`:""}${kNabHtml(x,i)}${x.pripoutano?` <small class="bdmpri" ${btip("Připoutaný (Attunement)")}>◆</small>`:""}</span><span class="kq"><button type="button" class="bdmmini" data-kinv="${i}" data-d="-1" aria-label="Ubrat">−</button><b>${x.q}</b><button type="button" class="bdmmini" data-kinv="${i}" data-d="1" aria-label="Přidat">+</button></span></li>`};
  return `<div class="bdmvyh"><span><small>Neseno</small> <b>${o.zat.w?String(Math.round(o.zat.w*10)/10).replace(".",","):"0"} lb</b>${o.zat.pret?` <b class="bhrich">přetížen</b>`:""}</span><span><small>Peníze</small> <b>${besc(zl||"–")}</b></span></div>
    ${L.length?`<ul class="kinv bdminv">${L.map(row).join("")}</ul>`:`<p class="bdmnote">Nic, co by se v boji hodilo.</p>`}
    <details class="bdmbez bdmvse"${BOTV.has("vyb-"+K.id)?" open":""} data-otv="vyb-${besc(K.id)}"><summary>Celé vybavení, peníze a batohy</summary>${kPoolHtml(K)}${o.invH}</details>`}
/* rysy: nahoře ty s aktivací nebo počtem použití, ostatní sbalené */
function bdmRysy(K){const U=kartaStav(K.id).zdr||{},D=kDopl(K),A=[...((K.rysy2||[]).filter(r=>r.cas||r.max)),...(D.rysy||[])];
  const ak=A.length?`<ul class="kakl bdmakl">${A.map(r=>{const u=Math.min(r.max||0,+(U[r.n]||0));return `<li><button type="button" class="kspn" data-krys="${besc(r.n)}">${besc(r.n)}</button>${r.cas?` <small class="kcas">${{A:"akce",BA:"bonusová akce",R:"reakce"}[r.cas]||""}</small>`:""}${r.max?` <span class="bzd">${[...Array(r.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(r.n)}" data-j="${j}" aria-label="${besc(r.n)} ${j+1}"></button>`).join("")}</span>`:""}</li>`}).join("")}</ul>`:`<p class="bdmnote">Žádné rysy s aktivací nebo počtem použití.</p>`;
  const vse=kRysyHtml(K);
  return `<h4 class="bdmgh">S aktivací a počtem použití</h4>${ak}${vse?`<details class="bdmbez"><summary>Ostatní rysy</summary><div class="bdmrysy">${vse}</div></details>`:""}`}
/* vlastnost v bojové kartě (2026-10-17): zkratka | skóre | nahoře modifikátor (ověření), dole záchrana – úsporný řádek */
const BDMVLZ={STR:"STR",AGI:"DEX",CON:"CON",INT:"INT",WIS:"WIS",CHA:"CHA"};
function bdmVlRadek(K,a,zAttr,edit){const v=kVl(K,a);if(v==null)return "";const zm=((kartaStav(K.id).vlU)||{})[a]!=null,pf=(K.zachProf||[]).includes(a),zs=kZach(K,a);
  return `<div class="bdmvlr${pf?" kprof":""}${zm?" bdmvlu":""}"><span class="bdmvlz" ${btip(KDBVL[a])}>${BDMVLZ[a]}</span>
    <button type="button" class="bdmvls" ${edit?`data-kvled="${a}"`:"disabled"} ${btip(`${KDBVL[a]}: skóre ${v}${zm?` (přepsáno, v PDF ${kVl0(K,a)})`:""}${edit?" – klikni pro změnu":""}`)}>${v}</button>
    <span class="bdmvlmz"><button type="button" class="bdmvlm" data-khod="ov:${a}" ${btip(`Ověření ${KSK[a]}: d20 ${bsg(kOvB(K,a))} (s kostkou Závoje)`)}>${bsg(kMod(v))}</button><button type="button" class="bdmvlzh" ${zAttr} ${btip(`Záchrana ${KSK[a]}${pf?" (zdatnost)":""}: d20 ${bsg(zs)}`)}>${bsg(zs)}${pf?`<i class="kdbdot" aria-hidden="true"></i>`:""}</button></span></div>`}
function bdmTelo(s,h,K,gm,X,id){const prof=K.zachProf||[],dp=K.dovProf||{};
  if(id==="vl"){const vlU=(kartaStav(K.id).vlU)||{},zh=a=>X.boj?`data-bkzh="${a}"`:`data-khod="za:${a}"`;
    const ab=`<div class="bdmainf bdmvlh"><span class="bdmch" ${btip("Bonus zdatnosti")}>Zdatnost <b>${bsg(kPB(K))}</b></span><span class="bdmch" ${btip(kRychTxt(K))}>Rychlost <b>${kRychN(K)} st.</b></span></div><div class="bdmvl">${BAB.map(a=>bdmVlRadek(K,a,zh(a),gm||kMuze(K))).join("")}</div>`;
    const za=`${K.konVyhoda?`<p class="bdmnote"><button type="button" class="bdmmini" ${X.boj?`data-bkzh="CON" data-adv="1"`:`data-khod="za:CON"`}>◎ soustředění ${bsg(kZach(K,"CON"))} s výhodou</button> War Caster</p>`:""}${(K.zachPozn||[]).length?`<p class="bdmnote">${K.zachPozn.map(besc).join(" · ")}</p>`:""}`;
    const dov=`<h4 class="bdmgh">Dovednosti</h4><div class="bdmdov">${Object.keys(KDOVAB).filter(n=>(K.dov||{})[n]!=null).map(n=>{const r=kSvAdv(K,n);return `<div class="bdmdr${dp[n]?" kprof":""}${dp[n]==="E"?" kexp":""}"><i class="kdbdot" aria-hidden="true"></i><span>${besc(n)} <small>${KDOVAB[n]}</small>${r.length?` <em class="bdmsva" ${btip(r.map(x=>x[1]).join(", "))}>${r[0][0]>0?"výh.":"nevýh."}</em>`:""}</span><button type="button" class="bdmbox" data-khod="dv:${besc(n)}" ${btip(`${n}: d20 ${bsg(kDov(K,n))}`)}>${bsg(kDov(K,n))}</button></div>`}).join("")}</div>`;
    const def=[["Vulnerability",K.zra]].filter(([,L])=>(L||[]).length);
    const ob=`<p class="bdmnote bdmpas">Pasivní: Vnímání <b>${kPas(K,"vnimani")}</b> · Pátrání <b>${kPas(K,"patrani")}</b> · Vhled <b>${kPas(K,"vhled")}</b>${K.smysly?` · ${besc(K.smysly)}`:""}</p>${def.map(([l,L])=>`<p class="bdmdef"><b>${l}</b> ${L.map(t=>`${bikZr(t)}<span>${besc(BZRT[t]||t)}</span>`).join(" ")}</p>`).join("")}`;
    return ab+za+dov+ob}
  if(id==="akce")return bdmAkce(s,h,K,gm,X);
  if(id==="kouzla")return bdmKouzla(s,h,K,gm,X);
  if(id==="vyb")return bdmVyb(K);
  if(id==="rysy")return bdmRysy(K);
  if(id==="duse"||id==="info"||id==="denik")return `<div class="kdb2 bdmkdb">${kartaDbHtml(K,kartaDbData(K),{jenTab:id})}</div>`;
  if(id==="spol")return kFormaHtml(K)+kSpolHtml(K);return ""}
/* vysouvací listy zespodu */
function bdmList(s,h,K,gm,X,t){const S=kartaStav(K.id),D=kDuse(K),mx=kHPmax(K),cur=X.boj?bojHpPC(h,K):(S.hp!=null?+S.hp:mx),thp=+S.thp||0,ac=kAC(K)+(X.boj?(+h.kryt||0):0),zv=zavojInfo();
  if(t==="hp")return ["Životy",`${X.boj?`<div class="bdmhpz"><input type="number" name="bkzr-${h.id}" data-bkzrv min="0" max="300" inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-bkzr="z">Zranit</button><button type="button" class="kdbheal" data-bkzr="l">Léčit</button><button type="button" class="bdmmini" data-bkzr="d" ${btip("Dočasné HP (nesčítají se – platí vyšší)")}>dočasné</button></div><label class="bdmtyp">Typ zranění <select data-bkzrt aria-label="Typ zranění">${BZTYPY.map(t=>`<option value="${t}">${BZRT[t]}</option>`).join("")}</select></label>`
      :`<div class="bdmhpz kzrb"><input type="number" min="0" max="999" data-kzrv inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-kzrz="z">Zranit</button><button type="button" class="kdbheal" data-kzrz="l">Léčit</button><button type="button" class="bdmmini" data-kzrz="d">dočasné</button><select data-kzrt aria-label="Typ zranění"><option value="">typ</option>${BZTYPY.map(t=>`<option value="${t}">${BZRT[t]}</option>`).join("")}</select></div>`}
      <p class="bdmnote">Teď <b>${cur}</b> z ${mx}${thp?` · dočasné ${thp}`:""}. Pád na 0 HP podle Artikulí: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání; léčení jen stabilizuje.</p>${X.boj&&!X.d?`<button type="button" class="bdmbtn" data-bhds="pad">${bi("porazen")} ${gm?"Padl na 0 HP":"Padl jsem (0 HP)"}</button>`:""}`];
  if(t==="st"){const st0=X.boj?(h.stav||[]).filter(t=>BSTAVH.includes(t)):(S.stavy||[]),stv=kKonDrzi(K)&&!st0.includes("soustředí")?[...st0,"soustředí"]:st0;
    return ["Stavy",X.boj?kStavyTab(stv,BSTAVH,"data-bhst",+S.vycerp||0,kKonNazev(K)):kStavyTab(stv,KSTV,"data-kstav",+S.vycerp||0,kKonNazev(K))]}
  if(t==="ac"){const ZU=kZbrU(K),zuL=[ZU.z,ZU.s].filter(Boolean);
    return [`Obrana · AC ${ac}`,`<p class="bdmnote">${besc(kACR(K).txt)}${X.boj&&h.kryt?` + kryt ${h.kryt}`:""}</p>${zuL.length?`<div class="bdmrow">${kZbrUHtml(K,true)}</div><p class="bdmnote">Při kritickém zásahu obětuj zbroj nebo štít – kritický zásah se změní v běžný. Vycpávaná a štít vydrží 1×, kroužková 2×, plátová a komplexní 3×; pak nedávají AC ani Resistance, dokud je kovář neopraví (klepnutím na kosočtverec).</p>`:`<p class="bdmnote">Postava nemá zbroj ani štít, které by šly obětovat.</p>`}${X.boj?`<div class="bdmrow">${X.kry||""}</div>`:""}`]}
  if(t==="sv")return [`Svědomí ${D.sv} · ${SVST(D.sv)}`,`<p class="bdmnote">${besc(bdmSvTxt(D.sv))}</p>
      <div class="bdmsvk"><span class="kbod"><small>Body hříchu</small><b>${D.hr}</b></span><span class="kbod"><small>Dobré skutky</small><b>${D.sk}</b></span></div>
      <div class="bdmrow"><span class="kdusk">Hřích</span><button type="button" class="bdmbtn" data-kdu="h1" ${btip("Všední hřích, podlehnutí Neřesti nebo přijaté Pokušení: +1 bod hříchu")}>+1 hřích</button><button type="button" class="bdmbtn" data-kdu="h2" ${btip("Všední hřích proti vlastní Ctnosti: +2 body hříchu")}>+2 proti Ctnosti</button><button type="button" class="bdmbtn bhrich" data-kdu="s1" ${btip("Smrtelný hřích: Svědomí −1 hned")}>smrtelný −1</button><button type="button" class="bdmbtn bhrich" data-kdu="s2" ${btip("Smrtelný hřích proti vlastní Ctnosti: Svědomí −2 hned")}>smrtelný −2</button></div>
      <div class="bdmrow"><span class="kdusk">Skutek</span><button type="button" class="bdmbtn bdmsk" data-kdu="d1" ${btip("Jednání podle Ctnosti, které něco stojí: +1 bod dobrých skutků")}>+1 dobrý skutek</button><button type="button" class="bdmbtn bdmsk" data-kdu="v1" ${btip("Skutečná oběť nebo riziko života pro Ctnost: Svědomí +1 hned")}>velký skutek +1</button>${D.hr||D.sk?`<button type="button" class="bdmmini" data-kdu="op" ${btip("Ubrat poslední připsaný bod")}>oprava</button>`:""}</div>
      <p class="bdmnote">Body se sečtou při Zpytování svědomí na konci sezení. <button type="button" class="bdmlink" data-bdmsec="duse" data-bdmzav>Celá duše, rány a účinky →</button></p>`];
  if(t==="odp"){const kzMax=kKostkyPool(K).length||kLv(K);
    return ["Odpočinek",`<div class="bdmrow"><button type="button" class="bdmbtn" data-kodp="k" ${btip("Krátký odpočinek (1 hodina): kostky životů, zdroje s krátkým odpočinkem, sloty paktu")}>☾ Krátký</button><button type="button" class="bdmbtn" data-kodp="d" ${btip(`Dlouhý odpočinek (8 hodin): životy, sloty, zdroje, Výdrž, polovina kostek životů, vyčerpání −1`)}>☾☾ Dlouhý</button></div>
      <p class="kdbvy" ${btip(`Kostky životů ${kHDtxt(K)}: použité zaškrtni (krátký odpočinek je utratí sám)`)}><small>Kostky životů ${besc(kHDtxt(K))}</small>${[...Array(kzMax)].map((_,j)=>`<button type="button" class="${j<(+S.kz||0)?"on":""}" data-kkz="${j}" aria-label="Kostka životů ${j+1}"></button>`).join("")}</p>${D.sv>=1&&D.sv<=3?`<p class="bdmnote">Na scestí – Neklidné sny: dlouhý odpočinek vrátí jen polovinu životů.</p>`:""}`]}
  if(t==="zvl"){const wn=(BDM.sheet||{}).w,a=kUtoky(K).find(x=>x.n===wn);if(!a)return ["Vlastnosti zbraně",`<p class="bdmnote">Zbraň nenalezena.</p>`];
    const moje=bdmZvlMoje(a,K),L=bdmZvl(a,K),T0=(moje&&moje.t)||[a.t,BSIKALT[a.t]].filter(Boolean);
    return [`Vlastnosti · ${a.n}`,`<form data-bdmzvf data-w="${besc(a.n)}"><p class="bdmnote">${moje?"Vlastnosti nastavené ručně.":"Podle názvu zbraně"+(L.length?"":" žádné")+" – zaškrtni, co zbraň podle Artikulí má."}</p>
      <div class="bdmzvlg">${Object.keys(BDMZV).map(k=>`<label class="bdmzvlr"><input type="checkbox" name="vl" value="${besc(k)}"${L.includes(k)?" checked":""}> ${bikZv(k)}<b>${besc(k)}</b><small>${besc(BVLZ[k]||"")}</small></label>`).join("")}</div>
      <p class="bdmnote"><b>Šikovná</b> – mezi jakými typy zranění se volí:</p><div class="bdmrow">${["Slashing","Piercing","Bludgeoning"].map(t=>`<label class="bdmzvlt"><input type="checkbox" name="t" value="${t}"${T0.includes(t)?" checked":""}> ${bikZr(t)} ${BZRT[t]}</label>`).join("")}</div>
      <div class="bdmrow"><button class="bdmbtn on">Uložit</button>${moje?`<button type="button" class="bdmbtn" data-bdmzvx="${besc(a.n)}">Podle názvu zbraně</button>`:""}</div></form>`]}
  if(t==="sprava"){const S2=kartaStav(K.id),m=kMuze(K);return [K.n,`<p class="bdmnote">${besc([K.druh,kTridy(K).map(t=>t.n+" "+t.u).join(" / ")||K.povolani].filter(Boolean).join(" · "))} · ${kLv(K)}. úroveň · zdatnost ${bsg(kPB(K))}${K.hrac?` · hraje ${besc(K.hrac)}`:""}${K.test?" · <i>zkušební</i>":""}</p>
      <div class="bdmrow">${kZpetBtn(K)}${m?`<button type="button" class="bdmbtn${KUPRO.has(K.id)?" on":""}" data-kuprt ${btip("Úpravy postavy: povolání a úrovně, vlastnosti, výpočty, předměty, vlastní úpravy")}>⚙ Úpravy</button><button type="button" class="bdmbtn" data-klvup ${btip("Postup na další úroveň: životy, nové rysy, vlastnosti nebo feat")}>⬆ Postup na úroveň</button>`:""}</div>
      <div class="bdmrow">${m&&window.MMDB?`<label class="bdmbtn">Změnit portrét<input type="file" accept="image/*" data-kimg hidden></label>`:""}${S2.img&&m?`<button type="button" class="bdmbtn" data-kimgx>Odebrat portrét</button>`:""}${window.MMDB?`<button type="button" class="bdmbtn" data-khistb ${btip("Předchozí stavy karty – lze obnovit")}>Historie</button>`:""}<button type="button" class="bdmbtn" data-ktisk ${btip("Vytiskne kartu nebo ji uloží jako PDF")}>Tisk</button><button type="button" class="bdmbtn" data-kexport ${btip("Stáhne kartu a stav postavy jako JSON")}>Export</button>${GMV&&!KSTAT.has(K.id)&&!K.test?`<button type="button" class="bdmbtn" data-ksmaz>Smazat kartu</button>`:""}</div>
      <p class="bdmnote"><a href="#karty">Všechny karty, nahrání PDF a herní záznam družiny →</a></p>`]}
  if(t==="kost")return ["Hod kostkou",`${kPriHtml(K)}<p class="kadv" role="radiogroup" aria-label="Další hod">${[[0,"normálně"],[1,"výhoda"],[-1,"nevýhoda"]].map(([k,l])=>`<label><input type="radio" name="kadv-${besc(K.id)}" data-bdmadv="${k}"${KADV===k?" checked":""}> ${l}</label>`).join("")}</p>${kHodForm(K)}<p class="bdmnote">Ke každému hodu se hází i kostka Závoje (d6): 1–2 Pokušení, 5–6 Požehnání${zv.z?" – teď Hodina Závoje, Pokušení na 1–3":""}.</p>`];
  if(t==="utok"){const L=BDM.sheet||{},zb=X.boj?bojZbrVse(s,h):[],w=L.j!=null?zb[+L.j]:null,sp=L.ks!=null?kSeznam(K)[+L.ks]:null;
    if(gm)return [w?`Za hráče · ${w.n}`:"Zapsat za hráče",`${w&&X.boj?bojPredHod(s,h,K,true,L.j):""}${X.utok||`<p class="bdmnote">Boj neběží.</p>`}`];
    return [w?`Útok · ${w.n}`:sp?`Kouzlo · ${sp.n}`:"Útok na cíl",w?`${bojPredHod(s,h,K,false,L.j)}${String(X.utok||"").replace(/<div class="butc">[\s\S]*?<\/span><\/div>/,"")}`:sp&&X.boj?bojPredKouzlo(s,h,K):`${X.utok||""}`]}
  return ["",""]}
function bojDbm(s,h,K,gm,vzdy,X){X=X||{};const S=kartaStav(K.id),D=kDuse(K),mx=kHPmax(K),cur=X.boj?bojHpPC(h,K):(S.hp!=null?+S.hp:mx),thp=+S.thp||0,pr=Math.max(0,Math.min(100,Math.round(cur/mx*100)));
  const key=K.id,ac=kAC(K)+(X.boj?(+h.kryt||0):0),IMG=kImg(K)||bojPortH(K.n),sek=bdmSekce(K),sec=sek.some(x=>x[0]===BDM.sec[key])?BDM.sec[key]:"akce";
  const tr=kTridy(K),sub=[K.druh,tr.map(t=>`${t.n} ${t.u}`).join(" • ")||K.povolani].filter(Boolean).join(" · ");
  const ZU=kZbrU(K),zuL=[ZU.z,ZU.s].filter(Boolean),zuZb=zuL.reduce((a,z)=>a+Math.max(0,z.max-z.u),0);
  const stL0=X.boj?(h.stav||[]).filter(t=>BSTAVH.includes(t)):(S.stavy||[]);
  const insp=!!S.insp,zv=zavojInfo(),kr=kRany(K),kd=kKonDrzi(K),stN=stL0.length+(kd&&!stL0.includes("soustředí")?1:0)+(+S.vycerp?1:0),sv=kSvKl(D.sv),shOpen=BDM.sheet&&BDM.sheet.k===key?BDM.sheet.t:"";
  const hpB=(c)=>`<button type="button" class="bdmhp${c||""}${cur<=0?" bhp0":cur<=mx/2?" bhp2":""}" data-bdmsh="hp" aria-expanded="${shOpen==="hp"}" ${btip("Životy – klikni: zranění, léčení, dočasné HP")}><small>Životy</small><b>${cur}<i>/${mx}</i>${thp?`<em>+${thp}</em>`:""}</b><i class="bdmhpbar" style="--p:${pr}%"></i></button>`;
  /* pruh: jen to, co právě platí */
  const art=[zv.z||zv.fe.length?`<span class="bdmch bdmzav${zv.pravda?" bdmpravda":""}" ${btip(zv.pravda?"Hodina Pravdy: svátek a Hodina Závoje – kostka Závoje nezná neutrální výsledek":zv.z?`Hodina Závoje (${zv.z}): Pokušení padá již na 1–3`:`Svátek: ${zv.fe.map(x=>x.n).join(", ")}`)}>${bi("zavoj")}${zv.pravda?"Hodina Pravdy":zv.z?"Hodina Závoje":"Svátek"}</span>`:"",
    kr.length?`<a class="bdmch bdmrany" href="#karty/${besc(K.id)}" data-bdmsec="duse" ${btip(`Neléčené rány: ${kr.map(x=>x.t).join("; ")} – podrobnosti na hlavní kartě`)}>✚ ${kr.length} ${kr.length===1?"rána":kr.length<5?"rány":"ran"}</a>`:"",
    +S.vycerp?`<span class="bdmch bdmvy" ${btip(`Vyčerpání ${S.vycerp}: −${2*S.vycerp} k hodům d20, rychlost −${5*S.vycerp}`)}>vyčerpání ${S.vycerp}</span>`:"",
    X.boj&&h.ds?bojDsPip(h):""].filter(Boolean).join("");
  /* hlavička */
  const head=`<header class="bdmh"><div class="bdmtop">${gm?`<button type="button" class="bdmback" data-bhrozb="${h.id}" aria-label="Sbalit kartu" ${btip("Sbalit")}>‹</button>`:`<span class="bdmback0"></span>`}<div class="bdmnm"><b>${besc(K.n)}</b><small>${besc(sub)}</small></div>${curView==="karty"?`<span class="bdmback0"></span>`:`<a class="bdmkl" href="#karty/${besc(K.id)}" aria-label="Karta na celou stránku" ${btip("Karta na celou stránku")}>${bdmIc("rysy")}</a>`}</div>
    <div class="bdmgrid">
      <span class="bdmacw">${(()=>{const R=kOdol(K),I=K.imu||[];return R.length||I.length?`<span class="bdmres" ${btip(`${R.length?"Resistance: "+R.map(t=>BZRT[t]||t).join(", "):""}${R.length&&I.length?" · ":""}${I.length?"Immunity: "+I.map(t=>BZRT[t]||t).join(", "):""}`)}>${R.map(t=>bikZr(t)).join("")}${I.map(t=>`<span class="bdmimu">${bikZr(t)}</span>`).join("")}</span>`:""})()}
      <button type="button" class="bdmac${zuL.length&&!zuZb?" bdmzbr0":""}" data-bdmsh="ac" aria-expanded="${shOpen==="ac"}" ${btip(`AC ${ac}: ${kACR(K).txt}${X.boj&&h.kryt?` + kryt ${h.kryt}`:""}${zuL.length?` · obětování zbroje při kritickém zásahu: zbývá ${zuZb} (${zuL.map(z=>`${z.k==="Štít"?"štít":z.k.toLowerCase()} ${z.max-z.u}/${z.max}`).join(", ")})`:""} – klikni`)}><small>AC</small><b>${ac}</b>${zuL.length?`<span class="bdmzk" aria-label="Obětování zbroje: zbývá ${zuZb}">${zuL.map(z=>`<span class="bdmzkg${z.k==="Štít"?" bdmzks":""}">${[...Array(z.max)].map((_,j)=>`<i class="${j<z.max-z.u?"on":""}"></i>`).join("")}</span>`).join("")}</span>`:""}</button></span>
      <button type="button" class="bdmini bdmsvh psv${sv}" data-bdmsh="sv" aria-expanded="${shOpen==="sv"}" ${btip(`Svědomí ${D.sv} – ${SVST(D.sv)}. Klikni: body hříchu a dobrých skutků`)}><b>${D.sv}</b><small>Svědomí</small>${D.hr||D.sk?`<span class="bdmsvb" aria-label="Body hříchu ${D.hr}, dobré skutky ${D.sk}"><i class="bdmsvh1">${D.hr}</i><i class="bdmsvd1">${D.sk}</i></span>`:""}</button>
      <span class="bdmportw"><button type="button" class="bdmport bdmsv${sv}${insp?" on":""}" data-bdmins aria-pressed="${insp}" ${btip(`Svědomí ${D.sv} – ${SVST(D.sv)} (barva rámu). Hrdinská inspirace: ${insp?"má ji – klikni a utrať":"nemá – klikni, když ji získá"} (podle Artikulí za jednání podle Ctnosti nebo podlehnutí Neřesti).`)}>${IMG?`<img src="${besc(IMG)}" alt="" width="96" height="96">`:`<span class="bdmpini">${besc((K.n||"?")[0])}</span>`}<span class="bdmsun">${bdmIc("slunce")}</span></button>${X.boj?`<button type="button" class="bdmrk${X.rk?" on":""}" ${gm?`data-break="${h.id}"`:vzdy?"data-bhrk":"disabled"} aria-pressed="${!!X.rk}" ${btip(`Reakce: ${X.rk?"v tomto kole použita":"k dispozici"} – klikni`)}>R</button>`:""}</span>
      ${hpB("")}
      <span class="bdmbtns"><button type="button" class="bdmsq" data-bdmsh="odp" aria-expanded="${shOpen==="odp"}" aria-label="Odpočinek" ${btip("Krátký nebo dlouhý odpočinek, kostky životů")}>${bdmIc("ohen")}</button><button type="button" class="bdmsq" data-bdmsh="sprava" aria-expanded="${shOpen==="sprava"}" aria-label="Postava: úpravy, postup na úroveň, historie" ${btip("Postava: úpravy, postup na úroveň, portrét, historie, tisk")}>${bdmIc("kolo")}</button></span>
      ${(()=>{const L=[...stL0,...(kd&&!stL0.includes("soustředí")?["soustředí"]:[])],ic=t=>SRDIC[t]?bi(SRDIC[t],"bdmsti1"):BSTI[t]?bi(BSTI[t][0],"bdmsti1"):"",V=+S.vycerp||0;
        if(!L.length&&!V)return `<small class="bdminl">Inspirace</small>`;const I=[...L.map(t=>[ic(t),t]),...(V?[[bi("vycerpani","bdmsti1"),`vyčerpání ${V}`]]:[])].filter(x=>x[0]);
        return `<button type="button" class="bdminl bdmsti${I.length>=3?" bdmsti3":""}" data-bdmsh="st" aria-label="Stavy: ${besc(I.map(x=>x[1]).join(", "))}" ${btip(`Stavy: ${I.map(x=>x[1]).join(", ")} – klikni`)}>${I.slice(0,4).map(x=>x[0]).join("")}${I.length>4?`<b>+${I.length-4}</b>`:""}</button>`})()}
      <button type="button" class="bdmst" data-bdmsh="st" aria-expanded="${shOpen==="st"}" ${btip(kd?"Stavy – postava se soustředí (Concentration)":"Stavy")}>Stavy${stN?` <b>${stN}</b>`:""}</button>
    </div>${art?`<div class="bdmart">${art}</div>`:""}</header>`;
  /* hlášky v jednom proužku: první je vidět, ostatní po klepnutí */
  const hl=shOpen==="utok"&&X.hlS!=null?X.hlS:X.hl!=null?X.hl:kHlas([navrhyMojeHtml(K),postupBanner(K),kZavBox(K),KKON[K.id]&&kKonDrzi(K)?`<p class="khl kdbkon">${bi("soustredi")} <b>Soustředění:</b> CON záchrana SO ${KKON[K.id]} <button type="button" class="gbtn" data-kkonh>🎲 CON ${bsg(kZach(K,"CON"))}${K.konVyhoda?" s výhodou":""}</button><button type="button" class="kx" data-kkonx aria-label="Zavřít">×</button></p>`:"",kPoslBox(K)]);
  const hlN=(hl.match(/<(?:p|div) class="khl/g)||[]).length,hlO=BDM.hlo.has(key);
  const hlH=hl?`<div class="bdmhl${hlN>1&&!hlO?" bdmhlz":""}">${hl}${hlN>1?`<button type="button" class="bdmhlb" data-bdmhl aria-expanded="${hlO}">${hlO?"méně":`+${hlN-1}`}</button>`:""}</div>`:"";
  /* lepkavý pruh: zúžená hlavička (při posunu) a záložky */
  const lep=`<div class="bdmlep"><div class="bdmmi"><span class="bdmmin">${besc(K.n)}</span><button type="button" class="bdmmac" data-bdmsh="ac" ${btip("AC – obětování zbroje")}>AC <b>${ac}</b></button>${hpB(" bdmmhp")}</div>
    <nav class="bdmtabs" role="tablist" aria-label="Oddíly karty">${sek.map(([id,n,k])=>`<button type="button" role="tab" data-bdmsec="${id}" aria-selected="${id===sec}" ${btip(n)}>${bdmIc(id)}<span>${besc(k)}</span></button>`).join("")}</nav></div>`;
  const body=`<section class="bdmsec" data-bdmid="${sec}">${bdmTelo(s,h,K,gm,X,sec)}</section>`;
  const konec=vzdy&&X.boj&&(s.obsazeni||{})[s.tah]===h.id?((s.hotovo||{})[h.id]===(s.kolo||1)*100+(s.tah||0)?`<p class="bdmnote">✓ Tah dohrán – vypravěč posune dál.</p>`:bojKonecBtn(h.id)):"";
  const list=shOpen?(()=>{const [tit,obs]=bdmList(s,h,K,gm,X,shOpen);return `<div class="bdmzavb" data-bdmzav aria-hidden="true"></div><div class="bdmlist" role="dialog" aria-label="${besc(tit)}" data-bdmlist><div class="bdmlh" data-bdmlh><i aria-hidden="true"></i><b>${besc(tit)}</b><button type="button" class="bdmlx" data-bdmzav aria-label="Zavřít">×</button></div><div class="bdmlb">${obs}</div></div>`})():"";
  const upr=`${!kMuze(K)&&X.karta?`<p class="kropozn">Tuto kartu upravuje přihlášený hráč. Ke své postavě se přihlas na stránce <a href="#hra">Hra</a>.</p>`:""}${kMuze(K)?kLvupHtml(K)+(KUPRO.has(K.id)?kUprHtml(K):""):""}`;
  return `<div class="bdm kdb bhkb${kMuze(K)?"":" kro"}" data-kid="${besc(K.id)}">${head}${hlH}${upr}${lep}<div class="bdmbody" data-bdmsw="${besc(key)}">${body}</div>${konec}<button type="button" class="bdmd20" data-bdmsh="kost" aria-expanded="${shOpen==="kost"}" aria-label="Hod kostkou" ${btip("Hod kostkou: vlastní výraz se Závojem, výhoda a nevýhoda")}>${bdmIc("d20")}</button>${list}</div>`}
/* jediná karta postavy (2026-10-18): stejná na stránce Karty, Hra i v Boji; mimo boj se životy a stavy zapisují rovnou do karty */
function kartaJednaHtml(K){kModsSync(K);return bojDbm(null,{id:"_"+K.id,n:K.n},K,false,true,{boj:false,karta:true})}
/* hráč mimo boj: jeho bojová karta i bez běžícího boje */
function bojDbmMimo(){const ja=JA.get(),K=ja&&ja.k&&KARTBY[ja.k];if(!K||GMV)return "";return `<section class="bdmmimo"><h3 class="uvh2">Moje karta</h3>${bojDbm(null,{id:"_"+K.id,n:K.n},K,false,true,{boj:false})}</section>`}
const bdmPrekresli=()=>{if(curView==="boj")renderBoj();else kartyPrekresli()};
const bdmZavri=()=>{if(!BDM.sheet)return;BDM.sheet=null;bdmPrekresli()};
document.addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s),root=T(".bdm");
  const kt=T("[data-bdmktab]");if(kt){KTAB.set(kt.dataset.bdmktab)}
  if(!root)return;const key=root.dataset.kid,K=KARTBY[key];
  if(T("[data-bdmzav]")){bdmZavri();return}
  if(BDM.sheet&&T("[data-bdmlist] [data-kodp],[data-bdmlist] [data-juposl]")){BDM.sheet=null;setTimeout(bdmPrekresli,0);return}
  if(BDM.sheet&&BDM.sheet.t==="sprava"&&T("[data-bdmlist] button:not(.bdmlx),[data-bdmlist] a")){BDM.sheet=null;setTimeout(bdmPrekresli,0)}
  const sh=T("[data-bdmsh]");if(sh){const t=sh.dataset.bdmsh;
    if(BDM.sheet&&BDM.sheet.k===key&&BDM.sheet.t===t&&t!=="utok"){bdmZavri();return}
    BDM.sheet={k:key,t};
    if(t==="zvl")BDM.sheet.w=sh.dataset.zvl;
    if(t==="utok"){const j=sh.dataset.j,ks=sh.dataset.ks;if(j!=null){BDM.sheet.j=+j;if(GMV){const hc=sh.closest("[data-bhcard]"),G=hc&&BGMU[hc.dataset.bhcard];if(G)G.adv=0}if(!GMV){const s0=BOJ.s||{},me=(s0.hraci||[]).find(x=>x.n===bojJa.get()),w=me&&bojZbrVse(s0,me)[+j];if(w){BJU.ks=null;BJU.plos=false;BJU.adv="0";BJU.zi=String(j);BJU.t=w.t||BJU.t;BJU.drt=!!w.drt;BJU.pru=!!w.pru;BJU.dal=!!w.dal}}}
      if(ks!=null){BDM.sheet.ks=+ks;bojJaZvolKouzlo(+ks)}}
    bdmPrekresli();if(t==="hp")setTimeout(()=>{const i=document.querySelector(".bdmlist .bdmhpz input");if(i)i.focus()},40);return}
  if(T("[data-bdmhl]")){if(BDM.hlo.has(key))BDM.hlo.delete(key);else BDM.hlo.add(key);bdmPrekresli();return}
  const sc=T("[data-bdmsec]");if(sc){e.preventDefault();BDM.sheet=null;BDM.sec[key]=sc.dataset.bdmsec;bdmSecUloz();bdmPrekresli();const r=document.querySelector(`.bdm[data-kid="${CSS.escape(key)}"] .bdmlep`);if(r&&r.getBoundingClientRect().top<0)r.scrollIntoView({block:"start"});return}
  const af=T("[data-bdmaf]");if(af){BDM.af[key]=af.dataset.bdmaf;bdmPrekresli();return}
  const ux=T("[data-bdmutx]");if(ux&&!T(".bdmruk")){const k=key+"|"+ux.dataset.bdmutx;if(BDM.utx.has(k))BDM.utx.delete(k);else BDM.utx.add(k);bdmPrekresli();return}
  const kf=T("[data-bdmkf]");if(kf){const v=kf.dataset.bdmkf;BDM.kf[key]=BDM.kf[key]===v?"all":v;bdmPrekresli();return}
  if(T("[data-bdmins]")&&K){if(!kMuze(K))return;kartaStavZmen(K.id,{insp:!kartaStav(K.id).insp||null},`${K.n}: hrdinská inspirace ${kartaStav(K.id).insp?"utracena":"získána"}.`);return}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&BDM.sheet)bdmZavri()});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-bdmadv]")){KADV=+t.dataset.bdmadv}});
/* přejetí prstem: po těle karty další / předchozí záložka, po hlavě listu dolů zavře list */
const BDMSW={};
document.addEventListener("touchstart",e=>{const t=e.touches[0];if(e.touches.length!==1)return;const lh=e.target.closest&&e.target.closest("[data-bdmlh]");if(lh){BDMSW.l=1;BDMSW.y=t.clientY;BDMSW.k=null;return}
  const b=e.target.closest&&e.target.closest("[data-bdmsw]");if(!b||e.target.closest("input,select,textarea,.bsloty,.bdmchips"))return;BDMSW.l=0;BDMSW.k=b.dataset.bdmsw;BDMSW.x=t.clientX;BDMSW.y=t.clientY},{passive:true});
document.addEventListener("touchend",e=>{const t=e.changedTouches[0];if(BDMSW.l){BDMSW.l=0;if(t.clientY-BDMSW.y>60)bdmZavri();return}
  if(!BDMSW.k)return;const k=BDMSW.k,dx=t.clientX-BDMSW.x,dy=t.clientY-BDMSW.y;BDMSW.k=null;if(Math.abs(dx)<70||Math.abs(dy)>45)return;
  const K=KARTBY[k];if(!K)return;const L=bdmSekce(K).map(x=>x[0]),i=Math.max(0,L.indexOf(BDM.sec[k]||"akce")),n=L[(i+(dx<0?1:-1)+L.length)%L.length];BDM.sec[k]=n;bdmSecUloz();bdmPrekresli()},{passive:true});
/* zúžená hlavička: když hlavička karty odjede pod lepkavé lišty, přilepí se jméno, AC a životy se záložkami */
function bdmLepky(){const o=curView==="boj"?document.querySelector("#bojview .bosa"):null,nh=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navh"))||0,top=o&&getComputedStyle(o).position==="sticky"?Math.max(nh,o.getBoundingClientRect().bottom):nh;
  document.documentElement.style.setProperty("--bdmtop",Math.round(top)+"px");document.querySelectorAll(".bdm").forEach(c=>{const hd=c.querySelector(".bdmh");if(hd)c.classList.toggle("bdmsm",hd.getBoundingClientRect().bottom<top+4)})}
addEventListener("scroll",()=>{if(!BDMSW.r){BDMSW.r=1;requestAnimationFrame(()=>{BDMSW.r=0;bdmLepky()})}},{passive:true});
/* z hlavní karty do Boje: otevře bojovou kartu této postavy */
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-bdmgo]");if(!a)return;BDM.fokus=a.dataset.bdmgo});
/* ===== Boj: zásahy rovnou do karty, reakce na telefonu, plošné zásahy a iniciativa výzvou, začátek tahu,
   přehled družiny, po boji, skupinové ověření (2026-10-17) ===== */
const bojPcAuto={get(){try{return localStorage.getItem("mm-boj-pcauto")!=="0"}catch(e){return true}},set(v){try{localStorage.setItem("mm-boj-pcauto",v?"1":"0")}catch(e){}}};
const kHpOf=(K,ks)=>ks.hp!=null?+ks.hp:kHPmax(K);
/* vypravěč: zásah nepřítele odečte postavě s kartou životy hned (s odolnostmi, dočasnými HP, pádem na 0) */
function bojPcZasah(o,cid,K){const S=BOJ.s||{},h0=(S.hraci||[]).find(x=>x.id===cid);if(!h0||!K||!o.zr||!(o.zr.t>0))return null;
  const ks0=Object.assign({},kartaStav(K.id)),hp0=kHpOf(K,ks0),t0=+ks0.thp||0,ds0=!!h0.ds,typ=(bojTypy({zt:o.zr.zt})[0])||"Slashing",krit=!!(o.hod&&o.hod.krit);
  const opt={drt:/drtiv/i.test(o.p||""),pru:/průrazn/i.test(o.p||"")};
  const msg=bojPCZmena(cid,x=>bojZranPC(x,K,o.zr.t,typ,krit,opt),false)||"";const ks1=kartaStav(K.id),h1=((BOJ.s||{}).hraci||[]).find(x=>x.id===cid)||{};
  const ph=Math.max(0,hp0-kHpOf(K,ks1)),pt=Math.max(0,t0-(+ks1.thp||0)),pd=!ds0&&!!h1.ds,pod=pd?BZRPOD:0;
  /* obětování zbroje (Artikule): kritický zásah se změní v běžný – kolik HP by se vrátilo (rozdíl účinku kritického a běžného zranění) */
  const ob=krit&&o.zr.t1!=null&&kZbrU(K)&&(()=>{const Z=kZbrU(K);return (Z.z&&Z.z.u<Z.z.max)||(Z.s&&Z.s.u<Z.s.max)})()?Math.max(0,Math.min(ph+pt,bojZranEf(K,o.zr.t,typ,opt).v-bojZranEf(K,o.zr.t1,typ,opt).v)):0;
  /* pád na 0 HP: vyčerpání přičte karta, hod na kritické zranění se připraví vypravěči (neléčené rány, HP pod nulou) */
  if(pd&&GMV){BKS.komu=h0.n;BKS.rany=(bojKritPC()[h0.n]||[]).length;BKS.pod=pod;BKS.vys="";BKS.kdo=h0.n+" padl";BKS.druh=bojKritDruh(typ)}
  let kv=false;if(ph+pt>0&&kKonDrzi(K)&&!pd){if(GMV&&window.MMDB&&MMDB.vyzva){kv=true;bojKonVyzva(K,cid,bojKonDC(ph+pt))}else KKON[K.id]=bojKonDC(ph+pt)}
  return {msg,ph,pt,pd,typ,kv,ob,pod}}
/* soustředění postavy po zásahu (2026-10-18): hráči vyskočí výzva k CON záchraně, hodí si ji sám; neúspěch ukončí soustředění */
const BKONV={};
function bojKonVyzva(K,hid,dc){MMDB.vyzva({typ:"zach",ab:"CON",dc,komu:[K.id],adv:K.konVyhoda?1:undefined,pozn:`Soustředění: utržené zranění – neúspěch ukončí soustředění${K.konVyhoda?" (War Caster: s výhodou)":""}`.slice(0,200)})
  .then(v=>{BKONV[+v]={kid:K.id,hid,dc};vyzvyNacti()}).catch(()=>{KKON[K.id]=dc})}
/* hráč: nový zásah na mou postavu ve veřejném záznamu boje → hlášení, vibrace, soustředění, nabídka reakcí */
let BZAS=null;const BZASV={get(){try{return +localStorage.getItem("mm-zas-seen")||0}catch(e){return 0}},set(v){try{localStorage.setItem("mm-zas-seen",String(v))}catch(e){}}};
function bojZasahHlidej(s,me){if(!me)return;const K=bojKartaH(me);const L=(s.zaz||[]).filter(e=>e.ci===me.id&&e.ts>BZASV.get()&&(e.z>0||e.ph>0||e.pt>0||/zásah|krit/.test(e.v||"")));if(!L.length)return;
  const e=L[0];BZASV.set(Math.max(...L.map(x=>x.ts)));const ztr=(+e.ph||0)+(+e.pt||0);
  try{navigator.vibrate&&navigator.vibrate([160,80,160])}catch(x){}
  mmHlas(`${e.a||"Nepřítel"} tě zasáhl${e.cim?` (${e.cim})`:""}${ztr?` za ${ztr}${e.t?" "+String(e.t).replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,m=>BZRT[m]||m):""} – už odečteno z karty`:e.z?` za ${e.z}`:""}.`,8000);mmNotif("Zásah!",`${e.a||""} ${e.v||""}`);
  if(K){if(ztr>0&&kKonDrzi(K)&&!e.pd&&!e.kv)KKON[K.id]=bojKonDC(ztr);BZAS={e,kid:K.id,hid:me.id,cas:Date.now()}}renderBoj()}
/* reakce, které postava může použít na zásah */
function kReakceNaZasah(K,h,s,e){const o=[],rk=!!(s.reak||{})[h.id],hod=+e.hod,AC=+e.ac,ztr=(+e.ph||0)+(+e.pt||0),ry=n=>[...(K.rysy||[]),...(K.rysy2||[]).map(r=>r.n)].some(x=>n.test(String(x)));
  {const Z=kZbrU(K),zb=Z&&(Z.z&&Z.z.u<Z.z.max?Z.z:Z.s&&Z.s.u<Z.s.max?Z.s:null);if(e.kr&&zb)o.push({k:"obet",n:`Obětovat ${zb.k==="Štít"?"štít":zb.k.toLowerCase()+" zbroj"}${+e.ob?` – vrátí ${e.ob} HP`:""}`,t:`Kritický zásah se změní v běžný (Artikule): kostky zranění jen jednou${+e.ob?`, vrátí ${e.ob} HP`:""} a hod na kritické zranění odpadá. Není to reakce.`})}
  if(rk)return {rk,o};const sez=kSeznam(K),sl=kSloty(K).filter(q=>q.u<q.max);
  sez.forEach((x,i)=>{if(kCasKouzla(x)!=="R")return;const ok=x.st===0||sl.some(q=>q.st>=x.st);if(!ok)return;
    if(/^shield$/i.test(x.n)){const pom=!e.kr&&hod&&AC&&hod<AC+5;o.push({k:"shield",i,n:`Shield${pom?" – útok mine":" (+5 AC)"}`,t:pom?`Útok ${hod} proti AC ${AC}+5 = vedle: vrátí ${ztr} HP, slot ${x.st}. st.`:`+5 AC do tvého dalšího tahu, tento útok to nezmění (${e.kr?"kritický zásah":`hod ${hod||"?"}`})`});return}
    if(/^absorb elements$/i.test(x.n)){const el=/Acid|Cold|Fire|Lightning|Thunder/.test(e.t||"");o.push({k:"absorb",i,n:`Absorb Elements${el?" – polovina":""}`,t:el?`Resistance vůči ${e.t}: vrátí ${Math.ceil(ztr/2)} HP`:"Jen proti kyselinovému, mrazivému, ohnivému, bleskovému a hromovému zranění"});return}
    o.push({k:"kz",i,n:x.n,t:`Sešle ${x.n} jako reakci`})});
  if(ry(/^uncanny dodge$/i)&&ztr>0)o.push({k:"ud",n:"Uncanny Dodge – polovina",t:`Polovina zranění: vrátí ${Math.ceil(ztr/2)} HP`});
  if(ry(/^deflect attacks?$/i)&&ztr>0&&/Bludgeoning|Piercing|Slashing/.test(e.t||""))o.push({k:"da",n:"Deflect Attacks",t:`Sníží zranění o 1d10 + AGI + úroveň mnicha`});
  if(ry(/^defensive duelist$/i)&&!e.kr&&hod&&AC&&hod<AC+kPB(K))o.push({k:"dd",n:"Defensive Duelist – útok mine",t:`+${kPB(K)} AC proti útoku: vrátí ${ztr} HP`});
  return {rk,o}}
function kZasahHtml(K,h,s){if(!BZAS||BZAS.kid!==K.id||Date.now()-BZAS.cas>10*60e3)return "";const e=BZAS.e,ztr=(+e.ph||0)+(+e.pt||0),R=kReakceNaZasah(K,h,s,e);
  return `<div class="khl kzas"><b>${besc(e.a||"Nepřítel")}</b> tě zasáhl${e.cim?` · ${besc(e.cim)}`:""}${e.hod?` · hod ${e.hod}${e.ac?` proti AC ${e.ac}`:""}`:""}${ztr?` · <b>−${ztr}</b> ${bikZrTxt(e.t)} <small>už odečteno</small>`:""}${e.pd?" · <b>padáš na 0</b>":""}
    ${R.rk?`<small>Reakci už jsi v tomto kole použil.</small>`:R.o.map(r=>`<button type="button" class="gbtn" data-bzr="${r.k}"${r.i!=null?` data-i="${r.i}"`:""} ${btip(r.t)}>${besc(r.n)}</button>`).join("")}<button type="button" class="gbtn ghost" data-bzr="ok">${R.o.length&&!R.rk?"Bez reakce":"Rozumím"}</button></div>`}
async function kZasahReakce(K,k,i){const z=BZAS;if(!z||z.kid!==K.id)return;const s=BOJ.s||{},h=(s.hraci||[]).find(x=>x.id===z.hid),e=z.e;BZAS=null;if(k==="ok"||!h){renderBoj();return}
  const ztr=(+e.ph||0)+(+e.pt||0),vrat=async(n,proc)=>{if(n<=0)return;const ks=kartaStav(K.id),mx=kHPmax(K),ph=Math.min(+e.ph||0,n),pt=Math.min(+e.pt||0,n-ph),hp=Math.min(mx,kHpOf(K,ks)+ph+(n-ph-pt));
    const ch={hp:hp>=mx?null:hp};if(pt)ch.thp=(+ks.thp||0)+pt;if(e.pd&&hp>0){ch.vycerp=Math.max(0,(+ks.vycerp||0)-1)||null;bojHracAkce(h.id,x=>{delete x.ds})}
    await kartaStavZmen(K.id,ch,null);if(KKON[K.id]){const zb=ztr-n;if(zb>0)KKON[K.id]=bojKonDC(zb);else delete KKON[K.id]}kHodZapis({k:K.id,kdo:K.n,co:`Reakce: ${proc}`,txt:`zásah od ${e.a||"nepřítele"}${e.hod?` (${e.hod})`:""}: vráceno ${n} HP`})};
  if(k==="obet"){await kObetujZbroj(K,h,e,vrat);renderBoj();return}/* obětování zbroje není reakce */
  bojHracAkce(h.id,(x,zz)=>{(zz.reak=zz.reak||{})[h.id]=1});
  if(k==="shield"||k==="absorb"||k==="kz"){const sp=kSeznam(K)[+i];if(!sp)return;await kartaSeslat(K,sp);
    if(k==="shield"){const L=kUc(K).filter(x=>x.n!=="Shield");L.push({n:"Shield",ac:5,h:0.0017});await kartaStavZmen(K.id,{uc:L});if(!e.kr&&+e.hod<+e.ac+5)await vrat(ztr,"Shield – útok minul")}
    if(k==="absorb"&&/Acid|Cold|Fire|Lightning|Thunder/.test(e.t||""))await vrat(Math.ceil(ztr/2),"Absorb Elements")}
  else if(k==="ud")await vrat(Math.ceil(ztr/2),"Uncanny Dodge");
  else if(k==="da"){const mk=kTrU(kCtx(K),"Monk")||kLv(K),r=bK(10)+kMod(kVl(K,"AGI")||10)+mk;await vrat(Math.min(ztr,r),`Deflect Attacks (${r})`)}
  else if(k==="dd")await vrat(ztr,"Defensive Duelist – útok minul");
  mmHlas(`${K.n}: reakce použita.`,4000);renderBoj()}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bzr]");if(!b)return;const K=kvK(b);if(K)kZasahReakce(K,b.dataset.bzr,b.dataset.i)});
/* plošný zásah a iniciativa výzvou: odpovědi hráčů zpracuje vypravěčovo zařízení samo */
const BPLV={};let BINIV=new Set();
function bojVyzZpracuj(){if(!GMV||!BOJ.s||!(BOJ.s.aktivni||BOJ.s.priprava))return;const s=BOJ.s;
  Object.keys(BPLV).forEach(id=>{const P=BPLV[id],v=VYZVY.find(x=>x.id===+id);if(!v)return;Object.entries(v.odpovedi||{}).forEach(([kid,o])=>{if(P.hot.has(kid))return;P.hot.add(kid);
    const hid=P.map[kid],h=(s.hraci||[]).find(x=>x.id===hid),K=bojKartaH(h);if(!h||!K)return;const ok=P.dc?o.tot>=P.dc:false,dmg=ok?(P.pol?Math.floor(P.dmg/2):0):P.dmg;
    let r={ph:0,pt:0,pd:false,msg:"bez zranění"};if(dmg>0)r=bojPcZasah({zr:{t:dmg,zt:P.t}},hid,K)||r;
    bojZaz({a:P.src||"",c:h.n,ci:hid,cim:P.cim||"plošný zásah",v:`${P.ab} ${o.tot} – ${ok?"úspěch":"neúspěch"}${dmg?`, ${dmg}`:""}`,z:dmg,t:P.t,ph:r.ph,pt:r.pt,pd:r.pd,kv:r.kv?1:undefined});
    if(!ok&&(P.st||[]).length){bojZmen(z=>{const hh=(z.hraci||[]).find(x=>x.id===hid);if(hh)bojStavDej(z,hh,{n:P.cim||"Plošný zásah",st:P.st,op:P.op,k:P.k,ab:P.ab,dc:P.dc})});r.msg+=` · ${P.st.join(", ")}`}
    bojLog(hid,{n:P.cim||"Plošný zásah",ci:hid,zt:`${P.ab} ${o.tot} ${ok?"úspěch":"neúspěch"} → ${r.msg}`},h.n);mmHlasG(`${h.n}: ${P.ab} ${o.tot} ${ok?"úspěch":"neúspěch"} – ${r.msg}`,5000)});
    if(Object.keys(P.map).every(k=>P.hot.has(k))){delete BPLV[id];MMDB.vyzvaZavri(+id).catch(()=>{})}});
  Object.keys(BKONV).forEach(id=>{const P=BKONV[id],v=VYZVY.find(x=>x.id===+id);if(!v)return;const o=(v.odpovedi||{})[P.kid];if(!o)return;delete BKONV[id];MMDB.vyzvaZavri(+id).catch(()=>{});
    const K=KARTBY[P.kid],h=(s.hraci||[]).find(x=>x.id===P.hid),ok=o.tot>=P.dc;if(!K)return;
    if(!ok)kKonZtrata(K,"neúspěšná záchrana").then(()=>{if(curView==="boj")renderBoj()}).catch(()=>{});
    if(h)bojLog(P.hid,{n:"Soustředění",ci:P.hid,zt:`CON ${o.tot} proti SO ${P.dc} – ${ok?"udrženo":"soustředění končí"}`},h.n);mmHlasG(`${K.n}: soustředění – CON ${o.tot} ${ok?"udrženo":"ztraceno"}.`,5000)});
  Object.keys(BOPV).forEach(id=>{const P=BOPV[id],v=VYZVY.find(x=>x.id===+id);if(!v)return;const o=(v.odpovedi||{})[P.kid];if(!o)return;delete BOPV[id];MMDB.vyzvaZavri(+id).catch(()=>{});
    const ok=o.tot>=P.dc,h=(s.hraci||[]).find(x=>x.id===P.hid);if(!h)return;
    if(ok)bojZmen(z=>{const hh=(z.hraci||[]).find(x=>x.id===P.hid);if(hh)(hh.ef||[]).filter(e=>e.n===P.n).forEach(e=>bojEfDel(hh,e))});
    bojLog(P.hid,{n:P.n,ci:P.hid,zt:`opakovaná záchrana ${P.ab} ${o.tot} – ${ok?"úspěch, účinek končí":"neúspěch, trvá dál"}`},h.n);mmHlasG(`${h.n}: ${P.n} – záchrana ${o.tot} ${ok?"uspěla, účinek končí":"neuspěla"}.`,5000)});
  VYZVY.filter(v=>!v.zavrena&&v.data&&v.data.typ==="ini"&&BINIV.has(v.id)).forEach(v=>{const ch=[];Object.entries(v.odpovedi||{}).forEach(([kid,o])=>{const h=(s.hraci||[]).find(x=>bojKartaH(x)&&bojKartaH(x).id===kid);if(h&&h.hod!==o.tot)ch.push([h.id,o.tot])});
    if(ch.length)bojZmen(z=>{ch.forEach(([id,t])=>{const h=(z.hraci||[]).find(x=>x.id===id);if(h)h.hod=t})});
    const ids=(s.hraci||[]).map(h=>bojKartaH(h)).filter(Boolean).map(K=>K.id);if(ids.length&&ids.every(k=>(v.odpovedi||{})[k])){BINIV.delete(v.id);MMDB.vyzvaZavri(v.id).catch(()=>{})}})}
async function bojIniVyzva(){const s=BOJ.s||{},komu=[...new Set((s.hraci||[]).map(h=>bojKartaH(h)).filter(Boolean).map(K=>K.id))];if(!komu.length){mmHlasG("V boji nejsou postavy s kartou.",3000);return}
  if(!window.MMDB){mmHlasG("Výzvy fungují jen na webu s databází.",3500);return}
  try{const id=await MMDB.vyzva({typ:"ini",komu});BINIV.add(+id);await vyzvyNacti();mmHlasG("Hráčům vyskočila výzva k iniciativě – hody se zapíšou samy.",4500)}catch(e){mmHlasG(e.message||String(e),5000)}}
/* začátek tahu: připomínky z boje i z karty */
function bojPripKarta(s,h,K){const r=bojPripominky(s,h).filter(x=>!/^Reakce je k dispozici/.test(x)),U=kUc(K),P=kPri(K),sl=kSloty(K);
  if(U.length)r.push(`Trvá: ${U.map(x=>x.n+(x.kon?" ◎":"")).join(", ")}.`);if(P.length)r.push(`Zapnuto: ${P.join(", ")}.`);
  if(sl.length)r.push(`Sloty: ${sl.map(q=>`${q.st}. st. ${q.max-q.u}/${q.max}`).join(", ")}.`);
  if((h.stav||[]).includes("sražen"))r.push("Vstát stojí polovinu pohybu.");return r}
/* vypravěč: přehled družiny v jednom pruhu */
function bojDruzPruh(s){const H=(s.hraci||[]).filter(h=>bojKartaH(h));if(!H.length)return "";
  return `<div class="bdpruh" aria-label="Přehled družiny">${H.map(h=>{const K=bojKartaH(h),mx=kHPmax(K),c=bojHpPC(h,K),ks=kartaStav(K.id),rk=!!(s.reak||{})[h.id];return `<span class="bdp${c<=0?" bhp0":c<=mx/2?" bhp2":""}" ${btip(`${h.n}: AC ${kAC(K)+(+h.kryt||0)}, životy ${c}/${mx}${ks.thp?` +${ks.thp}`:""}, pasivní Vnímání ${kPas(K,"vnimani")}${kKonDrzi(K)?", soustředí se":""}${rk?", reakce použita":""}`)}>${bojMedH(h,"bmini")}<b>${besc(h.n)}</b><small>AC</small>${kAC(K)+(+h.kryt||0)}<small>HP</small>${c}${ks.thp?`<i>+${ks.thp}</i>`:""}<small>👁</small>${kPas(K,"vnimani")}${kKonDrzi(K)?`<span ${btip("Soustředění")}>◎</span>`:""}${rk?`<s ${btip("Reakce použita")}>R</s>`:""}</span>`}).join("")}</div>`}
/* po boji: výzva k odpočinku */
async function bojOdpVyzva(){const komu=[...new Set(((BOJ.s||{}).hraci||[]).map(h=>bojKartaH(h)).filter(Boolean).map(K=>K.id))];if(!komu.length||!window.MMDB)return;try{await MMDB.vyzva({typ:"odp",komu});await vyzvyNacti()}catch(e){}}
/* skupinové ověření jedním klepnutím */
async function vyzvaRychle(d){if(!window.MMDB){mmHlasG("Výzvy fungují jen na webu s databází.",3500);return}const komu=KARTY.filter(k=>!k.test||KHRAC[k.id]).map(k=>k.id);const o={komu:komu.length?komu:KARTY.map(k=>k.id)};
  if(/^(STR|AGI|CON|INT|WIS|CHA)$/.test(d)){o.typ="zach";o.ab=d}else{o.typ="over";o.dov=d;o.ab=KDOVAB[d]||"WIS"}
  try{await MMDB.vyzva(o);await vyzvyNacti();mmHlasG(`Všichni: ${o.typ==="zach"?"záchrana "+d:d} – hráčům vyskočilo na telefonu.`,3500);hraPrekresli()}catch(e){mmHlasG(e.message||String(e),5000)}}
document.addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s);
  const r=T("[data-vyzrychle]");if(r){vyzvaRychle(r.dataset.vyzrychle);return}
  if(T("[data-binivyz]")){bojIniVyzva();return}});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("[data-bpcauto]")){bojPcAuto.set(t.checked);renderBoj()}});

/* uložení vlastností zbraně (stav karty zbrVl) */
document.addEventListener("submit",async e=>{const f=e.target.closest&&e.target.closest("[data-bdmzvf]");if(!f)return;e.preventDefault();const K=kvK(f);if(!K||!kMuze(K))return;
  const w=f.dataset.w,vl=[...f.querySelectorAll("[name=vl]:checked")].map(x=>x.value),t=[...f.querySelectorAll("[name=t]:checked")].map(x=>x.value);
  if(vl.includes("Šikovná")&&t.length<2){mmHlasG("Šikovná zbraň potřebuje aspoň dva typy zranění.",3500);return}
  const Z=Object.assign({},kartaStav(K.id).zbrVl||{});Z[w]=Object.assign({vl},vl.includes("Šikovná")?{t}:{});BDM.sheet=null;
  await kartaStavZmen(K.id,{zbrVl:Z},`${K.n}: ${w} – vlastnosti ${vl.join(", ")||"žádné"}.`)});
document.addEventListener("click",async e=>{const b=e.target.closest&&e.target.closest("[data-bdmzvx]");if(!b)return;const K=kvK(b);if(!K||!kMuze(K))return;
  const Z=Object.assign({},kartaStav(K.id).zbrVl||{});delete Z[b.dataset.bdmzvx];BDM.sheet=null;await kartaStavZmen(K.id,{zbrVl:Object.keys(Z).length?Z:null},`${K.n}: ${b.dataset.bdmzvx} – vlastnosti podle názvu zbraně.`)});

/* obětování zbroje či štítu při kritickém zásahu (Artikule › Zbroj): kritický zásah se změní v běžný – vrátí se rozdíl zranění (e.ob) */
async function kObetujZbroj(K,h,e,vrat){const Z=kZbrU(K),z=Z&&(Z.z&&Z.z.u<Z.z.max?Z.z:Z.s&&Z.s.u<Z.s.max?Z.s:null);if(!z)return false;
  if(await kOdklad(`obětovat ${z.k==="Štít"?"štít":z.k.toLowerCase()+" zbroj"}`,()=>true)===false)return false;
  if(e&&+e.ob>0&&vrat)await vrat(+e.ob,"obětování zbroje");
  const S=kartaStav(K.id),U=Object.assign({},S.zbrU||{}),ac0=kAC(K);U[z.k]=(+U[z.k]||0)+1;await kartaStavZmen(K.id,{zbrU:U},null);
  const txt=`${z.k==="Štít"?"štít":z.k.toLowerCase()+" zbroj"} obětována – kritický zásah se mění v běžný${e&&+e.ob>0?`, vráceno ${e.ob} HP`:" (kostky zranění jen jednou)"}, hod na kritické zranění odpadá${kAC(K)!==ac0?`; AC ${ac0} → ${kAC(K)}`:""}`;
  kHodZapis({k:K.id,kdo:K.n,co:"Obětování zbroje",txt});if(GMV&&h)bojLog(h.id,{n:"Obětování zbroje",ai:null,ci:h.id,zt:txt},h.n);mmHlasG(`${K.n}: ${txt}.`,6000);return true}
