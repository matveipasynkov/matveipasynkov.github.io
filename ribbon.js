/* Two identical, viewport-filling halves make the loop seamless at any width. */
(() => {
  const ribbon = document.querySelector('.ribbon');
  const track = ribbon.querySelector('.ribbon-track');
  const first = track.querySelector('.ribbon-group');
  const unit = first.querySelector('.ribbon-unit');
  let previousCount = 0;
  let frame = 0;
  function fit() {
    frame = 0;
    const width = unit.getBoundingClientRect().width;
    if (!width) return;
    const count = Math.max(1, Math.ceil(ribbon.clientWidth / width) + 1);
    track.style.setProperty('--ribbon-duration', `${count * width / 45}s`);
    if (count === previousCount) return;
    previousCount = count;
    first.replaceChildren(unit);
    for (let i = 1; i < count; i++) first.append(unit.cloneNode(true));
    track.lastElementChild.replaceWith(first.cloneNode(true));
    // Keep roughly the same text speed on a phone and an ultrawide display.
    track.style.setProperty('--ribbon-duration', `${count * width / 45}s`);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(fit); }
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(ribbon);
  else window.addEventListener('resize', schedule, {passive:true});
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
})();
