-- Mundus Mutatus · databáze odhalování (Supabase / PostgreSQL 15+)
--
-- Vložte celý soubor do Supabase → SQL Editor → Run. Lze spustit opakovaně (nic nesmaže).
-- Na konci je příkaz, který z vašeho účtu udělá vypravěče (GM) – doplňte do něj svůj e‑mail.
--
-- Jak to funguje
--   obsah   – úplná data rodů, osob, vazeb, rodokmenů a míst pro každou větev webu (main, dev).
--             Nahrává je build na Netlify (tajným klíčem). Číst je smí jen vypravěč.
--   stavy   – co družina zná: 0 = skryté, 1 = slyšeli, 2 = potkali. Mění je jen vypravěč.
--   snimek  – hráčský výřez obsahu podle stavů. Veřejně čitelný; nikdy neobsahuje nic skrytého.
--             Přepočítává se sám při každé změně stavu nebo nahrání obsahu.
--   denik   – záznam změn stavů (pro budoucí „Novinky“). Čte jen vypravěč.
--
-- Značky v datech (vyrábí je build.py, viz zdroj/obsah/NÁVOD.md):
--   {"$g": "id" | ["id",…], "$u": 1|2, …}  objekt (nebo prvek pole) jen pokud všechna id mají stav ≥ $u (výchozí 1)
--   {"$g": …, "$x": hodnota}               místo objektu se dosadí hodnota (podmíněný odkaz)
--   "$plne": {…}                           pole přidaná jen při stavu 2 (potkali)
--   v textu [[id|text]], [[id|text|jinak]], [[?id|text]], [[!id|text]]

create table if not exists public.obsah (
  vetev   text primary key,
  hrac    jsonb not null,
  gm      jsonb not null,
  nahrano timestamptz not null default now()
);

create table if not exists public.stavy (
  id      text primary key,
  stav    smallint not null check (stav in (0, 1, 2)),
  zmeneno timestamptz not null default now()
);

create table if not exists public.snimek (
  vetev   text primary key,
  data    jsonb not null,
  verze   bigint not null default 1,
  zmeneno timestamptz not null default now()
);

create table if not exists public.denik (
  n    bigserial primary key,
  id   text not null,
  stav smallint not null,
  kdy  timestamptz not null default now()
);

create table if not exists public.gm (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.obsah  enable row level security;
alter table public.stavy  enable row level security;
alter table public.snimek enable row level security;
alter table public.denik  enable row level security;
alter table public.gm     enable row level security;

-- Je přihlášený uživatel vypravěč?
create or replace function public.mm_je_gm() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.gm where user_id = auth.uid())
$$;

drop policy if exists "snimek: čte každý" on public.snimek;
create policy "snimek: čte každý" on public.snimek for select to anon, authenticated using (true);
drop policy if exists "obsah: čte vypravěč" on public.obsah;
create policy "obsah: čte vypravěč" on public.obsah for select to authenticated using (public.mm_je_gm());
drop policy if exists "stavy: čte vypravěč" on public.stavy;
create policy "stavy: čte vypravěč" on public.stavy for select to authenticated using (public.mm_je_gm());
drop policy if exists "denik: čte vypravěč" on public.denik;
create policy "denik: čte vypravěč" on public.denik for select to authenticated using (public.mm_je_gm());
drop policy if exists "gm: vidí sebe" on public.gm;
create policy "gm: vidí sebe" on public.gm for select to authenticated using (user_id = auth.uid());
-- Zápisy přímo do tabulek nejsou povoleny nikomu kromě tajného klíče; vše jde přes funkce níže.

-- Nejnižší stav ze skupiny id (chybějící id = skryté; prázdná skupina = viditelné)
create or replace function public.mm_uroven(s jsonb, g jsonb) returns int
language sql immutable as $$
  select coalesce(min(coalesce((s ->> x)::int, 0)), 2)
  from jsonb_array_elements_text(case jsonb_typeof(g) when 'array' then g else jsonb_build_array(g) end) as x
$$;

-- Zmínky v textu: [[id|text]] / [[id|text|jinak]] / [[?id|text]] / [[!id|text]]
create or replace function public.mm_zminky(t text, s jsonb) returns text
language plpgsql immutable as $$
declare
  m text[];
  lv int;
  nahrada text;
  vysledek text := t;
begin
  for m in select regexp_matches(t, '(\[\[([?!]?)([A-Za-z0-9_-]+)\|([^]|]*)(\|([^]]*))?\]\])', 'g') loop
    lv := coalesce((s ->> m[3])::int, 0);
    if m[2] = '' then
      nahrada := case when lv >= 1 then '[[' || m[3] || '|' || m[4] || ']]'
                      when m[5] is not null then m[6] else m[4] end;
    elsif m[2] = '?' then
      nahrada := case when lv >= 1 then m[4] else coalesce(m[6], '') end;
    else
      nahrada := case when lv >= 2 then m[4] else coalesce(m[6], '') end;
    end if;
    vysledek := replace(vysledek, m[1], nahrada);
  end loop;
  return vysledek;
end $$;

-- Hráčský výřez: projde data a vynechá vše, co družina nezná (vrací SQL NULL = vynechat)
create or replace function public.mm_orez(j jsonb, s jsonb) returns jsonb
language plpgsql immutable as $$
declare
  typ text := jsonb_typeof(j);
  lv int;
  plne jsonb;
begin
  if typ = 'object' then
    if j ? '$g' then
      lv := public.mm_uroven(s, j -> '$g');
      if lv < coalesce((j ->> '$u')::int, 1) then
        return null;
      end if;
      if j ? '$x' then
        return public.mm_orez(j -> '$x', s);
      end if;
      plne := j -> '$plne';
      j := j - '$g' - '$u' - '$plne';
      if plne is not null and jsonb_typeof(plne) = 'object' and lv >= 2 then
        j := j || plne;
      end if;
    end if;
    return coalesce((select jsonb_object_agg(k, x)
                       from (select k, public.mm_orez(v, s) as x from jsonb_each(j) as e(k, v)) q
                      where x is not null), '{}'::jsonb);
  elsif typ = 'array' then
    return coalesce((select jsonb_agg(x order by o)
                       from (select o, public.mm_orez(v, s) as x
                               from jsonb_array_elements(j) with ordinality as e(v, o)) q
                      where x is not null), '[]'::jsonb);
  elsif typ = 'string' and strpos(j #>> '{}', '[[') > 0 then
    return to_jsonb(public.mm_zminky(j #>> '{}', s));
  end if;
  return j;
end $$;

-- Přepočítá hráčské výřezy (všech větví, nebo jen jedné)
create or replace function public.mm_prepocitej(p_vetev text default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  s jsonb;
begin
  select coalesce(jsonb_object_agg(id, stav), '{}'::jsonb) into s from public.stavy;
  insert into public.snimek as sn (vetev, data, verze, zmeneno)
  select o.vetev, public.mm_orez(o.hrac, s), 1, now()
    from public.obsah o
   where p_vetev is null or o.vetev = p_vetev
  on conflict (vetev) do update
     set data = excluded.data, verze = sn.verze + 1, zmeneno = now();
end $$;

-- Vypravěč mění stavy: {"jindrich4": 2, "var": 0, …}. Vrátí nové stavy všech id.
create or replace function public.mm_nastav_stavy(p_zmeny jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  for r in select key as id, value::text::smallint as stav from jsonb_each(p_zmeny) loop
    if r.stav not in (0, 1, 2) then
      raise exception 'neplatný stav % pro %', r.stav, r.id;
    end if;
    insert into public.stavy (id, stav, zmeneno) values (r.id, r.stav, now())
    on conflict (id) do update set stav = excluded.stav, zmeneno = now()
    where public.stavy.stav is distinct from excluded.stav;
    if found then
      insert into public.denik (id, stav) values (r.id, r.stav);
    end if;
  end loop;
  perform public.mm_prepocitej(null);
  return (select coalesce(jsonb_object_agg(id, stav), '{}'::jsonb) from public.stavy);
end $$;

-- Vypravěč čte všechny stavy najednou (bez limitu počtu řádků)
create or replace function public.mm_stavy() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.mm_je_gm()
              then (select coalesce(jsonb_object_agg(id, stav), '{}'::jsonb) from public.stavy) end
$$;

-- Build na Netlify nahraje obsah větve; výchozí stavy (p_vychozi) zapíše jen pro nová id.
create or replace function public.mm_nahraj_obsah(p_vetev text, p_hrac jsonb, p_gm jsonb, p_vychozi jsonb)
returns bigint
language plpgsql security definer set search_path = public as $$
begin
  insert into public.obsah (vetev, hrac, gm, nahrano) values (p_vetev, p_hrac, p_gm, now())
  on conflict (vetev) do update set hrac = excluded.hrac, gm = excluded.gm, nahrano = now();
  insert into public.stavy (id, stav)
  select key, value::text::smallint from jsonb_each(coalesce(p_vychozi, '{}'::jsonb))
  on conflict (id) do nothing;
  perform public.mm_prepocitej(p_vetev);
  return (select verze from public.snimek where vetev = p_vetev);
end $$;

-- Práva: veřejnost smí jen číst snimek; vypravěč smí měnit stavy; nahrávat smí jen tajný klíč.
revoke all on function public.mm_prepocitej(text) from public, anon, authenticated;
revoke all on function public.mm_nahraj_obsah(text, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.mm_nastav_stavy(jsonb) from public, anon;
revoke all on function public.mm_stavy() from public, anon;
grant execute on function public.mm_stavy() to authenticated;
revoke all on function public.mm_orez(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.mm_zminky(text, jsonb) from public, anon, authenticated;
revoke all on function public.mm_uroven(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.mm_nastav_stavy(jsonb) to authenticated;
grant execute on function public.mm_je_gm() to anon, authenticated;
grant execute on function public.mm_prepocitej(text) to service_role;
grant execute on function public.mm_nahraj_obsah(text, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.mm_orez(jsonb, jsonb), public.mm_zminky(text, jsonb), public.mm_uroven(jsonb, jsonb) to service_role;

revoke insert, update, delete, truncate on public.obsah, public.stavy, public.snimek, public.denik, public.gm from anon, authenticated;
grant select on public.snimek to anon, authenticated;
grant select on public.obsah, public.stavy, public.denik, public.gm to authenticated;

-- ▼ Doplňte svůj e‑mail (účet založený v Authentication → Users) a spusťte:
-- insert into public.gm (user_id) select id from auth.users where email = 'VAS@EMAIL.CZ' on conflict do nothing;
