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
function jaBezKartyHtml(){const volne=KARTY.filter(k=>!KZAM.has(k.id)&&!k.test);
  return `<section><h3 class="uvh2">Vítej, ${besc(DCU.jmeno||"hráči")}</h3><p>Nahraj list své postavy z D&amp;D Beyond (postava → <i>Export to PDF</i>). Karta se vytvoří a zůstane tvoje.</p>
    <label class="gbtn"><input type="file" accept="application/pdf,.pdf" data-kimphra hidden>Nahrát PDF z D&amp;D Beyond…</label>${KIMP?kImpNahled(KIMP,true):""}
    ${volne.length?`<details class="bjapd"><summary>Nebo zvol kartu, kterou už nahrál vypravěč</summary><ul class="kfeat">${volne.map(k=>`<li><b>${besc(k.n)}</b> <small>${besc(k.povolani||"")}</small> <button type="button" class="gbtn ghost" data-jazvol="${besc(k.id)}">Hrát za tuto postavu</button></li>`).join("")}</ul></details>`:""}
    <p class="bojbtn"><button type="button" class="gbtn ghost" data-discordx>Odhlásit Discord</button></p></section>`}
/* ---- texty rysů (soukromé) a rejstřík rysů SRD ---- */
const KTX={},KTXP={};let SRDRY=null;
const srdRysy=()=>SRDRY?Promise.resolve(SRDRY):fetch("art/srd-rysy.json").then(r=>r.json()).then(d=>SRDRY=d).catch(()=>SRDRY={});
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
function kAkceG(K,bezUt){const D=kDopl(K),sez=kSeznam(K),sl=kSloty(K),U=kartaStav(K.id).zdr||{};const G={A:[],BA:[],R:[],X:[]};
  if(!bezUt)kUtoky(K).forEach((a,i)=>G[a.cas||"A"].push(`<li><b>${besc(a.n)}</b>${a.pocet>1?` <small>${a.pocet}×</small>`:""} <button type="button" class="gbtn ghost" data-khod="ut:${i}">Útok ${bsg(+a.b||0)}</button>${a.z?`<button type="button" class="gbtn ghost" data-kzr="${i}">${besc(a.z)} ${besc(BZRT[a.t]||a.t||"")}</button>`:""}${kMunTxt(K,a)}</li>`));
  sez.forEach((x,i)=>{if(x.st>0&&!sl.some(q=>q.st>=x.st&&q.u<q.max))return;G[kCasKouzla(x)].push(`<li><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button> <small>${x.st?x.st+". st.":"trik"}${x.kon?" · ◎":""}</small> ${kSesHtml(K,x,i)}</li>`)});
  [...((K.rysy2||[]).filter(r=>r.cas||r.max)),...(D.rysy||[])].forEach(r=>{const u=Math.min(r.max||0,+(U[r.n]||0));G[r.cas||"X"].push(`<li><button type="button" class="kspn" data-krys="${besc(r.n)}">${besc(r.n)}</button>${r.max?` <span class="bzd">${[...Array(r.max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(r.n)}" data-j="${j}" aria-label="${besc(r.n)} ${j+1}"></button>`).join("")}</span>`:""}</li>`)});
  kTech(K).forEach(id=>{const t=STBY[id];G[/reakce/.test(t.c)?"R":/bonusov/.test(t.c)?"BA":"X"].push(`<li><button type="button" class="kspn" data-ktech="${t.id}">${besc(t.n)}</button> <small>${besc(t.c)}</small></li>`)});
  G.R.push(`<li><b>Příležitostný útok</b> <small>když nepřítel opouští tvůj dosah</small></li>`);
  return G}
function kAkceHtml(K,bezUt){const G=kAkceG(K,bezUt);
  return `<div class="kakcegrid">${["A","BA","R","X"].map(k=>`<section><h3 class="uvh2">${KCAS[k]}</h3>${G[k].length?`<ul class="kakl">${G[k].join("")}</ul>`:`<p class="rsmall">–</p>`}${k==="A"?`<details class="bjapd"><summary>Běžné akce</summary><dl class="kakce">${BAKCE.map(a=>`<dt>${a[0]} <small>${a[1]}</small></dt><dd>${besc(a[2])}</dd>`).join("")}</dl></details>`:""}</section>`).join("")}</div>`}
/* ---- útoky a doplňky hráče ---- */
const kDopl=K=>kartaStav(K.id).dopl||{};
/* ---- kouzla: seznam (PDF + připravená − odebraná), sesílání se zvoleným slotem, zranění a léčení se škálováním ---- */
function kSeznam(K){const S=kartaStav(K.id),kx=new Set(S.kpx||[]),zak=((K.kouzla||{}).seznam||[]).filter(x=>!kx.has(x.n)||x.vzdy);
  (S.kpn||[]).forEach(n=>{if(zak.some(x=>x.n===n))return;const d=kSp(n);zak.push(d?{n:d.en,st:d.l,kon:!!d.ko,cas:d.ct,dosah:d.r,trvani:d.d,nove:1}:{n,st:1,nove:1})});return zak}
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
function kSesHtml(K,x,i){const sl=kSloty(K).filter(q=>q.st>=x.st&&q.u<q.max),uc=x.st>0?(sl[0]||null):null,lvl=uc?uc.st:x.st;
  const sel=x.st>0&&sl.length>1?`<select data-kslot="${i}" aria-label="Slot pro ${besc(x.n)}">${sl.map(q=>`<option value="${q.k}">${q.pakt?"pakt ":""}${q.st}. st. (${q.max-q.u})</option>`).join("")}</select>`:"";
  const E=kSpUcinek(K,x,lvl),kz=K.kouzla||{};
  return `${sel}${x.st>0||x.kon||x.zach?`<button type="button" class="gbtn ghost" data-kses="${i}">Seslat</button>`:""}${x.utok!=null||(E&&E.utok)?`<button type="button" class="gbtn ghost" data-khod="ks:${i}">Útok ${bsg(kSpU1(K,x))}</button>`:""}${E&&E.k==="l"?kCilHtml(K,i):""}${E?`<button type="button" class="gbtn ghost" data-kspz="${i}" ${btip("Hod se počítá se stupněm vybraného slotu")}>${E.k==="l"?"Léčení":"Zranění"} ${besc(E.x)}${E.mod?bsg(E.mod):""}${E.t?" "+besc(BZRT[E.t]||E.t):""}${E.pocet>1?` ×${E.pocet}`:""}</button>${E.zach?`<small> · záchrana ${E.zach} SO ${kSpDC(K)||"?"}${E.pol?", úspěch = polovina":""}</small>`:""}`:""}`}
/* léčení na kartu (2026-10-17): svou kartu (a kartu bez hesla) mění přímo, cizí přes mm_karta_lecit, který v boji stabilizuje umírajícího */
const KCIL={};
const kCilHtml=(K,i)=>{const L=(KARTY||[]).filter(k=>k.id!==K.id&&!k.test),v=KCIL[K.id+":"+i]||K.id;return `<select data-kcil="${i}" aria-label="Koho léčíš"><option value="${besc(K.id)}">sebe</option>${L.map(k=>`<option value="${besc(k.id)}"${v===k.id?" selected":""}>${besc(k.n)}</option>`).join("")}<option value="-"${v==="-"?" selected":""}>jen hod</option></select>`};
async function kLecKarta(K2,tot,od,co){if(!K2||!(tot>0))return;const S=kartaStav(K2.id),h0=((BOJ.s&&BOJ.s.aktivni&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K2);
  if(kMuze(K2)){if(h0){bojPCZmena(h0.id,x=>bojLecPC(x,K2,tot),true);return}const o={hp:S.hp,thp:S.thp},m=bojLecPC(o,K2,tot);await kartaStavZmen(K2.id,{hp:o.hp!=null&&o.hp<kHPmax(K2)?o.hp:null},`${K2.n}: ${m}.`);return}
  if(!window.MMDB||!MMDB.kartaLecit){mmHlasG(`${K2.n}: léčení zapiš na jeho kartě.`,4000);return}
  try{await MMDB.kartaLecit(K2.id,Math.min(300,Math.round(tot)),kHPmax(K2),od.id);await kartyNacti();if(BOJ.s&&BOJ.s.aktivni){BOJ.v=-2;try{await bojNacti()}catch(e){}}mmHlasG(`${K2.n}: +${tot} HP (${co}).`,5000)}
  catch(e){mmHlasG("Léčení se nezapsalo: "+(e.message||e),6000)}}
/* ===== přídavky (2026-10-17): přídavky ke zranění z povolání a kouzel (Sneak Attack, Rage, Hunter's Mark, Hex, Divine Favor,
   Divine Smite se slotem) a kostky k hodům d20 (Bless, Bane, Guidance, Bardic Inspiration); trvalé přepínače v poli karty pri ===== */
const kPri=K=>kartaStav(K.id).pri||[];
const KPRID=[["Bless","1d4","ut za","+1d4 k útokům a záchranám"],["Bane","-1d4","ut za","−1d4 k útokům a záchranám"],["Guidance","1d4","ov","+1d4 k ověřením (zvolená dovednost)"],
  ["Bardic d6","1d6","ut za ov","kostka Bardic Inspiration – přičte se k dalšímu hodu d20 a spotřebuje",1],["Bardic d8","1d8","ut za ov","",1],["Bardic d10","1d10","ut za ov","",1],["Bardic d12","1d12","ut za ov","",1]];
function kPriHod(K,co){const typ=/^Útok/.test(co)?"ut":/^Záchrana/.test(co)?"za":/^Iniciativa/.test(co)?"in":"ov",P=kPri(K);let t=0;const L=[],sp=[];
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
  const K2=E.k==="l"&&cil!=="-"?(KARTBY[cil||K.id]||K):null;
  kHodZapis({k:K.id,kdo:K.n,co:`${E.k==="l"?"Léčení":"Zranění"} – ${x.n}${lvl>x.st?` (${lvl}. st.)`:""}${K2&&K2!==K?` → ${K2.n}`:""}`.slice(0,80),tot:Math.min(999,tot),txt:`${L.join(" | ")}${E.t?" "+(BZRT[E.t]||E.t):""}${krit?" (kritický zásah)":""}${E.zach?` · záchrana ${E.zach} SO ${kSpDC(K)||"?"}`:""}`.slice(0,290)});
  if(K2){await kLecKarta(K2,tot,K,x.n);return}
  mmHlasG(`${K.n}: ${x.n} – ${E.k==="l"?"léčení":"zranění"} ${tot}${cnt>1?` (${cnt}×)`:""}`,5000)}
/* ---- stavy mimo boj (ovlivňují hody z karty) ---- */
const KSTV=["otrávený","vyděšený","neviditelný","sražen","zadržen","chycen","oslepen","ohlušen","okouzlen","neschopný","ochromen","omráčen","zkamenělý","v bezvědomí","soustředí"];
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
