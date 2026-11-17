(function () {
  'use strict';
  if (!window.matchMedia('(max-width: 760px)').matches) return;
  var icons = {
    home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    map:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    categories:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    proposal:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    wheel:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>'; }
  function button(label,icon) { var b=document.createElement('button'); b.type='button'; b.innerHTML=svg(icon)+'<span>'+label+'</span>'; return b; }
  function init() {
    if (!document.querySelector('#homeDaysGrid button') || !document.getElementById('winterMobileMap')) return false;
    document.body.classList.add('nadal-native-app');
    var originalDock=document.getElementById('winterMobileDock');
    var nav=document.createElement('nav'); nav.className='app-bottom-nav'; nav.setAttribute('aria-label','Navegació principal');
    var options=[['Inici','home'],['Calendari','calendar'],['Proposar','proposal'],['Activitats','categories'],['Mapa','map']];
    var calendar=document.createElement('main'); calendar.id='app-calendar'; calendar.className='app-screen'; calendar.hidden=true;
    calendar.innerHTML='<div class="app-screen-header"><span>PLANS DE MOVE</span><h1>Calendari</h1><p>Activitats amb data i propostes pendents.</p></div><div class="app-calendar-controls"><button type="button" class="app-previous" aria-label="Mes anterior">‹</button><h2></h2><button type="button" class="app-next" aria-label="Mes següent">›</button></div><div class="app-weekdays" aria-hidden="true"><span>DL</span><span>DT</span><span>DC</span><span>DJ</span><span>DV</span><span>DS</span><span>DG</span></div><div class="app-calendar-grid"></div><div class="app-calendar-results" aria-live="polite"></div>';
    document.body.appendChild(calendar);
    var selected=0, months=[[2026,10],[2026,11],[2027,0],[2027,1]];
    function paintCalendar() {
      var year=months[selected][0],month=months[selected][1],heading=calendar.querySelector('h2');
      heading.textContent=new Intl.DateTimeFormat('ca-ES',{month:'long',year:'numeric'}).format(new Date(year,month,1));
      var grid=calendar.querySelector('.app-calendar-grid'), results=calendar.querySelector('.app-calendar-results'); grid.innerHTML=''; results.innerHTML='';
      var rows=Array.prototype.slice.call(document.querySelectorAll('#projectCalendarMoveSchedule .calendar-list-row'));
      var pending=Array.prototype.slice.call(document.querySelectorAll('#projectCalendarMoveSchedule .project-calendar-pending-item'));
      var offset=(new Date(year,month,1).getDay()+6)%7, count=new Date(year,month+1,0).getDate();
      for(var i=0;i<offset;i++) grid.appendChild(document.createElement('span'));
      for(var day=1;day<=count;day++) (function(d) {
        var date=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        var matches=rows.filter(function(row){var t=row.querySelector('time');return t && t.dateTime===date;});
        var pendingMatches=pending.filter(function(row){var range=String(row.dataset.pendingRange||'').split('/');return range.length===2 && range[0]<=date && date<=range[1];});
        var b=document.createElement('button'); b.type='button'; b.textContent=d; b.className=matches.length?'has-plan':pendingMatches.length?'has-pending':''; b.setAttribute('aria-label',d+' '+heading.textContent+(matches.length?' · '+matches.length+' plans amb data':'')+(pendingMatches.length?' · propostes amb visita pendent':''));
        b.addEventListener('click',function(){ grid.querySelectorAll('button').forEach(function(x){x.classList.remove('selected');}); b.classList.add('selected'); results.innerHTML=''; if(!matches.length && !pendingMatches.length){results.textContent='No hi ha cap activitat amb data aquest dia.';return;} matches.forEach(function(row){var copy=row.cloneNode(true),action=copy.querySelector('.calendar-list-add');if(action)action.onclick=function(){var source=row.querySelector('.calendar-list-add');if(source)source.click();};results.appendChild(copy);}); if(pendingMatches.length){var caption=document.createElement('h3');caption.textContent='Propostes amb data pendent';results.appendChild(caption);pendingMatches.forEach(function(row){var note=document.createElement('p'),title=row.querySelector('.activity-ticket-title');note.textContent=title?title.textContent:'Proposta pendent';results.appendChild(note);});} });
        grid.appendChild(b);
      })(day);
      calendar.querySelector('.app-previous').disabled=selected===0; calendar.querySelector('.app-next').disabled=selected===months.length-1;
    }
    calendar.querySelector('.app-previous').onclick=function(){if(selected>0){selected--;paintCalendar();}};
    calendar.querySelector('.app-next').onclick=function(){if(selected<months.length-1){selected++;paintCalendar();}};
    function go(which) {
      calendar.hidden=which!=='calendar'; document.body.dataset.appScreen=which;
      var target=which==='home'?'[data-mobile-kind="home"]':which==='proposal'?'[data-mobile-kind="proposal"]':which==='categories'?'[data-mobile-kind="activities"]':'#winterMobileMap';
      if(which==='calendar'||which==='map'){var activitiesPage=document.getElementById('winterMobileActivitiesPage');if(activitiesPage) activitiesPage.hidden=true;} var b=(which==='calendar'||which==='map')?null:originalDock.querySelector(target); if(b) b.click();
      nav.querySelectorAll('button').forEach(function(item){var active=item.dataset.screen===which;item.classList.toggle('active',active);if(active)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');});
      if(which==='calendar') paintCalendar(); window.scrollTo(0,0);
    }
    options.forEach(function(option){var b=button(option[0],option[1]);b.dataset.screen=option[1];b.onclick=function(){go(option[1]);};nav.appendChild(b);});
    document.body.appendChild(nav);
    var wheel=document.createElement('dialog'); wheel.className='app-wheel'; wheel.innerHTML='<div class="app-dialog-head"><h2>Tria un pla</h2><button type="button" class="app-close" aria-label="Tanca">×</button></div><div class="app-wheel-pointer" aria-hidden="true"></div><div class="app-wheel-disc" aria-hidden="true"></div><p class="app-wheel-result" aria-live="polite"></p><button type="button" class="app-spin">Girar</button><button type="button" class="app-result-link" hidden>Veure activitat</button>';
    document.body.appendChild(wheel); var wheelDisc=wheel.querySelector('.app-wheel-disc'), picked=null,angle=0;
    function choices(){return Array.prototype.slice.call(document.querySelectorAll('#homeDaysGrid button'));}
    wheel.querySelector('.app-close').onclick=function(){wheel.close();};
    wheel.querySelector('.app-spin').onclick=function(){var cards=choices();if(!cards.length)return;var index=Math.floor(Math.random()*cards.length);picked=cards[index];var destination=(360-((index+.5)*360/cards.length))%360;angle+=1800+((destination-(angle%360)+360)%360);wheelDisc.style.transform='rotate('+angle+'deg)';var spin=this;spin.disabled=true;wheel.querySelector('.app-wheel-result').textContent='';wheel.querySelector('.app-result-link').hidden=true;setTimeout(function(){wheel.querySelector('.app-wheel-result').textContent=picked.querySelector('.home-day-label').textContent;wheel.querySelector('.app-result-link').hidden=false;spin.textContent='Girar una altra vegada';spin.disabled=false;},document.documentElement.classList.contains('winter-motion-off')?0:3000);};
    wheel.querySelector('.app-result-link').onclick=function(){wheel.close();if(picked){go('categories');picked.click();}};
    var launch=button('Tria un pla','wheel');launch.className='app-wheel-launch';launch.onclick=function(){
      var cards=choices(), size=360/cards.length;
      wheelDisc.innerHTML=''; wheelDisc.style.background='conic-gradient('+cards.map(function(card,i){var color=card.style.getPropertyValue('--mobile-home-accent')||'#34558c';return color+' '+(i*size)+'deg '+((i+1)*size)+'deg';}).join(',')+')';
      cards.forEach(function(card,i){var icon=document.createElement('span');icon.className='app-wheel-icon';icon.style.transform='rotate('+((i+.5)*size)+'deg) translateY(-105px) rotate(-'+((i+.5)*size)+'deg)';var title=card.querySelector('.home-day-label');var chip=Array.prototype.find.call(document.querySelectorAll('.winter-mobile-category-chip'),function(item){return title && item.textContent.trim()===title.textContent.trim();});var iconNode=chip&&chip.querySelector('svg');icon.innerHTML=iconNode?iconNode.outerHTML:svg('home');wheelDisc.appendChild(icon);});
      wheel.showModal();
    };
    var hero=document.querySelector('.nadal-cover-info');if(hero)hero.appendChild(launch);
    var intro=document.createElement('dialog');intro.className='app-onboarding';
    var steps=[['Benvingut a Nadal','Explora propostes d’hivern i descobreix què fem plegats.'],['Calendari','Consulta els plans amb data i les propostes pendents.'],['Mapa','Troba les ubicacions de les activitats.'],['Categories','Explora els plans agrupats per tipus.'],['Proposa i tria','Envia una idea o deixa que la ruleta triï una proposta.']]; var step=0;
    intro.innerHTML='<button class="app-skip" type="button">Saltar</button><div class="app-intro-icon">'+svg('home')+'</div><p class="app-intro-count"></p><h2></h2><p class="app-intro-copy"></p><div class="app-intro-dots" aria-hidden="true"></div><button class="app-intro-next" type="button"></button>';
    document.body.appendChild(intro);
    function paintIntro(){intro.querySelector('.app-intro-count').textContent=(step+1)+' / '+steps.length;intro.querySelector('h2').textContent=steps[step][0];intro.querySelector('.app-intro-copy').textContent=steps[step][1];intro.querySelector('.app-intro-dots').innerHTML=steps.map(function(_,i){return '<i'+(i===step?' class="active"':'')+'></i>';}).join('');intro.querySelector('.app-intro-next').textContent=step===steps.length-1?'Començar':'Següent';}
    function finishIntro(){try{localStorage.setItem('nadal_app_tutorial','1');}catch(e){}intro.close();}
    intro.querySelector('.app-skip').onclick=finishIntro;intro.querySelector('.app-intro-next').onclick=function(){if(step===steps.length-1)finishIntro();else{step++;paintIntro();}};
    var touchStart=0; intro.addEventListener('touchstart',function(e){touchStart=e.changedTouches[0].clientX;},{passive:true}); intro.addEventListener('touchend',function(e){var delta=e.changedTouches[0].clientX-touchStart;if(Math.abs(delta)>45){step=Math.max(0,Math.min(steps.length-1,step+(delta<0?1:-1)));paintIntro();}},{passive:true});
    var help=document.createElement('button');help.className='app-help';help.type='button';help.textContent='?';help.setAttribute('aria-label','Torna a veure el tutorial');help.onclick=function(){step=0;paintIntro();intro.showModal();};document.querySelector('.move-global-nav-controls').appendChild(help);
    go('home');
    return true;
  }
  if (!init()) { var observer=new MutationObserver(function(){if(init())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true}); }
})();
