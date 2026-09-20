/* A reversible scroll timeline; layout is measured only when geometry changes. */
(() => {
  const root = document.documentElement;
  const film = document.querySelector('.scroll-film');
  const stage = film.querySelector('.film-stage');
  const shots = [...film.querySelectorAll('.film-shot')];
  const meter = film.querySelector('.film-meter i');
  const percent = film.querySelector('.film-percent');
  const rings = [...film.querySelectorAll('.film-ring')];
  const points = film.querySelector('.film-points');
  const grid = film.querySelector('.film-grid');
  const system = film.querySelector('.film-system');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 780px)');
  let frame = 0, active = true, dirty = true, start = 0, travel = 1, last = -1, renderY = scrollY, lastTime = 0;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n*n*(3-2*n); };
  function draw(time=0) {
    frame = 0;
    if (document.hidden || !active || root.dataset.motion !== 'on' || reduced.matches) return;
    if (dirty) {
      start = film.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
      travel = Math.max(1, film.offsetHeight - stage.offsetHeight);
      dirty = false; last = -1;
    }
    const dt=Math.min(50,time-lastTime||16);lastTime=time;
    renderY+=(scrollY-renderY)*(1-Math.exp(-dt/75));
    if(Math.abs(scrollY-renderY)<.1)renderY=scrollY;
    if(Math.abs(scrollY-renderY)>.1)schedule();
    const p = clamp((renderY - start) / travel);
    if (p === last) return;
    last = p;
    const a = ease((p-.48)/.12), b = ease((p-.83)/.1);
    const visibility = [1-a, a*(1-b), b];
    shots.forEach((shot,i) => {
      const entering = i===0 ? 1 : i===1 ? a : b;
      const leaving = i===0 ? a : i===1 ? b : 0;
      shot.style.opacity = visibility[i];
      shot.style.transform = `translate3d(0,${(1-entering)*80-leaving*95}px,0) scale(${1+(1-entering)*.09-leaving*.09})`;
      shot.style.visibility = visibility[i] < .002 ? 'hidden' : 'visible';
    });
    const zoom = .72 + p*.48;
    system.style.transform = `translate(-50%,-50%) scale(${zoom}) rotate(${mobile.matches ? p*120 : 0}deg)`;
    if (!mobile.matches) {
      rings[0].style.transform = `rotate(${p*150}deg) scale(${1-b*.2})`;
      rings[1].style.transform = `rotate(${-p*280}deg) scale(${1+a*.22})`;
      rings[2].style.transform = `rotate(${-35+p*240}deg) scaleY(${1+a*.6-b*.5})`;
      rings[3].style.transform = `rotate(${35-p*180}deg) scaleX(${1+a*.5-b*.4})`;
      points.style.transform = `rotate(${p*260}deg)`;
      grid.style.transform = `perspective(700px) rotateX(${65-p*40}deg) rotateZ(${-12+p*24}deg) scale(${1+p*.3})`;
    }
    meter.style.transform = `scaleX(${p})`;
    const number = String(Math.round(p*100)).padStart(2,'0');
    if (percent.textContent !== number) percent.textContent = number;
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(draw); }
  function measure() { dirty=true; schedule(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    active=entries[0].isIntersecting; if(active)measure();
  },{rootMargin:'200px'}).observe(film);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(measure);
    resize.observe(document.querySelector('.hero'));
    resize.observe(film); resize.observe(stage);
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',measure);
  reduced.addEventListener('change',measure);
  mobile.addEventListener('change',() => {
    [...rings, points, grid].forEach(el => { el.style.transform=''; }); measure();
  });
  new MutationObserver(measure).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
  if (document.fonts) document.fonts.ready.then(measure);
  root.classList.add('cinema-ready');
  schedule();
})();
