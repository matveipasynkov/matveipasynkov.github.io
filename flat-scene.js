// A small SVG circuit: discrete data becomes an ordered system, then a signature.
const root=document.documentElement,ns='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const glyph=['110110111100','101010100100','101010111100','101010100000','101010100011','000000100011'];
const letters=[];glyph.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')letters.push([36+x*26,78+y*26])}));
function make(parent,kind){
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 360 310');svg.classList.add('flat-circuit');svg.setAttribute('aria-hidden','true');
 const lines=document.createElementNS(ns,'path');lines.setAttribute('d','M24 65H110V120H240V190H336 M24 245H85V190H190V65H336 M50 30V280 M310 30V280');lines.setAttribute('class','flat-traces');svg.append(lines);
 const cells=letters.map((p,i)=>{const g=document.createElementNS(ns,'g'),r=document.createElementNS(ns,'rect'),bar=document.createElementNS(ns,'path');r.setAttribute('width','20');r.setAttribute('height','20');r.setAttribute('rx','3');bar.setAttribute('d','M4 6H16');g.append(r,bar);svg.append(g);return g;});
 parent.append(svg);return{svg,cells,lines,kind,parent,start:0,travel:1};
}
const scenes=[make(document.querySelector('.process-diagram'),'hero'),make(document.querySelector('.film-stage'),'film'),make(document.querySelector('.signature-stage'),'signature')];
let frame=0,dirty=true;
function draw(){
 frame=0;if(document.hidden)return;
 const on=root.dataset.motion==='on'&&!reduced.matches;
 if(dirty){for(const s of scenes){const reel=s.kind==='film'?s.parent.parentElement:s.kind==='signature'?s.parent.parentElement:s.parent; s.start=reel.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(s.parent).top)||72);s.travel=Math.max(1,reel.offsetHeight-s.parent.offsetHeight);}dirty=false;}
 for(const s of scenes){
  const rect=s.parent.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;
  const p=on?clamp((scrollY-s.start)/s.travel):1;
  const assemble=s.kind==='hero'?.15:s.kind==='signature'?smooth((p-.1)/.65):smooth((p-.55)/.4);
  s.cells.forEach((cell,i)=>{
   const scattered=[30+(i*73%290),40+(i*47%215)],ordered=[49+(i%7)*40,55+Math.floor(i/7)*36];
   const t=s.kind==='hero'?.4:smooth(p/.5);
   const base=[mix(scattered[0],ordered[0],t),mix(scattered[1],ordered[1],t)];
   const x=mix(base[0],letters[i][0],assemble),y=mix(base[1],letters[i][1],assemble);
   cell.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  });
  s.lines.style.opacity=String((1-assemble)*.55);
 }
}
function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
function measure(){dirty=true;schedule()}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
new ResizeObserver(measure).observe(document.querySelector('main'));
new MutationObserver(measure).observe(root,{attributes:true,attributeFilter:['lang','data-motion']});
reduced.addEventListener('change',measure);document.addEventListener('visibilitychange',measure);document.fonts.ready.then(measure);measure();
