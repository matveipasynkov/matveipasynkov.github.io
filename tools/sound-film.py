import numpy as np,wave,json
from pathlib import Path
sr=48000;duration=28;n=sr*duration
stereo=np.zeros((n,2));rng=np.random.default_rng(61)
def add(at,a,pan=0):
 i=round(at*sr);offset=max(0,-i);i=max(i,0);a=a[offset:];m=min(len(a),n-i)
 if m>0:
  stereo[i:i+m,0]+=a[:m]*np.sqrt((1-pan)/2)
  stereo[i:i+m,1]+=a[:m]*np.sqrt((1+pan)/2)
def pad(at,frequencies,length,level=.012):
 t=np.arange(round(length*sr))/sr;env=np.sin(np.pi*np.clip(t/1.3,0,1)/2)**2*np.sin(np.pi*np.clip((length-t)/1.7,0,1)/2)**2
 for k,f in enumerate(frequencies):
  signal=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t+.7)+.09*np.sin(2*np.pi*f*3*t))*env*level
  add(at,signal,np.sin(k*2.1)*.55);add(at+.14,signal*.2,-np.sin(k*2.1)*.55)
def pluck(at,f,length=.65,level=.035,pan=0):
 t=np.arange(round(length*sr))/sr;env=(1-np.exp(-t*110))*np.exp(-t*6)*np.clip((length-t)/.12,0,1)
 a=(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.01*t)+.08*np.sin(2*np.pi*f*4.03*t))*env*level
 add(at,a,pan);add(at+.22,a*.18,-pan)
def impact(at,level=.12):
 t=np.arange(round(.85*sr))/sr;phase=np.cumsum(42+75*np.exp(-t*20))*2*np.pi/sr
 add(at,np.sin(phase)*(1-np.exp(-t*120))*np.exp(-t*7)*level)
def sweep(at,length=.7,level=.045,pan=0):
 t=np.arange(round(length*sr))/sr;noise=rng.standard_normal(len(t));soft=np.convolve(noise,np.ones(12)/12,'same');low=np.convolve(soft,np.ones(90)/90,'same')
 add(at,(soft-low)*np.sin(np.pi*t/length)**2*level,pan)
# An original warm electronic bed follows the physical actions, with room for the copy.
pad(0,[82.4069,123.4708,164.8138],7.5,.017)
pad(5.8,[82.4069,138.5913,207.6523],7.0,.014)
pad(11.8,[92.4986,146.8324,246.9417],8.3,.016)
pad(19,[82.4069,123.4708,207.6523],7.1,.018)
pad(25.0,[82.4069,123.4708,164.8138,329.6276],3,.014)
for at in [0,2.5,5.8,9.8,14.1,17.6,20.2,23.3,25.5]:impact(at,.09 if at<17 else .13)
for at,pan in [(2.65,-.4),(3.65,.25),(5.4,.4),(8.9,-.3),(11.9,.35),(17.6,.4),(24.5,-.25)]:sweep(at-.2,.65,.05,pan)
# Short dry paper rustles as the sheets open; no speech or external samples.
for i in range(6):sweep(3.55+i*.14,.22,.022,np.linspace(-.55,.55,6)[i])
for j,at in enumerate([6.2,7.0,7.8,9.9,10.35,10.8,14.0,14.7,15.4,16.9,20.9,21.6,22.3,23.0]):
 pluck(at,[329.6276,493.8833,659.2551,739.9888][j%4],.65,.027,np.sin(j*1.6)*.5)
for at in np.arange(12.3,18,.75):pluck(at,164.8138,.55,.022,-.15)
fade=np.minimum(np.arange(n)/(sr*.12),1)*np.minimum((n-np.arange(n))/(sr*.8),1)
stereo*=fade[:,None];stereo=np.tanh(stereo*1.6)*.8
out=Path(__file__).resolve().parents[2]/'cinema-v6'/'sound.wav'
out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((stereo*32767).astype('<i2').tobytes())
(out.parent/'audio-check.json').write_text(json.dumps({'duration':duration,'sample_rate':sr,'peak_dbfs':float(20*np.log10(np.abs(stereo).max())),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(stereo**2)))),'voice':False},indent=2))
print(out)
