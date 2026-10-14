import json, math, sys
sys.path.insert(0,'/tmp/claude-0/svet')
from assign import assign, OVR
from shapely.geometry import shape, box, Polygon, MultiPolygon, LineString, mapping
from shapely.ops import unary_union, polylabel, transform
BB=box(-32,24,75,76)
raw=json.load(open('/tmp/claude-0/svet/ne/ne_10m_admin_1_states_provinces.geojson'))
groups={}; hre=[]; unk={}
HRE_A3={'DEU','AUT','CHE','CZE','LUX','NLD','SVN','LIE'}
HRE_N={'POL':{'Lower Silesian','Opole','Silesian','West Pomeranian','Lubusz'},'FRA':{'Bas-Rhin','Haute-Rhin','Moselle','Meurthe-et-Moselle','Vosges','Meuse','Doubs','Jura','Haute-Saône','Territoire de Belfort','Savoie','Haute-Savoie','Ain'},
       'ITA':{'Bozen','Trento','Trieste','Gorizia'},'BEL':{'Liege','Namur','Luxembourg','Hainaut','Walloon Brabant','Flemish Brabant','Brussels','Antwerp','Limburg'},'DNK':set()}
for f in raw['features']:
    p=f['properties'];g=shape(f['geometry'])
    if not g.intersects(BB): continue
    g=g.buffer(0).intersection(BB).simplify(0.01)
    st=assign(p['adm0_a3'],p['name'],p.get('geonunit'))
    if st in ('mos','nov','kaz','hor') and g.representative_point().x>54: st=None
    if st is None: unk.setdefault(p['adm0_a3'],[]).append(p['name']); st='_none'
    groups.setdefault(st,[]).append(g)
    if p['adm0_a3'] in HRE_A3 or p['name'] in HRE_N.get(p['adm0_a3'],()):
        if not (p['adm0_a3']=='DEU' and p['name']=='Schleswig-Holstein'): hre.append(g)
print('unassigned (ok = poušť/bez státu):',{k:len(v) for k,v in unk.items()})
geo={k:unary_union(v) for k,v in groups.items()}
land=unary_union(list(geo.values()))
for st,poly in OVR:
    P=Polygon(poly).intersection(land)
    for k in list(geo):
        if k!=st: geo[k]=geo[k].difference(P)
    geo[st]=unary_union([geo.get(st,Polygon()),P])
hreU=unary_union(hre+[Polygon(OVR[0][1]),Polygon(OVR[1][1]),Polygon(OVR[2][1]),Polygon([(8.0,53.3),(11.5,53.3),(11.5,54.38),(8.0,54.38)])]).intersection(land)
# Lambertovo konformní kuželové zobrazení
R0=6371.0;lat1,lat2,lat0,lon0=map(math.radians,(40,60,48,15))
n=math.log(math.cos(lat1)/math.cos(lat2))/math.log(math.tan(math.pi/4+lat2/2)/math.tan(math.pi/4+lat1/2))
F=math.cos(lat1)*math.tan(math.pi/4+lat1/2)**n/n; rho0=F/math.tan(math.pi/4+lat0/2)**n
def prj(lon,lat):
    la=math.radians(lat);rho=F/math.tan(math.pi/4+la/2)**n;th=n*(math.radians(lon)-lon0)
    return rho*math.sin(th), rho0-rho*math.cos(th)
c=[prj(lo,la) for lo in (-26,-10,0,13,26,40,52) for la in (27.5,40,50,60,72)]
minx=min(x for x,_ in c);maxx=max(x for x,_ in c);miny=min(y for _,y in c);maxy=max(y for _,y in c)
# výřez: od Islandu po Kaspik, od Sahary po Laponsko
X0=min(prj(-25,64)[0],prj(-10.5,36)[0],prj(-18,28)[0]);X1=prj(49,34)[0]; Y0=prj(15,27.5)[1]; Y1=prj(15,71.5)[1]
S=1000/(X1-X0)
def P(lon,lat):
    x,y=prj(lon,lat);return ((x-X0)*S,(Y1-y)*S)
print('n',round(n,4),'consts',F,rho0,X0,Y1,S)
json.dump({'n':n,'F':F,'rho0':rho0,'X0':X0,'Y1':Y1,'S':S,'lon0':15},open('/tmp/claude-0/svet/proj.json','w'))
FR=box(-25,-25,1025,800)
def tp(g): return transform(lambda x,y,z=None:P(x,y),g).buffer(0).intersection(FR)
def rings(g,tol,minarea):
    out=[]
    for q in ([g] if g.geom_type=='Polygon' else [x for x in getattr(g,'geoms',[]) if x.geom_type=='Polygon']):
        q=q.simplify(tol,preserve_topology=True)
        if q.is_empty or q.area<minarea: continue
        out.append([[ [round(x,1),round(y,1)] for x,y in list(q.exterior.coords)[:-1]]]+[[ [round(x,1),round(y,1)] for x,y in list(h.coords)[:-1]] for h in q.interiors if Polygon(h).area>minarea])
    return out
D={'states':{},'lab':{},'land':None,'proj':{'n':n,'F':F,'rho0':rho0,'X0':X0,'Y1':Y1,'S':S,'lon0':15}}
for k,g in geo.items():
    if k=='_none' or g.is_empty: continue
    G=tp(g.buffer(0))
    if G.is_empty: continue
    D['states'][k]=rings(G,0.7,1.5)
    big=max(([G] if G.geom_type=='Polygon' else list(G.geoms)),key=lambda q:q.area)
    lp=polylabel(big,0.5); D['lab'][k]=[round(lp.x,1),round(lp.y,1),round(math.sqrt(big.area),1)]
D['land']=rings(tp(land.buffer(0)),0.6,1.0)
D['hre']=rings(tp(hreU.buffer(0.02).buffer(-0.02)),0.8,20)
# sousedství pro barvení
nb={k:set() for k in geo if k!='_none'}
ks=[k for k in nb]
for i,a in enumerate(ks):
    for b in ks[i+1:]:
        if geo[a].buffer(0.15).intersects(geo[b]): nb[a].add(b);nb[b].add(a)
col={}
for k in sorted(ks,key=lambda k:-len(nb[k])):
    used={col[j] for j in nb[k] if j in col}
    col[k]=next(c for c in range(12) if c not in used)
D['col']=col
# řeky a jezera
RIV={'Danube':'Dunaj','Rhine':'Rýn','Elbe':'Labe','Oder':'Odra','Vistula':'Visla','Dnieper':'Dněpr','Dniester':'Dněstr','Don':'Don','Volga':'Volha','Po':'Pád','Rhône':'Rhôna','Loire':'Loira','Seine':'Seina',
     'Thames':'Temže','Tagus':'Tajo','Ebro':'Ebro','Nile':'Nil','Euphrates':'Eufrat','Tigris':'Tigris','Neman':'Němen','Daugava':'Daugava','Western Dvina':'Daugava','Weser':'Vezera','Main':'Mohan','Garonne':'Garonna','Douro':'Duero','Guadalquivir':'Guadalquivir','Dvina':'Dvina','Northern Dvina':'Severní Dvina','Kama':'Kama','Oka':'Oka','Sava':'Sáva','Tisza':'Tisa','Drava':'Dráva','Prut':'Prut','Bug':'Bug','Southern Bug':'Jižní Bug','Vltava':'Vltava','Moldau':'Vltava','Inn':'Inn','Meuse':'Máza','Maas':'Máza','Morava':'Morava','Mures':'Mureš','Kızılırmak':'Kızılırmak','Volkhov':'Volchov','Desna':'Desna','Pripyat':'Pripjať','Donets':'Doněc','Neva':'Něva','Dnepr':'Dněpr','Dnestr':'Dněstr','Tiber':'Tibera','Arno':'Arno','Guadiana':'Guadiana','Ural':'Ural','Orontes':'Orontes','Jordan':'Jordán'}
rv=json.load(open('/tmp/claude-0/svet/ne/ne_50m_rivers_lake_centerlines.geojson'))
rivs=[]
for f in rv['features']:
    p=f['properties'];nm=p.get('name_en') or p.get('name') or ''
    key=next((k for k in RIV if k.lower()==nm.lower() or nm.lower().startswith(k.lower()+' ')),None)
    if not key: continue
    g=shape(f['geometry']).intersection(BB)
    if g.is_empty: continue
    for ln in ([g] if g.geom_type=='LineString' else [x for x in getattr(g,'geoms',[]) if x.geom_type=='LineString']):
        q=transform(lambda x,y,z=None:P(x,y),ln).intersection(FR).simplify(0.8)
        if q.is_empty or q.geom_type!='LineString': continue
        if q.length<6: continue
        rivs.append({'n':RIV[key],'p':[[round(x,1),round(y,1)] for x,y in q.coords],'r':p.get('scalerank',5)})
D['rivers']=rivs
lk=json.load(open('/tmp/claude-0/svet/ne/ne_50m_lakes.geojson'))
lakes=[]
for f in lk['features']:
    g=shape(f['geometry']).buffer(0).intersection(BB)
    if g.is_empty or g.area<0.05: continue
    lakes+=rings(tp(g),0.6,2)
D['lakes']=lakes
json.dump(D,open('/home/claude/mundusmutatus/art/svet.json','w'),separators=(',',':'))
import os;print('states',len(D['states']),'rivers',len(rivs),'lakes',len(lakes),os.path.getsize('/home/claude/mundusmutatus/art/svet.json')//1024,'kB')
print('H',round((Y1-Y0)*S,1))
