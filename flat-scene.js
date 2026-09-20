// Mobile scenes use finite compositor animations. No scroll listener or RAF loop.
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'];
const scenes=[];
function make(parent,kind){
 const scene=document.createElement('div');scene.className='mobile-assembly';scene.dataset.scene=kind;scene.setAttribute('aria-hidden','true');
 let index=0;
 glyph.forEach((row,y)=>[...row].forEach((v,x)=>{
  if(v!=='1')return;
  const tile=document.createElement('i');tile.className='mobile-module';
  tile.style.left=`${(36+x*26)/360*100}%`;tile.style.top=`${(52+y*26)/260*100}%`;
  // Starts are visibly separate; only transform and opacity change during assembly.
  const direction=index%2?1:-1;
  tile.style.setProperty('--from-x',`${direction*(40+(index%5)*16)}px`);
  tile.style.setProperty('--from-y',`${(y-2.5)*27}px`);
  tile.style.setProperty('--from-turn',`${direction*(8+index%4*5)}deg`);
  tile.style.setProperty('--delay',`${(x+y)*22}ms`);
  scene.append(tile);index++;
 }));parent.append(scene);scenes.push(scene);return scene;
}
make(document.querySelector('.process-diagram'),'intro');
make(document.querySelector('.signature-stage'),'signature');
const hint=document.querySelector('.signature-hint');hint.dataset.ru='МОДУЛИ → ПОДПИСЬ';hint.dataset.en='MODULES → SIGNATURE';hint.textContent=hint.dataset[root.lang==='ru'?'ru':'en'];
const visible=new Set();
function play(scene){
 if(root.dataset.motion!=='on'||reduced.matches||document.hidden)return;
 scene.classList.add('is-playing');
}
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(entry.isIntersecting){visible.add(entry.target);play(entry.target);}
  else{visible.delete(entry.target);entry.target.classList.remove('is-playing');}
 }
},{threshold:.35});
scenes.forEach(scene=>observer.observe(scene));
new MutationObserver(()=>{
 for(const scene of scenes)if(root.dataset.motion!=='on')scene.classList.remove('is-playing');
 for(const scene of visible)play(scene);
}).observe(root,{attributes:true,attributeFilter:['data-motion']});
reduced.addEventListener('change',()=>{for(const scene of visible)play(scene);});
