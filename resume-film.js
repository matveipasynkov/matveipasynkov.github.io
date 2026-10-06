(() => {
  const root = document.documentElement;
  const video = document.querySelector('#resume-film');
  let language = 'ru';
  let motion = root.dataset.motion;
  function update() {
    const next = root.lang === 'en' ? 'en' : 'ru';
    if (next !== language) {
      const time = video.currentTime;
      const playing = !video.paused;
      language = next;
      video.pause();
      video.poster = `assets/resume-cinema-${next}.jpg`;
      video.querySelector('source').src = `assets/resume-cinema-${next}.mp4`;
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(time, video.duration || 26);
        if (playing && !document.hidden) video.play().catch(() => {});
      }, { once: true });
      video.load();
    }
    video.setAttribute('aria-label', next === 'ru'
      ? 'Мой подход к работе — видеопрезентация'
      : 'My approach to work — video introduction');
    if (motion !== root.dataset.motion && root.dataset.motion === 'off') video.pause();
    motion = root.dataset.motion;
  }
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['lang', 'data-motion'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  update();
})();
