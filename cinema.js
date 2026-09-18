/* A reversible scroll timeline. Native scrolling is never intercepted. */
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
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let active = true;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n*n*(3-2*n); };
  function draw() {
    frame = 0;
    if (document.hidden || !active || root.dataset.motion !== 'on' || reduced.matches) return;
    const rect = film.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(stage).top) || 0;
    const travel = film.offsetHeight - stage.offsetHeight;
    const p = clamp((inset - rect.top) / Math.max(1, travel));
    // Hold each chapter, then dissolve it into the next one. Reverse scroll reverses every value.
    const a = ease((p-.24)/.13), b = ease((p-.61)/.13);
    const visibility = [1-a, a*(1-b), b];
    shots.forEach((shot,i) => {
      const entering = i===0 ? 1 : i===1 ? a : b;
      const leaving = i===0 ? a : i===1 ? b : 0;
      shot.style.opacity = visibility[i];
      shot.style.transform = `translate3d(0,${(1-entering)*80-leaving*95}px,0) scale(${1+(1-entering)*.09-leaving*.09})`;
      shot.style.visibility = visibility[i] < .002 ? 'hidden' : 'visible';
    });
    const zoom = .72 + p*.48;
    film.style.setProperty('--film-zoom',zoom);
    film.style.setProperty('--film-glow',.1+b*.15);
    rings[0].style.transform = `rotate(${p*150}deg) scale(${1-b*.2})`;
    rings[1].style.transform = `rotate(${-p*280}deg) scale(${1+a*.22})`;
    rings[2].style.transform = `rotate(${-35+p*240}deg) scaleY(${1+a*.6-b*.5})`;
    rings[3].style.transform = `rotate(${35-p*180}deg) scaleX(${1+a*.5-b*.4})`;
    points.style.transform = `rotate(${p*260}deg)`;
    grid.style.transform = `perspective(700px) rotateX(${65-p*40}deg) rotateZ(${-12+p*24}deg) scale(${1+p*.3})`;
    meter.style.transform = `scaleX(${p})`;
    percent.textContent = String(Math.round(p*100)).padStart(2,'0');
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(draw); }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    active=entries[0].isIntersecting; if(active)schedule();
  },{rootMargin:'200px'}).observe(film);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['data-motion','lang']});
  root.classList.add('cinema-ready');
  schedule();
})();
