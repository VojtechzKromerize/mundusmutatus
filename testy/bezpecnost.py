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
    chk(call("/rest/v1/boj?select=verze", tok=tok)[0] == 200, f"{kdo} čte tracker iniciativy")
    s, b = call("/rest/v1/rpc/mm_stavy", "POST", {}, tok=tok)
    chk(not ok(s) or b.strip() in ("null", ""), f"{kdo} nevidí stavy odhalení")
    for fn, body in (("mm_nastav_stavy", {"p_zmeny": {"slik": 1}}), ("mm_nastav_hru", {"p_hra": {}}),
                     ("mm_nahraj_obsah", {"p_vetev": "x", "p_hrac": {}, "p_gm": {}, "p_vychozi": {}}), ("mm_prepocitej", {}),
                     ("mm_uloz_zaznam", {"p_soubor": "osoby/x.md", "p_md": "x", "p_puvodni": None}), ("mm_zaznamy_gm", {}),
                     ("mm_boj_uloz", {"p_stav": {}}), ("mm_nastav_obrazek", {"p_typ": "erby", "p_klic": "x", "p_hodnota": {}})):
        chk(not ok(call(f"/rest/v1/rpc/{fn}", "POST", body, tok=tok)[0]), f"{kdo} nesmí volat {fn}")
    for t, body in (("snimek", {"vetev": "zz", "data": {}}), ("stavy", {"id": "novy", "stav": 2}), ("gm", {"user_id": "22222222-2222-2222-2222-222222222222"})):
        chk(not ok(call(f"/rest/v1/{t}", "POST", body, tok=tok)[0]), f"{kdo} nesmí zapisovat do {t}")
chk(json.loads(call("/rest/v1/obsah?select=vetev", tok=gm)[1]) != [], "vypravěč čte obsah")
chk(ok(call("/rest/v1/rpc/mm_nastav_stavy", "POST", {"p_zmeny": {"slik": 2}}, tok=gm)[0]), "vypravěč mění stavy")
for fn, body in (("mm_nahraj_obsah", {"p_vetev": "x", "p_hrac": {}, "p_gm": {}, "p_vychozi": {}}), ("mm_zaznamy_vse", {}), ("mm_sync_zaznamy", {"p_soubory": {}, "p_uplny": False})):
    chk(not ok(call(f"/rest/v1/rpc/{fn}", "POST", body, tok=gm)[0]), f"vypravěč nesmí volat služební {fn}")
chk(not ok(call("/rest/v1/gm", "POST", {"user_id": "22222222-2222-2222-2222-222222222222"}, tok=gm)[0]), "vypravěč nepřidá dalšího vypravěče")
print("SELHALO:", len(fails)) if fails else print("VŠE OK")
sys.exit(1 if fails else 0)
