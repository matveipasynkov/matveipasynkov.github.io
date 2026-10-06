/* A reversible scroll timeline; layout is measured only when geometry changes. */
(() => {
  const root = document.documentElement;
  const film = document.querySelector('.scroll-film');
  const stage = film.querySelector('.film-stage');
  const shots = [...film.querySelectorAll('.film-shot')];
  const steps = [...film.querySelectorAll('.scene-steps span')];
  const rings = [...film.querySelectorAll('.film-ring')];
  const points = film.querySelector('.film-points');
  const grid = film.querySelector('.film-grid');
  const system = film.querySelector('.film-system');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 780px)');
  let frame = 0, active = true, dirty = true, start = 0, travel = 1, last = -1, renderY = scrollY;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n*n*(3-2*n); };
  function draw(time=0) {
    frame = 0;
    if (document.hidden || !active || root.dataset.motion !== 'on' || reduced.matches || root.classList.contains('flat-ready')) return;
    if (dirty) {
      start = film.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
      travel = Math.max(1, film.offsetHeight - stage.offsetHeight);
      dirty = false; last = -1;
    }
    const legacy=mobile.matches||root.classList.contains('legacy-mobile');
    renderY=window.portfolioScroll?.read().y??scrollY;
    const p = clamp((renderY - start) / travel);
    if (p === last) return;
    last = p;
    const a = legacy?ease((p-.24)/.13):ease((p-.48)/.12), b = legacy?ease((p-.61)/.13):ease((p-.83)/.1);
    const visibility = [1-ease(a*2), ease((a-.5)*2)*(1-ease(b*2)), ease((b-.5)*2)];
    shots.forEach((shot,i) => {
      const entering = i===0 ? 1 : i===1 ? a : b;
      const leaving = i===0 ? a : i===1 ? b : 0;
      shot.style.opacity = visibility[i];
      shot.style.transform = root.classList.contains('flat-ready') ? 'none' : `translate3d(0,${(1-entering)*30-leaving*30}px,0)`;
      shot.style.visibility = visibility[i] < .002 ? 'hidden' : 'visible';
    });
    const lightweight=root.classList.contains('flat-ready');
    const zoom = .72 + p*.48;
    if(!lightweight)system.style.transform = `translate(-50%,-50%) scale(${zoom}) rotate(${mobile.matches ? p*120 : 0}deg)`;
    if (!mobile.matches&&!lightweight) {
      rings[0].style.transform = `rotate(${p*150}deg) scale(${1-b*.2})`;
      rings[1].style.transform = `rotate(${-p*280}deg) scale(${1+a*.22})`;
      rings[2].style.transform = `rotate(${-35+p*240}deg) scaleY(${1+a*.6-b*.5})`;
      rings[3].style.transform = `rotate(${35-p*180}deg) scaleX(${1+a*.5-b*.4})`;
      points.style.transform = `rotate(${p*260}deg)`;
      grid.style.transform = `perspective(700px) rotateX(${65-p*40}deg) rotateZ(${-12+p*24}deg) scale(${1+p*.3})`;
    }
    const current = visibility.indexOf(Math.max(...visibility));
    steps.forEach((step,i) => step.classList.toggle('is-active',i===current));
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
  document.addEventListener('portfolio-scroll-frame',schedule);
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
