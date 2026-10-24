# Kontrola práv v databázi: anonym a hráč nesmí číst obsah vypravěče ani nic měnit; vypravěč smí jen své.
import json, os, sys, urllib.request, urllib.error
U = os.environ.get("MM_SB", "http://localhost:54321"); K = "sb_publishable_test"
def call(path, method="GET", body=None, tok=None):
    h = {"apikey": K, "Content-Type": "application/json"}
    if tok: h["Authorization"] = "Bearer " + tok
    r = urllib.request.Request(U + path, data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as x: return x.status, x.read().decode()
    except urllib.error.HTTPError as e: return e.code, e.read().decode()
def login(e):
    s, b = call("/auth/v1/token?grant_type=password", "POST", {"email": e, "password": "heslo"})
    return json.loads(b)["access_token"]
fails = []
def chk(c, m):
    print(("OK  " if c else "FAIL"), m)
    if not c: fails.append(m)
ok = lambda s: 200 <= s < 300
prazdne = lambda r: r[0] == 200 and json.loads(r[1] or "[]") == []
gm, hr = login("gm@x.cz"), login("hrac@x.cz")
for kdo, tok in (("anonym", None), ("hráč", hr)):
    for t in ("obsah", "stavy", "denik", "zaznamy", "zaznamy_historie", "nastaveni", "gm"):
        r = call(f"/rest/v1/{t}?select=*&limit=1", tok=tok)
        chk(prazdne(r) or not ok(r[0]), f"{kdo} nečte tabulku {t}")
    chk(call("/rest/v1/snimek?select=verze", tok=tok)[0] == 200, f"{kdo} čte veřejný výřez")
    chk(prazdne(call("/rest/v1/boj?select=verze", tok=tok)) or not ok(call("/rest/v1/boj?select=verze", tok=tok)[0]), f"{kdo} nečte tabulku boj přímo (skrytí nepřátelé)")
    chk(ok(call("/rest/v1/rpc/mm_boj_cti", tok=tok)[0]), f"{kdo} čte boj přes mm_boj_cti")
    chk(ok(call("/rest/v1/rpc/mm_puls", "POST", {}, tok=tok)[0]) and ok(call("/rest/v1/rpc/mm_hra", "POST", {}, tok=tok)[0]), f"{kdo} čte puls a herní stav")
    chk(not ok(call("/rest/v1/puls", "POST", {"druh": "boj"}, tok=tok)[0]), f"{kdo} nesmí zapisovat do pulsu")
    for t in ("karty", "hody", "vyzvy", "ukazky", "navrhy"):
        chk(call(f"/rest/v1/{t}?select=id&limit=1", tok=tok)[0] == 200, f"{kdo} čte veřejnou tabulku {t}")
    s, b = call("/rest/v1/rpc/mm_stavy", "POST", {}, tok=tok)
    chk(not ok(s) or b.strip() in ("null", ""), f"{kdo} nevidí stavy odhalení")
    for fn, body in (("mm_nastav_stavy", {"p_zmeny": {"slik": 1}}), ("mm_nastav_hru", {"p_hra": {}}),
                     ("mm_nahraj_obsah", {"p_vetev": "x", "p_hrac": {}, "p_gm": {}, "p_vychozi": {}}), ("mm_prepocitej", {}),
                     ("mm_uloz_zaznam", {"p_soubor": "osoby/x.md", "p_md": "x", "p_puvodni": None}), ("mm_zaznamy_gm", {}),
                     ("mm_boj_uloz", {"p_stav": {}}), ("mm_boj_uloz_v", {"p_stav": {}, "p_verze": 1}), ("mm_zmeny", {"p_od": None}), ("mm_zmena", {"p_id": 1}), ("mm_navrh_vyrid", {"p_id": 1, "p_stav": "ok"}), ("mm_potvrz_nastav", {"p_hodnota": {"rezim": "nic"}}), ("mm_vyprava_nacti", {}), ("mm_vyprava_uloz", {"p_stav": {}}), ("mm_kouzla_nacti", {}), ("mm_kouzla_uloz", {"p_kouzla": []}), ("mm_nastav_obrazek", {"p_typ": "erby", "p_klic": "x", "p_hodnota": {}}),
                     ("mm_ukaz", {"p_ukazka": {"n": "x"}}), ("mm_ukaz_smaz", {"p_id": 1}), ("mm_pravidla_texty_uloz", {"p_klic": "kouzla", "p_data": {}}), ("mm_sezeni_nacti", {}), ("mm_sezeni_uloz", {"p_sezeni": {"s": []}}),
                     ("mm_vyzva", {"p_vyzva": {"typ": "zach", "ab": "WIS"}}), ("mm_vyzva_zavri", {"p_id": None}), ("mm_hrac_zrus_heslo", {"p_karta": "balduin"}), ("mm_karta_smaz", {"p_id": "nikdo"}), ("mm_zpravy_gm", {}), ("mm_hrac_ok", {"p_karta": "x", "p_token": None}), ("mm_ja_uvolni", {"p_karta": "x"}), ("mm_discord_nastav", {"p_url": None}), ("mm_discord_postava", {"p_discord": "1"}), ("mm_push_data", {"p_karty": ["balduin"], "p_gm": True}), ("mm_discord_hod", {"p_hod": {"src": "discord"}}), ("mm_push_posli", {"p_karty": ["balduin"], "p_gm": True, "p_titul": "x", "p_text": "x", "p_url": "#hra"}), ("mm_push_prihlas", {"p_odber": {"endpoint": "https://x.cz/a", "keys": {"p256dh": "a", "auth": "b"}}, "p_karta": None})):
        chk(not ok(call(f"/rest/v1/rpc/{fn}", "POST", body, tok=tok)[0]), f"{kdo} nesmí volat {fn}")
    for t in ("hesla", "relace_hracu", "zpravy", "hraci_ucty", "karty_texty", "karty_historie", "push_odbery", "zmeny", "pravidla_texty"):
        st, bd = call(f"/rest/v1/{t}?select=*", tok=tok)
        chk(not ok(st) or bd.strip() == "[]", f"{kdo} nečte tabulku {t}")
    for t, body in (("snimek", {"vetev": "zz", "data": {}}), ("stavy", {"id": "novy", "stav": 2}), ("gm", {"user_id": "22222222-2222-2222-2222-222222222222"})):
        chk(not ok(call(f"/rest/v1/{t}", "POST", body, tok=tok)[0]), f"{kdo} nesmí zapisovat do {t}")
chk(json.loads(call("/rest/v1/obsah?select=vetev", tok=gm)[1]) != [], "vypravěč čte obsah")
# plné znění featů (Vojtův překlad mimo SRD) jen pro přihlášené – anonym bez hesla ke kartě nic nedostane
_s, _b = call("/rest/v1/rpc/mm_pravidla_texty", "POST", {"p_klic": "featy"}, tok=None)
chk(ok(_s) and _b.strip() in ("null", ""), "anonym nedostane plné znění featů")
chk(ok(call("/rest/v1/rpc/mm_pravidla_texty", "POST", {"p_klic": "featy"}, tok=hr)[0]), "přihlášený hráč smí číst plné znění featů")
for _fn, _body in (("mm_pravidla_text", {"p_klic": "predmety", "p_id": "potion of healing"}), ("mm_pravidla_seznam", {"p_klic": "kouzla"})):
    _s, _b = call(f"/rest/v1/rpc/{_fn}", "POST", _body, tok=None)
    chk(ok(_s) and _b.strip() in ("null", ""), f"anonym nedostane plné znění přes {_fn}")
    chk(ok(call(f"/rest/v1/rpc/{_fn}", "POST", _body, tok=hr)[0]), f"přihlášený hráč smí volat {_fn}")
# skrytí nepřátelé: vypravěč čte boj celý, hráč bez účastníků skryt=true a bez jejich řádků záznamu
chk(ok(call("/rest/v1/rpc/mm_boj_uloz", "POST", {"p_stav": {"aktivni": True, "npc": [{"id": "n1", "n": "Zjevný", "gm": {"vira": "TAJNÁ_VÍRA_NPC", "dc": 17}}, {"id": "n2", "n": "Zálohář", "skryt": True}], "zaz": [{"a": "Zálohář", "c": "Adam", "v": "x"}, {"a": "Adam", "c": "Zjevný", "v": "y"}], "obsazeni": {"1": "n2", "2": "n1"}}}, tok=gm)[0]), "vypravěč uloží boj se skrytým nepřítelem")
chk(ok(call("/rest/v1/boj?select=verze", tok=gm)[0]) and json.loads(call("/rest/v1/boj?select=verze", tok=gm)[1]) != [], "vypravěč čte tabulku boj")
_g = json.loads(call("/rest/v1/rpc/mm_boj_cti", tok=gm)[1])["stav"]
chk(len(_g["npc"]) == 2 and len(_g["zaz"]) == 2, "vypravěč dostane z mm_boj_cti i skrytého nepřítele")
for kdo, tok in (("anonym", None), ("hráč", hr)):
    _h = json.loads(call("/rest/v1/rpc/mm_boj_cti", tok=tok)[1])["stav"]
    chk([o["n"] for o in _h["npc"]] == ["Zjevný"] and len(_h["zaz"]) == 1 and _h["obsazeni"] == {"2": "n1"} and "Zálohář" not in json.dumps(_h, ensure_ascii=False), f"{kdo} nedostane skrytého nepřítele ani jeho záznam a slot")
    chk("TAJNÁ_VÍRA_NPC" not in json.dumps(_h, ensure_ascii=False) and "gm" not in _h["npc"][0], f"{kdo} nedostane údaje NPC jen pro vypravěče (postoj, víra, cíle, DC)")
chk(ok(call("/rest/v1/rpc/mm_boj_uloz", "POST", {"p_stav": {}}, tok=gm)[0]), "boj vrácen do výchozího stavu")
# hod „jen vypravěči“ (2026-10-23): ostatní ho nedostanou, vypravěč ano
chk(ok(call("/rest/v1/rpc/mm_hod", "POST", {"p_hod": {"kdo": "Vypravěč", "co": "TAJNÝ_HOD", "tot": 7, "taj": True}}, tok=gm)[0]), "vypravěč zapíše hod jen pro sebe")
chk("TAJNÝ_HOD" in call("/rest/v1/hody?select=data", tok=gm)[1], "vypravěč čte hod jen pro vypravěče")
for kdo, tok in (("anonym", None), ("hráč", hr)):
    chk("TAJNÝ_HOD" not in call("/rest/v1/hody?select=data", tok=tok)[1], f"{kdo} nečte hod jen pro vypravěče")
chk(ok(call("/rest/v1/rpc/mm_nastav_stavy", "POST", {"p_zmeny": {"slik": 2}}, tok=gm)[0]), "vypravěč mění stavy")
for fn, body in (("mm_nahraj_obsah", {"p_vetev": "x", "p_hrac": {}, "p_gm": {}, "p_vychozi": {}}), ("mm_zaznamy_vse", {}), ("mm_sync_zaznamy", {"p_soubory": {}, "p_uplny": False})):
    chk(not ok(call(f"/rest/v1/rpc/{fn}", "POST", body, tok=gm)[0]), f"vypravěč nesmí volat služební {fn}")
chk(ok(call("/rest/v1/rpc/mm_vyprava_uloz", "POST", {"p_stav": {"tajne": "trasa"}}, tok=gm)[0]), "vypravěč ukládá výpravu")
chk("trasa" in call("/rest/v1/rpc/mm_vyprava_nacti", "POST", {}, tok=gm)[1], "vypravěč čte výpravu")
chk("trasa" not in call(f"/rest/v1/snimek?select=data", tok=None)[1], "výprava není ve veřejném výřezu")
chk(ok(call("/rest/v1/rpc/mm_kouzla_uloz", "POST", {"p_kouzla": [{"i": "v-tajne", "en": "Tajne kouzlo"}]}, tok=gm)[0]), "vypravěč ukládá vlastní kouzla")
chk("Tajne kouzlo" in call("/rest/v1/rpc/mm_kouzla_nacti", "POST", {}, tok=gm)[1], "vypravěč čte vlastní kouzla")
chk("Tajne kouzlo" not in call(f"/rest/v1/snimek?select=data", tok=None)[1], "vlastní kouzla nejsou ve veřejném výřezu")
chk(ok(call("/rest/v1/rpc/mm_sezeni_uloz", "POST", {"p_sezeni": {"s": [{"id": "a", "n": "Tajne sezeni"}]}}, tok=gm)[0]), "vypravěč ukládá přípravu sezení")
chk("Tajne sezeni" in call("/rest/v1/rpc/mm_sezeni_nacti", "POST", {}, tok=gm)[1], "vypravěč čte přípravu sezení")
chk("Tajne sezeni" not in call(f"/rest/v1/snimek?select=data", tok=None)[1], "příprava sezení není ve veřejném výřezu")
chk(not ok(call("/rest/v1/rpc/mm_ukaz", "POST", {"p_ukazka": {"img": "javascript:alert(1)"}}, tok=gm)[0]), "ukázka nepřijme cizí adresu obrázku")
chk(ok(call("/rest/v1/rpc/mm_ukaz", "POST", {"p_ukazka": {"n": "Dopis"}}, tok=gm)[0]), "vypravěč ukáže hráčům")
chk("Dopis" in call("/rest/v1/ukazky?select=data", tok=None)[1], "hráč čte ukázky")
for u in json.loads(call("/rest/v1/ukazky?select=id", tok=None)[1]):
    chk(ok(call("/rest/v1/rpc/mm_ukaz_smaz", "POST", {"p_id": u["id"]}, tok=gm)[0]), "vypravěč smaže ukázku")
chk(not ok(call("/rest/v1/ukazky", "POST", {"data": {"n": "podvrh"}}, tok=None)[0]), "hráč nesmí zapisovat ukázky přímo")
chk(not ok(call("/rest/v1/gm", "POST", {"user_id": "22222222-2222-2222-2222-222222222222"}, tok=gm)[0]), "vypravěč nepřidá dalšího vypravěče")
print("SELHALO:", len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
