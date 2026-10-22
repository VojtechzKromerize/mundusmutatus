/* ---------- Praha: plán města ---------- */
const PRAHA_TOWNS = [
  {
    id: "hrad",
    n: "Pražský hrad a Hradčany",
    d: "Hrad je od husitských bouří napůl opuštěný; král sídlí dole v Králově dvoře. Na hradě zůstala katolická kapitula a úřad nejvyššího purkrabí.",
  },
  {
    id: "mala",
    n: "Malá Strana",
    d: "Menší město pražské pod hradem. Roku 1419 vyhořelo v bojích s královskou posádkou a dodnes je v něm víc zahrad a spálenišť než domů.",
  },
  {id: "stare", n: "Staré Město", d: "Srdce Prahy a kalicha: radnice, Týn, univerzita a domy všech velkých rodů. Tady se 2. března volil král."},
  {id: "nove", n: "Nové Město", d: "Karlovo Nové Město s širokými trhy a ulicemi, nejradikálnější z pražských měst, kde kdysi kázal Jan Želivský."},
  {id: "okoli", n: "Za hradbami", d: "Vsi, vinice a vrchy kolem pražských měst – a Vítkov, kde se protrhl Závoj."},
  {
    id: "vys",
    n: "Vyšehrad",
    d: "Kdysi sídlo přemyslovských knížat a korunovační hrad. Roku 1420 ho husité vyplenili a zbořili domy kanovníků, kostely i hradby; přežilo jen Staré purkrabství a rotunda sv. Martina.",
  },
];
/* n = číslo na plánu, k = druh (dvur/urad/cirkev/hospoda), t = město, c = vyznání (kat/kal/mix/""), r = rod, p = osoba */
const PRAHA_PLACES = /*@PRAHA_PLACES@*/ [];
const PRB = {};
PRAHA_PLACES.forEach(p => (PRB[p.n] = p));
const prLinks = ps => ps.map(q => `<a class="prl" href="#praha/${q.n}"><span class="prn">${q.n}</span>${q.name}</a>`).join(", ");
let PG = null,
  pst = {sel: null, vb: null, conf: "all", kind: "all", party: false};
const PKIND = {dvur: "Dvory a domy", urad: "Obec a úřady", cirkev: "Církevní stavby", hospoda: "Hospody a lázně", anomalie: "Anomálie"};
const pcolP = p => (p.k === "anomalie" ? "var(--anom)" : pcol(p.c));
const pVis = p => p.n === pst.sel || ((pst.conf === "all" || p.c === pst.conf) && (pst.kind === "all" || p.k === pst.kind));
const GMV = /*@GM@*/ false;
const PVB0 = [-40, 20, 1160, 1220],
  PAR = PVB0[3] / PVB0[2],
  PMA = "art/mapa/";
/* názvy ulic, trhů a bran: [název, x, y, natočení] */
const PSTREETS = /*@PSTREETS@*/ [];
const pcol = c => (c === "kat" ? "var(--kat)" : c === "kal" ? "var(--kal)" : c === "mix" ? "var(--mix)" : "var(--gold)");
