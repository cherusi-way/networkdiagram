/* Network Diagram Builder — Service Worker(v90)
   方式: stale-while-revalidate(まずキャッシュから即表示、裏で取得して次回用に更新)
   HTML差し替え時はキャッシュ名を変えなくても次々回の起動で反映される */
const C = 'nd-cache-v90';
const CORE = ['./', './index.html', './manual.html', './manifest.json',
              './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(hit => {
      const upd = fetch(e.request).then(r => {
        if (r && r.ok){ const cl = r.clone(); caches.open(C).then(c => c.put(e.request, cl)); }
        return r;
      }).catch(() => hit);
      return hit || upd;
    })
  );
});
/* 「最新版を再取得」ボタンからの即時更新指示 */
self.addEventListener('message', e => {
  if (e.data === 'nd-refresh'){
    e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).catch(() => {}));
  }
});
