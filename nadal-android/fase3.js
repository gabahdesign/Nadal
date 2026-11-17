(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  function initHome() {
    const home = document.querySelector('#home');
    const hero = document.querySelector('.nadal-poster');
    const dock = document.querySelector('.app-bottom-nav');
    const sections = home && home.querySelectorAll(':scope > .home-section:not(.home-winter-slides)');
    const wheel = document.querySelector('.app-wheel-launch');
    if (!hero || !dock || !sections || sections.length < 3 || !wheel) return false;
    if (home.dataset.appHomeReady) return true;
    home.dataset.appHomeReady = 'true';
    const months = document.createElement('nav');
    months.className = 'app-home-months';
    months.setAttribute('aria-label', 'Mesos');
    ['Nov', 'Des', 'Gen', 'Feb'].forEach((name, index) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      b.setAttribute('aria-label', name + ' · Calendari');
      b.addEventListener('click', () => {
        dock.querySelector('[data-screen="calendar"]').click();
        const previous = document.querySelector('#app-calendar .app-previous');
        const next = document.querySelector('#app-calendar .app-next');
        while (previous && !previous.disabled) previous.click();
        for (let i = 0; i < index && next && !next.disabled; i++) next.click();
      });
      months.appendChild(b);
    });
    hero.prepend(months);
    sections[0].classList.add('app-home-organizers');
    [1, 2].forEach((index) => {
      const section = sections[index];
      const label = index === 1 ? 'Com ens organitzem' : 'Un espai segur i respectuós';
      const details = document.createElement('details');
      details.className = 'app-home-accordion';
      const summary = document.createElement('summary');
      summary.textContent = label;
      const content = document.createElement('div');
      content.className = 'app-home-accordion-content';
      while (section.firstChild) content.appendChild(section.firstChild);
      if (index === 1) {
        const ca = [...content.querySelectorAll('p[data-project-lang="ca"]')];
        const es = [...content.querySelectorAll('p[data-project-lang="es"]')];
        const update = (paragraph, before, after) => { if (paragraph) paragraph.textContent = paragraph.textContent.replace(before, after); };
        ca.forEach(p => update(p, 'Per apuntar-s’hi farem enquestes al grup en lloc de llistes.', 'Per apuntar-s’hi farem principalment enquestes o esdeveniments i, puntualment, una llista de WhatsApp.'));
        es.forEach(p => update(p, 'Para apuntarse haremos encuestas en el grupo en vez de listas.', 'Para apuntarse haremos principalmente encuestas o eventos y, puntualmente, una lista de WhatsApp.'));
        const addRule = (lang, text) => { const p = document.createElement('p'); p.className = 'home-text'; p.dataset.projectLang = lang; p.hidden = lang !== (new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'ca'); p.textContent = text; content.appendChild(p); };
        addRule('ca', 'Si vas a una activitat un altre dia o el mateix dia amb un altre grup i no tens pensat venir amb nosaltres, estalvia’t de dir-ho al grup. Fer-ho comportarà la teva expulsió de la comunitat, no només del grup.');
        addRule('es', 'Si vas a una actividad otro día o el mismo día con otro grupo y no tienes pensado venir con nosotros, evita decirlo en el grupo. Hacerlo supondrá tu expulsión de la comunidad, no solo del grupo.');
      }
      details.append(summary, content);
      section.appendChild(details);
      section.classList.add('app-home-accordion-section');
    });
    const wheelCard = wheel;
    wheelCard.classList.add('app-home-wheel-card');
    const wheelTitle = document.createElement('span');
    wheelTitle.className = 'app-home-wheel-title';
    wheelTitle.textContent = 'Gira la ruleta';
    const description = document.createElement('span');
    description.className = 'app-home-wheel-description';
    description.textContent = 'Descobreix un pla per compartir.';
    wheelCard.replaceChildren(wheelTitle, description);
    home.appendChild(wheelCard);
    const calendarAction = hero.querySelector('.nadal-cover-action.calendar');
    const proposalAction = hero.querySelector('.nadal-cover-action.proposal');
    [[calendarAction, 'calendar'], [proposalAction, 'proposal']].forEach(([button, screen]) => {
      if (!button) return;
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation();
        dock.querySelector('[data-screen="' + screen + '"]').click();
      }, true);
    });
    return true;
  }
  if (!initHome()) {
    const observer = new MutationObserver(() => { if (initHome()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
