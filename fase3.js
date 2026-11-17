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
      details.append(summary, content);
      section.appendChild(details);
      section.classList.add('app-home-accordion-section');
    });
    const wheelCard = document.createElement('section');
    wheelCard.className = 'app-home-wheel-card';
    const wheelTitle = document.createElement('h2');
    wheelTitle.textContent = 'Gira la ruleta';
    wheelCard.append(wheelTitle, wheel);
    const wheelLabel = wheel.querySelector('span');
    if (wheelLabel) wheelLabel.textContent = 'Gira la ruleta';
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
