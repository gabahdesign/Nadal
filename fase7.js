(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  // Touch keeps native momentum scrolling; pointer dragging adds the same
  // interaction for a mouse without turning a drag into a button click.
  const rails='.app-map-filters,.app-category-months,.app-calendar-v2-months,.app-calendar-v2-scroll';
  let drag=null, suppressClick=false;
  document.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0||!(event.target instanceof Element))return;const rail=event.target.closest(rails);if(!rail||rail.scrollWidth<=rail.clientWidth)return;drag={rail,start:event.clientX,scroll:rail.scrollLeft,moved:false};},true);
  document.addEventListener('pointermove',event=>{if(!drag)return;const distance=event.clientX-drag.start;if(Math.abs(distance)>5){drag.moved=true;drag.rail.classList.add('app-scroll-dragging');drag.rail.scrollLeft=drag.scroll-distance;event.preventDefault();}},true);
  document.addEventListener('pointerup',()=>{if(!drag)return;suppressClick=drag.moved;drag.rail.classList.remove('app-scroll-dragging');drag=null;if(suppressClick)setTimeout(()=>{suppressClick=false;},0);},true);
  document.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
  const root=el('main','app-map-screen');root.id='app-map-v2';root.setAttribute('aria-label','Mapa');
  const title=el('h1','app-map-title','Mapa');
  const copy=el('p','app-map-copy','Consulta al mapa les ubicacions contrastades i, a la llista, tots els plans.');
  const count=el('p','app-map-count','Carregant ubicacions…'); count.setAttribute('aria-live','polite');
  const precision=el('p','app-map-precision','Algunes coordenades són aproximades.');
  const filters=el('nav','app-map-filters');filters.setAttribute('aria-label','Filtra per categoria');
  const mapFrame=el('div','app-map-frame'); const mapNode=el('div','app-map-canvas');mapNode.id='app-map-canvas';mapNode.setAttribute('aria-label','Mapa de les activitats');mapFrame.appendChild(mapNode);
  const center=el('button','app-map-center','Centrar a Catalunya');center.type='button';
  const status=el('p','app-map-status','');status.setAttribute('role','status');status.hidden=true;
  const sheet=el('section','app-map-sheet');sheet.hidden=true;sheet.setAttribute('aria-label','Activitat seleccionada');
  const sheetToggle=el('button','app-map-sheet-handle','');sheetToggle.type='button';sheetToggle.setAttribute('aria-label','Ampliar o reduir la fitxa');sheetToggle.setAttribute('aria-expanded','false');
  const sheetContent=el('div','app-map-sheet-content');sheet.append(sheetToggle,sheetContent);mapFrame.append(center,status,sheet);
  const directory=el('details','app-map-directory');const summary=el('summary','','Llista d’ubicacions i enllaços per arribar-hi');const directoryContent=el('div','app-map-directory-content');directory.append(summary,directoryContent);
  root.append(title,copy,count,precision,filters,mapFrame,directory);
  let map=null, group=null, category=null, selected=null, tileErrors=0;
  const activities=()=>window.NadalActivities?.getAll() || [];
  const categories=()=>window.NadalActivities?.getCategories() || [];
  const valid=x=>x.ubicacioVerificada===true&&Number.isFinite(x.lat)&&Number.isFinite(x.lng)&&Math.abs(x.lat)<=90&&Math.abs(x.lng)<=180;
  const color=x=>categories().find(c=>c[0]===x.categoria)?.[1] || '#d6b900';
  function button(label,pressed,onClick,colorValue){const b=el('button',pressed?'selected':'');b.type='button';b.setAttribute('aria-pressed',String(pressed));if(colorValue){const dot=el('i','');dot.style.background=colorValue;dot.setAttribute('aria-hidden','true');b.appendChild(dot);}b.append(document.createTextNode(label));b.addEventListener('click',onClick);return b;}
  function drawFilters(){
    filters.replaceChildren();filters.appendChild(button('Totes',!category,()=>{category=null;refresh();}));
    categories().filter(c=>activities().some(x=>x.categoria===c[0]&&valid(x))).forEach(c=>filters.appendChild(button(c[0],category===c[0],()=>{category=c[0];refresh();},c[1])));
  }
  function detail(item){const previousScroll=window.scrollY;window.NadalActivities.open(item.id,()=>{document.querySelector('.app-bottom-nav [data-screen="map"]')?.click();requestAnimationFrame(()=>window.scrollTo(0,previousScroll));});}
  function showSheet(item){
    selected=item;sheet.hidden=false;sheet.classList.remove('expanded');sheetToggle.setAttribute('aria-expanded','false');sheetContent.replaceChildren();
    const compact=window.NadalActivities.compact(item,{returnScreen:'map'});const badge=el('p','app-map-sheet-category',item.categoria);badge.style.borderColor=color(item);
    const data=el('div','app-map-facts');const state=String(item.estat||'').toLowerCase()==='confirmada'?'Confirmada':'Pendent de confirmar';
    [["Lloc",item.lloc],["Data",item.trobadaMove?.data || item.periode || 'Pendent de confirmar'],["Estat",state]].forEach(([name,value])=>{const cell=el('span','');cell.append(el('b','',name),el('span','',value));data.appendChild(cell);});
    const more=el('button','app-map-details','Veure detall');more.type='button';more.addEventListener('click',()=>detail(item));
    const close=el('button','app-map-close','×');close.type='button';close.setAttribute('aria-label','Tanca la fitxa');close.addEventListener('click',()=>{sheet.hidden=true;selected=null;});
    const precisionNote=el('p','app-map-sheet-precision',item.precisioCoordenades || '');
    sheetContent.append(close,badge,compact,data,precisionNote,more);
  }
  function setExpanded(open){sheet.classList.toggle('expanded',open);sheetToggle.setAttribute('aria-expanded',String(open));}
  let startY=null, didSwipe=false;
  sheetToggle.addEventListener('click',()=>{if(didSwipe){didSwipe=false;return;}setExpanded(!sheet.classList.contains('expanded'));});
  sheetToggle.addEventListener('touchstart',e=>{startY=e.changedTouches[0].clientY;didSwipe=false;},{passive:true});sheetToggle.addEventListener('touchend',e=>{if(startY===null)return;const delta=e.changedTouches[0].clientY-startY;if(Math.abs(delta)>25){didSwipe=true;setExpanded(delta<0);}startY=null;},{passive:true});
  function drawDirectory(items){
    directoryContent.replaceChildren();items.forEach(item=>{const row=el('div','app-map-directory-row');const name=el('button','',item.titol+(valid(item)?'':' · ubicació pendent de validar'));name.type='button';name.addEventListener('click',()=>{if(!map||!valid(item)){detail(item);return;}map.setView([item.lat,item.lng],13);showSheet(item);mapFrame.scrollIntoView({behavior:'smooth',block:'center'});});row.append(name);if(item.mapsUrl&&valid(item)){const link=el('a','','Com arribar-hi');link.href=item.mapsUrl;link.target='_blank';link.rel='noopener noreferrer';row.appendChild(link);}directoryContent.appendChild(row);});
  }
  function refresh(){
    if(!map||!group)return;
    const all=activities().filter(valid);const shown=all.filter(x=>!category||x.categoria===category);const unique=new Set(all.map(x=>`${x.lat},${x.lng}`)).size;const pending=activities().filter(x=>!valid(x));
    count.textContent=category?`${shown.length} plans amb ubicació contrastada · ${category}`:`${all.length} plans amb ubicació contrastada · ${unique} punts diferents`;
    precision.textContent=`${pending.length} plans sense coordenades contrastades: consulta la llista. Alguns punts són orientatius dins del recinte.`;
    drawFilters();drawDirectory(activities().filter(x=>!category||x.categoria===category));group.clearLayers();sheet.hidden=true;selected=null;
    shown.forEach(item=>{
      const pin=L.divIcon({className:'app-map-pin-container',html:'<span class="app-map-pin" style="--pin-color:'+color(item)+'"></span>',iconSize:[44,44],iconAnchor:[22,22]});
      const marker=L.marker([item.lat,item.lng],{icon:pin,title:item.titol,alt:item.titol,keyboard:true});marker.on('click',()=>showSheet(item));group.addLayer(marker);
    });
  }
  function initMap(){
    if(map){setTimeout(()=>map.invalidateSize(),100);return;}
    if(!window.L || !L.markerClusterGroup){status.hidden=false;status.textContent='No s’ha pogut carregar el mapa. La llista d’ubicacions continua disponible.';const items=activities().filter(valid);count.textContent=items.length+' plans amb ubicació';drawDirectory(activities().filter(x=>!category||x.categoria===category));return;}
    map=L.map(mapNode,{zoomControl:false,zoomSnap:.5}).setView([41.8,1.8],7.5);
    L.control.zoom({position:'topright'}).addTo(map);
    const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'});
    tiles.on('tileerror',()=>{if(++tileErrors>=4){status.hidden=false;status.textContent='No es poden carregar les imatges del mapa. Comprova la connexió.';}});
    tiles.on('tileload',()=>{tileErrors=0;status.hidden=true;});tiles.addTo(map);
    group=L.markerClusterGroup({showCoverageOnHover:false,spiderfyOnMaxZoom:true,maxClusterRadius:46,iconCreateFunction:cluster=>L.divIcon({className:'app-map-cluster-container',html:'<span class="app-map-cluster">'+cluster.getChildCount()+'</span>',iconSize:[48,48]})});map.addLayer(group);
    center.addEventListener('click',()=>map.setView([41.8,1.8],7.5));refresh();setTimeout(()=>map.invalidateSize(),100);
  }
  function init(){
    const button=document.querySelector('.app-bottom-nav [data-screen="map"]');if(!button || !window.NadalActivities)return false;
    document.body.appendChild(root);button.addEventListener('click',()=>requestAnimationFrame(initMap));
    document.addEventListener('nadal-activities-ready',()=>{if(map)refresh();else if(document.body.dataset.appScreen==='map')initMap();});
    if(document.body.dataset.appScreen==='map')requestAnimationFrame(initMap);return true;
  }
  if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
})();
