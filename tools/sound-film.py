import numpy as np,wave
from pathlib import Path
sr=48000;d=28;n=sr*d;y=np.zeros((n,2),np.float64);rng=np.random.default_rng(17)
def add(at,a,pan=0):
 i=int(at*sr);m=min(len(a),n-i)
 if i>=0 and m>0:y[i:i+m,0]+=a[:m]*np.sqrt((1-pan)/2);y[i:i+m,1]+=a[:m]*np.sqrt((1+pan)/2)
def note(at,f,dur,vol=.05,pan=0):
 t=np.arange(int(dur*sr))/sr;env=np.minimum(t/.016,1)*np.exp(-t*2.7)*np.minimum((dur-t)/.08,1)
 a=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t))*env*vol;add(at,a,pan)
# An original sparse electronic score, with no sampled music or speech.
for at in np.arange(.6,24.5,.75):
 f=[164.8138,246.9417,329.6276,369.9944,329.6276,246.9417,207.6523,246.9417][int((at-.6)/.75)%8];note(at,f,.7,.035,np.sin(at)*.55)
for at in [0,3.45,6.75,10.15,13.95,18,20,23.1,25.4]:
 dur=.65;t=np.arange(int(dur*sr))/sr;f=45+105*np.exp(-t*16);phase=2*np.pi*np.cumsum(f)/sr;a=np.sin(phase)*np.exp(-t*10)*.26;add(at,a)
for at in [3.45,6.75,10.15,13.95,18,23.1,25.4]:
 dur=.72;t=np.arange(int(dur*sr))/sr;noise=rng.standard_normal(len(t));noise=np.convolve(noise,np.ones(18)/18,'same');env=np.sin(np.pi*t/dur)**2;add(at-.36,noise*env*.075,.3)
for at in [8,8.35,8.7,11.2,11.55,11.9,15.2,15.6]:note(at,988,.14,.024,-.4)
for f in [82.4069,123.4708,164.8138]:note(25.5,f,2.5,.04)
# Fade the complete track in/out and control peaks without pumping.
y*=np.minimum(np.arange(n)/(sr*.1),1)[:,None];y*=np.minimum((n-np.arange(n))/(sr*.55),1)[:,None]
y=np.tanh(y*1.4)*.7
out=Path(__file__).resolve().parents[2]/'cinema-v4'/'sound.wav'
out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((y*32767).astype('<i2').tobytes())
