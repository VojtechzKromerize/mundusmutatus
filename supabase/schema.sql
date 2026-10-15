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
grant execute on function public.mm_boj_obsad(int, text) to anon, authenticated;
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

revoke insert, update, delete, truncate on public.obsah, public.stavy, public.snimek, public.denik, public.gm, public.nastaveni, public.boj,
  public.zaznamy, public.zaznamy_historie from anon, authenticated;
revoke select on public.zaznamy, public.zaznamy_historie from anon, authenticated;
grant select on public.boj to anon, authenticated;
revoke select on public.nastaveni from anon, authenticated;
grant select on public.snimek to anon, authenticated;
grant select on public.obsah, public.stavy, public.denik, public.gm to authenticated;

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
