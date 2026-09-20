import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { HDRLoader } from './vendor/HDRLoader.js';

// A single fixed canvas and a single mesh carry the object through the whole page.
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:780px)'),coarse=matchMedia('(pointer:coarse)');
const host=document.createElement('div');host.className='world-viewport';host.setAttribute('aria-hidden','true');document.body.append(host);
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:!(mobile.matches||coarse.matches),powerPreference:'low-power'});}catch(_){host.remove();}
if(renderer)start();
function start(){
 const light=()=>mobile.matches||coarse.matches;
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(renderer.domElement);root.classList.add('webgl-ready');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,80);camera.position.z=11;
 const studio=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.04).texture;scene.environmentIntensity=.5;studio.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe1edee,0x080a0c,.3));
 const key=new THREE.DirectionalLight(0xe8eddd,1.0);key.position.set(-3,5,7);key.castShadow=true;key.shadow.mapSize.set(1536,1536);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.015;scene.add(key);
 const rim=new THREE.DirectionalLight(0xd4fd55,1.25);rim.position.set(4,2,-4);scene.add(rim);
 const cool=new THREE.DirectionalLight(0x89938a,.58);cool.position.set(-5,-1,2);scene.add(cool);
 const geometry=new RoundedBoxGeometry(1,1,1,light()?1:3,.045);
 const surface=document.createElement('canvas');surface.width=surface.height=256;const ctx=surface.getContext('2d'),pixels=ctx.createImageData(256,256);
 let seed=42;for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(seed*1664525+1013904223)>>>0;const n=(seed>>>24)/255,v=150+Math.sin(y*2.1)*7+n*24;const k=(y*256+x)*4;pixels.data[k]=pixels.data[k+1]=pixels.data[k+2]=v;pixels.data[k+3]=255;}ctx.putImageData(pixels,0,0);
 const finish=new THREE.CanvasTexture(surface);finish.wrapS=finish.wrapT=THREE.RepeatWrapping;finish.repeat.set(2,2);finish.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const Metal=light()?THREE.MeshStandardMaterial:THREE.MeshPhysicalMaterial;
 const metal=new Metal({color:0x30322d,metalness:.94,roughness:.5,roughnessMap:finish,bumpMap:finish,bumpScale:.0035,...(!light()?{clearcoat:.12,clearcoatRoughness:.34,anisotropy:.32}:{})});
 const insetMaterial=new THREE.MeshStandardMaterial({color:0x11170f,metalness:.7,roughness:.44});
 const panelMaterial=new THREE.MeshStandardMaterial({color:0x414638,metalness:.84,roughness:.48,roughnessMap:finish,bumpMap:finish,bumpScale:.002});
 const fastenerMaterial=new THREE.MeshStandardMaterial({color:0x59604f,metalness:1,roughness:.34});
 const acid=new THREE.MeshBasicMaterial({color:0xd4fd55,toneMapped:false});
 const model=new THREE.Group();scene.add(model);
 const blocks=new THREE.InstancedMesh(geometry,metal,60),seams=new THREE.InstancedMesh(geometry,acid,60),insets=new THREE.InstancedMesh(geometry,insetMaterial,60);
 const panels=new THREE.InstancedMesh(geometry,panelMaterial,60);
 const boltGeometry=new THREE.TorusGeometry(1,.25,4,12);
 const bolts=new THREE.InstancedMesh(boltGeometry,fastenerMaterial,240);bolts.visible=!light();
 for(const mesh of [blocks,seams,insets,panels,bolts]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;model.add(mesh)}blocks.castShadow=true;blocks.receiveShadow=true;insets.receiveShadow=true;panels.receiveShadow=true;panels.castShadow=true;
 for(let i=0;i<60;i++)blocks.setColorAt(i,new THREE.Color().setScalar(.9+(i%7)*.016));
 const dummy=new THREE.Object3D(),target=new THREE.Vector3();
 const poses=Array.from({length:60},()=>({position:new THREE.Vector3(),rotation:new THREE.Euler(),sx:0,sy:0,sz:0,hx:0,hy:0,hz:0}));
 const rotationMatrix=new THREE.Matrix4(),frameRotation=new THREE.Matrix4(),corner=new THREE.Vector3();
 const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'],signature=[];
 glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')signature.push([(x-5.5)*.39,(2.5-y)*.39,0])}));
 // Minimum-distance assignment keeps letters from being assembled by crossing paths.
 const destinations=signature.map(point=>({point,visible:true}));
 while(destinations.length<60){const i=destinations.length;destinations.push({point:[(i%4-1.5)*1.1,(Math.floor(i/4)%5-2)*.8,-4],visible:false})}
 const u=Array(61).fill(0),v=Array(61).fill(0),assignment=Array(61).fill(0),way=Array(61).fill(0);
 const cost=(i,j)=>{const d=destinations[j].point;return ((i%4-1.5)*1.0445-d[0])**2+((Math.floor(i/4)%5-2)*.7417-d[1])**2+((Math.floor(i/20)-1)*1.2626-d[2])**2};
 for(let i=1;i<=60;i++){assignment[0]=i;let j0=0;const min=Array(61).fill(Infinity),used=Array(61).fill(false);
  do{used[j0]=true;const i0=assignment[j0];let delta=Infinity,j1=0;for(let j=1;j<=60;j++)if(!used[j]){const c=cost(i0-1,j-1)-u[i0]-v[j];if(c<min[j]){min[j]=c;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}
   for(let j=0;j<=60;j++)if(used[j]){u[assignment[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1;
  }while(assignment[j0]!==0);
  do{const j1=way[j0];assignment[j0]=assignment[j1];j0=j1}while(j0!==0);
 }
 const targets=Array(60);for(let j=1;j<=60;j++)targets[assignment[j]-1]=destinations[j-1];
 const el=s=>document.querySelector(s);
 let anchors=[],dirty=true,frame=0,lastTime=0,px=0,py=0,lost=false,renderY=scrollY;
 // x/y are viewport fractions; form goes cube -> opened -> compressed -> signature.
 function measure(){
  const top=s=>el(s).getBoundingClientRect().top+scrollY;
  const film=el('.scroll-film'),reel=el('.case-reel'),sig=el('.signature-reel');
  const travel=Math.max(1,reel.offsetHeight-innerHeight+86);
  const filmTravel=Math.max(1,film.offsetHeight-innerHeight+86);
  const state=(at,form,x,y,size,opacity,turn)=>({at,form,x,y,size,opacity,turn});
  // Fit the opening object to its reserved layout slot, never to window height alone.
  const slot=el('.process-diagram').getBoundingClientRect();
  const projectionHeight=22*Math.tan(THREE.MathUtils.degToRad(18));
  const fit=Math.min(1,(innerWidth/innerHeight)/1.15);
  const heroSize=Math.min(slot.width*.92,slot.height*.9)*projectionHeight/(3.55*innerHeight*fit);
  const heroX=(slot.left+slot.width*.5)/innerWidth;
  const heroY=(slot.top+scrollY+slot.height*.5)/innerHeight;
  anchors=[
   state(0,0,heroX,heroY,heroSize,1,0),
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
  if(light()&&time-lastTime<30){frame=requestAnimationFrame(draw);return}const dt=Math.min(50,time-lastTime||16);lastTime=time;
  renderY+=(scrollY-renderY)*(1-Math.exp(-dt/75));if(Math.abs(scrollY-renderY)<.1)renderY=scrollY;
  if(dirty)measure();
  let a=anchors[0],b=a;
  for(let i=1;i<anchors.length;i++){b=anchors[i];if(renderY<=b.at)break;a=b;}
  const t=smooth((renderY-a.at)/Math.max(1,b.at-a.at));
  const get=k=>lerp(a[k],b[k],t);
  const on=root.dataset.motion==='on'&&!reduced.matches;
  if(!on)return;
  let form=get('form'),turn=get('turn');
  const opened=form<=1?form:form<=2?2-form:Math.sin(Math.min(form-2,.45)*Math.PI)*.65;
  const packed=smooth(form-1)*(1-smooth((form-2)/.4));
  const mono=smooth((form-2.45)/.55);
  let x=get('x'),y=get('y'),size=get('size'),opacity=get('opacity');
  if(mobile.matches){const intro=1-smooth(renderY/(innerHeight*.6));x=lerp(lerp(.68,.5,mono),get('x'),intro);size*=lerp(.9,1.1,mono);opacity=lerp(lerp(Math.min(opacity,.3),.9,intro),opacity,smooth((form-2.4)/.35));}
  if(innerHeight<=560&&form<2.55)opacity=Math.min(opacity,.18);
  host.style.opacity=String(opacity);
  camera.zoom=1+.12*smooth((form-2.9)/.1);camera.updateProjectionMatrix();
  const halfHeight=11*Math.tan(THREE.MathUtils.degToRad(18)),halfWidth=halfHeight*camera.aspect;
  model.position.set((x-.5)*2*halfWidth/camera.zoom,(.5-y)*2*halfHeight/camera.zoom,0);
  const fit=Math.min(1,camera.aspect/1.15);model.scale.setScalar(size*fit);
  model.rotation.set(lerp(.32+(on?py*.12:0),0,mono),lerp(-.62+turn+(on?px*.15:0),Math.PI*2,mono),lerp(-.08,0,mono));
  for(let i=0;i<60;i++){
   const cx=(i%4-1.5)*.59,cy=(Math.floor(i/4)%5-2)*.49,cz=(Math.floor(i/20)-1)*.74;
   const keep=i>=40&&(i%4===0||i%4===3),column=i%4===3?1:0,row=Math.floor(i/4)%5;
   const j=i%10;
   dummy.position.set(lerp(cx*(1+opened*1.2),keep?(column-.5)*1.5:cx,packed),lerp(cy*(1+opened*.8),(row-2)*.53,packed),lerp(cz*(1+opened*1.1),keep?0:cz-1.7,packed));
   const wave=renderY*.0025+i*2.39996,free=opened*(1-smooth((form-2.15)/.25));
   dummy.position.x+=Math.sin(wave)*free*.07;dummy.position.y+=Math.cos(wave*.8)*free*.09;
   dummy.rotation.set(free*.12*Math.sin(wave),free*.17*Math.cos(wave*.7),free*.045*Math.sin(wave*.6));
   const wide=smooth((packed-.5)*2);
   let sx=lerp(.54,keep?1.32:.54,wide),sy=lerp(.43,.32,wide),sz=lerp(.68,.75,wide),scale=keep?1:1-smooth(packed*2);
   if(form>2.45){
    const m=smooth((form-2.45)/.45),v=targets[i].point;
    target.set(...v);dummy.position.lerp(target,m);
    // Matched straight trajectories avoid crossing and finish before the camera moves in.
    dummy.rotation.set(dummy.rotation.x*(1-m),dummy.rotation.y*(1-m),dummy.rotation.z*(1-m));
    sx=lerp(sx,.34,m);sy=lerp(sy,.34,m);sz=lerp(sz,.38,m);scale=(targets[i].visible?lerp(scale,1,m):scale*(1-smooth(m*2)))*(1-.47*Math.sin(m*Math.PI));
   }
   const pose=poses[i];pose.position.copy(dummy.position);pose.rotation.copy(dummy.rotation);pose.sx=sx*scale;pose.sy=sy*scale;pose.sz=sz*scale;pose.scale=scale;
   rotationMatrix.makeRotationFromEuler(pose.rotation);const r=rotationMatrix.elements;
   pose.hx=(Math.abs(r[0])*pose.sx+Math.abs(r[4])*pose.sy+Math.abs(r[8])*pose.sz)*.5;
   pose.hy=(Math.abs(r[1])*pose.sx+Math.abs(r[5])*pose.sy+Math.abs(r[9])*pose.sz)*.5;
   pose.hz=(Math.abs(r[2])*pose.sx+Math.abs(r[6])*pose.sy+Math.abs(r[10])*pose.sz)*.5;
  }
  // Perspective bounds of the actual shape, not a large enclosing sphere.
  // This allows a close final shot while every block stays inside the frame.
  if(y>.14&&y<.94){
   const tan=Math.tan(THREE.MathUtils.degToRad(18))/camera.zoom;
   const topSafe=(mobile.matches?98:120)/innerHeight;
   const left=(.045*2-1)*tan*camera.aspect,right=(.955*2-1)*tan*camera.aspect;
   const upper=(1-2*topSafe)*tan,lower=(1-2*.9)*tan;
   let fitted=size*fit;frameRotation.makeRotationFromEuler(model.rotation);
   const limit=(denominator,numerator)=>{if(denominator>1e-6)fitted=Math.min(fitted,Math.max(.03,numerator/denominator))};
   for(const p of poses)for(let c=0;c<8;c++){
    corner.set(p.position.x+(c&1?1:-1)*p.hx,p.position.y+(c&2?1:-1)*p.hy,p.position.z+(c&4?1:-1)*p.hz).applyMatrix4(frameRotation);
    limit(corner.x+right*corner.z,right*11-model.position.x);
    limit(-corner.x-left*corner.z,model.position.x-left*11);
    limit(corner.y+upper*corner.z,upper*11-model.position.y);
    limit(-corner.y-lower*corner.z,model.position.y-lower*11);
   }
   const framing=smooth((y-.14)/.1)*(1-smooth((y-.8)/.14));
   model.scale.setScalar(lerp(size*fit,fitted,framing));
  }
  for(let i=0;i<60;i++){
   const p=poses[i];dummy.position.copy(p.position);dummy.rotation.copy(p.rotation);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();blocks.setMatrixAt(i,dummy.matrix);
   dummy.translateZ(p.sz*.5-.001*p.scale);dummy.scale.set(p.sx*.87,p.sy*.78,.018*p.scale);dummy.updateMatrix();panels.setMatrixAt(i,dummy.matrix);
   if(!light())for(let k=0;k<4;k++){
    dummy.position.copy(p.position);dummy.rotation.copy(p.rotation);dummy.translateX((k%2?1:-1)*p.sx*.365);dummy.translateY((k<2?1:-1)*p.sy*.31);dummy.translateZ(p.sz*.5+.01*p.scale);dummy.scale.setScalar(.009*p.scale);dummy.updateMatrix();bolts.setMatrixAt(i*4+k,dummy.matrix);
   }
   dummy.position.copy(p.position);dummy.rotation.copy(p.rotation);dummy.translateY(p.sy*.13);dummy.translateZ(p.sz*.5+.004*p.scale);
   dummy.scale.set(p.sx*.79,.045*p.scale,.018*p.scale);dummy.updateMatrix();insets.setMatrixAt(i,dummy.matrix);
   dummy.translateZ(.009*p.scale);dummy.scale.set(p.sx*.69,.01*p.scale,.009*p.scale);dummy.updateMatrix();seams.setMatrixAt(i,dummy.matrix);
  }
  blocks.instanceMatrix.needsUpdate=true;seams.instanceMatrix.needsUpdate=true;insets.instanceMatrix.needsUpdate=true;panels.instanceMatrix.needsUpdate=true;bolts.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);
  if(Math.abs(scrollY-renderY)>.1)schedule();
 }
 function schedule(){if(!frame&&!lost)frame=requestAnimationFrame(draw)}
 function resize(){dirty=true;renderY=scrollY;renderer.setPixelRatio(Math.min(devicePixelRatio,light()?1.25:1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!light();bolts.visible=!light();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{if(light()||root.dataset.motion!=='on'||reduced.matches)return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;schedule()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else resize()});
 new MutationObserver(resize).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
 reduced.addEventListener('change',resize);coarse.addEventListener('change',resize);
 new ResizeObserver(()=>{dirty=true;schedule()}).observe(document.querySelector('main'));document.fonts?.ready.then(resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.style.visibility='hidden';root.classList.remove('webgl-ready')});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.style.visibility='';root.classList.add('webgl-ready');resize()});
 resize();
 if(!light())new HDRLoader().load('./assets/studio-small-09-1k.hdr',texture=>{
  const generator=new THREE.PMREMGenerator(renderer),old=scene.environment;
  scene.environment=generator.fromEquirectangular(texture).texture;scene.environmentIntensity=.7;scene.environmentRotation.y=.45;
  old.dispose();texture.dispose();generator.dispose();schedule();
 },undefined,()=>{/* The lightweight studio environment remains usable offline. */});
}
