/* 우리의 서유럽 여행 — offline-first service worker */
const CACHE = 'sookja-europe-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // 새 버전이 깔리면 열려 있는 화면을 자동으로 새 파일로 다시 불러온다.
      // (어머니가 새로고침을 몰라도 되게)
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => Promise.all(
        clients.map((c) => c.navigate(c.url).catch(() => {}))
      ))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      });
    })
  );
});
