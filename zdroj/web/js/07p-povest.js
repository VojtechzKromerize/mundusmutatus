/* ===== Pověst družiny u rodů a měst (2026-10-30, Vojta) =====
   Stupnice −3 až +3 u každého rodu ze Zemských desek a u každého města (klíč povMestoId – obchody a cechy stojí na městě) a krátký důvod. Uloženo v nastavení
   „povest“ ({r: {idRodu: {u, pz}}}); čte každý přes mm_povest (rody, které družina nezná, databáze hráčům vyřízne), mění vypravěč
   (mm_povest_nastav). Ukazuje se v infoboxu rodu (vypravěč tam pověst mění) a na stránce Družina. Jádro: žádná volání do 10–25. */
const POVL = {
  "-3": "Krevní nepřátelé",
  "-2": "Nepřízeň",
  "-1": "Nedůvěra",
  0: "Neznámí",
  1: "Přízeň",
  2: "Spojenci",
  3: "Věrní přátelé",
};
const POVP = {
  "-3": "Rod družině usiluje o život; kdo z jeho lidí družinu potká, sáhne po zbrani nebo pošle pro posily.",
  "-2": "Dveře jsou zavřené, ceny vyšší, služebníci mlčí; pán rodu družině škodí, kde může.",
  "-1": "Podezírají vás; ověření Přesvědčování vůči lidem rodu mají nevýhodu, dokud si důvěru nezískáte.",
  0: "Rod o družině nic zvláštního neví.",
  1: "Přijmou vás pod střechu, vyslechnou a pomohou drobnou službou.",
  2: "Pomohou radou, penězi či lidmi; ověření Přesvědčování vůči lidem rodu mají výhodu.",
  3: "Postaví se za vás i za cenu ztráty; pán rodu vás hájí na sněmu i u dvora.",
};
let POV = {};
const povU = id => (POV[id] && +POV[id].u) || 0;
/* pověst ve městě (Vojta 2026-10-30: obchod stojí na městě a jeho cechách, ne na rodu): klíč „m-“ + jméno bez diakritiky */
const povMestoId = n =>
  "m-" +
  String(n || "")
    .split(",")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 58);
/* města, ve kterých lze mít pověst: sídla městských svazů v Zemských deskách a města na mapě (TOWNSEATS) */
let POVMESTA = null;
function povMesta() {
  if (POVMESTA) return POVMESTA;
  const S = new Set(TOWNSEATS);
  FAM.filter(f => f.city).forEach(f => f.seats.forEach(q => S.add(q[0])));
  POVMESTA = [...S].sort((a, b) => a.localeCompare(b, "cs"));
  return POVMESTA;
}
let POVMJ = null;
/* jméno rodu nebo města podle klíče pověsti */
function povJmeno(id) {
  if (typeof byId !== "undefined" && byId[id]) return byId[id].name;
  if (!POVMJ) POVMJ = Object.fromEntries(povMesta().map(n => [povMestoId(n), n]));
  return POVMJ[id] || "";
}
async function povNacti(prekresli) {
  if (!window.MMDB || !MMDB.povest) return false;
  let p;
  try {
    p = await MMDB.povest();
  } catch (e) {
    return false;
  }
  const r = (p && p.r) || {};
  if (JSON.stringify(r) === JSON.stringify(POV)) return false;
  POV = r;
  if (prekresli && (curView === "desky" || curView === "druzina")) route();
  povMistoObnov();
  return true;
}
async function povUloz(id, u, pz) {
  if (!GMV || !window.MMDB || !MMDB.povestNastav) return;
  try {
    const p = await MMDB.povestNastav(id, Math.max(-3, Math.min(3, Math.round(+u || 0))), String(pz || "").slice(0, 200));
    POV = (p && p.r) || {};
  } catch (e) {
    mmHlasG("Pověst se nepodařilo uložit: " + (e.message || e), 5000);
    return;
  }
  povMistoObnov();
  if (curView === "desky" || curView === "druzina") route();
  else if (typeof renderBoj === "function" && curView === "boj") renderBoj();
}
const povZnak = u =>
  `<span class="povst pov${u < 0 ? "m" : u > 0 ? "p" : "0"}${Math.abs(u)}" title="${besc(POVP[u] || "")}">${POVL[u]}${u ? ` (${u > 0 ? "+" : "−"}${Math.abs(u)})` : ""}</span>`;
/* řádek do infoboxu rodu: hráč vidí stupeň a důvod (u neznámých nic), vypravěč stupeň mění */
function povHtml(id) {
  const u = povU(id),
    pz = (POV[id] && POV[id].pz) || "";
  if (!GMV && !u && !pz) return "";
  return `<dt>Pověst družiny</dt><dd class="povdd">${povZnak(u)}${pz ? `<small class="povpz">${besc(pz)}</small>` : ""}${
    GMV
      ? `<span class="povgm"><button type="button" class="gbtn ghost" data-povu="${besc(id)}" data-povd="-1" aria-label="Pověst o stupeň horší">−</button><button type="button" class="gbtn ghost" data-povu="${besc(id)}" data-povd="1" aria-label="Pověst o stupeň lepší">+</button><button type="button" class="gbtn ghost" data-povpz="${besc(id)}" title="Důvod pověsti – uvidí ho i hráči">Důvod</button></span>`
      : ""
  }</dd>`;
}
/* přehled pro stránku Družina (a pult vypravěče): rody s jinou než nulovou pověstí, od nejlepší */
function povSeznam() {
  return Object.keys(POV)
    .filter(id => povJmeno(id) && (povU(id) || (POV[id] && POV[id].pz)))
    .sort((a, b) => povU(b) - povU(a) || povJmeno(a).localeCompare(povJmeno(b), "cs"));
}
/* pověst v panelu města na mapě (02) */
function povMistoHtml(n) {
  const h = povHtml(povMestoId(n));
  return `<dl class="kv povmisto" data-pid="${besc(povMestoId(n))}"${h ? "" : " hidden"}>${h}</dl>`;
}
/* panel města na mapě se nepřekresluje celý – pověst se v něm obnoví na místě */
function povMistoObnov() {
  document.querySelectorAll(".povmisto[data-pid]").forEach(d => {
    const h = povHtml(d.dataset.pid);
    d.innerHTML = h;
    d.hidden = !h;
  });
}
function povSeznamHtml(nadpis) {
  const L = povSeznam();
  if (!L.length)
    return GMV
      ? `<p class="rsmall">Družina zatím u žádného rodu nemá pověst. Změníš ji v infoboxu rodu (Zemské desky) nebo v panelu města na mapě tlačítky − a +, či v pultu › Nástroje.</p>`
      : "";
  return `${nadpis ? `<h3 class="uvh2">Pověst družiny</h3>` : ""}<ul class="povlist">${L.map(id => {
    const f = byId[id],
      pz = POV[id].pz || "";
    const jm = f
      ? `<a href="#rod/${besc(id)}">${typeof ARMS !== "undefined" && ARMS[id] && typeof armsImg === "function" ? armsImg(f, "armsmall") : ""}<b>${f.name}</b></a>`
      : `<span><b>${besc(povJmeno(id))}</b> <small class="povmj">město</small></span>`;
    return `<li>${jm} ${povZnak(povU(id))}${pz ? ` <small>${besc(pz)}</small>` : ""}</li>`;
  }).join("")}</ul>`;
}
document.addEventListener("click", e => {
  if (!GMV) return;
  const b = e.target.closest && e.target.closest("[data-povu]");
  if (b) {
    const id = b.dataset.povu;
    povUloz(id, povU(id) + +b.dataset.povd, (POV[id] && POV[id].pz) || "");
    return;
  }
  const d = e.target.closest && e.target.closest("[data-povpz]");
  if (d) {
    const id = d.dataset.povpz,
      t = prompt(
        `Proč má družina ${byId[id] ? "u rodu" : "ve městě"} ${povJmeno(id) || id} tuto pověst? (uvidí i hráči; prázdné = bez důvodu)`,
        (POV[id] && POV[id].pz) || "",
      );
    if (t != null) povUloz(id, povU(id), t.trim());
  }
});
