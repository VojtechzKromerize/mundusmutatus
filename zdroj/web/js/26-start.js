/* ===== Pečeť: co družina nově pozná, se při prvním zobrazení „rozpečetí“; o čem jen slyšela, je zapečetěné ===== */
const PEC=(()=>{
  const lv=id=>PBY[id]?(PBY[id].sl?1:2):byId[id]?(byId[id].sl?1:2):(DRBY[id]&&DRBY[id].k==="pl")?(DRBY[id].o.sl?1:2):ZBY[id]?2:0;
  if(GMV||!window.MMCFG)return {lv,nove:()=>false,videl:()=>{}};
  let v=null;try{v=JSON.parse(localStorage.getItem("mm-videno")||"null")}catch(e){}
  const save=()=>{try{localStorage.setItem("mm-videno",JSON.stringify(v))}catch(e){}};
  if(!v||typeof v!=="object"){v={};PEOPLE.forEach(p=>v[p.id]=lv(p.id));FAM.forEach(f=>v[f.id]=lv(f.id));DRACI.pl.forEach(d=>v[d.id]=lv(d.id));ZAPISY.forEach(z=>v[z.id]=2);save()}
  return {lv,nove:id=>lv(id)>(v[id]||0),videl:id=>{v[id]=lv(id);save()}};
})();
function pecId(el){const h=el.getAttribute("href")||"";if(el.dataset.id)return el.dataset.id;const m=h.match(/^#(?:osoba|rod|draconomicon|kronika)\/(.+)$/);return m?m[1]:null}
function rozpecet(host,id,zpozdeni){
  if(host.querySelector(":scope>.pecfx"))return;PEC.videl(id);
  host.classList.add("pecfx-host");const o=document.createElement("span");o.className="pecfx"+(PEC.lv(id)===1?" razit":"");o.setAttribute("aria-hidden","true");
  o.style.setProperty("--pd",(zpozdeni||0)+"ms");
  o.innerHTML='<img class="pc1" src="art/img/pecet.webp" alt=""><img class="pc2" src="art/img/pecet-zlomena.webp" alt="">';
  host.appendChild(o);setTimeout(()=>o.remove(),2600+(zpozdeni||0))}
const pecIO="IntersectionObserver" in window?new IntersectionObserver(es=>{let n=0;es.forEach(e=>{if(!e.isIntersecting)return;pecIO.unobserve(e.target);
  const id=e.target.dataset.pecid;if(id&&PEC.nove(id))rozpecet(e.target,id,(n++)*140)})},{threshold:.5}):null;
function pecProjdi(root){
  (root||document).querySelectorAll('a.pcard[href^="#osoba/"],article.card[data-id],a.drcard,a.zcard,#article .arttitle,#drmain .arttitle,#kzapisy .arttitle').forEach(el=>{
    let id=el.matches(".arttitle")?(location.hash.split("/")[1]||""):pecId(el);if(!id)return;id=decodeURIComponent(id);
    const host=el.matches(".arttitle")?el.closest(".artmain")||el.parentNode:el;
    host.classList.toggle("zapec",PEC.lv(id)===1&&!GMV);
    if(pecIO&&PEC.nove(id)&&!host.dataset.pecid){host.dataset.pecid=id;pecIO.observe(host)}});
}
/* první návštěva hráče: krátký návod – vloží se ještě před prvním vykreslením (stránka by poskočila); je v jádru, ne v části „hra“ */
(()=>{try{if(GMV||localStorage.getItem("mm-navod"))return;const v=document.querySelector('[data-view="uvod"]');if(!v)return;
  v.insertAdjacentHTML("afterbegin",`<div class="navodbar" role="note"><span><b>Poprvé tady?</b> Přihlas se za svou postavu a během sezení měj otevřenou stránku Hra.</span><a class="gbtn" href="#hra" data-navodx>Jak hrát</a><button type="button" class="kx" data-navodx aria-label="Skrýt">×</button></div>`)}catch(e){}})();
document.addEventListener("click",e=>{const x=e.target.closest("[data-navodx]");if(!x)return;try{localStorage.setItem("mm-navod","1")}catch(err){}const b=x.closest(".navodbar");if(b)b.remove()});
/* ===== Start: pečeť nových poznatků a první vykreslení stránky (dřív na konci 22-vyprava.js) ===== */
{let pq=0;new MutationObserver(()=>{if(!pq)pq=requestAnimationFrame(()=>{pq=0;pecProjdi()})}).observe(document.body,{childList:true,subtree:true})}
route();
/* hráč: stránka už je vidět, boj, karty a hra (část „hra“) se stáhnou na pozadí – puls, přihlášení a karta tak běží
   za pár vteřin i na stránkách, které je samy nepotřebují. Mapy, Výprava a editor až na vyžádání stránky.
   Vypravěč dostane všechny části hned (jeho panely sahají do map, Výpravy i editoru) a stránka se pak vykreslí znovu
   (editor doplní tlačítka „Upravit text“). */
if(window.MMLINE){const dal=async()=>{
    try{await mmLina("hra")}catch(e){return}
    if(!GMV)return;
    for(const n of ["mapa","praha","svet","editor","vyprava"])try{await mmLina(n)}catch(e){}
    /* editor přidává tlačítka: stránky s texty se vykreslí znovu; přehled vypravěče (kreslí se jen jednou a má rozepsané
       formuláře) dostane jen box „Nový záznam“ */
    {const h=document.querySelector("#gmview .gmhra");if(h&&!document.getElementById("ednovy")&&typeof edNovyBox==="function")h.insertAdjacentHTML("afterend",edNovyBox())}
    if(["desky","kronika","draconomicon","druzina"].includes(curView))route()};
  /* hráči až po načtení obrázků stránky a v klidu, aby stahování nezdrželo první zobrazení */
  const klid=()=>"requestIdleCallback" in window?requestIdleCallback(dal,{timeout:3000}):setTimeout(dal,800);
  if(GMV)setTimeout(dal,0);else if(document.readyState==="complete")klid();else addEventListener("load",klid,{once:true})}
