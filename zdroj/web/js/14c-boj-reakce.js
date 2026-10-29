/* ===== Boj: zásahy rovnou do karty, reakce na telefonu, plošné zásahy a iniciativa výzvou, začátek tahu,
   přehled družiny, po boji, skupinové ověření (2026-10-17) ===== */
const bojPcAuto = {
  get() {
    try {
      return localStorage.getItem("mm-boj-pcauto") !== "0";
    } catch (e) {
      return true;
    }
  },
  set(v) {
    try {
      localStorage.setItem("mm-boj-pcauto", v ? "1" : "0");
    } catch (e) {}
  },
};
const kHpOf = (K, ks) => (ks.hp != null ? +ks.hp : kHPmax(K));
/* vypravěč: zásah nepřítele odečte postavě s kartou životy hned (s odolnostmi, dočasnými HP, pádem na 0) */
function bojPcZasah(o, cid, K) {
  const S = BOJ.s || {},
    h0 = (S.hraci || []).find(x => x.id === cid);
  if (!h0 || !K || !o.zr || !(o.zr.t > 0)) return null;
  const ks0 = Object.assign({}, kartaStav(K.id)),
    hp0 = kHpOf(K, ks0),
    t0 = +ks0.thp || 0,
    ds0 = !!h0.ds,
    typ = bojTypy({zt: o.zr.zt})[0] || "Slashing",
    krit = !!((o.hod && o.hod.krit) || (o.bezv && o.bezvZbl));
  const opt = {drt: /drtiv/i.test(o.p || ""), pru: /průrazn/i.test(o.p || "")};
  const msg = bojPCZmena(cid, x => bojZranPC(x, K, o.zr.t, typ, krit, opt), false) || "";
  const ks1 = kartaStav(K.id),
    h1 = ((BOJ.s || {}).hraci || []).find(x => x.id === cid) || {};
  const ph = Math.max(0, hp0 - kHpOf(K, ks1)),
    pt = Math.max(0, t0 - (+ks1.thp || 0)),
    pd = !ds0 && !!h1.ds,
    /* kritický zásah postavy, která už leží (HP pod nulou se odečítají dál), chce také hod na kritické zranění */
    kpod = pd || (ds0 && krit),
    pod = kpod ? BZRPOD : 0;
  /* obětování zbroje (Artikule): kritický zásah se změní v běžný – kolik HP by se vrátilo (rozdíl účinku kritického a běžného zranění) */
  const ob =
    krit &&
    o.zr.t1 != null &&
    kZbrU(K) &&
    (() => {
      const Z = kZbrU(K);
      return (Z.z && Z.z.u < Z.z.max) || (Z.s && Z.s.u < Z.s.max);
    })()
      ? Math.max(0, Math.min(ph + pt, bojZranEf(K, o.zr.t, typ, opt).v - bojZranEf(K, o.zr.t1, typ, opt).v))
      : 0;
  /* pád na 0 HP: vyčerpání přičte karta, hod na kritické zranění se připraví vypravěči (neléčené rány, HP pod nulou) */
  if (kpod && GMV) {
    BKS.komu = h0.n;
    BKS.rany = (bojKritPC()[h0.n] || []).length;
    BKS.pod = pod;
    BKS.vys = "";
    BKS.kdo = h0.n + (pd ? " padl" : " – kritický zásah v bezvědomí");
    BKS.druh = bojKritDruh(typ);
  }
  let kv = false;
  if (ph + pt > 0 && kKonDrzi(K) && !pd) {
    if (GMV && window.MMDB && MMDB.vyzva) {
      kv = true;
      bojKonVyzva(K, cid, bojKonDC(ph + pt));
    } else KKON[K.id] = bojKonDC(ph + pt);
  }
  return {msg, ph, pt, pd, typ, kv, ob, pod};
}
/* soustředění postavy po zásahu (2026-10-18): hráči vyskočí výzva k CON záchraně, hodí si ji sám; neúspěch ukončí soustředění */
const BKONV = {};
function bojKonVyzva(K, hid, dc) {
  MMDB.vyzva({
    typ: "zach",
    ab: "CON",
    dc,
    komu: [K.id],
    adv: K.konVyhoda ? 1 : undefined,
    pozn: `Soustředění: utržené zranění – neúspěch ukončí soustředění${K.konVyhoda ? " (War Caster: s výhodou)" : ""}`.slice(0, 200),
  })
    .then(v => {
      BKONV[+v] = {kid: K.id, hid, dc};
      vyzvyNacti();
    })
    .catch(() => {
      KKON[K.id] = dc;
    });
}
/* hráč: nový zásah na mou postavu ve veřejném záznamu boje → hlášení, vibrace, soustředění, nabídka reakcí */
let BZAS = null;
/* nový zásah na mě (seznam N dodá bojZazHlidej – jednou za překreslení, s pamětí viděného) */
function bojZasahNovy(s, me, N) {
  const K = bojKartaH(me),
    L = N.filter(e => e.z > 0 || e.ph > 0 || e.pt > 0 || /zásah|krit/.test(e.v || ""));
  if (!L.length) return;
  const e = L[0],
    ztr = (+e.ph || 0) + (+e.pt || 0);
  try {
    navigator.vibrate && navigator.vibrate([160, 80, 160]);
  } catch (x) {}
  mmHlas(
    `${e.a || "Nepřítel"} tě zasáhl${e.cim ? ` (${e.cim})` : ""}${ztr ? ` za ${ztr}${e.t ? " " + String(e.t).replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g, m => BZRT[m] || m) : ""} – už odečteno z karty` : e.z ? ` za ${e.z}` : ""}.${(me.stav || []).includes("soustředí") && (ztr || e.z) && !e.pd ? ` Držíš soustředění: CON záchrana SO ${bojKonDC(ztr || e.z)}.` : ""}`,
    8000,
  );
  mmNotif("Zásah!", `${e.a || ""} ${e.v || ""}`);
  if (K) {
    if (ztr > 0 && kKonDrzi(K) && !e.pd && !e.kv) KKON[K.id] = bojKonDC(ztr);
    BZAS = {e, kid: K.id, hid: me.id, cas: Date.now()};
  }
  renderBoj();
}
/* fakta o postavě pro okno reakce (čistý 10r): co umí, co jí zbývá a zda smí reagovat; e = spouštěč (zásah, který ji právě srazil
   na 0, reakci nebere – Shield ho může odvrátit) */
function kReakceFakta(K, h, s, e) {
  const sez = kSeznam(K),
    SD = kSD(K),
    B = kZdrN(K, /bardic inspiration/i),
    st = [...new Set([...(kStavy(K) || []), ...((h && h.stav) || [])])];
  return {
    rk: !!(s.reak || {})[h.id],
    ds: !!(h && h.ds) && !(e && e.pd),
    nemuze: bojNeschopny(st) || (srdNejedna(st) ? "nejedná" : ""),
    kouzla: sez
      .map((x, i) => ({n: x.n, i, st: x.st, pz: x.pz}))
      .filter((x, i) => kCasKouzla(sez[i]) === "R" && ((x.st === 0 && !x.pz) || kSlX(K, sez[i]).length > 0)),
    rysy: [...(K.rysy || []), ...(K.rysy2 || []).map(r => r.n)].map(x => String(x).toLowerCase()),
    man: ["Parry", "Riposte"].filter(n => kManMa(K, n)),
    sd: SD ? {k: SD.k, zb: SD.zb} : null,
    rd: (() => {
      const RD = kStrU(K) >= 2 ? kRD(K) : null;
      return RD ? {k: RD.k, zb: RD.zb, zdarma: strZdarma(kStrU(K), kKarb(K))} : null;
    })(),
    bi: B ? {st: kBardSt(K), zb: B.zb} : null,
    str: kMod(kVl(K, "STR") || 10),
    agi: kMod(kVl(K, "DEX") || 10),
    pb: kPB(K),
    mnich: kTrU(kCtx(K), "Monk") || kLv(K),
    odv: bojZbrVse(s, h).some(w => !w.dal && w.z && (w.vl || []).includes("Odvetná")),
    zbl: bojZbrVse(s, h).some(w => !w.dal && w.z),
    sentinel: kMaRys(K, /^sentinel$/i),
  };
}
/* reakce, které postava může použít na zásah (okno reakce 10r) + obětování zbroje při kritu (Artikule – není to reakce) */
function kReakceNaZasah(K, h, s, e) {
  const o = [];
  {
    const Z = kZbrU(K),
      zb = Z && (Z.z && Z.z.u < Z.z.max ? Z.z : Z.s && Z.s.u < Z.s.max ? Z.s : null);
    if (e.kr && zb)
      o.push({
        k: "obet",
        n: `Obětovat ${zb.k === "Štít" ? "štít" : zb.k.toLowerCase() + " zbroj"}${+e.ob ? ` – vrátí ${e.ob} HP` : ""}`,
        t: `Kritický zásah se změní v běžný (Artikule): kostky zranění jen jednou${+e.ob ? `, vrátí ${e.ob} HP` : ""} a hod na kritické zranění odpadá. Není to reakce.`,
      });
  }
  const f = kReakceFakta(K, h, s, e),
    R = reakceOkno(f, e, "zasah"),
    sez = kSeznam(K);
  R.o.forEach(r => {
    const x = r.i != null ? sez[r.i] : null;
    if (x && x.pz) r.n += ` (${x.pz.sv ? "svitek" : String(x.pz.p || "předmět").replace(/^(Wand|Staff) of (the )?/, "")})`;
  });
  return {rk: !!R.proc, proc: R.proc, f, o: [...o, ...R.o]};
}
/* Riposte (Battle Master): nepřítel tě minul útokem na blízko → nabídka odvety; viděná minutí si telefon pamatuje (2026-10-20) */
let BRIP = null;
function bojMinNovy(s, me, N) {
  const K = bojKartaH(me);
  if (!K || !kManMa(K, "Riposte")) return;
  const L = N.filter(e => /^vedle/.test(e.v || "") && reakceMa(kReakceFakta(K, me, s, e), e, "vedle", "riposte"));
  if (!L.length) return;
  BRIP = {e: L[0], kid: K.id, hid: me.id, cas: Date.now()};
  mmHlas(`${L[0].a || "Nepřítel"} tě minul – můžeš reakcí oplatit (Riposte).`, 6000);
  renderBoj();
}
function kRipHtml(K, h, s) {
  if (!BRIP || BRIP.kid !== K.id || Date.now() - BRIP.cas > 5 * 60e3 || (s.reak || {})[h.id] || !(s.npc || []).some(o => o.id === BRIP.e.ai))
    return "";
  const e = BRIP.e,
    zb = bojZbrVse(s, h),
    j = zb.findIndex(w => !w.dal && w.z);
  if (j < 0) return "";
  const SD = kSD(K);
  return `<div class="khl kzas"><b>${besc(e.a || "Nepřítel")}</b> tě minul${e.cim ? ` · ${besc(e.cim)}` : ""}. <button type="button" class="gbtn" data-bdmsh="utok" data-j="${j}" data-brip="${besc(e.ai)}" ${btip(`Reakce: útok na blízko (${zb[j].n}); při zásahu + 1${SD ? SD.k : "d8"} (kostka převahy)`)}>Riposte – oplatit</button><button type="button" class="gbtn ghost" data-bripx>Nechat být</button></div>`;
}
document.addEventListener("click", e => {
  const T = q => e.target.closest && e.target.closest(q);
  if (T("[data-bripx]")) {
    BRIP = null;
    renderBoj();
    return;
  }
  const r = T("[data-brip]");
  if (r && BRIP) {
    const s = BOJ.s || {},
      tk = (s.kolo || 1) * 100 + (s.tah || 0);
    BJU.ripo = {ai: r.dataset.brip, tk};
    BJU.cilL = [r.dataset.brip];
    BJU.cil = r.dataset.brip;
    BJU.serie = null;
    BJU.info = "Riposte: odveta reakcí – hoď a pošli.";
    BRIP = null;
    setTimeout(renderBoj, 0);
  }
});
/* příležitostný útok (2026-10-25, Vojta): vypravěč u nepřítele označí „Opouští dosah“ a vybere postavy – do záznamu jde řádek
   s v = „opouští dosah“; telefon té postavy nabídne příležitostný útok. Sentinel: nepřítel zasáhl někoho jiného → nabídka útoku reakcí.
   Útok jde formulářem jako Riposte (BJU.ripo s pa / sen), spotřebuje reakci. */
let BPRI = null;
function bojPrilezNovy(s, me, N, jiny) {
  const K = bojKartaH(me);
  if (!K) return;
  const sp = jiny ? "jiny" : "odchod",
    L = N.filter(
      e =>
        (jiny ? e.ci !== me.id && /zásah|krit/.test(e.v || "") : e.v === "opouští dosah") &&
        (s.npc || []).some(o => o.id === e.ai && !bojSpoj(o)) &&
        reakceMa(kReakceFakta(K, me, s, e), e, sp, jiny ? "sentinel" : "pa"),
    );
  if (!L.length) return;
  BPRI = {e: L[0], k: jiny ? "sentinel" : "pa", kid: K.id, hid: me.id, cas: Date.now()};
  mmHlas(
    jiny
      ? `${L[0].a || "Nepřítel"} zasáhl ${L[0].c || "spojence"} – Sentinel: můžeš reakcí zaútočit.`
      : `${L[0].a || "Nepřítel"} opouští tvůj dosah – příležitostný útok?`,
    6000,
  );
  renderBoj();
}
function kPrilezHtml(K, h, s) {
  if (!BPRI || BPRI.kid !== K.id || Date.now() - BPRI.cas > 3 * 60e3 || (s.reak || {})[h.id] || !(s.npc || []).some(o => o.id === BPRI.e.ai))
    return "";
  const e = BPRI.e,
    zb = bojZbrVse(s, h),
    j = zb.findIndex(w => !w.dal && w.z),
    R = reakceOkno(kReakceFakta(K, h, s, e), e, BPRI.k === "sentinel" ? "jiny" : "odchod").o[0];
  if (j < 0 || !R) return "";
  return `<div class="khl kzas"><b>${besc(e.a || "Nepřítel")}</b> ${BPRI.k === "sentinel" ? `zasáhl ${besc(e.c || "spojence")}` : "opouští tvůj dosah"}. <button type="button" class="gbtn" data-bdmsh="utok" data-j="${j}" data-bpri="${besc(e.ai)}" ${btip(`${R.t} (${zb[j].n})`)}>${besc(R.n)}</button><button type="button" class="gbtn ghost" data-bprix>Nechat být</button></div>`;
}
document.addEventListener("click", e => {
  const T = q => e.target.closest && e.target.closest(q);
  if (T("[data-bprix]")) {
    BPRI = null;
    renderBoj();
    return;
  }
  const r = T("[data-bpri]");
  if (r && BPRI) {
    const s = BOJ.s || {},
      K = KARTBY[BPRI.kid],
      sen = BPRI.k === "sentinel";
    BJU.ripo = Object.assign(
      {ai: r.dataset.bpri, tk: (s.kolo || 1) * 100 + (s.tah || 0)},
      sen ? {sen: 1} : {pa: 1},
      K && kMaRys(K, /^sentinel$/i) ? {st: 1} : {},
    );
    BJU.cilL = [r.dataset.bpri];
    BJU.cil = r.dataset.bpri;
    BJU.serie = null;
    BJU.info = `${sen ? "Sentinel" : "Příležitostný útok"}: útok reakcí – hoď a pošli.${BJU.ripo.st ? " Při zásahu má cíl do konce tahu rychlost 0." : ""}`;
    BPRI = null;
    setTimeout(renderBoj, 0);
  }
});
/* Protective Bond (Doména míru, 2026-10-27): zasáhne-li nepřítel postavu spojenou Emboldening Bond, jiná spojená postava smí reakcí
   převzít celé zranění (teleportuje se k ní, do 30 stop). Telefonu té postavy se nabídne „Převzít zranění“: utrpí ho sama (se svými
   odolnostmi) a zasažené se vrátí ztracené životy (léčení spojence – jako Healing Word, případně přes schválení vypravěčem). */
let BPOU = null;
function bojPoutoOd(K) {
  const b = typeof kBufy === "function" ? kBufy(K).find(x => x.n === "Emboldening Bond") : null;
  return b ? b.od : null;
}
function bojPoutoNovy(s, me, J) {
  const K = bojKartaH(me);
  if (!K || (s.reak || {})[me.id]) return;
  const od = bojPoutoOd(K),
    kl = od && (KARTY || []).find(k => k.n === od);
  if (!kl || !kMaRys(kl, /^protective bond$/i)) return;
  const e = J.find(x => {
    const T = bojKartaH((s.hraci || []).find(h => h.id === x.ci));
    return T && T.id !== K.id && (+x.ph || 0) + (+x.pt || 0) > 0 && bojPoutoOd(T) === od;
  });
  if (!e) return;
  const T = bojKartaH((s.hraci || []).find(h => h.id === e.ci));
  BPOU = {
    e,
    kid: K.id,
    hid: me.id,
    tk: T.id,
    dmg: +e.z || (+e.ph || 0) + (+e.pt || 0),
    t: e.t || "",
    vrat: (+e.ph || 0) + (+e.pt || 0),
    cas: Date.now(),
  };
  mmHlas(`${e.a || "Nepřítel"} zasáhl ${T.n} – Protective Bond: můžeš reakcí převzít zranění.`, 6000);
  renderBoj();
}
function kPoutoHtml(K, h, s) {
  if (!BPOU || BPOU.kid !== K.id || Date.now() - BPOU.cas > 3 * 60e3 || (s.reak || {})[h.id]) return "";
  const T = KARTBY[BPOU.tk];
  if (!T) return "";
  return `<div class="khl kzas"><b>${besc(BPOU.e.a || "Nepřítel")}</b> zasáhl ${besc(T.n)} za ${BPOU.vrat}. <button type="button" class="gbtn" data-bpou ${btip(`Protective Bond: reakcí se přeneseš k ${T.n} (do 30 stop od spojence) a utrpíš celé zranění ${BPOU.dmg}${BPOU.t ? " " + (BZRT[BPOU.t] || BPOU.t) : ""} místo ní – započtou se tvoje odolnosti`)}>Převzít zranění</button><button type="button" class="gbtn ghost" data-bpoux>Nechat být</button></div>`;
}
document.addEventListener("click", async e => {
  const T = q => e.target.closest && e.target.closest(q);
  if (T("[data-bpoux]")) {
    BPOU = null;
    renderBoj();
    return;
  }
  if (!T("[data-bpou]") || !BPOU) return;
  const P = BPOU,
    K = KARTBY[P.kid],
    C = KARTBY[P.tk];
  BPOU = null;
  if (!K || !C) return;
  const m = bojPCZmena(P.hid, x => bojZranPC(x, K, P.dmg, P.t, false), false) || "";
  bojHracAkce(P.hid, (hh, z) => {
    z.reak = z.reak || {};
    z.reak[hh.id] = 1;
  });
  await kLecKarta(C, P.vrat, K, "Protective Bond");
  kHodZapis({
    k: K.id,
    kdo: K.n,
    co: "Protective Bond",
    txt: `převzal zranění za ${C.n}: ${m || P.dmg}${P.e.pd ? " · " + C.n + " padl/a na 0 – vypravěč ho vrátí do boje" : ""}`.slice(0, 290),
  });
  mmHlasG(`${K.n}: Protective Bond – zranění za ${C.n} převzato (${m || P.dmg}).`, 5000);
  renderBoj();
});
/* předpona útoku reakcí v záznamu: Riposte, Odveta (Odvetná), příležitostný útok, Sentinel */
const bojRipoPre = r =>
  !r ? "" : r.odv ? "Odveta: " : r.pa ? `Příležitostný útok${r.st ? " (Sentinel)" : ""}: ` : r.sen ? "Sentinel: " : "Riposte: ";
const bojRipoJeRiposte = r => !!r && !r.odv && !r.pa && !r.sen;
function kZasahHtml(K, h, s) {
  if (!BZAS || BZAS.kid !== K.id || Date.now() - BZAS.cas > 10 * 60e3) return "";
  const e = BZAS.e,
    ztr = (+e.ph || 0) + (+e.pt || 0),
    R = kReakceNaZasah(K, h, s, e);
  return `<div class="khl kzas"><b>${besc(e.a || "Nepřítel")}</b> tě zasáhl${e.cim ? ` · ${besc(e.cim)}` : ""}${e.hod ? ` · hod ${e.hod}${e.ac ? ` proti AC ${e.ac}` : ""}` : ""}${ztr ? ` · <b>−${ztr}</b> ${bikZrTxt(e.t)} <small>už odečteno</small>` : ""}${e.pd ? " · <b>padáš na 0</b>" : ""}
    ${R.rk ? `<small>${besc(R.proc)}</small>` : ""}${R.o.map(r => `<button type="button" class="gbtn" data-bzr="${r.k}"${r.i != null ? ` data-i="${r.i}"` : ""} ${btip(r.t)}>${besc(r.n)}</button>`).join("")}<button type="button" class="gbtn ghost" data-bzr="ok">${R.o.length ? (R.rk ? "Nechat být" : "Bez reakce") : "Rozumím"}</button></div>`;
}
async function kZasahReakce(K, k, i) {
  const z = BZAS;
  if (!z || z.kid !== K.id) return;
  const s = BOJ.s || {},
    h = (s.hraci || []).find(x => x.id === z.hid),
    e = z.e;
  BZAS = null;
  if (k === "ok" || !h) {
    renderBoj();
    return;
  }
  const ztr = (+e.ph || 0) + (+e.pt || 0),
    vrat = async (n, proc) => {
      if (n <= 0) return;
      const ks = kartaStav(K.id),
        mx = kHPmax(K),
        ph = Math.min(+e.ph || 0, n),
        pt = Math.min(+e.pt || 0, n - ph),
        hp = Math.min(mx, kHpOf(K, ks) + ph + (n - ph - pt));
      const ch = {hp: hp >= mx ? null : hp};
      if (pt) ch.thp = (+ks.thp || 0) + pt;
      if (e.pd && hp > 0) {
        ch.vycerp = Math.max(0, (+ks.vycerp || 0) - 1) || null;
        bojHracAkce(h.id, x => {
          delete x.ds;
        });
      }
      await kartaStavZmen(K.id, ch, null);
      if (KKON[K.id]) {
        const zb = ztr - n;
        if (zb > 0) KKON[K.id] = bojKonDC(zb);
        else delete KKON[K.id];
      }
      kHodZapis({k: K.id, kdo: K.n, co: `Reakce: ${proc}`, txt: `zásah od ${e.a || "nepřítele"}${e.hod ? ` (${e.hod})` : ""}: vráceno ${n} HP`});
    };
  if (k === "obet") {
    await kObetujZbroj(K, h, e, vrat);
    renderBoj();
    return;
  } /* obětování zbroje není reakce */
  bojHracAkce(h.id, (x, zz) => {
    (zz.reak = zz.reak || {})[h.id] = 1;
  });
  if (k === "barbs") {
    const sp = kSeznam(K)[+i];
    if (!sp || (await kartaSeslat(K, sp)) === false) return;
    const d0 = +e.d || 0,
      V = reakceVysledek("barbs", e, {}, {d20: bK(20)}),
      {d2, nd, tot, kr} = V;
    kHodZapis({
      k: K.id,
      kdo: K.n,
      co: "Reakce: Silvery Barbs",
      txt: `útočník přehazuje d20 ${d0 || "?"} → ${d2}, platí ${nd}${tot != null ? ` = ${tot} proti AC ${e.ac}` : ""}`,
    });
    if (V.n) await vrat(V.n, V.proc);
    else if (e.kr && !kr) mmHlas(`Silvery Barbs: útok stále zasahuje (${tot}), ale už ne kriticky – vypravěč sníží zranění.`, 6000);
    else mmHlas(`Silvery Barbs: útok stále zasahuje (${tot != null ? tot : "?"}).`, 5000);
    renderBoj();
    return;
  }
  if (k === "rebuke") {
    const sp = kSeznam(K)[+i];
    if (!sp) return;
    const q = kSlX(K, sp).sort((a, b) => a.st - b.st)[0],
      l = q ? q.st : 1;
    if ((await kartaSeslat(K, sp)) === false) return;
    const r = kVyraz(`${1 + l}d10`),
      dc = kSpDC(K, sp);
    try {
      if (bojDB && bojDB.utok)
        await bojDB.utok(h.id, {
          ci: [e.ai],
          cim: `Hellish Rebuke${l > 1 ? ` (${l}. st.)` : ""}`,
          t: "Fire",
          hod: 0,
          dmg: r ? r.tot : 0,
          plos: {ab: "DEX", dc: dc || 13, pol: true},
        });
      kHodZapis({k: K.id, kdo: K.n, co: "Reakce: Hellish Rebuke", txt: `${r ? r.txt : ""} Fire, DEX SO ${dc}`});
      mmHlas(`Hellish Rebuke: ${r ? r.tot : 0} Fire – útočník si hodí záchranu DEX u vypravěče.`, 5000);
    } catch (err) {
      mmHlas("Nepodařilo se poslat: " + (err.message || err), 5000);
    }
    renderBoj();
    return;
  }
  if (k === "shield" || k === "absorb" || k === "kz") {
    const sp = kSeznam(K)[+i];
    if (!sp) return;
    await kartaSeslat(K, sp);
    if (k === "shield") {
      const L = kUc(K).filter(x => x.n !== "Shield");
      L.push({n: "Shield", ac: 5, h: 0.0017});
      await kartaStavZmen(K.id, {uc: L});
    }
  } else if (k === "parry" || k === "cw") {
    const z = k === "parry" ? kSD(K) : kZdrN(K, /bardic inspiration/i);
    if (!z) return;
    await kZdrUtrat(K, z);
  }
  /* O vlásek: kostka (Štěstěny, nebo k6 zdarma) se určí před utracením */
  const VL = k === "vlasek" ? kRDKousek(K, "vlasek") : null;
  if (k === "vlasek") {
    if (!VL) return;
    if (VL.RD) await kZdrUtrat(K, VL.RD);
  }
  /* kolik HP vrátit: okno reakce (čistý 10r) – kostky se hodí tady */
  {
    const f = kReakceFakta(K, h, s, e),
      d =
        k === "da"
          ? bK(10)
          : k === "parry"
            ? bK(+String((f.sd || {}).k || "d8").slice(1))
            : k === "cw"
              ? bK(kBardSt(K))
              : VL
                ? bK(+VL.k.slice(1))
                : 0,
      V = reakceVysledek(k, e, f, {d});
    if (V && V.n > 0) await vrat(V.n, V.proc);
    else if (k === "vlasek" && V)
      kHodZapis({k: K.id, kdo: K.n, co: "Reakce: O vlásek", txt: `${V.proc} – útok ${e.hod || "?"} proti AC ${e.ac || "?"}`});
  }
  mmHlas(`${K.n}: reakce použita.`, 4000);
  renderBoj();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bzr]");
  if (!b) return;
  const K = kvK(b);
  if (K) kZasahReakce(K, b.dataset.bzr, b.dataset.i);
});
/* plošný zásah a iniciativa výzvou: odpovědi hráčů zpracuje vypravěčovo zařízení samo */
const BPLV = {};
let BINIV = new Set();
function bojVyzZpracuj() {
  if (!GMV || !BOJ.s || !(BOJ.s.aktivni || BOJ.s.priprava)) return;
  const s = BOJ.s;
  Object.keys(BPLV).forEach(id => {
    const P = BPLV[id],
      v = VYZVY.find(x => x.id === +id);
    if (!v) return;
    Object.entries(v.odpovedi || {}).forEach(([kid, o]) => {
      if (P.hot.has(kid)) return;
      P.hot.add(kid);
      const hid = P.map[kid],
        h = (s.hraci || []).find(x => x.id === hid),
        K = bojKartaH(h);
      if (!h || !K) return;
      const ok = P.dc ? o.tot >= P.dc : false,
        dmg = ok ? (P.pol ? Math.floor(P.dmg / 2) : 0) : P.dmg;
      let r = {ph: 0, pt: 0, pd: false, msg: "bez zranění"};
      if (dmg > 0) r = bojPcZasah({zr: {t: dmg, zt: P.t}}, hid, K) || r;
      bojZaz({
        a: P.src || "",
        c: h.n,
        ci: hid,
        cim: P.cim || "plošný zásah",
        v: `${P.ab} ${o.tot} – ${ok ? "úspěch" : "neúspěch"}${dmg ? `, ${dmg}` : ""}`,
        z: dmg,
        t: P.t,
        ph: r.ph,
        pt: r.pt,
        pd: r.pd,
        kv: r.kv ? 1 : undefined,
      });
      if (!ok && (P.st || []).length) {
        bojZmen(z => {
          const hh = (z.hraci || []).find(x => x.id === hid);
          if (hh) bojStavDej(z, hh, {n: P.cim || "Plošný zásah", st: P.st, op: P.op, k: P.k, ab: P.ab, dc: P.dc, src: P.kon || null});
        });
        r.msg += ` · ${P.st.join(", ")}`;
      }
      bojLog(hid, {n: P.cim || "Plošný zásah", ci: hid, zt: `${P.ab} ${o.tot} ${ok ? "úspěch" : "neúspěch"} → ${r.msg}`}, h.n);
      mmHlasG(`${h.n}: ${P.ab} ${o.tot} ${ok ? "úspěch" : "neúspěch"} – ${r.msg}`, 5000);
    });
    if (Object.keys(P.map).every(k => P.hot.has(k))) {
      delete BPLV[id];
      MMDB.vyzvaZavri(+id).catch(() => {});
    }
  });
  Object.keys(BKONV).forEach(id => {
    const P = BKONV[id],
      v = VYZVY.find(x => x.id === +id);
    if (!v) return;
    const o = (v.odpovedi || {})[P.kid];
    if (!o) return;
    delete BKONV[id];
    MMDB.vyzvaZavri(+id).catch(() => {});
    const K = KARTBY[P.kid],
      h = (s.hraci || []).find(x => x.id === P.hid),
      ok = o.tot >= P.dc;
    if (!K) return;
    if (!ok)
      kKonZtrata(K, "neúspěšná záchrana")
        .then(() => {
          if (curView === "boj") renderBoj();
        })
        .catch(() => {});
    if (h) bojLog(P.hid, {n: "Soustředění", ci: P.hid, zt: `CON ${o.tot} proti SO ${P.dc} – ${ok ? "udrženo" : "soustředění končí"}`}, h.n);
    mmHlasG(`${K.n}: soustředění – CON ${o.tot} ${ok ? "udrženo" : "ztraceno"}.`, 5000);
  });
  try {
    if (typeof bojZvVyzvy === "function") bojZvVyzvy(s);
  } catch (e) {
    console.error(e);
  }
  Object.keys(BOPV).forEach(id => {
    const P = BOPV[id],
      v = VYZVY.find(x => x.id === +id);
    if (!v) return;
    const o = (v.odpovedi || {})[P.kid];
    if (!o) return;
    delete BOPV[id];
    MMDB.vyzvaZavri(+id).catch(() => {});
    const ok = o.tot >= P.dc,
      h = (s.hraci || []).find(x => x.id === P.hid);
    if (!h) return;
    if (ok)
      bojZmen(z => {
        const hh = (z.hraci || []).find(x => x.id === P.hid);
        if (hh) (hh.ef || []).filter(e => e.n === P.n).forEach(e => bojEfDel(hh, e));
      });
    bojLog(P.hid, {n: P.n, ci: P.hid, zt: `opakovaná záchrana ${P.ab} ${o.tot} – ${ok ? "úspěch, účinek končí" : "neúspěch, trvá dál"}`}, h.n);
    mmHlasG(`${h.n}: ${P.n} – záchrana ${o.tot} ${ok ? "uspěla, účinek končí" : "neuspěla"}.`, 5000);
  });
  VYZVY.filter(v => !v.zavrena && v.data && v.data.typ === "ini" && BINIV.has(v.id)).forEach(v => {
    const ch = [];
    Object.entries(v.odpovedi || {}).forEach(([kid, o]) => {
      const h = (s.hraci || []).find(x => bojKartaH(x) && bojKartaH(x).id === kid);
      if (h && h.hod !== o.tot) ch.push([h.id, o.tot]);
    });
    if (ch.length)
      bojZmen(z => {
        ch.forEach(([id, t]) => {
          const h = (z.hraci || []).find(x => x.id === id);
          if (h) h.hod = t;
        });
      });
    const ids = (s.hraci || [])
      .map(h => bojKartaH(h))
      .filter(Boolean)
      .map(K => K.id);
    if (ids.length && ids.every(k => (v.odpovedi || {})[k])) {
      BINIV.delete(v.id);
      MMDB.vyzvaZavri(v.id).catch(() => {});
    }
  });
}
async function bojIniVyzva() {
  const s = BOJ.s || {},
    komu = [
      ...new Set(
        (s.hraci || [])
          .map(h => bojKartaH(h))
          .filter(Boolean)
          .map(K => K.id),
      ),
    ];
  if (!komu.length) {
    mmHlasG("V boji nejsou postavy s kartou.", 3000);
    return;
  }
  if (!window.MMDB) {
    mmHlasG("Výzvy fungují jen na webu s databází.", 3500);
    return;
  }
  try {
    if ((BOJ.s || {}).ticha)
      bojZmen(z => {
        delete z.ticha;
      });
    const id = await MMDB.vyzva({typ: "ini", komu});
    BINIV.add(+id);
    await vyzvyNacti();
    mmHlasG("Hráčům vyskočila výzva k iniciativě – hody se zapíšou samy.", 4500);
  } catch (e) {
    mmHlasG(e.message || String(e), 5000);
  }
}
/* vypravěč: přehled družiny v jednom pruhu */
/* po boji: výzva k odpočinku */
async function bojOdpVyzva() {
  const komu = [
    ...new Set(
      ((BOJ.s || {}).hraci || [])
        .map(h => bojKartaH(h))
        .filter(Boolean)
        .map(K => K.id),
    ),
  ];
  if (!komu.length || !window.MMDB) return;
  try {
    await MMDB.vyzva({typ: "odp", komu});
    await vyzvyNacti();
  } catch (e) {}
}
/* skupinové ověření jedním klepnutím */
async function vyzvaRychle(d, x) {
  if (!window.MMDB) {
    mmHlasG("Výzvy fungují jen na webu s databází.", 3500);
    return;
  }
  const komu = KARTY.filter(k => !k.test || KHRAC[k.id]).map(k => k.id);
  const o = {komu: komu.length ? komu : KARTY.map(k => k.id)};
  if (/^(STR|DEX|CON|INT|WIS|CHA)$/.test(d)) {
    o.typ = "zach";
    o.ab = d;
  } else {
    o.typ = "over";
    o.dov = d;
    o.ab = KDOVAB[d] || "WIS";
  }
  if (x && x.dc) o.dc = Math.max(1, Math.min(40, Math.round(x.dc)));
  if (x && x.skryt) o.skryt = true;
  if (x && x.pozn) o.pozn = String(x.pozn).slice(0, 60);
  try {
    await MMDB.vyzva(o);
    await vyzvyNacti();
    mmHlasG(`Všichni: ${o.typ === "zach" ? "záchrana " + d : d}${o.dc ? " SO " + o.dc : ""} – hráčům vyskočilo na telefonu.`, 3500);
    if (curView === "boj") renderBoj();
    else hraPrekresli();
  } catch (e) {
    mmHlasG(e.message || String(e), 5000);
  }
}
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const r = T("[data-vyzrychle]");
  if (r) {
    const p = r.closest(".bvyzp");
    vyzvaRychle(
      r.dataset.vyzrychle,
      p
        ? {
            dc: +((p.querySelector("[data-bvyzdc]") || {}).value || 0),
            skryt: !!(p.querySelector("[data-bvyzskr]") || {}).checked,
            pozn: ((p.querySelector("[data-bvyzpozn]") || {}).value || "").trim(),
          }
        : null,
    );
    return;
  }
  if (T("[data-binivyz]")) {
    bojIniVyzva();
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-bpcauto]")) {
    bojPcAuto.set(t.checked);
    renderBoj();
  }
});

/* uložení vlastností zbraně (stav karty zbrVl) */
document.addEventListener("submit", async e => {
  const f = e.target.closest && e.target.closest("[data-bdmzvf]");
  if (!f) return;
  e.preventDefault();
  const K = kvK(f);
  if (!K || !kMuze(K)) return;
  const w = f.dataset.w,
    vl = [...f.querySelectorAll("[name=vl]:checked")].map(x => x.value),
    t = [...f.querySelectorAll("[name=t]:checked")].map(x => x.value);
  if (vl.includes("Šikovná") && t.length < 2) {
    mmHlasG("Šikovná zbraň potřebuje aspoň dva typy zranění.", 3500);
    return;
  }
  const Z = Object.assign({}, kartaStav(K.id).zbrVl || {});
  Z[w] = Object.assign({vl}, vl.includes("Šikovná") ? {t} : {});
  BDM.sheet = null;
  await kartaStavZmen(K.id, {zbrVl: Z}, `${K.n}: ${w} – perky ${vl.join(", ") || "žádné"}.`);
});
document.addEventListener("click", async e => {
  const b = e.target.closest && e.target.closest("[data-bdmzvx]");
  if (!b) return;
  const K = kvK(b);
  if (!K || !kMuze(K)) return;
  const Z = Object.assign({}, kartaStav(K.id).zbrVl || {});
  delete Z[b.dataset.bdmzvx];
  BDM.sheet = null;
  await kartaStavZmen(K.id, {zbrVl: Object.keys(Z).length ? Z : null}, `${K.n}: ${b.dataset.bdmzvx} – perky podle názvu zbraně.`);
});

/* obětování zbroje či štítu při kritickém zásahu (Artikule › Zbroj): kritický zásah se změní v běžný – vrátí se rozdíl zranění (e.ob) */
async function kObetujZbroj(K, h, e, vrat) {
  const Z = kZbrU(K),
    z = Z && (Z.z && Z.z.u < Z.z.max ? Z.z : Z.s && Z.s.u < Z.s.max ? Z.s : null);
  if (!z) return false;
  if ((await kOdklad(`obětovat ${z.k === "Štít" ? "štít" : z.k.toLowerCase() + " zbroj"}`, () => true)) === false) return false;
  if (e && +e.ob > 0 && vrat) await vrat(+e.ob, "obětování zbroje");
  const S = kartaStav(K.id),
    U = Object.assign({}, S.zbrU || {}),
    ac0 = kAC(K);
  U[z.k] = (+U[z.k] || 0) + 1;
  await kartaStavZmen(K.id, {zbrU: U}, null);
  const txt = `${z.k === "Štít" ? "štít" : z.k.toLowerCase() + " zbroj"} obětována – kritický zásah se mění v běžný${e && +e.ob > 0 ? `, vráceno ${e.ob} HP` : " (kostky zranění jen jednou)"}, hod na kritické zranění odpadá${kAC(K) !== ac0 ? `; AC ${ac0} → ${kAC(K)}` : ""}`;
  kHodZapis({k: K.id, kdo: K.n, co: "Obětování zbroje", txt});
  if (GMV && h) bojLog(h.id, {n: "Obětování zbroje", ai: null, ci: h.id, zt: txt}, h.n);
  mmHlasG(`${K.n}: ${txt}.`, 6000);
  return true;
}
