import * as THREE from './vendor/three.module.min.js';

// One GPU context shared by four chapters. Frames are drawn only on input.
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)');
const mobile=matchMedia('(max-width: 780px)');
const definitions=[
 ['hero','.diagram-stage','.hero'],
 ['film','.film-art','.scroll-film'],
 ['case','.case-screen','.case-reel'],
 ['signature','.contact','.contact']
];
const entries=definitions.map(([name,selector,section])=>{
 const parent=document.querySelector(selector),host=document.createElement('div');
 host.className=`world-host world-${name}`;host.setAttribute('aria-hidden','true');parent.append(host);
 return {name,host,parent,section:document.querySelector(section),top:0,height:0};
});
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:!coarse.matches,powerPreference:'low-power'});}catch(_){/* Static artwork remains the fallback. */}
if(renderer) start();
function start(){
 renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(devicePixelRatio,coarse.matches?1.25:1.7));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,70);camera.position.set(0,0,10);
 const model=new THREE.Group();scene.add(model);
 scene.add(new THREE.HemisphereLight(0xf1ffd6,0x151923,3));
 const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,5,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xc9ff45,5);rim.position.set(-4,1,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight(0x86a8bd,2);fill.position.set(2,-3,2);scene.add(fill);
 const geometry=new THREE.BoxGeometry(1,1,1);
 const metal=new THREE.MeshStandardMaterial({color:0x68765c,metalness:.68,roughness:.26});
 const lime=new THREE.MeshStandardMaterial({color:0xd4fd55,emissive:0x91be20,emissiveIntensity:.4,metalness:.25,roughness:.28});
 const plates=new THREE.InstancedMesh(geometry,metal,60),accents=new THREE.InstancedMesh(geometry,lime,60);
 plates.instanceMatrix.setUsage(THREE.DynamicDrawUsage);accents.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 plates.frustumCulled=false;accents.frustumCulled=false;model.add(plates,accents);
 const cageGeo=new THREE.BoxGeometry(3.15,3.15,3.15);
 const glass=new THREE.Mesh(cageGeo,new THREE.MeshPhysicalMaterial({color:0x718875,metalness:.25,roughness:.12,transparent:true,opacity:.1,depthWrite:false,side:THREE.FrontSide,clearcoat:1}));
 const cage=new THREE.LineSegments(new THREE.EdgesGeometry(cageGeo),new THREE.LineBasicMaterial({color:0xc4ee69,transparent:true,opacity:.5}));
 model.add(glass,cage);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,.008,4,100),new THREE.MeshBasicMaterial({color:0x8aa448,transparent:true,opacity:.4}));ring.rotation.x=Math.PI/2.7;model.add(ring);
 const dummy=new THREE.Object3D();
 const clamp=x=>Math.max(0,Math.min(1,x));const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};const lerp=(a,b,t)=>a+(b-a)*t;
 const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'];
 const signature=[];glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')signature.push([(x-5.5)*.4,(2.5-y)*.4,0])}));
 let frame=0,dirty=true,current=null,lastTime=0,px=0,py=0,contextLost=false,previousP=-1;
 function measure(){
  const y=scrollY;entries.forEach(e=>{const r=e.section.getBoundingClientRect();e.top=r.top+y;e.height=r.height});dirty=false;
 }
 function render(time=0){
  frame=0;if(document.hidden||contextLost)return;
  if(coarse.matches&&time-lastTime<30){frame=requestAnimationFrame(render);return;}lastTime=time;
  if(dirty)measure();
  const on=root.dataset.motion==='on'&&!reduced.matches;
  const mid=scrollY+innerHeight*.5;
  const entry=entries.find(e=>mid>=e.top&&mid<e.top+e.height);
  if(!entry){if(current){current.parent.classList.remove('world-active');current.host.style.visibility='hidden';current=null;}return;}
  if(current!==entry){
   if(current){current.parent.classList.remove('world-active');current.host.style.visibility='hidden';}
   current=entry;current.host.style.visibility='';current.host.append(canvas);previousP=-1;
   const r=current.host.getBoundingClientRect();if(!r.width||!r.height)return;
   renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
  }
  const inset=mobile.matches?72:86;
  const p=clamp((scrollY-entry.top+inset)/Math.max(1,entry.height-(innerHeight-inset)));
  // A disabled motion preference keeps a single still frame in each chapter.
  const q=on?p:(entry.name==='case'?1:0);
  if(!on&&previousP===q)return;previousP=q;
  let explode=0,compress=0,mono=0;
  if(entry.name==='film')explode=Math.sin(q*Math.PI)*1.4;
  if(entry.name==='case'){explode=smooth(q/.35);compress=smooth((q-.5)/.3);explode*=1-compress;}
  if(entry.name==='signature')mono=1;
  const spin=on?px*.2:0,tilt=on?py*.14:0;
  model.rotation.set(mono?-.08:.25+tilt,mono?-.08:-.55+(entry.name==='film'?q*1.5:entry.name==='case'?q*.8:0)+spin,mono?0:-.1);
  camera.position.z=entry.name==='hero'?8.8:entry.name==='film'?lerp(10,8,Math.sin(q*Math.PI)):entry.name==='signature'?8.5:9.5;
  if(entry.name==='case')camera.position.z=Math.max(camera.position.z,(4.2+explode*2)/(2*Math.tan(THREE.MathUtils.degToRad(19))*camera.aspect));
  glass.material.opacity=.1*(1-clamp(explode))*(1-compress)*(1-mono);
  cage.material.opacity=.5*(1-clamp(explode))*(1-compress)*(1-mono);
  ring.visible=!mono;ring.rotation.z=q*1.5;ring.material.opacity=.3*(1-compress);
  const keep=10;
  for(let i=0;i<60;i++){
   const x=(i%4-1.5)*.7,y=(Math.floor(i/4)%5-2)*.56,z=(Math.floor(i/20)-1)*.88;
   const e=explode,group=i%keep;
   const tx=(group%2-.5)*1.7,ty=(Math.floor(group/2)-2)*.53;
   let sx=.58,sy=.12,sz=.72;
   dummy.position.set(lerp(x*(1+e*1.1),tx,compress),lerp(y*(1+e*.6),ty,compress),lerp(z*(1+e*1.4),0,compress));
   dummy.rotation.set(e*.17*(i%3-1),e*.25*(i%5-2),0);
   sx=lerp(sx,1.4,compress);sy=lerp(sy,.24,compress);sz=lerp(sz,.78,compress);
   let size=i<keep?1:1-compress;
   if(mono){const v=signature[i];dummy.position.set(...(v||[0,0,0]));dummy.rotation.set(0,0,0);sx=.32;sy=.32;sz=.25;size=v?1:0;}
   dummy.scale.set(sx*size,sy*size,sz*size);dummy.updateMatrix();plates.setMatrixAt(i,dummy.matrix);
   dummy.scale.set(sx*size,.016*size,sz*size);dummy.position.y+=sy*size*.5+.009;dummy.updateMatrix();accents.setMatrixAt(i,dummy.matrix);
  }
  plates.instanceMatrix.needsUpdate=true;accents.instanceMatrix.needsUpdate=true;
  renderer.render(scene,camera);entry.parent.classList.add('world-active');root.classList.add('webgl-ready');
 }
 function schedule(){if(!frame&&!contextLost)frame=requestAnimationFrame(render)}
 function resize(){dirty=true;if(current){current.parent.classList.remove('world-active');current=null;}schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{if(coarse.matches||!current||root.dataset.motion!=='on'||reduced.matches)return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;schedule()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resize()});
 reduced.addEventListener('change',resize);coarse.addEventListener('change',()=>{renderer.setPixelRatio(Math.min(devicePixelRatio,coarse.matches?1.25:1.7));resize()});
 new MutationObserver(resize).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
 if('ResizeObserver'in window)new ResizeObserver(()=>{dirty=true;schedule()}).observe(document.querySelector('main'));
 if(document.fonts)document.fonts.ready.then(resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;root.classList.remove('webgl-ready');entries.forEach(e=>e.parent.classList.remove('world-active'));canvas.style.visibility='hidden';});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;canvas.style.visibility='';resize()});
 schedule();
}
