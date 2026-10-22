/* ===== Karta: vybavení z nabídky (2026-10-17) – zbraně a zbroj SRD 5.2.1, výstroj, magické předměty SRD.
   Zbraň se zvolí k útoku (karta i Boj), zbroj a štít si postava oblékne, magický předmět se připoutá, je-li volné místo. ===== */
const KZBRL = [
  ["Padded Armor", 8, "lehká"],
  ["Leather Armor", 10, "lehká"],
  ["Studded Leather Armor", 13, "lehká"],
  ["Hide Armor", 12, "střední"],
  ["Chain Shirt", 20, "střední"],
  ["Scale Mail", 45, "střední"],
  ["Breastplate", 20, "střední"],
  ["Half Plate Armor", 40, "střední"],
  ["Ring Mail", 40, "těžká"],
  ["Chain Mail", 55, "těžká"],
  ["Splint Armor", 60, "těžká"],
  ["Plate Armor", 65, "těžká"],
];
const KZBRW = {
  Club: 2,
  Dagger: 1,
  Greatclub: 10,
  Handaxe: 2,
  Javelin: 2,
  "Light Hammer": 2,
  Mace: 4,
  Quarterstaff: 4,
  Sickle: 2,
  Spear: 3,
  Dart: 0.25,
  "Light Crossbow": 5,
  Shortbow: 2,
  Sling: 0,
  Battleaxe: 4,
  Flail: 2,
  Glaive: 6,
  Greataxe: 7,
  Greatsword: 6,
  Halberd: 6,
  Lance: 6,
  Longsword: 3,
  Maul: 10,
  Morningstar: 4,
  Pike: 18,
  Rapier: 2,
  Scimitar: 3,
  Shortsword: 2,
  Trident: 4,
  Warhammer: 5,
  "War Pick": 2,
  Whip: 3,
  "Hand Crossbow": 3,
  "Heavy Crossbow": 18,
  Longbow: 2,
  Musket: 10,
  Pistol: 3,
  Blowgun: 1,
  Shield: 6,
};
const KVYBS = [
  ["Arrows (20)", 1],
  ["Bolts (20)", 1.5],
  ["Sling Bullets (20)", 1.5],
  ["Firearm Bullets (10)", 2],
  ["Backpack", 5],
  ["Bedroll", 7],
  ["Blanket", 3],
  ["Candle", 0],
  ["Chain (10 feet)", 10],
  ["Crowbar", 5],
  ["Flask", 1],
  ["Grappling Hook", 4],
  ["Healer's Kit", 3],
  ["Holy Water (flask)", 1],
  ["Holy Symbol", 1],
  ["Hunting Trap", 25],
  ["Lamp", 1],
  ["Hooded Lantern", 2],
  ["Manacles", 6],
  ["Oil (flask)", 1],
  ["Pouch", 1],
  ["Rations (1 day)", 2],
  ["Rope (50 feet)", 5],
  ["Sack", 0.5],
  ["Shovel", 5],
  ["Iron Spikes (10)", 5],
  ["Tinderbox", 1],
  ["Torch", 1],
  ["Waterskin", 5],
  ["Component Pouch", 2],
  ["Spellbook", 3],
  ["Thieves' Tools", 1],
  ["Climber's Kit", 12],
  ["Herbalism Kit", 3],
  ["Poisoner's Kit", 2],
  ["Mirror", 0.5],
  ["Ink", 0],
  ["Paper (sheet)", 0],
  ["Parchment (sheet)", 0],
  ["Caltrops", 2],
  ["Ball Bearings", 2],
  ["Clothes, Traveler's", 4],
  ["Clothes, Fine", 6],
];
const KZBRV = (() => {
  try {
    return JSON.parse(localStorage.getItem("mm-zbrv") || "{}") || {};
  } catch (e) {
    return {};
  }
})();
const kZbrvUloz = () => {
  try {
    localStorage.setItem("mm-zbrv", JSON.stringify(KZBRV));
  } catch (e) {}
};
let KPOOLM = null,
  KPOOLO = false;
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (d.matches && d.matches("details[data-kpoolw]")) KPOOLO = d.open;
  },
  true,
);
function kPool() {
  if (KPOOLM && KPOOLM.$p === !!PRED && KPOOLM.$v === !!(typeof VYB !== "undefined" && VYB)) return KPOOLM;
  const M = {$p: !!PRED, $v: !!(typeof VYB !== "undefined" && VYB)},
    add = (l, o) => {
      M[l] = o;
    };
  if (M.$v) {
    /* katalog vybavení (2026-10-20): vše s českým názvem a cenou; magické předměty SRD navíc s pravidly z predmety.json */
    VYBSK.forEach(([sk]) =>
      (VYB[sk] || []).forEach(x => {
        const e = vybPoolVstup(x);
        if (e.mag && PREDBY[e.mag]) e.upr = PREDBY[e.mag].upr || "";
        add(vybPopisekPool(x), e);
      }),
    );
    (PRED || []).forEach(x => {
      if (!Object.values(M).some(e => e && e.mag === x.id))
        add(
          `${x.en}${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` (${x.cz})` : ""} – ${String(x.druh || "").toLowerCase()}, ${x.vz || ""}${x.pr ? ", připoutání" : ""}`,
          {k: "mag", n: x.en, mag: x.id, upr: x.upr || ""},
        );
    });
    return (KPOOLM = M);
  }
  KZBRAN.forEach(r =>
    add(`${r[1]} – ${r[5] === "S" ? "jednoduchá" : "válečná"} zbraň ${r[2]} ${BZRT[r[3]] || r[3]}${r[6] ? ", na dálku" : ""}`, {
      k: "zbr",
      n: r[1],
      w: KZBRW[r[1]],
    }),
  );
  KZBRL.forEach(([n, w, d]) => {
    const i = kZbrInfo({n});
    add(
      `${n} – ${d} zbroj, AC ${i ? i.ac : "?"}${i && i.max != null ? ` + AGI (nejvýš ${i.max > 8 ? "bez omezení" : "+" + i.max})` : i && i.max == null ? "" : " + AGI"}`,
      {k: "zbroj", n, w},
    );
  });
  add("Shield – štít, +2 AC", {k: "zbroj", n: "Shield", w: 6});
  KVYBS.forEach(([n, w]) => add(`${n} – výstroj`, {k: "vyb", n, w}));
  (PRED || []).forEach(x =>
    add(
      `${x.en}${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` (${x.cz})` : ""} – ${String(x.druh || "").toLowerCase()}, ${x.vz || ""}${x.pr ? ", připoutání" : ""}`,
      {k: "mag", n: x.en, mag: x.id, upr: x.upr || ""},
    ),
  );
  return (KPOOLM = M);
}
/* základ magické zbraně nebo zbroje podle „upr“ (Longsword, jakákoli zbraň na blízko, jakákoli střední nebo těžká…) */
function kPoolZaklady(e) {
  if (!e || e.k !== "mag") return [];
  const u = String(e.upr || ""),
    x = PREDBY[e.mag] || {},
    W = KZBRAN.map(r => r[1]),
    A = [...KZBRL.map(r => r[0]), "Shield"];
  if (!u) return [];
  if (/munice/i.test(u)) return ["Arrows", "Bolts", "Sling Bullets"];
  const jm = [...W, ...A].filter(n => new RegExp("\\b" + n.replace(/ Armor$/, "") + "\\b", "i").test(u));
  if (!/jakákoli/i.test(u)) return jm.length ? jm : [];
  if (x.druh === "Zbroj" || /lehká|střední|těžká/i.test(u)) {
    let L = KZBRL.filter(
      r => (/lehká/i.test(u) && r[2] === "lehká") || (/střední/i.test(u) && r[2] === "střední") || (/těžká/i.test(u) && r[2] === "těžká"),
    ).map(r => r[0]);
    if (/kromě hide/i.test(u)) L = L.filter(n => n !== "Hide Armor");
    return L;
  }
  if (/na blízko/i.test(u)) return KZBRAN.filter(r => !r[6]).map(r => r[1]);
  return W;
}
function kPoolDopl(e) {
  const Z = kPoolZaklady(e),
    bon = e && e.k === "mag" && /\+1, \+2, or \+3/.test(e.n);
  return `${Z.length ? `<select name="zakl" aria-label="Základ předmětu">${Z.map(n => `<option>${besc(n)}</option>`).join("")}</select>` : ""}${bon ? `<select name="bon" aria-label="Bonus"><option value="1">+1</option><option value="2">+2</option><option value="3">+3</option></select>` : ""}`;
}
/* po načtení katalogu jen doplní nabídku (datalist) – nepřekresluje kartu, aby nezavřela rozepsaný formulář */
function kPoolDatalist() {
  document.querySelectorAll("datalist[id^=kpooll-]").forEach(d => {
    d.innerHTML = Object.keys(kPool())
      .filter(k => k[0] !== "$")
      .map(l => `<option value="${besc(l)}"></option>`)
      .join("");
  });
}
function kPoolHtml(K) {
  if (!kMuze(K)) return "";
  if (typeof vybNacti === "function" && !VYB)
    vybNacti()
      .then(kPoolDatalist)
      .catch(() => {});
  const M = kPool();
  return `<details class="bjapd kpool" data-kpoolw${KPOOLO ? " open" : ""}><summary>Přidat z nabídky – zbraně, zbroj, výstroj, magické předměty</summary>
    <form class="kvlh kpoolf" data-kpoolf><input name="p" list="kpooll-${besc(K.id)}" placeholder="hledat: Longsword, Breastplate, Rope, Flame Tongue…" data-kpoolq autocomplete="off" required>
      <datalist id="kpooll-${besc(K.id)}">${Object.keys(M)
        .filter(k => k[0] !== "$")
        .map(l => `<option value="${besc(l)}"></option>`)
        .join("")}</datalist>
      <span class="kpoolx" data-kpoolx></span><input name="q" type="number" min="1" max="999" value="1" aria-label="Počet" style="width:4.5em"><button class="gbtn">Přidat</button></form>
    <p class="kdbnote">Zbraň se rovnou zvolí k útoku (i v Boji), zbroj a štít si postava oblékne a AC se přepočítá, magický předmět se připoutá, je-li volné místo (nejvýš 3). Celý přehled s cenami a popisy: <a href="#pravidla/vybaveni">Pravidla › Vybavení</a>.${PRED ? "" : " Magické předměty se načítají…"}</p></details>`;
}
const kJeZbran = (K, n) => !/beze zbraně|unarmed/i.test(n) && !kSeznam(K).some(x => String(x.n).toLowerCase() === String(n).toLowerCase());
const kLbTxt = w => (w > 0 ? `${String(Math.round(w * 100) / 100).replace(".", ",")} lb.` : "");
async function kPoolPridej(K, F) {
  const f = F.elements,
    e = kPool()[f.p.value.trim()];
  if (!e) {
    mmHlasG("Vyber položku z nabídky (začni psát a klepni na návrh).", 3500);
    return;
  }
  const q = Math.max(1, Math.min(999, Math.round(+f.q.value || 1))),
    zakl = f.zakl ? f.zakl.value : "",
    bon = f.bon ? +f.bon.value : 0;
  await kVybPridej(K, e, q, {zakl, bon});
  f.p.value = "";
  const x = F.querySelector("[data-kpoolx]");
  if (x) x.innerHTML = "";
  f.q.value = 1;
}
/* přidání položky nabídky (zbraň, zbroj, výstroj, magický předmět, cokoli z katalogu) do vybavení postavy – 2026-10-20 společné
   pro nabídku na kartě i stránku Pravidla › Vybavení */
async function kVybPridej(K, e, q, o) {
  o = o || {};
  const zakl = o.zakl || "",
    bon = +o.bon || 0;
  let n = e.n,
    w1 = e.w || 0;
  if (e.k === "mag") {
    const x = PREDBY[e.mag] || {};
    if (zakl) {
      w1 = KZBRW[zakl] ?? (KZBRL.find(r => r[0] === zakl) || [])[1] ?? 0;
      const gn = x.en && x.en.match(/^(Weapon|Armor|Shield|Ammunition), \+(\d)$/);
      n = bon ? `${zakl} +${bon}` : gn ? `${zakl} +${gn[2]}` : new RegExp("\\b" + zakl + "\\b", "i").test(x.en) ? x.en : `${x.en} (${zakl})`;
    } else if (bon) n = x.en.replace(/,?\s*\+1, \+2, or \+3/, ` +${bon}`);
  }
  n = n.slice(0, 80);
  const S = kartaStav(K.id),
    inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
    it = {n, q},
    msg = [];
  if (w1) it.w = kLbTxt(w1 * q);
  if (e.mag) it.mag = e.mag;
  const P = e.mag ? PREDBY[e.mag] : null,
    pr = (P && P.pr) || e.pr;
  /* položka katalogu se v inventáři pozná podle jména (databáze zná jen klíče n, q, w, mag…) */ if (pr) {
    if (inv.filter(y => y.pripoutano).length < 3) {
      it.pripoutano = true;
      msg.push("připoutáno");
    } else msg.push("připoutat nejde – už 3 předměty (uvolni jeden ◆)");
  }
  const r = kZbrInfo(it);
  if (r) {
    inv.forEach(y => {
      const z = kZbrInfo(y);
      if (z && z.k === r.k) y.obl = false;
    });
    it.obl = true;
    msg.push(r.k === "s" ? "štít v ruce" : "zbroj na sobě");
  }
  const ex = !r && !kZbranInfo(n) ? inv.findIndex(y => String(y.n).toLowerCase() === n.toLowerCase() && (y.mag || "") === (it.mag || "")) : -1;
  if (ex >= 0) {
    inv[ex].q = Math.min(9999, (+inv[ex].q || 0) + q);
    if (w1) inv[ex].w = kLbTxt(w1 * inv[ex].q);
  } else inv.push(it);
  const ac0 = kAC(K);
  await kartaStavZmen(K.id, {inv});
  if (kZbranInfo(n) && !/^(arrows|bolts|sling bullets)/i.test(n)) {
    KZBRV[K.id] = n;
    kZbrvUloz();
    msg.push("zbraň zvolena k útoku");
    kartyPrekresli();
  }
  mmHlasG(
    `${K.n}: ${n}${q > 1 ? ` ×${q}` : ""} ve vybavení${msg.length ? " – " + msg.join(", ") : ""}${kAC(K) !== ac0 ? ` · AC ${ac0} → ${kAC(K)}` : ""}.`,
    6000,
  );
}
document.addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kpoolq]")) return;
  const x = t.form && t.form.querySelector("[data-kpoolx]");
  if (!x) return;
  const en = kPool()[t.value.trim()];
  const h = en ? kPoolDopl(en) : "";
  if (x.innerHTML !== h) x.innerHTML = h;
});
document.addEventListener("submit", e => {
  if (!e.target.matches || !e.target.matches("[data-kpoolf]")) return;
  e.preventDefault();
  const K = kvK(e.target);
  if (K) kPoolPridej(K, e.target);
});
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kzbrv]");
  if (!b) return;
  const K = kvK(b);
  if (!K) return;
  const n = b.dataset.kzbrv;
  if (KZBRV[K.id] === n) delete KZBRV[K.id];
  else KZBRV[K.id] = n;
  kZbrvUloz();
  kartyPrekresli();
});
/* ===== Boj: karta postavy hráče ve formátu karty NPC (2026-10-17) – hlavička (AC, životy, R), rozbalená část
   se stavy, krytem, útoky z karty, kouzly, zdroji, záchranami a akcemi. Vypravěč má rozbalenou postavu na tahu
   a může za hráče zapsat, co udělal (útok hozený fyzickými kostkami, zranění, záchrany). ===== */
const BGMU = {};
/* sdílené části karty i bojové karty: čipy stavů s výběrem, čipy zdrojů, pruh hlášení */
const KSTP = new Set(),
  BTABH = {},
  BHPT = {};
/* tabulka stavů (jako Conditions v D&D Beyond): ikona, název, přepínač, rozbalení s pravidlem; vyčerpání po úrovních */
function kStavyTab(akt, vse, attr, vy, konN) {
  const L = [...vse].sort((a, b) => a.localeCompare(b, "cs")),
    cap = t => t[0].toUpperCase() + t.slice(1);
  const row = t => {
    const on = akt.includes(t),
      d = SRDST[t],
      ic = SRDIC[t] ? bi(SRDIC[t]) : BSTI[t] ? bi(BSTI[t][0]) : "",
      txt = d
        ? d.t
        : t === "soustředí"
          ? "Soustředíš se na kouzlo (Concentration). Zranění = CON záchrana (SO 10 nebo polovina zranění, víc z obou), stav Neschopný soustředění ukončí; najednou jen jedno kouzlo."
          : t === "úhyb"
            ? "Úhyb (Dodge): útoky na tebe mají nevýhodu, AGI záchrany máš s výhodou – do začátku tvého příštího tahu."
            : "";
    return `<details class="kstr${on ? " on" : ""}"><summary><span class="kstri">${ic}</span><span class="kstrn">${besc(cap(t))}${d ? ` <small>${besc(d.en)}</small>` : t === "soustředí" ? ` <small>Concentration</small>${konN && on ? ` <b class="kstrkon">· ${besc(konN)}</b>` : ""}` : ""}</span><button type="button" class="kstrs" role="switch" ${attr}="${besc(t)}" aria-checked="${on}" aria-label="${besc(cap(t))}: ${on ? "zapnuto" : "vypnuto"}"><i></i></button><span class="kstrv" aria-hidden="true"></span></summary>${txt ? `<p>${besc(cap(txt))}.</p>`.replace(/\.\.<\/p>$/, ".</p>") : ""}</details>`;
  };
  return `<div class="kstab">${L.map(row).join("")}<div class="kstrx"><div class="kstrxh"><span class="kstri">${bi("vycerpani")}</span><span class="kstrn">Vyčerpání <small>Exhaustion</small></span><b>${vy ? `${vy}. úroveň` : "–"}</b></div>
    <div class="kstrxl" role="group" aria-label="Úroveň vyčerpání">${[0, 1, 2, 3, 4, 5, 6].map(n => `<button type="button" data-kvyn="${n}" aria-pressed="${(vy || 0) === n}">${n || "–"}</button>`).join("")}</div>
    ${vy ? `<p class="bdmnote">−${2 * vy} ke všem hodům d20, rychlost −${5 * vy} stop${vy >= 6 ? " · 6. úroveň = smrt" : ""}. Dlouhý odpočinek ubere jednu úroveň.</p>` : ""}</div></div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kvyn]");
  if (!b) return;
  const K = kvK(b);
  if (!K || !kMuze(K)) return;
  const n = +b.dataset.kvyn;
  kartaStavZmen(K.id, {vycerp: n || null}, n ? `${K.n}: vyčerpání ${n}.` : `${K.n}: bez vyčerpání.`);
});
/* přepínač ve <summary> nesmí rozbalit řádek */
document.addEventListener(
  "click",
  e => {
    const s = e.target.closest && e.target.closest(".kstrs");
    if (s) e.preventDefault();
  },
  true,
);
function kStavyChipy(key, akt, vse, attr, popis) {
  const open = KSTP.has(key);
  return `<span class="kstch">${akt.map(t => `<button type="button" class="kchip kchst" ${attr}="${besc(t)}" ${btip((popis(t) || t) + " – klikni a zruš")}>${SRDIC[t] ? bi(SRDIC[t]) : BSTI[t] ? bi(BSTI[t][0]) : ""}<span>${besc(t)}</span><i aria-hidden="true">×</i></button>`).join("")}<button type="button" class="kchip kchadd" data-kstp="${besc(key)}" aria-expanded="${open}">${open ? "hotovo" : "+ stav"}</button></span>${
    open
      ? `<span class="kstpick">${vse
          .filter(t => !akt.includes(t))
          .map(
            t =>
              `<button type="button" class="kchip" ${attr}="${besc(t)}" ${btip(popis(t) || t)}>${SRDIC[t] ? bi(SRDIC[t]) : BSTI[t] ? bi(BSTI[t][0]) : ""}<span>${besc(t)}</span></button>`,
          )
          .join("")}</span>`
      : ""
  }`;
}
function kZdrChipy(L, U, attr) {
  return L.length
    ? `<span class="kzdch">${L.map(q => {
        const u = Math.min(q.max, U[q.k] || 0),
          zb = q.max - u;
        return `<span class="kchip kzdc${zb ? "" : " kzd0"}"><button type="button" ${attr}="${besc(q.k)}" data-j="${Math.min(u, q.max - 1)}" ${zb ? "" : "disabled "}${btip(`${q.n}: ${zb ? "klikni a utrať jedno" : "vše použito"}${q.obn ? " · obnova: " + q.obn : ""}`)}><span>${besc(q.n)}</span><b>${zb}/${q.max}</b></button>${u ? `<button type="button" class="kzdv" ${attr}="${besc(q.k)}" data-j="${u - 1}" aria-label="Vrátit jedno – ${besc(q.n)}" ${btip("Vrátit jedno použití")}>↺</button>` : ""}</span>`;
      }).join("")}</span>`
    : "";
}
const kHlas = parts => {
  const p = parts.filter(Boolean);
  return p.length ? `<div class="khlas" role="status">${p.join("")}</div>` : "";
};
/* rozdělení hlášek na úkoly (mají tlačítko s rozhodnutím) a informace */
const KHUKOL = /data-(bzr|brip|kpok|kkonh|kkonx|jukonh|jukonx|juhexp|juposl|bhds="hod"|bhrdygo|kvyb|navok|navne|vyzod|bjsik|kodkz|bdmobet)/;
function kHlasRozdel(hl) {
  const inner = String(hl || "")
      .replace(/^<div class="khlas"[^>]*>/, "")
      .replace(/<\/div>$/, ""),
    parts = inner ? inner.split(/(?=<(?:p|div) class="khl)/).filter(Boolean) : [];
  return {ukol: parts.filter(x => KHUKOL.test(x)), info: parts.filter(x => !KHUKOL.test(x))};
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kstp]");
  if (!b) return;
  const k = b.dataset.kstp;
  if (KSTP.has(k)) KSTP.delete(k);
  else KSTP.add(k);
  if (curView === "boj") renderBoj();
  else kartyPrekresli();
});
/* tah hráče: pohyb, akce, bonusová akce (na tomto zařízení), reakce (v boji) */
function bojBpt(s) {
  const k = `${s.kolo}:${s.tah}`;
  if (BPT.k !== k) {
    BPT.k = k;
    BPT.p = BPT.a = BPT.b = 0;
  }
  return BPT;
}
function bojBptOznac(c) {
  if (!BOJ.s || !BOJ.s.aktivni) return;
  bojBpt(BOJ.s);
  if (c === "A") BPT.a = 1;
  else if (c === "BA") BPT.b = 1;
}
function bojHracKarta(s, h, gm, vzdy) {
  const K = bojKartaH(h),
    ob = s.obsazeni || {},
    tah = s.tah || 0,
    jed = Object.keys(ob).some(k => ob[k] === h.id && +k < tah),
    natahu = ob[tah] === h.id;
  if (gm && K && BDM.fokus && BDM.fokus === K.id) {
    bojVyber(h.id);
    BTAB = "k";
    BDM.fokus = null;
    setTimeout(() => {
      const c = document.querySelector(`[data-bhcard="${CSS.escape(h.id)}"]`);
      if (c) c.scrollIntoView({block: "start", behavior: "smooth"});
    }, 60);
  }
  const open = vzdy || (gm && bojOtevr(s, h)),
    st = (h.stav || []).filter(t => BSTI[t]),
    rk = !!(s.reak || {})[h.id],
    rd = (s.ready || {})[h.id],
    kr = (bojKritPC()[h.n] || []).length;
  const mx = K ? kHPmax(K) : 0,
    cur = K ? bojHpPC(h, K) : 0,
    ks = K ? kartaStav(K.id) : {},
    pr = K ? Math.max(0, Math.min(100, Math.round((cur / mx) * 100))) : 0,
    ac = K ? kAC(K) + (+h.kryt || 0) : null;
  const hp = K
    ? `<span class="bhpw"><label class="bhp${cur <= 0 ? " bhp0" : cur <= mx / 2 ? " bhp2" : ""}" ${btip("Životy z karty: číslo nastaví, −12 odečte (zranění), +5 přičte (léčení) – Enter")}><span class="vh">HP</span><input type="text" autocomplete="off" enterkeyhint="done" inputmode="numeric" name="bjhp-${h.id}" data-bjhp="${h.id}" value="${cur}" aria-label="Životy – ${besc(h.n)}"${!gm && !kMuze(K) ? " readonly" : ""}><small>/${mx}${ks.thp ? ` +${ks.thp}` : ""}</small><i style="--p:${pr}%"></i></label></span>`
    : "";
  const acH = K
    ? `<span class="bracw" role="img" aria-label="AC ${ac}" ${btip(`AC ${kAC(K)}${h.kryt ? ` + kryt ${h.kryt}` : ""}: ${kACR(K).txt}`)}><span class="brac">${ac}</span></span>`
    : "";
  const sub = K
    ? `<small>${besc(
        [
          kTridy(K)
            .map(t => t.n + " " + t.u)
            .join(" / ") || K.povolani,
          K.druh,
        ]
          .filter(Boolean)
          .join(" · "),
      )}</small>`
    : "";
  const P = bojBpt(s),
    mojeTah = vzdy && natahu;
  const pips = `<span class="btpips" role="group" aria-label="Tah">${
    mojeTah
      ? [
          ["p", "Pohyb", "P"],
          ["a", "Akce", "A"],
          ["b", "Bonusová akce", "BA"],
        ]
          .map(
            ([k, l, z]) =>
              `<button type="button" data-btp="${k}" aria-pressed="${!!P[k]}" ${btip(`${l}: ${P[k] ? "použito" : "k dispozici"} – klikni`)}>${z}</button>`,
          )
          .join("")
      : ""
  }<button type="button" class="break${rk ? " on" : ""}" ${gm ? `data-break="${h.id}"` : vzdy ? "data-bhrk" : "disabled"} aria-pressed="${rk}" ${btip(`Reakce – ${h.n}: ${rk ? "použita" : "k dispozici"}${gm || vzdy ? " (klikni)" : ""}`)}>R</button></span>`;
  const head = `<div class="bnh">${bojMedH(h)}<span class="bnn"${gm && !vzdy ? ` data-bhrozb="${h.id}"` : ""}><b>${besc(h.n)}</b>${sub}</span>${acH}${hp}${kr ? `<span class="bkrb" ${btip(`Neléčená kritická zranění: ${(bojKritPC()[h.n] || []).map(x => x.t).join("; ")}`)}>${bi("rana")}${kr}</span>` : ""}${bojDsPip(h)}${!open && st.length ? `<span class="bstavy bakt">${st.map(t => `<span class="bst" role="img" aria-label="${besc(BSTI[t][1])}" ${btip(BSTI[t][1])}>${bi(BSTI[t][0])}</span>`).join("")}</span>` : ""}${!open && h.kryt ? `<span class="bkrbd" ${btip(`Za krytem: AC +${h.kryt}`)}>${bi(+h.kryt >= 5 ? "kryt-3-4" : "kryt-pul")}<small>+${h.kryt}</small></span>` : ""}${!open && rd ? `<b class="brdyh" ${btip("Připravená akce: " + rd)}>⏳</b>` : ""}${K && KKON[K.id] && kKonDrzi(K) ? `<span class="bkonbd" ${btip(`Soustředění: CON záchrana SO ${KKON[K.id]}`)}>${bi("soustredi")}<small>SO ${KKON[K.id]}</small></span>` : ""}${vzdy ? "" : `<span class="btahy" role="img" aria-label="${jed ? "V tomto kole jednal" : "Ještě nejednal"}" ${btip(jed ? "V tomto kole už jednal" : natahu ? "Je na tahu" : "V tomto kole ještě nejednal")}>${bi(jed ? "tahok" : "tah", jed ? "on" : "")}</span>`}${pips}${vzdy || !gm ? "" : `<button type="button" class="brozb" data-bhrozb="${h.id}" aria-expanded="${open}" aria-label="${open ? "Sbalit" : "Rozbalit"} kartu" ${btip(open ? "Sbalit kartu" : "Rozbalit – útok, kouzla, akce, záchrany")}>${bi("sipka")}</button>`}</div>`;
  return `<div class="bnpc bhrk${open ? " bopen" : ""}${natahu ? " bnatahu" : ""}${h.ds ? " bhdsr" : ""}" data-bhcard="${h.id}"${open ? ` data-bhpan="${h.id}"` : ""}${K ? ` data-kid="${besc(K.id)}"` : ""} style="--mc:var(--bh,#2c517f)">${open && K ? bojHracRef(s, h, gm, K, vzdy, {pips}) : head + (open ? bojHracRef(s, h, gm, K, vzdy) : "")}</div>`;
}
function bojHracRef(s, h, gm, K, vzdy, dbm) {
  if (!K) return `<div class="bref">${bojHracPanel(h, s, gm)}</div>`;
  const st = h.stav || [],
    d = h.ds,
    rd = (s.ready || {})[h.id],
    natahu = (s.obsazeni || {})[s.tah] === h.id,
    mojeTah = vzdy && natahu,
    BP = bojBpt(s),
    rk0 = !!(s.reak || {})[h.id];
  const stav = kStavyChipy(
    "b:" + h.id,
    st.filter(t => BSTAVH.includes(t)),
    BSTAVH,
    "data-bhst",
    t => (BSTI[t] || [0, t])[1],
  );
  const kry = `<button type="button" class="kchip${h.kryt ? " on" : ""}" data-bhkr="${h.kryt === 5 ? 0 : h.kryt === 2 ? 5 : 2}" ${btip(`Kryt: ${h.kryt === 5 ? "tříčtvrteční (+5)" : h.kryt === 2 ? "poloviční (+2)" : "žádný"} – klikni: žádný → ½ → ¾`)}>${bi(h.kryt === 5 ? "kryt-3-4" : "kryt-pul")}<span>${h.kryt === 5 ? "kryt ¾" : h.kryt === 2 ? "kryt ½" : "kryt"}</span></button>`;
  const typ = `<label class="kchip kchtyp" ${btip("Typ zranění pro pole životů v hlavičce (odolnosti se započtou)")}>${bi("zraneni")}<select data-bhpt="${h.id}" aria-label="Typ zranění">${[["", "bez typu"], ...BZTYPY.map(t => [t, BZRT[t]])].map(([v, l]) => `<option value="${v}"${(BHPT[h.id] || "") === v ? " selected" : ""}>${l}</option>`).join("")}</select></label><button type="button" class="kchip" data-bhthp="${h.id}" ${btip("Dočasné HP (nesčítají se – platí vyšší)")}>+ dočasné</button>`;
  const bar = `<div class="kbar1">${stav}${kry}${typ}<a class="kchip" href="#karty/${besc(K.id)}" ${btip("Celá karta postavy")}>karta →</a></div>`;
  /* hlášení: Pokušení/Požehnání, soustředění, hody proti smrti, připravená akce, výsledek útoku nebo hodu */
  const dsH = d
    ? d.st
      ? `<p class="khl">${bojDsPip(h)} <b>${d.st === "mrtev" ? "Tři neúspěchy – umírá." : "Stabilizován – do konce boje mimo hru."}</b> <button type="button" class="gbtn ghost" data-bhds="x">${d.st === "mrtev" ? "Zrušit" : "Zpět do boje"}</button></p>`
      : `<p class="khl">${bi("prah-smrti")} <b>Na prahu smrti</b> ${bojDsPip(h)} <button type="button" class="gbtn" data-bhds="hod">🎲 Hod proti smrti</button>${gm ? `<button type="button" class="gbtn ghost" data-bhds="u">+ úspěch</button><button type="button" class="gbtn ghost" data-bhds="n">+ neúspěch</button><button type="button" class="gbtn ghost" data-bhds="stab">stabilizovat</button>` : `<label class="bhdsv">svůj hod <input type="number" inputmode="numeric" min="1" max="20" data-bhdsv aria-label="Vlastní hod proti smrti (d20)"></label>`}<button type="button" class="gbtn ghost" data-bhds="x">vstal</button></p>`
    : "";
  const kon =
    KKON[K.id] && kKonDrzi(K)
      ? `<p class="khl">${bi("soustredi")} <b>Soustředění</b>: CON záchrana SO ${KKON[K.id]} <button type="button" class="gbtn" data-kkonh>🎲 CON ${bsg(kZach(K, "CON"))}${K.konVyhoda ? " s výhodou" : ""}</button><button type="button" class="kx" data-kkonx aria-label="Zavřít">×</button></p>`
      : gm
        ? ""
        : bojKonHtml(h);
  const rdy = rd
    ? `<p class="khl">⏳ <b>Připravená akce:</b> ${besc(rd)} <button type="button" class="gbtn ghost" data-bhrdygo>Spustit (reakce)</button><button type="button" class="kx" data-bhrdyx aria-label="Zrušit">×</button></p>`
    : "";
  const c = (s.npc || []).filter(
      o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
    ),
    c0 = c.find(o => o.id === BJU.cil);
  const shUt = !gm && BDM.sheet && BDM.sheet.t === "utok",
    plak = !gm && !shUt ? bojJaPlak(K, c) : "";
  /* hláška „Tvůj tah“ s přehledem zmizela (2026-10-21): kdo je na tahu, říká osa, sloty a stavy jsou na kartě */
  /* výsledek hodu hráče a Pokušení z útoku jsou nahoře (sbalené hlášky ukazují jen první); s otevřeným listem útoku jsou přímo v něm (2026-10-20) */
  const zavUt = shUt && KZAV[K.id] && /^Útok/.test(KZAV[K.id].co || "");
  const hl = kHlas([
    vzdy ? kZasahHtml(K, h, s) : "",
    vzdy && !gm ? kRipHtml(K, h, s) : "",
    vzdy && !gm && typeof kOdvHtml === "function" ? kOdvHtml(K, h, s) : "",
    plak,
    s.aktivni ? bojJaHexHtml(s, h, K) : "",
    zavUt ? "" : kZavBox(K),
    kon,
    dsH,
    rdy,
    kPoslBox(K),
  ]);
  /* záložky */
  const T0 = BTABH[h.id] || "utok",
    tabs = [["utok", "Útok"], ...(K.kouzla && (kSeznam(K) || []).length ? [["kouzla", "Kouzla"]] : []), ["akce", "Akce"], ["zach", "Záchrany"]],
    tab = dbm ? "utok" : tabs.some(x => x[0] === T0) ? T0 : "utok";
  const zb = bojZbrVse(s, h),
    zv = KZBRV[K.id];
  const utB = `${mojeTah && BP.a ? `<p class="kdbnote kneni-t">Akci už jsi v tomto tahu použil${zb.some(w => w.pocet > 1) ? " (Extra Attack: další útoky téže akce hoď klidně)" : ""}.</p>` : ""}<div class="butoky${mojeTah && BP.a ? " kneni" : ""}">${zb.map((w, i) => (w.karta ? `<button type="button" class="gbtn ghost but${zv === w.n ? " bzv" : ""}" ${gm ? `data-bgmhod="${i}"` : `data-bjut="${i}"`} ${btip(`${w.n}: útok ${bsg(+w.b || 0)}${w.z ? `, zranění ${w.z} ${BZRT[w.t] || w.t || ""}` : ""}${w.pocet > 1 ? ` · ${w.pocet}× za akci` : ""}${gm ? " – hodí za hráče a předvyplní zápis" : " – hodí útok; výsledek pošleš vypravěči"}`)}>${besc(w.n)} <b>${bsg(+w.b || 0)}</b>${w.pocet > 1 ? `<small>×${w.pocet}</small>` : ""}<span class="biks">${bikZrTxt(w.t)}</span></button>` : "")).join("")}</div>`;
  let body = "";
  if (tab === "utok") {
    if (gm) {
      const G = BGMU[h.id] || {};
      body = `${utB}<form class="bzrf bgmut" data-bgmut="${h.id}" ${btip("Hráč hodil kostkami u stolu: zapiš výsledek a útok se vyhodnotí proti AC cíle")}><span class="bkzlh">Zapsat za hráče</span><select name="ci" aria-label="Cíl"><option value="">cíl</option>${c.map(o => `<option value="${o.id}"${G.ci === o.id ? " selected" : ""}>${besc(o.n)}</option>`).join("")}</select><select name="zi" aria-label="Čím">${zb.map((w, i) => `<option value="${i}"${String(G.zi ?? zb.findIndex(q => q.n === zv)) === String(i) ? " selected" : ""}>${besc(w.n)}</option>`).join("")}<option value="">jiné…</option></select><input name="hod" type="number" inputmode="numeric" min="-10" max="60" placeholder="hod" value="${besc(G.hod ?? "")}" aria-label="Výsledek hodu na útok" style="width:4.2em"><input name="d" type="number" inputmode="numeric" min="1" max="20" placeholder="d20" value="${besc(G.d ?? "")}" aria-label="Přirozená kostka (nepovinné)" style="width:3.6em"><input name="dmg" type="number" inputmode="numeric" min="0" max="300" placeholder="zranění" value="${besc(G.dmg ?? "")}" aria-label="Zranění" style="width:4.8em"><select name="t" aria-label="Typ zranění"><option value="">typ zbraně</option>${BZTYPY.map(t => `<option value="${t}"${G.t === t ? " selected" : ""}>${BZRT[t]}</option>`).join("")}</select><button class="gbtn">Zapsat útok</button>${G.info ? `<small class="bgmuinfo">${besc(G.info)}</small>` : ""}</form>`;
    } else {
      const nav = bojAdvHrac(s, h, c0, false),
        am = BJU.adv;
      body =
        bojDB && bojDB.utok && !h.ds
          ? `<div class="butc"><label>Cíl <select name="jucil" data-ju="cil" aria-label="Cíl útoku"><option value="">—</option>${c.map(o => `<option value="${o.id}"${BJU.cil === o.id ? " selected" : ""}>${besc(o.n)}</option>`).join("")}</select></label><span class="badv" role="group" aria-label="Výhoda">${[
              ["auto", "auto"],
              ["1", "výhoda"],
              ["-1", "nevýhoda"],
              ["0", "bez"],
            ]
              .map(
                ([k, l]) =>
                  `<button type="button" data-juadv="${k}" aria-pressed="${am === k}" ${btip(k === "auto" ? (nav.v ? `Teď ${nav.v > 0 ? "výhoda" : "nevýhoda"}: ${nav.why.join(", ")}` : "Teď bez výhody") : l)}>${l}${k === "auto" && nav.v ? ` <b>${nav.v > 0 ? "+" : "−"}</b>` : ""}</button>`,
              )
              .join("")}</span></div>${utB}${!BJU.serie && BJU.info ? `<p class="rsmall">${besc(BJU.info)}</p>` : ""}${bojJaUtokHtml(s, h)}`
          : utB;
    }
  } else if (tab === "kouzla") {
    const kz = Object.assign({}, K.kouzla || {}, {seznam: kSeznam(K)}),
      U = kartaStav(K.id).zdr || {};
    body = `<p class="kdbnote">${besc(kz.vl || "")} · SO ${kSpDC(K) || kz.dc || "–"} · útok kouzlem ${bsg(kSpUt(K))}</p>${kZdrChipy(
      kSloty(K).map(q => ({k: q.k, n: `${q.pakt ? "Pakt" : "Sloty"} ${q.st}. st.`, max: q.max})),
      U,
      "data-bkzd",
    )}
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        .filter(l => kz.seznam.some(x => x.st === l))
        .map(
          l =>
            `<p class="bjakzl"><i>${l ? l + ". st." : "triky"}</i> ${kz.seznam
              .map((x, i) => [x, i])
              .filter(([x]) => x.st === l)
              .map(([x, i]) => {
                const c = kCasKouzla(x),
                  bezSl = !kMaSl(K, x),
                  pouz = (mojeTah && ((c === "A" && BP.a) || (c === "BA" && BP.b))) || (c === "R" && rk0);
                return `<span class="bjakzs${bezSl || pouz ? " kneni" : ""}" ${btip(bezSl ? (x.pz ? "Předmětu nezbývají náboje" : "Nezbývá slot") : pouz ? `${c === "A" ? "Akci" : c === "BA" ? "Bonusovou akci" : "Reakci"} už jsi použil` : `${{A: "akce", BA: "bonusová akce", R: "reakce", X: "jiný čas"}[c]}`)}><button type="button" class="kspn" data-kspd="${i}">${besc(x.n)}</button>${x.kon ? "◎" : ""}${kPzZn(x)}<small class="kspmeta">${besc([{A: "A", BA: "BA", R: "R", X: ""}[c], x.dosah, x.zach ? "SO " + String(x.zach).replace(/^([A-Z]{3})\s*(\d+)$/, "$2 $1") : ""].filter(Boolean).join(" · "))}</small>${kSesHtml(K, x, i)}</span>`;
              })
              .join("")}</p>`,
        )
        .join("")}`;
  } else if (tab === "akce") {
    const U = kartaStav(K.id).zdr || {};
    body = `${kZdrChipy([...kZdroje(K).map(q => ({k: q.n, n: q.n, max: q.max, obn: q.obn})), ...(kVydMax(K) ? [{k: "Výdrž", n: "Výdrž", max: kVydMax(K), obn: "dlouhý odpočinek"}] : [])], U, "data-bkzd")}
      <div class="bhprow">${rd ? "" : `<button type="button" class="gbtn ghost" data-bhrdy ${btip("Připravit akci (Ready): spustí se reakcí, propadne na začátku dalšího tahu")}>⏳ Připravit akci</button>`}${!d ? `<button type="button" class="gbtn ghost" data-bhds="pad" ${btip("Pád na 0 HP: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání")}>${bi("prah-smrti")} ${gm ? "Padl na 0 HP" : "Padl jsem (0 HP)"}</button>` : ""}</div><div class="bhakce${mojeTah && BP.a ? " bpta" : ""}${mojeTah && BP.b ? " bptb" : ""}${rk0 ? " bptr" : ""}">${kAkceHtml(K, true)}</div>`;
  } else
    body = `<div class="kchrow">${BAB.map(a => `<button type="button" class="kchip kchz${(K.zachProf || []).includes(a) ? " kprof" : ""}" data-bkzh="${a}" ${btip(`Záchrana ${KSK[a]}: d20 ${bsg(kZach(K, a))}`)}><span>${a}</span><b>${bsg(kZach(K, a))}</b></button>`).join("")}${K.konVyhoda ? `<button type="button" class="kchip kchz" data-bkzh="CON" data-adv="1" ${btip("CON záchrana pro soustředění s výhodou (War Caster)")}><span>◎ CON</span><b>${bsg(kZach(K, "CON"))}</b><small>výh.</small></button>` : ""}</div>${(K.zachPozn || []).length ? `<p class="kdbnote">${K.zachPozn.map(besc).join(" · ")}</p>` : ""}${(() => {
      const R = kOdol(K);
      return R.length || (K.imu || []).length
        ? `<p class="kdbnote">${R.length ? `<b>Resistance</b> ${R.map(t => bikZr(t) + besc(BZRT[t] || t)).join(" ")}` : ""}${(K.imu || []).length ? ` · <b>Immunity</b> ${K.imu.map(t => besc(BZRT[t] || t)).join(", ")}` : ""}</p>`
        : "";
    })()}`;
  if (dbm)
    return bojDbm(s, h, K, gm, vzdy, {
      boj: true,
      hl: kHlas([
        vzdy ? kZasahHtml(K, h, s) : "",
        vzdy && !gm ? kRipHtml(K, h, s) : "",
        vzdy && !gm && typeof kOdvHtml === "function" ? kOdvHtml(K, h, s) : "",
        plak,
        s.aktivni ? bojJaHexHtml(s, h, K) : "",
        vzdy ? navrhyMojeHtml(K) : "",
        zavUt ? "" : kZavBox(K),
        kon,
        dsH,
        rdy,
        kPoslBox(K),
      ]),
      hlS: kHlas([
        vzdy ? kZasahHtml(K, h, s) : "",
        vzdy && !gm ? kRipHtml(K, h, s) : "",
        vzdy && !gm && typeof kOdvHtml === "function" ? kOdvHtml(K, h, s) : "",
        s.aktivni ? bojJaHexHtml(s, h, K) : "",
        zavUt ? "" : kZavBox(K),
        kon,
        dsH,
        rdy,
        kPoslBox(K),
      ]),
      utok: body.split(utB).join(""),
      kry,
      typ,
      rd,
      d,
      BP,
      rk: rk0,
      mojeTah,
    });
  return `<div class="bref bhkb">${hl}${bar}<nav class="kbtabs" role="tablist">${tabs.map(([id, n]) => `<button type="button" role="tab" data-bhtab="${id}" aria-selected="${tab === id}">${n}</button>`).join("")}</nav><div class="kbtab">${body}</div>${vzdy && (s.obsazeni || {})[s.tah] === h.id ? ((s.hotovo || {})[h.id] === (s.kolo || 1) * 100 + (s.tah || 0) ? `<p class="kdbnote">✓ Tah dohrán – vypravěč posune dál.</p>` : bojKonecBtn(h.id)) : ""}</div>`;
}
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const tb = T("[data-bhtab]");
  if (tb) {
    const c = tb.closest("[data-bhcard]");
    if (c) {
      BTABH[c.dataset.bhcard] = tb.dataset.bhtab;
      renderBoj();
    }
    return;
  }
  const bp = T("[data-btp]");
  if (bp && BOJ.s) {
    bojBpt(BOJ.s);
    BPT[bp.dataset.btp] = BPT[bp.dataset.btp] ? 0 : 1;
    renderBoj();
    return;
  }
  const th = T("[data-bhthp]");
  if (th) {
    const id = th.dataset.bhthp,
      h = ((BOJ.s || {}).hraci || []).find(x => x.id === id),
      K = bojKartaH(h);
    if (!K) return;
    const v = Math.round(+(prompt(`${h.n}: kolik dočasných HP?`, "") || 0));
    if (!(v > 0)) return;
    const t = Math.max(+kartaStav(K.id).thp || 0, v);
    kartaStavZmen(K.id, {thp: t}, `${h.n}: dočasné HP ${t}.`);
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-bhpt]")) BHPT[t.dataset.bhpt] = t.value;
});
/* vypravěč: hod za hráče z karty předvyplní zápis; zápis útoku = útok hráče, rovnou vyhodnocený */
/* před hodem na útok (2026-10-17): cíl, výhoda/nevýhoda a u zbraní s vlastností Šikovná typ zranění */
const BUTYP = {};
/* hráč: „Zadat ručně“ – kostky hozené u stolu (d20, d6 Závoje, kostky zranění); prázdné pole hodí web */
const BRUC = {};
const bRucN = (v, a, b) => {
  if (v == null || String(v).trim() === "") return null;
  const n = Math.round(+v);
  return isFinite(n) && n >= a && n <= b ? n : null;
};
const bojRucHtml = (h, w, o) => {
  o = o || {};
  const R = BRUC[h.id] || {},
    kz = String(w.z || "").replace(/[+-]\d+$/, "") + (o.kus > 1 ? ` ×${o.kus}` : "");
  if (o.jenZr && !kz) return "";
  return `<details class="bphruc" data-otv="ruc-${besc(h.id)}"${BOTV.has("ruc-" + h.id) || R.d20 || R.d6 || R.dmg ? " open" : ""}><summary>Zadat ručně <small>– hodil jsem kostkami u stolu</small></summary><div class="bphr">
    ${
      o.jenZr
        ? ""
        : `<label ${btip("Kostka d20, jak padla (s výhodou či nevýhodou ta, která platí). Bonus k útoku se přičte sám.")}>d20 <input type="number" inputmode="numeric" min="1" max="20" data-bruc="${besc(h.id)}|d20" value="${besc(R.d20 ?? "")}" aria-label="Hozená d20"></label>
    <label ${btip("Kostka Závoje: 1–2 Pokušení, 5–6 Požehnání")}>d6 Závoje <input type="number" inputmode="numeric" min="1" max="6" data-bruc="${besc(h.id)}|d6" value="${besc(R.d6 ?? "")}" aria-label="Hozená kostka Závoje"></label>`
    }
    ${kz ? `<label ${btip(`Součet kostek zranění ${kz} (při kritickém zásahu dvojnásob kostek). Modifikátor se přičte sám.`)}>zranění ${besc(kz)} <input type="number" inputmode="numeric" min="0" max="300" data-bruc="${besc(h.id)}|dmg" value="${besc(R.dmg ?? "")}" aria-label="Součet kostek zranění"></label>` : ""}
    </div><small class="bphnav">Co nevyplníš, hodí web. Platí pro první útok; vyplněná čísla se po hodu smažou.</small></details>`;
};
addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-bruc]")) return;
  const [hid, k] = t.dataset.bruc.split("|");
  (BRUC[hid] = BRUC[hid] || {})[k] = t.value;
});
const BSIKALT = {Slashing: "Piercing", Piercing: "Slashing", Bludgeoning: "Piercing"};
function bojSikTypy(K, w) {
  if (!K || !w || !w.t) return null;
  const a = kUtoky(K).find(x => x.n === w.n);
  if (!a || !bdmZvl(a, K).includes("Šikovná")) return null;
  const v = bdmZvlMoje(a, K);
  if (v && (v.t || []).length > 1) return v.t.slice(0, 3);
  const alt = BSIKALT[w.t];
  return alt ? [w.t, alt] : null;
}
const bojUtTyp = (K, w) => {
  const T = bojSikTypy(K, w),
    v = K && w ? BUTYP[K.id + ":" + w.n] : null;
  return T && T.includes(v) ? v : (w && w.t) || "";
};
/* hráč: výsledek hodu na útok s tlačítkem Poslat vypravěči */
function bojJaPlak(K, c, bezTl) {
  if (GMV || !BJU.serie || !BJU.serie.length || BJU.plos) return "";
  const c0 = c.find(o => o.id === (bojCileL(BJU, c)[0] || BJU.cil));
  return `<div class="khl kjuplak">${(() => {
    const x = BJU.serie[0],
      v = BJU.serie.length === 1 ? bojJaZas(c0, x.hod, x.d, x.krit) : "";
    return v
      ? `<b class="bjupv ${v === "vedle" ? "bmis" : "bkr"}">${v === "vedle" ? "Vedle" : v === "zásah" ? "Zásah!" : "Kritický zásah!"}</b> `
      : "";
  })()}<small>${besc(BJU.info || "")}</small>${bojJaRidHtml(K, BJU.serie[Math.max(0, Math.min(+BJU.ui || 0, BJU.serie.length - 1))])}${bojJaUprHtml(K)}${!bezTl && bojDB && bojDB.utok ? `<button type="button" class="gbtn" data-juposl>${BJU.serie.length > 1 ? `Poslat ${BJU.serie.length} útoky` : "Poslat vypravěči"}</button>` : ""}</div>`;
}
function bojPredHod(s, h, K, gm, j) {
  const w = bojZbrVse(s, h)[+j];
  if (!w) return "";
  const c = (s.npc || []).filter(
    o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
  );
  const G = gm ? BGMU[h.id] || {} : null,
    cL = bojCileL(gm ? G : BJU, c),
    cil = cL[0] || "",
    nav = bojAdvHrac(
      s,
      h,
      c.find(o => o.id === cil),
      !!w.dal,
    ),
    n = Math.max(+w.pocet || 1, cL.length || 1);
  const adv = gm ? String(G.adv || 0) : BJU.adv === "auto" ? "0" : String(BJU.adv);
  const T = bojSikTypy(K, w),
    typ = bojUtTyp(K, w);
  /* bonus, se kterým se opravdu hází: vyčerpání a účinky (Bless se hází zvlášť, Magic Weapon +X ano) */
  let bEf = +w.b || 0;
  try {
    bEf -= K ? 2 * kVycerp(K) : 0;
    if (K && typeof bojEfZnacene === "function" && typeof kEfUt === "function")
      bEf += kEfUt(
        bojEfZnacene(
          h,
          K,
          c.find(o => o.id === cil),
          w,
          gm ? [] : undefined,
        ),
      );
  } catch (e) {}
  const N = +w.pocet || 1,
    tk = (s.kolo || 1) * 100 + (s.tah || 0),
    O = gm ? G : BJU,
    i0 = O.uw === w.n && O.utk === tk ? +O.ui || 0 : 0,
    poradi = N > 1 ? ` · ${Math.min(N, i0 + 1)}. z ${N}` : "";
  const cilH = `<div class="bphr"><span class="bphl">Cíl</span><span class="bphc">${c.map(o => `<button type="button" class="bphcil" data-bpcil="${besc(h.id)}|${besc(o.id)}" aria-pressed="${cL.includes(o.id)}">${bojMedN(o, "bmini")}<span>${besc(o.n)}</span></button>`).join("") || `<small>žádný nepřítel</small>`}</span></div>
    ${!cL.length && c.length > 1 ? `<small class="bphnav bphbez">Vyber cíl – bez něj se útok nezapíše.</small>` : ""}${
      cL.length > 1 || N > 1
        ? `<small class="bphnav">${
            cL.length > 1
              ? `${n} ${n < 5 ? "útoky" : "útoků"}: ${cL
                  .map(id => (c.find(o => o.id === id) || {}).n)
                  .filter(Boolean)
                  .map(besc)
                  .join(", ")} – hází se po jednom, cíle se střídají`
              : `${n} útoky v jedné akci – hází se po jednom, cíl jde mezi nimi změnit`
          }</small>`
        : ""
    }`;
  const typH = T
    ? `<div class="bphr"><span class="bphl" ${btip("Šikovná: před hodem si zvolíš typ zranění podle zbraně")}>Zranění</span><span class="bphc">${T.map(t => `<button type="button" class="bphtyp" data-bptyp="${besc(K.id)}|${besc(w.n)}|${t}" aria-pressed="${typ === t}" ${btip(BZRT[t] || t)}>${bikZr(t)}<span>${besc(BZRT[t] || t)}</span></button>`).join("")}</span></div>`
    : "";
  const zvH = typeof bojZvVolbyHtml === "function" ? bojZvVolbyHtml(K, w, h, gm) : "";
  const ssH =
    w.dal && kMaRys(K, /^sharpshooter$/i)
      ? `<small class="bphnav">Sharpshooter: krytí cíle se nepočítá; dlouhý dostřel ani nepřítel vedle tebe nevýhodu nedávají.</small>`
      : "";
  const navH =
    nav.v && String(nav.v) !== adv
      ? `<small class="bphnav" ${btip(nav.why.join(", "))}>podle stavů by šla ${nav.v > 0 ? "výhoda" : "nevýhoda"}</small>`
      : "";
  if (gm)
    return `<div class="bphod">${cilH}${ssH}${zvH}
    <div class="bphr bphhod">${bojAdvIk(h.id, adv)}<button type="button" class="bphgo" data-bgmhod="${+j}" data-bph="${besc(h.id)}"><b>Hodit!</b><small>útok ${bsg(bEf)}${poradi}</small></button>${navH}</div>
    ${typH}${G.serie && G.serie.length ? `${G.info ? `<small class="bphnav">${G.info}</small>` : ""}${K ? bojJaRidHtml(K, G.serie[Math.max(0, Math.min(+G.ui || 0, G.serie.length - 1))], h.id) + bojJaUprHtml(K, h.id) : ""}<button type="button" class="bdmbtn bdmhod" data-bgmzap="${besc(h.id)}">Zapsat ${G.un ? G.un : "útok"}</button>` : ""}</div>`;
  /* hráč (2026-10-20): jedno hlavní tlačítko na stále stejném místě – Hodit! → Poslat vypravěči → další útok téže akce;
     nad ním výsledek hodu a pod ním, co s odeslanými útoky udělal vypravěč */
  const rol = !!(BJU.serie && BJU.serie.length && !BJU.plos),
    poz = KZAV[K && K.id] && /^Útok/.test(KZAV[K.id].co || "") ? kZavBox(K) : "";
  const hlavni = rol
    ? `<button type="button" class="bphgo bphposl" data-juposl data-bph="${besc(h.id)}"><b>${BJU.serie.length > 1 ? `Poslat ${BJU.serie.length} útoky` : "Poslat vypravěči"}</b><small>${besc(BJU.un > 1 ? `útok ${Math.min(+BJU.un, (+BJU.ui || 0) + 1)} z ${BJU.un}` : w.n)}${potvrz().rezim !== "nic" ? " · vypravěč potvrdí" : ""}</small></button>`
    : `${bojAdvIk(h.id, adv)}<button type="button" class="bphgo" data-bjut="${+j}" data-bph="${besc(h.id)}"><b>Hodit!</b><small>útok ${bsg(bEf)}${poradi}</small></button>${navH}`;
  return `<div class="bphod bphodp">${cilH}${ssH}${zvH}${typH}${poz}${bojJaPlak(K, c, true)}<div class="bphr bphhod bphhodp">${hlavni}</div>${bojJaOdpoved(s, h)}${rol ? "" : bojRucHtml(h, w)}</div>`;
}
/* hráč: co vypravěč udělal s mými útoky v tomto kole (čeká / zásah a zranění / vedle / nezapsal) */
function bojJaOdpoved(s, h) {
  const L = (s.utoky || [])
    .filter(u => u.h === h.id && !u.sid && (+u.k || 0) === (s.kolo || 1))
    .slice(-4)
    .reverse();
  if (!L.length) return "";
  return `<ul class="bphodp-ved">${L.map(u => {
    const ce = u.stav === "ceka",
      zam = u.stav === "zamitnuto",
      v = String(u.vys || ""),
      mis = /vedle|nezapsal/.test(v) || /(^|\s)uspěl/.test(v),
      cn = (u.ci || [])
        .map(i => bojJm(s, i))
        .filter(Boolean)
        .join(", ");
    return `<li class="${ce ? "bodc" : zam || mis ? "bodm" : "bodz"}"><span>${ce ? "⏳" : zam ? "✖" : mis ? "○" : "✔"}</span><b>${besc(u.cim || "útok")}</b>${cn ? ` → ${besc(cn)}` : ""}: ${ce ? "čeká na vypravěče…" : `<b>${besc(v || u.stav)}</b>${!mis && !zam && +u.dmg > 0 ? ` · ${+u.dmg} zranění` : ""}`}</li>`;
  }).join("")}</ul>`;
}
/* cíle útoku: více označených (GM v BGMU, hráč v BJU) – jen ti, kdo jsou v boji */
/* vybrané cíle útoku; když nic vybráno není a ve hře je jediný nepřítel, je cílem on (2026-10-20: útok bez cíle se nezapsal) */
const bojCilMoz = o =>
  !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0);
const bojCileL = (o, c) => {
  const L = (o.cilL && o.cilL.length ? o.cilL : o.ci || o.cil ? [o.ci || o.cil] : []).filter(id => c.some(x => x.id === id));
  if (L.length) return L;
  const M = c.filter(bojCilMoz);
  return M.length === 1 ? [M[0].id] : [];
};
/* výhoda a nevýhoda jako dvě zaklikávací ikony (bez nich normální hod) */
const bojAdvIk = (hid, adv) =>
  `<span class="bphadvi" role="group" aria-label="Výhoda nebo nevýhoda">${[
    ["1", "vyhoda", "Výhoda"],
    ["-1", "nevyhoda", "Nevýhoda"],
  ]
    .map(
      ([k, ic, l]) =>
        `<button type="button" class="bphai" data-bpadv="${besc(hid)}|${k}" aria-pressed="${adv === k}" aria-label="${l}" ${btip(`${l} – hodí dvě d20, platí ${k === "1" ? "vyšší" : "nižší"}. Klepni znovu: normální hod`)}>${bi(ic)}<small>${l}</small></button>`,
    )
    .join("")}</span>`;
/* kouzlo na cíl (hráč, 2026-10-17): cíl jako u útoku zbraní, u kouzla se záchranou (plošně) víc cílů, slot, výhoda,
   Zadat ručně, hod a odeslání vypravěči – vše v jednom listu */
function bojPredKouzlo(s, h, K) {
  const sp = bojJaSp(s, h);
  if (!sp)
    return `<p class="bdmnote">${KSPD ? "Kouzlo nemá v boji zranění ani záchranu cíle (nebo chybí volný slot) – sešli ho tlačítkem Seslat v kouzlech." : "Načítám kouzla…"}</p>`;
  const {x, B, sls, q} = sp,
    multi = !!B.zach,
    c = (s.npc || []).filter(
      o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
    );
  const on = o => (multi ? BJU.cile.includes(o.id) : BJU.cil === o.id),
    nav = bojAdvHrac(
      s,
      h,
      c.find(o => o.id === BJU.cil),
      BJU.dal,
    ),
    adv = BJU.adv === "auto" ? "0" : String(BJU.adv);
  const popis = B.utok
    ? `útok kouzlem ${bsg(kSpU1(K, x))}${B.pocet > 1 ? ` · ${B.pocet} paprsky, každý svůj hod` : ""}`
    : B.zach
      ? `záchrana ${B.zach} SO ${kSpDC(K, x) || "?"}${B.pol ? ", při úspěchu polovina" : ""}`
      : `zasáhne bez hodu${B.pocet > 1 ? ` · ${B.pocet}×` : ""}`;
  const dmg = B.x ? `${B.x}${B.mod ? bsg(B.mod) : ""} ${BZRT[B.t] || B.t || ""}` : "";
  const hodit = B.utok || B.auto || (B.zach && B.x),
    hoz = !!(BJU.serie && BJU.serie.length) || (!B.utok && BJU.info !== "");
  const v1 = B.utok && BJU.serie && BJU.serie.length === 1 ? BJU.serie[0].vys : "";
  return `<div class="bphod bphsp"><p class="bphinfo">${besc(x.n)} · ${sp.lvl ? sp.lvl + ". st." : "trik"} · ${besc(popis)}${dmg ? ` · ${besc(dmg)}` : ""}${x.kon ? " · ◎ soustředění" : ""}</p>
    <div class="bphr"><span class="bphl">${multi ? `Cíle${bojJaCilMax() ? ` <small>(nejvýš ${bojJaCilMax()})</small>` : ""}` : "Cíl"}</span><span class="bphc">${c.map(o => `<button type="button" class="bphcil" ${multi ? `data-bpcile="${besc(o.id)}"` : `data-bpcil="${besc(h.id)}|${besc(o.id)}"`} aria-pressed="${on(o)}">${bojMedN(o, "bmini")}<span>${besc(o.n)}</span></button>`).join("") || `<small>žádný nepřítel</small>`}</span></div>
    ${multi ? `<small class="bphnav">Plošné kouzlo: označ všechny, kdo jsou v oblasti.</small>` : ""}
    ${sls.length > 1 ? `<div class="bphr"><span class="bphl">Slot</span><span class="bphc">${sls.map(z => `<button type="button" class="bphtyp" data-bpsl="${besc(z.k)}" aria-pressed="${q && q.k === z.k}">${z.lab ? `${besc(z.lab)} <small>(${z.st}. st.)</small>` : `${z.pakt ? "pakt " : ""}${z.st}. st. <small>(${z.max - z.u})</small>`}</button>`).join("")}</span></div>` : ""}
    ${B.utok ? `<div class="bphr bphhod">${bojAdvIk(h.id, adv)}${nav.v && String(nav.v) !== adv ? `<small class="bphnav" ${btip(nav.why.join(", "))}>podle stavů by šla ${nav.v > 0 ? "výhoda" : "nevýhoda"}</small>` : ""}</div>` : ""}
    ${hodit ? bojRucHtml(h, {z: B.x}, {jenZr: !B.utok, kus: B.auto ? B.pocet : 1}) : ""}
    ${hodit && !hoz ? `<button type="button" class="bdmbtn bdmhod" data-juhod>🎲 ${B.utok ? "Hodit útok" : "Hodit zranění"}</button>` : ""}
    ${hoz ? `${v1 ? `<b class="bjupv ${v1 === "vedle" ? "bmis" : "bkr"}">${v1 === "vedle" ? "Vedle" : v1 === "zásah" ? "Zásah!" : "Kritický zásah!"}</b>` : ""}<small class="bphnav">${besc(BJU.info || "")}</small>` : ""}
    ${hoz || !hodit ? `<button type="button" class="bdmbtn bdmhod" data-juposl>${hodit ? "Poslat vypravěči" : "✨ Seslat na cíle"}</button><small class="bphnav">Odesláním se ${x.st > 0 ? "odečte slot" : "kouzlo zapíše"}${x.kon ? " a začne soustředění" : ""}; zásah a záchrany vyhodnotí vypravěč.</small>` : ""}</div>`;
}
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const ce = T("[data-bpcile]");
  if (ce) {
    const id = ce.dataset.bpcile,
      mx = bojJaCilMax();
    if (BJU.cile.includes(id)) BJU.cile = BJU.cile.filter(x => x !== id);
    else if (mx === 1) BJU.cile = [id];
    else if (mx && BJU.cile.length >= mx) {
      mmHlasG(`Na tomto stupni nejvýš ${mx} ${mx < 5 ? "cíle" : "cílů"}.`, 3000);
      return;
    } else BJU.cile = [...BJU.cile, id];
    bojListPrekresli();
    return;
  }
  const sl = T("[data-bpsl]");
  if (sl) {
    BJU.sl = sl.dataset.bpsl;
    BJU.serie = null;
    BJU.info = "";
    BJU.hod = "";
    BJU.dmg = "";
    bojListPrekresli();
    return;
  }
});
/* vypravěč hází za hráče (2026-10-19): jeden útok na klepnutí – víc útoků jedné akce (Extra Attack) jde po jednom, cíl se mezi nimi
   smí změnit (při víc označených cílech se střídají); zranění se hází jen při zásahu proti AC cíle (nebo když AC neznáme) */
function bojGmHod(hid, i) {
  const s = BOJ.s || {},
    h = (s.hraci || []).find(x => x.id === hid);
  if (!h) return;
  const K = bojKartaH(h),
    w = bojZbrVse(s, h)[i];
  if (!w) return;
  const G0 = BGMU[hid] || {},
    v = +(G0.adv || 0),
    typ = bojUtTyp(K, w),
    cL = bojCileL(G0, s.npc || []),
    N = Math.max(1, +w.pocet || 1),
    tk = (s.kolo || 1) * 100 + (s.tah || 0);
  if (!cL.length && (s.npc || []).filter(bojCilMoz).length > 1) {
    mmHlasG("Nejdřív vyber cíl útoku.", 3000);
    return;
  }
  if (G0.uw !== w.n || G0.utk !== tk) {
    G0.ui = 0;
    G0.uw = w.n;
    G0.utk = tk;
  }
  const ui = Math.min(+G0.ui || 0, N - 1),
    ser = [],
    tx = [],
    ZT = typeof bojZvVolby === "function" ? bojZvVolby(G0, w) : {};
  {
    const ci = cL.length ? cL[ui % cL.length] : "",
      c = (s.npc || []).find(o => o.id === ci),
      AC = bojCilAC(s, h, c, w);
    /* stejný hod jako z telefonu hráče (2026-10-20): Hex / Hunter's Mark na cíli, Magic Weapon, vyčerpání, Lucky; zranění jen po zásahu */
    /* Bless / Bane na postavě se přičtou i při hodu vypravěče (pd), jako na telefonu hráče */
    const P = bojUtokPriprav({s, h, K, w, c, v, ac: AC, sel: [], pd: true, vp: !!ZT.vp, pm: !!ZT.pm});
    G0.kmin = P.kmin;
    if (ZT.pm) G0.pm = 1;
    ser.push({
      ci,
      hod: P.hod,
      d: P.d,
      d1: P.d1,
      d2: P.d2,
      v: P.v,
      b: P.b,
      dmg: P.dmg,
      krit: P.krit,
      vys: P.vys,
      upr: [],
      zx: P.zx,
      dz: P.dz,
      pdn: P.pdn,
    });
    tx.push(
      `${c ? besc(c.n) + ": " : "<b>bez cíle</b> · "}${P.txtHod}${AC != null && !P.zas ? ` · vedle (AC ${AC}) – zranění se nehází` : P.txtZr.replace(/^, /, " · ")}`,
    );
  }
  G0.ui = ui + 1 >= N ? 0 : ui + 1;
  const G = (BGMU[hid] = Object.assign(G0, {
    zi: i,
    ci: ser[0].ci || G0.ci,
    hod: ser[0].hod,
    d: ser[0].d,
    dmg: ser[0].dmg || "",
    t: ZT.pm ? "Piercing" : typ && typ !== w.t ? typ : "",
    serie: ser,
    un: N > 1 ? `útok ${ui + 1} z ${N}` : "",
  }));
  let zv = "";
  if (K) {
    const z = kZavoj(K);
    KZAV[K.id] = {co: `Útok – ${w.n}`, d: z.d, r: z.r, hod: z.hod};
    G.zav = {d: z.d, r: z.r};
    zv = " · " + zavTxt(z);
  }
  G.info = `${w.n}${G.un ? ` · ${G.un}` : ""}${v ? ` (${v > 0 ? "výhoda" : "nevýhoda"})` : ""}: ${tx.join(" | ")}${typ ? " · " + (BZRT[typ] || typ) : ""}${zv}${G.un && G0.ui ? " · další útok téže akce: Hodit! znovu (cíl jde změnit)" : ""}`;
  bojListPrekresli();
}
/* vypravěč: zapsat celou sérii útoků (víc cílů / Extra Attack) najednou */
function bojGmZapisVse(hid) {
  const s = BOJ.s || {},
    h = (s.hraci || []).find(x => x.id === hid),
    G = BGMU[hid];
  if (!h || !G || !G.serie) return;
  {
    const cL = bojCileL(G, s.npc || []);
    G.serie.forEach((x, q) => {
      if (!x.ci && cL.length) x.ci = cL[q % cL.length];
    });
  }
  if (G.serie.some(x => !x.ci)) {
    mmHlasG("Vyber cíl útoku – bez cíle se útok nezapíše.", 4000);
    G.info = `<b>Vyber cíl</b> (nahoře v listu útoku) a zapiš znovu. ${String(G.info || "").replace(/^<b>Vyber cíl<\/b>[^.]*\. /, "")}`;
    renderBoj();
    return;
  }
  const w = bojZbrVse(s, h)[+G.zi],
    K = bojKartaH(h),
    rid = x =>
      (x.rid || [])
        .filter(r => r.g !== "rp")
        .map(r => " + " + (r.cim || r.n))
        .join("");
  const L = G.serie.map((x, q) =>
    Object.assign(
      {
        id: "g" + Date.now().toString(36) + q,
        h: hid,
        ci: [x.ci],
        cim: `${G.ripo ? (G.ripo.odv ? "Odveta: " : "Riposte: ") : ""}${w ? w.n : "útok"}${rid(x)}`.slice(0, 60),
        hod: x.hod,
        d: x.d,
        adv: x.v || 0,
        det: Object.assign(
          {d1: x.d1, d2: x.d2, v: x.v, b: x.b, zx: x.zx},
          x.upr && x.upr.length ? {upr: x.upr} : {},
          q === 0 && G.zav ? {zav: G.zav} : {},
        ),
        dmg: Math.max(0, Math.round(+x.dmg || 0)),
        t: G.t || (w && w.t) || "Slashing",
        drt: !!(w && w.drt),
        pru: !!(w && w.pru) || !!G.pm,
        kmin: Math.min(20, +G.kmin || 20),
        k: s.kolo || 1,
        stav: "ceka",
      },
      (() => {
        const zv = w && typeof bojZvPayload === "function" ? bojZvPayload(K, w, x, G.zav, bojZvVolby(G, w)) : null;
        return zv ? {zv} : {};
      })(),
    ),
  );
  const SER = G.serie;
  bojGmPo(hid);
  bojZmen(z => {
    z.utoky = [...(z.utoky || []), ...L].slice(-40);
  });
  L.forEach(u => bojUtokPotvrd(u.id));
  if (K && typeof bojJaRidPo === "function") bojJaRidPo(K, h, SER, BGMU[hid]).catch(e => console.error(e));
}
/* po zápisu útoku: formulář se vyprázdní, ale pořadí útoků téže akce (1. z 2…), cíl a výhoda zůstanou */
function bojGmPo(hid) {
  const G = BGMU[hid];
  if (!G) return;
  const K = {};
  ["uw", "utk", "ui", "ci", "adv", "cilL", "ridT", "kmin", "zvt"].forEach(k => {
    if (G[k] != null) K[k] = G[k];
  });
  BGMU[hid] = K;
}
function bojGmZapis(hid, f) {
  const s = BOJ.s || {},
    h = (s.hraci || []).find(x => x.id === hid);
  if (!h) return;
  const ci = f.ci.value;
  if (!ci) {
    mmHlasG("Vyber cíl útoku.", 2500);
    return;
  }
  const hod = f.hod.value;
  if (hod === "" || isNaN(+hod)) {
    mmHlasG("Zapiš výsledek hodu na útok.", 2500);
    return;
  }
  const w = f.zi.value !== "" ? bojZbrVse(s, h)[+f.zi.value] : null,
    u = {
      id: "g" + Date.now().toString(36),
      h: hid,
      ci: [ci],
      cim: w ? w.n : "útok",
      hod: Math.round(+hod),
      adv: 0,
      dmg: Math.max(0, Math.round(+f.dmg.value || 0)),
      t: f.t.value || (w && w.t) || "Slashing",
      drt: !!(w && w.drt),
      pru: !!(w && w.pru),
      kmin: 20,
      k: s.kolo || 1,
      stav: "ceka",
    };
  if (f.d.value !== "" && +f.d.value >= 1 && +f.d.value <= 20) u.d = Math.round(+f.d.value);
  bojGmPo(hid);
  bojZmen(z => {
    z.utoky = [...(z.utoky || []), u].slice(-40);
  });
  bojUtokPotvrd(u.id);
}
/* životy v hlavičce karty postavy: číslo nastaví, −N zranění, +N léčení */
function bojHracHp(hid, val) {
  const s = BOJ.s || {},
    h = (s.hraci || []).find(x => x.id === hid),
    K = bojKartaH(h);
  if (!K) return;
  const t = String(val || "")
      .trim()
      .replace(/−/g, "-"),
    cur = bojHpPC(h, K);
  let v = 0;
  if (/^-\d+$/.test(t)) v = +t;
  else if (/^\+\d+$/.test(t)) v = +t;
  else if (/^\d+$/.test(t)) v = +t - cur;
  else {
    renderBoj();
    return;
  }
  if (!v) {
    renderBoj();
    return;
  }
  if (v < 0) {
    const dmg = -v,
      ty = BHPT[hid] || "",
      zr = (K.imu || []).includes(ty) ? 0 : kOdol(K).includes(ty) ? Math.floor(dmg / 2) : dmg;
    bojPCZmena(hid, o => bojZranPC(o, K, dmg, ty, false));
    const hp = kartaStav(K.id).hp;
    if (zr > 0 && kKonDrzi(K) && (hp == null || hp > 0)) {
      KKON[K.id] = bojKonDC(zr);
      renderBoj();
    } else if (hp === 0 && kKonDrzi(K)) kKonZtrata(K, "pád na 0 HP");
  } else {
    const ks = kartaStav(K.id),
      o = {hp: ks.hp, thp: ks.thp, ds: h.ds ? JSON.parse(JSON.stringify(h.ds)) : undefined},
      m = bojLecPC(o, K, v);
    kartaStavZmen(K.id, {hp: o.hp != null && o.hp < kHPmax(K) ? o.hp : null}, `${h.n}: ${m}.`);
    if (JSON.stringify(o.ds ?? null) !== JSON.stringify(h.ds ?? null))
      bojHracAkce(hid, x => {
        if (o.ds) x.ds = o.ds;
        else delete x.ds;
      });
    if (GMV) bojLog(hid, {n: "Léčení", ai: null, ci: hid, zt: m}, h.n);
  }
}
document.addEventListener("change", e => {
  const t = e.target;
  if (!t.matches) return;
  if (t.matches("[data-bjhp]")) {
    bojHracHp(t.dataset.bjhp, t.value);
    return;
  }
  const f = t.closest && t.closest("[data-bgmut]");
  if (f) {
    const G = (BGMU[f.dataset.bgmut] = BGMU[f.dataset.bgmut] || {});
    G[t.name] = t.value;
  }
});
document.addEventListener("keydown", e => {
  const t = e.target;
  if (e.key === "Enter" && t.matches && t.matches("[data-bjhp]")) {
    e.preventDefault();
    t.blur();
  }
  if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches("[data-bdmutx]")) {
    e.preventDefault();
    t.click();
  }
});
document.addEventListener("input", e => {
  const t = e.target,
    f = t.closest && t.closest("[data-bgmut]");
  if (f && t.name) {
    const G = (BGMU[f.dataset.bgmut] = BGMU[f.dataset.bgmut] || {});
    G[t.name] = t.value;
  }
});
document.addEventListener("submit", e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-bgmut]")) return;
  e.preventDefault();
  bojGmZapis(f.dataset.bgmut, f.elements);
});
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const pc = T("[data-bpcil]");
  if (pc) {
    const [hid, id] = pc.dataset.bpcil.split("|"),
      jeden = !!pc.closest(".bphsp"),
      O = GMV ? (BGMU[hid] = BGMU[hid] || {}) : BJU,
      k = GMV ? "ci" : "cil";
    if (jeden) {
      O[k] = O[k] === id ? "" : id;
      O.cilL = O[k] ? [O[k]] : [];
    } else {
      const L = bojCileL(O, (BOJ.s && BOJ.s.npc) || []);
      O.cilL = L.includes(id) ? L.filter(x => x !== id) : [...L, id];
      O[k] = O.cilL[0] || "";
    }
    if (GMV) delete O.serie;
    else {
      BJU.serie = null;
      BJU.info = "";
    }
    bojListPrekresli();
    return;
  }
  const gz = T("[data-bgmzap]");
  if (gz) {
    bojGmZapisVse(gz.dataset.bgmzap);
    return;
  }
  const pa = T("[data-bpadv]");
  if (pa) {
    const [hid, v] = pa.dataset.bpadv.split("|"),
      zpet = pa.getAttribute("aria-pressed") === "true" && v !== "0";
    if (GMV) {
      (BGMU[hid] = BGMU[hid] || {}).adv = zpet ? 0 : +v;
    } else BJU.adv = zpet ? "0" : v;
    bojListPrekresli();
    return;
  }
  const pt = T("[data-bptyp]");
  if (pt) {
    const [kid, wn, t] = pt.dataset.bptyp.split("|");
    BUTYP[kid + ":" + wn] = t;
    bojListPrekresli();
    return;
  }
  const g = T("[data-bgmhod]");
  if (g) {
    const k = g.dataset.bph || ((g.closest("[data-bhpan]") || {}).dataset || {}).bhpan;
    if (k) bojGmHod(k, +g.dataset.bgmhod);
    return;
  }
  const j = T("[data-bjut]");
  if (j) {
    const s = BOJ.s || {},
      me = (s.hraci || []).find(h => h.n === bojJa.get());
    {
      const nes = me && (bojNeschopny(me.stav) || kNeschopny(bojKartaH(me)));
      if (nes) {
        mmHlasG(`Nemůžeš útočit – ${nes}.`, 3500);
        return;
      }
    }
    const zb = me ? bojZbrVse(s, me) : [],
      w = zb[+j.dataset.bjut];
    if (!w) return;
    BJU.ks = null;
    BJU.plos = false;
    if (BJU.adv === "auto") BJU.adv = "0";
    BJU.zi = String(+j.dataset.bjut);
    BJU.t = bojUtTyp(bojKartaH(me), w) || BJU.t;
    BJU.drt = !!w.drt;
    BJU.pru = !!w.pru;
    BJU.dal = !!w.dal;
    const K = bojKartaH(me);
    if (K && kJeZbran(K, w.n)) {
      KZBRV[K.id] = w.n;
      BJU.zvAuto = w.n;
      kZbrvUloz();
    }
    bojJaHod();
    return;
  }
});
/* ===== Boj: bojová karta postavy v rozvržení D&D Beyond na telefonu (2026-10-17) – úsporná: hlavička (AC s obětováním
   zbroje, zbývající obětování, portrét s hrdinskou inspirací a reakcí, životy, odpočinek, hlavní karta, stavy), pruh jen
   s tím, co právě platí (Závoj, rány, soustředění, vyčerpání, hody proti smrti), hlášky v jednom proužku, záložky
   Vlastnosti · Akce · Kouzla · Vybavení · Rysy (· Společníci), které se při posunu přilepí i se zúženou hlavičkou,
   vysouvací listy zespodu (životy, stavy, AC, odpočinek, kostka, útok na cíl). Hráč ji má v Boji i mimo boj; vypravěč
   u každé postavy družiny. Stav postavy je jeden (karty.stav) – co se změní tady, ukáže hlavní karta a naopak. ===== */
const BDMI = {
  vl: '<path d="M8 1.6 13.6 4v4.3c0 3.2-2.4 5.4-5.6 6.1C4.8 13.7 2.4 11.5 2.4 8.3V4Z"/><path d="M5.4 8.2 7.3 10l3.4-3.7"/>',
  akce: '<path d="M3 13 11.6 4.4M10 2.8h3.2V6M2.4 10.6l3 3M4.2 12.8l-1.6 1.6"/>',
  kouzla:
    '<path d="M8 1.5c.9 2.6 2.4 4.1 5 5-2.6.9-4.1 2.4-5 5-.9-2.6-2.4-4.1-5-5 2.6-.9 4.1-2.4 5-5Z"/><path d="M12.8 11.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5Z"/>',
  vyb: '<path d="M2.5 6.5h11v7h-11ZM2.5 6.5 4 3h8l1.5 3.5M6.3 9h3.4"/>',
  rysy: '<circle cx="8" cy="5.4" r="2.7"/><path d="M2.8 14c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6"/>',
  spol: '<path d="M3 13.5c0-2.9 1.6-5 3.9-5.6L5.6 4.2 8 5.6l2.4-1.4-1.3 3.7c2.3.6 3.9 2.7 3.9 5.6"/><circle cx="6.6" cy="10.2" r=".5" fill="currentColor"/>',
  ohen: '<path d="M8 1.8c.4 2.2 2.8 3.4 2.8 6a2.8 2.8 0 0 1-5.6 0c0-1.4.8-2.2 1.4-3 .2 1 .7 1.6 1.2 1.8C7.6 5.2 7.4 3.4 8 1.8Z"/><path d="M2.4 14.2 13.6 11.6M2.4 11.6l11.2 2.6"/>',
  kolo: '<circle cx="8" cy="8" r="2.4"/><path d="M8 1.6v2M8 12.4v2M1.6 8h2M12.4 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/>',
  slunce:
    '<path d="M3 11.5a5 5 0 0 1 10 0Z" fill="currentColor" stroke="none"/><path d="M8 2.2v2M3.3 4.4l1.3 1.4M12.7 4.4l-1.3 1.4M1.6 8.6h1.8M12.6 8.6h1.8M1.6 13.2h12.8"/>',
  duse: '<path d="M8 14s-5.4-3.2-5.4-7A2.9 2.9 0 0 1 8 5.2 2.9 2.9 0 0 1 13.4 7c0 3.8-5.4 7-5.4 7Z"/>',
  info: '<circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v4M8 4.9v.1"/>',
  denik: '<path d="M3.2 2.4h7.6l2 2v9.2H3.2ZM5.6 6h4.8M5.6 8.6h4.8M5.6 11.2h3"/>',
  zaznam:
    '<path d="M2.6 3.2h10.8v9.6H2.6Z"/><path d="M5 6.2h6M5 8.4h6M5 10.6h3.6"/><circle cx="11.4" cy="10.6" r=".6" fill="currentColor" stroke="none"/>',
  d20: '<path d="M8 1.4 13.8 4.7v6.6L8 14.6 2.2 11.3V4.7Z"/><path d="M8 1.4 4.6 9.4h6.8ZM2.2 4.7l2.4 4.7M13.8 4.7l-2.4 4.7M4.6 9.4 8 14.6l3.4-5.2"/>',
};
const bdmIc = (k, c) =>
  `<svg class="bdmic${c ? " " + c : ""}" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${BDMI[k] || ""}</svg>`;
/* oddíly (2026-10-21): Info je rozpuštěné do Statistik (smysly, zdatnosti, jazyky) a Duše (zázemí); Herní záznam je vedle karty */
const BDMS = [
  ["vl", "Statistiky: vlastnosti, záchrany, dovednosti, smysly, zdatnosti a jazyky", "Statistiky"],
  ["akce", "Akce: útoky, bonusové akce, reakce, omezené schopnosti", "Akce"],
  ["kouzla", "Kouzla", "Kouzla"],
  ["vyb", "Vybavení do boje", "Vybavení"],
  ["rysy", "Rysy a schopnosti", "Rysy"],
  ["duse", "Duše, rány, účinky a zázemí", "Duše"],
  ["denik", "Poznámky a deník", "Poznámky"],
  ["spol", "Společníci", "Společníci"],
];
const BDM = {sec: {}, sheet: null, hlo: new Set(), af: {}, kf: {}, fokus: null, utx: new Set()};
try {
  Object.assign(BDM.sec, JSON.parse(localStorage.getItem("mm-bdmsec") || "{}"));
} catch (e) {}
const bdmSecUloz = () => {
  try {
    localStorage.setItem("mm-bdmsec", JSON.stringify(BDM.sec));
  } catch (e) {}
};
const bdmSekce = K =>
  BDMS.filter(([id]) => id !== "kouzla" || kSeznam(K).length || kSloty(K).length).filter(
    ([id]) => id !== "spol" || kSpol(K).length || kForma(K) || kZdroje(K).some(q => /wild shape/i.test(q.n)),
  );
const BDMSV = [
  [0, "Výhoda na Intimidation · Smlouva s ďáblem (1× za dlouhý odpočinek změní Závoj na Požehnání) · feat víry nefunguje"],
  [3, "Výhoda na Deception · Neklidné sny: dlouhý odpočinek vrátí jen polovinu životů"],
  [7, "Bez bonusu i postihu"],
  [10, "Imunita vůči Vyděšený (Frightened) · výhoda na Insight · nevýhoda na Deception"],
];
const bdmSvTxt = v => (BDMSV.find(x => v <= x[0]) || BDMSV[3])[1];
/* výdrž zbroje (Artikule › Zbroj): při kritickém zásahu lze obětovat zbroj nebo štít; vyčerpané přestanou dávat AC i Resistance */
function kZbrUziti(c, S) {
  const U = (S && S.zbrU) || {},
    N = c.N,
    o = {};
  if (N.z && BZBR[N.z.dr]) {
    const mx = parseInt(BZBR[N.z.dr][1], 10) || 1;
    o.z = {k: N.z.dr, n: N.z.n, max: mx, u: Math.min(mx, +U[N.z.dr] || 0)};
    if (o.z.u >= mx) N.z = null;
  }
  if (N.s) {
    o.s = {k: "Štít", n: N.s.n, max: 1, u: Math.min(1, +U["Štít"] || 0)};
    if (o.s.u >= 1) N.s = null;
  }
  c.ZU = o;
}
const kZbrU = K => {
  const c = kCtx(K);
  return c.ZU || {};
};
function kZbrUHtml(K, kr) {
  const Z = kZbrU(K),
    L = [Z.z, Z.s].filter(Boolean);
  if (!L.length) return "";
  return `<span class="bdmzu">${L.map(z => `<span class="bdmzug${z.u >= z.max ? " bdmzux" : ""}" ${btip(`${z.n || z.k}: ${z.k === "Štít" ? "štít" : z.k.toLowerCase() + " zbroj"} vydrží ${z.max}× obětování (Artikule). Obětováno ${z.u}×${z.u >= z.max ? " – nedává AC, k opravě u kováře nebo kovářským nářadím při dlouhém odpočinku" : ""}. Klikni na kosočtverec: obětováno / opraveno.`)}>${bikZb ? bikZb(z.k) : ""}${[...Array(z.max)].map((_, j) => `<button type="button" class="${j < z.u ? "on" : ""}" data-bdmzu="${besc(z.k)}" data-j="${j}" aria-label="${besc(z.k)} ${j + 1} z ${z.max}${j < z.u ? " – obětováno" : ""}"></button>`).join("")}</span>`).join("")}${kr && L.some(z => z.u < z.max) ? `<button type="button" class="bdmmini" data-bdmobet ${btip("Kritický zásah: obětuj zbroj (nebo štít, když zbroj už nevydrží) – kritický zásah se změní v běžný")}>obětovat</button>` : ""}</span>`;
}
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const zu = T("[data-bdmzu]");
  if (zu) {
    const K = kvK(zu);
    if (!K || !kMuze(K)) return;
    const k = zu.dataset.bdmzu,
      j = +zu.dataset.j,
      S = kartaStav(K.id),
      U = Object.assign({}, S.zbrU || {}),
      u = +U[k] || 0,
      ac0 = kAC(K);
    U[k] = u > j ? j : j + 1;
    if (!U[k]) delete U[k];
    await kartaStavZmen(K.id, {zbrU: Object.keys(U).length ? U : null}, null);
    mmHlasG(
      `${K.n}: ${k === "Štít" ? "štít" : k.toLowerCase() + " zbroj"} ${U[k] > u ? "obětována" : "opravena"}${kAC(K) !== ac0 ? ` – AC ${ac0} → ${kAC(K)}` : ""}.`,
      4000,
    );
    return;
  }
  const ob = T("[data-bdmobet]");
  if (ob) {
    const K = kvK(ob);
    if (!K || !kMuze(K)) return;
    if (BZAS && BZAS.kid === K.id && BZAS.e && BZAS.e.kr) {
      await kZasahReakce(K, "obet");
      return;
    }
    const Z = kZbrU(K),
      z = Z.z && Z.z.u < Z.z.max ? Z.z : Z.s && Z.s.u < Z.s.max ? Z.s : null;
    if (!z) return;
    if ((await kOdklad(`obětovat ${z.k === "Štít" ? "štít" : z.k.toLowerCase() + " zbroj"}`, () => true)) === false) return;
    const S = kartaStav(K.id),
      U = Object.assign({}, S.zbrU || {}),
      ac0 = kAC(K);
    U[z.k] = (+U[z.k] || 0) + 1;
    await kartaStavZmen(K.id, {zbrU: U}, null);
    const txt = `${z.k === "Štít" ? "štít" : z.k.toLowerCase() + " zbroj"} obětována – kritický zásah se mění v běžný (kostky zranění jen jednou)${kAC(K) !== ac0 ? `; AC ${ac0} → ${kAC(K)}` : ""}`;
    kHodZapis({k: K.id, kdo: K.n, co: "Obětování zbroje", txt});
    const h = ((BOJ.s && BOJ.s.hraci) || []).find(x => bojKartaH(x) === K);
    if (GMV && h) bojLog(h.id, {n: "Obětování zbroje", ai: null, ci: h.id, zt: txt}, h.n);
    mmHlasG(`${K.n}: ${txt}.`, 6000);
    return;
  }
});
/* vlastnosti zbraní podle Artikulí (Zbraně) – podle druhu zbraně v názvu útoku */
const BDMZV = {
  Krvežíznivá: /\b(sickle|scimitar|glaive|longbow|shortbow)\b|srp|tesák|šavl|sudlic|kůs|luk\b|luku\b/i,
  Drtivá: /\b(maul|mace|flail|war ?hammer)\b|palcát|cep|válečné kladivo|obouruční kladivo/i,
  Omračující: /\b(club|greatclub|mace|flail|morningstar|maul|sling)\b|kyj|palic|palcát|cep|řemdih|kropáč|obouruční kladivo|prak/i,
  Ratiště: /\b(halberd|pike|glaive|spear)\b|halapartn|píka|kopí|sudlic/i,
  Ničivá: /\b(war ?hammer|war ?pick|heavy crossbow|musket)\b|válečné kladivo|čakan|těžká kuš|hákovnic/i,
  Průrazná: /\b(heavy crossbow|lance|halberd|war ?pick|musket|pistol|handgun)\b|píšťal|ručnic|hákovnic|halapartn|dřevec|čakan|těžká kuš/i,
  Odvetná: /\b(shortsword|longsword|rapier|greatsword)\b|meč|kord|rapír/i,
  Šikovná: /\b(shortsword|longsword|greatsword|halberd)\b|meč|halapartn/i,
  Přibodnutí: /\b(spear|pike)\b|píka|kopí/i,
  Ostrá: /\b(shortsword|longsword|greatsword|scimitar|battleaxe)\b|meč|šavl|tesák|bojová sekyr/i,
  Půlmeč: /\b(longsword|greatsword)\b|dlouhý meč|obouruční meč/i,
  "Do slabin!": /\bdagger\b|dýk/i,
  Strhující: /\bhalberd\b|halapartn/i,
  "Vpřed!": /\blance\b|dřevec/i,
  Štěpící: /\b(greataxe|handaxe|battleaxe)\b|sekyr|sekera/i,
  Nepřímá: /\b(longbow|shortbow|sling)\b|luk\b|luku\b|prak/i,
  "Hrom a kouř!": /\b(musket|pistol|handgun)\b|píšťal|ručnic|hákovnic/i,
};
/* vlastnosti zbraně podle Artikulí: podle názvu zbraně, nebo jak si je hráč u zbraně nastavil (stav karty zbrVl, 2026-10-18) */
const bdmZvlAuto = a => {
  if (/beze zbraně|unarmed|eldritch|kouzl/i.test(a.n)) return [];
  const z = kZbranInfo(a.n);
  /* katalog vybavení zná vlastnosti podle Artikulí přesně (2026-10-20); bez něj odhad podle jména */
  if (typeof VYB !== "undefined" && VYB) {
    const x = (z && VYBN[vybKl(z[1])]) || vybNajdi(a.n);
    if (x && x.sk === "zbrane") return x.art || [];
  }
  const s = [a.n, z && z[1], ...(a.vl || []), a.pozn].filter(Boolean).join(" ");
  return Object.keys(BDMZV).filter(k => BDMZV[k].test(s));
};
const bdmZvlMoje = (a, K) => {
  const v = K && (kartaStav(K.id).zbrVl || {})[a.n];
  return v && Array.isArray(v.vl) ? v : null;
};
const bdmZvl = (a, K) => {
  const v = bdmZvlMoje(a, K);
  return v ? v.vl.filter(k => BDMZV[k]) : bdmZvlAuto(a);
};
/* útoky: klepnutí na zásah otevře list s cílem (v boji), mimo boj rovnou hodí */
const kJeKouzloUt = (K, a) =>
  /eldritch|kouzl|cantrip|spell/i.test(String(a.n) + " " + (a.vl || []).join(" ")) ||
  kSeznam(K).some(x => x.n === a.n) ||
  (typeof kSp === "function" && !!kSp(a.n) && !kZbranInfo(a.n));
function bdmUtoky(s, h, K, gm, X) {
  const UT = kUtoky(K),
    zb = X.boj ? bojZbrVse(s, h) : [],
    ut = X.boj && !gm && bojDB && bojDB.utok && !h.ds;
  return UT.map((a, i) => {
    if (kJeKouzloUt(K, a)) return "";
    const j = zb.findIndex(w => w.karta && w.n === a.n),
      zv = KZBRV[K.id] === a.n,
      vl = (a.vl || []).filter(Boolean);
    const hit = X.boj && gm && j >= 0 ? `data-bdmsh="utok" data-j="${j}"` : ut && j >= 0 ? `data-bdmsh="utok" data-j="${j}"` : `data-khod="ut:${i}"`;
    const L = bdmZvl(a, K);
    const ox = BDM.utx.has(K.id + "|" + a.n);
    return `<div class="bdmut${zv ? " bdmzv" : ""}${ox ? " bdmuto" : ""}"><span class="bdmuti" aria-hidden="true">${a.dal ? "➶" : "⚔"}</span><div class="bdmutn" role="button" tabindex="0" data-bdmutx="${besc(a.n)}" aria-expanded="${ox}" ${btip(ox ? "Skrýt vlastnosti zbraně" : "Ukázat vlastnosti zbraně")}><b>${besc(a.n)}</b>${zv ? ` <small class="bdmruk" ${btip("Zbraň v ruce")}>✋</small>` : ""}${ox ? `<small>${besc([a.dal ? "na dálku" : "zblízka", ...vl].join(" · "))}</small>${L.length ? `<span class="bdmzvs">${L.map(k => `<span ${btip(`${k}: ${BVLZ[k]}`)}>${bikZv(k)}<i>${besc(k)}</i></span>`).join("")}</span>` : ""}${kMuze(K) && !/beze zbraně|unarmed|eldritch|kouzl/i.test(a.n) ? `<button type="button" class="bdmmini bdmzvb" data-bdmsh="zvl" data-zvl="${besc(a.n)}" ${btip("Vlastnosti zbraně podle Artikulí (Šikovná, Ostrá, Drtivá…)")}>⚙ vlastnosti</button>` : ""}` : ""}</div>
      <span class="bdmdos">${besc(a.dosah || (a.dal ? "dálka" : "5 st."))}</span><button type="button" class="bdmbox" ${hit} ${btip(`Útok ${a.n}: d20 ${bsg(+a.b || 0)}${a.pocet > 1 ? ` · ${a.pocet}× za akci` : ""}${ut && j >= 0 ? " – vyber cíl a hoď" : X.boj && gm ? " – hodí za hráče a otevře zápis" : ""}`)}>${bsg(+a.b || 0)}</button>
      <span class="bdmdmg">${a.z ? `<button type="button" class="bdmbox" data-kzr="${i}" ${btip(`Zranění ${a.z} ${BZRT[a.t] || a.t || ""}`)}>${besc(a.z)} ${bikZr(a.t)}</button>` : "–"}</span>${a.pozn || kMunTxt(K, a) ? `<small class="bdmutp">${besc(a.pozn || "")}${kMunTxt(K, a)}</small>` : ""}</div>`;
  }).join("");
}
/* oddíl Akce (2026-10-21): pět pod-karet – Akce, Bonusová, Reakce, Připravit, Omezené. Zlatá = zobrazená, šedá = v tomto tahu
   vyčerpaná, modrá = reakce volná. Kouzla zůstávají v Kouzlech, u bonusové akce a reakce jsou jen jmenovaná. */
const BDMAF = [
  ["A", "Akce"],
  ["BA", "Bonusová"],
  ["R", "Reakce"],
  ["rd", "Připravit"],
  ["omez", "Omezené"],
];
function bdmAkce(s, h, K, gm, X) {
  const UT = kUtoky(K).filter(a => !kJeKouzloUt(K, a)),
    apa = Math.max(1, ...UT.map(a => +a.pocet || 1));
  const T = X.mojeTah && X.BP,
    uA = T && X.BP.a,
    uB = T && X.BP.b,
    uP = T && X.BP.p,
    vmx = kVydMax(K),
    G = kAkceG(K, true, {bezKouzel: true}),
    spBA = kSeznam(K).filter(x => kMaSl(K, x) && kCasKouzla(x) === "BA"),
    spR = kSeznam(K).filter(x => kMaSl(K, x) && kCasKouzla(x) === "R"),
    zdrL = [
      ...kSloty(K).map(q => ({
        k: q.k,
        n: `${q.pakt ? "Pakt" : "Sloty"} ${q.st}. st.`,
        max: q.max,
        obn: q.pakt ? "krátký odpočinek" : "dlouhý odpočinek",
      })),
      ...kZdroje(K).map(q => ({k: q.n, n: q.n, max: q.max, obn: q.obn})),
      ...(vmx ? [{k: "Výdrž", n: "Výdrž", max: vmx, obn: "dlouhý odpočinek"}] : []),
    ],
    U = kartaStav(K.id).zdr || {},
    volne = zdrL.reduce((a, q) => a + Math.max(0, q.max - Math.min(q.max, +(U[q.k] || 0))), 0);
  const af0 = BDM.af[K.id] || "A",
    af = BDMAF.some(([k]) => k === af0) && (af0 !== "rd" || X.boj) ? af0 : "A";
  const seg = BDMAF.filter(([k]) => k !== "rd" || X.boj)
    .map(([k, l]) => {
      const used = (k === "A" && uA) || (k === "BA" && uB) || (k === "R" && X.boj && X.rk),
        sub =
          k === "A" || k === "BA"
            ? T
              ? used
                ? "použita"
                : "volná"
              : ""
            : k === "R"
              ? X.boj
                ? X.rk
                  ? "použita"
                  : "volná"
                : ""
              : k === "rd"
                ? X.rd
                  ? "připraveno"
                  : "akci"
                : zdrL.length
                  ? `${volne} voln${volne === 1 ? "é" : volne >= 2 && volne <= 4 ? "é" : "ých"}`
                  : "";
      /* zobrazená pod-karta slouží i jako přepínač použito / volná: akce a bonusová v tahu, reakce v boji (2026-10-21) */
      const prep =
        k !== af
          ? ""
          : (k === "A" || k === "BA") && T
            ? ` data-btp="${k === "A" ? "a" : "b"}" aria-pressed="${!!used}"`
            : k === "R" && X.boj
              ? ` ${gm ? `data-break="${h.id}"` : "data-bhrk"} aria-pressed="${!!X.rk}"`
              : "";
      const tipP = prep ? ` – klikni znovu: ${used ? "označit jako volnou" : "označit jako použitou"}` : "";
      return `<button type="button" class="bdmsg${k === af ? " bdmsgsel" : ""}${used ? " bdmsgu" : ""}${k === "R" && X.boj && !X.rk ? " bdmsgr" : ""}" data-bdmaf="${k}"${prep} role="tab" aria-selected="${k === af}" ${btip(
        (k === "A"
          ? "Akce: útoky zbraní, použití předmětu, běžné akce a schopnosti za akci"
          : k === "BA"
            ? "Bonusová akce"
            : k === "R"
              ? "Reakce: příležitostný útok a schopnosti za reakci"
              : k === "rd"
                ? "Připravit akci (Ready): spouštěč a co uděláš; spustí se reakcí"
                : "Omezené použití: sloty, schopnosti s počtem použití, Výdrž") + tipP,
      )}>${l}${sub ? `<small>${sub}</small>` : ""}</button>`;
    })
    .join("");
  const info = `<div class="bdmainf">${T ? `<button type="button" class="bdmch${uP ? " bdmchu" : ""}" data-btp="p" aria-pressed="${!!uP}" ${btip(`Pohyb: ${kRychTxt(K)} – klikni, když ho využiješ`)}>Pohyb ${kRychN(K)} st.</button>` : `<span class="bdmch" ${btip(kRychTxt(K))}>Pohyb ${kRychN(K)} st.</span>`}${vmx ? `<span class="bdmch" ${btip(`Výdrž na šermířské techniky a zápasnické chvaty: zbývá ${vmx - kVydU(K)} z ${vmx} (obnova dlouhým odpočinkem)`)}>Výdrž ${kdbPips(K, {k: "Výdrž", n: "Výdrž", max: vmx, obn: ""})}</span>` : ""}${X.boj ? `<button type="button" class="bdmch" data-bdmsh="utok" ${btip(gm ? "Zapsat za hráče: útok, kouzlo, plošný zásah" : "Útok na cíl jinak: ruční zadání, plošně")}>🎯 jiný útok</button>` : ""}</div>`;
  const spJm = L =>
    L.length
      ? `<p class="bdmnote">Kouzla: ${L.map(x => `<button type="button" class="kspn" data-kspd="${kSeznam(K).indexOf(x)}">${besc(x.n)}</button>`).join(" · ")} <small>(sesílání v Kouzlech)</small></p>`
      : "";
  const sez = (L, prazdne) => (L.length ? `<ul class="kakl bdmakl">${L.join("")}</ul>` : `<p class="bdmnote">${prazdne}</p>`);
  let telo = "";
  if (af === "A") {
    const ut = UT.length
      ? `<section class="bdmgrp${uA ? " bdmused" : ""}"><h4 class="bdmgh">Zbraně <small>· útoků za akci: ${apa}</small></h4><div class="bdmuth"><span></span><span>Zbraň</span><span>Dosah</span><span>Zásah</span><span>Zranění</span></div>${bdmUtoky(s, h, K, gm, X)}</section>`
      : `<p class="bdmnote">Žádná zbraň – útok beze zbraně nebo kouzlem (oddíl Kouzla).</p>`;
    telo = `${kForma(K) ? kFormaHtml(K) : ""}${ut}${kInvPouzHtml(K)}${G.A.length ? `<section class="bdmgrp"><h4 class="bdmgh">Schopnosti za akci</h4>${sez(G.A, "")}</section>` : ""}${kSermHtml(K) ? `<section class="bdmgrp bdmserm">${kSermHtml(K)}</section>` : ""}
    <details class="bdmstd"><summary>Běžné akce v boji</summary>${BAKCE.map(a => `<abbr ${btip(`${a[1]}: ${a[2]}`)}>${besc(a[0])}</abbr>`).join(", ")}</details>`;
  } else if (af === "BA") {
    telo = `<section class="bdmgrp${uB ? " bdmused" : ""}">${sez(G.BA, "Žádná schopnost za bonusovou akci.")}${spJm(spBA)}</section>`;
  } else if (af === "R") {
    telo = `<section class="bdmgrp${X.boj && X.rk ? " bdmused" : ""}">${sez(G.R, "")}${spJm(spR)}</section>`;
  } else if (af === "rd") {
    telo = X.rd
      ? `<p class="khl">⏳ <b>Připravená akce:</b> ${besc(X.rd)}</p><div class="bdmtahr"><button type="button" class="bdmbtn" data-bhrdygo>Spustit (reakce)</button><button type="button" class="bdmmini" data-bhrdyx>Zrušit</button></div>`
      : `<p class="bdmnote">Připravená akce (Ready) spotřebuje akci; určíš spouštěč a co uděláš. Spustí se jako reakce, nejpozději na začátku tvého dalšího tahu propadne.</p><div class="bdmtahr"><button type="button" class="bdmbtn" data-bhrdy>⏳ Připravit akci</button></div>`;
  } else {
    telo = `${zdrL.length ? `<ul class="kdbli kdbzdr bdmzdr">${zdrL.map(q => `<li><b>${besc(q.n)}</b>${kdbPips(K, q)}${q.obn ? `<small>${besc(q.obn)}</small>` : ""}</li>`).join("")}</ul>` : `<p class="bdmnote">Nic s omezeným počtem použití.</p>`}${kSchopHtml(K)}`;
  }
  return `${info}<div class="bdmseg" role="tablist" aria-label="Druh akce">${seg}</div><div class="bdmafb" data-bdmafb="${af}">${telo}</div>`;
}
/* kouzla: jen použitelná; bez volného slotu sbalená na konci, triky v jednom bloku */
function bdmKouzla(s, h, K, gm, X) {
  const L = kSeznam(K),
    f = BDM.kf[K.id] || "all",
    lv = [...new Set(L.map(x => x.st))].sort((a, b) => a - b),
    kz = K.kouzla || {},
    SL = kSloty(K);
  const ok = x => f === "all" || (f === "kon" ? x.kon : f === "rit" ? kRit(x) : String(x.st) === f),
    hrac = X.boj && !gm && bojDB && bojDB.utok && !h.ds,
    maSlot = x => kMaSl(K, x);
  const chips = `<div class="bdmchips" role="group" aria-label="Stupeň kouzel">${[...lv.map(l => [String(l), kSpSt(l, ""), l ? `${l}. stupeň` : "Triky"]), ...(L.some(x => x.kon) ? [["kon", kKonI(), "Soustředění (Concentration)"]] : []), ...(L.some(kRit) ? [["rit", kRitI(), "Rituály"]] : [])].map(([k, l, t]) => `<button type="button" class="${k === "all" ? "" : "bdmchi"}" data-bdmkf="${k}" aria-pressed="${f === k}" aria-label="${besc(t)}" ${btip(f === k ? `${t} – klepni znovu pro všechna kouzla` : t)}>${l}</button>`).join("")}</div>`;
  const hd = `<div class="bdmkzh"><span><b>${besc(kSpAb(K) || "–")}</b><small>vlastnost</small></span><span><b>${bsg(kSpUt(K))}</b><small>útok kouzlem</small></span><span><b>${kSpDC(K) || "–"}</b><small>SO záchrany</small></span></div>${typeof kBufHtml === "function" ? kBufHtml(K) : ""}${(() => {
    const L = typeof kOpakAkt === "function" ? kOpakAkt(K) : [];
    return L.length
      ? `<p class="bopak">${L.map(q => `<button type="button" class="gbtn ghost" data-kopak="${besc(q.n)}">↻ ${besc(q.n)} <small>${q.o.cas === "BA" ? "BA" : "A"} · bez slotu</small></button>`).join("")}</p>`
      : "";
  })()}`;
  const sl = SL.length
    ? `<div class="bdmsl">${SL.map(q => `<span class="bdmslr"><small>${q.pakt ? "Pakt " : ""}${q.st}. st.</small>${kdbPips(K, {k: q.k, n: `${q.pakt ? "Pakt" : "Slot"} ${q.st}. st.`, max: q.max})}</span>`).join("")}</div>`
    : "";
  /* v boji hráč sesílá kouzla se zraněním či záchranou na cíl: list s výběrem cíle (u plošných víc cílů) */
  const bj = x => hrac && (KSPD ? !!kSpBoj(K, x, x.st || 0) : x.utok != null || !!x.zach);
  const naCil = i => `data-bdmsh="utok" data-ks="${i}"`;
  const cil = (x, i) =>
    bj(x)
      ? `<button type="button" class="bdmmini bdmcil" ${naCil(i)} ${btip("Seslat – vybrat cíl (u plošných a vícecílových kouzel víc cílů)")}>Seslat</button>`
      : "";
  const radek = (x, i) => {
    const c = kCasKouzla(x),
      tri = !x.st; /* trik: bez volby slotu, jen Seslat (nebo výběr cíle v boji) – vejde se do řádku */
    return `<div class="bdmspr"><div class="bdmspn"><button type="button" class="kspn" data-kspd="${i}" ${btip("Popis kouzla")}>${besc(x.n)}</button>${kSpZn(x) ? " " + kSpZn(x) : ""}${kPzZn(x)}<small>${besc([{A: "1A", BA: "1BA", R: "1R", X: x.cas || ""}[c], x.dosah, x.trvani].filter(Boolean).join(" · "))}</small></div>
      <span class="bdmsph">${x.utok != null ? `<button type="button" class="bdmbox" ${bj(x) ? naCil(i) : `data-khod="ks:${i}"`} ${btip(bj(x) ? "Útok kouzlem – vyber cíl a hoď" : "Útok kouzlem")}>${bsg(kSpU1(K, x))}</button>` : x.zach ? `<span class="bdmso" ${btip("Záchrana cíle")}>${besc(String(x.zach).slice(0, 3).toUpperCase())} ${kSpDC(K, x) || ""}</span>` : ""}</span>
      <span class="bdmspa${tri ? " bdmspa1" : ""}">${bj(x) ? cil(x, i) : tri ? `<button type="button" class="bdmmini" data-kses="${i}" ${btip(kSesCil(x) ? "Seslat – vybrat cíl" : "Seslat na sebe")}>Seslat</button>` : kSesHtml(K, x, i)}</span></div>`;
  };
  const I = L.map((x, i) => [x, i]).filter(([x]) => ok(x)),
    tri = I.filter(([x]) => x.st === 0),
    moz = I.filter(([x]) => x.st > 0 && maSlot(x)),
    bez = I.filter(([x]) => x.st > 0 && !maSlot(x));
  /* triky ve stejných řádcích jako kouzla stupňů (2026-10-21) */
  const triH = tri.length ? `<h4 class="bdmgh">${kSpSt(0)} Triky</h4><div class="bdmsp">${tri.map(([x, i]) => radek(x, i)).join("")}</div>` : "";
  const lvH = [...new Set(moz.map(([x]) => x.st))]
    .map(
      l =>
        `<h4 class="bdmgh">${kSpSt(l)} ${l}. stupeň</h4><div class="bdmsp">${moz
          .filter(([x]) => x.st === l)
          .map(([x, i]) => radek(x, i))
          .join("")}</div>`,
    )
    .join("");
  const bezH = bez.length
    ? `<details class="bdmbez"><summary>Bez volného slotu (${bez.length})</summary><div class="bdmsp">${bez.map(([x, i]) => radek(x, i)).join("")}</div></details>`
    : "";
  return `${hd}${sl}${chips}${triH}${lvH}${bezH}${!tri.length && !moz.length && !bez.length ? `<p class="bdmnote">Žádná kouzla.</p>` : ""}${kMuze(K) && !X.boj ? `<details class="bjapd kpripw"><summary>Připravit nebo vyměnit kouzla</summary>${kPripHtml(K)}</details>` : ""}`;
}
/* vybavení do boje: lektvary, střelivo a spotřební věci, předměty s náboji, zbraně, zbroj a připoutané předměty */
/* oddíl Vybavení: bdmVyb v 14b-vybaveni.js */
/* rysy: nahoře ty s aktivací nebo počtem použití, ostatní sbalené */
function bdmRysy(K) {
  const U = kartaStav(K.id).zdr || {},
    D = kDopl(K),
    A = [...(K.rysy2 || []).filter(r => r.cas || r.max), ...(D.rysy || [])];
  const ak = A.length
    ? `<ul class="kakl bdmakl">${A.map(r => {
        const u = Math.min(r.max || 0, +(U[r.n] || 0));
        return `<li><button type="button" class="kspn" data-krys="${besc(r.n)}">${besc(r.n)}</button>${r.cas ? ` <small class="kcas">${{A: "akce", BA: "bonusová akce", R: "reakce"}[r.cas] || ""}</small>` : ""}${r.max ? ` <span class="bzd">${[...Array(r.max)].map((_, j) => `<button type="button" class="${j < u ? "on" : ""}" data-kzd="${besc(r.n)}" data-j="${j}" aria-label="${besc(r.n)} ${j + 1}"></button>`).join("")}</span>` : ""}</li>`;
      }).join("")}</ul>`
    : `<p class="bdmnote">Žádné rysy s aktivací nebo počtem použití.</p>`;
  const vse = kRysyHtml(K);
  return `<h4 class="bdmgh">S aktivací a počtem použití</h4>${ak}${vse ? `<details class="bdmbez"><summary>Ostatní rysy</summary><div class="bdmrysy">${vse}</div></details>` : ""}`;
}
/* vlastnost v bojové kartě (2026-10-17): zkratka | skóre | nahoře modifikátor (ověření), dole záchrana – úsporný řádek */
const BDMVLZ = {STR: "STR", AGI: "DEX", CON: "CON", INT: "INT", WIS: "WIS", CHA: "CHA"};
function bdmVlRadek(K, a, zAttr, edit) {
  const v = kVl(K, a);
  if (v == null) return "";
  const zm = (kartaStav(K.id).vlU || {})[a] != null,
    pf = (K.zachProf || []).includes(a),
    zs = kZach(K, a);
  return `<div class="bdmvlr${pf ? " kprof" : ""}${zm ? " bdmvlu" : ""}"><span class="bdmvlz" ${btip(`${KDBVL[a]}${pf ? " – zdatnost v záchraně" : ""}`)}>${BDMVLZ[a]}${pf ? `<i class="kdbdot" aria-hidden="true"></i>` : ""}</span>
    <button type="button" class="bdmvls" ${edit ? `data-kvled="${a}"` : "disabled"} ${btip(`${KDBVL[a]}: skóre ${v}${zm ? ` (přepsáno, v PDF ${kVl0(K, a)})` : ""}${edit ? " – klikni pro změnu" : ""}`)}>${v}</button>
    <span class="bdmvlmz"><button type="button" class="bdmvlm" data-khod="ov:${a}" ${btip(`Ověření ${KSK[a]}: d20 ${bsg(kOvB(K, a))} (s kostkou Závoje)`)}>${bsg(kMod(v))}</button><button type="button" class="bdmvlzh" ${zAttr} ${btip(`Záchrana ${KSK[a]}${pf ? " (zdatnost)" : ""}: d20 ${bsg(zs)}`)}>${bsg(zs)}</button></span></div>`;
}
/* zdatnosti a jazyky (2026-10-21): položky z PDF jde skrýt (např. elfština v tomto světě není) a doplnit vlastní (latina);
   skryté zůstávají škrtnuté s možností vrátit; skrytí i doplnění jsou úpravy karty (`dopl.bez`, `dopl.zdat`, `dopl.jazyky`) */
function bdmZdatHtml(K, edit) {
  const D = kDopl(K),
    bez = new Set(D.bez || []),
    zd = K.zd || {};
  const chip = (typ, v, i, x) =>
    `<span class="bdmzch${x ? " bdmzbez" : ""}">${besc(v)}${edit ? (x ? `<button type="button" class="bdmzx" data-kzdvrat="${besc(typ + ":" + v)}" aria-label="Vrátit ${besc(v)}" ${btip("Z PDF, skryto – klikni pro vrácení")}>↺</button>` : i != null ? `<button type="button" class="bdmzx" data-kdoplx="${typ}:${i}" aria-label="Odebrat ${besc(v)}" ${btip("Doplněno – odebrat")}>×</button>` : `<button type="button" class="bdmzx" data-kzdbez="${besc(typ + ":" + v)}" aria-label="Skrýt ${besc(v)}" ${btip("Z PDF – skrýt (v tomto světě neplatí)")}>×</button>`) : ""}</span>`;
  const radek = (k, l, dopl) => {
    const L = zd[k] || [],
      Dk = D[dopl] || [];
    if (!L.length && !Dk.length && !edit) return "";
    return `<span class="bdmzl">${l}</span><span class="bdmzchs">${L.map(v => chip(k, v, null, bez.has(k + ":" + v))).join("")}${Dk.map((v, i) => chip(dopl, v, i, false)).join("")}${edit ? `<form class="bdmzf" data-kdoplf="${dopl}"><input name="v" placeholder="+ přidat" maxlength="60" aria-label="${l} – přidat"><button type="submit" class="bdmzx" aria-label="Přidat">+</button></form>` : ""}</span>`;
  };
  const telo = [
    radek("zbroj", "Zbroj", "zdat"),
    radek("zbrane", "Zbraně", "zdat"),
    radek("nastroje", "Nástroje", "zdat"),
    radek("jazyky", "Jazyky", "jazyky"),
  ].join("");
  return telo ? `<h4 class="bdmgh">Zdatnosti a jazyky</h4><div class="bdmzdat">${telo}</div>` : "";
}
function bdmTelo(s, h, K, gm, X, id) {
  const prof = K.zachProf || [],
    dp = K.dovProf || {};
  if (id === "vl") {
    /* Statistiky (2026-10-21): vlastnosti, dovednosti ve dvou sloupcích, smysly, zdatnosti a jazyky (upravitelné) */
    const zh = a => (X.boj ? `data-bkzh="${a}"` : `data-khod="za:${a}"`),
      edit = gm || kMuze(K);
    const ab = `<div class="bdmainf bdmvlh"><span class="bdmch" ${btip("Bonus zdatnosti")}>Zdatnost <b>${bsg(kPB(K))}</b></span><span class="bdmch" ${btip(kRychTxt(K))}>Rychlost <b>${kRychN(K)} st.</b></span><button type="button" class="bdmch" data-khod="in" ${btip(`Iniciativa: d20 ${bsg(kIni(K))} – klikni a hoď`)}>Iniciativa <b>${bsg(kIni(K))}</b></button></div><div class="bdmvl">${BAB.map(a => bdmVlRadek(K, a, zh(a), edit)).join("")}</div>`;
    const za = `${K.konVyhoda ? `<p class="bdmnote"><button type="button" class="bdmmini" ${X.boj ? `data-bkzh="CON" data-adv="1"` : `data-khod="za:CON"`}>◎ soustředění ${bsg(kZach(K, "CON"))} s výhodou</button> War Caster</p>` : ""}${(K.zachPozn || []).length ? `<p class="bdmnote">${K.zachPozn.map(besc).join(" · ")}</p>` : ""}`;
    const dov = `<h4 class="bdmgh">Dovednosti</h4><div class="bdmdov bdmdov2">${Object.keys(KDOVAB)
      .filter(n => (K.dov || {})[n] != null)
      .map(n => {
        const r = kSvAdv(K, n);
        return `<div class="bdmdr${dp[n] ? " kprof" : ""}${dp[n] === "E" ? " kexp" : ""}"><i class="kdbdot" aria-hidden="true" ${btip(dp[n] === "E" ? "Expertise" : dp[n] ? "Zdatnost" : "")}></i><span>${besc(n)} <small>${KDOVAB[n]}</small>${r.length ? ` <em class="bdmsva" ${btip(r.map(x => x[1]).join(", "))}>${r[0][0] > 0 ? "výh." : "nevýh."}</em>` : ""}</span><button type="button" class="bdmbox" data-khod="dv:${besc(n)}" ${btip(`${n}: d20 ${bsg(kDov(K, n))}`)}>${bsg(kDov(K, n))}</button></div>`;
      })
      .join("")}</div>`;
    const def = [["Vulnerability", K.zra]].filter(([, L]) => (L || []).length);
    const sm = `<h4 class="bdmgh">Smysly</h4><p class="bdmnote bdmpas">Pasivní: Vnímání <b>${kPas(K, "vnimani")}</b> · Pátrání <b>${kPas(K, "patrani")}</b> · Vhled <b>${kPas(K, "vhled")}</b></p>${K.smysly ? `<p class="bdmnote bdmpas">${besc(K.smysly)}</p>` : ""}${def.map(([l, L]) => `<p class="bdmdef"><b>${l}</b> ${L.map(t => `${bikZr(t)}<span>${besc(BZRT[t] || t)}</span>`).join(" ")}</p>`).join("")}`;
    return ab + za + dov + sm + bdmZdatHtml(K, edit);
  }
  if (id === "akce") return bdmAkce(s, h, K, gm, X);
  if (id === "kouzla") return bdmKouzla(s, h, K, gm, X);
  if (id === "vyb") return bdmVyb(K);
  if (id === "rysy") return bdmRysy(K);
  if (id === "duse" || id === "denik") return `<div class="kdb2 bdmkdb">${kartaDbHtml(K, kartaDbData(K), {jenTab: id})}</div>`;
  if (id === "spol") return kFormaHtml(K) + kSpolHtml(K);
  return "";
}
/* hody proti smrti mimo boj (2026-10-19): stav karty `ds` {u,n,st}; v boji je nese účastník boje (h.ds) */
function kDsHtml(K, S, cur) {
  const d = S.ds;
  if (!d)
    return cur <= 0
      ? `<button type="button" class="bdmbtn" data-kds="pad">${bi("prah-smrti")} Padl jsem (0 HP) – začít hody proti smrti</button>`
      : `<button type="button" class="bdmbtn ghost" data-kds="pad" ${btip("Pád na 0 HP mimo boj (pád, past, jed…): bezvědomí, hody proti smrti a 1 úroveň vyčerpání")}>${bi("prah-smrti")} Padl jsem (0 HP)</button>`;
  if (d.st === "mrtev")
    return `<p class="khl">${bojDsPip({ds: d})} <b>Tři neúspěchy – postava umírá.</b> Jen zázrak nebo vypravěč. <button type="button" class="gbtn ghost" data-kds="x">Zrušit</button></p>`;
  if (d.st === "stab")
    return `<p class="khl">${bojDsPip({ds: d})} <b>Stabilizován</b> – v bezvědomí, probere se za 1k4 hodin s 1 HP, nebo dřív po léčení. <button type="button" class="gbtn" data-kds="x">Probral se (1 HP)</button></p>`;
  return `<div class="khl kdsblok"><p>${bojDsPip({ds: d})} <b>Na prahu smrti</b> – na začátku každého tahu hod proti smrti: d20, 10+ úspěch, 1 = dva neúspěchy, 20 = probereš se s 1 HP.</p>
    <p class="bdmrow"><button type="button" class="bdmbtn" data-kds="hod">🎲 Hod proti smrti</button><button type="button" class="gbtn ghost" data-kds="u" ${btip("Zapsat úspěch (hod u stolu)")}>úspěch</button><button type="button" class="gbtn ghost" data-kds="n" ${btip("Zapsat neúspěch (hod u stolu)")}>neúspěch</button><button type="button" class="gbtn ghost" data-kds="stab" ${btip("Někdo tě stabilizoval: Medicine DC 10, Spare the Dying nebo léčitelská brašna")}>stabilizován</button></p></div>`;
}
/* vysouvací listy zespodu */
function bdmList(s, h, K, gm, X, t) {
  const S = kartaStav(K.id),
    D = kDuse(K),
    mx = kHPmax(K),
    cur = X.boj ? bojHpPC(h, K) : S.hp != null ? +S.hp : mx,
    thp = +S.thp || 0,
    ac = kAC(K) + (X.boj ? +h.kryt || 0 : 0),
    zv = zavojInfo();
  if (t === "hp")
    return [
      "Životy",
      `${
        X.boj
          ? `<div class="bdmhpz"><input type="number" name="bkzr-${h.id}" data-bkzrv min="0" max="300" inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-bkzr="z">Zranit</button><button type="button" class="kdbheal" data-bkzr="l">Léčit</button><button type="button" class="bdmmini" data-bkzr="d" ${btip("Dočasné HP (nesčítají se – platí vyšší)")}>dočasné</button></div><label class="bdmtyp">Typ zranění <select data-bkzrt aria-label="Typ zranění">${BZTYPY.map(t => `<option value="${t}">${BZRT[t]}</option>`).join("")}</select></label>`
          : `<div class="bdmhpz kzrb"><input type="number" min="0" max="999" data-kzrv inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="kdbdmg" data-kzrz="z">Zranit</button><button type="button" class="kdbheal" data-kzrz="l">Léčit</button><button type="button" class="bdmmini" data-kzrz="d">dočasné</button><select data-kzrt aria-label="Typ zranění"><option value="">typ</option>${BZTYPY.map(t => `<option value="${t}">${BZRT[t]}</option>`).join("")}</select></div>`
      }
      <p class="bdmnote">Teď <b>${cur}</b> z ${mx}${thp ? ` · dočasné ${thp}` : ""}. Pád na 0 HP podle Artikulí: bezvědomí, hody proti smrti, hod na kritické zranění a 1 úroveň vyčerpání; léčení jen stabilizuje.</p>${X.boj && !X.d ? `<button type="button" class="bdmbtn" data-bhds="pad">${bi("prah-smrti")} ${gm ? "Padl na 0 HP" : "Padl jsem (0 HP)"}</button>` : X.boj ? "" : kDsHtml(K, S, cur)}`,
    ];
  if (t === "st") {
    const st0 = X.boj ? (h.stav || []).filter(t => BSTAVH.includes(t)) : S.stavy || [],
      stv = kKonDrzi(K) && !st0.includes("soustředí") ? [...st0, "soustředí"] : st0;
    return [
      "Stavy",
      X.boj ? kStavyTab(stv, BSTAVH, "data-bhst", +S.vycerp || 0, kKonNazev(K)) : kStavyTab(stv, KSTV, "data-kstav", +S.vycerp || 0, kKonNazev(K)),
    ];
  }
  if (t === "ac") {
    const ZU = kZbrU(K),
      zuL = [ZU.z, ZU.s].filter(Boolean);
    return [
      `Obrana · AC ${ac}`,
      `<p class="bdmnote">${besc(kACR(K).txt)}${X.boj && h.kryt ? ` + kryt ${h.kryt}` : ""}</p>${zuL.length ? `<div class="bdmrow">${kZbrUHtml(K, true)}</div><p class="bdmnote">Při kritickém zásahu obětuj zbroj nebo štít – kritický zásah se změní v běžný. Vycpávaná a štít vydrží 1×, kroužková 2×, plátová a komplexní 3×; pak nedávají AC ani Resistance, dokud je kovář neopraví (klepnutím na kosočtverec).</p>` : `<p class="bdmnote">Postava nemá zbroj ani štít, které by šly obětovat.</p>`}${X.boj ? `<div class="bdmrow">${X.kry || ""}</div>` : ""}`,
    ];
  }
  if (t === "sv")
    return [
      `Svědomí ${D.sv} · ${SVST(D.sv)}`,
      `<p class="bdmnote">${besc(bdmSvTxt(D.sv))}</p>
      <div class="bdmsvk"><span class="kbod"><small>Body hříchu</small><b>${D.hr}</b></span><span class="kbod"><small>Dobré skutky</small><b>${D.sk}</b></span></div>
      <div class="bdmrow"><span class="kdusk">Hřích</span><button type="button" class="bdmbtn" data-kdu="h1" ${btip("Všední hřích, podlehnutí Neřesti nebo přijaté Pokušení: +1 bod hříchu")}>+1 hřích</button><button type="button" class="bdmbtn" data-kdu="h2" ${btip("Všední hřích proti vlastní Ctnosti: +2 body hříchu")}>+2 proti Ctnosti</button><button type="button" class="bdmbtn bhrich" data-kdu="s1" ${btip("Smrtelný hřích: Svědomí −1 hned")}>smrtelný −1</button><button type="button" class="bdmbtn bhrich" data-kdu="s2" ${btip("Smrtelný hřích proti vlastní Ctnosti: Svědomí −2 hned")}>smrtelný −2</button></div>
      <div class="bdmrow"><span class="kdusk">Skutek</span><button type="button" class="bdmbtn bdmsk" data-kdu="d1" ${btip("Jednání podle Ctnosti, které něco stojí: +1 bod dobrých skutků")}>+1 dobrý skutek</button><button type="button" class="bdmbtn bdmsk" data-kdu="v1" ${btip("Skutečná oběť nebo riziko života pro Ctnost: Svědomí +1 hned")}>velký skutek +1</button>${D.hr || D.sk ? `<button type="button" class="bdmmini" data-kdu="op" ${btip("Ubrat poslední připsaný bod")}>oprava</button>` : ""}</div>
      <p class="bdmnote">Body se sečtou při Zpytování svědomí na konci sezení. <button type="button" class="bdmlink" data-bdmsec="duse" data-bdmzav>Celá duše, rány a účinky →</button></p>`,
    ];
  if (t === "odp") {
    const kzMax = kKostkyPool(K).length || kLv(K);
    const spent = +S.kz || 0,
      zb = kzMax - spent,
      pool = kKostkyPool(K),
      dal = pool[spent] || 8,
      con = kMod((K.vl || {}).CON || 10),
      mxh = kHPmax(K),
      curh = S.hp != null ? +S.hp : mxh;
    return [
      "Odpočinek",
      `<div class="bdmrow"><button type="button" class="bdmbtn" data-kodp="k" ${btip("Krátký odpočinek (1 hodina): zdroje s krátkým odpočinkem, sloty paktu; kostky životů pak utratíš po jedné")}>☾ Krátký</button><button type="button" class="bdmbtn" data-kodp="d" ${btip(`Dlouhý odpočinek (8 hodin): životy, sloty, zdroje, Výdrž, polovina kostek životů, vyčerpání −1`)}>☾☾ Dlouhý</button></div>
      <p class="kdbvy" ${btip(`Kostky životů ${kHDtxt(K)}: použité zaškrtni (krátký odpočinek je utratí sám)`)}><small>Kostky životů ${besc(kHDtxt(K))}</small>${[...Array(kzMax)].map((_, j) => `<button type="button" class="${j < (+S.kz || 0) ? "on" : ""}" data-kkz="${j}" aria-label="Kostka životů ${j + 1}"></button>`).join("")}</p>
      <p class="bdmrow"><button type="button" class="bdmbtn" data-kkzh ${zb > 0 && curh < mxh ? "" : "disabled"} ${btip(zb > 0 ? `Při krátkém odpočinku: hodí jednu kostku životů (d${dal} ${bsg(con)} CON) a přičte životy. Zbývá ${zb}.` : "Žádná kostka životů nezbývá – vrátí je dlouhý odpočinek")}>🎲 Utratit kostku životů d${dal} ${bsg(con)}</button><small class="bdmnote">zbývá ${zb}${curh >= mxh ? " · životy jsou plné" : ""}</small></p>${D.sv >= 1 && D.sv <= 3 ? `<p class="bdmnote">Na scestí – Neklidné sny: dlouhý odpočinek vrátí jen polovinu životů.</p>` : ""}`,
    ];
  }
  if (t === "zvl") {
    const wn = (BDM.sheet || {}).w,
      a = kUtoky(K).find(x => x.n === wn);
    if (!a) return ["Vlastnosti zbraně", `<p class="bdmnote">Zbraň nenalezena.</p>`];
    const moje = bdmZvlMoje(a, K),
      L = bdmZvl(a, K),
      T0 = (moje && moje.t) || [a.t, BSIKALT[a.t]].filter(Boolean);
    return [
      `Vlastnosti · ${a.n}`,
      `<form data-bdmzvf data-w="${besc(a.n)}"><p class="bdmnote">${moje ? "Vlastnosti nastavené ručně." : "Podle názvu zbraně" + (L.length ? "" : " žádné") + " – zaškrtni, co zbraň podle Artikulí má."}</p>
      <div class="bdmzvlg">${Object.keys(BDMZV)
        .map(
          k =>
            `<label class="bdmzvlr"><input type="checkbox" name="vl" value="${besc(k)}"${L.includes(k) ? " checked" : ""}> ${bikZv(k)}<b>${besc(k)}</b><small>${besc(BVLZ[k] || "")}</small></label>`,
        )
        .join("")}</div>
      <p class="bdmnote"><b>Šikovná</b> – mezi jakými typy zranění se volí:</p><div class="bdmrow">${["Slashing", "Piercing", "Bludgeoning"].map(t => `<label class="bdmzvlt"><input type="checkbox" name="t" value="${t}"${T0.includes(t) ? " checked" : ""}> ${bikZr(t)} ${BZRT[t]}</label>`).join("")}</div>
      <div class="bdmrow"><button class="bdmbtn on">Uložit</button>${moje ? `<button type="button" class="bdmbtn" data-bdmzvx="${besc(a.n)}">Podle názvu zbraně</button>` : ""}</div></form>`,
    ];
  }
  if (t === "sprava") {
    const S2 = kartaStav(K.id),
      m = kMuze(K);
    return [
      K.n,
      `<p class="bdmnote">${besc(
        [
          K.druh,
          kTridy(K)
            .map(t => t.n + " " + t.u)
            .join(" / ") || K.povolani,
        ]
          .filter(Boolean)
          .join(" · "),
      )} · ${kLv(K)}. úroveň · zdatnost ${bsg(kPB(K))}${K.hrac ? ` · hraje ${besc(K.hrac)}` : ""}${K.test ? " · <i>zkušební</i>" : ""}</p>
      <div class="bdmrow">${kZpetBtn(K)}${m ? `<button type="button" class="bdmbtn${KUPRO.has(K.id) ? " on" : ""}" data-kuprt ${btip("Úpravy postavy: povolání a úrovně, vlastnosti, výpočty, předměty, vlastní úpravy")}>⚙ Úpravy</button><button type="button" class="bdmbtn" data-klvup ${btip("Postup na další úroveň: životy, nové rysy, vlastnosti nebo feat")}>⬆ Postup na úroveň</button>` : ""}</div>
      <div class="bdmrow">${m && window.MMDB ? `<label class="bdmbtn">Změnit portrét<input type="file" accept="image/*" data-kimg hidden></label>` : ""}${S2.img && m ? `<button type="button" class="bdmbtn" data-kimgx>Odebrat portrét</button>` : ""}${window.MMDB ? `<button type="button" class="bdmbtn" data-khistb ${btip("Předchozí stavy karty – lze obnovit")}>Historie</button>` : ""}<button type="button" class="bdmbtn" data-ktisk ${btip("Vytiskne kartu nebo ji uloží jako PDF")}>Tisk</button><button type="button" class="bdmbtn" data-kexport ${btip("Stáhne kartu a stav postavy jako JSON")}>Export</button>${GMV && !KSTAT.has(K.id) && !K.test ? `<button type="button" class="bdmbtn" data-ksmaz>Smazat kartu</button>` : ""}</div>
      <p class="bdmnote"><a href="#karty">Všechny karty, nahrání PDF a herní záznam družiny →</a></p>${hraUcetHtml(K)}`,
    ];
  }
  if (t === "vyprav") return hraVypravList(K);
  if (t === "vec") return bdmVecList(K, +(BDM.sheet || {}).i);
  if (t === "pen") return bdmPenList(K);
  if (t === "kost")
    return [
      "Hod kostkou",
      `${kPriHtml(K)}<p class="kadv" role="radiogroup" aria-label="Další hod">${[
        [0, "normálně"],
        [1, "výhoda"],
        [-1, "nevýhoda"],
      ]
        .map(([k, l]) => `<label><input type="radio" name="kadv-${besc(K.id)}" data-bdmadv="${k}"${KADV === k ? " checked" : ""}> ${l}</label>`)
        .join(
          "",
        )}</p>${kHodForm(K)}<p class="bdmnote">Ke každému hodu se hází i kostka Závoje (d6): 1–2 Pokušení, 5–6 Požehnání${zv.z ? " – teď Hodina Závoje, Pokušení na 1–3" : ""}.</p>`,
    ];
  if (t === "utok") {
    const L = BDM.sheet || {},
      zb = X.boj ? bojZbrVse(s, h) : [],
      w = L.j != null ? zb[+L.j] : null,
      sp = L.ks != null ? kSeznam(K)[+L.ks] : null;
    if (gm)
      return [
        w ? `Za hráče · ${w.n}` : "Zapsat za hráče",
        `${w && X.boj ? bojPredHod(s, h, K, true, L.j) : ""}${X.utok || `<p class="bdmnote">Boj neběží.</p>`}`,
      ];
    return [
      w ? `Útok · ${w.n}` : sp ? `Kouzlo · ${sp.n}` : "Útok na cíl",
      w
        ? `${bojPredHod(s, h, K, false, L.j)}${String(X.utok || "").replace(/<div class="butc">[\s\S]*?<\/span><\/div>/, "")}`
        : sp && X.boj
          ? bojPredKouzlo(s, h, K)
          : `${X.utok || ""}`,
    ];
  }
  return ["", ""];
}
function bojDbm(s, h, K, gm, vzdy, X) {
  X = X || {};
  const S = kartaStav(K.id),
    D = kDuse(K),
    mx = kHPmax(K),
    cur = X.boj ? bojHpPC(h, K) : S.hp != null ? +S.hp : mx,
    thp = +S.thp || 0,
    pr = Math.max(0, Math.min(100, Math.round((cur / mx) * 100)));
  const key = K.id,
    ac = kAC(K) + (X.boj ? +h.kryt || 0 : 0),
    IMG = kImg(K) || bojPortH(K.n),
    sek = bdmSekce(K),
    sec = sek.some(x => x[0] === BDM.sec[key]) ? BDM.sec[key] : "akce";
  const tr = kTridy(K),
    sub = [K.druh, tr.map(t => `${t.n} ${t.u}`).join(" • ") || K.povolani].filter(Boolean).join(" · ");
  const ZU = kZbrU(K),
    zuL = [ZU.z, ZU.s].filter(Boolean),
    zuZb = zuL.reduce((a, z) => a + Math.max(0, z.max - z.u), 0);
  const stL0 = X.boj ? (h.stav || []).filter(t => BSTAVH.includes(t)) : S.stavy || [];
  const insp = !!S.insp,
    zv = zavojInfo(),
    kr = kRany(K),
    kd = kKonDrzi(K),
    stN = stL0.length + (kd && !stL0.includes("soustředí") ? 1 : 0) + (+S.vycerp ? 1 : 0),
    sv = kSvKl(D.sv),
    shOpen = BDM.sheet && BDM.sheet.k === key ? BDM.sheet.t : "";
  const hpB = c =>
    `<button type="button" class="bdmhp${c || ""}${cur <= 0 ? " bhp0" : cur <= mx / 2 ? " bhp2" : ""}" data-bdmsh="hp" aria-expanded="${shOpen === "hp"}" ${btip("Životy – klikni: zranění, léčení, dočasné HP")}><small>Životy</small><b>${cur}<i>/${mx}</i>${thp ? `<em>+${thp}</em>` : ""}</b>${c ? "" : dsH}<i class="bdmhpbar" style="--p:${pr}%"></i></button>`;
  /* hlavička (2026-10-21, kompaktní): co dřív stálo v pruhu pod ní, je uvnitř – Hodina Závoje u podtitulu, rány jako odznak
     na portrétu, vyčerpání mezi stavy, hody proti smrti pod životy; reakce nad portrétem, inspirace pod ním bez popisku */
  const zavH =
    zv.z || zv.fe.length
      ? `<span class="bdmzavm${zv.pravda ? " bdmpravda" : ""}" ${btip(zv.pravda ? "Hodina Pravdy: svátek a Hodina Závoje – kostka Závoje nezná neutrální výsledek" : zv.z ? `Hodina Závoje (${zv.z}): Pokušení padá již na 1–3` : `Svátek: ${zv.fe.map(x => x.n).join(", ")}`)}>${bi("zavoj")}${zv.pravda ? "Hodina Pravdy" : zv.z ? "Hodina Závoje" : "Svátek"}</span>`
      : "";
  const krH = kr.length
    ? `<a class="bdmkrb" href="#karty/${besc(K.id)}" data-bdmsec="duse" aria-label="Neléčené rány: ${kr.length}" ${btip(`Neléčené rány: ${kr.map(x => x.t).join("; ")} – podrobnosti v Duši`)}>${bi("rana")}${kr.length}</a>`
    : "";
  const dsH = X.boj && h.ds ? bojDsPip(h) : !X.boj && S.ds ? bojDsPip({ds: S.ds}) : "";
  const stIk = (() => {
    const L = [...stL0, ...(kd && !stL0.includes("soustředí") ? ["soustředí"] : [])],
      ic = t => (SRDIC[t] ? bi(SRDIC[t], "bdmsti1") : BSTI[t] ? bi(BSTI[t][0], "bdmsti1") : ""),
      V = +S.vycerp || 0,
      I = [...L.map(t => [ic(t), t]), ...(V ? [[bi("vycerpani", "bdmsti1"), `vyčerpání ${V}`]] : [])].filter(x => x[0]);
    return I.length
      ? `<span class="bdmsti" aria-label="${besc(I.map(x => x[1]).join(", "))}">${I.slice(0, 3)
          .map(x => x[0])
          .join("")}${I.length > 3 ? `<b>+${I.length - 3}</b>` : ""}</span>`
      : "";
  })();
  const head = `<header class="bdmh"><div class="bdmtop">${gm ? `<button type="button" class="bdmback" data-bhrozb="${h.id}" aria-label="Sbalit kartu" ${btip("Sbalit")}>‹</button>` : `<span class="bdmback0"></span>`}<div class="bdmnm"><b>${besc(K.n)}</b><small>${besc(sub)}${zavH}</small></div>${curView === "karty" ? `<span class="bdmback0"></span>` : `<a class="bdmkl" href="#karty/${besc(K.id)}" aria-label="Karta na celou stránku" ${btip("Karta na celou stránku")}>${bdmIc("rysy")}</a>`}</div>
    <div class="bdmgrid">
      <span class="bdmacw">${(() => {
        const R = kOdol(K),
          I = K.imu || [];
        return R.length || I.length
          ? `<span class="bdmres" ${btip(`${R.length ? "Resistance: " + R.map(t => BZRT[t] || t).join(", ") : ""}${R.length && I.length ? " · " : ""}${I.length ? "Immunity: " + I.map(t => BZRT[t] || t).join(", ") : ""}`)}>${R.map(t => bikZr(t)).join("")}${I.map(t => `<span class="bdmimu">${bikZr(t)}</span>`).join("")}</span>`
          : "";
      })()}<span class="bdmacp">
      <button type="button" class="bdmac${zuL.length && !zuZb ? " bdmzbr0" : ""}" data-bdmsh="ac" aria-expanded="${shOpen === "ac"}" ${btip(`AC ${ac}: ${kACR(K).txt}${X.boj && h.kryt ? ` + kryt ${h.kryt}` : ""}${zuL.length ? ` · obětování zbroje při kritickém zásahu: zbývá ${zuZb} (${zuL.map(z => `${z.k === "Štít" ? "štít" : z.k.toLowerCase()} ${z.max - z.u}/${z.max}`).join(", ")})` : ""} – klikni`)}><small>AC</small><b>${ac}</b>${zuL.length ? `<span class="bdmzk" aria-label="Obětování zbroje: zbývá ${zuZb}">${zuL.map(z => `<span class="bdmzkg${z.k === "Štít" ? " bdmzks" : ""}">${[...Array(z.max)].map((_, j) => `<i class="${j < z.max - z.u ? "on" : ""}"></i>`).join("")}</span>`).join("")}</span>` : ""}</button>
      <button type="button" class="bdmini bdmsvh psv${sv}" data-bdmsh="sv" aria-expanded="${shOpen === "sv"}" ${btip(`Svědomí ${D.sv} – ${SVST(D.sv)}. Klikni: body hříchu a dobrých skutků`)}><small>Svědomí</small><b>${D.sv}</b>${D.hr || D.sk ? `<span class="bdmsvb" aria-label="Body hříchu ${D.hr}, dobré skutky ${D.sk}"><i class="bdmsvh1">${D.hr}</i><i class="bdmsvd1">${D.sk}</i></span>` : ""}</button></span></span>
      <span class="bdmportw"><button type="button" class="bdmport bdmsv${sv}${insp ? " on" : ""}" data-bdmins aria-pressed="${insp}" ${btip(`Svědomí ${D.sv} – ${SVST(D.sv)} (barva rámu). Hrdinská inspirace: ${insp ? "má ji – klikni a utrať" : "nemá – klikni, když ji získá"} (podle Artikulí za jednání podle Ctnosti nebo podlehnutí Neřesti).`)}>${IMG ? `<img src="${besc(IMG)}" alt="" width="96" height="96">` : `<span class="bdmpini">${besc((K.n || "?")[0])}</span>`}<span class="bdmsun" aria-label="Hrdinská inspirace">${bdmIc("slunce")}</span></button>${X.boj ? `<button type="button" class="bdmrk${X.rk ? " on" : ""}" ${gm ? `data-break="${h.id}"` : vzdy ? "data-bhrk" : "disabled"} aria-pressed="${!!X.rk}" ${btip(`Reakce: ${X.rk ? "v tomto kole použita" : "k dispozici"} – klikni`)}>R</button>` : ""}${krH}</span>
      ${hpB("")}
      <span class="bdmbtns"><button type="button" class="bdmsq" data-bdmsh="odp" aria-expanded="${shOpen === "odp"}" aria-label="Odpočinek" ${btip("Krátký nebo dlouhý odpočinek, kostky životů")}>${bdmIc("ohen")}</button><button type="button" class="bdmsq" data-bdmsh="sprava" aria-expanded="${shOpen === "sprava"}" aria-label="Postava: úpravy, postup na úroveň, historie" ${btip("Postava: úpravy, postup na úroveň, portrét, historie, tisk")}>${bdmIc("kolo")}</button>${hraVypravBtn(K, shOpen)}</span>
      <button type="button" class="bdmst" data-bdmsh="st" aria-expanded="${shOpen === "st"}" ${btip(kd ? "Stavy – postava se soustředí (Concentration)" : "Stavy")}>Stavy${stIk}${stN ? ` <b>${stN}</b>` : ""}</button>
    </div></header>`;
  /* hlášky v jednom proužku: první je vidět, ostatní po klepnutí */
  const hl =
    shOpen === "utok" && X.hlS != null
      ? X.hlS
      : X.hl != null
        ? X.hl
        : kHlas([
            navrhyMojeHtml(K),
            postupBanner(K),
            kZavBox(K),
            KKON[K.id] && kKonDrzi(K)
              ? `<p class="khl kdbkon">${bi("soustredi")} <b>Soustředění:</b> CON záchrana SO ${KKON[K.id]} <button type="button" class="gbtn" data-kkonh>🎲 CON ${bsg(kZach(K, "CON"))}${K.konVyhoda ? " s výhodou" : ""}</button><button type="button" class="kx" data-kkonx aria-label="Zavřít">×</button></p>`
              : "",
            kPoslBox(K),
          ]);
  /* stav, který bere akce: tlačítka tahu, útoků, kouzel a reakce ztlumené (CSS .bdmnesch) a hláška */
  const nes = (X.boj ? bojNeschopny(h.stav) : "") || kNeschopny(K);
  /* hlášky nad kartou (2026-10-20): ÚKOLY, které chtějí rozhodnutí (zásah s reakcí, Riposte, Pokušení, soustředění, přesun Hexu,
     hod proti smrti, připravená akce, Poslat vypravěči), jsou v pruhu „Čeká na tebe“ a nikdy se nesbalují; informace (Požehnání,
     Tvůj tah, výsledek hodu…) se sbalují na první z nich jako dřív. Dřív se první sbalená hláška (Požehnání) schovala i tlačítko. */
  const HU = kHlasRozdel(hl),
    hlO = BDM.hlo.has(key),
    hlN = HU.info.length;
  const hlH =
    hl || nes
      ? `<div class="bdmhl">${nes ? `<p class="khl bdmneshl">${BSTI[nes] ? bi(BSTI[nes][0]) : ""} <b>${nes[0].toUpperCase() + nes.slice(1)}${SRDST[nes] ? ` (${SRDST[nes].en})` : ""}:</b> nemůžeš provést akci, bonusovou akci ani reakci${/ochromen|zkamen|omráčen|chycen|zadržen/.test(nes) ? ", rychlost 0" : ""}. Stav zruší vypravěč nebo záchrana na konci tahu.</p>` : ""}${HU.ukol.length ? `<div class="bdmukol" role="region" aria-label="Čeká na tebe"><small class="bdmukolh">${bi("tah")} Čeká na tebe${HU.ukol.length > 1 ? ` · ${HU.ukol.length}` : ""}</small><div class="khlas">${HU.ukol.join("")}</div></div>` : ""}${hlN ? `<div class="bdminfo${hlN > 1 ? " bdmvic" : ""}${hlN > 1 && !hlO ? " bdmhlz" : ""}"><div class="khlas">${HU.info.join("")}</div>${hlN > 1 ? `<button type="button" class="bdmhlb" data-bdmhl aria-expanded="${hlO}">${hlO ? "méně" : `+${hlN - 1}`}</button>` : ""}</div>` : ""}</div>`
      : "";
  /* lepkavý pruh: zúžená hlavička (při posunu) a záložky */
  const lep = `<div class="bdmlep"><div class="bdmmi"><span class="bdmmin">${besc(K.n)}</span><button type="button" class="bdmmac" data-bdmsh="ac" ${btip("AC – obětování zbroje")}>AC <b>${ac}</b></button>${hpB(" bdmmhp")}</div>
    <nav class="bdmtabs" role="tablist" aria-label="Oddíly karty">${sek.map(([id, n, k]) => `<button type="button" role="tab" data-bdmsec="${id}" aria-selected="${id === sec}" ${btip(n)}>${bdmIc(id)}<span>${besc(k)}</span></button>`).join("")}</nav></div>`;
  const body = `<section class="bdmsec" data-bdmid="${sec}">${bdmTelo(s, h, K, gm, X, sec)}</section>`;
  const konec =
    vzdy && X.boj && (s.obsazeni || {})[s.tah] === h.id
      ? (s.hotovo || {})[h.id] === (s.kolo || 1) * 100 + (s.tah || 0)
        ? `<p class="bdmnote">✓ Tah dohrán – vypravěč posune dál.</p>`
        : bojKonecBtn(h.id)
      : "";
  const list = shOpen
    ? (() => {
        const [tit, obs] = bdmList(s, h, K, gm, X, shOpen);
        return `<div class="bdmzavb" data-bdmzav aria-hidden="true"></div><div class="bdmlist" role="dialog" aria-label="${besc(tit)}" data-bdmlist><div class="bdmlh" data-bdmlh><i aria-hidden="true"></i><b>${besc(tit)}</b><button type="button" class="bdmlx" data-bdmzav aria-label="Zavřít">×</button></div><div class="bdmlb">${obs}</div></div>`;
      })()
    : "";
  const upr = `${!kMuze(K) && X.karta ? `<p class="kropozn">Tuto kartu upravuje přihlášený hráč. Ke své postavě se přihlas na stránce <a href="#hra">Hra</a>.</p>` : ""}${kMuze(K) ? kLvupHtml(K) + (KUPRO.has(K.id) ? kUprHtml(K) : "") : ""}`;
  return `<div class="bdm kdb bhkb${kMuze(K) ? "" : " kro"}${nes ? " bdmnesch" : ""}" data-kid="${besc(K.id)}">${head}${hlH}${upr}${lep}<div class="bdmbody" data-bdmsw="${besc(key)}">${body}</div>${konec}<button type="button" class="bdmd20" data-bdmsh="kost" aria-expanded="${shOpen === "kost"}" aria-label="Hod kostkou" ${btip("Hod kostkou: vlastní výraz se Závojem, výhoda a nevýhoda")}>${bdmIc("d20")}</button>${list}</div>`;
}
/* jediná karta postavy (2026-10-18): stejná na stránce Karty, Hra i v Boji; mimo boj se životy a stavy zapisují rovnou do karty */
function kartaJednaHtml(K) {
  kModsSync(K);
  return bojDbm(null, {id: "_" + K.id, n: K.n}, K, false, true, {boj: false, karta: true});
}
const bdmPrekresli = () => {
  if (curView === "boj") renderBoj();
  else kartyPrekresli();
};
const bdmZavri = () => {
  if (!BDM.sheet) return;
  BDM.sheet = null;
  bdmPrekresli();
};
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s),
    root = T(".bdm");
  const kt = T("[data-bdmktab]");
  if (kt) {
    KTAB.set(kt.dataset.bdmktab);
  }
  if (!root) return;
  const key = root.dataset.kid,
    K = KARTBY[key];
  if (T("[data-bdmzav]")) {
    bdmZavri();
    return;
  }
  if (
    BDM.sheet &&
    T('[data-bdmlist] [data-kodp="d"],[data-bdmlist] [data-juposl]') &&
    !T(".bphodp [data-juposl]") /* útok zbraní: list zůstane otevřený kvůli odpovědi vypravěče a dalšímu útoku */
  ) {
    BDM.sheet = null;
    setTimeout(bdmPrekresli, 0);
    return;
  }
  if (BDM.sheet && BDM.sheet.t === "sprava" && T("[data-bdmlist] button:not(.bdmlx),[data-bdmlist] a")) {
    BDM.sheet = null;
    setTimeout(bdmPrekresli, 0);
  }
  const sh = T("[data-bdmsh]");
  if (sh) {
    const t = sh.dataset.bdmsh;
    if (BDM.sheet && BDM.sheet.k === key && BDM.sheet.t === t && t !== "utok" && (t !== "vec" || BDM.sheet.i === +sh.dataset.i)) {
      bdmZavri();
      return;
    }
    BDM.sheet = {k: key, t};
    if (t === "zvl") BDM.sheet.w = sh.dataset.zvl;
    if (t === "vec") BDM.sheet.i = +sh.dataset.i;
    if (t === "utok") {
      const j = sh.dataset.j,
        ks = sh.dataset.ks;
      if (j != null) {
        BDM.sheet.j = +j;
        if (GMV) {
          const hc = sh.closest("[data-bhcard]"),
            G = hc && BGMU[hc.dataset.bhcard];
          if (G) G.adv = 0;
        }
        if (!GMV) {
          const s0 = BOJ.s || {},
            me = (s0.hraci || []).find(x => x.n === bojJa.get()),
            w = me && bojZbrVse(s0, me)[+j];
          if (w) {
            BJU.ks = null;
            BJU.plos = false;
            BJU.adv = "0";
            BJU.zi = String(j);
            BJU.t = w.t || BJU.t;
            BJU.drt = !!w.drt;
            BJU.pru = !!w.pru;
            BJU.dal = !!w.dal;
          }
        }
      }
      if (ks != null) {
        BDM.sheet.ks = +ks;
        bojJaZvolKouzlo(+ks);
      }
    }
    bdmPrekresli();
    if (t === "hp")
      setTimeout(() => {
        const i = document.querySelector(".bdmlist .bdmhpz input");
        if (i) i.focus();
      }, 40);
    return;
  }
  if (T("[data-bdmhl]")) {
    if (BDM.hlo.has(key)) BDM.hlo.delete(key);
    else BDM.hlo.add(key);
    bdmPrekresli();
    return;
  }
  const sc = T("[data-bdmsec]");
  if (sc) {
    e.preventDefault();
    BDM.sheet = null;
    BDM.sec[key] = sc.dataset.bdmsec;
    bdmSecUloz();
    bdmPrekresli();
    const r = document.querySelector(`.bdm[data-kid="${CSS.escape(key)}"] .bdmlep`);
    if (r && r.getBoundingClientRect().top < 0) r.scrollIntoView({block: "start"});
    return;
  }
  const af = T("[data-bdmaf]");
  if (af) {
    /* zobrazená pod-karta s přepínačem použito/volná: obslouží ji data-btp / data-bhrk / data-break, tady se jen nepřekresluje */
    if (af.dataset.bdmaf === (BDM.af[key] || "A") && (af.dataset.btp || af.dataset.bhrk != null || af.dataset.break)) return;
    BDM.af[key] = af.dataset.bdmaf;
    bdmPrekresli();
    return;
  }
  const ux = T("[data-bdmutx]");
  if (ux && !T(".bdmruk")) {
    const k = key + "|" + ux.dataset.bdmutx;
    if (BDM.utx.has(k)) BDM.utx.delete(k);
    else BDM.utx.add(k);
    bdmPrekresli();
    return;
  }
  const kf = T("[data-bdmkf]");
  if (kf) {
    const v = kf.dataset.bdmkf;
    BDM.kf[key] = BDM.kf[key] === v ? "all" : v;
    bdmPrekresli();
    return;
  }
  if (T("[data-bdmins]") && K) {
    if (!kMuze(K)) return;
    kartaStavZmen(K.id, {insp: !kartaStav(K.id).insp || null}, `${K.n}: hrdinská inspirace ${kartaStav(K.id).insp ? "utracena" : "získána"}.`);
    return;
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && BDM.sheet) bdmZavri();
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-bdmadv]")) {
    KADV = +t.dataset.bdmadv;
  }
});
/* přejetí prstem: po těle karty další / předchozí záložka, po hlavě listu dolů zavře list */
const BDMSW = {};
document.addEventListener(
  "touchstart",
  e => {
    const t = e.touches[0];
    if (e.touches.length !== 1) return;
    const lh = e.target.closest && e.target.closest("[data-bdmlh]");
    if (lh) {
      BDMSW.l = 1;
      BDMSW.y = t.clientY;
      BDMSW.k = null;
      return;
    }
    const b = e.target.closest && e.target.closest("[data-bdmsw]");
    if (!b || e.target.closest("input,select,textarea,.bsloty,.bdmchips")) return;
    BDMSW.l = 0;
    BDMSW.k = b.dataset.bdmsw;
    BDMSW.x = t.clientX;
    BDMSW.y = t.clientY;
  },
  {passive: true},
);
document.addEventListener(
  "touchend",
  e => {
    const t = e.changedTouches[0];
    if (BDMSW.l) {
      BDMSW.l = 0;
      if (t.clientY - BDMSW.y > 60) bdmZavri();
      return;
    }
    if (!BDMSW.k) return;
    const k = BDMSW.k,
      dx = t.clientX - BDMSW.x,
      dy = t.clientY - BDMSW.y;
    BDMSW.k = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 45) return;
    const K = KARTBY[k];
    if (!K) return;
    const L = bdmSekce(K).map(x => x[0]),
      i = Math.max(0, L.indexOf(BDM.sec[k] || "akce")),
      n = L[(i + (dx < 0 ? 1 : -1) + L.length) % L.length];
    BDM.sec[k] = n;
    bdmSecUloz();
    bdmPrekresli();
  },
  {passive: true},
);
/* zúžená hlavička: když hlavička karty odjede pod lepkavé lišty, přilepí se jméno, AC a životy se záložkami */
function bdmLepky() {
  const o = curView === "boj" ? document.querySelector("#bojview .bosa") : null,
    nh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navh")) || 0,
    top = o && getComputedStyle(o).position === "sticky" ? Math.max(nh, o.getBoundingClientRect().bottom) : nh;
  document.documentElement.style.setProperty("--bdmtop", Math.round(top) + "px");
  document.querySelectorAll(".bdm").forEach(c => {
    const hd = c.querySelector(".bdmh");
    if (hd) c.classList.toggle("bdmsm", hd.getBoundingClientRect().bottom < top + 4);
  });
}
addEventListener(
  "scroll",
  () => {
    if (!BDMSW.r) {
      BDMSW.r = 1;
      requestAnimationFrame(() => {
        BDMSW.r = 0;
        bdmLepky();
      });
    }
  },
  {passive: true},
);
/* z hlavní karty do Boje: otevře bojovou kartu této postavy */
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest("[data-bdmgo]");
  if (!a) return;
  BDM.fokus = a.dataset.bdmgo;
});
