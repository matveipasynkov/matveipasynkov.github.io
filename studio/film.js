import * as T from '../vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {HDRLoader} from '../vendor/HDRLoader.js';
await document.fonts.ready;
const specimen='Матвей Пасынков Бизнес Инженерия Данные клиента Правила Рекомендации mp. 60 ≤ →';
const loadedFonts=await Promise.all([document.fonts.load('800 220px Manrope',specimen),document.fonts.load('600 60px Manrope',specimen)]);
if(loadedFonts.some(faces=>!faces.length))throw new Error('Manrope could not be loaded');
const W=2560,H=1440,D=28,FPS=60,acid='#d4fd55',ink='#f2f2e9',bg='#111210';
const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
document.querySelector('#stage').append(canvas);const c=canvas.getContext('2d',{alpha:false});
const slider=document.querySelector('#time'),status=document.querySelector('#status');
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H,false);renderer.setPixelRatio(1.5);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.setClearColor(bg);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.fog=new T.Fog(bg,10,23);const camera=new T.PerspectiveCamera(36,W/H,.1,120);
const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.03).texture;room.dispose();pm.dispose();
try{
 const hdr=await new HDRLoader().loadAsync('../assets/studio-small-09-1k.hdr');
 const generator=new T.PMREMGenerator(renderer),old=scene.environment;scene.environment=generator.fromEquirectangular(hdr).texture;
 old.dispose();hdr.dispose();generator.dispose();scene.environmentRotation.y=.45;
}catch(_){}
scene.environmentIntensity=.85;
scene.add(new T.HemisphereLight(0xf2f2e9,0x171a10,.75));
const key=new T.DirectionalLight(0xffffff,2.8);key.position.set(-6,10,10);scene.add(key);
const rim=new T.DirectionalLight(0xd4fd55,2.1);rim.position.set(7,3,-5);scene.add(rim);
const fill=new T.DirectionalLight(0xdee6df,1.1);fill.position.set(5,-3,8);scene.add(fill);
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ease=x=>1-Math.pow(1-clamp(x),4),lerp=(a,b,t)=>a+(b-a)*t;
let lang='ru',time=0,playing=false,start=0,exporting=false;
const tx=(ru,en)=>lang==='ru'?ru:en;
const typeSizes=new Map(),layoutErrors=new Set();
function fittedSize(lines,size,width,weight=800){
 const key=[lang,lines.join('|'),size,width,weight].join(':');
 if(!typeSizes.has(key)){c.font=`${weight} ${size}px Manrope`;const measured=Math.max(...lines.map(s=>c.measureText(s).width));typeSizes.set(key,Math.min(size,size*width/Math.max(1,measured)));}
 return typeSizes.get(key);
}
function text(s,x,y,size=100,color=ink,weight=800,align='left'){
 c.fillStyle=color;c.font=`${weight} ${size}px Manrope,Arial`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);
}
function round(ctx,x,y,w,h,r=20){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function texture(draw,w=1600,h=1100){const a=document.createElement('canvas');a.width=w;a.height=h;draw(a.getContext('2d'),w,h);const t=new T.CanvasTexture(a);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const glyph=texture((q,w,h)=>{q.fillStyle=acid;q.font='800 790px Manrope';q.textAlign='center';q.textBaseline='middle';q.fillText('mp.',w/2,h/2-50);},1800,1200);
// Anodized metal has broad studio reflections and fine directional machining.
const brushed=texture((q,w,h)=>{
 const data=q.createImageData(w,h);let seed=31;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){seed=(seed*1664525+1013904223)>>>0;const value=178+Math.sin(y*1.7)*8+(seed>>>24)/255*7,k=(y*w+x)*4;data.data[k]=data.data[k+1]=data.data[k+2]=value;data.data[k+3]=255;}q.putImageData(data,0,0);
},1024,1024);brushed.wrapS=brushed.wrapT=T.RepeatWrapping;brushed.repeat.set(2,2);brushed.colorSpace=T.NoColorSpace;
const metal=new T.MeshPhysicalMaterial({color:0x41473c,metalness:.94,roughness:.32,roughnessMap:brushed,bumpMap:brushed,bumpScale:.0012,clearcoat:.22,clearcoatRoughness:.32,anisotropy:.45});
const darkMetal=new T.MeshPhysicalMaterial({color:0x141a12,metalness:.85,roughness:.35,clearcoat:.15});
const edgeMetal=new T.MeshPhysicalMaterial({color:0x727967,metalness:1,roughness:.24});
const hero=new T.Group();scene.add(hero);
const box=new T.Mesh(new RoundedBoxGeometry(3.4,3.4,1.4,8,.17),metal);hero.add(box);box.castShadow=box.receiveShadow=true;
const faceInset=new T.Mesh(new RoundedBoxGeometry(3.08,3.08,.055,6,.12),darkMetal);faceInset.position.z=.714;hero.add(faceInset);
const lip=new T.Mesh(new RoundedBoxGeometry(2.99,2.99,.018,5,.09),metal);lip.position.z=.744;hero.add(lip);
for(const x of [-1.52,1.52])for(const y of [-1.52,1.52]){
 const screw=new T.Mesh(new T.CylinderGeometry(.025,.025,.012,16),edgeMetal);screw.rotation.x=Math.PI/2;screw.position.set(x,y,.75);hero.add(screw);
}
for(let i=0;i<9;i++){const vent=new T.Mesh(new RoundedBoxGeometry(.017,.11,.58,2,.006),darkMetal);vent.position.set(1.695,-.76+i*.19,0);hero.add(vent);}

const plate=new T.Mesh(new T.PlaneGeometry(2.95,1.97),new T.MeshBasicMaterial({map:glyph,transparent:true,toneMapped:false}));plate.position.z=.759;hero.add(plate);
const seam=new T.Mesh(new T.BoxGeometry(3.1,.035,.02),new T.MeshBasicMaterial({color:0xd4fd55}));seam.position.set(0,-1.35,.762);hero.add(seam);
const papers=new T.Group();scene.add(papers);const sheets=[],maps=[];
function sheetMap(i){return texture((q,w,h)=>{
 q.beginPath();q.roundRect(0,0,w,h,26);q.clip();q.fillStyle=i%3===0?'#d4fd55':'#e9eadf';q.fillRect(0,0,w,h);
 q.fillStyle='#15170f';q.font='800 100px Manrope';q.fillText(String(i+1).padStart(2,'0'),95,150);
 q.fillStyle='#434936';q.font='600 70px Manrope';q.fillText(tx('ДАННЫЕ / ПРЕДЛОЖЕНИЕ','DATA / PROPOSAL'),95,260);
 q.fillStyle='#111210';q.fillRect(95,350,w*.66,30);q.fillRect(95,420,w*.47,30);
 for(let j=0;j<5;j++){q.fillStyle=j===2?'#78845a':'#c5c8b9';q.fillRect(95,570+j*85,w-190,32);}
 q.strokeStyle='#828b70';q.lineWidth=4;q.strokeRect(95,h-210,290,110);q.font='600 54px Manrope';q.fillStyle='#15170f';q.fillText('mp.',130,h-140);
 },1100,1500);}
for(let i=0;i<6;i++){
 const g=new T.Group();const back=new T.Mesh(new RoundedBoxGeometry(1.7,2.32,.06,6,.03),new T.MeshStandardMaterial({color:i%3===0?0x778d39:0x8c9384,roughness:.65,metalness:.15}));g.add(back);
 const tex=sheetMap(i);maps.push(tex);const front=new T.Mesh(new T.PlaneGeometry(1.64,2.26),new T.MeshStandardMaterial({map:tex,roughness:.82,metalness:0,envMapIntensity:.35,transparent:true}));front.position.z=.031;g.add(front);
 papers.add(g);sheets.push(g);
}
const proposal=new T.Group();scene.add(proposal);
const housing=new T.Mesh(new RoundedBoxGeometry(6.8,4.6,.25,8,.15),metal);proposal.add(housing);housing.castShadow=housing.receiveShadow=true;
const screenWell=new T.Mesh(new RoundedBoxGeometry(6.57,4.37,.025,6,.1),darkMetal);screenWell.position.z=.132;proposal.add(screenWell);
const rail=new T.Mesh(new RoundedBoxGeometry(5.9,.012,.014,3,.005),edgeMetal);rail.position.set(0,-2.21,.132);proposal.add(rail);

let uiMap;
const display=new T.Mesh(new T.PlaneGeometry(6.48,4.28),new T.MeshBasicMaterial({toneMapped:false,transparent:true}));display.position.z=.148;proposal.add(display);
function refreshUI(){
 uiMap?.dispose();uiMap=texture((q,w,h)=>{
 q.beginPath();q.roundRect(0,0,w,h,42);q.clip();q.fillStyle='#171914';q.fillRect(0,0,w,h);
 q.strokeStyle='#4c5142';q.lineWidth=3;q.beginPath();q.moveTo(0,150);q.lineTo(w,150);q.stroke();
 q.fillStyle=acid;q.font='800 92px Manrope';q.fillText('mp.',65,110);
 q.fillStyle=ink;q.font='600 52px Manrope';q.fillText(tx('КОНСТРУКТОР ПРЕДЛОЖЕНИЙ','PROPOSAL BUILDER'),340,100);
 const cols=[tx('Данные клиента','Client data'),tx('Рекомендации','Recommendations'),tx('Предложение','Proposal')];
 cols.forEach((s,i)=>{
  const x=65+i*750;q.fillStyle=i===2?'#d4fd55':'#272c20';round(q,x,215,690,1160,28);q.fill();
  q.fillStyle=i===2?'#111210':ink;q.font='800 60px Manrope';q.fillText(s,x+50,320);q.font='600 42px Manrope';
  const labels=i===0?[tx('Профиль компании','Company profile'),tx('Потребности','Needs'),tx('Исходные данные','Source data')]:i===1?[tx('Правила подбора','Selection rules'),tx('Подходящие пакеты','Suitable packages'),tx('Проверка условий','Condition checks')]:[tx('Состав решения','Solution outline'),tx('Подходящие пакеты','Suitable packages'),tx('Готовый документ','Ready document')];
  labels.forEach((s,j)=>{q.fillStyle=i===2?'#263019':'#c2c8b5';q.fillText(s,x+50,480+j*210);q.fillStyle=i===2?'#a9c449':'#404a30';round(q,x+50,520+j*210,585,100,14);q.fill();q.fillStyle=i===2?'#566b23':'#87976c';q.fillRect(x+80,563+j*210,430-j*60,13);});
  q.fillStyle=i===2?'#111210':'#424d30';round(q,x+50,1180,585,110,15);q.fill();q.fillStyle=acid;q.font='800 42px Manrope';q.fillText(i===2?tx('СОБРАТЬ КП →','BUILD PROPOSAL →'):tx('ПРОВЕРЕНО ✓','VERIFIED ✓'),x+90,1250);
 });
 },2400,1600);display.material.map=uiMap;display.material.needsUpdate=true;
 maps.forEach(t=>t.dispose());maps.length=0;sheets.forEach((g,i)=>{const t=sheetMap(i);maps.push(t);g.children[1].material.map=t;});
}
refreshUI();
// One connected set: the camera travels from the source, through the logic,
// into the builder, then follows the output. No wipes or reset-to-title shots.
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
const cameraKeys=[
 [0,-.7,.6,5.1,0,0,0,-.07],
 [2.8,-2.2,1.2,9.2,0,.1,0,.02],
 [5,1.8,2.2,10.2,2.8,.1,-.6,.06],
 [8,6.4,.7,10.5,6.8,0,-1.9,-.06],
 [11,10.2,1.5,10.5,10.3,0,-3,.035],
 [14,16.2,2,8.8,14,0,-4,.025],
 [17,14.6,.6,6.8,14,0,-4,0],
 [20,18.7,1.3,11.7,17,0,1.3,-.025],
 [23,20.8,.8,12.2,18.7,0,3.4,.035],
 [26,19.5,.4,14.2,18.3,0,3.4,0],
 [28,19.2,.4,13.7,18.3,0,3.4,0]
];
function cameraValue(t,k){
 let i=0;while(i<cameraKeys.length-2&&t>cameraKeys[i+1][0])i++;
 const a=cameraKeys[i],b=cameraKeys[i+1],h=b[0]-a[0],u=clamp((t-a[0])/h),d=(b[k]-a[k])/h;
 const prev=cameraKeys[i-1],next=cameraKeys[i+2];
 const dl=prev?(a[k]-prev[k])/(a[0]-prev[0]):d,dr=next?(next[k]-b[k])/(next[0]-b[0]):d;
 const tangent=(x,y)=>x*y>0?2*x*y/(x+y):0;
 let m0=tangent(dl,d),m1=tangent(d,dr);
 if(d===0)m0=m1=0;else{const v=(m0/d)**2+(m1/d)**2;if(v>9){const q=3/Math.sqrt(v);m0*=q;m1*=q;}}
 return (2*u**3-3*u**2+1)*a[k]+(u**3-2*u**2+u)*h*m0+(-2*u**3+3*u**2)*b[k]+(u**3-u**2)*h*m1;
}
function cameraPose(t){camera.position.set(cameraValue(t,1),cameraValue(t,2),cameraValue(t,3));camera.lookAt(cameraValue(t,4),cameraValue(t,5),cameraValue(t,6));camera.rotateZ(cameraValue(t,7));}
const lid=new T.Group();hero.add(lid);
for(const m of [faceInset,lip,plate,seam]){hero.remove(m);lid.add(m);}
const result=new T.Group();scene.add(result);
const resultBody=new T.Mesh(new RoundedBoxGeometry(2.9,3.95,.095,8,.06),darkMetal);result.add(resultBody);
let finishedMap;
function refreshFinished(){
 finishedMap?.dispose();finishedMap=texture((q,w,h)=>{
  q.fillStyle='#e9eadf';q.fillRect(0,0,w,h);
  q.fillStyle='#111210';q.font='800 118px Manrope';q.fillText('mp.',80,160);
  q.font='800 102px Manrope';q.fillText(tx('Предложение','Proposal'),80,370);
  q.fillStyle='#647348';q.font='600 48px Manrope';q.fillText(tx('РЕШЕНИЕ ДЛЯ КЛИЕНТА','SOLUTION FOR THE CLIENT'),80,460);
  q.fillStyle='#d4fd55';q.beginPath();q.roundRect(80,560,w-160,520,28);q.fill();
  q.strokeStyle='#182013';q.lineWidth=24;q.lineCap='round';q.lineJoin='round';q.beginPath();q.moveTo(350,800);q.lineTo(475,925);q.lineTo(730,685);q.stroke();
  for(let i=0;i<3;i++){q.fillStyle=i===0?'#404c30':'#b7bfaa';q.fillRect(80,1170+i*74,w-160-i*110,20);}
 },1100,1500);
}
refreshFinished();
const backFrame=new T.Mesh(new RoundedBoxGeometry(2.78,3.83,.02,6,.04),metal);backFrame.position.z=-.058;result.add(backFrame);
const resultFace=new T.Mesh(new T.PlaneGeometry(2.78,3.81),new T.MeshBasicMaterial({map:finishedMap,toneMapped:false}));resultFace.position.z=.05;result.add(resultFace);
const resultBrand=new T.Mesh(new T.PlaneGeometry(2.65,1.77),new T.MeshBasicMaterial({map:glyph,transparent:true,toneMapped:false,side:T.DoubleSide}));resultBrand.rotation.y=Math.PI;resultBrand.position.z=-.073;result.add(resultBrand);
// Clock geometry contracts while the completed document remains in view.
const clock=new T.Group();scene.add(clock);
const clockMaterial=new T.MeshBasicMaterial({color:0xd4fd55});
const clockTicks=[];
for(let i=0;i<60;i++){
 const a=i*Math.PI/30;const tick=new T.Mesh(new T.BoxGeometry(i%5===0?.055:.028,i%5===0?.24:.13,.045),clockMaterial);
 tick.position.set(Math.sin(a)*2.85,Math.cos(a)*2.85,0);tick.rotation.z=-a;clock.add(tick);clockTicks.push(tick);
}
const clockHand=new T.Mesh(new T.BoxGeometry(.04,2.25,.055),clockMaterial);clockHand.position.y=1.125;
const handPivot=new T.Group();handPivot.add(clockHand);clock.add(handPivot);
const paperRight=new T.Vector3(),paperUp=new T.Vector3(),paperNormal=new T.Vector3(),flowCenter=new T.Vector3();
function cardPose(i,t){
 // Fixed row/column identity throughout: no crossings or reordering.
 const col=i%3-1,row=.5-Math.floor(i/3);
 const spread=smoother((t-3.15)/2.25),travel=smoother((t-5.4)/8.5),dock=smoother((t-13.8)/2.2);
 const drift=(1-smoother((t-13.2)/1.8))*spread;
 const x=(col*2.3+Math.sin(t*.7+col)*.14*drift)*spread,y=(row*2.6+Math.sin(t*.8+col*1.4)*.14*drift)*spread;
 const position=flowCenter.clone().addScaledVector(paperRight,x).addScaledVector(paperUp,y);
 // A real layered stack opens into the separated formation.
 position.addScaledVector(paperNormal,(1-smoother((spread-.85)/.15))*i*.055);
 position.lerp(new T.Vector3(14+col*2.3,row*1.5,-3.65-i*.007),dock);
 position.z=Math.max(position.z,-3.25)-.4*smoother((dock-.6)/.4);
 const scale=lerp(.82,.28,dock)*smoother((t-3.05)/.8)*(1-smoother((t-(16.15+i*.018))/.7));
 return {position,scale,dock};
}
function objectPose(t){
 cameraPose(t);
 const sourceExit=smoother((t-3.2)/2.0);hero.position.set(-sourceExit*8,-sourceExit*10,-sourceExit*6);hero.rotation.set(.06,-.2+smoother(t/3)*.35,0);
 const open=smoother((t-2.5)/2.4);lid.position.set(-open*4,open*3.6,open*.7);lid.rotation.x=-open*.27;
 const travel=smoother((t-5.4)/8.5);
 flowCenter.set(lerp(.15,cameraValue(t,4),smoother((t-3.15)/2.25)),.45*smoother((t-7)/1.2)*(1-smoother((t-13.8)/2.2)),Math.max(cameraValue(t,6)+lerp(.9,.35,travel),lerp(1.3,-20,smoother((t-5.1)/1.6))));
 const destinationOrientation=new T.Quaternion();
 const movingOrientation=camera.quaternion.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(.025*Math.sin(t*.7),.045*Math.sin(t*.6),.035*Math.sin(t*.5))));
 paperRight.set(1,0,0).applyQuaternion(movingOrientation);paperUp.set(0,1,0).applyQuaternion(movingOrientation);paperNormal.set(0,0,1).applyQuaternion(movingOrientation);
 sheets.forEach((g,i)=>{
  const p=cardPose(i,t);g.position.copy(p.position);g.quaternion.copy(movingOrientation).slerp(destinationOrientation,p.dock);
  g.scale.setScalar(p.scale);g.visible=p.scale>.0001;g.children[1].material.map=maps[i];
 });
 const toolExit=smoother((t-21.1)/2.3);proposal.position.set(14,-toolExit*10,-4-toolExit*5);proposal.rotation.x=-toolExit*.42;proposal.rotation.set(-toolExit*.42,0,0);proposal.scale.setScalar(1);
 // The builder already exists at the destination; papers dock into its surface.
 display.material.opacity=lerp(.12,1,smoother((t-14.4)/2))*(1-.7*smoother((t-18.1)/2.2));
 const out=smoother((t-17.0)/4.1),turn=smoother((t-23.1)/2.5);
 result.visible=true;result.position.set(lerp(14,19.3,out),lerp(.1,-.2,out),lerp(-4.24,3.4,out));
 result.scale.setScalar(lerp(.19,1,out));result.rotation.set(.025*Math.sin(t*.5),lerp(-.15,Math.PI,turn),-.06*(1-turn));
 resultFace.material.map=finishedMap;
 clock.position.set(15.7,.05,2.7);clock.scale.setScalar(smoother((t-19)/1.7)*(1-smoother((t-24.3)/1.1)));
 const saved=smoother((t-20.5)/2.8);
 clockTicks.forEach((tick,i)=>{const shrink=smoother((saved*60-i)/5);tick.scale.setScalar(i<10?1:1-shrink);});
 handPivot.rotation.z=-Math.PI*2*saved;
 renderer.render(scene,camera);
}
function envelope(t,from,to,ramp=.65){return smoother((t-from)/ramp)*(1-smoother((t-(to-ramp))/ramp));}
function caption(lines,t,from,to,x,y,size=145,color=ink,width=2200,align='left'){
 const alpha=envelope(t,from,to);if(alpha<.001)return;
 const fitted=fittedSize(lines,size,width);
 if(fitted<size*.75)layoutErrors.add(`Headline too small: ${lines.join(' / ')}`);
 c.save();c.globalAlpha=alpha;
 lines.forEach((line,i)=>text(line,x,y+i*size*1.15,fitted,i===lines.length-1?color:ink,800,align));c.restore();
}
function frame(t){
 objectPose(t);c.drawImage(renderer.domElement,0,0,W,H);
 // Crisp screen-space text accompanies physical actions, with no chapter cards.
 caption(tx(['Бизнес → инженерия.'],['Business → engineering.']),t,.55,4.5,1280,1260,140,acid,2250,'center');
 caption(tx(['≈60 минут ручной сборки.'],['≈60 minutes of manual work.']),t,4.0,8.0,1280,185,112,ink,2240,'center');
 // Words join the route one by one and remain together as the builder emerges.
 const chain=envelope(t,7.3,17.0,.8);
 if(chain>.001){
  const gather=smoother((t-12)/2.3),base=lerp(1090,1280,gather);
  const labels=tx(['Данные','Правила','Предложение'],['Data','Rules','Proposal']);
  const positions=[[-800,-45],[-150,0],[760,45]];
  c.save();c.globalAlpha=chain;
  labels.forEach((line,i)=>{
   const a=smoother((t-(7.3+i*1.55))/.8);if(!a)return;
   c.globalAlpha=chain*a;const x=base+positions[i][0],y=lerp(1300+positions[i][1]*.25,1320,gather);
   text(line,x,y,108,i===2?acid:ink,800,'center');
   if(i<2){c.globalAlpha=chain*smoother((t-(8.7+i*1.55))/.6);text('→',base+(i===0?-475:260),lerp(y,1320,gather),90,acid,600,'center');}
  });c.restore();
 }
 caption(tx(['Собрано в один инструмент.'],['Built into one tool.']),t,15.6,19.5,1280,235,128,ink,2280,'center');
 const comparison=envelope(t,19.5,24.6,.65);
 if(comparison>.001){
  c.save();c.globalAlpha=comparison;
  const saved=smoother((t-20.5)/2.8),minutes=Math.round(60-50*saved);
  text(saved>.999?'≤10':String(minutes),540,690,320,saved>.999?acid:ink,800,'center');
  text(tx('минут на предложение','minutes per proposal'),540,805,58,ink,600,'center');
  c.restore();
 }
 caption(tx(['Матвей','Пасынков.'],['Matvey','Pasynkov.']),t,25.3,29,145,650,166,ink,1200);
 if(t>25.9){c.save();c.globalAlpha=smoother((t-25.9)/.6);text('matveipasynkov.github.io',150,1180,49,acid,600);c.restore();}
}
function loop(now){if(!exporting&&playing&&!document.hidden){time=Math.min(D,(now-start)/1000);slider.value=time;frame(time);if(time>=D)playing=false;}requestAnimationFrame(loop);}
frame(time);
requestAnimationFrame(loop);
slider.oninput=()=>{playing=false;time=Number(slider.value);frame(time);status.textContent=`Кадр: ${time.toFixed(1)} сек.`;};
document.querySelector('#play').onclick=()=>{if(playing){playing=false;return;}if(time>=D)time=0;start=performance.now()-time*1000;playing=true;};
document.querySelector('#lang').onchange=e=>{lang=e.target.value;refreshUI();refreshFinished();frame(time);};
document.querySelector('#record').onclick=async()=>{
 if(exporting)return;exporting=true;playing=false;
 try{for(let i=0;i<D*FPS;i++){
  time=i/FPS;frame(time);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const r=await fetch(`/studio/frame-${lang}/${String(i).padStart(5,'0')}`,{method:'POST',body:blob});if(!r.ok)throw Error(`Frame ${i}`);
  if(i%30===0){slider.value=time;status.textContent=`ЭКСПОРТ ${lang.toUpperCase()} / ${Math.round(i/(D*FPS)*100)}% / ${i} кадров`;}
 }status.textContent=`ГОТОВО / ${lang.toUpperCase()} / ${D*FPS} кадров / ${W}×${H} / QA: ${layoutErrors.size?Array.from(layoutErrors).join('; '):'OK'}`;
 }catch(e){status.textContent=`Ошибка: ${e.message}`;}finally{exporting=false;}
};
status.textContent='ГОТОВО / 2560×1440 / 60 fps / Чёткая типографика';
