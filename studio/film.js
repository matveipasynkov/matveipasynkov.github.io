import * as T from '../vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';

await document.fonts.ready;
await Promise.all([document.fonts.load('800 170px Manrope'),document.fonts.load('600 48px Manrope'),document.fonts.load('400 45px Manrope')]);
const W=1920,H=1080,D=26,ACID=0xd4fd55,INK=0xf2f2e9;
const status=document.querySelector('#status'),slider=document.querySelector('#time');
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
renderer.setClearColor(0x111210); document.querySelector('#stage').append(renderer.domElement);
const scene=new T.Scene();scene.fog=new T.Fog(0x111210,26,65);
const camera=new T.PerspectiveCamera(39,W/H,.1,160);
const target=new T.WebGLRenderTarget(W,H,{depthBuffer:true});
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const post=new T.ShaderMaterial({toneMapped:false,uniforms:{image:{value:target.texture},motion:{value:0}},vertexShader:`varying vec2 uvOut;void main(){uvOut=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
uniform sampler2D image;uniform float motion;varying vec2 uvOut;
void main(){
 vec2 uv=uvOut;vec3 c=texture2D(image,uv).rgb;
 vec3 blur=vec3(0.);vec3 bloom=vec3(0.);
 for(int i=0;i<12;i++){
  float a=float(i)*.523598;vec2 r=vec2(cos(a)/1.777,sin(a));
  bloom+=max(texture2D(image,uv+r*.008).rgb-vec3(.68),vec3(0.));
  bloom+=max(texture2D(image,uv+r*.022).rgb-vec3(.75),vec3(0.))*.35;
  blur+=texture2D(image,uv+vec2((float(i)/11.-.5)*motion*.027,0.)).rgb;
 }
 c=mix(c,blur/12.,motion*.62)+bloom*.025;
 gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
}`});
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),post));
const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.04).texture;scene.environmentIntensity=.8;room.dispose();pm.dispose();
scene.add(new T.HemisphereLight(0xf2f2e9,0x111210,1));
const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(-5,8,12);scene.add(key);
const rim=new T.DirectionalLight(ACID,3);rim.position.set(5,2,-5);scene.add(rim);
const cool=new T.DirectionalLight(0xb9c7da,1.3);cool.position.set(-8,-2,6);scene.add(cool);
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},lerp=(a,b,p)=>a+(b-a)*p;
const clamp=x=>Math.max(0,Math.min(1,x));
let language='ru',texts=[],groups=[],time=0,playing=false,start=0,recording=false;
const copy={ru:[
 ['МАТВЕЙ ПАСЫНКОВ',['ПРОЦЕССЫ.','ДАННЫЕ.','РЕЗУЛЬТАТ.'],'БИЗНЕС × ИНЖЕНЕРИЯ'],
 ['01 / АНАЛИЗ',['ПОНЯТЬ','СИСТЕМУ.'],'Процессы. Связи. Точки роста.'],
 ['02 / ГИПОТЕЗА',['ПРОВЕРИТЬ','ИДЕЮ.'],'Гипотеза → прототип → проверка'],
 ['03 / ИНСТРУМЕНТ',['СОБРАТЬ','РЕШЕНИЕ.'],'Конструктор коммерческих предложений'],
 ['КЕЙС / АВТОМАТИЗАЦИЯ',['≈ 60','≤ 10'],'Подготовка предложения: ≈ час → до 10 минут'],
 ['МАТВЕЙ ПАСЫНКОВ',['БИЗНЕС ×','ИНЖЕНЕРИЯ.'],'Меньше рутины. Больше времени на клиента.']],en:[
 ['MATVEY PASYNKOV',['PROCESSES.','DATA.','IMPACT.'],'BUSINESS × ENGINEERING'],
 ['01 / ANALYSIS',['UNDERSTAND','THE SYSTEM.'],'Processes. Connections. Opportunities.'],
 ['02 / HYPOTHESIS',['TEST','THE IDEA.'],'Hypothesis → prototype → validation'],
 ['03 / TOOL',['BUILD','A SOLUTION.'],'Sales proposal builder'],
 ['CASE / AUTOMATION',['≈ 60','≤ 10'],'Proposal preparation: ≈ hour → up to 10 minutes'],
 ['MATVEY PASYNKOV',['BUSINESS ×','ENGINEERING.'],'Less routine. More time for the client.']]};
function label(text,width,color=INK,weight=800,outline=false){
 const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=2048;c.height=320;
 const numeric=/^[≈≤\s\d]+$/.test(text),size=numeric?650:weight===800?170:96;
 if(numeric)c.height=800;
 ctx.font=`${weight} ${size}px Manrope,Arial`;const max=ctx.measureText(text).width;
 c.width=Math.min(2048,Math.ceil(max)+64);
 ctx.font=`${weight} ${size}px Manrope,Arial`;ctx.textBaseline='middle';ctx.fillStyle='#'+new T.Color(color).getHexString();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;
 const sx=Math.min(1,(c.width-64)/max);ctx.scale(sx,1);
 if(outline)ctx.strokeText(text,32,c.height/2);else{ctx.strokeStyle='rgba(17,18,16,.72)';ctx.lineWidth=10;ctx.strokeText(text,32,c.height/2);ctx.fillText(text,32,c.height/2);}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const mesh=new T.Mesh(new T.PlaneGeometry(width,width*c.height/c.width),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,side:T.DoubleSide}));mesh.renderOrder=10;
 const reveal={value:1};mesh.userData.reveal=reveal;
 mesh.material.onBeforeCompile=shader=>{shader.uniforms.uReveal=reveal;shader.fragmentShader='uniform float uReveal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.x>uReveal)discard;\nfloat edge=exp(-abs(vMapUv.x-uReveal)*180.);diffuseColor.rgb+=vec3(.15,.24,.015)*edge;');};
 mesh.userData.texture=tex;return mesh;
}
function line(points,color=ACID,opacity=.4){return new T.Line(new T.BufferGeometry().setFromPoints(points.map(v=>new T.Vector3(...v))),new T.LineBasicMaterial({color,transparent:true,opacity}));}
function buildTexts(){
 for(const g of groups){g.traverse(o=>{o.geometry?.dispose();o.userData.texture?.dispose();o.material?.dispose();});scene.remove(g);}groups=[];texts=[];
 for(let s=0;s<6;s++){
  const g=new T.Group();g.position.x=s*22;scene.add(g);groups.push(g);
  const [kicker,words,sub]=copy[language][s];
  const head=label(kicker,4.2,ACID,600);head.position.set(-4.7,3.3,0);g.add(head);
  words.forEach((word,k)=>{
   const m=label(word,s===4?7:s===2?(k===0?(language==='en'?9.5:12.5):8):s===3?8.0:s===5?9:8.8,k===words.length-1?ACID:INK,800,s===0&&k===1);
   m.position.set(s===4?-2.8:s===2?0:s===3?2.8:-2.4,s===2?(k===0?1.75:-1.0):2.0-k*1.65,s===2?.6:0);m.userData.base=m.position.clone();m.userData.stage=s;m.userData.index=k;m.userData.baseScale=m.scale.clone();g.add(m);texts.push(m);
  });
  const foot=label(sub,s===0?5.6:11,0xa0a497,400);foot.position.set(s===0?-3.7:0,-3.25,0);g.add(foot);
  if(s===4){const unit=label(language==='ru'?'МИНУТ НА ПРЕДЛОЖЕНИЕ':'MINUTES PER PROPOSAL',6,ACID,600);unit.position.set(-2.8,-1.5,0);g.add(unit);}
  const grid=new T.GridHelper(28,42,0x485334,0x282e20);grid.position.set(0,-3.6,-3);grid.material.transparent=true;grid.material.opacity=.3;g.add(grid);
  g.add(line([[-8,-3.1,0],[8,-3.1,0]],0x566046,.45));
  const mono=label('mp.',.75,INK);mono.position.set(-7.2,4.15,0);g.add(mono);
 }
}
buildTexts();
const model=new T.Group();scene.add(model);
const geo=new RoundedBoxGeometry(.54,.43,.68,3,.035);
const metal=new T.MeshPhysicalMaterial({color:0x34372e,metalness:.88,roughness:.3,clearcoat:.5,clearcoatRoughness:.2});
const inset=new T.MeshStandardMaterial({color:0x151b10,metalness:.75,roughness:.4});
const seamMat=new T.MeshBasicMaterial({color:ACID,toneMapped:false});
const modules=[];
for(let i=0;i<60;i++){
 const block=new T.Group();const shell=new T.Mesh(geo,metal);block.add(shell);
 const panel=new T.Mesh(new RoundedBoxGeometry(.455,.325,.018,2,.012),inset);panel.position.z=.343;block.add(panel);
 const seam=new T.Mesh(new T.BoxGeometry(.36,.009,.012),seamMat);seam.position.set(0,.06,.356);block.add(seam);
 block.userData.base=new T.Vector3((i%4-1.5)*.59,(Math.floor(i/4)%5-2)*.49,(Math.floor(i/20)-1)*.74);
 model.add(block);modules.push(block);
}
const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'];const signature=[];
glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')signature.push(new T.Vector3((x-5.5)*.39,(2.5-y)*.39,0));}));
const rings=[];
for(let i=0;i<3;i++){
 const pts=[];for(let k=0;k<=128;k++){let a=k/128*Math.PI*2;pts.push([Math.cos(a)*(2.4+i*.5),Math.sin(a)*(2.4+i*.5),0]);}
 const r=line(pts,ACID,i===0?.35:.14);model.add(r);rings.push(r);
}
const panels=[];
for(let i=0;i<3;i++){
 const g=new T.Group();scene.add(g);panels.push(g);g.add(line([[-1.4,-.55,0],[1.4,-.55,0],[1.4,.55,0],[-1.4,.55,0],[-1.4,-.55,0]],ACID,.6));
 const text=label(['CLIENT DATA','RULES','PROPOSAL'][i],2.65,INK,600);text.position.z=.02;g.add(text);
}
// Camera paths are part of the same scene: rapid traversals connect every chapter.
const cameras=[
 [0,5.4,.35,4.0,4.3,0,0,.04],
 [0.85,.7,.3,14.8,0,0,0,0],
 [2.0,-.4,.2,13.4,0,0,0,-.035],
 [3.05,.4,.25,14.5,0,0,0,.015],
 [3.65,4.7,.6,3.4,4.4,0,0,-.35],
 [4.2,26.5,.6,4.2,26.4,0,0,.4],
 [4.8,22.8,1.2,15.6,22,0,0,.025],
 [6.0,21.7,.1,13.5,22,0,0,-.025],
 [7.25,22.7,.5,14.9,22,0,0,.025],
 [7.75,26.3,-.3,3.9,26.4,0,0,-.5],
 [8.3,44.6,-.4,14.8,44,0,0,-.035],
 [9.5,43.4,.3,13.6,44,0,0,.018],
 [10.7,44.8,-.15,14.8,44,0,0,-.015],
 [11.6,44,.1,7.5,44,-.8,0,.15],
 [12.2,66+1,.6,14.2,66,0,0,.035],
 [13.4,65.4,-.1,13.5,66,0,0,-.02],
 [14.8,66+.6,.6,15.0,66,0,0,.02],
 [15.55,63.2,.6,4.0,63,0,0,-.45],
 [16.25,88-.6,.4,13.7,88,0,0,.025],
 [17.2,88+.5,-.1,13.2,88,0,0,-.015],
 [18.8,87.7,.5,14.2,88,0,0,.018],
 [20.3,88+.5,.1,13.3,88,0,0,-.01],
 [20.85,92.5,.1,3.8,92.4,0,0,.45],
 [21.4,110+.7,.4,14.2,110,0,0,-.025],
 [22.6,109.5,.1,13.3,110,0,0,.02],
 [24.0,110+.5,.4,14.6,110,0,0,-.015],
 [25.0,110,0,14.0,110,0,0,0],
 [26,110,0,14.0,110,0,0,0]];
const look=new T.Vector3();
function pose(t){
 let a=cameras[0],b=cameras[1];for(let i=1;i<cameras.length;i++){b=cameras[i];if(t<=b[0])break;a=b;}
 const cp=clamp((t-a[0])/Math.max(.001,b[0]-a[0]));const p=smooth(cp);const v=k=>lerp(a[k],b[k],p);
 post.uniforms.motion.value=Math.min(1,Math.max(Math.abs(b[4]-a[4])/15,Math.abs(b[3]-a[3])/12))*Math.sin(cp*Math.PI);
 camera.position.set(v(1),v(2),v(3));look.set(v(4),v(5),v(6));camera.lookAt(look);camera.rotateZ(v(7));
 const worldX=v(4);key.position.x=worldX-5;rim.position.x=worldX+5;cool.position.x=worldX-8;
 const stage=Math.min(5,Math.floor((t+.15)/4.2));
 // Object follows the camera's chapter while changing its topology.
 const central=smooth((t-8.1)/.55)*(1-smooth((t-11.7)/.45));
 const opposite=smooth((t-12)/.6)*(1-smooth((t-16)/.45));
 model.position.set(worldX+4.4-central*3.8-opposite*7.4,.1,-central*2.7);
 const explode=smooth((t-3.4)/1.1)*(1-smooth((t-8.1)/1.25));
 const flat=smooth((t-11.8)/1.15)*(1-smooth((t-21)/1.15));
 const mono=smooth((t-21)/1.6);
 model.rotation.set(lerp(.22+Math.sin(t*.3)*.08,0,mono),lerp(-.8+Math.sin(t*.42)*.12,0,mono),lerp(Math.sin(t*.27)*.03,0,mono));
 model.scale.setScalar(lerp(1.45,1.25,mono));
 modules.forEach((m,i)=>{
  const b=m.userData.base;
  m.position.copy(b).multiply(new T.Vector3(1+explode*1.8,1+explode*1.4,1+explode*1.7));
  const panelPos=new T.Vector3((i%10-4.5)*.46,(Math.floor(i/10)-2.5)*.46,0);
  m.position.lerp(panelPos,flat);
  const target=signature[i]||new T.Vector3(0,0,-6);m.position.lerp(target,mono);
  m.rotation.set(explode*.15*Math.sin(i),explode*.22*Math.cos(i),explode*.1*Math.sin(i*.8));
  m.scale.set(lerp(1,.68,mono),lerp(1,.82,mono),lerp(1,.7,flat));
  if(i>=signature.length)m.scale.multiplyScalar(1-mono);
 });
 rings.forEach((r,i)=>{r.visible=explode>.01;r.rotation.set(.15*explode,i*.6+Math.sin(t*.25)*.1,t*.1*(i%2?-1:1));r.material.opacity=explode*(i===0?.35:.14);});
 texts.forEach(m=>{
  const s=m.userData.stage,k=m.userData.index,local=t-(s===4?16.25:s*4.2);
  let arrival=smooth((local+.1-k*.12)/.55);
  m.position.copy(m.userData.base);m.position.y+=(1-arrival)*.9;
  m.position.z=m.userData.base.z+(1-arrival)*(s===0?1.3:2.2);
  m.rotation.y=(1-arrival)*-.2;m.rotation.z=(1-arrival)*.06;
  m.material.opacity=arrival;
  m.userData.reveal.value=smooth((local+.15-k*.16)/.7);
  if(s===0){const arrange=smooth((local-2.2)/.65);m.position.x+=arrange*[1.1,-.35,.55][k];m.position.y-=arrange*k*.12;}
  // The last word grows into the lens before the camera traverses to the next scene.
  const punch=smooth((local-3.4)/.45)*(1-smooth((local-4.0)/.35));
  if(s<4&&k===copy[language][s][1].length-1){
   m.position.z+=punch*2.7;m.rotation.z-=punch*.035;m.scale.setScalar(1+punch*.23);
  }else if(s!==4)m.scale.setScalar(1);
  if(s===4){
   const switcher=smooth((t-17.85)/.5);
   m.position.set(-2.0,k===0?1.2+switcher*2.4:1.2-(1-switcher)*2.4,0);
   m.material.opacity=k===0?1-switcher:switcher;
   m.scale.setScalar(k===0?1:smooth((t-17.7)/.7)*.3+.7);
  }
 });
 panels.forEach((g,i)=>{
  const p=smooth((t-12.3-i*.22)/.55)*(1-smooth((t-16)/.3));
  g.visible=p>.01;g.position.set(66-5.0+i*3.25,-1.5-(1-p)*.7,.5);g.scale.setScalar(.8+p*.2);
 });
 renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
}
function draw(now){
 if(playing){time=Math.min(D,(now-start)/1000);slider.value=time;if(time>=D&&!recording)playing=false;}
 pose(time);requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
slider.addEventListener('input',()=>{playing=false;time=Number(slider.value);status.textContent=`Кадр: ${time.toFixed(1)} сек.`;});
document.querySelector('#play').onclick=()=>{if(playing){playing=false;return;}if(time>=D)time=0;start=performance.now()-time*1000;playing=true;};
document.querySelector('#lang').onchange=e=>{language=e.target.value;buildTexts();};
document.querySelector('#record').onclick=async()=>{
 if(recording)return;recording=true;time=0;pose(0);
 const formats=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/mp4'];const mimeType=formats.find(f=>MediaRecorder.isTypeSupported(f));
 if(!mimeType){status.textContent='Этот браузер не поддерживает запись canvas';recording=false;return;}
 const stream=renderer.domElement.captureStream(30);const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:16_000_000});const chunks=[];
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=async()=>{
  playing=false;recording=false;stream.getTracks().forEach(t=>t.stop());
  status.textContent='Сохраняю запись…';const response=await fetch(`/studio/render-${language}`,{method:'POST',body:new Blob(chunks,{type:mimeType})});
  status.textContent=response.ok?`ГОТОВО / ${language.toUpperCase()} / ${mimeType}`:'Не удалось сохранить запись';
 };
 recorder.start();start=performance.now();playing=true;status.textContent=`ЗАПИСЬ / ${language.toUpperCase()} / ${mimeType}`;
 setTimeout(()=>recorder.stop(),D*1000+150);
};
status.textContent='ГОТОВО / WebGL / 1920×1080';
