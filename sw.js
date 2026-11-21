/* XBA AI — نظّف نصك
   يحفظ ملفات الأداة في المتصفح عشان تفتح وتشتغل حتى بدون نت.
   ما يرسل أي نص أو صورة لأي مكان. */
var CACHE = 'xba-clean-v4';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('xba-clean-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // الصفحة: نجيب الأحدث من النت، وإذا ما فيه نت نفتح النسخة المحفوظة
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('./'); });
    }));
    return;
  }
  // باقي الملفات (ملفات القراءة): من المحفوظ أول، وإذا ما فيه ننزلها ونحفظها
  e.respondWith(caches.match(req).then(function (m) {
    return m || fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});
