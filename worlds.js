import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const root=document.documentElement,sections=[...document.querySelectorAll('.inline-world')];
const host=document.createElement('div');host.className='inline-canvas';host.setAttribute('aria-hidden','true');document.body.append(host);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);},ease=x=>1-Math.pow(1-clamp(x),3);
const duration=3200;
// Each entrance runs once per visit. Leaving the viewport never strands hidden copy.
function entry(view,bounds,dt,motion){
 if(!motion||bounds.bottom<innerHeight*.15){view.elapsed=duration;view.started=true;}
 else if(!view.started&&bounds.top<innerHeight*.65){view.started=true;}
 if(view.started&&motion)view.elapsed=Math.min(duration,view.elapsed+dt);
 const t=view.elapsed,delay=[850,1050,1200][view.index];
 if(view.copyTime===t)return t;
 view.copyTime=t;
 view.section.style.setProperty('--title-reveal',smooth((t-delay)/900));
 view.section.style.setProperty('--body-reveal',smooth((t-delay-380)/850));
 view.section.style.setProperty('--metric-reveal',smooth((t-2050)/800));
 view.section.dataset.entry=view.started?(t>=duration?'complete':'playing'):'queued';
 view.section.dataset.entryTime=Math.round(t);
 return t;
}
let renderer,scene,camera,groups=[],lights=[],frame=0,last=0,time=0,lost=false,dirty=true,activeSection=null;
let pointer={x:0,y:0,tx:0,ty:0},pressed=0,pressTarget=0;
const views=sections.map(section=>({section,art:section.querySelector('.inline-art'),index:Number(section.dataset.world),visible:false,started:false,elapsed:0}));
function clearPointer(){activeSection?.classList.remove('has-pointer');activeSection=null;pressTarget=0;schedule();}
for(const view of views){
 const {section,index}=view;
 section.addEventListener('pointermove',e=>{
  if(!fine.matches||root.dataset.motion!=='on'||reduced.matches)return;
  if(activeSection!==section){activeSection?.classList.remove('has-pointer');activeSection=section;}
  pointer.tx=e.clientX;pointer.ty=e.clientY;section.classList.add('has-pointer');schedule();
 },{passive:true});
 section.addEventListener('pointerleave',clearPointer);
 section.addEventListener('pointerdown',e=>{if(e.button===0&&e.target.closest('.inline-art')&&root.dataset.motion==='on'&&!reduced.matches){pressTarget=1;section.setPointerCapture(e.pointerId);schedule();}});
 section.addEventListener('pointerup',()=>{pressTarget=0;schedule();});section.addEventListener('pointercancel',clearPointer);
}
addEventListener('blur',clearPointer);
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const view=views.find(v=>v.section===entry.target);view.visible=entry.isIntersecting;}schedule();},{rootMargin:'100px'});views.forEach(v=>observer.observe(v.section));
new MutationObserver(()=>{if(root.dataset.motion!=='on')clearPointer();schedule();}).observe(root,{attributes:true,attributeFilter:['lang','data-motion']});
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
 const routeMaterial=acid.clone(),routeUniform={value:1};
 routeMaterial.onBeforeCompile=shader=>{
  shader.uniforms.uRoute=routeUniform;
  shader.vertexShader='varying float vRoute;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRoute=uv.x;');
  shader.fragmentShader='uniform float uRoute;varying float vRoute;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   if(vRoute>uRoute)discard;`);
 };process.userData.route=routeUniform;
 const route=new THREE.Mesh(new THREE.TorusKnotGeometry(1.25,.021,240,10,2,3),routeMaterial);route.scale.setScalar(1.23);route.rotation.copy(knot.rotation);process.add(route);
 for(let i=0;i<3;i++){const node=new THREE.Mesh(new THREE.SphereGeometry(.13,32,20),acid);const a=i*Math.PI*2/3;node.position.set(Math.cos(a)*1.86,Math.sin(a)*1.86,.35);process.add(node);}
 // Data: light reveals a deformed topographic field on a single smooth surface.
 const data=new THREE.Group();data.position.x=14;scene.add(data);groups.push(data);
 const fieldMaterial=new THREE.MeshPhysicalMaterial({color:0x343f2a,metalness:.72,roughness:.27,clearcoat:.65,clearcoatRoughness:.24});
 const uniforms={uTime:{value:0},uPointer:{value:new THREE.Vector3()},uPress:{value:0},uScan:{value:1}};
 fieldMaterial.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='uniform float uTime;uniform float uPress;varying vec3 vField;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float ripple=sin(position.y*5.+uTime*.38)*sin(position.x*4.-uTime*.24)*sin(position.z*3.+uTime*.3);
   transformed+=normal*ripple*(.07+uPress*.12);vField=transformed;`);
  shader.fragmentShader='uniform float uTime;uniform vec3 uPointer;uniform float uPress;uniform float uScan;varying vec3 vField;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float contour=vField.y*14.+sin(vField.x*3.+uTime*.18)*1.6+sin(vField.z*4.)*.7;
   float band=abs(fract(contour)-.5);float line=1.-smoothstep(.028,.028+fwidth(contour)*1.1,band);
   float touch=exp(-distance(vField,uPointer)*distance(vField,uPointer)*1.6);
   float scanY=mix(2.1,-2.1,uScan);
   float scanned=smoothstep(scanY-.12,scanY+.12,vField.y);
   float sweep=exp(-pow((vField.y-scanY)*9.,2.))*(1.-step(.999,uScan));
   line*=scanned;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.64,.8,.42),line*(.22+touch*.7)+sweep*.6);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance+=vec3(.55,.78,.24)*(line*(.03+touch*.48)+touch*.055+sweep*.55);`);
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
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.style.visibility='hidden';root.classList.remove('inline-ready');});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;views.forEach(v=>{v.section.dataset.entry=v.elapsed>=duration?'complete':'queued';});root.classList.add('inline-ready');resize();});
 views.forEach(v=>{v.section.dataset.entry=v.elapsed>=duration?'complete':'queued';});root.classList.add('inline-ready');resize();
}
function resize(){dirty=true;schedule();}
addEventListener('resize',resize,{passive:true});
new ResizeObserver(resize).observe(document.querySelector('main'));document.fonts.ready.then(resize);
addEventListener('scroll',schedule,{passive:true});document.addEventListener('portfolio-scroll-frame',schedule);
reduced.addEventListener('change',()=>{clearPointer();schedule();});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
function schedule(){if(!frame&&!document.hidden&&!lost)frame=requestAnimationFrame(draw);}
function draw(now){
 frame=0;if(document.hidden||lost)return;
 const dt=Math.min(50,now-last||16);last=now;const motion=root.dataset.motion==='on'&&!reduced.matches;
 const movieOpen=document.querySelector('#intro-film')?.open;
 const snapshots=views.map(v=>({view:v,section:v.section,index:v.index,rect:v.art.getBoundingClientRect(),bounds:v.section.getBoundingClientRect()}));
 // Copy timing survives scrolling past the art slot, especially in the mobile stack.
 if(!movieOpen)for(const v of snapshots){
  if(v.bounds.bottom>0&&v.bounds.top<innerHeight)entry(v.view,v.bounds,dt,motion);
  else if(v.view.started&&v.view.elapsed<duration)entry(v.view,v.bounds,0,false);
 }
 const entering=motion&&!movieOpen&&snapshots.some(v=>v.view.started&&v.view.elapsed<duration);
 const visible=snapshots.filter(v=>v.view.visible&&v.rect.bottom>0&&v.rect.top<innerHeight);
 if(activeSection){const r=activeSection.getBoundingClientRect();if(pointer.ty<r.top||pointer.ty>r.bottom)clearPointer();}
 if(!visible.length||movieOpen){host.style.visibility='hidden';if(renderer){renderer.setScissorTest(false);renderer.clear();}if(entering)schedule();return;}
 if(!renderer){try{build();}catch(e){host.remove();lost=true;return;}}
 if(dirty){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);dirty=false;}
 if(motion)time+=dt*.001;
 const follow=1-Math.exp(-dt/75);pointer.x=lerp(pointer.x,pointer.tx,follow);pointer.y=lerp(pointer.y,pointer.ty,follow);pressed=lerp(pressed,motion?pressTarget:0,follow);
 host.style.visibility='visible';renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
 for(const {view,section,index,rect,bounds} of visible){
  const t=view.elapsed,arrival=ease(t/1900),settle=smooth(t/2400);
  const g=groups[index],isPointer=activeSection===section;
  const x=isPointer?clamp((pointer.x-rect.left)/rect.width):.65,y=isPointer?clamp((pointer.y-rect.top)/rect.height):.45;
  section.style.setProperty('--light-x',`${isPointer?clamp((pointer.x-bounds.left)/bounds.width)*100:72}%`);
  section.style.setProperty('--light-y',`${isPointer?clamp((pointer.y-bounds.top)/bounds.height)*100:50}%`);
  const progress=motion?clamp((innerHeight-bounds.top)/(innerHeight+bounds.height)):.5;
  const amount=isPointer?pressed:0,aspect=rect.width/rect.height,distance=(index===2?8.2:8.8)/Math.min(1,aspect);
  groups.forEach(other=>other.visible=other===g);g.scale.setScalar(lerp(index===1?.78:.72,1,arrival));
  const restingY=index===2?-.4+(progress-.5)*.65:(progress-.5)*.8+Math.sin(time*.13)*.07+(x-.5)*.22;
  g.rotation.set((y-.5)*.18+(1-arrival)*(index===0?.85:index===1?-.32:.18),restingY+(1-arrival)*(index===0?-2.15:index===1?1.2:-.9),index===0?-.18+Math.sin(time*.12)*.05+(1-arrival)*.55:0);
  if(index===0){g.userData.route.value=smooth((t-180)/1450);g.children.slice(2,5).forEach((node,j)=>{node.scale.setScalar(.001+.999*smooth((t-450-j*230)/520));});}
  if(index===1){g.children[1].rotation.set(.9+(1-arrival)*1.7,.3+(1-arrival)*.8,.3+(1-arrival)*.6);g.userData.uniforms.uScan.value=smooth((t-200)/1550);}
  if(index===2){
   g.children.slice(0,6).forEach((plate,j)=>{
    const assembled=ease((t-j*120)/1450),offset=1-assembled;
    plate.position.set((j-2.5)*.10+offset*(j%2?1.1:-1.1),(j-2.5)*.12+offset*(j-2.5)*.45,(j-2.5)*(.24+amount*.13+offset*.15));
    plate.rotation.set(0,offset*(j%2?.08:-.08),(j-2.5)*.035+offset*(j%2?.18:-.18));
   });
   const front=g.children[5],lettering=g.userData.lettering;
   lettering.position.copy(front.position);lettering.quaternion.copy(front.quaternion);lettering.translateZ(.076);
  }
  const gx=g.position.x;camera.aspect=aspect;camera.position.set(gx+(1-arrival)*(index===0?1.2:index===1?-.7:.6),(1-arrival)*.45,distance*(1+(1-arrival)*.12));camera.lookAt(gx,0,0);camera.updateProjectionMatrix();
  lights[0].position.set(gx-3+(x-.5)*3+(1-settle)*6,4-(y-.5)*2,5);lights[0].target.position.set(gx,0,0);
  lights[1].position.set(gx+4,-1,-3);lights[1].target.position.set(gx,0,0);
  lights[2].position.set(gx+(x-.5)*5,(.5-y)*5,2.8);lights[2].intensity=isPointer?26+amount*18:10;
  if(index===1){g.updateMatrixWorld();g.userData.uniforms.uPointer.value.set(gx+(x-.5)*5,(.5-y)*5,.8);g.worldToLocal(g.userData.uniforms.uPointer.value);g.userData.uniforms.uTime.value=time;g.userData.uniforms.uPress.value=amount;}
  const bottom=Math.max(0,innerHeight-rect.bottom),height=Math.min(innerHeight,rect.bottom)-Math.max(0,rect.top);
  renderer.setViewport(rect.left,innerHeight-rect.bottom,rect.width,rect.height);
  renderer.setScissor(Math.max(0,rect.left),bottom,Math.min(innerWidth,rect.right)-Math.max(0,rect.left),Math.max(0,height));renderer.render(scene,camera);
 }
 host.dataset.visibleWorlds=visible.map(v=>v.index).join(',');
 const unsettled=Math.abs(pointer.x-pointer.tx)+Math.abs(pointer.y-pointer.ty)+Math.abs(pressed-pressTarget)>.01;
 if(motion||unsettled)schedule();
}
schedule();
