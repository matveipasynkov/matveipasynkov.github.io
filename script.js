(() => {
  const button = document.querySelector('.lang');
  let lang = 'ru';
  try { if (localStorage.getItem('mp-language') === 'en') lang = 'en'; } catch (_) {}
  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ru][data-en]').forEach(el => { el.textContent = el.dataset[lang]; });
    button.querySelector('.lang-ru').classList.toggle('active', lang === 'ru');
    button.querySelector('.lang-en').classList.toggle('active', lang === 'en');
    button.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
    document.title = lang === 'ru' ? 'Матвей Пасынков — процессы, данные, результат' : 'Matvey Pasynkov — processes, data, impact';
    document.querySelector('meta[name="description"]').content = lang === 'ru'
      ? 'Матвей Пасынков — оптимизация процессов в HeadHunter, бизнес-анализ и AI-автоматизация. Программная инженерия, НИУ ВШЭ.'
      : 'Matvey Pasynkov — process optimization at HeadHunter, business analysis and AI automation. Software Engineering at HSE University.';
    document.querySelector('.process-diagram').setAttribute('aria-label', lang === 'ru' ? 'Цикл работы: анализ, гипотеза, прототип и проверка' : 'Workflow: analysis, hypothesis, prototype and testing');
    try { localStorage.setItem('mp-language', lang); } catch (_) {}
  }
  button.addEventListener('click', () => setLanguage(lang === 'ru' ? 'en' : 'ru'));
  setLanguage(lang);
})();
