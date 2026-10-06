import * as T from '../vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
await document.fonts.ready;
const specimen='Матвей Пасынков Бизнес Инженерия Данные клиента Правила Рекомендации mp. 60 ≤ →';
const loadedFonts=await Promise.all([document.fonts.load('800 220px Manrope',specimen),document.fonts.load('600 60px Manrope',specimen),document.fonts.load('500 60px Manrope',specimen)]);
if(loadedFonts.some(faces=>!faces.length))throw new Error('Manrope could not be loaded');
const W=2560,H=1440,OUTPUT_SCALE=1.5,D=28,FPS=60,acid='#d4fd55',ink='#f2f2e9',bg='#111210';
const canvas=document.createElement('canvas');canvas.width=W*OUTPUT_SCALE;canvas.height=H*OUTPUT_SCALE;
document.querySelector('#stage').append(canvas);const c=canvas.getContext('2d',{alpha:false});c.setTransform(OUTPUT_SCALE,0,0,OUTPUT_SCALE,0,0);
const slider=document.querySelector('#time'),status=document.querySelector('#status');
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H,false);renderer.setPixelRatio(1.5);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.setClearColor(bg);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.fog=new T.Fog(bg,10,23);const camera=new T.PerspectiveCamera(36,W/H,.1,120);
const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.03).texture;room.dispose();pm.dispose();
scene.environmentIntensity=.85;
scene.add(new T.HemisphereLight(0xf2f2e9,0x171a10,.75));
const key=new T.DirectionalLight(0xffffff,2.8);key.position.set(-6,10,10);key.castShadow=true;
key.shadow.mapSize.set(4096,4096);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=12;key.shadow.camera.bottom=-12;key.shadow.camera.far=65;key.shadow.normalBias=.008;key.shadow.bias=-.00008;key.shadow.radius=2;
scene.add(key);scene.add(key.target);
const rim=new T.DirectionalLight(0xd4fd55,2.1);rim.position.set(7,3,-5);scene.add(rim);scene.add(rim.target);
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
 c.fillStyle=color;c.font=`${weight} ${size}px Manrope,Arial`;c.textAlign=align;c.textBaseline='alphabetic';
 const width=c.measureText(s).width,left=align==='center'?x-width/2:x;
 if(left<64||left+width>W-64||y>H-48||y-size<32)layoutErrors.add(`Text outside safe area: ${s}`);
 c.fillText(s,x,y);
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
// Thin, gently bowed sheets: printed stock rather than rigid interface cards.
const paperGrain=texture((q,w,h)=>{
 const pixels=q.createImageData(w,h);let seed=71;
 for(let i=0;i<w*h;i++){seed=(seed*1664525+1013904223)>>>0;const v=218+(seed>>>24)/255*18;pixels.data.set([v,v,v,255],i*4);}q.putImageData(pixels,0,0);
},512,512);paperGrain.colorSpace=T.NoColorSpace;
function bowedPage(w,h,bend=.045){
 const geo=new T.PlaneGeometry(w,h,48,64),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i)/(w/2),y=a.getY(i)/(h/2);a.setZ(i,bend*(.38*x*x+.18*y*y+.44*Math.pow(Math.max(0,(x+.5)/1.5),2)*Math.pow(Math.max(0,(y+.5)/1.5),2)));}
 geo.computeVertexNormals();return geo;
}
const pageGeometry=bowedPage(1.7,2.32,.065),pageBack=pageGeometry.clone();
const backPositions=pageBack.attributes.position;for(let i=0;i<backPositions.count;i++)backPositions.setZ(i,backPositions.getZ(i)-.007);pageBack.computeVertexNormals();
const paperBackMaterial=new T.MeshStandardMaterial({color:0xe8e3d8,roughness:.88,metalness:0,bumpMap:paperGrain,bumpScale:.00065,side:T.BackSide,envMapIntensity:.25});
const papers=new T.Group();scene.add(papers);const sheets=[],maps=[];
function sheetMap(i){return texture((q,w,h)=>{
 q.fillStyle='#f3f0e7';q.fillRect(0,0,w,h);
 const margin=145,body=w-2*margin;
 q.fillStyle='#172014';q.font='800 128px Manrope';q.fillText('mp.',margin,195);
 q.font='600 38px Manrope';q.fillStyle='#6c7165';q.textAlign='right';q.fillText(String(i+1).padStart(2,'0'),w-margin,185);q.textAlign='left';
 q.strokeStyle='#c8cbbe';q.lineWidth=2;q.beginPath();q.moveTo(margin,270);q.lineTo(w-margin,270);q.stroke();
 const names=tx(['Данные клиента','Потребности','Рекомендации','Продукты/услуги','Условия','Предложение'],['Client data','Needs','Recommendations','Products / services','Conditions','Proposal']);
 q.fillStyle='#172014';q.font='800 82px Manrope';q.fillText(names[i],margin,440);
 q.fillStyle='#4a5440';q.font='500 43px Manrope';q.fillText(tx('Материалы для подготовки предложения','Proposal preparation materials'),margin,535);
 const headings=tx(['Профиль компании','Задачи бизнеса','Варианты решения'],['Company profile','Business needs','Solution options']);
 const copy=tx([
  ['Исходные данные о клиенте.','Основа для выбора подходящего решения.'],
  ['Информация проверяется по правилам.','Рекомендации учитывают данные клиента.'],
  ['Продукты/услуги и состав предложения.','Результат объединяется в готовый документ.']
 ],[
  ['Initial information about the client.','A basis for choosing a suitable solution.'],
  ['Information is checked against rules.','Recommendations use the client data.'],
  ['Products / services and proposal outline.','The result becomes one ready document.']
 ]);
 headings.forEach((line,j)=>{
  const y=775+j*425;q.fillStyle='#172014';q.font='800 53px Manrope';q.fillText(line,margin,y);
  q.font='500 43px Manrope';q.fillStyle='#273122';copy[j].forEach((line,k)=>q.fillText(line,margin,y+100+k*77));
  q.strokeStyle='#d8dbce';q.beginPath();q.moveTo(margin,y+255);q.lineTo(w-margin,y+255);q.stroke();
 });
 q.fillStyle='#e1e9cb';q.fillRect(margin,2070,body,160);q.fillStyle='#394728';q.font='600 43px Manrope';q.fillText(tx('Данные → правила → предложение','Data → rules → proposal'),margin+45,2165);
 q.font='500 35px Manrope';q.fillStyle='#59634d';q.fillText('matveipasynkov.github.io',margin,2350);
 },1800,2460);}
for(let i=0;i<6;i++){
 const g=new T.Group(),tex=sheetMap(i);maps.push(tex);
 const back=new T.Mesh(pageBack,paperBackMaterial);back.castShadow=back.receiveShadow=true;g.add(back);
 const front=new T.Mesh(pageGeometry,new T.MeshStandardMaterial({map:tex,roughness:.86,metalness:0,envMapIntensity:.3,bumpMap:paperGrain,bumpScale:.00065}));front.castShadow=front.receiveShadow=true;g.add(front);
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
 q.fillStyle=acid;q.font='800 120px Manrope';q.fillText('mp.',80,150);
 q.fillStyle=ink;q.font='800 88px Manrope';q.fillText(tx('Конструктор КП','Proposal builder'),380,142);
 q.strokeStyle='#4c5142';q.lineWidth=3;q.beginPath();q.moveTo(80,210);q.lineTo(w-80,210);q.stroke();
 const cols=[tx('Данные клиента','Client data'),tx('Правила подбора','Selection rules'),tx('Предложение','Proposal')];
 cols.forEach((label,i)=>{
  const x=80+i*750;q.fillStyle=i===2?acid:'#272c20';round(q,x,285,680,1190,32);q.fill();
  q.fillStyle=i===2?'#111210':ink;q.font='800 72px Manrope';q.fillText(label,x+42,410);
  if(i===2){q.drawImage(finishedMap.image,x+90,575,500,685);return;}
  const labels=i===0?[tx('Компания','Company'),tx('Потребности','Needs')]:i===1?[tx('Рекомендации','Recommendations'),tx('Продукты/услуги','Products / services')]:[tx('Состав решения','Solution'),tx('Готовый документ','Ready document')];
  labels.forEach((line,j)=>{
   q.fillStyle=i===2?'#263019':'#c2c8b5';q.font='600 66px Manrope';q.fillText(line,x+42,620+j*300);
   q.fillStyle=i===2?'#a6c13e':'#404a30';round(q,x+42,685+j*300,596,125,18);q.fill();
   q.fillStyle=i===2?'#566b23':'#87976c';round(q,x+76,738+j*300,430-j*100,18,9);q.fill();
  });
  q.fillStyle=i===2?'#111210':'#424d30';round(q,x+42,1250,596,130,18);q.fill();
  q.fillStyle=acid;q.font='800 60px Manrope';q.fillText(i===2?tx('КП готово ✓','Ready ✓'):tx('Проверено ✓','Verified ✓'),x+82,1337);
 });
 },2400,1600);display.material.map=uiMap;display.material.needsUpdate=true;
 maps.forEach(t=>t.dispose());maps.length=0;sheets.forEach((g,i)=>{const t=sheetMap(i);maps.push(t);g.children[1].material.map=t;});
}
const dataField=new T.Group();dataField.position.set(5.2,0,-1.5);scene.add(dataField);
const fieldUniforms={uTime:{value:0},uScan:{value:0}};
const fieldMaterial=new T.MeshPhysicalMaterial({color:0x343f2a,metalness:.78,roughness:.24,clearcoat:.6,clearcoatRoughness:.22});
fieldMaterial.onBeforeCompile=shader=>{
 Object.assign(shader.uniforms,fieldUniforms);
 shader.vertexShader='uniform float uTime;varying vec3 vField;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  transformed+=normal*.06*sin(position.y*5.+uTime*.32)*sin(position.x*4.-uTime*.22)*sin(position.z*3.);vField=transformed;`);
 shader.fragmentShader='uniform float uTime;uniform float uScan;varying vec3 vField;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float contour=vField.y*14.+sin(vField.x*3.+uTime*.16)*1.6+sin(vField.z*4.)*.7;
  float line=1.-smoothstep(.024,.024+fwidth(contour)*1.2,abs(fract(contour)-.5));
  float scanY=mix(2.1,-2.1,uScan);float passed=smoothstep(scanY-.10,scanY+.10,vField.y);
  float sweep=exp(-pow((vField.y-scanY)*10.,2.))*(1.-step(.999,uScan));
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.7,.86,.48),line*passed*.42+sweep*.45);`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  totalEmissiveRadiance+=vec3(.6,.8,.25)*(line*passed*.07+sweep*.45);`);
};
const globe=new T.Mesh(new T.SphereGeometry(1.48,144,96),fieldMaterial);dataField.add(globe);
const lineMaterial=new T.MeshStandardMaterial({color:0xd4fd55,emissive:0x90af25,emissiveIntensity:.35,metalness:.5,roughness:.22});
const dataOrbit=new T.Mesh(new T.TorusGeometry(1.86,.018,12,192),lineMaterial);dataField.add(dataOrbit);
const logic=new T.Group();logic.position.set(9.6,0,-2.8);scene.add(logic);
const logicBody=new T.Mesh(new T.TorusKnotGeometry(1.26,.25,320,40,2,3),metal);logicBody.rotation.set(.3,.1,-.5);logic.add(logicBody);
const logicLine=new T.Mesh(new T.TorusKnotGeometry(1.26,.018,320,12,2,3),lineMaterial);logicLine.scale.setScalar(1.23);logicLine.rotation.copy(logicBody.rotation);logic.add(logicLine);
const checkpoints=[];for(let i=0;i<3;i++){const m=new T.Mesh(new T.SphereGeometry(.1,40,24),lineMaterial);const a=i*2*Math.PI/3;m.position.set(Math.cos(a)*1.8,Math.sin(a)*1.8,.3);logic.add(m);checkpoints.push(m);}
const buildUniform={value:new T.Vector3()},outputUniform={value:0};
display.material.onBeforeCompile=shader=>{
 shader.uniforms.uBuild=buildUniform;shader.uniforms.uOutput=outputUniform;
 shader.fragmentShader='uniform vec3 uBuild;uniform float uOutput;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float part=vMapUv.x<.333?uBuild.x:(vMapUv.x<.666?uBuild.y:uBuild.z);
  if(vMapUv.y<1.-part)discard;
  float sweep=exp(-pow((vMapUv.y-(1.-part))*35.,2.))*(1.-step(.999,part));
  diffuseColor.rgb+=vec3(.15,.2,.06)*sweep;
  float outputMask=step(.6958,vMapUv.x)*step(vMapUv.x,.9042)*step(.2125,vMapUv.y)*step(vMapUv.y,.6406);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.830,.992,.333),uOutput*outputMask);`);
};
const pulseCurve=new T.CatmullRomCurve3([new T.Vector3(5.2,-1.8,-1.5),new T.Vector3(7.4,-2,-2.1),new T.Vector3(9.6,-1.9,-2.8),new T.Vector3(12,-2.3,-3.5),new T.Vector3(14,-2.1,-3.8)]);
const pulse=new T.Mesh(new T.SphereGeometry(.065,32,20),lineMaterial);scene.add(pulse);
const trailUniform={value:0},trailMaterial=new T.MeshBasicMaterial({color:0xd4fd55,transparent:true,opacity:.6,depthWrite:false});
trailMaterial.onBeforeCompile=shader=>{
 shader.uniforms.uPulse=trailUniform;
 shader.vertexShader='varying float vTrail;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTrail=uv.x;');
 shader.fragmentShader='uniform float uPulse;varying float vTrail;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  diffuseColor.a*=smoothstep(uPulse-.10,uPulse-.012,vTrail)*(1.-smoothstep(uPulse,uPulse+.012,vTrail));`);
};
const pulseTrail=new T.Mesh(new T.TubeGeometry(pulseCurve,180,.011,10,false),trailMaterial);scene.add(pulseTrail);
// A single camera path links the source documents, data, selection logic and output.
// One connected set: the camera travels from the source, through the logic,
// into the builder, then follows the output. No wipes or reset-to-title shots.
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
const cameraKeys=[
 [0,-.8,.7,5.6,-1.45,0,0,-.06],
 [2.6,-1.8,1.05,8.4,-1.45,.1,0,.025],
 [3.8,1.4,.6,6.8,1.0,.1,1.1,.015],
 [4.7,2.1,1.45,10.6,2.6,.1,-.3,.035],
 [6.6,5.7,.5,8.5,5.2,0,-1.3,-.025],
 [8.7,6.4,.85,7.8,5.5,0,-1.5,.015],
 [11.1,10.2,.7,7.2,9.6,0,-2.8,.04],
 [13.1,12.8,1.35,8.5,12,0,-3.4,-.03],
 [15.5,14.8,.5,7.1,14,0,-4,.012],
 [18.0,14.3,.18,6.2,14,0,-4,0],
 [20.4,18.7,.8,11.7,17.5,0,1.4,-.018],
 [23.7,20.5,.55,12.3,18.7,0,3.4,.02],
 [26.0,19.5,.4,14.2,18.3,0,3.4,0],
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
const resultBody=new T.Mesh(new RoundedBoxGeometry(2.82,3.87,.008,6,.004),paperBackMaterial);result.add(resultBody);
let finishedMap;
function refreshFinished(){
 finishedMap?.dispose();finishedMap=texture((q,w,h)=>{
  q.fillStyle='#f3f0e7';q.fillRect(0,0,w,h);
  q.fillStyle='#172014';q.font='800 165px Manrope';q.fillText('mp.',145,230);
  q.strokeStyle='#c8cbbe';q.lineWidth=2;q.beginPath();q.moveTo(145,340);q.lineTo(w-145,340);q.stroke();
  q.fillStyle='#172014';q.font='800 108px Manrope';
  const title=tx(['Коммерческое','предложение'],['Commercial','proposal']);title.forEach((line,i)=>q.fillText(line,145,590+i*140));
  q.font='500 44px Manrope';q.fillStyle='#48523d';q.fillText(tx('Решение на основе данных клиента','A solution based on client data'),145,865);
  q.fillStyle='#e4ecd0';q.beginPath();q.roundRect(145,1000,w-290,650,20);q.fill();
  q.fillStyle='#334226';q.font='800 81px Manrope';q.fillText(tx('Продукты/услуги','Products / services'),200,1125);
  const rows=tx(['Состав решения','Рекомендации','Проверенные условия'],['Solution outline','Recommendations','Verified conditions']);
  rows.forEach((line,i)=>{
   const y=1260+i*120;q.strokeStyle='#748950';q.lineWidth=6;q.lineCap='round';q.lineJoin='round';q.beginPath();q.moveTo(207,y-15);q.lineTo(222,y);q.lineTo(250,y-34);q.stroke();
   q.fillStyle='#273322';q.font='500 66px Manrope';q.fillText(line,290,y);
  });
  q.fillStyle='#172014';q.font='800 75px Manrope';q.fillText(tx('Готово к отправке.','Ready to send.'),145,1880);
  q.fillStyle='#39442e';q.font='400 52px Manrope';q.fillText(tx('Данные, правила и предложение в одном месте.','Client data, rules and proposal in one place.'),145,1980);
  q.strokeStyle='#c8cbbe';q.lineWidth=2;q.beginPath();q.moveTo(145,2180);q.lineTo(w-145,2180);q.stroke();
  q.font='500 39px Manrope';q.fillStyle='#515c43';q.fillText('matveipasynkov.github.io',145,2310);
 },1800,2460);
}
refreshFinished();
const backFrame=new T.Mesh(new RoundedBoxGeometry(2.78,3.83,.003,4,.001),darkMetal);backFrame.position.z=-.0065;result.add(backFrame);
const resultFace=new T.Mesh(new T.PlaneGeometry(2.78,3.81),new T.MeshStandardMaterial({map:finishedMap,roughness:.86,metalness:0,envMapIntensity:.3,bumpMap:paperGrain,bumpScale:.00065}));resultFace.position.z=.005;result.add(resultFace);
const resultBrand=new T.Mesh(new T.PlaneGeometry(2.65,1.77),new T.MeshBasicMaterial({map:glyph,transparent:true,toneMapped:false,side:T.DoubleSide}));resultBrand.rotation.y=Math.PI;resultBrand.position.z=-.0085;result.add(resultBrand);
// Clock geometry contracts while the completed document remains in view.
const clock=new T.Group();scene.add(clock);
const clockMaterial=new T.MeshBasicMaterial({color:0xd4fd55,fog:false});
const clockTicks=[];
for(let i=0;i<60;i++){
 const a=i*Math.PI/30;const tick=new T.Mesh(new T.BoxGeometry(i%5===0?.055:.028,i%5===0?.24:.13,.045),clockMaterial);
 tick.position.set(Math.sin(a)*2.85,Math.cos(a)*2.85,0);tick.rotation.z=-a;clock.add(tick);clockTicks.push(tick);
}
const clockHand=new T.Mesh(new T.BoxGeometry(.04,2.25,.055),clockMaterial);clockHand.position.y=1.125;
const handPivot=new T.Group();handPivot.add(clockHand);clock.add(handPivot);
const paperRight=new T.Vector3(),paperUp=new T.Vector3(),paperNormal=new T.Vector3(),flowCenter=new T.Vector3();
function cardPose(i,t){
 const col=i%3-1,row=.5-Math.floor(i/3);
 const spread=smoother((t-3.8)/1.5),dock=smoother((t-5.3)/1.65);
 const x=col*2.3*spread,y=row*2.6*spread;
 const position=flowCenter.clone().addScaledVector(paperRight,x).addScaledVector(paperUp,y);
 position.addScaledVector(paperNormal,(1-smoother((spread-.8)/.2))*(5-i)*.09);
 // Shrink before convergence; the six lanes do not intersect or exchange places.
 const shrink=smoother((t-5.1)/1.2);
 const scale=lerp(.82,.065,shrink)*smoother((t-3.0)/.7)*(1-smoother((t-6.3)/.5));
 position.lerp(new T.Vector3(5.2+col*.38,row*.45,.35-i*.012),dock);
 const tilt=smoother((spread-.72)/.28)*(1-dock);
 return {position,scale,dock,rotation:new T.Euler(-row*.16*tilt,col*.22*tilt,-col*.045*tilt)};
}
function objectPose(t){
 cameraPose(t);
 const sourceExit=smoother((t-3.05)/1.0);hero.position.set(-sourceExit*8,-sourceExit*10,-sourceExit*6);hero.rotation.set(.06,-.2+smoother(t/3)*.35,0);
 const open=smoother((t-2.4)/2.2);lid.position.set(-open*4,open*3.6,open*.7);lid.rotation.set(-open*.27,open*.15,-open*.08);
 flowCenter.set(lerp(.15,3.6,smoother((t-3.05)/2.9)),.1,lerp(1.3,.6,smoother((t-3.05)/2.9)));
 const movingOrientation=camera.quaternion.clone();
 paperRight.set(1,0,0).applyQuaternion(movingOrientation);paperUp.set(0,1,0).applyQuaternion(movingOrientation);paperNormal.set(0,0,1).applyQuaternion(movingOrientation);
 sheets.forEach((g,i)=>{const p=cardPose(i,t);g.position.copy(p.position);g.quaternion.copy(movingOrientation).multiply(new T.Quaternion().setFromEuler(p.rotation));g.scale.setScalar(p.scale);g.visible=p.scale>.0001;g.children[1].material.map=maps[i];});
 const dataArrival=ease((t-5.5)/1.8),dataExit=smoother((t-8.9)/1.7);
 dataField.scale.setScalar(dataArrival*(1-dataExit));dataField.visible=t>5.5&&t<10.6;
 dataField.rotation.set(.08,lerp(-1.2,.22,dataArrival)+t*.025,0);
 dataOrbit.rotation.set(.9+(1-dataArrival)*1.4,.3+(1-dataArrival)*.7,.3+t*.035);
 fieldUniforms.uTime.value=t;fieldUniforms.uScan.value=smoother((t-6.1)/2.0);
 const logicArrival=ease((t-8.9)/1.8),logicExit=smoother((t-12.8)/1.7);
 logic.scale.setScalar(logicArrival*(1-logicExit));logic.visible=t>8.9&&t<14.5;
 logic.rotation.set(.12+(1-logicArrival)*.6,lerp(-1.9,.2,logicArrival)+t*.024,-.12);
 checkpoints.forEach((m,i)=>m.scale.setScalar(.001+.999*smoother((t-9.8-i*.23)/.7)));
 const travel=smoother((t-8.6)/5.8);pulseCurve.getPoint(travel,pulse.position);trailUniform.value=travel;pulse.visible=t>8.6&&t<14.4;pulseTrail.visible=t>8.6&&t<14.4;
 const toolArrival=smoother((t-11.8)/3.3),toolExit=smoother((t-18.6)/2.2);
 proposal.position.set(14,lerp(3.6,0,toolArrival)-toolExit*10,-4-toolExit*5);proposal.rotation.set(-toolExit*.42,-(1-toolArrival)*.28,(1-toolArrival)*.08);proposal.scale.setScalar(ease((t-11.8)/1.2));proposal.visible=t>11.8&&t<21.0;
 buildUniform.value.set(smoother((t-14.0)/1.5),smoother((t-14.7)/1.5),smoother((t-15.4)/1.5));
 display.material.opacity=1;outputUniform.value=smoother((t-17.6)/.4);
 const out=smoother((t-17.6)/3.9),turn=smoother((t-23.8)/2.1);
 result.visible=t>17.6;result.position.set(lerp(15.944,19.3,out),lerp(-.314,-.2,out),lerp(-3.75,3.4,out));
 result.scale.setScalar(lerp(.486,1,out));result.rotation.set(.02*out,lerp(-.1*out,Math.PI,turn),-.045*out*(1-turn));resultFace.material.map=finishedMap;
 const clockDepth=18,tan=Math.tan(camera.fov*Math.PI/360);
 clock.position.set((2*540/W-1)*clockDepth*tan*camera.aspect,(1-2*575/H)*clockDepth*tan,-clockDepth).applyQuaternion(camera.quaternion).add(camera.position);
 clock.quaternion.copy(camera.quaternion);clock.scale.setScalar(smoother((t-20)/1.1)*(1-smoother((t-24.3)/1.1)));handPivot.visible=false;
 const saved=smoother((t-20.5)/2.8);clockTicks.forEach((tick,i)=>{const shrink=smoother((saved*60-i)/5);tick.scale.setScalar(i<10?1:1-shrink);});handPivot.rotation.z=-Math.PI*2*saved;
 key.position.set(cameraValue(t,4)-5,7,8);key.target.position.set(cameraValue(t,4),0,-2);rim.position.set(cameraValue(t,4)+5,3,-7);rim.target.position.copy(key.target.position);
 renderer.render(scene,camera);
}
function envelope(t,from,to,ramp=.65){return smoother((t-from)/ramp)*(1-smoother((t-(to-ramp))/ramp));}
function caption(lines,t,from,to,x,y,size=145,color=ink,width=2200,align='left'){
 const alpha=envelope(t,from,to);if(alpha<.001)return;
 const fitted=fittedSize(lines,size,width);
 if(fitted<size*.75)layoutErrors.add(`Headline too small: ${lines.join(' / ')}`);
 c.save();c.globalAlpha=alpha;
 lines.forEach((line,i)=>{
  const enter=smooth((t-from-i*.14)/.8),baseline=y+i*size*1.15;
  c.save();c.beginPath();c.rect(align==='center'?x-width/2:x,baseline-size*1.1,width,size*1.3*enter);c.clip();
  text(line,x,baseline+18*(1-enter),fitted,i===lines.length-1?color:ink,800,align);c.restore();
 });c.restore();
}
function frame(t){
 objectPose(t);c.drawImage(renderer.domElement,0,0,W,H);
 caption(tx(['Коммерческие','предложения.'],['Commercial','proposals.']),t,.7,3.25,145,620,142,acid,880);
 caption(tx(['≈60 минут ручной сборки.'],['≈60 minutes of manual work.']),t,3.6,6.7,1280,155,120,ink,2240,'center');
 caption(tx(['Данные клиента.'],['Client data.']),t,6.3,9.8,1280,1280,142,ink,2200,'center');
 caption(tx(['Правила подбора.'],['Selection rules.']),t,9.8,13.4,1280,1350,142,acid,2200,'center');
 caption(tx(['В одном конструкторе.'],['One proposal builder.']),t,14.0,18.8,1280,180,124,ink,2280,'center');
 const comparison=envelope(t,20.2,24.8,.7);
 if(comparison>.001){
  c.save();c.globalAlpha=comparison;
  const saved=smoother((t-20.5)/2.8),minutes=Math.round(60-50*saved);
  text(saved>.999?'≤10':String(minutes),540,690,320,saved>.999?acid:ink,800,'center');
  text(tx('минут на предложение','minutes per proposal'),540,1020,58,ink,600,'center');
  c.restore();
 }
 caption(tx(['Матвей','Пасынков.'],['Matvey','Pasynkov.']),t,25.2,29,145,650,166,ink,1200);
 if(t>25.8){c.save();c.globalAlpha=smoother((t-25.8)/.7);text('matveipasynkov.github.io',150,1180,49,acid,600);c.restore();}
}
function loop(now){if(!exporting&&playing&&!document.hidden){time=Math.min(D,(now-start)/1000);slider.value=time;frame(time);if(time>=D)playing=false;}requestAnimationFrame(loop);}
refreshUI();
frame(time);
requestAnimationFrame(loop);
slider.oninput=()=>{playing=false;time=Number(slider.value);frame(time);status.textContent=`Кадр: ${time.toFixed(1)} сек.`;};
document.querySelector('#play').onclick=()=>{if(playing){playing=false;return;}if(time>=D)time=0;start=performance.now()-time*1000;playing=true;};
document.querySelector('#lang').onchange=e=>{lang=e.target.value;refreshFinished();refreshUI();frame(time);};
async function exportFrames(indices,label){
 if(exporting)return;exporting=true;playing=false;layoutErrors.clear();
 const buttons=[...document.querySelectorAll('button,select,input')];buttons.forEach(b=>b.disabled=true);
 try{for(let n=0;n<indices.length;n++){
  const i=indices[n];time=i/FPS;frame(time);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const r=await fetch(`/studio/frame-v6-${lang}/${String(i).padStart(5,'0')}`,{method:'POST',body:blob});if(!r.ok)throw Error(`Frame ${i}`);
  if(n%15===0){slider.value=time;status.textContent=`${label} ${lang.toUpperCase()} / ${Math.round(n/indices.length*100)}% / ${n} кадров`;}
 }status.textContent=`ГОТОВО / ${lang.toUpperCase()} / ${indices.length} кадров / ${W*OUTPUT_SCALE}×${H*OUTPUT_SCALE} / QA: ${layoutErrors.size?Array.from(layoutErrors).join('; '):'OK'}`;
 }catch(e){status.textContent=`Ошибка: ${e.message}`;}finally{exporting=false;buttons.forEach(b=>b.disabled=false);}
}
document.querySelector('#record').onclick=()=>exportFrames(Array.from({length:D*FPS},(_,i)=>i),'ЭКСПОРТ');
document.querySelector('#proof').onclick=()=>exportFrames([0,1,1.8,2.6,3.2,3.7,4.2,4.8,5.3,5.7,6.1,6.5,6.9,7.5,8.2,8.9,9.4,10,10.9,11.8,12.3,13,13.8,14.5,15.2,16,16.8,17.6,17.7,18.1,18.6,19,19.7,20.2,20.8,21.5,22.3,23.3,24,24.8,25.4,26.2,27.6].map(t=>Math.round(t*FPS)),'ПРОВЕРКА');
status.textContent='ГОТОВО / 3840×2160 / 60 fps / Чёткая типографика';
