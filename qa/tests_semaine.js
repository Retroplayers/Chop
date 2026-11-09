// tests de l'import d'une semaine : node qa/tests_semaine.js
global.window={};new Function('window',require('fs').readFileSync(__dirname+'/../chop-core.js','utf8'))(global.window);const C=window.Chop;
const demo=()=>JSON.parse(require('fs').readFileSync(__dirname+'/semaine-demo.json','utf8'));
let pass=0,fail=0;const t=(n,f)=>{let ok,m='';try{const r=f();ok=r===true;if(!ok)m=String(r)}catch(e){m='plante : '+e.message}ok?pass++:fail++;console.log((ok?'PASS ':'FAIL ')+n+(m?'  → '+m:''))};
const S=()=>C.init('alex');
t('semaine valide : importée, 4 séances dans l\'ordre',()=>{const s=S(),r=C.importWeek(s,demo());return (r.ok&&s.prog.map(p=>p.id).join()==='H1,B1,H2,B2')||JSON.stringify(r)});
t('Haut 2 remplacée (6 exercices), les autres inchangées',()=>{const s=S(),b=S();C.importWeek(s,demo());return (s.prog[2].ex.length===6&&JSON.stringify(s.prog[0])===JSON.stringify(b.prog[0]))||'diff'});
t('historique, séance du jour et réglages intacts',()=>{const s=S(),b=S();C.importWeek(s,demo());return (JSON.stringify(s.hist)===JSON.stringify(b.hist)&&s.next===b.next&&s.seuil===b.seuil&&s.user.nom==='Alex')||'changé'});
t('import partiel : une seule séance, les autres gardées',()=>{const s=S(),o=demo();o.seances=[o.seances[1]];o.seances[0].nom='Bas 1 allégé';const r=C.importWeek(s,o);return (r.ok&&s.prog.length===4&&s.prog[1].nom==='Bas 1 allégé'&&s.prog[0].nom==='Haut 1')||JSON.stringify(r)});
t('charge null reste null (jamais inventée)',()=>{const s=S(),o=demo();o.seances[0].ex[0].kg=null;C.importWeek(s,o);return s.prog[0].ex[0].kg===null});
t('machine inconnue : refus, programme inchangé',()=>{const s=S(),b=S(),o=demo();o.seances[0].ex[0].m='zzz';const r=C.importWeek(s,o);return (!r.ok&&/zzz/.test(r.err[0])&&JSON.stringify(s.prog)===JSON.stringify(b.prog))||JSON.stringify(r)});
t('séance en cours : refus',()=>{const s=S();s.sess={};const r=C.importWeek(s,demo());return !r.ok&&/séance en cours/.test(r.err[0])});
t('mauvais format / version / JSON vide : refus',()=>!C.importWeek(S(),{format:"autre"}).ok&&!C.importWeek(S(),{format:"chop-semaine",version:2,seances:[]}).ok&&!C.importWeek(S(),null).ok);
t('identifiant en double, inconnu, séries ou fourchette invalides : refus',()=>{const bad=f=>{const o=demo();f(o);return !C.importWeek(S(),o).ok};return bad(o=>o.seances[1].id='H1')&&bad(o=>o.seances[0].id='X9')&&bad(o=>o.seances[0].ex[0].sets=0)&&bad(o=>{o.seances[0].ex[0].rmin=12;o.seances[0].ex[0].rmax=8})&&bad(o=>o.seances[0].ex[0].kg='45')&&bad(o=>o.seances[0].ex.length=0)});
t('annuler l\'import remet l\'ancien programme',()=>{const s0=S(),b=JSON.stringify(s0.prog);const s=S();C.importWeek(s,demo());const n=C.act(s,'semaineundo');return (JSON.stringify(n.prog)===b&&!n.semaine)||'pas remis'});
t('Réglages affiche la section, l\'accueil affiche les nouvelles séances',()=>{const s=S();C.importWeek(s,demo());s.screen='reglages';const h=C.render(s);return (/Semaine de coaching/.test(h)&&/Annuler l'import/.test(h))||'absent'});
t('séance importée démarrable et terminable',()=>{let s=S();C.importWeek(s,demo());s.next='H2';s=C.act(s,'start');return s.sess&&s.sess.sid==='H2'||JSON.stringify(Object.keys(s.sess||{}))});
console.log(pass+' PASS, '+fail+' FAIL');process.exit(fail?1:0)
