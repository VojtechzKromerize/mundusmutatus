/* ===== Ruční kostky (2026-10-29, Vojta): „Házím vlastními kostkami“ =====
   Přepínač je u Hodu kostkou (kHodForm). Je-li zapnutý, hody d20 z karty, hody proti smrti, iniciativa a ověření NPC vypravěče
   se před hodem zeptají na výsledek kostek hozených u stolu (okno `mmRucOkno`). Zadaná čísla se uloží do fronty a stávající kód hodu
   je převezme ve funkci bK (11): zadaná kostka se nehází ani nepřehrává ve 3D; prázdné pole hodí web jako dřív.
   Fronta se sama zruší po dokončení synchronní části obsluhy (setTimeout 0), takže nespotřebovaná čísla nepřeskočí do jiného hodu. */
const MMRUC = {q: null, t: 0};
function mmRucZap() {
  try {
    return localStorage.getItem("mm-ruc") === "1";
  } catch (e) {
    return false;
  }
}
function mmRucNastav(on) {
  try {
    localStorage.setItem("mm-ruc", on ? "1" : "0");
  } catch (e) {}
  document.querySelectorAll("[data-mmruc]").forEach(x => {
    x.checked = on;
  });
}
/* další zadaná hodnota pro kostku o s stěnách, jinak null (hodí web); prázdné pole ve frontě je null = hodí web */
function mmRucVezmi(s) {
  const a = MMRUC.q && MMRUC.q[s];
  if (!a || !a.length) return null;
  const v = a.shift();
  return v == null ? null : v;
}
/* okno s kostkami k zadání: spec = {popis, kostky: [{s: stěn, n: kolik, lbl: popisek}]}; vrátí frontu {s: [čísla|null]} nebo null (zrušeno) */
function mmRucOkno(spec) {
  return new Promise(res => {
    const dlg = document.createElement("dialog");
    dlg.className = "mmruc";
    const radky = spec.kostky
      .flatMap(k =>
        [...Array(k.n || 1)].map(
          (_, j) =>
            `<label class="mmrucr"><span>${k.n > 1 ? `${besc(k.t || "d" + k.s)} ${j + 1}.` : besc(k.t || "d" + k.s)}${k.lbl ? ` <small>${besc(k.lbl)}</small>` : ""}</span>` +
            `<input type="number" inputmode="numeric" min="1" max="${k.s}" data-mmrucs="${k.s}" placeholder="padlo"></label>`,
        ),
      )
      .join("");
    dlg.innerHTML = `<form method="dialog" class="mmrucf"><h3>${besc(spec.popis)}</h3><p class="mmrucn">Zadej, co padlo na kostkách. Prázdné pole hodí web.</p>${radky}<p class="mmruce" role="alert" hidden></p><div class="mmrucb"><button type="button" class="gbtn ghost" data-mmrucz>Zrušit</button><button type="submit" class="gbtn">Potvrdit</button></div></form>`;
    document.body.appendChild(dlg);
    const konec = q => {
      if (dlg.open) dlg.close();
      dlg.remove();
      res(q);
    };
    dlg.querySelector("[data-mmrucz]").addEventListener("click", () => konec(null));
    dlg.addEventListener("cancel", e => {
      e.preventDefault();
      konec(null);
    });
    dlg.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      const q = {};
      let chyba = "";
      dlg.querySelectorAll("[data-mmrucs]").forEach(inp => {
        const s = +inp.dataset.mmrucs,
          raw = inp.value.trim(),
          n = bRucN(raw, 1, s);
        inp.classList.toggle("bad", raw !== "" && n == null);
        if (raw !== "" && n == null) chyba = `d${s} musí být 1–${s}.`;
        (q[s] = q[s] || []).push(n);
      });
      const er = dlg.querySelector(".mmruce");
      er.hidden = !chyba;
      er.textContent = chyba;
      if (chyba) return;
      konec(q);
    });
    dlg.showModal();
    const p = dlg.querySelector("input");
    if (p) p.focus();
  });
}
/* před hodem: je-li ruční režim zapnutý, zeptá se; vrátí false při zrušení, jinak true a fronta platí do konce synchronní obsluhy.
   Vypnutý režim neudělá nic a nečeká (hod zůstává synchronní). Použití v async obsluze: `if (mmRucZap() && !(await mmRucPred(spec))) return;` */
async function mmRucPred(spec) {
  const q = await mmRucOkno(spec);
  if (!q) return false;
  MMRUC.q = q;
  clearTimeout(MMRUC.t);
  MMRUC.t = setTimeout(() => {
    MMRUC.q = null;
  }, 0);
  return true;
}
/* synchronní místo hodu: fn se provede hned (režim vypnutý), nebo po zadání kostek (promise) */
function mmRucS(spec, fn) {
  if (!mmRucZap()) return fn();
  return mmRucPred(spec).then(ok => (ok ? fn() : undefined));
}
document.addEventListener("change", e => {
  if (e.target.matches && e.target.matches("[data-mmruc]")) mmRucNastav(e.target.checked);
});
