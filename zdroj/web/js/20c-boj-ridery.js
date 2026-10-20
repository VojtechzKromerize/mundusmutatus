/* ===== Boj: volby po zásahu, přesun Hexu, Riposte, Sharpshooter (2026-10-20) ===== */
/* ===== Volby po zásahu, přesun Hexu, odveta (2026-10-20) =====
   Po hodu, který zasáhl, nabídne list útoku to, co se k zásahu dá přidat: Divine Smite (slot), Eldritch Smite (pakt slot),
   Sneak Attack, manévry Battle Mastera (kostka převahy) a u odvety Riposte. Kostky se hodí hned (při kritickém zásahu dvojnásob),
   slot / kostka převahy / bonusová akce se utratí až odesláním útoku vypravěči. */
function bojJaRidery(K,me,w,q,s){if(!K||!me||!w||!q||q.vys==="vedle")return [];const R=[],tk=(s.kolo||1)*100+(s.tah||0),U=BJU.ridT&&BJU.ridT.tk===tk?BJU.ridT.u:[],uz=g=>U.includes(g),blizko=!w.dal;
  const sez=new Set(kSeznam(K).map(x=>String(x.n).toLowerCase())),EF=kEfekty(K),sel=(BJU.ef||[]).map(i=>EF[i]).filter(Boolean);
  if(blizko&&sez.has("divine smite")&&!uz("ds")&&!sel.some(e=>e.slot)){const Q=kSloty(K).filter(z=>z.u<z.max).sort((a,b)=>a.st-b.st||(a.pakt?1:-1));
    [...new Map(Q.map(z=>[z.st,z])).values()].slice(0,4).forEach(z=>R.push({k:"ds:"+z.k,g:"ds",n:`Divine Smite ${z.st}. st.`,zr:`${1+z.st}d8`,cena:{slot:z.k,st:z.st,kz:"Divine Smite"},ba:1,cim:"Divine Smite",pozn:`+${1+z.st}d8 Radiant (proti Fiend a Undead o 1d8 víc), slot ${z.st}. st.${z.pakt?" (pakt)":""}, bonusová akce`}))}
  if(kMaRys(K,/(^|: ?)eldritch smite$/i)&&!uz("es")){const z=kSloty(K).filter(z=>z.pakt&&z.u<z.max)[0];if(z)R.push({k:"es:"+z.k,g:"es",n:"Eldritch Smite",zr:`${1+z.st}d8`,cena:{slot:z.k,st:z.st},cim:"Eldritch Smite",pozn:`+${1+z.st}d8 Force za pakt slot ${z.st}. st.; cíl velikosti Huge a menší můžeš srazit (Sražen) – vypravěč to uvidí u útoku`})}
  const ro=kTrU(kCtx(K),"Rogue");if(ro&&!uz("sa")&&!sel.some(e=>e.n==="Sneak Attack"))R.push({k:"sa",g:"sa",n:"Sneak Attack",zr:`${Math.ceil(ro/2)}d6`,pozn:"jednou za tah: s výhodou, nebo když je u cíle tvůj spojenec; zbraň Finesse nebo na dálku"});
  const SD=kSD(K);if(SD&&SD.zb>0){const M=kManevry(K),dc=kSDdc(K);
    (M.length?M:[["Manévr","manévr"]]).filter(m=>m[0]!=="Lunging Attack"||blizko).forEach(m=>R.push({k:"m:"+m[0],g:"m",n:m[0],zr:"1"+SD.k,cena:{sd:1},cim:m[2]?`${m[0]} (${m[2]} SO ${dc})`:m[0],pozn:`+1${SD.k} ke zranění (kostka převahy, zbývá ${SD.zb})${m[2]?`; cíl: záchrana ${m[2]} SO ${dc}, při neúspěchu ${m[3]}`:""}`}))}
  if(BJU.ripo&&SD&&BJU.ripo.ai===q.ci)R.push({k:"rp",g:"rp",n:"Riposte",zr:"1"+SD.k,pozn:"odveta: kostka převahy ke zranění (utratí se odesláním)"});
  return R}
function bojJaRidHtml(K,q){if(!K||!q||GMV)return "";const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),w=me&&bojZbrVse(s,me)[+BJU.zi];const R=bojJaRidery(K,me,w,q,s),A=q.rid||[];
  const gw=q.krit&&kMaRys(K,/^great weapon master$/i)&&w&&kTezka(K,w)?`<small class="bjurgw">Great Weapon Master: po kritickém zásahu můžeš bonusovou akcí zaútočit znovu.</small>`:"";
  if(!R.length&&!A.length)return gw;const ap=new Set(A.map(r=>r.k)),ag=new Set(A.map(r=>r.g)),L=[...R,...A.filter(r=>!R.some(x=>x.k===r.k))];
  return `<div class="bjur bjurid" role="group" aria-label="Přidat k zásahu"><small>Přidat k zásahu${q.krit?" (kritický – kostky dvakrát)":""}:</small>${L.map(r=>`<button type="button" class="gbtn ghost${ap.has(r.k)?" on":""}" data-jurid="${besc(r.k)}" aria-pressed="${ap.has(r.k)}"${!ap.has(r.k)&&ag.has(r.g)?" disabled":""} ${btip(r.pozn||r.n)}>${besc(r.n)} <small>${ap.has(r.k)?`${(A.find(x=>x.k===r.k)||{}).t} ✓`:"+"+besc(r.zr)}</small></button>`).join("")}${gw}</div>`}
function bojJaRid(k){const s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.n===bojJa.get()),K=me&&bojKartaH(me),w=me&&bojZbrVse(s,me)[+BJU.zi],ser=BJU.serie||[],i=Math.min(+BJU.ui||0,ser.length-1),q=ser[Math.max(0,i)];if(!q||!K)return;
  q.rid=q.rid||[];const j=q.rid.findIndex(r=>r.k===k);let txt;
  if(j>=0){const r=q.rid[j];q.dmg=Math.max(0,(+q.dmg||0)-r.t);q.zx=String(q.zx||"").replace(r.x,"");q.rid.splice(j,1);txt=`${r.n} zrušeno → zranění ${q.dmg}`}
  else{const R=bojJaRidery(K,me,w,q,s).find(r=>r.k===k);if(!R||q.rid.some(r=>r.g===R.g))return;const kk=bojKostky(R.zr,q.krit);if(!kk)return;const x=` + ${kk.x} (${R.n})`;
    q.dmg=(+q.dmg||0)+kk.t;q.zx=(q.zx||"")+x;q.rid.push({k,g:R.g,n:R.n,t:kk.t,x,cena:R.cena||null,ba:R.ba||0,cim:R.cim||R.n});txt=`${R.n} ${kk.x} = ${kk.t} → zranění ${q.dmg}`}
  if(ser.indexOf(q)===0)BJU.dmg=String(q.dmg);BJU.info=`${BJU.info?BJU.info+" · ":""}${txt}`;renderBoj()}
/* po odeslání: utratit slot / kostku převahy / bonusovou akci a reakci odvety; „jednou za tah“ si pamatuje tento telefon */
async function bojJaRidPo(K,me,SER){if(!K||!me)return;const s=BOJ.s||{},tk=(s.kolo||1)*100+(s.tah||0);if(!(BJU.ridT&&BJU.ridT.tk===tk))BJU.ridT={tk,u:[]};
  for(const q of (SER||[]))for(const r of (q.rid||[])){if(/^(ds|es|sa)$/.test(r.g))BJU.ridT.u.push(r.g);const c=r.cena;
    try{if(c&&c.kz)await kartaSeslat(K,{n:c.kz,st:c.st,kon:false},c.slot);else if(c&&c.slot){const U=Object.assign({},kartaStav(K.id).zdr||{});U[c.slot]=(U[c.slot]||0)+1;await kartaStavZmen(K.id,{zdr:U});kHodZapis({k:K.id,kdo:K.n,co:r.n,txt:`pakt slot ${c.st}. st. · ${r.x.replace(/^ \+ /,"")}`})}
      else if(c&&c.sd){const z=kSD(K);if(z)await kZdrUtrat(K,z)}}catch(e){console.error(e)}
    if(r.ba&&typeof bojBptOznac==="function")bojBptOznac("B")}
  if(BJU.ripo){const z=kSD(K);try{if(z)await kZdrUtrat(K,z)}catch(e){}bojHracAkce(me.id,(x,zz)=>{(zz.reak=zz.reak||{})[me.id]=1});BJU.ripo=null}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-jurid]");if(b&&!b.disabled)bojJaRid(b.dataset.jurid)});
/* Hex / Hunter's Mark: když označený cíl padne (nebo zmizí z boje), karta nabídne přenést značku bonusovou akcí na jiného nepřítele */
const BZNACP=" (přesun)";
function bojJaHexHtml(s,me,K){if(!K||!me||!s.aktivni)return "";const jm=n=>typeof kzJm==="function"?kzJm(n):String(n).replace(/\s*\(\d+\. st\.\)$/,"");const u=kUc(K).find(x=>x.kon&&/^(Hex|Hunter's Mark)$/.test(jm(x.n)));if(!u)return "";const nm=jm(u.n);
  const zivy=o=>!bojSpoj(o)&&!(o.stav||[]).some(t=>t==="poražen"||t==="prchá"||t==="vzdal se")&&(o.druh!=="houf"||o.pocet>0);
  const nosi=(s.npc||[]).filter(o=>(o.ef||[]).some(e=>e.n===nm&&e.od===me.id));if(nosi.some(zivy))return "";const C=(s.npc||[]).filter(zivy);if(!C.length)return "";
  return `<div class="khl kjuhex">${bi("soustredi")} <b>${besc(nm)}</b>: ${nosi.length?`${besc(nosi.map(o=>o.n).join(", "))} už nebojuje`:"označený cíl už v boji není"} – bonusovou akcí přeneseš značku na: ${C.map(o=>`<button type="button" class="gbtn ghost" data-juhexp="${besc(nm)}|${besc(o.id)}" data-juhexh="${besc(me.id)}">${besc(o.n)}</button>`).join("")}</div>`}
document.addEventListener("click",async e=>{const b=e.target.closest&&e.target.closest("[data-juhexp]");if(!b)return;const [nm,id]=b.dataset.juhexp.split("|"),s=BOJ.s||{},me=(s.hraci||[]).find(h=>h.id===b.dataset.juhexh),n=(s.npc||[]).find(o=>o.id===id);if(!me||!n)return;
  if(GMV){await bojZmen(z=>{const q=(z.npc||[]).find(o=>o.id===id);if(q)bojEfZnac(z,q,nm+BZNACP,{h:me.id})});mmHlasG(`${nm} přenesen na ${n.n}.`,3500);return}
  if(!bojDB||!bojDB.utok||await kOdklad(`${nm} → ${n.n}`,()=>true)===false)return;
  try{await bojDB.utok(me.id,{ci:[id],cim:(BUEF+nm+BZNACP).slice(0,60),hod:0});const K=bojKartaH(me);if(K)kHodZapis({k:K.id,kdo:K.n,co:`${nm}: přesun`,txt:n.n});if(typeof bojBptOznac==="function")bojBptOznac("B");mmHlas(`${nm} → ${n.n}${potvrz().rezim!=="nic"?" – vypravěč potvrdí":""}.`,4000);BOJ.v=-2;await bojNacti();renderBoj()}catch(err){mmHlas("Nepodařilo se poslat: "+(err.message||err),5000)}});
/* Sharpshooter (D&D 2024): útok zbraní na dálku nepočítá krytí cíle */
function bojSS(s,h,u){const K=h&&bojKartaH(h);if(!K||!kMaRys(K,/^sharpshooter$/i))return false;const nm=String(u.cim||"").replace(/^Riposte: /,"").split(" + ")[0],w=bojZbrVse(s,h).find(x=>x.n===nm);return !!(w&&w.dal)}
