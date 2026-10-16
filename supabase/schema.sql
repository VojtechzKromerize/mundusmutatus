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
--   denik   – záznam změn stavů (z něj vznikají Novinky). Čte jen vypravěč.
--   zaznamy – texty rodů, osob, Kroniky, míst… (zdroj pravdy). Upravuje je vypravěč na webu;
--             soubory v repozitáři jsou záloha (denní záloha z webu, změny ze souborů se přenesou).
--   zaznamy_historie – předchozí verze textů (lze obnovit).
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

create table if not exists public.zaznamy (
  soubor   text primary key,                 -- cesta v zdroj/obsah, např. osoby/140-jindrich4.md
  md       text not null,
  md_hash  text,                             -- otisk textu při posledním souladu se soubory v gitu
  web      boolean not null default false,   -- upraveno na webu od poslední zálohy
  smazano  boolean not null default false,   -- smazáno na webu (záloha soubor odstraní)
  upraveno timestamptz not null default now()
);

create table if not exists public.zaznamy_historie (
  n      bigserial primary key,
  soubor text not null,
  md     text,
  akce   text not null,
  kdy    timestamptz not null default now()
);
create index if not exists zaznamy_historie_soubor on public.zaznamy_historie (soubor, n desc);

create table if not exists public.nastaveni (
  klic    text primary key,
  hodnota jsonb not null,
  zmeneno timestamptz not null default now()
);

create table if not exists public.boj (
  id      text primary key,
  stav    jsonb not null,
  verze   bigint not null default 1,
  zmeneno timestamptz not null default now()
);

-- karty postav (import listu z PDF D&D Beyond) a jejich trvalý stav (životy, zdroje, vybavení…); čte každý, zapisuje se jen přes funkce
create table if not exists public.karty (
  id      text primary key,
  karta   jsonb,
  stav    jsonb not null default '{}'::jsonb,
  verze   bigint not null default 1,
  zmeneno timestamptz not null default now()
);
-- herní záznam: hody z karet postav (ověření, záchrany, útoky, kouzla); čte každý
create table if not exists public.hody (
  id   bigserial primary key,
  cas  timestamptz not null default now(),
  data jsonb not null
);

-- ukázky pro hráče: obrázek, dopis nebo mapka, které vypravěč pošle na telefony; čte každý
create table if not exists public.ukazky (
  id   bigserial primary key,
  cas  timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.gm (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.obsah  enable row level security;
alter table public.stavy  enable row level security;
alter table public.snimek enable row level security;
alter table public.denik  enable row level security;
alter table public.gm     enable row level security;
alter table public.nastaveni enable row level security;
alter table public.boj enable row level security;
alter table public.karty enable row level security;
alter table public.hody enable row level security;
alter table public.ukazky enable row level security;
alter table public.zaznamy enable row level security;
alter table public.zaznamy_historie enable row level security;
alter table public.obsah add column if not exists gen text;

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
drop policy if exists "karty: čte každý" on public.karty;
create policy "karty: čte každý" on public.karty for select to anon, authenticated using (true);
drop policy if exists "hody: čte každý" on public.hody;
create policy "hody: čte každý" on public.hody for select to anon, authenticated using (true);
drop policy if exists "ukazky: čte každý" on public.ukazky;
create policy "ukazky: čte každý" on public.ukazky for select to anon, authenticated using (true);
drop policy if exists "boj: čte každý" on public.boj;
create policy "boj: čte každý" on public.boj for select to anon, authenticated using (true);
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
  doplnek jsonb;
begin
  select coalesce(jsonb_object_agg(id, stav), '{}'::jsonb) into s from public.stavy;
  -- herní stav (datum, hodina, poloha družiny) a novinky: jen to, co družina právě zná
  doplnek := jsonb_build_object(
    'HRA', (select hodnota from public.nastaveni where klic = 'hra'),
    'NOVINKY', (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'stav', q.stav, 'kdy', q.kdy) order by q.kdy desc), '[]'::jsonb)
                  from (select d.id, d.stav, d.kdy
                          from (select distinct on (id) id, stav, kdy from public.denik order by id, kdy desc) d
                          join public.stavy st on st.id = d.id
                         where d.stav >= 1 and st.stav >= 1 and d.kdy > now() - interval '120 days'
                         order by d.kdy desc limit 60) q));
  insert into public.snimek as sn (vetev, data, verze, zmeneno)
  select o.vetev, public.mm_orez(o.hrac, s) || doplnek, 1, now()
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

-- Vypravěč nastavuje herní stav: {"datum":"1458-03-03","hodina":10,"misto":"Praha","praha":16}
-- (předchozí hodina se uloží sama, aby ručička na Úvodu mohla dojet z minulé polohy)
create or replace function public.mm_nastav_hru(p_hra jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  stara jsonb;
  nova jsonb;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  select hodnota into stara from public.nastaveni where klic = 'hra';
  nova := coalesce(stara, '{}'::jsonb) || (p_hra - 'hodinaPred');
  if stara is not null and (stara -> 'hodina') is distinct from (nova -> 'hodina') then
    nova := nova || jsonb_build_object('hodinaPred', stara -> 'hodina');
  end if;
  insert into public.nastaveni (klic, hodnota, zmeneno) values ('hra', nova, now())
  on conflict (klic) do update set hodnota = excluded.hodnota, zmeneno = now();
  perform public.mm_prepocitej(null);
  return nova;
end $$;

-- Tracker iniciativy: vypravěč ukládá celý stav boje (sloty, přiřazení, nepřátelé, kostka)
create or replace function public.mm_boj_uloz(p_stav jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  insert into public.boj as b (id, stav, verze, zmeneno) values ('aktivni', p_stav, 1, now())
  on conflict (id) do update set stav = excluded.stav, verze = b.verze + 1, zmeneno = now()
  returning verze into v;
  return v;
end $$;

-- Hráč si sám obsadí volný hráčský slot (bez přihlášení). Smí jen platný tah: volný slot hráčů
-- a postava, která v tomto kole ještě nejednala.
create or replace function public.mm_boj_obsad(p_slot int, p_hrac text) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  s jsonb;
  v bigint;
begin
  select stav into s from public.boj where id = 'aktivni' for update;
  if s is null or coalesce((s ->> 'aktivni')::boolean, false) = false then
    raise exception 'žádný boj neprobíhá';
  end if;
  if coalesce(s -> 'sloty' -> p_slot ->> 't', '') <> 'h' then
    raise exception 'tento slot nepatří hráčům';
  end if;
  if coalesce(s -> 'obsazeni', '{}'::jsonb) ? p_slot::text then
    raise exception 'slot už je obsazený';
  end if;
  if not exists (select 1 from jsonb_array_elements(coalesce(s -> 'hraci', '[]'::jsonb)) h where h ->> 'id' = p_hrac) then
    raise exception 'neznámá postava';
  end if;
  if exists (select 1 from jsonb_each_text(coalesce(s -> 'obsazeni', '{}'::jsonb)) o where o.value = p_hrac) then
    raise exception 'postava už v tomto kole jednala';
  end if;
  s := jsonb_set(s, '{obsazeni}', coalesce(s -> 'obsazeni', '{}'::jsonb) || jsonb_build_object(p_slot::text, p_hrac));
  update public.boj set stav = s, verze = verze + 1, zmeneno = now() where id = 'aktivni' returning verze into v;
  return v;
end $$;

-- Příprava boje: hráč si sám zapíše hod iniciativy své postavy (bez přihlášení), jen dokud boj nezačal.
create or replace function public.mm_boj_hod(p_hrac text, p_hod int) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  s jsonb;
  v bigint;
  i int;
begin
  select stav into s from public.boj where id = 'aktivni' for update;
  if s is null or coalesce((s ->> 'priprava')::boolean, false) = false or coalesce((s ->> 'aktivni')::boolean, false) then
    raise exception 'boj se právě nepřipravuje';
  end if;
  if p_hod is null or p_hod < -10 or p_hod > 50 then
    raise exception 'neplatný hod';
  end if;
  select (h.ord - 1)::int into i from jsonb_array_elements(coalesce(s -> 'hraci', '[]'::jsonb)) with ordinality h(val, ord) where h.val ->> 'id' = p_hrac;
  if i is null then
    raise exception 'neznámá postava';
  end if;
  s := jsonb_set(s, array['hraci', i::text, 'hod'], to_jsonb(p_hod));
  update public.boj set stav = s, verze = verze + 1, zmeneno = now() where id = 'aktivni' returning verze into v;
  return v;
end $$;

-- Boj: celé číslo v rozmezí (nebo nic) – pomocník pro kontrolu vstupů od hráčů
create or replace function public.mm_cislo(v jsonb, lo int, hi int) returns boolean
language sql immutable as $$
  select v is null or jsonb_typeof(v) = 'null'
    or (jsonb_typeof(v) = 'number' and (v #>> '{}') ~ '^-?[0-9]{1,4}$' and (v #>> '{}')::int between lo and hi)
$$;

-- Boj: hráč z telefonu u své postavy – stavy, kryt, hody proti smrti, připravená akce, reakce (jen během přípravy nebo boje, jen povolené hodnoty)
create or replace function public.mm_boj_hrac(p_hrac text, p_pole text, p_hodnota jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  s jsonb;
  v bigint;
  i int;
  x jsonb := coalesce(p_hodnota, 'null'::jsonb);
begin
  select stav into s from public.boj where id = 'aktivni' for update;
  if s is null or not (coalesce((s ->> 'aktivni')::boolean, false) or coalesce((s ->> 'priprava')::boolean, false)) then
    raise exception 'žádný boj neprobíhá';
  end if;
  select (h.ord - 1)::int into i from jsonb_array_elements(coalesce(s -> 'hraci', '[]'::jsonb)) with ordinality h(val, ord) where h.val ->> 'id' = p_hrac;
  if i is null then
    raise exception 'neznámá postava';
  end if;
  if p_pole = 'stav' then
    if jsonb_typeof(x) = 'null' or x = '[]'::jsonb then
      s := s #- array['hraci', i::text, 'stav'];
    elsif jsonb_typeof(x) = 'array' and jsonb_array_length(x) <= 16 and not exists (
        select 1 from jsonb_array_elements(x) e
        where jsonb_typeof(e) <> 'string' or not ((e #>> '{}') = any (array['sražen','omráčen','zadržen','chycen','oslepen','ohlušen','neviditelný','otrávený','vyděšený','okouzlen','neschopný','ochromen','zkamenělý','úhyb','soustředí']))) then
      s := jsonb_set(s, array['hraci', i::text, 'stav'], x);
    else
      raise exception 'neplatné stavy';
    end if;
  elsif p_pole = 'kryt' then
    if jsonb_typeof(x) = 'null' or x = '0'::jsonb then
      s := s #- array['hraci', i::text, 'kryt'];
    elsif x = '2'::jsonb or x = '5'::jsonb then
      s := jsonb_set(s, array['hraci', i::text, 'kryt'], x);
    else
      raise exception 'neplatný kryt';
    end if;
  elsif p_pole = 'ds' then
    if jsonb_typeof(x) = 'null' then
      s := s #- array['hraci', i::text, 'ds'];
    elsif jsonb_typeof(x) = 'object'
        and not exists (select 1 from jsonb_object_keys(x) k where k not in ('u', 'n', 'st'))
        and jsonb_typeof(x -> 'u') = 'number' and (x ->> 'u') ~ '^[0-3]$'
        and jsonb_typeof(x -> 'n') = 'number' and (x ->> 'n') ~ '^[0-3]$'
        and (not (x ? 'st') or x ->> 'st' in ('stab', 'mrtev')) then
      s := jsonb_set(s, array['hraci', i::text, 'ds'], x);
    else
      raise exception 'neplatné hody proti smrti';
    end if;
  elsif p_pole = 'ready' then
    if jsonb_typeof(x) = 'null' or x = '""'::jsonb then
      s := jsonb_set(s, '{ready}', coalesce(s -> 'ready', '{}'::jsonb) - p_hrac);
    elsif jsonb_typeof(x) = 'string' and char_length(x #>> '{}') <= 160 then
      s := jsonb_set(s, '{ready}', coalesce(s -> 'ready', '{}'::jsonb) || jsonb_build_object(p_hrac, x));
    else
      raise exception 'neplatná připravená akce';
    end if;
  elsif p_pole in ('hp', 'thp') then
    if jsonb_typeof(x) = 'null' then
      s := s #- array['hraci', i::text, p_pole];
    elsif jsonb_typeof(x) = 'number' and public.mm_cislo(x, case when p_pole = 'hp' then -999 else 0 end, 999) then
      s := jsonb_set(s, array['hraci', i::text, p_pole], x);
    else
      raise exception 'neplatné životy';
    end if;
  elsif p_pole = 'zdr' then
    if jsonb_typeof(x) = 'null' or x = '{}'::jsonb then
      s := s #- array['hraci', i::text, 'zdr'];
    elsif jsonb_typeof(x) = 'object' and (select count(*) from jsonb_object_keys(x)) <= 24 and not exists (
        select 1 from jsonb_each(x) e where char_length(e.key) > 60 or jsonb_typeof(e.value) <> 'number' or not public.mm_cislo(e.value, 0, 20)) then
      s := jsonb_set(s, array['hraci', i::text, 'zdr'], x);
    else
      raise exception 'neplatné zdroje';
    end if;
  elsif p_pole = 'zbrane' then
    if coalesce(s -> 'hraci' -> i ->> 'n', '') = '' then
      raise exception 'postava nemá jméno';
    end if;
    if jsonb_typeof(x) = 'null' or x = '[]'::jsonb then
      s := jsonb_set(s, '{zbrane}', coalesce(s -> 'zbrane', '{}'::jsonb) - (s -> 'hraci' -> i ->> 'n'));
    elsif jsonb_typeof(x) = 'array' and jsonb_array_length(x) <= 12 and not exists (
        select 1 from jsonb_array_elements(x) e
        where jsonb_typeof(e) <> 'object'
          or exists (select 1 from jsonb_object_keys(e) k where k not in ('n', 'b', 'z', 't', 'drt', 'pru', 'dal'))
          or jsonb_typeof(e -> 'n') is distinct from 'string' or char_length(e ->> 'n') not between 1 and 40
          or not public.mm_cislo(e -> 'b', -5, 30)
          or (e ? 'z' and (jsonb_typeof(e -> 'z') <> 'string' or (e ->> 'z') !~ '^[0-9]{0,2}d[0-9]{1,3}([+-][0-9]{1,2})?$'))
          or (e ? 't' and coalesce(e ->> 't', '') not in ('Slashing','Piercing','Bludgeoning','Fire','Cold','Lightning','Thunder','Acid','Poison','Necrotic','Radiant','Psychic','Force'))
          or exists (select 1 from unnest(array['drt', 'pru', 'dal']) f where e ? f and jsonb_typeof(e -> f) <> 'boolean')) then
      s := jsonb_set(s, '{zbrane}', coalesce(s -> 'zbrane', '{}'::jsonb) || jsonb_build_object(s -> 'hraci' -> i ->> 'n', x));
    else
      raise exception 'neplatné zbraně';
    end if;
  elsif p_pole = 'reak' then
    if x = 'true'::jsonb then
      s := jsonb_set(s, '{reak}', coalesce(s -> 'reak', '{}'::jsonb) || jsonb_build_object(p_hrac, 1));
    else
      s := jsonb_set(s, '{reak}', coalesce(s -> 'reak', '{}'::jsonb) - p_hrac);
    end if;
  else
    raise exception 'neznámé pole';
  end if;
  update public.boj set stav = s, verze = verze + 1, zmeneno = now() where id = 'aktivni' returning verze into v;
  return v;
end $$;

-- Boj: hráč z telefonu pošle útok (cíl, čím, hod, zranění; plošně SO a záchrana). Vyhodnotí ho vypravěč, který zná AC nepřátel.
create or replace function public.mm_boj_utok(p_hrac text, p_utok jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  s jsonb;
  v bigint;
  u jsonb;
  ci jsonb;
  pl jsonb;
  x jsonb := coalesce(p_utok, '{}'::jsonb);
begin
  select stav into s from public.boj where id = 'aktivni' for update;
  if s is null or coalesce((s ->> 'aktivni')::boolean, false) = false then
    raise exception 'žádný boj neprobíhá';
  end if;
  if not exists (select 1 from jsonb_array_elements(coalesce(s -> 'hraci', '[]'::jsonb)) h where h ->> 'id' = p_hrac) then
    raise exception 'neznámá postava';
  end if;
  if jsonb_typeof(x) <> 'object' or exists (select 1 from jsonb_object_keys(x) k where k not in ('ci', 'cim', 'hod', 'd', 'adv', 'dmg', 't', 'drt', 'pru', 'plos', 'kmin')) then
    raise exception 'neplatný útok';
  end if;
  ci := x -> 'ci';
  if jsonb_typeof(ci) is distinct from 'array' or jsonb_array_length(ci) not between 1 and 12 or exists (
      select 1 from jsonb_array_elements(ci) e
      where jsonb_typeof(e) <> 'string' or not exists (select 1 from jsonb_array_elements(coalesce(s -> 'npc', '[]'::jsonb)) q where q ->> 'id' = e #>> '{}')) then
    raise exception 'neplatný cíl';
  end if;
  if not public.mm_cislo(x -> 'hod', -10, 60) or not public.mm_cislo(x -> 'd', 1, 20) or not public.mm_cislo(x -> 'adv', -1, 1) or not public.mm_cislo(x -> 'dmg', 0, 300) or not public.mm_cislo(x -> 'kmin', 15, 20)
     or (x ? 'cim' and (jsonb_typeof(x -> 'cim') <> 'string' or char_length(x ->> 'cim') > 60))
     or (x ? 't' and coalesce(x ->> 't', '') not in ('Slashing','Piercing','Bludgeoning','Fire','Cold','Lightning','Thunder','Acid','Poison','Necrotic','Radiant','Psychic','Force'))
     or (x ? 'drt' and jsonb_typeof(x -> 'drt') <> 'boolean') or (x ? 'pru' and jsonb_typeof(x -> 'pru') <> 'boolean') then
    raise exception 'neplatné hodnoty útoku';
  end if;
  pl := x -> 'plos';
  if pl is not null and jsonb_typeof(pl) <> 'null' then
    if jsonb_typeof(pl) <> 'object' or exists (select 1 from jsonb_object_keys(pl) k where k not in ('ab', 'dc', 'pol'))
       or coalesce(pl ->> 'ab', '') not in ('STR', 'AGI', 'CON', 'INT', 'WIS', 'CHA') or jsonb_typeof(pl -> 'dc') is distinct from 'number' or not public.mm_cislo(pl -> 'dc', 1, 40)
       or (pl ? 'pol' and jsonb_typeof(pl -> 'pol') <> 'boolean') then
      raise exception 'neplatný plošný útok';
    end if;
  else
    pl := null;
    if jsonb_typeof(x -> 'hod') is distinct from 'number' then
      raise exception 'chybí hod na útok';
    end if;
  end if;
  if (select count(*) from jsonb_array_elements(coalesce(s -> 'utoky', '[]'::jsonb)) e where e ->> 'h' = p_hrac and e ->> 'stav' = 'ceka') >= 5 then
    raise exception 'příliš mnoho útoků čeká na vypravěče';
  end if;
  u := jsonb_build_object('id', 'u' || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS') || (floor(random() * 900) + 100)::int, 'h', p_hrac, 'ci', ci,
    'cim', coalesce(x ->> 'cim', ''), 'hod', x -> 'hod', 'd', x -> 'd', 'adv', coalesce(x -> 'adv', '0'::jsonb), 'dmg', coalesce(x -> 'dmg', '0'::jsonb),
    't', coalesce(x -> 't', '"Slashing"'::jsonb), 'drt', coalesce(x -> 'drt', 'false'::jsonb), 'pru', coalesce(x -> 'pru', 'false'::jsonb),
    'kmin', coalesce(x -> 'kmin', '20'::jsonb), 'k', coalesce(s -> 'kolo', '1'::jsonb), 'stav', 'ceka');
  if pl is not null then
    u := u || jsonb_build_object('plos', jsonb_build_object('ab', pl -> 'ab', 'dc', pl -> 'dc', 'pol', coalesce(pl -> 'pol', 'false'::jsonb)));
  end if;
  s := jsonb_set(s, '{utoky}', (select coalesce(jsonb_agg(e order by o), '[]'::jsonb) from (
      select e, o from jsonb_array_elements(coalesce(s -> 'utoky', '[]'::jsonb) || jsonb_build_array(u)) with ordinality t(e, o) order by o desc limit 30) w));
  update public.boj set stav = s, verze = verze + 1, zmeneno = now() where id = 'aktivni' returning verze into v;
  return v;
end $$;

-- Karty postav: uložení importované karty (kdokoli z družiny; jen kontrola tvaru a velikosti), smazání jen vypravěč
create or replace function public.mm_karta_uloz(p_karta jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  k jsonb := coalesce(p_karta, '{}'::jsonb);
  i text := k ->> 'id';
begin
  if jsonb_typeof(k) <> 'object' or octet_length(k::text) > 200000 then
    raise exception 'neplatná karta';
  end if;
  if i is null or i !~ '^[a-z0-9-]{1,40}$' or jsonb_typeof(k -> 'n') is distinct from 'string' or char_length(k ->> 'n') not between 1 and 60
     or not public.mm_cislo(k -> 'ac', 1, 40) or jsonb_typeof(k -> 'ac') is distinct from 'number'
     or not public.mm_cislo(k -> 'hp', 1, 999) or jsonb_typeof(k -> 'hp') is distinct from 'number' then
    raise exception 'karta potřebuje id, jméno, AC a životy';
  end if;
  insert into public.karty (id, karta) values (i, k)
    on conflict (id) do update set karta = excluded.karta, verze = public.karty.verze + 1, zmeneno = now();
  return i;
end $$;

create or replace function public.mm_karta_smaz(p_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  delete from public.karty where id = p_id;
end $$;

-- Karty postav: trvalý stav (životy, dočasné HP, spotřebované zdroje a sloty, kostky životů, vyčerpání, inspirace, vybavení, peníze, poznámky)
create or replace function public.mm_karta_stav(p_id text, p_pole text, p_hodnota jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  x jsonb := coalesce(p_hodnota, 'null'::jsonb);
  ok boolean;
  v bigint;
begin
  if p_id is null or p_id !~ '^[a-z0-9-]{1,40}$' then
    raise exception 'neplatná karta';
  end if;
  ok := case p_pole
    when 'hp' then public.mm_cislo(x, -999, 999)
    when 'thp' then public.mm_cislo(x, 0, 999)
    when 'kz' then public.mm_cislo(x, 0, 40)
    when 'vycerp' then public.mm_cislo(x, 0, 10)
    when 'insp' then jsonb_typeof(x) in ('boolean', 'null')
    when 'zdr' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'object' and (select count(*) from jsonb_object_keys(x)) <= 40
      and not exists (select 1 from jsonb_each(x) e where char_length(e.key) > 60 or jsonb_typeof(e.value) <> 'number' or not public.mm_cislo(e.value, 0, 30)))
    when 'inv' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'array' and jsonb_array_length(x) <= 300 and not exists (
      select 1 from jsonb_array_elements(x) e where jsonb_typeof(e) <> 'object'
        or exists (select 1 from jsonb_object_keys(e) k where k not in ('n', 'q', 'w', 'pripoutano', 'mag'))
        or jsonb_typeof(e -> 'n') is distinct from 'string' or char_length(e ->> 'n') not between 1 and 80 or not public.mm_cislo(e -> 'q', 0, 9999)
        or (e ? 'w' and (jsonb_typeof(e -> 'w') <> 'string' or char_length(e ->> 'w') > 20))
        or (e ? 'mag' and (jsonb_typeof(e -> 'mag') <> 'string' or (e ->> 'mag') !~ '^[a-z0-9-]{1,60}$'))))
    when 'pen' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'object' and not exists (
      select 1 from jsonb_each(x) e where e.key not in ('CP', 'SP', 'EP', 'GP', 'PP') or jsonb_typeof(e.value) <> 'number' or (e.value #>> '{}') !~ '^[0-9]{1,7}$'))
    when 'pozn' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'string' and char_length(x #>> '{}') <= 4000)
    -- duše postavy (Artikule): Svědomí 0–10, body hříchu a dobrých skutků, vyznání, Ctnosti a Neřesti, stupeň featu víry, odkaz na postavu v Družině
    when 'sv' then public.mm_cislo(x, 0, 10)
    when 'hr' then public.mm_cislo(x, 0, 99)
    when 'sk' then public.mm_cislo(x, 0, 99)
    when 'duse' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'object'
      and not exists (select 1 from jsonb_object_keys(x) k where k not in ('vz', 'ctn', 'ner', 'fs', 'dr'))
      and (not x ? 'vz' or x ->> 'vz' in ('kal', 'kat', 'old'))
      and (not x ? 'fs' or public.mm_cislo(x -> 'fs', 1, 3))
      and (not x ? 'dr' or (jsonb_typeof(x -> 'dr') = 'string' and (x ->> 'dr') ~ '^[a-z0-9-]{1,40}$'))
      and not exists (select 1 from unnest(array['ctn', 'ner']) f where x ? f and (jsonb_typeof(x -> f) <> 'array' or jsonb_array_length(x -> f) > 3
        or exists (select 1 from jsonb_array_elements(x -> f) e where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') not between 1 and 40))))
    -- naučené šermířské techniky a zápasnické chvaty (id)
    when 'tech' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'array' and jsonb_array_length(x) <= 30
      and not exists (select 1 from jsonb_array_elements(x) e where jsonb_typeof(e) <> 'string' or (e #>> '{}') !~ '^[a-z0-9-]{1,40}$'))
    -- účinky s trváním v herním čase: {n, h (hodiny), do (herní hodina konce), kon}
    when 'uc' then jsonb_typeof(x) = 'null' or (jsonb_typeof(x) = 'array' and jsonb_array_length(x) <= 30 and not exists (
      select 1 from jsonb_array_elements(x) e where jsonb_typeof(e) <> 'object'
        or exists (select 1 from jsonb_object_keys(e) k where k not in ('n', 'h', 'do', 'kon'))
        or jsonb_typeof(e -> 'n') is distinct from 'string' or char_length(e ->> 'n') not between 1 and 80
        or (e ? 'h' and (jsonb_typeof(e -> 'h') <> 'number' or (e ->> 'h')::numeric not between 0 and 8760))
        or (e ? 'do' and (jsonb_typeof(e -> 'do') <> 'number' or abs((e ->> 'do')::numeric) > 1e9))
        or (e ? 'kon' and jsonb_typeof(e -> 'kon') <> 'boolean')))
    else false end;
  if not coalesce(ok, false) then
    raise exception 'neplatná hodnota (%)', p_pole;
  end if;
  insert into public.karty (id, stav) values (p_id, '{}'::jsonb) on conflict (id) do nothing;
  update public.karty set stav = case when jsonb_typeof(x) = 'null' then stav - p_pole else jsonb_set(stav, array[p_pole], x) end,
    verze = verze + 1, zmeneno = now() where id = p_id returning verze into v;
  return v;
end $$;

-- Herní záznam: hod z karty (kdo, co, výsledek, Závoj); drží se posledních 300
create or replace function public.mm_hod(p_hod jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  x jsonb := coalesce(p_hod, '{}'::jsonb);
  i bigint;
begin
  if jsonb_typeof(x) <> 'object' or octet_length(x::text) > 2000
     or exists (select 1 from jsonb_object_keys(x) k where k not in ('k', 'kdo', 'co', 'txt', 'tot', 'd', 'krit', 'mis', 'zav', 'zr', 'adv', 'typ'))
     or jsonb_typeof(x -> 'kdo') is distinct from 'string' or char_length(x ->> 'kdo') not between 1 and 60
     or jsonb_typeof(x -> 'co') is distinct from 'string' or char_length(x ->> 'co') not between 1 and 80
     or not public.mm_cislo(x -> 'tot', -50, 999) or not public.mm_cislo(x -> 'zav', 1, 6) then
    raise exception 'neplatný hod';
  end if;
  insert into public.hody (data) values (x) returning id into i;
  delete from public.hody where id <= i - 300;
  return i;
end $$;

-- Ukázat hráčům: vypravěč pošle obrázek, dopis nebo mapku (drží se posledních 50)
create or replace function public.mm_ukaz(p_ukazka jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  x jsonb := coalesce(p_ukazka, '{}'::jsonb);
  i bigint;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  if jsonb_typeof(x) <> 'object' or octet_length(x::text) > 6000
     or exists (select 1 from jsonb_object_keys(x) k where k not in ('n', 't', 'img'))
     or exists (select 1 from jsonb_each(x) e where jsonb_typeof(e.value) <> 'string')
     or char_length(coalesce(x ->> 'n', '')) > 120 or char_length(coalesce(x ->> 't', '')) > 4000 or char_length(coalesce(x ->> 'img', '')) > 500
     or (x ? 'img' and (x ->> 'img') !~ '^(https://|art/)') then
    raise exception 'neplatná ukázka';
  end if;
  insert into public.ukazky (data) values (x) returning id into i;
  delete from public.ukazky where id <= i - 50;
  return i;
end $$;

create or replace function public.mm_ukaz_smaz(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  delete from public.ukazky where id = p_id;
end $$;

-- Příprava sezení (scény, poznámky, setkání, ukázky): jen pro vypravěče, v nastavení pod klíčem 'sezeni'
create or replace function public.mm_sezeni_nacti() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return (select hodnota from public.nastaveni where klic = 'sezeni');
end $$;

create or replace function public.mm_sezeni_uloz(p_sezeni jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  if octet_length(coalesce(p_sezeni, '{}'::jsonb)::text) > 2000000 then
    raise exception 'příprava sezení je příliš velká';
  end if;
  insert into public.nastaveni (klic, hodnota, zmeneno) values ('sezeni', p_sezeni, now())
  on conflict (klic) do update set hodnota = excluded.hodnota, zmeneno = now();
end $$;

-- Výprava (cesta družiny): stav plánovače cest jen pro vypravěče, uložený v nastavení pod klíčem 'vyprava'
create or replace function public.mm_vyprava_nacti() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return (select hodnota from public.nastaveni where klic = 'vyprava');
end $$;

create or replace function public.mm_vyprava_uloz(p_stav jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  insert into public.nastaveni (klic, hodnota, zmeneno) values ('vyprava', p_stav, now())
  on conflict (klic) do update set hodnota = excluded.hodnota, zmeneno = now();
end $$;

-- Vlastní kouzla vypravěče (texty mimo SRD, které si vypravěč zapíše sám): jen pro vypravěče,
-- uložená v nastavení pod klíčem 'kouzla' (pole objektů ve stejném tvaru jako art/kouzla.json)
create or replace function public.mm_kouzla_nacti() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return coalesce((select hodnota from public.nastaveni where klic = 'kouzla'), '[]'::jsonb);
end $$;

create or replace function public.mm_kouzla_uloz(p_kouzla jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  if jsonb_typeof(p_kouzla) <> 'array' then
    raise exception 'očekávám pole kouzel' using errcode = '22023';
  end if;
  insert into public.nastaveni (klic, hodnota, zmeneno) values ('kouzla', p_kouzla, now())
  on conflict (klic) do update set hodnota = excluded.hodnota, zmeneno = now();
end $$;

-- Vypravěč čte všechny stavy najednou (bez limitu počtu řádků)
create or replace function public.mm_stavy() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.mm_je_gm()
              then (select coalesce(jsonb_object_agg(id, stav), '{}'::jsonb) from public.stavy) end
$$;

-- Uložení obsahu větve; výchozí stavy (p_vychozi) se zapíší jen pro nová id.
drop function if exists public.mm_nahraj_obsah(text, jsonb, jsonb, jsonb);
create or replace function public.mm__uloz_obsah(p_vetev text, p_hrac jsonb, p_gm jsonb, p_vychozi jsonb, p_gen text)
returns bigint
language plpgsql security definer set search_path = public as $$
begin
  insert into public.obsah (vetev, hrac, gm, nahrano, gen) values (p_vetev, p_hrac, p_gm, now(), p_gen)
  on conflict (vetev) do update set hrac = excluded.hrac, gm = excluded.gm, nahrano = now(), gen = excluded.gen;
  insert into public.stavy (id, stav)
  select key, value::text::smallint from jsonb_each(coalesce(p_vychozi, '{}'::jsonb))
  on conflict (id) do nothing;
  perform public.mm_prepocitej(p_vetev);
  return (select verze from public.snimek where vetev = p_vetev);
end $$;

-- Build na Netlify (tajný klíč)
create or replace function public.mm_nahraj_obsah(p_vetev text, p_hrac jsonb, p_gm jsonb, p_vychozi jsonb, p_gen text default null)
returns bigint
language sql security definer set search_path = public as $$
  select public.mm__uloz_obsah(p_vetev, p_hrac, p_gm, p_vychozi, p_gen)
$$;

-- Vypravěč po úpravě textu na webu (jeho prohlížeč obsah znovu vygeneruje)
create or replace function public.mm_uloz_obsah(p_vetev text, p_hrac jsonb, p_gm jsonb, p_vychozi jsonb, p_gen text)
returns bigint
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return public.mm__uloz_obsah(p_vetev, p_hrac, p_gm, p_vychozi, p_gen);
end $$;

-- ===== Texty v databázi =====
-- Build: soubory z gitu → databáze. Nový soubor se vloží; změněný se přepíše, jen pokud záznam
-- nebyl od poslední zálohy upraven na webu (jinak konflikt – vyhrává web). p_uplny: soubory, které
-- v gitu už nejsou, se smažou (pokud je web neupravil).
create or replace function public.mm_sync_zaznamy(p_soubory jsonb, p_uplny boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  f record; z record;
  nove int := 0; zmenene int := 0; smazane int := 0; konflikty jsonb := '[]'::jsonb;
begin
  for f in select x ->> 'soubor' as soubor, x ->> 'md' as md, x ->> 'hash' as hash from jsonb_array_elements(p_soubory) x loop
    select * into z from public.zaznamy where soubor = f.soubor;
    if not found then
      insert into public.zaznamy (soubor, md, md_hash) values (f.soubor, f.md, f.hash);
      insert into public.zaznamy_historie (soubor, md, akce) values (f.soubor, f.md, 'soubor');
      nove := nove + 1;
    elsif z.md_hash is not distinct from f.hash then
      null;
    elsif not z.web and not z.smazano then
      insert into public.zaznamy_historie (soubor, md, akce) values (f.soubor, z.md, 'před změnou ze souboru');
      update public.zaznamy set md = f.md, md_hash = f.hash, upraveno = now() where soubor = f.soubor;
      zmenene := zmenene + 1;
    elsif z.md = f.md then
      update public.zaznamy set md_hash = f.hash where soubor = f.soubor;
    else
      konflikty := konflikty || to_jsonb(f.soubor);
    end if;
  end loop;
  if p_uplny then
    with pryc as (
      delete from public.zaznamy zz
       where not zz.web and not zz.smazano and zz.md_hash is not null
         and not exists (select 1 from jsonb_array_elements(p_soubory) x where x ->> 'soubor' = zz.soubor)
      returning zz.soubor, zz.md)
    insert into public.zaznamy_historie (soubor, md, akce) select soubor, md, 'smazáno v souborech' from pryc;
    get diagnostics smazane = row_count;
  end if;
  return jsonb_build_object('nove', nove, 'zmenene', zmenene, 'smazane', smazane, 'konflikty', konflikty);
end $$;

-- Všechny platné texty {soubor: md} – pro build (tajný klíč) a pro vypravěče
create or replace function public.mm_zaznamy_vse() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(soubor, md), '{}'::jsonb) from public.zaznamy where not smazano
$$;
create or replace function public.mm_zaznamy_gm() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return public.mm_zaznamy_vse();
end $$;

-- Vypravěč uloží text. p_puvodni = text, ze kterého úprava vyšla (null u nového záznamu):
-- když se mezitím změnil, uložení se odmítne, aby se nic nepřepsalo.
create or replace function public.mm_uloz_zaznam(p_soubor text, p_md text, p_puvodni text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare z record;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  if p_soubor !~ '^[a-z/_-]+/[0-9A-Za-z_.-]+\.md$' and p_soubor not in ('vazby.md', 'rodokmeny.json') then
    raise exception 'neplatný název souboru %', p_soubor;
  end if;
  select * into z from public.zaznamy where soubor = p_soubor for update;
  if found and not z.smazano and z.md is distinct from p_puvodni then
    raise exception 'Text se mezitím změnil (jiné okno nebo sestavení). Obnovte stránku a úpravu zopakujte.';
  end if;
  if found and p_puvodni is null and not z.smazano then
    raise exception 'Soubor % už existuje.', p_soubor;
  end if;
  if found then
    insert into public.zaznamy_historie (soubor, md, akce) values (p_soubor, z.md, 'před úpravou na webu');
    update public.zaznamy set md = p_md, web = true, smazano = false, upraveno = now() where soubor = p_soubor;
  else
    insert into public.zaznamy (soubor, md, web) values (p_soubor, p_md, true);
  end if;
  insert into public.zaznamy_historie (soubor, md, akce) values (p_soubor, p_md, 'upraveno na webu');
  return now();
end $$;

create or replace function public.mm_smaz_zaznam(p_soubor text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  insert into public.zaznamy_historie (soubor, md, akce) select soubor, md, 'smazáno na webu' from public.zaznamy where soubor = p_soubor;
  update public.zaznamy set smazano = true, web = true, upraveno = now() where soubor = p_soubor;
end $$;

-- Historie jednoho textu (posledních 40 verzí)
create or replace function public.mm_historie(p_soubor text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('n', n, 'kdy', kdy, 'akce', akce, 'md', md) order by n desc), '[]'::jsonb)
            from (select * from public.zaznamy_historie where soubor = p_soubor order by n desc limit 40) h);
end $$;

-- Záloha do gitu (GitHub Actions, tajný klíč): co se změnilo na webu, a potvrzení po zapsání souborů
create or replace function public.mm_zaloha_seznam() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('soubor', soubor, 'md', md, 'smazano', smazano, 'hash', md5(md)) order by soubor), '[]'::jsonb)
    from public.zaznamy where web
$$;
create or replace function public.mm_zaloha_hotovo(p_soubory jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; k int;
begin
  -- jen pokud se text od exportu nezměnil (otisk sedí); jinak zůstane označený k další záloze
  delete from public.zaznamy z using jsonb_array_elements(p_soubory) x
   where z.soubor = x ->> 'soubor' and z.smazano and md5(z.md) = x ->> 'hash';
  get diagnostics k = row_count; n := n + k;
  update public.zaznamy z set web = false, md_hash = x ->> 'hash'
    from jsonb_array_elements(p_soubory) x
   where z.soubor = x ->> 'soubor' and not z.smazano and md5(z.md) = x ->> 'hash';
  get diagnostics k = row_count; n := n + k;
  return n;
end $$;

-- Nahrané obrázky (portréty, erby, obrázky plemen) – {"portrety":{"jiri":{"f":url,"m":url}}, "erby":{…}, "draci":{…}}
create or replace function public.mm_obrazky() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select hodnota from public.nastaveni where klic = 'obrazky'), '{}'::jsonb)
$$;
create or replace function public.mm_nastav_obrazek(p_typ text, p_klic text, p_hodnota jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare o jsonb;
begin
  if not public.mm_je_gm() then
    raise exception 'jen pro vypravěče' using errcode = '42501';
  end if;
  if p_typ not in ('portrety', 'erby', 'draci') then
    raise exception 'neznámý druh obrázku %', p_typ;
  end if;
  o := coalesce((select hodnota from public.nastaveni where klic = 'obrazky'), '{}'::jsonb);
  o := jsonb_set(o, array[p_typ], coalesce(o -> p_typ, '{}'::jsonb) || jsonb_build_object(p_klic, p_hodnota));
  insert into public.nastaveni (klic, hodnota, zmeneno) values ('obrazky', o, now())
  on conflict (klic) do update set hodnota = excluded.hodnota, zmeneno = now();
  return o;
end $$;

-- Práva: veřejnost smí jen číst snimek; vypravěč smí měnit stavy; nahrávat smí jen tajný klíč.
revoke all on function public.mm_prepocitej(text) from public, anon, authenticated;
revoke all on function public.mm__uloz_obsah(text, jsonb, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.mm_nahraj_obsah(text, jsonb, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.mm_uloz_obsah(text, jsonb, jsonb, jsonb, text) from public, anon;
revoke all on function public.mm_sync_zaznamy(jsonb, boolean) from public, anon, authenticated;
revoke all on function public.mm_zaznamy_vse() from public, anon, authenticated;
revoke all on function public.mm_zaznamy_gm() from public, anon;
revoke all on function public.mm_uloz_zaznam(text, text, text) from public, anon;
revoke all on function public.mm_smaz_zaznam(text) from public, anon;
revoke all on function public.mm_historie(text) from public, anon;
revoke all on function public.mm_zaloha_seznam() from public, anon, authenticated;
revoke all on function public.mm_zaloha_hotovo(jsonb) from public, anon, authenticated;
revoke all on function public.mm_obrazky() from public, anon, authenticated;
revoke all on function public.mm_nastav_obrazek(text, text, jsonb) from public, anon;
grant execute on function public.mm_uloz_obsah(text, jsonb, jsonb, jsonb, text), public.mm_zaznamy_gm(), public.mm_uloz_zaznam(text, text, text),
  public.mm_smaz_zaznam(text), public.mm_historie(text), public.mm_nastav_obrazek(text, text, jsonb) to authenticated;
grant execute on function public.mm_sync_zaznamy(jsonb, boolean), public.mm_zaznamy_vse(), public.mm_zaloha_seznam(),
  public.mm_zaloha_hotovo(jsonb), public.mm_obrazky(), public.mm__uloz_obsah(text, jsonb, jsonb, jsonb, text) to service_role;
revoke all on function public.mm_nastav_stavy(jsonb) from public, anon;
revoke all on function public.mm_stavy() from public, anon;
revoke all on function public.mm_nastav_hru(jsonb) from public, anon;
revoke all on function public.mm_boj_uloz(jsonb) from public, anon;
grant execute on function public.mm_boj_uloz(jsonb) to authenticated;
revoke all on function public.mm_vyprava_nacti() from public, anon;
revoke all on function public.mm_vyprava_uloz(jsonb) from public, anon;
grant execute on function public.mm_vyprava_nacti(), public.mm_vyprava_uloz(jsonb) to authenticated;
revoke all on function public.mm_kouzla_nacti() from public, anon;
revoke all on function public.mm_kouzla_uloz(jsonb) from public, anon;
grant execute on function public.mm_kouzla_nacti(), public.mm_kouzla_uloz(jsonb) to authenticated;
grant execute on function public.mm_boj_obsad(int, text) to anon, authenticated;
grant execute on function public.mm_boj_hod(text, int) to anon, authenticated;
grant execute on function public.mm_boj_hrac(text, text, jsonb) to anon, authenticated;
grant execute on function public.mm_boj_utok(text, jsonb) to anon, authenticated;
grant execute on function public.mm_karta_uloz(jsonb) to anon, authenticated;
grant execute on function public.mm_karta_stav(text, text, jsonb) to anon, authenticated;
grant execute on function public.mm_karta_smaz(text) to authenticated;
grant execute on function public.mm_hod(jsonb) to anon, authenticated;
revoke all on function public.mm_ukaz(jsonb) from public, anon;
revoke all on function public.mm_ukaz_smaz(bigint) from public, anon;
revoke all on function public.mm_sezeni_nacti() from public, anon;
revoke all on function public.mm_sezeni_uloz(jsonb) from public, anon;
grant execute on function public.mm_ukaz(jsonb), public.mm_ukaz_smaz(bigint), public.mm_sezeni_nacti(), public.mm_sezeni_uloz(jsonb) to authenticated;
grant execute on function public.mm_nastav_hru(jsonb) to authenticated;
grant execute on function public.mm_stavy() to authenticated;
revoke all on function public.mm_orez(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.mm_zminky(text, jsonb) from public, anon, authenticated;
revoke all on function public.mm_uroven(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.mm_nastav_stavy(jsonb) to authenticated;
grant execute on function public.mm_je_gm() to anon, authenticated;
grant execute on function public.mm_prepocitej(text) to service_role;
grant execute on function public.mm_nahraj_obsah(text, jsonb, jsonb, jsonb, text) to service_role;
grant execute on function public.mm_orez(jsonb, jsonb), public.mm_zminky(text, jsonb), public.mm_uroven(jsonb, jsonb) to service_role;

revoke insert, update, delete, truncate on public.obsah, public.stavy, public.snimek, public.denik, public.gm, public.nastaveni, public.boj, public.karty, public.hody, public.ukazky,
  public.zaznamy, public.zaznamy_historie from anon, authenticated;
revoke select on public.zaznamy, public.zaznamy_historie from anon, authenticated;
grant select on public.boj to anon, authenticated;
revoke select on public.nastaveni from anon, authenticated;
grant select on public.snimek to anon, authenticated;
grant select on public.obsah, public.stavy, public.denik, public.gm to authenticated;

-- Realtime pro tracker boje: hráči dostanou změnu hned, dotazování klesne na zálohu jednou za minutu.
-- Respektuje RLS (tabulku boj smí číst každý, zapisuje jen vypravěč přes funkce). Bez publikace web funguje dál dotazováním.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'boj') then
    execute 'alter publication supabase_realtime add table public.boj';
  end if;
end $$;

-- Úložiště nahraných obrázků (veřejné čtení přes nečitelné adresy, nahrává jen vypravěč)
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('obrazky', 'obrazky', true) on conflict (id) do nothing;
    execute 'drop policy if exists "obrazky: nahrává vypravěč" on storage.objects';
    execute 'create policy "obrazky: nahrává vypravěč" on storage.objects for insert to authenticated with check (bucket_id = ''obrazky'' and public.mm_je_gm())';
    execute 'drop policy if exists "obrazky: mění vypravěč" on storage.objects';
    execute 'create policy "obrazky: mění vypravěč" on storage.objects for update to authenticated using (bucket_id = ''obrazky'' and public.mm_je_gm())';
    execute 'drop policy if exists "obrazky: maže vypravěč" on storage.objects';
    execute 'create policy "obrazky: maže vypravěč" on storage.objects for delete to authenticated using (bucket_id = ''obrazky'' and public.mm_je_gm())';
  end if;
end $$;

-- ▼ Doplňte svůj e‑mail (účet založený v Authentication → Users) a spusťte:
-- insert into public.gm (user_id) select id from auth.users where email = 'VAS@EMAIL.CZ' on conflict do nothing;
