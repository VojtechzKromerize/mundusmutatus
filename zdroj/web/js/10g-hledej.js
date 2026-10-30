/* @čisté – Hledání v pravidlech (2026-10-29): normalizace textu, oddíly kapitol SRD a pořadí výsledků =====
   ČISTÝ SOUBOR: jen práce s texty a daty, žádná stránka ani jména z jiných souborů (hlídá npm run kontrola, testy v čistém Node).
   Rejstřík skládá a ukazuje 10h-hledani.js (šuplík Pravidla na Hře a hledání v záhlaví); tady je, jak se texty porovnávají:
   bez diakritiky a velkých písmen, název česky i anglicky, celé slovo v názvu má přednost před zmínkou v textu. */

/* skupiny výsledků v pořadí, v jakém se ukazují při stejné shodě; Artikule mají přednost před SRD */
const HLSKUP = [
  "Artikule",
  "Stav",
  "Pojem",
  "Pravidla SRD",
  "Kouzlo",
  "Magický předmět",
  "Vybavení",
  "Doplněk mimo SRD",
  "Protivník",
  "Osoba",
  "Nestvůra",
];
const HLVAHA = {
  Artikule: 6,
  Stav: 5,
  Pojem: 4,
  "Pravidla SRD": 2,
  Kouzlo: 2,
  "Magický předmět": 1,
  Vybavení: 1,
  "Doplněk mimo SRD": 1,
  Protivník: 2,
  Osoba: 2,
  Nestvůra: 0,
};

const hlNorm = s =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hlTxt = h =>
  String(h ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/* kapitola Pravidel SRD (HTML s nadpisy h3/h4 s id) → oddíly: h3 i se svými h4, h4 do dalšího nadpisu */
function hlOddily(html) {
  const s = String(html || ""),
    re = /<h([34])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g,
    H = [];
  let m;
  while ((m = re.exec(s))) H.push({l: +m[1], id: m[2], n: hlTxt(m[3]), a: m.index});
  return H.map((h, i) => {
    let j = i + 1;
    while (j < H.length && H[j].l > h.l) j++;
    let p = "";
    if (h.l === 4)
      for (let k = i - 1; k >= 0; k--)
        if (H[k].l < 4) {
          p = H[k].n;
          break;
        }
    return {id: h.id, n: h.n, l: h.l, p, html: s.slice(h.a, j < H.length ? H[j].a : s.length)};
  });
}

/* záznam rejstříku: g skupina, n název, en anglický název, al další jména, txt prostý text k hledání; _t a _b připraví hledání */
function hlZaznam(o) {
  const J = [o.n, o.en, ...(o.al || [])].filter(Boolean).map(hlNorm);
  return Object.assign({}, o, {
    _j: J,
    _t: J.join(" "),
    _b: hlNorm(o.txt || ""),
  });
}

/* hledání: všechna slova dotazu v názvu (nebo aspoň v textu); přesný název, začátek slova a skupina zvyšují pořadí */
function hlHledej(I, q, max = 60) {
  const Q = hlNorm(q);
  if (Q.length < 2) return [];
  const W = Q.split(" "),
    R = [];
  for (const e of I || []) {
    const t = e._t || "",
      vT = W.every(w => t.includes(w));
    if (!vT && !W.every(w => t.includes(w) || (e._b || "").includes(w))) continue;
    let s = (vT ? 20 : 3) + (HLVAHA[e.g] || 0);
    if (vT) {
      /* přesně jedno ze jmen (české, anglické, tvar) > začátky slov > začátek jména */
      const J = e._j || [t];
      if (J.includes(Q)) s += 30;
      else if (W.every(w => (" " + t).includes(" " + w))) s += 10;
      if (J.some(j => j.startsWith(Q))) s += 6;
    } else {
      const b = e._b || "";
      let n = 0;
      for (let i = b.indexOf(W[0]); i >= 0 && n < 5; i = b.indexOf(W[0], i + 1)) n++;
      s += n;
    }
    R.push([s, e]);
  }
  R.sort((a, b) => b[0] - a[0] || HLSKUP.indexOf(a[1].g) - HLSKUP.indexOf(b[1].g) || String(a[1].n).length - String(b[1].n).length);
  return R.slice(0, max).map(x => x[1]);
}

/* výsledky po skupinách: skupiny v pořadí nejlepšího výsledku, uvnitř skupiny pořadí shody */
function hlSkupiny(R) {
  const M = new Map();
  (R || []).forEach(e => {
    if (!M.has(e.g)) M.set(e.g, []);
    M.get(e.g).push(e);
  });
  return [...M.entries()];
}
