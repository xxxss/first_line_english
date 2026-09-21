// 网络优先 + 离线回退：联网时永远最新，断网时用缓存。
// 导航(HTML)请求强制 no-store/reload，绕过 HTTP 缓存，避免装成 PWA 后卡在旧页面。
const V = 'fle-v30';
const ASSETS = ['./', './index.html', './scenarios.json', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  // HTML 每次都绕过 HTTP 缓存直接联网取最新；其它资源走普通网络优先
  const req = isDoc ? new Request(e.request.url, { cache: 'reload' }) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      const cp = r.clone();
      caches.open(V).then(c => c.put(e.request, cp).catch(() => {}));
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
