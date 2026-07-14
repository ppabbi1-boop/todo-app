/*
  SERVICE WORKER — sw.js
  ═══════════════════════════════════════════════════════
  A service worker is a script that runs in the background,
  separate from the web page. Its main job here is to:

  1. CACHE the app files the first time you visit
  2. SERVE them from cache when you're offline

  This is what makes the app work without internet.
  ═══════════════════════════════════════════════════════
*/

const CACHE_NAME = 'todo-app-v1';

// The files we want to cache for offline use
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];


// ── INSTALL ───────────────────────────────────────────
// Runs the first time the service worker is installed.
// Downloads and stores all the app files in a cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files for offline use');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});


// ── ACTIVATE ─────────────────────────────────────────
// Runs when the service worker takes control.
// Cleans up any old caches from previous versions.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)  // find old caches
          .map(name => caches.delete(name))      // delete them
      );
    }).then(() => self.clients.claim())
  );
});


// ── FETCH ─────────────────────────────────────────────
// Runs every time the app makes a network request.
// Strategy: try cache first, fall back to network.
// If both fail (offline + not cached), return the main page.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Found in cache — return it immediately (works offline)
        if (cachedResponse) {
          return cachedResponse;
        }
        // Not in cache — try fetching from network
        return fetch(event.request)
          .catch(() => {
            // Network failed too — return the main page as fallback
            return caches.match('./index.html');
          });
      })
  );
});
