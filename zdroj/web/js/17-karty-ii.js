/* ===== Karta postavy II (2026-10-16): Discord, texty rysů jen pro vlastníka, kouzla se sloty a zraněním, akce podle času,
   stavy mimo boj, AC s efekty, střelivo, příprava kouzel, společníci, pokladna družiny, tisk a export, doplňky hráče ===== */
/* ---- Discord: přihlášený účet a jeho postava ---- */
const DCU={jmeno:"",ok:false};
async function jaDiscordInit(){if(!window.MMDB||!MMDB.hracPrihlasen||!MMDB.hracPrihlasen())return;
  try{const [j,u]=await Promise.all([MMDB.ja(),MMDB.hracUzivatel().catch(()=>null)]);DCU.ok=true;DCU.jmeno=(u&&((u.user_metadata||{}).full_name||(u.user_metadata||{}).name||(u.user_metadata||{}).custom_claims&&u.user_metadata.custom_claims.global_name))||DCU.jmeno||"hráč";
    if(j&&j.karta){JA.set({k:j.karta,n:(KARTBY[j.karta]||{}).n||j.karta,d:1});bojJa.set((KARTBY[j.karta]||{}).n||"")}else{const o=JA.get();if(o&&o.d)JA.set(null)}
    if(curView==="hra"||curView==="karty")kartyPrekresli()}catch(e){DCU.ok=false}}
async function jaZvol(kid){if(!confirm("Volba postavy je trvalá – změnit ji pak může jen vypravěč. Hrát za tuto postavu?"))return;
  try{await MMDB.jaKarta(kid,DCU.jmeno);JA.set({k:kid,n:(KARTBY[kid]||{}).n||kid,d:1});KZAM.add(kid);await kartyNacti();mmHlasG("Postava zvolena.",3000);hraPoll(true);route()}catch(e){mmHlasG(e.message||String(e),6000)}}
const jaDiscordBtn=()=>window.MMDB&&MMDB.discordLogin?`<p><button type="button" class="gbtn ddisc" data-discord>Přihlásit přes Discord</button></p>`:"";
/* volné karty: i zkušební (na nich si hráč může přihlášení vyzkoušet; vypravěč je pak uvolní na stránce Hra) */
function jaBezKartyHtml(){const volne=KARTY.filter(k=>!KZAM.has(k.id)).sort((a,b)=>(!!a.test-!!b.test)||String(a.n).localeCompare(String(b.n),"cs"));
  return `<section><h3 class="uvh2">Vítej, ${besc(DCU.jmeno||"hráči")}</h3><p>Nahraj list své postavy z D&amp;D Beyond (postava → <i>Export to PDF</i>). Karta se vytvoří a zůstane tvoje.</p>
    <label class="gbtn"><input type="file" accept="application/pdf,.pdf" data-kimphra hidden>Nahrát PDF z D&amp;D Beyond…</label>${KIMP?kImpNahled(KIMP,true):""}
    ${volne.length?`<details class="bjapd"${KIMP?"":" open"}><summary>Nebo zvol kartu, kterou už nahrál vypravěč</summary><ul class="kfeat">${volne.map(k=>`<li><b>${besc(k.n)}</b> <small>${besc(k.povolani||"")}${k.test?" · zkušební":""}</small> <button type="button" class="gbtn ghost" data-jazvol="${besc(k.id)}">Hrát za tuto postavu</button></li>`).join("")}</ul></details>`:""}
    <p class="bojbtn"><button type="button" class="gbtn ghost" data-discordx>Odhlásit Discord</button></p></section>`}
/* ---- texty rysů (soukromé) a rejstřík rysů SRD ---- */
const KTX={},KTXP={};let SRDRY=null;
let SRDRYP=null;const srdRysy=()=>SRDRY?Promise.resolve(SRDRY):(SRDRYP=SRDRYP||fetch("art/srd-rysy.json").then(r=>r.json()).then(d=>SRDRY=d).catch(()=>SRDRY={}));
function kTexty(K){if(KTX[K.id]!==undefined)return KTX[K.id];if(KTXP[K.id])return null;
  KTXP[K.id]=(async()=>{let t=null;if(window.MMDB&&MMDB.kartaTexty){try{t=await MMDB.kartaTexty(K.id)}catch(e){}}else{try{t=(JSON.parse(localStorage.getItem("mm-karty-texty")||"{}")||{})[K.id]||null}catch(e){}}
    KTX[K.id]=t||{};kartyPrekresli()})();return null}
async function kTextyUloz(id,t){if(!t||!Object.keys(t).length)return;KTX[id]=t;
  if(window.MMDB&&MMDB.kartaTextyUloz){try{await MMDB.kartaTextyUloz(id,t)}catch(e){mmHlasG("Texty schopností se neuložily: "+e.message,5000)}}
  else{try{const o=JSON.parse(localStorage.getItem("mm-karty-texty")||"{}")||{};o[id]=t;localStorage.setItem("mm-karty-texty",JSON.stringify(o))}catch(e){}}}
const kRysSrd=n=>{if(!SRDRY)return null;const c=String(n||"").replace(/[’]/g,"'").replace(/\s*\(.*\)$/,"").trim();return SRDRY[c]||SRDRY[c.replace(/'/g,"’")]||null};
function kRysPopis(K,n){const T=KTX[K.id]||{},t=T[n],s=kRysSrd(n);
  return `<div data-kid="${besc(K.id)}"><h3>${besc(n)}</h3>${t?`<div class="kron">${kTxtKostky(K,t,n)}</div><p class="rsmall">Text z tvého listu D&amp;D Beyond – vidíš ho jen ty a vypravěč.</p>`:`<p class="rsmall">${kMuze(K)?"Popis z PDF tu zatím není – nahraj list znovu.":"Popis vidí jen hráč této postavy a vypravěč."}</p>`}${s?`<p><a class="gbtn ghost" href="#pravidla/${s[0]}/${s[1]}" data-mmpopx>Pravidla SRD česky →</a></p>`:MIMO?mimoRysHtml(mimoNajdi(kCtx(K),n),kCtx(K)):""}</div>`}
/* ---- čas aktivace a seznamy akcí ---- */
const KCAS={A:"Akce",BA:"Bonusové akce",R:"Reakce",X:"Ostatní"};
const kCasKouzla=x=>{const d=kSp(x.n);const c=(d&&d.ct)||x.cas||"";return /^Bonus|^1BA|bonus/i.test(c)?"BA":/^Reakc|^1R|reaction/i.test(c)?"R":/^Akce|^1A$|action/i.test(c)?"A":"X"};
/* mistrovství zbraní (Vex, Nick…) nejsou akce – patří k vlastnostem zbraně */
const KMAST=/^(cleave|graze|nick|push|sap|slow|topple|vex)\b\s*(\(|$)/i;
function kAkceG(K,bezUt,o){o=o||{};const D=kDopl(K),sez=o.bezKouzel?[]:kSeznam(K),sl=kSloty(K),U=kartaStav(K.id).zdr||{};const G={A:[],BA:[],R:[],X:[]};
  if(!bezUt)kUtoky(K).forEach((a,i)=>G[a.cas||"A"].push(`<li><b>${besc(a.n)}</b>${a.pocet>1?` <small>${a.pocet}×</small>`:""} <button type="button" class="gbtn ghost" data-khod="ut:${i}">Útok ${bsg(+a.b||0)}</button>${a.z?`<button type="button" class="gbtn ghost" data-kzr="${i}">${besc(a.z)} ${besc(BZRT[a.t]||a.t||"")}</button>`:""}${kMunTxt(K,a)}</li>`));
  sez.forEach((x,i)=>{if(!kMaSl(K,x))return;G[kCasKouzla(x)].push(`<li><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button> ${kSpSt(x.st)}${kSpZn(x)}${kPzZn(x)} ${kSesHtml(K,x,i)}</li>`)});
  [...((K.rysy2||[]).filter(r=>(r.cas||r.max)&&!KMAST.test(String(r.n||"").trim()))),...(D.rysy||[])].forEach(r=>{const u=Math.min(r.max||0,+(U[r.n]||0));G[r.cas||"X"].push(`<li><button type="button" class="kspn" data-krys="${besc(r.n)}">${besc(r.n)}</button>${r.max?` <span class="bzd">${[...Array(r.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(r.n)}" data-j="${j}" aria-label="${besc(r.n)} ${j+1}"></button>`).join("")}</span>`:""}</li>`)});
  kTech(K).forEach(id=>{const t=STBY[id];G[/reakce/.test(t.c)?"R":/bonusov/.test(t.c)?"BA":"X"].push(`<li><button type="button" class="kspn" data-ktech="${t.id}">${besc(t.n)}</button> <small>${besc(t.c)}</small></li>`)});
  G.R.push(`<li><b>Příležitostný útok</b> <small>když nepřítel opouští tvůj dosah</small></li>`);
  return G}
function kAkceHtml(K,bezUt){const G=kAkceG(K,bezUt);
  return `<div class="kakcegrid">${["A","BA","R","X"].map(k=>`<section><h3 class="uvh2">${KCAS[k]}</h3>${G[k].length?`<ul class="kakl">${G[k].join("")}</ul>`:`<p class="rsmall">–</p>`}${k==="A"?`<details class="bjapd"><summary>Běžné akce</summary><dl class="kakce">${BAKCE.map(a=>`<dt>${a[0]} <small>${a[1]}</small></dt><dd>${besc(a[2])}</dd>`).join("")}</dl></details>`:""}</section>`).join("")}</div>`}
/* ---- útoky a doplňky hráče ---- */
const kDopl=K=>kartaStav(K.id).dopl||{};
/* ---- kouzla: seznam (PDF + připravená − odebraná), sesílání se zvoleným slotem, zranění a léčení se škálováním ---- */
function kSeznam(K){const S=kartaStav(K.id),kx=new Set(S.kpx||[]),zak=((K.kouzla||{}).seznam||[]).filter(x=>!kx.has(x.n)||x.vzdy);
  (S.kpn||[]).forEach(n=>{if(zak.some(x=>x.n===n))return;const d=kSp(n);zak.push(d?{n:d.en,st:d.l,kon:!!d.ko,cas:d.ct,dosah:d.r,trvani:d.d,nove:1}:{n,st:1,nove:1})});return zak.concat(kPzKouzla(K))}
/* ---- kouzla z předmětů (2026-10-17): hůlky a hole SRD 5.2.1. Seslání spotřebuje náboje předmětu (inv[].nab), ne slot.
   [kouzlo, cena v nábojích, nejvýš nábojů (každý navíc = o stupeň výš), pevný stupeň]; dc = pevný SO předmětu, jinak SO sesilatele.
   Předmět s připoutáním (Attunement) musí být připoutaný. Kouzla z předmětů jsou na konci seznamu, indexy kouzel postavy se nemění. */
const KPZK={
  "Wand of Fireballs":{dc:15,k:[["Fireball",1,3]]},"Wand of Lightning Bolts":{dc:15,k:[["Lightning Bolt",1,3]]},
  "Wand of Magic Missiles":{k:[["Magic Missile",1,3]]},"Wand of Web":{dc:13,k:[["Web",1]]},"Wand of Polymorph":{dc:15,k:[["Polymorph",1]]},
  "Wand of Binding":{dc:17,k:[["Hold Monster",5],["Hold Person",2]]},"Wand of Fear":{dc:15,k:[["Command",1],["Fear",3]]},
  "Wand of Magic Detection":{k:[["Detect Magic",1]]},
  "Staff of Fire":{k:[["Burning Hands",1],["Fireball",3],["Wall of Fire",4]]},
  "Staff of Frost":{k:[["Cone of Cold",5],["Fog Cloud",1],["Ice Storm",4],["Wall of Ice",4]]},
  "Staff of Healing":{k:[["Cure Wounds",1,4],["Lesser Restoration",2],["Mass Cure Wounds",5]]},
  "Staff of Charming":{k:[["Charm Person",1],["Command",1],["Comprehend Languages",1]]},
  "Staff of Swarming Insects":{k:[["Giant Insect",4],["Insect Plague",5]]},
  "Staff of Power":{k:[["Cone of Cold",5],["Fireball",5,0,5],["Globe of Invulnerability",6],["Hold Monster",5],["Levitate",2],["Lightning Bolt",5,0,5],["Magic Missile",1],["Ray of Enfeeblement",1],["Wall of Force",5]]},
  "Staff of the Magi":{k:[["Arcane Lock",0],["Conjure Elemental",7],["Detect Magic",0],["Dispel Magic",3],["Enlarge/Reduce",0],["Fireball",7,0,7],["Flaming Sphere",2],["Ice Storm",4],["Invisibility",2],["Knock",2],["Light",0],["Lightning Bolt",7,0,7],["Mage Hand",0],["Passwall",5],["Plane Shift",7],["Protection from Evil and Good",0],["Telekinesis",5],["Wall of Fire",4],["Web",2]]},
  "Staff of the Woodlands":{k:[["Animal Friendship",1],["Awaken",5],["Barkskin",2],["Locate Animals or Plants",2],["Pass without Trace",2],["Speak with Animals",1],["Speak with Plants",3],["Wall of Thorns",6]]}};
/* svitky (Spell Scroll): SO a útok podle stupně kouzla; kouzlo musí být na seznamu povolání; vyšší stupeň, než postava sesílá = ověření SO 10 + stupeň */
const KSVIT=[[13,5],[13,5],[13,5],[15,7],[15,7],[17,9],[17,9],[18,10],[18,10],[19,11]];
const KTRCZ={Wizard:"Kouzelník",Sorcerer:"Čaroděj",Druid:"Druid",Bard:"Bard",Cleric:"Klerik",Warlock:"Černokněžník",Ranger:"Hraničář",Paladin:"Paladin"};
/* na seznamu kouzel: povolání postavy (Eldritch Knight a Arcane Trickster mají seznam Wizarda), nebo kouzlo, které postava z listu zná */
const kSvitNa=(K,d)=>{const L=new Set(kTridy(K).map(t=>KTRCZ[t.n]).filter(Boolean));if(/Eldritch Knight|Arcane Trickster/i.test(String(K.povolani||"")+JSON.stringify(K.rysy||[]).slice(0,4000)))L.add("Kouzelník");
  return (d.p||[]).some(c=>L.has(c))||((K.kouzla||{}).seznam||[]).some(s=>s.n===d.en)};
function kSvitek(K,it,ii){const m=String(it.n||"").match(/^Spell Scroll\s*[(:–-]\s*([^)]+?)\)?\s*$/i)||String(it.n||"").match(/^(?:Spell )?Scroll of (.+?)\s*(?:\(\d+\))?$/i);if(!m)return null;
  const d=kSp(m[1].trim());if(!d)return null;const q=it.q==null?1:+it.q,l=+d.l||0,T=KSVIT[l]||KSVIT[0],na=kSvitNa(K,d);if(!(q>0))return null;
  return {n:d.en,st:l,kon:!!d.ko,cas:d.ct,dosah:d.r,trvani:d.d,pz:{i:ii,p:it.n,c:1,mx:1,fl:l,dc:T[0],ut:T[1],sv:1,na,max:q,zb:na?q:0}}}
function kPzKouzla(K){if(typeof kSp!=="function"||!KSPD)return [];const R=[];(kartaStav(K.id).inv||K.vybaveni||[]).forEach((it,ii)=>{const p=kPred(it),T=p&&KPZK[p.en];
  if(!T){const v=kSvitek(K,it,ii);if(v)R.push(v);return}
  if(!T||(it.q!=null&&!(+it.q>0))||(p.pr&&!it.pripoutano))return;const N=kNab(it),zb=N?N.max-Math.min(N.max,+it.nab||0):0;
  T.k.forEach(([sn,c,mx,fl])=>{const d=kSp(sn);if(!d)return;R.push({n:d.en,st:fl||d.l,kon:!!d.ko,cas:d.ct,dosah:d.r,trvani:d.d,pz:{i:ii,p:p.en,c,mx:mx||c,fl:fl||0,dc:T.dc||0,max:N?N.max:0,zb}})})});return R}
/* volné „sloty“ kouzla: u kouzla z předmětu volby počtu nábojů (každá se stupněm, který dá) */
function kSlX(K,x){if(!x.pz)return kSloty(K).filter(q=>q.st>=x.st&&q.u<q.max);const P=x.pz,R=[];
  for(let c=P.c;c<=P.mx&&c<=P.zb;c++)R.push({k:"pz"+c,st:P.fl||(x.st+(c-P.c)),max:P.zb,u:0,nab:c,lab:P.sv?"svitek":`${c} ${c===1?"náboj":c>1&&c<5?"náboje":"nábojů"}`});
  if(P.c===0&&!R.length)R.push({k:"pz0",st:x.st,max:0,u:0,nab:0,lab:"bez náboje"});return R}
const kMaSl=(K,x)=>x.pz?kSlX(K,x).length>0:(x.st===0||kSloty(K).some(q=>q.st>=x.st&&q.u<q.max));
const kPzZn=x=>x.pz&&x.pz.sv?` <small class="kpzz kpzsv" ${btip(x.pz.na?`Svitek: seslání ho spotřebuje · SO ${x.pz.dc}, útok +${x.pz.ut}${x.pz.max>1?` · ve vybavení ${x.pz.max}`:""}`:"Kouzlo není na seznamu tvého povolání – svitek je nesrozumitelný")}>📜 svitek${x.pz.max>1?` ×${x.pz.max}`:""}${x.pz.na?"":" ✗"}</small>`:x.pz?` <small class="kpzz" ${btip(`Z předmětu ${x.pz.p}: ${x.pz.c===x.pz.mx?`${x.pz.c} ${x.pz.c===1?"náboj":"náboje"}`:`${x.pz.c}–${x.pz.mx} nábojů`}${x.pz.dc?`, SO ${x.pz.dc}`:", tvůj SO"} · zbývá ${x.pz.zb}/${x.pz.max}`)}>⟡ ${besc(x.pz.p.replace(/^(Wand|Staff) of (the )?/,""))} ${x.pz.zb}/${x.pz.max}</small>`:"";
const kSpMod=K=>kSpUt(K)-kPB(K);
function kSpUcinek(K,x,lvl){const d=kSp(x.n);if(!d)return null;const t=String(d.t||""),TY="Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder";
  let m=t.match(new RegExp(`(\\d+d\\d+(?:\\s*\\+\\s*\\d+)?)\\s+(?:[A-Za-zÁ-ž]+\\s+\\()?(${TY})`)),o=null;
  if(m)o={k:"z",x:m[1].replace(/\s/g,""),t:m[2]};else{m=t.match(new RegExp(`(${TY})\\)?\\s+zranění\\s+rovné\\s+(\\d+d\\d+)`));if(m)o={k:"z",x:m[2],t:m[1]}}
  const hm=t.match(/HP ve výši (\d+d\d+)/);if(!o&&hm)o={k:"l",x:hm[1]};if(!o)return null;
  const zbytek=t.slice(t.indexOf(o.x.split("+")[0])).slice(0,140);if(/modifikátor(?:u)? (?:tvé )?sesílací|tvůj modifikátor sesílací/.test(zbytek))o.mod=kSpMod(K);
  const v=String(d.v||""),up=v.match(/o (\d+)d(\d+) za každou úroveň slotu kouzla nad (\d+)/);
  if(up&&lvl>+up[3]){const [n,s]=o.x.split("+")[0].split("d").map(Number);if(+up[2]===s)o.x=o.x.replace(/^\d+d\d+/,`${n+(lvl-+up[3])*+up[1]}d${s}`);else o.x+=`+${(lvl-+up[3])*+up[1]}d${up[2]}`}
  if(!d.l&&/Zesílení triku/.test(t)){const ul=kLv(K),tier=ul>=17?4:ul>=11?3:ul>=5?2:1;if(tier>1){if(/paprsk|šip/i.test(t.slice(t.indexOf("Zesílení triku"))))o.pocet=tier;else o.x=o.x.replace(/^(\d+)d/,(q,n)=>`${n*tier}d`)}}
  const ms=v.match(/o jednu šipku|jeden paprsek navíc|o jeden paprsek/);if(ms&&d.l&&lvl>d.l)o.pocet=(/šip/.test(v)?3:/paprs/.test(t)?3:1)+(lvl-d.l);
  const zs=t.match(/(STR|AGI|CON|INT|WIS|CHA) záchrann/);if(zs)o.zach=zs[1];o.utok=/útok kouzlem/i.test(t);o.pol=/při úspěchu poloviční/i.test(t);return o}
/* sesílání na vyšším stupni (upcasting): volba slotu kolečky se stupněm; co vyšší stupeň přidá, z popisu kouzla SRD */
function kSpVyssi(K,x,lvl){const d=typeof kSp==="function"?kSp(x.n):null,v=String((d&&d.v)||""),n=lvl-x.st;if(!v||n<=0)return "";const o=[];let m;
  if((m=v.match(/o (\d+) za každou úroveň slotu kouzla nad (\d+)/))&&!/o \d+d\d+ za/.test(v))o.push(`${/dočasn/i.test(v)?"dočasné HP":""}${/zranění/i.test(v)&&/dočasn/i.test(v)?" i zranění":/zranění/i.test(v)?"zranění":""} +${n*+m[1]}`.trim());
  if((m=v.match(/získáš (\d+) dalších dočasných HP/)))o.push(`dočasné HP +${n*+m[1]}`);
  if((m=v.match(/HP každého cíle se zvýší o dalších (\d+)/)))o.push(`HP cílů +${n*+m[1]}`);
  if(/(zacílit|zaměřit|ovlivnit|zvolit|zasáhnout)[^.]*?(jednoho|jedno|jednu|jednoho dalšího|o \d+)[^.]*?(navíc|víc|dalšího)|jednoho dalšího tvora/.test(v)){const k=+(v.match(/o (\d+) tvor/)||[])[1]||1;o.push(`+${n*k} ${n*k===1?"cíl":n*k<5?"cíle":"cílů"}`)}
  if((m=v.match(/o (\d+) projektil/)))o.push(`+${n*+m[1]} projektily`);if(/kostku životů víc/.test(v))o.push(`+${n} kostka životů`);
  if(/Concentration trvat déle|Doba trvání kouzla se zvýší/.test(v))o.push("delší trvání");if(/statblok|statistikách tvora/i.test(v))o.push(`statblok ${lvl}. stupně`);
  return o.join(", ")}
function kSesHtml(K,x,i){const d=(x.st>0||x.pz)&&typeof kSp==="function"?kSp(x.n):null,sl=kSlX(K,x),ch=d&&!x.pz&&!String(d.v||"").trim()?null:KSLV[K.id+":"+i],uc=x.st>0||x.pz?(sl.find(q=>q.k===ch)||sl[0]||null):null,lvl=uc?uc.st:x.st;
  const vt=d&&d.v?` Na vyšším stupni: ${d.v}`:"",up=uc?kSpVyssi(K,x,lvl):"";
  const bezUp=x.pz?sl.length<2:!!d&&!String(d.v||"").trim()&&x.st<9; /* kouzlo bez „Na vyšším stupni“ (Shield…): slot se vezme nejnižší volný, bez volby */
  const sel=x.st>0&&sl.length&&!bezUp?`<span class="kslv" role="group" aria-label="Stupeň seslání ${besc(x.n)}">${sl.map(q=>`<button type="button" class="kslvb${q===uc?" on":""}${q.pakt?" kslvp":""}" data-kslvb="${i}" data-k="${q.k}" aria-pressed="${q===uc}" ${btip(`${q.lab?`Seslat za ${q.lab} (${q.st}. stupeň)`:`Seslat se slotem ${q.st}. stupně${q.pakt?" (pakt)":""}`} – zbývá ${q.max-q.u}${q.st>x.st?` · vyšší stupeň${kSpVyssi(K,x,q.st)?": "+kSpVyssi(K,x,q.st):""}`:""}.${vt}`)}>${q.lab?q.nab+"⟡":KRIM[q.st]}</button>`).join("")}</span>${up?`<small class="kupc">${besc(up)}</small>`:""}`:"";
  const E=kSpUcinek(K,x,lvl),kz=K.kouzla||{};
  return `${sel}${x.st>0||x.kon||x.zach||x.pz?`<button type="button" class="gbtn ghost" data-kses="${i}">Seslat</button>`:""}${x.utok!=null||(E&&E.utok)?`<button type="button" class="gbtn ghost" data-khod="ks:${i}">Útok ${bsg(kSpU1(K,x))}</button>`:""}${E&&E.k==="l"?(KMASS[x.n]?kCileChips(K,x,i):kCilHtml(K,i)):""}${E?`<button type="button" class="gbtn ghost" data-kspz="${i}" ${btip("Hod se počítá se stupněm vybraného slotu")}>${E.k==="l"?"Léčení":"Zranění"} ${besc(E.x)}${E.mod?bsg(E.mod):""}${E.t?" "+besc(BZRT[E.t]||E.t):""}${E.pocet>1?` ×${E.pocet}`:""}</button>${E.zach?`<small> · záchrana ${E.zach} SO ${kSpDC(K,x)||"?"}${E.pol?", úspěch = polovina":""}</small>`:""}`:""}`}
/* ---- kouzla na spojence a léčení víc cílů (2026-10-17) ----
   Bless, Guidance a Shield of Faith se sešlou na vybrané postavy: u sesilatele vznikne soustředěný účinek „Bless ⇒ Adam“,
   karta cíle si ho přečte (kBufy) a se ztrátou soustředění sesilatele zmizí sám. Hromadné léčení: jeden hod pro všechny cíle. */
const KBUF={"Bless":{max:3,plus:1},"Guidance":{max:1},"Shield of Faith":{max:1}};
const KMASS={"Mass Healing Word":6,"Mass Cure Wounds":6,"Prayer of Healing":5};
const KCILM={};
const kCilM=(K,i)=>KCILM[K.id+":"+i]||(KCILM[K.id+":"+i]=new Set());
function kSesLvl(K,x,i){if(!(x.st>0||x.pz))return x.st;const sl=kSlX(K,x),q=sl.find(z=>z.k===KSLV[K.id+":"+i])||sl[0];return q?q.st:x.st}
const kCilMax=(K,x,i)=>{if(KMASS[x.n])return KMASS[x.n];const B=KBUF[x.n];if(!B)return 0;const l=kSesLvl(K,x,i);return B.max+(B.plus&&l>x.st?(l-x.st)*B.plus:0)};
function kCileChips(K,x,i){const S=kCilM(K,i),mx=kCilMax(K,x,i),L=[K,...(KARTY||[]).filter(k=>k.id!==K.id&&!k.test)];
  return `<span class="kcilm" role="group" aria-label="Na koho (nejvýš ${mx})">${L.map(k=>`<button type="button" class="kcilmb" data-kcilm="${i}|${besc(k.id)}" aria-pressed="${S.has(k.id)}" ${btip(k===K?"Na sebe":k.n)}>${k===K?"sebe":besc(k.n)}</button>`).join("")}<small>${S.size||"bez výběru = sebe"}${S.size?`/${mx}`:""}</small></span>`}
const kCile=(K,i)=>{const S=[...kCilM(K,i)].filter(id=>KARTBY[id]);return S.length?S.map(id=>KARTBY[id]):[K]};
/* účinky, které na postavě drží kouzla (její i ostatních postav) */
function kBufy(K){const t=kTed(),R=[];(KARTY||[]).forEach(k=>{kUc(k).forEach(u=>{const m=String(u.n||"").match(/^(.+?) ⇒ (.+)$/);if(m&&m[2]===K.n&&!(u.do!=null&&t!=null&&u.do<=t))R.push({n:m[1],od:k.n})})});return R}
/* ---- Seslat na koho (2026-10-17 b): kouzlo s dosahem (ne „Sebe“) se před sesláním zeptá na cíle – postavy družiny
   a v boji nepřátelé. Spojenci dostanou účinek „Kouzlo ⇒ Jméno“ (drží ho sesilatel, se soustředěním zmizí), léčivé kouzlo
   rovnou vyléčí vybrané. Nepřátelé v boji: hráč kouzlo se záchranou či útokem dohodí v listu útoku (vyhodnotí vypravěč),
   vypravěč nepříteli hodí záchranu sám a uloží stav (Hold Person → Ochromen) nebo značku účinku. */
let KSDLG=null;
const kSesCil=x=>{const d=typeof kSp==="function"?kSp(x.n):null,r=String((d&&d.r)||x.dosah||"").trim();return !!r&&!/^(sebe|self)\b/i.test(r)};
/* počet cílů podle stupně: kouzlo, které na vyšším stupni zasáhne další tvory (Hold Person, Charm Person…), má na základním stupni 1 cíl */
const kCilUp=(x,lvl)=>{const d=typeof kSp==="function"?kSp(x.n):null,v=String((d&&d.v)||"");if(!/(zacílit|zaměřit|ovlivnit|zvolit|zasáhnout)[^.]*?(jednoho|jedno|jednu|jednoho dalšího|o \d+)[^.]*?(navíc|víc|dalšího)|jednoho dalšího tvora/.test(v))return 0;
  const k=+(v.match(/o (\d+) tvor/)||[])[1]||1;return 1+Math.max(0,(+lvl||0)-(+x.st||0))*k};
const kSesMax=(K,x,i)=>{const m=kCilMax(K,x,i);if(m)return m;const up=kCilUp(x,kSesLvl(K,x,i));if(up)return up;const E=kSpUcinek(K,x,kSesLvl(K,x,i));return E&&E.k==="l"?1:0};
function kSesNpc(){const s=BOJ.s||{};if(!s.aktivni)return [];return (s.npc||[]).filter(o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0))}
function kSesDlgHtml(){const {K,x,i,c}=KSDLG,lvl=kSesLvl(K,x,i),d=kSp(x.n)||{},mx=kSesMax(K,x,i),E=kSpUcinek(K,x,lvl),N=E&&E.k==="l"?[]:kSesNpc();
  const L=[K,...(KARTY||[]).filter(k=>k.id!==K.id&&!k.test)],ch=(v,l,t)=>`<button type="button" class="kcilmb" data-ksdc="${besc(v)}" aria-pressed="${c.has(v)}" ${btip(t)}>${l}</button>`;
  return `<h3 class="uvh2">${besc(x.n)} <small>${lvl?lvl+". st.":"trik"}${x.pz?` · ${besc(x.pz.p)}`:""}</small></h3>
    <p class="rsmall">${besc([d.r||x.dosah,d.d||x.trvani,x.kon||d.ko?"soustředění":""].filter(Boolean).join(" · "))}${mx?` · nejvýš ${mx} ${mx===1?"cíl":mx<5?"cíle":"cílů"}`:""}</p>
    <h4 class="bsph">Družina</h4><div class="kcilm ksdl">${L.map(k=>ch("k:"+k.id,k===K?"sebe":besc(k.n),k===K?"Na sebe":k.n)).join("")}</div>
    ${N.length?`<h4 class="bsph">Nepřátelé</h4><div class="kcilm ksdl">${N.map(o=>ch("n:"+o.id,`${bojMedN(o,"bmini")}<span>${besc(o.n)}</span>`,o.n)).join("")}</div>`:""}
    <p class="ksdok"><button type="button" class="gbtn" data-ksdok>Seslat${c.size?` na ${c.size}`:""}</button> <button type="button" class="gbtn ghost" data-ksdok="bez" ${btip("Seslat bez výběru cíle (jen slot a soustředění)")}>bez cíle</button></p>`}
function kSesDlg(K,x,i){KSDLG={K,x,i:String(i),c:new Set()};const d=mmPop(`<div class="ksdlg">${kSesDlgHtml()}</div>`);d.classList.add("ksdpop")}
const kSesDlgKresli=()=>{const el=document.querySelector(".ksdpop .ksdlg");if(el&&KSDLG)el.innerHTML=kSesDlgHtml()};
async function kBufNa(K,x,C,kon){const d=kSp(x.n),h=d?kTrv(d.d):null,t=kTed(),pre=x.n+" ⇒ ";if(!h||!C.length)return;
  const L=kUc(K).filter(u=>!String(u.n||"").startsWith(pre));C.forEach(c=>{const o={n:(pre+c.n).slice(0,80)};if(kon)o.kon=true;o.h=Math.round(h*1000)/1000;if(t!=null)o.do=Math.round((t+h)*1000)/1000;L.push(o)});
  await kartaStavZmen(K.id,{uc:L.slice(-30)})}
async function kSesDlgOk(bez){const D=KSDLG;if(!D)return;KSDLG=null;mmPopX();const {K,x,i}=D,sel=bez?[]:[...D.c],s=BOJ.s||{};
  const C=sel.filter(v=>v.startsWith("k:")).map(v=>KARTBY[v.slice(2)]).filter(Boolean),N=sel.filter(v=>v.startsWith("n:")).map(v=>(s.npc||[]).find(o=>o.id===v.slice(2))).filter(Boolean);
  const lvl=kSesLvl(K,x,i),E=kSpUcinek(K,x,lvl),d=kSp(x.n)||{},kon=!!(x.kon||d.ko),me=(s.hraci||[]).find(h=>bojKartaH(h)===K);
  /* hráč v boji: kouzlo se záchranou nebo útokem na nepřátele dohodí list útoku (slot se odečte až odesláním) */
  if(N.length&&s.aktivni&&!GMV&&me&&typeof kSpBoj==="function"&&kSpBoj(K,x,lvl)){BDM.sheet={k:K.id,t:"utok",ks:+i};bojJaZvolKouzlo(+i);
    if(BJU.plos)BJU.cile=N.map(o=>o.id);else BJU.cil=N[0].id;if(curView==="boj")renderBoj();else location.hash="#boj";
    if(C.length)mmHlasG(`${x.n}: spojence k tomu nejde vybrat – kouzlo míří na nepřátele.`,4000);return}
  if(await kartaSeslat(K,x,KSLV[K.id+":"+i])===false)return;
  if(E&&E.k==="l"&&C.length){await kSpZraneni(K,x,lvl,false,{mass:C});return}
  const sp=KBUF[x.n]?C:C.filter(c=>c!==K);if(sp.length)await kBufNa(K,x,sp,kon);
  if(N.length&&s.aktivni&&GMV)kSesGmNpc(K,x,lvl,N,me);
  else if(N.length&&s.aktivni&&me&&typeof bojDB!=="undefined"&&bojDB&&bojDB.utok){if(await kOdklad(`${x.n} → ${N.map(o=>o.n).join(", ")}`,()=>true)===false)return;try{await bojDB.utok(me.id,{ci:N.map(o=>o.id).slice(0,12),cim:(BUEF+x.n).slice(0,60),hod:0});kHodZapis({k:K.id,kdo:K.n,co:`${x.n} na nepřátele`,txt:N.map(o=>o.n).join(", ")});mmHlasG(`${K.n}: ${x.n} na ${N.map(o=>o.n).join(", ")} – vypravěč zapíše značku.`,4500);return}catch(err){mmHlasG("Účinek se nepodařilo poslat vypravěči: "+(err.message||err),5000)}}
  else if(N.length)kHodZapis({k:K.id,kdo:K.n,co:`${x.n} na nepřátele`,txt:N.map(o=>o.n).join(", ")});
  const kdo=[...C.map(c=>c===K?"sebe":c.n),...N.map(o=>o.n)];if(kdo.length&&!(N.length&&s.aktivni))mmHlasG(`${K.n}: ${x.n} na ${kdo.join(", ")}.`,4500)}
/* vypravěč sešle za hráče kouzlo na nepřátele: záchrany a zranění (polovina, Resistance), útoky kouzlem proti AC, stav nebo značka účinku */
function kSesGmNpc(K,x,lvl,N,me){const s=BOJ.s,B=typeof kSpBoj==="function"?kSpBoj(K,x,lvl):null,cim=`${x.n}${x.st>0&&lvl>x.st?` (${lvl}. st.)`:""}`.slice(0,60),h=me&&me.id,dc=+kSpDC(K,x)||10;
  if(B&&B.zach){const r=B.x?bojJaSpDmg(B,false):{tot:0,txt:""};bojUtokProved(s,{h,ci:N.map(o=>o.id),cim,dmg:r.tot,t:B.t||"Force",plos:{ab:B.zach,dc,pol:!!B.pol}},null);
    kHodZapis({k:K.id,kdo:K.n,co:`${cim} na nepřátele`,tot:B.x?r.tot:undefined,txt:`${N.map(o=>o.n).join(", ")} · záchrana ${B.zach} SO ${dc}${B.x?` · zranění ${r.txt} ${BZRT[B.t]||B.t||""}${B.pol?", úspěch = polovina":""}`:""}`.slice(0,290)});return}
  if(B&&(B.utok||B.auto)){const U=kSpU1(K,x),L=[];for(let j=0;j<Math.max(1,B.pocet||1);j++){const c=N[j%N.length],d=B.auto?null:bK(20),krit=d===20,r=bojJaSpDmg(B,krit),hod=B.auto?99:d+U;
      bojUtokProved(BOJ.s,{h,ci:[c.id],cim,hod,d:d==null?undefined:d,dmg:r.tot,t:B.t||"Force"},null);L.push(`${c.n}: ${B.auto?"zásah":`${hod}${krit?" krit":d===1?" (1)":""}`}, ${r.tot}`)}
    kHodZapis({k:K.id,kdo:K.n,co:`${cim} na nepřátele`,txt:L.join(" · ").slice(0,290)});return}
  const M=[];bojZmen(z=>{N.forEach(o=>{const n=(z.npc||[]).find(q=>q.id===o.id);if(n&&bojEfZnac(z,n,x.n,{h}))M.push(n.n)})});
  kHodZapis({k:K.id,kdo:K.n,co:`${x.n} na nepřátele`,txt:(M.length?M.join(", "):N.map(o=>o.n).join(", ")+" · bez trvání, jen zápis").slice(0,290)});mmHlasG(`${K.n}: ${x.n} na ${N.map(o=>o.n).join(", ")}.`,4000)}
addEventListener("click",e=>{const T=s=>e.target.closest&&e.target.closest(s);if(!KSDLG||!T(".ksdpop"))return;
  const b=T("[data-ksdc]");if(b){const v=b.dataset.ksdc,c=KSDLG.c,{K,x,i}=KSDLG,mx=kSesMax(K,x,i);if(c.has(v))c.delete(v);else{if(mx===1)c.clear();if(!mx||c.size<mx)c.add(v);else mmHlasG(`${x.n}: nejvýš ${mx} ${mx<5?"cíle":"cílů"}.`,3000)}kSesDlgKresli();return}
  const ok=T("[data-ksdok]");if(ok){kSesDlgOk(ok.dataset.ksdok==="bez");return}});
/* léčení na kartu (2026-10-17): svou kartu (a kartu bez hesla) mění přímo, cizí přes mm_karta_lecit, který v boji stabilizuje umírajícího */
const KCIL={};
const kCilHtml=(K,i)=>{const L=(KARTY||[]).filter(k=>k.id!==K.id&&!k.test),v=KCIL[K.id+":"+i]||K.id;return `<select data-kcil="${i}" aria-label="Koho léčíš"><option value="${besc(K.id)}">sebe</option>${L.map(k=>`<option value="${besc(k.id)}"${v===k.id?" selected":""}>${besc(k.n)}</option>`).join("")}<option value="-"${v==="-"?" selected":""}>jen hod</option></select>`};
async function kLecKarta(K2,tot,od,co,vratit){if(!K2||!(tot>0))return;
  if(od&&K2.id!==od.id&&typeof navrhPotreba==="function"&&navrhPotreba()){await navrhPosli(od,Object.assign({typ:"lec",cil:K2.id,hp:Math.min(300,Math.round(tot)),co,popis:`${co||"léčení"} → ${K2.n} +${Math.round(tot)} HP`},vratit?{vratit}:{}));return}const S=kartaStav(K2.id),h0=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K2);
  if(kMuze(K2)){if(h0){bojPCZmena(h0.id,x=>bojLecPC(x,K2,tot),true);return}const o={hp:S.hp,thp:S.thp},m=bojLecPC(o,K2,tot);await kartaStavZmen(K2.id,{hp:o.hp!=null&&o.hp<kHPmax(K2)?o.hp:null},`${K2.n}: ${m}.`);return}
  if(!window.MMDB||!MMDB.kartaLecit){mmHlasG(`${K2.n}: léčení zapiš na jeho kartě.`,4000);return}
  try{await MMDB.kartaLecit(K2.id,Math.min(300,Math.round(tot)),kHPmax(K2),od.id);await kartyNacti();if(BOJ.s&&BOJ.s.aktivni){BOJ.v=-2;try{await bojNacti()}catch(e){}}mmHlasG(`${K2.n}: +${tot} HP (${co}).`,5000)}
  catch(e){mmHlasG("Léčení se nezapsalo: "+(e.message||e),6000)}}
/* ===== přídavky (2026-10-17): přídavky ke zranění z povolání a kouzel (Sneak Attack, Rage, Hunter's Mark, Hex, Divine Favor,
   Divine Smite se slotem) a kostky k hodům d20 (Bless, Bane, Guidance, Bardic Inspiration); trvalé přepínače v poli karty pri ===== */
const kPri=K=>kartaStav(K.id).pri||[];
const KPRID=[["Bless","1d4","ut za","+1d4 k útokům a záchranám"],["Bane","-1d4","ut za","−1d4 k útokům a záchranám"],["Guidance","1d4","ov","+1d4 k ověřením (zvolená dovednost)"],
  ["Bardic d6","1d6","ut za ov","kostka Bardic Inspiration – přičte se k dalšímu hodu d20 a spotřebuje",1],["Bardic d8","1d8","ut za ov","",1],["Bardic d10","1d10","ut za ov","",1],["Bardic d12","1d12","ut za ov","",1]];
function kPriHod(K,co){const typ=/^Útok/.test(co)?"ut":/^Záchrana/.test(co)?"za":/^Iniciativa/.test(co)?"in":"ov",P=[...new Set([...kPri(K),...kBufy(K).map(b=>b.n).filter(n=>KPRID.some(r=>r[0]===n))])];let t=0;const L=[],sp=[];
  KPRID.forEach(([n,x,ty,,jed])=>{if(!P.includes(n)||!ty.split(" ").includes(typ))return;const neg=x[0]==="-",r=kVyraz(x.replace(/^-/,""));if(!r)return;t+=neg?-r.tot:r.tot;L.push(`${neg?"−":"+"}${r.tot} ${n.replace(/^Bardic /,"Bardic Inspiration ")}`);if(jed)sp.push(n)});
  if(sp.length){const z=P.filter(n=>!sp.includes(n));kartaStavZmen(K.id,{pri:z.length?z:null})}return {t,txt:L.length?" "+L.join(" "):""}}
async function kPriTog(K,n){const P=kPri(K),on=P.includes(n),z=on?P.filter(x=>x!==n):[...P.filter(x=>!(/^Bardic /.test(n)&&/^Bardic /.test(x))),n],ch={pri:z.length?z:null};
  if(n==="Rage"&&!on){const q=kZdroje(K).find(x=>x.n==="Rage"),U=Object.assign({},kartaStav(K.id).zdr||{});if(q){if((U.Rage||0)>=q.max){mmHlasG(`${K.n}: Rage už nezbývá.`,3500);return}U.Rage=(U.Rage||0)+1;ch.zdr=U}}
  await kartaStavZmen(K.id,ch,`${K.n}: ${n} ${on?"vypnuto":"zapnuto"}.`)}
const kPriHtml=K=>{const P=kPri(K);return `<p class="kdice" role="group" aria-label="Kostky k hodům">${KPRID.filter(([n])=>!/^Bardic d(8|10|12)$/.test(n)||P.includes(n)).map(([n,,,t])=>`<button type="button" class="bst${P.includes(n)?" on":""}" data-kdice="${besc(n)}" aria-pressed="${P.includes(n)}" ${btip(t||n)}>${besc(n==="Bardic d6"&&!P.some(x=>/^Bardic/.test(x))?"Bardic":n)}</button>`).join("")}${P.some(x=>/^Bardic/.test(x))?`<select data-kprib aria-label="Kostka Bardic Inspiration">${["d6","d8","d10","d12"].map(d=>`<option${P.includes("Bardic "+d)?" selected":""}>${d}</option>`).join("")}</select>`:""}</p>`};
function kEfekty(K){const c=kCtx(K),L=[...(K.efekty||[])],nm=new Set(kSeznam(K).map(x=>String(x.n).toLowerCase())),has=n=>nm.has(n.toLowerCase())&&!L.some(e=>e.n===n);
  const ro=kTrU(c,"Rogue");if(ro)L.push({n:"Sneak Attack",zr:`${Math.ceil(ro/2)}d6`,pozn:`+${Math.ceil(ro/2)}d6 jednou za tah: s výhodou, nebo když je u cíle spojenec; zbraň Finesse nebo na dálku`});
  const ba=kTrU(c,"Barbarian");if(ba)L.push({n:"Rage",zr:ba>=16?4:ba>=9?3:2,pri:"Rage",blizko:1,pozn:"Rage: + ke zranění útoků zblízka, Resistance Bludgeoning/Piercing/Slashing, výhoda na STR ověření a záchrany; zapnutí spotřebuje 1 Rage"});
  if(has("Hex"))L.push({n:"Hex",zr:"1d6",t:"Necrotic",pozn:"+1d6 Necrotic proti očarovanému cíli"});
  if(has("Hunter's Mark"))L.push({n:"Hunter's Mark",zr:"1d6",t:"Force",pozn:"+1d6 Force proti označenému cíli"});
  if(has("Divine Favor"))L.push({n:"Divine Favor",zr:"1d4",t:"Radiant",pozn:"+1d4 Radiant k útokům zbraní"});
  if(has("Divine Smite")){const Q=kSloty(K).filter(z=>z.u<z.max).sort((a,b)=>a.st-b.st||(a.pakt?1:-1)),q=Q[0];if(q)L.push({n:`Divine Smite (${q.st}. st.)`,zr:`${1+q.st}d8`,t:"Radiant",slot:q.k,blizko:1,pozn:`+${1+q.st}d8 Radiant při zásahu zblízka (proti Fiend a Undead +1d8); spotřebuje slot ${q.st}. st.`})}
  return L}
const kEfAkt=(K,sel,a)=>kEfekty(K).filter((e,i)=>(e.pri?kPri(K).includes(e.pri):(sel||[]).includes(i))&&!(e.blizko&&a&&a.dal));
async function kEfPouzij(K,E,sel){const sm=E.filter(e=>e.slot);if(!sm.length)return;for(const e of sm){try{await kartaSeslat(K,{n:"Divine Smite",st:1,kon:false},e.slot)}catch(x){}}
  const L=kEfekty(K),ix=L.map((e,i)=>e.slot?i:-1).filter(i=>i>=0);if(sel)sel.splice(0,sel.length,...sel.filter(i=>!ix.includes(i)))}
const kEfHtml=(K,sel,attr)=>kEfekty(K).map((e,i)=>`<label class="bzrk" ${btip(e.pozn||e.n)}><input type="checkbox" ${attr}="${i}"${e.pri?` data-pri="${besc(e.pri)}"`:""}${(e.pri?kPri(K).includes(e.pri):(sel||[]).includes(i))?" checked":""}> ${besc(e.n)}</label>`).join("");
/* ---- náboje magických předmětů (2026-10-17): počet z popisu SRD, utracené v poli inv[].nab, obnova za úsvitu dlouhým odpočinkem ---- */
const KNABC={};
function kNab(x){const P=kPred(x);if(!P)return null;const id=P.id||P.en;if(KNABC[id]!==undefined)return KNABC[id];const t=String(P.t||"");let max=null;const re=/(\d+)\s+náboj/g;let m;
  while((m=re.exec(t))){const pre=t.slice(Math.max(0,m.index-4),m.index);if(/d\s*$|d\d*$|\+\s*$|\d$/.test(pre)){max=null;break}max=+m[1];break}
  if(!(max>0))return KNABC[id]=null;const r=t.match(/(?:za úsvitu|denně|každý den)[^.]*?obnoví\s+(všechny|\d+d\d+(?:\s*\+\s*\d+)?)|obnoví\s+(všechny|\d+d\d+(?:\s*\+\s*\d+)?)[^.]*?(?:za úsvitu|denně|každý den)/);
  return KNABC[id]={max,obn:r?(/všechn/.test(r[1]||r[2])?"vse":(r[1]||r[2]).replace(/\s/g,"")):null}}
const kNabHtml=(x,i)=>{const N=kNab(x);if(!N)return "";const u=Math.min(N.max,+x.nab||0);return ` <span class="knab" ${btip(`Náboje: zbývá ${N.max-u} z ${N.max}${N.obn?` · za úsvitu se obnoví ${N.obn==="vse"?"všechny":N.obn} (dlouhým odpočinkem)`:" · neobnovují se"}`)}><button type="button" class="kdbmini" data-knab="${i}" data-d="1" aria-label="Použít náboj"${u>=N.max?" disabled":""}>−</button><b>${N.max-u}/${N.max}</b><button type="button" class="kdbmini" data-knab="${i}" data-d="-1" aria-label="Vrátit náboj"${u<=0?" disabled":""}>+</button></span>`};
function kNabObnov(inv){const L=[];inv.forEach(it=>{const N=kNab(it);if(!N||!N.obn||!(+it.nab>0))return;const r=N.obn==="vse"?{tot:+it.nab}:kVyraz(N.obn),b=Math.min(+it.nab,r?r.tot:0);if(!b)return;it.nab=+it.nab-b;if(!it.nab)delete it.nab;L.push(`${it.n} +${b}`)});return L}
/* soustředění (2026-10-17): CON záchrana na kliknutí (War Caster výhoda, stavy, Závoj); neúspěch ukončí soustředění i soustředěné účinky */
const KKON={};
const kKonDrzi=K=>kUc(K).some(x=>x.kon)||(kartaStav(K.id).stavy||[]).includes("soustředí")||((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).some(h=>bojKartaH(h)===K&&(h.stav||[]).includes("soustředí"));
async function kKonZtrata(K,proc){const L=kUc(K),kon=L.filter(x=>x.kon),zb=L.filter(x=>!x.kon),S=kartaStav(K.id),ch={};
  if(kon.length)ch.uc=zb.length?zb:null;if((S.stavy||[]).includes("soustředí")){const st=S.stavy.filter(x=>x!=="soustředí");ch.stavy=st.length?st:null}
  if(Object.keys(ch).length)await kartaStavZmen(K.id,ch);
  const h=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);if(h&&(h.stav||[]).includes("soustředí"))bojHracAkce(h.id,x=>{x.stav=(x.stav||[]).filter(q=>q!=="soustředí");if(!x.stav.length)delete x.stav});
  kHodZapis({k:K.id,kdo:K.n,co:"Soustředění ztraceno",txt:[proc,...kon.map(x=>x.n)].filter(Boolean).join(" · ").slice(0,290)})}
async function kKonHod(K,dc){delete KKON[K.id];const r=await kartaHod(K,`Záchrana CON (soustředění, SO ${dc})`,kZach(K,"CON"),K.konVyhoda?{adv:1,why:"War Caster"}:{});
  if(r&&r.tot>=dc&&!kStavVliv(K,"Záchrana CON").fail){mmHlasG(`${K.n}: soustředění udrženo (${r.tot} proti SO ${dc}).`,5000);kartyPrekresli();return true}
  await kKonZtrata(K,`záchrana ${r?r.tot:"?"} proti SO ${dc}`);mmHlasG(`${K.n}: soustředění ztraceno${kUc(K).length?"":" – soustředěné účinky skončily"}.`,6000);return false}
async function kSpZraneni(K,x,lvl,krit,cil){const E=kSpUcinek(K,x,lvl);if(!E)return;const cnt=E.pocet||1,L=[];let tot=0;
  for(let i=0;i<cnt;i++){const r=kVyraz((krit?E.x.replace(/(\d+)d/g,(q,n)=>`${2*n}d`):E.x)+(E.mod?(E.mod>=0?"+":"")+E.mod:""));if(r){tot+=r.tot;L.push(r.txt)}}
  if(E.k==="l"&&cil&&cil.mass){const C=cil.mass;kHodZapis({k:K.id,kdo:K.n,co:`Léčení – ${x.n}${lvl>x.st?` (${lvl}. st.)`:""}`.slice(0,80),tot:Math.min(999,tot),txt:`${L.join(" | ")} · ${C.map(c=>c.n).join(", ")}`.slice(0,290)});for(const c of C)await kLecKarta(c,tot,K,x.n);return}
  const K2=E.k==="l"&&cil!=="-"?(KARTBY[cil||K.id]||K):null;
  kHodZapis({k:K.id,kdo:K.n,co:`${E.k==="l"?"Léčení":"Zranění"} – ${x.n}${lvl>x.st?` (${lvl}. st.)`:""}${K2&&K2!==K?` → ${K2.n}`:""}`.slice(0,80),tot:Math.min(999,tot),txt:`${L.join(" | ")}${E.t?" "+(BZRT[E.t]||E.t):""}${krit?" (kritický zásah)":""}${E.zach?` · záchrana ${E.zach} SO ${kSpDC(K,x)||"?"}`:""}`.slice(0,290)});
  if(K2){await kLecKarta(K2,tot,K,x.n);return}
  mmHlasG(`${K.n}: ${x.n} – ${E.k==="l"?"léčení":"zranění"} ${tot}${cnt>1?` (${cnt}×)`:""}`,5000)}
/* ---- stavy mimo boj (ovlivňují hody z karty) ---- */
const KSTV=["krvácí k6","krvácí k8","otrávený","vyděšený","neviditelný","sražen","zadržen","chycen","oslepen","ohlušen","okouzlen","neschopný","ochromen","omráčen","zkamenělý","v bezvědomí","soustředí"];
function kStavy(K){const S=kartaStav(K.id),L=[...(S.stavy||[])];const h=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);if(h)(h.stav||[]).forEach(s=>{if(!L.includes(s))L.push(s)});return L}
function kStavVliv(K,co){const st=kStavy(K),r=[];let fail=false;const typ=/^Útok/.test(co)?"ut":/^Záchrana/.test(co)?"za":/^Iniciativa/.test(co)?"in":"ov",ab=(co.match(/(STR|AGI|CON|INT|WIS|CHA)/)||[])[1];
  st.forEach(k=>{const d=SRDST[k];if(!d)return;
    if(typ==="ut"&&d.ut)r.push([d.ut,`${k}`]);
    if(typ==="ov"&&(k==="otrávený"||k==="vyděšený"))r.push([-1,k]);
    if(typ==="in"&&(k==="neviditelný"))r.push([1,k]);if(typ==="in"&&k==="neschopný")r.push([-1,k]);
    if(typ==="za"&&d.zach&&ab&&d.zach[ab]){if(d.zach[ab]==="f")fail=true;else r.push([d.zach[ab]==="a"?1:-1,k])}});
  if(kPri(K).includes("Rage")&&(typ==="ov"||typ==="za")&&ab==="STR")r.push([1,"Rage"]);
  return {r,fail}}
const kStavHtml=K=>{const S=kartaStav(K.id).stavy||[];return `<div class="kstavy" role="group" aria-label="Stavy">${KSTV.map(k=>{const on=S.includes(k),d=SRDST[k];return `<button type="button" class="bst${on?" on":""}" data-kstav="${besc(k)}" aria-pressed="${on}" ${btip(d?`${k} (${d.en}) – ${d.t}`:"soustředí se na kouzlo")}>${SRDIC[k]?bi(SRDIC[k]):""}<span>${k}</span></button>`}).join("")}</div>`};
