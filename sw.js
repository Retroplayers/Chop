const V="chop-2026-11-08-22",F=["./","index.html","chop-core.js","shell.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(K=>Promise.all(K.filter(k=>k!==V&&k!=="chop-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
 if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)){e.respondWith(caches.open("chop-fonts").then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
 if(u.origin===location.origin)e.respondWith(fetch(e.request,{cache:"no-cache"}).then(n=>{const k=n.clone();caches.open(V).then(c=>c.put(e.request,k));return n}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(L=>L.length?L[0].focus():self.clients.openWindow("./")))});
