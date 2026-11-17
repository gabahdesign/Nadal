(() => {
  if (!matchMedia('(max-width:760px)').matches) return;
  const key='tutorialVist';
  const steps=[
    {text:'Aquí trobaràs la introducció, les propostes i el calendari. Toca Calendari.', selector:'.app-bottom-nav [data-screen="calendar"]'},
    {text:'Els dies en verd són activitats confirmades. Els dies amb contorn daurat estan pendents de confirmar. Toca Activitats.', selector:'.app-bottom-nav [data-screen="categories"]'},
    {text:'Cada bloc és una categoria. Toca’n una per veure les seves activitats.', selector:'.app-category-grid .app-category-block'},
    {text:'Per tornar enrere, toca la fletxa de dalt a l’esquerra.', selector:'.app-categories-root .app-category-back'},
    {text:'Toca el mapa per veure tots els plans a Catalunya.', selector:'.app-bottom-nav [data-screen="map"]'},
    {text:'Toca un marcador per veure els detalls de l’activitat.', map:true},
    {text:'Des d’aquí pots proposar una activitat. Arriba al nostre correu i la revisarem.', selector:'.app-bottom-nav [data-screen="proposal"]'},
    {text:'Torna a Inici per descobrir la ruleta.', selector:'.app-bottom-nav [data-screen="home"]'},
    {text:'Si no saps què fer, gira la ruleta.', selector:'.app-home-wheel-card.app-wheel-launch'},
    {text:'Toca Girar i la ruleta triarà un pla.', selector:'.app-wheel-v2[open] .app-wheel-v2-spin'}
  ];
  const shell=document.createElement('div');shell.className='app-tour';
  const shades=Array.from({length:4},()=>{const e=document.createElement('div');e.className='app-tour-shade';shell.appendChild(e);return e;});
  const ring=document.createElement('div');ring.className='app-tour-ring';ring.setAttribute('aria-hidden','true');
  const card=document.createElement('section');card.className='app-tour-card';card.setAttribute('aria-label','Tutorial');
  const top=document.createElement('div');top.className='app-tour-top';const progress=document.createElement('span');const skip=document.createElement('button');skip.type='button';skip.textContent='Saltar';top.append(progress,skip);
  const text=document.createElement('p');text.setAttribute('aria-live','polite');const finishButton=document.createElement('button');finishButton.type='button';finishButton.className='app-tour-finish';finishButton.textContent='Començar';finishButton.hidden=true;
  card.append(top,text,finishButton);shell.append(ring,card);
  let active=false,index=0,target=null,advanceTimer=0,frame=0;
  const seen=()=>{try{return localStorage.getItem(key)==='1';}catch(_){return false;}};
  function finish(){active=false;clearTimeout(advanceTimer);cancelAnimationFrame(frame);shell.remove();target=null;try{localStorage.setItem(key,'1');}catch(_){} }
  skip.addEventListener('click',finish);finishButton.addEventListener('click',finish);
  function rectSet(el,left,top,width,height){Object.assign(el.style,{left:`${Math.max(0,left)}px`,top:`${Math.max(0,top)}px`,width:`${Math.max(0,width)}px`,height:`${Math.max(0,height)}px`});}
  function place(){
    if(!active||!target||!target.isConnected)return;
    const r=target.getBoundingClientRect(),pad=5,w=innerWidth,h=innerHeight;
    const left=Math.max(0,r.left-pad),right=Math.min(w,r.right+pad),topY=Math.max(0,r.top-pad),bottom=Math.min(h,r.bottom+pad);
    rectSet(shades[0],0,0,w,topY);rectSet(shades[1],0,bottom,w,h-bottom);rectSet(shades[2],0,topY,left,bottom-topY);rectSet(shades[3],right,topY,w-right,bottom-topY);rectSet(ring,left,topY,right-left,bottom-topY);
    const preferred=topY>h/2?topY-card.offsetHeight-12:bottom+12;
    card.style.top=`${Math.max(12,Math.min(h-card.offsetHeight-12,preferred))}px`;
  }
  function visibleMapTarget(){
    const map=document.querySelector('#app-map-canvas');if(!map)return null;const mr=map.getBoundingClientRect();
    const visible=selector=>[...map.querySelectorAll(selector)].find(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.left>=mr.left&&r.right<=mr.right&&r.top>=mr.top&&r.bottom<=mr.bottom;});
    return visible('.app-map-pin-container')||visible('.app-map-cluster-container')||null;
  }
  function mountFor(element){const parent=element?.closest('dialog[open]')||document.body;if(shell.parentNode!==parent)parent.appendChild(shell);}
  function draw(attempt=0){
    if(!active)return;
    const step=steps[index];
    if(!step){showFinish();return;}
    if(step.map && attempt===0)document.querySelector('#app-map-canvas')?.scrollIntoView({block:'center',behavior:'instant'});
    const found=step.map?visibleMapTarget():document.querySelector(step.selector);
    if(!found || !found.getBoundingClientRect().width){
      if(attempt<60){advanceTimer=setTimeout(()=>draw(attempt+1),100);return;}
      mountFor(null);target=null;ring.style.display='none';shades.forEach((shade,i)=>rectSet(shade,0,0,i===0?innerWidth:0,i===0?innerHeight:0));progress.textContent=`${index+1} / ${steps.length}`;text.textContent='No s’ha pogut mostrar aquest pas. Pots sortir amb «Saltar».';card.style.top='20px';return;
    }
    target=found;mountFor(found);ring.style.display='block';finishButton.hidden=true;skip.hidden=false;progress.textContent=`${index+1} / ${steps.length}`;
    text.textContent=step.map && found.classList.contains('app-map-cluster-container')?'Toca un grup de punts per ampliar el mapa; després toca un marcador.':step.text;
    if(!step.map && !found.closest('.app-bottom-nav') && !found.closest('dialog'))found.scrollIntoView({block:'center',behavior:'instant'});
    frame=requestAnimationFrame(()=>{place();target?.focus({preventScroll:true});});
  }
  function showFinish(){
    target=null;ring.style.display='none';mountFor(document.querySelector('.app-wheel-v2[open]'));
    shades.forEach((shade,i)=>rectSet(shade,0,0,i===0?innerWidth:0,i===0?innerHeight:0));
    progress.textContent='';text.textContent='Ja ho tens! Pots tornar a veure aquest tutorial a Ajustos.';skip.hidden=true;finishButton.hidden=false;card.style.top='25%';finishButton.focus();
  }
  function start(){
    if(active)return;const home=document.querySelector('.app-bottom-nav [data-screen="home"]');if(!home){advanceTimer=setTimeout(start,100);return;}
    if(document.body.dataset.appScreen!=='home')home.click();index=0;active=true;document.body.appendChild(shell);draw();
  }
  document.addEventListener('click',event=>{
    if(!active||!target||!(event.target instanceof Element)||!target.contains(event.target))return;
    const wasCluster=steps[index].map&&target.classList.contains('app-map-cluster-container');
    target=null;ring.style.display='none';
    if(wasCluster){advanceTimer=setTimeout(()=>draw(1),500);return;}
    index++;
    if(index===steps.length){text.textContent='Girant…';advanceTimer=setTimeout(showFinish,4700);}
    else advanceTimer=setTimeout(()=>draw(),180);
  },true);
  addEventListener('resize',place);addEventListener('scroll',place,true);
  document.addEventListener('nadal-tutorial-replay',start);
  document.addEventListener('nadal-intro-finished',()=>{if(!seen())start();});
  function autoStart(){if(!seen()&&!document.querySelector('.nadal-intro'))start();}
  if(window.NadalActivities?.getAll().length)autoStart();else document.addEventListener('nadal-activities-ready',autoStart,{once:true});
})();
