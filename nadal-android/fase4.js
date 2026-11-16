(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  const categories = [
    ['Fires i mercats', '#c83e59', 'winter-category-fires-mercats.png'],
    ['Patinatge sobre gel', '#4167ef', 'winter-category-patinatge.png'],
    ['Festivals i llum', '#8050d8', 'winter-category-festivals-llum.png'],
    ['Pessebres vivents', '#e66b35', 'winter-category-pessebres.png'],
    ['Rutes nadalenques', '#00a4a0', 'winter-category-rutes-nadalenques.png'],
    ['Tradicions i folklore', '#d99b16', 'winter-category-folklore.png'],
    ['Festes majors', '#d63d8c', 'winter-category-festes-majors.png'],
    ['Rutes de senderisme', '#1686a5', 'winter-category-senderisme.png'],
    ['Esquí i snow', '#5365cf', 'winter-category-esqui-snow.png'],
    ['Cap d’Any', '#f0543e', 'winter-category-cap-any.png']
  ];
  const months = [['Tots', null], ['Novembre', 'novembre'], ['Desembre', 'desembre'], ['Gener', 'gener'], ['Febrer', 'febrer']];
  const root = document.createElement('div');
  root.className = 'app-categories-root';
  let data = [], month = null, category = null, view = 'grid', gridScroll = 0, listScroll = 0, detailReturn = null;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const matches = (item) => !month || (item.mesosExplicits || []).includes(month);
  const plans = (name) => data.filter(item => item.categoria === name && matches(item));
  function image(item, fallback) {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = item && item.imatge ? (item.altImatge || item.titol) : '';
    img.src = item && item.imatge ? item.imatge : 'images/' + fallback;
    img.addEventListener('error', () => { img.onerror = null; img.src = 'images/' + fallback; img.alt = ''; }, { once:true });
    return img;
  }
  function filter() {
    const nav = el('nav', 'app-category-months'); nav.setAttribute('aria-label', 'Filtra per mes');
    months.forEach(([label, value]) => {
      const b = el('button', value === month ? 'selected' : '', label); b.type = 'button';
      b.setAttribute('aria-pressed', String(value === month));
      b.addEventListener('click', () => { month = value; render(); }); nav.appendChild(b);
    });
    return nav;
  }
  function back(to) {
    const b = el('button', 'app-category-back', '←'); b.type = 'button'; b.setAttribute('aria-label', 'Torna enrere');
    b.addEventListener('click', () => { view = to; render(); requestAnimationFrame(() => window.scrollTo(0, to === 'grid' ? gridScroll : listScroll)); });
    return b;
  }
  function renderGrid() {
    root.append(el('h1', 'app-category-title', 'Activitats'), el('p', 'app-category-subtitle', 'Tria una categoria i descobreix els plans disponibles.'), filter());
    const special = el('button', 'app-category-special'); special.type = 'button';
    special.append(el('strong', '', 'Gran quedada de Nadal'), el('span', '', 'Pla especial · veure detalls'));
    special.addEventListener('click', () => { gridScroll = window.scrollY; detailReturn=null; category = ['Gran quedada de Nadal', '#d6b900', 'winter-category-gran-quedada.png']; view = 'detail'; render(data.find(x => x.categoria === category[0])); window.scrollTo(0,0); }); root.appendChild(special);
    const grid = el('div', 'app-category-grid');
    categories.forEach(c => {
      const b = el('button', 'app-category-block'); b.type = 'button'; b.style.setProperty('--category-color', c[1]);
      b.append(image(null,c[2]), el('span','app-category-copy',null));
      const copy = b.lastChild; copy.append(el('strong','',c[0]),el('span','',plans(c[0]).length + ' plans'));
      b.addEventListener('click', () => { gridScroll = window.scrollY; category = c; view = 'list'; render(); window.scrollTo(0,0); });
      grid.appendChild(b);
    });
    root.appendChild(grid);
    if (month) root.appendChild(el('p','app-category-note','Els plans sense mes indicat apareixen a «Tots».'));
  }
  function renderList() {
    const header = el('header','app-category-header'); header.append(back('grid'));
    const headings = el('div'); headings.append(el('h1','app-category-title',category[0]),el('p','app-category-subtitle',plans(category[0]).length + ' plans')); header.appendChild(headings);
    root.append(header, filter());
    const list = el('div','app-plan-grid');
    plans(category[0]).forEach(item => {
      const b = activityCard(item, 'compact');
      b.addEventListener('click',()=>{ listScroll=window.scrollY;detailReturn=null;view='detail';render(item);window.scrollTo(0,0); }); list.appendChild(b);
    });
    if (!list.childElementCount) list.appendChild(el('p','app-category-note','Encara no hi ha plans en aquesta categoria.'));
    root.appendChild(list);
  }
  function activityCard(item, mode, options = {}) {
    const compact = mode === 'compact';
    const card = el(compact ? 'button' : 'article', compact ? 'app-plan-compact' : 'app-plan-detail');
    if(compact) card.type='button'; card.style.setProperty('--category-color',category[1]);
    const detailImage=image(item,category[2]);
    if(compact) {
      card.appendChild(detailImage);const copy=el('span','app-plan-copy');
      const moveDay=item.trobadaMove?.data?.split('-').reverse().join('.');
      const displayDate=options.moveDate && item.trobadaMove ? [moveDay,item.trobadaMove.hora].filter(Boolean).join(' · ') : (options.pendingVisit && item.propostaMovePendent?.periode || item.periode || item.trobadaMove?.data || 'Data pendent');
      copy.append(el('span','app-plan-date',displayDate),el('strong','app-plan-title',item.titol),el('span','app-plan-place',item.lloc || ''));
      card.appendChild(copy); return card;
    }
    const media=el('div','app-plan-media');media.appendChild(detailImage);
    const credit=el('div','app-plan-photo-credit');
    if(item.imatge && item.creditImatge){
      const more=el('button','app-plan-photo-info','i');more.type='button';more.setAttribute('aria-label','Informació sobre la fotografia');more.setAttribute('aria-expanded','false');
      credit.hidden=true;credit.append(el('strong','','Fotografia'),el('span','',item.creditImatge));
      if(item.fontImatge){const source=el('a','','Font de la fotografia');source.href=item.fontImatge;source.target='_blank';source.rel='noopener noreferrer';credit.appendChild(source);}
      more.addEventListener('click',()=>{credit.hidden=!credit.hidden;more.setAttribute('aria-expanded',String(!credit.hidden));});
      detailImage.addEventListener('error',()=>{more.hidden=true;credit.hidden=true;},{once:true});media.append(more,credit);
    }
    const band=el('div','app-plan-band');
    const chip=[...document.querySelectorAll('.winter-mobile-category-chip')].find(x=>x.textContent.trim()===category[0]);
    const icon=chip?.querySelector('svg'); if(icon)band.appendChild(icon.cloneNode(true));
    band.appendChild(el('span','',category[0].toLocaleUpperCase()));
    card.append(media,band);
    const body=el('div','app-plan-body');
    if(item.lloc)body.appendChild(el('p','app-plan-location',item.lloc));
    body.appendChild(el('h1','app-plan-detail-title',item.titol));
    if(item.descripcio)body.appendChild(el('p','app-plan-description',item.descripcio));
    const facts=el('dl','app-plan-facts');
    function fact(label,value){if(!value)return;const wrap=el('div');wrap.append(el('dt','',label),el('dd','',value));facts.appendChild(wrap);}
    fact('DATA / PERÍODE',item.propostaMovePendent?.periode || item.periode || (item.trobadaMove?.data || 'Pendent de confirmar'));
    fact(item.provincia ? 'PROVÍNCIA' : 'LLOC',item.provincia || item.lloc);
    if(item.trobadaMove?.data)fact('TROBADA DE MOVE',[item.trobadaMove.data,item.trobadaMove.hora].filter(Boolean).join(' · '));
    else if(item.hora)fact('HORA',item.hora);
    body.appendChild(facts);
    const confirmed=String(item.estat||'').toLowerCase()==='confirmada';
    body.appendChild(el('p',confirmed?'app-plan-status is-confirmed':'app-plan-status',confirmed?'Confirmada':'Pendent de confirmar'));
    if(item.trobadaMove?.nota)body.appendChild(el('p','app-plan-description',item.trobadaMove.nota));
    if(item.propostaMovePendent && !item.propostaMovePendent.periode)body.appendChild(el('p','app-plan-description','Data de la visita de Move pendent.'));
    if(item.fitxaOriginalHtml){const original=new DOMParser().parseFromString(item.fitxaOriginalHtml,'text/html');original.querySelectorAll('.winter-price [data-project-lang="es"]').forEach(n=>n.remove());const price=original.querySelector('.winter-price');if(price && price.textContent.trim())body.appendChild(el('p','app-plan-description',price.textContent.trim()));}
    body.appendChild(el('p','app-plan-brand','MOVE × LOBITOS'));
    const links=el('div','app-plan-links'); const known=new Set();
    function link(url,label){if(!url||known.has(url))return;known.add(url);const a=el('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.appendChild(a);}
    if(item.webOficial)link(item.webOficial,'Web oficial');else links.appendChild(el('span','app-plan-link-pending','Web oficial pendent'));
    for(const x of item.enllacosOriginals || [])link(x.href,x.text || 'Font oficial');if(item.ubicacioVerificada !== false) link(item.mapsUrl,'Google Maps');
    body.appendChild(links);
    const calendar=el('button','app-plan-add-calendar','Afegeix al calendari');calendar.type='button';const date=window.NadalCalendar.eventDate(item);
    calendar.disabled=!date;calendar.addEventListener('click',async()=>{try{await window.NadalCalendar.download(item);}catch(error){console.error(error);window.alert('No s’ha pogut desar el fitxer de calendari.');}});body.appendChild(calendar);
    if(!date)body.appendChild(el('p','app-plan-calendar-note','Disponible quan hi hagi una data concreta verificada.'));
    else if(!date.move)body.appendChild(el('p','app-plan-calendar-note','Dates de l’activitat; no confirmen que Move hi vagi.'));
    card.appendChild(body); return card;
  }
  function renderDetail(item) {
    if (!item) { root.append(back('grid'),el('p','app-category-note','No s’ha trobat el pla.')); return; }
    let backButton;
    if(detailReturn){backButton=el('button','app-category-back','←');backButton.type='button';backButton.setAttribute('aria-label','Torna enrere');backButton.addEventListener('click',()=>{const goBack=detailReturn;detailReturn=null;goBack();});}
    else backButton=back(category[0] === 'Gran quedada de Nadal' ? 'grid' : 'list');
    if (item.id === 'move-gran-quedada-de-nadal') {
      const source = document.querySelector('.quedada-experience');
      const special = el('article', 'app-gathering');
      const hero = el('header', 'app-gathering-hero');
      hero.append(el('p', 'app-gathering-kicker', 'MOVE × LOBITOS · PLA ESPECIAL'), el('h1', '', item.titol));
      if (item.trobadaMove?.data) hero.appendChild(el('p', 'app-gathering-date', 'Data proposada · ' + item.trobadaMove.data.split('-').reverse().join('.') + (item.trobadaMove.hora ? ' · ' + item.trobadaMove.hora : '')));
      if (item.trobadaMove?.nota || item.descripcio) hero.appendChild(el('p', '', item.trobadaMove?.nota || item.descripcio));
      special.appendChild(hero);
      if (source) {
        const content = source.cloneNode(true);
        const caption = content.querySelector('figcaption span');
        if (caption) caption.textContent = caption.textContent.replace('línia blava', 'línia daurada').replace('línea azul', 'línea dorada');
        const map = content.querySelector('.quedada-map-canvas');
        const legend = content.querySelector('.quedada-map-key');
        if (map) { map.removeAttribute('id'); map.replaceChildren(); map.classList.remove('leaflet-container'); }
        if (legend) { legend.removeAttribute('id'); legend.replaceChildren(); }
        special.appendChild(content);
        root.append(backButton, special);
        if (map && legend && window.NadalRenderQuedadaRouteMap) requestAnimationFrame(() => window.NadalRenderQuedadaRouteMap(map, legend));
      } else {
        special.appendChild(activityCard(item, 'full')); root.append(backButton, special);
      }
      return;
    }
    root.append(backButton, activityCard(item, 'full'));
  }
  function render(item) { root.replaceChildren(); if(view==='grid')renderGrid();else if(view==='list')renderList();else renderDetail(item); }
  function categoryFor(item) { return categories.find(c => c[0] === item.categoria) || ['Gran quedada de Nadal','#d6b900','winter-category-gran-quedada.png']; }
  window.NadalActivities = {
    getAll: () => data,
    getCategories: () => categories.map(c => [...c]),
    compact(item, options = {}) {
      const previous = category; category = categoryFor(item);
      const card = activityCard(item, 'compact', options); category = previous;
      card.addEventListener('click', () => { const previousScroll=window.scrollY;const screen=options.returnScreen || 'calendar';window.NadalActivities.open(item.id,()=>{document.querySelector('.app-bottom-nav [data-screen="'+screen+'"]')?.click();requestAnimationFrame(()=>window.scrollTo(0,previousScroll));}); });
      return card;
    },
    open(id, onReturn = null) {
      const item = data.find(x => x.id === id); if(!item)return;
      document.querySelector('.app-bottom-nav [data-screen="categories"]')?.click();
      category=categoryFor(item);detailReturn=onReturn;view='detail';render(item);window.scrollTo(0,0);
    }
  };
  async function init() {
    const page=document.querySelector('#winterMobileActivitiesPage');const button=document.querySelector('.app-bottom-nav [data-screen="categories"]');
    if(!page||!button)return false;
    page.appendChild(root);root.appendChild(el('p','app-category-note','Carregant activitats…'));
    button.addEventListener('click',()=>{view='grid';render();});
    try { const response=await fetch('./activitats.json', { cache: 'no-store' }); if(!response.ok)throw new Error('HTTP '+response.status);const payload=await response.json();data=payload.activitats;if(!Array.isArray(data))throw new Error('Dades no vàlides');render();document.dispatchEvent(new Event('nadal-activities-ready')); }
    catch(error){root.replaceChildren(el('p','app-category-note','No s’han pogut carregar les activitats. Torna-ho a provar.'));console.error(error);}
    return true;
  }
  if(document.querySelector('.app-bottom-nav')) init(); else {const observer=new MutationObserver(()=>{if(document.querySelector('.app-bottom-nav')){observer.disconnect();init();}});observer.observe(document.body,{childList:true,subtree:true});}
})();
