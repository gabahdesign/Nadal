(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  const months = [[2026,10,'Nov 2026'],[2026,11,'Des 2026'],[2027,0,'Gen 2027'],[2027,1,'Feb 2027']];
  const spanish = new URLSearchParams(location.search).get('lang') === 'es';
  let month=0, day=null, status='pending';
  const root=document.createElement('main'); root.id='app-calendar-v2'; root.setAttribute('aria-label','Calendari');
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
  const confirmed=item=>String(item.estat||'').toLocaleLowerCase()==='confirmada';
  const source=()=>window.NadalActivities?.getAll() || [];
  const dated=()=>source().filter(x=>x.trobadaMove && /^\d{4}-\d{2}-\d{2}$/.test(x.trobadaMove.data));
  const monthKey=()=>`${months[month][0]}-${String(months[month][1]+1).padStart(2,'0')}`;
  const filtered=()=>dated().filter(x=>x.trobadaMove.data.startsWith(monthKey()) && (status==='confirmed'?confirmed(x):!confirmed(x)));
  function pill(label, selected, action) { const b=el('button',selected?'is-selected':'',label);b.type='button';b.setAttribute('aria-pressed',String(selected));b.addEventListener('click',action);return b; }
  function render(){
    root.replaceChildren();const header=el('header','app-calendar-v2-header');
    header.append(el('p','app-calendar-kicker','CALENDARI MENSUAL I TOTES LES UBICACIONS'),el('h1','','Calendari mensual i totes les ubicacions'),el('p','app-calendar-copy','El mapa mostra alhora totes les ubicacions concretes de fires, rutes, festivals i plans. Els punts s’agrupen quan queden a prop; toca un grup per ampliar i obrir una fitxa per veure’n la ruta des de Barcelona en transport públic. Les ubicacions no confirmen que Move hi vagi.'));root.appendChild(header);
    const selector=el('nav','app-calendar-v2-months');selector.setAttribute('aria-label','Selecciona un mes');months.forEach((m,i)=>selector.appendChild(pill(m[2],month===i,()=>{month=i;day=null;render();})));root.appendChild(selector);
    const panel=el('section','app-calendar-v2-panel');const dateTitle=new Intl.DateTimeFormat(spanish?'es-ES':'ca-ES',{month:'long',year:'numeric'}).format(new Date(months[month][0],months[month][1],1));
    panel.appendChild(el('h2','',dateTitle));
    const calendarScroll=el('div','app-calendar-v2-scroll');const grid=el('div','app-calendar-v2-grid');
    (spanish?['Lu','Ma','Mi','Ju','Vi','Sá','Do']:['Dl','Dt','Dc','Dj','Dv','Ds','Dg']).forEach(w=>{const label=el('span','app-calendar-v2-weekday',w);label.setAttribute('aria-hidden','true');grid.appendChild(label);});
    const [year,number]=months[month],offset=(new Date(year,number,1).getDay()+6)%7,count=new Date(year,number+1,0).getDate();
    for(let i=0;i<offset;i++){const spacer=el('span','app-calendar-v2-blank');spacer.setAttribute('aria-hidden','true');grid.appendChild(spacer);}
    for(let d=1;d<=count;d++){
      const iso=monthKey()+'-'+String(d).padStart(2,'0');const matches=dated().filter(x=>x.trobadaMove.data===iso);
      const hasConfirmed=matches.some(confirmed),hasPending=matches.some(x=>!confirmed(x));const b=el('button','app-calendar-v2-day',String(d));b.type='button';
      if(hasConfirmed)b.classList.add('has-confirmed');if(hasPending)b.classList.add('has-pending');if(day===iso)b.classList.add('is-selected');
      b.setAttribute('aria-pressed',String(day===iso));b.setAttribute('aria-label',`${d} ${dateTitle}${matches.length?' · '+matches.length+' plans':''}`);
      if(matches.length){const markers=el('span','app-calendar-v2-dots');markers.setAttribute('aria-hidden','true');matches.slice(0,4).forEach(x=>markers.appendChild(el('i',confirmed(x)?'confirmed':'pending')));b.appendChild(markers);}
      b.addEventListener('click',()=>{day=day===iso?null:iso;render();});grid.appendChild(b);
    }
    calendarScroll.appendChild(grid);panel.appendChild(calendarScroll);
    const legend=el('div','app-calendar-v2-legend');legend.innerHTML='<span><i class="confirmed"></i>Confirmada</span><span><i class="pending"></i>Pendent de confirmar</span>';panel.appendChild(legend);root.appendChild(panel);
    const section=el('section','app-calendar-v2-results');section.append(el('h2','','Plans de Move amb data'),el('p','app-calendar-copy','Aquí només apareixen els plans que farem. Les dates i hores indiquen la proposta de trobada de Move; els canvis pendents de confirmació s’assenyalen a la seva fila.'));
    const tabs=el('div','app-calendar-v2-tabs');tabs.setAttribute('aria-label','Estat dels plans');tabs.append(pill('Confirmades',status==='confirmed',()=>{status='confirmed';render();}),pill('Pendents',status==='pending',()=>{status='pending';render();}));section.appendChild(tabs);
    const list=el('div','app-calendar-v2-cards');const plans=filtered().filter(x=>!day||x.trobadaMove.data===day);
    if(plans.length)plans.forEach(item=>list.appendChild(window.NadalActivities.compact(item,{moveDate:true})));
    else list.appendChild(el('p','app-calendar-copy',day?'No hi ha plans d’aquest estat el dia seleccionat.':'No hi ha plans d’aquest estat per a aquest mes.'));
    section.appendChild(list);root.appendChild(section);
    const pending=el('section','app-calendar-v2-pending');pending.appendChild(el('h2','','Propostes amb data pendent'));
    pending.appendChild(el('p','app-calendar-copy','La data de la visita de Move està pendent de decidir.'));
    const pendingCards=el('div','app-calendar-v2-cards');source().filter(x=>x.propostaMovePendent && !x.trobadaMove).forEach(item=>pendingCards.appendChild(window.NadalActivities.compact(item,{pendingVisit:true})));
    pending.appendChild(pendingCards);root.appendChild(pending);
  }
  function init(){
    if(!document.querySelector('.app-bottom-nav')||!window.NadalActivities)return false;
    document.body.appendChild(root);render();
    document.querySelectorAll('.app-home-months button').forEach((b,i)=>b.addEventListener('click',()=>{month=i;day=null;render();}));
    document.addEventListener('nadal-activities-ready',render);return true;
  }
  if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
})();
