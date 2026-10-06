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
const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,W/H,.1,120);
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
const papers=new T.Group();scene.add(papers);const sheets=[],maps=[],dataMaps=[],ruleMaps=[];
function sheetMap(i){return texture((q,w,h)=>{
 q.beginPath();q.roundRect(0,0,w,h,26);q.clip();q.fillStyle=i%3===0?'#d4fd55':'#e9eadf';q.fillRect(0,0,w,h);
 q.fillStyle='#15170f';q.font='800 100px Manrope';q.fillText(String(i+1).padStart(2,'0'),95,150);
 q.fillStyle='#434936';q.font='600 70px Manrope';q.fillText(tx('ДАННЫЕ / ПРЕДЛОЖЕНИЕ','DATA / PROPOSAL'),95,260);
 q.fillStyle='#111210';q.fillRect(95,350,w*.66,30);q.fillRect(95,420,w*.47,30);
 for(let j=0;j<5;j++){q.fillStyle=j===2?'#78845a':'#c5c8b9';q.fillRect(95,570+j*85,w-190,32);}
 q.strokeStyle='#828b70';q.lineWidth=4;q.strokeRect(95,h-210,290,110);q.font='600 54px Manrope';q.fillStyle='#15170f';q.fillText('mp.',130,h-140);
 },1100,1500);}
for(let i=0;i<12;i++){
 const g=new T.Group();const back=new T.Mesh(new RoundedBoxGeometry(1.7,2.32,.06,6,.03),new T.MeshStandardMaterial({color:i%3===0?0x778d39:0x8c9384,roughness:.65,metalness:.15}));g.add(back);
 const tex=sheetMap(i);maps.push(tex);const front=new T.Mesh(new T.PlaneGeometry(1.64,2.26),new T.MeshStandardMaterial({map:tex,roughness:.82,metalness:0,envMapIntensity:.35,transparent:true}));front.position.z=.031;g.add(front);
 papers.add(g);sheets.push(g);
}
const ruleLines=new T.Group();scene.add(ruleLines);
for(let i=0;i<3;i++){
 const pts=[new T.Vector3(-1.6,(i-1)*1.4,.05),new T.Vector3(0,(i-1)*1.4,.05),new T.Vector3(.6,0,.05),new T.Vector3(2.8,0,.05)];
 ruleLines.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xd4fd55,transparent:true,opacity:.8})));
}
const pulses=[];
for(let i=0;i<9;i++){let dot=new T.Mesh(new T.SphereGeometry(.055,12,12),new T.MeshBasicMaterial({color:0xd4fd55}));ruleLines.add(dot);pulses.push(dot);}
const proposal=new T.Group();scene.add(proposal);
const housing=new T.Mesh(new RoundedBoxGeometry(6.8,4.6,.25,8,.15),metal);proposal.add(housing);housing.castShadow=housing.receiveShadow=true;
const screenWell=new T.Mesh(new RoundedBoxGeometry(6.57,4.37,.025,6,.1),darkMetal);screenWell.position.z=.132;proposal.add(screenWell);
const rail=new T.Mesh(new RoundedBoxGeometry(5.9,.012,.014,3,.005),edgeMetal);rail.position.set(0,-2.21,.132);proposal.add(rail);

let uiMap;
const display=new T.Mesh(new T.PlaneGeometry(6.48,4.28),new T.MeshBasicMaterial({toneMapped:false,transparent:true}));display.position.z=.148;proposal.add(display);
function specialMap(i,rules=false){return texture((q,w,h)=>{
 q.beginPath();q.roundRect(0,0,w,h,26);q.clip();q.fillStyle=rules?'#202719':i%2===0?'#d4fd55':'#e9eadf';q.fillRect(0,0,w,h);
 const col=rules?ink:'#111210';q.fillStyle=col;q.font='800 165px Manrope';q.fillText(String(i+1).padStart(2,'0'),90,220);
 const fields=rules?tx([['Данные','клиента'],['Правила','подбора'],['Подходящие','пакеты']],[['Client','data'],['Selection','rules'],['Suitable','packages']]):tx([['Профиль','компании'],['Потребности','клиента'],['Исходные','данные'],['Условия','подбора'],['Пакеты','услуг'],['Коммерческое','предложение']],[['Company','profile'],['Client','needs'],['Source','data'],['Selection','criteria'],['Service','packages'],['Commercial','proposal']]);
 const lines=fields[i%fields.length];q.font='800 150px Manrope';const width=Math.max(...lines.map(v=>q.measureText(v).width));q.font=`800 ${Math.min(150,150*900/width)}px Manrope`;lines.forEach((v,j)=>q.fillText(v,90,480+j*165));
 q.strokeStyle=rules?acid:'#687640';q.lineWidth=12;
 if(rules){q.beginPath();q.moveTo(260,1030);q.lineTo(440,1200);q.lineTo(810,820);q.stroke();}
 else{for(let j=0;j<4;j++){q.fillStyle=j===0?'#6e8045':'#a3ad87';round(q,90,770+j*125,900-j*100,45,12);q.fill();}}
 },1100,1500);}
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
 maps.forEach(t=>t.dispose());dataMaps.forEach(t=>t.dispose());ruleMaps.forEach(t=>t.dispose());maps.length=0;dataMaps.length=0;ruleMaps.length=0;sheets.forEach((g,i)=>{let t=sheetMap(i);maps.push(t);dataMaps.push(specialMap(i));ruleMaps.push(specialMap(i,true));g.children[1].material.map=t;});
}
refreshUI();
const cameraKeys=[
 [0,3.8,.9,5,3.2,0,0,-.09],[.55,4,.4,8,3.1,0,0,-.03],[1.6,1.8,.8,16,0,0,0,0],[3.1,2.2,.9,15.5,.1,0,0,0],
 [3.45,5.3,1.8,9.5,3.2,0,0,.10],[4.4,1,1.4,17,0,0,0,0],[6.4,2.7,2,16,.5,0,0,-.035],
 [6.75,3.8,.6,8,3.2,0,0,-.14],[7.55,1.5,.8,17,0,0,0,0],[9.7,2.4,.4,15.8,.1,0,0,0],
 [10.15,4.8,1.8,9,3.2,0,0,.12],[11.1,.8,.5,17,0,0,0,0],[13.6,1.6,1,16,.1,0,0,0],
 [13.95,4.2,.3,8,3.2,0,0,-.10],[14.85,1.2,.5,17,0,0,0,0],[17.2,2.7,.5,15.5,.2,0,0,0],
 [18,3.5,0,7,3.2,0,0,0],[18.7,0,0,17,0,0,0,0],[23.1,0,0,17,0,0,0,0],[24,1.5,.7,17,0,0,0,0],[28,1.5,.7,17,0,0,0,0]];
// Bounded Hermite curves keep camera speed continuous without overshooting objects.
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
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
function layout(i,s){
 if(s===0)return [(i%4-1.5)*.6,(Math.floor(i/4)-1)*.6,(i%3)*.1,0,0,0,.27];
 if(s===1)return [3.4+Math.sin(i*.52)*2.2,(i%4-1.5)*.38,(i-6)*.22,0,-.5+i*.07,-.5+i*.085,.96];
 if(s===2)return [2.1+(i%2)*2.0,2.05-Math.floor((i%6)/2)*2.0,(i%2)*.12,0,-.13,0,.78];
 if(s===3)return [1.6+(i%3)*2.25,(i%3===1?-.5:.65),0,0,-.12+(i%3)*.12,(i%3-1)*-.055,1.15];
 if(s===4)return [2.3+(i%3)*1.7,(Math.floor(i/3)-1.5)*.4,-1.5-i*.1,0,0,0,.55];
 if(s===5)return [3.3+(i%2)*.035,(i-6)*.035,-1+i*.035,0,0,0,.7];
 return [3.5,(i-6)*.06,-1+i*.035,0,0,0,.7];
}
const stages=[0,3.45,6.75,10.15,13.95,18,23.1];
function cardVisibility(i,stage){return stage===1?1:stage===2?(i<6?1:0):stage===3?(i<3?1:0):0;}
function cardPose(i,t){
 let stage=0;for(let j=1;j<stages.length;j++)if(t>=stages[j]-.36)stage=j;
 const prev=Math.max(0,stage-1),begin=stages[stage]-.36+i*.018;
 const p=stage===0?1:smoother((t-begin)/(1.05-i*.018));
 const a=layout(i,prev),b=layout(i,stage),values=a.map((v,j)=>lerp(v,b[j],p));
 values[6]=lerp(a[6]*cardVisibility(i,prev),b[6]*cardVisibility(i,stage),p);
 return {stage,prev,p,values};
}
function objectPose(t){
 cameraPose(t);
 hero.position.set(3.5,0,0);hero.rotation.set(.16,lerp(-.85,-.45,smoother(t/3)),.04);
 hero.scale.setScalar(1-smoother((t-3.09)/.72));hero.visible=hero.scale.x>.0001;
 papers.visible=t>3&&t<15;
 sheets.forEach((g,i)=>{
  const {stage,prev,p,values:v}=cardPose(i,t);
  g.position.set(v[0],v[1],v[2]);g.rotation.set(v[3],v[4],v[5]);g.scale.setScalar(v[6]);g.visible=v[6]>.0001;
  const map=s=>s===2?dataMaps[i]:s===3?ruleMaps[i]:maps[i];
  // Swap lettering only under the full-frame wipe, so two labels never ghost.
  g.children[1].material.map=map(t<stages[stage]?prev:stage);
 });
 const linesIn=smoother((t-10.45)/.75),linesOut=1-smoother((t-13.59)/.72);
 ruleLines.visible=linesIn*linesOut>.001;ruleLines.position.set(3.4,-2.3,.2);ruleLines.scale.setScalar(linesIn*linesOut);
 pulses.forEach((d,i)=>{const p=((t*1.1+i/9)%1);d.position.set(-1.6+p*4.4,(i%3-1)*1.4*(1-smooth((p-.3)/.3)),.05);});
 const toolScale=smoother((t-13.59)/1.05)*(1-smoother((t-17.64)/.72));
 proposal.visible=toolScale>.0001;proposal.position.set(3.2,0,0);proposal.rotation.set(.02,-.18+.035*Math.sin(t*.4),0);proposal.scale.setScalar(toolScale);
 renderer.render(scene,camera);
}
function headline(lines,t0,t,x=145,y=640,size=168,color=ink,maxWidth=1120){
 const fitted=fittedSize(lines,size,maxWidth);
 if(fitted<size*.75)layoutErrors.add(`Headline too small: ${lines.join(' / ')}`);
 lines.forEach((s,i)=>{
  const p=smoother((t-t0-i*.07)/.72),baseline=y+i*(size*1.16);
  c.save();c.globalAlpha=p;
  text(s,x,baseline+(1-p)*36,fitted,i===lines.length-1?color:ink);c.restore();
 });
}
function sub(s,t0,t,x=150,y=1180,size=45){c.save();c.globalAlpha=smooth((t-t0)/.55);text(s,x,y,size,'#b9bead',600);c.restore();}
function frame(t){
 objectPose(t);c.drawImage(renderer.domElement,0,0,W,H);
 // All typography is drawn after 3D rendering: no blur, bloom or texture resampling.
 const vignette=c.createLinearGradient(0,0,1600,0);vignette.addColorStop(0,'rgba(17,18,16,.6)');vignette.addColorStop(1,'rgba(17,18,16,0)');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 text('mp.',145,125,65,acid);text(tx('МАТВЕЙ ПАСЫНКОВ','MATVEY PASYNKOV'),2410,110,32,'#c6cabb',600,'right');
 c.strokeStyle='#34382d';c.lineWidth=2;c.beginPath();c.moveTo(145,170);c.lineTo(2410,170);c.stroke();
 if(t<3.45){
  headline(tx(['Бизнес.','Инженерия.'],['Business.','Engineering.']),.65,t,145,640,176,acid);
  sub(tx('Превращаю процессы в работающие инструменты.','Turning processes into tools that work.'),1.1,t,150,1120,43);
 }else if(t<6.75){
  text(tx('01 / РУЧНАЯ ПОДГОТОВКА','01 / MANUAL PREPARATION'),150,290,36,acid,600);
  headline(['≈60'],3.6,t,125,815,380);text(tx('минут на предложение','minutes per proposal'),150,950,62,ink,600);
  sub(tx('Данные. Подбор пакета. Сборка документа.','Data. Package selection. Document assembly.'),4,t,150,1170,43);
 }else if(t<10.15){
  text(tx('02 / ИСХОДНЫЕ ДАННЫЕ','02 / SOURCE DATA'),150,290,36,acid,600);
  headline(tx(['Данные','клиента.'],['Client','data.']),7.15,t,145,645,185,acid);
  sub(tx('Собрать нужное. Убрать ручные повторения.','Bring inputs together. Remove repetitive steps.'),7.8,t,150,1170,40);
 }else if(t<13.95){
  text(tx('03 / ЛОГИКА ПОДБОРА','03 / SELECTION LOGIC'),150,290,36,acid,600);
  headline(tx(['Правила.','Рекомендации.'],['Rules.','Recommendations.']),10.75,t,145,645,lang==='ru'?133:120,acid);
  sub(tx('Данные → условия → подходящие пакеты.','Data → conditions → suitable packages.'),11.2,t,150,1170,43);
 }else if(t<18){
  text(tx('04 / МОЁ РЕШЕНИЕ','04 / MY SOLUTION'),150,290,36,acid,600);
  headline(tx(['Один','инструмент.'],['One','tool.']),14.7,t,145,630,lang==='ru'?152:185,acid);
  sub(tx('Конструктор коммерческих предложений.','Commercial proposal builder.'),15,t,150,1160,43);

 }else if(t<23.1){
  const switcher=smoother((t-20)/1.05);
  c.fillStyle=bg;c.fillRect(0,185,W,1050);
  text(tx('05 / ВРЕМЯ НА ОДНО ПРЕДЛОЖЕНИЕ','05 / TIME PER PROPOSAL'),150,290,36,acid,600);
  c.save();c.beginPath();c.rect(120,365,2320,660);c.clip();
  text('≈60',1280,940-switcher*740,560,ink,800,'center');
  text('≤10',1280,940+(1-switcher)*740,560,acid,800,'center');c.restore();
  text(tx('минут','minutes'),1280,1125,68,ink,600,'center');
  c.fillStyle='#424c30';c.fillRect(640,1200,1280,12);c.fillStyle=acid;c.fillRect(640,1200,lerp(1280,1280/6,switcher),12);
  text(tx('БЫЛО: ≈ ЧАС','BEFORE: ≈ 1 HOUR'),640,1270,28,'#858d77',600);text(tx('СТАЛО: ДО 10 МИНУТ','AFTER: UP TO 10 MINUTES'),1920,1270,28,acid,600,'right');
 }else if(t<25.4){
  c.fillStyle=bg;c.fillRect(0,180,W,1260);
  headline(tx(['Меньше рутины.','Больше времени','на клиента.'],['Less routine.','More time','for the client.']),23.35,t,145,580,lang==='ru'?154:165,acid,2200);
 }else{
  c.fillStyle=bg;c.fillRect(0,180,W,1260);
  text('mp.',2050,875,350,acid,800,'center');
  headline(tx(['Матвей','Пасынков.'],['Matvey','Pasynkov.']),25.55,t,145,635,170,ink);
  sub(tx('Бизнес-анализ / Оптимизация процессов / AI','Business analysis / Process optimization / AI'),26,t,150,1120,43);
  text('matveipasynkov.github.io',150,1280,36,acid,600);
 }
 // Scene changes happen at the fully covered midpoint, never on an exposed frame.
 for(const [at,style] of [[3.45,0],[6.75,1],[10.15,2],[13.95,0],[18,1],[23.1,2],[25.4,0]]){
  const u=(t-(at-.42))/.84;if(u<=0||u>=1)continue;
  const p=smoother(u);c.save();c.fillStyle=style===1?ink:acid;
  if(style===0){
   c.translate(W/2+lerp(-W*1.7,W*1.7,p),H/2);c.rotate(-.12);
   c.fillRect(-W*.78,-H*1.5,W*1.56,H*3);
   c.fillStyle=bg;c.fillRect(-W*.78+16,-H*1.5,4,H*3);
  }else if(style===1){
   const radius=Math.hypot(W,H)*.7*Math.sin(Math.PI*u)**.7;
   c.beginPath();c.arc(lerp(W*.42,W*.58,p),H*.5,radius,0,Math.PI*2);c.fill();
  }else{
   for(let row=0;row<6;row++){
    const q=clamp(p+(row-2.5)*.016),x=W/2+lerp(-W*1.85,W*1.85,q);
    c.fillStyle=row%2?'#c9ed55':acid;c.fillRect(x-W*.78,row*H/6-1,W*1.56,H/6+2);
   }
  }
  c.restore();
 }

}
function loop(now){if(!exporting){if(playing){time=Math.min(D,(now-start)/1000);slider.value=time;if(time>=D)playing=false;}frame(time);}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
slider.oninput=()=>{playing=false;time=Number(slider.value);frame(time);status.textContent=`Кадр: ${time.toFixed(1)} сек.`;};
document.querySelector('#play').onclick=()=>{if(playing){playing=false;return;}if(time>=D)time=0;start=performance.now()-time*1000;playing=true;};
document.querySelector('#lang').onchange=e=>{lang=e.target.value;refreshUI();frame(time);};
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
