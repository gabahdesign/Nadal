import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const source = resolve(root, '..');
const output = resolve(root, 'www');
await mkdir(output, { recursive: true });
let html = await readFile(resolve(source, 'nadal-app.html'), 'utf8');
html = html.replaceAll('/move/images/', './images/').replaceAll('/move/move-logo.png', './move-logo.png');
html = html.replace('src="nadal-app.js"', 'src="nadal-app.js?v=map-navigation-2"');
// Expose the existing route renderer to the mobile detail without changing desktop source.
html = html.replace('function renderQuedadaRouteMap() {', 'function renderQuedadaRouteMap(mapCanvas, legend) {')
  .replace("var mapCanvas = document.getElementById('quedadaRouteMap');", "mapCanvas = mapCanvas || document.getElementById('quedadaRouteMap');")
  .replace("var legend = document.getElementById('quedadaRouteMapKey');", "legend = legend || document.getElementById('quedadaRouteMapKey');")
  .replace("var routeLine = L.polyline(routePoints, { color:'#246fa7'", "var routeLine = L.polyline(routePoints, { color:mapCanvas.closest('.app-gathering') ? '#c7982b' : '#246fa7'")
  .replace('  function renderProjectCalendar() {', '  window.NadalRenderQuedadaRouteMap = renderQuedadaRouteMap;\n  function renderProjectCalendar() {')
  .replace("kind:'market', ca:'NADAL AL PORT', es:'NAVIDAD EN EL PUERTO'", "kind:'route', ca:'Time Out Market · Maremagnum', es:'Time Out Market · Maremagnum'");
html = html.replace('</head>', '<link rel="stylesheet" href="./vendor/leaflet/leaflet.css"><link rel="stylesheet" href="./vendor/markercluster/MarkerCluster.css"><link rel="stylesheet" href="./fase1.css"><link rel="stylesheet" href="./fase2.css?v=calendar-fix-1"><link rel="stylesheet" href="./fase3.css"><link rel="stylesheet" href="./fase4.css?v=special-4"><link rel="stylesheet" href="./fase5.css?v=confirmed-1"><link rel="stylesheet" href="./fase6.css?v=2"><link rel="stylesheet" href="./fase7.css?v=3"><link rel="stylesheet" href="./fase8.css?v=2"><link rel="stylesheet" href="./fase9.css?v=2"><link rel="stylesheet" href="./fase10.css?v=1"><link rel="stylesheet" href="./fase11.css?v=3"><script defer src="./vendor/leaflet/leaflet.js"></script><script defer src="./vendor/markercluster/leaflet.markercluster.js"></script></head>').replace('</body>', '<script src="./fase1.js"></script><script src="./fase3.js"></script><script src="./fase5.js"></script><script src="./fase4.js?v=special-2"></script><script src="./fase6.js?v=2"></script><script defer src="./fase7.js?v=3"></script><script src="./fase8.js?v=2"></script><script src="./fase9-data.js?v=1"></script><script src="./fase9.js?v=2"></script><script src="./fase10.js?v=1"></script><script src="./fase11.js?v=1"></script></body>');
await writeFile(resolve(output, 'index.html'), html);
for (const name of ['nadal-app.css', 'move-logo.png', 'images']) {
  await cp(resolve(source, name), resolve(output, name), { recursive: true });
}
// The legacy app automatically opens an older onboarding dialog. Keep the
// help entry point, but let the new introduction own the first launch.
const legacyScript = await readFile(resolve(source, 'nadal-app.js'), 'utf8');
const legacyAutoOpen = "go('home'); try{if(!localStorage.getItem('nadal_app_tutorial')){paintIntro();intro.showModal();}}catch(e){paintIntro();intro.showModal();}";
if (!legacyScript.includes(legacyAutoOpen)) throw new Error('Legacy onboarding hook was not found.');
const oldOptions = "var options=[['Inici','home'],['Calendari','calendar'],['Mapa','map'],['Categories','categories'],['Proposar','proposal']];";
const newOptions = "var options=[['Inici','home'],['Calendari','calendar'],['Proposar','proposal'],['Activitats','categories'],['Mapa','map']];";
const oldTarget = "var b=originalDock.querySelector(target); if(b) b.click();";
const newTarget = "if(which==='calendar'||which==='map'){var activitiesPage=document.getElementById('winterMobileActivitiesPage');if(activitiesPage) activitiesPage.hidden=true;} var b=(which==='calendar'||which==='map')?null:originalDock.querySelector(target); if(b) b.click();";
if (!legacyScript.includes(oldOptions) || !legacyScript.includes(oldTarget)) throw new Error('Legacy navigation hook was not found.');
await writeFile(resolve(output, 'nadal-app.js'), legacyScript.replace(legacyAutoOpen, "go('home');").replace(oldOptions, newOptions).replace(oldTarget, newTarget));

for (const name of ['fase1.css', 'fase1.js', 'fase2.css', 'fase3.css', 'fase3.js', 'fase4.css', 'fase4.js', 'fase5.css', 'fase5.js', 'fase6.css', 'fase6.js', 'fase7.css', 'fase7.js', 'fase8.css', 'fase8.js', 'fase9.css', 'fase9.js', 'fase9-data.js', 'fase10.css', 'fase10.js', 'fase11.css', 'fase11.js', 'proposal-config.json', 'activitats.json']) await cp(resolve(root, name), resolve(output, name));
await cp(resolve(root,'node_modules/leaflet/dist'), resolve(output,'vendor/leaflet'), {recursive:true});
await cp(resolve(root,'node_modules/leaflet.markercluster/dist'), resolve(output,'vendor/markercluster'), {recursive:true});
