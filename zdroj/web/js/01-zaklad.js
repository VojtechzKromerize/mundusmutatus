const FAM=/*@FAM@*/[];
const REL=/*@REL@*/[];
/* zeměpis: královská města a sídla církevních vrchností jsou na mapě vždy, i když družina rod nezná */
const ZEMEPIS=/*@ZEMEPIS@*/[];
const byId=Object.fromEntries(FAM.map(f=>[f.id,f]));
const CONFN={kat:"katolíci",kal:"kališníci",mix:"smíšení",isl:"islám"};
const FICON={kat:"art/img/vira-kat.webp",kal:"art/img/vira-kal.webp",mix:"art/img/vira-mix.webp",isl:"art/img/vira-isl.webp"};
const SFICON={kat:"art/img/vira-kat.webp",kal:"art/img/vira-kal.webp",pra:"art/img/vira-pra.webp",isl:"art/img/vira-isl.webp",mix:"art/img/vira-smi.webp"};
const faith=c=>`<span class="faith f-${c}"><img src="${FICON[c]}" alt="" aria-hidden="true">${CONFN[c]}</span>`;
const CASTLEICO="art/img/hrad.webp";
const TOWNSEATS=new Set(["Picnov","Moravský Krumlov","Poděbrady", "Náchod", "Kladsko", "Minsterberk", "Český Krumlov", "Třeboň", "Jindřichův Hradec", "Telč (Morava)", "Blatná", "Rožmitál", "Litomyšl", "Budyně", "Děčín", "Bor", "Šternberk (Morava)", "Kroměříž", "Vyškov", "Velké Meziříčí", "Nisa", "Opolí", "Horní Hlohov", "Opava", "Hlubčice", "Krnov", "Ratiboř", "Těšín", "Olešnice", "Žaháň", "Hlohov", "Lehnice", "Břeh", "Svídnice", "Javor", "Žary", "Beeskow", "Berlín-Cölln", "Chotěbuz", "Krakov", "Osvětim", "Budín", "Kremnice", "Vídeňské Nové Město", "Vídeň", "Landshut", "Mnichov", "Neumarkt", "Míšeň", "Drážďany", "Výmar", "Plavno", "Šamotuly", "Hnězdno", "Ostřihom", "Pezinok", "Svätý Jur", "Eferding", "Pasov", "Řezno", "Pfreimd", "Gera"]); /* family seats that are towns rather than castles */
const TOWNICO="art/img/mesto.webp";
const townImg=(c,cls)=>`<img class="${cls||"townico"} t-${c}" src="${TOWNICO}" alt="" aria-hidden="true">`;
const RTN={rod:"krev",spoj:"spojenci",spor:"spor"};
const RICON={rod:"art/img/vazba-rod.webp",spoj:"art/img/vazba-spoj.webp",spor:"art/img/vazba-spor.webp"};
const rIco=t=>`<img class="rico" src="${RICON[t]}" alt="" aria-hidden="true">`;
const RGL={rod:"Krev",spoj:"Spojenectví",spor:"Spory"};
const relGroups=(rels,id,open)=>`<div class="relgs relrub">${["rod","spoj","spor"].map(k=>{const rs=rels.filter(r=>r.t===k);if(!rs.length)return"";
  return `<details class="relg rg-${k}"${open?" open":""}><summary><img class="rgi" src="${RICON[k]}" alt="" aria-hidden="true"><b>${RGL[k]}</b><span class="rgc">${rs.length}</span></summary><ul class="rels rels-g">${rs.map(r=>`<li><span>${relText(r,id)}</span></li>`).join("")}</ul></details>`}).join("")}</div>`;
const ARMS=/*@ARMS@*/{};
const CARMS={"Brno":"art/erby/mesto-brno.webp","Kutná Hora":"art/erby/mesto-kutna-hora.webp","Plzeň":"art/erby/mesto-plzen.webp","Praha":"art/erby/mesto-praha.webp","Vratislav":"art/erby/vra.webp"};
const armsSrc=(A,big)=>A&&typeof A==="object"?(big?A.v||A.s:A.s||A.v):big?A.replace("art/erby/","art/erby/velke/"):A;
const armsImg=(f,cls)=>ARMS[f.id]?`<img class="${cls}" src="${armsSrc(ARMS[f.id],cls==="armbig")}" alt="Erb: ${f.name}" loading="lazy" decoding="async">`:"";
const shield=f=>ARMS[f.id]?armsImg(f,"armsmall"):shield0(f);
const shield0=f=>`<svg class="shield" viewBox="0 0 20 24" aria-hidden="true"><path d="M2 2h16v9c0 6-4 9.5-8 11-4-1.5-8-5-8-11z" fill="var(--${f.conf})" stroke="var(--ink)" stroke-width="1.2"${f.nbr?' stroke-dasharray="2 1.5"':""}/></svg>`;

