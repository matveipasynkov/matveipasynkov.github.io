"""Deterministic portfolio film. Requires Python, Pillow, NumPy and ffmpeg.

Style, copy, timings and geometry are independent, so a new visual direction
does not require editing a video timeline by hand.
"""
from pathlib import Path
from functools import lru_cache
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
W,H,FPS,DURATION=1280,720,30,24
BG=(17,18,16); INK=(242,242,233); ACID=(212,253,85); MUTED=(160,164,151)
BACKDROP=Image.new('RGB',(W,H),BG)
HALO=Image.new('RGB',(W,H)); ImageDraw.Draw(HALO).ellipse((750,190,1100,535),fill=(15,20,4))
BACKDROP=ImageChops.add(BACKDROP,HALO.filter(ImageFilter.GaussianBlur(75)))
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
REG='/System/Library/Fonts/Supplemental/Arial.ttf'
@lru_cache(None)
def font(n,bold=False): return ImageFont.truetype(BOLD if bold else REG,n)
def clamp(x): return max(0,min(1,x))
def smooth(x):
    x=clamp(x); return x*x*(3-2*x)
def mix(a,b,p): return a*(1-p)+b*p
COPY={
 'ru':[
  ('МАТВЕЙ ПАСЫНКОВ',['ПРОЦЕССЫ.','ДАННЫЕ.','РЕЗУЛЬТАТ.'],'Бизнес-анализ / Оптимизация / AI'),
  ('01 / АНАЛИЗ',['ПОНЯТЬ','СИСТЕМУ.'],'Разобраться, как работает бизнес.'),
  ('02 / ГИПОТЕЗА',['ПРОВЕРИТЬ','ИДЕЮ.'],'Создать прототип. Проверить гипотезу.'),
  ('03 / ИНСТРУМЕНТ',['СОБРАТЬ','РЕШЕНИЕ.'],'Автоматизировать подготовку предложений.'),
  ('КЕЙС / КОНСТРУКТОР КП',['≈ 60 → ≤ 10','МИНУТ.'],'На подготовку одного предложения.'),
  ('БИЗНЕС × ИНЖЕНЕРИЯ',['МЕНЬШЕ РУТИНЫ.','БОЛЬШЕ СМЫСЛА.'],'Матвей Пасынков / matveipasynkov.github.io')],
 'en':[
  ('MATVEY PASYNKOV',['PROCESSES.','DATA.','IMPACT.'],'Business analysis / Optimization / AI'),
  ('01 / ANALYSIS',['UNDERSTAND','THE SYSTEM.'],'Explore how the business works.'),
  ('02 / HYPOTHESIS',['TEST','THE IDEA.'],'Build a prototype. Test the hypothesis.'),
  ('03 / TOOL',['BUILD','A SOLUTION.'],'Automate sales proposal preparation.'),
  ('CASE / PROPOSAL BUILDER',['≈ 60 → ≤ 10','MINUTES.'],'To prepare one sales proposal.'),
  ('BUSINESS × ENGINEERING',['LESS ROUTINE.','MORE IMPACT.'],'Matvey Pasynkov / matveipasynkov.github.io')]
}
verts=np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],float)/2
faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]]
base=np.array([[(i%4-1.5)*.59,(i//4%5-2)*.49,(i//20-1)*.74] for i in range(60)])
glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011']
sig=np.array([[(x-5.5)*.32,(2.5-y)*.32,0] for y,row in enumerate(glyph) for x,v in enumerate(row) if v=='1'])
signature=np.zeros((60,3)); signature[:len(sig)]=sig
def geometry(t):
    opened=smooth((t-3.7)/1.3)*(1-smooth((t-8.0)/1.7))
    packed=smooth((t-12)/1.6)*(1-smooth((t-19.8)/1.8))
    mono=smooth((t-20)/2)
    positions=base*np.array([1+opened*.85,1+opened*.8,1+opened*.8])
    target=np.array([[(i%10-4.5)*.36,(i//10-2.5)*.37,0] for i in range(60)])
    positions=mix(positions,target,packed)
    positions=mix(positions,signature,mono)
    dims=mix(np.array([.54,.43,.68]),np.array([.30,.30,.22]),packed)
    dims=mix(dims,np.array([.27,.27,.20]),mono)
    yaw=mix(-.6+.11*math.sin(t*.6),0,mono)
    pitch=mix(.32,0,mono)
    ry=np.array([[math.cos(yaw),0,math.sin(yaw)],[0,1,0],[-math.sin(yaw),0,math.cos(yaw)]])
    rx=np.array([[1,0,0],[0,math.cos(pitch),-math.sin(pitch)],[0,math.sin(pitch),math.cos(pitch)]])
    return positions,dims,rx@ry,mono,packed
def cube(im,t):
    d=ImageDraw.Draw(im); positions,dims,R,mono,packed=geometry(t)
    # Perspective projection and a painter's depth sort; no random frame state.
    bounds=np.concatenate([(verts*dims+p)@R.T for p in positions[:len(sig) if mono>.98 else 60]])
    bx=bounds[:,0]*760/(7.5-bounds[:,2]); by=bounds[:,1]*760/(7.5-bounds[:,2])
    zoom=min(1,220/max(abs(bx)),210/max(abs(by)))
    def project(v):
        z=7.5-v[:,2]; return np.column_stack((930+v[:,0]*760*zoom/z,365-v[:,1]*760*zoom/z))
    polygons=[]
    for i,pos in enumerate(positions):
        if i>=len(sig) and mono>.98: continue
        scale=1 if i<len(sig) else 1-mono
        points=(verts*dims*scale+pos)@R.T
        center=pos@R.T
        for fi,ids in enumerate(faces):
            pv=points[ids]; normal=np.cross(pv[1]-pv[0],pv[2]-pv[0]); normal/=np.linalg.norm(normal)+1e-8
            if np.dot(normal,np.array([0,0,7.5])-pv.mean(axis=0))<=0: continue
            shade=.38+.62*max(0,float(np.dot(normal,np.array([-.4,.65,.65]))))
            shade*=.92+(i%7)*.012
            color=tuple(int(v*shade) for v in (69,73,60))
            polygons.append((pv[:,2].mean(),project(pv),color,fi,i,points,center))
    for _,poly,color,fi,i,points,center in sorted(polygons,key=lambda f:f[0]):
        coords=[tuple(p) for p in poly]
        d.polygon(coords,fill=color); d.line(coords+[coords[0]],fill=(78,83,68),width=1)
        if fi==1:
            panel=center+(points[faces[1]]-center)*.84
            panelpoly=project(panel); pp=[tuple(p) for p in panelpoly]
            d.polygon(pp,fill=tuple(int(v*.78) for v in color));d.line(pp+[pp[0]],fill=(60,65,50),width=1)
            # Acid seam sits on the panel's front face.
            a=panel[0]*.7+panel[3]*.3; b=panel[1]*.7+panel[2]*.3
            a=a*.85+b*.15; b=a*.1+b*.9
            seam=project(np.array([a,b])); d.line([tuple(p) for p in seam],fill=ACID if packed>.2 else (136,155,72),width=2)
    return im
def frame(t,lang):
    im=BACKDROP.copy()
    d=ImageDraw.Draw(im)
    d.line((56,87,1224,87),fill=(52,55,46)); d.line((56,644,1224,644),fill=(52,55,46))
    d.text((56,31),'mp.',font=font(34,True),fill=INK)
    d.text((970,44),'PROCESSES / DATA / IMPACT',font=font(13),fill=MUTED)
    im=cube(im,t); d=ImageDraw.Draw(im)
    scene=min(5,int(t/4)); local=t-scene*4; label,lines,sub=COPY[lang][scene]
    opacity=smooth(local/.42)*(1-smooth((local-3.65)/.35)) if scene<5 else smooth(local/.42)
    fg=Image.new('RGBA',(W,H)); f=ImageDraw.Draw(fg)
    slide=int(22*(1-smooth(local/.6)))
    f.text((56,167+slide),label,font=font(15),fill=ACID)
    size=64 if scene<4 else 60 if scene==4 else 43
    yy=222+slide
    for k,line in enumerate(lines):
        chosen=ACID if k==len(lines)-1 else INK
        f.text((52,yy+k*(size+9)),line,font=font(size,True),fill=chosen)
    sy=max(480,yy+len(lines)*(size+9)+30)
    f.text((56,sy),sub,font=font(20),fill=MUTED)
    if scene in [1,2,3]:
        for k,name in enumerate(['АНАЛИЗ','ПРОТОТИП','ИНСТРУМЕНТ'] if lang=='ru' else ['ANALYSIS','PROTOTYPE','TOOL']):
            xx=56+k*165
            f.rectangle((xx,563,xx+146,602),outline=ACID if k==scene-1 else (65,69,58),width=1)
            f.text((xx+12,575),name,font=font(12),fill=ACID if k==scene-1 else MUTED)
    if scene==4:
        f.rectangle((56,567,416,575),fill=(62,66,54));f.rectangle((56,567,116,575),fill=ACID)
        f.text((56,591),'Конструктор коммерческих предложений' if lang=='ru' else 'Sales proposal builder',font=font(13),fill=MUTED)
    fg.putalpha(fg.getchannel('A').point(lambda v:int(v*opacity)))
    im=Image.alpha_composite(im.convert('RGBA'),fg).convert('RGB');d=ImageDraw.Draw(im)
    labels=['ПРОЦЕССЫ','АНАЛИЗ','ГИПОТЕЗА','ИНСТРУМЕНТ','РЕЗУЛЬТАТ','ПОДХОД'] if lang=='ru' else ['PROCESSES','ANALYSIS','HYPOTHESIS','TOOL','IMPACT','APPROACH']
    for i,name in enumerate(labels):
        x=56+i*196; d.text((x,670),f'0{i+1} / {name}',font=font(12),fill=ACID if i==scene else (98,103,88))
        d.line((x,656,x+172,656),fill=(52,55,46),width=2)
        if i==scene: d.line((x,656,x+172*clamp(local/4),656),fill=ACID,width=2)
    return im
def render(lang):
    out=OUT/f'resume-film-{lang}.mp4'
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
    for i in range(FPS*DURATION):
        p.stdin.write(frame(i/FPS,lang).tobytes())
        if i%120==0: print(f'{lang}: {i//FPS}s',flush=True)
    p.stdin.close()
    if p.wait(): raise RuntimeError('Encoder failed')
    frame(1.5,lang).save(OUT/f'resume-film-{lang}.jpg',quality=90)
if __name__=='__main__':
    for lang in (sys.argv[1:] or ['ru','en']): render(lang)
