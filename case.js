/* Anonymous case: a reversible before / solution / after sequence. */
(() => {
 const root=document.documentElement, reel=document.querySelector('.case-reel'), screen=reel.querySelector('.case-screen');
 const shots=[...reel.querySelectorAll('.case-shot')], nodes=[...reel.querySelectorAll('.case-flow-node')];
 const track=reel.querySelector('.case-track i'), counter=reel.querySelector('.case-position'), scan=reel.querySelector('.case-scan');
 let frame=0, dirty=true, active=true, start=0, travel=1, previous=-1;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 function draw(){
  frame=0;
  if(document.hidden||!active||root.dataset.motion!=='on'||reduced.matches)return;
  if(dirty){start=reel.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(screen).top)||0);travel=Math.max(1,reel.offsetHeight-screen.offsetHeight);dirty=false;previous=-1}
  const p=clamp((scrollY-start)/travel);if(p===previous)return;previous=p;
  const a=smooth((p-.22)/.14),b=smooth((p-.62)/.14),opacity=[1-a,a*(1-b),b];
  shots.forEach((el,i)=>{
   const enter=i===0?1:i===1?a:b,leave=i===0?a:i===1?b:0;
   el.style.opacity=opacity[i];el.style.visibility=opacity[i]<.002?'hidden':'visible';
   el.style.transform=`translate3d(${leave*-7}%,${(1-enter)*45}px,0) scale(${1+(1-enter)*.08-leave*.12})`;
  });
  nodes.forEach((el,i)=>{const q=smooth((p-.34-i*.055)/.09);el.style.opacity=.2+.8*q;el.style.transform=`translateY(${(1-q)*18}px)`});
  track.style.transform=`scaleX(${p})`;
  scan.style.transform=`translateX(${p*110-5}%)`;
  const label=p<.29?'01 / 03':p<.69?'02 / 03':'03 / 03';if(counter.textContent!==label)counter.textContent=label;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
 function measure(){dirty=true;schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
 document.addEventListener('visibilitychange',measure);reduced.addEventListener('change',measure);
 new MutationObserver(measure).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)measure()},{rootMargin:'150px'}).observe(reel);
 if('ResizeObserver'in window){const ro=new ResizeObserver(measure);ro.observe(document.querySelector('main'));ro.observe(screen)}
 if(document.fonts)document.fonts.ready.then(measure);
 root.classList.add('case-ready');schedule();
})();
