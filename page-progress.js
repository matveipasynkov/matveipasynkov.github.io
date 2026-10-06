(() => {
 const bar=document.querySelector('.page-progress');
 function update(y=scrollY){const distance=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${distance>0?Math.max(0,Math.min(1,y/distance)):0})`;}
 document.addEventListener('portfolio-scroll-frame',e=>update(e.detail.y));
 addEventListener('resize',()=>update(),{passive:true});
 new ResizeObserver(()=>update()).observe(document.querySelector('main'));
 document.fonts?.ready.then(()=>update());update();
})();
