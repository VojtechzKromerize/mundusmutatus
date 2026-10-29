/* ===== Hledání v pravidlech (2026-10-29, Vojta): jeden rejstřík Artikulí, stavů, pojmů, Pravidel SRD, kouzel, předmětů, vybavení,
   doplňků mimo SRD (vlastní shrnutí) a pro vypravěče i nestvůr. Používá ho šuplík Pravidla na Hře (výsledek se ukáže přímo
   v šuplíku, boj zůstane otevřený) a hledání v záhlaví (výsledek v okně). Porovnávání je v čistém 10g-hledej.js.
   Plné texty jen pro přihlášené (featy, Střelec) se nehledají – v rejstříku jsou jen veřejná shrnutí. ===== */
let HLI = null,
  HLIP = null;
const hlCap = s => String(s || "").replace(/^./, c => c.toUpperCase());
/* rejstřík se skládá jednou za návštěvu, až při prvním hledání (data se načtou líně, každé nezávisle) */
function hlIndex() {
  if (HLI) return Promise.resolve(HLI);
  const zkus = f =>
    typeof f === "function"
      ? Promise.resolve()
          .then(f)
          .catch(() => null)
      : null;
  return (HLIP =
    HLIP ||
    Promise.all([zkus(srdNacti), zkus(kzNacti), zkus(predNacti), zkus(vybNacti), zkus(mimoNacti), GMV ? zkus(netvNacti) : null]).then(() => {
      HLI = hlSestav();
      return HLI;
    }));
}
function hlSestav() {
  const I = [],
    P = o => I.push(hlZaznam(o));
  /* Artikule a pojmy Artikulí */
  ARTK.forEach(k =>
    (k.secs || []).forEach(s =>
      P({
        g: "Artikule",
        n: s.t,
        s: k.t,
        h: `#artikule/${k.id}/${s.id}`,
        txt: hlTxt(s.h),
        html: () => `<h3>${s.t}</h3><p class="rsmall">Artikule › ${besc(k.t)}</p><div class="hlart">${s.h}</div>`,
      }),
    ),
  );
  GLOSS.forEach(g =>
    P({
      g: "Pojem",
      n: g.t,
      al: g.f,
      s: "pojem Artikulí",
      h: "#artikule/pojmy/p-" + g.id,
      txt: hlTxt(g.d),
      html: () => `<h3>${besc(g.t)}</h3><p>${g.d}</p>`,
    }),
  );
  /* stavy SRD (české jméno a anglické v závorce) */
  if (typeof SRDST !== "undefined")
    Object.entries(SRDST).forEach(([k, v]) =>
      P({
        g: "Stav",
        n: hlCap(k),
        en: v.en,
        s: "stav",
        txt: v.t,
        html: () => `<h3>${besc(hlCap(k))} <small lang="en">${besc(v.en)}</small></h3><p>${besc(hlCap(v.t))}.</p>`,
      }),
    );
  /* Pravidla SRD po oddílech (h3 se svými h4, každé h4 zvlášť) */
  ((SRDP && SRDP.kap) || []).forEach(k =>
    hlOddily(k.h).forEach(o => {
      const t = hlTxt(o.html);
      P({
        g: "Pravidla SRD",
        n: o.n,
        s: o.p ? `${k.n} › ${o.p}` : k.n,
        h: `#pravidla/${k.id}/${o.id}`,
        txt: t.length > 6000 ? t.slice(0, 6000) : t,
        html: () => `<p class="rsmall">${besc(o.p ? `${k.n} › ${o.p}` : k.n)}</p><div class="srdtext">${o.html}</div>`,
      });
    }),
  );
  /* kouzla (SRD i vypravěčova), magické předměty, vybavení */
  (typeof KZ !== "undefined" && KZ ? KZ : []).forEach(x =>
    P({
      g: "Kouzlo",
      n: x.cz || x.en,
      en: x.en,
      s: `${x.l ? x.l + ". stupeň" : "trik"} · ${x.s || ""}`,
      txt: x.t || "",
      html: () => kzKarta(x, false),
    }),
  );
  (typeof PRED !== "undefined" && PRED ? PRED : []).forEach(x =>
    P({
      g: "Magický předmět",
      n: x.cz ? hlCap(x.cz) : x.en,
      en: x.en,
      s: [x.druh, x.vz].filter(Boolean).join(" · "),
      h: "#pravidla/predmety",
      txt: x.t || "",
      html: () => predKarta(x),
    }),
  );
  if (typeof VYB !== "undefined" && VYB)
    VYBSK.forEach(([sk, skn]) =>
      (VYB[sk] || []).forEach(x =>
        P({
          g: "Vybavení",
          n: x.cz ? hlCap(x.cz) : x.en,
          en: x.en,
          s: [skn, x.cena].filter(Boolean).join(" · "),
          h: `#pravidla/vybaveni/vyb-${x.id}`,
          txt: [x.pop, x.t, x.typ].filter(Boolean).join(" "),
          html: () => vybKarta(x, false),
        }),
      ),
    );
  /* doplňky mimo SRD: jen vlastní shrnutí (Licence v CLAUDE.md) */
  if (typeof MIMO !== "undefined" && MIMO) {
    const M = (o, s, id, telo) =>
      P({
        g: "Doplněk mimo SRD",
        n: o.cz || o.en,
        en: o.en,
        s,
        h: `#pravidla/mimo/mimo-${id}`,
        txt: hlTxt(telo),
        html: () => `<h3>${besc(o.cz || o.en)} <small lang="en">${besc(o.en)}</small></h3><p class="rsmall">${besc(s)}</p>${telo}`,
      });
    (MIMO.podtridy || []).forEach(p =>
      M(
        p,
        `podtřída · ${(KTR[p.tr] || {}).cz || p.tr}`,
        p.id,
        `<p>${besc(p.t || "")}</p><ul class="kfeat">${(p.rysy || []).map(r => `<li><b>${besc(r.cz || r.en)}</b> <small lang="en">${besc(r.en)}</small>${r.u ? ` <small>· ${r.u}. úroveň</small>` : ""}<br>${kzIn(r.t || "")}</li>`).join("")}</ul>`,
      ),
    );
    (MIMO.featy || []).forEach(f => M(f, "feat", slugMimo(f.en), `<p>${kzIn(f.t || "")}</p>`));
    (MIMO.zazemi || []).forEach(z => M(z, "zázemí", "zazemi", `<p>${kzIn(z.t || "")}</p>`));
    (MIMO.druhy || []).forEach(d =>
      M(
        d,
        "druh",
        "druhy",
        `<p>${besc(d.t || "")}</p><ul class="kfeat">${(d.rysy || []).map(r => `<li><b>${besc(r.cz || r.en)}</b> <small lang="en">${besc(r.en)}</small><br>${kzIn(r.t || "")}</li>`).join("")}</ul>`,
      ),
    );
    POVOLSHR.forEach(p => M(p, "povolání", "povolani", `<p>${besc(p.t)}</p>`));
  }
  /* nestvůry SRD – jen vypravěč */
  if (GMV && typeof NETV !== "undefined" && NETV)
    NETV.forEach(x =>
      P({
        g: "Nestvůra",
        n: x.n,
        s: x.vy ? `výzva ${String(x.vy).split(" ")[0]}` : "",
        h: "#pravidla/netvori",
        txt: "",
        html: () => `<h3>${besc(x.n)}</h3><div class="bsb">${x.h}</div>`,
      }),
    );
  return I;
}
/* výsledky a detail: skupiny s nadpisy, každá položka je tlačítko s pořadím v rejstříku */
function hlVysledkyHtml(R, q) {
  if (!R.length) return `<p class="rsmall hlnic">Nic nenalezeno pro „${besc(q)}“. Zkus jiné slovo, český i anglický název.</p>`;
  return hlSkupiny(R)
    .map(
      ([g, L]) =>
        `<h4 class="hlg">${besc(g)}</h4><ul class="hlres">${L.map(
          e =>
            `<li><button type="button" data-hli="${HLI.indexOf(e)}"><b>${besc(e.n)}</b>${e.en && e.en !== e.n ? ` <small lang="en">${besc(e.en)}</small>` : ""}${e.s ? `<small class="hls">${besc(e.s)}</small>` : ""}</button></li>`,
        ).join("")}</ul>`,
    )
    .join("");
}
function hlDetailHtml(e, zpet) {
  let h = "";
  try {
    h = e.html();
  } catch (x) {
    h = `<p>${besc(e.txt || "")}</p>`;
  }
  return `<div class="hldet">${zpet ? `<button type="button" class="gbtn ghost hlzpet" data-hlzpet>← Výsledky</button>` : ""}${h}${e.h ? `<p class="rsmall"><a href="${e.h}">Otevřít v ${e.g === "Artikule" || e.g === "Pojem" ? "Artikulích" : "Pravidlech"} →</a></p>` : ""}</div>`;
}
/* stav hledání je jeden pro celou stránku (HLS): pole v šuplíku Pravidla i v listu Pravidla na kartě se kreslí z něj, takže
   překreslení karty (puls, tah) hledání ani otevřený výsledek nesmaže */
const HLS = {q: "", d: -1};
function hlObsah() {
  if (hlNorm(HLS.q).length < 2) return "";
  if (!HLI) {
    hlIndex().then(hlObnov);
    return `<p class="rsmall">Načítám pravidla…</p>`;
  }
  if (HLS.d >= 0 && HLI[HLS.d]) return hlDetailHtml(HLI[HLS.d], true);
  return hlVysledkyHtml(hlHledej(HLI, HLS.q), HLS.q);
}
function hlBoxHtml(cls) {
  const o = hlObsah();
  return `<div class="hlbox${cls ? " " + cls : ""}${o ? " hlon" : ""}"><input type="search" data-hl name="hl-${cls || "x"}" value="${besc(HLS.q)}" placeholder="Hledat v pravidlech – stav, akce, kouzlo, předmět…" aria-label="Hledat v pravidlech" autocomplete="off" enterkeyhint="search"><div class="hlvys"${o ? "" : " hidden"}>${o}</div><p class="rsmall hlnap"${o ? " hidden" : ""}>Artikule, stavy, pojmy, Pravidla SRD, kouzla, předměty a vybavení – česky i anglicky.</p></div>`;
}
/* překreslí jen výsledky ve všech polích hledání na stránce (ne celou kartu) */
function hlObnov() {
  const o = hlObsah();
  document.querySelectorAll(".hlbox").forEach(box => {
    const out = box.querySelector(".hlvys"),
      inp = box.querySelector("[data-hl]");
    if (inp && document.activeElement !== inp && inp.value !== HLS.q) inp.value = HLS.q;
    box.classList.toggle("hlon", !!o);
    const nap = box.querySelector(".hlnap");
    if (nap) nap.hidden = !!o;
    if (out) {
      out.hidden = !o;
      out.innerHTML = o;
      if (o && typeof pojmyStrana === "function") pojmyStrana(out);
    }
  });
}
document.addEventListener("input", e => {
  const inp = e.target.closest && e.target.closest("[data-hl]");
  if (!inp) return;
  clearTimeout(hlObnov.t);
  hlObnov.t = setTimeout(() => {
    HLS.q = inp.value.trim();
    HLS.d = -1;
    hlObnov();
  }, 140);
});
document.addEventListener("keydown", e => {
  const inp = e.target.closest && e.target.closest("[data-hl]");
  if (inp && e.key === "Escape" && inp.value) {
    /* nejdřív vymazat hledání, šuplík zavře až další Escape */
    e.stopImmediatePropagation();
    inp.value = "";
    HLS.q = "";
    HLS.d = -1;
    hlObnov();
  }
});
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const b = T(".hlbox [data-hli]");
  if (b && HLI) {
    HLS.d = +b.dataset.hli;
    hlObnov();
    const box = b.closest(".hlbox") || document.querySelector(".hlbox"),
      sc = box && (box.closest(".bprg") || null);
    if (sc) sc.scrollTop = 0;
    else if (box) box.scrollIntoView({block: "start", behavior: "smooth"});
    return;
  }
  if (T(".hlbox [data-hlzpet]")) {
    HLS.d = -1;
    hlObnov();
  }
});
/* hledání v záhlaví (07): pravidla, která rejstřík záhlaví nemá (Artikule a pojmy tam jsou vlastní) – výsledek v okně */
function hlGlobal(q, znovu) {
  if (hlNorm(q).length < 2) return "";
  if (!HLI) {
    hlIndex().then(() => znovu && znovu());
    return `<li class="none">Načítám pravidla…</li>`;
  }
  return hlHledej(HLI, q, 40)
    .filter(e => e.g !== "Artikule" && e.g !== "Pojem")
    .slice(0, 8)
    .map(
      e =>
        `<li><button type="button" data-ghl="${HLI.indexOf(e)}"><span class="gk">${besc(e.g)}</span><b>${besc(e.n)}${e.en && e.en !== e.n ? ` <small lang="en">${besc(e.en)}</small>` : ""}</b><small>${besc(e.s || "")}</small></button></li>`,
    )
    .join("");
}
function hlOkno(i) {
  const e = HLI && HLI[i];
  if (!e) return;
  mmPop(hlDetailHtml(e, false));
  const p = document.querySelector(".mmpop .mmpopin");
  if (p && typeof pojmyStrana === "function") pojmyStrana(p);
}
