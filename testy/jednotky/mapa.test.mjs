// Mapa Zemí Koruny české (2026-10-24): města doby na mapě, význam míst (velikost značky a od kdy se ukáže jméno).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("mapa: doplněná města doby jsou mezi místy mapy", () => {
  const n = new Set(V(`PLACES.map(p => p.name)`));
  for (const m of [
    "Kouřim",
    "Stříbro",
    "Tachov",
    "Trutnov",
    "Prachatice",
    "Litovel",
    "Prostějov",
    "Košice",
    "Štýrský Hradec",
    "Augšpurk",
    "Wittenberg",
    "Čenstochová",
  ])
    assert.ok(n.has(m), m);
});

test("mapa: význam místa – metropole a hlavní města mají jméno vždy, města od přiblížení Koruny, hrady až zblízka", () => {
  assert.deepEqual(V(`["Praha", "Plzeň", "Kouřim", "Pernštejn"].map((n, i) => mistoTier(n, i < 3))`), [0, 1, 2, 3]);
  assert.deepEqual(V(`[mistoPopisek(1, 1), mistoPopisek(2, 1), mistoPopisek(2, 0.8), mistoPopisek(3, 0.8), mistoPopisek(3, 0.5)]`), [
    true,
    false,
    true,
    false,
    true,
  ]);
});

test("mapa: kraje Čech a landfrídy – každý kraj má svou oblast uvnitř Čech, landfrídy odkazují na existující kraje", async () => {
  assert.equal(V(`KRAJE.length`), 16);
  assert.deepEqual(V(`KRAJE.filter(q => q.lf && !LANDFR[q.lf]).map(q => q.n)`), []);
  assert.deepEqual(V(`KRAJE.filter(q => q.lf === "vych").map(q => q.n)`), ["Kouřimský", "Čáslavský", "Chrudimský", "Hradecký"]);
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof krajeBunky`) === "function") {
    const B = V(`krajeBunky().map(c => c.reduce((a, p) => a + p.length, 0))`);
    assert.ok(
      B.every(n => n >= 3),
      "každý kraj má oblast: " + B,
    );
    assert.ok(
      V(
        `(() => { const [x, y] = P(14.95, 50.0); return krajeBunky()[11].some(p => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; }); })()`,
      ),
      "Kouřim leží v Kouřimském kraji",
    );
  }
});

test("mapa: podklad (#mapz) se při výběru rodu nekreslí znovu, při změně vrstvy podkladu ano", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof drawMapK`) !== "function") return;
  S.ev(`drawMapK()`);
  const prvni = () => S.ev(`document.getElementById("mapz").firstElementChild`);
  const z0 = prvni();
  assert.ok(z0, "podklad je nakreslený");
  assert.ok(V(`document.querySelectorAll("#map .seat").length`) > 50, "sídla jsou v horní vrstvě");
  assert.equal(V(`document.querySelectorAll("#mapz .seat").length`), 0);
  S.ev(`setSel(FAM.find(f => !f.nbr && f.seats.length).id, false)`);
  assert.equal(prvni(), z0, "výběr rodu podklad nepřekreslí");
  S.ev(`st.duchy = true; drawMapK()`);
  assert.notEqual(prvni(), z0, "vrstva Země a knížectví je v podkladu");
  S.ev(`st.duchy = false; setSel(null, false)`);
});

test("mapa: lem ikon sídel – roztažení čtvercem jako feMorphology, bez plátna ikona s filtrem jako dřív", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof mikRoztahni`) !== "function") return;
  /* jeden neprůhledný bod uprostřed 5 × 5, poloměr 1 → čtverec 3 × 3 */
  const A = V(`Array.from(mikRoztahni(Uint8ClampedArray.from({length: 25}, (_, i) => (i === 12 ? 255 : 0)), 5, 1))`);
  assert.deepEqual(
    A.map((v, i) => (v ? i : -1)).filter(i => i >= 0),
    [6, 7, 8, 11, 12, 13, 16, 17, 18],
  );
  assert.equal(V(`mapIkona(CASTLEICO, "xyz", false, 14)`), null, "neznámé vyznání nemá lem");
  const e = V(
    `(() => { const e = mapIkEl(CASTLEICO, "kat", false, 14, 100, 100, 0.66, 1); return [e.getAttribute("href"), e.getAttribute("filter") || e.getAttribute("width")]; })()`,
  );
  assert.ok(e[0] === "art/img/hrad.webp" ? e[1] === "url(#tout-kat)" : /^data:image\/png/.test(e[0]), "bez plátna filtr, jinak hotová ikona");
});

test("mapa: posun v nakreslené oblasti (okraj MAPM) se nepřekresluje, přiblížení a daleký posun ano", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof drawMapK`) !== "function") return;
  S.ev(`st.vb = [100, 100, 300, 300 * 605 / 680]; drawMapK()`);
  const D = V(`mapKresba.d`);
  assert.deepEqual(D.map(Math.round), [-20, -7, 540, 480], "kresba s okrajem 40 % výřezu na každé straně");
  assert.equal(V(`mapLzePosunout([150, 140, 300, 300 * 605 / 680], 300 / 680)`), true, "kousek vedle: jen posun");
  assert.equal(V(`mapLzePosunout([300, 140, 300, 300 * 605 / 680], 300 / 680)`), false, "za okraj nakreslené oblasti");
  assert.equal(V(`mapLzePosunout([150, 140, 250, 250 * 605 / 680], 250 / 680)`), false, "přiblížení mění měřítko");
  const z0 = S.ev(`document.getElementById("mapz").firstElementChild`);
  S.ev(`st.vb = [150, 140, 300, 300 * 605 / 680]; drawMapK()`);
  assert.equal(S.ev(`document.getElementById("mapz").firstElementChild`), z0, "vykreslení po posunu podklad nechá");
  assert.deepEqual(V(`mapKresba.d`), D, "nakreslená oblast zůstává");
  S.ev(`st.vb = null; drawMapK()`);
});

test("mapa: každé místo na mapě (město, hrad, sídlo rodu) má vlastní shrnutí, hrady jsou v zeměpisu jako hrady (2026-10-25)", () => {
  const bez = V(`FAM.filter(f => !f.nomap).flatMap(f => f.seats.map(sd => sd[0])).filter(n => !(CITYINFO[n] && CITYINFO[n].n))`);
  assert.deepEqual(bez, [], "panel města nesmí ukazovat text celé skupiny (Litovel mluvila o Táboru)");
  const hrady = V(`ZEMEPIS.filter(z => z[4] === "hrad").map(z => z[0])`);
  for (const h of ["Karlštejn", "Křivoklát", "Bouzov", "Spišský hrad", "Devín"]) assert.ok(hrady.includes(h), h);
  const n = new Set(V(`PLACES.map(p => p.name)`));
  for (const m of ["Svídnice", "Olava", "Svatý Hypolit", "Salcburk", "Varšava", "Šoproň", "Stendal"]) assert.ok(n.has(m), m);
});

test("mapa: hrad, který drží rod, je v jeho državách a panel hradu ukáže, kdo ho drží (Kost → Hazmburkové, 2026-10-25)", () => {
  assert.ok(V(`byId.haz.seats.map(s => s[0])`).includes("Kost"));
  assert.ok(V(`byId.wet.seats.map(s => s[0])`).includes("Königstein"));
  const t = V(`(() => { showCity("hce", "Kost"); return document.getElementById("detail").textContent; })()`);
  assert.match(t, /Drží[\s\S]*Zajícové z Hazmburka/);
});

test("mapa: klik na místo bez vrstvy Sídla rodů ukáže jen místo, bez rodu (Vojta 2026-10-25)", () => {
  const r = V(`(() => {
    const h0 = st.holds;
    try {
      st.holds = false;
      showMisto("Kost");
      const dt = () => [...document.querySelectorAll("#detail dt")].map(x => x.textContent);
      const a = [st.sel, dt(), document.getElementById("detail").textContent];
      st.holds = true;
      showMisto("Kost");
      return [a[0], a[1].includes("Drží"), /Házmburk/.test(a[2]), dt().includes("Drží")];
    } finally { st.holds = h0; st.misto = null; }
  })()`);
  assert.deepEqual(r, [null, false, true, true], "bez rodů žádný řádek Drží; jméno rodu jen v samotném shrnutí");
});

test("mapa: lesy mají druh pro každou plochu, bažiny zpomalí cestu a ve Výpravě jsou voda (2026-10-26)", async () => {
  await S.ev(`typeof LES_DRUH !== "undefined" || mmLina("mapa")`);
  assert.equal(V(`LES_DRUH.length === FORESTS.length && /^[sjl]+$/.test(LES_DRUH)`), true);
  assert.ok(V(`BAZINY.length`) >= 8);
  assert.ok(V(`JEZERA.some(j => j[0] === "Neziderské jezero")`));
  const [bazina, pole] = V(`[terrain([18.0, 49.74], [18.05, 49.76]), terrain([14.9, 50.6], [14.95, 50.62])]`);
  assert.ok(bazina > pole, "Poodří je pomalejší než pole");
});

test("vzdálenost v českých mílích, kilometry v závorce (2026-10-26)", () => {
  assert.equal(V(`mileTxt(76)`), "7 mil (76 km)");
  assert.equal(V(`mileTxt(11.24)`), "1 míle (11 km)");
  assert.equal(V(`mileTxt(20)`), "2 míle (20 km)");
  assert.equal(V(`mileTxt(5)`), "0,5 míle (5 km)");
  assert.equal(V(`mileTxt(17)`), "1,5 míle (17 km)");
  assert.equal(V(`mileTxt(366)`), "33 mil (366 km)");
  assert.equal(V(`mileTxt(30, true)`), "2,5 míle");
});

test("reliéf: vrchoviny zpomalí cestu méně než hory; hranice Koruny má hvozd, řeku i čáru", async () => {
  await S.ev(`typeof hraniceKoruny === "function" || mmLina("mapa")`);
  const [vrch, pole] = V(`[terrain([13.35, 49.62], [13.4, 49.64]), terrain([17.15, 49.45], [17.2, 49.47])]`);
  assert.ok(vrch > 1 && vrch < 2, "Plzeňská pahorkatina mezi polem (Haná) a horami");
  assert.ok(pole <= vrch);
  const c = V(`hraniceKoruny().reduce((o, h) => ((o[h[0]] = (o[h[0]] || 0) + 1), o), {})`);
  assert.ok(c.hvozd > 0 && c.reka > 0 && c.cara > 0, JSON.stringify(c));
});

test("krajina: panel přechodu a zpustlého kraje, Výprava v zpustlém kraji hraje setkání války (2026-10-26)", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  const i = V(`PRECHODY.findIndex(q => q[0] === "Náchodský průsmyk")`);
  S.ev(`showKraj("pre", ${i})`);
  assert.match(V(`document.getElementById("detail").textContent`), /Průsmyk.*Náchodský průsmyk/s);
  S.ev(`showKraj("zp", 0)`);
  assert.match(V(`document.getElementById("detail").textContent`), /zpustlý válkou/);
  S.ev(`setSel(null, false)`);
  if (V(`typeof vyKrajBodu`) === "function") {
    assert.equal(V(`vyKrajBodu({}, {xy: [13.1, 49.7]})`), "valka", "Plzeňsko (zle zpustlé)");
    assert.equal(V(`vyKrajBodu({}, {xy: [14.42, 50.09]})`), "pole");
  }
  if (V(`typeof drawMapK`) === "function") {
    S.ev(`st.hosp = true; st.zpustle = true; drawMapK()`);
    assert.ok(V(`document.querySelectorAll("#map .kraj").length`) >= 37 + 25, "značky přechodů a hospodářství");
    assert.ok(V(`document.querySelectorAll("#map .krajpoly").length`) === 11 + 11, "plochy oblastí a zpustlých krajů");
    S.ev(`st.hosp = false; st.zpustle = false; drawMapK()`);
  }
});

test("Výprava: přechody na trase Praha – Drážďany a jejich zdržení v délce cesty (2026-10-26)", async () => {
  await S.ev(`typeof vyPrepocti === "function" || mmLina("vyprava")`);
  if (V(`typeof vyPrepocti`) !== "function") return;
  const r =
    V(`(() => { st.ta = placeBy("Praha"); st.tb = placeBy("Drážďany"); updateRoute(); VY = VY || VY_NOVA(); VY.mapa = "koruna"; VY.zp = "pesky";
    VY.start = {datum: "1458-01-20", hodina: 8}; vyPrepocti(); return [VYS.prech.map(x => x.n), VYS.zdrzPrech, VYS.prech.reduce((a, x) => a + (x.st ? x.st.h : 0), 0)]; })()`);
  assert.ok(r[0].includes("Nakléřovský průsmyk"), JSON.stringify(r[0]));
  assert.equal(r[1], r[2], "zdržení na přechodech je součtem stavů");
  S.ev(`st.ta = st.tb = null; st.route = null`);
});

test("věrnost králi: vrstva obarví lem sídel a měst, panel místa i rodu ukáže skupinu a dobovou větu (2026-10-27)", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  assert.ok(V(`FAM.filter(f => f.vern).length`) >= 30, "rody s věrností");
  assert.deepEqual(V(`FAM.filter(f => f.vern && !VERNOST_SKUP[f.vern.v]).map(f => f.id)`), []);
  assert.deepEqual(V(`FAM.filter(f => f.vern && f.vern.t.length < 30).map(f => f.id)`), [], "každá věrnost má větu");
  const mesta = new Set(V(`ZEMEPIS.filter(z => z[4] === "mesto").map(z => z[0])`));
  assert.deepEqual(
    V(`Object.keys(VERNOST_MIST)`).filter(n => !mesta.has(n)),
    [],
    "VERNOST_MIST jen pro města na mapě",
  );
  assert.equal(V(`vernostMista("Mejdštejn", FAM)[0]`), "odpurci", "starý Oldřich na Dívčím Kameni");
  assert.equal(V(`vernostMista("Český Krumlov", FAM)[0]`), "vahaji");
  assert.equal(V(`vernostMista("Kunštát", FAM) || vernostMista("Poděbrady", FAM)`)[0], "verni");
  if (V(`typeof drawMapK`) === "function") {
    S.ev(`drawMapK()`);
    assert.equal(V(`document.querySelectorAll("#map .vrnkruh").length`), 0, "bez vrstvy žádné lemy");
    S.ev(`document.getElementById("lyVernost").click(); drawMapK()`);
    assert.ok(V(`document.querySelectorAll("#map .vrnkruh").length`) > 40, "lemy u sídel a měst");
    assert.equal(V(`document.getElementById("vernlegend").hidden`), false);
    S.ev(`showMisto("Vratislav")`);
    assert.match(V(`document.getElementById("detail").textContent`), /Odpůrci.*kacíře/s);
    S.ev(`show("ste")`);
    assert.match(V(`document.getElementById("detail").textContent`), /Věrnost.*Věrní králi/s);
    S.ev(`setSel(null, false); document.getElementById("lyVernost").click()`);
    assert.equal(V(`st.vern`), false);
  }
});
