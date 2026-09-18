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
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
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
    }
    label(); schedule();
  }
  function render() {
    frame = 0;
    const extent = root.scrollHeight - window.innerHeight;
    const scroll = extent > 0 ? Math.min(1, Math.max(0, window.scrollY / extent)) : 0;
    progress.style.transform = `scaleX(${scroll})`;
    if (!enabled() || document.hidden) { pending.clear(); return; }
    hero.style.setProperty('--hero-shift', `${Math.min(window.scrollY, 650) * 0.055}px`);
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
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
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
  window.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) { cancelAnimationFrame(frame); frame=0; pending.clear(); }
    else schedule();
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('mp-motion', paused ? 'paused' : 'playing'); } catch (_) {}
    apply();
  });
  reduced.addEventListener('change', apply);
  pointer.addEventListener('change', () => { pending.clear(); surfaces.forEach(reset); });
  new MutationObserver(label).observe(root, {attributes:true,attributeFilter:['lang']});
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          reveal.unobserve(entry.target);
        }
      });
    }, {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
    root.classList.add('js-motion');
    const activity = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-offscreen', !entry.isIntersecting));
    }, {rootMargin:'80px'});
    document.querySelectorAll('.hero, .ribbon, .award-feature').forEach(el => activity.observe(el));
  }
  apply();
})();
