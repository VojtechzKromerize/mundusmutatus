# Vyrobí kreslený praporec pro menu Mapy: art/menu/prapor-{horni,stred,spodni,oddelovac}.svg
# Spuštění: python3 zdroj/prapor_svg.py
import re,math
INK="#2e1a0c"; RED="#a8262c"; RED2="#8c1d23"; RED3="#c0363a"; G="#d9a93f"; G2="#a7771c"; G3="#f6dc8a"
W=414; FL,FR=66.5,347.5-12  # okraje látky
FR=335.5; CX=201
BL=(72,92); BR=(2*201-92,2*201-72)   # zlaté linky bordur (vlevo, vpravo)
P=60  # výška opakované dlaždice
BORDURA=False
RAM=True  # zlatý rám podél okraje látky
RO=6     # odsazení rámu od okraje
def ram(d):
  return f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="3.8" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="{G}" stroke-width="2.3" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="{G3}" stroke-width=".6" stroke-linejoin="round" opacity=".7"/>' if RAM else ''  # zlaté postranní bordury (úponka s trojlístky); vypnuto na přání

def fabric_shading(y0,y1):
  # ploché svislé záhyby
  s=""
  for x,w,c,o in ((114,14,RED2,.35),(178,7,RED3,.25),(238,12,RED2,.3),(284,8,RED3,.2)):
    s+=f'<rect x="{x}" y="{y0}" width="{w}" height="{y1-y0}" fill="{c}" opacity="{o}"/>'
  return s

def vine(c,y):
  return f'<path d="M{c},{y}C{c+8},{y+P*.18} {c+8},{y+P*.32} {c},{y+P*.5}S{c-8},{y+P*.82} {c},{y+P}" fill="none" stroke="{G}" stroke-width="1.6"/>'
def border_seg(y,band=False):
  s=""
  if not BORDURA: return s
  for a,b in (BL,BR):
    c=(a+b)/2
    if band: s+=f'<rect x="{a-2}" y="{y-2}" width="{b-a+4}" height="4" fill="{G}" stroke="{INK}" stroke-width=".6"/>'
    s+=vine(c,y)
    for yy,dx,rot in ((y+P*.25,-4.6,1),(y+P*.75,4.6,-1)):
      x=c+dx
      s+=(f'<g fill="{G}" stroke="{INK}" stroke-width=".5"><circle cx="{x}" cy="{yy-2.6}" r="2.1"/><circle cx="{x-2.3}" cy="{yy+.6}" r="2.1"/><circle cx="{x+2.3}" cy="{yy+.6}" r="2.1"/></g>')
    s+=f'<circle cx="{c}" cy="{y+P*.5}" r="1.3" fill="{G3}"/>'
  return s

def border_lines(y0,y1):
  if not BORDURA: return ""
  d="".join(f"M{x},{y0}V{y1}" for x in BL+BR)
  return f'<path d="{d}" stroke="{INK}" stroke-width="3.6"/><path d="{d}" stroke="{G}" stroke-width="2.4"/>'

def kalich(cx,y,k=1.0):
  def p(x,yy): return f"{cx+x*k:.1f},{y+yy*k:.1f}"
  return (f'<g fill="{G}" stroke="{INK}" stroke-width="1.1" stroke-linejoin="round">'
    f'<path d="M{p(-11,0)}H{cx+11*k:.1f}C{p(11,11)} {p(6,16)} {p(0,16)}C{p(-6,16)} {p(-11,11)} {p(-11,0)}Z"/>'
    f'<rect x="{cx-1.6*k:.1f}" y="{y+16*k:.1f}" width="{3.2*k:.1f}" height="{8*k:.1f}"/>'
    f'<ellipse cx="{cx}" cy="{y+20*k:.1f}" rx="{3.8*k:.1f}" ry="{2.1*k:.1f}"/>'
    f'<path d="M{p(-8,29)}C{p(-7,25)} {p(-3,24)} {p(0,24)}C{p(3,24)} {p(7,25)} {p(8,29)}Z"/></g>'
    f'<path d="M{p(-8,3)}C{p(-7,9)} {p(-4,12)} {p(-1,13)}" fill="none" stroke="{G3}" stroke-width="{1.4*k:.1f}" stroke-linecap="round"/>'
    f'<path d="M{p(9,2)}C{p(8,9)} {p(5,13)} {p(1,14.5)}" fill="none" stroke="{G2}" stroke-width="{1.4*k:.1f}" stroke-linecap="round"/>')

def lilie(x,y,smer):
  # kovaná hlavice ratiště: prstenec, koule a hrot (smer -1 vlevo, +1 vpravo)
  m=f'matrix({smer} 0 0 1 {x} {y})'
  return (f'<g transform="{m}" fill="#55565e" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round">'
    f'<path d="M14,0L19,-5.5L33,0L19,5.5Z"/>'
    f'<path d="M10,-3.5C12,-6 16,-7 18,-4.5L20,0L18,4.5C16,7 12,6 10,3.5Z"/>'
    f'<circle cx="8" cy="0" r="4.6"/>'
    f'<rect x="-1" y="-6" width="5" height="12" rx="1.2"/>'
    f'<path d="M20,-1.6L29,-.3M5.8,-2.6a3,3 0 0 1 3.2,-1.2M12,-3.4C14,-4.8 16,-4.6 17,-3.2" fill="none" stroke="#a3a5b0" stroke-width="1" stroke-linecap="round"/></g>')

def horni():
  s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 90">'
  # látka (horní okraj mezi poutky)
  s+=f'<path d="M{FL},38H{FR}V90H{FL}Z" fill="{RED}"/>'+fabric_shading(38,90)
  s+=f'<path d="M{FL},40H{FR}" stroke="{RED2}" stroke-width="3"/>'
  # bordura: linky začínají růžicí
  s+=border_lines(52,90)
  s+=f'<clipPath id="hc"><rect x="0" y="54" width="{W}" height="40"/></clipPath><g clip-path="url(#hc)">'+border_seg(30)+'</g>'
  for a,b in ((BL,BR) if BORDURA else ()):
    s+=f'<rect x="{a-2}" y="50" width="{b-a+4}" height="4" fill="{G}" stroke="{INK}" stroke-width=".6"/>'
  s+=ram(f'M{FL+RO},90V47H{FR-RO}V90')
  s+=f'<path d="M{FL},38V90M{FR},38V90" stroke="{INK}" stroke-width="1.6"/>'
  s+=f'<path d="M{FL},38H{FR}" stroke="{INK}" stroke-width="1.4"/>'
  # ratiště
  s+=f'<rect x="38" y="20" width="{W-76}" height="8" rx="2" fill="#7a4e2a" stroke="{INK}" stroke-width="1.3"/>'
  s+=f'<path d="M32,22.6H{W-32}" stroke="#a87444" stroke-width="1.4"/><path d="M60,26H120M180,26.2H260M300,26H360" stroke="#5c3a1e" stroke-width=".9"/>'
  s+=lilie(41,24,-1)+lilie(W-41,24,1)
  # poutka přes ratiště
  for x0,x1 in ((FL,FL+34),(CX-17,CX+17),(FR-34,FR)):
    s+=f'<path d="M{x0},15C{x0},12 {x0+2},11 {x0+5},11H{x1-5}C{x1-2},11 {x1},12 {x1},15V40H{x0}Z" fill="{RED}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round"/>'
    s+=f'<path d="M{x0+3},14H{x1-3}" stroke="{RED3}" stroke-width="1.6" stroke-linecap="round"/>'
    for k in range(1,4):
      xx=x0+(x1-x0)*k/4;s+=f'<path d="M{xx},17V37" stroke="{RED2}" stroke-width="1.2"/>'
    s+=f'<path d="M{x0},40H{x1}" stroke="{INK}" stroke-width="1.1"/>'
  s+=kalich(CX,52,1.0)
  return s+"</svg>"

def stred():
  s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {P}" preserveAspectRatio="none">'
  s+=f'<rect x="{FL}" y="0" width="{FR-FL}" height="{P}" fill="{RED}"/>'+fabric_shading(0,P)
  s+=border_lines(0,P)+border_seg(0)
  s+=ram(f'M{FL+RO},0V{P}M{FR-RO},0V{P}')
  s+=f'<path d="M{FL},0V{P}M{FR},0V{P}" stroke="{INK}" stroke-width="1.6"/>'
  return s+"</svg>"

def spodni():
  H=130; A=(FL,106); B=(CX,44); C=(FR,106)
  poly=f"M{FL},0H{FR}V{C[1]}L{CX},{B[1]}L{FL},{A[1]}Z"
  s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><defs><clipPath id="c"><path d="{poly}"/></clipPath></defs>'
  # třásně pod šikmým okrajem
  fr=""
  x=FL+5
  i=0
  while x<FR-4:
    yE=A[1]-(x-FL)*(A[1]-B[1])/(CX-FL) if x<=CX else B[1]+(x-CX)*(C[1]-B[1])/(FR-CX)
    col=G if i%2==0 else G2
    fr+=f'<path d="M{x:.1f},{yE+1:.1f}l{0.4 if x<CX else -0.4},{10+ (i%3)}" stroke="{col}" stroke-width="1.5" stroke-linecap="round"/>'
    x+=2.1;i+=1
  s+=f'<g>{fr}</g>'
  s+=f'<path d="{poly}" fill="{RED}"/>'
  s+=f'<g clip-path="url(#c)">'+fabric_shading(0,H)+border_lines(4,H)+border_seg(2)+border_seg(2+P)+border_seg(2,True)+'</g>'
  k=(A[1]-B[1])/(CX-FL); dv=9*math.sqrt(1+k*k)
  s+=ram(f'M{FL+RO},0V{A[1]-RO*k-dv:.1f}L{CX},{B[1]-dv:.1f}L{FR-RO},{C[1]-RO*k-dv:.1f}V0')
  # lemovka
  s+=f'<path d="M{FL},{A[1]}L{CX},{B[1]}L{FR},{C[1]}" fill="none" stroke="{INK}" stroke-width="5.5" stroke-linejoin="round"/>'
  s+=f'<path d="M{FL},{A[1]}L{CX},{B[1]}L{FR},{C[1]}" fill="none" stroke="{G}" stroke-width="3.4" stroke-linejoin="round"/>'
  s+=f'<path d="M{FL},0V{A[1]}M{FR},0V{C[1]}" stroke="{INK}" stroke-width="1.6"/>'
  # střapce
  for tx in (FL,FR):
    y=A[1]
    s+=(f'<g stroke="{INK}" stroke-width="1" stroke-linejoin="round">'
        f'<circle cx="{tx}" cy="{y+5}" r="5" fill="{G}"/>'
        f'<path d="M{tx-4.5},{y+10}H{tx+4.5}L{tx+8},{y+23}H{tx-8}Z" fill="{G}"/>'
        f'<rect x="{tx-5}" y="{y+9.5}" width="10" height="3" fill="{G2}"/></g>'
        f'<path d="M{tx-4},{y+13}l-2,9M{tx-1.3},{y+13}l-.6,9.5M{tx+1.3},{y+13}l.6,9.5M{tx+4},{y+13}l2,9" stroke="{G2}" stroke-width=".9"/>'
        f'<path d="M{tx-2},{y+2.5}a2.4,2.4 0 0 1 2.8,-.7" fill="none" stroke="{G3}" stroke-width="1.1"/>')
  return s+"</svg>"

def oddelovac():
  s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 16">'
  s+=f'<path d="M14,8H86M114,8H186" stroke="{INK}" stroke-width="3"/><path d="M14,8H86M114,8H186" stroke="{G}" stroke-width="1.5"/>'
  s+=f'<g fill="{G}" stroke="{INK}" stroke-width=".7"><path d="M4,8l6,-3.4l6,3.4l-6,3.4Z"/><path d="M184,8l6,-3.4l6,3.4l-6,3.4Z"/><circle cx="88" cy="8" r="1.8"/><circle cx="112" cy="8" r="1.8"/></g>'
  s+=kalich(100,1.2,.45)
  return s+"</svg>"

if __name__=="__main__":
  import os
  d=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","art","menu")
  for n,f in (("horni",horni),("stred",stred),("spodni",spodni),("oddelovac",oddelovac)):
    open(os.path.join(d,f"prapor-{n}.svg"),"w").write(f())
