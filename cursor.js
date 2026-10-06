/* A single pointer follows the page's reading position, including stationary-mouse scrolling. */
(() => {
 const root=document.documentElement,film=document.querySelector('#intro-film'),fine=matchMedia('(pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const chapters=[
  {selector:'.hero',name:'hero',polygon:[[0,0],[25,6],[17,12],[20,26],[13,29],[9,16],[2,22]],fill:.07,stroke:[212,253,85],detail:'M0 0 12 9 9 16'},
  {selector:'#processes',name:'processes',polygon:[[0,0],[24,8],[17,14],[24,22],[18,28],[11,19],[5,25]],fill:.09,stroke:[212,253,85],detail:'M8 11C15 4 24 12 18 18S7 20 11 13'},
  {selector:'#experience',name:'experience',polygon:[[0,0],[23,0],[23,6],[12,6],[28,22],[22,28],[6,12],[6,23],[0,23]],fill:.12,stroke:[227,240,198],detail:'M10 4H18M4 10V18'},
  {selector:'#case-study',name:'case',polygon:[[0,0],[28,10],[17,16],[11,29]],fill:1,stroke:[212,253,85],detail:'M6 6 17 11 11 23'},
  {selector:'#toolkit',name:'data',polygon:[[0,0],[22,0],[22,5],[9,5],[26,22],[21,27],[5,10],[5,23],[0,23]],fill:.26,stroke:[234,245,222],detail:'M26 29H38M32 23V35'},
  {selector:'#about',name:'about',polygon:[[0,0],[9,8],[19,2],[18,12],[29,17],[19,21],[22,31],[12,26],[6,32],[4,21],[-5,17],[3,13]],fill:.04,stroke:[242,242,233],detail:'M7 13 13 19 17 13'},
  {selector:'.signature-reel',name:'signature',polygon:[[0,0],[26,8],[30,23],[15,31],[1,19],[12,11]],fill:.14,stroke:[212,253,85],detail:'M0 0 15 13 30 23M15 13 15 31'},
  {selector:'#contact',name:'contact',polygon:[[0,0],[29,0],[29,29],[22,29],[22,13],[5,30],[-1,24],[16,7],[0,7]],fill:.18,stroke:[212,253,85],detail:'M9 20 20 9'}
 ];
 // Equal perimeter samples give every outline the same topology for continuous morphing.
 function sample(polygon,count=32){
  const lengths=polygon.map((p,i)=>{const q=polygon[(i+1)%polygon.length];return Math.hypot(q[0]-p[0],q[1]-p[1]);}),total=lengths.reduce((a,b)=>a+b,0);
  return Array.from({length:count},(_,i)=>{let d=total*i/count,edge=0;while(d>lengths[edge]&&edge<lengths.length-1)d-=lengths[edge++];const a=polygon[edge],b=polygon[(edge+1)%polygon.length],t=d/lengths[edge];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];});
 }
 chapters.forEach(c=>{c.element=document.querySelector(c.selector);c.points=sample(c.polygon);});
 const cursor=document.createElement('div');cursor.className='site-cursor';cursor.setAttribute('aria-hidden','true');
 cursor.innerHTML=`<svg viewBox="-10 -10 50 50"><path class="cursor-outline"/>${chapters.map(c=>`<path class="cursor-detail" d="${c.detail}"/>`).join('')}</svg><span class="cursor-action"></span>`;
 document.body.append(cursor);const outline=cursor.querySelector('.cursor-outline'),details=[...cursor.querySelectorAll('.cursor-detail')];
 const lerp=(a,b,t)=>a+(b-a)*t,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 let frame=0,last=0,geometryDirty=true,geometry=[],present=false,editing=false,action=false,acidSurface=false,x=0,y=0,tx=0,ty=0;
 let points=chapters[0].points.map(p=>[...p]),fill=chapters[0].fill,stroke=[...chapters[0].stroke],ink=[212,253,85],detailWeights=chapters.map((_,i)=>i===0?1:0);
 const enabled=()=>fine.matches&&!reduced.matches&&root.dataset.motion==='on'&&!document.hidden&&!film?.open;
 function visibility(){const visible=present&&!editing&&enabled();root.classList.toggle('has-site-cursor',visible);cursor.classList.toggle('is-visible',visible);cursor.classList.toggle('is-action',action);return visible;}
 function schedule(){if(!frame&&enabled()&&present)frame=requestAnimationFrame(draw);}
 function measure(){geometry=chapters.filter(c=>c.element&&c.element.offsetHeight>0).map(c=>({...c,top:c.element.getBoundingClientRect().top+scrollY}));geometryDirty=false;}
 function draw(now){
  frame=0;hover(document.elementFromPoint(tx,ty));if(!visibility())return;
  if(geometryDirty)measure();
  const dt=Math.min(50,now-last||16);last=now;const follow=1-Math.exp(-dt/32),morph=1-Math.exp(-dt/80);
  x=lerp(x,tx,follow);y=lerp(y,ty,follow);cursor.style.transform=`translate3d(${x}px,${y}px,0)`;
  const scroll=window.portfolioScroll?.read().y??scrollY,line=scroll+innerHeight*.5,span=Math.min(170,innerHeight*.2);
  let a=geometry[0],b=a,blend=0;
  for(let i=1;i<geometry.length;i++){
   const next=geometry[i];if(line>=next.top+span){a=next;b=next;continue;}
   if(line>next.top-span){b=next;blend=smooth((line-next.top+span)/(span*2));}break;
  }
  if(!a)return;
  let error=0;
  for(let i=0;i<points.length;i++)for(let axis=0;axis<2;axis++){const target=lerp(a.points[i][axis],b.points[i][axis],blend);error+=Math.abs(points[i][axis]-target);points[i][axis]=lerp(points[i][axis],target,morph);}
  outline.setAttribute('d',`M${points.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')}Z`);
  const targetFill=lerp(a.fill,b.fill,blend);error+=Math.abs(fill-targetFill);fill=lerp(fill,targetFill,morph);
  stroke=stroke.map((v,i)=>{const target=acidSurface?[17,18,16][i]:lerp(a.stroke[i],b.stroke[i],blend);error+=Math.abs(v-target)*.01;return lerp(v,target,morph);});
  ink=ink.map((v,i)=>{const target=acidSurface?[17,18,16][i]:[212,253,85][i];error+=Math.abs(v-target)*.01;return lerp(v,target,morph);});
  outline.style.stroke=`rgb(${stroke.map(Math.round).join(',')})`;outline.style.fill=`rgba(${ink.map(Math.round).join(',')},${fill.toFixed(3)})`;
  chapters.forEach((c,i)=>{const target=(c.name===a.name?1-blend:0)+(c.name===b.name?blend:0);detailWeights[i]=lerp(detailWeights[i],target,morph);details[i].style.opacity=detailWeights[i].toFixed(3);details[i].style.stroke=acidSurface||c.name==='case'?'#111210':`rgb(${c.stroke.join(',')})`;});
  cursor.dataset.section=blend>.5?b.name:a.name;cursor.dataset.blend=blend.toFixed(3);
  if(error>.02||Math.abs(x-tx)+Math.abs(y-ty)>.05)schedule();
 }
 function hover(element){
  if(!element)return;
  editing=!!element.closest('input,textarea,[contenteditable="true"],video');action=!!element.closest('a,button,[role="button"]');acidSurface=!!element.closest('.award-feature,.primary,.ribbon');
 }
 document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||!fine.matches)return;
  if(!present){x=e.clientX;y=e.clientY;last=0;}present=true;tx=e.clientX;ty=e.clientY;
  hover(e.target);visibility();schedule();
 },{passive:true});
 function leave(){present=false;visibility();cancelAnimationFrame(frame);frame=0;last=0;}
 document.documentElement.addEventListener('pointerleave',leave);addEventListener('blur',leave);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else schedule();});
 addEventListener('scroll',schedule,{passive:true});document.addEventListener('portfolio-scroll-frame',schedule);
 function invalidate(){geometryDirty=true;if(tx>=innerWidth||ty>=innerHeight)leave();visibility();schedule();}
 addEventListener('resize',invalidate,{passive:true});new ResizeObserver(invalidate).observe(document.querySelector('main'));document.fonts.ready.then(invalidate);
 new MutationObserver(invalidate).observe(root,{attributes:true,attributeFilter:['lang','data-motion','class']});
 if(film)new MutationObserver(invalidate).observe(film,{attributes:true,attributeFilter:['open']});
 fine.addEventListener('change',()=>{leave();invalidate();});reduced.addEventListener('change',()=>{visibility();invalidate();});
})();
