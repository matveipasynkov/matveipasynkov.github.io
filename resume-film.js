(() => {
 const root=document.documentElement,dialog=document.querySelector('#intro-film'),video=document.querySelector('#resume-film'),trigger=document.querySelector('.film-trigger');
 let language='ru',motion=root.dataset.motion;
 function update(){const next=root.lang==='en'?'en':'ru';
  if(next!==language){const time=video.currentTime,playing=!video.paused;language=next;video.pause();video.poster=`assets/resume-story-${next}.jpg?v=6`;video.querySelector('source').src=`assets/resume-story-${next}.mp4?v=6`;video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(time,video.duration||28);if(playing&&dialog.open&&!document.hidden)video.play().catch(()=>{});},{once:true});video.load();}
  video.setAttribute('aria-label',next==='ru'?'Конструктор коммерческих предложений — видео о кейсе':'Commercial proposal builder — case film');
  document.querySelector('.film-close').setAttribute('aria-label',next==='ru'?'Закрыть видео':'Close video');
  if(motion!==root.dataset.motion&&root.dataset.motion==='off')video.pause();motion=root.dataset.motion;
 }
 trigger.addEventListener('click',()=>{dialog.showModal();video.volume=.45;video.play().catch(()=>{});});
 document.querySelector('.film-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{video.pause();trigger.focus({preventScroll:true});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
 new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['lang','data-motion']});update();
 if(location.hash==='#intro-film')dialog.showModal();
})();
