/* ===== Kouzla: účinky na cílech, dočasné HP, trvání v kolech, rituály, opakované útoky, oblasti, Counterspell (2026-10-20) =====
   KZEF – mechanika posílení (AC, rychlost, záchrany, Resistance, maximum HP, dočasné HP); působí na kartě cíle, dokud trvá účinek
   sesilatele („Kouzlo ⇒ Cíl“ v jeho účincích, viz kBufNa) nebo vlastní účinek postavy (kouzlo seslané na sebe).
   KZOPAK – kouzla, která se po seslání opakují bez slotu (Spiritual Weapon, Witch Bolt, Call Lightning…).
   KZOBL – kouzla s oblastí, která zraňuje opakovaně (Spirit Guardians, Moonbeam, Cloud of Daggers…): v boji se z nich stane
   „oblast“ (s.obl), vypravěč klepnutím určí, kdo v ní je, a na začátku či konci tahu se záchrana a zranění hodí samy. */
const KZEF={
  "Haste":{ac:2,rychX:2,adv:["AGI"],p:"+2 AC, dvojnásobná rychlost, výhoda na záchrany AGI, v každém tahu akce navíc (Útok jedním útokem, Sprint, Odpoutání, Skrytí nebo Použití předmětu)"},
  "Mage Armor":{acz:13,p:"bez zbroje: AC 13 + AGI"},
  "Barkskin":{acmin:17,p:"AC nejméně 17"},
  "Warding Bond":{ac:1,zach:1,res:"vse",p:"+1 AC a k záchranám, Resistance vůči všemu zranění; sesilatel utrpí stejné zranění"},
  "Longstrider":{rych:10,p:"rychlost +10 stop"},
  "Stoneskin":{res:["Bludgeoning","Piercing","Slashing"],p:"Resistance vůči Bludgeoning, Piercing a Slashing"},
  "Heroism":{thpTah:1,p:"imunní vůči stavu Vyděšen (Frightened); na začátku tahu dočasné HP = modifikátor sesílací vlastnosti sesilatele"},
  "Aid":{hpmax:l=>5*Math.max(1,l-1),p:"maximum i aktuální HP +5 (+5 za každou úroveň slotu nad 2)"},
  "Beacon of Hope":{adv:["WIS"],p:"výhoda na záchrany WIS a záchrany proti smrti; léčení vždy maximum"},
  "Protection from Evil and Good":{p:"aberace, nebešťané, elementálové, víly, běsi a nemrtví mají nevýhodu na útoky proti tobě a nemohou tě okouzlit, vyděsit ani posednout"},
  "Blur":{p:"útoky proti tobě mají nevýhodu (ledaže útočník vidí skrz iluze)"},
  "Death Ward":{p:"první pokles na 0 HP: zůstaneš na 1 HP a kouzlo skončí"},
  "Freedom of Movement":{p:"obtížný terén ani kouzla tě nezpomalí, magie tě nemůže ochromit ani zadržet"},
  "Enlarge/Reduce":{p:"zvětšení: výhoda na ověření a záchrany STR, zbraně +1d4 zranění · zmenšení: nevýhoda STR, zbraně −1d4"},
  "Fly":{p:"rychlost letu 60 stop"},"Spider Climb":{p:"lezení po stěnách i stropě, rychlost lezení = rychlost chůze"},
  "Greater Invisibility":{p:"neviditelný (Invisible) i při útoku a sesílání"},"Invisibility":{p:"neviditelný (Invisible), dokud nezaútočíš nebo nesešleš kouzlo"},
  "Mirror Image":{p:"tři iluzorní dvojníci: zásah může zasáhnout dvojníka"},"Holy Aura":{adv:["STR","AGI","CON","INT","WIS","CHA"],p:"výhoda na všechny záchrany, útoky proti tobě s nevýhodou"},
  "Protection from Energy":{p:"Resistance vůči zvolenému typu zranění (Acid, Cold, Fire, Lightning nebo Thunder)"},
  "False Life":{thp:(l)=>({x:"2d4+4"+(l>1?`+${5*(l-1)}`:"")}),p:"dočasné HP 2d4 + 4 (+5 za každou úroveň slotu nad 1)"},
  "Armor of Agathys":{thp:(l)=>({n:5*Math.max(1,l)}),p:"dočasné HP 5 za úroveň slotu; dokud je máš, útočník zblízka utrpí Cold zranění 5 za úroveň slotu"}};
/* kouzlo bez přípony stupně: „Aid (3. st.)“ → Aid */
const kzJm=n=>String(n||"").replace(/\s*\(\d+\. st\.\)\s*$/,"").trim();
const kzSt=n=>+(String(n||"").match(/\((\d+)\. st\.\)\s*$/)||[])[1]||0;
/* stupeň se zapíše do názvu účinku jen u kouzel, kde na něm závisí mechanika (Aid, opakované útoky a oblasti se zesílením) */
const kzStPrip=(n,lv,st)=>lv>st&&st>0&&(n==="Magic Weapon"||n==="Elemental Weapon"||(KZEF[n]&&KZEF[n].hpmax)||(KZOPAK[n]&&KZOPAK[n].up)||(KZOBL[n]&&KZOBL[n].up))?` (${lv}. st.)`:"";
/* všechna posílení na kartě: vlastní účinky (kouzlo na sebe) a účinky od jiných postav */
const kBufAll=K=>[...kUc(K).filter(u=>!/ ⇒ /.test(u.n||"")).map(u=>({n:kzJm(u.n),l:kzSt(u.n),od:K.n,vl:1,u})),...(typeof kBufy==="function"?kBufy(K):[]).map(b=>({n:kzJm(b.n),l:kzSt(b.n),od:b.od}))];
const kBufEf=K=>kBufAll(K).map(b=>Object.assign({e:KZEF[b.n]},b)).filter(b=>b.e);
/* příspěvky posílení do hodnot karty (kHodn): záchrany, maximum HP, rychlost */
function kBufHodn(K,t,a,L){const B=kBufEf(K),R=[];if(!B.length)return R;
  B.forEach(b=>{const e=b.e;if(t==="zach"&&e.zach)R.push([b.n,e.zach]);if(t==="hp"&&e.hpmax)R.push([b.n,e.hpmax(b.l||2)]);if(t==="rych"&&e.rych)R.push([b.n,e.rych])});
  if(t==="rych"&&B.some(b=>b.e.rychX)){const s=kSum([...L,...R]);R.push(["Haste ×2",s])}return R}
/* AC z posílení (Mage Armor jen bez zbroje); ruční tlačítka AC (KUCAC) se nepočítají dvakrát */
function kBufAC(K,N){const S=kartaStav(K.id),uc=S.uc||[],r={ac:0,min:0,L:[]};
  kBufEf(K).forEach(b=>{const e=b.e;if(b.vl&&b.u&&(b.u.ac!=null||b.u.acmin!=null))return;if(b.n==="Shield of Faith")return;
    if(e.ac){r.ac+=e.ac;r.L.push([b.n,e.ac])}if(e.acmin)r.min=Math.max(r.min,e.acmin);if(e.acz&&!(N&&N.z))r.min=Math.max(r.min,e.acz+kMd(K,"AGI"))});return r}
const kBufRes=K=>{const R=new Set();kBufEf(K).forEach(b=>{const r=b.e.res;if(r==="vse")["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"].forEach(t=>R.add(t));else(r||[]).forEach(t=>R.add(t))});return [...R]};
const kBufAdv=(K,ab)=>kBufEf(K).filter(b=>(b.e.adv||[]).includes(ab)).map(b=>b.n);
/* přehled na kartě: co na postavě právě působí */
function kBufHtml(K){const B=kBufEf(K);if(!B.length)return "";
  return `<ul class="kuc kbufl">${B.map(b=>`<li>${kKonI()} <b>${besc(b.n)}</b>${b.od!==K.n?` <small>od ${besc(b.od)}</small>`:""} <small>${besc(b.e.p||"")}</small></li>`).join("")}</ul>`}

/* ---- seslání: dočasné HP na sebe (False Life, Armor of Agathys), maximum HP cílům (Aid) ---- */
async function kSesPo(K,sp,lvl){const nm=kzJm(sp.n);if(typeof KZSUM!=="undefined"&&KZSUM[nm]){await kSumNovy(K,sp,lvl);return}const e=KZEF[nm];if(!e)return;
  if(e.thp){const v=e.thp(lvl),r=v.x?kVyraz(v.x):null,n=v.n!=null?v.n:r?r.tot:0;if(n>0){const S=kartaStav(K.id),ma=+S.thp||0;
    if(n>ma){await kartaStavZmen(K.id,{thp:n},`${K.n}: ${nm} – dočasné HP ${n}${r?` (${r.txt})`:""}.`)}else mmHlasG(`${K.n}: ${nm} – ${n} dočasných HP, máš už ${ma} (nesčítají se).`,4000);
    kHodZapis({k:K.id,kdo:K.n,co:`${nm} – dočasné HP`,tot:n,txt:r?r.txt:`${n}`})}}
}
async function kSesPoCile(K,sp,lvl,cile){const nm=kzJm(sp.n),e=KZEF[nm];if(!e||!e.hpmax||!cile||!cile.length)return;const b=e.hpmax(lvl);for(const c of cile){try{await kLecKarta(c,b,K,nm)}catch(x){}}}

/* ---- trvání v kolech: krátké účinky (do 10 minut) na kartách postav v boji odpočítává vypravěčovo zařízení koly boje ----
   s.ucb = {"karta|účinek": {k: kolo, t: tah, r: počet kol}}; účinek skončí na začátku tahu, ve kterém byl seslán, po r kolech */
function bojUcKola(s){if(!GMV||!s||!s.aktivni)return;const now={k:s.kolo||1,t:s.tah||0},B=s.ucb||{},zive=new Set(),pryc={};
  (s.hraci||[]).forEach(h=>{const K=bojKartaH(h);if(!K)return;kUc(K).forEach(u=>{if(!(u.h>0&&u.h<=1/6+1e-6))return;const key=K.id+"|"+u.n;zive.add(key);if(!B[key])B[key]={k:now.k,t:now.t,r:Math.max(1,Math.round(u.h*600))}})});
  Object.keys(B).forEach(key=>{const v=B[key];if(!zive.has(key)){delete B[key];return}const upl=(now.k-v.k)-(now.t<v.t?1:0);if(upl>=v.r){const i=key.indexOf("|");(pryc[key.slice(0,i)]=pryc[key.slice(0,i)]||[]).push(key.slice(i+1));delete B[key]}});
  if(Object.keys(B).length)s.ucb=B;else delete s.ucb;
  Object.entries(pryc).forEach(([kid,L])=>setTimeout(()=>kUcKonci(KARTBY[kid],L,"vypršelo (kola boje)"),0))}
async function kUcKonci(K,L,proc){if(!K)return;const U=kUc(K),ko=U.filter(u=>L.includes(u.n));if(!ko.length)return;try{await kSumKonec(K,ko.map(u=>kzJm(u.n)))}catch(e){}
  if(ko.some(u=>u.kon)){await kKonZtrata(K,`${ko.map(u=>u.n).join(", ")} ${proc}`);const zb=kUc(K).filter(u=>L.includes(u.n));if(zb.length)await kartaStavZmen(K.id,{uc:kUc(K).filter(u=>!L.includes(u.n)).length?kUc(K).filter(u=>!L.includes(u.n)):null},null,{bezZpet:true})}
  else{const zb=U.filter(u=>!L.includes(u.n));await kartaStavZmen(K.id,{uc:zb.length?zb:null},null,{bezZpet:true});kHodZapis({k:K.id,kdo:K.n,co:"Účinek skončil",txt:`${ko.map(u=>u.n).join(", ")} ${proc}`})}
  if(curView==="boj")renderBoj()}
/* Heroism: na začátku tahu postavy dočasné HP = modifikátor sesílací vlastnosti sesilatele (vypravěč) */
function bojBufZacTahu(s,h){if(!GMV)return;const K=bojKartaH(h);if(!K)return;kBufEf(K).filter(b=>b.e.thpTah).forEach(b=>{const C=(KARTY||[]).find(k=>k.n===b.od)||K,m=Math.max(1,kSpMod(C)),S=kartaStav(K.id);
  if((+S.thp||0)<m)setTimeout(()=>{kartaStavZmen(K.id,{thp:m},null,{bezZpet:true});bojMsg(h.id,`${b.n}: dočasné HP ${m}.`)},0)})}

/* ---- rituál: kouzlo s příznakem rituálu jde seslat bez slotu, sesílání trvá o 10 minut déle (2024: každý sesilatel, má-li kouzlo připravené) ---- */
const kRitOk=(K,x)=>{const d=typeof kSp==="function"?kSp(x.n):null;return !!(x.st>0&&!x.pz&&((d&&d.ri)||x.rit))};
async function kartaRitual(K,sp){const d=kSp(sp.n),kon=!!(sp.kon||(d&&d.ko));
  if(kon&&kKonDrzi(K)){const cur=kKonNazev(K)||"dosavadní kouzlo";if(cur!==sp.n){if(!confirm(`${K.n} se soustředí na ${cur}. Rituál ${sp.n} soustředění přeruší – ${cur} skončí. Seslat?`))return false;await kKonZtrata(K,`nový rituál: ${sp.n}`)}}
  const h=d?kTrv(d.d):null;if(h)await kUcPridej(K,sp.n,h,kon);
  kHodZapis({k:K.id,kdo:K.n,co:`Seslal ${sp.n} jako rituál`,txt:"bez slotu · sesílání o 10 minut delší"+(kon?" · Concentration":"")});
  mmHlasG(`${K.n} sesílá ${sp.n} jako rituál – bez slotu, sesílání trvá o 10 minut déle.`,5000);return true}

/* ---- opakované útoky bez slotu (bod 5) ---- */
const KZOPAK={
  "Spiritual Weapon":{typ:"ut",z:"1d8",mod:1,up:[2,"1d8"],t:"Force",cas:"BA",dal:0},
  "Witch Bolt":{typ:"auto",z:"1d12",t:"Lightning",cas:"BA"},
  "Call Lightning":{typ:"zach",ab:"AGI",z:"3d10",up:[3,"1d10"],t:"Lightning",pol:1,cas:"A"},
  "Vampiric Touch":{typ:"ut",z:"3d6",up:[3,"1d6"],t:"Necrotic",cas:"A",lec:1},
  "Flaming Sphere":{typ:"zach",ab:"AGI",z:"2d6",up:[2,"1d6"],t:"Fire",pol:1,cas:"BA"},
  "Heat Metal":{typ:"auto",z:"2d8",up:[2,"1d8"],t:"Fire",cas:"BA"},
  "Arcane Hand":{typ:"ut",z:"5d8",up:[5,"2d8"],t:"Force",cas:"BA"},
  "Arcane Sword":{typ:"ut",z:"4d12",mod:1,t:"Force",cas:"BA"},
  "Flame Blade":{typ:"ut",z:"3d6",mod:1,up:[2,"1d6"],t:"Fire",cas:"A"},
  "Dragon's Breath":{typ:"zach",ab:"AGI",z:"3d6",up:[2,"1d6"],t:"Fire",pol:1,cas:"A"},
  "Sunbeam":{typ:"zach",ab:"CON",z:"6d8",t:"Radiant",pol:1,cas:"A"},
  "Melf's Minute Meteors":{typ:"zach",ab:"AGI",z:"2d6",t:"Fire",pol:1,cas:"BA"},
  "Healing Spirit":{typ:"lec",z:"1d6",up:[2,"1d6"],t:"",cas:"BA"}};
/* zranění podle stupně: „1d8“ + (stupeň − základ) × „1d8“ */
function kzZr(o,lvl,mod){let z=o.z;if(o.up&&lvl>o.up[0]){const [n,s]=o.up[1].split("d").map(Number),m=z.match(/^(\d+)d(\d+)/);const k=(lvl-o.up[0])*n;z=m&&+m[2]===s?z.replace(/^\d+d\d+/,`${+m[1]+k}d${s}`):`${z}+${k}d${s}`}
  if(o.mod&&mod)z+=(mod>0?"+":"")+mod;return z}
/* aktivní opakovatelná kouzla postavy (vlastní účinek se stupněm) */
const kOpakAkt=K=>kUc(K).filter(u=>!/ ⇒ /.test(u.n||"")&&KZOPAK[kzJm(u.n)]).map(u=>{const n=kzJm(u.n),o=KZOPAK[n],sp=kSeznam(K).find(x=>x.n===n),l=kzSt(u.n)||(sp&&sp.st)||(kSp(n)||{}).l||1;return {n,o,l}});
function bojOpakHtml(K){const L=kOpakAkt(K);if(!L.length)return "";
  return `<div class="bjur bopak"><span class="bkzlh">↻ Trvající kouzla</span>${L.map(q=>`<button type="button" class="gbtn ghost" data-bopak="${besc(q.n)}" ${btip(`${q.n}${q.l>1?` (${q.l}. st.)`:""}: ${q.o.typ==="ut"?"útok kouzlem":q.o.typ==="zach"?`záchrana ${q.o.ab}`:q.o.typ==="lec"?"léčení":"zranění bez hodu"} · ${kzZr(q.o,q.l,kSpMod(K))} ${BZRT[q.o.t]||q.o.t} · ${q.o.cas==="BA"?"bonusová akce":"akce"} · bez slotu`)}>↻ ${besc(q.n)} <small>${q.o.cas==="BA"?"BA":"A"}</small></button>`).join("")}</div>`}
/* připraví list útoku: hod se odešle vypravěči jako běžný útok (bez slotu, bez nového soustředění) */
function bojOpak(n){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),K=me&&bojKartaH(me);if(!K)return;const q=kOpakAkt(K).find(x=>x.n===n);if(!q)return;
  const o=q.o,z=kzZr(o,q.l,kSpMod(K)),c=(s.npc||[]).find(x=>x.id===BJU.cil);
  if(o.typ==="lec"){const P=(s.hraci||[]).map(h=>bojKartaH(h)).filter(Boolean);kVyber(`${n}: koho vyléčit?`,P.map(k=>k.n)).then(async v=>{const C=P.find(k=>k.n===v);if(!C)return;const r=kVyraz(z);if(r&&r.tot>0){await kLecKarta(C,r.tot,K,n);kHodZapis({k:K.id,kdo:K.n,co:`${n} – léčení`,tot:r.tot,txt:`${r.txt} → ${C.n}`})}renderBoj()});return}
  Object.assign(BJU,{zi:"",ks:null,sl:"",cim:n,t:o.t,drt:false,pru:false,ef:[],kmin:null,serie:null,zav:null,dal:!!o.dal});
  if(o.typ==="zach"){const r=kVyraz(z);Object.assign(BJU,{plos:true,ab:o.ab,dc:String(kSpDC(K)||""),pol:!!o.pol,dmg:String(r?r.tot:0),hod:"",d:""});if(BJU.cil&&!BJU.cile.includes(BJU.cil))BJU.cile=[BJU.cil];
    BJU.info=`${n} (bez slotu): záchrana ${o.ab} SO ${BJU.dc}, zranění ${r?r.txt:z} = ${r?r.tot:0}${o.pol?" · úspěch = polovina":""}. Vyber cíle a odešli.`}
  else if(o.typ==="auto"){const r=kVyraz(z);Object.assign(BJU,{plos:false,hod:"60",d:"",dmg:String(r?r.tot:0)});BJU.info=`${n} (bez slotu): zásah bez hodu, zranění ${r?r.txt:z} = ${r?r.tot:0}. Vyber cíl a odešli.`}
  else{const nav=bojAdvHrac(s,me,c,!!o.dal),v=BJU.adv==="auto"?nav.v:+BJU.adv,b=kSpUt(K)-2*kVycerp(K),d1=bK(20),d2=v?bK(20):null,d=d2==null?d1:v>0?Math.max(d1,d2):Math.min(d1,d2),krit=d===20,vys=bojJaZas(c,d+b,d,krit),mis=vys==="vedle";
    const r=mis?null:bojKostky(z,krit);Object.assign(BJU,{plos:false,hod:String(d+b),d:String(d),dmg:String(r?r.t:0),kmin:20});
    BJU.serie=[{ci:c?c.id:"",hod:d+b,d,d1,d2,v,b,dmg:r?r.t:0,krit,vys,upr:[],pd:"",zx:r?r.x:"",dz:{z,plus:0,ez:[],rz:null}}];
    BJU.info=`${n} (bez slotu): d20 ${d1}${d2!=null?`/${d2}`:""} ${bsg(b)} = ${d+b}${krit?" krit!":d===1?" (1)":""}${vys?` → ${vys.toUpperCase()}`:""}${r?`, zranění ${r.x} = ${r.t}`:mis?", zranění se nehází":""}${o.lec&&r?` · vyléčíš ${Math.floor(r.t/2)} HP`:""}`;
    if(o.lec&&r&&!mis)setTimeout(()=>kLecKarta(K,Math.floor(r.t/2),K,n).catch(()=>{}),0)}
  try{bojBptOznac(o.cas==="BA"?"BA":"A")}catch(e){}BOTV.add("ja-utok");renderBoj()}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bopak]");if(b){bojOpak(b.dataset.bopak);return}
  const k=e.target.closest&&e.target.closest("[data-kopak]");if(k){const n=k.dataset.kopak;if(curView!=="boj"){location.hash="#boj";setTimeout(()=>bojOpak(n),900)}else bojOpak(n)}});

/* ---- oblasti s opakovaným zraněním (bod 6) ----
   kdy: "zac" začátek tahu tvora v oblasti, "kon" konec tahu; jednou za tah. ab null = bez záchrany. */
const KZOBL={
  "Spirit Guardians":{ab:"WIS",z:"3d8",up:[3,"1d8"],t:"Radiant",pol:1,kdy:"kon",ko:1},
  "Moonbeam":{ab:"CON",z:"2d10",up:[2,"1d10"],t:"Radiant",pol:1,kdy:"kon",ko:1},
  "Cloud of Daggers":{ab:null,z:"4d4",up:[2,"2d4"],t:"Slashing",kdy:"kon",ko:1},
  "Wall of Fire":{ab:"AGI",z:"5d8",up:[4,"1d8"],t:"Fire",pol:1,kdy:"kon",ko:1},
  "Cloudkill":{ab:"CON",z:"5d8",up:[5,"1d8"],t:"Poison",pol:1,kdy:"kon",ko:1},
  "Insect Plague":{ab:"CON",z:"4d10",up:[5,"1d10"],t:"Piercing",pol:1,kdy:"kon",ko:1},
  "Incendiary Cloud":{ab:"AGI",z:"10d8",t:"Fire",pol:1,kdy:"kon",ko:1},
  "Blade Barrier":{ab:"AGI",z:"6d10",t:"Slashing",pol:1,kdy:"kon",ko:1},
  "Flaming Sphere":{ab:"AGI",z:"2d6",up:[2,"1d6"],t:"Fire",pol:1,kdy:"kon",ko:1},
  "Stinking Cloud":{ab:"CON",z:"",t:"Poison",st:["otrávený"],kdy:"zac",ko:1},
  "Web":{ab:"AGI",z:"",t:"",st:["zadržen"],kdy:"zac",ko:1},
  "Grease":{ab:"AGI",z:"",t:"",st:["sražen"],kdy:"kon",ko:0},
  "Black Tentacles":{ab:"STR",z:"3d6",up:[4,"1d6"],t:"Bludgeoning",st:["zadržen"],kdy:"zac",ko:1},
  "Sickening Radiance":{ab:"CON",z:"4d10",t:"Radiant",kdy:"zac",ko:1},
  "Hunger of Hadar":{ab:null,z:"2d6",t:"Cold",kdy:"zac",ko:1}};
/* oblast ze seslání: od = id sesilatele (postava „h…“ nebo NPC), dc, zranění podle stupně; cíle (cile) určí vypravěč */
function bojOblNova(z,nm,od,lvl,dc){const o=KZOBL[nm];if(!o)return;z.obl=(z.obl||[]).filter(a=>!(a.od===od&&(o.ko?KZOBL[a.n].ko:a.n===nm)));
  z.obl.push({id:"o"+Date.now().toString(36),n:nm,od,l:lvl||0,dc:dc||null,z:o.z?kzZr(o,lvl||0,0):"",cile:[],lk:{}})}
/* oblast trvá, dokud ji sesilatel drží (soustředění); kouzla postav se do boje přidají sama z účinků na kartě */
function bojOblSync(s){if(!GMV||!s||!s.aktivni)return;
  (s.hraci||[]).forEach(h=>{const K=bojKartaH(h);if(!K)return;kUc(K).forEach(u=>{const nm=kzJm(u.n);if(/ ⇒ /.test(u.n||"")||!KZOBL[nm])return;if(!(s.obl||[]).some(a=>a.od===h.id&&a.n===nm)){const sp=kSeznam(K).find(x=>x.n===nm);bojOblNova(s,nm,h.id,kzSt(u.n)||(sp&&sp.st)||(kSp(nm)||{}).l||1,kSpDC(K))}})});
  if(!s.obl)return;s.obl=s.obl.filter(a=>{const o=KZOBL[a.n];if(!o)return false;const h=(s.hraci||[]).find(x=>x.id===a.od);
    if(h){const K=bojKartaH(h);return !!K&&kUc(K).some(u=>kzJm(u.n)===a.n&&!/ ⇒ /.test(u.n||""))}
    const n=(s.npc||[]).find(x=>x.id===a.od);if(!n)return false;const st=n.stav||[];if(st.some(t=>t==="poražen"||t==="prchá"||t==="vzdal se"))return false;return !o.ko||(st.includes("soustředí")&&(!n.kon||n.kon===a.n))});
  if(!s.obl.length)delete s.obl}
/* spuštění oblasti na tvora (začátek / konec jeho tahu nebo ručně „teď“) – jednou za tah */
function bojOblSpust(s,a,id,rucne){const o=KZOBL[a.n];if(!o)return;const tk=(s.kolo||1)*100+(s.tah||0);a.lk=a.lk||{};if(!rucne&&a.lk[id]===tk)return;a.lk[id]=tk;
  const src=bojJm(s,a.od)||"",k=a.z?bojKostky(a.z.replace(/\s+/g,""),false):null,dmg=k?k.t:0,ST=o.st||[];
  const n=(s.npc||[]).find(x=>x.id===id);
  if(n){const E=bojEff(n);if(!E)return;const Z=o.ab&&a.dc?bojNpcZach(n,E,o.ab,a.dc,true):null,ok=Z?Z.ok:false,base=ok?(o.pol?Math.floor(dmg/2):0):dmg,r=base>0&&E.hp.length?bojZasah(E,base,o.t,{}):{x:0,pozn:[]};
    if(r.x>0&&E.hp.length&&n.druh!=="houf"){const hp=bojHp.get(),q=hp[id]||[],old=q[0]!=null?q[0]:E.hp[0].max;q[0]=old-r.x;hp[id]=q;bojHp.set(hp);bojHpZmena(id,0,old,old-r.x)}
    if(!ok&&ST.length&&(Z||!o.ab))bojStavDej(s,n,{n:a.n,st:ST,k:10,src:a.od});
    const txt=`${Z?Z.txt+(ok?" úspěch":" neúspěch")+" → ":""}${dmg?`${k.x} = ${dmg}${o.pol&&ok?", polovina":""}${r.pozn.length?" ("+r.pozn.join(", ")+")":""} → −${r.x} HP`:""}${!ok&&ST.length?` · ${ST.join(", ")}`:""}`;
    bojMsg(id,`${a.n} (${src}): ${txt}.`);bojLog(id,{n:a.n,ai:a.od,ci:id,zt:txt},n.n);bojZaz({a:src,ai:a.od,c:n.n,ci:id,cim:a.n,v:txt.slice(0,80)});return}
  const h=(s.hraci||[]).find(x=>x.id===id);if(!h)return;const K=bojKartaH(h);
  if(!o.ab){if(K&&dmg)setTimeout(()=>{const r=bojPcZasah({zr:{t:dmg,zt:o.t}},id,K);bojLog(id,{n:a.n,ci:id,zt:`${k.x} = ${dmg} → ${r?r.msg:""}`},h.n)},0);return}
  if(K&&window.MMDB&&MMDB.vyzva&&a.dc)setTimeout(()=>MMDB.vyzva({typ:"zach",ab:o.ab,dc:a.dc,komu:[K.id],pozn:`${a.n} (${src}): ${dmg?`${dmg} ${BZRT[o.t]||o.t}${o.pol?", úspěch = polovina":""}`:""}${ST.length?`${dmg?" · ":""}při neúspěchu ${ST.join(", ")}`:""}`.slice(0,200)}).then(v=>{BPLV[+v]={dmg,pol:!!o.pol,t:o.t,ab:o.ab,dc:a.dc,map:{[K.id]:id},hot:new Set(),src,cim:a.n,st:ST,op:false,k:10,kon:a.od};vyzvyNacti()}).catch(()=>{}),0);
  else bojMsg(id,`${a.n}: záchrana ${o.ab} SO ${a.dc||"?"} – ${dmg} ${BZRT[o.t]||o.t}${o.pol?", úspěch polovina":""}.`)}
function bojOblTah(s,id,kdy){(s.obl||[]).forEach(a=>{const o=KZOBL[a.n];if(o&&o.kdy===kdy&&(a.cile||[]).includes(id))bojOblSpust(s,a,id,false)})}
function bojOblHtml(s,gm){const L=s.obl||[];if(!L.length)return "";
  return `<section class="bobl" aria-label="Oblasti kouzel"><h3 class="uvh2">${bi("zavoj")} Oblasti kouzel</h3>${L.map(a=>{const o=KZOBL[a.n]||{},src=bojJm(s,a.od)||"?";
    return `<div class="bobla"><p><b>${besc(a.n)}</b> <small>${besc(src)}${a.l?` · ${a.l}. st.`:""} · ${o.ab?`${o.ab} SO ${a.dc||"?"}`:"bez záchrany"}${a.z?` · ${besc(a.z)} ${besc(BZRT[o.t]||o.t)}${o.pol?", úspěch polovina":""}`:""}${(o.st||[]).length?` · ${besc(o.st.join(", "))}`:""} · ${o.kdy==="zac"?"na začátku tahu":"na konci tahu"} v oblasti</small></p>
      ${gm?`<div class="boblc"><span class="bkzlh">Kdo je v oblasti</span>${[...(s.npc||[]).filter(n=>!bojOut(n)),...(s.hraci||[])].filter(x=>x.id!==a.od).map(x=>`<button type="button" class="kchip${(a.cile||[]).includes(x.id)?" on":""}" data-boblc="${a.id}" data-id="${x.id}" aria-pressed="${(a.cile||[]).includes(x.id)}">${besc(x.n)}</button>`).join("")}
        <button type="button" class="badd" data-boblnow="${a.id}" ${btip("Tvor do oblasti právě vstoupil: hodí záchranu a zranění vybraným hned (jednou za tah)")}>Vstoupili teď →</button><button type="button" class="bkoncx" data-boblx="${a.id}" aria-label="Ukončit oblast">×</button></div>`:""}</div>`}).join("")}</section>`}
document.addEventListener("click",e=>{const T=q=>e.target.closest&&e.target.closest(q);
  const c=T("[data-boblc]");if(c){const id=c.dataset.id,aid=c.dataset.boblc;bojZmen(z=>{const a=(z.obl||[]).find(x=>x.id===aid);if(!a)return;a.cile=a.cile||[];a.cile=a.cile.includes(id)?a.cile.filter(x=>x!==id):[...a.cile,id]});return}
  const nw=T("[data-boblnow]");if(nw){bojZmen(z=>{const a=(z.obl||[]).find(x=>x.id===nw.dataset.boblnow);if(a)(a.cile||[]).forEach(id=>bojOblSpust(z,a,id,false))});return}
  const x=T("[data-boblx]");if(x){bojZmen(z=>{z.obl=(z.obl||[]).filter(a=>a.id!==x.dataset.boblx);if(!z.obl.length)delete z.obl});return}});

/* ---- Counterspell (bod 7): když vypravěč sešle kouzlo NPC, hráčům, kteří mají Counterspell, slot 3. st. a volnou reakci,
   vyskočí nabídka (výzva typu „hod“ s poznámkou KZPROT…). Použije-li ho, NPC si hází záchranu CON proti SO postavy
   (pravidla 2024); neuspěje-li, kouzlo selže a použití se mu vrátí. ---- */
const KZPROT="Counterspell: ";
const BPROT={};
function bojProtiKdo(s){return (s.hraci||[]).filter(h=>{const K=bojKartaH(h);if(!K||h.ds||(s.reak||{})[h.id]||srdNejedna(h.stav))return false;const x=kSeznam(K).find(q=>q.n==="Counterspell");return !!x&&kSlX(K,x).length>0})}
/* vrací true, když se čeká na hráče (kouzlo NPC se sešle až po odpovědi nebo „Pokračovat“) */
function bojProtiNabidni(n,x,zn,dal){const s=BOJ.s||{};if(!(+x.l>0))return false;/* triky se nenabízejí – zdržovalo by to každé kolo */if(!window.MMDB||!MMDB.vyzva||!GMV||!bojSpoj||bojSpoj(n))return false;const H=bojProtiKdo(s);if(!H.length)return false;
  const komu=H.map(h=>bojKartaH(h).id),lvl=bojNpcKzLvl(bojEff(n),x);
  MMDB.vyzva({typ:"hod",komu,pozn:`${KZPROT}${n.n} sesílá ${x.en}${lvl?` (${lvl}. st.)`:""}`.slice(0,200)}).then(id=>{BPROT[+id]={nid:n.id,xi:x.i,zn,dal,map:Object.fromEntries(H.map(h=>[bojKartaH(h).id,h.id])),n:n.n,sp:x.en};vyzvyNacti();renderBoj()}).catch(e=>{mmHlasG("Nabídku Counterspell se nepodařilo poslat: "+(e.message||e),4000);dal()});
  mmHlasG(`${n.n} sesílá ${x.en} – čeká se, zda ${H.map(h=>h.n).join(" nebo ")} použije Counterspell.`,5000);return true}
function bojProtiHtml(){const L=Object.entries(BPROT);if(!L.length)return "";
  return L.map(([id,P])=>`<section class="bmor bkonc bprot"><b>Counterspell?</b> ${besc(P.n)} sesílá <b>${besc(P.sp)}</b> – čeká se na ${besc(Object.values(P.map).map(h=>bojJm(BOJ.s||{},h)).join(", "))}. <button type="button" class="gbtn ghost" data-bprotdal="${id}">Pokračovat bez protikouzla</button></section>`).join("")}
function bojProtiZpracuj(){if(!GMV)return;Object.keys(BPROT).forEach(id=>{const P=BPROT[id],v=VYZVY.find(x=>x.id===+id);if(!v)return;const od=v.odpovedi||{},kdo=Object.keys(P.map);
  const pouz=kdo.find(k=>od[k]&&+od[k].tot>0);if(pouz){delete BPROT[id];MMDB.vyzvaZavri(+id).catch(()=>{});const s=BOJ.s||{},n=(s.npc||[]).find(q=>q.id===P.nid),E=n&&bojEff(n),dc=+od[pouz].d||0,hn=bojJm(s,P.map[pouz]);
    const Z=n&&E&&dc?bojNpcZach(n,E,"CON",dc,true):null;
    if(Z&&!Z.ok){if(P.zn){const o=bojZdr.get(),u=o[P.nid]||{};if(u[P.zn])u[P.zn]--;bojZdr.set(o)}bojLog(P.nid,{n:P.sp,ai:P.map[pouz],zt:`${hn}: Counterspell – ${n.n} ${Z.txt} proti SO ${dc} neuspěl, kouzlo selhalo`},n.n);bojZaz({a:hn,ai:P.map[pouz],c:n.n,ci:P.nid,cim:"Counterspell",v:`${P.sp} selhalo`});mmHlasG(`${hn}: Counterspell – ${P.sp} selhalo (${n.n} ${Z.txt}).`,6000);renderBoj()}
    else{if(n)bojLog(P.nid,{n:P.sp,ai:P.map[pouz],zt:`${hn}: Counterspell – ${n.n} ${Z?Z.txt:"záchrana"} proti SO ${dc} uspěl, kouzlo projde`},n.n);mmHlasG(`${hn}: Counterspell nevyšel – ${P.sp} projde.`,5000);P.dal()}return}
  if(kdo.every(k=>od[k])){delete BPROT[id];MMDB.vyzvaZavri(+id).catch(()=>{});P.dal()}})}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bprotdal]");if(!b)return;const P=BPROT[b.dataset.bprotdal];if(!P)return;delete BPROT[b.dataset.bprotdal];MMDB.vyzvaZavri(+b.dataset.bprotdal).catch(()=>{});P.dal()});
/* hráč: odpověď na nabídku Counterspell – použití sešle Counterspell z karty (slot 3. st. nebo vyšší, reakce) */
const vyzvaProti=d=>d&&d.typ==="hod"&&String(d.pozn||"").startsWith(KZPROT);
async function vyzvaProtiOdpoved(v,K,pouzit){let r={tot:0,txt:"nechal být"};
  if(pouzit){const x=kSeznam(K).find(q=>q.n==="Counterspell");if(!x||await kartaSeslat(K,x)===false)return null;const s=BOJ.s||{},h=(s.hraci||[]).find(q=>bojKartaH(q)===K);
    if(h)bojHracAkce(h.id,(hh,z)=>{z.reak=z.reak||{};z.reak[h.id]=1});r={tot:1,d:Math.max(0,Math.min(100,kSpDC(K,x)||0)),txt:`Counterspell, SO ${kSpDC(K,x)}`}}
  return r}

/* ===== Další kouzla (2026-10-20 b): léčení a obnova, zbraňová kouzla, obrana a reakce, vyvolaní tvorové =====
   kVyber – malá nabídka s tlačítky (podoba vyvolaného tvora, stav k ukončení); vrací Promise s volbou nebo null */
function kVyber(nadpis,moznosti){return new Promise(res=>{let hot=false;const d=mmPop(`<div class="kvyb"><h3 class="uvh2">${besc(nadpis)}</h3><p>${moznosti.map((m,i)=>`<button type="button" class="gbtn" data-kvyb="${i}">${besc(m)}</button>`).join(" ")}</p></div>`);
  const fin=v=>{if(hot)return;hot=true;document.removeEventListener("click",h,true);mmPopX();res(v)};
  const h=e=>{const b=e.target.closest&&e.target.closest("[data-kvyb],[data-mmpopx]");if(!b){if(e.target.classList&&e.target.classList.contains("mmpop"))fin(null);return}e.preventDefault();e.stopPropagation();fin(b.dataset.kvyb!=null?moznosti[+b.dataset.kvyb]:null)};
  document.addEventListener("click",h,true)})}
/* ---- léčení a obnova (seslání s cíli z družiny) ---- */
const KZLEC={"Heal":{hp:70,up:[6,10],st:["oslepen","ohlušen","otrávený"]},"Mass Heal":{hp:700,rozdel:1,st:["oslepen","ohlušen","otrávený"]},
  "Power Word Heal":{hp:"max",st:["okouzlen","vyděšený","ochromen","otrávený","omráčen"]},"Prayer of Healing":{x:"2d8",up:[2,"1d8"]},
  "Spare the Dying":{stab:1},"Revivify":{ozivit:1},"Lesser Restoration":{vyber:["oslepen","ohlušen","ochromen","otrávený"]},
  "Greater Restoration":{vyber:["okouzlen","zkamenělý","vyčerpání −1"]},"Dispel Magic":{rozptyl:1}};
const kBojH=K=>((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K);
async function kStavyOdeber(C,L,od){const S=kartaStav(C.id),h=kBojH(C),ma=[...new Set([...(S.stavy||[]),...((h&&h.stav)||[])])].filter(x=>L.includes(x));if(!ma.length)return [];
  if(!(GMV||kMuze(C))){mmHlasG(`${C.n}: ${ma.join(", ")} – stav zruší vypravěč nebo hráč postavy (k jeho kartě nemáš přístup).`,5000);return ma}
  const st=(S.stavy||[]).filter(x=>!ma.includes(x));if((S.stavy||[]).length!==st.length)await kartaStavZmen(C.id,{stavy:st.length?st:null},null);
  if(h)bojHracAkce(h.id,x=>{x.stav=(x.stav||[]).filter(q=>!ma.includes(q));if(!x.stav.length)delete x.stav;(x.ef||[]).filter(e=>ma.includes(e.st)).forEach(e=>bojEfDel(x,e))});
  kHodZapis({k:C.id,kdo:C.n,co:`${od}: stav končí`,txt:ma.join(", ")});return ma}
/* vrací true, když kouzlo obsloužilo celé (jinak pokračuje běžné seslání v kSesDlgOk) */
async function kSesSpec(K,x,lvl,C,N){const nm=x.n,o=KZLEC[nm];
  if(!o)return false;if(o.rozptyl){if(N&&N.length&&GMV){await bojZmen(z=>N.forEach(n0=>{const n=(z.npc||[]).find(q=>q.id===n0.id);if(n)bojEfZnac(z,n,"Dispel Magic",{h:null})}));mmHlasG(`${nm}: kouzla na cíli končí (u kouzel nad ${lvl}. stupněm ověř sesílací vlastnost proti SO 10 + stupeň).`,5000)}return !!(N&&N.length&&GMV)}
  if(!C.length){mmHlasG(`${nm}: vyber cíl z družiny.`,3000);return true}
  const zprava=[];
  if(o.hp!=null||o.x){let zb=o.rozdel?o.hp:null;const r=o.x?kVyraz(kzZr({z:o.x,up:o.up},lvl,0)):null;
    for(const c of C){const S=kartaStav(c.id),mx=kHPmax(c),cur=kHpOf(c,S),chybi=Math.max(0,mx-cur);let n=o.hp==="max"?chybi:o.rozdel?Math.min(chybi,zb):o.x?(r?r.tot:0):o.hp+(o.up&&lvl>o.up[0]?(lvl-o.up[0])*o.up[1]:0);
      if(o.rozdel)zb-=n;if(n>0)await kLecKarta(c,n,K,nm);zprava.push(`${c.n} +${n}`);if(o.st)await kStavyOdeber(c,o.st,nm)}
    if(r)kHodZapis({k:K.id,kdo:K.n,co:`${nm} – léčení`,tot:r.tot,txt:r.txt})}
  if(o.stab||o.ozivit)for(const c of C){const h=kBojH(c);if(!h){mmHlasG(`${c.n}: ${o.stab?"stabilizaci":"oživení"} zapiš na kartě (mimo boj).`,4000);continue}
    if(o.stab&&!(h.ds&&h.ds.st!=="mrtev")){mmHlasG(`${c.n} neleží v bezvědomí – ${nm} nemá účinek.`,3500);continue}
    if(o.ozivit&&!(h.ds&&h.ds.st==="mrtev")){mmHlasG(`${c.n} není mrtvý – ${nm} nemá účinek.`,3500);continue}
    if(GMV||kMuze(c)){if(o.stab)bojHracAkce(h.id,q=>{q.ds={u:3,n:(q.ds&&q.ds.n)||0,st:"stab"}});else bojPCZmena(h.id,q=>{q.ds=undefined;q.hp=1;return "oživen s 1 HP"});zprava.push(`${c.n}: ${o.stab?"stabilizován":"oživen s 1 HP"}`)}
    else mmHlasG(`${c.n}: ${nm} – zapíše vypravěč.`,4000)}
  if(o.vyber)for(const c of C){const S=kartaStav(c.id),h=kBojH(c),ma=[...new Set([...(S.stavy||[]),...((h&&h.stav)||[])])].filter(q=>o.vyber.includes(q));const vy=o.vyber.includes("vyčerpání −1")&&+S.vycerp>0;
    const L=[...ma,...(vy?["vyčerpání −1"]:[])];if(!L.length){mmHlasG(`${c.n}: nemá žádný stav, který ${nm} ukončí.`,3500);continue}
    const v=L.length===1?L[0]:await kVyber(`${nm}: co ukončit u ${c.n}?`,L);if(!v)continue;
    if(v==="vyčerpání −1"){if(GMV||kMuze(c)){await kartaStavZmen(c.id,{vycerp:+S.vycerp>1?+S.vycerp-1:null},`${c.n}: vyčerpání −1.`);zprava.push(`${c.n}: vyčerpání −1`)}}else{await kStavyOdeber(c,[v],nm);zprava.push(`${c.n}: ${v} končí`)}}
  if(zprava.length)mmHlasG(`${K.n} – ${nm}: ${zprava.join(" · ")}.`,5000);return true}

/* ---- zbraňová kouzla jako přídavky k útoku zbraní (kEfekty): Magic Weapon a Elemental Weapon samy, dokud trvají;
   True Strike, Shillelagh, Green-Flame Blade a Booming Blade se zaškrtnou k útoku (sesílací vlastnost místo STR/AGI, kostky podle úrovně) ---- */
const kZbrAb=(K,a)=>{const vl=String((a&&a.vl||[]).join(" ")+" "+((a&&a.p)||"")),s=kMd(K,"STR"),g=kMd(K,"AGI");return a&&a.dal?g:/finesse|jemn/i.test(vl)?Math.max(s,g):s};
function kEfKouzla(K){const L=[],nm=new Set(kSeznam(K).map(x=>String(x.n).toLowerCase())),zna=n=>nm.has(n.toLowerCase()),uc=kUc(K),akt=n=>uc.find(u=>kzJm(u.n)===n&&!/ ⇒ /.test(u.n||"")),ul=kLv(K),tier=ul>=17?3:ul>=11?2:ul>=5?1:0,sm=kSpMod(K);
  {const u=akt("Magic Weapon");if(u){const l=kzSt(u.n)||2,b=l>=6?3:l>=3?2:1;L.push({n:`Magic Weapon +${b}`,ut:b,zr:b,auto:1,pozn:`kouzlo trvá: +${b} k útoku a zranění zbraní`})}}
  {const u=akt("Elemental Weapon");if(u){const l=kzSt(u.n)||3,b=l>=7?3:l>=5?2:1;L.push({n:`Elemental Weapon +${b}`,ut:b,zr:`${b}d4`,auto:1,pozn:`kouzlo trvá: +${b} k útoku a +${b}d4 zvoleného typu (Acid, Cold, Fire, Lightning, Thunder)`})}}
  if(zna("True Strike"))L.push({n:"True Strike",f:a=>({ut:sm-kZbrAb(K,a),zr:tier?`${tier}d6`:sm-kZbrAb(K,a)}),t:tier?"Radiant":"",pozn:`útok zbraní se sesílací vlastností místo STR/AGI${tier?`, +${tier}d6 Radiant`:""} (seslání triku je součástí útoku)`});
  if(zna("Shillelagh")||akt("Shillelagh"))L.push({n:"Shillelagh",auto:!!akt("Shillelagh"),jen:a=>/club|quarterstaff|kyj|hůl|palice/i.test(String(a&&a.n||"")),f:a=>({ut:sm-kMd(K,"STR"),zr:sm-kMd(K,"STR")}),pozn:`kyj nebo hůl: útok a zranění se sesílací vlastností, kostka zranění ${ul>=17?"2d6":ul>=11?"d12":ul>=5?"d10":"d8"} (oprav, je-li zbraň menší)`});
  if(zna("Green-Flame Blade"))L.push({n:"Green-Flame Blade",blizko:1,zr:tier?`${tier}d8`:0,t:"Fire",pozn:`zásah zblízka${tier?` +${tier}d8 Fire`:""}; jiná bytost do 5 stop od cíle utrpí ${tier?`${tier}d8 + `:""}${sm} Fire`});
  if(zna("Booming Blade"))L.push({n:"Booming Blade",blizko:1,zr:tier?`${tier}d8`:0,t:"Thunder",pozn:`zásah zblízka${tier?` +${tier}d8 Thunder`:""}; pohne-li se cíl dobrovolně před tvým dalším tahem, utrpí ${tier+1}d8 Thunder`});
  return L}

/* ---- vyvolaní tvorové: seslání vytvoří společníka na kartě (AC, HP a útoky podle stupně, útok = tvůj útok kouzlem), v boji ho rovnou pošle do boje;
   s koncem kouzla (soustředění, trvání) zmizí. ⌊L/2⌋ útoků za akci. ---- */
const KZSUM={
  "Summon Beast":{min:2,v:{"Pozemní":{hp:30},"Vzdušný":{hp:20},"Vodní":{hp:30}},ac:l=>11+l,hp:(b,l)=>b+5*(l-2),ut:[{n:"Rend",z:l=>`1d8+${4+l}`,t:"Piercing"}]},
  "Summon Fey":{min:3,v:{"Rozzlobený":{},"Veselý":{},"Lstivý":{}},ac:l=>12+l,hp:(b,l)=>30+10*(l-3),ut:[{n:"Fey Blade",z:l=>`2d6+${3+l}`,t:"Force"}]},
  "Summon Undead":{min:3,v:{"Přízračný":{hp:30,ut:[{n:"Deathly Touch",z:l=>`1d8+${3+l}`,t:"Necrotic"}]},"Hnilobný":{hp:30,ut:[{n:"Rotting Claw",z:l=>`1d6+${3+l}`,t:"Slashing"}]},"Kostlivý":{hp:20,ut:[{n:"Grave Bolt",z:l=>`2d4+${3+l}`,t:"Necrotic"}]}},ac:l=>11+l,hp:(b,l)=>b+10*(l-3)},
  "Summon Aberration":{min:4,v:{"Beholderkin":{ut:[{n:"Eye Ray",z:l=>`1d8+${3+l}`,t:"Psychic"}]},"Slaad":{ut:[{n:"Claws",z:l=>`1d10+${3+l}`,t:"Slashing"}]},"Mind Flayer":{ut:[{n:"Psychic Slam",z:l=>`1d8+${3+l}`,t:"Psychic"}]}},ac:l=>11+l,hp:(b,l)=>40+10*(l-4)},
  "Summon Construct":{min:4,v:{"Hliněný":{},"Kovový":{},"Kamenný":{}},ac:l=>13+l,hp:(b,l)=>40+15*(l-4),ut:[{n:"Slam",z:l=>`1d8+${4+l}`,t:"Bludgeoning"}]},
  "Summon Elemental":{min:4,v:{"Zemní":{t:"Bludgeoning"},"Vodní":{t:"Cold"},"Vzdušný":{t:"Lightning"},"Ohnivý":{t:"Fire"}},ac:l=>11+l,hp:(b,l)=>50+10*(l-4),ut:[{n:"Slam",z:l=>`1d10+${4+l}`,t:"Bludgeoning"}]},
  "Summon Celestial":{min:5,v:{"Mstitel":{ut:[{n:"Radiant Bow",z:l=>`2d6+${2+l}`,t:"Radiant"}]},"Obránce":{ac:2,ut:[{n:"Radiant Mace",z:l=>`1d10+${3+l}`,t:"Radiant"}]}},ac:l=>11+l,hp:(b,l)=>40+10*(l-5)},
  "Summon Fiend":{min:6,v:{"Démon":{hp:50,ut:[{n:"Bite",z:l=>`1d12+${3+l}`,t:"Necrotic"}]},"Ďábel":{hp:40,ut:[{n:"Hurl Flame",z:l=>`2d6+${3+l}`,t:"Fire"}]},"Yugoloth":{hp:60,ut:[{n:"Claws",z:l=>`1d8+${3+l}`,t:"Slashing"}]}},ac:l=>12+l,hp:(b,l)=>b+15*(l-6)},
  "Summon Dragon":{min:5,v:{"Drak":{}},ac:l=>14+l,hp:(b,l)=>50+10*(l-5),ut:[{n:"Rend",z:l=>`1d6+${4+l}`,t:"Piercing"}]},
  "Summon Shadowspawn":{min:3,v:{"Hněv":{},"Zoufalství":{},"Strach":{}},ac:l=>11+l,hp:(b,l)=>35+15*(l-3),ut:[{n:"Chilling Rend",z:l=>`1d12+${3+l}`,t:"Cold"}]},
  "Giant Insect":{min:4,v:{"Stonožka":{},"Pavouk":{},"Vosa":{}},ac:l=>11+l,hp:(b,l)=>30+10*(l-4),ut:[{n:"Poison Jab",z:l=>`1d6+${3+l}`,t:"Piercing"}]},
  "Find Steed":{min:2,v:{"Nebešťan":{t:"Radiant"},"Víla":{t:"Psychic"},"Běs":{t:"Necrotic"}},ac:l=>10+l,hp:(b,l)=>5+10*l,ut:[{n:"Otherworldly Slam",z:l=>`1d8+${l}`,t:"Radiant"}],jeden:1}};
async function kSumNovy(K,x,lvl){const D=KZSUM[x.n];if(!D)return;const l=Math.max(D.min,lvl||D.min),vs=Object.keys(D.v),vn=vs.length===1?vs[0]:await kVyber(`${x.n}: jaká podoba?`,vs);if(!vn)return;const V=D.v[vn];
  const hp=Math.max(1,Math.round(D.hp(V.hp||0,l))),ac=D.ac(l)+(V.ac||0),ut=(V.ut||D.ut).map(a=>({n:a.n,b:Math.max(-5,Math.min(30,kSpUt(K))),z:a.z(l),t:V.t&&a.n!=="Rend"?V.t:a.t}));
  const S=kartaStav(K.id),L=(S.spol||[]).filter(s=>s.kz!==x.n),n=`${x.n.replace(/^Summon |^Find /,"")} – ${vn}`.slice(0,60);
  L.push({n,druh:"vyvolaný tvor",hp,max:hp,ac,ut,kz:x.n,pozn:`${x.n} (${l}. st.): útoků za akci ${D.jeden?1:Math.max(1,Math.floor(l/2))}; jedná hned po tobě. Zmizí s koncem kouzla.`});
  await kartaStavZmen(K.id,{spol:L.slice(-8)},`${K.n}: ${n} – AC ${ac}, HP ${hp}.`);
  const B=typeof kSpolBoj==="function"?kSpolBoj(K):null,i=L.length-1;
  if(B){const sid=kSpolId(K,i),o={id:sid,n,ac,hpc:hp,hpm:hp,ut:ut.map(a=>Object.assign({n:a.n.slice(0,40),b:a.b},/^[0-9]{0,2}d[0-9]{1,3}([+-][0-9]{1,2})?$/.test(a.z)?{z:a.z}:{},BZTYPY.includes(a.t)?{t:a.t}:{}))};try{await bojDB.hrac(B.me.id,"spol",o);mmHlasG(`${n} je v boji jako spojenec.`,3500)}catch(e){}}
  else if(GMV&&BOJ.s&&BOJ.s.aktivni&&kBojH(K)){const h=kBojH(K),sid=kSpolId(K,i);await bojZmen(z=>{z.npc=(z.npc||[]).filter(q=>q.id!==sid);z.npc.push({id:sid,n,str:"h",druh:"pacholek",vl:h.id,spol:true,ac,hpc:hp,hpm:hp,ut})})}}
/* konec kouzla: vyvolaný tvor zmizí z karty i z boje */
async function kSumKonec(K,jm){const S=kartaStav(K.id),L=S.spol||[],pryc=L.map((s,i)=>[s,i]).filter(([s])=>s.kz&&jm.includes(s.kz));if(!pryc.length)return;
  const B=typeof kSpolBoj==="function"?kSpolBoj(K):null;for(const [,i] of pryc){const sid=kSpolId(K,i);try{if(B)await bojDB.hrac(B.me.id,"spol",{id:sid,x:true});else if(GMV&&BOJ.s&&BOJ.s.aktivni)await bojZmen(z=>{z.npc=(z.npc||[]).filter(q=>q.id!==sid)})}catch(e){}}
  const zb=L.filter(s=>!(s.kz&&jm.includes(s.kz)));await kartaStavZmen(K.id,{spol:zb.length?zb:null},`${K.n}: ${pryc.map(([s])=>s.n).join(", ")} mizí – kouzlo skončilo.`)}

/* ---- obranná kouzla: Blade Ward (útoky proti postavě −1d4), Blink (na konci tahu d6) ---- */
Object.assign(KZEF,{"Blade Ward":{utMinus:1,p:"útoky proti tobě −1d4"},"Blink":{blink:1,p:"na konci každého tvého tahu d6: 4–6 odejdeš do Éteru do začátku dalšího tahu"},
  "Enhance Ability":{p:"výhoda na ověření zvolené vlastnosti"},"Resistance":{p:"zranění zvoleného typu −1d4, jednou za tah"},"Magic Weapon":{p:"zbraň +1 k útoku a zranění (+2 ze slotu 3.–5., +3 ze slotu 6+)"},
  "Elemental Weapon":{p:"zbraň +1 k útoku a +1d4 zvoleného typu (vyšší sloty víc)"},"Shillelagh":{p:"kyj nebo hůl: sesílací vlastnost, větší kostka zranění"}});
const kBufUtMinus=K=>K&&kBufEf(K).some(b=>b.e.utMinus);
function bojBufKonecTahu(s,h){if(!GMV)return;const K=bojKartaH(h);if(!K||!kBufEf(K).some(b=>b.e.blink))return;const d=bK(6);bojMsg(h.id,`Blink: d6 ${d} → ${d>=4?"odchází do Éteru do začátku svého dalšího tahu":"zůstává"}.`);bojLog(h.id,{n:"Blink",ci:h.id,zt:`d6 ${d} – ${d>=4?"v Éteru":"zůstává"}`},h.n)}

/* ===== Kouzla na účastnících boje (2026-10-20 c): ikony pod slotem iniciativy, v kartě NPC a v seznamech =====
   NPC: značky kouzel (n.ef bez stavu – Hex, Bane, Hunter's Mark…); postava: značky v boji, posílení od druhých (kBufy) a vlastní posílení (KZEF) */
const KZIK={"Bless":"bless","Guidance":"bless","Bane":"bane","Heroism":"posileni","Aid":"posileni","Beacon of Hope":"posileni",
  "Death Ward":"ochrana","Shield of Faith":"ochrana","Warding Bond":"ochrana","Protection from Evil and Good":"ochrana","Holy Aura":"ochrana","Sanctuary":"ochrana",
  "Hex":"hex","Hunter's Mark":"lovec","Faerie Fire":"faerie","Haste":"haste","Slow":"slow",
  "Longstrider":"pohyb","Fly":"pohyb","Spider Climb":"pohyb","Freedom of Movement":"pohyb","Expeditious Retreat":"pohyb","Jump":"pohyb",
  "Blur":"zmizeni","Mirror Image":"zmizeni","Blink":"zmizeni","Invisibility":"neviditelny","Greater Invisibility":"neviditelny",
  "Barkskin":"kuze","Stoneskin":"kuze","Mage Armor":"kuze","Armor of Agathys":"kuze","False Life":"kuze","Enlarge/Reduce":"velikost",
  "Enhance Ability":"vyhoda","Blade Ward":"zb-stit","Resistance":"zb-stit","Protection from Energy":"zb-stit",
  "Spirit Guardians":"zr-radiant","Moonbeam":"zr-radiant","Magic Weapon":"zr-magicke","Elemental Weapon":"zr-magicke","Shillelagh":"zr-magicke","Witch Bolt":"zr-lightning","Heat Metal":"zr-fire"};
function bojKzEf(s,id){const R=[],add=(n,od,pozn,zb)=>{n=kzJm(String(n||"").replace(/^Účinek:\s*/,""));if(!n||R.some(r=>r.n===n))return;R.push({n,od:od||"",pozn:pozn||"",zb})};
  const n=(s.npc||[]).find(x=>x.id===id);
  if(n){(n.ef||[]).filter(e=>!e.st).forEach(e=>add(e.n,bojJm(s,e.od||e.src),e.z?`na začátku tahu ${e.z} ${BZRT[e.t]||e.t||""}`:"",e.kdy==="kola"?e.k:null));return R}
  const h=(s.hraci||[]).find(x=>x.id===id);if(!h)return R;(h.ef||[]).filter(e=>!e.st).forEach(e=>add(e.n,bojJm(s,e.od||e.src),"",e.kdy==="kola"?e.k:null));
  const K=bojKartaH(h);if(K){(typeof kBufy==="function"?kBufy(K):[]).forEach(b=>add(b.n,b.od,(KZEF[b.n]||{}).p||((typeof KPRID!=="undefined"&&KPRID.find(q=>q[0]===b.n))||[])[3]||""));kBufEf(K).filter(b=>b.vl).forEach(b=>add(b.n,"",b.e.p||""))}
  return R}
function bojKzIkHtml(s,id,tr){const L=s?bojKzEf(s,id):[];if(!L.length)return "";
  return `<span class="bkzikw${tr?" "+tr:""}">${L.slice(0,3).map(e=>`<span class="bkzik" role="img" aria-label="${besc(e.n)}" ${btip(`Kouzlo ${e.n}${e.od?` – od ${e.od}`:""}${e.zb!=null?` · ještě ${e.zb} ${e.zb===1?"kolo":e.zb<5?"kola":"kol"}`:""}${e.pozn?` · ${e.pozn}`:""}`)}><img src="art/img/boj/${KZIK[e.n]||"zr-magicke"}-48.webp" width="24" height="24" alt="" aria-hidden="true" decoding="async"></span>`).join("")}${L.length>3?`<b ${btip(L.slice(3).map(e=>e.n).join(", "))}>+${L.length-3}</b>`:""}</span>`}
