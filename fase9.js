(() => {
  if (!matchMedia('(max-width:760px)').matches) return;
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
  function init(){
    const launch=document.querySelector('.app-wheel-launch');
    if (!launch || !window.NadalActivities || !window.NadalWheelDates) return false;
    const dialog=make('dialog','app-wheel-v2');dialog.setAttribute('aria-labelledby','wheel-v2-title');
    const head=make('div','app-wheel-v2-head');const title=make('h2','','Tria un pla');title.id='wheel-v2-title';const close=make('button','app-wheel-v2-close','×');close.type='button';close.setAttribute('aria-label','Tanca');head.append(title,close);
    const settings=make('details','app-wheel-v2-settings');
    const settingsToggle=make('summary','app-wheel-v2-settings-toggle');
    settingsToggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6"/></svg><span>Ajustos de categories</span>';
    const settingsBody=make('div','app-wheel-v2-settings-body');
    settingsBody.appendChild(make('p','','Tria les categories que vols incloure a la ruleta.'));
    const categoryList=make('div','app-wheel-v2-category-list');settingsBody.appendChild(categoryList);settings.append(settingsToggle,settingsBody);
    const allCategories=[...window.NadalActivities.getCategories().map(c=>c[0]),'Gran quedada de Nadal'];
    let selected=new Set(allCategories);
    try { const saved=JSON.parse(localStorage.getItem('nadal_wheel_categories')); if(Array.isArray(saved)) selected=new Set(saved.filter(x=>allCategories.includes(x))); } catch (_) {}
    allCategories.forEach(name=>{const label=make('label','app-wheel-v2-category');const input=document.createElement('input');input.type='checkbox';input.checked=selected.has(name);input.addEventListener('change',()=>{if(spinning){input.checked=selected.has(name);return;}if(input.checked)selected.add(name);else selected.delete(name);try{localStorage.setItem('nadal_wheel_categories',JSON.stringify([...selected]));}catch(_){}spin.textContent='Girar';paint();});label.append(input,make('span','',name));categoryList.appendChild(label);});
    const intro=make('p','app-wheel-v2-intro','Activitats vigents i futures amb dates conegudes.');
    const stage=make('div','app-wheel-v2-stage');const pointer=make('span','app-wheel-v2-pointer');pointer.setAttribute('aria-hidden','true');const disc=make('div','app-wheel-v2-disc');disc.setAttribute('aria-hidden','true');stage.append(pointer,disc);
    const legend=make('ol','app-wheel-v2-legend');legend.setAttribute('aria-label','Activitats de la ruleta');
    const message=make('p','app-wheel-v2-message');message.setAttribute('aria-live','polite');
    const result=make('div','app-wheel-v2-result');result.setAttribute('aria-live','polite');
    const spin=make('button','app-wheel-v2-spin','Girar');spin.type='button';const view=make('button','app-wheel-v2-view','Veure activitat');view.type='button';view.hidden=true;
    dialog.append(head,intro,settings,stage,legend,message,result,spin,view);document.body.appendChild(dialog);
    let choices=[], picked=null, angle=0, timer=null, spinning=false;
    const colorFor=item=>(window.NadalActivities.getCategories().find(c=>c[0]===item.categoria)||['','#d6b900'])[1];
    const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
    function candidates(){return window.NadalActivities.getAll().filter(item=>selected.has(item.categoria) && window.NadalWheelDates.eligible(item));}
    function paint(){
      choices=shuffle(candidates()).slice(0,12);picked=null;result.replaceChildren();view.hidden=true;legend.replaceChildren();disc.replaceChildren();
      spin.disabled=!choices.length;stage.hidden=!choices.length;
      message.textContent=choices.length ? '' : (selected.size ? 'No hi ha activitats amb dates vigents o futures per a les categories seleccionades.' : 'Selecciona almenys una categoria als ajustos.');
      if (!choices.length) return;
      const size=360/choices.length;disc.style.background=`conic-gradient(${choices.map((item,i)=>`${colorFor(item)} ${i*size}deg ${(i+1)*size}deg`).join(',')})`;
      choices.forEach((item,i)=>{
        const number=make('span','app-wheel-v2-number'); const chip=[...document.querySelectorAll('.winter-mobile-category-chip')].find(x=>x.textContent.trim()===item.categoria); const icon=chip?.querySelector('svg'); if(icon) number.appendChild(icon.cloneNode(true)); number.appendChild(make('span','',String(i+1)));number.style.transform=`rotate(${(i+.5)*size}deg) translateY(-105px) rotate(-${(i+.5)*size}deg)`;disc.appendChild(number);
        const li=make('li','','');const bullet=make('span','',String(i+1));bullet.style.background=colorFor(item);li.append(bullet,document.createTextNode(item.titol));legend.appendChild(li);
      });
    }
    launch.onclick=()=>{spin.textContent='Girar';paint();dialog.showModal();};
    settingsToggle.addEventListener('click',event=>{if(spinning)event.preventDefault();});
    close.onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{clearTimeout(timer);spinning=false;spin.disabled=false;settingsToggle.removeAttribute('aria-disabled');disc.style.transition='none';});
    spin.onclick=()=>{
      if(spinning)return;
      // Recheck against the clock each time, including after midnight.
      if (picked || choices.some(item=>!window.NadalWheelDates.eligible(item))) paint();
      if(!choices.length)return;
      const index=Math.floor(Math.random()*choices.length);picked=choices[index];const size=360/choices.length;
      const destination=(360-((index+.5)*size))%360;angle+=1800+((destination-(angle%360)+360)%360);
      const reduced=document.documentElement.classList.contains('winter-motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
      disc.style.transition=reduced?'none':'transform 4.5s cubic-bezier(.12,.65,.12,1)';disc.style.transform=`rotate(${angle}deg)`;
      spinning=true;spin.disabled=true;settingsToggle.setAttribute('aria-disabled','true');message.textContent='Girant…';
      timer=setTimeout(()=>{spinning=false;spin.disabled=false;settingsToggle.removeAttribute('aria-disabled');spin.textContent='Girar una altra vegada';message.textContent='';const card=window.NadalActivities.compact(picked,{returnScreen:'home',moveDate:true}); card.addEventListener('click',()=>dialog.close(),true); result.appendChild(card);view.hidden=false;},reduced?0:4500);
    };
    view.onclick=()=>{const id=picked?.id;if(!id)return;dialog.close();window.NadalActivities.open(id,()=>document.querySelector('.app-bottom-nav [data-screen="home"]')?.click());};
    return true;
  }
  if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
})();
