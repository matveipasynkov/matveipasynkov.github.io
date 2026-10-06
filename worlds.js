import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const root=document.documentElement,trigger=document.querySelector('.process-diagram');
const dialog=document.createElement('dialog');dialog.className='explore';dialog.id='explore-worlds';dialog.setAttribute('aria-labelledby','explore-title');
dialog.innerHTML=`<div class="explore-canvas" aria-hidden="true"></div><div class="explore-light" aria-hidden="true"></div>
<header class="explore-head"><span class="explore-brand">mp<span>.</span></span><button class="explore-close" aria-label="Закрыть разделы"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
<div class="explore-copy"><span class="explore-count">01 / 03</span><h2 id="explore-title"></h2><p class="explore-description"></p><div class="explore-metric" aria-hidden="true"><span>60</span><i>→</i><strong>≤10</strong><small></small></div><a class="explore-detail" href="#experience"><span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></a></div>
<nav class="explore-nav" aria-label="Интерактивные разделы"><button data-world="0" aria-current="page"></button><button data-world="1"></button><button data-world="2"></button></nav>
<div class="explore-cursor" aria-hidden="true"><svg viewBox="0 0 40 40"><path class="cursor-main" d="M6 6 32 17 21 21 17 32Z"/><path class="cursor-detail" d="M24 27v10M19 32h10"/></svg><span class="cursor-hold"></span></div>`;
document.body.append(dialog);
const entries=[
 {ru:['Понимаю\nсистему.','Изучаю процессы команд, нахожу точки роста и проверяю гипотезы. От вопроса — к рабочему прототипу.','Опыт работы','Процессы'],en:['Understand\nthe system.','I explore team processes, identify opportunities and test hypotheses. From a question to a working prototype.','Work experience','Processes'],href:'#experience'},
 {ru:['Нахожу\nзакономерности.','Исследования, Python, Excel и BI. Превращаю данные в рекомендации, которые помогают принимать решения.','Подход и инструменты','Данные'],en:['Find\nthe patterns.','Research, Python, Excel and BI. Turning data into recommendations that help people make decisions.','Approach & tools','Data'],href:'#toolkit'},
 {ru:['Создаю\nрезультат.','Конструктор коммерческих предложений: данные, рекомендации и подходящие пакеты — в одном инструменте.','Посмотреть кейс','Результат'],en:['Build\nthe outcome.','The proposal builder brings client data, recommendations and suitable packages into one working tool.','Explore the case','Impact'],href:'#case-details'}
];
let active=0,renderer,scene,camera,groups=[],lights=[],frame=0,last=0,time=0,travel=0,targetTravel=0,entry=0,pointer={x:.7,y:.5,tx:.7,ty:.5,inside:false},cursorAngle=-.3,targetAngle=-.3,pressed=0,pressTarget=0,copyTimer=0,openedAt=0,pressedAt=0;
const mobileEntry=document.querySelector('.hero-display'),compact=matchMedia('(max-width:780px), (pointer:coarse)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)'),host=dialog.querySelector('.explore-canvas');
const cursor=dialog.querySelector('.explore-cursor'),title=dialog.querySelector('h2'),description=dialog.querySelector('.explore-description'),detail=dialog.querySelector('.explore-detail');
const buttons=[...dialog.querySelectorAll('[data-world]')],clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t;
function updateLabels(){
 const lang=root.lang==='en'?'en':'ru';buttons.forEach((b,i)=>b.textContent=entries[i][lang][3]);
 dialog.querySelector('.explore-close').setAttribute('aria-label',lang==='en'?'Close chapters':'Закрыть разделы');
 dialog.querySelector('.explore-nav').setAttribute('aria-label',lang==='en'?'Interactive chapters':'Интерактивные разделы');
 dialog.querySelector('.explore-metric small').textContent=lang==='en'?'minutes per proposal':'минут на предложение';
 trigger.setAttribute('role','button');trigger.tabIndex=compact.matches?-1:0;trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','explore-worlds');
 trigger.setAttribute('aria-label',lang==='en'?'Explore processes, data and impact. Click or hold and release the cube.':'Открыть процессы, данные и результат. Нажмите на куб или удерживайте и отпустите.');
 mobileEntry.setAttribute('aria-hidden',compact.matches?'false':'true');mobileEntry.tabIndex=compact.matches?0:-1;if(compact.matches){mobileEntry.setAttribute('role','button');mobileEntry.setAttribute('aria-haspopup','dialog');mobileEntry.setAttribute('aria-label',trigger.getAttribute('aria-label'));}else mobileEntry.removeAttribute('role');
 if(dialog.open){writeCopy();dialog.toggleAttribute('data-static',reduced.matches||root.dataset.motion==='off');}
}
function writeCopy(){const text=entries[active][root.lang==='en'?'en':'ru'];title.textContent=text[0];description.textContent=text[1];detail.querySelector('span').textContent=text[2];detail.href=entries[active].href;dialog.querySelector('.explore-count').textContent=`0${active+1} / 03`;}
function select(index,instant=false){
 active=(index+3)%3;targetTravel=active*14;dialog.dataset.world=String(active);cursor.querySelector('.cursor-main').setAttribute('d',active===1?'M6 6H29V11H15L30 26L25 31L11 16V30H6Z':'M6 6 32 17 21 21 17 32Z');
 buttons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 clearTimeout(copyTimer);
 if(instant||reduced.matches||root.dataset.motion==='off'){travel=targetTravel;writeCopy();}
 else {dialog.classList.add('is-travelling');copyTimer=setTimeout(()=>{writeCopy();dialog.classList.remove('is-travelling');},220);}
 schedule();
}
function open(){
 if(dialog.open||document.querySelector('#intro-film')?.open)return;
 root.dataset.explorer='open';dialog.showModal();dialog.classList.add('is-entering');openedAt=performance.now();entry=0;time=0;last=0;pointer.inside=false;pointer.tx=.7;pointer.ty=.5;pressTarget=0;select(0,true);updateLabels();
 try{if(!renderer)build();}catch(e){dialog.classList.add('explore-fallback');host.textContent='mp.';}
 resize();schedule();setTimeout(()=>dialog.classList.remove('is-entering'),800);
}
function close(){if(dialog.open)dialog.close();}
trigger.addEventListener('click',open);
mobileEntry.addEventListener('click',()=>{if(compact.matches)open();});
mobileEntry.addEventListener('keydown',e=>{if(compact.matches&&(e.key==='Enter'||e.code==='Space')){e.preventDefault();open();}});
compact.addEventListener('change',updateLabels);
trigger.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();open();}});
trigger.addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();open();}});
dialog.querySelector('.explore-close').addEventListener('click',close);
dialog.addEventListener('close',()=>{cancelAnimationFrame(frame);frame=0;clearTimeout(copyTimer);root.dataset.explorer='closed';pointer.inside=false;pressTarget=0;dialog.classList.remove('has-pointer');document.dispatchEvent(new Event('portfolio-explorer-close'));});
detail.addEventListener('click',e=>{e.preventDefault();const href=entries[active].href;close();history.pushState(null,'',href);document.querySelector(href)?.scrollIntoView({behavior:reduced.matches||root.dataset.motion==='off'?'instant':'smooth',block:'start'});});
buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
dialog.addEventListener('keydown',e=>{if(e.target===detail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(active+(e.key==='ArrowRight'?1:-1));buttons[active].focus({preventScroll:true});}});
dialog.addEventListener('pointermove',e=>{
 if(!fine.matches)return;const rect=dialog.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height,dx=x-pointer.tx,dy=y-pointer.ty;
 if(Math.abs(dx)+Math.abs(dy)>.002)targetAngle=Math.atan2(dy,dx)+Math.PI*.75;
 pointer.tx=x;pointer.ty=y;pointer.inside=true;dialog.classList.add('has-pointer');dialog.dataset.cursor=e.target.closest('button,a')?'link':'scene';schedule();
});
dialog.addEventListener('pointerleave',()=>{pointer.inside=false;dialog.classList.remove('has-pointer');pressTarget=0;schedule();});
dialog.addEventListener('pointerdown',e=>{if(e.button===0&&!e.target.closest('button,a')){pressTarget=1;pressedAt=performance.now();dialog.setPointerCapture(e.pointerId);}schedule();});
dialog.addEventListener('pointerup',()=>{if(pressTarget&&performance.now()-pressedAt>=800)select(active+1);pressTarget=0;schedule();});
dialog.addEventListener('pointercancel',()=>{pressTarget=0;schedule();});
addEventListener('blur',()=>{pointer.inside=false;pressTarget=0;schedule();});
new MutationObserver(()=>{updateLabels();if(dialog.open)schedule();}).observe(root,{attributes:true,attributeFilter:['lang','data-motion']});
document.addEventListener('portfolio-scene-ready',updateLabels);updateLabels();
function build(){
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,90);
 const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.025).texture;scene.environmentIntensity=1.1;env.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xecf0e3,0x12190b,.9));
 const key=new THREE.DirectionalLight(0xf5f5eb,3.2);key.position.set(-3,5,5);scene.add(key);scene.add(key.target);
 const rim=new THREE.DirectionalLight(0xd4fd55,3.5);rim.position.set(4,-1,-3);scene.add(rim);scene.add(rim.target);
 const pointerLight=new THREE.PointLight(0xd4fd55,20,11,2);scene.add(pointerLight);lights=[key,rim,pointerLight];
 const metal=new THREE.MeshPhysicalMaterial({color:0x67745b,metalness:.97,roughness:.22,clearcoat:.35,clearcoatRoughness:.18});
 const black=new THREE.MeshPhysicalMaterial({color:0x1e2619,metalness:.88,roughness:.3,clearcoat:.6});
 const acid=new THREE.MeshStandardMaterial({color:0xd4fd55,emissive:0x96bf23,emissiveIntensity:.45,metalness:.5,roughness:.24});
 // Processes: a continuous interlaced route, with three independent checkpoints.
 const process=new THREE.Group();process.position.x=0;scene.add(process);groups.push(process);
 const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.25,.27,240,32,2,3),metal);knot.rotation.set(.3,.1,-.5);process.add(knot);
 const route=new THREE.Mesh(new THREE.TorusKnotGeometry(1.25,.021,240,10,2,3),acid);route.scale.setScalar(1.23);route.rotation.copy(knot.rotation);process.add(route);
 for(let i=0;i<3;i++){const node=new THREE.Mesh(new THREE.SphereGeometry(.13,32,20),acid);const a=i*Math.PI*2/3;node.position.set(Math.cos(a)*1.86,Math.sin(a)*1.86,.35);process.add(node);}
 // Data: light reveals a deformed topographic field on a single smooth surface.
 const data=new THREE.Group();data.position.x=14;scene.add(data);groups.push(data);
 const fieldMaterial=new THREE.MeshPhysicalMaterial({color:0x343f2a,metalness:.72,roughness:.27,clearcoat:.65,clearcoatRoughness:.24});
 const uniforms={uTime:{value:0},uPointer:{value:new THREE.Vector3()},uPress:{value:0}};
 fieldMaterial.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='uniform float uTime;uniform float uPress;varying vec3 vField;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float ripple=sin(position.y*5.+uTime*.38)*sin(position.x*4.-uTime*.24)*sin(position.z*3.+uTime*.3);
   transformed+=normal*ripple*(.07+uPress*.12);vField=transformed;`);
  shader.fragmentShader='uniform float uTime;uniform vec3 uPointer;uniform float uPress;varying vec3 vField;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float contour=vField.y*14.+sin(vField.x*3.+uTime*.18)*1.6+sin(vField.z*4.)*.7;
   float band=abs(fract(contour)-.5);float line=1.-smoothstep(.028,.028+fwidth(contour)*1.1,band);
   float touch=exp(-distance(vField,uPointer)*distance(vField,uPointer)*1.6);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.64,.8,.42),line*(.22+touch*.7));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance+=vec3(.55,.78,.24)*(line*(.03+touch*.48)+touch*.055);`);
 };
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(1.65,128,80),fieldMaterial);data.add(sphere);data.userData.uniforms=uniforms;
 const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.05,.016,10,160),acid);orbit.rotation.set(.9,.3,.3);data.add(orbit);
 // Impact: the loose layers become a deliberately assembled, machined signature.
 const impact=new THREE.Group();impact.position.x=28;scene.add(impact);groups.push(impact);
 const geom=new RoundedBoxGeometry(1,1,1,4,.08);
 for(let i=0;i<6;i++){const plate=new THREE.Mesh(geom,i===5?acid:black);plate.scale.set(2.2,2.65,.13);plate.position.set((i-2.5)*.10,(i-2.5)*.12,(i-2.5)*.24);plate.rotation.z=(i-2.5)*.035;impact.add(plate);}
 const face=document.createElement('canvas');face.width=face.height=1536;const ctx=face.getContext('2d');ctx.clearRect(0,0,1536,1536);ctx.fillStyle='#111210';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 630px Manrope, sans-serif';ctx.fillText('mp.',768,715);
 const texture=new THREE.CanvasTexture(face);document.fonts.load('800 630px Manrope').then(()=>{ctx.clearRect(0,0,1536,1536);ctx.font='800 630px Manrope, sans-serif';ctx.fillText('mp.',768,715);texture.needsUpdate=true;schedule();});texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const lettering=new THREE.Mesh(new THREE.PlaneGeometry(2.13,2.13),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));lettering.position.set(.25,.3,.675);lettering.rotation.z=.0875;impact.add(lettering);impact.userData.lettering=lettering;
 // A sparse particle field travels with each world; it never competes with the type.
 for(const group of groups){const coords=new Float32Array(80*3);for(let i=0;i<80;i++){const a=i*2.39996,r=2.4+(i%9)*.11;coords[i*3]=Math.cos(a)*r;coords[i*3+1]=Math.sin(a)*r;coords[i*3+2]=(i%7-3)*.38;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(coords,3));const points=new THREE.Points(geo,new THREE.PointsMaterial({color:0xa0b16e,size:.015,transparent:true,opacity:.45,depthWrite:false}));group.add(points);}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;dialog.classList.add('explore-fallback');});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{dialog.classList.remove('explore-fallback');resize();schedule();});
}
function resize(){if(!renderer)return;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();schedule();}
addEventListener('resize',()=>{if(dialog.open)resize();},{passive:true});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(dialog.open)schedule();});
reduced.addEventListener('change',schedule);
function schedule(){if(dialog.open&&!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
function draw(now){
 frame=0;if(!dialog.open||document.hidden)return;
 const dt=Math.min(50,now-last||16);last=now;const motion=root.dataset.motion==='on'&&!reduced.matches;
 if(motion)time+=dt*.001;
 const follow=1-Math.exp(-dt/85),camFollow=1-Math.exp(-dt/145);
 pointer.x=lerp(pointer.x,pointer.tx,follow);pointer.y=lerp(pointer.y,pointer.ty,follow);pressed=lerp(pressed,pressTarget,follow);
 travel=motion?lerp(travel,targetTravel,camFollow):targetTravel;entry=motion?clamp((now-openedAt)/900):1;const entrance=1-(1-entry)**3;
 let turn=targetAngle-cursorAngle;turn=Math.atan2(Math.sin(turn),Math.cos(turn));cursorAngle+=turn*follow;
 cursor.style.transform=`translate3d(${pointer.x*innerWidth}px,${pointer.y*innerHeight}px,0)`;cursor.querySelector('svg').style.transform=`rotate(${cursorAngle}rad) scale(${1+pressed*.25})`;
 dialog.style.setProperty('--light-x',`${pointer.x*100}%`);dialog.style.setProperty('--light-y',`${pointer.y*100}%`);
 if(renderer){
  const small=innerWidth<780,aspect=innerWidth/innerHeight,half=8.8*Math.tan(THREE.MathUtils.degToRad(17));
  const objectOffset=small?0:half*aspect*.34,vertical=small?(active===2?1.65:.95):0;
  camera.position.set(travel-objectOffset,vertical,8.8+(1-entrance)*5.5);
  camera.lookAt(travel-objectOffset,vertical,0);
  groups.forEach((g,i)=>{const proximity=clamp(1-Math.abs(travel-i*14)/12);g.visible=proximity>0;g.scale.setScalar((small?(active===2?(innerHeight<720?.38:.5):.55):1)*( .82+.18*proximity));g.rotation.set((pointer.y-.5)*.23,Math.sin(time*.14)*.09+(pointer.x-.5)*.26+(1-entrance)*.9,(pointer.x-.5)*.035);if(i===0)g.rotation.z+=Math.sin(time*.13)*.08;if(i===2){g.rotation.y-=.32;g.children.slice(0,6).forEach((p,j)=>{p.position.z=(j-2.5)*(.24+pressed*.13);});g.userData.lettering.position.z=g.children[5].position.z+.08;}});
  const beam=new THREE.Vector3((pointer.x-.5)*half*aspect*2+camera.position.x,(.5-pointer.y)*half*2+camera.position.y,2.8);
  lights[2].position.copy(beam);lights[2].intensity=pointer.inside?26+pressed*18:8;
  lights[0].position.set(travel-3+(pointer.x-.5)*3,4-(pointer.y-.5)*2,5);
  lights[1].position.x=travel+4;lights[0].target.position.set(travel,0,0);lights[1].target.position.set(travel,0,0);
  const data=groups[1];
  data.updateMatrixWorld();data.userData.uniforms.uPointer.value.copy(new THREE.Vector3(beam.x,beam.y,.8));data.worldToLocal(data.userData.uniforms.uPointer.value);
  data.userData.uniforms.uTime.value=time;data.userData.uniforms.uPress.value=pressed;
  renderer.render(scene,camera);dialog.dataset.drawCalls=String(renderer.info.render.calls);
 }
 dialog.dataset.travel=travel.toFixed(3);dialog.style.setProperty('--hold',`${pressTarget?Math.min(1,(now-pressedAt)/800):0}`);
 const unsettled=Math.abs(travel-targetTravel)>.01||Math.abs(pointer.x-pointer.tx)+Math.abs(pointer.y-pointer.ty)+Math.abs(pressed-pressTarget)>.001||entry<1;
 if(motion||unsettled||pressTarget)schedule();
}
