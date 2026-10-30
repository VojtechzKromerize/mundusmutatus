/* ===== Pověst družiny u rodů a měst (2026-10-30, Vojta) =====
   Stupnice −3 až +3 u každého rodu ze Zemských desek (i městských svazů a zahraničních rodů) a krátký důvod. Uloženo v nastavení
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
    .filter(id => typeof byId !== "undefined" && byId[id] && (povU(id) || (POV[id] && POV[id].pz)))
    .sort((a, b) => povU(b) - povU(a) || String(byId[a].name).localeCompare(byId[b].name, "cs"));
}
function povSeznamHtml(nadpis) {
  const L = povSeznam();
  if (!L.length)
    return GMV ? `<p class="rsmall">Družina zatím u žádného rodu nemá pověst. Změníš ji v infoboxu rodu (Zemské desky) tlačítky − a +.</p>` : "";
  return `${nadpis ? `<h3 class="uvh2">Pověst družiny</h3>` : ""}<ul class="povlist">${L.map(id => {
    const f = byId[id],
      pz = POV[id].pz || "";
    return `<li><a href="#rod/${besc(id)}">${typeof ARMS !== "undefined" && ARMS[id] && typeof armsImg === "function" ? armsImg(f, "armsmall") : ""}<b>${f.name}</b></a> ${povZnak(povU(id))}${pz ? ` <small>${besc(pz)}</small>` : ""}</li>`;
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
        `Proč má družina u rodu ${(byId[id] || {}).name || id} tuto pověst? (uvidí i hráči; prázdné = bez důvodu)`,
        (POV[id] && POV[id].pz) || "",
      );
    if (t != null) povUloz(id, povU(id), t.trim());
  }
});
