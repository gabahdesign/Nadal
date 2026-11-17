(() => {
  if (!matchMedia('(max-width:760px)').matches) return;
  function init(){
    const dialog=document.querySelector('#winterSettings');
    const motion=document.querySelector('#winterMotionToggle');
    const links=dialog?.querySelector('.winter-mobile-settings-links');
    if(!dialog||!motion||!links||dialog.dataset.appSettingsReady)return !!dialog?.dataset.appSettingsReady;
    dialog.dataset.appSettingsReady='true';
    const key='nadal_motion_enabled';
    try { const saved=localStorage.getItem(key);if(saved==='0'||saved==='1'){const enabled=saved==='1';document.documentElement.classList.toggle('winter-motion-off',!enabled);document.body.classList.toggle('winter-motion-off',!enabled);motion.setAttribute('aria-checked',String(enabled));} } catch(_) {}
    motion.addEventListener('click',()=>{try{localStorage.setItem(key,motion.getAttribute('aria-checked')==='true'?'1':'0');}catch(_){} });
    const website=links.querySelector('[data-winter-mobile-link="website"]');
    if(website){website.href='https://descobreix.com/move';website.target='_blank';website.rel='noopener noreferrer';}
    const tutorial=document.createElement('button');tutorial.type='button';tutorial.className='app-settings-action';tutorial.textContent='Tornar a veure el tutorial';
    tutorial.addEventListener('click',()=>{dialog.close();document.querySelector('.app-help')?.click();});
    const rules=document.createElement('details');rules.className='app-settings-rules';
    const summary=document.createElement('summary');summary.textContent='Normes del grup i espai segur';
    const body=document.createElement('div');body.className='app-settings-rules-body';rules.append(summary,body);
    function populateRules(){
      const sections=document.querySelectorAll('#home .app-home-accordion-content');
      if(sections.length<2)return;
      body.replaceChildren();['Com ens organitzem','Un espai segur i respectuós'].forEach((name,i)=>{
        const title=document.createElement('h3');title.textContent=name;body.appendChild(title);
        sections[i].querySelectorAll('p.home-text').forEach(p=>{
          if(p.getAttribute('data-project-lang')==='es')return;
          const copy=p.cloneNode(true);copy.removeAttribute('id');body.appendChild(copy);
        });
      });
    }
    rules.addEventListener('toggle',()=>{if(rules.open)populateRules();});
    links.after(tutorial,rules);
    return true;
  }
  if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect();});observer.observe(document.body,{subtree:true,childList:true});}
})();
