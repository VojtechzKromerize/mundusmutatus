/* ===== Karty postav: import listu z PDF D&D Beyond, trvalý stav, hody se Závojem, odpočinky, herní záznam (2026-10-16) =====
   Karta (data z PDF) se ukládá do tabulky karty, stav postavy (životy, zdroje, sloty, vyčerpání, vybavení…) taky;
   boj z karty čte AC, záchrany a útoky a zapisuje do stejného stavu. Bez databáze (vypravěčský soubor) vše v prohlížeči. */
const KDB = window.MMDB
  ? {
      nacti: z => MMDB.kartyNacti(z),
      uloz: k => MMDB.kartaUloz(k),
      stav: (i, p, v) => MMDB.kartaStav(i, p, v),
      smaz: i => MMDB.kartaSmaz(i),
      hody: () => MMDB.hodyNacti(),
      hod: o => MMDB.hodZapis(o),
    }
  : (() => {
      const L = k => {
          try {
            return JSON.parse(mmDex(localStorage.getItem(k)) || "null");
          } catch (e) {
            return null;
          }
        },
        S = (k, v) => {
          try {
            localStorage.setItem(k, JSON.stringify(v));
          } catch (e) {}
        };
      return {
        nacti: async () => {
          const K = L("mm-karty") || {},
            T = L("mm-karty-stav") || {};
          return [...new Set([...Object.keys(K), ...Object.keys(T)])].map(id => ({id, karta: K[id] || null, stav: T[id] || {}, verze: 1}));
        },
        uloz: async k => {
          const K = L("mm-karty") || {};
          K[k.id] = k;
          S("mm-karty", K);
          return k.id;
        },
        stav: async (i, p, v) => {
          const T = L("mm-karty-stav") || {},
            o = (T[i] = T[i] || {});
          if (v == null) delete o[p];
          else o[p] = v;
          S("mm-karty-stav", T);
          return 1;
        },
        smaz: async i => {
          const K = L("mm-karty") || {};
          delete K[i];
          S("mm-karty", K);
        },
        hody: async () => L("mm-hody") || [],
        hod: async o => {
          const H = L("mm-hody") || [];
          H.unshift({id: Date.now(), cas: new Date().toISOString(), data: o});
          S("mm-hody", H.slice(0, 300));
          return 1;
        },
      };
    })();
const KST = {},
  KSTAT = new Set((KARTY || []).map(k => k.id));
let HODY = [],
  KLOAD = 0;
const kartaStav = id => KST[id] || {};
const KHRAC = {};
/* rozepsané změny: načtení z databáze nesmí přepsat změnu, která se právě ukládá (nebo se uložila až po začátku načítání) */
const KPEND = {},
  KPENDT = {};
function kartyNastav(rows, t0) {
  (rows || []).forEach(r => {
    if (r.zamceno) KZAM.add(r.id);
    else if (r.zamceno === false) KZAM.delete(r.id);
    if (r.hrac) KHRAC[r.id] = r.hrac;
    else if (r.hrac === null) delete KHRAC[r.id];
    if (r.karta && r.karta.n) {
      const i = KARTY.findIndex(k => k.id === r.id);
      if (i >= 0) KARTY[i] = r.karta;
      else KARTY.push(r.karta);
    }
    if (r.$beze || (t0 && KPENDT[r.id] > t0)) return;
    let st = r.stav || {};
    const P = KPEND[r.id];
    if (P && Object.keys(P).length) {
      st = Object.assign({}, st);
      Object.entries(P).forEach(([k, q]) => {
        if (q.v == null) delete st[k];
        else st[k] = q.v;
      });
    }
    KST[r.id] = st;
  });
  Object.keys(KARTBY).forEach(k => delete KARTBY[k]);
  KARTY.forEach(k => {
    KARTBY[k.id] = k;
  });
  kFrontaNaStav();
  /* stavy a hody proti smrti z karet do obrazu v boji (vypravěči i se záznamem změny z telefonu) */
  bojPcObnov(true);
}
async function kartyNacti(znovu) {
  try {
    const t0 = Date.now(),
      r = await KDB.nacti(znovu);
    const pred = JSON.stringify(KST) + KARTY.length;
    kartyNastav(r, t0);
    KLOAD = Date.now();
    KCACHE.uloz();
    if (KFR.get().length) kFrontaOdesli();
    return pred !== JSON.stringify(KST) + KARTY.length;
  } catch (e) {
    if (!KLOAD && (KCACHE.nacti() || (await KCACHE.nactiIDB()))) {
      KLOAD = Date.now();
      return true;
    }
    return false;
  }
}
async function hodyNacti() {
  try {
    const r = await KDB.hody();
    const top = (HODY[0] || {}).id;
    HODY = (r || []).map(x => Object.assign({id: x.id, cas: x.cas}, x.data || {}));
    return (HODY[0] || {}).id !== top;
  } catch (e) {
    return false;
  }
}
/* změna stavu karty: hned v prohlížeči, pak do databáze; ch = {pole: hodnota|null} */
async function kartaStavZmen(id, ch, msg, op = {}) {
  if (!op.bezZpet) kZpetZapis(id, ch);
  const o = Object.assign({}, kartaStav(id));
  Object.entries(ch).forEach(([k, v]) => {
    if (v == null) delete o[k];
    else o[k] = v;
  });
  KST[id] = o;
  bojPcObnov(false);
  kartyPrekresli();
  const P = (KPEND[id] = KPEND[id] || {});
  Object.entries(ch).forEach(([k, v]) => {
    P[k] = {v: v ?? null, n: ((P[k] || {}).n || 0) + 1};
  });
  const hotovo = k => {
    const q = P[k];
    if (q && --q.n <= 0) delete P[k];
    KPENDT[id] = Date.now();
  };
  try {
    for (const [k, v] of Object.entries(ch)) {
      try {
        await KDB.stav(id, k, v ?? null);
      } finally {
        hotovo(k);
      }
    }
    if (msg) mmHlasG(msg, 4500);
  } catch (e) {
    if (window.MMDB && kSitChyba(e)) {
      Object.entries(ch).forEach(([k, v]) => kFrontaPridej({t: "s", id, k, v: v ?? null}));
      KCACHE.uloz();
      mmHlasG("Bez připojení – změna se uloží, až bude signál.", 4000);
      return;
    }
    mmHlasG("Nepodařilo se uložit: " + (e.message || e), 5000);
    KPENDT[id] = 0;
    await kartyNacti(true);
    kartyPrekresli();
  }
}
/* po změně karty: stránka, kde je karta vidět, se překreslí jednou za dávku změn (mmPozdeji) */
function kartyPrekresli() {
  if (curView === "karty")
    mmPozdeji("karty", () => {
      if (curView === "karty") renderKarty(decodeURIComponent(location.hash.split("/")[1] || ""));
    });
  if (curView === "boj") bojPrekresli();
  if (curView === "hra") mmPozdeji("hra", hraPrekresli);
}
/* vyčerpání (D&D 2024): každá úroveň −2 ke všem hodům d20 */
const kVycerp = K => +(kartaStav(K.id).vycerp || 0);
/* hod d20 z karty; ověření a útoky hází i kostku Závoje a rovnou ji vyhodnotí, záchrany ne (Artikule › Kostka Závoje) */
let KADV = 0;
async function kartaHod(K, co, b, o = {}) {
  const SV = kStavVliv(K, co),
    v = kAdvSum(o.adv != null ? o.adv : KADV, SV.r);
  if (SV.r.length) o.why = [o.why, ...SV.r.map(x => x[1])].filter(Boolean).join(", ");
  if (SV.fail) o.why = [o.why, "automaticky selhává (stav)"].filter(Boolean).join(", ");
  const d1 = bK(20),
    d2 = v ? bK(20) : null,
    d = v > 0 ? Math.max(d1, d2) : v < 0 ? Math.min(d1, d2) : d1,
    vy = 2 * kVycerp(K),
    PD = kPriHod(K, co),
    tot = d + (+b || 0) - vy + PD.t,
    z = zavBezZach(co) ? null : kZavoj(K);
  const krit = d >= (o.kmin || 20) && !!o.utok,
    mis = d === 1 && !!o.utok;
  const txt = `d20 ${d1}${d2 != null ? ` / ${d2} (${v > 0 ? "výhoda" : "nevýhoda"})` : ""} ${bsg(+b || 0)}${vy ? ` −${vy} vyčerpání` : ""}${PD.txt} = ${tot}${krit ? " · kritický zásah" : mis ? " · minutí" : ""}${o.why ? " · " + o.why : ""}`;
  const H = {k: K.id, kdo: K.n, co: typeof bojScCo === "function" ? bojScCo(K, co, o) : co, txt, tot, d};
  if (z) {
    H.zav = z.d;
    H.zr = z.r || "0";
    KZAV[K.id] = {co, d: z.d, r: z.r, hod: z.hod};
    /* Závoj v ruce: Pokušení zabrní dlouze, Požehnání třikrát krátce (jen hráč na telefonu) */
    if (!GMV)
      try {
        if (navigator.vibrate) {
          if (z.r === "pok") navigator.vibrate([70, 50, 70, 50, 220]);
          else if (z.r === "poz") navigator.vibrate([25, 40, 25, 40, 25]);
        }
      } catch (e) {}
  }
  if (krit) H.krit = true;
  KPOSL[K.id] = {
    co,
    d1,
    d2,
    v,
    b: (+b || 0) - vy + PD.t,
    d,
    tot,
    kmin: o.kmin || 20,
    utok: !!o.utok,
    krit,
    mis,
    ut: o.ut,
    skryty: !!o.skryty,
    cas: Date.now(),
    upr: [],
    mods: [],
    pri: PD.n,
    puv: tot,
    bylMis: mis,
    bylKrit: krit,
  };
  if (mis) H.mis = true;
  if (v) H.adv = v;
  if (!o.skryty) kHodZapis(H);
  else {
    HODY.unshift(Object.assign({id: Date.now(), cas: new Date().toISOString(), skryty: true}, H));
    kartyPrekresli();
  }
  mmHlasG(`${K.n}: ${co} ${tot} (${txt.replace(/ = \d+.*/, "")})${z ? " · " + zavTxt(z) : ""}`, 6500);
  return {tot, d, krit, mis, zav: z ? z.d : undefined, zr: z ? z.r : undefined, txt};
}
async function kHodZapis(H) {
  HODY.unshift(Object.assign({id: Date.now(), cas: new Date().toISOString()}, H));
  kartyPrekresli();
  try {
    await KDB.hod(H);
  } catch (e) {
    if (window.MMDB && kSitChyba(e)) {
      kFrontaPridej({t: "h", h: H});
      KCACHE.uloz();
      return;
    }
    mmHlasG("Hod se nepodařilo zapsat: " + (e.message || e), 4000);
  }
}
/* hod výrazem (zranění, léčení): „1d8+5“, při kritickém zásahu dvojnásob kostek; přidané efekty (Hex 1d6, Damaging Hex +3) */
function kartaZraneni(K, a, krit, ef) {
  const k = bojKostky(String(a.z || "").replace(/\s+/g, ""), krit);
  let t = k ? k.t : 0,
    x = k ? k.x : "";
  (ef || []).forEach(e => {
    if (typeof e.zr === "string") {
      const q = bojKostky(e.zr, krit);
      if (q) {
        t += q.t;
        x += ` + ${q.x}${e.t ? " " + (BZRT[e.t] || e.t) : ""}`;
      }
    } else if (+e.zr) {
      t += +e.zr;
      x += ` + ${e.zr}`;
    }
  });
  return {t, x};
}
/* odpočinky (D&D 2024 + Artikule): krátký – kostky životů, zdroje „krátký odpočinek“, sloty paktu; dlouhý – vše, polovina kostek životů, vyčerpání −1 */
async function kartaOdpocinek(K, dlouhy) {
  const S = kartaStav(K.id),
    ch = {},
    msg = [],
    pool = kKostkyPool(K),
    kzMax = pool.length || kLv(K),
    spent = +S.kz || 0,
    con = kMod((K.vl || {}).CON || 10),
    mx = kHPmax(K),
    cur = S.hp != null ? +S.hp : mx;
  const U = Object.assign({}, S.zdr || {});
  if (dlouhy) {
    if (!confirm(`${K.n}: dlouhý odpočinek (8 hodin)? Obnoví životy, sloty, zdroje a všechny kostky životů, vyčerpání −1.`)) return;
    {
      const D = kDuse(K);
      if (D.sv >= 1 && D.sv <= 3) {
        const n = Math.min(mx, cur + Math.floor(mx / 2));
        ch.hp = n >= mx ? null : n;
        msg.push("neklidné sny (Na scestí): jen polovina HP");
      } else ch.hp = null;
    }
    ch.thp = null;
    ch.zdr = null;
    if (S.forma) ch.forma = null;
    const back = kzMax;
    ch.kz = null;
    if (S.vycerp) ch.vycerp = Math.max(0, S.vycerp - 1) || null;
    if ((K.rysy || []).some(r => /resourceful/i.test(r))) ch.insp = true;
    /* Věštec – Portent (2026-10-22): po dlouhém odpočinku 2d20 (Greater Portent 3d20), nevyužité propadají */
    if (typeof kMaRys === "function" && kMaRys(K, /^portent$/i)) {
      ch.port = [...Array(kMaRys(K, /^greater portent$/i) ? 3 : 2)].map(() => bK(20));
      msg.push(`předzvěst (Portent): ${ch.port.join(", ")}`);
    } else if (S.port) ch.port = null;
    msg.push(
      `životy ${ch.hp ?? mx}/${mx}, sloty, Výdrž a zdroje obnoveny, kostky životů +${Math.min(back, spent)}${S.vycerp ? ", vyčerpání −1" : ""}${ch.insp ? ", hrdinská inspirace (Resourceful)" : ""}`,
    );
  } else {
    const zb = kzMax - spent;
    if (cur < mx && zb > 0) msg.push(`kostky životů (zbývá ${zb}) utrať po jedné tlačítkem v Odpočinku`);
    kSloty(K)
      .filter(q => q.pakt)
      .forEach(q => {
        delete U[q.k];
      });
    kZdroje(K).forEach(q => {
      if (q.kr1) {
        if (U[q.n]) U[q.n] = U[q.n] - 1;
        if (!U[q.n]) delete U[q.n];
      } else if (/krátk/.test(q.obn || "")) delete U[q.n];
    });
    ch.zdr = Object.keys(U).length ? U : null;
    msg.push("zdroje s obnovou krátkým odpočinkem a sloty paktu obnoveny");
  }
  {
    const P = kPri(K),
      zb = P.filter(n => /^Bardic /.test(n) && !dlouhy);
    if (P.length !== zb.length) {
      ch.pri = zb.length ? zb : null;
      msg.push(`skončilo: ${P.filter(n => !zb.includes(n)).join(", ")}`);
    }
  }
  if (dlouhy) {
    const inv = (S.inv || K.vybaveni || []).map(y => Object.assign({}, y)),
      L = kNabObnov(inv);
    if (L.length) {
      ch.inv = inv;
      msg.push(`náboje za úsvitu: ${L.join(", ")}`);
    }
  }
  const kr = (bojKritPC()[K.n] || []).filter(x => /^Lehká/.test(x.t));
  if (kr.length) msg.push(`Lehká kritická zranění se hojí odpočinkem – vypravěč je odškrtne (${kr.length})`);
  await kartaStavZmen(K.id, ch);
  kHodZapis({k: K.id, kdo: K.n, co: dlouhy ? "Dlouhý odpočinek" : "Krátký odpočinek", txt: msg.join("; ")});
  mmHlasG(`${K.n}: ${dlouhy ? "dlouhý" : "krátký"} odpočinek – ${msg.join("; ")}.`, 8000);
}
/* sesílání kouzla: odečte nejnižší volný slot (sloty paktu i běžné), soustředění zapne v běžícím boji */
async function kartaSeslat(K, sp, chce) {
  /* soustředit se jde jen na jedno kouzlo: nové kouzlo se soustředěním ukončí to dosavadní (po potvrzení) */
  {
    const d = typeof kSp === "function" ? kSp(sp.n) : null;
    if ((sp.kon || (d && d.ko)) && kKonDrzi(K)) {
      const cur = kKonNazev(K) || "dosavadní kouzlo";
      if (cur !== sp.n) {
        if (!confirm(`${K.n} se soustředí na ${cur}. Seslání ${sp.n} soustředění přeruší – ${cur} skončí. Seslat?`)) return false;
        await kKonZtrata(K, `nové kouzlo se soustředěním: ${sp.n}`);
      }
    }
  }
  try {
    const c = kCasKouzla(sp);
    const h0 = ((BOJ.s && BOJ.s.aktivni && BOJ.s.hraci) || []).find(x => bojKartaH(x) === K);
    if (h0 && h0.n === bojJa.get()) {
      bojBptOznac(c);
      /* kouzlo za reakci (Shield, Absorb Elements…) spotřebuje reakci (2026-10-23) */
      if (c === "R" && bojBezi(BOJ.s) && !(BOJ.s.reak || {})[h0.id])
        bojHracAkce(h0.id, (h, z) => {
          (z.reak = z.reak || {})[h0.id] = 1;
        });
    }
  } catch (e) {}
  const L = kSlX(K, sp).sort((a, b) => (chce && a.k === chce ? -1 : chce && b.k === chce ? 1 : a.st - b.st));
  if ((sp.st > 0 || sp.pz) && !L.length) {
    mmHlasG(
      sp.pz
        ? sp.pz.sv
          ? `${K.n}: ${sp.n} není na seznamu kouzel tvého povolání – svitek je nesrozumitelný.`
          : `${K.n}: ${sp.pz.p} nemá na ${sp.n} dost nábojů.`
        : `${K.n}: na ${sp.n} nezbývá slot ${sp.st}. stupně nebo vyšší.`,
      4000,
    );
    return false;
  }
  const q = sp.st > 0 || sp.pz ? L[0] : null,
    U = Object.assign({}, kartaStav(K.id).zdr || {});
  if (q && q.lab != null && sp.pz.sv) {
    const S = kartaStav(K.id),
      inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
      it = inv[sp.pz.i],
      mx = Math.max(0, ...kSloty(K).map(z => z.st)),
      so = 10 + (+sp.st || 0);
    let ok = true;
    if (+sp.st > mx) {
      const r = await kartaHod(K, `Svitek ${sp.n} – ověření (SO ${so})`, kSpMod(K));
      ok = !!r && r.tot >= so;
    }
    if (it) {
      if ((it.q == null ? 1 : +it.q) > 1) it.q = +it.q - 1;
      else inv.splice(sp.pz.i, 1);
      await kartaStavZmen(K.id, {inv});
    }
    if (!ok) {
      kHodZapis({k: K.id, kdo: K.n, co: `Svitek ${sp.n}`, txt: "ověření selhalo – kouzlo zmizelo bez účinku"});
      mmHlasG(`${K.n}: ověření selhalo – ${sp.n} ze svitku zmizelo bez účinku.`, 5000);
      return false;
    }
  } else if (q && q.lab != null) {
    const S = kartaStav(K.id),
      inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
      it = inv[sp.pz.i];
    if (it && q.nab) {
      it.nab = (+it.nab || 0) + q.nab;
      await kartaStavZmen(K.id, {inv});
    }
  } else {
    if (q) U[q.k] = (U[q.k] || 0) + 1;
    if (q) await kartaStavZmen(K.id, {zdr: U});
  }
  const h = ((BOJ.s && BOJ.s.aktivni && BOJ.s.hraci) || []).find(x => bojKartaH(x) === K);
  if (sp.kon && h) {
    if (window.MMDB && !GMV)
      bojHracAkce(h.id, x => {
        x.stav = [...new Set([...(x.stav || []), "soustředí"])];
      });
    else if (GMV)
      bojHracAkce(h.id, x => {
        x.stav = [...new Set([...(x.stav || []), "soustředí"])];
      });
  }
  await kSpNacti().catch(() => {});
  const lv = q && q.st ? q.st : +sp.st || 0;
  {
    const d = kSp(sp.n),
      h = d ? kTrv(d.d) : null;
    if (h) await kUcPridej(K, sp.n + (typeof kzStPrip === "function" ? kzStPrip(sp.n, lv, +sp.st || 0) : ""), h, sp.kon || !!(d && d.ko));
  }
  if (typeof kSesPo === "function")
    try {
      await kSesPo(K, sp, lv);
    } catch (e) {}
  kHodZapis({
    k: K.id,
    kdo: K.n,
    co: `Seslal ${sp.n}`,
    txt: `${q && q.lab != null ? `${sp.pz.p}, ${q.lab} (${q.st}. st.)` : q ? `slot ${q.st}. st.${q.pakt ? " (pakt)" : ""}` : "trik"}${sp.zach ? ` · záchrana ${sp.zach}` : ""}${sp.kon ? " · Concentration" : ""}`,
  });
  mmHlasG(
    `${K.n} sesílá ${sp.n}${q && q.lab != null ? (sp.pz.sv ? ` ze svitku` : ` (${sp.pz.p}: ${q.lab}, zbývá ${q.max - q.nab})`) : q ? ` (slot ${q.st}. st., zbývá ${q.max - q.u - 1})` : ""}${sp.kon ? " – soustředění" : ""}${sp.zach ? ` · záchrana ${sp.zach}` : ""}.`,
    5000,
  );
  return true;
}
/* ===== stránka Karty postav ===== */
const KSK = {STR: "Síla", DEX: "Obratnost", CON: "Odolnost", INT: "Inteligence", WIS: "Moudrost", CHA: "Charisma"};
const KDOVAB = {
  Acrobatics: "DEX",
  "Animal Handling": "WIS",
  Arcana: "INT",
  Athletics: "STR",
  Deception: "CHA",
  History: "INT",
  Insight: "WIS",
  Intimidation: "CHA",
  Investigation: "INT",
  Medicine: "WIS",
  Nature: "INT",
  Perception: "WIS",
  Performance: "CHA",
  Persuasion: "CHA",
  Religion: "INT",
  "Sleight of Hand": "DEX",
  Stealth: "DEX",
  Survival: "WIS",
};
const KEF = {};
let KIMP = null;
const kHodyHtml = (L, cap) =>
  L.length
    ? `<ol class="khody">${L.slice(0, cap || 40)
        .map(
          h =>
            `<li${h.skryty || h.taj ? ' class="kskr"' : ""}><b>${besc(h.kdo || "")}</b> · ${besc(h.co || "")}${h.tot != null ? ` <b class="khtot${h.krit ? " bkr" : h.mis ? " bmis" : ""}">${h.tot}</b>` : ""}${
              h.zav
                ? (() => {
                    const r = h.zr ? (h.zr === "0" ? "" : h.zr) : h.zav <= 2 ? "pok" : h.zav >= 5 ? "poz" : "";
                    return ` <span class="bzv ${r === "pok" ? "zp" : r === "poz" ? "zb" : ""}" ${btip(`Kostka Závoje ${h.zav}: ${zavVys(r)}`)}>${r ? zavVys(r) : "bez vlivu"} ${h.zav}</span>`;
                  })()
                : ""
            }${h.txt ? `<small>${besc(h.txt)}</small>` : ""}<time>${(() => {
              try {
                return new Date(h.cas).toLocaleTimeString("cs-CZ", {hour: "2-digit", minute: "2-digit"});
              } catch (e) {
                return "";
              }
            })()}</time></li>`,
        )
        .join("")}</ol>`
    : `<p class="rsmall">Zatím žádné hody.</p>`;
function renderKarty(id) {
  mmZrus("karty");
  const box = document.getElementById("kartyview");
  if (typeof vybNacti === "function" && !VYB && !VYBP)
    vybNacti()
      .then(() => {
        if (curView === "karty") kartyPrekresli();
      })
      .catch(() => {});
  if (!box) return;
  if (!KLOAD) {
    KLOAD = 1;
    Promise.all([kartyNacti(), hodyNacti()]).then(() => renderKarty(id));
  }
  const K = id && KARTBY[id];
  if (!K) {
    box.innerHTML = `<div class="bojtit"><h2 class="arttitle">Karty postav</h2><p class="bojlead">List postavy z D&amp;D Beyond: AC, životy, záchrany, dovednosti, útoky, kouzla a vybavení. Hody se zapisují do herního záznamu družiny.</p></div>
      <ul class="klist">${
        KARTY.map(k => {
          const S = kartaStav(k.id),
            hp = S.hp != null ? S.hp : k.hp;
          return `<li><a href="#karty/${besc(k.id)}"><b>${besc(k.n)}</b><small>${besc([k.povolani, k.druh].filter(Boolean).join(" · "))}${k.test ? " · zkušební" : ""}</small><span>AC ${kAC(k)} · HP ${hp}/${k.hp}</span></a></li>`;
        }).join("") || `<li class="rsmall">Zatím žádná karta.</li>`
      }</ul>

      ${kPrehledHtml()}${poklHtml()}<section class="khodsec"><h3 class="uvh2">Hod kostkou</h3>${kHodForm(null)}</section>${UKDB ? `<section><h3 class="uvh2">Ukázky od vypravěče</h3>${ukSeznam()}${GMV ? `<p class="rsmall"><a href="#sezeni">Ukázat hráčům a příprava sezení →</a></p>` : ""}</section>` : ""}<section><h3 class="uvh2">Herní záznam</h3>${kZaznamHtml()}</section>
      <section class="kimp"><h3 class="uvh2">Nahrát list postavy</h3><p class="rsmall">V D&amp;D Beyond otevři postavu → <i>Export to PDF</i> → stáhni PDF a nahraj ho sem. Karta se vytvoří, nebo přepíše dřívější kartu stejné postavy (stav postavy zůstane).</p>
        <label class="gbtn"><input type="file" accept="application/pdf,.pdf" data-kimp hidden>Vybrat PDF…</label>${KIMP ? kImpNahled(KIMP) : ""}</section>`;
    pojZnac(box.querySelector(".kprehled"));
    return;
  }
  box.innerHTML = kartaJednaHtml(K);
  pojZnac(box);
}
/* puntíky použití (sloty, zdroje, kostky životů, zbroj): klepnutí na j-tý puntík nastaví počet použitých na j + 1,
   klepnutí na už použitý ho vrátí na j */
const kPipNa = (u, j) => (u > j ? j : j + 1);
/* totéž v mapě počtů podle klíče ({Výdrž: 2, …}); vrací novou mapu, prázdnou jako null */
function kPipyMapa(U0, k, j) {
  const U = Object.assign({}, U0 || {});
  U[k] = kPipNa(U[k] || 0, j);
  if (!U[k]) delete U[k];
  return Object.keys(U).length ? U : null;
}
/* před vykreslením oddílu karty (Vybavení, Poznámky): dočte předměty SRD a kouzla a nechá vypršet účinky,
   jejichž herní čas uplynul (dřív vedlejší účinek celé karty v rozvržení D&D Beyond, kterou nahradila bojová karta) */
function kartaPriprav(K) {
  if (!PRED)
    predNacti()
      .then(() => {
        if (curView === "karty" || mmNaHre()) kartyPrekresli();
      })
      .catch(() => {});
  kUcVyprsi(K);
  KEF[K.id] = KEF[K.id] || [];
  if (!KSPD)
    kSpNacti()
      .then(() => kartyPrekresli())
      .catch(() => {});
}
/* zátěž postavy z vybavení a peněz na kartě (oddíl Vybavení bojové karty) */
function kartaZatez(K) {
  const S = kartaStav(K.id);
  return kZatez(K, S.inv || K.vybaveni || [], S.pen || K.penize || {});
}
/* ===== části karty sdílené s bojovou kartou (14): české názvy vlastností, puntíky omezených použití, deník.
   Celou kartu v rozvržení D&D Beyond (kartaDbHtml) nahradila 2026-10-18 bojová karta; odstraněna 2026-10-23. ===== */
const KDBVL = {STR: "Síla", DEX: "Obratnost", CON: "Odolnost", INT: "Inteligence", WIS: "Moudrost", CHA: "Charisma"};
function kdbPips(K, q) {
  const U = kartaStav(K.id).zdr || {},
    u = Math.min(q.max, U[q.k] || 0);
  return `<span class="kdbpips" ${btip(`${q.n}: použito ${u} z ${q.max}${q.obn ? " · obnova: " + q.obn : ""}`)}>${[...Array(q.max)].map((_, j) => `<button type="button" class="${j < u ? "on" : ""}" data-kzd="${besc(q.k)}" data-j="${j}" aria-label="${besc(q.n)} ${j + 1} z ${q.max}${j < u ? " – použito" : ""}"></button>`).join("")}${q.obn ? `<small>/ ${besc(q.obn)}</small>` : ""}</span>`;
}
/* oddíl Poznámky bojové karty: deník postavy */
function kDenikHtml(K) {
  kartaPriprav(K);
  const S = kartaStav(K.id);
  return `<div class="kgrid"><div><h4 class="kdbsh">Poznámky a deník</h4><textarea class="kpozn" data-kpozn rows="12" maxlength="4000" placeholder="Koho jsme potkali, co jsme slíbili, co si pamatovat…">${besc(S.pozn || "")}</textarea><p class="kdbnote">Ukládá se samo. Vidí je každý, kdo otevře kartu – tajnosti pošli vypravěči ze stránky Hra.</p></div></div>`;
}
const KUPRO = new Set();
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kuprt]");
  if (!b) return;
  const K = kvK(b);
  if (!K) return;
  if (KUPRO.has(K.id)) KUPRO.delete(K.id);
  else KUPRO.add(K.id);
  kartyPrekresli();
});
/* import PDF: pdf.js z art/lib, pole formuláře → karta */
async function kartaImport(file) {
  mmHlasG("Čtu PDF…", 2500);
  const lib = await import(new URL("art/lib/pdfjs/pdf.min.mjs", location.href).href);
  lib.GlobalWorkerOptions.workerSrc = new URL("art/lib/pdfjs/pdf.worker.min.mjs", location.href).href;
  const doc = await lib.getDocument({data: new Uint8Array(await file.arrayBuffer())}).promise,
    F = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const pg = await doc.getPage(p);
    for (const a of await pg.getAnnotations()) if (a.fieldName) F.push({f: a.fieldName, v: a.fieldValue, p, r: a.rect});
  }
  if (!F.length) throw new Error("V PDF nejsou pole listu postavy. Exportuj postavu z D&D Beyond znovu (Export to PDF).");
  return kartaZPdf(F);
}
/* kontrola importu: AC z vybavení podle pravidel proti AC v PDF; vybavení upravené na webu */
function kImpKontrola(K, ja) {
  const id = (ja && JA.get() && JA.get().k) || K.id,
    S = KARTBY[id] ? kartaStav(id) : {};
  let h = "";
  try {
    const T = Object.assign({}, K, {id: "__imp" + Date.now()}),
      r = kACR(T),
      zb = r.N && r.N.z,
      st = r.N && r.N.s,
      dl = /z D&D Beyond/.test(r.txt);
    h += `<p class="rsmall kimpac"><b>AC ${K.ac}</b> = ${besc(r.txt)}${zb ? "" : ` <b class="bhrich">· zbroj v PDF nenalezena</b>`}</p>`;
    if (dl)
      h += `<p class="rsmall">Část AC web z pravidel nevysvětlí (např. Fighting Style Defense nebo vlastní předmět) – drží se jako úprava „z D&amp;D Beyond“. V Úpravách postavy ji jde nahradit konkrétním předmětem nebo rysem.</p>`;
    if (!zb && !st && (K.vybaveni || []).length)
      h += `<p class="rsmall">Když postava zbroj nosí a web ji nepoznal, zkontroluj název ve vybavení (např. „Breastplate“, „Chain Mail“).</p>`;
  } catch (e) {}
  if (S.inv) {
    const a = new Set((S.inv || []).map(x => x.n.toLowerCase())),
      b = (K.vybaveni || []).filter(x => !a.has(x.n.toLowerCase()));
    h += `<label class="rsmall kimpinv"><input type="checkbox" data-kimpinv${KIMPINV ? " checked" : ""}> Převzít vybavení z nového PDF${
      b.length
        ? ` (na webu chybí ${b.length}: ${besc(
            b
              .slice(0, 5)
              .map(x => x.n)
              .join(", "),
          )}${b.length > 5 ? "…" : ""})`
        : ""
    } – vybavení upravené na webu se nahradí</label>`;
  }
  return h;
}
let KIMPINV = true;
const kImpNahled = (
  K,
  ja,
) => `<div class="kimpn"><p><b>${besc(K.n)}</b> · ${besc(K.povolani || "")} · AC ${K.ac} · HP ${K.hp} · útoky ${(K.utoky || []).length} · kouzla ${((K.kouzla || {}).seznam || []).length} · předměty ${(K.vybaveni || []).length}${KARTBY[K.id] ? ` · <b>přepíše existující kartu</b>` : ""}</p>${kImpKontrola(K, ja)}
  ${
    KARTBY[K.id]
      ? (() => {
          const r = kRozdil(KARTBY[K.id], K);
          return r.length
            ? `<p class="rsmall"><b>Co se změní:</b></p><ul class="kdiff">${r.map(x => `<li>${besc(x)}</li>`).join("")}</ul><p class="rsmall">Stav postavy (životy, sloty, Svědomí, vybavení na webu) zůstane.</p>`
            : `<p class="rsmall">Proti uložené kartě beze změn.</p>`;
        })()
      : ""
  }
  <p class="rsmall">Popisy schopností z PDF (texty příruček) uvidí jen hráč této postavy a vypravěč.</p>${ja ? `<button type="button" class="gbtn" data-kimpja>Uložit a hrát za tuto postavu</button>` : `<button type="button" class="gbtn" data-kimpok>Uložit kartu</button>`} <button type="button" class="gbtn ghost" data-kimpx>Zrušit</button></div>`;
document.addEventListener("change", async e => {
  const v = e.target.closest && e.target.closest("#kartyview,#bojpult,.bdm");
  if (!v) return;
  const t = e.target,
    K = kvK(t);
  if (t.matches("[data-kimpinv]")) {
    KIMPINV = t.checked;
    return;
  }
  if (t.matches("[data-kimp]") && t.files[0]) {
    try {
      KIMP = await kartaImport(t.files[0]);
      renderKarty("");
    } catch (err) {
      mmHlasG("Import se nepodařil: " + (err.message || err), 7000);
    }
    return;
  }
  if (!K) return;
  if (t.matches("[data-kprib]")) {
    const P = kPri(K).filter(x => !/^Bardic /.test(x));
    kartaStavZmen(K.id, {pri: [...P, "Bardic " + t.value]});
    return;
  }
  if (t.matches("[data-kpen]")) {
    const S = kartaStav(K.id),
      pen = Object.assign({}, S.pen || K.penize || {});
    pen[t.dataset.kpen] = Math.max(0, Math.min(9999999, Math.round(+t.value || 0)));
    kartaStavZmen(K.id, {pen});
    return;
  }
});
document.addEventListener("click", async e => {
  const v = e.target.closest && e.target.closest("#kartyview,#bojpult,.hrapri,.bjapanel,.bhkb");
  if (!v) return;
  const T = s => e.target.closest(s),
    id = decodeURIComponent(location.hash.split("/")[1] || ""),
    K = kvK(e.target);
  if (T("[data-kimpok]") && KIMP) {
    try {
      const i = await kartaUlozImport(KIMP);
      KIMP = null;
      navTo("#karty/" + i);
      mmHlasG("Karta uložena.", 3000);
    } catch (err) {
      mmHlasG("Uložení se nepodařilo: " + (err.message || err), 6000);
    }
    return;
  }
  if (T("[data-kimpx]")) {
    KIMP = null;
    renderKarty("");
    return;
  }
  if (!K) return;
  const S = kartaStav(K.id),
    skr = GMV && !!window.KSKR;
  const h = T("[data-khod]");
  if (h) {
    const [k, a] = h.dataset.khod.split(/:(.*)/s);
    if (k === "ov") {
      const m = kOvB(K, a);
      await kartaHod(K, `Ověření ${KSK[a] || a}`, m, {skryty: skr});
    } else if (k === "za") await kartaHod(K, `Záchrana ${a}`, kZach(K, a), {skryty: skr});
    else if (k === "dv") {
      const r = kSvAdv(K, a);
      await kartaHod(K, a, kDov(K, a), {skryty: skr, adv: r.length ? kAdvSum(KADV, r) : undefined, why: r.map(x => x[1]).join(", ")});
    } else if (k === "in") await kartaHod(K, "Iniciativa", kIni(K), {skryty: skr});
    else if (k === "ut") {
      const at = kUtoky(K)[+a],
        E = kEfAkt(K, KEF[K.id], at),
        kmin = Math.min(20, ...E.map(x => +x.krit || 20));
      if (at) {
        kMunOdecti(K, at, 1);
        const r = await kartaHod(K, `Útok – ${at.n}`, (+at.b || 0) + (typeof kEfUt === "function" ? kEfUt(E) : 0), {
          utok: true,
          kmin,
          skryty: skr,
          ut: +a,
        });
        if (r.krit || !r.mis) {
          const zr = kartaZraneni(K, at, r.krit, E);
          kEfPouzij(K, E, KEF[K.id]);
          kHodZapis({
            k: K.id,
            kdo: K.n,
            co: `Zranění – ${at.n}`,
            tot: zr.t,
            txt: `${zr.x}${r.krit ? " (kritický zásah)" : ""} ${BZRT[at.t] || at.t || ""}`,
          });
        }
      }
    } else if (k === "ks") {
      const sp = kSeznam(K)[+a];
      if (sp) await kartaHod(K, `Útok kouzlem – ${sp.n}`, kSpU1(K, sp), {utok: true, skryty: skr});
    }
    return;
  }
  const zr = T("[data-kzr]");
  if (zr) {
    const at = kUtoky(K)[+zr.dataset.kzr],
      E = kEfAkt(K, KEF[K.id], at);
    if (!at) return;
    const r = kartaZraneni(K, at, !!zr.dataset.krit, E);
    kEfPouzij(K, E, KEF[K.id]);
    const H = {
      k: K.id,
      kdo: K.n,
      co: `Zranění – ${at.n}`,
      tot: r.t,
      txt: `${r.x}${zr.dataset.krit ? " (kritický zásah)" : ""} ${BZRT[at.t] || at.t || ""}`,
    };
    if (skr) {
      HODY.unshift(Object.assign({id: Date.now(), cas: new Date().toISOString(), skryty: true}, H));
      renderKarty(id);
    } else kHodZapis(H);
    mmHlasG(`${K.n}: zranění ${r.t} (${r.x})`, 4500);
    return;
  }
  const cm = T("[data-kcilm]");
  if (cm) {
    const [i, id] = cm.dataset.kcilm.split("|"),
      x = kSeznam(K)[+i];
    if (!x) return;
    const S = kCilM(K, i),
      mx = kCilMax(K, x, i);
    if (S.has(id)) S.delete(id);
    else if (S.size < mx) S.add(id);
    else mmHlasG(`${x.n}: nejvýš ${mx} ${mx === 1 ? "cíl" : mx < 5 ? "cíle" : "cílů"}.`, 3000);
    kartyPrekresli();
    return;
  }
  const rit = T("[data-krit]");
  if (rit) {
    const sp = kSeznam(K)[+rit.dataset.krit];
    if (sp && typeof kartaRitual === "function") {
      await kartaRitual(K, sp);
      kartyPrekresli();
    }
    return;
  }
  const ses = T("[data-kses]");
  if (ses) {
    const i = ses.dataset.kses,
      sp = kSeznam(K)[+i];
    {
      const nes = kNeschopny(K);
      if (nes) {
        mmHlasG(`Nemůžeš sesílat – ${nes}.`, 3500);
        return;
      }
    }
    if (sp) {
      await kSpNacti().catch(() => {});
      if (kSesCil(sp)) {
        kSesDlg(K, sp, i);
        return;
      }
      await kartaSeslat(K, sp, KSLV[K.id + ":" + i]);
    }
    return;
  }
  const zd = T("[data-kzd]");
  if (zd) {
    kartaStavZmen(K.id, {zdr: kPipyMapa(S.zdr, zd.dataset.kzd, +zd.dataset.j)});
    return;
  }
  const kk = T("[data-kkz]");
  if (kk) {
    kartaStavZmen(K.id, {kz: kPipNa(+S.kz || 0, +kk.dataset.kkz) || null});
    return;
  }
  const ob = T("[data-kobl]");
  if (ob) {
    const i = +ob.dataset.kobl,
      inv = [...(S.inv || K.vybaveni || [])].map(x => Object.assign({}, x)),
      r = kZbrInfo(inv[i]);
    if (!r) return;
    const N = kNoseno(inv),
      on = (N.z && N.z.i === i) || (N.s && N.s.i === i);
    if (on) inv[i].obl = false;
    else
      inv.forEach((x, j) => {
        const q = kZbrInfo(x);
        if (j === i) x.obl = true;
        else if (q && q.k === r.k) x.obl = false;
      });
    const pred = kAC(K);
    await kartaStavZmen(K.id, {inv});
    mmHlasG(`${K.n}: ${inv[i].n} ${on ? "sundána" : "na sobě"} – AC ${pred} → ${kAC(K)}.`, 4000);
    return;
  }
  const vle = T("[data-kvled]");
  if (vle) {
    if (!kMuze(K)) return;
    const a = vle.dataset.kvled,
      v0 = kVl0(K, a),
      U = Object.assign({}, S.vlU || {}),
      x = prompt(`${KDBVL[a] || a}: nové skóre (1–30). Prázdné = podle PDF (${v0 ?? "–"}).`, U[a] ?? v0 ?? "");
    if (x == null) return;
    const n = Math.round(+String(x).trim());
    if (String(x).trim() === "" || n === v0) delete U[a];
    else if (n >= 1 && n <= 30) U[a] = n;
    else {
      mmHlasG("Skóre musí být 1 až 30.", 3000);
      return;
    }
    await kartaStavZmen(
      K.id,
      {vlU: Object.keys(U).length ? U : null},
      `${K.n}: ${KDBVL[a] || a} ${U[a] ?? v0} – záchrany, dovednosti, útoky a AC přepočítány.`,
    );
    return;
  }
  const iv = T("[data-kinv]");
  if (iv) {
    const i = +iv.dataset.kinv,
      inv = [...(S.inv || K.vybaveni || [])].map(x => Object.assign({}, x));
    if (!inv[i]) return;
    const q0 = +inv[i].q || 1;
    inv[i].q = Math.max(0, inv[i].q + +iv.dataset.d);
    /* váha je za celý počet: s počtem se přepočítá (2026-10-23) */
    if (inv[i].w && inv[i].q > 0 && typeof kLb === "function") inv[i].w = kLbTxt((kLb(inv[i].w) / q0) * inv[i].q);
    if (!inv[i].q && confirm(`Odebrat ${inv[i].n} z vybavení?`)) inv.splice(i, 1);
    else inv[i].q = Math.max(inv[i].q, 0);
    kartaStavZmen(K.id, {inv});
    return;
  }
  const od = T("[data-kodp]");
  if (od) {
    kartaOdpocinek(K, od.dataset.kodp === "d");
    return;
  }
  if (T("[data-ksmaz]") && GMV) {
    if (!confirm(`Smazat kartu ${K.n}? Stav postavy se smaže taky.`)) return;
    try {
      await KDB.smaz(K.id);
      const i = KARTY.findIndex(x => x.id === K.id);
      if (i >= 0) KARTY.splice(i, 1);
      delete KARTBY[K.id];
      delete KST[K.id];
      navTo("#karty");
    } catch (err) {
      mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
    }
    return;
  }
  const kz = T("[data-kzrz]");
  if (kz) {
    const zb = kz.closest(".kbar,.kdbhp,.kzrb") || v,
      val = Math.round(+((zb.querySelector("[data-kzrv]") || {}).value || 0)),
      typ = (zb.querySelector("[data-kzrt]") || {}).value || "";
    if (!(val > 0)) {
      mmHlasG("Zadej počet HP.", 2000);
      return;
    }
    const o = {hp: S.hp, thp: S.thp, ds: S.ds},
      k = kz.dataset.kzrz,
      hp0 = S.hp != null ? +S.hp : mxHp(K);
    let m;
    if (k === "z") {
      const h0 = ((BOJ.s && BOJ.s.aktivni && BOJ.s.hraci) || []).find(x => bojKartaH(x) === K);
      const zr = (K.imu || []).includes(typ) ? 0 : kOdol(K).includes(typ) ? Math.floor(val / 2) : val;
      if (h0) {
        bojPCZmena(h0.id, x => bojZranPC(x, K, val, typ, false), true);
        const hp = kartaStav(K.id).hp;
        if (zr > 0 && kKonDrzi(K) && (hp == null || hp > 0)) {
          KKON[K.id] = bojKonDC(zr);
          kartyPrekresli();
        }
        return;
      }
      m = bojZranPC(o, K, val, typ, false);
      if (zr > 0 && kKonDrzi(K) && (o.hp == null || o.hp > 0)) KKON[K.id] = bojKonDC(zr);
      else if (o.hp === 0 && kKonDrzi(K)) kKonZtrata(K, "pád na 0 HP");
    } else if (k === "l") {
      m = bojLecPC(o, K, val);
      /* v boji léčení umírajícího stabilizuje (Artikule: do konce boje mimo hru), mimo boj se probere */
      const vBoji = ((BOJ.s && BOJ.s.aktivni && BOJ.s.hraci) || []).some(x => bojKartaH(x) === K);
      if (!vBoji && o.ds && o.ds.st !== "mrtev" && o.hp > 0) {
        o.ds = null;
        m = `+${val} HP: probral se (${o.hp}/${mxHp(K)})`;
      }
    } else {
      o.thp = Math.max(+S.thp || 0, val);
      m = `dočasné HP ${o.thp}`;
    }
    const ch = {hp: o.hp != null && o.hp < mxHp(K) ? o.hp : null, thp: o.thp || null};
    if ((o.ds || null) !== (S.ds || null)) ch.ds = o.ds || null;
    if (k === "z" && o.hp === 0 && hp0 > 0) ch.vycerp = Math.min(10, (+S.vycerp || 0) + 1); // Artikule: pád na 0 HP = 1 úroveň vyčerpání
    kartaStavZmen(K.id, ch, `${K.n}: ${m}.`);
    return;
  }
  /* hody proti smrti mimo boj (karta: ds) */
  const kDs0 = () => ({u: 0, n: 0});
  const kds = T("[data-kds]");
  if (kds) {
    const a = kds.dataset.kds,
      mx = mxHp(K);
    if (a === "pad") {
      if (!confirm(`${K.n} padl na 0 HP? Bezvědomí, hody proti smrti a 1 úroveň vyčerpání.`)) return;
      kartaStavZmen(K.id, {hp: 0, thp: null, ds: kDs0(), vycerp: Math.min(10, (+S.vycerp || 0) + 1)}, `${K.n}: padl na 0 HP.`);
      kHodZapis({k: K.id, kdo: K.n, co: "Padl na 0 HP", txt: "bezvědomí, hody proti smrti, vyčerpání +1"});
      if (kKonDrzi(K)) kKonZtrata(K, "pád na 0 HP");
      return;
    }
    if (a === "x") {
      kartaStavZmen(
        K.id,
        {ds: null, hp: S.ds && S.ds.st === "stab" ? (mx > 1 ? 1 : null) : (S.hp ?? null)},
        `${K.n}: ${S.ds && S.ds.st === "stab" ? "probral se s 1 HP" : "hody proti smrti zrušeny"}.`,
      );
      return;
    }
    let d = null;
    if (a === "hod") {
      const r = await kartaHod(K, "Hod proti smrti", 0, {adv: 0});
      d = r.d;
    }
    const r = bojDs(S.ds, a === "hod" ? "hod" : a === "stab" ? "u" : a, a === "hod" ? d : a === "stab" ? 3 : 1);
    const ch = {};
    if (a === "stab") {
      r.ds = {u: 3, n: (S.ds || {}).n || 0, st: "stab"};
      r.m = "stabilizován";
    }
    if (!r.ds) {
      ch.ds = null;
      ch.hp = mx > 1 ? 1 : null;
    } else ch.ds = r.ds;
    if (a !== "hod") kHodZapis({k: K.id, kdo: K.n, co: "Hod proti smrti", txt: r.m || a});
    kartaStavZmen(K.id, ch, `${K.n}: ${r.m || a}.`);
    return;
  }
  /* kostka životů po jedné (krátký odpočinek) */
  const kzh = T("[data-kkzh]");
  if (kzh) {
    const pool = kKostkyPool(K),
      kzMax = pool.length || kLv(K),
      spent = +S.kz || 0,
      mx = mxHp(K),
      cur = S.hp != null ? +S.hp : mx;
    if (spent >= kzMax || cur >= mx) return;
    const s = pool[spent] || 8,
      d = bK(s),
      con = kMod((K.vl || {}).CON || 10),
      heal = Math.max(0, d + con),
      hp = Math.min(mx, cur + heal);
    kHodZapis({k: K.id, kdo: K.n, co: "Kostka životů", tot: heal, txt: `d${s} ${d} ${bsg(con)} CON → +${heal} HP (${hp}/${mx})`});
    kartaStavZmen(K.id, {kz: spent + 1, hp: hp >= mx ? null : hp}, `${K.n}: kostka životů d${s} ${d} ${bsg(con)} = +${heal} HP (${hp}/${mx}).`);
    return;
  }
});
const mxHp = K => kHPmax(K);
/* boj: změna postavy s kartou – životy a zdroje do karty, hody proti smrti a stavy do boje; pád na 0 = 1 úroveň vyčerpání (Artikule) */
function bojPCZmena(hid, fn, hlas) {
  const S = BOJ.s || {},
    h0 = (S.hraci || []).find(x => x.id === hid),
    K = bojKartaH(h0);
  if (!h0 || !K) return;
  const ks = kartaStav(K.id);
  const o = {hp: ks.hp, thp: ks.thp, ds: h0.ds ? JSON.parse(JSON.stringify(h0.ds)) : undefined, stav: h0.stav ? [...h0.stav] : undefined};
  const msg = fn(o) || "";
  const ch = {};
  if ((o.hp ?? null) !== (ks.hp ?? null)) ch.hp = o.hp != null && o.hp < kHPmax(K) ? o.hp : null;
  if ((o.thp ?? null) !== (ks.thp ?? null)) ch.thp = o.thp || null;
  if (!h0.ds && o.ds && !o.ds.st) ch.vycerp = Math.min(10, (+ks.vycerp || 0) + 1);
  if (Object.keys(ch).length) kartaStavZmen(K.id, ch);
  if (JSON.stringify(o.ds ?? null) !== JSON.stringify(h0.ds ?? null) || JSON.stringify(o.stav ?? null) !== JSON.stringify(h0.stav ?? null))
    bojHracAkce(hid, h => {
      if (o.ds) h.ds = o.ds;
      else delete h.ds;
      if (o.stav && o.stav.length) h.stav = o.stav;
      else delete h.stav;
    });
  if (GMV) bojLog(hid, {n: "Zranění", ai: null, ci: hid, zt: msg}, h0.n);
  if (hlas !== false && msg) mmHlasG(`${h0.n}: ${msg}${ch.vycerp ? " · vyčerpání " + ch.vycerp : ""}.`, 6000);
  return msg;
}

if (window.MMDB)
  kartyNacti().then(ch => {
    if (ch && curView === "boj") renderBoj();
  });
setTimeout(() => {
  try {
    ukStart();
  } catch (e) {}
  try {
    hraStart();
  } catch (e) {}
}, 1500);
/* karty a herní záznam se obnovují, když je stránka otevřená (nepřekreslí se, když hráč zrovna píše) */
let KPOLL = null;
/* obnovu karet a hodů obstarává puls (25-puls.js): jeden dotaz na všechno, s Realtime žádný */
function kartyStart() {
  if (KPOLL) return;
  KPOLL = true;
  if (window.MMDB) pulsStart();
}
/* ===== Karta: úprava posledního hodu, kostky v textech schopností, Zpět, spodní lišta na telefonu (2026-10-17) ===== */
/* ---- úprava hodu d20 po hodu: Bless / Guidance +1d4, Bane −1d4, Bardic Inspiration, přehození za hrdinskou inspiraci, Lucky ---- */
const KPOSL = {};
const kLucky = K => {
  const z = (typeof kZdroje === "function" ? kZdroje(K) : K.zdroje || []).find(q => /^luck(y| points?)\b/i.test(q.n));
  if (z) {
    const u = Math.min(z.max, (kartaStav(K.id).zdr || {})[z.n] || 0);
    return {z, zb: z.max - u};
  }
  return [...(K.rysy || []), ...(K.rysy2 || []).map(r => r.n)].some(n => /^lucky$/i.test(String(n).trim())) ? {z: null, zb: 1} : null;
};
function kUpravHod(r, typ, arg) {
  r = Object.assign({}, r, {upr: [...(r.upr || [])], mods: [...(r.mods || [])]});
  let pop = "";
  if (typ === "b4" || typ === "m4" || typ === "bard") {
    const st = typ === "bard" ? +arg || 6 : 4,
      x = bK(st),
      zn = typ === "m4" ? -1 : 1;
    r.mods.push(zn * x);
    pop = `${typ === "b4" ? "Bless/Guidance +1d4" : typ === "m4" ? "Bane −1d4" : `Bardic Inspiration +1d${st}`} (${x})`;
  } else if (typ === "prec") {
    const st = +arg || 8,
      x = bK(st);
    r.mods.push(x);
    pop = `Precision Attack +1d${st} (${x})`;
  } else if (typ === "sd") {
    const st = +String((arg && arg.k) || "d8").replace(/^d/, "") || 8,
      x = bK(st);
    r.mods.push(x);
    pop = `${(arg && arg.n) || "kostka převahy"} +1d${st} (${x})`;
  } else if (typ === "insp") {
    const n = bK(20);
    if (!r.v || r.d2 == null) {
      pop = `hrdinská inspirace: přehozeno ${r.d1} → ${n}`;
      r.d1 = n;
    } else {
      const prvni = r.v > 0 ? r.d1 >= r.d2 : r.d1 <= r.d2;
      pop = `hrdinská inspirace: přehozena kostka ${prvni ? r.d1 : r.d2} → ${n}`;
      if (prvni) r.d1 = n;
      else r.d2 = n;
    }
  } else if (typ === "luck") {
    if (r.v < 0) {
      r.v = 0;
      pop = `Lucky: nevýhoda zrušena (platí ${r.d1})`;
    } else {
      r.d2 = bK(20);
      r.v = 1;
      pop = `Lucky: výhoda, druhá kostka ${r.d2}`;
    }
  }
  r.d = r.v > 0 && r.d2 != null ? Math.max(r.d1, r.d2) : r.v < 0 && r.d2 != null ? Math.min(r.d1, r.d2) : r.d1;
  r.tot = r.d + (+r.b || 0) + r.mods.reduce((a, x) => a + x, 0);
  r.krit = !!r.utok && r.d >= (r.kmin || 20);
  r.mis = !!r.utok && r.d === 1;
  r.upr.push(pop);
  return {r, pop};
}
function kPoslBox(K) {
  const P = KPOSL[K.id];
  if (!P || Date.now() - P.cas > 15 * 60e3 || !kMuze(K)) return "";
  const S = kartaStav(K.id),
    L = kLucky(K);
  return `<div class="kposl" role="group" aria-label="Úprava posledního hodu"><span class="kposlh"><small>Poslední hod</small> <b>${besc(P.co)}</b> <b class="khtot${P.krit ? " bkr" : P.mis ? " bmis" : ""}">${P.tot}</b>${P.upr.length ? ` <small>původně ${P.puv} · ${besc(P.upr.join(" · "))}</small>` : ""}</span>
    <span class="bojbtn">${kNabidkaHtml(kHodNabidka(K, P.co, P.pri), "data-kupr")}
      ${S.insp ? `<button type="button" class="gbtn ghost" data-kupr="insp" ${btip("Heroic Inspiration: přehodíš kostku d20 a platí nový hod; inspirace se spotřebuje")}>↻ Přehodit (inspirace)</button>` : ""}
      ${L && P.v <= 0 && L.zb > 0 ? `<button type="button" class="gbtn ghost" data-kupr="luck" ${btip(`Lucky: utratíš Luck Point a hod má výhodu${L.z ? ` (zbývá ${L.zb})` : ""}; proti nevýhodě ji zruší`)}>Lucky – výhoda</button>` : ""}
      <button type="button" class="kx" data-kposlx aria-label="Zavřít úpravy hodu">×</button></span></div>`;
}
async function kPoslUprav(K, typ) {
  const P = KPOSL[K.id];
  if (!P) return;
  const S = kartaStav(K.id);
  if (typ === "insp" && !S.insp) {
    mmHlasG("Postava nemá hrdinskou inspiraci.", 3000);
    return;
  }
  const L = typ === "luck" ? kLucky(K) : null;
  if (typ === "luck" && (!L || L.zb <= 0)) {
    mmHlasG("Lucky: nezbývá Luck Point.", 3000);
    return;
  }
  const N = kHodNabidka(K, P.co, P.pri);
  if (typ === "bard" && !N.bard) return;
  if (typ === "sd" && !N.sd) return;
  const {r, pop} = kUpravHod(P, typ, typ === "sd" ? N.sd : N.st),
    old = P.tot;
  Object.assign(P, r);
  P.pri = [
    ...(P.pri || []),
    ...(typ === "bard" ? [N.bard] : typ === "m4" ? ["Bane"] : typ === "b4" ? [N.bless ? "Bless" : "Guidance"] : typ === "sd" ? ["sd"] : []),
  ];
  if (typ === "bard") await kBardSpotrebuj(K, N.bard);
  if (typ === "sd") await kZdrUtrat(K, kSD(K));
  if (typ === "insp") await kartaStavZmen(K.id, {insp: null});
  if (L && L.z) {
    const U = Object.assign({}, kartaStav(K.id).zdr || {});
    U[L.z.n] = (U[L.z.n] || 0) + 1;
    await kartaStavZmen(K.id, {zdr: U});
  }
  const H = {
    k: K.id,
    kdo: K.n,
    co: ("Úprava – " + P.co).slice(0, 80),
    tot: Math.max(-50, Math.min(999, P.tot)),
    d: P.d,
    txt: `${pop}: ${old} → ${P.tot}${P.krit ? " · kritický zásah" : P.mis ? " · minutí" : ""}`.slice(0, 300),
  };
  if (P.krit) H.krit = true;
  if (P.mis) H.mis = true;
  if (P.skryty) {
    HODY.unshift(Object.assign({id: Date.now(), cas: new Date().toISOString(), skryty: true}, H));
    kartyPrekresli();
  } else kHodZapis(H);
  let pozn = "";
  const was = {mis: old != null && r.upr.length === 1 ? P.mis0 : undefined};
  if (P.utok && P.ut != null && P.mis1 === undefined) P.mis1 = null;
  if (P.utok && P.ut != null && P.bylMis && !P.mis) {
    const at = kUtoky(K)[P.ut],
      E = (K.efekty || []).filter((x, i) => (KEF[K.id] || []).includes(i));
    if (at && at.z) {
      const zr = kartaZraneni(K, at, P.krit, E);
      kHodZapis({
        k: K.id,
        kdo: K.n,
        co: `Zranění – ${at.n}`,
        tot: zr.t,
        txt: `${zr.x}${P.krit ? " (kritický zásah)" : ""} ${BZRT[at.t] || at.t || ""}`,
      });
      pozn = ` · zranění ${zr.t}`;
    }
  } else if (P.utok && P.krit && !P.bylKrit) pozn = " · kritický zásah – zranění hoď znovu tlačítkem krit";
  P.bylMis = P.mis;
  P.bylKrit = P.krit;
  mmHlasG(`${K.n}: ${P.co} ${old} → ${P.tot} (${pop})${pozn}`, 6500);
  kartyPrekresli();
}
/* ---- kostky v textech schopností: „1d6“, „2d8 + your Strength modifier“, „1d10 + your Fighter level“ ---- */
const KTXAB = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
  str: "STR",
  dex: "DEX",
  agi: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
function kTxtMod(K, t) {
  t = String(t).trim().toLowerCase();
  let m;
  if (/^\d+$/.test(t)) return +t;
  if ((m = t.match(/^(?:your\s+|the\s+)?(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+modifier$/)))
    return kMod((K.vl || {})[KTXAB[m[1]]] || 10);
  if (/^(?:your\s+)?spellcasting ability modifier$/.test(t)) {
    const a =
      KTXAB[
        String((K.kouzla || {}).vl || "")
          .toLowerCase()
          .slice(0, 3)
      ] || KTXAB[String((K.kouzla || {}).vl || "").toLowerCase()];
    return a ? kMod((K.vl || {})[a] || 10) : null;
  }
  if (/^(?:your\s+)?proficiency bonus$/.test(t)) return +K.zdatnost || 2;
  if ((m = t.match(/^(?:your\s+)?([a-z]+)\s+level$/))) {
    const c = m[1];
    if (c === "character") return +K.uroven || 1;
    const q = String(K.povolani || "").match(new RegExp("\\b" + c + "\\b[^\\d/]*(\\d+)", "i"));
    return q
      ? +q[1]
      : String(K.povolani || "").split("/").length < 2 && new RegExp("\\b" + c + "\\b", "i").test(K.povolani || "")
        ? +K.uroven || null
        : null;
  }
  if (/^(?:your\s+)?level$/.test(t)) return +K.uroven || 1;
  return null;
}
const KTXRE =
  /\b(\d*d(?:4|6|8|10|12|100))\b((?:\s*(?:\+|−|-|plus|minus)\s*(?:\d+\b|(?:your|the)\s+(?:strength|dexterity|constitution|intelligence|wisdom|charisma)\s+modifier|(?:your\s+)?spellcasting ability modifier|(?:your\s+)?proficiency bonus|(?:your\s+)?(?:[a-z]+\s+)?level))*)/gi;
function kTxtKostky(K, t, co) {
  return besc(String(t || ""))
    .replace(KTXRE, (all, dk, rest) => {
      let v = dk.toLowerCase();
      const parts = [
        ...String(rest || "").matchAll(
          /\s*(\+|−|-|plus|minus)\s*((?:\d+\b|(?:your|the)\s+\w+\s+modifier|(?:your\s+)?spellcasting ability modifier|(?:your\s+)?proficiency bonus|(?:your\s+)?(?:[a-z]+\s+)?level))/gi,
        ),
      ];
      let pouz = "";
      for (const p of parts) {
        const x = kTxtMod(K, p[2]);
        if (x == null) break;
        const zn = /^(-|−|minus)$/i.test(p[1]) ? -1 : 1;
        v += (zn * x < 0 ? "-" : "+") + Math.abs(x);
        pouz += p[0];
      }
      return `<button type="button" class="kkost" data-ktxh="${besc(v)}" data-ktxco="${besc(String(co || "").slice(0, 70))}" ${btip(`Hodit ${v}`)}>🎲 ${dk}${pouz}</button>${all.slice(dk.length + pouz.length)}`;
    })
    .replace(/\n/g, "<br>");
}
/* ---- Zpět: poslední změny životů, slotů, zdrojů, kostek životů, inspirace, účinků a vybavení na tomto zařízení ---- */
const KZPET = {},
  KZPF = {
    hp: "životy",
    thp: "dočasné HP",
    zdr: "sloty a zdroje",
    kz: "kostky životů",
    insp: "inspirace",
    uc: "účinky",
    vycerp: "vyčerpání",
    mun: "munice",
    stavy: "stavy",
    inv: "vybavení",
    pri: "přídavky",
    port: "předzvěst",
  };
function kZpetZapis(id, ch) {
  const S = kartaStav(id),
    k = Object.keys(ch).filter(x => x in KZPF && JSON.stringify(S[x] ?? null) !== JSON.stringify(ch[x] ?? null));
  if (!k.length) return;
  const Z = (KZPET[id] = KZPET[id] || []),
    now = Date.now(),
    last = Z[Z.length - 1],
    prev = last && now - last.cas < 1500 ? last : null,
    e = prev || {prev: {}, cas: now};
  k.forEach(x => {
    if (!(x in e.prev)) e.prev[x] = S[x] == null ? null : JSON.parse(JSON.stringify(S[x]));
  });
  e.cas = now;
  e.popis = [
    ...new Set(
      Object.keys(e.prev)
        .map(x => KZPF[x])
        .filter(Boolean),
    ),
  ].join(", ");
  if (!prev) Z.push(e);
  if (Z.length > 15) Z.shift();
}
function kZpetBtn(K, mal) {
  const Z = KZPET[K.id] || [],
    e = Z[Z.length - 1];
  if (!e || !kMuze(K)) return "";
  return `<button type="button" class="${mal ? "kbox kzpetb" : "kdbbtn"}" data-kzpet ${btip(`Vrátit poslední změnu: ${e.popis}`)}>${mal ? "<small>Zpět</small><b>↶</b>" : "↶ Zpět"}</button>`;
}
async function kZpet(K) {
  const Z = KZPET[K.id] || [],
    e = Z.pop();
  if (!e) return;
  await kartaStavZmen(K.id, e.prev, `${K.n}: vráceno – ${e.popis}.`, {bezZpet: true});
  kHodZapis({k: K.id, kdo: K.n, co: "Zpět", txt: `vráceno: ${e.popis}`});
}
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  if (!T("#kartyview,#bojpult,[data-kid]")) return;
  const tx = T("[data-ktxh]");
  if (tx) {
    const K = kvK(tx);
    if (!K) return;
    if (!kMuze(K)) {
      mmHlasG("Za tuto postavu hází její hráč.", 3000);
      return;
    }
    await kVlastniHod(K.n, K.id, tx.dataset.ktxh, tx.dataset.ktxco || tx.dataset.ktxh, false);
    return;
  }
  const K = kvK(e.target);
  if (!K) return;
  const up = T("[data-kupr]");
  if (up) {
    await kPoslUprav(K, up.dataset.kupr);
    return;
  }
  if (T("[data-kposlx]")) {
    delete KPOSL[K.id];
    kartyPrekresli();
    return;
  }
  if (T("[data-kzpet]")) {
    await kZpet(K);
    return;
  }
});
/* ---- boj: úprava hodu na útok před odesláním vypravěči ---- */
function bojJaUprHtml(K, hid) {
  const O = GMV && hid ? BGMU[hid] || {} : BJU,
    H = hid ? ` data-bph="${besc(hid)}"` : "",
    ser = O.serie || [],
    dice = ser.length && ser[0].d1 != null,
    S = K ? kartaStav(K.id) : {},
    L = K ? kLucky(K) : null,
    i = Math.min(+O.ui || 0, Math.max(0, ser.length - 1)),
    x = ser[i];
  return `<div class="bjur bjupr" role="group" aria-label="Úprava hodu na útok"><small>Upravit hod${ser.length > 1 ? `</small> <select data-juui${H} aria-label="Který útok">${ser.map((q, j) => `<option value="${j}"${j === i ? " selected" : ""}>${j + 1}. útok (${q.hod})</option>`).join("")}</select><small>` : ""}:</small>
    ${kNabidkaHtml(kHodNabidka(K, "Útok", x ? x.pdn : []), "data-juupr", H)}
    ${dice && S.insp ? `<button type="button" class="gbtn ghost" data-juupr="insp"${H} ${btip("Heroic Inspiration: přehodí d20, inspirace se spotřebuje")}>↻ Přehodit (inspirace)</button>` : ""}${dice && L && L.zb > 0 && x && x.v <= 0 ? `<button type="button" class="gbtn ghost" data-juupr="luck"${H} ${btip("Lucky: výhoda za Luck Point")}>Lucky</button>` : ""}${(() => {
      const SD = x && x.vys === "vedle" && x.d !== 1 && K ? kSD(K) : null;
      return SD && SD.zb > 0 && kManMa(K, "Precision Attack")
        ? `<button type="button" class="gbtn ghost" data-juupr="prec"${H} ${btip(`Precision Attack: přičte 1${SD.k} k hodu na útok (kostka převahy, zbývá ${SD.zb})`)}>+1${SD.k} Precision</button>`
        : "";
    })()}</div>`;
}
async function bojJaUprav(typ, hid) {
  const F = bojForm(hid),
    {s, me, O} = F;
  if (!me) return;
  const K = F.K,
    c = (s.npc || []).find(o => o.id === (O.cil || O.ci));
  const BJU = O; /* dál pracuje s formulářem F.O – u vypravěče je to BGMU[hid] */
  const i0 = Math.min(+BJU.ui || 0, Math.max(0, (BJU.serie || []).length - 1)),
    N = kHodNabidka(K, "Útok", ((BJU.serie || [])[i0] || {}).pdn);
  if (typ === "bard" && !N.bard) return;
  if (typ === "bard") await kBardSpotrebuj(K, N.bard);
  if (!(BJU.serie && BJU.serie.length)) {
    if (BJU.hod === "" || !/^(b4|m4|bard)$/.test(typ)) return;
    const st = typ === "bard" ? N.st : 4,
      x = bK(st),
      zn = typ === "m4" ? -1 : 1;
    BJU.hod = String(+BJU.hod + zn * x);
    BJU.info = `${BJU.info ? BJU.info + " · " : ""}${typ === "b4" ? "Bless +1d4" : typ === "m4" ? "Bane −1d4" : `Bardic +1d${st}`} (${x}) → ${BJU.hod}`;
    bojListPrekresli();
    return;
  }
  const i = Math.min(+BJU.ui || 0, BJU.serie.length - 1),
    q = BJU.serie[i];
  if (typ === "insp" && !(K && kartaStav(K.id).insp)) return;
  const L = typ === "luck" ? K && kLucky(K) : null;
  if (typ === "luck" && (!L || L.zb <= 0)) return;
  if (q.d1 == null && /^(insp|luck)$/.test(typ)) return;
  const SDp = typ === "prec" && K ? kSD(K) : null;
  if (typ === "prec" && !(SDp && SDp.zb > 0)) return;
  const {r, pop} = kUpravHod(
      {d1: q.d1, d2: q.d2, v: q.v, b: q.b, mods: q.mods, upr: q.upr, utok: true, kmin: BJU.kmin || 20},
      typ,
      SDp ? +SDp.k.slice(1) : N.st,
    ),
    old = q.hod;
  if (SDp) await kZdrUtrat(K, SDp);
  const pouz = typ === "bard" ? N.bard : typ === "m4" ? "Bane" : typ === "b4" ? "Bless" : null,
    n = Object.assign({}, q, {
      d1: r.d1,
      d2: r.d2,
      v: r.v,
      mods: r.mods,
      upr: r.upr,
      d: r.d,
      hod: r.tot,
      krit: r.krit,
      pdn: [...(q.pdn || []), ...(pouz ? [pouz] : [])],
    }),
    ct = (s.npc || []).find(o => o.id === q.ci) || c;
  n.vys = F.gm
    ? n.d === 1
      ? "vedle"
      : n.krit
        ? "kritický zásah"
        : (() => {
            const AC = bojCilAC(s, me, ct, bojFormZbr(F));
            return AC == null ? null : n.hod >= AC ? "zásah" : "vedle";
          })()
    : bojJaZas(ct, n.hod, n.d, n.krit);
  BJU.serie[i] = n;
  /* zbraň: zranění se hází jen po zásahu – když úprava změní minutí na zásah (nebo zásah na kritický), zranění se hodí teď; zásah na minutí ho vynuluje */
  let pz = "";
  const misN = n.vys === "vedle",
    misQ = q.vys === "vedle";
  if (n.dz && n.dz.z) {
    const hod = kr => {
      const D = n.dz,
        k =
          D.rz != null
            ? (() => {
                const m = String(D.z).match(/([+-]\d+)$/),
                  c0 = m ? +m[1] : 0;
                return {t: Math.max(0, D.rz + c0), x: `${D.rz} (ručně)${c0 ? (c0 > 0 ? "+" : "") + c0 : ""}`};
              })()
            : bojKostky(D.z, kr),
        ek = (D.ez || []).map(x => bojKostky(x, kr)).filter(Boolean);
      n.dmg = (k ? k.t : 0) + (n.d === 1 ? 0 : (+D.plus || 0) + ek.reduce((a, x) => a + x.t, 0));
      n.zx = k ? `${k.x}${D.plus ? ` +${D.plus}` : ""}${ek.map(x => " + " + x.x).join("")}` : "";
    };
    if (misN && !misQ) {
      if (+q.dmg > 0) {
        n.dmg0 = q.dmg;
        n.zx0 = q.zx;
      }
      n.dmg = 0;
      n.zx = "";
      pz = " – vedle, zranění se nepočítá";
    } else if (!misN && (misQ || !(+q.dmg > 0))) {
      if (n.dmg0 != null && !n.krit) {
        n.dmg = n.dmg0;
        n.zx = n.zx0;
      } else hod(n.krit);
      pz = ` – zásah, zranění ${n.zx} = ${n.dmg}`;
    } else if (n.krit !== !!q.krit) {
      hod(n.krit);
      pz = ` – ${n.krit ? "kritický zásah" : "už ne kritický"}, zranění ${n.zx} = ${n.dmg}`;
    }
  } else
    pz =
      n.krit && !q.krit
        ? " – kritický zásah: zranění oprav (dvojnásob kostek)"
        : !n.krit && q.krit
          ? " – už ne kritický: zranění oprav"
          : q.d === 1 && n.d !== 1 && !(+q.dmg > 0)
            ? " – zranění doplň"
            : "";
  if (i === 0) {
    BJU.hod = String(n.hod);
    BJU.d = String(n.d);
    BJU.dmg = String(n.dmg);
  }
  if (typ === "insp") await kartaStavZmen(K.id, {insp: null});
  if (L && L.z) {
    const U = Object.assign({}, kartaStav(K.id).zdr || {});
    U[L.z.n] = (U[L.z.n] || 0) + 1;
    await kartaStavZmen(K.id, {zdr: U});
  }
  BJU.info = `${BJU.info ? BJU.info + " · " : ""}${BJU.serie.length > 1 ? `${i + 1}. útok: ` : ""}${pop}: ${old} → ${n.hod}${pz}`;
  bojListPrekresli();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-juupr]");
  if (b) {
    bojJaUprav(b.dataset.juupr, b.dataset.bph);
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-juui]")) {
    bojForm(t.dataset.bph).O.ui = +t.value || 0;
    bojListPrekresli();
  }
});
