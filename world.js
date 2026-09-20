import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// A single fixed canvas and a single mesh carry the object through the whole page.
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:780px)'),coarse=matchMedia('(pointer:coarse)');
const host=document.createElement('div');host.className='world-viewport';host.setAttribute('aria-hidden','true');document.body.append(host);
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:!(mobile.matches||coarse.matches),powerPreference:'low-power'});}catch(_){host.remove();}
if(renderer)start();
function start(){
 const light=()=>mobile.matches||coarse.matches;
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(renderer.domElement);root.classList.add('webgl-ready');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,80);camera.position.z=11;
 const studio=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.04).texture;scene.environmentIntensity=1.2;studio.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe1edee,0x080a0c,.5));
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-3,5,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.015;scene.add(key);
 const rim=new THREE.DirectionalLight(0xd4fd55,2);rim.position.set(4,2,-4);scene.add(rim);
 const cool=new THREE.DirectionalLight(0x7c9da8,.8);cool.position.set(-5,-1,2);scene.add(cool);
 const geometry=new RoundedBoxGeometry(1,1,1,light()?1:2,.07);
 const metal=new THREE.MeshStandardMaterial({color:0x293026,metalness:.85,roughness:.3});
 const acid=new THREE.MeshBasicMaterial({color:0xd4fd55,toneMapped:false});
 const model=new THREE.Group();scene.add(model);
 const blocks=new THREE.InstancedMesh(geometry,metal,60),seams=new THREE.InstancedMesh(geometry,acid,60);
 for(const mesh of [blocks,seams]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;model.add(mesh)}blocks.castShadow=true;blocks.receiveShadow=true;
 const dummy=new THREE.Object3D(),target=new THREE.Vector3();
 const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'],signature=[];
 glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')signature.push([(x-5.5)*.39,(2.5-y)*.39,0])}));
 const el=s=>document.querySelector(s);
 let anchors=[],dirty=true,frame=0,lastTime=0,px=0,py=0,lost=false;
 // x/y are viewport fractions; form goes cube -> opened -> compressed -> signature.
 function measure(){
  const top=s=>el(s).getBoundingClientRect().top+scrollY;
  const film=el('.scroll-film'),reel=el('.case-reel'),sig=el('.signature-reel');
  const travel=Math.max(1,reel.offsetHeight-innerHeight+86);
  const filmTravel=Math.max(1,film.offsetHeight-innerHeight+86);
  const state=(at,form,x,y,size,opacity,turn)=>({at,form,x,y,size,opacity,turn});
  anchors=[
   state(0,0,.77,.55,.86,1,0),
   state(top('.scroll-film'),.2,.5,.55,1,.32,.45),
   state(top('.scroll-film')+filmTravel*.65,1,.5,.55,1.1,.3,1.4),
   state(top('#experience')-innerHeight*.2,1.15,.83,.55,.68,.18,1.8),
   state(top('.case-reel')-86,0,.78,.55,.78,1,2.1),
   state(top('.case-reel')-86+travel*.48,1,.78,.55,.85,1,2.6),
   state(top('.case-reel')-86+travel*.84,2,.78,.55,.78,1,3.1),
   state(top('.toolkit')-innerHeight*.25,2,.8,.58,.7,.22,3.6),
   state(top('#about')-innerHeight*.2,2.3,.82,.55,.75,.2,4.1),
   state(top('.signature-reel')-innerHeight*.7,2.5,.65,.55,.85,.45,4.8),
   state(top('.signature-reel')-86,2.65,.5,.55,1,1,5.1),
   state(top('.signature-reel')-86+Math.max(1,sig.offsetHeight-innerHeight)*.85,3,.5,.55,1,1,Math.PI*2),
   state(top('#contact')-innerHeight*.15,3,.77,.75,.62,.26,Math.PI*2)
  ].sort((a,b)=>a.at-b.at);
  dirty=false;
 }
 function draw(time=0){
  frame=0;if(document.hidden||lost)return;
  if(light()&&time-lastTime<30){frame=requestAnimationFrame(draw);return}lastTime=time;
  if(dirty)measure();
  let a=anchors[0],b=a;
  for(let i=1;i<anchors.length;i++){b=anchors[i];if(scrollY<=b.at)break;a=b;}
  const t=smooth((scrollY-a.at)/Math.max(1,b.at-a.at));
  const get=k=>lerp(a[k],b[k],t);
  const on=root.dataset.motion==='on'&&!reduced.matches;
  if(!on)return;
  let form=get('form'),turn=get('turn');
  const opened=form<=1?form:form<=2?2-form:Math.sin((form-2)*Math.PI)*.65;
  const packed=smooth(form-1)*(1-smooth((form-2)/.65));
  const mono=smooth((form-2.45)/.55);
  let x=get('x'),y=get('y'),size=get('size'),opacity=get('opacity');
  if(mobile.matches){x=lerp(.68,.5,mono);size*=lerp(.9,1.1,mono);opacity=form>2.55?opacity:Math.min(opacity,.2);if(scrollY<innerHeight*.5){y=.58;opacity=.26;}}
  host.style.opacity=String(opacity);
  const halfHeight=11*Math.tan(THREE.MathUtils.degToRad(18)),halfWidth=halfHeight*camera.aspect;
  model.position.set((x-.5)*2*halfWidth,(.5-y)*2*halfHeight,0);
  const fit=Math.min(1,camera.aspect/1.15);model.scale.setScalar(size*fit);
  model.rotation.set(lerp(.32+(on?py*.12:0),0,mono),lerp(-.62+turn+(on?px*.15:0),Math.PI*2,mono),lerp(-.08,0,mono));
  for(let i=0;i<60;i++){
   const cx=(i%4-1.5)*.59,cy=(Math.floor(i/4)%5-2)*.49,cz=(Math.floor(i/20)-1)*.74;
   const j=i%10;
   dummy.position.set(lerp(cx*(1+opened*1.2),(j%2-.5)*1.5,packed),lerp(cy*(1+opened*.8),(Math.floor(j/2)-2)*.53,packed),lerp(cz*(1+opened*1.1),0,packed));
   dummy.rotation.set(opened*.12*(i%3-1),opened*.16*(i%5-2),0);
   let sx=lerp(.54,1.32,packed),sy=lerp(.43,.32,packed),sz=lerp(.68,.75,packed),scale=i<10?1:1-packed;
   if(form>2.45){
    const m=smooth((form-2.45-(i%5)*.008)/.51),v=signature[i]||[cx*2,cy*2,-4];
    target.set(...v);dummy.position.lerp(target,m);dummy.rotation.set(dummy.rotation.x*(1-m),dummy.rotation.y*(1-m),0);
    sx=lerp(sx,.34,m);sy=lerp(sy,.34,m);sz=lerp(sz,.38,m);scale=i<signature.length?lerp(scale,1,m):scale*(1-m);
   }
   dummy.scale.set(sx*scale,sy*scale,sz*scale);dummy.updateMatrix();blocks.setMatrixAt(i,dummy.matrix);
   dummy.scale.set(sx*scale*.76,.014*scale,.022*scale);dummy.translateY(sy*scale*.27);dummy.translateZ(sz*scale*.5+.004);dummy.updateMatrix();seams.setMatrixAt(i,dummy.matrix);
  }
  blocks.instanceMatrix.needsUpdate=true;seams.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);
 }
 function schedule(){if(!frame&&!lost)frame=requestAnimationFrame(draw)}
 function resize(){dirty=true;renderer.setPixelRatio(Math.min(devicePixelRatio,light()?1.25:1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!light();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{if(light()||root.dataset.motion!=='on'||reduced.matches)return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;schedule()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else resize()});
 new MutationObserver(resize).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
 reduced.addEventListener('change',resize);coarse.addEventListener('change',resize);
 new ResizeObserver(()=>{dirty=true;schedule()}).observe(document.querySelector('main'));document.fonts?.ready.then(resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.style.visibility='hidden';root.classList.remove('webgl-ready')});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.style.visibility='';root.classList.add('webgl-ready');resize()});
 resize();
}
