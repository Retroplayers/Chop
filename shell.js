(function(){
const C=window.Chop,scr=document.getElementById('scr'),KEY='chop.alex.v1';
const T=['sheet','snack','undo','kgt','erow'];
function load(){try{const j=localStorage.getItem(KEY);if(j){const o=JSON.parse(j);T.forEach(k=>o[k]=null);if(!o.nv){o.nv=2;if(o.next==='H1'&&(o.hist||[]).length<=3)o.next='H2'}if(!o.screen||['premiere','stop'].includes(o.screen)&&!o.ex)o.screen='auj';return o}}catch(_){}return C.init('alex')}
let s=load(),sv=null;
function save(){clearTimeout(sv);sv=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify({...s,snack:null,sheet:null,undo:null}))}catch(_){}},150)}
function draw(keep){const st=scr.scrollTop,f=document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.in;scr.innerHTML=C.render(s);if(keep)scr.scrollTop=st;if(f){const el=scr.querySelector('[data-in="'+f+'"]');if(el&&el.type!=='range'){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch(_){}}}save();wake()}
let snT=null;function snack(){if(!s.snack)return;const k=s.snack;clearTimeout(snT);snT=setTimeout(()=>{if(s.snack===k){s.snack=null;draw(1)}},5000)}
// minuteur réel : fin du repos en heure absolue, même si l'écran s'éteint
function syncRest(a){if(!s.rest)return;if(s.rest.end==null||a==='restp'||a==='restm')s.rest.end=Date.now()+s.rest.left*1000}
let ac=null;function bip(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();[0,0.25,0.5].forEach(t=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;g.gain.setValueAtTime(0.0001,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(0.4,ac.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+t+0.2);o.connect(g).connect(ac.destination);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+0.22)})}catch(_){}try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(_){}}
function finRepos(){bip();if(document.hidden&&'serviceWorker' in navigator&&window.Notification&&Notification.permission==='granted')navigator.serviceWorker.ready.then(r=>r.showNotification('Chop',{body:'Repos fini : série suivante.',tag:'repos',renotify:true,vibrate:[300,150,300]})).catch(()=>{})}
setInterval(()=>{if(!s.rest)return;if(s.rest.end==null)syncRest();const left=Math.ceil((s.rest.end-Date.now())/1000);if(left<=0){s.rest.left=1;s=C.act(s,'tick');finRepos();draw(1);snack();return}if(left!==s.rest.left){s.rest.left=left;if(['exercice','seance'].includes(s.screen)&&!s.sheet){const t=scr.querySelector('.rest .rt b'),b=scr.querySelector('.rest .rbar i');if(t&&b){t.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');b.style.width=(100*left/s.rest.tot)+'%'}else draw(1)}}},500);
// écran allumé pendant la séance
let wl=null;function wake(){if(!('wakeLock' in navigator))return;if(s.sess&&!wl&&!document.hidden)navigator.wakeLock.request('screen').then(l=>{wl=l;l.addEventListener('release',()=>{wl=null})}).catch(()=>{});if(!s.sess&&wl){wl.release().catch(()=>{});wl=null}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){wake();if(s.rest)draw(1)}});
// sauvegarde / restauration
function exporter(){const b=new Blob([JSON.stringify({...s,snack:null,sheet:null,undo:null},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='chop-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);s.snack='Copie enregistrée dans tes téléchargements.';draw(1);snack()}
function importer(){const i=document.createElement('input');i.type='file';i.accept='application/json,.json';i.onchange=()=>{const f=i.files[0];if(!f)return;f.text().then(t=>{const o=JSON.parse(t);if(!o.prog||!o.hist)throw 0;T.forEach(k=>o[k]=null);o.screen='auj';s=o;s.snack='Copie remise : '+s.hist.length+' séances.';draw();snack()}).catch(()=>{s.snack="Ce fichier n'est pas une copie de Chop.";draw(1);snack()})};i.click()}
// retour Android : ferme le panneau ou revient en arrière dans l'appli
try{history.replaceState({c:1},'');history.pushState({c:2},'')}catch(_){}
addEventListener('popstate',()=>{try{history.pushState({c:2},'')}catch(_){}if(s.sheet){s=C.act(s,'close');draw(1);return}const b=scr.querySelector('.tab > .ib');if(b)b.click()});
let tF=0;
scr.addEventListener('click',ev=>{const t=ev.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a;
 if(a==='export'){exporter();return}if(a==='import'){importer();return}
 if(a==='faite'){const n=Date.now();if(n-tF<900)return;tF=n;if(window.Notification&&Notification.permission==='default')Notification.requestPermission().catch(()=>{})}
 const prev=s.screen;s=C.act(s,a,t.dataset.v);syncRest(a);draw(s.screen===prev);
 if(s.screen!==prev){scr.scrollTop=0;if(s.screen==='exercice')voirNext()}else if(s.screen==='exercice'&&['faite','zone','malok','fichemaj','fichecorr','corrno','defaire','undo','swap'].includes(a))voir();snack()});
function voirNext(){const ft=scr.querySelector('.ft'),r=scr.querySelector('.sets .row.todo');if(!r||!scr.querySelector('.sets .row:not(.todo)'))return;const lim=ft?ft.getBoundingClientRect().top:innerHeight;const d=r.getBoundingClientRect().bottom-lim+12;if(d>0)scr.scrollTop+=d}
function voir(){const ft=scr.querySelector('.ft'),L=scr.querySelectorAll('.sets .corr,.sets .after,.sets .row:not(.todo)');if(!L.length)return;const lim=ft?ft.getBoundingClientRect().top:innerHeight;const el=L[L.length-1],d=el.getBoundingClientRect().bottom-lim+12;if(d>0)scr.scrollTop+=d}
scr.addEventListener('keydown',ev=>{const t=ev.target.closest('[data-a]');if(t&&(ev.key==='Enter'||ev.key===' ')&&t.tagName!=='BUTTON'){ev.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
scr.addEventListener('input',ev=>{const t=ev.target,k=t.dataset.in;if(!k)return;
 if(k==='seuil'||k==='mal'){s[k]=+t.value;const sp=t.parentNode.querySelector('.num');if(sp){sp.textContent=k==='seuil'?t.value+' / 10':t.value;sp.classList.toggle('erc',k==='mal'&&+t.value>s.seuil)}if(k==='mal'){const ok=scr.querySelector('[data-a="malok"]');if(ok)ok.disabled=false}save();return}
 if(/^(nm|sdate|fv)/.test(k)){s=C.act(s,'inp',k+'|'+t.value);if(k==='nmnom'||k==='nmbase')draw(1);else save();return}
 if(k==='kgv'){s.kgt.val=t.value;return}if(k==='nom')s.user.nom=t.value;else if(k==='snom')s.edit.nom=t.value;else if(k==='q')s.q=t.value;else if(k==='snote'){if(s.sess)s.sess.note=t.value;save();return}draw(1)});
scr.addEventListener('pointerup',ev=>{const t=ev.target;if(t.dataset&&t.dataset.in==='mal'&&s.mal==null)t.dispatchEvent(new Event('input',{bubbles:true}))});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&s.sheet){s=C.act(s,'close');draw(1)}});
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__chop={get s(){return s}};
draw();})();
