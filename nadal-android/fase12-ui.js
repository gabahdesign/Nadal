(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  // The browser offer is separate from the installed app and never claims a missing APK exists.
  function offerDownload() {
    if (window.Capacitor?.isNativePlatform?.()) return;
    try { if(localStorage.getItem('nadal_apk_offer_seen')==='1')return; } catch (_) {}
    const overlay=document.createElement('section');overlay.className='app-download-offer';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','app-download-title');
    overlay.innerHTML='<div class="app-download-content"><span class="app-download-kicker">MOVE × LOBITOS</span><h1 id="app-download-title">Nadal, també al teu mòbil</h1><p>Descarrega l’app per tenir els plans d’hivern sempre a mà.</p><a class="app-download-button" href="./nadal.apk" download="nadal.apk" hidden>Descarrega l’APK</a><p class="app-download-status" role="status">Comprovant la disponibilitat de l’APK…</p><button class="app-download-continue" type="button">Continua a la web</button></div>';
    const close=()=>{try{localStorage.setItem('nadal_apk_offer_seen','1');}catch(_){}overlay.remove();};
    overlay.querySelector('.app-download-continue').addEventListener('click',close);overlay.querySelector('.app-download-button').addEventListener('click',close);document.body.appendChild(overlay);overlay.querySelector('.app-download-continue').focus();
    fetch('./nadal.apk',{method:'HEAD',cache:'no-store'}).then(response=>{const type=response.headers.get('content-type')||'';if(!response.ok||/text\/html/i.test(type))throw Error('APK unavailable');overlay.querySelector('.app-download-button').hidden=false;overlay.querySelector('.app-download-status').textContent='';}).catch(()=>{overlay.querySelector('.app-download-status').textContent='L’APK encara no està disponible. Pots continuar a la web.';});
  }
  offerDownload();
  const paths = {'→':'M5 12h14 M13 6l6 6-6 6','←':'M19 12H5 M11 6l-6 6 6 6','↗':'M7 17 17 7 M7 7h10v10','+':'M12 5v14 M5 12h14','＋':'M12 5v14 M5 12h14'};
  function svgFor(character) {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','app-inline-icon');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[character]);svg.appendChild(path);return svg;
  }
  function decorate() {
    const social=document.querySelector('.winter-mobile-social');
    if(social){const link=social.querySelector('a');if(link && link.textContent.includes('↗'))link.textContent=link.textContent.replace('↗','').trim();
      const shell=social.closest('.footer-shell');if(shell && !shell.querySelector('.app-instagram-art')){const art=document.createElementNS('http://www.w3.org/2000/svg','svg');art.setAttribute('viewBox','0 0 24 24');art.setAttribute('class','app-instagram-art');art.setAttribute('aria-hidden','true');art.innerHTML='<defs><linearGradient id="insta-body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f3dbbd"/><stop offset="1" stop-color="#bb8a68"/></linearGradient><radialGradient id="insta-lens"><stop stop-color="#559dba"/><stop offset=".5" stop-color="#1a394d"/><stop offset="1" stop-color="#101522"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="4.4" fill="url(#insta-body)"/><path d="M2 7V6.4A4.4 4.4 0 0 1 6.4 2h11.2A4.4 4.4 0 0 1 22 6.4V9H2Z" fill="#745044"/><path d="M5 2h1v7H5z" fill="#e45c4b"/><path d="M6 2h1v7H6z" fill="#f8c84a"/><path d="M7 2h1v7H7z" fill="#83b871"/><path d="M8 2h1v7H8z" fill="#5ea3c9"/><rect x="16.7" y="4.3" width="3.1" height="2.6" rx=".5" fill="#e8d5b9"/><circle cx="12" cy="13" r="6.1" fill="#d1c2aa"/><circle cx="12" cy="13" r="4.9" fill="#514d4c"/><circle cx="12" cy="13" r="3.9" fill="url(#insta-lens)"/><circle cx="10.8" cy="11.8" r="1" fill="#b3d5e0" opacity=".8"/>';shell.appendChild(art);}}
    const settings=document.querySelector('#winterSettings .winter-mobile-settings-links');
    if(settings && !settings.dataset.cardsReady){
      const instagram=settings.querySelector('a[href*="instagram.com"]'), coffee=settings.querySelector('[data-winter-mobile-link="coffee"]'), website=settings.querySelector('[data-winter-mobile-link="website"]');
      if(instagram && coffee && website){settings.dataset.cardsReady='true';settings.append(instagram,coffee,website);
        const art=document.querySelector('.footer-shell .app-instagram-art');if(art){const copy=art.cloneNode(true);copy.classList.add('app-settings-instagram-art');instagram.appendChild(copy);}
        const cup=document.createElementNS('http://www.w3.org/2000/svg','svg');cup.setAttribute('viewBox','0 0 64 64');cup.setAttribute('class','app-settings-coffee-art');cup.setAttribute('aria-hidden','true');cup.innerHTML='<path d="M14 22h31v17a13 13 0 0 1-13 13h-5a13 13 0 0 1-13-13z" fill="#e7c497"/><path d="M45 26h5a8 8 0 0 1 0 16h-6" fill="none" stroke="#e7c497" stroke-width="5"/><path d="M10 56h42M24 15c-5-5 4-7 0-12M36 15c-5-5 4-7 0-12" fill="none" stroke="#ffc83d" stroke-width="3" stroke-linecap="round"/>';coffee.appendChild(cup);
      }
    }
    document.querySelectorAll('button, a, summary').forEach(element=>{
      if(element.closest('.leaflet-control') || element.closest('.winter-mobile-social'))return;
      const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;const nodes=[];while((node=walker.nextNode()))if(/[→←↗＋+]/.test(node.data))nodes.push(node);
      nodes.forEach(text=>{const parts=text.data.split(/([→←↗＋]|(?<!\d)\+(?!\d))/);if(parts.length<2)return;const fragment=document.createDocumentFragment();parts.forEach(part=>{if(paths[part])fragment.appendChild(svgFor(part));else fragment.appendChild(document.createTextNode(part));});text.replaceWith(fragment);});
    });
  }
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();});};
  decorate();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
