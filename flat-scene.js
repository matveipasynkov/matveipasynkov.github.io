// Three SVG compositions are built once; scrolling only crossfades whole layers.
const root=document.documentElement,ns='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'];
const letters=[];glyph.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')letters.push([36+x*26,78+y*26])}));
function make(parent,kind){
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 360 310');svg.classList.add('flat-circuit');svg.setAttribute('aria-hidden','true');
 const layers=[0,1,2].map(state=>{
  const group=document.createElementNS(ns,'g');group.classList.add('flat-frame');group.style.opacity=state===(kind==='signature'?2:1)?1:0;
  letters.forEach((p,i)=>{const cell=document.createElementNS(ns,'g'),r=document.createElementNS(ns,'rect'),bar=document.createElementNS(ns,'path');const pos=state===0?[30+(i*73%290),40+(i*47%215)]:state===1?[49+(i%7)*40,55+Math.floor(i/7)*36]:p;
   cell.setAttribute('transform',`translate(${pos[0]} ${pos[1]})`);r.setAttribute('width','20');r.setAttribute('height','20');r.setAttribute('rx','3');bar.setAttribute('d','M4 6H16');cell.append(r,bar);group.append(cell);
  });svg.append(group);return group;
 });parent.append(svg);return{layers,parent};
}
make(document.querySelector('.process-diagram'),'hero');
const scene=make(document.querySelector('.film-stage'),'film');
make(document.querySelector('.signature-stage'),'signature');
let frame=0,dirty=true,active=false,start=0,travel=1,last=-1;
function draw(){
 frame=0;if(document.hidden||!active||root.dataset.motion!=='on'||reduced.matches)return;
 if(dirty){const reel=scene.parent.parentElement;start=reel.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(scene.parent).top)||72);travel=Math.max(1,reel.offsetHeight-scene.parent.offsetHeight);dirty=false;}
 const p=clamp((scrollY-start)/travel);if(p===last)return;last=p;
 const a=smooth((p-.2)/.25),b=smooth((p-.65)/.25);
 [1-a,a*(1-b),b].forEach((opacity,i)=>{scene.layers[i].style.opacity=opacity;});
}
function schedule(){if(active&&!frame)frame=requestAnimationFrame(draw)}
function measure(){dirty=true;last=-1;schedule()}
new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)measure();},{rootMargin:'100px'}).observe(scene.parent.parentElement);
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
new ResizeObserver(measure).observe(document.querySelector('main'));
new MutationObserver(measure).observe(root,{attributes:true,attributeFilter:['lang','data-motion']});
reduced.addEventListener('change',measure);document.addEventListener('visibilitychange',measure);document.fonts.ready.then(measure);
