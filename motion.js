/* Motion is progressive enhancement: content remains readable without it. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;
  let frame = 0;
  const pending = new Map();
  const surfaces = [...document.querySelectorAll('.process-diagram, .award-feature, .primary, .contact-title')];
  const hero = document.querySelector('.hero');
  const flowing=[...document.querySelectorAll('.section-heading h2,.case-heading h2,.toolkit-heading h2,.about-left h2,.contact-title')];
  flowing.forEach(el=>el.classList.add('flow-title'));
  let flowGeometry=[],geometryDirty=true;
  try { paused = localStorage.getItem('mp-motion') === 'paused'; } catch (_) {}
  const enabled = () => !paused && !reduced.matches;
  function label() {
    const ru = root.lang === 'ru';
    const off = !enabled();
    const text = reduced.matches
      ? (ru ? 'Анимации отключены настройкой устройства' : 'Animations disabled by device preference')
      : off ? (ru ? 'Включить анимации' : 'Play animations') : (ru ? 'Приостановить анимации' : 'Pause animations');
    toggle.setAttribute('aria-label', text);
    toggle.setAttribute('title', text);
    toggle.setAttribute('aria-pressed', String(off));
    toggle.disabled = reduced.matches;
    toggle.firstElementChild.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' + (off ? '<path d="m8 5 11 7-11 7Z"/>' : '<path d="M8 5v14M16 5v14"/>') + '</svg>';
  }
  function reset(el) {
    ['--rx','--ry','--mx','--my','--shine-x','--shine-y'].forEach(key => el.style.removeProperty(key));
    el.classList.remove('pointer-active');
  }
  function apply() {
    root.dataset.motion = enabled() ? 'on' : 'off';
    if (!enabled()) {
      pending.clear(); surfaces.forEach(reset);
      hero.style.removeProperty('--hero-shift');
      flowing.forEach(el=>el.style.removeProperty('--flow-y'));
      root.style.removeProperty('--ambient-shift');
    }
    label(); schedule();
  }
  function render() {
    frame = 0;
    if (!enabled() || document.hidden || root.classList.contains('flat-ready')) { pending.clear(); return; }
    const y=window.portfolioScroll?.read().y??scrollY;
    hero.style.setProperty('--hero-shift', `${Math.min(y, 650) * 0.035}px`);
    if(geometryDirty){
      flowGeometry=flowing.map(el=>{let top=0,node=el;while(node){top+=node.offsetTop;node=node.offsetParent;}return {el,top,height:el.offsetHeight};});
      geometryDirty=false;
    }
    flowGeometry.forEach(({el,top,height})=>{
      const center=top+height*.5-y;
      if(center>-150&&center<innerHeight+150)el.style.setProperty('--flow-y',`${Math.max(-12,Math.min(12,(center-innerHeight*.5)*.028)).toFixed(2)}px`);
    });
    root.style.setProperty('--ambient-shift',`${(Math.sin(y/2400)*32).toFixed(2)}px`);
    // Read geometry together before updating any surface styles.
    const positions = [...pending].map(([el, point]) => ({el, point, rect: el.getBoundingClientRect()}));
    pending.clear();
    positions.forEach(({el,point,rect}) => {
      const x = Math.max(0, Math.min(1, (point.x - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (point.y - rect.top) / rect.height));
      el.style.setProperty('--rx', `${(0.5-y)*8}deg`);
      el.style.setProperty('--ry', `${(x-0.5)*10}deg`);
      el.style.setProperty('--mx', `${(x-0.5)*9}px`);
      el.style.setProperty('--my', `${(y-0.5)*7}px`);
      el.style.setProperty('--shine-x', `${x*100}%`);
      el.style.setProperty('--shine-y', `${y*100}%`);
    });
  }
  function schedule() { if (!enabled() || root.classList.contains('flat-ready')) return; if (!frame) frame = requestAnimationFrame(render); }
  surfaces.forEach(el => {
    el.addEventListener('pointermove', event => {
      if (!enabled() || !pointer.matches || event.pointerType === 'touch') return;
      el.classList.add('pointer-active');
      pending.set(el, {x:event.clientX,y:event.clientY}); schedule();
    }, {passive:true});
    el.addEventListener('pointerleave', () => { pending.delete(el); reset(el); });
    el.addEventListener('pointercancel', () => { pending.delete(el); reset(el); });
  });
  window.addEventListener('scroll', schedule, {passive:true});
  document.addEventListener('portfolio-scroll-frame',schedule);
  window.addEventListener('resize',()=>{geometryDirty=true;schedule();}, {passive:true});
  document.fonts?.ready.then(()=>{geometryDirty=true;schedule();});
  new ResizeObserver(()=>{geometryDirty=true;schedule();if(readingAnchor)requestAnimationFrame(restoreReadingPosition);}).observe(document.querySelector('main'));
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) { cancelAnimationFrame(frame); frame=0; pending.clear(); }
    else schedule();
  });
  let readingAnchor=null;
  window.addEventListener('hashchange',()=>{readingAnchor=null;});
  function restoreReadingPosition(){
    if(!readingAnchor)return;
    const {element,offset}=readingAnchor;
    const destination=Math.max(0,element.getBoundingClientRect().top+scrollY+Math.min(offset,Math.max(0,element.offsetHeight-1)));window.scrollTo({top:destination,behavior:'instant'});
    window.portfolioScroll?.sync();
  }
  document.addEventListener('portfolio-scene-ready',restoreReadingPosition);
  window.addEventListener('wheel',()=>{readingAnchor=null;},{passive:true});
  window.addEventListener('touchstart',()=>{readingAnchor=null;},{passive:true});
  toggle.addEventListener('click', () => {
    const line=document.querySelector('.header').offsetHeight;
    const sections=[...document.querySelectorAll('main>section')];
    let element=sections.find(el=>{const r=el.getBoundingClientRect();return r.height>0&&r.bottom>line+24;})||sections[0];
    const inline=[...document.querySelectorAll('.inline-world')].find(el=>{const r=el.getBoundingClientRect();return r.top<=line+100&&r.bottom>line+24;});
    if(inline)element=inline;
    let offset=scrollY-(element.getBoundingClientRect().top+scrollY);
    if(element.matches('.scroll-film:not(.inline-world)')){element=document.querySelector('#experience');offset=-line;}
    if(element.matches('.signature-reel')){element=document.querySelector('#contact');offset=-line;}
    readingAnchor={element,offset};
    const currentAnchor=readingAnchor;
    setTimeout(()=>{if(readingAnchor===currentAnchor)readingAnchor=null;},1500);
    paused = !paused;
    try { localStorage.setItem('mp-motion', paused ? 'paused' : 'playing'); } catch (_) {}
    apply();
    requestAnimationFrame(restoreReadingPosition);
  });
  reduced.addEventListener('change', apply);
  pointer.addEventListener('change', () => { pending.clear(); surfaces.forEach(reset); });
  new MutationObserver(()=>{label();geometryDirty=true;schedule();}).observe(root, {attributes:true,attributeFilter:['lang']});
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          reveal.unobserve(entry.target);
        }
      });
    }, {threshold:0.08});
    document.querySelectorAll('.section-heading,.case-heading,.toolkit-heading,.contact-top').forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
    root.classList.add('js-motion');
    const activity = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-offscreen', !entry.isIntersecting));
    }, {rootMargin:'80px'});
    document.querySelectorAll('.hero, .ribbon, .award-feature').forEach(el => activity.observe(el));
  }
  apply();
})();
