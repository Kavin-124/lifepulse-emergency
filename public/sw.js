// LifePulse Offline Service Worker
const CACHE_NAME = 'lifepulse-v1-offline';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/profileManager.js',
  '/js/vehicleLookup.js',
  '/js/qrGenerator.js',
  '/js/sosAlert.js',
  '/js/nearbyFinder.js',
  '/manifest.json',
  '/api/firstaid'
];

// Install Event - Cache Core App Shell & Assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Offline Cache...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated.');
  event.waitUntil(
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

// Fetch Event - Serve from Cache when Offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately, then update cache in background (Stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline fallback */});

        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request).catch(() => {
        // Fallback for HTML navigation requests when completely offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
