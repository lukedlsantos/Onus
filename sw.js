const CACHE_NAME = 'dim-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './index.css',
  './app.js',
  './db.js',
  './manifest.json',
  './icon.png'
];

// Install Event - cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network first, fallback to cache (GET requests only, bypass APIs)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Bypass intercepting dynamic queries to database, Auth, or integrations
  if (
    e.request.url.includes('/rest/v1/') ||
    e.request.url.includes('/auth/v1/') ||
    e.request.url.includes('supabase.co') ||
    e.request.url.includes('api.strava.com')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone and cache the updated response
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
