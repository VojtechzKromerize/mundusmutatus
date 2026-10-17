// Upozornění v telefonu (Web Push) pro Mundus Mutatus.
// Volá ho jen databáze (pg_net, funkce mm_push_posli) s hlavičkou x-mm-tajemstvi; pošle upozornění odběrům postav
// (a vypravěče) z tabulky push_odbery. Neplatné odběry (410/404) smaže.
// Nastavení (tajemství pro volání a klíče VAPID) leží v tabulce nastaveni (klic 'push'), kterou čte jen služba – žádná tajemství funkce.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const env = (k: string) => Deno.env.get(k) ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("jen POST", { status: 405 });
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const { data: n } = await db.from("nastaveni").select("hodnota").eq("klic", "push").maybeSingle();
  const cfg = (n?.hodnota ?? {}) as { tajemstvi?: string; vapid_pub?: string; vapid_priv?: string };
  if (!cfg.tajemstvi || req.headers.get("x-mm-tajemstvi") !== cfg.tajemstvi) return new Response("ne", { status: 401 });
  let d: { karty?: string[]; gm?: boolean; titul?: string; text?: string; url?: string };
  try { d = await req.json(); } catch { return new Response("špatný JSON", { status: 400 }); }
  const karty = (d.karty ?? []).filter((k) => /^[a-z0-9-]{1,40}$/.test(k));
  let q = db.from("push_odbery").select("endpoint,klice,karta,gm");
  q = d.gm ? (karty.length ? q.or(`gm.eq.true,karta.in.(${karty.join(",")})`) : q.eq("gm", true)) : q.in("karta", karty.length ? karty : ["-"]);
  const { data: L, error } = await q;
  if (error) return new Response(error.message, { status: 500 });
  webpush.setVapidDetails("mailto:noreply@mundusmutatus.netlify.app", cfg.vapid_pub ?? "", cfg.vapid_priv ?? "");
  const zprava = JSON.stringify({ titul: d.titul ?? "Mundus Mutatus", text: d.text ?? "", url: d.url ?? "#hra", tag: d.url ?? "mm" });
  let ok = 0;
  const pryc: string[] = [];
  await Promise.all((L ?? []).map(async (o) => {
    try {
      await webpush.sendNotification({ endpoint: o.endpoint, keys: o.klice }, zprava, { TTL: 600, urgency: "high" });
      ok++;
    } catch (e) {
      const st = (e as { statusCode?: number }).statusCode;
      if (st === 404 || st === 410) pryc.push(o.endpoint);
    }
  }));
  if (pryc.length) await db.from("push_odbery").delete().in("endpoint", pryc);
  return Response.json({ odeslano: ok, smazano: pryc.length });
});
