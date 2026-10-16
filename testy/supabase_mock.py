# Testovací náhrada Supabase (jen pro testy, nikdy ne pro web).
# Emulace Supabase gateway: /rest/v1 -> PostgREST (apikey -> JWT), /auth/v1 -> mock GoTrue. CORS.
import base64, hashlib, hmac, json, os, time, urllib.request, urllib.error, sys
PGRST=os.environ.get("MM_PGRST","http://localhost:3000")
PORT=int(os.environ.get("MM_SB_PORT","54321"))
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
SECRET=b"testovaci-tajemstvi-pro-jwt-0123456789abcdef"
def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def jwt(claims):
    h=b64(json.dumps({"alg":"HS256","typ":"JWT"}).encode()); p=b64(json.dumps(claims).encode())
    return h+"."+p+"."+b64(hmac.new(SECRET,(h+"."+p).encode(),hashlib.sha256).digest())
KEYS={"sb_publishable_test":jwt({"role":"anon","exp":4102444800}),"sb_secret_test":jwt({"role":"service_role","exp":4102444800})}
USERS={"gm@x.cz":("heslo","11111111-1111-1111-1111-111111111111"),"hrac@x.cz":("heslo","22222222-2222-2222-2222-222222222222")}
RT={}
STORE={}
EXPIN=int(sys.argv[1]) if len(sys.argv)>1 else 3600
LAT=float(os.environ.get("MM_SB_LAT","0"))/1000  # umělá síťová prodleva pro měření výkonu (ms)
LOG=[]
class H(BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def cors(self):
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Headers","apikey, authorization, content-type, prefer, x-client-info, x-upsert, cache-control")
        self.send_header("Access-Control-Allow-Methods","GET, POST, PATCH, DELETE, OPTIONS")
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()
    def out(self,code,obj):
        b=json.dumps(obj).encode() if obj is not None else b""
        self.send_response(code); self.cors(); self.send_header("Content-Type","application/json"); self.end_headers(); self.wfile.write(b)
    def body(self):
        n=int(self.headers.get("Content-Length") or 0); return self.rfile.read(n) if n else b""
    def handle_any(self,method):
        if method=="GET" and self.path.startswith("/storage/v1/object/public/obrazky/"):
            b=STORE.get(self.path.split("/obrazky/",1)[1].split("?")[0])
            if b is None: return self.out(404,{"message":"not found"})
            self.send_response(200);self.cors();self.send_header("Content-Type",b[0]);self.end_headers();self.wfile.write(b[1]);return
        if LAT: time.sleep(LAT)
        key=self.headers.get("apikey")
        LOG.append((method,self.path,key))
        if key not in KEYS: return self.out(401,{"message":"Invalid API key"})
        if self.path.startswith("/auth/v1/token"):
            d=json.loads(self.body() or b"{}")
            if "grant_type=password" in self.path:
                u=USERS.get(d.get("email"))
                if not u or u[0]!=d.get("password"): return self.out(400,{"error":"invalid_grant","error_description":"Invalid login credentials"})
                email=d["email"]
            else:
                email=RT.get(d.get("refresh_token"))
                if not email: return self.out(400,{"error":"invalid_grant","error_description":"Invalid Refresh Token"})
            uid=USERS[email][1]; rt="rt-"+str(time.time()); RT[rt]=email
            return self.out(200,{"access_token":jwt({"sub":uid,"role":"authenticated","email":email,"exp":int(time.time())+EXPIN}),"token_type":"bearer",
                                 "expires_in":EXPIN,"expires_at":int(time.time())+EXPIN,"refresh_token":rt,"user":{"id":uid,"email":email}})
        if self.path.startswith("/auth/v1/logout"): return self.out(204,None)
        if self.path.startswith("/storage/v1/object/obrazky/") and method=="POST":
            a=(self.headers.get("Authorization") or "")[7:]
            try:
                h,pl,sg=a.split(".");claims=json.loads(base64.urlsafe_b64decode(pl+"=="))
                assert hmac.compare_digest(sg,b64(hmac.new(SECRET,(h+"."+pl).encode(),hashlib.sha256).digest())) and claims.get("role")=="authenticated"
            except Exception: return self.out(403,{"message":"new row violates row-level security policy"})
            if claims.get("sub")!=USERS["gm@x.cz"][1]: return self.out(403,{"message":"new row violates row-level security policy"})
            STORE[self.path.split("/obrazky/",1)[1]]=(self.headers.get("Content-Type","application/octet-stream"),self.body())
            return self.out(200,{"Key":"obrazky/"+self.path.split("/obrazky/",1)[1]})
        if self.path.startswith("/rest/v1/"):
            auth=self.headers.get("Authorization") or "Bearer "+KEYS[key]
            hdr={"Authorization":auth,"Content-Type":self.headers.get("Content-Type","application/json")}
            if self.headers.get("Prefer"): hdr["Prefer"]=self.headers["Prefer"]
            req=urllib.request.Request(PGRST+self.path[len("/rest/v1"):],data=self.body() if method!="GET" else None,headers=hdr,method=method)
            try:
                with urllib.request.urlopen(req) as r: code,b=r.status,r.read()
            except urllib.error.HTTPError as e: code,b=e.code,e.read()
            self.send_response(code); self.cors(); self.send_header("Content-Type","application/json"); self.end_headers(); self.wfile.write(b); return
        self.out(404,{"message":"not found"})
    def do_GET(self): self.handle_any("GET")
    def do_POST(self): self.handle_any("POST")
ThreadingHTTPServer(("127.0.0.1",PORT),H).serve_forever()
