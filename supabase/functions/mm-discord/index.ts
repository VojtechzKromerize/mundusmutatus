// Discord → Mundus Mutatus: příkaz /hod ze serveru družiny.
// Discord volá tuto funkci (Interactions Endpoint URL); podpis ověří veřejný klíč aplikace. Postava se najde podle účtu
// Discord, kterým se hráč přihlásil na webu a vybral si postavu (hraci_ucty). Hod se zapíše do herního záznamu webu.
// Bonusy: z karty spočítané webem (stav.mods – zapisuje je prohlížeč hráče), jinak čísla z PDF.
// Tajemství (Supabase → Edge Functions → Secrets): DISCORD_PUBLIC_KEY, DISCORD_APP_ID, DISCORD_TOKEN (jen pro registraci příkazů).
// Registrace příkazů: vypravěč na webu (Hra → Discord) – POST ?registrace s přihlášením vypravěče.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const env = (k: string) => Deno.env.get(k) ?? "";
const hex = (s: string) => new Uint8Array((s.match(/../g) ?? []).map((b) => parseInt(b, 16)));
const db = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const VL: Record<string, string> = { STR: "STR", SIL: "STR", AGI: "AGI", DEX: "AGI", OBR: "AGI", CON: "CON", ODO: "CON", INT: "INT", WIS: "WIS", MOU: "WIS", CHA: "CHA", CHR: "CHA" };
const DOV = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation",
  "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];
const DOVCZ: Record<string, string> = { akrobacie: "Acrobatics", zvirata: "Animal Handling", arkana: "Arcana", atletika: "Athletics", klam: "Deception",
  historie: "History", vhled: "Insight", zastrasovani: "Intimidation", patrani: "Investigation", lekarstvi: "Medicine", priroda: "Nature",
  vnimani: "Perception", vystupovani: "Performance", presvedcovani: "Persuasion", nabozenstvi: "Religion", zrucnost: "Sleight of Hand",
  plizeni: "Stealth", nenapadnost: "Stealth", preziti: "Survival" };
const bez = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const k = (n: number) => 1 + Math.floor(Math.random() * n);
const sg = (n: number) => (n < 0 ? "−" + -n : "+" + n);

type Mods = { ov?: Record<string, number>; za?: Record<string, number>; dv?: Record<string, number>; in?: number };
// rozbor zadání: výraz s kostkami, nebo dovednost / vlastnost / záchrana / iniciativa (d20 + bonus z karty)
function rozbor(co: string, m: Mods, K: Record<string, any>) {
  const c = bez(co);
  const vyr = c.replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (vyr) {
    const n = Math.min(20, +(vyr[1] || 1)), s = Math.min(100, +vyr[2]), b = +(vyr[3] || 0), L = Array.from({ length: n }, () => k(s));
    const tot = L.reduce((a, x) => a + x, 0) + b;
    return { co: `${n}d${s}${b ? sg(b) : ""}`, tot, d: n === 1 && s === 20 ? L[0] : undefined, txt: `${L.join(" + ")}${b ? " " + sg(b) : ""} = ${tot}`, d20: false };
  }
  const zach = c.match(/^(zach\w*|save|zachrana)\s+(\w+)/);
  const ab = (t: string) => VL[t.toUpperCase().slice(0, 3)];
  if (zach && ab(zach[2])) { const a = ab(zach[2]); return { co: `Záchrana ${a}`, b: m.za?.[a] ?? K.zach?.[a] ?? 0, d20: true }; }
  if (/^(ini|iniciativ)/.test(c)) return { co: "Iniciativa", b: m.in ?? K.ini ?? 0, d20: true };
  if (c.length <= 3 && ab(c)) { const a = ab(c); const sk = K.vl?.[a]; return { co: `Ověření ${a}`, b: m.ov?.[a] ?? (sk ? Math.floor((sk - 10) / 2) : 0), d20: true }; }
  const dov = DOV.find((d) => bez(d).startsWith(c)) ?? Object.entries(DOVCZ).find(([cz]) => cz.startsWith(c.replace(/\s/g, "")))?.[1];
  if (dov) return { co: dov, b: m.dv?.[dov] ?? K.dov?.[dov] ?? 0, d20: true };
  return null;
}

async function hod(body: any) {
  const uid = body.member?.user?.id ?? body.user?.id;
  const opt = Object.fromEntries((body.data?.options ?? []).map((o: any) => [o.name, o.value]));
  const S = db();
  const { data: row } = await S.rpc("mm_discord_postava", { p_discord: uid });
  const kid = row?.id;
  if (!kid) return { content: "Nejdřív se na webu přihlas přes Discord a vyber si postavu (stránka Hra). Pak hody půjdou odsud.", flags: 64 };
  const K = row?.karta ?? {}, st = row?.stav ?? {}, m: Mods = st.mods ?? {};
  const r = rozbor(String(opt.co ?? "1d20"), m, K);
  if (!r) return { content: `Nerozumím „${opt.co}“. Zkus třeba \`1d20+3\`, \`Stealth\`, \`WIS\`, \`záchrana CON\` nebo \`iniciativa\`.`, flags: 64 };
  const jm = st.mods?.n ?? K.n ?? kid, adv = opt.vyhoda === "v" ? 1 : opt.vyhoda === "n" ? -1 : 0;
  let H: Record<string, unknown>;
  if (r.d20) {
    const d1 = k(20), d2 = adv ? k(20) : null, d = adv > 0 ? Math.max(d1, d2!) : adv < 0 ? Math.min(d1, d2!) : d1, b = +(r.b ?? 0), tot = d + b;
    H = { k: kid, kdo: jm, co: r.co, tot, d, txt: `d20 ${d1}${d2 != null ? ` / ${d2}` : ""} ${sg(b)} = ${tot}${adv ? (adv > 0 ? " · výhoda" : " · nevýhoda") : ""} · z Discordu`, src: "discord" };
    if (adv) H.adv = adv;
  } else H = { k: kid, kdo: jm, co: r.co, tot: r.tot, txt: `${r.txt} · z Discordu`, src: "discord" };
  const z = k(6);
  if (r.d20) H.zav = z;
  const { error: ch } = await S.rpc("mm_discord_hod", { p_hod: H });
  if (ch) throw new Error(ch.message);
  const zt = r.d20 ? ` · Závoj ${z}${z <= 2 ? " (Pokušení)" : z >= 5 ? " (Požehnání)" : ""}` : "";
  return { content: `**${jm}** · ${r.co}: **${H.tot}** — ${String(H.txt).replace(" · z Discordu", "")}${zt}`, allowed_mentions: { parse: [] } };
}

async function registrace(req: Request) {
  const t = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const U = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: `Bearer ${t}` } }, auth: { persistSession: false } });
  const { data: gm } = await U.rpc("mm_je_gm");
  if (gm !== true) return Response.json({ chyba: "jen pro vypravěče" }, { status: 403, headers: CORS });
  if (!env("DISCORD_APP_ID") || !env("DISCORD_TOKEN")) return Response.json({ chyba: "V Supabase chybí tajemství DISCORD_APP_ID nebo DISCORD_TOKEN." }, { status: 400, headers: CORS });
  const prikazy = [{
    name: "hod", description: "Hod kostkou za tvou postavu z Mundus Mutatus", type: 1,
    options: [
      { name: "co", description: "1d20+3, Stealth, WIS, záchrana CON, iniciativa…", type: 3, required: true },
      { name: "vyhoda", description: "výhoda nebo nevýhoda", type: 3, required: false, choices: [{ name: "výhoda", value: "v" }, { name: "nevýhoda", value: "n" }] },
    ],
  }];
  const r = await fetch(`https://discord.com/api/v10/applications/${env("DISCORD_APP_ID")}/commands`, {
    method: "PUT", headers: { Authorization: `Bot ${env("DISCORD_TOKEN")}`, "Content-Type": "application/json" }, body: JSON.stringify(prikazy),
  });
  return Response.json(r.ok ? { ok: true } : { chyba: `Discord: ${r.status} ${(await r.text()).slice(0, 200)}` }, { status: r.ok ? 200 : 502, headers: CORS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("jen POST", { status: 405 });
  if (new URL(req.url).searchParams.has("registrace")) return registrace(req);
  const sig = req.headers.get("x-signature-ed25519") ?? "", ts = req.headers.get("x-signature-timestamp") ?? "", raw = await req.text();
  if (!env("DISCORD_PUBLIC_KEY") || !sig || !ts) return new Response("chybí podpis", { status: 401 });
  try {
    const key = await crypto.subtle.importKey("raw", hex(env("DISCORD_PUBLIC_KEY")), { name: "Ed25519" }, false, ["verify"]);
    if (!(await crypto.subtle.verify("Ed25519", key, hex(sig), new TextEncoder().encode(ts + raw)))) return new Response("špatný podpis", { status: 401 });
  } catch { return new Response("špatný podpis", { status: 401 }); }
  const body = JSON.parse(raw);
  if (body.type === 1) return Response.json({ type: 1 });
  if (body.type === 2 && body.data?.name === "hod") {
    try { return Response.json({ type: 4, data: await hod(body) }); }
    catch (e) { return Response.json({ type: 4, data: { content: "Hod se nepovedl: " + String((e as Error).message ?? e).slice(0, 150), flags: 64 } }); }
  }
  return Response.json({ type: 4, data: { content: "Neznámý příkaz.", flags: 64 } });
});
