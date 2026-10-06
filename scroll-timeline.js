/* One clock for type, light and 3D; native scrolling remains untouched. */
(() => {
 const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let y=scrollY,frame=0,lastTime=0;
 const state={y,time:0,velocity:0};
 window.portfolioScroll={read:()=>state,sync:()=>{y=scrollY;state.y=y;state.velocity=0;lastTime=0;schedule();}};
 function draw(time){
  frame=0;
  if(document.hidden)return;
  const dt=Math.min(50,time-lastTime||16);lastTime=time;
  const previous=y;
  if(root.dataset.motion==='off'||reduced.matches)y=scrollY;
  else y+=(scrollY-y)*(1-Math.exp(-dt/85));
  if(Math.abs(scrollY-y)<.1)y=scrollY;
  Object.assign(state,{y,time,velocity:(y-previous)/dt});
  document.dispatchEvent(new CustomEvent('portfolio-scroll-frame',{detail:state}));
  if(Math.abs(scrollY-y)>.1)schedule();
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>{lastTime=0;schedule();});
 new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
 reduced.addEventListener('change',schedule);schedule();
})();
