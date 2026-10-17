/* ===== Karta postavy podle Artikulí: duše (Svědomí, Ctnosti a Neřesti, vyznání, feat víry), Výdrž a techniky,
   účinky v herním čase, popisy kouzel, vlastní hod, přehled družiny, offline fronta (2026-10-16) ===== */
const KCTN={kr:["Pokora","Štědrost","Laskavost","Trpělivost","Cudnost","Střídmost","Píle"],old:["Pohostinství","Pravdomluvnost","Odvaha","Úcta k předkům","Respekt","Věrnost rodu","Čest"]};
const KNER={kr:["Pýcha","Lakomství","Závist","Hněv","Chtíč","Obžerství","Lenost"],old:["Zrada hosta","Křivopřísežnictví","Zbabělost","Nevděk","Hamižnost","Zrada rodu","Intrikaření"]};
const KVZN={kal:"kališník",kat:"katolík",old:"starověrec"};
const kNm=n=>String(n||"").replace(/^✦\s*/,"").trim();
const kVzPdf=K=>{const t=String((K.popis||{}).vira||"");return /kali|utraq|husit/i.test(t)?"kal":/katol|cathol|řím/i.test(t)?"kat":/staro|pohan|pagan|old faith/i.test(t)?"old":""};
function kParty(K){const d=(kartaStav(K.id).duse||{}).dr;return (d&&PARTY.find(p=>p.id===d))||PARTY.find(p=>kNm(p.n)===kNm(K.n))||null}
function kDuse(K){const S=kartaStav(K.id),D=S.duse||{},P=kParty(K)||{};
  return {vz:D.vz||P.faith||kVzPdf(K)||"",ctn:D.ctn||P.ctn||[],ner:D.ner||P.ner||[],fs:+D.fs||1,sv:S.sv!=null?+S.sv:(P.sv!=null?+P.sv:5),hr:+S.hr||0,sk:+S.sk||0,P:kParty(K),dr:D.dr||""}}
const kJmeno=K=>{const P=kParty(K);return P?kNm(P.n):K.n};
/* Svědomí mění některé hody (Artikule, Stavy svědomí) */
function kSvAdv(K,dov){const s=kDuse(K).sv,r=[];
  if(dov==="Deception"){if(s>=8)r.push([-1,"V milosti: nevýhoda na Deception"]);else if(s>=1&&s<=3)r.push([1,"Na scestí: výhoda na Deception"])}
  if(dov==="Insight"&&s>=8)r.push([1,"V milosti: výhoda na Insight"]);
  if(dov==="Intimidation"&&s<=0)r.push([1,"Zatracený: výhoda na Intimidation"]);
  return r}
const kAdvSum=(base,r)=>{const a=[base,...r.map(x=>x[0])],p=a.some(x=>x>0),m=a.some(x=>x<0);return p&&m?0:p?1:m?-1:0};
/* kostka Závoje podle vyznání postavy (svátky) a Hodin Závoje */
const kZavoj=(K,d)=>bojZavoj({vz:kDuse(K).vz,d});
const KZAV={};
/* feat víry (Artikule, Vyznání): [název, použití za dlouhý odpočinek (0 = bez počítadla), stupeň, popis] */
const KFEAT={kal:[["Přijímání podobojí",1,1,"1× za dlouhý odpočinek přijmi krev Boží: obnov slot kouzla až do stupně podle bonusu zdatnosti, nebo Výdrž až do poloviny bonusu zdatnosti."],["Pravda Páně",1,2,"Akce, 1× za dlouhý odpočinek: zjistíš, zda je cíl ovlivněn Závojem (anděl, démon či Proměněnec)."],["Ktož sú Boží bojovníci!",1,3,"Akce, 1× za dlouhý odpočinek: bojový chorál – spojenci v doslechu získají bonus d4 ke všem útokům i záchranám."]],
  kat:[["Přímluva patrona",3,1,"3× za dlouhý odpočinek: přímluva u světce – výhoda na hod podle jeho dovedností (sv. Jiří Acrobatics, Athletics · sv. Václav útok, Persuasion · sv. Ludmila Insight, Medicine · sv. Vojtěch Religion, Perception · sv. Kryštof Survival, Animal Handling)."],["Oroduj za nás",1,2,"Reakce, 1× za dlouhý odpočinek: ty nebo spojenec do 30 stop přehodí neúspěšnou záchranu."],["Ve jménu Páně!",1,3,"Akce, 1× za dlouhý odpočinek: pozvedneš kříž proti démonům a nemrtvým – nižší démony vyhostí, vyšší hází WIS záchranu, při neúspěchu jsou Frightened."]],
  old:[["Zřídlo místa",1,1,"Trik Druidcraft. Na místě se Starými bohy 1× za dlouhý odpočinek okamžitě získáš výhody krátkého odpočinku."],["Obětina",1,2,"1× za dlouhý odpočinek obětuješ Starému bohu něco cenného a smíš seslat kouzlo (podle volby vypravěče)."],["Vtělení",0,3,"Akce: vezmeš na sebe podobu podle svého Starého boha (Wild Shape), např. Morana – bílá vlčice z jinovatky."]]};
/* Výdrž (Artikule, Šerm a zápas): Fighter = bonus zdatnosti, Barbarian, Paladin, Ranger, Rogue, Monk polovina */
const KVYDP=[["Fighter",1],["Barbarian",.5],["Paladin",.5],["Ranger",.5],["Rogue",.5],["Monk",.5]];
/* Výdrž má jen bojová postava: hlavní povolání (nejvíc úrovní) je Fighter, Monk, Barbarian, Rogue, Ranger nebo Paladin */
function kVydMax(K){const pb=kPB(K),T=(kTridy(K)||[]).slice().sort((a,b)=>b.u-a.u),h=T[0];if(!h)return 0;const p=KVYDP.find(([c])=>c===h.n);return p?Math.max(1,Math.ceil(pb*p[1])):0}
const kVydU=K=>Math.min(kVydMax(K),+((kartaStav(K.id).zdr||{})["Výdrž"]||0));
/* techniky a chvaty: id, název, cena, Požehnání (1) / reakce (r) / bonusová akce (b), účinek */
const STECH=[
  {id:"zornhau",n:"Sek hněvu (Zornhau)",c:"1V + Požehnání",poz:1,t:"Sek s vazbou soupeřovy čepele: výhoda na následující útok proti tomuto cíli a on má proti tobě nevýhodu."},
  {id:"zwerchhau",n:"Křížný sek (Zwerchhau)",c:"1V + reakce",t:"Když tě zasáhne útok na blízko: +2 AC a okamžitý protiútok."},
  {id:"krumphau",n:"Křivý sek (Krumphau)",c:"1V + reakce + Pokušení nepřítele",t:"Útočí-li na tebe nepřítel s Pokušením, sekneš ho do rukou: STR záchrana – neúspěch: upustí zbraň a útok se neuskuteční; úspěch: dostaneš jen poloviční zranění."},
  {id:"schielhau",n:"Šilhavý sek (Schielhau)",c:"1V + Požehnání",poz:1,t:"Zlomíš nepřítelův sek – do konce svého příštího tahu má nevýhodu na útoky."},
  {id:"scheitelhau",n:"Dělný sek (Scheitelhau)",c:"1V + reakce",t:"Když nepřítel vstoupí do tvého dosahu: zaútočíš dřív a ustoupíš – útok a účinek Úhybu (Dodge)."},
  {id:"mordschlag",n:"Vražedný úder (Mordschlag)",c:"1V + bonusová akce",t:"Meč za čepel a úder záštitou: do konce tahu má zbraň Bludgeoning s vlastností Drtivá."},
  {id:"ringen",n:"Zápas s mečem (Ringen am Schwert)",c:"1V + Požehnání",poz:1,ch:1,t:"Po zásahu zbraní jdeš nepříteli do těla: STR/AGI záchrana – při neúspěchu Restrained nebo Prone (volíš ty)."},
  {id:"hodbok",n:"Hod přes bok",c:"1V + Požehnání",poz:1,ch:1,t:"Po zásahu Unarmed útokem: STR/AGI záchrana – při neúspěchu Restrained a Prone."},
  {id:"mordstosse",n:"Mordstösse",c:"1V + Požehnání",poz:1,ch:1,t:"Úder do hrdla nebo spánku: do konce svého příštího tahu cíl nemůže mluvit (ani kouzlit verbálně) a nemá reakci."},
  {id:"zustan",n:"Zůstaň!",c:"1V + Požehnání",poz:1,ch:1,t:"Cíl Prone nebo Restrained hází AGI záchranu: při neúspěchu je znehybněn do konce tvého příštího tahu."},
  {id:"bruch",n:"Zlom (Bruch)",c:"1V + reakce",ch:1,t:"Když tě soupeř povaluje, chytá nebo drží: Contested Roll s výhodou; při úspěchu se situace obrací."},
  {id:"lamani",n:"Lámání paže",c:"1V + reakce + Pokušení nepřítele",ch:1,t:"Když tě Restrained soupeř napadne: CON záchrana s nevýhodou, při neúspěchu zlomená paže (kritické zranění)."},
  {id:"zbran",n:"Zápas o zbraň",c:"1V + reakce",ch:1,t:"Útočí-li na tebe někdo lehkou zbraní (dýka): STR/AGI záchrana – při neúspěchu útok mine a zbraň máš ty."},
  {id:"harnisch",n:"Zápas ve zbroji (Ringen im Harnisch)",c:"1V + bonusová akce",ch:1,t:"Proti Restrained nebo Prone soupeři ignorují tvé útoky dýkou do konce tahu jakoukoli Resistance zbroje."}];
const STBY=Object.fromEntries(STECH.map(t=>[t.id,t]));
const kTech=K=>(kartaStav(K.id).tech||[]).filter(i=>STBY[i]);
function kTechMozne(K,poz){if(kVydU(K)>=kVydMax(K))return [];return kTech(K).map(i=>STBY[i]).filter(t=>!poz||t.poz)}
/* rány: neléčená kritická zranění z Boje (HRA.krit podle jména postavy) */
const kRany=K=>{const R=bojKritPC();return R[kJmeno(K)]||R[K.n]||[]};
/* ---- herní čas a účinky s trváním ---- */
const kTed=()=>{try{return cT(HRA)}catch(e){return null}};
const kTrv=t=>{t=String(t||"").toLowerCase();const m=t.match(/(\d+)\s*(kol|minut|hodin|hodinu|den|dn|dní)/);if(!m)return null;const n=+m[1];return /kol/.test(m[2])?n/600:/minut/.test(m[2])?n/60:/hod/.test(m[2])?n:n*24};
const kHodTxt=h=>h>=48?`${Math.round(h/24)} dní`:h>=24?`${Math.round(h/24)} den`:h>=1?`${Math.round(h*10)/10} h`.replace(".",","):`${Math.max(1,Math.round(h*60))} min`;
const kUc=K=>kartaStav(K.id).uc||[];
async function kUcPridej(K,n,h,kon){const t=kTed(),L=kUc(K).filter(x=>x.n!==n&&!(kon&&x.kon));const pad=kUc(K).filter(x=>kon&&x.kon&&x.n!==n);
  const o={n:String(n).slice(0,80)};if(h)o.h=Math.round(h*1000)/1000;if(h&&t!=null)o.do=Math.round((t+h)*1000)/1000;if(kon)o.kon=true;L.push(o);
  await kartaStavZmen(K.id,{uc:L.slice(-30)});if(pad.length)kHodZapis({k:K.id,kdo:K.n,co:"Soustředění končí",txt:pad.map(x=>x.n).join(", ")+` (nové: ${n})`})}
const KUCX=new Set();
function kUcVyprsi(K){const t=kTed();if(t==null)return;const L=kUc(K),pr=L.filter(x=>x.do!=null&&x.do<=t);if(!pr.length)return;const k=K.id+":"+pr.map(x=>x.n).join("|");if(KUCX.has(k))return;KUCX.add(k);
  kartaStavZmen(K.id,{uc:L.filter(x=>!(x.do!=null&&x.do<=t)).length?L.filter(x=>!(x.do!=null&&x.do<=t)):null},null,{bezZpet:true});kHodZapis({k:K.id,kdo:K.n,co:"Účinek vypršel",txt:pr.map(x=>x.n).join(", ")})}
function kUcHtml(K){const L=kUc(K),t=kTed();
  return `<h3 class="uvh2">Účinky <small>${t!=null?`herní čas ${besc(partyDate())}, ${HRA&&HRA.hodina!=null?HRA.hodina+":00":""}`:"herní čas nenastaven"}</small></h3>
    ${L.length?`<ul class="kuc">${L.map((x,i)=>{const z=x.do!=null&&t!=null?x.do-t:null;return `<li>${x.kon?`${kKonI()} `:""}<b>${besc(x.n)}</b> <small>${z!=null?(z<1?`méně než hodina (${kHodTxt(x.h||z)})`:`zbývá ${kHodTxt(z)}`):x.h?kHodTxt(x.h):"do odvolání"}</small> <button type="button" class="gbtn ghost" data-kucx="${i}" aria-label="Ukončit ${besc(x.n)}">ukončit</button></li>`}).join("")}</ul>`:`<p class="rsmall">Žádné účinky. Kouzla s trváním se přidají sama při seslání.</p>`}${(()=>{const B=typeof kBufy==="function"?kBufy(K).filter(b=>b.od!==K.n):[];return B.length?`<ul class="kuc kucod">${B.map(b=>`<li>${kKonI()} <b>${besc(b.n)}</b> <small>od ${besc(b.od)} · drží soustředění sesilatele</small></li>`).join("")}</ul>`:""})()}
    <p class="kvlh"><span class="kdusk">AC</span>${KUCAC.map((p,i)=>`<button type="button" class="gbtn ghost" data-kucac="${i}" ${btip(p[4])}>${p[0]}</button>`).join("")}<label><input type="checkbox" data-kbezstit${kartaStav(K.id).bezstit?" checked":""}> bez štítu (−2)</label> <b>AC ${kAC(K)}</b></p>
    <form class="kucf" data-kucf><input name="n" placeholder="účinek (např. Mage Armor)" maxlength="80" required><select name="h" aria-label="Trvání"><option value="0.0167">1 minuta</option><option value="0.1667">10 minut</option><option value="1" selected>1 hodina</option><option value="8">8 hodin</option><option value="24">24 hodin</option><option value="0">do odvolání</option></select><label><input type="checkbox" name="kon"> soustředění</label><button class="gbtn ghost">Přidat</button></form>
    <p class="rsmall">Vyprší podle herního času, který posouvá vypravěč (odpočinek družiny ho posune sám). Kratší účinky ukonči ručně.</p>`}
/* ---- popisy kouzel z art/kouzla.json (pro hráče jen kouzla jejich postavy) ---- */
let KSPD=null;
let KSPDP=null;const kSpNacti=()=>KSPD?Promise.resolve(KSPD):(KSPDP=KSPDP||kouzlaTxt().then(t=>{const d=JSON.parse(t),M={};d.forEach(x=>{M[x.en.toLowerCase()]=x});return KSPD=M}).catch(e=>{KSPDP=null;throw e}));
const kSp=n=>KSPD&&KSPD[String(n||"").toLowerCase().replace(/\s*\((ritual|rituál)\)\s*$/,"").trim()]||null;
const KSPO=new Set();
function kSpPopis(sp){const x=kSp(sp.n);if(!KSPD)return `<p class="rsmall">Načítám popis…</p>`;if(!x)return `<p class="rsmall">Kouzlo web nezná – popis najdeš v D&amp;D Beyond.</p>`;
  return `<div class="kspd${x.x?" kmimo":""}"><p class="rsmall"><b>${besc(x.cz||x.en)}</b> · ${kzUr(x.l)} · ${besc(x.s||"")} · ${besc(x.ct||"")} · ${besc(x.r||"")} · ${besc((x.k||[]).join(", "))}${x.m?` (${besc(x.m)})`:""} · ${besc(x.d||"")}${x.ri?" · rituál":""}</p>${kzMd(x.t)}${x.v?`<p><b>Na vyšší úrovni.</b> ${kzIn(x.v)}</p>`:""}</div>`}
/* ---- vlastní hod: 2d6+3, 4d6kh3, 2d20kl1, d%, s kostkou Závoje ---- */
function kVyraz(v){const s=String(v||"").toLowerCase().replace(/\s+/g,"").replace(/d%/g,"d100").replace(/[−–]/g,"-");if(!s||s.length>60||!/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(s))return null;
  let tot=0;const parts=[];let kostek=0;
  for(const m of s.matchAll(/([+-]?)(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/g)){const zn=m[1]==="-"?-1:1;
    if(m[3]){const n=+(m[2]||1),st=+m[3];if(n<1||n>100||st<2||st>1000)return null;kostek+=n;if(kostek>100)return null;const r=[...Array(n)].map(()=>bK(st));let keep=r.map((x,i)=>i);
      if(m[4]){const k=Math.max(1,Math.min(n,+m[5]));keep=r.map((x,i)=>[x,i]).sort((a,b)=>m[4]==="h"?b[0]-a[0]:a[0]-b[0]).slice(0,k).map(x=>x[1])}
      const sum=keep.reduce((a,i)=>a+r[i],0);tot+=zn*sum;parts.push(`${zn<0?"− ":parts.length?"+ ":""}${n}d${st}${m[4]?"k"+m[4]+m[5]:""} [${r.map((x,i)=>keep.includes(i)?x:`<s>${x}</s>`).join(", ")}]`)}
    else{tot+=zn*+m[6];parts.push(`${zn<0?"− ":parts.length?"+ ":""}${m[6]}`)}}
  return {tot,html:parts.join(" "),txt:parts.join(" ").replace(/<s>(\d+)<\/s>/g,"~$1")}}
async function kVlastniHod(kdo,kid,vyr,co,zav){const r=kVyraz(vyr);if(!r){mmHlasG("Neznám výraz – zkus např. 2d6+3, 4d6kh3, d20+5, d%.",4000);return null}
  const K=kid&&KARTBY[kid],z=zav?(K?kZavoj(K):bojZavoj(null)):null;const H={kdo:String(kdo||"Vypravěč").slice(0,60),co:String(co||vyr).slice(0,80),tot:Math.max(-50,Math.min(999,r.tot)),txt:`${vyr}: ${r.txt}`.slice(0,300)};if(kid)H.k=kid;if(z){H.zav=z.d;H.zr=z.r||"0"}
  if(K&&z)KZAV[K.id]={co:H.co,d:z.d,r:z.r,hod:z.hod};
  if(GMV&&window.KSKR){HODY.unshift(Object.assign({id:Date.now(),cas:new Date().toISOString(),skryty:true},H));kartyPrekresli()}else kHodZapis(H);
  mmHlasG(`${H.kdo}: ${H.co} = ${r.tot} (${r.txt})${z?` · ${zavTxt(z)}`:""}`,6500);return r}
const kHodForm=(K,id)=>`<form class="kvlh" data-kvlh${K?` data-k="${besc(K.id)}"`:""}><label>${K?"Vlastní hod":"Hod kostkou"} <input name="v" placeholder="2d6+3" maxlength="60" required autocomplete="off" list="kvlhl"></label><input name="co" placeholder="za co (nepovinné)" maxlength="60">${K?"":`<select name="kdo" aria-label="Kdo hází">${GMV?`<option value="">Vypravěč</option>`:""}${KARTY.map(k=>`<option value="${besc(k.id)}">${besc(k.n)}</option>`).join("")}</select>`}<label><input type="checkbox" name="zav"> + Závoj</label><button class="gbtn ghost">Hodit</button><label class="kmmk" ${btip("Hody se přehrají jako 3D kostky. Klepnutím kamkoli se animace přeskočí.")}><input type="checkbox" data-mmk${mmkZap()?" checked":""}> 3D kostky</label></form>
  <datalist id="kvlhl"><option value="d20"><option value="2d20kh1"><option value="2d20kl1"><option value="4d6kh3"><option value="d%"><option value="2d6"><option value="d4"></datalist>`;
/* ---- duše na kartě ---- */
function kDuseHtml(K){const D=kDuse(K),s=D.sv,kr=D.vz==="old"?"old":"kr",feat=(KFEAT[D.vz]||[]).filter(f=>f[2]<=D.fs),U=kartaStav(K.id).zdr||{};
  const opt=(L,sel)=>L.map(x=>`<option${sel===x?" selected":""}>${besc(x)}</option>`).join("");
  return `<section class="kduse"><h3 class="uvh2">Duše <a class="pmore" href="#artikule/svedomi">pravidla →</a></h3>
    <div class="kduhl">${D.vz?pFaith(D.vz):`<small>vyznání nezvoleno</small>`}${svMeter(s)}</div>
    ${D.ctn.length||D.ner.length?`<p class="chips">${D.ctn.map(c=>`<span class="chip ctn">${besc(c)}</span>`).join("")}${D.ner.map(c=>`<span class="chip ner">${besc(c)}</span>`).join("")}</p>`:""}
    <p class="rsmall ksvst">${s>=8?"Imunita vůči Frightened · výhoda na Insight · nevýhoda na Deception":s>=4?"Na vážkách – bez výhod i postihů":s>=1?"Výhoda na Deception · neklidné sny: dlouhý odpočinek obnoví jen polovinu HP":"Výhoda na Intimidation · Smlouva s ďáblem (1× za dlouhý odpočinek Závoj → Požehnání) · feat víry nefunguje"}</p>
    <div class="kbody"><span class="kbod"><small>Body hříchu</small><b>${D.hr}</b></span><span class="kbod"><small>Dobré skutky</small><b>${D.sk}</b></span>
      <button type="button" class="gbtn" data-kdu="zp" ${btip("Na konci sezení: d10 – hříchy ≥ hod → Svědomí −1, dobré skutky ≥ hod → +1; body se pak vynulují")}>Zpytování svědomí</button></div>
    <div class="kdub"><span class="kdusk">Hřích</span><button type="button" class="gbtn ghost" data-kdu="h1" ${btip("Všední hřích, podlehnutí Neřesti nebo přijaté Pokušení: +1 bod hříchu")}>všední +1</button><button type="button" class="gbtn ghost" data-kdu="h2" ${btip("Všední hřích proti vlastní Ctnosti: +2 body hříchu")}>proti Ctnosti +2</button><button type="button" class="gbtn ghost bhrich" data-kdu="s1" ${btip("Smrtelný hřích (vražda bezbranného, zrada, mučení, křivá přísaha): Svědomí −1 hned")}>smrtelný −1</button><button type="button" class="gbtn ghost bhrich" data-kdu="s2" ${btip("Smrtelný hřích proti vlastní Ctnosti: Svědomí −2 hned")}>smrtelný proti Ctnosti −2</button></div>
    <div class="kdub"><span class="kdusk">Skutek</span><button type="button" class="gbtn ghost" data-kdu="d1" ${btip("Jednání podle Ctnosti, které něco stojí: +1 bod dobrých skutků")}>dobrý skutek +1</button><button type="button" class="gbtn ghost" data-kdu="v1" ${btip("Skutečná oběť nebo riziko života pro Ctnost: Svědomí +1 hned")}>velký skutek +1 Svědomí</button><button type="button" class="gbtn ghost" data-kdu="insp" ${btip("Jednání podle Ctnosti nebo podlehnutí Neřesti: Heroic Inspiration")}>Ctnost / Neřest → inspirace</button>${D.hr||D.sk?`<button type="button" class="gbtn ghost" data-kdu="op" ${btip("Oprava: ubrat poslední připsaný bod")}>oprava</button>`:""}</div>
    ${feat.length?`<h4 class="bsph">Feat víry <small>${D.vz?KVZN[D.vz]:""}, ${D.fs}. stupeň</small></h4>${s<=0?`<p class="rsmall bhrich">Zatracený – feat víry nefunguje.</p>`:""}<ul class="kfeat">${feat.map(([n,max,st,t])=>{const u=Math.min(max,+(U[n]||0));return `<li><b>${besc(n)}</b>${max?` <span class="bzd">${[...Array(max)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="${besc(n)}" data-j="${j}" aria-label="${besc(n)} ${j+1} z ${max}"></button>`).join("")}</span>`:""} <button type="button" class="gbtn ghost" data-kfeat="${besc(n)}"${s<=0||(max&&u>=max)?" disabled":""}>Použít</button><br><small>${besc(t)}</small></li>`}).join("")}</ul>`:""}
    <details class="bjapd kdus"><summary>Nastavit duši postavy</summary>
      <form data-kdusf class="kdusf"><label>Postava v Družině <select name="dr"><option value="">— podle jména —</option>${PARTY.map(p=>`<option value="${besc(p.id)}"${D.dr===p.id?" selected":""}>${besc(kNm(p.n))}</option>`).join("")}</select></label>
        <label>Vyznání <select name="vz"><option value="">—</option>${Object.entries(KVZN).map(([k,v])=>`<option value="${k}"${D.vz===k?" selected":""}>${v}</option>`).join("")}</select></label>
        <label>Stupeň featu víry <select name="fs">${[1,2,3].map(i=>`<option${D.fs===i?" selected":""}>${i}</option>`).join("")}</select></label>
        <label>Ctnosti <select name="c1"><option value=""></option>${opt(KCTN[kr],D.ctn[0])}</select><select name="c2"><option value=""></option>${opt(KCTN[kr],D.ctn[1])}</select></label>
        <label>Neřesti <select name="n1"><option value=""></option>${opt(KNER[kr],D.ner[0])}</select><select name="n2"><option value=""></option>${opt(KNER[kr],D.ner[1])}</select></label>
        <label>Svědomí <input type="number" name="sv" min="0" max="10" value="${s}"></label>
        <button class="gbtn ghost">Uložit</button></form><p class="rsmall">Bez nastavení se bere postava z Družiny se stejným jménem a víra z PDF.</p></details></section>`}
async function kDuseAkce(K,a){const D=kDuse(K),ch={},log=(co,txt)=>kHodZapis({k:K.id,kdo:K.n,co,txt});let sv=D.sv;
  if(a==="zp")return kZpyt(K);
  if(a==="h1"||a==="h2"){ch.hr=Math.min(99,D.hr+(a==="h2"?2:1));KDUL[K.id]=["hr",D.hr];await kartaStavZmen(K.id,ch);log(a==="h2"?"Hřích proti Ctnosti":"Všední hřích",`body hříchu ${ch.hr}`);return}
  if(a==="d1"){ch.sk=Math.min(99,D.sk+1);KDUL[K.id]=["sk",D.sk];await kartaStavZmen(K.id,ch);log("Dobrý skutek",`body dobrých skutků ${ch.sk}`);return}
  if(a==="op"){const u=KDUL[K.id];if(u){await kartaStavZmen(K.id,{[u[0]]:u[1]||null});delete KDUL[K.id];log("Oprava",u[0]==="hr"?`body hříchu ${u[1]}`:`dobré skutky ${u[1]}`)}else mmHlasG("Není co opravit – body uprav Zpytováním nebo v nastavení duše.",4000);return}
  if(a==="insp"){await kartaStavZmen(K.id,{insp:true});log("Heroic Inspiration","jednání podle Ctnosti nebo podlehnutí Neřesti");return}
  const d={s1:-1,s2:-2,v1:1}[a];if(d==null)return;
  if(d<0&&!confirm(`${K.n}: smrtelný hřích – Svědomí ${d} hned?`))return;
  sv=Math.max(0,Math.min(10,sv+d));await kartaStavZmen(K.id,{sv});log(d<0?(a==="s2"?"Smrtelný hřích proti Ctnosti":"Smrtelný hřích"):"Velký skutek",`Svědomí ${D.sv} → ${sv} (${SVST(sv)})`);
  if(kSvKl(sv)!==kSvKl(D.sv))mmHlasG(`${K.n}: ${SVST(sv)}${sv<=0?" – feat víry přestává fungovat, Smlouva s ďáblem":""}.`,7000)}
const KDUL={};
const kSvKl=v=>v<=0?0:v<=3?1:v<=7?2:3;
async function kZpyt(K,tichy){const D=kDuse(K),d=bK(10);let sv=D.sv;const m=[];
  if(D.hr>=d){sv--;m.push(`hříchy ${D.hr} ≥ ${d} → −1`)}if(D.sk>=d){sv++;m.push(`dobré skutky ${D.sk} ≥ ${d} → +1`)}sv=Math.max(0,Math.min(10,sv));
  const txt=`d10 ${d}: ${m.join(", ")||"bez změny"} → Svědomí ${sv} (${SVST(sv)})`;await kartaStavZmen(K.id,{sv,hr:null,sk:null});
  kHodZapis({k:K.id,kdo:K.n,co:"Zpytování svědomí",tot:d,txt});if(!tichy)mmHlasG(`${K.n}: Zpytování svědomí – ${txt}.`,8000);return txt}
async function kFeat(K,n){const D=kDuse(K),f=(KFEAT[D.vz]||[]).find(x=>x[0]===n);if(!f)return;if(D.sv<=0){mmHlasG("Zatracený – feat víry nefunguje.",4000);return}
  const S=kartaStav(K.id),U=Object.assign({},S.zdr||{});if(f[1]){if((U[n]||0)>=f[1]){mmHlasG(`${n}: už použito – obnoví se dlouhým odpočinkem.`,4000);return}U[n]=(U[n]||0)+1}
  const ch={zdr:U};let txt=f[3];
  if(n==="Přijímání podobojí"){const pb=kPB(K),sl=kSloty(K).filter(q=>q.u>0&&q.st<=pb).sort((a,b)=>b.st-a.st),vy=kVydU(K);
    if(sl.length&&(!vy||confirm(`Obnovit slot ${sl[0].st}. stupně? (Zrušit = obnovit Výdrž)`))){U[sl[0].k]=sl[0].u-1;if(!U[sl[0].k])delete U[sl[0].k];txt=`obnoven slot ${sl[0].st}. stupně`}
    else if(vy){const b=Math.min(vy,Math.max(1,Math.floor(pb/2)));U["Výdrž"]=vy-b;if(!U["Výdrž"])delete U["Výdrž"];txt=`obnovena Výdrž +${b}`}else txt="není co obnovit"}
  if(n==="Přímluva patrona"){KADV=1;txt="další hod s výhodou (podle světce)"}
  await kartaStavZmen(K.id,ch);kHodZapis({k:K.id,kdo:K.n,co:n,txt:txt.slice(0,280)});mmHlasG(`${K.n}: ${n} – ${txt}`,6000);
  if(n==="Zřídlo místa")kartaOdpocinek(K,false)}
/* Pokušení / Požehnání po hodu z karty */
function kZavBox(K){const z=KZAV[K.id];if(!z)return "";const D=kDuse(K),U=kartaStav(K.id).zdr||{},sml=D.sv<=0&&!(U["Smlouva s ďáblem"]>0)&&z.r!=="poz";
  if(z.r==="pok")return `<div class="kzavbox kpok" role="status"><b>Pokušení</b> – ${besc(z.co)}, Závoj ${z.d}${z.hod?` (${besc(z.hod)})`:""}. Přijmeš-li ho, získáš bod hříchu; odmítneš-li, nastane komplikace (určí vypravěč).
    <span class="bojbtn"><button type="button" class="gbtn ghost" data-kpok="1">Přijmout +1</button><button type="button" class="gbtn ghost" data-kpok="2" ${btip("Přijetí jde proti tvé Ctnosti")}>Přijmout proti Ctnosti +2</button><button type="button" class="gbtn ghost" data-kpok="0">Odmítnout – komplikace</button>${sml?`<button type="button" class="gbtn" data-kpok="s">Smlouva s ďáblem → Požehnání</button>`:""}</span></div>`;
  if(z.r==="poz"){const T=kTechMozne(K,true);return `<div class="kzavbox kpoz" role="status"><b>Požehnání</b> – ${besc(z.co)}, Závoj ${z.d}${z.hod?` (${besc(z.hod)})`:""}: dodatečný příznivý účinek.${T.length?` <span class="bojbtn">${T.map(t=>`<button type="button" class="gbtn ghost" data-ktech="${t.id}" ${btip(t.t)}>${besc(t.n)} <small>${besc(t.c)}</small></button>`).join("")}</span>`:""} <button type="button" class="gbtn ghost" data-kzavx>Zavřít</button></div>`}
  return sml?`<div class="kzavbox" role="status">Závoj ${z.d} (${besc(z.co)}). <button type="button" class="gbtn" data-kpok="s">Smlouva s ďáblem → Požehnání</button> <button type="button" class="gbtn ghost" data-kzavx>Zavřít</button></div>`:""}
async function kPok(K,a){const z=KZAV[K.id];if(!z)return;const D=kDuse(K);
  if(a==="s"){const U=Object.assign({},kartaStav(K.id).zdr||{});U["Smlouva s ďáblem"]=1;await kartaStavZmen(K.id,{zdr:U});kHodZapis({k:K.id,kdo:K.n,co:"Smlouva s ďáblem",txt:`Závoj ${z.d} → Požehnání (${z.co})`});z.r="poz";z.d=6;kartyPrekresli();return}
  if(a==="0"){kHodZapis({k:K.id,kdo:K.n,co:"Pokušení odmítnuto",txt:`${z.co}: komplikace`});delete KZAV[K.id];kartyPrekresli();return}
  const b=+a;await kartaStavZmen(K.id,{hr:Math.min(99,D.hr+b)});KDUL[K.id]=["hr",D.hr];kHodZapis({k:K.id,kdo:K.n,co:"Pokušení přijato",txt:`${z.co}: +${b} bod${b>1?"y":""} hříchu (celkem ${D.hr+b})`});delete KZAV[K.id];kartyPrekresli()}
/* ---- Výdrž a techniky na kartě ---- */
function kSermHtml(K){const mx=kVydMax(K),L=kTech(K);if(!mx&&!L.length)return "";const u=kVydU(K),ne=STECH.filter(t=>!L.includes(t.id));
  return `<h3 class="uvh2">Šerm a zápas <a class="pmore" href="#artikule/serm">pravidla →</a></h3>
    ${mx?`<div class="bkzdr"><span class="bzd" ${btip(`Výdrž: použito ${u} z ${mx} · obnova dlouhým odpočinkem`)}><span>Výdrž</span>${[...Array(mx)].map((_,j)=>`<button type="button" class="${j<u?"on":""}" data-kzd="Výdrž" data-j="${j}" aria-label="Výdrž ${j+1} z ${mx}"></button>`).join("")}</span></div>`:`<p class="rsmall">Výdrž má jen Fighter, Barbarian, Paladin, Ranger, Rogue a Monk.</p>`}
    ${L.length?`<ul class="ktech">${L.map(i=>{const t=STBY[i];return `<li><button type="button" class="gbtn ghost" data-ktech="${t.id}"${u>=mx?" disabled":""}>${besc(t.n)}</button> <small><b>${besc(t.c)}</b> · ${besc(t.t)}</small> <button type="button" class="kx" data-ktechx="${t.id}" aria-label="Zapomenout ${besc(t.n)}">×</button></li>`}).join("")}</ul>`:`<p class="rsmall">Zatím žádné techniky – učí je šermířští mistři.</p>`}
    ${ne.length?`<p class="rsmall"><select data-ktechadd aria-label="Naučená technika"><option value="">+ naučená technika nebo chvat…</option><optgroup label="Šermířské techniky">${ne.filter(t=>!t.ch).map(t=>`<option value="${t.id}">${besc(t.n)} (${besc(t.c)})</option>`).join("")}</optgroup><optgroup label="Zápasnické chvaty">${ne.filter(t=>t.ch).map(t=>`<option value="${t.id}">${besc(t.n)} (${besc(t.c)})</option>`).join("")}</optgroup></select></p>`:""}`}
async function kTechPouzij(K,id){const t=STBY[id];if(!t)return;const mx=kVydMax(K),u=kVydU(K);if(u>=mx){mmHlasG(`${K.n}: nezbývá Výdrž.`,3500);return}
  const z=KZAV[K.id];if(t.poz&&!(z&&z.r==="poz")&&!confirm(`${t.n} stojí ${t.c}. Padlo na kostce Závoje Požehnání?`))return;
  const U=Object.assign({},kartaStav(K.id).zdr||{});U["Výdrž"]=u+1;await kartaStavZmen(K.id,{zdr:U});if(t.poz&&z)delete KZAV[K.id];
  kHodZapis({k:K.id,kdo:K.n,co:t.n,txt:`${t.c}: ${t.t}`.slice(0,290)});mmHlasG(`${K.n}: ${t.n} (Výdrž ${mx-u-1}/${mx}) – ${t.t}`,7000)}
/* ---- rány ---- */
function kRanyHtml(K){const R=kRany(K);if(!R.length)return "";return `<h3 class="uvh2">Rány <a class="pmore" href="#artikule/kriticka">pravidla →</a></h3><ul class="krany">${R.map(x=>`<li class="${/^Lehk/.test(x.t)?"":/^Těžk/.test(x.t)?"bhp2":"bhrich"}"><b>${besc(x.t)}</b>${x.d?` <small>${besc(x.d)}</small>`:""}</li>`).join("")}</ul><p class="rsmall">Neléčená kritická zranění: každé přidá +1 k dalšímu hodu na kritické zranění. Vyléčení odškrtne vypravěč v Boji.</p>`}
/* ---- rozdíl po novém PDF (úroveň, životy, kouzla, útoky, předměty) ---- */
function kRozdil(S,N){if(!S)return [];const o=[],ar=(a,b,f)=>{const A=new Set((a||[]).map(f)),B=new Set((b||[]).map(f));return [[...B].filter(x=>!A.has(x)),[...A].filter(x=>!B.has(x))]};
  if(S.uroven!==N.uroven)o.push(`úroveň ${S.uroven||"?"} → ${N.uroven||"?"}`);if(S.povolani!==N.povolani)o.push(`povolání ${S.povolani||"–"} → ${N.povolani||"–"}`);
  [["hp","HP"],["ac","AC"],["zdatnost","zdatnost"],["ini","iniciativa"]].forEach(([k,l])=>{if(S[k]!==N[k])o.push(`${l} ${S[k]??"–"} → ${N[k]??"–"}`)});
  BAB.forEach(a=>{const x=(S.vl||{})[a],y=(N.vl||{})[a];if(x!==y)o.push(`${a} ${x??"–"} → ${y??"–"}`)});
  const [kp,ku]=ar((S.kouzla||{}).seznam,(N.kouzla||{}).seznam,x=>x.n);if(kp.length)o.push("nová kouzla: "+kp.join(", "));if(ku.length)o.push("bez kouzel: "+ku.join(", "));
  const sl=k=>((k.kouzla||{}).sloty||[]).map(q=>`${q.st}.${q.pakt?"p":""}×${q.max}`).join(" ");if(sl(S)!==sl(N))o.push(`sloty ${sl(S)||"–"} → ${sl(N)||"–"}`);
  const [up,uu]=ar(S.utoky,N.utoky,x=>x.n);if(up.length)o.push("nové útoky: "+up.join(", "));if(uu.length)o.push("bez útoků: "+uu.join(", "));
  const [zp]=ar(S.zdroje,N.zdroje,x=>`${x.n} ${x.max}`);if(zp.length)o.push("schopnosti: "+zp.join(", "));
  const [rp]=ar(S.rysy,N.rysy,x=>x);if(rp.length)o.push("nové rysy: "+rp.join(", "));
  const [vp]=ar(S.vybaveni,N.vybaveni,x=>x.n);if(vp.length)o.push("v PDF nové předměty: "+vp.join(", ")+" (vybavení na webu zůstává, přidej je ručně)");
  return o}
/* ---- offline: fronta zápisů karty a hodů, když chybí připojení ---- */
const KFR={get(){try{return JSON.parse(localStorage.getItem("mm-fronta")||"[]")}catch(e){return []}},set(v){try{localStorage.setItem("mm-fronta",JSON.stringify(v.slice(-400)))}catch(e){}}};
const kSitChyba=e=>navigator.onLine===false||(e&&(e.name==="TypeError"||/fetch|network|síť/i.test(e.message||"")));
function kFrontaPridej(x){const F=KFR.get();F.push(x);KFR.set(F)}
async function kFrontaOdesli(){if(kFrontaOdesli.b)return;const F=KFR.get();if(!F.length||!window.MMDB||navigator.onLine===false)return;const zb=[];kFrontaOdesli.b=1;try{
  for(const x of F){try{if(x.t==="s")await KDB.stav(x.id,x.k,x.v);else await KDB.hod(x.h)}catch(e){if(kSitChyba(e))zb.push(x);/* neplatné zápisy zahodí */}}
  KFR.set(zb);if(!zb.length&&F.length){mmHlasG(`Připojeno – odesláno ${F.length} změn z doby bez signálu.`,4500);kFrontaOdesli.b=0;await kartyNacti();await hodyNacti();kartyPrekresli()}}finally{kFrontaOdesli.b=0}}
function kFrontaNaStav(){KFR.get().forEach(x=>{if(x.t==="s"){const o=KST[x.id]=Object.assign({},KST[x.id]||{});if(x.v==null)delete o[x.k];else o[x.k]=x.v}})}
addEventListener("online",()=>kFrontaOdesli());
/* kopie karet a záznamu pro režim bez připojení */
const KCACHE={uloz(){try{localStorage.setItem("mm-karty-kopie",JSON.stringify({K:KARTY.filter(k=>!KSTAT.has(k.id)),S:KST,H:HODY.slice(0,60)}))}catch(e){}},
  nacti(){try{const c=JSON.parse(localStorage.getItem("mm-karty-kopie")||"null");if(!c)return false;(c.K||[]).forEach(k=>{if(!KARTBY[k.id]){KARTY.push(k);KARTBY[k.id]=k}});Object.assign(KST,c.S||{});if(!HODY.length)HODY=(c.H||[]);kFrontaNaStav();return true}catch(e){return false}}};
/* ---- přehled družiny pro vypravěče ---- */
const KPS={ab:"WIS",dc:"",dov:"Perception",vys:null};
function kPrehledHtml(){if(!KARTY.length)return "";const t=kTed();
  const row=K=>{const S=kartaStav(K.id),mx=kHPmax(K),cur=S.hp!=null?+S.hp:mx,pr=Math.max(0,Math.min(100,Math.round(cur/mx*100))),D=kDuse(K),sl=kSloty(K),vm=kVydMax(K),R=kRany(K),uc=kUc(K),h=((BOJ.s&&BOJ.s.hraci)||[]).find(x=>bojKartaH(x)===K),st=h&&h.stav||[];
    return `<tr><th scope="row"><a href="#karty/${besc(K.id)}">${besc(K.n)}</a><small>${besc(K.povolani||"")}</small></th><td><b>${kAC(K)}</b></td>
      <td class="kphp${cur<=mx/2?" bhp2":""}${cur<=0?" bhp0":""}"><b>${cur}</b>/${mx}${S.thp?` <i class="bkthp">+${S.thp}</i>`:""}<i class="bkhpb" style="--p:${pr}%"></i></td>
      <td>${(K.pasiv||{}).vnimani??"–"} / ${(K.pasiv||{}).vhled??"–"} / ${(K.pasiv||{}).patrani??"–"}</td>
      <td><span class="psv psv${kSvKl(D.sv)}">${SVST(D.sv)} · ${D.sv}</span>${D.hr||D.sk?`<br><small>hřích ${D.hr} · skutky ${D.sk}</small>`:""}</td>
      <td>${sl.map(q=>`<span class="kpsl" ${btip(`${q.pakt?"Pakt":"Sloty"} ${q.st}. st.: zbývá ${q.max-q.u} z ${q.max}`)}>${q.st}${q.pakt?"p":""}: ${q.max-q.u}/${q.max}</span>`).join(" ")||"–"}${vm?`<br><small>Výdrž ${vm-kVydU(K)}/${vm}</small>`:""}</td>
      <td>${S.vycerp?`vyč. ${S.vycerp}`:""}${S.insp?` <span ${btip("Heroic Inspiration")}>✦</span>`:""}${R.length?` <span class="bhrich" ${btip(R.map(x=>x.t).join("; "))}>rány ${R.length}</span>`:""}${st.length?`<br><small>${besc(st.join(", "))}</small>`:""}${uc.length?`<br><small>${besc(uc.map(x=>x.n+(x.do!=null&&t!=null?` (${kHodTxt(Math.max(0,x.do-t))})`:"")).join(", "))}</small>`:""}</td></tr>`};
  const V=KPS.vys;
  return `<section class="kprehled"><h3 class="uvh2">Přehled družiny</h3><div class="srdtab"><table><thead><tr><th>Postava</th><th>AC</th><th>HP</th><th ${btip("Pasivní Vnímání / Vhled / Pátrání")}>Pasivní V/V/P</th><th>Svědomí</th><th>Sloty</th><th>Stav</th></tr></thead><tbody>${KARTY.map(row).join("")}</tbody></table></div>
    ${GMV?`<div class="kpakce"><form data-kpzach class="kvlh"><label>Všichni: záchrana <select name="ab">${BAB.map(a=>`<option${KPS.ab===a?" selected":""}>${a}</option>`).join("")}</select></label><label>SO <input name="dc" type="number" min="1" max="40" value="${besc(KPS.dc)}" placeholder="–"></label><button class="gbtn ghost">Hodit</button></form>
      <form data-kpdov class="kvlh"><label>Všichni: ověření <select name="dov">${Object.keys(KDOVAB).map(d=>`<option${KPS.dov===d?" selected":""}>${d}</option>`).join("")}</select></label><label>SO <input name="dc" type="number" min="1" max="40" value="${besc(KPS.dc)}" placeholder="–"></label><button class="gbtn ghost">Hodit</button></form>
      <span class="bojbtn"><button type="button" class="gbtn ghost" data-kpodp="k" ${btip("Zdroje s obnovou krátkým odpočinkem a sloty paktu; kostky životů utratí každý na své kartě. Herní čas +1 h.")}>Krátký odpočinek všem</button><button type="button" class="gbtn ghost" data-kpodp="d" ${btip("Životy, sloty, zdroje, Výdrž, polovina kostek životů, vyčerpání −1. Herní čas +8 h.")}>Dlouhý odpočinek všem</button><button type="button" class="gbtn ghost" data-kpzv ${btip("Konec sezení: hráčům vyskočí výzva a každý si hodí d10 na své kartě")}>Zpytování – výzva hráčům</button><button type="button" class="gbtn ghost" data-kpzp ${btip("Konec sezení: vypravěč hodí d10 za všechny postavy")}>Zpytování všem hned</button><button type="button" class="gbtn ghost" data-kpcas="1">čas +1 h</button><button type="button" class="gbtn ghost" data-kpcas="8">+8 h</button></span>
      ${V?`<div class="kpvys"><b>${besc(V.co)}</b><ul>${V.r.map(r=>`<li>${besc(r.n)}: <b class="${r.ok===false?"bmis":r.ok?"bkr":""}">${r.tot}</b> <small>${besc(r.txt)}</small>${r.zav?(()=>{const q=r.zr!=null?r.zr:r.zav<=2?"pok":r.zav>=5?"poz":"";return ` <span class="bzv ${q==="pok"?"zp":q==="poz"?"zb":""}">${q?zavVys(q):"bez vlivu"} ${r.zav}</span>`})():""}${r.ok!=null?(r.ok?" ✓":" ✗"):""}</li>`).join("")}</ul></div>`:""}</div>`:""}</section>`}
async function kPrehledHod(co,fn,dc){const r=[];for(const K of KARTY){const [b,adv,why]=fn(K),v=adv||0,d1=bK(20),d2=v?bK(20):null,d=v>0?Math.max(d1,d2):v<0?Math.min(d1,d2):d1,vy=2*kVycerp(K),tot=d+b-vy,z=zavBezZach(co)?null:kZavoj(K);
    const txt=`d20 ${d1}${d2!=null?` / ${d2}`:""} ${bsg(b)}${vy?` −${vy}`:""}${why?` · ${why}`:""}`;r.push({n:K.n,tot,txt,zav:z?z.d:undefined,zr:z?z.r:undefined,ok:dc?tot>=dc:null});
    const H={k:K.id,kdo:K.n,co,txt:txt+(dc?` · SO ${dc}: ${tot>=dc?"úspěch":"neúspěch"}`:""),tot,d};if(z){H.zav=z.d;H.zr=z.r||"0"}if(v)H.adv=v;
    if(GMV&&window.KSKR)HODY.unshift(Object.assign({id:Date.now()+r.length,cas:new Date().toISOString(),skryty:true},H));else await kHodZapis(H)}
  KPS.vys={co:co+(dc?` (SO ${dc})`:""),r};kartyPrekresli()}
async function kPrehledOdp(dl){if(!confirm(dl?"Dlouhý odpočinek celé družiny (herní čas +8 h)?":"Krátký odpočinek celé družiny (herní čas +1 h)?"))return;
  for(const K of KARTY){const S=kartaStav(K.id),U=Object.assign({},S.zdr||{}),mx=kHPmax(K),cur=S.hp!=null?+S.hp:mx,D=kDuse(K);
    if(dl){const kzMax=kKostkyPool(K).length||kLv(K),spent=+S.kz||0,ch={thp:null,zdr:null,kz:null};
      if(D.sv>=1&&D.sv<=3){const n=Math.min(mx,cur+Math.floor(mx/2));ch.hp=n>=mx?null:n}else ch.hp=null;if(S.vycerp)ch.vycerp=Math.max(0,S.vycerp-1)||null;if((S.pri||[]).length)ch.pri=null;
      const inv=(S.inv||K.vybaveni||[]).map(y=>Object.assign({},y)),NL=kNabObnov(inv);if(NL.length)ch.inv=inv;
      await kartaStavZmen(K.id,ch);kHodZapis({k:K.id,kdo:K.n,co:"Dlouhý odpočinek",txt:`družina odpočívá${D.sv>=1&&D.sv<=3?"; neklidné sny – jen polovina HP":""}${NL.length?`; náboje za úsvitu: ${NL.join(", ")}`:""}`})}
    else{kSloty(K).filter(q=>q.pakt).forEach(q=>{delete U[q.k]});kZdroje(K).forEach(q=>{if(q.kr1){if(U[q.n])U[q.n]=U[q.n]-1;if(!U[q.n])delete U[q.n]}else if(/krátk/.test(q.obn||""))delete U[q.n]});
      const P=(S.pri||[]).filter(n=>/^Bardic /.test(n));await kartaStavZmen(K.id,{zdr:Object.keys(U).length?U:null,...((S.pri||[]).length!==P.length?{pri:P.length?P:null}:{})});kHodZapis({k:K.id,kdo:K.n,co:"Krátký odpočinek",txt:"družina odpočívá; kostky životů na kartě"})}}
  if(HRA&&HRA.datum)await hraPosun(dl?8:1);mmHlasG(`${dl?"Dlouhý":"Krátký"} odpočinek celé družiny zapsán${HRA&&HRA.datum?`, herní čas +${dl?8:1} h`:""}.`,5000);kartyPrekresli()}
/* ---- jeden záznam: hody z karet + veřejný záznam boje ---- */
let KZFL="";
function kZaznamHtml(){const boj=((BOJ.s&&BOJ.s.zaz)||[]).map(e=>({id:"b"+e.ts,cas:new Date(e.ts).toISOString(),kdo:e.a||"",co:`Boj, kolo ${e.k||1}: ${e.c?"→ "+e.c:""}${e.cim?" · "+e.cim:""}`,txt:e.v||"",boj:1,kn:[e.a,e.c]}));
  let L=[...HODY.map(h=>Object.assign({kn:[h.kdo]},h)),...boj].sort((a,b)=>String(b.cas).localeCompare(String(a.cas)));
  if(KZFL==="boj")L=L.filter(x=>x.boj);else if(KZFL)L=L.filter(x=>x.k===KZFL||(x.boj&&x.kn.includes((KARTBY[KZFL]||{}).n)));
  return `<p class="rsmall kzfil"><label>Zobrazit <select data-kzf><option value="">vše</option><option value="boj"${KZFL==="boj"?" selected":""}>jen boj</option>${KARTY.map(k=>`<option value="${besc(k.id)}"${KZFL===k.id?" selected":""}>${besc(k.n)}</option>`).join("")}</select></label></p>${kHodyHtml(L,80)}`}
/* ---- popisky pravidel (glosář SRD) v textu: najetí nebo klepnutí na pojem ---- */
let POJ=null,POJP=null,POJRE=null;
const pojNacti=()=>POJ?Promise.resolve(POJ):(POJP=POJP||fetch("art/pojmy.json").then(r=>r.json()).then(d=>{POJ={};const n=[];d.forEach(x=>{(x.f||[x.en]).forEach(f=>{POJ[f]=x;n.push(f)})});
  POJRE=new RegExp(`(?<![\\wÀ-ž-])(${n.sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})(?![\\wÀ-ž-])`,"g");return POJ}).catch(e=>{POJP=null;throw e}));
const POJSKIP="A,BUTTON,ABBR,INPUT,SELECT,TEXTAREA,OPTION,H1,H2,H3,H4,LABEL,SUMMARY,SCRIPT,STYLE,CODE,TH";
function pojZnac(root){if(!root)return;pojNacti().then(()=>{if(!POJRE)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{for(let p=n.parentElement;p&&p!==root.parentElement;p=p.parentElement){if(POJSKIP.includes(p.tagName)||p.classList.contains("poj")||p.dataset.nopoj!=null)return NodeFilter.FILTER_REJECT}POJRE.lastIndex=0;return POJRE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const L=[];while(w.nextNode())L.push(w.currentNode);
  L.forEach(n=>{const f=document.createDocumentFragment();let i=0;const t=n.nodeValue;POJRE.lastIndex=0;for(const m of t.matchAll(POJRE)){f.append(t.slice(i,m.index));const a=document.createElement("abbr");a.className="poj";a.tabIndex=0;a.dataset.poj=m[1];a.textContent=m[1];f.append(a);i=m.index+m[1].length}f.append(t.slice(i));n.replaceWith(f)})}).catch(()=>{})}
let POJT=null;
function pojUkaz(a){const x=POJ&&POJ[a.dataset.poj];if(!x)return;pojSkryj();const d=document.createElement("div");d.className="pojtip";d.setAttribute("role","tooltip");
  d.innerHTML=`<b>${besc(x.en)}</b>${x.cz&&x.cz!==x.en?` <span>(${besc(x.cz)})</span>`:""}<p>${besc(x.d)}</p><a href="#pravidla/glosar/${besc(x.id)}">Celé heslo →</a>`;document.body.appendChild(d);
  const r=a.getBoundingClientRect(),w=Math.min(340,innerWidth-24);d.style.width=w+"px";d.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+scrollX))+"px";d.style.top=(r.bottom+scrollY+6)+"px";POJT=d}
function pojSkryj(){if(POJT){POJT.remove();POJT=null}}
document.addEventListener("mouseover",e=>{const a=e.target.closest&&e.target.closest("abbr.poj");if(a)pojUkaz(a);else if(POJT&&!e.target.closest(".pojtip"))pojSkryj()});
document.addEventListener("focusin",e=>{const a=e.target.closest&&e.target.closest("abbr.poj");if(a)pojUkaz(a)});
document.addEventListener("click",e=>{const a=e.target.closest("abbr.poj");if(a){e.preventDefault();pojUkaz(a);return}if(POJT&&!e.target.closest(".pojtip"))pojSkryj();if(e.target.closest(".pojtip a"))pojSkryj()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")pojSkryj()});
/* ---- vyskakovací okno (popis kouzla, předmětu) ---- */
function mmPop(html){mmPopX();const d=document.createElement("div");d.className="mmpop";d.innerHTML=`<div class="mmpopin" role="dialog" aria-modal="true"><button type="button" class="kzx" data-mmpopx aria-label="Zavřít">×</button>${html}</div>`;document.body.appendChild(d);
  d.addEventListener("click",e=>{if(e.target===d||e.target.closest("[data-mmpopx]"))mmPopX()});const b=d.querySelector("[data-mmpopx]");if(b)b.focus();pojZnac(d.querySelector(".mmpopin"));return d}
function mmPopX(){document.querySelectorAll(".mmpop").forEach(x=>x.remove())}
document.addEventListener("keydown",e=>{if(e.key==="Escape")mmPopX()});
document.addEventListener("toggle",e=>{const d=e.target;if(d.matches&&d.matches("details.bbe")&&d.open)setTimeout(()=>pojZnac(d.querySelector(".bsb")||d),0)},true);
