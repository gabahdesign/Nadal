(() => {
  const slides = [
    { kicker: 'MOVE × LOBITOS', title: 'Un hivern ple de plans per compartir.', text: 'Fires, llums, tradicions, neu i escapades. Descobreix propostes per a tota la temporada i ajuda’ns a decidir què fem plegats.', image: 'images/winter-category-fires-mercats.png' },
    { kicker: 'Calendari', title: 'Plans de Move amb data', text: 'Les dates i hores indiquen la proposta de trobada de Move; els canvis pendents de confirmació s’assenyalen a la seva fila.', image: 'images/winter-category-calendari.png' },
    { kicker: 'Activitats', title: 'Tria el teu proper pla', text: 'Les activitats són propostes: aparèixer aquí no vol dir que hi anem.', image: 'images/winter-category-festivals-llum.png' }
  ];
  let index = 0;
  let seen = false;
  try { seen = localStorage.getItem('nadalIntroVista') === '1'; } catch (_) {}
  const overlay = document.createElement('section');
  overlay.className = 'nadal-intro';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Introducció');
  overlay.innerHTML = '<div class="nadal-intro-top"><span class="nadal-intro-brand">MOVE × LOBITOS</span><button class="nadal-intro-skip" type="button">Saltar</button></div><div class="nadal-intro-body" aria-live="polite"><div class="nadal-intro-art" aria-hidden="true"></div><span class="nadal-intro-kicker"></span><h1></h1><p></p></div><div class="nadal-intro-bottom"><div class="nadal-intro-dots" aria-label="Progrés"></div><button class="nadal-intro-next" type="button"></button></div>';
  let returnFocus = null;
  const draw = () => {
    const item = slides[index];
    overlay.querySelector('.nadal-intro-art').style.backgroundImage = `url("${item.image}")`;
    overlay.querySelector('.nadal-intro-kicker').textContent = item.kicker;
    overlay.querySelector('h1').textContent = item.title;
    overlay.querySelector('p').textContent = item.text;
    overlay.querySelector('.nadal-intro-next').textContent = index === slides.length - 1 ? 'Començar' : 'Següent';
    overlay.querySelector('.nadal-intro-dots').innerHTML = slides.map((_, i) => `<span class="nadal-intro-dot${i === index ? ' active' : ''}"></span>`).join('');
    overlay.querySelector('.nadal-intro-dots').setAttribute('aria-label', `Pantalla ${index + 1} de ${slides.length}`);
  };
  const open = () => {
    if (overlay.isConnected) return;
    returnFocus = document.activeElement;
    index = 0;
    draw();
    document.body.appendChild(overlay);
    overlay.querySelector('.nadal-intro-skip').focus();
  };
  const finish = () => {
    try { localStorage.setItem('nadalIntroVista', '1'); } catch (_) {}
    overlay.remove();
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  };
  overlay.querySelector('.nadal-intro-skip').addEventListener('click', finish);
  overlay.querySelector('.nadal-intro-next').addEventListener('click', () => { if (index === slides.length - 1) finish(); else { index++; draw(); } });
  let startX = 0;
  overlay.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', e => { const distance = e.changedTouches[0].clientX - startX; if (distance < -50 && index < slides.length - 1) { index++; draw(); } else if (distance > 50 && index > 0) { index--; draw(); } }, { passive: true });
  // The old help button is created by the legacy app. Intercept it in the
  // Android bundle so that it opens this introduction instead of the old one.
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || !event.target.closest('.app-help')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  }, true);
  // A preview URL can display the introduction again without clearing preferences.
  if (!seen || new URLSearchParams(location.search).get('intro') === '1') open();
})();
