/* ===== Boj: herní záznam ve třetím sloupci (2026-10-18) – KDO · CO · KOMU, hozené kostky s výsledky a kostka Závoje =====
   Zdroje: vypravěč – záznam boje (BLOGG: hody nepřátel, vyhodnocení útoků hráčů, životy) a hody z karet (HODY);
   hráč – veřejný záznam boje (s.zaz) a hody z karet. Útok hráče z telefonu je v hodech z karet (kostky, Závoj, zranění)
   i ve vyhodnocení vypravěče (zásah, vedle) – záznam je spojí do jednoho řádku. Volba u Pokušení (přijato / odmítnuto)
   se připíše k hodu, ke kterému patří. Hráč u nepřátel vidí jen výsledek: nikdy jejich kostky, Závoj, AC ani životy. */
const BZ_OKNO = 10 * 60 * 1000;
/* sbalené řádky (2026-10-21): nejnovější záznam je vždy rozbalený, starší ukazují jen hlavičku (kdo · co → komu, výsledek
   ikonkou, zranění, ikonka Závoje). Klepnutí na řádek (2026-10-25, Vojta) otevře okno s podrobným rozborem (bzDetailHtml) –
   vykreslené řádky si pamatujeme podle klíče (BZMAP), aby okno ukázalo přesně to, co řádek */
const bzKlic = e => `${e.src}:${e.tg || e.t}:${e.A ? e.A.n : ""}:${e.co}`;
const BZMAP = new Map();
function bzPamatuj(k, e, gm) {
  BZMAP.delete(k);
  BZMAP.set(k, {e, gm});
  if (BZMAP.size > 600) BZMAP.delete(BZMAP.keys().next().value);
}
/* okno s podrobnostmi řádku: kdo · co → komu, kolo a čas, výsledek slovy, zranění s typem, každý hod s kostkami, Závoj, poznámky.
   Ukazuje jen to, co řádek už nese (hráč u nepřátel dál vidí jen výsledek) */
function bzDetailHtml(e, gm, kl) {
  const os = q => (q && q.n ? `<span class="bzdos"><b>${besc(q.n)}</b></span>` : "");
  const vel = s =>
      String(s || "")
        .charAt(0)
        .toUpperCase() + String(s || "").slice(1),
    D = [];
  if (e.vys) D.push(["Výsledek", `<span class="bzdvys ${e.vys[1] || ""}">${besc(vel(e.vys[0]))}</span>`]);
  if (e.zr && e.zr.t != null)
    D.push([
      e.zr.lec ? "Léčení" : "Zranění",
      `<b class="bztot">${e.zr.t}</b>${e.zr.zt ? ` ${besc(bojZrCz(e.zr.zt))}` : ""}${e.vys && e.vys[1] === "bzmis" ? " <small>(útok minul – nezapočítává se)</small>" : ""}`,
    ]);
  e.rows.forEach(r => D.push([vel(r.l) || "Hod", r.h]));
  const z = e.zav;
  if (z && (z.d || z.r))
    D.push([
      "Závoj",
      `${z.d ? `kostka ${z.d} – ` : ""}${z.r === "pok" ? "Pokušení" : z.r === "poz" ? "Požehnání" : "bez vlivu"}${z.vol ? `: ${besc(z.vol)}` : ""}${z.txt ? `<br><small>${besc(z.txt)}</small>` : ""}`,
    ]);
  if (e.pozn.length) D.push(["Poznámky", e.pozn.map(besc).join("<br>")]);
  let cas = "";
  try {
    cas = e.t ? new Date(e.t).toLocaleTimeString("cs-CZ", {hour: "2-digit", minute: "2-digit", second: "2-digit"}) : "";
  } catch (x) {}
  const meta = [e.k != null ? `${e.k}. kolo` : "", cas, e.skryty ? "skrytý hod – vidí jen vypravěč" : "", e.undone ? "vráceno" : ""]
    .filter(Boolean)
    .join(" · ");
  return `<div class="bzdet${gm ? " bzdetgm" : ""}"><h3 class="bzdhl">${os(e.A)}<span class="bzdco">${besc(e.co || "Záznam")}</span>${e.C ? `<i class="bzdsip" aria-label="vůči">→</i>${os(e.C)}` : ""}</h3>${meta ? `<p class="bzdmeta">${meta}</p>` : ""}${
    D.length ? `<dl class="bzdl2">${D.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>` : `<p class="rsmall">Bez dalších podrobností.</p>`
  }${gm && GMV && kl && BOJ.s ? `<p class="bzdupr"><button type="button" class="gbtn ghost" data-bzupr="${besc(kl)}" ${btip("Opravit cíl, hod, výsledek, zranění nebo typ zranění – hráči uvidí opravený řádek")}>✎ Upravit záznam</button></p>` : ""}</div>`;
}
document.addEventListener("click", e => {
  const h = e.target.closest && e.target.closest("[data-bzdet]");
  if (!h || e.target.closest("button,a,input,select")) return;
  const x = BZMAP.get(h.dataset.bzdet);
  if (x) mmPop(bzDetailHtml(x.e, x.gm, h.dataset.bzdet));
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const h = e.target.closest && e.target.closest("[data-bzdet]");
  const x = h && e.target === h && BZMAP.get(h.dataset.bzdet);
  if (!x) return;
  e.preventDefault();
  mmPop(bzDetailHtml(x.e, x.gm, h.dataset.bzdet));
});
/* ===== úprava řádku vypravěčem (2026-10-28, Vojta): cíl, hod, výsledek, zranění a typ zranění =====
   Úprava se neprovádí v původních datech řádku, ale jako oprava U = {ci, c, hod, vys, zr, zt, pozn} vedle nich: u veřejného
   záznamu boje v z.upr (vidí ji i hráči), u záznamu vypravěče v BLOGG o.upr (a v odpovídajícím veřejném řádku), u hodu z karty
   v s.hupr[id hodu]. Řádek ji použije při sestavení (bzUprAplikuj) – původní kostky zůstanou v podrobnostech. Životy cíle
   může oprava srovnat o rozdíl zranění (bzHpOprav). */
const BZUPRV = {zasah: ["zásah", "bzhit"], krit: ["kritický zásah", "bzkr"], vedle: ["vedle", "bzmis"]};
function bzUprAplikuj(e, U, s, gm) {
  if (!e || !U) return e;
  if ("ci" in U) e.C = U.ci ? bzOs(s, U.ci, U.c) || (U.c ? {n: U.c} : null) : null;
  if (U.hod != null) {
    if (gm || !bzNepr(s, e.A)) {
      const i = e.rows.findIndex(r => r.l === "útok" || r.l === "hod");
      const r = {l: i >= 0 ? e.rows[i].l : "útok", h: `<b class="bztot">${U.hod}</b> <small>upraveno</small>`};
      if (i >= 0) e.rows.splice(i, 1, r);
      else e.rows.unshift(r);
    }
    if (!U.vys && e.vys && e.vys[1] === "bztotv") e.vys = [String(U.hod), "bztotv"];
  }
  if (U.vys) e.vys = BZUPRV[U.vys] || [String(U.vys), /vedle/.test(U.vys) ? "bzmis" : /krit/.test(U.vys) ? "bzkr" : ""];
  if ("zr" in U) {
    e.rows = e.rows.filter(r => r.l !== "zranění");
    e.zr = U.zr == null ? null : {t: U.zr, zt: U.zt != null ? U.zt : (e.zr && e.zr.zt) || "", lec: !!(e.zr && e.zr.lec)};
  } else if (U.zt != null && e.zr) e.zr = Object.assign({}, e.zr, {zt: U.zt});
  e.pozn = [...e.pozn, `upraveno vypravěčem${U.pozn ? ": " + U.pozn : ""}`];
  e.upr = U;
  return e;
}
/* oprava, která na řádku už je (pro sloučení s novou) */
function bzUprStara(e) {
  if (e.src === "g") return (BLOGG[e.i] && BLOGG[e.i].o.upr) || null;
  if (e.src === "z") return (e.z && e.z.upr) || null;
  if (e.src === "h") return ((BOJ.s || {}).hupr || {})[e.h && e.h.id] || null;
  return null;
}
/* zápis opravy do stavu boje z (uvnitř bojZmen): veřejný řádek podle času, útočníka a cíle; hod z karty podle id */
function bzUprZapis(z, ref, U) {
  if (ref.src === "h") {
    if (!ref.hid) return false;
    const H = Object.assign({}, z.hupr || {}, {[ref.hid]: U}),
      k = Object.keys(H);
    k.slice(0, Math.max(0, k.length - 80)).forEach(x => delete H[x]);
    z.hupr = H;
    return true;
  }
  const okno = ref.src === "z" ? 1 : 6000;
  const q = (z.zaz || [])
    .filter(
      x =>
        Math.abs((x.ts || 0) - ref.t) <= okno &&
        (!ref.cid || x.ci === ref.cid || (!x.ci && x.c === ref.cn)) &&
        (!ref.aid || x.ai === ref.aid || (!x.ai && x.a === ref.an)),
    )
    .sort((a, b) => Math.abs(a.ts - ref.t) - Math.abs(b.ts - ref.t))[0];
  if (!q) return false;
  q.upr = U;
  return true;
}
/* životy cíle o rozdíl d (kladné = víc zranění, záporné = vrátit); nepřítel v paměti vypravěče, postava na kartě; houf ne */
function bzHpOprav(s, id, d) {
  d = Math.round(+d || 0);
  const c = id && d ? bojCilO(s, id) : null;
  if (!c) return "";
  if (!c.druh) {
    const K = bojKartaH(c);
    if (!K) return "";
    let t = "";
    bojPCZmena(
      id,
      o => {
        const cur = hpO(o, K),
          mx = kHPmax(K),
          n = Math.max(-mx, Math.min(mx, cur - d));
        o.hp = n;
        t = `${c.n}: ${cur} → ${n} HP`;
        return `oprava záznamu: ${cur} → ${n} HP`;
      },
      false,
    );
    return t;
  }
  if (c.druh === "houf") return "";
  const E = bojEff(c);
  if (!E || !E.hp.length) return "";
  const hp = bojHp.get(),
    a = hp[id] || [],
    mx = E.hp[0].max,
    old = a[0] != null ? a[0] : mx,
    nov = Math.min(mx, old - d);
  a[0] = nov;
  hp[id] = a;
  bojHp.set(hp);
  if (d > 0) bojHpZmena(id, 0, old, nov);
  bojLog(id, {n: "Oprava životů", ai: null, ci: id, zt: `${old} → ${nov} HP (oprava záznamu)`}, c.n);
  return `${c.n}: ${old} → ${nov} HP`;
}
/* původní hod a výsledek řádku (předvyplnění formuláře) */
const bzUprHod0 = e => {
  const r = e.rows.find(q => q.l === "útok" || q.l === "hod"),
    m = r && String(r.h).match(/class="bztot">(-?\d+)</);
  return m ? +m[1] : e.vys && e.vys[1] === "bztotv" ? +e.vys[0] : null;
};
const bzUprVys0 = e =>
  !e.vys
    ? ""
    : e.vys[1] === "bzkr"
      ? "krit"
      : e.vys[1] === "bzmis" && /^vedle$/.test(e.vys[0])
        ? "vedle"
        : e.vys[1] === "bzhit" && /^zásah$/.test(e.vys[0])
          ? "zasah"
          : "jine";
function bzUprHtml(kl, e, s) {
  const ci = (e.C && e.C.id) || "",
    v0 = bzUprVys0(e),
    h0 = bzUprHod0(e),
    zr = e.zr && e.zr.t != null ? e.zr.t : "",
    zt = (e.zr && e.zr.zt) || "",
    lid = [...(s.hraci || []), ...(s.npc || [])].filter(o => o && o.id);
  const sel = (a, b) => (a === b ? " selected" : "");
  const hpOk = e.src !== "h" && !(e.zr && e.zr.lec);
  return `<form class="bzupr" data-bzuprf="${besc(kl)}"><h3 class="bzdhl">Upravit záznam</h3><p class="bzdmeta">${besc([e.A && e.A.n, e.co].filter(Boolean).join(" · ") || "Záznam")}</p>
    <label>Cíl <select name="ci"><option value="">– bez cíle –</option>${lid.map(o => `<option value="${besc(o.id)}"${sel(o.id, ci)}>${besc(o.n)}${o.druh ? "" : " (družina)"}</option>`).join("")}${ci && !lid.some(o => o.id === ci) ? `<option value="${besc(ci)}" selected>${besc(e.C.n)}</option>` : ""}</select></label>
    <label>Hod (součet) <input name="hod" type="number" inputmode="numeric" min="-20" max="99" value="${h0 != null ? h0 : ""}"></label>
    <label>Výsledek <select name="vys"><option value=""${sel(v0, "")}>–</option><option value="zasah"${sel(v0, "zasah")}>zásah</option><option value="krit"${sel(v0, "krit")}>kritický zásah</option><option value="vedle"${sel(v0, "vedle")}>vedle</option><option value="jine"${sel(v0, "jine")}>jiný (text)</option></select></label>
    <label>Vlastní výsledek <input name="vyst" type="text" maxlength="60" value="${v0 === "jine" ? besc(e.vys[0]) : ""}" placeholder="např. uspěl, SO 14, +5 HP"></label>
    <label>Zranění <input name="zr" type="number" inputmode="numeric" min="0" max="999" value="${zr}" placeholder="žádné"></label>
    <label>Typ zranění <select name="zt"><option value="">–</option>${Object.keys(BZRT)
      .map(t => `<option value="${t}"${sel(t, zt)}>${besc(bojZrCz(t))}</option>`)
      .join("")}</select></label>
    <label class="bzuprw">Poznámka <input name="pozn" type="text" maxlength="120" placeholder="proč se oprava dělá (nepovinné)"></label>
    ${hpOk ? `<label class="bzuprw bzuprck"><input type="checkbox" name="hp" value="1" checked> Opravit i životy cíle o rozdíl zranění (při změně cíle vrátit starému a dát novému)</label>` : `<p class="rsmall bzuprw">Hod z karty: životy se neopravují (zranění z něj nikdo neodečetl).</p>`}
    <p class="bzuprw bzuprbt"><button type="submit" class="gbtn">Uložit opravu</button> <button type="button" class="gbtn ghost" data-mmpopx>Zrušit</button></p></form>`;
}
/* uložení opravy: f = hodnoty formuláře {ci, hod, vys, vyst, zr, zt, pozn, hp} */
function bzUprUloz(kl, f) {
  const x = BZMAP.get(kl),
    s = BOJ.s;
  if (!x || !s || !GMV) return null;
  const e = x.e,
    num = v => (v === "" || v == null || isNaN(+v) ? null : Math.round(+v)),
    U = {};
  const ci0 = (e.C && e.C.id) || "",
    ci = String(f.ci || "");
  if (ci !== ci0) {
    const c = bojCilO(s, ci);
    U.ci = ci;
    U.c = c ? c.n : "";
  }
  const hod = num(f.hod);
  if (hod != null && hod !== bzUprHod0(e)) U.hod = hod;
  const vys =
    f.vys === "jine"
      ? String(f.vyst || "")
          .trim()
          .slice(0, 60)
      : String(f.vys || "");
  if (vys && vys !== bzUprVys0(e) && !(f.vys === "jine" && e.vys && vys === e.vys[0])) U.vys = vys;
  const zr0 = e.zr && e.zr.t != null ? +e.zr.t : null,
    zr = num(f.zr);
  if (zr !== zr0) U.zr = zr == null ? null : Math.max(0, zr);
  const zt = String(f.zt || "");
  if (zt !== ((e.zr && e.zr.zt) || "") && (zr != null || zr0 != null)) U.zt = zt;
  const pozn = String(f.pozn || "")
    .trim()
    .slice(0, 120);
  if (pozn) U.pozn = pozn;
  if (!Object.keys(U).length) return {nic: 1};
  const M = Object.assign({}, bzUprStara(e) || {}, U),
    ref = {src: e.src, t: e.t, aid: e.A && e.A.id, an: e.A && e.A.n, cid: ci0, cn: e.C && e.C.n, hid: e.h && e.h.id};
  if (e.src === "g" && BLOGG[e.i]) {
    BLOGG[e.i].o.upr = M;
    bojLogUloz();
  }
  /* životy: rozdíl zranění, které řádek započítal (zásah), a opraveného; při změně cíle vrátit starému a dát novému */
  const hp = [];
  if (f.hp && e.src !== "h" && !(e.zr && e.zr.lec)) {
    const hit0 = !(e.vys && e.vys[1] === "bzmis"),
      a0 = hit0 && zr0 ? zr0 : 0,
      hit1 = U.vys ? !/vedle/.test(U.vys) : hit0,
      z1 = "zr" in U ? U.zr || 0 : zr0 || 0,
      a1 = hit1 ? z1 : 0,
      c1 = "ci" in U ? U.ci : ci0;
    if (c1 === ci0) hp.push(bzHpOprav(s, ci0, a1 - a0));
    else hp.push(bzHpOprav(s, ci0, -a0), bzHpOprav(s, c1, a1));
  }
  bojZmen(z => {
    bzUprZapis(z, ref, M);
  });
  return {U: M, hp: hp.filter(Boolean)};
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bzupr]");
  if (!b || !GMV || !BOJ.s) return;
  const x = BZMAP.get(b.dataset.bzupr);
  if (x) mmPop(bzUprHtml(b.dataset.bzupr, x.e, BOJ.s));
});
document.addEventListener("submit", e => {
  const f = e.target.closest && e.target.closest("form[data-bzuprf]");
  if (!f) return;
  e.preventDefault();
  const r = bzUprUloz(f.dataset.bzuprf, Object.fromEntries(new FormData(f)));
  mmPopX();
  if (!r) return;
  if (!r.nic) mmHlasG(`Záznam upraven${r.hp.length ? ` · ${r.hp.join(" · ")}` : ""}.`, 5000);
  bojPrekresli();
});
/* výsledek útoku jako ikonka: hvězda = zásah, X = vedle, v prstenci = přirozená 20 / 1; text zůstává v popisku */
const BZVYS = {bzhit: "zasah", bzkr: "zasahkrit", bzmis: "vedle"};
/* zbraň / kouzlo podle názvu útoku → ikonka (2026-10-21): v hlavičce místo textu, celý název zůstává v popisku.
   Kouzlo: hod „Útok kouzlem“, známé kouzlo (kSp) nebo kouzlo s vlastní značkou (KZIK); zbraň podle klíčových slov názvu
   (česky i anglicky, včetně útoků nestvůr: drápy, kousnutí…); nic z toho → text jako dřív */
const BZZBR = [
  ["kuse", /kuš|crossbow|samostříl/i],
  ["luk", /\bluk|\bbow\b|longbow|shortbow|šíp/i],
  ["pistal", /píšťal|hákovnic|handgun|mušket|pistol|arkebuz|ručnic|tarasnic|\bgun\b|firearm/i],
  ["prak", /\bprak|sling|vrhací|\bdart|foukačk|blowgun|kámen|kamen/i],
  ["sekera", /seker|sekyr|\baxe/i],
  ["kopi", /kopí|spear|píka|\bpike|halapartn|halberd|glejv|glaive|oštěp|javelin|trojzub|trident|sudlic|lance|kůs/i],
  ["palcat", /kladiv|hammer|maul|palcát|\bmace|\bkyj|club|řemdih|flail|jitřenk|morningstar|\bhůl|staff|\bcep\b/i],
  ["mec", /meč|sword|rapír|rapier|šamšír|scimitar|dýk|dagger|šavl|sabre|tesák/i],
  ["drap", /dráp|claw|kousnut|\bbite|fang|ocas|\btail|\broh|horn|pěst|fist|úder|slam|křídl|žihadl|sting|chapadl|kopyt/i],
];
function bzZbrIk(e) {
  const n = String(e.co || "").replace(/^Útok( kouzlem)? – /, "");
  if (!n) return "";
  if (e.kouzlo || (typeof KZIK !== "undefined" && KZIK[n]) || (typeof kSp === "function" && kSp(n)))
    return (typeof KZIK !== "undefined" && KZIK[n]) || "kouzlo";
  const z = BZZBR.find(([, re]) => re.test(n));
  return z ? z[0] : "";
}
/* jedna kostka: d20 s přirozenou 20 / 1 zvýrazněnou, zahozená kostka (výhoda, nevýhoda) přeškrtnutá, kostka Závoje vínová */
const bzK = (s, v, c) =>
  `<span class="bzk bzk${s === 20 ? "20" : s === 6 && c && c.includes("bzkz") ? "z" : ""}${s === 20 && +v === 20 ? " bzkmax" : s === 20 && +v === 1 ? " bzkmin" : ""}${c ? " " + c : ""}" role="img" aria-label="k${s}: ${besc(v)}${c && c.includes("bzkx") ? " (nepočítá se)" : ""}">${besc(v)}</span>`;
const bzSk = (n, s, vals) =>
  `<span class="bzkg"><small>${n}k${s}</small>${vals
    .map(v => {
      const x = String(v).trim(),
        dr = x.startsWith("~");
      return bzK(+s, dr ? x.slice(1) : x, dr ? "bzkx" : "");
    })
    .join("")}</span>`;
/* text hodu („d20 14 / 8 (výhoda) +5 = 19“, „1d8 [6] + 3“, „2d6(4+6)+3“) → kostky jako žetony, součet tučně */
function bzTxt(t) {
  let h = besc(String(t || ""));
  h = h.replace(/\bd20 (\d+)( \(ručně\))?(?:\s*\/\s*(\d+)(?: \((výhoda|nevýhoda)\))?)?/g, (m, a, ru, b, adv) => {
    a = +a;
    if (b == null) return `<span class="bzkg">${bzK(20, a)}${ru ? "<small>ručně</small>" : ""}</span>`;
    b = +b;
    const k = adv === "výhoda" ? (a >= b ? 0 : 1) : adv === "nevýhoda" ? (a <= b ? 0 : 1) : -1;
    return `<span class="bzkg">${bzK(20, a, k === 1 ? "bzkx" : "")}${bzK(20, b, k === 0 ? "bzkx" : "")}${adv ? `<small>${adv}</small>` : ""}</span>`;
  });
  h = h.replace(/(\d+)d(\d+)(?:k[hl]\d+)? \[([^\]]+)\]/g, (m, n, s, v) => bzSk(n, s, v.split(/,\s*/)));
  h = h.replace(/(\d*)d(\d+)\((\d+(?:\+\d+)*)\)/g, (m, n, s, v) => bzSk(n || 1, s, v.split("+")));
  return h.replace(/= (−?-?\d+)/g, '= <b class="bztot">$1</b>');
}
const bzMaKostky = t => /\bd20 \d|\d+d\d+(?:k[hl]\d+)? \[|\d*d\d+\(\d/.test(String(t || ""));
const bzCas = t => {
  try {
    return new Date(t).toLocaleTimeString("cs-CZ", {hour: "2-digit", minute: "2-digit"});
  } catch (e) {
    return "";
  }
};
/* osoba v záznamu: postava podle id nebo jména, jinak jen jméno */
function bzOs(s, id, n) {
  const o = id ? bojCilO(s, id) : null;
  if (o) return {id: o.id, o, n: o.n};
  const h = n ? (s.hraci || []).find(x => x.n === n) || (s.npc || []).find(x => x.n === n) : null;
  return h ? {id: h.id, o: h, n: h.n} : n ? {n} : null;
}
const bzNepr = (s, q) => !!(q && q.o && q.o.druh && !bojSpoj(q.o));
const bzZav = (d, r, txt) => (d ? {d: +d, r: r === "0" ? "" : r || (+d <= 2 ? "pok" : +d >= 5 ? "poz" : ""), txt: txt || ""} : null);
/* --- záznam vypravěče (BLOGG) → řádek --- */
function bzZBlogg(s, x, i) {
  const o = x.o,
    A0 = o.ai !== undefined ? (o.ai ? bzOs(s, o.ai, o.an) : null) : bzOs(s, x.id, x.kdo);
  let C = o.ci || o.cn || o.cil ? bzOs(s, o.ci, o.cn || o.cil) : null,
    A = A0;
  if (!A && C) {
    A = C;
    C = null;
  }
  if (A && C && A.id && A.id === C.id) C = null;
  const e = {
    t: o.t || 0,
    tg: o.t || 0,
    k: o.k,
    A,
    C,
    co: (o.n || "") + (o.un ? ` (${o.un})` : ""),
    rows: [],
    pozn: [],
    src: "g",
    i,
    undone: !!o.undone,
  };
  if (o.pre && !o.undone)
    e.und = `<button type="button" class="blund" data-blzpet="${i}" ${btip("Vrátit boj do stavu před tímto krokem (i všechno pozdější): pořadí a stavy, životy nepřátel i karty postav")}>↶</button>`;
  else if (o.und && !o.undone && !(BHIST.length && BHIST[0].t < (o.t || 0) - 30))
    e.und = `<button type="button" class="blund" data-blund="${i}" ${btip(o.und.poc ? "Vrátit padlé pacholky do houfu" : `Vrátit životy ${o.und.nov} → ${o.und.old}`)}>↶</button>`;
  const h = o.hod;
  if (h) {
    const dd = h.dd || [h.d],
      k = dd.length > 1 ? (h.adv > 0 ? (dd[0] >= dd[1] ? 0 : 1) : dd[0] <= dd[1] ? 0 : 1) : 0,
      zb = h.b - (h.pres || 0);
    e.rows.push({
      l: "útok",
      h: `<span class="bzkg">${dd.map((v, j) => bzK(20, v, dd.length > 1 && j !== k ? "bzkx" : "")).join("")}${dd.length > 1 ? `<small>${h.adv > 0 ? "výhoda" : "nevýhoda"}</small>` : ""}</span> ${bsg(zb)}${h.pres ? ` <small>přesila</small> +${h.pres}` : ""} = <b class="bztot">${h.tot}</b>${o.pcAC != null ? ` <small>proti AC ${o.pcAC}</small>` : ""}`,
    });
    if (h.advWhy) e.pozn.push(`${h.adv > 0 ? "výhoda" : "nevýhoda"}: ${h.advWhy}`);
    if (h.kryt) e.pozn.push(`cíl za ${h.kryt === 5 ? "tříčtvrtečním" : "polovičním"} krytem (AC +${h.kryt})`);
    e.vys = h.krit
      ? ["kritický zásah", "bzkr"]
      : h.mis
        ? ["vedle – přirozená 1", "bzmis"]
        : o.pcAC != null
          ? o.pcHit
            ? ["zásah", "bzhit"]
            : ["vedle", "bzmis"]
          : null;
  } else if (o.dc) e.vys = [`${String(o.dc)}`, "bzdc"];
  if (o.res && !e.vys) e.vys = o.res === "krit" ? ["kritický zásah", "bzkr"] : o.res === "vedle" ? ["vedle", "bzmis"] : ["zásah", "bzhit"];
  if (o.sav) e.pozn.push(o.sav);
  const U = o.uh,
    D = U && U.det;
  if (D) {
    const dd = D.d2 != null && D.v ? [D.d1, D.d2] : [D.d1 != null ? D.d1 : U.d],
      k = dd.length > 1 ? (D.v > 0 ? (dd[0] >= dd[1] ? 0 : 1) : dd[0] <= dd[1] ? 0 : 1) : 0;
    e.rows.push({
      l: "útok",
      h: `<span class="bzkg">${dd.map((v, j) => bzK(20, v, dd.length > 1 && j !== k ? "bzkx" : "")).join("")}</span> ${bsg(D.b != null ? D.b : U.hod - (U.d || 0))} = <b class="bztot">${U.hod}</b>`,
    });
    if (D.zx) e.rows.push({l: "zranění", h: `${bzTxt(D.zx)} = <b class="bztot">${U.dmg}</b>`});
    if (D.zav) e.zav = bzZav(D.zav.d, D.zav.r);
  } else if (U && U.hod != null && !U.det)
    e.rows.push({
      l: "útok",
      h: `${U.d ? `<span class="bzkg">${bzK(20, U.d)}</span> ${bsg(U.hod - U.d)} = ` : ""}<b class="bztot">${U.hod}</b>${U.adv ? ` <small>${U.adv > 0 ? "výhoda" : "nevýhoda"}</small>` : ""}`,
      ut: 1,
    });
  if (o.zr) {
    e.zr = {t: o.zr.t, zt: o.zr.zt};
    const xx = String(o.zr.x || "");
    if (bzMaKostky(xx)) e.rows.push({l: "zranění", h: `${bzTxt(xx)} = <b class="bztot">${o.zr.t}</b>`});
    else if (xx) e.pozn.push(xx.replace(/^z (\d+)/, "hozeno $1"));
    if (o.zr.pol) e.pozn.push("při úspěšné záchraně obvykle polovina");
  }
  if (o.zt && !(o.zr && o.zr.zt === o.zt) && !U) {
    if (bzMaKostky(o.zt)) e.rows.push({l: "", h: bzTxt(o.zt)});
    else e.pozn.push(o.zt);
  }
  if (o.kon) e.pozn.push(o.kon);
  if (o.pcAuto) e.pozn.push("odečteno z karty: " + o.pcAuto);
  if (o.zav) e.zav = {d: o.zav.d, r: o.zav.r, txt: o.zav.txt || ""};
  if (o.zvk && !o.zvk.ok && typeof bojZvKomHtml === "function") e.rows.push({l: "", h: bojZvKomHtml(i, o.zvk)});
  return e;
}
/* --- hod z karty (HODY) → řádek; „Útok – Dlouhý meč → Rotmistr“: cíl za šipkou --- */
function bzZHod(s, h) {
  const m = String(h.co || "").match(/^(.*?)\s+→\s+(.+)$/),
    co = m ? m[1] : String(h.co || ""),
    C = m ? bzOs(s, null, m[2]) : null;
  const e = {
    t: Date.parse(h.cas) || 0,
    tg: GMV ? BHSEEN[h.id] || (BHSEEN[h.id] = Date.now()) : 0,
    A: bzOs(s, null, h.kdo),
    C,
    co,
    rows: [],
    pozn: [],
    src: "h",
    h,
    skryty: !!(h.skryty || h.taj),
    kouzlo: /^Útok kouzlem/.test(co),
  };
  String(h.txt || "")
    .split(" · ")
    .forEach(p => {
      p = p.trim();
      if (!p) return;
      if (bzMaKostky(p) || /=\s*-?\d+/.test(p)) {
        const zr = /^zranění\s+/i.test(p);
        e.rows.push({l: zr ? "zranění" : e.rows.length ? "" : /^Útok/.test(co) ? "útok" : "hod", h: bzTxt(zr ? p.replace(/^zranění\s+/i, "") : p)});
      } else if (!/^(kritický zásah|minutí)$/.test(p)) e.pozn.push(p);
    });
  if (h.krit) e.vys = ["kritický zásah", "bzkr"];
  else if (h.mis) e.vys = ["vedle – přirozená 1", "bzmis"];
  else if (h.tot != null && !/^(Zranění|Léčení)/.test(co)) e.vys = [String(h.tot), "bztotv"];
  if (h.tot != null && /^(Zranění|Léčení)/.test(co)) e.zr = {t: h.tot, zt: "", lec: /^Léčení/.test(co)};
  if (GMV && C && s && s.scena && typeof bzScPorovnej === "function") bzScPorovnej(e, s);
  if (h.zav) e.zav = bzZav(h.zav, h.zr);
  return e;
}
/* --- veřejný záznam boje (s.zaz) → řádek; hráč u nepřátel vidí jen výsledek --- */
function bzZZaz(s, z, gm) {
  const A = bzOs(s, z.ai, z.a),
    C = bzOs(s, z.ci, z.c),
    np = bzNepr(s, A);
  const e = {t: z.ts || 0, tg: z.ts || 0, k: z.k, A, C, co: z.cim || "", rows: [], pozn: [], src: "z", z};
  let v = String(z.v || "");
  if (np && !gm) v = v.replace(/\s*\(\d+\)/g, "").replace(/^útok \d+$/, "útok");
  if (v) e.vys = [v, /krit/.test(v) ? "bzkr" : /vedle/.test(v) ? "bzmis" : /zásah|padl|zasažen/.test(v) ? "bzhit" : ""];
  if (gm && z.hod != null) e.rows.push({l: "útok", h: `<b class="bztot">${z.hod}</b>${z.ac != null ? ` <small>proti AC ${z.ac}</small>` : ""}`});
  if (z.z > 0) e.zr = {t: z.z, zt: z.t || ""};
  if (z.ph != null && gm) e.pozn.push(`životy ${z.ph}`);
  if (z.zv) e.zav = {d: +z.zd || 0, r: z.zv, txt: ""}; /* Požehnání / Pokušení nepřítele: hráč vidí jen výsledek, co se stane, určí vypravěč */
  return e;
}
/* --- sestavení záznamu: zdroje, spojení útoku hráče s vyhodnocením, volba u Pokušení, kola --- */
function bzZaznam(s, gm) {
  const zac = s.zac || Math.min(...(s.zaz || []).map(z => z.ts || Infinity), ...BLOGG.map(x => x.o.t || Infinity), Date.now()) - 60000;
  const H = (HODY || []).filter(h => (Date.parse(h.cas) || 0) >= zac - 60000).map(h => bzZHod(s, h));
  let L = [];
  if (gm) {
    /* „Zranění“ zapsané automatickým odečtem z karty při útoku (pcAuto) jen opakuje řádek útoku – v záznamu se neukazuje;
       ruční změna životů (karta, panel účastníka, kouzlo) svůj řádek má dál */
    const auto = (o, i) =>
      o.n === "Zranění" &&
      o.ai === null &&
      BLOGG.some((y, j) => j !== i && y.o.pcAuto && y.o.pcId === o.ci && Math.abs((y.o.t || 0) - (o.t || 0)) < 4000);
    const G = BLOGG.map((x, i) => [x, i])
      .filter(([x, i]) => (x.o.t || 0) >= zac && !auto(x.o, i))
      .map(([x, i]) => bzZBlogg(s, x, i));
    const t0 = G.length ? Math.min(...G.map(e => e.t)) : Infinity;
    L = [...G, ...(s.zaz || []).filter(z => (z.ts || 0) < t0 - 1000).map(z => bzZZaz(s, z, gm))];
  } else L = (s.zaz || []).map(z => bzZZaz(s, z, gm));
  /* útok hráče: hod z telefonu (HODY „Útok – …“) + vyhodnocení (vypravěč: BLOGG s uh, hráč: zaz od postavy) */
  const vzaty = new Set(),
    utoky = H.filter(e => /^Útok/.test(e.co) && e.A);
  L.forEach(e => {
    const pc = e.A && e.A.o && !e.A.o.druh;
    if (!pc) return;
    const U = e.src === "g" ? BLOGG[e.i] && BLOGG[e.i].o.uh : null;
    if (e.src === "g" && (!U || U.det)) return;
    const cim = U ? U.cim : e.co,
      kand = utoky.filter(
        h =>
          !vzaty.has(h) &&
          h.A.n === e.A.n &&
          Math.abs(h.t - e.t) < BZ_OKNO &&
          (U ? h.h.tot === U.hod : e.z && e.z.hu != null ? h.h.tot === e.z.hu : true) &&
          (!cim || h.co.replace(/^Útok( kouzlem)? – /, "") === cim),
      );
    if (!kand.length) return;
    const h = kand.sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0];
    vzaty.add(h);
    e.rows = [
      ...h.rows,
      ...e.rows.filter(r => !r.ut && r.l !== "zranění"),
      ...e.rows.filter(r => r.l === "zranění" && !h.rows.some(q => q.l === "zranění")),
    ];
    if (!e.zav) e.zav = h.zav;
    if (h.kouzlo) e.kouzlo = true;
    e.pozn = [...h.pozn, ...e.pozn];
    if (!e.C && h.C) e.C = h.C;
  });
  L = [...L, ...H.filter(e => !vzaty.has(e))].sort((a, b) => b.t - a.t);
  /* hod zranění z karty (Karty postav) k útoku téže zbraně; volba u Pokušení k hodu, ke kterému patří */
  const pryc = new Set();
  L.forEach((e, j) => {
    if (e.src !== "h") return;
    const co = e.co;
    if (/^Zranění – /.test(co)) {
      const w = co.slice(10),
        u = L.slice(j + 1).find(
          q => q.src === "h" && q.A && e.A && q.A.n === e.A.n && q.co === `Útok – ${w}` && e.t - q.t < 180000 && !q.rows.some(r => r.l === "zranění"),
        );
      if (u) {
        e.rows.forEach(r => u.rows.push({l: "zranění", h: r.h}));
        u.zr = e.zr;
        pryc.add(e);
      }
    } else if (/^Pokušení (přijato|odmítnuto)/.test(co)) {
      const p = L.slice(j + 1).find(q => q.A && e.A && q.A.n === e.A.n && q.zav && q.zav.r === "pok" && !q.zav.vol && e.t - q.t < 15 * 60000);
      if (p) {
        const prij = /přijato/.test(co),
          dv = String(e.h.txt || "").replace(/^.*?:\s*/, "");
        p.zav.vol = prij ? `přijato – ${dv || "bod hříchu"}` : `odmítnuto – ${dv || "komplikace"}`;
        p.zav.prij = prij;
        pryc.add(e);
      }
    }
  });
  L = L.filter(e => !pryc.has(e));
  /* opravy vypravěče (bzUprAplikuj): až po spojení útoku s vyhodnocením, aby opravený hod nepřepsal hod z karty */
  L.forEach(e => {
    const U = e.src === "g" ? BLOGG[e.i] && BLOGG[e.i].o.upr : e.src === "z" ? e.z && e.z.upr : e.src === "h" ? (s.hupr || {})[e.h && e.h.id] : null;
    if (U) bzUprAplikuj(e, U, s, gm);
  });
  /* kola: hody z karet zdědí kolo z předchozího záznamu */
  let k0 = null;
  for (let j = L.length - 1; j >= 0; j--) {
    if (L[j].k != null) k0 = L[j].k;
    else L[j].k = k0 != null ? k0 : bojBezi(s) ? 1 : null;
  }
  return L.slice(0, 120);
}
function bzRadek(e, gm) {
  if (gm && e.tg && !e.undone && bojZaUnd(e.tg)) e.undone = true;
  if (gm && e.tg && !e.undone && !e.und && e.co !== "Vráceno")
    e.und = `<button type="button" class="blund" data-bzvrat="${e.tg}" data-p="${besc([e.A && e.A.n, e.co].filter(Boolean).join(" – "))}" ${btip("Vrátit boj do stavu před tímto řádkem (i všechno pozdější)")}>↶</button>`;
  const med = q => (q && q.o ? (q.o.druh ? bojMedN(q.o, "bmini") : bojMedH(q.o, "bmini")) : "");
  /* klepnutí na řádek otevře podrobnosti (bzDetailHtml), filtr „jen akce této postavy“ je jen na medailonu */
  const os = q =>
    q && q.n
      ? `<span class="bzos">${q.id && q.o ? `<button type="button" class="blfb" data-blf="${besc(q.id)}" ${btip("Jen akce: " + q.n)}>${med(q)}</button>` : med(q)}<b>${besc(q.n)}</b></span>`
      : "";
  const mis = e.vys && e.vys[1] === "bzmis";
  const zr =
    e.zr && e.zr.t != null
      ? `<span class="bzdmg${e.zr.lec ? " bzlec" : ""}${mis ? " bzdmgx" : ""}" ${btip(mis ? "Hozené zranění – útok minul" : e.zr.zt ? `${e.zr.lec ? "Léčení" : "Zranění"} ${e.zr.t} – ${bojZrCz(e.zr.zt)}` : e.zr.lec ? "Léčení" : "Zranění")}><b>${e.zr.lec ? "+" : ""}${e.zr.t}</b>${e.zr.zt ? bikZrTxt(e.zr.zt) : ""}</span>`
      : "";
  /* výsledek: zásah / vedle / kritický zásah ikonkou (text v popisku); „padl“ a jiné dodatky zůstávají jako text,
     záchrana (SO) a prostý součet hodu jako štítek */
  let vys = "";
  if (e.vys) {
    const [txt, cls] = e.vys,
      ik = BZVYS[cls];
    if (ik) {
      const fum = /přirozená 1/.test(txt),
        zb = txt
          .replace(/^(kritický zásah|zásah|vedle)(\s*\(\d+\))?/, "")
          .replace(/^[\s,–-]+/, "")
          .replace(/^přirozená 1$/, "");
      vys = `<span class="bzvys bzvi ${cls}${fum ? " bzfum" : ""}" role="img" ${btip(txt.charAt(0).toUpperCase() + txt.slice(1))}>${bi(fum ? "vedlekrit" : ik)}</span>${zb ? `<span class="bzvys bzvt ${cls}">${besc(zb)}</span>` : ""}`;
    } else vys = `<span class="bzvys ${cls}">${besc(txt)}</span>`;
  }
  /* životy po odečtu z karty (jen vypravěč): „43/62“ z poznámky „odečteno z karty“ */
  const hp = gm && e.pozn.map(p => String(p).match(/\((\d+)\/(\d+)\)/)).find(Boolean);
  const hph = hp ? `<small class="bzhp" ${btip(`Životy po zásahu: ${hp[1]} z ${hp[2]}`)}>${hp[1]}/${hp[2]}</small>` : "";
  /* Závoj: jen ikonka Požehnání / Pokušení (kostka a text z bestiáře v popisku); bez vlivu se neukazuje */
  const z = e.zav,
    zik = z && (z.r === "pok" || z.r === "poz") ? (z.r === "pok" ? "pokuseni" : "pozehnani") : "",
    zh = zik
      ? `<span class="bzzi ${z.r === "pok" ? "zp" : "zb"}" role="img" ${btip(`Závoj${z.d ? ` ${z.d}` : ""} – ${z.r === "pok" ? "Pokušení" : "Požehnání"}${z.vol ? `: ${z.vol}` : ""}${z.txt ? ` · z bestiáře: ${z.txt}` : ""}`)}>${bi(zik)}</span>`
      : "",
    zv =
      zik && (z.vol || z.txt)
        ? `<p class="bzzv${z.prij ? " bzzp" : ""}">${z.r === "pok" ? "Pokušení" : "Požehnání"}${z.vol ? ` ${besc(z.vol)}` : ""}${z.txt ? `<span class="bzzt">${besc(z.txt)}</span>` : ""}</p>`
        : "";
  const zbr = bzZbrIk(e);
  const det = e.rows.length || e.pozn.length || zv,
    kl = bzKlic(e),
    open = e.prvni;
  bzPamatuj(kl, e, gm);
  const str = e.A && e.A.o ? (e.A.o.druh && !bojSpoj(e.A.o) ? " bz-n" : " bz-h") : "";
  return `<li class="bz${str}${e.undone ? " blundone" : ""}${e.skryty ? " bzskr" : ""}${e.vys && e.vys[1] === "bzkr" ? " bzlkr" : ""}${det && !open ? " bzc" : ""}${det && !e.prvni ? " bzex" : ""}"><div class="bzh" data-bzdet="${besc(kl)}" role="button" tabindex="0" ${btip("Podrobnosti: kostky, výsledek, zranění a poznámky")}>${os(e.A)}${zbr ? `<span class="bzzbr" role="img" aria-label="${besc(e.co)}" ${btip(e.co)}>${bi(zbr)}</span>` : `<span class="bzco">${besc(e.co)}</span>`}${e.C ? `<span class="bzcil"><i class="bzsip" aria-label="vůči">→</i>${os(e.C)}</span>` : ""}<span class="bzt">${vys || zr || hph || zh ? `<span class="bzr">${vys}${zr}${hph}${zh}</span>` : ""}<time>${e.skryty ? "skrytý · " : ""}${bzCas(e.t)}</time>${e.und || ""}${det && !e.prvni ? `<i class="bzchev" aria-hidden="true">${bi("sipka")}</i>` : ""}</span></div>
    ${e.rows.length ? `<div class="bzd">${e.rows.map(r => `<p>${r.l ? `<small class="bzdl">${r.l}</small>` : ""}<span>${r.h}</span></p>`).join("")}</div>` : ""}${e.pozn.length ? `<p class="bzp">${e.pozn.map(besc).join(" · ")}</p>` : ""}${zv}</li>`;
}
/* sloupec záznamu (vypravěč i hráč) */
function bojZaznamSloupec(s, gm) {
  const L0 = bzZaznam(s, gm),
    L = BLF ? L0.filter(e => (e.A && e.A.id === BLF) || (e.C && e.C.id === BLF)) : L0;
  if (L.length) L[0].prvni = true;
  let k0;
  const li = L.map(e => {
    const hd = e.k != null && e.k !== k0 ? `<li class="bzkolo">${e.k}. kolo</li>` : "";
    if (e.k != null) k0 = e.k;
    return hd + bzRadek(e, gm);
  }).join("");
  return `<section class="bzaz"><h3 class="uvh2">${bi("kniha")} Herní záznam${L0.length ? ` <small>${L0.length}</small>` : ""}</h3>${BLF ? `<p class="blfc">Jen: <b>${besc(bojJm(s, BLF) || "?")}</b> <button type="button" class="bx" data-blfx aria-label="Zrušit filtr">×</button></p>` : ""}
    ${li ? `<ol class="bzl">${li}</ol>` : `<p class="rsmall bznic">Zatím prázdný. Sem se zapíše každý hod ve scéně i v boji – kdo, co a vůči komu, kostky s výsledky a kostka Závoje.</p>`}${gm ? "" : `<p class="rsmall bzhr">U nepřátel vidíš jen výsledek; jejich hody zná vypravěč.</p>`}</section>`;
}
